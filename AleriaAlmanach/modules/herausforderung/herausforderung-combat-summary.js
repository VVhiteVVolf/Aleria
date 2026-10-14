export function summarizeChallengeCombatReceipts(comment, encounterId, participatingIds) {
  const resolutions = (comment.commentSegments || []).map(segment => segment.skillResolution).filter(resolution =>
    resolution?.herausforderungEncounterId === encounterId && (participatingIds.has(resolution.actorId)
      || resolution.herausforderungCombatResults?.some(result => participatingIds.has(result.actorId))));
  const results = resolutions.flatMap(resolution => resolution.herausforderungCombatResults || []);
  return { attempts: resolutions.length, effects: results.length,
    damage: results.filter(result => result.type === 'damage').reduce((sum, result) => sum + Number(result.applied?.incoming || 0), 0),
    healing: results.filter(result => result.type === 'healing').reduce((sum, result) => sum + Number(result.applied?.restored || 0), 0),
    temporaryHitPoints: results.filter(result => result.type === 'temporary-hit-points').reduce((sum, result) => sum + Number(result.applied?.granted || 0), 0) };
}

export function normalizeChallengeCombatSummary(value) {
  if (!value) return null;
  return Object.fromEntries(['attempts','effects','damage','healing','temporaryHitPoints'].map(key => [key, Math.max(0, Number(value[key]) || 0)]));
}
