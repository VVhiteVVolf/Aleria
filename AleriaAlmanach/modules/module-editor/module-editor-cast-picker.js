function getModuleCharacterRecordPortrait(char) {
  return String(char?.portrait || char?.emotes?.find(emote => emote?.img)?.img || '').trim();
}

function getModuleCharacterRecordImageSet(char) {
  const images = new Set();
  const primary = getModuleCharacterRecordPortrait(char);
  if (primary) images.add(primary);
  (char?.emotes || []).forEach(emote => {
    const src = String(emote?.img || '').trim();
    if (src) images.add(src);
  });
  return images;
}

function findModuleEditorCharacterMatch(candidate = {}) {
  const chars = getAllCharacterRecords();
  const id = String(candidate.id || '').trim();
  const name = normalizeSearchText(candidate.name || '');
  const avatar = String(candidate.avatar || '').trim();

  if (id) {
    const byId = chars.find(char => String(char.id || '').trim() === id);
    if (byId) return byId;
  }
  if (name) {
    const byName = chars.find(char => normalizeSearchText(char.name || '') === name);
    if (byName) return byName;
  }
  if (avatar) {
    const byAvatar = chars.find(char => getModuleCharacterRecordImageSet(char).has(avatar));
    if (byAvatar) return byAvatar;
  }
  return null;
}

function buildModuleCharacterOptions(selectedId = '', blankLabel = '— Keine Vorlage —') {
  const selected = String(selectedId || '').trim();
  const options = [`<option value="">${escapeHtml(blankLabel)}</option>`];
  getAllCharacterRecords().forEach(char => {
    const id = String(char.id || '').trim();
    if (!id) return;
    const label = char.title ? `${char.name} — ${char.title}` : char.name;
    options.push(`<option value="${escapeHtml(id)}"${id === selected ? ' selected' : ''}>${escapeHtml(label)}</option>`);
  });
  return options.join('');
}

