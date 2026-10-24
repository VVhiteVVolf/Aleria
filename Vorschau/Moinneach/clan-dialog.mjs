import {escapeHtml as escape} from './proposal-render.mjs';

export function createClanDialog({dialog,state,onChange,notice}){
 let selectedId,trigger;
 function render(){
  const proposal=state.current();
  const clan=proposal.clans.find(value=>value.id===selectedId);
  const place=proposal.settlements.find(value=>value.id===clan.seat);
  const region=proposal.regions.find(value=>value.seats.includes(place.id));
  const neighbours=proposal.clans.filter(value=>value.seat===place.id&&value.id!==clan.id);
  dialog.querySelector('[data-role="clan-title"]').textContent=clan.name;
  dialog.querySelector('[data-role="clan-detail"]').innerHTML=`
   <div class="clan-portrait"><img src="assets/${clan.crest}" alt="Wappen ${escape(clan.name)}" width="160" height="160"><div><p class="eyebrow">Clan von Moinneach</p><h3>${escape(place.name)}</h3><p>${escape(proposal.label)}</p></div></div>
   <dl class="clan-facts"><div><dt>Sitz</dt><dd>${escape(place.name)}</dd></div><div><dt>Rang und Lehnsherr</dt><dd>Noch offen</dd></div></dl>
   <p class="subtle">Gebietsgruppe: ${escape(region.design?.source?region.design.name+' · '+region.design.byname:region.label)}. ${region.design?.source?'Der Regionsname ist ein Vorschlag für diese Aufteilung.':'Ein Regionsname ist noch offen.'}</p>
   <h3>Die Lage</h3><p>${escape(place.geography)}</p>
   ${place.mapLabel?`<p class="subtle">Die Karte beschriftet diesen Ort als „${escape(place.mapLabel)}“. Die Vorschau verwendet deine Angabe „${escape(place.name)}“.</p>`:''}
   ${neighbours.length?`<h3>Weitere Clans am selben Ort</h3><div class="neighbour-clans">${neighbours.map(other=>`<button data-action="show-clan" data-clan="${other.id}"><img src="assets/${other.crest}" width="38" height="38" alt=""><span>${escape(other.name)}</span></button>`).join('')}</div><p class="subtle">Die gemeinsame Stadtzuordnung legt kein Lehnsverhältnis zwischen diesen Clans fest.</p>`:''}
   ${state.isEditing()?`<form data-role="clan-form"><h3>Zuordnung für diesen Entwurf bearbeiten</h3><label for="clan-seat">Sitz von ${escape(clan.name)}</label><select id="clan-seat" name="seat">${proposal.settlements.map(city=>`<option value="${city.id}" ${city.id===clan.seat?'selected':''}>${escape(city.name)}</option>`).join('')}</select><label for="clan-note">Notizen zum Vorschlag</label><textarea id="clan-note" name="note" rows="3" maxlength="1200">${escape(proposal.notes[clan.id]||'')}</textarea><button class="primary" type="submit">In dieser Vorschau übernehmen</button><p class="subtle">Änderungen gelten bis zum Neuladen dieser geöffneten Seite.</p></form>`
    :`${proposal.notes[clan.id]?`<h3>Entwurfsnotiz</h3><p>${escape(proposal.notes[clan.id])}</p>`:''}<button data-action="edit-clan" class="edit-detail">Zuordnung bearbeiten</button>`}`;
 }
 function show(id){
  if(!state.current().clans.some(clan=>clan.id===id))return;
  selectedId=id;
  if(!dialog.open)trigger=document.activeElement;
  render();
  if(!dialog.open)dialog.showModal();
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
