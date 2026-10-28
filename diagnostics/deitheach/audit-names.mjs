import {readFile,writeFile,readdir} from 'node:fs/promises';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
import {houses} from '../../Vorschau/Deitheach/house-data.mjs';
import {counties,settlements} from '../../Vorschau/Deitheach/territory-data.mjs';
const norm=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/^(haus|clan)\s+/,'').replace(/[^a-z]/g,'');
const common=new Set(['coill','coille','cladach','braigh','creag','creagan','gleann','bealach','achadh','iorras','sliabh','srath','inver']);
const words=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().split(/[^a-z]+/).filter(w=>w.length>=5&&!common.has(w));
const profiles=[];
const clans=[];
const add=(r,source)=>{
 clans.push({name:r.title,source});
 const p=r.houseProfile??{};
 for(const name of [...(r.folderPath??[]),p.seat,p.barony,p.county,p.kingdom])if(name)profiles.push({name,source});
};
FAMILY_REGISTRY.forEach(r=>add(r,'active family registry'));
const published=JSON.parse(await readFile(new URL('../../Stammbäume/assets/data/published-families/registry.json',import.meta.url),'utf8'));
published.families.forEach(r=>add(r,'published family registry'));
for(const entry of await readdir(new URL('../../Vorschau/',import.meta.url),{withFileTypes:true})){
 if(!entry.isDirectory()||['Deitheach','shared','tests'].includes(entry.name))continue;
 for(const file of ['house-data.mjs','territory-data.mjs']){
  try{
   const module=await import(new URL(`../../Vorschau/${entry.name}/${file}`,import.meta.url));
   for(const h of module.houses??[])clans.push({name:h.name,source:`Vorschau/${entry.name}`});
   for(const r of [...(module.counties??[]),...(module.settlements??[])]){
    if(r.name)profiles.push({name:r.name,source:`Vorschau/${entry.name}`});
    if(r.regionName)profiles.push({name:r.regionName,source:`Vorschau/${entry.name}`});
   }
  }catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND')throw error;}
 }
}
const distance=(a,b)=>{let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]!==b[j-1]));row=next;}return row[b.length];};
const names=[...counties.map(c=>c.name),...settlements.flatMap(s=>[s.name,s.regionName])];
const locations=names.map(name=>({name,exact:profiles.filter(p=>norm(p.name)===norm(name)),near:profiles.filter(p=>{
 const a=norm(name),b=norm(p.name);if(distance(a,b)<=2)return true;
 return words(name).some(w=>words(p.name).some(v=>Math.max(w.length,v.length)>=6&&distance(w,v)<=1));
})}));
const families=houses.map(h=>({name:h.name,isNew:!!h.isNew,exact:clans.filter(p=>norm(p.name)===norm(h.name))}));
const report={checkedAt:new Date().toISOString(),registeredFamilies:FAMILY_REGISTRY.length,publishedFamilies:published.families.length,locationRecords:profiles.length,locations,families,qualifiedNameNote:'Ard Trodach (Leitheach) and Droch Trodach are distinct clan names; shared surname roots are not silently renamed.'};
await writeFile(new URL('name-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({locations:locations.length,exact:locations.filter(n=>n.exact.length),near:locations.filter(n=>n.near.length),clanDuplicates:families.filter(n=>n.exact.length)},null,2));
