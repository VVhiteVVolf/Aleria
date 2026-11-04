import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { buildPackageLanguageReferences, loadPackageLanguageSource, PACKAGE_LANGUAGE_SOURCES } from '../modules/language/package-language-build.mjs';

const root = new URL('../', import.meta.url);
const clone = value => JSON.parse(JSON.stringify(value));

test('current province spelling overrides only the old Nuatlapa canonical label', async () => {
  const source = PACKAGE_LANGUAGE_SOURCES.find(entry => entry.id === 'tlapanui');
  const original = JSON.parse(readFileSync(new URL(`../../Fonts/${source.package}/Daten/Nuatlapa_Sprachdaten_1.000.json`, import.meta.url), 'utf8'));
  const { data } = await loadPackageLanguageSource(source);
  assert(original.kanon.some(([name]) => name === 'Silverant'));
  assert(data.kanon.some(([name]) => name === 'Sylvarant'));
  assert(!data.kanon.some(([name]) => name === 'Silverant'));
  for (const key of ['silben', 'woerter', 'namen_maennlich', 'namen_weiblich']) assert.deepEqual(data[key], original[key]);
});

function createLanguageContext() {
  const context = vm.createContext({
    console, crypto, TextEncoder, CustomEvent, setTimeout, clearTimeout,
    addEventListener() {}, dispatchEvent() {},
    document: { addEventListener() {}, querySelectorAll: () => [] },
    buildNav: () => '', getInlineCommentThreadForPage: () => null,
    inferModulePageType: page => page.nameListPage ? 'name-list' : 'script-table',
    getTrimmedFormValue: (block, selector) => (block.querySelector(selector)?.value || '').trim()
  });
  context.window = context;
  // Follow the actual HTML ordering, including reference factories needed by
  // sections.js, so registration and its dependencies are exercised together.
  const html = readFileSync(new URL('AleriaAlmanach.html', root), 'utf8');
  const needed = new Set([
    'modules/name-list/name-list-data.js', 'modules/script-table/script-table-data.js',
    'modules/language/language-reference-entries.js', 'modules/language/arcane-alphabet-entry.js',
    'modules/religion/nimuiten/nimuiten-entry.js', 'modules/religion/gruener-bund/gruener-bund-entry.js',
    'modules/piracy/piracy-entries.js', 'data/sections.js'
  ]);
  for (const match of html.matchAll(/<script\s+src="([^"?]+)(?:\?[^" ]*)?"[^>]*>/g)) {
    const source = match[1].replace(/^\.\//, '');
    if (needed.has(source) || source.startsWith('modules/language/')
        || /^\.\.\/Fonts\/.*\.js$/.test(source)) {
      vm.runInContext(readFileSync(new URL(source, root), 'utf8'), context, { filename: source });
    }
    if (source === 'data/sections.js') break;
  }
  for (const source of ['modules/core/content-safety.js', 'modules/language/language-data.js',
    'modules/name-list/name-list-renderer.js', 'modules/name-list/name-list-module-editor.js',
    'modules/name-list/name-list-inline-editor.js', 'modules/script-table/script-table-renderer.js',
    'modules/script-table/script-table-module-editor.js', 'modules/core/app-core.js',
    'modules/module-editor/module-editor-cast-picker.js']) {
    vm.runInContext(readFileSync(new URL(source, root), 'utf8'), context, { filename: source });
  }
  return context;
}

test('both language modules register in Sprachen and retain every supplied corpus record', async () => {
  await buildPackageLanguageReferences({ check: true });
  const context = createLanguageContext();
  const section = vm.runInContext('SECTIONS.find(section => section.key === "Sprachen")', context);
  for (const source of PACKAGE_LANGUAGE_SOURCES) {
    const { data } = await loadPackageLanguageSource(source);
    const entry = section.entries.find(entry => entry.id === source.id);
    assert(entry, `${source.id} is absent from the existing language category`);
    assert.equal(entry.pages.length, 5);
    assert.deepEqual(Array.from(entry.pages, page => page.languagePage ? 'language' : page.nameListPage ? 'name-list' : page.scriptTablePage ? 'script-table' : 'story'),
      ['story', 'language', 'name-list', 'script-table', 'script-table']);
    assert.equal(entry.pages[0].stats.length, 6);
    assert.equal(context.sanitizeLanguageData(entry.pages[1].language).sections.length, entry.pages[1].language.sections.length);
    const names = entry.pages[2].nameList;
    assert.equal(names.ornamentStyle, source.id);
    for (const [index, key] of ['namen_maennlich', 'namen_weiblich'].entries()) {
      assert.equal(names.groups[index].names.length, 500);
      assert.deepEqual(new Set(names.groups[index].names), new Set(data[key].map(item => item.Name)));
    }
    const table = entry.pages[3].scriptTable;
    assert.equal(table.scriptStyle, source.id);
    assert.equal(table.syllables.length, 200);
    assert.deepEqual(Array.from(table.syllables, item => item.syllable), data.silben.map(item => `${item.Silbe} · ${item.Nr}`));
    const dictionary = entry.pages[4].scriptTable.rows;
    assert.equal(dictionary.length, 1000);
    assert.deepEqual(new Set(dictionary.map(item => item.symbol)), new Set(data.woerter.map(item => item[source.language])));
    assert(dictionary.every(item => item.name && item.sound && item.meaning && !item.meaning.includes('undefined')));
    assert(existsSync(new URL(entry.image, root)));
    assert(existsSync(new URL(entry.pages[1].language.alphabetLayers[0].image, root)));
    const normalized = context.sanitizeModuleEntry(clone(entry));
    assert.equal(normalized.pages[4].scriptTable.rows.length, 1000);
    assert.equal(normalized.pages[3].scriptTable.scriptStyle, source.id);
    assert.equal(normalized.pages[2].nameList.groups[1].names.length, 500);
    assert.deepEqual(clone(context.sanitizeModuleEntry(normalized)), clone(normalized));
  }
});

test('script/name editors retain selected fonts and safely roundtrip the real keyboard and complete dictionary', () => {
  const context = createLanguageContext();
  for (const entry of [context.createTlapanuiLanguageEntry(), context.createIshtaranLanguageEntry()]) {
    const names = entry.pages[2];
    assert.match(context.buildNameListModuleEditorFields(names), new RegExp(`value="${entry.id}" selected`));
    assert.match(context.buildInlineNameListEditor(names), new RegExp(`value="${entry.id}" selected`));
    for (const page of [entry.pages[3], entry.pages[4]]) {
      const table = page.scriptTable;
      assert.deepEqual(clone(context.sanitizeScriptTableRows(context.parseScriptTableRows(context.formatScriptTableRows(table.rows)))), clone(table.rows));
      assert.deepEqual(clone(context.sanitizeScriptTableSyllables(context.parseScriptTableSyllables(context.formatScriptTableSyllables(table.syllables)))), clone(table.syllables));
    }
    assert.match(context.buildScriptTableModuleEditorFields(entry.pages[3]), new RegExp(`value="${entry.id}" selected`));
    assert(entry.pages[3].scriptTable.rows.some(row => row.symbol === '|'));
    assert(entry.pages[3].scriptTable.rows.some(row => row.symbol === '\\'));
    const markup = context.buildScriptTableMainTable(entry.pages[3].scriptTable);
    assert(markup.includes(`script-style-${entry.id}`));
  }
});

test('escaped pipes and backslashes roundtrip in every table field while simple legacy input remains readable', () => {
  const context = createLanguageContext();
  const rows = [{ symbol: '|', name: '\\|', sound: 'a|b\\c', meaning: 'Welle | Stufe \\ Ende' }];
  const syllables = [{ syllable: '\\|', meaning: 'a|b', usage: 'x\\y | z' }];
  assert.deepEqual(clone(context.parseScriptTableRows(context.formatScriptTableRows(rows))), rows);
  assert.deepEqual(clone(context.parseScriptTableSyllables(context.formatScriptTableSyllables(syllables))), syllables);
  assert.deepEqual(clone(context.parseScriptTableRows('A | Abael | A | Wasser | Ursprung')),
    [{ symbol: 'A', name: 'Abael', sound: 'A', meaning: 'Wasser | Ursprung' }]);
  assert.deepEqual(clone(context.parseScriptTableSyllables('ar | Mensch | Grundwurzel')),
    [{ syllable: 'ar', meaning: 'Mensch', usage: 'Grundwurzel' }]);
  assert.deepEqual(Array.from(context.parseScriptTableCells('a\\q | b')), ['a\\q', 'b']);
});
