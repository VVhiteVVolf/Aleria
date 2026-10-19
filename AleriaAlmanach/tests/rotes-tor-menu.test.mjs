import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { buildTorMenu, TOR_DISHES, TOR_STANDARD_DRINK_IDS } from '../modules/rotes-tor/tor-menu.mjs';
import { PENRUDD_PEOPLE } from '../modules/rotes-tor/penrudd-household.mjs';
import { PENRUDD_APPEARANCES } from '../modules/rotes-tor/penrudd-appearances.mjs';

test('the inn preserves canonical prices and portions instead of inventing a second standard assortment', () => {
  const menu = buildTorMenu();
  assert.equal(menu.items.length, 16);
  assert.equal(new Set(menu.items.map(item => item.id)).size, 16);
  for (const id of TOR_STANDARD_DRINK_IDS) {
    const source = STANDARD_ITEMS.find(item => item.id === id);
    const serving = menu.items.find(item => item.canonicalKey === id);
    assert.equal(serving.unit, source.hiddenMeta.unit, id);
    assert.equal(serving.image, source.image, id);
    assert.equal(Number(serving.priceMin.replace(',', '.')), source.priceRange.minCopper, id);
    assert.equal(serving.priceMax ? Number(serving.priceMax.replace(',', '.')) : source.priceRange.minCopper, source.priceRange.maxCopper, id);
  }
  assert.equal(TOR_DISHES.length, 8);
  assert.ok(menu.items.filter(item => item.image.includes('/food/')).every(item => item.imageFormat === 'square'));
  assert.equal(menu.items.find(item => item.id === 'roter-tortopf').priceMin, '1,4');
  assert.match(TOR_DISHES.find(item => item.id === 'rinderbraten').availability, /Neuntagewoche/);
  assert.ok(TOR_DISHES.every(item => item.portion && item.supply && item.availability));
  menu.items[0].features.push('Local preview edit');
  assert.ok(!buildTorMenu().items[0].features.includes('Local preview edit'));
});

test('all born Penrudds have brown eyes and brown or age-gray hair, without changing the genealogy', () => {
  assert.equal(Object.keys(PENRUDD_APPEARANCES).length, 24);
  const born = PENRUDD_PEOPLE.filter(person => !person.spouse);
  for (const person of born) {
    const look = PENRUDD_APPEARANCES[person.id.replace(/-penrudd$/, '')];
    assert.equal(person.eyeColor, 'braun', person.name);
    assert.equal(look.eyes, 'braune', person.name);
    assert.match(look.hair, /braun/, person.name);
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
  assert.equal(results.images.length, 32);
  assert.equal(new Set(results.images.map(image => image.destination)).size, 32);
  for (const person of PENRUDD_PEOPLE) {
    await access(new URL(`../${person.portrait.replace('./', '')}`, import.meta.url));
    const record = results.images.find(image => image.personId === person.id);
    assert.ok(record, person.name);
    assert.equal(fileURLToPath(new URL(`../../${record.destination}`, import.meta.url)),
      fileURLToPath(new URL(`../${person.portrait.replace('./', '')}`, import.meta.url)));
  }
  for (const item of buildTorMenu().items.filter(item => item.image.startsWith('./'))) {
    await access(new URL(`../${item.image.replace('./', '')}`, import.meta.url));
  }
});
