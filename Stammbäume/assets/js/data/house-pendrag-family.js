import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { PORTRAIT_PLACEHOLDERS } from '../config/portrait-placeholders.js';
import {
  VORTIGERNS_RUH_HOUSE_EMBLEMS,
  VORTIGERNS_RUH_HOUSE_PROFILES
} from './vortigerns-ruh-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  pendrag: VORTIGERNS_RUH_HOUSE_EMBLEMS.pendrag,
  ceirwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  draenog: 'assets/images/houses/Graue Weite/Silberwald/haus-draenog.png',
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  fiachraoin: VORTIGERNS_RUH_HOUSE_EMBLEMS.fiachraoin,
  grael: VORTIGERNS_RUH_HOUSE_EMBLEMS.grael,
  penderyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png',
  dreigiau: PORTRAIT_PLACEHOLDERS.crest
});

const PENDRAG_HOUSE_ID = 'house-pendrag';

const HOUSE_HEAD_IDS = new Set([
  'vortigern-pendrag',
  'uther-pendrag',
  'parzifal-pendrag',
  'malon-pendrag',
  'melwas-pendrag',
  'griflet-pendrag',
  'galahad-pendrag',
  'agravaine-pendrag',
  'gawain-pendragon',
  'gareth-pendrag',
  'bors-pendrag',
  'artus-1622-pendrag',
  'uther-1643-pendrag',
  'rywalyn-pendrag',
  'tristan-pendrag'
]);
const MAIN_LINE_IDS = new Set([
  'rhodri-pendrag',
  'elinor-pendrag',
  'rhodhri-1725-pendrag',
  'artus-1735-pendrag'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = PENDRAG_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_PENDRAG_PORTRAITS[id] || HOUSE_DRAIG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === PENDRAG_HOUSE_ID ? 'core' : 'married'),
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

function cadetHouse(id, name, partnershipId, houseId, notes, emblem = '') {
  return createCadetHouseBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem,
    notes
  });
}

const DREIGIAU_ROOT_IDS = ['gwyrthern-dreigiau', 'rhonwen-dreigiau', 'kerrylin-dreigiau'];
const GWYRTHERN_IDS = ['gwyrthern-dreigiau', 'gwendolyn-mwnci'];

const FOUNDER_IDS = ['vortigern-pendrag', 'rhiannon-aderyn'];
const UTHER1_IDS = ['uther-pendrag', 'rhianu-draig'];
const TANWEN_IDS = ['artus-draig', 'tanwen-pendrag'];
const GERAINT_IDS = ['geraint-pendrag', 'labhaoise-diulb'];
const MALAGANT_IDS = ['malagant-pendrag', 'eithne-fiachraoin'];
const PARZIFAL1_IDS = ['isobel-ancient-draig', 'parzifal-pendrag'];
const ARIANWYN_IDS = ['godwyn-draig', 'arianwyn-pendrag'];
const TRYSTAN_IDS = ['malltwyn-draig', 'trystan-pendrag'];
const MALON1_IDS = ['malon-pendrag', 'sinead-urquhart'];
const MELWAS1_IDS = ['melwas-pendrag', 'rhonwen-dyngwn'];
const RHOSLYN_IDS = ['rhoslyn-pendrag', 'ceirwyn-inlaw'];
const SULWEN_IDS = ['sulwen-pendrag', 'howell-neidr'];
const GRIFLET1_IDS = ['isolde-ancient-draig', 'griflet-pendrag'];
const GWYNEIRA_IDS = ['morholt-draig', 'gwyneira-pendrag'];
const GALAHAD1_IDS = ['galahad-pendrag', 'gailis-diulb'];
const CERRIDWYN_IDS = ['marared-draig', 'cerridwyn-pendrag'];
const AGRAVAINE_IDS = ['agravaine-pendrag', 'floraid-diulb'];
const RHODRI1_IDS = ['rhodri-pendrag', 'annegrit-vaeren'];
const GAWAIN_IDS = ['caitrin-draig', 'gawain-pendragon'];
const ARIANWEN_IDS = ['cunedda-draig', 'arianwen-pendragon'];
const TARWEN_IDS = ['tarwen-pendrag', 'gingalain-1572-pysgod'];
const GARETH_IDS = ['gareth-pendrag', 'olwyna-grael'];
const IESIN_IDS = ['iesin-pendrag', 'vorath-wylan'];
const BLODEUYN_IDS = ['blodeuyn-pendrag', 'keudawg-illewod'];
const BORS_IDS = ['bors-pendrag', 'cariad-draenog'];
const ARTUS2_IDS = ['artus-1622-pendrag', 'noirin-urquhart'];
const ECTOR1_IDS = ['ector-1629-pendrag', 'telyn-grawn'];
const TOR_IDS = ['tor-pendrag', 'hefin-dieniddiwr'];
const UTHER2_IDS = ['uther-1643-pendrag', 'igraine-grawn'];
const CARADWYN_IDS = ['caradwyn-pendrag', 'dungarth-aderyn'];
const MEEGHAN_IDS = ['meeghan-pendrag', 'cainneach-urquhart'];
const LAMORAK_IDS = ['lamorak-pendrag', 'lynfa-penderyn'];
const BEDIVERE_IDS = ['bedivere-pendrag', 'fearchara-cetchathach'];
const RYWALYN_IDS = ['rywalyn-pendrag', 'talla-ceirwyn'];
const ANGHARAD_IDS = ['angharad-pendrag', 'rhodri-draig'];
const LUCAN_IDS = ['lucan-pendrag', 'caoimhe-roth'];
const PELLEAS_IDS = ['pelleas-pendrag', 'genyth-pysgod'];
const RHIANNON2_IDS = ['rhiannon-1673-pendrag', 'trahayarn-grael'];
const DYSTAN_IDS = ['dystan-pendrag', 'dylis-blodyn'];
const TRISTAN_IDS = ['tristan-pendrag', 'isolde-arth'];
const CEI_IDS = ['cei-pendrag', 'siabhan-rochraide'];
const AFFAIR_YGRAINE_IDS = ['ygraine-pendrag', 'owain-draig'];
const HOYER_IDS = ['hoyer-pendrag', 'siobhara-eisenherz'];

