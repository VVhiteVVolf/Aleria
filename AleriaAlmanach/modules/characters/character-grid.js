function setCharacterGroupFromSelect(selectEl, charId) {
  assignCharToTab(charId, selectEl.value || 'Alle');
}

function setCharacterSubgroupFromSelect(selectEl, charId) {
  const parentTab = selectEl.dataset.parentTab || getCharacterAssignedTab(charId);
  assignCharToSubtab(charId, parentTab, selectEl.value || 'Alle');
}

function toggleCharacterOrganizeMode() {
  _charOrganizeMode = !_charOrganizeMode;
  if (!_charOrganizeMode && typeof clearCharacterBulkSelection === 'function') {
    clearCharacterBulkSelection({ render: false });
  }
  renderCharGrid();
}

function toggleCharGroupCollapse(groupKey) {
  const key = String(groupKey || '');
  if (!key) return;
  if (_collapsedCharGroups.has(key)) _collapsedCharGroups.delete(key);
  else _collapsedCharGroups.add(key);
  renderCharGrid();
}

function isCharacterGridControlTarget(target) {
  return !!target?.closest?.('button, select, input, textarea, a');
}

function clearActiveCharacterGroup() {
  if (_activeCharTab === 'Alle') return;
  if (_activeCharSubtab !== 'Alle') {
    if (!confirm(`Alle Charaktere aus "${_activeCharTab} / ${_activeCharSubtab}" entfernen?`)) return;
    if (_charSubtabMap[_activeCharTab]) _charSubtabMap[_activeCharTab][_activeCharSubtab] = [];
    saveCharTabs();
    renderCharSubtabs();
    renderCharGrid();
    return;
  }
  if (!confirm(`Alle Charaktere aus "${_activeCharTab}" entfernen?`)) return;
  _charTabMap[_activeCharTab] = [];
  Object.keys(_charSubtabMap[_activeCharTab] || {}).forEach(subtab => {
    _charSubtabMap[_activeCharTab][subtab] = [];
  });
  saveCharTabs();
  renderCharSubtabs();
  renderCharGrid();
}

function restoreHiddenBuiltinCharacters() {
  if (!_hiddenBuiltinCharacterIds.size) return;
  if (!confirm('Alle ausgeblendeten integrierten Kommentatoren wieder anzeigen?')) return;
  _hiddenBuiltinCharacterIds = new Set();
  saveCharTabs();
  renderCharSubtabs();
  renderCharGrid();
  renderCharPickerInForm();
}

function getCharsForActiveTab() {
  if (_activeCharTab === CHARACTER_ARCHIVE_TAB) {
    return getAllCharacterRecords().filter(char => char.archived);
  }
  if (_activeCharTab === 'Alle') {
    return getVisibleCharacterRecords();
  }
  if (_activeCharSubtab && _activeCharSubtab !== 'Alle') {
    const ids = ((_charSubtabMap[_activeCharTab] || {})[_activeCharSubtab] || []);
    return ids.map(id => getCharacterById(id)).filter(char => char && !char.archived);
  }
  const ids = _charTabMap[_activeCharTab] || [];
  return ids.map(id => getCharacterById(id)).filter(char => char && !char.archived);
}

function getCharacterGroupLabel(char) {
  return getCharacterAssignedTab(char?.id) || 'Keine Gruppe';
}

function getCharacterGroupKey(label) {
  return `group:${String(label || 'Keine Gruppe').toLowerCase()}`;
}

function shouldRenderCharacterSubgroupBuckets() {
  return _activeCharTab !== 'Alle'
    && _activeCharTab !== CHARACTER_ARCHIVE_TAB
    && _activeCharSubtab === 'Alle'
    && getCharacterSubtabs(_activeCharTab).length > 1;
}

function getCharacterSubgroupLabel(char) {
  return getCharacterAssignedSubtab(char?.id, _activeCharTab) || 'Keine Untergruppe';
}

function getCharacterSubgroupKey(label) {
  return `subgroup:${String(_activeCharTab || '').toLowerCase()}:${String(label || 'Keine Untergruppe').toLowerCase()}`;
}

function buildCharacterGroupBuckets(chars) {
  const orderedLabels = _charTabs
    .filter(tab => tab && tab !== 'Alle' && tab !== CHARACTER_ARCHIVE_TAB);
  const byLabel = new Map();
  orderedLabels.forEach(label => byLabel.set(label, []));
  byLabel.set('Keine Gruppe', []);

  chars.forEach(char => {
    const label = getCharacterGroupLabel(char);
    if (!byLabel.has(label)) byLabel.set(label, []);
    byLabel.get(label).push(char);
  });

  return Array.from(byLabel.entries())
    .map(([label, groupChars]) => ({ label, chars: groupChars }))
    .filter(group => group.chars.length);
}

