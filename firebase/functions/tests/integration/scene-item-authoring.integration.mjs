import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { database, auth, threadId, ids, fighters, reset, record, ground, history, itemSegment, useItem, undo, strike } from './item-duel-context.mjs';
import { placeSceneItem } from '../../src/mechanics/commit-scene-item.js';
import { buildOwnedItems } from '../../../../AleriaAlmanach/modules/item-register/item-register-model.js';
import { inventoryCardModel } from '../../../../AleriaAlmanach/modules/character-inventory/character-inventory-card-model.js';
import { mergeOnlineAndLocalCharacter } from '../../../../CharakterDatenbank/assets/js/character-database-client.mjs';
import { STANDARD_ITEMS } from '../../src/generated/item-register/item-register-standard.js';

after(() => database.terminate());
const draft = { name: 'Silberklinge', category: 'weapon', image: 'https://example.org/silberklinge.png',
  description: 'Eine fein geschmiedete Klinge mit silbernem Knauf.', sceneText: 'Im Gras liegt eine Klinge.',
  priceMin: 1250.25, priceMax: 1350.75, damageFormula: '1W8', damageBonus: 1, attackBonus: 1,
  info: 'Qualität: Meisterlich\nWirkung: Silberner Glanz', attributes: [{ label: 'Schaden', value: 6 }] };
const inputFor = (drafts = [draft]) => ({ entryId: threadId, operationId: randomUUID(), commentSegments: [
  { kind: 'action', narrator: true, text: 'Unter der alten Eiche wartet ein Fund.' },
  ...drafts.map(sceneItemDraft => ({ kind: 'sceneitem', sceneItemDraft }))
] });
const place = input => placeSceneItem({ database, auth, input });

test('one narrator contribution persists several immediately lootable cards, retries return the same identity', async () => {
  await reset();
  const input = inputFor([draft, { ...draft, name: 'Silberharnisch', category: 'armor', baseArmorClass: 18 }]);
  const first = await place(input), retry = await place(input);
  assert.equal(first.id, retry.id);
  const placed = (await history()).find(comment => comment.id === first.id);
  assert.equal(placed.commentSegments.length, 3);
  const entries = [...(await ground()).values()];
  assert.equal(entries.length, 2);assert.ok(entries.every(entry => entry.available));
  assert.equal(entries[0].item.valuation.minCopper, 1250.25);
  assert.equal(entries[0].item.attributes[0].value, 6);
  assert.equal(entries[1].item.combatDefinition.baseArmorClass, 18);
  await assert.rejects(place({ ...input, commentSegments: [{ kind: 'sceneitem', sceneItemDraft: { ...draft, name: 'Anderer Fund' } }] }), /anderem Inhalt/);
  await undo(first.id);
  assert.equal((await ground()).size, 0);
});

