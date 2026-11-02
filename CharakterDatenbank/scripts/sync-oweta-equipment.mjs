import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUTHORED_ITEMS } from '../../AleriaAlmanach/modules/item-definitions/authored-item-catalog.js';
import { KNIGHT_EQUIPMENT_TARGETS } from '../../AleriaAlmanach/modules/gwynthor-seven/knight-equipment-plan.mjs';
import { OWETA_EQUIPMENT_ID, projectOwetaEquipmentDatabase } from '../../AleriaAlmanach/modules/gwynthor-seven/oweta-equipment-database.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const databaseRoot = resolve(root, 'CharakterDatenbank');
const sourcePath = 'Charakter Archiv Exporte/oweta-draig-ausruestung-2026-11-02.json';
const inputs = new Map();
async function read(path) {
  const text = await readFile(path, 'utf8'); inputs.set(path, text); return JSON.parse(text);
}
const registry = await read(resolve(databaseRoot, 'registry.json'));
const snapshot = await read(resolve(databaseRoot, 'generated/characters.snapshot.json'));
const report = await read(resolve(databaseRoot, 'generated/sync-report.json'));
const entries = registry.records.filter(row => row.firestoreDocumentId === OWETA_EQUIPMENT_ID);
if (entries.length !== 1) throw Error('Owetas Datenbankeintrag muss eindeutig sein.');
const recordPath = resolve(databaseRoot, entries[0].path), fromRecords = relative(resolve(databaseRoot, 'records'), recordPath);
if (!fromRecords || isAbsolute(fromRecords) || fromRecords === '..' || fromRecords.startsWith(`..${sep}`)
  || !recordPath.endsWith(`${sep}character.json`)) throw Error('Ungültiger Oweta-Datensatzpfad.');
const record = await read(recordPath);
let existingExport;
try { existingExport = await read(resolve(root, sourcePath)); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const now = existingExport?.exportedAt || new Date().toISOString();
const characters = KNIGHT_EQUIPMENT_TARGETS.map(target => {
  const matches = snapshot.characters.filter(character => target.knownIds.includes(character.id)
    || character.identity?.worldPersonId === target.worldPersonId || character.genealogy?.worldPersonId === target.worldPersonId);
  if (matches.length !== 1) throw Error(`${target.name}: eindeutige lokale Ausgangsakte benötigt.`);
  return matches[0];
});
const result = projectOwetaEquipmentDatabase({ registry, snapshot, report, record, characters, templates: AUTHORED_ITEMS, sourcePath, now });
const outputs = [[recordPath, result.records[0].record], [resolve(databaseRoot, 'registry.json'), result.registry],
  [resolve(databaseRoot, 'generated/characters.snapshot.json'), result.snapshot], [resolve(databaseRoot, 'generated/sync-report.json'), result.report],
  [resolve(root, sourcePath), result.exported]]
  .map(([path, value]) => [path, `${JSON.stringify(value, null, 2)}\n`]).filter(([path, text]) => inputs.get(path) !== text);
if (process.argv.includes('--check')) {
  if (outputs.length) throw Error(`Owetas Ausrüstungsprojektion ist nicht aktuell: ${outputs.map(([path]) => relative(root, path)).join(', ')}`);
} else {
  for (const [path, text] of inputs) if (await readFile(path, 'utf8') !== text) throw Error('Die Datenbankquellen wurden inzwischen geändert.');
  for (const [path, text] of outputs) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, text); }
}
console.log(JSON.stringify({ checked: process.argv.includes('--check'), changedFiles: outputs.length, ...result.verification }));
