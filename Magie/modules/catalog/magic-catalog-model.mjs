/** Matching is independent of the DOM; authored content remains the source of truth. */
export function normalizeMagicSearch(value = '') {
  return String(value).toLocaleLowerCase('de').replace(/ä/g, 'ae').replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue').replace(/ß/g, 'ss').normalize('NFKD')
    .replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function matchesMagicEntry(entry, { query = '', tradition = 'all' } = {}) {
  if (tradition !== 'all' && entry.tradition !== tradition) return false;
  const content = normalizeMagicSearch(entry.text);
  return normalizeMagicSearch(query).split(' ').filter(Boolean).every(term => content.includes(term));
}