function buildCharacterSubgroupBuckets(chars) {
  const orderedLabels = getCharacterSubtabs(_activeCharTab)
    .filter(subtab => subtab && subtab !== 'Alle');
  const byLabel = new Map();
  orderedLabels.forEach(label => byLabel.set(label, []));
  byLabel.set('Keine Untergruppe', []);

  chars.forEach(char => {
    const label = getCharacterSubgroupLabel(char);
    if (!byLabel.has(label)) byLabel.set(label, []);
    byLabel.get(label).push(char);
  });

  return Array.from(byLabel.entries())
    .map(([label, groupChars]) => ({ label, chars: groupChars }))
    .filter(group => group.chars.length);
}

function createCharacterCard(c, options = {}) {
  const safeName = escapeHtml(c.name || 'Unbenannt');
  const safeTitle = escapeHtml(c.title || '');
  const portraitSrc = sanitizeImageSrc(c.portrait);
  const playerOwner = normalizeCharacterPlayerOwner(c.playerOwner);
  const playerOwnerLabel = getCharacterPlayerOwnerLabel(playerOwner);
  const assignedTab = getCharacterAssignedTab(c.id);
  const assignedSubtab = getCharacterAssignedSubtab(c.id, assignedTab);
  const groupLabel = assignedTab || 'Keine Gruppe';
  const showGroupSelect = !!options.organizeMode;
  const showBulkSelect = showGroupSelect && typeof getSelectedCharacterIds === 'function';
  const bulkSelected = showBulkSelect && getSelectedCharacterIds().includes(String(c.id || ''));
  const groupOptions = ['Alle', ..._charTabs.filter(tab => tab !== 'Alle')]
    .map(tab => `<option value="${escapeHtml(tab)}"${(assignedTab || 'Alle') === tab ? ' selected' : ''}>${escapeHtml(tab === 'Alle' ? 'Keine Gruppe' : tab)}</option>`)
    .join('');
  const subgroupOptions = assignedTab && assignedTab !== CHARACTER_ARCHIVE_TAB
    ? getCharacterSubtabs(assignedTab)
        .map(subtab => `<option value="${escapeHtml(subtab)}"${(assignedSubtab || 'Alle') === subtab ? ' selected' : ''}>${escapeHtml(subtab === 'Alle' ? 'Keine Untergruppe' : subtab)}</option>`)
        .join('')
    : '';

  const card = document.createElement('div');
  card.className = 'char-card' + (c.archived ? ' archived' : '') + (showGroupSelect ? ' organizing' : '');
  card.draggable = showGroupSelect;
  card.dataset.charId = c.id;
  card.dataset.searchKind = 'character';
  card.setAttribute('role', 'button');
  card.dataset.characterGridAction = 'open-character';
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${c.name || 'Charakter'} öffnen`);
  card.innerHTML = `
    ${showBulkSelect ? `
      <label class="char-card-bulk-select" title="Für Massenaktion auswählen" data-character-grid-action="toggle-bulk-character" data-char-id="${escapeHtml(c.id)}">
        <input type="checkbox" data-character-grid-action="toggle-bulk-character" data-char-id="${escapeHtml(c.id)}"${bulkSelected ? ' checked' : ''}>
        <span></span>
      </label>` : ''}
    <div class="char-card-img">
      ${portraitSrc
        ? `<img src="${portraitSrc}" alt="${safeName}" loading="lazy" decoding="async">`
        : `<div class="char-card-img-placeholder">${getInitialChar(c.name)}</div>`}
      <div class="char-card-overlay"></div>
      <div class="char-card-label">
        <div class="char-card-name">${safeName}</div>
        <div class="char-card-title">${safeTitle}</div>
        ${playerOwnerLabel ? `<div class="char-card-player">Gespielt von ${escapeHtml(playerOwnerLabel)}</div>` : ''}
      </div>
    </div>
    <div class="char-card-tools">
      ${showGroupSelect
        ? `<select class="char-card-group-select" title="Gruppe wählen" aria-label="Gruppe für ${safeName} wählen">${groupOptions}</select>
           ${assignedTab ? `<select class="char-card-subgroup-select" title="Untergruppe wählen" aria-label="Untergruppe für ${safeName} wählen" data-parent-tab="${escapeHtml(assignedTab)}">${subgroupOptions}</select>` : ''}`
        : `<span class="char-card-group-badge">${escapeHtml(groupLabel)}${assignedSubtab ? ` / ${escapeHtml(assignedSubtab)}` : ''}</span>`}
    </div>`;

  if (showGroupSelect) {
    card.addEventListener('dragstart', e => {
      _dragCharId = c.id;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      _dragCharId = null;
      card.classList.remove('dragging');
      document.querySelectorAll('.char-subtab-btn, .char-group-section').forEach(b => b.classList.remove('drag-over'));
    });
  }

  const groupSelect = card.querySelector('.char-card-group-select');
  if (groupSelect) {
    groupSelect.dataset.characterGridAction = 'assign-group';
    groupSelect.dataset.charId = c.id;
  }
  const subgroupSelect = card.querySelector('.char-card-subgroup-select');
  if (subgroupSelect) {
    subgroupSelect.dataset.characterGridAction = 'assign-subgroup';
    subgroupSelect.dataset.charId = c.id;
  }
  return card;
}

function createCharacterGroupSection(group, options = {}) {
  const section = document.createElement('section');
  const getGroupKey = options.getGroupKey || getCharacterGroupKey;
  const groupKey = getGroupKey(group.label);
  const emptyLabel = options.emptyLabel || 'Keine Gruppe';
  const sectionModifier = options.sectionModifier ? ` ${options.sectionModifier}` : '';
  const collapsed = !_archiveSearchNeedle && !_charOrganizeMode && _collapsedCharGroups.has(groupKey);
  section.className = 'char-group-section' + sectionModifier + (collapsed ? ' collapsed' : '');
  if (options.datasetName) section.dataset[options.datasetName] = group.label;
  else section.dataset.charGroup = group.label;
  section.innerHTML = `
    <button class="char-group-section-head" type="button">
      <span class="char-group-section-title">${escapeHtml(group.label)}</span>
      <span class="char-group-section-count">${group.chars.length} ${group.chars.length === 1 ? 'Charakter' : 'Charaktere'}</span>
      <span class="char-group-section-caret">${collapsed ? '▸' : '▾'}</span>
    </button>
    <div class="char-group-grid"></div>`;
  const groupHead = section.querySelector('.char-group-section-head');
  groupHead.dataset.characterGridAction = 'toggle-group';
  groupHead.dataset.groupKey = groupKey;

  const canDrop = _charOrganizeMode
    && typeof options.onDrop === 'function'
    && (options.allowDropOnEmpty || group.label !== emptyLabel);

  if (canDrop) {
    section.addEventListener('dragover', e => { e.preventDefault(); section.classList.add('drag-over'); });
    section.addEventListener('dragleave', () => section.classList.remove('drag-over'));
    section.addEventListener('drop', e => {
      e.preventDefault();
      section.classList.remove('drag-over');
      if (_dragCharId) options.onDrop(_dragCharId, group.label === emptyLabel ? '' : group.label);
    });
  }

  if (!collapsed) {
    const innerGrid = section.querySelector('.char-group-grid');
    group.chars.forEach(char => innerGrid.appendChild(createCharacterCard(char, { organizeMode: _charOrganizeMode })));
  }
  return section;
}

function appendCharacterEmptyHint(grid, text) {
  const hint = document.createElement('div');
  hint.className = 'char-empty-hint';
  hint.textContent = text;
  grid.appendChild(hint);
}

function renderCharGrid() {
  const grid = document.getElementById('char-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const groupBySubtab = shouldRenderCharacterSubgroupBuckets();
  grid.classList.toggle('organizing', _charOrganizeMode);
  grid.classList.toggle('grouped', _activeCharTab === 'Alle' || groupBySubtab);

  const block = document.querySelector('.section-block[data-tab="Charaktere"]');
  const actions = document.createElement('div');
  actions.className = 'char-archive-actions';
  actions.innerHTML = `
    <button type="button" class="${_charOrganizeMode ? 'active' : ''}" data-character-grid-action="toggle-organize">${_charOrganizeMode ? 'Ansicht' : 'Organisieren'}</button>
    <button type="button" data-character-grid-action="export-archive">Charakterarchiv exportieren</button>
    <button type="button" data-character-grid-action="open-import-file">Charaktere importieren</button>`;
  grid.appendChild(actions);

  if (_activeCharTab === 'Alle' && _hiddenBuiltinCharacterIds.size) {
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'char-archive-toggle';
    restoreBtn.type = 'button';
    restoreBtn.textContent = `Ausgeblendete wiederherstellen (${_hiddenBuiltinCharacterIds.size})`;
    restoreBtn.dataset.characterGridAction = 'restore-hidden';
    grid.appendChild(restoreBtn);
  }

  if (_activeCharTab !== 'Alle' && _activeCharTab !== CHARACTER_ARCHIVE_TAB) {
    const toolbar = document.createElement('div');
    toolbar.className = 'char-group-toolbar';
    toolbar.innerHTML = `
      <div class="char-group-toolbar-title">${escapeHtml(_activeCharTab)}${_activeCharSubtab !== 'Alle' ? ` / ${escapeHtml(_activeCharSubtab)}` : ''}</div>
      <button type="button" data-character-grid-action="rename-active-tab">Umbenennen</button>
      <button type="button" data-character-grid-action="clear-active-group">Leeren</button>`;
    grid.appendChild(toolbar);
  }

  const chars = getCharsForActiveTab().filter(c => matchesArchiveSearch(buildCharacterSearchText(c)));
  if (typeof renderCharacterBulkToolbar === 'function') renderCharacterBulkToolbar(grid, chars);
  if (_activeCharTab === 'Alle') {
    const groups = buildCharacterGroupBuckets(chars);
    groups.forEach(group => {
      grid.appendChild(createCharacterGroupSection(group, {
        emptyLabel: 'Keine Gruppe',
        onDrop: (charId, label) => assignCharToTab(charId, label)
      }));
    });
  } else if (groupBySubtab) {
    const subgroups = buildCharacterSubgroupBuckets(chars);
    subgroups.forEach(group => {
      grid.appendChild(createCharacterGroupSection(group, {
        sectionModifier: 'subgroup',
        datasetName: 'charSubgroup',
        emptyLabel: 'Keine Untergruppe',
        getGroupKey: getCharacterSubgroupKey,
        allowDropOnEmpty: true,
        onDrop: (charId, label) => assignCharToSubtab(charId, _activeCharTab, label)
      }));
    });
  } else {
    chars.forEach(c => grid.appendChild(createCharacterCard(c, { organizeMode: _charOrganizeMode })));
  }

  const narratorMatches = !_archiveSearchNeedle || matchesArchiveSearch(normalizeSearchText('Erzähler neutrale Stimme kein Portrait'));

  if (chars.length === 0 && _activeCharTab === CHARACTER_ARCHIVE_TAB && !_archiveSearchNeedle) {
    appendCharacterEmptyHint(grid, 'Keine archivierten Charaktere vorhanden.');
  } else if (chars.length === 0 && _activeCharSubtab !== 'Alle' && !_archiveSearchNeedle) {
    appendCharacterEmptyHint(grid, _charOrganizeMode
      ? 'Ziehe Charakterkarten auf diesen Unterreiter oder wähle ihn in der Karte aus.'
      : 'In dieser Untergruppe sind noch keine Charaktere.');
  } else if (chars.length === 0 && _activeCharTab !== 'Alle' && !_archiveSearchNeedle) {
    appendCharacterEmptyHint(grid, _charOrganizeMode
      ? 'Ziehe Charakterkarten auf diesen Reiter um sie hier einzusortieren.'
      : 'In dieser Gruppe sind noch keine Charaktere.');
  } else if (chars.length === 0 && _archiveSearchNeedle) {
    appendCharacterEmptyHint(grid, `Keine Charaktere passen zu "${_archiveSearch.trim()}".`);
  }

  if (_activeCharTab === 'Alle' && narratorMatches) {
    const narratorCard = document.createElement('div');
    narratorCard.className = 'char-card';
    narratorCard.style.cssText = 'opacity:0.75;cursor:default;';
    narratorCard.innerHTML = `
      <div class="char-card-img">
        <img src="https://i.imgur.com/Bpo3Pzn.png" alt="Erzähler" loading="lazy" decoding="async" style="filter:sepia(20%)grayscale(30%)">
        <div class="char-card-overlay"></div>
        <div class="char-card-label">
          <div class="char-card-name">✦ Der Erzähler</div>
          <div class="char-card-title" style="font-style:italic">Neutrale Stimme · Kein Portrait</div>
        </div>
      </div>`;
    grid.appendChild(narratorCard);
  }

  if (block) {
    const hasMatches = !_archiveSearchNeedle || chars.length > 0 || (_activeCharTab === 'Alle' && narratorMatches);
    block.dataset.hasMatches = hasMatches ? 'true' : 'false';
    _archiveCharMatchCount = chars.length + (_activeCharTab === 'Alle' && narratorMatches ? 1 : 0);
    _archiveSectionMatchCount = _archiveEntrySectionMatchCount + (hasMatches ? 1 : 0);
  }

  const addCard = document.createElement('div');
  addCard.className = 'char-add-card';
  addCard.setAttribute('role', 'button');
  addCard.setAttribute('tabindex', '0');
  addCard.setAttribute('aria-label', 'Charakter anlegen');
  addCard.dataset.characterGridAction = 'open-new-character';
  addCard.innerHTML = `<div class="char-add-icon">+</div><div class="char-add-label">Charakter anlegen</div>`;
  grid.appendChild(addCard);

  switchTab(_activeTab);
}

function getCharacterGridActionTrigger(event) {
  const trigger = event.target?.closest?.('[data-character-grid-action]');
  const grid = document.getElementById('char-grid');
  if (!trigger || !grid || !grid.contains(trigger)) return null;
  return trigger;
}

function handleCharacterGridActionClick(event) {
  const trigger = getCharacterGridActionTrigger(event);
  if (!trigger) return;

  const action = trigger.dataset.characterGridAction;
  if (action === 'assign-group') return;
  if (action === 'assign-subgroup') return;
  if (action === 'bulk-target-group') return;
  if (action === 'bulk-target-subgroup') return;
  if (action === 'toggle-bulk-character') return;
  if (action === 'open-character' && isCharacterGridControlTarget(event.target)) return;

  event.preventDefault();

  if (action === 'open-character') {
    openCharProfile(trigger.dataset.charId);
    return;
  }
  if (action === 'open-new-character') {
    openCharProfile(null);
    return;
  }
  if (action === 'toggle-group') {
    toggleCharGroupCollapse(trigger.dataset.groupKey);
    return;
  }
  if (action === 'toggle-organize') {
    toggleCharacterOrganizeMode();
    return;
  }
  if (action === 'bulk-select-visible') {
    selectVisibleCharactersForBulk(getCharsForActiveTab().filter(c => matchesArchiveSearch(buildCharacterSearchText(c))));
    return;
  }
  if (action === 'bulk-clear-selection') {
    clearCharacterBulkSelection();
    return;
  }
  if (action === 'bulk-assign-group') {
    assignSelectedCharactersToGroup(trigger);
    return;
  }
  if (action === 'bulk-archive') {
    setSelectedCharactersArchived(_activeCharTab !== CHARACTER_ARCHIVE_TAB);
    return;
  }
  if (action === 'export-archive') {
    exportCharacterArchive();
    return;
  }
  if (action === 'open-import-file') {
    openCharacterImportFilePicker();
    return;
  }
  if (action === 'restore-hidden') {
    restoreHiddenBuiltinCharacters();
    return;
  }
  if (action === 'rename-active-tab') {
    renameCharTab(_activeCharTab);
    return;
  }
  if (action === 'clear-active-group') {
    clearActiveCharacterGroup();
  }
}

function handleCharacterGridActionKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const trigger = getCharacterGridActionTrigger(event);
  if (!trigger) return;

  const action = trigger.dataset.characterGridAction;
  if (action !== 'open-character' && action !== 'open-new-character') return;

  event.preventDefault();
  if (action === 'open-character') openCharProfile(trigger.dataset.charId);
  else openCharProfile(null);
}

function handleCharacterGridGroupChange(event) {
  const selectEl = event.target?.closest?.('[data-character-grid-action="assign-group"], [data-character-grid-action="assign-subgroup"], [data-character-grid-action="bulk-target-group"], [data-character-grid-action="bulk-target-subgroup"], [data-character-grid-action="toggle-bulk-character"]');
  const grid = document.getElementById('char-grid');
  if (!selectEl || !grid || !grid.contains(selectEl)) return;

  event.stopPropagation();
  if (selectEl.dataset.characterGridAction === 'toggle-bulk-character') {
    toggleCharacterBulkSelection(selectEl.dataset.charId, !!selectEl.checked);
    return;
  }
  if (selectEl.dataset.characterGridAction === 'assign-group') {
    setCharacterGroupFromSelect(selectEl, selectEl.dataset.charId);
    return;
  }
  if (selectEl.dataset.characterGridAction === 'bulk-target-group') {
    updateCharacterBulkSubgroupSelect(selectEl);
    return;
  }
  if (selectEl.dataset.characterGridAction === 'bulk-target-subgroup') {
    return;
  }
  setCharacterSubgroupFromSelect(selectEl, selectEl.dataset.charId);
}

document.addEventListener('click', handleCharacterGridActionClick);
document.addEventListener('keydown', handleCharacterGridActionKeydown);
document.addEventListener('change', handleCharacterGridGroupChange);
