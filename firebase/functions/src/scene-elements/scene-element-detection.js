import { SkillResolutionService } from '../generated/skill-checks/skill-resolution-service.js';
import { isSuccessfulSkillOutcome } from '../generated/skill-checks/skill-check-model.js';
import { getVoluntaryCombatActionBlock } from '../generated/combat/combat-action-permission.js';
import { getHealthTaskError } from '../generated/character-health/health-trait-policy.js';
import { deriveCombatRuleFrequencyKeys } from '../generated/combat/combat-trigger-rules.js';
import { getCombatRuleAbilityUseRequests } from '../generated/combat/combat-rule-consumption.js';
import { applyCombatAbilityUse } from '../generated/combat/combat-ability-uses.js';
import { getPersistentCombatResources } from '../generated/combat/combat-action-economy.js';
import { withProtectedRecordRevisions } from '../mechanics/protected-record-revisions.js';
import { getSceneRecoveryDayKey } from '../generated/scene-time/scene-recovery-day.js';

// Detection uses the ordinary resolver, including trait rules and natural-one
// replacements. Its receipt is replayed without creating another actor turn.
export async function resolveSceneElementDetection({ activation, evaluation, target, history, entryId, revealId, dice, now }) {
  const passive = evaluation.receipts.filter(receipt => receipt.type === 'passive' && receipt.satisfied)
    .flatMap(receipt => receipt.matches.map(actor => ({ ...actor, kind: 'passive', skillId: receipt.skillId, minimum: receipt.minimum })))
    .sort((a, b) => b.total - a.total || a.actorId.localeCompare(b.actorId))[0];
  if (passive) return { detected: true, proof: passive, resolution: null, update: null };
  if (!activation.detection.enabled) return { detected: false, proof: { kind: 'disabled' }, resolution: null, update: null };
  const error = getHealthTaskError(target.profile, { sense: activation.detection.requiredSense }) || getVoluntaryCombatActionBlock(target.profile)?.message;
  if (error) return { detected: false, proof: { kind: 'unavailable', reason: error }, resolution: null, update: null };
  const day = getSceneRecoveryDayKey(entryId, history);
  const resolution = await new SkillResolutionService(dice).resolve({ actor: target.actor,
    actorPersistence: target.persistence,
    settings: { skillId: activation.detection.skillId, difficulty: activation.detection.difficulty,
      ...(activation.detection.requiredSense ? { requiredSense: activation.detection.requiredSense } : {}) }
  }, { actorProfile: target.profile, usedRuleFrequencyKeys: deriveCombatRuleFrequencyKeys(history),
    rulePeriods: { scene: entryId, day, comment: revealId } });
  resolution.serverValidated = true;
  resolution.validatedAt = new Date(now).toISOString();
  resolution.resolvedAt = resolution.validatedAt;
  const update = {};
  const resource = resolution.ruleResourceSnapshots?.find(snapshot => snapshot.sourceActorId === target.actorId);
  if (resource && target.persistence.persistent) update['combatProfile.resources'] = getPersistentCombatResources(target.profile.resources, resource.after);
  let abilities = target.profile.abilities;
  const abilitySnapshots = [];
  for (const requested of getCombatRuleAbilityUseRequests(resolution.ruleApplications)) {
    const consumed = applyCombatAbilityUse(abilities, `ability:${requested.abilityId}`, day);
    if (!consumed.sufficient) throw new Error(`${requested.ruleName} hat keine Nutzung mehr übrig.`);
    abilities = consumed.abilities;
    if (consumed.changed) abilitySnapshots.push({ sourceActorId: target.actorId, applicationKey: requested.applicationKey,
      before: consumed.beforeAbilities, after: consumed.abilities, change: consumed.use });
  }
  if (abilitySnapshots.length) {
    resolution.ruleAbilitySnapshots = abilitySnapshots;
    if (target.persistence.persistent) update['combatProfile.abilities'] = abilities;
  }
  return { detected: isSuccessfulSkillOutcome(resolution.outcome), resolution,
    proof: { kind: 'roll', actorId: target.actorId, name: target.name, skillId: resolution.skillId,
      skillName: resolution.skillName, total: resolution.total, minimum: resolution.difficulty,
      natural: resolution.natural, dice: resolution.diceResults, modifier: resolution.totalModifier, rollMode: resolution.rollMode, outcome: resolution.outcome },
    update: Object.keys(update).length ? withProtectedRecordRevisions(target.record, update, ['combatProfile'], now) : null };
}
