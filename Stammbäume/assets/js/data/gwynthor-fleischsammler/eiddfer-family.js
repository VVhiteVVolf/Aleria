import { createFamilyPerson, createMarriage, createParentages, createMarriedAwayBranch } from '../family-record-builders.js';
import { createGwynthorRuralFamily } from './family-foundation.js';
import { RURAL_HOUSEHOLD_EXTENSIONS } from './rural-household-extensions.js';
import { fleischsammlerFamilyLocality } from './localities.mjs';
import { IESTYN_BRAGWEN, RHIAIN_EIDDFER, BREWERY_MARRIAGE } from './brewery-kinship.js';

const houseId = 'house-eiddfer';
const parents = ['cadell-eiddfer', 'ffion-spouse-eiddfer'];
const marriage = createMarriage('marriage-cadell-ffion-eiddfer', ...parents);
const children = [RHIAIN_EIDDFER.id, 'tegid-eiddfer'];
const other = fleischsammlerFamilyLocality('bragwen');

export const EIDDFER_FAMILY = createGwynthorRuralFamily({
  slug: 'eiddfer', householdMarriageId: marriage.id, focusPersonId: parents[0], continuation: RURAL_HOUSEHOLD_EXTENSIONS.eiddfer,
  description: 'Rheunwaith-Brauerfamilie, die gemeinsam mit den verschwägerten Bragwen den Brauerhof bei Gwynthor betreibt. Partner der Teyrngarch Brauerzunft.',
  people: [
    createFamilyPerson({ id: parents[0], name: 'Cadell Eiddfer', sex: 'male', birth: '1691', houseId,
      lineageRole: 'head', title: 'Brauer und Mitbetreiber', notes: '49 Jahre. Führt den Hof mit Owain Bragwen; Vater Rhiains und Tegids.' }),
    createFamilyPerson({ id: parents[1], name: 'Ffion', sex: 'female', birth: '1694', houseId: '', familyRole: 'married',
      title: 'Brauerin und Verantwortliche für Hoflieferungen', notes: '46 Jahre. Arbeitet in der gemeinsamen Hofwirtschaft; Herkunftsfamilie nicht festgelegt.' }),
    RHIAIN_EIDDFER, { ...IESTYN_BRAGWEN, familyRole: 'married' },
    createFamilyPerson({ id: 'tegid-eiddfer', name: 'Tegid Eiddfer', sex: 'male', birth: '1719', houseId,
      title: 'Brauer und Fuhrhelfer', notes: '21 Jahre. Arbeitet in der Produktion und beim Bereitstellen der Lieferungen. Keine besondere Kenntnis über den Mörder festgelegt.' })
  ],
  partnerships: [marriage, BREWERY_MARRIAGE], parentages: createParentages(children, parents, marriage.id),
  extraHouses: [{ id: 'house-bragwen', name: 'Familie Bragwen', emblem: other.emblem, status: 'active' }],
  cadetBranches: [createMarriedAwayBranch({ id: 'married-rhiain-eiddfer-bragwen', name: 'Rhiain · Familie Bragwen',
    parentPartnershipId: BREWERY_MARRIAGE.id, houseId: 'house-bragwen', targetFamilyId: other.familyId,
    emblem: other.emblem, crestFrame: 'iron', extensions: { chartAlignBelowPartnership: true }, notes: 'Dieselbe Ehe und dieselben Personen wie bei Bragwen. Nerys und weitere Nachkommen werden ausschließlich dort fortgeführt.' })],
  biographyText: '<p>Die Eiddfer betreiben den Brauerhof gemeinsam mit Familie Bragwen. Beide Familien teilen Arbeit und Lieferungen und sind durch Rhiains Ehe mit Iestyn Bragwen verschwägert. Ihre Kooperation mit der Teyrngarch Brauerzunft dient der Versorgung Gwynthors mit Bier.</p>',
  historyText: '<p>Cadell und Ffion haben ihre dreiundzwanzigjährige Tochter Morwen an den Fleischsammler verloren. Ihr Sohn Tegid und der Arbeitszweig um Cadells Bruder Gwyndor helfen, die Brauarbeit weiterzuführen. Rhiain ist mit Iestyn Bragwen verheiratet. Damit trifft auch Catrin Bragwens Tod den verschwägerten Haushalt; Morwen und Catrin bleiben zwei verschiedene Opfer.</p>',
  works: ['Gemeinsame Produktion und Hofarbeit mit Familie Bragwen.', 'Vorbereitung und Weiterleitung der Lieferungen nach Gwynthor.', 'Kooperation mit der Teyrngarch Brauerzunft.'],
  connections: [{ name: 'Familie Bragwen', detail: 'Verschwägerte Mitbetreiber desselben Brauerhofes.' },
    { name: 'Teyrngarch Brauerzunft', detail: 'Kooperationspartner des Brauerhofes.' }]
});
