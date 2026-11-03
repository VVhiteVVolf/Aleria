import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { AUTHORED_ITEMS } from '../modules/item-definitions/authored-item-catalog.js';
import { planSilberhirschOwnerCorrection, SILBERHIRSCH_TEMPLATE_ID, SILBERHIRSCH_OWNER_ID, SILBERHIRSCH_PREVIOUS_OWNER_ID, isSilberhirsch } from '../modules/house-knight-rings/silberhirsch-owner-correction.mjs';
import { synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { applyTypedCombatDamage } from '../modules/combat/combat-effect-model.js';
const snapshot = JSON.parse(await readFile(new URL('../../diagnostics/combat-sheets-20261102/online-before.json', import.meta.url), 'utf8'));
const records = snapshot.collections.characters.records;
const options = { previousOwner: records.find(record => record.id === SILBERHIRSCH_PREVIOUS_OWNER_ID),
  owner: records.find(record => record.id === SILBERHIRSCH_OWNER_ID), template: AUTHORED_ITEMS.find(item => item.id === SILBERHIRSCH_TEMPLATE_ID), now: '2026-11-03T00:00:00.000Z' };
test('The existing physical Silberhirsch moves exclusively from Rianna to Oweta without changing other possessions or resources', () => {
  const before = structuredClone(options), plan = planSilberhirschOwnerCorrection(options), [rianna, oweta] = plan.characters;
  const original = before.previousOwner.inventory.items.find(isSilberhirsch), moved = oweta.inventory.items.find(isSilberhirsch);
  assert(plan.changed); assert.equal(rianna.inventory.items.filter(isSilberhirsch).length, 0);
  assert.equal(oweta.inventory.items.filter(isSilberhirsch).length, 1);
  assert.equal(moved.id, original.id); assert.equal(moved.instanceId, original.instanceId);
  assert.equal(moved.ownerCharacterId, oweta.id); assert.equal(moved.name, 'Owetas Silberhirsch');
  assert.match(moved.description, /Armel Balchder.*Oweta Draig/); assert.doesNotMatch(moved.description, /Rianna/);
  assert.deepEqual(rianna.inventory.items, before.previousOwner.inventory.items.filter(item => !isSilberhirsch(item)));
  assert.deepEqual(oweta.inventory.items.filter(item => !isSilberhirsch(item)), before.owner.inventory.items);
  for (const [character, previous] of [[rianna, before.previousOwner], [oweta, before.owner]]) {
    assert.deepEqual(character.combatProfile, previous.combatProfile);
    assert.equal(character.inventory.money, previous.inventory.money);
    assert.deepEqual(character.inventory.moneyState, previous.inventory.moneyState);
  }
  assert.equal(planSilberhirschOwnerCorrection({ ...options, previousOwner: rianna, owner: oweta }).changed, false);
  assert.deepEqual(options, before);
});
test('Only Oweta receives the carried magical protection after the ownership correction', () => {
  const plan = planSilberhirschOwnerCorrection(options), hp = { maximum: 20, current: 20, temporary: 0 };
  for (const [index, character] of plan.characters.entries()) {
    const profile = synchronizeEquipmentFromInventory({ inventory: character.inventory, combatProfile: {} }).combatProfile;
    assert.equal(applyTypedCombatDamage(hp, 5, profile, { magical: true }).after.current, index ? 16 : 15);
    assert.equal(applyTypedCombatDamage(hp, 5, profile, { magical: false }).after.current, 15);
  }
});
