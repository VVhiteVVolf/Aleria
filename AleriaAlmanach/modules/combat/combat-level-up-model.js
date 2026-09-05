import {
  COMBAT_ATTRIBUTE_DEFINITIONS,
  getAttributeModifier,
  getEffectiveCombatLevel,
  getMaximumHitPoints,
  getProficiencyBonus,
  sanitizeCharacterCombatProfile
} from './combat-profile-model.js?v=20260905-party-combat-v1';
import { getCharacterCreationTemplate } from './character-creation-templates.js?v=20260905-cenyr-character-training-v1';
import { addMissingCombatStyleTechniques } from '../combat-styles/combat-style-registry.js?v=20260905-damage-balance-v1';
import { applyCenyrClassLevelProgression } from '../classes/cenyr/cenyr-class-combat-rules.js?v=20260905-cenyr-character-training-v1';
import { getCenyrClassDefinitionForProfile } from '../classes/cenyr/cenyr-class-registry.js?v=20260905-cenyr-character-training-v1';
import {
  getCenyrLevelUpTrainingChoices,
  selectCenyrTrainingOption
} from '../classes/cenyr/cenyr-class-training.js?v=20260905-cenyr-character-training-v1';
import {
  getCenyrTechniqueChoiceGroups,
  reconcileCenyrTrainingForLevel,
  selectCenyrTechniqueForSlot
} from '../classes/cenyr/cenyr-technique-selection.js?v=20260905-party-combat-v1';

