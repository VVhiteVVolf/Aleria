import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withGawainDuncanContent } from '../modules/gawain-duncan/gawain-duncan-module.mjs';
import { withGawainPublicBiography, GAWAIN_ID } from '../modules/gawain-duncan/gawain-public-biography.mjs';
import { hasExactReviewedBiographyTraitCards } from '../modules/character-trait-review/character-trait-review-model.js';

function preserveApprovedCards(target, previous) {
  if (target && hasExactReviewedBiographyTraitCards(previous?.abilities, GAWAIN_ID)) target.abilities = structuredClone(previous.abilities);
}

export function projectGawainDuncanSources(source, existingModule, existingExport) {
  const character = withGawainPublicBiography({id:GAWAIN_ID,name:'Gawain Draig'});
  const entry = structuredClone(withGawainDuncanContent(source.entry));
  if (existingExport?.character?.id === GAWAIN_ID) preserveApprovedCards(character.biography.biography, existingExport.character.biography?.biography);
  if (existingModule?.entry?.id === entry.id) preserveApprovedCards(
    entry.pages.find(page => page.commentThreadKey === '1' && page.biographyPage)?.biography,
    existingModule.entry.pages?.find(page => page.commentThreadKey === '1' && page.biographyPage)?.biography);
  const outputs = [
    ['AleriaAlmanach/modules/gawain-duncan/source/reviewed-module.json',{type:'aleria-module',version:2,entry}],
    ['Charakter Archiv Exporte/gawain-draig-oeffentliche-biografie-2026-11-01.json',{type:'aleria-character',version:3,mergeStrategy:'replace-exported-fields',exportedAt:'2026-11-01T03:46:32.000Z',
      character:{...character,updatedAt:'2026-11-01T03:46:32.000Z'},sourceNote:'Ausschließlich öffentliche Anhörung und Burghofbeiträge; Quellenbelege unter AleriaAlmanach/modules/gawain-duncan/source. Keine privaten Dossiers, Inventare, Ressourcen oder Kampfprofile.'}]
  ];
  return outputs;
}

async function readExisting(root, path) {
  try { return JSON.parse(await readFile(new URL(path, root), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = new URL('../../',import.meta.url);
  const source = await readExisting(root, 'AleriaAlmanach/modules/gawain-duncan/source/gawain-duncan-online-2026-11-01.json');
  const outputs = projectGawainDuncanSources(source,
    await readExisting(root, 'AleriaAlmanach/modules/gawain-duncan/source/reviewed-module.json'),
    await readExisting(root, 'Charakter Archiv Exporte/gawain-draig-oeffentliche-biografie-2026-11-01.json'));
  for (const [path,data] of outputs) {
    const text = `${JSON.stringify(data,null,2)}\n`, url = new URL(path,root);
    if (process.argv.includes('--check')) {
      if (await readFile(url,'utf8') !== text) throw Error(`Veraltete Gawain/Duncan-Quelle: ${path}`);
    } else await writeFile(url,text);
  }
  console.log('Gawain/Duncan: eigene Modulprojektion und rein biografischer Einzelexport abgeglichen.');
}
