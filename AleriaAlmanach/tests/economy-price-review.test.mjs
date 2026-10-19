import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { parsePrice } from '../modules/item-register/item-register-money.js';
import { applyVenuePriceReview, reviewTradePrice } from '../modules/economy-pricing/price-review-model.mjs';
import { readEconomyCalendar, readEconomyModuleSources } from '../modules/economy-calculator/economy-source-venues.mjs';
import { evaluateVenueScope } from '../modules/economy-calculator/economy-venue-scope.mjs';
import { buildVenueScenario } from '../modules/economy-calculator/economy-venue-scenario.mjs';
import { buildExampleScenario } from '../modules/economy-calculator/economy-examples.mjs';
import { buildVenueWorkforce, rolePay } from '../modules/economy-calculator/economy-venue-workforce.mjs';
import { getVenueProfile } from '../modules/economy-calculator/economy-venue-profiles.mjs';
import { calculateBusiness, projectBusiness } from '../modules/economy-calculator/economy-engine.mjs';
import { createOwnedItem, buildOwnedItems } from '../modules/item-register/item-register-model.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { buildModuleOffers as buildServerOffers } from '../../firebase/functions/src/generated/item-register/item-register-module-catalog.js';
import { STANDARD_VERSION } from '../modules/item-register/item-register-standard.js';
import { STANDARD_ITEMS as SERVER_STANDARDS, STANDARD_VERSION as SERVER_VERSION } from '../../firebase/functions/src/generated/item-register/item-register-standard.js';
const calendar = await readEconomyCalendar(), sections = await readEconomyModuleSources();
const records = sections.flatMap(section => section.entries.map(entry => ({ section, entry })));
const eligible = records.filter(({ section, entry }) => evaluateVenueScope(entry, section).eligible);
const expected = ['gwynthor-zum-kleinen-durst', 'modul-1781474092957', 'celtigerns-letzte-rast', 'goettliche-eleganz', 'gwynthor-zum-vollen-korb',
  'gwynthor-badehaus-fontani', 'gwynthor-gestiefelte-muschi', 'gwynthor-zum-letzten-heller', 'zum-dritten-funken', 'gwynthor-zur-klingenden-krone',
  'die-lachende-nixe', 'herberge-bei-owains-anwesen', 'modul-1781813764249', 'zum-roten-drachen-taverne'];

test('only the actual culture-tab sales locations qualify, including legacy Story-tagged shops', () => {
  assert.deepEqual(eligible.map(row => row.entry.id).sort(), expected.sort());
  for (const id of ['gwynthor-kampfarena', 'gwynthorer-theater', 'gwynthor-gwregysdu-lagerhaeuser']) {
    const source = eligible[0];
    assert.equal(evaluateVenueScope({ ...source.entry, id }, source.section).eligible, false);
  }
  assert.equal(evaluateVenueScope({ ...eligible[0].entry, title: 'Taverne an der Arena' }, eligible[0].section).eligible, true);
  assert.equal(evaluateVenueScope(eligible[0].entry, { tab: 'Gilden & Zünfte' }).eligible, false);
  assert.equal(evaluateVenueScope(eligible[0].entry, { tab: 'Void' }).eligible, false);
});

test('every qualifying module receives exactly one final calculation without changing scene threads', async () => {
  const context = vm.createContext({ structuredClone, AleriaCalendar: calendar });
  vm.runInContext(await readFile(new URL('../modules/economy-calculator/economy-runtime.global.js', import.meta.url), 'utf8'), context);
  for (const { section, entry } of records) {
    const upgraded = context.AleriaEconomy.upgradeEntry(entry, section), qualifies = evaluateVenueScope(entry, section).eligible;
    assert.equal(upgraded.pages.filter(page => page.economyCalculationPage).length, qualifies ? 1 : 0, entry.title);
    assert.deepEqual(Array.from(upgraded.pages.filter(page => !page.economyCalculationPage), page => page.commentThreadKey), entry.pages.map(page => page.commentThreadKey));
    if (qualifies) {
      assert.equal(upgraded.pages.at(-1).economyCalculationPage, true);
      upgraded.pages.at(-1).economyCalculation.scenario.householdWeekly = 456;
      assert.equal(context.AleriaEconomy.upgradeEntry(upgraded, section).pages.at(-1).economyCalculation.scenario.householdWeekly, 456);
    }
  }
});

