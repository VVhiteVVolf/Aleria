import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { restoreCharacterHitPointSnapshot } from '../generated/combat/combat-profile-model.js';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { deriveCombatEncounterState } from '../generated/combat/combat-encounter-model.js';
import { isTrustedSceneContributionComment, sortSceneHistory } from './trusted-scene-history.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';
import { findLaterMechanicalDependency } from './mechanical-comment-dependencies.js';

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function describeComment(comment = {}) {
  const who = clean(comment.charName) || 'Ein Beitrag';
  const kind = comment.commentKind === 'combat-encounter-event'
    ? 'Kampfankündigung'
    : (comment.commentKind === 'scene-rest-event' ? 'Rast' : 'Kampfhandlung');
  const snippet = clean(comment.text, 80);
  return `${kind} von ${who}${snippet ? ` ("${snippet}${comment.text?.length > 80 ? '…' : ''}")` : ''}`;
}

function recordRef(database, kind, recordId) {
  return database.collection(kind === 'creature' ? 'creatures' : 'characters').doc(recordId);
}

async function verifyAndRevertMechanicalUndo(transaction, database, mechanicalUndo, commentId, options = {}) {
  const entries = Object.entries(mechanicalUndo || {});
  if (!entries.length) return;
  const refs = entries.map(([, entry]) => recordRef(database, entry.kind, entry.recordId));
  const snapshots = await Promise.all(refs.map(ref => transaction.get(ref)));
  const blockingDescriptions = [];
  const skipRevert = new Set();

  for (let index = 0; index < entries.length; index += 1) {
    const [, entry] = entries[index];
    const snapshot = snapshots[index];
    if (!snapshot.exists) continue;
    const current = snapshot.data() || {};
    const currentMarker = current.combatProfile?.lastMechanicalCommentId || null;
    if (currentMarker !== commentId) {
      const blockingSnapshot = currentMarker
        ? await transaction.get(database.collection('comments').doc(currentMarker))
        : null;
      const blockingDescription = blockingSnapshot?.exists
        ? describeComment(blockingSnapshot.data())
        : `eine neuere Handlung von ${current.name || 'dieser Figur'}`;
      if (!options.force) {
        fail(
          'failed-precondition',
          `Das kann nicht gelöscht werden, weil danach schon etwas Neueres passiert ist: ${blockingDescription}. Lösche zuerst diesen neueren Beitrag.`
        );
      }
      blockingDescriptions.push(blockingDescription);
      skipRevert.add(index);
    }
  }

  entries.forEach(([, entry], index) => {
    if (!snapshots[index].exists || skipRevert.has(index)) return;
    const ref = refs[index];
    const values = { updatedAt: FieldValue.serverTimestamp() };
    if (entry.before?.hitPoints !== undefined) values['combatProfile.hitPoints'] = entry.kind === 'character'
      ? restoreCharacterHitPointSnapshot(snapshots[index].data()?.combatProfile || {}, entry.before.hitPoints, entry.before.progression)
      : entry.before.hitPoints;
    if (entry.before?.resources !== undefined) values['combatProfile.resources'] = entry.before.resources;
    if (entry.before?.abilities !== undefined) values['combatProfile.abilities'] = entry.before.abilities;
    if (entry.before?.progression !== undefined) values['combatProfile.progression'] = entry.before.progression;
    if (entry.before?.inventory !== undefined) values.inventory = entry.before.inventory;
    values['combatProfile.lastMechanicalCommentId'] = entry.previousMechanicalCommentId || FieldValue.delete();
    const changedSections = ['combatProfile'];
    if (entry.before?.inventory !== undefined) changedSections.push('inventory');
    transaction.update(ref, withProtectedRecordRevisions(
      snapshots[index].data() || {},
      values,
      changedSections
    ));
  });

  return blockingDescriptions;
}

function hasUnsupportedMechanics(comment = {}) {
  // Inventory changes are already captured in mechanicalUndo alongside hitPoints/resources/abilities,
  // so a combat+inventory-use comment is safe to revert. Skill checks are not: they claim a separate
  // skill_challenge_claims/herausforderung_claims document that this function does not yet unwind.
  const segments = Array.isArray(comment.commentSegments) ? comment.commentSegments : [];
  return segments.some(segment => segment?.skillResolution || segment?.skillChallenge);
}

