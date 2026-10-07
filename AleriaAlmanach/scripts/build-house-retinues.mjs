import { readFileSync, writeFileSync } from 'node:fs';
import { buildDrakenschluck } from '../modules/house-retinues/drakenschluck-model.mjs';
import { buildMelynwyrrd } from '../modules/house-retinues/melynwyrrd-model.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
const root = new URL('../modules/house-retinues/', import.meta.url);
const read = name => JSON.parse(readFileSync(new URL(`sources/${name}.json`, root), 'utf8'));
const modules = [
  { tab: 'Söldner', path: ['Drakenschluck Söldner'], description: 'Die Schutzgilde des Hauses Penderyn und ihre Verbände', icon: './public/assets/house-retinues/references/drakenschluck-emblem.png', entry: buildDrakenschluck(read('drakenschluck')) },
  { tab: 'Banden', description: 'Banden, Diebesgilden und ihre Gefolgschaften', icon: '../IconOrdner/ReiterIcons/Weltpfade/banden.png', entry: buildMelynwyrrd(read('melynwyrrd')) }
];
const source = renderArchiveSectionRegistration('registerHouseRetinues', modules, 'scripts/build-house-retinues.mjs');
const output = new URL('house-retinues-data.js', root);
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8').replace(/\r\n/g, '\n') !== source) throw Error('Run npm run build:house-retinues.');
} else writeFileSync(output, source);
for (const { entry } of modules) {
  const nodes = entry.pages.flatMap(page => (page.hierarchy?.trees || []).flatMap(tree => tree.levels.flatMap(level => level.nodes)));
  console.log(`${entry.id}: ${entry.pages.length} pages, ${nodes.length} roles/slots, ${nodes.filter(node => !node.portrait).length} reserve slots`);
}
