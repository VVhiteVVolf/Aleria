import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectBronaBiographyDatabase } from '../../AleriaAlmanach/modules/brona-biography/brona-biography-database.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url)), inputs = new Map();
const option = name => process.argv[process.argv.indexOf(name) + 1];
assert(process.argv.includes('--source') && process.argv.includes('--receipt'), '--source und --receipt müssen ausdrücklich benannt sein.');
const sourcePath = option('--source').replaceAll('\\', '/'), receiptPath = option('--receipt');
assert(sourcePath.startsWith('Charakter Archiv Exporte/') && sourcePath.endsWith('.json') && !sourcePath.includes('..'));
async function json(file) {
  const path = resolve(root, file), fromRoot = relative(root, path);
  assert(fromRoot && !isAbsolute(fromRoot) && fromRoot !== '..' && !fromRoot.startsWith(`..${sep}`));
  const text = await readFile(path, 'utf8'); inputs.set(path, text); return JSON.parse(text);
}
const source = await json(sourcePath), receipt = await json(receiptPath);
assert.equal(source.type, 'aleria-character');
assert.equal(source.mergeStrategy, 'replace-exported-fields');
const registry = await json('CharakterDatenbank/registry.json'), snapshot = await json('CharakterDatenbank/generated/characters.snapshot.json');
const report = await json('CharakterDatenbank/generated/sync-report.json');
const rows = registry.records.filter(row => row.firestoreDocumentId === source.character?.id);
assert.equal(rows.length, 1);
const row = rows[0], recordPath = `CharakterDatenbank/${row.path}`;
assert(row.path.startsWith('records/') && row.path.endsWith('/character.json') && !row.path.includes('..'));
const record = await json(recordPath);
const result = projectBronaBiographyDatabase({ registry, snapshot, report, record, remote: source.character,
  receipt, sourcePath, exportedAt: source.exportedAt });
const outputs = [[recordPath, result.records[0].record], ['CharakterDatenbank/registry.json', result.registry],
  ['CharakterDatenbank/generated/characters.snapshot.json', result.snapshot], ['CharakterDatenbank/generated/sync-report.json', result.report]];
const writes = outputs.map(([file, value]) => [resolve(root, file), JSON.stringify(value, null, 2) + '\n'])
  .filter(([path, text]) => inputs.get(path) !== text);
if (process.argv.includes('--check')) assert.equal(writes.length, 0, 'Bronas bestätigter lokaler Stand ist veraltet.');
else {
  for (const [path, text] of inputs) assert.equal(await readFile(path, 'utf8'), text, 'Eine Quelle wurde seit dem Lesen verändert.');
  for (const [path, text] of writes) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, text); }
}
console.log(JSON.stringify({ checked: process.argv.includes('--check'), changedFiles: writes.length, ...result.verification }));
