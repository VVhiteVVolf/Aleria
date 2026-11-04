import { REALM_CONTEXT } from './realm-context.mjs?v=20261103-leukonia-4';
import { SOCIAL_CASTES } from './culture-data.mjs?v=20261103-leukonia-4';
import { ARTWORKS } from './art-data.mjs?v=20261103-leukonia-4';
import { HOUSES } from './house-data.mjs?v=20261103-leukonia-4';
import { CLASS_PROTOTYPES, WARRIORS } from './warrior-data.mjs?v=20261103-leukonia-4';
import { MAP_VARIANTS, ARCHONATES, SETTLEMENTS } from './map-data.mjs?v=20261103-leukonia-4';
import { renderLeukoniaPage } from './proposal-render.mjs?v=20261103-leukonia-4';
import { createArtDialogs } from './art-dialogs.mjs?v=20261103-leukonia-4';
import { mountHousePlacement } from './house-placement.mjs?v=20261103-leukonia-4';

const root = document.querySelector('[data-leukonia-workbench]');
const castes = SOCIAL_CASTES.map(caste => {
  const artwork = ARTWORKS.find(item => item.kind === 'caste' && item.id === caste.id);
  return { ...caste, image: artwork?.image || null, fullsize: artwork?.fullsize || artwork?.original, ready: Boolean(artwork?.image && artwork.ready !== false) };
});
root.innerHTML = renderLeukoniaPage({ context: REALM_CONTEXT, castes, artworks: ARTWORKS, houses: HOUSES, warriors: WARRIORS, prototypes: CLASS_PROTOTYPES, archonates: ARCHONATES, settlements: SETTLEMENTS, variants: MAP_VARIANTS });

let noticeTimer, placements;
function notice(message) {
  const box = root.querySelector('[data-role="status"]');
  box.textContent = message;
  box.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { box.hidden = true; }, 6500);
}
const dialogs = createArtDialogs({ dialog: root.querySelector('#art-dialog'), artworks: ARTWORKS, castes, houses: HOUSES, warriors: WARRIORS, prototypes: CLASS_PROTOTYPES, settlements: SETTLEMENTS,
  getPlacements: () => placements?.current() || {}, onChoose: id => placements.choose(id) });
placements = mountHousePlacement({ root, onHouse: id => dialogs.showHouse(id), notice }, { houses: HOUSES, settlements: SETTLEMENTS, archonates: ARCHONATES, variants: MAP_VARIANTS });

root.addEventListener('click', event => {
  if (event.target.closest('[data-role="placement-root"]')) return;
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  if (button.dataset.action === 'show-art') dialogs.show(button.dataset.artKind, button.dataset.artId);
  if (button.dataset.action === 'print') window.print();
});
