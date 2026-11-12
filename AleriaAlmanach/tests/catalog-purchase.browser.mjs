import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const sourceFiles = ['modules/catalog-purchase/catalog-purchase-controller.js', 'modules/catalog-purchase/catalog-purchase-entry.js',
  'modules/catalog-purchase/catalog-purchase-view.js', 'modules/catalog-purchase/catalog-purchase-model.js',
  'modules/catalog-purchase/catalog-purchase-service.js', 'modules/catalog-purchase/catalog-purchase-source.js',
  'modules/catalog-purchase/catalog-purchase-preferences.js', 'modules/catalog-purchase/catalog-purchase-submission.js',
  'modules/scene-trade/scene-trade-actor-picker.js', 'modules/item-register/item-register-markup.js',
  'modules/goods/goods-renderer.js', 'modules/trade-catalog/trade-catalog-renderer.js',
  'modules/core/content-safety.js', 'modules/module-editor/module-editor-data.js', 'modules/module-editor/module-preview.css',
  'styles.css', 'styles/modal.css', 'styles/scene-trade.css', 'styles/module-page-trade-catalog.css', 'styles/module-page-goods.css',
  'styles/catalog-purchase.css', 'tests/fixtures/catalog-purchase-fixture.mjs', 'tests/catalog-purchase.browser.mjs'];
async function hashSources() {
  const hashes = {};
  for (const file of sourceFiles) hashes[file] = createHash('sha256').update(await readFile(resolve(root, 'AleriaAlmanach', file))).digest('hex');
  return hashes;
}
const sourceHashes = await hashSources();
const output = resolve(root, process.argv.find(value => value.startsWith('--output='))?.slice(9)
  || `diagnostics/catalog-purchase-20261108/run-${Date.now()}`);
const outputRelative = relative(root, output);
assert(outputRelative && !outputRelative.startsWith(`..${sep}`) && outputRelative !== '..' && !outputRelative.includes(':'), 'Output must stay inside the project');
await mkdir(output, { recursive: true });
const fixtureUrl = `/${outputRelative.split(sep).join('/')}/fixture.html`;
const core = await readFile(resolve(root, 'AleriaAlmanach/modules/core/app-core.js'), 'utf8');
const slugStart = core.indexOf('function slugify(');
assert(slugStart >= 0);
const slugify = core.slice(slugStart, core.indexOf('\nfunction ', slugStart + 1));
await build({ absWorkingDir: root, bundle: true, format: 'iife', platform: 'browser',
  outfile: resolve(output, 'controller.js'), stdin: { resolveDir: root, contents: `
import './AleriaAlmanach/modules/trade-catalog/trade-catalog-renderer.js';
import './AleriaAlmanach/modules/catalog-purchase/catalog-purchase-entry.js';
import { createCatalogPurchaseFixture } from './AleriaAlmanach/tests/fixtures/catalog-purchase-fixture.mjs';
const fixture = createCatalogPurchaseFixture(JSON.parse(sessionStorage.getItem('catalog-fixture-server') || 'null'));
globalThis.catalogPurchaseFixture = fixture;
document.addEventListener('aleria:character-saved', event => fixture.published.push(event.detail.record.id));
document.querySelector('#trade-catalog').innerHTML = buildTradeCatalogPage(fixture.entry.pages[0], fixture.entry, 0, 2);
document.querySelector('#goods-register').innerHTML = buildGoodsTablePage(fixture.entry.pages[1], fixture.entry, 1, 2);
globalThis.catalogPurchaseFixtureReady = true;
` }, plugins: [{ name: 'local-only-trade-adapter', setup(plugin) {
    plugin.onResolve({ filter: /scene-trade-service\.js(?:\?.*)?$/ }, () => ({ path: 'local-commerce', namespace: 'catalog-fixture' }));
    plugin.onLoad({ filter: /.*/, namespace: 'catalog-fixture' }, () => ({ contents:
      'export function createSceneTradeService(){return globalThis.catalogPurchaseFixture.trade;}', loader: 'js' }));
  } }] });
