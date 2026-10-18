import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildGwregysduHarbor } from '../modules/gwregysdu-harbor/harbor-module.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, `.tmp/gwregysdu-research/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const entry = buildGwregysduHarbor();
const hierarchy = entry.pages[2].hierarchy;
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
  assert.equal(await page.evaluate(e => getPages(e).length, entry), 8);
  assert.deepEqual(await page.evaluate(h => sanitizeHierarchyData(h).trees.map(t => t.levels.map(l => l.nodes.length)), hierarchy), hierarchy.trees.map(t => t.levels.map(l => l.nodes.length)));
  const imagesLoaded = async selector => {
    const broken = await page.locator(selector).evaluateAll(async images => {
      const local = images.filter(i => /gwregysdu-harbor|Gwregysdu\.png|Fraktionen|haus-falveri/.test(i.src));
      await Promise.all(local.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
      return local.filter(i => !i.naturalWidth).map(i => i.src);
    });
    assert.deepEqual(broken, []);
  };
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(viewport);
    for (let index = 0; index < 8; index++) {
      await page.evaluate(({ entry, index }) => { closeModal(); openModal(entry, { pageIndex: index }); }, { entry, index });
      await page.locator('#modal-overlay').waitFor({ state: 'visible' });
      await imagesLoaded('#modal-overlay img');
      if (index === 1) {
        const text = await page.locator('#modal-overlay').innerText();
        for (const word of ['Madog', 'Gleißende Hand', 'Selvor', 'Falveri']) assert.ok(text.includes(word));
      }
      if (index === 2) {
        const tabs = page.locator('#modal-overlay [data-hierarchy-tree-tab]');
        assert.equal(await tabs.count(), hierarchy.trees.length);
        for (let tree = 0; tree < hierarchy.trees.length; tree++) {
          await tabs.nth(tree).click();
          const panel = page.locator('#modal-overlay [data-hierarchy-tree-panel].active');
          assert.equal(await panel.locator('.hierarchy-node-card').count(), hierarchy.trees[tree].levels.reduce((n, l) => n + l.nodes.length, 0));
          await imagesLoaded('#modal-overlay [data-hierarchy-tree-panel].active img');
          if ([0, 2, 3].includes(tree)) await page.screenshot({ path: resolve(output, `${layout}-hierarchie-${tree}.png`) });
        }
      }
      if (index >= 4 && index < 7) {
        const intro = page.locator('#modal-overlay .session-stage-copy');
        assert.ok(await intro.isVisible());
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
  // Exercise the actual house-biography renderer in its own Stammbäume base URL.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${server.origin}/Stammb%C3%A4ume/tests/chart-quality-fixture.html`);
  await page.evaluate(async () => {
    const { HOUSE_GWREGYSDU_FAMILY: family } = await import('../assets/js/data/house-gwregysdu-family.js');
    const { renderHouseBiography } = await import('../assets/js/modules/house-biography/house-biography-renderer.js');
    const base = document.createElement('base'); base.href = new URL('../', location.href).href; document.head.append(base);
    document.body.innerHTML = renderHouseBiography({ family, biographyModule: family.extensions.houseBiographyModule });
  });
  await imagesLoaded('img');
  assert.ok(await page.locator('body').innerText().then(t => t.includes('Godwyn Doeth')));
  await page.screenshot({ path: resolve(output, 'stammbaum-hausbio.png') });
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ module: entry.id, pages: 8, scenes: 3, hierarchyTabs: hierarchy.trees.length, externalWrites: false, errors }, null, 2));
  console.log(JSON.stringify({ passed: true, output }));
} finally { await browser?.close(); await server.close(); }
