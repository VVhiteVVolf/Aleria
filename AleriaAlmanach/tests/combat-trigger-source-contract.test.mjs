import test from 'node:test';
import assert from 'node:assert/strict';
import { traitSaveModifier } from '../modules/character-development/development-trait-rules.js';

// Isolated contract fixtures; these are not selectable catalog definitions.
const weaponRule = (phase, recipient, attackRange, effects, filters = {}) => ({ id: `${phase}-${recipient}-${attackRange}`, phase, recipient, attackRange, sourceRelation: 'self', activation: 'passive', frequency: 'always', condition: 'always', actionKinds: ['weapon', 'technique'], weaponAttackOnly: true, ...filters, effects });
const CONTRACT_DEFINITIONS = [
  ['faehigkeit-physical-save-contract', 'Physical save contract', '', { initiative: -1 }, 0, { triggerRules: traitSaveModifier('physical-save-contract', 1, { saveAttributes: ['constitution'], damageTypes: ['hieb', 'slashing', 'stich', 'piercing', 'wucht', 'bludgeoning'] }) }],
  ['faehigkeit-acid-save-contract', 'Acid save contract', '', {}, 0, { triggerRules: traitSaveModifier('acid-save-contract', 2, { saveAttributes: ['dexterity'], damageTypes: ['säure', 'saeure', 'acid'] }) }],
  ['faehigkeit-ranged-reduction-contract', 'Ranged reduction contract', '', {}, 0, { triggerRules: [weaponRule('pre-damage', 'target', 'ranged', { damageReduction: 1 }, { damageTypes: ['stich', 'piercing'] })] }],
  ['faehigkeit-melee-reduction-contract', 'Melee reduction contract', '', {}, 0, { triggerRules: [weaponRule('pre-damage', 'target', 'melee', { damageReduction: 1 }, { damageTypes: ['wucht', 'bludgeoning'] })] }],
  ['faehigkeit-defense-contract', 'Defense contract', '', {}, 0, { triggerRules: [weaponRule('pre-roll', 'target', 'melee', { defenseModifier: 1 }, { damageTypes: ['hieb', 'slashing', 'stich', 'piercing'] })] }],
  ['faehigkeit-runtime-tag-contract', 'Runtime tag contract', '', {}, 0, { triggerRules: [weaponRule('pre-roll', 'actor', 'melee', { attackModifier: 1 }, { requiredTargetTags: ['liegend'] }), weaponRule('pre-damage', 'actor', 'melee', { damageModifier: 1 }, { requiredTargetTags: ['liegend'] })] }]
];
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import {
  sanitizeCharacterCombatProfile, getSavingThrowTotal, getCombatInitiative
} from '../modules/combat/combat-profile-model.js';
import { CombatResolutionService, getCombatRollContext } from '../modules/combat/combat-resolution-service.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { getCombatAttackNumbers } from '../modules/combat/combat-attack-evaluation.js';
import { collectApplicableCombatRules, mergeCombatRuleEffects } from '../modules/combat/combat-trigger-rules.js';

