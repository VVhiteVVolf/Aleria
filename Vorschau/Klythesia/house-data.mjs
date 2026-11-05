/** New clan names and initial seats are editable proposals, not genealogy records. */
const house=(id,name,seat,motif,palette,frame,prototypeId,asset,royal=false)=>Object.freeze({
  id,name,clan:true,sourceSeat:seat,motif,palette,frame,prototypeId,royal,
  rank:royal?'Anássa · Herrscherfamilie':'Polemístria · städtischer Frauenclan',
  localTitle:royal?'Anássa':'Polemístria',
  crest:asset.image,image:asset.image,fullsize:asset.fullsize,sourceFile:asset.sourceFile,
  note:royal?'Die Matriarchin der Herrscherfamilie ist Kyreons Gemahlin und Hohepriesterin. Name und Wappenzuordnung sind Vorschläge.':'Vorgeschlagener Frauenclan für diesen Stadtsitz. Persönliche Oberhäupter, Stammbäume und zusätzliche Erbrechte sind noch nicht ausgearbeitet.'
});
const existing=(name,sourceFile)=>({image:`assets/previews/${name}.webp`,fullsize:`assets/originals/${name}.png`,sourceFile});
const fresh=id=>({image:`assets/emblems/previews/house-${id}.webp`,fullsize:`assets/emblems/production/house-${id}.png`});
export const HOUSES=Object.freeze([
  house('klyrath','Klyrath','kallisteia','Goldene vielköpfige Hydra auf Grün.',['Waldgrün','Gold'],'Griechische Goldbordüre','thorax',existing('hydra','Hydra.png'),true),
  house('asterid','Asterid','draxilion','Blauer Phönix mit orangegoldenen Flammenfedern.',['Blau','Orangegold','Elfenbein'],'Blaue griechische Ringe','thorax',existing('phoenix','Phönix.png')),
  house('theryn','Theryn','lykara','Helles geflügeltes Raubtier auf blaugrünem Feld.',['Blaugrün','Elfenbein','Gold'],'Griechische Ringbordüre','thorax',existing('mantikor','Mantikor.png')),
  house('soryth','Soryth','therascia','Dunkle bewaffnete hufige Wesenfigur auf Gold.',['Goldgelb','Schwarz'],'Dunkle griechische Bordüre','thorax',existing('satyr','Satyr.png')),
  house('melanthis','Melanthis','gorgothis','Liegende helle Sphinx mit Kopfschmuck auf Grün.',['Grün','Sandgold'],'Umlaufende Zeichen und Ringe','thorax',existing('sphinx','Sphinx.png')),
  house('naukyra','Naukyra','xalmira','Fischschwänziger Hippokampos.',['Meerblau','Kupfer','Elfenbein'],'Maritimer griechischer Rahmen','thorax',fresh('naukyra')),
  house('elyssar','Elyssar','aenoria','Chimäre aus Löwe, Ziege und Schlange.',['Weinrot','Silber','Ocker'],'Griechischer Metallrahmen','thorax',fresh('elyssar'))
]);
