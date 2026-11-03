// Gemeinsame redaktionelle Quelle; Quellenentscheidungen stehen im Hausordner.
// Genealogische Tabellen und Stammbaumgrafik des Originals werden nicht importiert.
import { HOUSE_ILYUNCU_PORTRAITS } from '../../../../../../Stammbäume/assets/js/data/house-ilyuncu-portraits.js';

const assetRoot = 'Estryll/Cenyr/Tal_der_Milane/Schwalbenhort/Haus_Ilyuncu/assets';
const portrait = id => HOUSE_ILYUNCU_PORTRAITS[id] ? `../Stammbäume/${HOUSE_ILYUNCU_PORTRAITS[id]}` : '';
const member = (id, name, role, detail = '') => ({ id, familyId: 'haus-ilyuncu', name, role, detail, image: portrait(id) });
const officeRoles = [
  ['Vogt', 'male'], ['Schatzmeister', 'female'], ['Kommandant der Garde', 'male'],
  ['Zeremonienmeister', 'female'], ['Mundschenk', 'male'], ['Waffenmeister', 'male'],
  ['Stallmeister', 'female'], ['Kerkermeister', 'male'], ['Jagdmeister', 'female'],
  ['Hafenmeister', 'male'], ['Küchenmeister', 'male'], ['Brotmeister', 'female'],
  ['Handwerksmeister', 'male'], ['Gartenmeister', 'female'], ['Hofmeister', 'male'],
  ['Hofdame', 'female'], ['Archivar', 'male'], ['Hoffalkner', 'female'], ['Zwingermeister', 'male']
];

