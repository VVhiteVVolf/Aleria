import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { structure, territories, territoriesById } from '../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import { pages } from '../modules/uathneach/page-source.mjs';
import { createTerritory } from '../modules/uathneach/territory-page.mjs';
import { getRegisteredFamily, FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createHouseholdCatalog, createHouseholdIndex, householdGroups } from '../../Karten/modules/households/household-model.mjs';

const root = new URL('../../', import.meta.url), context = { window: {} };
for (const file of ['Kontinente/assets/js/herrschaft-data.js', 'Kontinente/kontinente.registry.js', 'Karten/karten.registry.js']) {
  vm.runInNewContext(fs.readFileSync(new URL(file, root), 'utf8'), context);
}
const stored = JSON.parse(fs.readFileSync(new URL('Karten/Uathneach/data.json', root), 'utf8'));
const exists = href => fs.existsSync(new URL('.' + new URL(href, 'https://aleria.local').pathname, root));

test('Uathneach retains the seven territories and ranks of accepted version 1', () => {
  assert.equal(structure.selection.number, 1);
  assert.equal(structure.regions.length, 7);
  assert.equal(structure.clans.length, 26);
  assert.equal(pages.length, 13);
  assert.equal(structure.clans.find(c => c.id === 'midgna').rankId, 'mor-tiarna');
  assert.equal(structure.clans.find(c => c.id === 'midgna').liege, 'laga');
  assert.equal(structure.clans.find(c => c.id === 'fastaigh').liege, 'laga');
  assert.equal(structure.clans.find(c => c.id === 'lasgair').liege, 'luga');
  assert.equal(structure.clans.find(c => c.id === 'cadhla').liege, 'midgna');
});

test('all confirmed clans have unique files, crests, ranks, seats and direct lieges', () => {
  assert.equal(new Set(FAMILY_REGISTRY.map(f => f.id)).size, FAMILY_REGISTRY.length);
  for (const clan of structure.clans) {
    const family = getRegisteredFamily(clan.familyId).family;
    assert.equal(family.document.houseProfile.rankId, clan.rankId);
    assert.equal(family.document.houseProfile.seat, structure.settlements.find(p => p.id === clan.seat).name);
    assert.equal(family.document.houseProfile.liegeHouseId, structure.clans.find(c => c.id === clan.liege)?.familyId || '');
    assert.ok(exists(clan.crest));
    assert.equal(family.persons.length, 0, 'no invented genealogy');
    assert.equal(family.partnerships.length, 0);
    for (const icon of family.document.houseProfile.folderIcons.filter(Boolean)) assert.ok(exists(icon), icon);
  }
  for (const id of ['fiodhran', 'creagan', 'einsiedlerkrebs']) assert.equal(structure.clans.find(c => c.id === id).rankId, 'unknown');
  assert.equal(structure.clans.find(c => c.id === 'clannmhar').seat, 'rioghain');
  assert.equal(structure.clans.find(c => c.id === 'luachra').seat, 'treabhair');
  assert.equal(structure.clans.find(c => c.id === 'einsiedlerkrebs').name, 'Dál Siubhrán');
  assert.equal(structure.clans.find(c => c.id === 'creagan').name, 'Tir An Creagán');
  assert.equal(structure.clans.find(c => c.id === 'muirin').name, 'Ua Muirin');
  assert.equal(structure.clans.find(c => c.id === 'cairge').name, 'Ua Cairge');
  assert.equal(structure.clans.find(c => c.id === 'lasgair').name, 'Ua Lasgair');
});

test('pages expose only their own settlements and immediately subordinate clans and territories', () => {
  const main = pages.find(p => p.id === structure.realm.id);
  assert.equal(main.territoryLinks.length, 7);
  assert.equal(main.families.flatMap(s => s.houses).length, 7);
  const core = pages.find(p => p.id === 'uathneach-tir-na-laimhe');
  assert.equal(core.families.flatMap(s => s.houses).length, 7);
  assert.ok(!core.families.flatMap(s => s.houses).some(h => h.rank === 'Mor-Tiarna-Clan'));
  let placeCount = 0;
  for (const page of pages) {
    const territory = territoriesById.get(page.id);
    assert.deepEqual(page.territoryLinks, territories.filter(t => t.parentId === page.id).map(t => t.id));
    for (const house of page.families.flatMap(s => s.houses).filter(h => !h.featured)) {
      const clan = structure.clans.find(c => c.familyId === house.familyId);
      assert.equal(clan.liege, territory.rulerId, house.name);
      if (territory.type !== 'Fürstentum' && territory.type !== 'Herrschaft') assert.equal(clan.regionId, territory.id);
    }
    const result = createTerritory(page.id, context.window.ALERIA_HERRSCHAFT_DATA);
    for (const domain of result.view.geography.domains) {
      assert.equal(domain.territoryId, page.id);
      placeCount += domain.sections.reduce((n, s) => n + s.places.length, 0);
    }
    const registration = context.window.KONTINENTE_REGISTRY.find(r => r.id === page.id);
    assert.ok(registration);
    assert.ok(exists('/Kontinente/' + registration.page));
    for (const href of [territory.href, page.crestSrc, page.parentHref, page.map.imageSrc]) assert.ok(exists(href), href);
  }
  assert.equal(placeCount, 18, 'every settlement occurs exactly once');
  const reithe = structure.settlements.find(p => p.id === 'reithe');
  assert.equal(reithe.mapRegionId, 'uathneach-tir-na-taoide');
  assert.equal(reithe.territoryId, 'uathneach-tir-na-laimhe');
});

test('map positions round-trip from top-left source anchors and retain all 26 fixed residents', () => {
  assert.equal(stored.state.pins.length, 18);
  assert.equal(stored.state.dotSize, 80);
  assert.equal(stored.state.lblSize, 50);
  assert.equal(createHash('sha256').update(JSON.stringify(stored.state)).digest('hex'), stored.generatedStateHash);
  const map = context.window.KartoMapRegistry.all().find(map => map.id === 'uathneach');
  assert.ok(exists(map.territoryHref));
  const index = createHouseholdIndex(createHouseholdCatalog(FAMILY_REGISTRY));
  const groups = householdGroups(stored.state.pins, map, index);
  assert.equal(groups.length, 18);
  assert.equal(groups.reduce((n, g) => n + g.families.length, 0), 26);
  for (const pin of stored.state.pins) {
    const place = structure.settlements.find(p => 'uathneach-' + p.id === pin.id);
    assert.ok(Math.abs(pin.x - place.point[0] / 100) < 1e-10);
    assert.ok(Math.abs(pin.y - place.point[1] / 100) < 1e-10);
    assert.deepEqual(pin.residentFamilyIds, place.residentFamilyIds);
    assert.equal(pin.dominionId, place.territoryId);
    assert.ok(exists(pin.crest));
    assert.ok(exists(pin.pinMarker));
    assert.ok(pin.sourceRef.settlementId);
  }
  assert.equal(groups.find(g => g.pin.title === 'Dunnean').families.length, 4);
});

test('Estryll and the Schild von Ailith link directly to the regular Uathneach page', () => {
  for (const file of ['Kontinente/Estryll/Estryll.html', 'Kontinente/Alben/Der Schild von Ailith.html']) {
    const html = fs.readFileSync(new URL(file, root), 'utf8');
    assert.ok(html.includes(`href="${territories[0].href}"`), file);
    assert.ok(html.includes('Uathneach/uathneach.webp'), file);
  }
});
