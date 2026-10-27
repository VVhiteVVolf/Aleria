import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {warriorBriefs,classDirections,promptFor,styleReference} from '../warrior-art-direction.mjs';

const root=new URL('../',import.meta.url),workspace=new URL('../../',root);
const source=JSON.parse(await readFile(new URL('Stammbäume/assets/js/data/uathneach-territories.source.json',workspace),'utf8'));
const clans=new Map(source.clans.map(clan=>[clan.id,clan]));
const presets=JSON.parse(await readFile(new URL('AleriaAlmanach/docs/art/image-style-presets.json',workspace),'utf8'));
if(warriorBriefs.length!==clans.size||new Set(warriorBriefs.map(w=>w.id)).size!==clans.size||warriorBriefs.some(w=>!clans.has(w.id)))throw Error('Uathneach warrior roster differs from confirmed clan roster');
const catalog=warriorBriefs.map(({id,classId,horse=null,mounted=false,palette,reason,equipment})=>({id,name:clans.get(id).name,classId,className:classDirections[classId].name,mounted,horse,palette,reason,equipment,image:`assets/warriors/previews/${id}.webp`,fullsize:`assets/warriors/production/${id}.png`,...(horse?{bestiary:`../../Bestiarium/tiere/pferde/${horse}/index.html`}:{})}));
await mkdir(new URL('assets/warriors/generated/',root),{recursive:true});
await writeFile(new URL('warrior-data.mjs',root),`// Active clan illustrations are shared with house pages, biographies and the main gallery.\nexport {UATHNEACH_WARRIORS as warriors} from '../../Stammbäume/assets/js/data/uathneach-warriors.js';\n`);
await writeFile(new URL('assets/warriors/prompts.json',root),JSON.stringify({tool:'built-in image_gen',styleReference,alphaCleanupAuthorized:true,classesSource:'Klassenordner/Alben',publication:'Local illustrations; no publication permission for this extension yet.',prompts:warriorBriefs.map(brief=>({id:brief.id,prompt:promptFor(brief,presets.presets['fantasy-rpg-character'].prompt),references:[styleReference,clans.get(brief.id).crest.slice(1),...(brief.horse?[`Bestiarium/assets/horse-profiles/${brief.horse}.webp`]:[])]}))},null,2)+'\n');
console.log(`Prepared ${catalog.length} Uathneach warrior proposals and prompts.`);
