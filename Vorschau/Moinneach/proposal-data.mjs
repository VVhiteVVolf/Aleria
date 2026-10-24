import {withRegionalDesigns} from './regional-designs.mjs';

// Supplied clan names and seats. Rank and allegiance remain unset.
const suppliedProposal = {
 id:'original',number:1,short:'Erste Gebietsaufteilung',file:'Moinneach',
 map:'assets/map.webp',imageSize:[4096,2840],bakedNames:true,
 settlements:[
  {id:'tarvex',name:'Tarvex',point:[6.8,83.7],pin:[15,79.4],colour:'#6c9f45',
   geography:'Tarvex liegt im südwestlichen Sumpfland. Wasserarme zerschneiden die mangrovenreichen Niederungen; feste Plätze und passierbare Übergänge sind zwischen den versumpften Wäldern selten.'},
  {id:'druanax',name:'Druanax',point:[6.7,48.0],pin:[14.7,44.5],colour:'#67898c',
   geography:'Druanax liegt im westlichen Bruchwald. Zwischen Wasserarmen und kleinen Erhebungen stehen nasse Wurzelgeflechte und pilzreiches Totholz. Nach Osten öffnet sich der Raum zu Gergonax’ Flussniederungen.'},
  {id:'drunemax',name:'Drunemax',point:[42.7,73.3],pin:[38.5,70.0],colour:'#b8ad42',
   geography:'Drunemax liegt an einem südlichen Wasserlauf unterhalb felsiger Höhen. Die höheren Flächen unterbrechen das Sumpfland, während sich an ihrem Fuß schlammige Rinnen und vernässte Wälder sammeln.'},
  {id:'amabactoix',name:'Amabactoix',mapLabel:'Ambactiox',point:[48.4,26.7],pin:[42.9,23.5],colour:'#538b91',
   geography:'Amabactoix liegt westlich des östlichen Gebirgszugs. Mangrovenreiche Wasserläufe und überflutete Wurzelräume verbinden das nördliche Sumpfland mit den mittleren Niederungen.'},
  {id:'vironax',name:'Vironax',point:[41.0,9.9],pin:[47.3,10.3],colour:'#4d9e76',
   geography:'Vironax liegt an einem nördlichen Wasserlauf. Bewaldete Erhebungen ragen aus der nassen Landschaft; dazwischen ziehen sich Mangroven, schwer passierbare Ufer und Sumpfrinnen nach Süden.'},
  {id:'arvonax',name:'Arvonax',point:[62.7,60.9],pin:[58.4,56.3],colour:'#aa7948',
   geography:'Arvonax liegt im südöstlichen Tal zwischen felsigen Höhen. Der eingezeichnete Weg durchquert einen engen Übergangsraum, in dessen Senken Wasser steht und versumpfte Waldstücke die Bewegung erschweren.'},
  {id:'taranux',name:'Taranux',point:[88.4,57.3],pin:[81.9,55.1],colour:'#82a845',
   geography:'Taranux liegt zwischen Wasserlauf und östlichen Bergkämmen. Die bewachsenen Talflächen gehören zum Sumpfland; die umliegenden Höhen bieten nur schmale Übergänge zwischen nassen Senken und Wald.'},
  {id:'senodex',name:'Senodex',point:[84.1,32.8],pin:[89.5,29.7],colour:'#509d8f',
   geography:'Senodex liegt im östlichen Talgebiet über einer sichtbaren Wasserstufe. Unterhalb der Siedlung zieht der Wasserlauf durch sumpfige Mulden; überflutete Ufer und dichter Bewuchs fassen die Verbindung nach Süden ein.'},
  {id:'camulax',name:'Camulax',point:[70.8,21.7],pin:[76.1,18.1],colour:'#8065a2',
   geography:'Camulax liegt im nordöstlichen Tal zwischen bewaldeten und felsigen Höhen. Auch hier bleibt Moinneach ein unwirtliches Sumpfland: Wasserläufe, nasse Mulden und schmale feste Flächen bestimmen den Lebensraum.'},
  {id:'gergonax',name:'Gergonax',point:[30.7,48.4],pin:[36.4,43.2],colour:'#a276a5',
   geography:'Gergonax’ Burganlage liegt im mittleren Geflecht mehrerer Wasserläufe. Mangrovenwurzeln und überschwemmte Niederungen erschweren den Zugang; bewaldete Erhebungen gliedern den Übergang zu den Nachbargebieten.'}
 ],
 clans:[
  {id:'barrex',name:'Barrex',seat:'tarvex',crest:'barrex.png',rank:null,liege:null},
  {id:'cethrenn',name:'Cethrenn',seat:'tarvex',crest:'cethrenn.png',rank:null,liege:null},
  {id:'kerlaouen',name:'Kerlaouen',seat:'druanax',crest:'kerlaouen.png',rank:null,liege:null},
  {id:'damona',name:'Damona',seat:'drunemax',crest:'damona.png',rank:null,liege:null},
  {id:'caddach',name:'Caddach',seat:'amabactoix',crest:'caddach.png',rank:null,liege:null},
  {id:'adruinna',name:'Adruinna',seat:'vironax',crest:'adruinna.png',rank:null,liege:null},
  {id:'avernax',name:'Avernax',seat:'arvonax',crest:'avernax.png',rank:null,liege:null},
  {id:'brigantex',name:'Brigantex',seat:'taranux',crest:'brigantex.png',rank:null,liege:null},
  {id:'keravel',name:'Keravel',seat:'senodex',crest:'keravel.png',rank:null,liege:null},
  {id:'nemetex',name:'Nemetex',seat:'camulax',crest:'nemetex.png',rank:null,liege:null},
  {id:'rowak',name:'Rowak',seat:'gergonax',crest:'rowak.png',rank:null,liege:null}
 ],
 notes:{}
};

