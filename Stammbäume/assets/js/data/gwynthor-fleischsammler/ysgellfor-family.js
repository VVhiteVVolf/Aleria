import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { createGwynthorRuralFamily } from './family-foundation.js';

const houseId = 'house-ysgellfor';
const parents = ['madog-ysgellfor', 'angharad-spouse-ysgellfor'];
const marriage = createMarriage('marriage-madog-angharad-ysgellfor', ...parents);
const children = ['gwenonwy-ysgellfor', 'iorwerth-ysgellfor'];

export const YSGELLFOR_FAMILY = createGwynthorRuralFamily({
  slug: 'ysgellfor', householdMarriageId: marriage.id, focusPersonId: parents[0],
  description: 'Bürgerliche Rheunwaith-Familie an der kleinen Straßenfestung Caer Ysgellfor. Madog und seine Angehörigen führen die Vorratsannahme und die für Gwynthor bestimmte Versorgung.',
  people: [
    createFamilyPerson({ id: parents[0], name: 'Madog Ysgellfor', sex: 'male', birth: '1693', houseId,
      lineageRole: 'head', title: 'Leiter der Vorratsannahme von Caer Ysgellfor',
      notes: '47 Jahre. Führt mit seiner Familie die Annahme, Lagerung und Ausgabe der für Gwynthor bestimmten Vorräte. Der frühere lokale Entwurf als Hauptmann wurde durch die ausdrückliche Besetzung des Amts mit Rhydric Argall ersetzt; Madog ist eine eigenständige Person der Versorgungsfamilie.' }),
    createFamilyPerson({ id: parents[1], name: 'Angharad', sex: 'female', birth: '1696', houseId: '', familyRole: 'married',
      title: 'Verantwortliche für Vorräte und Ausgabe', notes: '44 Jahre. Madogs Ehefrau; führt die häuslichen Vorratslisten und organisiert Annahme und Ausgabe. Ihre Herkunftsfamilie ist noch nicht festgelegt.' }),
    createFamilyPerson({ id: children[0], name: 'Gwenonwy Ysgellfor', sex: 'female', birth: '1721', houseId,
      title: 'Schreiberin bei der Vorratsannahme', notes: '19 Jahre. Hilft beim Erfassen der Lieferungen und beim Abgleich der für Gwynthor bestimmten Fuhren.' }),
    createFamilyPerson({ id: children[1], name: 'Iorwerth Ysgellfor', sex: 'male', birth: '1725', houseId,
      title: 'Lehrling der Vorratswirtschaft', notes: '15 Jahre. Lernt das Lagern und Verladen; kein ausgebildeter Wachmann.' })
  ],
  partnerships: [marriage], parentages: createParentages(children, parents, marriage.id),
  biographyText: '<p>Caer Ysgellfor ist eine kleine Festung an der Hauptstraße nach Gwynthor. Hier werden Getreide und andere Vorräte aus den umliegenden Höfen gesammelt, gelagert und für die Weiterfahrt in die Stadt zusammengeführt. Zugleich schützt die Besatzung die Höfe und den Straßenabschnitt.</p>',
  historyText: '<p>Madog Ysgellfor führt die Vorratsannahme mit seiner Frau Angharad und den Kindern Gwenonwy und Iorwerth. Burgverwaltung und Wachdienst liegen bei Hauptmann Rhydric Argall. Die Ysgellfor stimmen ihre Lieferungen und Ausgaben mit ihm ab, damit der Nachschub nach Gwynthor auch unter den gegenwärtigen Sorgen des Bannkreises weitergeht.</p>',
  works: ['Annahme und geordnete Weiterleitung von Getreide und Vorräten nach Gwynthor.',
    'Geordnete Lagerung und Ausgabe der von den umliegenden Höfen gelieferten Vorräte.', 'Abstimmung mit Hauptmann Rhydric Argall und den ankommenden Fuhrleuten.']
});
