import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { buildTeyrngarch } from '../modules/brewer-guilds/teyrngarch-model.mjs';
import { buildPenderyn } from '../modules/brewer-guilds/penderyn-model.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';

const root = new URL('../modules/brewer-guilds/', import.meta.url);
const sources = ['teyrngarch', 'penderyn'].map(name => JSON.parse(readFileSync(new URL(`sources/${name}.json`, root), 'utf8')));
const entries = [buildTeyrngarch(sources[0]), buildPenderyn(sources[1])];
const strings = value => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];

test('both guilds retain the substantive source prose and have guild, hierarchy and network pages', () => {
  assert.deepEqual(entries.map(entry => entry.pages.length), [8, 7]);
  entries.forEach((entry, index) => {
    for (const type of ['guildPage', 'hierarchyPage', 'organizationNetworkPage']) assert.equal(entry.pages.filter(page => page[type]).length, 1);
    const copy = strings(entry).join('\n');
    for (const block of sources[index].filter(block => block.text.length > 150)) assert(copy.includes(block.html), `Missing source: ${block.id}`);
    assert(!copy.includes('0 Kupfertaler (Flasche)'));
  });
});

test('partner beer is outside the standard selection and five future slots never become offers', () => {
  const catalogues = entries.map(entry => entry.pages.filter(page => page.tradeCatalogPage));
  assert.deepEqual(catalogues.map(pages => pages.map(page => page.tradeCatalog.items.filter(item => item.status !== 'planned').length)), [[5, 1], [2]]);
  assert(catalogues[0][0].tradeCatalog.items.every(item => item.title !== 'Hakenbräu'));
  assert.equal(catalogues[0][1].tradeCatalog.items[0].title, 'Hakenbräu');
  for (const page of [catalogues[0][0], catalogues[1][0]]) assert.equal(page.tradeCatalog.items.filter(item => item.status === 'planned').length, 5);
  const offers = buildModuleOffers(entries);
  assert.equal(offers.length, 24);
  assert(offers.every(offer => offer.priceRange?.minCopper > 0 && offer.category === 'getraenke'));
});

test('hierarchies distinguish documented family roles and unnamed master offices', () => {
  const t = entries[0].pages.find(page => page.hierarchyPage).hierarchy;
  assert.equal(t.levels[0].nodes[0].subtitle, 'Lugh Teyrngarch');
  assert.equal(t.levels[1].nodes[0].subtitle, 'Gaenor Teyrngarch');
  assert.equal(t.levels[4].nodes[0].subtitle, 'Gandwy Teyrngarch');
  const p = entries[1].pages.find(page => page.hierarchyPage).hierarchy;
  assert.match(p.levels[0].nodes[0].title, /Trägerschaft/);
  assert.equal(p.levels[1].nodes[0].subtitle, 'Amtsinhaber nicht benannt');
});

test('Penderyn retains the protected house name ahead of the bottling name', () => {
  const items = entries[1].pages.find(page => page.tradeCatalogPage).tradeCatalog.items.filter(item => item.status !== 'planned');
  assert.deepEqual(items.map(item => item.title), ['Penderyn', 'Penderyn · Rhagorol']);
  assert(items.every(item => !/Gleann|Beinn|Cladach/.test(item.title)));
  assert.match(strings(entries[1]).join('\n'), /Haus- und Traditionsname/);
});

test('registration adds both guilds once and respects already edited modules', () => {
  const context = vm.createContext({ SECTIONS: [] });
  const script = readFileSync(new URL('brewer-guilds-data.js', root), 'utf8');
  vm.runInContext(script, context);
  context.SECTIONS[0].entries[0].title = 'Edited';
  vm.runInContext(script, context);
  assert.equal(context.SECTIONS.length, 1);
  assert.equal(context.SECTIONS[0].entries.length, 2);
  assert.equal(context.SECTIONS[0].entries[0].title, 'Edited');
});

test('all local references exist and each product and story has a distinct 2:3 image', () => {
  const base = new URL('../AleriaAlmanach.html', import.meta.url);
  for (const reference of strings(entries).filter(value => /^\.\.?\//.test(value))) {
    const url = new URL(reference, base); url.search = '';
    assert(existsSync(url), `Missing reference ${reference}`);
  }
  const images = entries.flatMap(entry => entry.pages.flatMap(page => page.tradeCatalogPage
    ? page.tradeCatalog.items.filter(item => item.status !== 'planned').map(item => item.image)
    : page.description ? [page.image] : []));
  assert.equal(images.length, 14);
  assert.equal(new Set(images).size, 14);
  for (const image of images) {
    const bytes = readFileSync(new URL(image, base));
    assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2, image);
  }
});
