import {houses,settlements,rankLabels,realmDesigns,createMapProposal} from './realm-data.mjs?v=20261026-5';
import {createDesignState} from './design-state.mjs?v=20261026-5';
import {escapeHtml,houseCard,renderCollectiveName,renderCounties,renderSettlements,renderFixedHouses,renderRealmDesigns,renderNewHouses,renderAlbicClans,renderRevisedHouses,renderHouseDetails} from './proposal-render.mjs?v=20261026-5';
import {createPlacementControls} from '../shared/placement-controls.mjs?v=20261026-1';
import {createClanMap} from '../shared/clan-map.mjs';

const root=document.querySelector('[data-goldmund-proposal]');
const state=createDesignState();
const storageKey='aleria:proposal:goldmund:draft:v1';
const houseSelect=root.querySelector('[data-role="house-select"]');
const seatSelect=root.querySelector('[data-role="seat-select"]');
const dialog=root.querySelector('#house-dialog');
let selected=null,noticeTimer,houseTrigger;

function notice(message) {
 const box=root.querySelector('[data-role="status"]');box.textContent=message;box.hidden=false;
 clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>box.hidden=true,6500);
}
function save() {
 try{localStorage.setItem(storageKey,state.serialize());}
 catch{notice('Der Entwurf bleibt in dieser Ansicht erhalten. Der Browser konnte ihn nicht dauerhaft speichern.');}
}
function showHouse(id) {
 const house=houses.find(item=>item.id===id);if(!house)return;
 houseTrigger=document.activeElement;
 dialog.querySelector('[data-role="house-details"]').innerHTML=renderHouseDetails(house,state.currentPlacements(),state.currentDesign());
 dialog.showModal();
}
function render() {
 const placements=state.currentPlacements(),design=state.currentDesign();
 const unassigned=houses.filter(house=>placements[house.id]===null);
 const crest=realmDesigns.find(item=>item.id===design.realmCrest);
 root.querySelector('[data-role="hero-crest"]').src=`assets/realm/${crest.id}.webp`;
 root.querySelector('[data-role="hero-crest"]').alt=`Fürstentumswappen: ${crest.name}`;
 root.querySelector('[data-role="hero-crest-link"]').href=crest.fullsize;
 root.querySelector('[data-role="hero-crest-name"]').textContent=crest.name;
 root.querySelector('[data-role="collective-name"]').innerHTML=renderCollectiveName(design);
 root.querySelector('[data-role="counties"]').innerHTML=renderCounties(design);
 root.querySelector('[data-role="realm-designs"]').innerHTML=renderRealmDesigns(design.realmCrest);
 root.querySelector('[data-role="settlements"]').innerHTML=renderSettlements(placements,selected,design);
 root.querySelector('[data-role="unassigned-houses"]').innerHTML=unassigned.map(house=>houseCard(house,selected)).join('')||'<p>Alle freien Häuser haben einen Sitz im Entwurf.</p>';
 root.querySelector('[data-role="unassigned-count"]').textContent=`${unassigned.length} ohne Sitz`;
 houseSelect.value=selected??'';
 root.querySelector('[data-action="move-selected"]').disabled=!selected;
 root.querySelector('[data-action="cancel-selection"]').disabled=!selected;
 root.querySelector('[data-action="undo"]').disabled=!state.canUndo();
 root.querySelector('[data-role="selection-hint"]').textContent=selected?`${houses.find(house=>house.id===selected).name} ist ausgewählt. Einen Ort anklicken oder einen Sitz aus der Liste wählen.`:'Ein freies Wappen auswählen und einen Ort anklicken – oder das Wappen direkt auf einen Ort ziehen.';
 map.render();controls.render(createMapProposal(placements));
}
function choose(id) {
 selected=houses.some(house=>house.id===id)&&state.canMove(id)?id:null;
 seatSelect.value=selected?state.currentPlacements()[selected]??'':'';
 render();
}
function move(id,seat) {
 if(!state.move(id,seat))return;
 const name=houses.find(house=>house.id===id).name,place=settlements.find(item=>item.id===seat);
 selected=null;save();render();notice(`${name}: ${place?`Sitz in ${place.name}.`:'Sitz wieder offen.'}`);
}
function chooseAndScroll(id) {
 choose(id);root.querySelector('#karte').scrollIntoView({behavior:'smooth',block:'start'});houseSelect.focus({preventScroll:true});
}
function download() {
 const url=URL.createObjectURL(new Blob([state.serialize()],{type:'application/json'}));
 const link=document.createElement('a');link.href=url;link.download='goldmund-entwurf.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);
}

const map=createClanMap({root:root.querySelector('[data-role="map-section"]'),dialog:root.querySelector('#map-dialog'),tooltip:root.querySelector('#clan-tooltip'),getVariant:()=>createMapProposal(state.currentPlacements()),escape:escapeHtml,onClan:showHouse,rankLabel:house=>rankLabels[house.rank],rootClanLabel:'Weitere Lehenszugehörigkeit offen',caption:proposal=>`${proposal.clans.filter(house=>house.seat!==null).length} zugeordnete Hauswappen · 8 Orte · Goldveld und Roden fest in Thronholt. Die Karte behält ihre gelieferten Beschriftungen.`});
const controls=createPlacementControls({root,getSelected:()=>selected,onMove:move,escape:escapeHtml,canMove:id=>state.canMove(id)});

