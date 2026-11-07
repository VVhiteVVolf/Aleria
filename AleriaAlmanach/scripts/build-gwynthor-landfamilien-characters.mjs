import assert from 'node:assert/strict';
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';
import { LANDFAMILIEN_CHARACTER_FEATURE, buildLandfamilienCharacterCandidates, buildLandfamilienCharacterExports } from '../modules/gwynthor-landfamilien/landfamilien-characters.mjs';

const arguments_ = process.argv.slice(2), mode = arguments_[0] || '--plan';
if (arguments_.length > 1 || !['--plan', '--write', '--check'].includes(mode)) {
  throw new Error('Verwendung: build-gwynthor-landfamilien-characters.mjs [--plan|--write|--check]');
}
const root = new URL('../../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const statePaths = ['CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'];
const stateBytes = await Promise.all(statePaths.map(path => readFile(new URL(path, root))));
const [registry, snapshot, report] = stateBytes.map(bytes => JSON.parse(bytes.toString('utf8')));
const exports = buildLandfamilienCharacterExports(FAMILY_REGISTRY, snapshot.characters);
const familyCandidates = buildLandfamilienCharacterCandidates(FAMILY_REGISTRY);
const ids = new Set(exports.map(entry => entry.character.id));
assert.equal(exports.length, 36); assert.equal(ids.size, 36);
const existingRecords = await Promise.all(registry.records.filter(row => ids.has(row.firestoreDocumentId))
  .map(row => readJson(`CharakterDatenbank/${row.path}`)));
const result = buildAuthoredCharacterImport({ registry, snapshot, report, existingRecords }, exports, LANDFAMILIEN_CHARACTER_FEATURE, familyCandidates);
assert.equal(result.records.length, 36);
const newIds = result.records.map(item => item.snapshotCharacter.id).filter(id => !snapshot.characters.some(character => character.id === id));
const selectedRecordIds = new Set(result.records.map(item => item.record.recordId));
assert.deepEqual(result.snapshot.characters.filter(character => !ids.has(character.id)), snapshot.characters.filter(character => !ids.has(character.id)));
assert.deepEqual(result.registry.records.filter(row => !selectedRecordIds.has(row.recordId)), registry.records.filter(row => !selectedRecordIds.has(row.recordId)));
assert.deepEqual(result.report.pending.filter(row => !selectedRecordIds.has(row.recordId)), report.pending.filter(row => !selectedRecordIds.has(row.recordId)));
for (const item of result.records) {
  const exported = exports.find(entry => entry.character.id === item.record.character.id);
  assert.equal(item.record.identity.worldPersonId, exported.character.identity.worldPersonId);
  assert.equal(item.record.classification.familyStatus, 'linked');
  assert.equal(item.record.classification.families[0].familyId, exported.character.genealogy.sources[0].familyId);
  assert.equal(item.record.links.firestore.documentIds.length, 1);
  if (newIds.includes(item.snapshotCharacter.id)) {
    assert.ok(!registry.records.some(row => row.path === item.path), `Fremder Aktenpfad: ${item.path}`);
    await access(new URL(`CharakterDatenbank/${item.path}`, root)).then(() => { throw new Error(`Unregistrierte Akte am Zielpfad: ${item.path}`); }, error => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const baseline = statePaths.map((path, index) => ({ path, sha256: hash(stateBytes[index]) }));
const sourceContentHashes = exports.map(entry => ({ path: entry.sourcePath, sha256: hash(JSON.stringify(entry, null, 2) + '\n') }));
const changedExistingRecords = result.records.filter(item => {
  const current = existingRecords.find(record => record.recordId === item.record.recordId);
  return current && JSON.stringify(current) !== JSON.stringify(item.record);
}).map(item => item.record.character.id);
const plan = { mode, feature: LANDFAMILIEN_CHARACTER_FEATURE, newIdentities: newIds.length,
  imported: exports.length, previousCharacters: snapshot.characters.length, resultingCharacters: result.snapshot.characters.length,
  unrelatedCharactersPreserved: snapshot.characters.filter(character => !ids.has(character.id)).length,
  unrelatedRegistryRowsPreserved: registry.records.filter(row => !selectedRecordIds.has(row.recordId)).length,
  explicitWorldIdentities: result.records.every(item => item.record.identity.worldPersonId),
  allLinkedToOwningFamily: true, baseline, sourceContentHashes, changedExistingRecords, records: result.records.map(item => ({ id: item.record.character.id,
    name: item.record.identity.name, worldPersonId: item.record.identity.worldPersonId, path: item.path,
    familyId: item.record.classification.families[0].familyId })) };

if (mode === '--plan') {
  const diagnostic = new URL('diagnostics/gwynthor-landfamilien-20261107/modules/character-import-plan.json', root);
  await mkdir(new URL('.', diagnostic), { recursive: true });
  await writeFile(diagnostic, JSON.stringify(plan, null, 2) + '\n');
  console.log(JSON.stringify({ ...plan, records: undefined, sourceContentHashes: undefined }));
} else {
  if (mode === '--write') {
    const previousPlan = await readJson('diagnostics/gwynthor-landfamilien-20261107/modules/character-import-plan.json');
    assert.deepEqual(previousPlan.baseline, baseline, 'Datenbankstand seit der geprüften Planung verändert; zuerst --plan erneut prüfen.');
    assert.deepEqual(previousPlan.records, plan.records, 'Figurenquelle seit der geprüften Planung verändert; zuerst --plan erneut prüfen.');
    assert.deepEqual(previousPlan.sourceContentHashes, sourceContentHashes, 'Figureninhalt seit der geprüften Planung verändert; zuerst --plan erneut prüfen.');
    const backup = new URL('diagnostics/gwynthor-landfamilien-20261107/modules/character-database-before/', root);
    await mkdir(backup, { recursive: true });
    for (const [index, path] of statePaths.entries()) {
      const destination = new URL(`${index}-${path.split('/').at(-1)}`, backup);
      try { await access(destination); } catch (error) { if (error.code !== 'ENOENT') throw error; await copyFile(new URL(path, root), destination); }
    }
  }
  const unrelatedRecordFiles = await Promise.all(registry.records.filter(row => !selectedRecordIds.has(row.recordId)).map(async row => {
    const path = `CharakterDatenbank/${row.path}`;
    return { path, sha256: hash(await readFile(new URL(path, root))) };
  }));
  if (mode === '--write') await writeFile(new URL('diagnostics/gwynthor-landfamilien-20261107/modules/unrelated-character-files-before.json', root),
    JSON.stringify(unrelatedRecordFiles, null, 2) + '\n');
  for (const entry of exports) {
    const url = new URL(entry.sourcePath, root), content = JSON.stringify(entry, null, 2) + '\n';
    if (mode === '--check') { if (await readFile(url, 'utf8') !== content) throw new Error(`Veraltete Quelle: ${entry.sourcePath}`); }
    else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, content); }
  }
  const imported = await importAuthoredCharacters({ sources: exports.map(entry => entry.sourcePath),
    feature: LANDFAMILIEN_CHARACTER_FEATURE, familyCandidates, check: mode === '--check' });
  const afterSnapshot = await readJson(statePaths[1]), afterRegistry = await readJson(statePaths[0]);
  assert.deepEqual(afterSnapshot.characters.filter(character => !ids.has(character.id)), snapshot.characters.filter(character => !ids.has(character.id)));
  assert.deepEqual(afterRegistry.records.filter(row => !selectedRecordIds.has(row.recordId)), registry.records.filter(row => !selectedRecordIds.has(row.recordId)));
  for (const item of unrelatedRecordFiles) assert.equal(hash(await readFile(new URL(item.path, root))), item.sha256, `Fremde Akte verändert: ${item.path}`);
  if (mode === '--write') {
    const latestReceipt = new URL('diagnostics/gwynthor-landfamilien-20261107/modules/character-import-complete.json', root);
    const firstReceipt = new URL('diagnostics/gwynthor-landfamilien-20261107/modules/character-import-receipt-first.json', root);
    try { await access(firstReceipt); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      try { await copyFile(latestReceipt, firstReceipt); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    const content = JSON.stringify({ ...plan, imported, unrelatedRecordBytesPreserved: unrelatedRecordFiles.length,
      completedAt: new Date().toISOString(), externalWrites: false }, null, 2) + '\n';
    await writeFile(latestReceipt, content);
    await writeFile(new URL(`diagnostics/gwynthor-landfamilien-20261107/modules/character-import-receipt-${Date.now()}.json`, root), content);
  }
  console.log(JSON.stringify({ ...imported, newIdentities: newIds.length, preserved: plan.unrelatedCharactersPreserved,
    unrelatedRecordBytesPreserved: unrelatedRecordFiles.length, externalWrites: false }));
}
