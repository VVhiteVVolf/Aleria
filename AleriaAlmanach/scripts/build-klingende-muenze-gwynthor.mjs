import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { tradingPostRegistrations } from '../modules/klingende-muenze-gwynthor/post-module.mjs';
import { POST_SECTION } from '../modules/klingende-muenze-gwynthor/post-section.mjs';
import { AFFILIATED_ENTRY_IDS } from '../modules/klingende-muenze-gwynthor/post-members.mjs';
const modules = tradingPostRegistrations();
const registrations = [...modules, ...AFFILIATED_ENTRY_IDS.map(entryId => ({ ...POST_SECTION, entryId }))];
const directory = new URL('../../Charakter Archiv Exporte/Module/Klingende Münze Gwynthor/', import.meta.url);
const outputs = new Map([
  [new URL('../modules/klingende-muenze-gwynthor/post-data.js', import.meta.url), renderArchiveSectionRegistration('registerGwynthorTradingPost', registrations, 'scripts/build-klingende-muenze-gwynthor.mjs')],
  ...modules.map(({ entry }) => [new URL(`${entry.id}-2026-10-18.json`, directory), JSON.stringify({ type: 'aleria-module-package', version: 1, exportedAt: '2026-10-18T00:00:00Z', module: { type: 'aleria-module', version: 1, section: POST_SECTION, entry } }, null, 2) + '\n']),
  [new URL('bestehende-module-platzierungen.json', directory), JSON.stringify({ type: 'aleria-module-placement-plan', version: 1, onlineApplied: false, placements: AFFILIATED_ENTRY_IDS.map(entryId => ({ entryId, section: POST_SECTION })) }, null, 2) + '\n']
]);
for (const [url, content] of outputs) {
  if (process.argv.includes('--check')) {
    if (await readFile(url, 'utf8') !== content) throw new Error(`Veraltetes Handelsposten-Paket: ${url}`);
  } else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, content); }
}
console.log(JSON.stringify({ modules: modules.map(({ entry }) => ({ id: entry.id, contentPages: entry.pages.length })), existingModulePlacements: AFFILIATED_ENTRY_IDS }));
