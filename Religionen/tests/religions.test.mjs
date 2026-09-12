import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import { RELIGION_ROOT, readReligionCatalog, validateCatalog, validateLocalPath, entryPagePath, relatedEntries, getReligionPageInputs, entrySearchText } from '../modules/content/content-repository.mjs';
import { escapeHtml } from '../modules/content/content-html.mjs';
import { renderCatalog } from '../modules/catalog/catalog-template.mjs';
import { renderReligionEntry } from '../modules/content/page-template.mjs';
import { rootCatalogEntries } from '../modules/catalog/catalog-register-template.mjs';
import { filterEntries, normalizeSearch, sortEntries, readCatalogState, writeCatalogState } from '../modules/catalog/catalog-model.mjs';

const catalog = readReligionCatalog();
const workspace = resolve(RELIGION_ROOT, '..');
const searchable = rootCatalogEntries(catalog).map((entry, order) => ({ ...entry, order, searchText: entrySearchText(entry) }));

test('preserves all named legacy entries and prepares empty future chapters', () => {
  assert.equal(catalog.entries.length, 54);
  assert.equal(catalog.chapters.length, 7);
  assert.equal(catalog.entries.filter(entry => entry.chapterId === 'religionen').length, 10);
  assert.equal(catalog.entries.filter(entry => entry.page).length, 48);
  for (const title of ['Die Celestische Synode', 'Manât', 'Der Phalantische Bund', 'Der Zirkel des Ewigen Waldes', 'Die Offenbarung der Schwarzen Sonne']) {
    assert(catalog.entries.some(entry => entry.title === title));
  }
  assert.equal(catalog.chapters.find(chapter => chapter.id === 'kulte').entries.length, 0);
  assert.equal(catalog.chapters.find(chapter => chapter.id === 'weltanschauungen').entries.length, 0);
  assert(!JSON.stringify(catalog).includes('animexx'));
});

test('search combines words, matches tags and accepts German/diacritic variants', () => {
  assert.equal(normalizeSearch('GÖTTLICHE'), normalizeSearch('goettliche'));
  assert.deepEqual(filterEntries(searchable, { query: 'MANAT risse' }).map(entry => entry.id), ['manat']);
  assert.deepEqual(filterEntries(searchable, { query: 'neun goettliche' }).map(entry => entry.id), ['neun-goettliche', 'alerische-kirche', 'alter-pantheon', 'celestische-synode']);
  assert.deepEqual(filterEntries(searchable, { query: 'SONNE MOND', chapterId: 'religionen' }).map(entry => entry.id), ['harmonie-von-mond-und-sonne']);
  assert.equal(filterEntries(searchable, { query: 'Morgath', chapterId: 'religionen' }).length, 0);
  assert.equal(filterEntries(searchable, { query: 'nichtimregister' }).length, 0);
  assert.equal(filterEntries(searchable, { query: '  ' }).length, 18);
});

test('sorts German titles without leading articles and leaves source data intact', () => {
  const original = [...searchable];
  const az = sortEntries(searchable, 'az');
  const za = sortEntries(searchable, 'za');
  assert.deepEqual(az.map(entry => entry.id), za.map(entry => entry.id).reverse());
  assert.equal(az[0].id, 'alerische-kirche');
  assert.deepEqual(searchable, original);
  assert.deepEqual(sortEntries(az, 'register'), original);
});

test('URL state round trips safely and falls back for invalid filters', () => {
  const chapterIds = catalog.chapters.map(chapter => chapter.id);
  const state = { query: 'Manât & Risse', chapterId: 'neutrale', sort: 'za' };
  const url = writeCatalogState('https://example.test/Religionen/index.html?ref=almanach#neutrale', state);
  assert.deepEqual(readCatalogState(url, chapterIds), state);
  assert.equal(url.searchParams.get('ref'), 'almanach');
  assert.equal(url.hash, '#neutrale');
  assert.deepEqual(readCatalogState(new URL('https://example.test/?kapitel=unbekannt&sort=invalid'), chapterIds), { query: '', chapterId: 'all', sort: 'register' });
  const reset = writeCatalogState(url, { query: '', chapterId: 'all', sort: 'register' });
  assert.equal(reset.search, '?ref=almanach');
  assert.equal(readCatalogState(new URL(`https://example.test/?q=${'x'.repeat(500)}`), chapterIds).query.length, 200);
});

