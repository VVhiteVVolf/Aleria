import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { buildTorMenu, TOR_DISHES, TOR_STANDARD_DRINK_IDS } from '../modules/rotes-tor/tor-menu.mjs';
import { PENRUDD_PEOPLE } from '../modules/rotes-tor/penrudd-household.mjs';
import { PENRUDD_APPEARANCES } from '../modules/rotes-tor/penrudd-appearances.mjs';
import { TROETZLI_PEOPLE } from '../modules/gwynthor-troetzli/troetzli-household.mjs';
import { readBreweryCatalogs } from '../modules/brewer-guilds/brewery-catalog-source.mjs';
import { TOR_BEER_SELECTION } from '../modules/rotes-tor/tor-beer.mjs';
const drinkCatalogs = await readBreweryCatalogs();

test('the inn preserves canonical prices and portions instead of inventing a second standard assortment', () => {
  const menu = buildTorMenu(drinkCatalogs);
  assert.equal(menu.items.length, 26);
  assert.equal(new Set(menu.items.map(item => item.id)).size, 26);
  for (const id of TOR_STANDARD_DRINK_IDS) {
    const source = STANDARD_ITEMS.find(item => item.id === id);
    const serving = menu.items.find(item => item.canonicalKey === id);
    assert.equal(serving.unit, source.hiddenMeta.unit, id);
    assert.equal(serving.image, source.image, id);
    assert.equal(Number(serving.priceMin.replace(',', '.')), source.priceRange.minCopper, id);
    assert.equal(serving.priceMax ? Number(serving.priceMax.replace(',', '.')) : source.priceRange.minCopper, source.priceRange.maxCopper, id);
  }
  assert.equal(TOR_DISHES.length, 14);
  assert.ok(menu.items.filter(item => item.image.includes('/food/')).every(item => item.imageFormat === 'square'));
  assert.equal(menu.items.find(item => item.id === 'roter-tortopf').priceMin, '1,4');
  assert.match(TOR_DISHES.find(item => item.id === 'rinderbraten').availability, /Neuntagewoche/);
  assert.ok(TOR_DISHES.every(item => item.portion && item.supply && item.availability));
  menu.items[0].features.push('Local preview edit');
  assert.ok(!buildTorMenu(drinkCatalogs).items[0].features.includes('Local preview edit'));
});

test('all born Penrudds have brown eyes and brown or age-gray hair, without changing the genealogy', () => {
  assert.equal(Object.keys(PENRUDD_APPEARANCES).length, 24);
  const born = PENRUDD_PEOPLE.filter(person => !person.spouse);
  for (const person of born) {
    const look = PENRUDD_APPEARANCES[person.id.replace(/-penrudd$/, '')];
    assert.equal(person.eyeColor, 'braun', person.name);
    if (look) {
      assert.equal(look.eyes, 'braune', person.name);
      assert.match(look.hair, /braun/, person.name);
    } else {
      assert.equal(person, TROETZLI_PEOPLE.esyllt);
      assert.equal(person.hairColor, 'braun', person.name);
      assert.match(person.appearance, /braune Augen/);
    }
    assert.ok(!/grüne Augen/.test(person.appearance), person.name);
  }
  for (const spouse of PENRUDD_PEOPLE.filter(person => person.spouse)) assert.ok(!/\s/.test(spouse.name));
  assert.match(PENRUDD_APPEARANCES.cerys.culture, /Aldrimar/);
  assert.match(PENRUDD_APPEARANCES.bethan.culture, /Aldrimar/);
  for (const key of ['nia', 'ffion']) {
    assert.match(PENRUDD_APPEARANCES[key].culture, /Menschliche Albin/);
    assert.match(PENRUDD_APPEARANCES[key].face, /runde menschliche Ohren/);
  }
});

test('every commissioned portrait and dish is saved locally and connected to its consuming data', async () => {
  const results = JSON.parse(await readFile(new URL('../assets/rotes-tor/image-results.json', import.meta.url), 'utf8'));
  assert.equal(results.images.length, 38);
  assert.equal(new Set(results.images.map(image => image.destination)).size, 38);
  const additions = JSON.parse(await readFile(new URL('../assets/gwynthor-troetzli/asset-manifest.json', import.meta.url), 'utf8'));
  const portraits = [...results.images, ...additions.assets.map(asset => ({ personId: asset.name, destination: asset.path }))];
  const siteRoot = new URL('../../', import.meta.url);
  const almanachRoot = new URL('../', import.meta.url);
  for (const person of PENRUDD_PEOPLE) {
    const portraitUrl = person.portrait.startsWith('/')
      ? new URL(person.portrait.slice(1), siteRoot)
      : new URL(person.portrait, almanachRoot);
    await access(portraitUrl);
    const record = portraits.find(image => image.personId === person.id);
    assert.ok(record, person.name);
    assert.equal(fileURLToPath(new URL(record.destination, siteRoot)), fileURLToPath(portraitUrl));
  }
  for (const item of buildTorMenu(drinkCatalogs).items.filter(item => item.image.startsWith('./'))) {
    await access(new URL(`../${item.image.replace('./', '')}`, import.meta.url));
  }
});

test('the larger card adds three breakfasts and the requested complete bean skillet', () => {
  const breakfasts = TOR_DISHES.filter(item => item.category === 'fruehstueck');
  assert.equal(breakfasts.length, 3);
  assert.ok(breakfasts.every(item => /Morgens/.test(item.availability)));
  const beans = TOR_DISHES.find(item => item.id === 'bohnen-speckpfanne');
  for (const ingredient of [/Bohnen/, /Tomatensauce/, /speck/i, /Scheibe.*Bauernbrot/]) assert.match(beans.description, ingredient);
  assert.ok(TOR_DISHES.some(item => item.id === 'schweineschulter'));
  assert.match(TOR_DISHES.find(item => item.id === 'flussfisch-wurzeln').availability, /frischer Fischlieferung/);
});

test('affordable imported beer keeps exact source prices, portions, origin and pictures', () => {
  const imported = buildTorMenu(drinkCatalogs).items.filter(item => item.category === 'importbiere');
  assert.equal(imported.length, 4);
  for (const [moduleId, itemId, label] of TOR_BEER_SELECTION) {
    const source = drinkCatalogs.find(entry => entry.id === moduleId).pages.flatMap(page => page.tradeCatalog?.items || []).find(item => item.id === itemId);
    const item = imported.find(item => item.id === `tor-import-${itemId}`);
    assert.equal(item.image, source.image);
    assert.equal(item.origin, source.origin);
    assert.deepEqual(item.priceOptions, [source.priceOptions.find(option => option.label === label)]);
    assert.equal(item.priceOptions[0].unit, '0,5 l');
    assert.ok(Number(item.priceOptions[0].price.replace(',', '.')) <= 2);
  }
  assert.ok(imported.every(item => !/whisky|goldhaube|drachenblut|brandhorn|hakenbraeu/.test(item.id)));
});
