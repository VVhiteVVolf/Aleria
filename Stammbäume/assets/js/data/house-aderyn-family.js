import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  TAL_DER_MILANE_HOUSE_EMBLEMS,
  TAL_DER_MILANE_HOUSE_PROFILES
} from './tal-der-milane-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: TAL_DER_MILANE_HOUSE_EMBLEMS.aderyn,
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  gwyvern: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
  gaeth: TAL_DER_MILANE_HOUSE_EMBLEMS.gaeth,
  gormard: TAL_DER_MILANE_HOUSE_EMBLEMS.gormard,
  hebog: TAL_DER_MILANE_HOUSE_EMBLEMS.hebog,
  ilyuncu: TAL_DER_MILANE_HOUSE_EMBLEMS.ilyuncu,
  illewod: 'assets/images/houses/Sonnenküste/haus-illewod.png',
  illysywen: 'assets/images/houses/Rhonwens Tränen/haus-illysywen.png',
  neidr: 'assets/images/houses/Silberinsel/haus-neidr.png',
  mwyalchen: TAL_DER_MILANE_HOUSE_EMBLEMS.mwyalchen,
  pendrag: 'assets/images/houses/Vortigerns Ruh/haus-pendrag.png',
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  eryr: TAL_DER_MILANE_HOUSE_EMBLEMS.eryr,
  tylluan: TAL_DER_MILANE_HOUSE_EMBLEMS.tylluan,
  'ua-fionnghal': TAL_DER_MILANE_HOUSE_EMBLEMS['ua-fionnghal'],
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
});

const ADERYN_HOUSE_ID = 'house-aderyn';
const HOUSE_HEAD_IDS = new Set([
  'yvain-aderyn',
  'owain-aderyn',
  'brinthan-aderyn',
  'kimball-aderyn',
  'talfryn-aderyn',
  'ywen-aderyn',
  'trevelyan-aderyn',
  'gwalchgwyn-aderyn',
  'nodawl-aderyn',
  'llwydawg-aderyn',
  'anarawd-aderyn',
  'dungarth-aderyn',
  'catel-aderyn',
  'gareth-aderyn'
]);
const MAIN_LINE_IDS = new Set(['catwan-aderyn', 'cwgon-aderyn', 'arthen-aderyn']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = ADERYN_HOUSE_ID, options = {}) {
  const portrait = HOUSE_ADERYN_PORTRAITS[id] || '';
  const registryManagedFields = new Set(options.extensions?.registryManagedFields || []);
  if (portrait) registryManagedFields.add('portrait');

  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait,
    familyRole: options.familyRole || (houseId === ADERYN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options,
    extensions: {
      ...(options.extensions || {}),
      ...(registryManagedFields.size
        ? { registryManagedFields: [...registryManagedFields] }
        : {})
    }
  });
}

function house(id, name, emblem = '', motto = '') {
  return { id, name, motto, emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

function emblemForHouseId(houseId) {
  return HOUSE_EMBLEMS[String(houseId || '').replace(/^house-/, '')] || '';
}

function marriedAway(id, name, partnershipId, houseId, emblem = emblemForHouseId(houseId)) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem
  });
}

function timeJump(id, parentPartnershipId, childIds, fromYear, toYear) {
  return {
    id,
    parentPartnershipId,
    childIds,
    years: 0,
    fromYear,
    toYear,
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Die Stammbaumquelle markiert hier eine Überlieferungslücke; die Fortsetzung ist deshalb nur als wahrscheinliche Linie erfasst.',
    extensions: {}
  };
}

function gapChildren(childIds, parentIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, parentIds, partnershipId, {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Zwischengenerationen sind nicht einzeln überliefert.',
    extensions: { timeJumpId }
  });
}

const ROOT_PARENT_IDS = ['unknown-yvain-rhiannon-father', 'unknown-yvain-rhiannon-mother'];
const FOUNDER_IDS = ['yvain-aderyn', 'fainche-gormard'];
const OWAIN_IDS = ['owain-aderyn', 'uilean-ua-fionnghal'];
const BRINTHAN_IDS = ['brinthan-aderyn', 'beileag-duilb'];
const KIMBALL_IDS = ['kimball-aderyn', 'fonnait-oglivy'];
const TALFRYN_IDS = ['talfryn-aderyn', 'sianwen-wylan'];
const YWEN_IDS = ['ywen-aderyn', 'evaine-neidr'];
const TREVELYAN_IDS = ['ffion-illewod', 'trevelyan-aderyn'];
const GWALCHGWYN_IDS = ['gwalchgwyn-aderyn', 'myfanwy-hebog'];
const TARAN_ANCIENT_IDS = ['taran-ancient-aderyn', 'glaodhaich-tairise'];
const NODAWL_IDS = ['nodawl-aderyn', 'eirwyn-mwyalchen'];
const SIORS_IDS = ['siors-aderyn', 'gwladus-tylluan'];
const LLWYDAWG_IDS = ['llwydawg-aderyn', 'erasesanne-seymour'];
const CLYWD_IDS = ['clwyd-aderyn', 'ellun-gaeth'];
const ANARAWD_IDS = ['anarawd-aderyn', 'rionach-mata'];
const LOYDE_IDS = ['loyde-aderyn', 'gwennan-illysywen'];
const RHYNNON_IDS = ['rhynnon-aderyn', 'gwenyth-llwynog'];
const DUNGARTH_IDS = ['caradwyn-pendrag', 'dungarth-aderyn'];
const EFNISIEN_IDS = ['efnisien-aderyn', 'siana-tylluan'];
const CARNEDYR_IDS = ['braith-gafyr-1648', 'carnedyr-aderyn'];
const TARAN_1653_IDS = ['taran-1653-aderyn', 'ailin-midgna'];
const CATEL_IDS = ['mifawi-illewod', 'catel-aderyn'];
const GRUFYDD_IDS = ['bronwyn-gafyr', 'grufydd-aderyn'];
const CADWALLON_IDS = ['cadwallon-aderyn', 'thivya-aderyn'];
const CONWY_IDS = ['conwy-aderyn', 'emma-luitpolding'];
const MICAH_IDS = ['micah-aderyn', 'nurit-rosenstolz'];
const GARETH_IDS = ['gareth-aderyn', 'catrin-blodyn'];
const GWILYM_IDS = ['gwilym-aderyn', 'gwenhwyfar-mwyalchen'];
const BLEDYN_IDS = ['bledyn-aderyn', 'agna-baerenfell'];
const SELWYN_IDS = ['selwyn-aderyn', 'eluned-draenog'];
const COLWYNN_IDS = ['colwynn-aderyn', 'enfys-dienyddiwr'];
const GAIS_IDS = ['gais-aderyn', 'branna-loganne'];
const RODERIC_IDS = ['roderic-aderyn', 'duana-goidin'];

