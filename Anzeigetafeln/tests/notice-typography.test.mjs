import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { NOTICE_HANDWRITING, normalizeNoticeTypography, noticeLanguageFonts } from '../assets/js/typography/notice-font-catalog.mjs';

const context = { window: {}, getLanguageScriptDisplayText: value => value };
vm.runInNewContext(readFileSync(new URL('../../AleriaAlmanach/modules/language/language-script-registry.js', import.meta.url), 'utf8'), context);
const scripts = context.window.AleriaLanguageScripts;
const languages = noticeLanguageFonts(scripts.entries);

test('seven real local handwriting fonts and all twelve canonical language scripts are available', () => {
  assert.equal(NOTICE_HANDWRITING.length, 7);
  assert.equal(languages.length, 12);
  for (const font of [...NOTICE_HANDWRITING, ...languages]) {
    assert.ok(existsSync(new URL(font.url)), font.family);
    for (const dependency of font.dependencies || []) assert.ok(existsSync(new URL(dependency)), dependency);
  }
  assert.ok(NOTICE_HANDWRITING.some(font => font.id === 'monsieurladoulaise'));
});

test('font settings use safe IDs with independent title, handwriting and script choices', () => {
  const settings = { font: 'caveat', heading: 'dancingscript', script: 'rheunwaith' };
  assert.deepEqual(normalizeNoticeTypography(settings, languages), settings);
  assert.deepEqual(normalizeNoticeTypography({ font: 'url(javascript:bad)', heading: 'unknown', script: '<script>' }, languages), { font: 'template', heading: 'inherit', script: 'common' });
  const roundtrip = JSON.parse(JSON.stringify({ zettel: [{ id: 'one', typography: settings, text: '<p>Grüße aus Gwynthor!</p>' }] }));
  assert.deepEqual(roundtrip.zettel[0].typography, settings);
  assert.equal(roundtrip.zettel[0].text, '<p>Grüße aus Gwynthor!</p>');
});

test('notices and scene comments use the same display-only script converter', () => {
  const original = 'Shalom aus Gwynthor';
  assert.notEqual(scripts.display(original, 'kanaanith'), original);
  assert.notEqual(scripts.display(original, 'runic'), original);
  assert.notEqual(scripts.display(original, 'ogham'), original);
  assert.equal(scripts.display(original, 'unknown'), original);
  const comments = readFileSync(new URL('../../AleriaAlmanach/modules/comments/comments-spell-fonts.js', import.meta.url), 'utf8');
  assert.match(comments, /COMMENT_LANGUAGES = window\.AleriaLanguageScripts\.entries/);
});
