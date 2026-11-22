import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { federkielRegistrations } from '../modules/federkiel-gwynthor/federkiel-module.mjs';
import { FEDERKIEL_SECTION } from '../modules/federkiel-gwynthor/federkiel-section.mjs';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';

const entries = federkielRegistrations().map(item => item.entry);
const preview = await openVenueBrowserPreview('federkiel-gwynthor-20261122', { localOnly: true });
const { page } = preview;
const modal = page.locator('#modal-overlay');
const ownArt = 'img[src*="federkiel-gwynthor/"], img[src*="/gilden/federkiel-v2.webp"]';
const pageNavigation = '.modal-page-tab[data-page-index]';
const checked = [];

async function dismissOfflineNotice() {
  const notice = page.locator('#app-status-toast').filter({ hasText: /vorübergehend offline|Online-Verbindung fehlt/ });
  if (await notice.isVisible()) await notice.locator('[data-action="dismiss-app-status"]').evaluate(button => button.click());
}

async function openArchiveCategory() {
  const { encodedPath, siblings } = await page.evaluate(({ tab, path }) => {
    const cityPath = path.slice(0, -1);
    switchTab(tab, { resetPath: true, render: false });
    setActiveArchivePath(tab, cityPath);
    expandArchiveHierarchyPath(tab, cityPath);
    renderAll();
    return {
      encodedPath: encodeArchivePathData(path),
      siblings: getValidSections().filter(section => getSectionPathParts(section).slice(0, -1).join('/') === cityPath.join('/'))
        .map(section => section.key)
    };
  }, FEDERKIEL_SECTION);
  assert.ok(siblings.includes('Der Markt der Fortuna - Gwynthor'));
  assert.ok(siblings.includes('Die Klingende Münze - Gwynthor'));
  await page.locator('.archive-hierarchy-tree').evaluate(tree => { tree.open = true; });
  const category = page.locator(`.archive-hierarchy-select[data-section-path="${encodedPath}"]`);
  assert.match(await category.locator('img').getAttribute('src'), /aushangeschild-v1\.webp$/);
  await category.click();
  assert.equal(await page.locator('.archive-hierarchy-content-heading h2').textContent(), FEDERKIEL_SECTION.key);
  const shown = await page.locator('.archive-browser-content .entry-card-open').evaluateAll(cards => cards.map(card => card.dataset.entryId));
  assert.deepEqual(shown.sort(), entries.map(entry => entry.id).sort());
  await preview.decodeImages(`.archive-browser-content .entry-card-open img[src*="federkiel-gwynthor/"], .archive-hierarchy-row-icon img[src*="aushangeschild-v1.webp"]`);
}

