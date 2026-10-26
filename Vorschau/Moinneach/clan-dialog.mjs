import {renderClanDetails} from './clan-details.mjs?v=20261026-1';

export function createClanDialog({dialog,state,onChange,notice}){
 let selectedId,trigger;
 function render(){
  const proposal=state.current();
  const clan=proposal.clans.find(value=>value.id===selectedId);
  dialog.querySelector('[data-role="clan-detail"]').innerHTML=renderClanDetails(proposal,clan,state.isEditing());
 }
 function show(id){
  if(!state.current().clans.some(clan=>clan.id===id))return;
  selectedId=id;
  if(!dialog.open)trigger=document.activeElement;
  render();
  if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;
 }
 dialog.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(!button)return;
  if(button.dataset.action==='close-clan')dialog.close();
  if(button.dataset.action==='show-clan')show(button.dataset.clan);
  if(button.dataset.action==='edit-clan'){
   state.toggleEditing();onChange();render();
   dialog.querySelector('select').focus();
  }
 });
 dialog.addEventListener('submit',event=>{
  if(!event.target.matches('[data-role="clan-form"]'))return;
  event.preventDefault();
  const fields=new FormData(event.target);
  state.update(selectedId,{seat:fields.get('seat'),note:fields.get('note')});
  onChange();render();dialog.querySelector('select').focus();
  notice('Zuordnung in dieser Vorschau übernommen.');
 });
 dialog.addEventListener('close',()=>{if(trigger?.isConnected)trigger.focus({preventScroll:true});});
 return {show};
}
