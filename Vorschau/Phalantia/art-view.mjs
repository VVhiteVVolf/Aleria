import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderArtButton,textList } from '../Leukonia/art-view.mjs';
export { renderArtButton };

function houseGroup(houses,label,warriors) {
  return `<div class="heraldic-group"><h3>${e(label)}</h3><div class="house-art-grid">${houses.map(house => {
    const warrior = warriors.find(item => item.houseId === house.id && item.ready);
    return `<article class="house-art-card"><div class="house-art-pair${warrior ? '' : ' crest-only'}">${renderArtButton({...house,image:house.crest},{kind:'house'})}${warrior ? renderArtButton(warrior,{kind:'house',id:house.id,label:`Hauskrieger ${house.name}`,figure:true}) : ''}</div><h3>${e(house.name)}</h3><p class="eyebrow">${e(house.localTitle || house.rank)}</p><p>${e(house.motif)}</p><p class="art-palette">${e(textList(house.palette))}</p></article>`;
  }).join('')}</div></div>`;
}

export function renderHouseGallery(houses,warriors) {
  return `<section class="section" id="haeuser"><p class="eyebrow">Hausnamen, Wappen und Krieger · Vorschläge</p><h2>Zwei königliche Linien und sieben Landadelshäuser.</h2><p class="section-intro">Die Königshäuser wohnen gemeinsam in Lysandreia. Die Oberhäupter der sieben Periökenhäuser bilden die Geruso. Die Hausfenster zeigen das Wappen neben der eigenen Hausfigur sowie Rang und Sitzentwurf.</p>${houseGroup(houses.filter(house => house.royal),'Die beiden Königshäuser',warriors)}${houseGroup(houses.filter(house => !house.royal),'Die Periökenhäuser',warriors)}</section>`;
}

export function renderClassPrototypes(prototypes) {
  return `<section class="section" id="krieger"><p class="eyebrow">Phalantische Kriegerkultur</p><h2>Acht Kriegerprototypen.</h2><p class="section-intro">Die Prototypen zeigen die festgelegten Rollen. Die königliche Agoge bleibt den Jungen der beiden Königshäuser vorbehalten; der Hippeus ist ihr schwer gepanzerter königlicher Krieger.</p><div class="prototype-grid">${prototypes.map(prototype => `<article>${renderArtButton(prototype,{kind:'prototype',label:prototype.role || prototype.name,figure:true})}<p class="eyebrow">Klassenprototyp</p><h3>${e(prototype.name || prototype.role)}</h3><p>${e(prototype.description)}</p><p class="art-equipment">${e(textList(prototype.equipment))}</p></article>`).join('')}</div></section>`;
}
