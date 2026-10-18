import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DIRECTORY_TEST_ORIGIN || 'http://127.0.0.1:5500';
const browser = await chromium.launch({ headless: true, ignoreDefaultArgs: ['--hide-scrollbars'] });
const artifacts = process.env.DIRECTORY_SCREENSHOTS || '.tmp/reading-panels';
await mkdir(artifacts, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    // The original empty bar occurred when this shell followed the table adapter.
    if (url.pathname.endsWith('/herrschaft-page.js')) await new Promise(done => setTimeout(done, 250));
    return route.continue();
  });
  await page.goto(origin + '/Familien Häuser und Clans/kleinehaeuser.html?haus=haus-rhyddid', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelectorAll('.codex-reading-column').length === 2);
  const originalCopy = await page.locator('main').textContent();
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    await assertPairedColumns(page, 2);
    const overview = page.locator('.codex-reading-column').first();
    await overview.focus();
    await page.keyboard.press('PageDown');
    await page.waitForFunction(() => document.querySelector('.codex-reading-column').scrollTop > 20);
    await overview.evaluate(node => { node.scrollTop = node.scrollHeight; });
    const tail = await overview.evaluate(node => {
      const end = node.lastElementChild.getBoundingClientRect();
      return end.bottom <= node.getBoundingClientRect().bottom + 2;
    });
    assert.ok(tail, `End of overview reachable at ${width}`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.haeuser-landscape-slot').evaluate(node => { node.style.height = '440px'; });
  await page.waitForFunction(() => Math.abs(document.querySelector('.codex-reading-column').getBoundingClientRect().bottom - document.querySelector('.haeuser-landscape-slot').getBoundingClientRect().bottom) <= 2);
  await page.locator('.haeuser-landscape-slot').evaluate(node => { node.style.removeProperty('height'); });
  await page.evaluate(() => { location.hash = 'traditionen'; });
  await page.waitForFunction(() => {
    const heading = document.getElementById('traditionen').getBoundingClientRect();
    const column = document.getElementById('traditionen').closest('.codex-reading-column').getBoundingClientRect();
    return heading.top >= column.top - 2 && heading.bottom <= column.bottom + 2;
  });
  for (const id of ['besitztum', 'kultur-religion']) {
    assert.equal(await page.locator('#' + id).evaluate(node => !!node.closest('.codex-reading-column')), false, `Chapter ${id} remains outside scroll panels`);
  }
  await page.evaluate(() => { location.hash = ''; scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: artifacts + '/rhyddid-desktop.png' });
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForFunction(() => !document.querySelector('.codex-reading-column'));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await assertPairedColumns(page, 2);
  await page.emulateMedia({ media: 'print' });
  await page.waitForFunction(() => !document.querySelector('.codex-reading-column'));
  assert.equal(await page.locator('main').textContent(), originalCopy, 'Complete text preserved in print and responsive layouts');
  await page.emulateMedia({ media: 'screen' });

  const county = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/';
  await page.goto(origin + county + 'Herrschaft der Wyrm/Herrschaft der Wyrm.html', { waitUntil: 'networkidle' });
  await page.locator('.kingdom-family-card-view').waitFor();
  assert.deepEqual(await page.locator('.is-family-card-source, .is-county-card-source').evaluateAll(tables => tables.filter(table => table.getBoundingClientRect().height > 0).map(table => table.className)), [], 'No empty legacy table bar after delayed shell creation');
  await page.goto(origin + county + 'Grafschaft Celtigerns Wacht.html', { waitUntil: 'networkidle' });
  await page.locator('.kingdom-place-card').first().waitFor();
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const brokenLabels = await page.locator('.kingdom-place-card dt').evaluateAll(labels => labels.filter(label => label.getBoundingClientRect().height > parseFloat(getComputedStyle(label).lineHeight) + 2).map(label => label.textContent));
    assert.deepEqual(brokenLabels, [], `Unbroken place labels at ${width}`);
  }
  assert.deepEqual(errors, []);
  console.log('Reading panels: matched heights, keyboard/end access, resizing, chapter anchors, mobile, print, unbroken labels and delayed table cleanup passed');
} finally { await browser.close(); }

async function assertPairedColumns(page, count) {
  await page.waitForFunction(expected => document.querySelectorAll('.codex-reading-column').length === expected, count);
  const mismatch = await page.locator('.codex-reading-column').evaluateAll(columns => columns.filter(column => {
    const reference = column.nextElementSibling.querySelector('.haeuser-landscape-slot, .haeuser-info-table');
    return Math.abs(column.getBoundingClientRect().bottom - reference.getBoundingClientRect().bottom) > 2;
  }).map(column => column.querySelector('h2').textContent));
  assert.deepEqual(mismatch, []);
}
