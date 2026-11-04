import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCombatProfile, validateCombatActorProfile, getCombatActorValidationMessage } from '../modules/combat/combat-profile-resolver.js';
import { COMBAT_WAIT_ACTION } from '../modules/combat/combat-wait-action.js';
import { getVoluntaryCombatActionBlock, canUseCombatReaction } from '../modules/combat/combat-action-permission.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { collectSkillSupportOptions } from '../modules/skill-checks/skill-support-options.js';
import { collectApplicableCombatRules } from '../modules/combat/combat-trigger-rules.js';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { createManualCombatCondition } from '../modules/combat-status/combat-status-model.js';

const stunned = { id: 'stunned', name: 'Betäubt', active: true, mechanics: { blocksActions: true } };
function figure(id, extra = {}) {
  return { id, name: id, combatProfile: {
    hitPoints: { current: 20, maximumOverride: 20 }, armorClass: { override: 10 },
    weapons: [{ id: 'blade', name: 'Klinge', equipped: true, attackBonus: 20, damageFormula: '1d6' }], ...extra
  } };
}
const profile = (id, extra, options) => resolveCombatProfile(figure(id, extra), options);
const dice = () => ({ rolls: 0,
  async rollAttack({ modifier = 0 }) { this.rolls++; return { natural: 10, dice: [10], total: 10 + modifier }; },
  async rollSkill({ modifier = 0 }) { this.rolls++; return { natural: 10, dice: [10], total: 10 + modifier }; },
  async rollSavingThrow({ modifier = 0 }) { this.rolls++; return { natural: 10, dice: [10], total: 10 + modifier }; },
  async rollDamage() { return { keptDice: [4], notation: '1d6', total: 4 }; }
});
const guard = (activation = 'reaction', extra = {}) => ({ id: 'guard', name: 'Reaktive Abwehr', actionScope: 'global',
  phase: 'post-roll', condition: 'would-hit', activation, sourceRelation: 'self', recipient: 'target',
  effects: { defenseModifier: 99 }, ...extra });
const support = (p, ids) => ({ actorId: p.characterId, actorName: p.name, profile: p, sourceRole: 'support',
  relationToActor: 'ally', relationToTarget: 'enemy', distanceToActor: 0, selectedRuleIds: ids });

test('zero HP and blocked actions still permit a procedural wait without attack, healing or resource gains', async () => {
  for (const conditions of [[], [stunned]]) {
    const actor = profile('actor', { hitPoints: { current: 0, maximumOverride: 20 }, conditions }, { actionId: COMBAT_WAIT_ACTION.id });
    actor.weaponUnavailable = true;
    assert.equal(validateCombatActorProfile(actor).ready, true);
    const roll = dice(), result = await new CombatResolutionService(roll).resolveAttack({ actor, target: actor });
    assert.equal(roll.rolls, 0);
    assert.equal(result.targetSnapshot.hitPointsAfter, 0);
    assert.equal(result.damage, null);
    assert.equal(result.actorResourceSnapshot, null, 'A procedural wait performs no resource operation.');
  }
});

test('procedural wait has no weapon requirement and never silently ignores an explicitly failed equipment change', () => {
  const actor = profile('actor', { conditions: [stunned] }, { actionId: COMBAT_WAIT_ACTION.id });
  actor.weapon = null;
  assert.equal(validateCombatActorProfile(actor).ready, true);
  actor.equipmentPreparation = { error: 'Der geplante Schildwechsel ist nicht möglich.' };
  assert.equal(validateCombatActorProfile(actor).ready, false);
  assert.match(getCombatActorValidationMessage(actor), /geplante Schildwechsel/);
});

test('actual attacks remain blocked by zero HP and by active conditions, with the authored zero HP exception retained', async () => {
  const target = profile('target');
  for (const extra of [{ hitPoints: { current: 0, maximumOverride: 20 } }, { conditions: [stunned] }]) {
    const actor = profile('actor', extra), roll = dice();
    await assert.rejects(new CombatResolutionService(roll).resolveAttack({ actor, target }), /handlungsunfähig|Betäubt/);
    assert.equal(roll.rolls, 0);
  }
  const exception = profile('actor', { hitPoints: { current: 0, maximumOverride: 20 }, combat: { canActAtZeroHitPoints: true } });
  assert.equal(validateCombatActorProfile(exception).ready, true);
  assert.equal(canUseCombatReaction(exception), true);
  assert.equal(getVoluntaryCombatActionBlock({ quirks: [], conditions: [] }), null, 'Unknown HP on a partial source are not guessed as 0.');
});

