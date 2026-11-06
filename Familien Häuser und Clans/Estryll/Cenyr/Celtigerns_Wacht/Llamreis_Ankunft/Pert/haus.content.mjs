// Gemeinsame Hausquelle: gelieferter Prosatext + kanonische pert.json.
// Originale und Quellenentscheidungen bleiben neben dieser Datei erhalten.
import { HOUSE_PERT_FAMILY as family } from '../../../../../../Stammbäume/assets/js/data/house-pert-family.js';

const treeImage = source => source && !/^(?:[a-z]+:|\/|\.\.\/)/i.test(source) ? `../Stammbäume/${source}` : source;
const farmName = 'Maesglas';
const overview = `Die Familie Pert ist eine alteingesessene bürgerliche Familie aus Gwynthor. Ihre Angehörigen stehen seit Generationen im Dienst des Hauses Draig oder arbeiten in der Landwirtschaft. Bekannt sind die Perts für zuverlässige Küchenmeister, Vorratsverwalter und Waffenknechte sowie für ihre Verbindung zum Hof ${farmName}.\n\nDie Familie besteht gegenwärtig aus zwei eng verbundenen Zweigen: Der eine arbeitet überwiegend auf Castell Draig, der andere bewirtschaftet den Hof in der Umgebung Gwynthors. Adelstitel und besondere politische Macht besitzen die Perts nicht. Ihr Ansehen beruht auf Zuverlässigkeit, Fleiß und langjähriger Treue zum Haus Draig.\n\nAls Familienzeichen führen sie ein goldenes Füllhorn, umgeben von Früchten, Getreide und weiteren landwirtschaftlichen Erzeugnissen. Es steht für Versorgung, Fruchtbarkeit und den Wohlstand, den ehrliche Arbeit hervorbringt.`;

const history = `Über mehrere Generationen übernahmen Angehörige der Familie Aufgaben im Haushalt und in der Dienerschaft von Castell Draig. Die Namen der Gründergeneration sind nicht überliefert; der Stammbaum bewahrt diese älteren Anfänge als unbekannte Platzhalter und verbindet sie über einen Zeitsprung mit der später wieder belegten Linie. Ein Gründungsjahr wird nicht genannt.\n\nZu den bedeutenden Angehörigen der älteren Generation zählt Iorwerth Pert (1666–1715). Als Brotmeister des Hauses Draig war er für die Verwaltung und Versorgung der Vorratskammern verantwortlich. Seine Gemahlin Gwerfyl, geboren 1668, übernahm das Amt der Küchenmeisterin und wurde zu einer festen Größe im Burgpersonal.\n\nIorwerths Bruder Idwal, geboren 1670, verband seinen Lebensweg mit der Landwirtschaft. Durch seine Ehe mit Mared Maesglas (1672–1724), der letzten Überlebenden ihrer Herkunftsfamilie und Erbin eines Hofes, gelangte das Anwesen in die Familie. Der Hof wurde zum Mittelpunkt des landwirtschaftlichen Zweiges. Idwals und Mareds Kinder sind Geraint und Sioned.\n\nIm Jahr 1720 traf der Krieg gegen Ceitheach die Familie schwer: Goronvy Pert und seine Gemahlin Lowri fielen im Dienst des Hauses Draig. Beide gehörten zu dessen Leibgarde. Die Hausgeschichte schreibt den Namen Goronwy; die Personenkarte bewahrt die Schreibweise Goronvy aus der gelieferten Familienakte. Die Kinder Kevan und Rhiain fanden anschließend Schutz bei den Verwandten. Rhiain blieb bei der Großmutter Gwerfyl auf Castell Draig. Kevan fand bei Geraint und Bethan auf Hof ${farmName} ein neues Zuhause.\n\nIn den folgenden Jahren entwickelten sich beide Zweige weiter. Geraint übernahm die Bewirtschaftung des Hofes. Auf Castell Draig führt Rhiain als Brotmeister bereits Aufgaben einer neuen Generation in der Burgversorgung fort. Kevan ist heute als Waffenknecht des Hauses Draig verzeichnet. Die Aufnahme der verwaisten Kinder bleibt ein besonders deutliches Beispiel für den Zusammenhalt der Familie.`;

