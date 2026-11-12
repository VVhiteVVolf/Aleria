import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const output = path.resolve(process.env.ALERIA_TEST_OUTPUT_DIR
  || path.join(root, 'diagnostics/module-store-tabs-20261107', `browser-${Date.now()}`));
await mkdir(output, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
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
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
} catch (error) {
  await new Promise(resolve => server.close(resolve));
  throw error;
}

async function openTestApp(context, errors, network) {
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (new URL(response.url()).origin === origin && response.status() >= 400) {
      network.localHttpFailures.push({ url: response.url(), status: response.status() });
    }
  });
  page.on('requestfailed', request => {
    if (new URL(request.url()).origin === origin && request.failure()?.errorText !== 'net::ERR_ABORTED') {
      network.localRequestFailures.push({ url: request.url(), error: request.failure()?.errorText });
    }
  });
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const entry = { text: message.text(), url: message.location().url };
    const expectedAbort = /^Failed to load resource: net::ERR_FAILED/.test(entry.text)
      && entry.url && new URL(entry.url).origin !== origin;
    (expectedAbort ? network.expectedExternalConsoleErrors : network.unexpectedConsoleErrors).push(entry);
  });
  await page.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof _appInitialized !== 'undefined' && _appInitialized);
  await page.waitForFunction(() => !moduleStoreSyncActivity.initialReadPending);
  await dismissLoadingScreen(page);
  return page;
}

