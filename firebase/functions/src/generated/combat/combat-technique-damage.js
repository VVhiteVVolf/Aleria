import { parseDamageFormula, formatDamageFormula as formatFormula } from './rules/combat-mvp-rules.js?v=20260905-party-combat-v1';
import { getPairedAttackWeapon, requiresPairedCombatWeapons } from './combat-paired-weapons.js';
import { getWeaponTechniqueTrainingSteps, SPECIAL_RANK_TECHNIQUE_STEPS } from '../combat-styles/weapon-technique-budget.js?v=20261121-class-passives-v1';
import { isSharedJungdracheControlTechniqueId, isSharedJungdracheTrainingTechniqueId } from '../combat-styles/drachentanz/techniques/jungdrache-shared-identity.js';
import { getDevelopmentTechniqueId } from '../character-development/development-entry-reference.js';
import { inferCombatEffectTargetLimit } from './combat-effect-model.js';

const ordinaryTrainingSteps = getWeaponTechniqueTrainingSteps();
const ordinaryBaseSteps = ordinaryTrainingSteps.filter(step => step.level <= 20);
const controlTrainingSteps = Object.freeze([
  Object.freeze({ level: 25, formula: '1' }),
  Object.freeze({ level: 30, formula: '1d6' })
]);

function usesOrdinaryTrainingSteps(model = {}) {
  const steps = (model.scalingSteps || []).filter(step => Number(step.level) <= 20);
  return model.mode === 'weapon-dice' && !model.lightAttack && steps.length === ordinaryBaseSteps.length
    && steps.every((step, index) => Number(step.level) === ordinaryBaseSteps[index].level
      && String(step.formula).toLowerCase() === ordinaryBaseSteps[index].formula);
}

function getSharedFoundationTrainingSteps(technique, profile) {
  const id = getDevelopmentTechniqueId(technique);
  if (!isSharedJungdracheTrainingTechniqueId(id) || !usesOrdinaryTrainingSteps(technique.damageModel)) return null;
  const purchaseClass = profile.progression?.development?.purchases?.find(purchase => purchase.techniqueId === id)?.classId;
  const classId = String(purchaseClass || profile.templateSelections?.classId || profile.classTraining?.curriculumId || profile.identity?.archetype || '')
    .trim().toLowerCase().replace(/^(?:cenyr|vennyr)-/, '');
  return classId === 'milwr' ? getWeaponTechniqueTrainingSteps({ allowedClassIds: ['milwr'] }) : null;
}

export function getLightAttackDamageModifier(modifier, model = {}) {
  return model.lightAttack ? Math.min(0, modifier) + Math.floor(Math.max(0, modifier) / 2) : modifier;
}

function getFormulaParts(formula) {
  const notation = String(formula || '').trim();
  if (!notation || /^[+-]?\d+$/.test(notation)) return { terms: [], fixedModifier: Number(notation) };
  const parsed = parseDamageFormula(notation);
  return {
    terms: parsed.terms || [{ diceCount: parsed.diceCount, sides: parsed.sides }],
    fixedModifier: parsed.fixedModifier
  };
}

export function getTechniquePrimaryDamageIndex(technique = {}) {
  return (technique.effects || []).findIndex(effect => effect.type === 'damage' && effect.target !== 'self'
    && !['miss', 'save-success'].includes(effect.on));
}

function hasPrimaryDamage(technique) {
  return technique.damageModel?.mode !== 'none' && Boolean(technique.id || technique.name || technique.damageFormula)
    && (!technique.effects?.length || getTechniquePrimaryDamageIndex(technique) >= 0);
}