root.querySelector('[data-role="fixed-houses"]').innerHTML=renderFixedHouses();
root.querySelector('[data-role="new-houses"]').innerHTML=renderNewHouses();
root.querySelector('[data-role="albic-clans"]').innerHTML=renderAlbicClans();
root.querySelector('[data-role="revised-houses"]').innerHTML=renderRevisedHouses();
houseSelect.insertAdjacentHTML('beforeend',['Geliefertes Haus','Neuer Hausvorschlag','Albischer Clanvorschlag'].map(source=>`<optgroup label="${escapeHtml(source)}">${houses.filter(house=>house.source===source&&state.canMove(house.id)).map(house=>`<option value="${house.id}">${escapeHtml(house.name)}</option>`).join('')}</optgroup>`).join(''));
seatSelect.insertAdjacentHTML('beforeend',settlements.map(seat=>`<option value="${seat.id}">${escapeHtml(seat.name)}</option>`).join(''));
try{const saved=localStorage.getItem(storageKey);if(saved){
 const draft=JSON.parse(saved);state.restore(draft);
 if(Object.keys(draft.placements).length!==houses.length||houses.some(house=>!Object.hasOwn(draft.placements,house.id))){save();notice('Der bisherige Entwurf wurde auf die aktuelle Hausauswahl übertragen. Die Zuordnungen der beibehaltenen Häuser bleiben erhalten.');}
}}
catch{notice('Der gespeicherte Entwurf konnte nicht geladen werden. Die ursprünglichen Vorschläge werden angezeigt.');}

houseSelect.addEventListener('change',()=>choose(houseSelect.value));
dialog.addEventListener('close',()=>houseTrigger?.isConnected&&houseTrigger.focus({preventScroll:true}));
root.addEventListener('submit',event=>{
 const form=event.target.closest('form[data-name-scope]');if(!form)return;event.preventDefault();
 try{if(state.rename(form.dataset.nameScope,form.dataset.nameId,new FormData(form).get('name'))){
  const {nameScope,nameId}=form.dataset;save();render();
  const editor=root.querySelector(`form[data-name-scope="${nameScope}"][data-name-id="${nameId}"]`);
  editor.closest('details').open=true;editor.querySelector('input').focus({preventScroll:true});notice('Der Namensvorschlag wurde gespeichert.');
 }}
 catch(error){notice(error.message);}
});
root.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');if(!button)return;
 switch(button.dataset.action){
  case 'choose-house':choose(selected===button.dataset.house?null:button.dataset.house);root.querySelector(`[data-action="choose-house"][data-house="${button.dataset.house}"]`)?.focus({preventScroll:true});break;
  case 'show-house':showHouse(button.dataset.house);break;
  case 'choose-and-scroll':chooseAndScroll(button.dataset.house);break;
  case 'select-from-dialog':dialog.close();chooseAndScroll(button.dataset.house);break;
  case 'close-house':dialog.close();break;
  case 'choose-realm':if(state.chooseCrest(button.dataset.design)){save();render();root.querySelector(`[data-action="choose-realm"][data-design="${button.dataset.design}"]`)?.focus({preventScroll:true});notice('Der Wappenentwurf ist für diese Vorschau ausgewählt.');}break;
  case 'move-selected':if(selected)move(selected,seatSelect.value||null);break;
  case 'cancel-selection':choose(null);break;
  case 'open-map':map.open();break;
  case 'toggle-crests':map.toggleCrests(button);controls.render(createMapProposal(state.currentPlacements()));break;
  case 'toggle-names':map.toggleNames(button);controls.render(createMapProposal(state.currentPlacements()));break;
  case 'undo':if(state.undo()){selected=null;save();render();notice('Die letzte Änderung am Entwurf wurde zurückgenommen.');}break;
  case 'reset':if(state.reset()){selected=null;save();render();notice('Namen, Wappenauswahl und Hauszuordnungen sind auf den Ausgangsstand zurückgesetzt.');}break;
  case 'export':download();break;
  case 'import':root.querySelector('[data-role="import-file"]').click();break;
  case 'print':window.print();break;
 }
});
root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!root.querySelector('dialog[open]'))choose(null);});
root.querySelector('[data-role="import-file"]').addEventListener('change',async event=>{
 const file=event.target.files?.[0];if(!file)return;
 try{if(file.size>100000)throw Error('Die Entwurfsdatei ist zu groß.');state.restore(JSON.parse(await file.text()));selected=null;save();render();notice('Namen, Wappenauswahl und Hauszuordnungen wurden gemeinsam geladen.');}
 catch(error){notice(error.message||'Der Entwurf konnte nicht geladen werden.');}
 finally{event.target.value='';}
});
render();
