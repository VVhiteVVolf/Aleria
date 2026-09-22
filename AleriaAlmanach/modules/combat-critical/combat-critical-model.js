import { CRITICAL_HIT_EFFECTS, CRITICAL_FAILURE_EFFECTS, getCriticalWeaponAttack } from './combat-critical-catalog.js';
import { createWeaponDrop } from '../scene-items/scene-items-model.js';

export function createCriticalConsequence(resolution, { encounter, roll, id, actor, target } = {}) {
  const criticalAttack = getCriticalWeaponAttack(resolution);
  if (encounter?.criticalEffectsVersion !== 1 || !criticalAttack) return null;
  if (!Number.isInteger(roll) || roll < 1 || roll > 10) throw new Error('Kritischer Nebeneffekt benötigt einen W10-Wert von 1 bis 10.');
  const failure = criticalAttack.criticalFailure === true;
  const effect = (failure ? CRITICAL_FAILURE_EFFECTS : CRITICAL_HIT_EFFECTS)[roll - 1];
  const affected = effect.recipient === 'actor' ? actor : target;
  const result = { id, roll, version: 1, kind: failure ? 'failure' : 'hit', name: effect.name,
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
  return result;
}

// New consequences start after the originating contribution. No reroll or
// partial post is needed when an early attack disarms someone in a multiattack.
export function applyCriticalConsequencesForComment(states, comment) {
  for (const segment of comment.commentSegments || []) {
    for (const resolution of segment.combatResolutions || [segment.combatResolution]) {
      const consequence = resolution?.criticalConsequence;
      if (!consequence?.condition || !consequence.actorId) continue;
      const state = states.get(consequence.actorId) || {};
      const conditions = state.temporaryConditions || [];
      // Same named consequences refresh, rather than accumulating penalties.
      states.set(consequence.actorId, { ...state, temporaryConditions: conditions
        .filter(condition => !condition.criticalConsequence || condition.name !== consequence.condition.name)
        .concat(consequence.condition) });
    }
  }
  if (comment.combatEncounter?.operation === 'end') states.forEach((state, actorId) => {
    states.set(actorId, { ...state, temporaryConditions: (state.temporaryConditions || []).filter(condition =>
      !condition.criticalConsequence || condition.durationModel?.encounterId !== comment.combatEncounter.encounterId) });
  });
}

export function capCriticalResources(resources, conditions = []) {
  const blocked = new Set(conditions.filter(condition => condition.active !== false).map(condition => condition.blockedResource).filter(Boolean));
  return (resources || []).map(resource => blocked.has(resource.id) ? { ...resource, current: 0 } : resource);
}
