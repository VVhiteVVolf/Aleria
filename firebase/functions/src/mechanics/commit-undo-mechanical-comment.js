import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { prepareItemClaimUndo } from '../items/item-claim-undo.js';
import { restoreCharacterHitPointSnapshot } from '../generated/combat/combat-profile-model.js';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { deriveCombatEncounterState } from '../generated/combat/combat-encounter-model.js';
import { isTrustedSceneContributionComment, sortSceneHistory } from './trusted-scene-history.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';
import { findLaterMechanicalDependency, findLaterSceneRegenerationBoundary } from './mechanical-comment-dependencies.js';
import { getCombatRulesRelease } from '../generated/combat/combat-rules-release.js';
import { isSilentSceneRegeneration } from '../generated/scene-regeneration/scene-regeneration-model.js';
import { getUndoInventoryFingerprint, undoInventoryFingerprint } from './mechanical-undo-inventory.js';

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
    const expectedInventory = options.comment && entry.before?.inventory !== undefined
      ? getUndoInventoryFingerprint(options.comment, entry) : '';
    if (expectedInventory && undoInventoryFingerprint(current.inventory) !== expectedInventory) {
      const description = `eine neuere Besitz- oder Geldänderung von ${current.name || 'dieser Figur'}`;
      if (!options.force) fail('failed-precondition', `Das Inventar wurde danach verändert. Eine automatische Rücknahme würde ${description} überschreiben.`);
      blockingDescriptions.push(description);
      skipRevert.add(index);
      continue;
    }
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
    if (entry.before?.weapons !== undefined) values['combatProfile.weapons'] = entry.before.weapons;
    if (entry.before?.armorItems !== undefined) values['combatProfile.armorItems'] = entry.before.armorItems;
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

export async function undoMechanicalCommentOperation(request, { database = getFirestore() } = {}) {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const entryId = clean(request.data?.entryId, 240);
  const commentId = clean(request.data?.commentId, 240);
  const force = request.data?.force === true;
  if (force && !['admin', 'moderator'].includes(request.auth.token?.aleriaRole)) {
    fail('permission-denied', 'Erzwungene Rücknahmen verwaltet die Spielleitung.');
  }
  if (!entryId || !commentId) fail('invalid-argument', 'Szene und Beitrag sind erforderlich.');

  const commentRef = database.collection('comments').doc(commentId);
  let skippedReversal = [];

  await database.runTransaction(async transaction => {
    const snapshot = await transaction.get(commentRef);
    if (!snapshot.exists) fail('not-found', 'Dieser Beitrag existiert nicht mehr.');
    const comment = snapshot.data() || {};
    if (clean(comment.entryId, 240) !== entryId) fail('failed-precondition', 'Der Beitrag gehört nicht zu dieser Szene.');
    if (isSilentSceneRegeneration(comment)) {
      fail('failed-precondition', 'Dieser technische Szenenstand kann nicht zurückgenommen werden.');
    }
    if (comment.inventoryTransaction?.group === true) {
      fail('failed-precondition', 'Dieser Beitrag belegt eine Buchung des Gruppenbestands. Korrigiere sie durch eine Gegenbuchung in der Gruppenkasse; der Beleg bleibt erhalten.');
    }
    if (!comment.serverValidatedMechanics && !comment.mechanicalAudit) {
      fail('failed-precondition', 'Dieser Beitrag ist kein serverseitig geprüfter Kampf-/Rast-Eintrag.');
    }
    if (!force && hasUnsupportedMechanics(comment)) {
      fail(
        'failed-precondition',
        'Dieser Beitrag enthält auch eine Fertigkeitsprobe oder Herausforderung und kann derzeit nicht automatisch gelöscht werden.'
      );
    }

    const threadSnapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const history = sortSceneHistory(threadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      .filter(isTrustedSceneContributionComment);
    const commentIndex = history.findIndex(entry => entry.id === commentId);
    if (getCombatRulesRelease(comment) || (commentIndex >= 0 && history.slice(commentIndex + 1).some(getCombatRulesRelease))) {
      fail('failed-precondition', 'Dieser Beitrag liegt vor einer veröffentlichten Regelumstellung. Eine automatische Rücknahme würde alte Ausrüstungsdaten wiederherstellen; der bisherige Kampfverlauf bleibt erhalten.');
    }
    if (findLaterSceneRegenerationBoundary(history, commentId)) {
      fail('failed-precondition', 'Dieser ältere Beitrag kann nicht mehr zurückgenommen werden, weil der aktuelle Szenenstand verbindlich fortgeschrieben wurde.');
    }
    const dependent = findLaterMechanicalDependency(history, commentId);
    if (!force && dependent) fail('failed-precondition', `Eine neuere Handlung hängt von diesem Kampfstand ab: ${describeComment(dependent)}. Nimm zuerst den neueren Beitrag zurück.`);
    const undoItemClaims = await prepareItemClaimUndo(database, transaction, comment.itemClaimUndo || []);
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
      skippedReversal = await verifyAndRevertMechanicalUndo(transaction, database, comment.mechanicalUndo, commentId, { force, comment }) || [];
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
      skippedReversal = await verifyAndRevertMechanicalUndo(transaction, database, comment.mechanicalUndo, commentId, { force, comment }) || [];
    }

    if (skippedReversal.length && comment.itemClaimUndo?.length) fail('failed-precondition', 'Die Unikatbindung kann ohne die zugehörige Inventarrücknahme nicht verändert werden.');
    undoItemClaims(); transaction.delete(commentRef);
  });

  return { id: commentId, deleted: true, skippedReversal };
}

export const commitUndoMechanicalComment = onCall({
  region: 'europe-west1', maxInstances: 10, concurrency: 20, enforceAppCheck: false, timeoutSeconds: 30
}, request => undoMechanicalCommentOperation(request));

export const undoMechanicalCommentInternals = Object.freeze({
  describeComment,
  hasUnsupportedMechanics
});
