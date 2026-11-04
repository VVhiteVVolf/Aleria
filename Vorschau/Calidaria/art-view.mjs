import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderArtButton } from '../Leukonia/art-view.mjs';

export { renderArtButton };

export function renderProvinceHeraldry(artworks) {
  if (!artworks.length) return '';
  return `<section class="section" id="heraldik"><p class="eyebrow">Provinz und altes Tlapatlan</p><h2>Zwei Zeichen der Inseln.</h2><div class="province-art-grid">${artworks.map(item => `<article>${renderArtButton(item)}<p class="eyebrow">${item.kind === 'province' ? 'Provinzwappen · Entwurf' : 'Antikes Wappen · Entwurf'}</p><h3>${e(item.name)}</h3><p>${e(item.description || item.motif)}</p></article>`).join('')}</div></section>`;
}

export function renderHouseGallery(houses, warriors = []) {
  const groups = [
    { culture: 'imperial', title: 'Das kaiserliche Haus', text: 'Haus Mede sitzt nach Vorgabe in der durch die Raute markierten Hauptstadt.' },
    { culture: 'argentum', title: 'Argentische Siedlerhäuser', text: 'Römisch-ritterliche Heraldik der zugewanderten Familien.' },
    { culture: 'tlapanui', title: 'Tlapanui-geprägte Häuser', text: 'Schlichtere Inselheraldik mit Dschungeltieren, Meer und Handel als Motiven.' },
  ];
  return `<section class="section" id="haeuser"><p class="eyebrow">Zwei Handschriften · Gemeinsame Provinz</p><h2>Die Hauswappen.</h2><p class="section-intro">Ein Wappen je Kartenort und sechs weitere bilden den Entwurfspool. Rund 40 Prozent der Wappen gehören zu argentisch geprägten Siedlerhäusern; die übrigen zu Tlapanui-geprägten Häusern. Das vorhandene Kaiserhaus Mede kommt zusätzlich hinzu. Die Tlapanui-Hausnamen folgen Nuatlapa, die Siedlernamen dem argentischen Sprachklang. Ränge und Sitze der neuen Häuser sind noch offen.</p>${groups.map(group => {
    const entries = houses.filter(house => group.culture === 'imperial' ? house.imperialDomain : house.culture === group.culture && !house.imperialDomain);
    return `<div class="heraldic-group"><div class="section-heading"><div><p class="eyebrow">${entries.length} Wappenentwürfe</p><h3>${e(group.title)}</h3></div></div><p class="section-intro">${e(group.text)}</p><div class="house-art-grid">${entries.map(house => {
      const warrior = warriors.find(item => item.houseId === house.id && item.ready);
      return `<article class="house-art-card"><div class="house-art-pair${warrior ? '' : ' crest-only'}">${renderArtButton({ ...house, image: house.crest }, { kind: 'house' })}${warrior ? renderArtButton(warrior, { kind: 'house', id: house.id, label: `Figur zu ${house.name}`, figure: true }) : ''}</div><h3>${e(house.name)}</h3><p>${e(house.motif)}</p><p class="art-palette">${e(house.palette.join(' · '))}</p></article>`;
    }).join('')}</div></div>`;
  }).join('')}</section>`;
}

export function renderClassPrototypes(prototypes) {
  return `<section class="section" id="krieger"><p class="eyebrow">Tlapanui · Kultur und Ausrüstung</p><h2>Fünf Kriegerprototypen.</h2><p class="section-intro">Eigenständige Tlapanui-Entwürfe mit vorwiegend Rapa-Nui-geprägter Gestaltung, ergänzenden aztekischen und Maya-Einflüssen und argentischer Stahlverarbeitung. Die Bezeichnungen beschreiben die Bilder; eigene Klassennamen folgen später.</p><div class="prototype-grid">${prototypes.map(prototype => `<article>${renderArtButton(prototype, { kind: 'prototype', label: prototype.role || prototype.name, figure: true })}<p class="eyebrow">Arbeitsbezeichnung · Name offen</p><h3>${e(prototype.role || prototype.name)}</h3><p>${e(prototype.description)}</p><p class="art-equipment">${e(prototype.equipment.join(' · '))}</p></article>`).join('')}</div></section>`;
}
