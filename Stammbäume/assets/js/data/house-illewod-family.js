import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CENYR_COUNTY_HOUSE_PROFILES } from './cenyr-county-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  illewod: 'assets/images/houses/Sonnenküste/haus-illewod.png',
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  grianlaoch: 'assets/images/houses/Sonnenküste/Gersteküste/haus-grianlaoch.png',
  illwath: 'assets/images/houses/Sonnenküste/Löwenberg/haus-illwath.png',
  gallchobhair: 'assets/images/houses/clan-gallchobhair.svg',
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
});

const ILLEWOD_HOUSE_ID = 'house-illewod';

const HOUSE_HEAD_IDS = new Set([
  'bedwyr-illewod',
  'kyvwlch-illewod',
  'mathonwy-illewod',
  'maldwyn-illewod',
  'berwyn-illewod',
  'penryn-illewod',
  'keudawg-illewod',
  'iorwerth-illewod',
  'selwyn-illewod',
  'arthgal-illewod',
  'merwin-illewod'
]);
const MAIN_LINE_IDS = new Set([
  'lynette-illewod',
  'bors-illewod',
  'morwyn-illewod',
  'marwyn-illewod'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = ILLEWOD_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_ILLEWOD_PORTRAITS[id]
      || HOUSE_DRAIG_PORTRAITS[id]
      || HOUSE_PENDRAG_PORTRAITS[id]
      || HOUSE_SAETHWYR_PORTRAITS[id]
      || '',
    familyRole: options.familyRole || (houseId === ILLEWOD_HOUSE_ID ? 'core' : 'married'),
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

function marriedAway(id, name, partnershipId, houseId, emblem = '', options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: options.targetFamilyId || houseId.replace(/^house-/, 'haus-'),
    emblem: options.emblem || emblem,
    crestFrame: options.crestFrame || 'gold',
    subtitle: options.subtitle,
    notes: options.notes || '',
    extensions: options.extensions || {}
  });
}

const FOUNDER_IDS = ['bedwyr-illewod', 'athracht-riordain'];
const KYVWLCH_IDS = ['kyvwlch-illewod', 'gwendolyn-ancient-draig'];
const SABRIA_IDS = ['sabria-illewod', 'gwyron-neidr'];
const MATHONWY_IDS = ['mathonwy-illewod', 'tuilelaith-riordain'];
const MALDWYN_IDS = ['maldwyn-illewod', 'ceridwen-blach'];
const MARWYNNE_IDS = ['marwynne-illewod', 'pebin-fuchs'];
const BERWYN_IDS = ['berwyn-illewod', 'liadan-gallchobhair'];
const YSOLDE_IDS = ['ysolde-illewod', 'rhun-wylan'];
const PENRYN_IDS = ['penryn-illewod', 'nerys-llwynog'];
const FFION_IDS = ['ffion-illewod', 'trevelyan-aderyn'];
const KEUDAWG_IDS = ['keudawg-illewod', 'blodeuyn-pendrag'];
const TALLWCH_IDS = ['tallwch-illewod', 'teleri-llwynog'];
const RHIANU_IDS = ['rhianu-illewod', 'muiredach-eoghhainn'];
const MORGAINE_IDS = ['morgaine-illewod', 'ercwiff-teyrngarch'];
const IORWERTH_IDS = ['iorwerth-illewod', 'lynfa-pysgod'];
const KARYS_IDS = ['karys-illewod', 'griff-neidr'];
const GARETH_IDS = ['gareth-illewod', 'telyn-wylan'];
const GWALES_IDS = ['gwales-illewod', 'isobel-penderyn'];
const LOWRI_IDS = ['lowri-illewod', 'gawain-blach'];
const SELWYN_IDS = ['selwyn-illewod', 'maygan-draig'];
const EVAINE_IDS = ['evaine-illewod', 'shan-tylluan'];
const MADOC_IDS = ['madoc-illewod', 'glaw-grawn'];
const EHANGWEN_IDS = ['ehangwen-illewod', 'rhondda-llwynog'];
const BRANNOC_IDS = ['brannoc-illewod', 'rhondda-dieniddiwr'];
const ARTHGAL_IDS = ['arthgal-illewod', 'land-ceirwyn'];
const CARWYN_IDS = ['carwyn-illewod', 'dafydd-blach'];
const MIFAWI_IDS = ['mifawi-illewod', 'catel-aderyn'];
const MEICAL_IDS = ['meical-illewod', 'menna-brithyll'];
const CALED_IDS = ['caled-illewod', 'siriol-draenog'];
const MERWIN_IDS = ['merwin-illewod', 'alana-gallchobhair'];
const MAIRWEN_IDS = ['mairwen-illewod', 'cynfor-pysgod'];
const MARARED_IDS = ['marared-illewod', 'selsye-wylan'];
const HEDD_IDS = ['hedd-illewod', 'torri-coedwig'];
const KERRIS_IDS = ['kerris-illewod', 'ieuan-llwynog'];
const ANALI_IDS = ['anali-illewod', 'tynan-gallchobhair'];
const SAYRES_IDS = ['sayres-illewod', 'gwawr-saethwyr'];
const ELEN_IDS = ['elen-illewod', 'gaenor-teyrngarch'];

