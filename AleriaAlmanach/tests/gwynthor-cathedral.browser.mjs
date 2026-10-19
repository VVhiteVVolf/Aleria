import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildGwynthorCathedral, CATHEDRAL_SECTION } from '../modules/gwynthor-cathedral/cathedral-module.mjs';
import { PATRIARCH, ARIANWEN, PEREDUR, ANGHARAD } from '../modules/gwynthor-cathedral/cathedral-people.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, `.tmp/gwynthor-cathedral/browser-${Date.now()}`);
const entry = buildGwynthorCathedral(), hierarchy = entry.pages[2].hierarchy;
await mkdir(output, { recursive: true });
const manifest = JSON.parse(await readFile(new URL('../assets/gwynthor-cathedral/image-prompts.json', import.meta.url), 'utf8'));
const results = JSON.parse(await readFile(new URL('../assets/gwynthor-cathedral/image-results.json', import.meta.url), 'utf8'));
assert.equal(manifest.entries.length, 9);
for (const job of manifest.entries) {
  const bytes = await readFile(resolve(root, job.destination));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), results.images.find(image => image.id === job.id)?.sha256);
  assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2);
}
const source = JSON.parse(await readFile(new URL('../modules/gwynthor-cathedral/sources/patriarch-evidence.json', import.meta.url), 'utf8'));
assert.equal(source.comments.length, 42);
assert.equal(source.distinctTexts, 36);
assert.equal(source.liveWrites, 0);
assert.equal(hierarchy.trees[0].levels[1].nodes.length, 9);
assert.deepEqual(hierarchy.trees[1].levels.slice(1, 7).map(level => level.nodes.length), [1, 6, 8, 8, 4, 4]);
assert.deepEqual(hierarchy.trees[3].levels.slice(1).map(level => level.nodes.length), [4, 4]);
assert.ok(hierarchy.trees[0].levels[1].nodes.some(node => node.title === PEREDUR.name));
assert.ok(hierarchy.trees[1].levels[2].nodes.some(node => node.title === ANGHARAD.name));
assert.ok(hierarchy.trees[3].levels[2].nodes.some(node => node.title === ARIANWEN.name));
assert.doesNotMatch(JSON.stringify(entry.pages[1].biography), /Kommentar|Anhörung\s+[IVX]+\b|session:|Quellbeleg/);

