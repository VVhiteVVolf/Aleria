import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildPendrwnStore } from '../modules/pendrwn-general-store/store-module.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, `.tmp/trade-item-card/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const entry = buildPendrwnStore(), server = await startChartQualityServer(root);
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    return url.origin === server.origin && request.method() === 'GET' && !url.pathname.startsWith('/.netlify/') ? route.continue() : route.abort();
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => typeof openModal === 'function');
  await page.waitForFunction(() => ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter = page.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  for (const [label, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 430, height: 850 }], ['narrow', { width: 320, height: 700 }]]) {
    await page.setViewportSize(viewport);
    await page.evaluate(entry => { closeModal(); openModal(entry, { pageIndex: 3 }); }, entry);
    const items = page.locator('.trade-catalog-item');
    assert.equal(await items.count(), 47);
    assert.equal(await items.locator('.trade-catalog-attributes').count(), 0, 'No chart consumes list space');
    const trigger = items.first().locator('[data-action="open-trade-item-card"]');
    await trigger.click();
    const card = page.locator('dialog.trade-item-card[open]');
    await card.waitFor({ state: 'visible' });
    assert.equal(await card.locator('h2').textContent(), 'Rucksack');
    assert.equal(await card.locator('.trade-radar-chart').count(), 1);
    assert.deepEqual(await card.locator('.trade-attribute-row strong').allTextContents(), ['9', '7', '5', '6', '10', '8']);
    const bounds = await card.evaluate(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height,
      scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
    assert.ok(bounds.width <= viewport.width - 20); assert.ok(bounds.height <= viewport.height - 28);
    assert.ok(bounds.scrollWidth <= bounds.clientWidth + 1, 'No horizontal card overflow');
    await page.keyboard.press('ArrowRight');
    assert.equal(await card.count(), 1, 'Archive arrows cannot navigate under an open card');
    await page.screenshot({ path: resolve(output, `${label}-karte.png`) });
    await page.keyboard.press('Escape');
    await card.waitFor({ state: 'detached' });
    assert.ok(await page.locator('#modal-overlay').isVisible(), 'Escape only closes the item card');
    assert.ok(await trigger.evaluate(el => document.activeElement === el), 'Keyboard focus returns to the image button');
    const second = items.nth(1).locator('[data-action="open-trade-item-card"]');
    await second.click();
    assert.equal(await card.locator('h2').textContent(), 'Wasserschlauch');
    await card.locator('[data-action="close-trade-item-card"]').click();
    await card.waitFor({ state: 'detached' });
    await page.screenshot({ path: resolve(output, `${label}-liste.png`) });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(entry => { closeModal(); openModal(entry, { pageIndex: 4 }); }, entry);
  await page.locator('[data-trade-filter="all"]').click();
  await page.locator('[data-action="open-trade-item-card"]').first().click();
  const card = page.locator('dialog.trade-item-card[open]');
  assert.equal(await card.locator('h2').textContent(), 'Kleine Balkenwaage mit Gewichten');
  assert.equal(await card.locator('.trade-radar-chart').count(), 0, 'Items without attributes have no fabricated chart');
  assert.ok(await card.locator('.trade-item-card-description').isVisible());
  await page.mouse.click(2, 2);
  await card.waitFor({ state: 'detached' });
  assert.ok(await page.locator('#modal-overlay').isVisible());
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: true, viewports: 3, listCharts: 0,
    imageOpensCard: true, valuesPreserved: true, keyboardFocus: true, escapeKeepsModuleOpen: true,
    noAttributeFallback: true, backdropClose: true, externalWrites: 0 }, null, 2));
  console.log(`PASS: ${output}`);
} finally { await browser?.close(); await server.close(); }
