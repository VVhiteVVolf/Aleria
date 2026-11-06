import assert from 'node:assert/strict';
import { confirmCharacterRecordProjection } from '../../../CharakterDatenbank/lib/character-record-confirmation.mjs';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { MARKET_CHARACTERS } from './characters.mjs';
import { assertMarketAvatarManifest, buildMarketAvatarPatch, MARKET_AVATAR_PATCH_FIELDS } from './avatar-plan.mjs';

export function projectMarketAvatarDatabase({ registry, snapshot, report, existingRecords }, confirmation, manifest) {
  assert(confirmation.verified && confirmation.preservedOtherFields && confirmation.profiles === 3, 'Bestätigter Avatarbeleg fehlt.');
  assert.equal(confirmation.entries?.length, 3);
  assertMarketAvatarManifest(manifest, { published: true });
  const projections = [], exports = [];
  for (const person of MARKET_CHARACTERS) {
    const confirmed = confirmation.entries.find(entry => entry.id === person.id);
    assert(confirmed?.name === person.name && Object.keys(confirmed.patch).every(key => MARKET_AVATAR_PATCH_FIELDS.includes(key)), 'Unbegrenzter Avatarpatch.');
    const record = existingRecords.find(record => record.character.id === person.id);
    const row = registry.records.find(row => row.firestoreDocumentId === person.id);
    const snapshotCharacter = snapshot.characters.find(character => character.id === person.id);
    assert(record && row && snapshotCharacter, 'Vorhandene lokale Zielakte fehlt.');
    const source = manifest.characters.find(character => character.id === person.id);
    for (const character of [record.character, snapshotCharacter]) {
      const expected = buildMarketAvatarPatch(character, source, manifest, confirmation.confirmedAt);
      if (Object.keys(expected).length) assert.deepEqual(expected, confirmed.patch, 'Abweichender lokaler Bildentwurf wird erhalten.');
      else for (const key of Object.keys(confirmed.patch)) assert.deepEqual(character[key], confirmed.patch[key], 'Neuere lokale Medienänderung wird erhalten.');
    }
    const sourcePath = `Charakter Archiv Exporte/Gwynthor Markt Haendler/Avatare/${person.slug}-handeln-set-01.json`;
    const next = confirmCharacterRecordProjection({ record, snapshotCharacter, path: row.path,
      character: { ...record.character, ...confirmed.patch }, person: { ...snapshotCharacter, ...confirmed.patch },
      exportedCharacter: { id: person.id, name: person.name, ...confirmed.patch }, sourcePath, now: confirmation.confirmedAt });
    projections.push(next.projection); exports.push(next.exported);
  }
  const result = mergeCharacterRecordProjections({ registry, snapshot, report }, projections, exports, snapshot.charTabs);
  const ids = new Set(MARKET_CHARACTERS.map(person => person.id));
  for (const character of snapshot.characters.filter(character => !ids.has(character.id))) assert.deepEqual(result.snapshot.characters.find(next => next.id === character.id), character);
  for (const row of registry.records.filter(row => !ids.has(row.firestoreDocumentId))) assert.deepEqual(result.registry.records.find(next => next.recordId === row.recordId), row);
  assert.deepEqual(result.snapshot.charTabs, snapshot.charTabs);
  return { ...result, exports };
}
