import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
const base=new URL('./',import.meta.url),root=new URL('../../',import.meta.url);
const before=JSON.parse(await readFile(new URL('before.json',base),'utf8'));
const plan=JSON.parse(await readFile(new URL('integration-plan.json',base),'utf8'));
const records=new Map(FAMILY_REGISTRY.map(row=>[row.id,row]));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const graph=family=>Object.fromEntries(['persons','partnerships','parentages','houses','timeJumps','cadetBranches'].map(key=>[key,family[key]||[]]));
const failures=[];
for(const old of before.records) {
  const family=records.get(old.id)?.family;
  if(!family){failures.push(`Missing ${old.id}`);continue;}
  if(hash(graph(family))!==old.graphFingerprint)failures.push(`Graph changed: ${old.id}`);
  if(hash(family.document)!==old.documentFingerprint)failures.push(`Document changed: ${old.id}`);
  if(!plan.houseSources.some(row=>row.id===old.id&&row.biographyChanged)&&hash(family.extensions.houseBiographyModule)!==old.biographyFingerprint)failures.push(`Unselected bio changed: ${old.id}`);
}
const families=Object.fromEntries(plan.houseSources.map(row=>[row.id,{biographyFingerprint:hash(records.get(row.id).family.extensions.houseBiographyModule),
  biographySourceRevision:row.biographySourceRevision,contentVersion:row.contentVersion,biographyChanged:row.biographyChanged,
  ...(row.biographyChanged?{previousBiography:before.records.find(old=>old.id===row.id).biography}:{})}]));
const fixture={schema:'aleria.reviewed-house-content-lore-expectations',date:'2026-11-04',families};
if(failures.length)throw new Error(failures.join('\n'));
await writeFile(new URL('Familien Häuser und Clans/tests/fixtures/house-content-lore-corrections-20261104.json',root),JSON.stringify(fixture,null,2)+'\n');
await writeFile(new URL('preservation.json',base),JSON.stringify({schema:'aleria.house-content-lore-preservation',status:'pass',publicRecords:before.records.length,
  exactFamilyGraphHashes:before.records.length,exactFamilyDocumentHashes:before.records.length,
  updatedBiographies:plan.houseSources.filter(row=>row.biographyChanged).map(row=>row.id),
  unselectedBiographiesPreserved:before.records.length-plan.houseSources.filter(row=>row.biographyChanged).length,failures},null,2)+'\n');
console.log(JSON.stringify({status:'pass',exactGraphs:before.records.length,exactDocuments:before.records.length,biosChanged:2,biosPreserved:before.records.length-2}));
