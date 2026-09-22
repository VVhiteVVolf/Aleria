import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveCombatProfile, resolveCombatTargetProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { collectApplicableCombatRules } from '../modules/combat/combat-trigger-rules.js';
import { synchronizeEquipmentFromCombat, synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { inventoryCardModel } from '../modules/character-inventory/character-inventory-card-model.js';

const exported = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/gildas-gafyr.json', import.meta.url), 'utf8'));
const gildas = exported.character;
const opponent = { id: 'test-opponent', name: 'Gegner', combatProfile: {
  hitPoints: { current: 100, maximumOverride: 100 }, armorClass: { override: 10 },
  weapons: [{ id: 'club', name: 'Keule', equipped: true, damageFormula: '1d6' }]
} };
async function attack(actor, target, { natural = 15, total, ...options } = {}) {
  return new CombatResolutionService({
    async rollAttack(request) { return { natural, total: total ?? natural + request.modifier, keptDice: [natural] }; },
    async rollDamage(request) { return { total: 8 + request.bonus, keptDice: [8], modifier: request.bonus }; }
  }).resolveAttack({ actor, target }, options);
}

test('Pflichtschwur adds one attack and damage, without its former critical bonus', async () => {
  const actor = resolveCombatProfile(gildas, { actionId: 'weapon:gildas-gafyr-duty-sword' });
  const baseline = structuredClone(gildas);
  const sword = baseline.combatProfile.weapons.find(row => row.id === 'gildas-gafyr-duty-sword');
  sword.attackBonus = 0;sword.damageBonus = 0;
  const normal = resolveCombatProfile(baseline, { actionId: 'weapon:gildas-gafyr-duty-sword' });
  assert.equal(actor.attackModifier - normal.attackModifier, 1);
  assert.equal(actor.damageModifier - normal.damageModifier, 1);
  const critical = await attack(actor, resolveCombatTargetProfile(opponent), { natural: 20 });
  assert.equal(critical.ruleApplications.some(rule => rule.ruleId === 'pflichtschwur-drachenkerbe'), false);
  assert.equal(gildas.combatProfile.armorItems.find(row => row.equipped).armorClassBonus, 0);
});

test('cards, both equipment synchronization directions and local archive retain the same effects and prices', async () => {
  const linked = synchronizeEquipmentFromCombat({ inventory: gildas.inventory, combatProfile: gildas.combatProfile, characterId: gildas.id });
  const restored = synchronizeEquipmentFromInventory({ ...linked, characterId: gildas.id });
  for (const [collection, name, price] of [['weapons', 'Pflichtschwur', 5500], ['armorItems', 'Gafyr-Plattenrüstung', 8800]]) {
    const equipment = restored.combatProfile[collection].find(item => item.name.includes(name));
    assert.ok(equipment);
    const item = restored.inventory.items.find(item => item.id === equipment.inventoryItemId);
    assert.ok(inventoryCardModel(item).effects.length);
    assert.deepEqual(item.combatDefinition.damageProtection ?? null, equipment.damageProtection ?? null);
    assert.deepEqual(item.valuation, { minCopper: price, maxCopper: price });
  }
  const registry = JSON.parse(await readFile(new URL('../../CharakterDatenbank/registry.json', import.meta.url), 'utf8'));
  const row = registry.records.find(row => row.name === gildas.name);
  const archived = JSON.parse(await readFile(new URL('../../CharakterDatenbank/' + row.path, import.meta.url), 'utf8')).character;
  for (const item of gildas.inventory.items.filter(item => ['weapon', 'armor'].includes(item.category))) {
    assert.equal(archived.inventory.items.filter(row => row.id === item.id).length, 1);
    assert.deepEqual(archived.inventory.items.find(row => row.id === item.id).combatDefinition, item.combatDefinition);
  }
});
