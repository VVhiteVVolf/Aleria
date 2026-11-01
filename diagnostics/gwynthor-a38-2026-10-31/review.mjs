import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { GUILD_TAX_NOTICE_ID } from '../../Anzeigetafeln/tools/notices/gildenjahresrechnung-a38.mjs';

const server = await startChartQualityServer(fileURLToPath(new URL('../../', import.meta.url)));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ viewport: { width: 1500, height: 1100 }, reducedMotion: 'reduce' });
await context.route('**/*', route => new URL(route.request().url()).origin === server.origin
  && route.request().method() === 'GET' ? route.continue() : route.abort());
await context.addInitScript(() => localStorage.setItem('aleria.current-world-date.v1', JSON.stringify({ year: 1740, month: 3, day: 10 })));
const page = await context.newPage(), errors = [], report = { errors, remoteWritesAllowed: false, views: [] };
page.on('pageerror', error => errors.push(error.message));
const shot = name => page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, import.meta.url)), animations: 'disabled' });
try {
  await page.goto(`${server.origin}/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel`);
  const paper = page.locator('.board-poster[data-poster-id="gwynthor-poster-wolken-daemmerung"]');
  await paper.locator('[data-role="poster-pin"]').waitFor();
  await page.locator('.board-poster img, .board-calendar img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  report.binding = await paper.evaluate(el => ({ noticeId: el.querySelector('[data-role="poster-pin"]').getAttribute('aria-label'),
    x: el.style.left, y: el.style.top, width: el.style.width }));
  assert.equal(await page.locator('.board-poster').count(), 55, 'existing poster is reused');
  await shot('board-calendar-and-wolken');
  const calendarBox = await page.locator('.board-calendar').boundingBox();
  await page.screenshot({ path: fileURLToPath(new URL('calendar-mount-closeup.png', import.meta.url)), clip: {
    x: calendarBox.x - 25, y: calendarBox.y - 20, width: calendarBox.width + 50, height: calendarBox.height + 40 } });
  report.calendarText = await page.evaluate(() => {
    const failures = [];
    for (let month = 1; month <= 13; month++) for (const day of [1, 10, 36]) {
      window.TafelNoticeTimeline.viewDate({ year: 1740, month, day });
      const root = document.querySelector('.board-calendar'), box = root.getBoundingClientRect();
      for (const el of root.querySelectorAll('small, strong .calendar-number-ink, .board-calendar-year .calendar-number-ink, .board-calendar-previous, .board-calendar-next, .board-calendar-today')) {
        const range = document.createRange(); range.selectNodeContents(el);
        const rect = range.getBoundingClientRect();
        if (rect.left < box.left + box.width * .07 || rect.right > box.right - box.width * .07
          || rect.top < box.top + box.height * .27 || rect.bottom > box.bottom - box.height * .09) {
          failures.push({ month, day, role: el.className, left: rect.left - box.left, right: rect.right - box.left,
            top: rect.top - box.top, bottom: rect.bottom - box.top, width: box.width, height: box.height });
        }
      }
    }
    window.TafelNoticeTimeline.viewDate({ year: 1740, month: 3, day: 10 });
    return { checkedDates: 39, failures };
  });
  assert.deepEqual(report.calendarText.failures, []);
  await paper.locator('[data-role="poster-pin"]').click();
  for (const [name, size] of [['desktop', { width: 1500, height: 1100 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(size);
    const content = page.locator('#scroll-content');
    await content.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    assert.equal(await content.locator('.quest-footer, .medieval-notice--quest').count(), 0);
    assert.equal(await page.locator('#notice-stack-nav:visible').count(), 0);
    const text = await content.innerText();
    for (const fragment of ['Abgabenschlussausgleich', 'A21', 'B239', 'A38', 'C14', 'U4', 'A7', 'R11', 'N2', 'Briallen', 'Schalter 4', 'A38-E', 'Ratten']) assert.ok(text.includes(fragment), fragment);
    const bounds = await content.evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }));
    assert.ok(bounds.scroll <= bounds.client + 1);
    await shot(`${name}-anfang`);
    const wording = content.locator('[data-notice-scroll]');
    await wording.evaluateAll(elements => elements.forEach(el => { el.scrollTop = el.scrollHeight; }));
    await content.locator('.notice-signoff').scrollIntoViewIfNeeded();
    await shot(`${name}-schluss`);
    report.views.push({ name, bounds, allImagesDecoded: true });
  }
  assert.deepEqual(errors, []);
  await page.locator('#scroll-actions [data-action="close-scroll"]').click();
  const snapshot = await page.evaluate(id => window.TafelState.get().zettel.find(notice => notice.id === id), GUILD_TAX_NOTICE_ID);
  report.notice = { id: snapshot.id, type: snapshot.typ, pages: 1, posted: snapshot.publishedOn };
  console.log(JSON.stringify(report));
} finally {
  await writeFile(new URL('browser-review.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  await browser.close(); await server.close();
}
