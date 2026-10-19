import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildKlingendeKrone } from '../modules/klingende-krone/krone-module.mjs';
const entry = buildKlingendeKrone(), preview = await openVenueBrowserPreview('klingende-krone');
const { page } = preview;
try {
  assert.equal(await page.evaluate(id => getValidSections().flatMap(s => s.entries).filter(e => e.id === id).length, entry.id), 1);
  assert.equal(await page.evaluate(e => getPages(e).length, entry), entry.pages.length);
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(viewport);
    for (let index = 0; index < 13; index++) {
      await preview.openPage(entry, index);
      await preview.decodeImages('#modal-overlay img[src*="klingende-krone"]');
      if (index === 4) {
        const tabs = page.locator('#modal-overlay [data-hierarchy-tree-tab]');
        assert.equal(await tabs.count(), 6);
        for (let tree = 0; tree < 6; tree++) {
          await tabs.nth(tree).click();
          const active = '#modal-overlay [data-hierarchy-tree-panel].active';
          assert.equal(await page.locator(`${active} .hierarchy-node-card`).count(), entry.pages[4].hierarchy.trees[tree].levels.reduce((n, l) => n + l.nodes.length, 0));
          await preview.decodeImages(`${active} img`); await preview.capture(`${layout}-personal-${tree}`);
        }
      }
      if (index === 5) {
        for (const category of entry.pages[5].tradeCatalog.categories) {
          await page.locator(`[data-trade-filter="${category.id}"]`).click();
          assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), entry.pages[5].tradeCatalog.items.filter(i => i.category === category.id).length);
          await preview.decodeImages('#modal-overlay .trade-catalog-item:visible .trade-catalog-image img');
          await preview.capture(`${layout}-gueter-${category.id}`);
        }
        await page.locator('[data-trade-filter="haus"]').click();
        await page.locator('#modal-overlay .trade-catalog-item:visible [data-action="open-trade-item-card"]').last().click();
        assert.ok(await page.locator('dialog.trade-item-card').isVisible());
        await preview.capture(`${layout}-whiskykarte`);
        await page.keyboard.press('Escape'); await page.locator('dialog.trade-item-card').waitFor({ state: 'detached' });
      }
      if (index >= 7 && index < 12) {
        const thread = await page.evaluate(() => getCurrentCommentThreadId());
        await page.locator('#modal-overlay .session-intro-toggle').click();
        assert.ok(!await page.locator('#modal-overlay .session-stage-copy').isVisible());
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
        await page.locator('#modal-overlay .session-intro-toggle').click();
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
      await preview.capture(`${layout}-seite-${index + 1}`);
    }
  }
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.goto(`${preview.origin}/Stammb%C3%A4ume/tests/chart-quality-fixture.html`);
  const family = await page.evaluate(async () => {
    const { auditFamily } = await import('/Stammb%C3%A4ume/tests/chart-quality-fixture.js');
    const base = document.createElement('base'); base.href = new URL('../', location.href).href; document.head.prepend(base);
    const result = await auditFamily('sept-cneacail');
    const images = [...document.querySelectorAll('#family-chart img')];
    await Promise.all(images.map(i => i.decode().catch(() => {})));
    return { ...result, brokenImages: images.filter(i => !i.naturalWidth).map(i => i.src) };
  });
  assert.ok(family.cardCount >= 15); assert.deepEqual(family.issues, []); assert.deepEqual(family.brokenImages, []);
  await preview.capture('stammbaum');
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ module: entry.id, pages: 13, scenes: 5, hierarchyTabs: 6, goods: 16, family, itemCard: true, externalWrites: false, errors: preview.errors }, null, 2));
  console.log(JSON.stringify({ passed: true, output: preview.output }));
} finally { await preview.close(); }