const definition = id => CONTRACT_DEFINITIONS.find(entry => entry[0] === `faehigkeit-${id}`);
const asTrait = ([id, name, description, mechanics, cost, extra = {}]) => ({
  id: `development-trait-${id}`, name, description, mechanics, cost,
  active: true, type: 'trait', triggerRules: extra.triggerRules || []
});
const base = () => sanitizeCharacterCombatProfile({
  hitPoints: { current: 3 }, progression: { level: 1, development: { mode: 'purchase' } },
  attributes: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(key => ({ key, score: 10 }))
});
const withAbility = id => sanitizeCharacterCombatProfile({ ...base(), quirks: [asTrait(definition(id))] });
const source = profile => ({ ...profile, characterId: 'self', totalDefense: 10 });
const attacker = (weaponType = 'sword', damageType = 'hieb', kind = 'weapon', mode = 'weapon-attack') => ({
  ...base(), characterId: 'enemy', attackModifier: 0, damageModifier: 0, totalDefense: 10,
  profileActionKind: kind, actionResolutionMode: mode,
  weapon: { id: 'enemy-weapon', weaponType, damageType, attackAttribute: 'strength', damageFormula: '1d6' }
});
const phase = (profile, actor, name, actionKind = actor.profileActionKind, state = {}) => mergeCombatRuleEffects(collectApplicableCombatRules({
  phase: name, actionKind, state: { actorProfile: actor, targetProfile: source(profile), ...state },
  sources: [{ actorId: 'self', profile: source(profile), relationToActor: 'enemy', relationToTarget: 'self' }]
}));
test('pain and acid drills filter the actual damage type and save attribute in both saving phases', () => {
  for (const [id, attribute, bonus, positiveTypes, negativeTypes] of [
    ['physical-save-contract', 'constitution', 1, ['Hieb', 'slashing', 'Stich', 'piercing', 'Wucht', 'bludgeoning'], ['Feuer', 'Säure']],
    ['acid-save-contract', 'dexterity', 2, ['Säure', 'saeure', 'acid'], ['Feuer', 'Wucht']]
  ]) {
    const profile = withAbility(id);
    for (const phaseName of ['pre-roll', 'pre-secondary-save']) {
      for (const damageType of positiveTypes) {
        const actor = { ...attacker('sword', damageType, 'spell', 'saving-throw'), actionSaveAttribute: attribute };
        assert.equal(phase(profile, actor, phaseName, 'spell', { saveAttribute: attribute }).savingThrowModifier, bonus, `${id}/${phaseName}/${damageType}`);
        assert.equal(phase(profile, actor, phaseName, 'spell', { saveAttribute: 'wisdom' }).savingThrowModifier, 0);
      }
      for (const damageType of negativeTypes) assert.equal(phase(profile,
        { ...attacker('sword', damageType, 'spell', 'saving-throw'), actionSaveAttribute: attribute }, phaseName, 'spell', { saveAttribute: attribute }).savingThrowModifier, 0);
    }
    assert.equal(getCombatRollContext(attacker('sword', positiveTypes[0], 'spell', 'spell-attack'), source(profile)).preRollEffects.savingThrowModifier, 0);
    assert.equal(phase(profile, attacker('sword', positiveTypes[0]), 'on-concentration-check').savingThrowModifier, 0);
  }
  assert.equal(getCombatInitiative(withAbility('physical-save-contract')), getCombatInitiative(base()) - 1);
});

