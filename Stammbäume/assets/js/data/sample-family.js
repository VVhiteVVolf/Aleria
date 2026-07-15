import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';

export const SAMPLE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-vael',
    title: 'Haus Vael',
    motto: 'Blut erinnert sich.',
    description: 'Hauptlinie, Nebenlinien und umstrittene Verbindungen des Hauses Vael.',
    emblem: 'assets/images/emblem-house-vael.svg'
  },
  houses: [
    { id: 'house-vael', name: 'Haus Vael', motto: 'Blut erinnert sich.', emblem: 'assets/images/emblem-house-vael.svg', status: 'active' },
    { id: 'house-thorne', name: 'Haus Thorne', motto: 'Wurzeln brechen Stein.', emblem: '', status: 'active' },
    { id: 'house-marr', name: 'Haus Marr', motto: 'Der Eid überdauert.', emblem: '', status: 'active' },
    { id: 'house-sgrechwyr', name: 'Haus Sgrechwyr', motto: 'Im Schatten wächst die Klinge.', emblem: 'assets/images/placeholders/neutral-crest.png', status: 'active' }
  ],
  persons: [
    { id: 'aeron-vael', name: 'Aeron Vael', title: 'Gründer des Nordturms', sex: 'male', status: 'dead', birth: '1178', death: '1244', portrait: '', houseId: 'house-vael', familyRole: 'core', tags: ['Gründer'], notes: 'Legendärer Begründer der überlieferten Hauptlinie.' },
    { id: 'lyria-vael', name: 'Lyria Vael', title: 'Gründerin des Nordturms', sex: 'female', status: 'dead', birth: '1181', death: '1252', portrait: '', houseId: 'house-thorne', familyRole: 'married', tags: ['Gründerin'], notes: 'Geboren als Lyria Thorne.' },
    { id: 'cassian-vael', name: 'Cassian Vael', title: 'Erbe der erneuerten Hauptlinie', sex: 'male', status: 'alive', birth: '1704', death: '', portrait: '', houseId: 'house-vael', familyRole: 'core', tags: ['Erbe'], notes: 'Erster lückenlos belegter Nachkomme nach dem großen Archivverlust.' },
    { id: 'maelis-vael', name: 'Maelis Vael', title: 'Hüterin der Archive', sex: 'female', status: 'alive', birth: '1708', death: '', portrait: '', houseId: 'house-vael', familyRole: 'core', tags: ['Magie'], notes: 'Ihre Blutlinie gilt als magisch berührt.' },
    { id: 'seraphine-thorne', name: 'Seraphine Thorne', title: 'Gesandte des Grünen Hofes', sex: 'female', status: 'alive', birth: '1706', death: '', portrait: '', houseId: 'house-thorne', familyRole: 'married', tags: ['Gesandte'], notes: '' },
    { id: 'elyra-mire', name: 'Elyra Mire', title: 'Sängerin am Winterhof', sex: 'female', status: 'missing', birth: '1710', death: '', portrait: '', houseId: '', familyRole: 'affair', tags: ['Geheim'], notes: 'Seit 1736 verschollen.' },
    { id: 'oryn-ash', name: 'Oryn Ash', title: 'Hauptmann der Aschegarde', sex: 'male', status: 'alive', birth: '1732', death: '', portrait: '', houseId: 'house-vael', familyRole: 'bastard', tags: ['Legitimiert'], notes: 'Später öffentlich als Angehöriger der Nebenlinie anerkannt.' },
    { id: 'nyra-vael', name: 'Nyra Vael', title: 'Junge Erbin', sex: 'female', status: 'alive', birth: '1731', death: '', portrait: '', houseId: 'house-vael', familyRole: 'core', tags: [], notes: '' },
    { id: 'isolde-marr', name: 'Isolde Marr', title: 'Pfand des Südbündnisses', sex: 'female', status: 'alive', birth: '1709', death: '', portrait: '', houseId: 'house-marr', familyRole: 'forced', tags: ['Politisches Bündnis'], notes: 'Die Verbindung wurde unter Zwang geschlossen und später gelöst.' },
    { id: 'gareth-rime', name: 'Gareth Rime', title: 'Mündel des Nordturms', sex: 'male', status: 'alive', birth: '1734', death: '', portrait: '', houseId: '', familyRole: 'ward', tags: ['Mündel'], notes: 'Nach dem Fall seines Hauses am Nordturm aufgenommen.' },
    { id: 'elowen-vael', name: 'Elowen Vael', title: 'Mündel am Grünen Hof', sex: 'female', status: 'alive', birth: '1737', death: '', portrait: '', houseId: 'house-vael', familyRole: 'ward-away', tags: ['Fortgegebenes Mündel'], notes: 'Zur Erziehung an Haus Thorne fortgegeben.' }
  ],
  partnerships: [
    { id: 'marriage-aeron-lyria', participantIds: ['aeron-vael', 'lyria-vael'], type: 'marriage', status: 'ended', start: '1201', end: '1244', certainty: 'confirmed', visibility: 'public', notes: '' },
    { id: 'marriage-cassian-seraphine', participantIds: ['cassian-vael', 'seraphine-thorne'], type: 'marriage', status: 'active', start: '1728', end: '', certainty: 'confirmed', visibility: 'public', notes: '' },
    { id: 'affair-maelis-elyra', participantIds: ['maelis-vael', 'elyra-mire'], type: 'affair', status: 'ended', start: '1729', end: '1736', certainty: 'probable', visibility: 'restricted', notes: '' },
    { id: 'union-maelis-isolde', participantIds: ['maelis-vael', 'isolde-marr'], type: 'forced', status: 'ended', start: '1725', end: '1727', certainty: 'confirmed', visibility: 'public', notes: 'Politisch erzwungene Verbindung.' }
  ],
  parentages: [
    { id: 'parentage-cassian', childId: 'cassian-vael', parentIds: ['aeron-vael', 'lyria-vael'], partnershipId: 'marriage-aeron-lyria', type: 'claimed', legitimacy: 'legitimate', certainty: 'confirmed', visibility: 'public', notes: 'Die Zwischenstufen der Linie gingen verloren.' },
    { id: 'parentage-maelis', childId: 'maelis-vael', parentIds: ['aeron-vael', 'lyria-vael'], partnershipId: 'marriage-aeron-lyria', type: 'claimed', legitimacy: 'legitimate', certainty: 'confirmed', visibility: 'public', notes: 'Die Zwischenstufen der Linie gingen verloren.' },
    { id: 'parentage-oryn', childId: 'oryn-ash', parentIds: ['maelis-vael', 'elyra-mire'], partnershipId: 'affair-maelis-elyra', type: 'biological', legitimacy: 'legitimized', certainty: 'probable', visibility: 'restricted', notes: '' },
    { id: 'parentage-nyra', childId: 'nyra-vael', parentIds: ['cassian-vael', 'seraphine-thorne'], partnershipId: 'marriage-cassian-seraphine', type: 'biological', legitimacy: 'legitimate', certainty: 'confirmed', visibility: 'public', notes: '' },
    { id: 'parentage-gareth', childId: 'gareth-rime', parentIds: ['cassian-vael', 'seraphine-thorne'], partnershipId: 'marriage-cassian-seraphine', type: 'foster', legitimacy: 'unknown', certainty: 'confirmed', visibility: 'public', notes: '' },
    { id: 'parentage-elowen', childId: 'elowen-vael', parentIds: ['cassian-vael', 'seraphine-thorne'], partnershipId: 'marriage-cassian-seraphine', type: 'biological', legitimacy: 'legitimate', certainty: 'confirmed', visibility: 'public', notes: 'Als Mündel an Haus Thorne fortgegeben.' }
  ],
  lineage: {
    founderPartnershipId: 'marriage-aeron-lyria',
    houseId: 'house-vael',
    crestSubtitle: 'Stammwappen des Nordturms',
    crestFrame: 'gold',
    timeGap: {
      enabled: true,
      years: 500,
      fromYear: '1252',
      toYear: '1704',
      label: 'Nach fünf Jahrhunderten beginnt die belegte Linie'
    }
  },
  cadetBranches: [
    {
      id: 'cadet-sgrechwyr',
      name: 'Haus Sgrechwyr',
      linkType: 'cadet-house',
      parentPartnershipId: 'marriage-cassian-seraphine',
      houseId: 'house-sgrechwyr',
      emblem: 'assets/images/placeholders/neutral-crest.png',
      crestFrame: 'silver',
      founded: '1738',
      targetFamilyId: 'haus-sgrechwyr',
      notes: 'Kadettenlinie des Nordturms.',
      extensions: {}
    }
  ],
  timeJumps: [],
  presentation: {
    relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS }
  },
  view: {
    focusPersonId: 'cassian-vael',
    orientation: 'vertical',
    ancestorDepth: 8,
    descendantDepth: 8,
    showSiblings: true
  },
  extensions: {}
});
