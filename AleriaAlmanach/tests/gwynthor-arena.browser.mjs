import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildGwynthorArena, ARENA_SECTION } from '../modules/gwynthor-arena/arena-module.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, `.tmp/gwynthor-arena/browser-${Date.now()}`);
const entry = buildGwynthorArena();
await mkdir(output, { recursive: true });

// Loading a bundled module twice must not create two archive cards, even when
// the section already exists. A saved entry with this identity takes priority.
const bundled = await readFile(new URL('../modules/gwynthor-arena/arena-data.js', import.meta.url), 'utf8');
for (const initial of [[], [{ ...ARENA_SECTION, entries: [] }], [{ ...ARENA_SECTION, entries: [{ id: entry.id, title: 'Existing saved entry' }] }]]) {
  const context = vm.createContext({ SECTIONS: initial });
  vm.runInContext(bundled, context);
  vm.runInContext(bundled, context);
  assert.equal(context.SECTIONS.flatMap(s => s.entries).filter(e => e.id === entry.id).length, 1);
  if (initial[0]?.entries[0]?.title === 'Existing saved entry') assert.equal(context.SECTIONS[0].entries[0].title, 'Existing saved entry');
}
const manifest = JSON.parse(await readFile(new URL('../assets/gwynthor-arena/image-prompts.json', import.meta.url), 'utf8'));
const results = JSON.parse(await readFile(new URL('../assets/gwynthor-arena/image-results.json', import.meta.url), 'utf8'));
for (const job of manifest.entries) {
  const bytes = await readFile(resolve(root, job.destination));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), results.images.find(r => r.id === job.id)?.sha256);
  assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2);
}

const server = await startChartQualityServer(root);
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const readCache = new Map();
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === server.origin) return route.continue();
    const sdk = url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
    const existingImage = url.origin === 'https://i.imgur.com';
    if (request.method() === 'GET' && (sdk || existingImage)) {
      if (!readCache.has(request.url())) readCache.set(request.url(), fetch(request.url()).then(async response => ({
        status: response.status, contentType: response.headers.get('content-type'),
        headers: { 'access-control-allow-origin': '*' }, body: Buffer.from(await response.arrayBuffer())
      })));
      return route.fulfill(await readCache.get(request.url()));
    }
    return route.abort();
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => typeof openModal === 'function');
  await page.waitForFunction(() => ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter = page.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  assert.equal(await page.evaluate(id => getValidSections().flatMap(s => s.entries).filter(e => e.id === id).length, entry.id), 1);
  assert.equal(await page.evaluate(entry => getPages(entry).length, entry), 5);
  const threads = await page.evaluate(entry => entry.pages.slice(1).map((p, index) => {
    const thread = getSessionThreadId(entry.id, getPageCommentThreadKey(p, index + 1));
    return { thread, location: parseCommentThreadLocation(thread) };
  }), entry);
  assert.equal(new Set(threads.map(t => t.thread)).size, 3);
  for (const { location } of threads) {
    assert.equal(location.kind, 'session');
    assert.equal(location.baseEntryId, entry.id);
    assert.ok(entry.pages.some(p => p.commentThreadKey === location.pageKey));
  }
  // Check the real renderers and controls at both layout sizes. External writes
  // remain blocked throughout; no characters, comments or live scenes are saved.
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(viewport);
    for (let index = 0; index < 5; index++) {
      await page.evaluate(({ entry, index }) => { closeModal(); openModal(entry, { pageIndex: index }); }, { entry, index });
      await page.locator('#modal-overlay').waitFor({ state: 'visible' });
      const broken = await page.locator('#modal-overlay img').evaluateAll(async images => {
        const arena = images.filter(image => image.src.includes('/gwynthor-arena/'));
        await Promise.all(arena.map(image => image.decode().catch(() => {})));
        return arena.filter(image => !image.naturalWidth).map(image => image.src);
      });
      assert.deepEqual(broken, [], `${layout}, page ${index + 1}`);
      if (index > 0 && index < 4) {
        assert.equal(await page.locator('#modal-overlay .session-stage-title').textContent(), entry.pages[index].pageTitle);
        assert.ok(await page.locator('#modal-overlay .comments-scroll').evaluate(el => el.clientHeight > 60));
        const intro = page.locator('#modal-overlay .session-stage-copy');
        assert.ok(await intro.isVisible());
        const toggle = page.locator('#modal-overlay .session-intro-toggle');
        const comments = page.locator('#modal-overlay .comments-scroll');
        const originalComments = await comments.elementHandle();
        const originalThread = await page.evaluate(() => getCurrentCommentThreadId());
        const expandedHeight = await comments.evaluate(el => el.clientHeight);
        await toggle.click();
        assert.equal(await intro.isVisible(), false);
        assert.equal(await toggle.innerText(), 'Einleitung anzeigen');
        await page.screenshot({ path: resolve(output, `${layout}-seite-${index + 1}-eingeklappt.png`) });
        const collapsedHeight = await comments.evaluate(el => el.clientHeight);
        assert.ok(collapsedHeight > expandedHeight + 25,
          `${layout}: comment viewport ${expandedHeight} -> ${collapsedHeight}; ` +
          JSON.stringify(await page.locator('#modal-overlay .session-content').evaluate(el => ({
            height: el.clientHeight, scrollHeight: el.scrollHeight,
            children: [...el.children].map(child => ({ class: child.className, height: child.clientHeight }))
          }))));
        assert.ok(await originalComments.evaluate(el => el.isConnected && el === document.querySelector('#modal-overlay .comments-scroll')));
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), originalThread);
        assert.ok(await page.locator('#modal-overlay .session-stage-title').isVisible());
        assert.ok(await page.locator('#modal-overlay .session-stage-actions').isVisible());
        // Native summary controls must support the keyboard and restore text.
        await toggle.focus();
        await page.keyboard.press('Enter');
        assert.ok(await intro.isVisible());
        assert.equal(await toggle.innerText(), 'Einleitung einklappen');
        // Focus mode may hide the whole introduction without changing its state.
        await page.locator('#modal-overlay .session-focus-toggle').click();
        assert.equal(await toggle.isVisible(), false);
        await page.locator('#modal-overlay .session-focus-toggle').click();
        assert.ok(await toggle.isVisible());
        assert.ok(await intro.isVisible());
        if (layout === 'mobile') {
          await intro.evaluate(el => { el.scrollTop = el.scrollHeight; });
          assert.ok(await intro.evaluate(el => el.scrollTop + el.clientHeight >= el.scrollHeight - 2));
        }
        assert.equal(await page.locator('#modal-overlay .session-focus-toggle').count(), 1);
      }
      await page.screenshot({ path: resolve(output, `${layout}-seite-${index + 1}.png`) });
    }
  }
  await page.goto(`${server.origin}/Orte/grossstadt.html?ort=gwynthor`);
  await page.waitForFunction(() => document.body.textContent.includes('Kampfarena'));
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: true, contentPages: 4, interactiveScenes: 3,
    commentPage: true, uniqueThreads: true, registrationIdempotent: true, images: 4,
    desktopAndMobile: true, collapsibleIntroductions: true, largerCommentViewport: true,
    commentsRemainMounted: true, keyboardAndFocusMode: true,
    externalWritesBlocked: true, release: 'local-only' }, null, 2));
  console.log(`PASS: ${output}`);
} finally {
  await browser?.close();
  await server.close();
}
