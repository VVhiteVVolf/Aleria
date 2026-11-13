import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildStudRegistrations } from '../modules/gwynthor-horse-studs/stud-module.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
const args = new Set(process.argv.slice(2));
if ([...args].some(a => a !== '--check')) throw Error('Use build-gwynthor-horse-studs.mjs [--check].');
const registrations = buildStudRegistrations();
const outputs = new Map([[new URL('../modules/gwynthor-horse-studs/stud-data.js', import.meta.url), renderArchiveSectionRegistration('registerGwynthorHorseStuds', registrations, 'scripts/build-gwynthor-horse-studs.mjs')]]);
for (const registration of registrations) outputs.set(new URL(`../../Charakter Archiv Exporte/Module/Gwynthorer Gestuete/${registration.entry.id}-2026-11-13.json`, import.meta.url), JSON.stringify({
  type: 'aleria-module-package', version: 1, exportedAt: '2026-11-13T12:00:00Z', module: { type: 'aleria-module', version: 1, section: { ...registration, entry: undefined }, entry: registration.entry }
}, null, 2) + '\n');
for (const [url, text] of outputs) { if (args.has('--check')) { if (await readFile(url, 'utf8') !== text) throw Error(`Stale stud projection: ${url}`); }
  else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, text); } }
console.log(JSON.stringify(registrations.map(({ entry }) => ({ id: entry.id, pages: entry.pages.length, scenes: entry.pages.filter(p => p.sessionPage).length, goods: entry.pages.flatMap(p => p.tradeCatalog?.items || []).length }))));
