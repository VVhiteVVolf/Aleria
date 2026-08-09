import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { BLODYN_HOUSE_PROFILES } from './blodyn-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { KLAUENINSEL_HOUSE_EMBLEMS } from './klaueninseln-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';

const BLODYN_HOUSE_ID = 'house-blodyn';
const BLODYN_EMBLEM = 'assets/images/houses/Blütenland/haus-blodyn.png';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  blodyn: BLODYN_EMBLEM,
  blaidd: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd,
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  pendrag: 'assets/images/houses/Vortigerns Ruh/haus-pendrag.png',
  gwaedlyd: GRAUE_WEITE_HOUSE_EMBLEMS.gwaedlyd,
  illygoden: GRAUE_WEITE_HOUSE_EMBLEMS.illygoden,
  lyfant: GRAUE_WEITE_HOUSE_EMBLEMS.lyfant,
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
});

const HOUSE_HEAD_IDS = new Set([
  'mordred-blodyn',
  'hoyer-blodyn',
  'breunor-blodyn',
  'gogyvwlch-blodyn',
  'dyvynwal-blodyn',
  'mailgwin-blodyn',
  'gruffydd-blodyn',
  'voreyn-blodyn',
  'jygallag-blodyn',
  'yhon-blodyn'
]);

const MAINLINE_IDS = new Set();

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = BLODYN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_BLODYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === BLODYN_HOUSE_ID ? 'core' : 'married'),
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

function marriedAway(id, name, partnershipId, houseId, emblem = '', targetFamilyId = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: targetFamilyId || houseId.replace(/^house-/, 'haus-'),
    emblem
  });
}

const MORDRED_IDS = ['kerrylin-dreigiau', 'mordred-blodyn'];
const HOYER_IDS = ['hoyer-blodyn', 'naliandra-riabhach'];
const CARAF_IDS = ['caraf-blodyn', 'gwrdnei-raun'];
const BREUNOR_IDS = ['breunor-blodyn', 'myfanwy-blaidd'];
const CERIDWEN_IDS = ['ceridwen-blodyn', 'gwynfor-blaidd'];
const MORFYDD_IDS = ['morfydd-blodyn', 'breseal-dobhar'];
const GWENDOLEN_IDS = ['gwendolen-blodyn', 'arthfael-dianc'];
const MORWENNA_IDS = ['morwenna-blodyn', 'gwalchmai-trachwyll'];
const TUDURWEN_IDS = ['tudurwen-blodyn', 'ysbryd-arfordir'];
const GOGYVWLCH_IDS = ['gogyvwlch-blodyn', 'sulwen-trachwyll'];
const URYEN_IDS = ['uryen-blodyn', 'maygan-morlais'];
const DYVYNWAL_IDS = ['dyvynwal-blodyn', 'orfllaith-urquhart'];
const ANGHARAD_IDS = ['angharad-blodyn', 'gavin-trachwyll'];
const MAILGWIN_IDS = ['mailgwin-blodyn', 'aoirghe-mac-duilb'];
const GWYNETH_IDS = ['howell-draig', 'gwyneth-blodyn'];
const MYFANWY_IDS = ['myfanwy-1618-blodyn', 'kynwrig-dianc'];
const IORWERTH_IDS = ['iorwerth-blodyn', 'cerridwyn-walwrs'];
const GRUFFYDD_IDS = ['gruffydd-blodyn', 'catryn-llyfant'];
const BLODEUWEDD_IDS = ['blodeuwedd-blodyn', 'lulach-dubglais'];
const KETHTRWM_IDS = ['kethtrwm-blodyn', 'hildegard-wargh'];
const OLWYN_IDS = ['olwyn-blodyn', 'colwin-gwenyen'];
const VOREYN_IDS = ['voreyn-blodyn', 'lynfa-blodeuwedd'];
const ARRYN_IDS = ['gendry-wylan', 'arryn-blodyn'];
const ARVYN_IDS = ['arvyn-blodyn', 'trystan-blaidd'];
const BLAWD_IDS = ['rhys-arth', 'blawd-blodyn'];
const TATHAL_IDS = ['tathal-blodyn', 'bettrys-gwaedlyd'];
const DIAFOL_IDS = ['diafol-blodyn', 'corryn-illygoden'];
const TELYN_IDS = ['telyn-blodyn', 'hetwn-morgant'];
const JYGALLAG_IDS = ['jygallag-blodyn', 'sheena-urquhart'];
const TARRANT_IDS = ['tarrant-blodyn', 'luned-mochdear'];
const ELIN_IDS = ['elin-blodyn', 'mevyn-dyfrgi'];
const BLEDDYN_IDS = ['fflur-draig', 'bleddyn-blodyn'];
const AFANEN_IDS = ['afanen-blodyn', 'grugyn-drewi'];
const TANWEN_IDS = ['tanwen-blodyn', 'kynwas-morlais'];
const YHON_IDS = ['yhon-blodyn', 'cerny-dianc'];
const CATRIN_IDS = ['gareth-aderyn', 'catrin-blodyn'];
const DYLIS_IDS = ['dystan-pendrag', 'dylis-blodyn'];
export const BLODYN_ABERDAIL_FOUNDER_IDS = Object.freeze(['yvain-blodyn', 'bronwen-blaidd']);
const MEGGAN_IDS = ['meggan-blodyn', 'micah-arfordir'];
const TALARA_IDS = ['tarrant-1703-arth', 'talara-blodyn'];
const WYNFOR_IDS = ['wynfor-blodyn', 'delwen-trachwyll'];
const SIRIOL_IDS = ['siriol-blodyn', 'trachmyr-serenoc'];

