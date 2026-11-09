import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';
import { FFALS_ART, FFALS_PEOPLE } from './ffals-people.mjs';
import { buildFfalsHierarchy } from './ffals-hierarchy.mjs';
import { buildFfalsCatalog } from './ffals-catalog.mjs';
import { buildFfalsEconomyPage } from './ffals-economy.mjs';

export const FFALS_MODULE_ID = 'die-goldene-fassung';
export const FFALS_SECTION = Object.freeze({ tab: 'Völker & Kulturen', key: 'Gwynthor-Stadt', path: [...GWYNTHOR_CITY_PATH], desc: 'Orte und Geschäfte innerhalb Gwynthors.' });
const paragraphs = (...texts) => texts.map(text => `<p>${text}</p>`).join('');
const illustration = name => ({ image: `${FFALS_ART}/${name}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
const rooms = [
  { key: 'verkaufsraum', title: 'Der Verkaufsraum', intro: 'Auf dunklem Holz liegen kleine Ringe, Fibeln und Anhänger auf weinrotem Tuch. Hinter dem Tresen stehen niedrige Schränke. Die Auslage lässt Raum für ein Gespräch über Material, Ringweite und den Anlass eines Geschenks.', hint: 'Beratung, Ankauf, Bestellung oder die Abholung einer kleinen Arbeit beginnen am Tresen.' },
  { key: 'werkstatt', title: 'Die Werkstatt', intro: 'Hinter dem Ladendienst liegen Werkbänke, eine kleine Esse und Schubladen für Werkzeug und Beschläge. Tageslicht fällt auf den Platz für feine Arbeiten. Aufträge und Reparaturstücke werden getrennt von den Vorräten abgelegt.', hint: 'Eine Begutachtung oder ein Werkstattgespräch kann hier ausgespielt werden. Anspruchsvolle Arbeiten benötigen eine entsprechend fachkundige Person.' },
  { key: 'keller', title: 'Der Keller', intro: 'Eine schmale Treppe führt unter den Laden. Zwischen kühlen Steinwänden stehen Kisten und schlichte Vorratsregale; eine feste innere Tür trennt einen kleinen Nebenraum ab. Von der geschäftigen Straße dringt hier nur wenig herein.', hint: 'Der Keller ist ein eigener Szenenort. Was hinter einer verschlossenen Tür liegt, ergibt sich aus dem jeweiligen Spielverlauf.' },
  { key: 'wohnstube', title: 'Die Wohnstube über dem Juwelier', intro: 'Über dem Geschäft liegt eine gemeinsame Wohnstube mit Holztisch, vier Stühlen und einer einfachen Feuerstelle. Ein paar Kissen, ein Geschirrschrank und Vorhänge machen den Raum wohnlich. Die Treppe verbindet den Alltag oben mit dem Laden darunter.', hint: 'Ein gemeinsames Essen, ein ruhiges Gespräch oder die Planung des nächsten Tages finden hier Platz.' }
];

function biographyPage() {
  return { pageTitle: 'Die vier im Laden', commentThreadKey: 'goldene-fassung-personen', biographyPage: true, ...illustration('personal'),
    biography: { biographyTitle: 'Die Besetzung der Goldenen Fassung', biographyText: paragraphs(...FFALS_PEOPLE.map(person => `<strong>${person.name}</strong> · ${person.bio}`)),
      connectionsTitle: 'Ladenrollen', connections: FFALS_PEOPLE.map(person => ({ name: person.name, detail: person.role, image: person.portrait, imageFormat: 'portrait' })),
      worksTitle: 'Was bisher feststeht', works: ['Vier benannte Figuren gehören zur Besetzung des Ladens.', 'Die Einträge sammeln die bekannten Ladenaufgaben. Weitere Lebensdaten werden bei späterer Ausarbeitung ergänzt.'],
      footer: 'Die Profile bleiben unter ihren bestehenden Figurenkennungen erreichbar.' } };
}

export function buildFfalsModule() {
  const entry = { id: FFALS_MODULE_ID, title: 'Die goldene Fassung', subtitle: 'Der Juwelier der Ffals · kleine Kostbarkeiten in Gwynthor',
    type: 'Juwelier & Schmuckhandel', category: 'Gwynthor-Stadt · Geschäfte', symbol: `${FFALS_ART}/schild.png`, icon: '◈', stamp: 'FFALS · GWYNTHOR',
    image: `${FFALS_ART}/verkaufsraum.png`, previewImage: `${FFALS_ART}/verkaufsraum.png`, schemaVersion: 1, multipage: true,
    appendCommentsPage: false, enablePageComments: true, sessionCast: FFALS_PEOPLE.map(person => person.characterId), pages: [
      { pageTitle: 'Die goldene Fassung', commentThreadKey: 'goldene-fassung-laden', ...illustration('verkaufsraum'),
        description: paragraphs('Ein bemaltes Holzschild mit goldener Ringfassung hängt an dunklen Eisenbeschlägen über der Tür. Dahinter liegt <strong>Die goldene Fassung</strong>, ein gepflegter Juwelierladen in Gwynthor-Stadt. Silber, Bronze, kleine Schmucksteine und wenige schmale Goldarbeiten füllen die Auslage.',
          'Der Laden bedient Bürgerinnen und Bürger, die ein schönes Geschenk, einen schlichten Ring oder ein gutes Stück für einen besonderen Tag suchen. Er verdient ordentlich an überschaubaren Arbeiten und verlässlicher Laufkundschaft; höfischer Prunk bestimmt weder Einrichtung noch Sortiment.',
          'Alwyn Ffals betreut Einkauf und Geschäftskontakte. Mit Seren, Rhun und Bryn bildet er die vierköpfige Besetzung. Zum Haus gehören Verkaufsraum, Werkstatt, Keller und die Wohnstube im Obergeschoss. Material, Lieferumfang und Änderungen werden vor einer Bestellung besprochen.'),
        stats: [['Ort', 'Gwynthor-Stadt'], ['Geschäft', 'Bürgerlicher Juwelier'], ['Leitung', 'Alwyn Ffals'], ['Preisrahmen', '18–280 Kupfertaler im gewöhnlichen Schmucksortiment']],
        quote: 'Ein gutes Stück muss nicht für einen Fürsten gemacht sein.', quoteBy: 'Die goldene Fassung' },
      biographyPage(),
      { pageTitle: 'Hierarchie · Laden & Werkstatt', commentThreadKey: 'goldene-fassung-hierarchie', hierarchyPage: true, ...illustration('personal'), hierarchy: buildFfalsHierarchy() },
      { pageTitle: 'Sortiment · Juwelier', commentThreadKey: 'goldene-fassung-juwelier', tradeCatalogPage: true, tradeCatalog: buildFfalsCatalog('juwelier') },
      { pageTitle: 'Sortiment · Hehler', commentThreadKey: 'goldene-fassung-hehler', tradeCatalogPage: true, tradeCatalog: buildFfalsCatalog('hehler') },
      ...rooms.map(room => ({ pageTitle: room.title, commentThreadKey: `goldene-fassung-${room.key}`, sessionPage: true, ...illustration(room.key),
        sessionIntro: room.intro, sessionHint: room.hint, sessionEmptyTitle: room.title, sessionEmptyText: 'Der Ort ist bereit für die nächste Szene.', sessionDateAleria: { year: null, month: null, day: null } }))
    ].map(page => ({ schemaVersion: 1, ...page })) };
  entry.pages.push(buildFfalsEconomyPage(entry));
  return entry;
}
