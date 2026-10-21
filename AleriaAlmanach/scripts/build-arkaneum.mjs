import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildArkaneum, ARKANEUM_SECTION } from '../modules/arkaneum/arkaneum-module.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { GWYNTHOR_AREA_ICONS } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';
const entry = buildArkaneum();
const packageData = { type: 'aleria-module-package', version: 1, exportedAt: '2026-10-20T00:00:00Z', module: { type: 'aleria-module', version: 1, section: ARKANEUM_SECTION, entry } };
const outputs = new Map([
  [new URL('../modules/arkaneum/arkaneum-data.js', import.meta.url), renderArchiveSectionRegistration('registerArkaneum', [{ tab: ARKANEUM_SECTION.tab, path: ARKANEUM_SECTION.path,
    description: ARKANEUM_SECTION.desc, icon: GWYNTHOR_AREA_ICONS['Gwynthor-Stadt'], entry }], 'scripts/build-arkaneum.mjs')],
  [new URL('../../Charakter Archiv Exporte/Module/Lothaires Arkaneum/lothaires-arkaneum-2026-10-20.json', import.meta.url), JSON.stringify(packageData, null, 2) + '\n']
]);
for (const [url, content] of outputs) {
  if (process.argv.includes('--check')) { if (await readFile(url, 'utf8') !== content) throw Error(`Veraltetes Arkaneum-Paket: ${url}`); }
  else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, content); }
}
console.log(JSON.stringify({ module: entry.id, pages: entry.pages.length, scenes: 5, staff: 11, goods: entry.pages.filter(p => p.tradeCatalogPage).map(p => p.tradeCatalog.items.length), calculation: 'deferred', deployment: 'withheld' }));
