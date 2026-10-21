import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.NOTICE_TEST_ORIGIN || 'http://127.0.0.1:4197';
const shots = process.env.NOTICE_SCREENSHOTS;
if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.route('**/*', route => route.request().url().startsWith(origin + '/') && route.request().method() === 'GET' ? route.continue() : route.abort());
const page = await context.newPage();
const errors = [], inspected = [];
page.on('pageerror', error => errors.push(error.message));
const signature = () => page.locator('#scroll-content .notice-signature img');
const seal = () => page.locator('#scroll-content .quest-seal img, #scroll-content .notice-seal img');
const open = id => page.evaluate(id => window.openZettelScroll(id), id);
const shot = async name => { if (shots) await page.screenshot({ path: `${shots}/${name}.png`, animations: 'disabled' }); };
const boards = [
  ['cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel', 14],
  ['cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-anzeigetafel', 11],
];
try {
  for (const [boardId, count] of boards) {
    await page.goto(`${origin}/Anzeigetafeln/tafel.html?tafel=${boardId}`, { waitUntil: 'networkidle' });
    await page.locator('.tafel-notice-marker').first().waitFor();
    const notices = await page.evaluate(() => window.TafelState.snapshot().zettel);
    assert.equal(notices.length, count);
    const before = JSON.stringify(notices);
    for (const notice of notices) {
      await open(notice.id);
      assert.equal(await signature().count(), 1, `${notice.id}: signature`);
      assert.equal(await seal().count(), 1, `${notice.id}: wax seal`);
      await signature().evaluate(image => image.decode());
      await seal().evaluate(image => image.decode());
      assert.equal(await signature().getAttribute('src'), notice.unterschrift);
      assert.equal(await seal().getAttribute('src'), notice.siegel);
      const bounds = await signature().boundingBox();
      assert.ok(bounds.width >= 65 && bounds.height >= 35, `${notice.id}: readable signature slot`);
      inspected.push({ boardId, id: notice.id, signature: notice.unterschrift, seal: notice.siegel });
      if (/fearnan-die|torvik-seit-lyristag-vermisst$|llysfaen-mabli|llysfaen-hoher-besuch/.test(notice.id)) {
        await signature().scrollIntoViewIfNeeded();
        await shot(notice.id);
      }
      await page.keyboard.press('Escape');
    }
    assert.equal(await page.evaluate(() => JSON.stringify(window.TafelState.snapshot().zettel)), before, 'reading does not rewrite notices');
    await page.evaluate(() => window.TafelState.saveNow());
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.tafel-notice-marker').first().waitFor();
    assert.equal(await page.evaluate(() => JSON.stringify(window.TafelState.snapshot().zettel)), before, 'save and reload preserve signoffs');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await open('llysfaen-mabli');
  await signature().scrollIntoViewIfNeeded();
  assert.ok(await page.locator('#scroll-content').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
  await shot('efa-mobile');
  await page.keyboard.press('Escape');
  await page.goto(`${origin}/Anzeigetafeln/tafel.html?tafel=${boards[0][0]}`, { waitUntil: 'networkidle' });
  await page.locator('.tafel-notice-marker').first().waitFor();
  await open('gwynthor-fearnan-die-verschwundene-schatulle');
  await signature().scrollIntoViewIfNeeded();
  await shot('muireann-mobile');
  assert.ok(await page.locator('#scroll-content').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
  assert.deepEqual(errors, []);
  if (shots) await writeFile(`${shots}/report.json`, JSON.stringify({ pass: true, inspected, errors }, null, 2));
  console.log('PASS: all 25 notice sheets render signatures and wax seals, all images decode, no duplicate sheets, save/reload and desktop/mobile.');
} finally { await context.close(); await browser.close(); }
