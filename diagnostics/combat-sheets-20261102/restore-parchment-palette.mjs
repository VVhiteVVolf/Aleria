// User steering: retain parchment on both sheets while keeping the new layout.
import { readFile, writeFile } from 'node:fs/promises';
const base=new URL('../../AleriaAlmanach/styles/character-combat-profile.css',import.meta.url);
let css=await readFile(base,'utf8');
for(const [before,after]of Object.entries({
 '--sheet-gold: #b99b5d':'--sheet-gold: #795019','--sheet-gold-bright: #e6d2a0':'--sheet-gold-bright: #733336',
 '--sheet-gold-muted: #b3a382':'--sheet-gold-muted: #755632','--sheet-ink: #14130f':'--sheet-ink: #fffaf0',
 '--sheet-panel: #24211a':'--sheet-panel: #fbf4e2','--sheet-panel-soft: #302a1d':'--sheet-panel-soft: #f1e4c7',
 '--sheet-text: #e3d6b8':'--sheet-text: #35271d','--sheet-muted: #b3a78c':'--sheet-muted: #66513b',
 '#adc5d7':'#3c527a','#a9c58b':'#365d32'
}))css=css.replaceAll(before,after);
css=css.replace(/rgba\(12, 11, 8, ([\d.]+)\)/g,'rgba(255, 248, 229, $1)');
await writeFile(base,css);
const workspace=new URL('../../AleriaAlmanach/modules/combat-sheet/combat-sheet.css',import.meta.url);
css=await readFile(workspace,'utf8');
css=css.replace('dark leather, restrained brass','warm parchment, restrained brass');
css=css.replace("background: linear-gradient(#15130fe8, #15130fe8), url('../../public/assets/inventory-ui/dark-hide-v1.webp') repeat;",'background: linear-gradient(130deg, #f8efd8, #eee0bd);');
const palette={
 '#16140ff5':'#f2e5c9f5','#e3d6b8':'#3d2c1d','#b3a78c':'#705536','#d8c393':'#813739',
 '#b99b5d':'#a4824d','#e6d2a0':'#813739','#b3a382':'#775b39',
 '#e4d0a1':'#573b22','#bba67c':'#795b36','#b9ab8c':'#705536','#bbae8c':'#705536',
 '#c5ab70':'#8d6632','#f0dba8':'#71302e','#b4985c':'#a4824d','#c5b080':'#795b36',
 '#e8daba':'#35271d','#b7a783':'#705536','#dec17e':'#813739','#dfcfaa':'#493723',
 '#b2a589':'#705536','#dcca9e':'#704d27','#a59470':'#8c7048','#ecddb6':'#513720',
 '#efdaa5':'#71302e','#ddc99a':'#704d27','#c6b07a':'#795b36','#dacaab':'#493723',
 '#d7c28c':'#795b36','#c7b383':'#795b36','#e2d0a1':'#573b22','#b2a382':'#705536',
 '#d5bf88':'#795b36','#cfbd85':'#72582d',
 '#30291e':'#e8d3a9','#201d16':'#f6ebd1','#14120e':'#edddba','#100f0b':'#e9d8b4',
 '#211e17':'#fbf3df','#4a3c26':'#e8cea1','#30291c':'#f7e9cb','#13120f':'#fffaed',
 '#24211a':'#fbf4e2','#201d17':'#f2e5c8','#7c69432b':'#b6975c26','#181610':'#fff8e8',
 '#171510':'#f4e7c9','#13110c':'#d8bb83','#473a25':'#c9a76d','#292319':'#dfc797',
 '#1e1b14':'#e5d5b1','#30271b':'#f5e8ca','#3a3020':'#fbf2db','#14130f':'#fffbee',
 '#3d3322':'#f8ebcc','#242016':'#e6cfa3','#1b1913':'#f8efd9','#211d15':'#e5d0a7',
 '#383022':'#e2c58e','#242016':'#f2e4c3','#15130e':'#ecdbb5','#191711':'#fff8e8',
 '#1d1a13':'#f5e8c9','#30271c':'#e6d2aa','#181610':'#fff8e8'
};
css=css.replace(/#[a-fA-F0-9]{8}|#[a-fA-F0-9]{6}\b/g,color=>palette[color.toLowerCase()]||color);
await writeFile(workspace,css);
