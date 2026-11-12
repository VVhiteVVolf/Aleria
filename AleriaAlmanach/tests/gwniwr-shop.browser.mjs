import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openVenueBrowserPreview} from './support/venue-browser-preview.mjs';
import {buildGwniwrShop} from '../modules/gwniwr/gwniwr-module.mjs';
import {gwniwrShopPeople} from '../modules/gwniwr/gwniwr-personnel.mjs';
import {FORTUNA_SECTION} from '../modules/markt-der-fortuna-gwynthor/fortuna-section.mjs';
const entry=buildGwniwrShop(),people=gwniwrShopPeople();
const preview=await openVenueBrowserPreview('gwniwr-shop');
const {page}=preview,output=resolve(process.env.GWNIWR_BROWSER_OUTPUT||preview.output),screenshots=[],checks=[],actorChecks=[],dialogs=[],missing=[];
await mkdir(output,{recursive:true});
const capture=async name=>{const path=resolve(output,`${name}.png`);await page.screenshot({path});screenshots.push(path);};
try{
  page.on('response',response=>{if(response.status()>=400&&/gwniwr/.test(response.url()))missing.push({status:response.status(),url:response.url()});});
  const icons=new Set(await page.evaluate(()=>Object.values(COMMENT_ACTION_ICONS).filter(value=>/^https:\/\//.test(value))));
  await page.context().route('**/*',route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===preview.origin&&request.method()==='GET')return route.continue();
    if(request.method()==='GET'&&(url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/')||request.resourceType()==='image'&&icons.has(request.url())))return route.fallback();
    return route.abort();
  });
  await page.evaluate(()=>{window.__gwniwrWrites=0;window._fb={...getLocalCommentBackend(),_localFallback:false,loadCreatures:async()=>[],addComment:async()=>{window.__gwniwrWrites++;throw Error('Browserfixture blocks writes');}};_fbReady=true;});
  const placement=await page.evaluate(id=>getValidSections().filter(section=>section.entries.some(entry=>entry.id===id)).map(section=>section.path),entry.id);
  assert.deepEqual(placement,[['Cenyr','Celtigerns Wacht','Llamreis Ankunft','Bannkreis Gwynthor','Gwynthor-Stadt',FORTUNA_SECTION.path.at(-1)]]);
  for(const [layout,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
    await page.setViewportSize(viewport);
    for(const [index,model] of entry.pages.entries()){
      await preview.openPage(entry,index);
      await preview.decodeImages('#modal-overlay img[src*="gwniwr"],#modal-overlay img[src*="portraits/gwniwr"]');
      if(model.guildPage){const copy=await page.locator('#modal-overlay').innerText();assert.match(copy,/Sonderwünsche/);assert.match(copy,/Hochzeit im kleinen Rahmen/);}
      if(model.hierarchyPage){
        assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-tab]').count(),3);
        for(const [tab,tree] of model.hierarchy.trees.entries()){
          await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(tab).click();
          assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active .hierarchy-node-card').count(),tree.levels.flatMap(level=>level.nodes).length);
          await preview.decodeImages('#modal-overlay [data-hierarchy-tree-panel].active img');
          await capture(`${layout}-hierarchie-${tree.id}`);
          await page.locator('#modal-overlay [data-hierarchy-tree-panel].active .hierarchy-node-card').filter({hasText:'Unbesetzter Posten'}).first().scrollIntoViewIfNeeded();
          await capture(`${layout}-hierarchie-${tree.id}-freie-stellen`);
        }
      }
      if(model.tradeCatalogPage){
        assert.equal(await page.locator('#modal-overlay .trade-catalog-item').count(),51);
        await page.locator('#modal-overlay .trade-catalog-header').scrollIntoViewIfNeeded();
        await capture(`${layout}-sortiment-szenenheader`);
        for(const [category,count] of [['damen',22],['herren',22],['damen-hochzeit',4],['herren-hochzeit',3]]){
          await page.locator(`#modal-overlay [data-trade-filter="${category}"]`).click();
          assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(),count);
          const first=page.locator('#modal-overlay .trade-catalog-item:visible').first();
          await first.locator('.trade-catalog-image-wrap').scrollIntoViewIfNeeded();
          await preview.decodeImages('#modal-overlay .trade-catalog-item:visible img');
          await capture(`${layout}-sortiment-${category}`);
          await first.locator('[data-action="open-trade-item-card"]').click();
          const dialog=page.locator('dialog.trade-item-card[open]');await dialog.waitFor();
          await preview.decodeImages('dialog.trade-item-card[open] img');
          assert.equal(await dialog.locator('.trade-item-card-image img').count(),1);
          assert(await dialog.evaluate(node=>node.getBoundingClientRect().width<=innerWidth+1));
          await capture(`${layout}-itemkarte-${category}`);dialogs.push({layout,category});
          await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
          assert.equal(await first.locator('[data-action="open-trade-item-card"]').evaluate(node=>node===document.activeElement),true);
        }
        await page.locator('#modal-overlay [data-trade-filter="all"]').click();
        for(const name of ['Flachstag','Meistertuch','Treuekleid','Flachsschwur']){await page.locator('#modal-overlay [data-trade-search-input]').fill(name);assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(),1,name);}
        await page.locator('#modal-overlay [data-trade-search-input]').fill('');
        assert.equal(await page.locator('#modal-overlay .trade-catalog-item:visible').count(),51);
      }
      if(model.sessionPage){
        const thread=await page.evaluate(()=>getCurrentCommentThreadId());assert(thread);
        await page.locator('#modal-overlay .session-intro-toggle').click();assert.equal(await page.locator('#modal-overlay .session-stage-copy').isVisible(),false);
        await page.locator('#modal-overlay .session-intro-toggle').click();assert.equal(await page.evaluate(()=>getCurrentCommentThreadId()),thread);
        await page.locator('#modal-overlay [data-action="open-comment-form"]').click();
        await page.waitForFunction(()=>isCommentFormActorsReady()&&document.querySelector('#cf-char-picker .cf-char-option'));
        assert.deepEqual(await page.evaluate(count=>getAvailableCommentCharacters().slice(0,count).map(person=>person.id),entry.sessionCast.length),entry.sessionCast);
        for(const person of people){
          await page.locator('#cf-char-search').fill(person.name);
          const option=page.locator(`#cf-char-picker [data-id="${person.worldPersonId}"]`);await option.click();
          assert.equal(await option.locator('img').count(),1,`${person.name}: real portrait instead of initial placeholder`);
          await preview.decodeImages(`#cf-char-picker [data-id="${person.worldPersonId}"] img`);
          assert.equal(await page.evaluate(()=>_selectedCharId),person.worldPersonId);
          actorChecks.push({layout,id:person.worldPersonId,name:person.name});
        }
        await capture(`${layout}-avatarwaehler`);
        await page.locator('#comment-form-overlay [data-action="close-comment-form"]').click();
        await page.locator('#comment-form-overlay').waitFor({state:'hidden'});
        assert.equal(await page.evaluate(()=>getCurrentCommentThreadId()),thread);
      }
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),`${layout} page ${index+1} horizontal overflow`);
      await capture(`${layout}-seite-${index+1}`);checks.push({layout,page:index+1});
    }
  }
  assert.equal(actorChecks.length,18);assert.equal(dialogs.length,8);assert.deepEqual(preview.errors,[]);assert.deepEqual(missing,[]);assert.equal(await page.evaluate(()=>window.__gwniwrWrites),0);
  await writeFile(resolve(output,'report.json'),JSON.stringify({passed:true,checks,actorChecks,dialogs,screenshots,placement,missing,fixture:'Native controllers, existing local comment backend and actual local character snapshot. External writes blocked.',productionWrites:0},null,2)+'\n');
  console.log(JSON.stringify({passed:true,checks:checks.length,actorChecks:actorChecks.length,dialogs:dialogs.length,screenshots:screenshots.length,output}));
}catch(error){await capture('failure').catch(()=>{});await writeFile(resolve(output,'report.json'),JSON.stringify({passed:false,error:error.message,checks,actorChecks,dialogs,screenshots,missing,productionWrites:0},null,2)+'\n');throw error;}
finally{await preview.close();}
