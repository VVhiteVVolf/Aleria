import { searchText, categoryLabel } from './item-register-model.js';

export function registerTemplateProvider(item) {
  return { id: item.listId || item.moduleId || 'standard', label: item.listName || 'Grundsortiment' };
}

function plain(value) { return String(value || '').replace(/<[^>]*>/g, ' '); }
function searchableValues(value) { return Array.isArray(value) ? value.join(' ') : String(value || ''); }

// Build once per catalog update; typing never rebuilds the inventory catalog.
export function indexRegisterTemplates(items) {
  return items.map(item => {
    const provider = registerTemplateProvider(item);
    const title = searchText(item.title);
    const terms = searchText([item.title, item.type, categoryLabel(item.category), plain(item.description), plain(item.details),
      provider.label, item.templateName, searchableValues(item.tags), searchableValues(item.aliases),
      ...(item.sourceRefs || []).map(source => source.moduleTitle || source.market || '')].join(' '));
    return { item, provider, title, terms };
  });
}

export function searchRegisterTemplates(index, { search = '', category = '', provider = '', sort = 'relevance', limit = 12 } = {}) {
  const needle = searchText(search).trim().replace(/\s+/g, ' ');
  const tokens = needle.split(' ').filter(Boolean);
  const matches = index.filter(entry => (!category || entry.item.category === category) && (!provider || entry.provider.id === provider)
    && tokens.every(token => entry.terms.includes(token)));
  const score = entry => !needle ? 0 : (entry.title === needle ? 1000 : entry.title.startsWith(needle) ? 500 : entry.title.includes(needle) ? 250 : 0)
    + tokens.reduce((sum, token) => sum + (entry.title.split(/\W+/u).includes(token) ? 60 : entry.title.includes(token) ? 30 : 0), 0);
  matches.sort((a, b) => (sort === 'price' ? (a.item.priceRange?.minCopper ?? Infinity) - (b.item.priceRange?.minCopper ?? Infinity)
    : sort === 'relevance' ? score(b) - score(a) : 0)
    || String(a.item.title).localeCompare(String(b.item.title), 'de')
    || a.provider.label.localeCompare(b.provider.label, 'de') || a.item.id.localeCompare(b.item.id));
  return { total: matches.length, items: matches.slice(0, limit).map(entry => entry.item) };
}

export function registerTemplateFacets(index) {
  const categories = new Map(), providers = new Map();
  for (const { item, provider } of index) {
    const category = categories.get(item.category) || { id: item.category, label: categoryLabel(item.category), count: 0 };
    categories.set(item.category, { ...category, count: category.count + 1 });
    const current = providers.get(provider.id) || { ...provider, count: 0 };
    providers.set(provider.id, { ...current, count: current.count + 1 });
  }
  const byLabel = (a, b) => a.label.localeCompare(b.label, 'de');
  return { categories: [...categories.values()].sort(byLabel), providers: [...providers.values()].sort(byLabel) };
}