test('structured action damage outranks an unrelated held weapon, including elemental phobias and explicit action selection', () => {
  const pain = withAbility('physical-save-contract');
  const fireFear = sanitizeCharacterCombatProfile({ ...base(), quirks: [DEVELOPMENT_TRAITS.find(entry => entry.id === 'development-trait-feuer-phobie')] });
  const frostFear = sanitizeCharacterCombatProfile({ ...base(), quirks: [DEVELOPMENT_TRAITS.find(entry => entry.id === 'development-trait-frost-phobie')] });
  const pureFire = { ...attacker('sword', 'Hieb', 'spell', 'saving-throw'), actionSaveAttribute: 'constitution',
    selectedAction: { effects: [{ type: 'damage', damageType: 'Feuer', formula: '1d6' }] } };
  assert.equal(getCombatRollContext(pureFire, source(pain)).preRollEffects.savingThrowModifier, 0);
  assert.equal(getCombatRollContext(pureFire, source(fireFear)).safeRollMode, 'disadvantage');
  assert.equal(getCombatRollContext(pureFire, source(frostFear)).safeRollMode, 'normal');
  const pureCold = { ...pureFire, weapon: { ...pureFire.weapon, damageType: 'Feuer' },
    selectedAction: { effects: [{ type: 'damage', damageType: 'Kälte', formula: '1d6' }] } };
  assert.equal(getCombatRollContext(pureCold, source(fireFear)).safeRollMode, 'normal');
  assert.equal(getCombatRollContext(pureCold, source(frostFear)).safeRollMode, 'disadvantage');
  const fallbackFire = { ...pureFire, selectedAction: undefined, actionEffects: [{ type: 'damage', damageType: 'Feuer' }] };
  assert.equal(getCombatRollContext(fallbackFire, source(fireFear)).safeRollMode, 'disadvantage');
  const explicitEmpty = { ...pureFire, selectedAction: { effects: [] }, actionEffects: [{ type: 'damage', damageType: 'Feuer' }] };
  assert.equal(getCombatRollContext(explicitEmpty, source(pain)).preRollEffects.savingThrowModifier, 1);
  assert.equal(getCombatRollContext(explicitEmpty, source(fireFear)).safeRollMode, 'normal');
  const nonDamaging = { ...explicitEmpty, selectedAction: { effects: [], nonDamaging: true } };
  assert.equal(getCombatRollContext(nonDamaging, source(pain)).preRollEffects.savingThrowModifier, 0);
  const conditionOnly = { ...pureFire, selectedAction: { effects: [{ type: 'apply-condition', condition: { name: 'Vergiftet' } }] } };
  assert.equal(getCombatRollContext(conditionOnly, source(pain)).preRollEffects.savingThrowModifier, 0);
  const primaryDamage = { ...conditionOnly, selectedAction: { ...conditionOnly.selectedAction, formula: '1d6' } };
  assert.equal(getCombatRollContext(primaryDamage, source(pain)).preRollEffects.savingThrowModifier, 0);
  const primaryWithExtra = { ...pureFire, selectedAction: { ...pureFire.selectedAction, formula: '1d6' } };
  assert.equal(getCombatRollContext(primaryWithExtra, source(pain)).preRollEffects.savingThrowModifier, 0);
  assert.equal(getCombatRollContext(primaryWithExtra, source(fireFear)).safeRollMode, 'disadvantage');
  const typedWeapon = { ...attacker('sword', 'Stich', 'technique', 'saving-throw'), actionSaveAttribute: 'constitution',
    selectedAction: { effects: [{ type: 'damage', damageType: 'physisch', inheritWeaponDamageType: true }] } };
  assert.equal(getCombatRollContext(typedWeapon, source(pain)).preRollEffects.savingThrowModifier, 1);
  const mixed = { ...typedWeapon, selectedAction: { effects: [
    { type: 'damage', damageType: 'physisch', inheritWeaponDamageType: true },
    { type: 'damage', damageType: 'Feuer' }
  ] } };
  assert.equal(getCombatRollContext(mixed, source(pain)).preRollEffects.savingThrowModifier, 1);
  assert.equal(getCombatRollContext(mixed, source(fireFear)).safeRollMode, 'disadvantage');
});

test('glancing-shot and rolling defenses reduce only the authored physical type and range, including techniques', () => {
  for (const kind of ['weapon', 'technique']) {
    const piercing = withAbility('ranged-reduction-contract'), blunt = withAbility('melee-reduction-contract');
    for (const type of ['Stich', 'piercing']) assert.equal(phase(piercing, attacker('bow', type, kind), 'pre-damage').damageReduction, 1);
    assert.equal(phase(piercing, attacker('sword', 'Stich', kind), 'pre-damage').damageReduction, 0);
    assert.equal(phase(piercing, attacker('bow', 'Feuer', kind), 'pre-damage').damageReduction, 0);
    for (const type of ['Wucht', 'bludgeoning']) assert.equal(phase(blunt, attacker('mace', type, kind), 'pre-damage').damageReduction, 1);
    assert.equal(phase(blunt, attacker('bow', 'Wucht', kind), 'pre-damage').damageReduction, 0);
    assert.equal(phase(blunt, attacker('mace', 'Stich', kind), 'pre-damage').damageReduction, 0);
    for (const profile of [piercing, blunt]) assert.equal(phase(profile, attacker('bow', 'Stich', 'spell', 'spell-attack'), 'pre-damage', 'spell').damageReduction, 0);
  }
});

