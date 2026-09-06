// Scene-owned condition identity and concentration links. Shared by browser and server.
export function getConditionConcentrationOwnerId(condition = {}) {
  return String(condition.concentrationOwnerId || condition.durationModel?.concentrationOwnerId || '');
}

export function refreshRuntimeCondition(conditions = [], incoming) {
  // Recasting one effect by the same caster refreshes it. Manual effects have
  // independent identities and remain explicitly managed by the player.
  return conditions.filter(condition => !incoming.sourceConditionId
    || condition.sourceConditionId !== incoming.sourceConditionId
    || condition.sourceActorId !== incoming.sourceActorId).concat(incoming);
}

export function reconcileConcentrationConditions(states, { pruneEmpty = false } = {}) {
  states.forEach((state, actorId) => {
    const conditions = state.temporaryConditions || [];
    const remaining = conditions.filter(condition => {
      const ownerId = getConditionConcentrationOwnerId(condition);
      if (!ownerId) return true;
      const owner = states.get(ownerId);
      if (!owner || !Object.hasOwn(owner, 'concentration')) return true;
      if (!owner.concentration) return false;
      return !condition.concentrationInstanceId || !owner.concentration.instanceId
        || condition.concentrationInstanceId === owner.concentration.instanceId;
    });
    if (remaining.length !== conditions.length) states.set(actorId, { ...state, temporaryConditions: remaining });
  });
  if (!pruneEmpty) return states;
  const sustainedOwners = new Set();
  states.forEach(state => (state.temporaryConditions || []).forEach(condition => {
    const ownerId = getConditionConcentrationOwnerId(condition);
    if (ownerId) sustainedOwners.add(ownerId);
  }));
  states.forEach((state, actorId) => {
    if (state.concentration?.tracksConditions && !sustainedOwners.has(String(actorId))) {
      states.set(actorId, { ...state, concentration: null });
    }
  });
  return states;
}
