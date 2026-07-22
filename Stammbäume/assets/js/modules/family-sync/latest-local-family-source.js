import {
  listFamilyRecords,
  loadFamilyById,
  normalizeFamilyId
} from '../../services/family-library.js';

function folderPathFromFamily(family, fallback = []) {
  const folderPath = family?.extensions?.registry?.folderPath;
  return Array.isArray(folderPath)
    ? folderPath.map(String).filter(Boolean)
    : [...fallback];
}

function createDraftRecord(draft, fallback = null) {
  const family = draft.family;
  return Object.freeze({
    ...(fallback || {}),
    id: family.document.id,
    title: family.document.title,
    folderPath: Object.freeze(folderPathFromFamily(family, fallback?.folderPath)),
    updatedAt: draft.updatedAt,
    source: 'local-draft',
    family
  });
}

/**
 * Read-only source for relationship workflows. A locally autosaved draft is the
 * newest local representation and therefore takes precedence over the family
 * register. The register remains the fallback and supplies display metadata.
 */
export function createLatestLocalFamilySource({
  draftRepository,
  storage = globalThis.localStorage
}) {
  if (!draftRepository?.loadDraft) {
    throw new Error('Die lokale Familienquelle benötigt ein Draft-Repository.');
  }

  function loadById(familyId) {
    const normalizedId = normalizeFamilyId(familyId);
    if (!normalizedId) return null;
    const registered = loadFamilyById(normalizedId, storage);
    const draft = draftRepository.loadDraft(normalizedId);
    return draft ? createDraftRecord(draft, registered) : registered;
  }

  function listRecords() {
    const records = listFamilyRecords(storage);
    const byId = new Map(records.map(record => [record.id, record]));
    (draftRepository.listDrafts?.() || []).forEach(draft => {
      const familyId = draft.family.document.id;
      byId.set(familyId, createDraftRecord(draft, byId.get(familyId)));
    });
    return [...byId.values()]
      .sort((first, second) => first.title.localeCompare(second.title, 'de'));
  }

  return Object.freeze({ loadById, listRecords });
}
