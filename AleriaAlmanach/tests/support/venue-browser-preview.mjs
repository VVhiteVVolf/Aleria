import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../../Stammbäume/tools/chart-quality-server.mjs';
/** A local preview that blocks all external writes and uses no live account. */
export async function openVenueBrowserPreview(name) {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const output = resolve(root, `.tmp/${name}/browser-${Date.now()}`);
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
    return { page, origin: server.origin, output, errors,
      async openPage(entry, index) {
        await page.evaluate(({ entry, index }) => { closeModal(); openModal(entry, { pageIndex: index }); }, { entry, index });
        await page.locator('#modal-overlay').waitFor({ state: 'visible' });
      },
      async decodeImages(selector) {
        const broken = await page.locator(selector).evaluateAll(async images => {
          await Promise.all(images.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
          return images.filter(i => !i.naturalWidth).map(i => i.src);
        });
        assert.deepEqual(broken, []);
      },
      capture: name => page.screenshot({ path: resolve(output, `${name}.png`) }),
      async close() { await browser.close(); await server.close(); }
    };
  } catch (error) { await browser?.close(); await server.close(); throw error; }
}
