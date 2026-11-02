import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { MARKETPLACE_ID } from '../modules/gwynthor-marktplatz/marketplace-module.mjs';
import { GWYNTHOR_CITY_PATH } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';
import { GWYNTHOR_NOTICE_BOARD_HREF } from '../modules/gwynthor-marktplatz/marketplace-scenes.mjs';

// Existing project harness: isolated browser, no live account, external writes
// blocked. Exercise the bundled module, rather than injecting a replacement.
const preview = await openVenueBrowserPreview('gwynthor-marktplatz', { entryId: MARKETPLACE_ID });
const { page } = preview;
try {
  const setup = await page.evaluate(id => {
    const matches = getValidSections().flatMap(section => section.entries
      .filter(entry => entry.id === id).map(entry => ({ section, entry })));
    const entry = matches[0]?.entry;
    const imported = sanitizeModuleEntry(JSON.parse(JSON.stringify(entry)));
    return {
      matches: matches.length, path: getSectionPathParts(matches[0].section), entry,
      pages: getPages(entry).length,
      transitions: getSceneTransitionEndpoints().filter(endpoint => endpoint.entryId === id),
      imported: imported.pages.map(p => ({ key: p.commentThreadKey, scene: p.sessionPage === true, intro: p.sessionIntro || '' }))
    };
  }, MARKETPLACE_ID);
  assert.equal(setup.matches, 1);
  assert.deepEqual(setup.path, GWYNTHOR_CITY_PATH);
  assert.equal(setup.pages, 9);
  assert.equal(setup.transitions.length, 8);
  assert.equal(new Set(setup.transitions.map(item => item.threadId)).size, 8);
  assert.deepEqual(setup.imported, setup.entry.pages.map(p => ({ key: p.commentThreadKey, scene: p.sessionPage === true, intro: p.sessionIntro || '' })));
  const measurements = [];
  for (const [layout, viewport] of [
    ['desktop', { width: 1460, height: 1000 }],
    ['phone', { width: 390, height: 844 }]
  ]) {
    await page.setViewportSize(viewport);
    await preview.openPage(setup.entry, 0);
    for (let index = 0; index < setup.pages; index++) {
      await page.locator(`#modal-overlay [data-modal-action="jump-page"][data-page-index="${index}"]`).click();
      const current = setup.entry.pages[index];
      if (index) await page.locator('#modal-overlay .session-stage-title').filter({ hasText: current.pageTitle }).waitFor();
      await preview.decodeImages('#modal-overlay img[src*="/gwynthor-marktplatz/"]');
      if (index) {
        assert.equal(await page.locator('#modal-overlay .session-stage-title').textContent(), current.pageTitle);
        const before = await page.evaluate(() => getCurrentCommentThreadId());
        assert.ok(before.endsWith(`::session:${current.commentThreadKey}`));
        assert.equal(await page.locator('#modal-overlay [data-action="open-comment-form"]').count(), 1);
        assert.equal(await page.locator('#modal-overlay [data-scene-transition-action="open-dialog"]').count(), 1);
        assert.ok(await page.locator('#modal-overlay .comments-scroll').evaluate(el => el.clientHeight > 60));
        const toggle = page.locator('#modal-overlay .session-intro-toggle');
        await toggle.focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#modal-overlay .session-stage-copy').isVisible(), false);
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), before);
        await page.keyboard.press('Enter');
        assert.ok(await page.locator('#modal-overlay .session-stage-copy').isVisible());
        if (current.commentThreadKey.endsWith('-anzeigetafel')) {
          assert.equal(await page.locator('#modal-overlay .session-stage-copy a').getAttribute('href'), GWYNTHOR_NOTICE_BOARD_HREF);
        }
      } else {
        assert.equal(await page.locator('#modal-overlay .session-page').count(), 0);
      }
      const bounds = await page.locator('#modal-overlay .modal-card').evaluate(el => ({
        width: el.clientWidth, scrollWidth: el.scrollWidth,
        height: el.clientHeight, scrollHeight: el.scrollHeight
      }));
      assert.ok(bounds.scrollWidth <= bounds.width + 2, `${layout}, page ${index}: horizontal overflow`);
      measurements.push({ layout, index, ...bounds });
      await preview.capture(`${layout}-${String(index).padStart(2, '0')}`);
    }
  }
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({
    passed: true, pages: setup.pages, scenes: setup.transitions.length,
    path: setup.path, importRoundtrip: true, navigation: true,
    keyboardIntroToggle: true, separateThreads: true, existingBoardLink: true,
    externalWritesBlocked: true, errors: preview.errors, measurements
  }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output: preview.output, pages: setup.pages, scenes: setup.transitions.length }));
} finally {
  await preview.close();
}
