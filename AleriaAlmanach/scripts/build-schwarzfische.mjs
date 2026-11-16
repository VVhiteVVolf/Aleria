import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { buildSchwarzfische, buildSchwarzfischeRegistrations } from '../modules/schwarzfische/schwarzfische-module.mjs';
import { buildGrennCharacterExport, SCHWARZFISCHE_AUTHORED_AT } from '../modules/schwarzfische/schwarzfische-characters.mjs';

const root = new URL('../../', import.meta.url);
const outputs = [
  ['AleriaAlmanach/modules/schwarzfische/schwarzfische-data.js',
    renderArchiveSectionRegistration('registerSchwarzfische', buildSchwarzfischeRegistrations(), 'scripts/build-schwarzfische.mjs')],
  ['Charakter Archiv Exporte/Schwarzfische/grenn-seolfor.json', JSON.stringify(buildGrennCharacterExport(), null, 2) + '\n'],
  ['Charakter Archiv Exporte/Module/Schwarzfische/schwarzfische-2026-11-16.json', JSON.stringify({
    type: 'aleria-module-package', version: 1, exportedAt: SCHWARZFISCHE_AUTHORED_AT,
    module: { type: 'aleria-module', version: 1,
      section: { key: 'Die Schwarzen Fische', tab: 'Söldner', path: buildSchwarzfischeRegistrations()[0].path },
      entry: buildSchwarzfische() }
  }, null, 2) + '\n']
];

for (const [file, content] of outputs) {
  const target = new URL(file, root);
  if (process.argv.includes('--check')) {
    if ((await readFile(target, 'utf8')).replaceAll('\r\n', '\n') !== content) throw Error(`Veraltete Schwarzfisch-Ausgabe: ${file}`);
  } else {
    await mkdir(new URL('.', target), { recursive: true });
    await writeFile(target, content);
  }
}
console.log('Schwarzfische: 4 Zweige, 10 Truppwappen, 10 Achterschaften mit je 2 Leutnants und Grenn Coelret.');
