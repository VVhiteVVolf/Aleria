(function () {
  const PAGE_SIZE = 48;
  const FAVORITES_KEY = 'karto.media.favorites';
  const RECENT_KEY = 'karto.media.recent';
  const labels = {
    all: 'Alles',
    marker: 'Ortszeichen & Pins',
    crest: 'Hauswappen',
    region: 'Orts- & Regionsbanner',
    favorites: 'Favoriten',
    recent: 'Zuletzt benutzt',
  };

  let root = null;
  let target = 'image';
  let callback = null;
  let activeTab = 'all';
  let query = '';
  let group = '';
  let visibleCount = PAGE_SIZE;

  function readList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function writeList(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* optional convenience state */ }
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
  }

  function normalizedAsset(asset, fallback = {}) {
    if (!asset?.url) return null;
    return {
      id: asset.id || asset.url,
      name: asset.name || fallback.name || 'Unbenanntes Bild',
      url: asset.url,
      kind: asset.kind || fallback.kind || 'marker',
      group: asset.group || fallback.group || 'Ohne Gruppe',
      source: asset.source || fallback.source || 'Karten-Marker-Katalog',
    };
  }

  function searchableUrl(url) {
    try { return decodeURIComponent(url); } catch { return url; }
  }

  function assets() {
    const generated = (window.KARTO_MEDIA_ASSETS || []).map(item => normalizedAsset(item)).filter(Boolean);
    const markers = (window.KartoRuntime?.state()?.markerCatalog || [])
      .map(item => normalizedAsset(item, { kind: 'marker', source: 'Karten-Marker-Katalog' }))
      .filter(Boolean);
    const byUrl = new Map();
    [...generated, ...markers].forEach(item => {
      let key = item.url;
      try { key = new URL(item.url, document.baseURI).href; } catch { /* keep the original key */ }
      if (!byUrl.has(key)) byUrl.set(key, item);
    });
    return [...byUrl.values()];
  }

  function allowedKinds() {
    if (target === 'marker') return new Set(['marker']);
    if (target === 'crest') return new Set(['crest', 'region']);
    if (target === 'banner') return new Set(['region', 'crest']);
    return new Set(['marker', 'crest', 'region']);
  }

  function filteredAssets() {
    const favoriteUrls = new Set(readList(FAVORITES_KEY));
    const recentUrls = readList(RECENT_KEY);
    const recentOrder = new Map(recentUrls.map((url, index) => [url, index]));
    const needle = query.trim().toLocaleLowerCase('de');
    let list = assets().filter(item => allowedKinds().has(item.kind));
    if (activeTab === 'favorites') list = list.filter(item => favoriteUrls.has(item.url));
    else if (activeTab === 'recent') list = list.filter(item => recentOrder.has(item.url)).sort((a, b) => recentOrder.get(a.url) - recentOrder.get(b.url));
    else if (activeTab !== 'all') list = list.filter(item => item.kind === activeTab);
    if (group) list = list.filter(item => item.group === group);
    if (needle) {
      list = list.filter(item => `${item.name} ${item.group} ${item.source} ${searchableUrl(item.url)}`.toLocaleLowerCase('de').includes(needle));
    }
    return list;
  }

  function ensureRoot() {
    if (root) return root;
    root = document.createElement('div');
    root.className = 'karto-media-library';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Karten-Mediathek');
    root.innerHTML = `
      <section class="karto-media-dialog">
        <header class="karto-media-head">
          <div>
            <h2>Karten-Mediathek</h2>
            <p>Wappen, Ortszeichen, Map-Pins und Banner direkt aus dem Projekt wählen.</p>
          </div>
          <button class="karto-media-close" type="button" data-media-action="close" aria-label="Schließen">✕</button>
        </header>
        <div class="karto-media-tools">
          <input class="karto-media-search" type="search" placeholder="Name, Ordner oder Quelle suchen …" data-media-role="search"/>
          <select class="karto-media-group" data-media-role="group"><option value="">Alle Ordner</option></select>
        </div>
        <nav class="karto-media-tabs" data-media-role="tabs"></nav>
        <div class="karto-media-grid" data-media-role="grid"></div>
        <footer class="karto-media-foot">
          <span data-media-role="count"></span>
          <button class="karto-media-more" type="button" data-media-action="more">Weitere anzeigen</button>
        </footer>
      </section>`;
    document.body.appendChild(root);
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onInput);
    return root;
  }

  function availableTabs() {
    const kinds = allowedKinds();
    return ['all', ...['marker', 'crest', 'region'].filter(kind => kinds.has(kind)), 'favorites', 'recent'];
  }

  function renderTabs() {
    const container = root.querySelector('[data-media-role="tabs"]');
    container.innerHTML = availableTabs().map(tab => `
      <button class="karto-media-tab${activeTab === tab ? ' is-active' : ''}" type="button" data-media-action="tab" data-media-tab="${tab}">${labels[tab]}</button>
    `).join('');
  }

  function renderGroups() {
    const select = root.querySelector('[data-media-role="group"]');
    const groups = [...new Set(assets().filter(item => allowedKinds().has(item.kind)).map(item => item.group))].sort((a, b) => a.localeCompare(b, 'de'));
    select.innerHTML = `<option value="">Alle Ordner</option>${groups.map(item => `<option value="${esc(item)}"${group === item ? ' selected' : ''}>${esc(item)}</option>`).join('')}`;
  }

  function renderGrid() {
    const list = filteredAssets();
    const shown = list.slice(0, visibleCount);
    const favorites = new Set(readList(FAVORITES_KEY));
    const grid = root.querySelector('[data-media-role="grid"]');
    grid.innerHTML = shown.length ? shown.map(item => `
      <article class="karto-media-card">
        <button class="karto-media-favorite${favorites.has(item.url) ? ' is-active' : ''}" type="button" data-media-action="favorite" data-media-url="${esc(item.url)}" title="Favorit umschalten">★</button>
        <button class="karto-media-select" type="button" data-media-action="select" data-media-url="${esc(item.url)}">
          <span class="karto-media-thumb"><img src="${esc(item.url)}" alt="" loading="lazy"/></span>
          <span class="karto-media-meta">
            <span class="karto-media-name" title="${esc(item.name)}">${esc(item.name)}</span>
            <span class="karto-media-source" title="${esc(item.group)}">${esc(item.group)}</span>
          </span>
        </button>
      </article>`).join('') : '<div class="karto-media-empty">Keine passenden Bilder gefunden.</div>';
    root.querySelector('[data-media-role="count"]').textContent = `${Math.min(shown.length, list.length)} von ${list.length} Bildern`;
    root.querySelector('[data-media-action="more"]').hidden = shown.length >= list.length;
  }

  function render() {
    renderTabs();
    renderGroups();
    renderGrid();
  }

  function close() {
    if (!root) return;
    root.classList.remove('is-open');
    callback = null;
  }

  function remember(url) {
    writeList(RECENT_KEY, [url, ...readList(RECENT_KEY).filter(item => item !== url)].slice(0, 30));
  }

  function onClick(event) {
    if (event.target === root) { close(); return; }
    const control = event.target.closest('[data-media-action]');
    if (!control) return;
    const action = control.dataset.mediaAction;
    if (action === 'close') close();
    if (action === 'tab') {
      activeTab = control.dataset.mediaTab || 'all';
      group = '';
      visibleCount = PAGE_SIZE;
      render();
    }
    if (action === 'more') {
      visibleCount += PAGE_SIZE;
      renderGrid();
    }
    if (action === 'favorite') {
      const url = control.dataset.mediaUrl;
      const current = readList(FAVORITES_KEY);
      writeList(FAVORITES_KEY, current.includes(url) ? current.filter(item => item !== url) : [...current, url]);
      renderGrid();
    }
    if (action === 'select') {
      const url = control.dataset.mediaUrl || '';
      remember(url);
      const onSelect = callback;
      close();
      onSelect?.(url);
    }
  }

  function onInput(event) {
    if (event.target.matches('[data-media-role="search"]')) query = event.target.value;
    if (event.target.matches('[data-media-role="group"]')) group = event.target.value;
    visibleCount = PAGE_SIZE;
    renderGrid();
  }

  function open(options = {}) {
    ensureRoot();
    target = options.target || 'image';
    callback = typeof options.onSelect === 'function' ? options.onSelect : null;
    activeTab = target === 'marker' ? 'marker' : target === 'crest' ? 'crest' : target === 'banner' ? 'region' : 'all';
    query = '';
    group = '';
    visibleCount = PAGE_SIZE;
    root.querySelector('[data-media-role="search"]').value = '';
    render();
    root.classList.add('is-open');
    setTimeout(() => root.querySelector('[data-media-role="search"]')?.focus(), 30);
  }

  window.KartoMediaLibrary = { open, close };
})();
