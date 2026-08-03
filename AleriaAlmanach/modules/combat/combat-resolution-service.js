import { buildAttackNotation, buildDamageNotation, evaluateAttackRoll } from './rules/combat-mvp-rules.js';
import {
  getAuraOpponentMechanics,
  getSavingThrowTotal,
  resolveAttackRollMode
} from './combat-profile-model.js?v=20260803-combat-sheet-v6';
import { validateCombatActorProfile, validateCombatTargetProfile } from './combat-profile-resolver.js?v=20260803-action-economy-v2';
import {
  patchResolutionHitPointState,
  patchResolutionResourceState
} from './combat-state-model.js?v=20260803-scene-rest-v1';

export const COMBAT_EVALUATION_RULES_VERSION = 'combat-evaluation-3';

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

export class CombatResolutionService {
  constructor(diceAdapter) {
    this.dice = diceAdapter;
  }

  async resolveAttack({ actor, target, description = '', rollMode = 'normal' } = {}, options = {}) {
    const actorCheck = validateCombatActorProfile(actor);
    if (!actorCheck.ready) throw new Error('Für die handelnde Figur fehlen Waffe oder Schadenswurf in den Kampfdaten.');
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
    const actorAuraOnTarget = getAuraOpponentMechanics(actor);
    const targetAuraOnActor = getAuraOpponentMechanics(target);
    const resolutionMode = actor.actionResolutionMode || 'weapon-attack';
    const savingThrowMode = resolutionMode === 'saving-throw';
    const automaticMode = resolutionMode === 'automatic';
    const profileRollMode = resolveAttackRollMode(savingThrowMode ? target : actor, requestedRollMode);
    const auraRollMode = savingThrowMode ? actorAuraOnTarget.attackRollMode : targetAuraOnActor.attackRollMode;
    const safeRollMode = mergeRollModes(profileRollMode, auraRollMode);
    const attackModifier = savingThrowMode
      ? getSavingThrowTotal(target, actor.actionSaveAttribute) + Number(actorAuraOnTarget.savingThrow || 0)
      : Number(actor.attackModifier || 0) + Number(targetAuraOnActor.attack || 0);
    const targetDefense = savingThrowMode
      ? Number(actor.actionSpellSaveDc || actor.spellSaveDc || 10) + Number(targetAuraOnActor.spellSaveDc || 0)
      : Number(target.totalDefense) + Number(actorAuraOnTarget.armorClass || 0);
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
    const evaluatedRoll = evaluateAttackRoll(attackRoll, targetDefense);
    const cheatEnabled = actor.cheats?.enabled === true;
    const attack = savingThrowMode ? {
      ...evaluatedRoll,
      hit: cheatEnabled ? true : !evaluatedRoll.hit,
      criticalSuccess: cheatEnabled ? !!actor.cheats?.automaticCritical : evaluatedRoll.criticalFailure,
      criticalFailure: cheatEnabled ? false : evaluatedRoll.criticalSuccess,
      saveSucceeded: cheatEnabled ? false : evaluatedRoll.hit
    } : {
      ...evaluatedRoll,
      hit: automaticMode || cheatEnabled ? true : evaluatedRoll.hit,
      criticalSuccess: cheatEnabled ? !!actor.cheats?.automaticCritical : (automaticMode ? false : evaluatedRoll.criticalSuccess),
      criticalFailure: cheatEnabled || automaticMode ? false : evaluatedRoll.criticalFailure,
      saveSucceeded: null
    };
    const damageBonus = Number(actor.damageModifier || 0) + Number(targetAuraOnActor.damage || 0);
    let damageRoll = null;

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
    }
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
      profileActionId: actor.profileActionId || '',
      profileActionKind: actor.profileActionKind || 'weapon',
      resourceCosts: Array.isArray(actor.resourceCosts) ? actor.resourceCosts.map(cost => ({ ...cost })) : [],
      actorResourceSnapshot: resourceCheck.applied.changes.length ? {
        before: resourceCheck.applied.before,
        after: resourceCheck.applied.after,
        changes: resourceCheck.applied.changes
      } : null,
      actorCombatProfile: actor.aiSnapshot || null,
      targetCombatProfile: target.aiSnapshot || null,
      originalDescription: String(description || '').slice(0, 5000),
      attack: {
        notation: attackNotation,
        naturalRoll: Number(attackRoll.natural),
        diceResults: Array.isArray(attackRoll.dice) ? attackRoll.dice.slice() : [],
        keptDice: Array.isArray(attackRoll.keptDice) ? attackRoll.keptDice.slice() : [],
        modifier: attackModifier,
        total: Number(attackRoll.total),
        targetDefense,
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
        rawTotal: damageRoll.rawTotal == null ? Number(damageRoll.total) : Number(damageRoll.rawTotal),
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

export const combatResolutionInternals = Object.freeze({ normalizeRollMode });
