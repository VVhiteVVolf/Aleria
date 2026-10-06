const STORAGE_KEY = 'aleria.warrior-gallery.assignments.v1';
export const normalizeSearch = value => String(value || '').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('ß', 'ss');

export function validateAssignments(data, catalog) {
  if (!data || data.schema !== 'aleria.warrior-gallery.assignments' || data.version !== 1 || !data.assignments || typeof data.assignments !== 'object' || Array.isArray(data.assignments)) throw new Error('Keine gültige Zuordnungsdatei.');
  const validImages = new Set(catalog.illustrations.map(i => i.id));
  const validHouses = new Set(catalog.houses.map(h => h.id));
  const result = {};
  for (const [imageId, houseIds] of Object.entries(data.assignments)) {
    if (!validImages.has(imageId) || !Array.isArray(houseIds) || !houseIds.every(id => validHouses.has(id))) throw new Error('Die Datei enthält unbekannte Bilder oder Häuser. Der Bestand wurde nicht verändert.');
    result[imageId] = [...new Set(houseIds)];
  }
  return result;
}

export function createGalleryState(catalog, storage) {
  let overrides = {};
  let warning = '';
  try {
    const stored = storage?.getItem(STORAGE_KEY);
    if (stored) overrides = validateAssignments(JSON.parse(stored), catalog);
  } catch { warning = 'Gespeicherte Zuordnungen konnten nicht geladen werden. Die Quellenzuordnung wird angezeigt.'; }
  const imageById = new Map(catalog.illustrations.map(image => [image.id, image]));
  const houseById = new Map(catalog.houses.map(house => [house.id, house]));
  const assignments = image => overrides[image.id] ?? image.houseIds;
  const serialize = () => ({ schema: 'aleria.warrior-gallery.assignments', version: 1, assignments: overrides });
  function persist() {
    try {
      if (!storage) throw new Error('Kein Speicherzugriff');
      storage.setItem(STORAGE_KEY, JSON.stringify(serialize()));
      return 'In diesem Browser gespeichert.';
    } catch { return 'Nur für diese Sitzung übernommen. Bitte Zuordnungen exportieren, um sie zu behalten.'; }
  }
  function assign(imageId, houseId) {
    const image = imageById.get(imageId);
    if (!image || !houseById.has(houseId)) throw new Error('Bitte ein Haus aus der Liste auswählen.');
    overrides[imageId] = [...new Set([...assignments(image), houseId])];
    return persist();
  }
  function remove(imageId, houseId) {
    const image = imageById.get(imageId);
    if (!image) throw new Error('Unbekanntes Bild.');
    overrides[imageId] = assignments(image).filter(id => id !== houseId);
    return persist();
  }
  function restore(imageId) { delete overrides[imageId]; return persist(); }
  function importData(data) { const validated = validateAssignments(data, catalog); overrides = validated; return persist(); }
  function imagesFor(houseId) { return catalog.illustrations.filter(image => assignments(image).includes(houseId)); }
  function selectHouses({ query = '', region = '', scope = 'all', view = 'gallery' }) {
    const needle = normalizeSearch(query);
    return catalog.houses.filter(house => {
      if (scope !== 'all' && house.kind !== scope) return false;
      if (region && house.region !== region) return false;
      const images = imagesFor(house.id);
      if (view === 'gallery' && !images.length || view === 'missing' && images.length) return false;
      return normalizeSearch([house.name, house.id, house.location, ...images.map(i => `${i.name} ${i.category}`)].join(' ')).includes(needle);
    });
  }
  return { warning, assignments, assign, remove, restore, importData, serialize, imagesFor, selectHouses, imageById, houseById };
}
