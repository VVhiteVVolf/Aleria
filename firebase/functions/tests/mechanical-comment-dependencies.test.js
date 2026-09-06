import assert from 'node:assert/strict';
import test from 'node:test';
import { findLaterMechanicalDependency } from '../src/mechanics/mechanical-comment-dependencies.js';
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
