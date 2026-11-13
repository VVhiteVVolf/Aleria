import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildResaleRegistration } from '../modules/gwynthor-horse-resale/resale-module.mjs';
import { RESALE_HORSES } from '../modules/gwynthor-horse-resale/resale-catalog.mjs';
import { buildResaleCharacterExports } from '../modules/gwynthor-horse-resale/resale-characters.mjs';
import { RESALE_PEOPLE } from '../../Stammbäume/assets/js/data/gwynthor-horse-resale/resale-family.mjs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../../Stammbäume/assets/js/adapters/family-chart-layout-policy.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { GWYNTHOR_CITY_PATH } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';
const { entry, path } = buildResaleRegistration(), record = FAMILY_REGISTRY.find(r => r.id === 'haus-ruddgraen');

test('the inexpensive third venue lives directly in the city and replaces saddlery with an inspection yard', () => {
  assert.deepEqual(path, GWYNTHOR_CITY_PATH); assert.equal(entry.pages.length, 9);
  assert.equal(entry.pages.filter(p => p.tradeCatalogPage).length, 1);
  assert.deepEqual(entry.pages.filter(p => p.sessionPage).map(p => p.pageTitle), ['Szene · Verkaufsraum', 'Szene · Stall', 'Szene · Ankaufshof']);
  assert(entry.pages.at(-1).economyCalculationPage); assert.equal(entry.sessionCast.length, 6);
  const roles = entry.pages[3].hierarchy.trees.flatMap(t => t.levels.flatMap(l => l.nodes));
  assert.equal(roles.filter(r => r.characterId).length, 6); assert(!roles.some(r => /Zuchtmeister|Sattler|Fohlenpfleger/.test(r.title)));
  assert(roles.every(r => !RESALE_PEOPLE.some(p => r.text.includes(p.name))));
});
test('only one canonical replenishable workhorse offer and four cheap undocumented individual mixes are sold', () => {
  const catalog = entry.pages[4].tradeCatalog, offers = buildModuleOffers([entry], STANDARD_ITEMS), standard = STANDARD_ITEMS.find(i => i.id === 'standard:viehmarkt:arbeitsgaul');
  assert.equal(catalog.categories.length, 2); assert.equal(catalog.items.length, 5); assert.equal(offers.length, 5);
  assert.equal(catalog.items[0].image, standard.image); assert.deepEqual(catalog.items[0].definitionRef, standard.definitionRef);
  assert.equal(catalog.items[0].definitionKind, 'shared'); assert.equal(offers[0].priceRange.minCopper, 180);
  assert.equal(new Set(RESALE_HORSES.map(h => h.name)).size, 4);
  for (const h of RESALE_HORSES) { assert(!h.breed && !h.parents); assert(h.price >= standard.priceRange.minCopper && h.price <= 210); }
  assert(catalog.items.slice(1).every(i => i.definitionKind === 'unique' && /\/horses\//.test(i.image)));
  const s = entry.pages.at(-1).economyCalculation.scenario;
  assert.equal(s.workers.length, 6); assert.equal(s.channels.length, 5); assert(s.channels.filter(c => /horse-/.test(c.id)).every(c => c.quantity === 0));
});
test('one married couple and their four children keep the requested ages and generate six separate world identities', () => {
  const family = record.family; assert.deepEqual(assertValidFamily(family).diagnostics, []); assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.equal(family.persons.length, 6); assert.equal(family.partnerships.length, 1); assert.equal(family.parentages.length, 4);
  assert.equal(family.timeJumps.length, 0); assert.deepEqual(RESALE_PEOPLE.map(p => 1740 - Number(p.birth)), [57, 46, 23, 21, 19, 17]);
  assert.deepEqual(RESALE_PEOPLE.slice(2).map(p => p.sex), ['female', 'female', 'female', 'male']);
  const exports = buildResaleCharacterExports(record, '2026-11-13T16:00:00Z');
  assert.equal(new Set(exports.map(e => e.character.id)).size, 6);
  assert(exports.every(e => e.character.portrait && e.character.biography && (e.character.inventory == null || e.character.inventory.items.length === 0)));
});
test('all fifteen requested portraits, horses, heraldry, sign and scenes have immutable admitted assets', async () => {
  const manifest = JSON.parse(await fs.readFile(new URL('../assets/gwynthor-horse-resale/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.active.length, 15); assert.equal(manifest.images.length, 15);
  for (const item of manifest.images) assert.equal(createHash('sha256').update(await fs.readFile(new URL(`../../${item.path}`, import.meta.url))).digest('hex'), item.sha256);
});
