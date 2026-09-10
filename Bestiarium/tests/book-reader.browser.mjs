// Optional acceptance suite. Use an existing Playwright install:
// node Bestiarium/tests/book-reader.browser.mjs <absolute path to playwright/index.mjs>
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderTopicArticle } from '../modules/topic-article/topic-article-template.mjs';

const { chromium } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : 'playwright');
const workspace = fileURLToPath(new URL('../../', import.meta.url));
const bookPath = '/Bestiarium/themen/wesen-des-infernalen/index.html';
const source = JSON.parse(await readFile(new URL('../themen/wesen-des-infernalen/thema.json', import.meta.url), 'utf8'));
const stress = structuredClone(source);
stress.sections.unshift({ id: 'test-content', title: 'Prüfinhalte · keine Lore', blocks: [
  { id: 'test-link', type: 'paragraph', content: [{ type: 'link', href: '#kapitel-v', children: ['Zum fünften Kapitel'] }] },
  { id: 'test-subheading', type: 'heading', content: ['Unterüberschrift auf eigener Seite'] },
  { id: 'test-long', type: 'paragraph', content: Array.from({ length: 170 }, (_, i) => [`Prüfabsatz ${i}. `, { type: 'strong', children: ['Langer formatierter Text bleibt vollständig erhalten. '] }, { type: 'em', children: ['Hervorhebung. '] }]).flat() },
  { id: 'test-table', type: 'table', caption: 'Lange Prüftabelle', columns: ['Nummer', 'Wert'], rows: Array.from({ length: 65 }, (_, i) => [`Zeile-${i}`, `Tabellenwert ${i}`]) },
  { id: 'test-wide', type: 'table', caption: 'Breite Prüftabelle', columns: Array.from({ length: 18 }, (_, i) => `Spalte ${i}`), rows: [Array.from({ length: 18 }, (_, i) => `Breit-${i}`)] },
  { id: 'test-image', type: 'figure', src: '../../assets/topic-icons/infernale.webp', width: 1200, height: 2400, alt: 'Testabbildung', caption: ['Vollständige Bildunterschrift mit ', { type: 'link', href: '#test-link', children: ['Rückverweis'] }] },
  { id: 'test-list', type: 'list', ordered: true, items: Array.from({ length: 85 }, (_, i) => `Langer Listeneintrag ${i}`) }
] });
const mime = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.json': 'application/json' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const path = resolve(workspace, `.${decodeURIComponent(url.pathname)}`);
    if (!path.startsWith(workspace.endsWith(sep) ? workspace : workspace + sep)) throw new Error('Outside workspace');
    response.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream');
    response.end(url.searchParams.has('stress') && url.pathname === bookPath ? renderTopicArticle(stress) : await readFile(path));
  } catch { response.statusCode = 404; response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const output = resolve(workspace, '.codex-temp/book-reader');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];
