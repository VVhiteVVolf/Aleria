import assert from 'node:assert/strict';
import { characterDatabaseContentHash } from '../../../CharakterDatenbank/lib/character-database-model.mjs';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { hasNewerCharacterRecordProjection } from '../../../CharakterDatenbank/lib/character-record-confirmation.mjs';
import { GAWAIN_ID, GAWAIN_WORLD_ID, GAWAIN_PUBLIC_TITLE, GAWAIN_PUBLIC_SUMMARY, withGawainPublicBiography } from './gawain-public-biography.mjs';
import { hasExactReviewedBiographyTraitCards } from '../character-trait-review/character-trait-review-model.js';

const biographyFields = ['title', 'bio', 'biography'];
const latestTimestamp = (...values) => values.filter(value => Number.isFinite(Date.parse(value))).sort((a, b) => Date.parse(a) - Date.parse(b)).at(-1) || '';

// Refresh only this reviewed public biography on the existing database basis.
// The general archive sync may also contain unrelated classification changes;
// this projection never rebuilds identities, classifications or runtime data.
export function projectGawainCharacterDatabase({ registry, snapshot, report, record, exported, sourcePath }) {
  assert.equal(exported.type, 'aleria-character');
  assert.equal(exported.mergeStrategy, 'replace-exported-fields');
  assert.equal(exported.character?.id, GAWAIN_ID);
  assert.equal(exported.character?.name, 'Gawain Draig');
  assert.deepEqual(Object.keys(exported.character).sort(), ['id', 'name', 'title', 'bio', 'biography', 'updatedAt'].sort(), 'Der biografische Export darf keine weiteren Profilfelder liefern.');
  assert.equal(exported.character.title, GAWAIN_PUBLIC_TITLE);
  assert.equal(exported.character.bio, GAWAIN_PUBLIC_SUMMARY);
  const approvedBiography = withGawainPublicBiography({ id: GAWAIN_ID }).biography;
  const cards = exported.character.biography?.biography?.abilities;
  if (hasExactReviewedBiographyTraitCards(cards, GAWAIN_ID)) approvedBiography.biography.abilities = structuredClone(cards);
  assert.deepEqual(exported.character.biography, approvedBiography, 'Gawains Export muss der vollstaendigen freigegebenen Biografie entsprechen.');
  assert.ok(Number.isFinite(Date.parse(exported.exportedAt)) && Number.isFinite(Date.parse(exported.character.updatedAt)));
  assert.ok(typeof sourcePath === 'string' && sourcePath.startsWith('Charakter Archiv Exporte/') && sourcePath.endsWith('.json') && !sourcePath.includes('..'));
  assert.equal(record.character.id, GAWAIN_ID);
  assert.equal(record.identity.worldPersonId, GAWAIN_WORLD_ID);
  assert.equal(record.links.firestore.documentId, GAWAIN_ID);
  const entries = registry.records.filter(row => row.firestoreDocumentId === GAWAIN_ID);
  const people = snapshot.characters.filter(row => row.id === GAWAIN_ID);
  assert.equal(entries.length, 1, 'Gawains Datenbankindex muss eindeutig sein.');
  assert.equal(people.length, 1, 'Gawains Datenbank-Snapshot muss eindeutig sein.');
  assert.equal(entries[0].recordId, record.recordId);
  assert.equal(people[0].localRecord.recordId, record.recordId);
  assert.equal(people[0].localRecord.path, entries[0].path);

  if (hasNewerCharacterRecordProjection({ record, registry, snapshot, sourcePath, exportedAt: exported.exportedAt })) {
    return { registry, snapshot, report, records: [{ record, path: entries[0].path, snapshotCharacter: people[0] }] };
  }

  const nextRecord = structuredClone(record), person = structuredClone(people[0]);
  for (const field of biographyFields) {
    nextRecord.character[field] = structuredClone(exported.character[field]);
    person[field] = structuredClone(exported.character[field]);
  }
  nextRecord.character.updatedAt = latestTimestamp(record.character.updatedAt, exported.character.updatedAt);
  person.updatedAt = latestTimestamp(person.updatedAt, exported.character.updatedAt);
  // Keep the original source documents and their order, recording this partial
  // export once just as the shared archive model records each source document.
  const sources = nextRecord.sources.firestoreExports;
  const knownSource = sources.some(source => JSON.stringify(source) === JSON.stringify(exported.character));
  if (!knownSource) {
    sources.push(structuredClone(exported.character));
    nextRecord.sync.sourceDocumentIds.push(GAWAIN_ID);
    nextRecord.links.firestore.documentIds.push(GAWAIN_ID);
    nextRecord.links.firestore.documents.push({ documentId: GAWAIN_ID, createdAt: '', updatedAt: exported.character.updatedAt });
  }
  nextRecord.sync.sourceArchive = sourcePath;
  nextRecord.sync.sourceExportedAt = latestTimestamp(nextRecord.sync.sourceExportedAt, exported.exportedAt);
  nextRecord.sync.sourceUpdatedAt = nextRecord.character.updatedAt;
  nextRecord.sync.contentHash = characterDatabaseContentHash(nextRecord.character, nextRecord.classification, nextRecord.sync.sourceDocumentIds);
  person.localRecord.contentHash = nextRecord.sync.contentHash;
  person.localRecord.firestoreDocumentIds = structuredClone(nextRecord.sync.sourceDocumentIds);
  const preservedSources = [...new Set([...(registry.sourceOverlays || []), ...(snapshot.sourceOverlays || [])])];
  return mergeCharacterRecordProjections({ registry: { ...registry, sourceOverlays: preservedSources }, snapshot, report },
    [{ record: nextRecord, path: entries[0].path, snapshotCharacter: person }],
    [{ sourcePath, exportedAt: exported.exportedAt }], snapshot.charTabs);
}
