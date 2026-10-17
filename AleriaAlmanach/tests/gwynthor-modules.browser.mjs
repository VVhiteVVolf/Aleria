import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const remote=process.argv.find(arg=>arg.startsWith('--origin='))?.slice(9);
const output=resolve(root,`.tmp/gwynthor-module-release/${remote?'online':'local'}-${Date.now()}`);
await mkdir(output,{recursive:true});
const ids=['goettliche-eleganz','die-lachende-nixe','zum-dritten-funken','celtigerns-letzte-rast','gwynthorer-theater'];
const oldNixe=JSON.parse(await readFile(resolve(root,'AleriaAlmanach/modules/lachende-nixe/sources/module-before-finalization.json'),'utf8')).entry;
const oldRast=JSON.parse(await readFile(resolve(root,'AleriaAlmanach/modules/letzte-rast/sources/module-before.json'),'utf8')).entry;
const server=remote?null:await startChartQualityServer(root);
const origin=remote||server.origin;
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context=await browser.newContext({viewport:{width:1460,height:1100},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===origin&&['GET','HEAD'].includes(request.method()))return route.continue();
    if(request.method()==='GET'&&url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/')){
      const response=await fetch(request.url());
      return route.fulfill({status:response.status,contentType:response.headers.get('content-type'),headers:{'access-control-allow-origin':'*'},body:Buffer.from(await response.arrayBuffer())});
    }
    return route.abort();
  });
  const page=await context.newPage();
  await page.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(()=>typeof renderAll==='function');
  await page.waitForFunction(()=>['ready','slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter=page.locator('[data-loading-action="enter"]');
  await(await enter.isEnabled()?enter:page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-almanach-loading'));
  const expected=await page.evaluate(({ids,oldNixe,oldRast})=>{
    const target=SECTIONS.find(s=>s.entries?.some(e=>e.id==='gwynthorer-theater'));
    const all=SECTIONS.flatMap(s=>s.entries||[]);
    const expected=Object.fromEntries(ids.map(id=>{const e=all.find(e=>e.id===id);if(!e)throw new Error(id);return [id,{image:getArchiveEntryPreviewImage(e),pages:e.pages.length}];}));
    // Include saved originals and copies in a different folder, as on an older browser.
    const copies=ids.filter(id=>!['die-lachende-nixe','celtigerns-letzte-rast'].includes(id)).map(id=>({...all.find(e=>e.id===id),title:'Alte gespeicherte Fassung',pages:[]}));
    applyModuleStorePayload({...readLocalModuleStorePayload(),customSections:[{...target,path:[...target.path,'Alte Ablage'],entries:[oldNixe,oldRast,...copies]}]});
    const visible=getValidSections().flatMap(s=>s.entries||[]).map(e=>e.id).filter(Boolean);
    if(visible.length!==new Set(visible).size)throw new Error('Doppelte Modul-IDs im Archiv');
    for(const id of ids)if(visible.filter(value=>value===id).length!==1)throw new Error(id);
    setActiveArchivePath(target.tab,target.path);switchTab(target.tab,{render:true});return expected;
  },{ids,oldNixe,oldRast});
  const results=[];
  for(const width of [1460,390]){
    await page.setViewportSize({width,height:1100});
    for(const id of ids){
      const card=page.locator(`.entry-card:has(.entry-card-open[data-entry-id="${id}"])`);
      assert.equal(await card.count(),1,`${id}: exactly one card`);
      const metrics=await card.evaluate(async card=>{
        const img=card.querySelector('.card-image-wrap img');img.loading='eager';await img.decode();
        const wrap=img.parentElement.getBoundingClientRect(),box=img.getBoundingClientRect(),style=getComputedStyle(img);
        return {emblem:card.classList.contains('entry-card-emblem'),src:img.getAttribute('src'),fit:style.objectFit,padding:style.padding,width:box.width,height:box.height,wrapWidth:wrap.width,wrapHeight:wrap.height,naturalWidth:img.naturalWidth};
      });
      assert.equal(metrics.emblem,false,id);assert.equal(metrics.fit,'cover',id);assert.equal(metrics.padding,'0px',id);
      assert.equal(metrics.src,expected[id].image,id);assert.ok(metrics.naturalWidth>0,id);
      assert.ok(Math.abs(metrics.width-metrics.wrapWidth)<1&&Math.abs(metrics.height-metrics.wrapHeight)<1,id);
      assert.equal(await page.evaluate(id=>findCurrentSectionByEntryId(id).entry.pages.length,id),expected[id].pages);
      results.push({width,id,...metrics});
    }
    await page.locator('.card-grid:visible').first().screenshot({path:resolve(output,`module-${width}.png`)});
  }
  await page.setViewportSize({width:1460,height:1100});
  await page.evaluate(()=>{
    const target=SECTIONS.find(s=>s.entries?.some(e=>e.id==='gwynthorer-theater'));
    target.entries.push({id:'preview-emblem-check',title:'Wappen-Vorschau',pages:[{guildPage:true,guild:{crestImage:'./assets/gwynthor-theater/awenfryn.png'}}]});renderAll();
  });
  const emblem=page.locator('.entry-card:has(.entry-card-open[data-entry-id="preview-emblem-check"])');
  assert.match(await emblem.getAttribute('class'),/entry-card-emblem/);
  assert.equal(await emblem.locator('img').evaluate(img=>getComputedStyle(img).objectFit),'contain');
  await emblem.screenshot({path:resolve(output,'emblem-control.png')});
  await page.evaluate(()=>openArchiveEntryById('gwynthorer-theater',{pageIndex:4}));
  assert.match(await page.locator('#modal-overlay').innerText(),/Freydis und die zwölf Prüfungen/);
  assert.doesNotMatch(await page.locator('#modal-overlay').innerText(),/Die Schlacht am Roten Berg/);
  const scene=page.locator('#modal-overlay img[src*="freydis-pruefungen.png"]');
  await scene.evaluate(img=>img.decode());assert.ok(await scene.evaluate(img=>img.naturalWidth>0));
  await page.screenshot({path:resolve(output,'freydis-repertoire.png')});
  await writeFile(resolve(output,'report.json'),JSON.stringify({passed:true,origin,savedOriginals:5,cards:5,viewports:[1460,390],actualPageCounts:expected,productionWritesBlocked:true,results},null,2));
  console.log(`PASS: ${output}`);
} finally {await browser?.close();await server?.close();}
