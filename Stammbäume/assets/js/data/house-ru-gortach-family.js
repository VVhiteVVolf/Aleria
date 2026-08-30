import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_RU_GORTACH_LOCAL_PORTRAIT_IDS,
  HOUSE_RU_GORTACH_PORTRAITS,
  HOUSE_RU_GORTACH_REUSED_PORTRAIT_IDS
} from './house-ru-gortach-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import {
  TIR_NA_GORTANNA_HOUSE_EMBLEMS
} from './tir-na-gortanna-house-profiles.js';
import { TIR_NA_SRUTH_HOUSE_EMBLEMS } from './tir-na-sruth-house-profiles.js';
import {
  TIR_NA_TONN_HOUSE_EMBLEMS,
  TIR_NA_TONN_HOUSE_PROFILES,
  TIR_NA_TONN_MANAGED_PROFILE_FIELDS
} from './tir-na-tonn-house-profiles.js';

const GORTACH_HOUSE_ID = 'house-gortach';
const GORTACH_EMBLEM = TIR_NA_TONN_HOUSE_EMBLEMS.gortach;

const HOUSE_HEAD_IDS = new Set([
  'aodhluan-founder-gortach',
  'garvan-gortach',
  'aodhluan-1621-gortach',
  'luibheas-gortach',
  'kinneth-gortach'
]);
const SUCCESSION_IDS = new Set([
  'peighneachan-gortach',
  'eilis-gortach',
  'loicin-gortach'
]);

const HEAD_TITLES = Object.freeze({
  'aodhluan-founder-gortach': 'Gründer des Ru’Gortach-Clans',
  'garvan-gortach': 'Laird von Broch an Ear · bis 1668',
  'aodhluan-1621-gortach': 'Laird von Broch an Ear · 1668–1695',
  'luibheas-gortach': 'Laird von Broch an Ear · 1695–1731',
  'kinneth-gortach': 'Laird von Broch an Ear · seit 1731',
  'peighneachan-gortach': 'Erster der Erbfolge des Laird',
  'eilis-gortach': 'Zweite der Erbfolge des Laird',
  'loicin-gortach': 'Dritter der Erbfolge des Laird'
});

const TARGETS = Object.freeze({
  tarvo: Object.freeze({
    name: 'Clan Fir An’Tarvo',
    houseId: 'house-tarvo',
    targetFamilyId: 'haus-fir-an-tarvo',
    emblem: TIR_NA_TONN_HOUSE_EMBLEMS['fir-an-tarvo']
  }),
  frisealach: Object.freeze({
    name: 'Ard Frisealach',
    houseId: 'house-frisealach',
    targetFamilyId: 'haus-ard-frisealach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach
  }),
  cumhail: Object.freeze({
    name: 'Clan Mac Ard Cumhaill',
    houseId: 'house-cumhail',
    targetFamilyId: 'haus-mac-ard-cumhaill',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']
  }),
  airt: Object.freeze({
    name: 'Clan Mac Airt',
    houseId: 'house-airt',
    targetFamilyId: 'haus-mac-airt',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-airt']
  }),
  ruitheach: Object.freeze({
    name: 'Dál’Ruitheach',
    houseId: 'house-ruitheach',
    targetFamilyId: 'haus-ruitheach',
    emblem: TIR_NA_TONN_HOUSE_EMBLEMS.ruitheach
  }),
  cruthin: Object.freeze({
    name: 'Clan Dál’Cruthin',
    houseId: 'house-cruthin',
    targetFamilyId: 'haus-dal-cruthin',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']
  })
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GORTACH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_RU_GORTACH_PORTRAITS[id] || '',
    portraitPlaceholder: options.portraitPlaceholder || 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === GORTACH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: { ...(options.extensions || {}) }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    ...options,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetKey, options = {}) {
  const target = TARGETS[targetKey];
  return person(id, name, 'female', birth, death, GORTACH_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'ru-gortach-parentage',
    ...options
  });
}

