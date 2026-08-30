import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_TIR_AN_AIRGID_LOCAL_PORTRAIT_IDS,
  HOUSE_TIR_AN_AIRGID_PORTRAITS,
  HOUSE_TIR_AN_AIRGID_REUSED_PORTRAIT_IDS
} from './house-tir-an-airgid-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import { TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS } from './tir-an-comhchuibhis-house-profiles.js';
import { TIR_NA_GORTANNA_HOUSE_EMBLEMS } from './tir-na-gortanna-house-profiles.js';
import {
  TIR_NA_SRUTH_HOUSE_EMBLEMS,
  TIR_NA_SRUTH_HOUSE_PROFILES,
  TIR_NA_SRUTH_MANAGED_PROFILE_FIELDS
} from './tir-na-sruth-house-profiles.js';
import { TIR_NA_TONN_HOUSE_EMBLEMS } from './tir-na-tonn-house-profiles.js';

const AIRGID_HOUSE_ID = 'house-airgid';
const AIRGID_EMBLEM = TIR_NA_SRUTH_HOUSE_EMBLEMS.airgid;

const HOUSE_HEAD_IDS = new Set([
  'tomaltach-founder-airgid',
  'gaothaire-airgid',
  'donndubhan-airgid',
  'meallchu-airgid',
  'tomaltach-airgid'
]);

const HEAD_TITLES = Object.freeze({
  'tomaltach-founder-airgid': 'Begründer und erster überlieferter Dún Tiarna der Tir An’Airgid',
  'gaothaire-airgid': 'Dún Tiarna der Tir An’Airgid · bis 1674',
  'donndubhan-airgid': 'Dún Tiarna der Tir An’Airgid · 1674–1700',
  'meallchu-airgid': 'Dún Tiarna der Tir An’Airgid · 1700–1728',
  'tomaltach-airgid': 'Dún Tiarna der Tir An’Airgid · seit 1728'
});

const TARGETS = Object.freeze({
  cuinn: Object.freeze({
    name: 'Clan Tir An’Cuinn',
    houseId: 'house-cuinn',
    targetFamilyId: 'haus-tir-an-cuinn',
    emblem: TIR_NA_SRUTH_HOUSE_EMBLEMS['tir-an-cuinn']
  }),
  gortach: Object.freeze({
    name: 'Ru’Gortach',
    houseId: 'house-gortach',
    targetFamilyId: 'haus-ru-gortach',
    emblem: TIR_NA_TONN_HOUSE_EMBLEMS.gortach
  }),
  choinnich: Object.freeze({
    name: 'Clan Ua’Choinnich',
    houseId: 'house-choinnich',
    targetFamilyId: 'haus-choinnich',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.choinnich
  }),
  somhairle: Object.freeze({
    name: 'Sidhe Somhairle',
    houseId: 'house-somhairle',
    targetFamilyId: 'haus-sidhe-somhairle',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.somhairle
  }),
  tsaor: Object.freeze({
    name: 'Dál T’Saoir',
    houseId: 'house-tsaoir',
    targetFamilyId: 'haus-dal-t-saor',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['dal-t-saor']
  }),
  iomrach: Object.freeze({
    name: 'An’Iomrach',
    houseId: 'house-iomrach',
    targetFamilyId: 'haus-iomrach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.iomrach
  })
});

function lineageRoleFor(personId) {
  return HOUSE_HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = AIRGID_HOUSE_ID, options = {}) {
  const portrait = HOUSE_TIR_AN_AIRGID_PORTRAITS[id] || '';
  const registryManagedFields = new Set(options.extensions?.registryManagedFields || []);
  if (portrait) registryManagedFields.add('portrait');

  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait,
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === AIRGID_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      ...(registryManagedFields.size > 0
        ? { registryManagedFields: [...registryManagedFields] }
        : {})
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
  return person(id, name, sex, birth, death, AIRGID_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
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
    idPrefix: 'tir-an-airgid-parentage',
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
    extensions: { chartAlignBelowPartnership: true }
  });
}

