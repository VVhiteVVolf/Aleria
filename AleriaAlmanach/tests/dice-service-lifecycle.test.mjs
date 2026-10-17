import assert from 'node:assert/strict';
import test from 'node:test';
import { SceneDiceService } from '../modules/scene-dice/dice-service.js';

function harness(factory) {
  const calls = [];
  const engine = { mount(container) { calls.push(['mount', container.id]); }, clear() { calls.push(['clear']); }, isFallback: false };
  let created = 0;
  const service = new SceneDiceService({ engineFactory: (...args) => { created++; return factory ? factory(engine, ...args) : Promise.resolve(engine); } });
  service.settings.animationEnabled = true;
  return { service, engine, calls, count: () => created };
}

test('switching between scene, combat and skill boards keeps one engine and one physics/render pair', async () => {
  const h = harness();
  for (let i = 0; i < 100; i++) assert.equal(await h.service.prepare({ id: `board-${i % 3}` }), h.engine);
  assert.equal(h.count(), 1);
  assert.equal(h.calls.filter(([operation]) => operation === 'mount').length, 99);
});

test('concurrent initialization follows the latest board without constructing another engine', async () => {
  let complete;
  const h = harness(engine => new Promise(resolve => { complete = () => resolve(engine); }));
  const first = h.service.prepare({ id: 'a' });
  const second = h.service.prepare({ id: 'b' });
  await Promise.resolve(); complete();
  assert.equal(await first, await second);
  assert.equal(h.count(), 1);
  assert.deepEqual(h.calls, [['mount', 'b']]);
});

test('a detached canvas is remounted on the same board without recreating physics workers', async () => {
  const h = harness(), board = { id: 'skill-dice-stage' };
  await h.service.prepare(board);
  let mounted = false;
  h.engine.isMounted = () => mounted;
  h.engine.mount = container => { mounted = true; h.calls.push(['mount', container.id]); };
  await h.service.prepare(board);
  await h.service.prepare(board);
  assert.equal(h.count(), 1);
  assert.deepEqual(h.calls, [['clear'], ['mount', 'skill-dice-stage']]);
});

test('an active roll cannot be cleared or moved by another dialog; completion releases the busy guard', async () => {
  const h = harness(); let finish;
  h.service.parser = { execute: () => new Promise(resolve => { finish = () => resolve({ dice: [15], keptDice: [15], total: 15, notation: '1d20', natural: 15 }); }) };
  h.service.audio = { startRoll() {}, finishRoll() {}, cancelRoll() {}, getState() { return {}; } };
  h.service.history = { add: () => ({ id: 'roll' }) };
  const rolling = h.service.roll('1d20', { id: 'a' });
  while (!finish) await Promise.resolve();
  await assert.rejects(h.service.prepare({ id: 'b' }), /Wurf läuft bereits/);
  assert.equal(h.service.clear(), false);
  finish(); assert.equal((await rolling).total, 15);
  assert.equal(h.service.getEngineState().busy, false);
});

test('failed initialization selects the existing safe text engine once; disabled animation creates no 3D engine', async () => {
  const h = harness(() => Promise.reject(Error('test initialization error')));
  const warn = console.warn; console.warn = () => {};
  try {
    assert.equal((await h.service.prepare({ id: 'a' })).isFallback, true);
    assert.equal((await h.service.prepare({ id: 'b' })).isFallback, true);
    assert.equal(h.count(), 1);
  } finally { console.warn = warn; }
  const disabled = harness(); disabled.service.settings.animationEnabled = false;
  assert.equal((await disabled.service.prepare({ id: 'a' })).isFallback, true);
  assert.equal(disabled.count(), 0);
});
