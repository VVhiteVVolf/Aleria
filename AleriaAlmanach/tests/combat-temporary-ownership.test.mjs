import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveCombatStateFromComments, applyCombatResolutionState } from '../modules/combat/combat-state-model.js';
import { applyCriticalConsequencesForComment } from '../modules/combat-critical/combat-critical-model.js';
import { expireCriticalTemporaryHitPoints, criticalConditionIds } from '../modules/combat-critical/combat-critical-lifecycle.js';
import { advanceTemporaryConditionsForComment } from '../modules/combat/combat-condition-duration.js';
import { applyCombatEncounterAuraApplicationsToStateMap } from '../modules/combat/combat-encounter-aura.js';
import { applyCombatEncounterStartApplicationsToStateMap } from '../modules/combat/combat-encounter-start-effects.js';
import { applyInventoryUseAbilityEffects } from '../modules/inventory-use/inventory-use-model.js';
import { normalizeItemDefinition, itemDefinitionKey } from '../modules/item-definitions/item-definition-model.js';

const marker = (id = 'critical-one', amount = 2) => ({ id, sourceConditionId: 'critical-v2:hit:19', stanceGroup: 'critical-v2:hit:19',
  name: 'Kritische Entschlossenheit', active: true, criticalConsequence: true, criticalTemporaryHitPoints: amount, criticalTemporaryOwned: true,
  durationModel: { kind: 'actor-comments', remainingActorComments: 1, encounterId: 'battle' }, mechanics: {} });
const initial = () => ({ current: 12, maximum: 20, temporary: 2, temporaryConditions: [marker()] });
const seedComment = () => ({ id: 'seed', combatResolution: { actorId: 'opponent', targetId: 'actor',
  targetSnapshot: { hitPointsAfter: 12, maximumHitPoints: 20, temporaryHitPointsAfter: 2 }, targetConditionSnapshot: { after: [marker()] } } });
const aura = { id: 'aura', encounterId: 'battle', sourceActorId: 'source', sourceActorName: 'Quelle', targetActorId: 'actor',
  relation: 'ally', auraName: 'Prüfaura', mechanics: {}, temporaryHitPoints: 8, grantTemporaryHitPoints: true };

test('a stronger item pool survives expiration of a previous critical pool in the same contribution', () => {
  const comments = [seedComment(), { id: 'item', commentSegments: [{ characterId: 'actor', inventoryUse: {
    actorId: 'actor', hitPointSnapshot: { before: initial(), after: { current: 12, maximum: 20, temporary: 8 } },
    conditionSnapshot: { before: [marker()], after: [marker()] }
  } }] }];
  const preserved = structuredClone(comments);
  const state = deriveCombatStateFromComments(comments).get('actor');
  assert.equal(state.temporary, 8);
  assert.equal(state.current, 12);
  assert.equal(state.temporaryConditions.length, 0);
  assert.deepEqual(comments, preserved, 'Stored receipts remain immutable.');
});

test('the shared item resolver records released critical ownership before the server finishes the contribution', () => {
  const definition = normalizeItemDefinition({ id: 'item:temporary-protection', title: 'Prüfschutz', category: 'potions',
    useDefinition: { mode: 'consume', effects: [{ type: 'temporary-hit-points', amount: 8 }] } });
  const definitions = new Map([[itemDefinitionKey(definition), definition]]);
  const item = { id: 'owned-protection', name: 'Prüfschutz', quantity: '1', definitionRef: { id: definition.id, revision: definition.revision } };
  const source = { currentHitPoints: 12, maximumHitPoints: 20, temporaryHitPoints: 2, temporaryConditions: [marker()] };
  const before = structuredClone(source);
  const result = applyInventoryUseAbilityEffects(source, { actorId: 'actor', item, mode: 'consume', quantity: 1 }, '', { definitions });
  assert.equal(result.hitPoints.temporary, 8);
  assert.equal(result.conditions[0].criticalTemporaryOwned, false);
  assert.equal(result.inventoryUse.conditionSnapshot.before[0].criticalTemporaryOwned, true);
  assert.equal(result.inventoryUse.conditionSnapshot.after[0].criticalTemporaryOwned, false);
  const serverState = new Map([['actor', { ...initial(), ...result.hitPoints, temporaryConditions: result.conditions }]]);
  expireCriticalTemporaryHitPoints(serverState, { characterId: 'actor' });
  assert.equal(serverState.get('actor').temporary, 8);
  assert.deepEqual(source, before);
});

test('target and actor authoritative HP receipts release only their previous critical owner', () => {
  for (const role of ['actor', 'target']) {
    const states = new Map([['actor', initial()]]);
    const receipt = role === 'actor' ? { actorId: 'actor', actorHitPointSnapshot: { after: { current: 12, maximum: 20, temporary: 8 } },
      actorConditionSnapshot: { after: [marker()] } } : { actorId: 'opponent', targetId: 'actor',
      targetSnapshot: { hitPointsAfter: 12, maximumHitPoints: 20, temporaryHitPointsAfter: 8 }, targetConditionSnapshot: { after: [marker()] } };
    applyCombatResolutionState(states, receipt);
    expireCriticalTemporaryHitPoints(states, { characterId: 'actor' });
    assert.equal(states.get('actor').temporary, 8, role);
  }
});

