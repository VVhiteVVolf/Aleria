import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
const base=new URL('./',import.meta.url),root=new URL('../../',import.meta.url);
const before=JSON.parse(await readFile(new URL('before.json',base),'utf8'));
const metadataContainers=JSON.parse(await readFile(new URL('metadata-containers.json',base),'utf8')).families;
const previous=JSON.parse(await readFile(new URL('Stammbäume/assets/data/source-inventories/house-lore-corrections-20261104.json',root),'utf8'));
const records=new Map(FAMILY_REGISTRY.map(row=>[row.id,row]));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function protectedValue(family) {
  const copy=structuredClone(family),id=copy.document.id;
  for(const person of copy.persons) if(before.targets[`${id}/${person.id}`]) {delete person.status;delete person.death;}
  for(const edge of copy.partnerships) if(before.partnerships[`${id}/${edge.id}`]) {delete edge.status;delete edge.end;}
  const strip=value=>Array.isArray(value)?value.map(strip):!value||typeof value!=='object'?value:
    Object.fromEntries(Object.entries(value).filter(([key])=>!key.startsWith('registryManaged')&&!['sourceRevision','houseLifeStatusCorrectionInventory'].includes(key)).map(([key,value])=>[key,strip(value)]));
  const protectedCopy=strip(copy);
  for(const path of metadataContainers[id]||[]) {
    const parent=path.slice(0,-1).reduce((value,key)=>value[key],protectedCopy),key=path.at(-1);
    if(JSON.stringify(parent[key])==='{}')delete parent[key];
  }
  return protectedCopy;
}
const failures=[];
for(const old of before.records) {
  const family=records.get(old.id)?.family;
  if(!family) {failures.push(`Missing ${old.id}`);continue;}
  if(hash(protectedValue(family))!==old.protectedHash) failures.push(`Unapproved field changed: ${old.id}`);
  for(const entity of old.targets) {
    const person=family.persons.find(row=>row.id===entity.id),expected=before.targets[`${old.id}/${entity.id}`];
    for(const [field,value] of Object.entries(expected)) if(person[field]!==value) failures.push(`${old.id}/${entity.id}/${field}`);
    if(person.worldPersonId!==entity.worldPersonId) failures.push(`Identity changed: ${old.id}/${entity.id}`);
  }
  for(const entity of old.partnerships) {
    const edge=family.partnerships.find(row=>row.id===entity.id);
    for(const [field,value] of Object.entries(before.partnerships[`${old.id}/${entity.id}`])) if(edge[field]!==value) failures.push(`${old.id}/${edge.id}/${field}`);
  }
}
for(const row of previous.changes) {
  const family=records.get(row.familyId).family;
  const entity=row.collection==='document'?family.document:family[row.collection].find(entity=>entity.id===row.entityId);
  if(JSON.stringify(entity[row.field])!==JSON.stringify(row.after)) failures.push(`Earlier correction changed: ${row.familyId}/${row.entityId}/${row.field}`);
}
const result={schema:'aleria.house-life-status-preservation',status:failures.length?'failed':'pass',publicRecordsReviewed:before.records.length,
  reviewedPeople:Object.keys(before.targets).length,resolvedCases:before.cases.length,livingCases:before.cases.filter(row=>row.decision==='alive').length,
  retainedConfirmedDeaths:before.cases.filter(row=>row.decision==='dead').length,priorChronologyFieldsPreserved:previous.changes.length,
  unchangedRelationshipAssignments:true,failures};
await writeFile(new URL('preservation.json',base),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1;
