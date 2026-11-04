import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url), base = new URL('./', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const previous = await readJson('diagnostics/house-lore-fixes-20261104/remaining-twenty-counterparts.json');
const publicIds = new Set((await readJson('diagnostics/house-lore-fixes-20261104/before-public-data.json')).records.map(row => row.id));
const cases = previous.findings.filter(row => row.fields.includes('status')).map(row => ({
  ...row, decision: ['person--haus-varangr--hadvar-varangr','person--haus-arth--afanen-1660-arth'].includes(row.worldPersonId) ? 'dead' : 'alive',
  death: row.worldPersonId.endsWith('--hadvar-varangr') ? '1713' : row.worldPersonId.endsWith('--afanen-1660-arth') ? '1710' : ''
}));
const targets = Object.fromEntries(cases.flatMap(row => row.entries.map(entry => [
  `${entry.familyId}/${entry.personId}`, { status: row.decision, death: row.death }
])));
const partnerships = {
  'haus-arth/marriage-afanen-elisud': {status:'ended',end:'1710'},
  'haus-sturmgeborene/marriage-ingeborg-hadvar-sturmgeborene': {status:'ended',end:'1713'}
};
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const graph = family => Object.fromEntries(['persons','partnerships','parentages','houses','timeJumps','cadetBranches'].map(key=>[key,family[key]||[]]));
function protectedValue(family) {
  const copy = structuredClone(family), id = copy.document.id;
  for(const person of copy.persons) if(targets[`${id}/${person.id}`]) { delete person.status; delete person.death; }
  for(const edge of copy.partnerships) if(partnerships[`${id}/${edge.id}`]) { delete edge.status; delete edge.end; }
  const strip = value => {
    if(Array.isArray(value)) return value.map(strip);
    if(!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).filter(([key])=> !key.startsWith('registryManaged') && !['sourceRevision','houseLifeStatusCorrectionInventory'].includes(key)).map(([key,value])=>[key,strip(value)]));
  };
  return strip(copy);
}
const records = FAMILY_REGISTRY.filter(row=>publicIds.has(row.id)).map(({id,family})=>({
  id, sourceRevision:family.extensions.sourceRevision,
  graphFingerprint:hash(graph(family)), protectedHash:hash(protectedValue(family)),
  targets:family.persons.filter(person=>targets[`${id}/${person.id}`]).map(person=>({id:person.id,worldPersonId:person.worldPersonId,birth:person.birth,death:person.death,status:person.status,sex:person.sex,visibility:person.visibility||'public'})),
  partnerships:family.partnerships.filter(edge=>partnerships[`${id}/${edge.id}`]).map(edge=>({id:edge.id,status:edge.status,end:edge.end}))
}));
const affected = records.filter(row=>row.targets.length || row.partnerships.length);
const fields = Object.fromEntries(affected.map(row=>[row.id,{revision:row.sourceRevision+1,collections:{
  persons:Object.fromEntries(row.targets.map(person=>[person.id,['status','death']])),
  ...(row.partnerships.length ? {partnerships:Object.fromEntries(row.partnerships.map(edge=>[edge.id,['status','end']]))} : {})
}}]));
await mkdir(base,{recursive:true});
await writeFile(new URL('before.json',base),JSON.stringify({schema:'aleria.life-status-review-before',authority:'User: Im Zweifel lebend; Tod nur bei eindeutiger Evidenz. Jahres- und Geschlechtskonflikte weiterhin nicht angleichen.',cases,targets,partnerships,records},null,2)+'\n',{flag:'wx'});
await writeFile(new URL('Stammbäume/assets/js/modules/house-lore-corrections/house-life-status-correction-fields.js',root),'// Field ownership only; reviewed life-status values remain in canonical family modules.\nexport const HOUSE_LIFE_STATUS_CORRECTION_FIELDS = Object.freeze('+JSON.stringify(fields,null,2)+');\n');
console.log(JSON.stringify({cases:cases.length,alive:cases.filter(row=>row.decision==='alive').length,dead:cases.filter(row=>row.decision==='dead').length,persons:Object.keys(targets).length,families:affected.length,revisions:Object.fromEntries(affected.map(row=>[row.id,row.sourceRevision+1]))}));
