import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { decodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { GWYNTHOR_SEVEN } from '../../../AleriaAlmanach/modules/gwynthor-seven/roster.mjs';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyPersonCandidate } from '../../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
const candidates=GWYNTHOR_SEVEN.map(p=>{const r=FAMILY_REGISTRY.find(r=>r.id===p.familyId);return createFamilyPersonCandidate(r,r.family.persons.find(x=>x.id===p.personId));});
const names=[...new Set(candidates.flatMap(c=>[c.displayName,c.recordedName]))];
// /characters is publicly readable by the project Rules. This read-only query
// needs no cached editor credentials and exposes no publication capability.
async function query(fieldPath,values){
 const response=await fetch('https://firestore.googleapis.com/v1/projects/aleriaprojekt/databases/(default)/documents:runQuery',{
  method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(30000),
  body:JSON.stringify({structuredQuery:{from:[{collectionId:'characters'}],where:{fieldFilter:{field:{fieldPath},op:'IN',value:{arrayValue:{values:values.map(stringValue=>({stringValue}))}}}}}})
 });
 if(!response.ok)throw Error(`Öffentliche Figurenabfrage: HTTP ${response.status}`);
 return response.json();
}
const rows=(await Promise.all([query('name',names),query('identity.worldPersonId',candidates.map(c=>c.worldPersonId)),query('genealogy.worldPersonId',candidates.map(c=>c.worldPersonId))])).flat();
const characters=[...new Map(rows.filter(r=>r.document).map(r=>{const c={id:r.document.name.split('/').at(-1),...decodeFirestoreFields(r.document.fields)};return[c.id,c];})).values()];
for(const c of characters) if(!candidates.some(p=>[p.displayName,p.recordedName].includes(c.name)||p.worldPersonId===(c.identity?.worldPersonId||c.genealogy?.worldPersonId)))throw Error('Unerwartete Figur.');
const folder=new URL('../../../diagnostics/gwynthor-seven-20261102/',import.meta.url);await mkdir(folder,{recursive:true});
await writeFile(new URL(process.argv.includes('--verify')?'online-verified.json':'online-before.json',folder),JSON.stringify({capturedAt:new Date().toISOString(),characters},null,2)+'\n');
if(process.argv.includes('--verify')){
 const before=JSON.parse(await readFile(new URL('online-before.json',folder),'utf8'));
 const key=rows=>JSON.stringify(rows.map(c=>c.id).sort());
 if(key(before.characters)!==key(characters))throw Error('Neue Online-Identität gefunden: Figurenplan erneut abgleichen.');
}
console.log(JSON.stringify(characters.map(c=>({id:c.id,name:c.name,worldPersonId:c.identity?.worldPersonId||c.genealogy?.worldPersonId,level:c.combatProfile?.progression?.level,items:c.inventory?.items?.length}))));
