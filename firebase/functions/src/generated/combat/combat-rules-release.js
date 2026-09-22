// An administrative boundary changes future rules, never stored rolls or turn state.
// Only a server-authored release record may activate it; ordinary comments cannot.
export function getCombatRulesRelease(comment = {}) {
  const release = comment.combatRulesRelease;
  return comment.serverValidatedMechanics === true
    && comment.commentKind === 'combat-rules-release'
    && release?.version === 1 && release.encounterId
    ? release : null;
}

export function applyCombatRulesReleaseToStates(states, release) {
  for (const update of release.equipmentSnapshots || []) {
    if (!update.actorId || !update.inventory) continue;
    const actorId = String(update.actorId);
    states.set(actorId, { ...(states.get(actorId) || {}), inventory: structuredClone(update.inventory) });
  }
}
