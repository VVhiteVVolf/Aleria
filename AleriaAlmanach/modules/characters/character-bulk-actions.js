let _selectedCharacterIds = new Set();

function getSelectedCharacterIds() {
  return Array.from(_selectedCharacterIds).filter(id => getCharacterById(id));
}

function clearCharacterBulkSelection(options = {}) {
  _selectedCharacterIds = new Set();
  if (options.render !== false) renderCharGrid();
}

function pruneCharacterBulkSelection(visibleIds = null) {
  const allowed = Array.isArray(visibleIds) ? new Set(visibleIds) : null;
  _selectedCharacterIds = new Set(Array.from(_selectedCharacterIds).filter(id => {
    if (!getCharacterById(id)) return false;
    return !allowed || allowed.has(id);
  }));
}

function toggleCharacterBulkSelection(charId, checked) {
  const id = String(charId || '');
  if (!id) return;
  if (checked) _selectedCharacterIds.add(id);
  else _selectedCharacterIds.delete(id);
  renderCharGrid();
}

function selectVisibleCharactersForBulk(chars = []) {
  _selectedCharacterIds = new Set(chars.map(char => String(char?.id || '')).filter(Boolean));
  renderCharGrid();
}

function getBulkMainGroupOptions(selected = '') {
  return ['Alle', ..._charTabs.filter(tab => tab !== 'Alle' && tab !== CHARACTER_ARCHIVE_TAB)]
    .map(tab => {
      const value = tab === 'Alle' ? '' : tab;
      const label = tab === 'Alle' ? 'Keine Gruppe' : tab;
      return `<option value="${escapeHtml(value)}"${selected === value ? ' selected' : ''}>${escapeHtml(label)}</option>`;
    })
    .join('');
}

function getBulkSubgroupOptions(parentTab = '', selected = '') {
  const tab = String(parentTab || '');
  if (!tab || tab === 'Alle' || tab === CHARACTER_ARCHIVE_TAB) return '';
  return getCharacterSubtabs(tab)
    .map(subtab => {
      const value = subtab === 'Alle' ? '' : subtab;
      const label = subtab === 'Alle' ? 'Keine Untergruppe' : subtab;
      return `<option value="${escapeHtml(value)}"${selected === value ? ' selected' : ''}>${escapeHtml(label)}</option>`;
    })
    .join('');
}

function renderCharacterBulkToolbar(grid, visibleChars = []) {
  if (!grid || !_charOrganizeMode) return;
  const visibleIds = visibleChars.map(char => String(char?.id || '')).filter(Boolean);
  pruneCharacterBulkSelection(visibleIds);

  const selectedIds = getSelectedCharacterIds();
  const selectedCount = selectedIds.length;
  const defaultGroup = _activeCharTab !== 'Alle' && _activeCharTab !== CHARACTER_ARCHIVE_TAB ? _activeCharTab : '';
  const defaultSubgroup = defaultGroup && _activeCharSubtab !== 'Alle' ? _activeCharSubtab : '';
  const toolbar = document.createElement('div');
  toolbar.className = 'char-bulk-toolbar';
  toolbar.innerHTML = `
    <div class="char-bulk-count">${selectedCount} ausgewählt</div>
    <div class="char-bulk-controls">
      <button type="button" data-character-grid-action="bulk-select-visible"${visibleIds.length ? '' : ' disabled'}>Sichtbare wählen</button>
      <button type="button" data-character-grid-action="bulk-clear-selection"${selectedCount ? '' : ' disabled'}>Auswahl leeren</button>
      <select class="char-bulk-group-select" data-character-grid-action="bulk-target-group" aria-label="Zielgruppe">
        ${getBulkMainGroupOptions(defaultGroup)}
      </select>
      <select class="char-bulk-subgroup-select" data-character-grid-action="bulk-target-subgroup" aria-label="Zieluntergruppe"${defaultGroup ? '' : ' disabled'}>
        ${getBulkSubgroupOptions(defaultGroup, defaultSubgroup)}
      </select>
      <button type="button" data-character-grid-action="bulk-assign-group"${selectedCount ? '' : ' disabled'}>Verschieben</button>
      <button type="button" data-character-grid-action="bulk-archive"${selectedCount ? '' : ' disabled'}>${_activeCharTab === CHARACTER_ARCHIVE_TAB ? 'Wiederherstellen' : 'Archivieren'}</button>
    </div>`;
  grid.appendChild(toolbar);
}

