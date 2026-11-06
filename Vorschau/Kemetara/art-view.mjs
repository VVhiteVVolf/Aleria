import {escapeHtml as e} from '../shared/country-workbench/render.mjs';
import {renderArtButton,textList} from '../shared/country-workbench/art-media.mjs';
export {renderArtButton};
export function renderHouseGallery(houses){
 const group=(entries,title)=>`<div class="heraldic-group"><h3>${e(title)}</h3><div class="house-art-grid">${entries.map(h=>`<article class="house-art-card"><div class="house-art-pair">${renderArtButton({...h,image:h.crest},{kind:'house'})}${renderArtButton({...h,image:h.warriorImage,fullsize:h.warriorFullsize},{kind:'house',label:'Kriegerfigur zu '+h.name,figure:true})}</div><h3>${e(h.name)}</h3><p class="eyebrow">${e(h.localTitle)}</p><p>${e(h.motif)}</p><p class="art-palette">${e(textList(h.palette))}</p></article>`).join('')}</div></div>`;
 return `<section class="section" id="haeuser"><p class="eyebrow">Neue Familiennamen und runde Wappen · Vorschläge</p><h2>Eine Pharaonenfamilie und zwölf Stadthäuser.</h2><p class="section-intro">Die Namen folgen dem ägyptisch geprägten Klang Kemetaras. Jedes Haus erhält eine eigene Kriegerdarstellung nach Wappen und Kartenlage. Personen und Stammbäume sind noch nicht ausgearbeitet.</p>${group(houses.filter(h=>h.royal),'Die pharaonische Familie')}${group(houses.filter(h=>!h.royal),'Die Tjaty-Häuser')}</section>`;
}
export function renderClassPrototypes(prototypes){
 return `<section class="section" id="krieger"><p class="eyebrow">Kemetarische Kriegerkultur</p><h2>Sechs Kriegerprototypen.</h2><p class="section-intro">Die Rollen verbinden schlichte Fußtruppe, gut gerüstete Kämpfer, Mariner, Reiterei und klerikale Pracht. Die Ausrüstung folgt den vorgegebenen Klassen.</p><div class="prototype-grid">${prototypes.map(p=>`<article>${renderArtButton(p,{kind:'prototype',label:p.name,figure:true})}<p class="eyebrow">Klassenprototyp</p><h3>${e(p.name)}</h3><p>${e(p.description)}</p><p class="art-equipment">${e(p.equipment)}</p></article>`).join('')}</div></section>`;
}
export function renderRegions(regions,houses,settlements,shields){
 return `<section class="section" id="gebiete"><p class="eyebrow">Stadträume und feste Schildform</p><h2>Dreizehn Regionszeichen.</h2><p class="section-intro">Jeder Stadtsitz erhält ein eigenes Regionsschild. Die gemeinsame Form ist länglich, mit geraden Seiten, flachem Boden und halbkreisförmiger Oberkante. Die Karte erhält dadurch keine neuen politischen Grenzlinien.</p><div class="region-grid">${regions.map(r=>{
  const city=settlements.find(c=>c.id===r.capitalId),house=houses.find(h=>h.sourceSeat===city.id),shield=shields.find(s=>s.regionId===r.id);
  return `<article class="region-card">${renderArtButton(shield,{kind:'region',label:'Regionsschild '+city.name})}<p class="eyebrow">${e(r.kindLabel)}</p><h3>${e(city.name)}</h3><p>${e(r.description)}</p><p class="region-house">Ausgangsvorschlag: ${e(house.name)}</p></article>`;
 }).join('')}</div></section>`;
}
