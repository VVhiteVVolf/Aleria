import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { createContentPublicationClient,backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields,encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_RANKS } from '../../../Stammbäume/assets/js/domain/house-profile.js';
import { AUTHORED_ITEMS } from '../../../AleriaAlmanach/modules/item-definitions/authored-item-catalog.js';
import { itemDefinitionFromTemplate,itemDefinitionKey,itemDefinitionContent } from '../../../AleriaAlmanach/modules/item-definitions/item-definition-model.js';
import { selectHouseSignetTargets } from '../../../AleriaAlmanach/modules/house-knight-rings/house-ring-targets.mjs';
import { houseSignetClaimKey,planHouseEquipmentAmendment } from '../../../AleriaAlmanach/modules/house-knight-rings/house-ring-grant-plan.mjs';
const root=new URL('../../../',import.meta.url),directory=new URL('diagnostics/house-knight-rings-20261102/',root);
const apply=process.argv.includes('--apply'),verify=process.argv.includes('--verify');
const digest=value=>createHash('sha256').update(value).digest('hex');
const decode=raw=>raw?{...decodeFirestoreFields(raw.fields||{}),id:raw.name.split('/').at(-1)}:null;
const save=(name,value)=>writeFile(new URL(name,directory),JSON.stringify(value,null,2)+'\n');
await mkdir(directory,{recursive:true});
const client=await createContentPublicationClient();
const rows=await client.request(':runQuery',{structuredQuery:{from:[{collectionId:'characters'}],limit:1000}});
const documents=rows.flatMap(row=>row.document?[row.document]:[]);
assert(documents.length<1000,'Für den Gesamtbestand wird Pagination benötigt.');
const online=documents.map(decode),rawById=new Map(documents.map(raw=>[raw.name.split('/').at(-1),raw]));
const local=JSON.parse(await readFile(new URL('CharakterDatenbank/generated/characters.snapshot.json',root),'utf8')).characters;
const targets=selectHouseSignetTargets({online,local,families:FAMILY_REGISTRY,ranks:HOUSE_RANKS});
assert(targets.length>0&&targets.length<=100,'Unerwarteter Umfang des Inventarabgleichs.');
const live=targets.filter(target=>target.online),now=new Date().toISOString();
const claims=await Promise.all(live.map(target=>client.request(`/item_award_claims/${digest(houseSignetClaimKey(target.character.id))}`)));
const plans=live.map((target,index)=>planHouseEquipmentAmendment({...target,templates:AUTHORED_ITEMS,now,
 claim:claims[index]?decodeFirestoreFields(claims[index].fields):null}));
