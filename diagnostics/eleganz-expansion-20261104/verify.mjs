// Local-only verification: module-source resolution uses an in-memory reader.
import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildGoettlicheEleganz} from '../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-module.mjs';
import {ELEGANZ_COLLECTION} from '../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-collection.mjs';
import {buildModuleOffers} from '../../AleriaAlmanach/modules/item-register/item-register-module-catalog.js';
import {resolveModuleProduct} from '../../firebase/functions/src/mechanics/item-register-module-source.js';
import {projectBuiltinTradeModule} from '../../AleriaAlmanach/scripts/scene-trade/scene-trade-builtin-projection.mjs';
const root=new URL('../../',import.meta.url);
const entry=buildGoettlicheEleganz();
const before=JSON.parse(await readFile(new URL('AleriaAlmanach/modules/goettliche-eleganz/sources/module-before-expansion-2026-11-04.json',root),'utf8')).entry;
const oldItems=before.pages[4].tradeCatalog.items;
const offers=buildModuleOffers([entry]);
assert.equal(offers.length,51);
const projected=projectBuiltinTradeModule(entry,{tab:'Völker & Kulturen',path:['Cenyr','Gwynthor']});
assert.deepEqual(buildModuleOffers([projected.entry]),offers);
const documents=new Map([
  ['char_tabs/config',{moduleStoreManifest:{entryOverrideIds:[entry.id],hiddenModuleIds:{}}}],
  [`module_store_entries/${entry.id}`,{entryJson:JSON.stringify(entry)}]
]);
const database={doc:path=>path,collection:name=>({doc:id=>`${name}/${id}`})};
const transaction={get:async path=>({data:()=>documents.get(path)})};
for(const offer of offers) {
  const resolved=await resolveModuleProduct({database,transaction,input:{action:'buy',moduleId:entry.id,productId:offer.id,sourceRevision:offer.sourceRevision},standards:[]});
  assert.deepEqual(resolved.priceRange,offer.priceRange,offer.title);
  assert.equal(resolved.definitionSourceId,offer.definitionSourceId,offer.title);
}
const artwork=[];
for(const item of entry.pages[4].tradeCatalog.items) {
  const bytes=await readFile(new URL(`AleriaAlmanach/${item.image}`,root));
  artwork.push({id:item.id,file:`AleriaAlmanach/${item.image.replace(/^\.\//,'')}`,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),new:!oldItems.some(old=>old.id===item.id)});
}
const report={date:'2026-11-04',localOnly:true,productionReads:0,productionWrites:0,
  categories:Object.fromEntries(Object.entries(ELEGANZ_COLLECTION).map(([category,items])=>[category,{count:items.length,minimumCopper:Math.min(...items.map(item=>item.copper)),maximumCopper:Math.max(...items.map(item=>item.copper))}])),
  offers:offers.length,serverResolvedOffers:offers.length,builtinProjectionOffers:offers.length,
  additions:artwork.filter(item=>item.new).length,
  reductions:Object.values(ELEGANZ_COLLECTION).flat().filter(item=>['damen-goettliche-eleganz','herren-goettliche-eleganz','braut-zwei-heimaten','braeutigam-heller-bund'].includes(item.id)).map(item=>({id:item.id,beforeCopper:buildModuleOffers([before]).find(offer=>offer.sourceRefs[0].itemId===item.id).priceRange.minCopper,nowCopper:item.copper})),
  items:Object.entries(ELEGANZ_COLLECTION).flatMap(([category,items])=>items.map(item=>({id:item.id,name:item.name,category,copper:item.copper}))),artwork};
await writeFile(new URL('./verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({offers:offers.length,serverResolvedOffers:offers.length,artwork:artwork.length,additions:report.additions,maximumCopper:Math.max(...report.items.map(item=>item.copper))}));
