import { escapeHtml as e } from '../shared/country-workbench/render.mjs';

export const artworkImage = item => item?.ready === false ? null : item?.image || item?.crest || null;
export const artworkOriginal = item => item?.fullsize || item?.original || artworkImage(item);
export const textList = value => Array.isArray(value) ? value.join(' · ') : value || '';

export function renderArtButton(item, { kind = 'artwork', id = item.id, label = item.name, figure = false } = {}) {
  const image = artworkImage(item);
  if (!image) return '<p class="art-pending">Die Illustration wird vorbereitet.</p>';
  return `<button class="art-button${figure ? ' figure-art-button' : ''}" data-action="show-art" data-art-kind="${e(kind)}" data-art-id="${e(id)}" aria-label="${e(label)} ansehen"><img src="${e(image)}" alt="${e(label)}" width="${figure ? 768 : 480}" height="${figure ? 1152 : 480}" loading="lazy"><span>Großansicht und Details ↗</span></button>`;
}

export function renderCastes(castes) {
  return `<section class="section" id="staende"><p class="eyebrow">Gesellschaftliche Schichten</p><h2>Sechs Stände des Kaiserreichs.</h2><div class="caste-grid">${castes.map(caste => `<article><div class="caste-art">${renderArtButton(caste, { kind: 'caste' })}</div><h3>${e(caste.name)}</h3><p>${e(caste.description)}</p></article>`).join('')}</div></section>`;
}

export function renderProvinceAndBanners(artworks, archonates, settlements) {
  const provincial = artworks.filter(item => ['province', 'realm'].includes(item.kind));
  const banners = artworks.filter(item => item.kind === 'archonate'
    && archonates.some(archonate => archonate.bannerId === item.id || archonate.id === item.archonateId));
  const bannerCards = banners.map(banner => {
    const archonate = archonates.find(item => item.bannerId === banner.id || item.id === banner.archonateId || item.id === banner.id);
    const cities = archonate && settlements.filter(city => city.archonateId === archonate.id || archonate.cityIds?.includes(city.id));
    return `<article class="banner-card">${renderArtButton(banner)}<h3>${e(banner.name)}</h3>${banner.description || banner.motif ? `<p>${e(banner.description || banner.motif)}</p>` : ''}${cities?.length ? `<p class="banner-cities">${e(cities.map(city => city.name).join(' · '))}</p>` : ''}</article>`;
  }).join('');
  return `<section class="section" id="heraldik"><p class="eyebrow">Provinz und Archonate</p><h2>Die Zeichen Leukonias.</h2>${provincial.length ? `<div class="province-art-grid">${provincial.map(item => `<article>${renderArtButton(item)}<h3>${e(item.name)}</h3><p>${e(item.description || item.motif)}</p></article>`).join('')}</div>` : ''}${banners.length ? `<div class="banner-grid">${bannerCards}</div>` : '<p class="section-intro">Die Archonatsbanner werden für diese Vorbereitung ausgearbeitet.</p>'}</section>`;
}

export function renderHouseGallery(houses, warriors) {
  return `<section class="section" id="haeuser"><p class="eyebrow">Gelieferte Vorlagen und neue Entwürfe</p><h2>Die Hauswappen.</h2><p class="section-intro">Die Wappen öffnen das jeweilige Dossier. Namen, Ränge und Sitze neuer Häuser bleiben zur gemeinsamen Ausarbeitung offen.</p><div class="house-art-grid">${houses.map(house => {
    const warrior = warriors.find(item => (item.houseId || item.id) === house.id);
    return `<article class="house-art-card"><div class="house-art-pair${warrior ? '' : ' crest-only'}">${renderArtButton({ ...house, image: house.crest }, { kind: 'house' })}${warrior ? renderArtButton(warrior, { kind: 'house', id: house.id, label: `Figur zu ${house.name}`, figure: true }) : ''}</div><h3>${e(house.name)}</h3>${house.motif ? `<p>${e(house.motif)}</p>` : ''}<p class="art-palette">${e(textList(house.palette))}</p></article>`;
  }).join('')}</div></section>`;
}

export function renderClassPrototypes(prototypes) {
  return `<section class="section" id="krieger"><p class="eyebrow">Kultur und Ausrüstung</p><h2>Sieben Kriegerentwürfe.</h2><p class="section-intro">Die Rollen sind vorgegeben; eigene Klassennamen stehen noch nicht fest. Die Darstellungen dienen als Grundlage für die Krieger der Häuser.</p><div class="prototype-grid">${prototypes.map(prototype => `<article>${renderArtButton(prototype, { kind: 'prototype', label: prototype.role || prototype.name, figure: true })}<p class="eyebrow">Klassenname offen</p><h3>${e(prototype.role || prototype.name)}</h3><p>${e(prototype.description || prototype.reason)}</p>${prototype.equipment ? `<p class="art-equipment">${e(textList(prototype.equipment))}</p>` : ''}</article>`).join('')}</div></section>`;
}