async function dismissLoadingScreen(page) {
  const loading = page.locator('[data-loading-screen]');
  if (await loading.count()) {
    await page.waitForFunction(() => ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
    const enter = page.locator('[data-loading-action="enter"]');
    await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
    await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  }
}

// The real local comment adapter is the test backend. No Firebase SDK, live
// account, character inventories or production writes participate in this run.
async function installCommentFixture(page) {
  await page.evaluate(() => {
    const local = getLocalCommentBackend();
    window.__fixtureCommentWrites = 0;
    window.__fixtureModuleWrites = 0;
    window.__fixtureNotices = [];
    window._fb = {
      ...local, _localFallback: false,
      async addComment(...args) {
        window.__fixtureCommentWrites += 1;
        return local.addComment(...args);
      },
      loadCreatures: async () => []
    };
    _fbReady = true;
    _characters = [cloneCharacterRecord({
      id: 'fixture-rianna-wyrm', name: 'Rianna Wyrm', title: 'Browserprüffigur',
      portrait: '../IconOrdner/Siluetten/Unbekannt.png'
    })];
    _charactersLoaded = true;
    _charTabsLoaded = true;
    applyWorldDateRecord({ year: 1740, month: 3, day: 9, updatedAtClient: 1 });
    const originalSave = window.saveModuleStore;
    window.saveModuleStore = (...args) => {
      window.__fixtureModuleWrites += 1;
      return originalSave(...args);
    };
    const originalStatus = window.showAppStatus;
    window.showAppStatus = (message, ...args) => {
      window.__fixtureNotices.push(String(message));
      return originalStatus(message, ...args);
    };
  });
}

async function openNoticeBoard(page) {
  await page.evaluate(() => {
    const entry = getValidSections().flatMap(section => section.entries)
      .find(item => item.id === 'gwynthor-marktplatz');
    if (!entry) throw new Error('Marketplace fixture source is missing');
    const pageIndex = entry.pages.findIndex(item => item.commentThreadKey === 'gwynthor-marktplatz-anzeigetafel');
    closeModal();
    openModal(entry, { pageIndex });
  });
  await page.locator('#modal-overlay .session-stage-title').filter({ hasText: 'Die Anzeigetafel' }).waitFor();
  await page.waitForFunction(() => Array.isArray(_commentCache[getCurrentCommentThreadId()]));
}

async function checkConcurrentAppTabs(layout, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const errors = [];
  const network = { blockedExternal: [], localHttpFailures: [], localRequestFailures: [],
    expectedExternalConsoleErrors: [], unexpectedConsoleErrors: [] };
  await context.route('**/*', route => {
    const request = route.request();
    if (new URL(request.url()).origin === origin && request.method() === 'GET') return route.continue();
    network.blockedExternal.push({ url: request.url(), method: request.method() });
    return route.abort();
  });
  try {
    const first = await openTestApp(context, errors, network);
    const second = await openTestApp(context, errors, network);
    let baseline = { updatedAtClient: 100, entryOverrides: {
      'two-tab-a': { id: 'two-tab-a', title: 'Erster Prüftext', description: 'Unverändert' },
      'two-tab-z': { id: 'two-tab-z', title: 'Zweiter Prüftext', description: 'Unverändert' }
    } };
    baseline = await first.evaluate(payload => normalizeModuleStorePayload(payload), baseline);
    await first.evaluate(payload => applyRemoteModuleStore(payload), baseline);
    await second.evaluate(payload => applyRemoteModuleStore({
      ...payload, updatedAtClient: 200,
      entryOverrides: Object.fromEntries(Object.entries(payload.entryOverrides).reverse())
    }), baseline);
    await first.evaluate(payload => applyRemoteModuleStore({ ...payload, updatedAtClient: 300 }), baseline);
    for (const page of [first, second]) {
      const state = await page.evaluate(async () => {
        try { await moduleStoreLocalPersistence.flush(); }
        catch (error) {
          const durable = createModuleStoreLocalPersistence({ indexedDB, storage: localStorage,
            keys: [MODULE_STORE_KEY, MODULE_STORE_SYNC_META_KEY] });
          await durable.ready();
          return { error: error.message,
            local: [moduleStoreLocalPersistence.read(MODULE_STORE_KEY), moduleStoreLocalPersistence.read(MODULE_STORE_SYNC_META_KEY)],
            durable: [durable.read(MODULE_STORE_KEY), durable.read(MODULE_STORE_SYNC_META_KEY)] };
        }
        return { synced: await isLocalModuleStoreSynced(readLocalModuleStorePayload()),
          dirty: moduleStoreLocalPersistence.hasPendingWrites(), status: _firebaseSyncState };
      });
      if (state.error) await writeFile(path.join(output, `${layout}-snapshot-failure.json`), JSON.stringify(state, null, 2) + '\n');
      assert.equal(state.synced, true, `${layout}: duplicate online snapshot lost its receipt`);
      assert.equal(state.dirty, false, `${layout}: duplicate online snapshot left a dirty cache`);
      assert.equal(state.status, 'synced', `${layout}: duplicate online snapshot reported an error`);
    }

    await second.evaluate(async () => {
      const refreshed = readLocalModuleStorePayload();
      refreshed.updatedAtClient = 350;
      await writeLocalModuleStorePayload(refreshed);
    });
    const allowedEdit = await first.evaluate(async () => {
      const edited = readLocalModuleStorePayload();
      edited.updatedAtClient = 360;
      edited.entryOverrides['two-tab-z'].pages[0].description = 'Bewusste Moduländerung nach Cacheaktualisierung';
      await writeLocalModuleStorePayload(edited);
      await moduleStoreLocalPersistence.flush();
      return edited;
    });
    assert.equal(allowedEdit.entryOverrides['two-tab-z'].pages[0].description,
      'Bewusste Moduländerung nach Cacheaktualisierung');
    baseline = allowedEdit;
    await first.evaluate(payload => applyRemoteModuleStore(payload), baseline);
    await second.evaluate(payload => applyRemoteModuleStore(payload), baseline);

    // Tab one remains on the baseline while tab two receives a real content
    // change. The user now posts a comment in the stale tab with no scene date.
    await installCommentFixture(first);
    const latest = structuredClone(baseline);
    latest.updatedAtClient = 400;
    latest.entryOverrides['two-tab-a'].pages[0].description = 'Neu im zweiten Tab';
    await second.evaluate(payload => applyRemoteModuleStore(payload), latest);
    await openNoticeBoard(first);
    await first.locator('#modal-overlay [data-action="open-comment-form"]').click();
    await first.locator('#cf-char-search').fill('Rianna');
    await first.locator('#cf-char-picker [data-id="fixture-rianna-wyrm"]').click();
    const prose = `Rianna liest die Aushänge. Browserprüfung ${layout}.`;
    await first.locator('#cf-segment-list textarea').first().fill(prose);
    await first.screenshot({ path: path.join(output, `${layout}-rianna-composer.png`) });
    await first.locator('#cf-submit').click();
    await first.locator('#comment-form-overlay').waitFor({ state: 'hidden' });
    await first.locator('#modal-overlay .comments-scroll').filter({ hasText: prose }).waitFor();
    const afterComment = await first.evaluate(() => {
      const thread = getCurrentCommentThread();
      const comments = _commentCache[thread.threadId];
      return { writes: window.__fixtureCommentWrites, moduleWrites: window.__fixtureModuleWrites,
        notices: window.__fixtureNotices, count: comments.length,
        comment: comments[0], resolvedDate: AleriaSceneDateDefaults.resolve(thread, comments),
        moduleDate: thread.page.sessionDateAleria,
        dirty: moduleStoreLocalPersistence.hasPendingWrites() };
    });
    assert.equal(afterComment.writes, 1);
    assert.equal(afterComment.moduleWrites, 0, 'Commenting must not save the whole module store');
    assert.equal(afterComment.count, 1);
    assert.equal(afterComment.comment.charName, 'Rianna Wyrm');
    assert.deepEqual(afterComment.comment.sceneStartDateAleria, { year: 1740, month: 3, day: 9 });
    assert.deepEqual(afterComment.resolvedDate, afterComment.comment.sceneStartDateAleria);
    assert.equal(afterComment.dirty, false);
    assert.equal(afterComment.notices.some(message => /anderen Tab|JSON exportieren/.test(message)), false);
    const width = await first.locator('#modal-overlay .modal-card').evaluate(card => ({ width: card.clientWidth, scroll: card.scrollWidth }));
    assert.ok(width.scroll <= width.width + 2, `${layout}: scene overflow`);
    const brokenImages = await first.locator('#modal-overlay img').evaluateAll(async images => {
      await Promise.all(images.map(image => image.decode().catch(() => {})));
      return images.filter(image => !image.naturalWidth).map(image => image.src);
    });
    const localBrokenImages = brokenImages.filter(url => new URL(url).origin === origin);
    assert.deepEqual(localBrokenImages, [], `${layout}: a local scene image did not load`);
    await first.screenshot({ path: path.join(output, `${layout}-rianna-saved.png`) });

    // A real competing module edit is still rejected. Both the first tab's
    // in-memory draft and the second tab's durable version remain available.
    const draft = structuredClone(baseline);
    draft.updatedAtClient = 500;
    draft.entryOverrides['two-tab-a'].pages[0].description = 'Eigener ungesicherter Entwurf';
    const conflict = await first.evaluate(async payload => {
      let code = '';
      try { await writeLocalModuleStorePayload(payload); } catch (error) { code = error.code; }
      return { code, draft: readLocalModuleStorePayload().entryOverrides['two-tab-a'].pages[0].description,
        dirty: moduleStoreLocalPersistence.hasPendingWrites() };
    }, draft);
    assert.equal(conflict.code, 'module-store-concurrent-write');
    assert.equal(conflict.draft, 'Eigener ungesicherter Entwurf');
    assert.equal(conflict.dirty, true);

    // Reload discards only this synthetic, deliberately rejected module draft.
    // Comment history and its scene date survive through the separate adapter.
    first.once('dialog', dialog => dialog.accept());
    await first.reload({ waitUntil: 'domcontentloaded' });
    await first.waitForFunction(() => typeof _appInitialized !== 'undefined' && _appInitialized);
    await dismissLoadingScreen(first);
    await installCommentFixture(first);
    await openNoticeBoard(first);
    const reloaded = await first.evaluate(() => ({
      durable: readLocalModuleStorePayload().entryOverrides['two-tab-a'].pages[0].description,
      comments: _commentCache[getCurrentCommentThreadId()].length,
      date: AleriaSceneDateDefaults.resolve(getCurrentCommentThread()),
      writes: window.__fixtureCommentWrites
    }));
    assert.equal(reloaded.durable, 'Neu im zweiten Tab');
    assert.equal(reloaded.comments, 1);
    assert.equal(reloaded.writes, 0);
    assert.deepEqual(reloaded.date, { year: 1740, month: 3, day: 9 });
    assert.deepEqual(errors, []);
    await writeFile(path.join(output, `${layout}-network.json`), JSON.stringify(network, null, 2) + '\n');
    assert.deepEqual(network.localHttpFailures, [], `${layout}: local HTTP resource failures`);
    assert.deepEqual(network.localRequestFailures, [], `${layout}: failed local resource requests`);
    assert.deepEqual(network.unexpectedConsoleErrors, [], `${layout}: unexpected console errors`);
    return { layout, viewport, twoRealTabs: true, duplicateSnapshots: true, editAfterTimestampRefresh: true,
      commentWrites: afterComment.writes, moduleWritesFromComment: afterComment.moduleWrites,
      dateSurvivesReload: true, competingDraftProtected: true, notices: afterComment.notices, errors, width,
      brokenExternalImages: brokenImages, network };
  } finally {
    await context.close();
  }
}

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

    const duplicateQueue = make('duplicate-queue-abort');
    await duplicateQueue.ready();
    let duplicatePuts = 0;
    IDBObjectStore.prototype.put = function (...args) {
      const request = originalPut.apply(this, args);
      if (++duplicatePuts === 2) this.transaction.abort();
      return request;
    };
    let duplicates;
    try { duplicates = await Promise.allSettled([duplicateQueue.write(keys[0], 'same draft'), duplicateQueue.write(keys[0], 'same draft')]); }
    finally { IDBObjectStore.prototype.put = originalPut; }
    let duplicateFlushRejected = false;
    try { await duplicateQueue.flush(); } catch { duplicateFlushRejected = true; }
    if (duplicates[0].status !== 'fulfilled' || duplicates[1].status !== 'rejected'
      || duplicateQueue.read(keys[0]) !== 'same draft' || !duplicateQueue.hasPendingWrites()
      || !duplicateFlushRejected) throw new Error('An earlier identical write acknowledged a later aborted draft');
    await duplicateQueue.write(keys[0], 'same draft');
    await duplicateQueue.flush();
    if (duplicateQueue.hasPendingWrites()) throw new Error('Identical draft retry left a dirty cache');
    return { quotaReproduced: true, migratedRecords: 2, persistedCharacters: large.length,
      abortsPreserveDrafts: true, duplicateQueueAbortProtected: true, orderedWrites: 20,
      concurrentTabsProtected: true, oldTabRecovery: true };
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
  await app.waitForFunction(() => !moduleStoreSyncActivity.initialReadPending);
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
  const tabs = [];
  for (const [layout, viewport] of [
    ['desktop', { width: 1460, height: 1000 }],
    ['phone', { width: 390, height: 844 }]
  ]) tabs.push(await checkConcurrentAppTabs(layout, viewport));
  await writeFile(path.join(output, 'report.json'), JSON.stringify({
    passed: true, externalRequestsBlocked: true, storageChecks,
    largeStore: { ...saved, survivedReload: true, pageErrors: errors.length }, tabs
  }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output, tabs }));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
