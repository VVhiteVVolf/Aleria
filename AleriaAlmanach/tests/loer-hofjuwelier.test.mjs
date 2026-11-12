import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { buildAurddenModule, AURDDEN_SECTION } from '../modules/loer-hofjuwelier/aurdden-module.mjs';
import { AURDDEN_BROTHERS, AURDDEN_PEOPLE, AURDDEN_STAFF } from '../modules/loer-hofjuwelier/aurdden-people.mjs';
import { AURDDEN_RAW_STONES, aurddenRawPrice } from '../modules/loer-hofjuwelier/aurdden-catalog.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { readVenueOffers } from '../modules/economy-calculator/economy-venue-offers.mjs';
import { calculateBusiness } from '../modules/economy-calculator/economy-engine.mjs';
import { projectGwynthorPath, GWYNTHOR_CITY_PATH } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';

const entry = buildAurddenModule();
test('one complete jeweller sits in Klingende Münze within Gwynthor city', () => {
  assert.deepEqual(projectGwynthorPath(AURDDEN_SECTION.path), [...GWYNTHOR_CITY_PATH, 'Die Klingende Münze - Gwynthor']);
  assert.equal(entry.pages.length, 13);
  assert(entry.pages[1].biographyPage && entry.pages[2].familyTreePage && entry.pages[3].hierarchyPage);
  assert.deepEqual(entry.pages.slice(4, 8).map(page => page.tradeCatalog.items.length), [10, 10, 10, 20]);
  assert(entry.pages[8].guildServicesPage);
  assert(entry.pages.slice(9, 12).every(page => page.sessionPage));
  assert(entry.pages.at(-1).economyCalculationPage);
  assert.equal(new Set(entry.pages.map(page => page.commentThreadKey)).size, 13);
  assert.equal(entry.appendCommentsPage, false);
});

test('actual staff have world identities; away relatives, children and bank branch cannot become shop staff', () => {
  assert.equal(entry.sessionCast.length, 16);
  assert.equal(new Set(entry.sessionCast).size, 16);
  const forbidden = AURDDEN_PEOPLE.filter(person => person.branch === 'bank' || person.death || person.marriedAway || person.engagedAway || person.bastard || person.age < 16);
  assert(forbidden.every(person => !entry.sessionCast.includes(person.characterId)));
  const nodes = entry.pages[3].hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));
  assert.deepEqual([...new Set(nodes.flatMap(node => node.characterId || []))].sort(), [...entry.sessionCast].sort());
  assert.equal(nodes.filter(node => node.subtitle === 'Unbesetzter Posten').length, 5);
  assert(nodes.some(node => node.title.startsWith('Meier') && node.subtitle === 'Unbesetzter Posten'));
  assert.equal(AURDDEN_STAFF.filter(person => person.branch === 'wache').length, 2);
});

test('all fifty real offers resolve and luxury thousand separators preserve their full value', () => {
  const offers = buildModuleOffers([entry], STANDARD_ITEMS);
  assert.equal(offers.length, 50);
  assert.equal(new Set(offers.map(offer => offer.id)).size, 50);
  assert(offers.every(offer => offer.priceRange.minCopper > 0));
  const own = offers.filter(offer => !offer.templateId);
  assert.equal(own.length, 30);
  const high = readVenueOffers(entry).find(offer => offer.itemId.endsWith('diamantdiadem-sterngarten'));
  assert.equal(high.unitCopper, 14500);
  assert.equal(entry.pages.at(-1).economyCalculation.scenario.channels.find(channel => channel.id.endsWith('diamantdiadem-sterngarten')).unitCopper, 14500);
  assert(!offers.some(offer => offer.definitionKind === 'unique'));
});

