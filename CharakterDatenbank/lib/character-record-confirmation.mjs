import assert from 'node:assert/strict';
import { characterDatabaseContentHash } from './character-database-model.mjs';

const latest = (...values) => values.filter(value => Number.isFinite(Date.parse(value))).sort().at(-1) || '';

// A fully registered, newer confirmation owns the record until a later review.
export function hasNewerCharacterRecordProjection({ record, registry, snapshot, sourcePath, exportedAt }) {
  const archive = record.sync.sourceArchive;
  if (archive === sourcePath || !(Date.parse(record.sync.sourceExportedAt) > Date.parse(exportedAt))) return false;
  assert.ok(archive?.startsWith('Charakter Archiv Exporte/') && archive.endsWith('.json') && !archive.includes('..'));
  assert.ok([registry, snapshot].every(index => index.sourceOverlays?.includes(archive)),
    'Neuere Ausrüstungsprojektion ist nicht vollständig registriert.');
  return true;
}

// Callers own their bounded field merge; this function owns receipt bookkeeping.
export function confirmCharacterRecordProjection({ record, snapshotCharacter, path, character, person, exportedCharacter, sourcePath, now }) {
  assert(Number.isFinite(Date.parse(now)));
  assert(sourcePath.startsWith('Charakter Archiv Exporte/') && sourcePath.endsWith('.json') && !sourcePath.includes('..'));
  assert.equal(character.id, record.character.id);
  assert.equal(person.id, snapshotCharacter.id);
  const nextRecord = structuredClone(record);
  nextRecord.character = structuredClone(character);
  person = structuredClone(person);
  const exported = { type: 'aleria-character', version: 1, exportedAt: now, mergeStrategy: 'replace-exported-fields', sourcePath, character: structuredClone(exportedCharacter) };
  if (!nextRecord.sources.firestoreExports.some(source => JSON.stringify(source) === JSON.stringify(exported.character))) {
    nextRecord.sources.firestoreExports.push(structuredClone(exported.character));
    nextRecord.sync.sourceDocumentIds.push(character.id);
    nextRecord.links.firestore.documentIds.push(character.id);
    nextRecord.links.firestore.documents.push({ documentId: character.id, createdAt: '', updatedAt: exported.character.updatedAt });
  }
  nextRecord.sync.sourceArchive = sourcePath;
  nextRecord.sync.sourceExportedAt = latest(nextRecord.sync.sourceExportedAt, now);
  nextRecord.sync.sourceUpdatedAt = character.updatedAt;
  nextRecord.sync.contentHash = characterDatabaseContentHash(character, nextRecord.classification, nextRecord.sync.sourceDocumentIds);
  person.localRecord.contentHash = nextRecord.sync.contentHash;
  person.localRecord.firestoreDocumentIds = structuredClone(nextRecord.sync.sourceDocumentIds);
  return { projection: { record: nextRecord, path, snapshotCharacter: person }, exported };
}
