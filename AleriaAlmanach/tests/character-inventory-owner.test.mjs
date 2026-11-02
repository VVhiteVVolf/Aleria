import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { synchronizeEquipmentFromCombat, synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

const combatSource = await readFile(new URL('../modules/characters/character-combat-profile.js', import.meta.url), 'utf8');
const inventorySource = await readFile(new URL('../modules/characters/character-inventory-profile.js', import.meta.url), 'utf8');

test('combat and inventory draft synchronization retain the active owner when legacy storage lacks characterId', () => {
  const writes = [];
  const raw = { items: [], revision: 12, moneyState: { totalCopper: 123.25 }, custom: { keep: true } };
  const original = structuredClone(raw);
  const start = combatSource.indexOf('function getInventoryDraft()');
  const end = combatSource.indexOf('const ATTRIBUTE_OPTIONS', start);
  assert.ok(start >= 0 && end > start);
  const context = vm.createContext({ synchronizeEquipmentFromCombat, synchronizeEquipmentFromInventory, sanitizeCharacterCombatProfile,
    document: { addEventListener() {} }, _editingChar: null,
    sanitizeCharacterInventoryData: value => structuredClone(value), raw });
  vm.runInContext(inventorySource, context);
  const setter = context.setCharacterInventoryProfileData;
  context.setCharacterInventoryProfileData = (inventory, options) => {
    const value = setter(inventory, options); writes.push(structuredClone(value)); return value;
  };
  vm.runInContext(`let activeCharacter = { id: 'actual-owner', name: 'Owner', portrait: '/owner.png', title: 'Knight', inventory: raw };
    let draftProfile = sanitizeCharacterCombatProfile({});
    ${combatSource.slice(start, end)}
    globalThis.syncFromCombat = synchronizeDraftFromCombat;
    globalThis.syncFromInventory = synchronizeDraftFromInventory;`, context);
  const combat = context.syncFromCombat({ inventory: raw });
  const reverse = context.syncFromInventory({ ...raw, characterId: 'obsolete-owner' });
  assert.equal(combat.inventory.characterId, 'actual-owner');
  assert.equal(reverse.inventory.characterId, 'actual-owner');
  assert.ok(writes.every(inventory => inventory.characterId === 'actual-owner'));
  for (const inventory of [combat.inventory, reverse.inventory, ...writes]) {
    assert.deepEqual(structuredClone(inventory.moneyState), raw.moneyState);
    assert.deepEqual(structuredClone(inventory.custom), raw.custom);
    assert.equal(inventory.revision, 12);
    assert.equal(inventory.name, 'Owner');
    assert.equal(inventory.portrait, '/owner.png');
    assert.equal(inventory.role, 'Knight');
  }
  assert.deepEqual(raw, original);
});

test('explicit inventory presentation survives context fallback; unrelated dirty fields are never merged back', () => {
  const context = vm.createContext({ document: { addEventListener() {} }, _editingChar: null,
    sanitizeCharacterInventoryData: value => structuredClone(value) });
  vm.runInContext(inventorySource, context);
  const stored = { name: 'Personal title', portrait: '/personal.png', role: 'Personal role', items: [],
    moneyState: { totalCopper: 5 }, removedField: 'was present before' };
  context.setCharacterInventoryProfileData(stored, { character: { id: 'owner', name: 'Owner', portrait: '/owner.png', title: 'Knight' } });
  const value = context.setCharacterInventoryProfileData({ ...stored, removedField: undefined, items: [{ id: 'new' }] },
    { character: { id: 'owner', name: 'Owner', portrait: '/owner.png', title: 'Knight' } });
  assert.equal(value.name, stored.name);
  assert.equal(value.portrait, stored.portrait);
  assert.equal(value.role, stored.role);
  assert.equal(value.removedField, undefined);
  assert.deepEqual(value.items, [{ id: 'new' }]);
  assert.deepEqual(value.moneyState, stored.moneyState);
  const explicitEmpty = context.setCharacterInventoryProfileData({ ...stored, portrait: '', role: '' },
    { character: { id: 'owner', portrait: '/owner.png', title: 'Knight' } });
  assert.equal(explicitEmpty.portrait, '');
  assert.equal(explicitEmpty.role, '');
});

test('profile source binds the real character ID before obsolete inventory metadata without altering stored data', () => {
  const context = vm.createContext({ document: { addEventListener() {} }, _editingChar: 'editor-owner',
    sanitizeCharacterInventoryData: value => structuredClone(value) });
  vm.runInContext(inventorySource, context);
  const character = { id: 'actual-owner', name: 'Owner', inventory: { characterId: 'obsolete-owner', items: [], moneyState: { totalCopper: 17 } } };
  const original = structuredClone(character);
  const value = context.getCharacterInventoryProfileSource(character);
  assert.equal(value.characterId, 'actual-owner');
  assert.deepEqual(value.moneyState, original.inventory.moneyState);
  assert.deepEqual(character, original);
});
