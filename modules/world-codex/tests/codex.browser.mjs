// Optional Playwright installation supplied through PLAYWRIGHT_MODULE, like the existing territory tests.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../../../', import.meta.url));
const archive = path.join(root, 'Old Design/2026-09-18-Weltatlas');
const manifest = JSON.parse(await readFile(path.join(archive, 'manifest.json'), 'utf8'));
const archivedFiles = new Set(manifest.files.map(file => file.path));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const filename = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    const relative = path.relative(root, filename);
    assert.ok(!relative.startsWith('..') && !path.isAbsolute(relative) && !relative.startsWith('.git'));
    const bytes = await readFile(filename);
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(bytes);
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(10000);
  const errors = [];
  let oldDesign = false;
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    const relative = decodeURIComponent(url.pathname).slice(1);
    if (oldDesign && archivedFiles.has(relative)) {
      return route.fulfill({ body: await readFile(path.join(archive, relative)), contentType: types[path.extname(relative)] });
    }
    return route.continue();
  });

  async function content() {
    await page.locator('main img').evaluateAll(async images => {
      // Compare after lazy images and their existing error fallbacks have settled.
      images.forEach(image => { image.loading = 'eager'; });
      await Promise.all(images.map(image => image.decode().catch(() => {})));
      await Promise.all(images.map(image => image.decode().catch(() => {})));
    });
    return page.locator('main').first().evaluate(main => {
      const copy = main.cloneNode(true);
      // House chapters 4–5 now precede the fact sheet in the same row. Compare
      // the unchanged narrative and fact-sheet text in a common reading order.
      const houseFacts = copy.querySelector('.haeuser-infobox-cell');
      if (houseFacts) copy.append(houseFacts);
      // Ratings now use vector symbols; compare their unchanged source values.
      copy.querySelectorAll('[data-rating-source]').forEach(rating => rating.replaceWith(rating.dataset.ratingSource));
      return {
      text: copy.textContent.replace(/\s+/g, ' ').trim(),
      links: [...main.querySelectorAll('a')].map(a => [a.textContent.trim(), a.getAttribute('href')]),
      images: [...main.querySelectorAll('img')].map(i => [i.getAttribute('src'), i.alt]),
      controls: [...main.querySelectorAll('button, input, select, textarea, details, iframe')].filter(e => !e.matches('details.orte-flavor-scene')).map(e => [e.tagName, e.getAttribute('data-action'), e.getAttribute('src'), e.getAttribute('type')]),
    }; });
  }
  const examples = [
    ...manifest.pages.filter(file => file.startsWith('Kontinente/')).map(file => ['/' + file, file]),
    ['/Orte/grossstadt.html?ort=lysfaen', 'Llysfaen'],
    ['/Orte/grossstadt.html?ort=gwynthor', 'Gwynthor'],
    ['/Orte/_template/GrosseStadtTemplate.html', 'Ortsvorlage'],
    ['/Orte/zunft.html?ort=lysfaen-zunft-pferdezucht-jernigan', 'Pferdezucht Jernigan'],
    ['/Orte/_template/ZunftsTemplate.html', 'Zunftvorlage'],
    ['/Familien Häuser und Clans/haus.html?haus=haus-wyrm', 'Haus Wyrm'],
    ['/Familien Häuser und Clans/kleinehaeuser.html?haus=haus-loer', 'Haus Loer'],
  ];
  for (const [url, name] of examples) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    oldDesign = true;
    await page.goto(origin + url, { waitUntil: 'networkidle' });
    const before = await content();
    oldDesign = false;
    await page.reload({ waitUntil: 'networkidle' });
    const after = await content();
    for (const key of ['text', 'links', 'images', 'controls']) assert.deepEqual(after[key], before[key], `${name}: unchanged ${key}`);
    assert.equal(await page.locator('.codex-masthead').count(), 1, `${name}: one navigation`);
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name} ${width}: no page overflow`);
      const clippedProse = await page.locator('.herrschaft-copy > p, [data-orte-content] > p, [data-section]').evaluateAll(elements => elements.filter(e => {
        if (!e.checkVisibility()) return false;
        const r = e.getBoundingClientRect();
        return r.right > innerWidth + 1 || r.left < 0 || e.scrollWidth > e.clientWidth + 1;
      }).map(e => e.textContent.slice(0, 100)));
      assert.deepEqual(clippedProse, [], `${name} ${width}: prose fits`);
    }
    const chapterSummary = page.locator('.codex-chapters > summary');
    await chapterSummary.click();
    const chapterLink = page.locator('.codex-chapter-list a').first();
    const chapterHash = await chapterLink.getAttribute('href');
    await chapterLink.click();
    assert.equal(new URL(page.url()).hash, chapterHash);
    assert.equal(await page.locator('.codex-chapters').getAttribute('open'), null);
    assert.equal(await page.evaluate(() => document.activeElement.id), chapterHash.slice(1));
    await chapterSummary.click();
    await chapterSummary.press('Escape');
    assert.equal(await page.locator('.codex-chapters').getAttribute('open'), null);
    console.log(`OK ${name}: complete content, 1440/768/390, chapters + keyboard`);
  }

  await page.goto(origin + '/Orte/grossstadt.html?ort=gwynthor', { waitUntil: 'networkidle' });
  await page.locator('.place-template-toc-toggle').click();
  assert.equal(await page.locator('.place-template-toc-toggle').getAttribute('aria-expanded'), 'true');
  await page.locator('.place-template-toc a').first().click();
  assert.equal(await page.locator('.place-template-toc-toggle').getAttribute('aria-expanded'), 'false');
  const pressNext = page.locator('[data-action="next-newspaper"]');
  const beforePress = await page.locator('[data-orte-press-switcher]').textContent();
  await pressNext.click();
  assert.notEqual(await page.locator('[data-orte-press-switcher]').textContent(), beforePress);
  await page.goto(origin + '/Orte/zunft.html?ort=lysfaen-zunft-pferdezucht-jernigan', { waitUntil: 'networkidle' });
  const guildDetails = page.locator('main details').first();
  await guildDetails.locator('summary').click();
  assert.notEqual(await guildDetails.getAttribute('open'), null);
  await guildDetails.locator('summary').click();
  assert.equal(await guildDetails.getAttribute('open'), null);
  assert.deepEqual(errors, [], 'No JavaScript errors');
  console.log(`OK ${examples.length} old/new comparisons; existing table of contents and guild details remain usable.`);
} finally {
  await browser?.close();
  server.close();
}
