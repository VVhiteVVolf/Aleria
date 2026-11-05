import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { createArtDialogSession } from '../shared/country-workbench/art-dialog-session.mjs';
import { renderEstateDetails } from '../shared/country-workbench/estate-view.mjs';
import { artworkImage,artworkOriginal,textList } from '../Leukonia/art-view.mjs';

const facts = entries => `<dl class="art-facts">${entries.filter(([,value]) => value).map(([label,value]) => `<div><dt>${e(label)}</dt><dd>${e(textList(value))}</dd></div>`).join('')}</dl>`;
const figure = (art,label) => artworkImage(art)
  ? `<figure><a href="${e(artworkOriginal(art))}" target="_blank" rel="noopener"><img src="${e(artworkImage(art))}" alt="${e(label)}"></a><figcaption><a href="${e(artworkOriginal(art))}" target="_blank" rel="noopener">Großansicht ↗</a></figcaption></figure>`
  : '<p class="art-pending">Die Illustration wird vorbereitet.</p>';

export function createArtDialogs({dialog,houses,prototypes,warriors,regionShields,artworks,estates,settlements,getPlacements,onChoose}) {
  const session = createArtDialogSession({dialog,onSelect:onChoose});
  function showHouse(id) {
    const house = houses.find(item => item.id === id);
    if (!house) return;
    const seat = settlements.find(city => city.id === getPlacements()[id]);
    const warrior = warriors.find(item => item.houseId === house.id);
    const prototype = prototypes.find(item => item.id === (warrior?.prototypeId || house.prototypeId));
    const role = house.royal ? 'Königshaus in der gemeinsamen Hauptstadt' : 'Periökenhaus · Oberhaupt in der Geruso';
    session.open(`<p class="eyebrow">Phalantia · Hausvorschlag</p><h2 id="art-title">${e(house.name)}</h2><div class="art-detail-layout house-figure-pair">${figure({...house,image:house.crest},`Wappen ${house.name}`)}${warrior ? figure(warrior,`Hauskrieger ${house.name}`) : '<p class="art-pending">Die Hausfigur wird vorbereitet.</p>'}</div><div class="house-detail-copy"><p>${e(house.motif)}</p>${warrior ? `<p>${e(warrior.description)}</p>` : ''}${facts([['Hausrang',house.localTitle ? `${house.localTitle} (${house.rank})` : house.rank],['Stellung',role],['Sitz im Entwurf',seat?.name || 'Sitz offen'],['Hausfarben',house.palette],['Rahmen',house.frame],['Hauskontext',house.note],['Ausrüstung',warrior?.equipment]])}${warrior?.mount?.href ? `<p><a href="${e(warrior.mount.href)}" target="_blank" rel="noopener">${e(warrior.mount.name)} im Bestiarium ↗</a></p>` : ''}${prototype ? `<div class="class-reference"><p>Zugehörige Klasse: ${e(prototype.name || prototype.role)}.</p><button data-action="show-art" data-art-kind="prototype" data-art-id="${e(prototype.id)}">Klassenprototyp ansehen ↗</button></div>` : ''}<button class="primary" data-action="select-from-dialog" data-house="${e(id)}">Dieses Haus auf der Karte platzieren</button></div>`);
  }
  function show(kind,id) {
    if (kind === 'house') { showHouse(id); return; }
    const collection = kind === 'estate' ? estates : kind === 'prototype' ? prototypes : kind === 'region' ? regionShields : artworks;
    const art = collection.find(item => item.id === id);
    if (!art) return;
    if (kind === 'estate') { session.open(renderEstateDetails(art,{source:'Phalantia · Gesellschaftlicher Stand'})); return; }
    const title = art.name || art.role;
    session.open(`<p class="eyebrow">Phalantia · ${kind === 'prototype' ? 'Kriegerprototyp' : kind === 'region' ? 'Regionsschild auf Hoplon-Basis' : 'Landeswappen'}</p><h2 id="art-title">${e(title)}</h2><div class="art-detail-layout${kind === 'prototype' ? ' prototype-art-detail' : ''}">${figure(art,title)}<div><p>${e(art.description || art.motif)}</p>${facts([['Ausrüstung',art.equipment],['Farben',art.palette],['Rahmen',art.frame]])}${art.mount?.href ? `<p><a href="${e(art.mount.href)}" target="_blank" rel="noopener">${e(art.mount.name)} im Bestiarium ↗</a></p>` : ''}</div></div>`);
  }
  return {show,showHouse,destroy:session.destroy};
}
