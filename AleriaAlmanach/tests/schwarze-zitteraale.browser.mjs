import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildZitteraaleModule } from '../modules/schwarze-zitteraale/zitteraale-module.mjs';
import { buildZitteraaleGroupModules, ZITTERAALE_GROUP_SECTION_PATH } from '../modules/schwarze-zitteraale/zitteraale-group-modules.mjs';
import { MEDRAWD_ID } from '../modules/schwarze-zitteraale/medrawd-angau.mjs';

const main = buildZitteraaleModule();
const groups = buildZitteraaleGroupModules();
const modules = [main, ...groups];
const output = path.resolve(`diagnostics/zitteraale-groups-20261116/browser-${Date.now()}`);
await fs.mkdir(output, { recursive: true });
const preview = await openVenueBrowserPreview('zitteraale-groups', { entryId: main.id });
const { page } = preview;
const checks = [], grids = [], screenshots = [];
const capture = async name => {
  const dismiss = page.locator('#app-status-toast [data-action="dismiss-app-status"]');
  if (await dismiss.isVisible()) await dismiss.click();
  const target = path.join(output, `${name}.png`);
  await page.screenshot({ path: target });
  screenshots.push(target);
};
const decode = () => preview.decodeImages('#modal-overlay img[src*="schwarze-zitteraale"], #modal-overlay img[src*="Traits"], #modal-overlay img[src*="Stammb"]');

async function installFixture() {
  await page.evaluate(async () => {
    window.__zitteraaleFixtureWrites = 0;
    window._fb = { ...getLocalCommentBackend(), _localFallback: false, loadCreatures: async () => [],
      addComment: async () => { window.__zitteraaleFixtureWrites++; throw Error('Local fixture blocks writes'); } };
    _fbReady = true;
    await loadCharacters();
  });
}

async function checkGrid(level, expected, context) {
  const geometry = await level.locator('.hierarchy-node-card').evaluateAll(cards => {
    const boxes = cards.map(card => card.getBoundingClientRect());
    return { count: boxes.length, columns: new Set(boxes.map(box => Math.round(box.left))).size,
      rows: new Set(boxes.map(box => Math.round(box.top))).size };
  });
  assert.equal(geometry.columns, Math.min(expected.columns, expected.nodes.length), context);
  assert.equal(geometry.rows, Math.ceil(expected.nodes.length / expected.columns), context);
  grids.push({ context, ...geometry });
}

