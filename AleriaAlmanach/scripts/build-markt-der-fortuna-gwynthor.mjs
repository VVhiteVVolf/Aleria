import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { fortunaRegistrations } from '../modules/markt-der-fortuna-gwynthor/fortuna-module.mjs';
import { FORTUNA_SECTION } from '../modules/markt-der-fortuna-gwynthor/fortuna-section.mjs';
import { FORTUNA_AFFILIATED_IDS, FORTUNA_BUSINESSES, FORTUNA_EXTERNAL_RELATIONS } from '../modules/markt-der-fortuna-gwynthor/fortuna-network.mjs';
const modules = fortunaRegistrations();
const registrations = [...modules, ...FORTUNA_AFFILIATED_IDS.map(entryId => ({ ...FORTUNA_SECTION, entryId }))];
const directory = new URL('../../Charakter Archiv Exporte/Module/Markt der Fortuna Gwynthor/', import.meta.url);
const outputs = new Map([
  [new URL('../modules/markt-der-fortuna-gwynthor/fortuna-data.js', import.meta.url), renderArchiveSectionRegistration('registerGwynthorFortuna', registrations, 'scripts/build-markt-der-fortuna-gwynthor.mjs')],
  ...modules.map(({ entry }) => [new URL(`${entry.id}-2026-10-18.json`, directory), JSON.stringify({ type: 'aleria-module-package', version: 1, exportedAt: '2026-10-18T00:00:00Z', module: { type: 'aleria-module', version: 1, section: FORTUNA_SECTION, entry } }, null, 2) + '\n']),
  [new URL('bestehende-verbindungen-und-platzierungen.json', directory), JSON.stringify({ type: 'aleria-fortuna-relationship-evidence', version: 1, onlineApplied: false,
    businesses: FORTUNA_BUSINESSES.map(({ person, ...partner }) => ({ ...partner, name: person.name, worldPersonId: person.worldPersonId, section: FORTUNA_SECTION })), externalRelations: FORTUNA_EXTERNAL_RELATIONS }, null, 2) + '\n']
]);
for (const [url, content] of outputs) {
  if (process.argv.includes('--check')) { if (await readFile(url, 'utf8') !== content) throw new Error(`Veraltetes Fortuna-Paket: ${url}`); }
  else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, content); }
}
console.log(JSON.stringify({ modules: modules.map(({ entry }) => ({ id: entry.id, contentPages: entry.pages.length })), existingModulePlacements: FORTUNA_AFFILIATED_IDS }));
