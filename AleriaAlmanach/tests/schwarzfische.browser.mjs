import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildSchwarzfische, SCHWARZFISCHE_MODULE_ID } from '../modules/schwarzfische/schwarzfische-module.mjs';
import { GRENN_CHARACTER_ID } from '../modules/schwarzfische/schwarzfische-characters.mjs';

const entry = buildSchwarzfische();
const hierarchy = entry.pages[2].hierarchy;
const output = path.resolve(`diagnostics/schwarzfische-expansion-20261116/browser-${Date.now()}`);
await fs.mkdir(output, { recursive: true });
const preview = await openVenueBrowserPreview('schwarzfische', { entryId: SCHWARZFISCHE_MODULE_ID });
const { page } = preview;
const screenshots = [], checks = [], grids = [];
const capture = async name => {
  const dismiss = page.locator('#app-status-toast [data-action="dismiss-app-status"]');
  if (await dismiss.isVisible()) await dismiss.click();
  const target = path.join(output, `${name}.png`);
  await page.screenshot({ path: target });
  screenshots.push(target);
};

async function readGrid(level) {
  return level.locator('.hierarchy-node-card').evaluateAll(cards => {
    const boxes = cards.map(card => card.getBoundingClientRect());
    return {
      columns: new Set(boxes.map(box => Math.round(box.left))).size,
      rows: new Set(boxes.map(box => Math.round(box.top))).size,
      count: boxes.length
    };
  });
}

