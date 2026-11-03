import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectEquipmentCharacterRecord } from '../lib/character-equipment-record-projection.mjs';
import { mergeCharacterRecordProjections } from '../lib/character-record-projections.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)), database=resolve(root,'CharakterDatenbank'), inputs=new Map();
async function read(path){const text=await readFile(path,'utf8');inputs.set(path,text);return JSON.parse(text);}
const registry=await read(resolve(database,'registry.json')),snapshot=await read(resolve(database,'generated/characters.snapshot.json')),report=await read(resolve(database,'generated/sync-report.json'));
const receipt=await read(resolve(root,'diagnostics/combat-sheets-20261102/silberhirsch-owner-correction.json'));
assert(receipt.verified);assert.equal(receipt.characters.length,2);
const projections=[],exports=[];
for(const remote of receipt.characters){
 const rows=registry.records.filter(row=>row.firestoreDocumentId===remote.id);assert.equal(rows.length,1);
 const row=rows[0],record=await read(resolve(database,row.path)),person=snapshot.characters.find(character=>character.id===remote.id);
 const incoming=remote.inventory.items.find(item=>item.id===receipt.itemId);
 const inventory=structuredClone(record.character.inventory);
 inventory.items=inventory.items.filter(item=>item.id!==receipt.itemId);
 if(incoming)inventory.items.push(structuredClone(incoming));
 inventory.revision=Math.max(inventory.revision||0,remote.inventory.revision||0);
 const projected=projectEquipmentCharacterRecord({record,snapshotCharacter:person,path:row.path,inventory,includeCombatProfile:false,
   sourcePath:`Charakter Archiv Exporte/Silberhirsch Eigentum 2026-11-02/${remote.id}.json`,now:receipt.committedAt});
 projections.push(projected.projection);exports.push(projected.exported);
}
const result=mergeCharacterRecordProjections({registry,snapshot,report},projections,exports,snapshot.charTabs);
const candidates=[...result.records.map(entry=>[resolve(database,entry.path),entry.record]),[resolve(database,'registry.json'),result.registry],
 [resolve(database,'generated/characters.snapshot.json'),result.snapshot],[resolve(database,'generated/sync-report.json'),result.report],...exports.map(entry=>[resolve(root,entry.sourcePath),entry])];
const writes=[];
for(const [path,value]of candidates){let prior=inputs.get(path);if(prior===undefined)prior=await readFile(path,'utf8').catch(error=>{if(error.code!=='ENOENT')throw error;return '';});
 const text=JSON.stringify(value,null,2)+'\n';if(text!==prior)writes.push([path,text]);}
if(process.argv.includes('--check'))assert.equal(writes.length,0,'Lokale Silberhirsch-Zuordnung ist veraltet.');
else{for(const [path,text]of inputs)assert.equal(await readFile(path,'utf8'),text,'Quelle wurde inzwischen geändert.');
 for(const [path,text]of writes){await mkdir(dirname(path),{recursive:true});await writeFile(path,text);}}
console.log(JSON.stringify({checked:process.argv.includes('--check'),profiles:2,changedFiles:writes.length,owner:'Oweta Draig'}));
