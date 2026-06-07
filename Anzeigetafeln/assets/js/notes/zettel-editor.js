(function(){
  'use strict';

  let activeZettelId = null;

  function rt(){ return window.TafelRuntime; }
  function state(){ return rt().state(); }
  function esc(value){ return rt().esc(value); }
  function currentZettel(){
    return state().zettel.find(z => z.id === activeZettelId);
  }
  function renderBoard(){
    rt().renderZettel();
  }
  function save(){
    rt().save();
  }
  function preview(){
    rt().renderEditorPreview();
  }
  function typeById(id){
    return window.TafelZettelConfig.typeById(id);
  }

  function openZettelSidebar(id){
    if(!rt().canEditZettel()){
      rt().toast('Zettel koennen nur in der Tafel-Ansicht bearbeitet werden');
      return;
    }
    const z = state().zettel.find(x => x.id === id);
    if(!z) return;
    rt().clearPinSidebar();
    activeZettelId = id;
    document.getElementById('sidebar').classList.add('open');
    renderZettelSidebarEdit(z);
  }

  function renderZettelSidebarEdit(z){
    const tdef = typeById(z.typ);
    const brd = window.ZETTEL_BORDER[z.typ] || '#c8a040';
    const tblRows = (z.table || []).map((r, i) => {
      const isSt = r.type === 'stars';
      const sv = parseInt(r.v, 10) || 0;
      const valEl = isSt
        ? `<div class="star-pick" id="gsp-${i}">${[1,2,3,4,5].map(n => `<span class="${n <= sv ? 'on' : ''}" data-action="zettel-star-set" data-mouseover-action="zettel-star-hover" data-mouseout-action="zettel-star-out" data-row-index="${i}" data-value="${n}">${n <= sv ? '\u2605' : '\u2606'}</span>`).join('')}</div>`
        : `<input class="tv" value="${esc(r.v)}" placeholder="Wert\u2026" data-input-action="zettel-table-value" data-row-index="${i}"/>`;
      return `<div class="tbl-row">
    <input class="tk" value="${esc(r.k)}" placeholder="Feld\u2026" data-input-action="zettel-table-key" data-row-index="${i}"/>
    ${valEl}
    <button class="del-row" data-action="zettel-table-delete" data-row-index="${i}">\u2715</button></div>`;
    }).join('');
    const artikelHTML = z.typ === 'zeitung' ? `
  <div class="lsb-sec-ttl" style="margin:.6rem 0 .3rem;">Artikel (max. 6 Seiten)</div>
  ${(z.artikel || []).map((a, i) => `<div style="border:1px solid var(--border2);border-radius:3px;padding:.5rem;margin-bottom:.35rem;">
    <label class="lml">Überschrift ${i + 1}</label>
    <input class="e-inp" value="${esc(a.titel || '')}" placeholder="Überschrift..." data-input-action="zettel-article-field" data-article-index="${i}" data-field="titel"/>
    <label class="lml" style="margin-top:.3rem;">Text</label>
    <textarea class="e-ta" rows="4" data-input-action="zettel-article-field" data-article-index="${i}" data-field="text">${esc(a.text || '')}</textarea>
    ${i > 0 ? `<button class="s-btn s-cancel" style="padding:1px 8px;font-size:.7rem;margin-top:.2rem;" data-action="zettel-article-remove" data-article-index="${i}">✕ Entfernen</button>` : ''}
  </div>`).join('')}
  ${(z.artikel || []).length < 6 ? `<button class="s-btn" style="width:100%;padding:4px;margin-bottom:.4rem;" data-action="zettel-article-add">＋ Artikel</button>` : ''}
  ` : '';

    document.getElementById('sidebar').innerHTML = `
  <div id="sb-header">
    <span style="font-size:18px;">${tdef.icon}</span>
    <span style="font-family:'Cinzel',serif;font-size:.78rem;letter-spacing:.05em;color:${brd};text-transform:uppercase;flex:1;">${tdef.label}</span>
    <button class="s-btn s-cancel" data-action="close-sidebar">✕</button>
  </div>
  <div id="sb-body">
    <div class="e-group"><label class="lml">Titel</label>
      <input class="e-inp" value="${esc(z.title || '')}" placeholder="${tdef.label}…" data-input-action="zettel-field" data-field="title"/></div>
    ${z.typ !== 'zeitung' ? `<div class="e-group"><label class="lml">Untertitel</label>
      <input class="e-inp" value="${esc(z.untertitel || '')}" placeholder="Zusatz, Datum…" data-input-action="zettel-field" data-field="untertitel"/></div>` : ''}
    ${['quest','ankuendigung','vermisst','notiz'].includes(z.typ) ? `<div class="e-group"><label class="lml">Bild-URL</label>
      <input class="e-inp" value="${esc(z.bild || '')}" placeholder="https://i.imgur.com/…" data-input-action="zettel-field" data-field="bild"/></div>` : ''}
    ${['vermisst','quest'].includes(z.typ) ? `<div class="e-group"><label class="lml">Portrait (URL)</label>
      <input class="e-inp" value="${esc(z.portrait || '')}" placeholder="https://i.imgur.com/…" data-input-action="zettel-field" data-field="portrait"/></div>` : ''}
    ${z.typ === 'quest' ? `<div class="e-group"><label class="lml">Verfasser Portrait (Kreis, URL)</label>
      <input class="e-inp" value="${esc(z.verfasser || '')}" placeholder="https://i.imgur.com/…" data-input-action="zettel-field" data-field="verfasser"/></div>
    <div class="e-group"><label class="lml">Verfasser Name (Unterschrift)</label>
      <input class="e-inp" value="${esc(z.verfasserName || '')}" placeholder="Bürgermeister der Stadt…" data-input-action="zettel-field" data-field="verfasserName"/></div>` : ''}
    ${z.typ === 'zeitung' ? `<div class="e-group"><label class="lml">Verlags-Name / Zeitungstitel</label>
      <input class="e-inp" value="${esc(z.verlag || '')}" placeholder="Der Stadtbote" data-input-action="zettel-field" data-field="verlag"/></div>
    <div class="e-group"><label class="lml">Ausgaben-Datum</label>
      <input class="e-inp" value="${esc(z.datum || '')}" placeholder="3. Herbstmond 1423" data-input-action="zettel-field" data-field="datum"/></div>` : ''}
    ${z.typ !== 'zeitung' ? `<div class="e-group"><label class="lml">Text</label>
      <textarea class="e-ta" rows="5" data-input-action="zettel-field" data-field="text">${esc(z.text || '')}</textarea></div>` : ''}
    ${artikelHTML}
    ${z.typ === 'steckbrief' ? `
    <div class="lsb-sec-ttl" style="margin:.8rem 0 .3rem;border-top:1px solid var(--border2);padding-top:.6rem;">Gesuchte Personen</div>
    <div id="sb-personen-list">${renderPersonenList(z)}</div>
    <button class="add-row" style="margin-bottom:.5rem;" data-action="person-add">＋ Person hinzufügen</button>
    ` : `
    <div class="lsb-sec-ttl" style="margin:.6rem 0 .3rem;">Infotabelle</div>
    <div id="ze-table-rows">${tblRows}</div>
    <div style="display:flex;gap:.3rem;"><button class="add-row" style="flex:1;" data-action="zettel-table-add">＋ Zeile</button><button class="add-row" style="flex:1;border-style:solid;opacity:.8;" data-action="zettel-star-add">☆ Sternzeile</button></div>
    `}
    <div class="e-group" style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem;">
      <input type="checkbox" id="ze-secret" ${z.secret ? 'checked' : ''} data-input-action="zettel-field" data-field="secret"/>
      <label for="ze-secret" class="lml" style="margin:0;cursor:pointer;">🔒 Geheim</label>
    </div>
  </div>
  <div id="sb-footer">
    <div style="width:100%;display:flex;align-items:center;gap:.5rem;padding:.3rem .1rem .4rem;border-bottom:1px solid var(--border2);margin-bottom:.15rem;">
      <span style="font-family:'Cinzel',serif;font-size:.6rem;color:#5a3a08;white-space:nowrap;">↔ Karte</span>
      <input type="range" id="card-w-slider-z" min="500" max="1600" step="20" value="${z.cardWidth || state().cardWidth || 1100}"
        style="flex:1;accent-color:var(--gold);cursor:pointer;"
        data-input-action="zettel-card-width" data-zettel-id="${z.id}"/>
      <span id="card-w-val-z" style="font-family:'Cinzel',serif;font-size:.6rem;color:#5a3a08;min-width:36px;">${z.cardWidth || state().cardWidth || 1100}px</span>
    </div>
    <button class="s-btn s-save" data-action="zettel-save-close">✓ Speichern</button>
    <button class="s-btn s-cancel" data-action="close-sidebar">Abbrechen</button>
    <button class="s-btn" style="margin-left:auto;color:var(--red);border-color:var(--red);" data-action="zettel-delete" data-zettel-id="${z.id}">🗑</button>
  </div>`;
    rt().openEditorShell('zettel', z.id);
  }

  function zettelField(k, v){
    const z = currentZettel();
    if(!z) return;
    z[k] = v;
    renderBoard();
    preview();
  }
  function zettelTableK(i, v){ const z = currentZettel(); if(z && z.table[i]){z.table[i].k = v; preview();} }
  function zettelTableV(i, v){ const z = currentZettel(); if(z && z.table[i]){z.table[i].v = v; preview();} }
  function zettelTableDel(i){ const z = currentZettel(); if(!z) return; z.table.splice(i, 1); renderZettelSidebarEdit(z); }
  function zettelTableAdd(){ const z = currentZettel(); if(!z) return; if(!z.table) z.table = []; z.table.push({k:'', v:'', type:'text'}); renderZettelSidebarEdit(z); }
  function zettelStarAdd(){ const z = currentZettel(); if(!z) return; if(!z.table) z.table = []; z.table.push({k:'Bewertung', v:'0', type:'stars'}); renderZettelSidebarEdit(z); }
  function zettelStarSet(i, val){
    const z = currentZettel();
    if(!z?.table?.[i]) return;
    z.table[i].v = String(val);
    const sp = document.getElementById('gsp-' + i);
    if(!sp) return;
    sp.querySelectorAll('span').forEach((s, n) => {
      const on = n + 1 <= val;
      s.className = on ? 'on' : '';
      s.textContent = on ? '\u2605' : '\u2606';
    });
    renderBoard();
    preview();
  }
  function zettelStarHover(i, val){
    const sp = document.getElementById('gsp-' + i);
    if(!sp) return;
    sp.querySelectorAll('span').forEach((s, n) => s.classList.toggle('hover', n + 1 <= val));
  }
  function zettelStarOut(i){
    const sp = document.getElementById('gsp-' + i);
    if(!sp) return;
    sp.querySelectorAll('span').forEach(s => s.classList.remove('hover'));
  }
  function zettelArtikel(i, k, v){ const z = currentZettel(); if(!z || !z.artikel) return; z.artikel[i][k] = v; preview(); }
  function zettelArtikelAdd(){
    const z = currentZettel();
    if(!z) return;
    if(!z.artikel) z.artikel = [];
    if(z.artikel.length >= 6) return;
    z.artikel.push({titel:'Artikel ' + (z.artikel.length + 1), text:''});
    renderZettelSidebarEdit(z);
  }
  function zettelArtikelRemove(i){
    const z = currentZettel();
    if(!z || !z.artikel) return;
    z.artikel.splice(i, 1);
    renderZettelSidebarEdit(z);
  }

  function renderPersonenList(z){
    const pers = z.personen || [];
    if(!pers.length) return '<em style="opacity:.5;font-size:.8rem;">Keine Personen</em>';
    return pers.map((p, i) => `
  <div style="border:1px solid var(--border2);border-radius:3px;padding:.55rem .6rem;margin-bottom:.4rem;background:#f0e8c0;">
    <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.35rem;">
      <span style="font-family:'Cinzel',serif;font-size:.72rem;color:var(--gold);flex:1;">Person ${i + 1}</span>
      ${i > 0 ? `<button class="del-row" data-action="person-remove" data-person-index="${i}">✕</button>` : ''}
    </div>
    <label class="lml">Name / Titel</label>
    <input class="e-inp" value="${esc(p.title || '')}" placeholder="Name…" data-input-action="person-field" data-person-index="${i}" data-field="title"/>
    <label class="lml" style="margin-top:.3rem;">Untertitel / Alias</label>
    <input class="e-inp" value="${esc(p.untertitel || '')}" placeholder="Alias, Beinamen…" data-input-action="person-field" data-person-index="${i}" data-field="untertitel"/>
    <label class="lml" style="margin-top:.3rem;">Portrait-URL</label>
    <input class="e-inp" value="${esc(p.portrait || '')}" placeholder="https://i.imgur.com/…" data-input-action="person-field" data-person-index="${i}" data-field="portrait"/>
    <label class="lml" style="margin-top:.3rem;">Beschreibungstext</label>
    <textarea class="e-ta" rows="3" data-input-action="person-field" data-person-index="${i}" data-field="text">${esc(p.text || '')}</textarea>
    <label class="lml" style="margin-top:.3rem;">Infotabelle</label>
    <div id="sb-pers-tbl-${i}">${renderPersonTable(p, i)}</div>
    <div style="display:flex;gap:.3rem;margin-top:.3rem;"><button class="add-row" style="flex:1;" data-action="person-table-add" data-person-index="${i}">＋ Zeile</button><button class="add-row" style="flex:1.6;border-style:solid;opacity:.8;" data-action="person-table-template" data-person-index="${i}">📋 Verbrechen &amp; Kopfgeld</button></div>
  </div>`).join('');
  }

  function renderPersonTable(p, pi){
    return (p.table || []).map((r, ri) => {
      const isStars = r.type === 'stars';
      const starVal = parseInt(r.v, 10) || 0;
      const starHTML = isStars
        ? `<div class="star-pick" id="sp-${pi}-${ri}">${[1,2,3,4,5].map(n => `<span class="${n <= starVal ? 'on' : ''}" data-action="person-star-set" data-mouseover-action="person-star-hover" data-mouseout-action="person-star-out" data-person-index="${pi}" data-row-index="${ri}" data-value="${n}">${n <= starVal ? '\u2605' : '\u2606'}</span>`).join('')}</div>`
        : `<input class="tv" value="${esc(r.v)}" placeholder="Wert\u2026" data-input-action="person-table-value" data-person-index="${pi}" data-row-index="${ri}"/>`;
      return `<div class="tbl-row">
    <input class="tk" value="${esc(r.k)}" placeholder="Feld\u2026" data-input-action="person-table-key" data-person-index="${pi}" data-row-index="${ri}"/>
    ${starHTML}
    <button class="del-row" data-action="person-table-delete" data-person-index="${pi}" data-row-index="${ri}">\u2715</button></div>`;
    }).join('');
  }

  function sbStarSet(pi, ri, val){
    const z = currentZettel();
    if(!z?.personen?.[pi]?.table?.[ri]) return;
    z.personen[pi].table[ri].v = String(val);
    const sp = document.getElementById(`sp-${pi}-${ri}`);
    if(!sp) return;
    sp.querySelectorAll('span').forEach((s, i) => {
      const on = i + 1 <= val;
      s.className = on ? 'on' : '';
      s.textContent = on ? '\u2605' : '\u2606';
    });
    renderBoard();
  }
  function sbStarHover(pi, ri, val){
    const sp = document.getElementById(`sp-${pi}-${ri}`);
    if(!sp) return;
    sp.querySelectorAll('span').forEach((s, i) => s.classList.toggle('hover', i + 1 <= val));
  }
  function sbStarOut(pi, ri){
    const sp = document.getElementById(`sp-${pi}-${ri}`);
    if(!sp) return;
    sp.querySelectorAll('span').forEach(s => s.classList.remove('hover'));
  }
  function sbPersonField(pi, k, v){ const z = currentZettel(); if(!z || !z.personen) return; z.personen[pi][k] = v; renderBoard(); preview(); }
  function sbPersonTableK(pi, ri, v){ const z = currentZettel(); if(z?.personen?.[pi]?.table?.[ri]){z.personen[pi].table[ri].k = v; preview();} }
  function sbPersonTableV(pi, ri, v){ const z = currentZettel(); if(z?.personen?.[pi]?.table?.[ri]){z.personen[pi].table[ri].v = v; preview();} }
  function sbPersonTableDel(pi, ri){
    const z = currentZettel();
    if(!z?.personen?.[pi]) return;
    z.personen[pi].table.splice(ri, 1);
    document.getElementById('sb-pers-tbl-' + pi).innerHTML = renderPersonTable(z.personen[pi], pi);
  }
  function sbPersonTableTemplate(pi){
    const z = currentZettel();
    if(!z?.personen?.[pi]) return;
    if(!z.personen[pi].table) z.personen[pi].table = [];
    const tpl = [
      {k:'Hauptverbrechen', v:'', type:'text'},
      {k:'Gefährlichkeitsgrad', v:'0', type:'stars'},
      {k:'Bekannte Opfer / Ziele', v:'', type:'text'},
      {k:'Letzte Sichtung', v:'', type:'text'},
      {k:'Kopfgeld', v:'', type:'text'},
      {k:'Sonstige Belohnung', v:'', type:'text'},
      {k:'Bande / Verbündete', v:'', type:'text'},
    ];
    tpl.forEach(row => {
      if(!z.personen[pi].table.some(r => r.k === row.k)) z.personen[pi].table.push({...row});
    });
    document.getElementById('sb-pers-tbl-' + pi).innerHTML = renderPersonTable(z.personen[pi], pi);
  }
  function sbPersonTableAdd(pi){
    const z = currentZettel();
    if(!z?.personen?.[pi]) return;
    if(!z.personen[pi].table) z.personen[pi].table = [];
    z.personen[pi].table.push({k:'', v:''});
    document.getElementById('sb-pers-tbl-' + pi).innerHTML = renderPersonTable(z.personen[pi], pi);
  }
  function sbPersonAdd(){
    const z = currentZettel();
    if(!z) return;
    if(!z.personen) z.personen = [];
    z.personen.push({portrait:'', title:'', untertitel:'', text:'', table:[]});
    document.getElementById('sb-personen-list').innerHTML = renderPersonenList(z);
  }
  function sbPersonRemove(pi){
    const z = currentZettel();
    if(!z?.personen || pi === 0) return;
    z.personen.splice(pi, 1);
    document.getElementById('sb-personen-list').innerHTML = renderPersonenList(z);
  }
  function zettelSaveAndClose(){
    save();
    renderBoard();
    rt().closeSidebar();
    activeZettelId = null;
    rt().toast('Zettel gespeichert');
  }
  function zettelDelete(id){
    if(!rt().canEditZettel()){
      rt().toast('Zettel koennen nur in der Tafel-Ansicht geloescht werden');
      return;
    }
    if(!confirm('Zettel wirklich löschen?')) return;
    state().zettel = state().zettel.filter(x => x.id !== id);
    rt().closeSidebar();
    activeZettelId = null;
    renderBoard();
    save();
    rt().toast('Zettel gelöscht');
  }
  function clearActive(){
    activeZettelId = null;
  }

  window.TafelZettelEditor = {
    open: openZettelSidebar,
    render: renderZettelSidebarEdit,
    clearActive
  };

  Object.assign(window, {
    openZettelSidebar,
    renderZettelSidebarEdit,
    zettelField,
    zettelTableK,
    zettelTableV,
    zettelTableDel,
    zettelTableAdd,
    zettelStarAdd,
    zettelStarSet,
    zettelStarHover,
    zettelStarOut,
    zettelArtikel,
    zettelArtikelAdd,
    zettelArtikelRemove,
    sbPersonField,
    sbPersonTableK,
    sbPersonTableV,
    sbPersonTableDel,
    sbPersonTableTemplate,
    sbPersonTableAdd,
    sbPersonAdd,
    sbPersonRemove,
    sbStarSet,
    sbStarHover,
    sbStarOut,
    zettelSaveAndClose,
    zettelDelete
  });
})();
