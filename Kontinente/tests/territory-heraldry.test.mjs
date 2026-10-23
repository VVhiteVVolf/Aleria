import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../assets/js/herrschaft-data.js',import.meta.url),'utf8'),context);
const data=context.window.ALERIA_HERRSCHAFT_DATA;
for(const region of ['dunfal','roriksheim','ivarsheim','schwarzfenn','kraehenmoor','heldenwacht']){
 test(`${region}: subordinate domains retain their regional banner and separate clan crest`,async()=>{
  const {createTerritory}=await import(`../modules/${region}/territory-page.mjs`);
  const {pages}=JSON.parse(fs.readFileSync(new URL(`../modules/${region}/pages.source.json`,import.meta.url),'utf8'));
  for(const source of pages){
   const page=createTerritory(source.id,data);
   for(const link of page.view.geography.links||[]){
    assert.ok(link.bannerSrc,`${source.id}: ${link.id} lacks its regional banner`);
    assert.equal(link.imageSrc,link.bannerSrc);
    assert.ok(fs.existsSync(new URL('../..'+link.bannerSrc,import.meta.url)));
    if(link.crestSrc)assert.ok(fs.existsSync(new URL('../..'+link.crestSrc,import.meta.url)));
   }
  }
 });
}
