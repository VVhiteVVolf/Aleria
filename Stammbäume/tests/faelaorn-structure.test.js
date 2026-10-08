import { BRANN_SOURCE_FAMILIES } from '../assets/js/data/brann-source-families.js';
import { MATHGHAM_SOURCE_FAMILIES } from '../assets/js/data/mathgham-source-families.js';
import { BRAIGH_SOURCE_FAMILIES } from '../assets/js/data/braigh-source-families.js';
import { FAERNA_SOURCE_FAMILIES } from '../assets/js/data/faerna-source-families.js';
import { DAMH_SOURCE_FAMILIES } from '../assets/js/data/damh-source-families.js';
import { fingerprintBeforeMathgham } from './mathgham-invariants.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { FAMILY_REGISTRY_FOLDERS } from '../assets/js/data/family-registry-folders.js';
import { FAELAORN_HOUSE_FAMILIES } from '../assets/js/data/faelaorn-house-families.js';
import { FAELAORN_SOURCE_FAMILIES } from '../assets/js/data/faelaorn-source-families.js';
import { FAELAORN_SOURCE_COUNTER_PATCHES } from '../assets/js/data/faelaorn-source-counter-patches.js';
import { FAELAORN_HOUSE_DEFINITIONS, FAELAORN_TERRITORIES, FAELAORN_WAR_CONTEXT } from '../assets/js/data/faelaorn-territorial-catalog.js';
import { createRegistryBrowserIndex, resolveRegistryLocation, searchRegistry } from '../assets/js/modules/family-registry/registry-browser-model.js';
import { normalizeFamily, assertValidFamily } from '../assets/js/domain/family-schema.js';
import { loadFamilyById } from '../assets/js/services/family-library.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const inventory = read('assets/data/source-inventories/faelaorn-2026-10-08.json');
const family = id => getRegisteredFamily(id).family;
const index = createRegistryBrowserIndex(FAMILY_REGISTRY, FAMILY_REGISTRY_FOLDERS);

