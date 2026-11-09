import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { buildFfalsModule, FFALS_SECTION } from '../modules/goldene-fassung/ffals-module.mjs';
import { FFALS_PEOPLE } from '../modules/goldene-fassung/ffals-people.mjs';
import { FFALS_VACANCIES } from '../modules/goldene-fassung/ffals-hierarchy.mjs';
import { FFALS_BLACKMARKET_IDS } from '../modules/goldene-fassung/ffals-catalog.mjs';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { calculateBusiness } from '../modules/economy-calculator/economy-engine.mjs';
import { parsePrice } from '../modules/item-register/item-register-money.js';
const entry = buildFfalsModule();
const calendar = { daysPerWeek: 9, daysPerMonth: 36, daysPerYear: 468, monthsPerYear: 13 };

test('ten native pages preserve the requested order and four distinct scene threads', () => {
  assert.equal(entry.pages.length, 10);
  assert.equal(entry.pages[1].biographyPage, true);
  assert.equal(entry.pages[2].hierarchyPage, true);
  assert(entry.pages.slice(3, 5).every(page => page.tradeCatalogPage));
  assert(entry.pages.slice(5, 9).every(page => page.sessionPage));
  assert.equal(entry.pages.at(-1).economyCalculationPage, true);
  assert.equal(new Set(entry.pages.map(page => page.commentThreadKey)).size, 10);
  assert.equal(FFALS_SECTION.path.at(-1), 'Gwynthor-Stadt');
  assert.equal(entry.appendCommentsPage, false);
});

test('the four existing character IDs are used without invented genealogical identities', () => {
  assert.deepEqual(entry.sessionCast, FFALS_PEOPLE.map(person => person.characterId));
  assert.equal(new Set(entry.sessionCast).size, 4);
  assert(FFALS_PEOPLE.every(person => person.portrait.endsWith('.png')));
  const nodes = entry.pages[2].hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));
  assert.equal(nodes.filter(node => node.characterId).length, 4);
  assert.equal(nodes.filter(node => !node.portrait).length, FFALS_VACANCIES.length);
  assert.equal(FFALS_VACANCIES.length, 5);
});

test('twenty jewellery offers and ten secondhand offers are ordinary purchasable goods', () => {
  const [jewellery, other] = entry.pages.slice(3, 5).map(page => page.tradeCatalog.items);
  assert.equal(jewellery.length, 20);
  assert.equal(other.filter(item => item.category === 'wechselware').length, 10);
  assert.equal(other.length, 13);
  const offers = buildModuleOffers([entry]);
  assert.equal(offers.length, 33);
  assert.equal(new Set(offers.map(offer => offer.id)).size, 33);
  assert(offers.every(offer => offer.priceRange.minCopper > 0));
  assert.equal(Math.min(...jewellery.map(item => Number(item.priceMin))), 18);
  assert.equal(Math.max(...jewellery.map(item => Number(item.priceMin))), 280);
  assert(![...jewellery, ...other].some(item => item.definitionKind === 'unique'));
});

test('selected blackmarket goods preserve canonical price, unit, attributes and identity', () => {
  for (const id of FFALS_BLACKMARKET_IDS) {
    const source = STANDARD_ITEMS.find(item => item.id === id);
    const offer = entry.pages[4].tradeCatalog.items.find(item => item.canonicalKey === source.canonicalKey);
    assert(offer, id);
    assert.equal(Number(offer.priceMin.replace(',', '.')), source.priceRange.minCopper);
    assert.equal(offer.unit, source.hiddenMeta.unit);
    assert.deepEqual(offer.attributes, source.attributes);
  }
});

test('the economy uses real calendar factors, deduplicates workers and excludes unsupported income', () => {
  const scenario = entry.pages.at(-1).economyCalculation.scenario;
  assert.equal(scenario.channels.length, 20);
  assert.equal(scenario.workers.filter(worker => worker.kind === 'vacancy').length, 5);
  assert.equal(scenario.workers.filter(worker => worker.kind !== 'vacancy').length, 4);
  assert.equal(scenario.assetValuesKnown, false);
  const result = calculateBusiness(scenario, calendar);
  assert.equal(result.factors.weeksPerYear, 52);
  assert(result.totals.freeCash > 0);
  assert(result.workers.filter(worker => worker.kind === 'vacancy').every(worker => worker.cash === 0));
});

test('generated registration is idempotent and leaves neighboring shops intact', async () => {
  const source = await readFile(new URL('../modules/goldene-fassung/ffals-data.js', import.meta.url), 'utf8');
  const neighbor = { id: 'neighbor-shop', pages: [{ description: 'Keep this shop unchanged.' }] };
  const sections = [{ tab: FFALS_SECTION.tab, path: [...FFALS_SECTION.path], entries: [neighbor] }];
  const context = { SECTIONS: sections };
  vm.runInNewContext(source, context);
  vm.runInNewContext(source, context);
  assert.equal(sections[0].entries.length, 2);
  assert.equal(sections[0].entries[0], neighbor);
  assert.equal(sections[0].entries.filter(item => item.id === entry.id).length, 1);
  assert(!source.includes('onclick='));
});

test('all newly referenced scenes, portraits, signs and inventory images exist', async () => {
  const references = new Set([entry.symbol, ...entry.pages.map(page => page.image).filter(Boolean),
    ...FFALS_PEOPLE.map(person => person.portrait), ...entry.pages.flatMap(page => (page.tradeCatalog?.items || []).map(item => item.image))]);
  for (const image of references) {
    if (/^https?:/.test(image)) continue;
    await access(new URL(image, new URL('../', import.meta.url)));
  }
});

test('the published price review matches all thirty-three current shop offers', async () => {
  const report = JSON.parse(await readFile(new URL('../docs/economy/price-review-2026-10-19.json', import.meta.url), 'utf8'));
  const records = report.records.filter(row => row.moduleId === entry.id);
  assert.equal(records.length, 33, 'Rebuild the public price review after editing this catalogue.');
  for (const [pageIndex, page] of entry.pages.entries()) for (const item of page.tradeCatalog?.items || []) {
    const record = records.find(row => row.pageIndex === pageIndex && row.id === item.id);
    assert(record, item.id);
    const amount = item.priceMax ? `${item.priceMin} - ${item.priceMax}` : item.priceMin;
    assert.deepEqual(record.price, parsePrice(amount, item.currencyCode), item.id);
    assert.equal(record.unit, item.unit);
  }
});

test('the published economy scenario preserves the authored current shop calculation', async () => {
  const { ECONOMY_EXAMPLES } = await import('../modules/economy-calculator/economy-catalog.generated.mjs');
  const scenario = ECONOMY_EXAMPLES.find(candidate => candidate.id === entry.id);
  assert(scenario, 'Rebuild the public economy catalogue after adding this shop.');
  assert.deepEqual(scenario, entry.pages.at(-1).economyCalculation.scenario);
});
