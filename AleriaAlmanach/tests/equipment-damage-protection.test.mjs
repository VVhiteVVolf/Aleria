import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applyTypedCombatDamage } from '../modules/combat/combat-effect-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { renderCombatEvaluation } from '../modules/combat/ui/combat-ui.js';
const load = async slug => JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${slug}.json`, import.meta.url), 'utf8')).character;
const gawain = await load('gawain-draig'), gildas = await load('gildas-gafyr');
const state = { current: 60, maximum: 60, temporary: 0 };
const types = ['Hieb', 'Stich', 'Wucht', 'Feuer', 'Kälte', 'Blitz', 'Gift', 'Säure', 'Psychisch', 'Nekrotisch', 'Licht', 'Magie', 'physisch', 'slashing', 'PIERCING'];

test('Silberschuppe protects only Hieb/Stich; Gafyr plate protects all types except Stich, including magical damage', () => {
  for (const character of [gawain, gildas]) for (const damageType of types) for (const magical of [false, true]) {
    const profile = resolveCombatProfile(character);
    const protectedType = character === gawain ? ['Hieb', 'Stich', 'slashing', 'PIERCING'].includes(damageType) : !['Stich', 'PIERCING'].includes(damageType);
    const result = applyTypedCombatDamage(state, 8, profile, { damageType, magical });
    assert.equal(result.incoming, protectedType ? 6 : 8, `${character.name}: ${damageType}, magical=${magical}`);
    assert.equal(result.after.current, protectedType ? 54 : 52);
    assert.equal(profile.armorClassTotal, 16);
  }
});

test('armor protection never heals, never spends resources, stops when unequipped and applies every time', () => {
  const profile = resolveCombatProfile(gildas);
  const original = structuredClone(profile);
  for (const amount of [0, 1, 2, 3, 8]) {
    const first = applyTypedCombatDamage(state, amount, profile, { damageType: 'Feuer' });
    const next = applyTypedCombatDamage(first.after, amount, profile, { damageType: 'Feuer' });
    assert.equal(first.incoming, Math.max(0, amount - 2));assert.equal(next.incoming, first.incoming);
  }
  assert.deepEqual(profile, original);
  profile.armorItems.forEach(item => { item.equipped = false; });
  assert.equal(applyTypedCombatDamage(state, 8, profile, { damageType: 'Feuer' }).incoming, 8);
});

test('protection follows resistance/save reductions and precedes temporary HP, without stacking duplicate armor', () => {
  const profile = resolveCombatProfile(gildas);
  profile.damageAffinities = [{ damageType: 'feuer', response: 'resistant' }];
  profile.armorItems.push({ ...profile.armorItems[0], id: 'duplicate-test-armor' });
  const result = applyTypedCombatDamage({ ...state, temporary: 2 }, 10, profile, { damageType: 'Feuer' });
  assert.equal(result.incoming, 3); // 10 / 2 - 2, not (10 - 2) / 2 or double armor.
  assert.equal(result.after.temporary, 0);assert.equal(result.after.current, 59);
});

async function spellAgainst(character, effects, options = {}) {
  const attacker = resolveCombatProfile({ id: 'caster', name: 'Zauberer', combatProfile: {
    hitPoints: { current: 100, maximumOverride: 100 }, weapons: [{ id: 'wand', name: 'Zauberstab', equipped: true, damageFormula: '1d8', damageType: effects[0].damageType }]
  } }, { actionId: 'weapon:wand' });
  attacker.profileActionKind = 'spell';attacker.actionResolutionMode = 'automatic';
  attacker.profileActionId = 'spell:test';
  attacker.selectedAction = { ...attacker.selectedAction, id: 'spell:test', kind: 'spell', effects, resolutionMode: 'automatic' };
  Object.assign(attacker, options);
  return new CombatResolutionService({
    async rollAttack() { return { natural: 20, total: 30, keptDice: [20] }; },
    async rollDamage() { return { total: 8, keptDice: [8], modifier: 0 }; }
  }).resolveAttack({ actor: attacker, target: resolveCombatProfile(character) });
}
const damage = (damageType, id) => ({ id, type: 'damage', target: 'target', on: 'always', amount: 8, formula: '1d8', damageType, magical: true });
test('mixed spell components use their own type and show actual protection in the combat bubble', async () => {
  const effects = [damage('Feuer', 'fire'), damage('Stich', 'piercing')];
  const result = await spellAgainst(gildas, effects);
  const components = result.effectResults.filter(row => row.effect.type === 'damage');
  assert.equal(components[0].applied.equipmentProtection.reduction, 2);
  assert.equal(components[1].applied.equipmentProtection, undefined);
  assert.equal(result.damage.total, 14);
  assert.equal(result.damage.damageReduction, 2);
  assert.match(renderCombatEvaluation({ combatResolution: result }), /Gafyr-Plattenrüstung/);
  assert.match(renderCombatEvaluation({ combatResolution: result }), /−2 Schaden/);
});
test('successful saving throw halves the damage before armor protection', async () => {
  const result = await spellAgainst(gildas, [damage('Feuer', 'fire')], {
    actionResolutionMode: 'saving-throw', actionSaveAttribute: 'dexterity', actionSpellSaveDc: 10, actionHalfDamageOnSave: true
  });
  assert.equal(result.damage.halvedBySave, true);
  assert.equal(result.damage.total, 2); // 8 / 2 - 2.
});
