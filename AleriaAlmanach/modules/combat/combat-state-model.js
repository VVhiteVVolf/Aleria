// Pure combat-state helpers.
// This module is the single source of truth for damage application and for
// replaying stored combat resolutions into the current scene state.

function finiteOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampHitPointValue(value, fallback = 0) {
  const number = finiteOrNull(value);
  return Math.max(0, number == null ? fallback : number);
}

export function normalizeCombatHitPointState(source = {}, fallback = {}) {
  const maximum = clampHitPointValue(
    source.maximum ?? source.maximumHitPoints ?? source.maximumOverride,
    clampHitPointValue(fallback.maximum ?? fallback.maximumHitPoints ?? fallback.maximumOverride, 0)
  );
  const fallbackCurrent = finiteOrNull(fallback.current ?? fallback.currentHitPoints);
  const currentValue = finiteOrNull(source.current ?? source.currentHitPoints);
  const current = Math.min(maximum || Number.MAX_SAFE_INTEGER, Math.max(0,
    currentValue == null ? (fallbackCurrent == null ? maximum : fallbackCurrent) : currentValue
  ));
  const temporary = clampHitPointValue(
    source.temporary ?? source.temporaryHitPoints,
    clampHitPointValue(fallback.temporary ?? fallback.temporaryHitPoints, 0)
  );
  return { current, maximum, temporary };
}

export function applyCombatDamage(state = {}, damage = 0) {
  const before = normalizeCombatHitPointState(state);
  const incoming = Math.max(0, finiteOrNull(damage) ?? 0);
  const absorbedByTemporary = Math.min(before.temporary, incoming);
  const hitPointDamage = Math.min(before.current, incoming - absorbedByTemporary);
  const after = {
    current: Math.max(0, before.current - hitPointDamage),
    maximum: before.maximum,
    temporary: Math.max(0, before.temporary - absorbedByTemporary)
  };
  return {
    before,
    after,
    incoming,
    absorbedByTemporary,
    hitPointDamage,
    defeated: before.current > 0 && after.current === 0
  };
}

export function normalizeCombatResources(resources = []) {
  return (Array.isArray(resources) ? resources : []).map((resource, index) => ({
    ...resource,
    id: String(resource?.id || `resource-${index + 1}`),
    name: String(resource?.name || 'Ressource'),
    current: Number(resource?.current) || 0,
    maximum: Math.max(0, Number(resource?.maximum) || 0)
  }));
}

export function applyCombatResourceCosts(resources = [], costs = []) {
  const before = normalizeCombatResources(resources);
  const normalizedCosts = (Array.isArray(costs) ? costs : [])
    .map(cost => ({
      resourceId: String(cost?.resourceId || ''),
      name: String(cost?.name || 'Ressource'),
      amount: Math.max(0, Number(cost?.amount) || 0)
    }))
    .filter(cost => cost.resourceId && cost.amount > 0);
  const missing = normalizedCosts.find(cost => {
    const resource = before.find(item => item.id === cost.resourceId);
    return !resource || resource.current < cost.amount;
  }) || null;
  if (missing) return { sufficient: false, missing, before, after: before, changes: [] };
  const changes = [];
  const after = before.map(resource => {
    const amount = normalizedCosts
      .filter(cost => cost.resourceId === resource.id)
      .reduce((sum, cost) => sum + cost.amount, 0);
    if (!amount) return resource;
    const next = { ...resource, current: Math.max(0, resource.current - amount) };
    changes.push({
      resourceId: resource.id,
      name: resource.name,
      amount,
      before: resource.current,
      after: next.current,
      maximum: resource.maximum
    });
    return next;
  });
  return { sufficient: true, missing: null, before, after, changes };
}

export function patchResolutionResourceState(resolution = {}, resources = []) {
  const applied = applyCombatResourceCosts(resources, resolution.resourceCosts || []);
  if (!applied.sufficient) return { resolution, applied };
  return {
    applied,
    resolution: {
      ...resolution,
      actorResourceSnapshot: applied.changes.length ? {
        before: applied.before,
        after: applied.after,
        changes: applied.changes
      } : null
    }
  };
}

export function patchResolutionHitPointState(resolution = {}, state = {}) {
  const applied = applyCombatDamage(state, resolution.damage?.total || 0);
  return {
    ...resolution,
    targetSnapshot: {
      ...(resolution.targetSnapshot || {}),
      currentHitPoints: applied.before.current,
      hitPointsBefore: applied.before.current,
      hitPointsAfter: applied.after.current,
      maximumHitPoints: applied.after.maximum,
      temporaryHitPointsBefore: applied.before.temporary,
      temporaryHitPointsAfter: applied.after.temporary,
      damageAbsorbedByTemporaryHitPoints: applied.absorbedByTemporary,
      damageAppliedToHitPoints: applied.hitPointDamage,
      defeated: applied.defeated
    }
  };
}

