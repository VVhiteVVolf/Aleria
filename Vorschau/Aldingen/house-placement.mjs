import {houses} from './house-data.mjs?v=20261026-1';
import {settlements} from './territory-data.mjs?v=20261026-1';
import {createPlacementState,createMapProposal} from './placement-state.mjs?v=20261026-1';
import {escapeHtml,houseCard,renderSeats,rankLabel} from './proposal-render.mjs?v=20261026-1';
import {createCountryPlacement} from '../shared/country-placement.mjs';
export function createHousePlacement(options){
 return createCountryPlacement(options,{houses,settlements,createPlacementState,createMapProposal,escapeHtml,houseCard,renderSeats,rankLabel,
 storageKey:'aleria:proposal:aldingen:placements:v1',exportName:'aldingen-entwurf.json',
 resetMessage:'Die vier Ausgangszuordnungen sind wiederhergestellt. Alle anderen Sitze sind offen.',
 caption:proposal=>`${proposal.clans.filter(h=>h.seat!==null).length} zugeordnete Familien · 11 Orte · Rote Grenzen und Farben bleiben wie auf deiner Karte.`});
}
