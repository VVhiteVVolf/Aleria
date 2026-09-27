import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { createFamilyPerson, createMarriage, createParentages, createMarriedAwayBranch } from './family-record-builders.js';
import { COEDDU_CRAIGDDU_MARRIAGE } from './coeddu-craigddu-marriage.js';
import { LLYWELYN_COEDDU_BIOGRAPHY } from './person-biographies/llywelyn-coeddu.js';

const EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Craigddu.png';
const COEDDU_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Coeddu.png';
const FOUNDERS = ['craigddu-ursprung-gruender', 'craigddu-ursprung-gruenderin'];
const FOUNDER_MARRIAGE = 'marriage-craigddu-unknown-founders';
const BROTHERS = ['brenwyn-craigddu', 'craigddu-gruender', 'cyran-craigddu'];
const TIME_JUMP = 'gap-craigddu-to-iestyn-generation';

function person(id, name, sex, birth, options = {}) {
  return createFamilyPerson({
    id, worldPersonId: `person--craigddu--${id}`, name, sex, birth, houseId: 'house-craigddu',
    lineageRole: 'mainline', ...options
  });
}

function child(id, childId, parentIds, partnershipId) {
  return { id, childId, parentIds, partnershipId, type: 'biological', legitimacy: 'legitimate', certainty: 'confirmed', visibility: 'public', notes: '', extensions: {} };
}

