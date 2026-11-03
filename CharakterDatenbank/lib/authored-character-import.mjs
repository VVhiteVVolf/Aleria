import { buildCharacterDatabase } from './character-database-model.mjs';
import { mergeCharacterExportAssignments } from './character-export-assignments.mjs';
import { mergeCharacterRecordProjections } from './character-record-projections.mjs';
import { hasNewerCharacterRecordProjection } from './character-record-confirmation.mjs';

// A bounded addition of newly authored people. It never re-exports unrelated
// records or reapplies old equipment releases to the entire database.
export function buildAuthoredCharacterImport({ registry, snapshot, report, existingRecords = [] }, exports, feature, familyCandidates = []) {
  if (!/^[a-z0-9-]+$/.test(feature)) throw Error('Ungültiger Feature-Schlüssel.');
  for (const entry of exports) if (entry.type !== 'aleria-character' || !entry.character?.id || !entry.sourcePath) throw Error('Einzelfigurenexport erwartet.');
  const ids = new Set(exports.map(e => e.character.id));
  if (ids.size !== exports.length) throw Error('Doppelte Figuren-ID im Import.');
  for (const existing of snapshot.characters.filter(c => ids.has(c.id))) {
    if (existing.localRecord?.authoredFeature !== feature) throw Error(`Bestehende Figur ${existing.id} wird nicht überschrieben.`);
  }
  const charTabs = mergeCharacterExportAssignments(snapshot.charTabs, exports);
  const records = exports.flatMap(entry => buildCharacterDatabase({ characters: [entry.character], charTabs, exportedAt: entry.exportedAt }, familyCandidates, { sourcePath: entry.sourcePath }).records);
  for (const item of records) {
    const current = existingRecords.find(record => record.character.id === item.record.character.id);
    const source = exports.find(entry => entry.character.id === item.record.character.id);
    if (current && hasNewerCharacterRecordProjection({ record: current, registry, snapshot,
      sourcePath: source.sourcePath, exportedAt: source.exportedAt })) {
      const previous = registry.records.find(row => row.recordId === current.recordId);
      item.record = current; item.path = previous.path;
      item.snapshotCharacter = snapshot.characters.find(character => character.id === current.character.id);
      continue;
    }
    item.record.local.authoredFeature = feature;
    item.snapshotCharacter.localRecord.authoredFeature = feature;
  }
  return mergeCharacterRecordProjections({ registry, snapshot, report }, records, exports, charTabs);
}
