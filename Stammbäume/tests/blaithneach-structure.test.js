import { BRANN_SOURCE_COUNTER_PATCHES } from '../assets/js/data/brann-source-counter-patches.js';
import { MATHGHAM_SOURCE_COUNTER_PATCHES } from '../assets/js/data/mathgham-source-counter-patches.js';
import { FAERNA_SOURCE_COUNTER_PATCHES } from '../assets/js/data/faerna-source-counter-patches.js';
import { FAELAORN_SOURCE_COUNTER_PATCHES } from '../assets/js/data/faelaorn-source-counter-patches.js';
import { ALBEN_SOURCE_PORTRAITS, ALBEN_SOURCE_PORTRAIT_FAMILIES } from '../assets/js/data/alben-source-portraits.js';
import test from 'node:test';
import { AISLEARNEACH_SOURCE_COUNTER_PATCHES } from '../assets/js/data/aislearneach-source-counter-patches.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { BLAITHNEACH_HOUSE_DEFINITIONS, BLAITHNEACH_REGISTRY_FOLDERS } from '../assets/js/data/blaithneach-territorial-catalog.js';
import { BLAITHNEACH_HOUSE_FAMILIES } from '../assets/js/data/blaithneach-house-families.js';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { FAMILY_REGISTRY_FOLDERS } from '../assets/js/data/family-registry-folders.js';
import { assertValidFamily, normalizeFamily } from '../assets/js/domain/family-schema.js';
import { createRegistryBrowserIndex, resolveRegistryLocation, searchRegistry } from '../assets/js/modules/family-registry/registry-browser-model.js';
import { loadFamilyById, listFamilyRecords } from '../assets/js/services/family-library.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';
import { BLAITHNEACH_SOURCE_COUNTER_PATCHES } from '../assets/js/data/blaithneach-source-counter-patches.js';

const inventory = JSON.parse(fs.readFileSync(new URL('../assets/data/source-inventories/blaithneach-2026-10-07.json', import.meta.url), 'utf8'));
const sourceCell = (id, row, column = 0) => inventory.sources.find(source => source.id === id).rows.find(entry => entry.row === row).cells[column];
const family = id => getRegisteredFamily(id).family;

