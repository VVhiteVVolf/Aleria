import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { buildLaerelisReference, loadLaerelisSource } from '../modules/language/laerelis/laerelis-build.mjs';

const clone = value => JSON.parse(JSON.stringify(value));

function languageContext() {
  const storage = new Map();
  const context = vm.createContext({
    console, TextEncoder, CustomEvent, setTimeout, clearTimeout,
    addEventListener() {}, dispatchEvent() {},
    document: { addEventListener() {}, getElementById: () => null, querySelectorAll: () => [], dispatchEvent() {} },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    normalizeSearchText: value => String(value || '').toLowerCase(), normalizeCommentKind: value => value,
    invalidateArchiveSearchCache() {}, updateFirebaseSyncStatus() {}, renderAll() {}, showAppStatus() {},
    _inlineModuleEdit: { active: false },
    buildNav: () => '', getInlineCommentThreadForPage: () => null,
    inferModulePageType: page => page.nameListPage ? 'name-list' : 'script-table',
    getTrimmedFormValue: (block, selector) => (block.querySelector(selector)?.value || '').trim()
  });
  context.window = context;
  for (const source of [
    '../modules/core/content-safety.js', '../modules/language/language-data.js',
    '../modules/name-list/name-list-data.js', '../modules/name-list/name-list-renderer.js',
    '../modules/name-list/name-list-module-editor.js', '../modules/name-list/name-list-inline-editor.js',
    '../modules/script-table/script-table-data.js', '../modules/script-table/script-table-renderer.js',
    '../modules/script-table/script-table-module-editor.js',
    '../modules/language/laerelis/laerelis-data.js', '../modules/language/laerelis/laerelis-script.js',
    '../modules/language/laerelis/laerelis-tables.js', '../modules/language/laerelis/laerelis-entry.js',
    '../modules/language/language-script-display.js', '../modules/comments/comments-markup.js',
    '../modules/comments/comments-spell-fonts.js', '../modules/core/app-core.js',
    '../modules/module-editor/module-editor-cast-picker.js', '../modules/module-store/module-store-tree.js',
    '../modules/module-store/module-store-sections.js', '../modules/module-store/module-store-sync.js'
  ]) vm.runInContext(readFileSync(new URL(source, import.meta.url), 'utf8'), context, { filename: source });
  context.SECTIONS = [{ key: 'Sprachen', tab: 'Sprachen', entries: [context.createLaerelisLanguageEntry()] }];
  return context;
}

function assertComplete(entry) {
  assert.equal(entry.pages.length, 5);
  assert.deepEqual(Array.from(entry.pages[2].nameList.groups, group => group.names.length), [600, 600, 600]);
  assert.equal(entry.pages[2].nameList.ornamentStyle, 'laerelis');
  assert.equal(entry.pages[3].scriptTable.scriptStyle, 'laerelis');
  assert.equal(entry.pages[3].scriptTable.rows.length, 25);
  assert.equal(entry.pages[3].scriptTable.syllables.length, 400);
  assert.equal(entry.pages[4].scriptTable.rows.length, 1132);
}

test('Laerelis generated data and font match the supplied preview without losing any reference records', async () => {
  await buildLaerelisReference({ check: true });
  const { data } = await loadLaerelisSource();
  const context = languageContext();
  const entry = context.createLaerelisLanguageEntry();
  assertComplete(entry);
  const names = entry.pages[2].nameList.groups.flatMap(group => group.names);
  assert.deepEqual(new Set(names), new Set(data.namen.map(item => item.vollform)));
  const words = entry.pages[4].scriptTable.rows;
  assert.deepEqual(new Set(words.map(item => item.symbol)), new Set([
    ...data.sachwoerter.map(item => item.wort), ...data.funktionswoerter.map(item => item.form)
  ]));
  assert(words.every(item => item.name && item.sound && item.meaning && !item.meaning.includes('undefined')));
  assert.equal(context.sanitizeLanguageData(entry.pages[1].language).sections.length, 12);
});

