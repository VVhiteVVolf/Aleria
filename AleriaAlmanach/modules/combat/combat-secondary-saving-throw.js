import { getSavingThrowRollModes, getSavingThrowTotal } from './combat-profile-model.js';
import { naturalRollReceipt, rollProfileD20, succeedsProfileSavingThrow } from './combat-natural-roll-policy.js';
import { mergeRestrictedRollModes } from './combat-roll-mode.js';
import { collectApplicableCombatRules, markCombatRuleApplications, mergeCombatRuleEffects } from './combat-trigger-rules.js';

function saved(roll, dc, outcome) {
  if (outcome === 'force-save-success') return true;
  if (outcome === 'force-save-failure') return false;
  return succeedsProfileSavingThrow(roll, dc);
}

// The submitted dice are evidence. Difficulty, eligible rules, the final
// outcome and its consequences are calculated again by the same server code.
export async function rollCombatSecondarySave(context, config) {
  const { dice, actor, target, ruleSources, ruleProfileState, actionKind, profileActionId,
    rulePeriods, usedRuleFrequencyKeys, options } = context;
  const { attributeKey } = config;
  const collect = (phase, state = {}) => {
    const rules = collectApplicableCombatRules({ phase, actionKind, profileActionId, sources: ruleSources,
      periods: rulePeriods, usedFrequencyKeys: usedRuleFrequencyKeys,
      state: { ...ruleProfileState, actorProfile: actor, targetProfile: target, saveAttribute: attributeKey,
        saveContext: { ...config, actionKind }, ...state } });
    markCombatRuleApplications(rules, usedRuleFrequencyKeys);
    return rules;
  };
  const before = collect('pre-secondary-save');
  const pre = mergeCombatRuleEffects(before);
  const baseModifier = config.modifier ?? getSavingThrowTotal(target, attributeKey, config);
  const modifier = baseModifier + pre.savingThrowModifier + Number(context.savingThrowAuraModifier || 0);
  const rollMode = mergeRestrictedRollModes([getSavingThrowRollModes(target, attributeKey),
    before.map(rule => rule.effects.rollMode)], pre);
  const roll = await rollProfileD20(dice, 'rollSavingThrow', { modifier, rollMode,
    actorName: actor.name, targetName: target.name, container: options?.container }, target);
  const dc = (Number(config.dc) || 8) + pre.spellSaveDcModifier;
  const initial = saved(roll, dc, pre.outcome);
  const after = collect('post-secondary-save', { saveSucceeded: initial, hit: !initial });
  const post = mergeCombatRuleEffects(after);
  const applications = [...before, ...after];
  const combined = mergeCombatRuleEffects(applications);
  const total = Number(roll.total) + post.savingThrowModifier;
  const finalDc = dc + post.spellSaveDcModifier;
  return { applications, save: { ...naturalRollReceipt(roll), attributeKey, dc: finalDc, naturalRoll: Number(roll.natural),
    diceResults: Array.isArray(roll.dice) ? roll.dice.slice() : [], keptDice: Array.isArray(roll.keptDice) ? roll.keptDice.slice() : [],
    modifier: modifier + post.savingThrowModifier, total, rollMode, succeeded: saved({ ...roll, total }, finalDc, combined.outcome),
    ...(combined.outcome.startsWith('force-save-') ? { outcome: combined.outcome } : {}),
    ...(combined.conflicts.length ? { conflicts: combined.conflicts } : {}),
    rollId: roll.id || '', visualMode: roll.visualMode || 'text' } };
}
