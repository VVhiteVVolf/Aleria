import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectGawainCharacterDatabase } from '../modules/gawain-duncan/gawain-character-database.mjs';
import { GAWAIN_ID } from '../modules/gawain-duncan/gawain-public-biography.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const databaseRoot = resolve(root, 'CharakterDatenbank');
const sourcePath = 'Charakter Archiv Exporte/gawain-draig-oeffentliche-biografie-2026-11-01.json';
const inputs = new Map();
async function read(path) {
  const content = await readFile(path, 'utf8'); inputs.set(path, content); return JSON.parse(content);
}
const registry = await read(resolve(databaseRoot, 'registry.json'));
const snapshot = await read(resolve(databaseRoot, 'generated/characters.snapshot.json'));
const report = await read(resolve(databaseRoot, 'generated/sync-report.json'));
const entries = registry.records.filter(row => row.firestoreDocumentId === GAWAIN_ID);
if (entries.length !== 1) throw Error('Gawains lokaler Datenbankeintrag muss eindeutig sein.');
const recordPath = resolve(databaseRoot, entries[0].path), fromRoot = relative(resolve(databaseRoot, 'records'), recordPath);
if (!fromRoot || isAbsolute(fromRoot) || fromRoot === '..' || fromRoot.startsWith(`..${sep}`) || !recordPath.endsWith(`${sep}character.json`)) throw Error('Ungültiger Gawain-Datensatzpfad.');
const record = await read(recordPath), exported = await read(resolve(root, sourcePath));
const result = projectGawainCharacterDatabase({ registry, snapshot, report, record, exported, sourcePath });
const outputs = [[recordPath, result.records[0].record], [resolve(databaseRoot, 'registry.json'), result.registry],
  [resolve(databaseRoot, 'generated/characters.snapshot.json'), result.snapshot], [resolve(databaseRoot, 'generated/sync-report.json'), result.report]]
  .map(([path, value]) => [path, `${JSON.stringify(value, null, 2)}\n`]).filter(([path, text]) => inputs.get(path) !== text);
if (process.argv.includes('--check')) {
  if (outputs.length) throw Error('Gawains öffentlicher biografischer Datenbankabgleich ist nicht aktuell.');
} else {
  for (const [path, text] of inputs) if (await readFile(path, 'utf8') !== text) throw Error('Die lokalen Datenbankquellen wurden inzwischen geändert.');
  for (const [path, text] of outputs) await writeFile(path, text);
}
console.log(`Gawain-only DB: ${outputs.length ? 'aktualisiert' : 'aktuell'}; ${result.registry.count} Figuren; keine Neuklassifizierung, Laufzeit- oder Inventaränderung.`);
