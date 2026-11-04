import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../generated/combat/combat-state-model.js';
import { buildSceneRegenerationState } from '../generated/scene-regeneration/scene-regeneration-model.js';
import { readItemDefinitionIndex, hydrateItemRecord } from '../items/item-definition-repository.js';
import { isTrustedSceneContributionComment, sortSceneHistory } from './trusted-scene-history.js';
import { nextMechanicalCommentOrderKey } from './mechanical-comment-order.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';

const MAX_PARTICIPANTS = 100;
const clean = (value, maximum = 240) => typeof value === 'string' ? value.trim().slice(0, maximum) : '';
const fail = (code, message) => { throw new HttpsError(code, message); };

function normalizeParticipants(value) {
  if (!Array.isArray(value) || !value.length || value.length > MAX_PARTICIPANTS) {
    fail('invalid-argument', `Wähle zwischen einer und ${MAX_PARTICIPANTS} Figuren für die Regeneration.`);
  }
  const selected = new Map();
  for (const participant of value) {
    const actorId = clean(participant?.actorId);
    const recordId = clean(participant?.recordId);
    const kind = participant?.kind;
    if (!actorId || !recordId || /\//.test(actorId + recordId) || !['character', 'creature'].includes(kind)) {
      fail('invalid-argument', 'Jede ausgewählte Figur benötigt eine gültige Kennung und Profilquelle.');
    }
    const previous = selected.get(actorId);
    if (previous && (previous.recordId !== recordId || previous.kind !== kind)) {
      fail('invalid-argument', 'Eine Figurenkennung darf nicht mehrere Profilquellen bezeichnen.');
    }
    selected.set(actorId, { actorId, recordId, kind, persistent: actorId === recordId });
  }
  return [...selected.values()];
}

function assertActorSource(history, participant) {
  const { actorId, recordId, kind, persistent } = participant;
  if (persistent) return;
  if (kind !== 'creature') fail('invalid-argument', 'Figurenkennung und Profilquelle stimmen nicht überein.');
  const known = history.some(comment => (
    (comment.combatEncounter?.participants || []).some(candidate => (
      candidate.actorId === actorId
      && candidate.persistence?.kind === 'scene-creature'
      && candidate.persistence.sourceCreatureId === recordId
    ))
    || [comment, ...(comment.commentSegments || [])].some(segment => (
      segment.sceneActorId === actorId
      && (segment.sceneActorSourceId || segment.creatureId) === recordId
    ))
  ));
  if (!known) fail('failed-precondition', 'Diese Kreatureninstanz ist in der Szene noch nicht bekannt.');
}

