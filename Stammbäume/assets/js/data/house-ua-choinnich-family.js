import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_UA_CHOINNICH_PORTRAITS,
  HOUSE_UA_CHOINNICH_REUSED_PORTRAIT_IDS
} from './house-ua-choinnich-portraits.js';
import {
  TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS,
  TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES,
  TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS
} from './tir-an-comhchuibhis-house-profiles.js';

const CHOINNICH_HOUSE_ID = 'house-choinnich';
const CHOINNICH_EMBLEM = TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.choinnich;

const HOUSE_HEAD_IDS = new Set([
  'sweeney-founder-choinnich',
  'murchadh-ancient-choinnich',
  'garbhan-choinnich',
  'cathalan-choinnich',
  'murchadh-1649-choinnich',
  'tiarnog-choinnich'
]);

const HEAD_TITLES = Object.freeze({
  'sweeney-founder-choinnich': 'Gründer und erster überlieferter Laird des Clan Ua’Choinnich',
  'murchadh-ancient-choinnich': 'Frühes Oberhaupt des Clan Ua’Choinnich',
  'garbhan-choinnich': 'Laird des Clan Ua’Choinnich · bis 1659',
  'cathalan-choinnich': 'Laird des Clan Ua’Choinnich · 1659–1691',
  'murchadh-1649-choinnich': 'Laird des Clan Ua’Choinnich · 1691–1720',
  'tiarnog-choinnich': 'Laird des Clan Ua’Choinnich in Sruthlann · seit 1720'
});

const TARGETS = Object.freeze({
  gwefrydd: Object.freeze({
    name: 'Haus Gwefrydd',
    houseId: 'house-gwefrydd',
    targetFamilyId: 'haus-gwefrydd',
    emblem: 'assets/images/houses/Artus Streben/haus-gwefrydd.png'
  }),
  tsaoir: Object.freeze({
    name: 'Dal T’Saor',
    houseId: 'house-dal-t-saor',
    targetFamilyId: 'haus-dal-t-saor',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['dal-t-saor']
  }),
  grawn: Object.freeze({
    name: 'Haus Grawn',
    houseId: 'house-grawn',
    targetFamilyId: 'haus-grawn',
    emblem: 'assets/images/houses/Ährental/haus-grawn.png'
  }),
  laidir: Object.freeze({
    name: 'Ruin’Laidir',
    houseId: 'house-laidir',
    targetFamilyId: 'haus-laidir',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.laidir
  }),
  ciarog: Object.freeze({
    name: 'Haus Ciaróg',
    houseId: 'house-ciarog',
    targetFamilyId: 'haus-ciarog',
    emblem: 'assets/images/houses/Ährental/Graue Bucht/haus-ciarog.png'
  }),
  trodach: Object.freeze({
    name: 'Ard Trodach',
    houseId: 'house-trodach',
    targetFamilyId: 'haus-ard-trodach',
    emblem: 'assets/images/houses/Leitheach/clan-ard-trodach.png'
  }),
  mhuir: Object.freeze({
    name: 'Clan Na’Mhuir',
    houseId: 'house-na-mhuir',
    targetFamilyId: 'haus-na-mhuir',
    emblem: 'assets/images/houses/Leitheach/clan-na-mhuir.png'
  }),
  airt: Object.freeze({
    name: 'Clan Mac Airt',
    houseId: 'house-mac-airt',
    targetFamilyId: 'haus-mac-airt',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['mac-airt']
  }),
  eirce: Object.freeze({
    name: 'Ua’Eirce',
    houseId: 'house-eirce',
    targetFamilyId: 'haus-ua-eirce',
    emblem: 'assets/images/houses/Leitheach/clan-ua-eirce.png'
  })
});

function lineageRoleFor(personId) {
  return HOUSE_HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CHOINNICH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_UA_CHOINNICH_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === CHOINNICH_HOUSE_ID ? 'core' : 'married'),
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
  return person(id, name, 'female', birth, death, CHOINNICH_HOUSE_ID, {
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
    idPrefix: 'ua-choinnich-parentage',
    ...options
  });
}

function endedMarriage(id, participantIds, end = '', options = {}) {
  return createMarriage(id, ...participantIds, { ...options, status: 'ended', end });
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

function manageBranchTarget(record) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem', 'subtitle']
    }
  };
}