export function getResolutionHitPointState(resolution = {}) {
  const snapshot = resolution?.targetSnapshot;
  if (!snapshot || snapshot.hitPointsAfter == null) return null;
  return normalizeCombatHitPointState({
    current: snapshot.hitPointsAfter,
    maximum: snapshot.maximumHitPoints,
    temporary: snapshot.temporaryHitPointsAfter ?? 0
  });
}

export function getResolutionActorResourceState(resolution = {}) {
  const resources = resolution?.actorResourceSnapshot?.after;
  return Array.isArray(resources) ? normalizeCombatResources(resources) : null;
}

function getStoredResolutions(comment = {}) {
  if (Array.isArray(comment.commentSegments)) {
    return comment.commentSegments
      .map(segment => segment?.combatResolution)
      .filter(resolution => resolution?.targetId && resolution?.targetSnapshot);
  }
  return comment.combatResolution?.targetId ? [comment.combatResolution] : [];
}

export function deriveCombatStateFromComments(comments = [], position = {}) {
  const states = new Map();
  const stopCommentId = String(position.commentId || '');
  const stopSegmentIndex = Number.isInteger(position.segmentIndex) ? position.segmentIndex : null;
  for (const comment of (Array.isArray(comments) ? comments : [])) {
    const isStopComment = stopCommentId && String(comment?.id || '') === stopCommentId;
    if (isStopComment && stopSegmentIndex == null) break;
    const segments = Array.isArray(comment?.commentSegments) ? comment.commentSegments : [];
    const entries = segments.length
      ? segments.map((segment, index) => ({ index, resolution: segment?.combatResolution })).filter(entry => entry.resolution)
      : getStoredResolutions(comment).map(resolution => ({ index: 0, resolution }));
    for (const entry of entries) {
      if (isStopComment && stopSegmentIndex != null && entry.index >= stopSegmentIndex) break;
      const resolution = entry.resolution;
      const state = getResolutionHitPointState(resolution);
      if (state) {
        const previous = states.get(String(resolution.targetId)) || {};
        states.set(String(resolution.targetId), { ...previous, ...state });
      }
      const actorResources = getResolutionActorResourceState(resolution);
      if (actorResources) {
        const previous = states.get(String(resolution.actorId)) || {};
        states.set(String(resolution.actorId), { ...previous, resources: actorResources });
      }
    }
    if (isStopComment) break;
  }
  return states;
}

export function overlayCombatHitPointState(profile = {}, state = null) {
  if (!state) return profile;
  const normalized = normalizeCombatHitPointState(state, profile);
  const storedResources = Array.isArray(state.resources) ? normalizeCombatResources(state.resources) : null;
  const resources = storedResources
    ? normalizeCombatResources(profile.resources).map(resource => {
        const stored = storedResources.find(item => item.id === resource.id);
        return stored ? { ...resource, current: stored.current, maximum: stored.maximum } : resource;
      })
    : profile.resources;
  const aiSnapshot = profile.aiSnapshot ? {
    ...profile.aiSnapshot,
    derivedCombatValues: {
      ...(profile.aiSnapshot.derivedCombatValues || {}),
      currentHitPoints: normalized.current,
      maximumHitPoints: normalized.maximum || profile.maximumHitPoints,
      temporaryHitPoints: normalized.temporary
    },
    hitPointRules: profile.aiSnapshot.hitPointRules ? {
      ...profile.aiSnapshot.hitPointRules,
      current: normalized.current,
      temporary: normalized.temporary
    } : profile.aiSnapshot.hitPointRules,
    coreResources: normalizeCombatResources(resources || [])
  } : profile.aiSnapshot;
  return {
    ...profile,
    currentHitPoints: normalized.current,
    maximumHitPoints: normalized.maximum || profile.maximumHitPoints,
    temporaryHitPoints: normalized.temporary,
    resources,
    aiSnapshot,
    hitPoints: profile.hitPoints ? {
      ...profile.hitPoints,
      current: normalized.current,
      temporary: normalized.temporary,
      maximumOverride: profile.hitPoints.maximumOverride
    } : profile.hitPoints
  };
}

export function getCombatPersistenceKey(persistence = {}) {
  const kind = String(persistence.kind || '');
  const recordId = String(persistence.recordId || persistence.actorId || '');
  return kind && recordId ? `${kind}:${recordId}` : '';
}

export const combatStateInternals = Object.freeze({ getStoredResolutions });
