import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { realmsById } from '../catalog.mjs';
import { createTerritoryArticle } from '../territory-article.mjs';
import { createAcceptedPlace } from '../place-content.mjs';
import { createAcceptedHouseContent } from '../house-content.mjs';
import { realmPlaces } from '../map-places.mjs';
import { getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createHouseBiography } from '../../../Familien Häuser und Clans/modules/house-content/house-content-outputs.mjs';

const root = new URL('../../../', import.meta.url);
const read = file => JSON.parse(fs.readFileSync(new URL(file, root), 'utf8'));
const realm = realmsById.get('aeldrunmar');
const ids = ['ransford', 'heswick'];

test('the two maritime Reeves belong directly to Tharn and live in Trentmorath', () => {
  for (const id of ids) {
    const house = realm.housesById.get(id);
    assert.equal(house.rankId, 'knight-prince');
    assert.equal(house.rank, 'Reeve (Ritterfürst)');
    assert.equal(house.liegeId, 'tharn');
    assert.equal(house.seatId, 'trentmorath');
    assert.equal(house.isSeatRuler, false);
    const family = getRegisteredFamily(house.familyId);
    assert.equal(family.houseProfile.rankId, 'knight-prince');
    assert.equal(family.houseProfile.liegeHouseId, 'house-tharn');
    assert.deepEqual(family.folderPath, ['Aeldrunmar', 'Earltum Tharnmere', 'Trentmorath']);
    assert.equal(family.family.persons.length, 0);
    assert.equal(family.family.partnerships.length, 0);
    assert.equal(family.family.extensions.acceptedOn, '2026-11-02');
    assert.match(family.family.extensions.territorialSource, /aeldrunmar-tharn-houses\.source\.json$/);
    const content = createAcceptedHouseContent(realm, house);
    assert.equal(content.profile.highestTitle, 'Reeve (Ritterfürst)');
    assert.equal(content.warriorGallery.entries[0].name, 'Særinc');
    assert.equal(house.warrior.withHorse, false);
    for (const image of [house.crest, house.crestFull, house.warrior.image, house.warrior.fullsize]) {
      assert.ok(fs.existsSync(new URL(image.slice(1), root)), image);
    }
  }
  assert.match(realm.housesById.get('ransford').motif, /silberner Dorsch/);
  assert.match(realm.housesById.get('heswick').motif, /Drei goldene Heringe/);
});

test('city, place, map and Tharn biography agree without moving existing vassals', () => {
  const article = createTerritoryArticle(realm, realm.territoriesById.get('aeldrunmar-sitz-trentmorath'));
  const place = createAcceptedPlace(realm, realm.settlementsById.get('trentmorath'));
  const marker = realmPlaces(realm).markers.find(p => p.id === 'aeldrunmar-trentmorath');
  for (const id of ids) {
    assert.ok(article.families.flatMap(g => g.houses).some(h => h.familyId === `haus-${id}` && h.liege === 'Haus Tharn'));
    assert.ok(place.houses.flatMap(g => g.items).some(h => h.familyId === `haus-${id}`));
    assert.ok(marker.residentFamilyIds.includes(`haus-${id}`));
    assert.equal(realmPlaces(realm).markers.filter(p => p.residentFamilyIds.includes(`haus-${id}`)).length, 1);
  }
  const tharn = createAcceptedHouseContent(realm, realm.housesById.get('tharn'));
  const biography = createHouseBiography(tharn);
  for (const id of ids) assert.ok(biography.house.documents.some(d => d.link?.endsWith(`haus=${`haus-${id}`}`)));
  for (const [id, seat] of [['dimholt', 'luthirrith'], ['wend', 'linthar'], ['scandyn', 'scandmere']]) {
    assert.equal(realm.housesById.get(id).seatId, seat);
    assert.ok(tharn.relatedRecords.some(r => r.title === `Haus ${realm.housesById.get(id).name}`));
  }
});

test('new art retains its originals, alpha receipts and separate supplemental provenance', () => {
  const source = 'shared/accepted-realms/sources/tharn-20261102/';
  const alpha = read(source + 'alpha-receipts.json');
  const manifest = read('shared/accepted-realms/sources/art-manifest.json');
  for (const original of alpha.originals) for (const [file, hash] of Object.entries(original.originals)) {
    assert.equal(createHash('sha256').update(fs.readFileSync(new URL(source + 'raw/' + file, root))).digest('hex'), hash);
  }
  assert.ok(alpha.crests.every(c => c.rgbUnchanged && JSON.stringify(c.alphaValues) === '[0,255]'));
  assert.deepEqual(alpha.warriorAudit.failures, []);
  assert.equal(manifest.realms.aeldrunmar.supplementalSnapshots.length, 1);
  for (const id of ids) assert.ok(manifest.realms.aeldrunmar.houses[id]);
});
