const CHARACTER_REGISTER_VIEW_OPTIONS = [
  { value: 'collections', label: 'Sammlungen' },
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

let _characterRegisterViewMode = 'collections';
let _characterRegisterSortMode = 'name-asc';

function getCharacterRegisterViewMode() {
  return _characterRegisterViewMode;
}

function isCharacterRegisterFacetView(mode = _characterRegisterViewMode) {
  return mode !== 'collections';
}

function setCharacterRegisterViewMode(mode, options = {}) {
  const isKnownMode = CHARACTER_REGISTER_VIEW_OPTIONS.some(option => option.value === mode);
  _characterRegisterViewMode = isKnownMode ? mode : 'collections';
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

function buildCharacterRegisterFacetBuckets(chars, mode = _characterRegisterViewMode) {
  if (!isCharacterRegisterFacetView(mode)) return [];
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

function getCharacterRegisterFacetKey(label) {
  return `facet:${_characterRegisterViewMode}:${String(label || '').toLocaleLowerCase('de')}`;
}

function renderCharacterRegisterViewToolbar(grid) {
  if (!grid) return;
  const toolbar = document.createElement('section');
  toolbar.className = 'char-register-view-toolbar';
  toolbar.setAttribute('aria-label', 'Charakteransicht und Sortierung');
  toolbar.innerHTML = `
    <div class="char-register-view-copy">
      <span>Registeransicht</span>
      <small>Sammlungen sind dauerhaft gepflegt. Die anderen Ansichten gruppieren dieselben Figuren nur für den Moment.</small>
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
    </label>`;
  grid.appendChild(toolbar);
}

function handleCharacterRegisterViewClick(event) {
  const trigger = event.target?.closest?.('[data-character-register-action="set-view"]');
  const grid = document.getElementById('char-grid');
  if (!trigger || !grid || !grid.contains(trigger) || trigger.disabled) return;
  event.preventDefault();
  setCharacterRegisterViewMode(trigger.dataset.viewMode || 'collections');
}

function handleCharacterRegisterViewChange(event) {
  const select = event.target?.closest?.('[data-character-register-action="set-sort"]');
  const grid = document.getElementById('char-grid');
  if (!select || !grid || !grid.contains(select)) return;
  setCharacterRegisterSortMode(select.value || 'name-asc');
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleCharacterRegisterViewClick);
  document.addEventListener('change', handleCharacterRegisterViewChange);
}
