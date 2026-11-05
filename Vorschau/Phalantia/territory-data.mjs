/** Measured icon centres on the supplied 1281 × 925 map; no territorial borders inferred. */
const imageSize = [1281,925];
const percent = point => point.map((value,index) => Number((value / imageSize[index] * 100).toFixed(4)));

export const MAP_VARIANTS = Object.freeze([Object.freeze({
  id:'landscape', number:1, short:'Gelieferte Karte', file:'Phalantia.png',
  map:'assets/maps/phalantia.webp', imageSize, bakedNames:true,
})]);

const places = [
  ['lysandreia','Lysandreia',[522,477],[55.0,52.7],'Gemeinsame Hauptstadt',
    'Die Hauptstadt liegt am südlichen Fuß des mittleren Bergmassivs. Beide Königshäuser wohnen hier in getrennten Palästen.',true],
  ['milinthos','Milinthos',[448,99],[43.9,11.8],'Periökenstadt',
    'Die nördliche Stadt liegt unterhalb des Gebirgskamms über einem Flusstal.'],
  ['syrakleia','Syrakleia',[755,175],[66.5,29.5],'Periökenstadt',
    'Die nordöstliche Stadt liegt zwischen bewaldetem Binnenland und den östlichen Bergen.'],
  ['knossira','Knossira',[430,239],[34.0,39.0],'Periökenstadt',
    'Knossira liegt am inneren Wasserlauf westlich des kleinen Sees; die Karte zeigt eine Mühle beim Ort.'],
  ['lakonis','Lakonis',[145,325],[10.8,45.8],'Periökenstadt',
    'Die westliche Stadt liegt am Fluss unweit der westlichen Küste und der Gebirgsausläufer.'],
  ['pergeira','Pergeira',[1008,413],[84.3,55.5],'Periökenstadt',
    'Pergeira liegt an der östlichen Flussmündung zwischen Küste und bewaldetem Hinterland.'],
  ['krypteia','Krypteia',[1173,639],[87.5,84.6],'Periökenstadt',
    'Die südöstliche Stadt besitzt einen auf der Karte hervorgehobenen befestigten Sitz über dem Meer.'],
  ['thalassos','Thalassos',[324,791],[36.0,87.0],'Periökenstadt',
    'Die südliche Küstenstadt liegt auf einer breiten Landzunge westlich der großen Bucht.'],
];

export const SETTLEMENTS = Object.freeze(places.map(([id,name,pixel,pin,kindLabel,description,capital=false]) => Object.freeze({
  id,name,mapName:name,point:percent(pixel),pin,sourcePixelCentre:pixel,kindLabel,description,
  capital,regionId:capital?'crown-domain':`seat-${id}`,overlayLabel:false,
})));

export const REGIONS = Object.freeze(SETTLEMENTS.map(city => Object.freeze({
  id:city.regionId, name:city.capital?'Gemeinsame Krondomäne':`Herrschaft ${city.name}`,
  kindLabel:city.kindLabel,capitalId:city.id,cityIds:[city.id],capital:city.capital,
  description:city.description, boundaryStatus:'Nicht eingezeichnet; Sitzraum ohne erfundene Grenzlinie',
})));

export const MAP_CONTEXT = Object.freeze({
  sourceImageSize:imageSize, measuredIcons:8, bordersDrawn:false,
  outsidePlaces:[{name:'Alantaic',reason:'Der angeschnittene Ort gehört laut Nutzer nicht zu Phalantia.'}],
  note:'Die acht Städte sind die sichtbaren Hauptsitze. Tausende kleine Siedlungen sind damit nicht vollständig kartiert. Alantaic bleibt als auswärtiger Karteninhalt erhalten und ist kein Zuordnungsziel.'
});
