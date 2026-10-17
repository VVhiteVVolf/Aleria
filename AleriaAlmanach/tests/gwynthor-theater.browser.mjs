import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { planTheaterCharacters } from '../modules/gwynthor-theater/theater-characters.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const output=resolve(root,`.tmp/gwynthor-theater/browser-${Date.now()}`);
await mkdir(output,{recursive:true});
const payload=JSON.parse(await readFile(new URL('../../Charakter Archiv Exporte/Module/Gwynthorer Theater/gwynthorer-theater-2026-10-17.json',import.meta.url),'utf8')).module;
const entry=payload.entry;
const server=await startChartQualityServer(root);
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context=await browser.newContext({viewport:{width:1848,height:1100},reducedMotion:'reduce'});
  const cache=new Map();
  await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===server.origin)return route.continue();
    const image=url.origin==='https://i.imgur.com';
    const sdk=url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/');
    if(request.method()==='GET'&&(image||sdk)){
      if(!cache.has(request.url()))cache.set(request.url(),fetch(request.url()).then(async r=>({status:r.status,contentType:r.headers.get('content-type'),headers:{'access-control-allow-origin':'*'},body:Buffer.from(await r.arrayBuffer())})));
      return route.fulfill(await cache.get(request.url()));
    }
    return route.abort();
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('dialog',dialog=>dialog.accept());
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(()=>typeof openModal==='function');
  await page.waitForFunction(()=>['ready','slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter=page.locator('[data-loading-action="enter"]');
  await(await enter.isEnabled()?enter:page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-almanach-loading'));
  assert.equal(await page.evaluate(id=>getValidSections().flatMap(s=>s.entries).filter(e=>e.id===id).length,entry.id),1);
  assert.equal(await page.evaluate(entry=>getPages(entry).length,entry),12);

  for(let index=0;index<entry.pages.length;index++){
    await page.evaluate(({entry,index})=>{closeModal();openModal(entry,{pageIndex:index});},{entry,index});
    await page.locator('#modal-overlay').waitFor({state:'visible'});
    const broken=await page.locator('#modal-overlay img').evaluateAll(async images=>{
      const local=images.filter(img=>img.getAttribute('src')&&/gwynthor-theater|Stammb|Fraktionen/.test(img.src));
      await Promise.all(local.map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));
      return local.filter(img=>!img.naturalWidth).map(img=>img.src);
    });
    assert.deepEqual(broken,[],`Bilder auf Seite ${index+1}`);
    if(index===3){
      const tabs=page.locator('#modal-overlay [data-hierarchy-tree-tab]');assert.equal(await tabs.count(),4);
      for(let n=0;n<4;n++){
        await tabs.nth(n).click();
        const broken=await page.locator('[data-hierarchy-tree-panel].active img').evaluateAll(async images=>{await Promise.all(images.map(img=>img.decode().catch(()=>{})));return images.filter(img=>!img.naturalWidth).map(img=>img.src);});
        assert.deepEqual(broken,[]);
        await page.screenshot({path:resolve(output,`personal-${n+1}.png`)});
      }
    }
    if(index===4){
      assert.equal(await page.locator('[data-theatre-slot="production"]').count(),4);
      assert.equal(await page.locator('[data-theatre-slot="vacant"]').count(),4);
      const metrics=await page.locator('#modal-overlay .theatre-program-scroll').evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight,columns:getComputedStyle(el.querySelector('.theatre-program-grid')).gridTemplateColumns.split(' ').length}));
      assert.ok(metrics.height>200&&metrics.scroll>metrics.height);assert.equal(metrics.columns,2);
      await page.screenshot({path:resolve(output,'repertoire-desktop-top.png')});
      await page.locator('#modal-overlay .theatre-program-scroll').focus();await page.keyboard.press('End');
      await page.waitForFunction(()=>{const el=document.querySelector('#modal-overlay .theatre-program-scroll');return el.scrollTop+el.clientHeight>=el.scrollHeight-3;});
      assert.ok(await page.locator('#modal-overlay [data-theatre-slot="vacant"]').last().evaluate(el=>{const a=el.getBoundingClientRect(),b=el.closest('.theatre-program-scroll').getBoundingClientRect();return a.bottom<=b.bottom+3&&a.bottom>b.top&&a.top<b.bottom;}));
      await page.screenshot({path:resolve(output,'repertoire-desktop-bottom.png')});
    }
    await page.screenshot({path:resolve(output,`seite-${index+1}.png`)});
  }
  const cleaned=await page.evaluate(entry=>entry.pages.map(p=>sanitizeModulePage(JSON.parse(JSON.stringify(sanitizeModulePage(p))))),entry);
  assert.equal(cleaned[4].theatreProgram.items.length,8);

  // Actual modal editor round trip, including a ninth row and removal.
  await page.evaluate(payload=>{closeModal();_moduleEditorAuthorized=true;openModuleEditor(payload,{sourceKind:'local-quality-check'});},payload);
  const programCard=page.locator('#me-pages .module-page-card').nth(4);
  assert.equal(await programCard.locator('.me-page-type').inputValue(),'theatre-program');
  assert.equal(await programCard.locator('.module-theatre-production').count(),8);
  await programCard.locator('[data-module-editor-action="schema-add-row"][data-schema-key="theatreProgram.items"]').click();
  await programCard.locator('.module-theatre-production').last().locator('.me-theatre-title').fill('Gastspiel zur Probe');
  let collected=await page.evaluate(()=>collectModuleEditorPayload().entry.pages[4]);
  assert.equal(collected.theatreProgram.items.length,9);assert.equal(collected.theatreProgram.items[8].title,'Gastspiel zur Probe');
  assert.equal(collected.theatreProgram.items.filter(p=>!p.title).length,4);
  await programCard.locator('.module-theatre-production').last().locator('[data-module-editor-action="schema-remove-row"]').click();
  assert.equal(await programCard.locator('.module-theatre-production').count(),8);
  await page.evaluate(()=>closeModuleEditor());

  // Actual inline state and delegated add, edit, remove; cancel without saving.
  await page.evaluate(entry=>{openModal(entry,{pageIndex:4});openModuleEditorForCurrent();},entry);
  const pane=page.locator('.inline-module-edit-pane');
  assert.equal(await pane.locator('.theatre-program-editor-row').count(),8);
  await pane.locator('[data-theatre-program-field="title"]').fill('Ein anderer Programmabend');
  await page.waitForFunction(()=>document.querySelector('.inline-module-preview-frame .theatre-program-header h2')?.textContent==='Ein anderer Programmabend');
  await pane.locator('[data-inline-action="schema-add-row"][data-schema-key="theatreProgram.items"]').click();
  assert.equal(await pane.locator('.theatre-program-editor-row').count(),9);
  await pane.locator('.theatre-program-editor-row').last().locator('[data-schema-field="title"]').fill('Neues Gastspiel');
  assert.equal(await page.evaluate(()=>getInlineDraftPage().theatreProgram.items[8].title),'Neues Gastspiel');
  await pane.locator('.theatre-program-editor-row').last().locator('[data-inline-action="schema-remove-row"]').click();
  assert.equal(await pane.locator('.theatre-program-editor-row').count(),8);
  await page.screenshot({path:resolve(output,'repertoire-inline-editor.png')});
  await page.evaluate(()=>cancelInlineModuleEdit());

  // Mobile scroll area must remain reachable by keyboard.
  await page.setViewportSize({width:430,height:900});
  await page.evaluate(entry=>{closeModal();openModal(entry,{pageIndex:4});},entry);
  const mobile=await page.locator('#modal-overlay .theatre-program-scroll').evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight,columns:getComputedStyle(el.querySelector('.theatre-program-grid')).gridTemplateColumns.split(' ').length}));
  assert.equal(mobile.columns,1);assert.ok(mobile.height>150&&mobile.scroll>mobile.height);
  await page.screenshot({path:resolve(output,'repertoire-mobile-top.png')});
  await page.locator('#modal-overlay .theatre-program-scroll').focus();await page.keyboard.press('End');
  await page.waitForFunction(()=>{const el=document.querySelector('#modal-overlay .theatre-program-scroll');return el.scrollTop+el.clientHeight>=el.scrollHeight-3;});
  await page.screenshot({path:resolve(output,'repertoire-mobile-bottom.png')});
  const lastSlot=page.locator('#modal-overlay [data-theatre-slot="vacant"]').last();
  await lastSlot.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const el=document.querySelector('#modal-overlay [data-theatre-slot="vacant"]:last-child'),a=el.getBoundingClientRect(),b=el.closest('.theatre-program-scroll').getBoundingClientRect();return a.top>=b.top&&a.bottom<=b.bottom+3;});
  await page.screenshot({path:resolve(output,'repertoire-mobile-vacancies.png')});
  await page.setViewportSize({width:1848,height:1100});

  const plan=planTheaterCharacters([],{});
  const profiles=await page.evaluate(plan=>{
    closeModal();_characters=plan.entries.map(p=>({id:p.id,...p.data}));
    _charTabs=['Alle',...plan.config.tabs];_charTabMap=plan.config.map;_charSubtabs=plan.config.subtabs;_charSubtabMap=plan.config.subtabMap;
    _activeCharTab='Gwynthorer Theater';_activeCharSubtab='Alle';setCharacterRegisterViewMode('collections');return getCharsForActiveTab().length;
  },plan);
  assert.equal(profiles,15);assert.equal(await page.locator('#char-grid .char-card').count(),15);
  await page.evaluate(()=>switchTab('Charaktere'));
  await page.locator('#char-grid').waitFor({state:'visible'});
  const missingProfiles=await page.locator('#char-grid img').evaluateAll(async images=>{await Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));return images.filter(img=>img.getAttribute('src')&&!img.naturalWidth).map(img=>img.src);});
  assert.deepEqual(missingProfiles,[]);
  await page.screenshot({path:resolve(output,'charakterverzeichnis.png')});
  await page.goto(`${server.origin}/Orte/grossstadt.html?ort=gwynthor`);
  await page.waitForFunction(()=>document.body.textContent.includes('Gwynthorer Theater'));
  await page.goto(`${server.origin}/Fraktionen/index.html#fraktion-bewahrer-von-avallorn`);
  await page.locator('[data-faction-id="bewahrer-von-avallorn"]').waitFor({state:'visible'});
  assert.deepEqual(errors,[]);
  await writeFile(resolve(output,'report.json'),JSON.stringify({passed:true,pages:11,commentPage:true,departments:4,productions:4,vacancies:4,extendedRows:9,modalEditor:true,inlineEditor:true,desktopAndMobileScroll:true,profiles:15,cityAndInstituteLinks:true,externalWritesBlocked:true},null,2));
  console.log(`PASS: ${output}`);
} finally {await browser?.close();await server.close();}
