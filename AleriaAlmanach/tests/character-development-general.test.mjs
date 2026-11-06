import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GENERAL_TRAIT_DEFINITIONS, GENERAL_TRAIT_ICONS } from '../modules/character-development/development-general-traits.js';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { SKILL_DEFINITIONS, getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';
import {
  sanitizeCharacterCombatProfile, getSkillTotal, getSavingThrowTotal,
  getCombatInitiative, getCombatMovement, getMaximumHitPoints
} from '../modules/combat/combat-profile-model.js';

const asTrait = ([id, name, description, mechanics, cost]) => ({
  id: `development-trait-${id}`, name, description, mechanics, cost, active: true,
  type: 'trait', target: 'Selbst', duration: 'Dauerhaft', triggerRules: []
});
const base = () => sanitizeCharacterCombatProfile({
  templateSelections: { classId: 'teulu' }, progression: { level: 1 }, hitPoints: { current: 3 }
});
const canonical = value => Array.isArray(value)
  ? value.map(canonical).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, canonical(entry)]))
    : value;
const signature = trait => {
  const normalized = sanitizeCharacterCombatProfile({ quirks: [trait] }).quirks[0];
  return JSON.stringify(canonical({ mechanics: normalized.mechanics,
    rules: normalized.triggerRules.map(({ id, name, description, ...rule }) => rule) }));
};
const skillTotal = (profile, identity) => getSkillTotal(profile, profile.skills.find(entry => getSkillIdentity(entry.name) === identity));

test('thirty ordinary traits add unique names and effective choices to the existing catalog', () => {
  assert.equal(GENERAL_TRAIT_DEFINITIONS.length, 30);
  const ids = new Set(GENERAL_TRAIT_DEFINITIONS.map(([id]) => `development-trait-${id}`));
  assert.equal(ids.size, 30);
  const prior = DEVELOPMENT_TRAITS.filter(trait => !ids.has(trait.id));
  const names = new Set(prior.map(trait => trait.name));
  const signatures = new Set(prior.map(signature));
  for (const definition of GENERAL_TRAIT_DEFINITIONS) {
    const trait = asTrait(definition);
    assert.equal(prior.some(entry => entry.id === trait.id), false, trait.id);
    assert.equal(names.has(trait.name), false, `${trait.name}: duplicate name`);
    assert.equal(signatures.has(signature(trait)), false, `${trait.name}: duplicate effect`);
    names.add(trait.name);
    signatures.add(signature(trait));
    assert.ok(Number.isInteger(trait.cost) && trait.cost >= -1 && trait.cost <= 2, trait.name);
  }
});

test('every authored bonus and penalty affects exactly the named ordinary check in the shared model', () => {
  const original = base();
  for (const definition of GENERAL_TRAIT_DEFINITIONS) {
    const trait = asTrait(definition), mechanics = trait.mechanics;
    const profile = sanitizeCharacterCombatProfile({ ...original, quirks: [trait] });
    assert.deepEqual(profile.quirks[0].mechanics.skillModifiers || [], mechanics.skillModifiers || [], trait.name);
    for (const skill of SKILL_DEFINITIONS) {
      const expected = (mechanics.skillModifiers || []).filter(entry => getSkillIdentity(entry.name) === skill.id).reduce((sum, entry) => sum + entry.bonus, 0);
      assert.equal(skillTotal(profile, skill.id) - skillTotal(original, skill.id), expected, `${trait.name}/${skill.label}`);
    }
    for (const key of ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']) {
      const expected = (mechanics.saveAttributeModifiers || []).filter(entry => entry.attributeKey === key).reduce((sum, entry) => sum + entry.bonus, 0);
      assert.equal(getSavingThrowTotal(profile, key) - getSavingThrowTotal(original, key), expected, `${trait.name}/${key}`);
      const fear = (mechanics.saveModifiers || []).filter(entry => entry.kind === 'fear').reduce((sum, entry) => sum + entry.bonus, 0);
      assert.equal(getSavingThrowTotal(profile, key, { saveTags: ['fear'] }) - getSavingThrowTotal(original, key, { saveTags: ['fear'] }), expected + fear, `${trait.name}/${key}/fear`);
      assert.equal(getSavingThrowTotal(profile, key, { saveTags: ['poison'] }) - getSavingThrowTotal(original, key, { saveTags: ['poison'] }), expected, `${trait.name}/${key}/poison`);
    }
    assert.equal(getCombatInitiative(profile) - getCombatInitiative(original), mechanics.initiative || 0, trait.name);
    assert.equal(getCombatMovement(profile) - getCombatMovement(original), mechanics.movement || 0, trait.name);
    assert.equal(getMaximumHitPoints(profile), getMaximumHitPoints(original), trait.name);
  }
});

test('ordinary traits preserve training, ancestry, possessions, learned attacks and live resources', () => {
  const original = base(), before = structuredClone(original);
  for (const definition of GENERAL_TRAIT_DEFINITIONS) {
    const profile = sanitizeCharacterCombatProfile({ ...original, quirks: [asTrait(definition)] });
    for (const key of ['skills', 'attributes', 'savingThrows', 'weapons', 'armorItems', 'techniques', 'resources', 'hitPoints', 'proficiencies', 'templateSelections']) {
      assert.deepEqual(profile[key], original[key], `${definition[1]}/${key}`);
    }
  }
  assert.deepEqual(original, before);
});

test('all ordinary traits refer to their own admitted comic icons without borrowing trait identities', () => {
  assert.deepEqual(Object.keys(GENERAL_TRAIT_ICONS).sort(), GENERAL_TRAIT_DEFINITIONS.map(([id]) => id).sort());
  const validSkills = new Set(SKILL_DEFINITIONS.map(skill => skill.id));
  for (const [id, name, , mechanics] of GENERAL_TRAIT_DEFINITIONS) {
    assert.equal(GENERAL_TRAIT_ICONS[id], id, name);
    assert.ok(existsSync(new URL(`../assets/development-traits/web/${GENERAL_TRAIT_ICONS[id]}.webp`, import.meta.url)), name);
    for (const modifier of mechanics.skillModifiers || []) {
      assert.ok(validSkills.has(getSkillIdentity(modifier.name)), `${name}/${modifier.name}`);
      assert.ok(Number.isInteger(modifier.bonus) && Math.abs(modifier.bonus) <= 2, name);
    }
  }
});
