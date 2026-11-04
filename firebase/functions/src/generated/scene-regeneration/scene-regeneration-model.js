// A quiet recovery boundary uses the same reset rules as the status editor,
// without starting a contribution, advancing time or changing possessions.
import { buildCombatStatusChange } from '../combat-status/combat-status-model.js';
import { recoverSceneRestHitPoints } from '../scene-rest/scene-rest-model.js';
import './scene-regeneration-policy.js';

export const SCENE_REGENERATION_EVENT_KIND = 'scene-regeneration-event';
export const SCENE_REGENERATION_SCHEMA_VERSION = 1;

export const isSilentSceneRegeneration = globalThis.AleriaSceneRegenerationPolicy.isComment;

export function buildSceneRegenerationState(profile = {}) {
  const hitPoints = recoverSceneRestHitPoints({
    current: profile.currentHitPoints ?? profile.hitPoints?.current,
    maximum: profile.maximumHitPoints ?? profile.hitPoints?.maximumOverride,
    temporary: profile.temporaryHitPoints ?? profile.hitPoints?.temporary
  }, profile.maximumHitPoints, { clearTemporary: true });

  return buildCombatStatusChange({
    operation: 'reset',
    profile,
    resetState: {
      hitPoints: hitPoints.after,
      resources: Array.isArray(profile.resources) ? profile.resources : [],
      abilities: Array.isArray(profile.abilities) ? profile.abilities : []
    }
  });
}

export function applySceneRegenerationToStateMap(states, comment = {}) {
  if (!(states instanceof Map) || !isSilentSceneRegeneration(comment)) return states;
  for (const participant of comment.sceneRegeneration.participants) {
    const actorId = String(participant?.actorId || '');
    const after = participant?.after;
    if (!actorId || !after || typeof after !== 'object') continue;
    // Only reset-owned fields cross this boundary. Inventory, loadout and
    // permanent sheet conditions continue to belong to their existing systems.
    states.set(actorId, {
      ...(states.get(actorId) || {}),
      current: after.current,
      maximum: after.maximum,
      temporary: 0,
      resources: (Array.isArray(after.resources) ? after.resources : []).map(resource => ({ ...resource })),
      abilities: (Array.isArray(after.abilities) ? after.abilities : []).map(ability => ({ ...ability })),
      temporaryConditions: [],
      concentration: null,
      channeling: null,
      encounterAuraTemporaryHitPoints: null
    });
  }
  return states;
}
