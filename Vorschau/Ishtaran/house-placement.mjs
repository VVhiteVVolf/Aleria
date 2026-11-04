import { createCountryPlacement } from '../shared/country-placement.mjs?v=20261103-placement-2';
import { escapeHtml } from '../shared/country-workbench/render.mjs';
import { HOUSES } from './house-data.mjs';
import { SETTLEMENTS } from './territory-data.mjs';
import { createHousePlacementState } from './placement-state.mjs';
import { createMapProposal } from './map-data.mjs';
import { createMapVariantControls } from './map-view.mjs';
import { renderHouseCard, createSeatRenderer, rankLabel } from './house-placement-render.mjs';
import { PLACEMENT_STORAGE_KEY, prepareStoredPlacements } from './placement-storage.mjs';

export function mountHousePlacement({ root, onHouse, notice }) {
  const scope = root.querySelector('[data-role="placement-root"]');
  const createState = () => createHousePlacementState({ houses: HOUSES, settlements: SETTLEMENTS });
  let compatibility;
  try {
    compatibility = prepareStoredPlacements({ storage: localStorage, createState,
      evacuation: HOUSES.find(house => house.id === 'source-05' && house.displaced) });
  } catch { compatibility = { persistenceBlocked: true, message: 'Die Browser-Speicherung ist nicht verfügbar. Sitzänderungen bleiben in der geöffneten Ansicht und können heruntergeladen werden.' }; }
  const selectableSettlements = SETTLEMENTS.map(city => ({ ...city, placementDisabled: Boolean(city.destroyed), name: city.destroyed ? `${city.name} · zerstört` : city.name }));
  let placements;
  const variants = createMapVariantControls(scope, () => placements.refresh());
  placements = createCountryPlacement({ root: scope, onHouse, notice }, {
    houses: HOUSES, settlements: selectableSettlements,
    createPlacementState: createState,
    createMapProposal: current => createMapProposal(current, variants.current()),
    escapeHtml, houseCard: renderHouseCard, renderSeats: createSeatRenderer({ houses: HOUSES, settlements: SETTLEMENTS }), rankLabel,
    storageKey: compatibility.persistenceBlocked ? null : PLACEMENT_STORAGE_KEY, exportName: 'ishtaran-sitzentwurf.json',
    resetMessage: 'Die bearbeitbare Ausgangsverteilung ist wiederhergestellt. Die Merkliste bleibt erhalten.',
    caption: proposal => `${proposal.clans.filter(house => house.seat !== null).length} von ${HOUSES.length} Häusern zugeordnet · ${SETTLEMENTS.length} Orte, davon ${SETTLEMENTS.filter(city => city.destroyed).length} zerstört · ${proposal.short}.`,
  });
  if (compatibility.message) {
    const message = scope.querySelector('[data-role="placement-recovery"]');
    message.textContent = compatibility.message; message.hidden = false;
    notice(compatibility.message);
  }
  if (compatibility.raw) {
    const link = scope.querySelector('[data-role="placement-recovery-download"]');
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(compatibility.raw)}`; link.hidden = false;
  }
  scope.addEventListener('click', event => {
    const button = event.target.closest('button[data-action="show-house"]');
    if (button) onHouse(button.dataset.house);
  });
  return placements;
}
