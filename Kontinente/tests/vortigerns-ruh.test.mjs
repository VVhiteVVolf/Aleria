import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { royalCouncil } from '../modules/cenyr-court/royal-council.mjs?v=vortigern-20261018';
import { territoriesById, descriptionsById } from '../../Karten/Cenyr/vortigerns-ruh/places.mjs';
const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const context = { window: {} };
vm.runInNewContext(read('Kontinente/kontinente.registry.js'), context);
vm.runInNewContext(read('Kontinente/assets/js/herrschaft-data.js'), context);
globalThis.ALERIA_HERRSCHAFT_DATA = context.window.ALERIA_HERRSCHAFT_DATA;
const entries = context.window.KONTINENTE_REGISTRY.filter(entry => entry.page.includes('Grafschaft Vortigerns Ruh/'));
const pages = await Promise.all(entries.map(async entry => (await import(new URL('Kontinente/' + entry.data, root))).default));

test('The eight archived source documents remain byte-identical', () => {
  const sources = JSON.parse(read('Kontinente/docs/vortigerns-ruh/sources.json'));
  assert.equal(sources.length, 8);
  for (const source of sources) {
    const bytes = fs.readFileSync(new URL('Kontinente/docs/vortigerns-ruh/' + source.file, root));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), source.sha256);
  }
});
test('The county uses the actual shared royal council object', () => {
  assert.equal(pages[0].view.councilGroups.find(group => group.title === 'Königlicher Rat'), royalCouncil);
  assert.equal(royalCouncil.members.length, 10);
  assert.ok(read('Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html').includes('data-council-source="cenyr-royal"'));
});
test('Family selection respects the county and subordinate territories', () => {
  assert.deepEqual(pages.map(page => page.view.familySections.flatMap(section => section.cards).length), [16, 2, 1, 1, 3, 1, 1, 1]);
  for (const page of pages) {
    const houses = page.view.familySections.flatMap(section => section.cards);
    assert.equal(houses.filter(house => house.featured).length, 1);
    for (const house of houses) {
      assert.ok(house.rank, house.name);
      if (house.imageSrc) assert.ok(fs.existsSync(new URL('.' + house.imageSrc, root)), house.imageSrc);
    }
  }
  assert.ok(pages[4].view.familySections.flatMap(section => section.cards).some(house => house.name === 'Swynol' && !house.href));
});
test('The county register contains all 47 unique markers, including two ancestor trees', () => {
  const places = pages[0].view.geography.domains.flatMap(domain => domain.sections.flatMap(section => section.places));
  assert.equal(places.length, 47);
  assert.equal(new Set(places.map(place => place.id)).size, 47);
  assert.equal(places.filter(place => place.name === 'Ahnenbaum').length, 2);
  assert.equal(places.find(place => place.name === 'Llysceffyl').type, 'Rosszuchtsiedlung');
  assert.equal(places.find(place => place.name === 'Bragwhislyn').type, 'Brauersiedlung');
});
test('Pixel coordinates use the lower-left origin without transposing their axes', () => {
  const map = JSON.parse(read('Karten/Cenyr/vortigerns-ruh/data.json'));
  assert.equal(map.state.pins.length, 47);
  const capital = map.state.pins.find(pin => pin.title === 'Mathragon');
  assert.equal(capital.x, 2981 / 4096);
  assert.equal(capital.y, 1 - 1613 / 2208);
  assert.equal(capital.templateId, 'siedlung');
  const trees = map.state.pins.filter(pin => pin.title === 'Ahnenbaum');
  assert.equal(trees.length, 2);
  assert.notEqual(trees[0].id, trees[1].id);
  assert.ok(trees.every(pin => pin.templateId === 'natur'));
  assert.equal(map.state.pins.find(pin => pin.title === 'Uathachs Haus').templateId, 'gebaeude');
});

test('All 42 supplied descriptions are archived and shared by map and territory registers', () => {
  const sources = JSON.parse(read('Kontinente/docs/vortigerns-ruh/places/sources.json'));
  const pins = JSON.parse(read('Karten/Cenyr/vortigerns-ruh/data.json')).state.pins;
  const places = pages[0].view.geography.domains.flatMap(domain => domain.sections.flatMap(section => section.places));
  assert.equal(sources.length, 42);
  assert.equal(descriptionsById.size, 42);
  assert.equal(pins.filter(pin => pin.text).length, 42);
  for (const source of sources) {
    const bytes = fs.readFileSync(new URL('Kontinente/docs/vortigerns-ruh/places/' + source.file, root));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),source.sha256);
    const description=descriptionsById.get(source.id);
    assert.equal(pins.find(pin => pin.id === source.id).text,description.text);
    assert.equal(places.find(place => place.id === source.id).description,description.text);
  }
});

test('Every place uses the correct ruling house and separate territorial banner', () => {
  const pins = JSON.parse(read('Karten/Cenyr/vortigerns-ruh/data.json')).state.pins;
  for (const pin of pins) {
    const territory=territoriesById.get(pin.dominionId);
    assert.ok(territory,pin.title);
    assert.equal(pin.house,territory.house);
    assert.equal(pin.crest,territory.crest);
    assert.equal(pin.banner,territory.banner);
    assert.ok(pin.crestLink.includes(territory.familyId));
    assert.equal(pin.bannerLink,territory.href);
    for(const asset of [pin.crest,pin.banner]) assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
  }
  for (const page of pages) {
    const territory=territoriesById.get(page.view.article.id);
    assert.equal(page.view.article.crestSrc,territory.banner);
  }
  assert.equal(pins.find(pin=>pin.title==='Mwyncarreg').house,'Haus Penderyn');
  assert.ok(pins.filter(pin=>pin.title==='Ahnenbaum'||pin.title==='Uathachs Haus').every(pin=>pin.dominionId==='baronie-uthers-aufstieg'));
  const penderyn=pages[4].view.geography.domains.flatMap(domain=>domain.sections.flatMap(section=>section.places));
  assert.ok(penderyn.some(place=>place.name==='Mwyncarreg'));
  for(const territory of territoriesById.values()) if(territory.bannerSha256) {
    const bytes=fs.readFileSync(new URL('.'+territory.banner,root));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),territory.bannerSha256);
  }
});