const passed = [];
const check = async (name, fn) => { await fn(); passed.push(name); console.log(`PASS ${name}`); };
const ready = page => page.waitForFunction(() => document.querySelector('[data-book-reader]')?.dataset.mode === 'book' && !document.querySelector('[data-book-reader]').hasAttribute('aria-busy'));
const idle = page => page.waitForFunction(() => document.querySelector('[data-role="mount"]')?.dataset.turning !== 'true');
const pageNumber = page => page.locator('[data-role="page-status"]').getAttribute('data-page').then(Number);
async function contentIntegrity(page) {
  const result = await page.evaluate(() => {
    const root = document.querySelector('[data-book-reader]');
    const originals = [...root.querySelector('[data-role="source"]').children];
    const leaves = [...root.querySelectorAll('.book-flip .book-leaf')];
    const diffs = [];
    for (const original of originals) {
      const parts = leaves.flatMap(leaf => [...leaf.querySelectorAll('[data-book-anchor]')]).filter(node => node.dataset.bookAnchor === original.dataset.bookAnchor);
      const text = node => node.matches('.book-table-wrap') ? [...node.querySelectorAll('tbody td')].map(cell => cell.textContent).join('') : node.textContent;
      if (parts.map(text).join('') !== text(original)) diffs.push(original.dataset.bookAnchor);
    }
    const overflow = leaves.flatMap(leaf => [...leaf.querySelectorAll('.book-page-body')]).filter(node => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1).length;
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    const misplacedHeadings = leaves.flatMap(leaf => [...leaf.querySelectorAll('.book-page-body > h2, .book-page-body > h3')]).filter(heading => heading.previousElementSibling !== null).map(heading => heading.dataset.bookAnchor);
    return { diffs, overflow, misplacedHeadings, duplicateIds: ids.length - new Set(ids).size, documentOverflow: document.documentElement.scrollWidth > innerWidth };
  });
  assert.deepEqual(result, { diffs: [], overflow: 0, misplacedHeadings: [], duplicateIds: 0, documentOverflow: false });
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    // Test-only instrumentation detects the upstream render-loop / resize-listener leaks.
    const request = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window);
    const frames = new Set(), listeners = new Set();
    window.requestAnimationFrame = callback => { const id = request(time => { frames.delete(id); callback(time); }); frames.add(id); return id; };
    window.cancelAnimationFrame = id => { frames.delete(id); cancel(id); };
    const add = window.addEventListener.bind(window), remove = window.removeEventListener.bind(window);
    window.addEventListener = (type, listener, options) => { if (type === 'resize') { listeners.add(listener); options?.signal?.addEventListener('abort', () => listeners.delete(listener), { once: true }); } add(type, listener, options); };
    window.removeEventListener = (type, listener, options) => { if (type === 'resize') listeners.delete(listener); remove(type, listener, options); };
    window.bookTestResources = () => ({ frames: frames.size, resizeListeners: listeners.size });
  });
  const page = await context.newPage();
  page.on('pageerror', error => failures.push(error.message));
  await check('existing Bestiarium literature link opens the integrated book', async () => {
    await page.goto(`${base}/Bestiarium/index.html#literatur`);
    await page.getByRole('link', { name: /Das Wesen des Infernalen/ }).click();
    await ready(page);
    assert.equal(new URL(page.url()).pathname, bookPath);
    await contentIntegrity(page);
    await page.screenshot({ path: resolve(output, 'desktop.png'), fullPage: true });
  });
  await check('buttons, keyboard, hard cover and end of book', async () => {
    await page.getByRole('button', { name: 'Nächste Seite', exact: true }).click();
    await idle(page); assert.equal(await pageNumber(page), 3);
    await page.locator('[data-role="mount"]').focus();
    await page.keyboard.press('ArrowLeft'); await idle(page); assert.equal(await pageNumber(page), 1);
    await page.keyboard.press('Home'); assert.equal(await pageNumber(page), 0);
    const cover = page.locator('.book-leaf[aria-hidden="false"] .book-cover-art');
    await cover.waitFor({ state: 'visible' });
    await cover.evaluate(image => image.decode());
    assert.equal(await page.locator('.book-leaf[aria-hidden="false"] .book-cover-inscription').count(), 0);
    await page.screenshot({ path: resolve(output, 'cover.png'), fullPage: true });
    await page.keyboard.press('End');
    assert(await page.getByRole('button', { name: 'Nächste Seite', exact: true }).isDisabled());
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight'); await idle(page); assert.equal(await pageNumber(page), 1);
  });
  await check('real mouse text selection and paragraph clicks never turn pages', async () => {
    const paragraph = page.locator('.book-leaf[aria-hidden="false"] p[data-book-anchor]').first();
    await paragraph.scrollIntoViewIfNeeded();
    const box = await paragraph.boundingBox();
    await page.mouse.move(box.x + 6, box.y + 10); await page.mouse.down();
    await page.mouse.move(box.x + 150, box.y + 40, { steps: 12 }); await page.mouse.up();
    assert((await page.evaluate(() => getSelection().toString())).length > 2);
    assert.equal(await pageNumber(page), 1);
    await page.evaluate(() => getSelection().removeAllRanges());
    await paragraph.click(); assert.equal(await pageNumber(page), 1);
  });
  await check('page corner drag produces a moving paper page', async () => {
    const corner = page.locator('.book-corner-next');
    await corner.scrollIntoViewIfNeeded();
    const box = await corner.boundingBox(), book = await page.locator('[data-role="mount"]').boundingBox();
    await page.mouse.move(box.x + 30, box.y + 30); await page.mouse.down();
    await page.mouse.move(book.x + book.width * .65, box.y - 95, { steps: 12 });
    assert.equal(await page.locator('[data-role="mount"]').getAttribute('data-turning'), 'true');
    await page.screenshot({ path: resolve(output, 'turning.png'), fullPage: true });
    await page.mouse.move(book.x + 10, box.y, { steps: 18 }); await page.mouse.up();
    await idle(page); assert.equal(await pageNumber(page), 3);
  });
  await check('chapter link, resize and view switch preserve the reading anchor', async () => {
    await page.getByText('Inhalt & Kapitel', { exact: true }).click();
    await page.getByRole('link', { name: 'Kapitel V: Das Mysterium der Sterblichkeit', exact: true }).click();
    assert.equal(new URL(page.url()).hash, '#kapitel-v');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => document.querySelector('[data-role="mount"]').dataset.orientation === 'portrait');
    await ready(page);
    assert(await page.locator('.book-leaf[aria-hidden="false"] [data-book-anchor="kapitel-v"]').count());
    await contentIntegrity(page);
    await page.getByRole('button', { name: 'Artikelansicht', exact: true }).click();
    assert(await page.locator('[data-role="source"]').isVisible());
    assert.equal(await page.evaluate(() => document.activeElement.id), 'kapitel-v');
    await page.getByRole('button', { name: 'Buchansicht', exact: true }).click();
    await ready(page); await contentIntegrity(page);
    assert(await page.locator('.book-leaf[aria-hidden="false"] [data-book-anchor="kapitel-v"]').count());
    await page.screenshot({ path: resolve(output, 'mobile.png'), fullPage: true });
  });
  await check('eight close/open cycles leave no animation or resize handlers behind', async () => {
    for (let i = 0; i < 8; i++) {
      await page.getByRole('button', { name: 'Buch schließen', exact: true }).click();
      assert.deepEqual(await page.evaluate(() => bookTestResources()), { frames: 0, resizeListeners: 0 });
      assert.equal(await page.locator('.book-flip').count(), 0);
      assert.match(await page.evaluate(() => document.activeElement.getAttribute('data-action')), /open-book/);
      await page.getByRole('button', { name: /^Buch aufschlagen:/ }).click(); await ready(page);
      assert.equal(await page.locator('.book-flip').count(), 1);
      assert.equal((await page.evaluate(() => bookTestResources())).frames, 1);
    }
  });
  await check('direct chapter URL selects the chapter on first load', async () => {
    await page.goto(`${base}${bookPath}#kapitel-iii`); await ready(page);
    assert(await page.locator('.book-leaf[aria-hidden="false"] [data-book-anchor="kapitel-iii"]').count());
  });
  await check('long formatted content, split tables, wide blocks, images and lists remain complete', async () => {
    await page.goto(`${base}${bookPath}?stress`); await ready(page);
    await contentIntegrity(page);
    assert((await page.locator('.book-flip [data-book-anchor="test-long"]').count()) > 10);
    assert((await page.locator('.book-flip [data-book-anchor="test-table"]').count()) > 2);
    assert(await page.locator('.book-overflow-viewport').count());
    await page.locator('.book-leaf[aria-hidden="false"] a', { hasText: 'Zum fünften Kapitel' }).click();
    assert(await page.locator('.book-leaf[aria-hidden="false"] [data-book-anchor="kapitel-v"]').count());
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForFunction(() => document.querySelector('[data-role="mount"]').dataset.orientation === 'landscape');
    await contentIntegrity(page);
  });
  await check('late font loading repaginates the existing source without losing content', async () => {
    await page.evaluate(() => document.querySelector('.book-flip').dataset.testLayoutMarker = 'before-font');
    await page.addStyleTag({ content: `@font-face { font-family: BookAcceptanceFont; src: url('/Fonts/Infernal-Font-1.000/Web/Nharazim-Regular.woff2'); } .book-prose { font-family: BookAcceptanceFont, Georgia, serif; }` });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector('.book-flip') && !document.querySelector('.book-flip').dataset.testLayoutMarker);
    await ready(page); await contentIntegrity(page);
  });
  await check('reduced motion, live preference changes and no-JavaScript fallback', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('[data-role="source"]').waitFor({ state: 'visible' });
    assert(await page.locator('[data-role="source"]').isVisible());
    assert.deepEqual(await page.evaluate(() => bookTestResources()), { frames: 0, resizeListeners: 0 });
    await page.reload(); assert(await page.locator('[data-role="source"]').isVisible());
    const noScript = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noScript.newPage(); await plain.goto(`${base}${bookPath}`);
    assert(await plain.locator('[data-role="source"]').isVisible());
    assert.equal(await plain.locator('[data-role="source"] > p').count(), 44);
    await noScript.close();
  });
  await check('touch corner drag and scrolling on text', async () => {
    const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const mobile = await touch.newPage(); await mobile.goto(`${base}${bookPath}`); await ready(mobile);
    const corner = mobile.locator('.book-corner-next'); await corner.scrollIntoViewIfNeeded();
    const box = await corner.boundingBox(), book = await mobile.locator('[data-role="mount"]').boundingBox();
    const cdp = await touch.newCDPSession(mobile);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + 25, y: box.y + 25 }] });
    for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + 25 - (box.x - book.x + 20) * i / 10, y: box.y + 25 - 40 * Math.sin(i / 10 * Math.PI) }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await mobile.waitForFunction(() => document.querySelector('[data-role="page-status"]').dataset.page === '2');
    await idle(mobile); assert.equal(await pageNumber(mobile), 2);
    const previous = mobile.locator('.book-corner-previous');
    await previous.scrollIntoViewIfNeeded();
    const back = await previous.boundingBox();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: back.x + 15, y: back.y + 20 }] });
    for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: back.x + 15 + 28 * i, y: back.y + 20 - 35 * Math.sin(i / 10 * Math.PI) }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await mobile.waitForFunction(() => document.querySelector('[data-role="page-status"]').dataset.page === '1');
    await idle(mobile);
    const paragraph = mobile.locator('.book-leaf[aria-hidden="false"] p[data-book-anchor]').first();
    await paragraph.scrollIntoViewIfNeeded();
    const textBox = await paragraph.boundingBox();
    const scrollBefore = await mobile.evaluate(() => scrollY);
    const startY = Math.min(650, textBox.y + 100);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: textBox.x + 80, y: startY }] });
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: textBox.x + 80, y: startY - i * 18 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await mobile.waitForFunction(before => Math.abs(scrollY - before) > 30, scrollBefore);
    assert.equal(await pageNumber(mobile), 1);
    await contentIntegrity(mobile);
    await touch.close();
  });
  await check('late images and failed animation loading keep the complete article available', async () => {
    const delayed = await context.newPage();
    let releaseImage;
    await delayed.route('**/topic-icons/infernale.webp', route => new Promise(resolve => { releaseImage = async () => { await route.continue(); resolve(); }; }));
    await delayed.goto(`${base}${bookPath}?stress`, { waitUntil: 'domcontentloaded' });
    await delayed.waitForFunction(() => document.querySelector('[data-book-reader]').hasAttribute('aria-busy'));
    await delayed.getByRole('button', { name: 'Artikelansicht', exact: true }).click();
    assert(await delayed.locator('[data-role="source"]').isVisible());
    assert.deepEqual(await delayed.evaluate(() => bookTestResources()), { frames: 0, resizeListeners: 0 });
    if (releaseImage) await releaseImage();
    await delayed.getByRole('button', { name: 'Buchansicht', exact: true }).click(); await ready(delayed);
    await contentIntegrity(delayed);
    const broken = await context.newPage();
    await broken.route('**/vendor/page-flip.mjs', route => route.abort());
    await broken.goto(`${base}${bookPath}`);
    await broken.locator('[data-role="message"]').filter({ hasText: 'konnte nicht aufgebaut' }).waitFor();
    assert(await broken.locator('[data-role="source"]').isVisible());
    assert.equal(await broken.locator('[data-role="source"] > p').count(), 44);
    await delayed.close(); await broken.close();
  });
  assert.deepEqual(failures, []);
  console.log(`Passed ${passed.length} browser acceptance groups; no page errors.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
