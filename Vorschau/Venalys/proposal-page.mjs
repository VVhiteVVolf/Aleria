import { houses } from './house-data.mjs';
import { context } from './realm-context.mjs';
import { warriors } from './warrior-data.mjs';
import { ESTATES,ESTATE_CONTEXT } from './estate-data.mjs';
import { districts, pointsOfInterest, mapGeometry } from './territory-data.mjs';
import { renderVenalysPage } from './page-render.mjs';
import { mountAssignmentControls } from './assignment-controls.mjs';
import { createVenalysHouseDialogs } from './house-dialogs.mjs';

const root = document.querySelector('[data-country-workbench]');
root.innerHTML = renderVenalysPage({ context, houses, warriors, districts, pointsOfInterest, estates:ESTATES, estateContext:ESTATE_CONTEXT });
const assignments = mountAssignmentControls({ root, houses, districts, pointsOfInterest, mapGeometry });
const dialogs = createVenalysHouseDialogs({ dialog: root.querySelector('#art-dialog'), houses, warriors, estates:ESTATES,
  targets: [...districts, ...pointsOfInterest], getDraft: assignments.current, onChoose: assignments.choose });
root.addEventListener('click', event => {
  const button = event.target.closest('button[data-action="show-house"]');
  if (button) dialogs.showHouse(button.dataset.house);
  const art = event.target.closest('button[data-action="show-art"][data-art-kind="estate"]');
  if (art) dialogs.showEstate(art.dataset.artId);
});