export const HOUSE_ADERYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-aderyn',
    title: "Haus Aderyn O'Penbryn",
    motto: 'Y nod ger bron. – Das Ziel vor Augen.',
    description: 'Das Grafengeschlecht Aderyn aus Penbryn im Tal der Milane, von der avallornischen Gründerzeit bis zur im Jahr 1740 lebenden Generation.',
    emblem: HOUSE_EMBLEMS.aderyn,
    houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.aderyn
  },
  houses: [
    house(ADERYN_HOUSE_ID, 'Haus Aderyn', HOUSE_EMBLEMS.aderyn, 'Das Ziel vor Augen.'),
    house('house-gormard', 'Clan Ui Gormárd', HOUSE_EMBLEMS.gormard),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-ua-fionnghal', 'Clan Ua Fíonnghal', HOUSE_EMBLEMS['ua-fionnghal']),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-duilb', 'Haus Duilb'),
    house('house-oglivy', 'Haus Oglivy'),
    house('house-gaeth', 'Haus Gaeth', HOUSE_EMBLEMS.gaeth),
    house('house-hebog', 'Haus Hebog', HOUSE_EMBLEMS.hebog),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-neidr', 'Haus Neidr', HOUSE_EMBLEMS.neidr),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-tairise', 'Haus Tairise'),
    house('house-mwyalchen', 'Haus Mwyalchen', HOUSE_EMBLEMS.mwyalchen),
    house('house-tylluan', 'Haus Tylluan', HOUSE_EMBLEMS.tylluan),
    house('house-eryr', 'Haus Eryr', HOUSE_EMBLEMS.eryr),
    house('house-seymour', 'Haus Seymour'),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-conochbhair', 'Haus Conochbhair'),
    house('house-mata', 'Haus Mata'),
    house('house-pysgod', 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-illysywen', 'Haus Illysywen', HOUSE_EMBLEMS.illysywen),
    house('house-feuerhaar', 'Haus Feuerhaar'),
    house('house-llwynog', 'Haus Llwynog'),
    house('house-creyr', 'Haus Créyr'),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-midgna', 'Haus Midgna'),
    house('house-luitpolding', 'Haus Luitpolding'),
    house('house-rosenstolz', 'Haus Rosenstolz'),
    house('house-blodyn', 'Haus Blodyn'),
    house('house-baerenfell', 'Haus Bärenfell'),
    house('house-tir-addawol', 'Haus Tir Addawol'),
    house('house-draenog', 'Haus Draenog'),
    house('house-dienyddiwr', 'Haus Dienyddiwr'),
    house('house-loganne', 'Haus Loganne'),
    house('house-goidin', 'Haus Goidin'),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-ilyuncu', 'Haus Ilyuncu', HOUSE_EMBLEMS.ilyuncu)
  ],
  persons: [
    // Unbekannte Eltern verbinden die ausdrücklich als Geschwister belegten Yvain und Rhiannon.
    person('unknown-yvain-rhiannon-father', 'Unbekannter Vater der Aderyn-Geschwister', 'male', '', '', '', { status: 'unknown' }),
    person('unknown-yvain-rhiannon-mother', 'Unbekannte Mutter der Aderyn-Geschwister', 'female', '', '', '', { status: 'unknown' }),

    // Gründerzeit und frühe, nur lückenhaft überlieferte Linie.
    person('yvain-aderyn', 'Yvain Aderyn', 'male', '????', '????', ADERYN_HOUSE_ID, { title: 'Gründer des Hauses Aderyn' }),
    person('rhiannon-aderyn', 'Rhiannon Aderyn', 'female', '????', '????'),
    person('fainche-gormard', 'Fainche Gormárd', 'female', '????', '????', 'house-gormard'),
    person('vortigern-pendrag', 'Vortigern Pendrag', 'male', '????', '????', 'house-pendrag', { title: 'Erster König von Cenyr' }),
    person('owain-aderyn', 'Owain Aderyn', 'male', '????', '????', ADERYN_HOUSE_ID, { title: 'Früher Graf des Tals der Milane' }),
    person('aranrhod-aderyn', 'Aranrhod Aderyn', 'female', '????', '????'),
    person('uilean-ua-fionnghal', 'Uilean Ua Fíonnghal', 'female', '????', '????', 'house-ua-fionnghal'),
    person('iorwerth-ancient-grawn', 'Iorwerth Grawn', 'male', '????', '????', 'house-grawn'),
    person('brinthan-aderyn', 'Brinthan Aderyn', 'male', '????', '????', ADERYN_HOUSE_ID, { title: 'Früher Graf des Tals der Milane' }),
    person('gereint-aderyn', 'Gereint Aderyn', 'male', '????', '????'),
    person('beileag-duilb', 'Beileag Duilb', 'female', '????', '????', 'house-duilb'),
    person('tudful', 'Tudful', 'female', '????', '????', ''),
    person('kimball-aderyn', 'Kimball Aderyn', 'male', '????', '????', ADERYN_HOUSE_ID, { title: 'Früher Graf des Tals der Milane' }),
    person('mordred-aderyn', 'Mordred Aderyn', 'male', '????', '????'),
    person('fonnait-oglivy', 'Fonnait Oglivy', 'female', '????', '????', 'house-oglivy'),
    person('thalena-ancient-spouse', 'Thalena', 'female', '????', '????', ''),
    person('lynette-aderyn', 'Lynette Aderyn', 'female', '1116', '1179'),
    person('raewyn-aderyn', 'Raewyn Aderyn', 'female', '1120', '1194'),
    person('tiwlip-aderyn', 'Tiwlip Aderyn', 'female', '1117', '1194'),
    person('talfryn-aderyn', 'Talfryn Aderyn', 'male', '1119', '1163', ADERYN_HOUSE_ID, { title: 'Graf des Tals der Milane bis 1163' }),
    person('agravaine-aderyn', 'Agravaine Aderyn', 'male', '1123', '1209'),
    person('gwynham-aderyn', 'Gwynham Aderyn', 'male', '1126', '1199'),
    person('gwendal-gaeth', 'Gwendal Gaeth', 'male', '1115', '1179', 'house-gaeth'),
    person('ivain-hebog', 'Ivain Hebog', 'male', '1117', '1201', 'house-hebog'),
    person('gruffyd-draig', 'Gruffyd Draig O\'Gwnthor', 'male', '1114', '1171', 'house-draig', {
      notes: 'Die Aderyn-Tabelle nennt 1157; die bereits kanonische Haus-Draig-Akte belegt 1171.'
    }),
    person('sianwen-wylan', 'Sianwen Wylan', 'female', '1122', '1203', 'house-wylan', {
      extensions: { registryManagedFields: ['birth', 'death'] },
      notes: 'Die Aderyn-Quelle lässt die Lebensdaten offen; die kanonische Haus-Wylan-Akte belegt 1122–1203.'
    }),
    person('thalena-1126-spouse', 'Thalena', 'female', '1126', '1185', ''),
    person('rhianu-1130-spouse', 'Rhianu', 'female', '1130', '1215', ''),

    // Mittelalterliche Grafenfolge.
    person('ywen-aderyn', 'Ywen Aderyn', 'male', '1230', '1274', ADERYN_HOUSE_ID, { title: 'Graf des Tals der Milane bis 1274' }),
    person('evaine-neidr', 'Evaine Neidr', 'female', '1231', '1303', 'house-neidr'),
    person('trevelyan-aderyn', 'Trevelyan Aderyn', 'male', '1250', '1285', ADERYN_HOUSE_ID, { title: 'Graf des Tals der Milane 1274–1285' }),
    person('aeron-aderyn', 'Aeron Aderyn', 'male', '1262', '1314'),
    person('ffion-illewod', "Ffion Illewod O'Aberon", 'female', '1250', '1320', 'house-illewod'),
    person('rhianu-1266-spouse', 'Rhianu', 'female', '1266', '1300', ''),
    person('gwalchgwyn-aderyn', 'Gwalchgwyn Aderyn', 'male', '1268', '1297', ADERYN_HOUSE_ID, { title: 'Graf des Tals der Milane 1285–1297' }),
    person('gwenhwyfar-1270-aderyn', 'Gwenhwyfar Aderyn', 'female', '1270', '1372'),
    person('myfanwy-hebog', 'Myfanwy Hebog', 'female', '1270', '1355', 'house-hebog'),
    person('geraint-gaeth', 'Geraint Gaeth', 'male', '1268', '1303', 'house-gaeth'),
    person('taran-ancient-aderyn', 'Taran Aderyn', 'male', '????', '????'),
    person('willow-aderyn', 'Willow Aderyn', 'female', '????', '', ADERYN_HOUSE_ID, { status: 'unknown' }),
    person('glaodhaich-tairise', 'Glaodhaich Tairise', 'female', '????', '????', 'house-tairise'),

    // Neuzeitliche Linie ab Nodawl.
    person('nodawl-aderyn', 'Nodawl Aderyn', 'male', '1584', '1629', ADERYN_HOUSE_ID, { title: 'Graf des Tals der Milane bis 1629' }),
    person('siors-aderyn', 'Siors Aderyn', 'male', '1588', '1661'),
    person('ceredig-aderyn', 'Ceredig Aderyn', 'male', '1592', '1631'),
    person('siriol-aderyn', 'Siriol Aderyn', 'female', '1594', '1669'),
    person('eirwyn-mwyalchen', 'Eirwyn Mwyalchen', 'female', '1585', '1644', 'house-mwyalchen'),
    person('gwladus-tylluan', 'Gwladus Tylluan', 'female', '1592', '1671', 'house-tylluan'),
    person('eiddyl-eryr', 'Eiddyl Eryr', 'male', '1590', '1652', 'house-eryr', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('llwydawg-aderyn', 'Llwydawg Aderyn', 'male', '1607', '1670', ADERYN_HOUSE_ID, { title: 'Graf des Tals der Milane 1629–1670' }),
    person('arglwyddes-aderyn', 'Arglwyddes Aderyn', 'female', '1614', '1666'),
    person('clwyd-aderyn', 'Clywd Aderyn', 'male', '1610', '1673', ADERYN_HOUSE_ID, {
      notes: 'Die Quellkarte schreibt Clywd; die Kinderüberschrift verwendet die Variante Clwyd.'
    }),
    person('gwydolwyn-aderyn', 'Gwydolwyn Aderyn', 'female', '1612', '1687'),
    person('erasesanne-seymour', 'Erasesanne Seymour', 'female', '1608', '1664', 'house-seymour'),
    person('gwalchgwyn-arth', 'Gwalchgwyn Arth', 'male', '1612', '1660', 'house-arth'),
    person('ellun-gaeth', 'Ellun Gaeth', 'female', '1612', '1679', 'house-gaeth'),
    person('colman-conochbhair', 'Cólman Conochbhair', 'male', '1612', '1679', 'house-conochbhair'),
    person('anarawd-aderyn', 'Anarawd Aderyn', 'male', '1625', '1686', ADERYN_HOUSE_ID, { title: 'Graf des Tals der Milane 1670–1686' }),
    person('ellanah-aderyn', 'Ellanah Aderyn', 'female', '1631', '1700'),
    person('rhosyn-aderyn', 'Rhosyn Aderyn', 'female', '1626', '1659'),
    person('loyde-aderyn', 'Loyde Aderyn', 'male', '1628', '1693'),
    person('heledd-aderyn', 'Heledd Aderyn', 'female', '1631', '1704'),
    person('rhynnon-aderyn', 'Rhynnon Aderyn', 'male', '1629', '1703'),
    person('rionach-mata', 'Rionach Mata', 'female', '????', '????', 'house-mata'),
    person('hefin-pysgod', 'Hefin Pysgod', 'male', '1630', '1702', 'house-pysgod'),
    person('maelgwyn-grawn', 'Maelgwyn Grawn', 'male', '1625', '1686', 'house-grawn'),
    person('gwennan-illysywen', 'Gwennan Illysywen', 'female', '1630', '1666', 'house-illysywen'),
    person('odin-feuerhaar', 'Odin Feuerhaar', 'male', '1629', '1671', 'house-feuerhaar', {
      notes: 'Die Stammbaumgrafik wirkt wie Eldhari; die genealogische Tabelle nennt ausdrücklich Feuerhaar.'
    }),
    person('gwenyth-llwynog', 'Gwenyth Llwynog', 'female', '1632', '1687', 'house-llwynog', {
      notes: 'Die Kinderüberschrift verwendet dafür die Namensvariante Guenevere.'
    }),
    person('dungarth-aderyn', 'Dungarth Aderyn', 'male', '1643', '1705', ADERYN_HOUSE_ID, { title: 'Graf des Tals der Milane 1686–1705' }),
    person('myf-aderyn', 'Myf Aderyn', 'female', '1647', '1691'),
    person('efnisien-aderyn', 'Efnisien Aderyn', 'male', '1651', '1672'),
    person('carnedyr-aderyn', 'Carnedyr Aderyn', 'unknown', '1647', '1720'),
    person('taran-1653-aderyn', 'Taran Aderyn', 'male', '1653', '1715'),
    person('tesni-aderyn', 'Tesni Aderyn', 'female', '1657', '1723'),
    person('caradwyn-pendrag', 'Caradwyn Pendrag', 'female', '1645', '1717', 'house-pendrag'),
    person('armel-creyr', 'Armel Créyr', 'male', '1644', '1735', 'house-creyr'),
    person('siana-tylluan', 'Siana Tylluan', 'female', '1651', '1703', 'house-tylluan'),
    person('braith-gafyr-1648', 'Braith Gafyr', 'unknown', '1648', '1702', 'house-gafyr'),
    person('ailin-midgna', 'Ailin Midgna', 'female', '1654', '1698', 'house-midgna'),
    person('thalen-hebog', 'Thalen Hebog', 'male', '1655', '1692', 'house-hebog'),
    person('catel-aderyn', 'Catel Aderyn', 'male', '1661', '1720', ADERYN_HOUSE_ID, { title: 'Graf des Tals der Milane 1705–1720' }),
    person('merfyn-aderyn', 'Merfyn Aderyn', 'male', '1664', ''),
    person('cadwallon-aderyn', 'Cadwallon Aderyn', 'male', '1667', '', ADERYN_HOUSE_ID, {
      extensions: { chartPartnerMirrorForPartnershipIds: ['marriage-cadwallon-thivya'] }
    }),
    person('grufydd-aderyn', 'Grufydd Aderyn', 'male', '1670', ''),
    person('carwyn-aderyn', 'Carwyn Aderyn', 'female', '1675', ''),
    person('thivya-aderyn', 'Thivya Aderyn', 'female', '1669', '', ADERYN_HOUSE_ID, {
      extensions: { chartRepeatForPartnershipIds: ['marriage-cadwallon-thivya'] }
    }),
    person('frewi-aderyn', 'Frewi Aderyn', 'female', '1666', '1673'),
    person('conwy-aderyn', 'Conwy Aderyn', 'male', '1670', ''),
    person('micah-aderyn', 'Micah Aderyn', 'male', '1674', ''),
    person('thalena-1676-aderyn', 'Thalena Aderyn', 'female', '1676', ''),
    person('mifawi-illewod', 'Mifawi Illewod', 'female', '1667', '1720', 'house-illewod'),
    person('meriel-gaeth', 'Meriel Gaeth', 'female', '1670', '', 'house-gaeth'),
    person('bronwyn-gafyr', 'Bronwyn Gafyr', 'female', '1672', '', 'house-gafyr'),
    person('cynan-neidr', 'Cynan Neidr', 'male', '1673', '', 'house-neidr'),
    person('emma-luitpolding', 'Emma Luitpolding', 'female', '1672', '', 'house-luitpolding'),
    person('nurit-rosenstolz', 'Nurit Rosenstolz', 'female', '1675', '1701', 'house-rosenstolz'),
    person('slevin-gaeth', 'Slevin Gaeth', 'male', '1672', '', 'house-gaeth', { title: 'Hoffalkner von Penbryn' }),

    // Generationen bis zum Bezugsjahr 1740.
    person('gareth-aderyn', 'Gareth Aderyn', 'male', '1694', '', ADERYN_HOUSE_ID, {
      title: 'Graf des Tals der Milane seit 1720',
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('gwendolyn-aderyn', 'Gwendolyn Aderyn', 'female', '1695', '', ADERYN_HOUSE_ID, { title: 'Gräfin von Celtigerns Wacht' }),
    person('gwilym-aderyn', 'Gwilym Aderyn', 'male', '1699', ''),
    person('bledyn-aderyn', 'Bledyn Aderyn', 'male', '1695', ''),
    person('venora-aderyn', 'Venora Aderyn', 'female', '1702', ''),
    person('selwyn-aderyn', 'Selwyn Aderyn', 'male', '1698', ''),
    person('rheanne-aderyn', 'Rheanne Aderyn', 'female', '1701', ''),
    person('colwynn-aderyn', 'Colwynn Aderyn', 'male', '1700', '', ADERYN_HOUSE_ID, {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('gais-aderyn', 'Gais Aderyn', 'male', '1697', '', ADERYN_HOUSE_ID, {
      notes: 'Die Partnerüberschrift verwendet die Kurzform Gai.'
    }),
    person('roderic-aderyn', 'Roderic Aderyn', 'male', '1700', ''),
    person('jeannae-aderyn', 'Jeannae Aderyn', 'female', '1702', '', ADERYN_HOUSE_ID, {
      notes: 'Die Kinderliste schreibt Jeanae; die bereits kanonische Haus-Gwyvern-Akte verwendet Jeannae.'
    }),
    person('catrin-blodyn', 'Catrin Blodyn', 'female', '1694', '', 'house-blodyn', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('galahad-draig', 'Galahad Draig', 'male', '1695', '', 'house-draig'),
    person('gwenhwyfar-mwyalchen', 'Gwenhwyfar Mwyalchen', 'female', '1700', '', 'house-mwyalchen'),
    person('agna-baerenfell', 'Agna Bärenfell', 'female', '1701', '', 'house-baerenfell'),
    person('merryn-tir-addawol', 'Merryn Tir Addawol', 'male', '1698', '', 'house-tir-addawol'),
    person('eluned-draenog', 'Eluned Draenog', 'female', '1699', '', 'house-draenog'),
    person('sheev-mwyalchen', 'Sheev Mwyalchen', 'male', '1696', '', 'house-mwyalchen'),
    person('enfys-dienyddiwr', 'Enfys Dienyddiwr', 'female', '1703', '', 'house-dienyddiwr', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('branna-loganne', 'Branna Loganne', 'female', '1699', '', 'house-loganne', {
      notes: 'Die Kinderüberschrift verwendet die Namensvariante Brannat.'
    }),
    person('duana-goidin', 'Duana Goidin', 'female', '1700', '', 'house-goidin'),
    person('mervyn-gwyvern', 'Mervyn Gwyvern', 'male', '1696', '', 'house-gwyvern', {
      notes: 'Die Aderyn-Tabelle schreibt Merwyn; die bereits kanonische Haus-Gwyvern-Akte verwendet Mervyn.'
    }),
    person('catwan-aderyn', 'Catwan Aderyn', 'male', '1714', '', ADERYN_HOUSE_ID, {
      title: 'Erbe des Hauses Aderyn',
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('cwgon-aderyn', 'Cwgon Aderyn', 'male', '1715', '', ADERYN_HOUSE_ID, { title: 'Erbe des Hauses Aderyn' }),
    person('arthen-aderyn', 'Arthen Aderyn', 'male', '1716', '', ADERYN_HOUSE_ID, { title: 'Erbe des Hauses Aderyn' }),
    person('rhenawedd-aderyn', 'Rhenawedd Aderyn', 'female', '1718', ''),
    person('gwilydd-aderyn', 'Gwilydd Aderyn', 'male', '1721', ''),
    person('elowen-aderyn', 'Elowen Aderyn', 'female', '1723', ''),
    person('rhiwallon-aderyn', 'Rhiwallon Aderyn', 'male', '????', ''),
    person('cynfyn-aderyn', 'Cynfyn Aderyn', 'male', '????', ''),
    person('dilys-aderyn', 'Dilys Aderyn', 'female', '1722', '', ADERYN_HOUSE_ID, {
      notes: 'Die Partnerüberschrift verwendet die verkürzte Schreibweise Dily; die ausgearbeitete Hebog-Gegenakte belegt das Geburtsjahr 1722.'
    }),
    person('gwil-aderyn', 'Gwil Aderyn', 'male', '????', ''),
    person('ewynn-aderyn', 'Ewynn Aderyn', 'female', '????', ''),
    person('edlym-aderyn', 'Edlym Aderyn', 'male', '1721', ''),
    person('eilir-aderyn', 'Eilir Aderyn', 'female', '1722', ''),
    person('yale-aderyn', 'Yale Aderyn', 'male', '1722', ''),
    person('lleulu-aderyn', 'Lleulu Aderyn', 'female', '1724', ''),
    person('wyett-aderyn', 'Wyett Aderyn', 'male', '1723', ''),
    person('wula-aderyn', 'Wula Aderyn', 'female', '1725', '', ADERYN_HOUSE_ID, {
      title: 'Wegverlobt an Haus Ilyuncu',
      tags: ['Wegverlobt'],
      extensions: { registryManagedFields: ['name', 'title', 'tags'] }
    }),
    person('aysha-eryr', "Aysha Eryr O'Penbryn", 'female', '1717', '', 'house-eryr', {
      extensions: { registryManagedFields: ['birth', 'portrait'] }
    }),
    person('leolin-hebog', 'Leolin Hebog', 'male', '1721', '', 'house-hebog', {
      notes: 'Die ausgearbeitete Hebog-Gegenakte belegt das Geburtsjahr 1721.'
    }),
    person('marvin-ilyuncu', 'Marvin Ilyuncu', 'male', '1723', '', 'house-ilyuncu')
  ],
  partnerships: [
    createMarriage('marriage-unknown-aderyn-parents', ...ROOT_PARENT_IDS, {
      notes: 'Die Eltern Yvains und Rhiannons sind nicht namentlich überliefert.'
    }),
    createMarriage('marriage-yvain-fainche', ...FOUNDER_IDS),
    createMarriage('marriage-vortigern-rhiannon', 'vortigern-pendrag', 'rhiannon-aderyn'),
    createMarriage('marriage-owain-uilean', ...OWAIN_IDS),
    createMarriage('marriage-iorwerth-aranrhod', 'iorwerth-ancient-grawn', 'aranrhod-aderyn'),
    createMarriage('marriage-brinthan-beileag', ...BRINTHAN_IDS),
    createMarriage('marriage-gereint-tudful', 'gereint-aderyn', 'tudful'),
    createMarriage('marriage-kimball-fonnait', ...KIMBALL_IDS),
    createMarriage('marriage-mordred-thalena-ancient', 'mordred-aderyn', 'thalena-ancient-spouse'),
    createMarriage('marriage-gwendal-lynette', 'gwendal-gaeth', 'lynette-aderyn'),
    createMarriage('marriage-ivain-raewyn', 'ivain-hebog', 'raewyn-aderyn'),
    createMarriage('marriage-gruffyd-tiwlip', 'gruffyd-draig', 'tiwlip-aderyn'),
    createMarriage('marriage-talfryn-sianwen', ...TALFRYN_IDS),
    createMarriage('marriage-agravaine-thalena', 'agravaine-aderyn', 'thalena-1126-spouse'),
    createMarriage('marriage-gwynham-rhianu', 'gwynham-aderyn', 'rhianu-1130-spouse', {
      status: 'ended',
      end: '1199',
      extensions: { registryManagedFields: ['status', 'end'] }
    }),
    createMarriage('marriage-ywen-evaine', ...YWEN_IDS),
    createMarriage('marriage-ffion-trevelyan', ...TREVELYAN_IDS),
    createMarriage('marriage-aeron-rhianu', 'aeron-aderyn', 'rhianu-1266-spouse', {
      status: 'ended',
      end: '1300',
      extensions: { registryManagedFields: ['status', 'end'] }
    }),
    createMarriage('marriage-gwalchgwyn-myfanwy', ...GWALCHGWYN_IDS),
    createMarriage('marriage-geraint-gwenhwyfar', 'geraint-gaeth', 'gwenhwyfar-1270-aderyn'),
    createMarriage('marriage-taran-glaodhaich', ...TARAN_ANCIENT_IDS),
    createMarriage('marriage-nodawl-eirwyn', ...NODAWL_IDS),
    createMarriage('marriage-siors-gwladus', ...SIORS_IDS, {
      status: 'ended',
      end: '1661',
      extensions: { registryManagedFields: ['status', 'end'] }
    }),
    createMarriage('marriage-eiddyl-siriol', 'eiddyl-eryr', 'siriol-aderyn', {
      status: 'ended',
      end: '1652',
      extensions: { registryManagedFields: ['status', 'end'] }
    }),
    createMarriage('marriage-llwydawg-erasesanne', ...LLWYDAWG_IDS),
    createMarriage('marriage-gwalchgwyn-arglwyddes', 'gwalchgwyn-arth', 'arglwyddes-aderyn'),
    createMarriage('marriage-clwyd-ellun', ...CLYWD_IDS),
    createMarriage('marriage-colman-gwydolwyn', 'colman-conochbhair', 'gwydolwyn-aderyn'),
    createMarriage('marriage-anarawd-rionach', ...ANARAWD_IDS),
    createMarriage('marriage-hefin-ellanah', 'hefin-pysgod', 'ellanah-aderyn'),
    createMarriage('marriage-maelgwyn-rhosyn', 'maelgwyn-grawn', 'rhosyn-aderyn'),
    createMarriage('marriage-loyde-gwennan', ...LOYDE_IDS),
    createMarriage('marriage-odin-heledd', 'odin-feuerhaar', 'heledd-aderyn'),
    createMarriage('marriage-rhynnon-gwenyth', ...RHYNNON_IDS),
    createMarriage('marriage-caradwyn-dungarth', ...DUNGARTH_IDS),
    createMarriage('marriage-armel-myf', 'armel-creyr', 'myf-aderyn', {
      status: 'ended',
      end: '1691',
      extensions: { registryManagedFields: ['status', 'end'] }
    }),
    createMarriage('marriage-efnisien-siana', ...EFNISIEN_IDS, {
      status: 'ended',
      end: '1672',
      extensions: { registryManagedFields: ['status', 'end'] }
    }),
    createMarriage('marriage-braith-carnedyr', ...CARNEDYR_IDS),
    createMarriage('marriage-taran-ailin', ...TARAN_1653_IDS),
    createMarriage('marriage-thalen-tesni', 'thalen-hebog', 'tesni-aderyn'),
    createMarriage('marriage-mifawi-catel', ...CATEL_IDS),
    createMarriage('marriage-merfyn-meriel', 'merfyn-aderyn', 'meriel-gaeth'),
    createMarriage('marriage-cadwallon-thivya', ...CADWALLON_IDS),
    createMarriage('marriage-bronwyn-grufydd', ...GRUFYDD_IDS),
    createMarriage('marriage-cynan-carwyn', 'cynan-neidr', 'carwyn-aderyn'),
    createMarriage('marriage-conwy-emma', ...CONWY_IDS),
    createMarriage('marriage-micah-nurit', ...MICAH_IDS),
    createMarriage('marriage-slevin-thalena', 'slevin-gaeth', 'thalena-1676-aderyn'),
    createMarriage('marriage-gareth-catrin', ...GARETH_IDS),
    createMarriage('marriage-galahad-gwendolyn', 'galahad-draig', 'gwendolyn-aderyn'),
    createMarriage('marriage-gwilym-gwenhwyfar', ...GWILYM_IDS),
    createMarriage('marriage-bledyn-agna', ...BLEDYN_IDS),
    createMarriage('marriage-merryn-venora', 'merryn-tir-addawol', 'venora-aderyn'),
    createMarriage('marriage-selwyn-eluned', ...SELWYN_IDS),
    createMarriage('marriage-sheev-rheanne', 'sheev-mwyalchen', 'rheanne-aderyn'),
    createMarriage('marriage-colwynn-enfys', ...COLWYNN_IDS),
    createMarriage('marriage-gais-branna', ...GAIS_IDS),
    createMarriage('marriage-roderic-duana', ...RODERIC_IDS),
    createMarriage('marriage-mervyn-jeannae', 'mervyn-gwyvern', 'jeannae-aderyn'),
    createMarriage('engagement-catwan-aysha', 'catwan-aderyn', 'aysha-eryr', { type: 'engagement' }),
    createMarriage('engagement-dilys-leolin', 'dilys-aderyn', 'leolin-hebog', { type: 'engagement' }),
    createMarriage('engagement-wula-marvin', 'wula-aderyn', 'marvin-ilyuncu', { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['yvain-aderyn', 'rhiannon-aderyn'], ROOT_PARENT_IDS, 'marriage-unknown-aderyn-parents'),
    ...childrenOf(['owain-aderyn', 'aranrhod-aderyn'], FOUNDER_IDS, 'marriage-yvain-fainche'),
    ...gapChildren(['brinthan-aderyn', 'gereint-aderyn'], OWAIN_IDS, 'marriage-owain-uilean', 'gap-owain-brinthan'),
    ...gapChildren(['kimball-aderyn', 'mordred-aderyn'], BRINTHAN_IDS, 'marriage-brinthan-beileag', 'gap-brinthan-kimball'),
    ...gapChildren(
      ['lynette-aderyn', 'raewyn-aderyn', 'tiwlip-aderyn', 'talfryn-aderyn', 'agravaine-aderyn', 'gwynham-aderyn'],
      KIMBALL_IDS,
      'marriage-kimball-fonnait',
      'gap-kimball-talfryn-generation'
    ),
    ...gapChildren(['ywen-aderyn'], TALFRYN_IDS, 'marriage-talfryn-sianwen', 'gap-talfryn-ywen'),
    ...childrenOf(['trevelyan-aderyn', 'aeron-aderyn'], YWEN_IDS, 'marriage-ywen-evaine'),
    ...childrenOf(['gwalchgwyn-aderyn', 'gwenhwyfar-1270-aderyn'], TREVELYAN_IDS, 'marriage-ffion-trevelyan'),
    ...gapChildren(['taran-ancient-aderyn', 'willow-aderyn'], GWALCHGWYN_IDS, 'marriage-gwalchgwyn-myfanwy', 'gap-gwalchgwyn-taran'),
    ...gapChildren(['nodawl-aderyn', 'siors-aderyn', 'ceredig-aderyn', 'siriol-aderyn'], TARAN_ANCIENT_IDS, 'marriage-taran-glaodhaich', 'gap-taran-nodawl'),
    ...childrenOf(['llwydawg-aderyn', 'arglwyddes-aderyn'], NODAWL_IDS, 'marriage-nodawl-eirwyn'),
    ...childrenOf(['clwyd-aderyn', 'gwydolwyn-aderyn'], SIORS_IDS, 'marriage-siors-gwladus'),
    ...childrenOf(['anarawd-aderyn', 'ellanah-aderyn', 'rhosyn-aderyn', 'loyde-aderyn', 'heledd-aderyn'], LLWYDAWG_IDS, 'marriage-llwydawg-erasesanne'),
    ...childrenOf(['rhynnon-aderyn'], CLYWD_IDS, 'marriage-clwyd-ellun'),
    ...childrenOf(['dungarth-aderyn', 'myf-aderyn', 'efnisien-aderyn'], ANARAWD_IDS, 'marriage-anarawd-rionach'),
    ...childrenOf(['carnedyr-aderyn'], LOYDE_IDS, 'marriage-loyde-gwennan'),
    ...childrenOf(['taran-1653-aderyn', 'tesni-aderyn'], RHYNNON_IDS, 'marriage-rhynnon-gwenyth'),
    ...childrenOf(['catel-aderyn', 'merfyn-aderyn', 'cadwallon-aderyn', 'grufydd-aderyn', 'carwyn-aderyn'], DUNGARTH_IDS, 'marriage-caradwyn-dungarth'),
    ...childrenOf(['thivya-aderyn'], EFNISIEN_IDS, 'marriage-efnisien-siana'),
    ...childrenOf(['frewi-aderyn', 'conwy-aderyn'], CARNEDYR_IDS, 'marriage-braith-carnedyr'),
    ...childrenOf(['micah-aderyn', 'thalena-1676-aderyn'], TARAN_1653_IDS, 'marriage-taran-ailin'),
    ...childrenOf(['gareth-aderyn', 'gwendolyn-aderyn', 'gwilym-aderyn'], CATEL_IDS, 'marriage-mifawi-catel'),
    ...childrenOf(['bledyn-aderyn', 'venora-aderyn'], GRUFYDD_IDS, 'marriage-bronwyn-grufydd'),
    ...childrenOf(['selwyn-aderyn', 'rheanne-aderyn'], CADWALLON_IDS, 'marriage-cadwallon-thivya'),
    ...childrenOf(['colwynn-aderyn'], CONWY_IDS, 'marriage-conwy-emma'),
    ...childrenOf(['gais-aderyn', 'roderic-aderyn', 'jeannae-aderyn'], MICAH_IDS, 'marriage-micah-nurit'),
    ...childrenOf(['catwan-aderyn', 'cwgon-aderyn', 'arthen-aderyn', 'rhenawedd-aderyn'], GARETH_IDS, 'marriage-gareth-catrin'),
    ...childrenOf(['gwilydd-aderyn', 'elowen-aderyn'], GWILYM_IDS, 'marriage-gwilym-gwenhwyfar'),
    ...childrenOf(['rhiwallon-aderyn', 'cynfyn-aderyn', 'dilys-aderyn'], BLEDYN_IDS, 'marriage-bledyn-agna'),
    ...childrenOf(['gwil-aderyn', 'ewynn-aderyn'], SELWYN_IDS, 'marriage-selwyn-eluned'),
    ...childrenOf(['edlym-aderyn', 'eilir-aderyn'], COLWYNN_IDS, 'marriage-colwynn-enfys'),
    ...childrenOf(['yale-aderyn', 'lleulu-aderyn'], GAIS_IDS, 'marriage-gais-branna'),
    ...childrenOf(['wyett-aderyn', 'wula-aderyn'], RODERIC_IDS, 'marriage-roderic-duana')
  ],
  cadetBranches: [
    createCadetHouseBranch({
      id: 'cadet-gaeth-gereint-tudful',
      name: 'Haus Gaeth',
      parentPartnershipId: 'marriage-gereint-tudful',
      houseId: 'house-gaeth',
      targetFamilyId: 'haus-gaeth',
      emblem: HOUSE_EMBLEMS.gaeth,
      subtitle: 'Gegründetes Baronenhaus',
      notes: 'Gereint Aderyn und Tudful begründen den Gaeth-Kadettenzweig; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    createCadetHouseBranch({
      id: 'cadet-hebog-mordred-thalena',
      name: 'Haus Hebog',
      parentPartnershipId: 'marriage-mordred-thalena-ancient',
      houseId: 'house-hebog',
      targetFamilyId: 'haus-hebog',
      emblem: HOUSE_EMBLEMS.hebog,
      subtitle: 'Gegründetes Baronenhaus',
      notes: 'Mordred Aderyn und Thalena begründen den Hebog-Kadettenzweig; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    createCadetHouseBranch({
      id: 'cadet-mwyalchen-agravaine-thalena',
      name: 'Haus Mwyalchen',
      parentPartnershipId: 'marriage-agravaine-thalena',
      houseId: 'house-mwyalchen',
      targetFamilyId: 'haus-mwyalchen',
      emblem: HOUSE_EMBLEMS.mwyalchen,
      subtitle: 'Gegründetes Ritterfürstenhaus',
      notes: 'Agravaine Aderyn und Thalena begründen den Mwyalchen-Kadettenzweig; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    createCadetHouseBranch({
      id: 'cadet-eryr-aeron-rhianu',
      name: 'Haus Eryr',
      parentPartnershipId: 'marriage-aeron-rhianu',
      houseId: 'house-eryr',
      targetFamilyId: 'haus-eryr',
      emblem: HOUSE_EMBLEMS.eryr,
      subtitle: 'Gegründetes Ritterfürstenhaus',
      notes: 'Aeron Aderyn und Rhianu begründen den Eryr-Kadettenzweig; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    createCadetHouseBranch({
      id: 'cadet-tylluan-gwynham-rhianu',
      name: 'Haus Tylluan',
      parentPartnershipId: 'marriage-gwynham-rhianu',
      houseId: 'house-tylluan',
      targetFamilyId: 'haus-tylluan',
      emblem: HOUSE_EMBLEMS.tylluan,
      subtitle: 'Gegründetes Ritterfürstenhaus',
      notes: 'Gwynham Aderyn und Rhianu begründen den Tylluan-Kadettenzweig; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    createCadetHouseBranch({
      id: 'cadet-ilyuncu-merfyn-meriel',
      name: 'Haus Ilyuncu',
      parentPartnershipId: 'marriage-merfyn-meriel',
      houseId: 'house-ilyuncu',
      targetFamilyId: 'haus-ilyuncu',
      emblem: HOUSE_EMBLEMS.ilyuncu,
      subtitle: 'Gegründetes Ritterfürstenhaus',
      notes: 'Merfyn Aderyn und Meriel Gaeth begründen den Ilyuncu-Kadettenzweig; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    marriedAway('married-away-pendrag-rhiannon', 'Haus Pendrag', 'marriage-vortigern-rhiannon', 'house-pendrag', HOUSE_EMBLEMS.pendrag),
    marriedAway('married-away-grawn-aranrhod', 'Haus Grawn', 'marriage-iorwerth-aranrhod', 'house-grawn', HOUSE_EMBLEMS.grawn),
    marriedAway('married-away-gaeth-lynette', 'Haus Gaeth', 'marriage-gwendal-lynette', 'house-gaeth'),
    marriedAway('married-away-hebog-raewyn', 'Haus Hebog', 'marriage-ivain-raewyn', 'house-hebog'),
    marriedAway('married-away-draig-tiwlip', 'Haus Draig', 'marriage-gruffyd-tiwlip', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-gaeth-gwenhwyfar', 'Haus Gaeth', 'marriage-geraint-gwenhwyfar', 'house-gaeth'),
    marriedAway('married-away-eryr-siriol', 'Haus Eryr', 'marriage-eiddyl-siriol', 'house-eryr'),
    marriedAway('married-away-arth-arglwyddes', 'Haus Arth', 'marriage-gwalchgwyn-arglwyddes', 'house-arth', HOUSE_EMBLEMS.arth),
    marriedAway('married-away-conochbhair-gwydolwyn', 'Haus Conochbhair', 'marriage-colman-gwydolwyn', 'house-conochbhair'),
    marriedAway('married-away-pysgod-ellanah', 'Haus Pysgod', 'marriage-hefin-ellanah', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-grawn-rhosyn', 'Haus Grawn', 'marriage-maelgwyn-rhosyn', 'house-grawn', HOUSE_EMBLEMS.grawn),
    marriedAway('married-away-feuerhaar-heledd', 'Haus Feuerhaar', 'marriage-odin-heledd', 'house-feuerhaar'),
    marriedAway('married-away-creyr-myf', 'Haus Créyr', 'marriage-armel-myf', 'house-creyr'),
    marriedAway('married-away-hebog-tesni', 'Haus Hebog', 'marriage-thalen-tesni', 'house-hebog'),
    marriedAway('married-away-neidr-carwyn', 'Haus Neidr', 'marriage-cynan-carwyn', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-gaeth-thalena', 'Haus Gaeth', 'marriage-slevin-thalena', 'house-gaeth'),
    marriedAway('married-away-draig-gwendolyn', 'Haus Draig', 'marriage-galahad-gwendolyn', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-tir-addawol-venora', 'Haus Tir Addawol', 'marriage-merryn-venora', 'house-tir-addawol'),
    marriedAway('married-away-mwyalchen-rheanne', 'Haus Mwyalchen', 'marriage-sheev-rheanne', 'house-mwyalchen'),
    marriedAway('married-away-gwyvern-jeannae', 'Haus Gwyvern', 'marriage-mervyn-jeannae', 'house-gwyvern', HOUSE_EMBLEMS.gwyvern),
    createMarriedAwayBranch({
      id: 'engaged-away-wula-aderyn-ilyuncu',
      name: 'Haus Ilyuncu',
      parentPartnershipId: 'engagement-wula-marvin',
      houseId: 'house-ilyuncu',
      targetFamilyId: 'haus-ilyuncu',
      emblem: HOUSE_EMBLEMS.ilyuncu,
      subtitle: 'Wegverlobt an Haus Ilyuncu',
      notes: 'Wula Aderyn ist mit Marvin Ilyuncu verlobt; die Verbindung wird nicht als geschlossene Ehe dargestellt.'
    })
  ],
  timeJumps: [
    timeJump('gap-owain-brinthan', 'marriage-owain-uilean', ['brinthan-aderyn', 'gereint-aderyn'], '????', '????'),
    timeJump('gap-brinthan-kimball', 'marriage-brinthan-beileag', ['kimball-aderyn', 'mordred-aderyn'], '????', '????'),
    timeJump(
      'gap-kimball-talfryn-generation',
      'marriage-kimball-fonnait',
      ['lynette-aderyn', 'raewyn-aderyn', 'tiwlip-aderyn', 'talfryn-aderyn', 'agravaine-aderyn', 'gwynham-aderyn'],
      '????',
      '1116'
    ),
    timeJump('gap-talfryn-ywen', 'marriage-talfryn-sianwen', ['ywen-aderyn'], '1163', '1230'),
    timeJump('gap-gwalchgwyn-taran', 'marriage-gwalchgwyn-myfanwy', ['taran-ancient-aderyn', 'willow-aderyn'], '1297', '????'),
    timeJump('gap-taran-nodawl', 'marriage-taran-glaodhaich', ['nodawl-aderyn', 'siors-aderyn', 'ceredig-aderyn', 'siriol-aderyn'], '????', '1584')
  ],
  lineage: {
    founderPartnershipId: 'marriage-yvain-fainche',
    houseId: ADERYN_HOUSE_ID,
    crestSubtitle: 'Grafengeschlecht',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'yvain-aderyn',
    orientation: 'vertical',
    ancestorDepth: 28,
    descendantDepth: 28,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten, Beziehungen und die sechs seriellen Überlieferungslücken folgen der bereitgestellten Aderyn-Tabelle und ihrer Stammbaumgrafik. Yvain und Rhiannon sind ausdrücklich Geschwister; ihre nicht benannten Eltern werden deshalb als zwei strukturelle Unbekannte geführt. Der Haus-Aderyn-Knoten hängt direkt am Gründerpaar Yvain und Fainche. Sechs belegte Kadettenzweige hängen jeweils direkt unter ihrem Gründerpaar: Gereint und Tudful begründen Haus Gaeth, Mordred und Thalena Haus Hebog, Agravaine und Thalena Haus Mwyalchen, Gwynham und Rhianu Haus Tylluan, Aeron und Rhianu Haus Eryr sowie Merfyn und Meriel Gaeth Haus Ilyuncu. Cadwallon und Thivya erscheinen in der Tabelle zweimal, sind aber jeweils genau eine Person und bilden genau eine Ehe. Vierzehn anonyme Partnerkarten sowie der unverbundene Hofbeamte Daffyd Eryr wurden nicht als genealogische Personen importiert. Die Amtszeiten der Grafen wurden nur als Titel, nicht als Geburtsdaten verwendet. Abweichende Schreibweisen und die kanonischen Gegenakten sind an den betroffenen Personen dokumentiert. Agravaines Individualporträt wird aus der ausgearbeiteten Mwyalchen-Gegenakte wiederverwendet. Die neue Registergliederung führt Aderyn unter Yvains Klamm und Penbryn. Die bekannten Wappen der in dieser Akte vorkommenden Häuser des Tals der Milane werden aus dem gemeinsamen Grafschaftsmodul bezogen.',
    blankFamily: false,
    sourceRevision: 14,
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
