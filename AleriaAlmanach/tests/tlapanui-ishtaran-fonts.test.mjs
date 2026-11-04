import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { PROJECT_FONTS } from '../DokumentenWerkstatt/js/fonts/font-catalog.js';
import { ensureDocumentFont, exportFontCss } from '../DokumentenWerkstatt/js/fonts/document-fonts.js';
import { normalizeDocument, validateRecord } from '../DokumentenWerkstatt/js/document-schema.js';
import { noticeLanguageFonts, normalizeNoticeTypography } from '../../Anzeigetafeln/assets/js/typography/notice-font-catalog.mjs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const packages = [
  { id: 'tlapanui', family: 'Tavarua Bildschnitt', root: 'Tlapanui-Gesamtpaket-2.000', file: 'TavaruaBildschnitt-Regular', language: 'Nuatlapa' },
  { id: 'ishtaran', family: 'Ayluun Mondbogen', root: 'Ishtaran-Gesamtpaket-1.000', file: 'AyluunMondbogen-Regular', language: 'Tirghan', web: '../../Fonts/Ishtaran-Web-1.001/AyluunMondbogen-Regular.ttf' }
];

function loadScripts() {
  const context = vm.createContext({ normalizeCommentKind: value => value, escapeHtml: value => value, parseCommentMarkup: value => value });
  context.window = context;
  for (const file of ['language/language-script-registry.js', 'comments/comments-spell-fonts.js']) {
    vm.runInContext(read(`../modules/${file}`), context, { filename: file });
  }
  return context;
}

// Both delivered fonts use a Unicode BMP cmap (format 4); inspect real glyph IDs.
function coveredCharacters(bytes) {
  let cmap;
  for (let index = 0; index < bytes.readUInt16BE(4); index++) {
    const record = 12 + index * 16;
    if (bytes.toString('ascii', record, record + 4) === 'cmap') cmap = bytes.readUInt32BE(record + 8);
  }
  assert.ok(cmap, 'Font has a character map');
  let subtable;
  for (let index = 0; index < bytes.readUInt16BE(cmap + 2); index++) {
    const record = cmap + 4 + index * 8;
    const candidate = cmap + bytes.readUInt32BE(record + 4);
    if (bytes.readUInt16BE(candidate) === 4 && [0, 3].includes(bytes.readUInt16BE(record))) subtable = candidate;
  }
  assert.ok(subtable, 'Font has a Unicode format 4 character map');
  const count = bytes.readUInt16BE(subtable + 6) / 2;
  const ends = subtable + 14, starts = ends + count * 2 + 2;
  const deltas = starts + count * 2, offsets = deltas + count * 2;
  const covered = new Map();
  for (let segment = 0; segment < count; segment++) {
    const delta = bytes.readInt16BE(deltas + segment * 2), offset = bytes.readUInt16BE(offsets + segment * 2);
    const start = bytes.readUInt16BE(starts + segment * 2), end = bytes.readUInt16BE(ends + segment * 2);
    for (let codepoint = start; codepoint <= end && codepoint < 0xffff; codepoint++) {
      const glyph = offset ? bytes.readUInt16BE(offsets + segment * 2 + offset + (codepoint - start) * 2) : codepoint;
      if ((!offset || glyph) && ((glyph + delta) & 0xffff)) covered.set(codepoint, (glyph + delta) & 0xffff);
    }
  }
  return covered;
}

test('delivered font contours cover all vocabulary, names, syllables and German keyboard samples', () => {
  for (const item of packages) {
    const root = new URL(`../../Fonts/${item.root}/`, import.meta.url);
    for (const format of ['ttf', 'otf', 'woff', 'woff2']) assert.ok(existsSync(new URL(`Fonts/${item.file}.${format}`, root)));
    const covered = coveredCharacters(readFileSync(item.web ? new URL(item.web, import.meta.url) : new URL(`Fonts/${item.file}.ttf`, root)));
    const data = JSON.parse(readFileSync(new URL(`Daten/${item.language}_Sprachdaten_1.000.json`, root), 'utf8'));
    const samples = [
      ...data.woerter.map(word => word[item.language]), ...data.silben.map(syllable => syllable.Silbe),
      ...data.namen_maennlich.map(person => person.Name), ...data.namen_weiblich.map(person => person.Name),
      'ÄÖÜ äöü ß 0123456789 !?.,:;()[]{}+-*/=@&#%'
    ];
    for (const value of samples) for (const character of value) assert.ok(covered.has(character.codePointAt(0)), `${item.family}: ${value} (${character})`);
  }
});

