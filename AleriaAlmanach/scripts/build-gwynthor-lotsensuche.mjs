import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { buildLotsensucheCharacterExports } from '../modules/gwynthor-lotsensuche/lotsensuche-characters.mjs';
import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';

const root = new URL('../../', import.meta.url);
export async function buildLotsensucheCharacters({ check = false } = {}) {
  const sources = [];
  for (const entry of buildLotsensucheCharacterExports()) {
    const relative = `Charakter Archiv Exporte/gwynthor-lotsensuche-2026-10-31/${entry.character.id}.json`;
    const target = new URL(relative, root);
    const text = JSON.stringify(entry, null, 2) + '\n';
    if (check) { if (await readFile(target, 'utf8') !== text) throw Error(`Figurenexport veraltet: ${relative}`); }
    else { await mkdir(new URL('.', target), { recursive: true }); await writeFile(target, text); }
    sources.push(relative);
  }
  return importAuthoredCharacters({ sources, feature: 'gwynthor-lotsensuche', check });
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  console.log(JSON.stringify(await buildLotsensucheCharacters({ check: process.argv.includes('--check') })));
}
