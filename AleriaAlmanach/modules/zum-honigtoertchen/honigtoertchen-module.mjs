import {
  HONIGTOERTCHEN_ART, HONIGTOERTCHEN_ID, HONIGTOERTCHEN_PROFILE,
  MELOG_BAKER, MELOG_EMBLEM, MELOG_FAMILY_LINK, MELOG_HOUSE_LINK
} from './honigtoertchen-profile.mjs';
import { MELOG_PEOPLE, melogConnection, melogPerson } from './honigtoertchen-people.mjs';
import { buildHonigtoertchenHierarchy } from './honigtoertchen-hierarchy.mjs';
import { buildHonigtoertchenCatalog } from './honigtoertchen-catalog.mjs';
import { buildHonigtoertchenServices } from './honigtoertchen-services.mjs';
import { HONIGTOERTCHEN_ROOMS } from './honigtoertchen-rooms.mjs';

const paragraphs = (...texts) => texts.map(text => `<p>${text}</p>`).join('');
const scene = id => ({ image: `${HONIGTOERTCHEN_ART}/scenes/${id}.png`, imageWidth: 33,
  imageTall: true, imageFit: 'cover', imagePosition: 'center' });

function buildBusinessPage() {
  return {
    pageTitle: 'Das Haus · Melog & die gerettete Hochzeit', commentThreadKey: 'honigtoertchen-hausgeschichte',
    guildPage: true, ...scene('backstube'), stats: structuredClone(HONIGTOERTCHEN_PROFILE),
    guild: {
      crestImage: MELOG_EMBLEM, portraitFormat: 'square',
      biographyTitle: 'Ein guter Name aus Mehl, Honig und Arbeit',
      biographyText: paragraphs(
        'Die Melogs sind eine alteingesessene Bürgerfamilie aus Gwynthor. Seit mehreren Generationen üben sie das Bäcker- und Konditorhandwerk aus; feine Kuchen, kunstvolle Torten und süßes Gebäck haben ihren Namen weit über die gewöhnliche Brotversorgung hinaus bekannt gemacht.',
        'Die Familie zählt weder zu Gwynthors reichsten noch zu seinen mächtigsten Häusern. Ihr beschaulicher Wohlstand beruht auf handwerklichem Können und verlässlicher Arbeit. Die Einrichtung der Bäckerei ist gepflegt, aber nicht übermäßig prunkvoll. Verkauf und kleiner Gastraum liegen im Erdgeschoss, dahinter Backstube und Vorräte; oben wohnt die Familie.'),
      abilitiesTitle: 'Die Handschrift der Melogs',
      abilities: [
        { title: 'Das Handwerk', icon: '../IconOrdner/ZunftsWappen/Bäcker.png', detail: 'Brot, kleine Backwaren und feine Konditorei teilen sich die Backstube. Tewdwr und Anest tragen die Meisterschaft des Familienhandwerks weiter.' },
        { title: 'Ein übernommenes Versprechen', icon: '../IconOrdner/Fazit Icons/Handschlag.png', detail: 'Fleiß, Ehrlichkeit, Zuverlässigkeit und Sorgfalt gelten der Familie als Grundlage eines guten Auftrags.' },
        { title: 'Freude am gemeinsamen Tisch', icon: '../IconOrdner/Etablissement Icons/Schale.PNG', detail: 'Hochzeiten, Geburtsfeiern und andere Festlichkeiten haben einen besonderen Platz in der Arbeit des Hauses.' }
      ],
      historyTitle: '1690 · Eine Hochzeit ohne Torte',
      historyText: paragraphs(
        'Am Morgen der Hochzeit von Meurig Draig und Heledd Gwyvern war auf Castell Draig die vorbereitete Hochzeitstorte spurlos verschwunden. Die Feier stand unmittelbar bevor. In dieser Lage wandte man sich an den damaligen Meister Ithel Melog.',
        'Ithel ließ seine übrige Arbeit stehen und ging mit den benötigten Zutaten und seinem fünfzehnjährigen Sohn Tewdwr nach Castell Draig. In der dortigen Hofküche fertigten Vater und Sohn innerhalb weniger Stunden einen Ersatz an. Die neue Torte fand großen Anklang unter den Hochzeitsgästen.',
        'Meurig Draig schenkte Ithel später ein kunstvoll gearbeitetes silbernes Tortenmesser mit dem Wappen des Hauses Draig. Heute liegt es als Erinnerungsstück in der Vitrine der Konditorei. Es gehört der Familie und steht nicht zum Verkauf.',
        'Ithel starb 1723. Tewdwr führt inzwischen das Geschäft und bewahrt die Rezeptur der berühmten Torte. Die Erzählung lebt sowohl bei den Melogs als auch im Haus Draig fort. Wiederkehrende Hochzeitsaufträge festigten den Ruf des Familienbetriebs.'),
      worksTitle: 'Zwischen Alltagsbrot und Festtafel', works: [
        'Frisches Brot und kleine herzhafte Backwaren für den gewöhnlichen Tag.',
        'Honigtörtchen, Obstgebäck, ganze Kuchen und kleine Mitgaben.',
        'Vorbestellte Hochzeitstorten, Festgebäck und persönliche Zierarbeit.',
        'Verkauf, ein kleiner Gastraum und die eigene Backstube im selben Haus.'
      ],
      connectionsTitle: 'Die Familie und ihre Aufgaben',
      connections: MELOG_PEOPLE.map(person => melogConnection(person.name)),
      contractsTitle: 'Bestellen im Honigtörtchen', contracts: [
        { title: 'Die alltägliche Auslage', icon: '../IconOrdner/ZunftsWappen/Bäcker.png', text: 'Afanen leitet den Verkauf. Vorhandene Ware wird nach der im Güterregister genannten Einheit ausgewählt; ganze Kuchen und größere Mengen werden vorbestellt.' },
        { title: 'Der besondere Auftrag', icon: '../IconOrdner/Brief.PNG', text: 'Tewdwr und Anest prüfen den gewünschten Entwurf. Morfudd hält die finanzielle Seite zusammen; Eiffion, Mabli und Llywarch verbinden Einkauf, Verpackung, Lieferung und Gästebetreuung.' }
      ],
      triviaTitle: 'Was man über das Haus erzählt', trivia: [
        'Das silberne Draig-Tortenmesser erinnert an den entscheidenden Einsatz von Vater und Sohn im Jahr 1690.',
        'Die Rezeptur der berühmten Hochzeitstorte wird in der Familie bewahrt.',
        'Manche konkurrierenden Bäcker erklären sich den Erfolg lieber mit Draigs Gunst. Die Melogs begegnen dem gewöhnlich mit Zurückhaltung und guter Arbeit.'
      ],
      documentsTitle: 'Haus und Herkunft', documents: [
        { title: 'Die ausführliche Hausgeschichte', text: 'Geschichte, Werte, Besitz und Beziehungen der Familie Melog.', icon: MELOG_EMBLEM, link: MELOG_HOUSE_LINK },
        { title: 'Der Stammbaum Melog', text: 'Die Gründerüberlieferung, Ithels Familie und die nachfolgenden Generationen.', icon: MELOG_EMBLEM, link: MELOG_FAMILY_LINK },
        { title: 'Haus Draig', text: 'Die Familie der Hochzeit von 1690 und ihrer späteren Auftraggeber.', icon: '../IconOrdner/Länder und Häuser Icons/Haus Draig/Haus Draig.png', link: '../Familien Häuser und Clans/haus.html?haus=haus-draig' }
      ],
      footer: 'Die Neun Göttlichen · Tharim, der Knecht, als Vorbild ehrlicher Arbeit'
    }
  };
}

