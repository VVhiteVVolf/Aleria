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
  return getUniqueModuleSections().map(section => {
    const signature = makeSectionSignature(section);
    const label = section.tab || section.key;
    return `<option value="${escapeHtml(signature)}"${signature === selectedSignature ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');
}

function hasModuleSectionManagementAccess() {
  return !!_moduleEditorAuthorized;
}

function requireModuleSectionManagementAccess() {
  if (hasModuleSectionManagementAccess()) return true;
  showAppStatus('Bitte entsperre zuerst den Modul-Editor, bevor du Reiter oder Modulpositionen änderst.', 'error');
  return false;
}

function createModuleSectionFromPrompt() {
  if (!requireModuleSectionManagementAccess()) return;
  const rawName = prompt('Name des neuen großen Reiters:');
  if (rawName === null) return;
  const tab = String(rawName || '').trim();
  if (!tab) return;
  const key = tab;
  const signature = makeSectionSignature({ key, tab });
  if (getUniqueModuleSections().some(section => makeSectionSignature(section) === signature)) {
    alert('Dieser Reiter existiert bereits.');
    return;
  }
  const desc = prompt('Kurze Beschreibung für die Kategorieüberschrift:', '') || '';
  _customSections.push(cleanCustomSection({ key, tab, desc, entries: [] }));
  saveModuleStore();
  _activeTab = tab;
  renderAll();
}

function moveModuleToSection(entryId, targetSignature) {
  if (!requireModuleSectionManagementAccess()) {
    renderAll();
    return;
  }
  const id = String(entryId || '').trim();
  const target = findSectionBySignature(targetSignature);
  if (!id || !target) return;

  const current = findCurrentSectionByEntryId(id);
  if (!current?.entry) return;

  const targetSection = cleanModuleSectionMove(target);
  const existingCustom = findCustomSectionByEntryId(id);
  if (existingCustom) {
    removeCustomModuleById(id);
    upsertCustomModule(targetSection, current.entry);
  } else {
    setModuleSectionMove(id, targetSection);
  }

  saveModuleStore();
  _activeTab = targetSection.tab || targetSection.key;
  renderAll();
  showAppStatus(`Modul nach "${targetSection.tab || targetSection.key}" verschoben.`, 'success');
}
