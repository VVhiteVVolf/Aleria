// Pure HP arithmetic, shared by character creation, advancement and the server.
export const HIT_POINT_VITALITY_VERSION = 1;
const integer = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback;

export function normalizeHitPointVitality(value) {
  if (value?.version !== HIT_POINT_VITALITY_VERSION) return null;
  const anchor = value.overrideAnchor;
  return { version: HIT_POINT_VITALITY_VERSION,
    ...(value.legacyIncrease != null ? { legacyIncrease: Math.max(0, integer(value.legacyIncrease)) } : {}),
    overrideAnchor: anchor ? {
    base: Math.max(1, integer(anchor.base, 1)),
    bonus: Math.max(0, integer(anchor.bonus)),
    vitality: Math.max(0, integer(anchor.vitality))
  } : null };
}

export function getStandardHitPointProgression({ hitDie = 8, averagePerLevelOverride = null, level = 1, constitutionModifier = 0 } = {}) {
  const effectiveLevel = Math.max(1, Math.min(30, integer(level, 1)));
  const constitution = integer(constitutionModifier);
  const first = Math.max(1, hitDie + constitution);
  const gain = Math.max(1, (averagePerLevelOverride ?? Math.floor(hitDie / 2) + 1) + constitution);
  const base = first + (effectiveLevel - 1) * gain;
  const bonus = Math.ceil(base / 4);
  return { base, bonus, total: base + bonus, gain,
    vitalityGain: effectiveLevel === 1 ? bonus : bonus - Math.ceil((base - gain) / 4) };
}

export function resolveHitPointProgression(hitPoints, standard, mechanicalBonus = 0) {
  const vitality = normalizeHitPointVitality(hitPoints.vitality);
  const override = hitPoints.maximumOverride;
  if (!vitality) {
    const maximum = override ?? Math.max(1, standard.base + mechanicalBonus);
    return { maximum, base: maximum, vitality: 0, mechanicalBonus: override == null ? mechanicalBonus : 0 };
  }
  if (override != null) {
    const anchor = vitality.overrideAnchor;
    const bonus = anchor ? Math.max(0, anchor.vitality + standard.bonus - anchor.bonus) : standard.bonus;
    const maximum = Math.max(1, override + (anchor ? standard.total - anchor.base - anchor.bonus : 0));
    return { maximum, base: maximum - bonus, vitality: bonus, mechanicalBonus: 0 };
  }
  return { maximum: Math.max(1, standard.total + mechanicalBonus), base: standard.base,
    vitality: standard.bonus, mechanicalBonus };
}

export function preserveHitPointDeficit(current, beforeMaximum, afterMaximum) {
  if (current == null) return null;
  if (Number(current) <= 0) return 0;
  return Math.max(0, Math.min(afterMaximum, Number(current) + afterMaximum - beforeMaximum));
}
