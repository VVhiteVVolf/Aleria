import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin=process.env.DIRECTORY_TEST_ORIGIN || 'http://127.0.0.1:5500';
const browser=await chromium.launch({headless:true});
try {
  const context=await browser.newContext();
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  for(const mapId of ['cenyr-vortigerns-ruh','cenyr-celtigerns-wacht','cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis']) {
    const page=await context.newPage();
    await page.goto(`${origin}/Karten/karte.html?map=${mapId}`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.KartoPublish?.isReady());
    assert.deepEqual(await page.evaluate(()=>[window.KartoRuntime.state().dotSize,window.KartoRuntime.state().lblSize]),[80,50],mapId);
    assert.equal(await page.locator('#dot-sl').inputValue(),'80');
    assert.equal(await page.locator('#lbl-sl').inputValue(),'50');
    await page.close();
  }
  await context.close();
  const legacy=JSON.parse(await fs.readFile(new URL('../Cenyr/vortigerns-ruh/data.json',import.meta.url),'utf8')).state;
  legacy.dotSize=23;legacy.lblSize=19;
  legacy.pins[0].text='Erhaltener lokaler Inhalt';
  delete legacy.displaySettingsVersion;
  const draftContext=await browser.newContext();
  await draftContext.addInitScript(state=>{
    if(!localStorage.getItem('karto.draft.cenyr-vortigerns-ruh')) localStorage.setItem('karto.draft.cenyr-vortigerns-ruh',JSON.stringify({state,basedOnRevision:1,savedAt:'2026-10-18T20:00:00Z'}));
  },legacy);
  const page=await draftContext.newPage();
  const url=`${origin}/Karten/karte.html?map=cenyr-vortigerns-ruh`;
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.KartoPublish?.isReady()&&window.KartoRuntime.state().pins.length===47);
  assert.deepEqual(await page.evaluate(()=>[window.KartoRuntime.state().dotSize,window.KartoRuntime.state().lblSize]),[80,50]);
  for(const [id,value] of [['dot-sl','100'],['lbl-sl','70']]) await page.locator('#'+id).evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));},value);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('karto.draft.cenyr-vortigerns-ruh')).state.displaySettingsVersion===1);
  await page.reload({waitUntil:'networkidle'});
  assert.deepEqual(await page.evaluate(()=>[window.KartoRuntime.state().dotSize,window.KartoRuntime.state().lblSize]),[100,70]);
  assert.equal(await page.evaluate(()=>window.KartoRuntime.state().pins[0].text),'Erhaltener lokaler Inhalt');
  await draftContext.close();
  console.log('OK: three published maps use 80/50; old drafts migrate without content loss; later slider choices persist.');
} finally { await browser.close(); }