export async function commitSceneRegenerationOperation(request, { database = getFirestore(), nowClient = Date.now() } = {}) {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const data = request.data || {};
  const entryId = clean(data.entryId);
  if (!entryId || typeof data.expectedLastCommentId !== 'string') {
    fail('invalid-argument', 'Die aktuelle Szene und ihr letzter gespeicherter Stand sind erforderlich.');
  }
  const participants = normalizeParticipants(data.participants);
  const receiptRef = database.collection('comments').doc();
  let result;

  await database.runTransaction(async transaction => {
    const thread = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const allHistory = sortSceneHistory(thread.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() })));
    if ((allHistory.at(-1)?.id || '') !== data.expectedLastCommentId) {
      fail('failed-precondition', 'Die Szene hat sich verändert. Öffne die Regeneration erneut.');
    }
    const history = allHistory.filter(isTrustedSceneContributionComment);
    participants.forEach(participant => assertActorSource(history, participant));
    const combatStates = deriveCombatStateFromComments(history);
    const targets = new Map(participants.map(participant => {
      const collection = participant.kind === 'creature' ? 'creatures' : 'characters';
      const key = `${participant.kind}:${participant.recordId}`;
      return [key, { ...participant, key, collection, ref: database.collection(collection).doc(participant.recordId) }];
    }));
    const targetList = [...targets.values()];
    const snapshots = await Promise.all(targetList.map(target => transaction.get(target.ref)));
    const locks = await Promise.all(participants.filter(participant => participant.persistent).map(participant => (
      transaction.get(database.doc(`combat_profile_locks/${participant.kind === 'creature' ? 'creatures' : 'characters'}/records/${participant.recordId}`))
    )));
    if (locks.some(snapshot => (snapshot.data()?.activeEncounterKeys || []).some(key => !String(key).startsWith(`${entryId}:`)))) {
      fail('failed-precondition', 'Eine ausgewählte Figur ist in einer anderen Szene im Kampf. Regeneriere sie dort.');
    }
    const records = new Map(targetList.map((target, index) => {
      if (!snapshots[index].exists) fail('not-found', 'Ein ausgewähltes Figurenprofil wurde nicht gefunden.');
      return [target.key, { ...(snapshots[index].data() || {}), id: target.recordId, _itemHolderKind: target.collection }];
    }));
    const definitions = await readItemDefinitionIndex(database, transaction, [...records.values()]);
    for (const [key, record] of records) records.set(key, hydrateItemRecord(record, definitions, { preserveLoadout: true }));

    const regenerated = participants.map(participant => {
      const { actorId, recordId, kind, persistent } = participant;
      const record = records.get(`${kind}:${recordId}`);
      const base = resolveCombatProfile({ ...record, id: actorId, entityType: kind });
      const profile = {
        ...overlayCombatHitPointState(base, combatStates.get(actorId) || null),
        // Recovery uses today's sheet limits, not maxima embedded in old receipts.
        maximumHitPoints: base.maximumHitPoints,
        resources: base.resources,
        abilities: base.abilities
      };
      return {
        actorId,
        name: clean(record.name, 180),
        persistence: persistent ? { kind, recordId } : { kind: 'scene-creature', sourceCreatureId: recordId },
        after: buildSceneRegenerationState(profile)
      };
    });
    const profileUpdates = participants.flatMap((participant, index) => {
      if (!participant.persistent) return [];
      const key = `${participant.kind}:${participant.recordId}`;
      const target = targets.get(key);
      const record = records.get(key);
      const after = regenerated[index].after;
      const hitPoints = { ...(record.combatProfile?.hitPoints || {}), current: after.current, temporary: 0 };
      transaction.update(target.ref, withProtectedRecordRevisions(record, {
        'combatProfile.hitPoints': hitPoints,
        'combatProfile.resources': after.resources,
        'combatProfile.abilities': after.abilities,
        'combatProfile.lastMechanicalCommentId': receiptRef.id,
        updatedAt: new Date(nowClient).toISOString()
      }, ['combatProfile'], nowClient));
      return [{ kind: participant.kind, recordId: participant.recordId, hitPoints, resources: after.resources, abilities: after.abilities }];
    });
    const sceneRegeneration = { schemaVersion: 1, participants: regenerated };
    // This ordered receipt is a replay boundary, not scene activity. No text,
    // activity timestamp or undo data is emitted for presentation/notifications.
    transaction.create(receiptRef, {
      entryId,
      narrator: true,
      characterId: '',
      commentKind: 'scene-regeneration-event',
      commentMode: 'scene-regeneration',
      sceneRegeneration,
      serverValidatedMechanics: true,
      mechanicalAudit: true,
      createdBy: request.auth.uid,
      createdByRole: clean(request.auth.token?.aleriaRole || 'player', 80),
      orderKey: nextMechanicalCommentOrderKey(allHistory, null, nowClient),
      createdAtClient: nowClient,
      ts: FieldValue.serverTimestamp(),
      schemaVersion: 3
    });
    result = { id: receiptRef.id, sceneRegeneration, profileUpdates };
  });
  return result;
}

export const commitSceneRegeneration = onCall({
  region: 'europe-west1', maxInstances: 10, concurrency: 20, enforceAppCheck: false, timeoutSeconds: 30
}, request => commitSceneRegenerationOperation(request));
