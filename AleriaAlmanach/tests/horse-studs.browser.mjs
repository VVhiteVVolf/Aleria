import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildStudRegistrations } from '../modules/gwynthor-horse-studs/stud-module.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
const registrations = buildStudRegistrations();
const preview = await openVenueBrowserPreview('horse-studs');
const { page } = preview, output = path.resolve(`diagnostics/horse-studs-20261113/browser-${Date.now()}`), shots = [], checks = [], geometry = [];
await fs.mkdir(output, { recursive: true });
const capture = async name => { const file = path.join(output, `${name}.png`); await page.screenshot({ path: file }); shots.push(file); };
try {
  await page.context().route('**/*', route => { const r = route.request(), u = new URL(r.url());
    if (u.origin === preview.origin && r.method() === 'GET') return route.continue();
    if (r.method() === 'GET' && (r.resourceType() === 'image' || u.origin === 'https://www.gstatic.com' && u.pathname.startsWith('/firebasejs/'))) return route.fallback();
    return route.abort(); });
  await page.evaluate(() => { window.__studWrites = 0; window._fb = { ...getLocalCommentBackend(), _localFallback: false,
    loadCreatures: async () => [], addComment: async () => { window.__studWrites++; throw Error('Fixture blocks writes.'); } }; _fbReady = true; });
  const placements = await page.evaluate(ids => getValidSections().flatMap(s => s.entries.filter(e => ids.includes(e.id)).map(e => ({ id: e.id, path: s.path }))), registrations.map(r => r.entry.id));
  assert.equal(placements.length, 2);
  for (const r of registrations) assert.deepEqual(placements.find(p => p.id === r.entry.id).path, r.path);
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    for (const registration of process.argv.includes('--families-only') ? [] : registrations) {
      const entry = registration.entry, short = entry.id.startsWith('zum-') ? 'halenrhyd' : 'rhosmere';
      const roundtrip = await page.evaluate(entry => { const first = sanitizeModuleEntry(structuredClone(entry)); return { first, second: sanitizeModuleEntry(structuredClone(first)) }; }, entry);
      assert.deepEqual(roundtrip.first, roundtrip.second);
      const quote = module => buildModuleOffers([module], STANDARD_ITEMS).map(o => ({ title: o.title, ref: o.definitionRef, kind: o.definitionKind, price: o.priceRange }));
      assert.deepEqual(quote(roundtrip.first), quote(entry), 'Browser normalization must preserve the authoritative trade quote.');
      for (const [index, model] of entry.pages.entries()) {
        await preview.openPage(entry, index);
        await preview.decodeImages('#modal-overlay img[src*="gwynthor-horse-studs"], #modal-overlay img[src*="placeholders"]');
        if (model.hierarchyPage) {
          for (const [ti, tree] of model.hierarchy.trees.entries()) {
            await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(ti).click();
            assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active .hierarchy-node-card').count(), tree.levels.flatMap(l => l.nodes).length);
            await capture(`${layout}-${short}-rollen-${tree.id}`);
          }
        }
        if (model.tradeCatalogPage) {
          for (const category of model.tradeCatalog.categories) {
            await page.locator(`#modal-overlay [data-trade-filter="${category.id}"]`).click();
            assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), model.tradeCatalog.items.filter(i => i.category === category.id).length);
            await capture(`${layout}-${short}-waren-${category.id}`);
          }
          await page.locator('#modal-overlay [data-trade-filter="all"]').click();
          const search = page.locator('#modal-overlay [data-trade-search-input]');
          await search.fill(model.tradeCatalog.items.at(-1).title);
          assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(), 1);
          await search.fill('');
        }
        if (model.sessionPage) {
          const thread = await page.evaluate(() => getCurrentCommentThreadId()); assert(thread); checks.push({ layout, id: entry.id, page: index + 1, thread });
          if (index === 6) {
            const commentButton = page.locator('#modal-overlay [data-action="open-comment-form"]');
            // The offline status indicator overlaps the mobile toolbar in this fixture.
            if (layout === 'mobile') { await commentButton.focus(); await commentButton.press('Enter'); }
            else await commentButton.click();
            await page.waitForFunction(() => isCommentFormActorsReady() && document.querySelector('#cf-char-picker .cf-char-option'));
            const id = entry.sessionCast.find(id => id.includes(short === 'halenrhyd' ? 'gorweth-halenrhyd' : 'maelrig-caeffyn'));
            await page.locator('#cf-char-search').fill(short === 'halenrhyd' ? 'Gorweth Halenrhyd' : 'Maelrig Caeffyn');
            await page.locator(`#cf-char-picker [data-id="${id}"]`).click();
            assert.equal(await page.evaluate(() => _selectedCharId), id);
            await capture(`${layout}-${short}-kommentarfigur`);
            await page.locator('#comment-form-overlay [data-action="close-comment-form"]').click();
            await page.locator('#comment-form-overlay').waitFor({ state: 'hidden' });
          }
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
        await capture(`${layout}-${short}-seite-${index + 1}`); checks.push({ layout, id: entry.id, page: index + 1 });
      }
    }
    for (const familyId of ['haus-halenrhyd', 'haus-caeffyn', 'haus-aurdden']) {
      const tree = await page.context().newPage();
      await tree.setViewportSize(viewport);
      await tree.goto(`${preview.origin}/Stammb%C3%A4ume/Stammbaum.html?family=${familyId}&mode=view`);
      await tree.waitForFunction(() => document.querySelector('#family-chart .person-card, #family-chart [data-person-id]'));
      // The chart lays out and fits its cards after mounting; audit settled geometry.
      await tree.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => setTimeout(resolve, 1000)); });
      const audit = await tree.evaluate(async () => { const { auditRenderedFamilyChart } = await import('./assets/js/modules/chart-quality/chart-geometry-audit.js'); return auditRenderedFamilyChart(document.getElementById('family-chart')); });
      geometry.push({ layout, familyId, ...audit }); assert.deepEqual(audit.issues, [], `${layout} ${familyId}`);
      const file = path.join(output, `${layout}-${familyId}-stammbaum.png`); await tree.screenshot({ path: file }); shots.push(file); await tree.close();
    }
  }
  assert.equal(await page.evaluate(() => window.__studWrites), 0); assert.deepEqual(preview.errors, []);
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ passed: true, checks, geometry, shots, productionWrites: false, source: 'current local application with existing offline adapter' }, null, 2));
  console.log(JSON.stringify({ passed: true, output, screenshots: shots.length, checkedPages: checks.length, familyCharts: geometry.length }));
} catch (error) { await capture('failure'); await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ message: error.message, stack: error.stack, checks, geometry, shots }, null, 2)); throw error; }
finally { await preview.close(); }
