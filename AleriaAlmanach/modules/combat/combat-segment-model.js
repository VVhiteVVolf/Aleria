// Bubble presentation (speech/action) is independent of its mechanical rules.
// Keep browser selection and authoritative profile resolution on the same mode.
export function getCombatSegmentMode(segment = {}) {
  const explicit = String(segment.mechanicMode || '').trim();
  if (explicit === 'combat' || explicit === 'magic') return explicit;
  if (segment.combatResolution || segment.combatAction || segment.storedCombatResolution || segment.storedCombatAction) {
    return ['spell', 'prayer', 'song'].includes(String(segment.commentKind || segment.kind || '')) ? 'magic' : 'combat';
  }
  return 'normal';
}

export function isCombatSegment(segment = {}) {
  return ['combat', 'magic'].includes(getCombatSegmentMode(segment));
}

export function getEffectiveCombatSegmentKind(segment = {}) {
  if (getCombatSegmentMode(segment) === 'combat') return 'combataction';
  const kind = String(segment.commentKind || segment.kind || '');
  return ['spell', 'prayer', 'song'].includes(kind) ? kind : 'spell';
}
