import { REALM_CONTEXT } from './realm-context.mjs';
import { HOUSES } from './house-data.mjs';
import { ARTWORKS } from './art-data.mjs';
import { ESTATES,ESTATE_CONTEXT } from './estate-data.mjs';
import { CLASS_PROTOTYPES,HOUSE_WARRIORS } from './warrior-data.mjs';
import { REGION_SHIELDS } from './region-shield-data.mjs';
import { REGIONS,SETTLEMENTS } from './territory-data.mjs';
import { renderPhalantiaPage } from './proposal-render.mjs';
import { createArtDialogs } from './art-dialogs.mjs';
import { mountHousePlacement } from './house-placement.mjs';

const root = document.querySelector('[data-phalantia-workbench]');
root.innerHTML = renderPhalantiaPage({context:REALM_CONTEXT,houses:HOUSES,
  prototypes:CLASS_PROTOTYPES,artworks:ARTWORKS,estates:ESTATES,estateContext:ESTATE_CONTEXT,
  regions:REGIONS,settlements:SETTLEMENTS,warriors:HOUSE_WARRIORS,regionShields:REGION_SHIELDS});

let noticeTimer,placement;
function notice(message) {
  const box = root.querySelector('[data-role="status"]');
  box.textContent = message;
  box.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { box.hidden = true; },6500);
}
const dialogs = createArtDialogs({dialog:root.querySelector('#art-dialog'),houses:HOUSES,
  prototypes:CLASS_PROTOTYPES,warriors:HOUSE_WARRIORS,regionShields:REGION_SHIELDS,
  artworks:ARTWORKS,estates:ESTATES,settlements:SETTLEMENTS,
  getPlacements:() => placement?.current() || {},onChoose:id => placement.choose(id)});
placement = mountHousePlacement({root,onHouse:id => dialogs.showHouse(id),notice},
  {houses:HOUSES,settlements:SETTLEMENTS,regions:REGIONS});

root.addEventListener('click',event => {
  if (event.target.closest('[data-role="placement-root"]')) return;
  const button = event.target.closest('button[data-action]');
  if (button?.dataset.action === 'show-art') dialogs.show(button.dataset.artKind,button.dataset.artId);
  if (button?.dataset.action === 'print') window.print();
});