test('structured weapon damage replaces the implicit base and inherited physical damage remains explicit', () => {
  const profile = withAbility('ranged-reduction-contract');
  const flamingArrow = { ...attacker('bow', 'Stich'),
    selectedAction: { effects: [{ type: 'damage', damageType: 'Feuer', formula: '1d4' }] } };
  assert.equal(phase(profile, flamingArrow, 'pre-damage').damageReduction, 0);
  const mixedArrow = { ...flamingArrow, selectedAction: { effects: [
    { type: 'damage', formula: '1d6', inheritWeaponDamageType: true }, ...flamingArrow.selectedAction.effects
  ] } };
  assert.equal(phase(profile, mixedArrow, 'pre-damage').damageReduction, 1);
  const spell = { ...flamingArrow, profileActionKind: 'spell', actionResolutionMode: 'spell-attack' };
  assert.equal(phase(profile, spell, 'pre-damage').damageReduction, 0);
});

test('physical self-costs do not grant target protection and target damage is independent of effect order', () => {
  const profile = withAbility('ranged-reduction-contract');
  for (const reversed of [false, true]) for (const physicalTarget of [false, true]) {
    const effects = [
      { type: 'damage', target: 'self', damageType: physicalTarget ? 'Feuer' : 'Stich', formula: '1d4' },
      { type: 'damage', target: 'target', damageType: physicalTarget ? 'Stich' : 'Feuer', formula: '1d6' }
    ];
    const actor = { ...attacker('bow', 'Stich'), selectedAction: { effects: reversed ? effects.reverse() : effects } };
    assert.equal(phase(profile, actor, 'pre-damage').damageReduction, physicalTarget ? 1 : 0);
  }
  const conditionOnly = { ...attacker('sword', 'Hieb', 'spell', 'saving-throw'), actionSaveAttribute: 'constitution', selectedAction: { effects: [
    { type: 'damage', target: 'self', damageType: 'Hieb', formula: '1d4' },
    { type: 'apply-condition', target: 'target', condition: { name: 'Vergiftet' } }
  ] } };
  assert.equal(getCombatRollContext(conditionOnly, source(withAbility('physical-save-contract'))).preRollEffects.savingThrowModifier, 0);
});

test('the real resolver gives pain-breathing no benefit against condition-only CON saves but applies it to explicit physical damage', async () => {
  const target = resolveCombatProfile({ id: 'self', name: 'Geübte Testfigur', combatProfile: {
    ...withAbility('physical-save-contract'), hitPoints: { current: 20, maximumOverride: 20 }
  } });
  const resolveAction = async effects => {
    const actor = resolveCombatProfile({ id: 'enemy', name: 'Prüfende Figur', combatProfile: {
      ...base(), hitPoints: { current: 20, maximumOverride: 20 },
      weapons: [{ id: 'sword', name: 'Schwert', equipped: true, weaponType: 'sword', damageFormula: '1d6', damageType: 'Hieb' }],
      abilities: [{ id: 'physical-save', name: 'Körperliche Prüfung', active: true, combatUsable: true,
        delivery: 'spell', resolutionType: 'saving-throw', saveAttribute: 'constitution',
        rollFormula: '1d6', damageType: 'Hieb', effects }]
    } }, { actionId: 'ability:physical-save' });
    const requests = [];
    const dice = {
      async rollAttack(request) { requests.push(request); return { natural: 2, dice: [2], keptDice: [2], total: 2 + request.modifier }; },
      async rollDamage() { return { notation: '1d6', keptDice: [4], total: 4, modifier: 0 }; }
    };
    const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
    return { result, request: requests[0], actor };
  };
  const conditionOnly = await resolveAction([{ type: 'apply-condition', condition: { name: 'Geprüft' } }]);
  assert.equal(conditionOnly.actor.actionResolutionMode, 'saving-throw');
  assert.equal(conditionOnly.actor.actionSaveAttribute, 'constitution');
  assert.equal(conditionOnly.actor.weapon.damageType, 'Hieb');
  assert.equal(conditionOnly.result.damage, null);
  assert.equal(conditionOnly.request.modifier, getSavingThrowTotal(target, 'constitution'));
  assert.equal(conditionOnly.result.ruleApplications.some(entry => entry.ruleId.startsWith('physical-save-contract')), false);
  const physical = await resolveAction([{ type: 'damage', formula: '1d6', damageType: 'Hieb' }]);
  assert.equal(physical.request.modifier, conditionOnly.request.modifier + 1);
  assert.equal(physical.result.damage.damageType, 'Hieb');
  assert.ok(physical.result.damage.total > 0);
  assert.ok(physical.result.ruleApplications.some(entry => entry.ruleId.startsWith('physical-save-contract')));
});

