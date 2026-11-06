import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { FAMILY_TRAIT_DEFINITIONS, getFamilyTraitOrigin } from '../modules/character-development/development-family-traits.js';
import { effectiveFamilyTraits } from '../modules/character-development/development-family-policy.js';
import { previewCharacterLevelUp, createCharacterLevelUpPlan } from '../modules/combat/combat-level-up-model.js';
import { renderDevelopmentTraits, updateDevelopmentSelection } from '../modules/character-development/development-ui.js';
import {
  sanitizeCharacterCombatProfile, getEffectiveCombatAttribute, getAttributeModifier, getMaximumHitPoints,
  getWeaponDamageModifier, getWeaponAttackModifier, getSavingThrowTotal, getSkillTotal, getArmorClass, getSpellcastingValues
} from '../modules/combat/combat-profile-model.js';
import { createCharacterArchiveProfileItem, extractCharacterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import * as server from '../../firebase/functions/src/generated/combat/combat-profile-model.js';

const trait = id => DEVELOPMENT_TRAITS.find(entry => entry.id === `development-trait-${id}`);
const ids = (...values) => values.map(value => trait(value).id);
const base = (score = 10) => sanitizeCharacterCombatProfile({
  progression: { level: 1, development: { mode: 'purchase' } }, hitPoints: { current: 3, hitDie: 8 },
  attributes: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(key => ({ key, score })),
  weapons: [{ id: 'owned-sword', name: 'Eigenes Schwert', weaponType: 'sword', attackAttribute: 'strength', damageFormula: '1d8' }],
  techniques: [{ id: 'personal', name: 'Persönliche Technik', active: true }]
});
const choose = (values, profile = base()) => previewCharacterLevelUp(profile, { targetLevel: 1, traitIds: ids(...values) });
const skill = (profile, name) => getSkillTotal(profile, profile.skills.find(entry => entry.name === name));
const weapon = attackAttribute => ({ weaponType: 'sword', attackAttribute, proficient: false });

test('both family lines have six distinct increasingly priced ranks with admitted comic icons and exact height endpoints', async () => {
  assert.equal(FAMILY_TRAIT_DEFINITIONS.length, 12);
  for (const family of ['nuadat', 'arth']) {
    const entries = DEVELOPMENT_TRAITS.filter(entry => getFamilyTraitOrigin(entry)?.family === family);
    assert.equal(entries.length, 6);
    assert.deepEqual(entries.map(entry => getFamilyTraitOrigin(entry).rank), [1, 2, 3, 4, 5, 6]);
    for (let index = 0; index < 6; index++) {
      await access(new URL(`../../${entries[index].icon.slice(1)}`, import.meta.url));
      if (index) assert.ok(entries[index].cost > entries[index - 1].cost);
    }
  }
  assert.deepEqual(FAMILY_TRAIT_DEFINITIONS.slice(0, 6).map(entry => entry[5].heightCm), [200, 240, 280, 320, 360, 400]);
});

test('Nuadat VI gives substantial derived strength and vitality with actual defense and stealth penalties, preserving personal state', () => {
  const original = base(), before = structuredClone(original);
  const result = choose(['nuadat-riesenblut-6'], original), profile = result.profile;
  assert.equal(result.ready, true);
  assert.equal(getEffectiveCombatAttribute(profile, 'strength').score, 20);
  assert.equal(getEffectiveCombatAttribute(profile, 'dexterity').score, 8);
  assert.equal(getMaximumHitPoints(profile) - getMaximumHitPoints(original), 24);
  assert.equal(getWeaponAttackModifier(profile, weapon('strength')) - getWeaponAttackModifier(original, weapon('strength')), 5);
  assert.equal(getWeaponDamageModifier(profile, weapon('strength')) - getWeaponDamageModifier(original, weapon('strength')), 5);
  assert.equal(getArmorClass(profile) - getArmorClass(original), -3);
  assert.equal(getSavingThrowTotal(profile, 'strength') - getSavingThrowTotal(original, 'strength'), 7);
  assert.equal(skill(profile, 'Heimlichkeit') - skill(original, 'Heimlichkeit'), -5);
  assert.equal(skill(profile, 'Akrobatik') - skill(original, 'Akrobatik'), -4);
  for (const key of ['attributes', 'skills', 'savingThrows', 'weapons', 'armorItems', 'resources', 'techniques', 'templateSelections', 'identity']) assert.deepEqual(profile[key], original[key], key);
  assert.equal(profile.hitPoints.current, 3);
  assert.deepEqual(original, before);
});

test('Arth I always grants a minimal strength-damage benefit while its strength score bonus follows normal parity', () => {
  for (const score of [10, 11]) {
    const original = base(score), profile = choose(['arth-blut-1'], original).profile;
    const strengthDelta = getAttributeModifier(getEffectiveCombatAttribute(profile, 'strength')) - getAttributeModifier(getEffectiveCombatAttribute(original, 'strength'));
    assert.equal(getEffectiveCombatAttribute(profile, 'strength').score, score + 1);
    assert.equal(getWeaponDamageModifier(profile, weapon('strength')) - getWeaponDamageModifier(original, weapon('strength')), strengthDelta + 1);
    assert.equal(getWeaponAttackModifier(profile, weapon('strength')) - getWeaponAttackModifier(original, weapon('strength')), strengthDelta);
    assert.equal(getWeaponDamageModifier(profile, weapon('dexterity')), getWeaponDamageModifier(original, weapon('dexterity')));
    assert.equal(skill(profile, 'Heimlichkeit') - skill(original, 'Heimlichkeit'), -1);
    assert.deepEqual(getSpellcastingValues(profile), getSpellcastingValues(original));
  }
});

test('Arth VI trades only two dexterity and stealth points for strong strength-based damage; personal dexterity training excludes it', () => {
  const original = base(), profile = choose(['arth-blut-6'], original).profile;
  assert.equal(getEffectiveCombatAttribute(profile, 'strength').score, 18);
  assert.equal(getEffectiveCombatAttribute(profile, 'dexterity').score, 8);
  assert.equal(getWeaponDamageModifier(profile, weapon('strength')) - getWeaponDamageModifier(original, weapon('strength')), 8);
  assert.equal(getWeaponDamageModifier(profile, weapon('dexterity')) - getWeaponDamageModifier(original, weapon('dexterity')), -1);
  assert.equal(skill(profile, 'Heimlichkeit') - skill(original, 'Heimlichkeit'), -3);
  profile.abilities.push({ id: 'personal-dex', active: true, activationType: 'passive', mechanics: { dexterityWeaponTypes: ['sword'] } });
  assert.equal(getWeaponDamageModifier(profile, weapon('strength')), -1);
});

test('imported ranks count only the highest active rank for every mechanical source and for the advisory price', () => {
  const all = FAMILY_TRAIT_DEFINITIONS.map(([id]) => id), result = choose(all);
  const strongest = choose(['nuadat-riesenblut-6', 'arth-blut-6']);
  assert.equal(result.ready, true);
  assert.equal(result.balance.traitCost, 35);
  assert.equal(result.balance.nominalCost, 35);
  assert.equal(result.balance.remaining, -32);
  assert.ok(result.balance.warnings.some(warning => warning.includes('Alternative Blutstufen')));
  assert.ok(result.balance.warnings.some(warning => warning.includes('Beide Familienlinien')));
  assert.equal(effectiveFamilyTraits(result.profile.quirks).length, 2);
  assert.equal(getEffectiveCombatAttribute(result.profile, 'strength').score, 28);
  for (const key of ['strength', 'dexterity']) assert.deepEqual(getEffectiveCombatAttribute(result.profile, key), getEffectiveCombatAttribute(strongest.profile, key));
  for (const name of ['Heimlichkeit', 'Akrobatik', 'Athletik']) assert.equal(skill(result.profile, name), skill(strongest.profile, name));
  assert.equal(getWeaponDamageModifier(result.profile, weapon('strength')), 13);
  assert.equal(getMaximumHitPoints(result.profile), getMaximumHitPoints(strongest.profile));
  assert.equal(getArmorClass(result.profile), getArmorClass(strongest.profile));
  assert.equal(getSavingThrowTotal(result.profile, 'strength'), getSavingThrowTotal(strongest.profile, 'strength'));
});

test('the selection replaces ranks independently and replaces older size choices without changing unrelated legacy combinations', () => {
  const plan = { traitIds: ids('nuadat-riesenblut-1', 'arth-blut-2', 'naturkind') };
  updateDevelopmentSelection(plan, { checked: true, dataset: { developmentTrait: trait('nuadat-riesenblut-6').id } });
  assert.deepEqual(new Set(plan.traitIds), new Set(ids('arth-blut-2', 'naturkind', 'nuadat-riesenblut-6')));
  updateDevelopmentSelection(plan, { checked: true, dataset: { developmentTrait: trait('arth-blut-6').id } });
  assert.deepEqual(new Set(plan.traitIds), new Set(ids('naturkind', 'nuadat-riesenblut-6', 'arth-blut-6')));
  updateDevelopmentSelection(plan, { checked: true, dataset: { developmentTrait: trait('gross').id } });
  assert.deepEqual(new Set(plan.traitIds), new Set(ids('naturkind', 'arth-blut-6', 'gross')));
  const inherited = choose(['gross', 'huenenhaft', 'riesenblut', 'nuadat-riesenblut-6']);
  assert.equal(inherited.balance.traitCost, 20);
  assert.equal(getMaximumHitPoints(inherited.profile), getMaximumHitPoints(choose(['nuadat-riesenblut-6']).profile));
  assert.equal(effectiveFamilyTraits(choose(['gross', 'huenenhaft', 'riesenblut']).profile.quirks).length, 3);
});

test('inactive and removed family ranks restore original values without refilling resources or rewriting attributes', () => {
  const original = base(), result = choose(['nuadat-riesenblut-2', 'nuadat-riesenblut-6']).profile;
  result.quirks.find(entry => getFamilyTraitOrigin(entry)?.rank === 6).active = false;
  assert.equal(getEffectiveCombatAttribute(result, 'strength').score, 13);
  const removed = previewCharacterLevelUp(result, { targetLevel: 1, traitIds: [] }).profile;
  assert.equal(getEffectiveCombatAttribute(removed, 'strength').score, 10);
  assert.equal(getMaximumHitPoints(removed), getMaximumHitPoints(original));
  assert.deepEqual(removed.attributes, original.attributes);
  assert.deepEqual(removed.resources, original.resources);
  assert.equal(removed.hitPoints.current, 3);
});

test('effective attribute scores remain at least one even with both bloodlines and retain stored bases', () => {
  const original = base(1), profile = choose(['nuadat-riesenblut-6', 'arth-blut-6'], original).profile;
  assert.equal(getEffectiveCombatAttribute(profile, 'dexterity').score, 1);
  assert.equal(profile.attributes.find(entry => entry.key === 'dexterity').score, 1);
  assert.equal(getEffectiveCombatAttribute(choose(['nuadat-riesenblut-6'], base(40)).profile, 'strength').score, 50);
});

test('intentional total overrides retain their contract and receive a clear balance warning', () => {
  const original = base(); original.hitPoints.maximumOverride = 27;
  original.armorClass.override = 18; original.armorClass.overrideMode = 'total';
  const result = choose(['nuadat-riesenblut-6'], original);
  assert.equal(getMaximumHitPoints(result.profile), 27);
  assert.equal(getArmorClass(result.profile), 18);
  assert.ok(result.balance.warnings.some(warning => warning.includes('TP-Gesamtmaximum')));
  assert.ok(result.balance.warnings.some(warning => warning.includes('Gesamt-RK')));
  assert.equal(result.balance.traitCost, 20);
});

test('archived family instances retain rank identity and UI filters keep ordinary blood carriers separate', () => {
  const original = choose(['nuadat-riesenblut-1', 'nuadat-riesenblut-6']).profile;
  const quirks = extractCharacterArchiveEntries({ id: 'test', name: 'Test', combatProfile: original })
    .filter(entry => entry.kind === 'trait').map(entry => createCharacterArchiveProfileItem(entry, 'quirks'));
  const profile = sanitizeCharacterCombatProfile({ ...base(), quirks });
  assert.equal(getEffectiveCombatAttribute(profile, 'strength').score, 20);
  assert.equal(getMaximumHitPoints(profile) - getMaximumHitPoints(base()), 24);
  assert.ok(createCharacterLevelUpPlan(profile).traitIds.includes(trait('nuadat-riesenblut-6').id));
  for (const [group, count] of [['family', 12], ['general', 30], ['bloodline', 10]]) {
    const preview = previewCharacterLevelUp(base(), { targetLevel: 1, traitGroup: group });
    assert.equal(preview.plan.traitGroup, group);
    assert.equal((renderDevelopmentTraits(preview.plan).match(/data-development-trait=/g) || []).length, count);
  }
});

test('all twelve ranked definitions and their combined actual results survive the server boundary exactly', () => {
  for (const values of [...FAMILY_TRAIT_DEFINITIONS.map(([id]) => [id]), FAMILY_TRAIT_DEFINITIONS.map(([id]) => id)]) {
    const profile = choose(values).profile, normalized = server.sanitizeCharacterCombatProfile(profile);
    assert.deepEqual(normalized, sanitizeCharacterCombatProfile(profile));
    for (const key of ['strength', 'dexterity', 'constitution']) {
      assert.deepEqual(server.getEffectiveCombatAttribute(normalized, key), getEffectiveCombatAttribute(profile, key));
      assert.equal(server.getSavingThrowTotal(normalized, key), getSavingThrowTotal(profile, key));
    }
    for (const name of ['Heimlichkeit', 'Akrobatik', 'Athletik']) assert.equal(server.getSkillTotal(normalized, normalized.skills.find(entry => entry.name === name)), skill(profile, name));
    for (const key of ['strength', 'dexterity']) assert.equal(server.getWeaponDamageModifier(normalized, weapon(key)), getWeaponDamageModifier(profile, weapon(key)));
    assert.equal(server.getMaximumHitPoints(normalized), getMaximumHitPoints(profile));
    assert.equal(server.getArmorClass(normalized), getArmorClass(profile));
  }
});
