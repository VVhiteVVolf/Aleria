// Gemeinsame, quellengebundene Fassung für Hausseite und kurze Stammbaum-Hausbio.
// Original und redaktionelle Entscheidungen: animexx-original.html / source-manifest.json.
import { HOUSE_MELOG_FAMILY as family } from '../../../../../../Stammbäume/assets/js/data/house-melog-family.js';

const treeImage = source => source && !/^(?:[a-z]+:|\/|\.\.\/)/i.test(source) ? `../Stammbäume/${source}` : source;
const bakerImage = '../AleriaAlmanach/assets/zum-honigtoertchen/figures/baecker-melog.png';
const shopLink = '../AleriaAlmanach/AleriaAlmanach.html?entry=zum-honigtoertchen';

const overview = 'Die Familie Melog ist eine alteingesessene Bürgerfamilie aus Gwynthor in Llamreis Ankunft. Seit mehreren Generationen üben ihre Angehörigen das Bäcker- und Konditorhandwerk aus. In ihrer Bäckerei und Konditorei „Zum Honigtörtchen“ bieten sie Brot und Gebäck ebenso an wie feine Kuchen, kunstvoll verzierte Torten und andere Süßspeisen. Ihre Backwaren erfreuen sich bei den Bürgern der Stadt und bei wohlhabenderen Auftraggebern großer Beliebtheit.\n\nDie Melogs gehören weder zu den reichsten noch zu den politisch einflussreichsten Familien Gwynthors. Ihr Ansehen beruht auf handwerklichem Können, Zuverlässigkeit und der Liebe zu gutem Gebäck. Ihre besondere Verbindung zu Haus Draig geht auf die Rettung einer Hochzeitsfeier im Jahr 1690 zurück.';

const history = 'Die Geschichte der Melogs ist eng mit ihrer eigenen Backstube in Gwynthor verbunden. Über mehrere Generationen gewann neben dem alltäglichen Bäckerhandwerk die Herstellung feiner Kuchen und Süßspeisen immer mehr Gewicht. Die Namen der Gründergeneration sind nicht überliefert. Ein Zeitsprung verbindet diese älteren Anfänge mit der später wieder belegten Linie um Ithel; er steht für fehlende Generationen, nicht für eine unmittelbare biologische Elternschaft. Ein genaues Gründungsjahr des Hauses oder des Geschäfts ist nicht überliefert.\n\nIm Jahr 1690 sollten Meurig Draig und Heledd Gwyvern auf Castell Draig heiraten. Am Morgen der Hochzeit stellte man fest, dass die eigens für das Fest angefertigte Hochzeitstorte spurlos verschwunden war. Die Feier stand unmittelbar bevor; für einen gewöhnlichen Ersatzauftrag blieb kaum Zeit. Die Verantwortlichen wandten sich deshalb an Ithel Melog, den damaligen Meister der Familie.\n\nIthel ließ seine übrigen Arbeiten stehen und machte sich mit seinem fünfzehnjährigen Sohn Tewdwr und den benötigten Zutaten nach Castell Draig auf. In der dortigen Hofküche fertigten Vater und Sohn innerhalb weniger Stunden eine neue Hochzeitstorte an. Trotz der knappen Zeit geriet sie so gut, dass sie bei den Hochzeitsgästen großen Anklang fand. Was die ursprüngliche Torte verschwinden ließ, erzählt die überlieferte Geschichte nicht.\n\nZum Dank überreichte Meurig Draig Ithel später ein kunstvoll gearbeitetes silbernes Tortenmesser mit dem Wappen des Hauses Draig. Das Messer befindet sich weiterhin im Besitz der Melogs und wird in der Konditorei ausgestellt. Ithel lebte von 1647 bis 1723. Sein 1675 geborener Sohn Tewdwr führt das Geschäft heute selbst und bewahrt noch immer die Rezeptur der berühmten Hochzeitstorte. Tewdwrs Geburtsjahr stimmt mit der überlieferten Altersangabe von fünfzehn Jahren bei der Hochzeit überein.\n\nDie erfolgreiche Hilfe begründete eine langjährige Verbindung zu Haus Draig. In den folgenden Jahrzehnten erhielt die Konditorei wiederholt Aufträge für Hochzeiten des Grafenhauses. Zu den bekanntesten gehören die Hochzeiten von Rhys Draig und Brona Eisenherz sowie von Alicyn Draig und Sir Egon Gafyr. Rhys und Alicyn sind Kinder Meurigs. Die Melogs griffen auf die bewährte Rezeptur zurück, gestalteten aber jede Torte neu und passten Geschmack und Verzierung an die Wünsche des jeweiligen Brautpaares an. Die Geschichte der geretteten Hochzeit wird bis heute in beiden Familien gelegentlich erzählt.';

