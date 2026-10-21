import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { NOTICE_MODULE_REFERENCES, moduleHref, moduleMentions, normalizeModuleHref } from '../assets/js/links/notice-module-links-model.mjs';

const base = 'https://aleria.test/Anzeigetafeln/tafel.html';
test('only safe local Almanach entry links survive normalization', () => {
  const expected = '/AleriaAlmanach/AleriaAlmanach.html?entry=lothaires-arkaneum';
  assert.equal(moduleHref('lothaires-arkaneum'), expected);
  assert.equal(normalizeModuleHref(expected, base), expected);
  assert.equal(normalizeModuleHref('../AleriaAlmanach/AleriaAlmanach?entry=lothaires-arkaneum&extra=ignored#x', base), expected);
  for (const url of ['javascript:alert(1)', 'data:text/html,bad', '//elsewhere.test/AleriaAlmanach/AleriaAlmanach.html?entry=x',
    '/other.html?entry=x', '/AleriaAlmanach/AleriaAlmanach.html?entry=%3Cscript%3E', '/AleriaAlmanach/AleriaAlmanach.html', '']) {
    assert.equal(normalizeModuleHref(url, base), '', url);
  }
});

test('mentions prefer complete names, preserve spelling and punctuation and reveal no unnamed lender', () => {
  const text = 'Lothaires Arkaneum, das Badehaus und Zum Kleinen Durst. Ein Geld- und Pfandverleiher; keine Arkaneumsware.';
  assert.deepEqual(moduleMentions(text).map(match => [match.text, match.id]), [
    ['Lothaires Arkaneum', 'lothaires-arkaneum'], ['Badehaus', 'gwynthor-badehaus-fontani'], ['Zum Kleinen Durst', 'gwynthor-zum-kleinen-durst'],
  ]);
  assert.equal(moduleMentions('Schwarzen Zitteraalen')[0].id, 'schwarze-zitteraale');
  assert.equal(moduleMentions('HALDOR TORVIK')[0].text, 'HALDOR TORVIK');
  assert.deepEqual(moduleMentions('Der Verleiher, das Haus und die Stadtwache.'), []);
});

test('all automatic destinations belong to existing canonical modules', () => {
  const sources = ['arkaneum/arkaneum-data.js', 'kleiner-durst/durst-data.js', 'gwynthor-heime/homes-data.js',
    'gwynthor-bathhouse/bathhouse-data.js', 'rote-klaue/klaue-data.js', 'schwarze-zitteraale/zitteraale-data.js']
    .map(file => readFileSync(new URL(`../../AleriaAlmanach/modules/${file}`, import.meta.url), 'utf8')).join('\n');
  for (const reference of NOTICE_MODULE_REFERENCES) assert.ok(sources.includes(`"id": "${reference.id}"`), reference.id);
});

test('archive entry links open only after startup, through existing navigation, without changing other state', () => {
  const source = readFileSync(new URL('../../AleriaAlmanach/modules/archive/archive-entry-links.js', import.meta.url), 'utf8');
  for (const [search, expected] of [['?entry=lothaires-arkaneum', ['lothaires-arkaneum']], ['', []]]) {
    let ready; const opened = [];
    const context = { window: { location: { search }, addEventListener: (event, callback, options) => {
      assert.equal(event, 'almanach:app-ready'); assert.equal(options.once, true); ready = callback;
    } }, URLSearchParams, openArchiveEntryById: id => opened.push(id) };
    vm.runInNewContext(source, context);
    assert.deepEqual(opened, []);
    ready(); assert.deepEqual(opened, expected);
  }
  const shell = readFileSync(new URL('../../AleriaAlmanach/AleriaAlmanach.html', import.meta.url), 'utf8');
  assert.ok(shell.indexOf('archive-entry-links.js') < shell.indexOf('src="./app.js'));
});
