// Level-based progression for casting mana, the universal Aura-Fokuspunkt bypass currency
// and the Celestiale/Infernale Punkte that let a Kleriker or Hexer substitute for mana.
//
// Aleria uses a spell-point economy, not classic per-grade slots: a known spell of any
// unlocked grade can be cast as often as the mana pool allows. Grade-unlock levels gate
// WHICH grades are castable; the mana pool and per-cast cost (by grade) gate HOW OFTEN.
// This module is intentionally dependency-free (no import of combat-profile-model.js) so it
// can be imported from there without a circular dependency; callers pass plain level numbers.

export const CASTER_TIERS = Object.freeze(['full', 'half']);
export const MANA_BYPASS_RESOURCE_IDS = Object.freeze(['celestial-points', 'infernal-points']);

// Index 0 = Zaubertrick (cantrip), index N = Grad N. Zaubertricks kosten immer 1 Mana - das ist
// ein echter, wiederkehrender Verbrauch (kein Freebie wie in D&D), also müssen die Manapools
// unten das mit einrechnen. Grade I-IX übernehmen D&Ds eigene DMG-Spielpunkte-Umrechnung
// (2,3,5,6,7,9,10,11,13) als bereits durchgetestetes Verhältnis; Grad X ist die naheliegende
// Fortsetzung des Musters (+1) auf 15.
export const SPELL_GRADE_MANA_COST = Object.freeze([1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 15]);

// Mirrors D&D's full-caster slot cadence (grade N unlocks every two levels starting at 1),
// stretched one extra rung to cover Aleria's tenth spell grade by level 19.
const FULL_CASTER_GRADE_UNLOCK_LEVELS = Object.freeze({
  1: 1, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11, 7: 13, 8: 15, 9: 17, 10: 19
});

// Mirrors D&D's half-caster (Paladin-style) cadence: starts a level later, unlocks every
// four levels, and never reaches beyond grade 5 - a half-caster stays a hybrid, not a mage.
const HALF_CASTER_GRADE_UNLOCK_LEVELS = Object.freeze({
  1: 2, 2: 5, 3: 9, 4: 13, 5: 17
});

const CASTER_GRADE_UNLOCK_LEVELS = Object.freeze({
  full: FULL_CASTER_GRADE_UNLOCK_LEVELS,
  half: HALF_CASTER_GRADE_UNLOCK_LEVELS
});

// Mana pool maximum by ordinary character level (index 0 = level 1 ... index 19 = level 20).
// Base value = D&Ds eigene DMG-Spielpunkte-Tabelle für Vollcaster (dieselbe Quelle, die die
// Gradkosten oben liefert - beide gehören zusammen). Draufaddiert: ein "Zaubertrick-Polster"
// (10 + halbe Stufe), weil Zaubertricks in Aleria - anders als in D&D - selbst Mana kosten und
// sonst niemand sich alltägliche kleine Tricks leisten könnte, ohne echte Zauber zu opfern.
const DND_SPELL_POINTS_BY_LEVEL = Object.freeze([
  4, 6, 14, 17, 27, 32, 38, 44, 57, 64, 73, 73, 83, 83, 94, 94, 107, 114, 123, 133
]);

function cantripBuffer(level) {
  return 10 + Math.floor(level / 2);
}

// Full casters (Magier/Barde/Hexenmeister-equivalent).
const FULL_CASTER_MANA_BY_LEVEL = Object.freeze(
  DND_SPELL_POINTS_BY_LEVEL.map((points, index) => points + cantripBuffer(index + 1))
);

// Half casters (Paladin-equivalent): D&Ds eigene Multiklassen-Regel für Halbcaster-Zauberplätze
// zählt die Klassenstufe geteilt durch zwei (abgerundet) als effektive Caster-Stufe - dieselbe
// Umrechnung liefert hier den Mana-Basiswert, plus dasselbe Zaubertrick-Polster wie oben.
const HALF_CASTER_MANA_BY_LEVEL = Object.freeze(
  Array.from({ length: 20 }, (_entry, index) => {
    const level = index + 1;
    const effectiveCasterLevel = Math.floor(level / 2);
    const points = effectiveCasterLevel > 0 ? DND_SPELL_POINTS_BY_LEVEL[effectiveCasterLevel - 1] : 0;
    return points + cantripBuffer(level);
  })
);

const CASTER_MANA_BY_LEVEL = Object.freeze({
  full: FULL_CASTER_MANA_BY_LEVEL,
  half: HALF_CASTER_MANA_BY_LEVEL
});

// Every Sonderrang (special level 21-30) keeps growing the mana pool, even though no new
// spell grade unlocks beyond 10 - raw casting stamina, not new grades.
const SPECIAL_RANK_MANA_BONUS = Object.freeze({ full: 18, half: 10 });