test('price review is once-only, source guarded, denomination aware and preserves later author edits', () => {
  const item = { id: 'standard:waffen-rustungen:lanze', title: 'Lanze', priceMin: '1,2', priceMax: '', currencyCode: 'GT', status: 'available' };
  const first = applyVenuePriceReview({ id: 'shop', pages: [{ tradeCatalogPage: true, tradeCatalog: { items: [item] } }] });
  assert.equal(first.pages[0].tradeCatalog.items[0].priceMin, '150');
  assert.equal(first.pages[0].tradeCatalog.items[0].currencyCode, 'KT');
  assert.equal(applyVenuePriceReview(first), first);
  first.pages[0].tradeCatalog.items[0].priceMin = '1,2'; first.pages[0].tradeCatalog.items[0].currencyCode = 'GT';
  assert.equal(applyVenuePriceReview(first).pages[0].tradeCatalog.items[0].priceMin, '1,2', 'authored post-review prices are not rewritten');
  assert.equal(reviewTradePrice({ ...item, priceMin: '2,2' }).priceMin, '2,2', 'unknown authored amount is not silently replaced');
});

test('all 50 canonical livestock and horse price bands remain unchanged', async () => {
  const baseline = JSON.parse(await readFile(new URL('../modules/economy-pricing/sources/prices-before-2026-10-19.json', import.meta.url), 'utf8'));
  const animals = baseline.filter(row => ['Viehmarkt', 'Rossmarkt'].includes(row.source));
  assert.equal(animals.length, 50);
  for (const old of animals) assert.deepEqual(STANDARD_ITEMS.find(item => item.id === old.id).priceRange, old.price);
});

test('the server rebuilds exactly the reviewed browser offers from an old stored module', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../modules/economy-calculator/sources/public-shop-modules-2026-10-19.json', import.meta.url), 'utf8'));
  const raw = snapshot.records.find(row => row.entry.id === 'modul-1781474092957').entry;
  const before = JSON.stringify(raw);
  assert.equal(SERVER_VERSION, STANDARD_VERSION);
  assert.deepEqual(buildServerOffers([raw], SERVER_STANDARDS), buildModuleOffers([applyVenuePriceReview(raw)], STANDARD_ITEMS));
  assert.equal(JSON.stringify(raw), before, 'a purchase lookup never rewrites the stored module');
});

test('ordinary goods reflect material and portion costs rather than inconsistent copied prices', () => {
  const cost = id => STANDARD_ITEMS.find(item => item.id.endsWith(`:${id}`)).priceRange.minCopper;
  assert.ok(cost('kochgeschirr') > cost('holzschuessel'));
  assert.ok(cost('trinkschlauch-klein') < cost('wasserschlauch'));
  assert.ok(cost('kreide') < cost('tonbecher'));
  assert.ok(cost('rattenpruegel') < cost('lanze') && cost('lanze') < cost('stahlschwert'));
  assert.ok(cost('gebackenes-huhn') >= STANDARD_ITEMS.find(item => item.id === 'standard:viehmarkt:huhn').priceRange.maxCopper / 2);
});

test('new catalogue prices do not rewrite acquired prices, inventory or live character resources', () => {
  const template = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:lanze');
  const old = { ...template, priceRange: { ...template.priceRange, minCopper: 1200, maxCopper: 1200 } };
  const item = createOwnedItem(old, { id: 'existing-lance', characterId: 'holder', characterName: 'Besitzer', quantity: 1, unitCopper: 1200, now: '1740-03-09' });
  const character = { id: 'holder', name: 'Besitzer', inventory: { items: [item] }, combatProfile: { hitPoints: { current: 3, maximum: 12 }, resources: { mana: 4 } } };
  const before = JSON.stringify(character), view = buildOwnedItems([character], STANDARD_ITEMS)[0];
  assert.equal(view.priceRange.minCopper, 1200);
  assert.equal(item.purchase.unitCopper, 1200);
  assert.equal(JSON.stringify(character), before);
});

test('teachers do not become apprentices, unnamed occupied roles cost wages and animals never do', () => {
  assert.equal(rolePay('Altmeisterin · Schnittkunde und Ausbildung', '').kind, undefined);
  assert.equal(rolePay('Bader in Ausbildung', '').kind, 'apprentice');
  const heller = eligible.find(row => row.entry.id === 'gwynthor-zum-letzten-heller').entry;
  const workers = buildVenueWorkforce(heller, getVenueProfile(heller));
  assert.equal(workers.find(worker => worker.name === 'Borst').kind, 'animal');
  const bath = eligible.find(row => row.entry.id === 'gwynthor-badehaus-fontani').entry;
  assert.equal(buildVenueWorkforce(bath, getVenueProfile(bath)).filter(worker => worker.kind === 'employee').length, 8);
  const nixe = eligible.find(row => row.entry.id === 'die-lachende-nixe').entry;
  assert.equal(buildVenueWorkforce(nixe, getVenueProfile(nixe)).filter(worker => worker.role === 'Magd').length, 3, 'three anonymous posts are not one named person');
});

