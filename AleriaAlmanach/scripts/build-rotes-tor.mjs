import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildRotesTor, TOR_SECTION } from '../modules/rotes-tor/tor-module.mjs';
import { readEconomyCalendar } from '../modules/economy-calculator/economy-source-venues.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';

const entry = buildRotesTor(await readEconomyCalendar());
const directory = new URL('../../Charakter Archiv Exporte/Module/Zum Roten Tor/', import.meta.url);
const packageData = { type: 'aleria-module-package', version: 1, exportedAt: '2026-10-20T00:00:00Z',
  module: { type: 'aleria-module', version: 1, section: TOR_SECTION, entry } };
const outputs = new Map([
  [new URL('../modules/rotes-tor/tor-data.js', import.meta.url), renderArchiveSectionRegistration('registerRotesTor',
    [{ tab: TOR_SECTION.tab, path: TOR_SECTION.path, description: TOR_SECTION.desc, icon: '../IconOrdner/Welt Pins/Gasthof.png', entry }], 'scripts/build-rotes-tor.mjs')],
  [new URL('zum-roten-tor-2026-10-20.json', directory), JSON.stringify(packageData, null, 2) + '\n']
]);
for (const [url, content] of outputs) {
  if (process.argv.includes('--check')) {
    if (await readFile(url, 'utf8') !== content) throw Error(`Veraltetes Rotes-Tor-Paket: ${url}`);
  } else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, content); }
}
console.log(JSON.stringify({ module: entry.id, pages: entry.pages.length, scenes: 4, goods: 16, services: 6, activeAdults: 8, deployment: 'withheld' }));
