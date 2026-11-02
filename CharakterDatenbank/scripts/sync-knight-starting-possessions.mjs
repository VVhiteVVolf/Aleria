import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KNIGHT_EQUIPMENT_TARGETS } from '../../AleriaAlmanach/modules/gwynthor-seven/knight-equipment-plan.mjs';
import { projectKnightStartingPossessionsDatabase } from '../../AleriaAlmanach/modules/gwynthor-seven/starting-possessions-database.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url)), databaseRoot = resolve(root, 'CharakterDatenbank');
const inputs = new Map();
async function read(path) { const text = await readFile(path, 'utf8'); inputs.set(path, text); return JSON.parse(text); }
const online = await read(resolve(root, 'diagnostics/knight-equipment-20261102/starting-characters-after.json'));
const verification = await read(resolve(root, 'diagnostics/knight-equipment-20261102/starting-publication-verification.json'));
const registry = await read(resolve(databaseRoot, 'registry.json'));
const snapshot = await read(resolve(databaseRoot, 'generated/characters.snapshot.json'));
const report = await read(resolve(databaseRoot, 'generated/sync-report.json'));
const records = [];
for (const target of KNIGHT_EQUIPMENT_TARGETS) {
  const matches = registry.records.filter(row => target.knownIds.includes(row.firestoreDocumentId));
  if (matches.length !== 1) throw Error(`${target.name}: eindeutige lokale Akte benötigt.`);
  const path = resolve(databaseRoot, matches[0].path), fromRecords = relative(resolve(databaseRoot, 'records'), path);
  if (!fromRecords || isAbsolute(fromRecords) || fromRecords === '..' || fromRecords.startsWith(`..${sep}`)
    || !path.endsWith(`${sep}character.json`)) throw Error('Ungültiger Aktenpfad.');
  records.push(await read(path));
}
const result = projectKnightStartingPossessionsDatabase({ registry, snapshot, report, records, online, verification });
const candidates = [...result.records.map(item => [resolve(databaseRoot, item.path), item.record]),
  [resolve(databaseRoot, 'registry.json'), result.registry], [resolve(databaseRoot, 'generated/characters.snapshot.json'), result.snapshot],
  [resolve(databaseRoot, 'generated/sync-report.json'), result.report], ...result.exports.map(entry => [resolve(root, entry.sourcePath), entry])];
const outputs = [];
for (const [path, data] of candidates) {
  let previous = inputs.get(path);
  if (previous === undefined) { try { previous = await readFile(path, 'utf8'); inputs.set(path, previous); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
  const text = JSON.stringify(data, null, 2) + '\n';
  if (previous !== text) outputs.push([path, text]);
}
if (process.argv.includes('--check')) {
  if (outputs.length) throw Error(`Startbesitzprojektion nicht aktuell: ${outputs.map(([path]) => relative(root, path)).join(', ')}`);
} else {
  for (const [path, text] of inputs) if (await readFile(path, 'utf8') !== text) throw Error('Eine Projektionsquelle wurde inzwischen geändert.');
  for (const [path, text] of outputs) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, text); }
}
console.log(JSON.stringify({ checked: process.argv.includes('--check'), changedFiles: outputs.length, ...result.verification }));