function buildMasterPage() {
  const master = melogPerson('Tewdwr');
  return {
    pageTitle: 'Tewdwr Melog · Meister & Familienoberhaupt', commentThreadKey: 'honigtoertchen-tewdwr',
    biographyPage: true, image: MELOG_BAKER, imageWidth: 32, imageTall: true, imageFit: 'contain', imagePosition: 'center',
    stats: [['Name', 'Tewdwr Melog'], ['Geburt', master.birth], ['Handwerk', 'Konditor- und Bäckermeister'],
      ['Gemahlin', 'Morfudd'], ['Kinder', 'Anest, Afanen und Guto'], ['Vater', 'Ithel · 1647–1723']],
    biography: {
      portrait: master.portrait,
      biographyTitle: 'Vom fünfzehnjährigen Helfer zum Meister',
      biographyText: paragraphs(
        'Tewdwr wurde 1675 als Sohn von Ithel und Tangwystl geboren. Als er 1690 seinen Vater in die Hofküche von Castell Draig begleitete, war er fünfzehn Jahre alt. Gemeinsam ersetzten sie die verschwundene Hochzeitstorte für Meurig Draig und Heledd Gwyvern.',
        'Heute führt er als Konditor- und Bäckermeister das Honigtörtchen und steht dem Haus Melog vor. Das ausgestellte silberne Messer und die bewahrte Rezeptur verbinden seine heutige Arbeit mit jener Erinnerung.'),
      abilitiesTitle: 'Wofür er im Haus steht', abilities: [
        { title: 'Ein gelerntes Handwerk', icon: '../IconOrdner/ZunftsWappen/Bäcker.png', detail: 'Tewdwr führt die Bäcker- und Konditortradition der Familie fort.' },
        { title: 'Eine bewahrte Rezeptur', icon: '../IconOrdner/Zutatenbuch.PNG', detail: 'Die berühmte Hochzeitstorte gehört zum überlieferten Können des Familienbetriebs.' },
        { title: 'Verlässliche Arbeit', icon: '../IconOrdner/Big Traits/Trait_diligent.png', detail: 'Die Geschichte von 1690 dient den jüngeren Melogs als Vorbild für einen übernommenen Auftrag.' }
      ],
      historyTitle: 'Drei Kinder, viele Hände',
      historyText: paragraphs(
        'Mit Morfudd hat Tewdwr drei Kinder: Anest, Afanen und Guto. Morfudd betreut Buchhaltung und Finanzen. Anest ist selbst Konditor- und Bäckermeisterin; Afanen führt den Verkauf, Guto arbeitet als Bäcker.',
        'Anests Gemahl Eiffion kümmert sich um Einkauf und Lieferungen. Afanens Gemahl Llywarch betreut Verkauf und Gäste. Mabli, Gutos Gemahlin und Llywarchs Schwester, übernimmt Verpackung und Einkauf. Die jüngere Generation bringt mit Nerys, Elisedd, Teleri, Lleufer, Cerys und Iddon ihre eigenen Begabungen und Eigenheiten in das Familienleben.'),
      worksTitle: 'Im Betrieb', works: ['Leitung von Bäckerei und Konditorei.', 'Pflege des überlieferten Familienhandwerks.', 'Prüfung besonderer Tortenaufträge zusammen mit der Backstube.'],
      connectionsTitle: 'Die nächste Familie', connections: ['Tangwystl', 'Morfudd', 'Anest', 'Afanen', 'Guto', 'Ithel'].map(melogConnection),
      documentsTitle: 'Die Familie Melog', documents: [
        { title: 'Tewdwr im Stammbaum', text: 'Eltern, Ehe und Nachkommen mit den gelieferten Personenkennungen.', icon: MELOG_EMBLEM, link: `${MELOG_FAMILY_LINK}&person=${master.id}` },
        { title: 'Die Hausgeschichte', text: 'Vom Familienhandwerk zur Erinnerung an die Draig-Hochzeit.', icon: MELOG_EMBLEM, link: MELOG_HOUSE_LINK }
      ], footer: 'Zum Honigtörtchen · Gwynthor'
    }
  };
}

