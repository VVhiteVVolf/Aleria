import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_TIR_AN_CUINN_PORTRAITS,
  HOUSE_TIR_AN_CUINN_REUSED_PORTRAIT_IDS
} from './house-tir-an-cuinn-portraits.js';
import {
  LEITHEACH_CADET_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_EMBLEMS
} from './leitheach-house-profiles.js';
import { TIR_NA_GORTANNA_HOUSE_EMBLEMS } from './tir-na-gortanna-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';
import {
  TIR_NA_SRUTH_HOUSE_EMBLEMS,
  TIR_NA_SRUTH_HOUSE_PROFILES,
  TIR_NA_SRUTH_MANAGED_PROFILE_FIELDS
} from './tir-na-sruth-house-profiles.js';
import { TIR_NA_TONN_HOUSE_EMBLEMS } from './tir-na-tonn-house-profiles.js';

const CUINN_HOUSE_ID = 'house-cuinn';
const CUINN_EMBLEM = TIR_NA_SRUTH_HOUSE_EMBLEMS['tir-an-cuinn'];

const HOUSE_HEAD_IDS = new Set([
  'blarann-cuinn',
  'taidhghean-cuinn',
  'oircheard-cuinn',
  'radhain-cuinn',
  'brendan-cuinn',
  'gofraidh-cuinn'
]);

const SUCCESSION_IDS = new Set(['gorm-cuinn', 'brendan-1718-cuinn']);

const HEAD_TITLES = Object.freeze({
  'blarann-cuinn': 'Erster bekannter Mor Tiarna von Tir na Sruth',
  'taidhghean-cuinn': 'Mor Tiarna von Tir na Sruth',
  'oircheard-cuinn': 'Mor Tiarna von Tir na Sruth · bis 1671',
  'radhain-cuinn': 'Mor Tiarna von Tir na Sruth · 1671–1689',
  'brendan-cuinn': 'Mor Tiarna von Tir na Sruth · 1689–1705',
  'gofraidh-cuinn': 'Mor Tiarna von Tir na Sruth · seit 1705',
  'gorm-cuinn': 'Erster der Erbfolge des Mor Tiarna',
  'brendan-1718-cuinn': 'Zweiter der Erbfolge des Mor Tiarna'
});

const TARGETS = Object.freeze({
  cruthin: Object.freeze({
    name: 'Clan Dál’Cruthin',
    houseId: 'house-cruthin',
    targetFamilyId: 'haus-dal-cruthin',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']
  }),
  cumhail: Object.freeze({
    name: 'Clan Mac Ard Cumhaill',
    houseId: 'house-cumhail',
    targetFamilyId: 'haus-mac-ard-cumhaill',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']
  }),
  gaelach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']
  }),
  gallchobhair: Object.freeze({
    name: 'Fir An’Gallchobhair',
    houseId: 'house-gallchobhair',
    targetFamilyId: 'haus-gallchobhair',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair
  }),
  cairge: Object.freeze({
    name: 'Haus Cairge',
    houseId: 'house-cairge',
    targetFamilyId: 'haus-cairge',
    emblem: ''
  }),
  muirin: Object.freeze({
    name: 'Haus Muirin',
    houseId: 'house-muirin',
    targetFamilyId: 'haus-muirin',
    emblem: ''
  }),
  tarvo: Object.freeze({
    name: 'Clan Fir An’Tarvo',
    houseId: 'house-tarvo',
    targetFamilyId: 'haus-fir-an-tarvo',
    emblem: TIR_NA_TONN_HOUSE_EMBLEMS['fir-an-tarvo']
  }),
  airgid: Object.freeze({
    name: 'Tir An’Airgid',
    houseId: 'house-airgid',
    targetFamilyId: 'haus-airgid',
    emblem: TIR_NA_SRUTH_HOUSE_EMBLEMS.airgid
  }),
  laoch: Object.freeze({
    name: 'Ruin Ua Laoch',
    houseId: 'house-laoch',
    targetFamilyId: 'haus-ruin-ua-laoch',
    emblem: LEITHEACH_CADET_HOUSE_EMBLEMS['ruin-ua-laoch']
  })
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CUINN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_TIR_AN_CUINN_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === CUINN_HOUSE_ID ? 'core' : 'married'),
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

