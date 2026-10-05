import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { VENNYR_TERRITORIES, VENNYR_TERRITORIAL_HOUSES } from '../assets/js/data/vennyr-territorial-catalog.js';
import { VENNYR_NEW_HOUSE_FAMILIES } from '../assets/js/data/vennyr-house-families.js';
import { HOUSE_DIANC_ABERDAIL_FAMILY } from '../assets/js/data/house-dianc-family.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { loadFamilyById } from '../assets/js/services/family-library.js';
import { createRegistryBrowserIndex, registryPathKey } from '../assets/js/modules/family-registry/registry-browser-model.js';

const audit = JSON.parse(fs.readFileSync(new URL('../assets/data/source-inventories/vennyr-territories-2026-10-05.json', import.meta.url), 'utf8'));

test('Vennyrs 25 belegte Häuser erscheinen einmal unter den sechs richtigen Oberherrschaften', () => {
  assert.equal(VENNYR_TERRITORIES.length, 6);
  assert.equal(VENNYR_TERRITORIAL_HOUSES.length, 25);
  assert.equal(new Set(VENNYR_TERRITORIAL_HOUSES.map(h => h.familyId)).size, 25);
  const index = createRegistryBrowserIndex(FAMILY_REGISTRY);
  for (const house of VENNYR_TERRITORIAL_HOUSES) {
    const records = FAMILY_REGISTRY.filter(record => record.id === house.familyId);
    assert.equal(records.length, 1, house.name);
    const record = records[0];
    assert.deepEqual(record.folderPath, house.folderPath, house.name);
    assert.equal(record.houseProfile.rankId, house.rankId, house.name);
    assert.equal(record.family.lineage.houseId, house.houseId, house.name);
    const node = index.nodes.get(registryPathKey(['Vennyr', house.region]));
    assert.ok(node.familyIds.has(house.familyId), house.name);
  }
  for (const territory of VENNYR_TERRITORIES) {
    const family = getRegisteredFamily(territory.mainFamilyId).family;
    assert.equal(family.document.houseProfile.rankId, territory.name === 'Blütenland' ? 'royal' : 'county');
  }
});

test('alle dreizehn neuen Hausakten enthalten ihre ergänzten Quellenlinien, Wappen und Sitze ohne erfundene Ränge', () => {
  assert.equal(VENNYR_NEW_HOUSE_FAMILIES.length, 13);
  assert.equal(VENNYR_NEW_HOUSE_FAMILIES.filter(family => family.extensions.blankFamily).length, 0);
  for (const family of VENNYR_NEW_HOUSE_FAMILIES) {
    assertValidFamily(family);
    assert.equal(family.extensions.blankFamily, false);
    assert.equal(family.document.houseProfile.rankId, 'unknown');
    assert.ok(family.document.houseProfile.seat);
    assert.ok(family.document.emblem);
    for (const collection of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps']) {
      assert.ok(Array.isArray(family[collection]), `${family.document.id}: ${collection}`);
    }
    assert.ok(family.lineage.founderPartnershipId);
    assert.ok(family.view.focusPersonId);
  }
  assert.equal(getRegisteredFamily('haus-diafol').houseProfile.rankId, 'unknown');
});

test('Quellwappen stimmen mit den lokalen Dateien überein und Blütenland behält sein bestehendes Wappen', () => {
  for (const asset of audit.assets.filter(asset => asset.kind !== 'kingdom')) {
    const content = fs.readFileSync(new URL(`../${asset.target}`, import.meta.url));
    assert.equal(createHash('sha256').update(content).digest('hex'), asset.sha256, asset.name);
  }
  const territory = VENNYR_TERRITORIES.find(entry => entry.name === 'Blütenland');
  assert.equal(territory.emblemPath, 'assets/images/regions/bluetenland.png');
  assert.equal(getRegisteredFamily('haus-blodyn').houseProfile.regionEmblems.kingdom, 'assets/images/regions/vennyr.png');
  assert.deepEqual(audit.unassignedSettlements, ['Castell Asyn', 'Gwelladarn', 'Porwynfa', 'Maesgorn', 'Carnadwyth']);
  assert.equal(audit.sources.length, 7);
});

test('Bleidd-Verweise öffnen die bestehende Blaidd-Akte statt eine zweite Dynastie', () => {
  assert.equal(loadFamilyById('haus-bleidd', null).id, 'haus-blaidd');
  assert.equal(FAMILY_REGISTRY.filter(record => record.id === 'haus-blaidd').length, 1);
  assert.equal(getRegisteredFamily('haus-bleidd'), null);
});

test('Diancs Rangkorrektur migriert alte Gwynlann-Akten und bewahrt lokale Inhalte sowie Aberdail', () => {
  const registered = getRegisteredFamily('haus-dianc').family;
  const stale = structuredClone(registered);
  stale.extensions.sourceRevision = 2;
  delete stale.extensions.registryManagedHouseProfileFields;
  stale.document.houseProfile.rankId = 'unknown';
  stale.document.houseProfile.secondarySeats = ['Lokaler Sitz'];
  stale.persons[0].notes = 'Lokale Ergänzung';
  stale.lineage.crestSubtitle = 'Lokales Hauswort';
  stale.view.focusPersonId = stale.persons[1].id;
  stale.view.ancestorDepth = 3;
  stale.view.descendantDepth = 6;
  stale.view.limitGenerations = true;
  const before = normalizeFamily(stale);
  const upgraded = resolveRegisteredFamilyUpgrade(registered, stale);
  assert.equal(upgraded.document.houseProfile.rankId, 'county');
  assert.equal(upgraded.extensions.sourceRevision, registered.extensions.sourceRevision);
  assert.deepEqual(upgraded.document.houseProfile.secondarySeats, ['Lokaler Sitz']);
  assert.deepEqual(upgraded.lineage, before.lineage);
  assert.deepEqual(upgraded.view, before.view);
  for (const collection of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps']) {
    assert.deepEqual(upgraded[collection], before[collection], collection);
  }
  assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, upgraded), upgraded);
  assert.equal(HOUSE_DIANC_ABERDAIL_FAMILY.document.houseProfile.rankId, 'knight-prince');
  assert.equal(HOUSE_DIANC_ABERDAIL_FAMILY.extensions.sourceRevision, 2);
});
