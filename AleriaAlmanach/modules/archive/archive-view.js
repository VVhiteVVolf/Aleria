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

function invalidateArchiveSearchCache() {
  _archiveEntrySearchCache.clear();
}

function getSectionThemeMeta(sectionKey) {
  return SECTION_THEME_META[sectionKey] || SECTION_THEME_META.Archive;
}

function getThemeMetaForTab(tab) {
  if (tab === 'Alle') return SECTION_THEME_META.Archive;
  if (tab === 'Charaktere') return SECTION_THEME_META.Charaktere;
  const section = getValidSections().find(item => (item.tab || item.key) === tab);
  return section ? getSectionThemeMeta(section.key) : SECTION_THEME_META.Archive;
}

function getThemeMetaForEntry(entry) {
  if (!entry?.id) return SECTION_THEME_META.Archive;
  const found = findCurrentSectionByEntryId(entry.id);
  return found ? getSectionThemeMeta(found.section.key) : SECTION_THEME_META.Archive;
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
    switchTab(trigger.dataset.tab || 'Alle');
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
  if (action === 'create-module-section') {
    event.preventDefault();
    createModuleSectionFromPrompt();
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

  const hasVisibleSections = !!document.querySelector('#main-content .section-block.visible');
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

function switchTab(tab) {
  _activeTab = tab;
  document.querySelectorAll('.gallery-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.section-block').forEach(block => {
    const blockTab = block.dataset.tab;
    const hasMatches = block.dataset.hasMatches !== 'false';
    const show = hasMatches && (tab === 'Alle' || blockTab === tab);
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

  // Build tab buttons
  tabOrder.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = 'gallery-tab-btn' + (tab === 'Alle' ? ' active' : '');
    btn.dataset.tab = tab;
    btn.dataset.archiveAction = 'switch-tab';
    btn.textContent = tab;
    tabsNav.appendChild(btn);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'gallery-tab-btn gallery-tab-add';
  addBtn.type = 'button';
  addBtn.textContent = '+ Modul';
  addBtn.title = 'Neues Modul anlegen';
  addBtn.dataset.archiveAction = 'new-module';
  addBtn.setAttribute('aria-label', 'Neues Modul anlegen');
  tabsNav.appendChild(addBtn);

  const importBtn = document.createElement('button');
  importBtn.className = 'gallery-tab-btn gallery-tab-add';
  importBtn.type = 'button';
  importBtn.textContent = 'Import';
  importBtn.title = 'Modul importieren, exportieren oder Backup verwalten';
  importBtn.dataset.archiveAction = 'import-module';
  importBtn.setAttribute('aria-label', 'Modul importieren, exportieren oder Backup verwalten');
  tabsNav.appendChild(importBtn);

  const sectionBtn = document.createElement('button');
  sectionBtn.className = 'gallery-tab-btn gallery-tab-add';
  sectionBtn.type = 'button';
  sectionBtn.textContent = '+ Reiter';
  sectionBtn.title = 'Neuen großen Modul-Reiter erstellen';
  sectionBtn.dataset.archiveAction = 'create-module-section';
  sectionBtn.setAttribute('aria-label', 'Neuen großen Modul-Reiter erstellen');
  tabsNav.appendChild(sectionBtn);

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

  // Build section blocks
  sections.forEach(section => {
    const filteredEntries = section.entries.filter(entry => matchesArchiveSearch(buildEntrySearchText(entry, section)));
    entryMatchCount += filteredEntries.length;
    const showEmptySection = !_archiveSearchNeedle && !section.entries.length;
    if (filteredEntries.length || showEmptySection) sectionMatchCount++;
    const theme = getSectionThemeMeta(section.key);
    const block = document.createElement('div');
    block.className = 'section-block visible';
    block.dataset.tab = section.tab || section.key;
    block.dataset.sectionTheme = theme.slug;
    block.dataset.hasMatches = filteredEntries.length || showEmptySection ? 'true' : 'false';
    block.innerHTML = `
      <div class="section-header"><span class="section-title"><span>${escapeHtml(section.key)}</span></span></div>
      <div class="section-kicker">${escapeHtml(section.desc || section.tab || '')}</div>
      <div class="card-grid"></div>`;
    main.appendChild(block);
    const grid = block.querySelector('.card-grid');
    if (showEmptySection) {
      const hint = document.createElement('div');
      hint.className = 'archive-section-empty-hint';
      hint.textContent = 'Noch keine Module in diesem Reiter.';
      grid.appendChild(hint);
    }
    filteredEntries.forEach((entry, i) => {
      const sectionSignature = makeSectionSignature(section);
      const card = document.createElement('div');
      card.className = 'entry-card' + (entry.locked ? ' card-locked' : '');
      card.style.animationDelay = `${i * 0.07}s`;
      card.dataset.searchKind = 'entry';
      card.dataset.archiveAction = 'open-entry';
      card.dataset.entryId = entry.id || '';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${entry.title} öffnen`);
      const usePriorityImage = !!entry.image && priorityCardImageBudget > 0;
      const imageLoadingAttrs = usePriorityImage
        ? 'loading="eager" decoding="async" fetchpriority="high"'
        : 'loading="lazy" decoding="async" fetchpriority="low"';
      card.innerHTML = `
        <div class="card-image-wrap">
          ${entry.image ? `<img src="${sanitizeImageSrc(entry.image)}" alt="${escapeHtml(entry.title)}" ${imageLoadingAttrs}>` : `<div class="card-placeholder-inner">${escapeHtml(entry.icon || '')}</div>`}
          <div class="card-image-overlay"></div>
          ${entry.locked ? `<div class="lock-icon">🔒</div>` : ''}
          <div class="card-label"><h3>${escapeHtml(entry.title)}</h3><div class="card-type-tag">${escapeHtml(entry.type)}</div></div>
        </div>
        <div class="entry-card-admin">
          <label>Verschieben nach</label>
          <select data-archive-action="move-entry-section" data-entry-id="${escapeHtml(entry.id || '')}" aria-label="${escapeHtml(entry.title || 'Modul')} verschieben">
            ${buildModuleSectionTargetOptions(sectionSignature)}
          </select>
        </div>
        <div class="card-corner"></div><div class="card-corner-bl"></div>`;
      if (usePriorityImage) priorityCardImageBudget--;
      grid.appendChild(card);
    });
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
