import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless:true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath:process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const screenshotDir = process.env.ADMINISTRATION_SCREENSHOTS;
if (screenshotDir) await mkdir(screenshotDir, {recursive:true});
const origin = process.env.ADMINISTRATION_TEST_ORIGIN || 'http://127.0.0.1:5500';
const base = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/';
const areas = ['unterhaltung','militaer','klerus','gerichtsbarkeit','finanzen','spionage','diplomatie','magie'];
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  for (const [scope,path] of [['county','Grafschaft Celtigerns Wacht.html'],['gwendolyn','Baronie Gwendolyns Ufer/Baronie Gwendolyns Ufer.html']]) {
    await page.goto(origin + base + path,{waitUntil:'domcontentloaded'});
    const row = page.locator('.administration-grid, .herrschaft-administration-grid');
    await row.locator('button').last().waitFor();
    if(scope==='county') {
      await page.locator('[data-repository-content="ready"]').waitFor();
      const princes=page.locator('.herrschaft-person-group').filter({has:page.getByRole('heading',{name:'Ritterfürsten',exact:true})});
      await princes.waitFor();
      const cards=await princes.locator('.herrschaft-person-card').evaluateAll(cards=>cards.map(card=>({name:card.querySelector('h4').textContent,seat:card.querySelector('.herrschaft-person-seat')?.textContent})));
      assert.equal(cards[0].name,'Vakant');
      assert.equal(cards.find(card=>card.name==='Maelgwin Wyrm').seat,'Sitz: Gwynthor');
      assert.equal(cards.find(card=>card.name==='Idris Arwydd').seat,'Sitz: Castellbryn');
      if(screenshotDir) await princes.screenshot({path:resolve(screenshotDir,'celtigerns-wacht-ritterfuersten.png')});
    }
    for (const area of areas) {
      await page.setViewportSize({width:1440,height:1000});
      const trigger = row.locator(`[data-administration-key="${area}"]`);
      await trigger.click();
      const dialog = page.locator('.administration-dialog[open]');
      await dialog.waitFor();
      await page.waitForFunction(()=>!document.querySelector('.administration-dialog-body').hasAttribute('aria-busy'));
      assert.equal(await dialog.locator('.is-error').count(),0);
      const retained = await page.evaluate(async ({area,scope})=>{
        const source=await (await fetch('/Kontinente/modules/administration/content/'+(scope==='county'?'':'gwendolyns-ufer/')+area+'.html')).text();
        const parsed=new DOMParser().parseFromString(source,'text/html');
        const textFor=node=>{const copy=node.cloneNode(true);copy.querySelectorAll('br').forEach(n=>n.replaceWith(' '));copy.querySelectorAll('p, div').forEach(n=>n.append(' '));return copy.textContent.replace(/\s+/g,' ').trim();};
        const rows=[...parsed.querySelectorAll('tr')].filter(row=>[...row.cells].some(cell=>[...cell.querySelectorAll('img')].some(image=>image.closest('tr')===row)));
        const names=rows.flatMap(row=>[...row.nextElementSibling?.cells||[]].map(textFor)).filter(name=>name&&!/^[.?!…–—\s-]+$/.test(name));
        const cards=[...document.querySelectorAll('.administration-dialog .herrschaft-person-card')];
        const displayed=cards.map(card=>card.querySelector('h4').textContent);
        return {expected: rows.reduce((sum,row)=>sum+[...row.cells].filter(cell=>cell.querySelector('img')).length,0),actual:cards.length,missing:names.filter(name=>!displayed.includes(name))};
      },{area,scope});
      assert.equal(retained.actual,retained.expected,`${scope}/${area} all portraits retained`);
      assert.deepEqual(retained.missing,[],`${scope}/${area} all names retained`);
      if(scope==='county' && area==='militaer') {
        const adjutants=dialog.locator('.herrschaft-person-group').filter({has:page.getByRole('heading',{name:'Adjutanten',exact:true})});
        assert.deepEqual(await adjutants.locator('h4').allTextContents(),['Rhys Draig','Anaraut Draig','Niniane Chwedlonol']);
        const commanders=dialog.locator('.herrschaft-person-group').filter({has:page.getByRole('heading',{name:'Kommandanten',exact:true})});
        assert.deepEqual(await commanders.locator('h4').allTextContents(),['Ferydnand Gafyr']);
        assert.equal(await commanders.locator('.herrschaft-person-office').innerText(),'Kommandant der Cochllamwyr und von Gwynthor');
      }
      console.log(scope,area,await dialog.evaluate(d=>({cards:d.querySelectorAll('.herrschaft-person-card').length,tables:d.querySelectorAll('table').length,remainingPortraitTables:d.querySelectorAll('table img').length})));
      for (const width of [1440,768,390]) {
        await page.setViewportSize({width,height:1000});
        const bounds=await dialog.evaluate(d=>{const body=d.querySelector('.administration-dialog-body');return {outer:d.scrollHeight-d.clientHeight,bodyX:body.scrollWidth-body.clientWidth,width:d.getBoundingClientRect().width,headerY:d.querySelector('header').getBoundingClientRect().y};});
        assert.ok(bounds.outer<=1,`Only body scrolls ${scope}/${area}/${width}: ${JSON.stringify(bounds)}`);
        assert.ok(bounds.bodyX<=1,`No dialog horizontal overflow ${scope}/${area}/${width}: ${JSON.stringify(bounds)}`);
        assert.ok(bounds.width<=width,`Dialog fits ${width}`);
        if (screenshotDir && scope==='county' && ['unterhaltung','militaer'].includes(area) && width!==768) {
          await dialog.locator('img').evaluateAll(async images=>{
            await Promise.all(images.map(async image=>{image.loading='eager';try{await image.decode();}catch{await new Promise(resolve=>setTimeout(resolve,100));try{await image.decode();}catch{}}}));
          });
          await dialog.screenshot({path:resolve(screenshotDir,`administration-dialog-${area}-${width}.png`)});
        }
      }
      // Check the previously hidden office tables and unknown-person groups too.
      await dialog.locator('details').evaluateAll(details=>details.forEach(d=>d.open=true));
      const broken=await dialog.locator('img').evaluateAll(async images=>{
        await Promise.all(images.map(async image=>{image.loading='eager';try{await image.decode();}catch{await new Promise(resolve=>setTimeout(resolve,150));try{await image.decode();}catch{}}}));
        return images.filter(image=>!image.naturalWidth).map(image=>image.src);
      });
      assert.deepEqual(broken,[],`${scope}/${area} broken images`);
      assert.equal(await dialog.locator('summary').evaluateAll(nodes=>nodes.filter(n=>/^[▶►▸]/.test(n.textContent.trim())).length),0,'No duplicate disclosure arrows');
      if(screenshotDir && scope==='county' && area==='militaer'){
        await page.setViewportSize({width:1440,height:1000});
        await dialog.locator('.administration-hierarchy').first().scrollIntoViewIfNeeded();
        await dialog.screenshot({path:resolve(screenshotDir,'administration-dialog-military-cards.png')});
      }
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!document.querySelector('.administration-dialog').open);
      assert.ok(await trigger.evaluate(button=>document.activeElement===button),'Focus restored');
    }
  }
  // Navigation stays in the current lordship and retains a keyboard focus target.
  await page.locator('.herrschaft-administration-card[data-administration-key="diplomatie"]').click();
  await page.waitForFunction(()=>!document.querySelector('.administration-dialog-body').hasAttribute('aria-busy'));
  await page.locator('.administration-dialog-navigation [data-administration-key="magie"]').click();
  await page.waitForFunction(()=>!document.querySelector('.administration-dialog-body').hasAttribute('aria-busy'));
  assert.ok((await page.locator('.administration-dialog-body').innerText()).includes('Ceridwen Lhuyd'));
  assert.ok(await page.locator('#administration-dialog-title').evaluate(title=>document.activeElement===title));
  await page.keyboard.press('Escape');

  // An unrecognised future source layout must preserve its table and content.
  assert.ok(await page.evaluate(async()=>{
    const {renderLegacyContent}=await import('/Kontinente/modules/administration/administration-renderer.mjs?v=administration-dialog-20260911b');
    const rendered=renderLegacyContent('<div><table><tr><td>Unbekannte Tabellenform</td></tr><tr><td><img src="/Stammbäume/assets/images/placeholders/male.png" style="width:100px;height:150px"><img src="/Stammbäume/assets/images/placeholders/male.png" style="width:100px;height:150px"></td></tr><tr><td>Erhaltener Name</td></tr></table></div>');
    return rendered.querySelector('table') && rendered.querySelectorAll('img').length===2 && rendered.textContent.includes('Erhaltener Name');
  }));
  assert.deepEqual(errors,[]);
} finally { await browser.close(); }
