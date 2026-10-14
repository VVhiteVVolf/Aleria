import { applyChallengeCombatSnapshots } from '../herausforderung/herausforderung-combat-snapshots.js';
import { reconcileConcentrationConditions } from '../combat/combat-condition-lifecycle.js';

export function applySkillRuntimeSnapshots(states, resolution) {
  const actorId = String(resolution.actorId);
  const actor = states.get(actorId) || {};
  states.set(actorId, { ...actor,
    ...(resolution.actorConditionSnapshot?.after ? { temporaryConditions: resolution.actorConditionSnapshot.after } : {}),
    ...(resolution.actorResourceSnapshot?.after ? { resources: resolution.actorResourceSnapshot.after } : {}),
    ...(resolution.actorHitPointSnapshot?.after || {}) });
  for (const snapshot of resolution.ruleResourceSnapshots || []) if (snapshot.sourceActorId && snapshot.after)
    states.set(snapshot.sourceActorId, { ...(states.get(snapshot.sourceActorId) || {}), resources: structuredClone(snapshot.after) });
  for (const snapshot of resolution.ruleAbilitySnapshots || []) if (snapshot.sourceActorId && snapshot.after)
    states.set(snapshot.sourceActorId, { ...(states.get(snapshot.sourceActorId) || {}), abilities: structuredClone(snapshot.after) });
  applyChallengeCombatSnapshots(states, resolution.herausforderungCombatSnapshots);
  reconcileConcentrationConditions(states);
  return states;
}
