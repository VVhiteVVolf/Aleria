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
  assert.equal(vm.runInContext('AleriaWorldDateModel.differenceInDays({ year: 1740, month: 3, day: 34 }, { year: 1740, month: 4, day: 2 })', context), 4);
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

function sceneDateContext({ date = { year: 1740, month: 3, day: 9 }, comments = [], kind = 'session', page = { sessionPage: true } } = {}) {
  const thread = {
    kind,
    threadId: 'chronik::session:0',
    entry: { id: 'chronik' },
    pageIndex: 0,
    page
  };
  const context = runFiles([
    '../modules/world-date/world-date-model.js',
    '../modules/world-date/world-date-scene-default.js'
  ], {
    _commentCache: { [thread.threadId]: comments },
    getCurrentCommentThread: () => thread,
    setModuleSceneStartDateAleria: () => assert.fail('Comment dates must not write the containing module'),
    AleriaWorldDateStore: { getState: () => ({ date }) }
  });
  return { context, thread };
}

test('eine undatierte Szene trägt das Weltdatum im Beitrag und verändert das Modul nicht', () => {
  const { context, thread } = sceneDateContext();
  const before = structuredClone(thread);
  const first = vm.runInContext('AleriaSceneDateDefaults.ensureForCurrentThread()', context);
  assert.deepEqual({ ...first }, { year: 1740, month: 3, day: 9 });
  assert.deepEqual(thread, before);

  // The comment backend returns this metadata as part of the scene history.
  context._commentCache[thread.threadId] = [{ sceneStartDateAleria: first }];
  context.AleriaWorldDateStore.getState = () => ({ date: { year: 1740, month: 3, day: 10 } });
  const second = vm.runInContext('AleriaSceneDateDefaults.ensureForCurrentThread()', context);
  assert.deepEqual({ ...second }, { year: 1740, month: 3, day: 9 });
  assert.deepEqual(thread, before);
});

test('ein explizites Moduldatum hat Vorrang vor Kommentarhistorie und ausgewähltem Datum', () => {
  const { context, thread } = sceneDateContext({
    page: { sessionPage: true, sessionDateAleria: { year: 1739, month: 13, day: 36 } },
    comments: [{ sceneStartDateAleria: { year: 1740, month: 2, day: 1 } }]
  });
  const before = structuredClone(thread);
  const result = vm.runInContext('AleriaSceneDateDefaults.ensureForCurrentThread({year:1740,month:4,day:1})', context);
  assert.deepEqual({ ...result }, { year: 1739, month: 13, day: 36 });
  assert.deepEqual(thread, before);
});

test('ein Szenendatum aus der Kommentarhistorie bleibt nach Modulneuladen ohne Moduländerung verfügbar', () => {
  const { context, thread } = sceneDateContext({ comments: [
    { sceneStartDateAleria: { year: 1739, month: 13, day: 36 } }
  ] });
  // A fresh page has no automatic date written back into the module source.
  thread.page = Object.freeze({ sessionPage: true });
  const result = vm.runInContext('AleriaSceneDateDefaults.ensureForCurrentThread({year:1740,month:4,day:1})', context);
  assert.deepEqual({ ...result }, { year: 1739, month: 13, day: 36 });
  assert.equal(Object.hasOwn(thread.page, 'sessionDateAleria'), false);
});

test('ausgewählte Startdaten werden normalisiert und Weltdaten nicht per Referenz verändert', () => {
  const date = { year: 1740, month: 3, day: 9 };
  const { context } = sceneDateContext({ date });
  const selected = vm.runInContext("AleriaSceneDateDefaults.ensureForCurrentThread({year:'1741',month:'1',day:'2'})", context);
  assert.deepEqual({ ...selected }, { year: 1741, month: 1, day: 2 });
  const fallback = vm.runInContext('AleriaSceneDateDefaults.ensureForCurrentThread({year:0})', context);
  assert.deepEqual({ ...fallback }, date);
  fallback.day = 10;
  assert.equal(date.day, 9);
});

test('ungültige Weltdaten und Kommentare außerhalb von Szenen erhalten kein automatisches Startdatum', () => {
  const invalid = sceneDateContext({ date: { year: 0 } }).context;
  assert.equal(vm.runInContext('AleriaSceneDateDefaults.ensureForCurrentThread()', invalid), null);
  const nonScene = sceneDateContext({ kind: 'entry-comments' }).context;
  nonScene.AleriaWorldDateStore.getState = () => assert.fail('Non-scenes do not need the world date');
  assert.equal(vm.runInContext('AleriaSceneDateDefaults.ensureForCurrentThread()', nonScene), null);
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

test('ausdrücklich datierte Zeitmarker stellen den Szenenbeginn auch ohne zusätzliches Backend-Feld wieder her', () => {
  const context = runFiles(['../modules/world-date/world-date-model.js', '../modules/world-date/world-date-scene-default.js']);
  const date = vm.runInContext(`AleriaSceneDateDefaults.resolve({page:{}}, [{sceneTimeEvent:{calendarDate:{year:1741,month:1,day:2},calendarDay:4}}])`, context);
  assert.deepEqual({ ...date }, { year: 1740, month: 13, day: 35 });
});
