import { getCombatRollContext } from './combat-resolution-service.js';
import { getCombatAttackNumbers, evaluateCombatAttackRoll } from './combat-attack-evaluation.js';
import { parseDamageFormula, combineDamageFormulas } from './rules/combat-mvp-rules.js';
import { getBonusDamageFormulas } from './combat-profile-model.js';

export function estimateCombatHitChance(actor, target, options = {}) {
  if (!actor || !target || actor.selectedAction?.compatible === false || actor.equipmentPreparation?.error
    || target.totalDefense == null || actor.selectedAction?.kind === 'equipment-switch') return null;
  const context = getCombatRollContext(actor, target, options);
  if (context.automaticMode) return { probability: 1, label: 'Automatisch', rollMode: 'normal' };
  const numbers = getCombatAttackNumbers(actor, target, context);
  const { attackModifier } = numbers;
  let probability = 0;
  for (let natural = 1; natural <= 20; natural += 1) {
    const trial = { ...context, usedRuleFrequencyKeys: new Set(context.usedRuleFrequencyKeys) };
    const { attack } = evaluateCombatAttackRoll(actor, target, { natural, total: natural + attackModifier }, trial, numbers);
    const weight = context.safeRollMode === 'advantage' ? (2 * natural - 1) / 400
      : context.safeRollMode === 'disadvantage' ? (41 - 2 * natural) / 400 : 1 / 20;
    if (attack.hit) probability += weight;
  }
  return { probability: Math.max(0, Math.min(1, probability)), label: context.savingThrowMode ? 'Wirkung' : 'Treffer', rollMode: context.safeRollMode };
}

// Bounded sum distribution also handles negative bonuses and the zero damage floor.
export function averageDamageFormula(formula, bonus = 0) {
  const parsed = parseDamageFormula(formula);
  const terms = parsed.terms || [parsed];
  const modifier = parsed.fixedModifier + (Number(bonus) || 0);
  const minimum = terms.reduce((sum, term) => sum + term.diceCount, 0) + modifier;
  if (minimum >= 0) return terms.reduce((sum, term) => sum + term.diceCount * (term.sides + 1) / 2, modifier);
  let distribution = [1];
  for (const term of terms) for (let die = 0; die < term.diceCount; die += 1) {
    const next = Array(distribution.length + term.sides).fill(0);
    distribution.forEach((weight, sum) => { for (let face = 1; face <= term.sides; face += 1) next[sum + face] += weight / term.sides; });
    distribution = next;
  }
  return distribution.reduce((sum, weight, value) => sum + weight * Math.max(0, value + modifier), 0);
}

export function estimateCombatDamage(actor = {}) {
  if (actor.selectedAction?.kind === 'equipment-switch') return null;
  const effects = actor.selectedAction?.effects || [];
  const primary = effects.find(effect => effect.type === 'damage' && !['miss', 'save-success'].includes(effect.on) && effect.target !== 'self');
  if (effects.length && !primary) return null;
  if (primary?.amount > 0 && !primary.formula) return Number(primary.amount);
  const formula = primary?.formula || actor.weapon?.damageFormula;
  if (!formula) return null;
  try { return averageDamageFormula(combineDamageFormulas([formula, ...getBonusDamageFormulas(actor)]), actor.damageModifier); }
  catch { return null; }
}

export function formatCombatChance(chance) {
  if (!chance) return '';
  if (chance.label === 'Automatisch') return 'Automatisch';
  return `${(chance.probability * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % ${chance.label}`;
}
