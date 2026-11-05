import {createCountryPlacement} from '../shared/country-placement.mjs';
import {escapeHtml} from '../shared/country-workbench/render.mjs';
import {renderHouseCard,createSeatRenderer,rankLabel} from '../shared/country-workbench/placement-view.mjs';
import {createHousePlacementState,PLACEMENT_STORAGE_KEY} from './placement-state.mjs';
import {createMapProposal} from './territory-data.mjs';
export function mountHousePlacement({root,onHouse,notice},{houses,settlements,regions}){
 const scope=root.querySelector('[data-role="placement-root"]'),dialog=scope.querySelector('#map-dialog');
 const placement=createCountryPlacement({root:scope,onHouse,notice},{
  houses,settlements,createPlacementState:()=>createHousePlacementState({houses,settlements}),
  createMapProposal:placements=>createMapProposal({houses,placements}),escapeHtml,
  houseCard:renderHouseCard,renderSeats:createSeatRenderer({houses,settlements,archonates:regions}),rankLabel,
  getSelectionFocusTarget:()=>dialog.open?dialog.querySelector('.map-viewport'):null,
  storageKey:PLACEMENT_STORAGE_KEY,exportName:'mathringen-sitzentwurf.json',rootClanLabel:'Mathringen · Lehnsherrschaft offen',
  resetMessage:'Die Häuser stehen wieder an ihren vorgeschlagenen Ausgangssitzen.',
  caption:proposal=>proposal.clans.filter(h=>h.seat).length+' zugeordnete Hauswappen · 44 Kartensitze · Namen und Sitze sind Vorschläge.'
 });
 scope.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action="show-house"]');
  if(button)onHouse(button.dataset.house);
 });
 return placement;
}