test('blade distance raises the actual attack defense only against slashing or piercing melee weapons', () => {
  const target = source(withAbility('defense-contract'));
  for (const kind of ['weapon', 'technique']) for (const damageType of ['Hieb', 'slashing', 'Stich', 'piercing']) {
    const actor = attacker('sword', damageType, kind), context = getCombatRollContext(actor, target);
    assert.equal(context.preRollEffects.defenseModifier, 1);
    assert.equal(getCombatAttackNumbers(actor, target, context).targetDefense, 11);
  }
  for (const actor of [attacker('mace', 'Wucht'), attacker('bow', 'Stich'), attacker('sword', 'Hieb', 'spell', 'spell-attack')]) {
    const context = getCombatRollContext(actor, target);
    assert.equal(context.preRollEffects.defenseModifier, 0);
    assert.equal(getCombatAttackNumbers(actor, target, context).targetDefense, 10);
  }
});

test('reading openings follows active runtime prone state while inactive copies and mere historical prose do not qualify', () => {
  const actor = { ...attacker(), ...source(withAbility('runtime-tag-contract')), characterId: 'self' };
  const target = { ...attacker(), characterId: 'enemy', quirks: [], conditions: [] };
  const getEffects = (currentTarget, phaseName = 'pre-roll', currentActor = actor) => mergeCombatRuleEffects(collectApplicableCombatRules({
    phase: phaseName, actionKind: currentActor.profileActionKind,
    state: { actorProfile: currentActor, targetProfile: currentTarget },
    sources: [{ actorId: 'self', profile: actor, relationToActor: 'self', relationToTarget: 'enemy' }]
  }));
  const active = { ...target, temporaryConditions: [{ id: 'prone-now', name: 'Liegend', active: true }] };
  assert.equal(getEffects(active).attackModifier, 1);
  assert.equal(getEffects(active, 'pre-damage').damageModifier, 1);
  for (const current of [target,
    { ...target, description: 'Lag früher liegend auf dem Boden.' },
    { ...target, temporaryConditions: [{ id: 'prone-now', name: 'Liegend', active: false }] },
    { ...target, conditions: [{ id: 'prone-now', name: 'Liegend', active: true }], temporaryConditions: [{ id: 'prone-now', name: 'Liegend', active: false }] }
  ]) assert.equal(getEffects(current).attackModifier, 0);
  assert.equal(getEffects(active, 'pre-roll', { ...actor, weapon: { ...actor.weapon, weaponType: 'bow' } }).attackModifier, 0);
  assert.equal(getEffects(active, 'pre-roll', { ...actor, profileActionKind: 'spell', actionResolutionMode: 'spell-attack' }).attackModifier, 0);
});
