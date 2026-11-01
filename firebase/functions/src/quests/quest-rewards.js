import { HttpsError } from 'firebase-functions/v2/https';
import { normalizeQuestRewards, questId } from '../generated/quests/quest-model.js';
import { resolveRegisterItemTemplate } from '../mechanics/item-register-template.js';
import { withItemInventoryRevisions } from '../items/item-inventory-update.js';
import { prepareItemGrant } from '../items/item-grant-service.js';
import { toMinor } from '../generated/item-register/item-register-money.js';
import { readQuestGroupAccount } from './quest-group-account.js';

export function normalizeQuestAllocations(input, party, groupModuleId = '') {
  if (!Array.isArray(input) || input.length > 30) throw Error('Ungültige Belohnungszuteilung.');
  const seen = new Set();
  return input.map(row => {
    const recordId = questId(row.recordId), kind = row.kind === 'group' ? 'group' : 'character', key = `${kind}:${recordId}`;
    if (seen.has(key) || (kind === 'group' ? recordId !== groupModuleId : !party.some(member => member.kind === 'character' && member.recordId === recordId))) throw Error('Jeder Belohnungsempfänger muss einmalig zur Questgruppe oder zur verknüpften Gruppen-Landingpage gehören.');
    seen.add(key); return { ...(kind === 'group' ? { kind } : {}), recordId, rewards: normalizeQuestRewards(row.rewards) };
  });
}
// Prepare all recipients before writing any document: all-or-nothing payout.
export async function prepareQuestPayout(database, transaction, run, actorUid, now) {
  const prepared = [], uniqueIds = new Set(), definitionPreparations = new Map();
  for (const allocation of run.rewardPlan || []) {
    const group = allocation.kind === 'group' ? await readQuestGroupAccount(database, transaction, allocation.recordId) : null;
    const reference = group?.reference || database.doc(`characters/${allocation.recordId}`), snapshot = group ? null : await transaction.get(reference);
    if (!group && !snapshot.exists) throw new HttpsError('not-found', 'Ein Belohnungsempfänger fehlt.');
    const record = group?.record || { ...snapshot.data(), id: snapshot.id };
    if (!group) {
      const lock = await transaction.get(database.doc(`combat_profile_locks/characters/records/${record.id}`));
      if (lock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Ein Empfänger ist noch im Kampf. Belohnungen bleiben vorgemerkt.');
    }
    let minor = 0; const grants = [], honors = [];
    for (const reward of allocation.rewards) {
      if (reward.kind === 'money') minor += toMinor(reward.amount * { gold: 1000, silver: 100, copper: 1, pfennig: 0.01 }[reward.currency]);
      else if (reward.kind === 'item') {
        const product = await resolveRegisterItemTemplate(database, transaction, { template: reward.itemId, definitionRef: reward.definitionRef,
          moduleId: reward.moduleId, sourceRevision: reward.sourceRevision });
        if (product?.definitionKind === 'unique') {
          const key = product.definitionRef.id;
          if (uniqueIds.has(key)) throw new HttpsError('failed-precondition', 'Ein Unikat kann nicht an mehrere Personen vergeben werden.');
          uniqueIds.add(key);
        }
        grants.push({ product, quantity: reward.quantity });
      } else honors.push(reward);
    }
    const grant = await prepareItemGrant(database, transaction, record, grants, { identity: `quest:${run.id}:${group ? 'group:' : ''}${record.id}`, copper: minor / 100, recordKind: group ? 'groups' : 'characters',
      acquisition: { kind: 'quest-reward', questId: run.questId, runId: run.id }, actorUid, now, definitionPreparations });
    prepared.push({ reference, grant, create: group && !group.exists,
      updates: group ? { id: record.id, name: record.name, schemaVersion: 1, inventory: grant.inventory, revision: (record.revision || 0) + 1, updatedAt: now,
        receipts: [...(record.receipts || []), { runId: run.id, title: run.title, copper: minor / 100, at: now, honors }].slice(-100) }
        : withItemInventoryRevisions(record, { inventory: grant.inventory,
          ...(Object.hasOwn(grant, 'combatProfile') ? { combatProfile: grant.combatProfile } : {}) }, now),
      result: { ...(group ? { kind: 'group', name: record.name } : {}), recordId: record.id, copper: minor / 100, items: grant.granted.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, definitionRef: item.definitionRef })), honors } });
  }
  return { result: prepared.map(row => row.result), write() { for (const row of prepared) { row.grant.write(); if (row.create) transaction.create(row.reference, row.updates); else transaction.update(row.reference, row.updates); } } };
}
