import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { characterDatabaseContentHash } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import { mergeCharacterRecordProjections } from '../../CharakterDatenbank/lib/character-record-projections.mjs';
import { reconcileReviewedCompanions, REVIEWED_COMPANION_OWNERS } from '../modules/creatures/creature-ownership-review.mjs';
const root = new URL('../../', import.meta.url), check = process.argv.includes('--check');
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const [registry, snapshot, report, source] = await Promise.all([read('CharakterDatenbank/registry.json'), read('CharakterDatenbank/generated/characters.snapshot.json'),
  read('CharakterDatenbank/generated/sync-report.json'), read('diagnostics/companion-ownership-20261102/baseline.json')]);
const records = [], exports = [], outputs = [];
for (const review of REVIEWED_COMPANION_OWNERS) {
  const row = registry.records.find(row => row.firestoreDocumentId === review.id);
  assert(row && !row.path.includes('..') && row.path.startsWith('records/'), `Tierbesitzerakte fehlt: ${review.name}`);
  const record = await read(`CharakterDatenbank/${row.path}`), person = snapshot.characters.find(person => person.id === review.id);
  assert.equal(record.character.id, review.id); assert(person);
  const character = reconcileReviewedCompanions(record.character, source.creatures, source.reviewedAt);
  const sourcePath = `Charakter Archiv Exporte/Tierbegleiter Abgleich 2026-11-02/${review.id}.json`;
  const exported = { type: 'aleria-character', mergeStrategy: 'replace-exported-fields', exportedAt: source.reviewedAt,
    character: { id: review.id, name: review.name, inventory: character.inventory, updatedAt: source.reviewedAt } };
  if (!isDeepStrictEqual(character.inventory, record.character.inventory)) {
    assert.deepEqual(record.character.inventory, source.characters.find(person => person.id === review.id).inventory, `Inventar inzwischen verändert: ${review.name}`);
    assert.deepEqual(person.inventory, record.character.inventory, `Akten weichen ab: ${review.name}`);
    character.updatedAt = source.reviewedAt;
    record.character = character; person.inventory = structuredClone(character.inventory); person.updatedAt = source.reviewedAt;
    if (!record.sources.firestoreExports.some(old => isDeepStrictEqual(old, exported.character))) record.sources.firestoreExports.push(exported.character);
    Object.assign(record.sync, { sourceArchive: sourcePath, sourceExportedAt: source.reviewedAt, sourceUpdatedAt: source.reviewedAt,
      contentHash: characterDatabaseContentHash(character, record.classification, record.sync.sourceDocumentIds) });
    person.localRecord.contentHash = record.sync.contentHash;
  }
  records.push({ path: row.path, record, snapshotCharacter: person }); exports.push({ sourcePath, exportedAt: source.reviewedAt });
  outputs.push([`CharakterDatenbank/${row.path}`, record], [sourcePath, exported]);
}
const projected = mergeCharacterRecordProjections({ registry, snapshot, report }, records, exports, snapshot.charTabs);
outputs.push(['CharakterDatenbank/registry.json', projected.registry], ['CharakterDatenbank/generated/characters.snapshot.json', projected.snapshot], ['CharakterDatenbank/generated/sync-report.json', projected.report]);
let changed = 0;
for (const [path, value] of outputs) {
  const text = JSON.stringify(value, null, 2) + '\n', url = new URL(path, root);
  const previous = await readFile(url, 'utf8').catch(error => { if (error.code !== 'ENOENT') throw error; return ''; });
  if (text === previous) continue;
  if (check) throw Error(`Tierbegleiterabgleich veraltet: ${path}`);
  await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, text); changed++;
}
console.log(JSON.stringify({ owners: records.length, companions: REVIEWED_COMPANION_OWNERS.reduce((sum, row) => sum + row.creatures.length, 0), changedFiles: changed, onlineWrites: 0 }));
