import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { characterDatabaseContentHash } from './character-database-model.mjs';

const FIELDS = ['biography', 'title', 'role', 'bio', 'genealogy'];
// The biography publication owns exactly these leaves, never a historical
// inventory, combat profile or source history bundled into the old export.
export function preserveBalchderCurrentFields(projected, current, snapshotCharacter) {
  assert.equal(projected.record.character.id, current.character.id);
  assert.equal(snapshotCharacter.id, current.character.id);
  assert.equal(projected.record.identity.worldPersonId, current.identity.worldPersonId);
  const old = structuredClone(current), person = structuredClone(snapshotCharacter);
  const publication = projected.record.character;
  const patch = Object.fromEntries(FIELDS.filter(key => Object.hasOwn(publication, key)).map(key => [key, structuredClone(publication[key])]));
  if (Object.entries(patch).every(([key, value]) => isDeepStrictEqual(value, current.character[key]))) return { ...projected, record: old, snapshotCharacter: person };
  Object.assign(old.character, patch); Object.assign(person, structuredClone(patch));
  const now = [current.character.updatedAt, publication.updatedAt].filter(Boolean).sort().at(-1);
  if (now) old.character.updatedAt = person.updatedAt = now;
  for (const source of projected.record.sources.firestoreExports) if (!old.sources.firestoreExports.some(existing => isDeepStrictEqual(existing, source))) old.sources.firestoreExports.push(structuredClone(source));
  old.sync.contentHash = characterDatabaseContentHash(old.character, old.classification, old.sync.sourceDocumentIds);
  person.localRecord.contentHash = old.sync.contentHash;
  return { ...projected, record: old, snapshotCharacter: person };
}
