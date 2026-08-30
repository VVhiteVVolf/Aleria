import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_ARD_TRODACH_LOCAL_PORTRAIT_IDS,
  HOUSE_ARD_TRODACH_PORTRAITS,
  HOUSE_ARD_TRODACH_REUSED_PORTRAIT_IDS
} from './house-ard-trodach-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import {
  TIR_NA_GORTANNA_HOUSE_EMBLEMS,
  TIR_NA_GORTANNA_HOUSE_PROFILES,
  TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS
} from './tir-na-gortanna-house-profiles.js';
import { TIR_NA_SRUTH_HOUSE_EMBLEMS } from './tir-na-sruth-house-profiles.js';

const TRODACH_HOUSE_ID = 'house-trodach';
const TRODACH_EMBLEM = TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach'];

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death',
  'portrait', 'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole',
  'tags', 'notes'
]);

const HOUSE_HEAD_IDS = new Set([
  'fothadh-founder-trodach',
  'alasdair-trodach',
  'fothadh-trodach',
  'lorcan-trodach',
  'caireall-trodach'
]);

const SUCCESSION_IDS = new Set(['haolthan-trodach', 'maithnu-trodach']);

const HEAD_TITLES = Object.freeze({
  'fothadh-founder-trodach': 'Gründer und erster Laird der Ard Trodach',
  'alasdair-trodach': 'Laird der Ard Trodach · bis 1681',
  'fothadh-trodach': 'Laird der Ard Trodach · 1681–1690',
  'lorcan-trodach': 'Laird der Ard Trodach · 1690–1703',
  'caireall-trodach': 'Laird der Ard Trodach · seit 1703',
  'haolthan-trodach': 'Erster in der Erbfolge des Laird',
  'maithnu-trodach': 'Zweiter in der Erbfolge des Laird'
});

const TARGETS = Object.freeze({
  frisealach: Object.freeze({
    name: 'Ard Frisealach',
    houseId: 'house-frisealach',
    targetFamilyId: 'haus-frisealach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach
  }),
  cruthin: Object.freeze({
    name: 'Clan Dál’Cruthin',
    houseId: 'house-cruthin',
    targetFamilyId: 'haus-dal-cruthin',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']
  }),
  iomrach: Object.freeze({
    name: 'An’Iomrach',
    houseId: 'house-iomrach',
    targetFamilyId: 'haus-iomrach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.iomrach
  }),
  gaelach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']
  }),
  unknown: Object.freeze({
    name: 'unbekanntes Haus',
    houseId: '',
    targetFamilyId: '',
    emblem: ''
  })
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = TRODACH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_ARD_TRODACH_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === TRODACH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
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

