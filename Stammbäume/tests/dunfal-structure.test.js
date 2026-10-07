import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { DUNFAL_HOUSE_DEFINITIONS, DUNFAL_REGISTRY_FOLDERS } from '../assets/js/data/dunfal-territorial-catalog.js';
import { DUNFAL_HOUSE_FAMILIES } from '../assets/js/data/dunfal-house-families.js';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { FAMILY_REGISTRY_FOLDERS } from '../assets/js/data/family-registry-folders.js';
import { assertValidFamily, normalizeFamily } from '../assets/js/domain/family-schema.js';
import { createRegistryBrowserIndex, resolveRegistryLocation, searchRegistry } from '../assets/js/modules/family-registry/registry-browser-model.js';
import { loadFamilyById } from '../assets/js/services/family-library.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';

const inventory = JSON.parse(fs.readFileSync(new URL('../assets/data/source-inventories/dunfal-2026-10-07.json', import.meta.url), 'utf8'));
const sourceCell = (id, row, column = 0) => inventory.sources.find(source => source.id === id).rows.find(entry => entry.row === row).cells[column];
const canonicalText = text => text.replaceAll("'", '’');

test('Dunfal registers thirteen genuinely empty, browser- and server-valid families with stable target IDs', () => {
  assert.equal(DUNFAL_HOUSE_FAMILIES.length, 13);
  assert.equal(new Set(FAMILY_REGISTRY.map(record => record.id)).size, FAMILY_REGISTRY.length);
  for (const definition of DUNFAL_HOUSE_DEFINITIONS) {
    const registered = getRegisteredFamily(definition.familyId);
    const family = normalizeFamily(registered.family);
    assertValidFamily(family);
    assert.equal(family.extensions.blankFamily, true);
    assert.equal(family.extensions.sourceRevision, 1);
    assert.equal(family.lineage.houseId, definition.houseId);
    assert.equal(family.houses[0].id, definition.houseId);
    for (const key of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps']) {
      assert.equal(family[key].length, 0, `${definition.familyId}: ${key}`);
    }
    assert.equal(family.view.focusPersonId, '');
    assert.equal(family.lineage.founderPartnershipId, '');
    const { persons, partnerships, parentages, houses, cadetBranches, timeJumps, ...root } = family;
    const validation = validateWorkspaceForPublishing({
      root: { ...root, familyId: definition.familyId },
      collections: { persons, partnerships, parentages, houses, cadetBranches, timeJumps }
    });
    assert.equal(validation.valid, true, validation.diagnostics.join('\n'));
  }
  for (const id of ['haus-birn', 'haus-riangabra', 'haus-eachtrai', 'haus-morath', 'haus-duilb']) {
    assert.ok(FAMILY_REGISTRY.some(record => record.family.cadetBranches.some(branch => branch.targetFamilyId === id)), id);
  }
  assert.equal(getRegisteredFamily('sept-ferbend').type, 'commoner');
  assert.equal(getRegisteredFamily('haus-mac-ailella'), null);
});

test('clan names, seats and emblems follow source columns; the Nuadat correction has independent evidence', () => {
  for (const definition of DUNFAL_HOUSE_DEFINITIONS) {
    const { id, nameRow, seatRow, emblemRow, column } = definition.source;
    const name = canonicalText(sourceCell(id, nameRow, column).text);
    if (definition.slug === 'nuadat') {
      assert.equal(name, 'Ard’Chulainn');
      assert.equal(canonicalText(sourceCell('dunfal', 88).text), definition.name);
      assert.equal(sourceCell('dunfal', 89).images[0], sourceCell(id, emblemRow, column).images[0]);
      assert.equal(sourceCell(id, 36, 2).text, 'Tagd Nuadat');
      assert.equal(sourceCell('dunfal', 79, 1).text, definition.seat);
      assert.equal(sourceCell('dunfal', 58, 1).text, 'Tagd Nuadat');
    } else {
      assert.equal(name, definition.name);
    }
    assert.equal(sourceCell(id, seatRow, column).text, definition.seat);
    const asset = inventory.assets.find(entry => entry.path === definition.emblem);
    assert.equal(asset.source, sourceCell(id, emblemRow, column).images[0]);
  }
  const first = inventory.sources.find(source => source.id === 'tir-na-rithe');
  const second = inventory.sources.find(source => source.duplicateOf === first.id);
  assert.deepEqual(second.rows, first.rows);
});

