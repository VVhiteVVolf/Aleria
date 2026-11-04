import test from 'node:test';
import assert from 'node:assert/strict';
import { assertMechanicalActorProfileSource } from '../src/mechanics/mechanical-profile-source.js';

test('a persistent profile must belong to the same actor even if another instance/source pair exists', () => {
  for (const kind of ['character', 'creature']) {
    assert.doesNotThrow(() => assertMechanicalActorProfileSource([], { actorId: 'owner', recordId: 'owner', kind, persistent: true }));
    assert.throws(() => assertMechanicalActorProfileSource([], { actorId: 'other', recordId: 'owner', kind, persistent: true }), /stimmen nicht überein/);
  }
});

test('scene creatures require their exact known source and remain nonpersistent', () => {
  const descriptor = { actorId: 'instance', recordId: 'template', kind: 'creature', persistent: false };
  assert.throws(() => assertMechanicalActorProfileSource([], descriptor), /noch nicht bekannt/);
  const history = [{ combatEncounter: { participants: [{ actorId: 'instance', persistence: { kind: 'scene-creature', sourceCreatureId: 'template' } }] } }];
  assert.doesNotThrow(() => assertMechanicalActorProfileSource(history, descriptor));
  assert.throws(() => assertMechanicalActorProfileSource(history, { ...descriptor, recordId: 'another-template' }), /noch nicht bekannt/);
  assert.throws(() => assertMechanicalActorProfileSource(history, { ...descriptor, kind: 'character' }), /stimmen nicht überein/);
  assert.throws(() => assertMechanicalActorProfileSource(history, { ...descriptor, actorId: 'template' }), /stimmen nicht überein/);
  assert.throws(() => assertMechanicalActorProfileSource(history, { ...descriptor, persistent: true }), /stimmen nicht überein/);
});

test('trusted narrative creature instances are supported by the same source contract', () => {
  const descriptor = { actorId: 'instance', recordId: 'template', kind: 'creature', persistent: false };
  for (const entry of [{ sceneActorId: 'instance', sceneActorSourceId: 'template' }, { sceneActorId: 'instance', creatureId: 'template' }]) {
    assert.doesNotThrow(() => assertMechanicalActorProfileSource([entry], descriptor));
    assert.doesNotThrow(() => assertMechanicalActorProfileSource([{ commentSegments: [entry] }], descriptor));
  }
});
