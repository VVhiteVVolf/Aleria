import { createCountryPlacement } from '../shared/country-placement.mjs';
import { escapeHtml } from '../shared/country-workbench/render.mjs';
import { renderHouseCard, createSeatRenderer, rankLabel } from '../Leukonia/house-placement-render.mjs';
import { createHousePlacementState } from './placement-state.mjs';
import { createMapProposal } from './map-data.mjs';
import { createMapVariantControls } from './map-view.mjs';

export const PLACEMENT_STORAGE_KEY = 'aleria:proposal:calidaria:placements:v1';

export function mountHousePlacement({ root, onHouse, notice }, { houses, settlements, regions, variants }) {
  const scope = root.querySelector('[data-role="placement-root"]');
  let placement;
  const mapVariants = createMapVariantControls(scope, variants, () => placement.refresh());
  placement = createCountryPlacement({ root: scope, onHouse, notice }, {
    houses, settlements, createPlacementState: () => createHousePlacementState({ houses, settlements }),
    createMapProposal: placements => createMapProposal({ houses, placements, variant: mapVariants.current() }),
    escapeHtml, houseCard: renderHouseCard, renderSeats: createSeatRenderer({ houses, settlements, archonates: regions }), rankLabel,
    storageKey: PLACEMENT_STORAGE_KEY, exportName: 'calidaria-sitzentwurf.json',
    resetMessage: 'Die Ausgangszuordnung ist wiederhergestellt: Mede in der Hauptstadt, die 28 neuen Wappen ohne Sitz.',
    caption: proposal => {
      const count = proposal.clans.filter(house => house.seat !== null).length;
      return `${count} ${count === 1 ? 'zugeordnetes Wappen' : 'zugeordnete Wappen'} auf der Karte · ${settlements.length} Orte · ${proposal.short}.`;
    },
  });
  const labels = new Map(houses.map(house => [house.id, house.name]));
  for (const option of scope.querySelector('[data-role="house-select"]').options) {
    if (labels.has(option.value)) option.textContent = labels.get(option.value);
  }
  scope.addEventListener('click', event => {
    const button = event.target.closest('button[data-action="show-house"]');
    if (button) onHouse(button.dataset.house);
  });
  return placement;
}