const traditions = 'Rezepte, besondere Zubereitungsverfahren und die Erfahrungen der älteren Meister werden innerhalb der Familie weitergegeben. Wer das Handwerk erlernen möchte, soll zuerst die einfachen Arbeiten einer Backstube beherrschen. Die Sorgfalt bei den alltäglichen Aufgaben gilt damit als Grundlage für die anspruchsvollen Arbeiten der Konditorei.\n\nEine besondere Stellung besitzt die sogenannte Hochzeitstorte der Draigs. Ihr ursprüngliches Rezept von 1690 zählt zu den wertvollsten Familienrezepten. Im Laufe der Jahrzehnte veränderten sich Aussehen, Verzierungen und einzelne Zutaten. Der wesentliche Charakter der Torte soll dennoch erhalten bleiben. Jede neue Ausführung verbindet die Wünsche des Brautpaares mit der Erinnerung an die erste gerettete Feier. Die Quelle nennt keine feste Zutatenliste; eine heutige Verkaufsausführung ist daher eine neue handwerkliche Ausgestaltung.\n\nDie Anfertigung einer solchen Torte betrachten die Melogs als besondere Ehre und als Verpflichtung. Die nachfolgenden Generationen wollen dem Können ihres berühmten Vorfahren gerecht werden. Neben dem Rezept ist das silberne Tortenmesser das bedeutendste Erinnerungsstück der Familie. Es wird sorgfältig gepflegt. Die Erinnerung daran soll zeigen, dass ein einfacher Handwerker durch Können und Hilfsbereitschaft Großes bewirken kann.';

const holdings = 'Der Besitz der Familie konzentriert sich auf die Bäckerei und Konditorei „Zum Honigtörtchen“ in Gwynthor. Im Erdgeschoss liegt ein kleiner Verkaufsraum für Brot, Gebäck, Kuchen und andere Süßspeisen. Daneben befindet sich ein kleiner Gastraum. Hinter den öffentlich zugänglichen Räumen liegen die Backstube, Vorratsräume und weitere Arbeitsbereiche des Konditorhandwerks. Die oberen Geschosse beherbergen die Wohnräume der Familie.\n\nDas Haus ist gepflegt, ohne übermäßig prunkvoll zu wirken. Der Duft frischen Brotes und süßer Backwaren gehört zum Geschäft. Eine kleine Vitrine bewahrt das silberne Tortenmesser mit dem Draig-Wappen. Es ist ein persönliches Erinnerungsstück des Hauses und gehört nicht zum Verkaufssortiment. Weitere Grundstücke oder Besitzungen werden in der Familienüberlieferung nicht genannt.';

const culture = 'Die Melogs gehören zur Kultur der Cenyri und sind als bürgerliche Handwerkerfamilie fest im Alltagsleben Gwynthors verwurzelt. Gute Beziehungen zu Nachbarn, örtlichen Händlern und den Lieferanten ihrer Zutaten gehören zu ihrem Leben.\n\nSie bekennen sich zur Alerischen Kirche und verehren die Neun Göttlichen. Tharim, der Knecht, nimmt als Sinnbild ehrlicher Arbeit, des Fleißes und der Pflichterfüllung einen besonderen Platz im Familienleben ein.\n\nIhr Handwerk ist für sie mehr als eine Erwerbsquelle: Mit gutem Gebäck wollen sie anderen Menschen Freude bereiten. Hochzeiten, Geburtsfeiern und andere Festlichkeiten besitzen deshalb besonderes Gewicht in ihrer Arbeit.';

