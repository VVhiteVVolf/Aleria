const CHARACTER_REGISTER_VIEW_OPTIONS = [
  { value: 'families', label: 'Stammbäume' },
  { value: 'collections', label: 'Eigene Gruppen' },
  { value: 'relevance', label: 'Relevanz' },
  { value: 'status', label: 'Status' },
  { value: 'location', label: 'Ort' },
  { value: 'faction', label: 'Fraktion' }
];

const CHARACTER_REGISTER_SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'updated-desc', label: 'Zuletzt bearbeitet' },
  { value: 'created-desc', label: 'Neueste zuerst' },
  { value: 'relevance-desc', label: 'Höchste Relevanz' }
];

const CHARACTER_REGISTER_FIXED_BUCKET_ORDER = {
  relevance: ['Plot-Knoten', 'Wichtig', 'Tragend', 'Nebenfigur', 'Ohne Relevanz'],
  status: ['Aktiv', 'Inaktiv', 'Verschollen', 'Tot', 'Unklar', 'Ohne Status']
};

let _characterRegisterViewMode = 'families';
let _characterRegisterSortMode = 'name-asc';
let _characterRegisterSearch = '';

function getCharacterRegisterViewMode() {
  return _characterRegisterViewMode;
}

function isCharacterRegisterFacetView(mode = _characterRegisterViewMode) {
  return mode !== 'collections';
}

function setCharacterRegisterViewMode(mode, options = {}) {
  const isKnownMode = CHARACTER_REGISTER_VIEW_OPTIONS.some(option => option.value === mode);
  _characterRegisterViewMode = isKnownMode ? mode : 'families';
  if (options.render !== false && typeof renderCharGrid === 'function') renderCharGrid();
}

function setCharacterRegisterSortMode(mode, options = {}) {
  const isKnownMode = CHARACTER_REGISTER_SORT_OPTIONS.some(option => option.value === mode);
  _characterRegisterSortMode = isKnownMode ? mode : 'name-asc';
  if (options.render !== false && typeof renderCharGrid === 'function') renderCharGrid();
}