try {
  await page.context().route('**/*', route => {
    const request = route.request();
    if (request.method() === 'GET' && new URL(request.url()).origin === preview.origin) return route.continue();
    return route.abort();
  });
  await page.evaluate(async () => {
    window.__schwarzfischWrites = 0;
    window._fb = { ...getLocalCommentBackend(), _localFallback: false,
      loadCreatures: async () => [],
      addComment: async () => { window.__schwarzfischWrites++; throw Error('Fixture blocks writes.'); } };
    _fbReady = true;
    await loadCharacters();
  });
  const registered = await page.evaluate(id => findCurrentSectionByEntryId(id), entry.id);
  assert.equal(registered.entry.pages.length, 5);
  assert.deepEqual(registered.section.path, ['Die Windreiter', 'Estryll Banden', 'Die Schwarzen Fische']);
  assert.equal(await page.evaluate(id => getCharacterById(id)?.name, GRENN_CHARACTER_ID), 'Grenn Coelret');
  const roundtrip = await page.evaluate(entry => sanitizeModuleEntry(JSON.parse(JSON.stringify(sanitizeModuleEntry(entry)))), entry);
  assert.equal(roundtrip.pages[2].hierarchy.trees[3].levels.length, 30);
  assert.deepEqual(roundtrip.pages[2].hierarchy.trees.map(tree => tree.levels.map(level => [level.columns, level.startsGroup, level.emblem, level.nodes.length])),
    hierarchy.trees.map(tree => tree.levels.map(level => [level.columns, level.startsGroup, level.emblem, level.nodes.length])));

  for (const [layout, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
    ['narrow', { width: 320, height: 780 }]
  ]) {
    await page.setViewportSize(viewport);
    for (const index of [0, 1, 3, 4]) {
      await preview.openPage(entry, index);
      await preview.decodeImages('#modal-overlay img[src*="schwarzfische"], #modal-overlay img[src*="Traits"], #modal-overlay img[src*="coelret"]');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
      await capture(`${layout}-seite-${index + 1}`);
      checks.push({ layout, page: index + 1 });
    }
    await preview.openPage(entry, 2);
    await capture(`${layout}-hierarchie-normal`);
    const fullscreen = page.locator('#modal-overlay [data-hierarchy-fullscreen-toggle]');
    await fullscreen.click();
    for (const [index, tree] of hierarchy.trees.entries()) {
      await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(index).click();
      const panel = page.locator('#modal-overlay [data-hierarchy-tree-panel].active');
      assert.equal(await panel.locator('.hierarchy-node-card').count(), tree.levels.flatMap(level => level.nodes).length);
      await preview.decodeImages('#modal-overlay [data-hierarchy-tree-panel].active img');
      for (const [levelIndex, level] of tree.levels.entries()) {
        if (!level.columns) continue;
        const grid = await readGrid(panel.locator('[data-hierarchy-level]').nth(levelIndex));
        assert.equal(grid.columns, Math.min(level.columns, level.nodes.length), `${layout} ${tree.id} ${levelIndex}`);
        assert.equal(grid.rows, Math.ceil(level.nodes.length / level.columns), `${layout} ${tree.id} ${levelIndex}`);
        grids.push({ layout, tree: tree.id, level: levelIndex, ...grid });
      }
      await capture(`${layout}-${tree.id}-anfang`);
      const viewport = page.locator('#modal-overlay .hierarchy-chart-viewport');
      if (tree.id === 'administration' || tree.id === 'kerngruppe-des-banners') {
        await viewport.evaluate(node => { node.scrollTop = node.scrollHeight; });
        await capture(`${layout}-${tree.id}-ende`);
      }
      if (tree.id === 'regulare-mitglieder') {
        assert.equal(await panel.locator('.hierarchy-level-emblem').count(), 10);
        const lastTroop = panel.locator('[data-hierarchy-level="27"]');
        await lastTroop.scrollIntoViewIfNeeded();
        await capture(`${layout}-trupp-X-fuehrung`);
        await viewport.evaluate(node => { node.scrollTop = node.scrollHeight; node.scrollLeft = 0; });
        await capture(`${layout}-trupp-X-rollen-links`);
        await viewport.evaluate(node => { node.scrollLeft = node.scrollWidth; });
        await capture(`${layout}-trupp-X-rollen-rechts`);
      }
      checks.push({ layout, tree: tree.id, cards: tree.levels.flatMap(level => level.nodes).length });
    }
    await fullscreen.click();
    assert.equal(await page.locator('#modal-overlay .hierarchy-page').evaluate(node => node.classList.contains('fullscreen-active')), false);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await preview.openPage(entry, 2);
  await page.evaluate(entry => {
    _moduleEditorAuthorized = true;
    const section = findCurrentSectionByEntryId(entry.id).section;
    openModuleEditor({ section, entry }, { mode: 'edit', sourceKind: 'builtin', sourceEntryId: entry.id, sectionSignature: makeSectionSignature(section) });
  }, entry);
  await page.waitForFunction(() => document.querySelectorAll('#me-pages .module-page-card').length === 5);
  const treeEditor = page.locator('#me-pages .hierarchy-editor-tree-row:has(.me-hierarchy-tree-id[value="regulare-mitglieder"])');
  assert.equal(await treeEditor.locator('.hierarchy-editor-level-row').count(), 30);
  const columns = treeEditor.locator('.me-hierarchy-level-columns').nth(2);
  await columns.selectOption('3');
  let edited = await page.evaluate(() => collectModuleEditorPayload().entry.pages[2].hierarchy);
  assert.equal(edited.trees[3].levels[2].columns, 3);
  await columns.selectOption('4');
  edited = await page.evaluate(() => collectModuleEditorPayload().entry.pages[2].hierarchy);
  assert.equal(edited.trees[3].levels.length, 30);
  assert.equal(edited.trees[3].levels[2].columns, 4);
  assert.equal(edited.trees[3].levels[0].startsGroup, true);
  assert.equal(edited.trees[3].levels[0].emblem, hierarchy.trees[3].levels[0].emblem);
  await capture('desktop-vollstaendiger-editor');
  await page.evaluate(() => { setModuleEditorCleanBaseline(); closeModuleEditor(); });
  checks.push({ editor: 'full', levels: 30, columns: 4, emblems: true });

  await page.evaluate(() => openModuleEditorForCurrent());
  const inlineColumns = page.locator('#modal-overlay [data-hierarchy-level-field="columns"][data-hierarchy-tree-index="3"][data-hierarchy-level-index="2"]');
  await inlineColumns.waitFor({ state: 'visible' });
  await inlineColumns.selectOption('3');
  await page.waitForFunction(() => getInlineDraftPage().hierarchy.trees[3].levels[2].columns === 3);
  await inlineColumns.selectOption('4');
  await page.waitForFunction(() => getInlineDraftPage().hierarchy.trees[3].levels[2].columns === 4);
  const inlineResult = await page.evaluate(() => getInlineDraftPage().hierarchy.trees[3]);
  assert.equal(inlineResult.levels.length, 30);
  assert.equal(inlineResult.levels[0].emblem, hierarchy.trees[3].levels[0].emblem);
  assert.equal(inlineResult.levels[0].startsGroup, true);
  await capture('desktop-inline-editor');
  await page.evaluate(() => { setInlineModuleEditCleanBaseline(); cancelInlineModuleEdit(); });
  checks.push({ editor: 'inline', levels: 30, columns: 4, emblems: true });

  assert.equal(await page.evaluate(() => window.__schwarzfischWrites), 0);
  assert.deepEqual(preview.errors, []);
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ passed: true, checks, grids, screenshots,
    source: 'current local application, fresh context, local comment adapter, all external requests blocked after bootstrap', productionWrites: false }, null, 2));
  console.log(JSON.stringify({ passed: true, output, checks: checks.length, grids: grids.length, screenshots: screenshots.length }));
} catch (error) {
  await capture('failure');
  await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ message: error.message, stack: error.stack, checks, grids, screenshots, errors: preview.errors }, null, 2));
  throw error;
} finally {
  await preview.close();
}
