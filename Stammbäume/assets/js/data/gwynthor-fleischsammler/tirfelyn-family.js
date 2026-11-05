import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { createGwynthorRuralFamily } from './family-foundation.js';

const houseId = 'house-tirfelyn';
const parents = ['caradog-tirfelyn', 'enid-spouse-tirfelyn'];
const marriage = createMarriage('marriage-caradog-enid-tirfelyn', ...parents);
const children = ['gareth-tirfelyn', 'ceridwen-tirfelyn', 'bedwyr-tirfelyn'];

export const TIRFELYN_FAMILY = createGwynthorRuralFamily({
  slug: 'tirfelyn', householdMarriageId: marriage.id, focusPersonId: parents[0],
  description: 'Freundliche Rheunwaith-Bauernfamilie auf dem Tirfelyn-Hof, einem wichtigen Versorger Gwynthors mit Vieh, Getreide und Gemüse.',
  people: [
    createFamilyPerson({ id: parents[0], name: 'Caradog Tirfelyn', sex: 'male', birth: '1691', houseId,
      lineageRole: 'head', title: 'Hofvorsteher', notes: '49 Jahre. Freundlicher, verlässlicher Bauer; koordiniert Feldarbeit, Vieh und Lieferungen nach Gwynthor.' }),
    createFamilyPerson({ id: parents[1], name: 'Enid', sex: 'female', birth: '1695', houseId: '', familyRole: 'married',
      title: 'Bäuerin und Verantwortliche für Garten und Vorräte', notes: '45 Jahre. Führt Gemüsewirtschaft und Vorratshaltung mit; Herkunftsfamilie noch offen.' }),
    createFamilyPerson({ id: children[0], name: 'Gareth Tirfelyn', sex: 'male', birth: '1715', houseId,
      title: 'Bauer und Viehhalter', notes: '25 Jahre. Arbeitet bei Feldbestellung und Viehversorgung.' }),
    createFamilyPerson({ id: children[1], name: 'Ceridwen Tirfelyn', sex: 'female', birth: '1718', houseId,
      title: 'Gemüsebäuerin', notes: '22 Jahre. Kümmert sich mit Enid um Gemüse und die Lieferungen für die Stadt.' }),
    createFamilyPerson({ id: children[2], name: 'Bedwyr Tirfelyn', sex: 'male', birth: '1727', houseId,
      title: 'Hofkind', notes: '13 Jahre. Übernimmt altersgemäße Arbeiten im Familienhaushalt.' })
  ],
  partnerships: [marriage], parentages: createParentages(children, parents, marriage.id),
  biographyText: '<p>Der Tirfelyn-Hof liegt auf der Gwynthor zugewandten Seite des ländlichen Versorgungsraums. Vieh, Getreide und Gemüse machen ihn zu einem wichtigen Lieferanten der Stadt. Die freundliche Betreiberfamilie lebt von verlässlicher gemeinsamer Arbeit und regelmäßiger Versorgung.</p>',
  historyText: '<p>Caradog und Enid führen den Hof mit Gareth, Ceridwen und dem jüngeren Bedwyr. Der Betrieb bleibt ein Familienhof, auch wenn sein Beitrag zur Ernährung Gwynthors erheblich ist.</p>',
  works: ['Haltung und Versorgung des Viehs.', 'Anbau und Lieferung von Getreide.', 'Gemüsewirtschaft für den Hof und Gwynthor.']
});
