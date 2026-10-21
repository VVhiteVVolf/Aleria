import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { NOTICE_SEALS } from '../assets/js/seals/notice-seals-model.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.NOTICE_TEST_ORIGIN || 'http://127.0.0.1:4197';
const shots = process.env.NOTICE_SCREENSHOTS;
if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.route('**/*', route => route.request().url().startsWith(origin + '/') && route.request().method() === 'GET' ? route.continue() : route.abort());
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const torvik = 'gwynthor-torvik-seit-lyristag-vermisst';
const open = id => page.evaluate(id => window.openZettelScroll(id), id);
const shot = async name => { if (shots) await page.screenshot({ path: `${shots}/${name}.png`, animations: 'disabled' }); };
const sealImage = () => page.locator('#scroll-content .quest-seal img, #scroll-content .notice-seal img');
const sealField = () => page.locator('#sb-body .notice-media-field').filter({ has: page.locator('[data-media-field="siegel"]') });
async function unlockEditor() {
  if (await page.evaluate(() => window.TafelRuntime.canEditZettel())) return;
  await page.locator('#btn-edit').click();
  await page.locator('#pw-inp').fill('7777');
  await page.getByRole('button', { name: 'Freischalten', exact: true }).click();
}

try {
  await page.goto(`${origin}/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel`, { waitUntil: 'networkidle' });
  await page.locator('.tafel-notice-marker').first().waitFor();
  const original = await page.evaluate(() => JSON.stringify(window.TafelState.get().zettel));
  for (const [id, expected] of [
    ['gwynthor-herluin-angestellte-vermisst', 'quests/herluin-angestellte-vermisst/wachssiegel-v1.png'],
    ['gwynthor-egon-schwarze-zitteraale-gesucht', 'issuers/egon-gafyr/wachssiegel-v1.png'],
    ['gwynthor-fearnan-die-verschwundene-schatulle', 'seals/defaults/baeurlich-v1.png'],
    [torvik, 'seals/defaults/buergerlich-v1.png'],
  ]) {
    const exists = await page.evaluate(id => window.TafelState.get().zettel.some(notice => notice.id === id), id);
    assert.ok(exists, `existing authored notice ${id}`);
    await open(id);
    await sealImage().evaluate(image => image.decode());
    assert.ok((await sealImage().getAttribute('src')).includes(expected));
    assert.equal(await sealImage().evaluate(image => getComputedStyle(image.parentElement).backgroundColor), 'rgba(0, 0, 0, 0)');
    await page.keyboard.press('Escape');
  }
  assert.equal(await page.evaluate(() => JSON.stringify(window.TafelState.get().zettel)), original, 'fallbacks are read-only');
  await unlockEditor();
  await page.evaluate(id => window.TafelZettelEditor.open(id), torvik);
  for (const seal of NOTICE_SEALS) {
    await page.locator('[data-input-action="notice-seal-preset"]').selectOption(seal.id);
    await sealField().locator('img').evaluate(image => image.decode());
    assert.equal(await sealField().locator('img').getAttribute('src'), seal.src);
    assert.equal(await page.evaluate(id => window.TafelState.get().zettel.find(notice => notice.id === id).sealPreset, torvik), seal.id);
  }
  await page.locator('[data-input-action="notice-seal-preset"]').scrollIntoViewIfNeeded();
  await shot('editor-standard-seal-selection');
  await page.locator('[data-input-action="notice-seal-preset"]').selectOption('none');
  assert.equal(await sealField().locator('img').count(), 0);
  await page.locator('[data-action="zettel-save-close"]').click();
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('.tafel-notice-marker').first().waitFor();
  await open(torvik);
  assert.equal(await sealImage().count(), 0);
  assert.equal(await page.locator('#scroll-content .notice-seal-empty').count(), 1);
  await page.keyboard.press('Escape');
  await unlockEditor();
  await page.evaluate(id => window.TafelZettelEditor.open(id), torvik);
  await page.locator('[data-input-action="notice-seal-preset"]').selectOption('federkiel');
  await page.locator('[data-action="zettel-save-close"]').click();
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('.tafel-notice-marker').first().waitFor();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await open(torvik);
    await sealImage().evaluate(image => image.decode());
    assert.match(await sealImage().getAttribute('src'), /federkiel-v1.png/);
    assert.ok(await page.locator('#scroll-content').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    await sealImage().scrollIntoViewIfNeeded();
    await shot(`federkiel-${width}`);
    await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors, []);
  console.log('PASS: four generated seals decode, issuer seals preserved, automatic defaults read-only, editor selection, no-seal and standard survive reload, desktop/mobile.');
} finally { await context.close(); await browser.close(); }
