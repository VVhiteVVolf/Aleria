import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';
import { buildMorgarReference, loadMorgarReference } from '../modules/language/morgar/morgar-build.mjs';
import { PROJECT_FONTS } from '../DokumentenWerkstatt/js/fonts/font-catalog.js';

const fontRoot = new URL('../../Fonts/Karnrith-Font-2.000/', import.meta.url);
function loadKarnrith() {
  const context = vm.createContext({
    document: { addEventListener() {} }, normalizeCommentKind: value => value,
    getTrimmedFormValue: (block, selector) => (block.querySelector(selector)?.value || '').trim(),
    buildNav: () => '', getInlineCommentThreadForPage: () => null
  });
  context.window = context;
  for (const file of [
    '../../Fonts/Karnrith-Font-2.000/karnrith.js', '../../Fonts/Rheunwaith-Font-1.000/rheunwaith.js',
    '../modules/language/language-script-display.js', '../modules/core/content-safety.js',
    '../modules/name-list/name-list-data.js', '../modules/name-list/name-list-renderer.js',
    '../modules/script-table/script-table-data.js', '../modules/script-table/script-table-renderer.js',
    '../modules/script-table/script-table-module-editor.js',
    '../modules/language/morgar/morgar-data.js', '../modules/language/morgar/morgar-tables.js',
    '../modules/language/morgar/morgar-entry.js', '../modules/comments/comments-markup.js',
    '../modules/comments/comments-spell-fonts.js'
  ]) vm.runInContext(readFileSync(new URL(file, import.meta.url), 'utf8'), context, { filename: file });
  return context;
}

test('Karnrith package checksums and generated Morgar source agree', async () => {
  for (const [file, hash] of Object.entries(JSON.parse(readFileSync(new URL('SHA256SUMS.json', fontRoot), 'utf8')))) {
    assert.equal(createHash('sha256').update(readFileSync(new URL(file, fontRoot))).digest('hex'), hash, file);
  }
  await buildMorgarReference({ check: true });
});

test('Morgar 2.0 preserves its full spoken vocabulary and all 1,100 names through sanitization', async () => {
  const source = await loadMorgarReference();
  const context = loadKarnrith();
  const entry = context.createMorgarLanguageEntry();
  assert.equal(entry.pages.length, 5);
  assert.equal(entry.pages[1].language.alphabetLayers.filter(layer => layer.image).length, 3);
  const table = entry.pages[3].scriptTable;
  assert.equal(table.rows.length, 30);
  table.rows.forEach((row, index) => {
    const rune = context.Karnrith.alphabet[index];
    assert.equal(row.symbol, rune.token);
    assert.equal(row.name, rune.name);
  });
  assert.equal(table.syllables.length, 72);
  assert.deepEqual(JSON.parse(JSON.stringify(table.syllables)), source.syllables);
  const groups = entry.pages[2].nameList.groups;
  assert.deepEqual(Array.from(groups, group => group.names.length), [500, 500, 100]);
  groups.forEach((group, index) => {
    assert.deepEqual(Array.from(group.names), source.names[index].names);
    assert.deepEqual(Array.from(group.names), Array.from(group.names).sort((a, b) => a.localeCompare(b, 'de', { sensitivity: 'base' })));
    assert.equal(new Set(group.names.map(name => name[0])).size, 26);
    group.names.forEach(name => assert.equal(context.Karnrith.findUnsupported(name).length, 0, name));
  });
  assert.equal(new Set(groups.flatMap(group => group.names)).size, 1100);
  const rows = entry.pages[4].scriptTable.rows;
  assert.equal(rows.length, 371);
  rows.forEach((row, index) => {
    const word = source.words[index];
    assert.equal(row.symbol, word.word);
    assert.equal(row.name, word.meaning);
    assert.equal(row.sound.toLowerCase(), word.syllables);
    assert.ok(row.meaning.includes(word.category));
    assert.ok(row.meaning.includes(word.usage));
    assert.equal(context.Karnrith.findUnsupported(word.word).length, 0, word.word);
  });
  const restored = context.sanitizeScriptTableData(JSON.parse(JSON.stringify(entry.pages[4].scriptTable)));
  assert.deepEqual(JSON.parse(JSON.stringify(restored)), JSON.parse(JSON.stringify(entry.pages[4].scriptTable)));
  const legacyWords = new Set(context.Karnrith.words.map(item => item.new.toLowerCase()));
  assert.ok(source.words.filter(word => !legacyWords.has(word.word)).length > 330);
  for (const [word, meaning] of [['darak', 'König oder Königin'], ['baran', 'Vasall'], ['garum', 'Heer'], ['bera', 'Brot']]) {
    assert.equal(source.words.find(item => item.word === word)?.meaning, meaning);
  }
});

