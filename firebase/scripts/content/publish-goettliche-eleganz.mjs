// Dry run by default. One atomic, preconditioned publication of the shop and
// its family collection; existing profiles receive genealogy sources only.
import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { decodeFirestoreFields,encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { createContentPublicationClient,backupContentPublication,assertPublishedLocalArtwork } from './content-publication-client.mjs';
import { buildGoettlicheEleganz } from '../../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-module.mjs';
import { planEleganzCharacters } from '../../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-characters.mjs';
import { buildModuleOffers } from '../../../AleriaAlmanach/modules/item-register/item-register-module-catalog.js';
import { resolveModuleProduct } from '../../functions/src/mechanics/item-register-module-source.js';
import { STANDARD_ITEMS } from '../../functions/src/generated/item-register/item-register-standard.js';

const {request,documentName}=await createContentPublicationClient();
const now=new Date().toISOString();
const entry=buildGoettlicheEleganz();
const blank=planEleganzCharacters([],{},now);
const targetIds=new Set(blank.entries.map(item=>item.id));
const listing=[];
let token='';
do {
  const page=await request(`/characters?pageSize=1000&mask.fieldPaths=identity&mask.fieldPaths=genealogy.worldPersonId${token?`&pageToken=${encodeURIComponent(token)}`:''}`);
  listing.push(...(page.documents || []).map(raw=>({id:raw.name.split('/').at(-1),...decodeFirestoreFields(raw.fields || {})})));
  token=page.nextPageToken || '';
} while(token);
const related=listing.filter(character=>targetIds.has(character.id) || targetIds.has(character.identity?.worldPersonId || character.genealogy?.worldPersonId));
const documents=await Promise.all(related.map(character=>request(`/characters/${encodeURIComponent(character.id)}`)));
const configDocument=await request('/char_tabs/config');
const moduleDocument=await request(`/module_store_entries/${entry.id}`);
const previousEntry=JSON.parse(await readFile(new URL('../../../AleriaAlmanach/modules/goettliche-eleganz/sources/module-before-clothing.json',import.meta.url),'utf8')).module.entry;
const config=decodeFirestoreFields(configDocument.fields);
assert(config.moduleStoreManifest,'Modulmanifest fehlt.');
assert(!config.moduleStoreManifest.hiddenModuleIds?.[entry.id],'Das Modul ist ausgeblendet.');
if(moduleDocument) assert([JSON.stringify(entry),JSON.stringify(previousEntry)].includes(moduleDocument.fields.entryJson?.stringValue),'Abweichende Online-Bearbeitung des Moduls.');
const moduleChanged=!moduleDocument || moduleDocument.fields.entryJson?.stringValue!==JSON.stringify(entry);
const plan=planEleganzCharacters(documents.map(raw=>({id:raw.name.split('/').at(-1),...decodeFirestoreFields(raw.fields)})),config,now);
const ids=[...new Set([...(config.moduleStoreManifest.entryOverrideIds || []),entry.id])];
const prospective=new Map([['char_tabs/config',{moduleStoreManifest:{entryOverrideIds:ids,hiddenModuleIds:{}}}],[`module_store_entries/${entry.id}`,{entryJson:JSON.stringify(entry)}]]);
const database={doc:path=>path,collection:name=>({doc:id=>`${name}/${id}`})};
const transaction={get:async path=>({data:()=>prospective.get(path)})};
const offers=buildModuleOffers([entry],STANDARD_ITEMS);
assert.equal(offers.length,26);
for(const offer of offers) {
  const resolved=await resolveModuleProduct({database,transaction,input:{action:'buy',moduleId:entry.id,productId:offer.id,sourceRevision:offer.sourceRevision},standards:STANDARD_ITEMS});
  assert.equal(resolved.id,offer.id);
  assert.deepEqual(resolved.priceRange,offer.priceRange);
}
const changed=plan.entries.filter(item=>item.create || item.patch);
const configPatch=Object.fromEntries(Object.entries(plan.config).filter(([key,value])=>!isDeepStrictEqual(value,config[key])));
const moduleManifestChanged=moduleChanged || !isDeepStrictEqual(ids,config.moduleStoreManifest.entryOverrideIds);
if(moduleManifestChanged) {
  configPatch.moduleStoreManifest={entryOverrideIds:ids,updatedAtClient:Date.parse(now)};
  configPatch.moduleStoreUpdatedAtClient=Date.parse(now);
}
const summary={newModule:!moduleDocument,moduleChanged,pages:entry.pages.length,offers:offers.length,profiles:plan.entries.length,newProfiles:plan.entries.filter(item=>item.create).length,profileWrites:changed.length,configChanged:Object.keys(configPatch).length>0};
await writeFile(new URL('../../../Charakter Archiv Exporte/Module/Göttliche Eleganz/character-publication-plan.json',import.meta.url),JSON.stringify({schemaVersion:1,group:'Göttliche Eleganz',entries:plan.entries},null,2)+'\n');
if(!process.argv.includes('--apply')) {console.log(JSON.stringify({dryRun:true,...summary}));process.exit(0);}
if(!moduleChanged && !changed.length && !summary.configChanged) {console.log(JSON.stringify({alreadyPublished:true,...summary}));process.exit(0);}
const artwork=[];
function collect(value) {
  if(typeof value==='string' && value.startsWith('./assets/goettliche-eleganz/')) artwork.push(value);
  else if(Array.isArray(value)) value.forEach(collect);
  else if(value && typeof value==='object') Object.values(value).forEach(collect);
}
collect(entry);plan.entries.filter(item=>item.create).forEach(item=>collect(item.data));
await assertPublishedLocalArtwork(artwork);
await backupContentPublication('goettliche-eleganz',[...documents,configDocument,moduleDocument],plan.entries.filter(item=>item.create).map(item=>item.id),now);
const writes=changed.map(item=>item.create?{
  update:{name:documentName(`characters/${item.id}`),fields:encodeFirestoreFields(item.data)},currentDocument:{exists:false}
}:{update:{name:documentName(`characters/${item.id}`),fields:encodeFirestoreFields(item.patch)},updateMask:{fieldPaths:['genealogy.sources','updatedAt']},
  currentDocument:{updateTime:documents.find(raw=>raw.name.endsWith(`/${item.id}`)).updateTime}});
if(!moduleDocument) writes.push({update:{name:documentName(`module_store_entries/${entry.id}`),fields:encodeFirestoreFields({entryId:entry.id,moduleKind:'override',entry:null,entryJson:JSON.stringify(entry),schemaVersion:1,updatedAtClient:Date.parse(now)})},
  currentDocument:{exists:false},updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}]});
