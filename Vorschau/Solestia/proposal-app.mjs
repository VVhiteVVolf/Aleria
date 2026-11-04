import { REALM_CONTEXT } from './realm-context.mjs';
import { HOUSES } from './house-data.mjs';
import { ARTWORKS } from './art-data.mjs';
import { ESTATES,ESTATE_CONTEXT } from './estate-data.mjs';
import { CLASS_PROTOTYPES,WARRIORS } from './warrior-data.mjs';
import { MAP_VARIANTS,REGIONS,SETTLEMENTS } from './map-data.mjs';
import { renderSolestiaPage } from './proposal-render.mjs';
import { createArtDialogs } from './art-dialogs.mjs';
import { mountHousePlacement } from './house-placement.mjs';

const root = document.querySelector('[data-solestia-workbench]');
root.innerHTML = renderSolestiaPage({ context:REALM_CONTEXT,houses:HOUSES,warriors:WARRIORS,
  prototypes:CLASS_PROTOTYPES,artworks:ARTWORKS,estates:ESTATES,estateContext:ESTATE_CONTEXT,
  regions:REGIONS,settlements:SETTLEMENTS,variants:MAP_VARIANTS });

let noticeTimer,placement;
function notice(message) {
  const box = root.querySelector('[data-role="status"]');
  box.textContent = message; box.hidden = false;
  clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { box.hidden = true; },6500);
}
const dialogs = createArtDialogs({ dialog:root.querySelector('#art-dialog'),houses:HOUSES,
  warriors:WARRIORS,prototypes:CLASS_PROTOTYPES,artworks:ARTWORKS,estates:ESTATES,settlements:SETTLEMENTS,
  getPlacements:() => placement?.current() || {},onChoose:id => placement.choose(id) });
placement = mountHousePlacement({ root,onHouse:id => dialogs.showHouse(id),notice },
  { houses:HOUSES,settlements:SETTLEMENTS,regions:REGIONS,variants:MAP_VARIANTS });

root.addEventListener('click',event => {
  if (event.target.closest('[data-role="placement-root"]')) return;
  const button = event.target.closest('button[data-action]');
  if (button?.dataset.action === 'show-art') dialogs.show(button.dataset.artKind,button.dataset.artId);
  if (button?.dataset.action === 'print') window.print();
});
