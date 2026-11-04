import test from 'node:test';
import assert from 'node:assert/strict';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { UNIQUE_TRAIT_DEFINITIONS } from '../modules/character-development/development-unique-traits.js';
import { APTITUDE_TRAIT_DEFINITIONS } from '../modules/character-development/development-aptitude-traits.js';
import { reviewDevelopmentTraitBalance } from '../modules/character-development/development-balance-review.js';
import { previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile, getSkillTotal, getSavingThrowTotal, getWeaponDamageModifier, getEffectiveCombatAttribute, resolveSavingThrowRollMode } from '../modules/combat/combat-profile-model.js';
import { applyTypedCombatDamage } from '../modules/combat/combat-effect-model.js';
import { getCombatRollContext } from '../modules/combat/combat-resolution-service.js';
import { collectApplicableCombatRules, mergeCombatRuleEffects } from '../modules/combat/combat-trigger-rules.js';

const trait = id => DEVELOPMENT_TRAITS.find(entry => entry.id === `development-trait-${id}`);
const base = () => sanitizeCharacterCombatProfile({ hitPoints: { current: 7, maximumOverride: 30 }, progression: { level: 1, development: { mode: 'purchase' } } });
const choose = (...ids) => previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: ids.map(id => trait(id).id) }).profile;
const total = (profile, name) => getSkillTotal(profile, profile.skills.find(skill => skill.name === name));

test('curiosity is a small tradeoff and does not grant investigator training', () => {
  const original = base(), curious = choose('neugier-vor-vorsicht');
  assert.equal(total(curious, 'Nachforschungen') - total(original, 'Nachforschungen'), 1);
  assert.equal(getSavingThrowTotal(curious, 'dexterity') - getSavingThrowTotal(original, 'dexterity'), -1);
  assert.deepEqual(curious.skills, original.skills);
  assert.equal(trait('neugier-vor-vorsicht').cost, 0);
});

test('ordinary habits and aptitudes keep small numerical modifiers instead of automatic expertise', () => {
  for (const [id, name, , mechanics] of [...UNIQUE_TRAIT_DEFINITIONS, ...APTITUDE_TRAIT_DEFINITIONS]) {
    assert.equal((mechanics.skillProficiencies || []).length, 0, name);
    for (const modifier of [...mechanics.skillModifiers || [], ...mechanics.saveAttributeModifiers || []]) assert.ok(Math.abs(modifier.bonus) <= 1, `${id}: ${modifier.bonus}`);
  }
  for (const entry of DEVELOPMENT_TRAITS) for (const modifier of entry.mechanics.skillModifiers || []) assert.ok(modifier.bonus <= 2, `${entry.name} grants an excessive flat skill bonus`);
});

test('appearance and character habits do not grant unrelated professional abilities or vitality', () => {
  assert.deepEqual(trait('vollbusig').mechanics, {});
  assert.equal(trait('vollbusig').cost, 0);
  const source = base(), dreamy = choose('vertraeumt'), fragile = choose('zerbrechlich'), anxious = choose('aengstlich');
  assert.equal(total(dreamy, 'Arkane Kunde'), total(source, 'Arkane Kunde'));
  assert.equal(total(fragile, 'Akrobatik'), total(source, 'Akrobatik'));
  assert.equal(total(anxious, 'Heimlichkeit'), total(source, 'Heimlichkeit'));
  assert.equal(total(choose('pazifistische-ader'), 'Heilkunde'), total(source, 'Heilkunde'));
  assert.equal(total(choose('feines-musikgehoer'), 'Motiv erkennen'), total(source, 'Motiv erkennen'));
  assert.equal(getEffectiveCombatAttribute(choose('genie'), 'strength').score, getEffectiveCombatAttribute(source, 'strength').score);
});

test('elemental fears change matching saves without making the body take double damage', () => {
  for (const [id, type] of [['feuer-phobie', 'Feuer'], ['frost-phobie', 'Kälte'], ['blitz-phobie', 'Blitz'], ['gift-phobie', 'Gift']]) {
    const profile = choose(id);
    assert.equal(applyTypedCombatDamage({ current: 30, maximum: 30 }, 8, profile, { damageType: type }).after.current, 22, id);
    const actor = { characterId: 'enemy', profileActionKind: 'spell', actionResolutionMode: 'saving-throw', actionSaveAttribute: 'dexterity', weapon: { damageType: type } };
    assert.equal(getCombatRollContext(actor, { ...profile, characterId: 'self' }).safeRollMode, 'disadvantage', id);
    assert.equal(getCombatRollContext({ ...actor, actionResolutionMode: 'spell-attack' }, { ...profile, characterId: 'self' }).safeRollMode, 'normal', id);
  }
});