await writeFile(resolve(output, 'fixture.html'), `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Isolierte Schnellkaufprüfung</title>
<link rel="stylesheet" href="/AleriaAlmanach/styles.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/modal.css">
<link rel="stylesheet" href="/AleriaAlmanach/styles/module-page-trade-catalog.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/module-page-goods.css">
<link rel="stylesheet" href="/AleriaAlmanach/modules/module-editor/module-preview.css">
<link rel="stylesheet" href="/AleriaAlmanach/styles/trade-item-card.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/scene-trade.css">
<link rel="stylesheet" href="/AleriaAlmanach/styles/catalog-purchase.css">
<style>body{margin:0;padding:12px;overflow:auto}#fixture-pages{max-width:1400px;margin:auto}#unchanged-scene{padding:8px}dialog{color:inherit}</style>
<main id="fixture-pages" class="comment-module-preview-frame"><p id="unchanged-scene">Die laufende Szene bleibt unverändert.</p><section id="trade-catalog"></section><section id="goods-register"></section></main>
<script src="/AleriaAlmanach/modules/core/content-safety.js"></script>
<script>${slugify}\nfunction deepClone(value){return structuredClone(value)}\nfunction buildNav(){return ''}\nfunction getInlineCommentThreadForPage(){return null}</script>
<script src="/AleriaAlmanach/modules/module-editor/module-editor-data.js"></script><script src="/AleriaAlmanach/modules/goods/goods-renderer.js"></script>
<script src="./controller.js"></script></html>`);

