import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../modules/scene-time/scene-time-state.js', import.meta.url), 'utf8');

function loadSceneTimeState() {
  const context = vm.createContext({
    console,
    globalThis: null,
    sanitizeImageSrc: value => value,
    sortCommentsByTimeline: comments => comments
  });
  context.globalThis = context;
  vm.runInContext(`${source}\n;globalThis.__sceneTimeTestApi = { buildSceneTimeline, getSceneAleriaDayIndex };`, context);
  return context.__sceneTimeTestApi;
}

test('ein normaler Zeitanker auf Uhrentag 2 erhöht das Aleria-Datum nicht', () => {
  const { buildSceneTimeline } = loadSceneTimeState();
  const [entry] = buildSceneTimeline([{
    commentMode: 'scene-time',
    sceneTimeEvent: {
      presetKey: 'morning',
      anchorDay: 2,
      anchorSeconds: 9 * 3600,
      segmentBreak: false
    }
  }]);
  assert.equal(entry.aleriaDayIndex, 1);
  assert.equal(entry.aleriaEndDayIndex, 1);
});

test('ein ausdrücklicher Tageswechsel erhöht das Aleria-Datum', () => {
  const { buildSceneTimeline } = loadSceneTimeState();
  const timeline = buildSceneTimeline([
    {
      commentMode: 'scene-time',
      sceneTimeEvent: { presetKey: 'morning', anchorDay: 1, anchorSeconds: 9 * 3600 }
    },
    {
      commentMode: 'scene-time',
      sceneTimeEvent: {
        presetKey: 'next-day',
        anchorDay: 2,
        anchorSeconds: 9 * 3600,
        segmentBreak: true
      }
    }
  ]);
  assert.equal(timeline[0].aleriaDayIndex, 1);
  assert.equal(timeline[1].aleriaDayIndex, 2);
});

test('ein Beitrag, der Mitternacht überschreitet, schreibt den Folgetag fest', () => {
  const { buildSceneTimeline } = loadSceneTimeState();
  const timeline = buildSceneTimeline([
    {
      commentMode: 'scene-time',
      sceneTimeEvent: { presetKey: 'night', anchorDay: 1, anchorSeconds: 86398 }
    },
    {
      commentMode: 'character',
      text: 'Ein kurzer Beitrag.'
    }
  ]);
  assert.equal(timeline[1].aleriaDayIndex, 1);
  assert.equal(timeline[1].aleriaEndDayIndex, 2);
});

test('Rast und Tagesressourcen verwenden denselben Kalendertag wie die Anzeige', () => {
  const { getSceneAleriaDayIndex } = loadSceneTimeState();
  const comments = [{
    commentMode: 'scene-time',
    sceneTimeEvent: {
      presetKey: 'morning',
      anchorDay: 2,
      anchorSeconds: 9 * 3600,
      segmentBreak: false
    }
  }];
  assert.equal(getSceneAleriaDayIndex(comments), 1);
  assert.equal(getSceneAleriaDayIndex(comments, 2), 1);
  assert.equal(getSceneAleriaDayIndex(comments, 3), 2);
});

test('Datumsauswahl setzt einen ausdrücklichen Kalendertag, auch ohne Tageswechsel-Preset', () => {
  const { buildSceneTimeline, getSceneAleriaDayIndex } = loadSceneTimeState();
  const comments = [{ sceneTimeEvent: { presetKey: 'morning', anchorDay: 4, anchorSeconds: 36000, calendarDay: 8 } }];
  assert.equal(buildSceneTimeline(comments)[0].aleriaDayIndex, 8);
  assert.equal(getSceneAleriaDayIndex(comments), 8);
});

test('Bearbeitete verbindliche Uhrzeit hat Vorrang vor älteren Uhrzeiten im Text', () => {
  const { buildSceneTimeline } = loadSceneTimeState();
  const [entry] = buildSceneTimeline([{ sceneTimeEvent: { presetKey: 'morning', anchorDay: 1, anchorSeconds: 43200, timeLabel: '09:00 Uhr' } }]);
  assert.equal(entry.startSeconds, 43200);
});
