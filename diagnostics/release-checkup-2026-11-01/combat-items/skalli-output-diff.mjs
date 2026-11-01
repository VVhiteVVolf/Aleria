import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { buildSkalliRetinue } from '../../../AleriaAlmanach/modules/skalli-retinue/retinue-module.mjs';
import { RETINUE_PATH, RETINUE_EMBLEM } from '../../../AleriaAlmanach/modules/skalli-retinue/retinue-people.mjs';
import { renderArchiveSectionRegistration } from '../../../AleriaAlmanach/modules/archive/archive-section-registration.mjs';

const root = new URL('../../../', import.meta.url);
const source = JSON.parse(await readFile(new URL('AleriaAlmanach/modules/skalli-retinue/skalli-biography-source.json', root), 'utf8'));
const expectedEntry = buildSkalliRetinue(source);
const registrationPath = 'AleriaAlmanach/modules/skalli-retinue/retinue-data.js';
const packagePath = 'Charakter Archiv Exporte/Module/Skallis Gefolge/skallis-gefolge-2026-10-18.json';
const registrationText = await readFile(new URL(registrationPath, root), 'utf8');
const context = vm.createContext({ SECTIONS: [] });
vm.runInContext(registrationText, context);
const currentEntry = JSON.parse(JSON.stringify(context.SECTIONS[0].entries[0]));
const packageText = await readFile(new URL(packagePath, root), 'utf8');
const currentPackage = JSON.parse(packageText);
const section = { tab: 'Gruppen', key: 'Haus Varulv', path: RETINUE_PATH, desc: 'Gefährten aus Roriksheim' };
const expectedRegistration = renderArchiveSectionRegistration('registerSkalliRetinue', [{ tab: section.tab, path: section.path, description: section.desc, icon: RETINUE_EMBLEM, entry: expectedEntry }], 'scripts/build-skalli-retinue.mjs');
const expectedPackage = { type: 'aleria-module-package', version: 1, exportedAt: '2026-10-18T00:00:00Z', module: { type: 'aleria-module', version: 1, section, entry: expectedEntry } };

function differences(before, after, path = '') {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  if (before && after && typeof before === 'object' && typeof after === 'object' && Array.isArray(before) === Array.isArray(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    return [...keys].flatMap(key => differences(before[key], after[key], path ? `${path}.${key}` : key));
  }
  return [{ path, change: before === undefined ? 'added' : after === undefined ? 'removed' : 'changed', ...(before === undefined ? {} : { before }), ...(after === undefined ? {} : { after }) }];
}
const hash = text => createHash('sha256').update(text).digest('hex');
const report = {
  generatedAt: new Date().toISOString(),
  method: 'Read stored artifacts, call pure buildSkalliRetinue and serializer in memory; no builder, product file, Firestore or publication writes.',
  registration: { path: registrationPath, beforeSha256: hash(registrationText), expectedSha256: hash(expectedRegistration), differences: differences(currentEntry, expectedEntry) },
  archive: { path: packagePath, beforeSha256: hash(packageText), expectedSha256: hash(JSON.stringify(expectedPackage, null, 2) + '\n'), differences: differences(currentPackage, expectedPackage) },
  currentRegistrationAndArchiveEntriesEqual: JSON.stringify(currentEntry) === JSON.stringify(currentPackage.module.entry),
  counts: { currentPages: currentEntry.pages.length, expectedPages: expectedEntry.pages.length, currentCast: currentEntry.sessionCast.length, expectedCast: expectedEntry.sessionCast.length }
};
await writeFile(new URL('skalli-output-diff.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
