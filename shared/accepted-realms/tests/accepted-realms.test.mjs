import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { realms, realmsById, allHouses, houseHref, placeHref, placeId } from '../catalog.mjs';
import { createAcceptedHouseContent } from '../house-content.mjs';
import { createAcceptedPlace } from '../place-content.mjs';
import { createTerritoryArticle } from '../territory-article.mjs';
import { createAcceptedTerritory } from '../../../Kontinente/modules/accepted-realms/territory-page.mjs';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_WEINLAUB_FAMILY } from '../../../Stammbäume/assets/js/data/house-weinlaub-family.js';
import { HOUSE_SONNENFELS_FAMILY } from '../../../Stammbäume/assets/js/data/house-sonnenfels-family.js';
import { HOUSE_HOCHREUTH_FAMILY } from '../../../Stammbäume/assets/js/data/house-hochreuth-family.js';
import { assertValidFamily } from '../../../Stammbäume/assets/js/domain/family-schema.js';
import { getHouseRank } from '../../../Stammbäume/assets/js/domain/house-profile.js';
import { createHousePageData, createHouseBiography } from '../../../Familien Häuser und Clans/modules/house-content/house-content-outputs.mjs';
import { hasNobleCourt, completeHouseOffices } from '../../../Familien Häuser und Clans/modules/court/house-court-model.mjs';

