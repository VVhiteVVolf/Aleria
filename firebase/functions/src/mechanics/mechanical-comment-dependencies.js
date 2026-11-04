import { getEncounterResolutionGroups } from '../generated/combat/combat-encounter-summary.js';
import { getConditionConcentrationOwnerId } from '../generated/combat/combat-condition-lifecycle.js';
import { deriveCombatStateFromComments } from '../generated/combat/combat-state-model.js';
import { sceneItemEvents } from '../generated/scene-items/scene-items-model.js';
import { isSilentSceneRegeneration } from '../generated/scene-regeneration/scene-regeneration-model.js';

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
  for (const participant of comment.sceneRegeneration?.participants || []) add(participant.actorId);
  for (const segment of comment.commentSegments || []) {
    add(segment.actorId || segment.characterId);
    add(segment.inventoryUse?.actorId);
    add(segment.inventoryUse?.sceneItemEvent?.sourceActorId);
    add(segment.skillResolution?.actorId);
    for (const snapshot of segment.skillResolution?.herausforderungCombatSnapshots || []) add(snapshot.actorId);
    for (const snapshot of segment.skillResolution?.ruleResourceSnapshots || []) add(snapshot.sourceActorId);
    for (const snapshot of segment.skillResolution?.ruleAbilitySnapshots || []) add(snapshot.sourceActorId);
  }
  for (const resolution of getEncounterResolutionGroups(comment).flat()) {
    add(resolution.actorId); add(resolution.targetId);
    for (const snapshot of resolution.ruleResourceSnapshots || []) add(snapshot.sourceActorId);
    for (const snapshot of resolution.ruleAbilitySnapshots || []) add(snapshot.sourceActorId);
  }
  return ids;
}

function affectedActorIds(history, index) {
  const affected = actorIds(history[index]);
  // Breaking or removing concentration can change a third participant's state.
  const links = concentrationLinks(deriveCombatStateFromComments(history.slice(0, index)));
  for (const actorId of affected) for (const linked of links.get(actorId) || []) affected.add(linked);
  return affected;
}

// Recovery establishes a new authoritative state even for scene creatures,
// whose source records deliberately have no lastMechanicalCommentId marker.
export function findLaterSceneRegenerationBoundary(history = [], commentId) {
  const index = history.findIndex(comment => comment.id === commentId);
  if (index < 0) return null;
  const affected = affectedActorIds(history, index);
  return history.slice(index + 1).find(comment => isSilentSceneRegeneration(comment)
    && [...actorIds(comment)].some(id => affected.has(id))) || null;
}

// Read dependencies matter too: a final summary or a later attack may depend on
// a state without updating every profile's last-write marker.
export function findLaterMechanicalDependency(history = [], commentId) {
  const index = history.findIndex(comment => comment.id === commentId);
  if (index < 0) return null;
  const affected = affectedActorIds(history, index);
  const sceneIds = new Set(sceneItemEvents(history[index]).map(event => event.sceneItemId));
  for (const segment of history[index].commentSegments || []) {
    if (segment.inventoryUse?.sceneItemId) sceneIds.add(segment.inventoryUse.sceneItemId);
  }
  return history.slice(index + 1).find(comment => [...actorIds(comment)].some(id => affected.has(id))
    || (comment.commentSegments || []).some(segment => sceneIds.has(segment.inventoryUse?.sceneItemId))) || null;
}
