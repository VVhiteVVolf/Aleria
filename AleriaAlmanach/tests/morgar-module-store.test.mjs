import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const legacy = JSON.parse(readFileSync(new URL('./fixtures/morgar-v1.module.json', import.meta.url), 'utf8'));
const previous = JSON.parse(readFileSync(new URL('./fixtures/morgar-v2.module.json', import.meta.url), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));

function moduleStore() {
  const storage = new Map();
  const context = vm.createContext({
    console, TextEncoder, setTimeout, clearTimeout,
    addEventListener() {},
    document: { addEventListener() {}, getElementById: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    normalizeSearchText: value => String(value || '').toLowerCase(),
    invalidateArchiveSearchCache() {}, updateFirebaseSyncStatus() {}, renderAll() {}, showAppStatus() {},
    _inlineModuleEdit: { active: false }
  });
  context.window = context;
  for (const source of [
    '../../Fonts/Karnrith-Font-2.000/karnrith.js',
    '../modules/name-list/name-list-data.js', '../modules/script-table/script-table-data.js',
    '../modules/language/language-data.js', '../modules/language/morgar/morgar-data.js',
    '../modules/language/morgar/morgar-tables.js', '../modules/language/morgar/morgar-entry.js',
    '../modules/language/morgar/morgar-terminology-migration.js',
    '../modules/language/morgar/morgar-migration.js', '../modules/module-store/module-entry-migrations.js',
    '../modules/core/app-core.js', '../modules/module-editor/module-editor-cast-picker.js',
    '../modules/module-store/module-store-tree.js', '../modules/module-store/module-store-sections.js',
    '../modules/module-store/module-store-sync.js'
  ]) vm.runInContext(readFileSync(new URL(source, import.meta.url), 'utf8'), context, { filename: source });
  context.SECTIONS = [{ key: 'Sprachen', tab: 'Sprachen', entries: [context.createMorgarLanguageEntry()] }];
  return context;
}

function assertCurrent(entry, pageCount = 5) {
  assert.equal(entry.pages.length, pageCount);
  assert.equal(entry.pages[0].image, './modules/language/morgar/assets/morgar-hallenrunde-v1.png');
  assert.deepEqual(Array.from(entry.pages[2].nameList.groups, group => group.names.length), [500, 500, 100]);
  assert.equal(entry.pages[4].scriptTable.rows.length, 371);
  assert.equal(entry.pages[3].scriptTable.syllables.length, 72);
  assert.equal(entry.pages[1].language.sections.filter(section => section.title === 'Morgorns Adelstitel und Kriegerkasten').length, 1);
}

test('the actual saved Morgar 2.0 receives the accepted terms on local and remote load', () => {
  assert.equal(previous.pages[4].scriptTable.rows.length, 360);
  for (const source of ['local', 'remote']) {
    const context = moduleStore();
    const store = { updatedAtClient: 250, entryOverrides: { [previous.id]: clone(previous) } };
    if (source === 'local') {
      context.localStorage.setItem('aleria-module-store-v1', JSON.stringify(store));
      context.loadModuleStore();
    } else context.applyRemoteModuleStore(store);
    const entry = context.findCurrentSectionByEntryId(previous.id).entry;
    assertCurrent(entry);
    assert.match(entry.pages[4].scriptTable.archiveLabel, /Morgar 2\.1/);
    assert.equal(entry.pages[4].scriptTable.rows.find(row => row.symbol === 'thalor').name, 'Wachtposten; Wächterkaste');
    assert.deepEqual(clone(entry.pages[2].nameList.groups), previous.pages[2].nameList.groups);
    assert.deepEqual(clone(context.sanitizeModuleEntry(entry)), clone(entry));
    assertCurrent(context.buildModuleExportPayload(previous.id).entry);
  }
});

test('the terminology upgrade preserves custom text, covers, names, words and deliberately removed words', () => {
  const context = moduleStore();
  const edited = clone(previous);
  edited.pages[0].image = '../Bilder/eigene-halle.png';
  edited.pages[0].description = 'Mein eigener Sprachauftakt';
  edited.pages[1].language.sections[0].text = 'Meine Aussprachehilfe';
  edited.pages[2].nameList.groups[0].names[0] = 'Eigenname';
  const dictionary = edited.pages[4].scriptTable;
  dictionary.title = 'Mein Wörterbuch';
  dictionary.rows.find(row => row.symbol === 'bera').name = 'Mein Hausbrot';
  dictionary.rows = dictionary.rows.filter(row => row.symbol !== 'ziren');
  dictionary.rows.push({ symbol: 'Taldar', name: 'Meine Randnotiz', sound: 'TAL·dar', meaning: 'Eigene Erläuterung' });
  edited.pages.push({ pageTitle: 'Eigene Sippennotizen', description: 'Zusatzseite' });
  const before = JSON.stringify(edited);
  const entry = context.sanitizeModuleEntry(edited);
  assert.equal(JSON.stringify(edited), before);
  assert.equal(entry.pages.length, 6);
  assert.equal(entry.pages[0].image, edited.pages[0].image);
  assert.equal(entry.pages[0].description, edited.pages[0].description);
  assert.equal(entry.pages[1].language.sections[0].text, 'Meine Aussprachehilfe');
  assert.equal(entry.pages[2].nameList.groups[0].names[0], 'Eigenname');
  assert.equal(entry.pages[4].scriptTable.title, 'Mein Wörterbuch');
  const rows = entry.pages[4].scriptTable.rows;
  assert.equal(rows.length, dictionary.rows.length + 10);
  assert.equal(rows.find(row => row.symbol === 'bera').name, 'Mein Hausbrot');
  assert.equal(rows.filter(row => row.symbol.toLowerCase() === 'taldar').length, 1);
  assert.equal(rows.find(row => row.symbol === 'Taldar').name, 'Meine Randnotiz');
  assert(!rows.some(row => row.symbol === 'ziren'));
  assert.equal(entry.pages[5].description, 'Zusatzseite');
  assert.deepEqual(clone(context.sanitizeModuleEntry(entry)), clone(entry));
});

test('the actual four-page/400-name local override loads, exports and reloads as Morgar 2.0', () => {
  const context = moduleStore();
  assert.equal(legacy.pages.length, 4);
  assert.deepEqual(legacy.pages[2].nameList.groups.map(group => group.names.length), [200, 200]);
  const payload = { updatedAtClient: 123, entryOverrides: { [legacy.id]: clone(legacy) } };
  const before = JSON.stringify(payload);
  context.localStorage.setItem('aleria-module-store-v1', before);
  context.loadModuleStore();
  assertCurrent(context.findCurrentSectionByEntryId(legacy.id).entry);
  assertCurrent(context.buildModuleExportPayload(legacy.id).entry);
  const saved = context.getModuleStorePayload(123);
  assertCurrent(saved.entryOverrides[legacy.id]);
  context.writeLocalModuleStorePayload(saved);
  context.loadModuleStore();
  assertCurrent(context.findCurrentSectionByEntryId(legacy.id).entry);
  assert.equal(JSON.stringify(payload), before);
});

test('saved Morgar 2.0 receives the scene image without replacing current language edits or custom covers', () => {
  const context = moduleStore();
  const saved = clone(context.createMorgarLanguageEntry());
  saved.image = saved.pages[0].image = '../Fonts/Karnrith-Font-2.000/Leseprobe.png';
  saved.pages[2].nameList.groups[0].names[0] = 'Eigenname';
  const migrated = context.sanitizeModuleEntry(saved);
  assertCurrent(migrated);
  assert.equal(migrated.image, migrated.pages[0].image);
  assert.equal(migrated.pages[2].nameList.groups[0].names[0], 'Eigenname');
  assert.deepEqual(clone(context.sanitizeModuleEntry(migrated)), clone(migrated));
  saved.image = saved.pages[0].image = '../Bilder/eigene-halle.png';
  assert.equal(context.sanitizeModuleEntry(saved).pages[0].image, saved.pages[0].image);
  assert.equal(saved.pages[2].nameList.groups[0].names[0], 'Eigenname');
});

test('a Firebase-delivered override and repeated old snapshots cannot reinstate the four-page entry', () => {
  const context = moduleStore();
  const remote = { updatedAtClient: 200, entryOverrides: { [legacy.id]: clone(legacy) } };
  context.applyRemoteModuleStore(remote);
  assertCurrent(context.findCurrentSectionByEntryId(legacy.id).entry);
  assertCurrent(context.readLocalModuleStorePayload().entryOverrides[legacy.id]);
  context.applyRemoteModuleStore({ ...remote, updatedAtClient: 300 });
  assertCurrent(context.findCurrentSectionByEntryId(legacy.id).entry);
  assert.equal(remote.entryOverrides[legacy.id].pages.length, 4);
});

test('migration retains placement, module metadata, comments, custom pages and unrelated records', () => {
  const context = moduleStore();
  const old = clone(legacy);
  old.stamp = 'Privates Hallenarchiv';
  old.moduleWidth = 80;
  old.locked = true;
  old.image = '../Bilder/eigene-halle.png';
  old.pages[0].commentSequence = [{ narrator: true, text: 'Eigene Randnotiz' }];
  old.pages.push({ pageTitle: 'Familiennotizen', description: 'Eigener Zusatz' });
  const unrelated = { id: 'anderes-modul', title: 'Andere Sprache', multipage: true, pages: [{ description: 'Bleibt erhalten' }] };
  const payload = {
    entryOverrides: { [old.id]: old, [unrelated.id]: unrelated },
    moduleSectionMoves: { [old.id]: { key: 'Hallen', tab: 'Sprachen', path: ['Hallen'] } },
    hiddenModuleIds: { 'anderes-modul': true }
  };
  context.applyModuleStorePayload(payload);
  const found = context.findCurrentSectionByEntryId(old.id);
  assert.equal(found.section.key, 'Hallen');
  assertCurrent(found.entry, 6);
  assert.equal(found.entry.moduleWidth, 80);
  assert.equal(found.entry.stamp, old.stamp);
  assert.equal(found.entry.image, old.image);
  assert.equal(found.entry.locked, true);
  assert.equal(found.entry.pages[0].commentSequence[0].text, 'Eigene Randnotiz');
  assert.equal(found.entry.pages[5].description, 'Eigener Zusatz');
  assert.equal(context.getModuleStorePayload().entryOverrides[unrelated.id].pages[0].description, 'Bleibt erhalten');
  assert.equal(context.getModuleStorePayload().hiddenModuleIds[unrelated.id], true);
  const custom = context.normalizeModuleStorePayload({ customSections: [{ key: 'Sammlung', entries: [clone(legacy)] }] });
  assertCurrent(custom.customSections[0].entries[0]);
});

test('old 1.1 registers are replaced, while current edits and independently named copies are untouched', () => {
  const context = moduleStore();
  const old = clone(legacy);
  old.pages[2].pageTitle = 'III. — 200 Namen aus dem Morgar';
  old.pages.push(...['V. — 100 Grundwörter', 'VI. — Männliche Namen mit Aussprache', 'VII. — Weibliche Namen mit Aussprache'].map(pageTitle => ({
    pageTitle, scriptTablePage: true, scriptTable: { archiveLabel: 'Morgar 1.1 · Vollständiger Quellenbestand', rows: [] }
  })));
  assertCurrent(context.sanitizeModuleEntry(old));
  const current = context.sanitizeModuleEntry(context.createMorgarLanguageEntry());
  current.pages[2].nameList.groups[0].names[0] = 'Eigenname';
  current.pages[4].scriptTable.rows[0].meaning = 'Eigene Erklärung';
  assert.deepEqual(clone(context.sanitizeModuleEntry(current)), clone(current));
  const copy = { ...clone(legacy), id: 'meine-morgar-kopie' };
  assert.equal(context.sanitizeModuleEntry(copy).pages.length, 4);
});