export const HOUSE_CRAIGDDU_FAMILY = Object.freeze({
  schema: 'aleria.family-tree', schemaVersion: 1,
  document: {
    id: 'craigddu', title: 'Haus Craigddu', motto: '',
    description: 'Kriegerisches Bürgerhaus aus Gwynthor im generationslangen Dienst von Haus Draig. Aus der Baumeisterfamilie gingen Wachen, Waffenknechte und einzelne Ritter hervor; mehrere Angehörige arbeiten weiterhin in Gwynthors Baumeistergilde.',
    emblem: EMBLEM, houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.craigddu
  },
  persons: [
    person(FOUNDERS[0], 'Unbekannter Gründer', 'male', '', {
      status: 'dead', title: 'Historischer Gründer des Hauses', lineageRole: 'branch', tags: ['Gründerfamilie'],
      notes: 'Name, Lebensdaten und die Generationen bis zu den Brüdern Brenwyn, Iestyn und Cyran sind nicht überliefert.'
    }),
    person(FOUNDERS[1], 'Unbekannte Gründerin', 'female', '', {
      status: 'dead', title: 'Historische Gründerin des Hauses', familyRole: 'married', lineageRole: 'branch', tags: ['Gründerfamilie'],
      notes: 'Name, Lebensdaten und die Generationen bis zur jüngeren Craigddu-Familie sind nicht überliefert.'
    }),
    // Historische IDs bleiben erhalten; dieses Paar sind Hywels Eltern, nicht die Hausgründer.
    person('craigddu-gruender', 'Iestyn Craigddu', 'male', '1680', {
      title: 'Vater von Hywel und Catrin',
      notes: 'Ehemann Mareds und Bruder von Brenwyn und Cyran Craigddu. Vater von Hywel und Catrin.',
      extensions: { registryManagedFields: ['title', 'lineageRole', 'tags', 'notes'] }
    }),
    person('craigddu-gruenderin', 'Mared', 'female', '1683', {
      title: 'Mutter von Hywel und Catrin', familyRole: 'married', lineageRole: 'branch',
      notes: 'Ehefrau Iestyns und Mutter von Hywel und Catrin.',
      extensions: { registryManagedFields: ['title', 'tags', 'notes'] }
    }),
    person('brenwyn-craigddu', 'Brenwyn Craigddu', 'male', '1676', {
      title: 'Baumeister in Gwynthors Baumeistergilde', lineageRole: 'branch',
      notes: 'Älterer Bruder Iestyns und Cyrans, Onkel von Hywel und Catrin. Mit Helyga verheiratet; Vater von Rhydric und Maelor. In der örtlichen Baumeistergilde tätig.'
    }),
    person('helyga-craigddu', 'Helyga', 'female', '1680', { houseId: '', familyRole: 'married', lineageRole: 'branch', title: 'Ehefrau von Brenwyn Craigddu' }),
    person('cyran-craigddu', 'Cyran Craigddu', 'male', '1683', {
      title: 'Waffenknecht im Dienst von Haus Draig', lineageRole: 'branch',
      notes: 'Jüngerer Bruder Brenwyns und Iestyns, Onkel von Hywel und Catrin. Ehemann Lleiras und Vater von Thalwyn.'
    }),
    person('lleira-craigddu', 'Lleira', 'female', '1685', { houseId: '', familyRole: 'married', lineageRole: 'branch', title: 'Ehefrau von Cyran Craigddu' }),
    person('rhydric-craigddu', 'Rhydric Craigddu', 'male', '1702', {
      title: 'Baumeister in Gwynthors Baumeistergilde', lineageRole: 'branch',
      notes: 'Sohn Brenwyns und Helygas, Bruder Maelors und Vetter Hywels. Arbeitet wie sein Vater in der örtlichen Baumeistergilde. Mit Maelena hat er Ellor und Sairwen.'
    }),
    person('maelena-craigddu', 'Maelena', 'female', '1705', { houseId: '', familyRole: 'married', lineageRole: 'branch', title: 'Ehefrau von Rhydric Craigddu' }),
    person('maelor-craigddu', 'Maelor Craigddu', 'male', '1706', {
      title: 'Wache im Dienst von Haus Draig', lineageRole: 'branch',
      notes: 'Jüngerer Sohn Brenwyns und Helygas, Bruder Rhydrics und Vetter Hywels. Mit Avelia verheiratet; Vater von Perian.'
    }),
    person('avelia-craigddu', 'Avelia', 'female', '1709', { houseId: '', familyRole: 'married', lineageRole: 'branch', title: 'Ehefrau von Maelor Craigddu' }),
    person('thalwyn-craigddu', 'Thalwyn Craigddu', 'male', '1709', {
      title: 'Waffenknecht im Dienst von Haus Draig', lineageRole: 'branch',
      notes: 'Sohn Cyrans und Lleiras, Vetter Hywels. Mit Nerwen verheiratet; Vater von Gwenella.'
    }),
    person('nerwen-craigddu', 'Nerwen', 'female', '1711', { houseId: '', familyRole: 'married', lineageRole: 'branch', title: 'Ehefrau von Thalwyn Craigddu' }),
    person('ellor-craigddu', 'Ellor Craigddu', 'male', '1729', { lineageRole: 'branch', notes: 'Sohn Rhydrics und Maelenas; älterer Bruder Sairwens.' }),
    person('sairwen-craigddu', 'Sairwen Craigddu', 'female', '1734', { lineageRole: 'branch', notes: 'Tochter Rhydrics und Maelenas; jüngere Schwester Ellors.' }),
    person('perian-craigddu', 'Perian Craigddu', 'male', '1732', { lineageRole: 'branch', notes: 'Sohn Maelors und Avelias.' }),
    person('gwenella-craigddu', 'Gwenella Craigddu', 'female', '1736', { lineageRole: 'branch', notes: 'Tochter Thalwyns und Nerwens.' }),
    person('person-28b0e0a3', 'Hywel Craigddu', 'male', '1708', {
      title: 'Waffenknecht in Gwynthor', portrait: 'assets/images/portraits/haus-craigddu/hywel-craigddu.png',
      notes: 'Catrins älterer Bruder und Llywelyns bester Freund. Ehemann Eleris und Vater von sieben Töchtern.',
      extensions: { registryManagedFields: ['name', 'title', 'portrait', 'notes'] }
    }),
    createFamilyPerson({
      ...COEDDU_CRAIGDDU_MARRIAGE.wife, id: 'person-bc7dd4e8', familyRole: 'core',
      extensions: { registryManagedFields: ['name', 'title'] }
    }),
    person('person-0774c56b', 'Eleri', 'female', '1708', { houseId: '', familyRole: 'married', title: 'Ehefrau von Hywel Craigddu', extensions: { registryManagedFields: ['title'] } }),
    person('person-36234a87', 'Lowri Craigddu', 'female', '1726'),
    person('person-abdbd916', 'Carys Craigddu', 'female', '1728'),
    person('person-650808a6', 'Nerys Craigddu', 'female', '1730'),
    person('person-f54eea82', 'Ffion Craigddu', 'female', '1732'),
    person('person-70f41f8d', 'Anwen Craigddu', 'female', '1733'),
    person('person-c5e97e4f', 'Eirlys Craigddu', 'female', '1726'),
    person('person-9be71788', 'Mali Craigddu', 'female', '1726', { lineageRole: 'branch' }),
    createFamilyPerson({
      ...COEDDU_CRAIGDDU_MARRIAGE.husband, id: 'person-d189ca4a', familyRole: 'married',
      notes: 'Catrins Ehemann; die fortführende Linie mit ihrem Sohn Ellian liegt in Haus Coeddu.',
      extensions: { biographyModule: LLYWELYN_COEDDU_BIOGRAPHY, registryManagedFields: ['name', 'title', 'birth', 'portrait', 'houseId', 'notes'] }
    })
  ],
  partnerships: [
    createMarriage(FOUNDER_MARRIAGE, ...FOUNDERS, { status: 'ended', certainty: 'unknown', notes: 'Unbekanntes historisches Gründerpaar vor der Überlieferungslücke.' }),
    createMarriage('marriage-craigddu-founders', 'craigddu-gruender', 'craigddu-gruenderin'),
    createMarriage('marriage-brenwyn-helyga-craigddu', 'brenwyn-craigddu', 'helyga-craigddu'),
    createMarriage('marriage-cyran-lleira-craigddu', 'cyran-craigddu', 'lleira-craigddu'),
    createMarriage('marriage-rhydric-maelena-craigddu', 'rhydric-craigddu', 'maelena-craigddu'),
    createMarriage('marriage-maelor-avelia-craigddu', 'maelor-craigddu', 'avelia-craigddu'),
    createMarriage('marriage-thalwyn-nerwen-craigddu', 'thalwyn-craigddu', 'nerwen-craigddu'),
    createMarriage('partnership-8ce5d0c5', 'person-28b0e0a3', 'person-0774c56b'),
    createMarriage('partnership-0f65c1d1', 'person-bc7dd4e8', 'person-d189ca4a', {
      extensions: { crossFamilyRelationship: { linkId: COEDDU_CRAIGDDU_MARRIAGE.linkId, counterpartFamilyId: 'haus-coeddu' } }
    })
  ],
  parentages: [
    ...createParentages(BROTHERS, FOUNDERS, FOUNDER_MARRIAGE, {
      type: 'claimed', certainty: 'unknown',
      notes: 'Brenwyn, Iestyn und Cyran sind Brüder. Ihre Verbindung zum Gründerpaar bezeichnet die Abstammung über nicht überlieferte Generationen, keine unmittelbare Elternschaft.',
      extensions: { timeJumpId: TIME_JUMP }
    }),
    ...createParentages(['rhydric-craigddu', 'maelor-craigddu'], ['brenwyn-craigddu', 'helyga-craigddu'], 'marriage-brenwyn-helyga-craigddu'),
    ...createParentages(['thalwyn-craigddu'], ['cyran-craigddu', 'lleira-craigddu'], 'marriage-cyran-lleira-craigddu'),
    ...createParentages(['ellor-craigddu', 'sairwen-craigddu'], ['rhydric-craigddu', 'maelena-craigddu'], 'marriage-rhydric-maelena-craigddu'),
    ...createParentages(['perian-craigddu'], ['maelor-craigddu', 'avelia-craigddu'], 'marriage-maelor-avelia-craigddu'),
    ...createParentages(['gwenella-craigddu'], ['thalwyn-craigddu', 'nerwen-craigddu'], 'marriage-thalwyn-nerwen-craigddu'),
    child('parentage-8b9ecbe3', 'person-28b0e0a3', ['craigddu-gruender', 'craigddu-gruenderin'], 'marriage-craigddu-founders'),
    child('parentage-3ba743cd', 'person-bc7dd4e8', ['craigddu-gruender', 'craigddu-gruenderin'], 'marriage-craigddu-founders'),
    ...[
      ['parentage-506a2c5f', 'person-36234a87'], ['parentage-ccb75498', 'person-abdbd916'],
      ['parentage-7151685d', 'person-650808a6'], ['parentage-9dd20cb1', 'person-f54eea82'],
      ['parentage-bb51296c', 'person-70f41f8d'], ['parentage-f2ae4cc1', 'person-c5e97e4f'],
      ['parentage-6b0659db', 'person-9be71788']
    ].map(([id, childId]) => child(id, childId, ['person-28b0e0a3', 'person-0774c56b'], 'partnership-8ce5d0c5'))
  ],
  houses: [
    { id: 'house-craigddu', name: 'Haus Craigddu', motto: '', emblem: EMBLEM, status: 'active', extensions: { registryManagedFields: ['name', 'emblem'] } },
    { id: 'house-coeddu', name: 'Haus Coeddu', motto: '', emblem: COEDDU_EMBLEM, status: 'active' }
  ],
  cadetBranches: [createMarriedAwayBranch({
    id: 'married-away-coeddu-catrin', name: 'Haus Coeddu', parentPartnershipId: 'partnership-0f65c1d1',
    houseId: 'house-coeddu', targetFamilyId: 'haus-coeddu', emblem: COEDDU_EMBLEM, crestFrame: 'iron',
    notes: 'Catrins und Llywelyns Sohn Ellian wird ausschließlich in der fortführenden Coeddu-Akte geführt.'
  })],
  timeJumps: [{
    id: TIME_JUMP, parentPartnershipId: FOUNDER_MARRIAGE, parentPersonId: '', childIds: BROTHERS,
    years: 0, fromYear: '', toYear: '1676', label: 'Nicht einzeln überlieferte Generationen bis zu Iestyn und seinen Brüdern',
    notes: 'Das Hauswappen folgt dem unbekannten Gründerpaar. Erst hinter dem Zeitsprung beginnt die Generation von Hywels Vater Iestyn und dessen Brüdern Brenwyn und Cyran.',
    extensions: { preparedPlaceholder: false }
  }],
  lineage: {
    founderPartnershipId: FOUNDER_MARRIAGE, houseId: 'house-craigddu',
    crestSubtitle: '', crestEmblemScale: 0.86, crestFrame: 'iron', crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: { focusPersonId: FOUNDERS[0], orientation: 'vertical', ancestorDepth: 8, descendantDepth: 8, limitGenerations: false, showSiblings: true },
  extensions: {
    sourceRevision: 3, blankFamily: false,
    sourceNote: 'Erweiterung nach Benutzervorgaben vom 28.09.2026: unbekanntes Gründerpaar, Wappen und Zeitsprung zu Iestyn mit zwei Brüdern, drei Vettern Hywels und deren Kindern. Bestehende Personen-, Beziehungs- und Weltpersonen-IDs sowie bekannte Lebensjahre bleiben erhalten; die historischen IDs craigddu-gruender und craigddu-gruenderin bezeichnen weiterhin Iestyn und Mared. Namen und Lebensjahre der neuen jüngeren Angehörigen sind erzählerische Ergänzungen nach dem Rheunwaith-Namensarchiv.',
    registry: { folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], unclassified: false },
    generatorProfile: { origin: 'Gwynthor', culture: '', religion: 'Alerische Kirche', governance: '', foundingYear: '', founderHouseName: '', houseColors: 'Schieferblau, Kohlegrau und Elfenbein', specialTraits: 'Baumeistertradition und generationslanger Waffendienst für Haus Draig' },
    registryTombstones: { persons: ['person-314f2418'], parentages: ['parentage-cf802205'] },
    registryManagedDocumentFields: ['title', 'description', 'emblem'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'liegeHouseId', 'liegeHouseName', 'regionEmblems'],
    registryManagedLineageFields: ['founderPartnershipId', 'crestFrame', 'timeGap'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations'],
    registryManagedRecordFields: ['folderPath'],
    registryManagedExtensionFields: ['registry', 'sourceNote', 'generatorProfile']
  }
});
