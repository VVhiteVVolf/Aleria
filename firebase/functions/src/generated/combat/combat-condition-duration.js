// Pure duration helpers shared by browser replay and trusted server validation.
// A condition owns an explicit clock; prose in `duration` is presentation only.

const DURATION_KINDS = new Set([
  'permanent', 'combat', 'actor-comments', 'scene-comments',
  'short-rest', 'long-rest', 'day', 'concentration', 'channeling'
]);

function integer(value, fallback = 0, minimum = 0, maximum = 9999) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

function text(value, maximum = 160) {
  return String(value || '').trim().slice(0, maximum);
}

export function normalizeConditionDuration(value = {}, fallbackText = '') {
  const source = value && typeof value === 'object' ? value : {};
  const kind = text(source.kind, 40);
  const remainingActorComments = integer(
    source.remainingActorComments ?? (kind === 'actor-comments' ? source.amount : null),
    0
  );
  const remainingSceneComments = integer(
    source.remainingSceneComments ?? (kind === 'scene-comments' ? source.amount : null),
    0
  );
  return {
    kind: DURATION_KINDS.has(kind)
      ? kind
      : (remainingActorComments > 0 ? 'actor-comments' : (remainingSceneComments > 0 ? 'scene-comments' : 'permanent')),
    remainingActorComments,
    remainingSceneComments,
    expiresOnRest: ['short-rest', 'long-rest'].includes(kind) ? kind : '',
    expiresOnDayChange: kind === 'day' || source.expiresOnDayChange === true,
    encounterId: text(source.encounterId, 180),
    concentrationOwnerId: text(source.concentrationOwnerId, 180),
    channelOwnerId: text(source.channelOwnerId, 180),
    label: text(source.label || fallbackText, 180)
  };
}

function sanitizeWard(value) {
  const source = value && typeof value === 'object' ? value : {};
  if (source.enabled !== true) return { enabled: false, charges: 0, deflectChance: 100, breaksOnCriticalHit: false };
  return {
    enabled: true,
    charges: integer(source.charges, 0, 0, 99),
    deflectChance: integer(source.deflectChance, 100, 0, 100),
    breaksOnCriticalHit: source.breaksOnCriticalHit === true
  };
}

export function normalizeRuntimeCondition(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const legacyActorComments = integer(source.remainingActorComments, 0);
  const duration = normalizeConditionDuration(
    source.durationModel || {
      kind: legacyActorComments > 0 ? 'actor-comments' : '',
      remainingActorComments: legacyActorComments,
      remainingSceneComments: source.remainingSceneComments
    },
    source.duration
  );
  return {
    ...source,
    id: text(source.id || `condition-${index + 1}`, 180),
    name: text(source.name || 'Zustand', 160),
    active: source.active !== false,
    durationModel: duration,
    // Kept for old comments and old UI readers.
    remainingActorComments: duration.remainingActorComments,
    remainingSceneComments: duration.remainingSceneComments,
    // Abwehrladungen (z. B. Schild, Spiegelbilder): lenkt eingehende Treffer ab, bis die Ladungen aufgebraucht sind.
    ward: sanitizeWard(source.ward)
  };
}

export function getCommentActorIds(comment = {}) {
  const ids = new Set();
  const remember = value => {
    const id = text(value, 180);
    if (id) ids.add(id);
  };
  const segments = Array.isArray(comment.commentSegments) && comment.commentSegments.length
    ? comment.commentSegments
    : [comment];
  segments.forEach(segment => {
    remember(segment?.sceneActorId || segment?.actorId || segment?.characterId || comment?.characterId);
    // Persisted mechanical segments keep their authoritative actor inside the
    // resolution. Narrative metadata is intentionally not required for replay.
    remember(segment?.combatResolution?.actorId);
    remember(segment?.skillResolution?.actorId);
  });
  return ids;
}

export function advanceConditionForComment(condition = {}, ownerId = '', contributingActorIds = new Set()) {
  const normalized = normalizeRuntimeCondition(condition);
  if (!normalized.active) return { condition: normalized, expired: true, reason: 'inactive' };
  const duration = { ...normalized.durationModel };
  if (duration.kind === 'scene-comments' && duration.remainingSceneComments > 0) {
    duration.remainingSceneComments -= 1;
  }
  if (duration.kind === 'actor-comments'
    && duration.remainingActorComments > 0
    && contributingActorIds.has(String(ownerId || ''))) {
    duration.remainingActorComments -= 1;
  }
  const expired = (duration.kind === 'scene-comments' && duration.remainingSceneComments <= 0)
    || (duration.kind === 'actor-comments' && duration.remainingActorComments <= 0);
  return {
    condition: {
      ...normalized,
      durationModel: duration,
      remainingActorComments: duration.remainingActorComments,
      remainingSceneComments: duration.remainingSceneComments,
      active: expired ? false : normalized.active
    },
    expired,
    reason: expired ? duration.kind : ''
  };
}

export function advanceTemporaryConditionsForComment(states, comment = {}, options = {}) {
  if (!(states instanceof Map)) return states;
  const actors = getCommentActorIds(comment);
  const eligibleByActor = options.conditionIdsByActor instanceof Map ? options.conditionIdsByActor : null;
  states.forEach((state, actorId) => {
    const conditions = Array.isArray(state?.temporaryConditions) ? state.temporaryConditions : [];
    if (!conditions.length) return;
    const eligibleIds = eligibleByActor ? (eligibleByActor.get(String(actorId)) || new Set()) : null;
    const advanced = conditions
      .map(condition => {
        const normalized = normalizeRuntimeCondition(condition);
        if (eligibleIds instanceof Set && !eligibleIds.has(normalized.id)) {
          return { condition: normalized, expired: false, reason: '' };
        }
        return advanceConditionForComment(normalized, actorId, actors);
      })
      .filter(result => !result.expired)
      .map(result => result.condition);
    states.set(actorId, { ...state, temporaryConditions: advanced });
  });
  return states;
}

export function expireConditionsForRest(conditions = [], restType = 'short', dayChanged = false) {
  const normalizedType = restType === 'long' ? 'long' : 'short';
  return (Array.isArray(conditions) ? conditions : [])
    .map(normalizeRuntimeCondition)
    .filter(condition => {
      const duration = condition.durationModel;
      if (dayChanged && duration.expiresOnDayChange) return false;
      if (normalizedType === 'long' && ['short-rest', 'long-rest'].includes(duration.kind)) return false;
      if (normalizedType === 'short' && duration.kind === 'short-rest') return false;
      return true;
    });
}

export const combatConditionDurationInternals = Object.freeze({ DURATION_KINDS, integer, text });
