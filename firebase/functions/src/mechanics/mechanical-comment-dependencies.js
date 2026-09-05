import { getEncounterResolutionGroups } from '../generated/combat/combat-encounter-summary.js';

function actorIds(comment = {}) {
  const ids = new Set();
  const add = value => { if (value) ids.add(String(value)); };
  add(comment.characterId);
  for (const participant of comment.combatEncounter?.participants || []) add(participant.actorId);
  for (const participant of comment.sceneRest?.participants || []) add(participant.actorId);
  for (const segment of comment.commentSegments || []) {
    add(segment.actorId || segment.characterId);
    add(segment.inventoryUse?.actorId);
  }
  for (const resolution of getEncounterResolutionGroups(comment).flat()) {
    add(resolution.actorId); add(resolution.targetId);
    for (const snapshot of resolution.ruleResourceSnapshots || []) add(snapshot.sourceActorId);
    for (const snapshot of resolution.ruleAbilitySnapshots || []) add(snapshot.sourceActorId);
  }
  return ids;
}

// Read dependencies matter too: a final summary or a later attack may depend on
// a state without updating every profile's last-write marker.
export function findLaterMechanicalDependency(history = [], commentId) {
  const index = history.findIndex(comment => comment.id === commentId);
  if (index < 0) return null;
  const affected = actorIds(history[index]);
  return history.slice(index + 1).find(comment => [...actorIds(comment)].some(id => affected.has(id))) || null;
}
