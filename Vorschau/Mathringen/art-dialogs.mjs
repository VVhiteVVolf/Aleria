import {escapeHtml as e} from '../shared/country-workbench/render.mjs';
import {createArtDialogSession} from '../shared/country-workbench/art-dialog-session.mjs';
import {renderEstateDetails} from '../shared/country-workbench/estate-view.mjs';
import {artworkImage,artworkOriginal,textList} from '../shared/country-workbench/art-media.mjs';
const facts=entries=>`<dl class="art-facts">${entries.filter(([,v])=>v).map(([key,value])=>`<div><dt>${e(key)}</dt><dd>${e(textList(value))}</dd></div>`).join('')}</dl>`;
function figure(art,label){
 const src=artworkImage(art),original=artworkOriginal(art);
 return src?`<figure><a href="${e(original)}" target="_blank" rel="noopener"><img src="${e(src)}" alt="${e(label)}"></a><figcaption><a href="${e(original)}" target="_blank" rel="noopener">Großansicht ↗</a></figcaption></figure>`:'<p class="art-pending">Die Illustration wird vorbereitet.</p>';
}
export function createArtDialogs({dialog,houses,prototypes,artworks,estates,settlements,getPlacements,onChoose}){
 const session=createArtDialogSession({dialog,onSelect:onChoose});
 function showHouse(id){
  const house=houses.find(h=>h.id===id);if(!house)return;
  const seat=settlements.find(c=>c.id===getPlacements()[id]),prototype=prototypes.find(p=>p.id===house.prototypeId);
  session.open(`<p class="eyebrow">Mathringen · Haus- und Sitzentwurf</p><h2 id="art-title">${e(house.name)}</h2><div class="art-detail-layout house-figure-pair">${figure(house,'Wappen '+house.name)}${figure(prototype,'Gemeinsamer Klassenprototyp '+prototype.name)}</div><div class="house-detail-copy"><p>${e(house.motif)}</p><p>Die Figur zeigt den gemeinsamen Klassenprototyp ${e(prototype.name)} als Gestaltungsbeispiel. Sie ist keine eigene Hausfigur und legt keine Ausbildung des Hauses fest.</p>${facts([['Rang',house.rank],['Sitz im Entwurf',seat?.name||'Sitz offen'],['Hausfarben',house.palette],['Rahmen',house.frame],['Hausname',house.note],['Grundmotiv',house.retainedSourceMotif?'Aus dem gelieferten Wappen beibehalten':'Neuer Motivvorschlag']])}${house.sourceImage?`<p><a href="${e(house.sourceImage)}" target="_blank" rel="noopener">Geliefertes Originalwappen ↗</a></p>`:''}<button data-action="show-art" data-art-kind="prototype" data-art-id="${e(prototype.id)}">Klassenprototyp ansehen ↗</button><button class="primary" data-action="select-from-dialog" data-house="${e(id)}">Dieses Haus auf der Karte platzieren</button></div>`);
 }
 function show(kind,id){
  if(kind==='house'){showHouse(id);return;}
  const collection=kind==='estate'?estates:kind==='prototype'?prototypes:artworks,art=collection.find(a=>a.id===id);if(!art)return;
  if(kind==='estate'){
   session.open(renderEstateDetails(art,{source:art.group==='clergy'?'Mathringen · Kleruskaste':art.group==='rank'?'Mathringen · Weltlicher Rang':'Mathringen · Weltlicher Stand'}));return;
  }
  session.open(`<p class="eyebrow">Mathringen · ${kind==='prototype'?'Kriegerprototyp':'Landeswappen'}</p><h2 id="art-title">${e(art.name)}</h2><div class="art-detail-layout${kind==='prototype'?' prototype-art-detail':''}">${figure(art,art.name)}<div><p>${e(art.description||art.motif)}</p>${facts([['Ausrüstung',art.equipment],['Farben',art.palette],['Rahmen',art.frame]])}</div></div>`);
 }
 return {show,showHouse,destroy:session.destroy};
}
