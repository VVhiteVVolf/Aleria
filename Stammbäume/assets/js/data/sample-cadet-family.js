import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';

export const SAMPLE_CADET_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-sgrechwyr',
    title: 'Haus Sgrechwyr',
    motto: 'Im Schatten wächst die Klinge.',
    description: 'Eine junge Kadettenlinie von Haus Vael.',
    emblem: '../IconOrdner/Siluetten/Neutrales Adelswappen.png'
  },
  houses: [
    { id: 'house-sgrechwyr', name: 'Haus Sgrechwyr', motto: 'Im Schatten wächst die Klinge.', emblem: '../IconOrdner/Siluetten/Neutrales Adelswappen.png', status: 'active' }
  ],
  persons: [
    { id: 'rhys-sgrechwyr', name: 'Rhys Sgrechwyr', title: 'Gründer der Kadettenlinie', sex: 'male', status: 'dead', birth: '1688', death: '1735', portrait: '', houseId: 'house-sgrechwyr', familyRole: 'core', tags: ['Gründer'], notes: '' },
    { id: 'eira-sgrechwyr', name: 'Eira Sgrechwyr', title: 'Herrin des Dornhofs', sex: 'female', status: 'dead', birth: '1692', death: '1738', portrait: '', houseId: 'house-sgrechwyr', familyRole: 'married', tags: ['Gründerin'], notes: '' },
    { id: 'bran-sgrechwyr', name: 'Bran Sgrechwyr', title: 'Erbe des Dornhofs', sex: 'male', status: 'alive', birth: '1715', death: '', portrait: '', houseId: 'house-sgrechwyr', familyRole: 'core', tags: ['Erbe'], notes: '' }
  ],
  partnerships: [
    { id: 'marriage-rhys-eira', participantIds: ['rhys-sgrechwyr', 'eira-sgrechwyr'], type: 'marriage', status: 'ended', start: '1712', end: '1735', certainty: 'confirmed', visibility: 'public', notes: '' }
  ],
  parentages: [
    { id: 'parentage-bran', childId: 'bran-sgrechwyr', parentIds: ['rhys-sgrechwyr', 'eira-sgrechwyr'], partnershipId: 'marriage-rhys-eira', type: 'biological', legitimacy: 'legitimate', certainty: 'confirmed', visibility: 'public', notes: '' }
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-rhys-eira',
    houseId: 'house-sgrechwyr',
    crestSubtitle: '',
    crestFrame: 'silver',
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: { focusPersonId: 'bran-sgrechwyr', orientation: 'vertical', ancestorDepth: 6, descendantDepth: 6, showSiblings: true },
  extensions: {}
});
