import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../generated/combat/combat-state-model.js';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { buildSceneRestParticipant, getSceneRestType, normalizeSceneRest } from '../generated/scene-rest/scene-rest-model.js';
import { getTrustedSceneCursorSeconds, getTrustedSceneDay, isTrustedMechanicalComment, sortSceneHistory } from './trusted-scene-history.js';

const EDIT_ROLES = new Set(['editor', 'moderator', 'admin']);

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 250000) {
  return String(value || '').trim().slice(0, maximum);
}

function recordDescriptor(participant = {}) {
  const persistence = participant.persistence || {};
  if (['character', 'creature'].includes(persistence.kind) && persistence.recordId) {
    return { kind: persistence.kind, recordId: String(persistence.recordId), persistent: true };
  }
  if (persistence.kind === 'scene-creature' && persistence.sourceCreatureId) {
    return { kind: 'creature', recordId: String(persistence.sourceCreatureId), persistent: false };
  }
  fail('failed-precondition', `${participant.name || 'Eine Figur'} besitzt keine prüfbare Profilquelle.`);
}

function mayChange(record, descriptor, request) {
  if (EDIT_ROLES.has(String(request.auth?.token?.aleriaRole || ''))) return true;
  const uid = String(request.auth?.uid || '');
  if (!descriptor.persistent && descriptor.kind === 'creature') return true;
  return String(record.ownerUid || record.createdBy || '') === uid
    || (Array.isArray(record.controllerUids) && record.controllerUids.includes(uid));
}

function hasPendingDailyRecovery(profile = {}, recoveryDayKey = '') {
  const changed = entry => {
    if (entry?.recovery !== 'day') return false;
    const previousDayKey = String(entry.recoveryDayKey || '');
    return previousDayKey !== recoveryDayKey;
  };
  return (profile.resources || []).some(changed) || (profile.abilities || []).some(changed);
}

function shouldRecoverDailyOnRest(profile = {}, recoveryDayKey = '', timelineDayChanged = false) {
  return timelineDayChanged === true || hasPendingDailyRecovery(profile, recoveryDayKey);
}

function getRequestedRestTimeline(sceneTimeEvent = {}, previousCursor = 0, minimumAdvanceSeconds = 0) {
  const anchorDay = Number(sceneTimeEvent?.anchorDay);
  const anchorSeconds = Number(sceneTimeEvent?.anchorSeconds);
  if (!Number.isInteger(anchorDay) || anchorDay < 1 || anchorDay > 1_000_000) {
    fail('invalid-argument', 'Der Endtag der Rast ist ungültig.');
  }
  if (!Number.isFinite(anchorSeconds) || anchorSeconds < 0 || anchorSeconds > 86399) {
    fail('invalid-argument', 'Die Endzeit der Rast ist ungültig.');
  }
  const endCursor = ((anchorDay - 1) * 86400) + Math.floor(anchorSeconds);
  if (endCursor < previousCursor) fail('failed-precondition', 'Eine Rast darf die Szenenzeit nicht zurückdrehen.');
  const minimumAdvance = Math.max(0, Number(minimumAdvanceSeconds) || 0);
  if (endCursor - previousCursor < minimumAdvance) {
    fail('failed-precondition', 'Der gespeicherte Zeitfortschritt ist kürzer als die angegebene Rastdauer.');
  }
  return { anchorDay, anchorSeconds: Math.floor(anchorSeconds), endCursor };
}