const UNKNOWN_PARENT_IDS = ['unknown-father-choinnich', 'unknown-mother-choinnich'];
const SWEENEY_FOUNDER_IDS = ['sweeney-founder-choinnich', 'laoiseach-spouse-choinnich'];
const BEIBHINN_IDS = ['wynfor-gwefrydd', 'beibhinn-choinnich'];
const MURCHADH_ANCIENT_IDS = ['murchadh-ancient-choinnich', 'maolmhuire-spouse-choinnich'];
const GARBHAN_IDS = ['garbhan-choinnich', 'tegwen-airt'];
const HAILEIGH_IDS = ['haileigh-choinnich', 'wighnach-tsaoir'];
const ISEABAIL_IDS = ['mervyn-grawn', 'iseabail-choinnich'];
const CATHALAN_IDS = ['cathalan-choinnich', 'muirgel-airgid'];
const GLAODHAICH_IDS = ['glaodhaich-choinnich', 'aonghus-laidir'];
const AODNAIT_IDS = ['morgan-ciarog', 'aodnait-choinnich'];
const YMARCHAN_IDS = ['ymarchan-choinnich', 'peatharlach-spouse-choinnich'];
const MURCHADH_1649_IDS = ['murchadh-1649-choinnich', 'zarmhnait-blar'];
const OIDEACH_IDS = ['carthach-trodach', 'oideach-choinnich'];
const EMER_IDS = ['morwenna-dyngwn', 'emer-choinnich'];
const FIONNGHUALA_IDS = ['muirgheas-mhuir', 'fionnghuala-choinnich'];
const TIARNOG_IDS = ['tiarnog-choinnich', 'haileigh-muileach'];
const SINEAD_IDS = ['trianach-laidir', 'sinead-choinnich'];
const EILIS_IDS = ['donovan-airt', 'eilis-choinnich'];
const IOSOGAN_IDS = ['iosogan-choinnich', 'eibhleann-spouse-choinnich'];
const WYLIE_IDS = ['siofra-airt', 'wylie-choinnich'];
const GLAISNE_IDS = ['daithi-eirce', 'glaisne-choinnich'];
const VAILINTIN_IDS = ['vailintin-choinnich', 'quona-tsaoir'];
const JORIATH_IDS = ['joriath-choinnich', 'maonait-blar'];

