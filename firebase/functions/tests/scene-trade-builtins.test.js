import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { readTradeMerchant, readTradeScene } from '../src/scene-trade/scene-trade-context.js';
import { readMerchantAvailabilityOperation } from '../src/scene-trade/scene-trade-availability.js';
import { commitSceneTradeOperation } from '../src/scene-trade/commit-scene-trade.js';
import { findBuiltinTradeModule } from '../src/generated/scene-trade/scene-trade-builtins.js';
import { sceneTradeLinePrice } from '../src/generated/scene-trade/scene-trade-model.js';
import { buildSceneTradeBuiltins } from '../../../AleriaAlmanach/scripts/build-scene-trade-builtins.mjs';

const moduleId = 'lothaires-arkaneum';
const merchantId = `module:${moduleId}`;
const owner = { uid: 'owner', token: {} };
const manifest = () => ({ entryOverrideIds: [], customSections: [], hiddenModuleIds: {} });
const seed = value => database({ 'char_tabs/config': { moduleStoreManifest: value || manifest() } });
const currentManifest = db => db.data.get('char_tabs/config').moduleStoreManifest;
const merchant = db => db.runTransaction(transaction => readTradeMerchant(db, transaction, merchantId, currentManifest(db)));
const scene = (db, thread) => db.runTransaction(transaction => readTradeScene(db, transaction, thread, currentManifest(db)));
function canonicalSceneThread() {
  const entry = findBuiltinTradeModule(moduleId)?.entry;
  assert.ok(entry, 'The canonical public Arkaneum must be generated.');
  const index = entry.pages.findIndex(page => page.sessionPage && page.sessionStatus !== 'ended');
  assert.ok(index >= 0, 'The canonical Arkaneum must retain its actual open scene pages.');
  return `${moduleId}::session:${entry.pages[index].commentThreadKey || index}`;
}
function remoteEntry(extra = {}) {
  return { id: moduleId, title: 'Aktueller Serverladen', pages: [
    { sessionPage: true, commentThreadKey: 'remote-scene' },
    { tradeCatalogPage: true, tradeCatalog: { items: [{ id: 'remote-crystal', title: 'Serverkristall', priceMin: '3', priceMax: '3', currencyCode: 'KT', unit: 'Stück' }] } },
  ], ...extra };
}
function saveOverride(db, entry) {
  currentManifest(db).entryOverrideIds = [moduleId];
  db.data.set(`module_store_entries/${moduleId}`, { entryJson: JSON.stringify(entry) });
}

test('the generated builtin trade snapshot matches its canonical public module sources', async () => {
  await buildSceneTradeBuiltins({ check: true });
});

test('canonical Arkaneum resolves products and its real scene without a Firestore override or any writes', async () => {
  const db = seed(), before = structuredClone([...db.data]);
  const result = await merchant(db);
  assert.equal(result.id, merchantId);
  assert.ok(result.products.length > 0);
  assert.ok(result.products.every(product => product.moduleId === moduleId));
  const resolved = await scene(db, canonicalSceneThread());
  assert.equal(resolved.entry.id, moduleId);
  assert.equal(resolved.page.sessionPage, true);
  const availability = await readMerchantAvailabilityOperation(db, owner, { merchantId });
  assert.equal(availability.products.length, result.products.length);
  assert.deepEqual([...db.data], before);
});

test('an actual canonical Arkaneum checkout uses the authoritative catalog and preserves unrelated possessions', async () => {
  const db = seed(), keepsake = { id: 'keepsake', name: 'Persönliche Notiz', quantity: '1', custom: 'keep' };
  db.data.set('characters/buyer', { id: 'buyer', name: 'Käufer', ownerUid: 'owner',
    inventory: { revision: 1, items: [keepsake], moneyState: { totalCopper: 1000000 } },
    combatProfile: { revision: 1, hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 2, maximum: 10 }] } });
  const products = (await merchant(db)).products;
  const product = products.find(value => Number.isFinite(value.priceRange?.minCopper) && value.priceRange.minCopper > 0 && value.priceRange.minCopper < 1000);
  assert.ok(product, 'The real catalog needs a purchasable standard-price offer.');
  const price = sceneTradeLinePrice({ direction: 'buy', product, quantity: 1 });
  const response = await commitSceneTradeOperation(db, owner, { action: 'checkout', operationId: 'canonical-checkout',
    entryId: canonicalSceneThread(), merchantId, actorCharacterId: 'buyer', expectedRevisions: { 'character:buyer': 1 },
    lines: [{ id: 'purchase', direction: 'buy', productId: product.id, moduleId, sourceRevision: product.sourceRevision,
      quantity: 1, payerKey: 'character:buyer', recipientKey: 'character:buyer', priceMode: 'standard', expectedTotalMinor: price.totalMinor }] });
  assert.equal(response.receipt.merchant.id, merchantId);
  assert.equal(response.receipt.lines[0].totalMinor, price.totalMinor);
  assert.deepEqual(db.data.get('characters/buyer').inventory.items.find(item => item.id === keepsake.id), keepsake);
  assert.equal(db.data.get('characters/buyer').combatProfile.hitPoints.current, 7);
  assert.equal(db.data.get('characters/buyer').combatProfile.resources[0].current, 2);
  assert.equal(db.data.has(`module_store_entries/${moduleId}`), false);
  assert.deepEqual(currentManifest(db), manifest());
});

