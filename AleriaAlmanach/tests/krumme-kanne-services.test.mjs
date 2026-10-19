import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { withKanneServices } from '../modules/krumme-kanne/krumme-kanne-services.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { applyVenuePriceReview } from '../modules/economy-pricing/price-review-model.mjs';
const source = JSON.parse(await readFile(new URL('../modules/krumme-kanne/source/module-before-services.json', import.meta.url), 'utf8')).entry;
const entry = withKanneServices(source);

test('Kanne service insertion preserves reviewed pages, comment identities and purchase offers', () => {
  assert.equal(entry.pages.length, source.pages.length + 1);
  assert.deepEqual(entry.pages.filter(page => !page.guildServicesPage), applyVenuePriceReview(source).pages);
  assert.deepEqual(withKanneServices(entry), entry);
  assert.deepEqual(buildModuleOffers([entry], []), buildModuleOffers([source], []));
  const page = entry.pages[4];
  assert.equal(page.guildServicesPage, true);
  assert.equal(page.guildServices.services.length, 11);
  assert.ok(page.guildServices.services.every(service => service.scope && service.terms));
  assert.match(page.guildServices.conditions, /36 Nächte/);
  assert.ok(page.guildServices.services.some(service => /72 Kupfertaler/.test(service.terms)));
});

test('Kanne services reference their own six local icons', async () => {
  const icons = new Set(entry.pages[4].guildServices.services.map(service => service.icon));
  assert.equal(icons.size, 6);
  for (const icon of icons) await access(new URL(`../${icon}`, import.meta.url));
});
