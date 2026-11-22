import assert from 'node:assert/strict';
import { mkdir, writeFile, cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildGwynthorCityPlaces } from '../modules/gwynthor-stadtorte/stadtorte-module.mjs';
import { GWYNTHOR_CITY_PATH } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';

const entries = buildGwynthorCityPlaces();
const ids = entries.map(entry => entry.id);
const pageCounts = Object.fromEntries(entries.map(entry => [entry.id, entry.pages.length]));
const newIds = new Set(['gwynthor-altstadt', 'gwynthor-nordtor', 'gwynthor-vorstadt']);
const preview = await openVenueBrowserPreview('gwynthor-stadtviertel-20261123', { entryId: 'gwynthor-altstadt', localOnly: true });
const { page } = preview;
const output = resolve('diagnostics/gwynthor-stadtviertel-20261123/browser', `run-${Date.now()}`);
await mkdir(output, { recursive: true });
try {
  await page.evaluate(() => {
    window._fb = getLocalCommentBackend();
    _fbReady = true;
    window.dispatchEvent(new Event('fb-ready'));
  });
  const setup = await page.evaluate(ids => ids.map(id => {
    const matches = getValidSections().flatMap(section => section.entries
      .filter(entry => entry.id === id).map(entry => ({ section, entry })));
    const entry = matches[0]?.entry;
    return { id, count: matches.length, entry, path: getSectionPathParts(matches[0]?.section),
      imported: sanitizeModuleEntry(JSON.parse(JSON.stringify(entry))),
      transitions: getSceneTransitionEndpoints().filter(endpoint => endpoint.entryId === id) };
  }), ids);
  for (const item of setup) {
    assert.equal(item.count, 1); assert.deepEqual(item.path, GWYNTHOR_CITY_PATH);
    assert.equal(item.entry.pages.length, pageCounts[item.id]);
    assert.equal(item.transitions.length, pageCounts[item.id]);
    assert.deepEqual(item.imported.pages.map(p => [p.commentThreadKey, p.sessionPage, p.sessionIntro, p.imagePosition, p.imageFit]),
      item.entry.pages.map(p => [p.commentThreadKey, p.sessionPage, p.sessionIntro, p.imagePosition, p.imageFit]));
  }
  const measurements = [], threads = new Set(), screenshots = [];
  for (const [layout, viewport] of [
    ['desktop', { width: 1460, height: 1000 }], ['phone', { width: 390, height: 844 }], ['narrow', { width: 320, height: 800 }]
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(city => {
      closeModal(); switchTab('Völker & Kulturen', { resetPath: true, render: true });
      setActiveArchivePath('Völker & Kulturen', city); expandArchiveHierarchyPath('Völker & Kulturen', city); renderAll();
    }, GWYNTHOR_CITY_PATH);
    for (const id of ids) assert.equal(await page.locator(`.entry-card-open[data-entry-id="${id}"]`).count(), 1);
    await preview.decodeImages('.entry-card img[src*="/gwynthor-stadtorte/"]');
    for (const id of newIds) {
      const card = page.locator('.entry-card').filter({ has: page.locator(`.entry-card-open[data-entry-id="${id}"]`) });
      await card.screenshot({ path: resolve(preview.output, `${layout}-${id}-card.png`) });
      screenshots.push(`${layout}-${id}-card.png`);
    }
    for (const { entry } of setup) {
      await page.locator(`.entry-card-open[data-entry-id="${entry.id}"]`).click();
      for (let index = 0; index < entry.pages.length; index++) {
        const current = entry.pages[index];
        await page.locator(`#modal-overlay [data-modal-action="jump-page"][data-page-index="${index}"]`).click();
        await page.locator('#modal-overlay .session-stage-title').filter({ hasText: current.pageTitle }).waitFor();
        await preview.decodeImages('#modal-overlay img[src*="/gwynthor-stadtorte/"]');
        const thread = await page.evaluate(() => getCurrentCommentThreadId());
        assert.equal(await page.locator('#modal-overlay .session-art-col > img').evaluate(el => getComputedStyle(el).objectPosition), current.imagePosition.replace('center', '50%'));
        assert.ok(thread.endsWith(`::session:${current.commentThreadKey}`)); threads.add(thread);
        const comments = page.locator('#modal-overlay .comments-scroll');
        await comments.getByText(current.sessionEmptyTitle, { exact: true }).waitFor();
        assert.equal(await page.locator('#modal-overlay [data-action="open-comment-form"]').count(), 1);
        assert.equal(await page.locator('#modal-overlay [data-scene-transition-action="open-dialog"]').count(), 1);
        const toggle = page.locator('#modal-overlay .session-intro-toggle');
        const intro = page.locator('#modal-overlay .session-stage-copy');
        const initiallyVisible = await intro.isVisible();
        await toggle.focus(); await page.keyboard.press('Enter');
        assert.equal(await intro.isVisible(), !initiallyVisible);
        const paragraphs = await intro.evaluate((el, html) => {
          const expected = new DOMParser().parseFromString(html, 'text/html');
          const texts = root => Array.from(root.querySelectorAll('p'), paragraph => paragraph.textContent.trim());
          return { actual: texts(el), expected: texts(expected.body) };
        }, current.sessionIntro);
        assert.deepEqual(paragraphs.actual, paragraphs.expected, `${layout} ${current.pageTitle}: intro text`);
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
        await page.keyboard.press('Enter');
        assert.equal(await intro.isVisible(), initiallyVisible);
        if (index === 0) {
          const composerButton = page.locator('#modal-overlay [data-action="open-comment-form"]');
          await composerButton.focus(); await composerButton.press('Enter');
          await page.locator('#comment-form-overlay.active').waitFor();
          await page.locator('#comment-form-overlay [data-action="close-comment-form"]').click();
          await page.locator('#comment-form-overlay.active').waitFor({ state: 'hidden' });
          assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
          await page.locator('#modal-overlay [data-scene-transition-action="open-dialog"]').click();
          await page.locator('#scene-transition-overlay.active').waitFor();
          const destination = setup[(ids.indexOf(entry.id) + 1) % setup.length].transitions[0];
          await page.locator('#scene-transition-target-search').fill(destination.pageTitle);
          const target = page.locator('#scene-transition-overlay [data-scene-transition-action="select-target"]')
            .filter({ hasText: destination.pageTitle });
          assert.equal(await target.count(), 1);
          await target.click();
          assert.equal(await page.locator('#scene-transition-target').inputValue(), destination.threadId);
          if (newIds.has(entry.id)) {
            await preview.capture(`${layout}-${entry.id}-transition`);
            screenshots.push(`${layout}-${entry.id}-transition.png`);
          }
          await page.locator('#scene-transition-overlay header [data-scene-transition-action="close-dialog"]').click();
          await page.locator('#scene-transition-overlay.active').waitFor({ state: 'hidden' });
          assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
        }
        const bounds = await page.locator('#modal-overlay .modal-card').evaluate(el => ({
          width: el.clientWidth, scrollWidth: el.scrollWidth, height: el.clientHeight, scrollHeight: el.scrollHeight
        }));
        assert.ok(bounds.scrollWidth <= bounds.width + 2, `${layout} ${current.pageTitle}: horizontal overflow`);
        assert.ok(await page.locator('#modal-overlay .comments-scroll').evaluate(el => el.clientHeight > 60));
        measurements.push({ layout, id: entry.id, index, thread, ...bounds });
        if (newIds.has(entry.id)) {
          if (!initiallyVisible) await toggle.click();
          await page.evaluate(() => {
            document.activeElement?.blur();
            for (const node of document.querySelectorAll('#modal-overlay .session-stage-bar, #modal-overlay .session-content, #modal-overlay .session-footer')) node.scrollTop = 0;
          });
          await preview.capture(`${layout}-${entry.id}-${index}`);
          screenshots.push(`${layout}-${entry.id}-${index}.png`);
          if (!initiallyVisible) await toggle.click();
        }
      }
      await page.evaluate(() => closeModal());
    }
  }
  assert.equal(threads.size, 20); assert.deepEqual(preview.errors, []);
  const report = { passed: true, modules: ids, pagesPerModule: pageCounts, cases: measurements.length,
    cardsOnCityLevel: true, distinctThreads: threads.size, importRoundtrip: true,
    introTextVerified: true, keyboardIntroToggle: true, localCommentBackend: true,
    externalWritesBlocked: true, liveAccount: false,
    commentComposerOpenClose: true, transitionDialogSearchAndCancel: true,
    errors: preview.errors, measurements, screenshots };
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await cp(preview.output, output, { recursive: true });
  console.log(JSON.stringify({ passed: true, output, cases: measurements.length, screenshots: screenshots.length }));
} finally { await preview.close(); }
