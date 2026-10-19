import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DIRECTORY_TEST_ORIGIN || 'http://127.0.0.1:5500';
export async function checkReviewedTerritory({ county, mapId, houseCounts, pinCount }) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(new URL('../../kontinente.registry.js', import.meta.url), 'utf8'), context);
  const entries = context.window.KONTINENTE_REGISTRY.filter(e => e.page.includes('Grafschaft '+county+'/'));
  assert.equal(entries.length, houseCounts.length, 'all regional pages registered');
  const browser = await chromium.launch({headless:true});
  const errors = [];
  try {
    const page = await browser.newPage({ viewport:{width:1440,height:1000} });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    for (const [i, entry] of entries.entries()) {
      await page.goto(origin + '/Kontinente/' + entry.page, {waitUntil:'domcontentloaded'});
      const expected = houseCounts[i];
      await page.waitForFunction(count => document.querySelectorAll('.territory-directory .kingdom-family-card').length === count, expected);
      assert.equal(await page.locator('.kingdom-family-featured .kingdom-family-card').count(),1);
      assert.equal(await page.locator('[data-herrschaft-administration] button').count(),8);
      const sections = await page.evaluate(() => window.KONTINENTE_DATA.view.article.cultureSections || []);
      for (const section of sections) {
        assert.equal(await page.locator('h3').filter({hasText:section.title}).count(),1);
        for (const paragraph of section.paragraphs) assert.ok((await page.locator('main').innerText()).includes(paragraph));
      }
      const failed = await page.locator('.territory-directory img,.territory-council img,.kingdom-infobox img').evaluateAll(async images => {
        for (const image of images) image.loading='eager';
        return (await Promise.all(images.map(image=>image.decode().then(()=>null,()=>image.src)))).filter(Boolean);
      });
      assert.deepEqual(failed,[],entry.id+' images');
      for (const width of [1440,1024,768,390]) {
        await page.setViewportSize({width,height:1000});
        const result = await page.evaluate(() => ({
          pageOverflow:document.documentElement.scrollWidth>innerWidth+1,
          cards:[...document.querySelectorAll('.territory-directory [data-directory-entry]')].filter(card=>{
            const r=card.getBoundingClientRect();return r.left<0||r.right>innerWidth+1||card.scrollWidth>card.clientWidth+1;
          }).map(card=>card.innerText),
          heights:[...document.querySelectorAll('.kingdom-family-grid')].map(grid=>[...grid.children].map(card=>Math.round(card.getBoundingClientRect().height))),
        }));
        assert.equal(result.pageOverflow,false,`${entry.id} page at ${width}`);
        assert.deepEqual(result.cards,[],`${entry.id} cards at ${width}`);
        for(const heights of result.heights) assert.ok(new Set(heights).size<=1,entry.id+' equal house heights');
      }
      const details = page.locator('.directory-place-description').first();
      if(await details.count()) {
        await details.locator('summary').click();
        assert.equal(await details.getAttribute('open'),'');
        assert.ok((await details.locator('p').innerText()).length>50);
      }
      await page.locator('[data-herrschaft-administration] button').first().click();
      await page.waitForFunction(()=>document.querySelector('.administration-dialog-body')?.getAttribute('aria-busy')!=='true');
      const dialog=page.locator('dialog.administration-dialog');
      assert.ok(!/Galahad|Celtigern|Steffan/.test(await dialog.innerText()),entry.id+' administration scope');
      await page.keyboard.press('Escape');
      if(process.env.DIRECTORY_SCREENSHOTS) {
        fs.mkdirSync(process.env.DIRECTORY_SCREENSHOTS,{recursive:true});
        await page.setViewportSize({width:1440,height:1000});
        await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
        await page.waitForFunction(()=>scrollY===0);
        await page.screenshot({path:process.env.DIRECTORY_SCREENSHOTS+'/'+entry.id+'.png'});
        if(i===0) {
          await page.locator('[data-herrschaft-geography]').scrollIntoViewIfNeeded();
          await page.screenshot({path:process.env.DIRECTORY_SCREENSHOTS+'/geography.png'});
        }
      }
      console.log(`OK ${entry.id}: ${expected} houses, local images, four widths, expandable descriptions`);
    }
    await page.goto(origin+'/Karten/karte.html?map='+mapId,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(count=>window.KartoRuntime?.state().pins.length===count,pinCount);
    assert.deepEqual(await page.evaluate(()=>[window.KartoRuntime.state().dotSize,window.KartoRuntime.state().lblSize]),[80,50]);
    for(const layer of ['normal','regions','pins']) {
      await page.locator(`[data-action="set-layer"][data-layer="${layer}"]`).click();
      await page.waitForFunction(name => [...document.images].some(image => image.src.includes('/Kartenbilder/'+name+'.webp')&&image.complete&&image.naturalWidth===4096),layer);
    }
    console.log(`OK ${county} map: ${pinCount} pins, three full-sized layers, 80/50 defaults`);
    assert.deepEqual(errors,[],'browser exceptions');
  } finally { await browser.close(); }

}
