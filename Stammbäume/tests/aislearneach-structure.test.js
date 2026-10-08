import { MATHGHAM_SOURCE_COUNTER_PATCHES } from '../assets/js/data/mathgham-source-counter-patches.js';
import { FAELAORN_SOURCE_COUNTER_PATCHES } from '../assets/js/data/faelaorn-source-counter-patches.js';
import { ALBEN_SOURCE_PORTRAITS, ALBEN_SOURCE_PORTRAIT_FAMILIES } from '../assets/js/data/alben-source-portraits.js';
import test from 'node:test';
import { AISLEARNEACH_SOURCE_COUNTER_PATCHES as patches } from '../assets/js/data/aislearneach-source-counter-patches.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { AISLEARNEACH_HOUSE_DEFINITIONS, AISLEARNEACH_REGISTRY_FOLDERS, AISLEARNEACH_EMBLEM } from '../assets/js/data/aislearneach-territorial-catalog.js';
import { AISLEARNEACH_HOUSE_FAMILIES } from '../assets/js/data/aislearneach-house-families.js';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { FAMILY_REGISTRY_FOLDERS } from '../assets/js/data/family-registry-folders.js';
import { assertValidFamily, normalizeFamily } from '../assets/js/domain/family-schema.js';
import { createRegistryBrowserIndex, resolveRegistryLocation, searchRegistry } from '../assets/js/modules/family-registry/registry-browser-model.js';
import { loadFamilyById } from '../assets/js/services/family-library.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';

const inventory = JSON.parse(fs.readFileSync(new URL('../assets/data/source-inventories/aislearneach-2026-10-07.json', import.meta.url), 'utf8'));
const sourceCell = (id, row, column = 0) => inventory.sources.find(source => source.id === id).rows.find(entry => entry.row === row).cells[column];
const family = id => getRegisteredFamily(id).family;

test('Aislearneach adds exactly nineteen populated, browser- and server-valid families', () => {
  assert.equal(AISLEARNEACH_HOUSE_FAMILIES.length, 19);
  assert.equal(new Set(FAMILY_REGISTRY.map(record => record.id)).size, FAMILY_REGISTRY.length);
  assert.equal(inventory.expectedCounts.families, AISLEARNEACH_HOUSE_FAMILIES.length);
  assert.deepEqual(inventory.houses, AISLEARNEACH_HOUSE_DEFINITIONS);
  for (const definition of AISLEARNEACH_HOUSE_DEFINITIONS) {
    const normalized = normalizeFamily(family(definition.familyId));
    assertValidFamily(normalized);
    assert.equal(normalized.extensions.blankFamily, false);
    assert.equal(normalized.extensions.sourceRevision, MATHGHAM_SOURCE_COUNTER_PATCHES[normalized.document.id]?.revision || FAELAORN_SOURCE_COUNTER_PATCHES[normalized.document.id]?.revision || ALBEN_SOURCE_PORTRAIT_FAMILIES[normalized.document.id]?.revision || 2);
    assert.equal(normalized.houses[0].id, definition.houseId);
    assert.equal(normalized.lineage.houseId, definition.houseId);
    assert.ok(normalized.persons.length > 0);
    assert.ok(normalized.partnerships.some(p => p.id === normalized.lineage.founderPartnershipId));
    assert.ok(normalized.persons.some(p => p.id === normalized.view.focusPersonId));
    const { persons, partnerships, parentages, houses, cadetBranches, timeJumps, ...root } = normalized;
    const validation = validateWorkspaceForPublishing({
      root: { ...root, familyId: definition.familyId },
      collections: { persons, partnerships, parentages, houses, cadetBranches, timeJumps }
    });
    assert.equal(validation.valid, true, validation.diagnostics.join('\n'));
  }
});