test('Blaithneach registers nine sourced families, one blank family and retains Leite', () => {
  assert.equal(BLAITHNEACH_HOUSE_FAMILIES.length, 10);
  assert.equal(BLAITHNEACH_HOUSE_DEFINITIONS.length, 11);
  // The archived territorial notes predate the reviewed genealogy aliases.
  const territorialFields = ({ sourceNote, ...definition }) => definition;
  assert.deepEqual(inventory.houses.map(territorialFields), BLAITHNEACH_HOUSE_DEFINITIONS.map(territorialFields));
  assert.equal(new Set(FAMILY_REGISTRY.map(record => record.id)).size, FAMILY_REGISTRY.length);
  assert.equal(family('haus-dal-leite').persons.length, 73);
  assert.equal(family('haus-dal-leite').extensions.sourceRevision, MATHGHAM_SOURCE_COUNTER_PATCHES['haus-dal-leite']?.revision || ALBEN_SOURCE_PORTRAIT_FAMILIES['haus-dal-leite'].revision);
  for (const definition of BLAITHNEACH_HOUSE_DEFINITIONS.filter(entry => entry.createFamily)) {
    const normalized = normalizeFamily(family(definition.familyId));
    assertValidFamily(normalized);
    const blank = definition.slug === 'abhrach';
    assert.equal(normalized.extensions.sourceRevision, BRANN_SOURCE_COUNTER_PATCHES[normalized.document.id]?.revision || FAERNA_SOURCE_COUNTER_PATCHES[normalized.document.id]?.revision || MATHGHAM_SOURCE_COUNTER_PATCHES[normalized.document.id]?.revision || FAELAORN_SOURCE_COUNTER_PATCHES[normalized.document.id]?.revision || ALBEN_SOURCE_PORTRAIT_FAMILIES[normalized.document.id]?.revision || AISLEARNEACH_SOURCE_COUNTER_PATCHES[normalized.document.id]?.revision || (blank ? 1 : 2));
    assert.equal(normalized.extensions.blankFamily, blank);
    assert.equal(normalized.houses[0].id, definition.houseId);
    assert.equal(normalized.lineage.houseId, definition.houseId);
    if (blank) {
      for (const key of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps']) assert.deepEqual(normalized[key], []);
      assert.equal(normalized.lineage.founderPartnershipId, '');
      assert.equal(normalized.view.focusPersonId, '');
    } else assert.ok(normalized.persons.length > 0);
    const { persons, partnerships, parentages, houses, cadetBranches, timeJumps, ...root } = normalized;
    const validation = validateWorkspaceForPublishing({
      root: { ...root, familyId: definition.familyId },
      collections: { persons, partnerships, parentages, houses, cadetBranches, timeJumps }
    });
    assert.equal(validation.valid, true, validation.diagnostics.join('\n'));
  }
});

test('one Leite record appears under both countries with separate ranks and is counted once globally', () => {
  const index = createRegistryBrowserIndex(FAMILY_REGISTRY, FAMILY_REGISTRY_FOLDERS);
  const blaithneach = resolveRegistryLocation(index, ['Blaithneach']);
  assert.equal(blaithneach.totalCount, 11);
  assert.equal(blaithneach.children.length, 3);
  assert.equal(blaithneach.children.reduce((sum, territory) => sum + territory.children.length, 0), 6);
  for (const [territory, count] of [['Tir na Beatha', 3], ['Tir na Dílse', 6], ['Tir na Méinnear', 2]]) {
    assert.equal(resolveRegistryLocation(index, ['Blaithneach', territory]).totalCount, count);
  }
  assert.equal(resolveRegistryLocation(index, ['Ceitheach']).totalCount, 15);
  const leith = getRegisteredFamily('haus-dal-leite');
  assert.equal(leith.houseProfile.rankId, 'mor-tiarna');
  assert.equal(leith.houseProfile.seat, 'Greinmhar');
  assert.equal(leith.additionalPlacements.length, 1);
  const placement = leith.additionalPlacements[0];
  assert.deepEqual(placement.folderPath, ['Blaithneach', 'Tir na Dílse', 'Ardán']);
  assert.equal(placement.houseProfile.rankId, 'laird');
  assert.equal(placement.houseProfile.liegeHouseId, 'haus-ronain');
  assert.equal(placement.houseProfile.barony, '');
  assert.match(placement.sourceNote, /Überlebenden/);
  assert.equal(index.families.get(leith.id).placements.length, 2);
  assert.equal(FAMILY_REGISTRY.filter(record => record.id === leith.id).length, 1);
  assert.equal(index.root.totalCount, FAMILY_REGISTRY.filter(record => record.listing !== 'linked-only').length);
  for (const query of ['Blaithneach Leite', 'Ceitheach Leite', 'Ardán Leite']) {
    assert.equal(searchRegistry(index, query).families.filter(entry => entry.record.id === leith.id).length, 1);
  }
  assert.ok(searchRegistry(index, 'Ardan').folders.some(folder => folder.name === 'Ardán'));
});

test('territorial placement refreshes old local Leite records without modifying genealogy or notes', () => {
  const local = structuredClone(getRegisteredFamily('haus-dal-leite'));
  local.additionalPlacements = [];
  local.family.document.description = 'Lokale Familienchronik';
  local.family.persons[0].notes = 'Eigene Ergänzung';
  const storage = { getItem: key => key === 'aleria.family-tree.saved-families.v1' ? JSON.stringify([local]) : null };
  for (let repeat = 0; repeat < 2; repeat++) {
    const loaded = loadFamilyById(local.id, storage);
    assert.deepEqual(loaded.family, normalizeFamily(local.family));
    assert.equal(loaded.additionalPlacements.length, 1);
    assert.equal(loaded.additionalPlacements[0].houseProfile.seat, 'Ardán');
    const index = createRegistryBrowserIndex(listFamilyRecords(storage), FAMILY_REGISTRY_FOLDERS);
    assert.equal(index.families.get(local.id).placements.length, 2);
    assert.equal(resolveRegistryLocation(index, ['Blaithneach']).totalCount, 11);
  }
});

test('explicit expulsion preserves living Pailtéar while Abhrach remains extinct', () => {
  const expelled = family('haus-cleirigh');
  assert.equal(expelled.houses[0].status, 'expelled');
  assert.equal(expelled.extensions.extinctHouse, undefined);
  assert.equal(expelled.document.houseProfile.liegeHouseId, '');
  assert.match(expelled.extensions.sourceNote, /Nutzerfestlegung/);
  const pailtear = family('haus-ua-nic-ceinselaig').persons.find(person => person.id === 'pailtear-cleirigh');
  assert.equal(pailtear.status, 'alive');
  assert.equal(pailtear.birth, '1698');
  assert.equal(pailtear.death, '');
  assert.equal(pailtear.worldPersonId, 'person--haus-cleirigh--pailtear-cleirigh');
  assert.equal(family('haus-abhrach').houses[0].status, 'extinct');
  assert.equal(family('haus-abhrach').extensions.extinctHouse, true);
  for (const id of ['haus-cleirigh', 'haus-abhrach']) {
    assert.equal(family(id).document.houseProfile.rankId, 'unknown');
    if (id === 'haus-abhrach') assert.deepEqual(family(id).cadetBranches, []);
  }
  assert.equal(sourceCell('blaithneach', 93).text, 'Ausgestorben');
  assert.equal(inventory.decisions.filter(entry => entry.status === 'user-corrected').length, 2);
});

test('names, seats, ranks and original emblems follow their source columns', () => {
  for (const definition of BLAITHNEACH_HOUSE_DEFINITIONS) {
    const { id, nameRow, seatRow, emblemRow, column } = definition.source;
    const expectedName = definition.slug === 'nessa' ? 'Ard Nessa' : definition.name;
    assert.equal(sourceCell(id, nameRow, column).text.replaceAll("'", '’'), expectedName);
    assert.equal(sourceCell(id, seatRow, column).text, definition.seat);
    assert.equal(inventory.assets.find(asset => asset.path === definition.emblem).source, sourceCell(id, emblemRow, column).images[0]);
  }
  assert.equal(sourceCell('tir-na-dilse', 93).text, 'Sioran');
  assert.equal(sourceCell('tir-na-dilse', 10, 1).text, 'Eorach');
  assert.equal(sourceCell('blaithneach', 78, 2).text, 'Eorach');
  assert.equal(family('haus-ronain').document.houseProfile.rankId, 'ard-tiarna');
  for (const id of ['haus-nessa', 'haus-magach']) assert.equal(family(id).document.houseProfile.rankId, 'mor-tiarna');
  assert.equal(family('haus-haeghra').document.houseProfile.rankId, 'dun-tiarna');
  assert.equal(sourceCell('tir-na-beatha', 57, 1).text, 'Donnagh Heaghra');
  assert.equal(sourceCell('tir-na-beatha', 55, 1).text, 'Réadlann');
  for (const definition of BLAITHNEACH_HOUSE_DEFINITIONS.filter(entry => entry.createFamily)) {
    assert.equal(family(definition.familyId).document.houseProfile.barony, '');
  }
});

test('counterpart identities and established target IDs remain intact', () => {
  for (const audit of inventory.counterpartAudit) {
    const current = family(audit.familyId);
    for (const house of audit.houses) {
      const actual = current.houses.find(entry => entry.id === house.id);
      for (const [key, value] of Object.entries(house)) {
        if (key === 'extensions') {
          for (const [field, expected] of Object.entries(value)) assert.deepEqual(actual.extensions[field], expected);
        } else assert.deepEqual(actual[key], value);
      }
    }
    for (const person of audit.persons) {
      const actual = current.persons.find(entry => entry.id === person.id);
      const patch = BLAITHNEACH_SOURCE_COUNTER_PATCHES[audit.familyId]?.collections.persons?.[person.id] || {};
      for (const key of Object.keys(person)) assert.equal(actual[key], key in patch ? patch[key] : person[key], `${audit.familyId}/${person.id}/${key}`);
    }
  }
  for (const id of ['haus-nessa', 'haus-magach', 'haus-gairner', 'haus-goidin', 'haus-suiste', 'haus-eala', 'haus-haeghra', 'haus-cleirigh']) {
    assert.ok(FAMILY_REGISTRY.some(record => record.family.cadetBranches.some(branch => branch.targetFamilyId === id)), id);
  }
  assert.equal(family('haus-teyrngarch').persons.find(person => person.id === 'donnagh-heaghra').houseId, 'house-haeghra');
  assert.ok(family('haus-helgr').houses.some(house => house.id === 'house-mac-magach'));
  assert.ok(family('haus-sgwarnog').houses.some(house => house.id === 'house-mac-eala'));
});

test('four byte-exact sources and fifteen verified emblems include the reused Leite crest', () => {
  assert.equal(inventory.sources.length, 4);
  assert.equal(inventory.assets.length, 15);
  assert.equal(inventory.assets.filter(asset => asset.reused).length, 1);
  const used = new Set([
    ...BLAITHNEACH_REGISTRY_FOLDERS.map(folder => folder.icon).filter(Boolean),
    ...BLAITHNEACH_HOUSE_DEFINITIONS.map(definition => definition.emblem)
  ]);
  assert.deepEqual(used, new Set(inventory.assets.map(asset => asset.path)));
  const reused = inventory.assets.find(asset => asset.reused);
  assert.equal(reused.path, family('haus-dal-leite').document.emblem);
  assert.equal(reused.source, 'https://i.imgur.com/b9A4eIK.png');
  for (const entry of [...inventory.sources, ...inventory.assets]) {
    const bytes = fs.readFileSync(new URL('../' + entry.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
    if (!entry.source) continue;
    assert.equal(entry.status, 'local');
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), entry.width);
    assert.equal(bytes.readUInt32BE(20), entry.height);
    assert.equal(entry.source, sourceCell(entry.sourceId, entry.sourceRow, entry.sourceColumn).images[0]);
  }
});
