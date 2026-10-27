(function(){
  'use strict';

  let drag = null;
  let bound = false;
  let tooltipTimer = null;
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
    window.TafelBoardComposition?.render(zl);
    const covered = window.TafelBoardComposition?.coveredNoticeIds() || new Set();

    const S = state();
    window.TafelNoticeStacks.groups(S.zettel || [], { includeSecret: rt().isEditMode() }).forEach(group => {
      if(group.notices.some(notice => covered.has(notice.id))) return;
      const z = group.notices[0];
      const type = typeById(z.typ);
      const el = document.createElement('button');
      const pinImage = pinImageFor(group.key);
      el.type = 'button';
      el.dataset.id = z.id;
      el.dataset.noticeId = z.id;
      el.dataset.noticeType = z.typ;
      el.dataset.stackSize = String(group.notices.length);
      el.dataset.pinVariant = String(pinImage.variant);
      el.className = 'tafel-notice-marker' + (rt().canEditZettel() ? ' edit-mode' : '') + (z.secret ? ' secret' : '');
      el.setAttribute('aria-label', `${type?.label || 'Aushang'}: ${z.title || 'Ohne Titel'}${group.notices.length > 1 ? ` · ${group.notices.length} Blätter` : ''}`);
      el.style.cssText = `position:absolute;left:${z.x * size.w}px;top:${z.y * size.h}px;
        transform:translate(-50%,-50%);pointer-events:all;
        cursor:${rt().canEditZettel() ? 'grab' : 'pointer'};`;
      el.innerHTML = `<img class="tafel-notice-nail" src="${pinImage.src}" alt="" draggable="false">`;

      zl.appendChild(el);
    });
  }

  function showTooltip(z, cx, cy, members = [z]){
    clearTimeout(tooltipTimer);
    const tt = document.getElementById('notice-tooltip');
    if(!tt) return;
    const entries = window.TafelNoticeStacks.publications(members, { includeSecret: rt().isEditMode() });
    tt.innerHTML = entries.map(entry => {
      const notice = entry.primary;
      const tdef = typeById(notice.typ);
      const previewText = window.TafelZettelRichText.textPreview(notice.text || '', 150);
      return `<section class="notice-tooltip-publication"><div class="notice-tooltip-head"><span>${tdef?.icon || '📜'} ${esc(tdef?.label || 'Aushang')}</span><strong>${esc(notice.title || 'Ohne Titel')}</strong></div>${previewText ? `<p>${esc(previewText)}</p>` : ''}${entry.notices.length > 1 ? `<small>Mit ${entry.notices.length - 1} zugehörigen ${entry.notices.length === 2 ? 'Beiblatt' : 'Beiblättern'}</small>` : ''}</section>`;
    }).join('');
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
    clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(() => tip.classList.remove('show'), 80);
  }

  function attachDragListeners(){
    if(bound) return;
    bound = true;
    const viewport = boardViewport();
    const marker = event => event.target.closest('.tafel-notice-marker');
    const notice = element => state().zettel.find(item => item.id === element?.dataset.noticeId);
    let suppressClick = false;
    viewport.addEventListener('pointerdown', event => {
      const el = marker(event);
      const z = notice(el);
      if(!z || event.button !== 0 || window.TafelBoard.isPlacing()) return;
      suppressClick = false;
      if(!rt().canEditZettel()) return;
      const point = rt().boardPointFromClient(event.clientX, event.clientY);
      drag = { id: z.id, x: z.x, y: z.y, point, clientX: event.clientX, clientY: event.clientY, moved: false, pointerId: event.pointerId, el };
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove', event => {
      if(!drag || !rt().canEditZettel() || event.pointerId !== drag.pointerId) return;
      if(!drag.moved && Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY) < 5) return;
      drag.moved = true;
      const point = rt().boardPointFromClient(event.clientX, event.clientY);
      const size = boardSize();
      const x = Math.max(0, Math.min(1, drag.x + (point.x - drag.point.x) / size.w));
      const y = Math.max(0, Math.min(1, drag.y + (point.y - drag.point.y) / size.h));
      // Keep the capture and focused element alive until the gesture finishes.
      drag.el.style.left = `${x * size.w}px`;
      drag.el.style.top = `${y * size.h}px`;
      drag.position = { x, y };
    });
    const finish = event => {
      if(!drag || event.pointerId !== drag.pointerId) return;
      const current = drag; drag = null;
      suppressClick = current.moved;
      if(event.type === 'pointerup' && current.position) {
        window.TafelNoticeStacks.position(state().zettel, current.id, current.position.x, current.position.y);
        rt().save();
      }
      if(event.type === 'pointerup' && !current.moved) {
        suppressClick = true;
        hideTooltip();
        window.openZettelSidebar(current.id, 'edit');
      }
      if(current.moved) render();
      if(viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    };
    for(const event of ['pointerup', 'pointercancel', 'lostpointercapture']) viewport.addEventListener(event, finish);
    viewport.addEventListener('click', event => {
      const z = notice(marker(event));
      if(!z || (suppressClick && event.detail !== 0) || window.TafelBoard.isPlacing()) return;
      hideTooltip();
      if(rt().canEditZettel()) window.openZettelSidebar(z.id, 'edit');
      else window.openZettelScroll(z.id);
    });
    const show = event => {
      const el = marker(event);
      const z = notice(el);
      if(!z || rt().isEditMode() || el.contains(event.relatedTarget)) return;
      const rect = el.getBoundingClientRect();
      showTooltip(z, event.clientX || rect.right, event.clientY || rect.top, window.TafelNoticeStacks.members(state().zettel, z.id));
    };
    viewport.addEventListener('pointerover', show);
    viewport.addEventListener('focusin', show);
    viewport.addEventListener('pointerout', event => { if(marker(event)) hideTooltip(); });
    viewport.addEventListener('focusout', hideTooltip);
  }

  window.TafelZettelBoard = {
    render,
    attachDragListeners,
    showTooltip,
    hideTooltip,
  };
})();
