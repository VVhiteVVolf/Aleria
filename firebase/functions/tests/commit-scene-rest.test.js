import assert from 'node:assert/strict';
import test from 'node:test';
import { sceneRestCommitInternals } from '../src/mechanics/commit-scene-rest.js';

test('rest detects daily recovery only after a trusted day key changed', () => {
  assert.equal(sceneRestCommitInternals.hasPendingDailyRecovery({
    resources: [{ id: 'mana', recovery: 'day', recoveryDayKey: 'scene:test:day-1' }]
  }, 'scene:test:day-2'), true);
  assert.equal(sceneRestCommitInternals.hasPendingDailyRecovery({
    abilities: [{ id: 'special', recovery: 'day', recoveryDayKey: 'scene:test:day-2' }]
  }, 'scene:test:day-2'), false);
});

test('legacy daily entries without a day key receive one explicit migration recovery', () => {
  assert.equal(sceneRestCommitInternals.hasPendingDailyRecovery({
    resources: [{ id: 'mana', recovery: 'day', current: 0, maximum: 10 }]
  }, 'scene:test:day-4'), true);
});

test('an actual scene-day transition is authoritative even before a profile has daily entries', () => {
  assert.equal(sceneRestCommitInternals.shouldRecoverDailyOnRest({}, 'scene:test:day-2', true), true);
  assert.equal(sceneRestCommitInternals.shouldRecoverDailyOnRest({}, 'scene:test:day-2', false), false);
});

test('rest timeline accepts forward progress and rejects backwards or invalid anchors', () => {
  const previousCursor = ((2 - 1) * 86400) + (20 * 3600);
  assert.deepEqual(
    sceneRestCommitInternals.getRequestedRestTimeline({ anchorDay: 3, anchorSeconds: 4 * 3600 }, previousCursor),
    { anchorDay: 3, anchorSeconds: 4 * 3600, endCursor: ((3 - 1) * 86400) + (4 * 3600) }
  );
  assert.throws(
    () => sceneRestCommitInternals.getRequestedRestTimeline({ anchorDay: 2, anchorSeconds: 19 * 3600 }, previousCursor),
    /nicht zurückdrehen/
  );
  assert.throws(
    () => sceneRestCommitInternals.getRequestedRestTimeline({ anchorDay: 3, anchorSeconds: 90000 }, previousCursor),
    /Endzeit/
  );
  assert.throws(
    () => sceneRestCommitInternals.getRequestedRestTimeline({ anchorDay: 2, anchorSeconds: 21 * 3600 }, previousCursor, 8 * 3600),
    /kürzer als die angegebene Rastdauer/
  );
});