function getTrainingSteps(technique, profile) {
  const authored = technique.damageModel?.scalingSteps || [];
  if (authored.some(step => Number(step.level) > 20)) return getSharedFoundationTrainingSteps(technique, profile) || authored;
  const shared = getSharedFoundationTrainingSteps(technique, profile);
  if (shared) return shared;
  if (isSharedJungdracheControlTechniqueId(getDevelopmentTechniqueId(technique))) return authored.concat(controlTrainingSteps);
  if (authored.length) return authored.concat(SPECIAL_RANK_TECHNIQUE_STEPS);
  // Some established control techniques use their whole ordinary budget for
  // the rider effect. Their original base still receives the special-rank steps.
  if (technique.secondarySave?.enabled) return SPECIAL_RANK_TECHNIQUE_STEPS;
  return ordinaryTrainingSteps;
}

export function getTechniqueTrainingLevel(profile = {}) {
  const level = Math.max(1, Math.min(20, Math.trunc(Number(profile.progression?.level) || 1)));
  return level + Math.max(0, Math.min(10, Math.trunc(Number(profile.progression?.specialLevels) || 0)));
}

// The highest earned step replaces all earlier steps. Fixed formulas and
// old copies receive the same training without rewriting the stored entry.
export function getTechniqueDamageScaling(technique = {}, profile = {}, context = {}) {
  const level = Math.min(getTechniqueTrainingLevel(profile), context.maximumTrainingLevel ?? 30);
  if (level < Number(technique.minimumLevel || 1) || !hasPrimaryDamage(technique) || technique.damageModel?.lightAttack) return null;
  const baseLimit = Number(technique.maximumTargets) || inferCombatEffectTargetLimit(technique.effects || []);
  if (Math.max(baseLimit, Number(context.maximumTargets) || 1) > 1) return null;
  const steps = getTrainingSteps(technique, profile);
  return steps.filter(step => Number(step.level) <= level)
    .sort((a, b) => b.level - a.level)[0] || null;
}

export function applyTechniqueTrainingToFormula(formula, scaling) {
  if (!formula || !scaling?.formula) return formula;
  const base = getFormulaParts(formula);
  const extra = getFormulaParts(scaling.formula);
  const terms = [...base.terms, ...extra.terms];
  const modifier = base.fixedModifier + extra.fixedModifier;
  return terms.length ? formatFormula(terms, modifier) : String(modifier);
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
  const smallBudget = getTechniqueTrainingLevel(profile) >= 30 && hasPrimaryDamage(technique)
    && (model.lightAttack || Math.max(Number(context.maximumTargets) || 1,
      Number(technique.maximumTargets) || inferCombatEffectTargetLimit(technique.effects || [])) > 1);
  return `${base}${model.bonusModifier ? ` ${model.bonusModifier > 0 ? '+' : '−'} ${Math.abs(model.bonusModifier)} Technikmodifikator` : ''}${scaling ? ` + ${scaling.formula} Ausbildungsbonus` : ''}${model.lightAttack ? ' · halbe positive feste Schadensboni (abgerundet)' : ''}${smallBudget ? ' · auf Gesamtstufe 30 einmal +1 pro Beitrag für leichte und Flächentreffer zusammen' : ''}`.replace(/(\d)d(\d)/g, '$1W$2');
}

export function resolveTechniqueDamageFormula(technique = {}, weapon = {}, profile = {}, context = {}) {
  if (technique.damageModel?.mode === 'none') return '';
  if (technique.effects?.length && !technique.effects.some(effect => effect.type === 'damage') && !technique.damageFormula) return '';
  const model = getTechniqueDamageModel(technique, context);
  const step = getTechniqueDamageScaling(technique, profile, context);
  const primary = technique.effects?.[getTechniquePrimaryDamageIndex(technique)];
  if (primary?.formula) return applyTechniqueTrainingToFormula(primary.formula, step);
  if (primary?.amount > 0 && step) return applyTechniqueTrainingToFormula(String(primary.amount), step);
  const scaling = getFormulaParts(step?.formula);
  if (model.mode !== 'weapon-dice') {
    const formula = String(technique.damageFormula || weapon.damageFormula || '').trim().toLowerCase();
    return applyTechniqueTrainingToFormula(formula, step);
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
