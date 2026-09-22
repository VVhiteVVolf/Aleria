import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveCombatProfile, resolveCombatTargetProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { collectApplicableCombatRules } from '../modules/combat/combat-trigger-rules.js';
import { synchronizeEquipmentFromCombat, synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { inventoryCardModel } from '../modules/character-inventory/character-inventory-card-model.js';

const gawain = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/gawain-draig.json', import.meta.url), 'utf8')).character;
const opponent = { id: 'opponent', name: 'Gegner', combatProfile: {
  hitPoints: { current: 100, maximumOverride: 100 }, armorClass: { override: 10 },
  weapons: [{ id: 'club', name: 'Keule', equipped: true, damageFormula: '1d6' }]
} };

async function attack(actor, target, natural = 20, options = {}) {
  let damageRequest;
  const service = new CombatResolutionService({
    async rollAttack(request) { return { natural, total: natural + request.modifier, keptDice: [natural] }; },
    async rollDamage(request) {
      damageRequest = request;
      return { total: 8 + request.bonus, notation: 'fixed test dice', keptDice: [8], modifier: request.bonus };
    }
  });
  const result = await service.resolveAttack({ actor, target }, options);
  return { result, damageRequest };
}

test('Drachenkerbe adds two flat damage only to critical hits with Drachenzahn', async () => {
  const actor = resolveCombatProfile(gawain, { actionId: 'weapon:gawain-draig-knightly-sword' });
  const target = resolveCombatTargetProfile(opponent);
  const normal = await attack(actor, target, 18);
  const critical = await attack(actor, target);
  assert.ok(critical.result.ruleApplications.some(rule => rule.ruleId === 'drachenzahn-drachenkerbe'));
  assert.equal(normal.result.ruleApplications.some(rule => rule.ruleId === 'drachenzahn-drachenkerbe'), false);
  assert.equal(critical.damageRequest.bonus - normal.damageRequest.bonus, 2);
  const dagger = structuredClone(gawain);
  dagger.combatProfile.weapons.forEach(weapon => { weapon.equipped = weapon.id === 'gawain-draig-dagger'; });
  const other = await attack(resolveCombatProfile(dagger, { actionId: 'weapon:gawain-draig-dagger' }), target);
  assert.equal(other.result.ruleApplications.some(rule => rule.ruleId === 'drachenzahn-drachenkerbe'), false);
});

test('the sword rule follows the weapon identity in techniques and excludes other actions', () => {
  const weapon = gawain.combatProfile.weapons.find(weapon => weapon.id === 'gawain-draig-knightly-sword');
  const sources = [{ actorId: gawain.id, profile: gawain.combatProfile, relationToActor: 'self' }];
  const state = { criticalSuccess: true, actorProfile: { weapon: { id: 'technique-proxy', inventoryItemId: weapon.inventoryItemId } } };
  const rules = actionKind => collectApplicableCombatRules({ phase: 'pre-damage', actionKind, sources, state });
  assert.ok(weapon.inventoryItemId);
  assert.equal(rules('technique').filter(rule => rule.ruleId === 'drachenzahn-drachenkerbe').length, 1);
  assert.equal(rules('spell').filter(rule => rule.ruleId === 'drachenzahn-drachenkerbe').length, 0);
});

test('Silberschuppe reduces each Hieb hit by two without increasing armor class', async () => {
  const attacker = structuredClone(opponent);
  attacker.combatProfile.weapons[0].damageType = 'Hieb';
  const actor = resolveCombatProfile(attacker), target = resolveCombatTargetProfile(gawain);
  const baseline = structuredClone(gawain);
  baseline.combatProfile.armorItems.forEach(item => { item.damageProtection = null; });
  const protectedHit = await attack(actor, target);
  const unprotectedHit = await attack(actor, resolveCombatTargetProfile(baseline));
  assert.equal(unprotectedHit.result.damage.total - protectedHit.result.damage.total, 2);
  assert.equal(target.totalDefense, resolveCombatTargetProfile(baseline).totalDefense);
  assert.equal(protectedHit.result.damage.damageReduction, 2);
});

test('equipment traits survive both synchronization directions and appear on their item cards', () => {
  const linked = synchronizeEquipmentFromCombat({ inventory: gawain.inventory, combatProfile: gawain.combatProfile, characterId: gawain.id });
  const restored = synchronizeEquipmentFromInventory({ ...linked, characterId: gawain.id });
  for (const collection of ['weapons', 'armorItems']) {
    const original = gawain.combatProfile[collection].find(entry => entry.triggerRules?.length || entry.damageProtection);
    const entry = restored.combatProfile[collection].find(entry => entry.id === original.id);
    assert.deepEqual(entry.triggerRules, original.triggerRules || []);
    assert.deepEqual(entry.damageProtection, original.damageProtection);
    const item = restored.inventory.items.find(item => item.equipmentLink?.combatEntryId === entry.id);
    assert.ok(inventoryCardModel(item).effects.some(effect => effect.label === (original.damageProtection?.name || original.triggerRules[0].name)));
  }
});
