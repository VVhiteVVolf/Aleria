export function resolveSceneCreatureSource(actor, source) {
  if (!actor.sourceCreatureId || source?.entityType !== 'creature') return actor;
  // Instance identity and appearance belong to the scene. Rules and initial
  // possessions are read from the current creature sheet on both endpoints.
  return { ...actor, combatProfile: source.combatProfile, inventory: source.inventory };
}

export function projectSceneCreatureActors(actors, sources) {
  if (!actors.length) return actors;
  const byId = new Map(sources.map(source => [source.id, source]));
  return actors.map(actor => resolveSceneCreatureSource(actor, byId.get(actor.sourceCreatureId)));
}