const server = await startChartQualityServer(root);
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1050 }, reducedMotion: 'reduce' });
  const cache = new Map();
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === server.origin) return route.continue();
    const sdk = url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
    if (request.method() === 'GET' && (sdk || url.origin === 'https://i.imgur.com')) {
      if (!cache.has(request.url())) cache.set(request.url(), fetch(request.url()).then(async response => ({
        status: response.status, contentType: response.headers.get('content-type'),
        headers: { 'access-control-allow-origin': '*' }, body: Buffer.from(await response.arrayBuffer())
      })));
      return route.fulfill(await cache.get(request.url()));
    }
    return route.abort();
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => typeof openModal === 'function');
  await page.waitForFunction(() => ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter = page.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  assert.equal(await page.evaluate(id => getValidSections().flatMap(section => section.entries).filter(entry => entry.id === id).length, entry.id), 1);
  assert.equal(await page.evaluate(entry => getPages(entry).length, entry), entry.pages.length);
  const runtimeCounts = await page.evaluate(hierarchy => sanitizeHierarchyData(hierarchy).trees.map(tree => tree.levels.map(level => level.nodes.length)), hierarchy);
  assert.deepEqual(runtimeCounts, hierarchy.trees.map(tree => tree.levels.map(level => level.nodes.length)));
  const threads = await page.evaluate(entry => entry.pages.slice(3).map((page, index) => getSessionThreadId(entry.id, getPageCommentThreadKey(page, index + 3))), entry);
  assert.equal(new Set(threads).size, 8);
  for (const [layout, viewport] of [['desktop', { width: 1600, height: 1050 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(viewport);
    for (let index = 0; index < 12; index++) {
      await page.evaluate(({ entry, index }) => { closeModal(); openModal(entry, { pageIndex: index }); }, { entry, index });
      await page.locator('#modal-overlay').waitFor({ state: 'visible' });
      const broken = await page.locator('#modal-overlay img').evaluateAll(async images => {
        const local = images.filter(image => /gwynthor-cathedral|Stammb|Religionen/.test(image.src));
        await Promise.all(local.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
        return local.filter(image => !image.naturalWidth).map(image => image.src);
      });
      assert.deepEqual(broken, [], `${layout}, page ${index + 1}`);
      if (index === 2) {
        const tabs = page.locator('#modal-overlay [data-hierarchy-tree-tab]');
        assert.equal(await tabs.count(), 4);
        for (let tree = 0; tree < 4; tree++) {
          await tabs.nth(tree).click();
          const panel = page.locator('#modal-overlay [data-hierarchy-tree-panel].active');
          assert.equal(await panel.locator('.hierarchy-node-card').count(), hierarchy.trees[tree].levels.reduce((sum, level) => sum + level.nodes.length, 0));
          if (tree === 0) assert.equal(await panel.locator('[data-hierarchy-level="1"] .hierarchy-node-card').count(), 9);
          if (tree === 1) assert.equal(await panel.locator('[data-hierarchy-level="2"] .hierarchy-node-card').count(), 6);
          if (tree === 3) assert.equal(await panel.locator('[data-hierarchy-level="2"] .hierarchy-node-card').count(), 4);
          await page.screenshot({ path: resolve(output, `${layout}-stab-${tree + 1}.png`) });
        }
      }
      if (index >= 3 && index < 11) {
        const intro = page.locator('#modal-overlay .session-stage-copy');
        assert.ok(await intro.isVisible());
        const toggle = page.locator('#modal-overlay .session-intro-toggle');
        const comments = page.locator('#modal-overlay .comments-scroll');
        const before = await comments.evaluate(el => el.clientHeight);
        await toggle.click();
        assert.equal(await intro.isVisible(), false);
        assert.ok(await comments.evaluate(el => el.clientHeight) > before + 20);
        await toggle.focus(); await page.keyboard.press('Enter');
        assert.ok(await intro.isVisible());
      }
      await page.screenshot({ path: resolve(output, `${layout}-seite-${index + 1}.png`) });
    }
  }
  // Real editor round trips must preserve the ninth prelate and all knight slots.
  await page.setViewportSize({ width: 1600, height: 1050 });
  await page.evaluate(({ entry, section }) => { closeModal(); _moduleEditorAuthorized = true; openModuleEditor({ entry, section }, { sourceKind: 'local-quality-check' }); }, { entry, section: CATHEDRAL_SECTION });
  const card = page.locator('#me-pages .module-page-card').nth(2);
  const prelateLevel = card.locator('.hierarchy-editor-tree-row').nth(0).locator('.hierarchy-editor-level-row').nth(1);
  assert.equal(await prelateLevel.locator('.hierarchy-editor-node-row').count(), 9);
  const collected = await page.evaluate(() => collectModuleEditorPayload().entry.pages[2].hierarchy);
  assert.deepEqual(collected.trees.map(tree => tree.levels.map(level => level.nodes.length)), runtimeCounts);
  await prelateLevel.locator('[data-module-editor-action="add-hierarchy-node"]').click();
  assert.equal(await prelateLevel.locator('.hierarchy-editor-node-row').count(), 10);
  assert.equal(await page.evaluate(() => collectModuleEditorPayload().entry.pages[2].hierarchy.trees[0].levels[1].nodes.length), 10);
  await page.evaluate(() => closeModuleEditor());
  await page.evaluate(entry => { openModal(entry, { pageIndex: 2 }); openModuleEditorForCurrent(); }, entry);
  const inlineAdd = page.locator('.inline-module-edit-pane [data-inline-action="add-hierarchy-node"][data-hierarchy-tree-index="0"][data-hierarchy-level-index="1"]');
  await inlineAdd.click();
  assert.equal(await page.evaluate(() => getInlineDraftPage().hierarchy.trees[0].levels[1].nodes.length), 10);
  await page.evaluate(() => cancelInlineModuleEdit());
  assert.equal(await page.evaluate(entry => getRenderableEntry(entry).pages[2].hierarchy.trees[0].levels[1].nodes.length, entry), 9);
  await page.goto(`${server.origin}/Orte/grossstadt.html?ort=gwynthor`);
  await page.waitForFunction(() => document.body.textContent.includes('Große Kathedrale der Neun'));
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: true, contentPages: 11, commentPage: true,
    hierarchyTabs: 4, prelates: 9, paladins: 6, penitents: 4, absolved: 4, scenes: 8, newImages: 9,
    namedMembers: [PATRIARCH.name, PEREDUR.name, ANGHARAD.name, ARIANWEN.name],
    modalAndInlineEditor: true, desktopAndMobile: true, collapsibleIntros: true,
    liveWrites: 0, release: 'local-only' }, null, 2));
  console.log(`PASS: ${output}`);
} finally { await browser?.close(); await server.close(); }
