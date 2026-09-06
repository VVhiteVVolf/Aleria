import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../generated/combat/combat-state-model.js';
import { getActiveCombatEncounter } from '../generated/combat/combat-encounter-model.js';
import { buildSceneRestParticipant } from '../generated/scene-rest/scene-rest-model.js';
import { createManualCombatCondition, buildCombatStatusChange, formatStatusDuration } from '../generated/combat-status/combat-status-model.js';
import { isTrustedSceneContributionComment, sortSceneHistory } from './trusted-scene-history.js';
import { nextMechanicalCommentOrderKey } from './mechanical-comment-order.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';

const clean = (value, maximum = 180) => String(value || '').trim().slice(0, maximum);
const fail = (code, message) => { throw new HttpsError(code, message); };

function assertActorSource(history, actorId, recordId, kind) {
  if (actorId === recordId) return;
  if (kind !== 'creature') fail('invalid-argument', 'Figurenkennung und Profilquelle stimmen nicht überein.');
  const known = history.some(comment => (comment.combatEncounter?.participants || []).some(participant =>
    participant.actorId === actorId && participant.persistence?.kind === 'scene-creature' && participant.persistence.sourceCreatureId === recordId)
    || [comment, ...(comment.commentSegments || [])].some(segment =>
      segment.sceneActorId === actorId && (segment.sceneActorSourceId || segment.creatureId) === recordId));
  if (!known) fail('failed-precondition', 'Diese Kreatureninstanz ist in der Szene noch nicht bekannt.');
}

export const commitCombatStatus = onCall({ region: 'europe-west1', maxInstances: 10, concurrency: 20, enforceAppCheck: false, timeoutSeconds: 30 }, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const data = request.data || {};
  const entryId = clean(data.entryId, 240);
  const actorId = clean(data.actorId);
  const recordId = clean(data.recordId);
  const kind = data.kind;
  const operation = data.operation;
  if (!entryId || !actorId || !recordId || /\//.test(recordId) || !['character', 'creature'].includes(kind)
    || !['add', 'remove', 'reset'].includes(operation) || typeof data.expectedLastCommentId !== 'string') {
    fail('invalid-argument', 'Szene, Figur, Profilquelle und aktueller Szenenstand sind erforderlich.');
  }
  const database = getFirestore();
  const commentRef = database.collection('comments').doc();
  const recordRef = database.collection(kind === 'creature' ? 'creatures' : 'characters').doc(recordId);
  const persistent = actorId === recordId;
  let result;
  await database.runTransaction(async transaction => {
    const threadSnapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const allHistory = sortSceneHistory(threadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    if ((allHistory.at(-1)?.id || '') !== data.expectedLastCommentId) fail('failed-precondition', 'Die Szene hat sich verändert. Aktualisiere den Stand und prüfe die Änderung erneut.');
    const history = allHistory.filter(isTrustedSceneContributionComment);
    assertActorSource(history, actorId, recordId, kind);
    const encounter = getActiveCombatEncounter(history);
    const snapshot = await transaction.get(recordRef);
    if (!snapshot.exists) fail('not-found', 'Das Figurenprofil wurde nicht gefunden.');
    const record = snapshot.data() || {};
    const lock = persistent ? await transaction.get(database.collection('combat_profile_locks')
      .doc(kind === 'creature' ? 'creatures' : 'characters').collection('records').doc(recordId)) : null;
    const activeKeys = lock?.data()?.activeEncounterKeys || [];
    if (operation === 'reset' && (encounter || activeKeys.length)) {
      fail('failed-precondition', 'Zurücksetzen ist erst möglich, wenn keine Kampfphase läuft oder angekündigt ist.');
    }
    if (activeKeys.some(key => key !== `${entryId}:${encounter?.encounterId || ''}`)) {
      fail('failed-precondition', 'Die Figur ist in einer anderen Szene im Kampf. Verwalte ihre Zustände dort.');
    }
    const state = deriveCombatStateFromComments(history).get(actorId) || {};
    const profile = overlayCombatHitPointState(resolveCombatProfile({ ...record, id: actorId, entityType: kind }), state);
    let condition;
    let after;
    try {
      condition = operation === 'add' ? createManualCombatCondition(data.condition, { id: `manual:${commentRef.id}`, encounterId: encounter?.encounterId || '' }) : null;
      after = buildCombatStatusChange({ operation, profile, state, condition, conditionId: clean(data.conditionId),
        resetState: operation === 'reset' ? buildSceneRestParticipant(profile, 'long', { actorId, dayChanged: true }).after : null });
    } catch (error) { fail('invalid-argument', error.message); }
    const removed = profile.temporaryConditions?.find(item => item.id === data.conditionId);
    const text = operation === 'reset' ? `${record.name || 'Figur'}: Trefferpunkte und Ressourcen aufgefüllt; temporäre Effekte entfernt.`
      : `${record.name || 'Figur'}: ${condition?.name || removed?.name || 'Zustand'} ${operation === 'add' ? `hinzugefügt (${formatStatusDuration(condition)})` : 'entfernt'}.`;
    const combatStatus = { schemaVersion: 1, actorId, name: record.name || 'Figur', operation, after,
      persistence: { kind: persistent ? kind : 'scene-creature', recordId, ...(persistent ? {} : { sourceCreatureId: recordId }) } };
    const profileUpdates = [];
    let mechanicalUndo = null;
    if (operation === 'reset' && persistent) {
      const hitPoints = { ...(record.combatProfile?.hitPoints || {}), current: after.current, temporary: 0 };
      transaction.update(recordRef, withProtectedRecordRevisions(record, {
        'combatProfile.hitPoints': hitPoints, 'combatProfile.resources': after.resources,
        'combatProfile.abilities': after.abilities, 'combatProfile.lastMechanicalCommentId': commentRef.id,
        updatedAt: FieldValue.serverTimestamp()
      }, ['combatProfile']));
      mechanicalUndo = { [`${kind}:${recordId}`]: { kind, recordId,
        before: { hitPoints: record.combatProfile?.hitPoints || {}, resources: record.combatProfile?.resources || [], abilities: record.combatProfile?.abilities || [] },
        previousMechanicalCommentId: record.combatProfile?.lastMechanicalCommentId || null } };
      profileUpdates.push({ kind, recordId, hitPoints, resources: after.resources, abilities: after.abilities });
    }
    const now = Date.now();
    transaction.create(commentRef, {
      entryId, text, charName: 'Erzähler', narrator: true, characterId: actorId,
      commentKind: 'combat-status-event', commentMode: 'combat-status', combatStatus,
      serverValidatedMechanics: true, mechanicalAudit: true, mechanicalUndo,
      createdBy: request.auth.uid, createdByRole: clean(request.auth.token?.aleriaRole || 'player'),
      orderKey: nextMechanicalCommentOrderKey(allHistory, null, now), createdAtClient: now,
      activityAtClient: now, activityAt: FieldValue.serverTimestamp(), ts: FieldValue.serverTimestamp(), schemaVersion: 3
    });
    result = { id: commentRef.id, combatStatus, profileUpdates };
  });
  return result;
});