function parseModuleCastIds(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function sanitizeModuleCastDetails(details, fallbackIds = []) {
  const source = Array.isArray(details) && details.length
    ? details
    : (fallbackIds || []).map(id => ({ id }));
  const seen = new Set();
  return source
    .map(item => {
      const id = String(typeof item === 'string' ? item : item?.id || '').trim();
      if (!id || seen.has(id)) return null;
      seen.add(id);
      return {
        schemaVersion: Number(item?.schemaVersion) || MODULE_CAST_SCHEMA_VERSION,
        id,
        role: String(typeof item === 'object' ? item?.role || '' : '').trim()
      };
    })
    .filter(Boolean);
}

function getModuleCastIdsFromSource(source) {
  const ids = Array.isArray(source?.sessionCast) ? source.sessionCast.map(item => String(item || '').trim()).filter(Boolean) : [];
  if (ids.length) return ids;
  return sanitizeModuleCastDetails(source?.sessionCastDetails).map(item => item.id);
}

function getModuleCastDetailsFromSource(source) {
  return sanitizeModuleCastDetails(source?.sessionCastDetails, getModuleCastIdsFromSource(source));
}

function buildModuleCharacterChecklist(selectedIds = [], selectedDetails = []) {
  const details = sanitizeModuleCastDetails(selectedDetails, selectedIds);
  const orderedIds = details.length
    ? details.map(item => item.id)
    : (selectedIds || []).map(id => String(id || '').trim()).filter(Boolean);
  const selected = new Set(orderedIds);
  const roleById = new Map(details.map(item => [item.id, item.role || '']));
  const chars = getAllCharacterRecords();
  if (!chars.length) {
    return `<div class="module-editor-help">Noch keine Figuren verfügbar.</div>`;
  }
  const byId = new Map(chars.map(char => [String(char.id || '').trim(), char]));
  const list = chars.map(char => {
    const id = String(char.id || '').trim();
    const safeName = escapeHtml(char.name || 'Unbekannt');
    const safeRole = escapeHtml(char.title || '');
    const portrait = sanitizeImageSrc(getModuleCharacterRecordPortrait(char));
    return `
      <button class="module-character-pill${selected.has(id) ? ' selected' : ''}" type="button" data-module-editor-action="toggle-cast-option" data-char-id="${escapeHtml(id)}" data-char-name="${safeName}">
        ${portrait
          ? `<img class="module-character-pill-avatar" src="${portrait}" alt="${safeName}" loading="lazy" decoding="async">`
          : `<div class="module-character-pill-avatar-ph">${escapeHtml(getInitialChar(char.name))}</div>`}
        <span class="module-character-pill-text">
          <span class="module-character-pill-name">${safeName}</span>
          <span class="module-character-pill-role">${safeRole}</span>
        </span>
      </button>`;
  }).join('');
  const selectedMarkup = orderedIds
    .map(id => byId.get(id))
    .filter(Boolean)
    .map(char => {
      const id = String(char.id || '').trim();
      const safeName = escapeHtml(char.name || 'Unbekannt');
      const safeRole = escapeHtml(roleById.get(id) || '');
      const safePlaceholder = escapeHtml(char.title || 'Rolle im Modul');
      return `<span class="module-character-chip" data-char-id="${escapeHtml(id)}">
        <span class="module-character-chip-name">${safeName}</span>
        <input class="module-character-role-input" type="text" value="${safeRole}" placeholder="${safePlaceholder}" data-module-editor-action="sync-json-preview" aria-label="Rolle für ${safeName}">
        <button type="button" data-module-editor-action="move-cast-chip" data-cast-direction="-1" aria-label="${safeName} nach oben">↑</button>
        <button type="button" data-module-editor-action="move-cast-chip" data-cast-direction="1" aria-label="${safeName} nach unten">↓</button>
        <button type="button" data-module-editor-action="remove-cast-chip" aria-label="${safeName} entfernen">×</button>
      </span>`;
    }).join('');
  return `
    <div class="module-character-browser-top">
      <input class="module-character-search" type="text" placeholder="Figur filtern..." autocomplete="off" data-module-editor-action="filter-cast-picker">
      <div class="module-character-selected">
        ${selectedMarkup || '<span class="module-character-selected-empty">Noch keine Figuren ausgewählt.</span>'}
      </div>
    </div>
    <div class="module-character-list">
      ${list || '<div class="module-character-list-empty">Keine Figuren gefunden.</div>'}
    </div>`;
}

function renderModuleCastFieldPicker(field, selectedIds = []) {
  const wrap = field?.querySelector('.module-character-checklist');
  if (!wrap) return;
  wrap.innerHTML = buildModuleCharacterChecklist(selectedIds, collectModuleCastDetailsFromField(field, selectedIds));
}

function renderModuleGlobalCastPicker(selectedIds = [], selectedDetails = []) {
  const field = document.getElementById('me-session-cast-global')?.closest('.me-cast-field');
  if (!field) return;
  const wrap = field.querySelector('.module-character-checklist');
  if (wrap) wrap.innerHTML = buildModuleCharacterChecklist(selectedIds, selectedDetails);
}

function syncModuleCastPickerFromInput(input) {
  const field = input?.closest('.me-cast-field') || input?.closest('.module-editor-field');
  if (!field) return;
  const orderedIds = parseModuleCastIds(input.value);
  const selected = new Set(orderedIds);
  field.querySelectorAll('.module-character-pill[data-char-id]').forEach(button => {
    button.classList.toggle('selected', selected.has(button.dataset.charId || ''));
  });
  const chipsWrap = field.querySelector('.module-character-selected');
  if (chipsWrap) {
    const details = collectModuleCastDetailsFromField(field, orderedIds);
    const roleById = new Map(details.map(item => [item.id, item.role || '']));
    const byId = new Map(getAllCharacterRecords().map(char => [String(char.id || '').trim(), char]));
    const selectedChars = orderedIds.map(id => byId.get(id)).filter(Boolean);
    chipsWrap.innerHTML = selectedChars.length
      ? selectedChars.map(char => {
          const id = String(char.id || '').trim();
          const safeName = escapeHtml(char.name || 'Unbekannt');
          const safeRole = escapeHtml(roleById.get(id) || '');
          const safePlaceholder = escapeHtml(char.title || 'Rolle im Modul');
          return `<span class="module-character-chip" data-char-id="${escapeHtml(id)}">
            <span class="module-character-chip-name">${safeName}</span>
            <input class="module-character-role-input" type="text" value="${safeRole}" placeholder="${safePlaceholder}" data-module-editor-action="sync-json-preview" aria-label="Rolle für ${safeName}">
            <button type="button" data-module-editor-action="move-cast-chip" data-cast-direction="-1" aria-label="${safeName} nach oben">↑</button>
            <button type="button" data-module-editor-action="move-cast-chip" data-cast-direction="1" aria-label="${safeName} nach unten">↓</button>
            <button type="button" data-module-editor-action="remove-cast-chip" aria-label="${safeName} entfernen">×</button>
          </span>`;
        }).join('')
      : '<span class="module-character-selected-empty">Noch keine Figuren ausgewählt.</span>';
  }
}

function syncModuleCastInputFromPicker(element) {
  const field = element?.closest('.me-cast-field') || element?.closest('.module-editor-field');
  if (!field) return;
  const input = field.querySelector('.me-cast-input');
  if (!input) return;
  const ids = [];
  const seen = new Set();
  field.querySelectorAll('.module-character-chip[data-char-id]').forEach(chip => {
    const id = String(chip.dataset.charId || '').trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  });
  field.querySelectorAll('.module-character-pill.selected[data-char-id]').forEach(button => {
    const id = String(button.dataset.charId || '').trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  });
  input.value = ids.join(', ');
  syncModuleCastPickerFromInput(input);
}

function toggleModuleCastPickerOption(button) {
  if (!button) return;
  const wasSelected = button.classList.contains('selected');
  button.classList.toggle('selected');
  if (wasSelected) {
    const field = button.closest('.me-cast-field') || button.closest('.module-editor-field');
    field?.querySelectorAll('.module-character-chip[data-char-id]').forEach(chip => {
      if ((chip.dataset.charId || '') === (button.dataset.charId || '')) chip.remove();
    });
  }
  syncModuleCastInputFromPicker(button);
  syncModuleJsonPreview();
}

function removeModuleCastChip(button) {
  const chip = button?.closest('.module-character-chip');
  const field = button?.closest('.me-cast-field') || button?.closest('.module-editor-field');
  if (!chip || !field) return;
  const id = String(chip.dataset.charId || '').trim();
  if (!id) return;
  field.querySelectorAll('.module-character-pill[data-char-id]').forEach(option => {
    if ((option.dataset.charId || '') !== id) return;
    option.classList.remove('selected');
  });
  chip.remove();
  syncModuleCastInputFromPicker(field);
  syncModuleJsonPreview();
}

function moveModuleCastChip(button, direction) {
  const chip = button?.closest('.module-character-chip');
  const wrap = chip?.parentElement;
  if (!chip || !wrap) return;
  if (direction < 0 && chip.previousElementSibling?.classList.contains('module-character-chip')) {
    wrap.insertBefore(chip, chip.previousElementSibling);
  } else if (direction > 0 && chip.nextElementSibling?.classList.contains('module-character-chip')) {
    wrap.insertBefore(chip.nextElementSibling, chip);
  }
  syncModuleCastInputFromPicker(chip);
  syncModuleJsonPreview();
}

function collectModuleCastDetailsFromField(field, fallbackIds = []) {
  const wrap = field?.querySelector('.module-character-selected');
  const ids = [];
  if (wrap) {
    wrap.querySelectorAll('.module-character-chip[data-char-id]').forEach(chip => {
      const id = String(chip.dataset.charId || '').trim();
      if (!id || ids.includes(id)) return;
      ids.push(id);
    });
  }
  if (!ids.length) ids.push(...(fallbackIds || []).map(id => String(id || '').trim()).filter(Boolean));
  return ids.map(id => {
    const chip = Array.from(wrap?.querySelectorAll('.module-character-chip[data-char-id]') || [])
      .find(item => String(item.dataset.charId || '') === id);
    return {
      id,
      role: chip?.querySelector('.module-character-role-input')?.value.trim() || ''
    };
  });
}

function filterModuleCastPicker(input) {
  const field = input?.closest('.me-cast-field') || input?.closest('.module-editor-field');
  if (!field) return;
  const needle = normalizeSearchText(input.value || '');
  let visible = 0;
  field.querySelectorAll('.module-character-pill[data-char-id]').forEach(button => {
    const haystack = normalizeSearchText(`${button.dataset.charName || ''} ${button.textContent || ''}`);
    const show = !needle || haystack.includes(needle);
    button.hidden = !show;
    if (show) visible += 1;
  });
  const list = field.querySelector('.module-character-list');
  if (!list) return;
  let empty = list.querySelector('.module-character-list-empty');
  if (!visible) {
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'module-character-list-empty';
      empty.textContent = 'Keine Figuren für diesen Filter gefunden.';
      list.appendChild(empty);
    }
  } else if (empty) {
    empty.remove();
  }
}

function refreshAllModuleCastPickers() {
  document.querySelectorAll('.me-cast-field').forEach(field => {
    const input = field.querySelector('.me-cast-input');
    if (!input) return;
    renderModuleCastFieldPicker(field, parseModuleCastIds(input.value));
  });
}
