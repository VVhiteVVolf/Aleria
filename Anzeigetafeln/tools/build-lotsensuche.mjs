import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { LOTSENSUCHE_POSTER } from './quests/lotsensuche.mjs';
import { writeGwynthorQuestPack } from './build-gwynthor-quest-notices.mjs';

export async function buildLotsensuche({ check = false } = {}) {
  const target = new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/board-layout.json', import.meta.url);
  const source = JSON.parse(await readFile(target, 'utf8'));
  const poster = source.layout.posters.find(poster => poster.id === LOTSENSUCHE_POSTER.id);
  if (check) {
    if (!poster || poster.assetId !== LOTSENSUCHE_POSTER.assetId || poster.noticeId !== LOTSENSUCHE_POSTER.noticeId) throw Error('Lotsenplakat fehlt in Gwynthors Tafelvorlage.');
  } else if (!poster) {
    source.layout.posters.push(LOTSENSUCHE_POSTER);
    await writeFile(target, JSON.stringify(source, null, 2) + '\n');
  }
  await writeGwynthorQuestPack({ check });
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await buildLotsensuche({ check: process.argv.includes('--check') });
}
