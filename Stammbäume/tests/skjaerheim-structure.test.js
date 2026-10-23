import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { FAMILY_REGISTRY_FOLDERS } from '../assets/js/data/family-registry-folders.js';
import { SKJAERHEIM_TERRITORIES, SKJAERHEIM_LOWER_CLANS, SKJAERHEIM_REGISTRY_FOLDERS } from '../assets/js/data/skjaerheim-territorial-plan.js';
import { createRegistryBrowserIndex, registryPathKey, resolveRegistryLocation, searchRegistry } from '../assets/js/modules/family-registry/registry-browser-model.js';
import { renderRegistryContent } from '../assets/js/modules/family-registry/registry-browser-view.js';

const root = new URL('../', import.meta.url);
const inventory = JSON.parse(fs.readFileSync(new URL('assets/data/source-inventories/skjaerheim-2026-10-09.json', root), 'utf8'));
const row = line => inventory.sources[0].rows.find(entry => entry.line === line).cells;

test('Skjaerheim nests eight thanen and two hesiren clans under four jarltums without moving or creating families', () => {
  const baseline = createRegistryBrowserIndex(FAMILY_REGISTRY, FAMILY_REGISTRY_FOLDERS.filter(folder => folder.path[0] !== 'Skjaerheim'));
  const index = createRegistryBrowserIndex(FAMILY_REGISTRY, FAMILY_REGISTRY_FOLDERS);
  const kingdom = resolveRegistryLocation(index, ['Skjaerheim']);
  assert.deepEqual(kingdom.path, ['Skjaerheim']);
  assert.equal(kingdom.children.length, 4);
  assert.equal(kingdom.totalCount, 0);
  assert.equal(index.root.totalCount, baseline.root.totalCount);
  for (const [id, entry] of baseline.families) {
    assert.deepEqual(index.families.get(id).placements.map(({ node }) => node.path), entry.placements.map(({ node }) => node.path), id);
  }
  assert.equal(SKJAERHEIM_LOWER_CLANS.filter(c=>c.rankLabel==='Hesirenclan').length,2);
  for (const clan of SKJAERHEIM_LOWER_CLANS) {
    const jarl=SKJAERHEIM_TERRITORIES.find(t=>t.slug===clan.jarltumSlug);
    const placements = [...index.nodes.values()].filter(node => node.plannedHouses.some(house => house.name === clan.name));
    assert.deepEqual(placements.map(node => node.path), [['Skjaerheim',jarl.name,...clan.rankLabel==='Hesirenclan'?[jarl.seat]:[],clan.seat]], clan.name);
  }
  for (const folder of SKJAERHEIM_REGISTRY_FOLDERS) {
    const node = index.nodes.get(registryPathKey(folder.path));
    assert.equal(node.records.length, 0);
    assert.doesNotMatch(renderRegistryContent(index, node, '').html, /Stammbaum\.html/);
  }
});

test('all fourteen clan names, seats and emblems match the source rows, with explicit royal and jarl ranks', () => {
  const sourceClans = [
    { name: row(906)[0].text.replace(/ Clan$/, ''), seat: row(900)[0].text, image: row(903)[0].images[0] },
    ...row(926).map((cell, column) => ({ name: cell.text, seat: row(883)[column].text, image: row(921)[column].images[0] })),
    ...[961, 992].flatMap(line => row(line).map((cell, column) => ({
      name: cell.text, seat: row(line - 21)[column].text,
      formerSeat: row(line - 14)[column].text.replace(/^\(|\)$/g, ''),
      image: row(line - 7)[column].images[0]
    })))
  ];
  const planned = [
    ...SKJAERHEIM_TERRITORIES.map(territory => ({ ...territory.clan, seat: territory.seat })),
    ...SKJAERHEIM_LOWER_CLANS
  ];
  assert.equal(planned.length, 14);
  assert.equal(new Set(planned.map(clan => clan.name)).size, 14);
  for (const expected of sourceClans) {
    const actual = planned.find(clan => clan.name === expected.name);
    assert.ok(actual, expected.name);
    assert.equal(actual.seat, expected.seat, expected.name);
    if (expected.formerSeat) assert.equal(actual.formerSeat, expected.formerSeat, expected.name);
    assert.equal(inventory.assets.find(asset => asset.path === actual.emblem)?.source, expected.image, expected.name);
  }
  assert.match(SKJAERHEIM_TERRITORIES[0].clan.rankLabel, /Königsclan/);
  assert.deepEqual(SKJAERHEIM_TERRITORIES.slice(1).map(territory => [territory.clan.name, territory.clan.rankLabel]), [
    ['Knything', 'Jarlclan'], ['Stanleagh', 'Jarlclan'], ['Bjerk', 'Jarlclan']
  ]);
});

test('search and rendering expose clan ranks, assigned seats and the Stanlaegh source variant', () => {
  const index = createRegistryBrowserIndex([], SKJAERHEIM_REGISTRY_FOLDERS);
  for (const clan of SKJAERHEIM_LOWER_CLANS) {
    for (const query of [clan.name, clan.seat, clan.formerSeat]) {
      const result = searchRegistry(index, `Skjaerheim ${query}`);
      assert.ok(result.folders.some(node=>node.plannedHouses.some(h=>h.name===clan.name)),query);
      assert.equal(result.families.length, 0);
    }
  }
  const variants = searchRegistry(index, 'Stanlaegh');
  assert.ok(variants.folders.some(node => node.name === 'Blóðgalt'));
  for (const clan of SKJAERHEIM_LOWER_CLANS) {
    const node=[...index.nodes.values()].find(n=>n.plannedHouses.some(h=>h.name===clan.name));
    const html=renderRegistryContent(index,node,'').html;
    assert.ok(html.includes(`Clan ${clan.name}`));
    assert.ok(html.includes(`Sitz: ${clan.seat} (${clan.formerSeat})`));
  }
});

test('the exact source snapshot and all nineteen distinct local emblems retain verifiable bytes', () => {
  const source = inventory.sources[0];
  assert.equal(createHash('sha256').update(fs.readFileSync(new URL(source.path, root))).digest('hex'), source.sha256);
  const used = SKJAERHEIM_REGISTRY_FOLDERS.flatMap(folder => [
    ...(folder.icon ? [folder.icon] : []), ...folder.plannedHouses.map(clan => clan.emblem)
  ]);
  assert.equal(new Set(used).size, 19);
  assert.deepEqual(new Set(used), new Set(inventory.assets.map(asset => asset.path)));
  assert.equal(new Set(inventory.assets.map(asset => asset.sha256)).size, 19);
  for (const asset of inventory.assets) {
    const bytes = fs.readFileSync(new URL(asset.path, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), asset.width);
    assert.equal(bytes.readUInt32BE(20), asset.height);
  }
});
