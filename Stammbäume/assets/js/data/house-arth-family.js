import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CENYR_COUNTY_HOUSE_PROFILES } from './cenyr-county-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { KLAUENINSEL_HOUSE_EMBLEMS } from './klaueninseln-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
  arfordir: KLAUENINSEL_HOUSE_EMBLEMS.arfordir,
  crafanc: KLAUENINSEL_HOUSE_EMBLEMS.crafanc,
  cwningod: KLAUENINSEL_HOUSE_EMBLEMS.cwningod,
  dianc: KLAUENINSEL_HOUSE_EMBLEMS.dianc,
  eirth: KLAUENINSEL_HOUSE_EMBLEMS.eirth,
  morthwyll: KLAUENINSEL_HOUSE_EMBLEMS.morthwyll,
  pawen: KLAUENINSEL_HOUSE_EMBLEMS.pawen,
  selwyn: KLAUENINSEL_HOUSE_EMBLEMS.selwyn,
  unigol: KLAUENINSEL_HOUSE_EMBLEMS.unigol,
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  brithyll: GRAUE_WEITE_HOUSE_EMBLEMS.brithyll,
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil,
  pendrag: 'assets/images/houses/Vortigerns Ruh/haus-pendrag.png',
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  wivern: GRAUE_WEITE_HOUSE_EMBLEMS.wivern
});

const ARTH_HOUSE_ID = 'house-arth';

const HOUSE_HEAD_IDS = new Set([
  'caradoc-arth',
  'rhun-arth',
  'cadfael-ancient-arth',
  'tarrant-ancient-arth',
  'caradoc-line-arth',
  'traharyan-arth',
  'gwalchgwyn-arth',
  'haul-arth',
  'rhydderch-arth',
  'run-arth',
  'parzifal-arth'
]);

const HEIR_IDS = new Set(['rhydian-arth']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = ARTH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_ARTH_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === ARTH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    ...(emblem ? { extensions: { registryManagedFields: ['name', 'emblem'] } } : {})
  };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

function gapChildren(childIds, parentIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, parentIds, partnershipId, {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Die Quelle markiert zwischen diesem Paar und den genannten Nachkommen nicht einzeln überlieferte Generationen.',
    extensions: { timeJumpId }
  });
}