function awayPerson(id, name, sex, birth, death, targetKey, options = {}) {
  const target = TARGETS[targetKey];
  return person(id, name, sex, birth, death, TRODACH_HOUSE_ID, {
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
    idPrefix: 'ard-trodach-parentage',
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

const FOUNDER_IDS = ['fothadh-founder-trodach', 'hiolair-ancient'];
const ALASDAIR_IDS = ['alasdair-trodach', 'dervorgilla-eachtrai'];
const DRAIGHNEACH_IDS = ['jearlach-cruthin', 'draighneach-tordach'];
const FOTHADH_IDS = ['brighde-frisealach', 'fothadh-trodach'];
const JODHRAN_IDS = ['jodhran-trodach', 'reathnaigh-caoimhe'];
const JONAIBHI_IDS = ['jonaibhi-trodach', 'hallaith-durthacht'];
const LORCAN_IDS = ['lorcan-trodach', 'sceolaigh-amhran'];
const CARTHACH_IDS = ['carthach-trodach', 'oideach-choinnich'];
const WAILBHE_IDS = ['wailbhe-trodach', 'eachaidh-iomrach'];
const UINSEANN_IDS = ['uinseann-trodach', 'latharna-somhairle'];
const CAIREALL_IDS = ['brogan-cruthin', 'caireall-trodach'];
const KADHGHAN_IDS = ['kadhghan-frisealach', 'muirgheal-trodach'];
const LANNRAIG_IDS = ['lannraig-trodach', 'ailbhe-ni-chathasaigh'];
const RIONACH_IDS = ['rionach-trodach', 'unknown-husband-rionach-trodach'];
const DEIRBHILE_IDS = ['deirbhile-trodach', 'unknown-husband-deirbhile-trodach'];
const CEARBHALL_IDS = ['cearbhall-trodach', 'fechin-laidir'];
const DOMHNALL_IDS = ['domhnall-trodach', 'praeleen-ancient-trodach'];
const HAOLTHAN_IDS = ['haolthan-trodach', 'vionaigh-eachtrai'];
const LORGHUS_IDS = ['lorghus-trodach', 'maire-feannag'];
const PREACHAN_IDS = ['preachan-trodach', 'isibeal-treada'];
const TRAOLACH_IDS = ['traolach-trodach', 'ealasaid-ancient-trodach'];
const UASALAN_IDS = ['breccan-gealach', 'uasalan-tordach'];

export const HOUSE_ARD_TRODACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ard-trodach',
    title: 'Ard Trodach',
    motto: '',
    description: 'Laird-Clan innerhalb Lochansails in der Eigenbaronie des Mor Tiarna von Tir na Gortanna.',
    emblem: TRODACH_EMBLEM,
    houseProfile: TIR_NA_GORTANNA_HOUSE_PROFILES['ard-trodach']
  },
  houses: [
    house(TRODACH_HOUSE_ID, 'Ard Trodach', TRODACH_EMBLEM),
    house('house-cruthin', 'Clan Dál’Cruthin', TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']),
    house('house-eachtrai', 'Haus Eachtrai'),
    house('house-frisealach', 'Ard Frisealach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach),
    house('house-caoimhe', 'Clan Nic Caoimhe', TIR_NA_GORTANNA_HOUSE_EMBLEMS['nic-caoimhe']),
    house('house-durthacht', 'Haus Durthacht'),
    house('house-amrhan', 'Clan Ua’Amhran', TIR_NA_SRUTH_HOUSE_EMBLEMS.amrhan),
    house('house-choinnich', 'Haus Choinnich'),
    house('house-iomrach', 'An’Iomrach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.iomrach, 'extinct'),
    house('house-somhairle', 'Sidhe Somhairle', TIR_NA_GORTANNA_HOUSE_EMBLEMS.somhairle),
    house('house-laidir', 'Haus Laidir'),
    house('house-feannag', 'Haus Feannag'),
    house('house-treada', 'Haus Tréada'),
    house('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach'])
  ],
  persons: [
    person('fothadh-founder-trodach', 'Fothadh Trodach', 'male', '????', '????', TRODACH_HOUSE_ID, {
      tags: ['Gründer']
    }),
    spouse('hiolair-ancient', 'Hiolair', 'female', '????', '????'),

    person('alasdair-trodach', 'Alasdair Trodach', 'male', '1606', '1681'),
    spouse('dervorgilla-eachtrai', 'Dervorgilla Eachtrai', 'female', '1609', '1677', 'house-eachtrai'),
    awayPerson('draighneach-tordach', 'Draighneach Trodach', 'female', '1610', '1691', 'cruthin'),
    spouse('jearlach-cruthin', 'Jéarlach Cruthin', 'male', '1607', '1681', 'house-cruthin'),

    person('fothadh-trodach', 'Fothadh Trodach', 'male', '1627', '1690'),
    spouse('brighde-frisealach', 'Brighde Frisealach', 'female', '1630', '1701', 'house-frisealach'),
    person('jodhran-trodach', 'Jodhrán Trodach', 'male', '1630', '1695'),
    spouse('reathnaigh-caoimhe', 'Reathnaigh Caoimhe', 'female', '1628', '1704', 'house-caoimhe'),
    person('diarmuid-trodach', 'Diarmuid Trodach', 'male', '1633', '1709', TRODACH_HOUSE_ID, {
      title: 'Fianna der Ard Trodach',
      tags: ['Fianna'],
      notes: 'Diarmuid war als bekannter Fianna des Clans überliefert.'
    }),
    person('jonaibhi-trodach', 'Jónaibhí Trodach', 'male', '1635', '1711'),
    spouse('hallaith-durthacht', 'Hallaith Durthacht', 'female', '1635', '1677', 'house-durthacht'),

    person('lorcan-trodach', 'Lorcán Trodach', 'male', '1649', '1703'),
    spouse('sceolaigh-amhran', 'Sceolaigh Amrhan', 'female', '1651', '1735', 'house-amrhan'),
    person('carthach-trodach', 'Carthach Trodach', 'male', '1651', '1709'),
    spouse('oideach-choinnich', 'Oideach Choinnich', 'female', '1655', '1731', 'house-choinnich'),
    awayPerson('wailbhe-trodach', 'Wailbhe Trodach', 'female', '1654', '1699', 'iomrach'),
    spouse('eachaidh-iomrach', 'Eachaidh Iomrach', 'male', '1650', '1731', 'house-iomrach'),
    person('uinseann-trodach', 'Uinseann Trodach', 'male', '1656', '1720'),
    spouse('latharna-somhairle', 'Latharna Somhairle', 'female', '1656', '1739', 'house-somhairle'),

    person('caireall-trodach', 'Caireall Trodach', 'male', '1671', '', TRODACH_HOUSE_ID, {
      notes: 'Im Jahr 1740 ist Caireall 69 Winter alt. Der ausgediente Kriegsveteran kämpfte zuletzt beim großen Piratenüberfall im Norden und sucht im Frieden regelmäßig die Prügelei mit seinem erwachsenen Sohn.'
    }),
    spouse('brogan-cruthin', 'Brogan Cruthin', 'female', '1675', '', 'house-cruthin'),
    person('lannraig-trodach', 'Lannraig Trodach', 'male', '1679', '', TRODACH_HOUSE_ID, {
      title: 'Oberkämmerer der Ard Trodach',
      tags: ['Oberkämmerer'],
      notes: 'Cairealls Vetter und Oberkämmerer. Lannraig verabscheut Zahlen und Verwaltung und lässt Abgaben häufig gegen Bier oder ein späteres Versprechen durchgehen.'
    }),
    spouse('ailbhe-ni-chathasaigh', 'Ailbhe Ní Chathasaigh', 'female', '1683', '', '', {
      title: 'Bürgerliche Gemahlin Lannraigs'
    }),
    awayPerson('muirgheal-trodach', 'Muirgheal Trodach', 'female', '1682', '', 'frisealach'),
    spouse('kadhghan-frisealach', 'Kadhghán Frisealach', 'male', '1677', '', 'house-frisealach'),
    person('cearbhall-trodach', 'Cearbhall Trodach', 'male', '1680', '', TRODACH_HOUSE_ID, {
      title: 'Würdenträger der Ard Trodach',
      tags: ['Würdenträger'],
      notes: 'Cairealls Vetter richtet Empfänge und Gelage aus und ist für seine maßlose Freude an Speise und Trank bekannt.'
    }),
    spouse('fechin-laidir', 'Fechín Laidir', 'male', '1677', '', 'house-laidir', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('domhnall-trodach', 'Domhnall Trodach', 'male', '1676', '', TRODACH_HOUSE_ID, {
      title: 'Kriegsherr der Ard Trodach',
      tags: ['Kriegsherr'],
      notes: 'Als Kriegsherr hält Domhnall den Clan zusammen, erinnert den Laird an seine Pflichten und fängt die Auswüchse seiner Vettern ab.'
    }),
    spouse('praeleen-ancient-trodach', 'Praeleen', 'female', '1679', ''),

    awayPerson('rionach-trodach', 'Ríonach Trodach', 'female', '1704', '', 'unknown'),
    spouse('unknown-husband-rionach-trodach', 'Unbekannter Ehemann', 'male'),
    awayPerson('deirbhile-trodach', 'Deirbhile Trodach', 'female', '1707', '', 'unknown'),
    spouse('unknown-husband-deirbhile-trodach', 'Unbekannter Ehemann', 'male'),

    person('haolthan-trodach', 'Haolthán Trodach', 'male', '1694', ''),
    spouse('vionaigh-eachtrai', 'Vionaigh Eachtrai', 'female', '1699', '', 'house-eachtrai'),
    person('lorghus-trodach', 'Lorghus Trodach', 'male', '1697', ''),
    spouse('maire-feannag', 'Máire Feannag', 'female', '1700', '', 'house-feannag'),
    person('preachan-trodach', 'Préachán Trodach', 'male', '1700', ''),
    spouse('isibeal-treada', 'Isibéal Tréada', 'female', '1702', '', 'house-treada'),
    person('traolach-trodach', 'Traolach Trodach', 'male', '1699', ''),
    spouse('ealasaid-ancient-trodach', 'Ealasaid', 'female', '1701', ''),
    awayPerson('uasalan-tordach', 'Úasalán Trodach', 'male', '1699', '', 'gaelach'),
    spouse('breccan-gealach', 'Breccán Gealach', 'male', '1695', '', 'house-gealach'),

    person('maithnu-trodach', 'Maithnú Trodach', 'male', '1715', ''),
    person('yoina-trodach', 'Yoina Trodach', 'female', '1722', ''),
    person('huain-trodach', 'Húáin Trodach', 'male', '1721', ''),
    person('orlach-trodach', 'Òrlach Trodach', 'male', '1724', ''),
    person('eibhear-trodach', 'Eibhear Trodach', 'female', '1723', ''),
    person('hanae-trodach', 'Hanae Trodach', 'female', '1726', ''),
    person('unafri-trodach', 'Únafrí Trodach', 'male', '1722', ''),
    person('luane-trodach', 'Luane Trodach', 'female', '1727', '')
  ],
  partnerships: [
    endedMarriage('marriage-fothadh-hiolair-trodach', FOUNDER_IDS),
    endedMarriage('marriage-alasdair-dervorgilla', ALASDAIR_IDS, '1677'),
    endedMarriage('marriage-jearlach-draighneach', DRAIGHNEACH_IDS, '1681'),
    endedMarriage('marriage-brighde-fothadh', FOTHADH_IDS, '1690'),
    endedMarriage('marriage-jodhran-reathnaigh', JODHRAN_IDS, '1695'),
    endedMarriage('marriage-jonaibhi-hallaith', JONAIBHI_IDS, '1677'),
    endedMarriage('marriage-lorcan-sceolaigh', LORCAN_IDS, '1703'),
    endedMarriage('marriage-carthach-oideach', CARTHACH_IDS, '1709'),
    endedMarriage('marriage-wailbhe-eachaidh', WAILBHE_IDS, '1699'),
    endedMarriage('marriage-uinseann-latharna', UINSEANN_IDS, '1720'),
    createMarriage('marriage-brogan-caireall', ...CAIREALL_IDS),
    createMarriage('marriage-kadhghan-muirgheal', ...KADHGHAN_IDS),
    createMarriage('marriage-lannraig-ailbhe', ...LANNRAIG_IDS),
    createMarriage('marriage-cearbhall-fechin', ...CEARBHALL_IDS),
    createMarriage('marriage-domhnall-praeleen', ...DOMHNALL_IDS),
    createMarriage('marriage-haolthan-vionaigh', ...HAOLTHAN_IDS),
    createMarriage('marriage-lorghus-maire', ...LORGHUS_IDS),
    createMarriage('marriage-preachan-isibeal', ...PREACHAN_IDS),
    createMarriage('marriage-traolach-ealasaid', ...TRAOLACH_IDS),
    createMarriage('marriage-breccan-uasalan', ...UASALAN_IDS),
    createMarriage('marriage-rionach-unknown-husband', ...RIONACH_IDS),
    createMarriage('marriage-deirbhile-unknown-husband', ...DEIRBHILE_IDS)
  ],
  parentages: [
    ...childrenOf(['alasdair-trodach', 'draighneach-tordach'], FOUNDER_IDS, 'marriage-fothadh-hiolair-trodach', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Die Punktreihe der Quelle markiert nicht einzeln überlieferte Generationen zwischen dem Gründerpaar und der ab 1606 datierten Linie.',
      extensions: { timeJumpId: 'gap-fothadh-alasdair-draighneach' }
    }),
    ...childrenOf(
      ['fothadh-trodach', 'jodhran-trodach', 'diarmuid-trodach', 'jonaibhi-trodach'],
      ALASDAIR_IDS,
      'marriage-alasdair-dervorgilla'
    ),
    ...childrenOf(['lorcan-trodach'], FOTHADH_IDS, 'marriage-brighde-fothadh'),
    ...childrenOf(['carthach-trodach', 'wailbhe-trodach'], JODHRAN_IDS, 'marriage-jodhran-reathnaigh'),
    ...childrenOf(['uinseann-trodach'], JONAIBHI_IDS, 'marriage-jonaibhi-hallaith'),
    ...childrenOf(['caireall-trodach'], LORCAN_IDS, 'marriage-lorcan-sceolaigh'),
    ...childrenOf(['lannraig-trodach', 'cearbhall-trodach', 'muirgheal-trodach'], CARTHACH_IDS, 'marriage-carthach-oideach'),
    ...childrenOf(['domhnall-trodach'], UINSEANN_IDS, 'marriage-uinseann-latharna'),
    ...childrenOf(['rionach-trodach', 'deirbhile-trodach'], LANNRAIG_IDS, 'marriage-lannraig-ailbhe'),
    ...childrenOf(['haolthan-trodach', 'lorghus-trodach'], CAIREALL_IDS, 'marriage-brogan-caireall'),
    ...childrenOf(['preachan-trodach'], CEARBHALL_IDS, 'marriage-cearbhall-fechin'),
    ...childrenOf(['traolach-trodach', 'uasalan-tordach'], DOMHNALL_IDS, 'marriage-domhnall-praeleen'),
    ...childrenOf(['maithnu-trodach', 'yoina-trodach'], HAOLTHAN_IDS, 'marriage-haolthan-vionaigh'),
    ...childrenOf(['huain-trodach', 'orlach-trodach'], LORGHUS_IDS, 'marriage-lorghus-maire'),
    ...childrenOf(['eibhear-trodach', 'hanae-trodach'], PREACHAN_IDS, 'marriage-preachan-isibeal'),
    ...childrenOf(['unafri-trodach', 'luane-trodach'], TRAOLACH_IDS, 'marriage-traolach-ealasaid')
  ],
  cadetBranches: [
    marriedAway('married-away-cruthin-draighneach', 'marriage-jearlach-draighneach', 'cruthin'),
    marriedAway('married-away-iomrach-wailbhe', 'marriage-wailbhe-eachaidh', 'iomrach'),
    marriedAway('married-away-frisealach-muirgheal', 'marriage-kadhghan-muirgheal', 'frisealach'),
    marriedAway('married-away-gaelach-uasalan', 'marriage-breccan-uasalan', 'gaelach')
  ],
  timeJumps: [
    {
      id: 'gap-fothadh-alasdair-draighneach',
      parentPartnershipId: 'marriage-fothadh-hiolair-trodach',
      childIds: ['alasdair-trodach', 'draighneach-tordach'],
      years: 0,
      fromYear: '????',
      toYear: '1606',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1606 datierten Linie',
      notes: 'Die Quellhierarchie setzt zwischen dem Gründerpaar und der späteren Linie eine ausdrückliche Punktreihe.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-fothadh-hiolair-trodach',
    houseId: TRODACH_HOUSE_ID,
    crestSubtitle: 'Laird innerhalb Lochansails · Tir na Gortanna · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'fothadh-founder-trodach',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Ard Trodach (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Amtszeiten, Erbfolge und historische Rollen folgen der bereitgestellten Ard-Trodach-Akte. Der Clan ist als Laird innerhalb Lochansails unmittelbar in die Eigenbaronie des Mor Tiarna eingeordnet. Die ausdrückliche Punktreihe nach dem Gründerpaar bleibt als Überlieferungslücke erhalten. Alasdairs detaillierte Familienkarte datiert seine Geburt auf 1606 und präzisiert damit die unbekannte Angabe der Oberhaupttabelle. Die Schreibweisen Lannraig und Domhnall folgen den genealogischen Karten und den Beschreibungen. Caireall ist entsprechend seiner Laird-Beschreibung und seines Porträts ein Mann; Brogans vorhandenes Cruthin-Porträt weist sie als Frau aus. Die irrtümliche Ehe Kadhgháns mit Lannraig wurde auf Nutzerhinweis berichtigt: Muirgheal ist als deren Schwester und Kadhgháns Ehefrau ergänzt; Lannraig führt seine Linie mit der bürgerlichen Ailbhe Ní Chathasaigh und den wegverheirateten Töchtern Ríonach und Deirbhile fort. Die Ehemänner der beiden Töchter sind ausdrücklich unbekannt und keinem erfundenen Zielhaus zugeordnet. Oideachs Todesjahr 1731 wird aus der nun ausgearbeiteten Ua-Choinnich-Gegenakte ergänzt. Bereits kanonische Gegenaktenbilder werden wiederverwendet; wiederholte Standardsilhouetten wurden nicht importiert.',
    sourceRevision: 6,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Laird der Ard Trodach',
      headOrder: Object.freeze([
        'fothadh-founder-trodach',
        'alasdair-trodach',
        'fothadh-trodach',
        'lorcan-trodach',
        'caireall-trodach'
      ]),
      publishedOrder: Object.freeze(['haolthan-trodach', 'maithnu-trodach'])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_ARD_TRODACH_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_ARD_TRODACH_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    sourceDiscrepancies: Object.freeze({
      alasdairBirth: Object.freeze({ headTable: '????', genealogy: '1606', canonical: '1606' }),
      lannraigSpelling: Object.freeze({ genealogy: 'Lannraig', historical: 'Lannreig', canonical: 'Lannraig' }),
      domhnallSpelling: Object.freeze({ genealogy: 'Domhhnall', description: 'Domhnall', canonical: 'Domhnall' }),
      correctedKadhghanMarriage: Object.freeze({
        formerPartner: 'Lannraig Trodach',
        canonicalPartner: 'Muirgheal Trodach',
        reason: 'Die frühere Verknüpfung zweier Männer als Eltern derselben Kinder beruhte auf einem Erstellungsirrtum.'
      })
    }),
    principality: 'Leitheach',
    territory: 'Tir na Gortanna',
    historicalStatus: 'active',
    directMorTiarnaBarony: true,
    albicRank: 'laird',
    administrativeRole: 'Laird innerhalb Lochansails',
    immediateLiegeHouseId: 'haus-dal-cruthin',
    immediateLiegeHouseName: 'Clan Dál’Cruthin',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily', 'preparedMainLine', 'sourceNote', 'inheritance',
      'portraitPolicy', 'sourceDiscrepancies'
    ],
    registryManagedHouseProfileFields: TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: ['house-amhran'],
      persons: ['haus-ard-trodach-gruender', 'haus-ard-trodach-gruenderin'],
      partnerships: [
        'marriage-haus-ard-trodach-founders',
        'marriage-kadhghan-lannraig',
        'marriage-rionach-eoghan',
        'marriage-deirbhile-caoilte'
      ],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
