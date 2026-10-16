import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { planNixeCharacters } from '../modules/lachende-nixe/nixe-characters.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, `.tmp/lachende-nixe/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const entry = JSON.parse(await readFile(resolve(root, 'Charakter Archiv Exporte/Module/Lachende Nixe/lachende-nixe-2026-10-16.json'), 'utf8')).module.entry;
const source = JSON.parse(await readFile(resolve(root, 'AleriaAlmanach/modules/lachende-nixe/sources/module-before-finalization.json'), 'utf8')).entry;
const references = JSON.parse(await readFile(resolve(root, 'AleriaAlmanach/assets/lachende-nixe/references/sources.json'), 'utf8'));
const server = await startChartQualityServer(root);
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1848, height: 1100 }, reducedMotion: 'reduce' });
  await context.route('**/*', async route => {
    const url = route.request().url();
    if (new URL(url).origin === server.origin) return route.continue();
    const reference = references.images.find(item => item.url === url);
    if (reference) return route.fulfill({ contentType: 'image/png', body: await readFile(resolve(root, `AleriaAlmanach/assets/lachende-nixe/references/${reference.key}.png`)) });
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.setDefaultTimeout(15000);
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => typeof openModal === 'function');
  await page.waitForFunction(() => ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state), { timeout: 25000 });
  const enter = page.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  const show = async index => {
    await page.evaluate(({ entry, index }) => { closeModal(); openModal(entry, { pageIndex: index }); }, { entry, index });
    await page.locator('#modal-overlay').waitFor({ state: 'visible' });
    const broken = await page.locator('#modal-overlay img').evaluateAll(async images => {
      const own = images.filter(image => /\/assets\/lachende-nixe\/|\/IconOrdner\//.test(image.src));
      await Promise.all(own.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
      return own.filter(image => !image.naturalWidth).map(image => image.src);
    });
    assert.deepEqual(broken, []);
  };
  await show(0); await page.screenshot({ path: resolve(output, '01-hafenansicht.png') });
  await show(1);
  assert.match(await page.locator('#modal-overlay').innerText(), /Dagorath Sonnenfels/);
  assert.match(await page.locator('#modal-overlay').innerText(), /Rosalinde/);
  await page.screenshot({ path: resolve(output, '02-inhaber.png') });
  await show(2);
  const tabs = page.locator('#modal-overlay [data-hierarchy-tree-tab]');
  assert.equal(await tabs.count(), 6);
  for (let index = 0; index < 6; index++) {
    await tabs.nth(index).click();
    assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active').count(), 1);
    assert.equal(await tabs.nth(index).getAttribute('aria-selected'), 'true');
    await page.screenshot({ path: resolve(output, `03-personal-${index}.png`) });
  }
  await show(3);
  assert.equal(await page.locator('#modal-overlay .trade-catalog-item').count(), 41);
  assert.equal(await page.locator('#modal-overlay .goods-product-row').count(), 0);
  for (const [category, count] of [['hauskarte', 7], ['weine', 7], ['importe', 6], ['speisen', 11], ['getranke', 10]]) {
    await page.locator(`#modal-overlay [data-trade-filter="${category}"]`).click();
    assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), count);
    if (['hauskarte', 'weine'].includes(category)) await page.screenshot({ path: resolve(output, `04-${category}.png`) });
  }
  await show(4);
  assert.equal(await page.locator('#modal-overlay .guild-service-card').count(), 14);
  assert.match(await page.locator('#modal-overlay .guild-services-page').innerText(), /36 Nächte/);
  await page.screenshot({ path: resolve(output, '05-services.png') });
  await show(5);
  assert.equal(await page.locator('#modal-overlay .guest-register-entry').count(), 20);
  await page.screenshot({ path: resolve(output, '05-hausbuch.png') });
  for (let index = 6; index < 11; index++) {
    await show(index);
    await page.screenshot({ path: resolve(output, `06-raum-${index}.png`) });
  }
  const kanne = JSON.parse(await readFile(resolve(root, 'Charakter Archiv Exporte/Module/Krumme Kanne/krumme-kanne-2026-10-14.json'), 'utf8')).module.entry;
  await page.evaluate(entry => { closeModal(); openModal(entry, { pageIndex: 4 }); }, kanne);
  assert.equal(await page.locator('#modal-overlay .guild-service-card').count(), 11);
  const brokenKanneIcons = await page.locator('#modal-overlay .guild-service-card img').evaluateAll(async images => {
    await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
    return images.filter(image => !image.naturalWidth).map(image => image.src);
  });
  assert.deepEqual(brokenKanneIcons, []);
  await page.screenshot({ path: resolve(output, '08-kanne-services.png') });
  const plan = planNixeCharacters(source, [], {});
  const count = await page.evaluate(plan => {
    closeModal(); _characters = plan.entries.map(item => ({ id: item.id, ...item.data }));
    _charTabs = ['Alle', ...plan.config.tabs]; _charTabMap = plan.config.map;
    _charSubtabs = plan.config.subtabs; _charSubtabMap = plan.config.subtabMap;
    _activeCharTab = 'Die Lachende Nixe'; _activeCharSubtab = 'Alle'; setCharacterRegisterViewMode('collections');
    return getCharsForActiveTab().length;
  }, plan);
  assert.equal(count, 28);
  assert.equal(await page.locator('#char-grid .char-card').count(), 28);
  await page.screenshot({ path: resolve(output, '07-charakterverzeichnis.png') });
  await context.close();
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: true, pages: 11, tabs: 6, offers: 45, items: 41, services: 14, kanneServices: 11, guests: 20, profiles: 28, productionRequestsBlocked: true }, null, 2));
  console.log(`PASS: elf Seiten, sechs Personalreiter, 41 Waren, 14 Services, 20 Gästeplätze und 28 Profile. ${output}`);
} finally { await browser?.close(); await server.close(); }
