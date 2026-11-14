import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildUnderworldRegistrations } from '../modules/gwynthor-underworld/underworld-modules.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
const args=process.argv.slice(2);
if(args.length>1 || args.some(arg=>arg!=='--check')) throw Error('Use [--check].');
const registrations=buildUnderworldRegistrations(),check=args.includes('--check');
const outputs=new Map([[new URL('../modules/gwynthor-underworld/underworld-data.js',import.meta.url),
  renderArchiveSectionRegistration('registerGwynthorUnderworld',registrations,'scripts/build-gwynthor-underworld.mjs')]]);
for(const registration of registrations) outputs.set(new URL(`../../Charakter Archiv Exporte/Module/Gwynthor Unterwelt/${registration.entry.id}-2026-11-14.json`,import.meta.url),
  JSON.stringify({type:'aleria-module-package',version:1,exportedAt:'2026-11-14T10:00:00Z',module:{type:'aleria-module',version:1,section:{...registration,entry:undefined},entry:registration.entry}},null,2)+'\n');
for(const [url,text] of outputs) {
  if(check) {if(await readFile(url,'utf8')!==text) throw Error(`Stale underworld projection: ${url}`);}
  else {await mkdir(new URL('.',url),{recursive:true});await writeFile(url,text);}
}
console.log(JSON.stringify({modules:registrations.map(r=>({id:r.entry.id,pages:r.entry.pages.length,scenes:r.entry.pages.filter(p=>p.sessionPage).length})),check,release:'local-only'}));
