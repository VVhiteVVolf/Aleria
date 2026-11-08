import assert from 'node:assert/strict';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { resolve,relative,dirname,sep } from 'node:path';
import { fileURLToPath,pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { projectTailoringCharacterDatabase } from '../modules/gwniwr-maerllys/character-database.mjs';
import { buildTailoringCharacterExports } from '../modules/gwniwr-maerllys/characters.mjs';
const workspace=fileURLToPath(new URL('../../',import.meta.url));
const indices=['CharakterDatenbank/registry.json','CharakterDatenbank/generated/characters.snapshot.json','CharakterDatenbank/generated/sync-report.json'];
const json=v=>JSON.stringify(v,null,2)+'\n',sha=b=>createHash('sha256').update(b).digest('hex');
export async function prepareTailoringCharacters({root=workspace,check=false,apply=false}={}){
 assert.ok(!(check&&apply));root=resolve(root);const inputs=new Map();
 async function read(p){const b=await readFile(resolve(root,p));inputs.set(p,b);return JSON.parse(b);}
 const [registry,snapshot,report]=await Promise.all(indices.map(read));
 const {FAMILY_REGISTRY}=await import(pathToFileURL(resolve(root,'Stammbäume/assets/js/data/families.registry.js')).href);
 const exports=buildTailoringCharacterExports(FAMILY_REGISTRY,snapshot.characters),selected=new Set(exports.map(e=>e.character.id));
 const existingRecords=await Promise.all(registry.records.filter(r=>selected.has(r.firestoreDocumentId)).map(r=>read(`CharakterDatenbank/${r.path}`)));
 const result=projectTailoringCharacterDatabase({registry,snapshot,report,existingRecords},FAMILY_REGISTRY);
 const outputs=[...result.exports.map(e=>[e.sourcePath,e]),...result.records.map(e=>[`CharakterDatenbank/${e.path}`,e.record]),...[result.registry,result.snapshot,result.report].map((v,i)=>[indices[i],v])];
 assert.equal(new Set(outputs.map(([p])=>p)).size,outputs.length);
 const changed=[];
 for(const[p,data]of outputs){
  assert.ok(p.startsWith('CharakterDatenbank/')||p.startsWith('Charakter Archiv Exporte/Gwniwr-Maerllys/'));
  const target=resolve(root,p),within=relative(root,target);assert.ok(within&&!within.startsWith(`..${sep}`)&&within!=='..');
  const b=Buffer.from(json(data)),old=await readFile(target).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
  if(!old?.equals(b))changed.push({path:p,beforeSha256:old?sha(old):null,afterSha256:sha(b)});
  if(check)assert.ok(old?.equals(b),'Veraltete Schneiderfiguren-Projektion '+p);
 }
 if(apply){for(const[p,b]of inputs)assert.ok(b.equals(await readFile(resolve(root,p))),'Parallel veränderte Basis '+p);
  for(const[p,data]of outputs){if(!changed.some(e=>e.path===p))continue;const target=resolve(root,p);await mkdir(dirname(target),{recursive:true});await writeFile(target,json(data));}}
 return {feature:'gwniwr-maerllys-20261108',mode:check?'check':apply?'apply':'plan',newCount:result.newCount,updatedCount:result.updatedCount,total:31,
  preservedForeign:snapshot.characters.filter(c=>!selected.has(c.id)).length,paths:outputs.map(([p])=>p),changed,noProductionWrites:true};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const args=process.argv.slice(2),value=k=>args.includes(k)?args[args.indexOf(k)+1]:undefined;
 const result=await prepareTailoringCharacters({root:value('--root'),apply:args.includes('--apply'),check:args.includes('--check')});
 if(value('--report'))await writeFile(resolve(value('--report')),json(result));
 console.log(JSON.stringify({mode:result.mode,newCount:result.newCount,updatedCount:result.updatedCount,total:result.total,paths:result.paths.length,changed:result.changed.length,preservedForeign:result.preservedForeign}));
}
