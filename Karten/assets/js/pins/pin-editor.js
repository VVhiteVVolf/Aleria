(function () {
  const runtime = window.KartoRuntime;
  const TABS = ['basis', 'zugehoerigkeit', 'medien', 'infotabelle', 'beschreibung'];
  let activePinId = null;
  let activeTab = 'basis';
  let session = null;

  function state() { return runtime.state(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function currentPin() { return session?.draft() || null; }
  function actualPin() { return state().pins.find(item => item.id === activePinId) || null; }
  function isOpen() { return !!session && !!document.getElementById('sidebar')?.classList.contains('editor-fullscreen'); }

  function setHeader() {
    const title = document.getElementById('sb-title');
    const mode = document.getElementById('sb-mode-lbl');
    const actions = document.getElementById('sb-header-actions');
    if (title) title.textContent = session?.isNew() ? 'Neuen Pin anlegen' : 'Pin bearbeiten';
    if (mode) mode.textContent = 'Editormodus';
    if (actions) actions.hidden = false;
    const publish = document.getElementById('sb-publish');
    if (publish) publish.hidden = !window.KartoPublish?.isConfigured() || !window.openPublishModal || !document.getElementById('publish-mo');
    updateStatus();
  }

  function updateStatus() {
    const status = document.getElementById('sb-editor-status');
    if (!status || !session) return;
    const dirty = session.isDirty();
    status.textContent = dirty ? 'Nicht übernommen' : 'Keine offenen Eingaben';
    status.classList.toggle('is-dirty', dirty);
  }

  function open(pinId, options = {}) {
    const pin = state().pins.find(item => item.id === pinId);
    if (!pin || !window.KartoPinDraft) return;
    activePinId = pinId;
    activeTab = 'basis';
    session = window.KartoPinDraft.create(pin, { isNew: options.isNew === true });
    document.getElementById('sidebar').classList.add('open');
    runtime.openEditorShell?.('pin', pin.id);
    setHeader();
    renderSidebarEdit();
  }

  function discardNewPlaceholder() {
    if (!session?.isNew()) return;
    const index = state().pins.findIndex(item => item.id === activePinId);
    if (index >= 0) state().pins.splice(index, 1);
    runtime.renderPins();
  }

  function close(options = {}) {
    if (!session) {
      runtime.closeEditorShell?.();
      return true;
    }
    const discard = options.discard === true || options.force === true;
    if (session.isDirty() && !discard && !confirm('Nicht übernommene Änderungen verwerfen?')) return false;
    if (!options.keepNew) discardNewPlaceholder();
    runtime.closeEditorShell?.();
    activePinId = null;
    session = null;
    activeTab = 'basis';
    return true;
  }

  function tabButton(id, label) {
    return `<button type="button" class="pin-editor-tab${activeTab === id ? ' is-active' : ''}" data-action="switch-pin-editor-tab" data-editor-tab="${id}">${label}</button>`;
  }

  function panel(id, content) {
    return `<section class="pin-editor-panel" data-editor-panel="${id}"${activeTab === id ? '' : ' hidden'}>${content}</section>`;
  }

  function imagePreview(url, fallback) {
    return url ? `<img src="${runtime.esc(url)}" alt=""/>` : `<span aria-hidden="true">${fallback}</span>`;
  }

  function mediaField({ role, label, url, link, fallback, hint }) {
    return `
      <div class="pin-editor-media-field">
        <div class="pin-editor-media-preview">${imagePreview(url, fallback)}</div>
        <div class="pin-editor-media-content">
          <label class="e-lbl" for="sb-${role}">${label}</label>
          ${hint ? `<div class="e-hint">${hint}</div>` : ''}
          <input class="e-inp" id="sb-${role}" value="${runtime.esc(url || '')}" placeholder="Bildadresse oder Projektpfad …"/>
          <input class="e-inp" id="sb-${role}link" value="${runtime.esc(link || '')}" placeholder="Link beim Anklicken (optional) …"/>
          <div class="pin-editor-media-actions">
            <button type="button" class="pin-editor-media-button" data-action="open-pin-media-library" data-media-target="${role}">Mediathek öffnen</button>
            <button type="button" class="pin-editor-media-button" data-action="preview-pin-editor-image" data-preview-target="${role}">Vorschau laden</button>
            ${url ? `<button type="button" class="pin-editor-media-button" data-action="clear-pin-media" data-media-target="${role}">Entfernen</button>` : ''}
          </div>
        </div>
      </div>`;
  }

  function renderSidebarEdit() {
    const pin = currentPin();
    if (!pin) return;
    const body = document.getElementById('sb-body');
    const footer = document.getElementById('sb-footer');
    const esc = runtime.esc;
    const rows = (pin.table || []).map((row, index) => `
      <div class="tbl-row">
        <input class="tk" value="${esc(row.k)}" placeholder="Bezeichnung" data-c="k"/>
        <input class="tv" value="${esc(row.v)}" placeholder="Wert" data-c="v"/>
        <button type="button" class="tbl-rm" data-action="delete-pin-table-row" data-row-index="${index}" aria-label="Zeile entfernen">✕</button>
      </div>`).join('');

    body.innerHTML = `
      <div class="se-inner">
        <nav class="pin-editor-tabs" aria-label="Bereiche des Pin-Editors">
          ${tabButton('basis', 'Basis')}
          ${tabButton('zugehoerigkeit', 'Zugehörigkeit')}
          ${tabButton('medien', 'Medien')}
          ${tabButton('infotabelle', 'Infotabelle')}
          ${tabButton('beschreibung', 'Beschreibung')}
        </nav>

        ${panel('basis', `
          <h3 class="pin-editor-panel-title">Grunddaten & Kartenzeichen</h3>
          <div class="e-row">
            <label class="e-lbl" for="sb-title-inp">Name / Titel</label>
            <input class="e-inp" id="sb-title-inp" value="${esc(pin.title)}" maxlength="80" placeholder="Name des Ortes …"/>
          </div>
          <div class="e-row">
            <label class="e-lbl" for="sb-cat">Kategorie</label>
            <select class="e-sel" id="sb-cat">
              ${state().cats.map(cat => `<option value="${esc(cat.id)}"${(pin.cat || state().cats[0]?.id) === cat.id ? ' selected' : ''}>${esc(cat.label)}</option>`).join('')}
            </select>
          </div>
          <div class="pin-editor-media-field">
            <div class="pin-editor-media-preview">${imagePreview(pin.pinMarker, '📍')}</div>
            <div class="pin-editor-media-content">
              <span class="e-lbl">Kartenzeichen / Map-Pin</span>
              <div class="e-hint">Wähle ein Zeichen aus dem Kartenordner oder dem bisherigen Marker-Katalog.</div>
              <div class="pin-editor-media-actions">
                <button type="button" class="pin-editor-media-button" data-action="open-pin-media-library" data-media-target="marker">Mediathek öffnen</button>
                ${pin.pinMarker ? `<button type="button" class="pin-editor-media-button" data-action="clear-pin-marker">Entfernen</button>` : ''}
              </div>
              ${pin.pinMarker ? `
                <label class="e-lbl" for="sb-pinmarker-scale">Größe <span id="sb-pinmarker-scale-val">${Math.round((pin.pinMarkerScale || 1) * 100)}%</span></label>
                <input type="range" id="sb-pinmarker-scale" min="40" max="300" value="${Math.round((pin.pinMarkerScale || 1) * 100)}" data-input-action="set-pin-marker-scale"/>
              ` : ''}
            </div>
          </div>
          <label class="e-check-row">
            <input type="checkbox" id="sb-secret" ${pin.secret ? 'checked' : ''}/>
            <span class="e-check-lbl">🔒 Geheimer Pin</span>
          </label>
        `)}

        ${panel('zugehoerigkeit', `
          <h3 class="pin-editor-panel-title">Herrschaft, Region & Fraktion</h3>
          <p class="pin-editor-help">Die feste Herrschaft kommt aus der Kartenverwaltung; zusätzliche Angaben bleiben frei formulierbar.</p>
          <div class="e-row">
            <label class="e-lbl" for="sb-dominion">Herrschaft</label>
            <select class="e-sel" id="sb-dominion">
              <option value="">— Keine —</option>
              ${runtime.orderedDominions().map(({ dominion, depth }) => `<option value="${esc(dominion.id)}"${pin.dominionId === dominion.id ? ' selected' : ''}>${'  '.repeat(depth)}${depth ? '↳ ' : ''}${esc(dominion.name)}</option>`).join('')}
            </select>
          </div>
          <div class="e-row">
            <label class="e-lbl" for="sb-region">Region / Gebiet</label>
            <input class="e-inp" id="sb-region" value="${esc(pin.region || '')}" maxlength="80" placeholder="z. B. Grafschaft Celtigerns Wacht …"/>
          </div>
          <div class="e-row">
            <label class="e-lbl" for="sb-house">Herrschaft / Haus</label>
            <input class="e-inp" id="sb-house" value="${esc(pin.house || '')}" maxlength="80" placeholder="z. B. Haus O'Gwynthor …"/>
          </div>
          <div class="e-row">
            <label class="e-lbl" for="sb-faction">Fraktion / Gilde</label>
            <input class="e-inp" id="sb-faction" value="${esc(pin.faction || '')}" maxlength="80" placeholder="z. B. Händlergilde …"/>
          </div>
        `)}

        ${panel('medien', `
          <h3 class="pin-editor-panel-title">Bilder & Verlinkungen</h3>
          <p class="pin-editor-help">Die Mediathek greift auf die vorhandenen Projektordner für Ortszeichen, Wappen und Banner zu.</p>
          ${mediaField({ role: 'crest', label: 'Wappen / Ortsbanner', url: pin.crest, link: pin.crestLink, fallback: '🏰', hint: 'Kleines Wappen im Kopf des Eintrags.' })}
          ${mediaField({ role: 'banner', label: 'Regionsbanner', url: pin.banner, link: pin.bannerLink, fallback: '⚑', hint: 'Optionales Banner der zugehörigen Herrschaft oder Region.' })}
          ${mediaField({ role: 'img', label: 'Vorschaubild', url: pin.img, link: pin.imgLink, fallback: '▧', hint: 'Großes Motiv innerhalb des Eintrags.' })}
        `)}

        ${panel('infotabelle', `
          <h3 class="pin-editor-panel-title">Infotabelle</h3>
          <div class="e-row">
            <div class="pin-editor-media-actions">
              <select class="e-sel" id="sb-tpl-sel" data-input-action="apply-pin-template-preset">
                <option value="">Vorlage laden …</option>
                ${(window.PIN_TEMPLATES || []).map(template => `<option value="${template.id}">${template.icon} ${template.label}</option>`).join('')}
              </select>
              <button type="button" class="pin-editor-media-button" data-action="clear-pin-table">Tabelle leeren</button>
            </div>
          </div>
          <div class="tbl-ed" id="sb-tbl">${rows}</div>
          <button type="button" class="add-row" data-action="add-pin-table-row">＋ Zeile hinzufügen</button>
        `)}

        ${panel('beschreibung', `
          <h3 class="pin-editor-panel-title">Beschreibung & Flavourtext</h3>
          <div class="fmt-bar">
            <button type="button" class="fmt" data-action="format-pin-text" data-before="**" data-after="**"><b>B</b></button>
            <button type="button" class="fmt" data-action="format-pin-text" data-before="*" data-after="*"><i>I</i></button>
            <button type="button" class="fmt" data-action="format-pin-text" data-before="&#10;&#10;---&#10;&#10;" data-after="">—</button>
          </div>
          <textarea class="e-ta" id="sb-text" rows="12">${esc(pin.text || '')}</textarea>
          <div class="e-hint">**fett** &nbsp; *kursiv* &nbsp; --- Trennlinie &nbsp; [URL=https://…]Linktext[/URL]</div>
        `)}
      </div>`;

    footer.innerHTML = `
      ${session.isNew() ? '' : `<button type="button" class="s-btn s-del" data-action="delete-pin-from-editor" data-pin-id="${pin.id}">🗑 Löschen</button>`}
      <span class="pin-editor-footer-note">„Übernehmen“ legt den Kartenstand zunächst lokal ab.</span>
      <button type="button" class="s-btn s-cancel" data-action="cancel-pin-editor">Abbrechen</button>
      <button type="button" class="s-btn s-save" data-action="save-pin-editor" data-pin-id="${pin.id}">✓ Pin übernehmen</button>`;

    bindFormEvents(body);
    setHeader();
    runtime.renderEditorPreview?.(pin);
  }

  function bindFormEvents(body) {
    if (body.dataset.pinEditorBound === 'true') return;
    body.dataset.pinEditorBound = 'true';
    const update = event => {
      if (!event.target.matches('input, textarea, select')) return;
      syncFromForm();
      updateStatus();
      runtime.renderEditorPreview?.(currentPin());
    };
    body.addEventListener('input', update);
    body.addEventListener('change', update);
  }

  function syncTable() {
    return Array.from(document.querySelectorAll('#sb-tbl .tbl-row')).map(row => ({
      k: row.querySelector('[data-c="k"]')?.value || '',
      v: row.querySelector('[data-c="v"]')?.value || '',
    })).filter(row => row.k || row.v);
  }

  function syncFromForm() {
    const pin = currentPin();
    if (!pin) return null;
    const value = (id, previous = '') => document.getElementById(id)?.value ?? previous;
    pin.title = value('sb-title-inp', pin.title);
    pin.cat = value('sb-cat', pin.cat);
    pin.img = value('sb-img', pin.img);
    pin.imgLink = value('sb-imglink', pin.imgLink);
    pin.crest = value('sb-crest', pin.crest);
    pin.crestLink = value('sb-crestlink', pin.crestLink);
    pin.banner = value('sb-banner', pin.banner);
    pin.bannerLink = value('sb-bannerlink', pin.bannerLink);
    pin.dominionId = value('sb-dominion', pin.dominionId);
    pin.region = value('sb-region', pin.region);
    pin.house = value('sb-house', pin.house);
    pin.faction = value('sb-faction', pin.faction);
    pin.text = value('sb-text', pin.text);
    pin.secret = document.getElementById('sb-secret')?.checked ?? pin.secret;
    if (document.getElementById('sb-tbl')) pin.table = syncTable();
    return pin;
  }

  function switchTab(tab) {
    if (!TABS.includes(tab)) return;
    syncFromForm();
    activeTab = tab;
    document.querySelectorAll('[data-editor-tab]').forEach(button => button.classList.toggle('is-active', button.dataset.editorTab === tab));
    document.querySelectorAll('[data-editor-panel]').forEach(section => { section.hidden = section.dataset.editorPanel !== tab; });
  }

  function commit(options = {}) {
    const target = actualPin();
    if (!target || !session) return null;
    syncFromForm();
    const wasNew = session.isNew();
    const changed = session.isDirty();
    const before = session.original();
    const pin = session.commitInto(target);
    pin.title = String(pin.title || '').trim() || 'Unbekannter Ort';
    pin.cat = pin.cat || state().cats[0]?.id || 'other';
    ['img', 'imgLink', 'crest', 'crestLink', 'banner', 'bannerLink', 'dominionId', 'region', 'house', 'faction', 'text'].forEach(key => {
      pin[key] = String(pin[key] || '').trim();
    });
    pin.secret = !!pin.secret;

    if (wasNew) {
      const id = pin.id;
      runtime.pushUndo(`Pin gesetzt: ${pin.title}`, () => {
        state().pins = state().pins.filter(item => item.id !== id);
      });
    } else if (changed) {
      const id = pin.id;
      runtime.pushUndo(`Pin bearbeitet: ${pin.title}`, () => {
        const current = state().pins.find(item => item.id === id);
        if (!current) return;
        Object.keys(current).forEach(key => delete current[key]);
        Object.assign(current, clone(before));
      });
    }

    runtime.renderPins();
    runtime.save();
    const id = pin.id;
    const title = pin.title;
    close({ force: true, keepNew: wasNew });
    if (options.openDetail !== false) window.KartoPinDetailView?.open(id);
    runtime.toast(`✓ Lokal übernommen: ${title}`);
    return pin;
  }

  function saveAndPublish() {
    const pin = commit({ openDetail: false });
    if (pin) window.openPublishModal?.();
  }

  function openMedia(target) {
    syncFromForm();
    const role = target === 'img' ? 'image' : target;
    window.KartoMediaLibrary?.open({
      target: role,
      onSelect(url) {
        const pin = currentPin();
        if (!pin) return;
        if (target === 'marker') pin.pinMarker = url;
        else pin[target] = url;
        renderSidebarEdit();
      },
    });
  }

  function clearMedia(target) {
    const pin = syncFromForm();
    if (!pin) return;
    if (target === 'marker') pin.pinMarker = '';
    else pin[target] = '';
    renderSidebarEdit();
  }

  function setMarker(url) {
    const pin = syncFromForm();
    if (!pin) return;
    pin.pinMarker = url;
    runtime.closeModal('pinmkr-mo');
    renderSidebarEdit();
  }

  function setMarkerScale(value) {
    const pin = syncFromForm();
    if (!pin) return;
    pin.pinMarkerScale = Math.max(.4, Math.min(3, Number(value) / 100));
    const label = document.getElementById('sb-pinmarker-scale-val');
    if (label) label.textContent = `${Math.round(pin.pinMarkerScale * 100)}%`;
    updateStatus();
    runtime.renderEditorPreview?.(pin);
  }

  function addRow() {
    const pin = syncFromForm();
    if (!pin) return;
    pin.table = pin.table || [];
    pin.table.push({ k: '', v: '' });
    renderSidebarEdit();
  }

  function deleteRow(index) {
    const pin = syncFromForm();
    if (!pin) return;
    pin.table.splice(index, 1);
    renderSidebarEdit();
  }

  function clearTable() {
    const pin = syncFromForm();
    if (!pin) return;
    if (pin.table.length && !confirm('Alle Tabellenzeilen löschen?')) return;
    pin.table = [];
    renderSidebarEdit();
  }

  function applyPreset(templateId) {
    if (!templateId) return;
    const template = (window.PIN_TEMPLATES || []).find(item => item.id === templateId);
    const pin = syncFromForm();
    if (!template || !pin) return;
    const existing = Object.fromEntries((pin.table || []).filter(row => row.k).map(row => [row.k.toLocaleLowerCase('de').trim(), row.v]));
    pin.table = template.table.map(row => ({ k: row.k, v: existing[row.k.toLocaleLowerCase('de').trim()] ?? '' }));
    renderSidebarEdit();
  }

  function formatText(before, after) {
    const textarea = document.getElementById('sb-text');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    textarea.value = textarea.value.substring(0, start) + before + selection + after + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + before.length, end + before.length);
    syncFromForm();
    updateStatus();
    runtime.renderEditorPreview?.(currentPin());
  }

  function preview() {
    syncFromForm();
    renderSidebarEdit();
  }

  window.KartoPinEditor = {
    open, close, isOpen, renderSidebarEdit, switchTab,
    save: commit, saveAndPublish, openMedia, clearMedia, preview,
  };

  window.renderSidebarEdit = renderSidebarEdit;
  window.sbOpenPinMarkerPicker = () => openMedia('marker');
  window.renderPinMarkerGrid = () => {};
  window.sbSetPinMarker = setMarker;
  window.sbClearPinMarker = () => clearMedia('marker');
  window.sbSetPinMarkerScale = setMarkerScale;
  window.sbSyncTbl = syncTable;
  window.sbSyncAll = syncFromForm;
  window.sbAddRow = addRow;
  window.sbDelRow = deleteRow;
  window.sbClearTable = clearTable;
  window.sbApplyPreset = applyPreset;
  window.sbSave = () => commit();
  window.fmt = formatText;
})();
