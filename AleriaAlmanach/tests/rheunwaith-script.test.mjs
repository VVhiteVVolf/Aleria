import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const fontRoot = new URL('../../Fonts/Rheunwaith-Font-1.000/', import.meta.url);
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
function loadRheunwaith() {
  const context = vm.createContext({
    document: { addEventListener() {} },
    normalizeCommentKind: value => value,
    buildNav: () => '',
    getInlineCommentThreadForPage: () => null,
    sanitizeContentHtml: value => value
  });
  context.window = context;
  for (const source of [
    '../../Fonts/Rheunwaith-Font-1.000/rheunwaith.js',
    '../modules/language/language-script-display.js',
    '../modules/core/content-safety.js',
    '../modules/script-table/script-table-data.js',
    '../modules/script-table/script-table-renderer.js',
    '../modules/name-list/name-list-data.js',
    '../modules/name-list/name-list-renderer.js',
    '../modules/comments/comments-markup.js',
    '../modules/comments/comments-spell-fonts.js'
  ]) vm.runInContext(read(source), context, { filename: source });
  return context;
}

test('the supplied Rheunwaith files match every package checksum', () => {
  const checksums = JSON.parse(readFileSync(new URL('SHA256SUMS.json', fontRoot), 'utf8'));
  for (const [file, expected] of Object.entries(checksums)) {
    assert.equal(createHash('sha256').update(readFileSync(new URL(file, fontRoot))).digest('hex'), expected, file);
  }
});

test('the existing 30 rune names and inputs agree with the new canonical alphabet', () => {
  const context = loadRheunwaith();
  const rows = context.createRheunwaithScriptTableData().rows;
  assert.equal(rows.length, 30);
  rows.forEach((row, index) => {
    const rune = context.Rheunwaith.alphabet[index];
    assert.equal(row.name, rune.name);
    assert.equal(row.symbol, rune.token);
    assert.equal(context.Rheunwaith.encodeTokens([row.symbol]), rune.char);
  });
  assert.equal(context.Rheunwaith.encodeTokens(['T']), context.Rheunwaith.encodeTokens(['Th']));
});

test('legacy runes convert in order, while ordinary text and other languages remain intact', () => {
  const context = loadRheunwaith();
  const plain = 'Ch Ll Ng Rh Th Q ÄÖÜ äöü ßẞ Éé 25 € & <Text>\nU\u0308';
  const old = context.Rheunwaith.alphabet.map(rune => rune.legacyCharacter).join('');
  const current = context.Rheunwaith.alphabet.map(rune => rune.char).join('');
  assert.equal(context.transliterateCommentLanguageText(old + plain, 'rheunwaith'), current + plain);
  assert.equal(context.transliterateCommentLanguageText(current + plain, 'rheunwaith'), current + plain);
  assert.equal(context.transliterateCommentLanguageText(old + plain, 'infernal'), old + plain);
  assert.equal(context.Rheunwaith.findUnsupported(plain).length, 0);
  assert.deepEqual(Array.from(context.Rheunwaith.findUnsupported('☃')), ['☃']);
});

test('spell and foreign bubbles preserve escaped plaintext, formatting, colors and legacy font selection', () => {
  const context = loadRheunwaith();
  const text = '**Chwerw** grüßt Q & 25 €\n<script>alert(1)</script> 𐰛𐰙';
  for (const kind of ['spell', 'foreign']) {
    const source = { spellFont: 'rheunwaith', languageColor: '#123abc' };
    const before = JSON.stringify(source);
    const html = context.buildCommentLanguageTextMarkup(text, source, kind, 'rune-test');
    assert.match(html, /data-comment-language="rheunwaith"/);
    assert.match(html, /data-action="toggle-comment-language"/);
    assert.match(html, /aria-controls="rune-test-language-0"/);
    assert.ok(html.includes('<span class="c-b">Chwerw</span>'));
    assert.ok(html.includes(''));
    assert.ok(html.includes('𐰛𐰙'));
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(!html.includes('<script>'));
    assert.match(context.getCommentLanguageBubbleAttributes(source, kind), /--comment-language-color:#123abc/);
    for (const edit of [false, true]) {
      const controls = context.getCommentLanguageControls({ id: 'r', kind, ...source }, edit);
      assert.ok(controls.includes('value="rheunwaith" selected'));
      assert.ok(controls.includes('value="#123abc"'));
    }
    assert.equal(JSON.stringify(source), before);
  }
});

test('saved rune tables and name ornaments convert for display without changing saved data', () => {
  const context = loadRheunwaith();
  const data = context.createRheunwaithScriptTableData();
  data.rows[0].symbol = '𐰛𐰙';
  data.ornamentText = '𐰀𐰁';
  const before = JSON.stringify(data);
  const html = context.buildScriptTablePage({ scriptTable: data }, {}, 0, 1);
  assert.ok(html.includes(''));
  assert.ok(html.includes(''));
  assert.equal(JSON.stringify(data), before);
  assert.equal(context.getScriptTableDisplayText('𐰛𐰙', 'plain'), '𐰛𐰙');
  const names = context.buildNameListPage({ nameList: { ornamentText: '𐰛𐰙', ornamentStyle: 'rheunwaith', groups: [] } }, { title: 'Namen' }, 0, 1);
  assert.ok(names.includes(''));
});
