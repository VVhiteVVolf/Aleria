import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildFfalsModule, FFALS_SECTION } from '../modules/goldene-fassung/ffals-module.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { GWYNTHOR_AREA_ICONS } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';
const args = new Set(process.argv.slice(2));
if ([...args].some(arg => arg !== '--check')) throw Error('Erlaubt: build-goldene-fassung.mjs [--check]');
const entry = buildFfalsModule();
const outputs = new Map([
  [new URL('../modules/goldene-fassung/ffals-data.js', import.meta.url), renderArchiveSectionRegistration('registerGoldeneFassung', [{
    tab: FFALS_SECTION.tab, path: FFALS_SECTION.path, description: FFALS_SECTION.desc, icon: GWYNTHOR_AREA_ICONS['Gwynthor-Stadt'], entry
  }], 'scripts/build-goldene-fassung.mjs')],
  [new URL('../../Charakter Archiv Exporte/Module/Die goldene Fassung/die-goldene-fassung-2026-11-09.json', import.meta.url), JSON.stringify({
    type: 'aleria-module-package', version: 1, exportedAt: '2026-11-09T15:00:00Z', module: { type: 'aleria-module', version: 1, section: FFALS_SECTION, entry }
  }, null, 2) + '\n']
]);
for (const [url, content] of outputs) {
  if (args.has('--check')) { if (await readFile(url, 'utf8') !== content) throw Error(`Veraltete Ffals-Projektion: ${url}`); }
  else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, content); }
}
console.log(JSON.stringify({ module: entry.id, pages: entry.pages.length, scenes: 4, jewellery: 20, secondhand: 10, blackmarket: 3, cast: entry.sessionCast.length }));
