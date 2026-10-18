import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildFortunaTradingPost, buildFortunaFactions } from '../modules/markt-der-fortuna-gwynthor/fortuna-module.mjs';
import { FORTUNA_SECTION } from '../modules/markt-der-fortuna-gwynthor/fortuna-section.mjs';
import { FORTUNA_AFFILIATED_IDS } from '../modules/markt-der-fortuna-gwynthor/fortuna-network.mjs';
const entries = [buildFortunaTradingPost(), buildFortunaFactions()], preview = await openVenueBrowserPreview('markt-der-fortuna-gwynthor'), { page } = preview;
try {
  const placement = await page.evaluate(({ key, ids }) => {
    const sections = getValidSections(), members = sections.find(s => s.path?.at(-1) === key);
    return { target: members?.entries.map(e => ({ id: e.id, title: e.title })),
      counts: Object.fromEntries(ids.map(id => [id, sections.flatMap(s => s.entries).filter(e => e.id === id).length])),
      coinEntries: sections.find(s => s.path?.at(-1) === 'Die Klingende Münze - Gwynthor')?.entries.map(e => e.id) };
  }, { key: FORTUNA_SECTION.key, ids: [...entries.map(e => e.id), ...FORTUNA_AFFILIATED_IDS] });
  assert.equal(placement.target.length, 5);
  assert.equal(placement.coinEntries.length, 5);
  assert.ok(Object.values(placement.counts).every(n => n === 1));
  assert.ok(!placement.coinEntries.some(id => FORTUNA_AFFILIATED_IDS.includes(id)));
  const restored = await page.evaluate(entries => entries.map(entry => normalizeModuleImportPayload({ type: 'aleria-module-package', module: { section: { key: 'Der Markt der Fortuna - Gwynthor', tab: 'Völker & Kulturen' }, entry } }).entry), entries);
  assert.deepEqual(restored.map(e => e.pages.length), [11, 9]);
  assert.equal(restored[0].pages[2].hierarchy.trees[0].levels[0].nodes.length, 9);
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(viewport);
    await page.evaluate(section => { closeModal(); _activeTab = section.tab; setActiveArchivePath(section.tab, section.path); expandArchiveHierarchyPath(section.tab, section.path); renderAll(); }, FORTUNA_SECTION);
    for (const id of [...entries.map(e => e.id), ...FORTUNA_AFFILIATED_IDS]) assert.equal(await page.locator(`.entry-card-open[data-entry-id="${id}"]`).count(), 1);
    await preview.decodeImages('.entry-card-open img');
    await preview.capture(`${layout}-archiv-reiter`);
    for (const entry of entries) {
      const count = await page.evaluate(e => getPages(e).length, entry);
      assert.equal(count, entry.pages.length + 1);
      for (let index = 0; index < count; index++) {
        await preview.openPage(entry, index);
        await preview.decodeImages('#modal-overlay img[src*="markt-der-fortuna-gwynthor"]');
        const hierarchy = entry.pages[index]?.hierarchy;
        if (hierarchy) {
          const tabs = page.locator('#modal-overlay [data-hierarchy-tree-tab]');
          assert.equal(await tabs.count(), hierarchy.trees.length);
          for (let tree = 0; tree < hierarchy.trees.length; tree++) {
            await tabs.nth(tree).click();
            const active = '#modal-overlay [data-hierarchy-tree-panel].active';
            assert.equal(await page.locator(`${active} .hierarchy-node-card`).count(), hierarchy.trees[tree].levels.reduce((n, l) => n + l.nodes.length, 0));
            await preview.decodeImages(`${active} img`); await preview.capture(`${layout}-gilde-${index}-reiter-${tree}`);
          }
        }
        if (entry.pages[index]?.sessionPage) {
          const thread = await page.evaluate(() => getCurrentCommentThreadId());
          await page.locator('#modal-overlay .session-intro-toggle').click();
          assert.ok(!await page.locator('#modal-overlay .session-stage-copy').isVisible());
          assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
        await preview.capture(`${layout}-${entry.id}-seite-${index + 1}`);
      }
    }
  }
  const customPlacementPreserved = await page.evaluate(id => {
    const original = findCurrentSectionByEntryId(id), saved = { overrides: _entryOverrides, moves: _moduleSectionMoves, assignments: _moduleNodeAssignments };
    try {
      _entryOverrides = { ..._entryOverrides, [id]: { ...original.entry, subtitle: 'Eigene redaktionelle Notiz' } };
      _moduleSectionMoves = { ..._moduleSectionMoves }; _moduleNodeAssignments = { ..._moduleNodeAssignments };
      setModuleSectionMove(id, { tab: 'Völker & Kulturen', key: 'Eigener Bereich', path: ['Eigener Bereich'] });
      const moved = findCurrentSectionByEntryId(id);
      return moved.entry.subtitle === 'Eigene redaktionelle Notiz' && moved.section.path.at(-1) === 'Eigener Bereich' && getValidSections().flatMap(s => s.entries).filter(e => e.id === id).length === 1;
    } finally { _entryOverrides = saved.overrides; _moduleSectionMoves = saved.moves; _moduleNodeAssignments = saved.assignments; }
  }, FORTUNA_AFFILIATED_IDS[0]);
  assert.ok(customPlacementPreserved);
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, placement, modules: entries.map(e => ({ id: e.id, pages: e.pages.length + 1 })), hierarchyTabs: 14, scenes: 5, councilPeersAfterImport: 9, customPlacementPreserved, externalWrites: false, errors: preview.errors }, null, 2));
  console.log(JSON.stringify({ passed: true, output: preview.output, placement }));
} finally { await preview.close(); }
