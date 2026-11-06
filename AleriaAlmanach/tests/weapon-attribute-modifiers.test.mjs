import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeCharacterCombatProfile, getWeaponAttackModifier, getWeaponDamageModifier,
  getSpellcastingValues
} from '../modules/combat/combat-profile-model.js';
import { describeCombatMechanics } from '../modules/combat/ui/combat-mechanics-presentation.js';
import { renderCombatProfileTraits } from '../modules/combat-status/combat-profile-details-view.js';

const profile = (modifiers, abilities = []) => sanitizeCharacterCombatProfile({
  attributes: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
    .map(key => ({ key, score: 10 })),
  quirks: [{ id: 'attribute-training', name: 'Attributsgebundene Kraft', active: true,
    mechanics: { weaponModifiers: modifiers } }],
  abilities,
  magic: { enabled: true, castingAttribute: 'intelligence' }
});
const weapon = (weaponType, attackAttribute, extra = {}) => ({
  id: `${weaponType}-${attackAttribute}`, weaponType, attackAttribute,
  proficient: false, damageFormula: '1d6', ...extra
});

test('attribute-only weapon modifiers follow the actual selected attack attribute', () => {
  const source = profile([{ attackAttributes: ['strength'], attack: 1, damage: 2 }]);
  for (const entry of [weapon('sword', 'strength'), weapon('dagger', 'strength', { properties: 'Finesse' }),
    weapon('spear', 'strength', { rangeType: 'ranged' })]) {
    assert.equal(getWeaponAttackModifier(source, entry), 1);
    assert.equal(getWeaponDamageModifier(source, entry), 2);
  }
  for (const entry of [weapon('sword', 'dexterity'), weapon('dagger', 'dexterity', { properties: 'Finesse' }),
    weapon('bow', 'dexterity'), weapon('staff', 'intelligence')]) {
    assert.equal(getWeaponAttackModifier(source, entry), 0);
    assert.equal(getWeaponDamageModifier(source, entry), 0);
  }
});

test('personal dexterity training excludes an otherwise strength-based weapon', () => {
  const training = { id: 'personal-dexterity', name: 'Persönliche Geschicklichkeitsausbildung',
    active: true, activationType: 'passive', mechanics: { dexterityWeaponTypes: ['sword', 'spear'] } };
  const modifiers = [{ attackAttributes: ['strength'], damage: 3 }];
  const source = profile(modifiers, [training]);
  assert.equal(getWeaponDamageModifier(source, weapon('sword', 'strength')), 0);
  assert.equal(getWeaponDamageModifier(source, weapon('spear', 'strength')), 0);
  assert.equal(getWeaponDamageModifier(source, weapon('axe', 'strength')), 3);
  for (const changed of [{ ...training, active: false }, { ...training, activationType: 'action' }]) {
    assert.equal(getWeaponDamageModifier(profile(modifiers, [changed]), weapon('sword', 'strength')), 3);
  }
});

test('weapon type and attack attribute filters intersect while older type-only bonuses retain their effect', () => {
  const source = profile([
    { weaponTypes: ['sword'], attackAttributes: ['strength'], damage: 3 },
    { weaponTypes: ['sword'], damage: 1 },
    { weaponTypes: [], damage: 20 }
  ]);
  assert.equal(getWeaponDamageModifier(source, weapon('sword', 'strength')), 4);
  assert.equal(getWeaponDamageModifier(source, weapon('sword', 'dexterity')), 1);
  assert.equal(getWeaponDamageModifier(source, weapon('axe', 'strength')), 0);
});

test('invalid or empty explicit attribute filters never broaden a weapon bonus', () => {
  for (const attackAttributes of [[], ['invalid'], ['dexterity', 'dexterity', 'invalid']]) {
    const source = profile([{ weaponTypes: ['sword'], attackAttributes, damage: 5 }]);
    assert.equal(getWeaponDamageModifier(source, weapon('sword', 'strength')), 0);
    assert.deepEqual(source.quirks[0].mechanics.weaponModifiers[0].attackAttributes,
      attackAttributes.includes('dexterity') ? ['dexterity'] : []);
    assert.deepEqual(sanitizeCharacterCombatProfile(source), source);
  }
  const normalized = profile([{ attackAttributes: ['Strength'], damage: 2 }]);
  assert.deepEqual(normalized.quirks[0].mechanics.weaponModifiers[0].attackAttributes, ['strength']);
  assert.equal(getWeaponDamageModifier(normalized, weapon('axe', 'strength')), 2);
  for (const attackAttributes of ['strength', null, 1]) {
    const malformed = profile([{ weaponTypes: ['sword'], attackAttributes, damage: 5 }]);
    assert.deepEqual(malformed.quirks[0].mechanics.weaponModifiers[0].attackAttributes, []);
    assert.equal(getWeaponDamageModifier(malformed, weapon('sword', 'strength')), 0);
  }
});

test('attribute-bound weapon damage neither changes spells nor rewrites weapon definitions', () => {
  const entry = weapon('sword', 'strength'), before = structuredClone(entry);
  const source = profile([{ attackAttributes: ['strength'], damage: 4 }]);
  assert.deepEqual(getSpellcastingValues(source), getSpellcastingValues(profile([])));
  assert.equal(getWeaponDamageModifier(source, entry), 4);
  assert.deepEqual(entry, before);
  source.quirks[0].active = false;
  assert.equal(getWeaponDamageModifier(source, entry), 0);
});

test('mechanics labels expose the attack attribute restriction and omit impossible filters', () => {
  const source = profile([
    { attackAttributes: ['strength'], damage: 4 },
    { weaponTypes: ['sword'], attackAttributes: ['dexterity'], attack: 1 },
    { attackAttributes: [], damage: 10 }
  ]);
  const labels = describeCombatMechanics(source.quirks[0].mechanics);
  assert.ok(labels.some(label => label.includes('KRF als Angriffsattribut: Schaden +4')));
  assert.ok(labels.some(label => label.includes('GES als Angriffsattribut: Angriff +1')));
  assert.ok(labels.every(label => !label.includes('+10')));
});

test('profile details identify superseded family ranks and generic size bonuses as mechanically inactive', () => {
  const source = sanitizeCharacterCombatProfile({ quirks: [
    { id: 'development-trait-nuadat-riesenblut-1', name: 'Nuadat I', active: true },
    { id: 'development-trait-nuadat-riesenblut-6', name: 'Nuadat VI', active: true },
    { id: 'development-trait-gross', name: 'Groß', active: true },
    { id: 'development-trait-arth-blut-2', name: 'Arth II', active: false }
  ] });
  const markup = renderCombatProfileTraits(source);
  assert.ok(markup.includes('Nuadat I · derzeit ohne Rechenwirkung'));
  assert.ok(markup.includes('Nuadat VI · aktiv'));
  assert.ok(markup.includes('Groß · derzeit ohne Rechenwirkung'));
  assert.ok(markup.includes('Arth II · inaktiv'));
});
