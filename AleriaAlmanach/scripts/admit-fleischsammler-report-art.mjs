import { admitAuthoredRasterArt } from './artwork/admit-authored-raster-art.mjs';
import { fileURLToPath } from 'node:url';
if (process.argv.slice(2).some(arg => !['--write', '--check'].includes(arg)) || process.argv.includes('--write') && process.argv.includes('--check')) throw Error('Genau --write oder --check verwenden.');
const result = await admitAuthoredRasterArt({ root: fileURLToPath(new URL('../../', import.meta.url)),
  docsPath: 'AleriaAlmanach/docs/art/fleischsammler-report-20261114',
  assetsPath: 'Dokumente aus der Werkstatt/assets/meredydd-fleischsammler-ermittlungsbuch', write: process.argv.includes('--write') });
console.log(JSON.stringify(result));
