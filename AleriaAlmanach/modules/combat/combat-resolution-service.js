import { buildAttackNotation, buildDamageNotation, evaluateAttackRoll } from './rules/combat-mvp-rules.js';
import {
  getAuraTargetMechanics,
  getSavingThrowTotal,
  resolveAttackRollMode
} from './combat-profile-model.js?v=20260803-gawain-level4-v1';
import {
  getCombatActorValidationMessage,
  validateCombatActorProfile,
  validateCombatTargetProfile
} from './combat-profile-resolver.js?v=20260803-gawain-level4-v1';
import {
  patchResolutionHitPointState,
  patchResolutionResourceState
} from './combat-state-model.js?v=20260803-economy-audit-v1';
import {
  collectApplicableCombatRules,
  markCombatRuleApplications,
  mergeCombatRuleEffects,
  sanitizeCombatRuleEffects
} from './combat-trigger-rules.js?v=20260803-gawain-level4-v1';

export const COMBAT_EVALUATION_RULES_VERSION = 'combat-evaluation-4';

function normalizeRollMode(value) {
  return ['advantage', 'disadvantage'].includes(value) ? value : 'normal';
}

function mergeRollModes(...values) {
  const modes = values.map(normalizeRollMode);
  const hasAdvantage = modes.includes('advantage');
  const hasDisadvantage = modes.includes('disadvantage');
  if (hasAdvantage === hasDisadvantage) return 'normal';
  return hasAdvantage ? 'advantage' : 'disadvantage';
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

function consumeRuleResources(applications, sources, actorResourceSnapshot) {
  const reactionApplications = applications.filter(application => application.activation === 'reaction' && application.costs.length);
  const stateByActor = new Map();
  const snapshots = [];
  reactionApplications.forEach(application => {
    const source = sources.find(item => String(item.actorId) === String(application.sourceActorId));
    if (!source) throw new Error(`Die Regelquelle ${application.sourceActorName || application.sourceActorId} ist nicht verf\u00fcgbar.`);
    const initial = stateByActor.get(String(source.actorId))
      || (String(source.actorId) === String(sources[0]?.actorId) && actorResourceSnapshot?.after
        ? actorResourceSnapshot.after
        : source.profile?.resources)
      || [];
    const payment = patchResolutionResourceState({ resourceCosts: application.costs }, initial).applied;
    if (!payment.sufficient) {
      throw new Error(`${application.sourceActorName || 'Die Regelquelle'} hat nicht genug ${payment.missing?.name || 'Ressourcen'} f\u00fcr ${application.ruleName}.`);
    }
    stateByActor.set(String(source.actorId), payment.after);
    snapshots.push({
      sourceActorId: application.sourceActorId,
      sourceActorName: application.sourceActorName,
      applicationKey: application.applicationKey,
      ruleName: application.ruleName,
      before: payment.before,
      after: payment.after,
      changes: payment.changes
    });
  });
  return snapshots;
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

export class CombatResolutionService {
  constructor(diceAdapter) {
    this.dice = diceAdapter;
  }

  async resolveAttack({ actor, target, description = '', rollMode = 'normal' } = {}, options = {}) {
    const actorCheck = validateCombatActorProfile(actor);
    if (!actorCheck.ready) throw new Error(getCombatActorValidationMessage(actor, actorCheck));
    const targetCheck = validateCombatTargetProfile(target);
    if (!targetCheck.ready) throw new Error('Für das Ziel fehlt die Verteidigung in den Kampfdaten.');
    if (actor.characterId === target.characterId) throw new Error('Die Figur kann sich nicht selbst als Angriffsziel wählen.');

    const requestedRollMode = actor.forcedRollMode && actor.forcedRollMode !== 'normal'
      ? actor.forcedRollMode
      : normalizeRollMode(rollMode);
    const weapon = actor.weapon;
    const resourceCheck = patchResolutionResourceState({ resourceCosts: actor.resourceCosts || [] }, actor.resources || []);
    if (!resourceCheck.applied.sufficient) {
      const missing = resourceCheck.applied.missing;
      throw new Error(`${actor.name} hat nicht genug ${missing?.name || 'Ressourcen'} für diesen Angriff.`);
    }
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
    const profileRollMode = resolveAttackRollMode(savingThrowMode ? target : actor, requestedRollMode);
    const auraRollMode = savingThrowMode ? actorAuraOnTarget.attackRollMode : targetAuraOnActor.attackRollMode;
    const safeRollMode = mergeRollModes(profileRollMode, auraRollMode, preRollEffects.rollMode);
    const attackModifier = savingThrowMode
      ? getSavingThrowTotal(target, actor.actionSaveAttribute) + Number(actorAuraOnTarget.savingThrow || 0) + preRollEffects.savingThrowModifier
      : Number(actor.attackModifier || 0)
        + Number(targetAuraOnActor.attack || 0)
        + (['spell', 'prayer', 'song'].includes(actionKind) ? Number(targetAuraOnActor.spellAttack || 0) : 0)
        + preRollEffects.attackModifier;
    const targetDefense = savingThrowMode
      ? Number(actor.actionSpellSaveDc || actor.spellSaveDc || 10) + Number(targetAuraOnActor.spellSaveDc || 0) + preRollEffects.spellSaveDcModifier
      : Number(target.totalDefense) + Number(actorAuraOnTarget.armorClass || 0) + preRollEffects.defenseModifier;
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
      : evaluateAttackRoll(attackRoll, targetDefense);
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
      }, targetDefense + postDefenseModifier);
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
    const allRuleApplications = [preRollApplications, postRollApplications, postHitApplications, preDamageApplications].flat();
    const damageBonus = Number(actor.damageModifier || 0) + Number(targetAuraOnActor.damage || 0)
      + postHitEffects.damageModifier + preDamageEffects.damageModifier;
    let damageRoll = null;
    const secondarySaves = [];
    const followUpAttacks = [];
    const existingTemporaryConditions = Array.isArray(target.temporaryConditions)
      ? target.temporaryConditions.map(condition => ({ ...condition }))
      : [];
    let appliedTemporaryCondition = null;

    if (attack.hit || (savingThrowMode && actor.actionHalfDamageOnSave)) {
      const damageNotation = buildDamageNotation(weapon.damageFormula, damageBonus, attack.criticalSuccess);
      options.onPhase?.({ phase: 'damage', notation: damageNotation, actor, target, weapon });
      damageRoll = await this.dice.rollDamage({
        damageFormula: weapon.damageFormula,
        bonus: damageBonus,
        critical: attack.criticalSuccess,
        actorName: actor.name,
        targetName: target.name,
        container: options.container
      });
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
        rollMode: 'normal',
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
          source: actor.selectedAction?.name || actor.weapon?.name || 'Technik',
          active: true,
          remainingActorComments: 1
        };
      }
    }
    const followUp = actor.selectedAction?.followUpAttack;
    if (attack.hit && followUp?.enabled && followUp.damageFormula) {
      const followAttackModifier = Number(actor.attackModifier || 0) + Number(followUp.attackBonus || 0);
      const followAttackRoll = await this.dice.rollAttack({
        modifier: followAttackModifier,
        rollMode: 'normal',
        actorName: actor.name,
        targetName: target.name,
        container: options.container
      });
      const followAttack = evaluateAttackRoll(followAttackRoll, targetDefense + postDefenseModifier);
      let followDamage = null;
      if (followAttack.hit) {
        followDamage = await this.dice.rollDamage({
          damageFormula: followUp.damageFormula,
          bonus: Number(actor.damageModifier || 0) + Number(followUp.damageBonus || 0),
          critical: followAttack.criticalSuccess,
          actorName: actor.name,
          targetName: target.name,
          container: options.container
        });
      }
      followUpAttacks.push({
        sameTarget: followUp.sameTarget !== false,
        triggerFurtherEffects: followUp.triggerFurtherEffects === true,
        attack: {
          naturalRoll: Number(followAttackRoll.natural),
          diceResults: Array.isArray(followAttackRoll.dice) ? followAttackRoll.dice.slice() : [],
          modifier: followAttackModifier,
          total: Number(followAttackRoll.total),
          targetDefense: targetDefense + postDefenseModifier,
          hit: followAttack.hit,
          criticalSuccess: followAttack.criticalSuccess,
          criticalFailure: followAttack.criticalFailure,
          rollMode: 'normal',
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
      if (damageRoll && followDamage) {
        damageRoll = {
          ...damageRoll,
          primaryTotal: Number(damageRoll.total) || 0,
          total: (Number(damageRoll.total) || 0) + (Number(followDamage.total) || 0),
          notation: `${damageRoll.notation} + ${followDamage.notation}`
        };
      }
    }
    const ruleResourceSnapshots = consumeRuleResources(allRuleApplications, ruleSources, resourceCheck.applied);
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
      secondarySaves,
      followUpAttacks,
      targetConditionSnapshot: appliedTemporaryCondition ? {
        before: existingTemporaryConditions,
        after: [...existingTemporaryConditions, appliedTemporaryCondition],
        applied: appliedTemporaryCondition
      } : null,
      profileActionId: actor.profileActionId || '',
      profileActionKind: actor.profileActionKind || 'weapon',
      resourceCosts: Array.isArray(actor.resourceCosts) ? actor.resourceCosts.map(cost => ({ ...cost })) : [],
      actorResourceSnapshot: resourceCheck.applied.changes.length ? {
        before: resourceCheck.applied.before,
        after: resourceCheck.applied.after,
        changes: resourceCheck.applied.changes
      } : null,
      ruleApplications: [...preRollLedger, ...postRollLedger, ...postHitLedger, ...preDamageLedger],
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
        total: Number(damageRoll.total),
        primaryTotal: damageRoll.primaryTotal == null ? Number(damageRoll.total) : Number(damageRoll.primaryTotal),
        rawTotal: damageRoll.rawTotal == null ? Number(damageRoll.total) : Number(damageRoll.rawTotal),
        damageReduction: Number(damageRoll.damageReduction || 0),
        halvedBySave: !!damageRoll.halvedBySave,
        damageType: weapon.damageType || 'physisch',
        visualMode: damageRoll.visualMode || 'text',
        rollId: damageRoll.id || ''
      } : null,
      targetSnapshot: {
        currentHitPoints: target.currentHitPoints,
        hitPointsBefore: target.currentHitPoints,
        hitPointsAfter: target.currentHitPoints,
        temporaryHitPointsBefore: target.temporaryHitPoints || 0,
        temporaryHitPointsAfter: target.temporaryHitPoints || 0,
        defeated: false,
        maximumHitPoints: target.maximumHitPoints,
        defense: targetDefense,
        armorName: target.armor?.name || ''
      },
      resolvedAt: new Date().toISOString()
    };
    return patchResolutionHitPointState(baseResolution, {
      current: target.currentHitPoints,
      maximum: target.maximumHitPoints,
      temporary: target.temporaryHitPoints
    });
  }
}

export const combatResolutionInternals = Object.freeze({ normalizeRollMode, evaluateSavingThrowRoll });
