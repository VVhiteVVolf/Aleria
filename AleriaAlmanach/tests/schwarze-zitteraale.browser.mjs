import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildZitteraaleModule } from '../modules/schwarze-zitteraale/zitteraale-module.mjs';
const entry=buildZitteraaleModule();
const preview=await openVenueBrowserPreview('zitteraale');
const {page}=preview;
const checks=[];
try {
  const matches=await page.evaluate(id=>getValidSections().flatMap(s=>s.entries.filter(e=>e.id===id)),entry.id);
  assert.equal(matches.length,1);assert.equal(matches[0].pages.length,9);
  const normalized=await page.evaluate(entry=>sanitizeModuleEntry(entry),entry);
  assert.equal(normalized.zitteraaleRevision,entry.zitteraaleRevision);
  const cached=structuredClone(entry);
  cached.zitteraaleRevision='20261021-bandenakte-v1';
  cached.pages.at(-1).pageTitle='Eigene bearbeitete Ruinenszene';
  cached.pages.push({pageTitle:'Alte Übersicht',commentThreadKey:'legacy-overview'},{pageTitle:'Alte Kopfgeldakte',commentThreadKey:'legacy-bounty'});
  const cleaned=await page.evaluate(entry=>sanitizeModuleEntry(entry),cached);
  assert.equal(cleaned.pages.length,9,'cached mixed modules lose the legacy pages');
  assert.deepEqual(cleaned.pages.map(p=>p.commentThreadKey),entry.pages.map(p=>p.commentThreadKey));
  assert.equal(cleaned.pages.at(-1).pageTitle,'Eigene bearbeitete Ruinenszene');
  const people=await page.evaluate(async()=>{
    const state=await loadLocalCharacterDatabaseState();
    return state.database.characters.filter(c=>c.id.startsWith('zitteraale-')).map(c=>({id:c.id,category:AleriaCharacterCategories.classify(c).label,items:c.inventory?.items?.length||0}));
  });
  assert.equal(people.length,5);for(const p of people)assert.equal(p.category,'Schwarze Zitteraale');
  for (const [layout,width,height] of [['desktop',1600,1050],['mobile',390,844]]) {
    await page.setViewportSize({width,height});
    for(const [index,model] of entry.pages.entries()) {
      await preview.openPage(entry,index);
      await preview.decodeImages('#modal-overlay img');
      if(model.bountyFilePage) {
        assert.match(await page.locator('.bounty-portrait img').getAttribute('src'),/\/sketches\//);
        assert.equal(await page.locator('.bounty-amount').innerText(),model.bountyFile.bountyAmount);
      }
      if(model.hierarchyPage) for(const [i,tree] of model.hierarchy.trees.entries()) {
        await page.locator('[data-hierarchy-tree-tab]').nth(i).click();
        assert.equal(await page.locator('[data-hierarchy-tree-panel].active .hierarchy-node-card').count(),tree.levels.flatMap(l=>l.nodes).length);
      }
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),`${layout}: ${index}`);
      if([0,2,3,8].includes(index)) await preview.capture(`${layout}-${index+1}`);
      checks.push({layout,page:index+1});
    }
  }
  const edited=await page.evaluate(entry=>{
    populateModuleEditor({entry,section:{key:'Kriminalität',tab:'Kriminalität',path:[]}},{mode:'edit',sourceKind:'builtin',sourceEntryId:entry.id});
    return collectModuleEditorPayload().entry;
  },entry);
  assert.equal(edited.zitteraaleRevision,entry.zitteraaleRevision);assert.equal(edited.pages.length,9);
  assert.equal(edited.pages.filter(p=>p.bountyFilePage).length,5);
  assert.deepEqual(preview.errors,[]);
  await writeFile(resolve(preview.output,'report.json'),JSON.stringify({passed:true,checks,people,editorRoundtrip:true,externalWrites:false},null,2));
  console.log(JSON.stringify({pass:true,pages:checks.length,output:preview.output}));
} finally {await preview.close();}
