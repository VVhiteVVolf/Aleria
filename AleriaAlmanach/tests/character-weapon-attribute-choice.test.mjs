import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCombatProfileReadModel,
  getSpellcastingValues,
  getWeaponAttackModifier,
  getWeaponDamageModifier,
  resolveCharacterCombatProfile,
  sanitizeCharacterCombatProfile
} from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { personalWeaponAttribute } from '../modules/combat/combat-personal-modifiers.js';

const weapon = (weaponType, attackAttribute = 'strength') => ({
  id: `choice-${weaponType}`, name: `Testwaffe ${weaponType}`, weaponType, attackAttribute,
  damageFormula: '1d6', proficient: false, attackBonus: 1, damageBonus: 2, equipped: true
});
const profile = (choice, extra = {}) => ({
  progression: { level: 6 },
  attributes: [
    { key: 'strength', score: 12 }, { key: 'dexterity', score: 18 },
    { key: 'constitution', score: 10 }, { key: 'intelligence', score: 16 },
    { key: 'wisdom', score: 10 }, { key: 'charisma', score: 10 }
  ],
  combat: choice === undefined ? {} : { weaponAttributeOverride: choice },
  weapons: [weapon('sword')],
  ...extra
});
const dexterityTraining = {
  id: 'old-dexterity-training', name: 'Bestehende Geschicklichkeitsausbildung',
  active: true, activationType: 'passive', mechanics: { dexterityWeaponTypes: ['sword'] }
};

test('older profiles retain their serialized schema and weapon-specific attribute rules without an explicit choice', () => {
  const source = profile(undefined, { abilities: [dexterityTraining] });
  const baseline = sanitizeCharacterCombatProfile(source);
  assert.equal(Object.hasOwn(baseline.combat, 'weaponAttributeOverride'), false);
  for (const value of ['', null, 'constitution', 'Strength', [], {}, 1]) {
    const normalized = sanitizeCharacterCombatProfile({ ...source, combat: { weaponAttributeOverride: value } });
    assert.equal(JSON.stringify(normalized), JSON.stringify(baseline));
  }
  assert.equal(personalWeaponAttribute(baseline, weapon('sword')), 'dexterity');
  assert.equal(personalWeaponAttribute(baseline, weapon('axe')), 'strength');
  assert.equal(personalWeaponAttribute(baseline, weapon('bow', 'dexterity')), 'dexterity');
  assert.equal(personalWeaponAttribute(baseline, weapon('staff', 'intelligence')), 'intelligence');
});

test('the character can freely choose strength or dexterity for every weapon type and both weapon modifiers', () => {
  for (const [choice, attack, damage] of [['strength', 2, 3], ['dexterity', 5, 6]]) {
    const source = sanitizeCharacterCombatProfile(profile(choice));
    for (const entry of [weapon('sword'), weapon('axe'), weapon('dagger'), weapon('bow', 'dexterity'), weapon('staff', 'intelligence')]) {
      assert.equal(personalWeaponAttribute(source, entry), choice);
      assert.equal(getWeaponAttackModifier(source, entry), attack, `${choice}: ${entry.weaponType} attack`);
      assert.equal(getWeaponDamageModifier(source, entry), damage, `${choice}: ${entry.weaponType} damage`);
    }
  }
});

test('explicit strength takes priority over older personal dexterity training and reset restores it', () => {
  const source = profile('strength', { abilities: [dexterityTraining] });
  assert.equal(getWeaponAttackModifier(source, weapon('sword')), 2);
  assert.equal(getWeaponDamageModifier(source, weapon('sword')), 3);
  const reset = sanitizeCharacterCombatProfile({ ...source, combat: { weaponAttributeOverride: '' } });
  assert.equal(Object.hasOwn(reset.combat, 'weaponAttributeOverride'), false);
  assert.equal(getWeaponAttackModifier(reset, weapon('sword')), 5);
  assert.equal(getWeaponDamageModifier(reset, weapon('sword')), 6);
});

