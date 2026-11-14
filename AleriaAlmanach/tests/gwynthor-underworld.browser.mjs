import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildUnderworldRegistrations } from '../modules/gwynthor-underworld/underworld-modules.mjs';
import { RAT_PEOPLE } from '../modules/gwynthor-underworld/underworld-people.mjs';
import { buildUnderworldCharacterExports } from '../modules/gwynthor-underworld/underworld-characters.mjs';
const registrations=buildUnderworldRegistrations(),preview=await openVenueBrowserPreview('gwynthor-underworld');
const portraitsOnly=process.argv.includes('--portraits-only');
const {page}=preview,output=path.resolve(`diagnostics/gwynthor-underworld-20261114/browser-${Date.now()}`),shots=[],checks=[];
await fs.mkdir(output,{recursive:true});
const capture=async(name,target=page)=>{const file=path.join(output,`${name}.png`);await target.screenshot({path:file});shots.push(file);};
try {
  await page.evaluate(profiles=>{
    window.__underworldWrites=0;
    window._fb={...getLocalCommentBackend(),_localFallback:false,loadCharacters:async()=>profiles,loadCreatures:async()=>[],
      addComment:async()=>{window.__underworldWrites++;throw Error('Fixture blocks writes.');},
      saveCharacter:async()=>{window.__underworldWrites++;throw Error('Fixture blocks writes.');}};
    _fbReady=true;
  },buildUnderworldCharacterExports().map(e=>e.character));
  for(const registration of registrations) {
    const placement=await page.evaluate(id=>getValidSections().flatMap(s=>s.entries.filter(e=>e.id===id).map(()=>s.path)),registration.entry.id);
    assert.deepEqual(placement,[registration.path]);
  }
  for(const [layout,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
    await page.setViewportSize(viewport);
    const threads=[];
    for(const {entry} of registrations) {
      if(portraitsOnly&&entry.id!==registrations[0].entry.id)continue;
      const normalized=await page.evaluate(entry=>sanitizeModuleEntry(structuredClone(entry)),entry);
      assert.equal(normalized.pages.length,entry.pages.length);
      assert.deepEqual(normalized.pages.filter(p=>p.sessionPage).map(p=>p.commentThreadKey),entry.pages.filter(p=>p.sessionPage).map(p=>p.commentThreadKey));
      for(const [index,model] of entry.pages.entries()) {
        if(portraitsOnly&&![1,2,4].includes(index))continue;
        await preview.openPage(entry,index);
        await preview.decodeImages('#modal-overlay img[src*="gwynthor-underworld"]');
        if(model.hierarchyPage) {
          for(const [treeIndex,tree] of model.hierarchy.trees.entries()) {
            if(portraitsOnly&&!['fuehrung','aufpasser'].includes(tree.id))continue;
            await page.locator('[data-hierarchy-tree-tab]').nth(treeIndex).click();
            assert.equal(await page.locator('[data-hierarchy-tree-panel].active .hierarchy-node-card').count(),tree.levels.flatMap(l=>l.nodes).length);
            await page.locator('[data-hierarchy-tree-panel].active').scrollIntoViewIfNeeded();
            await capture(`${layout}-personal-${tree.id}`);
          }
        }
        if(model.guildServicesPage) {
          assert.equal(await page.locator('.guild-service-card').count(),6);
          for(const [serviceIndex,service] of model.guildServices.services.entries()) {
            const card=page.locator('.guild-service-card').nth(serviceIndex);
            assert((await card.innerText()).includes(service.terms));
            await card.scrollIntoViewIfNeeded();
            if(serviceIndex===0||serviceIndex===5)await capture(`${layout}-dienst-${serviceIndex}`);
          }
        }
        if(model.sessionPage) {
          const thread=await page.evaluate(()=>getCurrentCommentThreadId());assert(thread);threads.push(thread);
          if(entry.id===registrations[0].entry.id&&index===4) {
            const button=page.locator('[data-action="open-comment-form"]');await button.focus();await button.press('Enter');
            await page.waitForFunction(()=>isCommentFormActorsReady()&&document.querySelector('#cf-char-picker .cf-char-option'));
            for(const person of RAT_PEOPLE) {
              await page.locator('#cf-char-search').fill(person.name);
              await page.locator(`#cf-char-picker [data-id="${person.worldPersonId}"]`).click();
              assert.equal(await page.evaluate(()=>_selectedCharId),person.worldPersonId);
            }
            await capture(`${layout}-figurenwahl`);
            await page.locator('#comment-form-overlay [data-action="close-comment-form"]').click();
            await page.locator('#comment-form-overlay').waitFor({state:'hidden'});
          }
        }
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
        await page.locator('.modal-page-tab.active').first().scrollIntoViewIfNeeded();
        await capture(`${layout}-${entry.id}-seite-${index+1}`);
        checks.push({layout,id:entry.id,page:index+1});
      }
    }
    assert.equal(new Set(threads).size,portraitsOnly?1:9);
    if(!portraitsOnly) {
    await preview.openPage(registrations[1].entry,0);
    await page.locator('[data-modal-action="jump-page"][data-page-index="1"]').first().click();
    await page.waitForFunction(()=>document.querySelector('.modal-page-tab.active')?.dataset.pageIndex==='1');
    assert((await page.locator('#modal-overlay').innerText()).includes('Schlickmarkt'));
    await capture(`${layout}-seitenwechsel`);
    }
  }
  // Contact sheets are review views only; admitted raster files stay byte-identical.
  const manifest=JSON.parse(await fs.readFile(new URL('../assets/gwynthor-underworld/manifest.json',import.meta.url),'utf8'));
  if(portraitsOnly)manifest.active=manifest.active.filter(i=>['cadwren-brithog','edrith-voss','dornan-falbh','caerlan-ruadh'].includes(i.key));
  const gallery=await page.context().newPage();await gallery.setViewportSize({width:1100,height:1660});
  await gallery.goto(`${preview.origin}/AleriaAlmanach/assets/gwynthor-underworld/manifest.json`);
  for(let offset=0;offset<manifest.active.length;offset+=4) {
    const entries=manifest.active.slice(offset,offset+4);
    await gallery.setContent(`<style>body{margin:0;padding:15px;background:#252422;color:#fff;font:18px sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:15px}figure{margin:0;height:795px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#d7d1c4}img{max-width:100%;max-height:750px;object-fit:contain}figcaption{height:35px;color:#111;padding:5px}</style>${entries.map(i=>`<figure><img src="${preview.origin}/${i.path}"><figcaption>${i.key}</figcaption></figure>`).join('')}`);
    await gallery.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
    const alpha=await gallery.locator('img').evaluateAll(images=>images.map(img=>{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d');x.drawImage(img,0,0);const a=x.getImageData(0,0,1,1).data[3];return {src:img.src,cornerAlpha:a};}));
    for(const item of alpha.filter(i=>/\/services\/|\/signs\//.test(i.src)))assert.equal(item.cornerAlpha,0,item.src);
    await capture(`art-review-${offset/4+1}`,gallery);
  }
  await gallery.close();
  assert.equal(await page.evaluate(()=>window.__underworldWrites),0);assert.deepEqual(preview.errors,[]);
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify({passed:true,mode:portraitsOnly?'portraits-only':'all-pages',shots,checks,productionWrites:false,browserClosedInFinally:true},null,2));
  console.log(JSON.stringify({passed:true,output,screenshots:shots.length,pages:checks.length}));
} catch(error) {
  await capture('failure');await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({error:error.stack,shots,checks},null,2));throw error;
} finally {await preview.close();}