function marriedAwayPerson(id, name, sex, birth, death, targetKey, options = {}) {
  const target = TARGETS[targetKey];
  return person(id, name, sex, birth, death, CUINN_HOUSE_ID, {
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
    idPrefix: 'tir-an-cuinn-parentage',
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

const BLARANN_IDS = ['blarann-cuinn', 'sine-cuinn'];
const NATHRACHAN_IDS = ['nathrachan-cuinn', 'amerlaith-cuinn'];
const TAIDHGHEAN_IDS = ['taidhghean-cuinn', 'brid-cuinn'];
const SAORGHGLAS_IDS = ['fionntan-cruthin', 'saorghlas-cuinn'];
const OIRCHEARD_IDS = ['oircheard-cuinn', 'catriona-airgid'];
const RADHAIN_IDS = ['radhain-cuinn', 'mairin-midgna'];
const LIADAN_IDS = ['tiernan-cumhail', 'liadan-cuinn'];
const ROGHNALL_IDS = ['roghnall-cuinn', 'labhaoise-amrhan'];
const BRENDAN_IDS = ['brendan-cuinn', 'liadan-airt'];
const EIRE_IDS = ['fodhlaidh-gealach', 'eire-cuinn'];
const AITHNE_IDS = ['eoghair-gallchobhair', 'aithne-cuinn'];
const TALAMHACH_IDS = ['talamhach-cuinn', 'iarla'];
const GOFRAIDH_IDS = ['macha-cruthin', 'gofraidh-cuinn'];
const BRIGID_IDS = ['brigid-cuinn', 'treasach-cairge'];
const AIDEN_IDS = ['aiden-cuinn', 'sgail-tarvo'];
const CRATHACH_IDS = ['crathach-cuinn', 'viomhan-muirin'];
const SIOMHAR_IDS = ['siomhar-cuinn', 'dervla'];
const GORM_IDS = ['gorm-cuinn', 'zomhlaigh-amrhan'];
const OIRTHNAIT_IDS = ['athluan-tarvo', 'oirthnait-cuinn'];
const GOBAN_IDS = ['goban-cuinn', 'zair'];
const SIOBHAN_IDS = ['siobhan-cuinn', 'glaodhran-airgid'];
const ATHGHALL_IDS = ['athghall-cuinn', 'peath'];
const AIMHIRNE_IDS = ['zadran-laoch', 'aimhirne-cuinn'];

export const HOUSE_TIR_AN_CUINN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-tir-an-cuinn',
    title: 'Clan Tir An’Cuinn',
    motto: '',
    description: 'Mor-Tiarna-Clan von Tir na Sruth mit Sitz in Ceanntire. Zwei ausdrückliche Überlieferungslücken trennen den frühen Gründerkreis von der ab 1603 datierten Linie.',
    emblem: CUINN_EMBLEM,
    houseProfile: TIR_NA_SRUTH_HOUSE_PROFILES['tir-an-cuinn']
  },
  houses: [
    house(CUINN_HOUSE_ID, 'Clan Tir An’Cuinn', CUINN_EMBLEM),
    house('house-cruthin', 'Clan Dál’Cruthin', TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']),
    house('house-airgid', 'Tir An’Airgid', TIR_NA_SRUTH_HOUSE_EMBLEMS.airgid),
    house('house-midgna', 'Haus Midgna'),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']),
    house('house-amrhan', 'Ua’Amhran', TIR_NA_SRUTH_HOUSE_EMBLEMS.amrhan),
    house('house-mac-airt', 'Clan Mac Airt', LEITHEACH_HOUSE_EMBLEMS['mac-airt']),
    house('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    house('house-gallchobhair', 'Fir An’Gallchobhair', TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair),
    house('house-cairge', 'Haus Cairge'),
    house('house-muirin', 'Haus Muirin'),
    house('house-tarvo', 'Clan Fir An’Tarvo', TIR_NA_TONN_HOUSE_EMBLEMS['fir-an-tarvo']),
    house('house-laoch', 'Ruin Ua Laoch', LEITHEACH_CADET_HOUSE_EMBLEMS['ruin-ua-laoch'])
  ],
  persons: [
    person('blarann-cuinn', 'Blàrann Cuinn', 'male', '????', '????'),
    spouse('sine-cuinn', 'Síne', 'female', '????', '????'),

    person('nathrachan-cuinn', 'Nathrachán Cuinn', 'male', '????', '????', CUINN_HOUSE_ID, {
      title: 'Enterbter Cuinn-Erbe und Begründer des Kadettenhauses Ua’Amhran',
      tags: ['Gründer', 'Enterbter Cuinn-Erbe'],
      notes: 'Nathrachán verließ die Tir An’Cuinn für Amerlaith und begründete mit ihr das anerkannte Kadettenhaus Ua’Amhran.',
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('amerlaith-cuinn', 'Amerlaith', 'female', '????', '????', '', {
      title: 'Bardin und Mitbegründerin des Kadettenhauses Ua’Amhran',
      tags: ['Gründerin', 'Bardin'],
      notes: 'Amerlaith begründete mit Nathrachán das anerkannte Kadettenhaus Ua’Amhran.'
    }),
    person('taidhghean-cuinn', 'Taidhghean Cuinn', 'male', '????', '????'),
    spouse('brid-cuinn', 'Bríd', 'female', '????', '????'),

    marriedAwayPerson('saorghlas-cuinn', 'Saorghlas Cuinn', 'female', '1603', '1685', 'cruthin'),
    spouse('fionntan-cruthin', 'Fionntan Cruthin', 'male', '1602', '1671', 'house-cruthin'),
    person('oircheard-cuinn', 'Oircheard Cuinn', 'male', '1606', '1671'),
    spouse('catriona-airgid', 'Catrìona Airgid', 'female', '1607', '1689', 'house-airgid'),

    person('radhain-cuinn', 'Ràdhain Cuinn', 'male', '1624', '1689'),
    spouse('mairin-midgna', 'Máirín Midgna', 'female', '1629', '????', 'house-midgna'),
    marriedAwayPerson('liadan-cuinn', 'Líadan Cuinn', 'female', '1635', '1677', 'cumhail'),
    spouse('tiernan-cumhail', 'Tiernan Cumhail', 'male', '1633', '1688', 'house-cumhail'),
    person('roghnall-cuinn', 'Ròghnall Cuinn', 'male', '1628', '1694'),
    spouse('labhaoise-amrhan', 'Labhaoise Amhran', 'female', '1628', '1702', 'house-amrhan'),

    person('brendan-cuinn', 'Brendan Cuinn', 'male', '1648', '1705'),
    spouse('liadan-airt', 'Líadan Airt', 'female', '1650', '1717', 'house-mac-airt'),
    marriedAwayPerson('eire-cuinn', 'Eire Cuinn', 'female', '1651', '1689', 'gaelach'),
    spouse('fodhlaidh-gealach', 'Fódhlaidh Gealach', 'male', '1650', '1731', 'house-gealach'),
    marriedAwayPerson('aithne-cuinn', 'Aithne Cuinn', 'female', '1646', '1727', 'gallchobhair'),
    spouse('eoghair-gallchobhair', 'Eoghair Gallchobhair', 'male', '1646', '1724', 'house-gallchobhair'),
    person('talamhach-cuinn', 'Talamhach Cuinn', 'male', '1649', '1701'),
    spouse('iarla', 'Ìarla', 'female', '1652', '1698'),

    person('gofraidh-cuinn', 'Gofraidh Cuinn', 'male', '1670', ''),
    spouse('macha-cruthin', 'Mácha Cruthin', 'female', '1675', '', 'house-cruthin'),
    marriedAwayPerson('brigid-cuinn', 'Brigid Cuinn', 'female', '1673', '', 'cairge'),
    spouse('treasach-cairge', 'Treasach Cairge', 'male', '1671', '', 'house-cairge'),
    person('aiden-cuinn', 'Aiden Cuinn', 'male', '1676', '1733'),
    spouse('sgail-tarvo', 'Sgàil Tarvo', 'female', '1678', '', 'house-tarvo'),
    marriedAwayPerson('crathach-cuinn', 'Cràthach Cuinn', 'male', '1674', '', 'muirin'),
    spouse('viomhan-muirin', 'Viomhán Muirin', 'female', '1670', '', 'house-muirin'),
    person('siomhar-cuinn', 'Sìomhar Cuinn', 'male', '1676', ''),
    spouse('dervla', 'Dervla', 'female', '1679', ''),

    person('gorm-cuinn', 'Gorm Cuinn', 'male', '1694', ''),
    spouse('zomhlaigh-amrhan', 'Zòmhlaigh Amhran', 'female', '1699', '', 'house-amrhan', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    marriedAwayPerson('oirthnait-cuinn', 'Oirthnait Cuinn', 'female', '1698', '', 'tarvo'),
    spouse('athluan-tarvo', 'Athluan Tarvo', 'male', '1693', '', 'house-tarvo'),
    person('goban-cuinn', 'Goban Cuinn', 'male', '1697', ''),
    spouse('zair', 'Zàir', 'female', '1701', ''),
    marriedAwayPerson('siobhan-cuinn', 'Siobhan Cuinn', 'female', '1702', '', 'airgid'),
    spouse('glaodhran-airgid', 'Glaodhran Airgid', 'male', '1697', '', 'house-airgid'),
    person('athghall-cuinn', 'Athghall Cuinn', 'male', '1701', ''),
    spouse('peath', 'Peath', 'female', '1704', ''),
    marriedAwayPerson('aimhirne-cuinn', 'Aimhirne Cuinn', 'female', '1704', '', 'laoch'),
    spouse('zadran-laoch', 'Zadrán Laoch', 'male', '1698', '', 'house-laoch'),

    person('brendan-1718-cuinn', 'Brendan Cuinn', 'male', '1718', ''),
    person('liadan-1725-cuinn', 'Líadan Cuinn', 'female', '1725', ''),
    person('jarlaith-cuinn', 'Jarlaith Cuinn', 'male', '1723', ''),
    person('keegan-cuinn', 'Keegan Cuinn', 'male', '1725', ''),
    person('talullah-cuinn', 'Talullah Cuinn', 'female', '1728', ''),
    person('deirthine-cuinn', 'Deirthine Cuinn', 'female', '1724', ''),
    person('ramhach-cuinn', 'Rámhach Cuinn', 'male', '1728', '')
  ],
  partnerships: [
    endedMarriage('marriage-blarann-sine-cuinn', BLARANN_IDS),
    endedMarriage('marriage-nathrachan-amerlaith-cuinn', NATHRACHAN_IDS),
    endedMarriage('marriage-taidhghean-brid-cuinn', TAIDHGHEAN_IDS),
    endedMarriage('marriage-fionntan-saorghlas', SAORGHGLAS_IDS, '1671'),
    endedMarriage('marriage-oircheard-catriona-cuinn', OIRCHEARD_IDS, '1671'),
    endedMarriage('marriage-radhain-mairin-cuinn', RADHAIN_IDS, '1689'),
    createMarriage('marriage-tiernan-liadan', ...LIADAN_IDS),
    endedMarriage('marriage-roghnall-labhaoise-cuinn', ROGHNALL_IDS, '1694'),
    endedMarriage('marriage-brendan-liadan-airt', BRENDAN_IDS, '1705'),
    createMarriage('marriage-fodhlaidh-eire', ...EIRE_IDS),
    createMarriage('marriage-eoghair-aithne', ...AITHNE_IDS),
    endedMarriage('marriage-talamhach-iarla-cuinn', TALAMHACH_IDS, '1698'),
    createMarriage('marriage-macha-gofraidh', ...GOFRAIDH_IDS),
    createMarriage('marriage-brigid-treasach-cuinn', ...BRIGID_IDS),
    endedMarriage('marriage-aiden-sgail', AIDEN_IDS, '1733'),
    createMarriage('marriage-crathach-viomhan-cuinn', ...CRATHACH_IDS),
    createMarriage('marriage-siomhar-dervla-cuinn', ...SIOMHAR_IDS),
    createMarriage('marriage-gorm-zomhlaigh-cuinn', ...GORM_IDS),
    createMarriage('marriage-athluan-oirthnait', ...OIRTHNAIT_IDS),
    createMarriage('marriage-goban-zair-cuinn', ...GOBAN_IDS),
    createMarriage('marriage-siobhan-glaodhran-cuinn', ...SIOBHAN_IDS),
    createMarriage('marriage-athghall-peath-cuinn', ...ATHGHALL_IDS),
    createMarriage('marriage-zadran-aimhirne', ...AIMHIRNE_IDS)
  ],
  parentages: [
    ...childrenOf(['nathrachan-cuinn', 'taidhghean-cuinn'], BLARANN_IDS, 'marriage-blarann-sine-cuinn', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und dieser Generation sind nicht einzeln überlieferte Generationen ausgelassen.',
      extensions: { timeJumpId: 'gap-blarann-nathrachan-taidhghean-cuinn' }
    }),
    ...childrenOf(['saorghlas-cuinn', 'oircheard-cuinn'], TAIDHGHEAN_IDS, 'marriage-taidhghean-brid-cuinn', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Saorghlas und Oircheard setzen Taidhgheans und Bríds Cuinn-Linie nach einer weiteren Überlieferungslücke fort; eine unmittelbare biologische Elternschaft wird nicht behauptet.',
      extensions: { timeJumpId: 'gap-nathrachan-taidhghean-saorghlas-oircheard-cuinn' }
    }),
    ...childrenOf(['radhain-cuinn', 'liadan-cuinn', 'roghnall-cuinn'], OIRCHEARD_IDS, 'marriage-oircheard-catriona-cuinn'),
    ...childrenOf(['brendan-cuinn', 'eire-cuinn'], RADHAIN_IDS, 'marriage-radhain-mairin-cuinn'),
    ...childrenOf(['aithne-cuinn', 'talamhach-cuinn'], ROGHNALL_IDS, 'marriage-roghnall-labhaoise-cuinn'),
    ...childrenOf(['gofraidh-cuinn', 'brigid-cuinn', 'aiden-cuinn'], BRENDAN_IDS, 'marriage-brendan-liadan-airt'),
    ...childrenOf(['crathach-cuinn', 'siomhar-cuinn'], TALAMHACH_IDS, 'marriage-talamhach-iarla-cuinn'),
    ...childrenOf(['gorm-cuinn', 'oirthnait-cuinn'], GOFRAIDH_IDS, 'marriage-macha-gofraidh'),
    ...childrenOf(['goban-cuinn', 'siobhan-cuinn'], AIDEN_IDS, 'marriage-aiden-sgail'),
    ...childrenOf(['athghall-cuinn', 'aimhirne-cuinn'], SIOMHAR_IDS, 'marriage-siomhar-dervla-cuinn'),
    ...childrenOf(['brendan-1718-cuinn', 'liadan-1725-cuinn'], GORM_IDS, 'marriage-gorm-zomhlaigh-cuinn'),
    ...childrenOf(['jarlaith-cuinn', 'keegan-cuinn', 'talullah-cuinn'], GOBAN_IDS, 'marriage-goban-zair-cuinn'),
    ...childrenOf(['deirthine-cuinn', 'ramhach-cuinn'], ATHGHALL_IDS, 'marriage-athghall-peath-cuinn')
  ],
  cadetBranches: [
    createCadetHouseBranch({
      id: 'cadet-ua-amrhan-nathrachan-amerlaith',
      name: 'Clan Ua’Amhran',
      parentPartnershipId: 'marriage-nathrachan-amerlaith-cuinn',
      houseId: 'house-amrhan',
      targetFamilyId: 'haus-amrhan',
      emblem: TIR_NA_SRUTH_HOUSE_EMBLEMS.amrhan,
      subtitle: 'Von Nathrachán und Amerlaith begründetes Kadettenhaus',
      notes: 'Nathrachán nahm für die Ehe mit der Bardin Amerlaith Enterbung und Verbannung in Kauf. Die Verbindung wurde später als gottgepriesen anerkannt.',
      extensions: { chartAlignBelowPartnership: true }
    }),
    marriedAway('married-away-cruthin-saorghlas', 'marriage-fionntan-saorghlas', 'cruthin'),
    marriedAway('married-away-cumhail-liadan', 'marriage-tiernan-liadan', 'cumhail'),
    marriedAway('married-away-gaelach-eire', 'marriage-fodhlaidh-eire', 'gaelach'),
    marriedAway('married-away-gallchobhair-aithne', 'marriage-eoghair-aithne', 'gallchobhair'),
    marriedAway('married-away-cairge-brigid', 'marriage-brigid-treasach-cuinn', 'cairge'),
    marriedAway('married-away-muirin-crathach', 'marriage-crathach-viomhan-cuinn', 'muirin'),
    marriedAway('married-away-tarvo-oirthnait', 'marriage-athluan-oirthnait', 'tarvo'),
    marriedAway('married-away-airgid-siobhan', 'marriage-siobhan-glaodhran-cuinn', 'airgid'),
    marriedAway('married-away-laoch-aimhirne', 'marriage-zadran-aimhirne', 'laoch')
  ],
  timeJumps: [
    {
      id: 'gap-blarann-nathrachan-taidhghean-cuinn',
      parentPartnershipId: 'marriage-blarann-sine-cuinn',
      sharedParentPartnershipIds: [],
      childIds: ['nathrachan-cuinn', 'taidhghean-cuinn'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Die Quelle setzt nach dem Gründerpaar Blàrann und Síne eine ausdrückliche Punktreihe.',
      extensions: {}
    },
    {
      id: 'gap-nathrachan-taidhghean-saorghlas-oircheard-cuinn',
      parentPartnershipId: 'marriage-taidhghean-brid-cuinn',
      sharedParentPartnershipIds: [],
      childIds: ['saorghlas-cuinn', 'oircheard-cuinn'],
      years: 0,
      fromYear: '????',
      toYear: '1603',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1603 datierten Linie',
      notes: 'Die zweite Punktreihe führt ausschließlich Taidhgheans und Bríds Cuinn-Hauptlinie fort. Nathrachán und Amerlaith zweigen als Gründerpaar des Kadettenhauses Ua’Amhran ab.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-blarann-sine-cuinn',
    houseId: CUINN_HOUSE_ID,
    crestSubtitle: 'Mor Tiarnatum Tir na Sruth · Ceanntire · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'blarann-cuinn',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Tir An’Cuinn (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Amtszeiten und Erbfolge folgen der bereitgestellten Cuinn-Akte. Die zwei dort sichtbaren Punktreihen werden als serielle Überlieferungslücken geführt. Nathrachán und Amerlaith begründen gemeinsam das Kadettenhaus Ua’Amhran und sind deshalb kein Ursprung der späteren Cuinn-Hauptlinie; diese läuft nach der zweiten Lücke ausschließlich über Taidhghean und Bríd weiter. Sämtliche Bilder der Cuinn-Vorlage bleiben unberücksichtigt; ausschließlich bereits in anderen Stammbaumakten kanonisierte Porträts werden wiederverwendet. Personen ohne solches Gegenstück erhalten die reguläre Platzhaltersilhouette.',
    sourceRevision: 5,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Mor Tiarna von Tir na Sruth',
      headOrder: Object.freeze([
        'blarann-cuinn',
        'taidhghean-cuinn',
        'oircheard-cuinn',
        'radhain-cuinn',
        'brendan-cuinn',
        'gofraidh-cuinn'
      ]),
      publishedOrder: Object.freeze(['gorm-cuinn', 'brendan-1718-cuinn'])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: Object.freeze([]),
      reusedPersonIds: HOUSE_TIR_AN_CUINN_REUSED_PORTRAIT_IDS,
      sourceImagesIgnored: true,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir na Sruth',
    territoryGloss: 'Land des Stroms',
    historicalStatus: 'active',
    directMorTiarnaBarony: true,
    albicRank: 'mor-tiarna',
    administrativeRole: 'Mor Tiarna von Tir na Sruth',
    immediateLiegeHouseId: 'haus-mac-ard-cumhaill',
    immediateLiegeHouseName: 'Clan Mac Ard Cumhaill',
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
      'directMorTiarnaBarony',
      'albicRank',
      'administrativeRole',
      'immediateLiegeHouseId',
      'immediateLiegeHouseName'
    ],
    registryManagedHouseProfileFields: TIR_NA_SRUTH_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['houseId'],
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: ['house-tir-an-cuinn'],
      persons: ['haus-tir-an-cuinn-gruender', 'haus-tir-an-cuinn-gruenderin'],
      partnerships: ['marriage-haus-tir-an-cuinn-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
