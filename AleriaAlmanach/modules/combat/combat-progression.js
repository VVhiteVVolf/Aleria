// D&D-5e compatible XP thresholds for ordinary levels 1-20.
// Special levels 21-30 remain separate and are never inferred from ordinary XP.

export const ORDINARY_LEVEL_XP_THRESHOLDS = Object.freeze([
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
]);

// Aleria uses character/creature levels instead of D&D challenge ratings. These
// rewards follow the familiar 5e encounter-XP curve and therefore remain
// understandable without introducing a second, hidden power scale.
export const DEFEAT_XP_BY_LEVEL = Object.freeze([
  25, 50, 100, 200, 450, 700, 1100, 1800, 2300, 2900,
  3900, 5000, 5900, 7200, 8400, 10000, 11500, 13000, 15000, 18000
]);

function integer(value, fallback = 0, minimum = 0, maximum = 999999999) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

export function getOrdinaryLevelForExperience(experience = 0) {
  const xp = integer(experience);
  let level = 1;
  ORDINARY_LEVEL_XP_THRESHOLDS.forEach((threshold, index) => {
    if (xp >= threshold) level = index + 1;
  });
  return Math.min(20, level);
}

export function getOrdinaryLevelProgress(experience = 0) {
  const xp = integer(experience);
  const level = getOrdinaryLevelForExperience(xp);
  const currentThreshold = ORDINARY_LEVEL_XP_THRESHOLDS[level - 1];
  const nextThreshold = level < 20 ? ORDINARY_LEVEL_XP_THRESHOLDS[level] : null;
  return {
    level,
    experience: xp,
    currentThreshold,
    nextThreshold,
    earnedInLevel: xp - currentThreshold,
    requiredInLevel: nextThreshold == null ? null : nextThreshold - currentThreshold,
    levelUpAvailable: nextThreshold != null && xp >= nextThreshold
  };
}

export function splitEncounterExperience(totalExperience = 0, recipients = []) {
  const total = integer(totalExperience);
  const unique = [...new Map((Array.isArray(recipients) ? recipients : [])
    .filter(recipient => recipient && recipient.eligible !== false && recipient.actorId)
    .map(recipient => [String(recipient.actorId), recipient])).values()];
  if (!unique.length || total <= 0) return [];
  const base = Math.floor(total / unique.length);
  let remainder = total - (base * unique.length);
  return unique.map(recipient => ({
    actorId: String(recipient.actorId),
    name: String(recipient.name || ''),
    experience: base + (remainder-- > 0 ? 1 : 0)
  }));
}

export function getDefeatExperienceReward(level = 1, explicitReward = null) {
  if (explicitReward !== null && explicitReward !== undefined && explicitReward !== '') {
    return integer(explicitReward);
  }
  const normalizedLevel = integer(level, 1, 1, 20);
  return DEFEAT_XP_BY_LEVEL[normalizedLevel - 1];
}

export function applyExperienceAward(progression = {}, award = 0) {
  const beforeExperience = integer(progression.experience);
  const afterExperience = beforeExperience + integer(award);
  const beforeLevel = Math.max(1, Math.min(20, integer(progression.level, getOrdinaryLevelForExperience(beforeExperience), 1, 20)));
  const earnedLevel = getOrdinaryLevelForExperience(afterExperience);
  return {
    before: { level: beforeLevel, experience: beforeExperience },
    after: {
      ...progression,
      // EP unlock the existing level-up workflow. They must not silently apply
      // attribute points, hit points or class choices on the server.
      level: beforeLevel,
      experience: afterExperience,
      nextLevelExperience: beforeLevel < 20 ? ORDINARY_LEVEL_XP_THRESHOLDS[beforeLevel] : null
    },
    award: integer(award),
    levelsGained: Math.max(0, earnedLevel - beforeLevel),
    levelUpAvailable: earnedLevel > beforeLevel
  };
}

export const combatProgressionInternals = Object.freeze({ integer });
