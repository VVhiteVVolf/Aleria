import {renderClanTree} from './clan-hierarchy.mjs';

export function renderVariantView({variant,variants,escape}){
 document.querySelector('#variant-buttons').innerHTML=variants.map(v=>`<button data-action="choose-variant" data-variant="${v.id}" aria-pressed="${v.id===variant.id}"><span>0${v.number}</span>${escape(v.short)}<small>${v.regions.length} Gebiete</small></button>`).join('');
 document.querySelector('#variant-title').textContent=variant.title;
 document.querySelector('#variant-summary').textContent=variant.summary;
 document.querySelector('#variant-benefit').textContent=variant.strength;
 document.querySelector('#variant-tradeoff').textContent=variant.tradeoff;
 document.querySelector('#region-stat').textContent=variant.regions.length+' Regionen';
 document.querySelector('#rank-stat').textContent=`1 Fürstendomäne · ${variant.regions.length-1} Oberherrschaften · ${variant.clans.length} Clans`;
 document.querySelector('#clan-lede').textContent=`Namen, Banner und die Lehen von ${variant.clans.length} Clans – auf drei Karten zum direkten Vergleichen.`;
 document.querySelector('#map-clan-count').textContent=`Alle ${variant.clans.length} Clanwappen · Linien führen zum jeweiligen Ort`;
 document.querySelector('#banner-title').textContent=`Die ${variant.regions.length} Regionsbanner`;
 document.querySelector('#clan-tree').innerHTML=renderClanTree(variant,'laga',{escape});
 document.querySelector('#variant-changes').innerHTML=variant.changes.length?variant.changes.map(c=>`<li><strong>${escape(c.title)}</strong><span>${escape(c.text)}</span></li>`).join(''):'<li><strong>Deine Vorgaben als Ausgangspunkt</strong><span>Keine vorgeschlagenen Rang- oder Lehnswechsel. Ua Muirin bleiben unmittelbar den Lága unterstellt.</span></li>';
 const open=variant.settlements.filter(place=>!variant.clans.some(clan=>clan.seat===place.id));
 document.querySelector('#open-seats-title').textContent=open.length?'Orte ohne zugewiesenes örtliches Clanlehen':'Alle Kartenorte haben eine Clan-Zuordnung';
 document.querySelector('#assignment-summary').textContent=open.length?`${open.length} Kartenorte haben noch keinen örtlichen Clan. Ihre Oberherrschaft steht bereits fest.`:`Alle ${variant.settlements.length} benannten Kartenorte sind den ${variant.clans.length} Clans zugeordnet.`;
 document.querySelector('#open-seats').hidden=!open.length;
 document.querySelector('#open-seats').innerHTML=open.map(place=>`<span><strong>${escape(place.name)}</strong><small>${escape(variant.regions.find(r=>r.id===place.region).clan)}</small></span>`).join('');
 const ranks=['Ard Tiarna','Mor Tiarna','Dún Tiarna','Laird'].map(rank=>`${variant.clans.filter(c=>c.rank===rank).length} ${rank}`);
 const undecided=variant.clans.filter(clan=>!clan.rank).length;
 if(undecided)ranks.push(`${undecided} Rang offen`);
 document.querySelector('#clan-counters').textContent=ranks.join(' · ');
}
