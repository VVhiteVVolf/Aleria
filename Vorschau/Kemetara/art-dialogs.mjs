import {escapeHtml as e} from '../shared/country-workbench/render.mjs';
import {createArtDialogSession} from '../shared/country-workbench/art-dialog-session.mjs';
import {renderEstateDetails} from '../shared/country-workbench/estate-view.mjs';
import {artworkImage,artworkOriginal,textList} from '../shared/country-workbench/art-media.mjs';
const facts=entries=>`<dl class="art-facts">${entries.filter(([,v])=>v).map(([k,v])=>`<div><dt>${e(k)}</dt><dd>${e(textList(v))}</dd></div>`).join('')}</dl>`;
const figure=(art,label)=>`<figure><a href="${e(artworkOriginal(art))}" target="_blank" rel="noopener"><img src="${e(artworkImage(art))}" alt="${e(label)}"></a><figcaption><a href="${e(artworkOriginal(art))}" target="_blank" rel="noopener">Großansicht ↗</a></figcaption></figure>`;
const warriorFigure=art=>({image:art.warriorImage,fullsize:art.warriorFullsize});
export function createArtDialogs({dialog,houses,prototypes,regionShields,artworks,estates,settlements,getPlacements,onChoose}){
 const session=createArtDialogSession({dialog,onSelect:onChoose});
 function showHouse(id){
  const house=houses.find(h=>h.id===id);if(!house)return;
  const seat=settlements.find(c=>c.id===getPlacements()[id]);
  const prototype=prototypes.find(p=>p.id===house.prototypeId);
  session.open(`<p class="eyebrow">Kemetara · Hausvorschlag</p><h2 id="art-title">${e(house.name)}</h2><div class="art-detail-layout house-figure-pair">${figure({...house,image:house.crest},'Wappen '+house.name)}${figure(warriorFigure(house),'Eigene Kriegerfigur zu '+house.name)}</div><div class="house-detail-copy"><p>${e(house.motif)}</p><p>${e(house.warriorDescription)}</p>${facts([['Hausstand',house.rank],['Sitz im Entwurf',seat?.name||'Sitz offen'],['Klasse der Darstellung',prototype.name],['Ausrüstung',house.warriorEquipment],['Helm und Kopfschmuck',house.warriorHelmet],['Hausfarben',house.palette],['Rahmen',house.frame],['Hauskontext',house.note]])}<button data-action="show-art" data-art-kind="prototype" data-art-id="${e(prototype.id)}">Klassenprototyp ansehen ↗</button><button class="primary" data-action="select-from-dialog" data-house="${e(id)}">Dieses Haus auf der Karte platzieren</button></div>`);
 }
 function show(kind,id){
  if(kind==='house'){showHouse(id);return;}
  const collection=kind==='estate'?estates:kind==='prototype'?prototypes:kind==='region'?regionShields:artworks;
  const art=collection.find(a=>a.id===id);if(!art)return;
  if(kind==='estate'){session.open(renderEstateDetails(art,{source:'Kemetara · Gesellschaftlicher Stand'}));return;}
  if(kind==='region'){
   const house=houses.find(h=>h.id===art.houseId),city=settlements.find(c=>c.id===house.sourceSeat);
   session.open(`<p class="eyebrow">Kemetara · Regionsschild mit rundbogiger Oberkante</p><h2 id="art-title">${e(art.name)}</h2><div class="art-detail-layout house-figure-pair">${figure(art,art.name)}${figure(warriorFigure(house),'Kriegerfigur des Stadthauses '+house.name)}</div><div class="house-detail-copy"><p>${e(art.description)}</p><p>${e(art.motif)}</p><p>Die Figur gehört zum Ausgangsvorschlag ${e(house.name)} in ${e(city.name)}. Freie Sitzänderungen auf der Karte verändern diese gestalterische Zuordnung nicht.</p><p>${e(house.warriorDescription)}</p>${facts([['Farben',art.palette],['Form und Rahmen',art.frame]])}</div>`);return;
  }
  if(art.warriorImage){
   session.open(`<p class="eyebrow">Kemetara · Landeszeichen und Landesdarstellung</p><h2 id="art-title">${e(art.name)}</h2><div class="art-detail-layout house-figure-pair">${figure(art,art.name)}${figure(warriorFigure(art),'Kriegerdarstellung zum Landeswappen')}</div><div class="house-detail-copy"><p>${e(art.description)}</p><p>${e(art.warriorDescription)}</p>${facts([['Ausrüstung',art.warriorEquipment],['Helm und Kopfschmuck',art.warriorHelmet]])}</div>`);return;
  }
  session.open(`<p class="eyebrow">Kemetara · ${kind==='region'?'Regionsschild mit rundbogiger Oberkante':kind==='prototype'?'Kriegerprototyp':'Landeswappen'}</p><h2 id="art-title">${e(art.name)}</h2><div class="art-detail-layout${kind==='prototype'?' prototype-art-detail':''}">${figure(art,art.name)}<div><p>${e(art.description||art.motif)}</p>${facts([['Ausrüstung',art.equipment],['Farben',art.palette],['Form und Rahmen',art.frame]])}${art.mount?.href?`<p><a href="${e(art.mount.href)}" target="_blank" rel="noopener">${e(art.mount.name)} im Bestiarium ↗</a></p>`:''}</div></div>`);
 }
 return {show,showHouse,destroy:session.destroy};
}
