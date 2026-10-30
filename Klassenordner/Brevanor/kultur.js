const ranks=[
 ['Riël','König'],['Arduen','Herzog'],['Arvor','Fürst'],['Comteyr','Graf'],
 ['Vicon','Vizegraf'],['Brenor','Baron'],['Chastor','Ritterfürst'],
 ['Bannor','Ritterlicher Herr, Bannerherr'],['Cavalier','Einfacher Ritter'],
 ['Gentry','Knappe'],['Pajet','Page']
];
export const BREVANOR_CULTURE=Object.freeze({
 id:'brevanor',name:'Brevanor',emblem:'../../assets/images/brevanor/realm/brevanor.webp',catalogEmblem:'assets/images/brevanor/realm/brevanor.webp',
 pageLabels:{brand:'Klassen Brevanors',collection:'Die Wege Brevanors',traditionsLines:['Traditionen','Brevanors']},
 sharedSections:{},
 orderOverview:{kind:'hierarchy-only',title:'Die brevanorische Adelshierarchie',navigationTitle:'Adelshierarchie',eyebrow:'Brevanor · Titel und Rangfolge',introduction:'Die vorgegebene Rangfolge vom Riël bis zum Pajet. Adelstitel und Klassenbezeichnungen werden getrennt geführt.',nobleTitle:'Die elf Ränge',hierarchy:ranks.map(([title])=>title),nobleRanks:ranks.map(([title,subtitle],i)=>({title,subtitle,scope:`Rang ${i+1}`}))}
});
