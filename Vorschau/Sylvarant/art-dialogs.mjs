import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { createArtDialogSession } from '../shared/country-workbench/art-dialog-session.mjs';
import { renderHouseDossier } from '../shared/house-detail-render.mjs';
import { artworkImage, artworkOriginal } from '../Leukonia/art-view.mjs';

const list = value => Array.isArray(value) ? value.join(' · ') : value || '';
const factsMarkup = facts => `<dl class="art-facts">${facts.filter(item => item.value).map(item => `<div><dt>${e(item.label)}</dt><dd>${e(item.value)}</dd></div>`).join('')}</dl>`;
const imageFigure = (item, label) => artworkImage(item)
  ? `<figure><a href="${e(artworkOriginal(item))}" target="_blank" rel="noopener"><img src="${e(artworkImage(item))}" alt="${e(label)}"></a><figcaption><a href="${e(artworkOriginal(item))}" target="_blank" rel="noopener">Großansicht ↗</a></figcaption></figure>`
  : '<p class="art-pending">Die Illustration wird vorbereitet.</p>';

export function createArtDialogs({ dialog, houses, warriors, prototypes, artworks, settlements, getPlacements, onChoose }) {
  const session = createArtDialogSession({ dialog, onSelect:onChoose });
  function showHouse(id) {
    const house = houses.find(item => item.id === id);
    if (!house) return;
    const seat = settlements.find(item => item.id === getPlacements()[id]);
    const warrior = warriors.find(item => item.houseId === id);
    const prototype = warrior && prototypes.find(item => item.id === warrior.prototypeId);
    const facts = [
      { label:'Sitz im Entwurf', value:seat?.name || 'Noch offen' },
      { label:'Rang', value:house.rank || 'Nicht festgelegt' },
      { label:'Gesellschaftliche Schicht', value:house.caste },
      { label:'Rahmen', value:house.frame },
      { label:'Belegter Hauskontext', value:house.note },
    ];
    if (warrior?.ready && house.ready) {
      session.open(renderHouseDossier({ title:house.name, source:'Sylvarant · Hausdarstellung', headingId:'art-title',
        warrior:{...warrior, className:prototype?.role || prototype?.name || warrior.role || warrior.className,
          roleLabel:warrior.status === 'supplied' ? 'Vorhandene Darstellung' : 'Kriegerentwurf',
          reason:warrior.reason || warrior.description, equipment:list(warrior.equipment), palette:list(warrior.palette || house.palette),
          mounted:Boolean(warrior.mount), horseName:warrior.mount?.name, bestiaryHref:warrior.mount?.href},
        crest:{image:house.crest,fullsize:artworkOriginal(house)},description:house.motif,facts,houseId:id,
        canPlace:Boolean(onChoose),originalLink:house.original,
      },e));
      return;
    }
    session.open(`<p class="eyebrow">Sylvarant · Hauswappen</p><h2 id="art-title">${e(house.name)}</h2><div class="art-detail-layout">${imageFigure({...house,image:house.crest},house.name)}<div><p>${e(house.motif)}</p>${factsMarkup(facts)}<p class="subtle">${house.status === 'supplied' ? 'Geliefertes Wappen, unverändert übernommen.' : 'Neuer Wappenentwurf; der Hausname wird am Ende ausgearbeitet.'}</p>${onChoose ? `<button class="primary" data-action="select-from-dialog" data-house="${e(id)}">Dieses Haus auf der Karte platzieren</button>` : ''}</div></div>`);
  }
  function show(kind, id) {
    if (kind === 'house') { showHouse(id); return; }
    const prototype = kind === 'prototype';
    const item = (prototype ? prototypes : artworks).find(entry => entry.id === id);
    if (!item) return;
    const title = item.role || item.name;
    const label = prototype ? 'Sylvarant · Kriegerprototyp' : item.kind === 'realm' ? 'Kaiserreich Argentum · Geliefertes Reichswappen' : 'Sylvarant · Provinzwappen';
    session.open(`<p class="eyebrow">${e(label)}</p><h2 id="art-title">${e(title)}</h2><div class="art-detail-layout${prototype ? ' prototype-art-detail' : ''}">${imageFigure(item,title)}<div><p>${e(item.description || item.motif)}</p>${factsMarkup([{label:'Ausrüstung',value:list(item.equipment)},{label:'Farben',value:list(item.palette)},{label:'Rahmen',value:item.frame}])}${item.mount?.href ? `<p><a href="${e(item.mount.href)}" target="_blank" rel="noopener">${e(item.mount.name)} im Bestiarium ↗</a></p>` : ''}<p class="subtle">Darstellung zur gemeinsamen Vorbereitung.</p></div></div>`);
  }
  return { show, showHouse, destroy:session.destroy };
}
