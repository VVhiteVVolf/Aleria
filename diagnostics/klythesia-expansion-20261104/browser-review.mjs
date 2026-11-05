/** Isolated local browser review; no existing browser profile or production writes. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {ARTWORKS} from '../../Vorschau/Klythesia/art-data.mjs';
import {ESTATES} from '../../Vorschau/Klythesia/estate-data.mjs';
import {CLASS_PROTOTYPES,HOUSE_WARRIORS} from '../../Vorschau/Klythesia/warrior-data.mjs';
import {HOUSES} from '../../Vorschau/Klythesia/house-data.mjs';
import {REALM_WARRIOR} from '../../Vorschau/Klythesia/realm-warrior-data.mjs';
import {PLACEMENT_STORAGE_KEY} from '../../Vorschau/Klythesia/placement-state.mjs';
const require=createRequire('C:/Users/fhg_r/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const realmOnly=process.argv.includes('--realm-only');
const output=new URL(realmOnly?'./browser/realm/':'./browser/',import.meta.url),url='http://127.0.0.1:8897/Vorschau/Klythesia/';
await mkdir(output,{recursive:true});
const report={status:'running',checkedAt:new Date().toISOString(),url,scope:realmOnly?'Incremental review of changed realm-crest dialog and new national Thorax view':'Full country review',runtime:'Installed Chrome; fresh isolated headless contexts',desktop:{},mobile:{},consoleErrors:[],requestFailures:[],httpErrors:[]};
const originalPlacements=Object.fromEntries(HOUSES.map(house=>[house.id,house.sourceSeat]));
let browser;
function observe(page){
  page.on('pageerror',error=>report.consoleErrors.push(error.message));
  page.on('requestfailed',request=>report.requestFailures.push({url:request.url(),error:request.failure()?.errorText}));
  page.on('response',response=>{if(response.status()>=400)report.httpErrors.push({url:response.url(),status:response.status()});});
}
async function ready(page){
  await page.waitForSelector('[data-seat="kallisteia"]');
  assert.equal(await page.locator('[data-fact-id]').count(),51);
  assert.equal(await page.locator('.estate-card').count(),8);
  assert.equal(await page.locator('.prototype-card').count(),7);
  assert.equal(await page.locator('.seat-card').count(),7);
  assert.equal(await page.locator('#wappen .motif-card').count(),7);
}
const placements=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key))?.placements??null,PLACEMENT_STORAGE_KEY);
async function screenshot(page,name){await page.screenshot({path:fileURLToPath(new URL(name+'.png',output))});}
async function openDialog(page,{kind,id,name,images}){
  const trigger=kind==='house'?page.locator(`#wappen [data-action="show-house"][data-house="${id}"]`).first():kind==='realm-warrior'?page.locator(`[data-action="show-art"][data-art-kind="realm-warrior"][data-art-id="${id}"]`):page.locator(`[data-action="show-art"][data-art-id="${id}"]`).first();
  await trigger.click();
  const dialog=page.locator('#art-dialog');await page.waitForSelector('#art-dialog[open]');
  await dialog.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  const state=await dialog.evaluate(dialog=>({
    title:dialog.querySelector('#art-title').textContent,
    images:[...dialog.querySelectorAll('figure img')].map(image=>({src:image.getAttribute('src'),loaded:image.naturalWidth>0,fit:getComputedStyle(image).objectFit})),
    originals:[...dialog.querySelectorAll('figure>a')].map(link=>link.getAttribute('href')),
    overflow:dialog.scrollWidth>dialog.clientWidth+1,scrollTop:dialog.scrollTop
  }));
  assert.equal(state.title,name);assert.deepEqual(state.images.map(image=>image.src),images);
  assert(state.images.every(image=>image.loaded&&image.fit==='contain'));
  assert.equal(state.overflow,false);assert.equal(state.scrollTop,0);
  for(const original of state.originals)assert.equal((await page.request.get(new URL(original,url).href)).status(),200);
  if(id==='anassa'||id==='theios'||id==='antrophe'||id==='toxare'||id==='klyrath'||id==='elyssar'||id==='realm-klythesia')await screenshot(page,`${page.viewportSize().width}-${kind}-${id}`);
  await page.keyboard.press('Escape');await page.waitForSelector('#art-dialog[open]',{state:'hidden'});
  assert(await trigger.evaluate(button=>button===document.activeElement));
  return {kind,id,...state};
}
async function checkMap(page,key){
  await page.locator('[data-action="open-map"]').click();await page.waitForSelector('#map-dialog[open]');
  const canvas=page.locator('#map-dialog .map-canvas');await canvas.locator(':scope>img').evaluate(image=>image.decode());
  const start=await canvas.evaluate(element=>element.getBoundingClientRect().width);
  for(let n=0;n<4;n++)await page.locator('#map-dialog [data-action="zoom-in"]').click();
  const enlarged=await canvas.evaluate(element=>element.getBoundingClientRect().width);assert(enlarged>start*2);
  const pan=await page.locator('#map-dialog .map-viewport').evaluate(element=>{element.scrollLeft=200;element.scrollTop=160;return {left:element.scrollLeft,top:element.scrollTop};});
  assert(pan.left>0&&pan.top>0);
  await screenshot(page,`${key}-map-zoom`);
  await page.locator('#map-dialog [data-action="fit-map"]').click();
  assert.equal(await page.locator('#map-dialog [data-role="zoom-label"]').textContent(),'Ganze Karte');
  assert(Math.abs((await canvas.evaluate(element=>element.getBoundingClientRect().width))-start)<1);
  if(key==='desktop'){
    const source=await page.locator('#map-dialog .clan-pin[data-drag-house="klyrath"]').boundingBox();
    assert(source);await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();
    await page.mouse.move(source.x+source.width/2+18,source.y+source.height/2+18,{steps:3});
    const target=await page.locator('#map-dialog .placement-target[data-drop-seat="aenoria"]').boundingBox();
    assert(target);await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:15});await page.mouse.up();
    assert.equal((await placements(page)).klyrath,'aenoria');
    // Shared drag ownership suppresses the synthetic click for 200 ms after drop.
    await page.waitForTimeout(250);
  }
  await page.keyboard.press('Escape');await page.waitForSelector('#map-dialog[open]',{state:'hidden'});
  return {start,enlarged,pan,fit:true,desktopDrag:key==='desktop'};
}
async function checkDrafts(page){
  await page.locator('[data-role="house-select"]').selectOption('naukyra');
  await page.locator('[data-role="seat-select"]').selectOption('lykara');
  await page.locator('[data-action="move-selected"]').click();
  assert.equal((await placements(page)).naukyra,'lykara');
  await page.reload({waitUntil:'networkidle'});await ready(page);
  assert.equal((await placements(page)).naukyra,'lykara');
  const downloadPromise=page.waitForEvent('download');await page.locator('[data-action="export"]').click();
  const download=await downloadPromise;const exported=JSON.parse(await readFile(await download.path(),'utf8'));
  assert.equal(exported.realm,'klythesia');assert.equal(exported.placements.naukyra,'lykara');
  const before=await placements(page);
  await page.locator('[data-role="import-file"]').setInputFiles({name:'wrong.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...exported,realm:'phalantia'}))});
  assert.deepEqual(await placements(page),before);
  await page.locator('[data-role="import-file"]').setInputFiles({name:'correct.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...exported,placements:originalPlacements}))});
  assert.deepEqual(await placements(page),originalPlacements);
  await page.locator('[data-action="undo"]').click();assert.deepEqual(await placements(page),before);
  await page.locator('[data-action="reset"]').click();assert.deepEqual(await placements(page),originalPlacements);
  return {selectionMove:true,persist:true,export:true,import:true,foreignDraftRejected:true,undo:true,reset:true};
}
async function review(context,key){
  const page=await context.newPage();observe(page);await page.goto(url,{waitUntil:'networkidle'});await ready(page);
  await screenshot(page,`${key}-hero`);
  report[key].dialogs=[];
  const realm=ARTWORKS.find(art=>art.kind==='realm');
  report[key].dialogs.push(await openDialog(page,{kind:'artwork',id:realm.id,name:realm.name,images:[realm.image,REALM_WARRIOR.image]}));
  report[key].dialogs.push(await openDialog(page,{kind:'realm-warrior',id:REALM_WARRIOR.id,name:REALM_WARRIOR.name,images:[REALM_WARRIOR.image]}));
  if(realmOnly){
    report[key].overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(report[key].overflow,false);
    await page.close();await context.close();return;
  }
  for(const estate of ESTATES)report[key].dialogs.push(await openDialog(page,{kind:'estate',id:estate.id,name:estate.name,images:[estate.image]}));
  for(const prototype of CLASS_PROTOTYPES)report[key].dialogs.push(await openDialog(page,{kind:'prototype',id:prototype.id,name:prototype.name,images:[prototype.image]}));
  for(const house of HOUSES){
    const warrior=HOUSE_WARRIORS.find(warrior=>warrior.houseId===house.id);
    report[key].dialogs.push(await openDialog(page,{kind:'house',id:house.id,name:house.name,images:[house.crest,warrior.image]}));
  }
  report[key].map=await checkMap(page,key);
  report[key].draft=await checkDrafts(page);
  for(const [selector,name]of [['#geschichte','history'],['#staende','estates'],['#krieger','prototypes'],['#wappen','clans']]){
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.locator(selector+' img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    await screenshot(page,`${key}-${name}`);
  }
  for(const group of await page.locator('.evidence-group').all())if(!await group.evaluate(element=>element.open))await group.locator(':scope>summary').click();
  report[key].allSectionsExpanded=true;
  report[key].overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(report[key].overflow,false);
  const sourceLinks=await page.locator('.source-register a,.section-link,.archive-link a').evaluateAll(links=>[...new Set(links.map(link=>link.href).filter(url=>!url.includes('#geschichte')))]);
  for(const href of sourceLinks)assert.equal((await page.request.get(href)).status(),200,href);
  report[key].sourceLinks=sourceLinks.length;
  await page.close();await context.close();
}
try{
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  await review(await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true}),'desktop');
  await review(await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true}),'mobile');
  assert.deepEqual(report.consoleErrors,[]);assert.deepEqual(report.requestFailures,[]);assert.deepEqual(report.httpErrors,[]);
  report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack??error);process.exitCode=1;}
finally{await browser?.close();await writeFile(new URL('browser-review.json',output),JSON.stringify(report,null,2)+'\n','utf8');}
console.log(JSON.stringify({status:report.status,desktopDialogs:report.desktop.dialogs?.length,mobileDialogs:report.mobile.dialogs?.length,error:report.error?.split('\n')[0]}));
