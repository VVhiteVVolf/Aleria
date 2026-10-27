import {previewAsset} from './preview-assets.mjs';
import {renderClanDossier} from './clan-warriors.mjs';

export const clanRankLabel=clan=>clan.rank||'Rang offen';

export function renderClanTree(variant,rootId,{escape,compact=false}){
 const byId=id=>variant.clans.find(clan=>clan.id===id);
 function node(id,depth){
  const clan=byId(id),children=variant.clans.filter(c=>c.liege===id);
  const seat=variant.settlements.find(place=>place.id===clan.seat);
  const head=`<img src="${previewAsset('assets/'+clan.crest)}" width="42" height="42" alt="Wappen ${escape(clan.name)}"><span><strong>${escape(clan.name)}</strong><small>${escape(clanRankLabel(clan))} · ${escape(seat.name)}</small></span>`;
  const action=`<button data-action="show-clan" data-clan="${clan.id}" aria-label="${escape(clan.name)} – Lehen ansehen">↗</button>`;
  if(!children.length)return `<li class="clan-leaf" data-tree-clan="${id}"><div class="clan-row">${head}${action}</div></li>`;
  return `<li data-tree-clan="${id}"><details class="clan-branch" ${depth===0?'open':''}><summary>${head}<span class="branch-count">${children.length} direkt</span></summary><div class="clan-branch-content"><div class="branch-action">${action}<span>Lehensdetails dieses Clans</span></div><ul>${children.map(c=>node(c.id,depth+1)).join('')}</ul></div></details></li>`;
 }
 return `<ul class="clan-tree ${compact?'compact':''}">${node(rootId,0)}</ul>`;
}

export function clanLineage(variant,id){
 const path=[];
 let current=variant.clans.find(c=>c.id===id);
 while(current){path.unshift(current);current=variant.clans.find(c=>c.id===current.liege);}
 return path;
}

export function createClanDetails({dialog,getVariant,escape}){
 let trigger;
 function show(id){
  const variant=getVariant(),clan=variant.clans.find(c=>c.id===id);
  if(!clan)return;
  if(!dialog.open)trigger=document.activeElement;
  const place=variant.settlements.find(p=>p.id===clan.seat);
  const region=variant.regions.find(r=>r.id===place.region);
  const path=clanLineage(variant,id);
  const liege=path.at(-2);
  const change=variant.changes.filter(c=>c.clan===id);
  const home=[...path].reverse().map(c=>variant.regions.find(r=>r.rulerId===c.id)).find(Boolean);
  const direct=variant.clans.filter(c=>c.liege===id);
  dialog.querySelector('[data-role="clan-detail"]').innerHTML=`${renderClanDossier({clan,variant,place,region,path,liege},escape)}${home?.id!==region.id?'<p class="change-note">Fürstliches Sonderlehen: Die direkte Bindung an die Lága gilt unabhängig von der umgebenden Kartenfläche.</p>':''}<p class="subtle">${['Ard Tiarna','Mor Tiarna'].includes(clan.rank)?'Das Wappen kennzeichnet den Herrschaftssitz.':'Das Wappen kennzeichnet ein örtliches Lehen und dessen Bannkreis; es bedeutet keine alleinige Herrschaft über die gesamte Stadt.'}</p>${clan.alias?`<p class="subtle">Auch als „${escape(clan.alias)}“ genannt; Schreibweise hier nach der gelieferten Wappendatei.</p>`:''}${change.map(c=>`<p class="change-note"><strong>Vorschlag dieser Variante:</strong> ${escape(c.text)}</p>`).join('')}${direct.length?'<h3>Untergeordnete Clans</h3>'+renderClanTree(variant,id,{escape,compact:true}):''}`;
  if(!dialog.open)dialog.showModal();
  dialog.querySelector('.clan-dialog-body').scrollTop=0;
 }
 dialog.addEventListener('click',event=>{
  if(event.target.closest('[data-action="close-clan"]'))dialog.close();
  const button=event.target.closest('[data-action="show-clan"]');
  if(button)show(button.dataset.clan);
 });
 dialog.addEventListener('close',()=>{if(trigger?.isConnected)trigger.focus({preventScroll:true});});
 return {show};
}
