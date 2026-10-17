import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { buildSkalliRetinue } from '../modules/skalli-retinue/retinue-module.mjs';
import { RETINUE_PATH, RETINUE_EMBLEM } from '../modules/skalli-retinue/retinue-people.mjs';
const source = JSON.parse(await readFile(new URL('../modules/skalli-retinue/skalli-biography-source.json', import.meta.url), 'utf8'));
const entry = buildSkalliRetinue(source);
const section = { tab: 'Gruppen', key: 'Haus Varulv', path: RETINUE_PATH, desc: 'Gefährten aus Roriksheim' };
const directory = new URL('../../Charakter Archiv Exporte/Module/Skallis Gefolge/', import.meta.url);
const outputs = new Map([
  [new URL('../modules/skalli-retinue/retinue-data.js', import.meta.url), renderArchiveSectionRegistration('registerSkalliRetinue', [{ tab: section.tab, path: section.path, description: section.desc, icon: RETINUE_EMBLEM, entry }], 'scripts/build-skalli-retinue.mjs')],
  [new URL('skallis-gefolge-2026-10-18.json', directory), JSON.stringify({ type: 'aleria-module-package', version: 1, exportedAt: '2026-10-18T00:00:00Z', module: { type: 'aleria-module', version: 1, section, entry } }, null, 2) + '\n']
]);
if (!process.argv.includes('--check')) await mkdir(directory, { recursive: true });
for (const [url, value] of outputs) {
  if (process.argv.includes('--check')) { if (await readFile(url, 'utf8') !== value) throw Error(`Veraltetes Gefolge-Paket: ${url}`); }
  else await writeFile(url, value);
}
console.log(JSON.stringify({ module: entry.id, pages: entry.pages.length, hierarchyTabs: 4 }));
