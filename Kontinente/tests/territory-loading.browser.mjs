import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  try {
    const filename = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    assert.ok(filename.startsWith(root + sep) && !filename.includes(`${sep}.git${sep}`));
    const body = await readFile(filename);
    response.writeHead(200, { 'Content-Type': `${types[extname(filename)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
    response.end(body);
  } catch { response.writeHead(404); response.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const county = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html';
const sourceSelector = '.kingdom-county-family-table, .kingdom-county-geography-table, .kingdom-council-table, table[data-administration-grid]';
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });

try {
  const initialContext = await browser.newContext({ javaScriptEnabled: false });
  await initialContext.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
  const initialPage = await initialContext.newPage();
  for (const path of [
    '/Kontinente/_template/KoenigreichTemplate.html',
    '/Kontinente/_template/GrafschaftTemplate.html',
    '/Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html',
    county,
    '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Baronie Gwendolyns Ufer/Baronie Gwendolyns Ufer.html',
  ]) {
    await initialPage.goto(origin + encodeURI(path));
    const sources = initialPage.locator(sourceSelector);
    assert.ok(await sources.count(), path);
    assert.ok(await sources.evaluateAll(tables => tables.every(table => table.hidden && !table.checkVisibility())), `${path}: source tables stay invisible without a renderer`);
  }
  await initialContext.close();
  // A late export must work even after the three-second administration fallback.
  for (const slowExport of [true, false]) {
    const context = await browser.newContext({ viewport: { width: slowExport ? 768 : 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let releaseAdapter;
    let releaseExport;
    const adapterGate = new Promise(done => { releaseAdapter = done; });
    const exportGate = new Promise(done => { releaseExport = done; });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin || route.request().method() !== 'GET') return route.abort();
      if (url.pathname.endsWith('/koenigreich.js')) await adapterGate;
      if (slowExport && url.pathname.endsWith('.inline-export.json')) await exportGate;
      return route.continue();
    });
    try {
      const navigation = page.goto(origin + encodeURI(county), { waitUntil: 'load' });
      await page.locator('.kingdom-county-geography-table').waitFor({ state: 'attached' });
      const initialSources = await page.locator(sourceSelector).evaluateAll(tables => tables.map(table => ({ hidden: table.hidden, visible: table.checkVisibility() })));
      assert.equal(initialSources.length, 4);
      assert.ok(initialSources.every(table => table.hidden && !table.visible), 'Old source tables are invisible before JavaScript renders the new view');
      assert.equal(await page.locator('.kingdom-family-card-view').count(), 0);
      releaseAdapter();
      await navigation;
      await page.locator('.administration-grid').waitFor();
      assert.equal(await page.locator('[data-administration-grid]').count(), 1, 'Administration keeps its original source for later exports');
      releaseExport();
      await page.locator('[data-repository-content="ready"]').waitFor();
      const gwynthor = page.getByRole('link', { name: 'Gwynthor', exact: true });
      await page.waitForFunction(() => {
        const links = [...document.querySelectorAll('.kingdom-county-card-view a')].filter(a => a.textContent.trim() === 'Gwynthor');
        return links.length === 1 && links[0].getAttribute('href') === '/Orte/grossstadt.html?id=gwynthor';
      });
      assert.equal(await page.locator('[data-house-id="haus-rhyddid"] .kingdom-family-name-link').innerText(), 'Rhyddid');
      assert.match(await page.locator('[data-house-id="haus-rhyddid"] .kingdom-family-name-link').getAttribute('href'), /haus=haus-rhyddid$/);
      const sourceImage = page.locator('.kingdom-county-family-table img[alt="Wappen Haus Rhyddid"]');
      assert.equal(await sourceImage.count(), 1, 'Export image indices still identify the correct house');
      assert.match(await sourceImage.locator('..').getAttribute('href'), /haus=haus-rhyddid$/);
      assert.equal(await page.locator('.kingdom-domain-title h3').first().innerText(), 'Gräfische Baronie Gwynthor - Llamreis Ankunft');
      assert.equal(await page.locator('.administration-grid').count(), 1);
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('aleria:kontinente:content-ready'));
        window.dispatchEvent(new CustomEvent('aleria:kontinente:content-ready'));
      });
      await page.waitForFunction(() => document.querySelectorAll('.kingdom-family-card').length === window.KONTINENTE_DATA.view.familySections.reduce((sum, section) => sum + section.cards.length, 0));
      assert.equal(await page.locator('.administration-grid').count(), 1, 'Repeated refreshes do not duplicate administration');
      assert.ok(await page.locator(sourceSelector).evaluateAll(tables => tables.every(table => table.hidden && !table.checkVisibility())));
      await gwynthor.click();
      await page.waitForURL(url => url.searchParams.get('id') === 'gwynthor');
      await page.waitForFunction(() => window.ORT_DATA?.meta?.id === 'gwynthor');
      assert.equal(await page.title(), 'Gwynthor - Aleria');
      const boardLink = page.getByRole('link', { name: 'Gwynthors Anzeigetafel vollständig öffnen', exact: true });
      assert.match(await boardLink.getAttribute('href'), /tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel/);
      assert.deepEqual(errors, []);
      console.log(`OK: ${slowExport ? 'late' : 'early'} export, hidden sources, house/image identity, Gwynthor navigation and notice board`);
    } finally {
      releaseAdapter();
      releaseExport();
      await context.close();
    }
  }
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