const traditions = `Die Perts besitzen keine ausgeprägten zeremoniellen Hausbräuche nach Art der adeligen Geschlechter Cenyres. Ihre Gewohnheiten wachsen aus dem Alltag, dem Dienst auf Castell Draig und der Arbeit in der Landwirtschaft.\n\nGemeinsame Mahlzeiten und familiäre Zusammenkünfte sind ihnen wichtig. Der gedeckte Tisch steht für Gastfreundschaft und Zusammengehörigkeit. Auch entfernte Verwandte dürfen darauf vertrauen, auf Hof ${farmName} oder bei Angehörigen in Gwynthor willkommen zu sein.\n\nKinder werden früh mit den Aufgaben der Erwachsenen vertraut gemacht. Dabei zählt weniger die Festlegung auf einen bestimmten Beruf als die Fähigkeit, Verantwortung zu übernehmen und eine begonnene Arbeit gewissenhaft zu Ende zu führen.\n\nGegenseitige Hilfe gehört zum Selbstverständnis der Familie. Gerät jemand in Schwierigkeiten, unterstützen die übrigen Perts nach ihren Möglichkeiten. Die Aufnahme Kevans und Rhiains nach dem Tod ihrer Eltern zeigt, wie ernst sie diese Verpflichtung nehmen.`;

const holdings = `Der bedeutendste Besitz der Familie ist Hof ${farmName}, ein landwirtschaftliches Anwesen in der Umgebung von Gwynthor. Er gelangte durch Mared Maesglas in die Familie. Heute bewirtschaften ihr Sohn Geraint Pert und seine Gemahlin Bethan den Hof.\n\nZum Anwesen gehören landwirtschaftliche Nutzflächen, Stallungen und Wirtschaftsgebäude. Neben dem Ackerbau sind Viehzucht und Rinderhaltung sowie die Pferdehaltung wichtig. Geraints Schwester Sioned kümmert sich besonders um Rinder und Milchwirtschaft. Ihr Lebensgefährte Donnchadh betreut die Pferde und die Stallungen.\n\nDer auf Castell Draig tätige Zweig besitzt keinen vergleichbaren landwirtschaftlichen Betrieb. Seine wirtschaftliche Grundlage bilden die Anstellungen und Einkünfte im Dienst des Hauses Draig. Weitere Grundstücke, Lehensrechte oder ein adeliges Herrschaftsgebiet werden für die Perts nicht benannt.`;

const culture = 'Die Perts gehören zur Kultur der Cenyri und bekennen sich zur Alerischen Kirche. Ihr Alltag verbindet das landwirtschaftliche Leben in der Umgebung Gwynthors mit den Aufgaben des Burgpersonals auf Castell Draig. Ein bestimmter Familienpatron oder eigene religiöse Riten sind in den gelieferten Angaben nicht benannt.';

const relations = `Die wichtigste Verbindung besteht zum Haus Draig. Sie beruht auf einer über Generationen gewachsenen Dienstbeziehung und gegenseitigem Vertrauen. Angehörige der Familie arbeiteten in verantwortungsvollen Aufgaben des Burgpersonals; andere dienten als Waffenknechte oder in der Leibgarde im unmittelbaren Umfeld der Draigs.\n\nDie Perts verfolgen keine eigenen politischen Ambitionen und beteiligen sich nicht an den Machtkämpfen des Adels. Offene Fehden oder dauerhafte Rivalitäten mit anderen Familien sind nicht bekannt.\n\nDer Krieg gegen Ceitheach im Jahr 1720 hinterließ mit dem Tod Goronvys und Lowris persönliche Wunden. Zugleich fand mit Donnchadh ein Mann ceitheachischer Herkunft auf Hof ${farmName} eine neue Heimat und Familie. Diese Verbindung zeigt, dass die Perts politische Feindschaften von der Begegnung mit einzelnen Menschen unterscheiden können. Seine Herkunft begründet keine neue Fehde innerhalb der Familie.`;

