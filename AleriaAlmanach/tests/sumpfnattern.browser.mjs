import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildZitteraaleGroupModules } from '../modules/schwarze-zitteraale/zitteraale-group-modules.mjs';
import { buildZitteraaleModule } from '../modules/schwarze-zitteraale/zitteraale-module.mjs';
import { CADWGAN_ID } from '../modules/schwarze-zitteraale/sumpfnattern-people.mjs';

const output = path.resolve(`diagnostics/sumpfnattern-20261122/browser-${Date.now()}`);
await fs.mkdir(output, { recursive: true });
const preview = await openVenueBrowserPreview('sumpfnattern-20261122', { entryId: 'zitteraale-gruppe-ii' });
const { page } = preview;
const groups = buildZitteraaleGroupModules(), group = groups[1];
const checks = [], screenshots = [];
async function capture(name) {
  const toast = page.locator('#app-status-toast [data-action="dismiss-app-status"]');
  if (await toast.isVisible()) await toast.click();
  const file = path.join(output, name + '.png');
  await page.screenshot({ path: file }); screenshots.push(file);
}
async function decode() {
  await preview.decodeImages('#modal-overlay img[src*="schwarze-zitteraale"], #modal-overlay img[src*="Traits"], #modal-overlay img[src*="haus-gafyr"]');
}
try {
  await page.evaluate(async () => {
    window.__sumpfnatternWrites = 0;
    window._fb = { ...getLocalCommentBackend(), _localFallback: false, loadCreatures: async () => [],
      addComment: async () => { window.__sumpfnatternWrites++; throw Error('Fixture blocks writes'); } };
    _fbReady = true;
    await loadCharacters();
  });
  assert.equal(await page.evaluate(id => getCharacterById(id)?.name, CADWGAN_ID), 'Cadwgan Bwach');
  const registered = await page.evaluate(() => findCurrentSectionByEntryId('zitteraale-gruppe-ii'));
  assert.equal(registered.entry.title, 'Die Sumpfnattern');
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['narrow', { width: 320, height: 780 }]]) {
    await page.setViewportSize(viewport);
    for (const index of [0, 1, 3]) {
      await preview.openPage(group, index); await decode();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
      const sources = await page.locator('#modal-overlay img').evaluateAll(images => images.map(i => ({ src: i.getAttribute('src'), loaded: !!i.naturalWidth })));
      assert(sources.some(i => i.src?.includes(group.pages[index].image.split('/').at(-1)) && i.loaded));
      if (index === 3) {
        assert((await page.evaluate(() => getCurrentCommentThreadId())).includes('zitteraale-gruppe-ii-hauptquartier'));
        assert.match(await page.locator('#modal-overlay').innerText(), /Lycath/);
      }
      if (index === 1) {
        assert.match(await page.locator('#modal-overlay').innerText(), /Gwaulwyn/);
        assert(sources.some(i => i.src?.includes('familie-bwch-v3.png') && i.loaded));
        assert(await page.locator('#modal-overlay a[href$="haus-bwach-ritter-v1.png"]').count());
      }
      await capture(`${layout}-sumpfnattern-seite-${index + 1}`);
      checks.push({ layout, page: index + 1, sources });
    }
    await preview.openPage(group, 2); await decode();
    await page.locator('#modal-overlay [data-hierarchy-fullscreen-toggle]').click();
    const panel = page.locator('#modal-overlay [data-hierarchy-tree-panel].active');
    assert.equal(await panel.locator('.hierarchy-node-card').count(), 19);
    await capture(`${layout}-sumpfnattern-fuehrung`);
    for (const index of [1, 2]) {
      await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(index).click();
      assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active .hierarchy-node-card').count(), index === 1 ? 8 : 4);
    }
    checks.push({ layout, hierarchy: true });
    await preview.openPage(groups[0], 3); await decode();
    const camp = page.locator('#modal-overlay img[src*="untote-aale-lager-v1"]');
    assert(await camp.count());
    assert(await camp.first().evaluate(i => i.naturalWidth > 0));
    assert((await page.evaluate(() => getCurrentCommentThreadId())).includes('zitteraale-gruppe-i-hauptquartier'));
    await capture(`${layout}-untote-aale-hauptquartier`);
    checks.push({ layout, aaleHeadquartersSceneLoaded: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await preview.openPage(buildZitteraaleModule(), 2);
  await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(1).click(); await decode();
  assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active a[href*="?entry="]').count(), 8);
  await capture('desktop-hauptmodul-gruppen');
  await preview.openPage(group, 1);
  await page.evaluate(item => {
    _moduleEditorAuthorized = true;
    openModuleEditor(item, { mode: 'edit', sourceKind: 'builtin', sourceEntryId: item.entry.id, sectionSignature: makeSectionSignature(item.section) });
  }, registered);
  await page.waitForFunction(() => document.querySelectorAll('#me-pages .module-page-card').length === 4);
  const collected = await page.evaluate(() => collectModuleEditorPayload().entry);
  assert.deepEqual(collected.pages.map(p => p.image || ''), group.pages.map(p => p.image || ''));
  assert.deepEqual(collected.pages.map(p => p.commentThreadKey), group.pages.map(p => p.commentThreadKey));
  const biography = collected.pages[1].biography.biography || collected.pages[1].biography;
  assert.equal(biography.connections.find(c => c.name === 'Haus Bwach · Gwaulwyn').image,
    group.pages[1].biography.connections.find(c => c.name === 'Haus Bwach · Gwaulwyn').image);
  assert.match(JSON.stringify(biography), /Gwaulwyn/);
  await page.evaluate(() => { setModuleEditorCleanBaseline(); closeModuleEditor(); });
  checks.push({ moduleEditorRoundtrip: true });
  assert.equal(await page.evaluate(() => window.__sumpfnatternWrites), 0);
  assert.deepEqual(preview.errors, []);
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ passed: true, checks, screenshots, fixture: 'Real local application; fresh browser and local comment adapter; no production writes', viewports: [1440, 390, 320] }, null, 2));
  console.log(JSON.stringify({ passed: true, output, checks: checks.length, screenshots: screenshots.length }));
} catch (error) {
  await capture('failure');
  await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ message: error.message, stack: error.stack, checks, screenshots, errors: preview.errors }, null, 2));
  throw error;
} finally {
  await preview.close();
}