// Aura-Fokuspunkte: an extremely powerful universal-bypass currency, so it stays rare even
// at high level. First point at level 6, then one more every four levels, capping at 4
// across the ordinary levels 1-20.
const AURA_FOCUS_ORDINARY_LADDER = Object.freeze([
  { level: 18, points: 4 },
  { level: 14, points: 3 },
  { level: 10, points: 2 },
  { level: 6, points: 1 }
]);

// Sonderränge grant Aura-Fokuspunkte much faster than ordinary levels - "aber mehr!" - one
// additional point per special rank instead of one every four levels.
const AURA_FOCUS_PER_SPECIAL_RANK = 1;

function boundedLevel(level) {
  const parsed = Number(level);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(20, Math.trunc(parsed))) : 1;
}

function boundedSpecialLevels(specialLevels) {
  const parsed = Number(specialLevels);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(10, Math.trunc(parsed))) : 0;
}

function resolveCasterTier(casterTier) {
  return CASTER_TIERS.includes(casterTier) ? casterTier : 'full';
}

export function getSpellManaCost(spellLevel = 0) {
  const index = Math.max(0, Math.min(SPELL_GRADE_MANA_COST.length - 1, Math.trunc(Number(spellLevel)) || 0));
  return SPELL_GRADE_MANA_COST[index];
}

// Highest spell grade an ordinary character level currently has access to (0 = only cantrips).
export function getHighestUnlockedSpellGrade(casterTier, level = 1) {
  const table = CASTER_GRADE_UNLOCK_LEVELS[resolveCasterTier(casterTier)];
  const effectiveLevel = boundedLevel(level);
  let highest = 0;
  Object.entries(table).forEach(([grade, unlockLevel]) => {
    if (effectiveLevel >= unlockLevel) highest = Math.max(highest, Number(grade));
  });
  return highest;
}

export function getCasterManaMaximum(casterTier, level = 1, specialLevels = 0) {
  const tier = resolveCasterTier(casterTier);
  const table = CASTER_MANA_BY_LEVEL[tier];
  const base = table[boundedLevel(level) - 1] ?? 0;
  return base + boundedSpecialLevels(specialLevels) * SPECIAL_RANK_MANA_BONUS[tier];
}

export function getAuraFocusMaximum(level = 1, specialLevels = 0) {
  const effectiveLevel = boundedLevel(level);
  const rung = AURA_FOCUS_ORDINARY_LADDER.find(entry => effectiveLevel >= entry.level);
  const ordinary = rung ? rung.points : 0;
  return ordinary + boundedSpecialLevels(specialLevels) * AURA_FOCUS_PER_SPECIAL_RANK;
}

// Celestiale/Infernale Punkte: a smaller supplementary pool a Kleriker/Hexer can spend
// instead of mana. Same simple curve for both, since they are thematic opposites, not a
// power imbalance - floor(effective level / 2), reaching 10 at ordinary level 20 and 15 at
// the top Sonderrang.
export function getDivineOrInfernalPointsMaximum(level = 1, specialLevels = 0) {
  const effectiveLevel = Math.min(30, boundedLevel(level) + boundedSpecialLevels(specialLevels));
  return Math.floor(effectiveLevel / 2);
}

// Paktpunkte (Hexer/Bündnisträger): a distinct resource from Mana, replacing it entirely for
// this class rather than merely bypassing it - so unlike Celestial/Infernal points (a bonus a
// Kleriker/Hexer can fall back on in addition to their normal Mana), Paktpunkte must alone be
// enough for a level-1 Hexer to at least afford their own cantrips (cost 1). Same small
// Celestial/Infernal-style curve, shifted up by a floor of +2 so it never bottoms out at 0.
// The pact-magic economy is still intentionally rougher than Mana - it gets tuned in detail later.
export function getPactPointsMaximum(level = 1, specialLevels = 0) {
  const effectiveLevel = Math.min(30, boundedLevel(level) + boundedSpecialLevels(specialLevels));
  return Math.floor(effectiveLevel / 2) + 2;
}

// Fokus (Asket und ähnliche Kampfkünstler): structurally separate from Mana - grows with the
// character's own level rather than a caster tier, mirroring a Ki-style "your level is your
// pool" curve. Sonderränge grant a faster bonus, matching a martial archetype's late-game power.
export function getFocusMaximum(level = 1, specialLevels = 0) {
  return boundedLevel(level) + boundedSpecialLevels(specialLevels) * 2;
}

export const combatResourceProgressionInternals = Object.freeze({
  FULL_CASTER_GRADE_UNLOCK_LEVELS,
  HALF_CASTER_GRADE_UNLOCK_LEVELS,
  FULL_CASTER_MANA_BY_LEVEL,
  HALF_CASTER_MANA_BY_LEVEL,
  SPECIAL_RANK_MANA_BONUS,
  AURA_FOCUS_ORDINARY_LADDER,
  AURA_FOCUS_PER_SPECIAL_RANK,
  boundedLevel,
  boundedSpecialLevels,
  resolveCasterTier
});