export function buildHonigtoertchen() {
  const pages = [
    {
      pageTitle: 'Zum Honigtörtchen', commentThreadKey: 'honigtoertchen-ueberblick', ...scene('aussenansicht'),
      stats: structuredClone(HONIGTOERTCHEN_PROFILE),
      description: paragraphs(
        'Der Duft von Brot, Butter und süßem Gebäck gehört zu diesem Haus in <strong>Gwynthor</strong>. Die Bäckerei und Konditorei <strong>Zum Honigtörtchen</strong> ist das Eigentum der Familie Melog: ein kleiner Verkaufsraum, ein gemütlicher Gastraum und dahinter die arbeitende Backstube. Über dem Geschäft liegen die Wohnräume der Familie.',
        'Tewdwr Melog führt das Handwerk seines Vaters Ithel fort. Seine Familie steht für sorgfältig gebackene Kuchen, kunstvolle Torten und zuverlässige Festaufträge. Zwischen einfachen Broten und den feinen kleinen Törtchen findet sich eine Auslage für viele Geldbeutel.',
        'Ein silbernes Tortenmesser in der Vitrine erinnert an die Hochzeit von Meurig Draig und Heledd Gwyvern im Jahr 1690. Als die ursprüngliche Torte verschwand, sprangen Ithel und sein fünfzehnjähriger Sohn Tewdwr ein. Die Geschichte prägt bis heute den Ruf des Hauses.',
        'Die folgenden Seiten stellen Familie und Arbeitsbereiche vor. Im Güterregister stehen 24 vollständig beschriebene Backwaren; besondere Wünsche, Hochzeitstorten, Lieferungen und Festtafeln werden auf einer eigenen Dienstleistungsseite besprochen. Die Räume des Geschäfts und die Wohnstube in der oberen Etage lassen sich als Szenen bespielen.')
    },
    buildBusinessPage(), buildMasterPage(),
    { pageTitle: 'Die Menschen · Aufgaben im Honigtörtchen', commentThreadKey: 'honigtoertchen-personal',
      hierarchyPage: true, hierarchy: buildHonigtoertchenHierarchy() },
    { pageTitle: 'Sortiment · Brot, Kuchen & Festtorten', commentThreadKey: 'honigtoertchen-sortiment',
      tradeCatalogPage: true, tradeCatalog: buildHonigtoertchenCatalog() },
    buildHonigtoertchenServices(),
    ...HONIGTOERTCHEN_ROOMS.map(room => ({
      pageTitle: room.title, commentThreadKey: `honigtoertchen-szene-${room.id}`, sessionPage: true,
      ...scene(room.id), sessionIntro: room.intro, sessionHint: room.hint,
      sessionLocation: `Zum Honigtörtchen · ${room.title} · Gwynthor`,
      sessionEmptyTitle: room.emptyTitle, sessionEmptyText: room.emptyText,
      sessionDateAleria: { year: null, month: null, day: null }
    }))
  ];
  return {
    id: HONIGTOERTCHEN_ID, title: 'Zum Honigtörtchen', subtitle: 'Bäckerei & Konditorei · Familie Melog in Gwynthor',
    type: 'Bäckerei & Konditorei', category: 'Gwynthor-Stadt · Geschäfte', icon: '❧', stamp: 'GWYNTHOR · HAUS MELOG',
    image: `${HONIGTOERTCHEN_ART}/scenes/aussenansicht.png`, previewImage: `${HONIGTOERTCHEN_ART}/scenes/aussenansicht.png`,
    symbol: MELOG_EMBLEM, schemaVersion: 1, multipage: true, appendCommentsPage: false, enablePageComments: true,
    sessionCast: MELOG_PEOPLE.filter(person => !person.death).map(person => person.worldPersonId),
    pages: pages.map(page => ({ schemaVersion: 1, ...page }))
  };
}
