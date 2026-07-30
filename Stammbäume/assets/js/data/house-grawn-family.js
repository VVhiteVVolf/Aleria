import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CENYR_COUNTY_HOUSE_PROFILES } from './cenyr-county-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  illewod: 'assets/images/houses/Sonnenküste/haus-illewod.png',
  illysywen: 'assets/images/houses/Rhonwens Tränen/haus-illysywen.png',
  neidr: 'assets/images/houses/Silberinsel/haus-neidr.png',
  pendrag: 'assets/images/houses/Vortigerns Ruh/haus-pendrag.png',
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
});

const GRAWN_HOUSE_ID = 'house-grawn';
const HOUSE_HEAD_IDS = new Set([
  'tristam-grawn',
  'iorwerth-ancient-grawn',
  'dystan-grawn',
  'maelgwyn-grawn',
  'petyr-grawn',
  'hewet-grawn',
  'iorwerth-1685-grawn'
]);
const MAIN_LINE_IDS = new Set(['afon-grawn']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GRAWN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_GRAWN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GRAWN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function bastard(id, name, sex, birth, affairPartnerName) {
  return person(id, name, sex, birth, '', GRAWN_HOUSE_ID, {
    familyRole: 'bastard',
    title: `Bastard aus Mordreds Affäre mit ${affairPartnerName}`
  });
}

function house(id, name, emblem = '', motto = '') {
  return { id, name, motto, emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
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

const FOUNDER_IDS = ['tristam-grawn', 'emer-ui-cruithneacht'];
const IORWERTH_ANCIENT_IDS = ['iorwerth-ancient-grawn', 'aranrhod-aderyn'];
const DYSTAN_IDS = ['dystan-grawn', 'gwennog-ciarog'];
const BEDWYR_IDS = ['bedwyr-grawn', 'maoliosa-tsaoir'];
const MERVYN_IDS = ['mervyn-grawn', 'iseabail-choinnich'];
const MAELGWYN_IDS = ['maelgwyn-grawn', 'rhosyn-aderyn'];
const OSIAN_IDS = ['osian-grawn', 'alys-chiffyddlon'];
const ANEURIN_IDS = ['aneurin-grawn', 'nest-hwyaden'];
const EIFION_IDS = ['efa-gwefrydd', 'eifion-grawn'];
const PETYR_IDS = ['rohella-neidr', 'petyr-grawn'];
const YVAIN_IDS = ['yvain-grawn', 'ceridwen-1652-grawn'];
const CYNFARCH_IDS = ['cynfarch-grawn', 'jinell-gwarchod'];
const WYNDHAM_IDS = ['wyndham-grawn', 'nerys-wivern'];
const RHYDIAN_IDS = ['rhydian-grawn', 'aelwen-penderyn'];
const HEWET_IDS = ['hewet-grawn', 'alwen-earncynne'];
const CLOI_IDS = ['cloi-grawn', 'enid-llwynog'];
const IESTYN_IDS = ['iestyn-grawn', 'glesni-canwyll'];
const OWEN_IDS = ['morwen-illysywen', 'owen-grawn'];
const IORWERTH_1685_IDS = ['iorwerth-1685-grawn', 'tarah-draenog'];
const DYFFRYN_IDS = ['dyffryn-grawn', 'himiko-ashina'];
const BEAVAN_IDS = ['beavan-grawn', 'annegret-skogg'];
const MEIRION_IDS = ['meirion-grawn', 'diahan-fintain'];

export const HOUSE_GRAWN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-grawn',
    title: 'Haus Grawn',
    motto: 'Byddwch yn gyfiawn ac yn wyliadwrus. – Sei gerecht und wachsam.',
    description: 'Die Grafenlinie des Hauses Grawn O\'Glyndraith aus der Grafschaft Ährental, von Tristam bis zur im Jahr 1740 lebenden Generation.',
    emblem: HOUSE_EMBLEMS.grawn,
    houseProfile: CENYR_COUNTY_HOUSE_PROFILES.grawn
  },
  houses: [
    house(GRAWN_HOUSE_ID, 'Haus Grawn', HOUSE_EMBLEMS.grawn, 'Sei gerecht und wachsam.'),
    house('house-ui-cruithneacht', 'Haus Ui Cruithneacht'),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-warthog', 'Haus Warthog'),
    house('house-ciarog', 'Haus Ciarog'),
    house('house-tsaoir', "Haus T'Saoir"),
    house('house-airt', 'Haus Airt'),
    house('house-durachd', 'Haus Dùrachd'),
    house('house-blar', 'Haus Blár'),
    house('house-choinnich', 'Haus Choinnich'),
    house('house-baedd', 'Haus Baedd'),
    house('house-chiffyddlon', 'Haus Chiffyddlon'),
    house('house-hwyaden', 'Haus Hwyaden'),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-neidr', 'Haus Neidr', HOUSE_EMBLEMS.neidr),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-illysywen', 'Haus Illysywen', HOUSE_EMBLEMS.illysywen),
    house('house-gwarchod', 'Haus Gwarchod'),
    house('house-wivern', 'Haus Wivern'),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-penderyn', 'Haus Penderyn'),
    house('house-earncynne', 'Haus Earncynne'),
    house('house-sgwarnog', 'Haus Sgwarnog'),
    house('house-llwynog', 'Haus Llwynog'),
    house('house-canwyll', 'Haus Canwyll'),
    house('house-dienyddiwr', 'Haus Dienyddiwr'),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-draenog', 'Haus Draenog'),
    house('house-ashina', 'Haus Ashina'),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-marchog', 'Haus Marchog'),
    house('house-morcanhuc', 'Haus Morcanhuc'),
    house('house-fintain', 'Haus Fintain'),
    house('house-skogg', 'Haus Skogg')
  ],
  persons: [
    // Gründer und erste überlieferte Generation
    person('tristam-grawn', 'Tristam Grawn', 'male', '????', '????', GRAWN_HOUSE_ID, {
      title: 'Begründer des Hauses Grawn'
    }),
    person('emer-ui-cruithneacht', 'Emer Ui Cruithneacht', 'female', '????', '????', 'house-ui-cruithneacht'),
    person('iorwerth-ancient-grawn', 'Iorwerth Grawn', 'male', '????', '????', GRAWN_HOUSE_ID, {
      title: 'Früher Graf des Ährentals'
    }),
    person('ceridwen-ancient-grawn', 'Ceridwen Grawn', 'female', '????', '????'),
    person('aranrhod-aderyn', 'Aranrhod Aderyn', 'female', '????', '????', 'house-aderyn'),
    person('tamhas-warthog', 'Tàmhas Warthog', 'male', '????', '????', 'house-warthog'),

    // Nach der einzigen ausdrücklich markierten Überlieferungslücke
    person('dystan-grawn', 'Dystan Grawn', 'male', '1602', '1667', GRAWN_HOUSE_ID, {
      title: 'Graf des Ährentals bis 1667'
    }),
    person('bedwyr-grawn', 'Bedwyr Grawn', 'male', '1604', '1675'),
    person('rheanne-grawn', 'Rheanne Grawn', 'female', '1606', '1635'),
    person('niniel-grawn', 'Niniel Grawn', 'female', '1606', '1654'),
    person('vaughan-grawn', 'Vaughan Grawn', 'male', '1609', '1628'),
    person('tatumn-grawn', 'Tatumn Grawn', 'female', '1611', '1685'),
    person('mervyn-grawn', 'Mervyn Grawn', 'male', '1613', '1689'),
    person('gwennog-ciarog', 'Gwennog Ciarog', 'female', '1608', '1673', 'house-ciarog'),
    person('maoliosa-tsaoir', "Maoliosa T'Saoir", 'female', '1606', '1681', 'house-tsaoir'),
    person('coemgen-airt', 'Coemgen Airt', 'male', '1605', '1659', 'house-airt'),
    person('cailte-durachd', 'Cailte Dùrachd', 'male', '1602', '1679', 'house-durachd'),
    person('seamus-blar', 'Seamus Blár', 'male', '1605', '1680', 'house-blar'),
    person('iseabail-choinnich', 'Iseabail Choinnich', 'female', '1614', '1691', 'house-choinnich'),

    // Kinder Dystans, Bedwyrs und Mervyns
    person('maelgwyn-grawn', 'Maelgwyn Grawn', 'male', '1625', '1686', GRAWN_HOUSE_ID, {
      title: 'Graf des Ährentals 1667–1686'
    }),
    person('ysobel-grawn', 'Ysobel Grawn', 'female', '1627', '1663'),
    person('osian-grawn', 'Osian Grawn', 'male', '1624', '1688'),
    person('aneurin-grawn', 'Aneurin Grawn', 'male', '1632', '1695'),
    person('telyn-grawn', 'Telyn Grawn', 'female', '1633', '1707'),
    person('eifion-grawn', 'Eifion Grawn', 'male', '1636', '1699'),
    person('rhosyn-aderyn', 'Rhosyn Aderyn', 'female', '1626', '1659', 'house-aderyn'),
    person('dyfnwal-baedd', 'Dyfnwal Baedd', 'male', '1626', '1681', 'house-baedd'),
    person('alys-chiffyddlon', 'Alys Chiffyddlon', 'female', '1625', '1700', 'house-chiffyddlon'),
    person('nest-hwyaden', 'Nest Hwyaden', 'female', '1632', '1703', 'house-hwyaden'),
    person('ector-1629-pendrag', 'Ector Pendrag', 'male', '1629', '1713', 'house-pendrag'),
    person('efa-gwefrydd', 'Efa Gwefrydd', 'female', '1636', '1691', 'house-gwefrydd', {
      notes: 'Die Grawn-Tabelle nennt ihr Todesjahr nicht; die ausgearbeitete Haus-Gwefrydd-Akte belegt 1691.'
    }),

    // Kinder Maelgwyns, Osians, Aneurins und Eifions
    person('petyr-grawn', 'Petyr Grawn', 'male', '1644', '1702', GRAWN_HOUSE_ID, {
      title: 'Graf des Ährentals 1686–1702'
    }),
    person('igraine-grawn', 'Igraine Grawn', 'female', '1645', '1725'),
    person('yvain-grawn', 'Yvain Grawn', 'male', '1650', '1700'),
    person('glaw-grawn', 'Glaw Grawn', 'female', '1653', '1711'),
    person('cynfarch-grawn', 'Cynfarch Grawn', 'male', '1648', '1703'),
    person('ceridwen-1652-grawn', 'Ceridwen Grawn', 'female', '1652', '1672'),
    person('wyndham-grawn', 'Wyndham Grawn', 'male', '1650', '1720'),
    person('gladys-grawn', 'Gladys Grawn', 'female', '1652', '1734'),
    person('rheinallt-grawn', 'Rheinallt Grawn', 'male', '1654', '1690'),
    person('rhydian-grawn', 'Rhydian Grawn', 'male', '1656', '1720'),
    person('rohella-neidr', 'Rohella Neidr', 'female', '1647', '????', 'house-neidr'),
    person('uther-1643-pendrag', 'Uther Pendrag', 'male', '1643', '1678', 'house-pendrag'),
    person('madoc-illewod', 'Madoc Illewod', 'male', '1649', '1712', 'house-illewod'),
    person('jinell-gwarchod', 'Jinell Gwarchod', 'female', '1650', '1699', 'house-gwarchod'),
    person('nerys-wivern', 'Nerys Wivern', 'female', '1651', '1733', 'house-wivern', {
      notes: 'Die Quellschreibung Wivern wird nicht ohne weiteren Beleg zu Gwyvern oder Wyrm umgedeutet.'
    }),
    person('iolyn-wylan', 'Iolyn Wylan', 'male', '1650', '1720', 'house-wylan'),
    person('aelwen-penderyn', 'Aelwen Penderyn', 'female', '1655', '1729', 'house-penderyn'),

    // Kinder Petyrs, Yvains, Cynfarchs, Wyndhams und Rhydians
    person('hewet-grawn', 'Hewet Grawn', 'male', '1663', '1720', GRAWN_HOUSE_ID, {
      title: 'Graf des Ährentals 1702–1720'
    }),
    person('eleyne-grawn', 'Eleyne Grawn', 'female', '1671', '1734'),
    person('gwendolyn-grawn', 'Gwendolyn Grawn', 'female', '1672', ''),
    person('cloi-grawn', 'Cloi Grawn', 'male', '1668', ''),
    person('iestyn-grawn', 'Iestyn Grawn', 'male', '1668', ''),
    person('arianwyn-grawn', 'Arianwyn Grawn', 'female', '1670', ''),
    person('owen-grawn', 'Owen Grawn', 'male', '1675', '', GRAWN_HOUSE_ID, {
      title: 'Schatzmeister des Hauses Grawn'
    }),
    person('alaw-grawn', 'Alaw Grawn', 'female', '1676', '1720'),
    person('alwen-earncynne', 'Alwen Earncynne', 'female', '1667', '1733', 'house-earncynne'),
    person('fothradh-durachd', 'Fothradh Dùrachd', 'male', '1670', '1720', 'house-durachd'),
    person('morcant-sgwarnog', 'Morcant Sgwarnog', 'male', '1669', '', 'house-sgwarnog'),
    person('enid-llwynog', 'Enid Llwynog', 'female', '1674', '', 'house-llwynog', {
      title: 'Hofdame des Hauses Grawn',
      notes: 'Die Hofämterübersicht führt sie verkürzt als Enid Grawn.'
    }),
    person('glesni-canwyll', 'Glesni Canwyll', 'female', '1669', '', 'house-canwyll', {
      title: 'Hofkaplan des Hauses Grawn',
      notes: 'Die Hofämterübersicht führt sie verkürzt als Glesni Grawn.'
    }),
    person('robyert-dienyddiwr', 'Robyert Dienyddiwr', 'male', '1670', '', 'house-dienyddiwr'),
    person('morwen-illysywen', 'Morwen Illysywen', 'female', '1683', '1720', 'house-illysywen'),
    person('maredudd-draig', 'Maredudd Draig', 'male', '1670', '', 'house-draig'),

    // Generation des gegenwärtigen Grafen und ihre Partner
    person('iorwerth-1685-grawn', 'Iorwerth Grawn', 'male', '1685', '', GRAWN_HOUSE_ID, {
      title: 'Graf des Ährentals seit 1720'
    }),
    person('mawr-grawn', 'Mawr Grawn', 'male', '1687', '1720'),
    person('dyffryn-grawn', 'Dyffryn Grawn', 'male', '1689', ''),
    person('caellach-grawn', 'Caellach Grawn', 'male', '1691', '1720'),
    person('aeron-1693-grawn', 'Aeron Grawn', 'male', '1693', '1720'),
    person('mordred-grawn', 'Mordred Grawn', 'male', '1695', ''),
    person('ceridwen-1700-grawn', 'Ceridwen Grawn', 'female', '1700', ''),
    person('beavan-grawn', 'Beavan Grawn', 'male', '1696', '', GRAWN_HOUSE_ID, {
      title: 'Kommandant der Garde'
    }),
    person('glenys-grawn', 'Glenys Grawn', 'female', '1698', ''),
    person('ywen-grawn', 'Ywen Grawn', 'female', '1700', ''),
    person('elin-grawn', 'Elin Grawn', 'female', '1700', ''),
    person('meirion-grawn', 'Meirion Grawn', 'male', '1700', ''),
    person('tarah-draenog', 'Tarah Draenog', 'female', '1689', '', 'house-draenog'),
    person('himiko-ashina', 'Himiko Ashina', 'female', '1699', '', 'house-ashina'),
    person('glada-grawn-affair', 'Glada', 'female', '1695', '', '', {
      familyRole: 'affair',
      title: 'Affäre Mordreds · Mutter von sechs Bastarden'
    }),
    person('gwenllian-grawn-affair', 'Gwenllian', 'female', '1697', '', '', {
      familyRole: 'affair',
      title: 'Affäre Mordreds · Mutter von zwei Bastarden'
    }),
    person('parzifal-arth', 'Parzifal Arth', 'male', '1694', '', 'house-arth'),
    person('annegret-skogg', 'Annegret Skogg', 'female', '1698', '', 'house-skogg', {
      notes: 'Die Hierarchietabelle nennt auf der Partnerkarte nur „???“; die Stammbaumgrafik belegt Annegret Skogg.'
    }),
    person('llyonell-marchog', 'Llyonell Marchog', 'male', '1692', '', 'house-marchog'),
    person('arthos-morcanhuc', 'Arthos Morcanhuc', 'male', '1705', '', 'house-morcanhuc'),
    person('cei-baedd', 'Cei Baedd', 'male', '1690', '', 'house-baedd'),
    person('diahan-fintain', 'Diahan Fintain', 'female', '1702', '', 'house-fintain'),

    // Jüngste, im Jahr 1740 lebende Generation
    person('afon-grawn', 'Afon Grawn', 'male', '1712', '', GRAWN_HOUSE_ID, {
      title: 'Erbe des Hauses Grawn'
    }),
    person('alaweyn-grawn', 'Alaweyn Grawn', 'female', '1716', ''),
    person('akira-grawn', 'Akira Grawn', 'male', '1722', ''),
    person('akane-grawn', 'Akane Grawn', 'female', '1724', ''),
    bastard('afan-grawn', 'Afan Grawn', 'male', '1713', 'Glada'),
    bastard('tryphena-grawn', 'Tryphena Grawn', 'female', '1715', 'Glada'),
    bastard('elaine-grawn', 'Elaine Grawn', 'female', '1718', 'Glada'),
    bastard('ragnailt-grawn', 'Ragnailt Grawn', 'female', '1719', 'Glada'),
    bastard('arwal-grawn', 'Arwal Grawn', 'male', '1721', 'Glada'),
    bastard('eirwen-grawn', 'Eirwen Grawn', 'female', '1722', 'Glada'),
    bastard('trystan-1715-grawn', 'Trystan Grawn', 'male', '1715', 'Gwenllian'),
    bastard('ysolde-grawn', 'Ysolde Grawn', 'female', '1717', 'Gwenllian'),
    person('kynan-grawn', 'Kynan Grawn', 'male', '1719', ''),
    person('kyndra-grawn', 'Kyndra Grawn', 'female', '1722', ''),
    person('morgan-grawn', 'Morgan Grawn', 'male', '1722', ''),
    person('jac-grawn', 'Jac Grawn', 'male', '1730', ''),
    person('neithon-1718-draig', 'Neithon Draig', 'male', '1718', '', 'house-draig', {
      notes: 'Die Grawn-Tabelle nennt 1719; die bereits kanonische Haus-Draig-Akte belegt 1718.'
    })
  ],
  partnerships: [
    createMarriage('marriage-tristam-emer', ...FOUNDER_IDS),
    createMarriage('marriage-iorwerth-aranrhod', ...IORWERTH_ANCIENT_IDS),
    createMarriage('marriage-ceridwen-tamhas', 'ceridwen-ancient-grawn', 'tamhas-warthog'),
    createMarriage('marriage-dystan-gwennog', ...DYSTAN_IDS),
    createMarriage('marriage-bedwyr-maoliosa', ...BEDWYR_IDS),
    createMarriage('marriage-rheanne-coemgen', 'rheanne-grawn', 'coemgen-airt'),
    createMarriage('marriage-niniel-cailte', 'niniel-grawn', 'cailte-durachd'),
    createMarriage('marriage-tatumn-seamus', 'tatumn-grawn', 'seamus-blar'),
    createMarriage('marriage-mervyn-iseabail', ...MERVYN_IDS),
    createMarriage('marriage-maelgwyn-rhosyn', ...MAELGWYN_IDS),
    createMarriage('marriage-ysobel-dyfnwal', 'ysobel-grawn', 'dyfnwal-baedd'),
    createMarriage('marriage-osian-alys', ...OSIAN_IDS),
    createMarriage('marriage-aneurin-nest', ...ANEURIN_IDS),
    createMarriage('marriage-ector1629-telyn', 'ector-1629-pendrag', 'telyn-grawn'),
    createMarriage('marriage-efa-eifion', ...EIFION_IDS),
    createMarriage('marriage-rohella-petyr', ...PETYR_IDS),
    createMarriage('marriage-uther1643-igraine', 'uther-1643-pendrag', 'igraine-grawn'),
    createMarriage('marriage-yvain-ceridwen', ...YVAIN_IDS),
    createMarriage('marriage-madoc-glaw', 'madoc-illewod', 'glaw-grawn'),
    createMarriage('marriage-cynfarch-jinell', ...CYNFARCH_IDS),
    createMarriage('marriage-wyndham-nerys', ...WYNDHAM_IDS),
    createMarriage('marriage-gladys-iolyn', 'gladys-grawn', 'iolyn-wylan'),
    createMarriage('marriage-rhydian-aelwen', ...RHYDIAN_IDS),
    createMarriage('marriage-hewet-alwen', ...HEWET_IDS),
    createMarriage('marriage-eleyne-fothradh', 'eleyne-grawn', 'fothradh-durachd'),
    createMarriage('marriage-gwendolyn-morcant', 'gwendolyn-grawn', 'morcant-sgwarnog'),
    createMarriage('marriage-cloi-enid', ...CLOI_IDS),
    createMarriage('marriage-iestyn-glesni', ...IESTYN_IDS),
    createMarriage('marriage-arianwyn-robyert', 'arianwyn-grawn', 'robyert-dienyddiwr'),
    createMarriage('marriage-morwen-owen', ...OWEN_IDS),
    createMarriage('marriage-maredudd-alaw', 'maredudd-draig', 'alaw-grawn'),
    createMarriage('marriage-iorwerth-tarah', ...IORWERTH_1685_IDS),
    createMarriage('marriage-dyffryn-himiko', ...DYFFRYN_IDS),
    createMarriage('affair-mordred-glada', 'mordred-grawn', 'glada-grawn-affair', { type: 'affair', status: 'ended' }),
    createMarriage('affair-mordred-gwenllian', 'mordred-grawn', 'gwenllian-grawn-affair', { type: 'affair', status: 'ended' }),
    createMarriage('marriage-ceridwen-parzifal', 'ceridwen-1700-grawn', 'parzifal-arth'),
    createMarriage('marriage-beavan-annegret', ...BEAVAN_IDS, {
      certainty: 'probable',
      notes: 'Der Kinderblock nennt Annegret; ihre Partnerkarte bleibt namenlos.'
    }),
    createMarriage('marriage-glenys-llyonell', 'glenys-grawn', 'llyonell-marchog'),
    createMarriage('marriage-ywen-arthos', 'ywen-grawn', 'arthos-morcanhuc'),
    createMarriage('marriage-elin-cei', 'elin-grawn', 'cei-baedd'),
    createMarriage('marriage-meirion-diahan', ...MEIRION_IDS),
    createMarriage('engagement-neithon-alaweyn', 'neithon-1718-draig', 'alaweyn-grawn', { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['iorwerth-ancient-grawn', 'ceridwen-ancient-grawn'], FOUNDER_IDS, 'marriage-tristam-emer'),
    ...childrenOf(
      ['dystan-grawn', 'bedwyr-grawn', 'rheanne-grawn', 'niniel-grawn', 'vaughan-grawn', 'tatumn-grawn', 'mervyn-grawn'],
      IORWERTH_ANCIENT_IDS,
      'marriage-iorwerth-aranrhod',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Die Quelle markiert nicht überlieferte Zwischengenerationen; Iorwerths Linie ist nur über die Grafenfolge belegt.',
        extensions: { timeJumpId: 'gap-iorwerth-dystan' }
      }
    ),
    ...childrenOf(['maelgwyn-grawn', 'ysobel-grawn'], DYSTAN_IDS, 'marriage-dystan-gwennog'),
    ...childrenOf(['osian-grawn'], BEDWYR_IDS, 'marriage-bedwyr-maoliosa'),
    ...childrenOf(['aneurin-grawn', 'telyn-grawn', 'eifion-grawn'], MERVYN_IDS, 'marriage-mervyn-iseabail'),
    ...childrenOf(['petyr-grawn', 'igraine-grawn', 'yvain-grawn', 'glaw-grawn'], MAELGWYN_IDS, 'marriage-maelgwyn-rhosyn'),
    ...childrenOf(['cynfarch-grawn', 'ceridwen-1652-grawn'], OSIAN_IDS, 'marriage-osian-alys'),
    ...childrenOf(['wyndham-grawn', 'gladys-grawn'], ANEURIN_IDS, 'marriage-aneurin-nest'),
    ...childrenOf(['rheinallt-grawn', 'rhydian-grawn'], EIFION_IDS, 'marriage-efa-eifion'),
    ...childrenOf(['hewet-grawn', 'eleyne-grawn'], PETYR_IDS, 'marriage-rohella-petyr'),
    ...childrenOf(['gwendolyn-grawn'], YVAIN_IDS, 'marriage-yvain-ceridwen'),
    ...childrenOf(['cloi-grawn'], CYNFARCH_IDS, 'marriage-cynfarch-jinell'),
    ...childrenOf(['iestyn-grawn', 'arianwyn-grawn'], WYNDHAM_IDS, 'marriage-wyndham-nerys'),
    ...childrenOf(['owen-grawn', 'alaw-grawn'], RHYDIAN_IDS, 'marriage-rhydian-aelwen'),
    ...childrenOf(
      ['iorwerth-1685-grawn', 'mawr-grawn', 'dyffryn-grawn', 'caellach-grawn', 'aeron-1693-grawn', 'mordred-grawn', 'ceridwen-1700-grawn'],
      HEWET_IDS,
      'marriage-hewet-alwen'
    ),
    ...childrenOf(['beavan-grawn', 'glenys-grawn'], CLOI_IDS, 'marriage-cloi-enid'),
    ...childrenOf(['ywen-grawn', 'elin-grawn'], IESTYN_IDS, 'marriage-iestyn-glesni'),
    ...childrenOf(['meirion-grawn'], OWEN_IDS, 'marriage-morwen-owen'),
    ...childrenOf(['afon-grawn', 'alaweyn-grawn'], IORWERTH_1685_IDS, 'marriage-iorwerth-tarah'),
    ...childrenOf(['akira-grawn', 'akane-grawn'], DYFFRYN_IDS, 'marriage-dyffryn-himiko'),
    ...childrenOf(
      ['afan-grawn', 'tryphena-grawn', 'elaine-grawn', 'ragnailt-grawn', 'arwal-grawn', 'eirwen-grawn'],
      ['mordred-grawn', 'glada-grawn-affair'],
      'affair-mordred-glada',
      { legitimacy: 'illegitimate', notes: 'Bastard aus Mordreds Affäre mit Glada.' }
    ),
    ...childrenOf(
      ['trystan-1715-grawn', 'ysolde-grawn'],
      ['mordred-grawn', 'gwenllian-grawn-affair'],
      'affair-mordred-gwenllian',
      { legitimacy: 'illegitimate', notes: 'Bastard aus Mordreds Affäre mit Gwenllian.' }
    ),
    ...childrenOf(['kynan-grawn', 'kyndra-grawn'], BEAVAN_IDS, 'marriage-beavan-annegret', { certainty: 'probable' }),
    ...childrenOf(['morgan-grawn', 'jac-grawn'], MEIRION_IDS, 'marriage-meirion-diahan')
  ],
  cadetBranches: [
    marriedAway('married-away-warthog-ceridwen', 'Haus Warthog', 'marriage-ceridwen-tamhas', 'house-warthog'),
    marriedAway('married-away-airt-rheanne', 'Haus Airt', 'marriage-rheanne-coemgen', 'house-airt'),
    marriedAway('married-away-durachd-niniel', 'Haus Dùrachd', 'marriage-niniel-cailte', 'house-durachd'),
    marriedAway('married-away-blar-tatumn', 'Haus Blár', 'marriage-tatumn-seamus', 'house-blar'),
    marriedAway('married-away-baedd-ysobel', 'Haus Baedd', 'marriage-ysobel-dyfnwal', 'house-baedd'),
    marriedAway('married-away-pendrag-telyn', 'Haus Pendrag', 'marriage-ector1629-telyn', 'house-pendrag', HOUSE_EMBLEMS.pendrag),
    marriedAway('married-away-pendrag-igraine', 'Haus Pendrag', 'marriage-uther1643-igraine', 'house-pendrag', HOUSE_EMBLEMS.pendrag),
    marriedAway('married-away-illewod-glaw', 'Haus Illewod', 'marriage-madoc-glaw', 'house-illewod', HOUSE_EMBLEMS.illewod),
    marriedAway('married-away-wylan-gladys', 'Haus Wylan', 'marriage-gladys-iolyn', 'house-wylan', HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-durachd-eleyne', 'Haus Dùrachd', 'marriage-eleyne-fothradh', 'house-durachd'),
    marriedAway('married-away-sgwarnog-gwendolyn', 'Haus Sgwarnog', 'marriage-gwendolyn-morcant', 'house-sgwarnog'),
    marriedAway('married-away-dienyddiwr-arianwyn', 'Haus Dienyddiwr', 'marriage-arianwyn-robyert', 'house-dienyddiwr'),
    marriedAway('married-away-draig-alaw', 'Haus Draig', 'marriage-maredudd-alaw', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-arth-ceridwen', 'Haus Arth', 'marriage-ceridwen-parzifal', 'house-arth', HOUSE_EMBLEMS.arth),
    marriedAway('married-away-marchog-glenys', 'Haus Marchog', 'marriage-glenys-llyonell', 'house-marchog'),
    marriedAway('married-away-morcanhuc-ywen', 'Haus Morcanhuc', 'marriage-ywen-arthos', 'house-morcanhuc'),
    marriedAway('married-away-baedd-elin', 'Haus Baedd', 'marriage-elin-cei', 'house-baedd')
  ],
  timeJumps: [
    {
      id: 'gap-iorwerth-dystan',
      parentPartnershipId: 'marriage-iorwerth-aranrhod',
      childIds: ['dystan-grawn', 'bedwyr-grawn', 'rheanne-grawn', 'niniel-grawn', 'vaughan-grawn', 'tatumn-grawn', 'mervyn-grawn'],
      years: 0,
      fromYear: '????',
      toYear: '1602',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Die Grafenfolge führt von Iorwerth zu Dystan; die unmittelbaren Zwischengenerationen sind nicht überliefert.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-tristam-emer',
    houseId: GRAWN_HOUSE_ID,
    crestSubtitle: 'Grafengeschlecht',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tristam-grawn',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten, Portraitzuordnungen und Beziehungen nach der bereitgestellten Haus-Grawn-Tabelle und ihrer Stammbaumgrafik. Die Galeriezeiträume der Grafen sind Amtszeiten und wurden nicht als Geburtsdaten übernommen. Der einzige sichtbare Zeitsprung liegt nach Iorwerth und Aranrhod; die sieben anschließend belegten Geschwister werden wegen der unbekannten Zwischengenerationen nur als wahrscheinliche Linienfortsetzung geführt. Die doppelte Darstellung Yvains und Ceridwens ist eine einzige Ehe. Die Stammbaumgrafik belegt Annegret Skogg, während ihre Partnerkarte in der Hierarchietabelle namenlos bleibt. Nerys bleibt entsprechend der Quelle Wivern. Efas Todesjahr 1691 und Neithons Geburtsjahr 1718 folgen den bereits kanonischen Gegenakten. Mordreds sechs Bastarde mit Glada und seine zwei Bastarde mit Gwenllian sind über getrennte Affären, Elternschaften und sichtbare Kartentitel zugeordnet. Vollständig anonyme Verlobungsvorlagen sowie unverbundene Hofamts-Platzhalter wurden nicht zu Personen erhoben. Die Quelle nennt ausdrücklich keine Kadettenhäuser. Seit Revision 2 liegt Glyndraith verbindlich in Tristams Ebene; ältere direkte Ährental/Glyndraith-Registerpfade werden auf die vierstufige Hierarchie migriert.',
    blankFamily: false,
    sourceRevision: 2,
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
