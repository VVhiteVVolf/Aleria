import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildRoteKlaue } from '../modules/rote-klaue/klaue-module.mjs';
const entry = buildRoteKlaue();
const preview = await openVenueBrowserPreview('rote-klaue');
const { page } = preview;
try {
  const matches = await page.evaluate(id => getValidSections().flatMap(s => s.entries.filter(e => e.id === id).map(e => ({ path: s.path, entry: e }))), entry.id);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].path.at(-1), 'Die Klingende Münze - Gwynthor');
  assert.ok(matches[0].path.includes('Gwynthor-Stadt'));
  const checks = [];
  for (const [layout, width, height] of [['desktop', 1600, 1050], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const [index, model] of entry.pages.entries()) {
      await preview.openPage(entry, index);
      await preview.decodeImages('#modal-overlay img');
      if (model.familyTreePage) {
        const frame = page.frameLocator('iframe');
        await frame.locator('svg').first().waitFor();
        assert.ok(await frame.locator('body').innerText().then(text => text.includes('Lucan')));
      }
      if (model.hierarchyPage) for (const [i, tree] of model.hierarchy.trees.entries()) {
        await page.locator('[data-hierarchy-tree-tab]').nth(i).click();
        assert.equal(await page.locator('[data-hierarchy-tree-panel].active .hierarchy-node-card').count(), tree.levels[0].nodes.length);
        await preview.decodeImages('[data-hierarchy-tree-panel].active img');
      }
      if (model.tradeCatalogPage) {
        assert.equal(await page.locator('[data-trade-item]').count(), 0);
        assert.match(await page.locator('.trade-catalog-empty').innerText(), /keine Waren/);
      }
      if (model.guildServicesPage) assert.equal(await page.locator('.guild-service-card img').count(), 5);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${layout}: ${index}`);
      if ([0, 1, 3, 5, 6].includes(index)) await preview.capture(`${layout}-${index + 1}`);
      checks.push({ layout, page: index + 1 });
    }
  }
  const roundtrip = await page.evaluate(entry => {
    const section = getValidSections().find(s => s.entries.some(e => e.id === entry.id));
    populateModuleEditor({ entry, section }, { mode: 'edit', sourceKind: 'builtin', sourceEntryId: entry.id });
    return collectModuleEditorPayload().entry;
  }, entry);
  assert.equal(roundtrip.pages.length, 9);
  assert.equal(roundtrip.economyCalculationDeferred, true);
  assert.equal(roundtrip.pages.find(p => p.tradeCatalogPage).tradeCatalog.items.length, 0);
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, checks, editorRoundtrip: true, externalWrites: false }, null, 2));
  console.log(JSON.stringify({ pass: true, pages: checks.length, output: preview.output }));
} finally { await preview.close(); }
