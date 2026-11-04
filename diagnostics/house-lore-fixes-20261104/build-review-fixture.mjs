import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
const root = new URL('../../', import.meta.url), base = new URL('./', import.meta.url);
const json = async url => JSON.parse(await readFile(url, 'utf8'));
const plan = await json(new URL('integration-plan.json',base));
const inventory = await json(new URL('Stammbäume/assets/data/source-inventories/house-lore-corrections-20261104.json',root));
const original = await json(new URL('../house-lore-audit-20261103/shared-identity-review.json',base));
const before = await json(new URL('before-public-data.json',base));
const supplement = await json(new URL('auxiliary-scope-supplement.json',base));
const ids = new Set(plan.affectedHouseIds), records = new Map(FAMILY_REGISTRY.map(row => [row.id,row]));
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const graphKeys = ['persons','partnerships','parentages','houses','timeJumps','cadetBranches'];
const previousHashes = new Map();
for (const path of ['klaueninsel-house-pages-20261103/before.json', 'klaueninsel-house-pages-20261103/origin-before.json',
  'silberinsel-house-pages-20261103/before.json', 'sonnenkueste-house-pages-20261103/before.json']) {
  const rows = await json(new URL('diagnostics/'+path, root));
  for (const row of rows) if (ids.has(row.id)) {
    if (!previousHashes.has(row.id)) previousHashes.set(row.id,new Set());
    previousHashes.get(row.id).add(row.graphFingerprint);
  }
}
for (const name of ['leitheach','kronental','kraehenmoor','schwarzfenn','ivarsheim','roriksheim']) {
  const test = await readFile(new URL(`Familien Häuser und Clans/tests/${name}-house-pages.test.mjs`,root),'utf8');
  const path = test.match(/fixtures\/[^'"\n]+\.json/)?.[0];
  if (!path) throw new Error(`Review fixture missing ${name}`);
  const fixture = await json(new URL('Familien Häuser und Clans/tests/'+path,root));
  for (const row of [...fixture.records,...(fixture.relatedRecords||[])]) {
    if (!ids.has(row.id)) continue;
    if (!previousHashes.has(row.id)) previousHashes.set(row.id,new Set());
    previousHashes.get(row.id).add(row.graphFingerprint);
  }
}
const families = Object.fromEntries(plan.affectedHouseIds.map(id=>{
  const family = records.get(id).family;
  return [id,{previousGraphFingerprints:[...(previousHashes.get(id)||[])],
    graphFingerprint:sha(Object.fromEntries(graphKeys.map(key=>[key,family[key]||[]]))),
    biographyFingerprint:sha(family.extensions.houseBiographyModule||null),
    biographySourceRevision:plan.sources.find(row=>row.id===id).revision,contentVersion:plan.contentVersion}];
}));
const preservedCounterpartConflicts = original.findings.filter(row=>row.status==='confirmed-current-counterpart-conflict')
  .map(row=>({worldPersonId:row.worldPersonId,fields:Object.keys(row.fields),entries:row.entries.map(entry=>{
    const person=records.get(entry.familyId).family.persons.find(person=>person.id===entry.personId);
    const values=Object.fromEntries(Object.keys(row.fields).map(field=>[field,entry[field]]));
    for(const [field,value]of Object.entries(values))if(person[field]!==value)throw new Error(`Unapproved counterpart alignment ${entry.familyId}/${entry.personId}/${field}`);
    return {familyId:entry.familyId,personId:entry.personId,name:entry.name,values};
  })}));
const protectedChildren = [
  ['haus-dal-ceardaiocht','wiomar-ceardaiocht','1630'],['haus-dal-ceardaiocht','wunaire-ceardaiocht','1632'],['haus-dal-ceardaiocht','seamus-ceardaiocht','1634'],
  ['haus-draig','siana-draig','1725'],['haus-neidr','prynhawn-neidr','1608'],['haus-morforwyn','ffeston-morforwyn','1633'],
  ['haus-canwyll','glesni-canwyll','1669'],['haus-tiwna','gavin-tiwna','1651'],['haus-pendrag','gawain-pendragon','1551'],
  ['haus-varangr','olesja-varangr','1723'],['haus-sturmgeborene','elinborg-sturmgeborene','1665'],['haus-grendel','thordis-grendel','1630'],
  ['haus-nachtjaeger','kjartan-nachtjaeger','1648'],['haus-nachtjaeger','svandis-nachtjaeger','1651'],['haus-vangandr','torger-vangandr','1700']
].map(([familyId,personId,birth])=>({familyId,personId,birth}));
for(const row of protectedChildren){const p=records.get(row.familyId).family.persons.find(p=>p.id===row.personId);if(!p||p.birth!==row.birth)throw new Error(`Child anchor mismatch ${row.familyId}/${row.personId}`);}
const fixture={schema:'aleria.authorized-house-lore-review',date:'2026-11-04',publicOnly:true,
  authority:'Explicit user decisions; the previous import fixtures and original audits remain unchanged.',
  families,changes:inventory.changes,protectedChildren,preservedCounterpartConflicts,
  previousRevisions:Object.fromEntries([...before.records,...supplement.records].filter(row=>ids.has(row.id)).map(row=>[row.id,row.sourceRevision]))};
await writeFile(new URL('Familien Häuser und Clans/tests/fixtures/house-lore-corrections-20261104.json',root),JSON.stringify(fixture,null,2)+'\n');
await writeFile(new URL('remaining-twenty-counterparts.json',base),JSON.stringify({status:'listed-only-no-alignment',
  count:preservedCounterpartConflicts.length,findings:preservedCounterpartConflicts},null,2)+'\n');
console.log(JSON.stringify({families:ids.size,changes:inventory.changes.length,protectedChildren:protectedChildren.length,
  remainingUnmodifiedConflicts:preservedCounterpartConflicts.length}));
