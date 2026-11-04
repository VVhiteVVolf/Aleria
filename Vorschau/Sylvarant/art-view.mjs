import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderArtButton } from '../Leukonia/art-view.mjs';
export { renderArtButton };

export function renderRealmHeraldry(artworks) {
  return `<section class="section" id="heraldik"><p class="eyebrow">Reich und Provinz</p><h2>Die Zeichen Sylvarants.</h2><div class="province-art-grid">${artworks.map(item => `<article>${renderArtButton(item)}<p class="eyebrow">${item.kind === 'realm' ? 'Geliefertes Reichswappen' : 'Provinzwappen · Entwurf'}</p><h3>${e(item.name)}</h3><p>${e(item.description || item.motif)}</p></article>`).join('')}</div></section>`;
}

export function renderHouseGallery(houses, warriors) {
  const groups = [
    { supplied:true, title:'Die gelieferten Häuser', text:'Siebzehn bestehende Hauswappen bleiben unverändert. Mede beginnt in der Hauptstadt der kaiserlichen Domäne.' },
    { supplied:false, title:'Zusätzliche Wappenentwürfe', text:'Die noch fehlenden Ortswappen werden um vier weitere Zeichen ergänzt. Neue Namen folgen erst am Ende; die Arbeitsnummern bleiben bis dahin bestehen.' },
  ];
  return `<section class="section" id="haeuser"><p class="eyebrow">Vorlagen und Ergänzungen</p><h2>Die Häuser Sylvarants.</h2>${groups.map(group => {
    const entries = houses.filter(house => (house.status === 'supplied') === group.supplied);
    return `<div class="heraldic-group"><div class="section-heading"><div><p class="eyebrow">${entries.length} Häuser</p><h3>${e(group.title)}</h3></div></div><p class="section-intro">${e(group.text)}</p><div class="house-art-grid">${entries.map(house => {
      const warrior = warriors.find(item => item.houseId === house.id && item.ready);
      return `<article class="house-art-card"><div class="house-art-pair${warrior ? '' : ' crest-only'}">${renderArtButton({ ...house, image:house.crest }, { kind:'house' })}${warrior ? renderArtButton(warrior, { kind:'house', id:house.id, label:`Figur zu ${house.name}`, figure:true }) : ''}</div><h3>${e(house.name)}</h3><p>${e(house.motif)}</p>${house.note ? `<p class="house-note">${e(house.note)}</p>` : ''}<p class="art-palette">${e(house.palette.join(' · '))}</p></article>`;
    }).join('')}</div></div>`;
  }).join('')}</section>`;
}

export function renderClassPrototypes(prototypes) {
  return `<section class="section" id="krieger"><p class="eyebrow">Lateinisch-römische Rüstungskultur</p><h2>${prototypes.length} Kriegerprototypen.</h2><p class="section-intro">Wohlhabende ritterliche Ausstattung und verschiedene römische Helme prägen die Entwürfe. Schilde erhalten die ausdrücklich gewünschte große, rechteckige und aufgestellte Testudo-Form.</p><div class="prototype-grid">${prototypes.map(prototype => `<article>${renderArtButton(prototype, { kind:'prototype', label:prototype.role || prototype.name, figure:true })}<p class="eyebrow">Kriegerprototyp</p><h3>${e(prototype.role || prototype.name)}</h3><p>${e(prototype.description)}</p><p class="art-equipment">${e(prototype.equipment.join(' · '))}</p></article>`).join('')}</div></section>`;
}