export const HOUSE_PENDRAG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-pendrag',
    title: 'Haus Pendrag',
    motto: '',
    description: 'Die königliche Dynastie des Hauses Pendrag aus der Königlichen Grafschaft Vortigerns Ruh und der Königlichen Baronie Tanwens Flamme, von Vortigern, dem ersten König Cenyrs, bis zur Regentschaft König Tristans im Jahr 1740.',
    emblem: HOUSE_EMBLEMS.pendrag,
    houseProfile: VORTIGERNS_RUH_HOUSE_PROFILES.pendrag
  },
  houses: [
    house(PENDRAG_HOUSE_ID, 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-dreigiau', 'Haus Dreigiau', HOUSE_EMBLEMS.dreigiau),
    house('house-mwnci', 'Haus Mwnci'),
    house('house-paun', 'Haus Paun'),
    house('house-teigr', 'Haus Teigr'),
    house('house-cumhail', 'Haus Cumhail'),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-diulb', 'Haus Diulb'),
    house('house-fiachraoin', 'Clan Fiachraoin', HOUSE_EMBLEMS.fiachraoin),
    house('house-urquhart', 'Haus Urquhart'),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-ceirwyn', 'Haus Ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    house('house-vaeren', 'Haus Vaeren'),
    house('house-pysgod', 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-grael', 'Haus Grael', HOUSE_EMBLEMS.grael),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-illewod', 'Haus Illewod'),
    house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-dienyddiwr', 'Haus Dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    house('house-penderyn', 'Haus Penderyn', HOUSE_EMBLEMS.penderyn),
    house('house-cetchathach', 'Haus Cétchathach'),
    house('house-roth', 'Haus Roth'),
    house('house-neidr', 'Haus Neidr'),
    house('house-eisenherz', 'Haus Eisenherz'),
    house('house-blodyn', 'Haus Blodyn'),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-rochraide', 'Haus Rochraide')
  ],
  persons: [
    // Ursprungshaus Dreigiau: Vortigern und Celtigern (Haus Draig) sind Brüder
    person('gwyrthern-dreigiau', 'Gwyrthern', 'male', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('gwendolyn-mwnci', 'Gwendolyn Mwnci', 'female', '????', '????', 'house-mwnci'),
    person('rhonwen-dreigiau', 'Rhonwen', 'female', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('dyngannon-paun', 'Dyngannon Paun', 'male', '????', '????', 'house-paun'),
    person('kerrylin-dreigiau', 'Kerrylin', 'female', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('mordred-blodyn', 'Mordred Blodyn', 'male', '????', '????', 'house-blodyn'),
    person('vortimer-dreigiau', 'Vortimer', 'male', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('isolde-teigr', 'Isolde Teigr', 'female', '????', '????', 'house-teigr'),
    person('celtigern-draig', 'Celtigern', 'male', '????', '????', 'house-draig', { title: 'Überlebender Avalons, Gründer des Hauses Draig' }),
    person('findabhair-cumhail', 'Findabhair Cumhail', 'female', '????', '????', 'house-cumhail'),
    person('gwenhwyfar-dreigiau', 'Gwenhwyfar', 'female', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('caradoc-arth', 'Caradoc Arth', 'male', '????', '????', 'house-arth'),
    person('morgaine-dreigiau', 'Morgaine', 'female', '????', '????', 'house-dreigiau', { familyRole: 'core' }),
    person('gingalain-pysgod', 'Gingalain Pysgod', 'male', '????', '????', 'house-pysgod'),

    // Gründerpaar
    person('vortigern-pendrag', 'Vortigern', 'male', '????', '????', PENDRAG_HOUSE_ID, { title: 'Erster König von Cenyr, Gründer des Hauses Pendrag' }),
    person('rhiannon-aderyn', 'Rhiannon Aderyn', 'female', '????', '????', 'house-aderyn'),

    // 2. Generation – Kinder Vortigerns & Rhiannons
    person('uther-pendrag', 'Uther Pendrag', 'male', '????', '????'),
    person('tanwen-pendrag', 'Tanwen Pendrag', 'female', '????', '????'),
    person('geraint-pendrag', 'Geraint Pendrag', 'male', '????', '????'),
    person('malagant-pendrag', 'Malagant Pendrag', 'male', '????', '????'),
    person('rhianu-draig', 'Rhianu', 'female', '????', '????', 'house-draig'),
    person('artus-draig', 'Artus', 'male', '????', '????', 'house-draig'),
    person('labhaoise-diulb', 'Labhaoise Diulb', 'female', '????', '????', 'house-diulb'),
    person('eithne-fiachraoin', 'Eithne Fiachraoin', 'female', '????', '????', 'house-fiachraoin'),

    // 3. Generation (nach der ersten Überlieferungslücke) – Kinder Uthers & Rhianus
    person('parzifal-pendrag', 'Parzifal Pendrag', 'male', '????', '????'),
    person('arianwyn-pendrag', 'Arianwyn Pendrag', 'female', '????', '????'),
    person('trystan-pendrag', 'Trystan Pendrag', 'male', '????', '????'),
    person('isobel-ancient-draig', 'Isobel', 'female', '????', '????', 'house-draig'),
    person('godwyn-draig', 'Godwyn', 'male', '????', '????', 'house-draig'),
    person('malltwyn-draig', 'Malltwyn', 'female', '????', '????', 'house-draig'),

    // 4. Generation – Sohn Parzifals & Isobels
    person('malon-pendrag', 'Malon Pendrag', 'male', '????', '????'),
    person('sinead-urquhart', 'Sinéad Urquhart', 'female', '????', '????', 'house-urquhart'),

    // 5. Generation – Kinder Malons & Sinéads
    person('melwas-pendrag', 'Melwas Pendrag', 'male', '????', '????'),
    person('rhoslyn-pendrag', 'Rhoslyn Pendrag', 'female', '????', '????'),
    person('rhonwen-dyngwn', 'Rhonwen Dyngwn', 'female', '????', '????', 'house-dyngwn'),
    person('ceirwyn-inlaw', 'Ceirwyn', 'male', '????', '????', 'house-ceirwyn'),

    // 6. Generation (nach der zweiten Lücke) – Kinder Melwas' & Rhonwens
    person('griflet-pendrag', 'Griflet Pendrag', 'male', '????', '????'),
    person('gwyneira-pendrag', 'Gwyneira Pendrag', 'female', '????', '????'),
    person('isolde-ancient-draig', 'Isolde', 'female', '????', '????', 'house-draig'),
    person('morholt-draig', 'Morholt', 'male', '????', '????', 'house-draig'),

    // 7. Generation (nach der dritten Lücke) – Kinder Griflets & Isoldes
    person('galahad-pendrag', 'Galahad Pendrag', 'male', '????', '1149'),
    person('cerridwyn-pendrag', 'Cerridwyn Pendrag', 'female', '1097', '1144'),
    person('gailis-diulb', 'Gailis Diulb', 'female', '1099', '1131', 'house-diulb'),
    person('marared-draig', 'Marared', 'male', '1095', '1169', 'house-draig'),

    // 8. Generation (nach der großen Lücke) – Kinder Galahads & Gailis'
    person('agravaine-pendrag', 'Agravaine Pendrag', 'male', '????', '1600'),
    person('rhodri-pendrag', 'Rhodri Pendrag', 'male', '????', '????', PENDRAG_HOUSE_ID, {
      notes: 'Vorverstorben vor seinem Bruder König Agravaine; sein Sohn Gawain erbte die Krone.'
    }),
    person('floraid-diulb', 'Floraid Diulb', 'female', '????', '????', 'house-diulb'),
    person('annegrit-vaeren', 'Annegrit Vaeren', 'female', '1548', '1572', 'house-vaeren'),

    // 9. Generation – Kinder Rhodris & Annegrits
    person('gawain-pendragon', 'Gawain Pendrag', 'male', '1551', '1623'),
    person('arianwen-pendragon', 'Arianwen Pendrag', 'female', '1562', '1633'),
    person('tarwen-pendrag', 'Tarwen Pendrag', 'female', '1572', '1643'),
    person('caitrin-draig', 'Caitrin', 'female', '1555', '1603', 'house-draig'),
    person('cunedda-draig', 'Cunedda', 'male', '1553', '1617', 'house-draig'),
    person('gingalain-1572-pysgod', 'Gingalain Pysgod', 'male', '1571', '1639', 'house-pysgod', {
      notes: 'Die Pysgod-Gegenakte belegt 1571–1639; die stabile Personen-ID bleibt unverändert.'
    }),

    // 10. Generation – Kinder Gawains & Caitrins
    person('gareth-pendrag', 'Gareth Pendrag', 'male', '1573', '1634'),
    person('iesin-pendrag', 'Iesin Pendrag', 'female', '1575', '1656'),
    person('blodeuyn-pendrag', 'Blodeuyn Pendrag', 'female', '1577', '1670'),
    person('olwyna-grael', 'Olwyna Grael', 'female', '1579', '1675', 'house-grael'),
    person('vorath-wylan', 'Vorath Wylan', 'male', '1575', '1645', 'house-wylan'),
    person('keudawg-illewod', 'Keudawg Illewod', 'male', '1580', '1647', 'house-illewod'),

    // 11. Generation – Sohn Gareths & Olwynas
    person('bors-pendrag', 'Bors Pendrag', 'male', '1600', '1653'),
    person('cariad-draenog', 'Cariad Draenog', 'female', '1606', '1683', 'house-draenog'),

    // 12. Generation – Kinder Bors' & Cariads
    person('artus-1622-pendrag', 'Artus Pendrag', 'male', '1622', '1673'),
    person('sulwen-pendrag', 'Sulwen Pendrag', 'female', '1625', '1700'),
    person('ector-1629-pendrag', 'Ector Pendrag', 'male', '1629', '1713'),
    person('parzifal-1630-pendrag', 'Parzifal Pendrag', 'male', '1630', '1655'),
    person('tor-pendrag', 'Tor Pendrag', 'male', '1632', '1701'),
    person('noirin-urquhart', 'Nóirin Urquhart', 'female', '1625', '1678', 'house-urquhart'),
    person('howell-neidr', 'Howell Neidr', 'male', '1623', '1701', 'house-neidr'),
    person('telyn-grawn', 'Telyn Grawn', 'female', '1633', '1707', 'house-grawn'),
    person('hefin-dieniddiwr', 'Hefin Dienyddiwr', 'female', '1632', '1700', 'house-dienyddiwr'),

    // 13. Generation
    person('uther-1643-pendrag', 'Uther Pendrag', 'male', '1643', '1678'),
    person('caradwyn-pendrag', 'Caradwyn Pendrag', 'female', '1645', '1717'),
    person('igraine-grawn', 'Igraine Grawn', 'female', '1645', '1725', 'house-grawn'),
    person('dungarth-aderyn', 'Dungarth Aderyn', 'male', '1643', '1705', 'house-aderyn'),
    person('meeghan-pendrag', 'Meeghan Pendrag', 'female', '1655', ''),
    person('lamorak-pendrag', 'Lamorak Pendrag', 'male', '1658', '1698'),
    person('cainneach-urquhart', 'Cainneach Urquhart', 'male', '1650', '', 'house-urquhart'),
    person('lynfa-penderyn', 'Lynfa Penderyn', 'female', '1660', '1702', 'house-penderyn'),
    person('bedivere-pendrag', 'Bedivere Pendrag', 'male', '1650', '1720'),
    person('fearchara-cetchathach', 'Fearchara Cétchathach', 'female', '1653', '1711', 'house-cetchathach'),

    // 14. Generation – Kinder Uther Pendrags (1643) & Igraines
    person('rywalyn-pendrag', 'Rywalyn Pendrag', 'male', '1663', '1720'),
    person('angharad-pendrag', 'Angharad Pendrag', 'female', '1665', '1720'),
    person('lucan-pendrag', 'Lucan Pendrag', 'male', '1678', '1720'),
    person('pelleas-pendrag', 'Pelleas Pendrag', 'male', '1671', ''),
    person('rhiannon-1673-pendrag', 'Rhiannon Pendrag', 'female', '1673', ''),
    person('rhodri-draig', 'Rhodri', 'male', '1662', '1720', 'house-draig'),
    person('caoimhe-roth', 'Caoimhe Roth', 'female', '1678', '1720', 'house-roth'),
    person('genyth-pysgod', 'Genyth Pysgod', 'female', '1673', '', 'house-pysgod'),
    person('trahayarn-grael', 'Trahayarn Grael', 'male', '1669', '', 'house-grael'),

    // 15. Generation
    person('talla-ceirwyn', 'Talla Ceirwyn', 'female', '1670', '1720', 'house-ceirwyn'),
    person('dystan-pendrag', 'Dystan Pendrag', 'male', '1691', '1720'),
    person('tristan-pendrag', 'Tristan Pendrag', 'male', '1694', '', PENDRAG_HOUSE_ID, { title: 'Regierender König von Cenyr' }),
    person('cei-pendrag', 'Cei Pendrag', 'male', '1696', '1720'),
    person('dylis-blodyn', 'Dylis Blodyn', 'female', '1698', '1720', 'house-blodyn'),
    person('isolde-arth', 'Isolde Arth', 'female', '1696', '', 'house-arth'),
    person('siabhan-rochraide', 'Siabhan Rochraide', 'female', '1700', '1720', 'house-rochraide'),
    person('ygraine-pendrag', 'Ygraine Pendrag', 'female', '1696', ''),
    person('owain-draig', 'Owain', 'male', '1694', '', 'house-draig'),
    person('hoyer-pendrag', 'Hoyer Pendrag', 'male', '1702', ''),
    person('siobhara-eisenherz', 'Siobhara Eisenherz', 'female', '1705', '', 'house-eisenherz'),

    // 16. Generation – Kinder König Tristans & Isoldes, unehl. Kinder Ygraines, Mündel
    person('elinor-pendrag', 'Elinor Pendrag', 'female', '1718', ''),
    person('rhodhri-1725-pendrag', 'Rhodhri Pendrag', 'male', '1725', '1730'),
    person('artus-1735-pendrag', 'Artus Pendrag', 'male', '1735', '1735'),
    person('lancelot-neidr', 'Lancelot Neidr', 'male', '1730', '', 'house-neidr', {
      familyRole: 'ward',
      title: 'Mündel des Hauses Neidr am Königshof'
    }),
    person('ector-1716-pendrag', 'Ector Pendrag', 'male', '1716', '', PENDRAG_HOUSE_ID, {
      familyRole: 'bastard', title: 'Legitimierter unehelicher Sohn'
    }),
    person('melwas-1716-pendrag', 'Melwas Pendrag', 'male', '1716', '', PENDRAG_HOUSE_ID, {
      familyRole: 'bastard', title: 'Legitimierter unehelicher Sohn'
    }),
    person('khepri-pendrag', 'Khepri', 'male', '1718', '', PENDRAG_HOUSE_ID, { familyRole: 'adopted', title: 'Von Ygraine adoptiert' }),
    person('gekas-pendrag', 'Gekas', 'male', '1718', '', PENDRAG_HOUSE_ID, { familyRole: 'adopted', title: 'Von Ygraine adoptiert' }),
    person('malon-1725-pendrag', 'Malon Pendrag', 'male', '1725', '')
  ],
  partnerships: [
    createMarriage('marriage-gwyrthern-gwendolyn', ...GWYRTHERN_IDS),
    createMarriage('marriage-rhonwen-dyngannon', 'rhonwen-dreigiau', 'dyngannon-paun'),
    createMarriage('marriage-kerrylin-mordred', 'kerrylin-dreigiau', 'mordred-blodyn'),
    createMarriage('marriage-vortimer-isolde', 'vortimer-dreigiau', 'isolde-teigr'),
    createMarriage('marriage-celtigern-findabhair', 'celtigern-draig', 'findabhair-cumhail'),
    createMarriage('marriage-gwenhwyfar-caradoc', 'gwenhwyfar-dreigiau', 'caradoc-arth'),
    createMarriage('marriage-morgaine-gingalain', 'morgaine-dreigiau', 'gingalain-pysgod'),
    createMarriage('marriage-vortigern-rhiannon', ...FOUNDER_IDS),
    createMarriage('marriage-rhianu-uther', ...UTHER1_IDS),
    createMarriage('marriage-artus-tanwen', ...TANWEN_IDS),
    createMarriage('marriage-geraint-labhaoise', ...GERAINT_IDS),
    createMarriage('marriage-malagant-eithne', ...MALAGANT_IDS),
    createMarriage('marriage-isobel-parzifal', ...PARZIFAL1_IDS),
    createMarriage('marriage-godwyn-arianwyn', ...ARIANWYN_IDS),
    createMarriage('marriage-malltwyn-trystan', ...TRYSTAN_IDS),
    createMarriage('marriage-malon-sinead', ...MALON1_IDS),
    createMarriage('marriage-melwas-rhonwen', ...MELWAS1_IDS),
    createMarriage('marriage-rhoslyn-ceirwyn', ...RHOSLYN_IDS),
    createMarriage('marriage-sulwen-howell', ...SULWEN_IDS),
    createMarriage('marriage-isolde-griflet', ...GRIFLET1_IDS),
    createMarriage('marriage-morholt-gwyneira', ...GWYNEIRA_IDS),
    createMarriage('marriage-galahad-gailis', ...GALAHAD1_IDS),
    createMarriage('marriage-marared-cerridwyn', ...CERRIDWYN_IDS),
    createMarriage('marriage-agravaine-floraid', ...AGRAVAINE_IDS),
    createMarriage('marriage-rhodri-annegrit', ...RHODRI1_IDS),
    createMarriage('marriage-caitrin-gawain', ...GAWAIN_IDS),
    createMarriage('marriage-cunedda-arianwen', ...ARIANWEN_IDS),
    createMarriage('marriage-tarwen-gingalain', ...TARWEN_IDS),
    createMarriage('marriage-gareth-olwyna', ...GARETH_IDS),
    createMarriage('marriage-iesin-vorath', ...IESIN_IDS),
    createMarriage('marriage-blodeuyn-keudawg', ...BLODEUYN_IDS),
    createMarriage('marriage-bors-cariad', ...BORS_IDS),
    createMarriage('marriage-artus1622-noirin', ...ARTUS2_IDS),
    createMarriage('marriage-ector1629-telyn', ...ECTOR1_IDS),
    createMarriage('marriage-tor-hefin', ...TOR_IDS),
    createMarriage('marriage-uther1643-igraine', ...UTHER2_IDS),
    createMarriage('marriage-caradwyn-dungarth', ...CARADWYN_IDS),
    createMarriage('marriage-meeghan-cainneach', ...MEEGHAN_IDS),
    createMarriage('marriage-lamorak-lynfa', ...LAMORAK_IDS),
    createMarriage('marriage-bedivere-fearchara', ...BEDIVERE_IDS),
    createMarriage('marriage-rywalyn-talla', ...RYWALYN_IDS),
    createMarriage('marriage-rhodri-angharad', ...ANGHARAD_IDS),
    createMarriage('marriage-lucan-caoimhe', ...LUCAN_IDS),
    createMarriage('marriage-pelleas-genyth', ...PELLEAS_IDS),
    createMarriage('marriage-rhiannon1673-trahayarn', ...RHIANNON2_IDS),
    createMarriage('marriage-dystan-dylis', ...DYSTAN_IDS),
    createMarriage('marriage-tristan-isolde', ...TRISTAN_IDS),
    createMarriage('marriage-cei-siabhan', ...CEI_IDS),
    createMarriage('affair-ygraine-owain', ...AFFAIR_YGRAINE_IDS, { type: 'affair', status: 'ended' }),
    createMarriage('marriage-hoyer-siobhara', ...HOYER_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['vortimer-dreigiau', 'vortigern-pendrag', 'celtigern-draig', 'gwenhwyfar-dreigiau', 'morgaine-dreigiau'],
      GWYRTHERN_IDS,
      'marriage-gwyrthern-gwendolyn'
    ),
    ...childrenOf(['uther-pendrag', 'tanwen-pendrag', 'geraint-pendrag', 'malagant-pendrag'], FOUNDER_IDS, 'marriage-vortigern-rhiannon'),
    ...childrenOf(['parzifal-pendrag', 'arianwyn-pendrag', 'trystan-pendrag'], UTHER1_IDS, 'marriage-rhianu-uther'),
    ...childrenOf(['malon-pendrag'], PARZIFAL1_IDS, 'marriage-isobel-parzifal'),
    ...childrenOf(['melwas-pendrag', 'rhoslyn-pendrag'], MALON1_IDS, 'marriage-malon-sinead'),
    ...childrenOf(['griflet-pendrag', 'gwyneira-pendrag'], MELWAS1_IDS, 'marriage-melwas-rhonwen'),
    ...childrenOf(['galahad-pendrag', 'cerridwyn-pendrag'], GRIFLET1_IDS, 'marriage-isolde-griflet'),
    ...childrenOf(['agravaine-pendrag', 'rhodri-pendrag'], GALAHAD1_IDS, 'marriage-galahad-gailis'),
    ...childrenOf(['gawain-pendragon', 'arianwen-pendragon', 'tarwen-pendrag'], RHODRI1_IDS, 'marriage-rhodri-annegrit'),
    ...childrenOf(['gareth-pendrag', 'iesin-pendrag', 'blodeuyn-pendrag'], GAWAIN_IDS, 'marriage-caitrin-gawain'),
    ...childrenOf(['bors-pendrag'], GARETH_IDS, 'marriage-gareth-olwyna'),
    ...childrenOf(['artus-1622-pendrag', 'sulwen-pendrag', 'ector-1629-pendrag', 'parzifal-1630-pendrag', 'tor-pendrag'], BORS_IDS, 'marriage-bors-cariad'),
    ...childrenOf(['uther-1643-pendrag', 'caradwyn-pendrag'], ARTUS2_IDS, 'marriage-artus1622-noirin'),
    ...childrenOf(['meeghan-pendrag', 'lamorak-pendrag'], ECTOR1_IDS, 'marriage-ector1629-telyn'),
    ...childrenOf(['bedivere-pendrag'], TOR_IDS, 'marriage-tor-hefin'),
    ...childrenOf(['rywalyn-pendrag', 'angharad-pendrag'], UTHER2_IDS, 'marriage-uther1643-igraine'),
    ...childrenOf(['lucan-pendrag'], LAMORAK_IDS, 'marriage-lamorak-lynfa'),
    ...childrenOf(['pelleas-pendrag', 'rhiannon-1673-pendrag'], BEDIVERE_IDS, 'marriage-bedivere-fearchara'),
    ...childrenOf(['dystan-pendrag', 'tristan-pendrag'], RYWALYN_IDS, 'marriage-rywalyn-talla'),
    ...childrenOf(['cei-pendrag'], LUCAN_IDS, 'marriage-lucan-caoimhe'),
    ...childrenOf(['ygraine-pendrag'], LUCAN_IDS, 'marriage-lucan-caoimhe'),
    ...childrenOf(['hoyer-pendrag'], PELLEAS_IDS, 'marriage-pelleas-genyth'),
    ...childrenOf(['elinor-pendrag', 'rhodhri-1725-pendrag', 'artus-1735-pendrag'], TRISTAN_IDS, 'marriage-tristan-isolde'),
    ...childrenOf(['lancelot-neidr'], TRISTAN_IDS, '', {
      type: 'foster', legitimacy: 'unknown', notes: 'Mündel, das Haus Neidr an Haus Pendrag gegeben hat.'
    }),
    ...childrenOf(['ector-1716-pendrag', 'melwas-1716-pendrag'], AFFAIR_YGRAINE_IDS, 'affair-ygraine-owain', {
      legitimacy: 'legitimized', notes: 'Nachträglich legitimierte Bastarde aus Ygraines Affäre mit Owain Draig.'
    }),
    ...childrenOf(['khepri-pendrag', 'gekas-pendrag'], ['ygraine-pendrag'], '', {
      type: 'adoptive', legitimacy: 'unknown', notes: 'Nur von Ygraine adoptiert, nicht leiblich.'
    }),
    ...childrenOf(['malon-1725-pendrag'], HOYER_IDS, 'marriage-hoyer-siobhara')
  ],
  cadetBranches: [
    cadetHouse(
      'cadet-grael-trystan', 'Haus Grael', 'marriage-malltwyn-trystan', 'house-grael',
      'Trystan Pendrag und Malltwyn Draig begründen das Kadettenhaus Grael.', HOUSE_EMBLEMS.grael
    ),
    marriedAway('married-away-draig-tanwen', 'Haus Draig', 'marriage-artus-tanwen', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-draig-arianwyn', 'Haus Draig', 'marriage-godwyn-arianwyn', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-draig-gwyneira', 'Haus Draig', 'marriage-morholt-gwyneira', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-draig-cerridwyn', 'Haus Draig', 'marriage-marared-cerridwyn', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-draig-arianwen', 'Haus Draig', 'marriage-cunedda-arianwen', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-draig-angharad', 'Haus Draig', 'marriage-rhodri-angharad', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-ceirwyn-rhoslyn', 'Haus Ceirwyn', 'marriage-rhoslyn-ceirwyn', 'house-ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    marriedAway('married-away-neidr-sulwen', 'Haus Neidr', 'marriage-sulwen-howell', 'house-neidr'),
    marriedAway('married-away-pysgod-tarwen', 'Haus Pysgod', 'marriage-tarwen-gingalain', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-wylan-iesin', 'Haus Wylan', 'marriage-iesin-vorath', 'house-wylan'),
    marriedAway('married-away-illewod-blodeuyn', 'Haus Illewod', 'marriage-blodeuyn-keudawg', 'house-illewod'),
    marriedAway('married-away-aderyn-caradwyn', 'Haus Aderyn', 'marriage-caradwyn-dungarth', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-urquhart-meeghan', 'Haus Urquhart', 'marriage-meeghan-cainneach', 'house-urquhart'),
    marriedAway('married-away-grael-rhiannon', 'Haus Grael', 'marriage-rhiannon1673-trahayarn', 'house-grael', HOUSE_EMBLEMS.grael)
  ],
  timeJumps: [
    {
      id: 'gap-uther-parzifal', parentPartnershipId: 'marriage-rhianu-uther', childIds: ['parzifal-pendrag', 'arianwyn-pendrag', 'trystan-pendrag'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: '', extensions: {}
    },
    {
      id: 'gap-parzifal-malon', parentPartnershipId: 'marriage-isobel-parzifal', childIds: ['malon-pendrag'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: '', extensions: {}
    },
    {
      id: 'gap-melwas-griflet', parentPartnershipId: 'marriage-melwas-rhonwen', childIds: ['griflet-pendrag', 'gwyneira-pendrag'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen', notes: '', extensions: {}
    },
    {
      id: 'gap-griflet-galahad', parentPartnershipId: 'marriage-isolde-griflet', childIds: ['galahad-pendrag', 'cerridwyn-pendrag'],
      years: 0, fromYear: '????', toYear: '1097', label: 'Die datierte Überlieferung setzt 1097 wieder ein', notes: '', extensions: {}
    },
    {
      id: 'gap-galahad-agravaine', parentPartnershipId: 'marriage-galahad-gailis', childIds: ['agravaine-pendrag', 'rhodri-pendrag'],
      years: 0, fromYear: '1149', toYear: '1548', label: 'Die große Überlieferungslücke nach Galahads Tod', notes: 'Erst mit Annegrit Vaeren (geb. 1548) setzt die datierte Überlieferung wieder ein.', extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-vortigern-rhiannon',
    houseId: PENDRAG_HOUSE_ID,
    crestSubtitle: 'Königsgeschlecht',
    crestEmblemScale: 0.86,
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
      notes: 'Vorgelagertes Ursprungshaus: Vortigern und Celtigern (Haus Draig) sind Brüder aus dieser Generation.'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'vortigern-pendrag',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceRevision: 4,
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems'],
    registryManagedRecordFields: ['folderPath']
  }
});
