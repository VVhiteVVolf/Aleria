import { randomUUID } from 'node:crypto';
import { buildDamageRollPlan } from '../../modules/combat/rules/combat-mvp-rules.js';

export class SeededCombatDice {
  constructor(seed = 1, fixed = null) { this.seed = seed >>> 0 || 1; this.fixed = fixed; }
  die(sides) {
    this.seed ^= this.seed << 13; this.seed ^= this.seed >>> 17; this.seed ^= this.seed << 5;
    return this.fixed == null ? (this.seed >>> 0) % sides + 1 : Math.min(sides, this.fixed);
  }
  async rollAttack({ modifier = 0, rollMode = 'normal' } = {}) {
    const dice = Array.from({ length: rollMode === 'normal' ? 1 : 2 }, () => this.die(20));
    const natural = rollMode === 'advantage' ? Math.max(...dice) : rollMode === 'disadvantage' ? Math.min(...dice) : dice[0];
    return { id: randomUUID(), natural, dice, keptDice: [natural], total: natural + modifier };
  }
  async rollSavingThrow(request) { return this.rollAttack(request); }
  async rollDamage({ damageFormula, bonus = 0, critical = false }) {
    const plan = buildDamageRollPlan(damageFormula, bonus, critical);
    const dice = plan.terms.flatMap(term => Array.from({ length: term.diceCount }, () => this.die(term.sides)));
    const modifier = plan.modifier;
    return { id: randomUUID(), notation: plan.notation,
      ...(plan.criticalDamage ? { criticalDamage: plan.criticalDamage } : {}),
      dice, keptDice: dice, modifier, total: Math.max(0, dice.reduce((sum, die) => sum + die, 0) + modifier) };
  }
}
