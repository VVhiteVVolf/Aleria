import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const server = await startChartQualityServer(fileURLToPath(new URL('../../', import.meta.url)));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const path = name => fileURLToPath(new URL(name, import.meta.url));
const noticeId = 'gwynthor-der-staedter-und-sein-pferd';
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [], missing = [], compositionWarnings = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.text().includes('[board-composition]')) compositionWarnings.push(message.text()); });
  page.on('response', response => { if (response.url().startsWith(server.origin) && response.status() >= 400) missing.push(response.url()); });
  await page.route('**/*', route => new URL(route.request().url()).origin === server.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
  await page.goto(server.origin + '/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel', { waitUntil: 'networkidle' });
  await page.locator('[data-poster-id="gwynthor-poster-hilfe"]').waitFor();
  assert.equal(await page.locator('[data-poster-id]').count(), 55);
  await page.screenshot({ path: path('board.png') });
  await page.locator('[data-poster-id="gwynthor-poster-hilfe"] [data-role="poster-pin"]').click();
  await page.locator('#scroll-mo.open').waitFor();
  assert.equal(await page.locator('#notice-publications button').count(), 2);
  await page.locator(`#notice-publications [data-notice-id="${noticeId}"]`).click();
  await page.locator('[data-lettering-state="ready"]').waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('#scroll-content img')].map(image => image.decode().catch(() => {})));
  });
  const notice = await page.locator('#scroll-content').evaluate(element => ({
    text: element.innerText,
    overflow: element.scrollWidth > element.clientWidth + 1,
    brokenImages: [...element.querySelectorAll('img')].filter(image => !image.naturalWidth).map(image => image.src),
    horseSketchVisible: [...element.querySelectorAll('img')].some(image => image.src.endsWith('/eirlys-skizze-v1.webp')),
    trueHorsePortraitVisible: [...element.querySelectorAll('img')].some(image => image.src.endsWith('/troetzli.png')),
    signatureVisible: [...element.querySelectorAll('img')].some(image => image.src.includes('cynddelw-unterschrift')),
    commentSignatures: element.querySelectorAll('.zettel-comment-signature').length,
  }));
  assert.equal(notice.overflow, false);
  assert.deepEqual(notice.brokenImages, []);
  assert.equal(notice.horseSketchVisible, true);
  assert.equal(notice.trueHorsePortraitVisible, false);
  assert.equal(notice.signatureVisible, true);
  assert.equal(notice.commentSignatures, 0);
  assert.match(notice.text, /sechs Stunden/);
  assert.match(notice.text, /Tudur Penrudd/);
  await page.screenshot({ path: path('notice-top.png') });
  await page.locator('#scroll-content').evaluate(element => { element.scrollTop = element.scrollHeight; });
  await page.screenshot({ path: path('notice-bottom.png') });
  await page.locator('[data-action="notice-reward-open"]').first().click();
  const rewardDialog = page.locator('.notice-reward-dialog[open]');
  await rewardDialog.waitFor();
  assert.equal(await rewardDialog.locator('.notice-reward-loot > li').count(), 3);
  assert.match(await rewardDialog.innerText(), /50/);
  assert.match(await rewardDialog.innerText(), /Schickes Notizbuch/);
  assert.match(await rewardDialog.innerText(), /Schreibutensilien/);
  await rewardDialog.evaluate(async element => { await Promise.all([...element.querySelectorAll('img')].map(image => image.decode())); });
  await page.screenshot({ path: path('rewards.png') });
  await rewardDialog.locator('[data-reward-action="close"]').click();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator('#scroll-content').evaluate(element => element.scrollWidth > element.clientWidth + 1), false);
  await page.locator('#scroll-content').evaluate(element => { element.scrollTop = 0; });
  await page.screenshot({ path: path('notice-mobile.png') });
  const ending = page.locator('[data-notice-scroll] p').last();
  await ending.scrollIntoViewIfNeeded();
  assert.match(await ending.innerText(), /Ich brauche wirklich Hilfe/);
  assert.equal(await ending.isVisible(), true);
  await page.screenshot({ path: path('notice-mobile-end.png') });
  await page.locator('[data-action="notice-reward-open"]').first().click();
  await rewardDialog.waitFor();
  assert.equal(await rewardDialog.evaluate(element => element.scrollWidth > element.clientWidth + 1), false);
  await page.screenshot({ path: path('rewards-mobile.png') });
  await rewardDialog.locator('[data-reward-action="close"]').click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ending.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path('notice-end.png') });
  await page.setViewportSize({ width: 1800, height: 1200 });
  await page.goto(server.origin + '/Stammb%C3%A4ume/tests/chart-quality-fixture.html');
  await page.evaluate(async () => {
    // The fixture normally blocks images. Match the real chart page's asset base
    // here so that portrait and frame QA can use the actual local files too.
    const base = document.createElement('base');
    base.href = new URL('../', location.href).href;
    document.head.prepend(base);
    window.chartQualityFixture = await import('/Stammb%C3%A4ume/tests/chart-quality-fixture.js');
  });
  const families = [];
  for (const id of ['haus-penrudd', 'haus-llythfor']) {
    const audit = await page.evaluate(id => window.chartQualityFixture.auditFamily(id), id);
    families.push(audit);
    assert.equal(audit.passed, true, JSON.stringify(audit.issues));
    const ids = await page.locator('.card_cont').evaluateAll(elements => elements.map(element => element.__data__?.data?.data?.id || element.__data__?.data?.id));
    if (id === 'haus-penrudd') {
      assert.ok(ids.includes('esyllt-penrudd'));
      assert.ok(!ids.includes('eirlys-llythfor'));
    } else assert.ok(ids.includes('eirlys-llythfor'));
    await page.evaluate(async () => { await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
    await page.screenshot({ path: path(`${id}.png`) });
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  assert.deepEqual(compositionWarnings, []);
  await writeFile(new URL('browser-review.json', import.meta.url), JSON.stringify({ notice, rewards: { copper: 50, items: 2, mobileOverflow: false }, mobile: true, endingReadable: true, families, errors, missing, compositionWarnings }, null, 2)+'\n');
  console.log(JSON.stringify({ hilfePublications: 2, mobile: true, families: families.map(({ familyId, passed, cardCount }) => ({ familyId, passed, cardCount })), errors, missing }));
} finally {
  await browser.close();
  await server.close();
}
