import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildAurddenModule, AURDDEN_SECTION } from '../modules/loer-hofjuwelier/aurdden-module.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
const args = new Set(process.argv.slice(2));
if ([...args].some(arg => arg !== '--check')) throw Error('Erlaubt: build-loer-hofjuwelier.mjs [--check]');
const entry = buildAurddenModule();
const outputs = new Map([
  [new URL('../modules/loer-hofjuwelier/aurdden-data.js', import.meta.url), renderArchiveSectionRegistration('registerAurddenJeweller', [{
    tab: AURDDEN_SECTION.tab, path: [...AURDDEN_SECTION.path], description: AURDDEN_SECTION.desc, icon: AURDDEN_SECTION.iconUrl, entry
  }], 'scripts/build-loer-hofjuwelier.mjs')],
  [new URL('../../Charakter Archiv Exporte/Module/Der Sternenfang/der-sternenfang-2026-11-09.json', import.meta.url), JSON.stringify({
    type: 'aleria-module-package', version: 1, exportedAt: '2026-11-09T16:00:00Z', module: { type: 'aleria-module', version: 1, section: AURDDEN_SECTION, entry }
  }, null, 2) + '\n']
]);
for (const [url, content] of outputs) {
  if (args.has('--check')) { if (await readFile(url, 'utf8') !== content) throw Error(`Veraltete Aurdden-Projektion: ${url}`); }
  else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, content); }
}
console.log(JSON.stringify({ module: entry.id, pages: entry.pages.length, scenes: entry.pages.filter(page => page.sessionPage).length,
  offers: entry.pages.flatMap(page => page.tradeCatalog?.items || []).length, cast: entry.sessionCast.length }));
