import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FJORDHEIM_REGISTRY_FOLDERS, FJORDHEIM_TERRITORIES } from '../assets/js/data/fjordheim-territorial-plan.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { createRegistryBrowserIndex, registryPathKey, resolveRegistryLocation, searchRegistry } from '../assets/js/modules/family-registry/registry-browser-model.js';
import { createRegistryBrowser } from '../assets/js/modules/family-registry/registry-browser-controller.js';
import { renderRegistryContent } from '../assets/js/modules/family-registry/registry-browser-view.js';

const inventory = JSON.parse(fs.readFileSync(new URL('../assets/data/source-inventories/fjordheim-2026-10-07.json', import.meta.url), 'utf8'));

test('Fjordheim remains navigable without creating any family records or changing existing placements', () => {
  const before = JSON.stringify(FAMILY_REGISTRY);
  const baseline = createRegistryBrowserIndex(FAMILY_REGISTRY);
  const index = createRegistryBrowserIndex(FAMILY_REGISTRY, FJORDHEIM_REGISTRY_FOLDERS);
  const fjordheim = resolveRegistryLocation(index, ['Fjordheim']);
  assert.deepEqual(fjordheim.path, ['Fjordheim']);
  assert.equal(fjordheim.children.length, 5);
  assert.equal(fjordheim.children.reduce((sum, region) => sum + region.children.length, 0), 16);
  assert.equal(fjordheim.totalCount, 0);
  assert.equal(index.families.size, baseline.families.size);
  assert.equal(index.root.totalCount, baseline.root.totalCount);
  for (const [key, node] of baseline.nodes) {
    assert.equal(index.nodes.get(key).totalCount, node.totalCount, key);
  }
  assert.equal(JSON.stringify(FAMILY_REGISTRY), before);
  for (const folder of FJORDHEIM_REGISTRY_FOLDERS) {
    const node = index.nodes.get(registryPathKey(folder.path));
    assert.equal(node.records.length, 0);
    assert.doesNotMatch(renderRegistryContent(index, node, '').html, /Stammbaum\.html/);
  }
});

test('every planned clan and seat is grounded in the supplied jarltum table; unknown Llyndor stays empty', () => {
  let count = 0;
  for (const territory of FJORDHEIM_TERRITORIES) {
    const source = inventory.sources.find(entry => entry.id === territory.slug);
    const row = number => source.rows.find(entry => entry.row === number).cells;
    for (const place of territory.places) {
      for (const clan of place.clans) {
        count++;
        const main = row(70).findIndex(cell => cell.text === clan.name);
        const column = main >= 0 ? main : row(74).findIndex(cell => cell.text === clan.name);
        assert.ok(column >= 0, clan.name);
        const sourceSeat = row(main >= 0 ? 68 : 72)[column].text.replace(/\s*\(.+\)$/, '');
        assert.equal(place.name, sourceSeat, clan.name);
        assert.equal('familyId' in clan, false);
        assert.equal('persons' in clan, false);
      }
    }
  }
  assert.equal(count, 15);
  const coast = FJORDHEIM_TERRITORIES.find(entry => entry.name === 'Kragenküste');
  assert.deepEqual(coast.places.find(place => place.name === 'Llyndor').clans, []);
  assert.equal(coast.places.find(place => place.name === 'Askarholm').clans[0].name, 'Valdruna');
});

test('clans and source variants find their planning locations without fake family search results', () => {
  const index = createRegistryBrowserIndex([], FJORDHEIM_REGISTRY_FOLDERS);
  for (const [query, seat] of [['Fjandr', 'Caer'], ['Ulf', 'Bergshamn'], ['Derwaskyr', 'Derwaskr'], ['Askerholm', 'Askarholm'], ['Skergardr', 'Skerdgardr'], ['Blómholr', 'Blomholr'], ['Talfronwyn', 'Talfjörn'], ['Fjordheim Vingar', 'Styrkr']]) {
    const result = searchRegistry(index, query);
    assert.ok(result.folders.some(node => node.name === seat), query);
    assert.equal(result.families.length, 0, query);
  }
  const caer = resolveRegistryLocation(index, ['Fjordheim', 'Drachenzunge', 'Caer']);
  const { html } = renderRegistryContent(index, caer, '');
  assert.ok(html.includes('Clan Fjargardr'));
  assert.ok(html.includes('Fjandr mit Sitz Fjargardr'));
  assert.ok(html.includes('klärungsbedürftig'));
});

test('planning content escapes source text and keeps clan cards noninteractive', () => {
  const index = createRegistryBrowserIndex([], [{ path: ['Test'], description: '<script>unsafe</script>', plannedHouses: [
    { name: '<b>Clan</b>', rankLabel: 'Rang & Stand', sourceNote: '<img onerror="unsafe">' }
  ] }]);
  const { html } = renderRegistryContent(index, resolveRegistryLocation(index, ['Test']), '');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;b&gt;Clan&lt;/b&gt;'));
  assert.ok(html.includes('Rang &amp; Stand'));
  assert.doesNotMatch(html, /<script>|<img onerror|Stammbaum\.html/);
});

test('published registry refresh retains prepared folders and counts real future families normally', () => {
  const elements = new Map();
  const listeners = new Map();
  const root = {
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, { innerHTML: '', textContent: '', value: '', addEventListener() {}, removeEventListener() {} });
      return elements.get(selector);
    },
    addEventListener: (event, handler) => listeners.set(event, handler),
    removeEventListener: event => listeners.delete(event)
  };
  const browserWindow = {
    location: { href: 'https://example.test/register.html?gebiet=Fjordheim&gebiet=Drachenzunge&gebiet=Styrkr' },
    matchMedia: () => ({ matches: false }), addEventListener() {}, removeEventListener() {}
  };
  const browser = createRegistryBrowser({ root, records: [], folderDefinitions: FJORDHEIM_REGISTRY_FOLDERS, browserWindow });
  const content = root.querySelector('[data-role="registry-content"]');
  assert.ok(content.innerHTML.includes('Clan Vingar'));
  browser.updateRecords([{ id: 'test-future-family', title: 'Test family', folderPath: ['Fjordheim', 'Drachenzunge', 'Styrkr'] }]);
  assert.equal(root.querySelector('#registry-count').textContent, '1');
  assert.ok(content.innerHTML.includes('Clan Vingar'));
  assert.ok(content.innerHTML.includes('Test family'));
  browser.updateRecords([]);
  assert.ok(content.innerHTML.includes('Clan Vingar'));
  assert.equal(root.querySelector('#registry-count').textContent, '0');
  browser.destroy();
  assert.equal(listeners.size, 0);
});

test('all six source snapshots retain their original bytes; local territory icon exists', () => {
  assert.equal(inventory.sources.length, 6);
  for (const source of inventory.sources) {
    const bytes = fs.readFileSync(new URL('../' + source.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.id);
  }
  const root = new URL('../', import.meta.url);
  for (const folder of FJORDHEIM_REGISTRY_FOLDERS.filter(entry => entry.icon)) {
    assert.ok(fs.existsSync(new URL(folder.icon, root)), folder.icon);
  }
});
