// Pure rules and storage normalization for scene rests.
// UI, Firebase and combat replay all consume the same recovery decisions.

import {
  expireConditionsForRest,
  normalizeRuntimeCondition
} from '../combat/combat-condition-duration.js?v=20260807-rhiannon-v1';

export const SCENE_REST_EVENT_KIND = 'scene-rest-event';
export const SCENE_REST_SCHEMA_VERSION = 1;

export const SCENE_REST_TYPES = Object.freeze({
  short: Object.freeze({
    id: 'short',
    label: 'Kurze Rast',
    durationSeconds: 60 * 60,
    title: 'Eine kurze Rast',
    description: 'Die Gruppe hält inne, versorgt Wunden und sammelt neue Kraft.'
  }),
  long: Object.freeze({
    id: 'long',
    label: 'Lange Rast',
    durationSeconds: 8 * 60 * 60,
    title: 'Eine lange Rast',
    description: 'Die Gruppe zieht sich für eine ausgedehnte Erholung zurück.'
  })
});

const SHORT_REST_RECOVERY = new Set(['short-rest']);
const LONG_REST_RECOVERY = new Set(['short-rest', 'long-rest', 'scene']);

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, minimum = 0, maximum = 999999) {
  return Math.max(minimum, Math.min(maximum, finiteNumber(value, minimum)));
}

function cleanText(value, maximum = 180) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maximum);
}

function cloneResource(resource = {}, index = 0) {
  return {
    ...resource,
    id: cleanText(resource.id || `resource-${index + 1}`, 120),
    name: cleanText(resource.name || 'Ressource', 120),
    current: clamp(resource.current),
    maximum: clamp(resource.maximum),
    recovery: cleanText(resource.recovery || 'manual', 40),
    scope: resource.scope === 'comment' ? 'comment' : 'persistent'
  };
}

function cloneAbility(ability = {}, index = 0) {
  return {
    ...ability,
    id: cleanText(ability.id || `ability-${index + 1}`, 120),
    name: cleanText(ability.name || 'Besondere Fähigkeit', 140),
    usesCurrent: clamp(ability.usesCurrent),
    usesMaximum: clamp(ability.usesMaximum),
    recovery: cleanText(ability.recovery || 'none', 40),
    ...(cleanText(ability.recoveryDayKey, 160) ? { recoveryDayKey: cleanText(ability.recoveryDayKey, 160) } : {})
  };
}

export function getSceneRestType(value = 'short') {
  return SCENE_REST_TYPES[value] || SCENE_REST_TYPES.short;
}

export function shouldRecoverSceneRestResource(resource = {}, restType = 'short') {
  if (resource.scope === 'comment') return true;
  const recovery = String(resource.recovery || '').trim();
  return restType === 'long'
    ? LONG_REST_RECOVERY.has(recovery)
    : SHORT_REST_RECOVERY.has(recovery);
}

export function recoverSceneRestResources(resources = [], restType = 'short', recoveryDayKey = '', options = {}) {
  const normalizedType = getSceneRestType(restType).id;
  const dayKey = cleanText(recoveryDayKey, 160);
  return (Array.isArray(resources) ? resources : []).map((resource, index) => {
    const next = cloneResource(resource, index);
    if (next.recovery === 'day' && options.dayChanged === true && dayKey) {
      next.current = next.maximum;
      next.recoveryDayKey = dayKey;
      return next;
    }
    if (!shouldRecoverSceneRestResource(next, normalizedType)) return next;
    next.current = next.maximum;
    return next;
  });
}

export function recoverSceneRestAbilities(abilities = [], restType = 'short', recoveryDayKey = '', options = {}) {
  const normalizedType = getSceneRestType(restType).id;
  const recoveries = normalizedType === 'long' ? LONG_REST_RECOVERY : SHORT_REST_RECOVERY;
  const dayKey = cleanText(recoveryDayKey, 160);
  return (Array.isArray(abilities) ? abilities : []).map((ability, index) => {
    const next = cloneAbility(ability, index);
    if (next.recovery === 'day' && options.dayChanged === true && dayKey) {
      next.usesCurrent = next.usesMaximum;
      next.recoveryDayKey = dayKey;
      return next;
    }
    if (recoveries.has(next.recovery)) next.usesCurrent = next.usesMaximum;
    return next;
  });
}

