import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderArtButton } from '../Leukonia/art-view.mjs';
export { renderArtButton };

export function renderHistoricalEmblems(artworks) {
  return `<section class="section" id="heraldik"><p class="eyebrow">Vom Stier zum Herzogtum</p><h2>Die Zeichen zweier Zeiten.</h2><div class="province-art-grid">${artworks.map(art => `<article>${renderArtButton(art)}<p class="eyebrow">${art.kind === 'ancient' ? 'Fürstentum Grianeach' : 'Herzogtum Solestia'}</p><h3>${e(art.name)}</h3><p>${e(art.description || art.motif)}</p></article>`).join('')}</div></section>`;
}

export function renderHouseGallery(houses, warriors) {
  return `<section class="section" id="haeuser"><p class="eyebrow">Zwölf Häuser des Herzogtums</p><h2>Wappen, Klingen und Federn.</h2><div class="house-art-grid">${houses.map(house => {
    const warrior = warriors.find(item => item.houseId === house.id && item.ready);
    return `<article class="house-art-card"><div class="house-art-pair${warrior ? '' : ' crest-only'}">${renderArtButton({ ...house, image:house.crest },{ kind:'house' })}${warrior ? renderArtButton(warrior,{ kind:'house',id:house.id,label:`Figur zu ${house.name}`,figure:true }) : ''}</div><h3>${e(house.name)}</h3><p>${e(house.motif)}</p><p class="art-palette">${e((house.palette || []).join(' · '))}</p></article>`;
  }).join('')}</div></section>`;
}

export function renderClassPrototypes(prototypes) {
  return `<section class="section" id="krieger"><p class="eyebrow">Spanisch-iberische Kriegerkultur</p><h2>${prototypes.length} Kriegerklassen.</h2><div class="prototype-grid">${prototypes.map(prototype => `<article>${renderArtButton(prototype,{ kind:'prototype',label:prototype.role || prototype.name,figure:true })}<p class="eyebrow">Kriegerprototyp</p><h3>${e(prototype.role || prototype.name)}</h3><p>${e(prototype.description)}</p><p class="art-equipment">${e((prototype.equipment || []).join(' · '))}</p></article>`).join('')}</div></section>`;
}
