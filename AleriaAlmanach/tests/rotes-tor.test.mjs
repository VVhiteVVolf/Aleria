import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildRotesTor, TOR_ID, TOR_SECTION } from '../modules/rotes-tor/tor-module.mjs';
import { TOR_WORKING_PEOPLE } from '../modules/rotes-tor/tor-people.mjs';
import { TOR_CAPACITY, TOR_ROOMS } from '../modules/rotes-tor/tor-rooms.mjs';
import { TOR_SERVICES } from '../modules/rotes-tor/tor-services.mjs';
import { PENRUDD_PEOPLE } from '../modules/rotes-tor/penrudd-household.mjs';
import { readEconomyCalendar } from '../modules/economy-calculator/economy-source-venues.mjs';
import { calculateBusiness, projectBusiness } from '../modules/economy-calculator/economy-engine.mjs';
import { readVenueOffers, readVenueServices } from '../modules/economy-calculator/economy-venue-offers.mjs';
import { evaluateVenueScope } from '../modules/economy-calculator/economy-venue-scope.mjs';
import { readBreweryCatalogs } from '../modules/brewer-guilds/brewery-catalog-source.mjs';

const calendar = await readEconomyCalendar(), drinkCatalogs = await readBreweryCatalogs(), entry = buildRotesTor(calendar, drinkCatalogs), root = new URL('../../', import.meta.url);

test('the complete inn is registered once in the rural folder and exports all twelve pages', async () => {
  assert.equal(entry.id, TOR_ID);
  assert.equal(entry.pages.length, 12);
  assert.equal(entry.pages.filter(page => page.sessionPage).length, 4);
  assert.equal(entry.appendCommentsPage, false);
  assert.equal(new Set(entry.pages.map(page => page.commentThreadKey)).size, entry.pages.length);
  assert.equal(evaluateVenueScope(entry, TOR_SECTION).eligible, true);
  assert.deepEqual(TOR_SECTION.path.slice(-2), ['Bannkreis Gwynthor', 'Zum Roten Tor']);
  assert.ok(!TOR_SECTION.path.includes('Gwynthor-Stadt'));
  const context = vm.createContext({ SECTIONS: [] });
  const registration = await readFile(new URL('../modules/rotes-tor/tor-data.js', import.meta.url), 'utf8');
  vm.runInContext(registration, context); vm.runInContext(registration, context);
  assert.equal(context.SECTIONS.flatMap(section => section.entries).filter(item => item.id === TOR_ID).length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(context.SECTIONS[0].entries[0])), entry);
  const exported = JSON.parse(await readFile(new URL('Charakter Archiv Exporte/Module/Zum Roten Tor/zum-roten-tor-2026-10-20.json', root), 'utf8'));
  assert.deepEqual(exported.module.entry, entry);
  assert.deepEqual(exported.module.section, TOR_SECTION);
});

test('hierarchy reuses existing identities and excludes children, pensioners and the separate farm workforce', () => {
  const hierarchy = entry.pages.find(page => page.hierarchyPage).hierarchy;
  assert.equal(hierarchy.trees.length, 6);
  const nodes = hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));
  const occupied = nodes.filter(node => node.portrait), distinct = new Map(occupied.map(node => [node.title, node]));
  assert.equal(distinct.size, 8);
  assert.deepEqual([...distinct.keys()].sort(), TOR_WORKING_PEOPLE.map(person => person.name).sort());
  for (const person of TOR_WORKING_PEOPLE) {
    assert.ok(PENRUDD_PEOPLE.includes(person));
    assert.equal(distinct.get(person.name).portrait, person.portrait);
    assert.ok(entry.sessionCast.includes(person.worldPersonId));
  }
  assert.equal(nodes.filter(node => /unbesetzt/.test(node.subtitle)).length, 3);
  for (const person of PENRUDD_PEOPLE.filter(person => person.household !== 'inn' || Number(person.birth) > 1720 || ['gwilym-penrudd', 'enid-penrudd'].includes(person.id))) {
    assert.ok(!distinct.has(person.name), person.name);
  }
});

