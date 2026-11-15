import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '../../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../../Stammbäume/tools/chart-quality-server.mjs';

const root = resolve('.');
const output = resolve(root, process.env.ALERIA_READER_QA_OUTPUT || `diagnostics/inventory-reader-20261115/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const fixture = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/AleriaAlmanach/"><title>Lokale Inventarprüfung</title><link rel="stylesheet" href="/AleriaAlmanach/styles/module-page-character-inventory.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/character-inventory-cards.css"><style>body{margin:0;padding:16px;background:#1b1816;color:#e8d9ba}main{max-width:1320px;margin:auto}*{box-sizing:border-box}</style></head><body><main></main>
${['modules/core/content-safety.js','modules/module-editor/module-editor-character-inventory.js','modules/character-inventory/character-inventory-renderer.js','modules/character-inventory/character-inventory-cards.js','modules/character-inventory/character-inventory-events.js'].map(path => `<script src="/AleriaAlmanach/${path}"></script>`).join('')}
<script type="module">
import '/AleriaAlmanach/modules/character-inventory/character-inventory-integration.js';
import {AUTHORED_ITEMS} from '/AleriaAlmanach/modules/item-definitions/authored-item-catalog.js';
import {planReportGrant,REPORT_RECIPIENT} from '/AleriaAlmanach/modules/fleischsammler-report/report-grant-plan.mjs';
const character={...REPORT_RECIPIENT,inventory:{items:[{id:'qa-ring',name:'Prüfring',type:'Siegelring',category:'other',quantity:'1'}],moneyState:{copper:17},revision:0}};
const plan=planReportGrant({character,template:AUTHORED_ITEMS.find(item=>item.id==='fleischsammler:meredydds-ermittlungsbuch'),now:'2026-11-14T12:00:00Z'});
const data=sanitizeCharacterInventoryData({...plan.character.inventory,name:character.name,characterId:character.id});
const resolved=mergeCharacterInventoryDataWithItemDb(data);
document.querySelector('main').innerHTML='<div class="character-inventory-page" data-ci-readonly="true" data-ci-data="'+escapeHtml(JSON.stringify(data))+'"><h1>Inventar · lokale Prüfung</h1><div class="ci-layout"><div class="ci-main-column">'+buildCharacterInventoryItems(resolved,'',{readOnly:true})+'</div><aside class="ci-live-preview">'+buildCharacterInventoryLivePreview(resolved.items[0])+'</aside></div><dialog class="ci-profile-overlay" aria-label="Inventarkarte"></dialog></div>';
window.fixtureReady=true;
</script></body></html>`;
const fixturePath = resolve(output, 'inventory-fixture.html');
await writeFile(fixturePath, fixture);
const server = await startChartQualityServer(root);
const report = { passed: false, output, viewports: [], screenshots: [], errors: [], productionWritesExecuted: false,
  method: 'Real inventory and document reader controllers in fresh Chrome contexts; local GETs only, local notes adapter, invented possessions.' };
let browser;
const shot = async (page, name) => { const path = resolve(output, `${name}.png`); await page.screenshot({ path, fullPage: true }); report.screenshots.push(path); };
const noOverflow = async page => {
  const bounds = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert(bounds.scrollWidth <= bounds.width + 2, JSON.stringify(bounds));
};
async function bookReady(page) {
  await page.waitForSelector('.book-reader');
  await page.waitForFunction(() => document.querySelector('[data-role="page-status"]')?.textContent.includes('Seite'));
  await page.locator('.reader-surface').evaluate(async node => {
    await document.fonts.ready;
    await Promise.all([...node.querySelectorAll('img')].map(image => image.decode()));
  });
}
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, reducedMotion: 'no-preference' });
    await context.route('**/*', route => new URL(route.request().url()).origin === server.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
    await context.route('**/qa-inventory-reader', route => route.fulfill({ contentType: 'text/html', body: fixture }));
    await context.route('**/document-notes-firebase.js', route => route.fulfill({ contentType: 'text/javascript', body: `export async function connectDocumentNotes(){let notes={text:'Erfundene Prüfnotiz am Buch.',revision:1};return{mode:'Lokale Prüfnotizen.',load:async()=>notes,save:async value=>(notes={text:value.text,revision:notes.revision+1})};}` }));
    context.on('page', page => page.on('pageerror', error => report.errors.push(error.message)));
    const page = await context.newPage();
    await page.goto(`${server.origin}/qa-inventory-reader`);
    await page.waitForFunction(() => window.fixtureReady);
    const baseline = await page.locator('.character-inventory-page').getAttribute('data-ci-data');
    const ring = page.locator('.ci-item-row').filter({ hasText: 'Prüfring' });
    const book = page.locator('.ci-item-row').filter({ hasText: 'Ermittlungsbuch' });
    const pagesBefore = context.pages().length;
    await book.locator('[data-ci-action="select-item"]').click();
    assert.equal(context.pages().length, pagesBefore);
    assert.equal(await page.locator('dialog[open]').count(), 0);
    const href = await page.locator('.ci-live-preview [data-role="inventory-document"]').getAttribute('href');
    assert.match(href, /holder=.+&item=.+/);
    // Image double-click uses the same link as the existing reading button.
    const [reader] = await Promise.all([context.waitForEvent('page'), book.locator('.ci-item-icon').dblclick()]);
    await bookReady(reader);
    assert.equal(reader.url(), new URL(href, server.origin).href);
    assert.equal(context.pages().length, pagesBefore + 1);
    assert.equal(await page.locator('dialog[open]').count(), 0);
    assert.match(await reader.locator('[data-role="reader-metadata"]').textContent(), /Meredydd Gwyllach.*Brenric Coeddu/);
    assert.equal(await reader.locator('[data-role="source"] h2').filter({ hasText: /^Fall \d/ }).count(), 16);
    const originalText = await reader.locator('[data-role="source"]').textContent();
    await noOverflow(reader); await shot(reader, `reading-desk-${width}`);
    await reader.locator('[data-action="close-book"]').click();
    await reader.locator('.book-cover-launch').waitFor();
    await shot(reader, `closed-cover-${width}`);
    await reader.locator('[data-action="open-book"]').click(); await bookReady(reader);
    await reader.locator('.book-contents > summary').click();
    await reader.locator('.book-contents a').filter({ hasText: /^Notizen$/ }).click();
    const notes = reader.locator('.book-leaf[aria-hidden="false"] [data-role="document-notes-text"]').first();
    await notes.waitFor(); assert.equal(await notes.inputValue(), 'Erfundene Prüfnotiz am Buch.');
    await notes.fill('Erhaltene Notiz nach dem Gestaltungswechsel.');
    await reader.locator('.book-leaf[aria-hidden="false"] [data-notes-action="save"]').click();
    await reader.waitForFunction(() => [...document.querySelectorAll('[data-role="document-notes-status"]')].some(node => node.textContent.startsWith('Notizen gespeichert.')));
    await noOverflow(reader); await shot(reader, `notes-${width}`);
    await reader.emulateMedia({ reducedMotion: 'reduce' });
    await reader.locator('[data-role="source"]').waitFor({ state: 'visible' });
    assert((await reader.locator('[data-role="source"]').textContent()).includes('Strangulation'));
    await noOverflow(reader);
    assert(originalText.includes('Strangulation'));
    await reader.close();
    if (width === 1440) {
      const [rowReader] = await Promise.all([context.waitForEvent('page'), book.locator('.ci-item-price').dblclick()]);
      await bookReady(rowReader); assert.equal(rowReader.url(), new URL(href, server.origin).href);
      assert.equal(context.pages().length, pagesBefore + 1); await rowReader.close();
    }
    await ring.locator('[data-ci-action="select-item"]').dblclick();
    const modal = page.locator('dialog[open]'); await modal.waitFor();
    assert.match(await modal.textContent(), /Prüfring/);
    await shot(page, `item-card-${width}`);
    await modal.locator('[data-ci-action="close-profile"]').click();
    // Separate buttons keep their action; a double-click cannot also open a reader.
    await book.locator('[data-ci-action="show-item"]').click();
    await modal.waitFor(); assert.equal(await modal.locator('[data-role="inventory-document"]').count(), 1);
    assert.equal(context.pages().length, pagesBefore);
    await modal.press('Escape'); assert.equal(await page.locator('dialog[open]').count(), 0);
    await ring.locator('[data-ci-action="select-item"]').focus();
    await page.keyboard.press('Enter'); assert.equal(await page.locator('dialog[open]').count(), 0);
    assert.equal(await page.locator('.character-inventory-page').getAttribute('data-ci-data'), baseline);
    if (width === 1440) {
      const letter = await context.newPage();
      await letter.goto(`${server.origin}/Dokumente%20aus%20der%20Werkstatt/dokument.html?id=brief-aus-dem-archiv`);
      await letter.locator('.paper-shell .document').waitFor(); await noOverflow(letter); await shot(letter, 'letter-desktop');
      assert.equal(await letter.locator('[data-reader-action="png"]').isEnabled(), true);
      await letter.goto(`${server.origin}/Dokumente%20aus%20der%20Werkstatt/dokument.html?id=qa-fehlt`);
      await letter.locator('[data-role="reader-status"]').filter({ hasText: /.+/ }).waitFor();
      assert.equal(await letter.locator('[data-role="reader-title"]').textContent(), 'Dokument nicht verfügbar');
      await noOverflow(letter); await shot(letter, 'unavailable-desktop'); await letter.close();
    }
    report.viewports.push({ width, singleClickPreserved: true, oneInstanceAwareReader: true, ordinaryCardOpened: true, keyboardAndButtonsPreserved: true, inventoryUnchanged: true, notesSave: true, reducedMotionArticle: true });
    await context.close();
  }
  assert.deepEqual(report.errors, []); report.passed = true;
} catch (error) { report.failure = { message: error.message, stack: error.stack }; throw error; }
finally { await writeFile(resolve(output, 'result.json'), JSON.stringify(report, null, 2) + '\n'); await browser?.close(); await server.close(); }
console.log(JSON.stringify({ passed: report.passed, output, screenshots: report.screenshots.length }));
