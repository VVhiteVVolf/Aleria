import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { getSceneConditionAnchor } from '../modules/scene-time/scene-condition-anchor.js';
import { getSceneConditionClock, sceneSegmentSeconds, sceneClockBeforeSegment } from '../modules/scene-time/scene-condition-clock.js';
import { createSubstanceIntoxication, advanceSubstanceConditions } from '../modules/character-health/substance-state.js';
import { SUBSTANCE_PROFILES } from '../modules/character-health/substance-profiles.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';

const anchor = seconds => ({ entryId: 'clock-test', serverValidatedMechanics: true,
  sceneTimeEvent: { anchorDay: Math.floor(seconds / 86400) + 1, anchorSeconds: seconds % 86400 } });
const contribution = durationSeconds => ({ serverCommitted: true, commentMode: 'character',
  commentSegments: [{ actorId: 'actor', text: 'Zeit vergeht.', durationSeconds }] });

test('a missing, blank or malformed anchor never creates midnight; an explicit zero does', () => {
  for (const value of [null, undefined, '', ' ', false, true, [], {}, NaN, Infinity, -1, 86400]) {
    assert.equal(getSceneConditionAnchor({ anchorDay: 1, anchorSeconds: value }), null, String(value));
    assert.deepEqual(getSceneConditionClock([{ ...anchor(0), sceneTimeEvent: { anchorDay: 1, anchorSeconds: value } }]), {});
  }
  for (const value of [0, '0']) assert.deepEqual(getSceneConditionAnchor({ anchorDay: 1, anchorSeconds: value }), { day: 1, seconds: 0, cursor: 0 });
  assert.deepEqual(getSceneConditionClock([anchor(0)]), { cursor: 0, seconds: 0 });
});

test('a day-only label changes no existing duration clock and an unaudited time marker is ignored', () => {
  const before = getSceneConditionClock([anchor(100), contribution(60)]);
  assert.deepEqual(getSceneConditionClock([anchor(100), contribution(60), { ...anchor(0), sceneTimeEvent: { anchorDay: 2, anchorSeconds: null } }]), before);
  assert.deepEqual(getSceneConditionClock([anchor(100), contribution(60), { serverCommitted: true, sceneTimeEvent: { anchorDay: 2, anchorSeconds: 0 } }]), before);
});

test('missing segment durations use five seconds while explicit zero remains instantaneous in both clocks', () => {
  const source = readFileSync(new URL('../modules/scene-time/scene-time-state.js', import.meta.url), 'utf8');
  const context = vm.createContext({ console, sortCommentsByTimeline: value => value });
  vm.runInContext(`${source};globalThis.durationForTest = normalizeSceneTimeDurationSeconds;`, context);
  for (const value of [undefined, null, '', ' ', false, true]) {
    assert.equal(sceneSegmentSeconds({ durationSeconds: value }), 5);
    assert.equal(context.durationForTest(value), 5);
  }
  for (const [value, expected] of [[0, 0], ['0', 0], [10.4, 10], [999999, 86400], [-5, 0]]) {
    assert.equal(sceneSegmentSeconds({ durationSeconds: value }), expected);
    assert.equal(context.durationForTest(value), expected);
  }
});

for (const kind of Object.keys(SUBSTANCE_PROFILES)) test(`${kind}: one large jump and incremental passage yield the same complete transition`, () => {
  const initial = createSubstanceIntoxication(kind, { actorId: 'actor', sceneId: 'clock-test', seconds: 100 });
  const before = structuredClone(initial), end = initial.durationModel.expiresAtSeconds;
  const afterEffectEnd = end + initial.substance.hangoverSeconds;
  let conditions = [initial];
  for (const seconds of [101, end - 1, end, end + 1, afterEffectEnd]) conditions = advanceSubstanceConditions(conditions, seconds, 'clock-test');
  assert.deepEqual(conditions, advanceSubstanceConditions([initial], afterEffectEnd, 'clock-test'));
  assert.deepEqual(conditions, []);
  assert.deepEqual(initial, before);
  const wrongScene = advanceSubstanceConditions([initial], afterEffectEnd, 'other-scene');
  assert.deepEqual(wrongScene, [initial]);
});

test('rewinding the narrative clock cannot revive an expired effect or its hangover', () => {
  const condition = createSubstanceIntoxication('alcohol', { actorId: 'actor', sceneId: 'clock-test', seconds: 100 });
  const end = condition.durationModel.expiresAtSeconds + condition.substance.hangoverSeconds;
  const status = { entryId: 'clock-test', serverValidatedMechanics: true, combatStatus: { operation: 'add', actorId: 'actor',
    after: { current: 7, maximum: 30, resources: [{ id: 'mana', current: 2, maximum: 10 }], temporaryConditions: [condition] } } };
  const history = [anchor(100), status, anchor(end), anchor(200), contribution(5)];
  const result = deriveCombatStateFromComments(history).get('actor');
  assert.deepEqual(result.temporaryConditions, []);
  assert.equal(result.current, 7);
  assert.equal(result.resources[0].current, 2);
  assert.equal(getSceneConditionClock(history).seconds, end);
});

test('a generic scene-minute buff expires without requiring substance metadata', () => {
  const condition = { id: 'timed', name: 'Kurzer Schutz', active: true, mechanics: { armorClass: 1 },
    durationModel: { kind: 'scene-time', sceneId: 'clock-test', startedAtSeconds: 100, expiresAtSeconds: 160, remainingSeconds: 60 } };
  assert.equal(advanceSubstanceConditions([condition], 159, 'clock-test')[0].durationModel.remainingSeconds, 1);
  assert.deepEqual(advanceSubstanceConditions([condition], 160, 'clock-test'), []);
  const clock = getSceneConditionClock([anchor(100)]);
  assert.equal(sceneClockBeforeSegment(clock, [{ text: 'Warten.', durationSeconds: 60 }, { text: 'Handeln.' }], 1), 160);
});
