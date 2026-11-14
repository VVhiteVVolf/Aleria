import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { admitAuthoredRasterArt } from './artwork/admit-authored-raster-art.mjs';
import { CASTLE_ART, CASTLE_ART_DOCS, CASTLE_ART_ASSETS } from '../modules/gwynthor-castles/castle-art.mjs';

const args = process.argv.slice(2);
if (args.length !== 1 || !['--write', '--check'].includes(args[0])) throw Error('Use admit-gwynthor-castle-art.mjs --write|--check.');
const result = await admitAuthoredRasterArt({ root: fileURLToPath(new URL('../../', import.meta.url)),
  docsPath: CASTLE_ART_DOCS, assetsPath: CASTLE_ART_ASSETS, write: args[0] === '--write' });
const manifest = JSON.parse(await readFile(new URL(`../../${CASTLE_ART_ASSETS}/manifest.json`, import.meta.url), 'utf8'));
const expected = new Map(CASTLE_ART.map(art => [art.id, art.destination]));
if (manifest.active.length !== expected.size || manifest.active.some(image => expected.get(image.key) !== image.path)) throw Error('Burgbilder unvollständig oder falsch zugeordnet.');
if (manifest.images.some(image => image.width * 3 !== image.height * 2)) throw Error('Burgbilder müssen im 2:3-Hochformat vorliegen.');
console.log(JSON.stringify(result));
