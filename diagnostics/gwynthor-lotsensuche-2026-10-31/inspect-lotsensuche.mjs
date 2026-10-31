import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const server = await startChartQualityServer(fileURLToPath(new URL('../../', import.meta.url)));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const root = 'gwynthor-lotsensuche';
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [], missing = [], compositionWarnings = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.text().includes('[board-composition]')) compositionWarnings.push(message.text()); });
  page.on('response', response => { if (response.url().startsWith(server.origin) && response.status() >= 400) missing.push(response.url()); });
  await page.route('**/*', route => new URL(route.request().url()).origin === server.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
  await page.goto(server.origin + '/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel', { waitUntil: 'networkidle' });
  await page.locator('[data-poster-id="gwynthor-poster-lotsensuche"]').waitFor();
  assert.equal(await page.evaluate(() => Boolean(window.TafelBoardComposition)), true);
  assert.doesNotMatch(await page.locator('#toast').innerText(), /Plakattafel konnte nicht/);
  await page.screenshot({ path: fileURLToPath(new URL('board.png', import.meta.url)) });
  await page.locator(`.notice-register-entry[data-notice-id="${root}"]`).click();
  await page.locator('#scroll-mo.open').waitFor();
  assert.equal(await page.locator('#notice-stack-nav option').count(), 2);
  const result = [];
  for (const [index, id] of [root, `${root}-erneuert`].entries()) {
    await page.locator('#notice-stack-nav select').selectOption(id);
    await page.locator('[data-lettering-state="ready"]').waitFor();
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.querySelectorAll('#scroll-content img')].map(image => image.decode().catch(() => {}))); });
    const sheet = await page.locator('#scroll-content').evaluate(element => ({
      overflow: element.scrollWidth > element.clientWidth + 1,
      brokenImages: [...element.querySelectorAll('img')].filter(image => !image.naturalWidth).map(image => image.src),
      filled: Boolean(element.querySelector('[data-publication-status="filled"]')),
      filter: element.querySelector('.notice-publication--filled') ? getComputedStyle(element.querySelector('.notice-publication--filled')).filter : '',
      comments: [...element.querySelectorAll('.zettel-comment-body p')].map(paragraph => ({ text: paragraph.innerText, font: getComputedStyle(paragraph).fontFamily })),
      replyForm: Boolean(element.querySelector('.notice-reply')),
      commentSignatures: element.querySelectorAll('.zettel-comment-signature').length,
      textFont: getComputedStyle(element.querySelector('.notice-copy')).fontFamily,
      fontLoaded: document.fonts.check('16px Schoolbell'),
    }));
    assert.equal(sheet.overflow, false);
    assert.deepEqual(sheet.brokenImages, []);
    assert.equal(sheet.filled, index === 0);
    assert.equal(sheet.replyForm, index === 1);
    assert.equal(sheet.comments.length, index === 0 ? 2 : 6);
    assert.equal(sheet.commentSignatures, 0);
    assert.match(sheet.textFont, /Schoolbell/);
    assert.equal(sheet.fontLoaded, true);
    if (index === 0) assert.match(sheet.filter, /grayscale\(1\)/);
    assert.match(sheet.comments[0].font, /Kalam/);
    assert.match(sheet.comments[1].font, /Schoolbell/);
    result.push({ id, ...sheet });
    await page.screenshot({ path: fileURLToPath(new URL(`page-${index+1}.png`, import.meta.url)) });
    await page.locator('.zettel-comment').last().scrollIntoViewIfNeeded();
    await page.screenshot({ path: fileURLToPath(new URL(`comments-${index+1}.png`, import.meta.url)) });
  }
  assert.equal(result[1].comments.at(-1).text, 'Du bist ein miserabler Lügner und ein Dummkopf.');
  assert.match(result[1].comments[1].text, /Sechs tage/);
  await page.locator('[data-action="notice-font-readable"]').click();
  assert.match(await page.locator('.zettel-comment-body p').first().evaluate(element => getComputedStyle(element).fontFamily), /EB Garamond/);
  await page.locator('[data-action="notice-font-readable"]').click();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of [root, `${root}-erneuert`]) {
    await page.locator('#notice-stack-nav select').selectOption(id);
    assert.equal(await page.locator('#scroll-content').evaluate(element => element.scrollWidth > element.clientWidth + 1), false);
    await page.locator('.zettel-comment').last().scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.zettel-comment').last().isVisible(), true);
  }
  await page.screenshot({ path: fileURLToPath(new URL('mobile.png', import.meta.url)) });
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  assert.deepEqual(compositionWarnings, []);
  await writeFile(new URL('browser-review.json', import.meta.url), JSON.stringify({ sheets: result, mobile: true, errors, missing, compositionWarnings }, null, 2)+'\n');
  console.log(JSON.stringify({ sheets: result.map(({id,comments,filled,overflow}) => ({id,comments:comments.length,filled,overflow})), mobile: true, errors, missing, compositionWarnings }));
} finally {
  await browser.close();
  await server.close();
}
