import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
function loadArcane() {
  const context = vm.createContext({
    addEventListener() {}, document: { addEventListener() {} },
    escapeHtml: value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
    parseCommentMarkup: value => String(value ?? ''),
    normalizeCommentKind: value => value,
    buildNav: () => '',
    buildOrganicCommentsContinuation: () => '<aside>Comment form</aside>'
  });
  context.window = context;
  for (const path of [
    '../../Fonts/Arkanes-Alphabet/arcane.js',
    '../modules/script-table/script-table-data.js',
    '../modules/script-table/script-table-module-editor.js',
    '../modules/script-table/script-table-renderer.js',
    '../modules/language/language-data.js',
    '../modules/language/arcane-alphabet-entry.js',
    '../modules/comments/comments-routing.js',
    '../modules/comments/comments-spell-fonts.js',
    '../modules/module-editor/module-editor-cast-picker.js',
    '../modules/module-editor/module-editor-scene-blocks.js',
    '../modules/core/app-core.js'
  ]) vm.runInContext(read(path), context, { filename: path });
  return context;
}

test('the module reproduces all 33 canonical runes and keeps references without comments after serialization', () => {
  const context = loadArcane();
  const canonical = JSON.parse(read('../../Fonts/Arkanes-Alphabet/alphabet.json'));
  const entry = context.createArcaneAlphabetModuleEntry();
  assert.equal(entry.pages.length, 6);
  assert.equal(entry.appendCommentsPage, false);
  const tables = entry.pages.slice(2, 5);
  assert.deepEqual(Array.from(tables, page => page.scriptTable.rows.length), [11, 11, 11]);
  const runes = Array.isArray(canonical) ? canonical : canonical.alphabet;
  assert.equal(runes.length, 33);
  tables.flatMap(page => Array.from(page.scriptTable.rows)).forEach((row, index) => {
    const rune = runes[index];
    assert.equal(row.symbol, rune.char);
    assert.equal(row.name, rune.name);
    assert.equal(row.sound, `${rune.sound} · ${rune.token}`);
    assert.equal(row.meaning, `${rune.value} · ${rune.meaning}`);
  });
  for (const [index, page] of entry.pages.entries()) {
    const roundtrip = context.sanitizeModulePage(JSON.parse(JSON.stringify(context.sanitizeModulePage(page))));
    assert.equal(roundtrip.enableComments, index === 0);
    assert.equal(!!context.getInlineCommentThreadForPage(roundtrip, { ...entry, enablePageComments: true }, index), index === 0);
    if (page.scriptTablePage) {
      assert.equal(roundtrip.scriptTable.scriptStyle, 'arcane');
      assert.equal(roundtrip.scriptTable.rows[0].symbol, page.scriptTable.rows[0].symbol);
      const markup = context.buildScriptTablePage(roundtrip, entry, index, 6);
      assert.match(markup, /script-style-arcane/);
      assert.doesNotMatch(markup, /Comment form/);
    }
  }
  assert.equal(context.getInlineCommentThreadForPage(entry.pages[0], entry, 0).threadId, 'arkanes-alphabet::page:alte-zunge');
  assert.match(context.buildScriptTableStyleOptions('arcane'), /value="arcane" selected/);
  for (const image of [entry.image, entry.pages[1].language.alphabetLayers[0].image]) {
    assert(existsSync(new URL(`../${image}`, import.meta.url)), image);
  }
});

test('canonical token encoding distinguishes separate letters, digraphs, aliases and Farkael', () => {
  const context = loadArcane();
  const { encodeTokens } = context.AleriaArcana;
  assert.equal(encodeTokens(['F', 'C', '!']), '\uE005\uE002\uE01E');
  assert.equal(encodeTokens(['C', 'H']), '\uE002\uE007');
  assert.equal(encodeTokens(['cH']), '\uE014');
  assert.equal(encodeTokens(["'", '’', 'Æ', 'æ']), '\uE013\uE013\uE01F\uE01F');
  assert.throws(() => encodeTokens(['K']), /Unbekanntes Runentoken/);
  assert.equal(context.createArcaneAlphabetFormulaPage().scriptTable.rows[2].symbol, encodeTokens(['F', 'C', '!']));
});

test('spell and foreign bubbles preserve readable text and arcane selection in both editors and legacy data', () => {
  const context = loadArcane();
  const input = "R CH B · FC! · Æ ’ · J K Ä 123";
  assert.equal(context.transliterateCommentLanguageText(input, 'arcane'), input);
  assert.equal(context.getCommentLanguage({ spellFont: 'arcane' }), 'arcane');
  for (const kind of ['spell', 'foreign']) {
    const segment = { id: 'runes', kind, language: 'arcane', languageColor: '#254338' };
    for (const edit of [false, true]) {
      const controls = context.getCommentLanguageControls(segment, edit);
      assert.match(controls, /value="arcane" selected/);
      assert(controls.includes(edit ? 'set-edit-comment-segment-language' : 'set-comment-segment-language'));
    }
    const attrs = context.getCommentLanguageBubbleAttributes(segment, kind);
    assert.match(attrs, /data-comment-language="arcane"/);
    assert.match(attrs, /--comment-language-color:#254338/);
    const markup = context.buildCommentLanguageTextMarkup(input, segment, kind);
    assert.match(markup, /data-action="toggle-comment-language"/);
    assert(markup.includes(`<span id="comment-language-0" class="comment-language-plain">${input}</span>`));
  }
});
