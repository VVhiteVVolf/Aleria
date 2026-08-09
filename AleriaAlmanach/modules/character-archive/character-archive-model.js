export const CHARACTER_ARCHIVE_SCHEMA_VERSION = 1;

export const CHARACTER_ARCHIVE_KINDS = Object.freeze([
  { id: 'spell', label: 'Zauber', singular: 'Zauber', group: 'Magie', collection: 'magic.spells', editorKind: 'spell', symbol: '✦' },
  { id: 'trait', label: 'Traits & Marotten', singular: 'Trait', group: 'Persönlichkeit', collection: 'quirks', editorKind: 'quirk', symbol: '◆' },
  { id: 'ability', label: 'Fähigkeiten', singular: 'Fähigkeit', group: 'Können', collection: 'abilities', editorKind: 'ability', symbol: '★' },
  { id: 'technique', label: 'Techniken & Attacken', singular: 'Technik', group: 'Kampf', collection: 'techniques', editorKind: 'technique', symbol: '⚔' },
  { id: 'attack', label: 'Waffen & Angriffe', singular: 'Angriff', group: 'Kampf', collection: 'weapons', editorKind: 'weapon', symbol: '†' },
  { id: 'condition', label: 'Zustände & Effekte', singular: 'Zustand', group: 'Regeln', collection: 'conditions', symbol: '◈' },
  { id: 'skill', label: 'Fertigkeiten', singular: 'Fertigkeit', group: 'Können', collection: 'skills', symbol: '◇' },
  { id: 'combat-style', label: 'Kampfformen', singular: 'Kampfform', group: 'Kampf', symbol: '♜' },
  { id: 'class', label: 'Klassen', singular: 'Klasse', group: 'Herkunft', symbol: '♛' },
  { id: 'ancestry', label: 'Völker', singular: 'Volk', group: 'Herkunft', symbol: '♟' },
  { id: 'background', label: 'Herkünfte', singular: 'Herkunft', group: 'Herkunft', symbol: '⌂' },
  { id: 'origin', label: 'Regionale Herkunft', singular: 'Herkunft', group: 'Herkunft', symbol: '⌖' },
  { id: 'register-pferde', label: 'Pferde', singular: 'Pferd', group: 'Register', registerCategory: 'pferde', symbol: '♞' },
  { id: 'register-vieh', label: 'Vieh', singular: 'Vieh', group: 'Register', registerCategory: 'vieh', symbol: '❖' },
  { id: 'register-alchemie', label: 'Alchemie & Tränke', singular: 'Alchemie', group: 'Register', registerCategory: 'alchemie', symbol: '⚗' },
  { id: 'register-speisen', label: 'Speisen', singular: 'Speise', group: 'Register', registerCategory: 'speisen', symbol: '❧' },
  { id: 'register-arkanes', label: 'Arkanes', singular: 'Arkanum', group: 'Register', registerCategory: 'arkanes', symbol: '☄' },
  { id: 'register-waffen', label: 'Waffen (Register)', singular: 'Ware', group: 'Register', registerCategory: 'waffen', symbol: '⚒' }
]);

const KIND_BY_ID = new Map(CHARACTER_ARCHIVE_KINDS.map(kind => [kind.id, kind]));
const PROFILE_COLLECTIONS = Object.freeze([
  ['attack', 'weapons'],
  ['technique', 'techniques'],
  ['trait', 'quirks'],
  ['condition', 'conditions'],
  ['ability', 'abilities'],
  ['skill', 'skills']
]);
const REGISTER_KIND_BY_CATEGORY = new Map(
  CHARACTER_ARCHIVE_KINDS.filter(kind => kind.registerCategory).map(kind => [kind.registerCategory, kind.id])
);

