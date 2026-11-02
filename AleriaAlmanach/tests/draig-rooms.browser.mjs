import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { DRAIG_ROOMS } from '../modules/castell-draig-rooms/room-pages.mjs';

const payload = JSON.parse(await readFile(new URL('../assets/castell-draig/wohntrakte-zimmer-2026-11-01-v2/module-import.json', import.meta.url), 'utf8'));
const preview = await openVenueBrowserPreview('draig-rooms-v2');
const { page } = preview;
try {
  const setup = await page.evaluate(payload => {
    applyModuleStorePayload({ version: 5, customSections: [{ ...payload.section, entries: [payload.entry] }] });
    const entry = getValidSections().flatMap(section => section.entries).find(entry => entry.id === payload.entry.id);
    const normalized = sanitizeModuleEntry(JSON.parse(JSON.stringify(entry)));
    return { entry, titles: getPages(entry).map(page => page.pageTitle),
      rooms: normalized.pages.filter(page => page.commentThreadKey?.startsWith('wohntrakte-')).map(page => ({
        key: page.commentThreadKey, date: page.sessionDateAleria, intro: page.sessionIntro, image: page.image
      })),
      endpoints: getSceneTransitionEndpoints().filter(endpoint => endpoint.entryId === entry.id && endpoint.threadId.includes('::session:wohntrakte-')) };
  }, payload);
  assert.equal(setup.titles.length, 11);
  assert.ok(!setup.titles.some(title => /Verlauf/.test(title)));
  assert.equal(setup.endpoints.length, 8);
  assert.equal(new Set(setup.endpoints.map(endpoint => endpoint.threadId)).size, 8);
  assert.deepEqual(setup.rooms, payload.entry.pages.filter(page => page.commentThreadKey?.startsWith('wohntrakte-')).map(page => ({
    key: page.commentThreadKey, date: page.sessionDateAleria, intro: page.sessionIntro, image: page.image
  })));
  const checks = [];
  for (const [layout, viewport] of [['desktop', { width: 1460, height: 1000 }], ['phone', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    for (const room of DRAIG_ROOMS) {
      const index = payload.entry.pages.findIndex(page => page.commentThreadKey === `wohntrakte-${room.id}`);
      await preview.openPage(setup.entry, index);
      await preview.decodeImages('#modal-overlay img[src*="/rooms-v2/"]');
      assert.equal(await page.locator('#modal-overlay .session-stage-title').textContent(), room.title);
      assert.equal(await page.locator('#modal-overlay [data-action="open-comment-form"]').count(), 1);
      const thread = await page.evaluate(() => getCurrentCommentThreadId());
      assert.equal(thread, `${payload.entry.id}::session:wohntrakte-${room.id}`);
      const toggle = page.locator('#modal-overlay .session-intro-toggle');
      await toggle.focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('#modal-overlay .session-stage-copy').isVisible(), false);
      await page.keyboard.press('Enter');
      assert.ok(await page.locator('#modal-overlay .session-stage-copy').isVisible());
      assert.ok(await page.locator('#modal-overlay .comments-scroll').evaluate(el => el.clientHeight > 60));
      const bounds = await page.locator('#modal-overlay .modal-card').evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth }));
      assert.ok(bounds.scrollWidth <= bounds.width + 2, `${layout}: ${room.id}`);
      checks.push({ layout, room: room.id, thread, ...bounds });
      await preview.capture(`${layout}-${room.id}`);
    }
  }
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, pages: 11, roomScenes: 8,
    removedVerlauf: true, independentThreads: true, importRoundtrip: true, externalWritesBlocked: true,
    desktopAndPhone: true, errors: preview.errors, checks }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output: preview.output, roomScenes: 8, views: checks.length }));
} finally { await preview.close(); }
