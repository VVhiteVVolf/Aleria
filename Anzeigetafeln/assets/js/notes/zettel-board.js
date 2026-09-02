(function(){
  'use strict';

  let dragId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragMoved = false;
  const noticePinImages = Object.freeze([
    'assets/images/notice-pins/nail-straight.png',
    'assets/images/notice-pins/nail-left.png',
    'assets/images/notice-pins/nail-right.png',
  ]);

  function rt(){ return window.TafelRuntime; }
  function state(){ return rt().state(); }
  function esc(value){ return rt().esc(value); }
  function typeById(id){ return window.TafelZettelConfig.typeById(id); }
  function boardSize(){ return rt().boardSize(); }
  function boardViewport(){ return rt().boardViewport(); }

  function pinImageFor(id){
    const value = String(id || 'aushang');
    let hash = 0;
    for(let index = 0; index < value.length; index += 1){
      hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
    }
    const imageIndex = Math.abs(hash) % noticePinImages.length;
    return { src: noticePinImages[imageIndex], variant: imageIndex };
  }

  function render(){
    const zl = document.getElementById('zettel-layer');
    const size = boardSize();
    if(!zl || !size.w) return;
    zl.innerHTML = '';

    const S = state();
    (S.zettel || []).forEach(z => {
      if(z.secret && !rt().isEditMode()) return;
      const type = typeById(z.typ);
      const el = document.createElement('button');
      const pinImage = pinImageFor(z.id);
      el.type = 'button';
      el.dataset.id = z.id;
      el.dataset.noticeId = z.id;
      el.dataset.noticeType = z.typ;
      el.dataset.pinVariant = String(pinImage.variant);
      el.className = 'tafel-notice-marker' + (rt().canEditZettel() ? ' edit-mode' : '') + (z.secret ? ' secret' : '');
      el.setAttribute('aria-label', `${type?.label || 'Aushang'}: ${z.title || 'Ohne Titel'}`);
      el.style.cssText = `position:absolute;left:${z.x * size.w}px;top:${z.y * size.h}px;
        transform:translate(-50%,-50%);pointer-events:all;
        cursor:${rt().canEditZettel() ? 'grab' : 'pointer'};`;
      el.innerHTML = `<img class="tafel-notice-nail" src="${pinImage.src}" alt="" draggable="false">`;

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
        if(rt().canEditZettel()){
          dragId = z.id;
          dragMoved = false;
          const point = rt().boardPointFromClient(e.clientX, e.clientY);
          dragOffsetX = point.x - z.x * size.w;
          dragOffsetY = point.y - z.y * size.h;
        }
      });
      el.addEventListener('mouseup', e => {
        if(e.button !== 0) return;
        e.stopPropagation();
        const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
        if(dist < 5){
          if(rt().canEditZettel()) window.openZettelSidebar(z.id, 'edit');
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
    const tt = document.getElementById('notice-tooltip');
    if(!tt) return;
    const previewText = window.TafelZettelRichText.textPreview(z.text || '', 200);
    tt.innerHTML = `<div class="notice-tooltip-head">
      <span>${tdef?.icon || '📜'} ${esc(tdef?.label || 'Aushang')}</span>
      <strong>${esc(z.title || tdef?.label || 'Aushang')}</strong>
    </div>${previewText ? `<p>${esc(previewText)}</p>` : ''}`;
    tt.style.display = 'block';
    tt.classList.add('show');
    moveTooltip(cx, cy);
  }

  function moveTooltip(cx, cy){
    const tip = document.getElementById('notice-tooltip');
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
    const tip = document.getElementById('notice-tooltip');
    if(!tip) return;
    setTimeout(() => tip.classList.remove('show'), 80);
  }

  function attachDragListeners(){
    boardViewport().addEventListener('mousemove', e => {
      if(!dragId||!rt().canEditZettel()) return;
      dragMoved = true;
      const S = state();
      const size = boardSize();
      const z = S.zettel.find(x => x.id === dragId);
      if(!z || !size.w) return;
      const point = rt().boardPointFromClient(e.clientX, e.clientY);
      z.x = Math.max(0, Math.min(1, (point.x - dragOffsetX) / size.w));
      z.y = Math.max(0, Math.min(1, (point.y - dragOffsetY) / size.h));
      render();
    });
    boardViewport().addEventListener('mouseup', () => {
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
