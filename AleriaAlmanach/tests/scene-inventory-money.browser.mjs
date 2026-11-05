import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, process.argv.find(value => value.startsWith('--output='))?.slice(9) || 'diagnostics/scene-inventory-money-20261105/browser');
const relativeOutput = relative(root, output);
assert(relativeOutput && !relativeOutput.startsWith(`..${sep}`) && relativeOutput !== '..' && !relativeOutput.includes(':'), 'Output stays in this workspace');
const moduleDirectory = resolve(root, 'AleriaAlmanach/modules/scene-inventory');
const classic = await Promise.all(['scene-inventory-state.js', 'scene-inventory-ui.js', 'scene-inventory-events.js'].map(file => readFile(resolve(moduleDirectory, file), 'utf8')));
await mkdir(output, { recursive: true });
await build({ absWorkingDir: root, bundle: true, format: 'iife', platform: 'browser', external: ['https://*'],
  outfile: resolve(output, 'money-controller.js'), stdin: { resolveDir: moduleDirectory, contents: `
import { escape as escapeHtml, safeImage as sanitizeImageSrc } from '../item-register/item-register-markup.js';
import { applySceneMoneyTransfer, sceneMoneyMinor } from './scene-inventory-money.js';
import { createInventoryTransactionSubmission } from '../inventory-transactions/inventory-transaction-submission.js';
import { validSceneMoneyRequest } from './scene-inventory-money-client.js';
const sourceCharacters = [
  {id:'outside',name:'Alrik Fern',inventory:{revision:1,moneyState:{totalCopper:15},items:[]}},
  {id:'giver',name:'Rianna Wyrm',inventory:{revision:3,moneyState:{totalCopper:1},items:[{id:'personal-cup',name:'Persönlicher Becher',quantity:'1',description:'Ein einfacher Becher.'}]}},
  {id:'receiver',name:'Taren Mond',inventory:{revision:5,moneyState:{totalCopper:0},items:[]}},
  {id:'comment-person',name:'Mira Stern',inventory:{revision:2,moneyState:{totalCopper:2},items:[]}},
  ...Array.from({length:24},(_,index)=>({id:'archive-'+index,name:'Archivperson '+index,inventory:{revision:1,moneyState:{totalCopper:5},items:[]}}))
];
let _characters=structuredClone(sourceCharacters);
const threadId='money-fixture::session:one';
const noSceneParticipants=new URLSearchParams(location.search).has('noScene');
const entry={id:'money-fixture',sessionCast:noSceneParticipants?[]:['giver','receiver'],pages:[]};
const _commentCache={[threadId]:noSceneParticipants?[]:[{id:'historic-comment',characterId:'comment-person',charName:'Mira Stern',text:'Ein bestehender Szenenbeitrag.'}]};
const counters={loadComments:0,orderKey:0,notices:0,renderGrid:0,sanitizers:0,itemCommits:0};
const database=new Map(sourceCharacters.map(record=>[record.id,structuredClone(record)])),receipts=new Map(),requests=[],sessions=new Map();
const failure=message=>()=>Error(message);
const fixture={counters,requests,receipts,lostResponse:false,
  async getSession(thread){
    if(sessions.has(thread))return sessions.get(thread);
    const session=createInventoryTransactionSubmission(async request=>{
      requests.push(structuredClone(request));
      if(receipts.has(request.operationId))return structuredClone(receipts.get(request.operationId));
      const giver=database.get(request.giverId),receiver=request.receiverId?database.get(request.receiverId):null;
      for(const record of [giver,receiver].filter(Boolean))if(request.expectedRevisions['character:'+record.id]!==record.inventory.revision){const error=Error('revision changed');error.code='functions/aborted';throw error;}
      const result=applySceneMoneyTransfer(giver,receiver,request.sceneEvent.transfer.object);
      result.giverInventory.revision=giver.inventory.revision+1;
      database.set(giver.id,{...giver,inventory:structuredClone(result.giverInventory)});
      if(receiver){result.receiverInventory.revision=receiver.inventory.revision+1;database.set(receiver.id,{...receiver,inventory:structuredClone(result.receiverInventory)});}
      const response={id:'private-money-'+receipts.size,giverInventory:result.giverInventory,receiverInventory:result.receiverInventory};
      receipts.set(request.operationId,structuredClone(response));
      if(fixture.lostResponse){fixture.lostResponse=false;throw Error('response lost after commit');}
      return response;
    },{namespace:'aleria:scene-money:pending:v1',requirePersistence:true,validateRequest:validSceneMoneyRequest,
      storageError:failure('Fixture storage unavailable'),identityError:failure('Fixture identity changed'),pendingError:failure('Fixture pending'),runningError:failure('Fixture running'),emptyError:failure('Fixture empty')});
    session.bindPersistence({storage:sessionStorage,uid:'fixture-player',threadId:thread});sessions.set(thread,session);return session;
  },
  balances(){return {stored:[...database].map(([id,record])=>[id,sceneMoneyMinor(record.inventory.moneyState)]),local:_characters.map(record=>[record.id,sceneMoneyMinor(record.inventory.moneyState)])};}
};
globalThis.__moneyFixture=fixture;
const getCurrentCommentThreadId=()=>threadId,getCurrentCommentThread=()=>({threadId,entry});
const getNextCommentOrderKey=()=>{counters.orderKey++;return 999;};
const loadCommentsIntoPage=async()=>{counters.loadComments++;};
const requestCommentAutoScroll=()=>{counters.notices++;};
const renderCharGrid=()=>{counters.renderGrid++;};
const createCharacterInventoryDataFromCharacter=()=>({items:[]});
const sanitizeCharacterInventoryData=inventory=>{counters.sanitizers++;return {...structuredClone(inventory),items:inventory.items||[]};};
const activateDialog=(id,options)=>{const dialog=document.getElementById(id);dialog.classList.add('active');dialog.setAttribute('aria-hidden','false');dialog.querySelector(options?.initialFocus||'button')?.focus();};
const deactivateDialog=id=>{const dialog=document.getElementById(id);dialog?.classList.remove('active');dialog?.setAttribute('aria-hidden','true');};
const getFriendlyErrorMessage=(error,fallback)=>error?.message||fallback;
const getInitialChar=name=>name.slice(0,1),COMMENT_DELETE_CODE='';
window._fb={transferCharacterInventories:async()=>{counters.itemCommits++;throw Error('Item commits are excluded from this money fixture');}};
${classic.join('\n')}
globalThis.moneyFixture={...fixture,sceneBefore:JSON.stringify(_commentCache),currentScene:()=>JSON.stringify(_commentCache)};
` }, plugins: [{ name: 'only-money-transport-is-fixtured', setup(plugin) {
    plugin.onResolve({ filter: /scene-inventory-money-client\.js$/ }, () => ({ path: 'fixture-money-client', namespace: 'money-test' }));
    plugin.onResolve({ filter: /^real-scene-money-client$/ }, () => ({ path: resolve(moduleDirectory, 'scene-inventory-money-client.js'), namespace: 'real-money-client' }));
    plugin.onLoad({ filter: /.*/, namespace: 'money-test' }, () => ({ loader: 'js', resolveDir: moduleDirectory,
      contents: "export {buildSceneMoneyRequest,validSceneMoneyRequest} from 'real-scene-money-client'; export async function getSceneMoneyTransferSession(thread){return globalThis.__moneyFixture.getSession(thread);}" }));
    plugin.onLoad({ filter: /.*/, namespace: 'real-money-client' }, async args => ({ loader: 'js', resolveDir: moduleDirectory, contents: await readFile(args.path, 'utf8') }));
    plugin.onResolve({ filter: /scene-trade-service\.js$/ }, () => ({ path: 'unused-trade-service', namespace: 'money-unused' }));
    plugin.onLoad({ filter: /.*/, namespace: 'money-unused' }, () => ({ loader: 'js', contents: "export function createSceneTradeService(){throw Error('Trade is excluded from the money fixture');}" }));
  } }] });