const FOUNDERS = ['tomaltach-founder-airgid', 'grainne-airgid'];
const GAOTHAIRE_IDS = ['baoigheall-frisealach', 'gaothaire-airgid'];
const CATRIONA_IDS = ['oircheard-cuinn', 'catriona-airgid'];
const UTHBHLA_IDS = ['aodhluan-1621-gortach', 'uthbhla-airgid'];
const DONNDUBHAN_IDS = ['donndubhan-airgid', 'ruadh-nessa'];
const MUIRGEL_IDS = ['cathalan-choinnich', 'muirgel-airgid'];
const MEALLCHU_IDS = ['deaghlaith-gealach', 'meallchu-airgid'];
const DOIREANN_IDS = ['proinnseas-somhairle', 'doireann-airgid'];
const CONALL_IDS = ['gwyneira-gwyvern', 'conall-airgid'];
const TOMALTACH_IDS = ['tomaltach-airgid', 'qubhna-amrhan'];
const PEADHRA_IDS = ['naomhan-tsaoir', 'peadhra-airgid'];
const VADRIA_IDS = ['purseil-iomrach', 'vadria-airgid'];
const KARRACH_IDS = ['karrach-airgid', 'ceana-cadhla'];
const GLAODHRAN_IDS = ['siobhan-cuinn', 'glaodhran-airgid'];
const DALLAN_IDS = ['dallan-airgid', 'fainne-1696-caoimhe'];
const SORLEY_IDS = ['sorley-airgid', 'jilbhe-goidin'];
const PIARAS_IDS = ['piaras-airgid', 'johana'];
const PIARAS_AFFAIR_IDS = ['piaras-airgid', 'waldri'];