function claimedChildren(childIds, parentIds, partnershipId) {
  return childrenOf(childIds, parentIds, partnershipId, {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Die Seitenlinie ist durch die Quelle belegt; da Zeitsprünge absolute serielle Trenner sind, wird die parallele Auslassungsmarke nicht als eigener Diagrammknoten wiederholt.'
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

const FOUNDER_IDS = ['caradoc-arth', 'gwenhwyfar-dreigiau'];
const RHUN_IDS = ['rhun-arth', 'rhoslyn-ancient-aderyn'];
const RHODHRI_IDS = ['rhodhri-arth', 'dearbhla-follmhar'];
const HEWET_IDS = ['hewet-arth', 'teaganach-follmhar'];
const AFANEN_ANCIENT_IDS = ['afanen-arth', 'cynwrig-ancient-pysgod'];
const CADFAEL_ANCIENT_IDS = ['cadfael-ancient-arth', 'oideach-diuid'];
const DENAWAL_ANCIENT_IDS = ['denawal-ancient-arth', 'beileag-lockart'];
const LAMORAK_IDS = ['lamorak-arth', 'mared-unknown'];
const TARRANT_ANCIENT_IDS = ['tarrant-ancient-arth', 'hadhbh-diuid'];
const PARZIFAL_ANCIENT_IDS = ['parzifal-ancient-arth', 'banbhin-haigh'];
const ARTGAL_IDS = ['artgal-arth', 'amdarch-unknown'];
const LYNFA_ANCIENT_IDS = ['lynfa-ancient-arth', 'faolan-armhair'];
const CARADOC_LINE_IDS = ['caradoc-line-arth', 'glaodhach-lockart'];
const GALESHIN_ANCIENT_IDS = ['galeshin-ancient-arth', 'arianhrod-unknown'];
const TRAHARYAN_IDS = ['traharyan-arth', 'aranrhod-pysgod'];
const TRAHAERN_IDS = ['trahaern-arth', 'ceridwen-pawen'];
const GWALCHGWYN_IDS = ['gwalchgwyn-arth', 'arglwyddes-aderyn'];
const ISOBEL_IDS = ['isobel-1614-arth', 'sadwrn-pawen'];
const WENONAH_IDS = ['wenonah-arth', 'cynwrig-crafanc'];
const DYNGANNON_IDS = ['dyngannon-arth', 'rhianedd-dienyddiwr'];
const HAUL_IDS = ['haul-arth', 'fionnghuala-nuadat'];
const FFRAID_IDS = ['ffraid-arth', 'gareth-dianc'];
const GALAHAD_IDS = ['galahad-arth', 'dafyddwen-brithyll'];
const HEDDWEN_IDS = ['heddwen-arth', 'sayres-morthwyll'];
const MADOC_IDS = ['madoc-arth', 'hafwen-draig'];
const RHYDDERCH_IDS = ['rhydderch-arth', 'talaith-morfil'];
const RHYS_IDS = ['rhys-arth', 'blawd-blodyn'];
const RIAN_IDS = ['rian-arth', 'sath-cwningod'];
const RHYNNON_IDS = ['rhynnon-arth', 'kyndra-crafanc'];
const TARIAN_IDS = ['tarian-arth', 'brac-pawen'];
const AFANEN_1660_IDS = ['afanen-1660-arth', 'elisud-crafanc'];
const FFODOR_IDS = ['ffodor-arth', 'ffionwen-penderyn'];
const RUN_IDS = ['run-arth', 'morfadd-arth'];
const DOMNALL_IDS = ['domnall-arth', 'gwenfrewi-pawen'];
const DENAWAL_1680_IDS = ['denawal-1680-arth', 'dolena-trachwyll'];
const LLEWELLA_IDS = ['llewella-arth', 'gingalain-1671-pysgod'];
const MELYN_IDS = ['melyn-arth', 'gwalchgwyn-saethwyr'];
const AFAL_IDS = ['afal-arth', 'delyth-gwyvern'];
const AFAL_AFFAIR_IDS = ['afal-arth', 'ysbail-cenyr'];
const TEGWEN_IDS = ['tegwen-arth', 'morgan-selwyn'];
const GRIFF_IDS = ['griff-arth', 'jowna-arfordir'];
const CADFAEL_1681_IDS = ['cadfael-1681-arth', 'gwendolen-marwolaeth'];
const GWENNAN_IDS = ['gwennan-arth', 'cerdd-wivern'];
const PARZIFAL_IDS = ['parzifal-arth', 'ceridwen-1700-grawn'];
const ISOLDE_IDS = ['isolde-arth', 'tristan-pendrag'];
const ESYLLT_AFFAIR_IDS = ['esyllt-arth', 'owain-draig'];
const OLWEN_IDS = ['olwen-arth', 'melwas-crafanc'];
const TARRANT_1703_IDS = ['tarrant-1703-arth', 'talara-blodyn'];
const GWRHYR_IDS = ['gwrhyr-arth', 'findabair-mata'];
const LYNFA_1696_IDS = ['lynfa-1696-arth', 'derwyn-dyngwn'];
const TIWLIP_IDS = ['tiwlip-arth', 'galeshin-cwningod'];
const ALED_IDS = ['aled-arth', 'hiolair-morgacht'];
const SYLVIA_AFFAIR_IDS = ['sylvia-cenyr', 'owain-draig'];
const SIEFFRE_IDS = ['sieffre-arth', 'cerridwyn-grael'];
const DENAWAL_1724_IDS = ['denawal-1724-arth', 'hildegard-wargh'];

export const HOUSE_ARTH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-arth',
    title: "Haus Arth O'Talgarth",
    motto: 'Dros y rheng!',
    description: 'Das volksnahe Grafengeschlecht von Talgarth auf den nördlichen Klaueninseln, geprägt durch Rittertum, Küstenverteidigung und Seefahrt.',
    emblem: HOUSE_EMBLEMS.arth,
    houseProfile: CENYR_COUNTY_HOUSE_PROFILES.arth
  },
  houses: [
    house(ARTH_HOUSE_ID, 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-dreigiau', 'Haus Dreigiau'),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-follmhar', 'Haus Follmhar'),
    house('house-pysgod', 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-diuid', 'Haus Diuid'),
    house('house-lockart', 'Haus Lockart'),
    house('house-unbekannt-mared', 'Unbekanntes Haus'),
    house('house-haigh', 'Haus Haigh'),
    house('house-unbekannt-amdarch', 'Unbekanntes Haus'),
    house('house-armhair', 'Haus Ardmhair'),
    house('house-unbekannt-arianhrod', 'Unbekanntes Haus'),
    house('house-pawen', 'Haus Pawen', HOUSE_EMBLEMS.pawen),
    house('house-crafanc', 'Haus Crafanc', HOUSE_EMBLEMS.crafanc),
    house('house-cwningod', 'Haus Cwningod', HOUSE_EMBLEMS.cwningod),
    house('house-unigol', 'Haus Unigol', HOUSE_EMBLEMS.unigol),
    house('house-dienyddiwr', 'Haus Dienyddiwr'),
    house('house-nuadat', 'Haus Nuadat'),
    house('house-dianc', 'Haus Dianc', HOUSE_EMBLEMS.dianc),
    house('house-brithyll', 'Haus Brithyll', HOUSE_EMBLEMS.brithyll),
    house('house-morthwyll', 'Haus Morthwyl', HOUSE_EMBLEMS.morthwyll),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-morfil', 'Haus Morfil', HOUSE_EMBLEMS.morfil),
    house('house-blodyn', 'Haus Blodyn'),
    house('house-eirth', 'Haus Eirth', HOUSE_EMBLEMS.eirth),
    house('house-penderyn', 'Haus Penderyn'),
    house('house-trachwyll', 'Haus Trachwyll'),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-gwyvern', 'Haus Gwyvern'),
    house('house-cenyr', "Haus O'Cenyr"),
    house('house-selwyn', 'Haus Sélwyn', HOUSE_EMBLEMS.selwyn),
    house('house-arfordir', 'Haus Arfordir', HOUSE_EMBLEMS.arfordir),
    house('house-marwolaeth', 'Haus Marwolaeth'),
    house('house-wivern', 'Haus Wivern', HOUSE_EMBLEMS.wivern),
    house('house-grawn', 'Haus Grawn'),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-mata', 'Haus Mata'),
    house('house-dyngwn', 'Haus Dyngwn'),
    house('house-morgacht', 'Haus Mórgacht'),
    house('house-grael', 'Haus Grael'),
    house('house-wargh', 'Haus Wargh')
  ],
  persons: [
    person('caradoc-arth', 'Caradoc Arth', 'male', '????', '????', ARTH_HOUSE_ID, { title: 'Stammvater des Hauses Arth' }),
    person('gwenhwyfar-dreigiau', 'Gwenhwyfar Dreigiau', 'female', '????', '????', 'house-dreigiau'),
    person('rhun-arth', 'Rhun Arth', 'male', '????', '????', ARTH_HOUSE_ID, { title: 'Ehemaliger Graf von Talgarth' }),
    person('rhodhri-arth', 'Rhodhri Arth', 'male', '????', '????'),
    person('hewet-arth', 'Hewet Arth', 'male', '????', '????'),
    person('rhoslyn-ancient-aderyn', 'Rhoslyn Aderyn', 'female', '????', '????', 'house-aderyn'),
    person('dearbhla-follmhar', 'Dearbhla Follmhar', 'female', '????', '????', 'house-follmhar'),
    person('teaganach-follmhar', 'Teaganach Follmhar', 'female', '????', '????', 'house-follmhar'),

    person('afanen-arth', 'Afanen Arth', 'female', '????', '????'),
    person('cynwrig-ancient-pysgod', 'Cynwrig Pysgod', 'male', '????', '????', 'house-pysgod', {
      notes: 'Die Arth-Tabelle nennt ihn Griflet; die Pysgod-Oberhauptfolge und Gegenakte identifizieren dieselbe Weltperson als Cynwrig.'
    }),
    person('cadfael-ancient-arth', 'Cadfael Arth', 'male', '????', '????', ARTH_HOUSE_ID, { title: 'Ehemaliger Graf von Talgarth' }),
    person('oideach-diuid', 'Oideach Diuid', 'female', '????', '????', 'house-diuid'),
    person('denawal-ancient-arth', 'Denawal Arth', 'male', '????', '????'),
    person('beileag-lockart', 'Beileag Lockart', 'female', '????', '????', 'house-lockart'),
    person('lamorak-arth', 'Lamorak Arth', 'male', '????', '????'),
    person('mared-unknown', 'Mared', 'female', '????', '????', 'house-unbekannt-mared'),

    person('tarrant-ancient-arth', 'Tarrant Arth', 'male', '????', '????', ARTH_HOUSE_ID, { title: 'Ehemaliger Graf von Talgarth' }),
    person('hadhbh-diuid', 'Hadhbh Diuid', 'female', '????', '????', 'house-diuid'),
    person('parzifal-ancient-arth', 'Parzifal Arth', 'male', '????', '????'),
    person('banbhin-haigh', 'Banbhin Haigh', 'female', '????', '????', 'house-haigh'),
    person('artgal-arth', 'Artgal Arth', 'male', '????', '????'),
    person('amdarch-unknown', 'Amdarch', 'female', '????', '????', 'house-unbekannt-amdarch'),

    person('lynfa-ancient-arth', 'Lynfa Arth', 'female', '????', '????'),
    person('faolan-armhair', 'Faolan Ardmhair', 'male', '????', '????', 'house-armhair'),
    person('caradoc-line-arth', 'Caradoc Arth', 'male', '????', '????', ARTH_HOUSE_ID, { title: 'Ehemaliger Graf von Talgarth' }),
    person('glaodhach-lockart', 'Glaodhach Lockart', 'female', '????', '????', 'house-lockart'),
    person('galeshin-ancient-arth', 'Galeshin Arth', 'male', '????', '????'),
    person('arianhrod-unknown', 'Arianhrod', 'female', '????', '????', 'house-unbekannt-arianhrod'),

    person('traharyan-arth', 'Traharyan Arth', 'male', '1592', '1645', ARTH_HOUSE_ID, {
      title: 'Graf von Talgarth 1620–1645',
      notes: '1620 ist in der Oberhauptgalerie der Beginn seiner Amtszeit; die Personentabelle und Pysgod-Gegenakte nennen 1592 als Geburtsjahr.'
    }),
    person('aranrhod-pysgod', 'Aranrhod Pysgod', 'female', '1593', '1669', 'house-pysgod'),
    person('trahaern-arth', 'Trahaern Arth', 'male', '1594', '1669'),
    person('ceridwen-pawen', 'Ceridwen Pawen', 'female', '1595', '1662', 'house-pawen'),

    person('gwalchgwyn-arth', 'Gwalchgwyn Arth', 'male', '1612', '1660', ARTH_HOUSE_ID, { title: 'Graf von Talgarth 1645–1660' }),
    person('arglwyddes-aderyn', 'Arglwyddes Aderyn', 'female', '1614', '1666', 'house-aderyn'),
    person('isobel-1614-arth', 'Isobel Arth', 'female', '1614', '1658'),
    person('sadwrn-pawen', 'Sadwrn Pawen', 'male', '1614', '1670', 'house-pawen'),
    person('wenonah-arth', 'Wenonah Arth', 'female', '1615', '1647'),
    person('cynwrig-crafanc', 'Cynwrig Crafanc', 'male', '1617', '1677', 'house-crafanc'),
    person('dyngannon-arth', 'Dyngannon Arth', 'male', '1620', '1670'),
    person('rhianedd-dienyddiwr', 'Rhianedd Dienyddiwr', 'female', '1621', '1669', 'house-dienyddiwr'),

    person('haul-arth', 'Haul Arth', 'male', '1631', '1681', ARTH_HOUSE_ID, { title: 'Graf von Talgarth 1660–1681' }),
    person('fionnghuala-nuadat', 'Fionnghuala Nuadat', 'female', '1632', '', 'house-nuadat'),
    person('ffraid-arth', 'Ffraid Arth', 'female', '1633', '1688'),
    person('gareth-dianc', 'Gareth Dianc', 'male', '1635', '1700', 'house-dianc'),
    person('galahad-arth', 'Galahad Arth', 'male', '1642', '1708'),
    person('dafyddwen-brithyll', 'Dafyddwen Brithyll', 'female', '1642', '1719', 'house-brithyll', {
      extensions: { registryManagedFields: ['birth', 'death', 'status', 'portrait'] }
    }),
    person('heddwen-arth', 'Heddwen Arth', 'female', '1642', '1701', ARTH_HOUSE_ID, {
      title: 'Wegverheiratet an Haus Morthwyll',
      tags: ['Wegverheiratet']
    }),
    person('sayres-morthwyll', 'Sayres Morthwyll', 'male', '1639', '1706', 'house-morthwyll'),
    person('madoc-arth', 'Madoc Arth', 'male', '1643', '1722'),
    person('hafwen-draig', 'Hafwen Draig', 'female', '1644', '1708', 'house-draig'),

    person('rhydderch-arth', 'Rhydderch Arth', 'male', '1651', '1698', ARTH_HOUSE_ID, { title: 'Graf von Talgarth 1681–1698' }),
    person('talaith-morfil', 'Talaith Morfil', 'female', '1651', '????', 'house-morfil'),
    person('rhys-arth', 'Rhys Arth', 'male', '1653', ''),
    person('blawd-blodyn', 'Blawd Blodyn', 'female', '1652', '????', 'house-blodyn', {
      notes: 'Die Quelle druckt unmöglich 1952; anhand der Generation wurde der offensichtliche Jahrhundertfehler zu 1652 berichtigt.'
    }),
    person('rian-arth', 'Rian Arth', 'female', '1654', '1712'),
    person('sath-cwningod', 'Sath Cwningod', 'male', '1652', '1713', 'house-cwningod'),
    person('rhynnon-arth', 'Rhynnon Arth', 'male', '1655', '1720'),
    person('kyndra-crafanc', 'Kyndra Crafanc', 'female', '1655', '1701', 'house-crafanc', {
      notes: 'Die Quelle druckt unmöglich 1955; die Elterngeneration und das Todesjahr 1701 belegen 1655.',
      extensions: { registryManagedFields: ['worldPersonId', 'birth', 'death', 'status', 'houseId'] }
    }),
    person('tarian-arth', 'Tarian Arth', 'female', '1660', '1710'),
    person('brac-pawen', 'Brac Pawen', 'male', '1660', '', 'house-pawen'),
    person('afanen-1660-arth', 'Afanen Arth', 'female', '1660', ''),
    person('elisud-crafanc', 'Elisud Crafanc', 'male', '1661', '', 'house-crafanc'),
    person('ffodor-arth', 'Ffodor Arth', 'male', '1662', '1723'),
    person('ffionwen-penderyn', 'Ffionwen Penderyn', 'female', '1662', '1733', 'house-penderyn', {
      extensions: {
        registryManagedFields: ['worldPersonId', 'birth', 'death', 'status', 'houseId']
      }
    }),

    person('run-arth', 'Run Arth', 'male', '1669', '1720', ARTH_HOUSE_ID, {
      title: 'Graf von Talgarth 1698–1720',
      extensions: { chartPartnerMirrorForPartnershipIds: ['marriage-run-morfadd'] }
    }),
    person('morfadd-arth', 'Morfadd Arth', 'female', '1670', '', ARTH_HOUSE_ID, {
      extensions: { chartRepeatForPartnershipIds: ['marriage-run-morfadd'] }
    }),
    person('domnall-arth', 'Domnall Arth', 'male', '1672', '1720'),
    person('gwenfrewi-pawen', 'Gwenfrewi Pawen', 'female', '1678', '1720', 'house-pawen'),
    person('denawal-1680-arth', 'Denawal Arth', 'male', '1680', '1710'),
    person('dolena-trachwyll', 'Dolena Trachwyll', 'female', '1685', '1710', 'house-trachwyll'),
    person('llewella-arth', 'Llewella Arth', 'female', '1675', '1720'),
    person('gingalain-1671-pysgod', 'Gingalain Pysgod', 'male', '1671', '1720', 'house-pysgod'),
    person('melyn-arth', 'Melyn Arth', 'male', '1684', '1735', ARTH_HOUSE_ID, {
      notes: 'Geschlecht, Ehe und Nachkommen folgen der bereits ausgearbeiteten Saethwyr-Gegenakte.'
    }),
    person('gwalchgwyn-saethwyr', 'Gwalchgwyn Saethwyr', 'male', '1680', '', 'house-saethwyr'),
    person('afal-arth', 'Afal Arth', 'male', '1675', ''),
    person('delyth-gwyvern', 'Delyth Gwyvern', 'female', '1675', '1705', 'house-gwyvern'),
    person('ysbail-cenyr', "Ysbail O'Cenyr", 'female', '1680', '1710', 'house-cenyr', { familyRole: 'affair' }),
    person('tegwen-arth', 'Tegwen Arth', 'female', '1676', ''),
    person('morgan-selwyn', 'Morgan Selwyn', 'male', '1678', '', 'house-selwyn'),
    person('griff-arth', 'Griff Arth', 'male', '1680', '1696'),
    person('jowna-arfordir', 'Jowna Arfordir', 'female', '1680', '1696', 'house-arfordir'),
    person('cadfael-1681-arth', 'Cadfael Arth', 'male', '1681', '1740', ARTH_HOUSE_ID, {
      extensions: { registryManagedFields: ['death'] }
    }),
    person('gwendolen-marwolaeth', 'Gwendolen Marwolaeth', 'female', '1679', '', 'house-marwolaeth', {
      extensions: { registryManagedFields: ['birth'] }
    }),
    person('gwennan-arth', 'Gwennan Arth', 'female', '1678', '1700'),
    person('cerdd-wivern', 'Cerdd Wivern', 'male', '1676', '', 'house-wivern'),

    person('parzifal-arth', 'Parzifal Arth', 'male', '1694', '', ARTH_HOUSE_ID, { title: 'Graf von Talgarth seit 1720' }),
    person('ceridwen-1700-grawn', 'Ceridwen Grawn', 'female', '1700', '', 'house-grawn'),
    person('isolde-arth', 'Isolde Arth', 'female', '1696', ''),
    person('tristan-pendrag', 'Tristan Pendrag', 'male', '1694', '', 'house-pendrag'),
    person('esyllt-arth', 'Esyllt Arth', 'female', '1696', '????', ARTH_HOUSE_ID),
    person('owain-draig', 'Owain Draig', 'male', '1694', '', 'house-draig', {
      familyRole: 'affair',
      extensions: { chartRepeatForPartnershipIds: ['affair-owain-sylvia'] }
    }),
    person('olwen-arth', 'Olwen Arth', 'female', '1697', ''),
    person('melwas-crafanc', 'Melwas Crafanc', 'male', '1696', '', 'house-crafanc'),
    person('tarrant-1703-arth', 'Tarrant Arth', 'male', '1703', ''),
    person('talara-blodyn', 'Talara Blodyn', 'female', '1704', '1720', 'house-blodyn', {
      notes: 'Name, Haus und Lebensdaten sind in der nun ausgewerteten Blodyn-Gegenakte belegt; die frühere Arth-Tabelle ließ diese Verlobtenzelle leer.',
      extensions: { registryManagedFields: ['birth', 'death', 'status', 'portrait', 'notes'] }
    }),
    person('gwrhyr-arth', 'Gwrhyr Arth', 'male', '1695', ''),
    person('findabair-mata', 'Findabair Mata', 'female', '1699', '', 'house-mata'),
    person('lynfa-1696-arth', 'Lynfa Arth', 'female', '1696', ''),
    person('derwyn-dyngwn', 'Derwyn Dyngwn', 'male', '1694', '', 'house-dyngwn'),
    person('tiwlip-arth', 'Tiwlip Arth', 'female', '1697', '', ARTH_HOUSE_ID, {
      notes: 'Die Quelle druckt unmöglich 1967; die Geschwister- und Partnergeneration belegt 1697.'
    }),
    person('galeshin-cwningod', 'Galeshin Cwningod', 'male', '1694', '', 'house-cwningod'),
    person('aled-arth', 'Aled Arth', 'male', '1695', ''),
    person('hiolair-morgacht', 'Hiolair Mórgacht', 'female', '1701', '', 'house-morgacht'),
    person('sylvia-cenyr', "Sylvia O'Cenyr", 'female', '1695', '1719', 'house-cenyr', { familyRole: 'bastard' }),
    person('sieffre-arth', 'Sieffre Arth', 'male', '1700', ''),
    person('cerridwyn-grael', 'Cerridwyn Grael', 'female', '1706', '', 'house-grael'),

    person('rhydian-arth', 'Rhydian Arth', 'male', '1718', '', ARTH_HOUSE_ID, {
      title: 'Erster in der Erbfolge des Hauses Arth',
      notes: 'Die Erbfolge nennt Rhydian; eine untere Tabellenzeile verkürzt den Namen abweichend zu Rydian.'
    }),
    person('lynne-arth', 'Lynne Arth', 'female', '1718', ''),
    person('denawal-1724-arth', 'Denawal Arth', 'male', '1724', ''),
    person('hildegard-wargh', 'Hildegard Wargh', 'female', '1724', '', 'house-wargh'),
    person('amadia-draig', 'Amadia Draig', 'female', '1718', '', 'house-draig', { familyRole: 'bastard' }),
    person('gwylim-arth', 'Gwylim Arth', 'male', '1719', ''),
    person('senara-arth', 'Senara Arth', 'female', '1721', ''),
    person('bwlch-arth', 'Bwlch Arth', 'male', '1720', ''),
    person('siana-draig', 'Siana Draig', 'female', '1725', '', 'house-draig', { familyRole: 'bastard' }),
    person('fflam-arth', 'Fflam Arth', 'male', '1724', '')
  ],
  partnerships: [
    createMarriage('marriage-gwenhwyfar-caradoc', ...FOUNDER_IDS),
    createMarriage('marriage-rhun-rhoslyn', ...RHUN_IDS),
    createMarriage('marriage-rhodhri-dearbhla', ...RHODHRI_IDS),
    createMarriage('marriage-hewet-teaganach', ...HEWET_IDS),
    createMarriage('marriage-cynwrig-afanen', ...AFANEN_ANCIENT_IDS),
    createMarriage('marriage-cadfael-oideach', ...CADFAEL_ANCIENT_IDS),
    createMarriage('marriage-denawal-beileag', ...DENAWAL_ANCIENT_IDS),
    createMarriage('marriage-lamorak-mared', ...LAMORAK_IDS),
    createMarriage('marriage-tarrant-hadhbh', ...TARRANT_ANCIENT_IDS),
    createMarriage('marriage-parzifal-banbhin', ...PARZIFAL_ANCIENT_IDS),
    createMarriage('marriage-artgal-amdarch', ...ARTGAL_IDS),
    createMarriage('marriage-lynfa-faolan', ...LYNFA_ANCIENT_IDS),
    createMarriage('marriage-caradoc-glaodhach', ...CARADOC_LINE_IDS),
    createMarriage('marriage-galeshin-arianhrod', ...GALESHIN_ANCIENT_IDS),
    createMarriage('marriage-aranrhod-traharyan', ...TRAHARYAN_IDS),
    createMarriage('marriage-trahaern-ceridwen', ...TRAHAERN_IDS),
    createMarriage('marriage-gwalchgwyn-arglwyddes', ...GWALCHGWYN_IDS),
    createMarriage('marriage-isobel-sadwrn', ...ISOBEL_IDS),
    createMarriage('marriage-wenonah-cynwrig', ...WENONAH_IDS),
    createMarriage('marriage-dyngannon-rhianedd', ...DYNGANNON_IDS),
    createMarriage('marriage-haul-fionnghuala', ...HAUL_IDS),
    createMarriage('marriage-ffraid-gareth', ...FFRAID_IDS),
    createMarriage('marriage-galahad-dafyddwen', ...GALAHAD_IDS, {
      status: 'ended',
      end: '1708',
      extensions: { registryManagedFields: ['participantIds', 'type', 'status', 'end'] }
    }),
    createMarriage('marriage-heddwen-sayres', ...HEDDWEN_IDS, { status: 'ended', end: '1701' }),
    createMarriage('marriage-hafwen-madoc', ...MADOC_IDS),
    createMarriage('marriage-rhydderch-talaith', ...RHYDDERCH_IDS, { status: 'ended', end: '1698' }),
    createMarriage('marriage-rhys-blawd', ...RHYS_IDS),
    createMarriage('marriage-rian-sath', ...RIAN_IDS),
    createMarriage('marriage-rhynnon-kyndra', ...RHYNNON_IDS),
    createMarriage('marriage-tarian-brac', ...TARIAN_IDS),
    createMarriage('marriage-afanen-elisud', ...AFANEN_1660_IDS),
    createMarriage('marriage-ffodor-ffionwen', ...FFODOR_IDS),
    createMarriage('marriage-run-morfadd', ...RUN_IDS),
    createMarriage('marriage-domnall-gwenfrewi', ...DOMNALL_IDS),
    createMarriage('marriage-denawal-dolena', ...DENAWAL_1680_IDS),
    createMarriage('marriage-gingalain1671-llewella', ...LLEWELLA_IDS),
    createMarriage('marriage-gwalchgwyn-melyn', ...MELYN_IDS),
    createMarriage('marriage-delyth-afal', ...AFAL_IDS),
    createMarriage('affair-afal-ysbail', ...AFAL_AFFAIR_IDS, { type: 'affair', status: 'ended' }),
    createMarriage('marriage-tegwen-morgan', ...TEGWEN_IDS),
    createMarriage('engagement-griff-jowna', ...GRIFF_IDS, { type: 'engagement', status: 'ended' }),
    createMarriage('marriage-cadfael-gwendolen', ...CADFAEL_1681_IDS),
    createMarriage('marriage-gwennan-cerdd', ...GWENNAN_IDS, {
      status: 'ended',
      end: '1700',
      extensions: { registryManagedFields: ['participantIds', 'type', 'status', 'end'] }
    }),
    createMarriage('marriage-ceridwen-parzifal', ...PARZIFAL_IDS),
    createMarriage('marriage-tristan-isolde', ...ISOLDE_IDS),
    createMarriage('affair-owain-esyllt', ...ESYLLT_AFFAIR_IDS, { type: 'affair', status: 'ended' }),
    createMarriage('marriage-olwen-melwas', ...OLWEN_IDS),
    createMarriage('engagement-tarrant-talara', ...TARRANT_1703_IDS, {
      type: 'engagement', status: 'ended', notes: 'Die Verlobung ist ausschließlich in der eingebetteten Stammbaumgrafik eingezeichnet.'
    }),
    createMarriage('marriage-gwrhyr-findabair', ...GWRHYR_IDS),
    createMarriage('marriage-lynfa-derwyn', ...LYNFA_1696_IDS),
    createMarriage('marriage-tiwlip-galeshin', ...TIWLIP_IDS),
    createMarriage('marriage-aled-hiolair', ...ALED_IDS),
    createMarriage('affair-owain-sylvia', ...SYLVIA_AFFAIR_IDS, { type: 'affair', status: 'ended' }),
    createMarriage('marriage-sieffre-cerridwyn', ...SIEFFRE_IDS),
    createMarriage('engagement-denawal-hildegard', ...DENAWAL_1724_IDS, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['rhun-arth', 'rhodhri-arth', 'hewet-arth'], FOUNDER_IDS, 'marriage-gwenhwyfar-caradoc'),
    ...gapChildren(['afanen-arth', 'cadfael-ancient-arth'], RHUN_IDS, 'marriage-rhun-rhoslyn', 'gap-rhun-cadfael'),
    ...claimedChildren(['denawal-ancient-arth'], RHODHRI_IDS, 'marriage-rhodhri-dearbhla'),
    ...claimedChildren(['lamorak-arth'], HEWET_IDS, 'marriage-hewet-teaganach'),
    ...gapChildren(['tarrant-ancient-arth', 'parzifal-ancient-arth'], CADFAEL_ANCIENT_IDS, 'marriage-cadfael-oideach', 'gap-cadfael-tarrant'),
    ...claimedChildren(['artgal-arth'], DENAWAL_ANCIENT_IDS, 'marriage-denawal-beileag'),
    ...gapChildren(['lynfa-ancient-arth', 'caradoc-line-arth'], TARRANT_ANCIENT_IDS, 'marriage-tarrant-hadhbh', 'gap-tarrant-caradoc'),
    ...claimedChildren(['galeshin-ancient-arth'], PARZIFAL_ANCIENT_IDS, 'marriage-parzifal-banbhin'),
    ...gapChildren(['traharyan-arth', 'trahaern-arth'], CARADOC_LINE_IDS, 'marriage-caradoc-glaodhach', 'gap-caradoc-traharyan'),
    ...childrenOf(['gwalchgwyn-arth', 'isobel-1614-arth', 'wenonah-arth', 'dyngannon-arth'], TRAHARYAN_IDS, 'marriage-aranrhod-traharyan'),
    ...childrenOf(['haul-arth', 'ffraid-arth'], GWALCHGWYN_IDS, 'marriage-gwalchgwyn-arglwyddes'),
    ...childrenOf(['galahad-arth', 'heddwen-arth', 'madoc-arth'], DYNGANNON_IDS, 'marriage-dyngannon-rhianedd'),
    ...childrenOf(['rhydderch-arth', 'rhys-arth', 'rian-arth', 'rhynnon-arth'], HAUL_IDS, 'marriage-haul-fionnghuala'),
    ...childrenOf(['tarian-arth', 'afanen-1660-arth'], GALAHAD_IDS, 'marriage-galahad-dafyddwen'),
    ...childrenOf(['ffodor-arth'], MADOC_IDS, 'marriage-hafwen-madoc'),
    ...childrenOf(['run-arth', 'domnall-arth', 'denawal-1680-arth', 'llewella-arth', 'melyn-arth'], RHYDDERCH_IDS, 'marriage-rhydderch-talaith'),
    ...childrenOf(['afal-arth', 'morfadd-arth', 'tegwen-arth', 'griff-arth'], RHYS_IDS, 'marriage-rhys-blawd'),
    ...childrenOf(['cadfael-1681-arth', 'gwennan-arth'], FFODOR_IDS, 'marriage-ffodor-ffionwen'),
    ...childrenOf(['parzifal-arth', 'isolde-arth', 'esyllt-arth', 'olwen-arth', 'tarrant-1703-arth'], RUN_IDS, 'marriage-run-morfadd'),
    ...childrenOf(['gwrhyr-arth', 'lynfa-1696-arth', 'tiwlip-arth'], DOMNALL_IDS, 'marriage-domnall-gwenfrewi'),
    ...childrenOf(['aled-arth'], AFAL_IDS, 'marriage-delyth-afal'),
    ...childrenOf(['sylvia-cenyr'], AFAL_AFFAIR_IDS, 'affair-afal-ysbail', { legitimacy: 'illegitimate' }),
    ...childrenOf(['sieffre-arth'], CADFAEL_1681_IDS, 'marriage-cadfael-gwendolen'),
    ...childrenOf(['rhydian-arth', 'lynne-arth', 'denawal-1724-arth'], PARZIFAL_IDS, 'marriage-ceridwen-parzifal'),
    ...childrenOf(['amadia-draig'], ESYLLT_AFFAIR_IDS, 'affair-owain-esyllt', { legitimacy: 'illegitimate' }),
    ...childrenOf(['gwylim-arth', 'senara-arth'], GWRHYR_IDS, 'marriage-gwrhyr-findabair'),
    ...childrenOf(['bwlch-arth'], ALED_IDS, 'marriage-aled-hiolair'),
    ...childrenOf(['siana-draig'], SYLVIA_AFFAIR_IDS, 'affair-owain-sylvia', { legitimacy: 'illegitimate' }),
    ...childrenOf(['fflam-arth'], SIEFFRE_IDS, 'marriage-sieffre-cerridwyn')
  ],
  cadetBranches: [
    createCadetHouseBranch({ id: 'cadet-pawen-lamorak', name: 'Haus Pawen', parentPartnershipId: 'marriage-lamorak-mared', houseId: 'house-pawen', targetFamilyId: 'haus-pawen', emblem: HOUSE_EMBLEMS.pawen, notes: 'Lamorak Arth und Mared begründen Haus Pawen; der Knoten hängt direkt unter ihrem Paar.' }),
    createCadetHouseBranch({ id: 'cadet-crafanc-artgal', name: 'Haus Crafanc', parentPartnershipId: 'marriage-artgal-amdarch', houseId: 'house-crafanc', targetFamilyId: 'haus-crafanc', emblem: HOUSE_EMBLEMS.crafanc, notes: 'Artgal Arth und Amdarch begründen Haus Crafanc; der Knoten hängt direkt unter ihrem Paar.' }),
    createCadetHouseBranch({ id: 'cadet-cwningod-galeshin', name: 'Haus Cwningod', parentPartnershipId: 'marriage-galeshin-arianhrod', houseId: 'house-cwningod', targetFamilyId: 'haus-cwningod', emblem: HOUSE_EMBLEMS.cwningod, notes: 'Galeshin Arth und Arianhrod begründen Haus Cwningod; der Knoten hängt direkt unter ihrem Paar.' }),
    createCadetHouseBranch({ id: 'cadet-unigol-trahaern', name: 'Haus Unigol', parentPartnershipId: 'marriage-trahaern-ceridwen', houseId: 'house-unigol', targetFamilyId: 'haus-unigol', emblem: HOUSE_EMBLEMS.unigol, notes: 'Trahaern Arth und Ceridwen Pawen begründen Haus Unigol; der Knoten hängt direkt unter ihrem Paar.' }),
    marriedAway('married-away-morthwyll-heddwen', 'Haus Morthwyll', 'marriage-heddwen-sayres', 'house-morthwyll', HOUSE_EMBLEMS.morthwyll),
    createCadetHouseBranch({ id: 'cadet-eirth-rhynnon', name: 'Haus Eirth', parentPartnershipId: 'marriage-rhynnon-kyndra', houseId: 'house-eirth', targetFamilyId: 'haus-eirth', emblem: HOUSE_EMBLEMS.eirth, notes: 'Rhynnon Arth und Kyndra Crafanc begründen Haus Eirth; der Knoten hängt direkt unter ihrem Paar.' }),
    createCadetHouseBranch({ id: 'cadet-selwyn-tegwen', name: 'Haus Sélwyn', parentPartnershipId: 'marriage-tegwen-morgan', houseId: 'house-selwyn', targetFamilyId: 'haus-selwyn', emblem: HOUSE_EMBLEMS.selwyn, notes: 'Tegwen Arth und Morgan Selwyn begründen diese fortgeführte Hauslinie direkt unter ihrem Paar.' }),

    marriedAway('married-away-pysgod-afanen', 'Haus Pysgod', 'marriage-cynwrig-afanen', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-armhair-lynfa', 'Haus Ardmhair', 'marriage-lynfa-faolan', 'house-armhair'),
    marriedAway('married-away-pawen-isobel', 'Haus Pawen', 'marriage-isobel-sadwrn', 'house-pawen', HOUSE_EMBLEMS.pawen),
    marriedAway('married-away-crafanc-wenonah', 'Haus Crafanc', 'marriage-wenonah-cynwrig', 'house-crafanc', HOUSE_EMBLEMS.crafanc),
    marriedAway('married-away-dianc-ffraid', 'Haus Dianc', 'marriage-ffraid-gareth', 'house-dianc', HOUSE_EMBLEMS.dianc),
    marriedAway('married-away-cwningod-rian', 'Haus Cwningod', 'marriage-rian-sath', 'house-cwningod', HOUSE_EMBLEMS.cwningod),
    marriedAway('married-away-pawen-tarian', 'Haus Pawen', 'marriage-tarian-brac', 'house-pawen', HOUSE_EMBLEMS.pawen),
    marriedAway('married-away-crafanc-afanen1660', 'Haus Crafanc', 'marriage-afanen-elisud', 'house-crafanc', HOUSE_EMBLEMS.crafanc),
    marriedAway('married-away-pysgod-llewella', 'Haus Pysgod', 'marriage-gingalain1671-llewella', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-saethwyr-melyn', 'Haus Saethwyr', 'marriage-gwalchgwyn-melyn', 'house-saethwyr', HOUSE_EMBLEMS.saethwyr),
    marriedAway('married-away-pendrag-isolde', 'Haus Pendrag', 'marriage-tristan-isolde', 'house-pendrag', HOUSE_EMBLEMS.pendrag),
    marriedAway('married-away-crafanc-olwen', 'Haus Crafanc', 'marriage-olwen-melwas', 'house-crafanc', HOUSE_EMBLEMS.crafanc),
    marriedAway('married-away-dyngwn-lynfa1696', 'Haus Dyngwn', 'marriage-lynfa-derwyn', 'house-dyngwn'),
    marriedAway('married-away-cwningod-tiwlip', 'Haus Cwningod', 'marriage-tiwlip-galeshin', 'house-cwningod', HOUSE_EMBLEMS.cwningod),
    marriedAway('married-away-wivern-gwennan', 'Haus Wivern', 'marriage-gwennan-cerdd', 'house-wivern')
  ],
  timeJumps: [
    { id: 'gap-rhun-cadfael', parentPartnershipId: 'marriage-rhun-rhoslyn', childIds: ['afanen-arth', 'cadfael-ancient-arth'], years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: 'Erster absoluter serieller Generationentrenner der Arth-Hauptlinie.', extensions: {} },
    { id: 'gap-cadfael-tarrant', parentPartnershipId: 'marriage-cadfael-oideach', childIds: ['tarrant-ancient-arth', 'parzifal-ancient-arth'], years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: 'Zweiter absoluter serieller Generationentrenner der Arth-Hauptlinie.', extensions: {} },
    { id: 'gap-tarrant-caradoc', parentPartnershipId: 'marriage-tarrant-hadhbh', childIds: ['lynfa-ancient-arth', 'caradoc-line-arth'], years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: 'Dritter absoluter serieller Generationentrenner der Arth-Hauptlinie.', extensions: {} },
    { id: 'gap-caradoc-traharyan', parentPartnershipId: 'marriage-caradoc-glaodhach', childIds: ['traharyan-arth', 'trahaern-arth'], years: 0, fromYear: '????', toYear: '1592', label: 'Die datierte Überlieferung setzt 1592 wieder ein', notes: 'Vierter absoluter serieller Generationentrenner der Arth-Hauptlinie.', extensions: {} }
  ],
  lineage: {
    founderPartnershipId: 'marriage-gwenhwyfar-caradoc',
    houseId: ARTH_HOUSE_ID,
    crestSubtitle: 'Grafengeschlecht',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'caradoc-arth',
    orientation: 'vertical',
    ancestorDepth: 28,
    descendantDepth: 28,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Beziehungen, Amtsfolge und Portraitquellen folgen der bereitgestellten Arth-Tabelle sowie ihrer eingebetteten Stammbaumgrafik. Vier Auslassungen bilden die eine strikt serielle Hauptlinie Rhun–Cadfael–Tarrant–Caradoc–Traharyan; parallele Auslassungszeichen der Seitenlinien werden gemäß der absoluten Zeitsprungregel als beanspruchte Abstammungen dokumentiert, aber nicht als konkurrierende Diagrammknoten wiederholt. Die ausdrücklich bestätigten Hausgründungen Pawen, Crafanc, Cwningod, Unigol, Eirth und Selwyn hängen jeweils direkt unter ihrem Gründerpaar. Haus Morthwyll ist dagegen ein eigenständiges Vasallenhaus der Arth: Heddwen Arth wird deshalb an Sayres Morthwyll wegverheiratet und erzeugt keinen Kadettenhausknoten. Sämtliche übrigen Arth-Linien, die durch Ehe in einem anderen Haus weiterlaufen, besitzen einen direkten Wegverheiratet-Knoten. Offensichtliche Jahrhundertfehler 1952/1955/1967 wurden zu 1652/1655/1697 berichtigt und direkt an den Personen notiert; 1620 bei Traharyan ist ein Amtsbeginn. Die Pysgod-Gegenakte löst den Widerspruch Griflet/Cynwrig zugunsten Cynwrigs, die Saethwyr-Gegenakte Melyns Geschlecht und Familie. Talara Blodyn ist nur in der eingebetteten Grafik benannt. Die Marwolaeth-Gegenakte ergänzt Gwendolens Geburtsjahr 1679 und Cadfaels Todesjahr 1740. Caradocs individuelle Tumblr-Quelle ist nicht mehr abrufbar und wird nicht durch das Portrait seines späteren Namensvetters ersetzt. Generische Silhouetten und unbenannte Abschlussplatzhalter wurden nicht als individuelle Portraits oder zusätzliche Ehen importiert.',
    blankFamily: false,
    sourceRevision: 10,
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