test('the latest remote override replaces both canonical catalog and scene pages', async () => {
  const db = seed();
  // A real server document is authoritative even before a stale manifest
  // advertises its override; never use a builtin in preference to that record.
  db.data.set(`module_store_entries/${moduleId}`, { entryJson: JSON.stringify(remoteEntry()) });
  let result = await merchant(db);
  assert.equal(result.name, 'Aktueller Serverladen');
  assert.deepEqual(result.products.map(product => product.title), ['Serverkristall']);
  assert.equal((await scene(db, `${moduleId}::session:remote-scene`)).page.commentThreadKey, 'remote-scene');
  await assert.rejects(scene(db, canonicalSceneThread()), /Szene/);
  const oldRevision = result.products[0].sourceRevision;
  const changed = remoteEntry({ title: 'Noch neuere Serverrevision' });
  changed.pages[1].tradeCatalog.items[0].priceMin = '9';
  changed.pages[1].tradeCatalog.items[0].priceMax = '9';
  saveOverride(db, changed);
  result = await merchant(db);
  assert.equal(result.name, changed.title);
  assert.equal(result.products[0].priceRange.minCopper, 9);
  assert.notEqual(result.products[0].sourceRevision, oldRevision);
});

test('a missing declared override or custom module never resurrects an older canonical version', async () => {
  for (const value of [
    { ...manifest(), entryOverrideIds: [moduleId] },
    { ...manifest(), customSections: [{ key: 'Aktuell', tab: 'Völker & Kulturen', entryIds: [moduleId] }] },
  ]) {
    const db = seed(value), before = structuredClone([...db.data]);
    await assert.rejects(merchant(db), /nicht mehr verfügbar/);
    await assert.rejects(scene(db, canonicalSceneThread()), /nicht mehr verfügbar/);
    assert.deepEqual([...db.data], before);
  }
  const db = seed();
  db.data.set(`module_store_entries/${moduleId}`, { entryJson: '{' });
  await assert.rejects(merchant(db), /Modulversion/);
});

test('manifest visibility and restricted assignments protect builtin merchants and scenes', async () => {
  const cases = [
    value => { value.hiddenModuleIds[moduleId] = true; },
    value => { value.moduleSectionMoves = { [moduleId]: { tab: 'Test' } }; },
    value => { value.moduleNodeAssignments = { [moduleId]: 'private' }; value.moduleSectionNodes = [{ id: 'private', tab: 'Familien' }]; },
    value => { value.customSections = [{ key: 'Test', entryIds: [moduleId] }]; },
  ];
  for (const change of cases) {
    const db = seed(); change(currentManifest(db));
    await assert.rejects(merchant(db), /nicht mehr verfügbar/);
    await assert.rejects(scene(db, canonicalSceneThread()), /nicht mehr verfügbar/);
  }
  for (const properties of [{ hidden: true }, { archived: true }, { isTemplate: true }]) {
    const db = seed(); saveOverride(db, remoteEntry(properties));
    await assert.rejects(merchant(db), /nicht mehr verfügbar/);
    await assert.rejects(scene(db, `${moduleId}::session:remote-scene`), /nicht mehr verfügbar/);
  }
});

test('unknown builtins, ended turns, ended overrides and invented scene pages remain unavailable', async () => {
  const db = seed();
  await assert.rejects(db.runTransaction(transaction => readTradeMerchant(db, transaction, 'module:invented-builtin', currentManifest(db))), /nicht mehr verfügbar/);
  db.data.set('module_store_entries/invented-builtin', { entryJson: JSON.stringify(remoteEntry({ id: 'invented-builtin' })) });
  await assert.rejects(db.runTransaction(transaction => readTradeMerchant(db, transaction, 'module:invented-builtin', currentManifest(db))), /nicht mehr verfügbar/);
  await assert.rejects(scene(db, `${moduleId}::session:invented-page`), /Szene/);
  const thread = canonicalSceneThread();
  db.data.set(`comment_turns/${thread}`, { current: 'ended' });
  await assert.rejects(scene(db, thread), /abgeschlossen/);
  const closed = remoteEntry(); closed.pages[0].sessionStatus = 'ended';
  saveOverride(db, closed);
  await assert.rejects(scene(db, `${moduleId}::session:remote-scene`), /abgeschlossen/);
  const missingManifest = seed();
  missingManifest.data.get('char_tabs/config').moduleStoreManifest = null;
  await assert.rejects(merchant(missingManifest), /nicht mehr verfügbar/);
});
