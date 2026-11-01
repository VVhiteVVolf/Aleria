import test from 'node:test';
import assert from 'node:assert/strict';
import { projectGawainCharacterDatabase } from '../modules/gawain-duncan/gawain-character-database.mjs';
import { GAWAIN_ID, GAWAIN_WORLD_ID, GAWAIN_PUBLIC_TITLE, GAWAIN_PUBLIC_SUMMARY, withGawainPublicBiography } from '../modules/gawain-duncan/gawain-public-biography.mjs';

function fixture() {
  const sourcePath = 'Charakter Archiv Exporte/gawain-public.json', exportedAt = '2026-11-01T03:46:32.000Z';
  const character = { id: GAWAIN_ID, name: 'Gawain Draig', title: 'Alter Titel', bio: 'Alter Einzeiler', biography: {},
    updatedAt: '2026-10-11T00:00:00.000Z', inventory: { revision: 99, items: [{ id: 'unique-blade' }], moneyState: { totalCopper: 12 } },
    combatProfile: { revision: 81, hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 3 }], statuses: [{ id: 'old' }] },
    attributes: { STR: 18 }, localRecord: { legacy: 'kept' } };
  const record = { recordId: 'character--gawain', slug: 'gawain-original', schema: 'aleria.character-record', schemaVersion: 1,
    identity: { name: 'Gawain Draig', worldPersonId: GAWAIN_WORLD_ID, aliases: ['Gawain'] },
    classification: { primary: { kind: 'family', id: 'haus-draig' }, familyStatus: 'linked', families: [{ id: 'old-family-link' }] },
    links: { firestore: { documentId: GAWAIN_ID, documentIds: [GAWAIN_ID], documents: [{ documentId: GAWAIN_ID, updatedAt: character.updatedAt }] }, familyTree: [{ id: 'old-link' }] },
    sync: { contentHash: 'old-hash', sourceDocumentIds: [GAWAIN_ID], sourceExportedAt: character.updatedAt, sourceUpdatedAt: character.updatedAt, sourceArchive: 'old-archive.json' },
    local: { notes: 'Authored note', references: ['original'] }, sources: { firestoreExports: [structuredClone(character)] }, character };
  const entry = { recordId: record.recordId, name: 'Gawain Draig', firestoreDocumentId: GAWAIN_ID, firestoreDocumentIds: [GAWAIN_ID],
    path: 'records/familien/haus-draig/gawain/character.json', primary: record.classification.primary, familyStatus: 'linked' };
  const other = { recordId: 'character--other', firestoreDocumentId: 'other', name: 'Other', primary: { kind: 'group', id: 'untouched' }, familyStatus: 'pending', firestoreDocumentIds: ['other'], path: 'records/kept/character.json' };
  const person = { ...structuredClone(character), localRecord: { recordId: record.recordId, path: entry.path, contentHash: 'old-hash', classification: { kept: true }, firestoreDocumentIds: [GAWAIN_ID] } };
  return { record, sourcePath, exported: { type: 'aleria-character', mergeStrategy: 'replace-exported-fields', exportedAt,
    character: { ...withGawainPublicBiography({ id: GAWAIN_ID, name: 'Gawain Draig' }), updatedAt: exportedAt } },
    registry: { count: 2, sourceOverlays: ['Charakter Archiv Exporte/already-approved/nested.json'], sourceExportedAt: '2026-10-31T00:00:00Z', records: [entry, other] },
    snapshot: { sourceOverlays: ['Charakter Archiv Exporte/also-approved/nested.json'], charTabs: { groups: [{ id: 'kept' }] }, characters: [person, { id: 'other', inventory: { items: [{ id: 'other-item' }] }, title: 'No edit' }] },
    report: { summary: { total: 2, sourceDocuments: 2 }, pending: [{ recordId: 'character--other', original: 'keep exact' }], duplicates: [{ original: 'keep exact' }] } };
}

test('Gawain public biography refresh preserves gameplay, classification, local work and every unselected projection', () => {
  const input = fixture(), before = structuredClone(input), result = projectGawainCharacterDatabase(input);
  assert.deepEqual(input, before);
  const record = result.records[0].record, person = result.snapshot.characters[0];
  assert.equal(record.character.title, GAWAIN_PUBLIC_TITLE);
  assert.equal(person.bio, GAWAIN_PUBLIC_SUMMARY);
  assert.deepEqual(person.biography, before.exported.character.biography);
  for (const field of ['inventory', 'combatProfile', 'attributes', 'id', 'localRecord']) assert.deepEqual(record.character[field], before.record.character[field]);
  for (const field of ['inventory', 'combatProfile', 'attributes', 'id']) assert.deepEqual(person[field], before.snapshot.characters[0][field]);
  for (const field of ['recordId', 'slug', 'identity', 'classification', 'local']) assert.deepEqual(record[field], before.record[field]);
  assert.deepEqual(record.links.familyTree, before.record.links.familyTree);
  assert.equal(result.records[0].path, before.registry.records[0].path);
  assert.deepEqual(person.localRecord.classification, before.snapshot.characters[0].localRecord.classification);
  assert.deepEqual(result.registry.records[1], before.registry.records[1]);
  assert.deepEqual(result.snapshot.characters[1], before.snapshot.characters[1]);
  assert.deepEqual(result.report.pending, before.report.pending);
  assert.deepEqual(result.report.duplicates, before.report.duplicates);
  assert.deepEqual(result.snapshot.charTabs, before.snapshot.charTabs);
  assert.equal(result.registry.count, 2);
  assert.equal(result.report.summary.sourceDocuments, 3);
  assert.deepEqual(record.sources.firestoreExports[0], before.record.sources.firestoreExports[0]);
  assert.deepEqual(record.sources.firestoreExports[1], before.exported.character);
  for (const path of [...before.registry.sourceOverlays, ...before.snapshot.sourceOverlays, before.sourcePath]) assert.ok(result.registry.sourceOverlays.includes(path));
});

test('the same reviewed export is idempotent and never duplicates provenance or timestamps', () => {
  const input = fixture(), first = projectGawainCharacterDatabase(input);
  const next = projectGawainCharacterDatabase({ ...input, registry: first.registry, snapshot: first.snapshot, report: first.report, record: first.records[0].record });
  assert.deepEqual(next, first);
  assert.equal(next.records[0].record.sources.firestoreExports.length, 2);
});

test('unexpected gameplay source fields or ambiguous identity abort instead of broadening a biography import', () => {
  const gameplay = fixture(); gameplay.exported.character.inventory = { items: [] };
  assert.throws(() => projectGawainCharacterDatabase(gameplay), /keine weiteren Profilfelder/);
  const duplicate = fixture(); duplicate.snapshot.characters.push(structuredClone(duplicate.snapshot.characters[0]));
  assert.throws(() => projectGawainCharacterDatabase(duplicate), /eindeutig/);
  const wrong = fixture(); wrong.record.identity.worldPersonId = 'someone-else';
  assert.throws(() => projectGawainCharacterDatabase(wrong));
});