test('Faelaorn retains six historical territories and 39 records, including 7 still empty', () => {
  assert.equal(FAELAORN_TERRITORIES.length, 6);
  assert.equal(FAELAORN_HOUSE_FAMILIES.length, 39);
  assert.equal(FAELAORN_HOUSE_DEFINITIONS.filter(d => d.kind === 'clan').length, 34);
  assert.equal(FAELAORN_HOUSE_DEFINITIONS.filter(d => d.kind === 'sept').length, 5);
  assert.equal(new Set(FAMILY_REGISTRY.map(r => r.id)).size, FAMILY_REGISTRY.length);
  assert.deepEqual(inventory.houses, FAELAORN_HOUSE_DEFINITIONS);
  const sourced = new Set([...FAELAORN_SOURCE_FAMILIES,...MATHGHAM_SOURCE_FAMILIES,...BRAIGH_SOURCE_FAMILIES,...FAERNA_SOURCE_FAMILIES,...DAMH_SOURCE_FAMILIES,...BRANN_SOURCE_FAMILIES].map(f => f.document.id));
  assert.equal(FAELAORN_HOUSE_FAMILIES.filter(f => f.extensions.blankFamily).length, 7);
  for (const entry of FAELAORN_HOUSE_FAMILIES) {
    const normalized = normalizeFamily(entry);
    assertValidFamily(normalized);
    if (!sourced.has(entry.document.id)) {
      for (const key of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps']) assert.deepEqual(normalized[key], [], entry.document.id);
      assert.equal(normalized.extensions.blankFamily, true);
      assert.equal(normalized.extensions.sourceRevision, 1);
    }
    assert.deepEqual(normalized.extensions.faelaornWarContext, FAELAORN_WAR_CONTEXT);
    const { persons, partnerships, parentages, houses, cadetBranches, timeJumps, ...root } = normalized;
    const result = validateWorkspaceForPublishing({ root: { ...root, familyId: entry.document.id }, collections: { persons, partnerships, parentages, houses, cadetBranches, timeJumps } });
    assert.equal(result.valid, true, JSON.stringify(result));
  }
  assert.equal(resolveRegistryLocation(index, ['Faelaorn']).totalCount, 40);
});

test('war and partial occupation never replace historical geography or imply clan extinction', () => {
  assert.equal(FAELAORN_WAR_CONTEXT.opponent, 'Skjaerheim');
  assert.equal(FAELAORN_WAR_CONTEXT.administrativeBasis, 'historical');
  assert.equal(FAELAORN_WAR_CONTEXT.occupation, 'partial');
  assert.equal(FAELAORN_WAR_CONTEXT.territorialControlSpecified, false);
  for (const id of ['buadhtreun', 'durachd', 'muirgheal', 'boyd']) {
    assert.equal(family('haus-' + id).houses[0].status, 'active');
    assert.equal(family('haus-' + id).extensions.extinctHouse, undefined);
  }
  assert.equal(family('haus-ffearnach').houses[0].status, 'extinct');
  assert.equal(family('haus-ffearnach').document.houseProfile.rankId, 'unknown');
  assert.equal(family('haus-buadhtreun').document.houseProfile.seat, 'Beinnstir');
  assert.equal(family('haus-muirgheal').document.houseProfile.seat, 'Airdree');
  assert.equal(family('haus-urquhart').document.houseProfile.seat, 'Piobarach');
  assert.equal(inventory.capital, 'Piobarach');
  for (const definition of FAELAORN_HOUSE_DEFINITIONS.filter(d => d.rankId === 'mor-tiarna')) {
    assert.equal(family(definition.familyId).document.houseProfile.liegeHouseId, 'haus-urquhart');
  }
});

test('asylum and the Forsyth exclave are additional views of the same canonical family', () => {
  const expected = {
    'haus-durachd': ['Faelaorn', 'Tir na Rann', 'Clans im Asyl'],
    'haus-eoghainn': ['Faelaorn', 'Tir na Rann', 'Clans im Asyl'],
    'haus-duff': ['Faelaorn', 'Tir na Mathgham', 'Clans im Asyl', 'Balgavrie'],
    'haus-airdmhor': ['Faelaorn', 'Tir na Mathgham', 'Clans im Asyl', 'Caisteal Gorm'],
    'haus-forsyth': ['Faelaorn', 'Tir na Mathgham', 'Exklaven', 'Inverfay']
  };
  for (const [id, path] of Object.entries(expected)) {
    const record = getRegisteredFamily(id);
    assert.equal(record.additionalPlacements.length, 1);
    assert.deepEqual(record.additionalPlacements[0].folderPath, path);
    assert.equal(index.families.get(id).placements.length, 2);
    assert.ok(resolveRegistryLocation(index, path).records.some(r => r.id === id && r.family === record.family));
    if (id !== 'haus-forsyth') assert.equal(record.additionalPlacements[0].houseProfile.liegeHouseId, '');
  }
  assert.deepEqual(getRegisteredFamily('haus-forsyth').folderPath, ['Faelaorn', 'Tir na Damh', 'Inverfay']);
  assert.deepEqual(searchRegistry(index, 'Duff Balgavrie').families.map(x => x.record.id), ['haus-duff']);
  assert.deepEqual(searchRegistry(index, 'Durachd Asyl').families.map(x => x.record.id), ['haus-durachd']);
});

test('Septs keep unknown locations, distinct clans and existing Dubhan links remain unambiguous', () => {
  for (const id of ['malairt', 'dubhair', 'grein', 'gaesa', 'treoir']) {
    const record = getRegisteredFamily('sept-' + id);
    assert.equal(record.family.document.houseProfile.rankId, 'sept-head');
    assert.equal(record.family.document.houseProfile.seat, '');
    assert.equal(record.family.lineage.crestFrame, 'iron');
    assert.deepEqual(record.folderPath, ['Faelaorn', 'Tir na Braigh']);
    assert.equal(record.type, 'commoner');
  }
  assert.equal(family('haus-ness').lineage.houseId, 'house-ness');
  assert.notEqual(family('haus-ness').lineage.houseId, family('haus-nessa').lineage.houseId);
  assert.notEqual(family('haus-bhaird').lineage.houseId, family('haus-an-bhaird').lineage.houseId);
  assert.deepEqual(getRegisteredFamily('haus-dubhan').folderPath, ['Faelaorn', 'Tir na Brann', 'Tir na Fuil', 'Caer Dubhan']);
  assert.equal(loadFamilyById('haus-mac-dubglais', { getItem: () => null }).id, 'haus-dubglais');
  for (const id of inventory.unresolvedIdentities) assert.ok(!FAELAORN_HOUSE_FAMILIES.some(f => f.lineage.houseId === id));
});

test('all 479 existing family records keep their exact pre-Faelaorn fingerprints', () => {
  const baseline = read('scripts/faelaorn-preparation/baseline-fingerprints.json');
  const laterBaseline = read('scripts/faelaorn-source-import/baseline-fingerprints.json');
  assert.equal(Object.keys(baseline).length, 479);
  assert.equal(FAMILY_REGISTRY.length, 518);
  for (const [id, fingerprint] of Object.entries(baseline)) {
    assert.equal(FAELAORN_SOURCE_COUNTER_PATCHES[id] ? laterBaseline[id] : fingerprintBeforeMathgham(family(id)), fingerprint, id);
  }
});

test('seven original tables and all 46 emblems have verified local source coordinates', () => {
  assert.equal(inventory.sources.length, 7);
  assert.equal(inventory.assets.length, 46);
  for (const entry of [...inventory.sources, ...inventory.assets]) {
    const bytes = fs.readFileSync(new URL('../' + entry.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
    if (!entry.url) continue;
    const cell = inventory.sources.find(s => s.id === entry.sourceId).rows.find(r => r.row === entry.sourceRow).cells[entry.sourceColumn];
    assert.equal(cell.images[0], entry.url);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), entry.width);
    assert.equal(bytes.readUInt32BE(20), entry.height);
  }
});
