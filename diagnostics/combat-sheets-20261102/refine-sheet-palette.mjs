import { readFile, writeFile } from 'node:fs/promises';
const file=new URL('../../AleriaAlmanach/styles/character-combat-profile.css',import.meta.url);
let css=await readFile(file,'utf8');
css=css.replace(/rgba\(255, 248, 229, ([\d.]+)\)/g, 'rgba(12, 11, 8, $1)');
for(const [before,after]of Object.entries({'#59422b':'var(--sheet-muted)','#3c527a':'#adc5d7','#365d32':'#a9c58b',
 '#fcf5e2':'var(--sheet-panel)','#f3e7cd':'var(--sheet-panel-soft)'}))css=css.replaceAll(before,after);
await writeFile(file,css);
