import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { territoriesById, descriptionsById } from '../../Karten/Cenyr/sonnenkueste/places.mjs';
import { createReviewedPins } from '../../Karten/modules/territory-places/reviewed-pin-import.mjs';

const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const json = file => JSON.parse(read(file));
const context = { window: {} };
for (const file of ['kontinente.registry.js', 'assets/js/herrschaft-data.js']) vm.runInNewContext(read('Kontinente/' + file), context);
globalThis.ALERIA_HERRSCHAFT_DATA = context.window.ALERIA_HERRSCHAFT_DATA;
const entries = context.window.KONTINENTE_REGISTRY.filter(entry => entry.page.includes('Grafschaft Sonnenküste/'));
const pages = await Promise.all(entries.map(async entry => (await import(new URL('Kontinente/' + entry.data, root))).default));
const source = json('Karten/Cenyr/sonnenkueste/markers.source.json');
const map = json('Karten/Cenyr/sonnenkueste/data.json');
const countyPlaces = pages[0].view.geography.domains.flatMap(domain => domain.sections.flatMap(section => section.places));

test('all six source pages, 60 snippets and three coordinate lists remain byte-identical', () => {
  for (const [file, count, prefix] of [
    ['sources.json', 6, ''], ['places/sources.json', 60, 'places/'], ['coordinates/sources.json', 3, 'coordinates/'],
  ]) {
    const sources = json('Kontinente/docs/sonnenkueste/' + file);
    assert.equal(sources.length, count);
    for (const source of sources) {
      const bytes = fs.readFileSync(new URL('Kontinente/docs/sonnenkueste/' + prefix + source.file, root));
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), source.sha256);
    }
  }
});

test('house selection stays local and the county has its own council', () => {
  assert.equal(pages.length, 6);
  assert.deepEqual(pages.map(page => page.view.familySections.flatMap(s => s.cards).length), [24, 3, 2, 1, 1, 1]);
  const countyHouses = pages[0].view.familySections.flatMap(s => s.cards);
  assert.ok(!countyHouses.some(h => h.id === 'haus-rhelian' || h.id === 'haus-aelryn'));
  assert.ok(pages[1].view.familySections.flatMap(s => s.cards).some(h => h.id === 'haus-rhelian'));
  assert.ok(pages[0].view.councilGroups.some(g => g.members.some(p => p.name === 'Merwin Illewod')));
  assert.ok(pages.every(page => !page.view.councilGroups.some(g => g.title === 'Königlicher Rat')));
  for (const page of pages) {
    const houses = page.view.familySections.flatMap(s => s.cards);
    assert.equal(houses.filter(h => h.featured).length, 1);
    for (const house of houses) {
      assert.ok(house.rank && house.href, house.name);
      assert.ok(fs.existsSync(new URL('.' + house.imageSrc, root)), house.imageSrc);
    }
  }
});

test('68 named coordinates and two register-only places are unique and not fabricated', () => {
  assert.equal(map.state.pins.length, 68);
  assert.equal(countyPlaces.length, 70);
  assert.equal(new Set(countyPlaces.map(p => p.id)).size, 70);
  assert.deepEqual(source.unpositionedPlaces.map(p => p.title), ['Hornkluft', 'Poststation']);
  assert.ok(!map.state.pins.some(p => /Unbenannt|Hornkluft|Poststation/.test(p.title)));
  const brewery = map.state.pins.find(p => p.title.endsWith('Bragwaul'));
  assert.equal(brewery.x, 1314 / 4096);
  assert.equal(brewery.y, 1 - 846 / 4049);
  assert.equal(brewery.cat, 'location-brauersiedlung');
  assert.equal(map.state.pins.filter(p => p.title === 'Ffynbraich').length, 2);
  assert.equal(map.state.pins.filter(p => p.title === 'Ahnenbaum').length, 3);
  for (const marker of source.markers) {
    const pin = map.state.pins.find(p => p.id === marker.id);
    assert.equal(pin.x, marker.x / 4096);
    assert.equal(pin.y, 1 - marker.y / 4049);
    assert.equal(pin.templateId, marker.templateId);
  }
});

test('all 56 distinct descriptions are shared between map and register', () => {
  assert.equal(descriptionsById.size, 56);
  assert.equal(map.state.pins.filter(p => p.text).length, 56);
  for (const [id, description] of descriptionsById) {
    assert.equal(map.state.pins.find(p => p.id === id).text, description.text);
    assert.equal(countyPlaces.find(p => p.id === id).description, description.text);
  }
  const river = map.state.pins.find(p => p.title === 'Nythlyn');
  assert.equal(river.cat, 'location-flusssiedlung');
  assert.match(river.text, /Papier/);
});

test('local heraldry and correct territory links stay separate from operators', () => {
  for (const pin of map.state.pins) {
    const territory = territoriesById.get(pin.dominionId);
    assert.ok(territory, pin.title);
    assert.equal(pin.house, territory.house);
    assert.equal(pin.crest, territory.crest);
    assert.equal(pin.banner, territory.banner);
    assert.equal(pin.bannerLink, territory.href);
    assert.ok(pin.crestLink.includes(territory.familyId));
    for (const asset of [pin.pinMarker, pin.crest, pin.banner]) assert.ok(fs.existsSync(new URL('.' + asset, root)), asset);
  }
  assert.equal(map.state.pins.find(p => p.title === 'Gallochfaen').house, 'Haus Grianlaoch');
  const exclaves = map.state.pins.filter(p => p.title.startsWith('Teyrngarch Brauerei'));
  assert.equal(exclaves.length, 4);
  assert.ok(exclaves.every(p => p.dominionId === 'herrschaft-teyrngarch' && p.table.some(r => r.k === 'Gebietsform' && r.v.includes('Exklave'))));
  const tavern = map.state.pins.find(p => p.title.includes('Goldhaube'));
  assert.equal(tavern.house, 'Haus Illewod');
  assert.equal(tavern.table.find(r => r.k === 'Betreiber').v, 'Haus Teyrngarch');
  for (const page of pages) assert.equal(page.view.article.crestSrc, territoriesById.get(page.view.article.id).banner);
  for (const territory of territoriesById.values()) if (territory.bannerSha256) {
    const bytes = fs.readFileSync(new URL('.' + territory.banner, root));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), territory.bannerSha256);
  }
});

test('reviewed import rejects duplicate or invalid coordinates before snapshot writes', () => {
  const options = { catalog: { definition: () => ({id:'x'}) }, presets: { createTable: () => [] }, describePlace: () => ({fields:{},territory:{href:'',id:'x'}}), region:'Test' };
  assert.throws(() => createReviewedPins({...source, markers:[{...source.markers[0],x:NaN}]},options), /Koordinate/);
  assert.throws(() => createReviewedPins({...source, markers:[source.markers[0],source.markers[0]]},options), /Doppelte/);
});