const region = (id, label, colour, seats) => ({id, label, colour, seats});

export const sourceProposals = [
 {...suppliedProposal, label:'Ursprüngliche Aufteilung',
  summary:'Zehn einzelne Gebiete rund um die zehn Städte.',
  regions:suppliedProposal.settlements.map(place=>region(place.id,place.name,place.colour,[place.id]))},
 {...suppliedProposal, id:'alternative-1',number:2,short:'Alternative I · Drei Sumpfmarken',
  label:'Drei Sumpfmarken',file:'Moinneach · Alternative Regionen',map:'assets/map-alternative-1.png',
  summary:'Drei große Gebiete: Südwesten, mittleres und nördliches Flusstal sowie das östliche Bergland.',
  regions:[
   region('southwest','Südwesten · Tarvex, Druanax & Drunemax','#b77639',['tarvex','druanax','drunemax']),
   region('central','Mitte & Norden · Gergonax, Vironax & Amabactoix','#64a844',['gergonax','vironax','amabactoix']),
   region('east','Osten · Camulax, Senodex, Arvonax & Taranux','#7463ad',['camulax','senodex','arvonax','taranux'])]},
 {...suppliedProposal,id:'alternative-2',number:3,short:'Alternative II · Fünf Sumpflande',
  label:'Fünf Sumpflande',file:'Moinneach · Alternative Regionen II',map:'assets/map-alternative-2.png',
  summary:'Fünf Gebiete mit jeweils zwei Städten; der Süden und das östliche Bergland sind weiter unterteilt.',
  regions:[
   region('southwest','Südwesten · Tarvex & Drunemax','#65a92f',['tarvex','drunemax']),
   region('west','Westen & Mitte · Druanax & Gergonax','#ae53ab',['druanax','gergonax']),
   region('north','Norden · Vironax & Amabactoix','#53728c',['vironax','amabactoix']),
   region('northeast','Nordosten · Camulax & Senodex','#b0a43d',['camulax','senodex']),
   region('southeast','Südosten · Arvonax & Taranux','#ba6245',['arvonax','taranux'])]}
].map(withRegionalDesigns);
export const sourceProposal = sourceProposals[0];
export const variants = sourceProposals.map(({id,number,label,summary,regions})=>({id,number,label,summary,regionCount:regions.length}));
