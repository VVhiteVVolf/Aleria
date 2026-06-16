let _moduleStampSourceId = '';
let _moduleStampIdTouched = false;

function getModuleStampEntries() {
  const seen = new Set();
  return getValidSections()
    .flatMap(section => (section.entries || []).map(entry => ({ entry, section })))
    .filter(item => {
      const id = String(item.entry?.id || '').trim();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((a, b) => String(a.entry.title || a.entry.id).localeCompare(String(b.entry.title || b.entry.id), 'de'));
}

function getModuleStampSections() {
  const seen = new Set();
  return sortModuleSectionsByHierarchy(getUniqueModuleSections())
    .filter(section => {
      const signature = makeSectionSignature(section);
      if (!signature || seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
}

function getModuleStampEntryById(entryId) {
  const id = String(entryId || '').trim();
  return getModuleStampEntries().find(item => String(item.entry?.id || '') === id) || null;
}

function makeUniqueModuleStampId(title) {
  const base = slugify(title || 'modul-kopie', 'modul-kopie').slice(0, 70) || 'modul-kopie';
  const used = new Set(getModuleStampEntries().map(item => String(item.entry?.id || '').trim()).filter(Boolean));
  if (!used.has(base) && !findModuleIdConflict(base, { mode: 'new', sourceKind: 'stamp' })) return base;
  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${base}-${index}`.slice(0, 80);
    if (!used.has(candidate) && !findModuleIdConflict(candidate, { mode: 'new', sourceKind: 'stamp' })) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`.slice(0, 80);
}

function isModuleStampIdAlreadyUsed(entryId) {
  const id = String(entryId || '').trim();
  return !!id && getModuleStampEntries().some(item => String(item.entry?.id || '') === id);
}

function resetModuleStampThreadKeys(entry) {
  const next = deepClone(entry);
  (next.pages || []).forEach(page => {
    delete page.commentThreadKey;
  });
  return next;
}

function buildModuleStampEntryOptions(selectedId = '') {
  return getModuleStampEntries().map(item => {
    const id = String(item.entry?.id || '').trim();
    const label = `${item.entry?.title || id} - ${getSectionOptionLabel(item.section)}`;
    return `<option value="${escapeHtml(id)}"${id === selectedId ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');
}

function buildModuleStampSectionOptions(selectedSignature = '') {
  return getModuleStampSections().map(section => {
    const signature = makeSectionSignature(section);
    return `<option value="${escapeHtml(signature)}"${signature === selectedSignature ? ' selected' : ''}>${escapeHtml(getSectionOptionLabel(section))}</option>`;
  }).join('');
}

function getModuleStampDefaultSectionSignature() {
  const active = getModuleStampSections().find(section => (section.tab || section.key) === _activeTab);
  return makeSectionSignature(active || getModuleStampSections()[0] || getVoidModuleSection());
}

function ensureModuleStampDialog() {
  let overlay = document.getElementById('module-stamp-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'module-stamp-overlay';
  overlay.className = 'module-stamp-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'module-stamp-title');
  overlay.setAttribute('tabindex', '-1');
  overlay.innerHTML = `
    <div class="module-stamp-card">
      <div class="module-stamp-head">
        <div>
          <div class="module-stamp-kicker">Modulstempel</div>
          <h2 id="module-stamp-title">Modul kopieren und einsetzen</h2>
        </div>
        <button class="module-stamp-close" type="button" data-module-stamp-action="close" aria-label="Modulstempel schliessen">x</button>
      </div>
      <div class="module-stamp-body">
        <label>
          <span>Vorlage</span>
          <select id="module-stamp-source" data-module-stamp-action="select-source"></select>
        </label>
        <label>
          <span>Neuer Name</span>
          <input id="module-stamp-title-input" type="text" placeholder="Name der Kopie">
        </label>
        <label>
          <span>Neue Modul-ID</span>
          <input id="module-stamp-id-input" type="text" placeholder="automatisch-aus-name">
        </label>
        <label>
          <span>Zielreiter</span>
          <select id="module-stamp-section"></select>
        </label>
        <div class="module-stamp-preview" data-module-stamp-preview></div>
        <div class="module-stamp-status" data-module-stamp-status role="status"></div>
      </div>
      <div class="module-stamp-actions">
        <button type="button" data-module-stamp-action="close">Abbrechen</button>
        <button class="primary" type="button" data-module-stamp-action="create">Kopie einsetzen</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function setModuleStampStatus(message, isError = false) {
  const status = document.querySelector('[data-module-stamp-status]');
  if (!status) return;
  status.dataset.status = isError ? 'error' : 'info';
  status.textContent = String(message || '');
}

function updateModuleStampPreview() {
  const sourceId = document.getElementById('module-stamp-source')?.value || '';
  const source = getModuleStampEntryById(sourceId);
  const preview = document.querySelector('[data-module-stamp-preview]');
  if (!preview || !source) return;
  const pageCount = typeof getArchiveEntryPageCount === 'function'
    ? getArchiveEntryPageCount(source.entry)
    : (Array.isArray(source.entry?.pages) ? source.entry.pages.length : 1);
  preview.innerHTML = `
    <strong>${escapeHtml(source.entry.title || source.entry.id)}</strong>
    <span>${escapeHtml(getSectionOptionLabel(source.section))}</span>
    <small>${pageCount} Seite${pageCount === 1 ? '' : 'n'} - ${escapeHtml(source.entry.type || source.entry.category || 'Modul')}</small>`;
}

function syncModuleStampTitleFromSource(force = false) {
  const sourceId = document.getElementById('module-stamp-source')?.value || '';
  const source = getModuleStampEntryById(sourceId);
  if (!source) return;
  const titleInput = document.getElementById('module-stamp-title-input');
  const idInput = document.getElementById('module-stamp-id-input');
  if (titleInput && (force || !titleInput.value.trim())) {
    titleInput.value = `${source.entry.title || source.entry.id} Kopie`;
  }
  if (idInput && (force || !_moduleStampIdTouched || !idInput.value.trim())) {
    idInput.value = makeUniqueModuleStampId(titleInput?.value || source.entry.title || source.entry.id);
    _moduleStampIdTouched = false;
  }
  updateModuleStampPreview();
}

function openModuleStampDialog(sourceId = '') {
  ensureModuleStampDialog();
  const entries = getModuleStampEntries();
  if (!entries.length) {
    showAppStatus('Keine Module zum Kopieren gefunden.', 'error');
    return;
  }
  const selectedId = sourceId || _moduleStampSourceId || entries[0].entry.id;
  _moduleStampSourceId = selectedId;
  document.getElementById('module-stamp-source').innerHTML = buildModuleStampEntryOptions(selectedId);
  document.getElementById('module-stamp-section').innerHTML = buildModuleStampSectionOptions(getModuleStampDefaultSectionSignature());
  document.getElementById('module-stamp-title-input').value = '';
  document.getElementById('module-stamp-id-input').value = '';
  _moduleStampIdTouched = false;
  syncModuleStampTitleFromSource(true);
  setModuleStampStatus('Kopie bekommt neue ID und eigene Kommentar-Threads.');
  activateDialog('module-stamp-overlay', { initialFocus: '#module-stamp-title-input' });
}

function closeModuleStampDialog() {
  deactivateDialog('module-stamp-overlay');
  setModuleStampStatus('');
}

function collectModuleStampPayload() {
  const sourceId = document.getElementById('module-stamp-source')?.value || '';
  const source = getModuleStampEntryById(sourceId);
  if (!source) throw new Error('Bitte eine Modulvorlage auswaehlen.');

  const sectionSignature = document.getElementById('module-stamp-section')?.value || '';
  const target = getModuleStampSections().find(section => makeSectionSignature(section) === sectionSignature);
  if (!target) throw new Error('Bitte einen Zielreiter auswaehlen.');

  const title = String(document.getElementById('module-stamp-title-input')?.value || '').trim();
  if (!title) throw new Error('Bitte einen neuen Modulnamen eingeben.');

  const id = String(document.getElementById('module-stamp-id-input')?.value || '').trim() || makeUniqueModuleStampId(title);
  if (isModuleStampIdAlreadyUsed(id)) throw new Error('Diese Modul-ID existiert bereits. Bitte waehle eine neue ID.');
  const entry = sanitizeModuleEntry({
    ...resetModuleStampThreadKeys(source.entry),
    id,
    title
  });
  const section = cleanCustomSection({
    key: target.key,
    tab: target.tab || target.key,
    desc: target.desc || '',
    path: getSectionPathParts(target),
    nodeId: target.nodeId || ensureModuleNodeForSection(target),
    entries: []
  });
  return { section, entry, source };
}

function createModuleStampCopy() {
  try {
    const payload = collectModuleStampPayload();
    const validation = assertValidModulePayload(payload, { mode: 'new', sourceKind: 'stamp' });
    removeCustomModuleById(validation.entry.id);
    delete _entryOverrides[validation.entry.id];
    upsertCustomModule(validation.section, validation.entry);
    saveModuleStore();
    closeModuleStampDialog();
    refreshAfterModuleChange(validation.entry.id);
    showAppStatus(`Modul "${validation.entry.title}" wurde als eigenstaendige Kopie eingesetzt.`, 'success');
  } catch (error) {
    setModuleStampStatus(error?.message || 'Modul konnte nicht kopiert werden.', true);
  }
}

function handleModuleStampClick(event) {
  const trigger = event.target?.closest?.('[data-module-stamp-action]');
  if (!trigger || !trigger.closest('#module-stamp-overlay')) return;
  event.preventDefault();
  const action = trigger.dataset.moduleStampAction;
  if (action === 'close') {
    closeModuleStampDialog();
    return;
  }
  if (action === 'create') {
    createModuleStampCopy();
  }
}

function handleModuleStampChange(event) {
  const trigger = event.target?.closest?.('[data-module-stamp-action="select-source"]');
  if (!trigger || !trigger.closest('#module-stamp-overlay')) return;
  _moduleStampSourceId = trigger.value || '';
  syncModuleStampTitleFromSource(true);
}

function handleModuleStampInput(event) {
  const input = event.target;
  if (!input?.closest?.('#module-stamp-overlay')) return;
  if (input.id === 'module-stamp-title-input') {
    const idInput = document.getElementById('module-stamp-id-input');
    if (idInput && !_moduleStampIdTouched) idInput.value = makeUniqueModuleStampId(input.value || 'modul-kopie');
  }
  if (input.id === 'module-stamp-id-input') {
    _moduleStampIdTouched = true;
  }
}

document.addEventListener('click', handleModuleStampClick);
document.addEventListener('change', handleModuleStampChange);
document.addEventListener('input', handleModuleStampInput);
