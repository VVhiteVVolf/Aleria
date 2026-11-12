import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import counties from '../modules/cenyr-navigation/counties.source.json' with { type: 'json' };

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '../../Stammbäume/node_modules/playwright-core/index.mjs');
const output = path.resolve(process.env.TERRITORY_REVIEW_OUTPUT || `diagnostics/territory-navigation-20261112/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const server = await startChartQualityServer(fileURLToPath(new URL('../../', import.meta.url)));
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
await context.route('**/*', route => {
  const request = route.request();
  return new URL(request.url()).origin === server.origin && request.method() === 'GET' ? route.continue() : route.abort();
});
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = [], screenshots = [], cases = [], measurements = [];
page.on('pageerror', error => errors.push(error.message));
const cenyr = '/Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html';
const county = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html';
const goto = url => page.goto(server.origin + url, { waitUntil: 'networkidle' });
async function capture(name, locator) {
  await locator.scrollIntoViewIfNeeded();
  const filename = path.join(output, name + '.png');
  await page.screenshot({ path: filename });
  screenshots.push(filename);
}
async function fits(label) {
  const result = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth > innerWidth + 1,
    entries: [...document.querySelectorAll('[data-directory-entry], .directory-toolbar, .territory-navigation-card')].filter(node => {
      if (!node.checkVisibility()) return false;
      const rect = node.getBoundingClientRect();
      return rect.left < -1 || rect.right > innerWidth + 1 || node.scrollWidth > node.clientWidth + 1;
    }).map(node => node.textContent.trim().slice(0, 100)),
  }));
  assert.deepEqual(result, { page: false, entries: [] }, label);
}

try {
  // The same static links must work with no JavaScript at all.
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  await staticContext.route('**/*', route => new URL(route.request().url()).origin === server.origin ? route.continue() : route.abort());
  const staticPage = await staticContext.newPage();
  await staticPage.goto(server.origin + cenyr);
  assert.equal(await staticPage.locator('.cenyr-counties a').count(), 9);
  await staticPage.locator('[data-territory-id="grafschaft-tal-der-milane"] img').click();
  assert.ok(decodeURI(staticPage.url()).includes('/Grafschaft Tal der Milane/Grafschaft Tal der Milane.html'));
  await staticContext.close();
  cases.push('Tal der Milane works without JavaScript');

  await goto(cenyr);
  for (const item of counties) {
    const link = page.locator(`[data-territory-id="${item.id}"]`);
    const href = await link.getAttribute('href');
    await link.locator('img').click();
    await page.waitForFunction(id => window.KONTINENTE_CONFIG?.registryEntry?.id === id, item.id);
    assert.equal(decodeURI(new URL(page.url()).pathname), href);
    await goto(cenyr);
    await page.locator(`[data-territory-id="${item.id}"] strong`).click();
    await page.waitForFunction(id => window.KONTINENTE_CONFIG?.registryEntry?.id === id, item.id);
    await goto(cenyr);
    cases.push(`${item.id}: banner and name clicks`);
  }
  const badImages = await page.locator('.territory-navigation img').evaluateAll(async images => {
    images.forEach(image => { image.loading = 'eager'; });
    return (await Promise.all(images.map(image => image.decode().then(() => null, () => image.src)))).filter(Boolean);
  });
  assert.deepEqual(badImages, []);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await fits(`Cenyr/${width}`);
    if ([1440, 390].includes(width)) await capture(`cenyr-${width}`, page.locator('.cenyr-counties nav'));
  }
  await goto('/Kontinente/index.html');
  await page.getByRole('link', { name: 'Kontinent Estryll öffnen', exact: true }).click();
  await page.waitForURL(url => decodeURI(url.pathname).endsWith('/Estryll/Estryll.html'));
  await page.locator('.realm-card').filter({ hasText: 'Königreich Cenyr' }).locator('img').click();
  await page.waitForFunction(() => window.KONTINENTE_CONFIG?.registryEntry?.id === 'koenigreich-cenyr');
  cases.push('Continent register → Estryll → Cenyr');

  for (const [id, url] of [['celtigerns', county], ['gwynthor', '/Orte/grossstadt.html?ort=gwynthor'], ['gafyr', '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Herrschaft der Gafyr/Herrschaft der Gafyr.html']]) {
    await goto(url);
    const houses = page.locator('.kingdom-family-card-view');
    await houses.locator('[data-directory-entry]').first().waitFor();
    const count = await houses.locator('[data-directory-entry]').count();
    assert.equal(await houses.getAttribute('data-directory-view'), count > 10 ? 'list' : 'cards', id);
    const original = await houses.locator('[data-directory-entry]').evaluateAll(nodes => nodes.map(node => [node.dataset.houseId, node.textContent, node.querySelector('.kingdom-family-name a')?.href]));
    const sizes = {};
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const view of ['list', 'cards']) {
        await houses.locator(`[data-view="${view}"]`).click();
        assert.equal(await houses.getAttribute('data-directory-view'), view);
        assert.equal(await houses.locator(`[data-view="${view}"]`).getAttribute('aria-pressed'), 'true');
        await fits(`${id}/${view}/${width}`);
        assert.deepEqual(await houses.locator('[data-directory-entry]').evaluateAll(nodes => nodes.map(node => [node.dataset.houseId, node.textContent, node.querySelector('.kingdom-family-name a')?.href])), original);
        sizes[`${width}/${view}`] = await houses.evaluate(node => Math.round(node.getBoundingClientRect().height));
        if ([1440, 390].includes(width) && id !== 'gafyr') await capture(`${id}-${view}-${width}`, houses.locator('.directory-toolbar'));
      }
    }
    measurements.push({ id, count, heights: sizes });
    if (count > 10) assert.ok(sizes['1440/list'] < sizes['1440/cards'], `${id}: list reduces the register height`);
    const search = houses.locator('[data-directory-query]');
    if (await search.count()) {
      await search.fill(id === 'celtigerns' ? 'rhyddid' : 'falchdyn');
      assert.equal(await houses.locator('[data-directory-entry]:visible').count(), 1);
      await houses.locator('[data-view="list"]').click();
      const previous = await houses.locator('.directory-toolbar').elementHandle();
      await page.evaluate(isCity => {
        if (isCity) document.dispatchEvent(new CustomEvent('aleria:orte:data-ready', { detail: { data: window.ORT_DATA } }));
        else window.dispatchEvent(new CustomEvent('aleria:kontinente:content-ready'));
      }, id === 'gwynthor');
      await page.waitForFunction(old => document.querySelector('.kingdom-family-card-view .directory-toolbar') !== old, previous);
      assert.equal(await houses.getAttribute('data-directory-view'), 'list');
      assert.equal(await houses.locator('[data-directory-entry]:visible').count(), 1);
      assert.equal(await houses.locator('.directory-view-controls').count(), 1);
      await page.emulateMedia({ media: 'print' });
      assert.equal(await houses.locator('[data-directory-entry]:visible').count(), count);
      assert.equal(await houses.locator('.directory-toolbar').isVisible(), false);
      await page.emulateMedia({ media: 'screen' });
      await houses.getByRole('button', { name: 'Zurücksetzen' }).click();
      assert.equal(await houses.locator('[data-directory-entry]:visible').count(), count);
      assert.equal(await houses.getAttribute('data-directory-view'), 'list');
    }
    await houses.locator('[data-view="cards"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await houses.getAttribute('data-directory-view'), 'cards');
    cases.push(`${id}: ${count} houses, four widths, both views, identical content/links, search, refresh, print, keyboard`);
  }

  const boundary = await page.evaluate(async () => {
    const { renderFamilySection } = await import('/Kontinente/modules/territory-directory/house-directory.mjs');
    const { mountDirectoryBrowser, directoryState } = await import('/Kontinente/modules/territory-directory/directory-browser.mjs?v=20261112a');
    const results = [];
    function render(count, state) {
      const root = document.createElement('div');
      root.className = 'kingdom-family-card-view territory-directory';
      for (const [title, length] of [['Erste Gruppe', Math.min(5, count)], ['Zweite Gruppe', Math.max(0, count - 5)]]) {
        if (length) root.append(renderFamilySection({ title, cards: Array.from({ length }, (_, i) => ({ name: `${title} ${i}`, rank: 'Bürgerlich' })) }));
      }
      mountDirectoryBrowser(root, { state });
      return root;
    }
    for (const count of [1, 7, 10, 11]) {
      const root = render(count);
      document.body.append(root);
      const initial = root.dataset.directoryView;
      root.querySelector('[data-view="list"]').click();
      const saved = directoryState(root);
      const refreshed = render(count, saved);
      const autoUpdated = render(11, directoryState(render(10)));
      results.push({ count, initial, selected: root.dataset.directoryView, refreshed: refreshed.dataset.directoryView, autoUpdated: autoUpdated.dataset.directoryView });
      root.remove();
    }
    return results;
  });
  for (const item of boundary) {
    assert.equal(item.initial, item.count > 10 ? 'list' : 'cards');
    assert.equal(item.selected, 'list');
    assert.equal(item.refreshed, 'list');
    assert.equal(item.autoUpdated, 'list', 'Automatic selection follows an asynchronously growing register');
  }
  cases.push('Real register controller: 1, 7, 10, 11 houses; total across groups; explicit and automatic refresh states');
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  await writeFile(path.join(output, 'report.json'), JSON.stringify({ status: 'passed', origin: server.origin, cases, measurements, boundary, screenshots, errors, network: 'Only local GET requests; fresh isolated browser context' }, null, 2));
  console.log(JSON.stringify({ output, cases: cases.length, screenshots: screenshots.length, measurements }));
} catch (error) {
  await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
  await writeFile(path.join(output, 'failure.json'), JSON.stringify({ error: error.stack, errors, cases, measurements }, null, 2));
  throw error;
} finally {
  await browser.close();
  await server.close();
}
