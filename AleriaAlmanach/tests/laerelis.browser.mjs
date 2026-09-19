import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.LAERELIS_TEST_ORIGIN || 'http://127.0.0.1:4189';
const screenshots = process.env.LAERELIS_SCREENSHOTS;
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  // Keep this verification local; it must never write to Firebase or use a real session.
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  const failedAssets = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().includes('/laerelis/') && !response.ok()) failedAssets.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.evaluate(() => { openEntryById('laerelis-lichtfluss'); renderPage(0, 0); });
  assert.equal(await page.locator('.modal-page-tab').count(), 5);
  const cover = page.getByRole('img', { name: 'Laerelis', exact: true });
  const imageInfo = img => img.decode().then(() => ({
    width: img.naturalWidth, height: img.naturalHeight, fit: getComputedStyle(img).objectFit
  }));
  assert.deepEqual(await cover.evaluate(imageInfo), { width: 1024, height: 1536, fit: 'contain' });
  if (screenshots) await page.screenshot({ animations: 'disabled', path: `${screenshots}/01-introduction.png` });

  await page.locator('[data-modal-action="jump-page"][data-page-index="1"]').click();
  await page.locator('.language-page').waitFor();
  assert.equal(await page.locator('.language-description-section').count(), 12);
  assert.deepEqual(await page.locator('.language-alphabet-image-stage img').evaluate(imageInfo), { width: 1024, height: 1536, fit: 'contain' });
  if (screenshots) await page.screenshot({ animations: 'disabled', path: `${screenshots}/02-language.png` });

  await page.locator('[data-modal-action="jump-page"][data-page-index="2"]').click();
  await page.locator('.name-list-page').waitFor();
  assert.equal(await page.locator('.name-list-name').count(), 1800);
  const font = await page.locator('.ornament-laerelis').first().evaluate(async element => {
    await document.fonts.load('32px "Laerelis Lichtfluss"');
    return {
      family: getComputedStyle(element).fontFamily,
      loaded: [...document.fonts].some(face => face.family.replaceAll('"', '') === 'Laerelis Lichtfluss' && face.status === 'loaded'),
      text: element.textContent
    };
  });
  assert(font.family.includes('Laerelis Lichtfluss'));
  assert(font.loaded, 'the original Lichtfluss font must load');
  assert(/[\ue100-\ue118]/.test(font.text), 'ornaments must render the actual glyph codes');
  if (screenshots) await page.screenshot({ animations: 'disabled', path: `${screenshots}/03-names.png` });

  await page.locator('[data-modal-action="jump-page"][data-page-index="3"]').click();
  await page.locator('.script-table-page').waitFor();
  assert.equal(await page.locator('.script-table-grid:not(.script-table-syllables) tbody tr').count(), 25);
  assert.equal(await page.locator('.script-table-syllables tbody tr').count(), 400);
  if (screenshots) await page.screenshot({ animations: 'disabled', path: `${screenshots}/04-script.png` });

  await page.locator('[data-modal-action="jump-page"][data-page-index="4"]').click();
  await page.locator('.script-table-text').waitFor();
  assert.equal(await page.locator('.script-table-text tbody tr').count(), 1132);
  assert((await page.locator('.script-table-text').innerText()).includes('Funktionswort'));
  if (screenshots) await page.screenshot({ animations: 'disabled', path: `${screenshots}/05-dictionary.png` });

  const stored = await page.evaluate(() => {
    const exported = buildModuleExportPayload('laerelis-lichtfluss');
    const payload = getModuleStorePayload();
    payload.entryOverrides[exported.entry.id] = exported.entry;
    writeLocalModuleStorePayload(payload);
    return exported.entry.pages.map(item => item.nameList?.groups.reduce((sum, group) => sum + group.names.length, 0)
      || item.scriptTable?.rows.length || 0);
  });
  assert.deepEqual(stored, [0, 0, 1800, 25, 1132]);
  await page.reload();
  await page.evaluate(() => { openEntryById('laerelis-lichtfluss'); renderPage(4, 0); });
  assert.equal(await page.locator('.script-table-text tbody tr').count(), 1132);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-modal-action="jump-page"][data-page-index="0"]').click();
  await cover.waitFor();
  assert.deepEqual(await cover.evaluate(imageInfo), { width: 1024, height: 1536, fit: 'contain' });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  if (screenshots) await page.screenshot({ animations: 'disabled', path: `${screenshots}/mobile-introduction.png` });
  await page.locator('[data-modal-action="jump-page"][data-page-index="4"]').click();
  await page.locator('.script-table-text').waitFor();
  assert.equal(await page.locator('.script-table-text tbody tr').count(), 1132);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  if (screenshots) await page.screenshot({ animations: 'disabled', path: `${screenshots}/mobile-dictionary.png` });

  await page.evaluate(() => {
    const fixture = document.createElement('section');
    fixture.id = 'laerelis-bubble-test';
    fixture.innerHTML = buildCommentLanguageTextMarkup('Th DH sh nG · Laerelis', { language: 'laerelis' }, 'foreign', 'laerelis-check');
    document.querySelector('.script-table-header').prepend(fixture);
  });
  const bubble = page.locator('#laerelis-bubble-test .comment-language-toggle');
  const script = bubble.locator('.comment-language-script');
  const plain = bubble.locator('.comment-language-plain');
  await bubble.scrollIntoViewIfNeeded();
  assert(await script.isVisible());
  assert((await script.evaluate(element => getComputedStyle(element).fontFamily)).includes('Laerelis Lichtfluss'));
  await bubble.hover();
  assert(await plain.isVisible());
  assert.equal(await plain.innerText(), 'Th DH sh nG · Laerelis');
  await bubble.click();
  assert.equal(await bubble.getAttribute('aria-expanded'), 'true');
  await bubble.press('Enter');
  assert.equal(await bubble.getAttribute('aria-expanded'), 'false');

  assert.deepEqual(failedAssets, []);
  assert.deepEqual(errors, []);
  console.log('Laerelis: five pages; 1,800 names, 25 glyphs, 400 roots, 1,132 words; original font; both 2:3 scenes; navigation, export/reload and mobile PASS.');
  await context.close();
} finally {
  await browser.close();
}
