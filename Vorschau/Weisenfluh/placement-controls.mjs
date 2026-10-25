// Nur die Vorschlagsseite besitzt diese Interaktionen; die gemeinsame Karte bleibt unverändert.
export function createPlacementControls({root,getSelected,onMove,escape}) {
 let gesture=null,suppressClick=false;
 const ghost=document.createElement('div');ghost.className='drag-crest';ghost.hidden=true;root.append(ghost);
 function move(id,seat){if(id)onMove(id,seat==='unassigned'?null:seat);}
 const clearTargets=()=>root.querySelectorAll('.is-drop-target').forEach(el=>el.classList.remove('is-drop-target'));
 function finish(event,cancel=false){
  if(!gesture)return;
  const current=gesture;gesture=null;
  const target=current.active&&!cancel?document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-drop-seat]'):null;
  if(current.element.hasPointerCapture(current.pointerId))current.element.releasePointerCapture(current.pointerId);
  root.classList.remove('is-dragging');ghost.hidden=true;clearTargets();
  if(current.active){suppressClick=true;setTimeout(()=>suppressClick=false,200);}
  if(target&&root.contains(target))move(current.id,target.dataset.dropSeat);
 }
 root.addEventListener('pointerdown',event=>{
  const element=event.target.closest('[data-drag-house]');
  if(!element||event.button!==0||event.pointerType==='touch')return;
  gesture={id:element.dataset.dragHouse,element,pointerId:event.pointerId,x:event.clientX,y:event.clientY,active:false};
 });
 root.addEventListener('pointermove',event=>{
  if(!gesture||event.pointerId!==gesture.pointerId)return;
  if(!gesture.active){
   if(Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<7)return;
   gesture.active=true;gesture.element.setPointerCapture(event.pointerId);root.classList.add('is-dragging');
   (gesture.element.closest('dialog')??root).append(ghost);ghost.replaceChildren(gesture.element.querySelector('img').cloneNode());ghost.hidden=false;
  }
  event.preventDefault();ghost.style.left=event.clientX+'px';ghost.style.top=event.clientY+'px';
  clearTargets();const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-drop-seat]');if(target&&root.contains(target))target.classList.add('is-drop-target');
 });
 root.addEventListener('pointerup',event=>finish(event));
 root.addEventListener('pointercancel',event=>finish(event,true));
 root.addEventListener('dragstart',event=>{if(event.target.closest('[data-drag-house]'))event.preventDefault();});
 root.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
 root.addEventListener('click',event=>{const target=event.target.closest('button[data-action="place-at-seat"]');if(target)move(getSelected(),target.dataset.dropSeat);});
 return {render(proposal){
  for(const surface of root.querySelectorAll('[data-role="map-surface"]')){
   surface.querySelectorAll('.clan-pin').forEach(button=>{button.draggable=false;button.dataset.dragHouse=button.dataset.clan;});
   const overlay=document.createElement('div');overlay.className='placement-targets';
   overlay.innerHTML=proposal.settlements.map(s=>`<button class="placement-target" data-action="place-at-seat" data-drop-seat="${s.id}" style="left:${s.point[0]}%;top:${s.point[1]}%" aria-label="Gewähltes Wappen nach ${escape(s.name)} versetzen" title="${escape(s.name)}">+</button>`).join('');
   surface.append(overlay);
  }
  root.classList.toggle('has-selection',Boolean(getSelected()));
 }};
}
