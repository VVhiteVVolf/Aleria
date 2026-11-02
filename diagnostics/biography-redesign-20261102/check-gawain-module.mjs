import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from '../../AleriaAlmanach/tests/support/venue-browser-preview.mjs';
const {entry}=JSON.parse(await readFile(new URL('../../AleriaAlmanach/modules/gawain-duncan/source/reviewed-module.json',import.meta.url),'utf8'));
const profile=entry.pages.findIndex(page=>page.biographyPage&&page.commentThreadKey==='1');
assert(profile>=0);
// Simulate a still-unmigrated module biography, so the exact-page fallback is exercised.
delete entry.pages[profile].biography.knightMentors;
const preview=await openVenueBrowserPreview('biography-gawain-checkup-20261102');
try{
 const {page}=preview;await page.setViewportSize({width:1680,height:1050});
 await preview.openPage(entry,profile);
 const portrait=page.locator('#modal-overlay .biography-portrait').first();
 await preview.decodeImages('#modal-overlay .biography-portrait, #modal-overlay .biography-mentor img');
 assert.equal(await portrait.getAttribute('src'),entry.pages[profile].image||entry.pages[profile].biography.portrait);
 const mentors=page.locator('#modal-overlay .biography-mentor');assert.equal(await mentors.count(),1);
 assert.match(await mentors.innerText(),/Duncan Gafyr/);
 const unrelated=await page.evaluate(page=>{
   const result=AleriaBiographyCatalog.resolveModule({...page,commentThreadKey:'qa-independent',pageTitle:'Eigenständige Kontrollbio'},'gawain-duncan');
   return result.biography.knightMentors||[];
 },entry.pages[profile]);
 assert.deepEqual(unrelated,[]);
 const image=await portrait.getAttribute('src'),mentorImage=await mentors.locator('img').getAttribute('src');
 const path=resolve(preview.output,'gawain-module-bio.png');await page.locator('#modal-overlay .biography-page').screenshot({path});
 const report={passed:true,moduleId:entry.id,pageKey:'1',portrait:image,mentorPortrait:mentorImage,unrelatedPageReceivedNoMentors:true,path,externalWritesBlocked:true,errors:preview.errors};
 assert.deepEqual(preview.errors,[]);
 await writeFile(new URL('gawain-module-checkup.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}finally{await preview.close();}
