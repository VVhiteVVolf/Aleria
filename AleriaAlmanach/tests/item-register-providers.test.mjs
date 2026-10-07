import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { moduleProviders, registerLists, groupProviders } from '../modules/item-register/item-register-providers.js';
import { providerOverview, providerNavigation } from '../modules/item-register/item-register-provider-view.js';
import { PROVIDER_TRADES, PROVIDER_REGIONS, providerDirectoryEntry } from '../modules/item-register/item-register-provider-directory.js';
import { createRegisterStore } from '../modules/item-register/item-register-store.js';

const offer = (id, extra = {}) => ({ id: `offer:${id}`, listId: `module:${id}`, listName: id, section: 'offer', ...extra });

test('offers group once by trade and home region, retaining unknown lists and excluding archived offers', () => {
  const items = [offer('teyrngarch-brauerzunft'), offer('gortach-brauerei'), offer('penderyn-brauer-destillierzunft'),
    offer('celtigerns-letzte-rast'), offer('modul-1781474092957'), offer('die-lachende-nixe'),
    offer('new-shop', { listId: 'custom:list', listName: 'Eigene Liste' }), offer('archived', { archived: true }),
    offer('gortach-brauerei', { id: 'second-serving' })];
  const before = structuredClone(items);
  const groups = groupProviders(registerLists(items));
  const lists = groups.flatMap(group => group.regions.flatMap(region => region.lists));
  assert.equal(lists.length, 7);
  assert.equal(new Set(lists.map(list => list.id)).size, 7);
  assert.equal(groups.reduce((sum, group) => sum + group.count, 0), 8);
  const brewers = groups.find(group => group.id === 'brewers');
  assert.equal(brewers.providerCount, 3);
  assert.equal(brewers.count, 4);
  assert.deepEqual(brewers.regions.map(region => region.id).sort(), ['sonnenkueste', 'tir-na-tonn', 'vortigerns-ruh']);
  assert.equal(groups.find(group => group.id === 'inns').regions[0].lists.length, 2);
  assert.equal(groups.at(-1).regions[0].id, 'unassigned');
  assert.deepEqual(items, before);
});

test('original local signs replace known URLs; custom emblems and module offer revisions survive', () => {
  const entry = { id: 'celtigerns-letzte-rast', title: 'Letzte Rast', pages: [{ goodsTablePage: true, goodsTable: {
    headerIcon: 'https://i.imgur.com/c9Q2tPn.png', tables: [{ id: 'menu', columns: [{ id: 'name', label: 'Name' }, { id: 'price', label: 'Preis' }], rows: [{ values: { name: 'Mahlzeit', price: '3 KT' } }] }]
  } }] };
  const store = createRegisterStore({ standards: [] });
  store.setModules([entry]);
  const before = store.snapshot().offers;
  assert.equal(before.length, 1);
  assert.match(store.snapshot().providers[0].images[0], /etablissements\/celtigerns-letzte-rast\.png$/);
  entry.pages[0].goodsTable.headerIcon = './public/custom-sign.png';
  store.setModules([entry]);
  assert.equal(store.snapshot().providers[0].images[0], './public/custom-sign.png');
  assert.deepEqual(store.snapshot().offers, before);
  assert.match(moduleProviders([{ id: 'herberge-bei-owains-anwesen' }])[0].images[0], /owains-herberge/);
  assert.deepEqual(registerLists([{ ...offer('owner'), section: 'owned' }])[0].images, []);
});

test('directory renders safe labels, actual offer IDs and independently collapsible groups', () => {
  const items = [offer('gortach-brauerei'), offer('custom', { listName: '<img onerror="bad()">' })];
  const html = providerOverview(items);
  assert.match(html, /data-provider-trade="brewers"/);
  assert.match(html, /data-provider-region="tir-na-tonn"/);
  assert.match(html, /data-id="module:gortach-brauerei"/);
  assert.match(html, /&lt;img onerror=&quot;bad\(\)&quot;&gt;/);
  const lists = registerLists(items);
  assert.doesNotMatch(providerNavigation(lists, {}), /<details[^>]*\bopen\b/);
  const nav = providerNavigation(lists, { expandedProviderGroups: new Set(['brewers']) });
  assert.match(nav, /data-ir-provider-group="brewers" open/);
  assert.doesNotMatch(nav, /data-ir-provider-group="other" open/);
});

test('directory artwork exists in the deployed project tree', async () => {
  const art = [...PROVIDER_TRADES.map(trade => trade.image), ...Object.values(PROVIDER_REGIONS).map(region => region.image),
    ...['herberge-bei-owains-anwesen', 'celtigerns-letzte-rast', 'modul-1781474092957', 'die-lachende-nixe', 'modul-1781813764249'].flatMap(id => providerDirectoryEntry(id).images)];
  for (const image of art) await access(new URL(image, new URL('../AleriaAlmanach.html', import.meta.url)));
});