plans.forEach((plan,index)=>{
 const before=live[index].character;
 const protectedCharacter=value=>{
  const result=structuredClone(value);delete result.updatedAt;
  result.inventory ||= {};delete result.inventory.items;delete result.inventory.revision;
  if(plan.fieldPaths.includes('combatProfile.weapons')){delete result.combatProfile.weapons;delete result.combatProfile.revision;}
  return result;
 };
 assert(isDeepStrictEqual(protectedCharacter(plan.character),protectedCharacter(before)),`${before.name}: Ein nicht beauftragter Wert würde verändert.`);
 const corrected=new Set(plan.corrected.map(item=>item.id));
 for(const item of before.inventory?.items||[])if(!corrected.has(item.id)){
  assert(isDeepStrictEqual(plan.character.inventory.items.find(next=>next.id===item.id),item),`${before.name}: Ein früheres Besitzstück würde verändert.`);
 }
 const ring=plan.character.inventory.items.find(item=>item.definitionRef?.id===`house-signet:${live[index].membership.familyId}`);
 assert(ring,'Das Siegel passt nicht zum eigenen Haus.');
 if(verify&&ring.icon)assert.equal(ring.icon,ring.image,'Ein altes Ring-Vorschaubild verweist auf ein anderes Haus.');
 if(live[index].membership.worldPersonId==='person--haus-gafyr--gildas-gafyr')assert(!plan.character.inventory.items.some(item=>/Draig/i.test(item.name||'')&&/siegelring|ritterring/i.test(item.name||'')),'Gildas darf keinen Draig-Ring behalten.');
});
const localOnly=targets.filter(target=>!target.online).map(target=>({target,plan:planHouseEquipmentAmendment({...target,templates:AUTHORED_ITEMS,now})}));
const templateIds=new Set(plans.flatMap(plan=>[...plan.added,...plan.corrected].map(item=>item.templateId)));
const templates=AUTHORED_ITEMS.filter(item=>templateIds.has(item.id));
assert.equal(templates.length,templateIds.size);
for(const template of templates)assert.match(template.image,/^https:\/\/firebasestorage\.googleapis\.com\//,'Zuerst das Originalbild veröffentlichen.');
const definitions=templates.map(itemDefinitionFromTemplate);
const versions=await Promise.all(definitions.map(def=>client.request(`/item_definition_versions/${encodeURIComponent(itemDefinitionKey(def))}`)));
const heads=await Promise.all(definitions.map(def=>client.request(`/item_definitions/${encodeURIComponent(def.id)}`)));
const definitionWrites=[];
definitions.forEach((definition,index)=>{
 if(versions[index])assert.equal(itemDefinitionContent(decodeFirestoreFields(versions[index].fields)),itemDefinitionContent(definition),'Abweichende unveränderliche Itemversion.');
 else definitionWrites.push({update:{name:client.documentName(`item_definition_versions/${itemDefinitionKey(definition)}`),fields:encodeFirestoreFields({...definition,createdAt:now})},currentDocument:{exists:false}});
 if(heads[index])assert.equal(itemDefinitionContent(decodeFirestoreFields(heads[index].fields)),itemDefinitionContent(definition),'Ein vorhandener Katalogkopf wurde parallel anders bearbeitet.');
 else definitionWrites.push({update:{name:client.documentName(`item_definitions/${definition.id}`),fields:encodeFirestoreFields({...definition,updatedAt:now})},currentDocument:{exists:false}});
});
const summary={dryRun:!apply,charactersRead:online.length,eligible:targets.length,online:live.length,localOnly:localOnly.map(row=>({id:row.target.localId,name:row.target.character.name})),
 profiles:plans.map((plan,index)=>({id:plan.character.id,name:plan.character.name,familyId:live[index].membership.familyId,changed:plan.changed,added:plan.added,corrected:plan.corrected})),definitionWrites:definitionWrites.length};
await save(verify?'verification-plan.json':'prepared-plan.json',summary);
if(!verify)await save('prepared-characters.json',{capturedAt:now,characters:plans.map(plan=>plan.character),localOnly:localOnly.map(row=>row.plan.character),targets:targets.map(({character,...target})=>({...target,id:character.id,name:character.name}))});
if(verify){assert(plans.every(plan=>!plan.changed),'Die Vergabe würde wiederholt.');assert.equal(definitionWrites.length,0);console.log(JSON.stringify({verified:true,online:live.length,idempotent:true}));}
else if(apply){
 const locks=await Promise.all(live.map(target=>client.request(`/combat_profile_locks/characters/records/${target.character.id}`)));
 for(let index=0;index<locks.length;index++)if(plans[index].changed)assert(!(locks[index]&&decodeFirestoreFields(locks[index].fields).activeEncounterKeys?.length),`${live[index].character.name}: laufender Kampf, Inventar bleibt gesperrt.`);
 const writes=[...definitionWrites];
 plans.forEach((plan,index)=>{
  if(!plan.changed)return;
  const raw=rawById.get(plan.character.id),patch={inventory:plan.character.inventory,updatedAt:plan.character.updatedAt};
  if(plan.fieldPaths.includes('combatProfile.weapons'))patch.combatProfile={weapons:plan.character.combatProfile.weapons,revision:plan.character.combatProfile.revision};
  writes.push({verify:client.documentName(`combat_profile_locks/characters/records/${plan.character.id}`),currentDocument:locks[index]?{updateTime:locks[index].updateTime}:{exists:false}});
  writes.push({update:{name:raw.name,fields:encodeFirestoreFields(patch)},updateMask:{fieldPaths:plan.fieldPaths},currentDocument:{updateTime:raw.updateTime}});
  writes.push({update:{name:client.documentName(`item_award_claims/${digest(plan.grant.sourceKey)}`),fields:encodeFirestoreFields(plan.grant)},currentDocument:{exists:false}});
 });
 assert(writes.length<=500);
 if(writes.length){
  await backupContentPublication('house-signets-20261102',[...live.map(target=>rawById.get(target.character.id)),...claims,...locks,...versions,...heads],writes.filter(write=>write.update&&write.currentDocument.exists===false).map(write=>write.update.name.split('/documents/')[1]),now);
  const committed=await client.request(':commit',{writes});
  const after=await Promise.all(plans.map(plan=>client.request(`/characters/${plan.character.id}`)));
  after.forEach((raw,index)=>assert(isDeepStrictEqual(decode(raw),plans[index].character),`${plans[index].character.name}: nicht angeforderte Felder wurden verändert.`));
  await save('online-after.json',{capturedAt:committed.commitTime,documents:after,characters:after.map(decode)});
  await save('publication-verification.json',{...summary,dryRun:false,verified:true,committedAt:committed.commitTime,moneyAndLiveResourcesPreserved:true,previousItemsPreserved:true});
 }
 console.log(JSON.stringify({applied:true,online:live.length,changed:plans.filter(plan=>plan.changed).length,localOnly:localOnly.length}));
}else console.log(JSON.stringify(summary));
