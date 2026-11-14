import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { database } from '../../firebase/functions/tests/fixtures/combat-transaction-database.js';
import { commitInventoryTransferOperation } from '../../firebase/functions/src/mechanics/commit-inventory-transfer.js';
import { documentItemNotesOperation } from '../../firebase/functions/src/document-notes/document-item-notes.js';
import { AUTHORED_ITEMS } from '../modules/item-definitions/authored-item-catalog.js';
import { itemDefinitionFromTemplate, itemDefinitionKey } from '../modules/item-definitions/item-definition-model.js';
import { planReportGrant, REPORT_RECIPIENT } from '../modules/fleischsammler-report/report-grant-plan.mjs';
import { REPORT_DOCUMENT_ID, REPORT_ITEM_ID } from '../modules/fleischsammler-report/case-records.mjs';
import { buildReportBook } from '../modules/fleischsammler-report/report-book.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, 'diagnostics/publication-preparation-20261114', `book-transfer-${Date.now()}`);
await mkdir(output, { recursive: true });
const registry = JSON.parse(await readFile(resolve(root, 'CharakterDatenbank/registry.json'), 'utf8'));
const oweta = registry.records.filter(row => row.name === 'Oweta Draig');
assert.equal(oweta.length, 1, 'Resolve the existing Oweta, never create another character');
const receiverId = oweta[0].firestoreDocumentId, giverId = REPORT_RECIPIENT.id;
const template = AUTHORED_ITEMS.find(item => item.id === REPORT_ITEM_ID), definition = itemDefinitionFromTemplate(template);
const moduleDirectory = resolve(root, 'AleriaAlmanach/modules/scene-inventory');
const classic = await Promise.all(['scene-inventory-state.js', 'scene-inventory-ui.js', 'scene-inventory-events.js'].map(file => readFile(resolve(moduleDirectory, file), 'utf8')));
const threadId = 'book-handover-fixture::session:one';
await build({ absWorkingDir: root, bundle: true, format: 'iife', platform: 'browser', external: ['https://*'],
  outfile: resolve(output, 'handover-controller.js'), stdin: { resolveDir: moduleDirectory, contents: `
import { escape as escapeHtml, safeImage as sanitizeImageSrc } from '../item-register/item-register-markup.js';
import '../character-inventory/character-inventory-integration.js';
let _characters=[];
const threadId=${JSON.stringify(threadId)};
const entry={id:'book-handover-fixture',sessionCast:[${JSON.stringify(giverId)},${JSON.stringify(receiverId)}],pages:[]};
const _commentCache={[threadId]:[]};
const getCurrentCommentThreadId=()=>threadId,getCurrentCommentThread=()=>({threadId,entry});
const getNextCommentOrderKey=()=>999,getInitialChar=name=>String(name).slice(0,1),COMMENT_DELETE_CODE='';
const createCharacterInventoryDataFromCharacter=()=>({items:[]});
const activateDialog=(id,options)=>{const node=document.getElementById(id);node.classList.add('active');node.setAttribute('aria-hidden','false');node.querySelector(options?.initialFocus||'button')?.focus();};
const deactivateDialog=id=>{const node=document.getElementById(id);node?.classList.remove('active');node?.setAttribute('aria-hidden','true');};
const getFriendlyErrorMessage=(error,fallback)=>error?.message||fallback;
const requestCommentAutoScroll=()=>{};
const requests=[];
async function request(input){const response=await fetch('/qa-book-transfer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const result=await response.json();if(!response.ok)throw Error(result.message);return result;}
function renderCharGrid(){
  document.querySelector('[data-role="fixture-inventories"]').innerHTML=_characters.map(character=>{
    const data=sanitizeCharacterInventoryData({...character.inventory,characterId:character.id});
    const resolved=mergeCharacterInventoryDataWithItemDb(data);
    return '<section data-holder="'+escapeHtml(character.id)+'"><h2>'+escapeHtml(character.name)+'</h2><div class="character-inventory-page read-only" data-ci-readonly="true" data-ci-data="'+escapeHtml(JSON.stringify(data))+'">'+buildCharacterInventoryItems(resolved,'',{readOnly:true})+(resolved.items.find(item=>item.documentRef)?buildCharacterInventoryLivePreview(resolved.items.find(item=>item.documentRef)):'')+'</div></section>';
  }).join('');
}
async function loadCommentsIntoPage(){const result=await(await fetch('/qa-book-state')).json();document.querySelector('[data-role="fixture-receipts"]').textContent=result.comments.map(row=>row.text).join('\\n');}
window._fb={async transferCharacterInventories(giverId,giverInventory,receiverId,receiverInventory,entryId,sceneEvent){
  const input={giverId,receiverId,entryId,sceneEvent,deleteCodeHash:''};requests.push(structuredClone(input));return request(input);
}};
${classic.join('\n')}
globalThis.handoverFixture={requests,characters:()=>structuredClone(_characters),retry:()=>request(requests.at(-1))};
void(async()=>{_characters=(await(await fetch('/qa-book-state')).json()).characters;renderCharGrid();globalThis.fixtureReady=true;})();
` }, plugins: [{ name: 'only-inventory-transports-are-fixtured', setup(plugin) {
    plugin.onResolve({ filter: /scene-inventory-money-client\.js$/ }, () => ({ path: 'unused-money-client', namespace: 'book-fixture' }));
    plugin.onResolve({ filter: /scene-trade-service\.js$/ }, () => ({ path: 'unused-trade-service', namespace: 'book-fixture' }));
    plugin.onLoad({ filter: /.*/, namespace: 'book-fixture' }, args => ({ loader: 'js', contents: args.path === 'unused-money-client'
      ? 'export async function getSceneMoneyTransferSession(){return {pending:()=>null};} export function buildSceneMoneyRequest(){throw Error("Money excluded from book transfer fixture");}'
      : 'export function createSceneTradeService(){throw Error("Trade excluded from book transfer fixture");}' }));
  } }] });