const values = 'Die Perts verstehen ihre Familie als Gemeinschaft, in der niemand allein gelassen wird. Verwandtschaft bedeutet für sie nicht nur gemeinsame Abstammung, sondern auch gegenseitige Verantwortung.\n\nGewissenhaft ausgeführte Arbeit besitzt einen hohen Stellenwert, gleichgültig ob jemand eine Burgküche leitet, auf dem Feld arbeitet oder als Waffenknecht dient. Ein gegebenes Wort soll gehalten werden. Besonders im Dienst des Hauses Draig zählt Zuverlässigkeit zu den wichtigsten Tugenden. Daraus erwächst der beschauliche Wohlstand und das gute Ansehen der Familie.';

const personDescriptions = {
  'person-cde44b00': 'Iorwerth war Brotmeister des Hauses Draig und kümmerte sich um Verwaltung und Versorgung der Vorratskammern. Er war mit Gwerfyl verheiratet und ist Goronvys Vater. Idwal ist sein Bruder.',
  'person-02756f76': `Idwal ist Iorwerths Bruder. Durch seine Ehe mit der Hoferbin Mared Maesglas gelangte der Hof ${farmName} in die Familie. Ihre Kinder heißen Geraint und Sioned.`,
  'person-e6511832': 'Gwerfyl arbeitet als Küchenmeisterin des Hauses Draig. Sie ist Iorwerths Gemahlin und Goronvys Mutter. Nach dem Tod von Goronvy und Lowri nahm sie Rhiain auf Castell Draig in ihre Obhut.',
  'person-dcc5c8f4': `Mared Maesglas ist als letzte Überlebende ihrer Herkunftsfamilie und als Hoferbin verzeichnet. Durch ihre Ehe mit Idwal wurde Hof ${farmName} Teil des Familienbesitzes. Ihre Kinder sind Geraint und Sioned.`,
  'person-1f86b441': 'Goronvy gehörte zur Leibgarde des Hauses Draig. Er und seine Gemahlin Lowri fielen 1720 im Krieg gegen Ceitheach. Kevan und Rhiain sind ihre Kinder. Die Hausgeschichte verwendet für ihn auch die Schreibweise Goronwy.',
  'person-ab6f684c': 'Lowri diente in der Leibgarde des Hauses Draig. Sie fiel 1720 gemeinsam mit ihrem Gemahl Goronvy im Krieg gegen Ceitheach. Ihre Kinder Kevan und Rhiain wurden anschließend von Verwandten aufgenommen.',
  'person-4506547d': `Geraint ist Hofbesitzer und bewirtschaftet mit Bethan den Hof ${farmName}. Er ist Idwals und Mareds Sohn und Sioneds Bruder. Nach dem Tod von Kevans Eltern boten Geraint und Bethan ihm ein neues Zuhause. Ihre eigenen Kinder heißen Goleuddydd, Lleian, Canna und Iolo.`,
  'person-4ee10c57': `Sioned ist Idwals und Mareds Tochter sowie Geraints Schwester. Auf Hof ${farmName} betreut sie besonders Rinder und Milchwirtschaft. Donnchadh ist ihr Lebensgefährte. Roísin wird als Sioneds legitimierte Tochter geführt; ihr Vater ist nicht benannt.`,
  'person-cada9cd4': `Bethan kümmert sich um den Haushalt auf Hof ${farmName}. Sie ist mit Geraint verheiratet und Mutter von Goleuddydd, Lleian, Canna und Iolo. Gemeinsam mit Geraint nahm sie Kevan nach dem Tod seiner Eltern auf.`,
  'person-35fdbd7b': `Donnchadh stammt aus Ceitheach und fand auf Hof ${farmName} eine neue Heimat. Als Stallmeister betreut er Pferde und Stallungen. Er ist Sioneds Lebensgefährte.`,
  'person-52becf61': `Kevan ist Goronvys und Lowris Sohn und Rhiains Bruder. Nach dem Tod der Eltern im Jahr 1720 wuchs er bei Geraint und Bethan auf Hof ${farmName} auf. Er ist als Waffenknecht des Hauses Draig verzeichnet.`,
  'person-3a869794': 'Rhiain ist Goronvys und Lowris Tochter und Kevans Schwester. Nach dem Tod der Eltern blieb sie bei ihrer Großmutter Gwerfyl auf Castell Draig und übernimmt heute als Brotmeister Aufgaben in der Burgversorgung.',
  'person-da2c039f': 'Goleuddydd ist Geraints und Bethans Tochter. Die Familienakte beschreibt ihre starke Fixierung auf Kevan mit der Rollenbezeichnung „Besessen von Kevan“. Daraus wird keine Partnerschaft oder weitere Beziehung ergänzt.',
  'person-f61ee33a': 'Lleian ist eine Tochter von Geraint und Bethan. Goleuddydd, Canna und Iolo sind ihre Geschwister. Ein eigener Beruf oder ein Amt ist in der Familienakte nicht benannt.',
  'person-cf926021': 'Canna ist ein Kind von Geraint und Bethan. Goleuddydd, Lleian und Iolo sind die Geschwister. Weitere Aufgaben oder eine spätere berufliche Laufbahn sind nicht festgelegt.',
  'person-96cdce72': `Iolo ist Geraints und Bethans Sohn und als Erbe des Hofes ${farmName} verzeichnet.`,
  'person-618119d8': 'Roísin wird als Sioneds legitimierte Tochter geführt. Ihr Vater ist nicht benannt.',
};

