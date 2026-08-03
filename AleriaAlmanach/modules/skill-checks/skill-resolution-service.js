import {
  buildSkillRollNotation,
  classifySkillCheck,
  getChallengeAffinityModifier,
  isSuccessfulSkillOutcome,
  normalizeSkillCheckSettings,
  resolveSkillModifier
} from './skill-check-model.js?v=20260803-skill-checks-v2';
import {
  collectApplicableCombatRules,
  markCombatRuleApplications,
  mergeCombatRuleEffects
} from '../combat/combat-trigger-rules.js?v=20260803-rule-integrity-v1';

export const SKILL_EVALUATION_RULES_VERSION = 'skill-evaluation-2';

function createResolutionId() {
  return globalThis.crypto?.randomUUID?.() || `skill-evaluation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mergeRollModes(...values) {
  const modes = values.map(value => ['advantage', 'disadvantage'].includes(value) ? value : 'normal');
  const advantage = modes.includes('advantage');
  const disadvantage = modes.includes('disadvantage');
  if (advantage === disadvantage) return 'normal';
  return advantage ? 'advantage' : 'disadvantage';
}

function forceSkillOutcome(outcome, forced) {
  if (forced === 'force-skill-success') return outcome === 'critical-failure' ? 'success' : (outcome === 'critical-success' ? outcome : 'success');
  if (forced === 'force-skill-failure') return outcome === 'critical-success' ? 'failure' : (outcome === 'critical-failure' ? outcome : 'failure');
  return outcome;
}

function ledger(applications, before, after) {
  return applications.map(application => ({ ...application, before: { ...before }, after: { ...after } }));
}

export class SkillResolutionService {
  constructor(diceAdapter) {
    this.dice = diceAdapter;
  }

  async resolve({ actor, settings: sourceSettings, challenge = null, actorPersistence = null } = {}, options = {}) {
    const settings = normalizeSkillCheckSettings(sourceSettings);
    const skill = resolveSkillModifier(actor, settings.skillId);
    const affinityModifier = challenge ? getChallengeAffinityModifier(challenge, settings.skillId) : 0;
    const sources = Array.isArray(options.ruleSources) && options.ruleSources.length
      ? options.ruleSources
      : [{
          actorId: String(actor.id || ''), actorName: String(actor.name || ''), profile: skill.profile,
          sourceRole: 'actor', relationToActor: 'self', relationToTarget: 'enemy',
          distanceToActor: 0, distanceToTarget: null, selectedRuleIds: []
        }];
    const periods = options.rulePeriods || {};
    const usedRuleFrequencyKeys = options.usedRuleFrequencyKeys instanceof Set
      ? new Set(options.usedRuleFrequencyKeys)
      : new Set(Array.isArray(options.usedRuleFrequencyKeys) ? options.usedRuleFrequencyKeys : []);
    const preApplications = collectApplicableCombatRules({
      phase: 'pre-roll', actionKind: 'skill', sources, periods, usedFrequencyKeys: usedRuleFrequencyKeys
    });
    markCombatRuleApplications(preApplications, usedRuleFrequencyKeys);
    const preEffects = mergeCombatRuleEffects(preApplications);
    const rollMode = mergeRollModes(settings.rollMode, preEffects.rollMode);
    const baseModifier = skill.modifier + settings.customModifier + affinityModifier;
    const preModifier = baseModifier + preEffects.skillModifier;
    const difficulty = challenge?.difficulty ?? settings.difficulty;
    const notation = buildSkillRollNotation(preModifier, rollMode);
    options.onPhase?.({ phase: 'skill', notation, skill, difficulty });
    const roll = await this.dice.rollSkill({
      modifier: preModifier,
      rollMode,
      notation,
      actorName: actor.name,
      skillName: skill.definition.label,
      container: options.container
    });
    const natural = Number(roll.natural || 0);
    const firstOutcome = classifySkillCheck({ natural, total: roll.total, difficulty });
    const postApplications = collectApplicableCombatRules({
      phase: 'post-roll', actionKind: 'skill', sources, periods, usedFrequencyKeys: usedRuleFrequencyKeys,
      state: {
        hit: isSuccessfulSkillOutcome(firstOutcome),
        criticalSuccess: firstOutcome === 'critical-success',
        criticalFailure: firstOutcome === 'critical-failure'
      }
    });
    markCombatRuleApplications(postApplications, usedRuleFrequencyKeys);
    const postEffects = mergeCombatRuleEffects(postApplications);
    const total = Number(roll.total) + postEffects.skillModifier;
    const calculatedOutcome = classifySkillCheck({ natural, total, difficulty });
    const outcome = forceSkillOutcome(calculatedOutcome, postEffects.outcome);
    const ruleApplications = [
      ...ledger(preApplications, { modifier: baseModifier, rollMode: settings.rollMode }, { modifier: preModifier, rollMode }),
      ...ledger(postApplications, { total: Number(roll.total), outcome: firstOutcome }, { total, outcome })
    ];
    return {
      schemaVersion: 2,
      rulesVersion: SKILL_EVALUATION_RULES_VERSION,
      resolutionId: createResolutionId(),
      actorId: String(actor.id || ''),
      actorName: String(actor.name || 'Unbekannt'),
      actorPersistence,
      skillId: settings.skillId,
      skillName: skill.definition.label,
      skillSource: skill.source,
      profileSkillName: skill.profileSkill?.name || '',
      attributeKey: skill.definition.attributeKey,
      profileModifier: skill.modifier,
      customModifier: settings.customModifier,
      affinityModifier,
      ruleModifier: preEffects.skillModifier + postEffects.skillModifier,
      totalModifier: preModifier + postEffects.skillModifier,
      difficulty,
      rollMode,
      notation,
      natural,
      diceResults: Array.isArray(roll.dice) ? roll.dice.slice() : [],
      keptDice: Array.isArray(roll.keptDice) ? roll.keptDice.slice() : [],
      rollId: String(roll.id || ''),
      total,
      outcome,
      targetChallengeId: challenge?.id || '',
      targetChallengeAuthor: challenge?.authorName || '',
      targetCommentId: challenge?.commentId || '',
      targetSegmentIndex: challenge?.segmentIndex ?? null,
      targetContributionRank: challenge?.contributionRank ?? null,
      ruleApplications,
      usedRuleFrequencyKeys: [...usedRuleFrequencyKeys],
      narration: null,
      resolvedAt: new Date().toISOString()
    };
  }
}

export const skillResolutionInternals = Object.freeze({ mergeRollModes, forceSkillOutcome });
