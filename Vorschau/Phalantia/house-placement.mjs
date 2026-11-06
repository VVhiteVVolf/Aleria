import { createCountryPlacement } from '../shared/country-placement.mjs';
import { escapeHtml } from '../shared/country-workbench/render.mjs';
import { renderHouseCard,createSeatRenderer,rankLabel } from '../Leukonia/house-placement-render.mjs';
import { createHousePlacementState,PLACEMENT_STORAGE_KEY } from './placement-state.mjs';
import { createMapProposal } from './map-data.mjs';

export function mountHousePlacement({root,onHouse,notice},{houses,settlements,regions}) {
  const scope = root.querySelector('[data-role="placement-root"]');
  const mapDialog = scope.querySelector('#map-dialog');
  const placement = createCountryPlacement({root:scope,onHouse,notice},{
    houses,settlements,createPlacementState:() => createHousePlacementState({houses,settlements}),
    createMapProposal:placements => createMapProposal({houses,placements}),escapeHtml,
    houseCard:renderHouseCard,renderSeats:createSeatRenderer({houses,settlements,archonates:regions}),rankLabel,
    getSelectionFocusTarget:() => mapDialog.open ? mapDialog.querySelector('.map-viewport') : null,
    storageKey:PLACEMENT_STORAGE_KEY,exportName:'phalantia-sitzentwurf.json',rootClanLabel:'Gemeinsame Krone Phalantias',
    resetMessage:'Die beiden Königshäuser wohnen wieder in Lysandreia; jede der sieben Periökenstädte besitzt ihr vorgeschlagenes Haus.',
    caption:proposal => `${proposal.clans.filter(house => house.seat).length} zugeordnete Wappen · 8 Städte · Keine neuen Grenzlinien. Orthevia ist ein äußerer Nachbarort und gehört nicht zu Phalantia.`,
  });
  scope.addEventListener('click',event => {
    const button = event.target.closest('button[data-action="show-house"]');
    if (button) onHouse(button.dataset.house);
  });
  return placement;
}
