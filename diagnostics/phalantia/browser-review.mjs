/** Local headless UI verification; uses only a fresh isolated browser context. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {HOUSES} from '../../Vorschau/Phalantia/house-data.mjs';
import {ESTATES} from '../../Vorschau/Phalantia/estate-data.mjs';
import {CLASS_PROTOTYPES} from '../../Vorschau/Phalantia/warrior-data.mjs';

const require = createRequire('C:/Users/fhg_r/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium} = require('playwright');
const output = new URL('./',import.meta.url),url = 'http://127.0.0.1:8897/Vorschau/Phalantia/';
await mkdir(output,{recursive:true});
const report = {checkedAt:new Date().toISOString(),url,status:'running',runtime:'Installed Playwright with installed Chrome, fresh isolated headless contexts',desktop:{},mobile:{},consoleErrors:[],requestFailures:[]};
let browser;

async function ready(page) {
  await page.waitForSelector('.seat-card');
  for (const image of await page.locator('img:visible').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(image => image.complete ? undefined : new Promise(resolve => {
      image.addEventListener('load',resolve,{once:true});
      image.addEventListener('error',resolve,{once:true});
    }));
  }
  const broken = await page.locator('img:visible').evaluateAll(images => images.filter(image => !image.naturalWidth).map(image => image.getAttribute('src')));
  assert.deepEqual(broken,[]);
}

async function openArt(page,kind,id) {
  await page.locator(`button[data-action="show-art"][data-art-kind="${kind}"][data-art-id="${id}"]`).first().click();
  await page.waitForSelector('#art-dialog[open]');
  const detail = await page.locator('#art-dialog').evaluate(dialog => ({
    title:dialog.querySelector('#art-title')?.textContent,
    imageCount:dialog.querySelectorAll('img').length,
    imageSources:[...dialog.querySelectorAll('img')].map(image => image.getAttribute('src')),
    fit:[...dialog.querySelectorAll('img')].map(image => getComputedStyle(image).objectFit),
    loaded:[...dialog.querySelectorAll('img')].every(image => image.complete && image.naturalWidth > 0),
    scrollTop:dialog.querySelector('[data-role="art-details"]').scrollTop,
    clientWidth:dialog.clientWidth,scrollWidth:dialog.scrollWidth,
  }));
  if (!detail.loaded) {
    await page.locator('#art-dialog img').first().evaluate(async image => { await image.decode(); });
    detail.loaded = true;
  }
  const expected = (kind === 'house' ? HOUSES : kind === 'estate' ? ESTATES : CLASS_PROTOTYPES).find(item => item.id === id);
  assert.equal(detail.title,expected.name || expected.role);
  assert(detail.loaded);
  assert.deepEqual(detail.imageSources,[kind === 'house' ? expected.crest : expected.image]);
  assert(detail.fit.every(value => value === 'contain'));
  assert.equal(detail.scrollTop,0);
  assert(detail.scrollWidth <= detail.clientWidth+1);
  await page.locator('#art-dialog [data-action="close-art"]').click();
  return {kind,id,...detail};
}

try {
  assert(HOUSES.every(house => house.ready),'Finish the nine crest assets before the final browser review.');
  browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const desktop = await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  const page = await desktop.newPage();
  page.on('pageerror',error => report.consoleErrors.push(error.message));
  page.on('requestfailed',request => report.requestFailures.push({url:request.url(),error:request.failure()?.errorText}));
  await page.goto(url,{waitUntil:'networkidle'});
  await ready(page);
  assert.equal(await page.locator('.seat-card').count(),8);
  assert.equal(await page.locator('.estate-card').count(),6);
  assert.equal(await page.locator('.prototype-grid article').count(),8);
  assert.equal(await page.locator('#seat-lysandreia .house-card').count(),2);
  report.desktop.dialogs = [];
  for (const house of HOUSES) report.desktop.dialogs.push(await openArt(page,'house',house.id));
  for (const estate of ESTATES) report.desktop.dialogs.push(await openArt(page,'estate',estate.id));
  for (const prototype of CLASS_PROTOTYPES) report.desktop.dialogs.push(await openArt(page,'prototype',prototype.id));
  await page.screenshot({path:fileURLToPath(new URL('desktop.png',output)),fullPage:true});

  const house = HOUSES.find(item => !item.royal),key = 'aleria:proposal:phalantia:placements:v1';
  await page.getByRole('combobox',{name:'Haus wählen'}).selectOption(house.id);
  await page.locator('#seat-lysandreia [data-action="place-at-seat"]').click();
  assert.equal(await page.locator('#seat-lysandreia .house-card').count(),3);
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#seat-lysandreia .house-card').count(),3);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)),key);
  assert.equal(saved.placements[house.id],'lysandreia');
  await page.locator('[data-action="reset"]').click();
  assert.equal(await page.locator('#seat-lysandreia .house-card').count(),2);
  await page.getByRole('combobox',{name:'Haus wählen'}).selectOption(house.id);
  await page.locator('#seat-lysandreia [data-action="place-at-seat"]').click();
  await page.locator('[data-action="undo"]').click();
  assert.equal(await page.locator('#seat-lysandreia .house-card').count(),2);
  const downloadEvent = page.waitForEvent('download');
  await page.locator('[data-action="export"]').click();
  const download = await downloadEvent,draftPath = fileURLToPath(new URL('exported-test-draft.json',output));
  await download.saveAs(draftPath);
  const exported = JSON.parse(await readFile(draftPath,'utf8'));
  assert.equal(exported.realm,'phalantia');
  await page.locator('[data-role="import-file"]').setInputFiles(draftPath);
  await page.getByRole('combobox',{name:'Haus wählen'}).selectOption(house.id);
  await page.locator('[data-action="open-map"]').click();
  await page.waitForSelector('#map-dialog[open]');
  await page.waitForFunction(() => [...document.querySelectorAll('#map-dialog img')].every(image => image.complete && image.naturalWidth > 0));
  assert.equal(await page.locator('#map-dialog .clan-pin').count(),9);
  await page.screenshot({path:fileURLToPath(new URL('map.png',output))});
  const from = await page.locator(`#map-dialog .clan-pin[data-clan="${house.id}"]`).boundingBox();
  const to = await page.locator('#map-dialog .placement-target[data-drop-seat="lysandreia"]').boundingBox();
  assert(from && to);
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);
  await page.mouse.down();
  await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:12});
  await page.mouse.up();
  assert.equal(await page.locator('#seat-lysandreia .house-card').count(),3);
  // The shared drag controller suppresses synthetic trailing clicks for 200 ms.
  await page.waitForTimeout(250);
  await page.locator('#map-dialog [data-action="close-map"]').click();
  await page.waitForSelector('#map-dialog[open]',{state:'hidden'});
  await page.locator('[data-action="undo"]').click();
  assert.equal(await page.locator('#seat-lysandreia .house-card').count(),2);
  report.desktop.placement = {selection:true,move:true,persistenceAfterReload:true,undo:true,export:true,import:true,reset:true,mapModal:true,pointerDrag:true};
  report.desktop.overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(report.desktop.overflow,false);
  await desktop.close();

  const mobile = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const small = await mobile.newPage();
  await small.goto(url,{waitUntil:'networkidle'});
  await ready(small);
  report.mobile.dialogs = [];
  for (const house of HOUSES) report.mobile.dialogs.push(await openArt(small,'house',house.id));
  for (const estate of ESTATES) report.mobile.dialogs.push(await openArt(small,'estate',estate.id));
  for (const prototype of CLASS_PROTOTYPES) report.mobile.dialogs.push(await openArt(small,'prototype',prototype.id));
  await small.getByRole('combobox',{name:'Haus wählen'}).selectOption(house.id);
  await small.locator('#seat-lysandreia [data-action="place-at-seat"]').click();
  assert.equal(await small.locator('#seat-lysandreia .house-card').count(),3);
  await small.locator('[data-action="reset"]').click();
  assert.equal(await small.locator('#seat-lysandreia .house-card').count(),2);
  report.mobile.placement = {touchAlternativeSelection:true,move:true,reset:true};
  report.mobile.overflow = await small.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(report.mobile.overflow,false);
  await small.screenshot({path:fileURLToPath(new URL('mobile.png',output)),fullPage:true});
  await mobile.close();
  assert.deepEqual(report.consoleErrors,[]);
  assert.deepEqual(report.requestFailures,[]);
  report.status = 'passed';
} catch(error) {
  report.status = 'failed';
  report.error = String(error.stack || error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await writeFile(new URL('browser-review.json',output),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({status:report.status,desktopDialogs:report.desktop.dialogs?.length,mobileDialogs:report.mobile.dialogs?.length,error:report.error?.split('\n')[0]}));
