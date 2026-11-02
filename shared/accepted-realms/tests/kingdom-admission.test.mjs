import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { realmsById } from '../catalog.mjs';
import { createTerritoryArticle } from '../territory-article.mjs';
import { createAcceptedHouseContent } from '../house-content.mjs';
import { createAcceptedPlace } from '../place-content.mjs';
import { getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { realmPlaces } from '../map-places.mjs';
import { shouldPublish } from '../../../netlify/build/site-publish.mjs';

const root = new URL('../../../', import.meta.url);
const read = file => JSON.parse(fs.readFileSync(new URL(file, root), 'utf8'));
const kingdoms = ['aeldrunmar', 'talyndor', 'brevanor'].map(id => realmsById.get(id));
const existing = read('shared/accepted-realms/sources/kingdom-existing-families-20261101.json');

test('the four Aldervan countries keep continent, territory, house and place hierarchies aligned', () => {
  for (const id of ['aeldrunmar', 'talyndor', 'brevanor', 'deitheach']) {
    const realm = realmsById.get(id);
    assert.equal(realm.continent, 'Aldervan', id);
    for (const territory of realm.territories) {
      assert.ok(territory.href.startsWith(`/Kontinente/Aldervan/${realm.name}/`));
      const page = createTerritoryArticle(realm, territory);
      assert.equal(page.hierarchy[1].name, 'Aldervan');
    }
    for (const house of realm.houses) assert.equal(createAcceptedHouseContent(realm, house).hierarchy[0].name, 'Aldervan');
    for (const place of realm.settlements) assert.equal(createAcceptedPlace(realm, place).hierarchy[0].name, 'Aldervan');
    const map = read(`Karten/${realm.name}/data.json`);
    assert.ok(map.state.dominions.every(t => realm.territoriesById.has(t.id)));
  }
  for (const name of ['Talyndor', 'Brevanor']) for (const feature of ['Kontinente', 'Orte', 'Familien Häuser und Clans']) {
    assert.equal(fs.existsSync(new URL(`${feature}/Lothir/${name}/`, root)), false, `${feature}/${name} has no stale country tree`);
    assert.ok(fs.existsSync(new URL(`${feature}/Aldervan/${name}/`, root)));
  }
});

test('the three approved drafts and authorized additions yield 70 territories, 53 places and 82 unique house records', () => {
  assert.equal(kingdoms.reduce((n, r) => n + r.territories.length, 0), 70);
  assert.equal(kingdoms.reduce((n, r) => n + r.settlements.length, 0), 53);
  assert.equal(kingdoms.reduce((n, r) => n + r.houses.length, 0), 82);
  for (const realm of kingdoms) {
    const draft = read(`shared/accepted-realms/sources/placements/${realm.id}-entwurf.json`);
    for (const [id, seat] of Object.entries(draft.placements)) assert.equal(realm.housesById.get(id).seatId, seat);
    assert.equal(realm.territories.some(t => t.level === 'house'), false);
    for (const house of realm.houses) {
      const record = getRegisteredFamily(house.familyId);
      assert.ok(record);
      assert.equal(record.folderPath.at(-1), realm.settlementsById.get(house.seatId).name);
      if (!existing[house.familyId]) {
        assert.equal(record.family.persons.length, 0);
        assert.equal(record.family.partnerships.length, 0);
      }
    }
  }
});

test('all nine existing families retain their complete identities and genealogies', () => {
  assert.equal(Object.keys(existing).length, 9);
  let people = 0;
  for (const [id, before] of Object.entries(existing)) {
    const current = getRegisteredFamily(id).family;
    for (const field of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'lineage', 'houses', 'timeJumps']) assert.deepEqual(current[field], before[field], `${id}/${field}`);
    people += current.persons.length;
  }
  assert.equal(people, 264);
});

test('Halfax and Ashby stay extinct and are separated from living capital houses', () => {
  const realm = realmsById.get('aeldrunmar');
  const article = createTerritoryArticle(realm, realm.territoriesById.get('aeldrunmar-sitz-aeldrunhal'));
  const historical = article.families.find(s => s.variant === 'extinct');
  assert.deepEqual(historical.houses.map(h => h.familyId).sort(), ['haus-ashby', 'haus-halfax']);
  for (const id of ['halfax', 'ashby']) {
    assert.equal(getRegisteredFamily(`haus-${id}`).family.houses[0].status, 'extinct');
    assert.equal(createAcceptedHouseContent(realm, realm.housesById.get(id)).extinct, true);
  }
  const capital = realmPlaces(realm).markers.find(p => p.id === 'aeldrunmar-aeldrunhal');
  assert.ok(!capital.residentFamilyIds.includes('haus-halfax'));
  assert.ok(!capital.residentFamilyIds.includes('haus-ashby'));
  const place = createAcceptedPlace(realm, realm.settlementsById.get('aeldrunhal'));
  assert.equal(place.houses.find(g => g.variant === 'extinct').items.length, 2);
  assert.equal(place.houses[0].items.some(h => h.familyId === 'haus-halfax'), false);
  assert.match(place.structure['bekannte familien'], /Halfax \(ausgestorben\)/);
});

