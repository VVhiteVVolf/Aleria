// Read-only production inspection: no fixtures, injected records or credentials.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';

const output = new URL('./production-browser/', import.meta.url);
await mkdir(output, { recursive: true });
const production = 'https://dieweltvonaleria.netlify.app';
const targets = [
  ['caralyn', 'Eka4z7TWpzEgx8KjhIzy', 8],
  ['rianna', 'person--haus-wyrm--rianna-wyrm', 3],
  ['lefraye', 'person--haus-gafyr--lefraye-gafyr', 9],
  ['oweta', 'vk0xAa3ZcEhVvGC1CzNq', 3]
];
const report = { capturedAt: new Date().toISOString(), production, noCharacterInjection: true, blockedRequests: [], allowedReadPostCount: 0,
  definitionRequests: [], errors: [], characters: [], screenshots: [], pendingKnownFix: 'Production item-card combat tab does not classify definitionRef-only possessions; local fix is not deployed. Inventory draft context may retain historic characterId/name/portrait.' };
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const deadline = setTimeout(() => { report.deadlineExceeded = true; browser.close(); }, 150000);
async function stage(label) { report.phase = label; console.log(label); await writeFile(new URL('production-browser-progress.json', import.meta.url), JSON.stringify(report, null, 2) + '\n'); }
try {
  const context = await browser.newContext({ reducedMotion: 'reduce', ignoreHTTPSErrors: true, viewport: { width: 1680, height: 1050 } });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url()), method = request.method();
    const publicRead = ['GET', 'HEAD'].includes(method) && (url.origin === production
      || url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')
      || url.origin === 'https://firestore.googleapis.com'
      || url.origin === 'https://firebasestorage.googleapis.com' && url.pathname.startsWith('/v0/b/aleriaprojekt.firebasestorage.app/o/family-assets%2F')
      || url.origin === 'https://i.imgur.com');
    const readPost = method === 'POST' && url.origin === 'https://firestore.googleapis.com'
      && (/\/google\.firestore\.v1\.Firestore\/Listen\/channel$/.test(url.pathname)
        || /\/documents(?::batchGet|:runQuery)$/.test(url.pathname));
    if (readPost) {
      report.allowedReadPostCount++;
      const body = decodeURIComponent(request.postData() || '');
      if (/item_definition/.test(body)) report.definitionRequests.push({ method, path: url.pathname, requestsVersions: body.includes('item_definition_versions'), requestsHeads: body.includes('item_definitions') });
      return route.continue();
    }
    if (publicRead) return route.continue();
    report.blockedRequests.push({ method, origin: url.origin, path: url.pathname });
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' || message.type() === 'warning') (report.consoleMessages ||= []).push(message.text().slice(0, 500)); });
  await stage('loading-production-page');
  await page.goto(production + '/AleriaAlmanach/AleriaAlmanach.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await stage('waiting-for-page-runtime');
  await page.waitForFunction(() => typeof openCharProfile === 'function' && typeof loadCharacters === 'function', null, { timeout: 90000 });
  const enter = page.locator('[data-loading-action="enter"]');
  const continuation = page.locator('[data-loading-action="continue"]');
  await page.waitForFunction(() => ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state), null, { timeout: 90000 });
  if (await enter.isEnabled()) await enter.click(); else if (await continuation.isVisible()) await continuation.click();
  await stage('loading-natural-character-records');
  await page.evaluate(() => { void loadCharacters(); });
  await page.waitForFunction(ids => ids.every(id => getCharacterById(id)), targets.map(t => t[1]), { timeout: 60000 });
  await stage('waiting-for-real-definition-subscription');
  // Wait for the app's own register subscription; this supplies no definitions.
  await page.waitForFunction(() => (globalThis.AleriaItemRegister?.store.snapshot().definitions || []).filter(d => d.id.startsWith('gwynthor-seven:')).length >= 20,
    null, { timeout: 30000 }).catch(() => { report.definitionWaitTimedOut = true; });
  await page.evaluate(() => { document.querySelector('.sync-conflict-dialog .close-btn')?.click(); });
  report.runtime = await page.evaluate(async () => {
    const registry = await import('./modules/item-definitions/item-definition-registry.js');
    const store = await import('./modules/item-definitions/item-definition-store.js');
    return { fbReady: typeof _fbReady === 'boolean' ? _fbReady : null, definitionStatus: store.itemDefinitionStore.snapshot().status,
      definitionHeadIds: store.itemDefinitionStore.snapshot().templates.filter(d => d.id.startsWith('gwynthor-seven:')).map(d => d.id),
      registryAuthored: registry.itemDefinitionRegistry.values().filter(d => d.id.startsWith('gwynthor-seven:')).map(d => ({ id: d.id, revision: d.revision })) };
  });
  const scope = '#cp-inventory-editor .character-inventory-page';
  for (const [slug, id, coreCount] of targets) {
    await stage('checking-' + slug);
    const data = await page.evaluate(id => {
      const character = getCharacterById(id);
      openCharProfile(id); switchCharTab('inventory');
      return { id: character.id, name: character.name, worldPersonId: character.identity?.worldPersonId,
        inventoryCharacterId: character.inventory?.characterId, inventoryName: character.inventory?.name,
        items: character.inventory.items.map(item => ({ id: item.id, name: item.name, image: item.image, definitionRef: item.definitionRef,
          equipped: item.equipped, creatureId: item.creatureId })),
        weapons: character.combatProfile?.weapons?.map(w => ({ name: w.name, damageFormula: w.damageFormula, inventoryItemId: w.inventoryItemId, equipped: w.equipped })),
        armorItems: character.combatProfile?.armorItems?.map(w => ({ name: w.name, baseArmorClass: w.baseArmorClass, inventoryItemId: w.inventoryItemId, equipped: w.equipped })) };
    }, id);
    assert.equal(data.items.filter(item => item.definitionRef?.id.startsWith('gwynthor-seven:')).length, coreCount);
    await page.locator(scope).waitFor({ state: 'visible' });
    data.rows = await page.locator(`${scope} .ci-item-row`).count();
    data.imageFailures = await page.locator(`${scope} img`).evaluateAll(async images => {
      await Promise.all(images.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
      return images.filter(i => !i.naturalWidth).map(i => i.src);
    });
    const desktop = `${slug}-desktop.png`;
    await page.screenshot({ path: new URL(desktop, output).pathname.slice(1) }); report.screenshots.push(desktop);
    report.characters.push(data);
    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = `${slug}-mobile.png`;
    await page.screenshot({ path: new URL(mobile, output).pathname.slice(1) }); report.screenshots.push(mobile);
    data.phoneBounds = await page.locator(scope).evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth }));
    const firstCard = page.locator(`${scope} .ci-item-card-button`).first();
    if (await firstCard.count()) {
      await firstCard.click();
      const modal = page.locator(`${scope} .ci-profile-overlay:visible`);
      await modal.waitFor({ state: 'visible' });
      data.cardText = (await modal.innerText()).slice(0, 8000);
      const card = `${slug}-item-card-mobile.png`;
      await page.screenshot({ path: new URL(card, output).pathname.slice(1) }); report.screenshots.push(card);
      await modal.locator('[data-ci-action="close-profile"]').click();
    }
    await page.setViewportSize({ width: 1680, height: 1050 });
    await page.evaluate(() => switchCharTab('combat'));
    data.combatText = (await page.locator('#cp-tab-combat').innerText()).slice(0, 16000);
    const combat = `${slug}-combat-desktop.png`;
    await page.screenshot({ path: new URL(combat, output).pathname.slice(1) }); report.screenshots.push(combat);
    await page.evaluate(() => closeCharProfile({ skipUnsavedCheck: true }));
  }
  report.finalDefinitions = await page.evaluate(async () => {
    const { itemDefinitionRegistry } = await import('./modules/item-definitions/item-definition-registry.js');
    const { itemDefinitionStore } = await import('./modules/item-definitions/item-definition-store.js');
    const refs = [...new Map(_characters.filter(c => ['Caralyn Chwedonol', 'Rianna Wyrm', 'Lefraye Gafyr', 'Oweta Draig'].includes(c.name))
      .flatMap(c => (c.inventory?.items || []).filter(i => i.definitionRef?.id.startsWith('gwynthor-seven:')).map(i => [i.definitionRef.id + '@' + i.definitionRef.revision, i.definitionRef]))).values()];
    return { status: itemDefinitionStore.snapshot().status, registerHeadIds: globalThis.AleriaItemRegister?.store.snapshot().definitions?.filter(d => d.id.startsWith('gwynthor-seven:')).map(d => d.id),
      refs: refs.map(ref => ({ ...ref, loaded: !!itemDefinitionRegistry.get(ref), combatKind: itemDefinitionRegistry.get(ref)?.combatDefinition?.kind })),
      loadedModuleUrls: performance.getEntriesByType('resource').filter(r => /item-definition-(store|registry|firebase)/.test(r.name)).map(r => r.name) };
  });
  report.completedAt = new Date().toISOString();
} catch (error) {
  report.failure = error.stack;
  throw error;
} finally {
  clearTimeout(deadline);
  await writeFile(new URL('production-browser.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify({ characters: report.characters.map(c => ({ name: c.name, items: c.items.length, rows: c.rows, broken: c.imageFailures, phoneBounds: c.phoneBounds })), runtime: report.runtime, blocked: report.blockedRequests.length, readPosts: report.allowedReadPostCount }, null, 2));
