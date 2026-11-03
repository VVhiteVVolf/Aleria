import { parseDamageFormula, formatDamageFormula as formatFormula } from './rules/combat-mvp-rules.js?v=20260905-party-combat-v1';
import { getPairedAttackWeapon, requiresPairedCombatWeapons } from './combat-paired-weapons.js';
import { getWeaponTechniqueTrainingSteps } from '../combat-styles/weapon-technique-budget.js?v=20261103-curriculum-v1';
import { isSharedJungdracheTrainingTechniqueId } from '../combat-styles/drachentanz/techniques/jungdrache-shared-identity.js';
import { getDevelopmentTechniqueId } from '../character-development/development-entry-reference.js';

const ordinaryTrainingSteps = getWeaponTechniqueTrainingSteps();

function usesOrdinaryTrainingSteps(model = {}) {
  const steps = model.scalingSteps || [];
  return model.mode === 'weapon-dice' && !model.lightAttack && steps.length === ordinaryTrainingSteps.length
    && steps.every((step, index) => Number(step.level) === ordinaryTrainingSteps[index].level
      && String(step.formula).toLowerCase() === ordinaryTrainingSteps[index].formula);
}

function getSharedFoundationTrainingSteps(technique, profile) {
  const id = getDevelopmentTechniqueId(technique);
  if (!isSharedJungdracheTrainingTechniqueId(id) || !usesOrdinaryTrainingSteps(technique.damageModel)) return null;
  const purchaseClass = profile.progression?.development?.purchases?.find(purchase => purchase.techniqueId === id)?.classId;
  const classId = String(purchaseClass || profile.templateSelections?.classId || profile.identity?.archetype || '')
    .trim().toLowerCase().replace(/^(?:cenyr|vennyr)-/, '');
  return classId === 'milwr' ? getWeaponTechniqueTrainingSteps({ allowedClassIds: ['milwr'] }) : null;
}

export function getLightAttackDamageModifier(modifier, model = {}) {
  return model.lightAttack ? Math.min(0, modifier) + Math.floor(Math.max(0, modifier) / 2) : modifier;
}

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
export function getTechniqueDamageScaling(technique = {}, profile = {}, context = {}) {
  const level = Math.min(20, Number(profile.progression?.level) || 1);
  if (level < Number(technique.minimumLevel || 1)) return null;
  if (hasExpandedTargetBudget(technique, context)) return null;
  const steps = getSharedFoundationTrainingSteps(technique, profile) || technique.damageModel?.scalingSteps || [];
  return steps.filter(step => Number(step.level) <= level)
    .sort((a, b) => b.level - a.level)[0] || null;
}

function hasExpandedTargetBudget(technique, context) {
  return Number(context.maximumTargets) > Math.max(1, Number(technique.maximumTargets) || 1);
}

// A weapon variant can expand a single-target technique at action time (for
// example the Cantref halberd). Apply the same area caps as the authored factory
// without changing stored attacks, individual weapon dice or past receipts.
export function getTechniqueDamageModel(technique = {}, context = {}) {
  const model = technique.damageModel || {};
  if (model.mode !== 'weapon-dice' || !hasExpandedTargetBudget(technique, context)) return model;
  return { ...model, scalingSteps: [],
    bonusWeaponDieCap: Math.min(6, Number(model.bonusWeaponDieCap) || 12),
    weaponBonuses: (model.weaponBonuses || []).map(group => ({ ...group, dieCap: Math.min(6, group.dieCap) })) };
}

export function describeTechniqueDamage(technique = {}, profile = {}, context = {}) {
  const model = getTechniqueDamageModel(technique, context);
  if (model.mode === 'none') return 'Kein direkter Schaden';
  const base = model.mode === 'weapon-dice'
    ? `${requiresPairedCombatWeapons(technique) ? 'Würfel beider Waffen' : `${model.weaponDiceMultiplier || 1}× Waffenwürfel`}${model.baseDieCap ? ` (je höchstens W${model.baseDieCap})` : ''}${model.bonusWeaponDice ? ` + ${model.bonusWeaponDice} Waffen-Zusatzwürfel (je höchstens W${model.bonusWeaponDieCap})` : ''}${(model.weaponBonuses || []).map(group => ` + ${group.diceCount} Waffen-Zusatzwürfel (je höchstens W${group.dieCap})`).join('')}${model.bonusFormula ? ` + ${model.bonusFormula}` : ''}`
    : technique.damageFormula || 'Kein direkter Schaden';
  const scaling = getTechniqueDamageScaling(technique, profile, context);
  return `${base}${model.bonusModifier ? ` ${model.bonusModifier > 0 ? '+' : '−'} ${Math.abs(model.bonusModifier)} Technikmodifikator` : ''}${scaling ? ` + ${scaling.formula} Ausbildungsbonus` : ''}${model.lightAttack ? ' · halbe positive feste Schadensboni (abgerundet)' : ''}`.replace(/(\d)d(\d)/g, '$1W$2');
}

export function resolveTechniqueDamageFormula(technique = {}, weapon = {}, profile = {}, context = {}) {
  if (technique.damageModel?.mode === 'none') return '';
  if (technique.effects?.length && !technique.effects.some(effect => effect.type === 'damage') && !technique.damageFormula) return '';
  const model = getTechniqueDamageModel(technique, context);
  const scaling = getFormulaParts(getTechniqueDamageScaling(technique, profile, context)?.formula);
  if (model.mode !== 'weapon-dice') {
    const formula = String(technique.damageFormula || weapon.damageFormula || '').trim().toLowerCase();
    if (!scaling.terms.length) return formula;
    const base = getFormulaParts(formula);
    return formatFormula([...base.terms, ...scaling.terms], base.fixedModifier + scaling.fixedModifier);
  }
  const pairedWeapon = getPairedAttackWeapon(weapon, profile, technique);
  const base = getFormulaParts(pairedWeapon.damageFormula);
  if (!base.terms.length) return '';
  const multiplier = Math.max(1, Math.min(6, Math.trunc(Number(model.weaponDiceMultiplier) || 1)));
  const bonus = getFormulaParts(model.bonusFormula);
  const extraDice = Math.max(0, Math.min(3, Math.trunc(Number(model.bonusWeaponDice) || 0)));
  // A two-die greatsword adds one die per bonus, rather than duplicating both dice.
  const extraSides = Math.min(base.terms[0].sides, Number(model.bonusWeaponDieCap) || 12);
  return formatFormula([
    ...base.terms.map(term => ({ ...term, diceCount: term.diceCount * multiplier,
      sides: Math.min(term.sides, Number(model.baseDieCap) || 12) })),
    ...(extraDice ? [{ diceCount: extraDice, sides: extraSides }] : []),
    ...(model.weaponBonuses || []).map(group => ({ diceCount: group.diceCount,
      sides: Math.min(base.terms[0].sides, group.dieCap) })),
    ...bonus.terms, ...scaling.terms
  ], base.fixedModifier + bonus.fixedModifier + scaling.fixedModifier + (Number(model.bonusModifier) || 0));
}

export const combatTechniqueDamageInternals = Object.freeze({ formatFormula, getFormulaParts });
