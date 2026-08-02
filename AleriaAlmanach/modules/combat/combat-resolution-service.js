import { buildAttackNotation, buildDamageNotation, evaluateAttackRoll } from './rules/combat-mvp-rules.js';
import { resolveAttackRollMode } from './combat-profile-model.js?v=20260802-combat-sheet-v4';
import { validateCombatActorProfile, validateCombatTargetProfile } from './combat-profile-resolver.js?v=20260802-brandhof-combat-v1';

export const COMBAT_EVALUATION_RULES_VERSION = 'combat-evaluation-1';

function normalizeRollMode(value) {
  return ['advantage', 'disadvantage'].includes(value) ? value : 'normal';
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

    const safeRollMode = resolveAttackRollMode(actor, normalizeRollMode(rollMode));
    const weapon = actor.weapon;
    const attackModifier = Number(actor.attackModifier || 0);
    const targetDefense = Number(target.totalDefense);
    const attackNotation = buildAttackNotation(attackModifier, safeRollMode);

    options.onPhase?.({ phase: 'attack', notation: attackNotation, actor, target, weapon });
    const attackRoll = await this.dice.rollAttack({
      modifier: attackModifier,
      rollMode: safeRollMode,
      actorName: actor.name,
      targetName: target.name,
      container: options.container
    });
    const attack = evaluateAttackRoll(attackRoll, targetDefense);
    const damageBonus = Number(actor.damageModifier || 0);
    let damageRoll = null;

    if (attack.hit) {
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
    }
    const hitPointsBefore = Number.isFinite(Number(target.currentHitPoints)) ? Number(target.currentHitPoints) : null;
    const hitPointsAfter = hitPointsBefore == null
      ? null
      : Math.max(0, hitPointsBefore - Number(damageRoll?.total || 0));

    return {
      schemaVersion: 3,
      rulesVersion: COMBAT_EVALUATION_RULES_VERSION,
      resolutionId: createResolutionId(),
      actionType: 'attack',
      actorId: actor.characterId,
      actorName: actor.name,
      targetId: target.characterId,
      targetName: target.name,
      weapon: { ...weapon },
      profileActionId: actor.profileActionId || '',
      profileActionKind: actor.profileActionKind || 'weapon',
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
        damageType: weapon.damageType || 'physisch',
        visualMode: damageRoll.visualMode || 'text',
        rollId: damageRoll.id || ''
      } : null,
      targetSnapshot: {
        currentHitPoints: target.currentHitPoints,
        hitPointsBefore,
        hitPointsAfter,
        defeated: hitPointsAfter === 0 && hitPointsBefore !== null,
        maximumHitPoints: target.maximumHitPoints,
        defense: targetDefense,
        armorName: target.armor?.name || ''
      },
      resolvedAt: new Date().toISOString()
    };
  }
}

export const combatResolutionInternals = Object.freeze({ normalizeRollMode });
