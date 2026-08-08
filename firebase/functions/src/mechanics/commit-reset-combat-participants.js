import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { resolveCombatProfile } from '../generated/combat/combat-profile-resolver.js';
import { buildSceneRestParticipant } from '../generated/scene-rest/scene-rest-model.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';

const RECORD_KINDS = new Set(['character', 'creature']);

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function normalizeDescriptor(value = {}) {
  const kind = RECORD_KINDS.has(value?.kind) ? value.kind : '';
  const recordId = clean(value?.recordId, 240);
  if (!kind || !recordId) return null;
  return { kind, recordId };
}

export const commitResetCombatParticipants = onCall({
  region: 'europe-west1',
  maxInstances: 10,
  concurrency: 20,
  enforceAppCheck: false,
  timeoutSeconds: 30
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const descriptors = [...new Map(
    (Array.isArray(request.data?.participants) ? request.data.participants : [])
      .map(normalizeDescriptor)
      .filter(Boolean)
      .map(descriptor => [`${descriptor.kind}:${descriptor.recordId}`, descriptor])
  ).values()].slice(0, 100);
  if (!descriptors.length) fail('invalid-argument', 'Mindestens ein Kampfteilnehmer ist erforderlich.');

  const database = getFirestore();
  const reset = [];

  await database.runTransaction(async transaction => {
    const refs = descriptors.map(descriptor => database
      .collection(descriptor.kind === 'creature' ? 'creatures' : 'characters')
      .doc(descriptor.recordId));
    const snapshots = await Promise.all(refs.map(ref => transaction.get(ref)));

    descriptors.forEach((descriptor, index) => {
      const snapshot = snapshots[index];
      if (!snapshot.exists) return;
      const record = snapshot.data() || {};
      const profile = resolveCombatProfile({ ...record, id: descriptor.recordId, entityType: descriptor.kind });
      const participant = buildSceneRestParticipant(profile, 'long', {
        actorId: descriptor.recordId,
        dayChanged: true,
        recoveryDayKey: 'cheat-reset'
      });
      transaction.update(refs[index], withProtectedRecordRevisions(record, {
        'combatProfile.hitPoints': {
          ...(record.combatProfile?.hitPoints || {}),
          current: participant.after.hitPoints.current,
          temporary: participant.after.hitPoints.temporary
        },
        'combatProfile.resources': participant.after.resources,
        'combatProfile.abilities': participant.after.abilities,
        'combatProfile.lastMechanicalCommentId': FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp()
      }, ['combatProfile']));
      transaction.set(
        database.collection('combat_profile_locks')
          .doc(descriptor.kind === 'creature' ? 'creatures' : 'characters')
          .collection('records')
          .doc(descriptor.recordId),
        { activeEncounterKeys: [], updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
      reset.push({ kind: descriptor.kind, recordId: descriptor.recordId, name: record.name || '' });
    });
  });

  return { reset };
});
