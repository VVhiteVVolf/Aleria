import { HOUSE_FFALS_FAMILY as family } from '../../../../Stammbäume/assets/js/data/house-ffals-family.js';

const treeImage = path => path ? `../Stammbäume/${path}` : '';
const named = family.persons.filter(person => !person.extensions.unresearchedParentPlaceholder);
const card = person => ({
  id: person.id, familyId: family.document.id, name: person.name,
  role: person.title, image: '', silhouette: person.sex === 'female' ? 'female' : 'male',
  detail: person.status === 'dead' ? 'Verstorben · Lebensdaten offen' : 'Lebensdaten nicht überliefert',
  description: person.notes
});
const overview = 'Die Ffals sind eine bürgerliche Händlerfamilie mit Wurzeln auf der Silberinsel. Alwyn Ffals war dort als Händler tätig. Nach dem Tod seiner Frau zog er mit seinen zwei erwachsenen Kindern Seren und Rhun sowie seinem jüngeren Bruder Bryn nach Venalys. Dort liegt der heutige Familienwohnsitz; ein genauer Stadtbezirk und eine eigene Niederlassung sind nicht benannt.';
const history = 'Ein verwandter Zweig der Ffals betrieb in Gwynthor einen Juwelier. Diese örtliche Linie ist mangels Nachkommen erloschen. Die Verwandtschaft mit Alwyns Familie ist überliefert, ihr genauer Grad jedoch nicht. Deshalb führt der Stammbaum keine erfundene Verbindung zu einem namentlich nicht bekannten letzten Gwynthorer Angehörigen.\n\nDer bekannte Familienkreis umfasst den verwitweten Alwyn, seine verstorbene unbenannte Gemahlin, die beiden erwachsenen Kinder und Alwyns jüngeren Bruder. Namen und Lebensdaten früherer Generationen sind nicht überliefert. Die beiden Elternkarten der Brüder dienen als unbenannte Platzhalter. Das Jahr des Umzugs nach Venalys und die Lebensdaten aller Angehörigen bleiben offen.';
const holdings = 'Für den erloschenen Gwynthorer Zweig ist ein Juweliergeschäft überliefert. Alwyn selbst ist als Händler von der Silberinsel beschrieben. Ein heutiger Besitz-, Erb- oder Rechtsanspruch auf den Gwynthorer Betrieb ist damit nicht festgestellt. Weitere Läden, Landbesitz und Vermögenswerte sind nicht benannt.';

export const HOUSE_CONTENT = {
  id: 'haus-ffals', name: 'Familie Ffals', type: 'Bürgerliches Haus', page: 'kleinehaeuser.html',
  county: 'Venalys', countyLabel: 'Heutiger Wohnort', liege: '', parentHouseId: '',
  territoryId: 'venalys', territoryName: 'Venalys', territoryHref: '',
  extinct: false, showMotto: false, registerPage: true, prepared: false,
  contentVersion: '20261109-ffals-real-v1', biographySourceRevision: 1,
  biographyIntroTitle: 'Die tatsächliche Familie', biographyHistoryTitle: 'Von der Silberinsel nach Venalys',
  biographySummary: {
    overview, history,
    character: 'Eine bürgerliche Händlerfamilie. Besondere Familienwerte, Ämter und eine überlieferte Hausdevise sind nicht benannt.',
    holdings,
    relations: 'Alwyn und Bryn sind Brüder. Seren und Rhun sind Alwyns bereits erwachsene Kinder. Der genaue Verwandtschaftsgrad zum erloschenen Gwynthorer Juwelierzweig bleibt offen.'
  },
  hierarchy: [
    ['Sammlung', 'Familien Häuser und Clans', 'familien-hauser-und-clans'],
    ['Kontinent', 'Estryll', 'estryll'], ['Stadtrepublik', 'Venalys', 'venalys'],
    ['Familie', 'Familie Ffals', 'haus-ffals']
  ].map(([type, name, slug]) => ({ type, name, slug })),
  profile: {
    highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Händlerfamilie', motto: '', quoteAuthor: '',
    seat: 'Venalys', affiliation: '', liege: '', patron: '', knightingPatron: '', founding: 'Nicht überliefert',
    milestoneOne: '', milestoneTwo: '', people: 'Cenyri · Herkunft Silberinsel', wealth: 'Nicht überliefert',
    religion: '', patronDeities: '', origin: 'Silberinsel', cadetBranches: 'Erloschener Juwelierzweig in Gwynthor · genaue Verwandtschaft offen',
    allies: '', enemies: '', troopStrength: '', tiarna: '', kerns: '', fleet: ''
  },
  omitMilitaryProfile: true, familyTreeCompact: true,
  sectionTitles: { court: '8. Der bekannte Familienkreis', historicalFigures: '11. Die tatsächlichen Angehörigen' },
  sections: {
    overview, history, holdings,
    values: 'Eine überlieferte Hausdevise oder besondere Familientradition ist nicht benannt.',
    traditions: 'Weitere Familienbräuche sind nicht überliefert.',
    knighthood: 'Die Familie ist bürgerlich. Für die bekannten Angehörigen sind weder Adelstitel noch Ritterämter festgelegt.',
    succession: 'Die Gwynthorer Juwelierlinie ist ohne Nachkommen erloschen. Eine geregelte Nachfolge oder eine rechtliche Übernahme durch Alwyn ist nicht belegt.',
    cultureReligion: 'Die Familie stammt von der Silberinsel und lebt heute in Venalys. Besondere religiöse Bindungen bleiben offen.',
    conflictsAlliances: 'Weitere Verbündete, Fehden und politische Bindungen sind nicht benannt.',
    court: 'Alwyn ist der verwitwete Vater der erwachsenen Seren und des erwachsenen Rhun. Sein jüngerer Bruder Bryn zog mit ihnen nach Venalys. Die verstorbene Gemahlin bleibt unbenannt.',
    familyTree: 'Vier benannte lebende Angehörige, Alwyns unbenannte verstorbene Gemahlin und zwei unbenannte Elternplatzhalter. Der erloschene Gwynthorer Zweig bleibt ohne erfundenen Verwandtschaftsgrad im Begleittext.',
    historicalFigures: 'Die Porträts der tatsächlichen Angehörigen sind auf Nutzerwunsch noch nicht erstellt. Die vorhandenen Silhouetten sind ausschließlich Platzhalter.'
  },
  images: {
    crest: treeImage(family.document.emblem), scene: '', sceneAlt: '',
    banner: '../Stammbäume/assets/images/regions/venalys.png'
  },
  illustrationCategory: 'Familienporträts vorerst offen',
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  founder: null, headsTitle: 'Der bekannte Händler', headsNote: '', heads: [card(named.find(person => person.id === 'alwyn-ffals-echt'))],
  heirs: [], officesTitle: 'Bekannte Angehörige', offices: [],
  currentHead: 'Alwyn Ffals', firstHeir: '', cadets: [], allies: [],
  figuresTitle: 'Die tatsächliche Familie Ffals', figuresMobileLayout: 'stacked', figures: named.map(card),
  trivia: ['Das Familienwappen zeigt einen goldenen offenen Ring und zwei silberne Perlen auf Weinrot.', 'Die Schreibvariante Fflas bezeichnet in der gelieferten Quelle dieselbe Familie.', 'Für die echten Angehörigen sind noch keine Porträts angefertigt.']
};
