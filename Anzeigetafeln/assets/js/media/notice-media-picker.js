(function () {
  'use strict';
  const model = () => window.TafelNoticeMediaModel;
  const esc = value => window.TafelRuntime.esc(value);
  const pageSize = 60;
  let dialog, onSelect, opener, activeTab = 'icons', visibleCount = pageSize;
  let characters = null, characterLoad = null, characterWarning = '';
  let shown = [], session = 0;

  function field(source, key, label, personIndex) {
    const item = model().selection(source, key);
    return `<div class="notice-media-field">
      ${model().render(source, key, { className: 'notice-media-field-preview', label, fit: 'contain' })}
      <div><span class="lml">${esc(label)}</span><span class="notice-media-field-name">${esc(item.name || (item.src ? 'Eigenes Bild' : 'Platzhalter'))}</span>
      <button type="button" class="s-btn s-cancel" data-action="notice-media-open" data-media-field="${esc(key)}"${personIndex === undefined ? '' : ` data-person-index="${personIndex}"`}>Bild wählen</button></div>
    </div>`;
  }

  function ensureDialog() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'notice-media-dialog';
    dialog.setAttribute('aria-labelledby', 'notice-media-title');
    dialog.innerHTML = `<header class="notice-media-head"><div><span class="notice-eyebrow">Bilder & Zeichen</span><h2 id="notice-media-title">Bild wählen</h2></div><button type="button" data-media-action="close" aria-label="Bildauswahl schließen">×</button></header>
      <nav class="notice-media-tabs" aria-label="Bildquelle">
        <button type="button" data-media-action="tab" data-tab="icons">Iconverzeichnis</button>
        <button type="button" data-media-action="tab" data-tab="characters">Charaktere</button>
        <button type="button" data-media-action="tab" data-tab="custom">Upload / Bildlink</button>
      </nav>
      <div class="notice-media-catalog"><div class="notice-media-filters"><input type="search" aria-label="Bilder durchsuchen" placeholder="Name oder Familie suchen …"><select aria-label="Ordner oder Familie"><option value="">Alle</option></select></div>
      <p class="notice-media-status" role="status"></p><div class="notice-media-results"></div><button class="notice-media-more" type="button" data-media-action="more">Weitere anzeigen</button></div>
      <div class="notice-media-custom" hidden><label for="notice-media-url">Bildlink · auch Imgur-Einzelbilder</label><input id="notice-media-url" type="url" placeholder="https://i.imgur.com/… oder Bildpfad"><button type="button" data-media-action="url">Bildlink übernehmen</button>
      <span class="notice-media-divider">oder</span><label class="notice-upload">Bild vom Gerät hochladen<input type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label><p>Das Bild wird verkleinert und mit dem Aushang gespeichert. GIFs werden als Standbild übernommen.</p></div>
      <p class="notice-media-error" role="alert"></p>
      <footer class="notice-media-foot"><button type="button" data-media-action="clear">Platzhalter verwenden</button><button type="button" data-media-action="close">Abbrechen</button></footer>`;
    document.body.append(dialog);
    dialog.addEventListener('click', handleClick);
    dialog.addEventListener('input', event => { if (event.target.type === 'search') { visibleCount = pageSize; renderResults(); } });
    dialog.addEventListener('change', event => {
      if (event.target.tagName === 'SELECT') { visibleCount = pageSize; renderResults(); }
      if (event.target.type === 'file') upload(event.target.files?.[0]);
    });
    dialog.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); close(); });
    dialog.addEventListener('keydown', event => { if (event.key === 'Escape') event.stopPropagation(); });
  }

  function iconItems() {
    const icons = typeof ALERIA_ICON_DIRECTORY === 'undefined' ? [] : ALERIA_ICON_DIRECTORY;
    return [...icons.map(item => ({ kind: 'icon', name: item.name.replace(/_/g, ' '), src: item.path, group: item.folder || 'IconOrdner' })),
      ...(window.KARTO_MEDIA_ASSETS || []).map(item => ({ kind: 'icon', name: item.name, src: item.url, group: item.source + ' / ' + item.group }))]
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }

  function items() { return activeTab === 'characters' ? characters || [] : iconItems(); }

  function renderResults() {
    const needle = model().searchText(dialog.querySelector('[type="search"]').value);
    const group = dialog.querySelector('select').value;
    const matches = items().filter(item => (!group || item.group === group) && model().searchText(`${item.name} ${item.group}`).includes(needle));
    shown = matches.slice(0, visibleCount);
    dialog.querySelector('.notice-media-results').classList.toggle('is-characters', activeTab === 'characters');
    dialog.querySelector('.notice-media-results').innerHTML = shown.map((item, index) => `<button type="button" class="notice-media-choice" data-media-action="select" data-index="${index}">
      ${model().render({ image: item.src }, 'image', { label: item.name, fit: activeTab === 'characters' ? 'cover' : 'contain', symbol: '♙' })}
      <span><strong>${esc(item.name)}</strong><small>${esc(item.group)}${activeTab === 'characters' && !item.src ? ' · ohne Porträt' : ''}</small></span></button>`).join('');
    dialog.querySelector('.notice-media-status').textContent = activeTab === 'characters' && !characters
      ? 'Stammbäume werden geladen …'
      : `${matches.length ? `${shown.length} von ${matches.length}` : 'Keine passenden'} ${activeTab === 'characters' ? 'Charaktere' : 'Bilder'} · alphabetisch sortiert${activeTab === 'characters' ? characterWarning : ''}`;
    dialog.querySelector('.notice-media-more').hidden = shown.length >= matches.length;
  }

  function renderGroups() {
    dialog.querySelector('select').innerHTML = `<option value="">${activeTab === 'characters' ? 'Alle Familien' : 'Alle Ordner'}</option>` + [...new Set(items().map(item => item.group))].sort((a, b) => a.localeCompare(b, 'de')).map(group => `<option>${esc(group)}</option>`).join('');
  }

  async function loadCharacters() {
    if (!characterLoad) {
      characterLoad = import('./notice-character-catalog.mjs').then(module => module.loadCharacters()).then(result => {
        characters = result.items;
        characterWarning = result.incomplete ? ' · Einzelne Online-Familien fehlen; verfügbare Stammbäume werden angezeigt.' : '';
      }).catch(() => {
        characters = [];
        characterWarning = ' · Stammbäume konnten nicht geladen werden. Bitte die Auswahl erneut öffnen.';
        characterLoad = null;
      });
    }
    await characterLoad;
    if (dialog.open && activeTab === 'characters') { renderGroups(); renderResults(); }
  }

  function tab(name) {
    activeTab = name;
    visibleCount = pageSize;
    dialog.querySelector('[type="search"]').value = '';
    dialog.querySelector('.notice-media-error').textContent = '';
    dialog.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tab === name)));
    dialog.querySelector('.notice-media-catalog').hidden = name === 'custom';
    dialog.querySelector('.notice-media-custom').hidden = name !== 'custom';
    if (name !== 'custom') { renderGroups(); renderResults(); }
    if (name === 'characters' && (!characters || !characterLoad)) loadCharacters();
  }

  function close() {
    session++;
    dialog.close();
    onSelect = null;
    opener?.focus();
  }

  function choose(item) {
    const callback = onSelect;
    close();
    callback?.(item);
  }

  async function upload(file) {
    if (!file) return;
    const token = session;
    const error = dialog.querySelector('.notice-media-error');
    error.textContent = 'Bild wird vorbereitet …';
    try {
      const item = await window.TafelNoticeMediaUpload.read(file);
      if (token === session && dialog.open) choose(item);
    } catch (reason) { if (token === session) error.textContent = reason.message; }
  }

  function handleClick(event) {
    const button = event.target.closest('[data-media-action]');
    if (!button) return;
    const action = button.dataset.mediaAction;
    if (action === 'close') close();
    if (action === 'tab') tab(button.dataset.tab);
    if (action === 'more') { visibleCount += pageSize; renderResults(); }
    if (action === 'select') choose(shown[Number(button.dataset.index)]);
    if (action === 'clear') choose(null);
    if (action === 'url') {
      const src = model().imageUrl(dialog.querySelector('#notice-media-url').value);
      if (src) choose({ kind: 'url', src, name: 'Eigenes Bild' });
      else dialog.querySelector('.notice-media-error').textContent = 'Bitte einen gültigen Bildlink angeben. Imgur-Alben benötigen den Link zu einem einzelnen Bild.';
    }
  }

  function open({ value = '', onSelect: callback, title = 'Bild wählen' }) {
    ensureDialog();
    session++;
    opener = document.activeElement;
    onSelect = callback;
    dialog.querySelector('h2').textContent = title;
    dialog.querySelector('#notice-media-url').value = /^data:/.test(value) ? '' : value;
    dialog.querySelector('[type="file"]').value = '';
    tab('icons');
    dialog.showModal();
    dialog.querySelector('[type="search"]').focus();
  }

  window.TafelNoticeMediaPicker = Object.freeze({ field, open });
})();
