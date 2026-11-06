// Shared editorial source for the house page and short family biography.
// New ordinary merchant family expressly authorized on 6 November 2026.
import { HOUSE_GWERNANT_FAMILY as family } from '../../../../../../Stammbäume/assets/js/data/house-gwernant-family.js';

const treeImage = source => source ? `../Stammbäume/${source}` : '';
const named = family.persons.filter(person => !person.id.startsWith('haus-gwernant-gruender'));
const personCard = person => ({
  id: person.id, familyId: family.document.id, name: person.name,
  role: person.title, image: treeImage(person.portrait),
  silhouette: person.sex === 'female' ? 'female' : 'male',
  detail: `${person.birth}${person.death ? `–${person.death}` : ` · ${1740 - Number(person.birth)} Jahre`}`,
  description: person.notes
});
const card = id => personCard(named.find(person => person.id === id));
const overview = 'Die Gwernant sind eine kleine bürgerliche Händlerfamilie aus Gwynthor. Ihr Laden führt Leinen, Garn, Bänder und einfache Kurzwaren für Haushalte und nähende Kundschaft. Der Betrieb lebt von örtlichen Stammkunden und überschaubaren Bestellungen. Idwal Gwernant führt das Geschäft mit seiner Familie; sein jüngerer Bruder Emrys kümmert sich um Wareneinkauf und Lieferwege.\n\nDie Familie besitzt weder einen Adelstitel noch eine besondere politische Stellung. Ihr Auskommen beruht auf dem Verkauf, der sorgfältigen Warenpflege und verlässlichen Absprachen. Neben dem eigenen Laden gehen zwei junge Angehörige einem Dienst in der Göttlichen Eleganz nach: Catrin berät bei Maßaufträgen, Efa kümmert sich um Verkaufsraum und Wäschepflege.';
const history = 'Die Namen der älteren Gründer sind unbekannt. Der Stammbaum setzt erst nach einer Lücke wieder mit Bryn Gwernant (1660–1731) und seiner Gemahlin Mabli (1664–1736) ein. Bryn handelte mit Leinen, während Mabli Garn, Bänder und kleine Nähzutaten betreute. Ihre Söhne Idwal und Emrys wuchsen mit dem örtlichen Geschäft auf.\n\nIdwal, geboren 1688, heiratete 1712 Gwenllian, geboren 1691. Ihre Töchter Catrin und Efa wurden 1714 und 1718 geboren. Emrys, geboren 1692, heiratete 1719 Nerys, geboren 1696; ihr Sohn Aled kam 1721 zur Welt. Beide Zweige arbeiten weiterhin für denselben kleinen Laden.\n\nHeute liegt die Führung bei Idwal. Catrin und Efa haben eigene Arbeitsstellen unter Maelwen Coeddu in der Göttlichen Eleganz angenommen. Ihre Anstellungen machen die Göttliche Eleganz nicht zu einem Besitz der Gwernant. Der neunzehnjährige Aled lernt die alltäglichen Arbeiten im Familienladen kennen.';
const values = 'Saubere Ware, nachvollziehbare Mengen und eingehaltene Zusagen bestimmen den Umgang mit der Kundschaft. Die Familie achtet auf sorgsames Falten, trockenes Lagern und das genaue Zählen kleiner Waren. Bei größeren Wünschen wird zuerst besprochen, was sich tatsächlich beschaffen lässt. Der Ruf eines verlässlichen kleinen Ladens ist wichtiger als ein großspuriges Versprechen.';
const household = 'Gwenllian verbindet Haushaltsführung mit Warenpflege und kleineren Kundenbestellungen. Nerys sortiert Kurzwaren und richtet Lieferbündel. Emrys unterstützt Idwal beim Einkauf und bei örtlichen Wegen. Aled hilft beim Annehmen, Zählen und Verpacken. Catrin und Efa bleiben eng mit der Familie verbunden, obwohl sie nun in einem anderen Betrieb arbeiten.';
const holdings = 'Die Lebensgrundlage ist ein kleiner gemeinsamer Leinen- und Kurzwarenladen in Gwynthor. Für die Familie sind weder eine weitere Filiale noch Landgüter oder ein eigener Fernhandel festgelegt. Eine genaue Straßenlage ist nicht benannt. Aus den Arbeitsstellen Catrins und Efas entsteht kein Eigentums- oder Lieferanspruch gegenüber der Göttlichen Eleganz.';

