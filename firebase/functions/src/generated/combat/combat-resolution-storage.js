// Compact mechanical resolutions at transport and persistence boundaries.
// Full profile snapshots remain available to the immediate browser narration,
// while Firestore receives stable references plus the authoritative result.

function referenceFromResolution(resolution = {}, role = 'actor') {
  const persistence = resolution[`${role}Persistence`] || {};
  const snapshot = resolution[`${role}CombatProfile`] || resolution[`${role}ProfileSnapshot`] || {};
  return {
    actorId: String(resolution[`${role}Id`] || ''),
    name: String(resolution[`${role}Name`] || ''),
    persistence: persistence && typeof persistence === 'object' ? { ...persistence } : {},
    profileSchemaVersion: Number(snapshot.schemaVersion) || null,
    effectiveLevel: Number(snapshot.progression?.effectiveLevel ?? snapshot.progression?.level) || null
  };
}

export function compactCombatResolution(resolution = {}) {
  if (!resolution || typeof resolution !== 'object') return resolution;
  const { actorCombatProfile, targetCombatProfile, ...compact } = resolution;
  return {
    ...compact,
    profileReferences: {
      actor: referenceFromResolution(resolution, 'actor'),
      target: referenceFromResolution(resolution, 'target')
    }
  };
}

export function compactSkillResolution(resolution = {}) {
  if (!resolution || typeof resolution !== 'object') return resolution;
  const { actorProfileSnapshot, targetProfileSnapshot, ...compact } = resolution;
  return {
    ...compact,
    profileReferences: {
      actor: {
        actorId: String(resolution.actorId || ''),
        name: String(resolution.actorName || ''),
        persistence: resolution.actorPersistence && typeof resolution.actorPersistence === 'object'
          ? { ...resolution.actorPersistence }
          : {},
        profileSchemaVersion: Number(actorProfileSnapshot?.schemaVersion) || null
      },
      target: targetProfileSnapshot ? {
        actorId: String(resolution.opposedDefense?.actorId || ''),
        name: String(resolution.opposedDefense?.actorName || ''),
        profileSchemaVersion: Number(targetProfileSnapshot.schemaVersion) || null
      } : null
    }
  };
}

export function compactMechanicalSegments(segments = []) {
  return (Array.isArray(segments) ? segments : []).map(segment => ({
    ...segment,
    ...(segment?.combatResolution ? { combatResolution: compactCombatResolution(segment.combatResolution) } : {}),
    ...(Array.isArray(segment?.combatResolutions)
      ? { combatResolutions: segment.combatResolutions.map(compactCombatResolution) }
      : {}),
    ...(segment?.skillResolution ? { skillResolution: compactSkillResolution(segment.skillResolution) } : {})
  }));
}

export function compactMechanicalMetadata(metadata = {}) {
  if (!metadata || typeof metadata !== 'object') return metadata;
  const segments = compactMechanicalSegments(metadata.commentSegments);
  return {
    ...metadata,
    ...(Array.isArray(metadata.commentSegments) ? { commentSegments: segments } : {}),
    ...(metadata.combatResolution ? { combatResolution: compactCombatResolution(metadata.combatResolution) } : {})
  };
}