test('venue gemstone markups preserve the canonical definitions, quantity and attributes', () => {
  assert.equal(AURDDEN_RAW_STONES.length, 20);
  const items = entry.pages[7].tradeCatalog.items;
  for (const stone of AURDDEN_RAW_STONES) {
    const offer = items.find(item => item.canonicalKey === stone.canonicalKey);
    assert(offer, stone.id);
    assert.equal(offer.unit, stone.hiddenMeta.unit);
    assert.deepEqual(offer.attributes, stone.attributes);
    assert.deepEqual(offer.definitionRef, stone.definitionRef);
    const parsed = readVenueOffers({ pages: [{ tradeCatalogPage: true, tradeCatalog: { items: [offer] } }] })[0];
    assert.equal(parsed.unitCopper, aurddenRawPrice(stone));
    assert(parsed.unitCopper > stone.priceRange.maxCopper);
    const channel = entry.pages.at(-1).economyCalculation.scenario.channels.find(channel => channel.id === 'absatz-' + offer.id);
    assert(Math.abs(channel.unitCopper * channel.materialRatio - stone.priceRange.minCopper * .8) < 1e-8);
  }
  assert.equal(aurddenRawPrice(AURDDEN_RAW_STONES.find(stone => stone.id.endsWith(':saphir'))), 400);
  assert.equal(aurddenRawPrice(AURDDEN_RAW_STONES.find(stone => stone.id.endsWith(':rubin'))), 450);
  assert.equal(aurddenRawPrice(AURDDEN_RAW_STONES.find(stone => stone.id.endsWith(':diamant'))), 900);
});

test('economy counts people once and leaves unsupported bank and Loer income out', () => {
  const scenario = entry.pages.at(-1).economyCalculation.scenario;
  assert.equal(scenario.channels.length, 56);
  assert.equal(scenario.workers.length, 21);
  assert.equal(scenario.workers.filter(worker => worker.kind === 'owner').length, AURDDEN_BROTHERS.length);
  assert.equal(scenario.workers.filter(worker => worker.kind === 'vacancy').length, 5);
  assert.equal(new Set(scenario.workers.map(worker => worker.id)).size, 21);
  assert.equal(scenario.assetValuesKnown, false);
  assert(scenario.workers.filter(worker => /aldrimarischer Söldner/.test(worker.role)).every(worker => worker.dailyCash === 5.5));
  assert(scenario.assumptions.some(text => /vor dieser Beteiligung/.test(text)));
  assert(!scenario.channels.some(channel => /Bank|Münzpräg/.test(channel.label)));
  const result = calculateBusiness(scenario, { daysPerWeek: 9, daysPerMonth: 36, daysPerYear: 468, monthsPerYear: 13 });
  assert.equal(result.factors.weeksPerYear, 52);
  assert(result.totals.gross > 0 && Number.isFinite(result.totals.freeCash));
  assert(result.workers.filter(worker => worker.kind === 'vacancy').every(worker => worker.cash === 0));
});

test('registration moves only this shop, is idempotent, and protects other district members', async () => {
  const source = await readFile(new URL('../modules/loer-hofjuwelier/aurdden-data.js', import.meta.url), 'utf8');
  const neighbor = { id: 'neighbor', title: 'Bestehendes Geschäft', pages: [{ description: 'Unverändert' }] };
  const sections = [{ tab: AURDDEN_SECTION.tab, path: [...AURDDEN_SECTION.path], entries: [neighbor] },
    { tab: 'Andere', path: ['Andere'], entries: [{ id: entry.id, title: 'Alte Platzierung' }] }];
  const context = { SECTIONS: sections };
  vm.runInNewContext(source, context); vm.runInNewContext(source, context);
  assert.equal(sections.flatMap(section => section.entries).filter(item => item.id === entry.id).length, 1);
  assert.equal(sections[0].entries[0], neighbor);
  assert.equal(sections[0].entries.length, 2);
  assert(!source.includes('onclick='));
});

test('all scenes, portraits, services and goods resolve to actual local assets', async () => {
  const references = new Set([entry.symbol, ...entry.pages.map(page => page.image).filter(Boolean), ...AURDDEN_PEOPLE.filter(person => person.portrait).map(person => person.portrait), ...AURDDEN_STAFF.map(person => person.portrait),
    ...entry.pages.flatMap(page => (page.tradeCatalog?.items || []).map(item => item.image)), ...entry.pages[8].guildServices.services.map(service => service.icon)]);
  for (const path of references) {
    assert(!/^https?:/.test(path), path);
    const base = new URL(path.startsWith('/') ? '../../' : '../', import.meta.url);
    await access(new URL(path.startsWith('/') ? path.slice(1) : path, base));
  }
});
