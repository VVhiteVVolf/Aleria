import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { reviewedFiefs, territoryChain } from '../../Stammbäume/assets/js/modules/albic-territories/fief-catalog.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { structure } from '../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import mapProof from './support/albic-map-review-20261024.json' with { type: 'json' };
import { protectedAlbicMap, reviewHash } from './support/albic-review-baseline.mjs';
import bannerAssets from '../../Stammbäume/assets/js/modules/albic-territories/banner-assets.source.json' with { type: 'json' };

const root = new URL('../../', import.meta.url);
const read = path => JSON.parse(fs.readFileSync(new URL(path, root), 'utf8'));
const exists = path => fs.existsSync(new URL('.' + path, root));
const realms = ['Leitheach', 'Aislearneach', 'Dunfal', 'Blaithneach', 'Uathneach', 'Faelaorn', 'Ceitheach'];
const catalogs = realms.map(realm => ({ realm, ...read(`Karten/${realm}/territories.import.json`),
  pages: read(`Kontinente/modules/${realm.toLowerCase()}/pages.source.json`).pages }));

test('every reviewed fief has a working page, own heraldry and the correct territorial naming scheme', () => {
  const names = new Set();
  for (const reviewed of reviewedFiefs) {
    const catalog = catalogs.find(c => c.realm === reviewed.realm);
    const territory = catalog.territories.find(t => t.id === reviewed.id);
    const page = catalog.pages.find(p => p.id === reviewed.id);
    assert.ok(territory && page, reviewed.id);
    assert.equal(territory.name, reviewed.name);
    assert.equal(page.title, reviewed.name);
    assert.ok(exists(territory.href), territory.href);
    assert.ok(exists(territory.banner), territory.banner);
    assert.ok(exists(territory.crest), territory.crest);
    assert.equal(page.crestSrc, territory.banner);
    if (reviewed.extent === 'territorial') {
      assert.match(territory.name, /^Tir na /);
      assert.ok(!names.has(territory.name), territory.name);
      names.add(territory.name);
      const parent = catalog.territories.find(t => t.id === territory.parentId);
      assert.notEqual(territory.banner, parent.banner, 'a separate fief cannot silently reuse its superior banner');
    } else assert.match(territory.name, /^Herrschaft der /);
    const chain = territoryChain(territory, catalog.territories);
    assert.deepEqual(page.hierarchy.slice(2).map(h => h.slug), chain.map(t => t.id));
  }
});

test('each page links immediate subordinate fiefs; existing public routes remain stable', () => {
  for (const catalog of catalogs) for (const page of catalog.pages) {
    const own = catalog.territories.find(t => t.id === page.id);
    const immediate = catalog.territories.filter(t => t.parentId === own.id && t.href && !t.pending).map(t => t.id);
    assert.deepEqual(page.territoryLinks, immediate, page.id);
    for (const id of page.territoryLinks) assert.ok(exists(catalog.territories.find(t => t.id === id).href));
    if (own.parentId) assert.equal(page.parentHref, catalog.territories.find(t => t.id === own.parentId).href);
  }
  assert.match(catalogs.find(c => c.realm === 'Uathneach').territories.find(t => t.id === 'uathneach-herrschaft-fastaigh').href, /Herrschaft von Bronnan/);
});

test('all Uathneach clans have their own administration page, without duplicating their city', () => {
  const catalog = catalogs.find(c => c.realm === 'Uathneach');
  for (const clan of structure.clans) {
    assert.ok(catalog.pages.some(p => p.id === clan.territoryId), clan.name);
    const family = FAMILY_REGISTRY.find(f => f.id === clan.familyId);
    assert.equal(family.houseProfile.rankId, clan.rankId);
    assert.equal(family.houseProfile.liegeHouseId, structure.clans.find(c => c.id === clan.liege)?.familyId || '');
  }
  for (const fief of reviewedFiefs.filter(f => f.realm === 'Uathneach' && f.extent === 'urban')) {
    const page = catalog.pages.find(p => p.id === fief.id);
    assert.deepEqual(page.domains, [], 'urban Lairds do not take ownership of the whole shared city');
    assert.equal(catalog.territories.find(t => t.id === page.id).seat,
      catalog.territories.find(t => t.id === page.hierarchy.at(-2).slug).seat);
  }
  assert.equal(catalog.pages.flatMap(p => p.domains.flatMap(d => d.sections.flatMap(s => s.placeIds))).length, 18);
  assert.equal(catalog.territories.find(t => t.id === 'uathneach-herrschaft-muirin').parentId, 'uathneach-tir-na-laimhe');
  assert.equal(structure.settlements.find(p => p.id === 'reithe').mapRegionId, 'uathneach-tir-na-taoide');
});

test('all 23 reviewed maps preserve marker identities, coordinates, texts, residents, images and border geometry', () => {
  assert.equal(mapProof.maps.length, 23);
  for (const proof of mapProof.maps) {
    const data = read('Karten/' + proof.path);
    assert.equal(reviewHash(protectedAlbicMap(data.state)), proof.protectedSha256, proof.path);
    assert.equal(reviewHash(data.state), data.generatedStateHash, proof.path);
  }
});

test('regional banners retain their original clan emblem source and render as self-contained square assets', () => {
  assert.equal(bannerAssets.assets.length, 72);
  for (const asset of bannerAssets.assets) {
    const svg = fs.readFileSync(new URL('.' + asset.asset, root), 'utf8');
    assert.match(svg, /viewBox="0 0 800 800"/);
    assert.match(svg, /href="data:image\/png;base64,/);
    assert.doesNotMatch(svg, /href="https?:/);
    const original = fs.readFileSync(new URL('.' + asset.emblemSource, root));
    assert.equal(createHash('sha256').update(original).digest('hex'), asset.emblemSha256);
    assert.equal(createHash('sha256').update(svg).digest('hex'), asset.sha256);
  }
});

test('Dunfal numbered boundaries remain pending, and Faelaorn nested and historical fiefs retain their status', () => {
  const dunfal = catalogs.find(c => c.realm === 'Dunfal');
  for (const id of ['dunfal-offen-i', 'dunfal-offen-ii', 'dunfal-offen-iii']) {
    const area = dunfal.territories.find(t => t.id === id);
    assert.equal(area.pending, true); assert.equal(area.familyId, '');
  }
  const faelaorn = catalogs.find(c => c.realm === 'Faelaorn');
  assert.equal(faelaorn.territories.find(t => t.id === 'faelaorn-herrschaft-grannd').parentId, 'faelaorn-herrschaft-erskine');
  assert.equal(faelaorn.territories.find(t => t.id === 'faelaorn-herrschaft-boyd').parentId, 'faelaorn-herrschaft-muirgheal');
  assert.match(faelaorn.pages.find(p => p.id === 'faelaorn-herrschaft-dubhan').copy.overview.join(' '), /überleben|leben noch/);
});

test('every reviewed page renders through the existing shared UI without missing place records', async () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(new URL('Kontinente/assets/js/herrschaft-data.js', root), 'utf8'), context);
  for (const catalog of catalogs) {
    const { createTerritory } = await import(`../modules/${catalog.realm.toLowerCase()}/territory-page.mjs`);
    for (const page of catalog.pages) {
      const result = createTerritory(page.id, context.window.ALERIA_HERRSCHAFT_DATA);
      assert.equal(result.meta.id, page.id);
      for (const domain of result.view.geography.domains) for (const section of domain.sections) assert.ok(section.places.every(Boolean));
    }
  }
});
