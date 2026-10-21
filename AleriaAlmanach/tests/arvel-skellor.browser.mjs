import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildArvelBiography } from '../modules/schwarze-zitteraale/arvel-biography.mjs';
const profile = buildArvelBiography();
const entry = { id: 'arvel-biography-preview', title: 'Arvel Skellor', multipage: true, appendCommentsPage: false, image: profile.biography.portrait, pages: [{
  schemaVersion: 1, pageTitle: 'Arvel Skellor', biographyPage: true, ...profile, stats: profile.stats.map(row => [row.label, row.value])
}] };
const preview = await openVenueBrowserPreview('arvel-skellor');
const { page } = preview;
const checks = [];
try {
  for (const [layout, width, height] of [['desktop', 1600, 1050], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await preview.openPage(entry, 0);
    await preview.decodeImages('#modal-overlay img');
    assert.equal(await page.locator('.biography-portrait-tabs [data-portrait-tab]').count(), 4);
    for (let index = 0; index < 4; index++) {
      await page.locator('.biography-portrait-tabs [data-portrait-tab]').nth(index).click();
      assert.equal(await page.locator('.biography-portrait.module-portrait-pane.active').count(), 1);
    }
    await page.locator('.biography-portrait-tabs [data-portrait-tab]').first().click();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
    await preview.capture(`biography-${layout}`);
    checks.push({ layout, portraitTabs: 4, imagesDecoded: true });
  }
  const familyPage = await page.context().newPage();
  await familyPage.setViewportSize({ width: 1800, height: 1100 });
  await familyPage.goto(`${preview.origin}/Stammb%C3%A4ume/Stammbaum.html?family=haus-skellor&mode=view`);
  await familyPage.waitForSelector('.aleria-chart-card', { timeout: 45000 });
  await familyPage.waitForFunction(() => document.body.textContent.includes('Arvel Skellor'));
  await familyPage.getByRole('button', { name: 'Einpassen', exact: true }).click();
  await familyPage.waitForTimeout(500);
  const names = await familyPage.locator('.card_cont').allTextContents();
  assert.ok(names.some(name => name.includes('Arvel')));
  assert.ok(names.some(name => name.includes('Cadfan')));
  assert.ok(!names.some(name => name.includes('Ausgestorben')));
  const broken = await familyPage.locator('.card_cont img').evaluateAll(async images => {
    await Promise.all(images.map(image => image.decode().catch(() => {})));
    return images.filter(image => !image.naturalWidth).map(image => image.src);
  });
  assert.deepEqual(broken, []);
  await familyPage.screenshot({ path: resolve(preview.output, 'family-desktop.png') });
  await familyPage.close();
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ checks, familyCards: names.length, noExtinctionMarker: true, noExternalWrites: true }, null, 2));
  console.log(JSON.stringify({ passed: true, output: preview.output, checks, familyCards: names.length }));
} finally { await preview.close(); }
