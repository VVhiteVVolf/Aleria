import { readFile, writeFile } from 'node:fs/promises';
import { decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
const inventory=JSON.parse(await readFile(new URL('inventory.json',import.meta.url),'utf8'));
const snapshot=JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
const base='https://firestore.googleapis.com/v1/projects/aleriaprojekt/databases/(default)/documents/';
const jobs=[...snapshot.characters.map(c=>({collection:'characters',id:c.id})),...inventory.modules.map(m=>({collection:'module_store_entries',id:m.entry.id}))];
const characters=[],modules=[];let missing=0;
for(let start=0;start<jobs.length;start+=12){
 await Promise.all(jobs.slice(start,start+12).map(async ({collection,id})=>{
  const mask=collection==='characters'?'?mask.fieldPaths=name&mask.fieldPaths=biography&mask.fieldPaths=identity&mask.fieldPaths=genealogy&mask.fieldPaths=portrait':'?mask.fieldPaths=entryJson';
  const res=await fetch(base+collection+'/'+encodeURIComponent(id)+mask,{signal:AbortSignal.timeout(20000)});
  if(res.status===404){missing++;return;}if(!res.ok)throw Error('Public biography read: '+res.status);
  const doc=await res.json(),data=decodeFirestoreFields(doc.fields);
  if(collection==='characters') { if(data.biography?.biography) characters.push({id,...data,updateTime:doc.updateTime}); }
  else { const entry=JSON.parse(data.entryJson||'null'); if(entry?.pages?.some(p=>p.biographyPage))modules.push({id,entry,updateTime:doc.updateTime}); }
 }));
}
await writeFile(new URL('online-biographies.json',import.meta.url),JSON.stringify({characters,modules},null,2)+'\n');
console.log(JSON.stringify({checked:jobs.length,characters:characters.length,moduleBiographies:modules.length,missing}));
