import { readFileSync, writeFileSync } from 'node:fs';
import { buildWindreiter, WINDREITER_EMBLEM, WINDREITER_ART } from '../modules/windreiter/windreiter-model.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';

const root = new URL('../modules/windreiter/', import.meta.url);
const input = JSON.parse(readFileSync(new URL('sources/windreiter.json', root), 'utf8'));
const modules = [
  { tab: 'Söldner', path: ['Die Windreiter'], icon: WINDREITER_EMBLEM,
    description: 'Die übergeordnete Kriegergilde, ihre Hauptbanner und Unterbanden.', entry: buildWindreiter(input) },
  { tab: 'Söldner', path: ['Die Windreiter', 'Estryll Banden', 'Die Schwarzen Fische'], icon: `${WINDREITER_ART}/references/xYZyjk3.png`,
    description: 'Estrylls Hauptbanner der Windreiter und seine späteren Unterbanden.', entryId: 'schwarzfische-windreiter' }
];
const output = new URL('windreiter-data.js', root);
const source = renderArchiveSectionRegistration('registerWindreiter', modules, 'scripts/build-windreiter.mjs');
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8').replace(/\r\n/g, '\n') !== source) throw new Error('Run npm run build:windreiter.');
} else writeFileSync(output, source);
console.log(modules.map(({ entry, entryId, path }) => `${path.join(' > ')}: ${entry ? `${entry.pages.length} pages` : `existing module ${entryId}`}`).join('\n'));
