let _characterDashboardFilter = '';

const CHARACTER_DASHBOARD_FILTER_LABELS = {
  'missing-portrait': 'Kein Portrait',
  'missing-bio': 'Keine Beschreibung',
  'missing-group': 'Noch zuordnen',
  important: 'Wichtige aktive Figuren',
  inactive: 'Tot / verschollen',
  plot: 'Plot-Knoten',
  recent: 'Zuletzt bearbeitet',
  new: 'Neue Charaktere'
};

function getCharacterDateTimestamp(value) {
  return getCharacterRegisterDateTimestamp(value);
}

function sortCharactersByDate(chars, field) {
  return chars
    .filter(char => getCharacterDateTimestamp(char?.[field]))
    .slice()
    .sort((a, b) => getCharacterDateTimestamp(b?.[field]) - getCharacterDateTimestamp(a?.[field]));
}

function characterHasDescription(char) {
  return !!String(char?.bio || '').trim();
}

function characterHasGroup(char) {
  return AleriaCharacterCategories.classify(char).kind !== 'unsorted';
}

function isCharacterImportant(char) {
  const relevance = getCharacterRelevanceValue(char?.relevance);
  const status = getCharacterStatusValue(char?.status);
  return (relevance === 'important' || isCharacterPlotNode(char)) && status !== 'dead' && status !== 'missing' && status !== 'inactive';
}

function isCharacterInactiveOrGone(char) {
  const status = getCharacterStatusValue(char?.status);
  return status === 'dead' || status === 'missing';
}

function isCharacterPlotNode(char) {
  return getCharacterRelevanceValue(char?.relevance) === 'plot' || !!String(char?.plotNode || '').trim();
}

function filterCharactersForDashboard(chars, activeTab) {
  if (activeTab !== 'Alle' || !_characterDashboardFilter) return chars;
  return chars.filter(char => {
    if (_characterDashboardFilter === 'missing-portrait') return !sanitizeImageSrc(char?.portrait);
    if (_characterDashboardFilter === 'missing-bio') return !characterHasDescription(char);
    if (_characterDashboardFilter === 'missing-group') return !characterHasGroup(char);
    if (_characterDashboardFilter === 'important') return isCharacterImportant(char);
    if (_characterDashboardFilter === 'inactive') return isCharacterInactiveOrGone(char);
    if (_characterDashboardFilter === 'plot') return isCharacterPlotNode(char);
    if (_characterDashboardFilter === 'recent') return !!getCharacterDateTimestamp(char.updatedAt);
    if (_characterDashboardFilter === 'new') return !!getCharacterDateTimestamp(char.createdAt);
    return true;
  });
}

function showUnsortedCharacters() {
  resetCharacterRegisterFilters();
  _activeCharTab = 'Alle';
  _activeCharSubtab = 'Alle';
  _characterDashboardFilter = 'missing-group';
  if (typeof setCharacterRegisterViewMode === 'function') {
    setCharacterRegisterViewMode('categories', { render: false });
  }
  renderCharSubtabs();
  renderCharGrid();
}

function buildCharacterDashboardSummary(chars) {
  const visible = chars.filter(char => !char.archived);
  return {
    total: visible.length,
    missingPortrait: visible.filter(char => !sanitizeImageSrc(char.portrait)),
    missingBio: visible.filter(char => !characterHasDescription(char)),
    unsorted: visible.filter(char => !characterHasGroup(char)),
    important: visible.filter(isCharacterImportant),
    inactive: visible.filter(isCharacterInactiveOrGone),
    plot: visible.filter(isCharacterPlotNode),
    recent: sortCharactersByDate(visible, 'updatedAt').slice(0, 5),
    newCharacters: sortCharactersByDate(visible, 'createdAt').slice(0, 5),
    groups: buildCharacterDashboardGroups(visible).slice(0, 6)
  };
}

function buildCharacterDashboardGroups(chars) {
  return AleriaCharacterCategories.buildBuckets(chars)
    .map(bucket => ({ key: bucket.key, label: bucket.label, count: bucket.chars.length }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'de', { sensitivity: 'base' }));
}

function renderCharacterDashboardMetric(label, count, filter, hint = 'Figuren anzeigen') {
  const active = _characterDashboardFilter === filter;
  return `
    <button class="char-dashboard-metric${active ? ' active' : ''}" type="button"
      data-character-dashboard-action="set-filter" data-filter="${escapeHtml(filter)}" aria-pressed="${active}">
      <span>${escapeHtml(label)}</span>
      <strong>${count}</strong>
      <small>${escapeHtml(hint)} <span aria-hidden="true">→</span></small>
    </button>`;
}

function renderCharacterDashboardMiniList(chars, emptyText) {
  if (!chars.length) return `<div class="char-dashboard-empty">${escapeHtml(emptyText)}</div>`;
  return chars.map(char => `
    <button class="char-dashboard-character" type="button"
      data-character-grid-action="open-character" data-char-id="${escapeHtml(char.id || '')}">
      <span class="char-dashboard-character-name">${escapeHtml(char.name || 'Unbenannt')}</span>
      <span class="char-dashboard-character-meta">${escapeHtml(AleriaCharacterCategories.classify(char).label)}</span>
    </button>`).join('');
}

