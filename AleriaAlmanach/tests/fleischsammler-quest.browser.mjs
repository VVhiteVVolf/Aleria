import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '../../Stammbäume/node_modules/playwright-core/index.mjs');
const origin = process.env.QUEST_TEST_ORIGIN || 'http://127.0.0.1:4199';
const shots = process.env.QUEST_SCREENSHOTS || '../diagnostics/fleischsammler-quest-20261102';
await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true,
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results = [];
try {
  for (const viewport of [{ width: 1440, height: 1100 }, { width: 430, height: 1000 }]) {
    const context = await browser.newContext({ viewport });
    let allowFamilySdk = false;
    await context.route('**/*', async route => {
      const url = route.request().url();
      if (url.startsWith(origin + '/Stammb%C3%A4ume/Stammbaum.html') || url.startsWith(origin + '/Stammbäume/Stammbaum.html')) {
        const response = await route.fetch();
        await route.fulfill({ response, body: (await response.text()).replace('<head>', '<head><meta name="aleria-firebase-enabled" content="false">') });
      } else if (url.startsWith(origin + '/')) await route.continue();
      else if (allowFamilySdk && url.startsWith('https://www.gstatic.com/firebasejs/')) {
        const response = await fetch(url);
        await route.fulfill({ status: response.status, contentType: 'application/javascript',
          headers: { 'access-control-allow-origin': '*' }, body: Buffer.from(await response.arrayBuffer()) });
      }
      else await route.abort();
    });
    const page = await context.newPage();
    const errors = [];
    const requestFailures = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    const id = 'notice:cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel:gwynthor-fleischsammler';
    await page.goto(`${origin}/AleriaAlmanach/quests.html?quest=${encodeURIComponent(id)}`, { waitUntil: 'domcontentloaded' });
    const dialog = page.locator('[data-quest-detail]');
    await dialog.waitFor({ state: 'visible' });
    await page.locator('.quest-cast-card').first().locator('img').evaluate(image => image.decode());
    assert.equal(await dialog.locator('.quest-cast-card').count(), 4);
    assert.equal(await dialog.locator('.quest-source-families article').count(), 8);
    assert.equal(await dialog.locator('.quest-area svg circle').count(), 9);
    assert.equal(await dialog.locator('.quest-area ol li').count(), 7);
    assert.equal(await dialog.locator('.quest-route-option').count(), 0);
    assert.equal(await dialog.locator('.quest-cast-card a').count(), 4);
    const text = await dialog.innerText();
    assert.match(text, /Neithon Draig/); assert.match(text, /Meredydd Gwyllach/); assert.match(text, /Sir Ferydnand Gafyr/);
    assert.match(text, /Rhydric Argall/);
    assert.doesNotMatch(text, /Gwenella|Maelor Ffionydd|geschieden|durchgebrannt/iu);
    assert.doesNotMatch(text, /Bettler|Landstreicher|Geliebte|Skelett|Ritual|Gottheit|Stimmen|Erdrossel|Organe|Hautpartien|Lleian|Catrin Bragwen|Gwenith/iu);
    for (const image of await dialog.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(image => image.decode());
    }
    const size = await dialog.evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth }));
    assert.ok(size.scroll <= size.width + 1, JSON.stringify(size));
    await dialog.locator('.quest-cast-heading').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${shots}/contacts-${viewport.width}.png`, animations: 'disabled' });
    await dialog.locator('.quest-area').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${shots}/area-${viewport.width}.png`, animations: 'disabled' });
    await dialog.locator('.quest-information-sources').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${shots}/sources-${viewport.width}.png`, animations: 'disabled' });
    if (viewport.width > 1000) await dialog.locator('.quest-information-sources').screenshot({ path: `${shots}/family-sources.png`, animations: 'disabled' });
    assert.deepEqual(errors, []);
    if (viewport.width > 1000) {
      const profile = await dialog.locator('.quest-source-families h4 a').first().getAttribute('href');
      allowFamilySdk = true;
      await page.goto(origin + profile, { waitUntil: 'domcontentloaded' });
      try {
        await page.locator('#family-title').filter({ hasText: 'Familie Ysgellfor' }).waitFor({ timeout: 15000 });
      } catch (error) {
        await writeFile(`${shots}/family-load-failure.json`, JSON.stringify({ errors, requestFailures,
          title: await page.locator('#family-title').innerText(), body: (await page.locator('body').innerText()).slice(0, 3000) }, null, 2));
        throw error;
      }
      await page.locator('#family-emblem-button').click();
      const familyBiography = page.locator('#house-biography-dialog');
      await familyBiography.waitFor({ state: 'visible' });
      assert.match(await familyBiography.innerText(), /Madog Ysgellfor/);
      assert.match(await familyBiography.innerText(), /Vorräte/);
      for (const image of await familyBiography.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(image => image.decode());
      }
      await page.screenshot({ path: `${shots}/family-ysgellfor.png`, animations: 'disabled' });
      await page.goto(`${origin}/Stammb%C3%A4ume/Stammbaum.html?family=haus-argall&mode=view&person=rhydric-argall`, { waitUntil: 'domcontentloaded' });
      await page.locator('#family-title').filter({ hasText: 'Haus Argall' }).waitFor();
      for (const name of ['Rhydric Argall', 'Perwyn Argall', 'Gwenella']) {
        const card = page.locator('#family-chart .aleria-person-card').filter({ has: page.locator('.family-card-name').filter({ hasText: new RegExp(`^${name}$`) }) });
        assert.equal(await card.count(), 1, name);
        await card.locator('img.aleria-person-card__portrait').evaluate(image => image.decode());
      }
      const chart = page.locator('#family-chart');
      assert.match(await chart.innerText(), /Geschieden/);
      await page.screenshot({ path: `${shots}/family-argall.png`, animations: 'disabled' });
      await page.locator('[data-action="fit-chart"]').last().click();
      const motherCard = page.locator('#family-chart .aleria-person-card').filter({ has: page.locator('.family-card-name').filter({ hasText: /^Gwenella$/ }) });
      await motherCard.locator('.family-card-name').click();
      const matrix = page.locator('#relationship-matrix-dialog');
      await matrix.waitFor({ state: 'visible' });
      for (const name of ['Rhydric Argall', 'Perwyn Argall', 'Gwenella', 'Maelor Ffionydd']) assert.match(await matrix.innerText(), new RegExp(name));
      assert.match(await matrix.innerText(), /Affäre/);
      assert.match(await matrix.innerText(), /Durchgebrannt nach Aberon/);
      for (const image of await matrix.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(image => image.decode());
      }
      await page.screenshot({ path: `${shots}/family-argall-relationships.png`, animations: 'disabled' });
      assert.deepEqual(errors, []);
    }
    results.push({ viewport, contacts: 4, places: 7, familySources: 8, allImagesLoaded: true, noHorizontalOverflow: true });
    await context.close();
  }
  await writeFile(`${shots}/browser-verification.json`, JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
