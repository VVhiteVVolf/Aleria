// Gemeinsame redaktionelle Quelle; die vorhandenen drei genealogischen Akten bleiben unverändert.
import { HOUSE_MORFORWYN_PORTRAITS } from '../../../../../../Stammbäume/assets/js/data/house-morforwyn-portraits.js';

const assetRoot = 'Estryll/Cenyr/Sonnenkueste/Jungferntal/Haus_Morforwyn/assets';
const portrait = id => HOUSE_MORFORWYN_PORTRAITS[id] ? `../Stammbäume/${HOUSE_MORFORWYN_PORTRAITS[id]}` : '';
const member = (id, name, role, detail = '') => ({ id, familyId: 'haus-morforwyn', name, role, detail, image: portrait(id) });
const officeRoles = [
  ['Vogt', 'male'], ['Schatzmeister', 'female'], ['Kommandant der Garde', 'male'], ['Zeremonienmeister', 'female'], ['Mundschenk', 'male'],
  ['Waffenmeister', 'male'], ['Stallmeister', 'female'], ['Kerkermeister', 'male'], ['Jagdmeister', 'female'], ['Hafenmeister', 'male'],
  ['Küchenmeister', 'male'], ['Brotmeister', 'female'], ['Handwerksmeister', 'male'], ['Gartenmeister', 'female'], ['Hofkaplan', 'male'],
  ['Hofmeister', 'male'], ['Hofdame', 'female'], ['Archivar', 'male'], ['Hoffalkner', 'female'], ['Zwingermeister', 'male']
];

