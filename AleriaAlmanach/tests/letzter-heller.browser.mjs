import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildLetzterHeller } from '../modules/letzter-heller/heller-module.mjs';
import { SEPT_CNEACAIL_FAMILY } from '../../Stammbäume/assets/js/data/sept-cneacail-family.js';
const root = fileURLToPath(new URL('../../', import.meta.url)), entry = buildLetzterHeller();
const output = resolve(root, `.tmp/letzter-heller/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const server = await startChartQualityServer(root);
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ reducedMotion: 'reduce' }), cache = new Map();
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === server.origin) return route.continue();
    if (request.method() === 'GET' && ((url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) || url.origin === 'https://i.imgur.com')) {
      if (!cache.has(request.url())) cache.set(request.url(), fetch(request.url()).then(async r => ({ status: r.status, contentType: r.headers.get('content-type'), headers: { 'access-control-allow-origin': '*' }, body: Buffer.from(await r.arrayBuffer()) })));
      return route.fulfill(await cache.get(request.url()));
    }
    return route.abort();
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => typeof openModal === 'function' && ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter = page.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  assert.equal(await page.evaluate(id => getValidSections().flatMap(s => s.entries).filter(e => e.id === id).length, entry.id), 1);
  const sanitized = await page.evaluate(c => sanitizeTradeCatalogData(c), entry.pages[5].tradeCatalog);
  assert.equal(sanitized.items.filter(i => i.status === 'unavailable').length, 2);
  const edited = await page.evaluate(data => {
    const host = document.createElement('div');
    host.innerHTML = buildTradeCatalogItemRows(data.items);
    const collected = collectTradeCatalogItems(host);
    return sanitizeTradeCatalogData({ ...data, items: collected }).items.map(i => ({ id: i.id, title: i.title, status: i.status }));
  }, sanitized);
  assert.equal(edited.filter(i => i.status === 'unavailable').length, 2);
  const imagesLoaded = async () => {
    const broken = await page.locator('#modal-overlay img').evaluateAll(async images => {
      const selected = images.filter(i => /letzter-heller|sept-cneacail/.test(i.src));
      await Promise.all(selected.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
      return selected.filter(i => !i.naturalWidth).map(i => i.src);
    });
    assert.deepEqual(broken, []);
  };
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(viewport);
    for (let index = 0; index < 11; index++) {
      await page.evaluate(({ entry, index }) => { closeModal(); openModal(entry, { pageIndex: index }); }, { entry, index });
      await page.locator('#modal-overlay').waitFor({ state: 'visible' });
      await imagesLoaded();
      if (index === 4) {
        const tabs = page.locator('#modal-overlay [data-hierarchy-tree-tab]');
        assert.equal(await tabs.count(), 3);
        for (let tree = 0; tree < 3; tree++) { await tabs.nth(tree).click(); await imagesLoaded(); await page.screenshot({ path: resolve(output, `${layout}-personal-${tree}.png`) }); }
      }
      if (index === 5) {
        assert.equal(await page.locator('#modal-overlay [data-trade-filter]').count(), 4);
        for (const category of entry.pages[5].tradeCatalog.categories) {
          await page.locator(`[data-trade-filter="${category.id}"]`).click();
          assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), entry.pages[5].tradeCatalog.items.filter(i => i.category === category.id).length);
        }
        const beers = page.locator('#modal-overlay .trade-catalog-unavailable');
        assert.equal(await beers.count(), 2);
        for (let i = 0; i < 2; i++) {
          const beer = beers.nth(i);
          assert.match(await beer.locator('.trade-catalog-visual h3').evaluate(el => getComputedStyle(el).textDecorationLine), /line-through/);
          assert.equal(await beer.locator('.trade-catalog-image').evaluate(el => getComputedStyle(el).filter), 'grayscale(1)');
          assert.equal(await beer.locator('.trade-price-value').count(), 0);
          await beer.locator('[data-action="open-trade-item-card"]').click();
          assert.ok(await page.locator('dialog.trade-item-card').getByText('Derzeit nicht erhältlich', { exact: true }).isVisible());
          await page.keyboard.press('Escape'); await page.locator('dialog.trade-item-card').waitFor({ state: 'detached' });
        }
        await page.locator('#modal-overlay .trade-catalog-item:not(.trade-catalog-unavailable):visible [data-action="open-trade-item-card"]').click();
        assert.ok(await page.locator('dialog.trade-item-card').isVisible());
        await page.screenshot({ path: resolve(output, `${layout}-whisky-itemkarte.png`) });
        await page.keyboard.press('Escape'); await page.locator('dialog.trade-item-card').waitFor({ state: 'detached' });
        const broken = await page.locator('#modal-overlay .trade-catalog-image img').evaluateAll(async images => {
          await Promise.all(images.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
          return images.filter(i => !i.naturalWidth).map(i => i.src);
        });
        assert.deepEqual(broken, []);
      }
      if (index >= 7 && index < 10) {
        const thread = await page.evaluate(() => getCurrentCommentThreadId());
        await page.locator('#modal-overlay .session-intro-toggle').click();
        assert.ok(!await page.locator('#modal-overlay .session-stage-copy').isVisible());
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
        await page.locator('#modal-overlay .session-intro-toggle').click();
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
      await page.screenshot({ path: resolve(output, `${layout}-seite-${index + 1}.png`) });
    }
  }
  await page.goto(`${server.origin}/Stammb%C3%A4ume/tests/chart-quality-fixture.html`);
  const family = await page.evaluate(async () => {
    const { auditFamily } = await import('/Stammb%C3%A4ume/tests/chart-quality-fixture.js');
    // Family artwork URLs are authored relative to Stammbaum.html, one level above this geometry fixture.
    const base = document.createElement('base'); base.href = new URL('../', location.href).href; document.head.prepend(base);
    const result = await auditFamily('sept-cneacail');
    const images = [...document.querySelectorAll('#family-chart img')];
    await Promise.all(images.map(i => i.decode().catch(() => {})));
    return { ...result, brokenImages: images.filter(i => !i.naturalWidth).map(i => i.src) };
  });
  assert.ok(family.cardCount >= SEPT_CNEACAIL_FAMILY.persons.length);
  assert.deepEqual(family.issues, []);
  assert.deepEqual(family.brokenImages, []);
  await page.screenshot({ path: resolve(output, 'stammbaum.png') });
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ module: entry.id, pages: 11, scenes: 3, hierarchyTabs: 3, unavailableBeers: 2, itemCards: true, family, externalWrites: false, errors }, null, 2));
  console.log(JSON.stringify({ passed: true, output }));
} finally { await browser?.close(); await server.close(); }
