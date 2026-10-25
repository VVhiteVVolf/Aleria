import {houses,settlements,rankLabels,createMapProposal} from './realm-data.mjs';
import {createPlacementState} from './proposal-state.mjs';
import {escapeHtml,houseCard,renderRoyalHouse,renderProvinces,renderSettlements,renderHouseDetails} from './proposal-render.mjs';
import {createPlacementControls} from './placement-controls.mjs';
import {createClanMap} from '../shared/clan-map.mjs';

const root=document.querySelector('[data-weisenfluh-proposal]');
const state=createPlacementState();
const storageKey='aleria:proposal:weisenfluh:placements:v1';
const houseSelect=root.querySelector('[data-role="house-select"]');
const seatSelect=root.querySelector('[data-role="seat-select"]');
const dialog=root.querySelector('#house-dialog');
let selected=null,noticeTimer,houseTrigger;
function notice(message){const box=root.querySelector('[data-role="status"]');box.textContent=message;box.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>box.hidden=true,6500);}
function save(){try{localStorage.setItem(storageKey,state.serialize());}catch{notice('Die Änderung bleibt für diese Ansicht erhalten. Der Browser konnte sie nicht speichern.');}}
function showHouse(id){const house=houses.find(h=>h.id===id);if(!house)return;houseTrigger=document.activeElement;dialog.querySelector('[data-role="house-details"]').innerHTML=renderHouseDetails(house,state.current());dialog.showModal();}
function render(){
 const placements=state.current(),unassigned=houses.filter(h=>placements[h.id]===null);
 root.querySelector('[data-role="settlements"]').innerHTML=renderSettlements(placements,selected);
 root.querySelector('[data-role="unassigned-houses"]').innerHTML=unassigned.map(h=>houseCard(h,selected)).join('')||'<p>Alle Häuser haben einen Platz im Entwurf.</p>';
 root.querySelector('[data-role="unassigned-count"]').textContent=`${unassigned.length} ohne Sitz`;
 houseSelect.value=selected??'';
 root.querySelector('[data-action="move-selected"]').disabled=!selected;
 root.querySelector('[data-action="cancel-selection"]').disabled=!selected;
 root.querySelector('[data-action="undo"]').disabled=!state.canUndo();
 root.querySelector('[data-role="selection-hint"]').textContent=selected?`${houses.find(h=>h.id===selected).name} ist ausgewählt. Einen markierten Ort anklicken oder oben einen Sitz wählen.`:'Ein Wappen wählen und einen Ort auf der Karte anklicken – oder Wappen direkt auf einen Ort ziehen.';
 map.render();controls.render(createMapProposal(placements));
}
function choose(id){selected=houses.some(h=>h.id===id)?id:null;seatSelect.value=selected?state.current()[selected]??'':'';render();}
function move(id,seat){
 if(!state.move(id,seat))return;
 const name=houses.find(h=>h.id===id).name,place=settlements.find(s=>s.id===seat);
 selected=null;save();render();notice(`${name}: ${place?`Sitz nach ${place.name} versetzt.`:'Sitz wieder offen.'}`);
}
const map=createClanMap({root:root.querySelector('[data-role="map-section"]'),dialog:root.querySelector('#map-dialog'),tooltip:root.querySelector('#clan-tooltip'),getVariant:()=>createMapProposal(state.current()),escape:escapeHtml,onClan:showHouse,rankLabel:h=>rankLabels[h.rank],rootClanLabel:'Lehnszugehörigkeit offen',caption:proposal=>`${proposal.clans.filter(h=>h.seat!==null).length} platzierte Hauswappen · 14 Orte · Die Karte behält ihre gelieferten Beschriftungen.`});
const controls=createPlacementControls({root,getSelected:()=>selected,onMove:move,escape:escapeHtml});

root.querySelector('[data-role="royal-house"]').innerHTML=renderRoyalHouse();
root.querySelector('[data-role="provinces"]').innerHTML=renderProvinces();
houseSelect.insertAdjacentHTML('beforeend',Object.entries(rankLabels).map(([rank,label])=>`<optgroup label="${escapeHtml(label)}">${houses.filter(h=>h.rank===rank).map(h=>`<option value="${h.id}">${escapeHtml(h.name)}</option>`).join('')}</optgroup>`).join(''));
seatSelect.insertAdjacentHTML('beforeend',settlements.map(s=>`<option value="${s.id}">${escapeHtml(s.name)}</option>`).join(''));
try{const saved=localStorage.getItem(storageKey);if(saved)state.restore(JSON.parse(saved));}catch{notice('Ein älterer Browserentwurf konnte nicht geladen werden. Die gelieferte Ausgangszuordnung wird angezeigt.');}
houseSelect.addEventListener('change',()=>choose(houseSelect.value));
dialog.addEventListener('close',()=>houseTrigger?.isConnected&&houseTrigger.focus({preventScroll:true}));
root.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');if(!button)return;
 switch(button.dataset.action){
  case 'choose-house':choose(selected===button.dataset.house?null:button.dataset.house);root.querySelector(`[data-action="choose-house"][data-house="${button.dataset.house}"]`)?.focus({preventScroll:true});break;
  case 'show-house':showHouse(button.dataset.house);break;
  case 'select-from-dialog':dialog.close();choose(button.dataset.house);root.querySelector('#karte').scrollIntoView({behavior:'smooth',block:'start'});houseSelect.focus({preventScroll:true});break;
  case 'close-house':dialog.close();break;
  case 'move-selected':if(selected)move(selected,seatSelect.value||null);break;
  case 'cancel-selection':choose(null);break;
  case 'open-map':map.open();break;
  case 'toggle-crests':map.toggleCrests(button);controls.render(createMapProposal(state.current()));break;
  case 'toggle-names':map.toggleNames(button);controls.render(createMapProposal(state.current()));break;
  case 'undo':if(state.undo()){selected=null;save();render();notice('Die letzte Änderung wurde zurückgenommen.');}break;
  case 'reset':if(state.reset()){selected=null;save();render();notice('Die Ausgangszuordnung ist wiederhergestellt. Die albischen Clans sind unzugeordnet.');}break;
  case 'export':{const url=URL.createObjectURL(new Blob([state.serialize()],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='weisenfluh-entwurf.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);break;}
  case 'import':root.querySelector('[data-role="import-file"]').click();break;
  case 'print':window.print();break;
 }
});
root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!root.querySelector('dialog[open]'))choose(null);});
root.querySelector('[data-role="import-file"]').addEventListener('change',async event=>{
 const file=event.target.files?.[0];if(!file)return;
 try{if(file.size>100000)throw Error('Die Entwurfsdatei ist zu groß.');state.restore(JSON.parse(await file.text()));selected=null;save();render();notice('Der Entwurf ist geladen.');}catch(error){notice(error.message||'Der Entwurf konnte nicht geladen werden.');}finally{event.target.value='';}
});
render();
