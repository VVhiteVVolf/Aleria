import { readFile,writeFile } from 'node:fs/promises';
import {createHash}from'node:crypto';
import{FAMILY_REGISTRY}from'../../Stammbäume/assets/js/data/families.registry.js';
const base=new URL('./',import.meta.url),root=new URL('../../',import.meta.url);
const json=async url=>JSON.parse(await readFile(url,'utf8'));
const before=await json(new URL('before-public-data.json',base));
const inventory=await json(new URL('Stammbäume/assets/data/source-inventories/house-lore-corrections-20261104.json',root));
const records=new Map(FAMILY_REGISTRY.map(row=>[row.id,row]));
const changed=new Map(inventory.changes.map(row=>[`${row.familyId}/${row.collection}/${row.entityId}/${row.field}`,row.after]));
const managed=new Set(Object.keys(inventory.familyRevisions));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const failures=[];let people=0,unchangedGraphs=0,checkedEdges=0,skippedGenerationGaps=0;
const equal=(actual,expected,label)=>{if(JSON.stringify(actual)!==JSON.stringify(expected))failures.push(label);};
for(const previous of before.records){
  const record=records.get(previous.id),family=record?.family;
  if(!family){failures.push(`Missing record ${previous.id}`);continue;}
  equal(record.title,previous.title,`${record.id}: title`);
  equal(record.folderPath,previous.folderPath,`${record.id}: folders`);
  equal(record.houseProfile,previous.houseProfile,`${record.id}: profile`);
  equal(hash({...family.document,description:undefined}),previous.documentProtectedHash,`${record.id}: protected document fields`);
  equal(family.document.description,changed.get(`${record.id}/document//description`)??previous.description,`${record.id}: description`);
  equal(family.persons.length,previous.persons.length+previous.nonPublicPersonFingerprints.length,`${record.id}: person count`);
  const byId=new Map(family.persons.map(person=>[person.id,person]));
  for(const old of previous.persons){
    const person=byId.get(old.id);if(!person){failures.push(`Missing public person ${record.id}/${old.id}`);continue;}people++;
    for(const field of['birth','death','status','sex','name','title']){
      const key=`${record.id}/persons/${old.id}/${field}`;
      equal(person[field],changed.has(key)?changed.get(key):old[field],key);
    }
    const noteKey=`${record.id}/persons/${old.id}/notes`;
    equal(hash(person.notes),changed.has(noteKey)?hash(changed.get(noteKey)):old.notesHash,noteKey);
    equal(hash({...person,birth:undefined,death:undefined,status:undefined,title:undefined,notes:undefined,extensions:undefined}),old.otherFieldsHash,`${record.id}/${old.id}: other person fields`);
    equal(hash(Object.fromEntries(Object.entries(person.extensions||{}).filter(([key])=>!key.startsWith('registryManaged')))),old.nonManagedExtensionsHash,`${record.id}/${old.id}: nonmanaged extensions`);
  }
  if(!managed.has(record.id)){
    for(const[key,value]of Object.entries(previous.collectionHashes))equal(hash(family[key]),value,`${record.id}: unchanged ${key}`);
    unchangedGraphs++;
  }
}
for(const id of managed){
  const family=records.get(id).family,people=new Map(family.persons.map(person=>[person.id,person]));
  const targetIds=new Set(inventory.changes.filter(row=>row.familyId===id&&row.collection==='persons').map(row=>row.entityId));
  for(const edge of family.parentages){
    if(edge.visibility!=='public'||edge.type!=='biological'||edge.certainty!=='confirmed')continue;
    if(!targetIds.has(edge.childId)&&!edge.parentIds.some(id=>targetIds.has(id)))continue;
    if(family.timeJumps.some(gap=>gap.childIds?.includes(edge.childId))){skippedGenerationGaps++;continue;}
    const child=people.get(edge.childId),year=Number(child?.birth);if(!year||!/^\d{4}$/.test(child.birth))continue;
    for(const parentId of edge.parentIds){const parent=people.get(parentId);if(!parent)continue;
      const birth=/^\d{4}$/.test(parent.birth)?Number(parent.birth):null,death=/^\d{4}$/.test(parent.death)?Number(parent.death):null;
      if(birth!==null&&year-birth<12)failures.push(`${id}/${edge.id}: parental age below 12`);
      if(death!==null&&year>death+(parent.sex==='male'?1:0))failures.push(`${id}/${edge.id}: birth after parental death`);
      checkedEdges++;
    }
  }
}
const report={schema:'aleria.house-lore-final-preservation',reviewedAt:new Date().toISOString(),status:failures.length?'failed':'pass',
  publicRecordsReviewed:before.records.length,publicPersonEntriesReviewed:people,unmanagedRecordsWithExactOriginalCollectionHashes:unchangedGraphs,
  managedFamiliesIncludingPublicMarmueLine:managed.size,authorizedFields:inventory.changes.length,
  targetedBiologicalParentChecks:checkedEdges,explicitGenerationGapsSkipped:skippedGenerationGaps,
  note:'Managed entity metadata changes are intentional. Regional before/after receipts and migration tests cover targeted relationship fields; unmodified records retain exact original collection hashes.',failures};
await writeFile(new URL('final-preservation.json',base),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