const relations = 'Die wichtigste Verbindung der Melogs besteht zu Haus Draig. Die besondere Wertschätzung des Grafenhauses geht auf die Hochzeit von Meurig Draig und Heledd Gwyvern im Jahr 1690 zurück. Wiederholte Hochzeitsaufträge festigten den Ruf der Konditorei und brachten ihr auch über Gwynthor hinaus Anerkennung. Die Quelle nennt Haus Draig als Zugehörigkeit und Lehnsherrn; eine verwandtschaftliche Verbindung zwischen beiden Familien ist damit nicht belegt.\n\nDie Melogs unterhalten keine bedeutenden politischen Bündnisse und beteiligen sich nicht an den Machtkämpfen des Adels. Die Gunst des Hauses Draig wird jedoch nicht überall wohlwollend gesehen. Unter konkurrierenden Bäckern und Konditoren gibt es Neider, die den Erfolg der Melogs eher mit der langjährigen Bevorzugung durch das Grafenhaus als mit außergewöhnlichem Können erklären. Hinter vorgehaltener Hand heißt es gelegentlich, die Familie müsse sich um wichtige Aufträge kaum noch bemühen. Diese Behauptung bleibt die Sicht der Konkurrenten.\n\nDie Melogs reagieren gewöhnlich mit Zurückhaltung. Sie verweisen lieber auf die Qualität ihrer Backwaren als auf ihre angesehenen Auftraggeber. Abseits solcher beruflichen Rivalitäten pflegen sie gute Geschäftsbeziehungen zu Müllern, Bauern, Händlern und anderen Handwerkern, von denen sie ihre Zutaten beziehen. Namen einzelner Rivalen oder Lieferanten sind nicht überliefert.';

const values = 'Fleiß, Ehrlichkeit, Zuverlässigkeit und handwerkliche Sorgfalt bilden nach dem Selbstverständnis der Melogs die Grundlagen ihres Erfolges. Ein übernommener Auftrag soll nach bestem Können erfüllt werden. Die Geschichte des Meisters, der unter schwierigsten Umständen eine Hochzeit rettete, dient den jüngeren Familienmitgliedern als Vorbild.\n\nDie Familie ist überzeugt, dass gutes Essen Menschen zusammenbringt. Ein gelungenes Gebäck kann für sie zu einer Erinnerung werden, die ein Leben lang erhalten bleibt. Der Anspruch an die Arbeit reicht deshalb vom einfachen Brot für den Alltag bis zur aufwendig gestalteten Hochzeitstorte.';

