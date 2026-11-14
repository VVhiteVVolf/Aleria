import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { REPORT_DOCUMENT_ID } from '../modules/fleischsammler-report/case-records.mjs';
import { buildReportBook } from '../modules/fleischsammler-report/report-book.mjs';
import { planReportGrant, REPORT_RECIPIENT } from '../modules/fleischsammler-report/report-grant-plan.mjs';
import { AUTHORED_ITEMS } from '../modules/item-definitions/authored-item-catalog.js';
import { documentItemNotesOperation } from '../../firebase/functions/src/document-notes/document-item-notes.js';
import { database } from '../../firebase/functions/tests/fixtures/combat-transaction-database.js';

const root = resolve('.'), output = resolve(root, 'diagnostics/fleischsammler-report-20261114', `browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const fixture = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/AleriaAlmanach/"><title>Lokale Dokument-Inventarprüfung</title><link rel="stylesheet" href="/AleriaAlmanach/styles/module-page-character-inventory.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/character-inventory-cards.css"><style>body{margin:0;padding:18px;background:#1b1816;color:#e8d9ba}main{max-width:1320px;margin:auto}*{box-sizing:border-box}</style></head><body><main></main>
<script src="/AleriaAlmanach/modules/core/content-safety.js"></script><script src="/AleriaAlmanach/modules/module-editor/module-editor-character-inventory.js"></script><script src="/AleriaAlmanach/modules/character-inventory/character-inventory-renderer.js"></script><script src="/AleriaAlmanach/modules/character-inventory/character-inventory-cards.js"></script><script src="/AleriaAlmanach/modules/character-inventory/character-inventory-events.js"></script>
<script type="module">
import '/AleriaAlmanach/modules/character-inventory/character-inventory-integration.js';
import {AUTHORED_ITEMS} from '/AleriaAlmanach/modules/item-definitions/authored-item-catalog.js';
import {planReportGrant,REPORT_RECIPIENT} from '/AleriaAlmanach/modules/fleischsammler-report/report-grant-plan.mjs';
const character={...REPORT_RECIPIENT,inventory:{items:[],moneyState:{copper:17},revision:0}};
const plan=planReportGrant({character,template:AUTHORED_ITEMS.find(i=>i.id==='fleischsammler:meredydds-ermittlungsbuch'),now:'2026-11-14T12:00:00Z'});
const data=sanitizeCharacterInventoryData({...plan.character.inventory,name:character.name,characterId:character.id,title:'Lefrayes Inventar · lokale Prüfung'});
const resolved=mergeCharacterInventoryDataWithItemDb(data);
document.querySelector('main').innerHTML='<div class="character-inventory-page read-only" data-ci-readonly="true" data-ci-data="'+escapeHtml(JSON.stringify(data))+'"><h1>Lefrayes Inventar</h1><p>Erfundene lokale Prüfdaten</p><div class="ci-layout"><div class="ci-main-column">'+buildCharacterInventoryItems(resolved,'',{readOnly:true})+'</div><aside class="ci-live-preview">'+buildCharacterInventoryLivePreview(resolved.items[0])+'</aside></div><dialog class="ci-profile-overlay" aria-label="Inventarkarte"></dialog></div>';
window.fixtureReady=true;
</script></body></html>`;
const fixturePath = resolve(output, 'inventory-fixture.html'); await writeFile(fixturePath, fixture);
const server = await startChartQualityServer(root);
const fixtureCharacter = planReportGrant({ character: { ...REPORT_RECIPIENT, ownerUid: 'test-book-owner', inventory: { items: [], revision: 0, moneyState: { copper: 17 } } }, template: AUTHORED_ITEMS.find(item => item.id === 'fleischsammler:meredydds-ermittlungsbuch'), now: '2026-11-14T12:00:00Z' }).character;
const notesDatabase = database({ [`characters/${REPORT_RECIPIENT.id}`]: fixtureCharacter });
const book = buildReportBook();
let browser;
const checks = [], screenshots = [], errors = [], blocked = [], geometry = [];
const shot = async (page, name) => { const path = resolve(output, `${name}.png`); await page.screenshot({ path }); screenshots.push(path); };
async function configureContext(context) {
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === server.origin && request.method() === 'GET') return route.continue();
    if (url.protocol === 'file:' && url.pathname.endsWith(`${REPORT_DOCUMENT_ID}.html`)) return route.continue();
    blocked.push({ method: request.method(), origin: url.origin }); return route.abort();
  });
  await context.route('**/document-notes-firebase.js', route => route.fulfill({ contentType: 'text/javascript', body: `export async function connectDocumentNotes(context){const request=async input=>{const response=await fetch('/qa-document-notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...context,...input})});const value=await response.json();if(!response.ok)throw Error(value.message);return value.notes;};return{mode:'Lokaler Testadapter am Inventarbuch.',load:()=>request({action:'load'}),save:input=>request({action:'save',...input})};}` }));
  await context.route('**/qa-document-notes', async route => {
    try {
      const value = await documentItemNotesOperation({ auth: { uid: 'test-book-owner', token: {} }, data: route.request().postDataJSON() }, { db: notesDatabase });
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(value) });
    } catch (error) { await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: error.message }) }); }
  });
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
}
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ reducedMotion: 'no-preference', acceptDownloads: true });
  await configureContext(context);
  const inventory = await context.newPage();
  const fixtureUrl = `${server.origin}/${fixturePath.slice(root.length + 1).replaceAll('\\', '/')}`;
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['narrow', 320, 740]]) {
    await inventory.setViewportSize({ width, height }); await inventory.goto(fixtureUrl);
    await inventory.waitForFunction(() => window.fixtureReady);
    const baseline = await inventory.evaluate(() => document.querySelector('.character-inventory-page').dataset.ciData);
    await inventory.locator('img[src*="duennes-notizbuch"]').first().evaluate(image => image.decode());
    assert.equal(await inventory.locator('.ci-item-row').count(), 1);
    await shot(inventory, `${name}-inventory`);
    await inventory.locator('[data-ci-action="show-item"]').first().click();
    await inventory.locator('dialog[open]').waitFor();
    assert.equal(await inventory.locator('dialog[open] [data-role="inventory-document"]').count(), 1);
    await shot(inventory, `${name}-item-card`);
    const popup = context.waitForEvent('page');
    await inventory.locator('dialog[open] [data-role="inventory-document"]').click();
    const reader = await popup; await reader.setViewportSize({ width, height });
    await reader.waitForSelector('[data-role="reader-document"] .book-reader');
    await reader.waitForFunction(() => document.querySelector('[data-role="page-status"]')?.textContent.includes('Seite'), { timeout: 45000 });
    assert.ok(reader.url().includes(`id=${REPORT_DOCUMENT_ID}`));
    assert.equal(await reader.locator('[data-role="source"] h2').count(), book.pages.length);
    assert.equal(await reader.locator('[data-role="source"] h2').filter({ hasText: /^Fall \d/ }).count(), 16);
    const images = await reader.locator('[data-role="source"] img').evaluateAll(async images => {
      await Promise.all(images.map(image => image.decode())); return images.map(image => ({ src: image.getAttribute('src'), width: image.naturalWidth }));
    });
    assert.equal(images.length, 4);
    assert.ok(images.every(image => image.width && !image.src.includes('/portraits/')));
    assert.equal(await reader.locator('.book-overflow').count(), 0);
    await shot(reader, `${name}-book-opening`);
    for (const [chapter, label] of [['Fall 04', 'ceridwen'], ['Zur ersten Ermittlerskizze', 'sketch'], ['Zeichnung und Bestätigung', 'signature'], ['Notizen', 'notes']]) {
      await reader.locator('.book-contents > summary').click();
      await reader.locator('.book-contents a').filter({ hasText: chapter }).click();
      await reader.waitForTimeout(700);
      await shot(reader, `${name}-${label}`);
    }
    const pageArrangement = await reader.locator('.book-leaf:not(.book-cover)').evaluateAll(leaves => leaves.flatMap((leaf, index) => [...leaf.querySelectorAll('h2[data-book-side]')].map(heading => ({ title: heading.textContent, side: heading.dataset.bookSide, number: index + 1, paragraphs: leaf.querySelectorAll('.book-page-body > p').length, figures: leaf.querySelectorAll('figure').length }))));
    for (const section of pageArrangement) {
      assert.equal(section.number % 2 ? 'left' : 'right', section.side);
      if (section.side === 'right') { assert.equal(section.paragraphs, 0); assert.equal(section.figures, 1); }
    }
    assert.equal(pageArrangement.length, 4);
    const notes = reader.locator('.book-leaf[aria-hidden="false"] [data-role="document-notes-text"]').first();
    await notes.waitFor();
    await reader.waitForFunction(() => [...document.querySelectorAll('[data-role="document-notes-status"]')].some(node => /geladen|Noch keine/.test(node.textContent)));
    const noteText = `Prüfnotiz ${name}: Lleians Wegzeit abgleichen.\nZeugin am Feldweg befragen.`;
    await notes.fill(noteText);
    await reader.locator('.book-leaf[aria-hidden="false"] [data-notes-action="save"]').click();
    await reader.waitForFunction(() => [...document.querySelectorAll('[data-role="document-notes-status"]')].some(node => node.textContent.startsWith('Notizen gespeichert.')));
    await reader.reload(); await reader.waitForSelector('[data-role="source"]', { state: 'attached' });
    await reader.waitForFunction(() => document.querySelector('[data-role="page-status"]')?.textContent.includes('Seite'));
    await reader.locator('.book-contents > summary').click(); await reader.locator('.book-contents a').filter({ hasText: /^Notizen$/ }).click();
    await reader.waitForTimeout(700);
    await reader.waitForFunction(text => [...document.querySelectorAll('[data-role="document-notes-text"]')].every(field => field.value === text), noteText);
    await shot(reader, `${name}-saved-notes`);
    checks.push(`${name}: notes save and reload through the real backend operation with an isolated transaction database; four facing-page directives place prose left and sketch-only pages right`);
    const bounds = await reader.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll('.book-page-body')].filter(node => node.scrollHeight > node.clientHeight + 3).length }));
    assert.ok(bounds.scroll <= bounds.width + 2, `${name}: page overflow ${JSON.stringify(bounds)}`);
    assert.equal(bounds.overflow, 0, `${name}: leaf content overflow`);
    checks.push(`${name}: inventory → card → reader, sixteen cases, chapters, sketches, signature, seal, notes, no overflow`);
    assert.equal(await inventory.evaluate(() => document.querySelector('.character-inventory-page').dataset.ciData), baseline);
    if (name === 'desktop') {
      const secondContext = await browser.newContext({ viewport: { width, height }, reducedMotion: 'no-preference' });
      await configureContext(secondContext);
      const second = await secondContext.newPage(); await second.goto(reader.url());
      await second.waitForFunction(() => document.querySelector('[data-role="page-status"]')?.textContent.includes('Seite'));
      await second.locator('.book-contents > summary').click(); await second.locator('.book-contents a').filter({ hasText: /^Notizen$/ }).click();
      await second.waitForTimeout(700);
      const secondNotes = second.locator('.book-leaf[aria-hidden="false"] [data-role="document-notes-text"]').first();
      await second.waitForFunction(text => [...document.querySelectorAll('[data-role="document-notes-text"]')].every(field => field.value === text), noteText);
      await secondNotes.fill('Zweiter Browser: weitere Zeugin am Hof.');
      await second.locator('.book-leaf[aria-hidden="false"] [data-notes-action="save"]').click();
      await second.waitForFunction(() => [...document.querySelectorAll('[data-role="document-notes-status"]')].some(node => node.textContent.startsWith('Notizen gespeichert.')));
      const originalNotes = reader.locator('.book-leaf[aria-hidden="false"] [data-role="document-notes-text"]').first();
      await originalNotes.fill('Mein erhaltener Entwurf.');
      await reader.locator('.book-leaf[aria-hidden="false"] [data-notes-action="save"]').click();
      await reader.waitForFunction(() => [...document.querySelectorAll('[data-role="document-notes-status"]')].some(node => node.textContent.includes('inzwischen geändert')));
      assert.equal(await originalNotes.inputValue(), 'Mein erhaltener Entwurf.');
      await shot(reader, 'notes-conflict-draft-preserved');
      await reader.locator('.book-leaf[aria-hidden="false"] [data-notes-action="reload"]').click();
      await reader.waitForFunction(() => [...document.querySelectorAll('[data-role="document-notes-saved"]')].some(node => node.textContent.includes('Zweiter Browser')));
      assert.equal(await originalNotes.inputValue(), 'Mein erhaltener Entwurf.');
      await reader.locator('.book-leaf[aria-hidden="false"] [data-notes-action="save"]').click();
      await reader.waitForFunction(() => [...document.querySelectorAll('[data-role="document-notes-status"]')].some(node => node.textContent.startsWith('Notizen gespeichert.')));
      await secondContext.close();
      checks.push('two separate browser contexts share notes; a stale save preserves the draft and exposes the latest saved text before an intentional retry');
      const sanitized = await reader.evaluate(async () => {
        const { sanitizeContent } = await import('/AleriaAlmanach/DokumentenWerkstatt/js/document-content.js');
        return sanitizeContent('<figure onclick="alert(1)"><img src="javascript:alert(1)" onerror="alert(1)"><img src="/safe.png" alt="Test" width="230" onerror="alert(1)"><figcaption>Probe</figcaption><script>alert(1)</script></figure>');
      });
      assert.ok(!/onerror|onclick|javascript|<script/.test(sanitized)); assert.ok(sanitized.includes('src="/safe.png"'));
      checks.push('real DOM sanitizer preserves figures, strips executable content and unsafe image URLs');
      const download = reader.waitForEvent('download');
      await reader.evaluate(async () => {
        const { exportStandalone } = await import('/AleriaAlmanach/DokumentenWerkstatt/js/export/document-export.js');
        const envelope = await (await fetch('/Dokumente%20aus%20der%20Werkstatt/data/meredydd-fleischsammler-ermittlungsbuch.json')).json();
        await exportStandalone(envelope.document);
      });
      const exported = await download, exportPath = resolve(output, `${REPORT_DOCUMENT_ID}.html`); await exported.saveAs(exportPath);
      const standalone = await context.newPage(); await standalone.goto(pathToFileURL(exportPath).href);
      await standalone.waitForSelector('.book-reader');
      assert.equal(await standalone.locator('[data-role="source"] h2').count(), book.pages.length);
      assert.ok((await standalone.locator('[data-role="source"] img').evaluateAll(images => images.every(image => image.src.startsWith('data:')))));
      await shot(standalone, 'standalone-book'); await standalone.close();
      checks.push('downloaded standalone HTML contains the real book runtime, embedded illustrations and a local personal notes fallback');
      const workshop = await context.newPage(); await workshop.setViewportSize({ width: 1580, height: 1050 });
      await workshop.goto(`${server.origin}/AleriaAlmanach/DokumentenWerkstatt.html?document=${REPORT_DOCUMENT_ID}`);
      await workshop.waitForFunction(() => document.getElementById('doc-title')?.value.includes('Ermittlungsbuch'));
      assert.ok(await workshop.locator('textarea[aria-label="Vorschau der Notizseite"]').first().isDisabled());
      await workshop.locator('[data-workshop-action="switch-editor-tab"][data-tab="export"]').click();
      const [json] = await Promise.all([workshop.waitForEvent('download'), workshop.locator('[data-workshop-action="export-json"]').click()]);
      const jsonPath = resolve(output, 'workshop-roundtrip.json'); await json.saveAs(jsonPath);
      const roundtrip = JSON.parse(await readFile(jsonPath, 'utf8'));
      assert.deepEqual(roundtrip.bookPageSides, book.bookPageSides); assert.equal(roundtrip.notesPage, book.notesPage);
      assert.equal(roundtrip.bookBackCover, book.bookBackCover); assert.equal(roundtrip.media.main.image, book.media.main.image);
      assert.equal(roundtrip.date, '10. Ordanstag 1740');
      assert.equal(roundtrip.pages.length, book.pages.length); assert.equal(roundtrip.schemaVersion, 3);
      assert.ok(roundtrip.pages.some(page => page.includes('staturvergleich-r1.png')));
      await shot(workshop, 'workshop-roundtrip'); await workshop.close();
      checks.push('the real workshop loads and exports the book with facing-page positions, illustrations and editable notes metadata intact');
    }
    await reader.close();
    await inventory.locator('[data-ci-action="close-profile"]').click();
  }
  // Use the existing chart fixture and actual adapter; no genealogical UI is
  // recreated by this harness and no local user draft is opened.
  const chart = await context.newPage();
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    await chart.setViewportSize({ width, height });
    await chart.goto(`${server.origin}/Stammb%C3%A4ume/tests/chart-quality-fixture.html`);
    await chart.evaluate(() => { const base = document.createElement('base'); base.href = '/Stammb%C3%A4ume/'; document.head.prepend(base); });
    for (const slug of ['marchwern', 'dolweth', 'bragwen', 'tirfelyn', 'brynial', 'eiddfer']) {
      await chart.evaluate(async slug => {
        const { GWYNTHOR_FLEISCHSAMMLER_FAMILIES } = await import('/Stammb%C3%A4ume/assets/js/data/gwynthor-fleischsammler/family-records.js');
        const { createFamilyChartSession } = await import('/Stammb%C3%A4ume/assets/js/adapters/family-chart-adapter.js');
        window.chartSession?.destroy();
        window.chartSession = createFamilyChartSession({ container: document.getElementById('family-chart'), family: GWYNTHOR_FLEISCHSAMMLER_FAMILIES.find(f => f.document.id === `haus-${slug}`) });
        window.chartSession.fit();
      }, slug);
      await chart.waitForTimeout(750);
      const broken = await chart.locator('#family-chart img').evaluateAll(async images => {
        await Promise.all(images.map(image => image.decode().catch(() => {})));
        return images.filter(image => !image.naturalWidth).map(image => image.src);
      });
      assert.deepEqual(broken, [], `${name}/${slug}: family artwork`);
      const audit = await chart.evaluate(async () => {
        const { auditRenderedFamilyChart } = await import('/Stammb%C3%A4ume/assets/js/modules/chart-quality/chart-geometry-audit.js');
        return auditRenderedFamilyChart(document.getElementById('family-chart'));
      });
      geometry.push({ name, slug, ...audit });
      await shot(chart, `${name}-family-${slug}`);
      assert.deepEqual(audit.issues, [], `${name}/${slug}: chart geometry`);
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(notesDatabase.data.get(`characters/${REPORT_RECIPIENT.id}`), fixtureCharacter);
  await writeFile(resolve(output, 'result.json'), JSON.stringify({ passed: true, fixture: 'isolated in-memory inventory; all browser requests restricted to local GETs', checks, screenshots, errors, blocked, geometry }, null, 2));
  console.log(JSON.stringify({ passed: true, output, checks: checks.length, screenshots: screenshots.length, familyViews: geometry.length }));
} catch (error) {
  await writeFile(resolve(output, 'result.json'), JSON.stringify({ passed: false, message: error.message, checks, screenshots, errors, blocked, geometry }, null, 2));
  throw error;
} finally { await browser?.close(); await server.close(); }
