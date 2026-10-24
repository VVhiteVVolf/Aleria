import { readFile, writeFile } from 'node:fs/promises';
import { pages } from '../modules/uathneach/page-source.mjs';
import { buildTerritoryRegion } from './territory-region-build.mjs';

const check = process.argv.includes('--check');
const destination = new URL('../modules/uathneach/pages.source.json', import.meta.url);
const content = JSON.stringify({ pages }, null, 2) + '\n';
if (check) {
  if (await readFile(destination, 'utf8') !== content) throw new Error('Uathneach-Seitendaten sind veraltet.');
} else await writeFile(destination, content);
await buildTerritoryRegion({ slug: 'uathneach', region: 'Uathneach', kingdom: 'Uathneach',
  mapFolder: 'Uathneach', version: 'albic-fiefs-20261024', check });