test('pickup reaches another online reader, register, archive and combat with identical card data; dependent undo is blocked', async () => {
  await reset();
  const placed = await place(inputFor());
  const entry = [...(await ground()).values()][0];
  let unsubscribe;
  const otherReader = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { unsubscribe?.(); reject(new Error('The independent online reader received no inventory update.')); }, 12000);
    unsubscribe = database.collection('characters').doc(ids[1]).onSnapshot(snapshot => {
      if (snapshot.data()?.inventory?.items?.some(item => item.instanceId === entry.item.instanceId)) { clearTimeout(timeout); resolve(snapshot.data()); }
    }, reject);
  });
  const picked = await useItem(ids[1], itemSegment(ids[1], entry));
  const live = await otherReader;unsubscribe();
  const item = live.inventory.items.find(item => item.instanceId === entry.item.instanceId);
  for (const key of ['image', 'description', 'valuation', 'attributes', 'infoRows', 'combatDefinition']) assert.deepEqual(item[key], entry.item[key], key);
  assert.equal(live.inventory.items.filter(row => row.instanceId === item.instanceId).length, 1);
  const owned = buildOwnedItems([live]).find(row => row.instanceId === item.instanceId);
  assert.ok(owned);assert.equal(owned.image, draft.image);assert.deepEqual(owned.priceRange, item.valuation);
  assert.deepEqual(owned.attributes, item.attributes);assert.deepEqual(owned.infoRows, item.infoRows);
  const archived = mergeOnlineAndLocalCharacter(live, fighters.find(actor => actor.id === ids[1]));
  assert.deepEqual(archived.inventory.items.find(row => row.instanceId === item.instanceId), item);
  const weapon = archived.combatProfile.weapons.find(weapon => weapon.inventoryItemId === item.id);
  assert.ok(weapon);assert.equal(weapon.damageBonus, 1);assert.equal(weapon.damageFormula, '1d8');
  const newerLocal = structuredClone(fighters.find(actor => actor.id === ids[1]));
  newerLocal.combatProfile.classTraining = { ...newerLocal.combatProfile.classTraining,
    schemaVersion: Number(live.combatProfile.classTraining?.schemaVersion || 0) + 1 };
  const overlay = mergeOnlineAndLocalCharacter(live, newerLocal);
  assert.ok(overlay.combatProfile.weapons.some(row => row.inventoryItemId === item.id), 'A local class update must preserve online equipment');
  assert.equal(inventoryCardModel(item).kind, 'weapon');
  assert.equal(inventoryCardModel(item).description, draft.description);
  await assert.rejects(undo(placed.id), /neuere Handlung/);
  await assert.rejects(useItem(ids[0], itemSegment(ids[0], entry)), /nicht mehr verfügbar/);
  const attack = await strike({ attacker: ids[1], target: ids[0], actionId: `weapon:${weapon.id}`, natural: 15, loadout: { rightWeaponId: weapon.id, leftWeaponId: '' } });
  assert.equal(attack.actual.profileActionId, `weapon:${weapon.id}`);
  await undo(attack.saved.id);await undo(picked.id);await undo(placed.id);
  assert.equal((await record(ids[1])).inventory.items.some(row => row.instanceId === item.instanceId), false);
});

test('standard and online offer templates preserve images, prices and trusted weapon effects; failed multi-item saves are atomic', async () => {
  await reset();
  const standard = STANDARD_ITEMS.find(item => item.category === 'waffen');
  await place(inputFor([{ template: standard.id, name: standard.title, description: standard.description || 'Eine Waffe.' }]));
  const fromStandard = [...(await ground()).values()][0].item;
  assert.equal(fromStandard.templateId, standard.id);assert.equal(fromStandard.image, standard.image);
  assert.deepEqual(fromStandard.valuation, standard.priceRange);
  const gawainSword = fighters.find(actor => actor.id === ids[1]).inventory.items.find(item => item.combatDefinition?.triggerRules?.length);
  const offer = { id: 'offer:test-sword', title: 'Schmiedevorlage', listId: 'test-forge', listName: 'Testschmiede', category: 'waffen', description: 'Eine Vorlage.', image: draft.image,
    priceRange: { minCopper: 5000, maxCopper: 5500 }, combatDefinition: gawainSword.combatDefinition };
  await database.collection('item_register_offers').doc(offer.id).set(offer);
  await place(inputFor([{ template: offer.id, name: 'Aus der Schmiede', description: 'Eine verzierte Klinge.' }]));
  const fromOffer = [...(await ground()).values()][1].item;
  assert.deepEqual(fromOffer.combatDefinition.triggerRules, gawainSword.combatDefinition.triggerRules);
  assert.equal(fromOffer.offerId, offer.id);
  const before = (await history()).length;
  await assert.rejects(place(inputFor([draft, { ...draft, image: 'javascript:alert(1)' }])), /Bildlink/);
  assert.equal((await history()).length, before);
  await assert.rejects(placeSceneItem({ database, auth: { uid: 'player', token: { aleriaRole: 'player' } }, input: inputFor() }), /Spielleitung/);
});
