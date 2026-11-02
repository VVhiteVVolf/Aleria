import { readFile, readdir, writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
const root = new URL('../../', import.meta.url);
const snapshot = JSON.parse(await readFile(new URL('CharakterDatenbank/generated/characters.snapshot.json',root),'utf8'));
const modules = new Map(), biographies=[];
async function scan(folder) {
  for (const entry of await readdir(new URL(folder,root),{withFileTypes:true})) {
    const path=folder+entry.name;
    if(entry.isDirectory()) { await scan(path+'/'); continue; }
    if(!entry.name.endsWith('.json')) continue;
    let data;try{data=JSON.parse(await readFile(new URL(path,root),'utf8'));}catch{continue;}
    if(data.schema==='aleria.biography-module') biographies.push({path,data});
    const entries=[data.module?.entry,data.entry,...(Array.isArray(data.modules)?data.modules.map(x=>x.entry||x):[])].filter(x=>x?.pages);
    for(const value of entries) {
      const version=String(value.updatedAt || data.exportedAt || path.match(/20\d{2}-\d{2}-\d{2}/)?.[0] || '');
      if(!modules.has(value.id)||version>modules.get(value.id).version) modules.set(value.id,{path,version,entry:value});
    }
  }
}
await scan('Charakter Archiv Exporte/');
const summary={characters:snapshot.characters.filter(c=>c.biography?.biography).map(c=>({id:c.id,name:c.name,worldPersonId:c.identity?.worldPersonId||c.genealogy?.worldPersonId,biography:c.biography})),
  families:FAMILY_REGISTRY.flatMap(f=>(f.family?.persons||[]).filter(p=>p.extensions?.biographyModule).map(p=>({familyId:f.id,id:p.id,name:p.name,portrait:p.portrait,biography:p.extensions.biographyModule}))),
  modules:[...modules.values()].filter(m=>m.entry.pages.some(p=>p.biographyPage)),biographies};
await writeFile(new URL('inventory.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({characters:summary.characters.length,tree:summary.families.length,modules:summary.modules.map(m=>({id:m.entry.id,title:m.entry.title,path:m.path,pages:m.entry.pages.filter(p=>p.biographyPage).map(p=>({title:p.pageTitle,keys:Object.keys(p)}))})),standalone:biographies.map(b=>({path:b.path,id:b.data.personId,name:b.data.personName}))}));
