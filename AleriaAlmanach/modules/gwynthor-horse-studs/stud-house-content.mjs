import { HOUSE_HALENRHYD_FAMILY, HOUSE_CAEFFYN_FAMILY } from '../../../Stammbäume/assets/js/data/gwynthor-horse-studs/stud-families.mjs';
import { STUD_PEOPLE } from './stud-people.mjs';
import { STUD_PLACES } from './stud-places.mjs';
export function buildStudHouseContent(key) {
  const venue = STUD_PLACES.find(p => p.key === key), family = key === 'halenrhyd' ? HOUSE_HALENRHYD_FAMILY : HOUSE_CAEFFYN_FAMILY;
  const people = key === 'halenrhyd' ? STUD_PEOPLE.filter(p => p.familyId === family.document.id) : STUD_PEOPLE.filter(p => [venue.ownerId, venue.wifeId].includes(p.id));
  const owner = people.find(p => p.id === venue.ownerId), wife = people.find(p => p.id === venue.wifeId);
  const card = p => ({ id: p.id, familyId: family.document.id, name: p.name, role: p.title, image: p.portrait, silhouette: p.sex === 'female' ? 'female' : 'male',
    detail: p.death ? `${p.birth}–${p.death}` : `${p.age} Jahre`, description: p.notes });
  const overview = key === 'halenrhyd' ? venue.history : 'Maelrig Caeffyn stammt aus dem Ährental und lebt mit seiner Frau Kyria Aurdden in Gwynthor. Er leitet die Niederlassung von Rhosmeres Rösser; sie führt als Hofverwalterin deren Finanzen. Die Niederlassung ist ein Gildenbetrieb und kein durch die Ehe erworbenes Privatgestüt.';
  const history = key === 'halenrhyd' ? 'Nach den unbekannten historischen Gründern und einer Überlieferungslücke beginnt die namentlich ausgearbeitete Familie mit Idren und Branessa. Ihre drei Söhne Gorweth, Odrig und Bryndor führen heute die städtischen, landwirtschaftlichen und züchterischen Aufgaben fort. Mehrere Kinder und Enkel gehören zu den drei Haushalten.' : `${owner.notes} ${wife.notes}`;
  const holdings = key === 'halenrhyd' ? 'Zum Familienbesitz gehören das Stadtgestüt Zum Silberhalm mit Pferdeankauf, Verkauf und Sattlerei, die eigene Rosszucht im östlichen Bannkreis sowie ein Bauernhof für Futter, Getreide und Vieh. Hufschmied, Schlachterei und Metzgerei bleiben weitere bestehende Familienbetriebe. Die Bindung an Haus Wyrm und ein Sitz im Achterrat der Klingenden Münze sind erhalten.' : 'Maelrig und Kyria führen den Gwynthorer Gildenstandort. Ihre Aufgaben und die Nutzung der Betriebsräume begründen kein persönliches Eigentum an allen Pferden oder Partnerhöfen. Weiterer Privatbesitz der Familie ist nicht festgelegt.';
  return { id: family.document.id, name: family.document.title, type: 'Bürgerliches Haus', page: 'kleinehaeuser.html', county: 'Celtigerns Wacht',
    liege: key === 'halenrhyd' ? 'Haus Wyrm' : '', territoryId: 'celtigerns-wacht', territoryName: 'Celtigerns Wacht',
    territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
    parentHouseId: key === 'halenrhyd' ? 'haus-wyrm' : '', extinct: false, prepared: false, registerPage: true, showMotto: false,
    biographySourceRevision: 1, contentVersion: '20261113-horse-studs-v1', biographyIntroTitle: 'Über die Familie', biographyHistoryTitle: 'Herkunft und Lebensweg',
    biographySummary: { overview, history, holdings, character: 'Verlässliche Pferdekenntnis und nachvollziehbare Geschäftsführung.' },
    profile: { highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Bürgerliches Haus', seat: 'Gwynthor', affiliation: venue.connections,
      liege: key === 'halenrhyd' ? 'Haus Wyrm' : '', origin: key === 'halenrhyd' ? 'Bannkreis Gwynthor' : 'Ährental', people: 'Cenyri', wealth: '', religion: '', motto: '' },
    omitMilitaryProfile: true, familyTreeCompact: true,
    sections: { overview, history, holdings, traditions: 'Pferdehaltung, Pflege und kaufmännische Unterlagen werden sorgfältig aufeinander abgestimmt.',
      knighthood: 'Bürgerliche Familie; kein eigener Ritterrang aus dem Gewerbe abgeleitet.', succession: 'Eine förmliche Nachfolge ist nicht festgelegt.',
      values: 'Herkunft, Eigentumsanteile, Ausbildung und vereinbarte Abgaben werden nachvollziehbar geführt.', cultureReligion: 'Cenyrische Herkunft; weitere besondere religiöse Bräuche sind nicht festgelegt.',
      conflictsAlliances: venue.connections, court: `${owner.name}: ${owner.title}. ${wife.name}: ${wife.title}.`,
      familyTree: key === 'halenrhyd' ? 'Drei verwandte Haushalte mit Kindern und Enkeln; historische Herkunft über einen ausdrücklichen Zeitsprung.' : 'Vorerst nur Maelrig und Kyria, noch keine Kinder. Kyrias Aurdden-Abstammung ist über den direkten Familienlink erreichbar.', historicalFigures: 'Die namentlich ausgearbeiteten Angehörigen der Familie.' },
    images: { crest: `../Stammbäume/${family.document.emblem}`, scene: owner.portrait, sceneAlt: `${owner.name} · ${owner.title}`, banner: '../Stammbäume/assets/images/regions/gwynthor.png' },
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    founder: null, headsTitle: key === 'halenrhyd' ? 'Familienoberhaupt' : 'Der Gwynthorer Haushalt', heads: [card(owner)], heirs: [], officesTitle: 'Mitverantwortung', offices: [card(wife)],
    currentHead: owner.name, firstHeir: '', cadets: [], allies: [], figuresTitle: 'Die Familie', figuresMobileLayout: 'stacked', figures: people.map(card),
    relatedRecords: [{ title: venue.title, text: venue.subtitle, link: `../AleriaAlmanach/AleriaAlmanach.html?entry=${venue.id}`, icon: `../AleriaAlmanach/${venue.sign.replace(/^\.\//, '')}` }], trivia: [] };
}
