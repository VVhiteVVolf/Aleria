// The authored HTML owns names, descriptions, icons and culture assignments.
// Entry IDs include the culture; class IDs agree with the character archive.
export function normalizeClassSearch(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de').replace(/ß/g, 'ss').trim();
}

export function filterClassEntries(entries, { query = '', groupId = 'all' } = {}) {
  const terms = normalizeClassSearch(query).split(/\s+/).filter(Boolean);
  return entries.filter(entry => (groupId === 'all' || entry.groupId === groupId)
    && terms.every(term => entry.searchText.includes(term)));
}

export function pickRandomClass(entries, { excludeMilitia = true, random = Math.random } = {}) {
  const candidates = entries.filter(entry => !excludeMilitia || !entry.militia);
  if (!candidates.length) return null;
  return candidates[Math.floor(random() * candidates.length)] || null;
}
