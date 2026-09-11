import { getCombatRollContext } from './combat-resolution-service.js?v=20260909-dragon-parent-v2';
import { getCombatAttackNumbers, evaluateCombatAttackRoll } from './combat-attack-evaluation.js?v=20260909-dragon-parent-v2';
import { parseDamageFormula, combineDamageFormulas, buildDamageNotation } from './rules/combat-mvp-rules.js';
import { getBonusDamageFormulas, getUniversalDamageBonus, getCombatEffectAttributeModifier } from './combat-profile-model.js?v=20260909-dragon-parent-v2';

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

// Formula and mean describe the same normal main hit as the damage resolver.
// Structured effects take precedence over the legacy weapon/roll formula.
export function getCombatDamagePreview(actor = {}) {
  if (actor.selectedAction?.kind === 'equipment-switch') return null;
  const effects = actor.selectedAction?.effects || [];
  const primary = effects.find(effect => effect.type === 'damage' && !['miss', 'save-success'].includes(effect.on) && effect.target !== 'self');
  if (effects.length && !primary) return null;
  const damageType = primary?.damageType || actor.weapon?.damageType || '';
  if (primary?.amount > 0 && !primary.formula) {
    const modifier = getUniversalDamageBonus(actor);
    const average = Number(primary.amount) + modifier;
    return { notation: String(average), modifier, damageType, average };
  }
  const formula = primary?.formula || actor.weapon?.damageFormula;
  if (!formula) return null;
  const formulas = [formula, ...getBonusDamageFormulas(actor)];
  const modifier = (Number(actor.damageModifier) || 0) + getCombatEffectAttributeModifier(actor, primary);
  try {
    const combined = combineDamageFormulas(formulas);
    return { notation: buildDamageNotation(combined, modifier), modifier, damageType, average: averageDamageFormula(combined, modifier) };
  } catch {
    // Invalid imported formulas remain visible for correction, without a guessed mean.
    return { notation: `${formulas.join('+')}${modifier ? `${modifier > 0 ? '+' : ''}${modifier}` : ''}`, modifier, damageType, average: null };
  }
}

export function estimateCombatDamage(actor = {}) {
  return getCombatDamagePreview(actor)?.average ?? null;
}

export function formatCombatChance(chance) {
  if (!chance) return '';
  if (chance.label === 'Automatisch') return 'Automatisch';
  return `${(chance.probability * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % ${chance.label}`;
}
