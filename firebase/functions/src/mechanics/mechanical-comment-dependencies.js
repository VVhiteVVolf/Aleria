import { getEncounterResolutionGroups } from '../generated/combat/combat-encounter-summary.js';
import { getConditionConcentrationOwnerId } from '../generated/combat/combat-condition-lifecycle.js';
import { deriveCombatStateFromComments } from '../generated/combat/combat-state-model.js';

function concentrationLinks(states) {
  const links = new Map();
  const remember = (actorId, conditions = []) => conditions.forEach(condition => {
    const ownerId = getConditionConcentrationOwnerId(condition);
    if (!ownerId || !actorId) return;
    if (!links.has(String(actorId))) links.set(String(actorId), new Set());
    if (!links.has(ownerId)) links.set(ownerId, new Set());
    links.get(String(actorId)).add(ownerId);
    links.get(ownerId).add(String(actorId));
  });
  states.forEach((state, actorId) => remember(actorId, state.temporaryConditions));
  return links;
}

function actorIds(comment = {}) {
  const ids = new Set();
  const add = value => { if (value) ids.add(String(value)); };
  add(comment.characterId);
  add(comment.combatStatus?.actorId);
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
  // Breaking or removing concentration can change a third participant's
  // state. Their later contribution also prevents an unsafe partial undo.
  const links = concentrationLinks(deriveCombatStateFromComments(history.slice(0, index)));
  for (const actorId of affected) for (const linked of links.get(actorId) || []) affected.add(linked);
  return history.slice(index + 1).find(comment => [...actorIds(comment)].some(id => affected.has(id))) || null;
}
