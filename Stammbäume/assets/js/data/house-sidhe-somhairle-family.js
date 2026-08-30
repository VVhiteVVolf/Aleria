import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_SIDHE_SOMHAIRLE_LOCAL_PORTRAIT_IDS,
  HOUSE_SIDHE_SOMHAIRLE_PORTRAITS,
  HOUSE_SIDHE_SOMHAIRLE_REUSED_PORTRAIT_IDS
} from './house-sidhe-somhairle-portraits.js';
import {
  SIDHE_SOMHAIRLE_ORIGIN,
  TIR_NA_GORTANNA_HOUSE_EMBLEMS,
  TIR_NA_GORTANNA_HOUSE_PROFILES,
  TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS
} from './tir-na-gortanna-house-profiles.js';

const SOMHAIRLE_HOUSE_ID = 'house-somhairle';
const SOMHAIRLE_EMBLEM = TIR_NA_GORTANNA_HOUSE_EMBLEMS.somhairle;

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death',
  'portrait', 'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole',
  'tags', 'notes'
]);

const HEAD_TITLES = Object.freeze({
  'siomhrach-founder-somhairle': 'Heilige Gründerin und erste Laird der Sidhe Somhairle',
  'oighreag-somhairle': 'Laird der Sidhe Somhairle · bis 1694',
  'muiredach-somhairle': 'Laird der Sidhe Somhairle · 1694–1720',
  'klaihn-somhairle': 'Laird der Sidhe Somhairle · seit 1720'
});

const SUCCESSION_TITLES = Object.freeze({
  'oisean-somhairle': 'Erster in der Erbfolge der Sidhe Somhairle',
  'hectan-somhairle': 'Zweiter in der Erbfolge der Sidhe Somhairle'
});

const TARGETS = Object.freeze({
  trodach: Object.freeze({
    name: 'Ard Trodach',
    houseId: 'house-trodach',
    targetFamilyId: 'haus-ard-trodach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']
  }),
  cruthin: Object.freeze({
    name: 'Clan Dál’Cruthin',
    houseId: 'house-cruthin',
    targetFamilyId: 'haus-dal-cruthin',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']
  }),
  frisealach: Object.freeze({
    name: 'Ard Frisealach',
    houseId: 'house-frisealach',
    targetFamilyId: 'haus-frisealach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach
  }),
  blar: Object.freeze({
    name: 'Nic’Blar in Leitheach',
    houseId: 'house-nic-blar',
    targetFamilyId: 'haus-nic-blar-leitheach',
    emblem: 'assets/images/houses/Ceitheach/clan-nic-blar.png'
  })
});

function lineageRoleFor(personId) {
  if (HEAD_TITLES[personId]) return 'head';
  return SUCCESSION_TITLES[personId] ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = SOMHAIRLE_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_SIDHE_SOMHAIRLE_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === SOMHAIRLE_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || SUCCESSION_TITLES[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    ...options,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayMember(id, name, sex, birth, death, targetKey, options = {}) {
  const target = TARGETS[targetKey];
  return person(id, name, sex, birth, death, SOMHAIRLE_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
    tags: [...new Set([...(options.tags || []), 'Wegverheiratet'])]
  });
}

function house(id, name, emblem = '', status = 'active') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status,
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'somhairle-parentage',
    ...options
  });
}

