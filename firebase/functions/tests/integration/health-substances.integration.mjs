import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { database, ids, fighters, reset, record, history, useItem, current, threadId } from './item-duel-context.mjs';
import { STANDARD_ITEMS } from '../../../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import { DEVELOPMENT_TRAITS } from '../../../../AleriaAlmanach/modules/character-development/development-traits.js';
import { getSkillTotal } from '../../../../AleriaAlmanach/modules/combat/combat-profile-model.js';

after(() => database.terminate());
async function prepare(canonical, traits = []) {
  const actors = structuredClone(fighters), template = STANDARD_ITEMS.find(item => item.id === canonical);
  assert.ok(template);
  actors[0].inventory.items.push({ id: 'health-test-substance', name: template.title, category: 'food', quantity: '10', definitionRef: template.definitionRef });
  actors[0].combatProfile.quirks.push(...traits.map(id => DEVELOPMENT_TRAITS.find(trait => trait.id === `development-trait-${id}`)));
  await reset({ actors });
  return { actors, item: actors[0].inventory.items.at(-1) };
}
async function clock(seconds) {
  const orderKey = Math.max(...(await history()).map(comment => Number(comment.orderKey || comment.createdAtClient || 0))) + 1;
  await database.collection('comments').doc(`health-time-${randomUUID()}`).set({ entryId: threadId, text: 'Lokaler Zeitwechsel',
    commentMode: 'scene-time', serverValidatedMechanics: true, serverCommitted: true, mechanicalAudit: true,
    sceneTimeEvent: { anchorDay: Math.floor(seconds / 86400) + 1, anchorSeconds: seconds % 86400 }, orderKey });
}
function consume(item) {
  return useItem(ids[0], { kind: 'consume', commentKind: 'consume', sceneActorId: ids[0], actorId: ids[0], text: 'Ein ganzes Exemplar konsumieren.',
    inventorySource: 'inventory', inventoryItemId: item.id,
    inventoryUse: { actorId: ids[0], actorPersistence: { kind: 'character', recordId: ids[0] },
      source: 'inventory', operation: 'consume', mode: 'consume', requestedMode: 'consume', quantity: 1, usageId: randomUUID(), item } });
}
test('fehlende Szenenzeit lehnt Rauschmittel atomar ab und verändert keinen Bestand', async () => {
  const { item } = await prepare('standard:alchemist:kriss');
  const before = await record(ids[0]), count = (await history()).length;
  await assert.rejects(consume(item), /Szenenzeit/);
  assert.deepEqual((await record(ids[0])).inventory, before.inventory);
  assert.equal((await history()).length, count);
});

test('ein ausdrücklicher null-Zeitanker erzeugt keine Rauschuhr und Konsum bleibt atomar ohne Bestandsverlust', async () => {
  const { item } = await prepare('standard:alchemist:kriss');
  const orderKey = Math.max(...(await history()).map(comment => Number(comment.orderKey || comment.createdAtClient || 0))) + 1;
  await database.collection('comments').doc(`health-null-time-${randomUUID()}`).set({ entryId: threadId, text: 'Unvollständiger lokaler Zeitanker',
    commentMode: 'scene-time', serverValidatedMechanics: true, serverCommitted: true, mechanicalAudit: true,
    sceneTimeEvent: { anchorDay: 1, anchorSeconds: null }, orderKey });
  const before = await record(ids[0]), count = (await history()).length;
  await assert.rejects(consume(item), /Szenenzeit/);
  assert.deepEqual((await record(ids[0])).inventory, before.inventory);
  assert.deepEqual((await record(ids[0])).combatProfile, before.combatProfile);
  assert.equal((await history()).length, count);
  assert.ok(!(await current(ids[0])).temporaryConditions.some(condition => condition.substance));
});
test('echter Konsum berücksichtigt den 0,5-l-Krug, speichert Rausch und erhält historische Belege', async () => {
  const { item } = await prepare('standard:taverne:klosterbier'); await clock(100);
  await consume(item); const saved = await consume(item);
  const initial = (await database.collection('comments').doc(saved.id).get()).data();
  assert.equal((await record(ids[0])).inventory.items.find(entry => entry.id === item.id).quantity, '8');
  const state = await current(ids[0]); const drunk = state.temporaryConditions.find(condition => condition.name === 'Betrunken');
  assert.ok(drunk); assert.equal(drunk.substance.load, 5);
  await clock(drunk.durationModel.expiresAtSeconds);
  assert.ok((await current(ids[0])).temporaryConditions.some(condition => condition.name === 'Verkatert (Alkohol)'));
  await clock(drunk.durationModel.expiresAtSeconds + 10800);
  assert.ok(!(await current(ids[0])).temporaryConditions.some(condition => condition.substance));
  assert.deepEqual((await database.collection('comments').doc(saved.id).get()).data(), initial);
});
test('Kriss-Toleranz und Abhängigkeit bleiben über Transaktionen, Rausch und Kater konsistent', async () => {
  const { item } = await prepare('standard:alchemist:kriss', ['abhaengigkeit-kriss-3', 'substanztoleranz-kriss']); await clock(100);
  const before = await current(ids[0]); const skill = before.skills.find(skill => skill.name === 'Geschichte');
  const withdrawal = getSkillTotal(before, skill);
  await consume(item);
  assert.equal(getSkillTotal(await current(ids[0]), skill), withdrawal);
  await consume(item);
  const intoxicated = await current(ids[0]);
  assert.equal(getSkillTotal(intoxicated, skill), withdrawal + 3);
  const effect = intoxicated.temporaryConditions.find(condition => condition.name === 'Kriss-Rausch');
  await clock(effect.durationModel.expiresAtSeconds);
  assert.equal(getSkillTotal(await current(ids[0]), skill), withdrawal - 1);
  assert.ok((await record(ids[0])).combatProfile.quirks.some(trait => trait.id === 'development-trait-abhaengigkeit-kriss-3'));
});