test('rejects unsafe paths, duplicate IDs and broken relationships', () => {
  for (const path of ['../escape', '/absolute', 'https://bad.test', 'entry/../escape', 'entry\\escape', 'entry/%2e%2e/file', 'entry/file?foo=bar']) {
    assert.throws(() => validateLocalPath(path));
  }
  const duplicate = structuredClone(catalog);
  duplicate.entries.push(duplicate.entries[0]);
  assert.throws(() => validateCatalog(duplicate), /doppelte/);
  const broken = structuredClone(catalog);
  broken.entries[0].relations.push('missing-god');
  assert.throws(() => validateCatalog(broken), /Beziehung/);
  const badTarget = structuredClone(catalog);
  badTarget.entries[0].canonicalHref = 'Bestiarium/index.html';
  assert.throws(() => validateCatalog(badTarget), /Seitenziel/);
});

test('future deities can belong to multiple religions with automatic reverse links', () => {
  const future = structuredClone(catalog);
  future.entries.push({ ...structuredClone(catalog.entries[0]), id: 'test-gottheit', title: 'Testgottheit', kind: 'Gottheit', sourcePath: 'gottheiten/goettliche/test-gottheit/eintrag.json', relations: ['alerische-kirche', 'alter-pantheon', 'neun-goettliche'] });
  validateCatalog(future);
  const deity = future.entries.at(-1);
  assert.equal(relatedEntries(future, deity).length, 3);
  for (const id of deity.relations) assert(relatedEntries(future, future.entries.find(entry => entry.id === id)).some(entry => entry.id === deity.id));
});

test('all generated pages are current, escaped, independently readable and locally linked', () => {
  const pages = [['Religionen/index.html', renderCatalog(catalog)], ...catalog.entries.filter(entry => entry.page).map(entry => [entryPagePath(entry), renderReligionEntry(catalog, entry)])];
  for (const [path, html] of pages) {
    assert.equal(readFileSync(resolve(workspace, path), 'utf8').replace(/\r\n/g, '\n'), html, path);
    assert(!/\son(?:click|change|input|error)=/.test(html), path);
    assert(!/animexx|https?:\/\/i\.imgur/.test(html), path);
    assert.match(html, /<main id="inhalt"/);
    for (const match of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
      const target = match[1].split(/[?#]/)[0].replace(/&amp;/g, '&');
      assert(existsSync(resolve(workspace, dirname(path), target)), `${path}: ${target}`);
    }
  }
  const hostile = structuredClone(catalog.entries.find(entry => entry.id === 'alerische-kirche'));
  hostile.title = '<script>alert("x")</script>';
  const html = renderReligionEntry(catalog, hostile);
  assert(!html.includes(hostile.title));
  assert(html.includes('&lt;script&gt;'));
});

test('Vite and the Almanach register resolve the new generated pages', () => {
  const inputs = getReligionPageInputs();
  assert.equal(Object.keys(inputs).length, 50);
  for (const value of Object.values(inputs)) assert(existsSync(value), value);
  const source = readFileSync(resolve(workspace, 'AleriaAlmanach/modules/sidebar/sidebar-registers.js'), 'utf8');
  const html = vm.runInNewContext(`${source}\nbuildAlmanachLeftRegisterItem(ALMANACH_LEFT_REGISTER_ITEMS.find(item => item.key === 'religion'))`, { document: { querySelector: () => null }, escapeHtml });
  assert.match(html, /href="\.\.\/Religionen\/index.html"/);
  assert(!html.includes('aria-disabled'));
  const shell = readFileSync(resolve(workspace, 'AleriaAlmanach/AleriaAlmanach.html'), 'utf8');
  assert.match(shell, /sidebar-registers\.js\?v=[^"\s]+/);
});
