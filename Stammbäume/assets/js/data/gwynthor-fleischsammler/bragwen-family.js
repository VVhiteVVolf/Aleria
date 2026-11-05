import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { createGwynthorRuralFamily } from './family-foundation.js';
import { fleischsammlerFamilyLocality } from './localities.mjs';
import { IESTYN_BRAGWEN, RHIAIN_EIDDFER, BREWERY_MARRIAGE } from './brewery-kinship.js';

const houseId = 'house-bragwen';
const parents = ['owain-bragwen', 'eleri-spouse-bragwen'];
const marriage = createMarriage('marriage-owain-eleri-bragwen', ...parents);
const children = [IESTYN_BRAGWEN.id, 'catrin-bragwen'];
const other = fleischsammlerFamilyLocality('eiddfer');

export const BRAGWEN_FAMILY = createGwynthorRuralFamily({
  slug: 'bragwen', householdMarriageId: marriage.id, focusPersonId: parents[0],
  description: 'Rheunwaith-Brauerfamilie am gemeinsam mit den Eiddfer geführten Brauerhof. Die verschwägerten Betreiber arbeiten mit der Teyrngarch Brauerzunft zusammen und beliefern Gwynthor.',
  people: [
    createFamilyPerson({ id: parents[0], name: 'Owain Bragwen', sex: 'male', birth: '1690', houseId,
      lineageRole: 'head', title: 'Brauer und Mitbetreiber', notes: '50 Jahre. Führt den Hof gemeinsam mit Familie Eiddfer und trauert um Catrin.' }),
    createFamilyPerson({ id: parents[1], name: 'Eleri', sex: 'female', birth: '1693', houseId: '', familyRole: 'married',
      title: 'Brauerin und Vorratsverwalterin', notes: '47 Jahre. Mutter Iestyns und Catrins; Herkunftsfamilie noch nicht festgelegt.' }),
    IESTYN_BRAGWEN, { ...RHIAIN_EIDDFER, familyRole: 'married' },
    createFamilyPerson({ id: 'catrin-bragwen', name: 'Catrin Bragwen', sex: 'female', birth: '1720', death: '1740', houseId,
      title: 'Verstorbene Tochter', notes: '20 Jahre. Kam eines Tages nicht nach Hause und gehört zu den Opfern des Fleischsammlers. Keine bestimmte Reise, Tätigkeit, Fundstelle oder Täterbeobachtung ergänzen.' }),
    createFamilyPerson({ id: 'nerys-bragwen', name: 'Nerys Bragwen', sex: 'female', birth: '1738', houseId,
      title: 'Kind auf dem Brauerhof', notes: '2 Jahre. Tochter Iestyns und Rhiains; nur in der Bragwen-Akte fortgeführt.' })
  ],
  partnerships: [marriage, BREWERY_MARRIAGE],
  parentages: [...createParentages(children, parents, marriage.id), ...createParentages(['nerys-bragwen'], BREWERY_MARRIAGE.participantIds, BREWERY_MARRIAGE.id)],
  extraHouses: [{ id: 'house-eiddfer', name: 'Familie Eiddfer', emblem: other.emblem, status: 'active' }],
  biographyText: '<p>Der Brauerhof Bragwen &amp; Eiddfer wird von zwei Familien gemeinsam betrieben. Die Ehe Iestyn Bragwens mit Rhiain Eiddfer hat ihre Haushalte auch verwandtschaftlich verbunden. Der Hof arbeitet mit der Teyrngarch Brauerzunft zusammen und versorgt Gwynthor mit Bier aus deren Produktion.</p>',
  historyText: '<p>Owain und Eleri Bragwen arbeiten mit Iestyn und seiner Frau Rhiain. Deren kleine Tochter Nerys wächst auf dem gemeinsamen Hof auf. Catrin, Owains und Eleris zwanzigjährige Tochter, kam eines Tages nicht nach Hause. Sie gehört zu den Mordopfern. Ihr Tod trifft beide verschwägerten Haushalte.</p>',
  works: ['Gemeinsame Brauarbeit und Hofwirtschaft mit Familie Eiddfer.', 'Zusammenarbeit mit der Teyrngarch Brauerzunft.', 'Versorgung Gwynthors mit Teyrngarch-Bier und zugehöriger Produktion.'],
  connections: [{ name: 'Familie Eiddfer', detail: 'Verschwägerte Mitbetreiber desselben Brauerhofes.' },
    { name: 'Teyrngarch Brauerzunft', detail: 'Kooperationspartner für die Bierproduktion und Versorgung Gwynthors.' }],
  sourceNote: 'Die beiden Betreiberfamilien und der Tod einer Tochter sind Nutzerfestlegungen. Catrins Name und Alter 20 sowie die konkrete verbindende Ehe wurden neu ausgearbeitet.'
});