test('all five Laerelis pages survive local and remote store loads, export and repeated normalization', () => {
  for (const source of ['local', 'remote']) {
    const context = languageContext();
    const entry = context.sanitizeModuleEntry(context.createLaerelisLanguageEntry());
    entry.pages[0].description = 'Eigener Auftakt';
    entry.pages[4].scriptTable.rows.at(-1).name = 'Eigener Wörterbucheintrag';
    const payload = { updatedAtClient: 250, entryOverrides: { [entry.id]: clone(entry) } };
    if (source === 'local') {
      context.localStorage.setItem('aleria-module-store-v1', JSON.stringify(payload));
      context.loadModuleStore();
    } else context.applyRemoteModuleStore(payload);
    const loaded = context.findCurrentSectionByEntryId(entry.id).entry;
    assertComplete(loaded);
    assert.equal(loaded.pages[0].description, 'Eigener Auftakt');
    const exported = context.buildModuleExportPayload(entry.id).entry;
    assertComplete(exported);
    assert.equal(exported.pages[4].scriptTable.rows.at(-1).name, 'Eigener Wörterbucheintrag');
    const normalized = context.sanitizeModuleEntry(clone(exported));
    assert.deepEqual(clone(context.sanitizeModuleEntry(normalized)), clone(normalized));
  }
});

test('dictionary, root register and name editors preserve every row and the selected Lichtfluss font', () => {
  const context = languageContext();
  const entry = context.createLaerelisLanguageEntry();
  for (const page of [entry.pages[3], entry.pages[4]]) {
    const table = page.scriptTable;
    assert.deepEqual(clone(context.sanitizeScriptTableRows(context.parseScriptTableRows(context.formatScriptTableRows(table.rows)))), clone(table.rows));
    assert.deepEqual(clone(context.sanitizeScriptTableSyllables(context.parseScriptTableSyllables(context.formatScriptTableSyllables(table.syllables)))), clone(table.syllables));
  }
  const names = entry.pages[2].nameList;
  for (const group of names.groups) assert.deepEqual(Array.from(context.sanitizeNameListNames(group.names.join('\n'))), Array.from(group.names));
  assert.match(context.buildNameListModuleEditorFields(entry.pages[2]), /value="laerelis" selected/);
  assert.match(context.buildInlineNameListEditor(entry.pages[2]), /value="laerelis" selected/);
  assert.match(context.buildScriptTableModuleEditorFields(entry.pages[3]), /value="laerelis" selected/);
});

test('Lichtfluss preserves plaintext and non-Laerelis scripts while rendering each digraph as one glyph', () => {
  const context = languageContext();
  const input = 'Th DH sh nG ae 42 & < > 😀';
  const shown = context.getLanguageScriptDisplayText(input, 'laerelis');
  assert.equal(shown, '\ue109 \ue118 \ue10d \ue10c \ue10f\ue112 42 & < > 😀');
  assert.equal(context.getLanguageScriptDisplayText(shown, 'laerelis'), shown);
  assert.equal(context.getLanguageScriptDisplayText(input, 'plain'), input);
  assert.equal(context.getLanguageScriptDisplayText('ᚁᚙ', 'ogham'), 'ᚁᚙ');
  assert.equal(context.getLanguageScriptDisplayText('ᚁᚙ', 'laerelis'), '\ue100\ue118');
  assert.notEqual(context.getLanguageScriptDisplayText('t h', 'laerelis'), context.getLanguageScriptDisplayText('th', 'laerelis'));
  const bubble = context.buildCommentLanguageTextMarkup('Laerelis & <img src=x>', { language: 'laerelis' }, 'foreign');
  assert.match(bubble, /data-comment-language="laerelis"/);
  assert.match(bubble, /class="comment-language-plain">Laerelis &amp; &lt;img src=x&gt;/);
  assert(!bubble.includes('<img'));
});

test('both Laerelis scene assets have the requested 2:3 portrait format', () => {
  const entry = languageContext().createLaerelisLanguageEntry();
  for (const path of [entry.pages[0].image, entry.pages[1].language.alphabetLayers[0].image]) {
    const png = readFileSync(new URL(`../${path}`, import.meta.url));
    assert.equal(png.toString('ascii', 1, 4), 'PNG');
    assert.equal(png.readUInt32BE(16), 1024);
    assert.equal(png.readUInt32BE(20), 1536);
  }
  assert.equal(entry.pages[0].imageFit, 'contain');
});