const server = await startChartQualityServer(root);
let browser;
const cases = [], screenshots = [], errors = [], failedResources = [], consoleErrors = [], measurements = [];
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [label, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 850 }], ['narrow', { width: 320, height: 740 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    await context.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      return url.origin === server.origin && request.method() === 'GET' && !url.pathname.startsWith('/.netlify/') ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push({ label, message: error.message }));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push({ label, message: message.text() }); });
    page.on('requestfailed', request => failedResources.push({ label, url: request.url(), error: request.failure()?.errorText }));
    page.on('response', response => { if (response.status() >= 400) failedResources.push({ label, url: response.url(), status: response.status() }); });
    await page.goto(`${server.origin}${fixtureUrl}`);
    await page.waitForFunction(() => globalThis.catalogPurchaseFixtureReady === true);
    const normal = page.locator('[data-catalog-item-id="becher"] [data-action="catalog-purchase"]');
    const unique = page.locator('[data-catalog-item-id="sternensiegel"] [data-action="catalog-purchase"]');
    const other = page.locator('[data-catalog-item-index="2"] [data-action="catalog-purchase"]');
    const goods = page.locator('#goods-register [data-action="catalog-purchase"]');
    assert.equal(await normal.count(), 1, 'Real trade renderer exposes one purchase action for this source');
    assert.equal(await goods.count(), 1, 'Real goods-table renderer exposes its purchase action');
    assert.equal(await other.locator('..').evaluate(node => node.closest('[data-catalog-source-kind]').dataset.catalogItemId), '', 'An idless catalog item uses its original index rather than a sanitizer-generated ID');
    assert.deepEqual(await goods.evaluate(node => { const row = node.closest('[data-catalog-source-kind]'); return { table: row.dataset.catalogTableId, row: row.dataset.catalogRowIndex }; }),
      { table: '0', row: '1' }, 'The idless goods table preserves its original numeric table and row indices past an empty row');
    await normal.click();
    await ready(page);
    assert(await confirmButton(page).isDisabled(), 'An opening must not automatically choose a payer');
    await choose(page, 'payerKey', 'Gawain', 'character:gawain-fixture', true);
    assert.equal(await picker(page, 'recipientId').getAttribute('data-picker-value'), 'gawain-fixture');
    assert.match(await dialog(page).locator('.catalog-purchase-totals').textContent(), /Geldbeutel danach\s*(?:0 Gold, 0 Silber, 0 Kupfer, )?10 Eisenpfennig/,
      'One Kupfer less 90 Pfennig previews exactly 10 Pfennig');
    const quantity = dialog(page).locator('[data-catalog-field="quantity"]');
    await quantity.fill('0');
    assert(await confirmButton(page).isDisabled());
    await quantity.fill('1');
    assert(await confirmButton(page).isEnabled());
    measurements.push(await measure(page, label, 'coin-preview', viewport));
    await shot(page, label, 'coin-preview');
    await buy(page);
    assert.equal((await snapshot(page)).characters[0].inventory.moneyState.totalCopper, 0.1);
    assert.equal((await snapshot(page)).characters[0].inventory.items.length, 1);
    assert.deepEqual(await page.evaluate(() => catalogPurchaseFixture.published), ['gawain-fixture'], 'A confirmed result is published only once');
    await close(page, normal);
    assert(await normal.isEnabled(), 'Ordinary stock remains available after purchase');
    cases.push({ label, name: 'payer-search-keyboard-and-coin-change', passed: true });

    await normal.click(); await ready(page);
    await choose(page, 'payerKey', 'Reisekasse', 'group:companions-fixture');
    await choose(page, 'recipientId', 'Ylva', 'ylva-fixture');
    const operator = picker(page, 'actorCharacterId');
    assert.equal(await operator.getAttribute('data-picker-value'), 'gawain-fixture');
    await operator.locator('summary').click();
    await page.waitForFunction(() => document.querySelector('[data-picker-field="actorCharacterId"] [data-trade-picker-value]'));
    assert.deepEqual(await operator.locator('[data-trade-picker-value]').evaluateAll(nodes => nodes.map(node => node.dataset.tradePickerValue)), ['gawain-fixture'],
      'The ordering picker only offers actual group members');
    measurements.push(await measure(page, label, 'group-picker-open', viewport));
    await shot(page, label, 'group-gift');
    await page.keyboard.press('Escape');
    assert.equal(await dialog(page).count(), 1, 'Escape closes the actor picker first');
    assert.equal(await operator.getAttribute('open'), null);
    await buy(page); await buy(page);
    let saved = await snapshot(page);
    assert.equal(saved.groups[0].inventory.moneyState.totalCopper, 98.2);
    assert.equal(saved.characters[1].inventory.items.length, 2);
    assert(saved.calls.slice(-2).every(request => request.actorCharacterId === 'gawain-fixture'
      && request.lines[0].payerKey === 'group:companions-fixture' && request.lines[0].recipientKey === 'character:ylva-fixture'));
    assert.deepEqual(await page.evaluate(() => catalogPurchaseFixture.published), ['gawain-fixture', 'ylva-fixture', 'ylva-fixture']);
    await close(page, normal);
    assert(await normal.isEnabled()); assert(await other.isEnabled()); assert(await unique.isEnabled());
    cases.push({ label, name: 'group-funded-gift-and-repeatable-normal-stock', passed: true });

    await unique.click(); await ready(page);
    assert(await dialog(page).locator('[data-catalog-field="quantity"]').isDisabled());
    await buy(page);
    assert.match(await dialog(page).locator('.catalog-purchase-totals').textContent(), /Geldbeutel jetzt\s*97 Kupfer, 20 Eisenpfennig/,
      'A completed unique purchase shows the actual remaining balance, not another hypothetical debit');
    assert(await unique.isDisabled(), 'Only the purchased unique becomes unavailable');
    assert(await normal.isEnabled()); assert(await other.isEnabled()); assert(await goods.isEnabled());
    assert.equal(await page.locator('.catalog-purchase-sold').count(), 1);
    await shot(page, label, 'unique-bought');
    await close(page);
    cases.push({ label, name: 'unique-single-instance-and-only-unique-grays', passed: true });

    await goods.click(); await ready(page);
    assert.match(await dialog(page).locator('h2').textContent(), /Kräutertee/);
    await page.evaluate(() => catalogPurchaseFixture.holdNextReply());
    const beforeHeld = await snapshot(page);
    await confirmButton(page).click();
    await page.waitForFunction(() => catalogPurchaseFixture.replyWaiting());
    assert(await confirmButton(page).isDisabled());
    await confirmButton(page).evaluate(button => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    assert.equal((await snapshot(page)).calls.length, beforeHeld.calls.length + 1, 'Repeated confirmation during a pending call cannot submit a second request');
    await page.evaluate(() => catalogPurchaseFixture.releaseReply());
    await successful(page); await close(page, goods);
    assert(await goods.isEnabled());
    cases.push({ label, name: 'goods-table-source-purchase-and-busy-double-click', passed: true });

    await other.click(); await ready(page);
    await dialog(page).locator('[data-catalog-field="quantity"]').fill('2');
    const before = await snapshot(page);
    await page.evaluate(() => catalogPurchaseFixture.loseNextReply());
    await confirmButton(page).click();
    const retry = dialog(page).locator('[data-action="retry-catalog-purchase"]');
    await retry.waitFor({ state: 'visible' });
    assert(await confirmButton(page).isDisabled());
    assert(await dialog(page).locator('[data-catalog-field="quantity"]').isDisabled());
    assert.match(await dialog(page).textContent(), /derselben|denselben/);
    const afterLost = await snapshot(page);
    assert.equal(afterLost.committedOperations, before.committedOperations + 1);
    await shot(page, label, 'pending');
    await retry.scrollIntoViewIfNeeded();
    await shot(page, label, 'pending-retry-visible');
    // Recreate the page/controller while the fixture server keeps its own result.
    await close(page, other);
    await page.evaluate(() => sessionStorage.setItem('catalog-fixture-server', JSON.stringify(catalogPurchaseFixture.exportState())));
    await page.reload();
    await page.waitForFunction(() => globalThis.catalogPurchaseFixtureReady === true);
    await goods.click(); await ready(page);
    assert.match(await dialog(page).locator('h2').textContent(), /Messingring/);
    await dialog(page).locator('[data-action="retry-catalog-purchase"]').click();
    await successful(page);
    saved = await snapshot(page);
    assert.equal(saved.committedOperations, before.committedOperations + 1);
    assert.deepEqual(saved.calls.at(-1), saved.calls.at(-2), 'Retry preserves operation id, price, payer, recipient and revisions exactly');
    assert.equal(saved.groups[0].inventory.moneyState.totalCopper, afterLost.groups[0].inventory.moneyState.totalCopper);
    assert.deepEqual(await page.evaluate(() => catalogPurchaseFixture.published), ['ylva-fixture']);
    await close(page, goods);
    cases.push({ label, name: 'uncertain-result-restored-and-exact-idempotent-retry', passed: true });

    await other.focus(); await page.keyboard.press('Enter'); await ready(page);
    const selected = picker(page, 'payerKey');
    await selected.locator('summary').click();
    await page.waitForFunction(() => document.querySelector('[data-picker-field="payerKey"][open]'));
    await page.keyboard.press('Escape');
    assert.equal(await dialog(page).count(), 1);
    assert(await selected.locator('summary').evaluate(node => document.activeElement === node));
    await page.keyboard.press('Escape');
    await dialog(page).waitFor({ state: 'detached' });
    assert(await other.evaluate(node => document.activeElement === node));
    assert.equal(await page.locator('#unchanged-scene').textContent(), 'Die laufende Szene bleibt unverändert.');
    cases.push({ label, name: 'keyboard-entry-escape-and-focus-return', passed: true });
    await context.close();
  }
  assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []); assert.deepEqual(failedResources, []);
  assert.deepEqual(await hashSources(), sourceHashes, 'All tested feature sources stay frozen from bundle creation through the final check');
  await writeFile(resolve(output, 'report.json'), `${JSON.stringify({ passed: true, actualController: true, actualEntry: true,
    actualRenderers: ['trade-catalog', 'goods-register'], actualService: true, fixtureBackend: 'shared applySceneTradeOrder; local memory only',
    productionWrites: 0, externalNetworkAllowed: false, cases, measurements, screenshots, errors, consoleErrors, failedResources, sourceHashes }, null, 2)}\n`);
  console.log(JSON.stringify({ passed: true, cases: cases.length, output, screenshots: screenshots.length }));
} catch (error) {
  await writeFile(resolve(output, 'failure.json'), `${JSON.stringify({ passed: false, message: error.message, stack: error.stack,
    cases, measurements, screenshots, errors, consoleErrors, failedResources, productionWrites: 0 }, null, 2)}\n`);
  throw error;
} finally { await browser?.close(); await server.close(); }

