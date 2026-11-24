import { getConditionClockContributors, normalizeRuntimeCondition } from './combat-condition-duration.js';
import { applyCombatDamage, normalizeCombatHitPointState } from './combat-state-model.js';
import { resolveDamageResponse } from './combat-effect-model.js';
import { getRegenerationTrait } from './combat-creature-traits.js';
import { getPeriodicConditionDamage } from '../combat-status/combat-condition-rules.js';

function conditionContributors(comment, clock) {
  if (comment.combatEncounter || comment.combatStatus || comment.combatRulesRelease || comment.sceneRest || comment.sceneRegeneration
    || comment.sceneTimeEvent || comment.sceneTransition || comment.sceneElementSignal || comment.importedHistoricalMechanics) return new Set();
  const segments = comment.commentSegments;
  const speaksForActor = segment => !segment.narrator && segment.avatarKind !== 'narrator'
    && (segment.commentKind || segment.kind) !== 'foreignvoice';
  if (!segments?.length) return speaksForActor(comment) ? getConditionClockContributors(comment, clock) : new Set();
  const participating = segments.filter(speaksForActor);
  return participating.length ? getConditionClockContributors({ ...comment, commentSegments: participating }, clock) : new Set();
}

export function getPeriodicConditionContributors(states, comment, clock) {
  const contributors = new Map();
  for (const id of conditionContributors(comment, clock)) {
    const conditions = (states.get(id)?.temporaryConditions || []).map(normalizeRuntimeCondition).filter(condition => condition.active);
    const periodic = conditions.flatMap(condition => {
      const damage = getPeriodicConditionDamage(condition);
      return damage ? [{ condition, damage }] : [];
    });
    if (!periodic.length) continue;
    // A specific source, such as the bite of a Versunkener, can already
    // account for this wound family through the older fixed-loss clock.
    const hasSpecificBleeding = conditions.some(condition => condition.presetId === 'bleeding' && condition.criticalPeriodicLoss > 0);
    const strongest = new Map();
    for (const entry of periodic) {
      const group = entry.damage.group || entry.condition.id;
      if (group === 'bleeding' && hasSpecificBleeding) continue;
      if (!strongest.has(group) || strongest.get(group).damage.amount < entry.damage.amount) strongest.set(group, entry);
    }
    if (strongest.size) contributors.set(id, [...strongest.values()]);
  }
  return contributors;
}

// This step is deterministic for preview and commit. Replay uses only the
// recorded receipts and therefore never applies a new rule to an old post.
export function applyPeriodicConditionDamage(states, comment, profileFor = () => null, clock) {
  const events = [];
  for (const [actorId, active] of getPeriodicConditionContributors(states, comment, clock)) {
    const state = states.get(actorId);
    const profile = profileFor(actorId) || {};
    let remaining = normalizeCombatHitPointState(state, profile);
    for (const { condition, damage } of active) {
      if (!remaining.current) break;
      // Landtroll fire belongs to its own end-of-contribution regeneration rule.
      if (damage.group === 'burning' && getRegenerationTrait(profile)?.regeneration.burningDamage) continue;
      const before = remaining;
      if (!damage.damageType) {
        remaining = { ...before, current: Math.max(0, before.current - damage.amount) };
      } else {
        const response = resolveDamageResponse(profile, { damageType: damage.damageType, conditions: (state.temporaryConditions || []).map(normalizeRuntimeCondition) });
        remaining = applyCombatDamage(before, Math.floor(damage.amount * response.multiplier)).after;
      }
      const loss = before.current - remaining.current;
      const absorbedByTemporary = before.temporary - remaining.temporary;
      if (loss || absorbedByTemporary) events.push({ actorId, phase: 'start', conditionDamage: true, conditionId: condition.id,
        names: [condition.name], before, after: remaining, loss, absorbedByTemporary, damageType: damage.damageType });
    }
    if (events.at(-1)?.actorId === actorId) applyDamageSnapshot(states, actorId, remaining);
  }
  return events;
}

function applyDamageSnapshot(states, actorId, hitPoints) {
  states.set(actorId, { ...states.get(actorId), ...hitPoints,
    ...(hitPoints.current <= 0 ? { concentration: null, channeling: null } : {}) });
}

export function replayPeriodicConditionDamage(states, comment) {
  if (comment.serverValidatedMechanics !== true || comment.importedHistoricalMechanics) return;
  for (const event of comment.criticalLifecycle || []) {
    if (event.conditionDamage === true && event.phase === 'start' && event.actorId && event.after) {
      applyDamageSnapshot(states, String(event.actorId), normalizeCombatHitPointState(event.after));
    }
  }
}
