/** Icon centres measured on the supplied 731 × 917 map. No political borders inferred. */
const imageSize=[731,917];
const percent=point=>point.map((value,index)=>Number((value/imageSize[index]*100).toFixed(4)));
export const MAP_VARIANTS=Object.freeze([{id:'landscape',number:1,short:'Gelieferte Karte',file:'Kemetara.png',map:'assets/maps/kemetara.webp',imageSize,bakedNames:true}]);
const places=[
 ['saqqarekhet','Saqqarekhet',[611,350],[85.5,33.0],'Hervorgehobener Sitz an der östlichen Küste zwischen bewaldetem Land und Gebirgsausläufern.',true],
 ['hierakhet','Hierakhet',[328,78],[38.0,7.5],'Die nördliche Küstenstadt liegt westlich eines kleinen Gebirgszuges.'],
 ['tanubis','Tanubis',[556,33],[69.0,3.5],'Die Stadt liegt an der nördlichen Küste nahe dem oberen Flusslauf.'],
 ['amara','Amara',[345,184],[41.0,17.8],'Amara liegt südlich des nördlichen Felsmassivs am westlichen Binnenfluss.'],
 ['akhmi','Akhmi',[540,242],[77.3,23.3],'Akhmi liegt zwischen dem großen östlichen Gebirgsbogen und dem grüneren Küstenland.'],
 ['pithomir','Pithomir',[527,429],[78.4,47.5],'Der östliche Küstensitz liegt südlich von Saqqarekhet bei bewaldeten Hügeln.'],
 ['karnomet','Karnomet',[62,447],[12.3,44.8],'Karnomet besetzt die westliche Landzunge zwischen Meer und licht bewachsenem Hinterland.'],
 ['komarnis','Komarnis',[183,563],[19.5,58.5],'Die Stadt liegt an der südwestlichen Küste westlich des inneren Flussraums.'],
 ['herak','Herak',[338,550],[51.2,59.0],'Herak liegt im westlichen Binnenland südlich eines kleinen Felsmassivs.'],
 ['ramet','Ramet',[413,637],[61.7,72.1],'Ramet liegt am mittleren Flussnetz unterhalb eines kleinen Berges.'],
 ['taniset','Taniset',[650,591],[83.3,68.8],'Der östliche Sitz liegt nahe der Flussmündung und dem langen Küstengebirge.'],
 ['abyra','Abyra',[280,772],[31.8,85.7],'Abyra liegt an der südwestlichen Küste beim unteren Fluss und Palmenland.'],
 ['menderamun','Mendaramun',[470,768],[68.5,85.2],'Die südliche Stadt liegt unter einem kleinen Gebirgszug zwischen Baumgruppen und Küstenebenen.']
];
export const SETTLEMENTS=Object.freeze(places.map(([id,name,pixel,pin,description,capital=false])=>Object.freeze({
 id,name,mapName:name,point:percent(pixel),pin,sourcePixelCentre:pixel,description,capital,
 kindLabel:capital?'Hauptstadtvorschlag':'Stadtsitz',regionId:'seat-'+id,overlayLabel:false
})));
export const REGIONS=Object.freeze(SETTLEMENTS.map(city=>Object.freeze({
 id:city.regionId,name:city.capital?'Krondomäne Saqqarekhet':'Herrschaft '+city.name,
 kindLabel:city.capital?'Nesut · Hauptstadtvorschlag':'Tjaty · Stadtherrschaft',
 capitalId:city.id,cityIds:[city.id],capital:city.capital,description:city.description,
 boundaryStatus:'Sitzraum ohne eingezeichnete politische Grenze'
})));
export const MAP_CONTEXT=Object.freeze({
 sourceImageSize:imageSize,bordersDrawn:false,namedPlaces:13,
 outsidePlaces:['Fayot… · angeschnittener östlicher Ort','Unbenannte angeschnittene Orte am oberen und unteren Rand'],
 note:'Auf Nutzeranweisung werden ausschließlich die dreizehn vollständig benannten Orte verwendet. Saqqarekhet ist aufgrund seiner Kartenhervorhebung der Hauptstadtvorschlag. Die nicht benannten Randorte und der angeschnittene östliche Ort bleiben außerhalb des Sitzentwurfs.'
});
export function createMapProposal({houses,placements,variant=MAP_VARIANTS[0]}){
 return {...variant,settlements:SETTLEMENTS,clans:houses.map(house=>({...house,
 crest:house.crest.startsWith('assets/')?house.crest.slice(7):'../'+house.crest,seat:placements[house.id]}))};
}