test('source columns determine names and crests; documented corrections have independent evidence', () => {
  for (const definition of AISLEARNEACH_HOUSE_DEFINITIONS) {
    const { id, nameRow, seatRow, emblemRow, column } = definition.source;
    if (!['fintain', 'durthacht'].includes(definition.slug)) {
      assert.equal(sourceCell(id, nameRow, column).text.replaceAll("'", '’'), definition.name);
    }
    if (!['gaisgh', 'luchdon'].includes(definition.slug)) {
      assert.equal(sourceCell(id, seatRow, column).text, definition.seat);
    }
    const asset = inventory.assets.find(entry => entry.path === definition.emblem);
    assert.equal(asset.source, sourceCell(id, emblemRow, column).images[0]);
  }
  for (const [id, column] of [['fintain', 1], ['durthacht', 2]]) {
    const definition = AISLEARNEACH_HOUSE_DEFINITIONS.find(entry => entry.slug === id);
    assert.equal(sourceCell('aislearneach', 94, column).text.replaceAll("'", '’'), definition.name);
    assert.equal(sourceCell('aislearneach', 95, column).images[0], sourceCell(definition.source.id, 71).images[0]);
  }
  assert.equal(sourceCell('tir-na-faela', 72).text, "Tir An'Ceallaigh");
  assert.equal(sourceCell('tir-na-faela', 36, 2).text, 'Eachan Fintain');
  assert.equal(sourceCell('aislearneach', 57, 1).text, 'Croga');
  assert.equal(sourceCell('aislearneach', 59, 1).text, 'Eachan Fintain');
  assert.equal(family('haus-fintain').document.houseProfile.seat, 'Croga');
  assert.equal(sourceCell('tir-na-faela', 50).text, 'Cethearlach');
  assert.equal(family('haus-feannag').document.houseProfile.seat, 'Caetharlach');
});

test('user corrections override the swapped Broch seats and distinguish expulsion from extinction', () => {
  for (const [id, seat, column, person] of [
    ['haus-gaisgh', 'Broch an Traigh', 4, 'Seumas Gaisgh'],
    ['haus-luchdon', 'Broch an Creig', 3, 'Liamach Luchdon']
  ]) {
    assert.equal(family(id).document.houseProfile.seat, seat);
    assert.equal(sourceCell('tir-na-iomaire', 56, column).text, seat);
    assert.equal(sourceCell('tir-na-iomaire', 58, column).text, person);
    assert.match(family(id).extensions.sourceNote, /Nutzerkorrektur/);
  }
  const expelled = family('haus-ui-faill-duibhne');
  assert.equal(expelled.houses[0].status, 'expelled');
  assert.equal(expelled.extensions.extinctHouse, undefined);
  assert.equal(expelled.document.houseProfile.rankId, 'unknown');
  assert.equal(expelled.document.houseProfile.liegeHouseId, '');
  assert.match(expelled.document.description, /begnadigter Teil der Familie überlebte/);
  assert.ok(expelled.persons.some(p => p.status === 'alive'));
  assert.equal(inventory.decisions.filter(entry => entry.status === 'user-corrected').length, 2);
});

test('five territories and ten seats remain separate from empty template realms and organizations', () => {
  const index = createRegistryBrowserIndex(FAMILY_REGISTRY, FAMILY_REGISTRY_FOLDERS);
  const root = resolveRegistryLocation(index, ['Aislearneach']);
  assert.equal(root.totalCount, 19);
  assert.equal(root.children.length, 5);
  assert.equal(root.children.reduce((sum, territory) => sum + territory.children.length, 0), 10);
  for (const [name, count] of [['Geach', 4], ['Tirth', 5], ['Faela', 2], ['Adharcach', 3], ['Iomaire', 5]]) {
    assert.equal(resolveRegistryLocation(index, ['Aislearneach', `Tir na ${name}`]).totalCount, count);
  }
  for (const definition of AISLEARNEACH_HOUSE_DEFINITIONS) {
    assert.equal(family(definition.familyId).document.houseProfile.barony, '');
  }
  for (const query of ['Aislaerneach', 'Tir na Gaech', 'Cethearlach']) {
    assert.ok(searchRegistry(index, query).folders.length > 0, query);
  }
  for (const [query, ids] of [['Aislearneach Fintain', ['haus-fintain', 'haus-feannag']], ['Aislearneach Traigh', ['haus-gaisgh']], ['Aislearneach Creig', ['haus-luchdon']], ['Techtmar', ['sept-techtmar']]]) {
    assert.deepEqual(searchRegistry(index, query).families.map(entry => entry.record.id), ids);
  }
  assert.equal(FAMILY_REGISTRY.filter(record => /windreiter|ahnenschilde|derbforgaill/i.test(record.id)).length, 0);
});

