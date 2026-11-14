// Owns category navigation only. The existing register owns search, sorting,
// profile opening and manual assignment.
const AleriaCharacterCategoryBrowser = (() => {
  let selected = null;
  let directoryKind = '';
  let directoryLimit = 24;

  function reset() { selected = null; }
  function hasSelection() { return !!selected; }

  function bucketsFor(chars) {
    const mode = getCharacterRegisterViewMode();
    if (mode === 'categories') return AleriaCharacterCategories.buildBuckets(chars);
    const buckets = mode === 'collections' ? buildCharacterGroupBuckets(chars) : buildCharacterRegisterFacetBuckets(chars);
    return buckets.map(bucket => ({ ...bucket, key: String(bucket.key || bucket.label), kind: mode }));
  }

  function filterEntries(chars) {
    if (!selected?.key || _activeCharTab !== 'Alle') return chars;
    const matches = bucketsFor(chars).find(bucket => bucket.key === selected.key)?.chars || [];
    const ids = new Set(matches.map(char => char.id));
    return chars.filter(char => ids.has(char.id));
  }

  function select(key) {
    const records = typeof AleriaCharacterDirectory !== 'undefined' ? AleriaCharacterDirectory.getVisible() : getVisibleCharacterRecords();
    const bucket = bucketsFor(records).find(item => item.key === key);
    if (!bucket) return;
    if ((bucket.kind === 'collection' || bucket.kind === 'collections') && _charTabs.includes(bucket.label)) {
      selectCharacterTab(bucket.label);
      return;
    }
    selected = { key: bucket.key, label: bucket.label };
    _characterDashboardFilter = '';
    renderCharGrid();
    focusResults();
  }

  function focusResults() {
    const heading = document.querySelector('#char-grid .char-category-results');
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }

  function renderTile(bucket) {
    const emblem = sanitizeImageSrc(bucket.emblem);
    const preview = bucket.chars.slice(0, 3).map(char => char.name || 'Unbenannt').join(', ');
    const iconKey = bucket.kind === 'relevance' ? 'relevance' : bucket.kind;
    return `<button type="button" class="char-category-tile" data-tone="${AleriaCharacterRegisterIcons.tone(iconKey)}" data-character-category-action="select"
      data-category-key="${escapeHtml(bucket.key)}" aria-label="${escapeHtml(bucket.label)}: ${bucket.chars.length} Figuren anzeigen">
      <span class="char-category-emblem" aria-hidden="true">${emblem
        ? `<img src="${escapeHtml(emblem)}" alt="" loading="lazy">`
        : AleriaCharacterRegisterIcons.render(iconKey)}</span>
      <span class="char-category-copy"><strong>${escapeHtml(bucket.label)}</strong><small>${escapeHtml(preview)}</small></span>
      <span class="char-category-count">${bucket.chars.length}<span aria-hidden="true"> →</span></span>
    </button>`;
  }

  function render(grid, chars) {
    if (_charOrganizeMode || _activeCharTab !== 'Alle') return false;
    const hasSearch = hasCharacterRegisterSearch() || !!_archiveSearchNeedle;
    const showResults = selected || hasSearch || _characterDashboardFilter;
    const visible = filterEntries(chars);
    const section = document.createElement('section');
    section.className = 'char-category-browser';
    if (showResults) {
      const labels = [selected?.label, CHARACTER_DASHBOARD_FILTER_LABELS[_characterDashboardFilter], hasSearch ? 'Suchergebnisse' : ''].filter(Boolean);
      section.innerHTML = `<div class="char-category-results" tabindex="-1" role="region" aria-label="Gefilterte Figuren">
        <div><span class="char-category-eyebrow">${escapeHtml(labels.join(' · '))}</span>
          <h3 aria-live="polite">${visible.length} ${visible.length === 1 ? 'Figur' : 'Figuren'}</h3></div>
        <button type="button" data-character-category-action="reset">← Zur Übersicht</button>
      </div>`;
      if (visible.length) {
        const page = AleriaCharacterResultPages.select(visible, ['category', getCharacterRegisterViewMode(), selected?.key || '', _characterRegisterSearch, _archiveSearchNeedle, _characterDashboardFilter]);
        AleriaCharacterResultPages.renderNavigation(section, page);
        const cards = document.createElement('div');
        cards.className = 'char-category-characters';
        page.entries.forEach(char => cards.appendChild(createCharacterCard(char, { compact: true })));
        section.appendChild(cards);
      } else {
        const empty = document.createElement('p');
        empty.className = 'char-category-empty';
        empty.textContent = 'Keine Figuren für diese Auswahl. Ändere die Suche oder kehre zur Übersicht zurück.';
        section.appendChild(empty);
      }
    } else {
      const buckets = bucketsFor(chars);
      const automatic = getCharacterRegisterViewMode() === 'categories'
        ? chars.filter(char => AleriaCharacterCategories.classify(char).automatic).length : 0;
      section.innerHTML = `<div class="char-category-heading"><div><span class="char-category-eyebrow">Kategorien entdecken</span>
        <h3>${buckets.length} Kategorien · ${chars.length} Figuren</h3></div>
        <button class="char-category-show-all" type="button" data-character-category-action="all">Alle Figuren anzeigen →</button></div>`;
      const kinds = new Map();
      buckets.forEach(bucket => {
        if (!kinds.has(bucket.kind)) kinds.set(bucket.kind, []);
        kinds.get(bucket.kind).push(bucket);
      });
      if (!kinds.has(directoryKind)) directoryKind = '';
      if (kinds.size > 1) {
        const navigation = document.createElement('div');
        navigation.className = 'char-category-kinds';
        navigation.setAttribute('role', 'group');
        navigation.setAttribute('aria-label', 'Kategorien eingrenzen');
        navigation.innerHTML = [['', 'Alle Kategorien', buckets.length], ...[...kinds].map(([kind, entries]) =>
          [kind, AleriaCharacterCategories.kinds[kind], entries.length])].map(([kind, label, count]) =>
          `<button type="button" data-character-category-action="kind" data-category-kind="${escapeHtml(kind)}" data-tone="${AleriaCharacterRegisterIcons.tone(kind)}"
            aria-pressed="${directoryKind === kind}">${AleriaCharacterRegisterIcons.render(kind)}${escapeHtml(label)} <span>${count}</span></button>`).join('');
        section.appendChild(navigation);
      }
      const filteredBuckets = directoryKind ? buckets.filter(bucket => bucket.kind === directoryKind) : buckets;
      const shownKeys = new Set(filteredBuckets.slice(0, directoryLimit).map(bucket => bucket.key));
      for (const [kind, entries] of kinds) {
        if (directoryKind && directoryKind !== kind) continue;
        const shown = entries.filter(bucket => shownKeys.has(bucket.key));
        if (!shown.length) continue;
        const group = document.createElement('div');
        group.className = 'char-category-section';
        const heading = AleriaCharacterCategories.kinds[kind]
          || CHARACTER_REGISTER_VIEW_OPTIONS.find(option => option.value === kind)?.label || 'Kategorien';
        group.innerHTML = `<h4>${escapeHtml(heading)} <span>${entries.length}${entries[0].automatic ? ' · automatisch' : ''}</span></h4>
          <div class="char-category-tiles">${shown.map(renderTile).join('')}</div>`;
        section.appendChild(group);
      }
      if (filteredBuckets.length > directoryLimit) {
        const more = document.createElement('button');
        more.className = 'char-category-more'; more.type = 'button';
        more.dataset.characterCategoryAction = 'more';
        more.textContent = `Weitere Kategorien · ${directoryLimit} von ${filteredBuckets.length} sichtbar`;
        section.appendChild(more);
      }
    }
    grid.appendChild(section);
    return true;
  }

  function handleClick(event) {
    const trigger = event.target?.closest?.('[data-character-category-action]');
    if (!trigger || !document.getElementById('char-grid')?.contains(trigger)) return;
    event.preventDefault();
    if (trigger.dataset.characterCategoryAction === 'kind') {
      directoryKind = trigger.dataset.categoryKind || '';
      directoryLimit = 24;
      renderCharGrid();
      document.querySelector('#char-grid .char-category-kinds [aria-pressed="true"]')?.focus({ preventScroll: true });
    }
    if (trigger.dataset.characterCategoryAction === 'more') {
      directoryLimit += 24;
      renderCharGrid();
      document.querySelector('#char-grid .char-category-more')?.focus({ preventScroll: true });
    }
    if (trigger.dataset.characterCategoryAction === 'all') {
      selected = { key: '', label: 'Alle Figuren' };
      _characterDashboardFilter = '';
      renderCharGrid(); focusResults();
    }
    if (trigger.dataset.characterCategoryAction === 'select') select(trigger.dataset.categoryKey);
    if (trigger.dataset.characterCategoryAction === 'reset') {
      resetCharacterRegisterFilters();
      renderCharSubtabs();
      renderCharGrid();
      document.querySelector('#char-grid [data-character-register-action="search"]')?.focus();
    }
  }

  document.addEventListener('click', handleClick);
  return Object.freeze({ render, reset, hasSelection, filterEntries, focusResults, select });
})();
