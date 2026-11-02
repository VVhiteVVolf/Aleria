import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from '../../AleriaAlmanach/tests/support/venue-browser-preview.mjs';
const snapshot=JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
const character=structuredClone(snapshot.characters.find(c=>c.name==='Gais Wyrm'));
character.inventory={...character.inventory,name:character.name,characterId:character.id};
const preview=await openVenueBrowserPreview('inventory-theme-20261102-initial');
try{
 const {page}=preview;await page.setViewportSize({width:1680,height:1050});
 await page.evaluate(character=>{openCharProfile(null);switchCharTab('inventory');initCharacterInventoryProfile(character);},character);
 const lance=character.inventory.items.find(item=>item.name==='Lanze');
 await page.locator(`[data-ci-action="select-item"][data-ci-item-id="${lance.id}"]`).click();
 await preview.decodeImages('#cp-inventory-editor img');
 await page.locator('#cp-inventory-editor').evaluate(root=>{
   for(const node of [root,...root.querySelectorAll('*')]){node.scrollTop=0;node.scrollLeft=0;}
   for(let node=root.parentElement;node;node=node.parentElement){node.scrollTop=0;node.scrollLeft=0;}
 });
 const path=resolve(preview.output,'inventory-initial-region.png');
 await page.locator('#cp-inventory-editor').screenshot({path});
 const record={path,source:character.id,focus:lance.id,region:'#cp-inventory-editor',scrollReset:true,externalWritesBlocked:true,errors:preview.errors};
 await writeFile(new URL('initial-preview.json',import.meta.url),JSON.stringify(record,null,2)+'\n');
 console.log(JSON.stringify(record));
}finally{await preview.close();}
