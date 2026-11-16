import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildHofCharacterExports, HOF_CHARACTER_FEATURE } from '../modules/tirfelyn-hof/hof-characters.mjs';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';

const args = process.argv.slice(2);
if (args.some(arg => !['--plan', '--write', '--check'].includes(arg)) || args.length > 1) throw Error('Verwendung: build-tirfelyn-hof-characters.mjs [--plan|--write|--check]');
const mode = args[0] || '--plan';
const root = new URL('../../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const paths = ['CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'];
const bytes = await Promise.all(paths.map(read));
const [registry, snapshot, report] = bytes.map(JSON.parse);
const exports = buildHofCharacterExports();
const ids = new Set(exports.map(entry => entry.character.id));
const existingRecords = await Promise.all(registry.records.filter(row => ids.has(row.firestoreDocumentId)).map(row => read(`CharakterDatenbank/${row.path}`).then(JSON.parse)));
const projected = buildAuthoredCharacterImport({ registry, snapshot, report, existingRecords }, exports, HOF_CHARACTER_FEATURE, []);
assert.equal(projected.records.length, 12);
assert.deepEqual(projected.records.map(item => item.record.character.id).sort(), [...ids].sort());
const others = snapshot.characters.filter(character => !ids.has(character.id));
assert.deepEqual(projected.snapshot.characters.filter(character => !ids.has(character.id)), others);
const hash = value => createHash('sha256').update(value).digest('hex');
const fingerprints = Object.fromEntries(paths.map((path, index) => [path, hash(bytes[index])]));
const proofPath = new URL(process.env.TIRFELYN_CHARACTER_PLAN_PATH || 'diagnostics/tirfelyn-hof-20261115/characters-plan.json', root);

if (mode === '--plan') {
  await mkdir(new URL('.', proofPath), { recursive: true });
  await writeFile(proofPath, JSON.stringify({ feature: HOF_CHARACTER_FEATURE, fingerprints, ids: [...ids], count: 12, preserved: others.length }, null, 2) + '\n');
} else {
  if (mode === '--write') {
    const approvedPlan = JSON.parse(await readFile(proofPath, 'utf8'));
    assert.deepEqual(approvedPlan.fingerprints, fingerprints, 'Figurenbestand seit der Planung geändert; erneut --plan ausführen.');
    assert.deepEqual(approvedPlan.ids, [...ids]);
  }
  for (const entry of exports) {
    const target = new URL(entry.sourcePath, root), text = JSON.stringify(entry, null, 2) + '\n';
    if (mode === '--check') assert.equal(await readFile(target, 'utf8'), text, entry.sourcePath);
    else { await mkdir(new URL('.', target), { recursive: true }); await writeFile(target, text); }
  }
  await importAuthoredCharacters({ sources: exports.map(entry => entry.sourcePath), feature: HOF_CHARACTER_FEATURE, check: mode === '--check', familyCandidates: [] });
  const after = JSON.parse(await read(paths[1]));
  assert.deepEqual(after.characters.filter(character => !ids.has(character.id)), others);
}
console.log(JSON.stringify({ mode, characters: exports.length, unrelatedPreserved: others.length, firestoreWrites: false }));
