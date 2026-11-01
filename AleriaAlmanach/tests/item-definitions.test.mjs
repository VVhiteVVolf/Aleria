import test from 'node:test';
import assert from 'node:assert/strict';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { normalizeItemDefinition, itemDefinitionFromTemplate, definitionTemplate, itemDefinitionContent } from '../modules/item-definitions/item-definition-model.js';
import { createItemDefinitionRegistry } from '../modules/item-definitions/item-definition-registry.js';
import { materializeInventoryItem } from '../modules/item-definitions/item-definition-resolver.js';
import { createGrantedItem } from '../modules/item-register/item-register-model.js';
import { synchronizeEquipmentFromInventory, synchronizeEquipmentFromCombat } from '../modules/character-equipment/character-equipment-sync.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';

const sword = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
test('standard possessions hold references while two owners resolve one shared stat block', () => {
  const first = createGrantedItem(sword, { id: 'one', characterId: 'first' });
  const second = createGrantedItem(sword, { id: 'two', characterId: 'second' });
  assert.equal(first.combatDefinition, undefined);
  assert.equal(second.combatDefinition, undefined);
  assert.deepEqual(first.definitionRef, second.definitionRef);
  assert.equal(materializeInventoryItem(first).combatDefinition.damageFormula, '1d8');
  const projection = materializeInventoryItem(first);
  projection.combatDefinition.damageBonus = 99;
  assert.equal(materializeInventoryItem(second).combatDefinition.damageBonus, 0);
  assert.equal(first.combatDefinition, undefined);
});

test('sheet edits cannot redefine canonical equipment and the read model reconstructs its rules', () => {
  const item = createGrantedItem(sword, { id: 'blade', characterId: 'owner' });
  const initial = synchronizeEquipmentFromInventory({ inventory: { items: [item] }, combatProfile: {}, addMissingEquipment: true });
  initial.combatProfile.weapons[0].damageFormula = '99d100';
  initial.combatProfile.weapons[0].damageBonus = 99;
  const saved = synchronizeEquipmentFromCombat(initial);
  assert.equal(saved.inventory.items[0].combatDefinition, undefined);
  const read = resolveCombatProfile({ id: 'owner', ...saved });
  assert.equal(read.weapons.find(entry => entry.inventoryItemId === item.id).damageFormula, '1d8');
  assert.equal(read.weapons.find(entry => entry.inventoryItemId === item.id).damageBonus, 0);
});
test('canonical rules clear stale versatile dice and effects while a prepared loadout remains selected', () => {
  const definition = normalizeItemDefinition({ id: 'item:plain', revision: 'one', title: 'Einfache Klinge', category: 'waffen', combatDefinition: { damageFormula: '1d6' } });
  const registry = createItemDefinitionRegistry([]); registry.add([definition]);
  const item = { id: 'blade', name: 'Persönlicher Name', category: 'weapon', equipped: false, definitionRef: { id: definition.id, revision: definition.revision } };
  const result = synchronizeEquipmentFromInventory({ inventory: { items: [item] }, definitions: registry, preserveLoadout: true,
    combatProfile: { weapons: [{ id: 'weapon', inventoryItemId: 'blade', equipped: true, versatileDamageFormula: '9d20', effects: [{ type: 'damage', amount: 99 }], costs: [{ resourceId: 'reaction', amount: 99 }], properties: 'Zweihändig' }] } });
  assert.equal(result.combatProfile.weapons[0].equipped, true);
  assert.equal(result.combatProfile.weapons[0].versatileDamageFormula, '');
  assert.deepEqual(result.combatProfile.weapons[0].effects, []);
  assert.deepEqual(result.combatProfile.weapons[0].costs, []);
  assert.equal(result.combatProfile.weapons[0].properties, '');
  assert.equal(result.inventory.items[0].equipped, false);
});
test('personal armor labels cannot alter a canonical rank or armor class', () => {
  const armor = STANDARD_ITEMS.find(item => item.houseArmor?.rankId === 'seniorritter');
  const item = { ...createGrantedItem(armor, { id: 'armor', characterId: 'owner' }), name: 'Jungritter Sondername' };
  const projection = synchronizeEquipmentFromInventory({ inventory: { items: [item] }, combatProfile: {}, addMissingEquipment: true });
  const resolved = resolveCombatProfile({ id: 'owner', ...projection });
  assert.equal(resolved.armorItems[0].baseArmorClass, 18);
});

test('old and new versions remain resolvable and immutable after head changes', () => {
  const registry = createItemDefinitionRegistry([]);
  const old = normalizeItemDefinition({ id: 'item:test', revision: 'first', kind: 'shared', title: 'Sword', category: 'waffen', combatDefinition: { damageFormula: '1d8' } });
  const next = { ...old, revision: 'second', combatDefinition: { ...old.combatDefinition, damageFormula: '1d10' } };
  registry.add([old]); registry.add([next]);
  assert.equal(registry.current(old.id).revision, 'second');
  assert.equal(materializeInventoryItem({ definitionRef: old }, registry).combatDefinition.damageFormula, '1d8');
  assert.throws(() => registry.add([{ ...old, combatDefinition: next.combatDefinition }]), /nicht verändert/);
  assert.equal(itemDefinitionContent(itemDefinitionFromTemplate(definitionTemplate(old))), itemDefinitionContent(old));
});

test('own module goods receive stable shared definitions independent of price', () => {
  const shop = price => ({ id: 'shop', title: 'Shop', pages: [{ tradeCatalogPage: true, tradeCatalog: {
    categories: [{ id: 'weapons', label: 'Waffen' }], items: [{ id: 'house-sword', title: 'Hausschwert', category: 'weapons', priceMin: price, currencyCode: 'KT' }] } }] });
  const first = buildModuleOffers([shop('2')], STANDARD_ITEMS)[0];
  const repriced = buildModuleOffers([shop('3')], STANDARD_ITEMS)[0];
  assert.deepEqual(first.definitionRef, repriced.definitionRef);
  assert.equal(first.combatDefinition.damageFormula, '1d4');
  assert.equal(first.mechanicsStatus, 'provisional');
});
