// node AleriaAlmanach/tests/biography-transfer.browser.mjs <playwright module path>
// Optional PLAYWRIGHT_EXECUTABLE selects an installed browser.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, relative, isAbsolute, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : 'playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, '.codex-temp/biography-transfer');
await mkdir(output, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, `.${pathname}`);
    const local = relative(root, file);
    if (local.startsWith('..') || local.startsWith('.git') || isAbsolute(local)) throw new Error('Outside workspace');
    res.setHeader('Content-Type', `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8`);
    res.end(pathname === '/biography-test.html' ? '<!doctype html><html><body><dialog id="person-biography-dialog"></dialog></body></html>' : await readFile(file));
  } catch { res.statusCode = 404; res.end('Not found'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const entry = JSON.parse(await readFile(resolve(root, 'Charakter Archiv Exporte/Biographien/lynnes-schiffsmannschaft-modulpaket-2026-10-04.json'), 'utf8')).module.entry;
  const index = entry.pages.findIndex(page => page.biographyPage);
  await page.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => typeof openModal === 'function' && typeof exportCurrentModuleBiography === 'function');
  await page.evaluate(({ entry, index }) => openModal(entry, { pageIndex: index }), { entry, index });
  await page.locator('#modal-overlay [data-modal-menu] summary').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Diese Biografie exportieren', exact: true }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'lady-lynne-arth-biographie.json');
  const file = resolve(output, download.suggestedFilename());
  await download.saveAs(file);
  const exported = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(exported.biographyModule.biography.connections.length, 4);
  assert.equal(exported.biographyModule.biography.portrait, new URL(entry.pages[index].image, origin).href);
  console.log('PASS Leser-Menü exportiert nur Lynnes Biografie mit Portrait');

  await page.evaluate(() => { closeModal(); openCharProfile(null); switchCharTab('biography'); });
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#cp-biography-editor [data-cp-biography-action="import"]').click()
  ]);
  await chooser.setFiles(file);
  await page.locator('#cp-biography-preview .biography-portrait').waitFor();
  assert.equal(await page.locator('#cp-biography-preview .biography-portrait').getAttribute('src'), exported.biographyModule.biography.portrait);
  assert.match(await page.locator('#cp-biography-preview').innerText(), /Die Taufe der Leeren Flasche/i);
  const collected = await page.evaluate(() => collectCharacterBiographyData());
  assert.deepEqual(collected.stats, exported.biographyModule.stats);
  assert.equal(collected.biography.portrait, exported.biographyModule.biography.portrait);
  assert.equal(collected.biography.connections.length, 4);
  await page.locator('[data-cp-biography-action="finish"]').click();
  assert.equal(await page.locator('#cp-biography-editor .biography-portrait').getAttribute('src'), exported.biographyModule.biography.portrait);
  await page.screenshot({ path: resolve(output, 'character-import.png') });
  console.log('PASS Charakter-Import, Editor und Leseansicht erhalten Bio und Portrait');

  const tree = await context.newPage();
  await tree.goto(`${origin}/biography-test.html`);
  await tree.evaluate(async () => {
    const { createPersonBiographyDialog } = await import('/Stammbäume/assets/js/modules/person-biography/person-biography-dialog.js');
    const dialog = createPersonBiographyDialog({ onSave: (_id, module) => { globalThis.savedBiography = module; } });
    dialog.open({ id: 'test-lynne', name: 'Lynne Arth', portrait: '/original.png', extensions: {} }, { editable: true });
  });
  tree.on('dialog', dialog => dialog.accept());
  const treeChooser = tree.waitForEvent('filechooser');
  await tree.getByRole('button', { name: 'Importieren', exact: true }).click();
  await (await treeChooser).setFiles(file);
  await tree.waitForFunction(() => document.querySelector('[data-biography-preview]')?.textContent.includes('Die Taufe der Leeren Flasche'));
  assert.equal(await tree.locator('[data-biography-preview] .biography-portrait').getAttribute('src'), exported.biographyModule.biography.portrait);
  await tree.getByRole('button', { name: 'Biographie speichern', exact: true }).click();
  const saved = await tree.evaluate(() => globalThis.savedBiography);
  assert.deepEqual(saved.stats, collected.stats);
  assert.deepEqual(saved.biography, collected.biography);
  console.log('PASS Stammbaum-Dateiimport und Speicherdaten stimmen mit Charakterbio überein');
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
}
