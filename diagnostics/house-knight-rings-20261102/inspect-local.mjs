import { readFile, writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { isInventoryPlaceholder } from '../../AleriaAlmanach/modules/character-inventory/inventory-placeholders.js';
const root = new URL('../../', import.meta.url);
const snapshot = JSON.parse(await readFile(new URL('CharakterDatenbank/generated/characters.snapshot.json', root), 'utf8'));
const worked = snapshot.characters.filter(c => c.inventory?.items?.some(item => !isInventoryPlaceholder(item)));
const report = worked.map(c => ({ id:c.id,name:c.name,identity:c.identity,genealogy:c.genealogy,
  inventory:c.inventory, localRecord:c.localRecord }));
await writeFile(new URL('./local-inventories.json', import.meta.url), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({all:snapshot.characters.length,worked:worked.length,characters:worked.map(c=>({id:c.id,name:c.name,
  house:c.genealogy?.houseName,worldId:c.identity?.worldPersonId,
  items:c.inventory.items.filter(i=>!isInventoryPlaceholder(i)).map(i=>i.name)}))},null,2));
for (const id of ['haus-draig','haus-wyrm','haus-awenydd','haus-gwyllach','haus-wolfshorn','haus-bleiddorn']) {
  const record=FAMILY_REGISTRY.find(f=>f.id===id);
  const {people,relationships,marriages,cadetBranches,layout,...rest}=record.family;
  console.log(JSON.stringify({id,keys:Object.keys(record.family),document:rest.document,profile:rest.houseProfile}));
}
