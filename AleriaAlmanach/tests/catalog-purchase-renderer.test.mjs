import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { parseFragment } from 'parse5';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { matchCatalogPurchaseOffers } from '../modules/catalog-purchase/catalog-purchase-model.js';
import { renderCatalogPurchaseSummary } from '../modules/catalog-purchase/catalog-purchase-view.js';
import { escape } from '../modules/item-register/item-register-markup.js';

async function renderers() {
  const context = vm.createContext({ window: {}, document: { addEventListener() {} }, deepClone: structuredClone,
    slugify: value => String(value || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-'), escapeHtml: escape,
    sanitizeImageSrc: value => value, sanitizeContentHtml: value => value, getInitialChar: value => String(value)[0],
    buildNav: () => '', getInlineCommentThreadForPage: () => null, buildOrganicCommentsContinuation: () => '',
    installTradeItemCards() {}, renderTradeMoney: () => '' });
  for (const file of ['module-editor/module-editor-data.js', 'goods/goods-renderer.js', 'trade-catalog/trade-catalog-renderer.js']) {
    const source = (await readFile(new URL(`../modules/${file}`, import.meta.url), 'utf8')).replace(/^import .+;\r?\n/gm, '');
    vm.runInContext(source, context);
  }
  return context;
}
function locators(markup, pageIndex) {
  const descend = node => [node, ...(node.childNodes || []).flatMap(descend)];
  return descend(parseFragment(markup)).filter(node => node.attrs?.some(attr => attr.name === 'data-catalog-source-kind')).map(node => {
    const attrs = Object.fromEntries(node.attrs.map(attr => [attr.name, attr.value]));
    return { kind: attrs['data-catalog-source-kind'], pageIndex, itemId: attrs['data-catalog-item-id'],
      itemIndex: attrs['data-catalog-item-index'], tableId: attrs['data-catalog-table-id'],
      rowId: attrs['data-catalog-row-id'], rowIndex: attrs['data-catalog-row-index'] };
  });
}

test('Echte Güterkarten kaufen nach ursprünglicher Quellkennung, auch ohne ID oder mit anders normalisiertem Anzeigenamen', async () => {
  const entry = { id: 'shop', title: 'Laden', pages: [{ tradeCatalogPage: true, tradeCatalog: { items: [
    { title: 'Becher ohne Quell-ID', priceMin: '2', currencyLabel: 'KT' },
    { id: 'GROSSE-Karte', title: 'Anderer Anzeigename', priceMin: '3', currencyLabel: 'KT' },
    { id: 'Original-Ring', title: 'Der benannte Ring', definitionKind: 'unique', priceMin: '4', currencyLabel: 'KT' }
  ] } }] };
  const context = await renderers(), offers = buildModuleOffers([entry]);
  const rows = locators(context.buildTradeCatalogPage(entry.pages[0], entry, 0, 1), 0);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].itemId, ''); assert.equal(rows[1].itemId, 'GROSSE-Karte');
  rows.forEach((row, index) => {
    const found = matchCatalogPurchaseOffers(offers, row);
    assert.equal(found.length, 1); assert.equal(found[0].title, entry.pages[0].tradeCatalog.items[index].title);
  });
});

test('Echte Warentabellen erhalten Quellindex vor Leerzeilenbereinigung, numerische Tabellenkennung und Unique-Zeilenkennung', async () => {
  const columns = [{ id: 'name', label: 'Ware' }, { id: 'price', label: 'Preis' }];
  const entry = { id: 'shop', title: 'Laden', pages: [{ goodsTablePage: true, goodsTable: { tables: [{ title: 'Titel ohne Tabellen-ID', columns, rows: [
    {}, { values: { name: 'Tee', price: '1 KT' } },
    { id: 'Alter-Ring', definitionKind: 'unique', values: { name: 'Einzigartiger Ring', price: '2 KT' } }
  ] }] } }] };
  const context = await renderers(), offers = buildModuleOffers([entry]);
  const rows = locators(context.buildGoodsTablePage(entry.pages[0], entry, 0, 1), 0);
  assert.equal(rows.length, 2); assert.equal(rows[0].tableId, '0'); assert.equal(rows[0].rowIndex, '1');
  assert.equal(rows[1].rowId, 'Alter-Ring'); assert.equal(rows[1].rowIndex, '2');
  assert.deepEqual(rows.map(row => matchCatalogPurchaseOffers(offers, row).map(offer => offer.title)), [['Tee'], ['Einzigartiger Ring']]);
});

test('Nach bestätigtem Uniquekauf zeigt die Finanzvorschau den Istbetrag, ohne denselben Kauf ein zweites Mal abzuziehen', () => {
  const result = renderCatalogPurchaseSummary({ product: { available: false }, totalMinor: 100, payer: { minor: 9720 }, errors: ['Gekauft'] }, { ready: true });
  assert.match(result, /Geldbeutel jetzt/); assert.match(result, /97 Kupfer, 20 Eisenpfennig/);
  assert.doesNotMatch(result, /96 Kupfer/);
});
