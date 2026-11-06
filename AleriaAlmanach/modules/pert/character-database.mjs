import assert from 'node:assert/strict';
import { buildAuthoredCharacterImport } from '../../../CharakterDatenbank/lib/authored-character-import.mjs';
import { buildCharacterDatabase, normalizeCharacterDatabaseKey } from '../../../CharakterDatenbank/lib/character-database-model.mjs';
import { confirmCharacterRecordProjection, hasNewerCharacterRecordProjection } from '../../../CharakterDatenbank/lib/character-record-confirmation.mjs';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { buildPertCharacterExports, pertCandidates, PERT_CHARACTER_FEATURE, PERT_KEVAN_ID, PERT_EXISTING_CHARACTER_FIELDS } from './character-content.mjs';

// Apply this content to the caller's own database basis. In particular, a public
// release must retain its public inventory/history rather than copy Main's.
export function projectPertCharacterDatabase({ registry, snapshot, report, existingRecords }, familyRecord) {
  const exports = buildPertCharacterExports(familyRecord);
  const candidates = pertCandidates(familyRecord);
  const selectedIds = new Set(exports.map(entry => entry.character.id));
  const selectedWorldIds = new Set(candidates.map(candidate => candidate.worldPersonId));
  const existingKevan = existingRecords.find(record => record.character.id === PERT_KEVAN_ID);
  assert.ok(existingKevan, 'Kevans bestehende Akte muss auf dieser Basis vorhanden sein.');
  assert.equal(existingKevan.identity.name, 'Kevan Pert');
  const kevanPortrait = exports.find(entry => entry.character.id === PERT_KEVAN_ID).character.portrait;
  assert.ok(['https://i.imgur.com/Sl4ntci.png', kevanPortrait].includes(existingKevan.character.portrait));
  assert.ok(!existingKevan.character.imageSets?.length && !existingKevan.character.activeImageSetId,
    'Ein explizites Kevan-Bildset erfordert einen gesonderten Medienabgleich.');
  assert.ok(!existingKevan.identity.worldPersonId || existingKevan.identity.worldPersonId === 'person--pert--person-52becf61');
  const identityAudit = candidates.map(candidate => {
    const expectedId = candidate.personId === 'person-52becf61' ? PERT_KEVAN_ID : candidate.worldPersonId;
    const matches = snapshot.characters.filter(person => person.id === expectedId
      || [person.identity?.worldPersonId, person.genealogy?.worldPersonId].includes(candidate.worldPersonId)
      || normalizeCharacterDatabaseKey(person.name) === normalizeCharacterDatabaseKey(candidate.displayName));
    assert.ok(matches.every(person => person.id === expectedId), `Fremde Namens-/Weltidentität für ${candidate.displayName}; fachlichen Abgleich zuerst durchführen.`);
    return { personId: candidate.personId, worldPersonId: candidate.worldPersonId, runtimeId: expectedId,
      name: candidate.displayName, matchedRuntimeIds: matches.map(person => person.id) };
  });
  assert.ok(registry.records.filter(row => selectedWorldIds.has(row.worldPersonId)).every(row => selectedIds.has(row.firestoreDocumentId)), 'Eine Pert-Weltperson ist bereits anders registriert.');
  const basis = { registry: { ...registry, sourceOverlays: [...new Set([...(registry.sourceOverlays || []), ...(snapshot.sourceOverlays || [])])] }, snapshot, report, existingRecords };
  const newExports = exports.filter(entry => entry.character.id !== PERT_KEVAN_ID);
  const newResult = buildAuthoredCharacterImport(basis, newExports, PERT_CHARACTER_FEATURE, candidates);
  const exported = exports.find(entry => entry.character.id === PERT_KEVAN_ID);
  assert.deepEqual(Object.keys(exported.character).sort(), ['id', 'name', ...PERT_EXISTING_CHARACTER_FIELDS].sort());
  const rows = registry.records.filter(row => row.firestoreDocumentId === PERT_KEVAN_ID);
  const people = snapshot.characters.filter(person => person.id === PERT_KEVAN_ID);
  assert.equal(rows.length, 1); assert.equal(people.length, 1);
  const [row] = rows, [priorPerson] = people;
  assert.equal(row.recordId, existingKevan.recordId);
  assert.equal(priorPerson.localRecord.path, row.path);
  let projection;
  if (hasNewerCharacterRecordProjection({ record: existingKevan, registry, snapshot, sourcePath: exported.sourcePath, exportedAt: exported.exportedAt })) {
    projection = { record: existingKevan, path: row.path, snapshotCharacter: priorPerson };
  } else {
    const next = structuredClone(existingKevan), person = structuredClone(priorPerson);
    const character = structuredClone(existingKevan.character);
    for (const field of PERT_EXISTING_CHARACTER_FIELDS) {
      const value = field === 'identity' ? { ...character.identity, worldPersonId: exported.character.identity.worldPersonId }
        : field === 'updatedAt' ? [character.updatedAt, exported.character.updatedAt].filter(Boolean).sort().at(-1)
          : exported.character[field];
      character[field] = structuredClone(value);
      person[field] = structuredClone(value);
    }
    // Shared family matching owns all family link fields. The established place
    // classification, path, local annotations and every runtime field survive.
    const [linked] = buildCharacterDatabase({ characters: [character], charTabs: snapshot.charTabs,
      exportedAt: exported.exportedAt }, candidates, { sourcePath: exported.sourcePath }).records;
    assert.equal(linked.record.classification.familyStatus, 'linked');
    next.identity.worldPersonId = character.identity.worldPersonId;
    for (const key of ['familyStatus', 'families', 'familyAlternatives']) next.classification[key] = structuredClone(linked.record.classification[key]);
    for (const key of ['familyStatus', 'families']) person.localRecord.classification[key] = structuredClone(linked.snapshotCharacter.localRecord.classification[key]);
    next.links.familyTree = structuredClone(linked.record.links.familyTree);
    ({ projection } = confirmCharacterRecordProjection({ record: next, snapshotCharacter: priorPerson, path: row.path,
      character, person, exportedCharacter: exported.character, sourcePath: exported.sourcePath, now: exported.exportedAt }));
  }
  const result = mergeCharacterRecordProjections(newResult, [projection], [exported], newResult.snapshot.charTabs);
  result.records = [...newResult.records, projection];
  return { ...result, exports, identityAudit };
}