try {
  await page.context().route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (request.method() === 'GET' && url.origin === preview.origin) return route.continue();
    if (request.method() === 'GET' && url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) return route.fallback();
    return route.abort();
  });
  await installFixture();
  const registered = await page.evaluate(ids => ids.map(id => findCurrentSectionByEntryId(id)), modules.map(module => module.id));
  assert.equal(registered.length, 9);
  for (const item of registered.slice(1)) assert.deepEqual(item.section.path, ZITTERAALE_GROUP_SECTION_PATH);
  assert.equal(await page.evaluate(id => getCharacterById(id)?.name, MEDRAWD_ID), 'Medrawd Angau');
  for (const [id, name] of [['zitteraale-schlickzahn', 'Der Schinder'], ['zitteraale-donnerkiefer', 'Der Eidlose'], ['zitteraale-nachtkieme', 'Llineth']]) {
    assert.equal(await page.evaluate(id => getCharacterById(id)?.name, id), name);
  }
  for (const item of registered) {
    const normalized = await page.evaluate(entry => sanitizeModuleEntry(JSON.parse(JSON.stringify(sanitizeModuleEntry(entry)))), item.entry);
    assert.equal(normalized.pages.length, item.entry.pages.length);
    assert.deepEqual(normalized.pages.find(page => page.hierarchyPage).hierarchy.trees.map(tree => tree.levels.map(level => [level.columns, level.nodes.length])),
      item.entry.pages.find(page => page.hierarchyPage).hierarchy.trees.map(tree => tree.levels.map(level => [level.columns, level.nodes.length])));
  }

  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['narrow', { width: 320, height: 780 }]]) {
    await page.setViewportSize(viewport);
    for (const [moduleIndex, item] of registered.entries()) {
      const entry = item.entry;
      for (const [pageIndex, model] of entry.pages.entries()) {
        await preview.openPage(entry, pageIndex);
        await decode();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${layout} ${entry.id} ${pageIndex}`);
        if (model.sessionPage) {
          const thread = await page.evaluate(() => getCurrentCommentThreadId());
          assert(thread.includes(model.commentThreadKey), thread);
        }
        if (!model.hierarchyPage) {
          if (moduleIndex === 0 || moduleIndex === 1 || [2, 8].includes(moduleIndex) && [0, 3].includes(pageIndex)
            || layout === 'desktop' && pageIndex === 0) await capture(`${layout}-${entry.id}-seite-${pageIndex + 1}`);
          checks.push({ layout, module: entry.id, page: pageIndex + 1 });
          continue;
        }
        if (moduleIndex === 0 || moduleIndex === 1) await capture(`${layout}-${entry.id}-hierarchie-normal`);
        await page.locator('#modal-overlay [data-hierarchy-fullscreen-toggle]').click();
        for (const [treeIndex, tree] of model.hierarchy.trees.entries()) {
          await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(treeIndex).click();
          const panel = page.locator('#modal-overlay [data-hierarchy-tree-panel].active');
          await decode();
          assert.equal(await panel.locator('.hierarchy-node-card').count(), tree.levels.flatMap(level => level.nodes).length);
          for (const [levelIndex, level] of tree.levels.entries()) if (level.columns) {
            await checkGrid(panel.locator('[data-hierarchy-level]').nth(levelIndex), level, `${layout} ${entry.id} ${tree.id} ${levelIndex}`);
          }
          if (moduleIndex === 0 || [1, 2, 8].includes(moduleIndex)) await capture(`${layout}-${entry.id}-${tree.id}-anfang`);
          const chartViewport = page.locator('#modal-overlay .hierarchy-chart-viewport');
          if (treeIndex === 0 && [0, 1, 2, 8].includes(moduleIndex)) {
            await chartViewport.evaluate(node => { node.scrollTop = node.scrollHeight; node.scrollLeft = 0; });
            await capture(`${layout}-${entry.id}-${tree.id}-ende`);
            if (viewport.width < 500) {
              await chartViewport.evaluate(node => { node.scrollLeft = node.scrollWidth; });
              await capture(`${layout}-${entry.id}-${tree.id}-ende-rechts`);
            }
          }
          checks.push({ layout, module: entry.id, tree: tree.id });
        }
      }
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  const group = registered[1];
  await preview.openPage(group.entry, 2);
  await page.evaluate(item => {
    _moduleEditorAuthorized = true;
    openModuleEditor(item, { mode: 'edit', sourceKind: 'builtin', sourceEntryId: item.entry.id, sectionSignature: makeSectionSignature(item.section) });
  }, group);
  await page.waitForFunction(() => document.querySelectorAll('#me-pages .module-page-card').length === 4);
  const collected = await page.evaluate(() => collectModuleEditorPayload().entry);
  assert.equal(collected.pages.length, 4);
  assert.deepEqual(collected.pages[2].hierarchy.trees.map(tree => tree.levels.map(level => [level.columns, level.nodes.length])),
    group.entry.pages[2].hierarchy.trees.map(tree => tree.levels.map(level => [level.columns, level.nodes.length])));
  await capture('desktop-gruppen-editor');
  await page.evaluate(() => { setModuleEditorCleanBaseline(); closeModuleEditor(); });
  await page.evaluate(() => openModuleEditorForCurrent());
  await page.locator('#modal-overlay [data-hierarchy-level-field="columns"]').first().waitFor({ state: 'visible' });
  const inline = await page.evaluate(() => getInlineDraftPage().hierarchy);
  assert.deepEqual(inline.trees.map(tree => tree.levels.map(level => [level.columns, level.nodes.length])),
    group.entry.pages[2].hierarchy.trees.map(tree => tree.levels.map(level => [level.columns, level.nodes.length])));
  await capture('desktop-gruppen-inline-editor');
  await page.evaluate(() => { setInlineModuleEditCleanBaseline(); cancelInlineModuleEdit(); });
  checks.push({ fullEditorRoundtrip: true, inlineEditorRoundtrip: true });

  await preview.openPage(registered[0].entry, 2);
  await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(1).click();
  const links = page.locator('#modal-overlay [data-hierarchy-tree-panel].active a[href*="?entry="]');
  assert.equal(await links.count(), 8);
  await links.first().click();
  await page.waitForURL(url => url.searchParams.get('entry') === groups[0].id);
  await page.waitForFunction(() => typeof openModal === 'function' && ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter = page.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  await installFixture();
  await page.locator('#modal-overlay').waitFor({ state: 'visible' });
  assert.match(await page.locator('#modal-overlay .modal-page-title').innerText(), /Untoten Aale/);
  await decode();
  await capture('desktop-link-zur-ersten-gruppe');
  checks.push({ normalGroupLinkNavigation: true });
  assert.equal(await page.evaluate(() => window.__zitteraaleFixtureWrites), 0);
  assert.deepEqual(preview.errors, []);
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ passed: true, checks, grids, screenshots,
    viewports: [1440, 390, 320], fixture: 'Fresh browser, actual current application, local comment adapter, blocked external writes', productionWrites: false }, null, 2));
  console.log(JSON.stringify({ passed: true, output, checks: checks.length, grids: grids.length, screenshots: screenshots.length }));
} catch (error) {
  await capture('failure');
  await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ message: error.message, stack: error.stack, checks, grids, screenshots, errors: preview.errors }, null, 2));
  throw error;
} finally {
  await preview.close();
}
