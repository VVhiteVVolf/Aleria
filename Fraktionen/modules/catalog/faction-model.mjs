export function normalizeSearch(value) {
  return String(value).toLocaleLowerCase('de').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim();
}

/** Retain ancestors as context, without counting them as search results. */
export function selectFactions(entries, { query = '', categoryId = 'all' } = {}) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const matches = new Set(entries.filter(entry =>
    (categoryId === 'all' || entry.categoryId === categoryId) &&
    terms.every(term => normalizeSearch(entry.search).includes(term))
  ).map(entry => entry.id));
  const visible = new Set(matches);
  for (const id of matches) {
    let parentId = byId.get(id).parentId;
    const visited = new Set([id]);
    while (parentId && byId.has(parentId) && !visited.has(parentId)) {
      visited.add(parentId);
      visible.add(parentId);
      parentId = byId.get(parentId).parentId;
    }
  }
  return { matches, visible };
}
