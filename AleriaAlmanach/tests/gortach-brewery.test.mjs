import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { buildGortachBrewery, WHISKIES } from '../modules/gortach-brauerei/gortach-brewery-model.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';

const root = new URL('../modules/gortach-brauerei/', import.meta.url);
const manuscript = JSON.parse(readFileSync(new URL('sources/manuscript.json', root), 'utf8'));
const entry = buildGortachBrewery(manuscript);

test('registration reuses the brewery category and never overwrites an existing module', () => {
  const existing = { id: 'another-brewery' };
  const section = { tab: 'Gilden & Zünfte', path: ['Brauer & Brenner'], entries: [existing] };
  const context = vm.createContext({ SECTIONS: [section] });
  const script = readFileSync(new URL('gortach-brewery-data.js', root), 'utf8');
  vm.runInContext(script, context);
  section.entries[1].title = 'Locally edited title';
  vm.runInContext(script, context);
  assert.equal(context.SECTIONS.length, 1);
  assert.equal(section.entries.length, 2);
  assert.equal(section.entries[0], existing);
  assert.equal(section.entries[1].title, 'Locally edited title');
});

test('nine pages retain the complete manuscript and collect all drinks on two catalogues', () => {
  assert.equal(entry.pages.length, 9);
  assert.equal(entry.pages.filter(page => page.guildPage).length, 1);
  const catalogues = entry.pages.filter(page => page.tradeCatalogPage);
  assert.deepEqual(catalogues.map(page => page.tradeCatalog.items.length), [6, 8]);
  const renderedCopy = entry.pages.flatMap(page => [page.description || '', ...(page.tradeCatalog?.items || []).map(item => item.description)]).join('\n');
  for (const section of manuscript) {
    for (const block of section.blocks) assert(renderedCopy.includes(block), `Missing manuscript block: ${block.slice(0, 100)}`);
  }
  for (const name of ['Sir Maredudd Draig', 'Sir Meurig Draig', 'Sir Egon Gafyr', 'Talfryn Penderyn', 'Njödr Frostauge', 'Fionn Mac Ard Cumhaill', "Foalan Fir An'Gallchobhair", 'Cú Chulainn']) {
    assert(renderedCopy.replace(/<[^>]*>/g, '').includes(name), `Missing tasting voice: ${name}`);
  }
});

test('existing goods projection identifies fourteen distinct drinks without inventing prices', () => {
  const offers = buildModuleOffers([entry]);
  assert.equal(offers.length, 14);
  assert.equal(new Set(offers.map(offer => offer.id)).size, 14);
  assert(offers.every(offer => offer.category === 'getraenke'));
  assert(offers.every(offer => offer.priceRange === null && offer.price === ''));
  assert(offers.every(offer => offer.moduleId === entry.id && offer.image));
});

test('rare maturation paths stay explicit and only Mòine uses peated malt', () => {
  assert.deepEqual(WHISKIES.filter(item => item.peated).map(item => item.id), ['moine-18']);
  const old = WHISKIES.find(item => item.id === 'orbharr-28');
  assert.match(old.maturation, /Vom ersten Tag an Òrbharr/);
  assert.match(old.maturation, /Keine Gealbharr-Grundreife/);
  const journey = WHISKIES.find(item => item.id === 'grosse-reise-22');
  assert.match(journey.maturation, /16 Jahre Gealbharr → 2 Jahre Òrbharr → 18 Monate Ciarbharr → 1 Jahr Dubhbharr → 1 Jahr Turas → 6 Monate Mòine/);
  assert.equal(16 + 2 + 18 / 12 + 1 + 1 + 6 / 12, journey.age);
});

test('all references exist and every story and drink has its own portrait-format illustration', () => {
  const base = new URL('../AleriaAlmanach.html', import.meta.url);
  const visit = value => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    else if (typeof value === 'string' && /^\.\.?\//.test(value)) {
      const url = new URL(value, base); url.search = '';
      assert(existsSync(url), `Missing local reference: ${value}`);
    }
  };
  visit(entry);
  const images = entry.pages.flatMap(page => page.tradeCatalogPage ? page.tradeCatalog.items.map(item => item.image) : page.guildPage ? [] : [page.image]);
  assert.equal(images.length, 20);
  assert.equal(new Set(images).size, 20);
  for (const image of images) {
    const bytes = readFileSync(new URL(image, base));
    assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2, image);
    if (/\/(bier|whisky)-/.test(image)) assert.equal(bytes[25], 6, `Missing RGBA channel: ${image}`);
  }
});
