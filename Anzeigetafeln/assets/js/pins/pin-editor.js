(function(){
  'use strict';

  let activePinId = null;
  let markerPickerPinId = null;

  function rt(){ return window.TafelRuntime; }
  function state(){ return rt().state(); }
  function esc(value){ return rt().esc(value); }
  function templates(){ return rt().pinTemplates(); }
  function activePin(){ return state().pins.find(p => p.id === activePinId); }

  function open(pinId){
    if(!rt().canEditPins()){
      rt().toast('Pins koennen nur in der Pins-Ansicht bearbeitet werden');
      return;
    }
    const pin = state().pins.find(p => p.id === pinId);
    if(!pin) return;
    activePinId = pinId;
    document.getElementById('sidebar').classList.add('open');
    render(pin);
  }

  function render(pin){
    const S = state();
    const body = document.getElementById('sb-body');
    const footer = document.getElementById('sb-footer');
    document.getElementById('sb-title').textContent = 'Bearbeiten';
    document.getElementById('sb-mode-lbl').textContent = 'Editormodus';
    const rows = (pin.table || []).map((row, i) => `
    <div class="tbl-row">
      <input class="tk" value="${esc(row.k)}" placeholder="Bezeichnung" data-c="k"/>
      <input class="tv" value="${esc(row.v)}" placeholder="Wert" data-c="v"/>
      <button class="tbl-rm" data-action="pin-table-delete" data-row-index="${i}">✕</button>
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
            ${S.cats.map(c => `<option value="${c.id}"${(pin.cat || S.cats[0]?.id) === c.id ? ' selected' : ''}>${esc(c.label)}</option>`).join('')}
          </select>
          <div id="sb-pinmarker-preview" data-action="open-pin-marker-picker" data-pin-id="${pin.id}"
               title="Pin-Marker aus Katalog wählen"
               style="width:32px;height:38px;border:1px solid var(--border2);border-radius:3px;background:rgba(20,10,0,.6);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:border-color .13s;">
            ${pin.pinMarker
              ? `<img src="${esc(pin.pinMarker)}" style="width:28px;height:34px;object-fit:contain;"/>`
              : `<span style="font-size:.65rem;color:#5a3a08;text-align:center;line-height:1.2;">📍<br>Icon</span>`}
          </div>
          ${pin.pinMarker ? `<button data-action="clear-pin-marker" data-pin-id="${pin.id}" title="Marker entfernen" style="background:none;border:none;color:var(--redl);cursor:pointer;font-size:.8rem;flex-shrink:0;">✕</button>` : ''}
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
            <input class="e-inp" id="sb-crest-link" value="${esc(pin.crestLink || '')}" placeholder="Link-Ziel beim Klick..."/>
            <button class="add-row" style="border-style:solid;opacity:.65" data-action="preview-pin-crest">↻ Vorschau</button>
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
            <input class="e-inp" id="sb-banner-link" value="${esc(pin.bannerLink || '')}" placeholder="Link-Ziel beim Klick..."/>
            <button class="add-row" style="border-style:solid;opacity:.65" data-action="preview-pin-banner">↻ Vorschau</button>
          </div>
        </div>
      </div>

      <div style="border-top:1px solid var(--border2);padding-top:.5rem;margin-top:.1rem;">
        <div class="e-lbl" style="margin-bottom:.4rem;">🖼 Vorschaubild</div>
        <div class="e-img-row">
          <div class="e-img-prev" id="sb-img-prev">${pin.img ? `<img src="${esc(pin.img)}"/>` : '🖼'}</div>
          <div class="e-img-col">
            <input class="e-inp" id="sb-img" value="${esc(pin.img || '')}" placeholder="https://i.imgur.com/…"/>
            <input class="e-inp" id="sb-img-link" value="${esc(pin.imgLink || '')}" placeholder="Link-Ziel beim Klick..."/>
            <button class="add-row" style="border-style:solid;opacity:.65" data-action="preview-pin-image">↻ Vorschau</button>
          </div>
        </div>
      </div>

      <div class="e-row">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.3rem;">
          <label class="e-lbl" style="margin:0;">Infotabelle</label>
          <div style="display:flex;gap:.35rem;align-items:center;">
            <select class="e-sel" id="sb-tpl-sel" style="font-size:var(--fs-xs);padding:2px 6px;width:auto;"
              data-input-action="apply-pin-preset">
              <option value="">📋 Preset laden…</option>
              ${templates().map(t => `<option value="${t.id}">${t.icon} ${t.label}</option>`).join('')}
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
        <div class="e-hint">**fett** *kursiv* --- Trennlinie</div>
      </div>
      <div class="e-row">
        <label class="e-check-row">
          <input type="checkbox" id="sb-secret" ${pin.secret ? 'checked' : ''}/>
          <span class="e-check-lbl">🔒 Geheimer Pin</span>
        </label>
      </div>
    </div>`;

    const cardWidth = pin.cardWidth || S.cardWidth || 1100;
    footer.innerHTML = `
    <div style="width:100%;display:flex;align-items:center;gap:.5rem;padding:.3rem .1rem .4rem;border-bottom:1px solid var(--border2);margin-bottom:.15rem;">
      <span style="font-family:'Cinzel',serif;font-size:.6rem;color:#5a3a08;white-space:nowrap;">↔ Karte</span>
      <input type="range" id="card-w-slider" min="500" max="1600" step="20" value="${cardWidth}"
        style="flex:1;accent-color:var(--gold);cursor:pointer;"
        data-input-action="pin-card-width" data-pin-id="${pin.id}"/>
      <span id="card-w-val" style="font-family:'Cinzel',serif;font-size:.6rem;color:#5a3a08;min-width:36px;">${cardWidth}px</span>
    </div>
    <button class="s-btn s-del" data-action="pin-delete" data-pin-id="${pin.id}" style="margin-right:auto">🗑</button>
    <button class="s-btn s-cancel" data-action="close-sidebar">Abbrechen</button>
    <button class="s-btn s-save" data-action="save-pin" data-pin-id="${pin.id}">✓ Speichern</button>`;
    rt().openEditorShell('pin', pin.id);
    body.querySelectorAll('input, textarea, select').forEach(control => {
      control.addEventListener('input', () => {
        syncAll();
        rt().renderEditorPreview();
        rt().renderPins();
      });
      control.addEventListener('change', () => {
        syncAll();
        rt().renderEditorPreview();
        rt().renderPins();
      });
    });
  }

  function previewImage(inputId, previewId, fallback, fit){
    const url = document.getElementById(inputId).value.trim();
    const preview = document.getElementById(previewId);
    preview.innerHTML = url
      ? `<img src="${url}" style="width:100%;height:100%;object-fit:${fit}" onerror="this.parentElement.innerHTML='❌'"/>`
      : fallback;
  }
  function sbPrevImg(){ previewImage('sb-img', 'sb-img-prev', '🖼', 'cover'); }
  function sbPrevCrest(){ previewImage('sb-crest', 'sb-crest-prev', '🏰', 'cover'); }
  function sbPrevBanner(){ previewImage('sb-banner', 'sb-banner-prev', '<span style="opacity:.25;font-size:1.4rem;">🚩</span>', 'contain'); }

  function sbOpenPinMarkerPicker(pinId){
    markerPickerPinId = pinId;
    document.getElementById('pinmkr-search').value = '';
    const groups = [...new Set((state().markerCatalog || []).map(m => m.group || '').filter(Boolean))].sort();
    const filterSelect = document.getElementById('pinmkr-filter');
    filterSelect.innerHTML = '<option value="">Alle Gruppen</option>' + groups.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('');
    renderPinMarkerGrid('');
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
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;font-family:'EB Garamond',serif;color:#5a3a08;">Keine Marker.</div>`;
      return;
    }
    const grouped = {};
    list.forEach(marker => {
      const group = marker.group || 'Ohne Gruppe';
      if(!grouped[group]) grouped[group] = [];
      grouped[group].push(marker);
    });
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
    if(!markerPickerPinId) return;
    const pin = syncAll();
    if(!pin) return;
    pin.pinMarker = url;
    rt().closeModal('pinmkr-mo');
    render(pin);
  }
  function sbClearPinMarker(){
    const pin = syncAll();
    if(!pin) return;
    pin.pinMarker = '';
    render(pin);
  }

  function syncTable(){
    return Array.from(document.querySelectorAll('#sb-tbl .tbl-row')).map(row => ({
      k: row.querySelector('[data-c="k"]')?.value || '',
      v: row.querySelector('[data-c="v"]')?.value || ''
    })).filter(row => row.k || row.v);
  }
  function syncAll(){
    const pin = activePin();
    if(!pin) return pin;
    pin.title = document.getElementById('sb-title-inp')?.value || pin.title;
    pin.cat = document.getElementById('sb-cat')?.value || pin.cat;
    pin.img = document.getElementById('sb-img')?.value ?? pin.img;
    pin.imgLink = document.getElementById('sb-img-link')?.value ?? pin.imgLink;
    pin.crest = document.getElementById('sb-crest')?.value ?? pin.crest;
    pin.crestLink = document.getElementById('sb-crest-link')?.value ?? pin.crestLink;
    pin.banner = document.getElementById('sb-banner')?.value ?? pin.banner;
    pin.bannerLink = document.getElementById('sb-banner-link')?.value ?? pin.bannerLink;
    pin.region = document.getElementById('sb-region')?.value ?? pin.region;
    pin.house = document.getElementById('sb-house')?.value ?? pin.house;
    pin.faction = document.getElementById('sb-faction')?.value ?? pin.faction;
    pin.text = document.getElementById('sb-text')?.value ?? pin.text;
    pin.secret = document.getElementById('sb-secret')?.checked ?? pin.secret;
    pin.table = syncTable();
    return pin;
  }

  function sbAddRow(){ const pin = syncAll(); if(!pin) return; pin.table.push({k:'', v:''}); render(pin); }
  function sbDelRow(index){ const pin = syncAll(); if(!pin) return; pin.table.splice(index, 1); render(pin); }
  function sbClearTable(){
    const pin = syncAll();
    if(!pin) return;
    if(pin.table.length && !confirm('Alle Tabellenzeilen löschen?')) return;
    pin.table = [];
    render(pin);
  }
  function sbApplyPreset(templateId){
    if(!templateId) return;
    const template = templates().find(t => t.id === templateId);
    if(!template) return;
    const pin = syncAll();
    if(!pin) return;
    const existing = {};
    (pin.table || []).forEach(row => {
      if(row.k) existing[row.k.toLowerCase().trim()] = row.v;
    });
    pin.table = template.table.map(row => ({
      k: row.k,
      v: existing[row.k.toLowerCase().trim()] ?? ''
    }));
    render(pin);
  }

  function sbSave(pinId){
    const S = state();
    const pin = S.pins.find(p => p.id === pinId);
    if(!pin) return;
    pin.title = (document.getElementById('sb-title-inp')?.value || '').trim() || 'Unbekannter Ort';
    pin.cat = document.getElementById('sb-cat')?.value || (S.cats[0]?.id || 'other');
    pin.img = (document.getElementById('sb-img')?.value || '').trim();
    pin.imgLink = (document.getElementById('sb-img-link')?.value || '').trim();
    pin.crest = (document.getElementById('sb-crest')?.value || '').trim();
    pin.crestLink = (document.getElementById('sb-crest-link')?.value || '').trim();
    pin.banner = (document.getElementById('sb-banner')?.value || '').trim();
    pin.bannerLink = (document.getElementById('sb-banner-link')?.value || '').trim();
    pin.region = (document.getElementById('sb-region')?.value || '').trim();
    pin.house = (document.getElementById('sb-house')?.value || '').trim();
    pin.faction = (document.getElementById('sb-faction')?.value || '').trim();
    pin.text = (document.getElementById('sb-text')?.value || '').trim();
    pin.secret = document.getElementById('sb-secret')?.checked || false;
    pin.table = syncTable();
    rt().save();
    rt().renderPins();
    rt().closeSidebar();
    window.TafelPinScrollView.render(pin);
    const card = document.getElementById('scroll-card');
    const width = pin.cardWidth || S.cardWidth || 1100;
    if(card) card.style.width = 'min(' + width + 'px,calc(100vw - 32px))';
    document.getElementById('scroll-mo').classList.add('open');
    rt().toast('✓ Gespeichert: ' + pin.title);
  }

  function formatText(before, after){
    const textarea = document.getElementById('sb-text');
    if(!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    textarea.value = textarea.value.substring(0, start) + before + selected + after + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + before.length, end + before.length);
  }

  function clearActive(){
    activePinId = null;
    markerPickerPinId = null;
  }

  window.TafelPinEditor = { open, render, clearActive };

  Object.assign(window, {
    renderSidebarEdit: render,
    sbPrevImg,
    sbPrevCrest,
    sbPrevBanner,
    sbOpenPinMarkerPicker,
    renderPinMarkerGrid,
    sbSetPinMarker,
    sbClearPinMarker,
    sbAddRow,
    sbDelRow,
    sbClearTable,
    sbApplyPreset,
    sbSave,
    fmt: formatText
  });
})();