function renderCharacterDashboardGroups(groups) {
  if (!groups.length) return '<div class="char-dashboard-empty">Noch keine Gruppen belegt.</div>';
  return groups.map(group => `
    <button class="char-dashboard-group" type="button"
      data-character-dashboard-action="select-group" data-category-key="${escapeHtml(group.key)}">
      <span>${escapeHtml(group.label)}</span>
      <strong>${group.count}</strong>
    </button>`).join('');
}

function renderCharacterDashboard(grid, chars) {
  if (!grid || _activeCharTab !== 'Alle' || _archiveSearchNeedle || _charOrganizeMode) return;
  const summary = buildCharacterDashboardSummary(chars);
  const activeFilterLabel = CHARACTER_DASHBOARD_FILTER_LABELS[_characterDashboardFilter] || '';
  const dashboard = document.createElement('section');
  dashboard.className = 'char-dashboard';
  dashboard.innerHTML = `
    <div class="char-dashboard-head">
      <div>
        <div class="char-dashboard-kicker">Schnellzugriff</div>
        <div class="char-dashboard-title">${summary.total} Figuren im Register</div>
      </div>
      ${activeFilterLabel ? `
        <button class="char-dashboard-clear" type="button" data-character-dashboard-action="clear-filter">
          Filter: ${escapeHtml(activeFilterLabel)} entfernen
        </button>` : ''}
    </div>
    <div class="char-dashboard-metrics">
      ${renderCharacterDashboardMetric('Zuletzt bearbeitet', '↻', 'recent', 'Nach letzter Änderung')}
      ${renderCharacterDashboardMetric('Neue Charaktere', '+', 'new', 'Neueste zuerst')}
      ${renderCharacterDashboardMetric('Noch zuordnen', summary.unsorted.length, 'missing-group')}
      ${renderCharacterDashboardMetric('Wichtig aktiv', summary.important.length, 'important')}
      ${renderCharacterDashboardMetric('Kein Portrait', summary.missingPortrait.length, 'missing-portrait')}
      ${renderCharacterDashboardMetric('Keine Beschreibung', summary.missingBio.length, 'missing-bio')}
      ${renderCharacterDashboardMetric('Tot / verschollen', summary.inactive.length, 'inactive')}
      ${renderCharacterDashboardMetric('Plot-Knoten', summary.plot.length, 'plot')}
    </div>
    <details class="char-dashboard-preview"><summary>Letzte Figuren & häufige Kategorien</summary>
    <div class="char-dashboard-columns">
      <div class="char-dashboard-panel">
        <button class="char-dashboard-panel-head char-dashboard-panel-link" type="button" data-character-dashboard-action="set-filter" data-filter="recent">Zuletzt bearbeitet <span aria-hidden="true">→</span></button>
        ${renderCharacterDashboardMiniList(summary.recent, 'Noch keine Bearbeitungsdaten.')}
      </div>
      <div class="char-dashboard-panel">
        <button class="char-dashboard-panel-head char-dashboard-panel-link" type="button" data-character-dashboard-action="set-filter" data-filter="new">Neue Charaktere <span aria-hidden="true">→</span></button>
        ${renderCharacterDashboardMiniList(summary.newCharacters, 'Noch keine Erstellungsdaten.')}
      </div>
      <div class="char-dashboard-panel">
        <div class="char-dashboard-panel-head"><span>Häufige Kategorien</span></div>
        ${renderCharacterDashboardGroups(summary.groups)}
      </div>
    </div></details>`;
  grid.appendChild(dashboard);
}

function handleCharacterDashboardClick(event) {
  const trigger = event.target?.closest?.('[data-character-dashboard-action]');
  const grid = document.getElementById('char-grid');
  if (!trigger || !grid || !grid.contains(trigger)) return;

  const action = trigger.dataset.characterDashboardAction;
  event.preventDefault();
  event.stopPropagation();

  if (action === 'set-filter') {
    const next = trigger.dataset.filter || '';
    const previous = _characterDashboardFilter;
    resetCharacterRegisterFilters();
    _characterDashboardFilter = previous === next ? '' : next;
    if (_characterDashboardFilter === 'recent' || _characterDashboardFilter === 'new') {
      setCharacterRegisterSortMode(_characterDashboardFilter === 'recent' ? 'updated-desc' : 'created-desc', { render: false });
    }
    renderCharSubtabs();
    renderCharGrid();
    AleriaCharacterCategoryBrowser.focusResults();
    return;
  }
  if (action === 'clear-filter') {
    _characterDashboardFilter = '';
    renderCharSubtabs();
    renderCharGrid();
    return;
  }
  if (action === 'select-group') {
    resetCharacterRegisterFilters();
    setCharacterRegisterViewMode('categories', { render: false });
    AleriaCharacterCategoryBrowser.select(trigger.dataset.categoryKey);
  }
}

document.addEventListener('click', handleCharacterDashboardClick);
