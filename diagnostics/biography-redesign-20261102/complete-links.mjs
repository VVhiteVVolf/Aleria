import { readFile, writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyPersonCandidate } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
const source=new URL('../../js/biography/sources/public-biographies.json',import.meta.url);
const catalog=JSON.parse(await readFile(source,'utf8'));
const candidates=FAMILY_REGISTRY.flatMap(f=>(f.family?.persons||[]).map(p=>createFamilyPersonCandidate(f,p)));
for(const row of catalog.entries){
 for(const c of candidates.filter(c=>row.worldPersonIds.includes(c.worldPersonId)))if(!row.personIds.includes(c.personId))row.personIds.push(c.personId);
}
const missing=catalog.entries.filter(r=>!r.characterIds.length);
const names=[...new Set(missing.flatMap(r=>[r.name,...candidates.filter(c=>r.worldPersonIds.includes(c.worldPersonId)).map(c=>c.recordedName)]).filter(Boolean))];
const documents=[];
for(let start=0;start<names.length;start+=25){
 const response=await fetch('https://firestore.googleapis.com/v1/projects/aleriaprojekt/databases/(default)/documents:runQuery',{
  method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(20000),
  body:JSON.stringify({ structuredQuery: {
    from: [{ collectionId: 'characters' }],
    select: { fields: ['name','identity','genealogy','biography'].map(fieldPath=>({fieldPath})) },
    where: { fieldFilter: { field: { fieldPath:'name' }, op:'IN', value: {
      arrayValue: { values:names.slice(start,start+25).map(stringValue=>({stringValue})) }
    } } }
  } })
 });
 if(!response.ok)throw Error('Public identity read: '+response.status);
 for(const item of await response.json())if(item.document)documents.push({id:item.document.name.split('/').at(-1),...decodeFirestoreFields(item.document.fields)});
}
for(const c of documents){
 const world=c.identity?.worldPersonId||c.genealogy?.worldPersonId;
 let row=world?missing.find(r=>r.worldPersonIds.includes(world)):null;
 if(!row){const matching=missing.filter(r=>r.name===c.name);if(matching.length===1&&documents.filter(d=>d.name===c.name).length===1)row=matching[0];}
 if(row&&!row.characterIds.includes(c.id))row.characterIds.push(c.id);
}
for(const row of catalog.entries)row.personIds=row.personIds.filter(Boolean).filter(id=>catalog.entries.filter(r=>r.personIds.includes(id)).length===1);
await writeFile(source,JSON.stringify(catalog,null,2)+'\n');
await writeFile(new URL('additional-online-identities.json',import.meta.url),JSON.stringify(documents,null,2)+'\n');
console.log(JSON.stringify({linked:documents.map(c=>({name:c.name,id:c.id})),characters:catalog.entries.filter(r=>r.characterIds.length).length,tree:catalog.entries.filter(r=>r.personIds.length).length}));
