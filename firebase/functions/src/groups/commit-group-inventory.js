import { createHash } from 'node:crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { readQuestGroupAccount } from '../quests/quest-group-account.js';
import { canManageCharacter } from '../generated/item-register/item-register-model.js';
import { withProtectedRecordRevisions } from '../mechanics/protected-record-revisions.js';
import { prepareItemGrant } from '../items/item-grant-service.js';
import { resolveRegisterItemTemplate } from '../mechanics/item-register-template.js';
import { assertGroupInventoryMember } from './group-inventory-membership.js';
import { prepareGroupInventoryTransfer } from './group-inventory-transfer.js';
import { prepareGroupInventoryScene } from './group-inventory-scene.js';

const id = value => {
  if (!/^[\w:.-]{1,220}$/.test(value || '')) throw new HttpsError('invalid-argument', 'Ungültige Gruppen-, Figuren- oder Vorgangskennung.');
  return String(value);
};
function revision(actual, expected) {
  if (!Number.isSafeInteger(expected) || Number(actual || 0) !== expected) throw new HttpsError('aborted', 'Der Bestand wurde inzwischen geändert. Bitte neu öffnen.');
}
function reply(receiptId, group, member, commentId) {
  return { receiptId, groupInventory: group.inventory || { items: [] }, memberInventory: member?.inventory || null,
    groupRevision: Number(group.revision || 0), memberRevision: member ? Number(member.inventory?.revision || 0) : null, ...(commentId ? { commentId } : {}) };
}

