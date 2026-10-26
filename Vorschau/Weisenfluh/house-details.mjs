import {settlements,provinces,rankLabels} from './realm-data.mjs?v=20261026-3';
import {escapeHtml} from './proposal-render.mjs?v=20261026-3';
import {warriors} from './warrior-data.mjs?v=20261026-3';
import {renderHouseDossier} from '../shared/house-detail-render.mjs?v=20261026-1';

export function renderHouseDetails(house,placements) {
 const warrior=warriors.find(item=>item.id===house.id);
 const current=settlements.find(item=>item.id===placements[house.id]);
 const original=settlements.find(item=>item.id===house.sourceSeat);
 const province=provinces.find(item=>item.id===house.province);
 return renderHouseDossier({
  title:house.rank==='order'?house.name:`${house.rank==='laird'?'Clan':'Haus'} ${house.name}`,
  source:house.rank==='laird'?'Albischer Laird':house.rank==='order'?'Geistlicher Ritterorden':'Geliefertes Haus',warrior,
  classHref:`../../Klassenordner/Klassenseite.html#klasse-weisenfluh-${warrior.classId}`,
  crest:{image:`assets/${house.crest}`,fullsize:house.original},description:warrior.motif,
  facts:[
   {label:'Rang',value:rankLabels[house.rank]},
   {label:'Sitz im Entwurf',value:current?.name??'Noch offen'},
   {label:'Ausgangszuordnung',value:original?.name??'Albischer Clan · noch ohne Sitz'},
   {label:'Ursprüngliche Provinz',value:province?.name??(house.rank==='order'?'Verpachtetes Ordensgebiet':'Noch offen')}
  ],houseId:house.id,canPlace:true
 },escapeHtml);
}
