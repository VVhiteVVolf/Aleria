import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { getSceneRecoveryDay, getSceneRecoveryDayKey } from '../modules/scene-time/scene-recovery-day.js';
import { recoverDailyCombatResources } from '../modules/combat/combat-action-economy.js';

const morning = {
  serverCommitted: true, mechanicalAudit: true, commentMode: 'scene-time',
  sceneTimeEvent: { presetKey: 'morning', anchorDay: 2, anchorSeconds: 32400, segmentBreak: false }
};

test('Uhrentag 2 und Kalenderanzeige Tag 1 erzeugen keine scheinbare Erholung im Kampf', () => {
  const context = vm.createContext({ sortCommentsByTimeline: comments => comments });
  vm.runInContext(readFileSync(new URL('../modules/scene-time/scene-time-state.js', import.meta.url), 'utf8'), context);
  assert.equal(context.getSceneAleriaDayIndex([morning]), 1);
  const key = getSceneRecoveryDayKey('duel', [morning]);
  assert.equal(key, 'scene:duel:day-2');
  const spent = [{ id: 'special-action', current: 0, maximum: 2, scope: 'persistent', recovery: 'day', recoveryDayKey: key }];
  assert.equal(recoverDailyCombatResources(spent, key)[0].current, 0);
  const nextDay = { ...morning, sceneTimeEvent: { ...morning.sceneTimeEvent, anchorDay: 3 } };
  assert.equal(recoverDailyCombatResources(spent, getSceneRecoveryDayKey('duel', [morning, nextDay]))[0].current, 2);
});

test('Kalenderdatum, unbestätigte Anker und importierte Geschichte verändern die Erholungsperiode nicht', () => {
  const history = [morning,
    { sceneTimeEvent: { anchorDay: 99 } },
    { ...morning, importedHistoricalMechanics: true, sceneTimeEvent: { anchorDay: 50 } },
    { ...morning, sceneTimeEvent: { anchorDay: 1, calendarDay: 12 } }
  ];
  assert.equal(getSceneRecoveryDay(history), 2);
  assert.equal(getSceneRecoveryDayKey('duel', history), 'scene:duel:day-2');
});

test('Rastvorschau verwendet denselben Szenenschlüssel und berücksichtigt ihren Endtag', () => {
  assert.equal(getSceneRecoveryDayKey('duel', [morning], 2), 'scene:duel:day-2');
  assert.equal(getSceneRecoveryDayKey('duel', [morning], 3), 'scene:duel:day-3');
  assert.equal(getSceneRecoveryDayKey('new-scene', []), 'scene:new-scene:day-1');
});
