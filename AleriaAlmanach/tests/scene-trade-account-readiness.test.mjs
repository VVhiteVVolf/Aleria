import test from 'node:test';
import assert from 'node:assert/strict';
import { createSceneTradeAccountReadiness } from '../modules/scene-trade/scene-trade-account-readiness.js';
import { renderSceneTradeCatalogResults } from '../modules/scene-trade/scene-trade-view.js';

test('historical definitions for people and group accounts load once before inventory actions become selectable', async () => {
  let finish, calls = 0, received;
  const guard = createSceneTradeAccountReadiness(records => { calls++; received = records; return new Promise(resolve => { finish = resolve; }); });
  const records = [{ key: 'character:g', record: { id: 'g' } }, { key: 'group:friends', record: { id: 'friends' } }];
  const pending = guard.ensure(records); const second = guard.ensure(records);
  assert.throws(() => guard.assert(records), /vorbereitet/);
  assert.deepEqual(guard.decorate(records).map(record => record.definitionsReady), [false, false]);
  await Promise.resolve(); assert.equal(calls, 1); assert.equal(received[1].id, 'friends'); finish();
  await Promise.all([pending, second]); guard.assert(records);
  assert.equal(calls, 1); assert.equal(guard.ready(records[1]), true);
});

test('a refreshed inventory object requires new hydration and an older response cannot unlock it', async () => {
  const finish = [];
  const guard = createSceneTradeAccountReadiness(() => new Promise(resolve => finish.push(resolve)));
  const first = { key: 'character:g', record: { inventory: { revision: 1 } } };
  const next = { key: 'character:g', record: { inventory: { revision: 2 } } };
  const oldPending = guard.ensure([first]); await Promise.resolve();
  const nextPending = guard.ensure([next]); await Promise.resolve();
  finish[0](); await oldPending; assert.equal(guard.ready(next), false);
  finish[1](); await nextPending; assert.equal(guard.ready(next), true);
});

test('failed hydration stays blocked and an explicit retry can recover without changing an inventory', async () => {
  let calls = 0;
  const guard = createSceneTradeAccountReadiness(async () => { if (++calls === 1) throw Error('offline'); });
  const account = { key: 'character:g', record: { id: 'g', inventory: { revision: 3, items: [] } } };
  const before = JSON.stringify(account);
  await assert.rejects(guard.ensure([account]), /offline/); assert.equal(guard.ready(account), false);
  await guard.ensure([account]); guard.assert([account]); assert.equal(calls, 2);
  assert.equal(JSON.stringify(account), before);
});

test('a pending historical inventory never renders actionable sale rows', () => {
  const markup = renderSceneTradeCatalogResults({ state: { mode: 'sell', sellerKey: 'character:g', search: '' }, data: {},
    accounts: [{ key: 'character:g', definitionsReady: false, record: { inventory: { items: [{ id: 'old', name: 'Unique horse' }] } } }] });
  assert.match(markup, /Inventar wird vorbereitet/); assert.doesNotMatch(markup, /add-sell|Unique horse/);
});
