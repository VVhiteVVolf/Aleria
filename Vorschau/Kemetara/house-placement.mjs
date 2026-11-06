import {createCountryPlacement} from '../shared/country-placement.mjs';
import {escapeHtml} from '../shared/country-workbench/render.mjs';
import {renderHouseCard,createSeatRenderer,rankLabel} from '../shared/country-workbench/placement-view.mjs';
import {createHousePlacementState,PLACEMENT_STORAGE_KEY} from './placement-state.mjs';
import {createMapProposal} from './territory-data.mjs';
export function mountHousePlacement({root,onHouse,notice},{houses,settlements,regions}){
 const scope=root.querySelector('[data-role="placement-root"]');
 const mapDialog=scope.querySelector('#map-dialog');
 const placement=createCountryPlacement({root:scope,onHouse,notice},{
  houses,settlements,createPlacementState:()=>createHousePlacementState({houses,settlements}),
  createMapProposal:placements=>createMapProposal({houses,placements}),escapeHtml,
  houseCard:renderHouseCard,renderSeats:createSeatRenderer({houses,settlements,archonates:regions}),rankLabel,
  getSelectionFocusTarget:()=>mapDialog.open?mapDialog.querySelector('.map-viewport'):null,
  storageKey:PLACEMENT_STORAGE_KEY,exportName:'kemetara-sitzentwurf.json',rootClanLabel:'Krone Kemetaras',
  resetMessage:'Die dreizehn Familien stehen wieder bei ihren vorgeschlagenen Stadtsitzen.',
  caption:proposal=>proposal.clans.filter(h=>h.seat).length+' zugeordnete Familienwappen · 13 Stadtsitze · Originalkarte ohne neue Grenzlinien.'
 });
 scope.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action="show-house"]');
  if(button)onHouse(button.dataset.house);
 });
 return placement;
}
