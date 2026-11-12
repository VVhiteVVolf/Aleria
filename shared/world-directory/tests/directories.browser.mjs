import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { startChartQualityServer } from '../../../Stammbäume/tools/chart-quality-server.mjs';
import { readWorldDirectorySources } from '../source-reader.mjs';
import { projectHouseDirectories } from '../house-projection.mjs';
import catalog from '../house-directories.generated.json' with { type: 'json' };

const { chromium } = await import('../../../Stammbäume/node_modules/playwright-core/index.mjs');
const sources = await readWorldDirectorySources();
const catalogHash = async () => createHash('sha256').update(await readFile(new URL('../house-directories.generated.json', import.meta.url))).digest('hex');
const initialCatalogHash = await catalogHash();
const output = path.resolve(process.env.WORLD_DIRECTORY_OUTPUT || `diagnostics/world-directory-audit-20261112/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const server = await startChartQualityServer(fileURLToPath(new URL('../../../', import.meta.url)));
let browser;
const results = [], screenshots = [], errors = [];
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === server.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  async function capture(name, target) {
    await target.evaluate(node => {
      const header = document.querySelector('.codex-masthead')?.getBoundingClientRect().height || 0;
      scrollTo({ top: scrollY + node.getBoundingClientRect().top - header - 12, behavior: 'instant' });
    });
    const unloaded = await target.locator('img').evaluateAll(async images => {
      images.forEach(image => { image.loading = 'eager'; });
      return (await Promise.all(images.map(image => image.decode().then(() => null, () => image.getAttribute('src'))))).filter(Boolean);
    });
    assert.deepEqual(unloaded, [], name + ': screenshot crests are decoded');
    const file = path.join(output, name + '.png');
    await page.screenshot({ path: file }); screenshots.push(file);
  }
  async function fits(label) {
    const report = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      clipped: [...document.querySelectorAll('[data-directory-entry], .directory-toolbar')].filter(node => {
        if (!node.checkVisibility()) return false;
        const box = node.getBoundingClientRect();
        return box.left < -1 || box.right > innerWidth + 1 || node.scrollWidth > node.clientWidth + 1;
      }).map(node => node.textContent.trim().slice(0,100)),
    }));
    assert.deepEqual(report, { overflow: false, clipped: [] }, label);
  }
  // All changed place projections, plus an unmodified registered place.
  for (const id of [...new Set([...Object.keys(catalog.places), 'craithglyn'])]) {
    const source = sources.places.find(place => place.id === id);
    const expected = projectHouseDirectories(source.content, id, 'places').houses || [];
    const expectedIds = expected.flatMap(group => group.items).map(card => card.familyId || '').sort();
    await page.goto(`${server.origin}/Orte/grossstadt.html?ort=${encodeURIComponent(id)}`, { waitUntil: 'networkidle' });
    const root = page.locator('[data-orte-houses]');
    await page.waitForFunction(ids => JSON.stringify([...document.querySelectorAll('[data-orte-houses] [data-directory-entry]')].map(node => node.dataset.houseId || '').sort()) === JSON.stringify(ids), expectedIds);
    const actual = await root.locator('.kingdom-family-name a').evaluateAll(links => links.map(a => a.getAttribute('href')));
    const expectedLinks = expected.flatMap(group => group.items).map(card => card.href || (card.familyId ? `/Stammbäume/Stammbaum.html?family=${encodeURIComponent(card.familyId)}&mode=view` : '')).filter(Boolean);
    assert.deepEqual(actual, expectedLinks, id + ': all direct links');
    const broken = await root.locator('img').evaluateAll(async images => {
      images.forEach(image => { image.loading = 'eager'; });
      return (await Promise.all(images.map(image => image.decode().then(() => null, () => image.getAttribute('src'))))).filter(Boolean);
    });
    assert.deepEqual(broken, [], id + ': directory crests load');
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await fits(`${id}/${width}`);
    }
    if (['gwynthor','lysfaen','goldmund-thronholt','bronhir','mwyncreig'].includes(id)) {
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await capture(`${id}-${width}`, root);
      }
    }
    if (id === 'gwynthor') {
      const search = root.locator('[data-directory-query]');
      for (const name of ['Aurdden','Gwniwr','Tirfelyn','Marchwern']) {
        await search.fill(name);
        assert.equal(await root.locator('[data-directory-entry]:visible').count(), 1, name);
      }
      await root.locator('[data-view="cards"]').click();
      await page.evaluate(() => document.dispatchEvent(new CustomEvent('aleria:orte:data-ready', { detail: { data: window.ORT_DATA } })));
      assert.equal(await search.inputValue(), 'Marchwern');
      assert.equal(await root.getAttribute('data-directory-view'), 'cards');
      await root.getByRole('button', { name: 'Zurücksetzen' }).click();
      const name = root.locator('[data-house-id="haus-aurdden"] .kingdom-family-name-link');
      await name.click();
      await page.waitForFunction(() => window.HAEUSER_DATA?.meta?.id === 'haus-aurdden');
      assert.equal(new URL(page.url()).searchParams.get('haus'), 'haus-aurdden');
    }
    results.push({ id, houses: expectedIds.length, kind: 'place', status: 'passed' });
    console.log(`OK place ${id}: ${expectedIds.length} entries, exact IDs/links, desktop/mobile`);
  }
  for (const id of ['grafschaft-celtigerns-wacht','herrschaft-wyrm','baronie-gwendolyns-ufer','grafschaft-tal-der-milane','grafschaft-graue-weite','jarltum-ivarsheim','fuerstentum-leitheach']) {
    const source = sources.territories.find(entry => entry.id === id);
    assert.ok(source, id);
    const expected = projectHouseDirectories(source.content, id, 'territories').view.familySections.flatMap(group => group.cards);
    await page.goto(server.origin + '/Kontinente/' + source.page, { waitUntil: 'networkidle' });
    await page.waitForFunction(ids => JSON.stringify([...document.querySelectorAll('.kingdom-family-card-view [data-directory-entry]')].map(node => node.dataset.houseId || '').sort()) === JSON.stringify(ids), expected.map(card => card.id || '').sort());
    for (const width of [1440,390,320]) { await page.setViewportSize({ width, height:1000 }); await fits(`${id}/${width}`); }
    if (id === 'grafschaft-celtigerns-wacht') {
      const root = page.locator('.kingdom-family-card-view');
      assert.equal(await root.getAttribute('data-directory-view'), 'list');
      assert.equal(await root.locator('.kingdom-family-featured [data-house-id="haus-draig"]').count(),1);
      for (const width of [1440,390]) { await page.setViewportSize({width,height:1000}); await capture(`${id}-${width}`,root); }
    }
    results.push({ id, houses: expected.length, kind: 'territory', status: 'passed' });
    console.log(`OK territory ${id}: ${expected.length} entries`);
  }
  for (const [url, selector] of [
    ['/Orte/grossstadt.html?ort=definitely-unknown', '.place-error'],
    ['/Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html?reich=definitely-unknown', '.kingdom-error'],
    ['/Familien Häuser und Clans/haus.html?haus=definitely-unknown', '.haeuser-error'],
  ]) {
    await page.goto(server.origin + url, { waitUntil:'networkidle' });
    await page.locator(selector).waitFor();
    assert.equal(await page.locator('[data-directory-entry]').count(),0,'Unknown ID cannot display a different place');
    results.push({url,status:'passed',kind:'unknown ID'});
  }
  await page.goto(server.origin + '/Orte/grossstadt.html?ort=gwynthor#geschichte', {waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>window.ORT_DATA.meta.id),'gwynthor');
  const count = await page.locator('[data-orte-houses] [data-directory-entry]').count();
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('aleria:orte:data-ready',{detail:{data:{...window.ORT_DATA,houses:[]}}})));
  assert.equal(await page.locator('[data-orte-houses] [data-directory-entry]').count(),0);
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('aleria:orte:data-ready',{detail:{data:window.ORT_DATA}})));
  assert.equal(await page.locator('[data-orte-houses] [data-directory-entry]').count(),count);
  await page.goto(server.origin + '/Orte/grossstadt.html?ort=mwyncraig', {waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>window.ORT_DATA.meta.id),'mwyncreig');
  assert.equal(await page.locator('[data-house-id="haus-rhyddid"]').count(),1);
  const missingContext = await browser.newContext();
  await missingContext.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== server.origin || request.method() !== 'GET' || /haus\.data\.js$/.test(url.pathname)) return route.abort();
    return route.continue();
  });
  const missing = await missingContext.newPage();
  await missing.goto(server.origin + '/Familien Häuser und Clans/kleinehaeuser.html?haus=haus-aurdden', {waitUntil:'networkidle'});
  await missing.getByText('Die Hausdaten konnten nicht geladen werden.',{exact:true}).waitFor();
  assert.equal(await missing.evaluate(()=>window.HAEUSER_DATA),null);
  await missingContext.close();
  assert.deepEqual(errors,[]);
  assert.equal(await catalogHash(),initialCatalogHash,'The actual catalog stayed byte-identical during browser review');
  await writeFile(path.join(output,'report.json'),JSON.stringify({status:'passed',catalogSha256:initialCatalogHash,results,screenshots,errors,network:'Local GET only; own fresh browser; original sources',coverage:{registeredPlaces:sources.places.length,registeredTerritories:sources.territories.length,registeredHouses:sources.houses.length}},null,2));
  console.log(JSON.stringify({output,cases:results.length,screenshots:screenshots.length}));
} catch(error) {
  await writeFile(path.join(output,'failure.json'),JSON.stringify({error:error.stack,results,errors},null,2));
  throw error;
} finally { await browser?.close(); await server.close(); }