export const commitSceneRest = onCall({
  region: 'europe-west1',
  maxInstances: 10,
  concurrency: 20,
  enforceAppCheck: false,
  timeoutSeconds: 30
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const entryId = clean(request.data?.entryId, 240);
  const text = clean(request.data?.text);
  const metadata = JSON.parse(JSON.stringify(request.data?.metadata || {}));
  const requestedRest = normalizeSceneRest(metadata.sceneRest || {});
  if (!entryId || !text || !requestedRest.participants.length) fail('invalid-argument', 'Szene, Text und Rastteilnehmer sind erforderlich.');
  const minimumRestDuration = getSceneRestType(requestedRest.type).durationSeconds;
  if (requestedRest.durationSeconds < minimumRestDuration) {
    fail('failed-precondition', `${getSceneRestType(requestedRest.type).label} benötigt mindestens ${minimumRestDuration / 3600} Stunde(n).`);
  }

  const database = getFirestore();
  const commentRef = database.collection('comments').doc();
  const nowClient = Date.now();
  let profileUpdates = [];

  await database.runTransaction(async transaction => {
    const threadSnapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const allHistory = sortSceneHistory(threadSnapshot.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() })));
    const history = allHistory.filter(isTrustedMechanicalComment);
    const combatStates = deriveCombatStateFromComments(history);
    const previousSceneDay = getTrustedSceneDay(allHistory);
    const previousCursor = getTrustedSceneCursorSeconds(allHistory, previousSceneDay);
    const requestedTimeline = getRequestedRestTimeline(metadata.sceneTimeEvent, previousCursor, requestedRest.durationSeconds);
    const sceneDay = requestedTimeline.anchorDay;
    const recoveryDayKey = `scene:${entryId}:day-${sceneDay}`;

    const descriptors = requestedRest.participants.map(participant => ({
      participant,
      descriptor: recordDescriptor(participant)
    }));
    const unique = new Map();
    descriptors.forEach(({ descriptor }) => {
      const key = `${descriptor.kind}:${descriptor.recordId}`;
      if (!unique.has(key)) unique.set(key, {
        ...descriptor,
        key,
        ref: database.collection(descriptor.kind === 'creature' ? 'creatures' : 'characters').doc(descriptor.recordId)
      });
    });
    const targets = [...unique.values()];
    const snapshots = await Promise.all(targets.map(target => transaction.get(target.ref)));
    const records = new Map();
    targets.forEach((target, index) => {
      if (!snapshots[index].exists) fail('not-found', `Das Profil ${target.recordId} wurde nicht gefunden.`);
      records.set(target.key, snapshots[index].data() || {});
    });

    const timelineDayChanged = sceneDay > previousSceneDay;
    let anyDayChanged = timelineDayChanged;
    const participants = descriptors.map(({ participant, descriptor }) => {
      const key = `${descriptor.kind}:${descriptor.recordId}`;
      const record = records.get(key);
      if (!mayChange(record, descriptor, request)) fail('permission-denied', `Du darfst ${participant.name || 'diese Figur'} nicht erholen.`);
      const actorId = String(participant.actorId || '');
      const base = resolveCombatProfile({
        ...record,
        id: actorId,
        entityType: descriptor.kind === 'creature' ? 'creature' : 'character'
      });
      const profile = overlayCombatHitPointState(base, combatStates.get(actorId) || null);
      const participantDayChanged = shouldRecoverDailyOnRest(profile, recoveryDayKey, timelineDayChanged);
      anyDayChanged = anyDayChanged || participantDayChanged;
      return buildSceneRestParticipant(profile, requestedRest.type, {
        actorId,
        sourceId: String(participant.sourceId || ''),
        name: String(participant.name || record.name || ''),
        title: String(participant.title || record.title || ''),
        portrait: String(participant.portrait || record.portrait || ''),
        persistence: participant.persistence,
        recoveryDayKey,
        dayChanged: participantDayChanged
      });
    });
    const rest = normalizeSceneRest({
      ...requestedRest,
      recoveryDayKey,
      dayChanged: anyDayChanged,
      participants
    });

    profileUpdates = descriptors.flatMap(({ participant, descriptor }) => {
      if (!descriptor.persistent) return [];
      const committed = rest.participants.find(candidate => candidate.actorId === participant.actorId);
      const target = unique.get(`${descriptor.kind}:${descriptor.recordId}`);
      transaction.update(target.ref, {
        'combatProfile.hitPoints.current': committed.after.hitPoints.current,
        'combatProfile.hitPoints.temporary': committed.after.hitPoints.temporary,
        'combatProfile.resources': committed.after.resources,
        'combatProfile.abilities': committed.after.abilities,
        updatedAt: new Date(nowClient).toISOString()
      });
      return [{
        kind: descriptor.kind,
        recordId: descriptor.recordId,
        hitPoints: committed.after.hitPoints,
        resources: committed.after.resources,
        abilities: committed.after.abilities
      }];
    });

    transaction.create(commentRef, {
      entryId,
      charName: 'Erzähler',
      charTitle: '',
      portrait: null,
      text,
      deleteCodeHash: clean(request.data?.deleteCodeHash, 128),
      deleteCodeVersion: 1,
      narrator: true,
      characterId: '',
      avatarKind: 'narrator',
      commentMode: 'scene-rest',
      commentKind: 'scene-rest-event',
      commentSegments: null,
      sceneRest: rest,
      sceneTimeEvent: {
        ...(metadata.sceneTimeEvent || {}),
        anchorDay: sceneDay,
        anchorSeconds: requestedTimeline.anchorSeconds
      },
      restTransaction: {
        schemaVersion: 2,
        transactionId: commentRef.id,
        atomicProfileUpdates: profileUpdates.length,
        validatedBy: 'commitSceneRest'
      },
      serverValidatedMechanics: true,
      createdBy: request.auth.uid,
      createdByRole: String(request.auth.token?.aleriaRole || 'player'),
      orderKey: Number.isFinite(Number(metadata.orderKey)) ? Number(metadata.orderKey) : nowClient,
      createdAtClient: nowClient,
      activityAtClient: nowClient,
      activityAt: FieldValue.serverTimestamp(),
      schemaVersion: 3,
      ts: FieldValue.serverTimestamp()
    });
  });
  return { id: commentRef.id, profileUpdates };
});

export const sceneRestCommitInternals = Object.freeze({
  getRequestedRestTimeline,
  hasPendingDailyRecovery,
  shouldRecoverDailyOnRest
});
