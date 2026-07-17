import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { PORTRAIT_PLACEHOLDERS } from '../config/portrait-placeholders.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  arwydd: 'assets/images/houses/haus-arwydd.png',
  draig: 'assets/images/houses/haus-draig.png',
  dreigiau: PORTRAIT_PLACEHOLDERS.crest,
  gafyr: 'assets/images/houses/haus-gafyr.png',
  gwefrydd: 'assets/images/houses/haus-gwefrydd.png',
  gwyvern: 'assets/images/houses/haus-gwyvern.png',
  saethwyr: 'assets/images/houses/haus-saethwyr.png',
  wyrm: 'assets/images/houses/haus-wyrm.png'
});

const DRAIG_HOUSE_ID = 'house-draig';
const HOUSE_HEAD_IDS = new Set([
  'celtigern-draig',
  'artus-draig',
  'godwyn-draig',
  'morholt-draig',
  'marared-draig',
  'gruffyd-draig',
  'neithon-1136-draig',
  'iorwerth-draig',
  'kenehyr-draig',
  'cynan-draig',
  'cunedda-draig',
  'cadwalladar-draig',
  'howell-draig',
  'merfyn-draig',
  'cahir-draig',
  'rhodri-draig',
  'galahad-draig'
]);
const MAIN_LINE_IDS = new Set([
  'anaraut-draig',
  'idwal-draig',
  'tudwal-draig',
  'neithon-1718-draig',
  'gawain-draig'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = DRAIG_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_DRAIG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === DRAIG_HOUSE_ID ? 'core' : 'married'),
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

const FOUNDER_IDS = ['celtigern-draig', 'findabhair-cumhail'];
const DREIGIAU_ROOT_IDS = ['gwyrthern-dreigiau', 'rhonwen-dreigiau', 'kerrylin-dreigiau'];
const GWYRTHERN_IDS = ['gwyrthern-dreigiau', 'gwendolyn-mwnci'];
const ARTUS_IDS = ['artus-draig', 'tanwen-pendrag'];
const GODWYN_IDS = ['godwyn-draig', 'arianwyn-pendrag'];
const MORHOLT_IDS = ['morholt-draig', 'gwyneira-pendrag'];
const MARARED_IDS = ['marared-draig', 'cerridwyn-pendrag'];
const MYRDDIN_IDS = ['myrddin-draig', 'bethwyn-nimue-grael'];
const IORWERTH_IDS = ['iorwerth-draig', 'gormlaith-urquhart'];
const KENEHYR_IDS = ['kenehyr-draig', 'teswyn-grael'];
const CYNAN_IDS = ['cynan-draig', 'beibhinn-cumhail'];
const CUNEDDA_IDS = ['cunedda-draig', 'arianwen-pendragon'];
const CADWALLADAR_IDS = ['cadwalladar-draig', 'tuilelaith-duibhne'];
const HOWELL_IDS = ['howell-draig', 'gwyneth-blodyn'];
const CADFAEL_IDS = ['cadfael-draig', 'sioned-dyngwn'];
const MERFYN_IDS = ['merfyn-draig', 'llinos-pysgod'];
const RHIWALLON_IDS = ['rhiwallon-draig', 'fidelma-airt'];
const CAHIR_IDS = ['cahir-draig', 'alawen-cumhail'];
const GETHIN_IDS = ['gethin-draig', 'gwenllian-saethwyr'];
const TRAHERN_IDS = ['trahern-draig', 'cerys-marwolaeth'];
const RHODRI_IDS = ['rhodri-draig', 'angharad-pendrag'];
const MEURIG_IDS = ['meurig-draig', 'heledd-gwyvern'];
const TRAYVON_IDS = ['trayvon-draig', 'rihanna-ceirwynn'];
const ODYAR_IDS = ['odyar-draig', 'beibhinn-eirce'];
const MAREDUDD_IDS = ['maredudd-draig', 'alaw-grawn'];
const GALAHAD_IDS = ['galahad-draig', 'gwendolyn-aderyn'];
const RHYS_IDS = ['rhys-draig', 'brona-eisenherz'];
const STEFFAN_IDS = ['steffan-draig', 'branwen-gwefrydd'];
const CADFAN_IDS = ['cadfan-draig', 'wynonna-fiachrach'];

export const HOUSE_DRAIG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-draig',
    title: 'Haus Draig',
    motto: '',
    description: 'Die überlieferte Grafenlinie des Hauses Draig von Celtigern, dem Überlebenden Avalons, bis zur Erbfolge der Gegenwart im Jahr 1740.',
    emblem: HOUSE_EMBLEMS.draig,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.draig
  },
  houses: [
    house(DRAIG_HOUSE_ID, 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-dreigiau', 'Haus Dreigiau', HOUSE_EMBLEMS.dreigiau),
    house('house-mwnci', 'Haus Mwnci'),
    house('house-paun', 'Haus Paun'),
    house('house-teigr', 'Haus Teigr'),
    house('house-cumhail', 'Haus Cumhail'),
    house('house-pendrag', 'Haus Pendrag'),
    house('house-conbhron', 'Haus Conbhrón'),
    house('house-talamh', 'Haus Talamh'),
    house('house-illewod', 'Haus Illewod'),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-grael', 'Haus Grael'),
    house('house-aderyn', 'Haus Aderyn'),
    house('house-tanwyn', 'Haus Tanwyn'),
    house('house-roth', 'Haus Roth'),
    house('house-neidr', 'Haus Neidr'),
    house('house-urquhart', 'Haus Urquhart'),
    house('house-duibhne', 'Haus Duibhne'),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-dyngwn', 'Haus Dyngwn'),
    house('house-pysgod', 'Haus Pysgod'),
    house('house-airt', 'Haus Airt'),
    house('house-arth', 'Haus Arth'),
    house('house-blodyn', 'Haus Blodyn'),
    house('house-diulb', 'Haus Diulb'),
    house('house-ness', 'Haus Ness'),
    house('house-marwolaeth', 'Haus Marwolaeth'),
    house('house-crefyddol', 'Haus Crefyddol'),
    house('house-wylan', 'Haus Wylan'),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-ceirwynn', 'Haus Ceirwynn'),
    house('house-eirce', 'Haus Eirce'),
    house('house-grawn', 'Haus Grawn'),
    house('house-illysywen', 'Haus Illysywen', 'assets/images/houses/haus-illysywen.png'),
    house('house-eisenherz', 'Haus Eisenherz'),
    house('house-cenyr', 'Haus Cenyr'),
    house('house-argall', 'Haus Argall'),
    house('house-fiachrach', 'Haus Fiachrach'),
    house('house-arwydd', 'Haus Arwydd', HOUSE_EMBLEMS.arwydd),
    house('house-varulv', 'Haus Varulv')
  ],
  persons: [
    // Ursprungshaus Dreigiau und Celtigerns unmittelbare Verwandtschaft
    person('gwyrthern-dreigiau', 'Gwyrthern', 'male', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('gwendolyn-mwnci', 'Gwendolyn Mwnci', 'female', '????', '????', 'house-mwnci'),
    person('rhonwen-dreigiau', 'Rhonwen', 'female', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('dyngannon-paun', 'Dyngannon Paun', 'male', '????', '????', 'house-paun'),
    person('kerrylin-dreigiau', 'Kerrylin', 'female', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('mordred-blodyn', 'Mordred Blodyn', 'male', '????', '????', 'house-blodyn'),
    person('vortimer-dreigiau', 'Vortimer', 'male', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('isolde-teigr', 'Isolde Teigr', 'female', '????', '????', 'house-teigr'),
    person('vortigern-pendrag', 'Vortigern', 'male', '????', '????', 'house-pendrag', { familyRole: 'core' }),
    person('rhiannon-aderyn', 'Rhiannon Aderyn', 'female', '????', '????', 'house-aderyn'),
    person('gwenhwyfar-dreigiau', 'Gwenhwyfar', 'female', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('caradoc-arth', 'Caradoc Arth', 'male', '????', '????', 'house-arth'),
    person('morgaine-dreigiau', 'Morgaine', 'female', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('gingalain-pysgod', 'Gingalain Pysgod', 'male', '????', '????', 'house-pysgod'),

    // Gründer und erste Generation
    person('celtigern-draig', 'Celtigern', 'male', '????', '????', DRAIG_HOUSE_ID, {
      title: 'Überlebender Avalons, Gründer des Hauses Draig'
    }),
    person('findabhair-cumhail', 'Findabhair Cumhail', 'female', '????', '????', 'house-cumhail'),
    person('artus-draig', 'Artus', 'male', '????', '????'),
    person('llamrei-draig', 'Llamrei', 'male', '????', '????'),
    person('rhianu-draig', 'Rhianu', 'female', '????', '????'),
    person('grugyn-draig', 'Grugyn', 'male', '????', '????'),
    person('gwendolyn-ancient-draig', 'Gwendolyn', 'female', '????', '????'),
    person('elinowyn-draig', 'Elinowyn', 'female', '????', '????'),
    person('tanwen-pendrag', 'Tanwen Pendrag', 'female', '????', '????', 'house-pendrag'),
    person('caireen-conbhron', 'Caireen Conbhrón', 'female', '????', '????', 'house-conbhron'),
    person('uther-pendrag', 'Uther Pendrag', 'male', '????', '????', 'house-pendrag'),
    person('blathnaid-talamh', 'Blathnaid Talamh', 'female', '????', '????', 'house-talamh'),
    person('kyvwlch-illewod', 'Kyvwlch Illewod', 'male', '????', '????', 'house-illewod'),
    person('kynwrig-gafyr', 'Kynwrig Gafyr', 'male', '????', '????', 'house-gafyr'),

    // Frühe, nur durch Überlieferungssprünge verbundene Generationen
    person('godwyn-draig', 'Godwyn', 'male', '????', '????'),
    person('malltwyn-draig', 'Malltwyn', 'female', '????', '????'),
    person('isobel-ancient-draig', 'Isobel', 'female', '????', '????'),
    person('kynwrig-draig', 'Kynwrig', 'male', '????', '????'),
    person('arianwyn-pendrag', 'Arianwyn Pendrag', 'female', '????', '????', 'house-pendrag'),
    person('trystan-pendrag', 'Trystan Pendrag', 'male', '????', '????', 'house-pendrag'),
    person('parzifal-pendrag', 'Parzifal Pendrag', 'male', '????', '????', 'house-pendrag'),
    person('sianwyn-gafyr', 'Sianwyn Gafyr', 'female', '????', '????', 'house-gafyr'),
    person('isolde-ancient-draig', 'Isolde', 'female', '????', '????'),
    person('morholt-draig', 'Morholt', 'male', '????', '????'),
    person('gwenalarch-draig', 'Gwenalarch', 'female', '????', '????'),
    person('griflet-pendrag', 'Griflet Pendrag', 'male', '????', '????', 'house-pendrag'),
    person('gwyneira-pendrag', 'Gwyneira Pendrag', 'female', '????', '????', 'house-pendrag'),
    person('ysgithyrwyn-grael', 'Ysgithyrwyn Grael', 'male', '????', '????', 'house-grael'),

    // Ab 1095 wieder datierte Hauptlinie
    person('marared-draig', 'Marared', 'male', '1095', '1169'),
    person('tanwen-draig', 'Tanwen', 'female', '1096', '1177'),
    person('tryffin-draig', 'Tryffin', 'male', '1098', '1171'),
    person('cerridwyn-pendrag', 'Cerridwyn Pendrag', 'female', '1097', '1144', 'house-pendrag'),
    person('kenehyr-gwefrydd', 'Kenehyr Gwefrydd', 'male', '1096', '1141', 'house-gwefrydd'),
    person('rhianwyn-saethwyr', 'Rhianwyn Saethwyr', 'female', '????', '????', 'house-saethwyr'),
    person('gruffyd-draig', 'Gruffyd', 'male', '1114', '1171'),
    person('myrddin-draig', 'Myrddin', 'male', '1119', ''),
    person('tiwlip-aderyn', 'Tiwlip Aderyn', 'female', '1117', '1194', 'house-aderyn'),
    person('bethwyn-nimue-grael', 'Bethwyn „Nimue“ Grael', 'female', '1311', '1498', 'house-grael'),
    person('afallith-lilith-tanwyn', 'Afallith „Lilith“ Tanwyn', 'female', '????', '', 'house-tanwyn', {
      familyRole: 'affair'
    }),
    person('neithon-1136-draig', 'Neithon', 'male', '1136', '1184'),
    person('lancelot-draig', 'Lancelot', 'male', '1411', ''),
    person('myriad-draig', 'Myriad', 'unknown', '1500', '', DRAIG_HOUSE_ID, { familyRole: 'bastard' }),
    person('saorlaith-roth', 'Saorlaith Roth', 'female', '????', '????', 'house-roth'),
    person('gwyneth-neidr', 'Gwyneth Neidr', 'female', '1588', '', 'house-neidr'),
    person('iorwerth-draig', 'Iorwerth', 'male', '1160', '1271'),
    person('ffion-draig', 'Ffion', 'female', '????', ''),
    person('gormlaith-urquhart', 'Gormlaith Urquhart', 'female', '1163', '1272', 'house-urquhart'),
    person('garith-draig', 'Garith', 'male', '1247', '1266'),
    person('eurolwyn-draig', 'Eurolwyn', 'female', '1250', '1312'),
    person('kenehyr-draig', 'Kenehyr', 'male', '1253', '1295'),
    person('aurnia-cumhail', 'Aurnia Cumhail', 'female', '1248', '1265', 'house-cumhail'),
    person('maldwyn-gafyr', 'Maldwyn Gafyr', 'male', '1249', '1312', 'house-gafyr'),
    person('teswyn-grael', 'Teswyn Grael', 'female', '1254', '1333', 'house-grael'),
    person('cynan-draig', 'Cynan', 'male', '????', '????'),
    person('rhoslyn-draig', 'Rhoslyn', 'female', '????', '????'),
    person('beibhinn-cumhail', 'Beibhinn Cumhail', 'female', '????', '????', 'house-cumhail'),

    // Neuzeitliche Grafenlinie
    person('cunedda-draig', 'Cunedda', 'male', '1553', '1617'),
    person('caitrin-draig', 'Caitrin', 'female', '1555', '1603'),
    person('arianwen-pendragon', 'Arianwen Pendrag', 'female', '1562', '1633', 'house-pendrag'),
    person('gawain-pendragon', 'Gawain Pendrag', 'male', '1551', '1623', 'house-pendrag'),
    person('cadwalladar-draig', 'Cadwalladar', 'male', '1579', '1654'),
    person('tudorwen-draig', 'Tudorwen', 'female', '1581', '1664'),
    person('bleddyn-draig', 'Bleddyn', 'male', '1582', '1653', DRAIG_HOUSE_ID, {
      title: 'Begründer des Baronenhauses Gwyvern'
    }),
    person('talaith-draig', 'Talaith', 'female', '1584', '1670'),
    person('tuilelaith-duibhne', 'Tuilelaith Duibhne', 'female', '1580', '1697', 'house-duibhne'),
    person('domnall-cumhail', 'Domnall Cumhail', 'male', '1580', '1635', 'house-cumhail'),
    person('owena-saethwyr', 'Owena Saethwyr', 'female', '1583', '1683', 'house-saethwyr'),
    person('greidyawl-grael', 'Greidyawl Grael', 'male', '1580', '1667', 'house-grael'),
    person('howell-draig', 'Howell', 'male', '1598', '1669'),
    person('heulwen-draig', 'Heulwen', 'female', '1600', '1666'),
    person('myfanwy-draig', 'Myfanwy', 'female', '1600', '1670'),
    person('cadfael-draig', 'Cadfael', 'male', '1602', '1669'),
    person('gwyneth-blodyn', 'Gwyneth Blodyn', 'female', '1600', '????', 'house-blodyn'),
    person('rhydderch-wyrm', 'Rhydderch Wyrm', 'male', '1599', '1665', 'house-wyrm'),
    person('uaithne-diulb', 'Uaithne Diulb', 'male', '1598', '1651', 'house-diulb'),
    person('sioned-dyngwn', 'Sioned Dyngwn', 'female', '1602', '1689', 'house-dyngwn'),
    person('merfyn-draig', 'Merfyn', 'male', '1617', '1685'),
    person('olwen-draig', 'Olwen', 'female', '1619', '1681'),
    person('rhiwallon-draig', 'Rhiwallon', 'male', '1625', '1691'),
    person('hafwen-draig', 'Hafwen', 'female', '1644', '1708'),
    person('llinos-pysgod', 'Llinos Pysgod', 'female', '1619', '1653', 'house-pysgod'),
    person('hwyvel-gafyr', 'Hwyvel Gafyr', 'male', '1615', '1679', 'house-gafyr'),
    person('fidelma-airt', 'Fidelma Airt', 'female', '1627', '1696', 'house-airt'),
    person('madoc-arth', 'Madoc Arth', 'male', '1643', '1722', 'house-arth'),
    person('cahir-draig', 'Cahir', 'male', '1641', '1702'),
    person('maygan-draig', 'Maygan', 'female', '1645', '1711'),
    person('elenydd-draig', 'Elenydd', 'female', '1651', '1723'),
    person('gethin-draig', 'Gethin', 'male', '1649', '1719'),
    person('arianwen-draig', 'Arianwen', 'female', '1653', '1703'),
    person('trahern-draig', 'Trahern', 'male', '1645', ''),
    person('mairwen-draig', 'Mairwen', 'female', '1654', '1731'),
    person('alawen-cumhail', 'Alawen Cumhail', 'female', '1645', '1705', 'house-cumhail'),
    person('selwyn-illewod', 'Selwyn Illewod', 'male', '1643', '1707', 'house-illewod'),
    person('gaenor-neidr', 'Gaenor Neidr', 'male', '1646', '1711', 'house-neidr'),
    person('gwenllian-saethwyr', 'Gwenllian Saethwyr', 'female', '1650', '1720', 'house-saethwyr'),
    person('turlough-ness', 'Turlough Ness', 'male', '1648', '1703', 'house-ness'),
    person('cerys-marwolaeth', 'Cerys Marwolaeth', 'female', '1646', '1733', 'house-marwolaeth'),
    person('lywelyn-crefyddol', 'Lywelyn Crefyddol', 'male', '1652', '1720', 'house-crefyddol'),

    // Generationen des 17. und frühen 18. Jahrhunderts
    person('rhodri-draig', 'Rhodri', 'male', '1662', '1720'),
    person('generis-draig', 'Generis', 'female', '1674', ''),
    person('meurig-draig', 'Meurig', 'male', '1668', '', DRAIG_HOUSE_ID, { title: 'Justiziar der Grafschaft Celtigerns Wacht' }),
    person('ceridwen-draig', 'Ceridwen', 'female', '1670', ''),
    person('trayvon-draig', 'Trayvon', 'male', '1677', '1720'),
    person('odyar-draig', 'Odyar', 'male', '1668', '', DRAIG_HOUSE_ID, { title: 'Kämmerer der Grafschaft Celtigerns Wacht' }),
    person('fflur-draig', 'Fflur', 'female', '1670', '1720'),
    person('seithved-draig', 'Seithved', 'male', '1672', '1691'),
    person('maredudd-draig', 'Maredudd', 'male', '1670', ''),
    person('angharad-pendrag', 'Angharad Pendrag', 'female', '1665', '1720', 'house-pendrag'),
    person('hewet-wylan', 'Hewet Wylan', 'male', '1670', '1720', 'house-wylan'),
    person('heledd-gwyvern', 'Heledd Gwyvern', 'female', '1670', '', 'house-gwyvern'),
    person('mailgwin-wyrm', 'Mailgwin Wyrm', 'male', '1669', '', 'house-wyrm'),
    person('rihanna-ceirwynn', 'Rihanna Ceirwynn', 'female', '1678', '', 'house-ceirwynn'),
    person('beibhinn-eirce', 'Beibhinn Eirce', 'female', '1669', '', 'house-eirce'),
    person('bleddyn-blodyn', 'Bleddyn Blodyn', 'male', '1669', '1720', 'house-blodyn'),
    person('alaw-grawn', 'Alaw Grawn', 'female', '1676', '1720', 'house-grawn'),
    person('owain-draig', 'Owain', 'male', '1694', ''),
    person('galahad-draig', 'Galahad', 'male', '1695', '', DRAIG_HOUSE_ID, { title: 'Graf von Celtigerns Wacht' }),
    person('rhonwen-draig', 'Rhonwen', 'female', '1702', '1720'),
    person('alicyn-draig', 'Alicyn', 'female', '1697', ''),
    person('rhys-draig', 'Rhys', 'male', '1695', ''),
    person('eilonwy-draig', 'Eilonwy', 'female', '1695', ''),
    person('steffan-draig', 'Steffan', 'male', '1696', ''),
    person('tecwyn-draig', 'Tecwyn', 'male', '1700', '', DRAIG_HOUSE_ID, {
      worldPersonId: 'person--haus-arwydd--tecwyn-draig'
    }),
    person('cadfan-draig', 'Cadfan', 'male', '1696', ''),
    person('dwynwen-draig', 'Dwynwen', 'female', '1698', ''),
    person('gwendolyn-aderyn', 'Gwendolyn Aderyn', 'female', '1695', '', 'house-aderyn', { title: 'Gräfin von Celtigerns Wacht' }),
    person('nodawl-illysywen', "Nodawl Illysywen O'Castellbryn", 'male', '1682', '1720', 'house-illysywen', { familyRole: 'forced' }),
    person('egon-gafyr', "Egon Gafyr O'Gwynthor", 'male', '1694', '', 'house-gafyr'),
    person('brona-eisenherz', 'Brona Eisenherz', 'female', '1701', '', 'house-eisenherz'),
    person('esyllt-arth', 'Esyllt Arth', 'female', '1696', '????', 'house-arth', { familyRole: 'affair' }),
    person('nesta', 'Nesta', 'female', '????', '????', '', { familyRole: 'affair' }),
    person('matilda', 'Matilda', 'female', '????', '????', '', { familyRole: 'affair' }),
    person('sylvia-cenyr', "Sylvia O'Cenyr", 'female', '1695', '1719', 'house-cenyr', { familyRole: 'affair' }),
    person('shylene-argall', 'Shylene Argall', 'female', '1710', '', 'house-argall', { familyRole: 'affair' }),
    person('branwen-gwefrydd', 'Branwen Gwefrydd', 'female', '1700', '', 'house-gwefrydd'),
    person('ianto-arwydd', 'Ianto Arwydd', 'male', '1700', '', 'house-arwydd'),
    person('wynonna-fiachrach', 'Wynonna Fiachrach', 'female', '1700', '', 'house-fiachrach'),
    person('caswallon-grael', 'Caswallon Grael', 'male', '1694', '', 'house-grael'),

    // Gegenwärtige Erbfolge und Seitenzweige
    person('anaraut-draig', 'Anaraut', 'male', '1715', ''),
    person('idwal-draig', 'Idwal', 'male', '1716', ''),
    person('tudwal-draig', 'Tudwal', 'male', '1717', ''),
    person('neithon-1718-draig', 'Neithon', 'male', '1718', ''),
    person('isobel-1719-draig', 'Isobel', 'female', '1719', ''),
    person('rhiannon-draig', 'Rhiannon', 'female', '1721', ''),
    person('gawain-draig', 'Gawain', 'male', '1722', ''),
    person('guinevere-neidr', 'Guinevere Neidr', 'female', '????', '', 'house-neidr', { familyRole: 'ward' }),
    person('amadia-draig', 'Amadia', 'female', '1718', '', DRAIG_HOUSE_ID, { familyRole: 'bastard' }),
    person('rhygifarch-draig', 'Rhygifarch', 'male', '????', '', DRAIG_HOUSE_ID, { familyRole: 'bastard' }),
    person('rollo-draig', 'Rollo', 'male', '????', '', DRAIG_HOUSE_ID, { familyRole: 'bastard' }),
    person('siana-draig', 'Siana', 'female', '1725', '', DRAIG_HOUSE_ID, { familyRole: 'bastard' }),
    person('iolo-draig', 'Iolo', 'male', '1735', '', DRAIG_HOUSE_ID, { familyRole: 'bastard' }),
    person('mair-draig', 'Mair', 'female', '1720', ''),
    person('kane-draig', 'Kane', 'male', '1721', ''),
    person('oweta-draig', 'Oweta', 'female', '1723', ''),
    person('gethin-1722-draig', 'Gethin', 'male', '1722', ''),
    person('tegan-draig', 'Tegan', 'female', '1725', ''),
    person('einion-draig', 'Einion', 'male', '1723', ''),
    person('carys-draig', 'Carys', 'female', '1726', ''),
    person('skalli-varulv', 'Skalli Varulv', 'female', '1716', '', 'house-varulv'),
    person('unknown-idwal-betrothed', 'Unbekannte Verlobte', 'female', '????', '', '', { status: 'unknown' }),
    person('revelyn-penderyn', 'Revelyn Penderyn', 'female', '1718', '', 'house-pendrag'),
    person('alaweyn-grawn', 'Alaweyn Grawn', 'female', '1716', '', 'house-grawn'),
    person('unknown-isobel-betrothed', 'Unbekannter Verlobter', 'male', '????', '', '', { status: 'unknown' })
  ],
  partnerships: [
    createMarriage('marriage-gwyrthern-gwendolyn', ...GWYRTHERN_IDS),
    createMarriage('marriage-rhonwen-dyngannon', 'rhonwen-dreigiau', 'dyngannon-paun'),
    createMarriage('marriage-kerrylin-mordred', 'kerrylin-dreigiau', 'mordred-blodyn'),
    createMarriage('marriage-vortimer-isolde', 'vortimer-dreigiau', 'isolde-teigr'),
    createMarriage('marriage-vortigern-rhiannon', 'vortigern-pendrag', 'rhiannon-aderyn'),
    createMarriage('marriage-celtigern-findabhair', ...FOUNDER_IDS),
    createMarriage('marriage-gwenhwyfar-caradoc', 'gwenhwyfar-dreigiau', 'caradoc-arth'),
    createMarriage('marriage-morgaine-gingalain', 'morgaine-dreigiau', 'gingalain-pysgod'),
    createMarriage('marriage-artus-tanwen', ...ARTUS_IDS),
    createMarriage('marriage-llamrei-caireen', 'llamrei-draig', 'caireen-conbhron'),
    createMarriage('marriage-rhianu-uther', 'rhianu-draig', 'uther-pendrag'),
    createMarriage('marriage-grugyn-blathnaid', 'grugyn-draig', 'blathnaid-talamh'),
    createMarriage('marriage-gwendolyn-kyvwlch', 'gwendolyn-ancient-draig', 'kyvwlch-illewod'),
    createMarriage('marriage-elinowyn-kynwrig', 'elinowyn-draig', 'kynwrig-gafyr'),
    createMarriage('marriage-godwyn-arianwyn', ...GODWYN_IDS),
    createMarriage('marriage-malltwyn-trystan', 'malltwyn-draig', 'trystan-pendrag'),
    createMarriage('marriage-isobel-parzifal', 'isobel-ancient-draig', 'parzifal-pendrag'),
    createMarriage('marriage-kynwrig-sianwyn', 'kynwrig-draig', 'sianwyn-gafyr'),
    createMarriage('marriage-isolde-griflet', 'isolde-ancient-draig', 'griflet-pendrag'),
    createMarriage('marriage-morholt-gwyneira', ...MORHOLT_IDS),
    createMarriage('marriage-gwenalarch-ysgithyrwyn', 'gwenalarch-draig', 'ysgithyrwyn-grael'),
    createMarriage('marriage-marared-cerridwyn', ...MARARED_IDS),
    createMarriage('marriage-tanwen-kenehyr', 'tanwen-draig', 'kenehyr-gwefrydd'),
    createMarriage('marriage-tryffin-rhianwyn', 'tryffin-draig', 'rhianwyn-saethwyr'),
    createMarriage('marriage-gruffyd-tiwlip', 'gruffyd-draig', 'tiwlip-aderyn'),
    createMarriage('marriage-myrddin-bethwyn', ...MYRDDIN_IDS),
    createMarriage('affair-myrddin-lilith', 'myrddin-draig', 'afallith-lilith-tanwyn', { type: 'affair', status: 'secret' }),
    createMarriage('marriage-neithon-saorlaith', 'neithon-1136-draig', 'saorlaith-roth'),
    createMarriage('marriage-lancelot-gwyneth', 'lancelot-draig', 'gwyneth-neidr'),
    createMarriage('marriage-iorwerth-gormlaith', ...IORWERTH_IDS),
    createMarriage('engagement-garith-aurnia', 'garith-draig', 'aurnia-cumhail', { type: 'engagement', status: 'ended' }),
    createMarriage('marriage-eurolwyn-maldwyn', 'eurolwyn-draig', 'maldwyn-gafyr'),
    createMarriage('marriage-kenehyr-teswyn', ...KENEHYR_IDS),
    createMarriage('marriage-cynan-beibhinn', ...CYNAN_IDS),
    createMarriage('marriage-cunedda-arianwen', ...CUNEDDA_IDS),
    createMarriage('marriage-caitrin-gawain', 'caitrin-draig', 'gawain-pendragon'),
    createMarriage('marriage-cadwalladar-tuilelaith', ...CADWALLADAR_IDS),
    createMarriage('marriage-tudorwen-domnall', 'tudorwen-draig', 'domnall-cumhail'),
    createMarriage('marriage-bleddyn-owena', 'bleddyn-draig', 'owena-saethwyr'),
    createMarriage('marriage-talaith-greidyawl', 'talaith-draig', 'greidyawl-grael'),
    createMarriage('marriage-howell-gwyneth', ...HOWELL_IDS),
    createMarriage('marriage-heulwen-rhydderch', 'heulwen-draig', 'rhydderch-wyrm'),
    createMarriage('marriage-myfanwy-uaithne', 'myfanwy-draig', 'uaithne-diulb'),
    createMarriage('marriage-cadfael-sioned', ...CADFAEL_IDS),
    createMarriage('marriage-merfyn-llinos', ...MERFYN_IDS),
    createMarriage('marriage-olwen-hwyvel', 'olwen-draig', 'hwyvel-gafyr'),
    createMarriage('marriage-rhiwallon-fidelma', ...RHIWALLON_IDS),
    createMarriage('marriage-hafwen-madoc', 'hafwen-draig', 'madoc-arth'),
    createMarriage('marriage-cahir-alawen', ...CAHIR_IDS),
    createMarriage('marriage-maygan-selwyn', 'maygan-draig', 'selwyn-illewod'),
    createMarriage('marriage-elenydd-gaenor', 'elenydd-draig', 'gaenor-neidr'),
    createMarriage('marriage-gethin-gwenllian', ...GETHIN_IDS),
    createMarriage('marriage-arianwen-turlough', 'arianwen-draig', 'turlough-ness'),
    createMarriage('marriage-trahern-cerys', ...TRAHERN_IDS),
    createMarriage('marriage-mairwen-lywelyn', 'mairwen-draig', 'lywelyn-crefyddol'),
    createMarriage('marriage-rhodri-angharad', ...RHODRI_IDS),
    createMarriage('marriage-generis-hewet', 'generis-draig', 'hewet-wylan'),
    createMarriage('marriage-meurig-heledd', ...MEURIG_IDS),
    createMarriage('marriage-ceridwen-mailgwin', 'ceridwen-draig', 'mailgwin-wyrm'),
    createMarriage('marriage-trayvon-rihanna', ...TRAYVON_IDS),
    createMarriage('marriage-odyar-beibhinn', ...ODYAR_IDS),
    createMarriage('marriage-fflur-bleddyn', 'fflur-draig', 'bleddyn-blodyn'),
    createMarriage('marriage-maredudd-alaw', ...MAREDUDD_IDS),
    createMarriage('marriage-galahad-gwendolyn', ...GALAHAD_IDS),
    createMarriage('forced-rhonwen-nodawl', 'rhonwen-draig', 'nodawl-illysywen', {
      type: 'forced',
      status: 'ended',
      notes: 'Die Quelle bezeichnet Nodawl ausdrücklich als Rhonwens Schänder.'
    }),
    createMarriage('marriage-alicyn-egon', 'alicyn-draig', 'egon-gafyr'),
    createMarriage('marriage-rhys-brona', ...RHYS_IDS),
    createMarriage('affair-owain-esyllt', 'owain-draig', 'esyllt-arth', { type: 'affair', status: 'ended' }),
    createMarriage('affair-owain-nesta', 'owain-draig', 'nesta', { type: 'affair', status: 'ended' }),
    createMarriage('affair-owain-matilda', 'owain-draig', 'matilda', { type: 'affair', status: 'ended' }),
    createMarriage('affair-owain-sylvia', 'owain-draig', 'sylvia-cenyr', { type: 'affair', status: 'ended' }),
    createMarriage('affair-owain-shylene', 'owain-draig', 'shylene-argall', { type: 'affair', status: 'secret' }),
    createMarriage('marriage-steffan-branwen', ...STEFFAN_IDS),
    createMarriage('marriage-tecwyn-ianto', 'tecwyn-draig', 'ianto-arwydd'),
    createMarriage('marriage-cadfan-wynonna', ...CADFAN_IDS),
    createMarriage('marriage-dwynwen-caswallon', 'dwynwen-draig', 'caswallon-grael'),
    createMarriage('engagement-anaraut-skalli', 'anaraut-draig', 'skalli-varulv', { type: 'engagement' }),
    createMarriage('engagement-idwal-unknown', 'idwal-draig', 'unknown-idwal-betrothed', { type: 'engagement' }),
    createMarriage('engagement-tudwal-revelyn', 'tudwal-draig', 'revelyn-penderyn', { type: 'engagement' }),
    createMarriage('engagement-neithon-alaweyn', 'neithon-1718-draig', 'alaweyn-grawn', { type: 'engagement' }),
    createMarriage('engagement-isobel-unknown', 'isobel-1719-draig', 'unknown-isobel-betrothed', { type: 'engagement' }),
    createMarriage('engagement-gawain-guinevere', 'gawain-draig', 'guinevere-neidr', {
      type: 'engagement',
      notes: 'Guinevere ist Galahads Mündel und zugleich Gawains Verlobte.'
    })
  ],
  parentages: [
    ...childrenOf(
      ['vortimer-dreigiau', 'vortigern-pendrag', 'celtigern-draig', 'gwenhwyfar-dreigiau', 'morgaine-dreigiau'],
      GWYRTHERN_IDS,
      'marriage-gwyrthern-gwendolyn'
    ),
    ...childrenOf(
      ['artus-draig', 'llamrei-draig', 'rhianu-draig', 'grugyn-draig', 'gwendolyn-ancient-draig', 'elinowyn-draig'],
      FOUNDER_IDS,
      'marriage-celtigern-findabhair'
    ),
    ...childrenOf(['godwyn-draig', 'malltwyn-draig', 'isobel-ancient-draig', 'kynwrig-draig'], ARTUS_IDS, 'marriage-artus-tanwen', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-artus-godwyn' }
    }),
    ...childrenOf(['isolde-ancient-draig', 'morholt-draig', 'gwenalarch-draig'], GODWYN_IDS, 'marriage-godwyn-arianwyn', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-godwyn-morholt' }
    }),
    ...childrenOf(['marared-draig', 'tanwen-draig', 'tryffin-draig'], MORHOLT_IDS, 'marriage-morholt-gwyneira', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-morholt-marared' }
    }),
    ...childrenOf(['gruffyd-draig', 'myrddin-draig'], MARARED_IDS, 'marriage-marared-cerridwyn'),
    ...childrenOf(['neithon-1136-draig'], ['gruffyd-draig', 'tiwlip-aderyn'], 'marriage-gruffyd-tiwlip'),
    ...childrenOf(['lancelot-draig'], MYRDDIN_IDS, 'marriage-myrddin-bethwyn'),
    ...childrenOf(['myriad-draig'], ['myrddin-draig', 'afallith-lilith-tanwyn'], 'affair-myrddin-lilith', {
      legitimacy: 'illegitimate'
    }),
    ...childrenOf(['iorwerth-draig'], ['neithon-1136-draig', 'saorlaith-roth'], 'marriage-neithon-saorlaith'),
    ...childrenOf(['ffion-draig'], ['lancelot-draig', 'gwyneth-neidr'], 'marriage-lancelot-gwyneth'),
    ...childrenOf(['garith-draig', 'eurolwyn-draig', 'kenehyr-draig'], IORWERTH_IDS, 'marriage-iorwerth-gormlaith', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-iorwerth-kenehyr' }
    }),
    ...childrenOf(['cynan-draig', 'rhoslyn-draig'], KENEHYR_IDS, 'marriage-kenehyr-teswyn', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-kenehyr-cynan' }
    }),
    ...childrenOf(['cunedda-draig', 'caitrin-draig'], CYNAN_IDS, 'marriage-cynan-beibhinn', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-cynan-cunedda' }
    }),
    ...childrenOf(['cadwalladar-draig', 'tudorwen-draig', 'bleddyn-draig', 'talaith-draig'], CUNEDDA_IDS, 'marriage-cunedda-arianwen'),
    ...childrenOf(['howell-draig', 'heulwen-draig', 'myfanwy-draig', 'cadfael-draig'], CADWALLADAR_IDS, 'marriage-cadwalladar-tuilelaith'),
    ...childrenOf(['merfyn-draig', 'olwen-draig'], HOWELL_IDS, 'marriage-howell-gwyneth'),
    ...childrenOf(['rhiwallon-draig', 'hafwen-draig'], CADFAEL_IDS, 'marriage-cadfael-sioned'),
    ...childrenOf(['cahir-draig', 'maygan-draig', 'elenydd-draig', 'gethin-draig', 'arianwen-draig'], MERFYN_IDS, 'marriage-merfyn-llinos'),
    ...childrenOf(['trahern-draig'], RHIWALLON_IDS, 'marriage-rhiwallon-fidelma'),
    ...childrenOf(['mairwen-draig'], RHIWALLON_IDS, 'marriage-rhiwallon-fidelma', {
      // Kernmitglied mit regulärer ehelicher Abstammung; registryManagedFields korrigiert
      // ältere lokale Fassungen, in denen Mairwen versehentlich als legitimiert geführt wurde.
      legitimacy: 'legitimate',
      extensions: { registryManagedFields: ['legitimacy'] }
    }),
    ...childrenOf(['rhodri-draig', 'generis-draig', 'meurig-draig', 'ceridwen-draig', 'trayvon-draig'], CAHIR_IDS, 'marriage-cahir-alawen'),
    ...childrenOf(['odyar-draig', 'fflur-draig', 'seithved-draig'], GETHIN_IDS, 'marriage-gethin-gwenllian'),
    ...childrenOf(['maredudd-draig'], TRAHERN_IDS, 'marriage-trahern-cerys'),
    ...childrenOf(['owain-draig', 'galahad-draig', 'rhonwen-draig'], RHODRI_IDS, 'marriage-rhodri-angharad'),
    ...childrenOf(['alicyn-draig', 'rhys-draig'], MEURIG_IDS, 'marriage-meurig-heledd'),
    ...childrenOf(['eilonwy-draig'], TRAYVON_IDS, 'marriage-trayvon-rihanna'),
    ...childrenOf(['steffan-draig', 'tecwyn-draig'], ODYAR_IDS, 'marriage-odyar-beibhinn'),
    ...childrenOf(['cadfan-draig', 'dwynwen-draig'], MAREDUDD_IDS, 'marriage-maredudd-alaw'),
    ...childrenOf(['anaraut-draig', 'idwal-draig', 'tudwal-draig', 'neithon-1718-draig', 'isobel-1719-draig', 'rhiannon-draig', 'gawain-draig'], GALAHAD_IDS, 'marriage-galahad-gwendolyn'),
    ...childrenOf(['guinevere-neidr'], GALAHAD_IDS, 'marriage-galahad-gwendolyn', {
      type: 'foster', legitimacy: 'unknown', notes: 'Guinevere ist ein aufgenommener Mündel und keine leibliche Tochter.'
    }),
    ...childrenOf(['mair-draig'], ['rhonwen-draig', 'nodawl-illysywen'], 'forced-rhonwen-nodawl', {
      legitimacy: 'legitimized',
      extensions: { registryManagedFields: ['legitimacy'] }
    }),
    ...childrenOf(['kane-draig', 'oweta-draig'], RHYS_IDS, 'marriage-rhys-brona'),
    ...childrenOf(['gethin-1722-draig', 'tegan-draig'], STEFFAN_IDS, 'marriage-steffan-branwen'),
    ...childrenOf(['einion-draig', 'carys-draig'], CADFAN_IDS, 'marriage-cadfan-wynonna'),
    ...childrenOf(['amadia-draig'], ['owain-draig', 'esyllt-arth'], 'affair-owain-esyllt', { legitimacy: 'illegitimate' }),
    ...childrenOf(['rhygifarch-draig'], ['owain-draig', 'nesta'], 'affair-owain-nesta', { legitimacy: 'illegitimate' }),
    ...childrenOf(['rollo-draig'], ['owain-draig', 'matilda'], 'affair-owain-matilda', { legitimacy: 'illegitimate' }),
    ...childrenOf(['siana-draig'], ['owain-draig', 'sylvia-cenyr'], 'affair-owain-sylvia', { legitimacy: 'illegitimate' }),
    ...childrenOf(['iolo-draig'], ['owain-draig', 'shylene-argall'], 'affair-owain-shylene', { legitimacy: 'illegitimate' })
  ],
  lineage: {
    founderPartnershipId: 'marriage-celtigern-findabhair',
    houseId: DRAIG_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'dreigiau-origin',
      houseId: 'house-dreigiau',
      name: 'Haus Dreigiau',
      subtitle: '',
      emblem: HOUSE_EMBLEMS.dreigiau,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: DREIGIAU_ROOT_IDS,
      targetFamilyId: '',
      notes: 'Vorgelagertes Ursprungshaus der in diesem Ausschnitt belegten Linie.'
    }
  },
  cadetBranches: [
    // Seitenlinien der Dreigiau-Generationen vor dem Gründerpaar
    marriedAway('married-away-paun-rhonwen', 'Haus Paun', 'marriage-rhonwen-dyngannon', 'house-paun'),
    marriedAway('married-away-blodyn-kerrylin', 'Haus Blodyn', 'marriage-kerrylin-mordred', 'house-blodyn'),
    marriedAway('married-away-teigr-vortimer', 'Haus Teigr', 'marriage-vortimer-isolde', 'house-teigr'),
    createCadetHouseBranch({
      id: 'cadet-pendrag-vortigern',
      name: 'Haus Pendrag',
      subtitle: 'Begründetes Haus',
      parentPartnershipId: 'marriage-vortigern-rhiannon',
      houseId: 'house-pendrag',
      targetFamilyId: 'haus-pendrag',
      notes: 'Vortigern begründet mit Rhiannon Aderyn die Linie des Hauses Pendrag.'
    }),
    marriedAway('married-away-arth-gwenhwyfar', 'Haus Arth', 'marriage-gwenhwyfar-caradoc', 'house-arth'),
    marriedAway('married-away-pysgod-morgaine', 'Haus Pysgod', 'marriage-morgaine-gingalain', 'house-pysgod'),
    createCadetHouseBranch({
      id: 'cadet-gwyvern-bleddyn',
      name: 'Haus Gwyvern',
      subtitle: 'Begründetes Baronenhaus',
      parentPartnershipId: 'marriage-bleddyn-owena',
      houseId: 'house-gwyvern',
      targetFamilyId: 'haus-gwyvern',
      emblem: HOUSE_EMBLEMS.gwyvern,
      notes: 'Bleddyn und Owena begründen die baroniale Linie des Hauses Gwyvern.'
    }),
    marriedAway('married-away-pendrag-rhianu', 'Haus Pendrag', 'marriage-rhianu-uther', 'house-pendrag'),
    marriedAway('married-away-illewod-gwendolyn', 'Haus Illewod', 'marriage-gwendolyn-kyvwlch', 'house-illewod'),
    marriedAway('married-away-gafyr-elinowyn', 'Haus Gafyr', 'marriage-elinowyn-kynwrig', 'house-gafyr', HOUSE_EMBLEMS.gafyr),
    marriedAway('married-away-pendrag-malltwyn', 'Haus Pendrag', 'marriage-malltwyn-trystan', 'house-pendrag'),
    marriedAway('married-away-pendrag-isobel', 'Haus Pendrag', 'marriage-isobel-parzifal', 'house-pendrag'),
    marriedAway('married-away-pendrag-isolde', 'Haus Pendrag', 'marriage-isolde-griflet', 'house-pendrag'),
    marriedAway('married-away-grael-gwenalarch', 'Haus Grael', 'marriage-gwenalarch-ysgithyrwyn', 'house-grael'),
    marriedAway('married-away-gwefrydd-tanwen', 'Haus Gwefrydd', 'marriage-tanwen-kenehyr', 'house-gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    marriedAway('married-away-saethwyr-tryffin', 'Haus Saethwyr', 'marriage-tryffin-rhianwyn', 'house-saethwyr', HOUSE_EMBLEMS.saethwyr),
    marriedAway('married-away-gafyr-eurolwyn', 'Haus Gafyr', 'marriage-eurolwyn-maldwyn', 'house-gafyr', HOUSE_EMBLEMS.gafyr),
    marriedAway('married-away-pendrag-caitrin', 'Haus Pendrag', 'marriage-caitrin-gawain', 'house-pendrag'),
    marriedAway('married-away-cumhail-tudorwen', 'Haus Cumhail', 'marriage-tudorwen-domnall', 'house-cumhail'),
    marriedAway('married-away-grael-talaith', 'Haus Grael', 'marriage-talaith-greidyawl', 'house-grael'),
    marriedAway('married-away-wyrm-heulwen', 'Haus Wyrm', 'marriage-heulwen-rhydderch', 'house-wyrm', HOUSE_EMBLEMS.wyrm),
    marriedAway('married-away-diulb-myfanwy', 'Haus Diulb', 'marriage-myfanwy-uaithne', 'house-diulb'),
    marriedAway('married-away-gafyr-olwen', 'Haus Gafyr', 'marriage-olwen-hwyvel', 'house-gafyr', HOUSE_EMBLEMS.gafyr),
    marriedAway('married-away-arth-hafwen', 'Haus Arth', 'marriage-hafwen-madoc', 'house-arth'),
    marriedAway('married-away-illewod-maygan', 'Haus Illewod', 'marriage-maygan-selwyn', 'house-illewod'),
    marriedAway('married-away-neidr-elenydd', 'Haus Neidr', 'marriage-elenydd-gaenor', 'house-neidr'),
    marriedAway('married-away-ness-arianwen', 'Haus Ness', 'marriage-arianwen-turlough', 'house-ness'),
    marriedAway('married-away-crefyddol-mairwen', 'Haus Crefyddol', 'marriage-mairwen-lywelyn', 'house-crefyddol'),
    marriedAway('married-away-wylan-generis', 'Haus Wylan', 'marriage-generis-hewet', 'house-wylan'),
    marriedAway('married-away-wyrm-ceridwen', 'Haus Wyrm', 'marriage-ceridwen-mailgwin', 'house-wyrm', HOUSE_EMBLEMS.wyrm),
    marriedAway('married-away-blodyn-fflur', 'Haus Blodyn', 'marriage-fflur-bleddyn', 'house-blodyn'),
    marriedAway('married-away-gafyr-alicyn', 'Haus Gafyr', 'marriage-alicyn-egon', 'house-gafyr', HOUSE_EMBLEMS.gafyr),
    marriedAway('married-away-arwydd-tecwyn', 'Haus Arwydd', 'marriage-tecwyn-ianto', 'house-arwydd', HOUSE_EMBLEMS.arwydd),
    marriedAway('married-away-grael-dwynwen', 'Haus Grael', 'marriage-dwynwen-caswallon', 'house-grael')
  ],
  timeJumps: [
    {
      id: 'gap-artus-godwyn', parentPartnershipId: 'marriage-artus-tanwen', childIds: ['godwyn-draig', 'malltwyn-draig', 'isobel-ancient-draig', 'kynwrig-draig'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: 'Die Quelle markiert zwischen Artus und Godwyn eine genealogische Lücke.', extensions: {}
    },
    {
      id: 'gap-godwyn-morholt', parentPartnershipId: 'marriage-godwyn-arianwyn', childIds: ['isolde-ancient-draig', 'morholt-draig', 'gwenalarch-draig'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: 'Die Quelle markiert zwischen Godwyn und Morholt eine genealogische Lücke.', extensions: {}
    },
    {
      id: 'gap-morholt-marared', parentPartnershipId: 'marriage-morholt-gwyneira', childIds: ['marared-draig', 'tanwen-draig', 'tryffin-draig'],
      years: 0, fromYear: '????', toYear: '1095', label: 'Die datierte Überlieferung setzt 1095 wieder ein', notes: '', extensions: {}
    },
    {
      id: 'gap-iorwerth-kenehyr', parentPartnershipId: 'marriage-iorwerth-gormlaith', childIds: ['garith-draig', 'eurolwyn-draig', 'kenehyr-draig'],
      years: 0, fromYear: '????', toYear: '1247', label: 'Nicht einzeln überlieferte Generationen', notes: '', extensions: {}
    },
    {
      id: 'gap-kenehyr-cynan', parentPartnershipId: 'marriage-kenehyr-teswyn', childIds: ['cynan-draig', 'rhoslyn-draig'],
      years: 0, fromYear: '1295', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: '', extensions: {}
    },
    {
      id: 'gap-cynan-cunedda', parentPartnershipId: 'marriage-cynan-beibhinn', childIds: ['cunedda-draig', 'caitrin-draig'],
      years: 0, fromYear: '????', toYear: '1553', label: 'Die datierte Überlieferung setzt 1553 wieder ein', notes: '', extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'celtigern-draig',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten und Beziehungsstruktur nach der bereitgestellten Draig-Tabelle und den vier ergänzenden Stammbaumgrafiken. Namens- und jahresgleiche Personen aus Arwydd, Gafyr, Saethwyr und Wyrm verwenden dieselben Weltpersonen-IDs und Portraitdateien.',
    blankFamily: false,
    sourceRevision: 4
  }
});
