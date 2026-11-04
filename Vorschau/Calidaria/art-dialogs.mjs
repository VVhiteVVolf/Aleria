import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { artworkImage, artworkOriginal } from '../Leukonia/art-view.mjs';
import { renderHouseDossier } from '../shared/house-detail-render.mjs';

const textList = value => Array.isArray(value) ? value.join(' · ') : value || '';
const factsMarkup = facts => `<dl class="art-facts">${facts.filter(item => item.value).map(item => `<div><dt>${e(item.label)}</dt><dd>${e(item.value)}</dd></div>`).join('')}</dl>`;
const figure = (item, label) => artworkImage(item)
  ? `<figure><a href="${e(artworkOriginal(item))}" target="_blank" rel="noopener"><img src="${e(artworkImage(item))}" alt="${e(label)}"></a><figcaption><a href="${e(artworkOriginal(item))}" target="_blank" rel="noopener">Großansicht ↗</a></figcaption></figure>`
  : '<p class="art-pending">Die Illustration wird vorbereitet.</p>';

export function createArtDialogs({ dialog, houses, warriors, prototypes, artworks, settlements, getPlacements, onChoose }) {
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
    const seat = settlements.find(item => item.id === getPlacements()[id]);
    const facts = [
      { label: 'Gestaltungsrichtung', value: house.imperialDomain ? 'Kaiserliches Haus' : house.culture === 'argentum' ? 'Argentisches Siedlerhaus' : 'Tlapanui-geprägtes Haus' },
      { label: 'Sitz im Entwurf', value: seat?.name || 'Noch offen' },
      { label: 'Rang', value: house.rank || 'Nicht festgelegt' },
      { label: 'Farben', value: textList(house.palette) }, { label: 'Rahmen', value: house.frame },
    ];
    const warrior = warriors.find(item => item.houseId === id);
    if (warrior?.ready && house.ready) {
      open(renderHouseDossier({ title: house.name, source: house.imperialDomain ? 'Calidaria · Vorhandene kaiserliche Hausdarstellung' : 'Calidaria · Hausdarstellung', headingId: 'art-title',
        warrior: { ...warrior, className: warrior.role, roleLabel: warrior.status === 'supplied' ? 'Vorhandene Darstellung' : 'Kriegerentwurf',
          equipment: textList(warrior.equipment), palette: textList(warrior.palette), reason: warrior.reason || warrior.description },
        crest: { image: house.crest, fullsize: artworkOriginal(house) }, description: house.motif,
        facts, houseId: id, canPlace: Boolean(onChoose), originalLink: house.original,
      }, e));
      return;
    }
    const namingContext = house.culture === 'tlapanui'
      ? 'Familienname nach dem gelieferten Nuatlapa-Sprachmodul.'
      : 'Argentischer Familienname mit italisch-lateinischem Klang.';
    open(`<p class="eyebrow">Calidaria · Hauswappenentwurf</p><h2 id="art-title">${e(house.name)}</h2><div class="art-detail-layout">${figure({ ...house, image: house.crest }, house.name)}<div><p>${e(house.motif)}</p>${factsMarkup(facts)}<p class="subtle">${e(namingContext)}</p>${onChoose ? `<button class="primary" data-action="select-from-dialog" data-house="${e(id)}">Dieses Wappen auf der Karte platzieren</button>` : ''}</div></div>`);
  }
  function show(kind, id) {
    if (kind === 'house') { showHouse(id); return; }
    const item = (kind === 'prototype' ? prototypes : artworks).find(entry => entry.id === id);
    if (!item) return;
    const title = item.role || item.name;
    const prototype = kind === 'prototype';
    const label = prototype ? 'Tlapanui · Kriegerprototyp · Name offen' : item.kind === 'province' ? 'Calidaria · Provinzwappen' : 'Tlapatlan · Antikes Wappen';
    open(`<p class="eyebrow">${e(label)}</p><h2 id="art-title">${e(title)}</h2><div class="art-detail-layout${prototype ? ' prototype-art-detail' : ''}">${figure(item, title)}<div><p>${e(item.description || item.motif)}</p>${factsMarkup([{ label: 'Ausrüstung', value: textList(item.equipment) }, { label: 'Farben', value: textList(item.palette) }, { label: 'Rahmen', value: item.frame }])}<p class="subtle">${prototype ? 'Beschreibender Bildentwurf; kein endgültiger Klassenname und keine benannte Person.' : 'Wappenentwurf zur gemeinsamen Vorbereitung.'}</p></div></div>`);
  }
  return { show, showHouse };
}
