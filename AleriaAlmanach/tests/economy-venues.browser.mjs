import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { evaluateVenueScope } from '../modules/economy-calculator/economy-venue-scope.mjs';
const legacy = JSON.parse(await readFile(new URL('../modules/economy-calculator/sources/public-shop-modules-2026-10-19.json', import.meta.url), 'utf8'));
const preview = await openVenueBrowserPreview('economy-venues'), { page } = preview;
try {
  await page.evaluate(records => {
    const payload = readLocalModuleStorePayload();
    applyModuleStorePayload({ ...payload, customSections: [...(payload.customSections || []), ...records.map(({ section, entry }) => ({ ...section, entries: [entry] }))] });
  }, legacy.records);
  const records = await page.evaluate(() => getValidSections().flatMap(section => section.entries.map(entry => ({ section: { tab: section.tab, path: section.path }, entry }))));
  const shops = records.filter(({ entry, section }) => evaluateVenueScope(entry, section).eligible);
  assert.equal(shops.length, 14);
  for (const { entry, section } of records) {
    const calculators = entry.pages?.filter(page => page.economyCalculationPage) || [];
    assert.equal(calculators.length, evaluateVenueScope(entry, section).eligible ? 1 : 0, entry.title);
  }
  const checks = [];
  for (const [layout, viewport] of [['desktop', { width: 1460, height: 1050 }], ['mobile', { width: 390, height: 900 }]]) {
    await page.setViewportSize(viewport);
    for (const { entry } of shops) {
      assert.equal(entry.pages.at(-1).economyCalculationPage, true);
      await preview.openPage(entry, entry.pages.length - 1);
      const root = page.locator('[data-economy-root]');
      await root.locator('[data-economy-output="ledger"] .economy-metric').first().waitFor();
      assert.doesNotMatch(await root.innerText(), /NaN|Infinity/);
      await root.locator('[data-economy-tab="payroll"]').click();
      assert.equal(await root.locator('[data-economy-worker]').count(), entry.pages.at(-1).economyCalculation.scenario.workers.length);
      const width = await root.evaluate(root => ({ width: root.clientWidth, scrollWidth: root.scrollWidth }));
      assert.ok(width.scrollWidth <= width.width + 2, entry.title);
      await root.locator('[data-economy-tab="revenue"]').click();
      if (['zum-dritten-funken', 'modul-1781813764249', 'gwynthor-badehaus-fontani', 'gwynthor-zum-vollen-korb'].includes(entry.id)) await preview.capture(`${layout}-${entry.id}`);
      checks.push({ layout, id: entry.id, workers: entry.pages.at(-1).economyCalculation.scenario.workers.length, ...width });
    }
  }
  await page.goto(`${preview.origin}/AleriaAlmanach/docs/economy/price-review-2026-10-19.html`);
  await page.locator('select[data-decision]').selectOption('angepasst');
  const changed = await page.locator('[data-row]:visible').count();
  assert.ok(changed >= 47);
  await page.locator('[data-search]').fill('Huhn');
  assert.ok(await page.locator('[data-row]:visible').count() > 0);
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, shops: shops.length, checks, priceReportSearch: true, changedRows: changed, externalWrites: false }, null, 2));
  console.log(JSON.stringify({ passed: true, shops: shops.length, checks: checks.length, output: preview.output }));
} finally { await preview.close(); }