function getCharacterRegisterDateTimestamp(value) {
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getCharacterRegisterName(char) {
  return String(char?.name || 'Unbenannt').trim();
}

function getCharacterRegisterRelevanceRank(char) {
  const value = getCharacterRelevanceValue(char?.relevance);
  if (value === 'plot' || String(char?.plotNode || '').trim()) return 4;
  if (value === 'important') return 3;
  if (value === 'supporting') return 2;
  if (value === 'minor') return 1;
  return 0;
}

function compareCharacterRegisterNames(a, b) {
  return getCharacterRegisterName(a).localeCompare(
    getCharacterRegisterName(b),
    'de',
    { sensitivity: 'base', numeric: true }
  );
}

function sortCharacterRegisterEntries(chars, mode = _characterRegisterSortMode) {
  const withOriginalIndex = (Array.isArray(chars) ? chars : []).map((char, index) => ({ char, index }));
  withOriginalIndex.sort((left, right) => {
    const a = left.char;
    const b = right.char;
    let comparison = 0;

    if (mode === 'name-desc') comparison = compareCharacterRegisterNames(b, a);
    else if (mode === 'updated-desc') {
      comparison = getCharacterRegisterDateTimestamp(b?.updatedAt) - getCharacterRegisterDateTimestamp(a?.updatedAt);
    } else if (mode === 'created-desc') {
      comparison = getCharacterRegisterDateTimestamp(b?.createdAt) - getCharacterRegisterDateTimestamp(a?.createdAt);
    } else if (mode === 'relevance-desc') {
      comparison = getCharacterRegisterRelevanceRank(b) - getCharacterRegisterRelevanceRank(a);
    } else comparison = compareCharacterRegisterNames(a, b);

    if (comparison !== 0) return comparison;
    const nameComparison = compareCharacterRegisterNames(a, b);
    return nameComparison || left.index - right.index;
  });
  return withOriginalIndex.map(item => item.char);
}

function getCharacterRegisterFacetLabel(char, mode = _characterRegisterViewMode) {
  if (mode === 'relevance') {
    if (String(char?.plotNode || '').trim()) return 'Plot-Knoten';
    return getCharacterRelevanceLabel(char?.relevance) || 'Ohne Relevanz';
  }
  if (mode === 'status') return getCharacterStatusLabel(char?.status) || 'Ohne Status';
  if (mode === 'location') return String(char?.currentLocation || '').trim() || 'Ohne aktuellen Ort';
  if (mode === 'faction') return String(char?.fraktion || char?.faction || '').trim() || 'Ohne Fraktion';
  return '';
}

function getCharacterRegisterSearchText(char) {
  if (typeof buildCharacterSearchText === 'function') return buildCharacterSearchText(char);
  return [
    char?.name,
    char?.title,
    char?.fraktion,
    char?.faction,
    char?.role,
    char?.currentLocation,
    char?.genealogy?.houseName,
    ...(char?.aliases || [])
  ].join(' ').toLocaleLowerCase('de');
}

function hasCharacterRegisterSearch() {
  return !!_characterRegisterSearch.trim();
}

function filterCharacterRegisterEntries(chars) {
  const needle = _characterRegisterSearch.trim().toLocaleLowerCase('de');
  if (!needle) return Array.isArray(chars) ? chars : [];
  return (Array.isArray(chars) ? chars : [])
    .filter(char => getCharacterRegisterSearchText(char).includes(needle));
}

function getCharacterRegisterManualGroupLabel(char) {
  if (typeof getCharacterAssignedTab !== 'function') return 'Unsortiert';
  return getCharacterAssignedTab(char?.id) || 'Unsortiert';
}

function compareCharacterRegisterManualGroups(first, second) {
  const firstGroup = getCharacterRegisterManualGroupLabel(first);
  const secondGroup = getCharacterRegisterManualGroupLabel(second);
  if (firstGroup === secondGroup) return 0;
  if (firstGroup === 'Unsortiert') return 1;
  if (secondGroup === 'Unsortiert') return -1;
  return firstGroup.localeCompare(secondGroup, 'de', { sensitivity: 'base', numeric: true });
}

function getCharacterRegisterFamilyMemberships(char) {
  const resolver = typeof window !== 'undefined'
    ? window.AleriaCharacterGenealogy?.getFamilyMemberships
    : null;
  if (typeof resolver === 'function') return resolver(char);
  return (char?.genealogy?.sources || [])
    .filter(source => source?.familyId)
    .map(source => ({
      familyId: String(source.familyId),
      familyTitle: String(source.familyId),
      sortPath: String(source.familyId)
    }));
}

function buildCharacterRegisterFamilyBuckets(chars) {
  const byFamily = new Map();
  const withoutTree = [];

  (Array.isArray(chars) ? chars : []).forEach(char => {
    const memberships = getCharacterRegisterFamilyMemberships(char);
    if (!memberships.length) {
      withoutTree.push(char);
      return;
    }
    memberships.forEach(membership => {
      const key = membership.familyId || membership.familyTitle;
      if (!byFamily.has(key)) {
        byFamily.set(key, {
          key,
          label: membership.familyTitle || membership.familyId,
          emblem: membership.emblem || '',
          sortPath: membership.sortPath || membership.familyTitle || membership.familyId,
          chars: []
        });
      }
      const bucket = byFamily.get(key);
      if (!bucket.chars.some(item => String(item?.id || '') === String(char?.id || ''))) {
        bucket.chars.push(char);
      }
    });
  });

  const buckets = Array.from(byFamily.values()).sort((first, second) =>
    first.sortPath.localeCompare(second.sortPath, 'de', { sensitivity: 'base', numeric: true })
  );
  buckets.forEach(bucket => bucket.chars.sort(compareCharacterRegisterManualGroups));
  if (withoutTree.length) {
    withoutTree.sort(compareCharacterRegisterManualGroups);
    buckets.push({ key: 'without-family-tree', label: 'Ohne Stammbaum', emblem: '', sortPath: '\uffff', chars: withoutTree });
  }
  return buckets;
}

function buildCharacterRegisterFacetBuckets(chars, mode = _characterRegisterViewMode) {
  if (!isCharacterRegisterFacetView(mode)) return [];
  if (mode === 'families') return buildCharacterRegisterFamilyBuckets(chars);
  const byKey = new Map();
  (Array.isArray(chars) ? chars : []).forEach(char => {
    const label = getCharacterRegisterFacetLabel(char, mode);
    const key = label.toLocaleLowerCase('de');
    if (!byKey.has(key)) byKey.set(key, { label, chars: [] });
    byKey.get(key).chars.push(char);
  });

  const fixedOrder = CHARACTER_REGISTER_FIXED_BUCKET_ORDER[mode] || [];
  const fixedOrderByLabel = new Map(fixedOrder.map((label, index) => [label.toLocaleLowerCase('de'), index]));
  return Array.from(byKey.values()).sort((a, b) => {
    const aIndex = fixedOrderByLabel.has(a.label.toLocaleLowerCase('de'))
      ? fixedOrderByLabel.get(a.label.toLocaleLowerCase('de'))
      : Number.MAX_SAFE_INTEGER;
    const bIndex = fixedOrderByLabel.has(b.label.toLocaleLowerCase('de'))
      ? fixedOrderByLabel.get(b.label.toLocaleLowerCase('de'))
      : Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex || a.label.localeCompare(b.label, 'de', { sensitivity: 'base', numeric: true });
  });
}

function getCharacterRegisterFacetKey(label, bucket = null) {
  const key = bucket?.key || String(label || '').toLocaleLowerCase('de');
  return `facet:${_characterRegisterViewMode}:${key}`;
}

function getCharacterRegisterViewDescription() {
  if (_characterRegisterViewMode === 'families') {
    return 'Automatisch aus den Stammbäumen. Angeheiratete können in mehreren Häusern erscheinen, öffnen aber immer dasselbe Profil.';
  }
  if (_characterRegisterViewMode === 'collections') {
    return 'Eigene Gruppen werden manuell gepflegt. Figuren ohne Gruppe landen gesammelt unter „Unsortiert“.';
  }
  return 'Diese Ansicht gruppiert dieselben Figuren nur vorübergehend nach ihrem Profil.';
}

function escapeCharacterRegisterMarkup(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderCharacterRegisterViewToolbar(grid) {
  if (!grid) return;
  const toolbar = document.createElement('section');
  toolbar.className = 'char-register-view-toolbar';
  toolbar.setAttribute('aria-label', 'Charakteransicht und Sortierung');
  toolbar.innerHTML = `
    <div class="char-register-view-copy">
      <span>Registeransicht</span>
      <small>${getCharacterRegisterViewDescription()}</small>
    </div>
    <div class="char-register-view-options" role="group" aria-label="Charaktere gruppieren nach">
      ${CHARACTER_REGISTER_VIEW_OPTIONS.map(option => `
        <button type="button"
          class="${option.value === _characterRegisterViewMode ? 'active' : ''}"
          data-character-register-action="set-view"
          data-view-mode="${option.value}"
          aria-pressed="${option.value === _characterRegisterViewMode ? 'true' : 'false'}"
          ${_charOrganizeMode && option.value !== 'collections' ? 'disabled' : ''}>${option.label}</button>`).join('')}
    </div>
    <label class="char-register-sort-control">
      <span>Sortierung</span>
      <select data-character-register-action="set-sort" aria-label="Charaktere sortieren">
        ${CHARACTER_REGISTER_SORT_OPTIONS.map(option => `
          <option value="${option.value}"${option.value === _characterRegisterSortMode ? ' selected' : ''}>${option.label}</option>`).join('')}
      </select>
    </label>
    <div class="char-register-find-row">
      <label class="char-register-find-control">
        <span>Figur finden</span>
        <input type="search" data-character-register-action="search" value="${escapeCharacterRegisterMarkup(_characterRegisterSearch)}" placeholder="Name, Haus, Rolle, Ort oder Alias">
      </label>
      <div class="char-register-group-controls" aria-label="Gruppen ein- oder ausklappen">
        <button type="button" data-character-grid-action="collapse-all-groups">Alle einklappen</button>
        <button type="button" data-character-grid-action="expand-all-groups">Alle aufklappen</button>
      </div>
    </div>`;
  grid.appendChild(toolbar);
}

function handleCharacterRegisterViewClick(event) {
  const trigger = event.target?.closest?.('[data-character-register-action="set-view"]');
  const grid = document.getElementById('char-grid');
  if (!trigger || !grid || !grid.contains(trigger) || trigger.disabled) return;
  event.preventDefault();
  setCharacterRegisterViewMode(trigger.dataset.viewMode || 'families');
}

function handleCharacterRegisterViewChange(event) {
  const select = event.target?.closest?.('[data-character-register-action="set-sort"]');
  const grid = document.getElementById('char-grid');
  if (!select || !grid || !grid.contains(select)) return;
  setCharacterRegisterSortMode(select.value || 'name-asc');
}

function handleCharacterRegisterSearch(event) {
  const input = event.target?.closest?.('[data-character-register-action="search"]');
  const grid = document.getElementById('char-grid');
  if (!input || !grid || !grid.contains(input)) return;
  _characterRegisterSearch = input.value || '';
  if (typeof renderCharGrid !== 'function') return;
  renderCharGrid();
  const nextInput = document.querySelector('[data-character-register-action="search"]');
  if (!nextInput) return;
  nextInput.focus({ preventScroll: true });
  nextInput.setSelectionRange(_characterRegisterSearch.length, _characterRegisterSearch.length);
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleCharacterRegisterViewClick);
  document.addEventListener('change', handleCharacterRegisterViewChange);
  document.addEventListener('input', handleCharacterRegisterSearch);
  document.addEventListener('aleria:character-genealogy-ready', () => {
    if (typeof renderCharGrid === 'function') renderCharGrid();
  });
}