export const HOUSE_CONTENT = {
  id: 'haus-ilyuncu', name: "Haus Ilyuncu O'Caer Gwennol", type: 'Ritterfürstenhaus', page: 'haus.html',
  county: 'Tal der Milane', liege: "Haus Aderyn O'Penbryn", territoryId: 'schwalbenhort', territoryName: 'Schwalbenhort',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Tal der Milane/Herrschaft Schwalbenhort/Herrschaft Schwalbenhort.html',
  parentHouseId: 'haus-aderyn', extinct: false, showMotto: false, registerPage: true, prepared: false,
  contentVersion: '20261103-tal-der-milane-v1', biographySourceRevision: 3, biographyPreviousDefaultFingerprints: [],
  biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte des Hauses',
  biographySummary: {
    overview: 'Haus Ilyuncu O’Caer Gwennol ist ein junges Ritterfürstenhaus im Schwalbenhort der Grafschaft Tal der Milane. Es entstand als Kadettenzweig der Aderyn und bleibt deren Lehensordnung verbunden. Merfyn Aderyn begründete die neue Herrschaft nach dem Krieg gegen Caisil; Caer Gwennol bildet ihren Stammsitz.',
    history: 'Nach der Schlacht am Roten Berge beauftragte Gareth Aderyn seinen Onkel Merfyn, die Burg Caer Gwennol erneut zu sichern und zu besiedeln. Anlass war die stark gewachsene Zahl der Eistrolle in der Umgebung. Merfyn erhielt für diese Aufgabe die ritterliche Herrschaft und das Recht, ein eigenes Kadettenhaus zu begründen. Die bestehende Hausakte führt ihn seit 1720 als Gründer und Ritterfürsten. Ein älteres eigenständiges Ilyuncu-Geschlecht wird nicht vorausgesetzt.',
    character: 'Die Stellung des Hauses verbindet seine enge Herkunft aus den Aderyn mit dem Auftrag, den neuen Sitz zu sichern. Ein eigener Leitspruch ist nicht überliefert. Ebenso beschreibt die Hausquelle noch keinen ausgearbeiteten, vom cenyrischen Rittertum abweichenden Ehrenkodex.',
    customs: 'Die Ilyuncu gelten noch als zu jung für eigene gewachsene Haustraditionen. Eine ausdrücklich beschriebene Gemeinsamkeit mit den Aderyn ist die Vogelhaltung. Während die Aderyn Rotmilane halten, wählen die Ilyuncu die Schwalben der umliegenden Wälder und Gebirge. Die Schwalbe erscheint auch im Hauswappen und auf der überlieferten Ritterdarstellung.',
    holdings: 'Mehrere Minen im Gebirge bilden eine wichtige Grundlage des Wohlstands. Dem kleinen Haus fehlen allerdings genügend eigene Arbeitskräfte, um sämtliche Vorkommen selbst zu bewirtschaften. Deshalb beschäftigt es die Pickenden Spechte mit dem Abbau. Die Bergwerke machen die Ilyuncu trotz ihrer geringen Größe zu einem wohlhabenden Haus.',
    culture: 'Die Hausquelle ordnet die Familie den Cenyri und Talcenyri sowie der Alerischen Kirche zu. Ihr Rittertum folgt dem beschriebenen cenyrischen Vorbild: Ritterschlag und Salbung an einem Gewässer, Eide auf die Neun Göttlichen und ein zusätzlicher Eid auf die Dame der See.',
    relations: 'Haus Sliabh steht als niederes Ritterherrenhaus unter Ilyuncu. An der Spitze der Ilyuncu steht weiterhin Merfyn; die überlieferte Erbfolge nennt Gildas, Bynthan, Bevan und Marvin. Eigene Fehden und förmliche Bündnisse sind bisher nicht ausgearbeitet.'
  },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  allies: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
    { type: 'Grafschaft', name: 'Tal der Milane', slug: 'tal-der-milane' },
    { type: 'Region', name: 'Schwalbenhort', slug: 'schwalbenhort' },
    { type: 'Sitz', name: 'Caer Gwennol', slug: 'caer-gwennol' },
    { type: 'Haus', name: "Haus Ilyuncu O'Caer Gwennol", slug: 'haus-ilyuncu' }
  ],
  profile: {
    highestTitle: 'Ritterfürst', rank: 'Ritterfürst', houseType: 'Ritterfürstenhaus', motto: '', quoteAuthor: '',
    seat: 'Caer Gwennol', affiliation: 'Schwalbenhort · Tal der Milane', liege: "Haus Aderyn O'Penbryn",
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '1720', milestoneOne: '', milestoneTwo: '',
    patron: '', knightingPatron: '', people: 'Cenyri, Talcenyri', wealth: 'Hoch', religion: 'Alerische Kirche',
    patronDeities: '', origin: 'Kadettenzweig des Hauses Aderyn', cadetBranches: '', allies: '', enemies: ''
  },
  omitMilitaryProfile: true,
  sections: {
    overview: [
      'Die Ilyuncu sind ein junges Adelshaus von Caer Gwennol im Schwalbenhort. Als Kadettenzweig der Aderyn stehen sie in enger Verbindung mit dem Grafenhaus des Tals der Milane. Der eigene Hausname und die ritterliche Herrschaft entstanden erst nach dem Krieg gegen Caisil.',
      'Die Herrschaft verbindet die Sicherung eines erneut besiedelten Burgsitzes mit der Bewirtschaftung der umliegenden Gebirgsminen. Ihre geringe Größe steht einem hohen Wohlstand aus dem Bergbau gegenüber.'
    ],
    history: [
      'Nach der Schlacht am Roten Berge bat Gareth Aderyn seinen Onkel Merfyn, die Burg Caer Gwennol neu zu sichern und zu besiedeln. Die Zahl der Eistrolle in der Umgebung war stark gestiegen. Die erneute Sicherung des Sitzes und die Besiedlung waren der konkrete Auftrag, aus dem die Herrschaft hervorging.',
      'Sir Merfyn erhielt dafür die ritterliche Herrschaft und die Gründung eines eigenen Kadettenhauses. Die bestehende Hausakte führt ihn seit 1720 als Gründer und Ritterfürsten.'
    ],
    traditions: 'Die Quelle beschreibt die Ilyuncu als noch zu jung für eigene gefestigte Haustraditionen. Eine ausdrückliche Besonderheit ist dennoch die Vogelhaltung: Statt der Rotmilane der Aderyn halten sie Schwalben, die in den Wäldern und Gebirgen ihrer Heimat vorkommen. Die Schwalbe ist zugleich ein Motiv des Hauswappens.',
    knighthood: [
      'Das cenyrische Rittertum hat seine Wurzeln in Avallorn. Zum Ritterstand gehört die Salbung: An einem See oder einem anderen Gewässer empfängt der Knappe den Ritterschlag und wird gesalbt.',
      'Der Ritter schwört je einen Eid auf die Neun Göttlichen und verpflichtet sich zu ihren Tugenden. Ein zehnter Eid gilt der Dame der See, der Schutzgöttin Cenyrs. Die gelieferte Hausdarstellung zeigt einen gerüsteten Ritter mit Schwalbenmotiv und einem Vogel auf der Schulter.'
    ],
    holdings: [
      'Die Ilyuncu besitzen mehrere Minen im Gebirge. Für die Bewirtschaftung aller Vorkommen fehlen dem kleinen Haus jedoch genügend eigene Arbeitskräfte. Deshalb beschäftigt es die Pickenden Spechte mit dem Abbau.',
      'Diese Einnahmen begründen den hohen Wohlstand des jungen Hauses. Weitere benannte Güter oder einzelne Minenstandorte sind in der Hausquelle nicht ausgearbeitet.'
    ],
    cultureReligion: 'Die Ilyuncu werden den Cenyri und Talcenyri zugerechnet und gehören der Alerischen Kirche an. Die Quelle beschreibt keine besondere Auswahl von Hauspatronen. Die Verehrung der Neun Göttlichen und der Dame der See erscheint im überlieferten Ritterritus.',
    conflictsAlliances: 'Das Haus stammt aus den Aderyn und steht unter deren Lehensherrschaft. Haus Sliabh ist als niederes Ritterherrenhaus sein unmittelbarer Vasall. Die Pickenden Spechte werden für den Bergbau beschäftigt; daraus wird kein zusätzliches politisches Bündnis abgeleitet. Eigene förmliche Allianzen und Fehden sind bisher nicht benannt.',
    values: 'Die Sicherung und erneute Besiedlung Caer Gwennols sind der belegte Gründungsauftrag. Darüber hinaus nennt die Quelle keinen ausgearbeiteten eigenen Wertekanon und keinen verbindlichen Hausleitspruch.',
    succession: 'Die überlieferte Erbfolge nennt Gildas, Bynthan, Bevan und Marvin. Die Reihenfolge bleibt erhalten; sämtliche Karten verweisen auf bereits vorhandene Angehörige.',
    court: 'Merfyn Aderyn steht seit 1720 an der Spitze des Hauses. Die Hofübersicht nennt zwanzig Ämter, aber nur einen Amtsinhaber: Hofkaplan Reese. Die übrigen Besetzungen bleiben unbenannt.',
    familyTree: 'Der bereits ausgearbeitete Ilyuncu-Stammbaum ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.',
    historicalFigures: 'Eine gesonderte Überlieferung historischer Persönlichkeiten ist in der Quelle nicht ausgearbeitet.'
  },
  images: {
    crest: '../Stammbäume/assets/images/houses/Tal der Milane/Schwalbenhort/haus-ilyuncu.png',
    scene: `${assetRoot}/hausdarstellung-original.png`, sceneAlt: 'Überlieferte Hausdarstellung der Ilyuncu: gerüsteter Ritter mit Schwalbenmotiv und Vogel auf der Schulter',
    banner: `${assetRoot}/herrschaftsbanner-original.png`
  },
  illustrationCategory: 'Hausdarstellung', cadets: [],
  founder: member('merfyn-aderyn', 'Merfyn Aderyn', 'Gründer', 'Gründung des Hauses 1720'),
  heads: [member('merfyn-aderyn', 'Merfyn Aderyn', 'Ritterfürst', 'Seit 1720')],
  heirs: [
    member('gildas-ilyuncu', 'Gildas Ilyuncu', 'Erster Erbe'),
    member('brynthan-ilyuncu', 'Bynthan Ilyuncu', 'Zweiter Erbe'),
    member('bevan-ilyuncu', 'Bevan Ilyuncu', 'Dritter Erbe'),
    member('marvin-ilyuncu', 'Marvin Ilyuncu', 'Vierter Erbe')
  ],
  offices: [
    ...officeRoles.slice(0, 14).map(([role, silhouette]) => ({ role, name: '', silhouette })),
    { role: 'Hofkaplan', name: 'Reese', image: `${assetRoot}/hofkaplan-reese-original.png`, detail: 'In der Hausquelle namentlich genannt' },
    ...officeRoles.slice(14).map(([role, silhouette]) => ({ role, name: '', silhouette }))
  ],
  figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [],
  trivia: [
    'Die Schwalbenhaltung unterscheidet die Ilyuncu von den Rotmilane haltenden Aderyn.',
    'Die Pickenden Spechte bewirtschaften Gebirgsminen für das Haus.'
  ],
  currentHead: 'Merfyn Aderyn', firstHeir: 'Gildas Ilyuncu'
};
