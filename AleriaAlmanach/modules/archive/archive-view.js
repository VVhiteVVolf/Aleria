const SECTION_THEME_META = {
  Archive: {
    slug: 'archive',
    label: 'Offenes Archiv',
    note: 'Alle Register, Mappen und Notizen liegen gleichzeitig offen.'
  },
  Kultur: {
    slug: 'kultur',
    label: 'Kulturarchiv',
    note: 'Völker, Tavernen, Bräuche und Alltagsbilder der Welt.'
  },
  Zauberei: {
    slug: 'magie',
    label: 'Arkanes Fach',
    note: 'Magie, Formeln, Krankheiten und gelehrte Lehrstücke.'
  },
  Infernales: {
    slug: 'infernales',
    label: 'Verbotene Akten',
    note: 'Flüche, Dämonologien und gefährliche Grenzgebiete des Wissens.'
  },
  Celestiales: {
    slug: 'celestiales',
    label: 'Himmlische Schriften',
    note: 'Sakrale Überlieferungen, Gnade, Ordnung und kosmische Zeichen.'
  },
  Schiffe: {
    slug: 'schiffe',
    label: 'Maritimes Register',
    note: 'Flotten, Schiffe, Seewege und das Vokabular der Küsten.'
  },
  Werke: {
    slug: 'werke',
    label: 'Werkstattblätter',
    note: 'Konstrukte, Ingenieurskunst und die Materie hinter den Wundern.'
  },
  'Kriminalität': {
    slug: 'kriminalitaet',
    label: 'Verdeckte Dossiers',
    note: 'Banden, Steckbriefe, Gerüchte und die Schatten der Ordnung.'
  },
  Forschung: {
    slug: 'forschung',
    label: 'Expeditionsmappen',
    note: 'Ausgrabungen, Quellenarbeit und gelehrte Feldberichte.'
  },
  Religion: {
    slug: 'religion',
    label: 'Kanonische Sammlung',
    note: 'Orden, Lehren, Hierarchien und die Sprache des Glaubens.'
  },
  Charaktere: {
    slug: 'charaktere',
    label: 'Personenregister',
    note: 'Gesichter, Rollen und wiederkehrende Stimmen des Almanachs.'
  }
};
let _activeTab = 'Alle';
let _appInitialized = false;
let _archiveSearch = '';
let _archiveSearchNeedle = '';
let _archiveSearchRenderTimer = null;
let _archiveSearchUserTouched = false;
let _archiveEntryMatchCount = 0;
let _archiveCharMatchCount = 0;
let _archiveSectionMatchCount = 0;
let _archiveEntrySectionMatchCount = 0;
const _archiveEntrySearchCache = new Map();
let _archiveManageMode = false;
let _archiveToolsExpanded = false;
const _archivePathByTab = new Map();

function invalidateArchiveSearchCache() {
  _archiveEntrySearchCache.clear();
}

function encodeArchivePathData(path = []) {
  return encodeURIComponent(JSON.stringify(Array.isArray(path) ? path : []));
}

