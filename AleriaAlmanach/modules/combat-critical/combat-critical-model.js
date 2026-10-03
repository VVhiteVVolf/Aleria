import { CRITICAL_HIT_EFFECTS, CRITICAL_FAILURE_EFFECTS, CRITICAL_CONSEQUENCE_DIE, CRITICAL_CONSEQUENCE_VERSION, getCriticalWeaponAttack } from './combat-critical-catalog.js';
import { extendCriticalCondition } from './combat-critical-conditions.js';
import { grantCriticalTemporaryHitPoints } from './combat-critical-lifecycle.js';
import { createWeaponDrop } from '../scene-items/scene-items-model.js';
import { createPositionCondition } from '../combat-styles/martial-position-effects.js';
import { refreshRuntimeCondition } from '../combat/combat-condition-lifecycle.js';

export function createCriticalConsequence(resolution, { encounter, roll, id, actor, target, usedConsequenceKeys } = {}) {
  const criticalAttack = getCriticalWeaponAttack(resolution);
  if (encounter?.criticalEffectsVersion !== 1 || !criticalAttack) return null;
  if (!Number.isInteger(roll) || roll < 1 || roll > CRITICAL_CONSEQUENCE_DIE) throw new Error('Kritischer Nebeneffekt benötigt einen W20-Wert von 1 bis 20.');
  const failure = criticalAttack.criticalFailure === true;
  const key = failure ? `failure:${resolution.actorId}` : `hit:${resolution.actorId}:${resolution.targetId}`;
  if (usedConsequenceKeys?.has(key)) {
    resolution.mechanicNotes = [...(resolution.mechanicNotes || []), failure
      ? 'Weiterer kritischer Fehlschlag ohne zusätzlichen Nebeneffekt: Das Limit dieses Beitrags ist erreicht.'
      : 'Weiterer kritischer Treffer: Kritschaden bleibt gültig; das Nebeneffekt-Limit gegen dieses Ziel ist erreicht.'];
    return null;
  }
  usedConsequenceKeys?.add(key);
  const effect = (failure ? CRITICAL_FAILURE_EFFECTS : CRITICAL_HIT_EFFECTS)[roll - 1];
  const affected = effect.recipient === 'actor' ? actor : target;
  const result = { id, roll, version: CRITICAL_CONSEQUENCE_VERSION, dieSides: CRITICAL_CONSEQUENCE_DIE, kind: failure ? 'failure' : 'hit', name: effect.name,
    description: effect.description, actorId: affected.characterId, actorName: affected.name, encounterId: encounter.encounterId };
  if (effect.disarm) {
    result.sceneItemEvent = affected.weaponUnavailable ? null : createWeaponDrop(affected, { id, encounterId: encounter.encounterId, reason: result.kind });
    if (result.sceneItemEvent) return result;
    result.name = 'Gleichgewicht verloren';
    result.description = `${affected.weaponUnavailable ? 'Die Waffe liegt bereits außerhalb des Griffs.' : 'Körperwaffen bleiben erhalten.'} Im nächsten eigenen Beitrag: −1 auf Waffenangriffe und Kampftechniken.`;
  }
  const attack = effect.disarm ? -1 : effect.attack || 0;
  result.condition = {
    id: `critical:${id}`, sourceConditionId: `critical:${id}`, name: result.name, description: result.description,
    sourceActorId: resolution.actorId, active: true, criticalConsequence: true,
    blockedResource: effect.blockedResource || '',
    durationModel: { kind: 'actor-comments', remainingActorComments: 1, encounterId: encounter.encounterId },
    mechanics: { armorClass: effect.armorClass || 0, movement: effect.movement || 0 },
    triggerRules: [{ id: `critical-rule:${id}`, name: result.name, phase: effect.damage ? 'pre-damage' : 'pre-roll',
      recipient: 'actor', sourceRelation: 'self', activation: 'passive', actionKinds: ['weapon', 'technique'],
      condition: 'always', effects: { attackModifier: attack, damageModifier: effect.damage || 0 } }]
  };
  if (effect.nextAttackPenalty) result.condition = { ...createPositionCondition(false),
    id: `critical:${id}`, sourceConditionId: 'martial-position-penalty', sourceActorId: resolution.actorId,
    name: result.name, criticalConsequence: true,
    durationModel: { kind: 'actor-comments', remainingActorComments: 1, encounterId: encounter.encounterId } };
  if (roll > 10) result.condition = extendCriticalCondition(result.condition, effect, { actor, target, affected, kind: result.kind, roll });
  if (effect.temporaryHitPoints || effect.periodicHitPointLoss) result.hitPointBase = { current: affected.currentHitPoints,
    maximum: affected.maximumHitPoints, temporary: affected.temporaryHitPoints || 0 };
  if (roll > 10) result.condition.criticalPersistence = affected.persistence || null;
  return result;
}

// New consequences start after the originating contribution. No reroll or
// partial post is needed when an early attack disarms someone in a multiattack.
export function applyCriticalConsequencesForComment(states, comment) {
  const events = [];
  for (const segment of comment.commentSegments || []) {
    for (const resolution of segment.combatResolutions || [segment.combatResolution]) {
      const consequence = resolution?.criticalConsequence;
      if (!consequence?.condition || !consequence.actorId) continue;
      const granted = grantCriticalTemporaryHitPoints(states.get(consequence.actorId) || {}, consequence);
      const state = granted.state;
      if (granted.event) events.push(granted.event);
      const conditions = state.temporaryConditions || [];
      // Same named consequences refresh, rather than accumulating penalties.
      states.set(consequence.actorId, { ...state, temporaryConditions: granted.condition.stanceGroup
        ? refreshRuntimeCondition(conditions, granted.condition) : conditions
        .filter(condition => !condition.criticalConsequence || condition.name !== consequence.condition.name)
        .concat(granted.condition) });
    }
  }
  if (comment.combatEncounter?.operation === 'end') states.forEach((state, actorId) => {
    states.set(actorId, { ...state, temporaryConditions: (state.temporaryConditions || []).filter(condition =>
      !condition.criticalConsequence || condition.durationModel?.encounterId !== comment.combatEncounter.encounterId) });
  });
  return events;
}

export function capCriticalResources(resources, conditions = []) {
  const blocked = new Set(conditions.filter(condition => condition.active !== false).map(condition => condition.blockedResource).filter(Boolean));
  return (resources || []).map(resource => blocked.has(resource.id) ? { ...resource, current: 0 } : resource);
}
