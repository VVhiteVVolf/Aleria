import { getSavingThrowTotal, resolveSavingThrowRollMode } from './combat-profile-model.js';
import { normalizeCombatEffects } from './combat-effect-model.js';
import { getConditionConcentrationOwnerId } from './combat-condition-lifecycle.js';
import { collectApplicableCombatRules, markCombatRuleApplications, mergeCombatRuleEffects } from './combat-trigger-rules.js';

// Resolve one affected participant, including the acting figure when a health
// cost or reflected effect hits them. The caller owns the final state snapshots.
export async function resolveCombatConcentration({ profile, counterpart, hitPoints, conditions,
  damage = 0, interrupted = false, context, dice, container, allowResultEffects = true }) {
  const result = { snapshot: null, conditions, saves: [], applications: [], conflicts: [], resultEffects: [] };
  const defeated = Number(hitPoints.current) <= 0;
  if (!profile.concentration || !(damage > 0 || interrupted || defeated)) return result;
  const before = { ...profile.concentration };
  let retained = !interrupted && !defeated;
  if (retained && damage > 0) {
    if (typeof dice.rollSavingThrow !== 'function') throw new Error('Für die Konzentrationsprüfung fehlt ein Rettungswurf.');
    const { actionKind, profileActionId, ruleSources, rulePeriods, usedRuleFrequencyKeys, attack } = context;
    const actorIsRecipient = String(profile.characterId) === String(context.actorId);
    const sources = actorIsRecipient ? ruleSources.map(source => ({ ...source,
      sourceRole: source.sourceRole === 'actor' ? 'target' : source.sourceRole === 'target' ? 'actor' : source.sourceRole,
      relationToActor: source.relationToTarget, relationToTarget: source.relationToActor,
      distanceToActor: source.distanceToTarget, distanceToTarget: source.distanceToActor
    })) : ruleSources;
    const applications = collectApplicableCombatRules({ phase: 'on-concentration-check', actionKind, profileActionId,
      sources, periods: rulePeriods, usedFrequencyKeys: usedRuleFrequencyKeys,
      state: { actorProfile: counterpart, targetProfile: profile, ...attack, damage, concentration: before } });
    markCombatRuleApplications(applications, usedRuleFrequencyKeys);
    const effects = mergeCombatRuleEffects(applications);
    result.applications = applications;
    result.conflicts = effects.conflicts || [];
    if (allowResultEffects) result.resultEffects = applications.flatMap(application =>
      normalizeCombatEffects(application.resultEffects || []).map(effect => actorIsRecipient
        ? { ...effect, target: effect.target === 'self' ? 'target' : 'self' } : effect));
    const dc = Math.max(10, Math.floor(damage / 2));
    const modifier = getSavingThrowTotal(profile, 'constitution') + Number(effects.savingThrowModifier || 0);
    const roll = await dice.rollSavingThrow({ modifier,
      rollMode: resolveSavingThrowRollMode(profile, 'constitution', effects.rollMode || 'normal'),
      actorName: counterpart.name, targetName: profile.name, container });
    retained = Number(roll.total) >= dc;
    if (effects.outcome === 'force-save-success') retained = true;
    if (effects.outcome === 'force-save-failure') retained = false;
    result.saves.push({ type: 'concentration', actorId: profile.characterId, attributeKey: 'constitution', dc,
      naturalRoll: Number(roll.natural), diceResults: Array.isArray(roll.dice) ? roll.dice.slice() : [],
      keptDice: Array.isArray(roll.keptDice) ? roll.keptDice.slice() : [], modifier, total: Number(roll.total),
      succeeded: retained, rollId: roll.id || '', visualMode: roll.visualMode || 'text' });
  }
  result.snapshot = { before, after: retained ? before : null,
    reason: defeated ? 'defeated' : interrupted ? 'interrupted' : retained ? 'save-succeeded' : 'save-failed' };
  if (!retained) result.conditions = conditions.filter(condition => getConditionConcentrationOwnerId(condition)
    ? getConditionConcentrationOwnerId(condition) !== String(profile.characterId)
    : condition.durationModel?.kind !== 'concentration');
  return result;
}
