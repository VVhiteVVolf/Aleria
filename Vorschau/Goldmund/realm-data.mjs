import {sourceHouses} from './source-houses.mjs?v=20261026-6';

export const houses = sourceHouses;
export const rankLabels = Object.freeze({prince:'Fürstenfamilie','knight-prince':'Ritterfürstenfamilie',laird:'Laird-Clan',open:'Rang noch offen'});
export const collectiveName = 'Die Goldenen Grafschaften';

export const counties = Object.freeze([
 {id:'kronenau',name:'Kronenau',kind:'Fürstliche Grafschaft',colour:'#b49a3e',description:'Der westliche, goldgelb markierte Teil der Karte mit Thronholt und Brakenstein. Kronenau stellt die Nähe zur fürstlichen Residenz in den Mittelpunkt.'},
 {id:'aurelmark',name:'Aurelmark',kind:'Grafschaft',colour:'#6e8c45',description:'Der nordöstliche, grün markierte Teil mit Bregen, Haarlen und Aldermoor. Aurelmark greift den goldmundischen Klang und das Motiv der Aurelianerpferde auf.'},
 {id:'edelstrom',name:'Edelstrom',kind:'Grafschaft',colour:'#4b8b88',description:'Der südöstliche, türkis markierte Teil mit Bramsen, Niedenfels und Hartenstein. Edelstrom verbindet die sichtbaren Wasserläufe mit der vornehmen Bildsprache des Landes.'}
]);

export const regions = Object.freeze([
 {id:'thronmark',name:'Thronmark',county:'kronenau',seat:'thronholt',kind:'Fürstliche Baronie',idea:'Die fürstliche Residenz bildet den Bezugspunkt des Namens.'},
 {id:'brakenwacht',name:'Brakenwacht',county:'kronenau',seat:'brakenstein',kind:'Baronie',idea:'Ein Name mit dem Klang eines befestigten, standhaften Herrschaftsgebiets.'},
 {id:'bregenau',name:'Bregenau',county:'aurelmark',seat:'bregen',kind:'Baronie',idea:'An den vorhandenen Ortsnamen angelehnt; ein weicher Landschaftsname.'},
 {id:'haarlenried',name:'Haarlenried',county:'aurelmark',seat:'haarlen',kind:'Baronie',idea:'Ein regionaler Name mit Bezug zum bereits benannten Haarlen.'},
 {id:'alderweiden',name:'Alderweiden',county:'aurelmark',seat:'aldermoor',kind:'Ritterfürstentum',idea:'Eine vorläufige Landschaftsbezeichnung rund um Aldermoor.'},
 {id:'bramsenquell',name:'Bramsenquell',county:'edelstrom',seat:'bramsen',kind:'Baronie',idea:'Die Wasserlandschaft der Karte prägt diesen Namensvorschlag.'},
 {id:'niedenmark',name:'Niedenmark',county:'edelstrom',seat:'niedenfels',kind:'Baronie',idea:'Ein knapper Herrschaftsname, abgeleitet von Niedenfels.'},
 {id:'hartenfels',name:'Hartenfels',county:'edelstrom',seat:'hartenstein',kind:'Ritterfürstentum',idea:'Ein ritterlicher Name mit Bezug auf den felsigen Sitz Hartenstein.'}
]);

export const settlements = Object.freeze([
 {id:'thronholt',name:'Thronholt',county:'kronenau',region:'thronmark',kind:'Fürstliche Residenz',point:[26.5,25],pin:[31.5,21]},
 {id:'brakenstein',name:'Brakenstein',county:'kronenau',region:'brakenwacht',kind:'Baroniesitz',point:[20,46.3],pin:[14.5,51]},
 {id:'bregen',name:'Bregen',county:'aurelmark',region:'bregenau',kind:'Baroniesitz',point:[59.5,9.2],pin:[64,7]},
 {id:'haarlen',name:'Haarlen',county:'aurelmark',region:'haarlenried',kind:'Baroniesitz',point:[70.1,19.4],pin:[74.5,24]},
 {id:'aldermoor',name:'Aldermoor',county:'aurelmark',region:'alderweiden',kind:'Ritterfürstensitz',point:[46.6,26.5],pin:[41.5,30.5]},
 {id:'bramsen',name:'Bramsen',county:'edelstrom',region:'bramsenquell',kind:'Baroniesitz',point:[48.2,53.8],pin:[44,58.5]},
 {id:'niedenfels',name:'Niedenfels',county:'edelstrom',region:'niedenmark',kind:'Baroniesitz',point:[75.1,36.3],pin:[82,35]},
 {id:'hartenstein',name:'Hartenstein',county:'edelstrom',region:'hartenfels',kind:'Ritterfürstensitz',point:[79.8,53.3],pin:[86,58]}
]);

export const realmDesigns = Object.freeze([
 {id:'sonnenkrone',name:'Die Sonnenkrone',motif:'Goldene Sonne auf Bordeaux',description:'Fürstliche Würde und Strahlkraft in warmem Gold auf tiefem Bordeauxrot.'},
 {id:'doppeladler',name:'Schwarzer Doppeladler',motif:'Schwarzer Adler · Silberkrone · Bronzerahmen',description:'Ein schwarzer imperialer Doppeladler auf Elfenbein. Ein betont imperiales Zeichen für den Anspruch, das kaiserliche Erbe zu bewahren.'},
 {id:'aurelianerkrone',name:'Die Aurelianerkrone',motif:'Goldene Pferde · Dunkelgrün · Silberrahmen',description:'Goldene Aurelianerpferde auf dunklem Grün, in Silber gefasst. Edle Pferde und fürstliche Repräsentation als eigenes Zeichen.'},
 {id:'goldkelch',name:'Prunkkelch',motif:'Silberner Kelch · Purpur · Bronzerahmen',description:'Ein silberner Prunkkelch auf dunklem Purpur, in Bronze gefasst. Eine höfische Interpretation von Wohlstand und edlen Gütern.'}
].map(design=>({...design,fullsize:`assets/production/${design.id}.png`})));

export function createMapProposal(placements) {
 return {number:1,short:'Goldmund',file:'Goldmund · Vorläufige Hauszuordnung',map:'assets/map.webp',imageSize:[4096,2659],bakedNames:true,settlements,
  clans:houses.map(house=>({...house,seat:placements[house.id],liege:null}))};
}
