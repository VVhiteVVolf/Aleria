let _characterDashboardFilter = '';

const CHARACTER_DASHBOARD_FILTER_LABELS = {
  'missing-portrait': 'Kein Portrait',
  'missing-bio': 'Keine Beschreibung',
  'missing-group': 'Keine Gruppe',
  important: 'Wichtige aktive Figuren',
  inactive: 'Tot / verschollen',
  plot: 'Plot-Knoten',
  recent: 'Zuletzt bearbeitet',
  new: 'Neue Charaktere'
};

function getCharacterDateTimestamp(value) {
  const time = Date.parse(value || '');
  return Number.isFinite(time) ? time : 0;
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
  return !!getCharacterAssignedTab(char?.id);
}

function isCharacterImportant(char) {
  const relevance = getCharacterRelevanceValue(char?.relevance);
  const status = getCharacterStatusValue(char?.status);
  return (relevance === 'important' || relevance === 'plot') && status !== 'dead' && status !== 'missing';
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
  const recentIds = new Set(sortCharactersByDate(chars, 'updatedAt').slice(0, 12).map(char => String(char.id || '')));
  const newIds = new Set(sortCharactersByDate(chars, 'createdAt').slice(0, 12).map(char => String(char.id || '')));

  return chars.filter(char => {
    if (_characterDashboardFilter === 'missing-portrait') return !sanitizeImageSrc(char?.portrait);
    if (_characterDashboardFilter === 'missing-bio') return !characterHasDescription(char);
    if (_characterDashboardFilter === 'missing-group') return !characterHasGroup(char);
    if (_characterDashboardFilter === 'important') return isCharacterImportant(char);
    if (_characterDashboardFilter === 'inactive') return isCharacterInactiveOrGone(char);
    if (_characterDashboardFilter === 'plot') return isCharacterPlotNode(char);
    if (_characterDashboardFilter === 'recent') return recentIds.has(String(char.id || ''));
    if (_characterDashboardFilter === 'new') return newIds.has(String(char.id || ''));
    return true;
  });
}

function buildCharacterDashboardSummary(chars) {
  const visible = chars.filter(char => !char.archived);
  return {
    total: visible.length,
    missingPortrait: visible.filter(char => !sanitizeImageSrc(char.portrait)),
    missingBio: visible.filter(char => !characterHasDescription(char)),
    missingGroup: visible.filter(char => !characterHasGroup(char)),
    important: visible.filter(isCharacterImportant),
    inactive: visible.filter(isCharacterInactiveOrGone),
    plot: visible.filter(isCharacterPlotNode),
    recent: sortCharactersByDate(visible, 'updatedAt').slice(0, 5),
    newCharacters: sortCharactersByDate(visible, 'createdAt').slice(0, 5),
    groups: buildCharacterDashboardGroups(visible).slice(0, 6)
  };
}

function buildCharacterDashboardGroups(chars) {
  const byGroup = new Map();
  chars.forEach(char => {
    const group = getCharacterAssignedTab(char.id) || 'Keine Gruppe';
    byGroup.set(group, (byGroup.get(group) || 0) + 1);
  });
  return Array.from(byGroup.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'de', { sensitivity: 'base' }));
}

function renderCharacterDashboardMetric(label, count, filter) {
  const active = _characterDashboardFilter === filter;
  return `
    <button class="char-dashboard-metric${active ? ' active' : ''}" type="button"
      data-character-dashboard-action="set-filter" data-filter="${escapeHtml(filter)}">
      <span>${escapeHtml(label)}</span>
      <strong>${count}</strong>
    </button>`;
}

function renderCharacterDashboardMiniList(chars, emptyText) {
  if (!chars.length) return `<div class="char-dashboard-empty">${escapeHtml(emptyText)}</div>`;
  return chars.map(char => `
    <button class="char-dashboard-character" type="button"
      data-character-grid-action="open-character" data-char-id="${escapeHtml(char.id || '')}">
      <span class="char-dashboard-character-name">${escapeHtml(char.name || 'Unbenannt')}</span>
      <span class="char-dashboard-character-meta">${escapeHtml(getCharacterAssignedTab(char.id) || getCharacterStatusLabel(char.status) || 'Keine Gruppe')}</span>
    </button>`).join('');
}