test('historical kingdoms do not acquire Deitheach history or present-day resident claims', () => {
  for (const realm of kingdoms.filter(r => r.historical)) {
    for (const seat of realm.settlements) {
      const place = createAcceptedPlace(realm, seat);
      assert.doesNotMatch(place.sections.history.join(' '), /Fürstentum Deitheach/);
      assert.match(place.sections.history.join(' '), new RegExp(realm.name));
    }
    assert.ok(realmPlaces(realm).markers.every(p => p.residentFamilyIds.length === 0));
    for (const h of realm.houses) assert.equal(createAcceptedHouseContent(realm, h).profile.people, realm.people);
  }
});

test('Thornwick retains Refri and the lost Thornholt seat without an invented restored castle', () => {
  const realm = realmsById.get('talyndor'), house = realm.housesById.get('thornwick');
  assert.equal(house.seatId, 'wensbury');
  assert.equal(house.homeless, true);
  assert.equal(house.liegeId, 'warren');
  const content = createAcceptedHouseContent(realm, house);
  assert.equal(content.currentHead, 'Refri Thornwick');
  assert.match(content.biographySummary.history, /Thornholt/);
  assert.ok(!realmPlaces(realm).markers.some(p => /Thornholt/.test(p.title)));
});

test('Scandyn keeps its separate seat with no invented map pin or warrior', () => {
  const realm = realmsById.get('aeldrunmar'), house = realm.housesById.get('scandyn');
  assert.equal(house.seatId, 'scandmere');
  assert.equal(house.liegeId, 'tharn');
  assert.equal(realm.settlementsById.get('scandmere').point, null);
  const map = read('Karten/Aeldrunmar/data.json');
  assert.equal(map.state.pins.length, 23);
  assert.ok(!map.state.pins.some(p => /Scandmere/.test(p.title)));
  assert.equal(createAcceptedHouseContent(realm, house).warriorGallery.entries.length, 0);
});

test('Aeldrunmar has no bishoprics: Virelath is a Thaintum, Luthirrith a knightly dominion', () => {
  const realm = realmsById.get('aeldrunmar');
  assert.equal(realm.territoriesById.get('aeldrunmar-sitz-virelath').type, 'Thaintum');
  assert.equal(realm.territoriesById.get('aeldrunmar-sitz-luthirrith').type, 'Ritterliche Herrschaft');
  assert.equal(realm.territoriesById.get('aeldrunmar-sitz-virelath').rulerId, 'trent');
  assert.equal(realm.territoriesById.get('aeldrunmar-sitz-luthirrith').rulerId, 'dimholt');
  assert.doesNotMatch(JSON.stringify(realm.context), /Bistum|Bistümer|Bischof/);
  assert.ok(realm.settlements.every(s => s.kind !== 'Bistum'));
  const order = realm.territoriesById.get('aeldrunmar-sitz-hingstgard');
  assert.equal(order.rulerId, '');
  assert.equal(order.type, 'Ordensgebiet');
});

test('Brethneach emblem, Bielle rank and Gerain/Kervaut seat-only exchange survive admission', () => {
  const realm = realmsById.get('brevanor');
  assert.equal(realm.housesById.get('bielle').rankId, 'brenor');
  assert.equal(realm.housesById.get('gerain').seatId, 'hervant');
  assert.equal(realm.housesById.get('kervaut').seatId, 'caerennes');
  assert.equal(realm.housesById.get('gerain').warrior.classId, 'cantrel');
  assert.equal(realm.housesById.get('kervaut').warrior.classId, 'silvain');
  const article = createTerritoryArticle(realm, realm.territoriesById.get(realm.rootId));
  assert.equal(article.historySections[0].title, 'Antikes Fürstentum Brethneach');
  assert.ok(article.historySections[0].images[0].src.includes('history-brethneach'));
});

test('source captures stay archived while canonical runtime data and original images remain publishable', () => {
  assert.equal(shouldPublish('shared/accepted-realms/sources/brevanor.snapshot.json'), false);
  assert.equal(shouldPublish('shared/accepted-realms/authoring/kingdom-decisions.mjs'), false);
  assert.equal(shouldPublish('shared/accepted-realms/scripts/capture-kingdom-sources.mjs'), false);
  assert.equal(shouldPublish('shared/accepted-realms/data/brevanor.source.json'), true);
  assert.equal(shouldPublish('Stammbäume/assets/images/references/accepted-realms/brevanor/aubert/krieger.png'), true);
});

test('map lettering keeps original rasters and dimensions while showing confirmed names and the corrected domains', () => {
  for (const realm of kingdoms) {
    const svg = fs.readFileSync(new URL(realm.map.slice(1), root), 'utf8');
    const embedded = svg.match(/href="data:image\/webp;base64,([A-Za-z0-9+/=]+)"/);
    assert.ok(embedded);
    assert.deepEqual(Buffer.from(embedded[1], 'base64'), fs.readFileSync(new URL(realm.mapSource.slice(1), root)));
    assert.ok(!svg.includes('<script'));
    if (realm.id === 'aeldrunmar') {
      assert.match(svg, />Ritterliche Herrschaft<\/text>/);
      assert.match(svg, />Thaintum<\/text>/);
      assert.match(svg, />Eadwick<\/text>/);
      assert.doesNotMatch(svg, /Bistum/);
    } else for (const place of realm.settlements) assert.ok(svg.includes(`>${place.name}</text>`), place.name);
  }
});
