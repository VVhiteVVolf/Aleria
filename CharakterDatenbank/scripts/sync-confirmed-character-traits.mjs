import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REVIEWED_CHARACTER_TRAITS } from '../../AleriaAlmanach/modules/character-trait-review/reviewed-character-traits.js';
import { projectConfirmedCharacterTraits } from '../../AleriaAlmanach/modules/character-trait-review/character-trait-confirmation-database.mjs';
import { mergeCharacterRecordProjections } from '../lib/character-record-projections.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url)), inputs = new Map();
async function json(file) { const path = resolve(root, file), text = await readFile(path, 'utf8'); inputs.set(path, text); return JSON.parse(text); }
const receipt = await json('diagnostics/combat-sheets-20261102/traits-online-after.json');
assert(receipt.verified && receipt.characters.length === REVIEWED_CHARACTER_TRAITS.length);
const registry = await json('CharakterDatenbank/registry.json'), snapshot = await json('CharakterDatenbank/generated/characters.snapshot.json'), report = await json('CharakterDatenbank/generated/sync-report.json');
const projections = [], exports = [];
for (const assignment of REVIEWED_CHARACTER_TRAITS) {
  const row = registry.records.find(row => row.firestoreDocumentId === assignment.id); assert(row, assignment.name);
  const record = await json(`CharakterDatenbank/${row.path}`), person = snapshot.characters.find(person => person.id === assignment.id);
  const remote = receipt.characters.find(person => person.id === assignment.onlineId); assert(remote);
  const result = projectConfirmedCharacterTraits({ record, snapshotCharacter: person, path: row.path, assignment, remote, now: receipt.committedAt,
    sourcePath: `Charakter Archiv Exporte/Bestätigte Bogenrevisionen 2026-11-02/${assignment.id}.json` });
  projections.push(result.projection); exports.push(result.exported);
}
const result = mergeCharacterRecordProjections({ registry, snapshot, report }, projections, exports, snapshot.charTabs);
const candidates = [...result.records.map(item => [resolve(root, 'CharakterDatenbank', item.path), item.record]),
  ...[['registry.json', result.registry], ['generated/characters.snapshot.json', result.snapshot], ['generated/sync-report.json', result.report]].map(([file, value]) => [resolve(root, 'CharakterDatenbank', file), value]),
  ...exports.map(value => [resolve(root, value.sourcePath), value])];
const writes = [];
for (const [path, value] of candidates) {
  const prior = inputs.get(path) ?? await readFile(path, 'utf8').catch(error => { if (error.code !== 'ENOENT') throw error; return ''; });
  const text = JSON.stringify(value, null, 2) + '\n'; if (text !== prior) writes.push([path, text]);
}
if (process.argv.includes('--check')) assert.equal(writes.length, 0, 'Bestätigte Bogenrevisionen sind lokal veraltet.');
else {
  for (const [path, text] of inputs) assert.equal(await readFile(path, 'utf8'), text, 'Quelle wurde inzwischen geändert.');
  for (const [path, text] of writes) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, text); }
}
console.log(JSON.stringify({ profiles: projections.length, changedFiles: writes.length, checked: process.argv.includes('--check') }));
