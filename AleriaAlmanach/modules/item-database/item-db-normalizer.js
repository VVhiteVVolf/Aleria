const ITEM_DB_DEFAULT_CATEGORY = 'sonstiges';

const ITEM_DB_CATEGORIES = [
  { id: 'alle', label: 'Alle' },
  { id: 'waffen', label: 'Waffen' },
  { id: 'ruestungen', label: 'Rüstungen' },
  { id: 'speisen', label: 'Speisen' },
  { id: 'getraenke', label: 'Getränke' },
  { id: 'vieh', label: 'Vieh' },
  { id: 'pferde', label: 'Pferde' },
  { id: 'alchemie', label: 'Alchemie' },
  { id: 'arkanes', label: 'Arkanes' },
  { id: 'werkzeuge', label: 'Werkzeuge' },
  { id: ITEM_DB_DEFAULT_CATEGORY, label: 'Sonstiges' }
];

const ITEM_DB_CATEGORY_KEYWORDS = [
  { id: 'waffen', terms: ['waffe', 'schwert', 'dolch', 'bogen', 'armbrust', 'speer', 'axt', 'hammer', 'klinge'] },
  { id: 'ruestungen', terms: ['rüstung', 'ruestung', 'panzer', 'schild', 'helm', 'kettenhemd', 'platte', 'lederharnisch'] },
  { id: 'speisen', terms: ['speise', 'essen', 'brot', 'eintopf', 'fleisch', 'kuchen', 'gericht', 'mahl', 'suppe'] },
  { id: 'getraenke', terms: ['getränk', 'getraenk', 'bier', 'wein', 'met', 'ale', 'wasser', 'tee', 'schnaps'] },
  { id: 'vieh', terms: ['vieh', 'rind', 'kuh', 'schaf', 'ziege', 'huhn', 'gans', 'schwein', 'kaninchen'] },
  { id: 'pferde', terms: ['pferd', 'ross', 'hengst', 'stute', 'gaul', 'pony', 'reitpferd', 'kriegspferd'] },
  { id: 'alchemie', terms: ['trank', 'elixier', 'alchemie', 'salbe', 'gift', 'kraut', 'tinktur', 'heilmittel'] },
  { id: 'arkanes', terms: ['arkan', 'magie', 'magisch', 'zauber', 'rune', 'fokus', 'artefakt', 'kristall'] },
  { id: 'werkzeuge', terms: ['werkzeug', 'hammer', 'seil', 'laterne', 'fackel', 'kit', 'set', 'ausrüstung', 'ausruestung'] }
];

function itemDbNormalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .trim();
}

function itemDbSlugify(value, fallback = 'item') {
  const slug = itemDbNormalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function itemDbEscapeHtml(value) {
  if (typeof escapeHtml === 'function') return escapeHtml(value);
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function itemDbSanitizeImage(value) {
  if (typeof sanitizeImageSrc === 'function') return sanitizeImageSrc(value);
  return String(value || '').trim();
}

function itemDbGetCategoryLabel(categoryId) {
  return ITEM_DB_CATEGORIES.find(category => category.id === categoryId)?.label || 'Sonstiges';
}

function itemDbInferCategory(candidate = {}) {
  const rawCategory = itemDbNormalizeText(candidate.category || candidate.categoryLabel || '');
  const direct = ITEM_DB_CATEGORIES.find(category => itemDbNormalizeText(category.label) === rawCategory || category.id === rawCategory);
  if (direct && direct.id !== 'alle') return direct.id;

  const haystack = itemDbNormalizeText([
    candidate.category,
    candidate.categoryLabel,
    candidate.type,
    candidate.title,
    candidate.description,
    candidate.details,
    Array.isArray(candidate.tags) ? candidate.tags.join(' ') : ''
  ].join(' '));

  const match = ITEM_DB_CATEGORY_KEYWORDS.find(group => group.terms.some(term => haystack.includes(itemDbNormalizeText(term))));
  return match?.id || ITEM_DB_DEFAULT_CATEGORY;
}

function itemDbNormalizeTags(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => String(typeof item === 'object' ? item?.label || item?.text || item?.title : item || '').trim())
      .filter(Boolean)
      .slice(0, 12);
  }
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function itemDbNormalizeAttributes(value) {
  return (Array.isArray(value) ? value : [])
    .map(item => ({
      label: String(item?.label || item?.title || item?.name || '').trim(),
      value: Number.isFinite(Number(item?.value)) ? Number(item.value) : null
    }))
    .filter(item => item.label)
    .slice(0, 12);
}

function itemDbMakeCanonicalKey(candidate = {}) {
  const title = String(candidate.title || '').trim();
  const category = candidate.category || itemDbInferCategory(candidate);
  return `${category}:${itemDbSlugify(title, 'unbenannt')}`;
}

function itemDbNormalizeItem(candidate = {}) {
  const title = String(candidate.title || candidate.name || '').trim();
  if (!title) return null;
  const category = itemDbInferCategory(candidate);
  const canonicalKey = itemDbMakeCanonicalKey({ ...candidate, title, category });
  const now = Date.now();

  return {
    id: `item-${canonicalKey.replace(/[^a-z0-9-]+/g, '-')}`,
    canonicalKey,
    title,
    category,
    categoryLabel: itemDbGetCategoryLabel(category),
    type: String(candidate.type || '').trim(),
    description: String(candidate.description || '').trim(),
    details: String(candidate.details || '').trim(),
    price: String(candidate.price || '').trim(),
    currency: String(candidate.currency || '').trim(),
    image: itemDbSanitizeImage(candidate.image || ''),
    tags: itemDbNormalizeTags(candidate.tags),
    attributes: itemDbNormalizeAttributes(candidate.attributes),
    sourceRefs: Array.isArray(candidate.sourceRefs) ? candidate.sourceRefs.filter(Boolean) : [],
    hiddenMeta: candidate.hiddenMeta && typeof candidate.hiddenMeta === 'object' ? { ...candidate.hiddenMeta } : {},
    updatedAt: Number(candidate.updatedAt) || now
  };
}

function itemDbMergeItems(base, incoming) {
  if (!base) return incoming;
  if (!incoming) return base;
  const sourceRefs = [...(base.sourceRefs || [])];
  (incoming.sourceRefs || []).forEach(ref => {
    const signature = JSON.stringify(ref);
    if (!sourceRefs.some(existing => JSON.stringify(existing) === signature)) sourceRefs.push(ref);
  });
  return {
    ...base,
    title: base.title || incoming.title,
    category: base.category || incoming.category,
    categoryLabel: base.categoryLabel || incoming.categoryLabel,
    type: base.type || incoming.type,
    description: base.description || incoming.description,
    details: base.details || incoming.details,
    price: base.price || incoming.price,
    currency: base.currency || incoming.currency,
    image: base.image || incoming.image,
    tags: Array.from(new Set([...(base.tags || []), ...(incoming.tags || [])])).slice(0, 12),
    attributes: base.attributes?.length ? base.attributes : incoming.attributes,
    hiddenMeta: { ...(incoming.hiddenMeta || {}), ...(base.hiddenMeta || {}) },
    sourceRefs,
    updatedAt: Math.max(Number(base.updatedAt) || 0, Number(incoming.updatedAt) || 0)
  };
}
