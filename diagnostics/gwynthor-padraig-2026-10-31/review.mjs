import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { PADRAIG_NOTICE_ID } from '../../Anzeigetafeln/tools/notices/sankt-padraigs-tag.mjs';

const server = await startChartQualityServer(fileURLToPath(new URL('../../', import.meta.url)));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ viewport: { width: 1500, height: 1100 }, reducedMotion: 'reduce' });
await context.route('**/*', route => new URL(route.request().url()).origin === server.origin
  && route.request().method() === 'GET' ? route.continue() : route.abort());
const page = await context.newPage(), errors = [], report = { errors, views: [], writesAllowed: false };
page.on('pageerror', error => errors.push(error.message));
const shot = name => page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, import.meta.url)), animations: 'disabled' });
try {
  await page.goto(`${server.origin}/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel`);
  const paper = page.locator('.board-poster[data-poster-id="gwynthor-poster-feiertag"]');
  const pin = paper.locator('[data-role="poster-pin"]');
  await pin.waitFor();
  assert.equal(await pin.count(), 1);
  await page.locator('.board-poster img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  report.placement = await paper.evaluate(paper => {
    const a = paper.getBoundingClientRect();
    return { overlaps: [...document.querySelectorAll('.board-poster')].filter(p => p !== paper).filter(p => {
      const b = p.getBoundingClientRect();
      return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    }).map(p => p.dataset.posterId) };
  });
  assert.deepEqual(report.placement.overlaps, []);
  await shot('feiertagsplakat-tafel');
  await pin.click();
  await page.mouse.move(2, 2);
  for (const [name, size] of [['desktop', { width: 1500, height: 1100 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(size);
    const reader = page.locator('#scroll-content');
    const text = await reader.innerText();
    for (const fragment of ['17. Lichtkehr 1740', 'Körper, Geist und Seele', 'volkstümlicher Aberglaube', 'Prinz Tudwal', 'Lady Revelyn Penderyn', 'Mittagsglocke']) assert.ok(text.includes(fragment), fragment);
    assert.equal(await reader.locator('.quest-footer, .medieval-notice--quest').count(), 0);
    await reader.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const width = await reader.evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }));
    assert.ok(width.scroll <= width.client + 1);
    await shot(`${name}-anfang`);
    await reader.locator('.notice-author').scrollIntoViewIfNeeded();
    await shot(`${name}-schluss`);
    report.views.push({ name, width, imagesDecoded: true });
  }
  await page.setViewportSize({ width: 1500, height: 2300 });
  await page.locator('.notice-document').screenshot({ path: fileURLToPath(new URL('padraigs-tag-aushang.png', import.meta.url)), animations: 'disabled' });
  assert.deepEqual(errors, []);
  assert.ok((await page.evaluate(() => window.TafelState.get().zettel)).some(note => note.id === PADRAIG_NOTICE_ID));
  await writeFile(new URL('browser-review.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ views: 2, pageErrors: errors, posterOverlaps: report.placement.overlaps }));
} finally {
  await browser.close();
  await server.close();
}
