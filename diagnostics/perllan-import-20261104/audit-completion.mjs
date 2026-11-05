import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_CONTENT } from '../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Perllan/haus.content.mjs';
import { createHouseholdIndex } from '../../Karten/modules/households/household-model.mjs';

const root = new URL('../../', import.meta.url);
const read = path => readFile(new URL(path, root));
const json = async path => JSON.parse(await read(path));
const hash = data => createHash('sha256').update(data).digest('hex');
const id = 'haus-perllan';
const record = FAMILY_REGISTRY.find(entry => entry.id === id);
const family = record.family;
const snapshot = await json(`Stammbäume/assets/data/published-families/${id}.json`);
assert.deepEqual(snapshot.family, family);
const galleryBefore = await json('diagnostics/perllan-import-20261104/before-catalog.json');
const gallery = await json('Gallerien/krieger/data/catalog.json');
assert.deepEqual(gallery.houses.filter(entry => entry.id !== id), galleryBefore.houses);
assert.deepEqual(gallery.illustrations.filter(entry => !entry.houseIds.includes(id)), galleryBefore.illustrations);
assert.equal(gallery.houses.filter(entry => entry.id === id).length, 1);
assert.equal(gallery.illustrations.filter(entry => entry.houseIds.includes(id)).length, 1);
const csvBefore = await read('diagnostics/perllan-import-20261104/before-haeuser.csv');
const csv = await read('Gallerien/krieger/data/haeuser.csv');
assert(csv.subarray(0, csvBefore.length).equals(csvBefore), 'Unrelated CSV bytes changed.');
const householdBefore = await json('diagnostics/perllan-import-20261104/before-households.generated.json');
const households = await json('Karten/modules/households/households.generated.json');
assert.deepEqual(households.families.filter(entry => entry.id !== id), householdBefore.families);
assert.deepEqual(households.reviewedPins, householdBefore.reviewedPins);
assert(createHouseholdIndex(households).bySeat.get('gwynthor').some(entry => entry.family.id === id));
const inventory = await json('Stammbäume/assets/data/source-inventories/perllan-20261104/inventory.json');
for (const file of inventory.files) {
  assert.equal(hash(await read(`Stammbäume/assets/data/source-inventories/perllan-20261104/${file.path}`)), file.sha256);
  if (file.activePath) assert.equal(hash(await read(`Stammbäume/${file.activePath}`)), file.sha256);
}
const characterReview = await json('diagnostics/perllan-20261104/character-import-review.json');
assert.equal(characterReview.unrelated.unchanged, true);
const registry = await json('CharakterDatenbank/registry.json');
const registeredCharacters = registry.records.filter(entry => entry.worldPersonId?.startsWith('person--perllan--'));
assert.equal(registeredCharacters.length, 27);
const pageContext = { window: {} };
vm.runInNewContext((await read('Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Perllan/haus.data.js')).toString(), pageContext);
const page = pageContext.window.HAEUSER_DATA;
assert.equal(page.figures.entries.length, 27);

// HTTP verifies served bytes and routes; it does not claim rendered browser QA.
const origin = 'http://127.0.0.1:5500/';
const media = new Set(inventory.files.filter(file => file.activePath).map(file => `Stammbäume/${file.activePath}`));
media.add('Familien Häuser und Clans/' + HOUSE_CONTENT.images.scene);
const http = [];
const mediaPaths = [...media];
// Keep the local static server's connection backlog bounded.
for (let offset = 0; offset < mediaPaths.length; offset += 4) {
http.push(...await Promise.all(mediaPaths.slice(offset, offset + 4).map(async path => {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(await read(path)), path);
  return { path, status: 200, bytesMatch: true };
})));
}
for (const path of [
  'Familien Häuser und Clans/kleinehaeuser.html?haus=haus-perllan',
  'Stammbäume/Stammbaum.html?family=haus-perllan&mode=view',
  'Stammbäume/assets/data/published-families/haus-perllan.json',
  'AleriaAlmanach/AleriaAlmanach.html',
]) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  http.push({ path, status: 200 });
}
const report = { schema: 'aleria.perllan-completion-review', reviewedAt: '2026-11-04',
  localOnly: true, familyId: id,
  counts: { persons: family.persons.length, partnerships: family.partnerships.length, parentages: family.parentages.length,
    namedCharacters: registeredCharacters.length, unknownPlaceholdersInTree: 17, originalMedia: media.size - 1,
    newHouseFigures: 1, picturedAnimalCompanions: 4 },
  preserved: { galleryHouses: galleryBefore.houses.length, galleryIllustrations: galleryBefore.illustrations.length,
    galleryCsvPrefixBytes: csvBefore.length, householdRecords: householdBefore.families.length,
    characterRecords: characterReview.existingCharactersPreserved, sourceChecksums: inventory.files.length },
  localSnapshotMatchesRegistry: true, http,
  browser: { status: 'limited', reason: 'CUA browser tab navigation and DOM inspection fail with timeoutMs adapter error; no rendered browser pass claimed.' },
  firestoreWrites: 0, pushed: false, deployed: false };
await writeFile(new URL('completion-review.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, http: { checked: http.length, passed: http.length } }));
