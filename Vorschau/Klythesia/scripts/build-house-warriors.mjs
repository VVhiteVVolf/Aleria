/** Publish only display captions, keeping generator prompts in the authoring archive. */
import {readFile,writeFile} from 'node:fs/promises';
import {HOUSES} from '../house-data.mjs';
const root=new URL('../',import.meta.url);
const direction=JSON.parse(await readFile(new URL('sources/house-warrior-art-direction.json',root),'utf8'));
const warriors=direction.entries.map(entry=>{
  const houseId=entry.id.replace(/^house-/,'');
  const house=HOUSES.find(house=>house.id===houseId);if(!house)throw Error('Unknown clan '+houseId);
  return {id:entry.id,houseId,prototypeId:'thorax',name:`Thorax des Clans ${house.name}`,
    description:`Eigene Thorax-Darstellung für Clan ${house.name}: ${entry.motif}. Rüstung, Helm, Mantel und Hoplon greifen die Hausfarben und den örtlichen Kontext auf.`,
    equipment:entry.equipment,helmet:entry.helmet,geography:entry.geography,palette:house.palette,
    image:`assets/warriors/previews/${entry.id}.webp`,fullsize:`assets/warriors/production/${entry.id}.png`};
});
if(warriors.length!==7||new Set(warriors.map(item=>item.houseId)).size!==7)throw Error('Expected seven separate clan figures');
await writeFile(new URL('house-warrior-data.mjs',root),'// Generated display captions; source prompts remain in sources/house-warrior-art-direction.json.\nexport const HOUSE_WARRIORS = '+JSON.stringify(warriors,null,2)+';\n','utf8');
console.log(JSON.stringify({houseWarriors:warriors.length}));