test('meal portions and room or stall tariffs stay separate instead of selling included services twice', () => {
  const menu = entry.pages.find(page => page.tradeCatalogPage).tradeCatalog;
  assert.equal(menu.items.length, 26);
  assert.ok(menu.items.filter(item => item.image.includes('/food/')).every(item => item.imageFormat === 'square'));
  assert.equal(TOR_SERVICES.length, 6);
  const scenario = entry.pages.at(-1).economyCalculation.scenario, result = calculateBusiness(scenario, calendar);
  assert.equal(result.activeCount, 8); assert.equal(result.vacancyCount, 3);
  assert.equal(scenario.workers.find(worker => worker.name === 'Cerys').days, 3);
  assert.equal(scenario.workers.filter(worker => worker.kind === 'family').length, 6);
  assert.ok(result.workers.filter(worker => worker.kind === 'vacancy').every(worker => worker.cash + worker.board === 0));
  for (const offer of readVenueOffers(entry)) assert.equal(scenario.channels.find(channel => channel.id === `tor-gut-${offer.itemId}`).unitCopper, offer.unitCopper);
  const foodIds = new Set(menu.items.filter(item => item.image.includes('/food/')).map(item => `tor-gut-${item.id}`));
  const foodShare = scenario.channels.filter(channel => foodIds.has(channel.id)).reduce((sum, channel) => sum + channel.quantity, 0);
  const drinkShare = scenario.channels.filter(channel => channel.id.startsWith('tor-gut-') && !foodIds.has(channel.id)).reduce((sum, channel) => sum + channel.quantity, 0);
  assert.ok(Math.abs(foodShare - .84) < 1e-10, 'a larger menu redistributes meals instead of creating extra visits');
  assert.ok(Math.abs(drinkShare - 1.7) < 1e-10);
  assert.ok(scenario.channels.filter(channel => channel.id.startsWith('tor-gut-tor-import-')).every(channel => channel.materialRatio > .48));
  for (const service of readVenueServices(entry)) assert.ok(scenario.channels.some(channel => channel.source === service.source && channel.unitCopper === service.unitCopper));
  assert.equal(scenario.channels.filter(channel => /tor-dienst-.*kammer$/.test(channel.id)).reduce((sum, channel) => sum + channel.quantity, 0), 6);
  assert.equal(TOR_CAPACITY.singleRooms + TOR_CAPACITY.doubleRooms * 2, 10);
  const crowded = calculateBusiness(scenario, calendar, { demand: 3 });
  assert.ok(crowded.channels.find(channel => channel.id === 'tor-gut-rinderbraten').quantity <= 18);
  assert.ok(crowded.channels.find(channel => channel.id === 'tor-dienst-gastpferd').quantity <= TOR_CAPACITY.horseStalls * 9);
  assert.ok(crowded.channels.find(channel => channel.id === 'tor-dienst-doppelkammer').quantity <= TOR_CAPACITY.doubleRooms * 9);
  assert.ok(Object.values(result.totals).every(Number.isSafeInteger));
  assert.equal(projectBusiness(scenario, calendar, 52).totals.payroll, result.totals.payroll * 52);
  assert.equal(scenario.contextId, '', 'the rural inn does not silently inherit the wealthy city household profile');
});

test('the final authored calculator survives normalization and rebuilt instances share no mutable state', async () => {
  const context = vm.createContext({ structuredClone, AleriaCalendar: calendar });
  vm.runInContext(await readFile(new URL('../modules/economy-calculator/economy-runtime.global.js', import.meta.url), 'utf8'), context);
  const local = structuredClone(entry), scenario = local.pages.at(-1).economyCalculation.scenario;
  scenario.workers.find(worker => worker.name === 'Cerys').days = 2;
  const normalized = context.AleriaEconomy.upgradeEntry(local, TOR_SECTION);
  assert.equal(normalized.pages.filter(page => page.economyCalculationPage).length, 1);
  assert.equal(normalized.pages.at(-1).economyCalculation.scenario.workers.find(worker => worker.name === 'Cerys').days, 2);
  assert.equal(buildRotesTor(calendar, drinkCatalogs).pages.at(-1).economyCalculation.scenario.workers.find(worker => worker.name === 'Cerys').days, 3);
});

test('the empty guest register and four scenes contain no fabricated guests or inherited scene clocks', () => {
  const register = entry.pages.find(page => page.guestRegisterPage).guestRegister;
  assert.equal(register.sections.flatMap(section => section.guests).length, 12);
  assert.ok(register.sections.flatMap(section => section.guests).every(guest => guest.name === 'Freier Platz' && !guest.portrait));
  for (const room of TOR_ROOMS) {
    const page = entry.pages.find(page => page.commentThreadKey === `tor-${room.id}`);
    assert.ok(page.sessionPage);
    assert.deepEqual(page.sessionDateAleria, { year: null, month: null, day: null });
  }
});

test('all five new scene images are retained unchanged and every referenced picture exists', async () => {
  const results = JSON.parse(await readFile(new URL('../assets/rotes-tor/scene-results.json', import.meta.url), 'utf8'));
  assert.equal(results.images.length, 5);
  for (const image of results.images) {
    const bytes = await readFile(new URL(image.destination, root));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(bytes.readUInt32BE(16), 1024); assert.equal(bytes.readUInt32BE(20), 1536);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
  }
  const references = new Set();
  const visit = value => {
    if (typeof value === 'string' && /^(?:\.\/assets\/|\.\.\/Stammbäume\/|\.\.\/IconOrdner\/).+\.(?:png|webp|jpg)$/i.test(value)) references.add(value);
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') Object.values(value).forEach(visit);
  };
  visit(entry);
  for (const reference of references) await access(new URL(reference, new URL('../', import.meta.url)));
});
