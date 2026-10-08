import { readFileSync, writeFileSync } from 'node:fs';
import { buildAlbicClans, ALBIC_CLANS_TAB, ALBIC_CLANS_ICON } from '../modules/albische-clans/albic-clans-model.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';

const entry = buildAlbicClans();
const source = renderArchiveSectionRegistration('registerAlbicClans', [{
  tab: ALBIC_CLANS_TAB, path: [], icon: ALBIC_CLANS_ICON,
  description: 'Gastrecht, Gemeinschaft und die Herkunft albischer Clans.', entry
}], 'scripts/build-albic-clans.mjs');
const output = new URL('../modules/albische-clans/albic-clans-data.js', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8').replace(/\r\n/g, '\n') !== source) throw new Error('Run npm run build:albic-clans.');
} else writeFileSync(output, source);
console.log(`${ALBIC_CLANS_TAB}: ${entry.title}, ${entry.pages.length} pages`);
