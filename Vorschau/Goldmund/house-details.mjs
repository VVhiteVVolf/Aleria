import {settlements,regions,rankLabels} from './realm-data.mjs?v=20261026-9';
import {escapeHtml} from './proposal-render.mjs?v=20261026-9';
import {warriors} from './warrior-data.mjs?v=20261026-9';
import {renderHouseDossier} from '../shared/house-detail-render.mjs?v=20261026-1';

export function renderHouseDetails(house,placements,design) {
 const warrior=warriors.find(item=>item.id===house.id);
 const seat=settlements.find(item=>item.id===placements[house.id]);
 const region=seat?regions.find(item=>item.id===seat.region):null;
 return renderHouseDossier({
  title:`${house.clan?'Clan':'Haus'} ${house.name}`,source:house.source,warrior,
  classHref:`../../Klassenordner/Klassenseite.html#klasse-goldmund-${warrior.classId}`,
  crest:{image:`assets/${house.crest}`,fullsize:house.fullsize},description:house.description,
  facts:[
   {label:'Rolle im Entwurf',value:rankLabels[house.rank]},
   {label:'Sitz im Entwurf',value:seat?`${seat.name} · ${design.regionNames[region.id]}`:'Noch offen'},
   {label:'Zuordnung',value:house.sourceSeat?'Thronholt ist durch deine Vorgabe fest gesetzt.':'Freie Hauszuordnung; eine Platzierung legt keinen zusätzlichen Rang fest.'}
  ],houseId:house.id,canPlace:!house.sourceSeat,originalLink:house.original&&!house.revised?house.original:null
 },escapeHtml);
}