await writeFile(resolve(output, 'handover-fixture.html'), `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/AleriaAlmanach/"><link rel="icon" href="data:,"><title>Buchübergabe an Oweta · lokale Prüfung</title>
${['styles.css','styles/modal.css','styles/scene-trade.css','styles/scene-inventory.css','styles/character-inventory-cards.css','styles/module-page-character-inventory.css'].map(path => `<link rel="stylesheet" href="/AleriaAlmanach/${path}">`).join('')}
<style>body{padding:24px;background:#1b1816}main{max-width:1200px;margin:auto;color:#e8d9ba}[data-role="fixture-inventories"]{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:24px}.ci-item-row{margin:8px 0}</style>
<main><h1>Lokale Buchübergabe: Lefraye → Oweta</h1><p>Erfundene Inventare und Konten; keine Produktivbuchung.</p><button type="button" data-scene-inventory-action="open" data-comment-thread-id="${threadId}">Inventar-Interaktion öffnen</button><div data-role="fixture-inventories"></div><p data-role="fixture-receipts"></p></main>
${['modules/core/content-safety.js','modules/module-editor/module-editor-character-inventory.js','modules/character-inventory/character-inventory-renderer.js','modules/character-inventory/character-inventory-cards.js'].map(path => `<script src="/AleriaAlmanach/${path}"></script>`).join('')}
<script src="/${relative(root, output).split(sep).join('/')}/handover-controller.js"></script></html>`);

const server = await startChartQualityServer(root), report = { passed: false, output, viewports: [], screenshots: [], errors: [],
  method: 'Real classic inventory interaction and real backend transfer/notes operations; isolated in-memory transaction fixture, local GET resources and intercepted POST transport only.',
  productionWritesExecuted: false, resolvedRecipient: { name: 'Oweta Draig', id: receiverId, worldPersonId: oweta[0].worldPersonId } };
