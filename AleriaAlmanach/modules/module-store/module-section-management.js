let _moduleSectionEditorSignature = '';
let _moduleSectionEditorMode = 'edit';
let _moduleSectionCreateMode = 'child';
let _collapsedModuleSectionNodeIds = new Set();
let _selectedModuleSectionManagerIds = new Set();

function getUniqueModuleSections() {
  const seen = new Set();
  const sections = [];
  getValidSections().forEach(section => {
    const clean = cleanCustomSection({ ...section, entries: [] });
    const signature = makeSectionSignature(clean);
    if (!signature || seen.has(signature)) return;
    seen.add(signature);
    sections.push(clean);
  });
  return sections;
}

function buildModuleSectionTargetOptions(selectedSignature = '') {
  return sortModuleSectionsByHierarchy(getUniqueModuleSections()).map(section => {
    const signature = makeSectionSignature(section);
    const label = getSectionOptionLabel(section);
    return `<option value="${escapeHtml(signature)}"${signature === selectedSignature ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');
}

function getVoidModuleSection() {
  const section = cleanCustomSection({
    key: 'Geloeste Module',
    tab: 'Void',
    path: ['Geloeste Module'],
    desc: 'Sicherer Auffangbereich fuer geloeste Reiter und unzugeordnete Module.',
    entries: []
  });
  section.nodeId = ensureModuleNodeForSection(section);
  return cleanCustomSection(section);
}

function ensureCustomModuleSection(sectionInput, options = {}) {
  const nodeId = sectionInput?.nodeId || ensureModuleNodeForSection(sectionInput);
  const section = cleanCustomSection({ ...(sectionInput || {}), nodeId, entries: [] });
  const signature = makeSectionSignature(section);
  let existing = _customSections.find(item => makeSectionSignature(item) === signature);
  if (!existing) {
    existing = section;
    _customSections.push(existing);
    return { section: existing, created: true };
  }
  existing.key = section.key;
  existing.tab = section.tab;
  existing.path = getSectionPathParts(section);
  existing.nodeId = section.nodeId;
  existing.iconUrl = section.iconUrl || existing.iconUrl || '';
  if (options.updateDesc || !String(existing.desc || '').trim()) existing.desc = section.desc || existing.desc || '';
  return { section: existing, created: false };
}

function ensureModuleSectionPath(sectionInput, options = {}) {
  const section = cleanCustomSection({ ...(sectionInput || {}), entries: [] });
  const path = getSectionPathParts(section);
  let created = false;
  if (path.length) {
    path.forEach((_, index) => {
      const prefix = path.slice(0, index + 1);
      const result = ensureCustomModuleSection({
        key: prefix[prefix.length - 1],
        tab: section.tab,
        path: prefix,
        desc: index === path.length - 1 ? section.desc : '',
        iconUrl: index === path.length - 1 ? section.iconUrl : ''
      }, { updateDesc: options.updateDesc && index === path.length - 1 });
      created = created || result.created;
    });
    return { section: cleanCustomSection({ ...section, key: path[path.length - 1] }), created };
  }
  const result = ensureCustomModuleSection(section, options);
  return { section: result.section, created: result.created };
}

function ensureKnownSectionHierarchy() {
  let changed = false;
  getUniqueModuleSections().forEach(section => {
    const path = getSectionPathParts(section);
    if (path.length <= 1) return;
    const result = ensureModuleSectionPath(section);
    changed = changed || result.created;
  });
  return changed;
}

function removeCustomSectionBySignature(signature) {
  const before = _customSections.length;
  _customSections = _customSections.filter(section => makeSectionSignature(section) !== signature);
  return _customSections.length !== before;
}

function isSectionDescendantOrSelf(section, targetSection) {
  if (!section || !targetSection) return false;
  if (section.nodeId && targetSection.nodeId && typeof getModuleSectionNodeDescendantIds === 'function') {
    return getModuleSectionNodeDescendantIds(targetSection.nodeId).has(section.nodeId);
  }
  if ((section.tab || section.key) !== (targetSection.tab || targetSection.key)) return false;
  const targetPath = getSectionPathParts(targetSection);
  const sectionPath = getSectionPathParts(section);
  if (!targetPath.length || !sectionPath.length) {
    return makeSectionSignature(section) === makeSectionSignature(targetSection);
  }
  if (sectionPath.length < targetPath.length) return false;
  return targetPath.every((part, index) => normalizeSearchText(sectionPath[index]) === normalizeSearchText(part));
}

function sortModuleSectionsByHierarchy(sections = []) {
  return [...sections].sort((a, b) => {
    const tabCompare = String(a.tab || a.key || '').localeCompare(String(b.tab || b.key || ''), 'de');
    if (tabCompare) return tabCompare;
    const pathCompare = getSectionPathParts(a).join(' > ').localeCompare(getSectionPathParts(b).join(' > '), 'de');
    if (pathCompare) return pathCompare;
    return getSectionOptionLabel(a).localeCompare(getSectionOptionLabel(b), 'de');
  });
}

function canMoveModuleSectionToParent(section, parentSection) {
  if (!section?.nodeId || !parentSection?.nodeId) return false;
  if (makeSectionSignature(section) === makeSectionSignature(parentSection)) return false;
  if ((section.tab || section.key) !== (parentSection.tab || parentSection.key)) return false;
  return !getModuleSectionNodeDescendantIds(section.nodeId).has(parentSection.nodeId);
}

function buildModuleSectionParentOptions(section, sections = []) {
  if (!section?.nodeId) return '';
  const node = findModuleSectionNodeById(section.nodeId);
  const currentParentId = String(node?.parentId || '');
  const rootId = getModuleRootNodeId(section.tab || section.key);
  const rootSelected = currentParentId === rootId ? ' selected' : '';
  const options = [`<option value="">Verschieben...</option>`];
  if (node?.parentId) {
    options.push(`<option value="__root__"${rootSelected}>An Hauptreiter haengen</option>`);
  }
  sortModuleSectionsByHierarchy(sections)
    .filter(candidate => canMoveModuleSectionToParent(section, candidate))
    .forEach(candidate => {
      const signature = makeSectionSignature(candidate);
      const selected = currentParentId && currentParentId === candidate.nodeId ? ' selected' : '';
      options.push(`<option value="${escapeHtml(signature)}"${selected}>Unter: ${escapeHtml(getSectionOptionLabel(candidate))}</option>`);
    });
  return options.join('');
}

function getModuleSectionManagerEntries() {
  const seen = new Set();
  const entries = [];
  getValidSections().forEach(section => {
    const sectionSignature = makeSectionSignature(section);
    (section.entries || []).forEach(entry => {
      const id = String(entry?.id || '').trim();
      if (!id || seen.has(id)) return;
      seen.add(id);
      entries.push({
        entry,
        section,
        sectionSignature,
      });
    });
  });
  return entries.sort((a, b) => {
    const sectionCompare = getSectionOptionLabel(a.section).localeCompare(getSectionOptionLabel(b.section), 'de');
    if (sectionCompare) return sectionCompare;
    return String(a.entry?.title || '').localeCompare(String(b.entry?.title || ''), 'de');
  });
}



function normalizeModuleSectionCreateMode(mode) {
  return mode === 'root' ? 'root' : 'child';
}

function setModuleSectionCreateMode(mode, options = {}) {
  _moduleSectionCreateMode = normalizeModuleSectionCreateMode(mode);
  const overlay = document.getElementById('module-section-manager-overlay');
  const tab = document.getElementById('msm-tab');
  const path = document.getElementById('msm-path');
  const tabLabel = tab?.closest('label')?.querySelector('span');
  const pathRow = path?.closest('label');
  document.querySelectorAll('input[name="msm-create-mode"]').forEach(input => {
    input.checked = input.value === _moduleSectionCreateMode;
  });
  if (overlay) overlay.dataset.createMode = _moduleSectionCreateMode;
  if (tabLabel) tabLabel.textContent = _moduleSectionCreateMode === 'root' ? 'Name des Hauptreiters' : 'Hauptreiter';
  if (tab) tab.placeholder = _moduleSectionCreateMode === 'root' ? 'z.B. Sport' : 'z.B. Voelker & Kulturen';
  if (pathRow) pathRow.hidden = _moduleSectionCreateMode === 'root';
  if (path) {
    path.disabled = _moduleSectionCreateMode === 'root';
    if (_moduleSectionCreateMode === 'root' && options.clearPath !== false) path.value = '';
  }
}

function setModuleSectionManagerStatus(message, type = 'info') {
  const status = document.getElementById('module-section-manager-status');
  if (!status) return;
  status.dataset.status = type;
  status.textContent = message || '';
}

function clearModuleSectionManagerForm(options = {}) {
  const nextMode = normalizeModuleSectionCreateMode(options.mode || _moduleSectionCreateMode);
  const defaultTab = nextMode === 'child' && _activeTab && _activeTab !== 'Alle' && _activeTab !== 'Charaktere' ? _activeTab : '';
  const tab = document.getElementById('msm-tab');
  const path = document.getElementById('msm-path');
  const desc = document.getElementById('msm-desc');
  const icon = document.getElementById('msm-icon');
  if (tab) tab.value = defaultTab;
  if (path) path.value = '';
  if (desc) desc.value = '';
  if (icon) icon.value = '';
  setModuleSectionCreateMode(nextMode);
  setModuleSectionManagerStatus('');
}

function getModuleSectionEditorElements() {
  return {
    panel: document.querySelector('[data-section-editor-panel]'),
    summary: document.querySelector('[data-section-editor-summary]'),
    title: document.getElementById('msm-edit-title'),
    desc: document.getElementById('msm-edit-desc'),
    icon: document.getElementById('msm-edit-icon'),
    childTitle: document.getElementById('msm-edit-child-title'),
    parent: document.getElementById('msm-edit-parent'),
  };
}

function getModuleSectionEditorSection() {
  return _moduleSectionEditorSignature ? findSectionBySignature(_moduleSectionEditorSignature) : null;
}

function closeModuleSectionEditor() {
  _moduleSectionEditorSignature = '';
  _moduleSectionEditorMode = 'edit';
  const { panel } = getModuleSectionEditorElements();
  if (panel) panel.hidden = true;
  if (moduleSectionManagerView.isEditing()) moduleSectionManagerView.showPanel('');
  renderModuleSectionManagerSections(sortModuleSectionsByHierarchy(getUniqueModuleSections()));
}

function renderModuleSectionEditor() {
  const { panel, summary, title, desc, icon, childTitle, parent } = getModuleSectionEditorElements();
  if (!panel || !moduleSectionManagerView.isEditing()) return;

  const section = getModuleSectionEditorSection();
  if (!section) {
    panel.hidden = true;
    return;
  }

  const sections = sortModuleSectionsByHierarchy(getUniqueModuleSections());
  const signature = makeSectionSignature(section);
  const entryCount = findSectionBySignature(signature)?.entries?.length || 0;
  const isVoid = section.nodeId === getModulePathNodeId('Void', ['Geloeste Module']);
  const node = section.nodeId ? findModuleSectionNodeById(section.nodeId) : null;
  const isRootNode = section.nodeId && !String(node?.parentId || '').trim();

  panel.hidden = false;
  panel.dataset.mode = _moduleSectionEditorMode;
  if (summary) {
    summary.innerHTML = `
      <strong>${escapeHtml(getSectionLeafLabel(section))}</strong>
      <span>${escapeHtml(getSectionOptionLabel(section))}</span>
      <em>${entryCount} Module</em>
    `;
  }
  if (title) {
    title.value = getSectionLeafLabel(section);
    title.disabled = isVoid;
  }
  if (desc) {
    desc.value = section.desc || node?.desc || '';
    desc.disabled = isVoid;
  }
  if (icon) {
    icon.value = section.iconUrl || node?.iconUrl || '';
    icon.disabled = isVoid;
  }
  if (childTitle) {
    if (_moduleSectionEditorMode === 'child') childTitle.value = '';
    childTitle.placeholder = `Unter ${getSectionLeafLabel(section)} anlegen`;
  }
  if (parent) {
    parent.innerHTML = buildModuleSectionParentOptions(section, sections);
    parent.disabled = Boolean(isVoid || !section.nodeId || isRootNode);
  }
  const moveButton = panel.querySelector('[data-section-manager-action="apply-section-parent"]');
  if (moveButton) moveButton.disabled = Boolean(parent?.disabled);

  const releaseButton = panel.querySelector('[data-section-manager-action="release-section-editor"]');
  if (releaseButton) releaseButton.disabled = isVoid;
}

function openModuleSectionEditor(signature, options = {}) {
  const section = findSectionBySignature(signature);
  if (!section) {
    setModuleSectionManagerStatus('Reiter wurde nicht gefunden.', 'error');
    return;
  }
  _moduleSectionEditorSignature = makeSectionSignature(section);
  _moduleSectionEditorMode = options.mode === 'child' ? 'child' : 'edit';
  moduleSectionManagerView.showPanel('edit');
  renderModuleSectionManagerSections(sortModuleSectionsByHierarchy(getUniqueModuleSections()));
  renderModuleSectionEditor();
  const focusTarget = _moduleSectionEditorMode === 'child'
    ? document.getElementById('msm-edit-child-title')
    : document.getElementById('msm-edit-title');
  focusTarget?.focus();
  setModuleSectionManagerStatus(
    _moduleSectionEditorMode === 'child'
      ? `Unterreiter fuer "${getSectionLeafLabel(section)}" vorbereiten.`
      : `"${getSectionLeafLabel(section)}" wird bearbeitet.`,
    'info'
  );
}

function renderModuleSectionManagerTabs(sections) {
  const datalist = document.getElementById('msm-tab-options');
  if (!datalist) return;
  const tabs = [...new Set(sections.map(section => section.tab || section.key).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'de'));
  datalist.innerHTML = tabs.map(tab => `<option value="${escapeHtml(tab)}"></option>`).join('');
}

function getModuleSectionParentNodeIds(sections = []) {
  const parentIds = new Set();
  sections.forEach(section => {
    if (!section.nodeId) return;
    const node = findModuleSectionNodeById(section.nodeId);
    if (node?.parentId) parentIds.add(node.parentId);
  });
  return parentIds;
}

function isModuleSectionNodeCollapsed(nodeId) {
  return _collapsedModuleSectionNodeIds.has(String(nodeId || '').trim());
}

function toggleModuleSectionNodeCollapsed(nodeId) {
  const id = String(nodeId || '').trim();
  if (!id) return;
  if (_collapsedModuleSectionNodeIds.has(id)) _collapsedModuleSectionNodeIds.delete(id);
  else _collapsedModuleSectionNodeIds.add(id);
  renderModuleSectionManagerSections(sortModuleSectionsByHierarchy(getUniqueModuleSections()));
}

function setAllModuleSectionsCollapsed(collapsed) {
  const sections = sortModuleSectionsByHierarchy(getUniqueModuleSections());
  _collapsedModuleSectionNodeIds = collapsed ? new Set(getModuleSectionParentNodeIds(sections)) : new Set();
  renderModuleSectionManagerSections(sections);
}

function renderModuleSectionManagerSections(sections) {
  moduleSectionManagerView.renderSections(sections);
}

function getDefaultModuleImportTargetSignature(sections) {
  const current = typeof currentEntry !== 'undefined' && currentEntry?.id
    ? findCurrentSectionByEntryId(currentEntry.id)?.section
    : null;
  if (current) return makeSectionSignature(current);
  const activeSection = sections.find(section => (section.tab || section.key) === _activeTab);
  if (activeSection) return makeSectionSignature(activeSection);
  return sections[0] ? makeSectionSignature(sections[0]) : '';
}

function renderModuleSectionManagerImportTarget(sections) {
  const select = document.getElementById('msm-import-target');
  if (!select) return;
  const previous = select.value;
  const hasPrevious = previous && sections.some(section => makeSectionSignature(section) === previous);
  const selected = hasPrevious ? previous : getDefaultModuleImportTargetSignature(sections);
  select.innerHTML = buildModuleSectionTargetOptions(selected);
  if (selected) select.value = selected;
}

function getVisibleModuleSectionManagerEntries(entries, filterValue = '') {
  return moduleSectionManagerView.visibleEntries(entries, filterValue);
}

function pruneModuleSectionManagerSelection(entries) {
  const validIds = new Set(entries.map(item => String(item.entry?.id || '')).filter(Boolean));
  Array.from(_selectedModuleSectionManagerIds).forEach(id => {
    if (!validIds.has(id)) _selectedModuleSectionManagerIds.delete(id);
  });
}

function renderModuleSectionManagerBulkBar(visibleEntries) {
  moduleSectionManagerView.renderBulkBar(visibleEntries);
}

function renderModuleSectionManagerModules(entries, filterValue = '') {
  moduleSectionManagerView.renderModules(entries, filterValue);
}

function bulkMoveModuleSectionManagerSelection() {
  const targetSignature = document.getElementById('msm-module-bulk-target')?.value || '';
  const ids = Array.from(_selectedModuleSectionManagerIds);
  if (!ids.length) {
    setModuleSectionManagerStatus('Keine Module ausgewählt.', 'error');
    return;
  }
  if (!targetSignature) {
    setModuleSectionManagerStatus('Bitte einen Zielbereich wählen.', 'error');
    return;
  }
  let movedCount = 0;
  ids.forEach(id => {
    if (moveModuleToSection(id, targetSignature, { silent: true, deferSave: true, deferRender: true })) movedCount++;
  });
  _selectedModuleSectionManagerIds.clear();
  saveModuleStore();
  renderAll();
  renderModuleSectionManager();
  setModuleSectionManagerStatus(
    movedCount ? `${movedCount} ${movedCount === 1 ? 'Modul' : 'Module'} verschoben.` : 'Keine Module wurden verschoben.',
    movedCount ? 'success' : 'info'
  );
}

function bulkDeleteModuleSectionManagerSelection() {
  const ids = Array.from(_selectedModuleSectionManagerIds);
  if (!ids.length) {
    setModuleSectionManagerStatus('Keine Module ausgewählt.', 'error');
    return;
  }
  const code = prompt(`${ids.length} Module wirklich löschen/ausblenden?\n\nGib zur Bestätigung den Code ${MODULE_DELETE_CONFIRM_CODE} ein.`);
  if (code === null) return;
  if (String(code || '').trim() !== MODULE_DELETE_CONFIRM_CODE) {
    setModuleSectionManagerStatus('Falscher Löschcode. Es wurde nichts gelöscht.', 'error');
    return;
  }
  let deletedCount = 0;
  ids.forEach(id => {
    if (deleteModuleById(id, { requireCode: false, deferSave: true }).ok) deletedCount++;
  });
  _selectedModuleSectionManagerIds.clear();
  saveModuleStore();
  renderAll();
  renderModuleSectionManager();
  setModuleSectionManagerStatus(
    deletedCount ? `${deletedCount} Module gelöscht.` : 'Keine Module wurden gelöscht.',
    deletedCount ? 'success' : 'info'
  );
}

function renderModuleSectionManager() {
  ensureModuleSectionManagerDialog();
  const sections = sortModuleSectionsByHierarchy(getUniqueModuleSections());
  const entries = getModuleSectionManagerEntries();
  const filter = document.getElementById('msm-module-filter')?.value || '';
  moduleSectionManagerView.refresh(sections, entries);
  renderModuleSectionManagerTabs(sections);
  renderModuleSectionManagerSections(sections);
  renderModuleSectionManagerImportTarget(sections);
  renderModuleSectionManagerModules(entries, filter);
  renderModuleSectionEditor();
}

function openModuleSectionManager(options = {}) {
  ensureModuleSectionManagerDialog();
  if (ensureKnownSectionHierarchy()) {
    saveModuleStore();
    renderAll();
  }
  closeModuleSectionEditor();
  moduleSectionManagerView.reset();
  const createMode = normalizeModuleSectionCreateMode(options.createMode || _moduleSectionCreateMode);
  setModuleSectionCreateMode(createMode);
  _selectedModuleSectionManagerIds.clear();
  const sectionFilter = document.getElementById('msm-section-filter');
  if (sectionFilter) sectionFilter.value = '';
  renderModuleSectionManager();
  clearModuleSectionManagerForm({ mode: createMode });
  activateDialog('module-section-manager-overlay', { initialFocus: options.createMode ? '#msm-tab' : '#msm-module-filter' });
  if (options.createMode) moduleSectionManagerView.showPanel('create', '#msm-tab');
}

function closeModuleSectionManager() {
  _moduleSectionEditorSignature = '';
  _moduleSectionEditorMode = 'edit';
  deactivateDialog('module-section-manager-overlay');
}

function prefillModuleSectionManagerForm(signature) {
  const section = findSectionBySignature(signature);
  if (!section) return;
  const tab = document.getElementById('msm-tab');
  const path = document.getElementById('msm-path');
  const desc = document.getElementById('msm-desc');
  const icon = document.getElementById('msm-icon');
  if (tab) tab.value = section.tab || section.key || '';
  if (path) path.value = getSectionPathLabel(section) || section.key || '';
  if (desc) desc.value = section.desc || '';
  if (icon) icon.value = section.iconUrl || '';
  setModuleSectionCreateMode(getSectionPathParts(section).length ? 'child' : 'root', { clearPath: false });
  setModuleSectionManagerStatus('Bereich als Vorlage übernommen.', 'info');
}

function prefillModuleSectionManagerChildForm(signature) {
  const section = findSectionBySignature(signature);
  if (!section) return;
  const tab = document.getElementById('msm-tab');
  const path = document.getElementById('msm-path');
  const desc = document.getElementById('msm-desc');
  const basePath = getSectionPathParts(section);
  const nextPath = [...(basePath.length ? basePath : [section.key || section.tab].filter(Boolean)), 'Neuer Bereich'];
  if (tab) tab.value = section.tab || section.key || '';
  if (path) {
    path.value = nextPath.join(' > ');
    path.focus();
    const start = Math.max(0, path.value.length - 'Neuer Bereich'.length);
    path.setSelectionRange(start, path.value.length);
  }
  if (desc) desc.value = '';
  setModuleSectionCreateMode('child', { clearPath: false });
  setModuleSectionManagerStatus('Kindbereich vorbereitet. Namen im Pfad ersetzen und speichern.', 'info');
}

function syncModuleSectionNodeEdits(nodeId, patch = {}) {
  const id = String(nodeId || '').trim();
  if (!id) return;
  const applyPatchToSection = section => {
    if (!section || String(section.nodeId || '') !== id) return section;
    const next = { ...section };
    if (typeof patch.title === 'string') next.key = patch.title;
    if (typeof patch.desc === 'string') next.desc = patch.desc;
    if (typeof patch.iconUrl === 'string') next.iconUrl = patch.iconUrl;
    return cleanCustomSection(next);
  };

  _customSections = _customSections.map(applyPatchToSection);
  if (Array.isArray(SECTIONS)) {
    SECTIONS.forEach((section, index) => {
      if (String(section?.nodeId || '') === id) {
        SECTIONS[index] = { ...section };
        if (typeof patch.title === 'string') SECTIONS[index].key = patch.title;
        if (typeof patch.desc === 'string') SECTIONS[index].desc = patch.desc;
        if (typeof patch.iconUrl === 'string') SECTIONS[index].iconUrl = patch.iconUrl;
      }
    });
  }
  Object.entries(_moduleSectionMoves || {}).forEach(([entryId, section]) => {
    _moduleSectionMoves[entryId] = applyPatchToSection(section);
  });
}

function saveModuleSectionEditor() {
  const section = getModuleSectionEditorSection();
  if (!section) {
    setModuleSectionManagerStatus('Kein Reiter ausgewaehlt.', 'error');
    return false;
  }

  const title = String(document.getElementById('msm-edit-title')?.value || '').trim();
  const desc = String(document.getElementById('msm-edit-desc')?.value || '').trim();
  const iconUrl = String(document.getElementById('msm-edit-icon')?.value || '').trim();
  if (!title) {
    setModuleSectionManagerStatus('Bitte einen Reiternamen eingeben.', 'error');
    document.getElementById('msm-edit-title')?.focus();
    return false;
  }

  const nodeId = section.nodeId || ensureModuleNodeForSection(section);
  const node = findModuleSectionNodeById(nodeId);
  if (node) {
    _moduleSectionNodes = _moduleSectionNodes.map(item =>
      item.id === nodeId ? cleanModuleSectionNode({ ...item, title, desc, iconUrl }) : item
    );
  }
  syncModuleSectionNodeEdits(nodeId, { title, desc, iconUrl });

  saveModuleStore();
  _activeTab = section.tab || section.key;
  renderAll();
  _moduleSectionEditorSignature = `node::${nodeId}`;
  _moduleSectionEditorMode = 'edit';
  renderModuleSectionManager();
  setModuleSectionManagerStatus(`Reiter "${title}" gespeichert.`, 'success');
  return true;
}

function createChildModuleSectionUnderParent(parent, name) {
  const childName = String(name || '').trim();
  if (!parent || !childName) return null;
  const parentNodeId = parent.nodeId || ensureModuleNodeForSection(parent);
  const parentPath = getSectionPathParts(parent);
  const childPath = [...parentPath, childName];
  const section = cleanCustomSection({
    key: childName,
    tab: parent.tab || parent.key,
    path: childPath,
    desc: '',
    iconUrl: '',
    entries: []
  });
  const nodeId = ensureModuleNodeForSection({
    ...section,
    nodeId: getModulePathNodeId(section.tab || section.key, childPath)
  }, { parentId: parentNodeId });
  return ensureCustomModuleSection({ ...section, nodeId });
}

function createChildModuleSectionFromEditor() {
  const parent = getModuleSectionEditorSection();
  if (!parent) {
    setModuleSectionManagerStatus('Kein Ausgangsreiter ausgewaehlt.', 'error');
    return;
  }
  const childInput = document.getElementById('msm-edit-child-title');
  const name = String(childInput?.value || '').trim();
  if (!name) {
    setModuleSectionManagerStatus('Bitte einen Namen fuer den Unterreiter eingeben.', 'error');
    childInput?.focus();
    return;
  }

  const result = createChildModuleSectionUnderParent(parent, name);
  if (!result?.section) {
    setModuleSectionManagerStatus('Unterreiter konnte nicht angelegt werden.', 'error');
    return;
  }

  saveModuleStore();
  _activeTab = result.section.tab || result.section.key;
  _moduleSectionEditorSignature = makeSectionSignature(result.section);
  _moduleSectionEditorMode = 'edit';
  renderAll();
  renderModuleSectionManager();
  setModuleSectionManagerStatus(
    result.created
      ? `Unterreiter "${name}" angelegt.`
      : `Unterreiter "${name}" existiert bereits.`,
    result.created ? 'success' : 'info'
  );
}

function createChildModuleSection(signature) {
  openModuleSectionEditor(signature, { mode: 'child' });
}

function moveModuleSectionToParent(signature, targetSignature) {
  const source = findSectionBySignature(signature);
  if (!source?.nodeId || !targetSignature) return false;
  const sourceNode = findModuleSectionNodeById(source.nodeId);
  if (!sourceNode?.parentId) {
    setModuleSectionManagerStatus('Hauptreiter koennen nicht verschoben werden.', 'error');
    return false;
  }

  let nextParentId = '';
  let label = '';
  if (targetSignature === '__root__') {
    nextParentId = getModuleRootNodeId(source.tab || source.key);
    label = source.tab || source.key;
  } else {
    const target = findSectionBySignature(targetSignature);
    if (!canMoveModuleSectionToParent(source, target)) {
      setModuleSectionManagerStatus('Dieser Reiter kann dort nicht einsortiert werden.', 'error');
      return false;
    }
    nextParentId = target.nodeId;
    label = getSectionOptionLabel(target);
  }

  if (!nextParentId || sourceNode.parentId === nextParentId) {
    setModuleSectionManagerStatus('Keine Aenderung an der Reiterposition.', 'info');
    return false;
  }

  _moduleSectionNodes = _moduleSectionNodes.map(node =>
    node.id === sourceNode.id ? { ...node, parentId: nextParentId } : node
  );
  _customSections = _customSections.map(cleanCustomSection);
  Object.entries(_moduleSectionMoves || {}).forEach(([entryId, section]) => {
    _moduleSectionMoves[entryId] = cleanModuleSectionMove(section);
  });

  saveModuleStore();
  _activeTab = source.tab || source.key;
  renderAll();
  renderModuleSectionManager();
  setModuleSectionManagerStatus(`"${getSectionLeafLabel(source)}" wurde unter "${label}" verschoben.`, 'success');
  return true;
}

function saveModuleSectionFromManager() {
  const tab = String(document.getElementById('msm-tab')?.value || '').trim();
  const path = parseSectionPathInput(document.getElementById('msm-path')?.value || '');
  const desc = String(document.getElementById('msm-desc')?.value || '').trim();
  const iconUrl = String(document.getElementById('msm-icon')?.value || '').trim();
  const isRootMode = _moduleSectionCreateMode === 'root';
  const key = isRootMode ? tab : path[path.length - 1] || '';

  if (!tab) {
    setModuleSectionManagerStatus(isRootMode ? 'Bitte einen Namen fuer den Hauptreiter eingeben.' : 'Bitte einen Hauptreiter eingeben.', 'error');
    document.getElementById('msm-tab')?.focus();
    return;
  }
  if (!isRootMode && !key) {
    setModuleSectionManagerStatus('Bitte einen Pfad eingeben.', 'error');
    document.getElementById('msm-path')?.focus();
    return;
  }

  const section = cleanCustomSection({ key, tab, path: isRootMode ? [] : path, desc, iconUrl, entries: [] });
  const signature = makeSectionSignature(section);
  const existed = getUniqueModuleSections().some(existing => makeSectionSignature(existing) === signature);
  const result = ensureModuleSectionPath(section, { updateDesc: true });
  saveModuleStore();
  _activeTab = tab;
  if (typeof setActiveArchivePath === 'function') setActiveArchivePath(tab, []);
  renderAll();
  renderModuleSectionManager();
  clearModuleSectionManagerForm({ mode: _moduleSectionCreateMode });
  setModuleSectionManagerStatus(
    existed && !result.created
      ? `${isRootMode ? 'Hauptreiter' : 'Bereich'} "${getSectionOptionLabel(section)}" aktualisiert.`
      : `${isRootMode ? 'Hauptreiter' : 'Bereich'} "${getSectionOptionLabel(section)}" gespeichert.`,
    'success'
  );
}

function moveModuleToSection(entryId, targetSignature, options = {}) {
  const id = String(entryId || '').trim();
  const target = findSectionBySignature(targetSignature);
  if (!id || !target) return false;

  const current = findCurrentSectionByEntryId(id);
  if (!current?.entry) return false;

  const currentSignature = makeSectionSignature(current.section);
  if (currentSignature === targetSignature) return false;

  const targetSection = cleanModuleSectionMove(target);
  const existingCustom = findCustomSectionByEntryId(id);
  if (existingCustom) {
    removeCustomModuleById(id);
    upsertCustomModule(targetSection, current.entry);
  } else {
    setModuleSectionMove(id, targetSection);
  }

  if (!options.deferSave) saveModuleStore();
  _activeTab = targetSection.tab || targetSection.key;
  if (!options.deferRender) renderAll();
  if (!options.silent) showAppStatus(`Modul nach "${getSectionOptionLabel(targetSection)}" verschoben.`, 'success');
  return true;
}

async function handleModuleSectionManagerModuleImport(input) {
  const file = input?.files?.[0];
  if (!file) return;
  const targetSignature = document.getElementById('msm-import-target')?.value || '';
  const titleOverride = document.getElementById('msm-import-title')?.value || '';
  const idOverride = document.getElementById('msm-import-id')?.value || '';
  if (typeof importModuleFileIntoSection !== 'function') {
    setModuleSectionManagerStatus('Modulimport ist noch nicht bereit.', 'error');
    input.value = '';
    return;
  }

  setModuleSectionManagerStatus('Modul wird importiert...', 'info');
  try {
    const result = await importModuleFileIntoSection(file, targetSignature, {
      confirm: true,
      titleOverride,
      idOverride
    });
    if (result?.cancelled) {
      setModuleSectionManagerStatus('Import abgebrochen.', 'info');
      return;
    }
    renderModuleSectionManager();
    const comments = result.commentCount ? `, ${result.commentCount} Kommentare` : '';
    setModuleSectionManagerStatus(`"${result.entry.title || result.entry.id}" wurde in ${getSectionOptionLabel(result.section)} eingefuegt${comments}.`, 'success');
    if (typeof showAppStatus === 'function') {
      showAppStatus(`Modul "${result.entry.title || result.entry.id}" wurde eingefuegt.`, 'success');
    }
  } catch (error) {
    console.error('section manager module import failed:', error);
    setModuleSectionManagerStatus(getFriendlyErrorMessage(error, 'Modul konnte nicht importiert werden.'), 'error');
  } finally {
    input.value = '';
  }
}

function deleteModuleFromSectionManager(entryId) {
  const result = deleteModuleById(entryId, { requireCode: true, deferSave: true });
  if (!result.ok) return;
  saveModuleStore();
  renderAll();
  renderModuleSectionManager();
  setModuleSectionManagerStatus(result.kind === 'builtin'
    ? 'Basis-Modul wurde ausgeblendet.'
    : 'Modul wurde geloescht.',
    'success');
}

function releaseModuleSection(signature) {
  const target = findSectionBySignature(signature);
  if (!target) {
    setModuleSectionManagerStatus('Bereich wurde nicht gefunden.', 'error');
    return;
  }

  const affectedSections = getValidSections().filter(section => isSectionDescendantOrSelf(section, target));
  if (!affectedSections.length) {
    setModuleSectionManagerStatus('Keine betroffenen Bereiche gefunden.', 'error');
    return;
  }

  const affectedEntries = [];
  const affectedSignatures = new Set();
  affectedSections.forEach(section => {
    affectedSignatures.add(makeSectionSignature(section));
    (section.entries || []).forEach(entry => {
      const id = String(entry?.id || '').trim();
      if (id && !affectedEntries.some(item => item.id === id)) {
        affectedEntries.push({ id, title: entry.title || id });
      }
    });
  });

  const message = [
    `Bereich wirklich loesen: ${getSectionOptionLabel(target)}?`,
    affectedSections.length > 1 ? `Unterbereiche: ${affectedSections.length - 1}` : '',
    affectedEntries.length ? `Module werden nach Void verschoben: ${affectedEntries.length}` : 'Keine Module betroffen.',
    '',
    'Module werden nicht geloescht.'
  ].filter(Boolean).join('\n');
  if (!confirm(message)) return;

  const voidSection = ensureModuleSectionPath(getVoidModuleSection()).section;
  const voidSignature = makeSectionSignature(voidSection);
  const affectedNodeIds = target.nodeId && typeof getModuleSectionNodeDescendantIds === 'function'
    ? getModuleSectionNodeDescendantIds(target.nodeId)
    : new Set();
  let movedCount = 0;
  affectedEntries.forEach(item => {
    if (moveModuleToSection(item.id, voidSignature, { silent: true, deferSave: true, deferRender: true })) {
      movedCount++;
    }
  });

  affectedSignatures.forEach(sectionSignature => {
    if (sectionSignature !== voidSignature) removeCustomSectionBySignature(sectionSignature);
  });
  if (affectedNodeIds.size) removeModuleSectionNodes(affectedNodeIds);
  if (affectedSignatures.has(_moduleSectionEditorSignature)) {
    _moduleSectionEditorSignature = '';
    _moduleSectionEditorMode = 'edit';
  }

  saveModuleStore();
  _activeTab = voidSection.tab || voidSection.key;
  renderAll();
  renderModuleSectionManager();
  setModuleSectionManagerStatus(`Bereich geloest. ${movedCount} Module liegen jetzt in ${getSectionOptionLabel(voidSection)}.`, 'success');
}

function handleModuleSectionManagerClick(event) {
  const trigger = event.target?.closest?.('[data-section-manager-action]');
  if (!trigger) return;
  const action = trigger.dataset.sectionManagerAction;
  if (!trigger.closest('#module-section-manager-overlay')) return;
  if (moduleSectionManagerView.handleClick(action, trigger)) {
    event.preventDefault();
    return;
  }

  if (action === 'close') {
    event.preventDefault();
    closeModuleSectionManager();
    return;
  }
  if (action === 'clear-form') {
    event.preventDefault();
    clearModuleSectionManagerForm();
    return;
  }
  if (action === 'set-create-mode') {
    setModuleSectionCreateMode(trigger.value);
    return;
  }
  if (action === 'save-section') {
    event.preventDefault();
    saveModuleSectionFromManager();
    return;
  }
  if (action === 'open-icon-directory') {
    event.preventDefault();
    if (typeof openIconDirectory === 'function') {
      openIconDirectory();
    } else {
      setModuleSectionManagerStatus('Icon-Verzeichnis ist noch nicht bereit.', 'error');
    }
    return;
  }
  if (action === 'prefill-section') {
    event.preventDefault();
    prefillModuleSectionManagerForm(trigger.dataset.sectionSignature || '');
    openModuleSectionEditor(trigger.dataset.sectionSignature || '');
    return;
  }
  if (action === 'create-child-section') {
    event.preventDefault();
    createChildModuleSection(trigger.dataset.sectionSignature || '');
    return;
  }
  if (action === 'close-section-editor') {
    event.preventDefault();
    closeModuleSectionEditor();
    return;
  }
  if (action === 'save-section-editor') {
    event.preventDefault();
    saveModuleSectionEditor();
    return;
  }
  if (action === 'create-child-from-editor') {
    event.preventDefault();
    createChildModuleSectionFromEditor();
    return;
  }
  if (action === 'release-section-editor') {
    event.preventDefault();
    releaseModuleSection(_moduleSectionEditorSignature);
    return;
  }
  if (action === 'release-section') {
    event.preventDefault();
    releaseModuleSection(trigger.dataset.sectionSignature || '');
    return;
  }
  if (action === 'delete-module') {
    event.preventDefault();
    deleteModuleFromSectionManager(trigger.dataset.entryId || '');
    return;
  }
  if (action === 'toggle-section-collapse') {
    event.preventDefault();
    toggleModuleSectionNodeCollapsed(trigger.dataset.nodeId || '');
    return;
  }
  if (action === 'expand-all-sections') {
    event.preventDefault();
    setAllModuleSectionsCollapsed(false);
    return;
  }
  if (action === 'collapse-all-sections') {
    event.preventDefault();
    setAllModuleSectionsCollapsed(true);
    return;
  }
  if (action === 'bulk-move-modules') {
    event.preventDefault();
    bulkMoveModuleSectionManagerSelection();
    return;
  }
  if (action === 'bulk-delete-modules') {
    event.preventDefault();
    bulkDeleteModuleSectionManagerSelection();
    return;
  }
  if (action === 'clear-module-selection') {
    event.preventDefault();
    _selectedModuleSectionManagerIds.clear();
    renderModuleSectionManagerModules(getModuleSectionManagerEntries(), document.getElementById('msm-module-filter')?.value || '');
  }
}

function handleModuleSectionManagerChange(event) {
  if (!event.target?.closest?.('#module-section-manager-overlay')) return;
  if (moduleSectionManagerView.handleChange(event.target)) return;
  const importFileTrigger = event.target?.closest?.('[data-section-manager-action="import-module-file"]');
  if (importFileTrigger?.closest?.('#module-section-manager-overlay')) {
    handleModuleSectionManagerModuleImport(importFileTrigger);
    return;
  }
  const editorMoveTrigger = event.target?.closest?.('[data-section-manager-action="move-section-editor"]');
  if (editorMoveTrigger?.closest?.('#module-section-manager-overlay')) {
    const moved = moveModuleSectionToParent(_moduleSectionEditorSignature, editorMoveTrigger.value || '');
    if (!moved) renderModuleSectionEditor();
    return;
  }
  const sectionMoveTrigger = event.target?.closest?.('[data-section-manager-action="move-section"]');
  if (sectionMoveTrigger?.closest?.('#module-section-manager-overlay')) {
    moveModuleSectionToParent(sectionMoveTrigger.dataset.sectionSignature || '', sectionMoveTrigger.value || '');
    return;
  }
  const selectAllTrigger = event.target?.closest?.('#msm-module-select-all');
  if (selectAllTrigger?.closest?.('#module-section-manager-overlay')) {
    const entries = getModuleSectionManagerEntries();
    const filterValue = document.getElementById('msm-module-filter')?.value || '';
    const visible = getVisibleModuleSectionManagerEntries(entries, filterValue);
    const ids = visible.map(item => String(item.entry?.id || '')).filter(Boolean);
    if (selectAllTrigger.checked) ids.forEach(id => _selectedModuleSectionManagerIds.add(id));
    else ids.forEach(id => _selectedModuleSectionManagerIds.delete(id));
    renderModuleSectionManagerModules(entries, filterValue);
    return;
  }
  const selectTrigger = event.target?.closest?.('[data-section-manager-action="select-module"]');
  if (selectTrigger?.closest?.('#module-section-manager-overlay')) {
    const id = String(selectTrigger.dataset.entryId || '');
    if (id) {
      if (selectTrigger.checked) _selectedModuleSectionManagerIds.add(id);
      else _selectedModuleSectionManagerIds.delete(id);
    }
    const entries = getModuleSectionManagerEntries();
    const filterValue = document.getElementById('msm-module-filter')?.value || '';
    if (moduleSectionManagerView.isSelectedOnly()) renderModuleSectionManagerModules(entries, filterValue);
    else {
      selectTrigger.closest('[data-module-row]')?.classList.toggle('is-selected', selectTrigger.checked);
      renderModuleSectionManagerBulkBar(getVisibleModuleSectionManagerEntries(entries, filterValue));
    }
    return;
  }
  const trigger = event.target?.closest?.('[data-section-manager-action="move-module"]');
  if (!trigger || !trigger.closest('#module-section-manager-overlay')) return;
  const moved = moveModuleToSection(trigger.dataset.entryId || '', trigger.value || '', { silent: true });
  renderModuleSectionManager();
  setModuleSectionManagerStatus(moved ? 'Modulposition gespeichert.' : 'Keine Änderung an der Modulposition.', moved ? 'success' : 'info');
}

function handleModuleSectionManagerInput(event) {
  if (!event.target?.closest?.('#module-section-manager-overlay')) return;
  if (event.target?.dataset?.sectionManagerField === 'filter') {
    renderModuleSectionManagerModules(getModuleSectionManagerEntries(), event.target.value || '');
  }
  if (event.target?.dataset?.sectionManagerField === 'section-filter') {
    renderModuleSectionManagerSections(sortModuleSectionsByHierarchy(getUniqueModuleSections()));
  }
}

function handleModuleSectionIconSelected(event) {
  const iconUrl = String(event.detail?.src || '').trim();
  if (!iconUrl) return;
  const overlay = document.getElementById('module-section-manager-overlay');
  if (!overlay?.classList.contains('active')) return;
  const editorPanel = overlay.querySelector('[data-section-editor-panel]');
  const editorActive = overlay?.classList.contains('active') && editorPanel && !editorPanel.hidden && _moduleSectionEditorSignature;
  const target = editorActive
    ? document.getElementById('msm-edit-icon')
    : document.getElementById('msm-icon');
  if (!target) return;
  target.value = iconUrl;
  target.dispatchEvent(new Event('input', { bubbles: true }));
  setModuleSectionManagerStatus(
    editorActive
      ? 'Icon-Pfad in den ausgewählten Reiter übernommen.'
      : 'Icon-Pfad in den neuen Bereich übernommen.',
    'success'
  );
}

document.addEventListener('almanach-icon-selected', handleModuleSectionIconSelected);
