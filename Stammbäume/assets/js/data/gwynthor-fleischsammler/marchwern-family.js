import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { createGwynthorRuralFamily } from './family-foundation.js';

const houseId = 'house-marchwern';
const parents = ['gwrgi-marchwern', 'mared-spouse-marchwern'];
const marriage = createMarriage('marriage-gwrgi-mared-marchwern', ...parents);
const children = ['rhun-marchwern', 'eluned-marchwern'];

export const MARCHWERN_FAMILY = createGwynthorRuralFamily({
  slug: 'marchwern', householdMarriageId: marriage.id, focusPersonId: parents[0],
  description: 'Rheunwaith-Rosszüchter am Marchwern-Gestüt bei Gwynthor. Die Familie dient unmittelbar Haus Wyrm und stellt hochwertige Reitpferde bereit.',
  people: [
    createFamilyPerson({ id: parents[0], name: 'Gwrgi Marchwern', sex: 'male', birth: '1692', houseId,
      lineageRole: 'head', title: 'Gestütsvorsteher im Dienst des Hauses Wyrm', notes: '48 Jahre. Führt den Familienbetrieb im Bannkreis Gwynthors. Die Dienstbindung an Haus Wyrm begründet keinen anderen Wohnort.' }),
    createFamilyPerson({ id: parents[1], name: 'Mared', sex: 'female', birth: '1696', houseId: '', familyRole: 'married',
      title: 'Züchterin und Verantwortliche für Stallroutinen', notes: '44 Jahre. Führt Pflege und feste Routinen mit. Herkunftsfamilie nicht festgelegt.' }),
    createFamilyPerson({ id: children[0], name: 'Rhun Marchwern', sex: 'male', birth: '1716', houseId,
      title: 'Pferdepfleger und Bereiter', notes: '24 Jahre. Arbeitet mit Reitpferden des Gestüts und bereitet geeignete Tiere auf den Dienst vor.' }),
    createFamilyPerson({ id: children[1], name: 'Eluned Marchwern', sex: 'female', birth: '1719', houseId,
      title: 'Züchterin', notes: '21 Jahre. Hilft bei Aufzucht und Pflege; die geringe Zahl reiner Ceffyl wird sorgfältig betreut.' })
  ],
  partnerships: [marriage], parentages: createParentages(children, parents, marriage.id),
  biographyText: '<p>Das Marchwern-Gestüt ist für Gwynthor ein wichtiger Zuchtbetrieb. Die Familie steht unmittelbar im Dienst des Hauses Wyrm und versorgt es mit guten Reitpferden. Zum Bestand gehören Rhyfel und einige sorgfältig betreute Ceffyl sowie weitere geeignete Reitpferde.</p><p>Die reinen Ceffyl bleiben selten. Ihre anspruchsvolle Haltung und die Bindung an einen Reiter erfordern feste Bezugspersonen und verlässliche Stallroutinen.</p>',
  historyText: '<p>Gwrgi und Mared führen den Familienbetrieb mit Rhun und Eluned. Am Gestüt bei Gwynthor kümmern sie sich gemeinsam um Zucht, Aufzucht und die für Haus Wyrm bestimmten Reitpferde.</p>',
  works: ['Zucht und Aufzucht guter Reitpferde für Gwynthor und den Dienst des Hauses Wyrm.',
    'Pflege vielseitiger Rhyfel und weniger sorgfältig ausgewählter Ceffyl.', 'Verlässliche Stallroutinen, Betreuung und Vorbereitung geeigneter Reittiere.'],
  connections: [{ name: 'Haus Wyrm', detail: 'Unmittelbarer Dienst und Bereitstellung guter Reitpferde.' }],
  documents: [{ title: 'Ceffyl', text: 'Seltene, anspruchsvolle Reitpferde mit enger Bindung an ihren Reiter.', link: '../Bestiarium/tiere/pferde/ceffyl/' },
    { title: 'Rhyfel', text: 'Vielseitige und verlässliche Reitpferde Cenyrs.', link: '../Bestiarium/tiere/pferde/rhyfel/' }]
});
