// Owns category navigation only. The existing register owns search, sorting,
// profile opening and manual assignment.
const AleriaCharacterCategoryBrowser = (() => {
  let selected = null;
  let directoryKind = '';

  function reset() { selected = null; }
  function hasSelection() { return !!selected; }

  function bucketsFor(chars) {
    const mode = getCharacterRegisterViewMode();
    if (mode === 'categories') return AleriaCharacterCategories.buildBuckets(chars);
    const buckets = mode === 'collections' ? buildCharacterGroupBuckets(chars) : buildCharacterRegisterFacetBuckets(chars);
    return buckets.map(bucket => ({ ...bucket, key: String(bucket.key || bucket.label), kind: mode }));
  }

  function filterEntries(chars) {
    if (!selected || _activeCharTab !== 'Alle') return chars;
    const matches = bucketsFor(chars).find(bucket => bucket.key === selected.key)?.chars || [];
    const ids = new Set(matches.map(char => char.id));
    return chars.filter(char => ids.has(char.id));
  }

  function select(key) {
    const bucket = bucketsFor(getVisibleCharacterRecords()).find(item => item.key === key);
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
    return `<button type="button" class="char-category-tile" data-character-category-action="select"
      data-category-key="${escapeHtml(bucket.key)}" aria-label="${escapeHtml(bucket.label)}: ${bucket.chars.length} Figuren anzeigen">
      <span class="char-category-emblem" aria-hidden="true">${emblem
        ? `<img src="${escapeHtml(emblem)}" alt="" loading="lazy">`
        : escapeHtml(bucket.label.charAt(0))}</span>
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
        const cards = document.createElement('div');
        cards.className = 'char-category-characters';
        visible.forEach(char => cards.appendChild(createCharacterCard(char)));
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
        ${automatic ? `<p>${automatic} Figuren automatisch eingeordnet<br><small>Aus Haus, Stammbaum, Fraktion oder Ort</small></p>` : ''}</div>`;
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
          `<button type="button" data-character-category-action="kind" data-category-kind="${escapeHtml(kind)}"
            aria-pressed="${directoryKind === kind}">${escapeHtml(label)} <span>${count}</span></button>`).join('');
        section.appendChild(navigation);
      }
      for (const [kind, entries] of kinds) {
        if (directoryKind && directoryKind !== kind) continue;
        const group = document.createElement('div');
        group.className = 'char-category-section';
        const heading = AleriaCharacterCategories.kinds[kind]
          || CHARACTER_REGISTER_VIEW_OPTIONS.find(option => option.value === kind)?.label || 'Kategorien';
        group.innerHTML = `<h4>${escapeHtml(heading)} <span>${entries.length}${entries[0].automatic ? ' · automatisch' : ''}</span></h4>
          <div class="char-category-tiles">${entries.map(renderTile).join('')}</div>`;
        section.appendChild(group);
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
      renderCharGrid();
      document.querySelector('#char-grid .char-category-kinds [aria-pressed="true"]')?.focus({ preventScroll: true });
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
