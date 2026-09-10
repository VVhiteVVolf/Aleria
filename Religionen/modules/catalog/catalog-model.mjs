export function normalizeSearch(value) {
  return String(value).toLocaleLowerCase('de').normalize('NFKD').replace(/\p{M}/gu, '')
    .replace(/ß/g, 'ss').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u').trim();
}

export function filterEntries(entries, { query = '', chapterId = 'all' } = {}) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return entries.filter(entry => (chapterId === 'all' || entry.chapterId === chapterId)
    && terms.every(term => normalizeSearch(entry.searchText).includes(term)));
}

export function sortEntries(entries, sort = 'register') {
  const ordered = [...entries];
  if (sort === 'register') return ordered.sort((a, b) => a.order - b.order);
  const collator = new Intl.Collator('de', { sensitivity: 'base', numeric: true });
  const title = entry => entry.title.replace(/^(die|der|das)\s+/i, '');
  return ordered.sort((a, b) => (sort === 'za' ? -1 : 1) * collator.compare(title(a), title(b)));
}

export function readCatalogState(url, chapterIds) {
  const params = url.searchParams;
  return {
    query: (params.get('q') || '').slice(0, 200),
    chapterId: chapterIds.includes(params.get('kapitel')) ? params.get('kapitel') : 'all',
    sort: ['az', 'za'].includes(params.get('sort')) ? params.get('sort') : 'register'
  };
}

export function writeCatalogState(url, state) {
  const next = new URL(url);
  for (const [key, value] of [['q', state.query.trim()], ['kapitel', state.chapterId === 'all' ? '' : state.chapterId], ['sort', state.sort === 'register' ? '' : state.sort]]) {
    if (value) next.searchParams.set(key, value);
    else next.searchParams.delete(key);
  }
  return next;
}