test('refreshing the same critical pool retains ownership and still expires after its next own contribution', () => {
  const states = new Map([['actor', initial()]]);
  const condition = marker('critical-refreshed');
  delete condition.criticalTemporaryOwned;
  applyCriticalConsequencesForComment(states, { combatResolution: { actorId: 'actor', targetId: 'opponent',
    criticalConsequence: { actorId: 'actor', name: condition.name, condition, hitPointBase: { current: 12, maximum: 20, temporary: 2 } } } });
  const current = states.get('actor');
  assert.equal(current.temporaryConditions.length, 1);
  assert.equal(current.temporaryConditions[0].criticalTemporaryOwned, true);
  expireCriticalTemporaryHitPoints(states, { characterId: 'actor' });
  assert.equal(states.get('actor').temporary, 0);
});

test('a stronger different critical pool replaces the old owner without losing its own lifetime', () => {
  const states = new Map([['actor', initial()]]);
  const condition = { ...marker('critical-stronger', 6), stanceGroup: 'critical-other', sourceConditionId: 'critical-other',
    durationModel: { kind: 'actor-comments', remainingActorComments: 2 } };
  delete condition.criticalTemporaryOwned;
  applyCriticalConsequencesForComment(states, { combatResolution: { actorId: 'actor', targetId: 'opponent',
    criticalConsequence: { actorId: 'actor', name: condition.name, condition, hitPointBase: { current: 12, maximum: 20, temporary: 2 } } } });
  expireCriticalTemporaryHitPoints(states, { characterId: 'actor' });
  assert.equal(states.get('actor').temporary, 6);
  assert.equal(states.get('actor').temporaryConditions.find(entry => entry.id === condition.id).criticalTemporaryOwned, true);
});

test('encounter start and aura replacement cannot be erased by a previous critical owner', () => {
  for (const apply of [states => applyCombatEncounterStartApplicationsToStateMap(states, { operation: 'start', encounterId: 'battle',
    participants: [{ actorId: 'actor', status: 'active' }], startApplications: [{ schemaVersion: 1, actorId: 'actor', temporaryHitPoints: 8 }] }),
  states => applyCombatEncounterAuraApplicationsToStateMap(states, { operation: 'add', encounterId: 'battle', auraApplications: [aura] })]) {
    const states = new Map([['actor', initial()]]);
    apply(states);
    expireCriticalTemporaryHitPoints(states, { characterId: 'actor' });
    assert.equal(states.get('actor').temporary, 8);
  }
});

test('an aura cannot restore an expired critical baseline when its source leaves later', () => {
  const states = new Map([['actor', initial()]]);
  applyCombatEncounterAuraApplicationsToStateMap(states, { operation: 'add', encounterId: 'battle', auraApplications: [aura] });
  assert.deepEqual(states.get('actor').encounterAuraTemporaryHitPoints.baselineCriticalConditionIds, ['critical-one']);
  expireCriticalTemporaryHitPoints(states, { characterId: 'actor' }, criticalConditionIds(states));
  advanceTemporaryConditionsForComment(states, { characterId: 'actor' });
  assert.equal(states.get('actor').temporary, 8);
  assert.equal(states.get('actor').encounterAuraTemporaryHitPoints.baseline, 0);
  applyCombatEncounterAuraApplicationsToStateMap(states, { operation: 'remove', encounterId: 'battle', auraApplications: [] });
  assert.equal(states.get('actor').temporary, 0);
});

test('removing a critical baseline explicitly also prevents later resurrection through an aura', () => {
  const states = new Map([['actor', initial()]]);
  applyCombatEncounterAuraApplicationsToStateMap(states, { operation: 'add', encounterId: 'battle', auraApplications: [aura] });
  applyCombatResolutionState(states, { actorId: 'actor', actorConditionSnapshot: { after: [] } });
  assert.equal(states.get('actor').temporary, 8);
  applyCombatEncounterAuraApplicationsToStateMap(states, { operation: 'remove', encounterId: 'battle', auraApplications: [] });
  assert.equal(states.get('actor').temporary, 0);
});

test('refreshing a critical baseline behind a stronger aura transfers the same finite lifetime', () => {
  const states = new Map([['actor', initial()]]);
  applyCombatEncounterAuraApplicationsToStateMap(states, { operation: 'add', encounterId: 'battle', auraApplications: [aura] });
  const condition = marker('critical-refreshed');
  delete condition.criticalTemporaryOwned;
  applyCriticalConsequencesForComment(states, { combatResolution: { actorId: 'actor', targetId: 'opponent',
    criticalConsequence: { actorId: 'actor', name: condition.name, condition, hitPointBase: { current: 12, maximum: 20, temporary: 8 } } } });
  assert.deepEqual(states.get('actor').encounterAuraTemporaryHitPoints.baselineCriticalConditionIds, ['critical-refreshed']);
  expireCriticalTemporaryHitPoints(states, { characterId: 'actor' });
  advanceTemporaryConditionsForComment(states, { characterId: 'actor' });
  assert.equal(states.get('actor').temporary, 8);
  applyCombatEncounterAuraApplicationsToStateMap(states, { operation: 'remove', encounterId: 'battle', auraApplications: [] });
  assert.equal(states.get('actor').temporary, 0);
});