export const HOUSE_CONTENT = {
  id: 'haus-gwernant', name: 'Familie Gwernant', type: 'Bürgerliches Haus', page: 'kleinehaeuser.html',
  county: 'Celtigerns Wacht', liege: 'Haus Draig', parentHouseId: '',
  territoryId: 'grafschaft-celtigerns-wacht', territoryName: 'Celtigerns Wacht',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  extinct: false, showMotto: false, registerPage: true, prepared: false,
  contentVersion: '20261106-gwernant-v1', biographySourceRevision: 1,
  biographyIntroTitle: 'Über die Familie', biographyHistoryTitle: 'Drei Generationen im örtlichen Handel',
  biographySummary: {
    overview: 'Kleine bürgerliche Leinen- und Kurzwarenhändlerfamilie aus Gwynthor. Idwal Gwernant führt den gemeinsamen Familienladen; sein Bruder Emrys unterstützt Einkauf und Lieferwege. Catrin und Efa arbeiten unter Maelwen Coeddu in der Göttlichen Eleganz und behalten ihre Gwernant-Identität.',
    history: 'Nach unbekannten älteren Gründern beginnt die konkrete Linie mit Bryn (1660–1731) und Mabli (1664–1736). Ihre Söhne sind Idwal, geboren 1688, und Emrys, geboren 1692. Idwal und Gwenllian sind die Eltern Catrins und Efas. Emrys und Nerys haben den Sohn Aled. Die Herkunftshäuser der eingeheirateten Frauen sind nicht festgelegt.',
    character: values,
    customs: 'Der kleine Laden und der Haushalt bleiben eng verbunden. Waren werden gemeinsam gezählt, Leinen sorgfältig gefaltet und Lieferbündel deutlich auseinandergehalten. Kinder lernen die Arbeiten kennen; die beiden Töchter haben inzwischen eigene Arbeitsstellen angenommen.',
    holdings,
    relations: 'Catrin betreut in der Göttlichen Eleganz Maßwünsche und die Abstimmung vor der Anprobe; Efa pflegt Verkaufsraum, Vorhänge und Probiertücher. Beide sind unverheiratet und ohne Verlobung. Ihr Dienst unter Maelwen begründet keine Verwandtschaft mit Raves oder Coeddu.',
  },
  hierarchy: [
    ['Sammlung', 'Familien Häuser und Clans', 'familien-hauser-und-clans'],
    ['Kontinent', 'Estryll', 'estryll'], ['Königreich', 'Cenyr', 'cenyr'],
    ['Grafschaft', 'Celtigerns Wacht', 'celtigerns-wacht'],
    ['Baronie', 'Llamreis Ankunft', 'llamreis-ankunft'], ['Ort', 'Gwynthor', 'gwynthor'],
    ['Familie', 'Familie Gwernant', 'haus-gwernant']
  ].map(([type, name, slug]) => ({ type, name, slug })),
  profile: {
    highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Leinen- und Kurzwarenhändler',
    motto: '', quoteAuthor: '', seat: 'Gwynthor', affiliation: '', liege: 'Haus Draig',
    patron: '', knightingPatron: '', founding: 'Nicht bekannt', milestoneOne: '', milestoneTwo: '',
    people: 'Cenyri', wealth: 'Bescheidenes örtliches Geschäft', religion: '', patronDeities: '',
    origin: 'Gwynthor · örtlicher Leinen- und Kurzwarenhandel', cadetBranches: '', allies: '', enemies: '',
    troopStrength: '', tiarna: '', kerns: '', fleet: ''
  },
  omitMilitaryProfile: true, familyTreeCompact: true,
  sectionTitles: { court: '8. Familie und Arbeit', historicalFigures: '11. Die Angehörigen der Familie' },
  sections: {
    overview, history, values, holdings,
    traditions: 'Sorgfältige Warenpflege und verlässliche Absprachen verbinden die Generationen. Kleine Nähzutaten werden getrennt sortiert und gezählt; Leinen soll den Laden sauber, trocken und ordentlich gefaltet verlassen.',
    knighthood: 'Die Gwernant gehören dem bürgerlichen Stand an. Das Familiengeschäft und die einzelnen Anstellungen bilden ihren Alltag. Ritterdienst, besondere Abstammung und eine eigene Herrschaft gehören nicht zur Familiengeschichte.',
    succession: 'Idwal führt den Laden, Emrys unterstützt ihn. Eine förmliche Erbfolge ist nicht festgelegt; Aleds Mithilfe begründet keine automatische Nachfolge und Catrins oder Efas Anstellung keinen Ausschluss aus der Familie.',
    cultureReligion: 'Die Familie ist in Gwynthors cenyrischem Alltagsleben verwurzelt. Besondere religiöse Bräuche oder eine eigene Familienpatronin sind nicht festgelegt.',
    conflictsAlliances: 'Die beiden Töchter stehen im Dienst der Göttlichen Eleganz. Weitere politische Bindungen, Fehden oder Verwandtschaften zu bestehenden Häusern sind nicht festgelegt.',
    court: household,
    familyTree: 'Die älteren Gründer sind unbekannt. Nach einer Lücke setzt die konkrete Linie bei Bryn und Mabli wieder ein und führt über die Brüder Idwal und Emrys zu deren Kindern. Mablis, Gwenllians und Nerys’ Herkunftsfamilien sind nicht benannt.',
    historicalFigures: 'Die folgenden Karten stellen die neun benannten Angehörigen mit ihren Lebensdaten, Aufgaben und direkten Verweisen auf den Stammbaum vor.'
  },
  images: {
    crest: treeImage(family.document.emblem),
    scene: treeImage(named.find(person => person.id === 'catrin-gwernant').portrait),
    sceneAlt: 'Catrin Gwernant, 26 Jahre · Beratung für Maßaufträge in der Göttlichen Eleganz',
    banner: '../Stammbäume/assets/images/regions/celtigerns-wacht.png'
  },
  illustrationCategory: 'Bürgerliches Familienporträt · Catrin Gwernant',
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  founder: null, headsTitle: 'Die heutige Ladenführung', headsNote: '', heads: [card('idwal-gwernant')],
  heirs: [], officesTitle: 'Familienladen und eigene Anstellungen',
  offices: ['gwenllian-spouse-gwernant', 'emrys-gwernant', 'nerys-spouse-gwernant', 'catrin-gwernant', 'efa-gwernant', 'aled-gwernant'].map(card),
  currentHead: 'Idwal Gwernant', firstHeir: '', cadets: [], allies: [],
  figuresTitle: 'Die Familie Gwernant', figuresMobileLayout: 'stacked',
  figures: named.map(person => { const entry = personCard(person); return { ...entry, description: `${entry.detail}. ${entry.description}` }; }),
  relatedRecords: [{ title: 'Göttliche Eleganz', text: 'Arbeitsstelle Catrins und Efas unter Maelwen Coeddu.', link: '../AleriaAlmanach/AleriaAlmanach.html?entry=goettliche-eleganz', icon: '../AleriaAlmanach/assets/goettliche-eleganz/schild.png' }],
  trivia: ['Das Familienzeichen zeigt eine goldene Garnrolle und zwei leinenweiße Knöpfe auf dunkelblauem Grund.', 'Beide Töchter Idwals und Gwenllians arbeiten in der Göttlichen Eleganz.', 'Der Onkelzweig führt keinen zweiten Laden.']
};
