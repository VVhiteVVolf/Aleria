import {
  COMBAT_ATTRIBUTE_DEFINITIONS,
  getAttributeModifier,
  getEffectiveCombatLevel,
  getMaximumHitPoints,
  getArmorClass,
  getHitPointProgression,
  setCharacterHitPointMaximum,
  getProficiencyBonus,
  sanitizeCharacterCombatProfile
} from './combat-profile-model.js?v=20260928-equipment-art-v4';
import { preserveHitPointDeficit } from './combat-hit-point-progression.js?v=20260906-character-vitality-v1';
import { getArmorRoutine } from '../classes/armor-routine.js?v=20260906-armor-routine-v1';
import { applyCenyrClassLevelProgression } from '../classes/cenyr/cenyr-class-combat-rules.js?v=20260909-dragon-parent-v2';

import { getActionPoolChoiceGroups, fillActionPoolChoices, normalizeActionPoolChoices, ACTION_POOL_LABELS } from './combat-action-progression.js?v=20260905-resource-balance-v2';
import { normalizeDevelopment } from '../character-development/development-state.js';
import { applyDevelopmentChoices } from '../character-development/development-purchases.js';
import { DEVELOPMENT_TRAITS } from '../character-development/development-traits.js';
import { getDevelopmentTraitId } from '../character-development/development-entry-reference.js';
const HIT_POINT_MODES = new Set(['recommended', 'manual', 'unchanged']);
const SKILL_PROFICIENCIES = new Set(['none', 'trained', 'expertise']);
export const CHARACTER_ATTRIBUTE_INCREASE_LEVELS = Object.freeze([4, 8, 12, 16, 20]);

