(function(){
  const rt = () => window.TafelRuntime;
  const state = () => rt().state();
  const esc = value => rt().esc(value);
  const uid = () => rt().uid();
  const save = () => rt().save();
  const toast = message => rt().toast(message);
  const closeModal = id => rt().closeModal(id);
  const renderPins = () => rt().renderPins();

  let tempCats = [];
  let markerPickIndex = null;

  function layerKey(){
    const map = {normal: 'tafel', pins: 'pins'};
    return map[rt().currentLayer()] || 'tafel';
  }

  function renderCatBar(){
    const bar = document.getElementById('cat-bar');
    if(!bar) return;
    const current = state();
    const visibleCats = current.cats.filter(cat => !cat.layer || cat.layer === layerKey() || cat.layer === 'both');
    let active = rt().activeCategoryFilter();
    if(active !== 'all' && !visibleCats.find(cat => cat.id === active)){
      active = 'all';
      rt().setActiveCategoryFilter(active);
    }
    bar.innerHTML =
      `<button class="cbt${active === 'all' ? ' on' : ''}" data-action="set-category-filter" data-category-id="all">Alle</button>` +
      visibleCats.map(cat => `
        <button class="cbt${active === cat.id ? ' on' : ''}" data-action="set-category-filter" data-category-id="${cat.id}">
          <span class="cdot" style="width:8px;height:8px;border-radius:50%;background:${cat.color};flex-shrink:0;border:1.5px solid rgba(0,0,0,.18);display:inline-block;"></span>${esc(cat.label)}
        </button>`).join('');
  }

  function setFilter(id){
    rt().setActiveCategoryFilter(id);
    renderCatBar();
    renderPins();
  }

  function openCatMgr(){
    tempCats = JSON.parse(JSON.stringify(state().cats));
    renderCatMgrBody();
    document.getElementById('catmgr-mo').classList.add('open');
  }

  function closeCatMgr(){
    document.getElementById('catmgr-mo').classList.remove('open');
  }

  function renderCatMgrBody(){
    const body = document.getElementById('catmgr-body');
    body.innerHTML = tempCats.map((cat, index) => {
      const markerUrl = cat.marker || '';
      return `
      <div class="cat-row-edit" id="cre-${index}">
        <div class="cat-color-pick" style="background:${cat.color}" title="Farbe wählen">
          <input type="color" value="${cat.color}" data-input-action="update-temp-category-color" data-cat-index="${index}"/>
        </div>
        <input class="cat-name-inp" value="${esc(cat.label)}" placeholder="Kategoriename" data-input-action="update-temp-category-label" data-cat-index="${index}"/>
        <div class="cat-marker-pick" data-action="pick-temp-category-marker" data-cat-index="${index}" title="Marker zuweisen">
          ${markerUrl ? `<img src="${esc(markerUrl)}" style="width:22px;height:26px;object-fit:contain;display:block;"/>` : '<span style="font-size:.7rem;color:#5a3a08;">📍?</span>'}
        </div>
        <button class="cat-rm" data-action="remove-temp-category" data-cat-index="${index}" title="Entfernen">✕</button>
      </div>`;
    }).join('') +
      `<button class="cat-add-btn" data-action="add-temp-category">＋ Neue Kategorie</button>`;
  }

  function removeTempCat(index){
    tempCats.splice(index, 1);
    renderCatMgrBody();
  }

  function addTempCat(){
    const colors = ['#c49a20', '#6060b0', '#b03030', '#9050b0', '#3a8a3a', '#2a7aaa', '#7a6040', '#c07030', '#508080'];
    tempCats.push({id: uid(), label: 'Neue Kategorie', color: colors[tempCats.length % colors.length]});
    renderCatMgrBody();
  }

  function updateTempCatColor(index, value, picker){
    if(!tempCats[index]) return;
    tempCats[index].color = value;
    if(picker) picker.style.background = value;
  }

  function updateTempCatLabel(index, value){
    if(!tempCats[index]) return;
    tempCats[index].label = value;
  }

  function saveCats(){
    document.querySelectorAll('.cat-name-inp').forEach((input, index) => {
      if(tempCats[index]) tempCats[index].label = input.value.trim() || tempCats[index].label;
    });
    const current = state();
    current.cats = JSON.parse(JSON.stringify(tempCats));
    closeCatMgr();
    renderCatBar();
    renderPins();
    save();
    toast('✓ Kategorien gespeichert');
  }

  function catPickMarker(index){
    markerPickIndex = index;
    document.getElementById('catmkr-search').value = '';
    const groups = [...new Set((state().markerCatalog || []).map(marker => marker.group || '').filter(Boolean))].sort();
    const filterSelect = document.getElementById('catmkr-filter');
    filterSelect.innerHTML = '<option value="">Alle Gruppen</option>' + groups.map(group => `<option value="${esc(group)}">${esc(group)}</option>`).join('');
    renderCatMarkerGrid('');
    document.getElementById('cat-marker-mo').classList.add('open');
  }

  function renderCatMarkerGrid(query){
    const q = (query || '').toLowerCase();
    const groupFilter = document.getElementById('catmkr-filter')?.value || '';
    const list = (state().markerCatalog || []).filter(marker => {
      const matchesQuery = !q || (marker.name.toLowerCase().includes(q) || (marker.group || '').toLowerCase().includes(q));
      const matchesGroup = !groupFilter || (marker.group || '') === groupFilter;
      return matchesQuery && matchesGroup;
    });
    const grid = document.getElementById('catmkr-grid');
    if(!list.length){
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;font-family:'EB Garamond',serif;color:#5a3a08;">Keine Marker gefunden.</div>`;
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
        <div class="mcat-item" data-action="pick-category-marker" data-marker-url="${esc(marker.url)}" title="${esc(marker.name)}">
          <img src="${esc(marker.url)}" loading="lazy" style="width:48px;height:58px;object-fit:contain;"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 48%22><text y=%2230%22 font-size=%2224%22>📍</text></svg>'"/>
          <span class="mcat-lbl">${esc(marker.name)}</span>
        </div>`).join('')}
    `).join('');
  }

  function catSetMarker(url){
    if(markerPickIndex === null) return;
    tempCats[markerPickIndex].marker = url;
    closeModal('cat-marker-mo');
    renderCatMgrBody();
  }

  function catClearMarker(){
    if(markerPickIndex === null) return;
    delete tempCats[markerPickIndex].marker;
    closeModal('cat-marker-mo');
    renderCatMgrBody();
  }

  window.renderCatBar = renderCatBar;
  window.setFilter = setFilter;
  window.openCatMgr = openCatMgr;
  window.closeCatMgr = closeCatMgr;
  window.saveCats = saveCats;
  window.catPickMarker = catPickMarker;
  window.renderCatMarkerGrid = renderCatMarkerGrid;
  window.catSetMarker = catSetMarker;
  window.catClearMarker = catClearMarker;
  window.removeTempCat = removeTempCat;
  window.addTempCat = addTempCat;
  window.updateTempCatColor = updateTempCatColor;
  window.updateTempCatLabel = updateTempCatLabel;
})();
