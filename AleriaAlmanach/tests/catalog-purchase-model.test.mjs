import test from 'node:test';
import assert from 'node:assert/strict';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { catalogPurchaseOffers, matchCatalogPurchaseOffers, catalogPurchaseGroupMembers,
  catalogPurchasePayerOptions, catalogPurchaseAccounts, resolveCatalogPurchaseSelection,
  catalogPurchasePreview, buildCatalogPurchaseCheckout } from '../modules/catalog-purchase/catalog-purchase-model.js';

const item = (id, price = '10') => ({ id, title: id, priceMin: price, currencyCode: 'KT' });
const module = { id: 'eleganz', title: 'Göttliche Eleganz', pages: [
  { tradeCatalogPage: true, tradeCatalog: { items: [item('mantel'), { ...item('wein'), priceOptions: [
    { label: 'Glas', unit: '0,2 l', price: '2' }, { label: 'Flasche', unit: '0,75 l', price: '7' }] }] } },
  { tradeCatalogPage: true, tradeCatalog: { items: [item('mantel'), item('other-page')] } },
  { goodsTablePage: true, goodsTable: { tables: [{ id: 'menu', rows: [
    { id: 'unique-row', definitionKind: 'unique', values: { name: 'Namensring', price: '100 KT' } },
    { values: { name: 'Suppe', price: '1 KT' } }] }] } }
] };
const offers = buildModuleOffers([module], []);

function fixture() {
  const character = (id, revision, amount) => ({ id, name: id, inventory: { revision, moneyState: { totalCopper: amount },
    get items() { throw Error('Direct catalog controls must never enumerate owned inventory.'); } } });
  return { moduleId: 'eleganz', pageIndex: 0, merchantId: 'module:eleganz', access: { uid: 'user' },
    offers: catalogPurchaseOffers(offers, { moduleId: 'eleganz', pageIndex: 0 }).map(offer => ({ ...offer })),
    characters: [character('gawain', 2, 100), character('ylva', 5, 30)],
    groups: [{ id: 'companions', title: 'Gefährten', revision: 7, inventory: { moneyState: { totalCopper: 500 } },
      tradeContext: { memberCharacterIds: ['missing', 'gawain'] } },
    { id: 'unconfirmed', inventory: { moneyState: { totalCopper: 900 } } },
    { id: 'ghost-roster', tradeContext: { memberCharacterIds: ['missing'] }, inventory: { moneyState: { totalCopper: 900 } } }] };
}
const selection = data => ({ productId: data.offers.find(offer => offer.title === 'mantel').id, quantity: 2,
  actorCharacterId: 'gawain', payerKey: 'character:gawain', recipientKey: 'character:ylva' });

test('source identities select exact page rows, keep all price options, and preserve deduplicated references', () => {
  const page = catalogPurchaseOffers(offers, { moduleId: 'eleganz', pageIndex: 0 });
  assert.equal(page.length, 3);
  assert.equal(page.find(offer => offer.title === 'mantel').sourceRefs.length, 2);
  assert.deepEqual(matchCatalogPurchaseOffers(page, { kind: 'trade-catalog', pageIndex: 0, itemId: 'wein' }).map(offer => offer.price), ['2', '7']);
  assert.equal(matchCatalogPurchaseOffers(page, { kind: 'trade-catalog', pageIndex: 0, itemIndex: 0 })[0].title, 'mantel');
  assert.equal(matchCatalogPurchaseOffers(page, { kind: 'trade-catalog', pageIndex: 0, itemId: 'wein', priceOption: 'Flasche', unit: '0,75 l' })[0].price, '7');
  assert.deepEqual(matchCatalogPurchaseOffers(page, { kind: 'trade-catalog', pageIndex: 0, itemId: 'removed', itemIndex: 0 }), [], 'An old source ID must not fall through to the new row at its index.');
  assert.deepEqual(catalogPurchaseOffers([...offers, { ...page[0], id: 'regional', listId: 'regional' }], { moduleId: 'eleganz', pageIndex: 9 }), []);
});

test('goods-register/table aliases match stable table/row identities and bounded availability rows', () => {
  const page = catalogPurchaseOffers(offers, { moduleId: 'eleganz', pageIndex: 2 });
  assert.equal(matchCatalogPurchaseOffers(page, { kind: 'goods-table', pageIndex: 2, tableId: 'menu', rowIndex: 1 })[0].title, 'Suppe');
  const unique = matchCatalogPurchaseOffers(page, { kind: 'goods-register', pageIndex: 2, tableId: 'menu', rowId: 'unique-row' });
  assert.equal(unique.length, 1);
  const availability = [{ productId: unique[0].id, unique: true, available: false, status: 'owned', sourceRefs: unique[0].sourceRefs }];
  assert.equal(matchCatalogPurchaseOffers(availability, { kind: 'goods-register', pageIndex: 2, tableId: 'menu', rowId: 'unique-row' })[0], availability[0]);
  for (const ref of [{ kind: 'goods-register', pageIndex: 2, rowIndex: 1 }, { kind: 'trade-catalog', pageIndex: 0 },
    { kind: 'trade-catalog', pageIndex: '', itemIndex: 0 }, { kind: 'elsewhere', pageIndex: 0, itemIndex: 0 }]) assert.deepEqual(matchCatalogPurchaseOffers(offers, ref), []);
  for (const ref of [{ kind: 'trade-catalog', itemIndex: 0 }, { kind: 'trade-catalog', pageIndex: 0 },
    { kind: 'trade-catalog', pageIndex: null, itemIndex: 0 }, { kind: 'trade-catalog', pageIndex: 0, itemIndex: false }]) {
    assert.deepEqual(matchCatalogPurchaseOffers([{ sourceRefs: [ref] }], { kind: 'trade-catalog', pageIndex: 0, itemIndex: 0 }), []);
  }
});

