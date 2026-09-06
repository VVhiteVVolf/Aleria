import { buildAttackNotation, buildDamageNotation, combineDamageFormulas, evaluateAttackRoll } from './rules/combat-mvp-rules.js?v=20260905-party-combat-v1';
import {
  getAuraTargetMechanics,
  getBonusDamageFormulas,
  getSavingThrowTotal,
  getActiveRollModes,
  getSavingThrowRollModes,
  resolveSavingThrowRollMode
} from './combat-profile-model.js?v=20260906-effect-rolls-v1';
import { mergeRollModes } from './combat-roll-mode.js?v=20260906-effect-rolls-v1';
import {
  getCombatActorValidationMessage,
  validateCombatActorProfile,
  validateCombatTargetProfile
} from './combat-profile-resolver.js?v=20260906-effect-rolls-v1';
import {
  patchResolutionResourceState
} from './combat-state-model.js?v=20260906-effect-rolls-v1';
import {
  applyCombatHealing,
  applyTemporaryHitPoints,
  applyTypedCombatDamage,
  normalizeCombatEffect,
  normalizeCombatEffects
} from './combat-effect-model.js?v=20260906-effect-rolls-v1';
import { normalizeRuntimeCondition } from './combat-condition-duration.js?v=20260906-character-vitality-v1';
import { consumeCombatAmmunition } from './combat-ammunition.js?v=20260804-referee-v2';
import { consumeCombatRuleResources } from './combat-rule-consumption.js?v=20260906-effect-rolls-v1';
import { resolveCombatWard } from './combat-ward-resolution.js?v=20260906-character-vitality-v1';
import { refreshRuntimeCondition, getConditionConcentrationOwnerId } from './combat-condition-lifecycle.js?v=20260906-character-vitality-v1';
import {
  collectApplicableCombatRules,
  markCombatRuleApplications,
  mergeCombatRuleEffects,
  sanitizeCombatRuleEffects
} from './combat-trigger-rules.js?v=20260906-effect-rolls-v1';

export const COMBAT_EVALUATION_RULES_VERSION = 'combat-evaluation-6';

function normalizeRollMode(value) {
  return ['advantage', 'disadvantage'].includes(value) ? value : 'normal';
}