export function cloneArchiveValue(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function normalizeArchiveSearchText(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function slugifyArchiveValue(value, fallback = 'eintrag') {
  return normalizeArchiveSearchText(value).replace(/\s+/g, '-').slice(0, 90) || fallback;
}

export function getCharacterArchiveKind(kindId) {
  return KIND_BY_ID.get(String(kindId || '')) || KIND_BY_ID.get('ability');
}

export function makeCharacterArchiveKey(kind, name) {
  return `${String(kind || 'ability')}::${normalizeArchiveSearchText(name)}`;
}

export function makeCharacterArchiveId(kind, name) {
  return `${slugifyArchiveValue(kind, 'entry')}--${slugifyArchiveValue(name)}`.slice(0, 150);
}

function normalizeTags(value) {
  const list = Array.isArray(value) ? value : String(value || '').split(/[;,·]/g);
  return [...new Set(list.map(item => String(item || '').trim()).filter(Boolean))].slice(0, 40);
}

function normalizeSources(value) {
  const list = Array.isArray(value) ? value : [];
  const byKey = new Map();
  list.forEach(source => {
    const kind = String(source?.kind || 'archive').trim();
    const id = String(source?.id || '').trim();
    const name = String(source?.name || '').trim();
    const key = `${kind}::${id || normalizeArchiveSearchText(name)}`;
    if (!id && !name) return;
    byKey.set(key, { kind, id, name });
  });
  return [...byKey.values()].slice(0, 80);
}

function getDescription(data = {}, fallback = '') {
  return String(
    fallback
    || data.description
    || data.effect
    || data.notes
    || data.subtitle
    || data.appliesWhen
    || ''
  ).trim();
}

export function normalizeCharacterArchiveEntry(value = {}) {
  const kind = KIND_BY_ID.has(String(value.kind || '')) ? String(value.kind) : 'ability';
  const data = value.data && typeof value.data === 'object' ? cloneArchiveValue(value.data, {}) : {};
  const name = String(value.name || data.name || data.label || '').trim();
  const id = String(value.id || '').trim() || makeCharacterArchiveId(kind, name);
  const iconOverride = String(value.iconOverride || '').trim();
  const dataIcon = String(data.icon || '').trim();
  const updatedAt = String(value.updatedAt || '').trim();
  return {
    schemaVersion: CHARACTER_ARCHIVE_SCHEMA_VERSION,
    id,
    key: makeCharacterArchiveKey(kind, name),
    kind,
    name,
    description: getDescription(data, value.description),
    icon: iconOverride || String(value.icon || dataIcon).trim(),
    iconOverride,
    tags: normalizeTags(value.tags?.length ? value.tags : data.tags),
    sources: normalizeSources(value.sources),
    data,
    builtin: value.builtin === true,
    archivedFromProfile: value.archivedFromProfile === true,
    createdAt: String(value.createdAt || updatedAt || '').trim(),
    updatedAt
  };
}

function mergeArchiveEntry(current, incoming) {
  const left = normalizeCharacterArchiveEntry(current);
  const right = normalizeCharacterArchiveEntry(incoming);
  const remoteOrEdited = !right.builtin && (!!right.updatedAt || !!right.iconOverride);
  const isLiveProfileProjection = entry => entry.archivedFromProfile
    && !entry.createdAt
    && !entry.updatedAt
    && !entry.iconOverride;
  const combinesBuiltinAndLiveProjection = (left.builtin && isLiveProfileProjection(right))
    || (right.builtin && isLiveProfileProjection(left));
  const preferred = remoteOrEdited ? right : left;
  const secondary = preferred === right ? left : right;
  return normalizeCharacterArchiveEntry({
    ...secondary,
    ...preferred,
    id: preferred.id || secondary.id,
    description: preferred.description || secondary.description,
    icon: preferred.icon || secondary.icon,
    iconOverride: preferred.iconOverride || secondary.iconOverride,
    data: Object.keys(preferred.data || {}).length ? preferred.data : secondary.data,
    tags: [...(left.tags || []), ...(right.tags || [])],
    sources: [...(left.sources || []), ...(right.sources || [])],
    builtin: combinesBuiltinAndLiveProjection || (left.builtin && right.builtin),
    archivedFromProfile: left.archivedFromProfile || right.archivedFromProfile
  });
}

export function mergeCharacterArchiveEntries(...entryLists) {
  const entries = new Map();
  entryLists.flat().filter(Boolean).forEach(raw => {
    const entry = normalizeCharacterArchiveEntry(raw);
    if (!entry.name) return;
    const current = entries.get(entry.key);
    entries.set(entry.key, current ? mergeArchiveEntry(current, entry) : entry);
  });
  return [...entries.values()].sort((a, b) => (
    getCharacterArchiveKind(a.kind).label.localeCompare(getCharacterArchiveKind(b.kind).label, 'de')
    || a.name.localeCompare(b.name, 'de', { sensitivity: 'base', numeric: true })
  ));
}

function entryFromProfileItem(kind, item, source) {
  const name = String(item?.name || item?.label || '').trim();
  if (!name) return null;
  return normalizeCharacterArchiveEntry({
    kind,
    name,
    description: getDescription(item),
    icon: item.icon || '',
    tags: item.tags || [],
    data: item,
    sources: [source],
    archivedFromProfile: true
  });
}

function identityEntry(kind, name, source, data = {}) {
  const label = String(name || '').trim();
  if (!label) return null;
  return normalizeCharacterArchiveEntry({ kind, name: label, data: { name: label, ...data }, sources: [source], archivedFromProfile: true });
}

export function extractCharacterArchiveEntries(record = {}, sourceKind = '') {
  const entityKind = sourceKind || (record.entityType === 'creature' ? 'creature' : 'character');
  const source = {
    kind: entityKind,
    id: String(record.id || '').trim(),
    name: String(record.name || record.displayName || '').trim()
  };
  const profile = record.combatProfile && typeof record.combatProfile === 'object' ? record.combatProfile : {};
  const entries = [];

  PROFILE_COLLECTIONS.forEach(([kind, collection]) => {
    (Array.isArray(profile[collection]) ? profile[collection] : []).forEach(item => {
      const entry = entryFromProfileItem(kind, item, source);
      if (entry) entries.push(entry);
    });
  });
  (Array.isArray(profile.magic?.spells) ? profile.magic.spells : []).forEach(item => {
    const entry = entryFromProfileItem('spell', item, source);
    if (entry) entries.push(entry);
  });

  const ancestry = profile.identity?.ancestry || record.species || '';
  const className = profile.identity?.archetype || '';
  const background = profile.identity?.background || '';
  [
    identityEntry('ancestry', ancestry, source),
    identityEntry('class', className, source),
    identityEntry('background', background, source),
    identityEntry('origin', record.origin, source)
  ].filter(Boolean).forEach(entry => entries.push(entry));

  const combatForms = new Map();
  (Array.isArray(profile.techniques) ? profile.techniques : []).forEach(technique => {
    const name = String(technique.trainingForm || '').trim();
    if (name) combatForms.set(normalizeArchiveSearchText(name), name);
  });
  combatForms.forEach(name => entries.push(identityEntry('combat-style', name, source)));

  return mergeCharacterArchiveEntries(entries);
}

function entryFromRegisterItem(item = {}) {
  const kind = REGISTER_KIND_BY_CATEGORY.get(String(item.category || '').trim());
  if (!kind) return null;
  const name = String(item.title || '').trim();
  if (!name) return null;
  return normalizeCharacterArchiveEntry({
    id: `register--${String(item.canonicalKey || makeCharacterArchiveId(kind, name))}`,
    kind,
    name,
    description: item.description || item.details || '',
    icon: item.image || '',
    tags: [item.categoryLabel, item.type, ...(item.tags || [])],
    data: item,
    sources: [{ kind: 'item-register', id: item.canonicalKey, name: 'Inventar-Register' }],
    builtin: true
  });
}

// Spiegelt Waren aus dem Inventar-Register (Markt/Items und Güter) als eigene Bereiche ins
// Charakterbogen-Archiv, damit z.B. Pferderassen oder Alchemie-Waren dort neben den
// Kampfregel-Bausteinen auffindbar sind. Fehlt der globale Registerindex (Modul noch nicht
// geladen), bleibt die Liste einfach leer statt zu werfen.
export function extractItemRegisterArchiveEntries() {
  const buildIndex = globalThis.itemDbBuildIndex;
  if (typeof buildIndex !== 'function') return [];
  let items = [];
  try {
    items = buildIndex();
  } catch (error) {
    console.info('Inventar-Register konnte nicht ins Charakterbogen-Archiv gespiegelt werden.', error);
    return [];
  }
  return mergeCharacterArchiveEntries((Array.isArray(items) ? items : []).map(entryFromRegisterItem).filter(Boolean));
}

export function createCharacterArchiveProfileItem(entry, collection = '') {
  const normalized = normalizeCharacterArchiveEntry(entry);
  const data = cloneArchiveValue(normalized.data, {});
  const prefix = collection || getCharacterArchiveKind(normalized.kind).collection || normalized.kind;
  const id = globalThis.crypto?.randomUUID?.()
    || `${slugifyArchiveValue(prefix)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  data.id = id;
  data.name = normalized.name;
  if (normalized.description && !data.description) data.description = normalized.description;
  if (normalized.icon) data.icon = normalized.icon;
  delete data.sourceCharacter;
  delete data.sourceClassId;
  return data;
}

export function getCharacterArchiveEntrySearchText(entry = {}) {
  const kind = getCharacterArchiveKind(entry.kind);
  return normalizeArchiveSearchText([
    entry.name,
    entry.description,
    kind.label,
    kind.group,
    ...(entry.tags || []),
    ...(entry.sources || []).flatMap(source => [source.name, source.kind]),
    entry.data?.school,
    entry.data?.damageType,
    entry.data?.trainingForm,
    entry.data?.group,
    entry.data?.subtitle
  ].join(' '));
}
