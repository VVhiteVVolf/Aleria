import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildRotesTor, TOR_SECTION } from '../modules/rotes-tor/tor-module.mjs';
import { readEconomyCalendar } from '../modules/economy-calculator/economy-source-venues.mjs';

const entry = buildRotesTor(await readEconomyCalendar()), preview = await openVenueBrowserPreview('rotes-tor');
const { page } = preview, checks = [];
try {
  const placement = await page.evaluate(id => {
    const sections = getValidSections(), matches = sections.flatMap(section => section.entries.filter(entry => entry.id === id).map(entry => ({ section, entry })));
    return { count: matches.length, path: matches[0]?.section.path, pageCount: matches[0]?.entry.pages.length };
  }, entry.id);
  assert.equal(placement.count, 1); assert.deepEqual(placement.path, TOR_SECTION.path); assert.equal(placement.pageCount, 12);
  const imported = await page.evaluate(entry => normalizeModuleImportPayload({ type: 'aleria-module-package', version: 1, module: {
    type: 'aleria-module', version: 1, section: { tab: 'Völker & Kulturen', key: 'Zum Roten Tor' }, entry
  } }).entry, entry);
  assert.equal(imported.pages.length, 12);
  assert.equal(imported.pages.find(page => page.tradeCatalogPage).tradeCatalog.items.length, 16);
  assert.deepEqual(imported.pages.at(-1).economyCalculation.scenario, entry.pages.at(-1).economyCalculation.scenario);

  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    await page.evaluate(section => { closeModal(); _activeTab = section.tab; setActiveArchivePath(section.tab, section.path); expandArchiveHierarchyPath(section.tab, section.path); renderAll(); }, TOR_SECTION);
    assert.equal(await page.locator(`.entry-card-open[data-entry-id="${entry.id}"]`).count(), 1);
    await preview.decodeImages('.entry-card-open img');
    await preview.capture(`${layout}-archiv`);
    for (const [index, model] of entry.pages.entries()) {
      await preview.openPage(entry, index);
      await preview.decodeImages('#modal-overlay img[src*="rotes-tor"], #modal-overlay img[src*="Penrudd"]');
      if (model.hierarchyPage) {
        for (const [treeIndex, tree] of model.hierarchy.trees.entries()) {
          await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(treeIndex).click();
          const active = '#modal-overlay [data-hierarchy-tree-panel].active';
          assert.equal(await page.locator(`${active} .hierarchy-node-card`).count(), tree.levels.reduce((sum, level) => sum + level.nodes.length, 0));
          await preview.decodeImages(`${active} img`);
        }
      }
      if (model.tradeCatalogPage) {
        for (const category of model.tradeCatalog.categories) {
          await page.locator(`[data-trade-filter="${category.id}"]`).click();
          assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), model.tradeCatalog.items.filter(item => item.category === category.id).length);
          await preview.decodeImages('#modal-overlay .trade-catalog-item:visible .trade-catalog-image img');
        }
        await page.locator('[data-trade-filter="topf"]').click();
        await page.locator('#modal-overlay .trade-catalog-item:visible [data-action="open-trade-item-card"]').first().click();
        assert.ok(await page.locator('dialog.trade-item-card').isVisible());
        await preview.capture(`${layout}-itemkarte`);
        await page.keyboard.press('Escape');
        await page.locator('dialog.trade-item-card').waitFor({ state: 'detached' });
        await page.locator('[data-trade-filter="all"]').click();
        await page.locator('[data-trade-search-input]').fill('Fuhrmannsbeutel');
        assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), 1);
        await page.locator('[data-trade-search-input]').fill('');
      }
      if (model.guildServicesPage) await preview.decodeImages('#modal-overlay img');
      if (model.sessionPage) {
        const thread = await page.evaluate(() => getCurrentCommentThreadId());
        await page.locator('#modal-overlay .session-intro-toggle').click();
        assert.ok(!await page.locator('#modal-overlay .session-stage-copy').isVisible());
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
        await page.locator('#modal-overlay .session-intro-toggle').click();
      }
      if (model.economyCalculationPage) {
        const root = page.locator('[data-economy-root]');
        await root.locator('[data-economy-tab="payroll"]').click();
        assert.equal(await root.locator('[data-economy-worker]').count(), 11);
        assert.doesNotMatch(await root.innerText(), /NaN|Infinity/);
        await root.locator('[data-economy-tab="revenue"]').click();
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${layout} ${model.pageTitle}`);
      await preview.capture(`${layout}-seite-${index + 1}`);
      checks.push({ layout, page: index + 1, title: model.pageTitle });
    }
  }
  assert.deepEqual(preview.errors, []);
  const report = { passed: true, module: entry.id, placement, checks, importRoundTrip: true, itemCards: true, collapsibleSceneText: true,
    imagesLoaded: true, externalWrites: false, deployed: false, errors: preview.errors };
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, pageChecks: checks.length, output: preview.output }));
} finally { await preview.close(); }
