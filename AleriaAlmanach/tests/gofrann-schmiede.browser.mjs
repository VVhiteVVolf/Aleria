import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildGofrannModule } from '../modules/gofrann-schmiede/gofrann-module.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, `.tmp/gofrann-schmiede/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const server = await startChartQualityServer(root);
const entry = buildGofrannModule();
let browser;
try {
  browser = await chromium.launch({ headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport:{width:1848,height:1100},reducedMotion:'reduce' });
  const imageCache = new Map();
  // Existing inventory pictures may be read from their CDN; production APIs stay blocked.
  await context.route('**/*', async route => {
    const request = route.request();
    const origin = new URL(request.url()).origin;
    if (origin === server.origin) return route.continue();
    if (origin === 'https://i.imgur.com' && request.method() === 'GET') {
      if (!imageCache.has(request.url())) imageCache.set(request.url(),fetch(request.url()).then(async response=>({status:response.status,contentType:response.headers.get('content-type'),body:Buffer.from(await response.arrayBuffer())})));
      return route.fulfill(await imageCache.get(request.url()));
    }
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => typeof openModal === 'function');
  await page.waitForFunction(() => ['ready','slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter = page.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  assert.equal(await page.evaluate(() => SECTIONS.filter(s => s.path?.at(-1) === 'Gwynthor').flatMap(s=>s.entries).filter(e=>e.id==='zum-dritten-funken').length),1);
  const show = async index => {
    await page.evaluate(({entry,index})=>{closeModal();openModal(entry,{pageIndex:index});},{entry,index});
    await page.locator('#modal-overlay').waitFor({state:'visible'});
    const broken = await page.locator('#modal-overlay img').evaluateAll(async images => {
      const local = images.filter(img => /\/gofrann-schmiede\/|\/IconOrdner\/|\/Stammb(%C3%A4|ä)ume\//i.test(img.src)
        || /i\.imgur\.com/i.test(img.src) && img.closest('.trade-catalog-item, .guild-service-card'));
      await Promise.all(local.map(img => {img.loading='eager';return img.decode().catch(()=>{});}));
      return local.filter(img=>!img.naturalWidth).map(img=>img.src);
    });
    assert.deepEqual(broken,[],`Bilder auf Seite ${index+1}`);
    await page.screenshot({path:resolve(output,`page-${index+1}.png`)});
  };
  for (let index=0;index<9;index++) {
    await show(index);
    if (index===3) {
      const tabs=page.locator('#modal-overlay [data-hierarchy-tree-tab]');
      assert.equal(await tabs.count(),3);
      for(let i=0;i<3;i++) {
        await tabs.nth(i).click();
        assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active').count(),1);
        await page.screenshot({path:resolve(output,`personal-${i+1}.png`)});
      }
    }
    if (index===4) {
      assert.equal(await page.locator('#modal-overlay .trade-catalog-item').count(),71);
      for(const {id} of entry.pages[4].tradeCatalog.categories) {
        await page.locator(`[data-trade-filter="${id}"]`).click();
        const visible=await page.locator('.trade-catalog-item:visible').count();
        assert.equal(visible,entry.pages[4].tradeCatalog.items.filter(i=>i.category===id).length);
        assert.equal(await page.locator('[data-trade-empty]').isVisible(),false);
        if(id.startsWith('eigene-')||id.startsWith('besondere-')) await page.screenshot({path:resolve(output,`sortiment-${id}.png`)});
      }
      await page.locator('[data-trade-filter="waffen"]').click();
      await page.locator('[data-trade-search-input]').fill('kein-solches-werkstueck');
      assert.equal(await page.locator('.trade-catalog-item:visible').count(),0);
      assert.ok(await page.locator('[data-trade-empty]').isVisible());
      assert.equal(await page.locator('.trade-catalog-header-scene img').count(),1);
    }
    if (index===5) {
      assert.equal(await page.locator('.guild-service-card').count(),9);
      assert.equal(await page.locator('.guild-services-scene').count(),1);
    }
  }
  // Verify the shared normalizer keeps tabs, vacancies, prices and services.
  const roundtrip=await page.evaluate(entry=>entry.pages.map(p=>sanitizeModulePage(JSON.parse(JSON.stringify(sanitizeModulePage(p))))),entry);
  assert.equal(roundtrip[3].hierarchy.trees.length,3);
  assert.equal(roundtrip[4].tradeCatalog.items.length,71);
  assert.equal(roundtrip[5].guildServices.services.length,9);
  assert.equal(roundtrip[4].tradeCatalog.categories.length,7);
  assert.deepEqual(errors,[]);
  await context.close();
  const reader = await browser.newContext({viewport:{width:1848,height:1100},reducedMotion:'reduce'});
  await reader.route('**/*', async route => {
    const request=route.request(),url=new URL(request.url());
    if(url.origin===server.origin) return route.continue();
    if(request.method()==='GET' && url.origin==='https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
      const response=await fetch(request.url());
      return route.fulfill({status:response.status,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body:Buffer.from(await response.arrayBuffer())});
    }
    return route.abort();
  });
  const chart=await reader.newPage();
  for(const id of ['gofrann','tlawd']) {
    await chart.goto(`${server.origin}/Stammb%C3%A4ume/Stammbaum.html?family=haus-${id}&mode=view`);
    await chart.waitForFunction(() => document.querySelectorAll('#family-chart .aleria-person-card').length>10);
    assert.equal(await chart.locator('#family-title').innerText(),id==='gofrann'?'Haus Gofrann':'Haus Tlawd');
    const broken=await chart.locator('#family-chart img').evaluateAll(async images=>{
      await Promise.all(images.map(img=>img.decode().catch(()=>{})));
      return images.filter(img=>!img.naturalWidth).map(img=>img.src);
    });
    assert.deepEqual(broken,[],id);
    await chart.screenshot({path:resolve(output,`stammbaum-${id}.png`)});
  }
  await reader.close();
  await writeFile(resolve(output,'report.json'),JSON.stringify({passed:true,pages:9,tabs:3,categories:7,goods:71,ownGoods:35,services:9,localArtwork:true,productionRequestsBlocked:true},null,2));
  console.log(`PASS: 9 Seiten, 3 Personalreiter, 71 Waren in 7 Rubriken, 9 Dienste. ${output}`);
} finally {await browser?.close();await server.close();}
