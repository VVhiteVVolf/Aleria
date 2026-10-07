import { readFileSync, writeFileSync } from 'node:fs';
import { buildAlbicHospitality, ALBIC_HOSPITALITY_TAB, ALBIC_HOSPITALITY_ICON } from '../modules/albische-gastfreundschaft/albic-hospitality-model.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';

const entry = buildAlbicHospitality();
const source = renderArchiveSectionRegistration('registerAlbicHospitality', [{
  tab: ALBIC_HOSPITALITY_TAB, path: [], icon: ALBIC_HOSPITALITY_ICON,
  description: 'Gastrecht, Feiertage, Gaben und die Bräuche des Zusammenlebens.', entry
}], 'scripts/build-albic-hospitality.mjs');
const output = new URL('../modules/albische-gastfreundschaft/albic-hospitality-data.js', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8').replace(/\r\n/g, '\n') !== source) throw new Error('Run npm run build:albic-hospitality.');
} else writeFileSync(output, source);
console.log(`${ALBIC_HOSPITALITY_TAB}: ${entry.title}, ${entry.pages.length} pages`);
