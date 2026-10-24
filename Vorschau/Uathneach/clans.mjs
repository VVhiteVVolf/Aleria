import {clanDesigns} from './clan-designs.mjs';
import {clanPlacements} from './clan-placements.mjs';

// Vorgaben des Nutzers; Clan-IDs und Wappendateien bleiben bei Namensänderungen stabil.
export const clans = [
 {id:'laga',name:'Mac Ard’Lága',rank:'Ard Tiarna',liege:null,seat:'dunnean',crest:'laimhe-clan.png'},
 {id:'gealan',name:'An Gealân',rank:'Mor Tiarna',liege:'laga',seat:'moineal',crest:'sruthan-clan.png'},
 {id:'conchobhair',name:'Ard Conchobhair',rank:'Mor Tiarna',liege:'laga',seat:'cathair',crest:'gcoillte-clan.png'},
 {id:'roich',name:'Mac Roich',rank:'Mor Tiarna',liege:'laga',seat:'orglen',crest:'taoide-clan.png'},
 {id:'midgna',name:'Mac Midgna',rank:'Mor Tiarna',liege:'laga',seat:'rinnmara',crest:'dtorc-clan.png'},
 {id:'mata',name:'Tir an Máta',rank:'Mor Tiarna',liege:'laga',seat:'temair',crest:'conaire-clan.png'},
 {id:'luga',name:'Ua’Luga',rank:'Mor Tiarna',liege:'laga',seat:'kharanor',crest:'cloiche-clan.png'},
 {id:'fastaigh',name:'Dál Fastaigh',rank:'Dún Tiarna',liege:'laga',seat:'bronnan',crest:'fastaigh-clan.png'},
 {id:'lasgair',name:'Ua Lasgair',rank:'Dún Tiarna',liege:'luga',seat:'mhorcha',crest:'lasgair-clan.png'},
 {id:'suilgeach',name:'Na Suilgeach',rank:'Dún Tiarna',liege:'mata',seat:'caorthann',crest:'suilgeach-clan.png'},
 {id:'luachra',name:'Nic Luachra',rank:'Dún Tiarna',liege:'gealan',seat:'treabhair',crest:'luachra-clan.png'},
 {id:'clannmhar',name:'Tir an Clannmhar',rank:'Dún Tiarna',liege:'luga',seat:'rioghain',crest:'clannmhar-clan.png'},
 {id:'briccne',name:'Na Briccne',rank:'Laird',liege:'laga',seat:'dunnean',crest:'briccne-clan.png'},
 {id:'arbhair',name:'Dâl Arbhair',rank:'Laird',liege:'laga',seat:'dunnean',crest:'arbhair-clan.png',alias:'Dal Arbhair'},
 {id:'scathain',name:'An Scatháin',rank:'Laird',liege:'laga',seat:'dunnean',crest:'scathain-clan.png',alias:'An Scathain'},
 {id:'muirin',name:'Ua Muirin',rank:'Laird',liege:'laga',seat:'reithe',crest:'muirin-clan.png'},
 {id:'cairbre',name:'Ua Cairbre',rank:'Laird',liege:'roich',seat:'orglen',crest:'cairbre-clan.png',alias:'Ua Caibre'},
 {id:'reannachain',name:'Ua Reannachain',rank:'Laird',liege:'roich',seat:'orglen',crest:'reannachain-clan.png',alias:'Ua Reannchain'},
 {id:'cairge',name:'Ua Cairge',rank:'Laird',liege:'roich',seat:'mhor',crest:'cairge-clan.png'},
 {id:'cuilen',name:'Ua Cuilen',rank:'Laird',liege:'midgna',seat:'rinnmara',crest:'cuilen-clan.png'},
 {id:'cadhla',name:'An Cadhla',rank:'Laird',liege:'midgna',seat:'cuan',crest:'cadhla-clan.png'},
 {id:'marcaigh',name:'Ruin Marcaigh',rank:'Laird',liege:'luga',seat:'kharanor',crest:'marcaigh-clan.png'},
 {id:'giolla',name:'Ruin Giolla',rank:'Laird',liege:'luga',seat:'kharanor',crest:'giolla-clan.png'},
 ...clanPlacements.map(placement=>{
  const design=clanDesigns.find(item=>item.id===placement.id);
  return {...placement,name:design.name,crest:design.crest.replace(/^assets\//,'')};
 }),
];

// Bildkoordinaten in Prozent. Ausschließlich Darstellungsanker der Vorschau.
export const settlements = [
 {id:'dunnean',name:'Dunnean',point:[45.4,6.4],pin:[56.5,8],region:'laimhe'},
 {id:'fethlinn',name:'Féthlinn',point:[32.3,18],pin:[26.6,15.5],region:'laimhe'},
 {id:'bronnan',name:'Bronnan',point:[37.5,35.3],pin:[37.5,30],region:'laimhe'},
 {id:'reithe',name:'Broch an Reithe',point:[19.6,33],pin:[23,28],region:'taoide'},
 {id:'moineal',name:'Moineal',point:[46.5,47],pin:[44,41],region:'sruthan'},
 {id:'treabhair',name:'Treabhair',point:[55.8,29.4],pin:[61.5,24],region:'sruthan'},
 {id:'cathair',name:'Cathair',point:[71.6,43.9],pin:[76,39],region:'gcoillte'},
 {id:'dathuil',name:'Dathuil',point:[82,31.8],pin:[77.3,28.5],region:'gcoillte'},
 {id:'orglen',name:'Orglen',point:[4.8,58],pin:[13,54],region:'taoide'},
 {id:'mhor',name:'Broch an Mhor',point:[23.8,64],label:[23.8,65],pin:[26,59],region:'taoide'},
 {id:'rinnmara',name:'Rinnmara',point:[33.9,75.2],pin:[29,71],region:'dtorc'},
 {id:'cuan',name:'Broch an Cuan',point:[40,87.4],pin:[33.5,85],region:'dtorc'},
 {id:'temair',name:'Temair',point:[93.5,11.7],pin:[88,7],region:'conaire'},
 {id:'caorthann',name:'Caorthann',point:[69.4,14],pin:[71,9],region:'conaire'},
 {id:'ceithirn',name:'Ceithirn',point:[91.4,23],pin:[87,21],region:'conaire'},
 {id:'kharanor',name:'Kharanor',point:[54.3,91.8],pin:[62.5,86],region:'cloiche'},
 {id:'mhorcha',name:'Mhorcha',point:[63.5,58.4],pin:[69,55],region:'cloiche'},
 {id:'rioghain',name:'Rioghain',point:[51.7,67.8],pin:[57.5,65],region:'cloiche'},
];