test('ecclesiastical government, noble ranks and civilian septs do not fabricate ruling houses', () => {
  assert.equal(family('haus-morna').document.houseProfile.rankId, 'ard-tiarna');
  for (const id of ['haus-fintain', 'haus-durthacht', 'haus-ceallaigh']) {
    assert.equal(family(id).document.houseProfile.rankId, 'mor-tiarna');
    assert.equal(family(id).document.houseProfile.liegeHouseId, 'haus-morna');
  }
  for (const id of ['haus-muileach', 'haus-feannag']) {
    assert.equal(family(id).document.houseProfile.rankId, 'dun-tiarna');
  }
  for (const id of ['haus-uilebheist', 'haus-cnogan']) {
    assert.equal(family(id).document.houseProfile.rankId, 'laird');
    assert.equal(family(id).document.houseProfile.liegeHouseId, '');
    assert.match(family(id).document.houseProfile.liegeHouseName, /Sagarth von Foraoise/);
  }
  assert.equal(getRegisteredFamily('sept-techtmar').type, 'commoner');
  assert.equal(family('sept-techtmar').document.houseProfile.liegeHouseId, '');
  assert.equal(family('sept-techtmar').lineage.crestFrame, 'iron');
});

test('existing target IDs resolve and counterpart identities and local edits remain intact', () => {
  for (const id of ['haus-morna', 'haus-durthacht', 'haus-fintain', 'haus-rioga', 'haus-feannag', 'haus-muileach']) {
    assert.ok(FAMILY_REGISTRY.some(record => record.family.cadetBranches.some(branch => branch.targetFamilyId === id)), id);
  }
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
      for (const key of Object.keys(person)) assert.equal(actual[key], patches[audit.familyId]?.collections.persons?.[person.id]?.[key] ?? person[key]);
    }
  }
  assert.equal(getRegisteredFamily('haus-tir-fiachiontach'), null);
  assert.ok(family('haus-ciarog').houses.some(house => house.id === 'house-tir-fiachiontach'));
  const local = structuredClone(getRegisteredFamily('haus-morna'));
  local.family.persons.push({ id: 'local-person', name: 'Lokale Ergänzung', houseId: 'house-morna', notes: 'Eigene Recherche' });
  local.family.document.description = 'Eigene Notiz';
  const storage = { getItem: key => key === 'aleria.family-tree.saved-families.v1' ? JSON.stringify([local]) : null };
  for (let repeat = 0; repeat < 2; repeat++) {
    const loaded = loadFamilyById('haus-morna', storage);
    assert.equal(loaded.family.persons.length, family('haus-morna').persons.length + 1);
    assert.equal(loaded.family.persons.find(p => p.id === 'local-person').notes, 'Eigene Recherche');
    assert.equal(loaded.family.document.description, 'Eigene Notiz');
  }
});

test('six byte-exact source snapshots and twenty-four original emblems have verified provenance', () => {
  assert.equal(inventory.sources.length, 6);
  const used = new Set([
    ...AISLEARNEACH_REGISTRY_FOLDERS.map(folder => folder.icon).filter(Boolean),
    ...AISLEARNEACH_HOUSE_DEFINITIONS.map(definition => definition.emblem)
  ]);
  assert.equal(used.size, 24);
  assert.deepEqual(used, new Set(inventory.assets.map(asset => asset.path)));
  assert.equal(AISLEARNEACH_EMBLEM, family('haus-morna').document.emblem);
  assert.equal(sourceCell('aislearneach', 0).images[0], sourceCell('tir-na-geach', 71).images[0]);
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
