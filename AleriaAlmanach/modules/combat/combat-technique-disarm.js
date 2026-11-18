import { createWeaponDrop } from '../scene-items/scene-items-model.js';

export function attachTechniqueDisarm(resolution, target) {
  const applied = resolution.targetConditionSnapshot?.applied;
  if (!applied?.disarm) return resolution;
  const event = createWeaponDrop(target, {
    id: resolution.resolutionId, encounterId: '', reason: 'hit'
  });
  if (event) {
    resolution.sceneItemEvents = [event];
    // Scene ownership tracks the dropped item until pickup; no duplicate timed status.
    resolution.targetConditionSnapshot.after = resolution.targetConditionSnapshot.after.filter(condition => condition.id !== applied.id);
    resolution.targetConditionSnapshot.applied = null;
  } else {
    const { disarm, ...condition } = applied;
    const fallback = { ...condition, name: 'Griff gestört',
      description: 'Der unsichere Stand gibt −1 auf Angriffe im nächsten eigenen Beitrag.', mechanics: { attack: -1 } };
    resolution.targetConditionSnapshot.applied = fallback;
    resolution.targetConditionSnapshot.after = resolution.targetConditionSnapshot.after.map(entry => entry.id === applied.id
      ? { ...entry, ...fallback, disarm: false } : entry);
  }
  return resolution;
}
