import { bindPlacementDrag } from './placement-drag.mjs';

// Shared draft interactions. Touch and keyboard use the same real selection/target
// buttons; mouse and pen can also drag, without preventing touch map scrolling.
export function createPlacementControls({root,getSelected,onMove,escape,canMove=()=>true}) {
 const document=root.ownerDocument;

 function move(id,seat) {
  if(id&&canMove(id))onMove(id,seat==='unassigned'?null:seat);
 }

 bindPlacementDrag({
  root, sourceSelector:'[data-drag-house]', targetSelector:'[data-drop-seat]',
  canStart:(source,event)=>event.pointerType!=='touch'&&canMove(source.dataset.dragHouse),
  onDrop:(source,target)=>move(source.dataset.dragHouse,target.dataset.dropSeat),
 });
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
   overlay.innerHTML=proposal.settlements.map(seat=>`<button class="placement-target${seat.placementDisabled?' is-disabled-target':''}" data-action="place-at-seat" data-drop-seat="${escape(seat.id)}" style="left:${seat.point[0]}%;top:${seat.point[1]}%" ${seat.placementDisabled?'disabled aria-disabled="true"':''} aria-label="${seat.placementDisabled?escape(seat.disabledReason||seat.name):'Gewähltes Wappen nach '+escape(seat.name)+' versetzen'}" title="${escape(seat.disabledReason||seat.name)}">${seat.placementDisabled?'×':'+'}</button>`).join('');
   surface.append(overlay);
  }
  const selected=getSelected();
  root.classList.toggle('has-selection',Boolean(selected&&canMove(selected)));
 }};
}
