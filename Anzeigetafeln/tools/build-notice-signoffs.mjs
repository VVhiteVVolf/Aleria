import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { buildNoticeSignoffUpdates } from './issuers/notice-signoffs.mjs';

const folder = new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen/', import.meta.url);

export async function buildLlysfaenSignoffPack() {
  const { state } = JSON.parse(await readFile(new URL('data.json', folder), 'utf8'));
  return { schemaVersion: 2, zettel: [], updates: buildNoticeSignoffUpdates(state.zettel.map(notice => notice.id)) };
}

export async function writeNoticeSignoffs({ check = false } = {}) {
  const target = new URL('authored-notices.json', folder);
  const content = JSON.stringify(await buildLlysfaenSignoffPack(), null, 2) + '\n';
  if (check) {
    if (await readFile(target, 'utf8') !== content) throw Error('Llysfaens Siegel und Unterschriften müssen neu erzeugt werden.');
  } else {
    await writeFile(target, content);
    console.log('Llysfaen: fehlende Zeichen auf elf bestehenden Blättern ergänzen; keine neuen Aushänge.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writeNoticeSignoffs({ check: process.argv.includes('--check') });
}
