import {escapeHtml as e} from '../shared/country-workbench/render.mjs';
import {createArtDialogSession} from '../shared/country-workbench/art-dialog-session.mjs';
import {renderEstateDetails} from '../shared/country-workbench/estate-view.mjs';
import {artworkImage,artworkOriginal,textList} from '../shared/country-workbench/art-media.mjs';

function figure(art,label){
  return `<figure><a href="${e(artworkOriginal(art))}" target="_blank" rel="noopener"><img src="${e(artworkImage(art))}" alt="${e(label)}"></a><figcaption><a href="${e(artworkOriginal(art))}" target="_blank" rel="noopener">Großansicht ↗</a></figcaption></figure>`;
}
function facts(entries){
  return `<dl class="art-facts">${entries.filter(([,value])=>value).map(([label,value])=>`<div><dt>${e(label)}</dt><dd>${e(textList(value))}</dd></div>`).join('')}</dl>`;
}

export function createArtDialogs({dialog,houses,prototypes,estates,realmArtwork}){
  const session=createArtDialogSession({dialog});
  function show(kind,id){
    if(kind==='house'){
      const house=houses.find(item=>item.id===id);if(!house)return;
      const prototype=prototypes.find(item=>item.id===house.prototypeId);
      session.open(`<p class="eyebrow">Adharath · Stammesentwurf</p><h2 id="art-title">${e(house.name)}</h2><div class="art-detail-layout house-figure-pair">${figure(house,'Stammeswappen '+house.name)}${prototype?figure(prototype,'Gemeinsamer Klassenprototyp '+prototype.name):''}</div><div class="house-detail-copy"><p>${e(house.motif)}</p>${facts([['Einordnung','Einer der zwölf größeren nomadischen Stämme'],['Führung','Taoiseach · Stammesführer'],['Lebensraum','Unterwegs auf Tirnara; kein fester Herrschaftssitz festgelegt'],['Farben',house.palette||house.colors],['Rahmen',house.frame],['Name',house.note]])}${prototype?`<p class="prototype-disclaimer">Die Figur zeigt den gemeinsamen Klassenprototyp <strong>${e(prototype.name)}</strong> als Gestaltungsbeispiel. Sie ist keine eigene Stammesfigur und legt dem Stamm keine ausschließliche Kampfweise fest.</p><button type="button" data-action="show-art" data-art-kind="prototype" data-art-id="${e(prototype.id)}">Klassenentwurf ansehen ↗</button>`:''}${house.sourceImage?`<p><a href="${e(house.sourceImage)}" target="_blank" rel="noopener">Geliefertes Originalwappen ↗</a></p>`:''}</div>`);
      return;
    }
    if(kind==='estate'){
      const estate=estates.find(item=>item.id===id);if(estate)session.open(renderEstateDetails(estate,{source:'Adharath · Gesellschaft und überlieferte Titel'}));return;
    }
    const art=kind==='prototype'?prototypes.find(item=>item.id===id):kind==='realm'&&id===realmArtwork.id?realmArtwork:null;
    if(!art)return;
    const mountName=typeof art.mount==='object'?art.mount?.name:art.mount||art.mountSpecies,mountHref=art.mount?.href||art.mountHref;
    session.open(`<p class="eyebrow">Adharath · ${kind==='prototype'?'Kriegerprototyp':'Historisches Volkswappen'}</p><h2 id="art-title">${e(art.name)}</h2><div class="art-detail-layout${kind==='prototype'?' prototype-art-detail':''}">${figure(art,art.name)}<div><p>${e(art.description)}</p>${facts([['Ausrüstung',art.equipment],['Reittier',mountName],['Einordnung',art.status]])}${mountHref?`<p><a href="${e(mountHref)}">Reittier im Bestiarium ↗</a></p>`:''}</div></div>`);
  }
  return {show,destroy:session.destroy};
}
