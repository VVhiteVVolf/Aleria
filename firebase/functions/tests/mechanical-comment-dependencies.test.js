import assert from 'node:assert/strict';
import test from 'node:test';
import { findLaterMechanicalDependency, findLaterSceneRegenerationBoundary } from '../src/mechanics/mechanical-comment-dependencies.js';
import { nextMechanicalCommentOrderKey } from '../src/mechanics/mechanical-comment-order.js';

test('ein Abschluss liest den Kampfstand auch ohne erneute Profiländerung', () => {
  const history = [{ id: 'hit', combatResolution: { actorId: 'gildas', targetId: 'gawain' } },
    { id: 'end', combatEncounter: { participants: [{ actorId: 'gildas' }, { actorId: 'gawain' }] } }];
  assert.equal(findLaterMechanicalDependency(history, 'hit').id, 'end');
  assert.equal(findLaterMechanicalDependency(history, 'end'), null);
});

test('unabhängige Figuren verhindern keine Rücknahme', () => {
  assert.equal(findLaterMechanicalDependency([{ id: 'a', characterId: 'gildas' }, { id: 'b', characterId: 'observer' }], 'a'), null);
});

test('eine spätere Herausforderung koppelt ihren Wirkungsempfänger an vorherige Kampfhandlungen', () => {
  const hit = { id: 'hit', combatResolution: { actorId: 'ylva', targetId: 'gais' } };
  const challenge = { id: 'challenge', characterId: 'gawain', commentSegments: [{ skillResolution: {
    actorId: 'gawain', herausforderungCombatSnapshots: [{ actorId: 'gais', after: { current: 30 } }]
  } }] };
  assert.equal(findLaterMechanicalDependency([hit, challenge], 'hit')?.id, 'challenge');
});

test('bereits beendete Konzentration koppelt spätere unabhängige Änderungen nicht dauerhaft', () => {
  const cast = { id: 'cast', commentSegments: [{ combatResolution: { actorId: 'caster', targetId: 'ally',
    actorConcentrationSnapshot: { after: { instanceId: 'one', tracksConditions: true } },
    targetConditionSnapshot: { after: [{ id: 'buff', concentrationOwnerId: 'caster', concentrationInstanceId: 'one' }] }
  } }] };
  const end = { id: 'end', commentSegments: [{ combatResolution: { actorId: 'enemy', targetId: 'caster', targetConcentrationSnapshot: { after: null } } }] };
  assert.equal(findLaterMechanicalDependency([cast, end, { id: 'new', characterId: 'caster' }, { id: 'other', characterId: 'ally' }], 'new'), null);
  assert.equal(findLaterMechanicalDependency([cast, end, { id: 'other', characterId: 'ally' }], 'end')?.id, 'other');
});

test('die Reihenfolge folgt dem bei Wiederholung aktualisierten Transaktionsstand', () => {
  const first = nextMechanicalCommentOrderKey([{ orderKey: 100 }], 99, 110);
  const retried = nextMechanicalCommentOrderKey([{ orderKey: 100 }, { orderKey: first }], 99, 110);
  assert.ok(retried > first);
});

test('regeneration is a dependency and durable boundary only for its affected figures', () => {
  const hit = { id: 'hit', combatResolution: { actorId: 'attacker', targetId: 'wolf:1' } };
  const unrelated = { id: 'other', characterId: 'observer' };
  const reset = { id: 'reset', commentKind: 'scene-regeneration-event', serverValidatedMechanics: true,
    sceneRegeneration: { participants: [{ actorId: 'wolf:1', after: { current: 20 } }] } };
  assert.equal(findLaterMechanicalDependency([hit, unrelated, reset], 'hit')?.id, 'reset');
  assert.equal(findLaterSceneRegenerationBoundary([hit, unrelated, reset], 'hit')?.id, 'reset');
  assert.equal(findLaterSceneRegenerationBoundary([hit, unrelated, reset], 'other'), null);
  assert.equal(findLaterSceneRegenerationBoundary([hit, { ...reset, serverValidatedMechanics: false }], 'hit'), null);
});
