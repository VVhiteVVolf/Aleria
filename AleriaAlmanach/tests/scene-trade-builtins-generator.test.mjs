import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { builtinTradeSource, projectBuiltinTradeModules } from '../scripts/scene-trade/scene-trade-builtin-projection.mjs';
import { classicSourceScripts, readCommittedTradeSections } from '../scripts/scene-trade/scene-trade-builtin-source.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';

const policy = section => !['Test', 'Familien'].includes(section.tab || section.key);
const session = { sessionPage: true, commentThreadKey: 'shop-room', sessionStatus: 'active', pageTitle: 'Verkaufsraum',
  sessionDateAleria: { year: 1737, month: 4, day: 2 }, sessionIntro: 'Unneeded scene prose' };
const goods = { goodsTablePage: true, pageTitle: 'Waren', goodsTable: { noteTitle: 'Hinweis', noteText: 'Nachfüllbare Ware',
  tables: [{ id: 'wares', title: 'Werkzeuge', categories: [{ id: 'tools', label: 'Werkzeuge' }],
    columns: [{ id: 'name', label: 'Name' }, { id: 'material', label: 'Material' }],
    rows: [{ id: 'glass', category: 'tools', values: { name: 'Glasflasche', kind: 'Gefäß', description: 'Kleine Flasche',
      price: '2 Kupfertaler', portion: 'Stück', material: 'Glas' } }] }],
  offers: [{ name: 'Sonderangebot', description: 'Ein Korb', price: '3 Kupfertaler', image: './basket.png' }] } };
const trade = { tradeCatalogPage: true, pageTitle: 'Unikate', tradeCatalog: { categories: [{ id: 'swords', label: 'Waffen' }],
  items: [{ id: 'named-blade', title: 'Abendlicht', subtitle: 'Schwert', category: 'swords', definitionKind: 'unique',
    priceMin: '300', currencyCode: 'KT', description: 'Benannte Waffe', features: [{ text: 'Graviertes Heft' }],
    attributes: [{ label: 'Länge', value: 'Lang' }], usageTags: ['Führen'], conditions: 'Nach Absprache' }] } };
const entry = () => ({ id: 'public-shop', title: 'Öffentlicher Laden', type: 'Händler', category: 'Gwynthor', image: './shop.png',
  biography: 'Must never be projected', pages: [{ biographyPage: true, biography: { history: 'Must never be projected' } }, goods, {}, trade, session] });
const section = entries => ({ key: 'Gwynthor', tab: 'Völker & Kulturen', path: ['Cenyr', 'Gwynthor'], desc: 'No server story', entries });
const project = sections => projectBuiltinTradeModules(sections, { isPublicSection: policy, standards: [] });

test('builtin projection preserves all offer data, prices, facts, definitions and original source indexes', () => {
  const original = entry(), [result] = project([section([original])]);
  assert.deepEqual(buildModuleOffers([result.entry], []), buildModuleOffers([original], []));
  assert.equal(result.entry.pages.length, original.pages.length);
  assert.deepEqual(result.entry.pages[0], {});
  assert.deepEqual(result.entry.pages[2], {});
  assert.deepEqual(result.entry.pages[1].goodsTable, original.pages[1].goodsTable);
  assert.deepEqual(result.entry.pages[3].tradeCatalog, original.pages[3].tradeCatalog);
  assert.deepEqual(result.entry.pages[4].sessionDateAleria, session.sessionDateAleria);
  assert(!JSON.stringify(result).includes('Must never be projected'));
  assert(!JSON.stringify(result).includes('Unneeded scene prose'));
  assert(!('desc' in result.section));
});

test('non-shop public session modules remain addressable without inventing merchant offers', () => {
  const [result] = project([section([{ id: 'camp', title: 'Lager', pages: [{ description: 'Story' }, { sessionPage: true }] }])]);
  assert.equal(result.entry.id, 'camp');
  assert.deepEqual(result.entry.pages, [{}, { sessionPage: true }]);
  assert.deepEqual(buildModuleOffers([result.entry], []), []);
});

