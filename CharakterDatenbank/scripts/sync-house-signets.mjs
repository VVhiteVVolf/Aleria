import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { resolve,relative,dirname,isAbsolute,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectHouseSignetDatabase } from '../../AleriaAlmanach/modules/house-knight-rings/house-ring-database.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),database=resolve(root,'CharakterDatenbank');
const inputs=new Map();
async function read(path){const text=await readFile(path,'utf8');inputs.set(path,text);return JSON.parse(text);}
const registry=await read(resolve(database,'registry.json')),snapshot=await read(resolve(database,'generated/characters.snapshot.json')),
 report=await read(resolve(database,'generated/sync-report.json'));
const audit=resolve(root,'diagnostics/house-knight-rings-20261102');
const prepared=await read(resolve(audit,'prepared-characters.json')),published=await read(resolve(audit,'online-after.json')),
 verification=await read(resolve(audit,'publication-verification.json'));
const corrections=[await read(resolve(audit,'gildas-icon-correction.json'))];
const records=[];
for(const target of prepared.targets.filter(target=>target.localId)){
 const rows=registry.records.filter(row=>row.firestoreDocumentId===target.localId);
 if(rows.length!==1)throw Error(`Lokaler Index nicht eindeutig: ${target.name}`);
 const path=resolve(database,rows[0].path),within=relative(resolve(database,'records'),path);
 if(!within||isAbsolute(within)||within.startsWith(`..${sep}`)||!path.endsWith(`${sep}character.json`))throw Error('Aktenpfad außerhalb des Registers.');
 records.push(await read(path));
}
const result=projectHouseSignetDatabase({registry,snapshot,report,records,prepared,published,verification,corrections});
const candidates=[...result.records.map(record=>[resolve(database,record.path),record.record]),
 [resolve(database,'registry.json'),result.registry],[resolve(database,'generated/characters.snapshot.json'),result.snapshot],
 [resolve(database,'generated/sync-report.json'),result.report],...result.exports.map(entry=>[resolve(root,entry.sourcePath),entry])];
const writes=[];
for(const [path,data]of candidates){let prior=inputs.get(path);if(prior===undefined){try{prior=await readFile(path,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}}
 const text=JSON.stringify(data,null,2)+'\n';if(prior!==text)writes.push([path,text]);}
if(process.argv.includes('--check')){if(writes.length)throw Error(`Siegelring-Projektion veraltet: ${writes.map(([path])=>relative(root,path)).join(', ')}`);}
else{
 for(const [path,text]of inputs)if(await readFile(path,'utf8')!==text)throw Error('Eine Quelle wurde inzwischen geändert.');
 for(const [path,text]of writes){await mkdir(dirname(path),{recursive:true});await writeFile(path,text);}
 await writeFile(resolve(audit,'local-projection-verification.json'),JSON.stringify(result.verification,null,2)+'\n');
}
console.log(JSON.stringify({checked:process.argv.includes('--check'),changedFiles:writes.length,...result.verification,unlinkedNames:result.unlinked.map(row=>row.target.name)}));
