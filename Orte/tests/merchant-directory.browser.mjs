import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin=process.env.ORTE_TEST_ORIGIN || 'http://127.0.0.1:5500';
const output=process.env.PREVIEW_OUTPUT;
if(output)fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  for(const [id,count,groups] of [
    ['gwynthor',14,['handel','handwerk','gastwirtschaft','freudenhaus','badehaus','kultur']],
    ['lysfaen',6,['gastwirtschaft','landwirtschaft','tierzucht']],
    ['craithglyn',1,['handel']],['abergwint',0,[]],
  ]) {
    await page.goto(origin+'/Orte/grossstadt.html?ort='+id,{waitUntil:'networkidle'});
    const root=page.locator('[data-orte-merchants]');
    assert.equal(await root.locator('.merchant-entry').count(),count,id);
    assert.deepEqual(await root.locator('[data-merchant-category]').evaluateAll(nodes=>nodes.map(n=>n.dataset.merchantCategory)),groups,id+' categories');
    assert.equal(await root.locator('table,.orte-merchants-scroll').count(),0);
    assert.equal(await root.locator('.merchant-entry[open]').count(),0);
    assert.deepEqual(await root.locator('img').evaluateAll(async images=>{
      for(const image of images) image.loading='eager';
      return (await Promise.all(images.map(image=>image.decode().then(()=>null,()=>image.src)))).filter(Boolean);
    }),[],id+' symbols load');
    const actual=await root.locator('.merchant-entry').evaluateAll(entries=>entries.map(entry=>({
      name:entry.querySelector('.merchant-entry__name').textContent,
      description:entry.querySelector('.merchant-entry__description')?.textContent || '',
      values:[...entry.querySelectorAll('dd')].map(dd=>dd.querySelector('[data-rating-source]')?.dataset.ratingSource ?? dd.textContent),
    })));
    const expected=await page.evaluate(()=>window.ORT_DATA.merchants?.map(m=>({name:m.name,description:m.description||m.beschreibung||'',values:[m.owner||m.besitzer||'—',m.trade||m.gewerbe||m.type||'—',m.wealth??m.wohlstand??'—',m.reputation??m.ruf??'—',m.influence??m.einfluss??'—']})) || []);
    for(const merchant of expected)assert.deepEqual(actual.find(m=>m.name===merchant.name),merchant,id+' complete content');
    for(const width of [1440,1024,768,390]) {
      await page.setViewportSize({width,height:1000});
      const collapsed=await root.evaluate(root=>({
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        heights:[...root.querySelectorAll('.merchant-entry')].map(el=>el.getBoundingClientRect().height),
        wrapping:[...root.querySelectorAll('.merchant-entry__name,.merchant-entry__trade')].filter(el=>el.clientHeight>parseFloat(getComputedStyle(el).lineHeight)+1).map(el=>el.textContent),
      }));
      assert.equal(collapsed.overflow,false,`${id} ${width} page overflow`);
      assert.deepEqual(collapsed.wrapping,[],`${id} ${width} one-line previews`);
      assert.ok(collapsed.heights.every(h=>h<95),`${id} ${width} compact collapsed entries`);
      assert.ok(new Set(collapsed.heights.map(Math.round)).size<=1,`${id} ${width} uniform entries`);
      if(count) {
        const first=root.locator('.merchant-entry').first();
        const summary=first.locator('summary');
        await summary.focus();
        await page.keyboard.press('Enter');
        assert.equal(await first.getAttribute('open'),'');
        assert.ok(await first.locator('.merchant-entry__body').isVisible());
        assert.equal(await first.locator('dd').count(),5);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${id} ${width} open detail fits`);
        if(output&&id==='gwynthor'&&[1440,390].includes(width)) {
          await first.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
          await page.evaluate(()=>scrollBy({top:-90,behavior:'instant'}));
          await page.screenshot({path:`${output}/${id}-${width}-open.png`});
        }
        await page.keyboard.press('Space');
        assert.equal(await first.getAttribute('open'),null);
      }
    }
    if(count) {
      const summary=root.locator('.merchant-entry').first().locator('summary');
      await summary.focus();await page.keyboard.press('Enter');
      await page.evaluate(()=>document.dispatchEvent(new CustomEvent('aleria:orte:data-ready',{detail:{data:window.ORT_DATA}})));
      assert.equal(await root.locator('.merchant-entry[open]').count(),1,id+' open state survives data refresh');
      assert.equal(await page.evaluate(()=>document.activeElement?.tagName),'SUMMARY');
      await page.evaluate(()=>document.dispatchEvent(new CustomEvent('aleria:orte:data-ready',{detail:{data:{merchants:[]}}})));
      assert.equal(await root.locator('.merchant-entry').count(),0,id+' stale entries removed');
      await page.evaluate(()=>document.dispatchEvent(new CustomEvent('aleria:orte:data-ready',{detail:{data:window.ORT_DATA}})));
      assert.equal(await root.locator('.merchant-entry').count(),count,id+' restored once');
    } else assert.match(await root.innerText(),/noch keine Händler/);
    if(output&&id==='gwynthor') {
      await root.locator('.merchant-entry').evaluateAll(nodes=>nodes.forEach(n=>n.open=false));
      await page.setViewportSize({width:1440,height:1000});
      await root.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
      await page.evaluate(()=>scrollBy({top:-150,behavior:'instant'}));
      await page.screenshot({path:`${output}/gwynthor-closed.png`});
    }
    console.log(`OK ${id}: ${count} entries, grouped, complete data, keyboard, compact rows and 1440/1024/768/390px`);
  }
  assert.deepEqual(errors,[]);
} finally {await browser.close();}
