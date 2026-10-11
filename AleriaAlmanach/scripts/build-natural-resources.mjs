import { readFileSync, writeFileSync } from 'node:fs';
import { buildNaturalResourcesSections } from '../modules/natural-resources/natural-resources-model.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';

const sections = buildNaturalResourcesSections();
const source = renderArchiveSectionRegistration('registerNaturalResources', sections, 'scripts/build-natural-resources.mjs');
const output = new URL('../modules/natural-resources/natural-resources-data.js', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8').replace(/\r\n/g, '\n') !== source) throw new Error('Run npm run build:natural-resources.');
} else writeFileSync(output, source);
console.log(`Natürliche Rohstoffe: ${sections.length} sections, ${sections[1].entry.pages.length} Tenebrium pages`);
