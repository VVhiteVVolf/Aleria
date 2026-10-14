import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, `.tmp/krumme-kanne/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const entry = JSON.parse(await readFile(resolve(root, 'Charakter Archiv Exporte/Module/Krumme Kanne/krumme-kanne-2026-10-14.json'), 'utf8')).module.entry;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const file = resolve(root, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
    const local = relative(root, file);
    if (local.startsWith('..') || local.startsWith('.') || isAbsolute(local)) throw new Error('Outside public workspace');
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end('Not found'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1848, height: 1100 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => typeof openModal === 'function');
  await page.waitForFunction(() => ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state), { timeout: 25000 });
  if (await page.locator('[data-loading-action="enter"]').isEnabled()) await page.locator('[data-loading-action="enter"]').click();
  else await page.locator('[data-loading-action="continue"]').click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  const show = async index => {
    await page.evaluate(({ entry, index }) => { closeModal(); openModal(entry, { pageIndex: index }); }, { entry, index });
    try { await page.locator('#modal-overlay').waitFor({ state: 'visible' }); }
    catch (error) {
      console.log(await page.locator('#modal-overlay').evaluate(el => { const result=[]; for(let n=el;n;n=n.parentElement){const s=getComputedStyle(n);result.push({tag:n.tagName,id:n.id,display:s.display,visibility:s.visibility,rect:n.getBoundingClientRect().toJSON()});} return result; }));
      await page.screenshot({ path: resolve(output, 'failure.png') });
      throw error;
    }
  };
  const loadedArtwork = async () => {
    await page.evaluate(async () => {
      const images = [...document.querySelectorAll('#modal-overlay img')].filter(i => i.src.includes('/assets/krumme-kanne/') || i.src.includes('/IconOrdner/') || i.src.includes('/assets/brewer-guilds/'));
      await Promise.all(images.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
    });
    const broken = await page.locator('#modal-overlay img').evaluateAll(images => images.filter(i => /\/assets\/krumme-kanne\/|\/IconOrdner\/|\/assets\/brewer-guilds\//.test(i.src) && !i.naturalWidth).map(i => i.src));
    assert.deepEqual(broken, []);
  };
  await show(0); await loadedArtwork();
  await page.screenshot({ path: resolve(output, '01-nachtansicht.png') });
  await show(1); await loadedArtwork();
  assert.match(await page.locator('#modal-overlay').innerText(), /Aus Feldkameraden werden Wirte/i);
  assert.match(await page.locator('#modal-overlay').innerText(), /Rorikshall/);
  await page.screenshot({ path: resolve(output, '02-biografie.png') });
  await show(2);
  const tabs = page.locator('#modal-overlay [data-hierarchy-tree-tab]');
  assert.equal(await tabs.count(), 6);
  for (let i = 0; i < 6; i++) {
    await tabs.nth(i).click();
    assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active').count(), 1);
    assert.equal(await tabs.nth(i).getAttribute('aria-selected'), 'true');
    await loadedArtwork();
    if ([0, 1, 5].includes(i)) await page.screenshot({ path: resolve(output, `03-hierarchie-${i}.png`) });
  }
  await show(3);
  assert.equal(await page.locator('#modal-overlay .trade-note-icon').innerText(), '♧');
  assert.equal(await page.locator('#modal-overlay .trade-catalog-item').count(), 44);
  assert.equal(await page.locator('#modal-overlay .goods-product-row').count(), 0);
  await page.locator('#modal-overlay [data-trade-filter="getranke"]').click();
  assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), 10);
  await page.locator('#modal-overlay [data-trade-filter="speisen"]').click();
  assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), 11);
  await page.locator('#modal-overlay [data-trade-filter="besonderes-menu"]').click();
  assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), 15);
  assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').first().locator('.trade-catalog-description p').count(), 3);
  await loadedArtwork();
  await page.screenshot({ path: resolve(output, '04-speisen.png') });
  await page.locator('#modal-overlay [data-trade-filter="importierte-getraenke"]').click();
  assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), 8);
  await loadedArtwork();
  await page.screenshot({ path: resolve(output, '05-importe.png') });
  await page.locator('#modal-overlay [data-trade-filter="all"]').click();
  assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), 44);
  for (let i = 5; i < 10; i++) { await show(i); await loadedArtwork(); }
  for (const slug of ['trevoryn', 'svathamar', 'dubhdarach']) {
    await page.goto(`${origin}/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=haus-${slug}`);
    await page.waitForFunction(id => window.HAEUSER_DATA?.meta?.id === id, `haus-${slug}`);
    assert.match(await page.locator('body').innerText(), /Krumme Kanne/);
    const loaded = await page.locator('img').evaluateAll(async images => {
      const own = images.filter(i => /\/B(?:%C3%BC|ü)rgerliche\/Gwynthor\/(?:Trevoryn|Svathamar|Dubhdarach)\.png/.test(decodeURI(i.src)));
      await Promise.all(own.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
      return own.length > 0 && own.every(i => i.naturalWidth > 0);
    });
    assert.equal(loaded, true, `house crest ${slug}`);
    await page.screenshot({ path: resolve(output, `06-haus-${slug}.png`) });
  }
  await page.goto(`${origin}/Orte/grossstadt.html?ort=gwynthor`);
  for (const slug of ['trevoryn', 'svathamar', 'dubhdarach']) await page.locator(`[data-orte-houses] a[href*="family=haus-${slug}"]`).first().waitFor();
  await page.goto(`${origin}/Kontinente/Estryll/K%C3%B6nigreich%20Cenyr/Grafschaft%20Celtigerns%20Wacht/Grafschaft%20Celtigerns%20Wacht.html`);
  for (const slug of ['trevoryn', 'svathamar', 'dubhdarach']) await page.locator(`a[href*="haus=haus-${slug}"]`).first().waitFor();
  await context.close();
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: true, pages: 10, hierarchyTabs: 6, houseDishes: 15, imports: 8, localArtworkLoaded: true, productionRequestsBlocked: true }, null, 2));
  console.log(`PASS: 10 pages, 6 working hierarchy tabs, 15 house dishes, 8 imports, all new artwork and CK icons load. Screenshots: ${output}`);
} finally { await browser?.close(); await new Promise(done => server.close(done)); }
