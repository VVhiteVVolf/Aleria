import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { createGwynthorRuralFamily } from './family-foundation.js';

const houseId = 'house-brynial';
const parents = ['rhydderch-brynial', 'gwenith-spouse-brynial'];
const marriage = createMarriage('marriage-rhydderch-gwenith-brynial', ...parents, { end: '1740', status: 'widowed' });
const children = ['ianto-brynial', 'anwen-brynial'];

export const BRYNIAL_FAMILY = createGwynthorRuralFamily({
  slug: 'brynial', householdMarriageId: marriage.id, focusPersonId: parents[0],
  description: 'Unscheinbare Rheunwaith-Landfamilie auf der Brynial-Kate. Der kleine Haushalt betreibt etwas Ackerbau und Viehhaltung; Gwenith, die Ehefrau, gehört zu den Mordopfern.',
  people: [
    createFamilyPerson({ id: parents[0], name: 'Rhydderch Brynial', sex: 'male', birth: '1703', houseId,
      lineageRole: 'head', title: 'Kleinbauer und Witwer', notes: '37 Jahre. Führt nach Gweniths Tod den kleinen Landhaushalt mit zwei Kindern weiter.' }),
    createFamilyPerson({ id: parents[1], name: 'Gwenith', sex: 'female', birth: '1708', death: '1740', houseId: '', familyRole: 'married',
      title: 'Verstorbene Kleinbäuerin', notes: '32 Jahre. Rhydderchs Ehefrau und Mutter der beiden Kinder; Opfer des Fleischsammlers. Keine genauere Datierung, Fundstelle oder Täterbeobachtung ist ausgearbeitet. Herkunftsfamilie offen.' }),
    createFamilyPerson({ id: children[0], name: 'Ianto Brynial', sex: 'male', birth: '1732', houseId,
      title: 'Kind auf der Kate', notes: '8 Jahre. Sohn Rhydderchs und Gweniths.' }),
    createFamilyPerson({ id: children[1], name: 'Anwen Brynial', sex: 'female', birth: '1735', houseId,
      title: 'Kind auf der Kate', notes: '5 Jahre. Tochter Rhydderchs und Gweniths.' })
  ],
  partnerships: [marriage], parentages: createParentages(children, parents, marriage.id),
  biographyText: '<p>Die Brynial-Kate ist ein unscheinbarer Haushalt im nördlichen Umland Gwynthors. Etwas Ackerbau und wenige Tiere genügen für ein bescheidenes Landleben.</p>',
  historyText: '<p>Rhydderch Brynial hat seine Frau Gwenith verloren. Die zweiunddreißigjährige Mutter von Ianto und Anwen gehört zu den Opfern des Fleischsammlers. Die Kinder und ihr Vater müssen mit ihrem Verlust leben und die alltägliche Arbeit weiterführen.</p>',
  works: ['Bescheidener Ackerbau für den Haushalt.', 'Haltung weniger Tiere.', 'Versorgung der beiden Kinder und Weiterführen der Kate.'],
  sourceNote: 'Der Tod der Ehefrau ist Nutzerfestlegung; Namen, ihr Alter 32 und der kleine Haushalt sind heutige Ausarbeitung.'
});
