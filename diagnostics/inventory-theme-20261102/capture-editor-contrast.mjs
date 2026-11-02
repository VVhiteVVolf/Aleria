import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from '../../AleriaAlmanach/tests/support/venue-browser-preview.mjs';
const snapshot=JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
const character=structuredClone(snapshot.characters.find(c=>c.name==='Gais Wyrm'));
character.inventory={...character.inventory,name:character.name,characterId:character.id};
const preview=await openVenueBrowserPreview('inventory-theme-20261102-contrast');
try{
 const {page}=preview;await page.setViewportSize({width:1440,height:1000});
 await preview.openPage({id:'inventory-contrast-qa',title:'Lokale Inventarprüfung',multipage:true,pages:[{characterInventoryPage:true,characterInventory:character.inventory}]},0);
 await page.locator('#modal-overlay .ci-item-card-button').first().click();
 await page.locator('#modal-overlay dialog[open] [data-ci-action="edit-item"]').click();
 const labels=await page.locator('#modal-overlay dialog[open] .ci-modal-live-preview .ci-radar text').evaluateAll(nodes=>nodes.map(node=>({label:node.textContent,fill:getComputedStyle(node).fill})));
 assert(labels.length>0);assert(labels.every(node=>node.fill==='rgb(199, 183, 143)'));
 const path=resolve(preview.output,'item-editor-radar-contrast.png');
 await page.locator('#modal-overlay dialog[open]').screenshot({path});
 const record={passed:true,labels,path,externalWritesBlocked:true,errors:preview.errors};
 await writeFile(new URL('editor-contrast-verification.json',import.meta.url),JSON.stringify(record,null,2)+'\n');
 console.log(JSON.stringify(record));
}finally{await preview.close();}