export const commitUndoMechanicalComment = onCall({
  region: 'europe-west1',
  maxInstances: 10,
  concurrency: 20,
  enforceAppCheck: false,
  timeoutSeconds: 30
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const entryId = clean(request.data?.entryId, 240);
  const commentId = clean(request.data?.commentId, 240);
  const force = request.data?.force === true;
  if (!entryId || !commentId) fail('invalid-argument', 'Szene und Beitrag sind erforderlich.');

  const database = getFirestore();
  const commentRef = database.collection('comments').doc(commentId);
  let skippedReversal = [];

  await database.runTransaction(async transaction => {
    const snapshot = await transaction.get(commentRef);
    if (!snapshot.exists) fail('not-found', 'Dieser Beitrag existiert nicht mehr.');
    const comment = snapshot.data() || {};
    if (clean(comment.entryId, 240) !== entryId) fail('failed-precondition', 'Der Beitrag gehört nicht zu dieser Szene.');
    if (!comment.serverValidatedMechanics && !comment.mechanicalAudit) {
      fail('failed-precondition', 'Dieser Beitrag ist kein serverseitig geprüfter Kampf-/Rast-Eintrag.');
    }
    if (!force && hasUnsupportedMechanics(comment)) {
      fail(
        'failed-precondition',
        'Dieser Beitrag enthält auch eine Fertigkeitsprobe oder Inventarnutzung und kann derzeit nicht automatisch gelöscht werden.'
      );
    }

    const threadSnapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const history = sortSceneHistory(threadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      .filter(isTrustedSceneContributionComment);
    const dependent = findLaterMechanicalDependency(history, commentId);
    if (!force && dependent) fail('failed-precondition', `Eine neuere Handlung hängt von diesem Kampfstand ab: ${describeComment(dependent)}. Nimm zuerst den neueren Beitrag zurück.`);
    if (comment.commentKind === 'combat-encounter-event') {
      const encounterId = clean(comment.combatEncounter?.encounterId, 240);
      const encounterState = deriveCombatEncounterState(history).get(encounterId);
      const events = encounterState?.events || [];
      const lastEvent = events[events.length - 1];
      const isLatestEncounterEvent = lastEvent && lastEvent.commentId === commentId;
      if (!force && !isLatestEncounterEvent) {
        const laterOp = { start: 'begonnen', add: 'verstärkt', remove: 'verändert', end: 'beendet' };
        fail(
          'failed-precondition',
          `Das kann nicht gelöscht werden, weil diese Kampfliste danach schon wieder ${laterOp[lastEvent?.operation] || 'verändert'} wurde. Lösche zuerst die neueren Kampflisten-Einträge dieses Kampfes.`
        );
      }
      skippedReversal = await verifyAndRevertMechanicalUndo(transaction, database, comment.mechanicalUndo, commentId, { force }) || [];
      if (comment.encounterLockUndo?.descriptors?.length && (force || isLatestEncounterEvent)) {
        const { encounterKey, locksActivated, descriptors } = comment.encounterLockUndo;
        descriptors.forEach(descriptor => {
          const ref = database.collection('combat_profile_locks')
            .doc(descriptor.kind === 'creature' ? 'creatures' : 'characters')
            .collection('records')
            .doc(descriptor.recordId);
          transaction.set(ref, {
            activeEncounterKeys: locksActivated ? FieldValue.arrayRemove(encounterKey) : FieldValue.arrayUnion(encounterKey),
            updatedAt: FieldValue.serverTimestamp()
          }, { merge: true });
        });
      }
    } else {
      skippedReversal = await verifyAndRevertMechanicalUndo(transaction, database, comment.mechanicalUndo, commentId, { force }) || [];
    }

    transaction.delete(commentRef);
  });

  return { id: commentId, deleted: true, skippedReversal };
});

export const undoMechanicalCommentInternals = Object.freeze({
  describeComment,
  hasUnsupportedMechanics
});
