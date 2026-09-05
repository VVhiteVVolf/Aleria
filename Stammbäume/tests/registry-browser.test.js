import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegistryBrowserIndex, groupRegistryFamilies, registryPathKey, resolveRegistryLocation, searchRegistry } from '../assets/js/modules/family-registry/registry-browser-model.js';
import { renderRegistryContent, renderRegistryNavigation } from '../assets/js/modules/family-registry/registry-browser-view.js';

const record = (id, path, extra = {}) => ({ id, title: `Haus ${id}`, folderPath: path, rankId: 'commoner', ...extra });
const records = [
  record('Bradrhith', ['Cenyr', 'Gwynthor', 'Bradrhith Hof'], { houseProfile: { liegeHouseName: 'Haus Awenydd' } }),
  record('Draig', ['Cenyr', 'Gwynthor'], { rankId: 'county', additionalPlacements: [
    { folderPath: ['Cenyr', 'Gwynthor', 'Bradrhith Hof'] }, { folderPath: ['Aldrimar', 'Ährental'] }
  ] }),
  record('hidden', ['Versteckt'], { listing: 'linked-only' }),
  record('Ungeordnet', [])
];

test('counts unique houses and preserves multiple locations without hidden records', () => {
  const index = createRegistryBrowserIndex([...records, records[0]]);
  assert.equal(index.root.totalCount, 3);
  assert.equal(index.families.get('Draig').placements.length, 3);
  assert.deepEqual(index.families.get('Draig').record.folderPath, ['Cenyr', 'Gwynthor']);
  const gwynthor = resolveRegistryLocation(index, ['Cenyr', 'Gwynthor']);
  assert.equal(gwynthor.directCount, 1);
  assert.equal(gwynthor.totalCount, 2);
  assert.equal(index.nodes.has(registryPathKey(['Versteckt'])), false);
  assert.equal(resolveRegistryLocation(index, ['Nicht einsortiert']).directCount, 1);
});

test('multiword search finds alternate locations, rank and liege; handles accents and empty searches', () => {
  const index = createRegistryBrowserIndex(records);
  assert.deepEqual(searchRegistry(index, 'Draig Ahrental').families.map(entry => entry.record.id), ['Draig']);
  assert.deepEqual(searchRegistry(index, 'Bradrhith Awenydd').families.map(entry => entry.record.id), ['Bradrhith']);
  assert.equal(searchRegistry(index, 'nicht vorhanden').families.length, 0);
  assert.deepEqual(searchRegistry(index, '  '), { families: [], folders: [] });
  assert.equal(searchRegistry(index, 'Gwynthor').families.length, 2);
});

test('path identity handles slashes and falls back to nearest surviving parent after updates', () => {
  const index = createRegistryBrowserIndex([record('a', ['A/B']), record('b', ['A', 'B'])]);
  assert.notEqual(registryPathKey(['A/B']), registryPathKey(['A', 'B']));
  assert.deepEqual(resolveRegistryLocation(index, ['A', 'B', 'missing']).path, ['A', 'B']);
  assert.equal(resolveRegistryLocation(index, ['missing']).key, '[]');
});

test('groups direct houses by the existing rank order instead of creating geographical rank folders', () => {
  const index = createRegistryBrowserIndex(records);
  const groups = groupRegistryFamilies([...index.families.values()]);
  assert.deepEqual(groups.map(group => group.rank.id), ['county', 'commoner']);
  assert.equal(index.nodes.has(registryPathKey(['Cenyr', 'Gwynthor', 'Grafenhaus'])), false);
});

test('search renders full clickable placement paths and escapes imported labels', () => {
  const index = createRegistryBrowserIndex([record('<script>alert(1)</script>', ['Land "A"', 'Ort & Hof'])]);
  const { html } = renderRegistryContent(index, index.root, 'alert');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('Land &quot;A&quot; › Ort &amp; Hof'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('onclick='));
  assert.ok(html.includes('data-action="select-region"'));
});

test('navigation exposes expanded branches and selected location independently of search', () => {
  const index = createRegistryBrowserIndex(records);
  const node = resolveRegistryLocation(index, ['Cenyr', 'Gwynthor']);
  const html = renderRegistryNavigation(index, node.key, new Set(['["Cenyr"]']));
  assert.ok(html.includes('aria-expanded="true"'));
  assert.ok(html.includes('aria-current="location"'));
  const result = renderRegistryContent(index, node, '');
  assert.ok(result.status.includes('2 Häuser im Gebiet · 1 direkt hier · 1 weitere in Unterorten'));
  assert.ok(result.html.includes('Bradrhith Hof'));
  assert.ok(result.html.includes('Häuser in Gwynthor'));
});
