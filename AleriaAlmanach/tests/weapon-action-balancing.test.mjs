import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createWeaponTechniqueDamageProfile } from '../modules/combat-styles/weapon-technique-budget.js';
import { resolveTechniqueDamageFormula, getLightAttackDamageModifier } from '../modules/combat/combat-technique-damage.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { getCombatDamagePreview, averageDamageFormula } from '../modules/combat/combat-action-estimates.js';
import { prepareCombatEquipment } from '../modules/combat/combat-equipment-preparation.js';
import { withEquippedCombatWeapon } from '../modules/combat/combat-equipment-state.js';
import { hasPairedCombatTraining } from '../modules/combat/combat-paired-weapons.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';
import { getBalanceCatalog } from './support/technique-balance-catalog.mjs';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';

const records = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8')).characters;
const load = name => structuredClone(records.find(character => character.name.startsWith(name)));
const costs = ids => ids.map(resourceId => ({ resourceId, amount: 1 }));
function technique(ids, extra = {}) {
  return { minimumLevel: 1, ...createWeaponTechniqueDamageProfile({ minimumLevel: 1, ...extra }, costs(ids)) };
}
const formula = (ids, weapon = '1d8', level = 6, extra = {}) => resolveTechniqueDamageFormula(
  technique(ids, extra), { damageFormula: weapon }, { progression: { level } });
function equipPair(character, right, left = right) {
  character.combatProfile.armorClass.shieldBonus = 0;
  character.combatProfile.armorItems.forEach(item => { if (item.kind === 'shield') item.equipped = false; });
  return withEquippedCombatWeapon(character, right, left);
}

test('ordinary action economy preserves the weapon base and buys explicit extra dice', () => {
  for (const [ids, expected] of [
    [['action'], '1d8'], [['reaction'], '1d8'], [['bonus-action'], '1d4'],
    [['action', 'bonus-action'], '1d8+1d4'], [['action', 'reaction'], '1d8+1d6'],
    [['reaction', 'bonus-action'], '1d8+1d4'],
    [['action', 'reaction', 'bonus-action'], '1d8+1d6+1d4'],
    [['action', 'special-action'], '2d8'], [['reaction', 'special-action'], '2d8'],
    [['bonus-action', 'special-action'], '1d4+1d8'],
    [['action', 'reaction', 'special-action'], '2d8+1d6'],
    [['action', 'aura-focus'], '3d8']
  ]) assert.equal(formula(ids), expected, ids.join('+'));
});

test('light attacks stay light at every level and never acquire a training die', () => {
  for (let level = 1; level <= 20; level++) for (const weapon of ['1d4', '1d6', '1d8', '1d10', '1d12', '2d6']) {
    const light = formula(['bonus-action'], weapon, level);
    assert.equal(light, weapon === '2d6' ? '2d4' : '1d4');
    assert.ok(averageDamageFormula(light) <= averageDamageFormula(weapon));
  }
  assert.equal(getLightAttackDamageModifier(7, { lightAttack: true }), 3);
  assert.equal(getLightAttackDamageModifier(-3, { lightAttack: true }), -3);
  assert.equal(getLightAttackDamageModifier(7, {}), 7);
});

test('special and aura points strengthen damage monotonically without multiplying the whole pool', () => {
  for (const weapon of ['1d4', '1d6', '1d8', '1d10', '1d12', '2d6']) {
    const sides = Number(weapon.split('d')[1]);
    for (const base of [['action'], ['reaction'], ['bonus-action'], ['action', 'reaction', 'bonus-action']]) {
      const ordinary = averageDamageFormula(formula(base, weapon));
      assert.equal(averageDamageFormula(formula([...base, 'special-action'], weapon)) - ordinary, (sides + 1) / 2);
      assert.equal(averageDamageFormula(formula([...base, 'aura-focus'], weapon)) - ordinary, sides + 1);
    }
  }
  assert.equal(formula(['action', 'reaction'], '1d8', 6, { damageControl: true }), '1d8');
});

test('newly unlocked techniques retain the same attained training as old ones', () => {
  for (let level = 7; level <= 20; level++) {
    assert.equal(formula(['action'], '1d8', level), formula(['action'], '1d8', level, { minimumLevel: level }));
  }
});

test('multiple paid points add individual weapon dice instead of multiplying the complete weapon pool', () => {
  const action = { minimumLevel: 1, ...createWeaponTechniqueDamageProfile({}, [
    { resourceId: 'action', amount: 2 }, { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }
  ]) };
  assert.equal(resolveTechniqueDamageFormula(action, { damageFormula: '2d6' }, { progression: { level: 6 } }), '9d6');
});

test('all catalog action/reaction damage starts with the real weapon; all pure bonus techniques remain capped', () => {
  for (const entry of getBalanceCatalog()) {
    if (entry.damageModel.mode !== 'weapon-dice') continue;
    for (const damageFormula of ['1d4', '1d6', '1d8', '1d10', '1d12', '2d6']) {
      const result = resolveTechniqueDamageFormula(entry, { damageFormula }, { progression: { level: 20 } });
      if (entry.costs.every(cost => cost.resourceId === 'bonus-action')) {
        assert.equal(result, damageFormula === '2d6' ? '2d4' : '1d4', entry.id);
        assert.deepEqual(entry.damageModel.scalingSteps, [], entry.id);
      } else if (entry.costs.some(cost => ['action', 'reaction'].includes(cost.resourceId))) {
        assert.ok(averageDamageFormula(result) >= averageDamageFormula(damageFormula), entry.id);
      }
    }
  }
});

