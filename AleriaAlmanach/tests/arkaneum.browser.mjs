import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildArkaneum, ARKANEUM_SECTION } from '../modules/arkaneum/arkaneum-module.mjs';
const entry = buildArkaneum(), preview = await openVenueBrowserPreview('arkaneum');
const { page } = preview;
const checks = [];
try {
  const placement = await page.evaluate(id => getValidSections().flatMap(s => s.entries.filter(e => e.id === id).map(e => ({ path: s.path, pages: e.pages.length }))), entry.id);
  assert.equal(placement.length, 1); assert.deepEqual(placement[0].path, ARKANEUM_SECTION.path); assert.equal(placement[0].pages, 15);
  const normalized = await page.evaluate(entry => sanitizeModuleEntry(entry), entry);
  assert.equal(normalized.economyCalculationDeferred, true);
  assert.equal(normalized.pages.length, 15);
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    for (const [index, model] of entry.pages.entries()) {
      await preview.openPage(entry, index);
      await preview.decodeImages('#modal-overlay img[src*="herluin-lothaire"], #modal-overlay img[src*="Lothaire"]');
      if (model.hierarchyPage) for (const [i, tree] of model.hierarchy.trees.entries()) {
        await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(i).click();
        assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active .hierarchy-node-card').count(), tree.levels.flatMap(l => l.nodes).length);
      }
      if (model.tradeCatalogPage) {
        for (const category of model.tradeCatalog.categories) {
          await page.locator(`[data-trade-filter="${category.id}"]`).click();
          assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), model.tradeCatalog.items.filter(i => i.category === category.id).length);
          await preview.decodeImages('#modal-overlay .trade-catalog-item:visible .trade-catalog-image img');
        }
        await page.locator('#modal-overlay .trade-catalog-item:visible [data-action="open-trade-item-card"]').first().click();
        assert.ok(await page.locator('dialog.trade-item-card').isVisible());
        await preview.capture(`${layout}-itemkarte-${index}`);
        await page.keyboard.press('Escape');
      }
      if (model.sessionPage) {
        const thread = await page.evaluate(() => getCurrentCommentThreadId());
        await page.locator('#modal-overlay .session-intro-toggle').click();
        assert.ok(!await page.locator('#modal-overlay .session-stage-copy').isVisible());
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
      if ([0, 2, 4, 5, 6, 10].includes(index)) await preview.capture(`${layout}-seite-${index + 1}`);
      checks.push({ layout, page: index + 1 });
    }
  }
  assert.deepEqual(preview.errors, []);
  const edited = await page.evaluate(({ entry, section }) => {
    populateModuleEditor({ entry, section }, { mode: 'edit', sourceKind: 'builtin', sourceEntryId: entry.id });
    return collectModuleEditorPayload().entry;
  }, { entry, section: ARKANEUM_SECTION });
  assert.equal(edited.economyCalculationDeferred, true);
  assert.equal(edited.pages.length, 15);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, checks, placement, externalWrites: false, deployed: false }, null, 2));
  console.log(JSON.stringify({ passed: true, checks: checks.length, output: preview.output }));
} finally { await preview.close(); }
