import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildRoteKlaue, KLAUE_SECTION } from '../modules/rote-klaue/klaue-module.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { planKlaueCharacters } from '../modules/rote-klaue/klaue-characters.mjs';
import { HOUSE_VALERUS_FAMILY } from '../../Stammbäume/assets/js/data/house-valerus-family.js';
const entry = buildRoteKlaue();
const outputs = new Map([
  [new URL('../modules/rote-klaue/klaue-data.js', import.meta.url), renderArchiveSectionRegistration('registerRoteKlaue', [{ ...KLAUE_SECTION, entry }], 'scripts/build-rote-klaue.mjs')],
  [new URL('../../Charakter Archiv Exporte/Module/Die rote Klaue/die-rote-klaue-2026-10-21.json', import.meta.url), JSON.stringify({ type: 'aleria-module-package', version: 1, exportedAt: '2026-10-21T00:00:00Z',
    module: { type: 'aleria-module', version: 1, section: KLAUE_SECTION, entry } }, null, 2) + '\n'],
  [new URL('../../Charakter Archiv Exporte/Module/Die rote Klaue/haus-valerus-2026-10-21.json', import.meta.url), JSON.stringify(HOUSE_VALERUS_FAMILY, null, 2) + '\n'],
  [new URL('../../Charakter Archiv Exporte/Module/Die rote Klaue/personen-importplan-2026-10-21.json', import.meta.url), JSON.stringify({
    type: 'aleria-character-publication-plan', version: 1, onlineApplied: false, plan: planKlaueCharacters()
  }, null, 2) + '\n']
]);
for (const [url, content] of outputs) {
  if (process.argv.includes('--check')) { if (await readFile(url, 'utf8') !== content) throw Error(`Veraltetes Klaue-Paket: ${url}`); }
  else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, content); }
}
console.log(JSON.stringify({ module: entry.id, pages: entry.pages.length, scenes: entry.pages.filter(p => p.sessionPage).length, goods: 0, calculation: 'deferred' }));
