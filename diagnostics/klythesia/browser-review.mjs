/** Local visual review: fresh isolated Chrome contexts; no user browser data. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {ARTWORKS} from '../../Vorschau/Klythesia/art-data.mjs';
import {MAP} from '../../Vorschau/Klythesia/map-data.mjs';
const require=createRequire('C:/Users/fhg_r/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const output=new URL('./browser/',import.meta.url),url='http://127.0.0.1:8897/Vorschau/Klythesia/';
await mkdir(output,{recursive:true});
const report={checkedAt:new Date().toISOString(),url,status:'running',runtime:'Installed Chrome, fresh headless contexts',desktop:{},mobile:{},consoleErrors:[],requestFailures:[],httpErrors:[]};
let browser;
function observe(page){
  page.on('pageerror',error=>report.consoleErrors.push(error.message));
  page.on('requestfailed',request=>report.requestFailures.push({url:request.url(),error:request.failure()?.errorText}));
  page.on('response',response=>{if(response.status()>=400)report.httpErrors.push({url:response.url(),status:response.status()});});
}
async function ready(page){
  await page.waitForSelector('[data-place-id="kallisteia"]');
  for(const img of await page.locator('img:visible').all()){
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(image=>image.decode());
  }
  assert.equal(await page.locator('[data-fact-id]').count(),51);
  assert.equal(await page.locator('[data-question-id]').count(),21);
  assert.equal(await page.locator('.clan-pin').count(),0);
  assert.equal(await page.locator('.place-card').count(),7);
}
async function openArt(page,art){
  const trigger=page.locator(`[data-action="show-art"][data-art-id="${art.id}"]`);
  await trigger.click();
  await page.waitForSelector('#art-dialog[open]');
  await page.locator('#art-dialog img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  const state=await page.locator('#art-dialog').evaluate(dialog=>({
    title:dialog.querySelector('#art-title').textContent,
    image:dialog.querySelector('img').getAttribute('src'),
    original:dialog.querySelector('figure a').getAttribute('href'),
    loaded:dialog.querySelector('img').naturalWidth>0,
    fit:getComputedStyle(dialog.querySelector('img')).objectFit,
    scrollTop:dialog.scrollTop,
    clientWidth:dialog.clientWidth,scrollWidth:dialog.scrollWidth
  }));
  assert.equal(state.title,art.name);assert.equal(state.image,art.image);assert.equal(state.original,art.fullsize);
  assert(state.loaded);assert.equal(state.fit,'contain');assert.equal(state.scrollTop,0);
  assert(state.scrollWidth<=state.clientWidth+1);
  const response=await page.request.get(new URL(art.fullsize,url).href);assert.equal(response.status(),200);
  await page.locator('#art-dialog [data-action="close-art"]').click();
  await page.waitForSelector('#art-dialog[open]',{state:'hidden'});
  assert(await trigger.evaluate(button=>button===document.activeElement));
  return {id:art.id,...state};
}
async function checkMap(page){
  await page.locator('[data-action="open-map"]').click();
  await page.waitForSelector('#map-dialog[open]');
  const image=page.locator('#map-dialog .map-canvas>img');await image.evaluate(image=>image.decode());
  assert.equal(await image.getAttribute('src'),MAP.map);
  const start=await page.locator('#map-dialog .map-canvas').evaluate(element=>element.getBoundingClientRect().width);
  for(let n=0;n<5;n++)await page.locator('#map-dialog [data-action="zoom-in"]').click();
  const enlarged=await page.locator('#map-dialog .map-canvas').evaluate(element=>element.getBoundingClientRect().width);
  assert(enlarged>start*2);
  const pan=await page.locator('#map-dialog .map-viewport').evaluate(element=>{
    element.scrollLeft=300;element.scrollTop=200;
    return {left:element.scrollLeft,top:element.scrollTop,width:element.clientWidth,scrollWidth:element.scrollWidth};
  });
  assert(pan.left>0);assert(pan.top>0);
  await page.screenshot({path:fileURLToPath(new URL(`map-${page.viewportSize().width}.png`,output))});
  await page.locator('#map-dialog [data-action="fit-map"]').click();
  assert.equal(await page.locator('#map-dialog [data-role="zoom-label"]').textContent(),'Ganze Karte');
  const fitted=await page.locator('#map-dialog .map-canvas').evaluate(element=>element.getBoundingClientRect().width);
  assert(Math.abs(fitted-start)<1);
  await page.keyboard.press('Escape');
  await page.waitForSelector('#map-dialog[open]',{state:'hidden'});
  assert(await page.locator('[data-action="open-map"]').evaluate(button=>button===document.activeElement));
  return {image:MAP.map,start,enlarged,pan,fit:true,escape:true,focusRestored:true};
}
async function checkSources(page){
  const links=await page.locator('.source-register a,.archive-link a,.section-link').evaluateAll(links=>[...new Set(links.map(link=>link.href))]);
  for(const link of links)assert.equal((await page.request.get(link)).status(),200,link);
  return links.length;
}
async function fullReview(context,key){
  const page=await context.newPage();observe(page);await page.goto(url,{waitUntil:'networkidle'});await ready(page);
  report[key].dialogs=[];
  for(const art of ARTWORKS)report[key].dialogs.push(await openArt(page,art));
  report[key].map=await checkMap(page);
  report[key].sourceLinks=await checkSources(page);
  const first=page.locator('.source-detail').first();await first.locator('summary').click();
  assert(await first.evaluate(element=>element.open));
  await first.locator('summary').click();
  for(const group of await page.locator('.evidence-group').all()){
    if(!await group.evaluate(element=>element.open))await group.locator(':scope>summary').click();
  }
  report[key].allSectionsExpanded=true;
  report[key].overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  assert.equal(report[key].overflow,false);
  await page.screenshot({path:fileURLToPath(new URL(`${key}-expanded.png`,output)),fullPage:true});
  await page.reload({waitUntil:'networkidle'});await ready(page);await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:fileURLToPath(new URL(`${key}.png`,output)),fullPage:true});
  await page.screenshot({path:fileURLToPath(new URL(`${key}-hero.png`,output))});
  await page.locator('#wappen').scrollIntoViewIfNeeded();
  await page.screenshot({path:fileURLToPath(new URL(`${key}-gallery.png`,output))});
  await page.locator('[data-art-id="sphinx"]').click();await page.locator('#art-dialog img').evaluate(image=>image.decode());
  await page.screenshot({path:fileURLToPath(new URL(`${key}-art.png`,output))});
  await page.keyboard.press('Escape');await context.close();
}
try{
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  await fullReview(await browser.newContext({viewport:{width:1440,height:1000}}),'desktop');
  await fullReview(await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),'mobile');
  assert.deepEqual(report.consoleErrors,[]);assert.deepEqual(report.requestFailures,[]);assert.deepEqual(report.httpErrors,[]);
  report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack||error);process.exitCode=1;}
finally{await browser?.close();await writeFile(new URL('browser-review.json',output),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({status:report.status,desktopDialogs:report.desktop.dialogs?.length,mobileDialogs:report.mobile.dialogs?.length,error:report.error?.split('\n')[0]}));
