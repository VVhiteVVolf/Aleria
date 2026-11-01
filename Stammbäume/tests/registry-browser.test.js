import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegistryBrowserIndex, groupRegistryFamilies, registryPathKey, resolveRegistryLocation, searchRegistry } from '../assets/js/modules/family-registry/registry-browser-model.js';
import { renderRegistryContent, renderRegistryNavigation } from '../assets/js/modules/family-registry/registry-browser-view.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { FAMILY_REGISTRY_FOLDERS } from '../assets/js/data/family-registry-folders.js';
import { listFamilyRecords } from '../assets/js/services/family-library.js';
import { saveFamilyRecord } from '../assets/js/services/family-persistence.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { mergePublishedRegistryRecords } from '../assets/js/modules/family-registry/published-registry-merge.js';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';

const record = (id, path, extra = {}) => ({ id, title: `Haus ${id}`, folderPath: path, rankId: 'commoner', ...extra });
const records = [
  record('Bradrhith', ['Cenyr', 'Gwynthor', 'Bradrhith Hof'], { houseProfile: { liegeHouseName: 'Haus Awenydd' } }),
  record('Draig', ['Cenyr', 'Gwynthor'], { rankId: 'county', additionalPlacements: [
    { folderPath: ['Cenyr', 'Gwynthor', 'Bradrhith Hof'] }, { folderPath: ['Aldrimar', 'Ährental'] }
  ] }),
  record('hidden', ['Versteckt'], { listing: 'linked-only' }),
  record('Ungeordnet', [])
];

const gwynthorPath = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'];
const legacyGwynthorPath = [...gwynthorPath.slice(0, -1), 'Bannkreis Gwynthor'];
const registeredFamily = id => FAMILY_REGISTRY.find(record => record.id === id);

test('Falto lives only under Venalys; Twyllod and Penrudd share the existing Gwynthor location', () => {
  const index = createRegistryBrowserIndex(FAMILY_REGISTRY, FAMILY_REGISTRY_FOLDERS);
  assert.equal(index.nodes.has(registryPathKey(legacyGwynthorPath)), false);
  const gwynthor = resolveRegistryLocation(index, gwynthorPath);
  for (const id of ['haus-twyllod', 'haus-penrudd']) {
    assert.ok(gwynthor.records.some(record => record.id === id), id);
  }
  assert.ok(!gwynthor.familyIds.has('haus-falto'));
  const falto = index.families.get('haus-falto');
  assert.deepEqual(falto.placements.map(({ node }) => node.path), [['Venalys']]);
  assert.equal(falto.record.houseProfile.liegeHouseId, 'haus-vinicius');
  assert.deepEqual(falto.record.houseProfile.secondarySeats, ['Gwynthor']);
  assert.equal(registeredFamily('haus-twyllod').houseProfile.seat, 'Twyllod-Hof');
  assert.equal(registeredFamily('haus-penrudd').houseProfile.seat, 'Gwynthor');
  assert.deepEqual(registeredFamily('haus-falveri').folderPath, ['Venalys']);
});

test('a Lysfaen resident serving Wyrm stays in Lysfaen without a liege location', () => {
  const path = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Lysfaen'];
  const index = createRegistryBrowserIndex([record('lysfaen-resident', path, {
    houseProfile: { rankId: 'commoner', seat: 'Lysfaen', liegeHouseId: 'haus-wyrm', liegeHouseName: 'Haus Wyrm' }
  })]);
  assert.equal(resolveRegistryLocation(index, path).directCount, 1);
  assert.ok(![...index.nodes.values()].some(node => /Wyrm/.test(node.name)));
  assert.equal(searchRegistry(index, 'Wyrm').families[0].record.id, 'lysfaen-resident');
});

test('reviewed locations replace stale local and published paths without changing family history', () => {
  for (const [id, revision] of [['haus-falto', 1], ['haus-twyllod', 2], ['haus-penrudd', 6]]) {
    const registered = registeredFamily(id);
    const prior = normalizeFamily(structuredClone(registered.family));
    prior.extensions.sourceRevision = revision;
    prior.document.motto = 'Eigene Devise erhalten';
    prior.persons.at(-1).notes = 'Persönliche Notiz erhalten';
    prior.view.focusPersonId = prior.persons.at(-1).id;
    prior.view.ancestorDepth = 3;
    prior.partnerships[0].notes = 'Lokale Überlieferung erhalten';
    prior.document.houseProfile.folderPath = id === 'haus-falto' ? gwynthorPath : legacyGwynthorPath;
    if (id === 'haus-penrudd') prior.document.houseProfile.seat = 'Bannkreis Gwynthor';
    if (id === 'haus-falto') {
      Object.assign(prior.document.houseProfile, { kingdom: 'Cenyr', county: 'Celtigerns Wacht', barony: 'Llamreis Ankunft', seat: 'Gwynthor' });
      prior.document.emblem = '';
      prior.houses[0].emblem = '';
      prior.extensions.registryAdditionalPlacements = [{ folderPath: gwynthorPath, houseProfile: prior.document.houseProfile }];
    }
    const upgraded = resolveRegisteredFamilyUpgrade(registered.family, prior);
    assert.deepEqual(upgraded.document.houseProfile, registered.houseProfile, id);
    assert.equal(upgraded.document.motto, prior.document.motto);
    for (const collection of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps']) {
      assert.deepEqual(upgraded[collection], prior[collection], `${id}/${collection}`);
    }
    assert.deepEqual(upgraded.view, prior.view);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered.family, upgraded), upgraded);
    if (id === 'haus-falto') {
      assert.deepEqual(upgraded.extensions.registryAdditionalPlacements, []);
      assert.equal(upgraded.houses[0].emblem, registered.family.document.emblem);
    }
    const entries = new Map();
    const storage = { getItem: key => entries.get(key) || null, setItem: (key, value) => entries.set(key, value) };
    saveFamilyRecord({ id, family: prior, folderPath: prior.document.houseProfile.folderPath }, storage);
    assert.deepEqual(listFamilyRecords(storage).find(record => record.id === id).folderPath, registered.folderPath);
    const [published] = mergePublishedRegistryRecords([registered], [{ id, sourceRevision: revision,
      folderPath: prior.document.houseProfile.folderPath, houseProfile: prior.document.houseProfile }]);
    assert.deepEqual(published.folderPath, registered.folderPath);
    assert.deepEqual(published.houseProfile, registered.houseProfile);
  }
});

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
