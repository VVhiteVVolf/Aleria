// Read-only query. Protected source identities never leave these memory sets.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicContentReadClient } from '../../firebase/scripts/content/content-publication-client.mjs';
import { decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
import { GWYNTHOR_FLEISCHSAMMLER_FAMILIES } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/family-records.js';
import { CONFIRMED_CHARACTER_RETIREMENTS } from '../../CharakterDatenbank/assets/js/character-identity-retirements.mjs';

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const excludedIds=new Set(),excludedNames=new Set();
for(const family of GWYNTHOR_FLEISCHSAMMLER_FAMILIES){
  excludedIds.add(family.document.id);
  for(const person of family.persons||[]){
    for(const id of [person.id,person.worldPersonId])if(id)excludedIds.add(id);
    excludedNames.add(normalize(person.name));
  }
}
const privateFile=process.env.USERPROFILE&&path.join(process.env.USERPROFILE,'.codex/private/aleria/index.json');
if(privateFile&&fs.existsSync(privateFile))for(const entry of JSON.parse(fs.readFileSync(privateFile,'utf8')).entries||[]){
  if(!entry.privateOnly&&!['private','hidden'].includes(entry.visibility))continue;
  for(const id of [entry.id,...(entry.aliases||[])]){excludedIds.add(id);excludedNames.add(normalize(id));}
}
const worldId=row=>row.identity?.worldPersonId||row.genealogy?.worldPersonId||'';
const localRows=JSON.parse(fs.readFileSync(new URL('../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8')).characters;
for(const row of localRows){
  const classified=row.localRecord?.classification;
  if(![classified?.primary?.id,...(classified?.families||[]).map(link=>link.familyId)].some(id=>excludedIds.has(id)))continue;
  for(const id of [row.id,worldId(row),...(row.localRecord?.firestoreDocumentIds||[])])if(id)excludedIds.add(id);
  excludedNames.add(normalize(row.name));
}
const isPublic=row=>!row.hidden&&!row.privateOnly&&!['hidden','private'].includes(row.visibility)
  &&![row.id,worldId(row),row.genealogy?.houseId,row.genealogy?.houseId?.replace(/^house-/,'haus-')].some(id=>excludedIds.has(id))
  &&!excludedNames.has(normalize(row.name));
const selected=['name','aliases','archived','identity.worldPersonId','genealogy.worldPersonId','genealogy.birth','genealogy.houseId','inventory.age','updatedAt','portrait','title','hidden','privateOnly','visibility'];
const response=await createPublicContentReadClient().request(':runQuery',{structuredQuery:{from:[{collectionId:'characters'}],select:{fields:selected.map(fieldPath=>({fieldPath}))}}});
const live=response.filter(row=>row.document).map(({document})=>({id:document.name.split('/').at(-1),...decodeFirestoreFields(document.fields)})).filter(isPublic);
const local=localRows.filter(isPublic);
const projectRegistry=JSON.parse(fs.readFileSync(new URL('../../CharakterDatenbank/registry.json',import.meta.url),'utf8')).records;
function groups(rows,keyFor){
  const index=new Map();
  for(const row of rows){const key=keyFor(row);if(!key)continue;if(!index.has(key))index.set(key,[]);index.get(key).push(row);}
  return [...index.values()].filter(group=>group.length>1).map(group=>({
    conflictingWorldIds:new Set(group.map(worldId).filter(Boolean)).size>1,
    conflictingBirths:new Set(group.map(row=>row.genealogy?.birth).filter(value=>/^\d+$/.test(value||''))).size>1,
    conflictingAges:new Set(group.map(row=>row.inventory?.age).filter(value=>value!==undefined&&value!==null&&value!=='')).size>1,
    records:group.map(row=>({id:row.id,name:row.name,archived:row.archived===true,worldPersonId:worldId(row),birth:row.genealogy?.birth||'',age:row.inventory?.age??null,title:row.title||'',portrait:row.portrait||'',
      registeredCanonicalId:projectRegistry.find(record=>record.firestoreDocumentIds.includes(row.id))?.firestoreDocumentId||''}))
  }));
}
const report={schema:'aleria.public-character-duplicate-review',capturedAt:new Date().toISOString(),counts:{livePublic:live.length,localPublic:local.length},
  liveDuplicateWorldIdentities:groups(live,worldId),liveActiveExactNames:groups(live.filter(row=>!row.archived),row=>normalize(row.name)),
  localDuplicateWorldIdentities:groups(local,worldId),localActiveExactNames:groups(local.filter(row=>!row.archived),row=>normalize(row.name)),
  liveRegisteredAliasGroups:projectRegistry.flatMap(record=>{const ids=new Set(record.firestoreDocumentIds||[]),members=live.filter(row=>!row.archived&&ids.has(row.id));
    return members.length>1?[{registeredCanonicalId:record.firestoreDocumentId,records:members.map(row=>({id:row.id,name:row.name,worldPersonId:worldId(row),title:row.title||''}))}]:[];}),
  conclusions:{confirmedRetirements:CONFIRMED_CHARACTER_RETIREMENTS.map(row=>row.legacyId),
    unresolved:[{ids:['N11mTG3vo2rLq2eQxOXE','oVvNboWTUionb0PCZDf7'],reason:'Display name Meurig, but biography describes Odyar. Already inconsistent in original August and September archive sources. No identity correction or retirement inferred.'}],
    namesakePreserved:'Gethin Draenmelyn is a separate registered person born 1725, distinct from Gethin Draig born 1722.'}};
const target=new URL('public-duplicate-review.json',import.meta.url);
fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({path:fileURLToPath(target),counts:report.counts,liveDuplicateWorldGroups:report.liveDuplicateWorldIdentities.length,liveActiveExactNameGroups:report.liveActiveExactNames.length,localDuplicateWorldGroups:report.localDuplicateWorldIdentities.length,localActiveExactNameGroups:report.localActiveExactNames.length}));