export async function commitGroupInventoryOperation(database, auth, input = {}) {
  if (!auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  if (JSON.stringify(input).length > 30000) throw new HttpsError('invalid-argument', 'Der Gruppenauftrag ist zu groß.');
  const groupId = id(input.groupId), operationId = id(input.operationId), action = input.action;
  if (!['withdraw', 'deposit', 'grant'].includes(action)) throw new HttpsError('invalid-argument', 'Unbekannter Gruppenauftrag.');
  const memberKind = input.member?.kind === 'creature' ? 'creatures' : input.member?.kind === 'character' ? 'characters' : '';
  if (action !== 'grant' && !memberKind) throw new HttpsError('invalid-argument', 'Ein Gruppenauftrag benötigt ein eindeutiges Mitglied.');
  const memberRef = action === 'grant' ? null : database.doc(`${memberKind}/${id(input.member.recordId)}`);
  const receiptRef = database.doc(`group_inventory_transactions/${auth.uid}-${operationId}`);
  const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const identity = `group-transfer:${createHash('sha256').update(receiptRef.path).digest('hex').slice(0, 40)}`;
  const role = String(auth.token?.aleriaRole || 'player'), moderator = ['admin', 'moderator'].includes(role), editorial = moderator || role === 'editor';
  const now = new Date().toISOString();
  return database.runTransaction(async transaction => {
    const prior = await transaction.get(receiptRef);
    if (prior.exists) {
      if (prior.data().fingerprint !== fingerprint) throw new HttpsError('already-exists', 'Diese Vorgangskennung wurde bereits mit anderem Inhalt verwendet.');
      const group = (await transaction.get(database.doc(`group_quest_accounts/${groupId}`))).data() || {};
      const member = memberRef ? (await transaction.get(memberRef)).data() : null;
      return reply(receiptRef.id, group, member, prior.data().commentId);
    }
    const account = await readQuestGroupAccount(database, transaction, groupId);
    revision(account.record.revision, input.expectedGroupRevision);
    let member = null;
    if (memberRef) {
      const snapshot = await transaction.get(memberRef);
      if (!snapshot.exists) throw new HttpsError('not-found', 'Das Gruppenmitglied wurde nicht gefunden.');
      member = { ...snapshot.data(), id: memberRef.id };
      revision(member.inventory?.revision, input.expectedMemberRevision);
      const access = { authenticated: true, uid: auth.uid, canModerate: moderator };
      const manager = Array.isArray(account.record.managerUids) && account.record.managerUids.includes(auth.uid);
      if (action === 'withdraw' ? !editorial && !manager : !canManageCharacter(member, access)) {
        throw new HttpsError('permission-denied', 'Dieser Gruppenbestand kann von dieser Anmeldung nicht übertragen werden.');
      }
      await assertGroupInventoryMember(database, transaction, account, input.member.kind, member);
      const lock = await transaction.get(database.doc(`combat_profile_locks/${memberKind}/records/${member.id}`));
      if (lock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Das Gruppenmitglied nimmt gerade an einem Kampf teil.');
    } else if (!editorial) throw new HttpsError('permission-denied', 'Freie Gruppenzuteilungen verwalten Spielleitung und Redaktion.');
    let prepared;
    if (action === 'grant') {
      const product = await resolveRegisterItemTemplate(database, transaction, input.product || {});
      if (!product) throw new HttpsError('invalid-argument', 'Die verbindliche Registervorlage fehlt.');
      const grant = await prepareItemGrant(database, transaction, account.record, [{ product, quantity: input.quantity }], {
        identity, recordKind: 'groups', acquisition: { kind: 'group-grant' }, actorUid: auth.uid, now });
      prepared = { groupInventory: grant.inventory, object: { kind: 'item', name: grant.granted[0].name, receiverItemId: grant.granted[0].id,
        definitionRef: grant.granted[0].definitionRef, quantity: Number(input.quantity ?? 1) },
        giver: { id: 'grant', name: 'Zuteilung der Spielleitung', kind: 'grant' }, receiver: { id: groupId, name: account.record.name, kind: 'groups' }, write: grant.write };
    } else prepared = await prepareGroupInventoryTransfer(database, transaction, account, member, memberKind, input, identity, auth.uid, now);
    const scene = await prepareGroupInventoryScene(database, transaction, account, input.entryId, {
      actorUid: auth.uid, role, orderKey: Date.now(), text: `${prepared.giver.name} übergibt ${prepared.receiver.name} ${prepared.object.name || 'einen Gegenstand'}.`,
      transfer: { schemaVersion: 3, transferId: operationId, giver: prepared.giver, receiver: prepared.receiver, object: prepared.object, flavour: '', createdAt: now }
    });
    const groupRevision = Number(account.record.revision || 0) + 1;
    if (!Number.isSafeInteger(groupRevision)) throw new HttpsError('failed-precondition', 'Die Gruppenrevision überschreitet den unterstützten Zahlenbereich.');
    const group = { ...account.record, schemaVersion: 1, inventory: { ...prepared.groupInventory, revision: groupRevision }, revision: groupRevision, updatedAt: now };
    const changesEquipment = Object.hasOwn(prepared, 'combatProfile');
    const changedSections = changesEquipment ? ['inventory', 'combatProfile'] : ['inventory'];
    const updates = member ? withProtectedRecordRevisions(member, { inventory: prepared.memberInventory,
      ...(changesEquipment ? { combatProfile: prepared.combatProfile } : {}), updatedAt: now }, changedSections) : null;
    prepared.write(); scene.write();
    if (account.exists) transaction.update(account.reference, group); else transaction.create(account.reference, group);
    if (memberRef) transaction.update(memberRef, updates);
    transaction.create(receiptRef, { actorUid: auth.uid, groupId, operationId, action, fingerprint, at: now,
      member: input.member || null, object: prepared.object, groupRevision, memberRevision: updates?.inventory.revision || null,
      ...(scene.commentId ? { commentId: scene.commentId } : {}) });
    return reply(receiptRef.id, group, member ? { ...member, ...updates } : null, scene.commentId);
  });
}

export const commitGroupInventory = onCall({ region: 'europe-west1', timeoutSeconds: 30, maxInstances: 10, concurrency: 20 }, async request => {
  try { return await commitGroupInventoryOperation(getFirestore(), request.auth, request.data || {}); }
  catch (error) { if (error instanceof HttpsError) throw error; throw new HttpsError('failed-precondition', error.message || 'Der Gruppenauftrag konnte nicht abgeschlossen werden.'); }
});
