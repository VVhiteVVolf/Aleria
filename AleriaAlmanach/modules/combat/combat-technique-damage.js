import { parseDamageFormula, formatDamageFormula as formatFormula } from './rules/combat-mvp-rules.js?v=20260905-party-combat-v1';

function getFormulaParts(formula) {
  if (!String(formula || '').trim()) return { terms: [], fixedModifier: 0 };
  const parsed = parseDamageFormula(formula);
  return {
    terms: parsed.terms || [{ diceCount: parsed.diceCount, sides: parsed.sides }],
    fixedModifier: parsed.fixedModifier
  };
}

// Legacy techniques keep their authored formula. Only explicit scalingSteps add
// training damage; the highest earned step replaces all earlier steps.
export function getTechniqueDamageScaling(technique = {}, profile = {}) {
  const level = Math.min(20, Number(profile.progression?.level) || 1);
  if (level < Number(technique.minimumLevel || 1)) return null;
  return (technique.damageModel?.scalingSteps || []).filter(step => Number(step.level) <= level)
    .sort((a, b) => b.level - a.level)[0] || null;
}

export function describeTechniqueDamage(technique = {}, profile = {}) {
  const model = technique.damageModel || {};
  const base = model.mode === 'weapon-dice'
    ? `${model.weaponDiceMultiplier || 1}× Waffenwürfel${model.bonusWeaponDice ? ` + ${model.bonusWeaponDice} Waffen-Zusatzwürfel (je höchstens W${model.bonusWeaponDieCap})` : ''}${model.bonusFormula ? ` + ${model.bonusFormula}` : ''}`
    : technique.damageFormula || 'Kein direkter Schaden';
  const scaling = getTechniqueDamageScaling(technique, profile);
  return `${base}${scaling ? ` + ${scaling.formula} Ausbildungsbonus` : ''}`.replace(/(\d)d(\d)/g, '$1W$2');
}

export function resolveTechniqueDamageFormula(technique = {}, weapon = {}, profile = {}) {
  const model = technique.damageModel || {};
  const scaling = getFormulaParts(getTechniqueDamageScaling(technique, profile)?.formula);
  if (model.mode !== 'weapon-dice') {
    const formula = String(technique.damageFormula || weapon.damageFormula || '').trim().toLowerCase();
    if (!scaling.terms.length) return formula;
    const base = getFormulaParts(formula);
    return formatFormula([...base.terms, ...scaling.terms], base.fixedModifier + scaling.fixedModifier);
  }
  const base = getFormulaParts(weapon.damageFormula);
  if (!base.terms.length) return '';
  const multiplier = Math.max(1, Math.min(6, Math.trunc(Number(model.weaponDiceMultiplier) || 1)));
  const bonus = getFormulaParts(model.bonusFormula);
  const extraDice = Math.max(0, Math.min(3, Math.trunc(Number(model.bonusWeaponDice) || 0)));
  // A two-die greatsword adds one die per bonus, rather than duplicating both dice.
  const extraSides = Math.min(base.terms[0].sides, Number(model.bonusWeaponDieCap) || 12);
  return formatFormula([
    ...base.terms.map(term => ({ ...term, diceCount: term.diceCount * multiplier })),
    ...(extraDice ? [{ diceCount: extraDice, sides: extraSides }] : []),
    ...bonus.terms, ...scaling.terms
  ], base.fixedModifier + bonus.fixedModifier + scaling.fixedModifier);
}

export const combatTechniqueDamageInternals = Object.freeze({ formatFormula, getFormulaParts });