test('restricted sections, hidden/archive/template entries and unrelated articles never enter the server catalogue', () => {
  const template = entry(); template.id = 'vorlage-haendler';
  const modules = project([section([{ ...entry(), hidden: true }, { ...entry(), id: 'archived', archived: true },
    { ...entry(), id: 'template', isTemplate: true }, template, { id: 'article', pages: [{ description: 'Story only' }] }]),
  { key: 'Public looking', tab: 'Test', entries: [{ ...entry(), id: 'test-shop' }] },
  { key: 'Familien', entries: [{ ...entry(), id: 'family-shop' }] }]);
  assert.deepEqual(modules, []);
});

test('the first builtin ID retains browser precedence even when it lives in a restricted section', () => {
  assert.deepEqual(project([{ key: 'Test', entries: [entry()] }, section([entry()])]), []);
});

test('Map lookup rejects prototype names and callers cannot mutate another request snapshot', async () => {
  const modules = project([section([entry(), { id: '__proto__', title: 'Allowed literal ID', pages: [{ sessionPage: true }] }])]);
  const code = builtinTradeSource(modules, { inputDigest: 'a'.repeat(64), sourceFiles: ['public-source.js'] });
  const generated = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  assert.equal(generated.findBuiltinTradeModule('constructor'), null);
  assert.equal(generated.findBuiltinTradeModule('__proto__').entry.title, 'Allowed literal ID');
  generated.findBuiltinTradeModule('public-shop').entry.pages[1].goodsTable.noteText = 'Changed by caller';
  assert.equal(generated.findBuiltinTradeModule('public-shop').entry.pages[1].goodsTable.noteText, 'Nachfüllbare Ware');
  assert.equal(code, builtinTradeSource(modules, { inputDigest: 'a'.repeat(64), sourceFiles: ['public-source.js'] }));
  assert(!code.includes('sourceCommit'));
});

test('browser script discovery supports attribute order, drops ESM and rejects non-public source paths', () => {
  assert.deepEqual(classicSourceScripts('<script defer src="./data/sections.js?v=1"></script><script type="module" src="./private.js"></script>'), ['AleriaAlmanach/data/sections.js']);
  assert.throws(() => classicSourceScripts('<script src="../firebase/private.js"></script>'), /public publication policy/);
});

test('canonical reader ignores changed working sources and unlinked private Git sources', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'aleria-builtin-trade-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  const put = async (file, value) => { await mkdir(path.dirname(path.join(root, file)), { recursive: true }); await writeFile(path.join(root, file), value); };
  git(['init', '-q']); git(['config', 'user.name', 'Trade source fixture']); git(['config', 'user.email', 'test@example.invalid']);
  git(['config', 'core.autocrlf', 'false']);
  const html = '<script src="./data/sections.js"></script><script src="./modules/shop/shop-data.js"></script>'
    + '<script src="./modules/core/content-safety.js"></script><script src="./modules/module-store/module-section-policy.js"></script>';
  await put('AleriaAlmanach/AleriaAlmanach.html', html);
  await put('AleriaAlmanach/data/sections.js', 'const SECTIONS = [];');
  await put('AleriaAlmanach/modules/shop/shop-data.js', `SECTIONS.push(${JSON.stringify(section([entry()]))});`);
  await put('AleriaAlmanach/modules/private/private-data.js', 'throw Error("Unlinked restricted source must never execute");');
  await put('AleriaAlmanach/modules/module-store/module-section-policy.js', await readFile(new URL('../modules/module-store/module-section-policy.js', import.meta.url), 'utf8'));
  git(['add', '.']); git(['commit', '-qm', 'Canonical public fixture']);
  await put('AleriaAlmanach/modules/shop/shop-data.js', 'throw Error("Private uncommitted change must never execute");');
  const first = await readCommittedTradeSections(root), second = await readCommittedTradeSections(root);
  assert.equal(projectBuiltinTradeModules(first.sections, { isPublicSection: first.isPublicSection, standards: [] })[0].entry.id, 'public-shop');
  assert(!first.sourceFiles.some(file => file.includes('/private/')));
  assert.equal(first.inputDigest, second.inputDigest);
  assert.equal(first.isPublicSection({ tab: 'Test' }), false);
  assert.equal(first.isPublicSection({ key: 'Familien' }), false);
});