function decodeArchivePathData(value) {
  try {
    const parsed = JSON.parse(decodeURIComponent(String(value || '')));
    return Array.isArray(parsed) ? parsed.map(part => String(part || '').trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getActiveArchivePath(tab = _activeTab) {
  return _archivePathByTab.get(tab) || [];
}

function setActiveArchivePath(tab, path = []) {
  _archivePathByTab.set(tab, Array.isArray(path) ? path.map(part => String(part || '').trim()).filter(Boolean) : []);
}

function normalizeArchivePathPart(part) {
  return normalizeSearchText(part);
}

function archivePathsEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((part, index) => normalizeArchivePathPart(part) === normalizeArchivePathPart(b[index]));
}

function archivePathHasPrefix(path = [], prefix = []) {
  if (path.length < prefix.length) return false;
  return prefix.every((part, index) => normalizeArchivePathPart(part) === normalizeArchivePathPart(path[index]));
}

function getSectionThemeMeta(sectionKey) {
  return SECTION_THEME_META[sectionKey] || SECTION_THEME_META.Archive;
}

function getThemeMetaForSection(section) {
  if (!section) return SECTION_THEME_META.Archive;
  if (SECTION_THEME_META[section.key]) return getSectionThemeMeta(section.key);
  const tab = section.tab || section.key;
  const topSection = getValidSections().find(item =>
    (item.tab || item.key) === tab && SECTION_THEME_META[item.key]
  );
  return topSection ? getSectionThemeMeta(topSection.key) : SECTION_THEME_META.Archive;
}

function getThemeMetaForTab(tab) {
  if (tab === 'Alle') return SECTION_THEME_META.Archive;
  if (tab === 'Charaktere') return SECTION_THEME_META.Charaktere;
  const section = getValidSections().find(item => (item.tab || item.key) === tab);
  return getThemeMetaForSection(section);
}

function getThemeMetaForEntry(entry) {
  if (!entry?.id) return SECTION_THEME_META.Archive;
  const found = findCurrentSectionByEntryId(entry.id);
  return getThemeMetaForSection(found?.section);
}

function updateSidebarCurrentNote(tab = _activeTab) {
  const note = document.getElementById('sidebar-current-note');
  if (!note) return;
  const meta = getThemeMetaForTab(tab);
  const section = tab === 'Alle' || tab === 'Charaktere'
    ? null
    : getValidSections().find(item => (item.tab || item.key) === tab);
  const label = tab === 'Alle' ? 'Alle Bereiche' : tab;
  const text = section?.desc || meta.note;
  note.innerHTML = `
    <div class="sidebar-shelf-kicker">${escapeHtml(meta.label)}</div>
    <div class="sidebar-shelf-text">${escapeHtml(text)}</div>
    <div class="sidebar-shelf-tag">${escapeHtml(label)}</div>`;
}

function applyArchiveTheme(tab = _activeTab) {
  const meta = getThemeMetaForTab(tab);
  document.body.dataset.activeTheme = meta.slug;
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.dataset.activeTheme = meta.slug;
  updateSidebarCurrentNote(tab);
}

function applyModalTheme(entry) {
  const card = document.querySelector('.modal-card');
  if (!card) return;
  const size = getModuleDisplaySize(entry);
  card.dataset.entryTheme = getThemeMetaForEntry(entry).slug;
  card.classList.toggle('inline-module-editing', isInlineEditingEntry(entry));
  card.style.setProperty('--module-width', `${size.width}vw`);
  card.style.setProperty('--module-height', `${size.height}vh`);
}

function openArchiveEntryById(entryId) {
  const found = findCurrentSectionByEntryId(String(entryId || ''));
  if (!found?.entry) return;
  openModal(found.entry);
}

function preloadArchiveEntryById(entryId) {
  const found = findCurrentSectionByEntryId(String(entryId || ''));
  if (!found?.entry) return;
  preloadEntryImages(found.entry, 3);
}

function handleArchiveActionClick(event) {
  const trigger = event.target?.closest?.('[data-archive-action]');
  if (!trigger) return;
  const action = trigger.dataset.archiveAction;

  if (action === 'switch-tab') {
    event.preventDefault();
    switchTab(trigger.dataset.tab || 'Alle', { resetPath: true, render: true });
    return;
  }
  if (action === 'enter-section-folder' || action === 'set-section-path') {
    event.preventDefault();
    if (_activeTab === 'Alle' || _activeTab === 'Charaktere') return;
    setActiveArchivePath(_activeTab, decodeArchivePathData(trigger.dataset.sectionPath || ''));
    renderAll();
    return;
  }
  if (action === 'new-module') {
    event.preventDefault();
    openModuleEditorForNew();
    return;
  }
  if (action === 'import-module') {
    event.preventDefault();
    openModuleEditorForImport();
    return;
  }
  if (action === 'open-module-stamp') {
    event.preventDefault();
    openModuleStampDialog(trigger.dataset.sourceEntryId || '');
    return;
  }
  if (action === 'toggle-archive-tools') {
    event.preventDefault();
    _archiveToolsExpanded = !_archiveToolsExpanded;
    document.querySelectorAll('.gallery-tab-group-tools').forEach(group => {
      group.classList.toggle('is-expanded', _archiveToolsExpanded);
    });
    document.querySelectorAll('[data-archive-action="toggle-archive-tools"]').forEach(button => {
      button.classList.toggle('active', _archiveToolsExpanded);
      button.setAttribute('aria-expanded', _archiveToolsExpanded ? 'true' : 'false');
    });
    return;
  }
  if (action === 'create-module-section') {
    event.preventDefault();
    openModuleSectionManager({ createMode: 'root' });
    return;
  }
  if (action === 'toggle-archive-manage') {
    event.preventDefault();
    openModuleSectionManager();
    return;
  }
  if (action === 'generate-dashboard-insights') {
    event.preventDefault();
    if (typeof generateArchiveDashboardInsights === 'function') {
      generateArchiveDashboardInsights();
    }
    return;
  }
  if (action === 'toggle-section-expanded') {
    event.preventDefault();
    toggleArchiveSectionExpanded(trigger.dataset.sectionKey || '');
    return;
  }
  if (action === 'open-entry') {
    if (event.target?.closest?.('.entry-card-admin')) return;
    event.preventDefault();
    openArchiveEntryById(trigger.dataset.entryId || '');
  }
}

function handleArchiveActionChange(event) {
  const trigger = event.target?.closest?.('[data-archive-action="move-entry-section"]');
  if (!trigger) return;
  event.preventDefault();
  moveModuleToSection(trigger.dataset.entryId || '', trigger.value || '');
}

function handleArchiveActionKeydown(event) {
  const trigger = event.target?.closest?.('[data-archive-action="open-entry"]');
  if (!trigger) return;
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  openArchiveEntryById(trigger.dataset.entryId || '');
}

function handleArchiveEntryPreload(event) {
  const trigger = event.target?.closest?.('[data-archive-action="open-entry"]');
  if (!trigger) return;
  preloadArchiveEntryById(trigger.dataset.entryId || '');
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matchesArchiveSearch(haystack) {
  return !_archiveSearchNeedle || haystack.includes(_archiveSearchNeedle);
}

function buildEntrySearchText(entry, section) {
  const cacheKey = `${makeSectionSignature(section)}::${entry?.id || ''}`;
  if (entry?.id && _archiveEntrySearchCache.has(cacheKey)) {
    return _archiveEntrySearchCache.get(cacheKey);
  }
  const parts = [
    section.key,
    section.tab,
    section.desc,
    getSectionPathLabel(section),
    entry.id,
    entry.title,
    entry.subtitle,
    entry.type,
    entry.category,
    entry.stamp,
    entry.description,
    entry.commentText,
    entry.quote,
    entry.quoteBy,
    entry.icon,
    entry.commentator?.name,
    entry.commentator?.title,
  ];

  (entry.stats || []).forEach(stat => parts.push(...stat));

  (entry.pages || []).forEach(page => {
    parts.push(
      page.pageTitle,
      page.description,
      page.quote,
      page.quoteBy,
      page.profileTitle,
      page.commentText
    );
    (page.stats || []).forEach(stat => parts.push(...stat));
    (page.sceneBlocks || []).forEach(block => parts.push(block.type, block.name, block.text));
    (page.commentSequence || []).forEach(block => parts.push(block.name, block.title, block.text, block.narrator ? 'Erzähler' : '', block.side));
    (page.wanted || []).forEach(item => parts.push(item.name, item.role, item.status, item.kopfgeld, item.letzter, item.bekannt, item.egon));
    (page.profiles || []).forEach(profile => {
      parts.push(profile.name, profile.role, profile.banner, profile.stamp, profile.note);
      (profile.fields || []).forEach(field => parts.push(...field));
    });
  });

  const text = normalizeSearchText(parts.filter(Boolean).join(' '));
  if (entry?.id) _archiveEntrySearchCache.set(cacheKey, text);
  return text;
}

function parseAliasInput(value) {
  return String(value || '')
    .split(/[\n,;]+/)
    .map(alias => alias.trim())
    .filter(Boolean)
    .filter((alias, index, list) => list.findIndex(item => normalizeSearchText(item) === normalizeSearchText(alias)) === index);
}

function formatArchiveMeta(entryCount, charCount, sectionCount) {
  if (!_archiveSearchNeedle) {
    return 'Suche nach Titeln, Kategorien, Personen oder Stichworten aus dem Archiv.';
  }

  const parts = [];
  if (entryCount) parts.push(`${entryCount} Eintrag${entryCount === 1 ? '' : 'e'}`);
  if (charCount) parts.push(`${charCount} Charakter${charCount === 1 ? '' : 'e'}`);

  if (!parts.length) {
    return `Keine Treffer für "${_archiveSearch.trim()}".`;
  }

  const sectionText = sectionCount ? ` in ${sectionCount} Bereich${sectionCount === 1 ? '' : 'en'}` : '';
  return `${parts.join(' · ')}${sectionText}`;
}

function updateArchiveSearchUI() {
  const input = document.getElementById('archive-search-input');
  const clearBtn = document.getElementById('archive-search-clear');
  const meta = document.getElementById('archive-search-meta');
  const emptyState = document.getElementById('archive-empty-state');
  const emptyText = document.getElementById('archive-empty-text');

  if (input && input.value !== _archiveSearch) input.value = _archiveSearch;
  if (clearBtn) clearBtn.disabled = !_archiveSearchNeedle;

  const entryCount = _archiveEntryMatchCount;
  const charCount = _archiveCharMatchCount;
  const sectionCount = _archiveSectionMatchCount;

  if (meta) {
    meta.textContent = formatArchiveMeta(entryCount, charCount, sectionCount);
  }

  const hasVisibleSections = !!document.querySelector('#main-content .section-block.visible')
    || !!document.querySelector('#main-content [data-archive-dashboard]:not([hidden])');
  if (emptyState && emptyText) {
    emptyState.classList.toggle('visible', !hasVisibleSections);
    emptyText.textContent = _archiveSearchNeedle
      ? `Für "${_archiveSearch.trim()}" wurde im aktuellen Archivzustand nichts gefunden.`
      : 'Wähle einen Reiter oder nutze die Suche, um gezielt durch das Archiv zu gehen.';
  }
}

function setArchiveSearch(value, options = {}) {
  if (options.userInput) _archiveSearchUserTouched = true;
  _archiveSearch = String(value ?? '');
  _archiveSearchNeedle = normalizeSearchText(_archiveSearch);
  const input = document.getElementById('archive-search-input');
  const clearBtn = document.getElementById('archive-search-clear');
  if (input && input.value !== _archiveSearch) input.value = _archiveSearch;
  if (clearBtn) clearBtn.disabled = !_archiveSearchNeedle;

  clearTimeout(_archiveSearchRenderTimer);
  if (options.immediate) {
    renderAll();
    return;
  }
  _archiveSearchRenderTimer = setTimeout(() => {
    _archiveSearchRenderTimer = null;
    renderAll();
  }, 180);
}

function clearTransientSearchInputs() {
  clearTimeout(_archiveSearchRenderTimer);
  _archiveSearchRenderTimer = null;
  _archiveSearch = '';
  _archiveSearchNeedle = '';

  const archiveInput = document.getElementById('archive-search-input');
  if (archiveInput) archiveInput.value = '';
  const archiveClear = document.getElementById('archive-search-clear');
  if (archiveClear) archiveClear.disabled = true;

  ['cf-char-search', 'ec-char-search'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
}

function clearArchiveSearchOnStartup() {
  _archiveSearchUserTouched = false;
  [0, 80, 250, 700, 1500].forEach(delay => {
    window.setTimeout(() => {
      if (_archiveSearchUserTouched) return;
      const archiveInput = document.getElementById('archive-search-input');
      const hadSearch = !!_archiveSearchNeedle || !!archiveInput?.value;
      _archiveSearch = '';
      _archiveSearchNeedle = '';
      if (archiveInput) archiveInput.value = '';
      const archiveClear = document.getElementById('archive-search-clear');
      if (archiveClear) archiveClear.disabled = true;
      if (hadSearch) renderAll();
    }, delay);
  });
}

function clearTransientSearchInputsAfterBrowserRestore() {
  window.setTimeout(() => {
    const hadArchiveSearch = !!_archiveSearchNeedle || !!document.getElementById('archive-search-input')?.value;
    clearTransientSearchInputs();
    if (hadArchiveSearch) renderAll();
    applyCommentCharacterFilter?.();
    applyEditCharacterFilter?.();
  }, 0);
}

function shouldRenderArchiveDrilldown(tab = _activeTab) {
  return tab !== 'Alle' && tab !== 'Charaktere' && !_archiveSearchNeedle;
}

function getArchiveTabSections(sections = [], tab = _activeTab) {
  return sections.filter(section => (section.tab || section.key) === tab);
}

function getArchiveRootSection(tabSections = [], tab = _activeTab) {
  const root = tabSections.find(section => !getSectionPathParts(section).length);
  if (root) return root;
  return {
    key: tab || 'Archiv',
    tab: tab || 'Archiv',
    desc: getThemeMetaForTab(tab).note,
    entries: []
  };
}

function getArchiveDisplaySection(tabSections = [], tab = _activeTab, path = []) {
  if (!path.length) return getArchiveRootSection(tabSections, tab);
  const exact = tabSections.find(section => archivePathsEqual(getSectionPathParts(section), path));
  if (exact) return exact;
  return {
    key: path[path.length - 1] || tab || 'Archiv',
    tab: tab || 'Archiv',
    path,
    desc: '',
    entries: []
  };
}

function getArchiveSectionsAtPath(tabSections = [], path = []) {
  return tabSections.filter(section => archivePathsEqual(getSectionPathParts(section), path));
}

function getArchiveChildFolders(tabSections = [], currentPath = []) {
  const groups = new Map();
  tabSections.forEach(section => {
    const path = getSectionPathParts(section);
    if (path.length <= currentPath.length || !archivePathHasPrefix(path, currentPath)) return;
    const label = path[currentPath.length];
    const folderPath = path.slice(0, currentPath.length + 1);
    const key = folderPath.map(normalizeArchivePathPart).join('>');
    if (!groups.has(key)) {
      groups.set(key, {
        label,
        path: folderPath,
        moduleCount: 0,
        childKeys: new Set()
      });
    }
  });

  groups.forEach(folder => {
    tabSections.forEach(section => {
      const path = getSectionPathParts(section);
      if (!archivePathHasPrefix(path, folder.path)) return;
      folder.moduleCount += (section.entries || []).length;
      if (path.length > folder.path.length) {
        folder.childKeys.add(normalizeArchivePathPart(path[folder.path.length]));
      }
    });
  });

  return Array.from(groups.values())
    .map(folder => ({
      label: folder.label,
      path: folder.path,
      moduleCount: folder.moduleCount,
      childCount: folder.childKeys.size
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'de'));
}

function switchTab(tab, options = {}) {
  _activeTab = tab;
  if (options.resetPath) setActiveArchivePath(tab, []);
  if (options.render) {
    renderAll();
    return;
  }
  document.querySelectorAll('.gallery-tab-group-main .gallery-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('[data-archive-dashboard]').forEach(dashboard => {
    dashboard.hidden = tab !== 'Alle' || !!_archiveSearchNeedle;
  });
  document.querySelectorAll('.section-block').forEach(block => {
    const blockTab = block.dataset.tab;
    const hasMatches = block.dataset.hasMatches !== 'false';
    const show = hasMatches && ((_archiveSearchNeedle && tab === 'Alle') || blockTab === tab);
    block.classList.toggle('visible', show);
  });
  applyArchiveTheme(tab);
  updateArchiveSearchUI();
}

function renderAll() {
  const main    = document.getElementById('main-content');
  const tabsNav = document.getElementById('gallery-tabs');
  if (!main || !tabsNav) return;
  clearTimeout(_archiveSearchRenderTimer);
  _archiveSearchRenderTimer = null;
  const sections = getValidSections();
  const customSectionSignatures = new Set(_customSections.map(section => makeSectionSignature(section)));
  let entryMatchCount = 0;
  let sectionMatchCount = 0;
  let priorityCardImageBudget = 10;

  const activeEl = document.activeElement;
  const refocusSearch = activeEl && activeEl.id === 'archive-search-input';
  const searchSelectionStart = refocusSearch ? activeEl.selectionStart : null;
  const searchSelectionEnd = refocusSearch ? activeEl.selectionEnd : null;

  main.innerHTML = '';
  tabsNav.innerHTML = '';

  // Collect unique tabs in order
  // Build tab order: 'Alle' first, then unique section tabs (skip 'Alle' if a section uses it), then 'Charaktere'
  const sectionTabs = [...new Set(sections.map(s => s.tab || s.key).filter(t => t !== 'Alle'))];
  const tabOrder = ['Alle', ...sectionTabs, 'Charaktere'];
  const tabGroup = document.createElement('div');
  tabGroup.className = 'gallery-tab-group gallery-tab-group-main';
  tabsNav.appendChild(tabGroup);
  const toolGroup = document.createElement('div');
  toolGroup.className = `gallery-tab-group gallery-tab-group-tools${_archiveToolsExpanded ? ' is-expanded' : ''}`;
  toolGroup.setAttribute('aria-label', 'Archivwerkzeuge');
  tabsNav.appendChild(toolGroup);

  // Build tab buttons
  tabOrder.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = 'gallery-tab-btn' + (tab === 'Alle' ? ' active' : '');
    btn.dataset.tab = tab;
    btn.dataset.tabTheme = getThemeMetaForTab(tab).slug;
    btn.dataset.archiveAction = 'switch-tab';
    btn.textContent = tab === 'Alle' ? 'Dashboard' : tab;
    tabGroup.appendChild(btn);
  });

  const editToolsBtn = document.createElement('button');
  editToolsBtn.className = `gallery-tab-btn gallery-tab-edit-toggle${_archiveToolsExpanded ? ' active' : ''}`;
  editToolsBtn.type = 'button';
  editToolsBtn.textContent = 'Bearbeiten';
  editToolsBtn.title = 'Werkzeuge fuer Module, Import, Stempel und Reiter anzeigen';
  editToolsBtn.dataset.archiveAction = 'toggle-archive-tools';
  editToolsBtn.setAttribute('aria-label', editToolsBtn.title);
  editToolsBtn.setAttribute('aria-expanded', _archiveToolsExpanded ? 'true' : 'false');
  toolGroup.appendChild(editToolsBtn);

  const toolActions = document.createElement('div');
  toolActions.className = 'gallery-tab-tool-actions';
  toolActions.setAttribute('aria-label', 'Bearbeitungswerkzeuge');
  toolGroup.appendChild(toolActions);

  const addBtn = document.createElement('button');
  addBtn.className = 'gallery-tab-btn gallery-tab-add gallery-tab-tool';
  addBtn.type = 'button';
  addBtn.textContent = '+ Modul';
  addBtn.title = 'Neues Modul anlegen';
  addBtn.dataset.archiveAction = 'new-module';
  addBtn.setAttribute('aria-label', 'Neues Modul anlegen');
  toolActions.appendChild(addBtn);

  const importBtn = document.createElement('button');
  importBtn.className = 'gallery-tab-btn gallery-tab-add gallery-tab-tool';
  importBtn.type = 'button';
  importBtn.textContent = 'Import';
  importBtn.title = 'Modul importieren, exportieren oder Backup verwalten';
  importBtn.dataset.archiveAction = 'import-module';
  importBtn.setAttribute('aria-label', 'Modul importieren, exportieren oder Backup verwalten');
  toolActions.appendChild(importBtn);

  const stampBtn = document.createElement('button');
  stampBtn.className = 'gallery-tab-btn gallery-tab-add gallery-tab-tool';
  stampBtn.type = 'button';
  stampBtn.textContent = 'Stempel';
  stampBtn.title = 'Bestehendes Modul kopieren und als eigenstaendige Kopie einsetzen';
  stampBtn.dataset.archiveAction = 'open-module-stamp';
  stampBtn.setAttribute('aria-label', stampBtn.title);
  toolActions.appendChild(stampBtn);

  const sectionBtn = document.createElement('button');
  sectionBtn.className = 'gallery-tab-btn gallery-tab-add gallery-tab-tool';
  sectionBtn.type = 'button';
  sectionBtn.textContent = '+ Reiter';
  sectionBtn.title = 'Neuen großen Modul-Reiter erstellen';
  sectionBtn.dataset.archiveAction = 'create-module-section';
  sectionBtn.setAttribute('aria-label', 'Neuen großen Modul-Reiter erstellen');
  toolActions.appendChild(sectionBtn);

  const manageBtn = document.createElement('button');
  manageBtn.className = 'gallery-tab-btn gallery-tab-add gallery-tab-tool';
  manageBtn.type = 'button';
  manageBtn.textContent = 'Verwalten';
  manageBtn.title = 'Reiter, Pfade und Modulpositionen verwalten';
  manageBtn.dataset.archiveAction = 'toggle-archive-manage';
  manageBtn.setAttribute('aria-label', manageBtn.title);
  toolActions.appendChild(manageBtn);

  const toolbar = document.createElement('div');
  toolbar.className = 'archive-toolbar';
  toolbar.innerHTML = `
    <div class="archive-toolbar-label">Archivsuche</div>
    <div class="archive-search-wrap">
      <input class="archive-search-input" id="archive-search-input" name="aleria-archive-search-${Date.now()}" type="search" placeholder="Titel, Kategorie, Person oder Stichwort eingeben" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-form-type="other">
      <button class="archive-search-clear" id="archive-search-clear" type="button">Leeren</button>
    </div>
    <div class="archive-search-meta" id="archive-search-meta"></div>`;
  main.appendChild(toolbar);

  const dashboard = document.createElement('div');
  dashboard.dataset.archiveDashboard = 'true';
  dashboard.innerHTML = renderArchiveDashboard(sections);
  main.appendChild(dashboard);
  window.setTimeout(() => {
    if (typeof hydrateArchiveDashboardActivity === 'function') hydrateArchiveDashboardActivity();
  }, 0);

  const searchInput = toolbar.querySelector('#archive-search-input');
  const clearBtn = toolbar.querySelector('#archive-search-clear');
  searchInput.value = _archiveSearch;
  searchInput.addEventListener('input', e => setArchiveSearch(e.target.value, { userInput: true }));
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _archiveSearchNeedle) {
      e.preventDefault();
      setArchiveSearch('', { immediate: true });
    }
  });
  clearBtn.addEventListener('click', () => {
    if (_archiveSearchNeedle) setArchiveSearch('', { immediate: true });
  });

  const emptyState = document.createElement('div');
  emptyState.className = 'archive-empty-state';
  emptyState.id = 'archive-empty-state';
  emptyState.innerHTML = `
    <div class="archive-empty-title">Keine Archivtreffer</div>
    <div class="archive-empty-text" id="archive-empty-text"></div>`;
  main.appendChild(emptyState);

  let renderSections = sections;
  const drillFoldersBySignature = new Map();
  const drillPathNavBySignature = new Map();
  if (shouldRenderArchiveDrilldown(_activeTab)) {
    const currentPath = getActiveArchivePath(_activeTab);
    const tabSections = getArchiveTabSections(sections, _activeTab);
    const displaySection = getArchiveDisplaySection(tabSections, _activeTab, currentPath);
    const currentSections = getArchiveSectionsAtPath(tabSections, currentPath);
    const folders = getArchiveChildFolders(tabSections, currentPath);
    const directEntries = currentSections.flatMap(section => section.entries || []);
    const renderSection = { ...displaySection, entries: directEntries };
    const renderSignature = makeSectionSignature(renderSection);
    renderSections = [renderSection];
    drillFoldersBySignature.set(renderSignature, folders);
    drillPathNavBySignature.set(renderSignature, renderArchivePathNav(getArchiveRootSection(tabSections, _activeTab), currentPath));
  }

  // Build section blocks
  renderSections.forEach(section => {
    const filteredEntries = section.entries.filter(entry => matchesArchiveSearch(buildEntrySearchText(entry, section)));
    entryMatchCount += filteredEntries.length;
    const sectionSignature = makeSectionSignature(section);
    const drillFolders = drillFoldersBySignature.get(sectionSignature) || [];
    const showEmptySection = !_archiveSearchNeedle && !section.entries.length && !drillFolders.length;
    if (filteredEntries.length || showEmptySection || drillFolders.length) sectionMatchCount++;
    const theme = getThemeMetaForSection(section);
    const sectionDepth = getSectionPathParts(section).length;
    const block = document.createElement('div');
    block.className = `section-block visible archive-section-depth-${Math.min(sectionDepth, 4)}`;
    block.dataset.tab = section.tab || section.key;
    block.dataset.sectionTheme = theme.slug;
    block.dataset.sectionDepth = String(sectionDepth);
    block.dataset.hasMatches = filteredEntries.length || showEmptySection || drillFolders.length ? 'true' : 'false';
    block.innerHTML = `
      ${drillPathNavBySignature.get(sectionSignature) || ''}
      ${renderArchiveSectionBand(section, filteredEntries, { isCustom: customSectionSignatures.has(sectionSignature) })}
      ${renderArchiveFolderGrid(drillFolders)}
      <div class="card-grid"></div>`;
    main.appendChild(block);
    const grid = block.querySelector('.card-grid');
    if (showEmptySection) {
      const hint = document.createElement('div');
      hint.className = 'archive-section-empty-hint';
      hint.textContent = 'Noch keine Module in diesem Reiter.';
      grid.appendChild(hint);
    }
    const visibleEntries = getArchiveSectionVisibleEntries(section, filteredEntries, { searchActive: !!_archiveSearchNeedle });
    visibleEntries.forEach((entry, i) => {
      const card = document.createElement('div');
      card.className = 'entry-card' + (entry.locked ? ' card-locked' : '');
      card.style.animationDelay = `${i * 0.07}s`;
      card.dataset.searchKind = 'entry';
      card.dataset.archiveAction = 'open-entry';
      card.dataset.entryId = entry.id || '';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${entry.title} öffnen`);
      const previewImage = getArchiveEntryPreviewImage(entry);
      const usePriorityImage = !!previewImage && priorityCardImageBudget > 0;
      const imageLoadingAttrs = usePriorityImage
        ? 'loading="eager" decoding="async" fetchpriority="high"'
        : 'loading="lazy" decoding="async" fetchpriority="low"';
      card.innerHTML = `
        <div class="card-image-wrap">
          ${previewImage ? `<img src="${previewImage}" alt="${escapeHtml(entry.title)}" ${imageLoadingAttrs}>` : `<div class="card-placeholder-inner">${escapeHtml(entry.icon || '')}</div>`}
          <div class="card-image-overlay"></div>
          ${entry.locked ? `<div class="lock-icon">🔒</div>` : ''}
          <div class="card-label"><h3>${escapeHtml(entry.title)}</h3><div class="card-type-tag">${escapeHtml(entry.type)}</div></div>
        </div>
        ${renderArchiveEntryMeta(entry, section, { showLocation: _archiveSearchNeedle || _activeTab === 'Alle' })}
        ${_archiveManageMode ? `<div class="entry-card-admin">
          <label>Verschieben nach</label>
          <select data-archive-action="move-entry-section" data-entry-id="${escapeHtml(entry.id || '')}" aria-label="${escapeHtml(entry.title || 'Modul')} verschieben">
            ${buildModuleSectionTargetOptions(sectionSignature)}
          </select>
          <button type="button" data-archive-action="open-module-stamp" data-source-entry-id="${escapeHtml(entry.id || '')}">Kopieren</button>
        </div>` : ''}
        <div class="card-corner"></div><div class="card-corner-bl"></div>`;
      if (usePriorityImage) priorityCardImageBudget--;
      grid.appendChild(card);
    });
    grid.insertAdjacentHTML('beforeend', renderArchiveSectionMoreControl(section, filteredEntries, visibleEntries, { searchActive: !!_archiveSearchNeedle }));
  });

  // Charaktere Sektion
  const charBlock = document.createElement('div');
  charBlock.className = 'section-block visible';
  charBlock.dataset.tab = 'Charaktere';
  charBlock.dataset.sectionTheme = 'charaktere';
  charBlock.dataset.hasMatches = _archiveSearchNeedle ? 'false' : 'true';
  charBlock.innerHTML = `
    <div class="section-header"><span class="section-title"><span>Charaktere</span></span></div>
    <div class="section-kicker">Personenregister, Porträts und Rollenprofile des Almanachs.</div>
    <div class="char-subtabs-bar" id="char-subtabs-bar"></div>
    <div class="char-grid" id="char-grid"></div>`;
  main.appendChild(charBlock);
  _archiveEntryMatchCount = entryMatchCount;
  _archiveEntrySectionMatchCount = sectionMatchCount;
  _archiveSectionMatchCount = sectionMatchCount + (charBlock.dataset.hasMatches !== 'false' ? 1 : 0);
  switchTab(_activeTab);
  updateArchiveSearchUI();

  if (refocusSearch) {
    const nextInput = document.getElementById('archive-search-input');
    if (nextInput) {
      nextInput.focus({ preventScroll: true });
      if (searchSelectionStart !== null && searchSelectionEnd !== null) {
        nextInput.setSelectionRange(searchSelectionStart, searchSelectionEnd);
      }
    }
  }
  loadCharacters();
}

function initPage() {
  if (_appInitialized) return;
  _appInitialized = true;
  document.addEventListener('click', handleArchiveActionClick);
  document.addEventListener('change', handleArchiveActionChange);
  document.addEventListener('keydown', handleArchiveActionKeydown);
  document.addEventListener('pointerover', handleArchiveEntryPreload);
  document.addEventListener('focusin', handleArchiveEntryPreload);
  cleanupLocalAlmanachStorage();
  clearTransientSearchInputs();
  loadModuleStore();
  renderAll();
  bindInlineModuleLivePreviewSync();
  clearArchiveSearchOnStartup();
  clearTransientSearchInputsAfterBrowserRestore();
  setupModuleStoreRemoteSync();
  applyArchiveTheme(_activeTab);
  loadSidebarFeed();
}

function renderStaticCommentSequence(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return '';
  return blocks.map((block, index) => {
    const divider = index > 0
      ? `<div class="comment-divider"><span class="comment-divider-icon">✦</span></div>`
      : '';

    if (block?.narrator) {
      const text = String(block.text || '').trim();
      if (!text) return '';
      return `
        ${divider}
        <div class="comment-narrator">
          <div class="comment-narrator-text">${parseCommentMarkup(text)}</div>
        </div>`;
    }

    const name = String(block?.name || '').trim();
    const title = String(block?.title || '').trim();
    const text = String(block?.text || '').trim();
    if (!name && !text) return '';

    const side = String(block?.side || 'left').trim() === 'right' ? 'right' : 'left';
    const safeName = escapeHtml(name || 'Unbekannt');
    const safeTitle = escapeHtml(title);
    const portraitSrc = sanitizeImageSrc(block?.portrait || '');
    const portrait = portraitSrc
      ? `<img class="comment-portrait" src="${portraitSrc}" alt="${safeName}" loading="lazy" decoding="async">`
      : `<div class="comment-portrait-placeholder">${getInitialChar(name)}</div>`;

    return `
      ${divider}
      <div class="comment-entry ${side}">
        ${portrait}
        <div class="comment-content">
          <div class="comment-char-header">
            <div class="comment-char-name">${safeName}</div>
            ${title ? `<div class="comment-char-title">${safeTitle}</div>` : ''}
          </div>
          <div class="comment-body">
            <span class="comment-quote-mark">"</span><span class="comment-text">${parseCommentMarkup(text)}</span>
          </div>
        </div>
      </div>`;
  }).filter(Boolean).join('');
}