export const HOUSE_BLODYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-blodyn',
    title: "Haus Blodyn O'Llyndor",
    motto: 'Datblyg dy nerth a thyfu!',
    description: 'Das alte Königshaus von Vennyr aus Lyndor. Yhons Talgarther und Yvains Aberdailer Nachkommen werden in zwei getrennten, direkt verknüpften Klaueninsel-Akten fortgeführt.',
    emblem: BLODYN_EMBLEM,
    houseProfile: BLODYN_HOUSE_PROFILES.lyndor
  },
  houses: [
    house(BLODYN_HOUSE_ID, 'Haus Blodyn', BLODYN_EMBLEM),
    house('house-dreigiau', 'Haus Dreigiau'),
    house('house-riabhach', 'Haus Riabhach'),
    house('house-raun', 'Haus Raun'),
    house('house-blaidd', "Haus Blaidd O'Branon", HOUSE_EMBLEMS.blaidd),
    house('house-blaidd-tredegar', "Haus Blaidd O'Tredegar", HOUSE_EMBLEMS.blaidd),
    house('house-dobhar', 'Haus Dobhar'),
    house('house-dianc', "Haus Dianc O'Gwynlann", KLAUENINSEL_HOUSE_EMBLEMS.dianc),
    house('house-trachwyll', 'Haus Trachwyll'),
    house('house-arfordir', "Haus Arfordir O'Serenlyn", KLAUENINSEL_HOUSE_EMBLEMS.arfordir),
    house('house-morlais', 'Haus Morlais'),
    house('house-urquhart', 'Haus Urquhart'),
    house('house-mac-duilb', 'Haus Mac Duilb'),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-walwrs', "Haus Walwrs O'Traeth", KLAUENINSEL_HOUSE_EMBLEMS.walwrs),
    house('house-llyfant', "Haus Lyfant O'Derwyddion", HOUSE_EMBLEMS.lyfant),
    house('house-dubglais', 'Haus Dubglais'),
    house('house-wargh', 'Haus Wargh'),
    house('house-gwenyen', 'Haus Gwenyen'),
    house('house-blodeuwedd', 'Haus Blodeuwedd'),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-gwaedlyd', "Haus Gwaedlyd O'Caer Gorwel", HOUSE_EMBLEMS.gwaedlyd),
    house('house-illygoden', "Haus Illygoden O'Tirwedd", HOUSE_EMBLEMS.illygoden),
    house('house-morgant', 'Haus Morgant'),
    house('house-mochdear', 'Haus Mochdear'),
    house('house-dyfrgi', "Haus Dyfrgi O'Mynyddharbwr", KLAUENINSEL_HOUSE_EMBLEMS.dyfrgi),
    house('house-dyfrgi-caer-cryftlawd', "Haus Dyfrgi O'Caer Cryftlawd", KLAUENINSEL_HOUSE_EMBLEMS.dyfrgi),
    house('house-drewi', 'Haus Drewi'),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-serenoc', 'Haus Serenoc'),
    house('house-diafol', "Haus Diafol O'Trefgoch", KLAUENINSEL_HOUSE_EMBLEMS.diafol),
    house('house-blodyn-talgarth', "Haus Blodyn O'Talgarth", BLODYN_EMBLEM),
    house('house-blodyn-aberdail', 'Haus Blodyn von Aberdail', BLODYN_EMBLEM)
  ],
  persons: [
    person('mordred-blodyn', 'Mordred Blodyn', 'male', '????', '????'),
    person('kerrylin-dreigiau', 'Kerrylin', 'female', '????', '????', 'house-dreigiau'),
    person('hoyer-blodyn', 'Hoyer Blodyn', 'male', '????', '????', BLODYN_HOUSE_ID, { title: 'Erster König von Vennyr' }),
    person('naliandra-riabhach', 'Naliandra Riabhach', 'female', '????', '????', 'house-riabhach'),
    person('caraf-blodyn', 'Caraf Blodyn', 'male', '????', '????'),
    person('gwrdnei-raun', 'Gwrdnei Raun', 'female', '????', '????', 'house-raun'),

    person('breunor-blodyn', 'Breunor Blodyn', 'male', '????', '????'),
    person('myfanwy-blaidd', 'Myfanwy Blaidd', 'female', '????', '????', 'house-blaidd'),
    person('ceridwen-blodyn', 'Ceridwen Blodyn', 'female', '????', '????'),
    person('gwynfor-blaidd', 'Gwynfor Blaidd', 'male', '????', '????', 'house-blaidd'),
    person('morfydd-blodyn', 'Morfydd Blodyn', 'female', '????', '????'),
    person('breseal-dobhar', 'Breseal Dobhar', 'male', '????', '????', 'house-dobhar'),
    person('gwendolen-blodyn', 'Gwendolen Blodyn', 'female', '????', '????'),
    person('arthfael-dianc', 'Arthfael Dianc', 'male', '????', '????', 'house-dianc'),
    person('morwenna-blodyn', 'Morwenna Blodyn', 'female', '????', '????'),
    person('gwalchmai-trachwyll', 'Gwalchmai Trachwyll', 'male', '????', '????', 'house-trachwyll'),
    person('tudurwen-blodyn', 'Tudurwen Blodyn', 'female', '????', '????'),
    person('ysbryd-arfordir', 'Ysbryd Arfordir', 'male', '????', '????', 'house-arfordir'),

    person('gogyvwlch-blodyn', 'Gogyvwlch Blodyn', 'male', '????', '????'),
    person('sulwen-trachwyll', 'Sulwen Trachwyll', 'female', '????', '????', 'house-trachwyll'),
    person('mieftagoet-blodyn', 'Mieftagoet Blodyn', 'male', '????', '????'),
    person('uryen-blodyn', 'Uryen Blodyn', 'male', '????', '????'),
    person('maygan-morlais', 'Maygan Morlais', 'female', '????', '????', 'house-morlais'),

    person('dyvynwal-blodyn', 'Dyvynwal Blodyn', 'male', '1599', '1643', BLODYN_HOUSE_ID, { title: 'König von Vennyr 1626–1643' }),
    person('orfllaith-urquhart', 'Òrfllaith Urquhart', 'female', '1600', '1662', 'house-urquhart'),
    person('angharad-blodyn', 'Angharad Blodyn', 'female', '1600', '1660'),
    person('gavin-trachwyll', "Gavin Trachwyll O'Talfronwy", 'male', '1605', '1662', 'house-trachwyll'),

    person('mailgwin-blodyn', 'Mailgwin Blodyn', 'male', '1617', '1668', BLODYN_HOUSE_ID, { title: 'König von Vennyr 1643–1668' }),
    person('aoirghe-mac-duilb', 'Aoirghe Mac Duilb', 'female', '1618', '1672', 'house-mac-duilb'),
    person('howell-draig', 'Howell Draig', 'male', '1598', '1669', 'house-draig'),
    person('gwyneth-blodyn', 'Gwyneth Blodyn', 'female', '1600', '????', BLODYN_HOUSE_ID, {
      notes: 'Die Blodyn-Tabelle nennt 1618. Die kanonische Draig-Gegenakte und die Geburten ihrer Kinder 1617/1619 belegen stattdessen 1600.'
    }),
    person('myfanwy-1618-blodyn', 'Myfanwy Blodyn', 'female', '1618', '1699'),
    person('kynwrig-dianc', "Kynwrig Dianc O'Gwynlann", 'male', '1618', '1687', 'house-dianc'),
    person('iorwerth-blodyn', 'Iorwerth Blodyn', 'male', '1618', '1670'),
    person('cerridwyn-walwrs', "Cerridwyn Walwrs O'Traeth", 'female', '1620', '1674', 'house-walwrs'),
    person('meuric-blodyn', 'Meuric Blodyn', 'male', '1621', '1642'),

    person('gruffydd-blodyn', 'Gruffydd Blodyn', 'male', '1635', '1694', BLODYN_HOUSE_ID, { title: 'König von Vennyr 1668–1694' }),
    person('catryn-llyfant', 'Catryn Lyfant', 'female', '1635', '1652', 'house-llyfant'),
    person('blodeuwedd-blodyn', 'Blodeuwedd Blodyn', 'female', '1637', '1670'),
    person('lulach-dubglais', 'Lulach Dubglais', 'male', '1636', '1678', 'house-dubglais'),
    person('kethtrwm-blodyn', 'Kethtrwm Blodyn', 'male', '1635', '1690'),
    person('hildegard-wargh', 'Hildegard Wargh', 'female', '1636', '1689', 'house-wargh'),
    person('siani-blodyn', 'Siani Blodyn', 'female', '1636', '1637'),
    person('olwyn-blodyn', 'Olwyn Blodyn', 'female', '1636', '1667'),
    person('colwin-gwenyen', 'Colwin Gwenyen', 'male', '1629', '1672', 'house-gwenyen'),

    person('voreyn-blodyn', 'Voreyn Blodyn', 'male', '1652', '1715', BLODYN_HOUSE_ID, { title: 'König von Vennyr 1694–1715' }),
    person('lynfa-blodeuwedd', 'Lynfa Blodeuwedd', 'female', '1653', '1675', 'house-blodeuwedd'),
    person('arryn-blodyn', 'Arryn Blodyn', 'female', '1655', '1711', BLODYN_HOUSE_ID, {
      notes: 'Kanonischer Name gemäß der ausdrücklichen Korrektur zur Wylan-Gegenakte; die alte Blodyn-Tabelle nennt abweichend Caryln.'
    }),
    person('gendry-wylan', 'Gendry Wylan', 'male', '1653', '1716', 'house-wylan'),
    person('arvyn-blodyn', 'Arvyn Blodyn', 'female', '1655', '????'),
    person('trystan-blaidd', "Trystan Blaidd O'Branon", 'male', '1651', '1720', 'house-blaidd'),
    person('blawd-blodyn', 'Blawd Blodyn', 'female', '1652', '????'),
    person('rhys-arth', 'Rhys Arth', 'male', '1653', '', 'house-arth'),

    person('tathal-blodyn', 'Tathal Blodyn', 'male', '1652', '1708'),
    person('bettrys-gwaedlyd', 'Bettrys Gwaedlyd', 'female', '1652', '1702', 'house-gwaedlyd'),
    person('diafol-blodyn', 'Diafol Blodyn', 'male', '1653', '1671'),
    person('corryn-illygoden', 'Corryn Illygoden', 'female', '1648', '1714', 'house-illygoden'),
    person('telyn-blodyn', 'Telyn Blodyn', 'male', '1655', '1714'),
    person('hetwn-morgant', 'Hetwn Morgant', 'female', '1651', '1720', 'house-morgant'),

    person('jygallag-blodyn', 'Jygallag Blodyn', 'male', '1670', '1720', BLODYN_HOUSE_ID, { title: 'König von Vennyr 1715–1720' }),
    person('sheena-urquhart', 'Sheena Urquhart', 'female', '1665', '1720', 'house-urquhart'),
    person('tarrant-blodyn', 'Tarrant Blodyn', 'male', '1672', '1720'),
    person('luned-mochdear', 'Luned Mochdear', 'female', '1675', '1710', 'house-mochdear'),
    person('carys-blodyn', 'Carys Blodyn', 'female', '1673', '1679'),
    person('elin-blodyn', 'Elin Blodyn', 'female', '1675', '', BLODYN_HOUSE_ID, {
      extensions: { registryManagedFields: ['status', 'death'] }
    }),
    person('mevyn-dyfrgi', 'Mervyn Dyfrgi', 'male', '1672', '', 'house-dyfrgi-caer-cryftlawd', {
      worldPersonId: 'person--haus-dyfrgi--mevyn-dyfrgi',
      extensions: {
        registryManagedFields: ['worldPersonId', 'name', 'status', 'death', 'houseId']
      }
    }),

    person('bleddyn-blodyn', 'Bleddyn Blodyn', 'male', '1669', '1720'),
    person('fflur-draig', 'Fflur Draig', 'female', '1670', '1720', 'house-draig'),
    person('afanen-blodyn', 'Afanen Blodyn', 'female', '1670', '1720'),
    person('grugyn-drewi', 'Grugyn Drewi', 'male', '1667', '1720', 'house-drewi'),
    person('tanwen-blodyn', 'Tanwen Blodyn', 'female', '1674', '1720'),
    person('kynwas-morlais', 'Kynwas Morlais', 'male', '1671', '1720', 'house-morlais'),

    person('yhon-blodyn', 'Yhon Blodyn', 'male', '1693', '', BLODYN_HOUSE_ID, { title: 'König von Vennyr seit 1720' }),
    person('cerny-dianc', 'Cerny Dianc', 'female', '1692', '1720', 'house-dianc'),
    person('catrin-blodyn', 'Catrin Blodyn', 'female', '1694', ''),
    person('gareth-aderyn', 'Gareth Aderyn', 'male', '1694', '', 'house-aderyn', { title: 'Graf des Tals der Milane seit 1720' }),
    person('dylis-blodyn', 'Dylis Blodyn', 'female', '1698', '1720'),
    person('dystan-pendrag', 'Dystan Pendrag', 'male', '1691', '1720', 'house-pendrag'),

    person('yvain-blodyn', 'Yvain Blodyn', 'male', '1694', '', BLODYN_HOUSE_ID, { title: 'Baron von Aberdail' }),
    person('bronwen-blaidd', 'Bronwen Blaidd', 'female', '1694', '', 'house-blaidd-tredegar', {
      worldPersonId: 'person--haus-blaidd--bronwen-blaidd'
    }),
    person('meggan-blodyn', 'Meggan Blodyn', 'female', '1700', ''),
    person('micah-arfordir', 'Micah Arfordir', 'male', '1695', '', 'house-arfordir'),
    person('talara-blodyn', 'Talara Blodyn', 'female', '1704', '1720'),
    person('tarrant-1703-arth', 'Tarrant Arth', 'male', '1703', '', 'house-arth', {
      familyRole: 'ward',
      title: 'Mündel Tarrants; mit Talara verlobt'
    }),

    person('wynfor-blodyn', 'Wynfor Blodyn', 'male', '1690', '1720'),
    person('delwen-trachwyll', 'Delwen Trachwyll', 'female', '1699', '1720', 'house-trachwyll'),
    person('siriol-blodyn', 'Siriol Blodyn', 'female', '1694', '1720'),
    person('trachmyr-serenoc', 'Trachmyr Serenoc', 'male', '1692', '1720', 'house-serenoc'),

  ],
  partnerships: [
    createMarriage('marriage-kerrylin-mordred', ...MORDRED_IDS),
    createMarriage('marriage-hoyer-naliandra', ...HOYER_IDS),
    createMarriage('marriage-caraf-gwrdnei', ...CARAF_IDS),
    createMarriage('marriage-breunor-myfanwy', ...BREUNOR_IDS),
    createMarriage('marriage-ceridwen-gwynfor', ...CERIDWEN_IDS),
    createMarriage('marriage-morfydd-breseal', ...MORFYDD_IDS),
    createMarriage('marriage-gwendolen-arthfael', ...GWENDOLEN_IDS),
    createMarriage('marriage-morwenna-gwalchmai', ...MORWENNA_IDS),
    createMarriage('marriage-tudurwen-ysbryd', ...TUDURWEN_IDS),
    createMarriage('marriage-gogyvwlch-sulwen', ...GOGYVWLCH_IDS),
    createMarriage('marriage-uryen-maygan', ...URYEN_IDS),
    createMarriage('marriage-dyvynwal-orfllaith', ...DYVYNWAL_IDS),
    createMarriage('marriage-angharad-gavin', ...ANGHARAD_IDS),
    createMarriage('marriage-mailgwin-aoirghe', ...MAILGWIN_IDS),
    createMarriage('marriage-howell-gwyneth', ...GWYNETH_IDS),
    createMarriage('marriage-myfanwy-kynwrig', ...MYFANWY_IDS),
    createMarriage('marriage-iorwerth-cerridwyn', ...IORWERTH_IDS),
    createMarriage('marriage-gruffydd-catryn', ...GRUFFYDD_IDS),
    createMarriage('marriage-blodeuwedd-lulach', ...BLODEUWEDD_IDS),
    createMarriage('marriage-kethtrwm-hildegard', ...KETHTRWM_IDS),
    createMarriage('marriage-olwyn-colwin', ...OLWYN_IDS),
    createMarriage('marriage-voreyn-lynfa', ...VOREYN_IDS),
    createMarriage('marriage-gendry-arryn', ...ARRYN_IDS),
    createMarriage('marriage-arvyn-trystan', ...ARVYN_IDS),
    createMarriage('marriage-rhys-blawd', ...BLAWD_IDS),
    createMarriage('marriage-tathal-bettrys', ...TATHAL_IDS),
    createMarriage('marriage-diafol-corryn', ...DIAFOL_IDS),
    createMarriage('marriage-telyn-hetwn', ...TELYN_IDS),
    createMarriage('marriage-jygallag-sheena', ...JYGALLAG_IDS),
    createMarriage('marriage-tarrant-luned', ...TARRANT_IDS),
    createMarriage('marriage-elin-mevyn', ...ELIN_IDS),
    createMarriage('marriage-fflur-bleddyn', ...BLEDDYN_IDS),
    createMarriage('marriage-afanen-grugyn', ...AFANEN_IDS),
    createMarriage('marriage-tanwen-kynwas', ...TANWEN_IDS),
    createMarriage('marriage-yhon-cerny', ...YHON_IDS),
    createMarriage('marriage-gareth-catrin', ...CATRIN_IDS),
    createMarriage('marriage-dystan-dylis', ...DYLIS_IDS),
    createMarriage('marriage-yvain-bronwen', ...BLODYN_ABERDAIL_FOUNDER_IDS),
    createMarriage('marriage-meggan-micah', ...MEGGAN_IDS),
    createMarriage('engagement-tarrant-talara', ...TALARA_IDS, {
      type: 'engagement',
      status: 'ended',
      notes: 'Tarrant Arth ist zugleich Tarrants Mündel und Talaras Verlobter; die Verbindung endete mit Talaras Tod 1720.'
    }),
    createMarriage('marriage-wynfor-delwen', ...WYNFOR_IDS),
    createMarriage('marriage-siriol-trachmyr', ...SIRIOL_IDS)
  ],
  parentages: [
    ...childrenOf(['hoyer-blodyn', 'caraf-blodyn'], MORDRED_IDS, 'marriage-kerrylin-mordred'),
    ...childrenOf(['breunor-blodyn', 'ceridwen-blodyn', 'morfydd-blodyn', 'gwendolen-blodyn', 'morwenna-blodyn', 'tudurwen-blodyn'], HOYER_IDS, 'marriage-hoyer-naliandra'),
    ...gapChildren(['gogyvwlch-blodyn', 'mieftagoet-blodyn', 'uryen-blodyn'], BREUNOR_IDS, 'marriage-breunor-myfanwy', 'gap-breunor-gogyvwlch'),
    ...gapChildren(['dyvynwal-blodyn', 'angharad-blodyn'], GOGYVWLCH_IDS, 'marriage-gogyvwlch-sulwen', 'gap-gogyvwlch-dyvynwal'),
    ...childrenOf(['mailgwin-blodyn', 'gwyneth-blodyn', 'myfanwy-1618-blodyn', 'iorwerth-blodyn', 'meuric-blodyn'], DYVYNWAL_IDS, 'marriage-dyvynwal-orfllaith'),
    ...childrenOf(['gruffydd-blodyn', 'blodeuwedd-blodyn'], MAILGWIN_IDS, 'marriage-mailgwin-aoirghe'),
    ...childrenOf(['kethtrwm-blodyn', 'siani-blodyn', 'olwyn-blodyn'], IORWERTH_IDS, 'marriage-iorwerth-cerridwyn'),
    ...childrenOf(['voreyn-blodyn', 'arryn-blodyn', 'arvyn-blodyn', 'blawd-blodyn'], GRUFFYDD_IDS, 'marriage-gruffydd-catryn'),
    ...childrenOf(['tathal-blodyn', 'diafol-blodyn', 'telyn-blodyn'], KETHTRWM_IDS, 'marriage-kethtrwm-hildegard'),
    ...childrenOf(['jygallag-blodyn', 'tarrant-blodyn', 'carys-blodyn', 'elin-blodyn'], VOREYN_IDS, 'marriage-voreyn-lynfa'),
    ...childrenOf(['bleddyn-blodyn', 'afanen-blodyn', 'tanwen-blodyn'], TATHAL_IDS, 'marriage-tathal-bettrys'),
    ...childrenOf(['yhon-blodyn', 'catrin-blodyn', 'dylis-blodyn'], JYGALLAG_IDS, 'marriage-jygallag-sheena'),
    ...childrenOf(['yvain-blodyn', 'meggan-blodyn', 'talara-blodyn'], TARRANT_IDS, 'marriage-tarrant-luned'),
    ...childrenOf(['wynfor-blodyn', 'siriol-blodyn'], BLEDDYN_IDS, 'marriage-fflur-bleddyn'),
    ...childrenOf(['tarrant-1703-arth'], TARRANT_IDS, 'marriage-tarrant-luned', {
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Tarrant Arth ist ein aufgenommener Mündel Tarrants und kein leibliches Kind der Blodyn.'
    }),
  ],
  cadetBranches: [
    createCadetHouseBranch({
      id: 'cadet-blodyn-talgarth-yhon',
      name: "Haus Blodyn O'Talgarth",
      subtitle: 'Talgarther Linie Yhon Blodyns',
      parentPartnershipId: 'marriage-yhon-cerny',
      houseId: 'house-blodyn-talgarth',
      targetFamilyId: 'haus-blodyn-talgarth',
      emblem: BLODYN_EMBLEM,
      crestFrame: 'gold',
      notes: 'Der Knoten hängt direkt unter Yhon Blodyn und Cerny Dianc. Cerys, Griffin und das Mündel Telyn werden ausschließlich in der Talgarther Akte weitergeführt.'
    }),
    createCadetHouseBranch({
      id: 'cadet-blodyn-aberdail-yvain',
      name: 'Haus Blodyn von Aberdail',
      subtitle: 'Baronie Blutklaue',
      parentPartnershipId: 'marriage-yvain-bronwen',
      houseId: 'house-blodyn-aberdail',
      targetFamilyId: 'haus-blodyn-aberdail',
      emblem: BLODYN_EMBLEM,
      crestFrame: 'gold',
      notes: 'Der Knoten hängt direkt unter Yvain Blodyn und Bronwen Blaidd. Dalvin und Erec werden ausschließlich im separaten Aberdail-Stammbaum weitergeführt.'
    }),
    marriedAway('married-away-blaidd-ceridwen', "Haus Blaidd O'Branon", 'marriage-ceridwen-gwynfor', 'house-blaidd', HOUSE_EMBLEMS.blaidd),
    {
      ...marriedAway('married-away-dobhar-morfydd', "Haus Dyfrgi O'Mynyddharbwr", 'marriage-morfydd-breseal', 'house-dyfrgi', KLAUENINSEL_HOUSE_EMBLEMS.dyfrgi, 'haus-dyfrgi'),
      extensions: { registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem'] }
    },
    marriedAway('married-away-dianc-gwendolen', 'Haus Dianc', 'marriage-gwendolen-arthfael', 'house-dianc'),
    marriedAway('married-away-trachwyll-morwenna', 'Haus Trachwyll', 'marriage-morwenna-gwalchmai', 'house-trachwyll'),
    marriedAway('married-away-arfordir-tudurwen', 'Haus Arfordir', 'marriage-tudurwen-ysbryd', 'house-arfordir'),
    marriedAway('married-away-trachwyll-angharad', 'Haus Trachwyll', 'marriage-angharad-gavin', 'house-trachwyll'),
    marriedAway('married-away-draig-gwyneth', 'Haus Draig', 'marriage-howell-gwyneth', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-dianc-myfanwy', 'Haus Dianc', 'marriage-myfanwy-kynwrig', 'house-dianc'),
    marriedAway('married-away-dubglais-blodeuwedd', 'Haus Dubglais', 'marriage-blodeuwedd-lulach', 'house-dubglais'),
    marriedAway('married-away-gwenyen-olwyn', 'Haus Gwenyen', 'marriage-olwyn-colwin', 'house-gwenyen'),
    marriedAway('married-away-wylan-arryn', 'Haus Wylan', 'marriage-gendry-arryn', 'house-wylan', HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-blaidd-arvyn', "Haus Blaidd O'Branon", 'marriage-arvyn-trystan', 'house-blaidd', HOUSE_EMBLEMS.blaidd),
    marriedAway('married-away-arth-blawd', 'Haus Arth', 'marriage-rhys-blawd', 'house-arth', HOUSE_EMBLEMS.arth),
    {
      ...marriedAway('married-away-dyfrgi-elin', "Haus Dyfrgi O'Caer Cryftlawd", 'marriage-elin-mevyn', 'house-dyfrgi-caer-cryftlawd', KLAUENINSEL_HOUSE_EMBLEMS.dyfrgi, 'haus-dyfrgi-caer-cryftlawd'),
      extensions: { registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem'] }
    },
    marriedAway('married-away-drewi-afanen', 'Haus Drewi', 'marriage-afanen-grugyn', 'house-drewi'),
    marriedAway('married-away-morlais-tanwen', 'Haus Morlais', 'marriage-tanwen-kynwas', 'house-morlais'),
    marriedAway('married-away-aderyn-catrin', 'Haus Aderyn', 'marriage-gareth-catrin', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-pendrag-dylis', 'Haus Pendrag', 'marriage-dystan-dylis', 'house-pendrag', HOUSE_EMBLEMS.pendrag),
    marriedAway('married-away-arfordir-meggan', "Haus Arfordir O'Aberdail", 'marriage-meggan-micah', 'house-arfordir', KLAUENINSEL_HOUSE_EMBLEMS.arfordir, 'haus-arfordir-aberdail'),
    marriedAway('married-away-serenoc-siriol', 'Haus Serenoc', 'marriage-siriol-trachmyr', 'house-serenoc')
  ],
  timeJumps: [
    {
      id: 'gap-breunor-gogyvwlch',
      parentPartnershipId: 'marriage-breunor-myfanwy',
      childIds: ['gogyvwlch-blodyn', 'mieftagoet-blodyn', 'uryen-blodyn'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Erster absoluter serieller Generationentrenner der Blodyn-Hauptlinie.',
      extensions: {}
    },
    {
      id: 'gap-gogyvwlch-dyvynwal',
      parentPartnershipId: 'marriage-gogyvwlch-sulwen',
      childIds: ['dyvynwal-blodyn', 'angharad-blodyn'],
      years: 0,
      fromYear: '????',
      toYear: '1599',
      label: 'Die datierte Überlieferung setzt 1599 wieder ein',
      notes: 'Zweiter absoluter serieller Generationentrenner; er folgt innerhalb des Gogyvwlch-Astes auf den ersten Sprung.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-kerrylin-mordred',
    houseId: BLODYN_HOUSE_ID,
    crestSubtitle: 'Königshaus von Lyndor',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'mordred-blodyn',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Verbindungen, Amtsfolge und Portraitquellen folgen der bereitgestellten Blodyn-Tabelle und ihrer eingebetteten Stammbaumgrafik. Die zwei Auslassungen sind als strikt serielle Generationentrenner Breunor–Gogyvwlch und Gogyvwlch–Dyvynwal modelliert. Sämtliche belegten Ehen von Blodyn-Frauen in andere Häuser besitzen einen direkten Wegverheiratet-Knoten. Tarrant Arth ist als aufgenommenes Mündel und nicht als leibliches Blodyn-Kind erfasst. Die ausdrückliche frühere Korrektur Arryn Blodyn hat Vorrang vor der Namensvariante Caryln in dieser Quelle. Gwyneths Geburtsjahr bleibt wegen der Draig-Gegenakte und ihrer 1617/1619 geborenen Kinder bei 1600. Yhons Kinder Cerys und Griffin sowie sein Mündel Telyn stehen ausschließlich in der verknüpften Talgarther Akte; Yvains Nachkommen Dalvin und Erec ausschließlich in der verknüpften Aberdailer Akte. Dadurch wird keine der beiden Nachkommenschaften in zwei Diagrammen weitergeführt. Morfydds Ehe mit Breseal führt zum gegründeten Haus Dyfrgi in Mynyddharbwr; Elins Ehe mit Mervyn verlinkt dagegen zur neuen Caer-Cryftlawd-Linie. Die ältere technische ID mevyn-dyfrgi bleibt stabil, während die sichtbare Quellschreibweise Mervyn verwendet wird.',
    blankFamily: false,
    sourceRevision: 3,
    registryTombstones: {
      persons: ['cerys-blodyn', 'griffin-blodyn', 'telyn-diafol'],
      parentages: ['parentage-cerys-blodyn', 'parentage-griffin-blodyn', 'parentage-telyn-diafol']
    }
  }
});
