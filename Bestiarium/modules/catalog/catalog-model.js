export function normalizeSearch(value) {
  return String(value ?? '').toLocaleLowerCase('de-DE').replace(/ä/g, 'ae').replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue').replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function matchesEntry(entry, query) {
  const searchable = normalizeSearch([entry.title, entry.description, entry.note, entry.chapter, entry.group].join(' '));
  return normalizeSearch(query).split(/\s+/).filter(Boolean).every(word => searchable.includes(word));
}

export function filterEntries(entries, { query = '', kind = 'all' } = {}) {
  return entries.filter(entry => (kind === 'all' || entry.kind === kind) && matchesEntry(entry, query));
}
