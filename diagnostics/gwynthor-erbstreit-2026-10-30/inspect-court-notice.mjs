import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const server = await startChartQualityServer(fileURLToPath(new URL('../../', import.meta.url)));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const root = 'gwynthor-gwrgan-gegen-lleucu';
const ids = [root, `${root}-klage`, `${root}-erwiderung`, `${root}-gerichtsordnung`];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [], missing = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.url().startsWith(server.origin) && r.status() >= 400) missing.push(r.url()); });
  await page.route('**/*', route => new URL(route.request().url()).origin === server.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
  await page.goto(server.origin + '/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel', { waitUntil: 'networkidle' });
  await page.locator(`.notice-register-entry[data-notice-id="${root}"]`).waitFor();
  await page.screenshot({ path: fileURLToPath(new URL('court-board.png', import.meta.url)) });
  await page.locator(`.notice-register-entry[data-notice-id="${root}"]`).click();
  await page.locator('#scroll-mo.open').waitFor();
  assert.equal(await page.locator('#notice-stack-nav option').count(), 4);
  const results = [];
  for (const [index, id] of ids.entries()) {
    await page.locator('#notice-stack-nav select').selectOption(id);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.querySelectorAll('#scroll-content img')].map(img => img.decode().catch(() => {}))); });
    const result = await page.locator('#scroll-content').evaluate(el => ({
      overflowX: el.scrollWidth > el.clientWidth + 1,
      brokenImages: [...el.querySelectorAll('img')].filter(img => !img.naturalWidth).map(img => img.src),
      signature: [...el.querySelectorAll('img')].filter(img => /unterschrift/.test(img.src)).length,
      text: el.innerText
    }));
    assert.equal(result.overflowX, false); assert.deepEqual(result.brokenImages, []); assert.equal(result.signature, 1);
    results.push({ id, overflowX: result.overflowX, brokenImages: result.brokenImages, characters: result.text.length });
    await page.screenshot({ path: fileURLToPath(new URL(`court-page-${index+1}.png`, import.meta.url)) });
    await page.locator('#scroll-content .notice-signature').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('#scroll-content .notice-signature').isVisible(), true);
    if (index === 1) await page.screenshot({ path: fileURLToPath(new URL('court-signature.png', import.meta.url)) });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of ids) {
    await page.locator('#notice-stack-nav select').selectOption(id);
    assert.equal(await page.locator('#scroll-content').evaluate(el => el.scrollWidth > el.clientWidth + 1), false);
  }
  await page.screenshot({ path: fileURLToPath(new URL('court-mobile.png', import.meta.url)) });
  assert.deepEqual(missing, []); assert.deepEqual(errors, []);
  await writeFile(new URL('court-browser.json', import.meta.url), JSON.stringify({ pages: results, mobile: '390 × 844 · all four pages without horizontal overflow', missing, errors }, null, 2));
  console.log(JSON.stringify({ pages: results, mobile: true, missing, errors }, null, 2));
} finally { await browser.close(); await server.close(); }
