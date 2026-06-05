(function(){
  const runtime = window.KartoRuntime;

  function state(){
    return runtime.state();
  }

  function mcatGet(){
    const s = state();
    return s.markerCatalog || (s.markerCatalog = []);
  }

  function openMarkerCatalog(){
    mcatRender();
    document.getElementById('mcat-mo').classList.add('open');
  }

  function mcatAdd(){
    const url = (document.getElementById('mcat-url').value || '').trim();
    const name = (document.getElementById('mcat-name').value || '').trim();
    const group = (document.getElementById('mcat-group').value || '').trim();
    if(!url){ runtime.toast('⚠ URL fehlt'); return; }
    if(!name){ runtime.toast('⚠ Name fehlt'); return; }
    if(!url.match(/^https?:\/\//i)){ runtime.toast('⚠ Ungültige URL'); return; }
    mcatGet().push({id: runtime.uid(), url, name, group});
    runtime.save();
    document.getElementById('mcat-url').value = '';
    document.getElementById('mcat-name').value = '';
    document.getElementById('mcat-group').value = '';
    mcatRender();
    runtime.toast('✓ Marker hinzugefügt');
  }

  function mcatDelete(id){
    const s = state();
    runtime.setMarkerCatalog((s.markerCatalog || []).filter(m => m.id !== id));
    runtime.save();
    mcatRender();
  }

  function mcatRender(){
    const list = mcatGet();
    const q = (document.getElementById('mcat-search')?.value || '').toLowerCase();
    const gf = document.getElementById('mcat-filter')?.value || '';
    const esc = runtime.esc;

    const groups = [...new Set(list.map(m => m.group || '').filter(Boolean))].sort();
    const fsel = document.getElementById('mcat-filter');
    if(fsel){
      const cur = fsel.value;
      fsel.innerHTML = '<option value="">Alle Gruppen</option>' + groups.map(g => `<option value="${esc(g)}"${g===cur?' selected':''}>${esc(g)}</option>`).join('');
    }

    const filtered = list.filter(m => {
      const matchQ = !q || (m.name.toLowerCase().includes(q) || (m.group || '').toLowerCase().includes(q));
      const matchG = !gf || (m.group || '') === gf;
      return matchQ && matchG;
    });

    document.getElementById('mcat-count').textContent = `${filtered.length} von ${list.length}`;

    const grid = document.getElementById('mcat-grid');
    if(!filtered.length){
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;font-family:'EB Garamond',serif;color:var(--ink3);">Keine Marker gefunden.</div>`;
      return;
    }

    const grouped = {};
    filtered.forEach(m => {
      const g = m.group || 'Ohne Gruppe';
      if(!grouped[g]) grouped[g] = [];
      grouped[g].push(m);
    });

    grid.innerHTML = Object.entries(grouped).map(([g, items]) => `
      <div class="mcat-grp-header">${esc(g)}</div>
      ${items.map(m => `
        <div class="mcat-item" title="${esc(m.name)}${m.group?' · '+esc(m.group):''}">
          <img src="${esc(m.url)}" alt="${esc(m.name)}" loading="lazy"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 48%22><text y=%2230%22 font-size=%2224%22>📍</text></svg>'"/>
          <span class="mcat-lbl">${esc(m.name)}</span>
          <button class="mcat-del" data-action="delete-marker-catalog-item" data-marker-id="${esc(m.id)}" title="Löschen">✕</button>
        </div>`).join('')}
    `).join('');
  }

  function mcatBulkOpen(){
    document.getElementById('mcat-bulk-txt').value = '';
    document.getElementById('mcat-bulk-preview').textContent = '';
    document.getElementById('mcat-bulk-mo').classList.add('open');
  }

  function mcatBulkApply(){
    const lines = document.getElementById('mcat-bulk-txt').value.split('\n');
    let added = 0;
    let skipped = 0;
    lines.forEach(line => {
      line = line.trim();
      if(!line) return;
      const parts = line.split(',');
      const url = (parts[0] || '').trim();
      const name = (parts[1] || '').trim();
      const group = (parts[2] || '').trim();
      if(!url || !name || !url.match(/^https?:\/\//i)){ skipped++; return; }
      mcatGet().push({id: runtime.uid(), url, name, group});
      added++;
    });
    runtime.save();
    mcatRender();
    runtime.closeModal('mcat-bulk-mo');
    runtime.toast(`✓ ${added} Marker importiert${skipped?`, ${skipped} übersprungen`:''}`);
  }

  window.mcatGet = mcatGet;
  window.openMarkerCatalog = openMarkerCatalog;
  window.mcatAdd = mcatAdd;
  window.mcatDelete = mcatDelete;
  window.mcatRender = mcatRender;
  window.mcatBulkOpen = mcatBulkOpen;
  window.mcatBulkApply = mcatBulkApply;
})();