test('Dunfal geography remains separate from genealogy, existing regions and the Fianna organization', () => {
  const index = createRegistryBrowserIndex(FAMILY_REGISTRY, FAMILY_REGISTRY_FOLDERS);
  const dunfal = resolveRegistryLocation(index, ['Dunfal']);
  assert.equal(dunfal.children.length, 2);
  assert.equal(dunfal.totalCount, 13);
  assert.equal(resolveRegistryLocation(index, ['Dunfal', 'Tir na Rithe']).totalCount, 6);
  assert.equal(resolveRegistryLocation(index, ['Dunfal', 'Tir na Fathach']).totalCount, 7);
  assert.equal(resolveRegistryLocation(index, ['Fjordheim']).totalCount, 0);
  const fianna = resolveRegistryLocation(index, ['Dunfal', 'Tir na Fathach', 'Herrschaft der Fianna']);
  assert.equal(fianna.path.length, 3);
  assert.equal(fianna.totalCount, 0);
  assert.equal(fianna.children.length, 0);
  for (const [query, id] of [['Dunfal Nuadat', 'haus-nuadat'], ['Dunfal Cein', 'haus-cein'], ['Ferbend', 'sept-ferbend'], ['Dunfal Athenry', 'haus-eachtrai'], ['Dunfal Iarthar', 'haus-morath']]) {
    const matches = searchRegistry(index, query).families;
    assert.equal(matches.filter(entry => entry.record.id === id).length, 1, query);
    assert.ok(matches.every(entry => entry.record.houseProfile.kingdom === 'Dunfal'), query);
  }
  const withoutDunfal = FAMILY_REGISTRY.filter(record => record.houseProfile.kingdom !== 'Dunfal');
  const before = createRegistryBrowserIndex(withoutDunfal, FAMILY_REGISTRY_FOLDERS.filter(folder => folder.path[0] !== 'Dunfal'));
  for (const [key, node] of before.nodes) {
    if (node.path.length) assert.deepEqual(index.nodes.get(key).familyIds, node.familyIds, key);
  }
  assert.equal(index.root.totalCount - before.root.totalCount, 13);
});

test('ranks, extinct status and explicit territorial hierarchy do not invent barons or a liege for Ferbend', () => {
  const family = id => getRegisteredFamily(id).family;
  assert.equal(family('haus-chulainn').document.houseProfile.rankId, 'ard-tiarna');
  assert.equal(family('haus-nuadat').document.houseProfile.rankId, 'mor-tiarna');
  assert.equal(family('haus-nuadat').document.houseProfile.liegeHouseId, 'haus-chulainn');
  assert.equal(family('haus-duilb').houses[0].status, 'extinct');
  assert.equal(family('haus-duilb').extensions.extinctHouse, true);
  assert.equal(family('haus-duilb').document.houseProfile.rankId, 'unknown');
  assert.equal(family('sept-ferbend').document.houseProfile.liegeHouseId, '');
  for (const definition of DUNFAL_HOUSE_DEFINITIONS.filter(entry => entry.realm)) {
    const profile = family(definition.familyId).document.houseProfile;
    assert.equal(profile.rankId, 'laird');
    assert.equal(profile.barony, definition.realm);
    assert.equal(profile.liegeHouseId, definition.territoryId === 'tir-na-rithe' ? 'haus-chulainn' : 'haus-nuadat');
    assert.notEqual(profile.regionEmblems.barony, definition.emblem);
  }
});

test('opening an empty Dunfal family repeatedly preserves a locally started genealogy and notes', () => {
  const local = structuredClone(getRegisteredFamily('haus-cein'));
  local.family.persons.push({ id: 'local-person', name: 'Lokale Ergänzung', houseId: 'house-cein', notes: 'Eigene Recherche' });
  local.family.document.description = 'Eigene Notiz';
  const storage = { getItem: key => key === 'aleria.family-tree.saved-families.v1' ? JSON.stringify([local]) : null };
  for (let repeat = 0; repeat < 2; repeat++) {
    const loaded = loadFamilyById('haus-cein', storage);
    assert.equal(loaded.family.persons.length, 1);
    assert.equal(loaded.family.persons[0].notes, 'Eigene Recherche');
    assert.equal(loaded.family.document.description, 'Eigene Notiz');
  }
});

test('all four snapshots and 26 separate original emblems have verified local provenance', () => {
  assert.equal(inventory.sources.length, 4);
  const usedAssets = new Set([
    ...DUNFAL_REGISTRY_FOLDERS.map(folder => folder.icon).filter(Boolean),
    ...DUNFAL_HOUSE_DEFINITIONS.map(definition => definition.emblem)
  ]);
  assert.equal(usedAssets.size, 26);
  assert.deepEqual(usedAssets, new Set(inventory.assets.map(asset => asset.path)));
  for (const entry of [...inventory.sources, ...inventory.assets]) {
    const bytes = fs.readFileSync(new URL('../' + entry.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
    if (!entry.source) continue;
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), entry.width);
    assert.equal(bytes.readUInt32BE(20), entry.height);
    assert.equal(entry.source, sourceCell(entry.sourceId, entry.sourceRow, entry.sourceColumn).images[0]);
  }
});
