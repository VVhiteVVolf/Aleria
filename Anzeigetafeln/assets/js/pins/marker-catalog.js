(function(){
  const rt = () => window.TafelRuntime;
  const state = () => rt().state();
  const esc = value => rt().esc(value);
  const uid = () => rt().uid();
  const save = () => rt().save();
  const toast = message => rt().toast(message);
  const closeModal = id => rt().closeModal(id);

  function catalog(){
    const current = state();
    return current.markerCatalog || (current.markerCatalog = []);
  }

  function openMarkerCatalog(){
    mcatRender();
    document.getElementById('mcat-mo').classList.add('open');
  }

  function mcatAdd(){
    const url = (document.getElementById('mcat-url').value || '').trim();
    const name = (document.getElementById('mcat-name').value || '').trim();
    const group = (document.getElementById('mcat-group').value || '').trim();
    if(!url){ toast('⚠ URL fehlt'); return; }
    if(!name){ toast('⚠ Name fehlt'); return; }
    if(!url.match(/^https?:\/\//i)){ toast('⚠ Ungültige URL'); return; }
    catalog().push({id: uid(), url, name, group});
    save();
    document.getElementById('mcat-url').value = '';
    document.getElementById('mcat-name').value = '';
    document.getElementById('mcat-group').value = '';
    mcatRender();
    toast('✓ Marker hinzugefügt');
  }

  function mcatDelete(id){
    const current = state();
    current.markerCatalog = (current.markerCatalog || []).filter(marker => marker.id !== id);
    save();
    mcatRender();
  }

  function mcatRender(){
    const list = catalog();
    const query = (document.getElementById('mcat-search')?.value || '').toLowerCase();
    const groupFilter = document.getElementById('mcat-filter')?.value || '';
    const groups = [...new Set(list.map(marker => marker.group || '').filter(Boolean))].sort();
    const filterSelect = document.getElementById('mcat-filter');
    if(filterSelect){
      const current = filterSelect.value;
      filterSelect.innerHTML = '<option value="">Alle Gruppen</option>' + groups.map(group => `<option value="${esc(group)}"${group === current ? ' selected' : ''}>${esc(group)}</option>`).join('');
    }

    const filtered = list.filter(marker => {
      const matchesQuery = !query || (marker.name.toLowerCase().includes(query) || (marker.group || '').toLowerCase().includes(query));
      const matchesGroup = !groupFilter || (marker.group || '') === groupFilter;
      return matchesQuery && matchesGroup;
    });

    document.getElementById('mcat-count').textContent = `${filtered.length} von ${list.length}`;
    const grid = document.getElementById('mcat-grid');
    if(!filtered.length){
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;font-family:'EB Garamond',serif;color:#5a3a08;">Keine Marker gefunden.</div>`;
      return;
    }

    const grouped = {};
    filtered.forEach(marker => {
      const group = marker.group || 'Ohne Gruppe';
      if(!grouped[group]) grouped[group] = [];
      grouped[group].push(marker);
    });

    grid.innerHTML = Object.entries(grouped).map(([group, items]) => `
      <div class="mcat-grp-header">${esc(group)}</div>
      ${items.map(marker => `
        <div class="mcat-item" title="${esc(marker.name)}${marker.group ? ' · ' + esc(marker.group) : ''}">
          <img src="${esc(marker.url)}" alt="${esc(marker.name)}" loading="lazy"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 48%22><text y=%2230%22 font-size=%2224%22>📍</text></svg>'"/>
          <span class="mcat-lbl">${esc(marker.name)}</span>
          <button class="mcat-del" data-action="delete-marker-catalog-item" data-marker-id="${marker.id}" title="Löschen">✕</button>
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
      const clean = line.trim();
      if(!clean) return;
      const parts = clean.split(',');
      const url = (parts[0] || '').trim();
      const name = (parts[1] || '').trim();
      const group = (parts[2] || '').trim();
      if(!url || !name || !url.match(/^https?:\/\//i)){ skipped++; return; }
      catalog().push({id: uid(), url, name, group});
      added++;
    });
    save();
    mcatRender();
    closeModal('mcat-bulk-mo');
    toast(`✓ ${added} Marker importiert${skipped ? `, ${skipped} übersprungen` : ''}`);
  }

  window.openMarkerCatalog = openMarkerCatalog;
  window.mcatAdd = mcatAdd;
  window.mcatDelete = mcatDelete;
  window.mcatRender = mcatRender;
  window.mcatBulkOpen = mcatBulkOpen;
  window.mcatBulkApply = mcatBulkApply;
})();
