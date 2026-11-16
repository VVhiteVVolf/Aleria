import assert from 'node:assert/strict';
import { confirmCharacterRecordProjection, hasNewerCharacterRecordProjection } from '../../../CharakterDatenbank/lib/character-record-confirmation.mjs';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { ZITTERAALE_LEADERS } from './zitteraale-people.mjs';

export const ZITTERAALE_AUTHORED_AT = '2026-11-16T18:00:00Z';
const sourcePathFor = id => `Charakter Archiv Exporte/Schwarze Zitteraale/${id}-2026-11-16.json`;

// Only the commissioned names, aliases, titles and public summaries are changed.
// The shared confirmation owns source history and projection hashes.
export function projectZitteraaleCharacterUpdates({ registry, snapshot, report, records }) {
  const projections = [], exports = [];
  for (const person of ZITTERAALE_LEADERS.slice(1)) {
    const row = registry.records.find(row => row.firestoreDocumentId === person.characterId);
    const record = records.find(record => record.character.id === person.characterId);
    const snapshotCharacter = snapshot.characters.find(character => character.id === person.characterId);
    assert(row && record && snapshotCharacter, `Fehlende bestehende Zitteraal-Figur ${person.characterId}`);
    const sourcePath = sourcePathFor(person.characterId);
    if (hasNewerCharacterRecordProjection({ record, registry, snapshot, sourcePath, exportedAt: ZITTERAALE_AUTHORED_AT })) {
      projections.push({ record, path: row.path, snapshotCharacter });
      continue;
    }
    const fields = {
      name: person.name, aliases: [], title: person.role,
      bio: `${person.background}\n\n${person.character}\n\n${person.method}`, updatedAt: ZITTERAALE_AUTHORED_AT
    };
    const character = { ...structuredClone(record.character), ...fields };
    const currentPerson = { ...structuredClone(snapshotCharacter), ...fields };
    const namedRecord = { ...record, identity: { ...record.identity, name: person.name, aliases: [] } };
    const result = confirmCharacterRecordProjection({ record: namedRecord, snapshotCharacter, path: row.path,
      character, person: currentPerson, exportedCharacter: { id: person.characterId, ...fields }, sourcePath, now: ZITTERAALE_AUTHORED_AT });
    projections.push(result.projection);
    exports.push(result.exported);
  }
  const result = mergeCharacterRecordProjections({ registry, snapshot, report }, projections, exports, snapshot.charTabs);
  return { ...result, exports };
}
