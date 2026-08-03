import assert from 'node:assert/strict';
import test from 'node:test';
import { combatCommentInternals } from '../src/mechanics/commit-combat-comment.js';

function resolution() {
  return { profileActionId: 'ability:shield-bash' };
}

test('a daily ability is consumed and records its recovery day', () => {
  const result = combatCommentInternals.consumeAbilityUse([{
    id: 'shield-bash',
    name: 'Schildstoß',
    recovery: 'day',
    usesCurrent: 2,
    usesMaximum: 2
  }], resolution(), 'scene:brandhof:day-1');
  assert.equal(result.use.before, 2);
  assert.equal(result.use.after, 1);
  assert.equal(result.abilities[0].recoveryDayKey, 'scene:brandhof:day-1');
});

test('a daily ability recovers on a trusted new day before consumption', () => {
  const result = combatCommentInternals.consumeAbilityUse([{
    id: 'shield-bash',
    name: 'Schildstoß',
    recovery: 'day',
    recoveryDayKey: 'scene:brandhof:day-1',
    usesCurrent: 0,
    usesMaximum: 2
  }], resolution(), 'scene:brandhof:day-2');
  assert.equal(result.use.before, 2);
  assert.equal(result.use.after, 1);
  assert.equal(result.abilities[0].recoveryDayKey, 'scene:brandhof:day-2');
});

test('a legacy daily ability initializes once before its first tracked use', () => {
  const result = combatCommentInternals.consumeAbilityUse([{
    id: 'shield-bash',
    name: 'Schildstoß',
    recovery: 'day',
    usesCurrent: 0,
    usesMaximum: 2
  }], resolution(), 'scene:brandhof:day-3');
  assert.equal(result.use.before, 2);
  assert.equal(result.use.after, 1);
  assert.equal(result.abilities[0].recoveryDayKey, 'scene:brandhof:day-3');
});

test('multiple ability uses in one complete comment do not refill between segments', () => {
  const first = combatCommentInternals.consumeAbilityUse([{
    id: 'shield-bash', name: 'Schildstoß', recovery: 'day',
    usesCurrent: 2, usesMaximum: 2
  }], resolution(), 'scene:brandhof:day-1');
  const second = combatCommentInternals.consumeAbilityUse(first.abilities, resolution(), 'scene:brandhof:day-1');
  assert.deepEqual([first.use.before, first.use.after], [2, 1]);
  assert.deepEqual([second.use.before, second.use.after], [1, 0]);
  assert.throws(
    () => combatCommentInternals.consumeAbilityUse(second.abilities, resolution(), 'scene:brandhof:day-1'),
    /keine Nutzung mehr/
  );
});

test('authoritative comment resources recover a new day after replay state and keep persistent costs', () => {
  const base = [
    { id: 'action', current: 1, maximum: 1, scope: 'comment', recovery: 'scene' },
    { id: 'aura-focus', current: 2, maximum: 2, scope: 'persistent', recovery: 'day', recoveryDayKey: 'scene:test:day-1' }
  ];
  const previousState = [
    { ...base[0], current: 1 },
    { ...base[1], current: 0 }
  ];
  const sameDay = combatCommentInternals.getEffectiveCommentResources(base, previousState, 'scene:test:day-1');
  const nextDay = combatCommentInternals.getEffectiveCommentResources(base, previousState, 'scene:test:day-2');
  assert.deepEqual(sameDay.map(resource => resource.current), [1, 0]);
  assert.deepEqual(nextDay.map(resource => resource.current), [1, 2]);
  assert.equal(nextDay[1].recoveryDayKey, 'scene:test:day-2');
});
