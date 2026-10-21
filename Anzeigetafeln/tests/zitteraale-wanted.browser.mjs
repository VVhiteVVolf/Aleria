import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { buildZitteraaleWantedNotices,ZITTERAALE_NOTICE_ID } from '../tools/quests/zitteraale-wanted.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.NOTICE_TEST_ORIGIN||'http://127.0.0.1:4197';
const shots=process.env.NOTICE_SCREENSHOTS;
if(shots)await mkdir(shots,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE});
const context=await browser.newContext();
await context.route('**/*',route=>route.request().url().startsWith(origin+'/')&&route.request().method()==='GET'?route.continue():route.abort());
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto(`${origin}/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel`,{waitUntil:'networkidle'});
  const nail=page.locator(`.tafel-notice-marker[data-notice-id="${ZITTERAALE_NOTICE_ID}"]`);await nail.waitFor();
  assert.equal(await page.locator('.notice-register-entry').count(),4);
  const notices=buildZitteraaleWantedNotices();
  for(const width of [1600,390]) {
    await page.setViewportSize({width,height:width===390?844:1050});
    await page.evaluate(id=>window.openZettelScroll(id),ZITTERAALE_NOTICE_ID);
    assert.equal(await page.locator('#notice-stack-nav option').count(),7);
    assert.equal(await page.locator('#notice-publications button').count(),0);
    for(const notice of notices) {
      await page.locator('#notice-stack-nav select').selectOption(notice.id);
      const images=page.locator('#scroll-content img');
      await images.evaluateAll(async images=>{await Promise.all(images.filter(i=>new URL(i.src).origin===location.origin).map(i=>i.decode()));});
      if(notice.typ==='quest') {
        assert.match(await page.locator('.quest-patron img').getAttribute('src'),/haus-gafyr\/egon-gafyr\.jpg$/);
        assert.match(await page.locator('.quest-seal img').getAttribute('src'),/egon-gafyr\/wachssiegel-v1\.png$/);
        assert.match(await page.locator('.quest-copy > .notice-signature img').getAttribute('src'),/egon-gafyr\/unterschrift-v1\.png$/);
        assert.equal(await page.locator('.quest-subject').count(),0);
        for(const selector of ['.quest-patron img','.quest-seal img','.quest-copy > .notice-signature img']) {
          assert.ok(await page.locator(selector).evaluate(img=>img.complete&&img.naturalWidth>0),selector);
          await page.locator(selector).scrollIntoViewIfNeeded();
          assert.ok(await page.locator(selector).isVisible(),selector);
        }
        if(shots) {
          await page.screenshot({path:`${shots}/issuer-${width}.png`});
          await page.locator('.quest-patron img').scrollIntoViewIfNeeded();
          await page.screenshot({path:`${shots}/patron-${width}.png`});
        }
      }
      if(notice.typ==='steckbrief') assert.match(await page.locator('.notice-subject-portrait img').getAttribute('src'),/\/sketches\//);
      if(notice.rewards.length>1) {
        await page.locator('#scroll-content .notice-reward-button').first().click();
        assert.match(await page.locator('.notice-reward-loot').innerText(),/35[\s\S]*Ritterschlag/);
        assert.equal(await page.locator('.notice-reward-loot .notice-money img').getAttribute('alt'),'Goldtaler');
        await page.locator('.notice-reward-item-image img').evaluate(i=>i.decode());
        assert.ok(await page.locator('.notice-reward-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
        if(shots)await page.screenshot({path:`${shots}/reward-${width}.png`});
        await page.keyboard.press('Escape');
      }
      assert.ok(await page.locator('#scroll-content').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
      if(shots&&[notices[1].id,notices[6].id].includes(notice.id))await page.screenshot({path:`${shots}/${notice.stackOrder}-${width}.png`});
    }
    assert.equal(await page.locator('#scroll-content .notice-money').first().innerText(),'1');
    await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[]);
  if(shots)await writeFile(`${shots}/report.json`,JSON.stringify({passed:true,sheets:7,layouts:2,errors,externalWrites:false},null,2));
  console.log('PASS: Egon portrait, signature and marshal seal; seven grouped wanted sheets and rewards on desktop/mobile.');
} finally{await browser.close();}
