import { getSavingThrowTotal, resolveSavingThrowRollMode } from './combat-profile-model.js';
import { rollProfileD20, naturalRollReceipt, succeedsProfileSavingThrow } from './combat-natural-roll-policy.js';
import { collectApplicableCombatRules, markCombatRuleApplications, mergeCombatRuleEffects } from './combat-trigger-rules.js';

// Secondary saves can follow the primary hit or a complete attack sequence.
// Conditions bind to the actual participants, never to a character name.
export async function resolveTechniqueSecondarySave({ dice, actor, target, attack, timing,
  ruleSources, ruleProfileState, actionKind, profileActionId, rulePeriods, usedRuleFrequencyKeys, options }) {
  const save = actor.selectedAction?.secondarySave;
  if (!save?.enabled || (save.timing || 'after-hit') !== timing
    || (save.requiresHit !== false && !attack.hit)) return { applications: [] };
  if (typeof dice.rollSavingThrow !== 'function') throw new Error('Der Rettungswurf der Technik fehlt.');
  const applications = collectApplicableCombatRules({ phase: 'pre-secondary-save', actionKind, profileActionId,
    sources: ruleSources, periods: rulePeriods, usedFrequencyKeys: usedRuleFrequencyKeys,
    state: { ...ruleProfileState, saveAttribute: save.attributeKey } });
  markCombatRuleApplications(applications, usedRuleFrequencyKeys);
  const ruleEffects = mergeCombatRuleEffects(applications);
  const modifier = getSavingThrowTotal(target, save.attributeKey, save) + ruleEffects.savingThrowModifier;
  const roll = await rollProfileD20(dice, 'rollSavingThrow', { modifier, rollMode: resolveSavingThrowRollMode(target, save.attributeKey, ruleEffects.rollMode),
    actorName: actor.name, targetName: target.name, container: options.container }, target);
  const dc = Number(save.dc) || 8;
  const succeeded = succeedsProfileSavingThrow(roll, dc);
  const condition = (template, bindTarget = false) => !succeeded && template?.name ? {
    ...template, id: `${template.id}-${globalThis.crypto.randomUUID()}`, sourceConditionId: template.id,
    sourceActorId: actor.characterId, source: actor.selectedAction.name, active: true,
    durationModel: template.durationModel || { kind: 'actor-comments', remainingActorComments: 1 }, remainingActorComments: 1,
    ...(bindTarget ? { triggerRules: (template.triggerRules || []).map(rule => ({ ...rule, requiredTargetId: target.characterId })) } : {})
  } : null;
  return { applications, save: { ...naturalRollReceipt(roll), attributeKey: save.attributeKey, dc, naturalRoll: Number(roll.natural),
    diceResults: Array.isArray(roll.dice) ? roll.dice.slice() : [], keptDice: Array.isArray(roll.keptDice) ? roll.keptDice.slice() : [],
    modifier, total: Number(roll.total), succeeded, rollId: roll.id || '', visualMode: roll.visualMode || 'text',
    ...(timing === 'after-sequence' ? { timing } : {}) },
    targetCondition: condition(save.failureCondition), actorCondition: condition(save.actorFailureCondition, true) };
}
