import {sourceHouses} from './source-houses.mjs?v=20261026-3';

export const rankLabels = Object.freeze({king:'Erlenkönig',baron:'Freiherr',landmann:'Landmann',order:'Geistlicher Ritterorden',laird:'Albischer Laird'});
export const houses = sourceHouses;
export const provinces = [
 {id:'ewigensee',name:'Ewigensee',ruler:'goldkranz',colour:'#ad8864',royal:true,description:'Die königliche Provinz ist die eigene Domäne des Erlenkönigs.'},
 {id:'ewiggruen',name:'Ewiggrün',ruler:'rosenstolz',colour:'#759047',description:'Das Freiherrentum der Rosenstolz; Mährenfeld gehört zu seinen Landmannssitzen.'},
 {id:'weisshort',name:'Weisshort',ruler:'sommerfeld',colour:'#7faba2',description:'Das Freiherrentum der Sommerfeld mit Brückenwacht und Wolfrieden.'},
 {id:'seeblick',name:'Seeblick',ruler:'silberthal',colour:'#b4aa79',description:'Das Freiherrentum der Silberthal; das Haus von Silbermundt bleibt offen.'},
 {id:'weisslauf',name:'Weisslauf',ruler:'weissmann',colour:'#628e85',description:'Das Freiherrentum der Weissmann mit drei benannten Landmannssitzen.'}
];
export const settlements = [
 {id:'ewigensee',name:'Ewigensee',province:'ewigensee',kind:'Königliche Provinz',point:[88.6,35.8],pin:[91,23]},
 {id:'ewiggruen',name:'Ewiggrün',province:'ewiggruen',kind:'Freiherrensitz',point:[58.2,31.8],pin:[62,22]},
 {id:'weisshort',name:'Weisshort',province:'weisshort',kind:'Freiherrensitz',point:[29,9.5],pin:[27,20]},
 {id:'seeblick',name:'Seeblick',province:'seeblick',kind:'Freiherrensitz',point:[26,75.5],pin:[24,67]},
 {id:'weisslauf',name:'Weisslauf',province:'weisslauf',kind:'Freiherrensitz',point:[63.2,88.4],pin:[58.5,79]},
 {id:'wolfrieden',name:'Wolfrieden',sourceName:'Wolfenried',province:'weisshort',kind:'Landmannssitz',point:[13.1,31],pin:[18.4,40]},
 {id:'brueckenwacht',name:'Brückenwacht',province:'weisshort',kind:'Landmannssitz',point:[47.5,9.2],pin:[41,19]},
 {id:'silbermundt',name:'Silbermundt',province:'seeblick',kind:'Landmannssitz',point:[10.1,60.6],pin:[9,52]},
 {id:'weissklippe',name:'Weissklippe',province:'weisslauf',kind:'Landmannssitz',point:[41.7,85.7],pin:[44,76]},
 {id:'weissthal',name:'Weissthal',province:'weisslauf',kind:'Landmannssitz',point:[72.6,67],pin:[69,57]},
 {id:'ottersburg',name:'Ottersburg',province:'weisslauf',kind:'Landmannssitz',point:[80.7,85.7],pin:[80.5,76]},
 {id:'hohenklamm',name:'Hohenklamm',province:'ewigensee',kind:'Landmannssitz',point:[88.7,55.1],pin:[92,47]},
 {id:'maehrenfeld',name:'Mährenfeld',province:'ewiggruen',kind:'Landmannssitz',point:[54.4,54],pin:[58.5,46]},
 {id:'aehrensass',name:'Ährensass',province:null,kind:'Verpachtetes Ordensgebiet',point:[39.9,49.8],pin:[36.2,42.5]}
];

export function createMapProposal(placements) {
 return {number:1,short:'Weisenfluh',file:'Weisenfluh · Regionen und Hauswappen',map:'assets/map.webp',imageSize:[4096,2349],bakedNames:true,settlements,
  clans:houses.map(h=>({...h,seat:placements[h.id],liege:h.rank==='baron'?'goldkranz':['landmann'].includes(h.rank)?provinces.find(p=>p.id===h.province)?.ruler:null}))};
}