function renderCharacterDashboardGroups(groups) {
  if (!groups.length) return '<div class="char-dashboard-empty">Noch keine Gruppen belegt.</div>';
  return groups.map(group => `
    <button class="char-dashboard-group" type="button"
      data-character-dashboard-action="select-group" data-group="${escapeHtml(group.label === 'Keine Gruppe' ? '' : group.label)}">
      <span>${escapeHtml(group.label)}</span>
      <strong>${group.count}</strong>
    </button>`).join('');
}

function renderCharacterDashboard(grid, chars) {
  if (!grid || _activeCharTab !== 'Alle' || _archiveSearchNeedle) return;
  const summary = buildCharacterDashboardSummary(chars);
  const activeFilterLabel = CHARACTER_DASHBOARD_FILTER_LABELS[_characterDashboardFilter] || '';
  const dashboard = document.createElement('section');
  dashboard.className = 'char-dashboard';
  dashboard.innerHTML = `
    <div class="char-dashboard-head">
      <div>
        <div class="char-dashboard-kicker">Charakter-Dashboard</div>
        <div class="char-dashboard-title">${summary.total} aktive Figuren im Register</div>
      </div>
      ${activeFilterLabel ? `
        <button class="char-dashboard-clear" type="button" data-character-dashboard-action="clear-filter">
          Filter: ${escapeHtml(activeFilterLabel)} entfernen
        </button>` : ''}
    </div>
    <div class="char-dashboard-metrics">
      ${renderCharacterDashboardMetric('Kein Portrait', summary.missingPortrait.length, 'missing-portrait')}
      ${renderCharacterDashboardMetric('Keine Beschreibung', summary.missingBio.length, 'missing-bio')}
      ${renderCharacterDashboardMetric('Keine Gruppe', summary.missingGroup.length, 'missing-group')}
      ${renderCharacterDashboardMetric('Wichtig aktiv', summary.important.length, 'important')}
      ${renderCharacterDashboardMetric('Tot / verschollen', summary.inactive.length, 'inactive')}
      ${renderCharacterDashboardMetric('Plot-Knoten', summary.plot.length, 'plot')}
    </div>
    <div class="char-dashboard-columns">
      <div class="char-dashboard-panel">
        <div class="char-dashboard-panel-head">
          <span>Zuletzt bearbeitet</span>
          <button type="button" data-character-dashboard-action="set-filter" data-filter="recent">Anzeigen</button>
        </div>
        ${renderCharacterDashboardMiniList(summary.recent, 'Noch keine Bearbeitungsdaten.')}
      </div>
      <div class="char-dashboard-panel">
        <div class="char-dashboard-panel-head">
          <span>Neue Charaktere</span>
          <button type="button" data-character-dashboard-action="set-filter" data-filter="new">Anzeigen</button>
        </div>
        ${renderCharacterDashboardMiniList(summary.newCharacters, 'Noch keine Erstellungsdaten.')}
      </div>
      <div class="char-dashboard-panel">
        <div class="char-dashboard-panel-head"><span>Meistgenutzte Gruppen</span></div>
        ${renderCharacterDashboardGroups(summary.groups)}
      </div>
    </div>`;
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
    _characterDashboardFilter = trigger.dataset.filter || '';
    renderCharGrid();
    return;
  }
  if (action === 'clear-filter') {
    _characterDashboardFilter = '';
    renderCharGrid();
    return;
  }
  if (action === 'select-group') {
    const group = trigger.dataset.group || '';
    _characterDashboardFilter = '';
    if (group) selectCharacterTab(group);
    else {
      _activeCharTab = 'Alle';
      _activeCharSubtab = 'Alle';
      _characterDashboardFilter = 'missing-group';
      renderCharSubtabs();
      renderCharGrid();
    }
  }
}

document.addEventListener('click', handleCharacterDashboardClick);
