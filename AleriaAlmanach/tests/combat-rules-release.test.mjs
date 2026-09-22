import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveCombatEncounterState } from '../modules/combat/combat-encounter-model.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
const start = { id: 'start', combatEncounter: { operation: 'start', encounterId: 'duel', participants: [{ actorId: 'gawain' }, { actorId: 'gildas' }] } };
const attack = { id: 'old-attack', combatResolution: { actorId: 'gildas', targetId: 'gawain',
  targetSnapshot: { hitPointsBefore: 49, hitPointsAfter: 42, maximumHitPoints: 49, temporaryHitPointsAfter: 0 },
  actorResourceSnapshot: { after: [{ id: 'action', name: 'Aktion', current: 0, maximum: 1, scope: 'comment' }] } } };
const release = { id: 'release', commentKind: 'combat-rules-release', serverValidatedMechanics: true,
  combatRulesRelease: { version: 1, encounterId: 'duel', equipmentSnapshots: [{ actorId: 'gawain', inventory: { items: [{ id: 'sword', quantity: '1', combatDefinition: { damageBonus: 1 } }] } }] } };
test('a rules release enables future critical consequences without changing any old result or turn state', () => {
  const history = [start, attack];
  const before = structuredClone(history);
  const statesBefore = deriveCombatStateFromComments(history);
  const statesAfter = deriveCombatStateFromComments([...history, release]);
  assert.equal(deriveCombatEncounterState(history).get('duel').criticalEffectsVersion, 0);
  assert.equal(deriveCombatEncounterState([...history, release]).get('duel').criticalEffectsVersion, 1);
  assert.deepEqual(history, before);
  assert.deepEqual(statesAfter.get('gildas'), statesBefore.get('gildas'), 'no replenishment of consumed actions');
  assert.deepEqual({ ...statesAfter.get('gawain'), inventory: undefined }, { ...statesBefore.get('gawain'), inventory: undefined });
  assert.equal(statesAfter.get('gawain').inventory.items[0].combatDefinition.damageBonus, 1);
  assert.deepEqual(deriveCombatStateFromComments([...history, release], { commentId: 'release' }), statesBefore);
});
test('ordinary comments cannot forge a rules release', () => {
  assert.equal(deriveCombatEncounterState([start, { ...release, serverValidatedMechanics: false }]).get('duel').criticalEffectsVersion, 0);
});