function dialog(page) { return page.locator('dialog.catalog-purchase-dialog[open]'); }
function picker(page, field) { return dialog(page).locator(`[data-picker-field="${field}"]`); }
function confirmButton(page) { return dialog(page).locator('[data-action="confirm-catalog-purchase"]'); }
async function ready(page) {
  await dialog(page).locator('[data-catalog-field="quantity"]').waitFor({ state: 'visible' });
  await page.waitForFunction(() => !document.querySelector('.catalog-purchase-dialog')?.textContent.includes('Kauf wird geprüft'));
}
async function successful(page) {
  await page.waitForFunction(() => /gekauft und ins Inventar übertragen/.test(document.querySelector('.catalog-purchase-status')?.textContent || ''));
}
async function buy(page) { await confirmButton(page).click(); await successful(page); }
async function close(page, trigger) {
  await dialog(page).locator('[data-action="close-catalog-purchase"]').click();
  await dialog(page).waitFor({ state: 'detached' });
  if (trigger && await trigger.isEnabled()) assert(await trigger.evaluate(node => document.activeElement === node), 'Focus returns to the source purchase button');
}
async function choose(page, field, search, value, keyboard = false) {
  const root = picker(page, field);
  await root.locator('summary').click();
  const input = root.locator('[data-trade-picker-search]');
  await input.fill(search);
  const choice = root.locator(`[data-trade-picker-value="${value}"]`);
  await choice.waitFor({ state: 'visible' });
  assert.equal(await choice.locator('.scene-trade-actor-avatar').count(), 1, 'Choices show an avatar beside the name');
  if (keyboard) {
    // Native <details> queues its toggle/focus work; test the settled keyboard UI.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    await input.focus(); await page.keyboard.press('ArrowDown');
    const active = await choice.evaluate(node => ({ selected: document.activeElement === node,
      active: document.activeElement?.outerHTML, open: node.closest('details').open }));
    assert(active.selected, `ArrowDown focuses the filtered avatar option: ${JSON.stringify(active)}`);
    await page.keyboard.press('Enter');
  }
  else await choice.click();
  await page.waitForFunction(({ field, value }) => document.querySelector(`[data-picker-field="${field}"]`)?.dataset.pickerValue === value, { field, value });
}
async function snapshot(page) { return page.evaluate(() => catalogPurchaseFixture.snapshot()); }
async function measure(page, label, state, viewport) {
  const result = await page.evaluate(() => {
    const box = document.querySelector('dialog.catalog-purchase-dialog'), rect = box.getBoundingClientRect();
    const visible = node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden';
    const overflow = [...box.querySelectorAll('input,select,button,summary,.scene-trade-actor-name,.catalog-purchase-totals strong')].filter(visible)
      .filter(node => { const r = node.getBoundingClientRect(); return r.left < rect.left - 1 || r.right > rect.right + 1; })
      .map(node => ({ tag: node.tagName, class: node.className, text: node.textContent.slice(0, 80) }));
    const labels = [...box.querySelectorAll('.catalog-purchase-people > .scene-trade-actor-picker')].map(node => node.getBoundingClientRect());
    const summaryTextOverflow = [...box.querySelectorAll('summary .scene-trade-actor-name')].filter(visible).filter(node => {
      const text = node.getBoundingClientRect(), summary = node.closest('summary').getBoundingClientRect();
      return text.top < summary.top - 1 || text.bottom > summary.bottom + 1;
    }).map(node => node.textContent);
    const background = getComputedStyle(box.querySelector('[data-action="confirm-catalog-purchase"]')).backgroundColor;
    return { width: rect.width, height: rect.height, scrollWidth: box.scrollWidth, clientWidth: box.clientWidth,
      top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, overflow, summaryTextOverflow, primaryBackground: background,
      pickerOverlap: labels.length === 2 && labels[0].right > labels[1].left + 1
        && labels[0].bottom > labels[1].top + 1 && labels[1].bottom > labels[0].top + 1 };
  });
  assert(result.width <= viewport.width - 12 && result.left >= 0 && result.right <= viewport.width + 1);
  assert(result.height <= viewport.height - 12);
  assert(Math.abs(result.left - (viewport.width - result.width) / 2) <= 1, 'Native purchase dialog is horizontally centered');
  assert(Math.abs(result.top - (viewport.height - result.height) / 2) <= 1, 'Native purchase dialog is vertically centered');
  assert(result.scrollWidth <= result.clientWidth + 1, 'No horizontal dialog overflow');
  assert.deepEqual(result.overflow, []); assert.equal(result.pickerOverlap, false, 'Payer and recipient cannot overlap');
  assert.deepEqual(result.summaryTextOverflow, [], 'Long selected names fit inside their own picker');
  if (state === 'coin-preview' && viewport.width > 1000) {
    assert(result.height < 700, 'The small purchase form does not inherit the full-height scene-trade window');
    const channels = result.primaryBackground.match(/[\d.]+/g).map(Number);
    assert(channels.slice(0, 3).every(value => value < 140), 'The primary purchase action keeps its dark feature background');
  }
  return { label, state, viewport, ...result };
}
async function shot(page, label, state) {
  const file = `${label}-${state}.png`;
  await page.screenshot({ path: resolve(output, file), fullPage: false });
  screenshots.push(file);
}
