import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';
import { RESALE_PEOPLE, RESALE_FAMILY_ID } from '../../../Stammbäume/assets/js/data/gwynthor-horse-resale/resale-family.mjs';
import { RESALE_ART, buildResaleCatalog } from './resale-catalog.mjs';
import { buildResaleHierarchy } from './resale-hierarchy.mjs';
import { buildResaleEconomy } from './resale-economy.mjs';
export const RESALE_MODULE_ID = 'zum-schiefen-nagel-ruddgraen';
export const RESALE_SIGN = `${RESALE_ART}/signs/schiefer-nagel-schild-v1.png`;
const illustration = room => ({ image: `${RESALE_ART}/scenes/ruddgraen-${room}-v1.png`, imageWidth: 36, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
const familyLink = `../Stammbäume/Stammbaum.html?family=${RESALE_FAMILY_ID}&mode=view`;
const rooms = [
  ['verkaufsraum', 'Verkaufsraum', 'Unter dem schief aufgehängten Nagelschild führt die Tür in einen kleinen Raum mit Schreibtisch, zwei Hockern und einem Regal für Kaufzettel. Edryssas Vorratsliste liegt neben dem geschlossenen Verkaufsbuch. Durch die Tür zum Hof hört man das Scharren eines Pferdes; für große Reden ist hier ebenso wenig Platz wie für große Gesellschaften.'],
  ['stall', 'Stall', 'Vier einfache Boxen und eine kurze Stallgasse reichen für den wechselnden Bestand des kleinen Pferdehandels. Die Balken sind alt, die Einstreu frisch. Neu angekaufte Tiere werden zunächst getrennt beobachtet. An den Boxen stehen die Namen der Einzelpferde auf abnehmbaren Holztafeln; ihre Plätze wechseln mit den Verkäufen.'],
  ['ankaufshof', 'Ankaufshof', 'Der kleine Hof ist breit genug, um ein Pferd an der Hand vorzuführen und seine Bewegungen zu beurteilen. Gestampfter Boden, ein alter Trog und geflickte Tore bestimmen das Bild. Hier kommen Bauern, Söldner und Reisende mit Tieren an, für die sie selbst keine Verwendung mehr haben. Ein Kauf wird erst nach geklärter Übergabe und besprochener Eignung festgehalten.']
];
export function buildResaleModule() {
  const owner = RESALE_PEOPLE[0];
  const entry = { id: RESALE_MODULE_ID, title: 'Zum Schiefen Nagel', subtitle: 'Familie Ruddgraen · günstige Gebrauchsmischlinge', type: 'Gestüt · Pferdeankauf und Weiterverkauf',
    category: 'Gwynthor-Stadt', symbol: RESALE_SIGN, icon: '♞', stamp: 'ZUM SCHIEFEN NAGEL · RUDDGRAEN', ...illustration('verkaufsraum'),
    previewImage: illustration('verkaufsraum').image, schemaVersion: 1, multipage: true, appendCommentsPage: false, enablePageComments: true,
    sessionCast: RESALE_PEOPLE.map(p => p.worldPersonId), pages: [
      { pageTitle: 'Zum Schiefen Nagel', commentThreadKey: 'ruddgraen-einleitung', ...illustration('verkaufsraum'),
        description: '<p>Ein schiefer Nagel, ein einfach gemalter Pferdekopf und ein brummiger Empfang: Bei den Ruddgraen findet man günstige Gebrauchsmischlinge aus zweiter Hand. Brannoc, Edryssa und ihre vier Kinder kaufen von Bauern, Söldnern und Reisenden an, beobachten die Pferde und verkaufen sie weiter.</p><p>Es gibt weder eigene Zucht noch Sattlerei. Gefragt sind kräftige Körper, brauchbare Gewöhnung und ein bezahlbarer Preis.</p>',
        stats: [['Ort', 'Gwynthor-Stadt'], ['Inhaber', owner.name], ['Betrieb', 'Sechsköpfiger Familienhaushalt'], ['Angebot', 'Angekaufte Gebrauchsmischlinge']] },
      { pageTitle: 'Gestütsbio · Der kleine Pferdehandel', commentThreadKey: 'ruddgraen-betriebsbio', biographyPage: true, ...illustration('ankaufshof'), biography: {
        biographyTitle: 'Ankauf, Prüfung und Weiterverkauf', biographyText: '<p>Zum Schiefen Nagel ist die günstige Alternative zu den großen Gwynthorer Gestüten. Die Familie unterhält einen kleinen Stadtstall und kauft einzelne Pferde unmittelbar von ihren bisherigen Haltern. Manche stammen vom Bauernhof, andere aus einem aufgelösten Gepäckzug oder von einer aufgegebenen Handelsroute.</p><p>Die Tiere werden beobachtet, gepflegt und im Hof vorgestellt. Ein unbekannter Stammbaum wird nicht durch die Vermutung ersetzt, ein Tier sehe einer bestimmten Rasse ähnlich. Hier verkauft man ausschließlich Mischlinge ohne gesicherten Elternnachweis.</p><p>Eigene Fohlen, Deckdienste, gepachtete Zuchtsiedlungen oder eine Sattlerwerkstatt gehören nicht zum Betrieb. Erforderliche Hufpflege und tierheilkundliche Hilfe werden nach Bedarf beauftragt.</p>',
        worksTitle: 'Arbeitsbereiche', works: ['Ankauf von Bauern, Fuhrleuten, Söldnern und Reisenden', 'Herkunftsfragen, Gesundheitsbeobachtung und Kaufzettel', 'Gewöhnung, Vorführung und Beratung zu einfachen Arbeitsaufgaben', 'Vorübergehende Stallhaltung und Weiterverkauf'],
        documentsTitle: 'Familie', documents: [{ title: 'Familie Ruddgraen', text: 'Brannoc und Edryssa mit ihren drei erwachsenen Töchtern und dem jüngsten Sohn.', link: familyLink }],
        footer: 'Kleiner Stadtbetrieb · keine eigene Zucht · keine Sattlerei' } },
      { pageTitle: 'Inhaber · Brannoc Ruddgraen', commentThreadKey: 'ruddgraen-inhaber', biographyPage: true, image: owner.portrait, imageWidth: 36, imageTall: true, imageFit: 'cover',
        biography: { biographyTitle: `${owner.name} · 57 Jahre`, biographyText: `<p>${owner.notes}</p><p>Brannoc bevorzugt Pferde, deren Eignung sich im Hof zeigen lässt. An langen Verkaufslobreden hat er wenig Freude. Seine Familie bremst vorschnelle Ankäufe, führt die Bücher und hält den täglichen Betrieb zusammen.</p>`,
          connectionsTitle: 'Seine Frau und die vier Kinder', connections: RESALE_PEOPLE.slice(1).map(p => ({ name: p.name, image: p.portrait, detail: `${1740 - Number(p.birth)} Jahre · ${p.title}. ${p.notes}` })),
          documentsTitle: 'Verwandtschaft', documents: [{ title: 'Zum Familienbaum', text: 'Eltern, drei Töchter und der jüngste Sohn.', link: familyLink }], footer: 'Ein Pferd soll ziehen, kein Gedicht aufsagen.' } },
      { pageTitle: 'Hierarchie · Aufgaben im Familienbetrieb', commentThreadKey: 'ruddgraen-rollen', hierarchyPage: true, hierarchy: buildResaleHierarchy() },
      { pageTitle: 'Güterregister · Mischlinge', commentThreadKey: 'ruddgraen-mischlinge', tradeCatalogPage: true, tradeCatalog: buildResaleCatalog() },
      ...rooms.map(([room, title, text]) => ({ pageTitle: `Szene · ${title}`, commentThreadKey: `ruddgraen-szene-${room}`, sessionPage: true, ...illustration(room),
        sessionLocation: `Zum Schiefen Nagel · ${title}`, sessionIntro: `<p>${text}</p>`, sessionHint: 'Eine Preisverhandlung, ein Ankauf oder eine Pferdevorstellung kann die Begegnung eröffnen.',
        sessionEmptyTitle: title, sessionEmptyText: 'Der kleine Pferdehandel wartet auf die nächste Begegnung.', sessionDateAleria: { year: null, month: null, day: null } }))
    ].map(page => ({ schemaVersion: 1, ...page })) };
  entry.pages.push(buildResaleEconomy(entry)); return entry;
}
export function buildResaleRegistration() { return { tab: 'Völker & Kulturen', path: [...GWYNTHOR_CITY_PATH], description: 'Orte und Geschäfte innerhalb Gwynthors.', icon: RESALE_SIGN, entry: buildResaleModule() }; }
