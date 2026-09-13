import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.KARNRITH_TEST_ORIGIN || 'http://127.0.0.1:4189';
const screenshots = process.env.KARNRITH_SCREENSHOTS;
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
try {
  for (const [revision, source] of [['v1', 'local'], ['v1', 'remote'], ['v2', 'local'], ['v2', 'remote']]) {
    const oldEntry = JSON.parse(await readFile(new URL(`./fixtures/morgar-${revision}.module.json`, import.meta.url), 'utf8'));
    const oldStore = { version: 5, updatedAtClient: 100, entryOverrides: { [oldEntry.id]: oldEntry } };
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    if (source === 'local') await context.addInitScript(store => {
      if (!localStorage.getItem('aleria-module-store-v1')) localStorage.setItem('aleria-module-store-v1', JSON.stringify(store));
    }, oldStore);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`);
    if (source === 'remote') await page.evaluate(store => applyRemoteModuleStore(store), oldStore);
    await page.evaluate(() => { openEntryById('morgar-karnrith'); renderPage(0, 0); });
    const cover = page.getByRole('img', { name: 'Morgar', exact: true });
    await cover.waitFor();
    const coverImage = await cover.evaluate(async img => {
      await img.decode();
      return { width: img.naturalWidth, height: img.naturalHeight, fit: getComputedStyle(img).objectFit };
    });
    assert.deepEqual(coverImage, { width: 1024, height: 1536, fit: 'contain' });
    if (screenshots) await page.screenshot({ path: `${screenshots}/${revision}-${source}-scene.png` });
    await page.evaluate(() => renderPage(1, 0));
    const languageText = await page.locator('.language-page').innerText();
    for (const term of ['Ar Darak', 'Taldar', 'Kardar', 'Dundar', 'Nardar', 'Grungar', 'Varor', 'Thalor', 'Kuralan', 'Toran', 'Bragan', 'Rhean', 'Falgar']) {
      assert(languageText.includes(term), `${revision}/${source}: missing ${term}`);
    }
    await page.evaluate(() => renderPage(2, 0));
    await page.locator('.name-list-page').waitFor();
    assert.equal(await page.locator('.name-list-name').count(), 1100, `${source}: stored override must not render 400 names`);
    const rendered = await page.evaluate(() => ({
      title: currentEntry.pages[2].pageTitle,
      pageCount: getPages(currentEntry).length,
      groups: currentEntry.pages[2].nameList.groups.map(group => group.names.length)
    }));
    assert.deepEqual(rendered, { title: 'III. — 1.100 Namen von A bis Z', pageCount: 5, groups: [500, 500, 100] });
    if (screenshots) await page.screenshot({ path: `${screenshots}/${revision}-${source}-names.png` });
    await page.evaluate(() => renderPage(4, 0));
    assert.equal(await page.locator('.script-table-grid tbody tr').count(), 371);
    if (screenshots) await page.screenshot({ path: `${screenshots}/${revision}-${source}-words.png` });

    // A normal local save persists the migrated entry. An old remote snapshot
    // arriving afterwards must not downgrade it; reload uses the saved payload.
    const persisted = await page.evaluate(store => {
      saveModuleStore({ remote: false });
      applyRemoteModuleStore(store);
      return {
        saved: JSON.parse(localStorage.getItem('aleria-module-store-v1')).entryOverrides['morgar-karnrith'].pages.length,
        exported: buildModuleExportPayload('morgar-karnrith').entry.pages.length
      };
    }, oldStore);
    assert.deepEqual(persisted, { saved: 5, exported: 5 });
    await page.reload();
    await page.evaluate(() => { openEntryById('morgar-karnrith'); renderPage(2, 0); });
    assert.equal(await page.locator('.name-list-name').count(), 1100);
    await page.evaluate(() => renderPage(4, 0));
    assert.equal(await page.locator('.script-table-grid tbody tr').count(), 371);
    assert.deepEqual(errors, []);
    console.log(`Morgar ${revision}/${source} store: 5 pages, 1,100 names, 371 words, accepted terminology, 2:3 scene; save, late snapshot, export and reload PASS.`);
    await context.close();
  }
} finally { await browser.close(); }
