import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderHouseDossier } from '../shared/house-detail-render.mjs';
import { artworkImage, artworkOriginal, textList } from './art-view.mjs?v=20261103-leukonia-4';

const factsMarkup = facts => `<dl class="art-facts">${facts.filter(item => item.value).map(item => `<div><dt>${e(item.label)}</dt><dd>${e(item.value)}</dd></div>`).join('')}</dl>`;
const largeFigure = (item, label) => artworkImage(item) ? `<figure><a href="${e(artworkOriginal(item))}" target="_blank" rel="noopener"><img src="${e(artworkImage(item))}" alt="${e(label)}"></a><figcaption><a href="${e(artworkOriginal(item))}" target="_blank" rel="noopener">Original in Großansicht ↗</a></figcaption></figure>` : '<p class="art-pending">Die Illustration wird vorbereitet.</p>';

export function createArtDialogs({ dialog, artworks, castes, houses, warriors, prototypes, settlements, getPlacements, onChoose }) {
  let trigger;
  function open(html) {
    trigger = document.activeElement;
    dialog.querySelector('[data-role="art-details"]').innerHTML = html;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  dialog.addEventListener('close', () => { if (trigger?.isConnected) trigger.focus({ preventScroll: true }); });
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-action="close-art"]')) dialog.close();
    const choice = event.target.closest('[data-action="select-from-dialog"]');
    if (choice && onChoose) { dialog.close(); onChoose(choice.dataset.house); }
  });

  function showHouse(id) {
    const house = houses.find(item => item.id === id);
    if (!house) return;
    const warrior = warriors.find(item => (item.houseId || item.id) === id);
    const prototype = warrior && prototypes.find(item => item.id === (warrior.prototypeId || warrior.classId));
    const seat = settlements.find(item => item.id === getPlacements()[id]);
    const facts = [{ label: 'Sitz im Entwurf', value: seat?.name || 'Noch offen' }, { label: 'Rang', value: house.rank || 'Nicht festgelegt' }, { label: 'Rahmen', value: house.frame }];
    if (warrior && artworkImage(warrior) && artworkImage({ ...house, image: house.crest })) {
      open(renderHouseDossier({ title: house.name, source: 'Leukonia · Hausentwurf', headingId: 'art-title',
        warrior: { ...warrior, fullsize: artworkOriginal(warrior), className: prototype?.role || prototype?.name || warrior.role || 'Kriegerentwurf', roleLabel: 'Klassenname offen',
          reason: warrior.reason || warrior.description, equipment: textList(warrior.equipment), palette: textList(warrior.palette || house.palette),
          mounted: Boolean(warrior.mount), horseName: warrior.mount?.name, bestiaryHref: warrior.mount?.href },
        crest: { image: house.crest, fullsize: artworkOriginal(house) }, description: house.motif,
        facts, houseId: id, canPlace: Boolean(onChoose), originalLink: house.original,
      }, e));
      return;
    }
    open(`<p class="eyebrow">Leukonia · Hausentwurf</p><h2 id="art-title">${e(house.name)}</h2><div class="art-detail-layout">${largeFigure({ ...house, image: house.crest }, house.name)}<div>${house.motif ? `<p>${e(house.motif)}</p>` : ''}${factsMarkup(facts)}<p class="subtle">${warrior ? 'Die passende Hausfigur wird vorbereitet.' : 'Für dieses Wappen ist noch keine eigene Hausfigur zugeordnet.'}</p>${onChoose ? `<button class="primary" data-action="select-from-dialog" data-house="${e(id)}">Dieses Haus auf der Karte platzieren</button>` : ''}</div></div>`);
  }

  function show(kind, id) {
    if (kind === 'house') { showHouse(id); return; }
    const collection = kind === 'caste' ? castes : kind === 'prototype' ? prototypes : artworks;
    const item = collection.find(entry => entry.id === id);
    if (!item) return;
    const facts = [
      { label: 'Farben', value: textList(item.palette) }, { label: 'Rahmen', value: item.frame },
      { label: 'Ausrüstung', value: textList(item.equipment) },
    ];
    const title = kind === 'prototype' ? item.role || item.name : item.name || item.role;
    open(`<p class="eyebrow">${kind === 'prototype' ? 'Kriegerrolle · Klassenname offen' : kind === 'caste' ? 'Gesellschaftlicher Stand' : 'Leukonia · Zeichen und Banner'}</p><h2 id="art-title">${e(title)}</h2><div class="art-detail-layout${kind === 'prototype' ? ' prototype-art-detail' : ''}">${largeFigure(item, item.alt || title)}<div><p>${e(item.description || item.motif || item.reason)}</p>${factsMarkup(facts)}${item.mount?.href ? `<p><a href="${e(item.mount.href)}" target="_blank" rel="noopener">${e(item.mount.name)} im Bestiarium ↗</a></p>` : ''}<p class="subtle">${kind === 'caste' ? 'Comicdarstellung der bestätigten gesellschaftlichen Schicht.' : 'Bildentwurf zur gemeinsamen Vorbereitung.'}</p></div></div>`);
  }
  return { show, showHouse };
}