test('wallet options read money only and require an existing confirmed group member', () => {
  const data = fixture(), options = catalogPurchasePayerOptions(data);
  assert.deepEqual(options.map(option => option.key), ['character:gawain', 'character:ylva', 'group:companions']);
  assert.deepEqual(catalogPurchaseGroupMembers(data, data.groups[0]).map(record => record.id), ['gawain']);
  assert.equal(options[2].minor, 50000);
  assert.deepEqual(catalogPurchaseAccounts(data, 'ylva').map(option => option.key), ['character:gawain', 'character:ylva']);
  assert.equal(catalogPurchaseAccounts(data, 'gawain').at(-1).key, 'group:companions');
  data.access = {};
  assert.ok(catalogPurchasePayerOptions(data).every(option => !option.canDebit));
});

test('empty selection stays blank; valid personal gifts and group operator are restored deterministically', () => {
  const data = fixture(), empty = { payerKey: '', recipientKey: '', actorCharacterId: '' };
  assert.deepEqual(resolveCatalogPurchaseSelection(data), empty);
  assert.deepEqual(resolveCatalogPurchaseSelection(data, { payerKey: 'character:gone' }), empty);
  assert.deepEqual(resolveCatalogPurchaseSelection(data, { payerKey: 'character:gawain' }),
    { payerKey: 'character:gawain', recipientKey: 'character:gawain', actorCharacterId: 'gawain' });
  assert.equal(resolveCatalogPurchaseSelection(data, { payerKey: 'character:gawain', actorCharacterId: 'ylva' }).actorCharacterId, 'gawain');
  const gift = { payerKey: 'character:gawain', recipientKey: 'character:ylva', actorCharacterId: 'gawain' };
  assert.deepEqual(resolveCatalogPurchaseSelection(data, gift), gift);
  assert.deepEqual(resolveCatalogPurchaseSelection(data, { ...gift, payerKey: 'group:companions', actorCharacterId: 'ylva' }),
    { ...gift, payerKey: 'group:companions' });
});

test('one direct purchase captures gift wallets, minor total and source/revision guards without a scene', () => {
  const data = fixture(), input = { ...selection(data), operationId: 'op-1' }, preview = catalogPurchasePreview(input, data);
  assert.deepEqual(preview.errors, []); assert.equal(preview.unitMinor, 1000); assert.equal(preview.totalMinor, 2000);
  const request = buildCatalogPurchaseCheckout(input, data);
  assert.equal(request.action, 'catalog-checkout'); assert.equal(request.entryId, 'eleganz'); assert.equal(request.merchantId, 'module:eleganz');
  assert.equal(request.operationId, 'op-1'); assert.deepEqual(request.expectedRevisions, { 'character:gawain': 2, 'character:ylva': 5 });
  assert.equal(request.lines.length, 1); assert.equal(request.lines[0].sourceRevision, preview.product.sourceRevision);
  assert.equal(request.lines[0].offerRevision, 0); assert.equal(request.lines[0].expectedTotalMinor, 2000);
  assert.equal(request.lines[0].priceMode, 'standard'); assert.equal('agreedTotalMinor' in request.lines[0], false);
  assert.equal('productRevision' in request.lines[0], false); assert.equal('title' in request.lines[0], false);
  input.payerKey = 'group:companions';
  assert.deepEqual(buildCatalogPurchaseCheckout(input, data).expectedRevisions, { 'group:companions': 7, 'character:ylva': 5 });
});

test('repeatable goods ignore finite legacy stock, unique goods require fresh availability and quantity one', () => {
  const data = fixture(), input = selection(data), product = data.offers.find(offer => offer.id === input.productId);
  product.stock = 0;
  assert.deepEqual(catalogPurchasePreview(input, data).errors, []);
  data.offers = data.offers.map(offer => offer.id === product.id ? { ...offer, definitionKind: 'unique' } : offer);
  assert.ok(catalogPurchasePreview({ ...input, quantity: 1 }, data).errors.some(error => /noch nicht bestätigt/.test(error)));
  data.offers[0].availabilityStatus = 'available';
  assert.deepEqual(catalogPurchasePreview({ ...input, quantity: 1 }, data).errors, []);
  assert.ok(catalogPurchasePreview(input, data).errors.some(error => /Einzelstück/.test(error)));
  for (const status of ['owned', 'sold', 'unknown', 'checking', 'unavailable']) {
    data.offers[0].availabilityStatus = status;
    assert.throws(() => buildCatalogPurchaseCheckout({ ...input, quantity: 1 }, data), /nicht zum Direktkauf/);
  }
});

test('invalid quantities, unavailable groups, insufficient money, unknown prices and overflow never build a request', () => {
  const data = fixture(), input = selection(data);
  for (const quantity of [0, -1, 0.5, 10000, Infinity]) assert.ok(catalogPurchasePreview({ ...input, quantity }, data).errors.length);
  for (const patch of [{ payerKey: '' }, { recipientKey: 'group:companions' }, { actorCharacterId: '' },
    { actorCharacterId: 'ylva', payerKey: 'group:companions' }, { payerKey: 'character:ylva', quantity: 9 }]) {
    assert.throws(() => buildCatalogPurchaseCheckout({ ...input, ...patch }, data));
  }
  data.offers = data.offers.map(offer => ({ ...offer, priceRange: null }));
  assert.throws(() => buildCatalogPurchaseCheckout(input, data), /Standardpreis/);
  data.offers = data.offers.map(offer => ({ ...offer, priceRange: { minCopper: 60000000000000 } }));
  assert.ok(catalogPurchasePreview(input, data).errors.some(error => /Gesamtbetrag/.test(error)));
});
