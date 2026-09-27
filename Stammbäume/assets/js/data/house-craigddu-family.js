import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { createFamilyPerson, createMarriage, createMarriedAwayBranch } from './family-record-builders.js';
import { COEDDU_CRAIGDDU_MARRIAGE } from './coeddu-craigddu-marriage.js';
import { LLYWELYN_COEDDU_BIOGRAPHY } from './person-biographies/llywelyn-coeddu.js';

const EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Craigddu.png';
const COEDDU_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Coeddu.png';

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
    description: 'Bürgerliche Familie aus Gwynthor. Hywel dient als Waffenknecht; seine Schwester Catrin ist mit Llywelyn Coeddu verheiratet.',
    emblem: EMBLEM, houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.craigddu
  },
  persons: [
    person('craigddu-gruender', 'Iestyn Craigddu', 'male', '1680', { title: 'Gründer des Hauses', lineageRole: 'branch', tags: ['Gründerfamilie'] }),
    person('craigddu-gruenderin', 'Mared', 'female', '1683', { title: 'Gründerin des Hauses', familyRole: 'married', lineageRole: 'branch', tags: ['Gründerfamilie'] }),
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
    createMarriage('marriage-craigddu-founders', 'craigddu-gruender', 'craigddu-gruenderin'),
    createMarriage('partnership-8ce5d0c5', 'person-28b0e0a3', 'person-0774c56b'),
    createMarriage('partnership-0f65c1d1', 'person-bc7dd4e8', 'person-d189ca4a', {
      extensions: { crossFamilyRelationship: { linkId: COEDDU_CRAIGDDU_MARRIAGE.linkId, counterpartFamilyId: 'haus-coeddu' } }
    })
  ],
  parentages: [
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
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-craigddu-founders', houseId: 'house-craigddu',
    crestSubtitle: '', crestEmblemScale: 0.86, crestFrame: 'iron', crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: { focusPersonId: 'craigddu-gruender', orientation: 'vertical', ancestorDepth: 8, descendantDepth: 8, limitGenerations: false, showSiblings: true },
  extensions: {
    sourceRevision: 2, blankFamily: false,
    sourceNote: 'Bestehende Craigddu-Akte vom 27.09.2026; sämtliche Personen-, Beziehungs- und Weltpersonen-IDs sowie überlieferte Lebensjahre bleiben erhalten. Der bisher unbenannte Ehemann Catrins ist Llywelyn Coeddu. Wappen und Zuordnung nach Benutzervorgaben.',
    registry: { folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], unclassified: false },
    generatorProfile: { origin: 'Gwynthor', culture: '', religion: 'Alerische Kirche', governance: '', foundingYear: '1680', founderHouseName: '', houseColors: 'Schieferblau, Kohlegrau und Elfenbein', specialTraits: '' },
    registryTombstones: { persons: ['person-314f2418'], parentages: ['parentage-cf802205'] },
    registryManagedDocumentFields: ['title', 'description', 'emblem'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'liegeHouseId', 'liegeHouseName', 'regionEmblems'],
    registryManagedLineageFields: ['crestFrame'],
    registryManagedRecordFields: ['folderPath'],
    registryManagedExtensionFields: ['registry']
  }
});
