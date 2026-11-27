import { ARGALL_CAPTAIN_HOME, ARGALL_CAPTAIN_PEOPLE } from '../../AleriaAlmanach/modules/fleischsammler-argall/household.mjs';
import { CAER_YSGELLFOR_PITCH, exampleArt as art } from './concept-example-catalog.mjs';
import { createExampleDraft } from './concept-example-draft.mjs';

const map = '/Karten/karte.html?map=' + ARGALL_CAPTAIN_HOME.mapId + '&pin=' + ARGALL_CAPTAIN_HOME.pinId;
const house = '/Stammbäume/Stammbaum.html?family=haus-ysgellfor&mode=view';
const argallHouse = '/Stammbäume/Stammbaum.html?family=haus-argall&mode=view';

function argallResident(person, note) {
  return {
    id: person.id, role: person.role, note, image: person.portrait, format: 'portrait',
    target: { type: 'character', id: person.worldPersonId, name: person.name },
    source: argallHouse + '&person=' + person.id
  };
}

function familyResident(id, name, role, note) {
  return { id, name, role, note, source: house + '&person=' + id };
}

export function createCaerYsgellforPitch(now = Date.now()) {
  return createExampleDraft('place', {
    author: 'Aleria · Ortsentwurf',
    stage: 'draft',
    kind: 'Kleine Straßenfestung und befestigter Vorratssammelplatz',
    region: 'Östlicher Bannkreis von Gwynthor · Llamreis Ankunft · Celtigerns Wacht',
    population: 'Wachbesatzung, Hauptmann und Knappe, Familie Ysgellfor',
    authority: 'Rhydric Argall führt Burgbetrieb und Wache. Madog Ysgellfor leitet mit seiner Familie die zivile Vorratsannahme.',
    pitch: 'Caer Ysgellfor könnte wie ein befestigter Güterhof wirken. Eine niedrige Ringmauer schützt Torhaus, Wagenhof und Kornspeicher. Das offene Tor gibt den Blick auf Flaschenzüge, überdachte Laderampen und wartende Fuhrwerke frei. An der Straße besprechen Rhydric und Perwyn die nächste Eskorte. Unter dem Vordach gleichen Madog und seine Familie ab, was tatsächlich auf den Wagen nach Gwynthor liegt.',
    location: 'Der Kartenpunkt liegt an der Hauptstraße im östlichen Bannkreis. Für den Entwurf sitzt die Festung unmittelbar an einer leicht erhöhten Wegbiegung mit freier Sicht auf den ankommenden Verkehr.',
    map,
    look: 'Vorschlag für die Gestaltung. Heller, grob gesetzter Stein, niedrige Schieferdächer und warmes Holz unter den Vordächern. Der deutlichste Akzent ist das zweistöckige Torhaus. Hinter dem Tor riecht es nach Kornstaub, Zugtieren und frischer Luft vom Hof.',
    customs: 'Als Eingangsbild läuft eine gewöhnliche Frühschicht. Fuhrleute melden sich am Tor, Angharad lenkt die Ausgabe und Gwenonwy führt die Liste unter dem Dach. Iorwerth lernt am Stapelplatz, wie die Säcke der Reihe nach verladen werden.',
    community: 'Rhydric Argall und sein Sohn Perwyn leben in der Festung. Madog Ysgellfor, Angharad, Gwenonwy und Iorwerth tragen die Vorratswirtschaft. Der Wachdienst, die Lieferungen der Höfe und der Weitertransport nach Gwynthor bestimmen den Alltag.',
    access: 'Die Hauptstraße trägt den Verkehr von den Höfen Richtung Gwynthor. Im baulichen Vorschlag trennt der Hof einen überdachten Warteplatz am Tor von der Ladezone der Vorratsspeicher.',
    supply: 'Getreide und andere Vorräte aus den umliegenden Höfen werden gesammelt, gelagert und in Fuhren für Gwynthor zusammengeführt. Madog bestätigt die Annahme. Rhydric stellt den Straßenschutz.',
    services: 'Für Szenen bieten sich der Blick der Wache auf die Straße, ein trockener Platz für Frachtprüfungen und eine kurze Rast im Wagenhof an.',
    founding: 'Die bestehende Ortsakte nennt Schutz und Versorgung als Aufgaben. Bauzeit und Ausbauphasen können in einem späteren Entwurf festgelegt werden.',
    hooks: 'Beim morgendlichen Abgleich fehlen auf einer bereits beladenen Fuhre zwei Säcke. Rhydrics Eskorte soll vor Mittag aufbrechen. Perwyn will den Ladeplatz überprüfen. Gwenonwy hat eine frühere Abschrift, Angharad kennt die letzte Ausgabe und Iorwerth erinnert sich an den Wagen, der seinen Stellplatz wechseln musste. Die Gruppe kann die Fracht prüfen oder ihre Abfahrt begleiten.',
    questions: 'Soll die Straße außen an der Mauer entlanglaufen oder soll das Tor als örtlicher Kontrollpunkt dienen? Wo liegen Wachstube und Kornkammer im Grundriss?',
    notes: 'Ortsakte und Figurenrollen stammen aus vorhandenen Quellen. Bauform, Tagesablauf im Bild und die Szene mit der fehlenden Fracht sind Entwurfsvorschläge.'
  }, {
    images: [
      { id: 'a', name: 'Straßenfestung mit offenem Tor', url: art('caer-ysgellfor-strassenfestung'), format: 'landscape', note: 'Erste Entwurfsansicht von der Straße. Das offene Tor macht den arbeitenden Versorgungshof sichtbar.' },
      { id: 'b', name: 'Wagenhof und Kornspeicher', format: 'landscape', note: 'Vorgesehene zweite Ansicht aus Augenhöhe an der Laderampe, mit Fuhrwerk und Platz für die Vorratszählung.' },
      { id: 'c', name: 'Vom Wachgang zur Hauptstraße', format: 'landscape', note: 'Vorgesehene Übersicht für die Blickachsen vom Torhaus und die Stellung der Festung zur Straße.' }
    ],
    landmarks: [
      { id: 'ysgellfor-tor', name: 'Torhaus und Wachvordach', location: 'An der Hauptstraße', note: 'Vorschlag für den ersten Gesprächsort mit Rhydric und Perwyn. Von hier lässt sich das Eintreffen der Wagen beobachten.' },
      { id: 'ysgellfor-hof', name: 'Wagenhof und Annahme', location: 'Hinter dem Tor', note: 'Vorschlag für Madogs Arbeitsbereich, mit überdachtem Prüfplatz und Wendefläche.' },
      { id: 'ysgellfor-speicher', name: 'Kornspeicher und Laderampe', location: 'An der trockenen Hofseite', note: 'Vorschlag für die Ausgabe. Angharad und Gwenonwy behalten hier gemeinsam Listen und Fracht im Blick.' }
    ],
    residents: [
      argallResident(ARGALL_CAPTAIN_PEOPLE.captain, 'Leitet Burgbetrieb und Wachdienst. Im Pitch muss er zwischen der nächsten Eskorte und einer Prüfung der Fracht entscheiden.'),
      argallResident(ARGALL_CAPTAIN_PEOPLE.squire, 'Siebzehnjähriger Sohn und Knappe. Im Pitch bietet er an, die Wege der Fuhrwerke im Hof nachzuvollziehen.'),
      familyResident('madog-ysgellfor', 'Madog Ysgellfor', 'Leiter der zivilen Vorratsannahme', 'Verantwortet Annahme, Lagerung und Ausgabe für Gwynthor und stimmt sich mit Rhydric ab.'),
      familyResident('angharad-spouse-ysgellfor', 'Angharad', 'Vorratslisten und Ausgabe', 'Madogs Ehefrau organisiert die häuslichen Vorratslisten und die Annahme und Ausgabe.'),
      familyResident('gwenonwy-ysgellfor', 'Gwenonwy Ysgellfor', 'Schreiberin bei der Vorratsannahme', 'Hilft beim Erfassen der Lieferungen und beim Abgleich der Fuhren nach Gwynthor.'),
      familyResident('iorwerth-ysgellfor', 'Iorwerth Ysgellfor', 'Lehrling der Vorratswirtschaft', 'Lernt Vorräte zu lagern und zu verladen. Im Pitch kann er die Wagen am Stellplatz wiedererkennen.')
    ],
    relations: [
      { id: 'ysgellfor-haus', category: 'authority', target: { type: 'house', id: 'haus-ysgellfor', name: 'Familie Ysgellfor' }, role: 'Zivile Vorratsannahme vor Ort', note: 'Madog und seine Angehörigen führen die Vorräte für Gwynthor zusammen.', source: house },
      { id: 'ysgellfor-gwynthor', category: 'trade', name: 'Gwynthor', role: 'Ziel der Vorratsfuhren', note: 'Die Festung bündelt Getreide und andere Vorräte von den Höfen an der Straße.', source: map },
      { id: 'ysgellfor-rhydric', category: 'authority', target: { type: 'character', id: ARGALL_CAPTAIN_PEOPLE.captain.worldPersonId, name: 'Rhydric Argall' }, role: 'Burgverwaltung und Wache', note: 'Stimmt Sicherung und Weiterfahrt mit der Vorratsannahme ab.' }
    ],
    decisions: [
      { id: 'ysgellfor-funktion', name: 'Funktion & Besetzung', status: 'confirmed', result: 'Kleine Straßenfestung und Vorratssammelplatz. Rhydric führt Wache und Verwaltung. Die Ysgellfor führen den zivilen Vorratsbetrieb.', reason: 'Ortsakte und Familienquellen stimmen in dieser Zuständigkeit überein.' },
      { id: 'ysgellfor-bauform', name: 'Tor und Wagenhof', status: 'open', result: 'Kompakte niedrige Ringmauer, ein Torhaus und ein trockener Ladehof.', alternatives: 'Frachtprüfung außerhalb der Mauer.\nGetrennte Zufahrt für Lieferungen und Wachdienst.' }
    ],
    timeline: [
      { id: 'ysgellfor-fruehschicht', date: 'Morgendliche Szene im Pitch', name: 'Annahme der ersten Fuhren', note: 'Die beiden Arbeitsbereiche werden sichtbar, sobald die Fuhrleute und die Eskorte eintreffen.' }
    ],
    sources: [
      { id: 'ysgellfor-karte', name: 'Caer Ysgellfor auf der Karte des Bannkreises', url: map, note: 'Belegt Lage, Funktion und Besetzung des Orts.' },
      { id: 'ysgellfor-stammbaum', name: 'Stammbaum der Familie Ysgellfor', url: house, note: 'Belegt die vier örtlichen Haushaltsmitglieder und ihre Aufgaben.' },
      { id: 'ysgellfor-argall', name: 'Rhydric und Perwyn im Stammbaum der Argall', url: argallHouse + '&person=rhydric-argall', note: 'Belegt Hauptmann, Knappe und ihre Verbindung.' }
    ]
  }, now, { sample: CAER_YSGELLFOR_PITCH, mainImage: '' });
}
