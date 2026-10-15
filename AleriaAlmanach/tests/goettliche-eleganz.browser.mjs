import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildGoettlicheEleganz } from '../modules/goettliche-eleganz/eleganz-module.mjs';
import { planEleganzCharacters } from '../modules/goettliche-eleganz/eleganz-characters.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const output=resolve(root,`.tmp/goettliche-eleganz/browser-${Date.now()}`);
await mkdir(output,{recursive:true});
const server=await startChartQualityServer(root);
const entry=buildGoettlicheEleganz();
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context=await browser.newContext({viewport:{width:1848,height:1100},reducedMotion:'reduce'});
  await context.route('**/*',route=>new URL(route.request().url()).origin===server.origin?route.continue():route.abort());
  const page=await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(()=>typeof openModal==='function');
  await page.waitForFunction(()=>['ready','slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state),{timeout:25000});
  if(await page.locator('[data-loading-action="enter"]').isEnabled()) await page.locator('[data-loading-action="enter"]').click();
  else await page.locator('[data-loading-action="continue"]').click();
  await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-almanach-loading'));
  const inserted=await page.evaluate(id=>SECTIONS.filter(section=>section.entries?.some(entry=>entry.id===id)).map(section=>section.path),entry.id);
  assert.deepEqual(inserted,[['Cenyr','Celtigerns Wacht','Llamreis Ankunft','Gwynthor']]);
  const show=async index=>{
    await page.evaluate(({entry,index})=>{closeModal();openModal(entry,{pageIndex:index});},{entry,index});
    await page.locator('#modal-overlay').waitFor({state:'visible'});
    const broken=await page.locator('#modal-overlay img').evaluateAll(async images=>{
      const own=images.filter(image=>/goettliche-eleganz|\/houses\/|\/IconOrdner\//.test(image.src));
      await Promise.all(own.map(image=>{image.loading='eager';return image.decode().catch(()=>{});}));
      return own.filter(image=>!image.naturalWidth).map(image=>image.src);
    });
    assert.deepEqual(broken,[],`page ${index+1} artwork`);
  };
  for(let i=0;i<3;i++) {await show(i);await page.screenshot({path:resolve(output,`0${i+1}-seite.png`)});}
  await show(3);
  assert.doesNotMatch(await page.locator('#modal-overlay').innerText(),/Wahrheitswaage|Wissen\. Gerechtigkeit/);
  const tabs=page.locator('#modal-overlay [data-hierarchy-tree-tab]');
  assert.equal(await tabs.count(),3);
  for(let i=0;i<3;i++) {
    await tabs.nth(i).click();
    assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active').count(),1);
    assert.equal(await tabs.nth(i).getAttribute('aria-selected'),'true');
    await page.screenshot({path:resolve(output,`04-hierarchie-${i}.png`)});
  }
  await show(4);
  assert.equal(await page.locator('#modal-overlay .trade-catalog-item').count(),20);
  for(const category of ['damen','herren']) {
    await page.locator(`#modal-overlay [data-trade-filter="${category}"]`).click();
    assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(),10);
    assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').first().locator('.trade-catalog-description p').count(),2);
    await page.screenshot({path:resolve(output,`05-kollektion-${category}.png`)});
  }
  await show(5);
  await page.screenshot({path:resolve(output,'06-verkaufsraum.png')});
  const plan=planEleganzCharacters([],{});
  const count=await page.evaluate(plan=>{
    closeModal();_characters=plan.entries.map(item=>({id:item.id,...item.data}));
    _charTabs=['Alle',...plan.config.tabs];_charTabMap=plan.config.map;_charSubtabs=plan.config.subtabs;_charSubtabMap=plan.config.subtabMap;
    _activeCharTab='Göttliche Eleganz';_activeCharSubtab='Alle';setCharacterRegisterViewMode('collections');return getCharsForActiveTab().length;
  },plan);
  assert.equal(count,14);
  assert.equal(await page.locator('#char-grid .char-card').count(),14);
  await page.goto(`${server.origin}/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=haus-raves`);
  await page.waitForFunction(()=>window.HAEUSER_DATA?.meta?.id==='haus-raves');
  assert.match(await page.locator('body').innerText(),/Eleonora Cassia Raves/);
  await page.screenshot({path:resolve(output,'07-haus-raves.png')});
  await page.goto(`${server.origin}/Orte/grossstadt.html?ort=gwynthor`);
  await page.locator('[data-orte-houses] a[href*="family=haus-raves"]').first().waitFor();
  assert.match(await page.locator('body').innerText(),/Göttliche Eleganz/);
  await page.goto(`${server.origin}/Kontinente/Estryll/K%C3%B6nigreich%20Cenyr/Grafschaft%20Celtigerns%20Wacht/Grafschaft%20Celtigerns%20Wacht.html`);
  await page.locator('a[href*="haus=haus-raves"]').first().waitFor();
  await context.close();
  await writeFile(resolve(output,'report.json'),JSON.stringify({passed:true,pages:6,hierarchyTabs:3,garments:20,profiles:14,localArtworkLoaded:true,productionRequestsBlocked:true},null,2));
  console.log(`PASS: sechs Seiten, drei Reiter, zwanzig Garnituren, vierzehn Profile, Haus- und Stadtverknüpfungen. ${output}`);
} finally {await browser?.close();await server.close();}