function updateCharacterBulkSubgroupSelect(groupSelect) {
  const toolbar = groupSelect?.closest?.('.char-bulk-toolbar');
  const subgroupSelect = toolbar?.querySelector('.char-bulk-subgroup-select');
  if (!subgroupSelect) return;
  const group = String(groupSelect.value || '');
  subgroupSelect.innerHTML = getBulkSubgroupOptions(group);
  subgroupSelect.disabled = !group;
}

function getCharacterBulkTargetControls(trigger) {
  const toolbar = trigger?.closest?.('.char-bulk-toolbar');
  return {
    group: toolbar?.querySelector('.char-bulk-group-select')?.value || '',
    subgroup: toolbar?.querySelector('.char-bulk-subgroup-select')?.value || ''
  };
}

function assignSelectedCharactersToGroup(trigger) {
  const selectedIds = getSelectedCharacterIds();
  if (!selectedIds.length) return;
  const target = getCharacterBulkTargetControls(trigger);
  selectedIds.forEach(id => {
    if (target.group && target.subgroup) assignCharToSubtab(id, target.group, target.subgroup, { render: false, save: false });
    else assignCharToTab(id, target.group || 'Alle', { render: false, save: false });
  });
  saveCharTabs();
  clearCharacterBulkSelection({ render: false });
  renderCharSubtabs();
  renderCharGrid();
}

function buildStoredCharacterFromRecord(char, archived) {
  const cloned = cloneCharacterRecord(char || {});
  return {
    name: cloned.name || '',
    title: cloned.title || '',
    fraktion: cloned.fraktion || cloned.faction || '',
    profileLink: cloned.profileLink || '',
    playerOwner: normalizeCharacterPlayerOwner(cloned.playerOwner),
    bio: cloned.bio || '',
    aliases: cloned.aliases || [],
    archived: !!archived,
    portrait: normalizeImageUrlForStorage(cloned.portrait) || null,
    emotes: (cloned.emotes || [])
      .map(emote => ({ img: normalizeImageUrlForStorage(emote.img), label: emote.label || '' }))
      .filter(emote => emote.img),
    emotesOverride: !!cloned.emotesOverride
  };
}

async function setSelectedCharactersArchived(archived) {
  const selectedIds = getSelectedCharacterIds();
  if (!selectedIds.length) return;
  if (!window._fb?.saveCharacter) {
    showAppStatus('Charaktere konnten nicht online gespeichert werden.', 'error');
    return;
  }
  const verb = archived ? 'archivieren' : 'wiederherstellen';
  if (!confirm(`${selectedIds.length} Charaktere ${verb}?`)) return;

  try {
    for (const sourceId of selectedIds) {
      const character = getCharacterById(sourceId);
      if (!character) continue;
      const isBuiltin = isBuiltinCharacterId(sourceId);
      const saveTargetId = isBuiltin ? null : sourceId;
      const data = buildStoredCharacterFromRecord(character, archived);
      const savedId = await window._fb.saveCharacter(saveTargetId, data);
      if (saveTargetId) {
        const index = _characters.findIndex(item => String(item.id || '') === String(saveTargetId));
        if (index >= 0) _characters[index] = { id: saveTargetId, ...data };
        else _characters.push({ id: saveTargetId, ...data });
      } else {
        replaceCharacterIdInTabs(sourceId, savedId);
        _characters.push({ id: savedId, ...data });
      }
    }
    saveCharTabs();
    clearCharacterBulkSelection({ render: false });
    renderCharSubtabs();
    renderCharGrid();
    renderCharPickerInForm();
    showAppStatus(`${selectedIds.length} Charaktere ${archived ? 'archiviert' : 'wiederhergestellt'}.`, 'success');
  } catch (error) {
    const message = getFriendlyErrorMessage(error, 'Massenaktion konnte nicht gespeichert werden.');
    showAppStatus(message, 'error');
  }
}
