import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
import {houseBiographyDefaultFingerprint} from '../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';
const root=new URL('../../',import.meta.url),base=new URL('./',import.meta.url);
const sources={
  'haus-varulv':'Familien Häuser und Clans/Estryll/Aldrimar/Roriksheim/Rorikstal/Rorikshall/Clan_Varulv/haus.content.mjs',
  'haus-feuerherz':'Familien Häuser und Clans/Estryll/Aldrimar/Kraehenmoor/Jarltumliche_Herrschaft_von_Nebelmoor/Moortal/Clan_Feuerherz/haus.content.mjs',
  'haus-fiadhrach':'Familien Häuser und Clans/Estryll/Aldrimar/Roriksheim/Ausgestorbene_Clans/Glaennath_Alben/Clan_Fiadhrach/haus.content.mjs'
};
const publicIds=new Set(JSON.parse(await readFile(new URL('../house-lore-audit-20261103/public-scope.json',base),'utf8')).records.map(row=>row.id));
const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const graph=family=>Object.fromEntries(['persons','partnerships','parentages','houses','timeJumps','cadetBranches'].map(key=>[key,family[key]||[]]));
const records=FAMILY_REGISTRY.filter(row=>publicIds.has(row.id)).map(({id,family})=>({id,graphFingerprint:hash(graph(family)),
  documentFingerprint:hash(family.document),houseProfileFingerprint:hash(family.document.houseProfile),
  biographyFingerprint:hash(family.extensions.houseBiographyModule),
  ...(sources[id]?{sourceRevision:family.extensions.sourceRevision,biography:family.extensions.houseBiographyModule,
    biographyDefaultFingerprint:houseBiographyDefaultFingerprint(family.extensions.houseBiographyModule),
    metadataOwnership:Object.fromEntries(Object.entries(family.extensions).filter(([key])=>key.startsWith('registryManaged')&&!key.includes('Entity')))}:{})}));
const sourceRecords=await Promise.all(Object.entries(sources).map(async([id,path])=>{
  const source=await import(new URL(path,root)),content=source.HOUSE_CONTENT;
  return {id,path,sha256:hash(await readFile(new URL(path,root),'utf8')),content,
    revision:records.find(row=>row.id===id).sourceRevision+1};
}));
const territory='Kontinente/Estryll/Königreich Cenyr/Grafschaft Graue Weite/Herrschaft der Gwaedlyd/herrschaft.data.mjs';
await mkdir(base,{recursive:true});
await writeFile(new URL('before.json',base),JSON.stringify({schema:'aleria.house-content-fixes-before',date:'2026-11-04',sources:sourceRecords,
  territory:{path:territory,sha256:hash(await readFile(new URL(territory,root),'utf8'))},records},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({records:records.length,sources:sourceRecords.map(row=>({id:row.id,newRevision:row.revision})),metadata:records.filter(row=>sources[row.id]).map(({id,sourceRevision,metadataOwnership})=>({id,sourceRevision,metadataOwnership}))},null,2));