let browser;
const shot = async (page, name) => { const path = resolve(output, `${name}.png`); await page.screenshot({ path }); report.screenshots.push(path); };
function fixture() {
  const retained = name => ({ id: `kept-${name}`, name: 'Unveränderter Prüfgegenstand', quantity: '1', category: 'other' });
  const giver = planReportGrant({ character: { ...REPORT_RECIPIENT, ownerUid: 'book-giver-owner', inventory: { items: [retained('giver')], revision: 3, moneyState: { copper: 17 } }, combatProfile: { hitPoints: { current: 7, maximum: 11 }, resources: [{ id: 'mana', current: 2 }] } }, template, now: '2026-11-14T17:00:00Z' }).character;
  const receiver = { id: receiverId, name: 'Oweta Draig', ownerUid: 'book-receiver-owner', inventory: { items: [retained('receiver')], revision: 9, moneyState: { copper: 23 } }, combatProfile: { hitPoints: { current: 8, maximum: 12 }, resources: [{ id: 'mana', current: 4 }] } };
  return { giver, receiver, db: database({ [`characters/${giverId}`]: giver, [`characters/${receiverId}`]: receiver,
    [`item_definition_versions/${itemDefinitionKey(definition)}`]: definition, [`item_definitions/${definition.id}`]: definition }) };
}
async function configure(context, db, uid) {
  await context.route('**/*', route => new URL(route.request().url()).origin === server.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
  await context.route('**/qa-book-state', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ characters: [giverId, receiverId].map(id => db.data.get(`characters/${id}`)), comments: [...db.data].filter(([path]) => path.startsWith('comments/')).map(([id, value]) => ({ id, ...value })) }) }));
  await context.route('**/qa-book-transfer', async route => {
    try { const value = await commitInventoryTransferOperation(db, { uid: 'fixture-scene-author-without-ownership', token: { aleriaRole: 'player' } }, route.request().postDataJSON()); await route.fulfill({ contentType: 'application/json', body: JSON.stringify(value) }); }
    catch (error) { await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: error.message }) }); }
  });
  await context.route('**/document-notes-firebase.js', route => route.fulfill({ contentType: 'text/javascript', body: `export async function connectDocumentNotes(context){const request=async input=>{const response=await fetch('/qa-book-notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...context,...input})});const value=await response.json();if(!response.ok)throw Error(value.message);return value.notes;};return{mode:'Lokale Prüfung am konkreten Inventarbuch.',load:()=>request({action:'load'}),save:input=>request({action:'save',...input})};}` }));
  await context.route('**/qa-book-notes', async route => {
    try { const value = await documentItemNotesOperation({ auth: { uid, token: {} }, data: route.request().postDataJSON() }, { db }); await route.fulfill({ contentType: 'application/json', body: JSON.stringify(value) }); }
    catch (error) { await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: error.message }) }); }
  });
  context.on('page', page => page.on('pageerror', error => report.errors.push(error.message)));
}
async function choose(page, field, id, query) {
  const picker = page.locator(`[data-scene-inventory-picker="${field}"] [data-trade-actor-picker]`);
  if (!await picker.evaluate(node => node.open)) await picker.locator('summary').click();
  await picker.locator('[data-trade-picker-search]').fill(query);
  await picker.locator(`[data-trade-picker-value="${id}"]`).click();
  await page.waitForFunction(({ field, id }) => document.getElementById(`scene-transfer-${field}`)?.value === id, { field, id });
}
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const width of [1440, 390]) {
    const state = fixture(), item = state.giver.inventory.items.at(-1);
    const notesContext = { kind: 'characters', documentId: REPORT_DOCUMENT_ID, holderId: giverId, instanceId: item.instanceId };
    await documentItemNotesOperation({ auth: { uid: state.giver.ownerUid, token: {} }, data: { ...notesContext, action: 'save', text: 'Wegzeiten der Zeugin prüfen. Diese Notiz folgt dem Buch.', expectedRevision: 0, mutationId: 'initial-book-notes' } }, { db: state.db });
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'no-preference' });
    await configure(context, state.db, state.giver.ownerUid);
    const page = await context.newPage(), fixtureUrl = `${server.origin}/${relative(root, output).split(sep).join('/')}/handover-fixture.html`;
    await page.goto(fixtureUrl); await page.waitForFunction(() => globalThis.fixtureReady);
    await page.locator('[data-scene-inventory-action="open"]').click();
    await page.waitForFunction(() => document.querySelector('#scene-inventory-overlay.active')?.dataset.sceneInventoryLocked === 'false');
    await page.locator('#scene-transfer-kind').selectOption('item');
    await choose(page, 'giver', giverId, 'Lefraye'); await choose(page, 'receiver', receiverId, 'Oweta');
    await page.locator('#scene-transfer-item').selectOption(item.id);
    await page.locator('#scene-transfer-flavour').fill('Lefraye reicht Oweta Meredydds Ermittlungsbuch.');
    assert.match(await page.locator('[data-scene-transfer-object]').textContent(), /Ermittlungsbuch/);
    await shot(page, `handover-dialog-${width}`);
    await page.locator('[data-scene-inventory-action="submit"]').click();
    await page.waitForFunction(() => !document.querySelector('#scene-inventory-overlay.active'));
    const giver = state.db.data.get(`characters/${giverId}`), receiver = state.db.data.get(`characters/${receiverId}`);
    assert.equal(giver.inventory.items.length, 1); assert.equal(receiver.inventory.items.length, 2);
    const received = receiver.inventory.items.find(row => row.instanceId === item.instanceId);
    assert(received); assert.equal(received.ownerCharacterId, receiverId); assert.deepEqual(received.definitionRef, item.definitionRef); assert.deepEqual(received.documentRef, item.documentRef);
    for (const [after, before] of [[giver, state.giver], [receiver, state.receiver]]) {
      assert.deepEqual(after.inventory.moneyState, before.inventory.moneyState); assert.deepEqual(after.combatProfile, before.combatProfile);
      assert.deepEqual(after.inventory.items[0], before.inventory.items[0]);
    }
    const snapshot = structuredClone([...state.db.data]);
    await page.evaluate(() => handoverFixture.retry()); assert.deepEqual([...state.db.data], snapshot);
    assert.equal([...state.db.data.keys()].filter(path => path.startsWith('comments/')).length, 1);
    assert.equal([...state.db.data].find(([path]) => path.startsWith('comments/'))[1].createdBy, 'fixture-scene-author-without-ownership');
    await shot(page, `handover-completed-${width}`);
    const newContext = { ...notesContext, holderId: receiverId };
    await assert.rejects(documentItemNotesOperation({ auth: { uid: state.giver.ownerUid, token: {} }, data: { ...notesContext, action: 'load' } }, { db: state.db }), /nicht mehr/);
    await assert.rejects(documentItemNotesOperation({ auth: { uid: state.giver.ownerUid, token: {} }, data: { ...newContext, action: 'load' } }, { db: state.db }), /Besitzer/);
    const receiverContext = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'no-preference' });
    await configure(receiverContext, state.db, state.receiver.ownerUid);
    const receiverInventory = await receiverContext.newPage(); await receiverInventory.goto(fixtureUrl); await receiverInventory.waitForFunction(() => globalThis.fixtureReady);
    const link = receiverInventory.locator(`[data-holder="${receiverId}"] [data-role="inventory-document"]`).first();
    const href = await link.getAttribute('href'); assert(href.includes(`holder=${receiverId}`)); assert(href.includes(`item=${item.instanceId}`));
    const [reader] = await Promise.all([receiverContext.waitForEvent('page'), link.click()]);
    await reader.waitForSelector('.book-reader');
    if (await reader.locator('.book-cover-launch').isVisible()) await reader.locator('.book-cover-launch').click();
    try { await reader.waitForFunction(() => document.querySelector('[data-role="page-status"]')?.textContent.includes('Seite')); }
    catch (error) {
      report.readerFailure = { url: reader.url(), body: (await reader.locator('body').textContent()).slice(0, 2500) };
      await shot(reader, `reader-failure-${width}`); throw error;
    }
    assert.equal(await reader.locator('[data-role="source"] h2').filter({ hasText: /^Fall \d/ }).count(), 16);
    assert.equal(await reader.locator('[data-role="source"] h2').filter({ hasText: /Arbeitsname/ }).count(), 5);
    const sourceText = await reader.locator('[data-role="source"]').textContent();
    assert.match(sourceText, /10\. Ordanstag 1740, Gwynthor/); assert.doesNotMatch(sourceText, /Weltperson|externe Karte|Weltjahr|umzudeuten/);
    await reader.locator('[data-action="close-book"]').click();
    await reader.locator('.book-cover-launch img').evaluate(image => image.decode());
    assert.match(await reader.locator('.book-cover-launch img').getAttribute('src'), /vorderdeckel-r1\.png$/);
    await shot(reader, `front-cover-${width}`);
    await reader.locator('[data-action="open-book"]').click();
    await reader.waitForFunction(() => document.querySelectorAll('.book-leaf').length > 1);
    await reader.locator('[data-role="mount"]').press('End');
    await reader.waitForFunction(() => [...document.querySelectorAll('.book-leaf[aria-hidden="false"] img')].some(image => image.getAttribute('src').includes('rueckdeckel-r1.png')));
    await shot(reader, `back-cover-${width}`);
    for (const chapter of width === 1440 ? ['Fall 07', 'Fall 09', 'Fall 11'] : ['Fall 08']) {
      await reader.locator('.book-contents > summary').click(); await reader.locator('.book-contents a').filter({ hasText: chapter }).click();
      await reader.waitForTimeout(700); await shot(reader, `${chapter.replace(' ', '-')}-provisional-names-${width}`);
    }
    await reader.locator('.book-contents > summary').click(); await reader.locator('.book-contents a').filter({ hasText: /^Familienbericht · Helfaen$/ }).click();
    await reader.waitForTimeout(700); await shot(reader, `helfaen-in-world-report-${width}`);
    await reader.locator('.book-contents > summary').click(); await reader.locator('.book-contents a').filter({ hasText: /^Notizen$/ }).click();
    await reader.waitForFunction(() => [...document.querySelectorAll('[data-role="document-notes-text"]')].some(field => field.value.startsWith('Wegzeiten der Zeugin')));
    const notes = reader.locator('.book-leaf[aria-hidden="false"] [data-role="document-notes-text"]').first();
    await notes.fill('Owetas Ergänzung: den Feldweg am Abend prüfen.');
    await reader.locator('.book-leaf[aria-hidden="false"] [data-notes-action="save"]').click();
    await reader.waitForFunction(() => [...document.querySelectorAll('[data-role="document-notes-status"]')].some(node => node.textContent.startsWith('Notizen gespeichert.')));
    await shot(reader, `oweta-book-notes-${width}`);
    const stored = await documentItemNotesOperation({ auth: { uid: state.receiver.ownerUid, token: {} }, data: { ...newContext, action: 'load' } }, { db: state.db });
    assert.equal(stored.notes.revision, 2); assert.equal(stored.notes.text, 'Owetas Ergänzung: den Feldweg am Abend prüfen.');
    assert.equal([...state.db.data.keys()].filter(path => path.startsWith('item_document_notes/')).length, 1);
    const bounds = await reader.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert(bounds.scrollWidth <= bounds.width + 2);
    if (width === 1440) {
      const [download] = await Promise.all([reader.waitForEvent('download'), reader.evaluate(async () => {
        const { exportStandalone } = await import('/AleriaAlmanach/DokumentenWerkstatt/js/export/document-export.js');
        const envelope = await (await fetch('/Dokumente%20aus%20der%20Werkstatt/data/meredydd-fleischsammler-ermittlungsbuch.json')).json();
        await exportStandalone(envelope.document);
      })]);
      await download.saveAs(resolve(output, 'Ermittlungsbuch-korrigiert.html'));
      assert(!(await readFile(resolve(output, 'Ermittlungsbuch-korrigiert.html'), 'utf8')).includes('Owetas Ergänzung:'));
      await writeFile(resolve(output, 'Ermittlungsbuch-korrigiert.json'), JSON.stringify(buildReportBook(), null, 2) + '\n');
      await reader.emulateMedia({ reducedMotion: 'reduce' });
      const articleNotes = reader.locator('[data-role="source"] [data-role="document-notes-text"]');
      await articleNotes.waitFor({ state: 'visible' }); assert.equal(await articleNotes.inputValue(), stored.notes.text);
      await articleNotes.scrollIntoViewIfNeeded(); await shot(reader, 'oweta-notes-reduced-motion-1440');
    }
    report.viewports.push({ width, actualInteractionSubmitted: true, singlePhysicalBookPreserved: true, definitionAndDocumentRefPreserved: true,
      newHolderLink: href, previousHolderNotesDenied: true, receiverReadAndSave: true, notesRevision: stored.notes.revision, replayIdempotent: true, inventoryMoneyAndCombatPreserved: true });
    await receiverContext.close(); await context.close();
  }
  assert.deepEqual(report.errors, []); report.passed = true;
} catch (error) { report.failure = { message: error.message, stack: error.stack }; throw error; }
finally { await writeFile(resolve(output, 'result.json'), JSON.stringify(report, null, 2) + '\n'); await browser?.close(); await server.close(); }
console.log(JSON.stringify({ passed: report.passed, output, screenshots: report.screenshots.length, viewports: report.viewports.map(row => row.width) }));
