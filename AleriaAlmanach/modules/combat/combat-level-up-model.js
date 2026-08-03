import {
  COMBAT_ATTRIBUTE_DEFINITIONS,
  getAttributeModifier,
  getEffectiveCombatLevel,
  getMaximumHitPoints,
  getProficiencyBonus,
  sanitizeCharacterCombatProfile
} from './combat-profile-model.js?v=20260803-combat-sheet-v6';

const HIT_POINT_MODES = new Set(['recommended', 'manual', 'unchanged']);
const SKILL_PROFICIENCIES = new Set(['none', 'trained', 'expertise']);

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
      level: boundedInteger(newSpell.level, 0, 0, 20),
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
  const nextProfile = sanitizeCharacterCombatProfile(beforeProfile);
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
    const increase = plan.resourceIncreases[resource.id];
    if (!increase) return;
    const beforeMaximum = resource.maximum;
    const beforeCurrent = resource.current;
    resource.maximum = Math.max(0, Math.min(9999, resource.maximum + increase.maximum));
    resource.current = Math.max(-9999, Math.min(9999, resource.current + increase.current));
    appendChange(changes, `resource-${resource.id}-maximum`, `${resource.name} Maximum`, beforeMaximum, resource.maximum);
    appendChange(changes, `resource-${resource.id}-current`, `${resource.name} aktuell`, beforeCurrent, resource.current);
  });

  applyOptionalAdditions(interimProfile, plan, beforeLevel + 1, changes);
  const finalProfile = sanitizeCharacterCombatProfile(interimProfile);
  const afterProficiency = getProficiencyBonus(finalProfile);

  changes.unshift({ key: 'level', label: nextProgression.kind === 'special' ? 'Sonderstufe' : 'Stufe', before: beforeLevel, after: beforeLevel + 1 });
  appendChange(changes, 'experience', 'Erfahrung', beforeProfile.progression.experience, finalProfile.progression.experience);
  appendChange(changes, 'next-level-experience', 'Nächste Stufe bei', beforeProfile.progression.nextLevelExperience ?? '—', finalProfile.progression.nextLevelExperience ?? '—');
  appendChange(changes, 'maximum-hit-points', 'Maximale Trefferpunkte', beforeMaximumHitPoints, getMaximumHitPoints(finalProfile));
  appendChange(changes, 'current-hit-points', 'Aktuelle Trefferpunkte', beforeProfile.hitPoints.current ?? '—', finalProfile.hitPoints.current ?? '—');
  appendChange(changes, 'proficiency', 'Kompetenzbonus', beforeProficiency, afterProficiency);

  return {
    ready: true,
    errors: [],
    profile: finalProfile,
    plan,
    changes,
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

export const combatLevelUpInternals = Object.freeze({
  getNextProgression,
  normalizePlan,
  normalizeAttributeIncreases,
  normalizeResourceIncreases
});
