import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildMuschiPackage } from '../modules/gestiefelte-muschi/muschi-package.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, `.tmp/gestiefelte-muschi/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const entry = await buildMuschiPackage();
const server = await startChartQualityServer(root);
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const cache = new Map();
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === server.origin) return route.continue();
    if (request.method() === 'GET' && ((url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) || url.origin === 'https://i.imgur.com')) {
      if (!cache.has(request.url())) cache.set(request.url(), fetch(request.url()).then(async response => ({ status: response.status, contentType: response.headers.get('content-type'), headers: { 'access-control-allow-origin': '*' }, body: Buffer.from(await response.arrayBuffer()) })));
      return route.fulfill(await cache.get(request.url()));
    }
    return route.abort();
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => typeof openModal === 'function');
  await page.waitForFunction(() => ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter = page.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  assert.equal(await page.evaluate(id => getValidSections().flatMap(s => s.entries).filter(e => e.id === id).length, entry.id), 1);
  assert.equal(await page.evaluate(e => getPages(e).length, entry), 11);
  assert.equal(await page.evaluate(data => sanitizeGuestRegisterData(data).sections.flatMap(s => s.guests).length, entry.pages[5].guestRegister), 32);
  const imagesLoaded = async selector => {
    const broken = await page.locator(selector).evaluateAll(async images => {
      const local = images.filter(i => /gestiefelte-muschi|Brevanor\/(?:Bielle|Desele)|lachende-nixe\/drinks/.test(decodeURI(i.src)));
      await Promise.all(local.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
      return local.filter(i => !i.naturalWidth).map(i => i.src);
    });
    assert.deepEqual(broken, []);
  };
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(viewport);
    for (let index = 0; index < 11; index++) {
      await page.evaluate(({ entry, index }) => { closeModal(); openModal(entry, { pageIndex: index }); }, { entry, index });
      await page.locator('#modal-overlay').waitFor({ state: 'visible' });
      await imagesLoaded('#modal-overlay img');
      if (index === 2) {
        const tabs = page.locator('#modal-overlay [data-hierarchy-tree-tab]');
        assert.equal(await tabs.count(), 5);
        for (let tree = 0; tree < 5; tree++) {
          await tabs.nth(tree).click();
          const panel = page.locator('#modal-overlay [data-hierarchy-tree-panel].active');
          assert.equal(await panel.locator('.hierarchy-node-card').count(), entry.pages[2].hierarchy.trees[tree].levels.reduce((n, level) => n + level.nodes.length, 0));
          await imagesLoaded('#modal-overlay [data-hierarchy-tree-panel].active img');
          await page.screenshot({ path: resolve(output, `${layout}-hierarchie-${tree}.png`) });
        }
      }
      if (index === 3) {
        await imagesLoaded('#modal-overlay .trade-catalog-item img');
        const brokenGoods = await page.locator('#modal-overlay .trade-catalog-item img.trade-catalog-image').evaluateAll(async images => {
          await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
          return images.filter(image => !image.naturalWidth).map(image => image.src);
        });
        assert.deepEqual(brokenGoods, []);
        const tabs = page.locator('#modal-overlay [data-trade-filter]');
        assert.equal(await tabs.count(), 5);
        for (const category of entry.pages[3].tradeCatalog.categories) {
          await page.locator(`[data-trade-filter="${category.id}"]`).click();
          assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), entry.pages[3].tradeCatalog.items.filter(i => i.category === category.id).length);
          await page.screenshot({ path: resolve(output, `${layout}-gueter-${category.id}.png`) });
        }
        await page.locator('[data-trade-filter="ausschank"]').click();
        await page.locator('#modal-overlay [data-action="open-trade-item-card"]').first().click();
        assert.ok(await page.locator('dialog.trade-item-card').isVisible());
        await page.screenshot({ path: resolve(output, `${layout}-itemkarte.png`) });
        await page.keyboard.press('Escape');
        await page.locator('dialog.trade-item-card').waitFor({ state: 'detached' });
        assert.ok(await page.locator('#modal-overlay').isVisible());
      }
      if (index >= 6 && index < 10) {
        const intro = page.locator('#modal-overlay .session-stage-copy');
        const thread = await page.evaluate(() => getCurrentCommentThreadId());
        await page.locator('#modal-overlay .session-intro-toggle').click();
        assert.equal(await intro.isVisible(), false);
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
        await page.locator('#modal-overlay .session-intro-toggle').click();
        assert.ok(await intro.isVisible());
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
      await page.screenshot({ path: resolve(output, `${layout}-seite-${index + 1}.png`) });
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ module: entry.id, pages: 11, scenes: 4, hierarchyTabs: 5, catalogCategories: 4, itemCard: true, guestSlots: 32, externalWrites: false, errors }, null, 2));
  console.log(JSON.stringify({ passed: true, output }));
} finally { await browser?.close(); await server.close(); }