export const HOUSE_ILLEWOD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-illewod',
    title: 'Haus Illewod',
    motto: '„Gemeinsam stehen wir, vereint bleiben wir.“',
    description: 'Die Grafenlinie des Hauses Illewod O\'Aberon von Bedwyr bis zur Gegenwart im Jahr 1740.',
    emblem: HOUSE_EMBLEMS.illewod,
    houseProfile: CENYR_COUNTY_HOUSE_PROFILES.illewod
  },
  houses: [
    house(ILLEWOD_HOUSE_ID, 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-draig', 'Haus Draig'),
    house('house-riordain', 'Haus Ríordáin'),
    house('house-neidr', 'Haus Neidr'),
    house('house-blach', 'Haus Blach'),
    house('house-gallchobhair', 'Clan Gallchobhair', HOUSE_EMBLEMS.gallchobhair),
    house('house-grianlaoch', 'Haus Grianlaoch', HOUSE_EMBLEMS.grianlaoch),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-pendrag', 'Haus Pendrag'),
    house('house-llwynog', 'Haus Llwynog'),
    house('house-illwath', 'Haus Illwath', HOUSE_EMBLEMS.illwath),
    house('house-eoghhainn', 'Haus Eóghhainn'),
    house('house-teyrngarch', 'Haus Teyrngarch'),
    house('house-pysgod', 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-penderyn', 'Haus Penderyn'),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-dienyddiwr', 'Haus Dienyddiwr'),
    house('house-ceirwyn', 'Haus Ceirwyn'),
    house('house-brithyll', 'Haus Brithyll'),
    house('house-draenog', 'Haus Draenog'),
    house('house-coedwig', 'Haus Coedwig'),
    house('house-saethwyr', 'Haus Saethwyr'),
    house('house-tylluan', 'Haus Tylluan')
  ],
  persons: [
    // Gründerpaar
    person('bedwyr-illewod', 'Bedwyr', 'male', '????', '????', ILLEWOD_HOUSE_ID, { title: 'Gründer des Hauses Illewod' }),
    person('athracht-riordain', 'Athracht Ríordáin', 'female', '????', '????', 'house-riordain'),

    // 2. Generation – Kinder Bedwyrs & Athrachts
    person('kyvwlch-illewod', 'Kyvwlch Illewod', 'male', '????', '????'),
    person('sabria-illewod', 'Sabria Illewod', 'female', '????', '????'),
    person('gwendolyn-ancient-draig', 'Gwendolyn', 'female', '????', '????', 'house-draig'),
    person('gwyron-neidr', 'Gwyron Neidr', 'male', '????', '????', 'house-neidr'),

    // 3. Generation (nach der ersten Überlieferungslücke) – Sohn Kyvwlchs & Gwendolyns
    person('mathonwy-illewod', 'Mathonwy Illewod', 'male', '????', '????'),
    person('tuilelaith-riordain', 'Tuilelaith Ríordáin', 'female', '????', '????', 'house-riordain'),

    // 4. Generation (nach der zweiten Lücke) – Kinder Mathonwys & Tuilelaiths
    person('maldwyn-illewod', 'Maldwyn Illewod', 'male', '????', '????'),
    person('marwynne-illewod', 'Marwynne Illewod', 'female', '????', '????'),
    person('ceridwen-blach', 'Ceridwen Blach', 'female', '????', '????', 'house-blach'),
    person('pebin-fuchs', 'Pebin der Fuchs', 'male', '????', '????', ''),

    // 5. Generation (nach der dritten Lücke) – Kinder Maldwyns & Ceridwens
    person('berwyn-illewod', 'Berwyn Illewod', 'male', '1117', '1181'),
    person('ysolde-illewod', 'Ysolde Illewod', 'female', '1121', '1200'),
    person('liadan-gallchobhair', 'Liadan Gallchobhair', 'female', '1120', '1206', 'house-gallchobhair'),
    person('rhun-wylan', 'Rhun Wylan', 'male', '1119', '1172', 'house-wylan'),

    // 6. Generation (nach der vierten Lücke) – Kinder Berwyns & Liadans
    person('penryn-illewod', 'Penryn Illewod', 'male', '1248', '1281'),
    person('ffion-illewod', 'Ffion Illewod', 'female', '1250', '1320'),
    person('nerys-llwynog', 'Nerys Llwynog', 'female', '1250', '1315', 'house-llwynog'),
    person('trevelyan-aderyn', 'Trevelyan Aderyn', 'male', '1250', '1285', 'house-aderyn'),

    // 7. Generation (nach der großen fünften Lücke) – Kinder Penryns & Nerys'
    person('keudawg-illewod', 'Keudawg Illewod', 'male', '1580', '1647'),
    person('tallwch-illewod', 'Tallwch Illewod', 'male', '1586', '1669'),
    person('rhianu-illewod', 'Rhianu Illewod', 'female', '1590', '1659'),
    person('morgaine-illewod', 'Morgaine Illewod', 'female', '1594', '1649'),
    person('blodeuyn-pendrag', 'Blodeuyn Pendrag', 'female', '1577', '1670', 'house-pendrag'),
    person('teleri-llwynog', 'Teleri Llwynog', 'female', '1589', '1671', 'house-llwynog'),
    person('muiredach-eoghhainn', 'Muiredach Eóghhainn', 'male', '1590', '1684', 'house-eoghhainn'),
    person('ercwiff-teyrngarch', 'Ercwiff Teyrngarch', 'male', '1590', '1641', 'house-teyrngarch'),

    // 8. Generation – Kinder Keudawgs & Blodeuyns
    person('iorwerth-illewod', 'Iorwerth Illewod', 'male', '1614', '1679'),
    person('karys-illewod', 'Karys Illewod', 'female', '1628', '1681'),
    person('gareth-illewod', 'Gareth Illewod', 'male', '1632', '1701'),
    person('gwales-illewod', 'Gwales Illewod', 'male', '1619', '1684'),
    person('lowri-illewod', 'Lowri Illewod', 'female', '1623', '1668'),
    person('lynfa-pysgod', 'Lynfa Pysgod', 'female', '1623', '1679', 'house-pysgod'),
    person('griff-neidr', 'Griff Neidr', 'male', '1625', '1699', 'house-neidr'),
    person('telyn-wylan', 'Telyn Wylan', 'female', '1633', '1697', 'house-wylan'),
    person('isobel-penderyn', 'Isobel Penderyn', 'female', '1625', '1703', 'house-penderyn'),
    person('gawain-blach', 'Gawain Blach', 'male', '1619', '1640', 'house-blach'),

    // 9. Generation
    person('selwyn-illewod', 'Selwyn Illewod', 'male', '1643', '1707'),
    person('evaine-illewod', 'Evaine Illewod', 'female', '1650', '1715'),
    person('olwyna-illewod', 'Olwyna Illewod', 'female', '1647', ''),
    person('madoc-illewod', 'Madoc Illewod', 'male', '1649', '1712'),
    person('ehangwen-illewod', 'Ehangwen Illewod', 'male', '1652', '1720'),
    person('brannoc-illewod', 'Brannoc Illewod', 'male', '1652', '1720'),
    person('maygan-draig', 'Maygan', 'female', '1645', '1711', 'house-draig'),
    person('shan-tylluan', 'Shan Tylluan', 'male', '1649', '1723', 'house-tylluan'),
    person('glaw-grawn', 'Glaw Grawn', 'female', '1653', '1711', 'house-grawn'),
    person('rhondda-llwynog', 'Rhondda Llwynog', 'female', '1654', '1734', 'house-llwynog'),
    person('rhondda-dieniddiwr', 'Rhondda Dienyddiwr', 'female', '1655', '1715', 'house-dienyddiwr', {
      extensions: { registryManagedFields: ['name', 'houseId'] }
    }),

    // 10. Generation – Kinder Selwyns & Maygans / Madocs & Glaws / Brannocs & Rhonddas
    person('arthgal-illewod', 'Arthgal Illewod', 'male', '1664', '1720'),
    person('carwyn-illewod', 'Carwyn Illewod', 'female', '1670', ''),
    person('mifawi-illewod', 'Mifawi Illewod', 'female', '1667', '1720'),
    person('meical-illewod', 'Meical Illewod', 'male', '1674', ''),
    person('caled-illewod', 'Caled Illewod', 'male', '1675', ''),
    person('land-ceirwyn', 'Land Ceirwyn', 'female', '1669', '', 'house-ceirwyn'),
    person('dafydd-blach', 'Dafydd Blach', 'male', '1671', '', 'house-blach'),
    person('catel-aderyn', 'Catel Aderyn', 'male', '1661', '1720', 'house-aderyn'),
    person('menna-brithyll', 'Menna Brithyll', 'female', '1675', '1715', 'house-brithyll'),
    person('siriol-draenog', 'Siriol Draenog', 'female', '1678', '', 'house-draenog'),

    // 11. Generation
    person('merwin-illewod', 'Merwin Illewod', 'male', '1694', '', ILLEWOD_HOUSE_ID, { title: 'Regierender Graf' }),
    person('mairwen-illewod', 'Mairwen Illewod', 'female', '1700', ''),
    person('marared-illewod', 'Marared Illewod', 'male', '1698', ''),
    person('hedd-illewod', 'Hedd Illewod', 'male', '1691', ''),
    person('kerris-illewod', 'Kerris Illewod', 'female', '1695', ''),
    person('anali-illewod', 'Anali Illewod', 'female', '1697', '', ILLEWOD_HOUSE_ID, {
      worldPersonId: 'person:haus-illewod:anali-illewod',
      title: 'Wegverheiratet an Haus Grianlaoch',
      tags: ['Wegverheiratet'],
      notes: 'Anali heiratete Tynan Gallchobhair und begründete mit ihm das junge Ritterhaus Grianlaoch in Gallchofaen.',
      extensions: {
        registryManagedFields: ['worldPersonId', 'title', 'tags', 'notes']
      }
    }),
    person('sayres-illewod', 'Sayres Illewod', 'male', '1692', ''),
    person('elen-illewod', 'Elen Illewod', 'female', '1698', ''),
    person('alana-gallchobhair', 'Alana Gallchobhair', 'female', '1697', '', 'house-gallchobhair'),
    person('cynfor-pysgod', 'Cynfor Pysgod', 'male', '1698', '', 'house-pysgod'),
    person('selsye-wylan', 'Selsye Wylan', 'female', '1700', '', 'house-wylan'),
    person('torri-coedwig', 'Torri Coedwig', 'female', '1698', '', 'house-coedwig'),
    person('ieuan-llwynog', 'Ieuan Llwynog', 'male', '1694', '', 'house-llwynog'),
    person('tynan-gallchobhair', 'Tynan Gallchobhair', 'male', '1696', '', 'house-grianlaoch', {
      worldPersonId: 'person:haus-gallchobhair:tynan-gallchobhair',
      title: 'Gründer und Ritterherr des Hauses Grianlaoch',
      notes: 'Tynan kam mit Gallchobhair-Kriegern und Siedlern aus Dun Laog nach Aberon und begründete in Gallchofaen Haus Grianlaoch.',
      extensions: {
        registryManagedFields: ['worldPersonId', 'title', 'houseId', 'notes']
      }
    }),
    person('gwawr-saethwyr', 'Gwawr Saethwyr', 'female', '1699', '', 'house-saethwyr'),
    person('gaenor-teyrngarch', 'Gaenor Teyrngarch', 'male', '1694', '', 'house-teyrngarch'),

    // 12. Generation – jüngste Generation, 1740 noch lebend
    person('lynette-illewod', 'Lynette Illewod', 'female', '1721', ''),
    person('bors-illewod', 'Bors Illewod', 'male', '1725', ''),
    person('morwyn-illewod', 'Morwyn Illewod', 'female', '1729', ''),
    person('marwyn-illewod', 'Marwyn Illewod', 'male', '1732', ''),
    person('lewelin-illewod', 'Lewelin Illewod', 'male', '1718', ''),
    person('zirilla-illewod', 'Zirilla Illewod', 'female', '1720', ''),
    person('nowy-illewod', 'Nowy Illewod', 'male', '1720', ''),
    person('dymphna-gallchobhair', 'Dymphna Grianlaoch', 'female', '1724', '', 'house-grianlaoch', {
      worldPersonId: 'person:haus-gallchobhair:dymphna-gallchobhair',
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Graf Merwins',
      notes: 'Leibliche Tochter Tynans und Analis sowie dynastischer Spross des Hauses Grianlaoch; zur Festigung der Verbindung als Mündel an Graf Merwin Illewod gegeben.',
      extensions: {
        registryManagedFields: ['worldPersonId', 'name', 'title', 'houseId', 'familyRole', 'notes']
      }
    }),
    person('deaglan-gallchobhair', 'Deaglan Grianlaoch', 'male', '1724', '', 'house-grianlaoch', {
      worldPersonId: 'person:haus-gallchobhair:deaglan-gallchobhair',
      familyRole: 'ward',
      title: 'Erbe des Hauses Grianlaoch · Aufgenommenes Mündel Graf Merwins',
      notes: 'Leiblicher Sohn Tynans und Analis sowie Erbe des Hauses Grianlaoch; gemeinsam mit Dymphna als Mündel an Graf Merwin Illewod gegeben.',
      extensions: {
        registryManagedFields: ['worldPersonId', 'name', 'title', 'houseId', 'familyRole', 'notes']
      }
    }),
    person('collen-illewod', 'Collen Illewod', 'female', '1733', ''),
    person('celyn-illewod', 'Célyn Illewod', 'male', '1733', '')
  ],
  partnerships: [
    createMarriage('marriage-bedwyr-athracht', ...FOUNDER_IDS),
    createMarriage('marriage-gwendolyn-kyvwlch', 'gwendolyn-ancient-draig', 'kyvwlch-illewod'),
    createMarriage('marriage-sabria-gwyron', ...SABRIA_IDS),
    createMarriage('marriage-mathonwy-tuilelaith', ...MATHONWY_IDS),
    createMarriage('marriage-maldwyn-ceridwen', ...MALDWYN_IDS),
    createMarriage('marriage-marwynne-pebin', ...MARWYNNE_IDS),
    createMarriage('marriage-berwyn-liadan', ...BERWYN_IDS),
    createMarriage('marriage-ysolde-rhun', ...YSOLDE_IDS),
    createMarriage('marriage-penryn-nerys', ...PENRYN_IDS),
    createMarriage('marriage-ffion-trevelyan', ...FFION_IDS),
    createMarriage('marriage-blodeuyn-keudawg', ...KEUDAWG_IDS),
    createMarriage('marriage-tallwch-teleri', ...TALLWCH_IDS),
    createMarriage('marriage-rhianu-muiredach', ...RHIANU_IDS),
    createMarriage('marriage-morgaine-ercwiff', ...MORGAINE_IDS),
    createMarriage('marriage-iorwerth-lynfa', ...IORWERTH_IDS),
    createMarriage('marriage-karys-griff', ...KARYS_IDS),
    createMarriage('marriage-gareth-telyn', ...GARETH_IDS),
    createMarriage('marriage-gwales-isobel', ...GWALES_IDS),
    createMarriage('marriage-lowri-gawain', ...LOWRI_IDS),
    createMarriage('marriage-maygan-selwyn', 'maygan-draig', 'selwyn-illewod'),
    createMarriage('marriage-evaine-shan', ...EVAINE_IDS),
    createMarriage('marriage-madoc-glaw', ...MADOC_IDS),
    createMarriage('marriage-ehangwen-rhondda', ...EHANGWEN_IDS),
    createMarriage('marriage-brannoc-rhondda', ...BRANNOC_IDS),
    createMarriage('marriage-arthgal-land', ...ARTHGAL_IDS),
    createMarriage('marriage-carwyn-dafydd', ...CARWYN_IDS),
    createMarriage('marriage-mifawi-catel', ...MIFAWI_IDS),
    createMarriage('marriage-meical-menna', ...MEICAL_IDS),
    createMarriage('marriage-caled-siriol', ...CALED_IDS),
    createMarriage('marriage-merwin-alana', ...MERWIN_IDS),
    createMarriage('marriage-mairwen-cynfor', ...MAIRWEN_IDS),
    createMarriage('marriage-marared-selsye', ...MARARED_IDS),
    createMarriage('marriage-hedd-torri', ...HEDD_IDS),
    createMarriage('marriage-kerris-ieuan', ...KERRIS_IDS),
    createMarriage('marriage-anali-tynan', ...ANALI_IDS),
    createMarriage('marriage-gwawr-sayres', 'gwawr-saethwyr', 'sayres-illewod'),
    createMarriage('marriage-elen-gaenor', ...ELEN_IDS)
  ],
  parentages: [
    ...childrenOf(['kyvwlch-illewod', 'sabria-illewod'], FOUNDER_IDS, 'marriage-bedwyr-athracht'),
    ...childrenOf(['mathonwy-illewod'], KYVWLCH_IDS, 'marriage-gwendolyn-kyvwlch'),
    ...childrenOf(['maldwyn-illewod', 'marwynne-illewod'], MATHONWY_IDS, 'marriage-mathonwy-tuilelaith'),
    ...childrenOf(['berwyn-illewod', 'ysolde-illewod'], MALDWYN_IDS, 'marriage-maldwyn-ceridwen'),
    ...childrenOf(['penryn-illewod', 'ffion-illewod'], BERWYN_IDS, 'marriage-berwyn-liadan'),
    ...childrenOf(['keudawg-illewod', 'tallwch-illewod', 'rhianu-illewod', 'morgaine-illewod'], PENRYN_IDS, 'marriage-penryn-nerys'),
    ...childrenOf(['iorwerth-illewod', 'karys-illewod', 'gareth-illewod', 'gwales-illewod', 'lowri-illewod'], KEUDAWG_IDS, 'marriage-blodeuyn-keudawg'),
    ...childrenOf(['selwyn-illewod', 'evaine-illewod', 'olwyna-illewod', 'madoc-illewod'], IORWERTH_IDS, 'marriage-iorwerth-lynfa'),
    ...childrenOf(['ehangwen-illewod'], GARETH_IDS, 'marriage-gareth-telyn'),
    ...childrenOf(['brannoc-illewod'], GWALES_IDS, 'marriage-gwales-isobel'),
    ...childrenOf(['arthgal-illewod', 'carwyn-illewod', 'mifawi-illewod'], SELWYN_IDS, 'marriage-maygan-selwyn'),
    ...childrenOf(['meical-illewod'], MADOC_IDS, 'marriage-madoc-glaw'),
    ...childrenOf(['caled-illewod'], BRANNOC_IDS, 'marriage-brannoc-rhondda'),
    ...childrenOf(['merwin-illewod', 'mairwen-illewod', 'marared-illewod'], ARTHGAL_IDS, 'marriage-arthgal-land'),
    ...childrenOf(['hedd-illewod', 'kerris-illewod', 'anali-illewod'], MEICAL_IDS, 'marriage-meical-menna'),
    ...childrenOf(['sayres-illewod', 'elen-illewod'], CALED_IDS, 'marriage-caled-siriol'),
    ...childrenOf(['lynette-illewod', 'bors-illewod', 'morwyn-illewod', 'marwyn-illewod'], MERWIN_IDS, 'marriage-merwin-alana'),
    ...childrenOf(['lewelin-illewod', 'zirilla-illewod'], MARARED_IDS, 'marriage-marared-selsye'),
    ...childrenOf(['nowy-illewod'], HEDD_IDS, 'marriage-hedd-torri'),
    ...childrenOf(['dymphna-gallchobhair', 'deaglan-gallchobhair'], ['merwin-illewod'], '', {
      type: 'foster', legitimacy: 'unknown', notes: 'Leibliche Kinder Analis & Tynans, als Mündel an Merwin gegeben.'
    }),
    ...childrenOf(['dymphna-gallchobhair', 'deaglan-gallchobhair'], ANALI_IDS, 'marriage-anali-tynan', {
      idPrefix: 'parentage-biological',
      notes: 'Leibliche Kinder Analis Illewod und Tynan Gallchobhairs.'
    }),
    ...childrenOf(['collen-illewod', 'celyn-illewod'], SAYRES_IDS, 'marriage-gwawr-sayres')
  ],
  cadetBranches: [
    marriedAway('married-away-neidr-sabria', 'Haus Neidr', 'marriage-sabria-gwyron', 'house-neidr'),
    marriedAway('married-away-wylan-ysolde', 'Haus Wylan', 'marriage-ysolde-rhun', 'house-wylan'),
    marriedAway('married-away-aderyn-ffion', 'Haus Aderyn', 'marriage-ffion-trevelyan', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-eoghhainn-rhianu', 'Haus Eóghhainn', 'marriage-rhianu-muiredach', 'house-eoghhainn'),
    marriedAway('married-away-teyrngarch-morgaine', 'Haus Teyrngarch', 'marriage-morgaine-ercwiff', 'house-teyrngarch'),
    marriedAway('married-away-neidr-karys', 'Haus Neidr', 'marriage-karys-griff', 'house-neidr'),
    marriedAway('married-away-blach-lowri', 'Haus Blach', 'marriage-lowri-gawain', 'house-blach'),
    marriedAway('married-away-tylluan-evaine', 'Haus Tylluan', 'marriage-evaine-shan', 'house-tylluan'),
    createCadetHouseBranch({
      id: 'cadet-illwath-ehangwen',
      name: 'Haus Illwath',
      parentPartnershipId: 'marriage-ehangwen-rhondda',
      houseId: 'house-illwath',
      targetFamilyId: 'haus-illwath',
      emblem: HOUSE_EMBLEMS.illwath,
      subtitle: 'Begründetes Kadettenhaus',
      notes: 'Ehangwen Illewod und Rhondda Llwynog begründen Haus Illwath; ihre Nachkommen werden ausschließlich in der Illwath-Akte fortgeführt.'
    }),
    marriedAway('married-away-blach-carwyn', 'Haus Blach', 'marriage-carwyn-dafydd', 'house-blach'),
    marriedAway('married-away-aderyn-mifawi', 'Haus Aderyn', 'marriage-mifawi-catel', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-pysgod-mairwen', 'Haus Pysgod', 'marriage-mairwen-cynfor', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-llwynog-kerris', 'Haus Llwynog', 'marriage-kerris-ieuan', 'house-llwynog'),
    marriedAway(
      'married-away-gallchobhair-anali',
      'Haus Grianlaoch',
      'marriage-anali-tynan',
      'house-grianlaoch',
      HOUSE_EMBLEMS.grianlaoch,
      {
        crestFrame: 'silver',
        subtitle: 'Wegverheiratet an Haus Grianlaoch',
        notes: 'Anali Illewod und Tynan Gallchobhair begründeten das junge Ritterhaus Grianlaoch. Dymphna und Deaglan werden dort als ihre leiblichen Kinder und hier zusätzlich als Mündel Graf Merwins geführt.',
        extensions: {
          registryManagedFields: [
            'name',
            'subtitle',
            'houseId',
            'targetFamilyId',
            'emblem',
            'crestFrame',
            'notes'
          ]
        }
      }
    )
  ],
  timeJumps: [
    {
      id: 'gap-kyvwlch-mathonwy', parentPartnershipId: 'marriage-gwendolyn-kyvwlch', childIds: ['mathonwy-illewod'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: '', extensions: {}
    },
    {
      id: 'gap-mathonwy-maldwyn', parentPartnershipId: 'marriage-mathonwy-tuilelaith', childIds: ['maldwyn-illewod', 'marwynne-illewod'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: '', extensions: {}
    },
    {
      id: 'gap-maldwyn-berwyn', parentPartnershipId: 'marriage-maldwyn-ceridwen', childIds: ['berwyn-illewod', 'ysolde-illewod'],
      years: 0, fromYear: '????', toYear: '1117', label: 'Die datierte Überlieferung setzt 1117 wieder ein', notes: '', extensions: {}
    },
    {
      id: 'gap-berwyn-penryn', parentPartnershipId: 'marriage-berwyn-liadan', childIds: ['penryn-illewod', 'ffion-illewod'],
      years: 0, fromYear: '1181', toYear: '1248', label: 'Nicht einzeln überlieferte Generationen', notes: '', extensions: {}
    },
    {
      id: 'gap-penryn-keudawg', parentPartnershipId: 'marriage-penryn-nerys', childIds: ['keudawg-illewod', 'tallwch-illewod', 'rhianu-illewod', 'morgaine-illewod'],
      years: 0, fromYear: '1320', toYear: '1580', label: 'Die große Überlieferungslücke', notes: 'Erst mit Keudawg (geb. 1580) setzt die datierte Überlieferung wieder ein.', extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-bedwyr-athracht',
    houseId: ILLEWOD_HOUSE_ID,
    crestSubtitle: 'Grafengeschlecht',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'bedwyr-illewod',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceRevision: 4,
    registryManagedRecordFields: ['folderPath'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'regionEmblems'
    ]
  }
});
