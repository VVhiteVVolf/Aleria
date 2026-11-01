import test from 'node:test';
import assert from 'node:assert/strict';
import { applySceneItemInteraction } from '../modules/scene-items/scene-item-interaction.js';
import { itemDefinitionRegistry } from '../modules/item-definitions/item-definition-registry.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';

const weapon = itemDefinitionRegistry.current('standard:waffen-rustungen:stahlschwert');
const food = itemDefinitionRegistry.current('standard:gemischtwarenhandler:rationen');
const definitions = new Map([weapon, food].map(definition => [`${definition.id}@${definition.revision}`, definition]));
const item = definition => ({ id: 'incoming', name: definition.title, quantity: '1', definitionRef: { id: definition.id, revision: definition.revision } });
function actor() {
  return resolveCombatProfile({ id: 'receiver', name: 'Receiver', inventory: { items: [{ ...item(weapon), id: 'held', equipped: false }] },
    combatProfile: { hitPoints: { current: 7, maximumOverride: 20 }, armorItems: [], weapons: [
      { id: 'personal-sword', inventoryItemId: 'held', name: 'Personal sword', weaponType: 'sword', damageFormula: '1d8', equipped: true, notes: 'Keep me.' }
    ] } });
}
const entry = definition => ({ available: true, operation: 'place', sceneItemId: 'new-item', item: item(definition) });

test('food pickup updates inventory and action payment without any equipment projection', () => {
  const current = actor(), before = structuredClone(current);
  const applied = applySceneItemInteraction({ actor: current, entry: entry(food), operation: 'pickup', paymentResource: 'action', definitions });
  assert.equal(applied.combatProfile, null);
  assert.equal(applied.inventory.items.length, 2);
  assert.equal(applied.resources.find(resource => resource.id === 'action').current, current.resources.find(resource => resource.id === 'action').current - 1);
  assert.deepEqual(applied.inventory.items[0], current.inventory.items[0]);
  assert.deepEqual(current, before);
});

test('gear pickup adds only its new stowed binding while all current held entries remain exact', () => {
  const current = actor(), before = structuredClone(current);
  const applied = applySceneItemInteraction({ actor: current, entry: entry(weapon), operation: 'pickup', definitions });
  const existing = applied.combatProfile.weapons.find(entry => entry.id === 'personal-sword');
  assert.deepEqual(existing, current.weapons.find(entry => entry.id === 'personal-sword'));
  const added = applied.combatProfile.weapons.find(entry => entry.inventoryItemId === 'scene:new-item');
  assert.equal(added.damageFormula, '1d8'); assert.equal(added.equipped, false);
  assert.equal(added.id, 'scene:new-item');
  assert.deepEqual(applied.inventory.items[0], current.inventory.items[0]);
  assert.deepEqual(current, before);
});

test('taking a dropped possession removes all its bound combat modes but preserves unrelated source gear', () => {
  const source = { id: 'giver', inventory: { items: [{ ...item(weapon), id: 'dropped' }] }, combatProfile: {
    weapons: [{ id: 'cut', inventoryItemId: 'dropped', equipped: false }, { id: 'throw', inventoryItemId: 'dropped', equipped: false },
      { id: 'other', inventoryItemId: 'other', equipped: true, name: 'Unrelated' }], armorItems: null
  } };
  const before = structuredClone(source);
  const dropped = { ...entry(weapon), operation: 'drop', weaponId: 'cut', sourceActorId: 'giver', item: { ...item(weapon), id: 'dropped' } };
  const applied = applySceneItemInteraction({ actor: actor(), sourceActor: source, entry: dropped, operation: 'pickup', definitions });
  assert.deepEqual(applied.sourceCombatProfile.weapons, [source.combatProfile.weapons[2]]);
  assert.equal(applied.sourceCombatProfile.armorItems, null);
  assert.deepEqual(source, before);
});
