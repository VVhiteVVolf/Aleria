import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.NIMUITEN_TEST_ORIGIN || 'http://127.0.0.1:4189';
const screenshots = process.env.NIMUITEN_SCREENSHOTS;
const source = JSON.parse(await readFile(new URL('../kulte/nimuiten/eintrag.json', import.meta.url), 'utf8'));
const expectedImages = source.almanach.pages.map(page => `../Religionen/${page.scene}`);
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [], failedAssets = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (/nimuiten|lore-disclosure/.test(response.url()) && !response.ok()) failedAssets.push(response.url()); });
  const screenshot = async name => { if (screenshots) await page.screenshot({ animations: 'disabled', path: `${screenshots}/${name}.png` }); };
  const imageInfo = img => img.decode().then(() => ({ width: img.naturalWidth, height: img.naturalHeight, fit: getComputedStyle(img).objectFit }));

  await page.goto(`${origin}/Religionen/index.html`);
  assert.match(await page.locator('.cover-colophon').innerText(), /10 Religionen/);
  await page.locator('[data-role="chapter-filter"]').selectOption('kulte');
  await page.locator('[data-role="search"]').fill('Iorwerth Prys');
  const card = page.locator('#entry-nimuiten');
  assert(await card.isVisible());
  assert(!(await card.innerText()).includes('Thraal'));
  assert.equal(await page.locator('.faith-card:visible').count(), 1);
  await card.locator('img').evaluate(img => img.decode());
  await card.scrollIntoViewIfNeeded();
  await screenshot('01-religionsregister');
  await card.locator('a').click();
  await page.waitForURL('**/Religionen/kulte/nimuiten/index.html');
  assert.equal(await page.locator('h1').innerText(), 'Die Nimuiten');
  assert.equal(await page.locator('.profile-prose > .profile-section').count(), 16);
  const portrait = page.locator('.profile-cover img');
  assert.equal((await portrait.evaluate(imageInfo)).height, 1536);
  await screenshot('02-religionsseite');
  const disclosure = page.locator('.lore-disclosure');
  assert.equal(await disclosure.getAttribute('open'), null);
  assert(!(await disclosure.locator('div').isVisible()));
  await disclosure.locator('summary').focus();
  await page.keyboard.press('Enter');
  assert(await disclosure.locator('div').isVisible());
  assert((await disclosure.innerText()).includes('Thraal ist weder Nimue'));
  await screenshot('03-spielleitungswissen');
  await page.keyboard.press('Enter');
  assert(!(await disclosure.locator('div').isVisible()));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await screenshot('04-religionsseite-mobil');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.evaluate(() => switchTab('Religion'));
  await page.locator('[data-archive-action="open-entry"][data-entry-id="nimuiten"]').first().click();
  assert.equal(await page.locator('.modal-page-tab').count(), 8);
  const scene = page.getByRole('img', { name: 'Die Nimuiten', exact: true });
  for (let index = 0; index < 8; index++) {
    await page.locator(`[data-modal-action="jump-page"][data-page-index="${index}"]`).click();
    // Navigation replaces the page after its outgoing animation, not during click().
    await page.locator(`.modal-page-tab[data-page-index="${index}"][aria-current="page"]`).waitFor();
    assert.equal(await scene.getAttribute('src'), expectedImages[index]);
    assert.deepEqual(await scene.evaluate(imageInfo), { width: 1024, height: 1536, fit: 'contain' });
    await screenshot(`almanach-${index + 1}`);
  }
  const exported = await page.evaluate(() => {
    const exported = buildModuleExportPayload('nimuiten');
    const payload = getModuleStorePayload();
    payload.entryOverrides[exported.entry.id] = exported.entry;
    writeLocalModuleStorePayload(payload);
    return exported.entry;
  });
  assert.equal(exported.pages.length, 8);
  assert(exported.pages[7].description.includes('Thraal ist weder Nimue'));
  await page.reload();
  await page.evaluate(() => openEntryById('nimuiten'));
  assert.equal(await page.locator('.modal-page-tab').count(), 8);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const index of [0, 3, 7]) {
    await page.evaluate(index => jumpToPage(index), index);
    await page.locator(`.modal-page-tab[data-page-index="${index}"][aria-current="page"]`).waitFor();
    assert.equal(await scene.getAttribute('src'), expectedImages[index]);
    assert.deepEqual(await scene.evaluate(imageInfo), { width: 1024, height: 1536, fit: 'contain' });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await screenshot(`almanach-mobil-${index + 1}`);
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(failedAssets, []);
  console.log('Nimuiten browser PASS: catalog search/filter, profile, keyboard disclosure, eight pages, local export/reload, desktop/mobile images.');
} finally { await browser.close(); }
