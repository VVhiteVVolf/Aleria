import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { FAMILY_REGISTRY_FOLDERS } from '../assets/js/data/family-registry-folders.js';
import { createRegistryBrowserIndex, resolveRegistryLocation, searchRegistry } from '../assets/js/modules/family-registry/registry-browser-model.js';
import { reviewedFiefs } from '../assets/js/modules/albic-territories/fief-catalog.js';

const index = createRegistryBrowserIndex(FAMILY_REGISTRY, FAMILY_REGISTRY_FOLDERS);
const catalogs = new Map([...new Set(reviewedFiefs.map(fief => fief.realm))].map(realm => [realm,
  JSON.parse(fs.readFileSync(new URL(`../../Karten/${realm}/territories.import.json`, import.meta.url), 'utf8')).territories]));

test('each reviewed primary fief appears once under its canonical nested family path', () => {
  for (const fief of reviewedFiefs) {
    const territory = catalogs.get(fief.realm).find(t => t.id === fief.id);
    const record = getRegisteredFamily(territory.familyId);
    assert.ok(record, territory.house);
    if (record.houseProfile.kingdom !== fief.realm) continue;
    assert.equal(record.houseProfile.barony, territory.name, territory.house);
    assert.equal(record.houseProfile.seat, territory.seat);
    const node = resolveRegistryLocation(index, record.folderPath);
    assert.deepEqual(node.path, record.folderPath);
    assert.equal(node.records.filter(r => r.id === record.id).length, 1);
  }
});

test('Leite retains the historical Mor Tiarna line and a separately ranked Blaithneach fief', () => {
  const record = getRegisteredFamily('haus-dal-leite');
  assert.equal(record.houseProfile.kingdom, 'Ceitheach');
  assert.equal(record.houseProfile.rankId, 'mor-tiarna');
  const local = record.additionalPlacements.find(p => p.houseProfile.kingdom === 'Blaithneach');
  assert.equal(local.houseProfile.rankId, 'laird');
  assert.equal(local.houseProfile.barony, 'Tir na Deoraíochta');
  assert.deepEqual(local.folderPath, ['Blaithneach', 'Tir na Dílse', 'Tir na Deoraíochta', 'Ardán']);
  assert.equal(index.families.get(record.id).placements.length, 2);
});

test('historical predecessors and spelling aliases remain searchable without duplicating current fiefs', () => {
  assert.equal(getRegisteredFamily('haus-iomrach').houseProfile.barony, 'Tir na Soilse');
  assert.ok(!index.nodes.has(JSON.stringify(['Leitheach', 'Tir na Gortanna', 'Herrschaft von Broch an Clais'])));
  for (const query of ['Faelaorn Lochcearon', 'Aislearneach Caetharlach', 'Aislearneach Cethearlach']) {
    assert.ok(searchRegistry(index, query).folders.length, query);
  }
  assert.equal(getRegisteredFamily('haus-suileach').family.extensions.formerMorTiarna, true);
});
