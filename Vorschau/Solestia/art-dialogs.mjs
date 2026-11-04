import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { createArtDialogSession } from '../shared/country-workbench/art-dialog-session.mjs';
import { renderHouseDossier } from '../shared/house-detail-render.mjs';
import { renderEstateDetails } from '../shared/country-workbench/estate-view.mjs';
import { artworkImage, artworkOriginal } from '../Leukonia/art-view.mjs';

const list = value => Array.isArray(value) ? value.join(' · ') : value || '';
const facts = entries => `<dl class="art-facts">${entries.filter(([,value]) => value).map(([label,value]) => `<div><dt>${e(label)}</dt><dd>${e(list(value))}</dd></div>`).join('')}</dl>`;
const figure = (art,label) => artworkImage(art)
  ? `<figure><a href="${e(artworkOriginal(art))}" target="_blank" rel="noopener"><img src="${e(artworkImage(art))}" alt="${e(label)}"></a><figcaption><a href="${e(artworkOriginal(art))}" target="_blank" rel="noopener">Großansicht ↗</a></figcaption></figure>`
  : '<p class="art-pending">Die Illustration wird vorbereitet.</p>';

export function createArtDialogs({ dialog,houses,warriors,prototypes,artworks,estates = [],settlements,getPlacements,onChoose }) {
  const session = createArtDialogSession({ dialog,onSelect:onChoose });
  function showHouse(id) {
    const house = houses.find(item => item.id === id);
    if (!house) return;
    const seat = settlements.find(city => city.id === getPlacements()[id]);
    const warrior = warriors.find(item => item.houseId === id);
    const prototype = warrior && prototypes.find(item => item.id === warrior.prototypeId);
    const houseFacts = [{ label:'Sitz im Entwurf',value:seat?.name || 'Sitz offen' },
      { label:'Hausrang',value:house.localTitle ? `${house.localTitle} (${house.rank})` : house.rank || 'Noch nicht festgelegt' },
      { label:'Rahmen',value:house.frame },{ label:'Hauskontext',value:house.note }];
    if (warrior?.ready && house.ready) {
      session.open(renderHouseDossier({ title:house.name,source:'Solestia · Hausdarstellung',headingId:'art-title',
        warrior:{ ...warrior,className:prototype?.role || prototype?.name || warrior.role,
          roleLabel:'Kriegerentwurf',reason:warrior.reason || warrior.description,
          equipment:list(warrior.equipment),palette:list(warrior.palette || house.palette),
          mounted:Boolean(warrior.mount),horseName:warrior.mount?.name,bestiaryHref:warrior.mount?.href },
        crest:{ image:house.crest,fullsize:artworkOriginal(house) },description:house.motif,
        facts:houseFacts,houseId:id,canPlace:Boolean(onChoose),originalLink:house.original },e));
    } else {
      session.open(`<p class="eyebrow">Solestia · Hauswappen</p><h2 id="art-title">${e(house.name)}</h2><div class="art-detail-layout">${figure({ ...house,image:house.crest },house.name)}<div><p>${e(house.motif)}</p>${facts(houseFacts.map(item => [item.label,item.value]))}${onChoose ? `<button class="primary" data-action="select-from-dialog" data-house="${e(id)}">Dieses Haus auf der Karte platzieren</button>` : ''}</div></div>`);
    }
  }
  function show(kind,id) {
    if (kind === 'house') { showHouse(id); return; }
    const isPrototype = kind === 'prototype';
    const isEstate = kind === 'estate';
    const art = (isEstate ? estates : isPrototype ? prototypes : artworks).find(item => item.id === id);
    if (!art) return;
    if (isEstate) {
      session.open(renderEstateDetails(art,{ source:'Solestia · Gesellschaftlicher Stand' }));
      return;
    }
    const title = art.role || art.name;
    const source = isEstate ? 'Solestia · Gesellschaftlicher Stand' : isPrototype ? 'Solestia · Kriegerprototyp' : art.kind === 'ancient' ? 'Fürstentum Grianeach · Historisches Wappen' : 'Herzogtum Solestia · Landeswappen';
    const details = isEstate ? [['Gemeine Zunge',art.commonTitle],['Einordnung',art.statusLabel]]
      : [['Ausrüstung',art.equipment],['Farben',art.palette],['Rahmen',art.frame]];
    session.open(`<p class="eyebrow">${e(source)}</p><h2 id="art-title">${e(title)}</h2><div class="art-detail-layout${isPrototype ? ' prototype-art-detail' : ''}">${figure(art,title)}<div><p>${e(art.description || art.motif)}</p>${facts(details)}${art.mount?.href ? `<p><a href="${e(art.mount.href)}" target="_blank" rel="noopener">${e(art.mount.name)} im Bestiarium ↗</a></p>` : ''}</div></div>`);
  }
  return { show,showHouse,destroy:session.destroy };
}
