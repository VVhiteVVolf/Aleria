// Isolated renderer QA: local app only, all external requests blocked.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../Stammbäume/package.json', import.meta.url));
const { chromium } = require('playwright-core');
const output = new URL('../../.codex-temp/skalli-retinue/', import.meta.url);
await mkdir(output, { recursive: true });
const entry = JSON.parse(await readFile(new URL('../../Charakter Archiv Exporte/Module/Skallis Gefolge/skallis-gefolge-2026-10-18.json', import.meta.url), 'utf8')).module.entry;
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const results = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:8765' ? route.continue() : route.abort());
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8765/AleriaAlmanach/AleriaAlmanach.html');
  await page.waitForFunction(() => typeof openModal === 'function');
  // Authentication is deliberately offline in this rendering-only harness.
  // The production gate remains untouched; enable only the test document.
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-almanach-loading');
    document.querySelector('.almanach-loading')?.remove();
    const content = document.querySelector('[data-almanach-content]');
    if (content) { content.inert = false; content.removeAttribute('aria-hidden'); }
  });
  for (let index = 0; index < entry.pages.length; index++) {
    await page.evaluate(({ entry, index }) => openModal(entry, { pageIndex: index }), { entry, index });
    await page.locator('#modal-overlay').waitFor({ state: 'visible' });
    const broken = await page.locator('#modal-overlay img').evaluateAll(async images => {
      const local = images.filter(image => new URL(image.src).origin === location.origin);
      local.forEach(image => { image.loading = 'eager'; });
      await Promise.all(local.map(image => image.decode().catch(() => {})));
      return local.filter(image => !image.naturalWidth).map(image => image.src);
    });
    assert.deepEqual(broken, [], `Bilder auf Seite ${index + 1}`);
    await page.screenshot({ path: fileURLToPath(new URL(`page-${index + 1}.png`, output)) });
    if (index === 2) {
      assert.equal(await page.locator('[data-hierarchy-tree-tab]').count(), 4);
      await page.locator('[data-hierarchy-tree-tab="1"]').click();
      assert.equal(await page.locator('[data-hierarchy-tree-panel="1"] .hierarchy-chart-level.cols-4').count(), 6);
      await page.screenshot({ path: fileURLToPath(new URL('schar.png', output)) });
      await page.locator('[data-hierarchy-tree-tab="2"]').click();
      assert.match(await page.locator('[data-hierarchy-tree-panel="2"]').innerText(), /Gundel Varulv/);
      await page.locator('[data-hierarchy-tree-tab="3"]').click();
      assert.equal(await page.locator('[data-hierarchy-tree-panel="3"] .hierarchy-node-card').count(), 4);
      assert.equal(await page.locator('[data-hierarchy-tree-panel="3"] img').count(), 0);
    }
    results.push({ page: index + 1, title: entry.pages[index].pageTitle, brokenImages: broken.length });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(entry => openModal(entry, { pageIndex: 3 }), entry);
  await page.screenshot({ path: fileURLToPath(new URL('mobile-overview.png', output)) });
  await writeFile(new URL('verification.json', output), JSON.stringify({ pages: results, desktop: [1440, 1050], mobile: [390, 844], externalNetworkBlocked: true }, null, 2) + '\n');
  console.log(JSON.stringify({ checkedPages: results.length, hierarchyTabs: 4, animalSlots: 4, screenshots: fileURLToPath(output) }));
} finally { await browser.close(); }
