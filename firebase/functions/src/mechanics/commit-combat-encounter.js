import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  buildEncounterExperienceAwards,
  deriveCombatEncounterState,
  normalizeCombatEncounterEvent
} from '../generated/combat/combat-encounter-model.js';
import {
  applyExperienceAward,
  getDefeatExperienceReward,
  getOrdinaryLevelForExperience
} from '../generated/combat/combat-progression.js';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { isTrustedMechanicalComment, sortSceneHistory } from './trusted-scene-history.js';

const RECORD_KINDS = new Set(['character', 'creature']);

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 250000) {
  return String(value || '').trim().slice(0, maximum);
}

function persistenceDescriptor(participant = {}) {
  const persistence = participant.persistence || {};
  if (RECORD_KINDS.has(persistence.kind) && persistence.recordId) {
    return { kind: persistence.kind, recordId: clean(persistence.recordId, 240), persistent: true };
  }
  if (persistence.kind === 'scene-creature' && persistence.sourceCreatureId) {
    return { kind: 'creature', recordId: clean(persistence.sourceCreatureId, 240), persistent: false };
  }
  fail('failed-precondition', `${participant.name || 'Eine Figur'} besitzt keine prüfbare Profilquelle.`);
}

function recordKey(descriptor = {}) {
  return `${descriptor.kind}:${descriptor.recordId}`;
}

function combatProfileLockRef(database, descriptor = {}) {
  const collectionId = descriptor.kind === 'creature' ? 'creatures' : 'characters';
  return database.collection('combat_profile_locks').doc(collectionId).collection('records').doc(descriptor.recordId);
}