const biographySummary = {
  overview: 'Die Melogs sind eine alteingesessene bürgerliche Bäcker- und Konditorfamilie aus Gwynthor. In ihrem Geschäft „Zum Honigtörtchen“ entstehen Brot, Gebäck, Kuchen und kunstvoll verzierte Torten. Ihr Wohlstand gilt als beschaulich; ihr guter Ruf gründet auf Können und verlässlicher Arbeit. Haus Draig ist als Zugehörigkeit und Lehnsherr genannt.',
  history: '1690 verschwand am Morgen der Hochzeit von Meurig Draig und Heledd Gwyvern auf Castell Draig die vorbereitete Hochzeitstorte. Ithel Melog ließ seine übrigen Arbeiten stehen und kam mit seinem fünfzehnjährigen Sohn Tewdwr und den nötigen Zutaten zu Hilfe. In der Hofküche fertigten die beiden innerhalb weniger Stunden einen Ersatz, der bei den Gästen großen Anklang fand.\n\nMeurig schenkte Ithel zum Dank ein kunstvolles silbernes Tortenmesser mit Draig-Wappen. Ithel (1647–1723) ist inzwischen verstorben; Tewdwr (geboren 1675) führt die Konditorei heute selbst und bewahrt die Rezeptur. Später bestellten auch Rhys Draig und Brona Eisenherz sowie Alicyn Draig und Sir Egon Gafyr ihre Hochzeitstorten bei den Melogs. Rhys und Alicyn sind Kinder Meurigs. Weitere Hochzeitsjahre sind nicht genannt.',
  character: 'Fleiß, Ehrlichkeit, Zuverlässigkeit und handwerkliche Sorgfalt bestimmen das Selbstbild der Familie. Wer einen Auftrag annimmt, soll ihn nach bestem Können erfüllen. Die Melogs begegnen dem Neid konkurrierender Konditoren mit Zurückhaltung und lassen lieber die Qualität ihrer Backwaren für sich sprechen. Politische Machtkämpfe liegen ihnen fern.',
  customs: 'Rezepte und Arbeitserfahrungen werden innerhalb der Familie weitergegeben. Angehende Bäcker lernen zunächst die einfachen Arbeiten der Backstube. Das Rezept der Hochzeitstorte von 1690 wird besonders gehütet. Jede neue „Hochzeitstorte der Draigs“ soll die Wünsche des Brautpaares erfüllen und zugleich ihren überlieferten Charakter bewahren. Verzierungen, Geschmack und einzelne Zutaten dürfen sich verändern.\n\nTewdwr und Morfudd führen die heutige Familiengeneration. Morfudd kümmert sich um Buchhaltung und Finanzen. Ihre Kinder Anest, Afanen und Guto sind ebenfalls im Betrieb tätig; die Familienlinien reichen über sie bis zu Nerys, Elisedd, Teleri, Lleufer, Cerys und Iddon.',
  holdings: 'Zum Honigtörtchen besitzt einen kleinen Verkaufsraum und einen angrenzenden Gastraum im Erdgeschoss. Dahinter liegen Backstube, Vorratsräume und Arbeitsbereiche; oben wohnt die Familie. Die Einrichtung ist gepflegt und wenig prunkvoll. In einer kleinen Vitrine wird das sorgfältig gepflegte silberne Tortenmesser ausgestellt, das als bedeutendstes Erinnerungsstück der Familie gilt.',
  culture: 'Die Familie gehört zu den Cenyri und zur Alerischen Kirche. Unter den Neun Göttlichen verehrt sie besonders Tharim, den Knecht, als Sinnbild ehrlicher Arbeit und Pflichterfüllung. Die Melogs sehen in ihrem Handwerk eine Möglichkeit, Freude zu bereiten. Hochzeiten, Geburtsfeiern und andere Feste liegen ihnen deshalb besonders am Herzen.',
  relations: 'Die wiederholten Aufträge des Hauses Draig festigten den Ruf der Konditorei auch außerhalb Gwynthors. Einige Berufskonkurrenten erklären den Erfolg mit dieser Bevorzugung; ihre Ansicht bleibt eine fremde Bewertung. Zu Nachbarn, Müllern, Bauern, Händlern und anderen Handwerkern unterhalten die Melogs gute alltägliche und geschäftliche Beziehungen.',
};

