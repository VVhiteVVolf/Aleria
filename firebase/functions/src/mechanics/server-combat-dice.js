import { randomInt, randomUUID } from 'node:crypto';
import { buildDamageRollPlan } from '../generated/combat/rules/combat-mvp-rules.js';

// Triggered challenge attacks are selected by the stored result table. Their
// dice are rolled on the server and never accepted from the submitted payload.
export class ServerCombatDiceAdapter {
  constructor(rollDie = sides => randomInt(1, sides + 1)) { this.rollDie = rollDie; }
  d20({ modifier = 0, rollMode = 'normal' } = {}) {
    const dice = Array.from({ length: rollMode === 'normal' ? 1 : 2 }, () => this.rollDie(20));
    const natural = rollMode === 'advantage' ? Math.max(...dice) : rollMode === 'disadvantage' ? Math.min(...dice) : dice[0];
    return { id: randomUUID(), natural, dice, keptDice: [natural], total: natural + modifier, visualMode: 'server-rolled' };
  }
  async rollAttack(options) { return this.d20(options); }
  async rollSavingThrow(options) { return this.d20(options); }
  async rollWardDeflection() { return this.d20(); }
  forCounter() { return this; }
  async rollDamage({ damageFormula, bonus = 0, critical = false }) {
    const plan = buildDamageRollPlan(damageFormula, bonus, critical);
    const dice = plan.terms.flatMap(term => Array.from({ length: term.diceCount }, () => this.rollDie(term.sides)));
    return { id: randomUUID(), notation: plan.notation, dice, keptDice: dice, modifier: plan.modifier,
      total: Math.max(0, dice.reduce((sum, value) => sum + value, plan.modifier)),
      ...(plan.criticalDamage ? { criticalDamage: plan.criticalDamage } : {}), visualMode: 'server-rolled' };
  }
}
