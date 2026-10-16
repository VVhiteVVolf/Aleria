import {
  buildSkillRollNotation,
  classifySkillCheck,
  getChallengeAffinityModifier,
  isSuccessfulSkillOutcome,
  normalizeSkillCheckSettings,
  resolveSkillModifier
} from './skill-check-model.js?v=20261016-guided-checks-v1';
import { getAuraTargetMechanics, getActiveRollModes } from '../combat/combat-profile-model.js?v=20260928-equipment-art-v4';
import { mergeRollModes } from '../combat/combat-roll-mode.js?v=20260906-effect-rolls-v1';
import {
  collectApplicableCombatRules,
  markCombatRuleApplications,
  mergeCombatRuleEffects
} from '../combat/combat-trigger-rules.js?v=20260928-equipment-art-v4';
import { consumeCombatRuleResources } from '../combat/combat-rule-consumption.js?v=20260928-equipment-art-v4';
import { getCheckProfileRollModes } from './attribute-check-model.js?v=20261015-check-options-v1';

export const SKILL_EVALUATION_RULES_VERSION = 'skill-evaluation-5';

function createResolutionId() {
  return globalThis.crypto?.randomUUID?.() || `skill-evaluation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function forceSkillOutcome(outcome, forced, checkType = 'skill') {
  if (checkType === 'saving-throw') {
    if (forced === 'force-save-success') return 'success';
    if (forced === 'force-save-failure') return 'failure';
    return outcome;
  }
  if (forced === 'force-skill-success') return outcome === 'critical-failure' ? 'success' : (outcome === 'critical-success' ? outcome : 'success');
  if (forced === 'force-skill-failure') return outcome === 'critical-success' ? 'failure' : (outcome === 'critical-failure' ? outcome : 'failure');
  return outcome;
}

function ledger(applications, before, after) {
  return applications.map(application => ({ ...application, before: { ...before }, after: { ...after } }));
}

function buildSkillAuraApplications(sources = [], checkType = 'skill', actorProfile = {}) {
  return sources.flatMap(source => {
    // Self aura mechanics and ongoing encounter auras already belong to the
    // sheet total. Selecting support must not apply that same aura twice.
    if (source.sourceRole === 'actor' || (actorProfile.conditions || []).some(condition =>
      condition.active !== false && condition.encounterAura === true
      && String(condition.auraSourceActorId) === String(source.actorId))) return [];
    const selected = new Set(Array.isArray(source.selectedRuleIds) ? source.selectedRuleIds : []);
    if (source.sourceRole === 'support' && !selected.has('@aura:actor')) return [];
    const mechanics = getAuraTargetMechanics(source.profile, {
      relation: source.relationToActor,
      distanceMeters: source.distanceToActor
    });
    const savingThrow = checkType === 'saving-throw';
    const skillModifier = Number(mechanics[savingThrow ? 'savingThrow' : 'skill'] || 0);
    const rollMode = savingThrow ? 'normal' : mechanics.skillRollMode || mechanics.attackRollMode || 'normal';
    if (!skillModifier && rollMode === 'normal') return [];
    return [{
      applicationKey: `${source.actorId}:aura:skill-actor`,
      usedKey: '', sourceActorId: String(source.actorId || ''), sourceActorName: String(source.actorName || ''),
      sourceRole: source.sourceRole, relationToActor: source.relationToActor, relationToTarget: source.relationToTarget,
      entryKind: 'aura', entryId: 'aura', entryName: source.profile?.aura?.name || 'Aura & Präsenz',
      ruleId: '@aura:actor', ruleName: `${source.profile?.aura?.name || 'Aura'} auf Fertigkeitsprobe`,
      phase: 'pre-roll', activation: 'passive', frequency: 'always', condition: 'always', recipient: 'actor',
      authority: 'passive', authorityRank: 200, priority: -10,
      effects: { [savingThrow ? 'savingThrowModifier' : 'skillModifier']: skillModifier, rollMode, outcome: 'none' }, costs: [], consumesAbilityUse: false
    }];
  });
}

export function getSkillRollContext({ actor, settings: sourceSettings } = {}, options = {}) {
  const settings = normalizeSkillCheckSettings(sourceSettings);
  const skill = resolveSkillModifier(options.actorProfile || actor, settings.skillId);
  const checkType = skill.definition.checkType || 'skill';
  const actionKind = checkType === 'attribute' ? 'attribute-check' : checkType;
  const modifierKey = checkType === 'saving-throw' ? 'savingThrowModifier' : 'skillModifier';
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
    saveAttribute: checkType === 'saving-throw' ? skill.definition.attributeKey : '',
    actorProfile: skill.profile,
    targetProfile: options.targetProfile || null
  };
  const preApplications = collectApplicableCombatRules({
    phase: 'pre-roll', actionKind, sources, periods,
    usedFrequencyKeys: usedRuleFrequencyKeys, state: skillRuleState
  }).concat(buildSkillAuraApplications(sources, checkType, skill.profile));
  markCombatRuleApplications(preApplications, usedRuleFrequencyKeys);
  const preEffects = mergeCombatRuleEffects(preApplications);
  const profileRollModes = getCheckProfileRollModes(skill.profile, skill.definition, getActiveRollModes(skill.profile, 'skillRollMode'));
  const rollMode = mergeRollModes(profileRollModes, preApplications.map(application => application.effects?.rollMode));
  return { settings, skill, sources, periods, usedRuleFrequencyKeys, skillRuleState, preApplications, preEffects, profileRollModes, rollMode, checkType, actionKind, modifierKey };
}

export class SkillResolutionService {
  constructor(diceAdapter) {
    this.dice = diceAdapter;
  }

  async resolve({ actor, settings: sourceSettings, challenge = null, actorPersistence = null } = {}, options = {}) {
    const { settings, skill, sources, periods, usedRuleFrequencyKeys, skillRuleState, preApplications, preEffects, profileRollModes, rollMode, checkType, actionKind, modifierKey }
      = getSkillRollContext({ actor, settings: sourceSettings }, options);
    const affinityModifier = challenge ? getChallengeAffinityModifier(challenge, settings.skillId) : 0;
    const baseModifier = skill.modifier + settings.customModifier + affinityModifier;
    const preModifier = baseModifier + preEffects[modifierKey];
    const difficulty = options.opposedDifficulty != null && Number.isFinite(Number(options.opposedDifficulty))
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
    const firstOutcome = forceSkillOutcome(classifySkillCheck({ natural, total: roll.total, difficulty }), preEffects.outcome, checkType);
    const postApplications = collectApplicableCombatRules({
      phase: 'post-roll', actionKind, sources, periods, usedFrequencyKeys: usedRuleFrequencyKeys,
      state: {
        ...skillRuleState,
        hit: isSuccessfulSkillOutcome(firstOutcome),
        criticalSuccess: firstOutcome === 'critical-success',
        criticalFailure: firstOutcome === 'critical-failure'
      }
    });
    markCombatRuleApplications(postApplications, usedRuleFrequencyKeys);
    const postEffects = mergeCombatRuleEffects(postApplications);
    const total = Number(roll.total) + postEffects[modifierKey];
    const calculatedOutcome = classifySkillCheck({ natural, total, difficulty });
    const combinedEffects = mergeCombatRuleEffects([...preApplications, ...postApplications]);
    const outcome = forceSkillOutcome(calculatedOutcome, combinedEffects.outcome, checkType);
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
      checkType,
      skillName: skill.definition.label,
      skillSource: skill.source,
      profileSkillName: skill.profileSkill?.name || '',
      attributeKey: skill.definition.attributeKey,
      profileModifier: skill.modifier,
      customModifier: settings.customModifier,
      affinityModifier,
      ruleModifier: preEffects[modifierKey] + postEffects[modifierKey],
      totalModifier: preModifier + postEffects[modifierKey],
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
        ['post-roll', combinedEffects.conflicts]
      ].filter(([, conflicts]) => Array.isArray(conflicts) && conflicts.length).map(([phase, conflicts]) => ({ phase, applications: conflicts })),
      usedRuleFrequencyKeys: [...usedRuleFrequencyKeys],
      narration: null,
      resolvedAt: new Date().toISOString()
    };
  }
}

export const skillResolutionInternals = Object.freeze({ mergeRollModes, forceSkillOutcome });
