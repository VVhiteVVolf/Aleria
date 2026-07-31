import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CENYR_COUNTY_HOUSE_PROFILES } from './cenyr-county-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  creyr: 'assets/images/houses/Weidebucht/haus-creyr.png',
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  gwialen: GRAUE_WEITE_HOUSE_EMBLEMS.gwialen,
  illewod: 'assets/images/houses/Sonnenküste/haus-illewod.png',
  neidr: 'assets/images/houses/Silberinsel/haus-neidr.png',
  pendrag: 'assets/images/houses/Vortigerns Ruh/haus-pendrag.png',
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png',
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
});

const WYLAN_HOUSE_ID = 'house-wylan';

const HOUSE_HEAD_IDS = new Set([
  'melwas-wylan',
  'breandan-wylan',
  'merlion-wylan',
  'rheidwn-wylan',
  'rhun-wylan',
  'eiddyl-wylan',
  'vorath-wylan',
  'macsen-wylan',
  'trachmyr-wylan',
  'gendry-wylan',
  'hewet-wylan',
  'bedivere-wylan'
]);

const HEIR_IDS = new Set(['berwyn-wylan']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = WYLAN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_WYLAN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === WYLAN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

function gapChildren(childIds, parentIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, parentIds, partnershipId, {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Zwischen den benannten Generationen sind in der Quelle nicht einzeln überlieferte Vorfahren markiert.',
    extensions: { timeJumpId }
  });
}

function marriedAway(id, name, partnershipId, houseId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem
  });
}

const MELWAS_IDS = ['melwas-wylan', 'sadbbh-trisceil'];
const BREANDAN_IDS = ['breandan-wylan', 'oilean-fhaire'];
const MEREDITH_IDS = ['meredith-wylan', 'aodhluan-roth'];
const MERLION_IDS = ['merlion-wylan', 'tadhgin-trisceil'];
const LINESSA_IDS = ['linessa-wylan', 'caradoc-ancient-pysgod'];
const RHEIDWN_IDS = ['rheidwn-wylan', 'maygan-elder-neidr'];
const RHODHRI_IDS = ['rhodhri-wylan', 'tanwen-hwyaden'];
const RHUN_IDS = ['rhun-wylan', 'ysolde-illewod'];
const SIANWEN_IDS = ['sianwen-wylan', 'talfryn-aderyn'];
const EIDDYL_IDS = ['eiddyl-wylan', 'braith-marwolaeth'];
const BETTRYS_IDS = ['bettrys-wylan', 'daffyd-neidr'];
const VORATH_IDS = ['vorath-wylan', 'iesin-pendrag'];
const WRNACH_IDS = ['wrnach-wylan', 'dylis-gwefrydd'];
const RHIANON_IDS = ['rhianon-wylan', 'gearoid-cein'];
const TELERI_IDS = ['teleri-wylan', 'afal-coedwig'];
const CARU_IDS = ['caru-wylan', 'gwayne-gaeth'];
const MACSEN_IDS = ['macsen-wylan', 'delwen-hwyaden'];
const MEINIR_IDS = ['meinir-wylan', 'tudwal-asyn'];
const BRAITH_IDS = ['braith-wylan', 'cadwaladr-pysgod'];
const PENLLYN_IDS = ['penllyn-wylan', 'ariana-draenog'];
const SIRIOL_IDS = ['siriol-wylan', 'madog-tylwyth'];
const SULWEN_IDS = ['sulwen-wylan', 'ercwiff-teyrngrach'];
const TRACHMYR_IDS = ['trachmyr-wylan', 'ariene-creyr'];
const TELYN_IDS = ['telyn-wylan', 'gareth-illewod'];
const BLAWD_IDS = ['blawd-wylan', 'caled-tiwna'];
const TYREKE_IDS = ['tyreke-wylan', 'caraf-tir-addawol'];
const SIANI_IDS = ['siani-wylan', 'rhydderch-llwynog'];
const CELYN_IDS = ['celyn-wylan', 'gwindor-crefydoll'];
const GENDRY_IDS = ['gendry-wylan', 'arryn-blodyn'];
const ENID_IDS = ['enid-wylan', 'hopcyn-saith'];
const MALVINA_IDS = ['malvina-wylan', 'ifan-blach'];
const IOLYN_IDS = ['iolyn-wylan', 'gladys-grawn'];
const GLYNIS_IDS = ['glynis-wylan', 'uther-gwialen'];
const EVAINE_IDS = ['evaine-wylan', 'mervyn-dienyddiwr'];
const HEWET_IDS = ['hewet-wylan', 'generis-draig'];
const MALDWYN_IDS = ['maldwyn-wylan', 'liadan-cetchathach'];
const MERVYNE_ARAWN_IDS = ['mervyne-wylan', 'arawn-wylan'];
const CARALYN_IDS = ['caralyn-wylan', 'gwynham-tir-addawol'];
const MALT_IDS = ['malt-wylan', 'anarawd-llwynog'];
const DERYN_IDS = ['deryn-wylan', 'kimball-crefydoll'];
const CARIAD_IDS = ['cariad-wylan', 'lugh-teyrngrach'];
const MORGANA_IDS = ['morgana-wylan', 'yvain-neidr'];
const BEDIVERE_IDS = ['bedivere-wylan', 'caitrin-pysgod'];
const SELYSE_IDS = ['selsye-wylan', 'marared-illewod'];
const MAG_IDS = ['mag-wylan', 'trevelyan-dinefwr'];
const EKMELEDDIN_IDS = ['ekmeleddin-wylan', 'faylinn-ailella'];
const OLWYN_IDS = ['olwyn-wylan', 'dyl-canwyll'];
const NEALA_IDS = ['neala-wylan', 'shan-wyrm'];
const LIAM_IDS = ['liam-wylan', 'eirlys-dyngwn'];
const ANONA_IDS = ['anona-wylan', 'alun-hwyaden'];
const NONA_IDS = ['nona-wylan', 'evan-creyr'];