const namedPersons = family.persons.filter(person => !/^Unbekannt/i.test(person.name));
const personDescriptions = {
  'person-29ef1c22': 'Ithel war Konditor- und Bäckereimeister sowie Oberhaupt der Familie. Er rettete 1690 gemeinsam mit seinem Sohn Tewdwr die Hochzeitstorte auf Castell Draig. Seine Frau ist Tangwystl.',
  'person-aaae3c9f': 'Tangwystl ist Ithels Ehefrau und Tewdwrs Mutter. Weitere persönliche Aufgaben sind in der Familienakte nicht benannt.',
  'person-0c68dade': 'Tewdwr ist der heutige Konditor- und Bäckereimeister und das Oberhaupt der Familie. Als Fünfzehnjähriger half er seinem Vater Ithel 1690 bei der Hochzeit auf Castell Draig. Er ist mit Morfudd verheiratet; ihre Kinder sind Anest, Afanen und Guto.',
  'person-30cd0b46': 'Morfudd kümmert sich um Buchhaltung und Finanzen. Sie ist Tewdwrs Ehefrau und die Mutter von Anest, Afanen und Guto.',
  'person-a5530d07': 'Anest ist Konditor- und Bäckermeisterin. Sie ist die Tochter von Tewdwr und Morfudd. Mit ihrem Ehemann Eiffion hat sie Nerys, Elisedd und Teleri.',
  'person-9ffeda8d': 'Afanen leitet den Verkauf. Sie ist die Tochter von Tewdwr und Morfudd und mit Llywarch verheiratet. Ihre Kinder heißen Lleufer und Cerys.',
  'person-a24c0d08': 'Guto arbeitet als Bäcker und wird in der Familienakte als Naschkatze beschrieben. Er ist der Sohn von Tewdwr und Morfudd und mit Mabli verheiratet. Ihr Sohn Iddon trägt ebenfalls eine Vorliebe für Süßes als Charakterbezeichnung.',
  'person-d9df75d6': 'Eiffion übernimmt Einkauf und Lieferungen. Er ist Anests Ehemann und der Vater von Nerys, Elisedd und Teleri.',
  'person-d32c2160': 'Llywarch kümmert sich um Verkauf und Gästebetreuung. Er ist Afanens Ehemann und der Vater von Lleufer und Cerys. Die Familienakte bezeichnet ihn außerdem als Mablis Bruder.',
  'person-d5f1d52b': 'Mabli übernimmt Verpackung und Einkauf. Sie ist Gutos Ehefrau und Iddons Mutter. Die Familienakte bezeichnet sie als Llywarchs Schwester; die Eltern der beiden sind nicht benannt.',
  'person-5b669286': 'Nerys ist die Tochter von Anest und Eiffion. Ihre Rollenbezeichnung in der Familienakte lautet „Chaos-Konditorin“. Elisedd und Teleri sind ihre Geschwister.',
  'person-c6293356': 'Elisedd ist der Sohn von Anest und Eiffion und wird als begabtes Allroundtalent beschrieben. Seine Geschwister heißen Nerys und Teleri.',
  'person-02518ead': 'Teleri ist die Tochter von Anest und Eiffion. Die Familienakte beschreibt sie als kleine Schauspielerin. Daraus folgt kein festes Arbeitsamt im Geschäft.',
  'person-9a399999': 'Lleufer ist Afanens und Llywarchs Sohn und Cerys’ Bruder. Die Familienakte bezeichnet ihn als eitlen Charmeur.',
  'person-4c366307': 'Cerys ist Afanens und Llywarchs Tochter und Lleufers Schwester. Die Bezeichnung „eingebildete, geschäftstüchtige Händlerin“ beschreibt ihren kindlichen Charakter und ihren Geschäftssinn; sie führt kein eigenes Ladenamt.',
  'person-157c1853': 'Iddon ist der Sohn von Guto und Mabli. „Klein-Guto“ und „Naschkatze“ sind seine überlieferten Rollenbezeichnungen.',
};
const personCard = person => ({
  id: person.id, familyId: family.document.id, name: person.name,
  role: person.title || 'Familienmitglied', image: treeImage(person.portrait), silhouette: person.sex === 'female' ? 'female' : 'male',
  detail: [person.birth ? `Geboren ${person.birth}` : '', person.status === 'dead' ? `Verstorben${person.death ? ` ${person.death}` : ''}` : ''].filter(Boolean).join(' · '),
  description: personDescriptions[person.id] || person.notes,
});
const namedCard = id => personCard(family.persons.find(person => person.id === id));
const businessPeople = ['person-30cd0b46', 'person-a5530d07', 'person-9ffeda8d', 'person-a24c0d08', 'person-d9df75d6', 'person-d32c2160', 'person-d5f1d52b'];

