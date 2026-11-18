// Shared deterministic attack evaluation: the real roll and the preview use the same rules.
import { evaluateAttackRoll } from './rules/combat-mvp-rules.js';
import { getSavingThrowTotal, getNaturalRollPolicy } from './combat-profile-model.js?v=20260928-equipment-art-v4';
import { succeedsProfileSavingThrow } from './combat-natural-roll-policy.js';
import { collectApplicableCombatRules, getCombatRuleApplicationKey, markCombatRuleApplications, mergeCombatRuleEffects } from './combat-trigger-rules.js?v=20260928-equipment-art-v4';

export function getFirstHitDefenseRule(actor, periods, usedFrequencyKeys) {
  const feature = actor.selectedAction?.firstHitDefense;
  if (!feature) return null;
  const sourceActorId = String(actor.characterId || '');
  const entryKind = 'class-path';
  const applicationKey = getCombatRuleApplicationKey({ actorId: sourceActorId }, { entryKind, entryId: feature.id, id: feature.id });
  const usedKey = `${applicationKey}@comment:${String(periods.comment || '').trim().slice(0, 240)}`;
  if (usedFrequencyKeys.has(usedKey)) return null;
  return {
    applicationKey, usedKey, sourceActorId, sourceActorName: actor.name || '', sourceRole: 'actor',
    entryKind, entryId: feature.id, entryName: feature.name, ruleId: feature.id, ruleName: feature.name,
    phase: 'pre-roll', activation: 'passive', frequency: 'comment', effects: { defenseModifier: feature.modifier }
  };
}

export function resolveFirstHitDefenseUse(rule, hit, usedFrequencyKeys) {
  if (!rule) return;
  // Record the defense for every affected roll and keep the benefit on a miss.
  if (hit) markCombatRuleApplications([rule], usedFrequencyKeys);
  else rule.usedKey = '';
}

export function evaluateSavingThrowRoll(roll, targetDefense) {
  const naturalRoll = Number(roll?.natural);
  const total = Number(roll?.total);
  if (!Number.isFinite(naturalRoll) || !Number.isFinite(total)) {
    throw new Error('Der Rettungswurf enth\u00e4lt kein g\u00fcltiges W20-Ergebnis.');
  }
  return {
    criticalFailure: false,
    criticalSuccess: false,
    hit: succeedsProfileSavingThrow(roll, Number(targetDefense))
  };
}

export function applyOutcome(attack, outcome, savingThrowMode) {
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


export function getCombatAttackNumbers(actor, target, context) {
  const { savingThrowMode, actorAuraOnTarget, targetAuraOnActor, preRollEffects, actionKind } = context;
    const attackModifier = savingThrowMode
      ? getSavingThrowTotal(target, actor.actionSaveAttribute, actor.selectedAction) + Number(actorAuraOnTarget.savingThrow || 0) + preRollEffects.savingThrowModifier
      : Number(actor.attackModifier || 0)
        + Number(targetAuraOnActor.attack || 0)
        + (['spell', 'prayer', 'song'].includes(actionKind) ? Number(targetAuraOnActor.spellAttack || 0) : 0)
        + preRollEffects.attackModifier + Number(context.conditionUsage?.attack || 0);
    const targetDefense = savingThrowMode
      ? Number(actor.actionSpellSaveDc || actor.spellSaveDc || 10) + Number(targetAuraOnActor.spellSaveDc || 0) + preRollEffects.spellSaveDcModifier
      : Number(target.totalDefense) + Number(actor.selectedAction?.targetDefenseModifier || 0)
        + Number(actorAuraOnTarget.armorClass || 0) + preRollEffects.defenseModifier + Number(context.conditionUsage?.armorClass || 0);
  return { attackModifier, targetDefense };
}

export function evaluateCombatAttackRoll(actor, target, attackRoll, context, numbers = getCombatAttackNumbers(actor, target, context)) {
  const { savingThrowMode, automaticMode, actionKind, profileActionId, ruleSources, rulePeriods,
    usedRuleFrequencyKeys, ruleProfileState, ruleCache } = context;
  const { targetDefense } = numbers;
    const evaluatedRoll = savingThrowMode
      ? evaluateSavingThrowRoll(attackRoll, targetDefense)
      : evaluateAttackRoll(attackRoll, targetDefense, actor.selectedAction?.criticalThreshold, getNaturalRollPolicy(actor).criticalFailureMaximum);
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
    if (savingThrowMode && !cheatEnabled) attack = applyOutcome(attack, context.preRollEffects.outcome, true);
    const baseAttackState = { ...attack };
    const postRollApplications = collectApplicableCombatRules({
      phase: 'post-roll', actionKind, profileActionId, sources: ruleSources, periods: rulePeriods,
      usedFrequencyKeys: usedRuleFrequencyKeys, state: { ...ruleProfileState, ...attack }, ruleCache
    });
    markCombatRuleApplications(postRollApplications, usedRuleFrequencyKeys);
    const postRollEffects = mergeCombatRuleEffects(postRollApplications);
    const outcomeEffects = savingThrowMode
      ? mergeCombatRuleEffects([...context.preRollApplications, ...postRollApplications]) : postRollEffects;
    const postAttackModifier = savingThrowMode ? postRollEffects.savingThrowModifier : postRollEffects.attackModifier;
    const postDefenseModifier = savingThrowMode ? postRollEffects.spellSaveDcModifier : postRollEffects.defenseModifier;
    if (!cheatEnabled && !automaticMode && (savingThrowMode || postAttackModifier || postDefenseModifier)) {
      const reevaluated = (savingThrowMode ? evaluateSavingThrowRoll : evaluateAttackRoll)({
        ...attackRoll,
        total: Number(attackRoll.total) + postAttackModifier
      }, targetDefense + postDefenseModifier, actor.selectedAction?.criticalThreshold, getNaturalRollPolicy(actor).criticalFailureMaximum);
      attack = savingThrowMode ? {
        ...attack,
        ...reevaluated,
        hit: !reevaluated.hit,
        criticalSuccess: false,
        criticalFailure: false,
        saveSucceeded: reevaluated.hit
      } : { ...attack, ...reevaluated };
    }
    if (!cheatEnabled && !automaticMode) attack = applyOutcome(attack, outcomeEffects.outcome, savingThrowMode);
    const postRollAttackState = { ...attack };
    const postHitApplications = collectApplicableCombatRules({
      phase: 'post-hit', actionKind, profileActionId, sources: ruleSources, periods: rulePeriods,
      usedFrequencyKeys: usedRuleFrequencyKeys, state: { ...ruleProfileState, ...attack }, ruleCache
    });
    markCombatRuleApplications(postHitApplications, usedRuleFrequencyKeys);
    const postHitEffects = mergeCombatRuleEffects(postHitApplications);
    if (!cheatEnabled && !automaticMode) attack = applyOutcome(attack, postHitEffects.outcome, savingThrowMode);
    const postHitAttackState = { ...attack };
    const preDamageApplications = collectApplicableCombatRules({
      phase: 'pre-damage', actionKind, profileActionId, sources: ruleSources, periods: rulePeriods,
      usedFrequencyKeys: usedRuleFrequencyKeys, state: { ...ruleProfileState, ...attack }, ruleCache
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
  return { attack, cheatEnabled, baseAttackState, postRollAttackState, postHitAttackState, preDamageAttackState,
    postRollApplications, postHitApplications, preDamageApplications, postRollEffects, postHitEffects, preDamageEffects,
    postAttackModifier, postDefenseModifier, postRollConflicts: outcomeEffects.conflicts };
}
