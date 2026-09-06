import {
  buildSkillRollNotation,
  classifySkillCheck,
  getChallengeAffinityModifier,
  isSuccessfulSkillOutcome,
  normalizeSkillCheckSettings,
  resolveSkillModifier
} from './skill-check-model.js?v=20260906-effect-rolls-v1';
import { getAuraTargetMechanics, getActiveRollModes } from '../combat/combat-profile-model.js?v=20260906-effect-rolls-v1';
import { mergeRollModes } from '../combat/combat-roll-mode.js?v=20260906-effect-rolls-v1';
import {
  collectApplicableCombatRules,
  markCombatRuleApplications,
  mergeCombatRuleEffects
} from '../combat/combat-trigger-rules.js?v=20260906-effect-rolls-v1';
import { consumeCombatRuleResources } from '../combat/combat-rule-consumption.js?v=20260906-effect-rolls-v1';

export const SKILL_EVALUATION_RULES_VERSION = 'skill-evaluation-3';

function createResolutionId() {
  return globalThis.crypto?.randomUUID?.() || `skill-evaluation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function forceSkillOutcome(outcome, forced) {
  if (forced === 'force-skill-success') return outcome === 'critical-failure' ? 'success' : (outcome === 'critical-success' ? outcome : 'success');
  if (forced === 'force-skill-failure') return outcome === 'critical-success' ? 'failure' : (outcome === 'critical-failure' ? outcome : 'failure');
  return outcome;
}

function ledger(applications, before, after) {
  return applications.map(application => ({ ...application, before: { ...before }, after: { ...after } }));
}

function buildSkillAuraApplications(sources = []) {
  return sources.flatMap(source => {
    const selected = new Set(Array.isArray(source.selectedRuleIds) ? source.selectedRuleIds : []);
    if (source.sourceRole === 'support' && !selected.has('@aura:actor')) return [];
    const mechanics = getAuraTargetMechanics(source.profile, {
      relation: source.relationToActor,
      distanceMeters: source.distanceToActor
    });
    const skillModifier = Number(mechanics.skill || 0);
    const rollMode = mechanics.skillRollMode || mechanics.attackRollMode || 'normal';
    if (!skillModifier && rollMode === 'normal') return [];
    return [{
      applicationKey: `${source.actorId}:aura:skill-actor`,
      usedKey: '', sourceActorId: String(source.actorId || ''), sourceActorName: String(source.actorName || ''),
      sourceRole: source.sourceRole, relationToActor: source.relationToActor, relationToTarget: source.relationToTarget,
      entryKind: 'aura', entryId: 'aura', entryName: source.profile?.aura?.name || 'Aura & Präsenz',
      ruleId: '@aura:actor', ruleName: `${source.profile?.aura?.name || 'Aura'} auf Fertigkeitsprobe`,
      phase: 'pre-roll', activation: 'passive', frequency: 'always', condition: 'always', recipient: 'actor',
      authority: 'passive', authorityRank: 200, priority: -10,
      effects: { skillModifier, rollMode, outcome: 'none' }, costs: [], consumesAbilityUse: false
    }];
  });
}

export function getSkillRollContext({ actor, settings: sourceSettings } = {}, options = {}) {
  const settings = normalizeSkillCheckSettings(sourceSettings);
  const skill = resolveSkillModifier(options.actorProfile || actor, settings.skillId);
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
  const skillRuleState = {
    skillId: settings.skillId,
    skillName: skill.definition.label,
    actorProfile: skill.profile,
    targetProfile: options.targetProfile || null
  };
  const preApplications = collectApplicableCombatRules({
    phase: 'pre-roll', actionKind: 'skill', sources, periods,
    usedFrequencyKeys: usedRuleFrequencyKeys, state: skillRuleState
  }).concat(buildSkillAuraApplications(sources));
  markCombatRuleApplications(preApplications, usedRuleFrequencyKeys);
  const preEffects = mergeCombatRuleEffects(preApplications);
  const profileRollModes = getActiveRollModes(skill.profile, 'skillRollMode');
  const rollMode = mergeRollModes(profileRollModes, preApplications.map(application => application.effects?.rollMode));
  return { settings, skill, sources, periods, usedRuleFrequencyKeys, skillRuleState, preApplications, preEffects, profileRollModes, rollMode };
}

export class SkillResolutionService {
  constructor(diceAdapter) {
    this.dice = diceAdapter;
  }

  async resolve({ actor, settings: sourceSettings, challenge = null, actorPersistence = null } = {}, options = {}) {
    const { settings, skill, sources, periods, usedRuleFrequencyKeys, skillRuleState, preApplications, preEffects, profileRollModes, rollMode }
      = getSkillRollContext({ actor, settings: sourceSettings }, options);
    const affinityModifier = challenge ? getChallengeAffinityModifier(challenge, settings.skillId) : 0;
    const baseModifier = skill.modifier + settings.customModifier + affinityModifier;
    const preModifier = baseModifier + preEffects.skillModifier;
    const difficulty = Number.isFinite(Number(options.opposedDifficulty))
      ? Number(options.opposedDifficulty)
      : (challenge?.difficulty ?? settings.difficulty);
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
        ...skillRuleState,
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
      ...ledger(preApplications, { modifier: baseModifier, rollMode: mergeRollModes(profileRollModes) }, { modifier: preModifier, rollMode }),
      ...ledger(postApplications, { total: Number(roll.total), outcome: firstOutcome }, { total, outcome })
    ];
    const ruleResourceSnapshots = consumeCombatRuleResources(ruleApplications, sources, {
      actorId: String(actor.id || '')
    });
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
      authoredDifficulty: challenge?.difficulty ?? null,
      opposedDefense: options.opposedDefense || null,
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
      ruleResourceSnapshots,
      ruleConflicts: [
        ['pre-roll', preEffects.conflicts],
        ['post-roll', postEffects.conflicts]
      ].filter(([, conflicts]) => Array.isArray(conflicts) && conflicts.length).map(([phase, conflicts]) => ({ phase, applications: conflicts })),
      usedRuleFrequencyKeys: [...usedRuleFrequencyKeys],
      narration: null,
      resolvedAt: new Date().toISOString()
    };
  }
}

export const skillResolutionInternals = Object.freeze({ mergeRollModes, forceSkillOutcome });
