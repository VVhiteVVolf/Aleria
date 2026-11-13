import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildResaleRegistration } from '../modules/gwynthor-horse-resale/resale-module.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
const args = process.argv.slice(2); if (args.length > 1 || args.some(a => a !== '--check')) throw Error('Use [--check].');
const registration = buildResaleRegistration(), check = args.includes('--check');
const outputs = new Map([
  [new URL('../modules/gwynthor-horse-resale/resale-data.js', import.meta.url), renderArchiveSectionRegistration('registerGwynthorHorseResale', [registration], 'scripts/build-gwynthor-horse-resale.mjs')],
  [new URL('../../Charakter Archiv Exporte/Module/Gwynthorer Gestuete/zum-schiefen-nagel-ruddgraen-2026-11-13.json', import.meta.url), JSON.stringify({ type: 'aleria-module-package', version: 1,
    exportedAt: '2026-11-13T16:00:00Z', module: { type: 'aleria-module', version: 1, section: { ...registration, entry: undefined }, entry: registration.entry } }, null, 2) + '\n']
]);
for (const [url, text] of outputs) { if (check) { if (await readFile(url, 'utf8') !== text) throw Error(`Stale resale projection: ${url}`); }
  else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, text); } }
console.log(JSON.stringify({ id: registration.entry.id, pages: registration.entry.pages.length, goods: registration.entry.pages[4].tradeCatalog.items.length, scenes: 3, check }));
