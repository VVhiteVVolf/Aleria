import { mkdir, writeFile } from 'node:fs/promises';
import { createPublicContentReadClient } from '../../firebase/scripts/content/content-publication-client.mjs';
import { decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
import { REVIEWED_CHARACTER_TRAITS } from '../../AleriaAlmanach/modules/character-trait-review/reviewed-character-traits.js';
import { reviewedCharacterTraits } from '../../AleriaAlmanach/modules/character-trait-review/character-trait-review-model.js';
import { isDeepStrictEqual } from 'node:util';
const client=createPublicContentReadClient(), directory=new URL('./',import.meta.url);
const after=process.argv.includes('--after');
await mkdir(directory,{recursive:true});
const result={capturedAt:new Date().toISOString(),collections:{}};
for(const collection of ['characters','creatures']){
 const rows=await client.request(':runQuery',{structuredQuery:{from:[{collectionId:collection}],limit:1000}});
 const documents=rows.flatMap(row=>row.document?[row.document]:[]);
 if(documents.length>=1000)throw Error('Die Prüfung benötigt eine vollständige Pagination.');
 const records=documents.map(document=>({...decodeFirestoreFields(document.fields||{}),id:document.name.split('/').at(-1)}));
 const profiles=records.filter(record=>Object.keys(record.combatProfile||{}).length);
 result.collections[collection]={total:records.length,documents:documents.filter(document=>profiles.some(record=>document.name.endsWith('/'+record.id))),records:profiles};
}
await writeFile(new URL(after?'online-after.json':'online-before.json',directory),JSON.stringify(result,null,2)+'\n');
if(after)console.log(JSON.stringify(Object.fromEntries(Object.entries(result.collections).map(([key,value])=>[key,{total:value.total,profiles:value.records.length}]))));
else {
for(const [collection,{total,records}]of Object.entries(result.collections))console.log(JSON.stringify({collection,total,profiles:records.length,
 aboveLevelOne:records.filter(record=>Number(record.level||record.combatProfile.progression?.level||1)>1).map(record=>({id:record.id,name:record.name,
 level:record.level||record.combatProfile.progression?.level,revision:record.combatProfile.revision,development:record.combatProfile.progression?.development?.mode,
 quirks:record.combatProfile.quirks?.map(entry=>({id:entry.id,name:entry.name,icon:entry.icon})),
 abilities:record.combatProfile.abilities?.map(entry=>({id:entry.id,name:entry.name})),techniques:record.combatProfile.techniques?.length}))}));
console.log(JSON.stringify({traitReview:REVIEWED_CHARACTER_TRAITS.map(assignment=>{
 const record=result.collections.characters.records.find(record=>record.id===assignment.onlineId);
 return {name:assignment.name,found:!!record,matches:record?isDeepStrictEqual(record.combatProfile.quirks,reviewedCharacterTraits(assignment)):false,
 expected:assignment.traits,actual:record?.combatProfile.quirks?.map(entry=>entry.id)};
})}));
}
