// Registry bridge for family-tree embeds. Keeps the editor independent from
// the genealogy repository while reusing its project, local and cloud records.

const FAMILY_TREE_EMBED_CATALOG_EVENT = 'aleria:family-tree-embed-catalog-updated';

let familyTreeEmbedCatalogRecords = [];
let familyTreeEmbedCatalogLoadPromise = null;
let familyTreeEmbedCatalogLoaded = false;

function normalizeFamilyTreeEmbedCatalogRecord(record = {}) {
  const id = sanitizeFamilyTreeEmbedFamilyId(record.id);
  if (!id) return null;
  return Object.freeze({
    id,
    title: String(record.title || record.family?.document?.title || id).trim() || id,
    folderPath: Object.freeze((Array.isArray(record.folderPath) ? record.folderPath : [])
      .map(item => String(item || '').trim())
      .filter(Boolean)),
    source: String(record.source || 'project').trim() || 'project'
  });
}

function mergeFamilyTreeEmbedCatalogRecords(...collections) {
  const records = new Map();
  collections.flat().forEach(record => {
    const normalized = normalizeFamilyTreeEmbedCatalogRecord(record);
    if (!normalized) return;
    const current = records.get(normalized.id);
    records.set(normalized.id, Object.freeze({
      ...current,
      ...normalized,
      folderPath: normalized.folderPath.length ? normalized.folderPath : current?.folderPath || Object.freeze([])
    }));
  });
  return Object.freeze([...records.values()].sort((first, second) => {
    const firstLabel = [...first.folderPath, first.title].join(' > ');
    const secondLabel = [...second.folderPath, second.title].join(' > ');
    return firstLabel.localeCompare(secondLabel, 'de', { sensitivity: 'base' });
  }));
}

function publishFamilyTreeEmbedCatalog(records) {
  familyTreeEmbedCatalogRecords = mergeFamilyTreeEmbedCatalogRecords(records);
  document.dispatchEvent(new CustomEvent(FAMILY_TREE_EMBED_CATALOG_EVENT, {
    detail: { records: familyTreeEmbedCatalogRecords }
  }));
  return familyTreeEmbedCatalogRecords;
}

async function loadFamilyTreeEmbedCatalog({ refresh = false } = {}) {
  if (familyTreeEmbedCatalogLoadPromise && !refresh) return familyTreeEmbedCatalogLoadPromise;
  if (familyTreeEmbedCatalogLoaded && !refresh) return familyTreeEmbedCatalogRecords;
  familyTreeEmbedCatalogLoadPromise = (async () => {
    const familyLibrary = await import('../../../Stammbäume/assets/js/services/family-library.js');
    let localRecords = [];
    try {
      localRecords = familyLibrary.listFamilyRecords(globalThis.localStorage);
    } catch (error) {
      console.info('Lokale Stammbaumakten konnten für die Modulauswahl nicht gelesen werden.', error);
    }
    publishFamilyTreeEmbedCatalog(localRecords);

    try {
      const genealogyRepository = await import('../character-genealogy/genealogy-source-repository.js');
      const publishedRecords = await genealogyRepository.listGenealogyFamilies();
      familyTreeEmbedCatalogLoaded = true;
      return publishFamilyTreeEmbedCatalog([...localRecords, ...publishedRecords]);
    } catch (error) {
      console.info('Die veröffentlichte Stammbaum-Registry ist für die Modulauswahl derzeit nicht erreichbar.', error);
      familyTreeEmbedCatalogLoaded = true;
      return familyTreeEmbedCatalogRecords;
    }
  })().catch(error => {
    console.info('Die Stammbaum-Registry konnte für die Modulauswahl nicht geladen werden.', error);
    familyTreeEmbedCatalogLoaded = true;
    return familyTreeEmbedCatalogRecords;
  }).finally(() => {
    familyTreeEmbedCatalogLoadPromise = null;
  });
  return familyTreeEmbedCatalogLoadPromise;
}

function getFamilyTreeEmbedCatalogSnapshot() {
  return familyTreeEmbedCatalogRecords;
}

globalThis.AleriaFamilyTreeEmbedCatalog = Object.freeze({
  eventName: FAMILY_TREE_EMBED_CATALOG_EVENT,
  getSnapshot: getFamilyTreeEmbedCatalogSnapshot,
  load: loadFamilyTreeEmbedCatalog
});

if (typeof queueMicrotask === 'function') {
  queueMicrotask(() => void loadFamilyTreeEmbedCatalog());
}