test('heat acclimatization grants a filtered save bonus rather than fire resistance', () => {
  const profile = { ...choose('glutgewoehnt'), characterId: 'self' };
  assert.equal(applyTypedCombatDamage({ current: 30, maximum: 30 }, 8, profile, { damageType: 'Feuer' }).after.current, 22);
  for (const phase of ['pre-roll', 'pre-secondary-save']) {
    const effects = type => mergeCombatRuleEffects(collectApplicableCombatRules({ phase, actionKind: 'spell',
      state: { actorProfile: { actionResolutionMode: 'saving-throw', actionSaveAttribute: 'constitution', weapon: { damageType: type } }, targetProfile: profile, saveAttribute: 'constitution' },
      sources: [{ actorId: 'self', profile, relationToActor: 'enemy', relationToTarget: 'self' }]
    }));
    assert.equal(effects('Feuer').savingThrowModifier, 1, phase);
    assert.equal(effects('Kälte').savingThrowModifier, 0, phase);
  }
});

test('physical mass does not improve bows, firearms or unrelated weapon damage', () => {
  const source = base(), giant = choose('riesenblut');
  for (const weaponType of ['bow', 'crossbow', 'firearm', 'sword']) {
    const weapon = { weaponType, attackAttribute: 'strength' };
    assert.equal(getWeaponDamageModifier(giant, weapon), getWeaponDamageModifier(source, weapon), weaponType);
  }
  assert.equal(total(giant, 'Athletik') - total(source, 'Athletik'), 1);
});

test('iron concentration helps only concentration checks and not poison or other constitution saves', () => {
  const profile = { ...choose('konzentriert'), characterId: 'self' };
  assert.equal(resolveSavingThrowRollMode(profile, 'constitution'), 'normal');
  for (const phase of ['on-concentration-check', 'pre-roll']) {
    const effects = mergeCombatRuleEffects(collectApplicableCombatRules({ phase, actionKind: 'spell',
      state: { actorProfile: { characterId: 'enemy' }, targetProfile: profile },
      sources: [{ actorId: 'self', profile, relationToActor: 'enemy', relationToTarget: 'self' }]
    }));
    assert.equal(effects.rollMode, phase === 'on-concentration-check' ? 'advantage' : 'normal');
  }
});

test('luck prices distinguish a nonstacking reroll from additive saving throw bonuses', () => {
  assert.deepEqual(trait('glueckspilz').mechanics, { savingThrow: 1, naturalOneReroll: true });
  assert.deepEqual(trait('pechvogel').mechanics, { savingThrow: -1, criticalFailureMaximum: 3 });
  assert.equal(reviewDevelopmentTraitBalance(base(), [trait('glueckspilz'), trait('glueckspilz')]).traitCost, 8);
  assert.equal(reviewDevelopmentTraitBalance(base(), [trait('pechvogel'), trait('pechvogel')]).traitCost, -8);
  const combined = reviewDevelopmentTraitBalance(base(), [trait('glueckspilz'), trait('pechvogel')]);
  assert.equal(combined.traitCost, 0);
  assert.ok(combined.warnings.some(warning => warning.includes('natürliche 2 und 3')));
});

test('combined small traits reveal large skill stacks without blocking free selection', () => {
  const result = previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: ['neugier-vor-vorsicht', 'spuernase', 'zahlenintuition'].map(id => trait(id).id) });
  assert.equal(result.ready, true);
  assert.equal(total(result.profile, 'Nachforschungen'), 4);
  assert.ok(result.balance.warnings.some(warning => warning.includes('Nachforschungen +4')));
});

test('early fever magical benefits have a price without changing disease progression or severity', () => {
  assert.equal(trait('arkanistenfieber-anzeichen').cost, 1);
  assert.equal(trait('arkanistenfieber-symptome').cost, 0);
  assert.equal(trait('arkanes-fieber-human-4').mechanics.blocksActions, true);
  assert.equal(trait('arkanes-fieber-druid-4').mechanics.blocksActions, true);
});
