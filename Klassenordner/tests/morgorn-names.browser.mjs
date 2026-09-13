import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.MORGORN_TEST_ORIGIN || 'http://127.0.0.1:4189';
const screenshots = process.env.MORGORN_SCREENSHOTS;
const terms = JSON.parse(await readFile(new URL('../../AleriaAlmanach/modules/language/morgar/reference/morgorn-terminology.json', import.meta.url), 'utf8'));
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/Klassenordner/Klassenseite.html#morgorn`);
  const summary = page.locator('#morgorn .class-lore summary');
  await summary.click();
  assert.deepEqual(await page.locator('#morgorn .class-lore dt').allTextContents(), terms.nobleTitles.map(term => {
    const subtitles = { 'Ar Darak': 'Hochkönig Morgorns', Taldar: 'Großer Territorialherr', Kardar: 'Festungsherr', Dundar: 'Hallen- und Lokalherr', Nardar: 'Sippenherr' };
    return `${term.name} · ${subtitles[term.name]}`;
  }));
  if (screenshots) await page.locator('#morgorn').screenshot({ path: `${screenshots}/morgorn-catalog.png` });
  for (const term of terms.classes) {
    const card = page.locator(`#klasse-morgorn-${term.id}`);
    assert.equal(await card.locator('.class-name').innerText(), term.name);
    await card.click();
    await page.getByRole('heading', { level: 1, name: `Der ${term.name}`, exact: true }).waitFor();
    assert(page.url().endsWith(`/Morgorn/${term.id}/index.html`));
    assert.equal(await page.locator('[data-culture-order], #gesellschaftsordnung, a[href="#gesellschaftsordnung"]').count(), 0);
    assert.equal(await page.locator('[data-role="training-level"]').count(), 1);
    const visible = await page.locator('body').innerText();
    for (const old of [...terms.nobleTitles, ...terms.classes]) assert(!new RegExp(`\\b${old.previousName}\\b`).test(visible), `${term.name}: old name ${old.previousName}`);
    if (screenshots && term.id === 'rheach') await page.screenshot({ path: `${screenshots}/rhean-desktop.png` });
    if (term.id === 'garnach') {
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.locator('[data-culture-order], a[href="#gesellschaftsordnung"]').count(), 0);
      if (screenshots) await page.screenshot({ path: `${screenshots}/falgar-mobile.png` });
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.locator('.site-header a[href$="#morgorn"]').click();
    await page.locator('#morgorn .class-lore').waitFor();
  }
  assert.deepEqual(errors, []);
  console.log('Morgorn catalog + all eight class pages: accepted names, stable links, no repeated society block/navigation; desktop and mobile PASS.');
} finally { await browser.close(); }
