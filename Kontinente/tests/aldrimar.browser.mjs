import assert from 'node:assert/strict';
import fs from 'node:fs';
import { succession } from '../modules/aldrimar/succession-data.mjs';

const { chromium }=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.DIRECTORY_TEST_ORIGIN||'http://127.0.0.1:5500';
const base='/Kontinente/Estryll/Königreich Aldrimar/';
const names=['Königreich von Aldrimar.html','aemter.html','kronfolge.html',...succession.monarchs.map(m=>m.page)];
const browser=await chromium.launch({headless:true});
const errors=[];const results=[];
try {
  const page=await browser.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  for(const name of names){
    await page.goto(origin+base+name,{waitUntil:'networkidle'});
    const record={name,layouts:[]};
    if(name===names[0]){
      assert.equal(await page.locator('.kingdom-family-card').count(),5);
      assert.equal(await page.locator('.kingdom-family-featured .kingdom-family-card').count(),1);
      assert.equal(await page.locator('.herrschaft-person-card').count(),15);
      assert.equal(await page.locator('.administration-card').count(),8);
    }
    for(const width of [1440,1024,768,390]){
      await page.setViewportSize({width,height:1000});
      const layout=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,
        overfull:[...document.querySelectorAll('.court-office,.court-monarch-link,.kingdom-family-card,.herrschaft-person-card')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent),
      }));
      assert.equal(layout.overflow,false,`${name} at ${width}`);assert.deepEqual(layout.overfull,[],name);
      record.layouts.push(layout);
    }
    const failed=await page.locator('img').evaluateAll(async images=>{
      for(const img of images)img.loading='eager';
      return (await Promise.all(images.map(img=>img.decode().then(()=>null,()=>img.src)))).filter(Boolean);
    });
    assert.deepEqual(failed,[],name+' image loading');
    if(name==='aemter.html'){
      const input=page.locator('#aemter-suche');await input.fill('Ratsskalde');
      assert.equal(await page.locator('[data-court-office]:visible').count(),1);
      await input.fill('KeinPassendesAmt');assert.equal(await page.locator('[data-role="search-empty"]').isVisible(),true);
      await page.locator('[data-action="clear-search"]').click();
      assert.equal(await page.locator('[data-court-office]:visible').count(),45);
    }
    if(name.startsWith('koenige/')){
      await page.locator('details summary').click();assert.equal(await page.locator('details').getAttribute('open'),'');
    }
    if(process.env.DIRECTORY_SCREENSHOTS){
      fs.mkdirSync(process.env.DIRECTORY_SCREENSHOTS,{recursive:true});
      await page.setViewportSize({width:1440,height:1000});await page.goto(origin+base+name,{waitUntil:'networkidle'});
      await page.screenshot({path:process.env.DIRECTORY_SCREENSHOTS+'/'+name.replaceAll('/','-')+'.png'});
    }
    results.push(record);console.log('OK '+name);
  }
  assert.deepEqual(errors,[]);
  if(process.env.DIRECTORY_SCREENSHOTS)fs.writeFileSync(process.env.DIRECTORY_SCREENSHOTS+'/checks.json',JSON.stringify(results,null,2));
} finally {await browser.close();}
