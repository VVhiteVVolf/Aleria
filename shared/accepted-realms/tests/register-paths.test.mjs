import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { FAMILY_REGISTRY_FOLDERS } from '../../../Stammbäume/assets/js/data/family-registry-folders.js';
import { normalizeHouseProfile, createFolderPathFromHouseProfile, createHouseProfileFromFolderPath } from '../../../Stammbäume/assets/js/domain/house-profile.js';
import { createRegistryBrowserIndex } from '../../../Stammbäume/assets/js/modules/family-registry/registry-browser-model.js';
import { allHouses, realmsById } from '../catalog.mjs';
import { housePlacement } from '../house-placement.mjs';
import { createTerritoryArticle } from '../territory-article.mjs';
import { mergePublishedRegistryRecords } from '../../../Stammbäume/assets/js/modules/family-registry/published-registry-merge.js';
import { resolveRegisteredFamilyUpgrade } from '../../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { normalizeFamily } from '../../../Stammbäume/assets/js/domain/family-schema.js';
import { registryEntry } from '../../../netlify/functions/family-publisher.mjs';

const index = createRegistryBrowserIndex(FAMILY_REGISTRY, FAMILY_REGISTRY_FOLDERS);
const acceptedRealmNames = new Set([...realmsById.values()].map(realm => realm.name));
test('explicit short folder paths survive normalization without appending the same seat again', () => {
  const profile = normalizeHouseProfile({ kingdom: 'Land', county: 'Provinz', barony: 'Ministerialensitz Burg', seat: 'Burg', folderPath: ['Land', 'Provinz', 'Burg'] });
  assert.deepEqual(createFolderPathFromHouseProfile(profile), ['Land', 'Provinz', 'Burg']);
  assert.equal(profile.barony, 'Ministerialensitz Burg');
  assert.deepEqual(createFolderPathFromHouseProfile(createHouseProfileFromFolderPath(['Land', 'Andere Provinz', 'Burg'], profile)), ['Land', 'Andere Provinz', 'Burg']);
  assert.deepEqual(createFolderPathFromHouseProfile({ kingdom: 'Land', county: 'Provinz', seat: 'Burg' }), ['Land', 'Provinz', 'Burg']);
});
test('Hochreuth sits beside its liege Roden in Thronholt and appears in the Roden dominion', () => {
  assert.deepEqual(getRegisteredFamily('haus-von-hochreuth').folderPath, getRegisteredFamily('haus-roden').folderPath);
  assert.deepEqual(getRegisteredFamily('haus-von-hochreuth').folderPath, ['Goldmund', 'Herzogliche Grafschaft Kronenau', 'Thronholt']);
  const realm = realmsById.get('goldmund'), article = createTerritoryArticle(realm, realm.territoriesById.get('goldmund-hausbereich-roden'));
  assert.ok(article.families.some(g => g.houses.some(h => h.familyId === 'haus-von-hochreuth')));
  assert.equal(getRegisteredFamily('haus-von-hochreuth').houseProfile.liegeHouseId, 'house-roden');
});
test('Weinlaub and Sonnenfels have the exact direct province/castle hierarchy and one primary placement', () => {
  for (const [id, path] of [
    ['haus-weinlaub', ['Weisenfluh', 'Königliche Provinz Ewigensee', 'Burg Rebenwacht']],
    ['haus-sonnenfels', ['Weisenfluh', 'Freiherrentum Weislauf', 'Burg Sonnenfels']],
  ]) {
    assert.deepEqual(getRegisteredFamily(id).folderPath, path);
    const matches = index.families.get(id).placements.filter(p => p.node.path[0] === 'Weisenfluh');
    assert.equal(matches.length, 1); assert.deepEqual(matches[0].node.path, path);
  }
});
test('all accepted houses use their authored path and leave no duplicate or empty country branches', () => {
  for (const house of allHouses) assert.deepEqual(getRegisteredFamily(house.familyId).folderPath, housePlacement(realmsById.get(house.realmId), house).folderPath, house.familyId);
  for (const node of index.nodes.values()) if (acceptedRealmNames.has(node.path[0])) {
    assert.ok(node.totalCount > 0, node.path.join('/'));
    assert.ok(!node.path.some((part, i) => i && part === node.path[i - 1]), node.path.join('/'));
  }
});

test('older published metadata cannot recreate the old Sonnenfels branch after a reviewed correction', () => {
  const current = getRegisteredFamily('haus-sonnenfels');
  const previous = { id: current.id, title: current.title, folderPath: ['Weisenfluh', 'Burg Sonnenfels'], houseProfile: { rankId: 'knight', seat: 'Burg Sonnenfels' }, personCount: 25 };
  const records = mergePublishedRegistryRecords(FAMILY_REGISTRY, [previous]);
  const merged = records.find(r => r.id === current.id);
  assert.deepEqual(merged.folderPath, current.folderPath);
  assert.equal(merged.personCount, 25);
  assert.equal(merged.houseProfile.rankId, 'ministerial');
  const tree = createRegistryBrowserIndex(records, FAMILY_REGISTRY_FOLDERS);
  assert.ok(!tree.nodes.has(JSON.stringify(previous.folderPath)));
  const [newer] = mergePublishedRegistryRecords([current], [{ ...previous, sourceRevision: current.family.extensions.sourceRevision, folderPath: ['Weisenfluh', 'Neue bewusste Einordnung'] }]);
  assert.deepEqual(newer.folderPath, ['Weisenfluh', 'Neue bewusste Einordnung']);
});

test('existing locally edited people survive a placement upgrade of Weinlaub, Sonnenfels and Hochreuth', () => {
  for (const id of ['haus-weinlaub', 'haus-sonnenfels', 'haus-von-hochreuth']) {
    const current = getRegisteredFamily(id).family, previous = normalizeFamily(current);
    previous.extensions.sourceRevision = current.extensions.sourceRevision - 1;
    previous.document.houseProfile.folderPath = ['Alte Ablage'];
    previous.persons[0].notes = 'Eigene erhaltene Notiz';
    const result = resolveRegisteredFamilyUpgrade(current, previous);
    assert.deepEqual(createFolderPathFromHouseProfile(result.document.houseProfile), getRegisteredFamily(id).folderPath);
    assert.deepEqual(result.persons, previous.persons);
    assert.deepEqual(result.partnerships, previous.partnerships);
    assert.deepEqual(result.parentages, previous.parentages);
  }
});

test('future publication metadata preserves the compact path and its source version', () => {
  for (const id of ['haus-weinlaub', 'haus-sonnenfels', 'haus-von-hochreuth']) {
    const record = getRegisteredFamily(id), published = registryEntry(record.family, 101, '2026-10-29T00:00:00.000Z');
    assert.deepEqual(published.folderPath, record.folderPath);
    assert.equal(published.sourceRevision, record.family.extensions.sourceRevision);
    assert.equal(published.revision, 101);
  }
});
