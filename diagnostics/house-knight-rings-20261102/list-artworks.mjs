import { readFile,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_RANKS } from '../../Stammbäume/assets/js/domain/house-profile.js';
const candidates=JSON.parse(await readFile(new URL('./candidates.json',import.meta.url),'utf8'));
const local=JSON.parse(await readFile(new URL('./local-inventories.json',import.meta.url),'utf8'));
const ids=new Set(candidates.filter(c=>c.eligible).map(c=>c.familyId));
for(const c of local){const id=c.genealogy?.houseId?.replace(/^house-/,'haus-');const family=FAMILY_REGISTRY.find(f=>f.id===id);if(family&&HOUSE_RANKS[family.houseProfile.rankId]?.order<=60)ids.add(id);}
const houses=[...ids].sort().map(id=>{const family=FAMILY_REGISTRY.find(f=>f.id===id);return{id,name:family.title,rankId:family.houseProfile.rankId,
  emblem:family.family.document.emblem,emblemPath:fileURLToPath(new URL('../../'+(family.family.document.emblem.startsWith('/')
    ? family.family.document.emblem.slice(1) : 'Stammbäume/'+family.family.document.emblem),import.meta.url)),
  image:'/AleriaAlmanach/assets/house-knight-rings/'+id+'-siegelring-v1.png'};});
await writeFile(new URL('./ring-houses.json',import.meta.url),JSON.stringify(houses,null,2)+'\n');
console.log(JSON.stringify(houses));
