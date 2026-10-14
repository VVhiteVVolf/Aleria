import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { buildSchwarzdorn } from '../modules/brewer-guilds/schwarzdorn-model.mjs';
import { buildGoldenglanz } from '../modules/brewer-guilds/goldenglanz-model.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { moduleProviders } from '../modules/item-register/item-register-providers.js';

const root = new URL('../modules/brewer-guilds/', import.meta.url);
const names = ['schwarzdorn', 'goldenglanz'];
const sources = names.map(name => JSON.parse(readFileSync(new URL(`sources/${name}.json`, root), 'utf8')));
const entries = [buildSchwarzdorn(sources[0]), buildGoldenglanz(sources[1])];
const strings = value => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];

test('the Aldrimar guilds retain all substantive source paragraphs and eight distinct feature pages', () => {
  entries.forEach((entry, index) => {
    assert.equal(entry.pages.length, 8);
    for (const type of ['guildPage', 'hierarchyPage', 'organizationNetworkPage']) assert.equal(entry.pages.filter(page => page[type]).length, 1);
    const text = strings(entry).join('\n');
    for (const block of sources[index].filter(block => block.text.length > 150)) assert(text.includes(block.html), `Missing ${block.id}`);
    assert(!text.includes('0 Kupfertaler (Flasche)'));
    const catalogues = entry.pages.filter(page => page.tradeCatalogPage);
    assert.equal(catalogues[0].tradeCatalog.items.filter(item => item.status === 'available').length, 4);
    assert.equal(catalogues[0].tradeCatalog.items.filter(item => item.status === 'planned').length, 5);
    assert.equal(catalogues[1].tradeCatalog.items.length, 1);
  });
});

test('all ten drinks retain the quoted bottle prices and expose three priced market sizes', () => {
  const expected = [
    { 'Schwarzdorn Met': 14, Stachelkrone: 4, Schwarzflut: 3, Dornblut: 1, Frostkamm: 8 },
    { 'Honigbreu Met': 12, 'Honigbreu · Lichtgold': 6, Kranzgold: 5, Stillgold: 1, Hjerte: 7 }
  ];
  entries.forEach((entry, index) => {
    const offers = buildModuleOffers([entry]);
    assert.equal(offers.length, 15);
    assert(offers.every(offer => offer.category === 'getraenke'));
    for (const [name, bottle] of Object.entries(expected[index])) {
      const sizes = offers.filter(offer => offer.title === name);
      assert.deepEqual(sizes.map(offer => offer.hiddenMeta.unit), ['Krug · 0,5 l', 'Flasche · 1 l', 'Fass · 50 l']);
      assert.deepEqual(sizes.map(offer => offer.priceRange.minCopper), [bottle / 2, bottle, bottle * 50]);
    }
    assert.equal(entry.pages.filter(page => page.tradeCatalogPage)[0].tradeCatalog.items.filter(item => item.category === 'mead').length, 2);
  });
});

test('partner origins, family offices and market regions remain specific to each clan', () => {
  assert.match(entries[0].pages[6].tradeCatalog.items[0].origin, /Freiwinter/);
  assert.match(entries[1].pages[6].tradeCatalog.items[0].origin, /Schattenherz/);
  assert.equal(entries[0].pages[2].hierarchy.levels[0].nodes[0].subtitle, 'Maven Schwarzdorn');
  assert.equal(entries[1].pages[2].hierarchy.levels[0].nodes[0].subtitle, 'Wulfgar Goldglanz');
  assert(entries[1].pages[2].hierarchy.levels[1].nodes.some(node => node.title === 'Isbrand Schattenherz'));
  const providers = moduleProviders(entries);
  assert(providers.every(provider => provider.trade.id === 'brewers'));
  assert.deepEqual(providers.map(provider => provider.region.id), ['roriksheim', 'kraehenmoor']);
});

test('original drink art and all six generated scenes exist in their intended formats', () => {
  const base = new URL('../AleriaAlmanach.html', import.meta.url);
  for (const entry of entries) for (const reference of strings(entry).filter(value => /^\.\.?\//.test(value))) {
    const target = new URL(reference, base); target.search = '';
    assert(existsSync(target), reference);
  }
  const manifest = JSON.parse(readFileSync(new URL('aldrimar-image-prompts.json', root), 'utf8'));
  for (const asset of manifest.originalAssets) {
    const bytes = readFileSync(new URL(`./public/assets/brewer-guilds/${asset.id}.png`, base));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.id);
  }
  assert.equal(manifest.scenes.length, 6);
  for (const scene of manifest.scenes) {
    const bytes = readFileSync(new URL(scene.file, base));
    assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2, scene.id);
    for (const reference of scene.references) assert(existsSync(reference), reference);
  }
  assert(manifest.scenes.find(scene => scene.id === 'goldenglanz-handwerk').correction);
});
