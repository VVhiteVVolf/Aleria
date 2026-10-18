import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { royalCouncil } from '../modules/cenyr-court/royal-council.mjs?v=vortigern-20261018';
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
