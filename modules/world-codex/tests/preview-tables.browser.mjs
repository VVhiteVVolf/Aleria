// Preview regressions: reference tables must not depend on the optional design layer.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DIRECTORY_TEST_ORIGIN || 'http://127.0.0.1:5500';
const screenshots = process.env.DIRECTORY_SCREENSHOTS;
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const pagePath = '/Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html';
try {
  for (const mode of ['normal', 'design-unavailable', 'scripts-unavailable', 'preview-prefix']) {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'scripts-unavailable', viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) return route.abort();
      if (['design-unavailable', 'scripts-unavailable'].includes(mode) && url.pathname.includes('/modules/world-codex/')) return route.abort();
      if (url.pathname.startsWith('/preview-root/')) {
        const response = await route.fetch({ url: origin + url.pathname.slice('/preview-root'.length) + url.search });
        return route.fulfill({ response });
      }
      return route.continue();
    });
    await page.goto(origin + (mode === 'preview-prefix' ? '/preview-root' : '') + pagePath, { waitUntil: 'networkidle' });
    await page.locator('.kingdom-reference-table').first().waitFor();
    if (mode === 'preview-prefix') {
      assert.ok(await page.locator('.codex-masthead').isVisible(), 'Relative design resources load below a preview root');
      assert.equal(await page.locator('body').evaluate(node => getComputedStyle(node).getPropertyValue('--codex-paper').trim()), '#f1ead9');
    }
    const paintErrors = await page.locator('.kingdom-reference-table :is(td, th)').evaluateAll(cells => {
      const rgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
      const luminance = values => values.map(value => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      }).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
      return cells.filter(cell => {
        const style = getComputedStyle(cell);
        const background = rgb(style.backgroundColor);
        if (background[0] > 100 && background[1] < 40 && background[2] < 40) return true;
        if (!cell.textContent.trim()) return false;
        const text = cell.querySelector('b, span, a') || cell;
        const light = luminance(background);
        const ink = luminance(rgb(getComputedStyle(text).color));
        return (Math.max(light, ink) + 0.05) / (Math.min(light, ink) + 0.05) < 4.5;
      }).map(cell => cell.textContent.trim().slice(0, 80));
    });
    assert.deepEqual(paintErrors, [], `${mode}: no red panels or unreadable text`);
    const subsection = page.locator('p').filter({ hasText: /^10\.c\) Bedrohliche Tiere$/ });
    assert.equal(await subsection.locator('b').first().evaluate(node => getComputedStyle(node).backgroundColor), 'rgba(0, 0, 0, 0)', 'No editor highlight on chapter 10.c');
    if (screenshots) {
      for (const [name, selector] of [['gilden', '.kingdom-guild-table'], ['ahnengalerie', '.kingdom-ancestor-table']]) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(screenshots, `${mode}-${name}.png`) });
      }
    }
    assert.deepEqual(errors, [], `${mode}: no script errors`);
    await context.close();
    console.log(`OK ${mode}: reference-table colors, text contrast, chapter highlight`);
  }
} finally { await browser.close(); }