function boundedInteger(value, fallback, minimum, maximum) {
  if (value === '' || value == null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

function optionalInteger(value, minimum, maximum) {
  if (value === '' || value == null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

function text(value, maximumLength) {
  return String(value || '').trim().slice(0, maximumLength);
}

function getAttribute(profile, key) {
  return profile.attributes.find(attribute => attribute.key === key);
}

function getNextProgression(profile) {
  const { level, specialLevels } = profile.progression;
  if (level < 20) return { level: level + 1, specialLevels, kind: 'normal' };
  if (specialLevels < 10) return { level, specialLevels: specialLevels + 1, kind: 'special' };
  return null;
}

export function getLevelUpAttributePointAllowance(profile = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  const next = getNextProgression(normalized);
  if (!next) return 0;
  if (next.kind === 'special') return 4;
  return CHARACTER_ATTRIBUTE_INCREASE_LEVELS.includes(next.level) ? 2 : 0;
}

function makeUniqueId(profile, collection, prefix, targetLevel) {
  const existing = new Set(collection.map(item => String(item.id || '')));
  let index = collection.length + 1;
  let id = `${prefix}-level-${targetLevel}-${index}`;
  while (existing.has(id)) {
    index += 1;
    id = `${prefix}-level-${targetLevel}-${index}`;
  }
  return id;
}

function normalizeAttributeIncreases(value = {}) {
  return Object.fromEntries(COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => [
    attribute.key,
    boundedInteger(value?.[attribute.key], 0, 0, 10)
  ]));
}

function normalizeResourceIncreases(profile, value = {}) {
  return Object.fromEntries(profile.resources.map(resource => [
    resource.id,
    {
      current: boundedInteger(value?.[resource.id]?.current, 0, -9999, 9999),
      maximum: boundedInteger(value?.[resource.id]?.maximum, 0, -9999, 9999)
    }
  ]));
}

function normalizePlan(profile, value = {}) {
  const hpMode = text(value.hitPointMode, 20);
  const newSkill = value.newSkill || {};
  const newAbility = value.newAbility || {};
  const newSpell = value.newSpell || {};
  const skillProficiency = text(newSkill.proficiency, 20);
  return {
    targetLevel: boundedInteger(value.targetLevel, Math.min(30, getEffectiveCombatLevel(profile) + 1), getEffectiveCombatLevel(profile), 30),
    purchaseClass: value.purchaseClass == null ? 'own' : text(value.purchaseClass, 120),
    purchaseSearch: text(value.purchaseSearch, 120),
    traitSearch: text(value.traitSearch, 120),
    traitGroup: ['all','selected','normal','body','unique','aptitude','bloodline','therianthropy','symbiosis','affliction','fever','addiction','tolerance','psychological','positive','negative'].includes(value.traitGroup) ? value.traitGroup : 'all',
    development: normalizeDevelopment({ ...profile.progression.development, ...value.development }),
    purchaseIds: [...new Set((Array.isArray(value.purchaseIds)?value.purchaseIds:[]).map(id => text(id, 400)))].slice(0, 256),
    traitIds: [...new Set((Array.isArray(value.traitIds)?value.traitIds:profile.quirks.filter(q => q.active !== false && DEVELOPMENT_TRAITS.some(t => t.id === getDevelopmentTraitId(q))).map(getDevelopmentTraitId)).map(id => text(id, 120)))],
    experience: boundedInteger(value.experience, profile.progression.experience, 0, 999999999),
    nextLevelExperience: optionalInteger(value.nextLevelExperience, 1, 999999999),
    hitPointMode: HIT_POINT_MODES.has(hpMode) ? hpMode : 'recommended',
    manualHitPointGain: boundedInteger(value.manualHitPointGain, getSuggestedHitPointGain(profile), 0, 9999),
    restoreGainedHitPoints: value.restoreGainedHitPoints !== false,
    attributeIncreases: normalizeAttributeIncreases(value.attributeIncreases),
    resourceIncreases: normalizeResourceIncreases(profile, value.resourceIncreases),
    actionPoolChoices: Object.fromEntries(Object.entries(value.actionPoolChoices || {}).filter(([level, id]) => [10, 15, 20].includes(Number(level)) && Object.hasOwn(ACTION_POOL_LABELS, id))),
    classTrainingChoices: {
      foundation: text(value.classTrainingChoices?.foundation, 120),
      branch: text(value.classTrainingChoices?.branch, 120),
      path: text(value.classTrainingChoices?.path, 120)
    },
    cenyrTechniqueChoices: Object.fromEntries(Object.entries(value.cenyrTechniqueChoices || {})
      .slice(0, 40)
      .map(([slotId, techniqueId]) => [text(slotId, 120), text(techniqueId, 180)])
      .filter(([slotId, techniqueId]) => slotId && techniqueId)),
    newSkill: {
      name: text(newSkill.name, 100),
      attributeKey: COMBAT_ATTRIBUTE_DEFINITIONS.some(attribute => attribute.key === newSkill.attributeKey)
        ? newSkill.attributeKey
        : 'dexterity',
      proficiency: SKILL_PROFICIENCIES.has(skillProficiency) ? skillProficiency : 'trained',
      bonus: boundedInteger(newSkill.bonus, 0, -99, 99),
      notes: text(newSkill.notes, 500)
    },
    newAbility: {
      name: text(newAbility.name, 120),
      description: text(newAbility.description, 1600),
      usesMaximum: boundedInteger(newAbility.usesMaximum, 0, 0, 999),
      recovery: text(newAbility.recovery, 20) || 'none',
      rollFormula: text(newAbility.rollFormula, 40)
    },
    newSpell: {
      name: text(newSpell.name, 120),
      level: boundedInteger(newSpell.level, 0, 0, 10),
      manaCost: boundedInteger(newSpell.manaCost, 0, 0, 999),
      rollFormula: text(newSpell.rollFormula, 40),
      description: text(newSpell.description, 1600),
      prepared: newSpell.prepared !== false
    }
  };
}

function appendChange(changes, key, label, before, after) {
  if (String(before) === String(after)) return;
  changes.push({ key, label, before, after });
}

function applyOptionalAdditions(profile, plan, targetLevel, changes) {
  if (plan.newSkill.name) {
    profile.skills.push({
      id: makeUniqueId(profile, profile.skills, 'skill', targetLevel),
      ...plan.newSkill
    });
    changes.push({ key: 'new-skill', label: 'Neue Fertigkeit', before: '—', after: plan.newSkill.name });
  }

  if (plan.newAbility.name) {
    profile.abilities.push({
      id: makeUniqueId(profile, profile.abilities, 'ability', targetLevel),
      name: plan.newAbility.name,
      description: plan.newAbility.description,
      usesCurrent: plan.newAbility.usesMaximum,
      usesMaximum: plan.newAbility.usesMaximum,
      recovery: plan.newAbility.recovery,
      rollFormula: plan.newAbility.rollFormula,
      active: true,
      mechanics: {}
    });
    changes.push({ key: 'new-ability', label: 'Neue Fähigkeit', before: '—', after: plan.newAbility.name });
  }

  if (plan.newSpell.name) {
    profile.magic.enabled = true;
    profile.magic.spells.push({
      id: makeUniqueId(profile, profile.magic.spells, 'spell', targetLevel),
      ...plan.newSpell
    });
    changes.push({ key: 'new-spell', label: 'Neuer Zauber', before: '—', after: plan.newSpell.name });
  }
}

function applyResourceIncreases(profile, plan, changes) {
  profile.resources.forEach(resource => {
    if (['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'].includes(resource.id)) return;
    const increase = plan.resourceIncreases[resource.id];
    if (!increase) return;
    const beforeMaximum = resource.maximum;
    const beforeCurrent = resource.current;
    resource.maximum = Math.max(0, Math.min(9999, resource.maximum + increase.maximum));
    resource.current = Math.max(-9999, Math.min(9999, resource.current + increase.current));
    appendChange(changes, `resource-${resource.id}-maximum`, `${resource.name} Maximum`, beforeMaximum, resource.maximum);
    appendChange(changes, `resource-${resource.id}-current`, `${resource.name} aktuell`, beforeCurrent, resource.current);
  });
}

export function getSuggestedHitPointGain(profile = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  const constitution = getAttribute(normalized, 'constitution');
  const average = normalized.hitPoints.averagePerLevelOverride
    ?? Math.floor(normalized.hitPoints.hitDie / 2) + 1;
  return Math.max(1, average + getAttributeModifier(constitution));
}

export function createCharacterLevelUpPlan(profile = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  return normalizePlan(normalized, {
    experience: normalized.progression.experience,
    nextLevelExperience: normalized.progression.nextLevelExperience,
    hitPointMode: 'recommended',
    manualHitPointGain: getSuggestedHitPointGain(normalized),
    restoreGainedHitPoints: true,
    attributeIncreases: {},
    resourceIncreases: {},
    classTrainingChoices: {},
    cenyrTechniqueChoices: {},
    newSkill: { proficiency: 'trained', attributeKey: 'dexterity' },
    newAbility: {},
    newSpell: { prepared: true }
  });
}

function previewSingleCharacterLevelUp(profile = {}, planValue = {}) {
  const beforeProfile = sanitizeCharacterCombatProfile(profile);
  const nextProgression = getNextProgression(beforeProfile);
  if (!nextProgression) {
    return {
      ready: false,
      errors: ['Die maximale Gesamtstufe 30 ist bereits erreicht.'],
      profile: beforeProfile,
      plan: normalizePlan(beforeProfile, planValue),
      changes: [],
      before: null,
      after: null
    };
  }

  const plan = normalizePlan(beforeProfile, planValue);
  const classTrainingChoiceGroups = [];
  const attributePointAllowance = getLevelUpAttributePointAllowance(beforeProfile);
  const allocatedAttributePoints = Object.values(plan.attributeIncreases)
    .reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  const attributeErrors = [];
  const classTrainingErrors = classTrainingChoiceGroups
    .filter(group => group.required && !plan.classTrainingChoices[group.kind])
    .map(group => `Wähle für diesen Stufenaufstieg: ${group.label}.`);
  const nextProfile = sanitizeCharacterCombatProfile(beforeProfile);
  const proposedPoolChoices = [...beforeProfile.progression.actionPoolChoices.filter(choice => !Object.hasOwn(plan.actionPoolChoices, choice.level)),
    ...Object.entries(plan.actionPoolChoices).map(([level, resourceId]) => ({ level: Number(level), resourceId }))];
  const actionPoolChoices = normalizeActionPoolChoices(proposedPoolChoices, nextProgression.level);
  const actionPoolChoiceGroups = getActionPoolChoiceGroups(actionPoolChoices, nextProgression.level);
  const actionPoolErrors = actionPoolChoiceGroups.filter(group => !group.selectedId).map(group => `Wähle die Poolsteigerung für Stufe ${group.level}: Aktion, Bonusaktion oder Reaktion (je höchstens 2).`);
  nextProfile.progression.actionPoolChoices = actionPoolChoices;
  const beforeMaximumHitPoints = getMaximumHitPoints(beforeProfile);
  const beforeProficiency = getProficiencyBonus(beforeProfile);
  const beforeLevel = getEffectiveCombatLevel(beforeProfile);
  const changes = [];

  nextProfile.progression.level = nextProgression.level;
  nextProfile.progression.specialLevels = nextProgression.specialLevels;
  nextProfile.progression.experience = plan.experience;
  nextProfile.progression.nextLevelExperience = plan.nextLevelExperience;

  COMBAT_ATTRIBUTE_DEFINITIONS.forEach(definition => {
    const attribute = getAttribute(nextProfile, definition.key);
    const increase = plan.attributeIncreases[definition.key];
    if (!attribute || increase <= 0) return;
    const before = attribute.score;
    attribute.score = Math.min(40, attribute.score + increase);
    appendChange(changes, `attribute-${definition.key}`, attribute.label, before, attribute.score);
  });

  const suggestedGain = getSuggestedHitPointGain(nextProfile);
  if (beforeProfile.hitPoints.vitality) {
    const beforeHp = getHitPointProgression(beforeProfile);
    const nextHp = getHitPointProgression(nextProfile);
    // Retroactive CON changes apply to attained levels as well as the new roll.
    const beforeWithNewAttributes = { ...nextProfile, progression: beforeProfile.progression };
    const retroactiveBase = getHitPointProgression(beforeWithNewAttributes).standard.base - beforeHp.standard.base;
    const vitalityGain = nextHp.standard.bonus - beforeHp.standard.bonus;
    const nextVitality = Math.max(0, beforeHp.vitality + vitalityGain);
    if (plan.hitPointMode === 'manual') {
      setCharacterHitPointMaximum(nextProfile, beforeMaximumHitPoints + retroactiveBase + plan.manualHitPointGain + vitalityGain, nextVitality);
    } else if (plan.hitPointMode === 'unchanged') {
      setCharacterHitPointMaximum(nextProfile, beforeMaximumHitPoints, beforeHp.vitality);
    }
    // Recommended progression is derived, including anchored rolled/override totals.
  } else if (plan.hitPointMode === 'manual') {
    nextProfile.hitPoints.maximumOverride = Math.min(9999, beforeMaximumHitPoints + plan.manualHitPointGain);
  } else if (plan.hitPointMode === 'unchanged') {
    nextProfile.hitPoints.maximumOverride = beforeMaximumHitPoints;
  } else if (beforeProfile.hitPoints.maximumOverride != null) {
    nextProfile.hitPoints.maximumOverride = Math.min(9999, beforeMaximumHitPoints + suggestedGain);
  } else {
    nextProfile.hitPoints.maximumOverride = null;
  }

  const interimProfile = sanitizeCharacterCombatProfile(nextProfile);
  const afterMaximumHitPoints = getMaximumHitPoints(interimProfile);
  if (interimProfile.hitPoints.current != null) {
    interimProfile.hitPoints.current = plan.restoreGainedHitPoints
      ? preserveHitPointDeficit(interimProfile.hitPoints.current, beforeMaximumHitPoints, afterMaximumHitPoints)
      : Math.max(0, Math.min(afterMaximumHitPoints, interimProfile.hitPoints.current));
  }

  applyResourceIncreases(interimProfile, plan, changes);

  const classTechniqueChoiceGroups = [];
  const classProgression = applyCenyrClassLevelProgression(interimProfile, nextProgression.level);
  classProgression.unlockedFeatures.forEach(feature => changes.push({
    key: `class-feature-${feature.id}`,
    label: 'Neues Klassenmerkmal',
    before: '—',
    after: feature.name
  }));

  applyOptionalAdditions(classProgression.profile, plan, beforeLevel + 1, changes);
  const finalProfile = sanitizeCharacterCombatProfile(classProgression.profile);
  const afterProficiency = getProficiencyBonus(finalProfile);
  const armorRoutine = getArmorRoutine(finalProfile);
  if (armorRoutine?.unlocked && !getArmorRoutine(beforeProfile)?.unlocked) {
    changes.push({ key: 'class-feature-armor-routine', label: 'Neues Klassenmerkmal', before: '—', after: armorRoutine.name });
  }
  appendChange(changes, 'armor-class', 'Rüstungsklasse', getArmorClass(beforeProfile), getArmorClass(finalProfile));

  ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'].forEach(resourceId => {
    const beforeResource = beforeProfile.resources.find(resource => resource.id === resourceId);
    const afterResource = finalProfile.resources.find(resource => resource.id === resourceId);
    if (!beforeResource || !afterResource) return;
    appendChange(
      changes,
      `resource-${resourceId}-maximum`,
      `${afterResource.name} Maximum`,
      beforeResource.maximum,
      afterResource.maximum
    );
  });

  changes.unshift({ key: 'level', label: nextProgression.kind === 'special' ? 'Sonderstufe' : 'Stufe', before: beforeLevel, after: beforeLevel + 1 });
  appendChange(changes, 'experience', 'Erfahrung', beforeProfile.progression.experience, finalProfile.progression.experience);
  appendChange(changes, 'next-level-experience', 'Nächste Stufe bei', beforeProfile.progression.nextLevelExperience ?? '—', finalProfile.progression.nextLevelExperience ?? '—');
  appendChange(changes, 'maximum-hit-points', 'Maximale Trefferpunkte', beforeMaximumHitPoints, getMaximumHitPoints(finalProfile));
  appendChange(changes, 'current-hit-points', 'Aktuelle Trefferpunkte', beforeProfile.hitPoints.current ?? '—', finalProfile.hitPoints.current ?? '—');
  appendChange(changes, 'proficiency', 'Kompetenzbonus', beforeProficiency, afterProficiency);

  return {
    ready: attributeErrors.length === 0 && classTrainingErrors.length === 0 && actionPoolErrors.length === 0,
    errors: [...attributeErrors, ...classTrainingErrors, ...actionPoolErrors],
    profile: finalProfile,
    plan,
    changes,
    attributePointAllowance,
    allocatedAttributePoints,
    remainingAttributePoints: attributePointAllowance - allocatedAttributePoints,
    classTrainingChoiceGroups,
    classTechniqueChoiceGroups,
    actionPoolChoiceGroups,
    before: {
      level: beforeLevel,
      maximumHitPoints: beforeMaximumHitPoints,
      proficiencyBonus: beforeProficiency
    },
    after: {
      level: beforeLevel + 1,
      levelKind: nextProgression.kind,
      normalLevel: nextProgression.level,
      specialLevels: nextProgression.specialLevels,
      maximumHitPoints: getMaximumHitPoints(finalProfile),
      proficiencyBonus: afterProficiency,
      suggestedHitPointGain: suggestedGain + (finalProfile.hitPoints.vitality ? getHitPointProgression(finalProfile).standard.vitalityGain : 0)
    }
  };
}

// Multi-level preview composes the existing HP/resource progression one level at
// a time. Editorial additions and purchases are applied once, at the destination.
export function previewCharacterLevelUp(profile = {}, planValue = {}) {
  const before = sanitizeCharacterCombatProfile(profile);
  const plan = normalizePlan(before, planValue);
  let next = sanitizeCharacterCombatProfile(before);
  next.progression.development = plan.development;
  const startLevel = getEffectiveCombatLevel(before);
  let last = null;
  const changes = [], errors = [];
  const attributePointAllowance = Array.from({ length: Math.max(0, plan.targetLevel - startLevel) }, (_, i) => startLevel + i + 1)
    .reduce((sum, level) => sum + (level > 20 ? 4 : CHARACTER_ATTRIBUTE_INCREASE_LEVELS.includes(level) ? 2 : 0), 0);
  while (getEffectiveCombatLevel(next) < plan.targetLevel) {
    const finalStep = getEffectiveCombatLevel(next) + 1 === plan.targetLevel;
    last = previewSingleCharacterLevelUp(next, { ...plan,
      attributeIncreases: finalStep ? plan.attributeIncreases : {},
      resourceIncreases: finalStep ? plan.resourceIncreases : {},
      newSkill: finalStep ? plan.newSkill : {}, newAbility: finalStep ? plan.newAbility : {}, newSpell: finalStep ? plan.newSpell : {} });
    next = last.profile;
    changes.push(...last.changes.filter(c => c.key !== 'level'));
    errors.push(...last.errors);
  }
  if (plan.targetLevel === startLevel) {
    next.progression.experience=plan.experience;
    next.progression.nextLevelExperience=plan.nextLevelExperience;
    appendChange(changes,'experience','Erfahrung',before.progression.experience,plan.experience);
    appendChange(changes,'next-level-experience','Nächste Stufe bei',before.progression.nextLevelExperience??'—',plan.nextLevelExperience??'—');
    if(Object.keys(plan.actionPoolChoices).length){
      const choices=[...next.progression.actionPoolChoices.filter(c=>!Object.hasOwn(plan.actionPoolChoices,c.level)),
        ...Object.entries(plan.actionPoolChoices).map(([level,resourceId])=>({level:Number(level),resourceId}))];
      next.progression.actionPoolChoices=normalizeActionPoolChoices(choices,next.progression.level);
      for(const group of getActionPoolChoiceGroups(next.progression.actionPoolChoices,next.progression.level))if(!group.selectedId)errors.push(`Wähle eine gültige Poolsteigerung für Stufe ${group.level}.`);
    }
    applyResourceIncreases(next, plan, changes);
    for (const attribute of next.attributes) attribute.score = Math.min(40, attribute.score + (plan.attributeIncreases[attribute.key] || 0));
    applyOptionalAdditions(next, plan, startLevel, changes);
  }
  const choices = applyDevelopmentChoices(next, plan);
  const finalProfile = sanitizeCharacterCombatProfile(choices.profile);
  if (finalProfile.hitPoints.current != null) finalProfile.hitPoints.current = Math.min(finalProfile.hitPoints.current, getMaximumHitPoints(finalProfile));
  const allocatedAttributePoints = Object.values(plan.attributeIncreases).reduce((sum, n) => sum + n, 0);
  changes.unshift({ key: 'level', label: 'Gesamtstufe', before: startLevel, after: plan.targetLevel });
  changes.push(...choices.changes, { key: 'development-balance', label: 'Balancepunkte übrig', before: '—', after: choices.balance.remaining });
  errors.push(...choices.errors);
  return { ...(last || {}), plan, ready: errors.length === 0, errors: [...new Set(errors)], profile: finalProfile, changes,
    balance: choices.balance, attributePointAllowance, allocatedAttributePoints, remainingAttributePoints: attributePointAllowance - allocatedAttributePoints,
    classTrainingChoiceGroups: [], classTechniqueChoiceGroups: [], actionPoolChoiceGroups: getActionPoolChoiceGroups(finalProfile.progression.actionPoolChoices,finalProfile.progression.level),
    before: { level: startLevel, maximumHitPoints: getMaximumHitPoints(before), proficiencyBonus: getProficiencyBonus(before) },
    after: { level: plan.targetLevel, normalLevel: finalProfile.progression.level, specialLevels: finalProfile.progression.specialLevels,
      levelKind: plan.targetLevel > 20 ? 'special' : 'normal', maximumHitPoints: getMaximumHitPoints(finalProfile), proficiencyBonus: getProficiencyBonus(finalProfile) }
  };
}

export function applyManualCharacterLevel(profile = {}, targetLevelValue = 1) {
  const beforeProfile = sanitizeCharacterCombatProfile(profile);
  const targetLevel = boundedInteger(targetLevelValue, beforeProfile.progression.level, 1, 20);
  const next = sanitizeCharacterCombatProfile(beforeProfile);
  next.progression.development = normalizeDevelopment(beforeProfile.progression.development);
  next.progression.level = targetLevel;
  next.progression.actionPoolChoices = fillActionPoolChoices(next.progression.actionPoolChoices, targetLevel);
  if (targetLevel < 20) next.progression.specialLevels = 0;
  const normalized = sanitizeCharacterCombatProfile(applyCenyrClassLevelProgression(next, targetLevel).profile);
  const maximumHitPoints = getMaximumHitPoints(normalized);
  if (normalized.hitPoints.current != null) {
    normalized.hitPoints.current = normalized.hitPoints.vitality
      ? preserveHitPointDeficit(normalized.hitPoints.current, getMaximumHitPoints(beforeProfile), maximumHitPoints)
      : Math.min(normalized.hitPoints.current, maximumHitPoints);
  }
  return {
    profile: normalized,
    beforeLevel: beforeProfile.progression.level,
    targetLevel,
    addedTechniques: [],
    pendingTechniqueSlots: []
  };
}

export const combatLevelUpInternals = Object.freeze({
  getNextProgression,
  normalizePlan,
  normalizeAttributeIncreases,
  normalizeResourceIncreases
});
