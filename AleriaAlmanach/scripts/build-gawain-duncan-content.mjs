import { readFile, writeFile } from 'node:fs/promises';
import { withGawainDuncanContent } from '../modules/gawain-duncan/gawain-duncan-module.mjs';
import { withGawainPublicBiography, GAWAIN_ID } from '../modules/gawain-duncan/gawain-public-biography.mjs';

const root = new URL('../../',import.meta.url);
const source = JSON.parse(await readFile(new URL('AleriaAlmanach/modules/gawain-duncan/source/gawain-duncan-online-2026-11-01.json',root),'utf8'));
const character = withGawainPublicBiography({id:GAWAIN_ID,name:'Gawain Draig'});
const outputs = [
  ['AleriaAlmanach/modules/gawain-duncan/source/reviewed-module.json',{type:'aleria-module',version:2,entry:withGawainDuncanContent(source.entry)}],
  ['Charakter Archiv Exporte/gawain-draig-oeffentliche-biografie-2026-11-01.json',{type:'aleria-character',version:3,mergeStrategy:'replace-exported-fields',exportedAt:'2026-11-01T03:46:32.000Z',
    character:{...character,updatedAt:'2026-11-01T03:46:32.000Z'},sourceNote:'Ausschließlich öffentliche Anhörung und Burghofbeiträge; Quellenbelege unter AleriaAlmanach/modules/gawain-duncan/source. Keine privaten Dossiers, Inventare, Ressourcen oder Kampfprofile.'}]
];
for (const [path,data] of outputs) {
  const text = `${JSON.stringify(data,null,2)}\n`, url = new URL(path,root);
  if (process.argv.includes('--check')) {
    if (await readFile(url,'utf8') !== text) throw Error(`Veraltete Gawain/Duncan-Quelle: ${path}`);
  } else await writeFile(url,text);
}
console.log('Gawain/Duncan: eigene Modulprojektion und rein biografischer Einzelexport abgeglichen.');