await writeFile(resolve(output, 'money-fixture.html'), `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="data:,"><link rel="stylesheet" href="/AleriaAlmanach/styles.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/modal.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/scene-trade.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/scene-inventory.css">
<title>Lokale Geldbewegungsprüfung</title><main id="unchanged-scene"><p>Die bestehende Szene bleibt unverändert.</p><button data-scene-inventory-action="open" data-comment-thread-id="money-fixture::session:one">Inventar öffnen</button></main><script src="./money-controller.js"></script></html>`);

const server = await startChartQualityServer(root);
let browser;
const report = { fixture: 'Actual classic state/UI/events, actual people picker and money model; only session transport uses isolated in-memory balances/receipts.',
  network: 'Only local loopback GET requests allowed; no Firebase or production bookings.', viewports: [], errors: [], consoleErrors: [], failedResources: [] };
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 920 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === server.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push({ width, message: error.message }));
    page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({ width, message: message.text() }); });
    page.on('requestfailed', request => report.failedResources.push({ width, url: request.url(), error: request.failure()?.errorText }));
    page.on('response', response => { if (response.status() >= 400) report.failedResources.push({ width, url: response.url(), status: response.status() }); });
    const fixtureUrl = `${server.origin}/${relativeOutput.split(sep).join('/')}/money-fixture.html`;
    await page.goto(fixtureUrl);
    await open(page);
    const selection = await inspectPeople(page);
    await choosePerson(page, 'giver', 'giver', 'Rianna');
    await choosePerson(page, 'receiver', 'receiver', 'Taren');
    await page.locator('#scene-transfer-money-amount').fill('2');
    await page.waitForFunction(() => document.querySelector('[data-scene-inventory-action="submit"]')?.disabled);
    assert.match(await page.locator('.scene-money-preview-error').textContent(), /nicht genug Geld/);
    await page.screenshot({ path: resolve(output, `money-invalid-${width}.png`) });
    await page.locator('#scene-transfer-money-amount').fill('0.5');
    await page.waitForFunction(() => document.querySelector('.scene-money-preview-error')?.textContent.includes('ganze Zahl'));
    assert.equal(await page.locator('[data-scene-inventory-action="submit"]').isDisabled(), true);
    await setNinetyPfennig(page);
    assert.equal(await page.locator('[data-scene-inventory-action="submit"]').isEnabled(), true);
    assert.match(await page.locator('.scene-money-calculation').textContent(), /1 Kupfer\s*−\s*90 Eisenpfennig\s*=\s*10 Eisenpfennig/);
    assert.match(await page.locator('.scene-money-recipient').textContent(), /Taren Mond: 0 Eisenpfennig → 90 Eisenpfennig/);
    assert.equal(await page.locator('[data-scene-item-narrative]:visible').count(), 0);
    const initialCounters = await page.evaluate(() => structuredClone(moneyFixture.counters));
    assert.equal(initialCounters.sanitizers, 0, 'Money preview never sanitizes inventory items');
    const previewGeometry = await geometry(page);
    await page.screenshot({ path: resolve(output, `money-transfer-${width}.png`) });
    if (width === 390) {
      await page.locator('.scene-inventory-card').evaluate(element => { element.scrollTop = element.scrollHeight; });
      await page.screenshot({ path: resolve(output, `money-transfer-${width}-change.png`) });
    }
    await submit(page);
    await page.waitForFunction(() => !document.querySelector('#scene-inventory-overlay.active'));
    const completed = await facts(page);
    assert.equal(completed.local.giver, 10); assert.equal(completed.local.receiver, 90);
    assert.equal(completed.receipts, 1); assert.equal(completed.requests, 1);
    assertSilent(completed);

    await page.reload(); await open(page); await setNinetyPfennig(page);
    await page.locator('[data-scene-money-target="sink"]').click();
    assert.equal(await page.locator('[data-scene-inventory-receiver]').isVisible(), false);
    assert.match(await page.locator('.scene-money-recipient').textContent(), /ausgebucht/);
    const sinkGeometry = await geometry(page);
    await page.screenshot({ path: resolve(output, `money-sink-${width}.png`) });
    if (width === 390) {
      await page.locator('.scene-inventory-card').evaluate(element => { element.scrollTop = element.scrollHeight; });
      await page.screenshot({ path: resolve(output, `money-sink-${width}-change.png`) });
    }
    await submit(page); await page.waitForFunction(() => !document.querySelector('#scene-inventory-overlay.active'));
    const spent = await facts(page);
    assert.equal(spent.local.giver, 10); assert.equal(spent.local.receiver, 0); assert.equal(spent.receipts, 1);
    assert.equal(spent.request.receiverId, ''); assert.deepEqual(Object.keys(spent.request.expectedRevisions), ['character:giver']);
    assertSilent(spent);

    await page.reload(); await open(page); await setNinetyPfennig(page);
    await page.evaluate(() => { __moneyFixture.lostResponse = true; });
    await submit(page);
    await page.waitForFunction(() => document.querySelector('#scene-inventory-overlay')?.dataset.sceneMoneyPending === 'true'
      && !document.querySelector('[data-scene-inventory-action="submit"]').disabled);
    const lost = await facts(page);
    assert.equal(lost.local.giver, 100); assert.equal(lost.stored.giver, 10); assert.equal(lost.receipts, 1);
    assert.equal(await page.locator('#scene-transfer-money-amount').isDisabled(), true);
    await page.screenshot({ path: resolve(output, `money-pending-${width}.png`) });
    await page.locator('[data-scene-inventory-action="close"]').first().click();
    await open(page);
    await page.waitForFunction(() => document.querySelector('#scene-inventory-overlay')?.dataset.sceneMoneyPending === 'true');
    assert.equal(await page.locator('#scene-transfer-money-amount').inputValue(), '90');
    await submit(page); await page.waitForFunction(() => !document.querySelector('#scene-inventory-overlay.active'));
    const replayed = await facts(page);
    assert.equal(replayed.requests, 2); assert.equal(replayed.receipts, 1);
    assert.deepEqual(replayed.allRequests[0], replayed.allRequests[1]);
    assert.equal(replayed.local.giver, 10); assert.equal(replayed.local.receiver, 90);
    assertSilent(replayed);

    await page.reload(); await open(page);
    await choosePerson(page, 'giver', 'giver', 'Rianna');
    await choosePerson(page, 'receiver', 'receiver', 'Taren');
    await page.locator('#scene-transfer-kind').selectOption('item');
    await page.waitForFunction(() => document.querySelector('#scene-transfer-item')?.options.length === 1);
    await page.locator('#scene-transfer-icon').fill('/AleriaAlmanach/assets/letzte-rast/food/lauchbruehe.png');
    await page.locator('#scene-transfer-flavour').fill('Rianna reicht Taren den Becher.');
    assert.equal(await page.locator('[data-scene-item-narrative]:visible').count(), 2);
    assert.equal(await page.locator('[data-scene-money-preview]').isVisible(), false);
    const itemGeometry = await geometry(page);
    await page.screenshot({ path: resolve(output, `money-neighbor-item-${width}.png`) });
    assert.equal(await page.locator('#scene-transfer-flavour').inputValue(), 'Rianna reicht Taren den Becher.');
    await page.goto(`${fixtureUrl}?noScene=1`); await open(page);
    assert.equal(await page.locator('[data-scene-inventory-scope="all"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('[data-scene-inventory-scope="scene"]').isDisabled(), true);
    await page.locator('[data-scene-inventory-picker="giver"] summary').click();
    await page.waitForFunction(() => document.querySelectorAll('[data-scene-inventory-picker="giver"] [data-trade-picker-value]').length === 12);
    assert.equal(await page.locator('[data-scene-inventory-picker="giver"] [data-trade-picker-value="outside"]').count(), 1);
    await page.screenshot({ path: resolve(output, `money-no-scene-${width}.png`) });
    report.viewports.push({ width, selection, previewGeometry, sinkGeometry, itemGeometry, transfer: completed, sink: spent,
      lostResponseRetry: { requests: replayed.requests, receipts: replayed.receipts, exactReplay: true, after: replayed.local },
      invalidMoneySubmitDisabled: true, noSceneDefaultsToAll: true, itemModeNarrativePreserved: true });
    await context.close();
  }
  assert.deepEqual(report.errors, []); assert.deepEqual(report.consoleErrors, []); assert.deepEqual(report.failedResources, []);
  report.pass = true;
} catch (error) { report.pass = false; report.failure = { message: error.message, stack: error.stack }; throw error; }
finally {
  await writeFile(resolve(output, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser?.close(); await server.close();
}
console.log(JSON.stringify({ pass: report.pass, viewports: report.viewports.map(value => value.width), screenshots: 14, output }));

async function open(page) {
  await page.locator('#unchanged-scene [data-scene-inventory-action="open"]').click();
  await page.waitForFunction(() => document.querySelector('#scene-inventory-overlay.active')?.dataset.sceneInventoryLocked === 'false'
    || document.querySelector('#scene-inventory-overlay.active')?.dataset.sceneMoneyPending === 'true');
  await page.waitForFunction(() => !!document.querySelector('[data-scene-inventory-picker="giver"] summary'));
}
async function choosePerson(page, field, id, query) {
  const picker = page.locator(`[data-scene-inventory-picker="${field}"] [data-trade-actor-picker]`);
  if (!await picker.evaluate(element => element.open)) await picker.locator('summary').click();
  await picker.locator('[data-trade-picker-search]').fill(query);
  await picker.locator(`[data-trade-picker-value="${id}"]`).click();
  await page.waitForFunction(({ field, id }) => document.querySelector(`#scene-transfer-${field}`)?.value === id, { field, id });
}
async function setNinetyPfennig(page) {
  await choosePerson(page, 'giver', 'giver', 'Rianna');
  await choosePerson(page, 'receiver', 'receiver', 'Taren');
  await page.locator('#scene-transfer-currency').selectOption('pfennig');
  await page.locator('#scene-transfer-money-amount').fill('90');
  await page.waitForFunction(() => document.querySelector('.scene-money-calculation')?.textContent.includes('10 Eisenpfennig'));
}
async function submit(page) { await page.locator('[data-scene-inventory-action="submit"]').click(); }
async function facts(page) {
  return page.evaluate(() => ({ counters: structuredClone(moneyFixture.counters),
    stored: Object.fromEntries(moneyFixture.balances().stored), local: Object.fromEntries(moneyFixture.balances().local),
    receipts: moneyFixture.receipts.size, requests: moneyFixture.requests.length, request: moneyFixture.requests[0],
    allRequests: structuredClone(moneyFixture.requests), sceneUnchanged: moneyFixture.currentScene() === moneyFixture.sceneBefore }));
}
function assertSilent(facts) {
  assert.equal(facts.counters.loadComments, 0); assert.equal(facts.counters.orderKey, 0);
  assert.equal(facts.counters.notices, 0); assert.equal(facts.counters.itemCommits, 0); assert.equal(facts.sceneUnchanged, true);
  assert.doesNotMatch(JSON.stringify(facts.request), /flavour|visualIcon|orderKey|"text"/);
}
async function inspectPeople(page) {
  const giver = page.locator('[data-scene-inventory-picker="giver"] [data-trade-actor-picker]');
  await giver.locator('summary').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-scene-inventory-picker="giver"] [data-trade-picker-value]').length === 3);
  assert.equal(await giver.locator('[data-trade-picker-value="outside"]').count(), 0);
  const focusStable = await giver.locator('[data-trade-picker-search]').evaluate(async input => {
    const card = document.querySelector('.scene-inventory-card'), picker = input.closest('[data-trade-actor-picker]');
    input.focus();
    for (const query of ['R', 'Ri', 'Ria', 'Rianna', '']) {
      input.value = query; input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => requestAnimationFrame(resolve));
      if (document.activeElement !== input || input.closest('[data-trade-actor-picker]') !== picker || document.querySelector('.scene-inventory-card') !== card) return false;
    }
    return true;
  });
  assert.equal(focusStable, true);
  await page.locator('[data-scene-inventory-scope="all"]').click();
  await giver.locator('summary').click();
  const firstIds = await giver.locator('[data-trade-picker-value]').evaluateAll(elements => elements.map(element => element.dataset.tradePickerValue));
  assert.deepEqual(firstIds.slice(0, 3), ['comment-person', 'giver', 'receiver']);
  await giver.locator('[data-trade-picker-search]').fill('Alrik Fern');
  assert.equal(await giver.locator('[data-trade-picker-value="outside"]').count(), 1);
  await page.locator('[data-scene-inventory-scope="scene"]').click();
  return { inScene: 3, all: 28, sceneFirstInAll: true, archiveSearch: true, stableSearchFocus: focusStable };
}
async function geometry(page) {
  const result = await page.evaluate(() => {
    const card = document.querySelector('.scene-inventory-card'), body = document.querySelector('.scene-inventory-body');
    const rect = card.getBoundingClientRect();
    return { viewport: innerWidth, cardLeft: rect.left, cardRight: rect.right, cardWidth: rect.width,
      pageOverflow: document.documentElement.scrollWidth - innerWidth, bodyOverflow: body.scrollWidth - body.clientWidth };
  });
  assert(result.cardLeft >= -1 && result.cardRight <= result.viewport + 1, JSON.stringify(result));
  assert(result.pageOverflow <= 1 && result.bodyOverflow <= 1, JSON.stringify(result));
  return result;
}
