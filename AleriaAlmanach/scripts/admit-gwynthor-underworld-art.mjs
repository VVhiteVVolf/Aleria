import { fileURLToPath } from 'node:url';
import { admitAuthoredRasterArt } from './artwork/admit-authored-raster-art.mjs';
const args = process.argv.slice(2), write = args.includes('--write');
if (args.length !== 1 || args.some(a => !['--write', '--check'].includes(a))) throw Error('Use --write or --check.');
console.log(JSON.stringify(await admitAuthoredRasterArt({ root:fileURLToPath(new URL('../../',import.meta.url)),write,
  docsPath:'AleriaAlmanach/docs/art/gwynthor-underworld-20261114',assetsPath:'AleriaAlmanach/assets/gwynthor-underworld' })));
