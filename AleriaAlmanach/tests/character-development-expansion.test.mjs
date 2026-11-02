import test from 'node:test';
import assert from 'node:assert/strict';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { UNIQUE_TRAIT_DEFINITIONS } from '../modules/character-development/development-unique-traits.js';
import { APTITUDE_TRAIT_DEFINITIONS } from '../modules/character-development/development-aptitude-traits.js';
import { previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile, getSkillTotal, getWeaponDamageModifier, getUniversalDamageBonus, getSavingThrowTotal, getMaximumHitPoints } from '../modules/combat/combat-profile-model.js';
import { getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';
import { getCombatRollContext } from '../modules/combat/combat-resolution-service.js';
import { collectApplicableCombatRules, mergeCombatRuleEffects } from '../modules/combat/combat-trigger-rules.js';
import { sanitizeCharacterCombatProfile as serverSanitize } from '../../firebase/functions/src/generated/combat/combat-profile-model.js';
import { renderDevelopmentTraits } from '../modules/character-development/development-ui.js';

const newIds = [...UNIQUE_TRAIT_DEFINITIONS, ...APTITUDE_TRAIT_DEFINITIONS].map(([id]) => `development-trait-${id}`);
const base = () => sanitizeCharacterCombatProfile({ templateSelections: { classId: 'teulu' }, hitPoints: { current: 3 }, progression: { level: 1 } });
const choose = (...ids) => previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: ids.map(id => `development-trait-${id}`) });
const skillTotal = (profile, id) => getSkillTotal(profile, profile.skills.find(skill => getSkillIdentity(skill.name) === id));

// Compare actual sanitized mechanics, ignoring only authored rule identity text.
const signature = trait => {
  const normalized = sanitizeCharacterCombatProfile({ quirks: [trait] }).quirks[0];
  return JSON.stringify([normalized.mechanics, normalized.triggerRules.map(({ id, name, description, ...rule }) => rule)]);
};

test('twenty unusual traits and ten aptitudes add thirty distinct mechanical options', () => {
  assert.equal(UNIQUE_TRAIT_DEFINITIONS.length, 20);
  assert.equal(APTITUDE_TRAIT_DEFINITIONS.length, 10);
  assert.ok(newIds.every(id => DEVELOPMENT_TRAITS.some(trait => trait.id === id)));
  const prior = DEVELOPMENT_TRAITS.filter(trait => !newIds.includes(trait.id));
  const signatures = new Set(prior.map(signature));
  const names = new Set(prior.map(trait => trait.name));
  for (const trait of DEVELOPMENT_TRAITS.filter(trait => newIds.includes(trait.id))) {
    assert.equal(signatures.has(signature(trait)), false, `${trait.name}: duplicate effect`);
    assert.equal(names.has(trait.name), false, `${trait.name}: duplicate name`);
    signatures.add(signature(trait)); names.add(trait.name);
  }
});

test('new traits persist across both profile boundaries without granting items, attacks or resources', () => {
  const original = base(), before = structuredClone(original);
  const result = previewCharacterLevelUp(original, { targetLevel: 1, traitIds: newIds, development: { startingPoints: 0, pointsPerLevel: 0 } });
  assert.equal(result.ready, true, result.errors.join(' '));
  assert.equal(result.profile.quirks.length, 30); assert.ok(result.balance.remaining < 0);
  assert.deepEqual(serverSanitize(result.profile), sanitizeCharacterCombatProfile(result.profile));
  for (const key of ['weapons', 'armorItems', 'techniques', 'resources', 'proficiencies']) assert.deepEqual(result.profile[key], original[key], key);
  assert.equal(result.profile.hitPoints.current, original.hitPoints.current);
  assert.deepEqual(original, before);
  assert.equal(getMaximumHitPoints(result.profile), getMaximumHitPoints(original));
});

test('aptitudes affect the named skills and saves without replacing basic training', () => {
  for (const [id, name, , mechanics] of APTITUDE_TRAIT_DEFINITIONS) {
    const original = base(), result = choose(id).profile;
    for (const modifier of mechanics.skillModifiers || []) {
      const identity = getSkillIdentity(modifier.name);
      assert.ok(identity, name);
      assert.equal(skillTotal(result, identity) - skillTotal(original, identity), modifier.bonus, name);
    }
    for (const modifier of mechanics.saveAttributeModifiers || []) assert.equal(getSavingThrowTotal(result, modifier.attributeKey) - getSavingThrowTotal(original, modifier.attributeKey), modifier.bonus, name);
    assert.deepEqual(result.skills, original.skills, name);
  }
});

