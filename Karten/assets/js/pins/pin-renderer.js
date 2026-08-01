(function(){
  const runtime = window.KartoRuntime;
  let dragId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragStartX = null;
  let dragStartY = null;
  let tooltipHideTimer = null;
  // Ctrl/Cmd+click toggles pin membership here - session-only, not saved.
  // Bulk actions (Kategorie ändern / Löschen) act on whatever's in here,
  // see bulkSetCategory()/bulkDeleteSelected() below.
  let selection = new Set();

  function state(){
    return runtime.state();
  }

  function isDragging(){
    return !!dragId;
  }

  function visiblePins(){
    const activeFilter = runtime.activeFilter();
    return state().pins.filter(pin => {
      if(pin.secret && !runtime.isEditMode()) return false;
      if(activeFilter !== 'all' && pin.cat !== activeFilter) return false;
      return true;
    });
  }

  function renderPins(){
    const layer = runtime.pinLayer();
    const image = runtime.mapImageSize();
    layer.innerHTML = '';
    if(!image.width) return;

    // Drop selection entries for pins that no longer exist (bulk-deleted,
    // or an add got undone) so a stale id can't silently linger.
    const validIds = new Set(state().pins.map(pin => pin.id));
    let selectionChanged = false;
    selection.forEach(id => { if(!validIds.has(id)){ selection.delete(id); selectionChanged = true; } });

    const options = runtime.pinDisplayOptions();
    visiblePins().forEach(pin => {
      const element = document.createElement('div');
      element.className = 'pin' + (runtime.isEditMode() ? ' edit-mode' : '') + (pin.secret ? ' secret' : '') + (selection.has(pin.id) ? ' selected' : '');
      element.dataset.id = pin.id;
      element.style.left = (pin.x * image.width) + 'px';
      element.style.top = (pin.y * image.height) + 'px';

      const category = runtime.categoryForPin(pin);
      const color = category.color || '#8a6510';
      const iconUrl = pin.pinMarker || category.marker || '';
      const labelGap = Math.round(options.dotSize * .3);

      let markerHtml;
      if(iconUrl){
        // Custom icon (from the Marker-Katalog, see assets/js/data/default-marker-catalog.js)
        // rendered permanently, not just on hover - this is the actual "use an icon
        // as a marker" feature. Anchored bottom-center (these are teardrop pin
        // graphics - the tip, not the visual center, belongs on the coordinate).
        // Falls back to the plain dot if the image 404s.
        const size = Math.round(options.dotSize * 2.2 * (pin.pinMarkerScale || 1));
        markerHtml = `<img class="pin-marker-img" src="${runtime.esc(iconUrl)}" alt="" width="${size}" height="${size}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'pin-dot',style:'width:${options.dotSize}px;height:${options.dotSize}px;background:${color};border-color:#fff;display:block;opacity:1;'}))"/>`;
      } else {
        markerHtml = `<div class="pin-dot" style="width:${options.dotSize}px;height:${options.dotSize}px;background:${color};border-color:#fff;"></div>`;
      }

      element.innerHTML = `
        ${markerHtml}
        <div class="pin-label" style="font-size:${options.labelSize}px;top:calc(100% + ${labelGap}px);">${runtime.esc(pin.title)}${pin.secret ? ' 🔒' : ''}</div>`;
      attachPinEvents(element, pin);
      layer.appendChild(element);
    });
    if(selectionChanged) updateBulkBar();
  }

  function attachPinEvents(element, pin){
    let pinDownX = 0;
    let pinDownY = 0;

    element.addEventListener('mouseenter', event => {
      if(runtime.isEditMode()) return;
      showTooltip(pin, event.clientX, event.clientY);
    });

    element.addEventListener('mousemove', event => {
      if(runtime.isEditMode()) return;
      moveTooltip(event.clientX, event.clientY);
    });

    element.addEventListener('mouseleave', hideTooltip);

    element.addEventListener('mousedown', event => {
      if(event.button !== 0) return;
      event.stopPropagation();
      pinDownX = event.clientX;
      pinDownY = event.clientY;
      if(!runtime.isEditMode()) return;

      dragId = pin.id;
      dragStartX = pin.x;
      dragStartY = pin.y;
      const image = runtime.mapImageSize();
      const point = runtime.mapPointFromClient(event.clientX, event.clientY);
      dragOffsetX = point.x - pin.x * image.width;
      dragOffsetY = point.y - pin.y * image.height;
      element.classList.add('dragging');
    });

    element.addEventListener('mouseup', event => {
      if(event.button !== 0) return;
      event.stopPropagation();
      const distance = Math.hypot(event.clientX - pinDownX, event.clientY - pinDownY);
      if(distance < 5){
        if(runtime.isEditMode() && (event.ctrlKey || event.metaKey)){
          toggleSelection(pin.id);
        } else if(window.KartoStampOverwrite?.isOverwriteActive()){
          window.KartoStampOverwrite.applyOverwrite(pin.id);
        } else {
          if(selection.size) clearSelection();
          runtime.openPin(pin.id, runtime.isEditMode() ? 'edit' : 'view');
        }
      }
      if(isDragging()) stopDrag({save:true, rerender:true});
    });
  }

  function moveDrag(clientX, clientY){
    if(!dragId) return false;
    const pin = state().pins.find(item => item.id === dragId);
    if(!pin){
      dragId = null;
      return false;
    }

    const image = runtime.mapImageSize();
    if(!image.width || !image.height) return false;
    const point = runtime.mapPointFromClient(clientX, clientY);
    pin.x = Math.max(0, Math.min(1, (point.x - dragOffsetX) / image.width));
    pin.y = Math.max(0, Math.min(1, (point.y - dragOffsetY) / image.height));
    renderPins();
    return true;
  }

  function stopDrag(options = {}){
    if(!dragId) return;
    const pin = state().pins.find(item => item.id === dragId);
    if(pin && dragStartX !== null && (pin.x !== dragStartX || pin.y !== dragStartY)){
      const id = dragId, fromX = dragStartX, fromY = dragStartY;
      runtime.pushUndo('Pin verschoben: ' + pin.title, () => {
        const target = state().pins.find(item => item.id === id);
        if(target){ target.x = fromX; target.y = fromY; }
      });
    }
    dragId = null;
    dragStartX = null;
    dragStartY = null;
    if(options.save) runtime.save();
    if(options.rerender) renderPins();
  }

  // ═══════════════════════════════════════════
  // SELECTION & BULK ACTIONS (edit mode only - Ctrl/Cmd+click a pin to
  // add/remove it, bulk-bar handles the rest)
  // ═══════════════════════════════════════════
  function toggleSelection(id){
    if(selection.has(id)) selection.delete(id);
    else selection.add(id);
    renderPins();
    updateBulkBar();
  }

  function clearSelection(){
    if(!selection.size) return;
    selection.clear();
    renderPins();
    updateBulkBar();
  }

  function selectedPins(){
    return state().pins.filter(pin => selection.has(pin.id));
  }

  function updateBulkBar(){
    const bar = document.getElementById('bulk-bar');
    if(!bar) return;
    const count = selection.size;
    if(!count){ bar.style.display = 'none'; return; }
    // Topbar height varies (flex-wrap adds rows once edit-mode buttons
    // appear) - measure it fresh each time instead of a fixed offset, so
    // the bar never sits on top of the topbar's buttons.
    const topbar = document.getElementById('topbar');
    if(topbar) bar.style.top = (topbar.getBoundingClientRect().bottom + 8) + 'px';
    bar.style.display = 'flex';
    document.getElementById('bulk-count').textContent = count + (count === 1 ? ' Pin ausgewählt' : ' Pins ausgewählt');
    const select = document.getElementById('bulk-cat-sel');
    if(select){
      const esc = runtime.esc;
      select.innerHTML = '<option value="">Kategorie ändern…</option>' +
        state().cats.map(cat => `<option value="${esc(cat.id)}">${esc(cat.label)}</option>`).join('');
    }
  }

  function bulkSetCategory(catId){
    if(!selection.size || !catId) return;
    const pins = selectedPins();
    const before = pins.map(pin => ({id: pin.id, cat: pin.cat}));
    pins.forEach(pin => { pin.cat = catId; });
    runtime.pushUndo('Kategorie geändert (' + before.length + ' Pins)', () => {
      before.forEach(entry => {
        const pin = state().pins.find(item => item.id === entry.id);
        if(pin) pin.cat = entry.cat;
      });
    });
    renderPins();
    runtime.save();
    runtime.toast('Kategorie geändert: ' + before.length + ' Pins');
  }

  function bulkDeleteSelected(){
    const count = selection.size;
    if(!count) return;
    if(!confirm(count + (count === 1 ? ' Pin' : ' Pins') + ' wirklich löschen?')) return;
    const snapshot = [];
    state().pins.forEach((pin, index) => {
      if(selection.has(pin.id)) snapshot.push({pin: JSON.parse(JSON.stringify(pin)), index});
    });
    const removeIds = new Set(selection);
    const s = state();
    s.pins = s.pins.filter(pin => !removeIds.has(pin.id));
    runtime.pushUndo(count + (count === 1 ? ' Pin gelöscht' : ' Pins gelöscht'), () => {
      const target = state();
      snapshot.forEach(entry => {
        target.pins.splice(Math.min(entry.index, target.pins.length), 0, entry.pin);
      });
    });
    clearSelection();
    runtime.save();
    runtime.toast(count + (count === 1 ? ' Pin gelöscht' : ' Pins gelöscht'));
  }

  function showTooltip(pin, clientX, clientY){
    clearTimeout(tooltipHideTimer);
    const tooltip = document.getElementById('pin-tooltip');
    const category = runtime.categoryForPin(pin);
    const color = category.color || '#8a6510';
    const rgb = hexToRgb(color);

    document.getElementById('pt-title').textContent = pin.title + (pin.secret ? ' 🔒' : '');
    document.getElementById('pt-cat').innerHTML = `<span class="pt-cat" style="color:${color};border-color:${color}66;background:rgba(${rgb.r},${rgb.g},${rgb.b},.12);">
      <span style="width:6px;height:6px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;"></span>${runtime.esc(category.label)}
    </span>`;

    const plain = (pin.text || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/---/g, '').trim();
    const text = document.getElementById('pt-text');
    if(plain){
      text.innerHTML = runtime.formatText(pin.text);
      text.style.display = '';
    } else {
      text.style.display = 'none';
    }

    tooltip.classList.add('show');
    moveTooltip(clientX, clientY);
  }

  function moveTooltip(clientX, clientY){
    const tooltip = document.getElementById('pin-tooltip');
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;
    const margin = 14;
    let x = clientX + margin;
    let y = clientY - height / 2;
    if(x + width > window.innerWidth - 8) x = clientX - width - margin;
    if(y < 8) y = 8;
    if(y + height > window.innerHeight - 8) y = window.innerHeight - height - 8;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  function hideTooltip(){
    tooltipHideTimer = setTimeout(() => {
      document.getElementById('pin-tooltip').classList.remove('show');
    }, 80);
  }

  function hexToRgb(hex){
    const clean = (hex || '#8a6510').replace('#', '');
    const normalized = clean.length === 3
      ? clean.split('').map(char => char + char).join('')
      : clean.padEnd(6, '0').slice(0, 6);
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return {
      r: Number.isNaN(r) ? 138 : r,
      g: Number.isNaN(g) ? 101 : g,
      b: Number.isNaN(b) ? 16 : b,
    };
  }

  window.KartoPinRenderer = {
    renderPins,
    isDragging,
    moveDrag,
    stopDrag,
    hideTooltip,
    toggleSelection,
    clearSelection,
    selectedPins,
    bulkSetCategory,
    bulkDeleteSelected,
  };
})();