export function recoverSceneRestHitPoints(hitPoints = {}, fallbackMaximum = 0, options = {}) {
  const maximum = clamp(
    hitPoints.maximum ?? hitPoints.maximumHitPoints ?? hitPoints.maximumOverride,
    0,
    999999
  ) || clamp(fallbackMaximum, 0, 999999);
  const current = Math.min(maximum || Number.MAX_SAFE_INTEGER, clamp(
    hitPoints.current ?? hitPoints.currentHitPoints,
    0,
    999999
  ));
  const temporary = clamp(hitPoints.temporary ?? hitPoints.temporaryHitPoints, 0, 999999);
  return {
    before: { current, maximum, temporary },
    after: { current: maximum, maximum, temporary: options.clearTemporary === true ? 0 : temporary }
  };
}

export function buildSceneRestParticipant(profile = {}, restType = 'short', options = {}) {
  const actorId = cleanText(options.actorId || profile.characterId || profile.id, 180);
  const hitPoints = recoverSceneRestHitPoints({
    current: profile.currentHitPoints ?? profile.hitPoints?.current,
    maximum: profile.maximumHitPoints ?? profile.hitPoints?.maximumOverride,
    temporary: profile.temporaryHitPoints ?? profile.hitPoints?.temporary
  }, profile.maximumHitPoints, { clearTemporary: restType === 'long' });
  const beforeResources = (Array.isArray(profile.resources) ? profile.resources : []).map(cloneResource);
  const recoveryOptions = { dayChanged: options.dayChanged === true };
  const afterResources = recoverSceneRestResources(beforeResources, restType, options.recoveryDayKey, recoveryOptions);
  const beforeAbilities = (Array.isArray(profile.abilities) ? profile.abilities : []).map(cloneAbility);
  const afterAbilities = recoverSceneRestAbilities(beforeAbilities, restType, options.recoveryDayKey, recoveryOptions);
  const beforeConditions = (Array.isArray(profile.temporaryConditions) ? profile.temporaryConditions : []).map(normalizeRuntimeCondition);
  const afterConditions = expireConditionsForRest(beforeConditions, restType, recoveryOptions.dayChanged);
  const resourceChanges = afterResources.flatMap(after => {
    const before = beforeResources.find(resource => resource.id === after.id);
    if (!before || before.current === after.current) return [];
    return [{ id: after.id, name: after.name, before: before.current, after: after.current, maximum: after.maximum }];
  });
  const abilityChanges = afterAbilities.flatMap(after => {
    const before = beforeAbilities.find(ability => ability.id === after.id);
    if (!before || before.usesCurrent === after.usesCurrent) return [];
    return [{ id: after.id, name: after.name, before: before.usesCurrent, after: after.usesCurrent, maximum: after.usesMaximum }];
  });
  return {
    actorId,
    sourceId: cleanText(options.sourceId, 180),
    name: cleanText(options.name || profile.name || 'Unbekannte Figur', 140),
    title: cleanText(options.title || profile.title, 180),
    portrait: String(options.portrait || profile.portrait || '').trim().slice(0, 2000),
    persistence: options.persistence && typeof options.persistence === 'object'
      ? { ...options.persistence }
      : (profile.persistence && typeof profile.persistence === 'object' ? { ...profile.persistence } : {}),
    before: { hitPoints: hitPoints.before, resources: beforeResources, abilities: beforeAbilities, conditions: beforeConditions },
    after: { hitPoints: hitPoints.after, resources: afterResources, abilities: afterAbilities, conditions: afterConditions },
    changes: {
      hitPointsRestored: Math.max(0, hitPoints.after.current - hitPoints.before.current),
      resources: resourceChanges,
      abilities: abilityChanges
    }
  };
}

