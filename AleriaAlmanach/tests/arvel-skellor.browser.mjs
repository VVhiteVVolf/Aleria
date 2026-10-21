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
  const groupIds = ['arvel-skellor', 'eirlys-talinvyr', 'unbekannt-opfer-1', 'unbekannt-opfer-2', 'unbekannt-opfer-3'];
  const localGroup = await familyPage.locator('.card_cont').evaluateAll((cards, ids) => cards
    .filter(card => ids.includes(card.__data__?.data?.id))
    .map(card => {
      const rect = card.getBoundingClientRect();
      return { id: card.__data__.data.id, x: rect.x, y: rect.y, width: rect.width };
    }).sort((a, b) => a.x - b.x), groupIds);
  assert.equal(localGroup.length, 5);
  for (let index = 1; index < localGroup.length; index++) {
    assert.ok(Math.abs(localGroup[index].y - localGroup[0].y) < 2, 'Arvel and every partner share one row');
    assert.ok(localGroup[index].x - localGroup[index - 1].x < localGroup[index].width * 1.7, 'No detached partner card');
  }
  assert.equal(await familyPage.locator('.aleria-connection-reference[data-related-card-ids*="unbekannt-opfer-3"]').count(), 0);
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
