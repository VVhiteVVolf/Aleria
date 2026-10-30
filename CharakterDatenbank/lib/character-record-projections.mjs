// Replace only explicitly selected records in the three database projections.
// Other characters, classifications, local notes and report details stay intact.
export function mergeCharacterRecordProjections({ registry, snapshot, report }, records, exports, charTabs) {
  const ids = new Set(records.map(item => item.snapshotCharacter.id));
  const recordIds = new Set(records.map(item => item.record.recordId));
  const nextRegistry = records.map(({ record, path }) => ({ recordId: record.recordId, name: record.identity.name, aliases: record.identity.aliases,
    worldPersonId: record.identity.worldPersonId, firestoreDocumentId: record.links.firestore.documentId, firestoreDocumentIds: record.links.firestore.documentIds,
    primary: record.classification.primary, familyStatus: record.classification.familyStatus, path, contentHash: record.sync.contentHash }));
  const registryRows = [...registry.records.filter(r => !recordIds.has(r.recordId)), ...nextRegistry];
  const characters = [...snapshot.characters.filter(c => !ids.has(c.id)), ...records.map(item => item.snapshotCharacter)];
  const overlays = [...new Set([...(registry.sourceOverlays || []), ...exports.map(e => e.sourcePath)])].sort();
  const latest = [...exports.map(e => e.exportedAt), registry.sourceExportedAt].filter(Boolean).sort().at(-1);
  const summary = { ...report.summary, sourceDocuments: registryRows.reduce((sum, row) => sum + (Array.isArray(row.firestoreDocumentIds) ? row.firestoreDocumentIds.length : 1), 0),
    total: registryRows.length };
  const counted = (key, count) => { summary[key] = registryRows.filter(count).length; };
  counted('familyLinked', r => r.familyStatus === 'linked'); counted('familyAmbiguous', r => r.familyStatus === 'ambiguous'); counted('familyPending', r => r.familyStatus === 'pending');
  for (const [key, kind] of Object.entries({ primaryFamily: 'family', primaryGroup: 'group', primaryPlace: 'place', primaryUnassigned: 'unassigned' })) counted(key, r => r.primary.kind === kind);
  const pending = records.filter(item => item.record.classification.familyStatus !== 'linked').map(({ record }) => ({ recordId: record.recordId, name: record.identity.name,
    status: record.classification.familyStatus, primary: record.classification.primary, familyAlternatives: record.classification.familyAlternatives }));
  return { records, registry: { ...registry, sourceOverlays: overlays, sourceExportedAt: latest, count: registryRows.length, records: registryRows },
    snapshot: { ...snapshot, sourceOverlays: overlays, sourceExportedAt: latest, charTabs, characters },
    report: { ...report, sourceExportedAt: latest, summary, pending: [...report.pending.filter(r => !recordIds.has(r.recordId)), ...pending] } };
}
