export function getSegmentCombatResolutions(segment = {}) {
  return (Array.isArray(segment?.combatResolutions) && segment.combatResolutions.length
    ? segment.combatResolutions : [segment?.combatResolution]).filter(Boolean);
}

export function getSegmentSkillCombatResolutions(segment = {}) {
  return (segment?.skillResolution?.herausforderungCombatResults || [])
    .filter(result => result?.type === 'weapon-maneuver' && result.resolution)
    .map(result => result.resolution);
}

export function getSegmentCombatStateReceipts(segment = {}) {
  const use = segment?.inventoryUse;
  const inventoryReceipt = use ? {
    actorId: use.actorId, actorConditionSnapshot: use.conditionSnapshot,
    actorResourceSnapshot: use.resourceSnapshot, actorHitPointSnapshot: use.hitPointSnapshot,
    actorInventorySnapshot: use.inventorySnapshot, sceneItemEvent: use.sceneItemEvent
  } : null;
  return getSegmentCombatResolutions(segment).concat(segment?.skillResolution || [], inventoryReceipt || []).filter(Boolean);
}

// Stored counters are independent resolutions. Follow-up attacks remain part
// of their parent's already aggregated damage and must not be counted twice.
export function getCommentCombatResolutionGroups(comment = {}) {
  const segments = Array.isArray(comment.commentSegments) ? comment.commentSegments : [];
  const groups = segments.map(segment => [...getSegmentCombatResolutions(segment), ...getSegmentSkillCombatResolutions(segment)]);
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
