import { createCountryPlacement } from '../shared/country-placement.mjs';
import { escapeHtml } from '../shared/country-workbench/render.mjs';
import { renderHouseCard, createSeatRenderer, rankLabel } from '../Leukonia/house-placement-render.mjs';
import { createMapVariantControls } from '../Leukonia/map-view.mjs';
import { createHousePlacementState } from './placement-state.mjs';
import { createMapProposal } from './map-data.mjs';

export const PLACEMENT_STORAGE_KEY = 'aleria:proposal:solestia:placements:v1';

export function mountHousePlacement({ root, onHouse, notice }, { houses, settlements, regions, variants }) {
  const scope = root.querySelector('[data-role="placement-root"]');
  const mapDialog = scope.querySelector('#map-dialog');
  let placement;
  const mapVariants = createMapVariantControls(scope, variants, () => placement.refresh());
  placement = createCountryPlacement({ root:scope, onHouse, notice }, {
    houses, settlements, createPlacementState:() => createHousePlacementState({ houses, settlements }),
    createMapProposal:placements => createMapProposal({ houses, placements, variant:mapVariants.current() }), escapeHtml,
    houseCard:renderHouseCard, renderSeats:createSeatRenderer({ houses, settlements, archonates:regions }), rankLabel,
    getSelectionFocusTarget:() => mapDialog.open ? mapDialog.querySelector('.map-viewport') : null,
    storageKey:PLACEMENT_STORAGE_KEY, exportName:'solestia-sitzentwurf.json',
    resetMessage:'Der Ausgangsvorschlag ist wiederhergestellt: ein Haus je Stadt und zwei zusätzliche Häuser in der Hauptstadt.',
    caption:proposal => `${proposal.clans.filter(house => house.seat).length} zugeordnete Wappen · ${settlements.length} Städte · ${proposal.short}.`,
  });
  const names = new Map(houses.map(house => [house.id, house.name]));
  for (const option of scope.querySelector('[data-role="house-select"]').options) {
    if (names.has(option.value)) option.textContent = names.get(option.value);
  }
  scope.addEventListener('click', event => {
    const button = event.target.closest('button[data-action="show-house"]');
    if (button) onHouse(button.dataset.house);
  });
  return placement;
}
