import assert from 'node:assert/strict';
import fs from 'node:fs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DIRECTORY_TEST_ORIGIN || 'http://127.0.0.1:5500';
const browser = await chromium.launch({headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  for(const path of ['Grafschaft Weidebucht.html','Baronie Hochweide/Baronie Hochweide.html','Herrschaft der Dinefwr/Herrschaft der Dinefwr.html']) {
    await page.goto(origin+'/Kontinente/Estryll/Königreich Cenyr/Grafschaft Weidebucht/'+path);
    const card=page.locator('.kingdom-place-card').filter({has:page.locator('h4',{hasText:'Erims Hof'})});
    await card.waitFor();assert.equal(await card.count(),1);
    assert.equal(await card.locator('.directory-co-ruler').count(),2);
    assert.equal(await card.locator('.directory-co-ruler img').count(),4);
    const links=await card.locator('.directory-co-ruler a').evaluateAll(elements=>elements.map(el=>el.getAttribute('href')));
    assert.ok(links.some(href=>href.includes('family=haus-dinefwr')));
    assert.ok(links.some(href=>href.includes('family=haus-tir-addawol')));
    await card.locator('summary').click();assert.match(await card.innerText(),/Verwaltung des Ortes und dessen Erträge teilen/);
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:1000});await card.scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
      assert.equal(await card.evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
      if(process.env.DIRECTORY_SCREENSHOTS && path==='Grafschaft Weidebucht.html') {
        fs.mkdirSync(process.env.DIRECTORY_SCREENSHOTS,{recursive:true});
        await card.screenshot({path:process.env.DIRECTORY_SCREENSHOTS+`/erims-hof-register-${width}.png`});
      }
    }
  }
  await page.goto(origin+'/Karten/karte.html?map=cenyr-weidebucht');
  await page.waitForFunction(()=>window.KartoRuntime?.state().pins.length===81);
  await page.evaluate(()=>window.KartoPinDetailView.open('weidebucht-erims-hof'));
  const dialog=page.locator('#scroll-mo');assert.equal(await dialog.locator('.sv-co-ruler').count(),2);
  assert.equal(await dialog.locator('.sv-co-ruler img').count(),4);
  const failures=await dialog.locator('img').evaluateAll(async images=>(await Promise.all(images.map(i=>i.decode().then(()=>null,()=>i.src)))).filter(Boolean));
  assert.deepEqual(failures,[]);
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:1000});
    assert.equal(await dialog.locator('.pin-card').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
    if(process.env.DIRECTORY_SCREENSHOTS)await page.screenshot({path:process.env.DIRECTORY_SCREENSHOTS+`/erims-hof-map-${width}.png`});
  }
  await page.locator('#scroll-close').click();
  assert.ok(!(await dialog.getAttribute('class')).includes('open'));
  await page.evaluate(()=>window.KartoPinDetailView.open('weidebucht-cerrigarth'));
  assert.equal(await dialog.locator('.sv-co-rulers').count(),0);
  assert.equal(await dialog.locator('.sv-crest img').count(),1);
  assert.equal(await dialog.locator('.sv-banner img').count(),1);
  assert.equal(await dialog.locator('.sv-crest').getAttribute('hidden'),null);
  console.log('OK Erims Hof: both houses, four heraldic images, links, full description and responsive map dialog.');
} finally { await browser.close(); }
