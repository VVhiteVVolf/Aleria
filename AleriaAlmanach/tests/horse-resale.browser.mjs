import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildResaleRegistration } from '../modules/gwynthor-horse-resale/resale-module.mjs';
import { RESALE_PEOPLE } from '../../Stammbäume/assets/js/data/gwynthor-horse-resale/resale-family.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
const registration = buildResaleRegistration(), { entry } = registration, preview = await openVenueBrowserPreview('horse-resale');
const { page } = preview, output = path.resolve(`diagnostics/horse-resale-20261113/browser-${Date.now()}`), shots = [], checks = [], geometry = [];
await fs.mkdir(output, { recursive: true });
const capture = async (name, target = page) => { const file = path.join(output, `${name}.png`); await target.screenshot({ path: file }); shots.push(file); };
try {
  await page.evaluate(() => { window.__resaleWrites = 0; window._fb = { ...getLocalCommentBackend(), _localFallback: false,
    loadCreatures: async () => [], addComment: async () => { window.__resaleWrites++; throw Error('Fixture blocks writes.'); } }; _fbReady = true; });
  const placements = await page.evaluate(id => getValidSections().flatMap(s => s.entries.filter(e => e.id === id).map(e => s.path)), entry.id);
  assert.deepEqual(placements, [registration.path]);
  for (const [layout, size] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    await page.setViewportSize(size);
    const normalized = await page.evaluate(entry => sanitizeModuleEntry(structuredClone(entry)), entry);
    const quotes = model => buildModuleOffers([model], STANDARD_ITEMS).map(p => ({ id: p.id, ref: p.definitionRef, kind: p.definitionKind, price: p.priceRange }));
    assert.deepEqual(quotes(normalized), quotes(entry));
    for (const [index, model] of entry.pages.entries()) {
      if (process.argv.includes('--catalog-only') && !model.tradeCatalogPage) continue;
      await preview.openPage(entry, index); await preview.decodeImages('#modal-overlay img[src*="gwynthor-horse-resale"], #modal-overlay img[src*="placeholders"], #modal-overlay img[src="https://i.imgur.com/FYK3TFW.png"]');
      if (model.hierarchyPage) for (const [ti, tree] of model.hierarchy.trees.entries()) {
        await page.locator('[data-hierarchy-tree-tab]').nth(ti).click();
        assert.equal(await page.locator('[data-hierarchy-tree-panel].active .hierarchy-node-card').count(), tree.levels.flatMap(l => l.nodes).length);
        await page.locator('[data-hierarchy-tree-panel].active .hierarchy-node-card').first().evaluate(el => el.scrollIntoView({ block: 'center' }));
        await capture(`${layout}-rollen-${tree.id}`);
      }
      if (model.tradeCatalogPage) {
        for (const category of model.tradeCatalog.categories) {
          await page.locator(`[data-trade-filter="${category.id}"]`).click();
          assert.equal(await page.locator('.trade-catalog-item:visible').count(), category.id === 'angebot' ? 1 : 4);
          if (category.id === 'angebot') await page.locator('.trade-catalog-item:visible img').first().evaluate(el => el.scrollIntoView({ block: 'center' }));
          await capture(`${layout}-kategorie-${category.id}`);
        }
        for (const name of ['Rübenkopp', 'Torfstiefel', 'Blechpflaume', 'Karrenschnute']) {
          await page.locator('[data-trade-search-input]').fill(name); assert.equal(await page.locator('.trade-catalog-item:visible').count(), 1);
          await page.locator('.trade-catalog-item:visible img').first().evaluate(el => el.scrollIntoView({ block: 'center' }));
          await capture(`${layout}-pferd-${name}`);
        }
        await page.locator('[data-trade-search-input]').fill('');
      }
      if (model.sessionPage) {
        const thread = await page.evaluate(() => getCurrentCommentThreadId()); assert(thread); checks.push({ layout, page: index + 1, thread });
        if (index === 5) {
          const button = page.locator('[data-action="open-comment-form"]'); await button.focus(); await button.press('Enter');
          await page.waitForFunction(() => isCommentFormActorsReady() && document.querySelector('#cf-char-picker .cf-char-option'));
          for (const person of RESALE_PEOPLE) {
            await page.locator('#cf-char-search').fill(person.name); await page.locator(`#cf-char-picker [data-id="${person.worldPersonId}"]`).click();
            assert.equal(await page.evaluate(() => _selectedCharId), person.worldPersonId);
          }
          await capture(`${layout}-kommentarfigur`); await page.locator('#comment-form-overlay [data-action="close-comment-form"]').click();
          await page.locator('#comment-form-overlay').waitFor({ state: 'hidden' });
        }
      }
      if (model.economyCalculationPage) {
        await page.locator('[data-economy-tab="revenue"]').click(); assert.equal(await page.locator('[data-economy-output="revenue"] tbody tr').count(), 5);
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)); await capture(`${layout}-seite-${index + 1}`);
      checks.push({ layout, page: index + 1 });
    }
    if (process.argv.includes('--catalog-only')) continue;
    const tree = await page.context().newPage(); await tree.setViewportSize(size);
    await tree.goto(`${preview.origin}/Stammb%C3%A4ume/Stammbaum.html?family=haus-ruddgraen&mode=view`);
    await tree.waitForFunction(() => document.querySelector('#family-chart [data-person-id]'));
    await tree.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => setTimeout(resolve, 1000)); });
    const audit = await tree.evaluate(async () => (await import('./assets/js/modules/chart-quality/chart-geometry-audit.js')).auditRenderedFamilyChart(document.getElementById('family-chart')));
    assert.deepEqual(audit.issues, []); geometry.push({ layout, ...audit }); await capture(`${layout}-stammbaum`, tree); await tree.close();
    const house = await page.context().newPage(); await house.setViewportSize(size);
    await house.goto(`${preview.origin}/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=haus-ruddgraen`);
    await house.waitForFunction(() => window.HAEUSER_DATA?.meta?.id === 'haus-ruddgraen' && document.querySelector('[data-court-group="offices"] img'));
    const broken = await house.locator('img[src*="gwynthor-horse-resale"]').evaluateAll(async images => { await Promise.all(images.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); })); return images.filter(i => !i.naturalWidth).map(i => i.src); });
    assert.deepEqual(broken, []); await capture(`${layout}-haus`, house); await house.locator('[data-court-group="offices"]').scrollIntoViewIfNeeded();
    await capture(`${layout}-familie`, house); await house.close();
  }
  assert.equal(await page.evaluate(() => window.__resaleWrites), 0); assert.deepEqual(preview.errors, []);
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ passed: true, shots, checks, geometry, productionWrites: false }, null, 2));
  console.log(JSON.stringify({ passed: true, output, screenshots: shots.length, geometry: geometry.length }));
} catch (error) { await capture('failure'); await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ error: error.stack, shots, checks, geometry }, null, 2)); throw error; }
finally { await preview.close(); }
