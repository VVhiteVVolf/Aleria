import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { parseFragment } from 'parse5';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';

const plain = value => JSON.parse(JSON.stringify(value));
const html = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
async function editor() {
  const context = vm.createContext({ window: {}, document: { addEventListener() {} },
    slugify: value => String(value || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
    deepClone: structuredClone, escapeHtml: html,
    getTrimmedFormValue: (root, selector) => String(root.querySelector(selector)?.value ?? '').trim(),
    scheduleInlineModuleLivePreviewRefresh() {} });
  for (const file of ['module-editor/module-editor-data.js', 'module-editor/module-editor-trade-catalog.js', 'inline-editor/inline-editor-trade-catalog.js']) {
    vm.runInContext(await readFile(new URL(`../modules/${file}`, import.meta.url), 'utf8'), context);
  }
  return context;
}

// A small form adapter over parsed HTML exercises the actual editor markup and
// collector together, without depending on a browser or application session.
function form(markup) {
  const children = node => node.childNodes || [];
  const attribute = (node, name) => node.attrs?.find(row => row.name === name)?.value;
  const descendants = node => children(node).flatMap(child => [child, ...descendants(child)]);
  const matches = (node, selector) => attribute(node, 'class')?.split(/\s+/).includes(selector.slice(1));
  const text = node => node.nodeName === '#text' ? node.value : children(node).map(text).join('');
  const wrap = node => ({
    querySelector(selector) { const match = descendants(node).find(child => matches(child, selector)); return match ? wrap(match) : null; },
    querySelectorAll(selector) { return descendants(node).filter(child => matches(child, selector)).map(wrap); },
    get value() {
      if (Object.hasOwn(node, 'formValue')) return node.formValue;
      if (node.tagName === 'textarea') return text(node);
      if (node.tagName === 'select') {
        const options = descendants(node).filter(child => child.tagName === 'option');
        return attribute(options.find(option => attribute(option, 'selected') != null) || options[0], 'value') || '';
      }
      return attribute(node, 'value') || '';
    },
    set value(value) { node.formValue = value; }
  });
  return wrap(parseFragment(markup));
}

test('explicit Unique markers survive repeated sanitization without guessing from a name', async () => {
  const context = await editor();
  const items = plain(context.sanitizeTradeCatalogItems(context.sanitizeTradeCatalogItems([
    { id: 'named-horse', title: 'Abendstern', definitionKind: 'unique' },
    { id: 'old-marker', title: 'Andenken', kind: 'unique' },
    { id: 'ordinary', title: 'Benanntes Schwert' }
  ])));
  assert.equal(items[0].definitionKind, 'unique');
  assert.equal(items[1].definitionKind, 'unique');
  assert.equal(Object.hasOwn(items[2], 'definitionKind'), false);
});

test('editing title and category preserves unlinked Unique identity through markup and form collection', async () => {
  const context = await editor();
  const item = context.sanitizeTradeCatalogItems([{ id: 'one-horse', title: 'Abendstern', definitionKind: 'unique',
    category: 'pferde', priceMin: '40', priceMax: '50', currencyCode: 'KT' }])[0];
  const original = buildModuleOffers([{ id: 'stable', title: 'Händler', pages: [{ tradeCatalogPage: true, tradeCatalog: { items: [plain(item)] } }] }])[0];
  const host = form(context.buildTradeCatalogItemRows([item]));
  host.querySelector('.me-trade-item-title').value = 'Abendstern der Graue';
  host.querySelector('.me-trade-item-category').value = 'reittiere';
  const collected = context.sanitizeTradeCatalogItems(context.collectTradeCatalogItems(host))[0];
  assert.equal(collected.id, item.id);
  assert.equal(collected.definitionKind, 'unique');
  const projected = buildModuleOffers([{ id: 'stable', title: 'Händler', pages: [{ tradeCatalogPage: true, tradeCatalog: { items: [plain(collected)] } }] }])[0];
  assert.equal(projected.definitionKind, 'unique');
  assert.equal(projected.definitionRef.id, original.definitionRef.id);
});

test('the catalog selector explicitly switches an unlinked row between repeatable goods and Unique', async () => {
  const context = await editor();
  const item = context.sanitizeTradeCatalogItems([{ id: 'normal', title: 'Fokus' }])[0];
  const host = form(context.buildTradeCatalogItemRows([item]));
  const select = host.querySelector('.me-trade-item-definitionKind');
  assert.equal(select.value, 'shared');
  select.value = 'unique';
  assert.equal(context.sanitizeTradeCatalogItems(context.collectTradeCatalogItems(host))[0].definitionKind, 'unique');
  select.value = 'shared';
  assert.equal(Object.hasOwn(context.sanitizeTradeCatalogItems(context.collectTradeCatalogItems(host))[0], 'definitionKind'), false);
});

test('linked Builder definitions preserve their immutable reference and kind without offering a conflicting toggle', async () => {
  const context = await editor();
  const reference = { id: 'unique:abendstern', revision: 'v1' };
  const item = context.sanitizeTradeCatalogItems([{ id: 'linked', title: 'Abendstern', definitionKind: 'unique',
    definitionRef: reference, definitionCategory: 'pferde', canonicalKey: 'catalog:horse' }])[0];
  const markup = context.buildTradeCatalogItemRows([item]);
  const host = form(markup), collected = plain(context.sanitizeTradeCatalogItems(context.collectTradeCatalogItems(host))[0]);
  assert.equal(host.querySelector('.me-trade-item-definitionKind'), null);
  assert.match(markup, /Unikat aus dem Item-Builder/);
  assert.deepEqual(collected.definitionRef, reference);
  assert.equal(collected.definitionCategory, 'pferde');
  assert.equal(collected.definitionKind, 'unique');
  assert.equal(collected.canonicalKey, 'catalog:horse');
  const unknown = { ...plain(item) }; delete unknown.definitionKind;
  const unknownHost = form(context.buildTradeCatalogItemRows([unknown]));
  const unknownCollected = plain(context.sanitizeTradeCatalogItems(context.collectTradeCatalogItems(unknownHost))[0]);
  assert.deepEqual(unknownCollected.definitionRef, reference);
  assert.equal(Object.hasOwn(unknownCollected, 'definitionKind'), false, 'an old unmarked definition is not guessed to be shared or unique');
});

test('importing a Builder Unique retains its explicit kind and definition reference through both editor modes', async () => {
  const context = await editor();
  const item = context.createTradeCatalogItemFromItemDbItem({ id: 'unique:focus', title: 'Einziger Fokus', category: 'arkanes',
    kind: 'unique', definitionRef: { id: 'unique:focus', revision: 'v2' } });
  assert.equal(item.definitionKind, 'unique');
  const host = form(context.buildTradeCatalogItemRows([item]));
  const collected = plain(context.sanitizeTradeCatalogItems(context.collectTradeCatalogItems(host))[0]);
  assert.deepEqual(collected.definitionRef, { id: 'unique:focus', revision: 'v2' });
  assert.equal(collected.definitionKind, 'unique');
  context.draft = { tradeCatalog: { items: [item] } };
  vm.runInContext('function getInlineDraftPage() { return draft; }', context);
  context.updateInlineTradeCatalogListField({ dataset: { tradeList: 'items', tradeIndex: '0', tradeField: 'title' }, value: 'Neuer Anzeigename' });
  assert.equal(context.draft.tradeCatalog.items[0].definitionKind, 'unique');
  assert.deepEqual(plain(context.draft.tradeCatalog.items[0].definitionRef), { id: 'unique:focus', revision: 'v2' });
});

test('the inline Unique selector uses the existing delegated field path and persists both directions', async () => {
  const context = await editor();
  context.draft = { tradeCatalog: { items: [{ id: 'focus', title: 'Fokus' }] } };
  vm.runInContext('function getInlineDraftPage() { return draft; }', context);
  const markup = context.buildTradeCatalogItemRows(context.sanitizeTradeCatalogItems(context.draft.tradeCatalog.items), 'inline');
  assert.match(markup, /data-inline-action="update-trade-list-field"[^>]*data-trade-field="definitionKind"/);
  for (const value of ['unique', 'shared']) {
    context.updateInlineTradeCatalogListField({ dataset: { tradeList: 'items', tradeIndex: '0', tradeField: 'definitionKind' }, value });
    assert.equal(context.draft.tradeCatalog.items[0].definitionKind, value === 'unique' ? 'unique' : undefined);
  }
});
