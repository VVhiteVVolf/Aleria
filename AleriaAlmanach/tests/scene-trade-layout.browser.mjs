import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, 'diagnostics/scene-trade-window-20261104');
await mkdir(output, { recursive: true });
await build({ absWorkingDir: root, bundle: true, format: 'iife', platform: 'browser',
  outfile: resolve(output, 'layout-controller.js'), stdin: { resolveDir: root, contents: `
import { openSceneTradeDialog } from './AleriaAlmanach/modules/scene-trade/scene-trade-controller.js';
import { renderSceneTradeCatalogResults } from './AleriaAlmanach/modules/scene-trade/scene-trade-view.js';
import { createSceneTradeLayoutFixture } from './AleriaAlmanach/tests/fixtures/scene-trade-layout-fixture.mjs';
const model = createSceneTradeLayoutFixture(), entry = { id:'layout-shop', sessionCast:model.selectableAccounts.map(account=>account.id), pages:[] };
model.data.context={ancestry:[entry]}; model.data.proposedMerchantId=model.state.merchantId;
window.__tradeService={load:async()=>structuredClone(model.data), ensureAccountsVersions:async()=>{},
availability:async id=>model.data.offers.filter(product=>product.listId===id).map(product=>({productId:product.id,available:true,status:'available'})),
sold:async()=>({items:[]}),checkout:async()=>{throw Error('Read-only fixture cannot checkout');}};
window.getCommentBackend=async()=>({loadComments:async()=>[]});
window.tradeFixture={model,renderResults:renderSceneTradeCatalogResults};
openSceneTradeDialog({threadId:model.state.threadId,entry,actorCharacterId:'person-0',participantThreadIds:[model.state.threadId],getCachedComments:()=>[]});
` }, plugins: [{ name: 'read-only-trade-service', setup(plugin) {
    plugin.onResolve({ filter: /scene-trade-service\.js$/ }, () => ({ path: 'fixture-service', namespace: 'trade-test' }));
    plugin.onLoad({ filter: /.*/, namespace: 'trade-test' }, () => ({ contents: 'export function createSceneTradeService(){return globalThis.__tradeService;}', loader: 'js' }));
  } }] });