function updateCombatProfileLocks(transaction, database, descriptors = [], encounterKey = '', active = true) {
  const unique = new Map((Array.isArray(descriptors) ? descriptors : [])
    .map(descriptor => [recordKey(descriptor), descriptor]));
  unique.forEach(descriptor => {
    transaction.set(combatProfileLockRef(database, descriptor), {
      activeEncounterKeys: active
        ? FieldValue.arrayUnion(encounterKey)
        : FieldValue.arrayRemove(encounterKey),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  });
}

function getDescriptorsNoLongerActive(participants = [], candidates = []) {
  const activeRecordKeys = new Set((Array.isArray(participants) ? participants : [])
    .filter(participant => participant.status === 'active')
    .map(participant => recordKey(persistenceDescriptor(participant))));
  return [...new Map((Array.isArray(candidates) ? candidates : [])
    .map(persistenceDescriptor)
    .filter(descriptor => !activeRecordKeys.has(recordKey(descriptor)))
    .map(descriptor => [recordKey(descriptor), descriptor])).values()];
}

function getCurrentEncounter(history = [], encounterId = '') {
  return deriveCombatEncounterState(history).get(String(encounterId || '')) || null;
}

function splitEncounterKey(key = '') {
  const raw = String(key || '');
  const separatorIndex = raw.indexOf(':');
  if (separatorIndex < 0) return { entryId: raw, encounterId: '' };
  return { entryId: raw.slice(0, separatorIndex), encounterId: raw.slice(separatorIndex + 1) };
}

async function findConflictingEncounter(transaction, database, descriptor, currentEncounterKey) {
  const lockSnapshot = await transaction.get(combatProfileLockRef(database, descriptor));
  if (!lockSnapshot.exists) return null;
  const keys = Array.isArray(lockSnapshot.data()?.activeEncounterKeys) ? lockSnapshot.data().activeEncounterKeys : [];
  const conflictingKey = keys.find(key => key !== currentEncounterKey);
  if (!conflictingKey) return null;
  const { entryId: conflictEntryId, encounterId: conflictEncounterId } = splitEncounterKey(conflictingKey);
  if (!conflictEntryId || !conflictEncounterId) return { title: '' };
  const conflictSnapshot = await transaction.get(database.collection('comments').where('entryId', '==', conflictEntryId));
  const conflictHistory = sortSceneHistory(conflictSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    .filter(isTrustedMechanicalComment);
  const conflictEncounter = getCurrentEncounter(conflictHistory, conflictEncounterId);
  return { title: conflictEncounter?.active ? conflictEncounter.title : '' };
}

async function assertNoConflictingEncounter(transaction, database, participants, currentEncounterKey) {
  const unique = [...new Map((Array.isArray(participants) ? participants : []).map(participant => {
    const descriptor = persistenceDescriptor(participant);
    return [recordKey(descriptor), { descriptor, participant }];
  })).values()];
  for (const { descriptor, participant } of unique) {
    // Nicht-persistente Eintraege (z.B. "scene-creature") sind geteilte Kreaturvorlagen: mehrere
    // gleichzeitige Instanzen (mehrere Draig Waffenknecht in einem Kampf, oder dieselbe Vorlage in
    // zwei verschiedenen Szenen) sind normal und sollen sich nicht gegenseitig blockieren, weil ihr
    // Kampfzustand ohnehin nie auf die geteilte Vorlage zurückgeschrieben wird.
    if (!descriptor.persistent) continue;
    const conflict = await findConflictingEncounter(transaction, database, descriptor, currentEncounterKey);
    if (!conflict) continue;
    const name = participant.name || 'Diese Figur';
    const titlePart = conflict.title ? `am Kampf "${conflict.title}"` : 'an einem anderen aktiven Kampf';
    fail(
      'failed-precondition',
      `${name} nimmt bereits ${titlePart} in einer anderen Szene teil. Entferne sie dort zuerst oder beende diesen Kampf, bevor du sie hier einträgst.`
    );
  }
}

function validateOperation(event, current) {
  if (event.operation === 'start') {
    if (current?.active) fail('already-exists', 'Dieser Kampf läuft bereits.');
    if (!event.participants.length) fail('invalid-argument', 'Zum Kampfbeginn wird mindestens eine Figur benötigt.');
    return;
  }
  if (!current?.active) fail('failed-precondition', 'Dieser Kampf ist nicht aktiv.');
  if (event.operation === 'add' && !event.participants.length) fail('invalid-argument', 'Wähle mindestens einen neuen Kämpfer.');
  if (event.operation === 'remove' && !event.participants.length) fail('invalid-argument', 'Wähle mindestens einen ausscheidenden Kämpfer.');
  if (event.operation === 'end' && !event.winningPartyId) fail('invalid-argument', 'Zum Kampfende muss die siegreiche Partei feststehen.');
}

export const commitCombatEncounter = onCall({
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
  const requested = normalizeCombatEncounterEvent(metadata.combatEncounter || {});
  if (!entryId || !text || !requested.encounterId) fail('invalid-argument', 'Szene, Text und Kampfkennung sind erforderlich.');

  const database = getFirestore();
  const commentRef = database.collection('comments').doc();
  const now = Date.now();
  let profileUpdates = [];
  let committedEvent = requested;

  await database.runTransaction(async transaction => {
    const threadSnapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const history = sortSceneHistory(threadSnapshot.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() })))
      .filter(isTrustedMechanicalComment);
    const current = getCurrentEncounter(history, requested.encounterId);
    validateOperation(requested, current);

    const currentParticipants = current?.participants instanceof Map ? [...current.participants.values()] : [];
    const mergedParticipants = new Map(currentParticipants.map(participant => [participant.actorId, participant]));
    requested.participants.forEach(participant => {
      const previous = mergedParticipants.get(participant.actorId) || {};
      mergedParticipants.set(participant.actorId, {
        ...previous,
        ...participant,
        status: requested.operation === 'remove' && participant.status === 'active' ? 'left' : participant.status
      });
    });
    const participantsToLoad = requested.operation === 'start' || requested.operation === 'add'
      ? requested.participants
      : [...mergedParticipants.values()];
    const descriptors = participantsToLoad.map(participant => ({ participant, descriptor: persistenceDescriptor(participant) }));
    const recordsToLoad = [...new Map(descriptors.map(({ descriptor }) => {
      const key = recordKey(descriptor);
      return [key, {
        ...descriptor,
        key,
        ref: database.collection(descriptor.kind === 'creature' ? 'creatures' : 'characters').doc(descriptor.recordId)
      }];
    })).values()];
    const recordSnapshots = await Promise.all(recordsToLoad.map(entry => transaction.get(entry.ref)));
    const records = new Map();
    recordsToLoad.forEach((entry, index) => {
      if (!recordSnapshots[index].exists) fail('not-found', `Das Profil ${entry.recordId} wurde nicht gefunden.`);
      records.set(entry.key, recordSnapshots[index].data() || {});
    });

    if (requested.operation === 'start' || requested.operation === 'add') {
      requested.participants = requested.participants.map(participant => {
        const descriptor = persistenceDescriptor(participant);
        const record = records.get(recordKey(descriptor));
        const profile = resolveCombatProfile({
          ...record,
          id: participant.actorId,
          entityType: descriptor.kind === 'creature' ? 'creature' : 'character'
        });
        return {
          ...participant,
          experienceValue: getDefeatExperienceReward(profile.progression?.level, profile.progression?.experienceReward)
        };
      });
    }

    const encounterKey = `${entryId}:${requested.encounterId}`;
    let lockDescriptors = [];
    let locksActivated = true;
    if (requested.operation === 'start' || requested.operation === 'add') {
      await assertNoConflictingEncounter(transaction, database, requested.participants, encounterKey);
      lockDescriptors = requested.participants.map(persistenceDescriptor);
      locksActivated = true;
      updateCombatProfileLocks(transaction, database, lockDescriptors, encounterKey, true);
    } else if (requested.operation === 'remove') {
      lockDescriptors = getDescriptorsNoLongerActive([...mergedParticipants.values()], requested.participants);
      locksActivated = false;
      updateCombatProfileLocks(transaction, database, lockDescriptors, encounterKey, false);
    } else if (requested.operation === 'end') {
      lockDescriptors = [...mergedParticipants.values()].map(persistenceDescriptor);
      locksActivated = false;
      updateCombatProfileLocks(transaction, database, lockDescriptors, encounterKey, false);
    }

    let experience = { total: 0, awards: [] };
    const mechanicalUndo = {};
    if (requested.operation === 'end') {
      const endingParticipants = new Map([...mergedParticipants.entries()]);
      requested.participants.forEach(participant => endingParticipants.set(participant.actorId, participant));
      const awardPlan = requested.awardExperience
        ? buildEncounterExperienceAwards({ participants: endingParticipants }, requested.winningPartyId)
        : { totalExperience: 0, awards: [] };
      const awards = [];
      for (const award of awardPlan.awards) {
        const participant = endingParticipants.get(award.actorId);
        if (!participant) continue;
        const descriptor = persistenceDescriptor(participant);
        if (!descriptor.persistent || descriptor.kind !== 'character') continue;
        const record = records.get(recordKey(descriptor));
        const progression = record.combatProfile?.progression || {};
        const change = applyExperienceAward(progression, award.experience);
        const target = recordsToLoad.find(entry => entry.key === recordKey(descriptor));
        transaction.update(target.ref, {
          'combatProfile.progression': change.after,
          'combatProfile.lastMechanicalCommentId': commentRef.id,
          updatedAt: new Date(now).toISOString()
        });
        mechanicalUndo[recordKey(descriptor)] = {
          kind: descriptor.kind,
          recordId: descriptor.recordId,
          before: { progression },
          previousMechanicalCommentId: record.combatProfile?.lastMechanicalCommentId || null
        };
        const availableLevel = getOrdinaryLevelForExperience(change.after.experience);
        const committedAward = {
          ...award,
          beforeExperience: change.before.experience,
          afterExperience: change.after.experience,
          levelUpAvailable: availableLevel > change.before.level,
          availableLevel
        };
        awards.push(committedAward);
        profileUpdates.push({
          kind: descriptor.kind,
          recordId: descriptor.recordId,
          progression: change.after,
          levelUpAvailable: committedAward.levelUpAvailable,
          availableLevel
        });
      }
      experience = { total: awardPlan.totalExperience, awards };
    }

    committedEvent = normalizeCombatEncounterEvent({ ...requested, experience });
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
      commentMode: 'combat-encounter',
      commentKind: 'combat-encounter-event',
      commentSegments: null,
      combatEncounter: committedEvent,
      encounterTransaction: {
        schemaVersion: 1,
        transactionId: commentRef.id,
        atomicProfileUpdates: profileUpdates.length,
        validatedBy: 'commitCombatEncounter'
      },
      mechanicalUndo: Object.keys(mechanicalUndo).length ? mechanicalUndo : null,
      encounterLockUndo: lockDescriptors.length ? { encounterKey, locksActivated, descriptors: lockDescriptors } : null,
      serverValidatedMechanics: true,
      mechanicalAudit: true,
      createdBy: request.auth.uid,
      createdByRole: String(request.auth.token?.aleriaRole || 'player'),
      orderKey: Number.isFinite(Number(metadata.orderKey)) ? Number(metadata.orderKey) : now,
      createdAtClient: now,
      activityAtClient: now,
      activityAt: FieldValue.serverTimestamp(),
      schemaVersion: 3,
      ts: FieldValue.serverTimestamp()
    });
  });

  return { id: commentRef.id, combatEncounter: committedEvent, profileUpdates };
});

export const combatEncounterCommitInternals = Object.freeze({
  persistenceDescriptor,
  recordKey,
  getCurrentEncounter,
  validateOperation,
  combatProfileLockRef,
  updateCombatProfileLocks,
  getDescriptorsNoLongerActive,
  splitEncounterKey,
  findConflictingEncounter,
  assertNoConflictingEncounter
});
