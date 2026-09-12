import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// Mit einem isolierten Playwright-Browser aufrufen; verändert keine Projektdaten.
export async function runAstrologyBrowserChecks(browser, { origin = 'http://127.0.0.1:5500', screenshotDirectory } = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  try {
    await page.goto(`${origin}/Astrologie/index.html`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-role="sky-form"]').isVisible(), true);
    assert.equal(await page.locator('[data-role="zodiac-card"]').count(), 19);
    assert.equal(await page.locator('[data-role="zodiac-theme-image"]').count(), 40);
    assert.equal(await page.locator('[data-role="zodiac-placeholder"]').count(), 0);
    for (const image of await page.locator('[data-role="zodiac-theme-image"]').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(image => image.decode());
      assert.ok(await image.evaluate(image => image.naturalWidth > 0));
    }
    await page.locator('[name="year"]').fill('1');
    await page.locator('[name="month"]').selectOption('1');
    await page.locator('[name="day"]').fill('9');
    await page.getByRole('button', { name: 'Den Himmel lesen' }).click();
    assert.match(await page.locator('.sky-visitors').innerText(), /Nimue · Widersacher: Thraal/);
    await page.locator('[name="month"]').selectOption('11');
    await page.getByRole('button', { name: 'Den Himmel lesen' }).click();
    assert.match(await page.locator('.sky-sign').innerText(), /Tethyra/);
    assert.match(await page.locator('.sky-sign').innerText(), /Nhaera/);
    if (screenshotDirectory) {
      await mkdir(screenshotDirectory, { recursive: true });
      await page.locator('#anfang').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${screenshotDirectory}/desktop-cover.png` });
    }
    await page.locator('[data-role="zodiac-search"]').fill('Witwe');
    assert.equal(await page.locator('#zodiac-grid .zodiac-card:visible').count(), 1);
    await page.locator('[data-role="zodiac-filter"]').selectOption('lesser');
    assert.equal(await page.locator('[data-role="zodiac-empty"]').isVisible(), true);
    await page.getByRole('button', { name: 'Alle Zeichen zeigen' }).click();
    await page.locator('[data-role="zodiac-filter"]').selectOption('lesser');
    assert.equal(await page.locator('#zodiac-grid .zodiac-card:visible').count(), 5);

    await page.locator('[name="year"]').fill('2000');
    await page.locator('[name="month"]').selectOption('13');
    await page.locator('[name="day"]').fill('36');
    await page.getByRole('button', { name: 'Den Himmel lesen' }).click();
    assert.match(await page.locator('[data-role="sky-reading"]').innerText(), /Drachennacht: Ordan und Adar/);
    assert.match(page.url(), /year=2000/);
    await page.reload({ waitUntil: 'networkidle' });
    assert.match(await page.locator('[data-role="sky-reading"]').innerText(), /Drachennacht: Ordan und Adar/);
    await page.locator('[name="day"]').fill('37');
    await page.getByRole('button', { name: 'Den Himmel lesen' }).click();
    assert.equal(await page.locator('[name="day"]').evaluate(input => input.validity.rangeOverflow), true);
    assert.match(await page.locator('[data-role="sky-reading"]').innerText(), /Drachennacht: Ordan und Adar/);

    await page.getByRole('button', { name: 'Zum Weltdatum' }).click();
    assert.equal(await page.locator('[name="year"]').inputValue(), '1740');
    assert.equal(await page.locator('[name="month"]').inputValue(), '3');
    assert.equal(await page.locator('[name="day"]').inputValue(), '9');
    await page.locator('[data-role="zodiac-search"]').fill('Witwe');
    await page.locator('[data-role="sky-reading"] [data-action="reveal-sign"]').click();
    assert.equal(await page.locator('#zeichen-maldras details').evaluate(details => details.open), true);
    assert.equal(await page.locator('#zodiac-grid .zodiac-card:visible').count(), 13);

    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Seitenüberlauf bei ${width}px`);
      if (screenshotDirectory && [390, 1440].includes(width)) {
        await page.locator('#firmament').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${screenshotDirectory}/sky-${width}.png` });
        await page.locator('#jahreskreis').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${screenshotDirectory}/cards-${width}.png` });
      }
    }
    await page.goto(`${origin}/Astrologie/index.html?year=2000&month=14&day=1`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-role="sky-error"]').isVisible(), true);
    await page.evaluate(() => localStorage.setItem('aleria.current-world-date.v1', JSON.stringify({ year: 1780, month: 2, day: 5 })));
    await page.getByRole('button', { name: 'Zum Weltdatum' }).click();
    assert.equal(await page.locator('[name="year"]').inputValue(), '1780');
    assert.match(await page.locator('[data-role="sky-reading"]').innerText(), /Mariel/);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }

  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJsPage = await noJsContext.newPage();
    await noJsPage.goto(`${origin}/Astrologie/index.html`, { waitUntil: 'load' });
    assert.equal(await noJsPage.locator('[data-role="sky-form"]').isVisible(), false);
    assert.equal(await noJsPage.locator('[data-role="zodiac-tools"]').isVisible(), false);
    assert.equal(await noJsPage.locator('[data-role="zodiac-card"]:visible').count(), 19);
    await noJsPage.locator('#zeichen-tharim summary').click();
    assert.equal(await noJsPage.locator('#zeichen-tharim details').getAttribute('open'), '');
  } finally { await noJsContext.close(); }
  return 'Browserprüfung erfolgreich: 19 Karten mit Themenbildern, alle 19 Widersacher, Suche/Filter, Datumsabfrage, Drachennacht, URL-Wiederherstellung, Weltdatum, fünf Bildschirmbreiten und Ansicht ohne JavaScript.';
}
