import { HOUSE_AURDDEN_FAMILY as family } from '../../../../../../Stammbäume/assets/js/data/house-aurdden-family.js';
import { AURDDEN_FAMILY_PEOPLE } from '../../../../../../Stammbäume/assets/js/data/aurdden-people.js';

const treeImage = source => source ? `../Stammbäume/${source}` : '';
const card = source => ({
  id: source.id, familyId: family.document.id, name: source.name, role: source.title,
  image: treeImage(source.portrait), silhouette: source.sex === 'female' ? 'female' : 'male',
  detail: source.death ? `${source.birth}–${source.death}` : `${source.birth} · ${source.age} Jahre`, description: source.notes
});
const personCard = id => card(AURDDEN_FAMILY_PEOPLE.find(person => person.id === id));
const overview = 'Die Aurdden sind eine wohlhabende bürgerliche Goldschmiede-, Juwelier- und Bankfamilie aus Gwynthor. Sie dienen unmittelbar dem ritterlichen Haus Loer. Dessen Rohmaterial, die Gewinnbeteiligung und wiederkehrende familiäre Verbindungen tragen ein seit Langem beschriebenes wirtschaftliches Bündnis. Während die Loer den Zugang zu Metallen und Edelsteinen sichern, übernehmen die Aurdden Bewertung, Veredelung und Verkauf.\n\nDie drei Brüder Kyrwyn, Thalan und Saithen führen gemeinsam den Sternenfang, Gwynthors vornehmsten Juwelier im Komplex der Klingenden Münze. Kostbare Oberflächen, sorgfältig beleuchtete Auslagen und diskrete Beratung entsprechen dem Anspruch der Familie. Ihre Arbeiten reichen von schlichtem, ausgezeichnet verarbeitetem Schmuck bis zu ausgesprochen prachtvollen Einzelanfertigungen. Der gesonderte Bankzweig wird von ihrem ersten Vetter Pereth geführt.';
const history = 'Die historischen Gründer sind unbekannt. Erst nach einer ausdrücklich offenen Überlieferungslücke beginnt die namentlich ausgearbeitete Familie mit Heledric Aurdden (1636–1728) und Lleirwen (1640–1731). Ihre Söhne Iwrwyn und Oeneth begründen die beiden heute sichtbaren Arbeitszweige. Iwrwyn und Brenella haben drei Söhne und zwei Töchter; Oeneth und Rhewae den Sohn Pereth.\n\nNach dem Tod Iwrwyns 1736 und Brenellas 1737 liegt der Juwelier in den Händen ihrer drei Söhne. Der 55-jährige Kyrwyn entwirft und führt, der 51-jährige Thalan verantwortet Werkstatt und Edelsteine, der 46-jährige Saithen Verkauf und Sonderaufträge. Kyrwyn hat vier Töchter, Thalan zwei Söhne und eine Tochter, Saithen sechs eheliche Kinder. Aus einer früheren Affäre Saithens stammt außerdem Cyrion, dessen Mutter unbekannt bleibt.\n\nKyrwyns älteste Tochter Avelin ist 1740 mit Aeron Loer verlobt. Die beiden Schwestern der Brüder, Cyrwen und Lleirena, sind bereits an unbekannte Männer wegverheiratet. Weder die Schwestern noch Avelin oder Cyrion arbeiten im Juwelier. Die übrigen jungen Angehörigen sind unverheiratet und unverlobt.';
const values = 'Schönheit soll durch präzise Arbeit entstehen. Fassungen müssen halten, Schliffe dem Stein entsprechen und Kundenwünsche ehrlich eingeschätzt werden. Reichtum zeigt sich im Haus sichtbar, doch hinter jeder aufwendigen Präsentation stehen geordnete Auftragsbücher, klare Zuständigkeiten und die Geduld der Werkstatt.';
const holdings = 'Der Sternenfang vereint Verkauf, diskrete Kundenberatung und Goldschmiedearbeit in Gwynthor. Der Bankzweig bleibt ein eigener Arbeitsbereich unter Pereth und Uffyria; er erhält aus seiner Verwandtschaft keinen Juwelierposten. Die Aurdden besitzen kein eigenes Münzprägerecht. Dieses liegt allein bei den Loer; die Leitung der Roten Bank bleibt bei den Ergalla. Größe des Familienvermögens, weitere Gebäude und Landbesitz sind nicht beziffert.';
const relations = 'Die unmittelbare Dienst- und Geschäftsbindung gilt Haus Loer. Avelin Aurdden (27) und Aeron Loer (28) sind verlobt; ihre Ehe ist noch nicht geschlossen. Die älteren Loer-Ehen bleiben unverändert. Cyrwen und Lleirena sind an unbekannte Ehemänner und Häuser wegverheiratet. Pereth ist über die Brüder Iwrwyn und Oeneth ein echter erster Vetter der drei Ladenführer.';