function endedMarriage(id, participantIds, end = '') {
  return createMarriage(id, ...participantIds, { status: 'ended', end });
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
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

const FOUNDER_IDS = ['siomhrach-founder-somhairle', 'deaglan-ancient-somhairle'];
const OIGHREAG_IDS = ['oighreag-somhairle', 'tomaltach-leite'];
const SEARLAS_IDS = ['searlas-somhairle', 'blathnaid-blar'];
const LATHARNA_IDS = ['uinseann-trodach', 'latharna-somhairle'];
const MUIREDACH_IDS = ['glaodhach-frisealach', 'muiredach-somhairle'];
const PROINNSEAS_IDS = ['proinnseas-somhairle', 'doireann-airgid'];
const EIBHEAR_IDS = ['eibhear-somhairle', 'oydis-helgr'];
const KLAIHN_IDS = ['klaihn-somhairle', 'caireann-leite'];
const JONAIRE_IDS = ['zearlach-blar', 'jonaire-somhairle'];
const OISEAN_IDS = ['oisean-somhairle', 'vailibh-craobhan'];
const AILIDH_IDS = ['fearghus-1699-cruthin', 'ailidh-somhairle'];
const FIONNCHU_IDS = ['fionnchu-somhairle', 'ybhna-iomrach'];
const WIHALG_IDS = ['hurracan-frisealach', 'wihalg-somhairle'];
const BREANNA_IDS = ['conan-iomrach', 'breanna-somhairle'];

export const HOUSE_SIDHE_SOMHAIRLE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-somhairle',
    title: 'Sidhe Somhairle',
    motto: '',
    description: 'Aus Glaennmor in Tir na Dun stammender Laird-Clan und gegenwärtiger Verwalter von Broch an Clais.',
    emblem: SOMHAIRLE_EMBLEM,
    houseProfile: TIR_NA_GORTANNA_HOUSE_PROFILES.somhairle
  },
  houses: [
    house(SOMHAIRLE_HOUSE_ID, 'Sidhe Somhairle', SOMHAIRLE_EMBLEM),
    house('house-leite', 'Haus Leite'),
    house('house-nic-blar', 'Clan Nic Blar', 'assets/images/houses/Ceitheach/clan-nic-blar.png'),
    house('house-trodach', 'Ard Trodach', TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']),
    house('house-frisealach', 'Ard Frisealach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach),
    house('house-airgid', 'Haus Airgid'),
    house('house-helgr', 'Clan Helgr'),
    house('house-cruthin', 'Clan Dál’Cruthin', TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']),
    house('house-craobhan', 'Haus Craobhan'),
    house('house-iomrach', 'An’Iomrach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.iomrach, 'extinct')
  ],
  persons: [
    person('siomhrach-founder-somhairle', 'St. Síomhrach Somhairle', 'female', '????', '????', SOMHAIRLE_HOUSE_ID, {
      tags: ['Gründerin', 'Heilige'],
      notes: 'Heilige Gründerin des Clans. Ihre Abstammung wurde der Überlieferung zufolge mehrfach durch Druiden und Glaubensvertreter bestätigt.'
    }),
    spouse('deaglan-ancient-somhairle', 'Déaglan', 'male', '????', '????'),

    person('oighreag-somhairle', 'Oighreag Somhairle', 'female', '1627', '1694'),
    spouse('tomaltach-leite', 'Tomaltach Leite', 'male', '1628', '1684', 'house-leite'),
    person('searlas-somhairle', 'Searlas Somhairle', 'male', '1629', '1714'),
    spouse('blathnaid-blar', 'Blathnaid Blár', 'female', '1625', '1701', 'house-nic-blar'),

    awayMember('latharna-somhairle', 'Latharna Somhairle', 'female', '1656', '1739', 'trodach'),
    spouse('uinseann-trodach', 'Uinseann Trodach', 'male', '1656', '1720', 'house-trodach'),
    person('muiredach-somhairle', 'Muiredach Somhairle', 'male', '1648', '1720'),
    spouse('glaodhach-frisealach', 'Glaodhach Frisealach', 'female', '1655', '1699', 'house-frisealach'),
    person('proinnseas-somhairle', 'Proinnseas Somhairle', 'male', '1648', '1720', SOMHAIRLE_HOUSE_ID, {
      title: 'Ritter des Ordens der Abkömmlinge',
      tags: ['Abkömmlinge'],
      notes: 'Zog mit dem albisch-ritterlichen Orden der Abkömmlinge in den Krieg und fiel 1720 im Kampf gegen die infernale Bedrohung.'
    }),
    spouse('doireann-airgid', 'Doireann Airgid', 'female', '1650', '1720', 'house-airgid'),
    person('eibhear-somhairle', 'Eibhear Somhairle', 'male', '1660', '1720', SOMHAIRLE_HOUSE_ID, {
      title: 'Ritter des Ordens der Abkömmlinge',
      tags: ['Abkömmlinge'],
      notes: 'Mitglied des Ordens der Abkömmlinge; fiel 1720 im großen Krieg um Ceitheach gegen die infernale Bedrohung.'
    }),
    spouse('oydis-helgr', 'Oydis Helgr', 'female', '1660', '1700', 'house-helgr'),

    person('klaihn-somhairle', 'Klaihn Somhairle', 'male', '1674', ''),
    spouse('caireann-leite', 'Caireann Leite', 'female', '1675', '', 'house-leite'),
    awayMember('jonaire-somhairle', 'Jonaire Somhairle', 'female', '1676', '', 'blar'),
    spouse('zearlach-blar', 'Zearlach Blár', 'male', '1671', '', 'house-nic-blar'),
    person('quinlan-somhairle', 'Quinlan Somhairle', 'male', '1672', '', SOMHAIRLE_HOUSE_ID, {
      title: 'Oberkommandant des örtlichen Ordens der Abkömmlinge',
      tags: ['Abkömmlinge', 'Oberkommandant'],
      notes: 'Führt den örtlichen albisch-ritterlichen Orden der Abkömmlinge.'
    }),
    person('cinnia-somhairle', 'Cinnia Somhairle', 'female', '1682', '', SOMHAIRLE_HOUSE_ID, {
      title: 'Hohes Mitglied des Ordens der Abkömmlinge',
      tags: ['Abkömmlinge']
    }),

    person('oisean-somhairle', 'Oisean Somhairle', 'male', '1694', ''),
    spouse('vailibh-craobhan', 'Vailibh Craobhan', 'female', '1697', '', 'house-craobhan'),
    awayMember('ailidh-somhairle', 'Ailidh Somhairle', 'female', '1701', '', 'cruthin'),
    spouse('fearghus-1699-cruthin', 'Fearghus Cruthin', 'male', '1699', '', 'house-cruthin'),
    person('lisair-somhairle', 'Lísair Somhairle', 'female', '1705', '', SOMHAIRLE_HOUSE_ID, {
      title: 'Ritterin des Ordens der Abkömmlinge',
      tags: ['Abkömmlinge']
    }),
    person('fionnchu-somhairle', 'Fionnchu Somhairle', 'male', '1700', '', SOMHAIRLE_HOUSE_ID, {
      title: 'Ritter des Ordens der Abkömmlinge',
      tags: ['Abkömmlinge']
    }),
    spouse('ybhna-iomrach', 'Ybhna Iomrach', 'female', '1700', '', 'house-iomrach', {
      tags: ['Bastard'],
      notes: 'Uneheliche Tochter Meallán Iomrachs; ihre Kinder werden innerhalb der Somhairle-Linie fortgeführt.'
    }),
    awayMember('wihalg-somhairle', 'Wihalg Somhairle', 'female', '1700', '', 'frisealach'),
    spouse('hurracan-frisealach', 'Hurracan Frisealach', 'male', '1695', '', 'house-frisealach'),

    person('hectan-somhairle', 'Hectan Somhairle', 'male', '1717', ''),
    person('breanna-somhairle', 'Breanna Somhairle', 'female', '1728', '', SOMHAIRLE_HOUSE_ID, {
      title: 'Verlobt mit Cónán Iomrach',
      tags: ['Verlobt']
    }),
    spouse('conan-iomrach', 'Cónán Iomrach', 'male', '1727', '', 'house-iomrach', {
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Oisean Somhairles · Verlobt mit Breanna Somhairle',
      tags: ['Mündel', 'Letzter Überlebender', 'Verlobt'],
      notes: 'Letzter Überlebender und Erbe der An’Iomrach. Oisean zog ihn fern von Broch an Clais als Mündel auf.'
    }),
    person('pol-somhairle', 'Pól Somhairle', 'male', '1720', ''),
    person('zephen-somhairle', 'Zephen Somhairle', 'male', '1726', '')
  ],
  partnerships: [
    endedMarriage('marriage-siomhrach-deaglan-somhairle', FOUNDER_IDS),
    endedMarriage('marriage-oighreag-tomaltach', OIGHREAG_IDS, '1684'),
    endedMarriage('marriage-searlas-blathnaid', SEARLAS_IDS, '1701'),
    endedMarriage('marriage-uinseann-latharna', LATHARNA_IDS, '1720'),
    endedMarriage('marriage-glaodhach-muiredach', MUIREDACH_IDS, '1699'),
    endedMarriage('marriage-proinnseas-doireann', PROINNSEAS_IDS, '1720'),
    endedMarriage('marriage-oydis-eibhear-somhairle', EIBHEAR_IDS, '1700'),
    createMarriage('marriage-klaihn-caireann', ...KLAIHN_IDS),
    createMarriage('marriage-zearlach-jonaire', ...JONAIRE_IDS),
    createMarriage('marriage-oisean-vailibh', ...OISEAN_IDS),
    createMarriage('marriage-fearghus-ailidh', ...AILIDH_IDS),
    createMarriage('marriage-fionnchu-ybhna', ...FIONNCHU_IDS),
    createMarriage('marriage-hurracan-wihalg', ...WIHALG_IDS),
    createMarriage('engagement-conan-breanna-iomrach-somhairle', ...BREANNA_IDS, {
      type: 'engagement'
    })
  ],
  parentages: [
    ...childrenOf(['oighreag-somhairle', 'searlas-somhairle'], FOUNDER_IDS, 'marriage-siomhrach-deaglan-somhairle', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Die Punktreihe der Quelle markiert nicht einzeln überlieferte Generationen zwischen dem Gründerpaar und der ab 1627 datierten Linie.',
      extensions: { timeJumpId: 'gap-siomhrach-oighreag-searlas' }
    }),
    ...childrenOf(
      ['latharna-somhairle', 'muiredach-somhairle', 'proinnseas-somhairle', 'eibhear-somhairle'],
      SEARLAS_IDS,
      'marriage-searlas-blathnaid'
    ),
    ...childrenOf(['klaihn-somhairle', 'jonaire-somhairle'], MUIREDACH_IDS, 'marriage-glaodhach-muiredach'),
    ...childrenOf(['quinlan-somhairle'], PROINNSEAS_IDS, 'marriage-proinnseas-doireann'),
    ...childrenOf(['cinnia-somhairle'], EIBHEAR_IDS, 'marriage-oydis-eibhear-somhairle'),
    ...childrenOf(
      ['oisean-somhairle', 'ailidh-somhairle', 'lisair-somhairle', 'fionnchu-somhairle', 'wihalg-somhairle'],
      KLAIHN_IDS,
      'marriage-klaihn-caireann'
    ),
    ...childrenOf(['hectan-somhairle', 'breanna-somhairle'], OISEAN_IDS, 'marriage-oisean-vailibh'),
    ...childrenOf(['conan-iomrach'], ['oisean-somhairle'], '', {
      type: 'foster',
      certainty: 'certain',
      notes: 'Die Somhairle-Quelle bezeichnet Cónán Iomrach ausdrücklich als Oiseans Mündel.'
    }),
    ...childrenOf(['pol-somhairle', 'zephen-somhairle'], FIONNCHU_IDS, 'marriage-fionnchu-ybhna')
  ],
  cadetBranches: [
    marriedAway('married-away-trodach-latharna-somhairle', 'marriage-uinseann-latharna', 'trodach'),
    marriedAway('married-away-blar-jonaire-somhairle', 'marriage-zearlach-jonaire', 'blar'),
    marriedAway('married-away-cruthin-ailidh-somhairle', 'marriage-fearghus-ailidh', 'cruthin'),
    marriedAway('married-away-frisealach-wihalg-somhairle', 'marriage-hurracan-wihalg', 'frisealach')
  ],
  timeJumps: [{
    id: 'gap-siomhrach-oighreag-searlas',
    parentPartnershipId: 'marriage-siomhrach-deaglan-somhairle',
    parentPersonId: '',
    childIds: ['oighreag-somhairle', 'searlas-somhairle'],
    years: 0,
    fromYear: '????',
    toYear: '1627',
    label: 'Nicht einzeln überlieferte Generationen bis zur ab 1627 datierten Linie',
    notes: 'Die Quellhierarchie setzt nach dem Gründerpaar eine ausdrückliche Punktreihe.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-siomhrach-deaglan-somhairle',
    houseId: SOMHAIRLE_HOUSE_ID,
    crestSubtitle: 'Laird und Verwalter von Broch an Clais · Ursprung in Glaennmor, Tir na Dun, Ceitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'siomhrach-founder-somhairle',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Sidhe Somhairle (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Amtsfolge, Erbfolge und Ordensrollen folgen der bereitgestellten Sidhe-Somhairle-Akte. Der Clan stammt ausdrücklich aus Glaennmor in Tir na Dun, Ceitheach, und verwaltet heute die Überreste von Broch an Clais. Latharna, Jonaire, Ailidh und Wihalg erhalten direkte Zielhausknoten; ihre auswärtig fortgeführten Kinder bleiben ausschließlich in den Gegenakten. Cónán Iomrach wird mit derselben Weltperson und demselben Porträt wie in seiner Herkunftsakte als Oiseans aufgenommenes Mündel sowie als Breannas Verlobter geführt. Die Somhairle-Akte nennt Muiredachs Geburt einmal 1647; die bereits ausgearbeitete Frisealach-Gegenakte führt 1648, das deshalb kanonisch erhalten bleibt. Für Ybhna und Cónán werden die Bilder ihrer Iomrach-Herkunftsakte, für Eibhear das bereits vorhandene Helgr-Gegenaktenbild wiederverwendet. Wiederholte Standardsilhouetten wurden nicht importiert.',
    sourceRevision: 2,
    blankFamily: false,
    preparedMainLine: false,
    principality: 'Leitheach',
    territory: 'Tir na Gortanna',
    historicalStatus: 'active',
    albicRank: 'laird',
    administrativeRole: 'Laird und Verwalter von Broch an Clais',
    immediateLiegeHouseId: 'haus-dal-cruthin',
    immediateLiegeHouseName: 'Clan Dál’Cruthin',
    legacyTitles: Object.freeze(['Clan Somhairle']),
    originPlacement: SIDHE_SOMHAIRLE_ORIGIN,
    sourceDiscrepancies: Object.freeze({
      muiredachBirth: Object.freeze({ somhairleSource: '1647', frisealachSource: '1648', canonical: '1648' })
    }),
    inheritance: Object.freeze({
      title: 'Laird der Sidhe Somhairle',
      headOrder: Object.freeze([
        'siomhrach-founder-somhairle',
        'oighreag-somhairle',
        'muiredach-somhairle',
        'klaihn-somhairle'
      ]),
      publishedOrder: Object.freeze(['oisean-somhairle', 'hectan-somhairle'])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_SIDHE_SOMHAIRLE_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_SIDHE_SOMHAIRLE_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily', 'preparedMainLine', 'sourceNote', 'originPlacement',
      'sourceDiscrepancies', 'inheritance', 'portraitPolicy'
    ],
    registryManagedHouseProfileFields: TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: ['haus-somhairle-gruender', 'haus-somhairle-gruenderin'],
      partnerships: ['marriage-haus-somhairle-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
