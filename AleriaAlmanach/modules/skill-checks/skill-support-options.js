import { collectApplicableCombatRules } from '../combat/combat-trigger-rules.js';
import { consumeCombatRuleResources, getCombatRuleAbilityUseRequests } from '../combat/combat-rule-consumption.js';
import { applyCombatAbilityUse } from '../combat/combat-ability-uses.js';
import { getSkillRollContext } from './skill-resolution-service.js?v=20261016-check-policy-v1';

export const skillSupportOptionKey = option => `${option.sourceActorId}:${option.ruleId}`;

function affectsCheck(application, context) {
  const effects = application.effects || {};
  const namespace = context.checkType === 'saving-throw' ? 'save' : 'skill';
  return application.recipient === 'actor' && (
    Number(effects[context.modifierKey] || 0) > 0
    || effects.rollMode === 'advantage'
    || effects.outcome === `force-${namespace}-success`
  );
}

// Ask the same rule engine as the eventual roll, including conditional rules
// that may activate after its result. No resources are spent by this preview.
export function collectSkillSupportOptions(request, options = {}) {
  const context = getSkillRollContext(request, options);
  const applications = [...context.preApplications];
  for (const [hit, criticalSuccess, criticalFailure] of [[true, false, false], [false, false, false], [true, true, false], [false, false, true]]) {
    applications.push(...collectApplicableCombatRules({
      phase: 'post-roll', actionKind: context.actionKind, sources: context.sources,
      periods: context.periods, usedFrequencyKeys: context.usedRuleFrequencyKeys,
      state: { ...context.skillRuleState, hit, criticalSuccess, criticalFailure }
    }));
  }
  const unique = new Map();
  for (const application of applications) {
    const source = context.sources.find(source => String(source.actorId) === application.sourceActorId);
    if (!source || !['self', 'ally'].includes(source.relationToActor) || source.sourceRole === 'target') continue;
    if (application.activation !== 'reaction' && application.ruleId !== '@aura:actor') continue;
    if (!affectsCheck(application, context)) continue;
    const option = { ...application, source };
    if (canSelectSkillSupport([option], context.periods.day)) unique.set(skillSupportOptionKey(option), option);
  }
  return [...unique.values()];
}

export function canSelectSkillSupport(options, recoveryDayKey = '') {
  const sources = [...new Map(options.map(option => [option.source.actorId, option.source])).values()];
  try {
    consumeCombatRuleResources(options, sources);
    const abilities = new Map(sources.map(source => [String(source.actorId), source.profile.abilities]));
    for (const request of getCombatRuleAbilityUseRequests(options)) {
      const use = applyCombatAbilityUse(abilities.get(request.sourceActorId), `ability:${request.abilityId}`, recoveryDayKey);
      if (!use.sufficient) return false;
      abilities.set(request.sourceActorId, use.abilities);
    }
    return true;
  } catch {
    return false;
  }
}

export function selectSkillSupportDefaults(options, selections = [], seenKeys = new Set(), recoveryDayKey = '') {
  const selectedKeys = new Set(selections.map(skillSupportOptionKey));
  // Keep explicit choices before adding newly applicable defaults. Competing
  // reactions cannot collectively spend more resources than the source owns.
  const ordered = [...options.filter(option => selectedKeys.has(skillSupportOptionKey(option))),
    ...options.filter(option => !selectedKeys.has(skillSupportOptionKey(option)) && !seenKeys.has(skillSupportOptionKey(option)))];
  const selected = [];
  for (const option of ordered) {
    if (selected.length < 20 && canSelectSkillSupport([...selected, option], recoveryDayKey)) selected.push(option);
  }
  options.forEach(option => seenKeys.add(skillSupportOptionKey(option)));
  return selected.map(option => {
    const persistence = option.source.profile.persistence || option.source.persistence || {};
    return { sourceActorId: option.sourceActorId, ruleId: option.ruleId,
      distanceMeters: option.source.distanceToActor ?? 0,
      sourcePersistence: { ...persistence } };
  });
}
