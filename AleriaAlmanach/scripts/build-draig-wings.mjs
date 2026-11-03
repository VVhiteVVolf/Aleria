import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { DRAIG_WING_ART } from '../modules/castell-draig-rooms/wing-art.mjs';
import { WING_SOURCE_DIRECTORY } from '../modules/castell-draig-rooms/wing-households.mjs';

const directory = new URL(`../../${WING_SOURCE_DIRECTORY}`, import.meta.url);
await mkdir(new URL('generated/', directory), { recursive: true });
const file = new URL('image-prompts.json', directory);
const content = JSON.stringify({ version: 1, tool: 'built-in image_gen', images: DRAIG_WING_ART }, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (await readFile(file, 'utf8') !== content) throw Error('Veraltete Wohnflügel-Bildprompts.');
} else await writeFile(file, content);
console.log(JSON.stringify({ images: DRAIG_WING_ART.length, manifest: file.pathname }));
