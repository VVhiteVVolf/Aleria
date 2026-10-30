import { createHouseProfileFromFolderPath } from '../../domain/house-profile.js';
import { createFamilyPerson, createMarriage, createParentages, createMarriedAwayBranch } from '../family-record-builders.js';
import { createCourtFamily } from './family-foundation.js';
import { COURT_EMBLEMS, GWRGAN_COCHDON, LLEUCU_SWYLL, LLEUCU_FIRST_MARRIAGE } from './case-people.js';

const houseId = 'house-cochdon';
const parents = ['gorwystl-cochdon', 'gwenfrewi-spouse-cochdon'];
const brothers = [
  ['cynfelyn-cochdon', 'Cynfelyn Cochdon', '1690'],
  ['tegfan-cochdon', 'Tegfan Cochdon', '1693'],
  ['ithel-cochdon', 'Ithel Cochdon', '1700']
].map(([id, name, birth]) => createFamilyPerson({
  id, name, birth, sex: 'male', death: '1720', houseId,
  title: 'Seehändler · bei der Schlacht der tausend Wellen ertrunken',
  notes: 'Bruder Gwrgans. Zog mit Rhodris Aufgebot nach Vennyr; unverheiratet und kinderlos gefallen.'
}));

export const HOUSE_COCHDON_FAMILY = createCourtFamily({
  id: 'haus-cochdon', title: 'Haus Cochdon', emblem: COURT_EMBLEMS.cochdon,
  houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], { rankId: 'commoner' }),
  description: 'Kleines einheimisches Gwynthorer Seehandelshaus. Zwei reparaturbedürftige Schiffe bildeten die ursprüngliche Grundlage. Nach dem Verlust der vier Söhne führte Lleucu den Betrieb fort; der Vater vermachte ihr seinen Besitz. Gwrgan kehrte als einziger Bruder lebend zurück. Das Wappen zeigt einen silbernen springenden Tunfisch mit rotem Kamm und roten Flossen auf Petrol.',
  firstYear: '1663', roots: ['gorwystl-cochdon'],
  people: [
    createFamilyPerson({ id: parents[0], name: 'Gorwystl Cochdon', sex: 'male', birth: '1663', death: '1728', houseId, lineageRole: 'head', title: 'Alter Seehändler · Erblasser Lleucus',
      notes: 'Vater der vier Brüder. Überlebte den vermeintlichen Tod aller Söhne und lebte noch mit der jungen Lleucu im Familienhaushalt. Versank in Trauer und schwerem Trinken; sein Tod wird damit in Verbindung gebracht, ohne eine sichere medizinische Todesursache zu behaupten. Vermachte Lleucu 1728 ausdrücklich den verbliebenen Besitz. Ihre heutige Eigentumsposition beruht damit auch auf seinem Testament.' }),
    createFamilyPerson({ id: parents[1], name: 'Gwenfrewi', sex: 'female', birth: '1667', death: '1717', houseId: '', familyRole: 'married', title: 'Mutter der vier Cochdon-Brüder', notes: 'Vor dem Untergang Vennyrs verstorben. Herkunftsfamilie noch nicht festgelegt.' }),
    ...brothers, GWRGAN_COCHDON, { ...LLEUCU_SWYLL, familyRole: 'married' }
  ],
  partnerships: [createMarriage('marriage-gorwystl-gwenfrewi-cochdon', ...parents, { end: '1717', status: 'widowed' }), LLEUCU_FIRST_MARRIAGE],
  parentages: createParentages([...brothers.map(p => p.id), GWRGAN_COCHDON.id], parents, 'marriage-gorwystl-gwenfrewi-cochdon'),
  houses: [{ id: 'house-swyll', name: 'Haus Swyll', emblem: COURT_EMBLEMS.swyll, status: 'active' }],
  cadetBranches: [createMarriedAwayBranch({ id: 'linked-lleucu-swyll-cochdon', name: 'Lleucus Herkunft · Haus Swyll', parentPartnershipId: LLEUCU_FIRST_MARRIAGE.id,
    houseId: 'house-swyll', targetFamilyId: 'haus-swyll', emblem: COURT_EMBLEMS.swyll, crestFrame: 'iron', notes: 'Dieselbe Lleucu und dieselbe erste Ehe werden mit stabilen IDs in der Swyll-Akte geführt.' })],
  sourceNote: 'Autorenauftrag und Familien-/Wappenentscheidungen vom 30.10.2026. Cochdon ist eine kollisionsgeprüfte neue Rheunwaith-Familienbezeichnung. Eltern und Brüder ergänzt; kein gemeinsames Kind Gwrgans und Lleucus. Nachlass und Ehefolgen bleiben gerichtlich offen.'
});
