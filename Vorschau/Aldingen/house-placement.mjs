import {houses} from './house-data.mjs?v=20261026-1';
import {settlements} from './territory-data.mjs?v=20261026-1';
import {createPlacementState,createMapProposal} from './placement-state.mjs?v=20261026-1';
import {escapeHtml as e,houseCard,renderSeats,rankLabel} from './proposal-render.mjs?v=20261026-1';
import {createPlacementControls} from '../shared/placement-controls.mjs?v=20261026-1';
import {createClanMap} from '../shared/clan-map.mjs';

const storageKey='aleria:proposal:aldingen:placements:v1';
export function createHousePlacement({root,onHouse,notice}){
 const state=createPlacementState(),houseSelect=root.querySelector('[data-role="house-select"]'),seatSelect=root.querySelector('[data-role="seat-select"]');
 let selected=null;
 function save(){try{localStorage.setItem(storageKey,state.serialize());}catch{notice('Deine Änderung bleibt in dieser geöffneten Ansicht erhalten.');}}
 function render(){
  const placements=state.current(),unassigned=houses.filter(h=>placements[h.id]===null);
  root.querySelector('[data-role="unassigned-houses"]').innerHTML=unassigned.map(h=>houseCard(h,selected)).join('')||'<p>Alle Familien haben einen Sitz im Entwurf.</p>';
  root.querySelector('[data-role="unassigned-count"]').textContent=`${unassigned.length} ohne Sitz`;
  root.querySelector('[data-role="settlements"]').innerHTML=renderSeats(placements,selected);
  houseSelect.value=selected??'';
  seatSelect.value=selected?placements[selected]??'':'';
  root.querySelector('[data-role="selection-hint"]').textContent=selected?`${houses.find(h=>h.id===selected).name}: einen Ort anklicken oder oben einen Sitz wählen.`:'Ein Wappen auswählen und einen Ort anklicken – oder das Wappen direkt zum neuen Sitz ziehen.';
  root.querySelector('[data-action="move-selected"]').disabled=!selected;
  root.querySelector('[data-action="cancel-selection"]').disabled=!selected;
  root.querySelector('[data-action="undo"]').disabled=!state.canUndo();
  map.render();controls.render(createMapProposal(placements));
 }
 function choose(id){selected=houses.some(h=>h.id===id)?id:null;render();}
 function move(id,seat){if(state.move(id,seat)){selected=null;save();render();notice('Sitz im Entwurf aktualisiert.');}}
 const map=createClanMap({root:root.querySelector('[data-role="map-section"]'),dialog:root.querySelector('#map-dialog'),tooltip:root.querySelector('#clan-tooltip'),getVariant:()=>createMapProposal(state.current()),escape:e,onClan:onHouse,rankLabel,rootClanLabel:'Lehnszugehörigkeit offen',caption:proposal=>`${proposal.clans.filter(h=>h.seat!==null).length} zugeordnete Familien · 11 Orte · Rote Grenzen und Farben bleiben wie auf deiner Karte.`});
 const controls=createPlacementControls({root,getSelected:()=>selected,onMove:move,escape:e});
 houseSelect.innerHTML='<option value="">Ein Wappen auswählen …</option>'+houses.map(h=>`<option value="${e(h.id)}">${h.clan?'Clan':'Haus'} ${e(h.name)}</option>`).join('');
 seatSelect.innerHTML='<option value="">Sitz offenlassen</option>'+settlements.map(s=>`<option value="${s.id}">${e(s.name)}</option>`).join('');
 try{const saved=localStorage.getItem(storageKey);if(saved)state.restore(JSON.parse(saved));}catch{notice('Der gespeicherte Entwurf konnte nicht geladen werden. Die Ausgangszuordnung wird angezeigt.');}
 houseSelect.addEventListener('change',()=>choose(houseSelect.value));
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!root.querySelector('dialog[open]'))choose(null);});
 root.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');if(!button)return;
  switch(button.dataset.action){
   case 'choose-house':choose(selected===button.dataset.house?null:button.dataset.house);root.querySelector(`[data-action="choose-house"][data-house="${button.dataset.house}"]`)?.focus({preventScroll:true});break;
   case 'move-selected':if(selected)move(selected,seatSelect.value||null);break;
   case 'cancel-selection':choose(null);break;
   case 'open-map':map.open();break;
   case 'toggle-crests':map.toggleCrests(button);controls.render(createMapProposal(state.current()));break;
   case 'toggle-names':map.toggleNames(button);controls.render(createMapProposal(state.current()));break;
   case 'undo':if(state.undo()){selected=null;save();render();notice('Letzte Sitzänderung zurückgenommen.');}break;
   case 'reset':if(state.reset()){selected=null;save();render();notice('Die vier Ausgangszuordnungen sind wiederhergestellt. Alle anderen Sitze sind offen.');}break;
   case 'export':{const url=URL.createObjectURL(new Blob([state.serialize()],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='aldingen-entwurf.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);break;}
   case 'import':root.querySelector('[data-role="import-file"]').click();break;
  }
 });
 root.querySelector('[data-role="import-file"]').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{if(file.size>100000)throw Error('Die Entwurfsdatei ist zu groß.');state.restore(JSON.parse(await file.text()));selected=null;save();render();notice('Dein Entwurf ist geladen.');}catch(error){notice(error.message||'Die Datei konnte nicht geladen werden.');}finally{event.target.value='';}
 });
 render();
 return {current:state.current,choose(id){choose(id);root.querySelector('#karte').scrollIntoView({behavior:'smooth',block:'start'});houseSelect.focus({preventScroll:true});}};
}
