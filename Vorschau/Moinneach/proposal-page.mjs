import {sourceProposals,variants} from './proposal-data.mjs';
import {createProposalState} from './proposal-state.mjs';
import {escapeHtml,renderSettlements,renderVariants,renderRegions} from './proposal-render.mjs';
import {createClanDialog} from './clan-dialog.mjs';
import {createRegionDialog} from './region-dialog.mjs';
import {createClanMap} from '../shared/clan-map.mjs';

const root=document.querySelector('[data-moinneach-proposal]');
const state=createProposalState(sourceProposals);
state.select('alternative-1');
const status=root.querySelector('[data-role="status"]');
let noticeTimer;
function notice(message){
 status.textContent=message;status.hidden=false;
 clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{status.hidden=true;},4000);
}
function render(){
 const proposal=state.current();
 root.querySelector('[data-role="settlements"]').innerHTML=renderSettlements(proposal);
 root.querySelector('[data-role="variants"]').innerHTML=renderVariants(variants,proposal.id);
 root.querySelector('[data-role="regions"]').innerHTML=renderRegions(proposal);
 root.querySelector('[data-role="variant-summary"]').textContent=proposal.summary;
 root.querySelector('[data-role="active-variant"]').textContent=proposal.label;
 root.querySelector('[data-role="active-map-title"]').textContent=proposal.label;
 const button=root.querySelector('[data-action="toggle-edit"]');
 button.setAttribute('aria-pressed',String(state.isEditing()));
 button.textContent=state.isEditing()?'Bearbeiten aktiv':'Bearbeiten';
 map.render();
}
const details=createClanDialog({dialog:root.querySelector('#clan-dialog'),state,onChange:render,notice});
const regionDetails=createRegionDialog({dialog:root.querySelector('#region-dialog'),getProposal:state.current,onClan:details.show});
const map=createClanMap({root:root.querySelector('[data-role="map-section"]'),
 dialog:root.querySelector('#map-dialog'),tooltip:root.querySelector('#clan-tooltip'),
 getVariant:state.current,escape:escapeHtml,onClan:id=>details.show(id),
 rootClanLabel:'Rang und Lehnsherr noch offen',
 caption:proposal=>`${proposal.label} · ${proposal.regions.length} Gebiete · ${proposal.clans.length} Clanwappen. Linien zeigen auf die zugewiesenen Städte; Wappen öffnen die Details.`});

root.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');
 if(!button)return;
 const action=button.dataset.action;
 if(action==='show-region')regionDetails.show(button.dataset.region);
 if(action==='choose-variant'){
  const id=button.dataset.variant;
  state.select(id);render();
  root.querySelector(`[data-variant="${id}"]`).focus({preventScroll:true});
 }
 if(action==='show-clan'&&!button.closest('[data-role="map-surface"]')&&!button.closest('#clan-dialog'))details.show(button.dataset.clan);
 if(action==='toggle-edit'){state.toggleEditing();render();notice(state.isEditing()?'Einen Clan öffnen, um seine Zuordnung zu bearbeiten.':'Vorschau aktiv.');}
 if(action==='open-map')map.open();
 if(action==='toggle-crests')map.toggleCrests(button);
 if(action==='toggle-names')map.toggleNames(button);
 if(action==='reset-proposal'){state.reset();render();notice('Die Zuordnungen dieser Variante sind wiederhergestellt.');}
 if(action==='print')window.print();
});
render();
