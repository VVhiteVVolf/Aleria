import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const country=new URL('../',import.meta.url),workspace=new URL('../../../',import.meta.url);
const readJson=async file=>JSON.parse(await readFile(new URL(file,country),'utf8'));
const sha=async file=>createHash('sha256').update(await readFile(file)).digest('hex');
const receipts=await readJson('generation-receipts.json');
const corrections=await readJson('correction-receipts.json');
const revisions=await readJson('revision-receipts.json').catch(error=>{if(error.code==='ENOENT')return {entries:[]};throw error;});
const firstRevision=new Map();
for(const revision of revisions.entries)if(!firstRevision.has(revision.rawTarget))firstRevision.set(revision.rawTarget,revision);
const preservedRaw=rawTarget=>firstRevision.has(rawTarget)
 ?new URL(firstRevision.get(rawTarget).before.generated,workspace):new URL(rawTarget,country);
const corrected=new Set(corrections.entries.map(e=>e.id));
const evidence=[];
for(const receipt of receipts.entries){
 const archive=corrected.has(receipt.id)
  ?new URL(`diagnostics/aeldrunmar/variants/${receipt.id}-v1.png`,workspace)
  :preservedRaw(receipt.rawTarget);
 const hash=await sha(archive);
 if(hash!==await sha(receipt.outputPath))throw Error(`Generatororiginal verändert: ${receipt.id}`);
 evidence.push({id:receipt.id,kind:receipt.kind,archive:fileURLToPath(archive).replaceAll('\\','/'),sha256:hash});
}
for(const receipt of corrections.entries){
 const archive=preservedRaw(receipt.rawTarget),hash=await sha(archive);
 if(hash!==await sha(receipt.outputPath))throw Error(`Korrekturoriginal verändert: ${receipt.id}`);
 evidence.push({id:receipt.id,kind:'correction',archive:receipt.rawTarget,sha256:hash});
}
for(const revision of revisions.entries){
 const archive=new URL(revision.after,workspace),hash=await sha(archive);
 if(hash!==revision.afterSha256||hash!==await sha(revision.outputPath))throw Error(`Revisionsoriginal verändert: ${revision.id}`);
 for(const [kind,path] of Object.entries(revision.before)){
  if(await sha(new URL(path,workspace))!==revision.beforeSha256[kind])throw Error(`Revisionsvorlage verändert: ${revision.id}/${kind}`);
 }
 evidence.push({id:revision.id,kind:'revision',revision:revision.revision,archive:revision.after,sha256:hash});
}
const latestRevision=new Map(revisions.entries.map(e=>[e.rawTarget,e]));
for(const [target,revision] of latestRevision){
 if(await sha(new URL(target,country))!==await sha(new URL(revision.after,workspace)))throw Error(`Aktives Revisionsbild weicht ab: ${revision.id}`);
}
const study=receipts.designStudy,studyHash=await sha(new URL(study.archive,workspace));
if(studyHash!==await sha(study.outputPath))throw Error('Entwurfsstudie verändert');
evidence.push({kind:'design-study',archive:study.archive,sha256:studyHash});
const references=[...new Set([...receipts.entries,...revisions.entries].flatMap(e=>e.references))];
const referenceHashes=await Promise.all(references.map(async path=>({path,sha256:await sha(path)})));
const report={tool:receipts.tool,generated:receipts.entries.length,corrections:corrections.entries.length,revisions:revisions.entries.length,originalsUnchanged:true,evidence,references:referenceHashes};
await writeFile(new URL('diagnostics/aeldrunmar/provenance-audit.json',workspace),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({generated:report.generated,corrections:report.corrections,revisions:report.revisions,originalsUnchanged:true,referenceImages:references.length}));