function createResolutionId() {
  return globalThis.crypto?.randomUUID?.() || `combat-evaluation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function evaluateSavingThrowRoll(roll, targetDefense) {
  const naturalRoll = Number(roll?.natural);
  const total = Number(roll?.total);
  if (!Number.isFinite(naturalRoll) || !Number.isFinite(total)) {
    throw new Error('Der Rettungswurf enth\u00e4lt kein g\u00fcltiges W20-Ergebnis.');
  }
  return {
    criticalFailure: false,
    criticalSuccess: false,
    hit: total >= Number(targetDefense)
  };
}

function buildDefaultRuleSources(actor, target, relationship) {
  return [{
    actorId: actor.characterId,
    actorName: actor.name,
    profile: actor,
    sourceRole: 'actor',
    relationToActor: 'self',
    relationToTarget: relationship,
    distanceToActor: 0,
    distanceToTarget: null,
    selectedRuleIds: []
  }, {
    actorId: target.characterId,
    actorName: target.name,
    profile: target,
    sourceRole: 'target',
    relationToActor: relationship,
    relationToTarget: 'self',
    distanceToActor: null,
    distanceToTarget: 0,
    selectedRuleIds: []
  }];
}

function normalizeRuleSources(actor, target, relationship, distanceMeters, supplied = []) {
  const sources = buildDefaultRuleSources(actor, target, relationship);
  sources[0].distanceToTarget = distanceMeters;
  sources[1].distanceToActor = distanceMeters;
  (Array.isArray(supplied) ? supplied : []).forEach(source => {
    const actorId = String(source?.actorId || '');
    const existing = sources.find(item => String(item.actorId) === actorId);
    if (existing) Object.assign(existing, source, { profile: source.profile || existing.profile });
    else if (source?.profile && actorId) sources.push({ passiveRulesAllowed: false, ...source });
  });
  return sources;
}

function applyOutcome(attack, outcome, savingThrowMode) {
  const next = { ...attack };
  if (outcome === 'force-critical-hit') {
    next.hit = true;
    next.criticalSuccess = !savingThrowMode;
    next.criticalFailure = false;
  }
  if (outcome === 'force-hit') {
    next.hit = true;
    next.criticalFailure = false;
  }
  if (outcome === 'force-miss') {
    next.hit = false;
    next.criticalSuccess = false;
  }
  if (outcome === 'force-save-success') {
    next.hit = false;
    next.criticalSuccess = false;
    next.saveSucceeded = true;
  }
  if (outcome === 'force-save-failure') {
    next.hit = true;
    next.criticalFailure = false;
    next.saveSucceeded = false;
  }
  if (savingThrowMode && !['force-save-success', 'force-save-failure'].includes(outcome)) {
    next.saveSucceeded = !next.hit;
  }
  return next;
}

function createRuleLedger(applications = [], phaseBefore = {}, phaseAfter = {}) {
  return applications.map(application => ({
    ...application,
    before: { ...phaseBefore },
    after: { ...phaseAfter }
  }));
}

function buildSupportAuraApplications(sources, actionKind) {
  const applications = [];
  sources.filter(source => source.sourceRole === 'support').forEach(source => {
    const selected = new Set(Array.isArray(source.selectedRuleIds) ? source.selectedRuleIds : []);
    [['@aura:actor', 'actor'], ['@aura:target', 'target']].forEach(([selectionId, recipient]) => {
      if (!selected.has(selectionId)) return;
      const relation = recipient === 'actor' ? source.relationToActor : source.relationToTarget;
      const distanceMeters = recipient === 'actor' ? source.distanceToActor : source.distanceToTarget;
      const mechanics = getAuraTargetMechanics(source.profile, { relation, distanceMeters });
      const effects = sanitizeCombatRuleEffects(recipient === 'actor' ? {
        attackModifier: Number(mechanics.attack || 0) + (['spell', 'prayer', 'song'].includes(actionKind) ? Number(mechanics.spellAttack || 0) : 0),
        spellSaveDcModifier: mechanics.spellSaveDc,
        damageModifier: mechanics.damage,
        rollMode: mechanics.attackRollMode
      } : {
        defenseModifier: mechanics.armorClass,
        savingThrowModifier: mechanics.savingThrow,
        rollMode: mechanics.attackRollMode
      });
      const hasEffect = Object.entries(effects).some(([key, value]) => key === 'rollMode'
        ? value !== 'normal'
        : (key === 'outcome' ? value !== 'none' : Number(value) !== 0));
      if (!hasEffect) return;
      applications.push({
        applicationKey: `${source.actorId}:aura:${recipient}`,
        usedKey: '',
        sourceActorId: String(source.actorId || ''),
        sourceActorName: String(source.actorName || ''),
        sourceRole: 'support',
        relationToActor: source.relationToActor,
        relationToTarget: source.relationToTarget,
        entryKind: 'aura',
        entryId: 'aura',
        entryName: source.profile?.aura?.name || 'Aura & Pr\u00e4senz',
        ruleId: selectionId,
        ruleName: `${source.profile?.aura?.name || 'Aura'} auf ${recipient === 'actor' ? 'handelnde Figur' : 'Ziel'}`,
        phase: 'pre-roll', activation: 'passive', frequency: 'always', condition: 'always',
        recipient, priority: -10, effects, costs: [], consumesAbilityUse: false
      });
    });
  });
  return applications;
}

function effectApplies(effect, attack, savingThrowMode, halfDamageOnSave = false) {
  if (effect.on === 'always') return true;
  if (effect.on === 'miss') return attack.hit === false;
  if (effect.on === 'save-success') return savingThrowMode && attack.saveSucceeded === true;
  if (effect.on === 'save-failure') return savingThrowMode && attack.saveSucceeded === false;
  // Ein 'hit'-Schadenseffekt greift regulär bei misslungenem Rettungswurf. Ist die Aktion als
  // "halber Schaden bei bestandenem Rettungswurf" markiert, muss derselbe Effekt auch beim
  // bestandenen Rettungswurf gefunden und angewendet werden (dann später halbiert).
  if (savingThrowMode && halfDamageOnSave && effect.type === 'damage' && attack.hit === false) return true;
  return attack.hit === true;
}

function hasHostileEffects(effects = []) {
  return effects.some(effect => ['damage', 'debuff'].includes(effect.type));
}

function updateResource(resources = [], resourceId = '', amount = 0, restore = false) {
  const before = (Array.isArray(resources) ? resources : []).map(resource => ({ ...resource }));
  let changed = null;
  const after = before.map(resource => {
    if (String(resource.id || '') !== String(resourceId || '')) return resource;
    const current = Number(resource.current) || 0;
    const maximum = Math.max(0, Number(resource.maximum) || 0);
    const nextCurrent = restore
      ? Math.min(maximum, current + Math.max(0, Number(amount) || 0))
      : Math.max(0, current - Math.max(0, Number(amount) || 0));
    changed = { resourceId: resource.id, name: resource.name, before: current, after: nextCurrent, maximum };
    return { ...resource, current: nextCurrent };
  });
  return { before, after, changed };
}

function buildChannelingResolution(actor, target, description, rollMode, requiredComments, commentKey = '') {
  const actionId = String(actor.profileActionId || '');
  const before = actor.channeling && String(actor.channeling.actionId || '') === actionId
    ? { ...actor.channeling }
    : null;
  if (commentKey && before?.lastProgressCommentKey === commentKey) {
    throw new Error('Die Kanalisierung kann pro Gesamtbeitrag nur einmal fortschreiten. Setze sie im nächsten Beitrag fort.');
  }
  const progress = Math.min(requiredComments, Math.max(0, Number(before?.progress) || 0) + 1);
  if (progress >= requiredComments) return null;
  const after = {
    actionId,
    actionName: actor.selectedAction?.name || actor.weapon?.name || 'Handlung',
    progress,
    requiredComments,
    lastProgressCommentKey: commentKey,
    startedByActorId: actor.characterId
  };
  return {
    schemaVersion: 4,
    rulesVersion: COMBAT_EVALUATION_RULES_VERSION,
    resolutionId: createResolutionId(),
    actionType: 'channeling',
    resolutionMode: 'channeling',
    actorId: actor.characterId,
    actorName: actor.name,
    targetId: target.characterId,
    targetName: target.name,
    actorPersistence: actor.persistence || null,
    targetPersistence: target.persistence || null,
    weapon: { ...(actor.weapon || {}) },
    weaponGrip: actor.weaponGrip || 'one-handed',
    profileActionId: actionId,
    profileActionKind: actor.profileActionKind || 'ability',
    resourceCosts: [],
    actorResourceSnapshot: null,
    actorChannelingSnapshot: { before, after },
    actorCombatProfile: actor.aiSnapshot || null,
    targetCombatProfile: target.aiSnapshot || null,
    originalDescription: String(description || '').slice(0, 5000),
    secondarySaves: [],
    followUpAttacks: [],
    effectResults: [],
    ruleApplications: [],
    ruleResourceSnapshots: [],
    ruleConflicts: [],
    usedRuleFrequencyKeys: [],
    attack: {
      notation: '', naturalRoll: null, diceResults: [], keptDice: [], modifier: 0, total: 0,
      targetDefense: Number(target.totalDefense) || 0, resolutionMode: 'channeling', rollOwner: 'actor',
      saveAttribute: '', saveSucceeded: null, forcedSuccess: false,
      rollMode: normalizeRollMode(rollMode), criticalSuccess: false, criticalFailure: false,
      hit: false, visualMode: 'automatic', rollId: ''
    },
    damage: null,
    targetSnapshot: {
      currentHitPoints: target.currentHitPoints,
      hitPointsBefore: target.currentHitPoints,
      hitPointsAfter: target.currentHitPoints,
      temporaryHitPointsBefore: target.temporaryHitPoints || 0,
      temporaryHitPointsAfter: target.temporaryHitPoints || 0,
      defeated: false,
      maximumHitPoints: target.maximumHitPoints,
      defense: Number(target.totalDefense) || 0,
      armorName: target.armor?.name || ''
    },
    resolvedAt: new Date().toISOString()
  };
}

export function getCombatRollContext(actor, target = {}, options = {}) {
  // Freie Wurfart-Vorgaben sind keine Regelquelle; die aufgelöste Technik darf eine vorgeben.
  const requestedRollMode = normalizeRollMode(actor.forcedRollMode);
  const relationship = options.relationship === 'ally' ? 'ally' : 'enemy';
  const distanceMeters = Number.isFinite(Number(options.distanceMeters)) ? Number(options.distanceMeters) : null;
  const auraContext = { relation: relationship, distanceMeters: options.distanceMeters };
  const actorAuraOnTarget = getAuraTargetMechanics(actor, auraContext);
  const targetAuraOnActor = getAuraTargetMechanics(target, auraContext);
  const resolutionMode = actor.actionResolutionMode || 'weapon-attack';
  const savingThrowMode = resolutionMode === 'saving-throw';
  const automaticMode = resolutionMode === 'automatic';
  const ruleSources = normalizeRuleSources(actor, target, relationship, distanceMeters, options.ruleSources);
  const usedRuleFrequencyKeys = options.usedRuleFrequencyKeys instanceof Set
    ? new Set(options.usedRuleFrequencyKeys)
    : new Set(Array.isArray(options.usedRuleFrequencyKeys) ? options.usedRuleFrequencyKeys : []);
  const rulePeriods = options.rulePeriods || {};
  const actionKind = actor.profileActionKind || 'weapon';
  const profileActionId = actor.profileActionId || '';
  const ruleProfileState = { actorProfile: actor, targetProfile: target };
  const preRollApplications = collectApplicableCombatRules({
    phase: 'pre-roll', actionKind, profileActionId, sources: ruleSources, periods: rulePeriods,
    usedFrequencyKeys: usedRuleFrequencyKeys, state: ruleProfileState
  }).concat(buildSupportAuraApplications(ruleSources, actionKind));
  markCombatRuleApplications(preRollApplications, usedRuleFrequencyKeys);
  const preRollEffects = mergeCombatRuleEffects(preRollApplications);
  const profileRollModes = [requestedRollMode, ...(savingThrowMode
    ? getSavingThrowRollModes(target, actor.actionSaveAttribute)
    : getActiveRollModes(actor))];
  const profileRollMode = mergeRollModes(profileRollModes);
  const auraRollMode = savingThrowMode ? actorAuraOnTarget.attackRollMode : targetAuraOnActor.attackRollMode;
  const safeRollMode = mergeRollModes(profileRollModes, auraRollMode, preRollApplications.map(application => application.effects?.rollMode));
  return { relationship, distanceMeters, auraContext, actorAuraOnTarget, targetAuraOnActor,
    resolutionMode, savingThrowMode, automaticMode, ruleSources, usedRuleFrequencyKeys, rulePeriods,
    actionKind, profileActionId, ruleProfileState, preRollApplications, preRollEffects,
    profileRollModes, profileRollMode, auraRollMode, safeRollMode };
}

export class CombatResolutionService {
  constructor(diceAdapter) {
    this.dice = diceAdapter;
  }

  async resolveAttack({ actor, target, description = '', rollMode = 'normal' } = {}, options = {}) {
    const actorCheck = validateCombatActorProfile(actor, { startedAction: options.startedAction });
    if (!actorCheck.ready) throw new Error(getCombatActorValidationMessage(actor, actorCheck));
    const targetCheck = validateCombatTargetProfile(target);
    if (!targetCheck.ready) throw new Error('Für das Ziel fehlt die Verteidigung in den Kampfdaten.');
    const structuredEffects = normalizeCombatEffects(actor.selectedAction?.effects || []);
    const actionEffects = structuredEffects.length ? structuredEffects : normalizeCombatEffects([{
      id: 'implicit-weapon-damage',
      type: 'damage',
      target: 'target',
      formula: actor.weapon?.damageFormula,
      damageType: actor.weapon?.damageType || 'physisch',
      magical: ['spell', 'prayer', 'song'].includes(actor.profileActionKind),
      on: 'hit'
    }]);
    const effectiveEffects = options.skipSelfEffects
      ? actionEffects.filter(effect => effect.target !== 'self')
      : actionEffects;
    const sustainsConcentration = actor.selectedAction?.concentration
      || effectiveEffects.some(effect => effect.concentration || effect.condition?.durationModel?.kind === 'concentration');
    const concentrationInstanceId = sustainsConcentration
      ? (options.skipSelfEffects ? actor.concentration?.instanceId : createResolutionId()) : '';
    if (actor.characterId === target.characterId && hasHostileEffects(effectiveEffects)) {
      throw new Error('Diese schädliche Handlung kann nicht gegen die handelnde Figur selbst gerichtet werden.');
    }

    const requiredChannelComments = options.skipChanneling ? 0 : Math.max(0, Math.trunc(Number(actor.selectedAction?.channelComments) || 0));
    if (requiredChannelComments > 0) {
      const channelingResolution = buildChannelingResolution(actor, target, description, 'normal', requiredChannelComments, String(options.rulePeriods?.comment || ''));
      if (channelingResolution) return channelingResolution;
    }

    const weapon = actor.weapon;
    const ammunition = options.skipAmmunition
      ? { changed: false, before: actor.inventory || { items: [] }, after: actor.inventory || { items: [] }, use: null }
      : consumeCombatAmmunition(actor.inventory || { items: [] }, weapon?.ammunition || null);
    const effectiveResourceCosts = options.skipResourceCosts ? [] : (actor.resourceCosts || []);
    const resourceCheck = patchResolutionResourceState({ resourceCosts: effectiveResourceCosts }, actor.resources || []);
    if (!resourceCheck.applied.sufficient) {
      const missing = resourceCheck.applied.missing;
      throw new Error(`${actor.name} hat nicht genug ${missing?.name || 'Ressourcen'} für diesen Angriff.`);
    }
    if (actor.selectedAction?.kind === 'equipment-switch') {
      const targetWeaponId = String(actor.selectedAction.equipmentSwitchTargetId || '');
      const beforeWeaponId = String(actor.activeWeaponId || (Array.isArray(actor.weapons) ? actor.weapons : []).find(item => item.equipped)?.id || '');
      return {
        schemaVersion: 4,
        rulesVersion: COMBAT_EVALUATION_RULES_VERSION,
        resolutionId: createResolutionId(),
        actionType: 'equipment-switch',
        resolutionMode: 'automatic',
        actorId: actor.characterId,
        actorName: actor.name,
        targetId: target.characterId,
        targetName: target.name,
        actorPersistence: actor.persistence || null,
        targetPersistence: target.persistence || null,
        weapon: { ...weapon },
        weaponGrip: actor.weaponGrip || 'one-handed',
        attack: {
          naturalRoll: 20, diceResults: [], modifier: 0, total: 0, targetDefense: 0,
          hit: true, criticalSuccess: false, criticalFailure: false, rollMode: 'normal', rollId: ''
        },
        secondarySaves: [],
        followUpAttacks: [],
        actorResourceSnapshot: { before: actor.resources || [], after: resourceCheck.applied.after },
        actorEquippedWeaponSnapshot: { before: beforeWeaponId, after: targetWeaponId },
        effectResults: [],
        ruleApplications: [],
        ruleConflicts: []
      };
    }
    const { relationship, distanceMeters, auraContext, actorAuraOnTarget, targetAuraOnActor,
    resolutionMode, savingThrowMode, automaticMode, ruleSources, usedRuleFrequencyKeys, rulePeriods,
    actionKind, profileActionId, ruleProfileState, preRollApplications, preRollEffects,
    profileRollModes, profileRollMode, auraRollMode, safeRollMode } = getCombatRollContext(actor, target, options);
    const attackModifier = savingThrowMode
      ? getSavingThrowTotal(target, actor.actionSaveAttribute) + Number(actorAuraOnTarget.savingThrow || 0) + preRollEffects.savingThrowModifier
      : Number(actor.attackModifier || 0)
        + Number(targetAuraOnActor.attack || 0)
        + (['spell', 'prayer', 'song'].includes(actionKind) ? Number(targetAuraOnActor.spellAttack || 0) : 0)
        + preRollEffects.attackModifier;
    const targetDefense = savingThrowMode
      ? Number(actor.actionSpellSaveDc || actor.spellSaveDc || 10) + Number(targetAuraOnActor.spellSaveDc || 0) + preRollEffects.spellSaveDcModifier
      : Number(target.totalDefense) + Number(actor.selectedAction?.targetDefenseModifier || 0)
        + Number(actorAuraOnTarget.armorClass || 0) + preRollEffects.defenseModifier;
    const attackNotation = buildAttackNotation(attackModifier, safeRollMode);

    options.onPhase?.({ phase: savingThrowMode ? 'saving-throw' : 'attack', notation: attackNotation, actor, target, weapon });
    const attackRoll = automaticMode ? {
      natural: 20,
      dice: [],
      keptDice: [],
      total: targetDefense,
      visualMode: 'automatic',
      id: ''
    } : await this.dice.rollAttack({
      modifier: attackModifier,
      rollMode: safeRollMode,
      actorName: savingThrowMode ? target.name : actor.name,
      targetName: savingThrowMode ? actor.name : target.name,
      container: options.container
    });
    const evaluatedRoll = savingThrowMode
      ? evaluateSavingThrowRoll(attackRoll, targetDefense)
      : evaluateAttackRoll(attackRoll, targetDefense, actor.selectedAction?.criticalThreshold);
    const cheatEnabled = actor.cheats?.enabled === true;
    let attack = savingThrowMode ? {
      ...evaluatedRoll,
      hit: cheatEnabled ? true : !evaluatedRoll.hit,
      criticalSuccess: false,
      criticalFailure: false,
      saveSucceeded: cheatEnabled ? false : evaluatedRoll.hit
    } : {
      ...evaluatedRoll,
      hit: automaticMode || cheatEnabled ? true : evaluatedRoll.hit,
      criticalSuccess: cheatEnabled ? !!actor.cheats?.automaticCritical : (automaticMode ? false : evaluatedRoll.criticalSuccess),
      criticalFailure: cheatEnabled || automaticMode ? false : evaluatedRoll.criticalFailure,
      saveSucceeded: null
    };
    const baseAttackState = { ...attack };
    const postRollApplications = collectApplicableCombatRules({
      phase: 'post-roll', actionKind, profileActionId, sources: ruleSources, periods: rulePeriods,
      usedFrequencyKeys: usedRuleFrequencyKeys, state: { ...ruleProfileState, ...attack }
    });
    markCombatRuleApplications(postRollApplications, usedRuleFrequencyKeys);
    const postRollEffects = mergeCombatRuleEffects(postRollApplications);
    const postAttackModifier = savingThrowMode ? postRollEffects.savingThrowModifier : postRollEffects.attackModifier;
    const postDefenseModifier = savingThrowMode ? postRollEffects.spellSaveDcModifier : postRollEffects.defenseModifier;
    if (!cheatEnabled && !automaticMode && (postAttackModifier || postDefenseModifier)) {
      const reevaluated = (savingThrowMode ? evaluateSavingThrowRoll : evaluateAttackRoll)({
        ...attackRoll,
        total: Number(attackRoll.total) + postAttackModifier
      }, targetDefense + postDefenseModifier, actor.selectedAction?.criticalThreshold);
      attack = savingThrowMode ? {
        ...attack,
        ...reevaluated,
        hit: !reevaluated.hit,
        criticalSuccess: false,
        criticalFailure: false,
        saveSucceeded: reevaluated.hit
      } : { ...attack, ...reevaluated };
    }
    if (!cheatEnabled && !automaticMode) attack = applyOutcome(attack, postRollEffects.outcome, savingThrowMode);
    const postRollAttackState = { ...attack };
    const postHitApplications = collectApplicableCombatRules({
      phase: 'post-hit', actionKind, profileActionId, sources: ruleSources, periods: rulePeriods,
      usedFrequencyKeys: usedRuleFrequencyKeys, state: { ...ruleProfileState, ...attack }
    });
    markCombatRuleApplications(postHitApplications, usedRuleFrequencyKeys);
    const postHitEffects = mergeCombatRuleEffects(postHitApplications);
    if (!cheatEnabled && !automaticMode) attack = applyOutcome(attack, postHitEffects.outcome, savingThrowMode);
    const postHitAttackState = { ...attack };
    const preDamageApplications = collectApplicableCombatRules({
      phase: 'pre-damage', actionKind, profileActionId, sources: ruleSources, periods: rulePeriods,
      usedFrequencyKeys: usedRuleFrequencyKeys, state: { ...ruleProfileState, ...attack }
    });
    markCombatRuleApplications(preDamageApplications, usedRuleFrequencyKeys);
    const preDamageEffects = mergeCombatRuleEffects(preDamageApplications);
    if (!cheatEnabled && !automaticMode) attack = applyOutcome(attack, preDamageEffects.outcome, savingThrowMode);
    if (cheatEnabled || automaticMode) {
      attack = {
        ...attack,
        hit: true,
        criticalSuccess: savingThrowMode ? false : (cheatEnabled ? !!actor.cheats?.automaticCritical : false),
        criticalFailure: false,
        saveSucceeded: savingThrowMode ? false : null
      };
    }
    const preDamageAttackState = { ...attack };
    let allRuleApplications = [preRollApplications, postRollApplications, postHitApplications, preDamageApplications].flat();
    const followRuleConflicts = [];
    const damageBonus = Number(actor.damageModifier || 0) + Number(targetAuraOnActor.damage || 0)
      + postHitEffects.damageModifier + preDamageEffects.damageModifier;
    let damageRoll = null;
    const secondarySaves = [];
    const followUpAttacks = [];
    const existingTemporaryConditions = Array.isArray(target.temporaryConditions)
      ? target.temporaryConditions.map(condition => ({ ...condition }))
      : [];
    let appliedTemporaryCondition = null;
    const primaryWard = await resolveCombatWard({
      attack, conditions: existingTemporaryConditions, dice: this.dice,
      actor, target, container: options.container, enabled: !savingThrowMode
        && actor.characterId !== target.characterId
        && hasHostileEffects(effectiveEffects.filter(effect => effect.target !== 'self'))
    });
    attack = primaryWard.attack;
    let preWardTargetConditions = primaryWard.conditions;
    const wardResolution = primaryWard.wardResolution;
    const primaryDamageEffect = effectiveEffects.find(effect => effect.type === 'damage' && effectApplies(effect, attack, savingThrowMode, actor.actionHalfDamageOnSave)) || null;

    if (primaryDamageEffect && (attack.hit || (savingThrowMode && actor.actionHalfDamageOnSave))) {
      const baseEffectFormula = primaryDamageEffect.formula || (primaryDamageEffect.amount > 0 ? '' : weapon.damageFormula);
      // Aktive Boni wie Rage-Schaden hängen einen echten Extrawürfel an, statt einen festen
      // Zahlenbonus zu addieren - nur wenn es überhaupt eine Würfelformel zum Anhängen gibt.
      const bonusDamageFormulas = (attack.hit && baseEffectFormula) ? getBonusDamageFormulas(actor) : [];
      const effectFormula = combineDamageFormulas([baseEffectFormula, ...bonusDamageFormulas]);
      const damageNotation = effectFormula ? buildDamageNotation(effectFormula, damageBonus, attack.criticalSuccess) : '';
      options.onPhase?.({ phase: 'damage', notation: damageNotation, actor, target, weapon });
      damageRoll = effectFormula ? await this.dice.rollDamage({
        damageFormula: effectFormula,
        bonus: damageBonus,
        critical: attack.criticalSuccess,
        actorName: actor.name,
        targetName: target.name,
        container: options.container
      }) : {
        notation: String(primaryDamageEffect.amount),
        keptDice: [],
        modifier: 0,
        total: Number(primaryDamageEffect.amount),
        id: '',
        visualMode: 'automatic'
      };
      if (!attack.hit && actor.actionHalfDamageOnSave) {
        damageRoll = { ...damageRoll, rawTotal: Number(damageRoll.total), total: Math.floor(Number(damageRoll.total) / 2), halvedBySave: true };
      }
      const reduction = Math.max(0, postHitEffects.damageReduction + preDamageEffects.damageReduction);
      if (reduction > 0) {
        const beforeReduction = Number(damageRoll.total) || 0;
        damageRoll = {
          ...damageRoll,
          rawTotal: damageRoll.rawTotal == null ? beforeReduction : damageRoll.rawTotal,
          total: Math.max(0, beforeReduction - reduction),
          damageReduction: Math.min(beforeReduction, reduction)
        };
      }
    }
    const secondarySave = actor.selectedAction?.secondarySave;
    if (attack.hit && secondarySave?.enabled && typeof this.dice.rollSavingThrow === 'function') {
      const savingThrowModifier = getSavingThrowTotal(target, secondarySave.attributeKey);
      const savingThrowRoll = await this.dice.rollSavingThrow({
        modifier: savingThrowModifier,
        rollMode: resolveSavingThrowRollMode(target, secondarySave.attributeKey),
        actorName: actor.name,
        targetName: target.name,
        container: options.container
      });
      const dc = Number(secondarySave.dc) || 8;
      const succeeded = Number(savingThrowRoll.total) >= dc;
      const saveResult = {
        attributeKey: secondarySave.attributeKey,
        dc,
        naturalRoll: Number(savingThrowRoll.natural),
        diceResults: Array.isArray(savingThrowRoll.dice) ? savingThrowRoll.dice.slice() : [],
        keptDice: Array.isArray(savingThrowRoll.keptDice) ? savingThrowRoll.keptDice.slice() : [],
        modifier: savingThrowModifier,
        total: Number(savingThrowRoll.total),
        succeeded,
        rollId: savingThrowRoll.id || '',
        visualMode: savingThrowRoll.visualMode || 'text'
      };
      secondarySaves.push(saveResult);
      if (!succeeded && secondarySave.failureCondition?.name) {
        appliedTemporaryCondition = {
          ...secondarySave.failureCondition,
          id: `${secondarySave.failureCondition.id || 'technique-condition'}-${createResolutionId()}`,
          sourceConditionId: secondarySave.failureCondition.id || actor.profileActionId,
          sourceActorId: actor.characterId,
          source: actor.selectedAction?.name || actor.weapon?.name || 'Technik',
          active: true,
          durationModel: { kind: 'actor-comments', remainingActorComments: 1 },
          remainingActorComments: 1
        };
      }
    }
    const followUp = actor.selectedAction?.followUpAttack;
    const followUpRepeatCount = Math.max(1, Math.min(5, Number(followUp?.repeatCount) || 1));
    if (attack.hit && followUp?.enabled && followUp.damageFormula) {
    for (let followUpIndex = 0; followUpIndex < followUpRepeatCount; followUpIndex += 1) {
      const followSources = followUp.triggerReactions === false
        ? ruleSources.map(source => ({ ...source, selectedRuleIds: [] }))
        : ruleSources;
      const followProfileState = { ...ruleProfileState, followUp: true };
      const collectFollowRules = (phase, state = {}) => {
        if (followUp.repeatPerAttackRules === false && ['pre-roll', 'post-roll', 'post-hit', 'pre-damage'].includes(phase)) return [];
        const applications = collectApplicableCombatRules({
          phase, actionKind, profileActionId, sources: followSources, periods: rulePeriods,
          usedFrequencyKeys: usedRuleFrequencyKeys, state: { ...followProfileState, ...state }
        });
        markCombatRuleApplications(applications, usedRuleFrequencyKeys);
        return applications;
      };
      const followPreApplications = collectFollowRules('pre-roll');
      const followPreEffects = mergeCombatRuleEffects(followPreApplications);
      const followRollMode = mergeRollModes(profileRollModes, auraRollMode, followPreApplications.map(application => application.effects?.rollMode));
      const followAttackModifier = Number(actor.attackModifier || 0) + Number(followUp.attackBonus || 0)
        + Number(targetAuraOnActor.attack || 0)
        + (['spell', 'prayer', 'song'].includes(actionKind) ? Number(targetAuraOnActor.spellAttack || 0) : 0)
        + followPreEffects.attackModifier;
      let followDefense = Number(target.totalDefense) + Number(actorAuraOnTarget.armorClass || 0) + followPreEffects.defenseModifier;
      const followAttackRoll = await this.dice.rollAttack({
        modifier: followAttackModifier,
        rollMode: followRollMode,
        actorName: actor.name,
        targetName: target.name,
        container: options.container
      });
      let followAttack = evaluateAttackRoll(followAttackRoll, followDefense, actor.selectedAction?.criticalThreshold);
      const followPostApplications = collectFollowRules('post-roll', followAttack);
      const followPostEffects = mergeCombatRuleEffects(followPostApplications);
      if (followPostEffects.attackModifier || followPostEffects.defenseModifier) {
        followAttack = evaluateAttackRoll({ ...followAttackRoll, total: Number(followAttackRoll.total) + followPostEffects.attackModifier }, followDefense + followPostEffects.defenseModifier, actor.selectedAction?.criticalThreshold);
      }
      followAttack = applyOutcome(followAttack, followPostEffects.outcome, false);
      followDefense += followPostEffects.defenseModifier;
      const followPostHitApplications = collectFollowRules('post-hit', followAttack);
      const followPostHitEffects = mergeCombatRuleEffects(followPostHitApplications);
      followAttack = applyOutcome(followAttack, followPostHitEffects.outcome, false);
      const followPreDamageApplications = collectFollowRules('pre-damage', followAttack);
      const followPreDamageEffects = mergeCombatRuleEffects(followPreDamageApplications);
      followAttack = applyOutcome(followAttack, followPreDamageEffects.outcome, false);
      const followApplications = [followPreApplications, followPostApplications, followPostHitApplications, followPreDamageApplications].flat();
      allRuleApplications = allRuleApplications.concat(followApplications);
      [
        ['follow-up/pre-roll', followPreEffects.conflicts], ['follow-up/post-roll', followPostEffects.conflicts],
        ['follow-up/post-hit', followPostHitEffects.conflicts], ['follow-up/pre-damage', followPreDamageEffects.conflicts]
      ].forEach(([phase, conflicts]) => {
        if (Array.isArray(conflicts) && conflicts.length) followRuleConflicts.push({ phase, applications: conflicts });
      });
      const followWard = await resolveCombatWard({
        attack: followAttack, conditions: preWardTargetConditions, dice: this.dice,
        actor, target, container: options.container
      });
      followAttack = followWard.attack;
      preWardTargetConditions = followWard.conditions;
      let followDamage = null;
      if (followAttack.hit) {
        const followBonusDamageFormulas = followUp.damageFormula && followUp.inheritBonusDamage !== false ? getBonusDamageFormulas(actor) : [];
        followDamage = await this.dice.rollDamage({
          damageFormula: combineDamageFormulas([followUp.damageFormula, ...followBonusDamageFormulas]),
          bonus: (followUp.inheritDamageModifier === false ? 0 : Number(actor.damageModifier || 0)) + Number(followUp.damageBonus || 0)
            + Number(targetAuraOnActor.damage || 0)
            + followPostHitEffects.damageModifier + followPreDamageEffects.damageModifier,
          critical: followAttack.criticalSuccess,
          actorName: actor.name,
          targetName: target.name,
          container: options.container
        });
        const reduction = Math.max(0, followPostHitEffects.damageReduction + followPreDamageEffects.damageReduction);
        if (reduction > 0) followDamage = { ...followDamage, rawTotal: Number(followDamage.total), total: Math.max(0, Number(followDamage.total) - reduction), damageReduction: reduction };
      }
      followUpAttacks.push({
        sameTarget: followUp.sameTarget !== false,
        triggerFurtherEffects: followUp.triggerFurtherEffects === true,
        wardResolution: followWard.wardResolution,
        attack: {
          naturalRoll: Number(followAttackRoll.natural),
          diceResults: Array.isArray(followAttackRoll.dice) ? followAttackRoll.dice.slice() : [],
          modifier: followAttackModifier + followPostEffects.attackModifier,
          total: Number(followAttackRoll.total) + followPostEffects.attackModifier,
          targetDefense: followDefense,
          hit: followAttack.hit,
          criticalSuccess: followAttack.criticalSuccess,
          criticalFailure: followAttack.criticalFailure,
          rollMode: followRollMode,
          rollId: followAttackRoll.id || ''
        },
        damage: followDamage ? {
          notation: followDamage.notation,
          diceResults: Array.isArray(followDamage.keptDice) ? followDamage.keptDice.slice() : [],
          modifier: Number(followDamage.modifier) || 0,
          total: Number(followDamage.total),
          damageType: followUp.damageType || weapon.damageType || 'physisch',
          rollId: followDamage.id || ''
        } : null
      });
    }
    }
    let targetHitPoints = {
      current: target.currentHitPoints,
      maximum: target.maximumHitPoints,
      temporary: target.temporaryHitPoints || 0
    };
    const targetResourceBaseline = actor.characterId === target.characterId
      ? resourceCheck.applied.after
      : target.resources;
    let targetResources = (Array.isArray(targetResourceBaseline) ? targetResourceBaseline : []).map(resource => ({ ...resource }));
    let targetConditions = preWardTargetConditions;
    let actorHitPoints = {
      current: actor.currentHitPoints,
      maximum: actor.maximumHitPoints,
      temporary: actor.temporaryHitPoints || 0
    };
    let actorResources = resourceCheck.applied.after.map(resource => ({ ...resource }));
    const existingActorConditions = Array.isArray(actor.temporaryConditions)
      ? actor.temporaryConditions.map(condition => ({ ...condition }))
      : [];
    let actorConditions = existingActorConditions.map(normalizeRuntimeCondition);
    const effectResults = [];
    let consumedPrimaryDamage = false;
    const applyEffectList = async effects => {
      for (const effect of effects) {
      if (!effectApplies(effect, attack, savingThrowMode, actor.actionHalfDamageOnSave)) continue;
      const appliesToActor = effect.target === 'self' && String(actor.characterId) !== String(target.characterId);
      let recipientHitPoints = appliesToActor ? actorHitPoints : targetHitPoints;
      let recipientResources = appliesToActor ? actorResources : targetResources;
      let recipientConditions = appliesToActor ? actorConditions : targetConditions;
      const recipient = appliesToActor ? 'actor' : 'target';
      let amount = Number(effect.amount) || 0;
      let roll = null;
      if (effect.formula && !(effect.type === 'damage' && !consumedPrimaryDamage && damageRoll)) {
        roll = await this.dice.rollDamage({
          damageFormula: effect.formula,
          bonus: 0,
          critical: effect.type === 'damage' && attack.criticalSuccess,
          actorName: actor.name,
          targetName: target.name,
          container: options.container
        });
        amount = Number(roll.total) || 0;
      }
      if (effect.type === 'damage') {
        if (!consumedPrimaryDamage && damageRoll) {
          amount = Number(damageRoll.total) || 0;
          roll = damageRoll;
          consumedPrimaryDamage = true;
        }
        const applied = applyTypedCombatDamage(recipientHitPoints, amount, appliesToActor ? actor : target, {
          damageType: effect.inheritWeaponDamageType ? weapon.damageType : (effect.damageType || weapon.damageType),
          magical: effect.magical
        });
        if (appliesToActor) actorHitPoints = applied.after;
        else targetHitPoints = applied.after;
        effectResults.push({ effect, amount, roll, applied, recipient });
        continue;
      }
      if (effect.type === 'healing') {
        const applied = applyCombatHealing(recipientHitPoints, amount);
        if (appliesToActor) actorHitPoints = applied.after;
        else targetHitPoints = applied.after;
        effectResults.push({ effect, amount, roll, applied, recipient });
        continue;
      }
      if (effect.type === 'temporary-hit-points') {
        const applied = applyTemporaryHitPoints(recipientHitPoints, amount);
        if (appliesToActor) actorHitPoints = applied.after;
        else targetHitPoints = applied.after;
        effectResults.push({ effect, amount, roll, applied, recipient });
        continue;
      }
      if (['apply-condition', 'buff', 'debuff'].includes(effect.type) && effect.condition) {
        // Ein effect.formula (z.B. "1w4") wird einmalig gewürfelt und als negativer
        // Angriffsmalus in die Zustandsmechanik eingebacken - für Effekte wie Spottvers,
        // deren Stärke variabel ist statt eines festen Werts.
        const rolledMechanics = roll
          ? { ...effect.condition.mechanics, attack: (Number(effect.condition.mechanics?.attack) || 0) - Number(roll.total || 0) }
          : effect.condition.mechanics;
        const condition = normalizeRuntimeCondition({
          ...effect.condition,
          mechanics: rolledMechanics,
          id: `${effect.condition.id || effect.id}-${createResolutionId()}`,
          sourceConditionId: effect.condition.id || effect.id,
          sourceActorId: actor.characterId,
          source: actor.selectedAction?.name || actor.weapon?.name || actor.name,
          active: true,
          ...(sustainsConcentration
            ? { concentrationOwnerId: actor.characterId, concentrationInstanceId }
            : {})
        });
        recipientConditions = refreshRuntimeCondition(recipientConditions, condition);
        if (appliesToActor) actorConditions = recipientConditions;
        else targetConditions = recipientConditions;
        effectResults.push({ effect, condition, roll, applied: true, recipient });
        continue;
      }
      if (effect.type === 'remove-condition') {
        const before = recipientConditions;
        const tags = new Set(String(effect.conditionTags || '').toLocaleLowerCase('de').split(/[,;·]/).map(value => value.trim()).filter(Boolean));
        recipientConditions = recipientConditions.filter(condition => {
          if (effect.conditionId && [String(condition.id), String(condition.sourceConditionId || '')].includes(effect.conditionId)) return false;
          if (!tags.size) return true;
          const conditionTags = new Set(String(condition.tags || '').toLocaleLowerCase('de').split(/[,;·]/).map(value => value.trim()).filter(Boolean));
          return ![...tags].some(tag => conditionTags.has(tag));
        });
        if (appliesToActor) actorConditions = recipientConditions;
        else targetConditions = recipientConditions;
        effectResults.push({ effect, removed: before.filter(condition => !recipientConditions.includes(condition)), recipient });
        continue;
      }
      if (['restore-resource', 'spend-resource'].includes(effect.type) && effect.resourceId) {
        const applied = updateResource(recipientResources, effect.resourceId, amount, effect.type === 'restore-resource');
        if (appliesToActor) actorResources = applied.after;
        else targetResources = applied.after;
        effectResults.push({ effect, amount, applied, recipient });
        continue;
      }
      effectResults.push({ effect, amount, applied: true, recipient });
      }
    };
    await applyEffectList(effectiveEffects);
    followUpAttacks.forEach((followUpResult, index) => {
      if (!followUpResult.damage || !followUpResult.attack?.hit) return;
      const effect = normalizeCombatEffect({
        id: `follow-up-damage-${index + 1}`,
        type: 'damage',
        target: 'target',
        on: 'hit',
        damageType: followUpResult.damage.damageType,
        magical: false,
        notes: 'Vollständig geprüfter Folgeangriff'
      });
      const applied = applyTypedCombatDamage(targetHitPoints, followUpResult.damage.total, target, {
        damageType: effect.damageType,
        magical: effect.magical
      });
      targetHitPoints = applied.after;
      effectResults.push({ effect, amount: followUpResult.damage.total, roll: followUpResult.damage, applied });
    });
    if (appliedTemporaryCondition) targetConditions = refreshRuntimeCondition(targetConditions, normalizeRuntimeCondition(appliedTemporaryCondition));
    const damageEffectResults = effectResults.filter(result => result.effect?.type === 'damage' && result.applied && result.recipient !== 'actor');
    const totalDamageApplied = damageEffectResults.reduce((sum, result) => sum + Number(result.applied.incoming || 0), 0);
    const rawDamageRolled = damageEffectResults.reduce((sum, result) => sum + Number(result.applied.rawIncoming || result.amount || 0), 0);
    const healed = effectResults.reduce((sum, result) => sum + Number(result.applied?.restored || 0), 0);
    const conditionsApplied = effectResults.filter(result => result.condition).length + (appliedTemporaryCondition ? 1 : 0);
    const conditionsRemoved = effectResults.reduce((sum, result) => sum + (Array.isArray(result.removed) ? result.removed.length : 0), 0);
    let defeated = Number(target.currentHitPoints) > 0 && targetHitPoints.current === 0;
    let nonlethalDefeat = defeated && damageEffectResults.some(result => result.effect?.nonlethal === true);
    let targetConcentrationSnapshot = null;
    const lateResultEffects = [];
    const interruptTriggered = effectResults.some(result => result.effect?.type === 'interrupt' && result.applied !== false);
    const targetChannelingSnapshot = target.channeling && interruptTriggered ? {
      before: { ...target.channeling },
      after: null,
      reason: 'interrupted'
    } : null;
    if (target.concentration && (totalDamageApplied > 0 || interruptTriggered || defeated)) {
      const beforeConcentration = { ...target.concentration };
      let concentrationRetained = !interruptTriggered && !defeated;
      if (concentrationRetained && totalDamageApplied > 0 && typeof this.dice.rollSavingThrow === 'function') {
        const concentrationApplications = collectApplicableCombatRules({
          phase: 'on-concentration-check', actionKind, profileActionId, sources: ruleSources, periods: rulePeriods,
          usedFrequencyKeys: usedRuleFrequencyKeys,
          state: { ...ruleProfileState, ...attack, damage: totalDamageApplied, concentration: beforeConcentration }
        });
        markCombatRuleApplications(concentrationApplications, usedRuleFrequencyKeys);
        const concentrationEffects = mergeCombatRuleEffects(concentrationApplications);
        allRuleApplications = allRuleApplications.concat(concentrationApplications);
        concentrationApplications.forEach(application => {
          lateResultEffects.push(...normalizeCombatEffects(application.resultEffects || []));
        });
        if (Array.isArray(concentrationEffects.conflicts) && concentrationEffects.conflicts.length) {
          followRuleConflicts.push({ phase: 'on-concentration-check', applications: concentrationEffects.conflicts });
        }
        const dc = Math.max(10, Math.floor(totalDamageApplied / 2));
        const modifier = getSavingThrowTotal(target, 'constitution') + Number(concentrationEffects.savingThrowModifier || 0);
        const savingThrowRoll = await this.dice.rollSavingThrow({
          modifier,
          rollMode: resolveSavingThrowRollMode(target, 'constitution', concentrationEffects.rollMode || 'normal'),
          actorName: target.name,
          targetName: actor.name,
          container: options.container
        });
        let succeeded = Number(savingThrowRoll.total) >= dc;
        if (concentrationEffects.outcome === 'force-save-success') succeeded = true;
        if (concentrationEffects.outcome === 'force-save-failure') succeeded = false;
        secondarySaves.push({
          type: 'concentration', attributeKey: 'constitution', dc,
          naturalRoll: Number(savingThrowRoll.natural),
          diceResults: Array.isArray(savingThrowRoll.dice) ? savingThrowRoll.dice.slice() : [],
          keptDice: Array.isArray(savingThrowRoll.keptDice) ? savingThrowRoll.keptDice.slice() : [],
          modifier, total: Number(savingThrowRoll.total), succeeded,
          rollId: savingThrowRoll.id || '', visualMode: savingThrowRoll.visualMode || 'text'
        });
        concentrationRetained = succeeded;
      }
      targetConcentrationSnapshot = {
        before: beforeConcentration,
        after: concentrationRetained ? beforeConcentration : null,
        reason: defeated ? 'defeated' : (interruptTriggered ? 'interrupted' : (concentrationRetained ? 'save-succeeded' : 'save-failed'))
      };
      if (!concentrationRetained) {
        targetConditions = targetConditions.filter(condition =>
          getConditionConcentrationOwnerId(condition)
            ? getConditionConcentrationOwnerId(condition) !== String(target.characterId)
            : condition?.durationModel?.kind !== 'concentration');
      }
    }
    const latePhases = [
      ...(totalDamageApplied > 0 ? ['on-damaged', 'post-damage'] : []),
      ...(healed > 0 ? ['on-heal'] : []),
      ...(conditionsApplied > 0 ? ['on-condition-applied'] : []),
      ...(conditionsRemoved > 0 ? ['on-condition-removed'] : []),
      ...((resourceCheck.applied.changes.length || effectResults.some(result => (
        result.effect?.type === 'spend-resource' && result.applied?.changed
      ))) ? ['on-resource-spent'] : []),
      ...(defeated ? ['on-defeat'] : [])
    ];
    latePhases.forEach(phase => {
      const applications = collectApplicableCombatRules({
        phase, actionKind, profileActionId, sources: ruleSources, periods: rulePeriods,
        usedFrequencyKeys: usedRuleFrequencyKeys,
        state: { ...ruleProfileState, ...attack, damage: totalDamageApplied, healed, conditionsApplied, conditionsRemoved, defeated }
      });
      markCombatRuleApplications(applications, usedRuleFrequencyKeys);
      allRuleApplications = allRuleApplications.concat(applications);
      applications.forEach(application => {
        lateResultEffects.push(...normalizeCombatEffects(application.resultEffects || []));
      });
      const conflicts = mergeCombatRuleEffects(applications).conflicts;
      if (Array.isArray(conflicts) && conflicts.length) followRuleConflicts.push({ phase, applications: conflicts });
    });
    // Result effects are applied once after all triggering phases have been
    // collected. They do not recursively trigger another phase in the same
    // resolution; this prevents reaction loops while keeping the full ledger.
    await applyEffectList(lateResultEffects);
    defeated = Number(target.currentHitPoints) > 0 && targetHitPoints.current === 0;
    nonlethalDefeat = defeated && effectResults
      .filter(result => result.effect?.type === 'damage' && result.recipient !== 'actor')
      .some(result => result.effect?.nonlethal === true);
    const ruleResourceSnapshots = consumeCombatRuleResources(allRuleApplications, ruleSources, {
      actorId: actor.characterId,
      actorResourcesAfter: resourceCheck.applied.after
    });
    const preRollLedger = createRuleLedger(preRollApplications, {
      attackModifier: attackModifier - (savingThrowMode ? preRollEffects.savingThrowModifier : preRollEffects.attackModifier),
      targetDefense: targetDefense - (savingThrowMode ? preRollEffects.spellSaveDcModifier : preRollEffects.defenseModifier),
      rollMode: mergeRollModes(profileRollMode, auraRollMode)
    }, { attackModifier, targetDefense, rollMode: safeRollMode });
    const postRollLedger = createRuleLedger(postRollApplications, {
      attackTotal: Number(attackRoll.total), targetDefense, hit: baseAttackState.hit
    }, {
      attackTotal: Number(attackRoll.total) + postAttackModifier,
      targetDefense: targetDefense + postDefenseModifier,
      hit: postRollAttackState.hit
    });
    const postHitLedger = createRuleLedger(postHitApplications, {
      hit: postRollAttackState.hit,
      damage: damageRoll?.rawTotal ?? damageRoll?.total ?? null
    }, { hit: postHitAttackState.hit, damage: damageRoll?.total ?? null });
    const preDamageLedger = createRuleLedger(preDamageApplications, {
      hit: postHitAttackState.hit,
      damage: damageRoll?.rawTotal ?? damageRoll?.total ?? null
    }, { hit: preDamageAttackState.hit, damage: damageRoll?.total ?? null });
    const baseResolution = {
      schemaVersion: 4,
      rulesVersion: COMBAT_EVALUATION_RULES_VERSION,
      resolutionId: createResolutionId(),
      actionType: 'attack',
      resolutionMode,
      actorId: actor.characterId,
      actorName: actor.name,
      targetId: target.characterId,
      targetName: target.name,
      actorPersistence: actor.persistence || null,
      targetPersistence: target.persistence || null,
      weapon: { ...weapon },
      weaponGrip: actor.weaponGrip || 'one-handed',
      mechanicNotes: Array.isArray(actor.selectedAction?.mechanicNotes) ? actor.selectedAction.mechanicNotes.slice(0, 8) : [],
      secondarySaves,
      followUpAttacks,
      wardResolution,
      targetConditionSnapshot: JSON.stringify(targetConditions) !== JSON.stringify(existingTemporaryConditions) ? {
        before: existingTemporaryConditions,
        after: targetConditions,
        applied: appliedTemporaryCondition
      } : null,
      actorConditionSnapshot: JSON.stringify(actorConditions) !== JSON.stringify(existingActorConditions) ? {
        before: existingActorConditions,
        after: actorConditions
      } : null,
      actorHitPointSnapshot: JSON.stringify(actorHitPoints) !== JSON.stringify({
        current: actor.currentHitPoints,
        maximum: actor.maximumHitPoints,
        temporary: actor.temporaryHitPoints || 0
      }) ? {
        before: {
          current: actor.currentHitPoints,
          maximum: actor.maximumHitPoints,
          temporary: actor.temporaryHitPoints || 0
        },
        after: actorHitPoints
      } : null,
      targetResourceSnapshot: JSON.stringify(targetResources) !== JSON.stringify(targetResourceBaseline || []) ? {
        before: targetResourceBaseline || [],
        after: targetResources
      } : null,
      effectResults,
      profileActionId: actor.profileActionId || '',
      profileActionKind: actor.profileActionKind || 'weapon',
      castLevel: actor.selectedAction?.castLevel ?? actor.selectedAction?.spellLevel ?? null,
      resourceCosts: effectiveResourceCosts.map(cost => ({ ...cost })),
      actorResourceSnapshot: JSON.stringify(actorResources) !== JSON.stringify(resourceCheck.applied.before) ? {
        before: resourceCheck.applied.before,
        after: actorResources,
        changes: resourceCheck.applied.changes
      } : null,
      actorInventorySnapshot: ammunition.changed ? {
        before: ammunition.before,
        after: ammunition.after,
        ammunitionUse: ammunition.use
      } : null,
      actorChannelingSnapshot: (actor.channeling || requiredChannelComments > 0)
        ? { before: actor.channeling || null, after: null, reason: requiredChannelComments > 0 ? 'completed' : 'interrupted' }
        : null,
      actorConcentrationSnapshot: sustainsConcentration && !options.skipSelfEffects ? {
        before: actor.concentration || null,
        after: {
          actionId: actor.profileActionId || '',
          actionName: actor.selectedAction?.name || actor.weapon?.name || 'Wirkung',
          ownerActorId: actor.characterId,
          instanceId: concentrationInstanceId,
          tracksConditions: effectiveEffects.some(effect => effect.condition && ['apply-condition', 'buff', 'debuff'].includes(effect.type)),
          startedAtResolution: true
        },
        reason: actor.concentration ? 'replaced' : 'started'
      } : null,
      targetConcentrationSnapshot,
      targetChannelingSnapshot,
      defeat: defeated ? {
        occurred: true,
        status: 'incapacitated',
        nonlethal: nonlethalDefeat,
        dead: false,
        requiresNarrativeDecision: true
      } : null,
      ruleApplications: [...preRollLedger, ...postRollLedger, ...postHitLedger, ...preDamageLedger, ...allRuleApplications.filter(application => ![...preRollApplications, ...postRollApplications, ...postHitApplications, ...preDamageApplications].includes(application))],
      ruleConflicts: [
        ['pre-roll', preRollEffects.conflicts],
        ['post-roll', postRollEffects.conflicts],
        ['post-hit', postHitEffects.conflicts],
        ['pre-damage', preDamageEffects.conflicts]
      ].filter(([, conflicts]) => Array.isArray(conflicts) && conflicts.length).map(([phase, conflicts]) => ({
        phase,
        applications: conflicts
      })).concat(followRuleConflicts),
      ruleResourceSnapshots,
      usedRuleFrequencyKeys: [...usedRuleFrequencyKeys],
      actorCombatProfile: actor.aiSnapshot || null,
      targetCombatProfile: target.aiSnapshot || null,
      auraContext: {
        relationship,
        distanceMeters,
        actorOnTarget: actorAuraOnTarget,
        targetOnActor: targetAuraOnActor
      },
      originalDescription: String(description || '').slice(0, 5000),
      attack: {
        notation: attackNotation,
        naturalRoll: Number(attackRoll.natural),
        diceResults: Array.isArray(attackRoll.dice) ? attackRoll.dice.slice() : [],
        keptDice: Array.isArray(attackRoll.keptDice) ? attackRoll.keptDice.slice() : [],
        modifier: attackModifier + postAttackModifier,
        total: Number(attackRoll.total) + postAttackModifier,
        targetDefense: targetDefense + postDefenseModifier,
        resolutionMode,
        rollOwner: savingThrowMode ? 'target' : 'actor',
        saveAttribute: savingThrowMode ? actor.actionSaveAttribute : '',
        saveSucceeded: attack.saveSucceeded,
        forcedSuccess: cheatEnabled,
        rollMode: safeRollMode,
        criticalSuccess: attack.criticalSuccess,
        criticalFailure: attack.criticalFailure,
        hit: attack.hit,
        visualMode: attackRoll.visualMode || 'text',
        rollId: attackRoll.id || ''
      },
      damage: damageRoll ? {
        notation: damageRoll.notation,
        diceResults: Array.isArray(damageRoll.keptDice) ? damageRoll.keptDice.slice() : [],
        modifier: Number(damageRoll.modifier) || 0,
        total: totalDamageApplied,
        primaryTotal: damageRoll.primaryTotal == null ? Number(damageRoll.total) : Number(damageRoll.primaryTotal),
        rawTotal: rawDamageRolled,
        damageReduction: Number(damageRoll.damageReduction || 0),
        halvedBySave: !!damageRoll.halvedBySave,
        damageType: primaryDamageEffect?.damageType || weapon.damageType || 'physisch',
        damageResponse: damageEffectResults[0]?.applied?.damageResponse || null,
        visualMode: damageRoll.visualMode || 'text',
        rollId: damageRoll.id || ''
      } : null,
      targetSnapshot: {
        currentHitPoints: target.currentHitPoints,
        hitPointsBefore: target.currentHitPoints,
        hitPointsAfter: targetHitPoints.current,
        temporaryHitPointsBefore: target.temporaryHitPoints || 0,
        temporaryHitPointsAfter: targetHitPoints.temporary,
        defeated,
        maximumHitPoints: target.maximumHitPoints,
        defense: targetDefense,
        armorName: target.armor?.name || ''
      },
      resolvedAt: new Date().toISOString()
    };
    return baseResolution;
  }
}

export const combatResolutionInternals = Object.freeze({ normalizeRollMode, evaluateSavingThrowRoll });
