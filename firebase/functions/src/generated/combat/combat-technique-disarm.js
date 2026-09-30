import { createWeaponDrop } from '../scene-items/scene-items-model.js';

export function attachTechniqueDisarm(resolution, target) {
  const applied = resolution.targetConditionSnapshot?.applied;
  if (!applied?.disarm) return resolution;
  const event = target.weaponUnavailable ? null : createWeaponDrop(target, {
    id: resolution.resolutionId, encounterId: '', reason: 'hit'
  });
  if (event) {
    resolution.sceneItemEvents = [event];
    // Scene ownership tracks the dropped item until pickup; no duplicate timed status.
    resolution.targetConditionSnapshot.after = resolution.targetConditionSnapshot.after.filter(condition => condition.id !== applied.id);
    resolution.targetConditionSnapshot.applied = null;
  } else {
    applied.name = 'Griff gestört'; applied.description = 'Körperwaffen bleiben erhalten; −1 Angriff im nächsten eigenen Beitrag.';
    applied.mechanics = { attack: -1 }; delete applied.disarm;
  }
  return resolution;
}
