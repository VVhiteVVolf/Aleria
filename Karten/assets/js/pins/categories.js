(function(){
  const runtime = window.KartoRuntime;
  let tempCats = [];
  let catMarkerIndex = null;

  function state(){
    return runtime.state();
  }

  function renderCatBar(){
    const bar = document.getElementById('cat-bar');
    if(!bar) return;
    const s = state();
    const activeFilter = runtime.activeFilter();
    const esc = runtime.esc;
    bar.innerHTML =
      `<button class="cbt${activeFilter==='all'?' on':''}" data-action="set-category-filter" data-category-id="all">Alle</button>` +
      s.cats.map(c => `
        <button class="cbt${activeFilter===c.id?' on':''}" data-action="set-category-filter" data-category-id="${esc(c.id)}">
          <span class="cdot" style="width:8px;height:8px;border-radius:50%;background:${c.color};flex-shrink:0;border:1.5px solid rgba(0,0,0,.18);display:inline-block;"></span>${esc(c.label)}
        </button>`).join('');
  }

  function setFilter(id){
    runtime.setActiveFilter(id);
    renderCatBar();
    runtime.renderPins();
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
    const esc = runtime.esc;
    body.innerHTML = tempCats.map((c, i) => {
      const markerUrl = c.marker || '';
      return `
      <div class="cat-row-edit" id="cre-${i}">
        <div class="cat-color-pick" style="background:${c.color}" title="Farbe wählen">
          <input type="color" value="${c.color}" data-input-action="set-temp-category-color" data-category-index="${i}"/>
        </div>
        <input class="cat-name-inp" value="${esc(c.label)}" placeholder="Kategoriename" data-input-action="set-temp-category-label" data-category-index="${i}"/>
        <div class="cat-marker-pick" data-action="pick-category-marker" data-category-index="${i}" title="Marker zuweisen">
          ${markerUrl?`<img src="${esc(markerUrl)}" style="width:22px;height:26px;object-fit:contain;display:block;"/>`:'<span style="font-size:.7rem;color:var(--ink3);">📍?</span>'}
        </div>
        <button class="cat-rm" data-action="remove-temp-category" data-category-index="${i}" title="Entfernen">✕</button>
      </div>`;
    }).join('') +
      `<button class="cat-add-btn" data-action="add-temp-category">＋ Neue Kategorie</button>`;
  }

  function setTempCategoryColor(index, value, input){
    if(!tempCats[index]) return;
    tempCats[index].color = value;
    input.parentElement.style.background = value;
  }

  function setTempCategoryLabel(index, value){
    if(tempCats[index]) tempCats[index].label = value;
  }

  function removeTempCat(index){
    tempCats.splice(index, 1);
    renderCatMgrBody();
  }

  function addTempCat(){
    const colors = ['#c49a20','#6060b0','#b03030','#9050b0','#3a8a3a','#2a7aaa','#7a6040','#c07030','#508080'];
    tempCats.push({id: runtime.uid(), label:'Neue Kategorie', color:colors[tempCats.length % colors.length]});
    renderCatMgrBody();
  }

  function saveCats(){
    document.querySelectorAll('.cat-name-inp').forEach((input, i) => {
      if(tempCats[i]) tempCats[i].label = input.value.trim() || tempCats[i].label;
    });
    runtime.setCategories(JSON.parse(JSON.stringify(tempCats)));
    closeCatMgr();
    renderCatBar();
    runtime.renderPins();
    runtime.save();
    runtime.toast('✓ Kategorien gespeichert');
  }

  function catPickMarker(index){
    catMarkerIndex = index;
    document.getElementById('catmkr-search').value = '';
    const esc = runtime.esc;
    const groups = [...new Set((state().markerCatalog || []).map(m => m.group || '').filter(Boolean))].sort();
    const filter = document.getElementById('catmkr-filter');
    filter.innerHTML = '<option value="">Alle Gruppen</option>' + groups.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('');
    renderCatMarkerGrid('');
    document.getElementById('cat-marker-mo').classList.add('open');
  }

  function renderCatMarkerGrid(q){
    q = (q || '').toLowerCase();
    const esc = runtime.esc;
    const groupFilter = document.getElementById('catmkr-filter')?.value || '';
    const list = (state().markerCatalog || []).filter(m => {
      const matchQuery = !q || (m.name.toLowerCase().includes(q) || (m.group || '').toLowerCase().includes(q));
      const matchGroup = !groupFilter || (m.group || '') === groupFilter;
      return matchQuery && matchGroup;
    });
    const grid = document.getElementById('catmkr-grid');
    if(!list.length){
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;font-family:'EB Garamond',serif;color:var(--ink3);">Keine Marker gefunden.</div>`;
      return;
    }

    const grouped = {};
    list.forEach(m => {
      const group = m.group || 'Ohne Gruppe';
      if(!grouped[group]) grouped[group] = [];
      grouped[group].push(m);
    });

    grid.innerHTML = Object.entries(grouped).map(([group, items]) => `
      <div class="mcat-grp-header">${esc(group)}</div>
      ${items.map(m => `
        <div class="mcat-item" data-action="set-category-marker" data-marker-url="${esc(m.url)}" title="${esc(m.name)}">
          <img src="${esc(m.url)}" loading="lazy" style="width:48px;height:58px;object-fit:contain;"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 48%22><text y=%2230%22 font-size=%2224%22>📍</text></svg>'"/>
          <span class="mcat-lbl">${esc(m.name)}</span>
        </div>`).join('')}
    `).join('');
  }

  function catSetMarker(url){
    if(catMarkerIndex === null) return;
    tempCats[catMarkerIndex].marker = url;
    runtime.closeModal('cat-marker-mo');
    renderCatMgrBody();
  }

  function catClearMarker(){
    if(catMarkerIndex === null) return;
    delete tempCats[catMarkerIndex].marker;
    runtime.closeModal('cat-marker-mo');
    renderCatMgrBody();
  }

  function toggleCatBar(){
    const bar = document.getElementById('cat-bar');
    const btn = document.getElementById('cat-bar-toggle');
    const collapsed = bar.classList.toggle('collapsed');
    btn.textContent = collapsed ? '▲ Kategorien' : '▼ Kategorien';
    btn.classList.toggle('collapsed', collapsed);
  }

  window.renderCatBar = renderCatBar;
  window.setFilter = setFilter;
  window.openCatMgr = openCatMgr;
  window.closeCatMgr = closeCatMgr;
  window.renderCatMgrBody = renderCatMgrBody;
  window.setTempCategoryColor = setTempCategoryColor;
  window.setTempCategoryLabel = setTempCategoryLabel;
  window.removeTempCat = removeTempCat;
  window.addTempCat = addTempCat;
  window.saveCats = saveCats;
  window.catPickMarker = catPickMarker;
  window.renderCatMarkerGrid = renderCatMarkerGrid;
  window.catSetMarker = catSetMarker;
  window.catClearMarker = catClearMarker;
  window.toggleCatBar = toggleCatBar;
})();