test('blocked or defeated defenders cannot spend a selected defensive reaction; passive protection remains', async () => {
  const actor = profile('actor');
  for (const extra of [{ conditions: [stunned] }, { hitPoints: { current: 0, maximumOverride: 20 } }]) {
    const target = profile('target', { ...extra, quirks: [{ name: 'Abwehr', active: true, triggerRules: [guard()] }] });
    const result = await new CombatResolutionService(dice()).resolveAttack({ actor, target }, { ruleSources: [
      { actorId: 'target', selectedRuleIds: ['guard'] }
    ] });
    assert.equal(result.attack.hit, true);
    assert.equal(result.ruleApplications.some(application => application.ruleId === 'guard'), false);
  }
  const protectedTarget = profile('target', { conditions: [stunned], quirks: [{ name: 'Passiver Schutz', active: true, triggerRules: [guard('passive')] }] });
  const result = await new CombatResolutionService(dice()).resolveAttack({ actor, target: protectedTarget });
  assert.equal(result.attack.hit, false);
  assert.ok(result.ruleApplications.some(application => application.ruleId === 'guard'));
});

test('fresh incapacitation in the same hit blocks late voluntary reactions without removing a passive survival rule', async () => {
  for (const activation of ['reaction', 'passive']) {
    const target = profile('target', { hitPoints: { current: 2, maximumOverride: 20 }, quirks: [{ name: 'Letzter Schutz', active: true,
      triggerRules: [guard(activation, { phase: 'on-defeat', condition: 'always', effects: {}, resultEffects: [{ type: 'healing', target: 'target', on: 'always', amount: 5 }] })] }] });
    const result = await new CombatResolutionService(dice()).resolveAttack({ actor: profile('actor'), target }, { ruleSources: [{ actorId: 'target', selectedRuleIds: ['guard'] }] });
    assert.equal(result.targetSnapshot.hitPointsAfter, activation === 'passive' ? 5 : 0);
    assert.equal(result.ruleApplications.some(application => application.ruleId === 'guard'), activation === 'passive');
  }
});

test('a condition applied by the hit immediately blocks post-condition and concentration reactions', async () => {
  const actor = { ...profile('actor'), selectedAction: { name: 'Betäubender Treffer', effects: [
    { type: 'damage', amount: 4, target: 'target', on: 'always' },
    { type: 'apply-condition', target: 'target', on: 'always', condition: stunned }
  ] } };
  const target = { ...profile('target', { quirks: [{ name: 'Antwort', active: true, triggerRules: [
    guard('reaction', { phase: 'on-condition-applied', condition: 'always', effects: {}, resultEffects: [{ type: 'healing', target: 'target', on: 'always', amount: 5 }] }),
    guard('reaction', { id: 'concentration-aid', phase: 'on-concentration-check', condition: 'always', effects: { savingThrowModifier: 99 } })
  ] }] }), concentration: { id: 'concentration', actionName: 'Schutz' } };
  const result = await new CombatResolutionService(dice()).resolveAttack({ actor, target }, { ruleSources: [{ actorId: 'target', selectedRuleIds: ['guard', 'concentration-aid'] }] });
  assert.equal(result.ruleApplications.some(application => ['guard', 'concentration-aid'].includes(application.ruleId)), false);
  assert.equal(result.targetSnapshot.hitPointsAfter, 16);
});

test('free voluntary skill and attribute attempts cannot bypass incapacity, while required saves can still be rolled', async () => {
  for (const extra of [{ conditions: [stunned] }, { hitPoints: { current: 0, maximumOverride: 20 } }]) {
    const actor = figure('actor', extra);
    for (const skillId of ['investigation', 'attribute:strength']) {
      const roll = dice();
      await assert.rejects(new SkillResolutionService(roll).resolve({ actor, settings: { skillId } }), /handlungsunfähig|Betäubt/);
      assert.equal(roll.rolls, 0);
    }
    const roll = dice(), result = await new SkillResolutionService(roll).resolve({ actor, settings: { skillId: 'save:constitution' } });
    assert.equal(roll.rolls, 1);
    assert.equal(result.checkType, 'saving-throw');
  }
});

test('stunned allies neither appear as selectable skill support nor secretly add their reaction bonus', async () => {
  const actor = profile('actor'), helper = profile('helper', { conditions: [stunned], quirks: [{ name: 'Beistand', active: true,
    triggerRules: [{ id: 'help', actionScope: 'global', activation: 'reaction', phase: 'pre-roll', sourceRelation: 'ally', recipient: 'actor',
      actionKinds: ['skill'], skillIds: ['investigation'], effects: { skillModifier: 5 } }] }] });
  const settings = { skillId: 'investigation' }, options = { actorProfile: actor, ruleSources: [support(helper, ['help'])] };
  assert.deepEqual(collectSkillSupportOptions({ actor, settings }, options), []);
  const result = await new SkillResolutionService(dice()).resolve({ actor, settings }, options);
  assert.equal(result.ruleModifier, 0);
});

test('inactive blockers do not restrict actions or reactions and a bare reaction source is not treated as defeated', () => {
  assert.equal(getVoluntaryCombatActionBlock(profile('actor', { conditions: [{ ...stunned, active: false }] })), null);
  const result = collectApplicableCombatRules({ phase: 'post-roll', state: { hit: true }, sources: [{ actorId: 'bare',
    relationToTarget: 'self', selectedRuleIds: ['guard'], profile: { quirks: [{ name: 'Schutz', active: true, triggerRules: [guard()] }] } }] });
  assert.equal(result.length, 1);
});