await writeFile(resolve(output, 'layout-fixture.html'), `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/AleriaAlmanach/styles.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/modal.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/comments.css"><link rel="stylesheet" href="/AleriaAlmanach/styles/scene-trade.css">
<title>Lokale Handelsfenster-Prüfung</title><main id="unchanged-scene">Die Szene bleibt hier unverändert.</main><script src="./layout-controller.js"></script></html>`);
const server = await startChartQualityServer(root);
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ reducedMotion: 'reduce' }), errors = [];
  await context.route('**/*', route => new URL(route.request().url()).origin === server.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width:1680,height:940 });
  await page.goto(`${server.origin}/diagnostics/scene-trade-window-20261104/layout-fixture.html`);
  await page.waitForFunction(() => !!document.querySelector('[data-trade-action="add-buy"]:not(:disabled)'));
  await page.waitForTimeout(100);
  for(let index=0;index<20;index++) await page.locator(`[data-product-id="offer:${index}"]`).click();
  assert.equal(await page.locator('.scene-trade-line').count(),20);
  await page.locator('[data-trade-detail]').first().locator('summary').first().click();
  await page.locator('[data-line-field="priceMode"]').first().selectOption('agreed');
  const price=page.locator('[data-line-field="agreedTotalMinor"]').first(); await price.fill('998877.66'); await price.dispatchEvent('change');
  await page.waitForTimeout(50);
  assert.equal((await page.locator('.scene-trade-status.is-error').allTextContents()).join(''),'','Price editing must not trigger a nested blur/render DOM error');
  const measurements=[];
  for(const width of [1680,1280,768,390]){
    await page.setViewportSize({width,height:940});
    await page.evaluate(()=>document.querySelectorAll('[data-trade-actor-picker][open],[data-trade-people][open]').forEach(element=>{element.open=false;}));
    if(width<=800)await page.locator('[data-view="catalog"]').click();
    await page.evaluate(()=>document.querySelectorAll('.scene-trade-fields,.scene-trade-catalog,.scene-trade-cart-scroll').forEach(element=>{element.scrollTop=0;}));
    const closed=await measure(page,width,'closed');
    if(width>800){assert(closed.cardWidth>Math.min(width-40,1200),'Desktop dialog uses available width');assert(closed.twoColumns);}
    await page.screenshot({path:resolve(output,`trade-${width}.png`)});
    await page.locator('[data-picker-field="actorCharacterId"] > summary').click();
    await page.waitForFunction(()=>document.querySelectorAll('[data-picker-field="actorCharacterId"] [data-trade-picker-value]').length===8);
    await page.locator('[data-trade-people] > summary').click();
    await page.locator('[data-trade-people-search]').fill('Weitere');
    assert.equal(await page.locator('[data-trade-people-results] [data-person-id]').count(),12,'Manual archive search stays bounded');
    measurements.push(closed,await measure(page,width,'pickers-open'));
    await page.screenshot({path:resolve(output,`trade-${width}-people.png`)});
    if(width<=800){await page.locator('[data-view="cart"]').click();measurements.push(await measure(page,width,'cart'));}
  }
  await page.setViewportSize({width:1680,height:940});
  await page.evaluate(()=>document.querySelectorAll('[data-trade-actor-picker][open],[data-trade-people][open]').forEach(element=>{element.open=false;}));
  const latency=await page.evaluate(async()=>{
    const card=document.querySelector('.scene-trade-card'),search=document.querySelector('[data-trade-field="search"]'),cart=document.querySelector('.scene-trade-cart');
    const picker=document.querySelector('[data-picker-field="payerKey"]'),elapsed=[];
    const queries=['K','Kr','Krä','Kräu','Kräut','Kräuter','','Reise'];
    for(let index=0;index<64;index++){
      search.focus();const start=performance.now();search.value=queries[index%queries.length];search.dispatchEvent(new Event('input',{bubbles:true}));
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));elapsed.push(performance.now()-start);
      if(document.querySelector('.scene-trade-card')!==card||document.querySelector('.scene-trade-cart')!==cart||document.querySelector('[data-picker-field="payerKey"]')!==picker||document.activeElement!==search)throw Error('Typing replaced card, cart, picker or focus');
      if(document.querySelectorAll('.scene-trade-product').length>24)throw Error('Goods DOM exceeded its24row page');
    }
    const model=tradeFixture.model,direct=[];
    for(let count=0;count<20;count++){const start=performance.now();tradeFixture.renderResults(model);direct.push(performance.now()-start);}
    return{globalCharacters:model.accounts.length,scopedCharacters:model.selectableAccounts.length,globalOffers:model.data.offers.length,
      actualControllerInputs:elapsed.length,typingWithTwoFramesMs:elapsed,renderMedianMs:direct.sort((a,b)=>a-b)[10],stableCard:true,stableCart:true,stablePickers:true,stableSearchFocus:true};
  });
  assert(latency.renderMedianMs<50,'Cached goods rendering stays below50ms in the local fixture');
  await page.locator('[data-trade-action="review"]').click();
  for(const width of [1680,390]){
    await page.setViewportSize({width,height:940});
    measurements.push(await measure(page,width,'review'));
    assert.equal(await page.locator('[data-trade-action="checkout"]').count(),1);
    assert.equal(await page.locator('[data-trade-action="remove"]').count(),0);
  }
  assert.deepEqual(errors,[]);
  assert.equal(await page.locator('#unchanged-scene').textContent(),'Die Szene bleibt hier unverändert.');
  await writeFile(resolve(output,'layout-report.json'),`${JSON.stringify({passed:true,localFixture:true,actualController:true,service:'test-only esbuild alias; no Firebase',externalWrites:0,viewports:4,measurements,latency},null,2)}\n`);
  console.log(JSON.stringify({passed:true,output,cases:measurements.length,latency}));
}finally{await browser?.close();await server.close();}

async function measure(page,width,state){
  const result=await page.evaluate(()=>{
    const card=document.querySelector('.scene-trade-card'),catalog=document.querySelector('.scene-trade-catalog'),cart=document.querySelector('.scene-trade-cart');
    const visible=element=>element.getClientRects().length&&getComputedStyle(element).visibility!=='hidden';
    const overflow=[...card.querySelectorAll('.scene-trade-product,.scene-trade-line-main,.scene-trade-money-row,.scene-trade-actor-trigger,.scene-trade-person-chip')].filter(visible).filter(element=>element.scrollWidth>element.clientWidth+2).map(element=>element.className);
    const collisions=[];
    for(const row of card.querySelectorAll('.scene-trade-line-main,.scene-trade-product')){if(!visible(row))continue;const children=[...row.children].filter(visible);for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){const a=children[i].getBoundingClientRect(),b=children[j].getBoundingClientRect();if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)collisions.push(row.className);}}
    const a=catalog?.getBoundingClientRect(),b=cart?.getBoundingClientRect();
    return{cardWidth:card.getBoundingClientRect().width,horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2||card.scrollWidth>card.clientWidth+2,overflow,collisions,
      twoColumns:!!a&&!!b&&a.width>0&&b.width>0&&a.right<=b.left+1,cartLines:card.querySelectorAll('.scene-trade-line').length};
  });
  assert.equal(result.horizontalOverflow,false,`${width}px ${state}: no horizontal overflow`);
  assert.deepEqual(result.overflow,[],`${width}px ${state}: no overflowing labels or prices`);
  assert.deepEqual(result.collisions,[],`${width}px ${state}: no overlapping sibling cells`);
  assert.equal(result.cartLines,20);return{width,state,...result};
}