else if(moduleChanged) writes.push({update:{name:moduleDocument.name,fields:encodeFirestoreFields({entry:null,entryJson:JSON.stringify(entry),updatedAtClient:Date.parse(now)})},
  updateMask:{fieldPaths:['entry','entryJson','updatedAtClient']},currentDocument:{updateTime:moduleDocument.updateTime},updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}]});
if(summary.configChanged) writes.push({update:{name:configDocument.name,fields:encodeFirestoreFields(configPatch)},
  updateMask:{fieldPaths:Object.keys(configPatch).flatMap(key=>key==='moduleStoreManifest'?['moduleStoreManifest.entryOverrideIds','moduleStoreManifest.updatedAtClient']:[key])},
  currentDocument:{updateTime:configDocument.updateTime},...(moduleManifestChanged?{updateTransforms:[{fieldPath:'moduleStoreUpdatedAt',setToServerValue:'REQUEST_TIME'}]}:{})});
await request(':commit',{writes});
assert.equal((await request(`/module_store_entries/${entry.id}`)).fields.entryJson.stringValue,JSON.stringify(entry));
for(const item of plan.entries) {
  const raw=await request(`/characters/${encodeURIComponent(item.id)}`);
  if(item.create) assert.deepEqual(decodeFirestoreFields(raw.fields),item.data,`Profil ${item.key}`);
  else {
    const previous=documents.find(document=>document.name===raw.name);
    const control=structuredClone(raw.fields);
    if(item.patch) {control.genealogy.mapValue.fields.sources=previous.fields.genealogy?.mapValue?.fields?.sources;control.updatedAt=previous.fields.updatedAt;}
    // Remove absent fields instead of synthesizing null or an undefined REST value.
    if(item.patch && !previous.fields.genealogy?.mapValue?.fields?.sources) delete control.genealogy.mapValue.fields.sources;
    if(item.patch && !previous.fields.updatedAt) delete control.updatedAt;
    if(item.patch && !previous.fields.genealogy) delete control.genealogy;
    assert.deepEqual(control,previous.fields,`Unbeteiligte Profildaten ${item.key}`);
  }
}
const after=(await request('/char_tabs/config')).fields;
const control=structuredClone(after);
for(const key of Object.keys(configPatch).filter(key=>key!=='moduleStoreManifest')) {
  assert.deepEqual(decodeFirestoreFields({[key]:after[key]})[key],configPatch[key],key);
  if(configDocument.fields[key]) control[key]=configDocument.fields[key]; else delete control[key];
}
if(moduleManifestChanged) {
  assert.deepEqual(decodeFirestoreFields(after).moduleStoreManifest.entryOverrideIds,ids);
  control.moduleStoreManifest=configDocument.fields.moduleStoreManifest;
  if(configDocument.fields.moduleStoreUpdatedAt) control.moduleStoreUpdatedAt=configDocument.fields.moduleStoreUpdatedAt;else delete control.moduleStoreUpdatedAt;
}
assert.deepEqual(control,configDocument.fields,'Unbeteiligte Konfiguration');
console.log(JSON.stringify({applied:true,...summary,verifiedArtwork:new Set(artwork).size,verifiedProfiles:plan.entries.length,liveResourceWrites:0}));