test('the Ayluun web adaptation adds only the dotless-i alias and preserves all contours and metrics', () => {
  const source = readFileSync(new URL('../../Fonts/Ishtaran-Gesamtpaket-1.000/Fonts/AyluunMondbogen-Regular.ttf', import.meta.url));
  const adapted = readFileSync(new URL('../../Fonts/Ishtaran-Web-1.001/AyluunMondbogen-Regular.ttf', import.meta.url));
  const original = coveredCharacters(source), current = coveredCharacters(adapted);
  assert.equal(current.size, original.size + 1);
  assert.equal(current.get(0x0131), original.get(0x0069));
  for (const [codepoint, glyph] of original) assert.equal(current.get(codepoint), glyph);
  const tables = bytes => {
    const entries = new Map();
    for (let index = 0; index < bytes.readUInt16BE(4); index++) {
      const record = 12 + index * 16, offset = bytes.readUInt32BE(record + 8), length = bytes.readUInt32BE(record + 12);
      entries.set(bytes.toString('ascii', record, record + 4), bytes.subarray(offset, offset + length));
    }
    return entries;
  };
  const originalTables = tables(source), currentTables = tables(adapted);
  for (const [name, data] of originalTables) {
    // The font checksum in head necessarily changes with the extended cmap.
    if (name !== 'cmap' && name !== 'head') assert.deepEqual(currentTables.get(name), data, name);
  }
});

test('scene create/edit controls, readable text and notice serialization share both new script IDs', () => {
  const scripts = loadScripts();
  const languages = noticeLanguageFonts(scripts.AleriaLanguageScripts.entries);
  for (const item of packages) {
    const text = `${item.language}: Grüße aus Aleria!`;
    assert.equal(scripts.transliterateCommentLanguageText(text, item.id), text);
    assert.equal(scripts.getCommentLanguage({ language: item.id }), item.id);
    assert.equal(scripts.getCommentLanguage({ spellFont: item.id }), item.id);
    for (const kind of ['spell', 'foreign']) {
      const segment = JSON.parse(JSON.stringify({ id: 'one', kind, language: item.id, text }));
      assert.match(scripts.getCommentLanguageControls(segment), new RegExp(`value="${item.id}" selected`));
      assert.match(scripts.getCommentLanguageControls(segment, true), /set-edit-comment-segment-language/);
      assert.ok(scripts.buildCommentLanguageTextMarkup(text, segment, kind).includes(text));
      assert.match(scripts.getCommentLanguageBubbleAttributes(segment, kind), new RegExp(`data-comment-language="${item.id}"`));
    }
    const font = PROJECT_FONTS.find(font => font.family === item.family);
    assert.equal(languages.find(language => language.id === item.id)?.url, font.url);
    const style = { font: 'template', heading: 'inherit', script: item.id };
    assert.deepEqual(normalizeNoticeTypography(JSON.parse(JSON.stringify(style)), languages), style);
    const document = normalizeDocument({ title: 'Schriftprobe', font: `'${item.family}'`, pages: [`<p>${text}</p>`] });
    assert.equal(validateRecord({ id: document.slug, expectedRevision: 0, document }).document.font, document.font);
    assert.equal(document.pages[0], `<p>${text}</p>`);
  }
});

test('workshop loads both real webfonts and embeds their bytes in standalone HTML exports', async () => {
  const original = Object.fromEntries(['document', 'FontFace', 'fetch', 'FileReader'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const added = [];
  globalThis.document = { fonts: { add: face => added.push(face), delete() {} } };
  globalThis.FontFace = class {
    constructor(family, source) { this.family = family; this.source = source; }
    async load() { return this; }
  };
  globalThis.fetch = async url => ({ ok: true, blob: async () => new Blob([readFileSync(new URL(url))], { type: 'font/woff2' }) });
  globalThis.FileReader = class {
    async readAsDataURL(blob) {
      this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;
      this.onload();
    }
  };
  try {
    for (const item of packages) {
      const meta = normalizeDocument({ font: `'${item.family}'` });
      await ensureDocumentFont(meta);
      const font = PROJECT_FONTS.find(font => font.family === item.family);
      assert.equal(added.at(-1).source, `url("${font.url}")`);
      const css = await exportFontCss(meta);
      assert.ok(css.includes(`font-family:'${item.family}'`));
      assert.ok(css.includes(`base64,${readFileSync(new URL(font.url)).toString('base64')}`));
    }
  } finally {
    for (const [key, descriptor] of Object.entries(original)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