test('attribute-bound personal bonuses follow the explicit choice without changing weapon type bonuses', () => {
  const quirks = [{ id: 'attribute-bonuses', active: true, mechanics: { weaponModifiers: [
    { attackAttributes: ['strength'], attack: 2, damage: 3 },
    { attackAttributes: ['dexterity'], attack: 4, damage: 5 },
    { weaponTypes: ['sword'], damage: 1 }
  ] } }];
  const strength = profile('strength', { quirks, abilities: [dexterityTraining] });
  const dexterity = profile('dexterity', { quirks });
  assert.equal(getWeaponAttackModifier(strength, weapon('sword')), 4);
  assert.equal(getWeaponDamageModifier(strength, weapon('sword')), 7);
  assert.equal(getWeaponAttackModifier(dexterity, weapon('sword')), 9);
  assert.equal(getWeaponDamageModifier(dexterity, weapon('sword')), 12);
  assert.equal(getWeaponDamageModifier(dexterity, weapon('axe')), 11);
});

test('the optional choice survives JSON transport and immutable calculation views', () => {
  for (const choice of ['strength', 'dexterity']) {
    const source = sanitizeCharacterCombatProfile(profile(choice));
    const transported = JSON.parse(JSON.stringify(source));
    const view = createCombatProfileReadModel(transported);
    assert.equal(view.combat.weaponAttributeOverride, choice);
    assert.equal(Object.isFrozen(view.combat), true);
    assert.deepEqual(sanitizeCharacterCombatProfile(transported), source);
    assert.equal(getWeaponAttackModifier(view, 'choice-sword'), getWeaponAttackModifier(source, 'choice-sword'));
    assert.equal(getWeaponDamageModifier(view, 'choice-sword'), getWeaponDamageModifier(source, 'choice-sword'));
  }
});

test('character and scene projections use the same choice while stored weapon definitions remain unchanged', () => {
  const source = profile('dexterity', { weapons: [weapon('sword'), { ...weapon('bow', 'dexterity'), equipped: false }] });
  const original = structuredClone(source);
  const character = { id: 'attribute-choice', name: 'Testfigur', combatProfile: source };
  const resolved = resolveCharacterCombatProfile(character);
  const scene = resolveCombatProfile(character, { includeAiSnapshot: false });
  assert.equal(resolved.weapon.attackAttribute, 'dexterity');
  assert.equal(resolved.attackModifier, 5);
  assert.equal(resolved.damageModifier, 6);
  assert.equal(scene.weapon.attackAttribute, 'dexterity');
  assert.equal(scene.attackModifier, 5);
  assert.equal(scene.damageModifier, 6);
  for (const action of scene.actions.filter(action => action.kind === 'weapon')) {
    assert.equal(action.weapon.attackAttribute, 'dexterity');
  }
  assert.deepEqual(source, original);
});

test('the weapon choice preserves spellcasting attributes and spell actions', () => {
  const magic = { enabled: true, castingAttribute: 'intelligence', spells: [
    { id: 'test-spark', name: 'Testfunke', level: 0, rollFormula: '1d6', prepared: true, resolutionType: 'spell-attack' }
  ] };
  const baseline = getSpellcastingValues(profile(undefined, { magic }));
  for (const choice of ['strength', 'dexterity']) {
    const source = profile(choice, { magic });
    assert.deepEqual(getSpellcastingValues(source), baseline);
    const scene = resolveCombatProfile({ id: 'attribute-mage', combatProfile: source }, { actionId: 'spell:test-spark', includeAiSnapshot: false });
    assert.equal(scene.profileActionKind, 'spell');
    assert.equal(scene.weapon.attackAttribute, 'intelligence');
    assert.equal(scene.attackModifier, baseline.attack);
    assert.equal(scene.damageModifier, 0);
  }
});
