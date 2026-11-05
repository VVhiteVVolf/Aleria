import {escapeHtml as e} from '../shared/country-workbench/render.mjs';
import {renderArtButton,textList} from '../shared/country-workbench/art-media.mjs';
export {renderArtButton};
export function renderHouseGallery(houses){
 return `<section class="section" id="haeuser"><p class="eyebrow">Wappen, Namen und Ausgangssitze</p><h2>Vierundvierzig Familienzeichen.</h2><p class="section-intro">Die vorhandenen Wappen erhalten neue Fassungen mit ihren erkennbaren Grundmotiven. Ergänzende Namen folgen dem gelieferten Namensvorrat; neue Häuser und alle Stadtsitze bleiben Vorschläge.</p><div class="house-art-grid">${houses.map(h=>`<article class="house-art-card">${renderArtButton({...h,image:h.crest},{kind:'house'})}<h3>${e(h.name)}</h3><p class="eyebrow">${e(h.localTitle)}</p><p>${e(h.motif)}</p><p class="art-palette">${e(textList(h.palette))}</p></article>`).join('')}</div></section>`;
}
export function renderClassPrototypes(prototypes){
 return `<section class="section" id="krieger"><p class="eyebrow">Mathringische Kriegskultur</p><h2>Sieben Kriegerprototypen.</h2><p class="section-intro">Frauen dürfen in Mathringen keine Krieger sein. Die folgenden Darstellungen zeigen männliche Kämpfer in Schwarz und Gold mit dem Greifenmotiv. Greifenreiterei bleibt der Kaiserfamilie und wenigen Ausnahmen unter den Herzogshäusern vorbehalten.</p><div class="prototype-grid">${prototypes.map(p=>`<article>${renderArtButton(p,{kind:'prototype',figure:true})}<h3>${e(p.name)}</h3><p>${e(p.description)}</p><p class="art-equipment">${e(p.equipment)}</p></article>`).join('')}</div></section>`;
}
