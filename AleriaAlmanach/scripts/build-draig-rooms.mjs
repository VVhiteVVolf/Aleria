import { readFile, writeFile } from 'node:fs/promises';
import { DRAIG_ROOM_ART } from '../modules/castell-draig-rooms/room-art.mjs';
import { planDraigRoomRefresh } from '../modules/castell-draig-rooms/room-pages.mjs';

const directory = new URL('../assets/castell-draig/wohntrakte-zimmer-2026-11-01-v2/', import.meta.url);
const before = JSON.parse(await readFile(new URL('module-before.json', directory), 'utf8')).entry;
const previous = JSON.parse(await readFile(new URL('../gawain-gemach-2026-11-01/module-import.json', directory), 'utf8'));
const images = Object.fromEntries(DRAIG_ROOM_ART.map(art => [art.id, `./${art.destination.slice('AleriaAlmanach/'.length)}`]));
const entry = planDraigRoomRefresh(before, images);
const outputs = new Map([
  [new URL('module-import.json', directory), JSON.stringify({ ...previous, entry }, null, 2) + '\n'],
  [new URL('image-prompts.json', directory), JSON.stringify({ version: 1, tool: 'built-in image_gen', images: DRAIG_ROOM_ART }, null, 2) + '\n']
]);
for (const [url, content] of outputs) {
  if (process.argv.includes('--check')) {
    if (await readFile(url, 'utf8') !== content) throw Error(`Veraltetes Zimmerpaket: ${url}`);
  } else await writeFile(url, content);
}
console.log(JSON.stringify({ module: entry.id, pages: entry.pages.length, roomScenes: 8, removedPage: 'Verlauf' }));
