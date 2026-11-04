import test from 'node:test';
import assert from 'node:assert/strict';
import { beginCombatContribution } from '../modules/combat/combat-contribution-start.js';
import { normalizeRuntimeCondition, advanceTemporaryConditionsForComment, expireConditionsForRest } from '../modules/combat/combat-condition-duration.js';
import { refreshRuntimeCondition, reconcileConcentrationConditions } from '../modules/combat/combat-condition-lifecycle.js';
import { getActionLockPrevention } from '../modules/combat/combat-action-lock-recovery.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';

const condition = (id, durationModel) => normalizeRuntimeCondition({ id, name: id, active: true, mechanics: { skill: 1 }, durationModel });
const snapshot = conditions => ({ actorId: 'owner', actorConditionSnapshot: { after: conditions } });

test('a rest event never spends a contribution or expires an owner-start stance', () => {
  const states = new Map([['owner', { resources: [{ id: 'action', current: 0, maximum: 1, scope: 'comment' }], temporaryConditions: [
    condition('own', { kind: 'actor-comments', amount: 2 }), condition('scene', { kind: 'scene-comments', amount: 2 }),
    condition('start', { kind: 'actor-comments', amount: 1, expiresAt: 'actor-start' })
  ] }]]);
  const before = structuredClone(states);
  const rest = { characterId: 'owner', sceneRest: { type: 'short' } };
  beginCombatContribution(states, rest);
  advanceTemporaryConditionsForComment(states, rest);
  assert.deepEqual(states, before);
  const after = expireConditionsForRest([...states.get('owner').temporaryConditions,
    condition('short', { kind: 'short-rest' }), condition('long', { kind: 'long-rest' }), condition('permanent', { kind: 'permanent' })], 'short');
  assert.deepEqual(after.map(entry => entry.id), ['own', 'scene', 'start', 'long', 'permanent']);
});

test('multiple segments and targets count once while a newly applied condition keeps its full duration', () => {
  const old = condition('old', { kind: 'actor-comments', amount: 2 });
  const incoming = condition('incoming', { kind: 'actor-comments', amount: 2 });
  const history = [{ id: 'initial', commentSegments: [{ characterId: 'owner', combatResolution: snapshot([old]) }] }, { id: 'mixed', commentSegments: [
    { characterId: 'owner', combatResolution: snapshot([old, incoming]) },
    { characterId: 'owner', combatResolutions: [{ actorId: 'owner', targetId: 'x' }, { actorId: 'owner', targetId: 'y' }] },
    { characterId: 'owner', skillResolution: { actorId: 'owner' } }
  ] }];
  const after = deriveCombatStateFromComments(history).get('owner').temporaryConditions;
  assert.equal(after.find(entry => entry.id === 'old').durationModel.remainingActorComments, 1);
  assert.equal(after.find(entry => entry.id === 'incoming').durationModel.remainingActorComments, 2);
});

test('a refreshed condition has the recasting caster ownership; independent casters remain separate', () => {
  const initial = [{ ...condition('cast-one', { kind: 'actor-comments', amount: 1 }), sourceConditionId: 'spell', sourceActorId: 'caster-one' }];
  const secondCaster = refreshRuntimeCondition(initial, { ...initial[0], id: 'cast-two', sourceActorId: 'caster-two' });
  assert.deepEqual(secondCaster.map(entry => entry.id), ['cast-one', 'cast-two']);
  const refreshed = refreshRuntimeCondition(secondCaster, { ...initial[0], id: 'cast-one-new', durationModel: { kind: 'actor-comments', amount: 3 } });
  assert.deepEqual(refreshed.map(entry => entry.id), ['cast-two', 'cast-one-new']);
  assert.equal(initial[0].id, 'cast-one');
});

test('a main-action lock cannot be extended and yields one complete own contribution of protection', () => {
  const lock = { ...condition('lock', { kind: 'actor-comments', amount: 1 }), blockedResource: 'action' };
  const states = new Map([['owner', { temporaryConditions: refreshRuntimeCondition([], lock) }]]);
  assert.match(getActionLockPrevention(states.get('owner').temporaryConditions, { ...lock, id: 'new' }), /nicht verlängert/);
  advanceTemporaryConditionsForComment(states, { characterId: 'observer' });
  assert.equal(states.get('owner').temporaryConditions[0].id, 'lock');
  advanceTemporaryConditionsForComment(states, { characterId: 'owner' });
  assert.equal(states.get('owner').temporaryConditions[0].actionLockRecovery, true);
  assert.match(getActionLockPrevention(states.get('owner').temporaryConditions, lock), /Handlungssicherheit/);
  advanceTemporaryConditionsForComment(states, { characterId: 'observer' });
  assert.equal(states.get('owner').temporaryConditions.length, 1);
  advanceTemporaryConditionsForComment(states, { characterId: 'owner' });
  assert.equal(states.get('owner').temporaryConditions.length, 0);
});

test('concentration replacement and removal prune only the matching owner and instance', () => {
  const sustained = (id, owner, instance) => ({ ...condition(id, { kind: 'concentration' }), concentrationOwnerId: owner, concentrationInstanceId: instance });
  const states = new Map([
    ['first', { concentration: { instanceId: 'new', tracksConditions: true } }],
    ['second', { concentration: { instanceId: 'second', tracksConditions: true } }],
    ['target', { temporaryConditions: [sustained('old', 'first', 'old'), sustained('new', 'first', 'new'), sustained('other', 'second', 'second')] }]
  ]);
  reconcileConcentrationConditions(states, { pruneEmpty: true });
  assert.deepEqual(states.get('target').temporaryConditions.map(entry => entry.id), ['new', 'other']);
  states.get('first').concentration = null;
  reconcileConcentrationConditions(states, { pruneEmpty: true });
  assert.deepEqual(states.get('target').temporaryConditions.map(entry => entry.id), ['other']);
  assert.equal(states.get('second').concentration.instanceId, 'second');
});
