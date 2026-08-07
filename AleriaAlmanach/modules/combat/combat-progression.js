// Deliberately slower than D&D 5e's own thresholds - roughly 5x at the start, tapering to
// about 2x by level 20. Leveling should feel slow, especially early on, so the first few
// levels take real, sustained play rather than a couple of lucky fights.
// Special levels 21-30 remain separate and are never inferred from ordinary XP.

export const ORDINARY_LEVEL_XP_THRESHOLDS = Object.freeze([
  0, 1500, 4000, 10000, 22000, 42000, 66000, 92000, 125000, 160000,
  200000, 235000, 275000, 315000, 365000, 420000, 480000, 555000, 630000, 720000
]);

// Aleria uses character/creature levels instead of D&D challenge ratings. Calibrated
// against ORDINARY_LEVEL_XP_THRESHOLDS above so early levels need roughly 12-18 same-level
// encounters (very slow), tapering down to roughly 3-5 by the high teens/twenties (fewer,
// bigger, more dramatic fights) - the same "slow especially at first" pacing curve.
export const DEFEAT_XP_BY_LEVEL = Object.freeze([
  100, 200, 400, 700, 1100, 1600, 2200, 3000, 4000, 5200,
  6600, 8200, 10000, 12000, 14500, 17500, 21000, 25000, 30000, 36000
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