export const HOUSE_CONTENT = {
  id: 'haus-morforwyn', name: "Haus Morforwyn O'Carngol", type: 'Baronenhaus', page: 'haus.html',
  county: 'Sonnenküste', liege: "Haus Illewod O'Aberon", territoryId: 'baronie-jungferntal', territoryName: 'Jungferntal',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Sonnenküste/Baronie Jungferntal/Baronie Jungferntal.html',
  parentHouseId: 'haus-illewod', extinct: false, showMotto: false, registerPage: true, prepared: false,
  contentVersion: "20261104-lore-fixes-v1", biographySourceRevision: 7, biographyPreviousDefaultFingerprints: ["5364:7ce72178:18c63da2"],
  biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte des Hauses',
  biographySummary: {
    overview: 'Haus Morforwyn O’Carngol ist das matriarchal geführte Baronenhaus von Jungferntal an der Sonnenküste. Frauen leiten das Geschlecht und tragen seine Erbfolge weiter. Der Stammsitz Carngol und die umliegenden Ländereien gehören zu einer Herrschaft, deren Selbstverständnis eng mit der Legende eines Ritters und einer Meerjungfrau verbunden ist.',
    history: 'Der Sage nach zog sich der entstellte Ritter Triston aus Avallorn mit seinem Gefolge auf einen abgelegenen Hügel zurück und errichtete eine Burg. Nachts suchte er an einem Teich Einsamkeit und bat die Dame der See um eine Gefährtin. Die Göttin soll ihm Mapnimue, eine ihrer Meerjungfrauentöchter, gesandt haben. Aus der Verbindung ging die legendäre Ahnenfamilie hervor. Als Gründerin und erste Baronesse wird Hafmue geführt. Der Name Morforwyn wird in der Hausüberlieferung als „Tochter des Meeres“ gedeutet.',
    character: 'Die Morforwyn verbinden Eleganz, Selbstbeherrschung und Ehre mit ausgeprägtem Stolz auf ihre besondere Herkunft. Sie halten auf strenge Etikette, familiäre Würde und Abstand zu anderen Häusern. Kränkungen ihrer Ehre nehmen sie empfindlich auf. Das Bewusstsein einer außergewöhnlichen Blutlinie gehört zu ihrem Selbstbild; die Gründungserzählung bleibt eine Sage.',
    customs: 'Gebete und kleine Opfergaben an Gewässern gelten der Dame der See. Die Töchter werden früh auf Verantwortung vorbereitet und erhalten höfische Erziehung sowie Unterricht in Diplomatie, Magie und mitunter Waffenführung. Die matriarchale Hausordnung prägt auch die überlieferten Nebenlinien.',
    holdings: 'Carngol entwickelte sich aus der alten Hügelburg des Gründungsmythos. Als Handelsort zwischen Aberon und Mathragon bildet die Stadt das Zentrum der Baronie. Die Morforwyn verwalten die umliegenden Ländereien und Dörfer. Waldwirtschaft, Jagd, Papierherstellung, Musik und Kunsthandwerk prägen das Jungferntal.',
    culture: 'Offiziell gehören die Morforwyn der Alerischen Kirche an. Ihre besondere Verehrung gilt Nimue, der Dame der See, und der Ahnfrau Hafmue. Die beinahe religiöse Hingabe mancher Gefolgsleute an das Haus und dessen selbstbewusste Sonderstellung führen zu Spannungen mit dem Klerus. Eine konkret benannte Fehde folgt daraus nicht.',
    relations: 'Die Morforwyn stehen unter Haus Illewod. Urumue führt das Haus; die Erbfolge nennt Glanmue, Karismue, Wledmue und Cerysmue. Die Rittergarde besteht überwiegend aus treuen Gefolgsleuten und Vasallen. Direkte Familienangehörige treten dagegen häufig in priesterliche, magische oder andere Aufgabenbereiche ein.'
  },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  allies: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
    { type: 'Grafschaft', name: 'Sonnenküste', slug: 'sonnenkueste' },
    { type: 'Baronie', name: 'Jungferntal', slug: 'jungferntal' },
    { type: 'Sitz', name: 'Carngol', slug: 'carngol' },
    { type: 'Haus', name: "Haus Morforwyn O'Carngol", slug: 'haus-morforwyn' }
  ],
  profile: {
    highestTitle: 'Baronesse', rank: 'Baron', houseType: 'Matriarchales Baronenhaus', motto: '', quoteAuthor: '',
    seat: 'Carngol', affiliation: 'Jungferntal · Sonnenküste', liege: "Haus Illewod O'Aberon",
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '',
    patron: '', knightingPatron: '', people: 'Cenyri, Sonncenyri', wealth: 'Hoch', religion: 'Alerische Kirche',
    patronDeities: 'Nimue, die Dame der See; Hafmue (Ahnenverehrung)', origin: 'Sage von Triston aus Avallorn und Mapnimue',
    cadetBranches: '', allies: '', enemies: ''
  },
  omitMilitaryProfile: true,
  sections: {
    overview: [
      'Die Morforwyn sind ein matriarchal geführtes Adelsgeschlecht aus Carngol und die Barone des Jungferntals. Frauen führen das Haus und tragen die überlieferte Erbfolge weiter. Stolz, eine geheimnisvolle Gründungssage und ungewöhnliche Hausbräuche bestimmen ihr Ansehen.',
      'Die Familie beruft sich auf eine Verbindung zwischen einem Ritter aus Avallorn und einer Meerjungfrau. Ihr Glaube an diese besondere Herkunft prägt ihre Stellung gegenüber Untertanen, anderen Häusern und dem Klerus. Lehnsherr der Baronie ist Haus Illewod O’Aberon.'
    ],
    history: [
      'Die Gründungssage beginnt mit Triston, einem entstellten Ritter aus Avallorn. Von Narben gezeichnet und der Gesellschaft abgewandt, zog er mit seinem Gefolge auf einen abgelegenen Hügel und begann dort den Bau einer Burg. Tagsüber hielt er sich zurück, nachts ging er an einem kleinen Teich angeln.',
      'Dort bat er die Dame der See um Gesellschaft und Liebe. Die Göttin soll sein Gebet erhört und ihm Mapnimue, eine ihrer Meerjungfrauentöchter, gesandt haben. Die beiden verliebten sich, Mapnimue verließ das Wasser und wurde seine Gefährtin. Aus ihrer Verbindung leiten die Morforwyn ihre Ahnenfamilie her.',
      'Der Hausname wird in dieser Überlieferung als „Tochter des Meeres“ gedeutet. Hafmue gilt als Gründerin und erste Baronesse. Aus der alten Hügelburg entwickelte sich später Carngol. Die Erzählung bleibt eine Sage; ein genaues Gründungsjahr ist nicht überliefert.'
    ],
    traditions: [
      'An Gewässern bringen die Morforwyn kleine Opfergaben dar oder sprechen Gebete an die Dame der See. Der Ritus erinnert an die sagenhafte Herkunft des Hauses und erbittet den Schutz seiner besonderen Patronin.',
      'Die matriarchale Ordnung prägt Erziehung und Nachfolge. Töchter werden von klein auf auf höfische Verantwortung vorbereitet. Diplomatie, Magie und mitunter Waffenführung ergänzen ihre Erziehung. Die weibliche Linie bleibt der Mittelpunkt der überlieferten Hausfortsetzung.'
    ],
    knighthood: [
      'Das cenyrische Rittertum wurzelt in Avallorn. Ein Knappe empfängt an einem See oder einem anderen Gewässer den Ritterschlag und die Salbung. Er schwört auf die Neun Göttlichen und ihre Tugenden sowie zusätzlich auf die Dame der See.',
      'Die Ritter der Morforwyn werden als Elitegarde in dunkler Rüstung beschrieben. Nur wenige stammen unmittelbar aus der Familie. Die Hausüberlieferung berichtet von einer oft kurzen Lebensspanne männlicher Angehöriger, während viele Frauen priesterliche, magische oder andere Aufgaben übernehmen. Dies ist keine feste Lebensgrenze für einzelne Personen.',
      'Knechte und Vasallen tragen deshalb die ritterliche Hausgarde. Ihre Treue geht nach der Überlieferung teils in eine beinahe religiöse Verehrung der Morforwyn über. Neben der Verteidigung bewahren sie die Traditionen und die Ehre des Hauses. Gerade diese Verehrung ruft wiederholt Missfallen im Klerus hervor.'
    ],
    holdings: [
      'Die Morforwyn herrschen als Barone von Jungferntal über Carngol und die umliegenden Ländereien und Dörfer. Die Stadt entwickelte sich aus der alten Hügelburg und liegt an einem für Händler und Reisende wichtigen Knotenpunkt zwischen Aberon und Mathragon.',
      'Im bewaldeten Jungferntal gehören Forstwirtschaft und Jagd zu den Lebensgrundlagen. Papierherstellung, Instrumentenbau und kunstvolle Handarbeiten ergänzen den Handel. Das Haus fördert Musik und Kunst; die regionalen Feste sind von Musik, Tanz und Geschichten geprägt.'
    ],
    cultureReligion: [
      'Die Morforwyn gehören offiziell der Alerischen Kirche an. Zugleich besitzt ihre Familienlegende einen besonderen religiösen Rang. Nimue, die Dame der See, gilt ihnen als Schutzpatronin; Hafmue wird als Ahnfrau verehrt.',
      'Viele Angehörige verstehen ihre besondere Herkunft als geistige Wahrheit und heben sich dadurch selbstbewusst von anderen Geschlechtern ab. Manche Gefolgsleute verehren das Haus beinahe wie halbgöttliche Wesen. Der Klerus betrachtet diese Selbstüberhöhung kritisch und erinnert an die Grenzen weltlicher Würde.'
    ],
    conflictsAlliances: 'Haus Illewod ist der unmittelbare Lehnsherr. Zwischen dem Klerus und den Morforwyn bestehen überlieferte Spannungen wegen der Verehrung der Familie und ihres besonderen Herkunftsanspruchs. Eine konkret benannte Fehde, ein religiöser Bruch oder zusätzliche förmliche Allianzen sind nicht festgelegt.',
    values: [
      'Eleganz, Selbstbeherrschung, Ehre und familiäre Würde stehen im Mittelpunkt des Hausbildes. Die Morforwyn erwarten Anstand und strenge Etikette, besonders bei offiziellen Anlässen. Beleidigungen ihres Hauses empfinden sie als schwere Kränkung.',
      'Ihr elitäres Selbstverständnis verbindet diese hohen Maßstäbe mit Distanz gegenüber anderen Geschlechtern. Der Stolz auf die behauptete Abstammung erklärt ihren besonderen religiösen Anspruch, ohne die Sage in einen objektiven Nachweis göttlicher Abstammung zu verwandeln.'
    ],
    succession: 'Die überlieferte Erbfolge nennt Glanmue, Karismue, Wledmue und Cerysmue. Urumue steht gegenwärtig an der Spitze des Hauses. Ihr genauer Amtsantritt ist wegen widersprüchlicher Angaben zur jüngeren Oberhauptfolge nicht gesichert.',
    court: 'Die überlieferte Folge nennt Hafmue, Serenmue, Talfamue, Ysoltmue und Urumue. Die zwanzig bezeichneten Hofämter bleiben mangels benannter Inhaber mit Silhouetten dargestellt.',
    familyTree: 'Der bestehende Stammbaum der schwarz bewappneten Morforwyn-Stammlinie ist eingebettet. Die bereits getrennt geführten Elimue- und Marmue-Linien bleiben über ihre vorhandenen Linienverweise erreichbar.',
    historicalFigures: 'Triston und Mapnimue gehören zur Gründungssage. Hafmue ist als Gründerin und erste Baronesse überliefert; eine zusätzliche ausgearbeitete historische Figurengalerie liegt nicht vor.'
  },
  images: {
    crest: '../Stammbäume/assets/images/houses/Sonnenküste/Jungferntal/haus-morforwyn.png',
    scene: `${assetRoot}/hausdarstellung-original.png`, sceneAlt: 'Originale Morforwyn-Hausdarstellung: dunkel gerüsteter Ritter mit Meerjungfrauenwappen auf Schild und Banner',
    banner: `${assetRoot}/herrschaftsbanner-original.png`
  },
  illustrationCategory: 'Hausdarstellung', cadets: [], founder: member('hafmue-morforwyn', 'Hafmue', 'Gründerin und erste Baronesse'),
  headsNote: 'Überlieferte Folge; der genaue Amtsantritt Urumues bleibt wegen widersprüchlicher Angaben offen.',
  heads: [
    member('hafmue-morforwyn', 'Hafmue', 'Baronesse', 'Amtszeit nicht datiert'),
    member('serenmue-morforwyn', 'Serenmue', 'Baronesse', 'Amtszeit nicht datiert'),
    member('talfamue-morforwyn', 'Talfamue', 'Baronesse', 'Bis 1699'),
    member('ysoltmue-morforwyn', 'Ysoltmue', 'Baronesse', '1699–1735'),
    member('urumue-morforwyn', 'Urumue', 'Baronesse', 'Gegenwärtiges Oberhaupt · Amtsantritt offen')
  ],
  heirs: [member('glanmue-morforwyn', 'Glanmue', 'Erste Erbin'), member('karismue-morforwyn', 'Karismue', 'Zweite Erbin'), member('wledmue-morforwyn', 'Wledmue', 'Dritte Erbin'), member('cerysmue-morforwyn', 'Cerysmue', 'Vierte Erbin')],
  offices: officeRoles.map(([role, silhouette]) => ({ name: '', role, silhouette })), figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [],
  trivia: ['Der Hausname wird in der Überlieferung als „Tochter des Meeres“ gedeutet.', 'Das Haus bewahrt seine schwarz bewappnete Stammlinie und die genealogischen Linien Elimue und Marmue.'],
  currentHead: 'Urumue', firstHeir: 'Glanmue',
  relatedRecords: [
    { icon: '../Stammbäume/assets/images/houses/Sonnenküste/Jungferntal/morforwyn-linie-elimue.png', title: 'Morforwyn · Elimue-Linie', text: 'Vorhandene genealogische Nebenlinie des Hauses.', link: '../Stammb%C3%A4ume/Stammbaum.html?family=haus-morforwyn-linie-elimue&mode=view' },
    { icon: '../Stammbäume/assets/images/houses/Sonnenküste/Jungferntal/morforwyn-linie-marmue.png', title: 'Morforwyn · Marmue-Linie', text: 'Vorhandene genealogische Nebenlinie des Hauses.', link: '../Stammb%C3%A4ume/Stammbaum.html?family=haus-morforwyn-linie-marmue&mode=view' }
  ]
};