const root = new URL('../../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const json = file => JSON.parse(read(file));
const registry = file => { const context = { window: {} }; vm.runInNewContext(read(file), context); return context.window; };
const territories = registry('Kontinente/kontinente.registry.js').KONTINENTE_REGISTRY;
const places = registry('Orte/orte.registry.js').ORTE_REGISTRY;
const dataContext = { window: {} };
vm.runInNewContext(read('Kontinente/assets/js/herrschaft-data.js'), dataContext);
const h = (realm, id) => realmsById.get(realm).housesById.get(id);

test('accepted export bytes and every house placement match the supplied six drafts', () => {
  const receipts = json('shared/accepted-realms/sources/source-receipts.json');
  for (const receipt of receipts.exports) {
    assert.equal(createHash('sha256').update(fs.readFileSync(new URL(receipt.path, root))).digest('hex'), receipt.sha256);
    const draft = json(receipt.path), realm = realmsById.get(receipt.realm);
    for (const [id, seat] of Object.entries(draft.placements)) assert.equal(realm.housesById.get(id).seatId, seat, `${realm.id}/${id}`);
  }
});

test('all seven accepted countries, 119 houses and 74 seats have independent canonical entries', () => {
  assert.equal(realms.length, 7); assert.equal(allHouses.length, 119);
  assert.equal(new Set(allHouses.map(h => h.familyId)).size, 119);
  assert.equal(realms.reduce((n, r) => n + r.settlements.length, 0), 74);
  for (const realm of realms) {
    assert.ok(territories.some(t => t.id === realm.rootId));
    for (const seat of realm.settlements) assert.equal(places.filter(p => p.id === placeId(realm, seat)).length, 1);
    for (const house of realm.houses) {
      const record = getRegisteredFamily(house.familyId);
      assert.ok(record, house.familyId); assertValidFamily(record.family);
      assert.equal(record.family.lineage.houseId, house.houseId);
      assert.notEqual(getHouseRank(record.houseProfile.rankId).id, 'unknown', house.familyId);
    }
  }
});

test('Moinneach uses original variant, exact prefixes and the Gergonax/Tarvex swap', () => {
  const r = realmsById.get('moinneach');
  assert.equal(r.selectedVariant, 'original'); assert.equal(r.capital, 'gergonax');
  assert.equal(h('moinneach', 'cethrenn').rankId, 'ard-tiarna');
  assert.equal(h('moinneach', 'barrex').seatId, 'gergonax');
  assert.equal(h('moinneach', 'rowak').seatId, 'tarvex');
  assert.equal(r.territories.filter(t => t.level === 'region').length, 0);
  assert.deepEqual(r.houses.map(h => h.name).sort(), ['Nic Adruinna', 'Nic Kerlaouen', 'Ard Caddach', 'Mac Rowak', 'An Barrex', 'Tir An Cethrenn', 'Dál Damona', 'Ard Avernax', 'Ua Brigantex', 'Na Keravel', 'Ord Nemetex'].sort());
});

test('explicit western ranks and immediate local lieges override older workshop labels', () => {
  for (const id of ['ritten', 'rothmann', 'velten', 'hohenmund', 'truchsen']) assert.equal(h('aldingen', id).rankId, 'county', id);
  assert.equal(h('aldingen', 'rebhart').rankId, 'freiherr');
  assert.equal(h('aldingen', 'klingen').rankId, 'ducal');
  assert.equal(h('aldingen', 'dublann').liegeId, 'velten');
  assert.equal(h('goldmund', 'goldveld').rankId, 'ducal');
  assert.equal(realmsById.get('goldmund').title, 'Herzogtum Goldmund');
  for (const [id, ruler] of [['gueldenfels', 'broeck'], ['rebenkron', 'aurelshain'], ['mac-ruan', 'lanette'], ['na-fenn', 'seidenwarth']]) assert.equal(h('goldmund', id).liegeId, ruler);
  assert.equal(h('weisenfluh', 'rosenbluth').rankId, 'freiherr');
  for (const id of ['iorcallan', 'taghradan']) assert.equal(h('weisenfluh', id).rankId, 'ministerial');
  assert.equal(h('weisenfluh', 'honigfeld').name, 'Honigblüt');
  assert.equal(h('weisenfluh', 'sonnenfels').liegeId, 'weissmann');
  assert.equal(h('weisenfluh', 'weinlaub').liegeId, 'goldkranz');
});

test('existing genealogy and world identities survive ministerial placement changes', () => {
  for (const original of [HOUSE_WEINLAUB_FAMILY, HOUSE_SONNENFELS_FAMILY, HOUSE_HOCHREUTH_FAMILY]) {
    const family = getRegisteredFamily(original.document.id).family;
    for (const field of ['persons', 'partnerships', 'parentages', 'lineage']) assert.deepEqual(family[field], original[field], `${original.document.id}/${field}`);
  }
  assert.equal(getRegisteredFamily('haus-sonnenfels').houseProfile.rankId, 'ministerial');
  assert.ok(getRegisteredFamily('haus-sonnenfels').houseProfile.secondarySeats.some(s => s.includes('Lachende Nixe')));
  assert.notEqual(h('aldingen', 'velten').familyId, h('goldmund', 'gueldenfels').familyId);
  assert.notEqual(h('deitheach', 'trodach').familyId, 'haus-ard-trodach');
});

test('unknown people are not invented, while every house has biography, warrior and vacant court', () => {
  for (const realm of realms) for (const house of realm.houses) {
    const family = getRegisteredFamily(house.familyId).family;
    if (!house.knownHeads) { assert.equal(family.persons.length, 0); assert.equal(family.partnerships.length, 0); }
    const content = createAcceptedHouseContent(realm, house), page = createHousePageData(content), bio = createHouseBiography(content);
    assert.ok(bio.house.documents[0].link.includes(house.familyId));
    assert.ok(page.familyTreeEmbed.src.includes(house.familyId));
    assert.ok(page.warriorGallery.entries[0].image);
    assert.ok(hasNobleCourt(page), house.familyId);
    assert.equal(completeHouseOffices([], true).length, 21);
    assert.ok(content.sections.holdings.length && content.sections.knighthood.length);
    for (const reference of house.identityReferences || []) assert.ok(getRegisteredFamily(reference.familyId), `${house.familyId}/${reference.familyId}`);
  }
});

test('historical lands retain origin, occupied control, former ruler and a single physical town', () => {
  const r = realmsById.get('deitheach'); assert.equal(r.historical, true);
  assert.equal(r.settlementsById.get('ailseag').name, 'Lann Ailseag');
  assert.equal(r.settlementsById.get('dreasail').name, 'Srath Dreasail');
  assert.equal(h('deitheach', 'seilgair').name, 'Ruin Seilgeir');
  assert.equal(h('iathneach', 'deaghaide').cadetOf, 'cetchathach');
  assert.equal(h('iathneach', 'farraigeach').seatId, 'sgeir-tearmainn');
  for (const id of ['aldingen', 'iathneach']) {
    const origin = realmsById.get(id), lost = origin.territories.filter(t => t.sourceRealmId === 'triarchie');
    assert.ok(lost.length);
    for (const t of lost) { assert.equal(t.historical, true); assert.equal(t.occupied, true); assert.ok(t.controlHref); }
  }
  for (const seat of r.settlements) assert.equal(json(`Karten/Deitheach/data.json`).state.pins.find(p => p.id === placeId(r, seat)).residentFamilyIds.length, 0);
});

test('each page resolves its immediate hierarchy, direct house links and place register', () => {
  for (const realm of realms) for (const t of realm.territories) {
    const article = createTerritoryArticle(realm, t);
    assert.ok(realm.ancestors(t).length);
    const data = createAcceptedTerritory(realm.id, t.id, dataContext.window.ALERIA_HERRSCHAFT_DATA);
    for (const section of data.view.familySections) for (const card of section.cards) assert.ok(card.href.includes('/kleinehaeuser.html?haus='));
    for (const domain of data.view.geography.domains) for (const section of domain.sections) for (const place of section.places) assert.ok(place.href.includes('/Orte/grossstadt.html?id='));
    for (const child of article.territoryLinks) assert.equal(realm.territoriesById.get(child).parentId, t.id);
    assert.ok(fs.existsSync(new URL(t.href.slice(1), root)), t.href);
  }
});

test('all new UI links and illustrations point to real local resources', () => {
  const paths = new Set();
  const visit = value => { if (!value || typeof value !== 'object') return; for (const [key, v] of Object.entries(value)) {
    if (typeof v === 'string' && /^(href|link|src|image|fullsize|crest|banner)$/.test(key) && /^(\/|\.\.\/)/.test(v)) paths.add(v);
    else if (typeof v === 'object') visit(v);
  } };
  for (const realm of realms) {
    for (const house of realm.houses) { visit(createAcceptedHouseContent(realm, house)); assert.ok(getRegisteredFamily(house.familyId)); }
    for (const seat of realm.settlements) visit(createAcceptedPlace(realm, seat));
  }
  for (const href of paths) {
    const target = new URL(href.startsWith('../') ? href.slice(3) : href.slice(1), root);
    target.search = ''; target.hash = '';
    assert.ok(fs.existsSync(target), href);
    if (href.includes('/Klassenordner/Klassenseite.html#')) assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${href.split('#')[1]}"`), href);
  }
});

test('every accepted house is assigned its own warrior gallery entry', () => {
  const catalog = json('Gallerien/krieger/data/catalog.json');
  for (const house of allHouses) assert.ok(catalog.houses.find(h => h.id === house.familyId)?.illustrationIds.length, house.familyId);
});