export const HOUSE_CONTENT = {
  id: 'melog', name: 'Familie Melog', type: 'Bürgerliches Haus', page: 'kleinehaeuser.html',
  county: 'Celtigerns Wacht', liege: 'Haus Draig', parentHouseId: '',
  territoryId: 'grafschaft-celtigerns-wacht', territoryName: 'Celtigerns Wacht',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  extinct: false, showMotto: false, registerPage: true, prepared: false,
  contentVersion: '20261105-melog-v3', biographySourceRevision: 1,
  biographyPreviousDefaultFingerprints: [], biographyManagedExternally: false,
  biographyIntroTitle: 'Über die Familie', biographyHistoryTitle: 'Die gerettete Hochzeit von 1690',
  biographySummary,
  hierarchy: [
    ['Sammlung', 'Familien Häuser und Clans', 'familien-hauser-und-clans'],
    ['Kontinent', 'Estryll', 'estryll'], ['Königreich', 'Cenyr', 'cenyr'],
    ['Grafschaft', 'Celtigerns Wacht', 'celtigerns-wacht'],
    ['Baronie', 'Llamreis Ankunft', 'llamreis-ankunft'], ['Ort', 'Gwynthor', 'gwynthor'],
    ['Familie', 'Familie Melog', 'melog'],
  ].map(([type, name, slug]) => ({ type, name, slug })),
  profile: {
    highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Bürgerliche Bäcker- und Konditorfamilie',
    motto: '', quoteAuthor: '', seat: 'Gwynthor · Zum Honigtörtchen', affiliation: 'Haus Draig', liege: 'Haus Draig',
    patron: '', knightingPatron: '', founding: 'Nicht überliefert · seit mehreren Generationen in Gwynthor',
    milestoneOne: '1690 · Hochzeitstorte für Meurig Draig und Heledd Gwyvern', milestoneTwo: '',
    people: 'Cenyri', wealth: 'Beschaulich', religion: 'Alerische Kirche', patronDeities: 'Tharim, der Knecht · die Neun Göttlichen',
    origin: 'Alteingesessene Familie aus Gwynthor', cadetBranches: '', allies: 'Haus Draig · langjährige Auftraggeber',
    enemies: 'Beruflicher Neid einzelner Konkurrenten · keine benannte Fehde',
    troopStrength: '', tiarna: '', kerns: '', fleet: '',
  },
  omitMilitaryProfile: true,
  familyTreeCompact: true,
  sectionTitles: { court: '8. Familie und Backstube', historicalFigures: '11. Die Angehörigen der Familie' },
  sections: {
    overview, history, traditions, holdings, cultureReligion: culture,
    conflictsAlliances: relations, values,
    knighthood: 'Die Melogs sind bürgerliche Handwerker. Die Wertschätzung des Hauses Draig begründet keinen überlieferten Adelstitel oder Ritterstand.',
    succession: 'Tewdwr hat die Geschäftsführung von seinem inzwischen verstorbenen Vater Ithel übernommen und ist als heutiges Oberhaupt verzeichnet. Seine Kinder Anest, Afanen und Guto arbeiten ebenfalls im Familienbetrieb. Eine bestimmte Erbfolge oder ein künftiges Oberhaupt ist nicht festgelegt.',
    court: 'Tewdwr leitet die Bäckerei und Konditorei als Konditor- und Bäckermeister. Seine Frau Morfudd führt Buchhaltung und Finanzen. Die Tochter Anest beherrscht beide Handwerke als Meisterin; Afanen leitet den Verkauf. Guto arbeitet als Bäcker. Anests Ehemann Eiffion übernimmt Einkauf und Lieferungen, Afanens Ehemann Llywarch Verkauf und Gästebetreuung. Gutos Ehefrau Mabli kümmert sich um Verpackung und Einkauf.\n\nAuch die jüngere Generation besitzt eigene Charakterzüge in der Familienakte: Nerys ist als Chaos-Konditorin beschrieben, Elisedd als begabtes Allroundtalent, Teleri als kleine Schauspielerin. Lleufer gilt dort als eitler Charmeur. Die kleine Cerys zeigt bereits ausgeprägten Geschäftssinn; „eingebildete, geschäftstüchtige Händlerin“ ist ihre Charakterbezeichnung. Iddon heißt liebevoll Klein-Guto und Naschkatze. Diese persönlichen Bezeichnungen werden nicht automatisch zu neuen Arbeitsämtern; Cerys und Iddon bleiben Kinder.\n\nDie bürgerliche Familie unterhält keinen eigenen Adelshof. Die folgenden Karten zeigen überlieferte Personen und Aufgaben. Die große Bäckerfigur ist eine eigens angefertigte handwerkliche Hausdarstellung.',
    familyTree: 'Der eingebettete Stammbaum führt sämtliche 18 gelieferten Personen: 16 namentlich bekannte Angehörige und zwei unbekannte Gründerplatzhalter. Sechs Partnerschaften, elf Abstammungsverbindungen und ein Zeitsprung bleiben erhalten. Der ältere Übergang von den Gründern zu Ithel ist als Überlieferungslücke markiert und begründet keine unmittelbare biologische Elternschaft.\n\nIthel und Tangwystl sind Tewdwrs Eltern. Tewdwr und Morfudd haben die Kinder Anest, Afanen und Guto. Anest und Eiffion sind die Eltern von Nerys, Elisedd und Teleri; Afanen und Llywarch die Eltern von Lleufer und Cerys; Guto und Mabli die Eltern von Iddon. Die Rollenbeschreibungen nennen Llywarch und Mabli als Geschwister, ohne ihre Eltern anzugeben. Die Beziehungen zu Haus Draig bleiben geschäftliche und historische Verbindungen.',
    historicalFigures: 'Alle 16 namentlich bekannten Angehörigen sind hier mit ihren gelieferten Portraits und direkten Verweisen auf die Personenkarte im Stammbaum aufgeführt. Die unbekannten Gründer bleiben ausschließlich als Platzhalter im Stammbaum erhalten.',
  },
  images: {
    crest: treeImage(family.document.emblem), scene: bakerImage, sceneHref: shopLink,
    sceneAlt: 'Bäcker- und Konditorfigur der Familie Melog · Bäckerei Zum Honigtörtchen öffnen',
    banner: '../Stammbäume/assets/images/regions/celtigerns-wacht.png',
  },
  illustrationCategory: 'Bürgerliche Bäcker- und Konditordarstellung',
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  founder: null, headsTitle: 'Überlieferte Meister der Backstube',
  headsNote: 'Ithel (1647–1723) und sein Sohn Tewdwr (geboren 1675) stehen für zwei Generationen der Backstube. Ein genauer Amtsbeginn ist nicht überliefert.',
  heads: ['person-29ef1c22', 'person-0c68dade'].map(namedCard), heirs: [], offices: businessPeople.map(namedCard), officesTitle: 'Aufgaben im Familienbetrieb', cadets: [],
  figuresTitle: 'Die Familie Melog und ihre Angehörigen', figures: namedPersons.map(person => {
    const card = personCard(person);
    return { ...card, description: [card.detail, card.description].filter(Boolean).join('. ') };
  }), figuresMobileLayout: 'stacked',
  currentHead: 'Tewdwr · Konditor- und Bäckermeister', firstHeir: '',
  allies: [{ name: 'Haus Draig', detail: 'Langjährige Auftraggeber seit der geretteten Hochzeit von 1690', image: '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-draig.png', imageFormat: 'square' }],
  relatedRecords: [{ icon: treeImage(family.document.emblem), title: 'Zum Honigtörtchen · Bäckerei und Konditorei', text: 'Räume, Verkaufssortiment und Sonderanfertigungen für Hochzeiten und andere Feste in Gwynthor.', link: shopLink }],
  trivia: [
    'Das silberne Tortenmesser mit Draig-Wappen wird im Geschäft ausgestellt und nicht zum Verkauf angeboten.',
    'Die Familienrezeptur von 1690 bildet den Ausgangspunkt für immer neue, auf das Brautpaar abgestimmte Hochzeitstorten.',
    'Ithels Sohn Tewdwr war bei der geretteten Hochzeit fünfzehn Jahre alt und führt das Geschäft heute selbst.',
  ],
};
