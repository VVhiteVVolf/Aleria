import { FAELAORN_CAPITAL, FAELAORN_EMBLEM, FAELAORN_TERRITORIES, FAELAORN_WAR_CONTEXT } from './faelaorn-territorial-catalog.js';

export const FAELAORN_REGISTRY_FOLDERS = Object.freeze([
  {
    path: ['Faelaorn'], icon: FAELAORN_EMBLEM, searchTerms: ['Faelorn', 'Skjaerheim', 'Muirath', 'Sturmalben'],
    description: `Fürstentum Faelaorn · Hauptstadt ${FAELAORN_CAPITAL} · Sechs alte Oberherrschaften. ${FAELAORN_WAR_CONTEXT.note} 17 Stammbäume einschließlich der Braigh-Clans Culloch, Borthwick, Erskine und Grannd sind ausgearbeitet; 22 weitere Clan- und Septakten sind vorbereitet. Die Dubhan-Akte bleibt an ihrem bisherigen Ort.`
  },
  ...FAELAORN_TERRITORIES.map(territory => ({
    path: ['Faelaorn', territory.name], icon: territory.emblem,
    searchTerms: [territory.gloss, ...(territory.id === 'tir-na-faerna' ? ['Tir na Fearna', 'Faerner', 'Faernaigh'] : [])],
    description: `${territory.gloss} · Historischer Hauptsitz ${territory.seat}. Die Gliederung folgt den alten Herrschaftsverhältnissen; eine konkrete heutige Besatzungsgrenze ist nicht belegt.${territory.id === 'tir-na-braigh' ? ' Die fünf Septs Malairt, Dubhair, Gréin, Gaesa und Treoir sind mit eigenen Zeichen, aber ohne benannte Wohnorte belegt.' : ''}`
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
  { path: ['Faelaorn', 'Tir na Brann', 'Sgurrfàil'], searchTerms: ['Sgurrfail', 'Dubglais'] }
].map(folder => Object.freeze({
  ...folder, path: Object.freeze(folder.path), searchTerms: Object.freeze(folder.searchTerms || []),
  plannedHouses: Object.freeze([])
})));
