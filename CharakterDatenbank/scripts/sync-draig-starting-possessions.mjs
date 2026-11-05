import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAIG_STARTING_TARGETS } from '../../AleriaAlmanach/modules/draig-starting-possessions/starting-possessions.mjs';
import { DRAIG_STARTING_EXPORT_DIRECTORY, projectDraigStartingPossessionsDatabase } from '../../AleriaAlmanach/modules/draig-starting-possessions/starting-possessions-database.mjs';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url))), databaseRoot = resolve(root, 'CharakterDatenbank');
const args = process.argv.slice(2);
if (args.some(argument => argument !== '--check')) throw Error('Erlaubt ist ausschließlich --check.');
const inputs = new Map();
const isInside = (parent, path) => {
  const rel = relative(parent, path);
  return rel && !isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`);
};
async function checkedPath(parent, requested) {
  const path = resolve(parent, requested);
  if (!isInside(parent, path)) throw Error('Ungültiger Projektionspfad.');
  let existing = path;
  while (true) {
    try {
      const actual = await realpath(existing);
      if (actual !== parent && !isInside(parent, actual)) throw Error('Ein Projektionspfad verlässt über eine Verknüpfung seinen Bereich.');
      return path;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      existing = dirname(existing);
      if (!isInside(parent, existing) && existing !== parent) throw Error('Ungültiger Projektionsbereich.');
    }
  }
}
async function textAt(path) {
  try { return await readFile(path, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function read(path) {
  const text = await readFile(path, 'utf8'); inputs.set(path, text); return JSON.parse(text);
}
const diagnosticRoot = resolve(root, 'diagnostics/draig-starting-possessions-20261105');
const online = await read(await checkedPath(root, resolve(diagnosticRoot, 'online-after.json')));
const verification = await read(await checkedPath(root, resolve(diagnosticRoot, 'publication-verification.json')));
const registry = await read(await checkedPath(databaseRoot, 'registry.json'));
const snapshot = await read(await checkedPath(databaseRoot, 'generated/characters.snapshot.json'));
const report = await read(await checkedPath(databaseRoot, 'generated/sync-report.json'));
const records = [];
for (const target of DRAIG_STARTING_TARGETS) {
  const matches = registry.records.filter(row => row.firestoreDocumentId === target.id);
  if (matches.length !== 1) throw Error(`${target.name}: eindeutige lokale Akte benötigt.`);
  const path = await checkedPath(resolve(databaseRoot, 'records'), resolve(databaseRoot, matches[0].path));
  if (!path.endsWith(`${sep}character.json`)) throw Error('Ungültiger Aktenpfad.');
  records.push(await read(path));
}
const result = projectDraigStartingPossessionsDatabase({ registry, snapshot, report, records, online, verification });
const candidates = [...result.records.map(item => [resolve(databaseRoot, item.path), item.record]),
  [resolve(databaseRoot, 'registry.json'), result.registry], [resolve(databaseRoot, 'generated/characters.snapshot.json'), result.snapshot],
  [resolve(databaseRoot, 'generated/sync-report.json'), result.report],
  ...result.exports.map(entry => [resolve(root, entry.sourcePath), entry])];
const outputs = [];
for (const [requested, data] of candidates) {
  const path = await checkedPath(root, requested);
  const isExport = result.exports.some(entry => resolve(root, entry.sourcePath) === path);
  if (isExport && !isInside(resolve(root, DRAIG_STARTING_EXPORT_DIRECTORY), path)) throw Error('Ungültiger Startbesitz-Exportpfad.');
  const previous = inputs.has(path) ? inputs.get(path) : await textAt(path);
  inputs.set(path, previous);
  const text = JSON.stringify(data, null, 2) + '\n';
  if (previous !== text) outputs.push([path, text]);
}
if (args.includes('--check')) {
  if (outputs.length) throw Error(`Startbesitzprojektion nicht aktuell: ${outputs.map(([path]) => relative(root, path)).join(', ')}`);
} else {
  for (const [path, text] of inputs) {
    if (await textAt(path) !== text) throw Error('Eine Projektionsquelle wurde inzwischen geändert.');
  }
  for (const [path, text] of outputs) {
    await checkedPath(root, path);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, text);
  }
}
console.log(JSON.stringify({ checked: args.includes('--check'), changedFiles: outputs.length, ...result.verification }));