async function checkServices(width) {
  assert.equal(await modal.locator('.guild-services-scene').count(), 1);
  assert.equal(await modal.locator('.guild-service-card').count(), 6);
  assert.equal(await modal.locator('.guild-service-card img').count(), 6);
  const columns = await modal.locator('.guild-services-grid').evaluate(grid => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
  assert.equal(columns, width < 720 ? 1 : 2);
}

async function checkCourierRows(width) {
  const viewport = modal.locator('.hierarchy-chart-viewport');
  const rows = viewport.locator('.hierarchy-tree-panel.active [data-hierarchy-columns="4"]');
  assert.equal(await rows.count(), 3);
  for (const row of await rows.all()) {
    assert.deepEqual(await row.locator('h4').allTextContents(), Array(4).fill('Postkurier'));
    const tops = await row.locator('.hierarchy-node-card').evaluateAll(cards => cards.map(card => Math.round(card.getBoundingClientRect().top)));
    assert.equal(new Set(tops).size, 1, 'the four dispatch seats share a visual row');
  }
  if (width === 1440) {
    const bounds = await viewport.evaluate(element => ({ available: element.clientWidth, used: element.scrollWidth }));
    assert.ok(bounds.used <= bounds.available + 2, `the four desktop seats fit: ${JSON.stringify(bounds)}`);
    for (const [number, row] of (await rows.all()).entries()) {
      await dismissOfflineNotice();
      await row.screenshot({ path: resolve(preview.output, `1440-kurierstaffel-${number + 1}.png`) });
    }
  }
  if (width < 720) {
    const reach = await viewport.evaluate(element => {
      const initial = element.scrollLeft;
      element.scrollLeft = element.scrollWidth;
      const result = { scrolled: element.scrollLeft, width: element.clientWidth, content: element.scrollWidth };
      element.scrollLeft = initial;
      return result;
    });
    assert.ok(reach.content > reach.width && reach.scrolled > 0, 'the whole four-card row is horizontally reachable');
  }
  await rows.first().locator('.hierarchy-node-card').first().scrollIntoViewIfNeeded();
}

async function checkHierarchy(entry, sourcePage, width) {
  assert.equal(await modal.locator('.hierarchy-side-image img').getAttribute('src'), sourcePage.image);
  const trees = sourcePage.hierarchy.trees;
  const tabs = modal.locator('[data-hierarchy-tree-tab]');
  assert.equal(await tabs.count(), trees.length);
  for (const [index, tree] of trees.entries()) {
    if (index) await tabs.nth(index).click();
    const panel = modal.locator('.hierarchy-tree-panel.active');
    assert.equal(await panel.getAttribute('data-hierarchy-tree-id'), tree.id);
    assert.equal(await panel.locator('.hierarchy-node-card').count(), tree.levels.reduce((sum, level) => sum + level.nodes.length, 0));
  }
  if (trees.length > 1) await tabs.first().click();
  if (entry.id.endsWith('-kurierstation')) await checkCourierRows(width);
}

async function checkSession(entry, sourcePage) {
  assert.equal(await modal.locator('.session-stage-title').textContent(), sourcePage.pageTitle);
  const sceneArt = modal.locator('.session-art-col img');
  assert.equal(await sceneArt.getAttribute('src'), sourcePage.image);
  if (sourcePage.imagePosition !== 'center') {
    assert.ok((await sceneArt.getAttribute('style')).includes(`object-position:${sourcePage.imagePosition};`));
  }
  const thread = await page.evaluate(() => getCurrentCommentThreadId());
  assert.equal(thread, `${entry.id}::session:${sourcePage.commentThreadKey}`);
  assert.deepEqual(await page.evaluate(() => getCurrentCommentCastIds()), sourcePage.sessionCast || []);
  await modal.getByText(sourcePage.sessionEmptyTitle, { exact: true }).waitFor({ state: 'visible' });
  const intro = modal.locator('.session-intro');
  const toggle = intro.locator('.session-intro-toggle');
  if (await intro.getAttribute('open') === null) await toggle.click();
  assert.ok(await intro.locator('.session-stage-copy').isVisible());
  await toggle.click();
  assert.ok(!await intro.locator('.session-stage-copy').isVisible());
  assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
  await toggle.click();
}

try {
  await page.evaluate(() => {
    const local = getLocalCommentBackend();
    window._fb = {
      loadComments: local.loadComments, loadCommentTurn: local.loadCommentTurn, loadRecentComments: local.loadRecentComments,
      loadCharacters: async () => [], loadCreatures: async () => []
    };
    _fbReady = true;
  });
  const roundTrip = await page.evaluate(({ entries, section }) => entries.map(entry => normalizeModuleImportPayload({
    type: 'aleria-module-package', module: { section, entry }
  }).entry), { entries, section: FEDERKIEL_SECTION });
  const imageSettings = entry => entry.pages.map(sourcePage => [sourcePage.image, sourcePage.imagePosition]);
  assert.deepEqual(roundTrip.map(imageSettings), entries.map(imageSettings));
  const dispatch = roundTrip.find(entry => entry.id.endsWith('-kurierstation')).pages[0].hierarchy.trees[0];
  assert.deepEqual(dispatch.levels.filter(level => level.nodes[0].title === 'Postkurier').map(level => level.columns), [4, 4, 4]);

  for (const [width, height] of [[1440, 1000], [390, 900], [320, 800]]) {
    await page.setViewportSize({ width, height });
    await openArchiveCategory();
    await dismissOfflineNotice();
    await preview.capture(`${width}-archiv`);
    for (const entry of entries) {
      await page.locator(`.archive-browser-content .entry-card-open[data-entry-id="${entry.id}"]`).click();
      await modal.waitFor({ state: 'visible' });
      assert.equal(await modal.locator(pageNavigation).count(), entry.pages.length);
      for (const [index, sourcePage] of entry.pages.entries()) {
        if (index) await modal.locator(pageNavigation).nth(index).click();
        await page.waitForFunction(title => document.querySelector('#modal-overlay .modal-page-title')?.textContent === title, sourcePage.pageTitle);
        await preview.decodeImages(`#modal-overlay :is(${ownArt})`);
        if (sourcePage.guildServicesPage) await checkServices(width);
        if (sourcePage.hierarchyPage) await checkHierarchy(entry, sourcePage, width);
        if (sourcePage.sessionPage) await checkSession(entry, sourcePage);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
        await dismissOfflineNotice();
        await preview.capture(`${width}-${entry.id}-${index + 1}`);
        checked.push({ width, entry: entry.id, page: sourcePage.pageTitle });
      }
      await page.keyboard.press('Escape');
      await modal.waitFor({ state: 'hidden' });
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await preview.openPage(entries[1], 1);
  await modal.locator('[data-action="open-comment-form"]').click();
  const commentForm = page.locator('#comment-form-overlay');
  await commentForm.waitFor({ state: 'visible' });
  await commentForm.locator('[data-action="close-comment-form"]').click();
  await commentForm.waitFor({ state: 'hidden' });
  await page.goto(`${preview.origin}/Fraktionen/index.html#fraktion-federkiel`);
  const faction = page.locator('#fraktion-federkiel');
  await faction.scrollIntoViewIfNeeded();
  assert.equal(await faction.locator('img').getAttribute('src'), 'assets/emblems/gilden/federkiel-v2.webp');
  await preview.decodeImages('#fraktion-federkiel img');
  await preview.capture('1440-fraktionsregister');
  assert.deepEqual(preview.errors, []);
  const report = {
    checked, viewports: [1440, 390, 320], localGetOnly: true, commentBackend: 'local read-only fixture',
    commentFormOpenedAndClosed: true, errors: preview.errors, count: checked.length
  };
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, checked: undefined, output: preview.output }));
} finally {
  await preview.close();
}
