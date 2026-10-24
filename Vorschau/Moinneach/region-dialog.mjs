import {escapeHtml as escape} from './proposal-render.mjs';

export function createRegionDialog({dialog,getProposal,onClan}){
 let trigger;
 function show(id){
  const proposal=getProposal();
  const region=proposal.regions.find(value=>value.id===id);
  if(!region?.design)return;
  const design=region.design;
  const clans=proposal.clans.filter(clan=>region.seats.includes(clan.seat));
  trigger=document.activeElement;
  dialog.querySelector('[data-role="region-title"]').textContent=design.name;
  dialog.querySelector('[data-role="region-detail"]').innerHTML=`
   <div class="region-design-detail"><figure><img src="${design.banner}" alt="Bannerentwurf ${escape(design.name)}" width="1254" height="1254"><figcaption>${escape(design.colours)}</figcaption></figure>
    <div><p class="eyebrow">${design.source?'Namens- und Bannerentwurf':'Bannerzuordnung'}</p><h3>${escape(design.byname)}</h3>${design.meaning?`<p class="region-translation">${escape(design.meaning)}</p>`:''}
     <p class="region-places">${region.seats.map(id=>escape(proposal.settlements.find(place=>place.id===id).name)).join(' · ')}</p>
     <h4>Landschaft</h4><p>${escape(design.landscape)}</p>
     <h4>${design.source?'Warum dieser Name?':'Motiv und Zuordnung'}</h4><p>${escape(design.rationale)}</p>
     <h4>Das Banner</h4><p>${escape(design.motif)}</p>
     ${design.source?`<details class="language-source"><summary>Sprachliche Grundlage</summary><p>Albischer Namensvorschlag nach dem bisherigen Tir-na-Schema. Die irische Wortform und Bedeutung sind im <a href="${design.source}" target="_blank" rel="noopener noreferrer">Wörterbuch Teanglann</a> nachzulesen. Die deutschen Beinamen sind freie Entwürfe.</p></details>`:''}
    </div></div><div class="region-clans">${clans.map(clan=>`<button data-action="region-clan" data-clan="${clan.id}"><img src="assets/${clan.crest}" alt="" width="34" height="34"><span>${escape(clan.name)}</span></button>`).join('')}</div>`;
  dialog.showModal();
 }
 dialog.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');
  if(!button)return;
  if(button.dataset.action==='close-region')dialog.close();
  if(button.dataset.action==='region-clan'){
   dialog.close();onClan(button.dataset.clan);
  }
 });
 dialog.addEventListener('close',()=>{
  if(!document.querySelector('dialog[open]')&&trigger?.isConnected)trigger.focus({preventScroll:true});
 });
 return {show};
}
