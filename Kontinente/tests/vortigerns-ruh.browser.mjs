import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DIRECTORY_TEST_ORIGIN || 'http://127.0.0.1:5500';
const base = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Vortigerns Ruh/';
const registryContext = { window: {} };
vm.runInNewContext(await fs.readFile(new URL('../kontinente.registry.js', import.meta.url), 'utf8'), registryContext);
const entries = registryContext.window.KONTINENTE_REGISTRY.filter(entry => entry.page.includes('Grafschaft Vortigerns Ruh/'));
const sourceManifest = JSON.parse(await fs.readFile(new URL('../docs/vortigerns-ruh/sources.json', import.meta.url)));
const expectedHouses = [16, 2, 1, 1, 3, 1, 1, 1];
const browser = await chromium.launch({ headless: true });
const artifacts = process.env.DIRECTORY_SCREENSHOTS || '.tmp/vortigerns-ruh';
await fs.mkdir(artifacts, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  for (const [index, entry] of entries.entries()) {
    await page.goto(origin + '/Kontinente/' + entry.page, { waitUntil: 'networkidle' });
    await page.locator('.kingdom-family-card-view').waitFor();
    assert.equal(await page.locator('.kingdom-section-heading').count(), 9, `${entry.id}: all nine chapters`);
    assert.equal(await page.locator('.kingdom-family-card').count(), expectedHouses[index], `${entry.id}: territorial family selection`);
    assert.equal(await page.locator('.kingdom-family-card.is-family-featured').count(), 1, `${entry.id}: separate ruling house`);
    assert.equal(await page.locator('[data-herrschaft-administration] button').count(), 8);
    await page.locator('[data-herrschaft-administration] button').first().click();
    const administration = page.locator('.administration-dialog');
    await administration.locator('[data-role="administration-dialog-body"]:not([aria-busy])').waitFor();
    assert.equal(await administration.locator('.herrschaft-person-card').count(), 0, `${entry.id}: no administration inherited from another county`);
    await administration.locator('[data-action="close-administration"]').click();
    const paragraphs = await page.evaluate(() => [...document.querySelectorAll('.herrschaft-copy > p')].map(p => p.textContent));
    const source = await fs.readFile(new URL('../docs/vortigerns-ruh/' + sourceManifest[index].file, import.meta.url), 'utf8');
    const sourceParagraphs = await page.evaluate(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const outer = doc.querySelector('table');
      return [...doc.querySelectorAll('p')].filter(p => p.closest('table') === outer)
        .map(p => p.textContent.replace(/[\s\u200b]+/g, ' ').trim())
        .filter(text => text.length > 4 && !/^\d[.)]/.test(text));
    }, source);
    for (const text of sourceParagraphs) assert.ok(paragraphs.includes(text), `${entry.id}: retained source paragraph: ${text.slice(0, 65)}`);
    const brokenImages = await page.locator('main img').evaluateAll(async images => {
      await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
      return images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src);
    });
    assert.deepEqual(brokenImages, [], `${entry.id}: local images load`);
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${entry.id}/${width}: no page overflow`);
      const toolbar = page.locator('[data-herrschaft-geography] .directory-toolbar');
      if (await toolbar.count()) {
        await toolbar.locator('input').fill('unbekannter-prüfort');
        assert.equal(await page.locator('[data-herrschaft-geography] [data-directory-entry]:visible').count(), 0);
        await toolbar.locator('input').fill('');
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    if (index === 0) {
      assert.equal(await page.locator('[data-herrschaft-geography] [data-directory-entry]').count(), 47, 'Every coordinate appears once in the county register');
      assert.equal(await page.locator('.directory-place-description').count(), 42, 'All supplied descriptions are reachable in the place register');
      const place = page.locator('.kingdom-place-card').filter({hasText:'Mwyncarreg'});
      await place.locator('summary').click();
      assert.ok((await place.locator('.directory-place-description p').textContent()).includes('Ton und Kalkstein'));
      assert.equal(await place.locator('a[href*="family=haus-penderyn"]').count(), 1);
      await place.locator('summary').click();
      await page.locator('[data-herrschaft-council]').screenshot({ path: artifacts + '/council.png' });
      await page.locator('.kingdom-family-card-view').screenshot({ path: artifacts + '/houses.png' });
      await page.locator('[data-herrschaft-geography]').screenshot({ path: artifacts + '/geography.png' });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: artifacts + '/county-desktop.png' });
      await page.setViewportSize({ width: 390, height: 900 });
      await page.screenshot({ path: artifacts + '/county-mobile.png' });
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    console.log(`${entry.id}: text, houses, portraits and four widths passed`);
  }
  const countyCouncil = await page.goto(origin + base + 'Grafschaft Vortigerns Ruh.html', { waitUntil: 'networkidle' }).then(() => readRoyalCouncil(page));
  await page.goto(origin + '/Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html', { waitUntil: 'networkidle' });
  assert.deepEqual(await readRoyalCouncil(page), countyCouncil, 'Kingdom and county have identical council names, offices, images and links');
  assert.equal(countyCouncil.length, 10);
  assert.ok(await page.locator('a[href*="Grafschaft%20Vortigerns%20Ruh"]').count());

  await page.goto(origin + '/Karten/karte.html?map=cenyr-vortigerns-ruh', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.KartoRuntime?.state().pins.length === 47);
  assert.equal(await page.evaluate(() => window.KARTO_BOOT_STATUS), 'active');
  const source = JSON.parse(await fs.readFile(new URL('../../Karten/Cenyr/vortigerns-ruh/markers.source.json', import.meta.url)));
  const pins = await page.evaluate(() => window.KartoRuntime.state().pins);
  assert.equal(pins.filter(pin=>pin.text).length,42);
  assert.deepEqual(await page.evaluate(()=>[window.KartoRuntime.state().dotSize,window.KartoRuntime.state().lblSize]),[80,50]);
  for (const marker of source.markers) {
    const pin = pins.find(p => p.id === marker.id);
    assert.ok(Math.abs(pin.x * 4096 - marker.x) < 1e-6);
    assert.ok(Math.abs((1 - pin.y) * 2208 - marker.y) < 1e-6);
    assert.equal(pin.templateId, marker.templateId);
    assert.equal(pin.pinMarker, marker.icon);
  }
  for (const layer of ['normal', 'regions', 'pins']) {
    await page.locator(`[data-action="set-layer"][data-layer="${layer}"]`).click();
    await page.waitForFunction(layer => [...document.images].some(image => image.src.endsWith(`/Kartenbilder/${layer}.webp`) && image.complete && image.naturalWidth === 4096), layer);
    await page.screenshot({ path: artifacts + `/map-${layer}.png` });
  }
  assert.equal(await page.locator('.pin').count(), 47);
  await page.locator('[data-id="vortigern-mathragon"] .pin-marker-img').click();
  await page.locator('#scroll-mo.open').waitFor();
  assert.equal(await page.locator('#pin-detail-title').textContent(), 'Mathragon');
  await page.evaluate(()=>window.KartoRuntime.openPin('vortigern-mwyncarreg','view'));
  assert.equal(await page.locator('#pin-detail-title').textContent(),'Mwyncarreg');
  assert.ok((await page.locator('#scroll-mo .sv-text').textContent()).includes('Ton und Kalkstein'));
  const heraldry=await page.locator('#scroll-mo .sv-header img').evaluateAll(images=>images.map(image=>image.getAttribute('src')));
  assert.ok(heraldry.some(src=>src.endsWith('/haus-penderyn.png')));
  assert.ok(heraldry.some(src=>src.endsWith('/Herrschaft der Penderyn.png')));
  await page.locator('#scroll-mo .pin-card').screenshot({path:artifacts+'/mwyncarreg-details.png'});
  assert.deepEqual(errors, [], 'No browser exceptions');
  console.log('Shared royal council and all 47 map markers/layers passed');
} finally { await browser.close(); }

async function readRoyalCouncil(page) {
  const group = page.locator('.herrschaft-person-group').filter({ has: page.getByRole('heading', { name: 'Königlicher Rat', exact: true }) });
  await group.waitFor();
  return group.locator('.herrschaft-person-card').evaluateAll(cards => cards.map(card => ({
    office: card.querySelector('.herrschaft-person-office').textContent,
    name: card.querySelector('.herrschaft-person-name').textContent,
    image: card.querySelector('img').getAttribute('src'),
    href: card.querySelector('.herrschaft-person-name a')?.getAttribute('href') || '',
  })));
}
