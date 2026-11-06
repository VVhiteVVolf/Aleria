import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { projectPertCharacterDatabase } from '../modules/pert/character-database.mjs';
import { PERT_KEVAN_ID, PERT_KEVAN_PERSON_ID, PERT_CHARACTER_FEATURE } from '../modules/pert/character-content.mjs';

const workspace = fileURLToPath(new URL('../../', import.meta.url));
const json = value => JSON.stringify(value, null, 2) + '\n';
const hash = value => createHash('sha256').update(value).digest('hex');
const indexPaths = ['CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'];

export async function preparePertCharacters({ root = workspace, check = false, apply = false } = {}) {
  root = resolve(root);
  assert.ok(!(check && apply));
  const inputs = new Map();
  async function read(path) { const bytes = await readFile(resolve(root, path)); inputs.set(path, bytes); return JSON.parse(bytes); }
  const [registry, snapshot, report] = await Promise.all(indexPaths.map(read));
  const familyPath = resolve(root, 'Stammbäume/assets/js/data/families.registry.js');
  const { getRegisteredFamily } = await import(pathToFileURL(familyPath).href);
  const familyRecord = getRegisteredFamily('pert');
  assert.ok(familyRecord);
  const selectedIds = new Set(familyRecord.family.persons.filter(person => person.name && !person.id.startsWith('pert-gruender'))
    .map(person => person.id === PERT_KEVAN_PERSON_ID ? PERT_KEVAN_ID : person.worldPersonId));
  const existingRecords = await Promise.all(registry.records.filter(row => selectedIds.has(row.firestoreDocumentId))
    .map(row => read(`CharakterDatenbank/${row.path}`)));
  const result = projectPertCharacterDatabase({ registry, snapshot, report, existingRecords }, familyRecord);
  const outputs = [...result.exports.map(entry => [entry.sourcePath, entry]),
    ...result.records.map(item => [`CharakterDatenbank/${item.path}`, item.record]),
    ...[result.registry, result.snapshot, result.report].map((data, index) => [indexPaths[index], data])];
  assert.equal(outputs.length, 37);
  assert.equal(new Set(outputs.map(([path]) => path)).size, outputs.length);
  const foreignBefore = snapshot.characters.filter(person => !selectedIds.has(person.id));
  const foreignAfter = result.snapshot.characters.filter(person => !selectedIds.has(person.id));
  assert.deepEqual(foreignAfter, foreignBefore, 'Fremde Snapshotfiguren müssen vollständig erhalten bleiben.');
  assert.deepEqual(result.registry.records.filter(row => !selectedIds.has(row.firestoreDocumentId)),
    registry.records.filter(row => !selectedIds.has(row.firestoreDocumentId)), 'Fremde Registerzeilen müssen erhalten bleiben.');
  const changed = [];
  for (const [path, data] of outputs) {
    assert.ok(path.startsWith('CharakterDatenbank/') || path.startsWith('Charakter Archiv Exporte/Pert/'));
    const target = resolve(root, path), within = relative(root, target);
    assert.ok(within && within !== '..' && !within.startsWith(`..${sep}`));
    const bytes = Buffer.from(json(data));
    const prior = await readFile(target).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
    if (!prior?.equals(bytes)) changed.push({ path, beforeSha256: prior ? hash(prior) : null, afterSha256: hash(bytes) });
    if (check) assert.ok(prior?.equals(bytes), `Veraltete Pert-Projektion: ${path}`);
  }
  if (apply) {
    // Recheck all basis bytes immediately before the bounded writes.
    for (const [path, bytes] of inputs) assert.ok(bytes.equals(await readFile(resolve(root, path))), `Parallel veränderte Basis: ${path}`);
    for (const [path, data] of outputs) {
      if (!changed.some(item => item.path === path)) continue;
      const target = resolve(root, path);
      await mkdir(resolve(target, '..'), { recursive: true }); await writeFile(target, json(data));
    }
  }
  return { feature: PERT_CHARACTER_FEATURE, root, mode: check ? 'check' : apply ? 'apply' : 'plan',
    imported: 16, updatedExisting: 1, total: 17, unchangedForeignCharacters: foreignBefore.length,
    identityAudit: result.identityAudit, paths: outputs.map(([path]) => path), changed,
    foreignSnapshotSha256: hash(json(foreignBefore)), foreignRegistrySha256: hash(json(registry.records.filter(row => !selectedIds.has(row.firestoreDocumentId)))),
    allowedExistingCharacterFields: ['bio', 'biography', 'portrait', 'identity.worldPersonId', 'genealogy', 'updatedAt'],
    noProductionWrites: true };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2), value = key => args.includes(key) ? args[args.indexOf(key) + 1] : undefined;
  const result = await preparePertCharacters({ root: value('--root'), check: args.includes('--check'), apply: args.includes('--apply') });
  if (value('--report')) await writeFile(resolve(value('--report')), json(result));
  console.log(JSON.stringify(result));
}