export const HOUSE_CONTENT = {
  id: 'haus-aurdden', name: 'Familie Aurdden', type: 'Bürgerliches Haus', page: 'kleinehaeuser.html',
  county: 'Celtigerns Wacht', liege: 'Haus Loer', parentHouseId: '',
  territoryId: 'grafschaft-celtigerns-wacht', territoryName: 'Celtigerns Wacht',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  extinct: false, showMotto: true, registerPage: true, prepared: false,
  contentVersion: '20261109-aurdden-v1', biographySourceRevision: 1,
  biographyIntroTitle: 'Über die Aurdden', biographyHistoryTitle: 'Goldschmiede und Bankzweig',
  biographySummary: {
    overview: 'Wohlhabende bürgerliche Goldschmiede-, Juwelier- und Bankfamilie aus Gwynthor im unmittelbaren Dienst der Loer. Die drei Brüder Kyrwyn, Thalan und Saithen führen den Sternenfang, Gwynthors vornehmsten Juwelier in der Klingenden Münze. Ihr erster Vetter Pereth betreut den gesonderten Bankzweig.',
    history: 'Unbekannte Gründer und ein serieller Überlieferungssprung gehen Heledric (1636–1728) und Lleirwen (1640–1731) voraus. Ihr Sohn Iwrwyn und Brenella sind die bereits verstorbenen Eltern der drei Juweliersbrüder und ihrer beiden wegverheirateten Schwestern. Der jüngere Sohn Oeneth und Rhewae begründen Pereths Bankzweig.',
    character: values, customs: 'Handwerkliche Genauigkeit, diskrete Beratung und sichtbar kostbare Präsentation prägen das Haus. Junge Angehörige lernen unter Aufsicht; eine Verwandtschaft allein verleiht keinen Meisterrang.',
    holdings, relations
  },
  hierarchy: [
    ['Sammlung', 'Familien Häuser und Clans', 'familien-hauser-und-clans'],
    ['Kontinent', 'Estryll', 'estryll'], ['Königreich', 'Cenyr', 'cenyr'],
    ['Grafschaft', 'Celtigerns Wacht', 'celtigerns-wacht'], ['Baronie', 'Llamreis Ankunft', 'llamreis-ankunft'],
    ['Ort', 'Gwynthor', 'gwynthor'], ['Familie', 'Familie Aurdden', 'haus-aurdden']
  ].map(([type, name, slug]) => ({ type, name, slug })),
  profile: {
    highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Goldschmiede-, Juwelier- und Bankfamilie',
    motto: 'Was die Tiefe birgt, bringen wir ans Licht.', quoteAuthor: '', seat: 'Gwynthor',
    affiliation: 'Klingende Münze', liege: 'Haus Loer', patron: '', knightingPatron: '',
    founding: 'Unbekannt', milestoneOne: '', milestoneTwo: '', people: 'Cenyri',
    wealth: 'Sehr wohlhabend · Gwynthors vornehmster Juwelier', religion: '', patronDeities: '',
    origin: 'Gwynthor', cadetBranches: 'Juwelierzweig und gesonderter Bankzweig',
    allies: 'Haus Loer', enemies: '', troopStrength: '', tiarna: '', kerns: '', fleet: ''
  },
  omitMilitaryProfile: true, familyTreeCompact: true,
  sectionTitles: { court: '8. Juwelierzweig und Bankzweig', historicalFigures: '11. Die Angehörigen der Aurdden' },
  sections: {
    overview, history, values, holdings,
    traditions: 'Für besondere Aufträge werden Entwurf, Material und Ausführung sorgfältig abgestimmt. Juwelierarbeit und Bankgeschäft bleiben bei der Aufgabenverteilung getrennt. Der neue Wahlspruch lautet: „Was die Tiefe birgt, bringen wir ans Licht.“',
    knighthood: 'Die Aurdden sind eine wohlhabende Bürgerfamilie im Dienst des Ritterhauses Loer. Aus dem Reichtum, dem Dienst oder der Verlobung entsteht keine eigene ritterliche Rangstufe.',
    succession: 'Die drei Brüder leiten den Juwelier gemeinsam. Für die nächste Generation ist keine feste geschäftliche Nachfolge beschlossen. Die Banklinie führt Pereth mit Uffyria; ihre Kinder sind nicht mit Ladenämtern versehen.',
    cultureReligion: 'Die Familie ist in Gwynthors cenyrischem Handwerks- und Handelsleben verwurzelt. Das runde Wappen zeigt einen goldenen Schwan und drei Saphirsterne auf Purpur: Licht über dunklem Wasser. Ein eigener Kult oder eine besondere religiöse Befugnis ist nicht festgelegt.',
    conflictsAlliances: relations,
    court: 'Kyrwyn verantwortet Entwurf und Leitung, Thalan Werkstatt und Edelsteine, Saithen Beratung und Sonderaufträge. Avelena, Firwen und Perdella haben eigene Aufgaben im Juwelier; ältere Kinder arbeiten oder lernen unter Aufsicht. Die jüngsten Kinder besitzen keine selbstständigen Ladenposten. Zwei aldrimarische Söldner bewachen den Laden als fremde Beschäftigte. Pereth, Uffyria und ihre Kinder gehören ausschließlich zum Bankzweig.',
    familyTree: 'Unbekanntes Gründerpaar → Hausknoten → ein serieller Zeitsprung → Heledric und Lleirwen. Von deren Söhnen Iwrwyn und Oeneth gehen der Juwelier- und der Bankzweig aus. Der Bankzweig ist bis zu Pereths drei Kindern ausgearbeitet, bleibt jedoch vorerst ohne Porträts. Die Verlobung Avelins mit Aeron wird in beiden Herkunftsakten mit denselben Identitäts- und Beziehungsschlüsseln geführt.',
    historicalFigures: 'Die folgenden Karten enthalten alle 33 benannten Familienangehörigen. Unbekannte Gründer, Ehemänner und Cyrions unbekannte Mutter bleiben unbenannte Platzhalter im Stammbaum.'
  },
  images: { crest: treeImage(family.document.emblem), scene: treeImage(AURDDEN_FAMILY_PEOPLE.find(person => person.id === 'kyrwyn-aurdden').portrait),
    sceneAlt: 'Kyrwyn Aurdden, 55 Jahre · Goldschmied und ältester der drei Juweliersbrüder', banner: '../Stammbäume/assets/images/regions/celtigerns-wacht.png' },
  illustrationCategory: 'Bürgerliches Familienporträt · Kyrwyn Aurdden',
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  founder: null, headsTitle: 'Die drei Juweliersbrüder', headsNote: 'Gemeinsame Leitung desselben Geschäfts.',
  heads: ['kyrwyn-aurdden', 'thalan-aurdden', 'saithen-aurdden'].map(personCard), heirs: [],
  officesTitle: 'Juwelier und eigener Bankzweig', offices: ['avelena-spouse-aurdden', 'firwen-spouse-aurdden', 'perdella-spouse-aurdden', 'pereth-aurdden', 'uffyria-spouse-aurdden'].map(personCard),
  currentHead: 'Kyrwyn, Thalan und Saithen Aurdden', firstHeir: '', cadets: [],
  allies: [{ name: 'Haus Loer', detail: 'Unmittelbarer Dienstherr · Rohstoffe und Gewinnbeteiligung · Avelins Verlobung mit Aeron', image: '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-loer.png', imageFormat: 'square', href: 'kleinehaeuser.html?haus=haus-loer' }],
  figuresTitle: 'Die Familie Aurdden', figuresMobileLayout: 'stacked',
  figures: AURDDEN_FAMILY_PEOPLE.map(source => { const entry = card(source); return { ...entry, description: `${entry.detail}. ${entry.description.replace(/^\d+ Jahre\.\s*/, '')}` }; }),
  relatedRecords: [{ title: 'Der Sternenfang', text: 'Goldschmiede und Juwelier der Aurdden in Gwynthor.', link: '../AleriaAlmanach/AleriaAlmanach.html?entry=der-sternenfang-aurdden', icon: '../AleriaAlmanach/assets/loer-hofjuwelier/schild.png' }],
  trivia: ['Der Bankvetter ist über die Brüder Iwrwyn und Oeneth mit den drei Ladenführern verwandt.', 'Nur Avelin ist in der jungen Generation verlobt; sie arbeitet nicht im Laden.', 'Die Aurdden besitzen kein Münzprägerecht und leiten nicht die Rote Bank.']
};
