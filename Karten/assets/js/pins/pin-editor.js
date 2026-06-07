(function(){
  const runtime = window.KartoRuntime;
  let activePinId = null;
  let pinMarkerPinId = null;

  function state(){
    return runtime.state();
  }

  function open(pinId){
    const pin = state().pins.find(item => item.id === pinId);
    if(!pin) return;
    activePinId = pinId;
    document.getElementById('sidebar').classList.add('open');
    renderSidebarEdit(pin);
  }

  function close(){
    runtime.closeEditorShell?.();
    activePinId = null;
  }

  function renderSidebarEdit(pin){
    const body = document.getElementById('sb-body');
    const footer = document.getElementById('sb-footer');
    const esc = runtime.esc;
    document.getElementById('sb-title').textContent = 'Bearbeiten';
    document.getElementById('sb-mode-lbl').textContent = 'Editormodus';
    const rows = (pin.table || []).map((row, index) => `
      <div class="tbl-row">
        <input class="tk" value="${esc(row.k)}" placeholder="Bezeichnung" data-c="k"/>
        <input class="tv" value="${esc(row.v)}" placeholder="Wert" data-c="v"/>
        <button class="tbl-rm" data-action="delete-pin-table-row" data-row-index="${index}">✕</button>
      </div>`).join('');

    body.innerHTML = `
      <div class="se-inner">
        <div class="e-row">
          <label class="e-lbl">Name / Titel</label>
          <input class="e-inp" id="sb-title-inp" value="${esc(pin.title)}" maxlength="80" placeholder="Name des Ortes…"/>
        </div>
        <div class="e-row">
          <label class="e-lbl">Kategorie</label>
          <div style="display:flex;gap:.4rem;align-items:center;">
            <select class="e-sel" id="sb-cat" style="flex:1;">
              ${state().cats.map(cat => `<option value="${cat.id}"${(pin.cat || state().cats[0]?.id) === cat.id ? ' selected' : ''}>${esc(cat.label)}</option>`).join('')}
            </select>
            <div id="sb-pinmarker-preview" data-action="open-pin-marker-picker" data-pin-id="${pin.id}"
                 title="Pin-Marker aus Katalog wählen"
                 style="width:32px;height:38px;border:1px solid var(--border2);border-radius:3px;background:rgba(255,248,220,.6);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:border-color .13s;">
              ${pin.pinMarker
                ? `<img src="${esc(pin.pinMarker)}" style="width:28px;height:34px;object-fit:contain;"/>`
                : `<span style="font-size:.65rem;color:var(--ink3);text-align:center;line-height:1.2;">📍<br>Icon</span>`}
            </div>
            ${pin.pinMarker ? `<button data-action="clear-pin-marker" title="Marker entfernen" style="background:none;border:none;color:var(--redl);cursor:pointer;font-size:.8rem;flex-shrink:0;">✕</button>` : ''}
          </div>
        </div>

        <div style="border-top:1px solid var(--border2);padding-top:.5rem;margin-top:.1rem;">
          <div class="e-lbl" style="margin-bottom:.4rem;">⚔ Zugehörigkeit</div>
          <div class="e-row">
            <label class="e-lbl" style="font-size:var(--fs-xs);opacity:.7;">Region / Gebiet</label>
            <input class="e-inp" id="sb-region" value="${esc(pin.region || '')}" maxlength="80" placeholder="z.B. Grafschaft Celtigern…"/>
          </div>
          <div class="e-row">
            <label class="e-lbl" style="font-size:var(--fs-xs);opacity:.7;">Herrschaft / Haus</label>
            <input class="e-inp" id="sb-house" value="${esc(pin.house || '')}" maxlength="80" placeholder="z.B. Haus O'Gwynthor…"/>
          </div>
          <div class="e-row">
            <label class="e-lbl" style="font-size:var(--fs-xs);opacity:.7;">Fraktion / Gilde</label>
            <input class="e-inp" id="sb-faction" value="${esc(pin.faction || '')}" maxlength="80" placeholder="z.B. Händlergilde…"/>
          </div>
        </div>

        <div style="border-top:1px solid var(--border2);padding-top:.5rem;margin-top:.1rem;">
          <div class="e-lbl" style="margin-bottom:.4rem;">🛡 Wappen / Ortsbanner</div>
          <div class="e-img-row">
            <div class="e-img-prev" id="sb-crest-prev" style="width:70px;height:70px;border-radius:2px;">
              ${pin.crest ? `<img src="${esc(pin.crest)}" style="width:100%;height:100%;object-fit:cover"/>` : '🏰'}
            </div>
            <div class="e-img-col">
              <input class="e-inp" id="sb-crest" value="${esc(pin.crest || '')}" placeholder="URL zum Wappen-Bild…"/>
              <input class="e-inp" id="sb-crestlink" value="${esc(pin.crestLink || '')}" placeholder="🔗 Link beim Klick (optional)…" style="font-size:var(--fs-xs);opacity:.85;"/>
              <button class="add-row" style="border-style:solid;opacity:.65" data-action="preview-pin-editor-image" data-preview-target="crest">↻ Vorschau</button>
            </div>
          </div>
        </div>

        <div style="border-top:1px solid var(--border2);padding-top:.5rem;margin-top:.1rem;">
          <div class="e-lbl" style="margin-bottom:.4rem;">🚩 Regionsbanner <span style="font-family:'EB Garamond',serif;font-size:.75rem;font-style:italic;opacity:.6;">(optional)</span></div>
          <div class="e-img-row">
            <div class="e-img-prev" id="sb-banner-prev" style="width:70px;height:70px;border-radius:2px;background:rgba(0,0,0,.06);">
              ${pin.banner ? `<img src="${esc(pin.banner)}" style="width:100%;height:100%;object-fit:contain;"/>` : '<span style="opacity:.25;font-size:1.4rem;">🚩</span>'}
            </div>
            <div class="e-img-col">
              <input class="e-inp" id="sb-banner" value="${esc(pin.banner || '')}" placeholder="URL zum Regionsbanner…"/>
              <input class="e-inp" id="sb-bannerlink" value="${esc(pin.bannerLink || '')}" placeholder="🔗 Link beim Klick (optional)…" style="font-size:var(--fs-xs);opacity:.85;"/>
              <button class="add-row" style="border-style:solid;opacity:.65" data-action="preview-pin-editor-image" data-preview-target="banner">↻ Vorschau</button>
            </div>
          </div>
        </div>

        <div style="border-top:1px solid var(--border2);padding-top:.5rem;margin-top:.1rem;">
          <div class="e-lbl" style="margin-bottom:.4rem;">🖼 Vorschaubild</div>
          <div class="e-img-row">
            <div class="e-img-prev" id="sb-img-prev">${pin.img ? `<img src="${esc(pin.img)}"/>` : '🖼'}</div>
            <div class="e-img-col">
              <input class="e-inp" id="sb-img" value="${esc(pin.img || '')}" placeholder="https://i.imgur.com/…"/>
              <input class="e-inp" id="sb-imglink" value="${esc(pin.imgLink || '')}" placeholder="Link-Ziel beim Klick..." style="font-size:var(--fs-xs);opacity:.85;"/>
              <button class="add-row" style="border-style:solid;opacity:.65" data-action="preview-pin-editor-image" data-preview-target="image">↻ Vorschau</button>
            </div>
          </div>
        </div>

        <div class="e-row">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.3rem;">
            <label class="e-lbl" style="margin:0;">Infotabelle</label>
            <div style="display:flex;gap:.35rem;align-items:center;">
              <select class="e-sel" id="sb-tpl-sel" style="font-size:var(--fs-xs);padding:2px 6px;width:auto;"
                data-input-action="apply-pin-template-preset">
                <option value="">📋 Preset laden…</option>
                ${window.PIN_TEMPLATES.map(template => `<option value="${template.id}">${template.icon} ${template.label}</option>`).join('')}
              </select>
              <button class="add-row" style="border-style:solid;opacity:.6;white-space:nowrap;padding:2px 8px;width:auto;"
                data-action="clear-pin-table" title="Alle Zeilen löschen">🗑 Leeren</button>
            </div>
          </div>
          <div class="tbl-ed" id="sb-tbl">${rows}</div>
          <button class="add-row" data-action="add-pin-table-row">＋ Zeile hinzufügen</button>
        </div>
        <div class="e-row">
          <label class="e-lbl">Beschreibung / Flavourtext</label>
          <div class="fmt-bar">
            <button class="fmt" data-action="format-pin-text" data-before="**" data-after="**"><b>B</b></button>
            <button class="fmt" data-action="format-pin-text" data-before="*" data-after="*"><i>I</i></button>
            <button class="fmt" data-action="format-pin-text" data-before="&#10;&#10;---&#10;&#10;" data-after="">—</button>
          </div>
          <textarea class="e-ta" id="sb-text" rows="5">${esc(pin.text || '')}</textarea>
          <div class="e-hint">**fett** &nbsp;*kursiv* &nbsp;--- Trennlinie &nbsp;[URL=https://...]Linktext[/URL]</div>
        </div>
        <div class="e-row">
          <label class="e-check-row">
            <input type="checkbox" id="sb-secret" ${pin.secret ? 'checked' : ''}/>
            <span class="e-check-lbl">🔒 Geheimer Pin</span>
          </label>
        </div>
      </div>`;

    footer.innerHTML = `
      <button class="s-btn s-del" data-action="delete-pin-from-editor" data-pin-id="${pin.id}" style="margin-right:auto">🗑</button>
      <button class="s-btn s-cancel" data-action="close-sidebar">Abbrechen</button>
      <button class="s-btn s-save" data-action="save-pin-editor" data-pin-id="${pin.id}">✓ Speichern</button>`;
    runtime.openEditorShell?.('pin', pin.id);
    body.querySelectorAll('input, textarea, select').forEach(control => {
      control.addEventListener('input', () => {
        sbSyncAll();
        runtime.renderEditorPreview?.();
        runtime.renderPins();
      });
      control.addEventListener('change', () => {
        sbSyncAll();
        runtime.renderEditorPreview?.();
        runtime.renderPins();
      });
    });
  }

  function sbPrevImg(){
    const url = document.getElementById('sb-img').value.trim();
    const preview = document.getElementById('sb-img-prev');
    preview.innerHTML = url ? `<img src="${url}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='❌'"/>` : '🖼';
  }

  function sbPrevCrest(){
    const url = document.getElementById('sb-crest').value.trim();
    const preview = document.getElementById('sb-crest-prev');
    preview.innerHTML = url ? `<img src="${url}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='❌'"/>` : '🏰';
  }

  function sbPrevBanner(){
    const url = document.getElementById('sb-banner').value.trim();
    const preview = document.getElementById('sb-banner-prev');
    preview.innerHTML = url ? `<img src="${url}" style="width:100%;height:100%;object-fit:contain" onerror="this.parentElement.innerHTML='❌'"/>` : '<span style="opacity:.25;font-size:1.4rem;">🚩</span>';
  }

  function sbOpenPinMarkerPicker(pinId){
    pinMarkerPinId = pinId;
    document.getElementById('pinmkr-search').value = '';
    const groups = [...new Set((state().markerCatalog || []).map(item => item.group || '').filter(Boolean))].sort();
    const filter = document.getElementById('pinmkr-filter');
    filter.innerHTML = '<option value="">Alle Gruppen</option>' + groups.map(group => `<option value="${runtime.esc(group)}">${runtime.esc(group)}</option>`).join('');
    renderPinMarkerGrid('');
    runtime.closeModal('pinmkr-mo');
    document.getElementById('pinmkr-mo').classList.add('open');
  }

  function renderPinMarkerGrid(query){
    const q = (query || '').toLowerCase();
    const groupFilter = document.getElementById('pinmkr-filter')?.value || '';
    const list = (state().markerCatalog || []).filter(marker => {
      const matchesQuery = !q || marker.name.toLowerCase().includes(q) || (marker.group || '').toLowerCase().includes(q);
      const matchesGroup = !groupFilter || (marker.group || '') === groupFilter;
      return matchesQuery && matchesGroup;
    });
    const grid = document.getElementById('pinmkr-grid');
    if(!list.length){
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;font-family:'EB Garamond',serif;color:var(--ink3);">Keine Marker.</div>`;
      return;
    }

    const grouped = {};
    list.forEach(marker => {
      const group = marker.group || 'Ohne Gruppe';
      if(!grouped[group]) grouped[group] = [];
      grouped[group].push(marker);
    });

    const esc = runtime.esc;
    grid.innerHTML = Object.entries(grouped).map(([group, items]) => `
      <div class="mcat-grp-header">${esc(group)}</div>
      ${items.map(marker => `
        <div class="mcat-item" data-action="set-pin-marker" data-marker-url="${esc(marker.url)}" title="${esc(marker.name)}">
          <img src="${esc(marker.url)}" loading="lazy" style="width:48px;height:58px;object-fit:contain;"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 48%22><text y=%2230%22 font-size=%2224%22>📍</text></svg>'"/>
          <span class="mcat-lbl">${esc(marker.name)}</span>
        </div>`).join('')}
    `).join('');
  }

  function sbSetPinMarker(url){
    if(!pinMarkerPinId) return;
    const pin = sbSyncAll();
    if(!pin) return;
    pin.pinMarker = url;
    runtime.closeModal('pinmkr-mo');
    renderSidebarEdit(pin);
  }

  function sbClearPinMarker(){
    const pin = sbSyncAll();
    if(!pin) return;
    pin.pinMarker = '';
    renderSidebarEdit(pin);
  }

  function sbSyncTbl(){
    return Array.from(document.querySelectorAll('#sb-tbl .tbl-row')).map(row => ({
      k: row.querySelector('[data-c="k"]')?.value || '',
      v: row.querySelector('[data-c="v"]')?.value || '',
    })).filter(row => row.k || row.v);
  }

  function sbSyncAll(){
    const pin = state().pins.find(item => item.id === activePinId);
    if(!pin) return pin;
    pin.title = document.getElementById('sb-title-inp')?.value || pin.title;
    pin.cat = document.getElementById('sb-cat')?.value || pin.cat;
    pin.img = document.getElementById('sb-img')?.value ?? pin.img;
    pin.imgLink = document.getElementById('sb-imglink')?.value ?? pin.imgLink;
    pin.crest = document.getElementById('sb-crest')?.value ?? pin.crest;
    pin.crestLink = document.getElementById('sb-crestlink')?.value ?? pin.crestLink;
    pin.banner = document.getElementById('sb-banner')?.value ?? pin.banner;
    pin.bannerLink = document.getElementById('sb-bannerlink')?.value ?? pin.bannerLink;
    pin.region = document.getElementById('sb-region')?.value ?? pin.region;
    pin.house = document.getElementById('sb-house')?.value ?? pin.house;
    pin.faction = document.getElementById('sb-faction')?.value ?? pin.faction;
    pin.text = document.getElementById('sb-text')?.value ?? pin.text;
    pin.secret = document.getElementById('sb-secret')?.checked ?? pin.secret;
    pin.table = sbSyncTbl();
    return pin;
  }

  function sbAddRow(){
    const pin = sbSyncAll();
    if(!pin) return;
    pin.table.push({k:'', v:''});
    renderSidebarEdit(pin);
  }

  function sbDelRow(index){
    const pin = sbSyncAll();
    if(!pin) return;
    pin.table.splice(index, 1);
    renderSidebarEdit(pin);
  }

  function sbClearTable(){
    const pin = sbSyncAll();
    if(!pin) return;
    if(pin.table.length && !confirm('Alle Tabellenzeilen löschen?')) return;
    pin.table = [];
    renderSidebarEdit(pin);
  }

  function sbApplyPreset(templateId){
    if(!templateId) return;
    const template = window.PIN_TEMPLATES.find(item => item.id === templateId);
    if(!template) return;
    const pin = sbSyncAll();
    if(!pin) return;
    const existing = {};
    (pin.table || []).forEach(row => {
      if(row.k) existing[row.k.toLowerCase().trim()] = row.v;
    });
    pin.table = template.table.map(row => ({
      k: row.k,
      v: existing[row.k.toLowerCase().trim()] ?? '',
    }));
    renderSidebarEdit(pin);
  }

  function sbSave(pinId){
    const pin = state().pins.find(item => item.id === pinId);
    if(!pin) return;
    pin.title = (document.getElementById('sb-title-inp')?.value || '').trim() || 'Unbekannter Ort';
    pin.cat = document.getElementById('sb-cat')?.value || (state().cats[0]?.id || 'other');
    pin.img = (document.getElementById('sb-img')?.value || '').trim();
    pin.imgLink = (document.getElementById('sb-imglink')?.value || '').trim();
    pin.crest = (document.getElementById('sb-crest')?.value || '').trim();
    pin.crestLink = (document.getElementById('sb-crestlink')?.value || '').trim();
    pin.banner = (document.getElementById('sb-banner')?.value || '').trim();
    pin.bannerLink = (document.getElementById('sb-bannerlink')?.value || '').trim();
    pin.region = (document.getElementById('sb-region')?.value || '').trim();
    pin.house = (document.getElementById('sb-house')?.value || '').trim();
    pin.faction = (document.getElementById('sb-faction')?.value || '').trim();
    pin.text = (document.getElementById('sb-text')?.value || '').trim();
    pin.secret = document.getElementById('sb-secret')?.checked || false;
    pin.table = sbSyncTbl();
    runtime.save();
    runtime.renderPins();
    close();
    window.KartoPinDetailView?.open(pin.id);
    runtime.toast('✓ Gespeichert: ' + pin.title);
  }

  function fmt(before, after){
    const textarea = document.getElementById('sb-text');
    if(!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    textarea.value = textarea.value.substring(0, start) + before + selection + after + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + before.length, end + before.length);
  }

  window.KartoPinEditor = {
    open,
    close,
    renderSidebarEdit,
    preview(target){
      if(target === 'crest') sbPrevCrest();
      if(target === 'banner') sbPrevBanner();
      if(target === 'image') sbPrevImg();
    },
  };

  window.renderSidebarEdit = renderSidebarEdit;
  window.sbPrevImg = sbPrevImg;
  window.sbPrevCrest = sbPrevCrest;
  window.sbPrevBanner = sbPrevBanner;
  window.sbOpenPinMarkerPicker = sbOpenPinMarkerPicker;
  window.renderPinMarkerGrid = renderPinMarkerGrid;
  window.sbSetPinMarker = sbSetPinMarker;
  window.sbClearPinMarker = sbClearPinMarker;
  window.sbSyncTbl = sbSyncTbl;
  window.sbSyncAll = sbSyncAll;
  window.sbAddRow = sbAddRow;
  window.sbDelRow = sbDelRow;
  window.sbClearTable = sbClearTable;
  window.sbApplyPreset = sbApplyPreset;
  window.sbSave = sbSave;
  window.fmt = fmt;
})();
