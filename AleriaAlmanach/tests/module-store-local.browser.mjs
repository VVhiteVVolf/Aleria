import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === '/storage-test') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<!doctype html><title>Module storage regression</title>');
    return;
  }
  const filename = path.resolve(root, `.${pathname}`);
  const relative = path.relative(root, filename);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative.startsWith('.git')) {
    response.writeHead(403); response.end(); return;
  }
  try {
    const body = await readFile(filename);
    response.writeHead(200, { 'Content-Type': `${types[path.extname(filename)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
    response.end(body);
  } catch { response.writeHead(404); response.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
try {
  const context = await browser.newContext();
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  await page.goto(`${origin}/storage-test`);
  await page.addScriptTag({ content: "const MODULE_STORE_KEY = 'aleria-module-store-v1'; const MODULE_STORE_SYNC_META_KEY = 'aleria-module-store-sync-v1';" });
  await page.addScriptTag({ path: fileURLToPath(new URL('../modules/module-store/module-store-local.js', import.meta.url)) });
  const storageChecks = await page.evaluate(async () => {
    const keys = [MODULE_STORE_KEY, MODULE_STORE_SYNC_META_KEY];
    const make = databaseName => createModuleStoreLocalPersistence({ indexedDB, storage: localStorage, keys, databaseName });
    const oldPayload = JSON.stringify({ updatedAtClient: 12, description: 'a'.repeat(1500000) });
    const oldMeta = JSON.stringify({ signature: oldPayload, syncedAt: 11 });
    localStorage.setItem(keys[0], oldPayload);
    localStorage.setItem(keys[1], oldMeta);
    for (let index = 0; ; index++) {
      try { localStorage.setItem(`unrelated:${index}`, 'f'.repeat(64000)); }
      catch (error) { if (error.name !== 'QuotaExceededError') throw error; break; }
    }
    let reproduced = false;
    try { localStorage.setItem(keys[0], `${oldPayload}${'x'.repeat(64000)}`); }
    catch (error) { reproduced = error.name === 'QuotaExceededError'; }
    if (!reproduced) throw new Error('Could not reproduce the old quota failure');
    const migrated = make('quota-migration');
    await migrated.ready();
    if (migrated.read(keys[0]) !== oldPayload || migrated.read(keys[1]) !== oldMeta) throw new Error('Migration changed records');
    if (keys.some(key => localStorage.getItem(key) !== null) || !localStorage.getItem('unrelated:0')) throw new Error('Migration removed unrelated data');
    const large = JSON.stringify({ updatedAtClient: 13, description: 'b'.repeat(6500000) });
    await migrated.write(keys[0], large);
    await migrated.flush();
    const reloaded = make('quota-migration');
    await reloaded.ready();
    if (reloaded.read(keys[0]) !== large) throw new Error('Large record did not survive reload');

    const originalPut = IDBObjectStore.prototype.put;
    const abortNextWrite = () => {
      let aborted = false;
      IDBObjectStore.prototype.put = function (...args) {
        const request = originalPut.apply(this, args);
        if (!aborted) { aborted = true; this.transaction.abort(); }
        return request;
      };
    };
    localStorage.setItem(keys[0], oldPayload);
    abortNextWrite();
    let migrationRejected = false;
    try { await make('failed-migration').ready(); } catch { migrationRejected = true; }
    finally { IDBObjectStore.prototype.put = originalPut; }
    if (!migrationRejected || localStorage.getItem(keys[0]) !== oldPayload) throw new Error('Failed migration deleted legacy edits');
    const recover = make('failed-migration');
    await recover.ready();
    abortNextWrite();
    let writeRejected = false;
    try { await recover.write(keys[0], 'unsaved draft'); } catch { writeRejected = true; }
    finally { IDBObjectStore.prototype.put = originalPut; }
    if (!writeRejected || recover.read(keys[0]) !== 'unsaved draft' || !recover.hasPendingWrites()) throw new Error('Failed draft lost recovery protection');
    let flushRejected = false;
    try { await recover.flush(); } catch { flushRejected = true; }
    const unchanged = make('failed-migration'); await unchanged.ready();
    if (!flushRejected || unchanged.read(keys[0]) !== oldPayload) throw new Error('Abort was reported as a commit');
    await recover.write(keys[0], 'retried draft');
    await recover.flush();
    if (recover.hasPendingWrites()) throw new Error('Successful retry left a dirty cache');

    const writes = Array.from({ length: 20 }, (_, index) => recover.write(keys[0], `edit-${index}`));
    await Promise.all(writes); await recover.flush();
    const final = make('failed-migration'); await final.ready();
    if (final.read(keys[0]) !== 'edit-19') throw new Error('Write queue reordered drafts');
    const otherTab = make('failed-migration'); await otherTab.ready();
    await final.write(keys[0], 'first tab');
    let concurrentRejected = false;
    try { await otherTab.write(keys[0], 'second tab draft'); }
    catch (error) { concurrentRejected = error.code === 'module-store-concurrent-write'; }
    const durable = make('failed-migration'); await durable.ready();
    if (!concurrentRejected || durable.read(keys[0]) !== 'first tab' || otherTab.read(keys[0]) !== 'second tab draft') throw new Error('Another tab silently overwrote a draft');

    localStorage.setItem(keys[0], 'old tab recovery');
    const legacyTab = make('failed-migration'); await legacyTab.ready();
    const recovery = await legacyTab.readLegacyRecovery();
    if (recovery[keys[0]] !== 'old tab recovery' || legacyTab.read(keys[0]) !== 'first tab') throw new Error('Divergent old tab cache was lost');
    return { quotaReproduced: true, migratedRecords: 2, persistedCharacters: large.length,
      abortsPreserveDrafts: true, orderedWrites: 20, concurrentTabsProtected: true, oldTabRecovery: true };
  });
  assert.equal(storageChecks.quotaReproduced, true);
  console.log(JSON.stringify(storageChecks));
  await context.close();

  // Exercise the actual startup, normalization, editor save and remote receipt.
  const appContext = await browser.newContext();
  await appContext.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  await appContext.addInitScript(() => {
    if (localStorage.getItem('quota-test-seeded')) return;
    localStorage.setItem('aleria-module-store-v1', JSON.stringify({ updatedAtClient: Date.now(),
      entryOverrides: { 'quota-offline-draft': { id: 'quota-offline-draft', title: 'Offline draft', description: 'Preserved' } } }));
    localStorage.setItem('quota-test-seeded', '1');
  });
  const app = await appContext.newPage();
  const errors = [];
  app.on('pageerror', error => errors.push(error.message));
  await app.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`, { waitUntil: 'domcontentloaded' });
  await app.waitForFunction(() => typeof _appInitialized !== 'undefined' && _appInitialized);
  const saved = await app.evaluate(async () => {
    if (_entryOverrides['quota-offline-draft']?.pages?.[0]?.description !== 'Preserved') throw new Error('Startup lost legacy offline edit');
    for (let index = 0; index < 260; index++) {
      const id = `quota-module-${index}`;
      _entryOverrides[id] = { id, title: id, description: 'abcdefghij'.repeat(2400) };
    }
    if (!saveModuleStore({ remote: false })) throw new Error('Large local save rejected');
    await moduleStoreLocalPersistence.flush();
    const payload = readLocalModuleStorePayload();
    const sizes = getModuleStoreStorageSizes(payload);
    if (sizes.bytes < 6000000 || getModuleStoreSizeState(sizes.largestDocumentBytes) !== 'ok') throw new Error('Total size was mistaken for a document limit');
    const uploaded = [];
    window._fb = { saveModuleStore: async value => uploaded.push(value) };
    _fbReady = true;
    if (!saveModuleStore()) throw new Error('Remote save rejected');
    await new Promise(resolve => setTimeout(resolve, MODULE_STORE_REMOTE_SAVE_DELAY + 500));
    await moduleStoreLocalPersistence.flush();
    if (uploaded.length !== 1 || !await isLocalModuleStoreSynced(readLocalModuleStorePayload())) throw new Error('Remote synchronization failed');
    const receipt = moduleStoreLocalPersistence.read(MODULE_STORE_SYNC_META_KEY);
    if (receipt.length > 250 || localStorage.getItem(MODULE_STORE_KEY) != null || localStorage.getItem(MODULE_STORE_SYNC_META_KEY) != null) throw new Error('Oversized localStorage records remain');
    return { modules: Object.keys(payload.entryOverrides).length, bytes: sizes.bytes, receiptBytes: receipt.length, remoteWrites: uploaded.length };
  });
  await app.reload({ waitUntil: 'domcontentloaded' });
  await app.waitForFunction(() => typeof _appInitialized !== 'undefined' && _appInitialized);
  const restored = await app.evaluate(() => Object.keys(readLocalModuleStorePayload().entryOverrides).length);
  assert.equal(restored, saved.modules);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ ...saved, survivedReload: true, pageErrors: errors.length }));
  await appContext.close();
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
