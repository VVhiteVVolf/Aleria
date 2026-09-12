import { getCharacterArchiveEntrySearchText, getCharacterArchiveKind, normalizeArchiveSearchText } from './character-archive-model.js?v=20260905-archive-order-v2';
import { matchesCharacterArchiveKind } from './character-archive-attack-groups.js?v=20260909-dragon-parent-v2';

const collator = new Intl.Collator('de', { sensitivity: 'base', numeric: true });

export function matchesArchiveSource(entry, source = 'all') {
  if (source === 'all') return true;
  if (source === 'system') return entry.builtin === true;
  if (source === 'custom') return !entry.builtin && (!entry.archivedFromProfile || Boolean(entry.updatedAt));
  const kind = source === 'register' ? 'item-register' : source;
  return (entry.sources || []).some(item => item.kind === kind);
}

// Rebuild only when the archive changes, never on every keystroke.
export function createCharacterArchiveIndex(entries = []) {
  return entries.map(entry => ({ entry, search: getCharacterArchiveEntrySearchText(entry) }));
}

export function queryCharacterArchive(index, { search = '', kind = 'all', source = 'all', sort = 'name', picker = null } = {}) {
  // Catalogue deep links use a stable ID; ordinary text continues to use word search.
  const catalogId = String(search).trim();
  const exactCatalogMatch = Boolean(catalogId) && index.some(({ entry }) => entry.data?.catalogReference?.id === catalogId);
  const terms = normalizeArchiveSearchText(search).split(' ').filter(Boolean);
  return index.filter(({ entry, search: text }) => {
    if (picker ? entry.kind !== picker.kind : !matchesCharacterArchiveKind(entry, kind)) return false;
    if (exactCatalogMatch) return matchesArchiveSource(entry, source) && entry.data?.catalogReference?.id === catalogId;
    return matchesArchiveSource(entry, source) && terms.every(term => text.includes(term));
  }).map(item => item.entry).sort((a, b) => {
    if (sort === 'newest') {
      const order = (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0);
      if (order) return order;
    }
    if (sort === 'kind') {
      const order = collator.compare(getCharacterArchiveKind(a.kind).label, getCharacterArchiveKind(b.kind).label);
      if (order) return order;
    }
    return collator.compare(a.name, b.name) || collator.compare(a.id, b.id);
  });
}