const namedPersons = family.persons.filter(person => !/^Unbekannt/i.test(person.name));
const personCard = person => ({
  id: person.id, familyId: family.document.id, name: person.name,
  role: person.title || 'Familienmitglied', image: treeImage(person.portrait),
  silhouette: person.sex === 'female' ? 'female' : person.sex === 'male' ? 'male' : undefined,
  detail: [person.birth ? `Geboren ${person.birth}` : '', person.status === 'dead' ? `Verstorben${person.death ? ` ${person.death}` : ''}` : ''].filter(Boolean).join(' · '),
  description: personDescriptions[person.id] || person.notes,
});
const namedCard = id => personCard(family.persons.find(person => person.id === id));

export const HOUSE_CONTENT = {
  id: 'pert', name: 'Familie Pert', type: 'Bürgerliches Haus', page: 'kleinehaeuser.html',
  county: 'Celtigerns Wacht', liege: 'Haus Draig', parentHouseId: '',
  territoryId: 'grafschaft-celtigerns-wacht', territoryName: 'Celtigerns Wacht',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  extinct: false, showMotto: false, registerPage: true, prepared: false,
  contentVersion: '20261106-pert-v1', biographySourceRevision: 1, biographyPreviousDefaultFingerprints: [], biographyManagedExternally: false,
  biographyIntroTitle: 'Über die Familie', biographyHistoryTitle: 'Zwischen Burgdienst und Landwirtschaft',
  biographySummary: {
    overview: `Die Perts sind eine alteingesessene bürgerliche Familie aus Gwynthor. Seit Generationen arbeiten ihre Angehörigen für das Haus Draig oder in der Landwirtschaft. Ein Zweig dient auf Castell Draig, der andere bewirtschaftet Hof ${farmName}. Der beschauliche Wohlstand und das Ansehen der Familie beruhen auf Fleiß, Zuverlässigkeit und Treue; Adelstitel oder eigene politische Macht besitzt sie nicht.`,
    history: `Iorwerth Pert (1666–1715) verwaltete als Brotmeister die Vorratskammern des Hauses Draig. Seine Gemahlin Gwerfyl, geboren 1668, ist Küchenmeisterin auf Castell Draig. Iorwerths Bruder Idwal, geboren 1670, heiratete Mared Maesglas (1672–1724), die Erbin eines Hofes. So wurde das Anwesen zum Mittelpunkt des landwirtschaftlichen Familienzweiges.\n\n1720 fielen Goronvy und Lowri im Krieg gegen Ceitheach. Beide dienten in der Leibgarde des Hauses Draig. Ihre Kinder wurden innerhalb der Familie aufgenommen: Rhiain blieb bei der Großmutter Gwerfyl auf Castell Draig, Kevan fand bei Geraint und Bethan auf Hof ${farmName} ein neues Zuhause. Heute ist Rhiain als Brotmeister und Kevan als Waffenknecht des Hauses Draig verzeichnet. Die unbekannten älteren Gründer sind im Stammbaum über einen Zeitsprung mit den wieder belegten Generationen verbunden.`,
    character: 'Ein gegebenes Wort soll gehalten und eine übernommene Arbeit gewissenhaft beendet werden. Ob Burgküche, Feldarbeit oder Dienst als Waffenknecht: Für die Perts zählt die verlässlich ausgeführte Aufgabe. Sie verfolgen keine eigenen politischen Ambitionen und kennen keine überlieferte dauerhafte Familienfehde.',
    customs: `Gemeinsame Mahlzeiten stehen für Gastfreundschaft und Zusammengehörigkeit. Auch entfernte Verwandte sind auf dem Hof oder bei den Angehörigen in Gwynthor willkommen. Kinder werden mit den Aufgaben der Erwachsenen vertraut gemacht, ohne dass ihr späterer Beruf festgelegt wird. Gerät jemand in Not, helfen die übrigen Familienmitglieder nach ihren Möglichkeiten.`,
    holdings: `Hof ${farmName} umfasst Acker- und Nutzflächen, Stallungen und Wirtschaftsgebäude. Mareds Sohn Geraint und seine Gemahlin Bethan bewirtschaften das Anwesen. Sioned ist vor allem für Rinder und Milchwirtschaft zuständig, ihr Lebensgefährte Donnchadh für Pferde und Stallungen. Geraints Sohn Iolo ist als Hoferbe verzeichnet. Der Burgzweig lebt dagegen von Anstellungen und Einkünften im Dienst des Hauses Draig.`,
    culture: 'Die Perts sind Cenyri und gehören der Alerischen Kirche an. Besondere Familienpatrone oder eigene religiöse Riten sind nicht genannt. Ihr goldenes Füllhorn mit Früchten und Getreide versinnbildlicht Versorgung, Fruchtbarkeit und den Ertrag ehrlicher Arbeit.',
    relations: `Das Vertrauen des Hauses Draig ist ihre wichtigste gewachsene Verbindung. Obwohl der Krieg gegen Ceitheach der Familie schwere Verluste brachte, fand der ceitheachische Donnchadh auf Hof ${farmName} eine neue Heimat. Die Perts unterscheiden politische Feindschaften von einzelnen Menschen und lassen Angehörige in einer Notlage nicht allein.`,
  },
  hierarchy: [
    ['Sammlung', 'Familien Häuser und Clans', 'familien-hauser-und-clans'], ['Kontinent', 'Estryll', 'estryll'],
    ['Königreich', 'Cenyr', 'cenyr'], ['Grafschaft', 'Celtigerns Wacht', 'celtigerns-wacht'],
    ['Baronie', 'Llamreis Ankunft', 'llamreis-ankunft'], ['Ort', 'Gwynthor', 'gwynthor'], ['Familie', 'Familie Pert', 'pert'],
  ].map(([type, name, slug]) => ({ type, name, slug })),
  profile: {
    highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Bürgerliche Dienst- und Bauernfamilie', motto: '', quoteAuthor: '',
    seat: `Gwynthor · Castell Draig und Hof ${farmName}`, affiliation: 'Haus Draig', liege: 'Haus Draig', patron: '', knightingPatron: '',
    founding: 'Nicht überliefert · seit Generationen in Gwynthor', milestoneOne: '1720 · Goronvy und Lowri fallen im Krieg gegen Ceitheach', milestoneTwo: '',
    people: 'Cenyri', wealth: 'Beschaulich', religion: 'Alerische Kirche', patronDeities: '', origin: 'Gwynthor und Umgebung', cadetBranches: '',
    allies: 'Haus Draig · langjährige Dienstbeziehung', enemies: 'Keine bekannte Fehde', troopStrength: '', tiarna: '', kerns: '', fleet: '',
  },
  omitMilitaryProfile: true, familyTreeCompact: true,
  sectionTitles: { court: '8. Die beiden Familienzweige', historicalFigures: '11. Die Angehörigen der Familie' },
  sections: {
    overview, history, traditions, holdings, cultureReligion: culture, conflictsAlliances: relations, values,
    knighthood: 'Die Perts sind bürgerlichen Standes. Dienst als Waffenknecht oder Leibgardist des Hauses Draig begründet keinen eigenen Adelstitel. Für die Familie ist keine eigene Herrschaftsverwaltung oder Ritterordnung überliefert.',
    succession: `Iolo ist als Hoferbe des landwirtschaftlichen Zweiges verzeichnet. Ein Oberhaupt oder eine förmliche Nachfolgeordnung der gesamten Familie ist nicht benannt. Der Dienst auf Castell Draig und die Hofnachfolge bleiben unterschiedliche Aufgaben.`,
    court: `Auf Castell Draig steht die Versorgung im Mittelpunkt: Iorwerth war Brotmeister, Gwerfyl ist Küchenmeisterin. Rhiain führt als Brotmeister Aufgaben der jüngeren Generation fort. Goronvy und Lowri dienten in der Leibgarde, bevor sie 1720 fielen. Kevan ist als Waffenknecht des Hauses Draig verzeichnet.\n\nAuf Hof ${farmName} bewirtschaften Geraint und Bethan das Anwesen. Sioned betreut besonders Rinder und Milchwirtschaft, Donnchadh Pferde und Stallungen. Die Familienzweige bleiben eng verbunden; die Aufnahme Kevans auf dem Hof und Rhiains in Gwerfyls Obhut zeigt den gegenseitigen Rückhalt.\n\nGeraint und Bethan haben vier Kinder: Goleuddydd, Lleian, Canna und Iolo. Iolo ist Hoferbe. Sioned ist als Mutter Roísins verzeichnet.`,
    familyTree: 'Der Stammbaum führt beide Familienzweige mit ihren Angehörigen, Ehen und Kindern zusammen. Die Namen der älteren Gründer sind unbekannt; ein Zeitsprung kennzeichnet die Überlieferungslücke vor den wieder belegten Generationen um Iorwerth und Idwal.\n\nRoísin wird als legitimierte Tochter Sioneds geführt. Ihr Vater ist nicht benannt.',
    historicalFigures: 'Die folgenden Karten zeigen alle 17 namentlich bekannten Angehörigen mit ihren gelieferten Portraits und direkten Verweisen auf die Personenkarte im Stammbaum. Die unbekannten Gründer bleiben als Platzhalter im Stammbaum. Geraint und Donnchadh besitzen in der Quelle dieselbe Bildvorlage, bleiben aber ausdrücklich verschiedene Personen.',
  },
  images: {
    crest: treeImage(family.document.emblem), scene: 'Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Pert/assets/pert-bauer.png',
    sceneAlt: 'Bauerndarstellung der Familie Pert nach Geraints geliefertem Portrait',
    banner: '../Stammbäume/assets/images/regions/celtigerns-wacht.png',
  },
  illustrationCategory: 'Bürgerliche Bauerndarstellung',
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  founder: null, heads: [], heirs: [namedCard('person-96cdce72')],
  officesTitle: 'Versorgung, Landwirtschaft und Dienst',
  offices: ['person-e6511832', 'person-3a869794', 'person-52becf61', 'person-4506547d', 'person-cada9cd4', 'person-4ee10c57', 'person-35fdbd7b'].map(namedCard),
  cadets: [], currentHead: '', firstHeir: 'Iolo · Hoferbe',
  figuresTitle: 'Die Familie Pert und ihre Angehörigen', figuresMobileLayout: 'stacked',
  figures: namedPersons.map(person => {
    const card = personCard(person);
    return { ...card, description: [card.detail, card.description].filter(Boolean).join('. ') };
  }),
  allies: [{ name: 'Haus Draig', detail: 'Generationenlange Dienstbeziehung und gegenseitiges Vertrauen', image: '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-draig.png', imageFormat: 'square' }],
  trivia: [
    'Das goldene Füllhorn steht für Versorgung, Fruchtbarkeit und den durch ehrliche Arbeit geschaffenen Wohlstand.',
    `Die Familie verbindet Burgdienst auf Castell Draig mit der Landwirtschaft auf Hof ${farmName}.`,
    'Nach den Kriegsverlusten von 1720 wuchsen Kevan und Rhiain in der Obhut unterschiedlicher Zweige ihrer Familie auf.',
  ],
};
