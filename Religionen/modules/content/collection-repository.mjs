// File access is supplied by the content repository so the same path rules apply everywhere.
export function readCollections(paths, readJson, rootEntries) {
  const collections = [];
  const entries = [];
  const records = [];
  const ids = new Set();
  const parents = new Set();
  const usedPaths = new Set(rootEntries.map(entry => entry.sourcePath));
  const memberIds = new Set(rootEntries.map(entry => entry.id));
  for (const path of paths) {
    const collection = readJson(path);
    if (!/^[a-z][a-z0-9-]*$/.test(collection.id) || ids.has(collection.id) || parents.has(collection.parentId)) {
      throw new Error(`Ungültige oder doppelte Sammlung: ${collection.id}`);
    }
    const parent = rootEntries.find(entry => entry.id === collection.parentId && entry.page);
    if (!parent) throw new Error(`Sammlungsseite fehlt: ${collection.parentId}`);
    for (const field of ['title', 'subtitle']) {
      if (typeof collection[field] !== 'string' || !collection[field].trim()) throw new Error(`Sammlungsangabe fehlt: ${collection.id}.${field}`);
    }
    ids.add(collection.id);
    parents.add(collection.parentId);
    if (collection.theme !== undefined && collection.theme !== 'infernal') throw new Error(`Unbekannte Sammlungsgestaltung: ${collection.theme}`);
    for (const key of ['doctrineIds', 'readingEntryIds']) if (collection[key] !== undefined && (!Array.isArray(collection[key]) || collection[key].some(id => typeof id !== 'string' || !id.trim()))) throw new Error(`Ungültige Sammlungsverweise: ${collection.id}.${key}`);
    if (!Array.isArray(collection.groups) || !collection.groups.length) throw new Error(`Sammlungsgruppen fehlen: ${collection.id}`);
    const groupIds = new Set();
    for (const group of collection.groups) {
      if (!/^[a-z][a-z0-9-]*$/.test(group.id) || groupIds.has(group.id) || group.id === 'heilige') throw new Error(`Ungültige Sammlungsgruppe: ${group.id}`);
      groupIds.add(group.id);
      for (const field of ['title', 'label', 'number', 'intro']) {
        if (typeof group[field] !== 'string' || !group[field].trim()) throw new Error(`Gruppenangabe fehlt: ${group.id}.${field}`);
      }
      if (!Array.isArray(group.entries)) throw new Error(`Gruppeneinträge fehlen: ${group.id}`);
      group.memberIds = [];
      for (const sourcePath of group.entries) {
        if (usedPaths.has(sourcePath)) throw new Error(`Doppelte Inhaltsquelle: ${sourcePath}`);
        usedPaths.add(sourcePath);
        const entry = { ...readJson(sourcePath), sourcePath, chapterId: parent.chapterId, collectionId: collection.id, groupId: group.id };
        if (!/^[a-z][a-z0-9-]*$/.test(entry.id) || memberIds.has(entry.id)) throw new Error(`Ungültiger oder doppelter Sammlungseintrag: ${entry.id}`);
        memberIds.add(entry.id);
        group.memberIds.push(entry.id);
        if (entry.recordOnly) {
          if (entry.recordOnly !== true || entry.page || entry.canonicalHref) throw new Error(`Registereintrag mit widersprüchlichem Seitenziel: ${entry.id}`);
          for (const field of ['title', 'kind', 'summary', 'symbol']) if (typeof entry[field] !== 'string' || !entry[field].trim()) throw new Error(`Registerangabe fehlt: ${entry.id}.${field}`);
          if (!Array.isArray(entry.tags) || entry.tags.some(tag => typeof tag !== 'string' || !tag.trim())) throw new Error(`Ungültige Registerbegriffe: ${entry.id}`);
          records.push(entry);
        } else entries.push(entry);
      }
    }
    const saints = collection.saintsSource ? readJson(collection.saintsSource) : null;
    if (saints) {
      for (const field of ['title', 'intro']) {
        if (typeof saints[field] !== 'string' || !saints[field].trim()) throw new Error(`Heiligenregister-Angabe fehlt: ${field}`);
      }
      if (!Array.isArray(saints.entries)) throw new Error('Heiligenregister-Einträge fehlen');
      const saintIds = new Set();
      for (const saint of saints.entries) {
        if (!/^[a-z][a-z0-9-]*$/.test(saint.id) || saintIds.has(saint.id) || typeof saint.name !== 'string' || !saint.name.trim()) throw new Error(`Ungültiger Heiligeneintrag: ${saint.id}`);
        saintIds.add(saint.id);
        if (saint.epithet !== null && typeof saint.epithet !== 'string') throw new Error(`Ungültiger Beiname: ${saint.id}`);
      }
    }
    collections.push({ ...collection, saints });
  }
  return { collections, entries, records };
}

export function profileContext(catalog, entry) {
  const collection = catalog.collections?.find(item => item.id === entry.collectionId);
  const chapter = collection ? collection.groups.find(group => group.id === entry.groupId)
    : catalog.chapters.find(item => item.id === entry.chapterId);
  const siblings = catalog.entries.filter(item => collection
    ? item.collectionId === collection.id && item.groupId === entry.groupId
    : !item.collectionId && item.chapterId === entry.chapterId);
  return { collection, chapter, siblings };
}
