(function(){
  'use strict';

  let dragId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragMoved = false;

  function rt(){ return window.TafelRuntime; }
  function state(){ return rt().state(); }
  function esc(value){ return rt().esc(value); }
  function typeById(id){ return window.TafelZettelConfig.typeById(id); }
  function imageSize(){ return rt().imageSize(); }
  function mapWrap(){ return rt().mapWrap(); }

  function render(){
    const zl = document.getElementById('zettel-layer');
    const size = imageSize();
    if(!zl || !size.w) return;
    zl.innerHTML = '';

    const S = state();
    const ds = S.dotSize || 18;
    (S.zettel || []).forEach(z => {
      if(z.secret && !rt().isEditMode()) return;
      const el = document.createElement('div');
      el.dataset.id = z.id;
      el.className = 'pin zettel-pin' + (rt().isEditMode() ? ' edit-mode' : '') + (z.secret ? ' secret' : '');
      el.style.cssText = `position:absolute;left:${z.x * size.w}px;top:${z.y * size.h}px;
        transform:translate(-50%,-50%);pointer-events:all;
        cursor:${rt().isEditMode() ? 'grab' : 'pointer'};`;
      el.innerHTML = `<div class="pin-dot" style="width:${ds}px;height:${ds}px;background:#8b6914;border:2.5px solid #f5e9c8;box-shadow:0 2px 8px rgba(0,0,0,.5),0 0 0 1px #c8a84b;"></div>`;

      let downX = 0;
      let downY = 0;
      el.addEventListener('mouseenter', e => {
        if(!rt().isEditMode()) showTooltip(z, e.clientX, e.clientY);
      });
      el.addEventListener('mousemove', e => {
        if(!rt().isEditMode()) moveTooltip(e.clientX, e.clientY);
      });
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('mousedown', e => {
        if(e.button !== 0) return;
        e.stopPropagation();
        downX = e.clientX;
        downY = e.clientY;
        if(rt().isEditMode()){
          dragId = z.id;
          dragMoved = false;
          const point = rt().mapPointFromClient(e.clientX, e.clientY);
          dragOffsetX = point.x - z.x * size.w;
          dragOffsetY = point.y - z.y * size.h;
        }
      });
      el.addEventListener('mouseup', e => {
        if(e.button !== 0) return;
        e.stopPropagation();
        const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
        if(dist < 5){
          if(rt().isEditMode()) window.openZettelSidebar(z.id, 'edit');
          else window.openZettelScroll(z.id);
        }
        if(dragId){
          rt().save();
          dragId = null;
          render();
        }
      });
      zl.appendChild(el);
    });
  }

  function showTooltip(z, cx, cy){
    const tdef = typeById(z.typ);
    const tt = document.getElementById('pin-tooltip');
    if(!tt) return;
    tt.innerHTML = `<div class="pttt-top" style="background:linear-gradient(90deg,#5a3a08,#8b6914,#c8a030,#8b6914,#5a3a08);padding:.45rem .75rem;border-bottom:1px solid #c8a84b;">
    <span style="font-family:'Cinzel',serif;font-size:.6rem;color:#fff;letter-spacing:.04em;">${tdef.icon} ${tdef.label}</span>
    <div style="font-family:'Cinzel Decorative',serif;font-size:.75rem;color:#fff;margin-top:.15rem;">${esc(z.title || tdef.label)}</div>
  </div>${z.text ? `<div style="padding:.5rem .75rem;font-family:'EB Garamond',serif;font-size:.82rem;color:#1a1200;line-height:1.55;font-style:italic;">${esc(z.text).slice(0, 200)}</div>` : ''}`;
    tt.style.display = 'block';
    tt.classList.add('show');
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
    const tip = document.getElementById('pin-tooltip');
    if(!tip) return;
    setTimeout(() => tip.classList.remove('show'), 80);
  }

  function attachDragListeners(){
    mapWrap().addEventListener('mousemove', e => {
      if(!dragId) return;
      dragMoved = true;
      const S = state();
      const size = imageSize();
      const z = S.zettel.find(x => x.id === dragId);
      if(!z || !size.w) return;
      const point = rt().mapPointFromClient(e.clientX, e.clientY);
      z.x = Math.max(0, Math.min(1, (point.x - dragOffsetX) / size.w));
      z.y = Math.max(0, Math.min(1, (point.y - dragOffsetY) / size.h));
      render();
    });
    mapWrap().addEventListener('mouseup', () => {
      if(dragId && dragMoved){
        rt().save();
        dragId = null;
        render();
      }
    });
  }

  window.TafelZettelBoard = {
    render,
    attachDragListeners
  };
})();
