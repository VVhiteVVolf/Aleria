import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceChase, createChaseState, TRACK } from '../modules/loading-screen/rose-chase/chase-state.js';

const frame = 1 / 120;

function playFor(state, seconds, input = {}) {
  const events = [];
  for (let elapsed = 0; elapsed < seconds; elapsed += frame) {
    events.push(...advanceChase(state, input, frame));
  }
  return events;
}

test('each hedge takes one bottle, with a tumble before Pyderi catches both runners', () => {
  const state = createChaseState();
  assert.equal(state.bottles, 3);
  playFor(state, TRACK.openingTime + .1);
  assert.equal(state.phase, 'running');
  let breaks = 0, pecks = 0;
  for (let duration = 0; duration < 13; duration += frame) {
    const before = state.bottles;
    const events = advanceChase(state, {}, frame);
    if (events.includes('break')) {
      breaks += 1;
      assert.equal(state.bottles, before - 1);
      assert.equal(state.phase, 'running');
      assert.equal(state.tumble, TRACK.tumbleTime);
    }
    if (events.includes('peck')) pecks += 1;
  }
  assert.equal(breaks, 3);
  assert.equal(pecks, 1);
  assert.equal(state.hedges.filter(hedge => hedge.hit).length, 3);
  assert.equal(state.bottles, 0);
  assert.equal(state.phase, 'caught');
  assert.deepEqual(createChaseState().hedges.map(hedge => hedge.hit), state.hedges.map(() => false));
});

test('one second of moving back is safe but retreating for longer lets Pyderi catch up', () => {
  const state = createChaseState();
  playFor(state, TRACK.openingTime + .04);
  const start = state.x;
  playFor(state, 1, { back: true });
  assert.equal(state.phase, 'running');
  for (let attempt = 0; attempt < 310 && state.phase === 'running'; attempt += 1) {
    advanceChase(state, { back: true }, frame);
  }
  assert(state.x < start);
  assert.equal(state.phase, 'pecking');
  assert.equal(state.bottles, 3);
  playFor(state, TRACK.peckTime + .04);
  assert.equal(state.phase, 'caught');
});

test('one well-timed jump clears a hedge for both runners and all hedges can be cleared', () => {
  const state = createChaseState();
  playFor(state, TRACK.openingTime);
  for (const hedge of state.hedges) {
    const threshold = hedge.position - state.x - 95;
    while (state.phase === 'running' && state.distance < threshold) advanceChase(state, {}, frame);
    assert.deepEqual(advanceChase(state, { jump: true }, frame), ['jump']);
    playFor(state, 1.58);
    assert.equal(hedge.hit, false);
    assert.equal(state.height, 0);
  }
  playFor(state, 3);
  assert.equal(state.bottles, 3);
  assert.equal(state.phase, 'escaped');
});

test('narrow hedges allow both an early and a late jump by the pair', () => {
  for (const lead of [160, 76]) {
    const state = createChaseState();
    playFor(state, TRACK.openingTime + .05);
    const [first] = state.hedges;
    while (state.phase === 'running' && first.position - state.x - state.distance > lead) {
      advanceChase(state, {}, frame);
    }
    advanceChase(state, { jump: true }, frame);
    playFor(state, 1.58);
    assert.equal(first.hit, false, `jump started ${lead} units from the hedge`);
    assert.equal(state.bottles, 3);
  }
});

test('duck on the path and force an early landing in the air', () => {
  const state = createChaseState();
  playFor(state, TRACK.openingTime + .04);
  advanceChase(state, { down: true }, frame);
  assert.equal(state.crouching, true);
  advanceChase(state, { jump: true }, frame);
  playFor(state, .21);
  assert(state.height > 0);
  advanceChase(state, { down: true }, frame);
  assert(state.verticalSpeed < 0);
  playFor(state, .44, { down: true });
  assert.equal(state.height, 0);
  assert.equal(state.crouching, true);
});