test('Asgeir, Fenrir and Guinevere use both weapon dice, Gawain has no unearned paired attack', () => {
  for (const [name, right, left, expected] of [
    ['Asgeir', 'asgeir-axt-rechts', 'asgeir-axt-links', '2d6'],
    ['Fenrir', 'fenrir-handaxe-pair', 'fenrir-handaxe-pair', '2d6'],
    ['Guinevere', 'guinevere-hunting-daggers', 'guinevere-hunting-daggers', '2d4']
  ]) {
    const character = equipPair(load(name), right, left);
    assert.equal(resolveCombatProfile(character, { actionId: `weapon:${right}` }).weapon.damageFormula, expected);
    assert.equal(prepareCombatEquipment(character, { rightWeaponId: right, leftWeaponId: left }, { free: true }).preparation, null);
  }
  const gawain = load('Gawain');
  const prepared = prepareCombatEquipment(gawain, { rightWeaponId: 'gawain-draig-knightly-sword', leftWeaponId: 'gawain-draig-dagger' }, { free: true });
  assert.match(prepared.preparation.error, /Zweiwaffentechnik/);
  const forced = equipPair(gawain, 'gawain-draig-knightly-sword', 'gawain-draig-dagger');
  assert.equal(resolveCombatProfile(forced).weapon.damageFormula, '1d8');
});

test('joint attacks use the actual offhand die and add a flat modifier only once', () => {
  const character = equipPair(load('Asgeir'), 'asgeir-axt-rechts', 'asgeir-axt-links');
  character.combatProfile.weapons.find(w => w.id === 'asgeir-axt-links').damageFormula = '1d4+9';
  assert.equal(resolveCombatProfile(character).weapon.damageFormula, '1d6+1d4');
  const p = resolveCombatProfile(character);
  assert.equal(hasPairedCombatTraining({ ...p, progression: { level: 1 } }, p.weapons[0], p.weapons[1]), false);
});

test('Asgeir four fangs remains four separate single-axe attacks', async () => {
  const character = equipPair(load('Asgeir'), 'asgeir-axt-rechts', 'asgeir-axt-links');
  const actor = resolveCombatProfile(character, { actionId: 'technique:asgeir-vier-faenge' });
  assert.equal(actor.weapon.damageFormula, '1d6');
  const target = { ...resolveCombatProfile(load('Gawain')), totalDefense: 1, currentHitPoints: 1000, maximumHitPoints: 1000 };
  const dice = new SeededCombatDice(1, 20);
  dice.rollAttack = async ({ modifier }) => ({ natural: 19, total: 19 + modifier, dice: [19], keptDice: [19] });
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  assert.equal(result.followUpAttacks.length, 3);
  assert.ok(result.followUpAttacks.every(attack => /^1W6|^1d6/i.test(attack.damage.notation)));
});

test('Ylva light bow attack is weaker than her normal shot and aura adds two actual bow dice', () => {
  const character = load('Ylva');
  const normal = resolveCombatProfile(character);
  const id = normal.actions.find(action => action.name === 'Erster Jagdpfeil').id;
  const light = resolveCombatProfile(character, { actionId: id });
  assert.equal(getCombatDamagePreview(light).notation, '1d4+2');
  assert.ok(getCombatDamagePreview(light).average < getCombatDamagePreview(normal).average);
  character.combatProfile.progression.level = 8;
  character.combatProfile.resources.find(r => r.id === 'aura-focus').current = 1;
  character.combatProfile.resources.find(r => r.id === 'aura-focus').maximum = 1;
  const aura = resolveCombatProfile(character, { actionId: id, paymentMode: 'aura' });
  assert.equal(aura.selectedAction.auraDamageBonus, '2d8');
});

test('temporary damage buffs follow the light-attack rounding and a dropped offhand blocks joint attacks', () => {
  const character = equipPair(load('Asgeir'), 'asgeir-axt-rechts', 'asgeir-axt-links');
  const id = resolveCombatProfile(character).actions.find(action => action.name === 'Kurzer Axthieb').id;
  const light = resolveCombatProfile(character, { actionId: id });
  const state = overlayCombatHitPointState(light, { temporaryConditions: [{ id: 'damage-buff', name: 'Schaden', active: true, mechanics: { damage: 3 } }] });
  assert.equal(state.damageModifier, Math.floor((light.selectedAction.unscaledDamageModifier + 3) / 2));
  const disarmed = overlayCombatHitPointState(light, { droppedWeapons: [{ weaponId: 'asgeir-axt-links' }] });
  assert.equal(disarmed.weaponUnavailable, true);
  const oneHand = withEquippedCombatWeapon(character, 'asgeir-axt-rechts', '');
  assert.equal(overlayCombatHitPointState(resolveCombatProfile(oneHand, { actionId: id }), { droppedWeapons: [{ weaponId: 'asgeir-axt-links' }] }).weaponUnavailable, false);
});
