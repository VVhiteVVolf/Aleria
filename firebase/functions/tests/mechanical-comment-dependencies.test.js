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

test('die Reihenfolge folgt dem bei Wiederholung aktualisierten Transaktionsstand', () => {
  const first = nextMechanicalCommentOrderKey([{ orderKey: 100 }], 99, 110);
  const retried = nextMechanicalCommentOrderKey([{ orderKey: 100 }, { orderKey: first }], 99, 110);
  assert.ok(retried > first);
});