export const HOUSE_WYLAN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-wylan',
    title: "Haus Wylan O'Cerrigarth",
    motto: 'Gwylwyr yn y cysgod.',
    description: 'Das wohlhabende Grafengeschlecht von Cerrigarth in der Weidebucht, geprägt durch Seefahrt, Viehzucht, eine starke Flotte und politische Wachsamkeit.',
    emblem: HOUSE_EMBLEMS.wylan,
    houseProfile: CENYR_COUNTY_HOUSE_PROFILES.wylan
  },
  houses: [
    house(WYLAN_HOUSE_ID, 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-trisceil', 'Haus Trisceil'),
    house('house-fhaire', 'Haus Fhàire'),
    house('house-roth', 'Haus Roth'),
    house('house-pysgod', 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-neidr', 'Haus Neidr', HOUSE_EMBLEMS.neidr),
    house('house-hwyaden', 'Haus Hwyaden'),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-marwolaeth', 'Haus Marwolaeth'),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-cein', 'Haus Cein'),
    house('house-coedwig', 'Haus Coedwig'),
    house('house-gaeth', 'Haus Gaeth'),
    house('house-asyn', 'Haus Asyn'),
    house('house-draenog', 'Haus Draenog'),
    house('house-tylwyth', 'Haus Tylwyth'),
    house('house-teyrngarch', 'Haus Teyrngarch'),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr),
    house('house-tiwna', 'Haus Tiwna'),
    house('house-tir-addawol', 'Haus Tir Addawol'),
    house('house-llwynog', 'Haus Llwynog'),
    house('house-crefyddol', 'Haus Crefyddol'),
    house('house-blodyn', 'Haus Blodyn'),
    house('house-saith', 'Haus Saith'),
    house('house-blach', 'Haus Blach'),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-gwialen', 'Haus Gwialen', HOUSE_EMBLEMS.gwialen),
    house('house-dienyddiwr', 'Haus Dienyddiwr'),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-cetchathach', 'Haus Cétchathach'),
    house('house-dinefwr', 'Haus Dinefwr'),
    house('house-ailella', 'Haus Ailella'),
    house('house-canwyll', 'Haus Canwyll'),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-dyngwn', 'Haus Dyngwn')
  ],
  persons: [
    person('melwas-wylan', 'Melwas Wylan', 'male', '????', '????', WYLAN_HOUSE_ID, { title: 'Gründer des Hauses Wylan' }),
    person('sadbbh-trisceil', 'Sadbbh Trisceil', 'female', '????', '????', 'house-trisceil'),
    person('breandan-wylan', 'Breandan Wylan', 'male', '????', '????'),
    person('meredith-wylan', 'Meredith Wylan', 'female', '????', '????'),
    person('oilean-fhaire', 'Oileán Fhàire', 'female', '????', '????', 'house-fhaire'),
    person('aodhluan-roth', 'Aodhluán Roth', 'male', '????', '????', 'house-roth'),

    person('merlion-wylan', 'Merlion Wylan', 'male', '????', '????'),
    person('linessa-wylan', 'Linessa Wylan', 'female', '????', '????'),
    person('tadhgin-trisceil', 'Tadhgín Trisceil', 'female', '????', '????', 'house-trisceil'),
    person('caradoc-ancient-pysgod', 'Caradoc Pysgod', 'male', '????', '????', 'house-pysgod'),

    person('rheidwn-wylan', 'Rheidwn Wylan', 'male', '????', '????'),
    person('rhodhri-wylan', 'Rhodhri Wylan', 'male', '????', '????'),
    person('maygan-elder-neidr', 'Maygan Neidr', 'female', '????', '????', 'house-neidr'),
    person('tanwen-hwyaden', 'Tanwen Hwyaden', 'female', '????', '????', 'house-hwyaden'),

    person('rhun-wylan', 'Rhun Wylan', 'male', '1119', '1182', WYLAN_HOUSE_ID, {
      notes: 'Die Wylan-Quelle nennt 1182; die Illewod-Gegenakte überliefert abweichend 1172.'
    }),
    person('sianwen-wylan', 'Sianwen Wylan', 'female', '1122', '1203'),
    person('ysolde-illewod', 'Ysolde Illewod', 'female', '1121', '1200', 'house-illewod'),
    person('talfryn-aderyn', 'Talfryn Aderyn', 'male', '1119', '1163', 'house-aderyn'),

    person('eiddyl-wylan', 'Eiddyl Wylan', 'male', '1556', '1617'),
    person('bettrys-wylan', 'Bettrys Wylan', 'female', '1558', '????'),
    person('dolena-wylan', 'Dolena Wylan', 'female', '1558', '', WYLAN_HOUSE_ID, { status: 'unknown' }),
    person('braith-marwolaeth', 'Braith Marwolaeth', 'female', '1557', '1671', 'house-marwolaeth'),
    person('daffyd-neidr', 'Daffyd Neidr', 'male', '1555', '????', 'house-neidr'),

    person('vorath-wylan', 'Vorath Wylan', 'male', '1575', '1645'),
    person('wrnach-wylan', 'Wrnach Wylan', 'male', '1577', '1653', WYLAN_HOUSE_ID, {
      title: 'Regent Cerrigarths während Trachmyrs Minderjährigkeit'
    }),
    person('rhianon-wylan', 'Rhianon Wylan', 'female', '1580', '1689'),
    person('teleri-wylan', 'Teleri Wylan', 'female', '1590', '1650'),
    person('myf-wylan', 'Myf Wylan', 'female', '1586', '1607'),
    person('caru-wylan', 'Caru Wylan', 'female', '1592', '1637'),
    person('iesin-pendrag', 'Iesin Pendrag', 'male', '1575', '1656', 'house-pendrag'),
    person('dylis-gwefrydd', 'Dylis Gwefrydd', 'female', '1580', '1655', 'house-gwefrydd'),
    person('gearoid-cein', 'Gearoid Cein', 'male', '1581', '1666', 'house-cein'),
    person('afal-coedwig', 'Afal Coedwig', 'male', '1588', '1672', 'house-coedwig'),
    person('gwayne-gaeth', 'Gwayne Gaeth', 'male', '1586', '1658', 'house-gaeth'),

    person('macsen-wylan', 'Macsen Wylan', 'male', '1605', '1646'),
    person('meinir-wylan', 'Meinir Wylan', 'female', '1608', '1639'),
    person('braith-wylan', 'Braith Wylan', 'female', '1612', '1674'),
    person('penllyn-wylan', 'Penllyn Wylan', 'male', '1610', '1675'),
    person('siriol-wylan', 'Siriol Wylan', 'female', '1612', '1656'),
    person('sulwen-wylan', 'Sulwen Wylan', 'female', '1614', '1659'),
    person('delwen-hwyaden', 'Delwen Hwyaden', 'female', '1611', '1634', 'house-hwyaden'),
    person('tudwal-asyn', 'Tudwal Asyn', 'male', '1607', '1639', 'house-asyn'),
    person('cadwaladr-pysgod', 'Cadwaladr Pysgod', 'male', '1614', '1684', 'house-pysgod'),
    person('ariana-draenog', 'Ariana Draenog', 'female', '1610', '1677', 'house-draenog'),
    person('madog-tylwyth', 'Madog Tylwyth', 'male', '1608', '????', 'house-tylwyth'),
    person('ercwiff-teyrngrach', 'Ercwiff Teyrngrach', 'male', '1609', '????', 'house-teyrngarch'),

    person('trachmyr-wylan', 'Trachmyr Wylan', 'male', '1631', '1702'),
    person('telyn-wylan', 'Telyn Wylan', 'female', '1633', '1697'),
    person('blawd-wylan', 'Blawd Wylan', 'female', '1633', '1681'),
    person('tyreke-wylan', 'Tyreke Wylan', 'male', '1629', '1700'),
    person('siani-wylan', 'Siani Wylan', 'female', '1631', '1704'),
    person('celyn-wylan', 'Célyn Wylan', 'female', '1633', '1712'),
    person('ariene-creyr', 'Ariene Créyr', 'female', '1635', '1720', 'house-creyr'),
    person('gareth-illewod', 'Gareth Illewod', 'male', '1632', '1701', 'house-illewod'),
    person('caled-tiwna', 'Caled Tiwna', 'male', '1634', '1669', 'house-tiwna'),
    person('caraf-tir-addawol', 'Caraf Tir Addawol', 'female', '1632', '1707', 'house-tir-addawol'),
    person('rhydderch-llwynog', 'Rhydderch Llwynog', 'male', '1624', '1696', 'house-llwynog', {
      notes: 'Das Todesjahr ist in der Quelle mit einem Fragezeichen versehen.'
    }),
    person('gwindor-crefydoll', 'Gwindor Crefyddol', 'male', '1631', '1673', 'house-crefyddol', {
      extensions: { registryManagedFields: ['name'] }
    }),

    person('gendry-wylan', 'Gendry Wylan', 'male', '1653', '1716'),
    person('enid-wylan', 'Enid Wylan', 'female', '1655', '1729', WYLAN_HOUSE_ID, {
      extensions: { registryManagedFields: ['death'] }
    }),
    person('malvina-wylan', 'Malvina Wylan', 'female', '1657', '1700'),
    person('iolyn-wylan', 'Iolyn Wylan', 'male', '1650', '1720'),
    person('glynis-wylan', 'Glynis Wylan', 'female', '1660', '1715'),
    person('evaine-wylan', 'Evaine Wylan', 'female', '1662', '1707'),
    person('arryn-blodyn', 'Arryn Blodyn', 'female', '1655', '1711', 'house-blodyn'),
    person('hopcyn-saith', 'Hopcyn Saith', 'male', '1652', '1713', 'house-saith'),
    person('ifan-blach', 'Ifan Blach', 'male', '1654', '1696', 'house-blach'),
    person('gladys-grawn', 'Gladys Grawn', 'female', '1652', '1734', 'house-grawn'),
    person('uther-gwialen', 'Uther Gwialen', 'male', '1661', '1720', 'house-gwialen'),
    person('mervyn-dienyddiwr', 'Mervyn Dienyddiwr', 'male', '1659', '1713', 'house-dienyddiwr'),

    person('hewet-wylan', 'Hewet Wylan', 'male', '1670', '1720'),
    person('maldwyn-wylan', 'Maldwyn Wylan', 'male', '1672', ''),
    person('mervyne-wylan', 'Mervyne Wylan', 'female', '1674', '', WYLAN_HOUSE_ID, {
      extensions: { chartRepeatForPartnershipIds: ['marriage-mervyne-arawn'] }
    }),
    person('caralyn-wylan', 'Caralyn Wylan', 'female', '1676', ''),
    person('malt-wylan', 'Malt Wylan', 'female', '1678', ''),
    person('deryn-wylan', 'Deryn Wylan', 'female', '1678', ''),
    person('arawn-wylan', 'Arawn Wylan', 'male', '1674', '', WYLAN_HOUSE_ID, {
      extensions: { chartPartnerMirrorForPartnershipIds: ['marriage-mervyne-arawn'] }
    }),
    person('cariad-wylan', 'Cariad Wylan', 'female', '1676', ''),
    person('bryn-wylan', 'Bryn Wylan', 'male', '1685', '1720'),
    person('generis-draig', 'Generis Draig', 'female', '1674', '', 'house-draig'),
    person('liadan-cetchathach', 'Liadan Cétchathach', 'female', '1674', '', 'house-cetchathach'),
    person('gwynham-tir-addawol', 'Gwynham Tir Addawol', 'male', '1670', '', 'house-tir-addawol'),
    person('anarawd-llwynog', 'Anarawd Llwynog', 'male', '1671', '', 'house-llwynog'),
    person('kimball-crefydoll', 'Kimball Crefyddol', 'male', '1673', '', 'house-crefyddol', {
      extensions: { registryManagedFields: ['name'] }
    }),
    person('lugh-teyrngrach', 'Lugh Teyrngrach', 'male', '1669', '', 'house-teyrngarch'),

    person('morgana-wylan', 'Morgana Wylan', 'female', '1694', ''),
    person('bedivere-wylan', 'Bedivere Wylan', 'male', '1698', '', WYLAN_HOUSE_ID, { title: 'Graf von Cerrigarth seit 1720' }),
    person('selsye-wylan', 'Selyse Wylan', 'female', '1700', '', WYLAN_HOUSE_ID, {
      notes: 'Die Wylan-Quelle schreibt Selyse; die Illewod-Gegenakte führt die Variante Selsye.'
    }),
    person('mag-wylan', 'Mag Wylan', 'female', '1690', ''),
    person('ekmeleddin-wylan', 'Ekmeleddin Wylan', 'male', '1698', ''),
    person('olwyn-wylan', 'Olwyn Wylan', 'female', '1700', ''),
    person('neala-wylan', 'Neala Wylan', 'female', '1693', ''),
    person('liam-wylan', 'Liam Wylan', 'male', '1696', ''),
    person('majella-wylan', 'Majella Wylan', 'female', '1698', '????'),
    person('yvain-neidr', 'Yvain Neidr', 'male', '1693', '', 'house-neidr'),
    person('caitrin-pysgod', 'Caitrin Pysgod', 'female', '1704', '', 'house-pysgod'),
    person('marared-illewod', 'Marared Illewod', 'male', '1698', '', 'house-illewod'),
    person('trevelyan-dinefwr', 'Trevelyan Dinefwr', 'male', '1690', '', 'house-dinefwr'),
    person('faylinn-ailella', 'Faylinn Ailella', 'female', '1696', '', 'house-ailella'),
    person('dyl-canwyll', 'Dyl Canwyll', 'male', '1700', '', 'house-canwyll'),
    person('shan-wyrm', 'Shan Wyrm', 'male', '1692', '', 'house-wyrm'),
    person('eirlys-dyngwn', 'Eirlys Dyngwn', 'female', '1694', '', 'house-dyngwn'),

    person('berwyn-wylan', 'Berwyn Wylan', 'male', '1722', ''),
    person('bedwyr-wylan', 'Bedwyr Wylan', 'male', '1722', ''),
    person('anona-wylan', 'Anona Wylan', 'female', '1724', ''),
    person('nona-wylan', 'Nona Wylan', 'female', '1724', ''),
    person('arryn-1732-wylan', 'Arryn Wylan', 'male', '1732', ''),
    person('wynne-wylan', 'Wynne Wylan', 'female', '1722', ''),
    person('vaughan-wylan', 'Vaughan Wylan', 'male', '1724', ''),
    person('evie-wylan', 'Evie Wylan', 'female', '1734', ''),
    person('tomi-wylan', 'Tomi Wylan', 'male', '1719', ''),
    person('evangelin-wylan', 'Evangelin Wylan', 'female', '1723', ''),
    person('lowri-wylan', 'Lowri Wylan', 'female', '1734', ''),
    person('alun-hwyaden', 'Alun Hwyaden', 'male', '1722', '', 'house-hwyaden'),
    person('evan-creyr', 'Evan Créyr', 'male', '1722', '', 'house-creyr')
  ],
  partnerships: [
    createMarriage('marriage-melwas-sadbbh', ...MELWAS_IDS),
    createMarriage('marriage-breandan-oilean', ...BREANDAN_IDS),
    createMarriage('marriage-meredith-aodhluan', ...MEREDITH_IDS),
    createMarriage('marriage-merlion-tadhgin', ...MERLION_IDS),
    createMarriage('marriage-caradoc-linessa', ...LINESSA_IDS),
    createMarriage('marriage-maygan-rheidwn', ...RHEIDWN_IDS),
    createMarriage('marriage-rhodhri-tanwen', ...RHODHRI_IDS),
    createMarriage('marriage-ysolde-rhun', ...RHUN_IDS),
    createMarriage('marriage-talfryn-sianwen', ...SIANWEN_IDS),
    createMarriage('marriage-eiddyl-braith', ...EIDDYL_IDS),
    createMarriage('marriage-daffyd-bettrys', ...BETTRYS_IDS),
    createMarriage('marriage-iesin-vorath', ...VORATH_IDS),
    createMarriage('marriage-dylis-wrnach', ...WRNACH_IDS),
    createMarriage('marriage-rhianon-gearoid', ...RHIANON_IDS),
    createMarriage('marriage-teleri-afal', ...TELERI_IDS),
    createMarriage('marriage-caru-gwayne', ...CARU_IDS),
    createMarriage('marriage-macsen-delwen', ...MACSEN_IDS),
    createMarriage('marriage-meinir-tudwal', ...MEINIR_IDS),
    createMarriage('marriage-cadwaladr-braith', ...BRAITH_IDS),
    createMarriage('marriage-penllyn-ariana', ...PENLLYN_IDS),
    createMarriage('marriage-siriol-madog', ...SIRIOL_IDS),
    createMarriage('marriage-sulwen-ercwiff', ...SULWEN_IDS),
    createMarriage('marriage-trachmyr-ariene', ...TRACHMYR_IDS),
    createMarriage('marriage-gareth-telyn', ...TELYN_IDS),
    createMarriage('marriage-blawd-caled', ...BLAWD_IDS),
    createMarriage('marriage-tyreke-caraf', ...TYREKE_IDS),
    createMarriage('marriage-siani-rhydderch', ...SIANI_IDS),
    createMarriage('marriage-celyn-gwindor', ...CELYN_IDS),
    createMarriage('marriage-gendry-arryn', ...GENDRY_IDS),
    createMarriage('marriage-enid-hopcyn', ...ENID_IDS),
    createMarriage('marriage-malvina-ifan', ...MALVINA_IDS),
    createMarriage('marriage-gladys-iolyn', ...IOLYN_IDS),
    createMarriage('marriage-glynis-uther', ...GLYNIS_IDS),
    createMarriage('marriage-evaine-mervyn', ...EVAINE_IDS),
    createMarriage('marriage-generis-hewet', ...HEWET_IDS),
    createMarriage('marriage-maldwyn-liadan', ...MALDWYN_IDS),
    createMarriage('marriage-mervyne-arawn', ...MERVYNE_ARAWN_IDS),
    createMarriage('marriage-caralyn-gwynham', ...CARALYN_IDS),
    createMarriage('marriage-malt-anarawd', ...MALT_IDS),
    createMarriage('marriage-deryn-kimball', ...DERYN_IDS),
    createMarriage('marriage-cariad-lugh', ...CARIAD_IDS),
    createMarriage('marriage-yvain-morgana', ...MORGANA_IDS),
    createMarriage('marriage-caitrin-bedivere', ...BEDIVERE_IDS),
    createMarriage('marriage-marared-selsye', ...SELYSE_IDS),
    createMarriage('marriage-mag-trevelyan', ...MAG_IDS),
    createMarriage('marriage-ekmeleddin-faylinn', ...EKMELEDDIN_IDS),
    createMarriage('marriage-olwyn-dyl', ...OLWYN_IDS),
    createMarriage('marriage-shan-neala', ...NEALA_IDS),
    createMarriage('marriage-liam-eirlys', ...LIAM_IDS),
    createMarriage('engagement-anona-alun', ...ANONA_IDS, { type: 'engagement' }),
    createMarriage('engagement-nona-evan', ...NONA_IDS, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['breandan-wylan', 'meredith-wylan'], MELWAS_IDS, 'marriage-melwas-sadbbh'),
    ...gapChildren(['merlion-wylan', 'linessa-wylan'], BREANDAN_IDS, 'marriage-breandan-oilean', 'gap-breandan-merlion'),
    ...gapChildren(['rheidwn-wylan', 'rhodhri-wylan'], MERLION_IDS, 'marriage-merlion-tadhgin', 'gap-merlion-rheidwn'),
    ...gapChildren(['rhun-wylan', 'sianwen-wylan'], RHEIDWN_IDS, 'marriage-maygan-rheidwn', 'gap-rheidwn-rhun'),
    ...gapChildren(['eiddyl-wylan', 'bettrys-wylan', 'dolena-wylan'], RHUN_IDS, 'marriage-ysolde-rhun', 'gap-rhun-eiddyl'),
    ...childrenOf(['vorath-wylan', 'wrnach-wylan', 'rhianon-wylan', 'teleri-wylan', 'myf-wylan', 'caru-wylan'], EIDDYL_IDS, 'marriage-eiddyl-braith'),
    ...childrenOf(['macsen-wylan', 'meinir-wylan', 'braith-wylan'], VORATH_IDS, 'marriage-iesin-vorath'),
    ...childrenOf(['penllyn-wylan', 'siriol-wylan', 'sulwen-wylan'], WRNACH_IDS, 'marriage-dylis-wrnach'),
    ...childrenOf(['trachmyr-wylan', 'telyn-wylan', 'blawd-wylan'], MACSEN_IDS, 'marriage-macsen-delwen'),
    ...childrenOf(['tyreke-wylan', 'siani-wylan', 'celyn-wylan'], PENLLYN_IDS, 'marriage-penllyn-ariana'),
    ...childrenOf(['gendry-wylan', 'enid-wylan', 'malvina-wylan'], TRACHMYR_IDS, 'marriage-trachmyr-ariene'),
    ...childrenOf(['iolyn-wylan', 'glynis-wylan', 'evaine-wylan'], TYREKE_IDS, 'marriage-tyreke-caraf'),
    ...childrenOf(['hewet-wylan', 'maldwyn-wylan', 'mervyne-wylan', 'caralyn-wylan', 'malt-wylan', 'deryn-wylan'], GENDRY_IDS, 'marriage-gendry-arryn'),
    ...childrenOf(['arawn-wylan', 'cariad-wylan', 'bryn-wylan'], IOLYN_IDS, 'marriage-gladys-iolyn'),
    ...childrenOf(['morgana-wylan', 'bedivere-wylan', 'selsye-wylan'], HEWET_IDS, 'marriage-generis-hewet'),
    ...childrenOf(['mag-wylan', 'ekmeleddin-wylan', 'olwyn-wylan'], MALDWYN_IDS, 'marriage-maldwyn-liadan'),
    ...childrenOf(['neala-wylan', 'liam-wylan', 'majella-wylan'], MERVYNE_ARAWN_IDS, 'marriage-mervyne-arawn'),
    ...childrenOf(['berwyn-wylan', 'bedwyr-wylan', 'anona-wylan', 'nona-wylan', 'arryn-1732-wylan'], BEDIVERE_IDS, 'marriage-caitrin-bedivere'),
    ...childrenOf(['wynne-wylan', 'vaughan-wylan', 'evie-wylan'], EKMELEDDIN_IDS, 'marriage-ekmeleddin-faylinn'),
    ...childrenOf(['tomi-wylan', 'evangelin-wylan', 'lowri-wylan'], LIAM_IDS, 'marriage-liam-eirlys')
  ],
  cadetBranches: [
    createCadetHouseBranch({
      id: 'cadet-creyr-rhodhri',
      name: 'Haus Créyr',
      parentPartnershipId: 'marriage-rhodhri-tanwen',
      houseId: 'house-creyr',
      targetFamilyId: 'haus-creyr',
      emblem: HOUSE_EMBLEMS.creyr,
      notes: 'Rhodhri Wylan und Tanwen Hwyaden begründen Haus Créyr; der Knoten hängt direkt unter ihrem Paar.'
    }),
    marriedAway('married-away-roth-meredith', 'Haus Roth', 'marriage-meredith-aodhluan', 'house-roth'),
    marriedAway('married-away-pysgod-linessa', 'Haus Pysgod', 'marriage-caradoc-linessa', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-aderyn-sianwen', 'Haus Aderyn', 'marriage-talfryn-sianwen', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-neidr-bettrys', 'Haus Neidr', 'marriage-daffyd-bettrys', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-cein-rhianon', 'Haus Cein', 'marriage-rhianon-gearoid', 'house-cein'),
    marriedAway('married-away-coedwig-teleri', 'Haus Coedwig', 'marriage-teleri-afal', 'house-coedwig'),
    marriedAway('married-away-gaeth-caru', 'Haus Gaeth', 'marriage-caru-gwayne', 'house-gaeth'),
    marriedAway('married-away-asyn-meinir', 'Haus Asyn', 'marriage-meinir-tudwal', 'house-asyn'),
    marriedAway('married-away-pysgod-braith', 'Haus Pysgod', 'marriage-cadwaladr-braith', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-tylwyth-siriol', 'Haus Tylwyth', 'marriage-siriol-madog', 'house-tylwyth'),
    marriedAway('married-away-teyrngarch-sulwen', 'Haus Teyrngarch', 'marriage-sulwen-ercwiff', 'house-teyrngarch'),
    marriedAway('married-away-illewod-telyn', 'Haus Illewod', 'marriage-gareth-telyn', 'house-illewod', HOUSE_EMBLEMS.illewod),
    marriedAway('married-away-tiwna-blawd', 'Haus Tiwna', 'marriage-blawd-caled', 'house-tiwna'),
    marriedAway('married-away-llwynog-siani', 'Haus Llwynog', 'marriage-siani-rhydderch', 'house-llwynog'),
    marriedAway('married-away-crefyddol-celyn', 'Haus Crefyddol', 'marriage-celyn-gwindor', 'house-crefyddol'),
    marriedAway('married-away-saith-enid', 'Haus Saith', 'marriage-enid-hopcyn', 'house-saith'),
    marriedAway('married-away-blach-malvina', 'Haus Blach', 'marriage-malvina-ifan', 'house-blach'),
    marriedAway('married-away-gwialen-glynis', 'Haus Gwialen', 'marriage-glynis-uther', 'house-gwialen', HOUSE_EMBLEMS.gwialen),
    marriedAway('married-away-dienyddiwr-evaine', 'Haus Dienyddiwr', 'marriage-evaine-mervyn', 'house-dienyddiwr'),
    marriedAway('married-away-tir-addawol-caralyn', 'Haus Tir Addawol', 'marriage-caralyn-gwynham', 'house-tir-addawol'),
    marriedAway('married-away-llwynog-malt', 'Haus Llwynog', 'marriage-malt-anarawd', 'house-llwynog'),
    marriedAway('married-away-crefyddol-deryn', 'Haus Crefyddol', 'marriage-deryn-kimball', 'house-crefyddol'),
    marriedAway('married-away-teyrngarch-cariad', 'Haus Teyrngarch', 'marriage-cariad-lugh', 'house-teyrngarch'),
    marriedAway('married-away-neidr-morgana', 'Haus Neidr', 'marriage-yvain-morgana', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-illewod-selyse', 'Haus Illewod', 'marriage-marared-selsye', 'house-illewod', HOUSE_EMBLEMS.illewod),
    marriedAway('married-away-dinefwr-mag', 'Haus Dinefwr', 'marriage-mag-trevelyan', 'house-dinefwr'),
    marriedAway('married-away-canwyll-olwyn', 'Haus Canwyll', 'marriage-olwyn-dyl', 'house-canwyll'),
    marriedAway('married-away-wyrm-neala', 'Haus Wyrm', 'marriage-shan-neala', 'house-wyrm', HOUSE_EMBLEMS.wyrm)
  ],
  timeJumps: [
    {
      id: 'gap-breandan-merlion',
      parentPartnershipId: 'marriage-breandan-oilean',
      childIds: ['merlion-wylan', 'linessa-wylan'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Erster absoluter serieller Generationentrenner der Wylan-Hauptlinie.',
      extensions: {}
    },
    {
      id: 'gap-merlion-rheidwn',
      parentPartnershipId: 'marriage-merlion-tadhgin',
      childIds: ['rheidwn-wylan', 'rhodhri-wylan'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Zweiter absoluter serieller Generationentrenner der Wylan-Hauptlinie.',
      extensions: {}
    },
    {
      id: 'gap-rheidwn-rhun',
      parentPartnershipId: 'marriage-maygan-rheidwn',
      childIds: ['rhun-wylan', 'sianwen-wylan'],
      years: 0,
      fromYear: '????',
      toYear: '1119',
      label: 'Die datierte Überlieferung setzt 1119 wieder ein',
      notes: 'Dritter absoluter serieller Generationentrenner der Wylan-Hauptlinie.',
      extensions: {}
    },
    {
      id: 'gap-rhun-eiddyl',
      parentPartnershipId: 'marriage-ysolde-rhun',
      childIds: ['eiddyl-wylan', 'bettrys-wylan', 'dolena-wylan'],
      years: 0,
      fromYear: '1203',
      toYear: '1556',
      label: 'Nicht einzeln überlieferte Generationen 1203–1556',
      notes: 'Vierter absoluter serieller Generationentrenner der Wylan-Hauptlinie.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-melwas-sadbbh',
    houseId: WYLAN_HOUSE_ID,
    crestSubtitle: 'Grafengeschlecht',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'melwas-wylan',
    orientation: 'vertical',
    ancestorDepth: 28,
    descendantDepth: 28,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Hausdaten und Portraitquellen folgen der bereitgestellten Wylan-Hausseite und ihrer Hierarchietabelle. Der verbindliche Name ist nach Caption und Übersicht Haus Wylan O’Cerrigarth; die erzählerischen Varianten O’Dewet und O’Penrith werden nicht als weitere Familien angelegt. Die vier Auslassungszeichen werden ausschließlich als strikt serielle Zeitsprünge unter Breandan/Oileán, Merlion/Tadhgín, Rheidwn/Maygan und Rhun/Ysolde abgebildet. Rhuns Todesjahr steht hier quellgetreu als 1182; die Illewod-Gegenakte nennt abweichend 1172. Selyse wird mit der stabilen Gegenakten-ID selsye-wylan geführt. Sämtliche verheirateten Wylan-Frauen, deren Linie in ein anderes Haus führt, besitzen direkt an ihrer Ehe einen Wegverheiratet-Knoten; die beiden benannten Verlobungen Anona/Alun und Nona/Evan erzeugen gemäß Regel noch keinen solchen Knoten. Rhodhri Wylan und Tanwen Hwyaden begründen Haus Créyr; der Kadettenhausknoten hängt direkt unter ihrem Paar. Arawn bleibt als Sohn von Iolyn Wylan und Gladys Grawn im fortgesetzten Zweig: Dort steht seine Ehe mit Mervyne und dort hängen ihre Kinder. Mervyne bleibt zugleich als Tochter von Gendry Wylan und Arryn Blodyn sichtbar; an ihrem Herkunftszweig erscheint eine reine Arawn-Partnerkarte ohne erneute Nachkommenlinie. Wiederholte generische Frauen- und Männer-Silhouetten sowie die neun namenlosen Verlobtenfelder werden nicht als individuelle Personen oder Portraits importiert. Seit Revision 4 liegt Cerrigarth verbindlich in der Baronie Melwas Au; ältere direkte Weidebucht/Cerrigarth-Registerpfade werden auf die vierstufige Hierarchie migriert. Revision 5 übernimmt Enid Wylans in der Saith-Gegenquelle ausdrücklich belegtes Todesjahr 1729. Revision 6 vereinheitlicht die sichtbaren Namen Gwindor und Kimball zur kanonischen Schreibweise Crefyddol, ohne ihre stabilen Gegenakten-IDs zu ändern. Revision 7 ergänzt das belegte Gwialen-Wappen an Glynis Wylans Zielhausknoten.',
    chartViewport: { initialPosition: 'focus', initialScale: 0.55 },
    blankFamily: false,
    sourceRevision: 7,
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'secondarySeats',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath']
  }
});