function endedMarriage(id, participantIds, end = '') {
  return createMarriage(id, ...participantIds, { status: 'ended', end });
}

function alignChildrenUnderWoman(record, womanPersonId, options = {}) {
  const managedFields = [
    ...(record.extensions?.registryManagedExtensionFields || []),
    'chartAlignPartnerOverChildrenPersonId',
    'chartAlignChildGroupBelowParentPair'
  ];
  if (options.reserveLeafChildLane) managedFields.push('chartReserveLeafChildLane');
  if (options.arrangeLeafChildrenEvenly) managedFields.push('chartArrangeLeafChildrenEvenly');
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignPartnerOverChildrenPersonId: womanPersonId,
      ...(options.reserveLeafChildLane ? { chartReserveLeafChildLane: true } : {}),
      ...(options.arrangeLeafChildrenEvenly ? { chartArrangeLeafChildrenEvenly: true } : {}),
      registryManagedExtensionFields: [...new Set(managedFields)]
    }
  };
}

function alignChildGroupBelowParentPair(record) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignChildGroupBelowParentPair: true,
      registryManagedExtensionFields: [...new Set([
        ...(record.extensions?.registryManagedExtensionFields || []),
        'chartAlignChildGroupBelowParentPair',
        'chartAlignPartnerOverChildrenPersonId',
        'chartReserveLeafChildLane',
        'chartArrangeLeafChildrenEvenly'
      ])]
    }
  };
}

function marriedAway(id, partnershipId, targetKey) {
  const target = TARGETS[targetKey];
  return createMarriedAwayBranch({
    id,
    name: target.name,
    parentPartnershipId: partnershipId,
    houseId: target.houseId,
    targetFamilyId: target.targetFamilyId,
    emblem: target.emblem,
    subtitle: `Wegverheiratet an ${target.name}`,
    extensions: { chartAlignBelowPartnership: true }
  });
}

const FOUNDERS = ['aodhluan-founder-gortach', 'tamsin-founder-gortach'];
const GARVAN = ['garvan-gortach', 'ellyn-gwefrydd'];
const GLAISNAIT = ['luntorius-tarvo', 'glaisnait-gortach'];
const AODHLUAN = ['aodhluan-1621-gortach', 'uthbhla-airgid'];
const DUIBHSEACH = ['eadbhard-frisealach', 'duibhseach-gortach'];
const FUIRSEACH = ['fuirseach-gortach', 'oighrig-haeghra'];
const FUIRSEACH_AFFAIR = ['fuirseach-gortach', 'rosmerta-gortach-affair'];
const LUIBHEAS = ['luibheas-gortach', 'laoise-luga'];
const SADHBH = ['dubhan-cumhail', 'sadhbh-gortach'];
const LUGHAIDH = ['lughaidh-gortach', 'priosa-marcaigh'];
const KINNETH = ['kinneth-gortach', 'rionach-amhran'];
const CAOILTE = ['niallan-airt', 'caoilte-gortach'];
const QUISEOG = ['muirinn-ruitheach', 'quiseog-gortach'];
const JODHRAN = ['jodhran-gortach', 'joneen-gortach'];
const PEIGHNEACHAN = ['peighneachan-gortach', 'ronmara-tarvo'];
const AOGHAN = ['aoghan-gortach', 'mona-haeghra'];
const ZOLAITH = ['koibhne-cruthin', 'zolaith-gortach'];
const SEAMUS = ['juana-giolla', 'seamus-gortach'];
const SEAMUS_AFFAIR = ['seamus-gortach', 'mide-gortach'];
const HIOMHAR_AFFAIR = ['mide-gortach', 'hiomhar-gortach'];
const HIOMHAR = ['hiomhar-gortach', 'trianne-gortach'];

