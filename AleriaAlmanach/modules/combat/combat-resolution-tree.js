// Stored counters are independent resolutions. Follow-up attacks remain part
// of their parent's already aggregated damage and must not be counted twice.
export function getCommentCombatResolutionGroups(comment = {}) {
  const segments = Array.isArray(comment.commentSegments) ? comment.commentSegments : [];
  const groups = segments.map(segment => [...(segment.combatResolutions?.length ? segment.combatResolutions : [segment.combatResolution]),
    ...(segment.skillResolution?.herausforderungCombatResults || []).map(result => result.type === 'weapon-maneuver' ? result.resolution : null)].filter(Boolean));
  if (groups.some(group => group.length)) return groups.filter(group => group.length);
  return comment.combatResolution ? [[comment.combatResolution]] : [];
}

export function getCombatResolutionTree(resolution) {
  const entries = [];
  const seen = new Set();
  function visit(value, path) {
    if (!value || typeof value !== 'object' || seen.has(value) || path.length > 20) return;
    seen.add(value);
    entries.push({ resolution: value, path });
    (value.counterAttacks || []).forEach((counter, index) => visit(counter.resolution, [...path, index]));
  }
  visit(resolution, []);
  return entries;
}

export function getStoredCriticalConsequences(resolution) {
  const seen = new Set();
  return getCombatResolutionTree(resolution).flatMap(({ resolution: entry }) =>
    entry.criticalConsequences?.length ? entry.criticalConsequences : [entry.criticalConsequence]
  ).filter(consequence => {
    if (!consequence) return false;
    const key = consequence.id || consequence;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getResolutionSceneItemEvents(resolution) {
  const events = [...getStoredCriticalConsequences(resolution).map(c => c.sceneItemEvent),
    ...getCombatResolutionTree(resolution).flatMap(({ resolution: entry }) => entry.sceneItemEvents || [])];
  const seen = new Set();
  return events.filter(event => {
    if (!event) return false;
    const key = `${event.operation}:${event.sceneItemId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getAttackSequenceOutcome(resolution = {}) {
  const attacks = [resolution.attack, ...(resolution.followUpAttacks || []).map(entry => entry.attack)].filter(Boolean);
  return { count: attacks.length, hits: attacks.filter(attack => attack.hit).length,
    criticalHits: attacks.filter(attack => attack.hit && attack.criticalSuccess).length,
    failures: attacks.filter(attack => attack.criticalFailure).length };
}
