// Run against the local static server. Playwright may be supplied via environment
// instead of adding a dependency to this static website.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DIRECTORY_TEST_ORIGIN || 'http://127.0.0.1:5500';
const county = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/';
const screenshotDir = process.env.DIRECTORY_SCREENSHOTS;
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}),
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    // Exercise async shell creation while the legacy adapter loads first.
    if (url.pathname.endsWith('/herrschaft-page.js')) await new Promise(done => setTimeout(done, 150));
    if (url.pathname.endsWith('.inline-export.json')) await new Promise(done => setTimeout(done, 200));
    return route.continue();
  });

  async function load(path, count) {
    await page.goto(origin + path, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(expected => document.querySelectorAll('.territory-directory .kingdom-family-card').length === expected, count);
    if (path.endsWith('/Grafschaft Celtigerns Wacht.html')) {
      await page.locator('[data-repository-content="ready"]').waitFor();
    }
  }

  for (const [path, count] of [
    ['Grafschaft Celtigerns Wacht.html', 37],
    ['Baronie Gwendolyns Ufer/Baronie Gwendolyns Ufer.html', 18],
    ['Baronie Arthus Streben/Baronie Arthus Streben.html', 15],
    ['Herrschaft Rhonwens Tränen/Herrschaft Rhonwens Tränen.html', 9],
    ['Herrschaft der Gafyr/Herrschaft der Gafyr.html', 3],
    ['Herrschaft der Saethwyr/Herrschaft der Saethwyr.html', 3],
    ['Herrschaft der Wyrm/Herrschaft der Wyrm.html', 13],
    ['Insel Camruisge/Insel Camruisge.html', 2],
  ]) {
    await load(county + path, count);
    await page.locator('.territory-council .herrschaft-person-card').first().waitFor();
    await page.locator('.kingdom-infobox.is-territory-infobox').waitFor();
    assert.equal(await page.locator('.kingdom-family-meta-rank').count(), count, `${path}: rank on every house`);
    const unavailable = await page.locator('.territory-directory img').evaluateAll(async images => {
      for (const image of images) image.loading = 'eager';
      const loaded = await Promise.all(images.map(image => image.decode().then(() => null, () => image.src)));
      return loaded.filter(Boolean);
    });
    assert.deepEqual(unavailable, [], `${path}: directory images load locally`);
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      const layout = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.territory-directory .kingdom-family-card, .territory-directory .kingdom-place-card')];
        return {
          overflowing: cards.filter(card => { const r = card.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth + 1 || card.scrollWidth > card.clientWidth + 1; }).map(card => card.innerText),
          heights: [...document.querySelectorAll('.kingdom-family-grid')].map(grid => [...grid.children].map(card => Math.round(card.getBoundingClientRect().height))),
        };
      });
      assert.deepEqual(layout.overflowing, [], `${path} at ${width}px`);
      for (const heights of layout.heights) assert.equal(new Set(heights).size, 1, `${path}: equal house-card heights`);
      const panels = await page.evaluate(() => {
        const box = document.querySelector('.kingdom-infobox').getBoundingClientRect();
        const overlaps = [...document.querySelectorAll('.territory-council .herrschaft-person-card')].filter(card => {
          const image = card.querySelector('img').getBoundingClientRect();
          const name = card.querySelector('.herrschaft-person-name').getBoundingClientRect();
          const bounds = card.getBoundingClientRect();
          return image.bottom > name.top + 1 || bounds.right > innerWidth + 1 || bounds.left < 0;
        }).map(card => card.innerText);
        return { box: { width: box.width, left: box.left, right: box.right }, overlaps };
      });
      assert.deepEqual(panels.overlaps, [], `${path}: portraits fit above names at ${width}px`);
      assert.ok(panels.box.left >= 0 && panels.box.right <= width + 1, `${path}: infobox fits`);
      if (width === 1440) {
        assert.equal(panels.box.width, 360, 'Sidebar keeps its desktop width');
        assert.ok(panels.box.left > width / 2, 'Infobox stays on the right');
      }
    }
    console.log(`OK ${count} Häuser · ${path} · 1440/768/390 px`);
  }

  await load(county + 'Grafschaft Celtigerns Wacht.html', 37);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const section = page.locator('.kingdom-family-section').first();
  const featured = section.locator('.kingdom-family-featured .kingdom-family-card');
  assert.equal(await featured.count(), 1);
  assert.equal(await featured.getAttribute('data-house-id'), 'haus-draig');
  assert.match(await featured.innerText(), /Grafenhaus[\s\S]*Draig[\s\S]*Lehnsherr[\s\S]*Haus Pendrag/);
  await section.scrollIntoViewIfNeeded();
  const lord = await featured.boundingBox();
  const container = await section.boundingBox();
  const vassals = await section.locator('.kingdom-family-grid').boundingBox();
  assert.ok(Math.abs(lord.x + lord.width / 2 - container.x - container.width / 2) < 1, 'Draig centered');
  assert.ok(lord.y + lord.height < vassals.y, 'Draig on a separate level');
  assert.equal(await section.locator('.kingdom-family-grid .kingdom-family-card').count(), 6);
  assert.ok((await section.locator('.kingdom-family-grid .kingdom-family-card').first().boundingBox()).height <= 105, 'Compact regular entries including rank');

  const tlawd = page.locator('[data-house-id="haus-tlawd"]');
  assert.equal(await tlawd.locator('.kingdom-family-meta-seat dd').innerText(), 'Gwynthor');
  assert.equal(await tlawd.locator('.kingdom-family-meta-liege dd').innerText(), 'Gafyr');
  assert.equal(await page.locator('[data-house-id="haus-gelyn"] .kingdom-family-meta-rank dd').innerText(), 'Ritterherrenhaus');
  assert.equal(await page.locator('.territory-council .herrschaft-person-card').count(), 19, 'All county council members retained');
  const galahad = page.locator('.territory-council .herrschaft-person-name a').filter({ hasText: 'Galahad Draig' });
  assert.match(await galahad.getAttribute('href'), /family=haus-draig/);
  assert.equal(await page.locator('.kingdom-council-table').isVisible(), false, 'Only the modern council is visible');
  const brokenCouncilImages = await page.locator('.territory-council img').evaluateAll(async images => {
    for (const image of images) image.loading = 'eager';
    return (await Promise.all(images.map(image => image.decode().then(() => null, () => image.src)))).filter(Boolean);
  });
  assert.deepEqual(brokenCouncilImages, [], 'County portraits use available local images');
  for (const card of [featured, tlawd]) {
    const name = card.locator('.kingdom-family-name-link');
    const crest = card.locator('.kingdom-family-crest a');
    assert.equal(await name.getAttribute('href'), await crest.getAttribute('href'));
    const href = new URL(await name.getAttribute('href'), origin);
    assert.ok(href.searchParams.get('haus'));
    assert.equal((await page.request.get(href.href)).status(), 200);
    await name.focus();
    assert.ok(await name.evaluate(node => document.activeElement === node), 'Name reachable by keyboard');
  }

  if (screenshotDir) {
    await section.screenshot({ path: resolve(screenshotDir, 'grafenhaus-desktop.png') });
    await page.locator('.kingdom-family-section').nth(1).screenshot({ path: resolve(screenshotDir, 'ritterhaeuser-desktop.png') });
    await page.locator('.kingdom-domain-card').first().screenshot({ path: resolve(screenshotDir, 'siedlungen-desktop.png') });
    await page.locator('.territory-council').first().screenshot({ path: resolve(screenshotDir, 'politik-desktop.png') });
    await page.locator('.kingdom-infobox').screenshot({ path: resolve(screenshotDir, 'infobox-desktop.png') });
    await page.setViewportSize({ width: 390, height: 1000 });
    await section.screenshot({ path: resolve(screenshotDir, 'grafenhaus-mobil.png') });
  }

  // Refreshes after applying an inline export must not duplicate cards or change links.
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('aleria:kontinente:content-ready')));
  await page.waitForFunction(() => document.querySelectorAll('.territory-directory .kingdom-family-card').length === 37);
  await tlawd.locator('.kingdom-family-crest a').click();
  await page.waitForURL(url => url.searchParams.get('haus') === 'haus-tlawd');
  assert.match(page.url(), /kleinehaeuser\.html/);

  // Old table-based templates use the same labeled renderer as current territory data.
  await page.goto(origin + '/Kontinente/_template/GrafschaftTemplate.html', { waitUntil: 'domcontentloaded' });
  await page.locator('.territory-directory .kingdom-family-card').first().waitFor();
  assert.ok(await page.locator('.kingdom-family-meta dt').count());
  assert.ok(await page.locator('.kingdom-domain-card .kingdom-place-card').count());
  assert.equal(await page.locator('.territory-council .herrschaft-person-card').count(), 19);
  assert.ok(await page.locator('.kingdom-infobox.is-territory-infobox').count());
  await page.goto(origin + '/Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html', { waitUntil: 'domcontentloaded' });
  const offices = page.locator('.territory-council .council-section-link');
  await offices.waitFor();
  assert.match(await offices.getAttribute('href'), /aemter\.html/, 'The royal offices icon keeps its navigation');
  assert.deepEqual(errors, [], 'No JavaScript errors');
  console.log('OK Grafenebene, Ränge, Ratsportraits, Infobox, Links, Tastatur, gespeicherte Inhalte und Altvorlage');
} finally {
  await browser.close();
}
