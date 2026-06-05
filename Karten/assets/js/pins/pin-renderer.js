(function(){
  const runtime = window.KartoRuntime;
  let dragId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let tooltipHideTimer = null;

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

    const options = runtime.pinDisplayOptions();
    visiblePins().forEach(pin => {
      const element = document.createElement('div');
      element.className = 'pin' + (runtime.isEditMode() ? ' edit-mode' : '') + (pin.secret ? ' secret' : '');
      element.dataset.id = pin.id;
      element.style.left = (pin.x * image.width) + 'px';
      element.style.top = (pin.y * image.height) + 'px';
      element.innerHTML = `
        <div class="pin-dot" style="width:${options.dotSize}px;height:${options.dotSize}px;background:#111;border-color:#fff;"></div>
        <div class="pin-label" style="font-size:${options.labelSize}px;top:calc(100% + ${Math.round(options.dotSize * .3)}px);">${runtime.esc(pin.title)}${pin.secret ? ' 🔒' : ''}</div>`;
      attachPinEvents(element, pin);
      layer.appendChild(element);
    });
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
        if(window.KartoStampOverwrite?.isOverwriteActive()){
          window.KartoStampOverwrite.applyOverwrite(pin.id);
        } else {
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
    dragId = null;
    if(options.save) runtime.save();
    if(options.rerender) renderPins();
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
  };
})();