test('every new scenario is valid; unpriced slots and unavailable products produce no fictitious sales', () => {
  for (const { section, entry } of eligible.filter(row => !['gwynthor-zum-kleinen-durst', 'modul-1781474092957', 'celtigerns-letzte-rast'].includes(row.entry.id))) {
    const scenario = buildVenueScenario(entry, section, calendar), result = calculateBusiness(scenario, calendar);
    assert.ok(result.channels.every(channel => channel.unitCopper > 0 && !/Neues Handelsgut/.test(channel.label)), entry.title);
    assert.ok(Object.values(result.totals).every(Number.isSafeInteger));
    assert.ok(result.workers.filter(worker => ['vacancy', 'animal'].includes(worker.kind)).every(worker => worker.cash === 0));
  }
});

test('an edited original example tolerates removed offers and additional actual staff', () => {
  const original = eligible.find(row => row.entry.id === 'gwynthor-zum-kleinen-durst').entry, entry = structuredClone(original);
  const catalog = entry.pages.find(page => page.tradeCatalogPage).tradeCatalog;
  catalog.items = catalog.items.filter(item => item.id !== 'matrosenhappen');
  entry.pages.find(page => page.hierarchyPage).hierarchy.trees[0].levels[0].nodes.push({ id: 'new-helper', title: 'Padrig', subtitle: 'Hausgehilfe' });
  const result = calculateBusiness(buildExampleScenario(entry, calendar), calendar);
  assert.equal(result.activeCount, 7);
  assert.ok(result.workers.find(worker => worker.name === 'Padrig').cash > 0);
  assert.equal(result.channels.find(channel => channel.id === 'goods-matrosenhappen').sales, 0);
  assert.ok(original.pages.find(page => page.tradeCatalogPage).tradeCatalog.items.some(item => item.id === 'matrosenhappen'));
});

test('an end-of-stock projection sells each surviving bottle once, even over a whole year', () => {
  const scenario = { title: 'Endlicher Keller', channels: [{ id: 'last-bottles', label: 'Letzte Flaschen', basis: 'fixed', quantity: 2, stockUnits: 5, unitCopper: 10, materialRatio: 0 }] };
  const year = projectBusiness(scenario, calendar, 52);
  assert.equal(year.totals.gross, 5000);
  assert.equal(year.stockEnd['last-bottles'], 0);
  assert.equal(scenario.channels[0].stockUnits, 5, 'source stock is not mutated');
});

test('revenue shares are staff costs once and do not turn into repeated fixed salary', () => {
  const scenario = { title: 'Gesellschaft', channels: [{ id: 'company', label: 'Gesellschaft', basis: 'fixed', quantity: 10, unitCopper: 10, materialRatio: 0 }],
    workers: [{ id: 'staff', count: 2, days: 6, dailyCash: 1, kind: 'employee', salesShare: .5, salesChannelIds: ['company'] }] };
  const result = calculateBusiness(scenario, calendar);
  assert.equal(result.totals.payroll, 6200);
  assert.equal(result.workers[0].perHeadBaseCash, 600);
  assert.equal(result.workers[0].commissionPerHead, 2500);
  assert.equal(result.workers[0].perHeadCash, 3100);
  assert.throws(() => calculateBusiness({ ...scenario, workers: [...scenario.workers, { ...scenario.workers[0], id: 'other', salesShare: .6 }] }, calendar), /Erfolgsanteile/);
});

test('a guild owner is a legal account, not an extra paid or active person', () => {
  const { entry, section } = eligible.find(row => row.entry.id === 'gwynthor-zur-klingenden-krone');
  const result = calculateBusiness(buildVenueScenario(entry, section, calendar), calendar);
  assert.equal(result.activeCount, 40);
  assert.equal(result.workers.find(worker => worker.id === 'business-owner').count, 0);
  assert.equal(result.owners[0].name, 'Betriebskasse · Klingende Krone');
  assert.ok(result.workers.find(worker => worker.name === 'Finlay Cneacail').cash > 0);
});
