import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createHouseBiography} from '../../Familien Häuser und Clans/modules/house-content/house-content-outputs.mjs';
const base=new URL('./',import.meta.url),root=new URL('../../',import.meta.url);
const before=JSON.parse(await readFile(new URL('before.json',base),'utf8'));
const version='20261104-content-lore-v1',changes=[],plan=[];
const allowed={
  'haus-varulv':['biographySummary.history','sections.conflictsAlliances'],
  'haus-feuerherz':['biographySummary.holdings','sections.holdings','sections.knighthood'],
  'haus-fiadhrach':['sections.overview']
};
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function differences(old,value,path='') {
  if(JSON.stringify(old)===JSON.stringify(value))return [];
  if(old&&value&&typeof old==='object'&&typeof value==='object'&&!Array.isArray(old)&&!Array.isArray(value))
    return [...new Set([...Object.keys(old),...Object.keys(value)])].flatMap(key=>differences(old[key],value[key],path?`${path}.${key}`:key));
  return [{field:path,before:old,after:value}];
}
for(const source of before.sources) {
  const url=new URL(source.path,root),content=(await import(url)).HOUSE_CONTENT;
  const rows=differences(source.content,content).filter(row=>!['contentVersion','biographySourceRevision','biographyPreviousDefaultFingerprints'].includes(row.field));
  if(rows.length!==allowed[source.id].length||rows.some(row=>!allowed[source.id].includes(row.field)))throw new Error(`Unexpected authoring edit ${source.id}`);
  changes.push(...rows.map(row=>({familyId:source.id,path:source.path,...row})));
  const old=before.records.find(row=>row.id===source.id);
  const biographyChanged=hash(createHouseBiography(content))!==old.biographyFingerprint;
  let text=await readFile(url,'utf8');
  text=text.replace(/("contentVersion"\s*:\s*)"[^"]*"/,`$1"${version}"`);
  if(biographyChanged) {
    text=text.replace(/("biographySourceRevision"\s*:\s*)\d+/,`$1${source.revision}`);
    const fingerprints=[...new Set([...(content.biographyPreviousDefaultFingerprints||[]),old.biographyDefaultFingerprint])];
    text=text.replace(/("biographyPreviousDefaultFingerprints"\s*:\s*)\[[\s\S]*?\]/,(_,prefix)=>prefix+JSON.stringify(fingerprints));
  }
  plan.push({id:source.id,path:source.path,biographyChanged,previousRevision:old.sourceRevision,
    biographySourceRevision:biographyChanged?source.revision:content.biographySourceRevision,contentVersion:version});
  await writeFile(url,text);
}
const territorial=JSON.parse(await readFile(new URL('gwaedlyd-changes.json',base),'utf8'));
const inventory={schema:'aleria.reviewed-house-content-lore-corrections',date:'2026-11-04',
  authority:'User approved Varulv faction correction, Feuerherz diversified economy, Gwaedlyd shark symbolism and Fiadhrach albische Herkunft. Leitheach editorial notes are unimportant and unchanged.',
  sourceFields:changes,territorialEvidence:'diagnostics/house-content-lore-fixes-20261104/gwaedlyd-changes.json',
  territorialSource:before.territory.path,contentVersion:version,houseSources:plan,
  preserved:['All family identities, relations, dates and profiles','Existing illustrations','Personal biographies and explicit removals','Previous audit and original source archives','Both Leitheach editorial notes']};
await writeFile(new URL('Stammbäume/assets/data/source-inventories/house-content-lore-corrections-20261104.json',root),JSON.stringify(inventory,null,2)+'\n');
await writeFile(new URL('integration-plan.json',base),JSON.stringify({version,changes:changes.length,houseSources:plan,gwaedlydReceipt:!!territorial},null,2)+'\n');
console.log(JSON.stringify({houseSources:plan.length,houseTextFields:changes.length,biographiesChanged:plan.filter(row=>row.biographyChanged).length,plan}));
