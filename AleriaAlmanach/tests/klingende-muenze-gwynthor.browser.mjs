import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildTradingPost, buildTradingPostFactions } from '../modules/klingende-muenze-gwynthor/post-module.mjs';
import { POST_SECTION } from '../modules/klingende-muenze-gwynthor/post-section.mjs';
import { AFFILIATED_ENTRY_IDS } from '../modules/klingende-muenze-gwynthor/post-members.mjs';
const entries = [buildTradingPost(), buildTradingPostFactions()];
const preview = await openVenueBrowserPreview('klingende-muenze-gwynthor'), { page } = preview;
try {
  const placement = await page.evaluate(({ key, ids }) => {
    const sections = getValidSections();
    return { target: sections.find(s => s.path?.at(-1) === key)?.entries.map(e => ({ id: e.id, title: e.title })),
      counts: Object.fromEntries(ids.map(id => [id, sections.flatMap(s => s.entries).filter(e => e.id === id).length])),
      otherGuildMembers: sections.filter(s => s.path?.includes('Gwynthor')).flatMap(s => s.entries).flatMap(e => (e.pages || []).flatMap(p => (p.biography?.connections || []).filter(c => /Klingende Münze/.test(c.name || '') && /Mitglied/.test(c.detail || '')).map(c => ({ entryId: e.id, title: e.title, affiliation: c.detail })))) };
  }, { key: POST_SECTION.key, ids: [...entries.map(e => e.id), ...AFFILIATED_ENTRY_IDS] });
  assert.equal(placement.target.length, 5);
  assert.ok(Object.values(placement.counts).every(n => n === 1));
  const importRoundTrip = await page.evaluate(entries => entries.map(entry => {
    const restored = normalizeModuleImportPayload({ type: 'aleria-module-package', module: { section: { key: 'Die Klingende Münze - Gwynthor', tab: 'Völker & Kulturen' }, entry } }).entry;
    return { id: restored.id, pages: restored.pages.length, councilPeers: restored.pages[2]?.hierarchy?.trees[0]?.levels[0]?.nodes.length };
  }), entries);
  assert.equal(importRoundTrip[0].councilPeers, 8);
  assert.deepEqual(importRoundTrip.map(result => result.pages), entries.map(entry => entry.pages.length));
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(viewport);
    await page.evaluate(section => { closeModal(); _activeTab = section.tab; setActiveArchivePath(section.tab, section.path); expandArchiveHierarchyPath(section.tab, section.path); renderAll(); }, POST_SECTION);
    for (const id of [...entries.map(entry => entry.id), ...AFFILIATED_ENTRY_IDS]) assert.equal(await page.locator(`.entry-card-open[data-entry-id="${id}"]`).count(), 1);
    await preview.decodeImages('.entry-card-open img');
    await preview.capture(`${layout}-archiv-reiter`);
    for (const entry of entries) {
      const count = await page.evaluate(e => getPages(e).length, entry);
      assert.equal(count, entry.pages.length + 1);
      for (let index = 0; index < count; index++) {
        await preview.openPage(entry, index);
        await preview.decodeImages('#modal-overlay img[src*="klingende-muenze-gwynthor"]');
        const hierarchy = entry.pages[index]?.hierarchy;
        if (hierarchy) {
          const tabs = page.locator('#modal-overlay [data-hierarchy-tree-tab]');
          assert.equal(await tabs.count(), hierarchy.trees.length);
          for (let tree = 0; tree < hierarchy.trees.length; tree++) {
            await tabs.nth(tree).click();
            const active = '#modal-overlay [data-hierarchy-tree-panel].active';
            assert.equal(await page.locator(`${active} .hierarchy-node-card`).count(), hierarchy.trees[tree].levels.reduce((n, l) => n + l.nodes.length, 0));
            await preview.decodeImages(`${active} img`);
            await preview.capture(`${layout}-gilde-${index}-reiter-${tree}`);
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
  // An intentional archive move and an editor override still win over builtins.
  const overridePreserved = await page.evaluate(id => {
    const original = findCurrentSectionByEntryId(id), title = original.entry.title;
    const saved = { overrides: _entryOverrides, moves: _moduleSectionMoves, assignments: _moduleNodeAssignments };
    try {
      _entryOverrides = { ..._entryOverrides, [id]: { ...original.entry, subtitle: 'Eigene redaktionelle Notiz' } };
      _moduleSectionMoves = { ..._moduleSectionMoves }; _moduleNodeAssignments = { ..._moduleNodeAssignments };
      setModuleSectionMove(id, { tab: 'Völker & Kulturen', key: 'Eigener Bereich', path: ['Eigener Bereich'] });
      const moved = findCurrentSectionByEntryId(id);
      return moved.entry.title === title && moved.entry.subtitle === 'Eigene redaktionelle Notiz' && moved.section.path.at(-1) === 'Eigener Bereich' && getValidSections().flatMap(s => s.entries).filter(e => e.id === id).length === 1;
    } finally { _entryOverrides = saved.overrides; _moduleSectionMoves = saved.moves; _moduleNodeAssignments = saved.assignments; }
  }, AFFILIATED_ENTRY_IDS[0]);
  assert.ok(overridePreserved);
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, placement, importRoundTrip, modules: entries.map(e => ({ id: e.id, pages: e.pages.length + 1 })), overridePreserved, externalWrites: false, errors: preview.errors }, null, 2));
  console.log(JSON.stringify({ passed: true, output: preview.output, placement }));
} finally { await preview.close(); }
