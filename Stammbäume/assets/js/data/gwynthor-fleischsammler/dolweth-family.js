import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { createGwynthorRuralFamily } from './family-foundation.js';

const houseId = 'house-dolweth';
const parents = ['aled-dolweth', 'sioned-spouse-dolweth'];
const marriage = createMarriage('marriage-aled-sioned-dolweth', ...parents);
const children = ['lleian-dolweth', 'peredur-dolweth'];

export const DOLWETH_FAMILY = createGwynthorRuralFamily({
  slug: 'dolweth', householdMarriageId: marriage.id, focusPersonId: parents[0],
  description: 'Kleine Rheunwaith-Familie auf der Dolweth-Kate mit bescheidenem Viehbestand. Sie trauert um ihre achtzehnjährige Tochter Lleian, die vor wenigen Tagen ermordet wurde.',
  people: [
    createFamilyPerson({ id: parents[0], name: 'Aled Dolweth', sex: 'male', birth: '1699', houseId,
      lineageRole: 'head', title: 'Kleinbauer', notes: '41 Jahre. Bewirtschaftet mit seiner Frau eine kleine Kate mit wenigen Tieren. Trauert um Lleian.' }),
    createFamilyPerson({ id: parents[1], name: 'Sioned', sex: 'female', birth: '1701', houseId: '', familyRole: 'married',
      title: 'Kleinbäuerin', notes: '39 Jahre. Mutter Lleians und Peredurs. Der Verlust der Tochter ist noch frisch; Herkunftsfamilie nicht festgelegt.' }),
    createFamilyPerson({ id: children[0], name: 'Lleian Dolweth', sex: 'female', birth: '1722', death: '1740', houseId,
      title: 'Verstorbene Tochter', notes: '18 Jahre. Wurde vor wenigen Tagen Opfer des Fleischsammlers. Ein genauer Tattag, Fundort, Tatablauf und eigene Hinweise auf den Täter sind nicht festgelegt.' }),
    createFamilyPerson({ id: children[1], name: 'Peredur Dolweth', sex: 'male', birth: '1729', houseId,
      title: 'Kind auf der Kate', notes: '11 Jahre. Lleians jüngerer Bruder; lebt im trauernden Haushalt.' })
  ],
  partnerships: [marriage], parentages: createParentages(children, parents, marriage.id),
  biographyText: '<p>Die Dolweth-Kate liegt südlich des größeren Versorgerhofes. Die Familie hält nur wenige Tiere und ist nicht groß genug, um als eigener Viehhof zu gelten. Mit ihren bescheidenen Überschüssen leistet sie dennoch ihren Beitrag.</p>',
  historyText: '<p>Aled und Sioned leben mit ihrem Sohn Peredur in tiefer Trauer. Ihre Tochter Lleian wurde achtzehn Jahre alt. Vor wenigen Tagen wurde sie Opfer des Fleischsammlers. Die Familie hat den Verlust noch nicht verarbeitet.</p>',
  works: ['Versorgung weniger eigener Tiere.', 'Kleine Überschüsse für die Umgebung.', 'Weiterführen des Haushalts trotz des frischen Verlusts.'],
  sourceNote: 'Lleians Alter und der wenige Tage zurückliegende Tod sind Nutzerfestlegungen; Name und übriger Haushalt wurden neu ausgearbeitet.'
});