test('an explicitly required voice survives storage and blocks only that spell, ability or technique for a mute figure', () => {
  const mute = DEVELOPMENT_TRAITS.find(entry => entry.id === 'development-trait-stumm');
  assert.ok(mute);
  const extra = { quirks: [mute],
    abilities: [{ id: 'voice-ability', name: 'Ruf', active: true, combatUsable: true, activationType: 'action',
      requiresVoice: true, effects: [{ type: 'temporary-hit-points', amount: 2, target: 'self', on: 'always' }] }],
    techniques: [{ id: 'voice-technique', name: 'Kampfruf', active: true, requiresVoice: true, damageModel: { mode: 'none' },
      effects: [{ type: 'temporary-hit-points', amount: 2, target: 'self', on: 'always' }] }],
    magic: { enabled: true, spells: [{ id: 'voice-spell', name: 'Klang', prepared: true, level: 0, requiresVoice: true,
      effects: [{ type: 'damage', amount: 2, target: 'target', on: 'always' }] },
    { id: 'silent-spell', name: 'Lautlose Geste', prepared: true, level: 0,
      effects: [{ type: 'damage', amount: 2, target: 'target', on: 'always' }] }] }
  };
  for (const actionId of ['ability:voice-ability', 'technique:voice-technique', 'spell:voice-spell']) {
    const actor = profile('mute', extra, { actionId });
    assert.equal(actor.selectedAction.requiresVoice, true, actionId);
    assert.equal(validateCombatActorProfile(actor).ready, false, actionId);
    assert.match(getCombatActorValidationMessage(actor), /Stimme/, actionId);
  }
  assert.equal(validateCombatActorProfile(profile('mute', extra, { actionId: 'spell:silent-spell' })).ready, true);
  assert.equal(validateCombatActorProfile(profile('mute', extra, { actionId: COMBAT_WAIT_ACTION.id })).ready, true);
});

test('a launched area action finishes its remaining targets after its own stun, while a new action stays blocked', async () => {
  const actor = profile('caster', { abilities: [{ id: 'blast', name: 'Erschöpfende Welle', active: true, combatUsable: true, delivery: 'spell',
    resolutionType: 'automatic', effects: [{ type: 'damage', target: 'target', on: 'always', amount: 3 },
      { type: 'apply-condition', target: 'self', on: 'always', condition: stunned }] }] }, { actionId: 'ability:blast' });
  const service = new CombatResolutionService(dice());
  const first = await service.resolveAttack({ actor, target: profile('target-a') });
  const conditions = first.actorConditionSnapshot.after;
  const after = { ...actor, conditions, temporaryConditions: conditions };
  await assert.rejects(service.resolveAttack({ actor: after, target: profile('new-target') }), /Betäubt/);
  const continued = await service.resolveAttack({ actor: after, target: profile('target-b') }, {
    startedAction: first, skipResourceCosts: true, skipSelfEffects: true, skipAmmunition: true, skipChanneling: true
  });
  assert.equal(continued.targetSnapshot.hitPointsAfter, 17);
});

test('explicit sleeping presets block voluntary actions and reactions, including old copies, without guessing from prose', async () => {
  const sleeping = createManualCombatCondition({ presetId: 'sleeping', durationKind: 'actor-comments', durationAmount: 1 }, { id: 'sleep' });
  assert.equal(sleeping.mechanics.blocksActions, true);
  const oldCopy = { ...sleeping, mechanics: {} };
  for (const condition of [sleeping, oldCopy]) {
    const actor = profile('sleeper', { conditions: [condition] });
    assert.equal(actor.conditions[0].presetId, 'sleeping');
    assert.equal(validateCombatActorProfile(actor).ready, false);
    assert.equal(canUseCombatReaction(actor), false);
    await assert.rejects(new SkillResolutionService(dice()).resolve({ actor, settings: { skillId: 'investigation' } }), /Schlafend/);
    const wait = profile('sleeper', { conditions: [condition] }, { actionId: COMBAT_WAIT_ACTION.id });
    assert.equal(validateCombatActorProfile(wait).ready, true);
    const save = await new SkillResolutionService(dice()).resolve({ actor, settings: { skillId: 'save:wisdom' } });
    assert.equal(save.checkType, 'saving-throw');
  }
  assert.equal(validateCombatActorProfile(profile('descriptive', { conditions: [{ name: 'Schlafend wirkt er nur', active: true, mechanics: {} }] })).ready, true);
  assert.equal(validateCombatActorProfile(profile('awake', { conditions: [{ ...oldCopy, active: false }] })).ready, true);
  for (const presetId of ['blinded', 'restrained', 'wet']) {
    assert.equal(validateCombatActorProfile(profile('partial', { conditions: [{ presetId, name: presetId, active: true, mechanics: {} }] })).ready, true);
  }
});
