const DAMAGE_FORMULA_PATTERN = /^(\d+d(?:4|6|8|10|12))(?:\+\d+d(?:4|6|8|10|12))*(?:[+-]\d+)?$/i;

export function clampSituationalModifier(value) {
  const number = Number(value) || 0;
  return Math.max(-2, Math.min(2, Math.trunc(number)));
}

export function determineRollMode({ advantageSources = [], disadvantageSources = [] } = {}) {
  const advantage = Array.isArray(advantageSources) && advantageSources.length > 0;
  const disadvantage = Array.isArray(disadvantageSources) && disadvantageSources.length > 0;
  if (advantage === disadvantage) return 'normal';
  return advantage ? 'advantage' : 'disadvantage';
}

export function buildAttackNotation(modifier = 0, rollMode = 'normal') {
  const base = rollMode === 'advantage' ? '2d20kh1' : rollMode === 'disadvantage' ? '2d20kl1' : '1d20';
  const safeModifier = Number(modifier) || 0;
  return safeModifier === 0 ? base : `${base}${safeModifier > 0 ? '+' : ''}${safeModifier}`;
}

export function parseDamageFormula(value) {
  const notation = String(value || '').trim().toLowerCase().replace(/\s+/g, '').replace(/w/g, 'd');
  if (!DAMAGE_FORMULA_PATTERN.test(notation)) throw new Error('Die Schadensformel muss z. B. 1W8, 2W6+1 oder 1W10+1W4 lauten.');
  const terms = [...notation.matchAll(/(\d+)d(4|6|8|10|12)/gi)].map(match => ({
    diceCount: Number(match[1]),
    sides: Number(match[2])
  }));
  if (!terms.length || terms.some(term => term.diceCount < 1) || terms.reduce((sum, term) => sum + term.diceCount, 0) > 20) {
    throw new Error('Die Schadensformel enthält zu viele Würfel.');
  }
  const fixedMatch = notation.match(/([+-]\d+)$/);
  const fixedModifier = Number(fixedMatch?.[1] || 0);
  if (terms.length === 1) return { ...terms[0], fixedModifier, notation };
  return {
    diceCount: terms.reduce((sum, term) => sum + term.diceCount, 0),
    sides: null,
    fixedModifier,
    notation,
    terms
  };
}

export function buildDamageNotation(damageFormula, bonus = 0, critical = false) {
  const parsed = parseDamageFormula(damageFormula);
  const terms = parsed.terms || [{ diceCount: parsed.diceCount, sides: parsed.sides }];
  const modifier = parsed.fixedModifier + (Number(bonus) || 0);
  const diceNotation = terms
    .map(term => `${critical ? term.diceCount * 2 : term.diceCount}d${term.sides}`)
    .join('+');
  return `${diceNotation}${modifier === 0 ? '' : `${modifier > 0 ? '+' : ''}${modifier}`}`;
}

export function formatDamageFormula(terms, fixedModifier = 0) {
  const grouped = new Map();
  for (const term of terms) grouped.set(term.sides, (grouped.get(term.sides) || 0) + term.diceCount);
  const dice = [...grouped].map(([sides, count]) => `${count}d${sides}`).join('+');
  return `${dice}${fixedModifier ? `${fixedModifier > 0 ? '+' : ''}${fixedModifier}` : ''}`;
}

// Keep fixed bonuses at the end, including when a higher spell grade adds dice.
export function combineDamageFormulas(formulas = []) {
  const parts = formulas.filter(formula => String(formula || '').trim()).map(parseDamageFormula);
  return formatDamageFormula(
    parts.flatMap(part => part.terms || [{ diceCount: part.diceCount, sides: part.sides }]),
    parts.reduce((sum, part) => sum + part.fixedModifier, 0)
  );
}

export function buildVerifiedModifiers(action = {}) {
  const factors = Array.isArray(action.suggestedFactors) ? action.suggestedFactors : [];
  const verified = factors.filter(factor => factor?.verified === true);
  const advantageSources = verified.filter(factor => factor.effect === 'advantage').map(factor => factor.type);
  const disadvantageSources = verified.filter(factor => factor.effect === 'disadvantage').map(factor => factor.type);
  const numericModifier = clampSituationalModifier(verified.reduce((sum, factor) => (
    sum + (factor.effect === 'numeric' ? Number(factor.value) || 0 : 0)
  ), 0));
  return {
    advantageSources,
    disadvantageSources,
    numericModifier,
    rollMode: determineRollMode({ advantageSources, disadvantageSources })
  };
}

export function evaluateAttackRoll(roll, targetDefense, criticalThreshold = 20) {
  const naturalRoll = Number(roll?.natural);
  const total = Number(roll?.total);
  if (!Number.isFinite(naturalRoll) || !Number.isFinite(total)) {
    throw new Error('Der Angriffswurf enthält kein gültiges W20-Ergebnis.');
  }
  const criticalFailure = naturalRoll === 1;
  const safeCriticalThreshold = Math.max(2, Math.min(20, Math.trunc(Number(criticalThreshold) || 20)));
  const criticalSuccess = naturalRoll >= safeCriticalThreshold;
  return {
    criticalFailure,
    criticalSuccess,
    hit: criticalSuccess || (!criticalFailure && total >= Number(targetDefense))
  };
}

export function applyDamage(currentHitPoints, damage) {
  const before = Math.max(0, Number(currentHitPoints) || 0);
  const applied = Math.max(0, Number(damage) || 0);
  const after = Math.max(0, before - applied);
  return { before, after, applied, incapacitated: after === 0 };
}