export const HOUSE_RU_GORTACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gortach',
    title: 'Ru’Gortach',
    motto: '',
    description: 'Laird-Clan der östlichen Herrschaft von Tir na Tonn mit Sitz in Broch an Ear.',
    emblem: GORTACH_EMBLEM,
    houseProfile: TIR_NA_TONN_HOUSE_PROFILES.gortach
  },
  houses: [
    house(GORTACH_HOUSE_ID, 'Ru’Gortach', GORTACH_EMBLEM),
    house('house-gwefrydd', 'Haus Gwefrydd', 'assets/images/houses/Artus Streben/haus-gwefrydd.png'),
    house('house-tarvo', 'Clan Fir An’Tarvo', TIR_NA_TONN_HOUSE_EMBLEMS['fir-an-tarvo']),
    house('house-airgid', 'Haus Airgid'),
    house('house-frisealach', 'Ard Frisealach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach),
    house('house-haeghra', 'Haus Haeghra'),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']),
    house('house-marcaigh', 'Haus Marcaigh'),
    house('house-airt', 'Clan Mac Airt', LEITHEACH_HOUSE_EMBLEMS['mac-airt']),
    house('house-ruitheach', 'Dál’Ruitheach', TIR_NA_TONN_HOUSE_EMBLEMS.ruitheach),
    house('house-amrhan', 'Clan Ua’Amhran', TIR_NA_SRUTH_HOUSE_EMBLEMS.amrhan),
    house('house-cruthin', 'Clan Dál’Cruthin', TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']),
    house('house-giolla', 'Haus Giolla')
  ],
  persons: [
    person('aodhluan-founder-gortach', 'Aodhluán Gortach', 'male', '????', '????', GORTACH_HOUSE_ID, {
      tags: ['Gründer']
    }),
    spouse('tamsin-founder-gortach', 'Tamsin', 'female', '????', '????'),

    person('garvan-gortach', 'Garvan Gortach', 'male', '1599', '1668'),
    awayWoman('glaisnait-gortach', 'Glaisnait Gortach', '1611', '1688', 'tarvo'),
    spouse('ellyn-gwefrydd', 'Ellyn Gwefrydd', 'female', '1600', '1671', 'house-gwefrydd'),
    spouse('luntorius-tarvo', 'Luntorius Tarvo', 'male', '1607', '1698', 'house-tarvo'),

    person('aodhluan-1621-gortach', 'Aodhluán Gortach', 'male', '1621', '1695'),
    awayWoman('duibhseach-gortach', 'Duibhseach Gortach', '1632', '1704', 'frisealach'),
    person('fuirseach-gortach', 'Fuirseach Gortach', 'male', '1632', '1677', GORTACH_HOUSE_ID, {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['oighrig-haeghra', 'rosmerta-gortach-affair'],
        chartKeepPartnerGroupTogether: true,
        registryManagedExtensionFields: [
          'chartCenterBetweenPartnerPersonIds',
          'chartKeepPartnerGroupTogether'
        ]
      }
    }),
    spouse('uthbhla-airgid', 'Uthbhla Airgid', 'female', '1628', '1690', 'house-airgid'),
    spouse('eadbhard-frisealach', 'Èadbhard Frisealach', 'male', '1632', '1697', 'house-frisealach'),
    spouse('oighrig-haeghra', 'Oighrig Haeghra', 'female', '1634', '1691', 'house-haeghra'),
    spouse('rosmerta-gortach-affair', 'Rosmerta', 'female', '1638', '1671', '', {
      familyRole: 'affair',
      title: 'Affäre Fuirseachs · Mutter Carthachs',
      tags: ['Affäre'],
      extensions: { registryManagedFields: ['title'] }
    }),

    person('luibheas-gortach', 'Luibheas Gortach', 'male', '1646', '1731'),
    awayWoman('sadhbh-gortach', 'Sadhbh Gortach', '1655', '1704', 'cumhail'),
    person('lughaidh-gortach', 'Lughaidh Gortach', 'male', '1656', '1720', GORTACH_HOUSE_ID, {
      extensions: { registryManagedFields: ['familyRole', 'title', 'tags'] }
    }),
    person('carthach-gortach', 'Carthach Gortach', 'female', '1657', '', GORTACH_HOUSE_ID, {
      familyRole: 'bastard',
      title: 'Bastardtochter Fuirseachs und Rosmertas · Ordensmitglied',
      tags: ['Bastard', 'Ordensmitglied'],
      notes: 'Carthach ist die uneheliche Tochter Fuirseachs und Rosmertas. Sie trat einem Orden bei und dient dem Clan außerhalb der weltlichen Erbfolge.',
      extensions: { registryManagedFields: ['familyRole', 'title', 'tags', 'notes'] }
    }),
    spouse('laoise-luga', 'Laoise Luga', 'female', '1651', ''),
    spouse('dubhan-cumhail', 'Dubhan Cumhail', 'male', '1655', '1716', 'house-cumhail'),
    spouse('priosa-marcaigh', 'Príosa Marcaigh', 'female', '1658', '1736', 'house-marcaigh'),

    person('kinneth-gortach', 'Kinneth Gortach', 'male', '1673', ''),
    awayWoman('caoilte-gortach', 'Caoilte Gortach', '1679', '', 'airt'),
    awayWoman('quiseog-gortach', 'Quiseog Gortach', '1675', '', 'ruitheach'),
    person('jodhran-gortach', 'Jodhrán Gortach', 'male', '1678', ''),
    spouse('rionach-amhran', 'Rionach Amrhan', 'female', '1676', '', 'house-amrhan', {
      extensions: { registryManagedFields: ['worldPersonId', 'name', 'houseId', 'portrait'] }
    }),
    spouse('niallan-airt', 'Niallán Airt', 'male', '1677', '', 'house-airt'),
    spouse('muirinn-ruitheach', 'Muirinn Ruitheach', 'male', '1672', '', 'house-ruitheach', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('joneen-gortach', 'Joneen', 'female', '1680', ''),

    person('peighneachan-gortach', 'Peighneachan Gortach', 'male', '1690', ''),
    person('aoghan-gortach', 'Aoghán Gortach', 'male', '1695', ''),
    awayWoman('zolaith-gortach', 'Zólaith Gortach', '1704', '', 'cruthin'),
    person('seamus-gortach', 'Séamus Gortach', 'male', '1695', ''),
    person('hiomhar-gortach', 'Híomhar Gortach', 'male', '1708', ''),
    spouse('ronmara-tarvo', 'Rónmara Tarvo', 'female', '1695', '', 'house-tarvo'),
    spouse('mona-haeghra', 'Móna Haeghra', 'female', '1700', '', 'house-haeghra', {
      extensions: {
        registryManagedFields: ['title', 'tags'],
        registryManagedExtensionFields: [
          'chartCenterBetweenPartnerPersonIds',
          'chartKeepPartnerGroupTogether'
        ]
      }
    }),
    spouse('koibhne-cruthin', 'Koibhne Cruthin', 'male', '1702', '', 'house-cruthin'),
    spouse('juana-giolla', 'Júana Giolla', 'female', '1702', '', 'house-giolla'),
    spouse('mide-gortach', 'Míde', 'female', '1707', '', '', {
      familyRole: 'affair',
      title: 'Affäre Séamus’ und Híomhars · Mutter Bricius und Hanaes',
      tags: ['Affäre'],
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['seamus-gortach', 'hiomhar-gortach'],
        chartKeepPartnerGroupTogether: true,
        chartPartnerGroupPersonOrder: [
          'juana-giolla',
          'seamus-gortach',
          'mide-gortach',
          'hiomhar-gortach',
          'trianne-gortach'
        ],
        registryManagedExtensionFields: [
          'chartCenterBetweenPartnerPersonIds',
          'chartKeepPartnerGroupTogether',
          'chartPartnerGroupPersonOrder'
        ]
      }
    }),
    spouse('trianne-gortach', 'Trianne', 'female', '1705', ''),

    person('eilis-gortach', 'Eilis Gortach', 'female', '1716', ''),
    person('loicin-gortach', 'Loicín Gortach', 'male', '1721', ''),
    person('eadan-gortach', 'Èadan Gortach', 'male', '1723', ''),
    person('urchadh-gortach', 'Urchadh Gortach', 'male', '1726', ''),
    person('zilbra-gortach', 'Zilbra Gortach', 'female', '1730', ''),
    person('midean-gortach', 'Mídean Gortach', 'male', '1721', ''),
    person('noreen-gortach', 'Noreen Gortach', 'female', '1722', ''),
    person('briciu-gortach', 'Briciu Gortach', 'male', '1732', '', GORTACH_HOUSE_ID, {
      familyRole: 'bastard',
      title: 'Bastardsohn Séamus’ und Mídes',
      tags: ['Bastard']
    }),
    person('hanae-gortach', 'Hanae Gortach', 'female', '1728', '', GORTACH_HOUSE_ID, {
      familyRole: 'bastard',
      title: 'Bastardtochter Híomhars und Mídes',
      tags: ['Bastard']
    }),
    person('vadran-gortach', 'Vadrán Gortach', 'male', '1734', '')
  ],
  partnerships: [
    endedMarriage('marriage-aodhluan-tamsin-gortach', FOUNDERS),
    alignChildGroupBelowParentPair(endedMarriage('marriage-ellyn-garvan', GARVAN, '1668')),
    endedMarriage('marriage-luntorius-glaisnait', GLAISNAIT, '1688'),
    alignChildGroupBelowParentPair(
      endedMarriage('marriage-aodhluan-uthbhla-gortach', AODHLUAN, '1690')
    ),
    endedMarriage('marriage-eadbhard-duibhseach', DUIBHSEACH, '1697'),
    alignChildGroupBelowParentPair(
      endedMarriage('marriage-fuirseach-oighrig-gortach', FUIRSEACH, '1677')
    ),
    alignChildrenUnderWoman(createMarriage('affair-fuirseach-rosmerta-gortach', ...FUIRSEACH_AFFAIR, {
      type: 'affair',
      status: 'ended',
      end: '1671',
      visibility: 'private'
    }), 'rosmerta-gortach-affair'),
    alignChildGroupBelowParentPair(
      endedMarriage('marriage-luibheas-laoise-gortach', LUIBHEAS, '1731')
    ),
    endedMarriage('marriage-dubhan-sadhbh', SADHBH, '1704'),
    alignChildGroupBelowParentPair(
      endedMarriage('marriage-lughaidh-priosa-gortach', LUGHAIDH, '1720')
    ),
    alignChildGroupBelowParentPair(
      createMarriage('marriage-kinneth-rionach-gortach', ...KINNETH)
    ),
    createMarriage('marriage-niallan-caoilte-gortach', ...CAOILTE),
    createMarriage('marriage-muirinn-quiseog-gortach', ...QUISEOG),
    alignChildGroupBelowParentPair(
      createMarriage('marriage-jodhran-joneen-gortach', ...JODHRAN)
    ),
    alignChildGroupBelowParentPair(
      createMarriage('marriage-peighneachan-ronmara', ...PEIGHNEACHAN)
    ),
    alignChildGroupBelowParentPair(
      createMarriage('marriage-aoghan-mona-gortach', ...AOGHAN)
    ),
    createMarriage('marriage-koibhne-zolaith', ...ZOLAITH),
    alignChildrenUnderWoman(createMarriage('marriage-juana-seamus-gortach', ...SEAMUS), 'juana-giolla', {
      reserveLeafChildLane: true,
      arrangeLeafChildrenEvenly: true
    }),
    alignChildGroupBelowParentPair(createMarriage('affair-seamus-mide-gortach', ...SEAMUS_AFFAIR, {
      type: 'affair',
      status: 'secret',
      visibility: 'private',
      extensions: {
        chartCenteredPartnershipLine: true,
        registryManagedExtensionFields: ['chartCenteredPartnershipLine']
      }
    })),
    alignChildGroupBelowParentPair(createMarriage('affair-hiomhar-mide-gortach', ...HIOMHAR_AFFAIR, {
      type: 'affair',
      status: 'secret',
      visibility: 'private',
      extensions: {
        chartCenteredPartnershipLine: true,
        registryManagedExtensionFields: ['chartCenteredPartnershipLine']
      }
    })),
    alignChildrenUnderWoman(createMarriage('marriage-hiomhar-trianne-gortach', ...HIOMHAR), 'trianne-gortach', {
      reserveLeafChildLane: true
    })
  ],
  parentages: [
    ...childrenOf(['garvan-gortach', 'glaisnait-gortach'], FOUNDERS, 'marriage-aodhluan-tamsin-gortach', {
      type: 'claimed',
      certainty: 'disputed',
      notes: 'Die Quelle setzt zwischen dem Gründerpaar und der ab 1599 datierten Linie eine ausdrückliche, nicht einzeln überlieferte Generationenfolge.',
      extensions: { timeJumpId: 'gap-aodhluan-garvan-glaisnait-gortach' }
    }),
    ...childrenOf(['aodhluan-1621-gortach', 'duibhseach-gortach', 'fuirseach-gortach'], GARVAN, 'marriage-ellyn-garvan'),
    ...childrenOf(['luibheas-gortach', 'sadhbh-gortach'], AODHLUAN, 'marriage-aodhluan-uthbhla-gortach'),
    ...childrenOf(['lughaidh-gortach'], FUIRSEACH, 'marriage-fuirseach-oighrig-gortach', {
      extensions: {
        registryManagedFields: ['parentIds', 'partnershipId', 'legitimacy', 'notes']
      }
    }),
    ...childrenOf(['carthach-gortach'], FUIRSEACH_AFFAIR, 'affair-fuirseach-rosmerta-gortach', {
      legitimacy: 'illegitimate',
      extensions: {
        registryManagedFields: ['parentIds', 'partnershipId', 'legitimacy', 'notes']
      }
    }),
    ...childrenOf(['kinneth-gortach', 'caoilte-gortach'], LUIBHEAS, 'marriage-luibheas-laoise-gortach'),
    ...childrenOf(['quiseog-gortach', 'jodhran-gortach'], LUGHAIDH, 'marriage-lughaidh-priosa-gortach'),
    ...childrenOf(['peighneachan-gortach', 'aoghan-gortach', 'zolaith-gortach'], KINNETH, 'marriage-kinneth-rionach-gortach'),
    ...childrenOf(['seamus-gortach', 'hiomhar-gortach'], JODHRAN, 'marriage-jodhran-joneen-gortach'),
    ...childrenOf(['eilis-gortach', 'loicin-gortach'], PEIGHNEACHAN, 'marriage-peighneachan-ronmara'),
    ...childrenOf(['eadan-gortach', 'urchadh-gortach', 'zilbra-gortach'], AOGHAN, 'marriage-aoghan-mona-gortach'),
    ...childrenOf(['midean-gortach', 'noreen-gortach'], SEAMUS, 'marriage-juana-seamus-gortach'),
    ...childrenOf(['briciu-gortach'], SEAMUS_AFFAIR, 'affair-seamus-mide-gortach', {
      legitimacy: 'illegitimate'
    }),
    ...childrenOf(['hanae-gortach'], HIOMHAR_AFFAIR, 'affair-hiomhar-mide-gortach', {
      legitimacy: 'illegitimate'
    }),
    ...childrenOf(['vadran-gortach'], HIOMHAR, 'marriage-hiomhar-trianne-gortach')
  ],
  cadetBranches: [
    marriedAway('married-away-tarvo-glaisnait', 'marriage-luntorius-glaisnait', 'tarvo'),
    marriedAway('married-away-frisealach-duibhseach', 'marriage-eadbhard-duibhseach', 'frisealach'),
    marriedAway('married-away-cumhail-sadhbh', 'marriage-dubhan-sadhbh', 'cumhail'),
    marriedAway('married-away-airt-caoilte', 'marriage-niallan-caoilte-gortach', 'airt'),
    marriedAway('married-away-ruitheach-quiseog', 'marriage-muirinn-quiseog-gortach', 'ruitheach'),
    marriedAway('married-away-cruthin-zolaith', 'marriage-koibhne-zolaith', 'cruthin')
  ],
  timeJumps: [
    {
      id: 'gap-aodhluan-garvan-glaisnait-gortach',
      parentPartnershipId: 'marriage-aodhluan-tamsin-gortach',
      childIds: ['garvan-gortach', 'glaisnait-gortach'],
      years: 0,
      fromYear: '????',
      toYear: '1599',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1599 datierten Linie',
      notes: 'Die Punktreihe der Quellakte wird als serieller Zeitsprung erhalten.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-aodhluan-tamsin-gortach',
    houseId: GORTACH_HOUSE_ID,
    crestSubtitle: 'Laird · Herrschaft Ru’Gortach · Broch an Ear · Tir na Tonn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aodhluan-founder-gortach',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Ru’Gortach (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Amtszeiten und Erbfolge folgen der bereitgestellten Ru’Gortach-Akte. Lughaidh ist das legitime Kind Fuirseachs und Oighrig Haeghras; Carthach ist die uneheliche Tochter Fuirseachs und Rosmertas und steht im Diagramm direkt unter ihrer Mutter. Die doppelte Darstellung Móna Haeghras in der Quelle war ein Darstellungsfehler; kanonisch ist sie ausschließlich Aogháns Ehefrau. Míde steht als gemeinsame Affäre zwischen Séamus und Híomhar. Die Fünfergruppe folgt fest der Reihenfolge Júana – Séamus – Míde – Híomhar – Trianne; die ehelichen Kinder stehen dort unter den Ehefrauen, Briciu und Hanae jeweils unter der Mitte ihrer Affärenlinie. Alle übrigen Kindergruppen entspringen normal der Mitte ihres jeweiligen Elternpaares. Bestehende Weltpersonen und Ehe-IDs werden mit den Gegenakten geteilt. Wiederholte Standardsilhouetten werden nicht als individuelle Porträts übernommen.',
    sourceRevision: 7,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Laird von Broch an Ear',
      headOrder: Object.freeze([
        'aodhluan-founder-gortach',
        'garvan-gortach',
        'aodhluan-1621-gortach',
        'luibheas-gortach',
        'kinneth-gortach'
      ]),
      publishedOrder: Object.freeze([
        'peighneachan-gortach',
        'eilis-gortach',
        'loicin-gortach'
      ])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_RU_GORTACH_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_RU_GORTACH_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir na Tonn',
    territoryGloss: 'Land der Wellen',
    historicalStatus: 'active',
    albicRank: 'laird',
    administrativeRole: 'Laird der Herrschaft Ru’Gortach',
    immediateLiegeHouseId: 'haus-fir-an-tarvo',
    immediateLiegeHouseName: 'Clan Fir An’Tarvo',
    legacyTitles: Object.freeze(['Haus Gortach', "Ru'Gortach"]),
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'sourceNote',
      'inheritance',
      'portraitPolicy',
      'principality',
      'territory',
      'territoryGloss',
      'historicalStatus',
      'albicRank',
      'administrativeRole',
      'immediateLiegeHouseId',
      'immediateLiegeHouseName',
      'legacyTitles'
    ],
    registryManagedHouseProfileFields: TIR_NA_TONN_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['houseId'],
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: ['haus-gortach-gruender', 'haus-gortach-gruenderin'],
      partnerships: ['marriage-haus-gortach-founders', 'affair-peighneachan-mona-gortach'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
