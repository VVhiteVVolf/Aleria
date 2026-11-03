import { createCountryPlacement } from '../shared/country-placement.mjs?v=20261103-placement-2';
import { escapeHtml } from '../shared/country-workbench/render.mjs';
import { createHousePlacementState } from './placement-state.mjs?v=20261103-leukonia-4';
import { createMapProposal } from './map-data.mjs?v=20261103-leukonia-4';
import { createMapVariantControls } from './map-view.mjs?v=20261103-leukonia-4';
import { renderHouseCard, createSeatRenderer, rankLabel } from './house-placement-render.mjs?v=20261103-leukonia-4';

export const PLACEMENT_STORAGE_KEY = 'aleria:proposal:leukonia:placements:v1';

export function mountHousePlacement({ root, onHouse, notice }, { houses, settlements, archonates, variants }) {
  const scope = root.querySelector('[data-role="placement-root"]');
  let placements;
  const mapVariants = createMapVariantControls(scope, variants, () => placements.refresh());
  placements = createCountryPlacement({ root: scope, onHouse, notice }, {
    houses, settlements,
    createPlacementState: () => createHousePlacementState({ houses, settlements }),
    createMapProposal: current => createMapProposal({ houses, placements: current, variant: mapVariants.current() }),
    escapeHtml, houseCard: renderHouseCard,
    renderSeats: createSeatRenderer({ houses, settlements, archonates }), rankLabel,
    storageKey: PLACEMENT_STORAGE_KEY, exportName: 'leukonia-sitzentwurf.json',
    resetMessage: 'Die vorgegebene Ausgangsverteilung ist wiederhergestellt.',
    caption: proposal => `${proposal.clans.filter(house => house.seat !== null).length} von ${houses.length} Häusern zugeordnet · ${settlements.length} Orte · ${proposal.short}.`,
  });
  // These country labels already include "Haus" or an explicit unnamed draft label.
  const houseLabels = new Map(houses.map(house => [house.id, house.name]));
  for (const option of scope.querySelector('[data-role="house-select"]').options) {
    if (houseLabels.has(option.value)) option.textContent = houseLabels.get(option.value);
  }
  scope.addEventListener('click', event => {
    const button = event.target.closest('button[data-action="show-house"]');
    if (button) onHouse(button.dataset.house);
  });
  return placements;
}
