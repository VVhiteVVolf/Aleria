import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { federkielRegistrations } from '../modules/federkiel-gwynthor/federkiel-module.mjs';
import { FEDERKIEL_SECTION } from '../modules/federkiel-gwynthor/federkiel-section.mjs';

const check = process.argv.includes('--check');
const registrations = federkielRegistrations();
const exportDirectory = new URL('../../Charakter Archiv Exporte/Module/Gilde Federkiel Gwynthor/', import.meta.url);
const generatedRegistration = new URL('../modules/federkiel-gwynthor/federkiel-data.js', import.meta.url);
const outputs = new Map([[generatedRegistration,
  renderArchiveSectionRegistration('registerGwynthorFederkiel', registrations, 'scripts/build-federkiel-gwynthor.mjs')]]);

for (const { entry } of registrations) {
  const payload = {
    type: 'aleria-module-package', version: 1, exportedAt: '2026-11-22T00:00:00+01:00',
    module: { type: 'aleria-module', version: 1, section: FEDERKIEL_SECTION, entry }
  };
  outputs.set(new URL(`${entry.id}-2026-11-22.json`, exportDirectory), `${JSON.stringify(payload, null, 2)}\n`);
}

for (const [file, content] of outputs) {
  if (check) {
    if (await readFile(file, 'utf8') !== content) throw new Error(`Veraltetes Federkiel-Modulpaket: ${file}`);
  } else {
    await mkdir(new URL('.', file), { recursive: true });
    await writeFile(file, content);
  }
}
const pages = registrations.flatMap(({ entry }) => entry.pages);
console.log(`Federkiel: ${registrations.length} Module, ${pages.length} Seiten, ${pages.filter(page => page.sessionPage).length} Szenen.`);
