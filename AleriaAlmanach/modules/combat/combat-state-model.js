// Pure combat-state helpers.
// This module is the single source of truth for damage application and for
// replaying stored combat resolutions into the current scene state.

import { resetCommentScopedResources } from './combat-action-economy.js?v=20260807-magic-system-v1';
import { applySceneRestCommentToStateMap } from '../scene-rest/scene-rest-model.js?v=20260804-referee-v2';
import {
  advanceTemporaryConditionsForComment,
  normalizeRuntimeCondition
} from './combat-condition-duration.js?v=20260804-referee-v2';
import { applyCombatEncounterCommentToStateMap } from './combat-encounter-model.js?v=20260806-encounter-card-v1';

function finiteOrNull(value) {
  if (value == null || value === '') return null;
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
  const rawCosts = (Array.isArray(costs) ? costs : [])
    .map(cost => ({
      resourceId: String(cost?.resourceId || ''),
      name: String(cost?.name || 'Ressource'),
      amount: Math.max(0, Number(cost?.amount) || 0),
      scope: cost?.scope === 'comment' ? 'comment' : 'persistent'
    }))
    .filter(cost => cost.resourceId && cost.amount > 0);
  const normalizedCosts = [...rawCosts.reduce((grouped, cost) => {
    const existing = grouped.get(cost.resourceId);
    if (existing) existing.amount += cost.amount;
    else grouped.set(cost.resourceId, { ...cost });
    return grouped;
  }, new Map()).values()];
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
      maximum: resource.maximum,
      scope: resource.scope === 'comment' ? 'comment' : 'persistent'
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

export function getResolutionTargetResourceState(resolution = {}) {
  const resources = resolution?.targetResourceSnapshot?.after;
  return Array.isArray(resources) ? normalizeCombatResources(resources) : null;
}

export function getResolutionActorAbilityState(resolution = {}) {
  const abilities = resolution?.actorAbilitySnapshot?.after;
  return Array.isArray(abilities) ? abilities.map(ability => ({ ...ability })) : null;
}

export function getResolutionActorHitPointState(resolution = {}) {
  const hitPoints = resolution?.actorHitPointSnapshot?.after;
  return hitPoints ? normalizeCombatHitPointState(hitPoints) : null;
}

export function getResolutionActorConditionState(resolution = {}) {
  const conditions = resolution?.actorConditionSnapshot?.after;
  return Array.isArray(conditions) ? conditions.map(condition => ({ ...condition })) : null;
}

export function getResolutionActorInventoryState(resolution = {}) {
  const inventory = resolution?.actorInventorySnapshot?.after;
  return inventory && typeof inventory === 'object' ? JSON.parse(JSON.stringify(inventory)) : null;
}

export function getResolutionActorEquippedWeaponState(resolution = {}) {
  const weaponId = resolution?.actorEquippedWeaponSnapshot?.after;
  return weaponId ? String(weaponId) : null;
}

export function getResolutionTargetConditionState(resolution = {}) {
  const conditions = resolution?.targetConditionSnapshot?.after;
  return Array.isArray(conditions) ? conditions.map(condition => ({ ...condition })) : null;
}

export function getResolutionActorChannelingState(resolution = {}) {
  if (!resolution?.actorChannelingSnapshot) return undefined;
  return resolution.actorChannelingSnapshot.after || null;
}

export function getResolutionActorConcentrationState(resolution = {}) {
  if (!resolution?.actorConcentrationSnapshot) return undefined;
  return resolution.actorConcentrationSnapshot.after || null;
}

export function getResolutionTargetConcentrationState(resolution = {}) {
  if (!resolution?.targetConcentrationSnapshot) return undefined;
  return resolution.targetConcentrationSnapshot.after || null;
}

export function getResolutionTargetChannelingState(resolution = {}) {
  if (!resolution?.targetChannelingSnapshot) return undefined;
  return resolution.targetChannelingSnapshot.after || null;
}

function getStoredResolutions(comment = {}) {
  if (Array.isArray(comment.commentSegments)) {
    return comment.commentSegments
      .flatMap(segment => Array.isArray(segment?.combatResolutions)
        ? segment.combatResolutions
        : [segment?.combatResolution])
      .filter(resolution => resolution?.targetId && resolution?.targetSnapshot);
  }
  return comment.combatResolution?.targetId ? [comment.combatResolution] : [];
}

export function deriveCombatStateFromComments(comments = [], position = {}) {
  const states = new Map();
  const stopCommentId = String(position.commentId || '');
  const stopSegmentIndex = Number.isInteger(position.segmentIndex) ? position.segmentIndex : null;
  for (const comment of (Array.isArray(comments) ? comments : [])) {
    states.forEach((state, actorId) => {
      if (Array.isArray(state.resources)) {
        states.set(actorId, { ...state, resources: resetCommentScopedResources(state.resources) });
      }
    });
    const conditionIdsBeforeComment = new Map([...states].map(([actorId, state]) => [
      String(actorId),
      new Set((Array.isArray(state?.temporaryConditions) ? state.temporaryConditions : []).map(condition => String(condition?.id || '')).filter(Boolean))
    ]));
    const isStopComment = stopCommentId && String(comment?.id || '') === stopCommentId;
    if (isStopComment && stopSegmentIndex == null) break;
    const segments = Array.isArray(comment?.commentSegments) ? comment.commentSegments : [];
    const entries = segments.length
      ? segments.flatMap((segment, index) => {
          const resolutions = Array.isArray(segment?.combatResolutions) && segment.combatResolutions.length
            ? segment.combatResolutions
            : [segment?.combatResolution];
          return resolutions
            .filter(Boolean)
            .map(resolution => ({ index, resolution }));
        })
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
      const actorAbilities = getResolutionActorAbilityState(resolution);
      const actorInventory = getResolutionActorInventoryState(resolution);
      const actorHitPoints = getResolutionActorHitPointState(resolution);
      const actorConditions = getResolutionActorConditionState(resolution);
      const actorEquippedWeaponId = getResolutionActorEquippedWeaponState(resolution);
      if (actorResources || actorAbilities || actorInventory || actorHitPoints || actorConditions || actorEquippedWeaponId) {
        const previous = states.get(String(resolution.actorId)) || {};
        states.set(String(resolution.actorId), {
          ...previous,
          ...(actorResources ? { resources: actorResources } : {}),
          ...(actorAbilities ? { abilities: actorAbilities } : {}),
          ...(actorInventory ? { inventory: actorInventory } : {}),
          ...(actorHitPoints || {}),
          ...(actorConditions ? { temporaryConditions: actorConditions } : {}),
          ...(actorEquippedWeaponId ? { equippedWeaponId: actorEquippedWeaponId } : {})
        });
      }
      const targetResources = getResolutionTargetResourceState(resolution);
      if (targetResources) {
        const targetId = String(resolution.targetId || '');
        const previous = states.get(targetId) || {};
        states.set(targetId, { ...previous, resources: targetResources });
      }
      const targetConditions = getResolutionTargetConditionState(resolution);
      if (targetConditions) {
        const targetId = String(resolution.targetId || '');
        const previous = states.get(targetId) || {};
        states.set(targetId, { ...previous, temporaryConditions: targetConditions });
      }
      const actorChanneling = getResolutionActorChannelingState(resolution);
      const actorConcentration = getResolutionActorConcentrationState(resolution);
      if (actorChanneling !== undefined || actorConcentration !== undefined) {
        const actorId = String(resolution.actorId || '');
        const previous = states.get(actorId) || {};
        states.set(actorId, {
          ...previous,
          ...(actorChanneling !== undefined ? { channeling: actorChanneling } : {}),
          ...(actorConcentration !== undefined ? { concentration: actorConcentration } : {})
        });
      }
      const targetConcentration = getResolutionTargetConcentrationState(resolution);
      if (targetConcentration !== undefined) {
        const targetId = String(resolution.targetId || '');
        const previous = states.get(targetId) || {};
        states.set(targetId, { ...previous, concentration: targetConcentration });
      }
      const targetChanneling = getResolutionTargetChannelingState(resolution);
      if (targetChanneling !== undefined) {
        const targetId = String(resolution.targetId || '');
        const previous = states.get(targetId) || {};
        states.set(targetId, { ...previous, channeling: targetChanneling });
      }
      (Array.isArray(resolution.ruleResourceSnapshots) ? resolution.ruleResourceSnapshots : []).forEach(snapshot => {
        if (!snapshot?.sourceActorId || !Array.isArray(snapshot.after)) return;
        const sourceId = String(snapshot.sourceActorId);
        const previous = states.get(sourceId) || {};
        states.set(sourceId, { ...previous, resources: normalizeCombatResources(snapshot.after) });
      });
      (Array.isArray(resolution.ruleAbilitySnapshots) ? resolution.ruleAbilitySnapshots : []).forEach(snapshot => {
        if (!snapshot?.sourceActorId || !Array.isArray(snapshot.after)) return;
        const sourceId = String(snapshot.sourceActorId);
        const previous = states.get(sourceId) || {};
        states.set(sourceId, { ...previous, abilities: snapshot.after.map(ability => ({ ...ability })) });
      });
    }
    // All contribution kinds advance clocks. Conditions remain active for the
    // complete contribution and expire only after its final segment.
    advanceTemporaryConditionsForComment(states, comment, { conditionIdsByActor: conditionIdsBeforeComment });
    applySceneRestCommentToStateMap(states, comment);
    applyCombatEncounterCommentToStateMap(states, comment);
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
        return stored ? {
          ...resource,
          current: stored.current,
          maximum: stored.maximum,
          ...(stored.recoveryDayKey ? { recoveryDayKey: String(stored.recoveryDayKey) } : {})
        } : resource;
      })
    : profile.resources;
  const storedAbilities = Array.isArray(state.abilities) ? state.abilities : null;
  const abilities = storedAbilities
      ? (Array.isArray(profile.abilities) ? profile.abilities : []).map(ability => {
        const stored = storedAbilities.find(item => String(item?.id || '') === String(ability?.id || ''));
        return stored ? {
          ...ability,
          usesCurrent: Number(stored.usesCurrent) || 0,
          usesMaximum: Math.max(0, Number(stored.usesMaximum) || 0),
          ...(stored.recoveryDayKey ? { recoveryDayKey: String(stored.recoveryDayKey) } : {})
        } : ability;
      })
    : profile.abilities;
  const temporaryConditions = Array.isArray(state.temporaryConditions)
    ? state.temporaryConditions.map(normalizeRuntimeCondition).filter(condition => condition.active !== false)
    : [];
  const temporaryMechanics = temporaryConditions.reduce((result, condition) => {
    const mechanics = condition?.mechanics || {};
    ['attack', 'damage', 'armorClass', 'savingThrow', 'skill', 'spellAttack', 'spellSaveDc', 'passivePerception'].forEach(key => {
      result[key] = (Number(result[key]) || 0) + (Number(mechanics[key]) || 0);
    });
    return result;
  }, {});
  const normalizedResources = normalizeCombatResources(resources || []);
  const actionEconomyIds = new Set(['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus']);
  const spellSlotIds = new Set((profile.magic?.slotResourceIds || []).map(String));
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
    coreResources: normalizedResources,
    actionEconomy: normalizedResources.filter(resource => actionEconomyIds.has(resource.id)),
    dailyResources: normalizedResources.filter(resource => resource.recovery === 'day'),
    magic: profile.aiSnapshot.magic ? {
      ...profile.aiSnapshot.magic,
      spellSlots: normalizedResources.filter(resource => spellSlotIds.has(resource.id))
    } : profile.aiSnapshot.magic,
    specialAbilities: Array.isArray(abilities) ? abilities.map(ability => ({ ...ability })) : [],
    temporaryConditions,
    concentration: state.concentration || null,
    channeling: state.channeling || null
  } : profile.aiSnapshot;
  return {
    ...profile,
    currentHitPoints: normalized.current,
    maximumHitPoints: normalized.maximum || profile.maximumHitPoints,
    temporaryHitPoints: normalized.temporary,
    resources,
    abilities,
    conditions: [...(Array.isArray(profile.conditions) ? profile.conditions : []), ...temporaryConditions],
    temporaryConditions,
    concentration: state.concentration || null,
    channeling: state.channeling || null,
    inventory: state.inventory && typeof state.inventory === 'object'
      ? JSON.parse(JSON.stringify(state.inventory))
      : profile.inventory,
    attackModifier: Number(profile.attackModifier || 0) + Number(temporaryMechanics.attack || 0),
    damageModifier: Number(profile.damageModifier || 0) + Number(temporaryMechanics.damage || 0),
    totalDefense: Number(profile.totalDefense || 0) + Number(temporaryMechanics.armorClass || 0),
    spellAttackModifier: Number(profile.spellAttackModifier || 0) + Number(temporaryMechanics.spellAttack || 0),
    spellSaveDc: Number(profile.spellSaveDc || 0) + Number(temporaryMechanics.spellSaveDc || 0),
    passivePerception: Number(profile.passivePerception || 0) + Number(temporaryMechanics.passivePerception || 0),
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