export const HOUSE_TIR_AN_AIRGID_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-airgid',
    title: 'Tir An’Airgid',
    motto: '',
    description: 'Dún-Tiarna-Haus der eigenen Lehensherrschaft Tir An’Airgid mit Sitz in Cel Leagan, unter dem Mor Tiarna des Clan Tir An’Cuinn.',
    emblem: AIRGID_EMBLEM,
    houseProfile: TIR_NA_SRUTH_HOUSE_PROFILES.airgid
  },
  houses: [
    house(AIRGID_HOUSE_ID, 'Tir An’Airgid', AIRGID_EMBLEM),
    house('house-frisealach', 'Ard Frisealach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach),
    house('house-cuinn', 'Clan Tir An’Cuinn', TIR_NA_SRUTH_HOUSE_EMBLEMS['tir-an-cuinn']),
    house('house-gortach', 'Ru’Gortach', TIR_NA_TONN_HOUSE_EMBLEMS.gortach),
    house('house-choinnich', 'Clan Ua’Choinnich', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.choinnich),
    house('house-nessa', 'Haus Nessa'),
    house('house-gaelach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    house('house-somhairle', 'Sidhe Somhairle', TIR_NA_GORTANNA_HOUSE_EMBLEMS.somhairle),
    house('house-gwyvern', 'Haus Gwyvern'),
    house('house-amrhan', 'Clan Ua’Amhran', TIR_NA_SRUTH_HOUSE_EMBLEMS.amrhan),
    house('house-tsaoir', 'Dál T’Saoir', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['dal-t-saor'], 'extinct'),
    house('house-iomrach', 'An’Iomrach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.iomrach, 'extinct'),
    house('house-cadhla', 'Haus Cadhla'),
    house('house-caoimhe', 'Clan Nic Caoimhe', TIR_NA_GORTANNA_HOUSE_EMBLEMS['nic-caoimhe']),
    house('house-goidin', 'Haus Goidin')
  ],
  persons: [
    person('tomaltach-founder-airgid', 'Tomaltach Airgid', 'male', '????', '????'),
    spouse('grainne-airgid', 'Gráinne', 'female', '????', '????'),

    person('gaothaire-airgid', 'Gaothaire Airgid', 'male', '1608', '1674'),
    spouse('baoigheall-frisealach', 'Baoigheall Frisealach', 'female', '1612', '1679', 'house-frisealach'),
    awayMember('catriona-airgid', 'Catrìona Airgid', 'female', '1607', '1689', 'cuinn'),
    spouse('oircheard-cuinn', 'Oircheard Cuinn', 'male', '1606', '1671', 'house-cuinn'),

    awayMember('uthbhla-airgid', 'Uthbhla Airgid', 'female', '1628', '1690', 'gortach'),
    spouse('aodhluan-1621-gortach', 'Aodhluán Gortach', 'male', '1621', '1695', 'house-gortach'),
    person('donndubhan-airgid', 'Donndubhán Airgid', 'male', '1630', '1700'),
    spouse('ruadh-nessa', 'Ruadh Nessa', 'female', '1632', '1732', 'house-nessa'),
    awayMember('muirgel-airgid', 'Muirgel Airgid', 'female', '1632', '1714', 'choinnich'),
    spouse('cathalan-choinnich', 'Cathalán Choinnich', 'male', '1628', '1691', 'house-choinnich'),

    person('meallchu-airgid', 'Meallchú Airgid', 'male', '1650', '1728'),
    spouse('deaghlaith-gealach', 'Déaghlaith Gealach', 'female', '1652', '1725', 'house-gaelach'),
    awayMember('doireann-airgid', 'Doireann Airgid', 'female', '1650', '1720', 'somhairle'),
    spouse('proinnseas-somhairle', 'Proinnseas Somhairle', 'male', '1648', '1720', 'house-somhairle'),
    person('conall-airgid', 'Conall Airgid', 'male', '1650', '1712'),
    spouse('gwyneira-gwyvern', 'Gwyneira Gwyvern', 'female', '1653', '1700', 'house-gwyvern'),

    person('tomaltach-airgid', 'Tomaltach Airgid', 'male', '1674', ''),
    spouse('qubhna-amrhan', 'Qubhna Amrhan', 'female', '1678', '', 'house-amrhan'),
    awayMember('peadhra-airgid', 'Peadhra Airgid', 'female', '1676', '1735', 'tsaor'),
    spouse('naomhan-tsaoir', 'Naomhan T’Saoir', 'male', '1671', '1735', 'house-tsaoir'),
    awayMember('vadria-airgid', 'Vadria Airgid', 'female', '1674', '1733', 'iomrach'),
    spouse('purseil-iomrach', 'Puirséil Iomrach', 'male', '1669', '1733', 'house-iomrach'),
    person('karrach-airgid', 'Karrach Airgid', 'male', '1677', ''),
    spouse('ceana-cadhla', 'Ceana Cadhla', 'female', '1679', '', 'house-cadhla'),

    person('glaodhran-airgid', 'Glaodhran Airgid', 'male', '1697', ''),
    spouse('siobhan-cuinn', 'Siobhan Cuinn', 'female', '1702', '', 'house-cuinn'),
    person('dallan-airgid', 'Dallán Airgid', 'male', '1700', ''),
    spouse('fainne-1696-caoimhe', 'Fainne Caoimhe', 'female', '1696', '', 'house-caoimhe'),
    person('sorley-airgid', 'Sorley Airgid', 'male', '1702', ''),
    spouse('jilbhe-goidin', 'Jilbhe Goidin', 'female', '1704', '', 'house-goidin'),
    person('piaras-airgid', 'Piaras Airgid', 'male', '1703', ''),
    spouse('johana', 'Jóhana', 'female', '1705', ''),
    spouse('waldri', 'Waldrí', 'female', '1710', '', '', {
      familyRole: 'affair',
      title: 'Affäre Piaras’'
    }),
    person('cormac-airgid', 'Cormac Airgid', 'male', '1709', ''),

    person('eachan-airgid', 'Eachan Airgid', 'male', '1722', ''),
    person('dubhan-airgid', 'Dubhán Airgid', 'male', '1726', ''),
    person('rabhla-nessa', 'Rabhla Nessa', 'female', '1727', '', 'house-nessa', {
      familyRole: 'ward',
      title: 'Mündel Glaodhrans',
      tags: ['Mündel'],
      notes: 'Rabhla Nessa ist Glaodhrans Mündel und kein leibliches Kind.'
    }),
    person('quinn-airgid', 'Quinn Airgid', 'male', '1724', ''),
    person('zosie-airgid', 'Zosie Airgid', 'female', '1726', ''),
    person('siofra-airgid', 'Síofra Airgid', 'female', '1723', ''),
    person('rua-airgid', 'Rua Airgid', 'female', '1727', ''),
    person('kester-airgid', 'Kester Airgid', 'male', '1728', '', AIRGID_HOUSE_ID, {
      familyRole: 'bastard',
      title: 'Bastardsohn Piaras’ und Waldrís',
      tags: ['Bastard']
    }),
    person('halla-airgid', 'Halla Airgid', 'female', '1730', '', AIRGID_HOUSE_ID, {
      familyRole: 'bastard',
      title: 'Bastardtochter Piaras’ und Waldrís',
      tags: ['Bastard']
    })
  ],
  partnerships: [
    endedMarriage('marriage-tomaltach-grainne-airgid', FOUNDERS),
    endedMarriage('marriage-baoigheall-gaothaire', GAOTHAIRE_IDS, '1674'),
    endedMarriage('marriage-oircheard-catriona-cuinn', CATRIONA_IDS, '1671'),
    endedMarriage('marriage-aodhluan-uthbhla-gortach', UTHBHLA_IDS, '1690'),
    endedMarriage('marriage-donndubhan-ruadh-airgid', DONNDUBHAN_IDS, '1700'),
    endedMarriage('marriage-cathalan-muirgel-choinnich', MUIRGEL_IDS, '1691'),
    endedMarriage('marriage-deaghlaith-meallchu', MEALLCHU_IDS, '1725'),
    endedMarriage('marriage-proinnseas-doireann', DOIREANN_IDS, '1720'),
    endedMarriage('marriage-gwyneira-conall', CONALL_IDS, '1700'),
    createMarriage('marriage-tomaltach-qubhna-amrhan', ...TOMALTACH_IDS),
    endedMarriage('marriage-naomhan-peadhra-tsaoir', PEADHRA_IDS, '1735'),
    endedMarriage('marriage-purseil-vadria', VADRIA_IDS, '1733'),
    createMarriage('marriage-karrach-ceana-airgid', ...KARRACH_IDS),
    createMarriage('marriage-siobhan-glaodhran-cuinn', ...GLAODHRAN_IDS),
    createMarriage('marriage-dallan-fainne', ...DALLAN_IDS),
    createMarriage('marriage-sorley-jilbhe-airgid', ...SORLEY_IDS),
    createMarriage('marriage-piaras-johana-airgid', ...PIARAS_IDS),
    createMarriage('affair-piaras-waldri-airgid', ...PIARAS_AFFAIR_IDS, {
      type: 'affair',
      visibility: 'private'
    })
  ],
  parentages: [
    ...childrenOf(
      ['gaothaire-airgid', 'catriona-airgid'],
      FOUNDERS,
      'marriage-tomaltach-grainne-airgid',
      {
        type: 'claimed',
        legitimacy: 'unknown',
        certainty: 'probable',
        notes: 'Zwischen dem Gründerpaar und der ab 1607 datierten Generation sind ausdrücklich nicht einzeln überlieferte Generationen ausgelassen.',
        extensions: { timeJumpId: 'gap-tomaltach-gaothaire-catriona-airgid' }
      }
    ),
    ...childrenOf(['uthbhla-airgid', 'donndubhan-airgid', 'muirgel-airgid'], GAOTHAIRE_IDS, 'marriage-baoigheall-gaothaire'),
    ...childrenOf(['meallchu-airgid', 'doireann-airgid', 'conall-airgid'], DONNDUBHAN_IDS, 'marriage-donndubhan-ruadh-airgid'),
    ...childrenOf(['tomaltach-airgid', 'peadhra-airgid', 'vadria-airgid'], MEALLCHU_IDS, 'marriage-deaghlaith-meallchu'),
    ...childrenOf(['karrach-airgid'], CONALL_IDS, 'marriage-gwyneira-conall'),
    ...childrenOf(['glaodhran-airgid', 'dallan-airgid', 'sorley-airgid'], TOMALTACH_IDS, 'marriage-tomaltach-qubhna-amrhan'),
    ...childrenOf(['piaras-airgid', 'cormac-airgid'], KARRACH_IDS, 'marriage-karrach-ceana-airgid'),
    ...childrenOf(['eachan-airgid', 'dubhan-airgid'], GLAODHRAN_IDS, 'marriage-siobhan-glaodhran-cuinn'),
    ...childrenOf(['rabhla-nessa'], ['glaodhran-airgid'], '', {
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Rabhla Nessa ist Glaodhrans Mündel und keine leibliche Tochter.'
    }),
    ...childrenOf(['quinn-airgid', 'zosie-airgid'], SORLEY_IDS, 'marriage-sorley-jilbhe-airgid'),
    ...childrenOf(['siofra-airgid', 'rua-airgid'], PIARAS_IDS, 'marriage-piaras-johana-airgid'),
    ...childrenOf(['kester-airgid', 'halla-airgid'], PIARAS_AFFAIR_IDS, 'affair-piaras-waldri-airgid', {
      legitimacy: 'illegitimate',
      notes: 'Bastardkinder aus Piaras’ Affäre mit Waldrí.'
    })
  ],
  cadetBranches: [
    marriedAway('married-away-cuinn-catriona-airgid', 'marriage-oircheard-catriona-cuinn', 'cuinn'),
    marriedAway('married-away-gortach-uthbhla-airgid', 'marriage-aodhluan-uthbhla-gortach', 'gortach'),
    marriedAway('married-away-choinnich-muirgel-airgid', 'marriage-cathalan-muirgel-choinnich', 'choinnich'),
    marriedAway('married-away-somhairle-doireann-airgid', 'marriage-proinnseas-doireann', 'somhairle'),
    marriedAway('married-away-tsaoir-peadhra-airgid', 'marriage-naomhan-peadhra-tsaoir', 'tsaor'),
    marriedAway('married-away-iomrach-vadria-airgid', 'marriage-purseil-vadria', 'iomrach')
  ],
  timeJumps: [
    {
      id: 'gap-tomaltach-gaothaire-catriona-airgid',
      parentPartnershipId: 'marriage-tomaltach-grainne-airgid',
      sharedParentPartnershipIds: [],
      childIds: ['gaothaire-airgid', 'catriona-airgid'],
      years: 0,
      fromYear: '????',
      toYear: '1607',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1607 datierten Linie',
      notes: 'Die ausdrückliche Punktreihe der Quelle wird als Überlieferungslücke erhalten und nicht als unmittelbare biologische Elternschaft ausgegeben.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-tomaltach-grainne-airgid',
    houseId: AIRGID_HOUSE_ID,
    crestSubtitle: 'Dún Tiarna · Lehensherrschaft der Tir An’Airgid · Cel Leagan · Tir na Sruth',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tomaltach-founder-airgid',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Tir An’Airgid (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten und Oberhauptfolge folgen der bereitgestellten Tir-An’Airgid-Akte. Die ausdrückliche Punktreihe nach dem Gründerpaar bleibt als serielle Überlieferungslücke sichtbar. Catrìona, Uthbhla, Muirgel, Doireann, Peadhra und Vadria führen ihre Nachkommen ausschließlich in den verknüpften Zielhäusern weiter. Rabhla Nessa ist als Mündel, Kester und Halla sind als Bastardkinder aus Piaras’ Affäre mit Waldrí erfasst. Die individuellen Airgid-Bilder werden lokal geführt; identische Personen mit bereits kanonischem Gegenaktenporträt verwenden dieses weiter. Wiederholte Standardsilhouetten und die unbenannten Verlobtenfelder der jüngsten Generation werden nicht als Personen importiert.',
    sourceRevision: 2,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Dún Tiarna der Tir An’Airgid',
      headOrder: Object.freeze([
        'tomaltach-founder-airgid',
        'gaothaire-airgid',
        'donndubhan-airgid',
        'meallchu-airgid',
        'tomaltach-airgid'
      ]),
      publishedOrder: Object.freeze([])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_TIR_AN_AIRGID_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_TIR_AN_AIRGID_REUSED_PORTRAIT_IDS,
      currentSourceImagesUsed: true,
      genericSourceSilhouettesIgnored: true,
      anonymousBetrothedsIgnored: true
    }),
    sourceDiscrepancies: Object.freeze([
      Object.freeze({
        field: 'name',
        personId: 'glaodhran-airgid',
        sourceValues: Object.freeze(['Gloadhran', 'Glaodhran']),
        resolution: 'Glaodhran wird verwendet, weil die Abstammungsüberschrift und die bestehende Cuinn-Gegenakte diese Schreibweise führen.'
      })
    ]),
    principality: 'Leitheach',
    territory: 'Tir na Sruth',
    territoryGloss: 'Land des Stroms',
    historicalStatus: 'active',
    albicRank: 'dun-tiarna',
    administrativeRole: 'Dún Tiarna der Lehensherrschaft Tir An’Airgid',
    immediateLiegeHouseId: 'haus-tir-an-cuinn',
    immediateLiegeHouseName: 'Clan Tir An’Cuinn',
    legacyTitles: ['Haus Airgid', "Tir An'Airgid"],
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'sourceNote',
      'sourceDiscrepancies',
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
    registryManagedHouseProfileFields: TIR_NA_SRUTH_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['houseId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-airgid-gruender', 'haus-airgid-gruenderin'],
      partnerships: ['marriage-haus-airgid-founders']
    }
  }
});
