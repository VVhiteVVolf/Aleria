import { createHash } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { resolveRegisterItemTemplate } from '../mechanics/item-register-template.js';
import { withItemInventoryRevisions } from './item-inventory-update.js';
import { prepareItemGrant } from './item-grant-service.js';
import { toMinor } from '../generated/item-register/item-register-money.js';

const hash = value => createHash('sha256').update(value).digest('hex');
export async function commitItemAwardOperation(database, auth, input = {}) {
  if (!auth || !['admin', 'moderator'].includes(auth.token?.aleriaRole)) throw new HttpsError('permission-denied', 'Die Spielleitung bestätigt die Erfüllung der Bedingungen und vergibt die Belohnung.');
  if (!input.sourceKey || String(input.sourceKey).length > 500 || !/^[\w:.-]{1,180}$/.test(input.operationId || '')) throw new HttpsError('invalid-argument', 'Die Belohnung benötigt eine eindeutige Quelle und Vorgangskennung.');
  if (!input.recordId || String(input.recordId).includes('/')) throw new HttpsError('invalid-argument', 'Bitte einen Empfänger wählen.');
  if (!Array.isArray(input.rewards) || input.rewards.length > 24 || JSON.stringify(input).length > 100000) throw new HttpsError('invalid-argument', 'Die Belohnungsliste ist ungültig.');
  const receiptRef = database.collection('item_award_claims').doc(hash(String(input.sourceKey)));
  const recordRef = database.collection('characters').doc(input.recordId);
  const commentRef = input.entryId ? database.collection('comments').doc() : null;
  const fingerprint = hash(JSON.stringify(input)), now = new Date().toISOString();
  return database.runTransaction(async transaction => {
    const previous = await transaction.get(receiptRef);
    if (previous.exists) {
      if (previous.data().operationId === input.operationId && previous.data().fingerprint === fingerprint) return previous.data().result;
      throw new HttpsError('already-exists', 'Diese Belohnung wurde bereits vergeben. Ein neuer Versuch oder anderer Empfänger erzeugt keine zweite Auszahlung.');
    }
    const snapshot = await transaction.get(recordRef);
    if (!snapshot.exists) throw new HttpsError('not-found', 'Der Empfänger wurde nicht gefunden.');
    const record = { ...snapshot.data(), id: recordRef.id };
    const lock = await transaction.get(database.doc(`combat_profile_locks/characters/records/${record.id}`));
    if (lock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Die Belohnung kann nach dem aktiven Kampf übernommen werden.');
    if (Number(record.inventory?.revision || 0) !== Number(input.expectedRevision || 0)) throw new HttpsError('aborted', 'Das Inventar wurde inzwischen geändert. Bitte den Empfänger erneut wählen.');
    let minor = 0; const grants = [], honors = [];
    for (const reward of input.rewards) {
      if (reward.kind === 'money') {
        const factor = { gold: 1000, silver: 100, copper: 1, pfennig: 0.01 }[reward.currency];
        if (!factor || !Number.isFinite(Number(reward.amount)) || reward.amount <= 0) throw new HttpsError('invalid-argument', 'Der Belohnungsbetrag ist ungültig.');
        minor += toMinor(Number(reward.amount) * factor);
      } else if (reward.kind === 'item') {
        const product = await resolveRegisterItemTemplate(database, transaction, { template: reward.itemId, definitionRef: reward.definitionRef,
          moduleId: reward.moduleId, sourceRevision: reward.sourceRevision }, { allowCreatures: true });
        grants.push({ product, quantity: reward.quantity });
      } else if (reward.kind === 'honor') honors.push({ title: String(reward.title || '').slice(0, 180), condition: String(reward.condition || '').slice(0, 800) });
      else throw new HttpsError('invalid-argument', 'Unbekannte Belohnungsart.');
    }
    const grant = await prepareItemGrant(database, transaction, record, grants, { identity: `award:${receiptRef.id}`, copper: minor / 100,
      acquisition: { kind: 'notice-reward', sourceKey: input.sourceKey }, actorUid: auth.uid, now });
    const updates = withItemInventoryRevisions(record, { inventory: grant.inventory,
      ...(Object.hasOwn(grant, 'combatProfile') ? { combatProfile: grant.combatProfile } : {}) }, now);
    const result = { recordId: record.id, copper: minor / 100, items: grant.granted.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, definitionRef: item.definitionRef })), honors,
      message: 'Belohnung einmalig vergeben. Ehrungen bleiben Zusagen der zuständigen Stelle.' };
    grant.write(); transaction.update(recordRef, updates);
    transaction.create(receiptRef, { sourceKey: input.sourceKey, title: String(input.title || '').slice(0, 180), actorUid: auth.uid,
      operationId: input.operationId, fingerprint, rewards: input.rewards, at: now, result });
    if (commentRef) transaction.create(commentRef, { entryId: String(input.entryId).slice(0, 240), narrator: true, charName: 'Erzähler', characterId: '',
      text: `${record.name || 'Eine Figur'} erhält die Belohnung zu „${String(input.title || 'Auftrag').slice(0, 180)}“: ${minor / 100} KT${grant.granted.map(item => `, ${item.quantity} × ${item.name}`).join('')}.`,
      inventoryTransaction: { validatedBy: 'commitItemAward', sourceKey: input.sourceKey, result }, serverValidatedMechanics: true,
      createdBy: auth.uid, createdByRole: auth.token.aleriaRole, orderKey: Date.now(), createdAtClient: Date.now(), activityAt: FieldValue.serverTimestamp(), ts: FieldValue.serverTimestamp(), schemaVersion: 3 });
    return result;
  });
}
export const commitItemAward = onCall({ region: 'europe-west1', timeoutSeconds: 30, maxInstances: 10 }, async request => {
  try { return await commitItemAwardOperation(getFirestore(), request.auth, request.data); }
  catch (error) { if (error instanceof HttpsError) throw error; throw new HttpsError('failed-precondition', error.message); }
});
