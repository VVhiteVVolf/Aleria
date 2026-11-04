import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { characterDatabaseContentHash } from '../../../CharakterDatenbank/lib/character-database-model.mjs';
import { hasExactReviewedTraitCopies, projectReviewedCharacterTraits, reviewedBiographyTraitCards, reviewedCharacterTraits } from './character-trait-review-model.js';
import { CHARACTER_TRAIT_REVIEW_VERSION } from './reviewed-character-traits.js';

export function createTraitReviewExport(assignment, reviewedAt, copies = reviewedCharacterTraits(assignment)) {
  assert(hasExactReviewedTraitCopies(copies, assignment), 'Der Reviewexport benötigt vollständige bestätigte Katalogkopien.');
  return { type: 'aleria-character', mergeStrategy: 'replace-combat-traits', exportedAt: reviewedAt,
    traitReview: { version: CHARACTER_TRAIT_REVIEW_VERSION, removeAbilityIds: assignment.removeAbilityIds || [], removeConditionIds: assignment.removeConditionIds || [] },
    character: { id: assignment.id, name: assignment.name, updatedAt: reviewedAt,
      combatProfile: { quirks: structuredClone(copies) },
      biography: { biography: { abilitiesTitle: 'Eigenschaften', abilities: reviewedBiographyTraitCards(assignment.id, copies) } } } };
}
export function projectTraitReviewRecord({ record, snapshotCharacter, baseline, assignment, reviewedAt, sourcePath, path }) {
  assert.equal(record.character.id, assignment.id);
  assert.equal(snapshotCharacter.id, assignment.id);
  const character = projectReviewedCharacterTraits(record.character, assignment);
  const exported = createTraitReviewExport(assignment, reviewedAt, character.combatProfile.quirks);
  const unchanged = isDeepStrictEqual(character, record.character);
  if (unchanged) return { record, snapshotCharacter, path, exported, changed: false };
  if (!isDeepStrictEqual(record.character.biography?.biography?.abilities, character.biography?.biography?.abilities)) {
    assert.deepEqual(record.character.biography?.biography?.abilities, baseline.biography?.biography?.abilities,
      `${assignment.name}: Der Persönlichkeitstext wurde inzwischen geändert.`);
    assert.deepEqual(snapshotCharacter.biography?.biography?.abilities, record.character.biography?.biography?.abilities,
      `${assignment.name}: Datensatz und Biografielesefassung weichen ab.`);
  }
  if (!isDeepStrictEqual(record.character.combatProfile.quirks, character.combatProfile.quirks)) assert.deepEqual(record.character.combatProfile.quirks, baseline.combatProfile.quirks, `${assignment.name}: Die bisherigen Eigenschaften wurden inzwischen geändert.`);
  for (const key of ['quirks', ...(assignment.removeAbilityIds?.length ? ['abilities'] : []), ...(assignment.removeConditionIds?.length ? ['conditions'] : [])]) {
    assert.deepEqual(snapshotCharacter.combatProfile[key], record.character.combatProfile[key], `${assignment.name}: Datensatz und Lesefassung weichen ab.`);
  }
  character.updatedAt = reviewedAt;
  const nextRecord = structuredClone(record), person = structuredClone(snapshotCharacter);
  nextRecord.character = character;
  person.combatProfile.quirks = structuredClone(character.combatProfile.quirks);
  if (assignment.removeAbilityIds?.length) person.combatProfile.abilities = structuredClone(character.combatProfile.abilities);
  if (assignment.removeConditionIds?.length) person.combatProfile.conditions = structuredClone(character.combatProfile.conditions);
  if (character.biography?.biography && person.biography?.biography) {
    person.biography.biography.abilitiesTitle = character.biography.biography.abilitiesTitle;
    person.biography.biography.abilities = structuredClone(character.biography.biography.abilities);
  }
  person.updatedAt = reviewedAt;
  const sources = nextRecord.sources.firestoreExports;
  if (!sources.some(source => isDeepStrictEqual(source, exported.character))) sources.push(structuredClone(exported.character));
  nextRecord.sync.sourceArchive = sourcePath;
  nextRecord.sync.sourceExportedAt = reviewedAt;
  nextRecord.sync.sourceUpdatedAt = reviewedAt;
  nextRecord.sync.contentHash = characterDatabaseContentHash(character, nextRecord.classification, nextRecord.sync.sourceDocumentIds);
  person.localRecord.contentHash = nextRecord.sync.contentHash;
  return { record: nextRecord, snapshotCharacter: person, path, exported, changed: true };
}
