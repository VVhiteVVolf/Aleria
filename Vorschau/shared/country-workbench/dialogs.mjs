import {renderHouseDossier} from '../house-detail-render.mjs';
import {escapeHtml as e,rankLabel} from './render.mjs';

export function createCountryDialogs({dialog,houses,warriors,territoryArt,settlements,onChoose,getPlacements}){
 let trigger;
 function show(html){trigger=document.activeElement;dialog.querySelector('[data-role="art-details"]').innerHTML=html;if(!dialog.open)dialog.showModal();dialog.scrollTop=0;}
 dialog.addEventListener('close',()=>{if(trigger?.isConnected)trigger.focus({preventScroll:true});});
 dialog.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(!b)return;if(b.dataset.action==='close-art')dialog.close();if(b.dataset.action==='select-from-dialog'){dialog.close();onChoose(b.dataset.house);}});
 return {
  showHouse(id){
   const h=houses.find(h=>h.id===id),w=warriors.find(w=>w.id===id);if(!h||!w)return;
   const seat=settlements.find(s=>s.id===getPlacements()[id]);
   show(renderHouseDossier({title:`${h.clan?'Clan':'Haus'} ${h.name}`,source:h.source,headingId:'art-title',warrior:{...w,palette:w.palette.join(' · ')},classHref:w.classHref,crest:{image:h.crest,fullsize:h.fullsize},description:h.motif,facts:[{label:'Rolle',value:rankLabel(h)},{label:'Sitz im Entwurf',value:seat?.name??'Noch offen'},{label:'Rahmen',value:h.frame},{label:'Herkunftssitz',value:h.formerSeat??h.originLabel??'Nicht vorgegeben'},{label:'Zuordnung',value:h.sourceSeat?'Ausgangssitz nach Vorgabe beziehungsweise ausdrücklich markierter Vorschlag; bearbeitbar.':'Sitz und Lehnsherr offen.'}],houseId:id,canPlace:true,originalLink:h.isNew?null:h.original},e));
  },
  showTerritory(id){const t=territoryArt.find(t=>t.id===id);if(!t)return;show(`<p class="eyebrow">${e(t.kind)} · Entwurf</p><h2 id="art-title">${e(t.name)}</h2><div class="art-detail-layout"><figure><a href="${e(t.fullsize)}" target="_blank" rel="noopener"><img src="${e(t.image)}" width="480" height="480" alt="${e(t.name)}"></a><figcaption><a href="${e(t.fullsize)}" target="_blank" rel="noopener">Großansicht ↗</a></figcaption></figure><div><p>${e(t.motif)}</p><p>${e(t.palette.join(' · '))}</p><p>${e(t.geography??'Gemeinsames Zeichen der farblich zusammengehörigen Teilgebiete.')}</p><p class="subtle">Ein Regionalzeichen legt keine Familie und keinen Lehnsherrn fest.</p></div></div>`);}
 };
}
