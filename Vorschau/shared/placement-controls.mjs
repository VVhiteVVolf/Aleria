// Shared draft interactions. Touch and keyboard use the same real selection/target
// buttons; mouse and pen can also drag, without preventing touch map scrolling.
export function createPlacementControls({root,getSelected,onMove,escape,canMove=()=>true}) {
 const document=root.ownerDocument;
 let gesture=null,suppressClick=false;
 const ghost=document.createElement('div');
 ghost.className='drag-crest';
 ghost.hidden=true;
 root.append(ghost);

 function move(id,seat) {
  if(id&&canMove(id))onMove(id,seat==='unassigned'?null:seat);
 }
 function clearTargets() {
  root.querySelectorAll('.is-drop-target').forEach(element=>element.classList.remove('is-drop-target'));
 }
 function findTarget(event) {
  const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-drop-seat]');
  return target&&root.contains(target)?target:null;
 }
 function finish(event,cancel=false) {
  if(!gesture||event.pointerId!==gesture.pointerId)return;
  const current=gesture;
  gesture=null;
  const target=current.active&&!cancel?findTarget(event):null;
  if(current.element.hasPointerCapture(current.pointerId))
   current.element.releasePointerCapture(current.pointerId);
  root.classList.remove('is-dragging');
  ghost.hidden=true;
  clearTargets();
  if(current.active){
   suppressClick=true;
   setTimeout(()=>suppressClick=false,200);
  }
  if(target)move(current.id,target.dataset.dropSeat);
 }

 root.addEventListener('pointerdown',event=>{
  const element=event.target.closest('[data-drag-house]');
  if(!element||!canMove(element.dataset.dragHouse)||event.button!==0||event.pointerType==='touch')return;
  gesture={id:element.dataset.dragHouse,element,pointerId:event.pointerId,x:event.clientX,y:event.clientY,active:false};
 });
 root.addEventListener('pointermove',event=>{
  if(!gesture||event.pointerId!==gesture.pointerId)return;
  if(!gesture.active){
   if(Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<7)return;
   gesture.active=true;
   gesture.element.setPointerCapture(event.pointerId);
   root.classList.add('is-dragging');
   (gesture.element.closest('dialog')??root).append(ghost);
   const image=gesture.element.querySelector('img');
   ghost.replaceChildren(...(image?[image.cloneNode()]:[]));
   ghost.hidden=false;
  }
  event.preventDefault();
  ghost.style.left=event.clientX+'px';
  ghost.style.top=event.clientY+'px';
  clearTargets();
  findTarget(event)?.classList.add('is-drop-target');
 });
 root.addEventListener('pointerup',event=>finish(event));
 root.addEventListener('pointercancel',event=>finish(event,true));
 root.addEventListener('dragstart',event=>{
  if(event.target.closest('[data-drag-house]'))event.preventDefault();
 });
 root.addEventListener('click',event=>{
  if(suppressClick){event.preventDefault();event.stopImmediatePropagation();}
 },{capture:true});
 root.addEventListener('click',event=>{
  const target=event.target.closest('button[data-action="place-at-seat"]');
  if(target)move(getSelected(),target.dataset.dropSeat);
 });

 return {render(proposal) {
  for(const surface of root.querySelectorAll('[data-role="map-surface"]')){
   for(const button of surface.querySelectorAll('.clan-pin')){
    button.draggable=false;
    if(canMove(button.dataset.clan))button.dataset.dragHouse=button.dataset.clan;
    else delete button.dataset.dragHouse;
   }
   surface.querySelectorAll('.placement-targets').forEach(element=>element.remove());
   const overlay=document.createElement('div');
   overlay.className='placement-targets';
   overlay.innerHTML=proposal.settlements.map(seat=>`<button class="placement-target" data-action="place-at-seat" data-drop-seat="${escape(seat.id)}" style="left:${seat.point[0]}%;top:${seat.point[1]}%" aria-label="Gewähltes Wappen nach ${escape(seat.name)} versetzen" title="${escape(seat.name)}">+</button>`).join('');
   surface.append(overlay);
  }
  const selected=getSelected();
  root.classList.toggle('has-selection',Boolean(selected&&canMove(selected)));
 }};
}