import { getActionPoolChoiceGroups, fillActionPoolChoices, normalizeActionPoolChoices, ACTION_POOL_LABELS } from './combat-action-progression.js?v=20260905-resource-balance-v2';
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
    experience: boundedInteger(value.experience, profile.progression.experience, 0, 999999999),
    nextLevelExperience: optionalInteger(value.nextLevelExperience, 1, 999999999),
    hitPointMode: HIT_POINT_MODES.has(hpMode) ? hpMode : 'recommended',
    manualHitPointGain: boundedInteger(value.manualHitPointGain, getSuggestedHitPointGain(profile), 0, 9999),
    restoreGainedHitPoints: value.restoreGainedHitPoints !== false,
    attributeIncreases: normalizeAttributeIncreases(value.attributeIncreases),
    resourceIncreases: normalizeResourceIncreases(profile, value.resourceIncreases),
    actionPoolChoices: Object.fromEntries(Object.entries(value.actionPoolChoices || {}).filter(([level, id]) => [10, 15, 20].includes(Number(level)) && Object.hasOwn(ACTION_POOL_LABELS, id))),
    classTrainingChoices: {
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

export function previewCharacterLevelUp(profile = {}, planValue = {}) {
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
  const classTrainingChoiceGroups = getCenyrLevelUpTrainingChoices(beforeProfile, nextProgression.level);
  const attributePointAllowance = getLevelUpAttributePointAllowance(beforeProfile);
  const allocatedAttributePoints = Object.values(plan.attributeIncreases)
    .reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  const attributeErrors = allocatedAttributePoints === attributePointAllowance
    ? []
    : [attributePointAllowance > 0
        ? `Verteile für diesen Stufenaufstieg genau ${attributePointAllowance} Attributspunkte (${allocatedAttributePoints} vergeben).`
        : 'Dieser Stufenaufstieg gewährt keine Attributspunkte.'];
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
  if (plan.hitPointMode === 'manual') {
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
  const hitPointDelta = afterMaximumHitPoints - beforeMaximumHitPoints;
  if (interimProfile.hitPoints.current != null) {
    interimProfile.hitPoints.current = plan.restoreGainedHitPoints
      ? Math.max(0, Math.min(afterMaximumHitPoints, interimProfile.hitPoints.current + Math.max(0, hitPointDelta)))
      : Math.max(0, Math.min(afterMaximumHitPoints, interimProfile.hitPoints.current));
  }

  interimProfile.resources.forEach(resource => {
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

  const classTemplate = getCharacterCreationTemplate('class', interimProfile.templateSelections.classId);
  const cenyrDefinition = getCenyrClassDefinitionForProfile(interimProfile);
  let selectedTrainingProfile = interimProfile;
  if (!cenyrDefinition) {
    const styleProgression = addMissingCombatStyleTechniques(
      interimProfile.techniques,
      classTemplate?.combatStyleGrants,
      beforeLevel + 1
    );
    selectedTrainingProfile.techniques = styleProgression.techniques;
    styleProgression.added.forEach(technique => {
      changes.push({
        key: `combat-style-technique-${technique.id}`,
        label: 'Neue Kampfstiltechnik',
        before: '—',
        after: technique.name
      });
    });
  }
  classTrainingChoiceGroups.forEach(group => {
    const selectionId = plan.classTrainingChoices[group.kind];
    if (!selectionId) return;
    const result = selectCenyrTrainingOption(selectedTrainingProfile, {
      kind: group.kind,
      selectionId,
      selectedAtLevel: nextProgression.level
    });
    if (!result.ok) {
      classTrainingErrors.push(...result.errors);
      return;
    }
    selectedTrainingProfile = result.profile;
    const label = group.options.find(option => option.id === selectionId)?.name || selectionId;
    changes.push({
      key: `class-training-${group.kind}-${selectionId}`,
      label: group.kind === 'path' ? 'Gewählter Expertenpfad' : 'Gewählter Waffenweg',
      before: '—',
      after: `${label}${result.spentSlot ? ` · belegt ${result.spentSlot.id}` : ' · ohne Slotkosten'}`
    });
  });

  const classTechniqueChoiceGroups = cenyrDefinition
    ? getCenyrTechniqueChoiceGroups(selectedTrainingProfile, nextProgression.level)
    : [];
  classTechniqueChoiceGroups.forEach(group => {
    const techniqueId = plan.cenyrTechniqueChoices[group.slotId];
    if (!techniqueId) {
      classTrainingErrors.push(`Wähle eine Attacke für ${group.label}.`);
      return;
    }
    const result = selectCenyrTechniqueForSlot(selectedTrainingProfile, {
      slotId: group.slotId,
      techniqueId,
      selectedAtLevel: nextProgression.level
    });
    if (!result.ok) {
      classTrainingErrors.push(...result.errors);
      return;
    }
    selectedTrainingProfile = result.profile;
    changes.push({
      key: `class-technique-${group.slotId}`,
      label: 'Neue Drachentanz-Attacke',
      before: '—',
      after: result.technique.name
    });
  });

  if (cenyrDefinition) {
    selectedTrainingProfile = reconcileCenyrTrainingForLevel(selectedTrainingProfile, nextProgression.level).profile;
  }
  const classProgression = applyCenyrClassLevelProgression(selectedTrainingProfile, nextProgression.level);
  classProgression.unlockedFeatures.forEach(feature => changes.push({
    key: `class-feature-${feature.id}`,
    label: 'Neues Klassenmerkmal',
    before: '—',
    after: feature.name
  }));

  applyOptionalAdditions(classProgression.profile, plan, beforeLevel + 1, changes);
  const finalProfile = sanitizeCharacterCombatProfile(classProgression.profile);
  const afterProficiency = getProficiencyBonus(finalProfile);

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
      suggestedHitPointGain: suggestedGain
    }
  };
}

export function applyManualCharacterLevel(profile = {}, targetLevelValue = 1) {
  const beforeProfile = sanitizeCharacterCombatProfile(profile);
  const targetLevel = boundedInteger(targetLevelValue, beforeProfile.progression.level, 1, 20);
  const next = sanitizeCharacterCombatProfile(beforeProfile);
  next.progression.level = targetLevel;
  next.progression.actionPoolChoices = fillActionPoolChoices(next.progression.actionPoolChoices, targetLevel);
  if (targetLevel < 20) next.progression.specialLevels = 0;
  const definition = getCenyrClassDefinitionForProfile(next);
  let reconciled = { profile: next, added: [], pending: [] };

  if (definition) {
    reconciled = reconcileCenyrTrainingForLevel(next, targetLevel, { autoFill: true });
    reconciled.profile = applyCenyrClassLevelProgression(reconciled.profile, targetLevel).profile;
  } else if (targetLevel > beforeProfile.progression.level) {
    const classTemplate = getCharacterCreationTemplate('class', next.templateSelections.classId);
    const progression = addMissingCombatStyleTechniques(next.techniques, classTemplate?.combatStyleGrants, targetLevel);
    next.techniques = progression.techniques;
    reconciled = { profile: next, added: progression.added, pending: [] };
  }

  const normalized = sanitizeCharacterCombatProfile(reconciled.profile);
  const maximumHitPoints = getMaximumHitPoints(normalized);
  if (normalized.hitPoints.current != null) {
    normalized.hitPoints.current = Math.min(normalized.hitPoints.current, maximumHitPoints);
  }
  return {
    profile: normalized,
    beforeLevel: beforeProfile.progression.level,
    targetLevel,
    addedTechniques: reconciled.added,
    pendingTechniqueSlots: reconciled.pending
  };
}

export const combatLevelUpInternals = Object.freeze({
  getNextProgression,
  normalizePlan,
  normalizeAttributeIncreases,
  normalizeResourceIncreases
});
