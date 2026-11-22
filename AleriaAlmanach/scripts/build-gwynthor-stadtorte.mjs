import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { buildGwynthorCityPlaces, CITY_PLACES_SECTION } from '../modules/gwynthor-stadtorte/stadtorte-module.mjs';
import { CITY_PLACES_ART_BRIEFS } from '../modules/gwynthor-stadtorte/stadtorte-art.mjs';
import { GWYNTHOR_CITY_PLACES } from '../modules/gwynthor-stadtorte/stadtorte-scenes.mjs';

const entries = buildGwynthorCityPlaces();
const outputs = new Map([
  [new URL('../modules/gwynthor-stadtorte/stadtorte-data.js', import.meta.url),
    renderArchiveSectionRegistration('registerGwynthorCityPlaces', entries.map(entry => ({ ...CITY_PLACES_SECTION, entry })), 'scripts/build-gwynthor-stadtorte.mjs')],
  [new URL('../assets/gwynthor-stadtorte/image-prompts.json', import.meta.url),
    JSON.stringify({ version: 1, tool: 'built-in image_gen', images: CITY_PLACES_ART_BRIEFS }, null, 2) + '\n']
]);
for (const entry of entries) {
  const date = GWYNTHOR_CITY_PLACES.find(place => place.id === entry.id).firstAuthoredOn || '2026-11-12';
  outputs.set(new URL(`../../Charakter Archiv Exporte/Module/Gwynthor Stadtorte/${entry.id}-${date}.json`, import.meta.url),
    JSON.stringify({ type: 'aleria-module-package', version: 1, exportedAt: `${date}T00:00:00Z`,
      module: { type: 'aleria-module', version: 1, section: CITY_PLACES_SECTION, entry } }, null, 2) + '\n');
}
for (const [url, content] of outputs) {
  if (process.argv.includes('--check')) {
    if (await readFile(url, 'utf8') !== content) throw new Error(`Veraltetes Stadtorte-Paket: ${url}`);
  } else {
    await mkdir(new URL('.', url), { recursive: true });
    await writeFile(url, content);
  }
}
console.log(JSON.stringify({ modules: entries.map(entry => entry.id), pages: entries.reduce((sum, entry) => sum + entry.pages.length, 0) }));
