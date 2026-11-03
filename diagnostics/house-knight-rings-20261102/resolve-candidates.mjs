import { readFile,writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_RANKS } from '../../Stammbäume/assets/js/domain/house-profile.js';
import { isInventoryPlaceholder } from '../../AleriaAlmanach/modules/character-inventory/inventory-placeholders.js';
const online=JSON.parse(await readFile(new URL('./online-before.json',import.meta.url),'utf8'));
const local=JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
const byId=new Map(local.characters.map(c=>[c.id,c]));
const worked=online.characters.filter(c=>c.inventory?.items?.some(i=>!isInventoryPlaceholder(i)));
const candidates=worked.map(c=>{
  const known=byId.get(c.id);
  const genealogy=c.genealogy?.houseId?c.genealogy:known?.genealogy||c.genealogy||{};
  const worldId=c.identity?.worldPersonId||genealogy.worldPersonId||known?.identity?.worldPersonId||'';
  const requested=genealogy.houseId?.replace(/^house-/,'haus-');
  const family=FAMILY_REGISTRY.find(f=>f.id===requested)
    || FAMILY_REGISTRY.filter(f=>worldId.startsWith(`person--${f.id}--`)).sort((a,b)=>b.id.length-a.id.length)[0];
  const rank=family?.family.document.houseProfile?.rankId||'unknown';
  return {id:c.id,name:c.name,worldId,familyId:family?.id||'',familyName:family?.title||genealogy.houseName||'',
    rank,rankOrder:HOUSE_RANKS[rank]?.order,eligible:Boolean(family&&HOUSE_RANKS[rank]?.order<=HOUSE_RANKS.knight.order),
    emblem:family?.family.document.emblem||'',items:c.inventory.items.filter(i=>!isInventoryPlaceholder(i)).map(i=>i.name),
    rings:c.inventory.items.filter(i=>/ritterring|siegelring|hausring/i.test([i.name,i.description].join(' '))).map(i=>({id:i.id,name:i.name}))};
});
await writeFile(new URL('./candidates.json',import.meta.url),JSON.stringify(candidates,null,2)+'\n');
console.log('Worked:',worked.length,'Eligible:',candidates.filter(c=>c.eligible).length);
for(const c of candidates) console.log(JSON.stringify({name:c.name,house:c.familyName,rank:c.rank,eligible:c.eligible,items:c.items.length,rings:c.rings}));
console.log('HOUSES',JSON.stringify([...new Set(candidates.filter(c=>c.eligible).map(c=>c.familyId))]));
