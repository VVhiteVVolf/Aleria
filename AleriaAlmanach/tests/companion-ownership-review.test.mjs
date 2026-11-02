import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { reconcileReviewedCompanions, REVIEWED_COMPANION_OWNERS } from '../modules/creatures/creature-ownership-review.mjs';
const source = JSON.parse(await readFile(new URL('../../diagnostics/companion-ownership-20261102/baseline.json', import.meta.url), 'utf8'));

test('seven confirmed companion links are repaired without changing combat, money, possessions or ownership', () => {
  for (const review of REVIEWED_COMPANION_OWNERS) {
    const original = source.characters.find(character => character.id === review.id), before = structuredClone(original);
    const next = reconcileReviewedCompanions(original, source.creatures, source.reviewedAt);
    assert.deepEqual(original, before);
    const { inventory, ...fields } = next, { inventory: oldInventory, ...oldFields } = before;
    assert.deepEqual(fields, oldFields);
    for (const [key, value] of Object.entries(oldInventory || {})) if (!['items', 'companions'].includes(key)) assert.deepEqual(inventory[key], value);
    for (const item of oldInventory?.items || []) if (!item.creatureId) assert.deepEqual(inventory.items.find(row => row.id === item.id), item);
    for (const id of review.creatures) {
      const cards = inventory.companions.filter(card => card.creatureId === id);
      assert.equal(cards.length, 1);
      const item = inventory.items.find(item => item.id === cards[0].inventoryItemId);
      assert.equal(item.creatureId, id); assert.equal(item.ownerCharacterId, review.id);
    }
    assert.deepEqual(reconcileReviewedCompanions(next, source.creatures, source.reviewedAt), next);
  }
});

test('conflicting owner metadata aborts; the missing pony is never granted as part of a repair', () => {
  const conflicting = structuredClone(source.creatures); conflicting.find(creature => creature.itemOrigin.ownerCharacterId === source.characters[0].id).itemOrigin.ownerCharacterId = 'someone-else';
  assert.throws(() => reconcileReviewedCompanions(source.characters[0], conflicting, source.reviewedAt), /Besitzzuordnung/);
  assert.ok(!REVIEWED_COMPANION_OWNERS.flatMap(row => row.creatures).includes('companion-cynddelw-troetzli'));
});

test('Rianna and Lefraye have their four existing inventory animals in the common creature catalogue', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
  const catalog = getBuiltinCreatureTemplates();
  for (const [id, expected] of [['person--haus-wyrm--rianna-wyrm', ['Sir Fressbert', 'Goldlöckchen']], ['person--haus-gafyr--lefraye-gafyr', ['Agravaine', 'Thalena']]]) {
    const character = snapshot.characters.find(row => row.id === id);
    for (const name of expected) {
      const card = character.inventory.companions.find(row => row.name === name);
      const animal = catalog.find(row => row.id === card.creatureId);
      assert(animal, name); assert.equal(animal.itemOrigin.ownerCharacterId, id);
      assert.equal(animal.itemOrigin.inventoryItemId, card.inventoryItemId);
      assert.ok(animal.bestiaryReference?.id, name);
    }
  }
});