test('duelling preference distinguishes real melee and ranged weapon attacks, including techniques', () => {
  const profile = { ...choose('ehrenhafter-zweikampf').profile, characterId: 'actor' };
  for (const kind of ['weapon', 'technique']) {
    for (const [type, expected] of [['sword', 1], ['bow', -1]]) {
      const context = getCombatRollContext({ ...profile, profileActionKind: kind, actionResolutionMode: 'weapon-attack', weapon: { weaponType: type } }, { ...base(), characterId: 'target' });
      assert.equal(context.preRollEffects.attackModifier, expected, `${kind}/${type}`);
    }
  }
  const magical = getCombatRollContext({ ...profile, profileActionKind: 'spell', actionResolutionMode: 'spell-attack', weapon: { weaponType: 'sword' } }, { ...base(), characterId: 'target' });
  assert.equal(magical.preRollEffects.attackModifier, 0);
});

function phaseEffects(profile, actor, phase, actionKind = 'weapon', saveAttribute = '') {
  return mergeCombatRuleEffects(collectApplicableCombatRules({
    phase, actionKind, state: { actorProfile: actor, targetProfile: profile, saveAttribute },
    sources: [{ actorId: 'target', profile, relationToActor: 'enemy', relationToTarget: 'self' }]
  }));
}

test('cover trait reduces only incoming ranged weapon damage and never grants armor or a shield', () => {
  const target = choose('deckungssucher').profile;
  const actor = { actionResolutionMode: 'weapon-attack', weapon: { weaponType: 'bow' } };
  assert.equal(phaseEffects(target, actor, 'pre-damage').damageReduction, 1);
  assert.equal(phaseEffects(target, { ...actor, weapon: { weaponType: 'sword' } }, 'pre-damage').damageReduction, 0);
  assert.equal(phaseEffects(target, { ...actor, actionResolutionMode: 'spell-attack' }, 'pre-damage', 'spell').damageReduction, 0);
  assert.equal(phaseEffects(target, actor, 'pre-roll').damageReduction, 0);
  assert.deepEqual(target.armorItems, base().armorItems);
});

test('magical weather sensitivity and superstition modify primary and secondary saves only', () => {
  for (const [trait, bonus] of [['magische-wetterfuehligkeit', 1], ['aberglaeubisch', -1]]) {
    const target = choose(trait).profile;
    for (const actionKind of ['spell', 'prayer', 'song']) for (const phase of ['pre-roll', 'pre-secondary-save']) {
      assert.equal(phaseEffects(target, { actionResolutionMode: 'saving-throw', actionSaveAttribute: 'wisdom' }, phase, actionKind, 'wisdom').savingThrowModifier, bonus);
    }
    assert.equal(phaseEffects(target, { actionResolutionMode: 'spell-attack' }, 'pre-roll', 'spell').savingThrowModifier, 0);
    assert.equal(phaseEffects(target, { actionResolutionMode: 'saving-throw' }, 'pre-roll', 'technique', 'wisdom').savingThrowModifier, 0);
  }
});

test('pacifist damage penalty affects weapons, not spells, and new group filters preserve selections', () => {
  const original = base(), pacifist = choose('pazifistische-ader').profile, weapon = { weaponType: 'sword', attackAttribute: 'strength' };
  assert.equal(getWeaponDamageModifier(pacifist, weapon), getWeaponDamageModifier(original, weapon) - 1);
  assert.equal(getUniversalDamageBonus(pacifist), 0);
  for (const [group, count] of [['unique', 20], ['aptitude', 10]]) {
    const preview = previewCharacterLevelUp(original, { targetLevel: 1, traitGroup: group, traitIds: ['development-trait-zahlenintuition'] });
    assert.equal(preview.plan.traitGroup, group);
    assert.equal((renderDevelopmentTraits(preview.plan).match(/data-development-trait=/g) || []).length, count);
    assert.deepEqual(preview.plan.traitIds, ['development-trait-zahlenintuition']);
  }
});
