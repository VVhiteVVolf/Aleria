(function(){
  'use strict';

  let dragPinId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragMoved = false;
  let tooltipTimer = null;

  function rt(){ return window.TafelRuntime; }
  function state(){ return rt().state(); }
  function esc(value){ return rt().esc(value); }
  function imageSize(){ return rt().imageSize(); }
  function pinLayer(){ return rt().pinLayer(); }

  function render(){
    const layer = pinLayer();
    const size = imageSize();
    layer.innerHTML = '';
    if(!size.w) return;

    window.TafelZettelBoard?.render();

    const S = state();
    const filter = rt().activeCategoryFilter();
    S.pins.forEach(pin => {
      if(pin.secret && !rt().isEditMode()) return;
      if(filter !== 'all' && pin.cat !== filter) return;

      const el = document.createElement('div');
      el.className = 'pin' + (rt().isEditMode() ? ' edit-mode' : '') + (pin.secret ? ' secret' : '');
      el.dataset.id = pin.id;
      el.style.left = (pin.x * size.w) + 'px';
      el.style.top = (pin.y * size.h) + 'px';
      el.innerHTML = `
      <div class="pin-dot" style="width:${S.dotSize}px;height:${S.dotSize}px;background:#111;border-color:#fff;"></div>
      <div class="pin-label" style="font-size:${S.lblSize}px;top:calc(100% + ${Math.round(S.dotSize * .3)}px);">${esc(pin.title)}${pin.secret ? ' 🔒' : ''}</div>`;

      let downX = 0;
      let downY = 0;
      el.addEventListener('mouseenter', event => {
        if(rt().isEditMode()) return;
        showTooltip(pin, event.clientX, event.clientY);
      });
      el.addEventListener('mousemove', event => {
        if(rt().isEditMode()) return;
        moveTooltip(event.clientX, event.clientY);
      });
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('mousedown', event => {
        if(event.button !== 0) return;
        event.stopPropagation();
        downX = event.clientX;
        downY = event.clientY;
        if(rt().isEditMode()){
          dragPinId = pin.id;
          dragMoved = false;
          const point = rt().mapPointFromClient(event.clientX, event.clientY);
          dragOffsetX = point.x - pin.x * size.w;
          dragOffsetY = point.y - pin.y * size.h;
          el.classList.add('dragging');
        }
      });
      el.addEventListener('mouseup', event => {
        if(event.button !== 0) return;
        event.stopPropagation();
        const dist = Math.hypot(event.clientX - downX, event.clientY - downY);
        if(dist < 5){
          if(rt().isOverwriteMode()) rt().applyOverwrite(pin.id);
          else window.openSidebar(pin.id, rt().isEditMode() ? 'edit' : 'view');
        }
        if(dragPinId){
          rt().save();
          dragPinId = null;
          render();
        }
      });
      layer.appendChild(el);
    });
  }

  function attachDragListeners(){
    rt().mapWrap().addEventListener('mousemove', event => {
      if(!dragPinId) return;
      dragMoved = true;
      const S = state();
      const size = imageSize();
      const pin = S.pins.find(item => item.id === dragPinId);
      if(!pin || !size.w) return;
      const point = rt().mapPointFromClient(event.clientX, event.clientY);
      pin.x = Math.max(0, Math.min(1, (point.x - dragOffsetX) / size.w));
      pin.y = Math.max(0, Math.min(1, (point.y - dragOffsetY) / size.h));
      render();
    });
    rt().mapWrap().addEventListener('mouseup', () => {
      if(dragPinId && dragMoved){
        rt().save();
        dragPinId = null;
        render();
      }
    });
  }

  function showTooltip(pin, cx, cy){
    clearTimeout(tooltipTimer);
    const cat = rt().catOf(pin);
    const color = (cat.color || '#8a6510').replace('#', '');
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    document.getElementById('pt-title').textContent = pin.title + (pin.secret ? ' 🔒' : '');
    document.getElementById('pt-cat').innerHTML = `<span class="pt-cat" style="color:${cat.color};border-color:${cat.color}66;background:rgba(${r},${g},${b},.12);">
    <span style="width:6px;height:6px;border-radius:50%;background:${cat.color};display:inline-block;flex-shrink:0;"></span>${esc(cat.label)}
  </span>`;

    const plain = (pin.text || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/---/g, '').trim();
    const text = document.getElementById('pt-text');
    if(plain){
      text.innerHTML = window.TafelPinScrollView.fmtText(pin.text);
      text.style.display = '';
    } else {
      text.style.display = 'none';
    }
    document.getElementById('pin-tooltip').classList.add('show');
    moveTooltip(cx, cy);
  }

  function moveTooltip(cx, cy){
    const tip = document.getElementById('pin-tooltip');
    if(!tip) return;
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 14;
    let x = cx + margin;
    let y = cy - th / 2;
    if(x + tw > vw - 8) x = cx - tw - margin;
    if(y < 8) y = 8;
    if(y + th > vh - 8) y = vh - th - 8;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }

  function hideTooltip(){
    tooltipTimer = setTimeout(() => {
      document.getElementById('pin-tooltip')?.classList.remove('show');
    }, 80);
  }

  window.TafelPinBoard = {
    render,
    attachDragListeners,
    hideTooltip
  };

  window.hidePinTooltip = hideTooltip;
})();
