import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function runFiles(relativePaths, additions = {}) {
  const context = vm.createContext({ console, ...additions });
  relativePaths.forEach(relativePath => {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  });
  return context;
}

test('Aleria-Weltdatum normalisiert Werte und wechselt korrekt über Monats- und Jahresgrenzen', () => {
  const context = runFiles(['../modules/world-date/world-date-model.js']);
  const normalized = vm.runInContext("AleriaWorldDateModel.normalize({ year: '1740', month: '3', day: '9' })", context);
  assert.deepEqual({ ...normalized }, { year: 1740, month: 3, day: 9 });
  assert.equal(vm.runInContext('AleriaWorldDateModel.isValid({ year: 1740, month: 14, day: 1 })', context), false);

  const nextMonth = vm.runInContext('AleriaWorldDateModel.shift({ year: 1740, month: 3, day: 36 }, 1)', context);
  assert.deepEqual({ ...nextMonth }, { year: 1740, month: 4, day: 1 });
  const nextYear = vm.runInContext('AleriaWorldDateModel.shift({ year: 1740, month: 13, day: 36 }, 1)', context);
  assert.deepEqual({ ...nextYear }, { year: 1741, month: 1, day: 1 });
});

test('Familien wird entfernt, Test bleibt gespeichert aber unsichtbar', () => {
  const context = runFiles(['../modules/module-store/module-section-policy.js']);
  assert.equal(vm.runInContext("AleriaModuleSectionPolicy.isRemoved({ tab: 'Familien' })", context), true);
  assert.equal(vm.runInContext("AleriaModuleSectionPolicy.isHidden({ tab: 'Test' })", context), true);
  assert.equal(vm.runInContext("AleriaModuleSectionPolicy.isRemoved({ tab: 'Test' })", context), false);
  assert.equal(vm.runInContext(`AleriaModuleSectionPolicy.hasRemovedContent({
    customSections: [{ tab: 'Familien', entries: [{ id: 'haus' }] }]
  })`, context), true);
});

test('eine undatierte Szene übernimmt das Weltdatum genau einmal', () => {
  const assigned = [];
  const thread = {
    kind: 'session',
    threadId: 'chronik::session:0',
    entry: { id: 'chronik' },
    pageIndex: 0,
    page: { sessionPage: true }
  };
  const context = runFiles([
    '../modules/world-date/world-date-model.js',
    '../modules/world-date/world-date-scene-default.js'
  ], {
    _commentCache: {},
    getCurrentCommentThread: () => thread,
    setModuleSceneStartDateAleria: (entryId, pageIndex, date) => {
      assigned.push({ entryId, pageIndex, date: { ...date } });
      return true;
    },
    AleriaWorldDateStore: {
      getState: () => ({ date: { year: 1740, month: 3, day: 9 } })
    }
  });

  const first = vm.runInContext('AleriaSceneDateDefaults.ensureForCurrentThread()', context);
  assert.deepEqual({ ...first }, { year: 1740, month: 3, day: 9 });
  assert.equal(assigned.length, 1);

  context.AleriaWorldDateStore.getState = () => ({ date: { year: 1740, month: 3, day: 10 } });
  const second = vm.runInContext('AleriaSceneDateDefaults.ensureForCurrentThread()', context);
  assert.deepEqual({ ...second }, { year: 1740, month: 3, day: 9 });
  assert.equal(assigned.length, 1);
});

test('ein im ersten Kommentar gespeichertes Startdatum dient als stabile Wiederherstellung', () => {
  const context = runFiles([
    '../modules/world-date/world-date-model.js',
    '../modules/world-date/world-date-scene-default.js'
  ], {
    AleriaWorldDateStore: { getState: () => ({ date: { year: 1740, month: 4, day: 1 } }) }
  });
  const date = vm.runInContext(`AleriaSceneDateDefaults.resolve(
    { page: {}, threadId: 'szene' },
    [{ sceneStartDateAleria: { year: 1739, month: 13, day: 36 } }]
  )`, context);
  assert.deepEqual({ ...date }, { year: 1739, month: 13, day: 36 });
});
