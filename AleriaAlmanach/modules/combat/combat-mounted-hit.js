import { resolveSkillModifier } from '../skill-checks/skill-check-model.js';
import { getVoluntaryCombatActionBlock, withCurrentCombatPermissionState } from './combat-action-permission.js';
import { getSavingThrowTotal } from './combat-profile-model.js';
import { normalizeRuntimeCondition } from './combat-condition-duration.js';
import { refreshRuntimeCondition } from './combat-condition-lifecycle.js';
import { rollCombatSecondarySave } from './combat-secondary-saving-throw.js';
import { getDismountSnapshot } from './combat-support-equipment.js';
import { collectApplicableCombatRules, markCombatRuleApplications, mergeCombatRuleEffects } from './combat-trigger-rules.js';

const landingContext = { saveTags: ['prone', 'forced-movement'] };

export function getMountedHitScores(profile) {
  const handling = resolveSkillModifier(profile, 'animal-handling').modifier;
  const acrobatics = resolveSkillModifier(profile, 'acrobatics').modifier;
  const dexterity = getSavingThrowTotal(profile, 'dexterity');
  // This is a Dexterity save. Training can replace its base, while a bonus
  // specifically against being knocked down still applies exactly once.
  const situational = getSavingThrowTotal(profile, 'dexterity', landingContext) - dexterity;
  return { seat: 10 + handling, landing: Math.max(dexterity, acrobatics) + situational,
    landingBase: acrobatics > dexterity ? 'acrobatics' : 'dexterity' };
}

export async function resolveMountedHits(context, hits, conditions) {
  const { target, actor } = context;
  const result = { checks: [], saves: [], applications: [], conditions, condition: null, snapshot: null };
  const classRules = (phase, current) => {
    const rules = collectApplicableCombatRules({
      phase, actionKind: context.actionKind, profileActionId: context.profileActionId,
      periods: context.rulePeriods, sources: context.ruleSources, usedFrequencyKeys: context.usedRuleFrequencyKeys,
      state: { ...context.ruleProfileState, actorProfile: actor, targetProfile: current }
    });
    markCombatRuleApplications(rules, context.usedRuleFrequencyKeys);
    result.applications.push(...rules);
    return rules;
  };
  if (!target.combat?.mounted || actor.characterId === target.characterId) return result;
  const previousIds = new Set((target.temporaryConditions || []).map(condition => condition.id));
  const knockdown = conditions.find(condition => !previousIds.has(condition.id) && condition.active !== false
    && (condition.presetId === 'prone' || /^(?:liegend|prone)$/i.test(condition.name)
      || String(condition.tags || '').split(/[,;·]/).some(tag => /^(?:liegend|prone)$/i.test(tag.trim()))));
  if (knockdown) {
    result.snapshot = getDismountSnapshot(target);
    result.checks.push({ outcome: 'knocked-down', reason: knockdown.name });
    return result;
  }
  for (const { index, damage } of hits) {
    const loss = damage.reduce((sum, hit) => sum
      + Math.max(0, hit.before.current - hit.after.current) + Math.max(0, hit.before.temporary - hit.after.temporary), 0);
    if (!loss) continue;
    const current = withCurrentCombatPermissionState(target, damage.at(-1).after, result.conditions);
    const scores = getMountedHitScores(current);
    const dc = Math.max(10, Math.floor(loss / 2));
    const unable = getVoluntaryCombatActionBlock(current);
    const seatBonus = unable ? 0 : mergeCombatRuleEffects(classRules('mount-seat', current)).savingThrowModifier;
    const check = { hitIndex: index, damage: loss, dc, passive: scores.seat + seatBonus, outcome: 'seated' };
    result.checks.push(check);
    if (!unable && check.passive >= dc) continue;
    result.snapshot = getDismountSnapshot(target);
    if (!unable) {
      const { save, applications } = await rollCombatSecondarySave({ ...context, target: current }, {
        attributeKey: 'dexterity', modifier: scores.landing, dc, ...landingContext, mountLanding: true });
      result.saves.push({ ...save, type: 'mount-landing', actorId: target.characterId, hitIndex: index, base: scores.landingBase });
      result.applications.push(...applications);
      if (save.succeeded) {
        check.outcome = 'landed';
        classRules('mount-landed', current);
        break;
      }
    } else check.reason = unable.message;
    check.outcome = 'prone';
    result.condition = normalizeRuntimeCondition({ id: `mount-fall-${globalThis.crypto.randomUUID()}`,
      sourceConditionId: 'mount-fall', sourceActorId: target.characterId, source: 'Sturz vom Reittier',
      name: 'Liegend', presetId: 'prone', tags: 'liegend', active: true, blockedResource: 'bonus-action',
      description: 'Die Bonusaktion entfällt im nächsten eigenen Beitrag.',
      durationModel: { kind: 'actor-comments', remainingActorComments: 1 } });
    result.conditions = refreshRuntimeCondition(result.conditions, result.condition);
    break;
  }
  return result;
}
