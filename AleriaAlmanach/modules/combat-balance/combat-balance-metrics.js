import { parseDamageFormula, buildDamageRollPlan } from '../combat/rules/combat-mvp-rules.js';
import { resolveTechniqueDamageFormula } from '../combat/combat-technique-damage.js';

export function damageMetrics(formula, bonus = 0) {
  if (!formula) return null;
  const parsed = parseDamageFormula(formula), terms = parsed.terms || [parsed];
  const fixed = parsed.fixedModifier + bonus;
  const dice = terms.reduce((sum, term) => sum + term.diceCount, 0);
  const maximum = terms.reduce((sum, term) => sum + term.diceCount * term.sides, 0);
  const average = terms.reduce((sum, term) => sum + term.diceCount * (term.sides + 1) / 2, 0);
  return { formula, dice, diceMaximum: maximum, fixedBonus: fixed, minimum: Math.max(0, dice + fixed), average: Math.max(0, average + fixed), maximum: Math.max(0, maximum + fixed),
    critical: { minimum: Math.max(0, maximum + dice + fixed), average: Math.max(0, maximum + average + fixed),
      maximum: Math.max(0, maximum * 2 + fixed), notation: buildDamageRollPlan(formula, bonus, true).notation } };
}

export function techniqueBalanceRow(technique, weaponFormula = '1d8') {
  const profile = { progression: { level: technique.minimumLevel } };
  const formula = resolveTechniqueDamageFormula(technique, { damageFormula: weaponFormula }, profile);
  const counter = technique.effects?.map(effect => effect.condition?.counterAttack).find(c => c?.enabled);
  const save = technique.secondarySave?.enabled ? technique.secondarySave : counter?.secondarySave;
  return { id: technique.id, name: technique.name, style: technique.combatStyleId, level: technique.minimumLevel,
    role: counter ? 'prepared-counter' : formula ? 'attack' : 'support',
    costs: technique.costs.map(({ resourceId, amount }) => ({ resourceId, amount })),
    damage: damageMetrics(formula), targets: technique.maximumTargets,
    accuracy: { attackBonus: technique.attackBonus, targetDefenseModifier: technique.targetDefenseModifier, criticalThreshold: technique.criticalThreshold },
    ...(save?.enabled ? { save: { attribute: save.attributeKey, base: save.dcBase, weaponAttribute: !!save.useWeaponAttribute, fixed: save.fixedDc ?? null } } : {}),
    ...(counter ? { counterDamage: damageMetrics(counter.damageModel ? resolveTechniqueDamageFormula({ damageModel: counter.damageModel }, { damageFormula: weaponFormula }, profile) : weaponFormula) } : {}) };
}

export function profileEntryBalanceRow(owner, kind, entry) {
  const formulas = [...new Set([entry.damageFormula, entry.rollFormula, ...(entry.effects || []).map(effect => effect.formula)].filter(Boolean))];
  const structured = !!((entry.effects || []).some(effect => effect.type !== 'narrative')
    || Object.values(entry.mechanics || {}).some(value => typeof value === 'number' ? value !== 0
      : Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim() !== '' : value === true)
    || entry.triggerRules?.length || entry.secondarySave?.enabled || entry.damageFormula);
  return { ownerId: owner.id, owner: owner.name, entityType: owner.entityType || 'character',
    kind, id: entry.id, name: entry.name, activation: entry.activationType,
    costs: (entry.costs || []).map(({ resourceId, amount }) => ({ resourceId, amount })),
    usesMaximum: entry.usesMaximum || 0, recovery: entry.recovery || '',
    adjudication: structured ? 'structured' : 'narrative-or-passive-trait', formulas: formulas.map(formula => damageMetrics(formula)) };
}
