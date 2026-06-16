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
  return cleanCustomSection({
    key: 'Geloeste Module',
    tab: 'Void',
    path: ['Geloeste Module'],
    desc: 'Sicherer Auffangbereich fuer geloeste Reiter und unzugeordnete Module.',
    entries: []
  });
}

function ensureCustomModuleSection(sectionInput, options = {}) {
  const section = cleanCustomSection({ ...(sectionInput || {}), entries: [] });
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
        desc: index === path.length - 1 ? section.desc : ''
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
    return getSectionOptionLabel(a).localeCompare(getSectionOptionLabel(b), 'de');
  });
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

function ensureModuleSectionManagerDialog() {
  let overlay = document.getElementById('module-section-manager-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'module-section-manager-overlay';
  overlay.className = 'module-section-manager-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'module-section-manager-title');
  overlay.setAttribute('tabindex', '-1');
  overlay.innerHTML = `
    <div class="module-section-manager-card">
      <div class="module-section-manager-head">
        <div>
          <div class="module-section-manager-kicker">Archivstruktur</div>
          <h2 id="module-section-manager-title">Reiter und Modulpositionen</h2>
        </div>
        <button class="module-section-manager-close" type="button" data-section-manager-action="close" aria-label="Verwaltung schliessen">×</button>
      </div>
      <div class="module-section-manager-body">
        <section class="module-section-manager-panel">
          <div class="module-section-manager-panel-head">
            <h3>Bereich anlegen</h3>
            <span id="module-section-manager-status" class="module-section-manager-status" role="status"></span>
          </div>
          <div class="module-section-manager-form">
            <label>
              <span>Hauptreiter</span>
              <input id="msm-tab" type="text" list="msm-tab-options" placeholder="z.B. Völker & Kulturen" data-section-manager-field="tab">
              <datalist id="msm-tab-options"></datalist>
            </label>
            <label>
              <span>Pfad</span>
              <input id="msm-path" type="text" placeholder="Cenyr > Celtigerns Wacht > Gwynthor > Castell Draig" data-section-manager-field="path">
            </label>
            <label class="wide">
              <span>Beschreibung</span>
              <input id="msm-desc" type="text" placeholder="Kurze Beschreibung für die Bereichsüberschrift" data-section-manager-field="desc">
            </label>
            <div class="module-section-manager-actions">
              <button type="button" data-section-manager-action="clear-form">Leeren</button>
              <button type="button" class="primary" data-section-manager-action="save-section">Bereich speichern</button>
            </div>
          </div>
        </section>

        <section class="module-section-manager-panel">
          <div class="module-section-manager-panel-head">
            <h3>Bestehende Bereiche</h3>
            <span id="msm-section-count"></span>
          </div>
          <div id="msm-section-list" class="module-section-manager-section-list"></div>
        </section>

        <section class="module-section-manager-panel wide">
          <div class="module-section-manager-panel-head">
            <h3>Module verschieben</h3>
            <input id="msm-module-filter" type="search" placeholder="Module filtern" data-section-manager-field="filter">
          </div>
          <div id="msm-module-list" class="module-section-manager-module-list"></div>
        </section>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function setModuleSectionManagerStatus(message, type = 'info') {
  const status = document.getElementById('module-section-manager-status');
  if (!status) return;
  status.dataset.status = type;
  status.textContent = message || '';
}

function clearModuleSectionManagerForm() {
  const defaultTab = _activeTab && _activeTab !== 'Alle' && _activeTab !== 'Charaktere' ? _activeTab : '';
  const tab = document.getElementById('msm-tab');
  const path = document.getElementById('msm-path');
  const desc = document.getElementById('msm-desc');
  if (tab) tab.value = defaultTab;
  if (path) path.value = '';
  if (desc) desc.value = '';
  setModuleSectionManagerStatus('');
}

function renderModuleSectionManagerTabs(sections) {
  const datalist = document.getElementById('msm-tab-options');
  if (!datalist) return;
  const tabs = [...new Set(sections.map(section => section.tab || section.key).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'de'));
  datalist.innerHTML = tabs.map(tab => `<option value="${escapeHtml(tab)}"></option>`).join('');
}

function renderModuleSectionManagerSections(sections) {
  const list = document.getElementById('msm-section-list');
  const count = document.getElementById('msm-section-count');
  if (!list) return;
  if (count) count.textContent = `${sections.length} Bereiche`;
  list.innerHTML = sections.map(section => {
    const signature = makeSectionSignature(section);
    const entryCount = findSectionBySignature(signature)?.entries?.length || 0;
    const path = getSectionPathLabel(section);
    const depth = Math.min(getSectionPathParts(section).length, 6);
    const isVoid = makeSectionSignature(section) === makeSectionSignature(getVoidModuleSection());
    return `
      <div class="module-section-manager-section-row" style="--section-indent:${Math.max(0, depth - 1) * 0.75}rem">
        <button class="module-section-manager-section-main" type="button" data-section-manager-action="prefill-section" data-section-signature="${escapeHtml(signature)}">
          <span>
            <strong>${escapeHtml(getSectionLeafLabel(section))}</strong>
            <small>${escapeHtml(path ? `${section.tab || section.key} > ${path}` : getSectionOptionLabel(section))}</small>
          </span>
          <em>${entryCount} Module</em>
        </button>
        <div class="module-section-manager-row-actions">
          <button type="button" data-section-manager-action="create-child-section" data-section-signature="${escapeHtml(signature)}">Kind</button>
          <button class="danger" type="button" data-section-manager-action="release-section" data-section-signature="${escapeHtml(signature)}"${isVoid ? ' disabled' : ''}>Lösen</button>
        </div>
      </div>`;
  }).join('') || '<div class="module-section-manager-empty">Noch keine Bereiche vorhanden.</div>';
}

function renderModuleSectionManagerModules(entries, filterValue = '') {
  const list = document.getElementById('msm-module-list');
  if (!list) return;
  const needle = normalizeSearchText(filterValue);
  const visible = entries.filter(item => {
    if (!needle) return true;
    return normalizeSearchText([
      item.entry?.title,
      item.entry?.type,
      item.entry?.category,
      getSectionOptionLabel(item.section)
    ].filter(Boolean).join(' ')).includes(needle);
  });
  list.innerHTML = visible.map(item => `
    <div class="module-section-manager-module-row">
      <div class="module-section-manager-module-main">
        <strong>${escapeHtml(item.entry?.title || item.entry?.id || 'Unbenanntes Modul')}</strong>
        <span>${escapeHtml(getSectionOptionLabel(item.section))}</span>
      </div>
      <select data-section-manager-action="move-module" data-entry-id="${escapeHtml(item.entry?.id || '')}" aria-label="${escapeHtml(item.entry?.title || 'Modul')} verschieben">
        ${buildModuleSectionTargetOptions(item.sectionSignature)}
      </select>
    </div>
  `).join('') || '<div class="module-section-manager-empty">Keine Module gefunden.</div>';
}

function renderModuleSectionManager() {
  ensureModuleSectionManagerDialog();
  const sections = sortModuleSectionsByHierarchy(getUniqueModuleSections());
  const entries = getModuleSectionManagerEntries();
  const filter = document.getElementById('msm-module-filter')?.value || '';
  renderModuleSectionManagerTabs(sections);
  renderModuleSectionManagerSections(sections);
  renderModuleSectionManagerModules(entries, filter);
}

function openModuleSectionManager() {
  ensureModuleSectionManagerDialog();
  if (ensureKnownSectionHierarchy()) {
    saveModuleStore();
    renderAll();
  }
  renderModuleSectionManager();
  clearModuleSectionManagerForm();
  activateDialog('module-section-manager-overlay', { initialFocus: '#msm-tab' });
}

function closeModuleSectionManager() {
  deactivateDialog('module-section-manager-overlay');
}

function prefillModuleSectionManagerForm(signature) {
  const section = findSectionBySignature(signature);
  if (!section) return;
  const tab = document.getElementById('msm-tab');
  const path = document.getElementById('msm-path');
  const desc = document.getElementById('msm-desc');
  if (tab) tab.value = section.tab || section.key || '';
  if (path) path.value = getSectionPathLabel(section) || section.key || '';
  if (desc) desc.value = section.desc || '';
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
  setModuleSectionManagerStatus('Kindbereich vorbereitet. Namen im Pfad ersetzen und speichern.', 'info');
}

function saveModuleSectionFromManager() {
  const tab = String(document.getElementById('msm-tab')?.value || '').trim();
  const path = parseSectionPathInput(document.getElementById('msm-path')?.value || '');
  const desc = String(document.getElementById('msm-desc')?.value || '').trim();
  const key = path[path.length - 1] || '';

  if (!tab) {
    setModuleSectionManagerStatus('Bitte einen Hauptreiter eingeben.', 'error');
    document.getElementById('msm-tab')?.focus();
    return;
  }
  if (!key) {
    setModuleSectionManagerStatus('Bitte einen Pfad eingeben.', 'error');
    document.getElementById('msm-path')?.focus();
    return;
  }

  const section = cleanCustomSection({ key, tab, path, desc, entries: [] });
  const signature = makeSectionSignature(section);
  const existed = getUniqueModuleSections().some(existing => makeSectionSignature(existing) === signature);
  const result = ensureModuleSectionPath(section, { updateDesc: true });
  saveModuleStore();
  _activeTab = tab;
  renderAll();
  renderModuleSectionManager();
  clearModuleSectionManagerForm();
  setModuleSectionManagerStatus(
    existed && !result.created
      ? `Bereich "${getSectionOptionLabel(section)}" aktualisiert.`
      : `Bereich "${getSectionOptionLabel(section)}" gespeichert.`,
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
  let movedCount = 0;
  affectedEntries.forEach(item => {
    if (moveModuleToSection(item.id, voidSignature, { silent: true, deferSave: true, deferRender: true })) {
      movedCount++;
    }
  });

  affectedSignatures.forEach(sectionSignature => {
    if (sectionSignature !== voidSignature) removeCustomSectionBySignature(sectionSignature);
  });

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
  if (action === 'save-section') {
    event.preventDefault();
    saveModuleSectionFromManager();
    return;
  }
  if (action === 'prefill-section') {
    event.preventDefault();
    prefillModuleSectionManagerForm(trigger.dataset.sectionSignature || '');
    return;
  }
  if (action === 'create-child-section') {
    event.preventDefault();
    prefillModuleSectionManagerChildForm(trigger.dataset.sectionSignature || '');
    return;
  }
  if (action === 'release-section') {
    event.preventDefault();
    releaseModuleSection(trigger.dataset.sectionSignature || '');
  }
}

function handleModuleSectionManagerChange(event) {
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
}

document.addEventListener('click', handleModuleSectionManagerClick);
document.addEventListener('change', handleModuleSectionManagerChange);
document.addEventListener('input', handleModuleSectionManagerInput);
