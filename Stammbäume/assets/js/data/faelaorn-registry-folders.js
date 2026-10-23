import { FAELAORN_CAPITAL, FAELAORN_EMBLEM, FAELAORN_TERRITORIES, FAELAORN_HOUSE_DEFINITIONS } from './faelaorn-territorial-catalog.js';
import { FAELAORN_CURRENT_CONTROL } from './faelaorn-current-control.js';

const folderDefinitions = [
  {
    path: ['Faelaorn'], icon: FAELAORN_EMBLEM, searchTerms: ['Faelorn', 'Skjaerheim', 'Muirath', 'Sturmalben'],
    description: `Fürstentum Faelaorn · Hauptstadt ${FAELAORN_CAPITAL} · Sechs alte Oberherrschaften. Rann, Mathgham und Braigh stehen unter albischer Herrschaft; Faerna, Brann und weite Teile Damhs sind von Skjaerheim besetzt. Die alten Hausakten und Lehensbindungen bleiben erhalten; Asylaufenthalte sind getrennt verzeichnet. Die Dubhan-Akte bleibt an ihrem bisherigen Ort.`
  },
  ...FAELAORN_TERRITORIES.map(territory => ({
    path: ['Faelaorn', territory.name], icon: territory.emblem,
    searchTerms: [territory.gloss, ...(territory.id === 'tir-na-faerna' ? ['Tir na Fearna', 'Faerner', 'Faernaigh'] : [])],
    description: `${territory.gloss} · Historischer Hauptsitz ${territory.seat}. ${FAELAORN_CURRENT_CONTROL[territory.id].status}. ${FAELAORN_CURRENT_CONTROL[territory.id].note}${territory.id === 'tir-na-braigh' ? ' Die fünf Septs Malairt, Dubhair, Gréin, Gaesa und Treoir sind mit eigenen Zeichen, aber ohne benannte Wohnorte belegt.' : ''}`
  })),
  {
    path: ['Faelaorn', 'Tir na Rann', FAELAORN_CAPITAL],
    description: 'Piobarach ist die Hauptstadt Faelaorns und der Stammsitz des Fürstenclans Ui Urquhart in Tir na Rann.'
  },
  {
    path: ['Faelaorn', 'Tir na Rann', 'Clans im Asyl'], searchTerms: ['Durchad', 'Durachd', 'Eoghainn', 'Zuflucht'],
    description: 'Durachd und Eoghainn sind hier als Clans im Asyl belegt. Ihre genauen Zufluchtsorte sind unbenannt. Dieselben Akten bleiben primär unter den alten Herrschaften Culrain und Càrn Bruach eingetragen.'
  },
  {
    path: ['Faelaorn', 'Tir na Mathgham', 'Clans im Asyl'], searchTerms: ['Duff', 'Airdmhor', 'Zuflucht'],
    description: 'Ó Ard Duff fand in Balgavrie, Dál Airdmhor in Caisteal Gorm Asyl. Ihre alten Herrschaften Dalriadh und Carnascal bleiben die Hauptzuordnung.'
  },
  {
    path: ['Faelaorn', 'Tir na Mathgham', 'Exklaven', 'Inverfay'], searchTerms: ['Imverfay', 'Forsyth'],
    description: 'Ausdrücklich belegte Forsyth-Exklave. Dieselbe Familienakte steht außerdem unter Inverfay in der alten Gliederung von Tir na Damh.'
  },
  {
    path: ['Faelaorn', 'Tir na Faerna', 'Beinnstir'], searchTerms: ['Buadhtreun'],
    description: 'Stammsitz von Ard Buadhtreun gemäß Landesübersicht, Regionalsteckbrief und Amtszeile. Die einzelne Sitzangabe Airdree in der Clanübersicht widerspricht diesen Belegen; Airdree ist der Muirgheal-Sitz. Die Todeszeichen der Amtsträger bedeuten nicht das Erlöschen aller vier Faerna-Clans.'
  },
  {
    path: ['Faelaorn', 'Tir na Rann', 'Caer Fionnach'], searchTerms: ['Ffearnach', 'ausgestorben'],
    description: 'Ehemalige Lehensherrschaft des ausdrücklich ausgestorbenen Clans Mac Ffearnach. Historischer Rang und Erlöschensjahr sind nicht überliefert.'
  },
  { path: ['Faelaorn', 'Tir na Mathgham', 'Lochcaeron'], searchTerms: ['Lochcearon', 'Fiorghra'] },
  { path: ['Faelaorn', 'Tir na Damh', 'Tighlean'], searchTerms: ['Tighlaen', 'Agnew'] },
  { path: ['Faelaorn', 'Tir na Damh', 'Torbhreac'], searchTerms: ['Dianaohm', 'Dianaomh'] },
  { path: ['Faelaorn', 'Tir na Damh', 'Inverfay'], searchTerms: ['Imverfay', 'Forsyth'] },
  { path: ['Faelaorn', 'Tir na Brann', 'Sgurrfàil'], searchTerms: ['Sgurrfail', 'Dubglais'] },
  ...FAELAORN_HOUSE_DEFINITIONS.filter(d=>d.seat).filter((d,i,all)=>all.findIndex(other=>other.territoryId===d.territoryId&&other.seat===d.seat)===i).map(d=>({
    path:['Faelaorn',FAELAORN_TERRITORIES.find(t=>t.id===d.territoryId).name,d.seat],icon:d.emblem,
    description:`Belegter Sitz ${d.seat}. Kategoriezeichen: Wappen ${d.title}; kein neues Ortswappen.`
  })),
  {path:['Faelaorn','Tir na Brann','Tir na Fuil'],icon:'assets/images/houses/Faelaorn/sept-dubhan.png',description:'Historischer Wirkbereich der Sept Dubhan unter Mac Dubglais. Die überlebende Linie wurde vertrieben.'},
  {path:['Faelaorn','Tir na Brann','Tir na Fuil','Caer Dubhan'],icon:'assets/images/houses/Faelaorn/sept-dubhan.png',description:'Ehemalige Grenzfeste der Sept Dubhan.'}
];
// A seat icon augments its existing aliases and description instead of replacing
// an earlier definition of the same category.
const mergedFolders = new Map();
for (const folder of folderDefinitions) {
  const key=folder.path.join('\u0000'),previous=mergedFolders.get(key);
  mergedFolders.set(key, {...previous,...folder,
    description:previous?.description||folder.description||'',
    searchTerms:[...new Set([...(previous?.searchTerms||[]),...(folder.searchTerms||[])])]
  });
}
export const FAELAORN_REGISTRY_FOLDERS = Object.freeze([...mergedFolders.values()].map(folder => Object.freeze({
  ...folder, path: Object.freeze(folder.path), searchTerms: Object.freeze(folder.searchTerms || []),
  plannedHouses: Object.freeze([])
})));
