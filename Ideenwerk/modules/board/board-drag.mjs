export function mountBoardDrag(root,{getView,getZoom,onMove}) {
  let drag=null;
  root.addEventListener('pointerdown',event=>{
    const handle=event.target.closest('[data-action="drag"]');
    if(!handle||getView()!=='board'||event.button!==0)return;
    const card=handle.closest('[data-module]');
    const x=parseFloat(card.style.getPropertyValue('--x')),y=parseFloat(card.style.getPropertyValue('--y'));
    drag={id:card.dataset.module,card,handle,pointer:event.pointerId,startX:event.clientX,startY:event.clientY,x,y,newX:x,newY:y,zoom:getZoom()};
    handle.setPointerCapture(event.pointerId);card.classList.add('is-dragging');event.preventDefault();
  });
  root.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.pointer)return;
    drag.newX=Math.max(0,Math.min(3500,Math.round(drag.x+(event.clientX-drag.startX)/drag.zoom)));
    drag.newY=Math.max(0,Math.min(2500,Math.round(drag.y+(event.clientY-drag.startY)/drag.zoom)));
    drag.card.style.setProperty('--x',`${drag.newX}px`);drag.card.style.setProperty('--y',`${drag.newY}px`);
  });
  const finish=event=>{
    if(!drag||event.pointerId!==drag.pointer)return;
    const completed=drag;drag=null;completed.card.classList.remove('is-dragging');
    if(event.type==='pointercancel'){completed.card.style.setProperty('--x',`${completed.x}px`);completed.card.style.setProperty('--y',`${completed.y}px`);return;}
    onMove(completed.id,completed.newX,completed.newY);
  };
  root.addEventListener('pointerup',finish);root.addEventListener('pointercancel',finish);root.addEventListener('lostpointercapture',finish);
  root.addEventListener('keydown',event=>{
    if(!event.target.closest('[data-action="drag"]')||getView()!=='board'||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();const card=event.target.closest('[data-module]');const step=event.shiftKey?50:10;
    const x=parseFloat(card.style.getPropertyValue('--x')),y=parseFloat(card.style.getPropertyValue('--y'));
    onMove(card.dataset.module,Math.max(0,Math.min(3500,x+({'ArrowLeft':-step,'ArrowRight':step}[event.key]||0))),Math.max(0,Math.min(2500,y+({'ArrowUp':-step,'ArrowDown':step}[event.key]||0))));
    root.querySelector(`[data-module="${CSS.escape(card.dataset.module)}"] [data-action="drag"]`)?.focus();
  });
}