export const HOUSE_UA_CHOINNICH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-choinnich',
    title: 'Ua’Choinnich',
    motto: '',
    description: 'Laird-Clan in Sruthlann unter dem Mor Tiarna des Clan Mac Airt; die überlieferte Linie reicht vom Gründer Sweeney bis zur Generation ab 1720.',
    emblem: CHOINNICH_EMBLEM,
    houseProfile: TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES.choinnich
  },
  houses: [
    house(CHOINNICH_HOUSE_ID, 'Ua’Choinnich', CHOINNICH_EMBLEM),
    house('house-gwefrydd', 'Haus Gwefrydd', TARGETS.gwefrydd.emblem),
    house('house-mac-airt', 'Clan Mac Airt', TARGETS.airt.emblem),
    house('house-dal-t-saor', 'Dal T’Saor', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['dal-t-saor']),
    house('house-grawn', 'Haus Grawn', TARGETS.grawn.emblem),
    house('house-airgid', 'Haus Airgid'),
    house('house-laidir', 'Ruin’Laidir', TARGETS.laidir.emblem),
    house('house-ciarog', 'Haus Ciaróg', TARGETS.ciarog.emblem),
    house('house-nic-blar', 'Clan Nic Blar', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['nic-blar']),
    house('house-trodach', 'Ard Trodach', TARGETS.trodach.emblem),
    house('house-dyngwn', 'Haus Dyngwn', 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-dyngwn.png'),
    house('house-na-mhuir', 'Clan Na’Mhuir', TARGETS.mhuir.emblem),
    house('house-muileach', 'Haus Muileach'),
    house('house-eirce', 'Ua’Eirce', TARGETS.eirce.emblem)
  ],
  persons: [
    person('unknown-father-choinnich', '???', 'male', '????', '', CHOINNICH_HOUSE_ID, {
      status: 'unknown',
      title: 'Unbekannter Vater Sweeneys'
    }),
    person('unknown-mother-choinnich', '???', 'female', '????', '', CHOINNICH_HOUSE_ID, {
      status: 'unknown',
      title: 'Unbekannte Mutter Sweeneys'
    }),
    person('sweeney-founder-choinnich', 'Sweeney Choinnich', 'male', '????', '????', CHOINNICH_HOUSE_ID, {
      tags: ['Gründer']
    }),
    spouse('laoiseach-spouse-choinnich', 'Laoiseach', 'female', '????', '????'),

    awayWoman('beibhinn-choinnich', 'Beibhinn Choinnich', '????', '????', 'gwefrydd'),
    spouse('wynfor-gwefrydd', 'Wynfor Gwefrydd', 'male', '????', '????', 'house-gwefrydd'),
    person('murchadh-ancient-choinnich', 'Murchadh Choinnich', 'male', '????', '????'),
    spouse('maolmhuire-spouse-choinnich', 'Maolmhuire', 'female', '????', '????'),

    person('garbhan-choinnich', 'Garbhán Choinnich', 'male', '1603', '1659'),
    spouse('tegwen-airt', 'Tegwen Airt', 'female', '1607', '1684', 'house-mac-airt'),
    awayWoman('haileigh-choinnich', 'Haileigh Choinnich', '1607', '1671', 'tsaoir'),
    spouse('wighnach-tsaoir', 'Wighnach T’Saoir', 'male', '1601', '1671', 'house-dal-t-saor', {
      extensions: { registryManagedFields: ['worldPersonId', 'houseId'] }
    }),
    awayWoman('iseabail-choinnich', 'Iseabail Choinnich', '1614', '1691', 'grawn', {
      notes: 'Die Vorlage markiert Iseabail einmal irrtümlich als männlich; Gegenakte, Name und Ehe weisen sie als Frau aus.'
    }),
    spouse('mervyn-grawn', 'Mervyn Grawn', 'male', '1613', '1689', 'house-grawn'),

    person('cathalan-choinnich', 'Cathalán Choinnich', 'male', '1628', '1691'),
    spouse('muirgel-airgid', 'Muirgel Airgid', 'female', '1632', '1714', 'house-airgid'),
    awayWoman('glaodhaich-choinnich', 'Glaodhaich Choinnich', '1630', '1700', 'laidir'),
    spouse('aonghus-laidir', 'Aonghus Laidir', 'male', '1629', '1709', 'house-laidir', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    awayWoman('aodnait-choinnich', 'Aodnait Choinnich', '1626', '1683', 'ciarog'),
    spouse('morgan-ciarog', 'Morgan Ciaróg', 'male', '1626', '????', 'house-ciarog'),
    person('ymarchan-choinnich', 'Ymarchan Choinnich', 'male', '1632', '1704'),
    spouse('peatharlach-spouse-choinnich', 'Peatharlach', 'female', '1630', '1711'),

    person('murchadh-1649-choinnich', 'Murchadh Choinnich', 'male', '1649', '1720'),
    spouse('zarmhnait-blar', 'Zarmhnait Blár', 'female', '1654', '1724', 'house-nic-blar'),
    awayWoman('oideach-choinnich', 'Oideach Choinnich', '1655', '1731', 'trodach'),
    spouse('carthach-trodach', 'Carthach Trodach', 'male', '1651', '1709', 'house-trodach'),
    person('emer-choinnich', 'Emer Choinnich', 'male', '1650', '1711'),
    spouse('morwenna-dyngwn', 'Morwenna Dyngwn', 'female', '1653', '1704', 'house-dyngwn'),
    awayWoman('fionnghuala-choinnich', 'Fionnghuala Choinnich', '1656', '1734', 'mhuir'),
    spouse('muirgheas-mhuir', 'Muirgheas Mhuir', 'male', '1654', '1709', 'house-na-mhuir'),

    person('tiarnog-choinnich', 'Tiarnóg Choinnich', 'male', '1670', ''),
    spouse('haileigh-muileach', 'Haileigh Muileach', 'female', '1675', '', 'house-muileach'),
    awayWoman('sinead-choinnich', 'Sinead Choinnich', '1675', '', 'laidir'),
    spouse('trianach-laidir', 'Trianach Laidir', 'male', '1671', '', 'house-laidir', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    awayWoman('eilis-choinnich', 'Eilís Choinnich', '1680', '', 'airt'),
    spouse('donovan-airt', 'Donovan Airt', 'male', '1680', '', 'house-mac-airt'),
    person('iosogan-choinnich', 'Íosógán Choinnich', 'male', '1681', ''),
    spouse('eibhleann-spouse-choinnich', 'Eibhleann', 'female', '1682', ''),

    person('wylie-choinnich', 'Wylie Choinnich', 'male', '1695', ''),
    spouse('siofra-airt', 'Síofra Airt', 'female', '1698', '', 'house-mac-airt'),
    awayWoman('glaisne-choinnich', 'Glaisne Choinnich', '1700', '', 'eirce'),
    spouse('daithi-eirce', 'Dáithí Eirce', 'male', '1697', '', 'house-eirce'),
    person('vailintin-choinnich', 'Vailintín Choinnich', 'male', '1700', ''),
    spouse('quona-tsaoir', 'Quona T’Saoir', 'female', '1702', '', 'house-dal-t-saor', {
      extensions: { registryManagedFields: ['worldPersonId', 'houseId'] }
    }),
    person('joriath-choinnich', 'Joriath Choinnich', 'male', '1703', ''),
    spouse('maonait-blar', 'Maonait Blár', 'female', '1700', '', 'house-nic-blar'),

    person('bruide-choinnich', 'Bruide Choinnich', 'male', '1720', ''),
    person('sweeney-1725-choinnich', 'Sweeney Choinnich', 'male', '1725', ''),
    person('nuala-choinnich', 'Nuala Choinnich', 'female', '1723', ''),
    person('viona-choinnich', 'Viona Choinnich', 'female', '1729', '')
  ],
  partnerships: [
    createMarriage('marriage-unknown-choinnich-parents', ...UNKNOWN_PARENT_IDS, {
      certainty: 'confirmed',
      notes: 'Die Existenz des Elternpaares ist belegt; beide Namen sind nicht überliefert.'
    }),
    endedMarriage('marriage-sweeney-laoiseach-choinnich', SWEENEY_FOUNDER_IDS),
    endedMarriage('marriage-wynfor-beibhinn', BEIBHINN_IDS),
    endedMarriage('marriage-murchadh-maolmhuire-choinnich', MURCHADH_ANCIENT_IDS),
    endedMarriage('marriage-garbhan-tegwen-airt', GARBHAN_IDS, '1659'),
    endedMarriage('marriage-haileigh-wighnach-choinnich', HAILEIGH_IDS, '1671'),
    endedMarriage('marriage-mervyn-iseabail', ISEABAIL_IDS, '1689'),
    endedMarriage('marriage-cathalan-muirgel-choinnich', CATHALAN_IDS, '1691'),
    endedMarriage('marriage-glaodhaich-aonghus-choinnich', GLAODHAICH_IDS, '1700'),
    endedMarriage('marriage-morgan-aodnait-ciarog', AODNAIT_IDS, '1683'),
    endedMarriage('marriage-ymarchan-peatharlach-choinnich', YMARCHAN_IDS, '1704'),
    endedMarriage('marriage-murchadh-zarmhnait-choinnich', MURCHADH_1649_IDS, '1720'),
    endedMarriage('marriage-carthach-oideach', OIDEACH_IDS, '1709'),
    endedMarriage('marriage-morwenna-emer-dyngwn', EMER_IDS, '1704'),
    endedMarriage('marriage-muirgheas-fionnghuala', FIONNGHUALA_IDS, '1709'),
    createMarriage('marriage-tiarnog-haileigh-choinnich', ...TIARNOG_IDS),
    createMarriage('marriage-trianach-sinead-choinnich', ...SINEAD_IDS),
    createMarriage('marriage-donovan-eilis-airt', ...EILIS_IDS),
    createMarriage('marriage-iosogan-eibhleann-choinnich', ...IOSOGAN_IDS),
    createMarriage('marriage-siofra-wylie-airt', ...WYLIE_IDS),
    createMarriage('marriage-daithi-glaisne', ...GLAISNE_IDS),
    createMarriage('marriage-vailintin-quona-choinnich', ...VAILINTIN_IDS),
    createMarriage('marriage-joriath-maonait-choinnich', ...JORIATH_IDS)
  ],
  parentages: [
    ...childrenOf(['sweeney-founder-choinnich'], UNKNOWN_PARENT_IDS, 'marriage-unknown-choinnich-parents'),
    ...childrenOf(
      ['beibhinn-choinnich', 'murchadh-ancient-choinnich'],
      SWEENEY_FOUNDER_IDS,
      'marriage-sweeney-laoiseach-choinnich',
      {
        type: 'claimed',
        certainty: 'disputed',
        notes: 'Die einzelnen Generationen zwischen Sweeney und Beibhinn beziehungsweise Murchadh sind nicht benannt.',
        extensions: { timeJumpId: 'gap-sweeney-beibhinn-murchadh-choinnich' }
      }
    ),
    ...childrenOf(
      ['garbhan-choinnich', 'haileigh-choinnich', 'iseabail-choinnich'],
      MURCHADH_ANCIENT_IDS,
      'marriage-murchadh-maolmhuire-choinnich',
      {
        type: 'claimed',
        certainty: 'disputed',
        notes: 'Die Oberhauptfolge führt von Murchadh zu Garbhán; die dazwischenliegenden Generationen sind nicht einzeln überliefert.',
        extensions: { timeJumpId: 'gap-murchadh-garbhan-generation-choinnich' }
      }
    ),
    ...childrenOf(
      ['cathalan-choinnich', 'glaodhaich-choinnich', 'aodnait-choinnich', 'ymarchan-choinnich'],
      GARBHAN_IDS,
      'marriage-garbhan-tegwen-airt'
    ),
    ...childrenOf(
      ['murchadh-1649-choinnich', 'oideach-choinnich'],
      CATHALAN_IDS,
      'marriage-cathalan-muirgel-choinnich'
    ),
    ...childrenOf(
      ['emer-choinnich', 'fionnghuala-choinnich'],
      YMARCHAN_IDS,
      'marriage-ymarchan-peatharlach-choinnich'
    ),
    ...childrenOf(
      ['tiarnog-choinnich', 'sinead-choinnich'],
      MURCHADH_1649_IDS,
      'marriage-murchadh-zarmhnait-choinnich'
    ),
    ...childrenOf(
      ['eilis-choinnich', 'iosogan-choinnich'],
      EMER_IDS,
      'marriage-morwenna-emer-dyngwn'
    ),
    ...childrenOf(
      ['wylie-choinnich', 'glaisne-choinnich'],
      TIARNOG_IDS,
      'marriage-tiarnog-haileigh-choinnich'
    ),
    ...childrenOf(
      ['vailintin-choinnich', 'joriath-choinnich'],
      IOSOGAN_IDS,
      'marriage-iosogan-eibhleann-choinnich'
    ),
    ...childrenOf(
      ['bruide-choinnich', 'sweeney-1725-choinnich'],
      WYLIE_IDS,
      'marriage-siofra-wylie-airt'
    ),
    ...childrenOf(
      ['nuala-choinnich', 'viona-choinnich'],
      VAILINTIN_IDS,
      'marriage-vailintin-quona-choinnich'
    )
  ],
  cadetBranches: [
    marriedAway('married-away-gwefrydd-beibhinn-choinnich', 'marriage-wynfor-beibhinn', 'gwefrydd'),
    manageBranchTarget(marriedAway(
      'married-away-tsaoir-haileigh-choinnich',
      'marriage-haileigh-wighnach-choinnich',
      'tsaoir'
    )),
    marriedAway('married-away-grawn-iseabail-choinnich', 'marriage-mervyn-iseabail', 'grawn'),
    marriedAway('married-away-laidir-glaodhaich-choinnich', 'marriage-glaodhaich-aonghus-choinnich', 'laidir'),
    marriedAway('married-away-ciarog-aodnait-choinnich', 'marriage-morgan-aodnait-ciarog', 'ciarog'),
    marriedAway('married-away-trodach-oideach-choinnich', 'marriage-carthach-oideach', 'trodach'),
    marriedAway('married-away-mhuir-fionnghuala-choinnich', 'marriage-muirgheas-fionnghuala', 'mhuir'),
    marriedAway('married-away-laidir-sinead-choinnich', 'marriage-trianach-sinead-choinnich', 'laidir'),
    marriedAway('married-away-airt-eilis-choinnich', 'marriage-donovan-eilis-airt', 'airt'),
    marriedAway('married-away-eirce-glaisne-choinnich', 'marriage-daithi-glaisne', 'eirce')
  ],
  timeJumps: [
    {
      id: 'gap-sweeney-beibhinn-murchadh-choinnich',
      parentPartnershipId: 'marriage-sweeney-laoiseach-choinnich',
      childIds: ['beibhinn-choinnich', 'murchadh-ancient-choinnich'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen nach Sweeney',
      notes: 'Die Quelle trennt Sweeneys Generation durch eine ausdrückliche Punktreihe von Beibhinn und Murchadh.',
      extensions: {}
    },
    {
      id: 'gap-murchadh-garbhan-generation-choinnich',
      parentPartnershipId: 'marriage-murchadh-maolmhuire-choinnich',
      childIds: ['garbhan-choinnich', 'haileigh-choinnich', 'iseabail-choinnich'],
      years: 0,
      fromYear: '????',
      toYear: '1603',
      label: 'Nicht einzeln überlieferte Generationen bis Garbhán',
      notes: 'Die Quelle setzt eine zweite Punktreihe vor die ab 1603 datierte Generation.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-sweeney-laoiseach-choinnich',
    houseId: CHOINNICH_HOUSE_ID,
    crestSubtitle: 'Laird in Sruthlann · Tir an Comhchuibhis · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-father-choinnich',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Ua’Choinnich (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten und Oberhauptfolge folgen der bereitgestellten Ua-Choinnich-Akte. Sweeney ist der Gründer und stammt von einem namentlich unbekannten Elternpaar ab. Die beiden ausdrücklichen Punktreihen werden als serielle Überlieferungslücken sichtbar erhalten; der Anschluss der ab 1603 belegten Generation folgt zusätzlich der Oberhauptfolge Sweeney–Murchadh–Garbhán. Iseabails einmalige männliche Markierung wird entsprechend ihrer bestehenden Grawn-Gegenakte und ihrer Ehe als Quellenfehler behandelt. Kinder wegverheirateter Linien werden nur in der jeweils fortführenden Zielakte gezeigt; die anonymen Verlobtenfelder der jüngsten Generation werden nicht als Personen erfunden. Sämtliche Bildangaben der alten Ua-Choinnich-Quelle wurden verworfen. Ausschließlich bereits vorhandene kanonische Porträts eindeutig identischer Personen aus bestehenden Stammbäumen werden gespiegelt; alle übrigen Personen verwenden Systemplatzhalter. Wighnach und Quona verweisen nun mit einheitlicher Hauskennung auf die ausgearbeitete Hauptakte Dal T’Saor.',
    sourceRevision: 5,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Laird des Clan Ua’Choinnich',
      headOrder: Object.freeze([
        'sweeney-founder-choinnich',
        'murchadh-ancient-choinnich',
        'garbhan-choinnich',
        'cathalan-choinnich',
        'murchadh-1649-choinnich',
        'tiarnog-choinnich'
      ]),
      publishedOrder: Object.freeze([])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: Object.freeze([]),
      reusedPersonIds: HOUSE_UA_CHOINNICH_REUSED_PORTRAIT_IDS,
      sourceImagesIgnored: true,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir an Comhchuibhis',
    territoryGloss: 'Land der Harmonie',
    historicalStatus: 'active',
    albicRank: 'laird',
    administrativeRole: 'Laird in Sruthlann',
    immediateLiegeHouseId: 'haus-mac-airt',
    immediateLiegeHouseName: 'Clan Mac Airt',
    legacyTitles: ['Haus Choinnich', "Ua'Choinnich"],
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
    registryManagedHouseProfileFields: TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['houseId'],
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: ['house-tsaoir'],
      persons: ['haus-choinnich-gruender', 'haus-choinnich-gruenderin'],
      partnerships: ['marriage-haus-choinnich-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