test('overlapping legacy codes convert only when Karnrith is explicitly selected', () => {
  const context = loadKarnrith();
  const old = context.Karnrith.alphabet.map(rune => rune.legacyCharacter).join('');
  const current = context.Karnrith.alphabet.map(rune => rune.char).join('');
  for (const language of ['rheunwaith', 'plain', 'infernal', 'arcane']) {
    assert.equal(context.getLanguageScriptDisplayText(old, language), old, language);
  }
  assert.equal(context.getLanguageScriptDisplayText(old, 'karnrith'), current);
  assert.equal(context.getLanguageScriptDisplayText(current, 'karnrith'), current);
  const text = 'Úrortharn C J X ÄÖÜ ßẞ NG TH KH GH SH CH DH & 25 €\nU\u0308';
  assert.equal(context.getLanguageScriptDisplayText(text, 'karnrith'), text);
  assert.equal(context.Karnrith.findUnsupported(text).length, 0);
  assert.notEqual(context.Karnrith.encodeTokens(['T']), context.Karnrith.encodeTokens(['TH']));
  assert.throws(() => context.Karnrith.encodeTokens(['C']));
});

test('editing the dictionary preserves all words and its specialized column headings', () => {
  const context = loadKarnrith();
  const page = context.createMorgarLexiconPage();
  const before = JSON.parse(JSON.stringify(page.scriptTable));
  const fields = {
    archive: before.archiveLabel, title: before.title, subtitle: before.subtitle,
    ornament: before.ornamentText, style: before.scriptStyle,
    rows: context.formatScriptTableRows(before.rows),
    'syllables-title': before.syllablesTitle, 'syllables-subtitle': before.syllablesSubtitle,
    syllables: '', footer: before.footer
  };
  const block = { querySelector: selector => ({ value: fields[selector.replace('.me-script-table-', '')] || '' }) };
  context.collectScriptTableModuleEditorPage({ querySelector: () => block }, page);
  assert.deepEqual(JSON.parse(JSON.stringify(page.scriptTable)), before);
});

test('Karnrith bubbles, tables and ornaments keep saved text and safe plaintext intact', () => {
  const context = loadKarnrith();
  const text = '**Úrortharn**  <script>alert(1)</script>';
  for (const kind of ['spell', 'foreign']) {
    const segment = { id: 'karnrith', kind, spellFont: 'karnrith', text, languageColor: '#71542d' };
    const before = JSON.stringify(segment);
    const html = context.buildCommentLanguageTextMarkup(text, segment, kind, 'test');
    assert.ok(html.includes(''));
    assert.ok(html.includes(''));
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('<span class="c-b">Úrortharn</span>'));
    for (const edit of [false, true]) assert.ok(context.getCommentLanguageControls(segment, edit).includes('value="karnrith" selected'));
    assert.equal(JSON.stringify(segment), before);
  }
  assert.equal(context.getScriptTableDisplayText('', 'karnrith'), '');
  const data = context.createKarnrithScriptTableData();
  data.rows[0].symbol = '';
  const before = JSON.stringify(data);
  assert.ok(context.buildScriptTablePage({ scriptTable: data }, {}, 0, 1).includes(''));
  assert.equal(JSON.stringify(data), before);
  const names = { ornamentText: '', ornamentStyle: 'karnrith', introduction: '', groups: [] };
  assert.ok(context.buildNameListPage({ nameList: names }, { title: 'Namen' }, 0, 1).includes(''));
});

test('existing workshop font selections resolve to the new versioned WOFF2', () => {
  const font = PROJECT_FONTS.find(font => font.family === 'Karnrith Hochschnitt');
  assert.match(font.url, /fonts\/KarnrithTiefenrunen-Regular\.woff2\?v=3$/);
  assert.equal(readFileSync(new URL(font.url)).subarray(0, 4).toString(), 'wOF2');
});
