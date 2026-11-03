import test from 'node:test';
import assert from 'node:assert/strict';
import { hydrateItemRecord } from '../src/items/item-definition-repository.js';
import { itemDefinitionRegistry } from '../src/generated/item-definitions/item-definition-registry.js';
import { resolveCombatProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { applySceneItemInteraction } from '../src/generated/scene-items/scene-item-interaction.js';
import { synchronizeEquipmentFromInventory } from '../src/generated/character-equipment/character-equipment-sync.js';

const definitions = ['flegel', 'stahlschwert'].map(id => itemDefinitionRegistry.current(`standard:waffen-rustungen:${id}`));
const food = itemDefinitionRegistry.current('standard:gemischtwarenhandler:rationen');
const index = new Map([...definitions, food].map(definition => [`${definition.id}@${definition.revision}`, definition]));
test('read-only hydration of bound items retains freely authored legacy weapon values; explicit inventory import still applies',()=>{
  const original=record();
  original.inventory.items.push({id:'legacy-item',name:'Eigene Axt',quantity:'1',equipped:false,combatDefinition:{kind:'weapon',weaponType:'axe',damageFormula:'1d6'}});
  original.combatProfile.weapons.push({id:'legacy-slot',inventoryItemId:'legacy-item',name:'Individuelle Nebenhand',damageFormula:'1d4+9',weaponType:'axe',equipped:false});
  const hydrated=hydrateItemRecord(original,index,{preserveLoadout:true});
  assert.equal(hydrated.combatProfile.weapons.find(weapon=>weapon.id==='legacy-slot').damageFormula,'1d4+9');
  assert.equal(hydrated.combatProfile.weapons.find(weapon=>weapon.id==='flail').damageFormula,'3d4');
  const imported=synchronizeEquipmentFromInventory({inventory:original.inventory,combatProfile:original.combatProfile,definitions:index});
  assert.equal(imported.combatProfile.weapons.find(weapon=>weapon.id==='legacy-slot').damageFormula,'1d6');
  assert.equal(original.combatProfile.weapons.find(weapon=>weapon.id==='legacy-slot').damageFormula,'1d4+9');
});
function record() {
  return { id: 'combat-loadout', name: 'Combat loadout probe', inventory: { items: definitions.map((definition, i) => ({
    id: `item-${i}`, name: definition.title, category: 'weapon', quantity: '1', equipped: false,
    definitionRef: { id: definition.id, revision: definition.revision }
  })) }, combatProfile: { hitPoints: { current: 7, maximumOverride: 20 }, weapons: [
    { id: 'flail', inventoryItemId: 'item-0', name: 'Stowed flail', weaponType: 'mace', damageFormula: '1d4', equipped: false },
    { id: 'sword', inventoryItemId: 'item-1', name: 'Held sword', weaponType: 'sword', damageFormula: '1d6', equipped: true }
  ] } };
}

test('combat hydration resolves pinned definitions without replacing the held profile weapon with old inventory flags', () => {
  const original = record(), before = structuredClone(original);
  const hydrated = hydrateItemRecord(original, index, { requireEquipped: true, preserveLoadout: true });
  const profile = resolveCombatProfile(hydrated);
  assert.equal(profile.activeWeaponId, 'sword');
  assert.equal(profile.weapon.damageFormula, '1d8', 'The held weapon still gets its actual immutable definition.');
  assert.equal(hydrated.combatProfile.weapons.find(entry => entry.id === 'flail').damageFormula, '3d4');
  assert.deepEqual(original, before);
});

test('picking up a consumable does not undo the current held choice while a new gear item still starts stowed', () => {
  const actor = resolveCombatProfile(record());
  const entry = { available: true, sceneItemId: 'found-food', operation: 'place', item: {
    id: 'ration', name: 'Ration', category: 'food', quantity: '1', definitionRef: { id: food.id, revision: food.revision }
  } };
  const applied = applySceneItemInteraction({ actor, entry, operation: 'pickup', definitions: index });
  assert.equal(applied.combatProfile, null);
});
