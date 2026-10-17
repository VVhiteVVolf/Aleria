import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const remote = process.argv.find(arg => arg.startsWith('--origin='))?.slice(9);
const output = resolve(root, `.tmp/scene-item-artwork/${remote ? 'online' : 'local'}-${Date.now()}`);
await mkdir(output, { recursive: true });
const { character } = JSON.parse(await readFile(resolve(root, 'CharakterDatenbank/records/familien/haus-wyrm/gais-wyrm--person--haus-wyrm--gais-wyrm/character.json'), 'utf8'));
const item = character.inventory.items.find(item => item.id === 'equipment-weapon-starter-uchelwyr-lance');
const event = { operation: 'drop', sceneItemId: 'dropped:artwork-preview', sourceActorId: character.id,
  weaponId: 'starter-uchelwyr-lance', item, text: 'Lanze wird aus der Hand geschlagen, kippt zur Seite und bleibt vor Gais Wyrm liegen.' };
const expectedImage = '/AleriaAlmanach/public/assets/character-equipment/gais-lanze-v4.png';
const server = remote ? null : await startChartQualityServer(root);
const origin = remote || server.origin;
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1200, height: 1000 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    return url.origin === origin && ['GET', 'HEAD'].includes(request.method()) && !url.pathname.startsWith('/.netlify/')
      ? route.continue() : route.abort();
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => globalThis.AleriaSceneItems && globalThis.AleriaCharacterInventory && typeof buildInventoryCardContent === 'function');
  await page.waitForFunction(() => ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter = page.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  // Presentation fixture only: never insert or save a production comment.
  const cardItem = await page.evaluate(event => {
    const before = JSON.stringify(event), preview = document.createElement('section');
    preview.id = 'scene-item-artwork-preview';
    preview.style.cssText = 'position:fixed;inset:0;z-index:99999;padding:1rem;overflow:auto;background:#f5efde';
    preview.innerHTML = AleriaSceneItems.renderEvent(event);
    document.body.append(preview);
    if (JSON.stringify(event) !== before) throw new Error('Historical receipt changed');
    return JSON.parse(preview.querySelector('[data-scene-item-card]').dataset.sceneItemCard);
  }, event);
  assert.deepEqual(cardItem, { ...item, image: expectedImage });
  for (const width of [1200, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const bubble = page.locator('#scene-item-artwork-preview .scene-item-bubble');
    const image = bubble.locator('img');
    assert.equal(await image.getAttribute('src'), expectedImage);
    await image.evaluate(img => img.decode());
    assert.ok(await image.evaluate(img => img.naturalWidth > 0));
    await bubble.screenshot({ path: resolve(output, `bubble-${width}.png`) });
    await bubble.locator('[data-scene-item-action="card"]').click();
    const dialog = page.locator('dialog.scene-item-card-dialog[open]');
    await dialog.waitFor({ state: 'visible' });
    assert.equal(await dialog.locator('h3').textContent(), item.name);
    assert.match(await dialog.innerText(), /1W12 Stich/);
    const cardImage = dialog.locator('.ci-card-image img');
    assert.equal(await cardImage.getAttribute('src'), expectedImage);
    await cardImage.evaluate(img => img.decode());
    assert.ok(await cardImage.evaluate(img => img.naturalWidth > 0));
    assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
    await dialog.screenshot({ path: resolve(output, `card-${width}.png`) });
    await dialog.locator('[data-scene-item-action="close"]').click();
    assert.equal(await page.locator('dialog.scene-item-card-dialog[open]').count(), 0);
  }
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: true, origin, image: expectedImage,
    viewports: [1200, 390], historicalReceiptPreserved: true, individualCardPreserved: true, productionWritesBlocked: true }, null, 2));
  console.log(`PASS: ${output}`);
} finally { await browser?.close(); await server?.close(); }
