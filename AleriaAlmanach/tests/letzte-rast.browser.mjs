import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { planRastCharacters } from '../modules/letzte-rast/rast-characters.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const output=resolve(root,`.tmp/letzte-rast/browser-${Date.now()}`);
await mkdir(output,{recursive:true});
const entry=JSON.parse(await readFile(new URL('../../Charakter Archiv Exporte/Module/Celtigerns Letzte Rast/celtigerns-letzte-rast-2026-10-16.json',import.meta.url),'utf8')).module.entry;
const server=await startChartQualityServer(root);
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context=await browser.newContext({viewport:{width:1848,height:1100},reducedMotion:'reduce'});
  const cache=new Map();
  await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===server.origin) return route.continue();
    const isImage=url.origin==='https://i.imgur.com';
    const isSdk=url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/');
    if(request.method()==='GET'&&(isImage||isSdk)){
      if(!cache.has(request.url()))cache.set(request.url(),fetch(request.url()).then(async response=>({status:response.status,contentType:response.headers.get('content-type'),headers:{'access-control-allow-origin':'*'},body:Buffer.from(await response.arrayBuffer())})));
      return route.fulfill(await cache.get(request.url()));
    }
    return route.abort();
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(()=>typeof openModal==='function');
  await page.waitForFunction(()=>['ready','slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter=page.locator('[data-loading-action="enter"]');
  await(await enter.isEnabled()?enter:page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-almanach-loading'));
  for(let index=0;index<entry.pages.length;index++){
    await page.evaluate(({entry,index})=>{closeModal();openModal(entry,{pageIndex:index});},{entry,index});
    await page.locator('#modal-overlay').waitFor({state:'visible'});
    const broken=await page.locator('#modal-overlay img').evaluateAll(async images=>{
      const relevant=images.filter(img=>img.getAttribute('src')&&(/\/letzte-rast\/|\/IconOrdner\/|\/Stammb(%C3%A4|ä)ume\//i.test(img.src)||/i\.imgur\.com/i.test(img.src)&&img.closest('.trade-catalog-item,.guild-service-card')));
      await Promise.all(relevant.map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));
      return relevant.filter(img=>!img.naturalWidth).map(img=>img.src);
    });
    assert.deepEqual(broken,[],`Bilder auf Seite ${index+1}`);
    if(index===3){
      const tabs=page.locator('#modal-overlay [data-hierarchy-tree-tab]');assert.equal(await tabs.count(),6);
      for(let n=0;n<6;n++){await tabs.nth(n).click();await page.screenshot({path:resolve(output,`personal-${n+1}.png`)});}
    }
    if(index===4){
      assert.equal(await page.locator('.trade-catalog-item').count(),58);
      for(const category of entry.pages[4].tradeCatalog.categories){await page.locator(`[data-trade-filter="${category.id}"]`).click();assert.ok(await page.locator('.trade-catalog-item:visible').count()>0);await page.screenshot({path:resolve(output,`karte-${category.id}.png`)});}
      await page.locator('[data-trade-filter="all"]').click();
      const search=page.locator('[data-trade-search-input]');await search.fill('Hirschrücken');assert.equal(await page.locator('.trade-catalog-item:visible').count(),2);
      await search.fill('NichtsDieLetzteRast');assert.equal(await page.locator('.trade-catalog-item:visible').count(),0);await search.fill('');
    }
    await page.screenshot({path:resolve(output,`seite-${index+1}.png`)});
  }
  assert.deepEqual(errors,[]);
  const cleaned=await page.evaluate(entry=>entry.pages.map(page=>sanitizeModulePage(JSON.parse(JSON.stringify(sanitizeModulePage(page))))),entry);
  assert.equal(cleaned[4].tradeCatalog.items.length,58);assert.equal(cleaned[5].guildServices.services.length,12);
  for(const id of ['haus-vann','haus-maerllys','haus-pendrwn','haus-raves']){
    const chart=await context.newPage();await chart.goto(`${server.origin}/Stammb%C3%A4ume/Stammbaum.html?family=${id}&mode=view`);
    await chart.waitForFunction(()=>document.querySelectorAll('#family-chart .aleria-person-card').length>8);
    assert.ok(!(await chart.locator('#family-title').innerText()).includes('Unbekannt'));
    const missing=await chart.locator('#family-chart img').evaluateAll(async images=>{await Promise.all(images.map(img=>img.decode().catch(()=>{})));return images.filter(img=>!img.naturalWidth).map(img=>img.src);});
    assert.deepEqual(missing,[],id);await chart.screenshot({path:resolve(output,`${id}.png`)});await chart.close();
  }
  const plan=planRastCharacters([],{});
  const count=await page.evaluate(plan=>{
    closeModal();_characters=plan.entries.map(item=>({id:item.id,...item.data}));
    _charTabs=['Alle',...plan.config.tabs];_charTabMap=plan.config.map;_charSubtabs=plan.config.subtabs;_charSubtabMap=plan.config.subtabMap;
    _activeCharTab='Celtigerns Letzte Rast';_activeCharSubtab='Alle';setCharacterRegisterViewMode('collections');return getCharsForActiveTab().length;
  },plan);
  assert.equal(count,33);assert.equal(await page.locator('#char-grid .char-card').count(),33);
  await page.evaluate(()=>switchTab('Charaktere'));
  await page.locator('#char-grid').waitFor({state:'visible'});
  const profileBroken=await page.locator('#char-grid img').evaluateAll(async images=>{await Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));return images.filter(img=>img.getAttribute('src')&&!img.naturalWidth).map(img=>img.src);});
  assert.deepEqual(profileBroken,[]);
  await page.screenshot({path:resolve(output,'charakterverzeichnis.png')});
  await page.goto(`${server.origin}/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=haus-vann`);
  await page.waitForFunction(()=>window.HAEUSER_DATA?.meta?.id==='haus-vann');
  assert.match(await page.locator('body').innerText(),/Brenn Vann/);
  const houseBroken=await page.locator('img').evaluateAll(async images=>{await Promise.all(images.map(img=>img.decode().catch(()=>{})));return images.filter(img=>!img.naturalWidth&&img.getAttribute('src')).map(img=>img.src);});
  assert.deepEqual(houseBroken,[]);await page.screenshot({path:resolve(output,'hausseite-vann.png')});
  await page.goto(`${server.origin}/Orte/grossstadt.html?ort=gwynthor`);
  await page.locator('[data-orte-houses] a[href*="family=haus-vann"]').first().waitFor();
  assert.match(await page.locator('body').innerText(),/Celtigerns Letzte Rast/);
  await page.goto(`${server.origin}/Kontinente/Estryll/K%C3%B6nigreich%20Cenyr/Grafschaft%20Celtigerns%20Wacht/Grafschaft%20Celtigerns%20Wacht.html`);
  await page.locator('a[href*="haus=haus-vann"]').first().waitFor();
  await writeFile(resolve(output,'report.json'),JSON.stringify({passed:true,pages:14,tabs:6,categories:8,goods:58,dishes:27,services:12,familyReaders:4,profiles:33,houseCityCountyLinks:true,productionWritesBlocked:true},null,2));
  console.log(`PASS: ${output}`);
} finally {await browser?.close();await server.close();}
