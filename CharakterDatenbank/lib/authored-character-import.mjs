import { buildCharacterDatabase } from './character-database-model.mjs';
import { mergeCharacterExportAssignments } from './character-export-assignments.mjs';

// A bounded addition of newly authored people. It never re-exports unrelated
// records or reapplies old equipment releases to the entire database.
export function buildAuthoredCharacterImport({ registry, snapshot, report }, exports, feature) {
  if (!/^[a-z0-9-]+$/.test(feature)) throw Error('Ungültiger Feature-Schlüssel.');
  for (const entry of exports) if (entry.type !== 'aleria-character' || !entry.character?.id || !entry.sourcePath) throw Error('Einzelfigurenexport erwartet.');
  const ids = new Set(exports.map(e => e.character.id));
  if (ids.size !== exports.length) throw Error('Doppelte Figuren-ID im Import.');
  for (const existing of snapshot.characters.filter(c => ids.has(c.id))) {
    if (existing.localRecord?.authoredFeature !== feature) throw Error(`Bestehende Figur ${existing.id} wird nicht überschrieben.`);
  }
  const charTabs = mergeCharacterExportAssignments(snapshot.charTabs, exports);
  const records = exports.flatMap(entry => buildCharacterDatabase({ characters: [entry.character], charTabs, exportedAt: entry.exportedAt }, [], { sourcePath: entry.sourcePath }).records);
  for (const item of records) {
    item.record.local.authoredFeature = feature;
    item.snapshotCharacter.localRecord.authoredFeature = feature;
  }
  const recordIds = new Set(records.map(item => item.record.recordId));
  const nextRegistry = records.map(({ record, path }) => ({ recordId: record.recordId, name: record.identity.name, aliases: record.identity.aliases,
    worldPersonId: record.identity.worldPersonId, firestoreDocumentId: record.links.firestore.documentId, firestoreDocumentIds: record.links.firestore.documentIds,
    primary: record.classification.primary, familyStatus: record.classification.familyStatus, path, contentHash: record.sync.contentHash }));
  const registryRows = [...registry.records.filter(r => !recordIds.has(r.recordId)), ...nextRegistry];
  const characters = [...snapshot.characters.filter(c => !ids.has(c.id)), ...records.map(item => item.snapshotCharacter)];
  const overlays = [...new Set([...(registry.sourceOverlays || []), ...exports.map(e => e.sourcePath)])].sort();
  const latest = [...exports.map(e=>e.exportedAt), registry.sourceExportedAt].filter(Boolean).sort().at(-1);
  const summary = { ...report.summary, sourceDocuments: report.summary.sourceDocuments + records.filter(item=>!registry.records.some(r=>r.recordId===item.record.recordId)).length,
    total: registryRows.length };
  const counted = (key, count) => { summary[key] = registryRows.filter(count).length; };
  counted('familyLinked', r=>r.familyStatus==='linked'); counted('familyAmbiguous', r=>r.familyStatus==='ambiguous'); counted('familyPending', r=>r.familyStatus==='pending');
  for (const [key,kind] of Object.entries({primaryFamily:'family',primaryGroup:'group',primaryPlace:'place',primaryUnassigned:'unassigned'})) counted(key,r=>r.primary.kind===kind);
  const pending = records.filter(item=>item.record.classification.familyStatus!=='linked').map(({record})=>({recordId:record.recordId,name:record.identity.name,
    status:record.classification.familyStatus,primary:record.classification.primary,familyAlternatives:record.classification.familyAlternatives}));
  return { records, registry: { ...registry, sourceOverlays: overlays, sourceExportedAt: latest, count: registryRows.length, records: registryRows },
    snapshot: { ...snapshot, sourceOverlays: overlays, sourceExportedAt: latest, charTabs, characters },
    report: { ...report, sourceExportedAt: latest, summary, pending: [...report.pending.filter(r=>!recordIds.has(r.recordId)), ...pending] } };
}
