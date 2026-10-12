import { characterDatabaseContentHash } from './character-database-model.mjs';

// A scoped inventory update must not rebuild historical combat or genealogy fields
// from older export sources. This operation is pure; persistence stays with its caller.
export function updateCharacterDatabaseInventory(record, snapshotCharacter, inventory, { updatedAt, sourcePath }) {
  const id = record?.character?.id;
  if (!id || snapshotCharacter?.id !== id || record.schema !== 'aleria.character-record') {
    throw new Error('Figurenakte und Snapshot haben keine übereinstimmende Identität.');
  }
  if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory) || !updatedAt || !sourcePath) {
    throw new Error('Inventar, Änderungszeit und Quellbeleg werden benötigt.');
  }
  const next = structuredClone(record);
  next.character.inventory = structuredClone(inventory);
  next.character.updatedAt = updatedAt;
  const source = { id, name: next.character.name, inventory: structuredClone(inventory), updatedAt };
  next.sources.firestoreExports.push(source);
  const sourceDocumentIds = next.sources.firestoreExports.map(entry => entry.id).filter(Boolean);
  next.links.firestore.documentIds = sourceDocumentIds;
  next.links.firestore.documents.push({ documentId: id, createdAt: '', updatedAt });
  const contentHash = characterDatabaseContentHash(next.character, next.classification, sourceDocumentIds);
  next.sync = { ...next.sync, sourceArchive: sourcePath, sourceExportedAt: updatedAt,
    sourceUpdatedAt: updatedAt, sourceDocumentIds, contentHash };
  return {
    record: next,
    snapshotCharacter: { ...structuredClone(snapshotCharacter), inventory: structuredClone(inventory), updatedAt,
      localRecord: { ...structuredClone(snapshotCharacter.localRecord), contentHash, firestoreDocumentIds: sourceDocumentIds } }
  };
}
