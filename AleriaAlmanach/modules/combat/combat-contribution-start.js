import { getCommentActorIds, normalizeRuntimeCondition } from './combat-condition-duration.js';
import { resetCommentScopedResources } from './combat-action-economy.js';

// Only participating actors begin a contribution. Observers and targets keep
// their spent resources; start-bound effects never tick at contribution end.
export function conditionsAtContributionStart(conditions = []) {
  return conditions.filter(condition => normalizeRuntimeCondition(condition).durationModel.expiresAt !== 'actor-start');
}

export function beginCombatContribution(states, comment = {}) {
  if (comment.combatEncounter || comment.combatStatus || comment.combatRulesRelease) return states;
  for (const actorId of getCommentActorIds(comment)) {
    const state = states.get(actorId);
    if (!state) continue;
    states.set(actorId, { ...state,
      ...(Array.isArray(state.resources) ? { resources: resetCommentScopedResources(state.resources) } : {}),
      ...(Array.isArray(state.temporaryConditions) ? { temporaryConditions: conditionsAtContributionStart(state.temporaryConditions) } : {})
    });
  }
  return states;
}
