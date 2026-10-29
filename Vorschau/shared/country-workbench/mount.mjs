import {createCountryPlacement} from '../country-placement.mjs';
import {createCountryDialogs} from './dialogs.mjs';
import {escapeHtml,rankLabel,houseCard,createCountryRenderer,renderCountryPage} from './render.mjs';
import {renderOccupation} from './occupation-view.mjs';

export function mountCountryWorkbench(config){
 const {context,houses,counties,settlements,warriors,territoryArt}=config;
 const root=document.querySelector('[data-country-workbench]');
 root.innerHTML=renderCountryPage(config);
 const renderer=createCountryRenderer(config);
 root.querySelector('[data-role="counties"]').innerHTML=renderer.renderCounties();
 const occupation=root.querySelector('[data-role="occupation"]');
 occupation.innerHTML=renderOccupation(context.realm==='triarchie'?null:context.realm);
 occupation.hidden=!occupation.innerHTML;
 root.querySelector('[data-role="warriors"]').innerHTML=warriors.map(w=>`<button class="country-warrior-card" data-action="show-house" data-house="${escapeHtml(w.id)}"><img src="${escapeHtml(w.image)}" width="240" height="360" loading="lazy" alt="${escapeHtml(w.name)} · ${escapeHtml(w.className)}"><strong>${escapeHtml(w.name)}</strong><small>${escapeHtml(w.className)} · ${w.historical?'Historischer Entwurf':'Entwurf'}</small></button>`).join('');
 let timer;
 function notice(text){const b=root.querySelector('[data-role="status"]');b.textContent=text;b.hidden=false;clearTimeout(timer);timer=setTimeout(()=>b.hidden=true,6500);}
 const dialogs=createCountryDialogs({dialog:root.querySelector('#art-dialog'),houses,warriors,territoryArt,settlements,getPlacements:()=>placements.current(),onChoose:id=>placements.choose(id)});
 const placements=createCountryPlacement({root,onHouse:id=>dialogs.showHouse(id),notice},{houses,settlements,createPlacementState:config.createPlacementState,createMapProposal:config.createMapProposal,escapeHtml,houseCard,renderSeats:renderer.renderSeats,rankLabel,storageKey:`aleria:proposal:${context.realm}:placements:v1`,resetMessage:context.resetMessage,exportName:`${context.realm}-entwurf.json`,caption:p=>`${p.clans.filter(h=>h.seat!==null).length} zugeordnete Familien · ${settlements.length} Orte · Die gelieferte Karte bleibt unverändert.`});
 root.addEventListener('click',event=>{const b=event.target.closest('button[data-action]');if(!b)return;if(b.dataset.action==='show-house')dialogs.showHouse(b.dataset.house);if(b.dataset.action==='show-territory')dialogs.showTerritory(b.dataset.territory);if(b.dataset.action==='print')window.print();});
}