export function normalizeSceneRestParticipant(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const actorId = cleanText(source.actorId || source.id || `actor-${index + 1}`, 180);
  const beforeHitPoints = recoverSceneRestHitPoints(source.before?.hitPoints || {}, source.after?.hitPoints?.maximum).before;
  const afterHitPoints = recoverSceneRestHitPoints(source.after?.hitPoints || {}, source.after?.hitPoints?.maximum).before;
  const beforeResources = (Array.isArray(source.before?.resources) ? source.before.resources : []).map(cloneResource);
  const afterResources = (Array.isArray(source.after?.resources) ? source.after.resources : []).map(cloneResource);
  const beforeAbilities = (Array.isArray(source.before?.abilities) ? source.before.abilities : []).map(cloneAbility);
  const afterAbilities = (Array.isArray(source.after?.abilities) ? source.after.abilities : []).map(cloneAbility);
  const beforeConditions = (Array.isArray(source.before?.conditions) ? source.before.conditions : []).map(normalizeRuntimeCondition);
  const afterConditions = (Array.isArray(source.after?.conditions) ? source.after.conditions : beforeConditions).map(normalizeRuntimeCondition);
  return {
    actorId,
    sourceId: cleanText(source.sourceId, 180),
    name: cleanText(source.name || 'Unbekannte Figur', 140),
    title: cleanText(source.title, 180),
    portrait: String(source.portrait || '').trim().slice(0, 2000),
    persistence: source.persistence && typeof source.persistence === 'object' ? { ...source.persistence } : {},
    before: { hitPoints: beforeHitPoints, resources: beforeResources, abilities: beforeAbilities, conditions: beforeConditions },
    after: { hitPoints: afterHitPoints, resources: afterResources, abilities: afterAbilities, conditions: afterConditions },
    changes: {
      hitPointsRestored: Math.max(0, finiteNumber(source.changes?.hitPointsRestored, afterHitPoints.current - beforeHitPoints.current)),
      resources: (Array.isArray(source.changes?.resources) ? source.changes.resources : []).map(change => ({
        id: cleanText(change.id, 120),
        name: cleanText(change.name || 'Ressource', 120),
        before: clamp(change.before),
        after: clamp(change.after),
        maximum: clamp(change.maximum)
      })),
      abilities: (Array.isArray(source.changes?.abilities) ? source.changes.abilities : []).map(change => ({
        id: cleanText(change.id, 120),
        name: cleanText(change.name || 'Besondere Fähigkeit', 140),
        before: clamp(change.before),
        after: clamp(change.after),
        maximum: clamp(change.maximum)
      }))
    }
  };
}

export function normalizeSceneRest(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const type = getSceneRestType(source.type).id;
  const defaultDuration = getSceneRestType(type).durationSeconds;
  const seen = new Set();
  const participants = (Array.isArray(source.participants) ? source.participants : [])
    .map(normalizeSceneRestParticipant)
    .filter(participant => {
      if (!participant.actorId || seen.has(participant.actorId)) return false;
      seen.add(participant.actorId);
      return true;
    });
  return {
    kind: SCENE_REST_EVENT_KIND,
    schemaVersion: SCENE_REST_SCHEMA_VERSION,
    type,
    durationSeconds: clamp(source.durationSeconds || defaultDuration, 60, 7 * 86400),
    title: cleanText(source.title || getSceneRestType(type).title, 160),
    body: String(source.body || getSceneRestType(type).description).trim().slice(0, 4000),
    recoveryDayKey: cleanText(source.recoveryDayKey, 160),
    dayChanged: source.dayChanged === true,
    participants
  };
}

export function isSceneRestComment(comment = {}) {
  return !!(
    comment?.sceneRest
    || comment?.commentKind === SCENE_REST_EVENT_KIND
    || comment?.commentMode === 'scene-rest'
  );
}

export function applySceneRestCommentToStateMap(states, comment = {}) {
  if (!(states instanceof Map) || !isSceneRestComment(comment)) return states;
  const rest = normalizeSceneRest(comment.sceneRest || comment);
  rest.participants.forEach(participant => {
    const previous = states.get(participant.actorId) || {};
    states.set(participant.actorId, {
      ...previous,
      current: participant.after.hitPoints.current,
      maximum: participant.after.hitPoints.maximum,
      temporary: participant.after.hitPoints.temporary,
      resources: participant.after.resources.map(resource => ({ ...resource })),
      abilities: participant.after.abilities.map(ability => ({ ...ability })),
      temporaryConditions: participant.after.conditions.map(condition => ({ ...condition })),
      concentration: null,
      channeling: null
    });
  });
  return states;
}
