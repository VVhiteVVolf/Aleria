import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CENYR_COUNTY_HOUSE_PROFILES } from './cenyr-county-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createLinkedLineBranch,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  canwyll: SILBERINSEL_HOUSE_EMBLEMS.canwyll,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  illewod: 'assets/images/houses/Sonnenküste/haus-illewod.png',
  muirghin: SILBERINSEL_HOUSE_EMBLEMS['tir-an-muirghin'],
  neidr: SILBERINSEL_HOUSE_EMBLEMS.neidr,
  pendrag: 'assets/images/houses/Vortigerns Ruh/haus-pendrag.png',
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  pyrth: SILBERINSEL_HOUSE_EMBLEMS.pyrth,
  saith: SILBERINSEL_HOUSE_EMBLEMS.saith,
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  tiwna: SILBERINSEL_HOUSE_EMBLEMS.tiwna,
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
});

const NEIDR_HOUSE_ID = 'house-neidr';
const REGISTRY_MANAGED_HOUSE_BRANCH_FIELDS = Object.freeze([
  'name',
  'subtitle',
  'linkType',
  'parentPartnershipId',
  'houseId',
  'emblem',
  'targetFamilyId',
  'notes'
]);
const HOUSE_HEAD_IDS = new Set([
  'gawan-neidr',
  'gwyron-neidr',
  'owain-neidr',
  'cadoc-neidr',
  'merwin-neidr',
  'powell-neidr',
  'gwythyr-neidr',
  'daffyd-neidr',
  'gwynnan-neidr',
  'howell-neidr',
  'gaenor-neidr',
  'aeron-neidr',
  'yvain-neidr'
]);
const MAIN_LINE_IDS = new Set(['gwynfor-neidr', 'lancelot-neidr']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = NEIDR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_NEIDR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === NEIDR_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function emblemForHouseId(houseId) {
  return HOUSE_EMBLEMS[String(houseId || '').replace(/^house-/, '')] || '';
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
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

function houseSprout(id, name, partnershipId, houseId, notes) {
  const branch = createCadetHouseBranch({
    id,
    name,
    subtitle: 'Spross',
    parentPartnershipId: partnershipId,
    houseId,
    emblem: emblemForHouseId(houseId),
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    notes
  });
  return {
    ...branch,
    extensions: {
      ...branch.extensions,
      registryManagedFields: [...REGISTRY_MANAGED_HOUSE_BRANCH_FIELDS]
    }
  };
}

const FOUNDER_IDS = ['gawan-neidr', 'mallaidh-muirghin'];
const GWYRON_IDS = ['gwyron-neidr', 'sabria-illewod'];
const OWAIN_IDS = ['owain-neidr', 'emer-ailella'];
const CADOC_IDS = ['cadoc-neidr', 'fionnghula-luga'];
const MERWIN_IDS = ['merwin-neidr', 'elinor-saith'];
const POWELL_IDS = ['powell-neidr', 'dolena-canwyll'];
const GWYTHYR_IDS = ['gwythyr-neidr', 'quendolin-canwyll'];
const DAFFYD_IDS = ['daffyd-neidr', 'bettrys-wylan'];
const GWYNNAN_IDS = ['gwynnan-neidr', 'enya-luga'];
const HOWELL_IDS = ['howell-neidr', 'sulwen-pendrag'];
const GRIFF_IDS = ['griff-neidr', 'karys-illewod'];
const GILDAS_IDS = ['gildas-neidr', 'meiriona-tiwna'];
const GAENOR_IDS = ['gaenor-neidr', 'elenydd-draig'];
const LLYWELLYN_IDS = ['llywellyn-neidr', 'dolena-saethwyr'];
const TALAN_IDS = ['talan-neidr', 'caylee-magach'];
const AERON_IDS = ['aeron-neidr', 'gorm-canwyll'];
const CYNAN_IDS = ['cynan-neidr', 'carwyn-aderyn'];
const CONWY_IDS = ['conwy-neidr', 'aeronwen-canwyll'];
const YVAIN_IDS = ['yvain-neidr', 'morgana-wylan'];
const GWASTAD_IDS = ['gwastad-neidr', 'falka-trachwyll'];
const ODYAR_IDS = ['odyar-neidr', 'ariana-saith'];
const NINIAN_IDS = ['ninian-neidr', 'crystin-crefyddol'];
const RHON_IDS = ['rhon-neidr', 'afanen-morforwyn'];

export const HOUSE_NEIDR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-neidr',
    title: 'Haus Neidr',
    motto: 'Hau gwybodaeth, medi doethineb. – Wissen säen, Weisheit ernten.',
    description: 'Die Grafenlinie des Hauses Neidr O\'Llanvane auf der Silberinsel, von Gawan bis zur im Jahr 1740 lebenden Generation.',
    emblem: HOUSE_EMBLEMS.neidr,
    houseProfile: CENYR_COUNTY_HOUSE_PROFILES.neidr
  },
  houses: [
    house(NEIDR_HOUSE_ID, 'Haus Neidr', HOUSE_EMBLEMS.neidr),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-ailella', 'Haus Ailella'),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-canwyll', 'Haus Canwyll', HOUSE_EMBLEMS.canwyll),
    house('house-crefyddol', 'Haus Crefyddol', HOUSE_EMBLEMS.crefyddol),
    house('house-draenog', 'Haus Draenog', GRAUE_WEITE_HOUSE_EMBLEMS.draenog),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-dyngwn', 'Haus Dyngwn'),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-luga', 'Haus Luga'),
    house('house-magach', 'Haus Magach'),
    house('house-morforwyn', 'Haus Morforwyn'),
    house('house-muirghin', 'Tir An Muirghin', HOUSE_EMBLEMS.muirghin),
    house('house-pawen', 'Haus Pawen'),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-pyrth', 'Haus Pyrth', HOUSE_EMBLEMS.pyrth),
    house('house-pysgod', 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-saith', 'Haus Saith', HOUSE_EMBLEMS.saith),
    house('house-tiwna', 'Haus Tiwna', HOUSE_EMBLEMS.tiwna),
    house('house-trachwyll', 'Haus Trachwyll'),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan)
  ],
  persons: [
    // Gründer und erste direkt überlieferte Generation
    person('gawan-neidr', 'Gawan Neidr', 'male', '????', '????', NEIDR_HOUSE_ID, {
      title: 'Begründer des Grafenhauses Neidr'
    }),
    person('mallaidh-muirghin', 'Mallaidh Muirghin', 'female', '????', '????', 'house-muirghin'),
    person('gwyron-neidr', 'Gwyron Neidr', 'male', '????', '????'),
    person('gwennan-neidr', 'Gwennan Neidr', 'female', '????', '????'),
    person('sabria-illewod', 'Sabria Illewod', 'female', '????', '????', 'house-illewod'),
    person('bors-saith', 'Bors Saith', 'male', '????', '????', 'house-saith', {
      title: 'Begründer des Hauses Saith',
      extensions: { registryManagedFields: ['title'] }
    }),

    // Nach der ersten Überlieferungslücke
    person('owain-neidr', 'Owain Neidr', 'male', '????', '????'),
    person('emer-ailella', 'Emer Ailella', 'female', '????', '????', 'house-ailella'),
    person('cadoc-neidr', 'Cadoc Neidr', 'male', '????', '????'),
    person('caitrin-neidr', 'Caitrin Neidr', 'female', '????', '????'),
    person('fionnghula-luga', 'Fionnghula Luga', 'female', '????', '????', 'house-luga'),
    person('morholt-pysgod', 'Morholt Pysgod', 'male', '????', '????', 'house-pysgod', {
      title: 'Begründer des Hauses Tiwna',
      extensions: { registryManagedFields: ['title'] }
    }),

    // Nach der zweiten Überlieferungslücke
    person('merwin-neidr', 'Merwin Neidr', 'male', '????', '????'),
    person('jinelle-neidr', 'Jinelle Neidr', 'female', '????', '????'),
    person('elinor-saith', 'Elinor Saith', 'female', '????', '????', 'house-saith'),
    person('sieffre-der-fromme', 'Sieffre der Fromme', 'male', '????', '????', '', {
      title: 'Heiliger Priester · Stammvater der Bruderhäuser Crefyddol und Canwyll',
      extensions: { cardFrameId: 'holy', registryManagedFields: ['title'] }
    }),

    // Nach der dritten Überlieferungslücke
    person('powell-neidr', 'Powell Neidr', 'male', '????', '????'),
    person('llynn-neidr', 'Llynn Neidr', 'female', '????', '????'),
    person('dolena-canwyll', 'Dolena Canwyll', 'female', '????', '????', 'house-canwyll'),
    person('roderic-pyrth', 'Roderic Pyrth', 'male', '????', '????', 'house-pyrth', {
      title: 'Begründer des Hauses Pyrth',
      extensions: { registryManagedFields: ['title'] }
    }),

    // Nach der vierten Überlieferungslücke
    person('gwythyr-neidr', 'Gwythyr Neidr', 'male', '????', '????'),
    person('maygan-elder-neidr', 'Maygan Neidr', 'female', '????', '????'),
    person('quendolin-canwyll', 'Quendolin Canwyll', 'female', '????', '????', 'house-canwyll'),
    person('rheidwn-wylan', 'Rheidwn Wylan', 'male', '????', '????', 'house-wylan'),

    // Datierte Linie ab Daffyds Generation
    person('daffyd-neidr', 'Daffyd Neidr', 'male', '1555', '1593'),
    person('igraine-neidr', 'Igraine Neidr', 'female', '1579', '????'),
    person('bettrys-wylan', 'Bettrys Wylan', 'female', '1558', '????', 'house-wylan'),
    person('mari', 'Mari', 'female', '1565', '????', '', { familyRole: 'affair' }),
    person('banw', 'Banw', 'female', '1573', '????', '', { familyRole: 'affair' }),
    person('morien-crefyddol', 'Morien Crefyddol', 'male', '1587', '????', 'house-crefyddol'),
    person('gwynnan-neidr', 'Gwynnan Neidr', 'male', '1591', '1653'),
    person('aoirghe-neidr', 'Aoirghe Neidr', 'female', '1594', '????'),
    person('gwyneth-neidr', 'Gwyneth Neidr', 'female', '1588', '', NEIDR_HOUSE_ID, {
      familyRole: 'bastard',
      title: 'Uneheliche Tochter Daffyds und Banws'
    }),
    person('prynhawn-neidr', 'Prynhawn Neidr', 'female', '1608', '1655', NEIDR_HOUSE_ID, {
      notes: 'Die ausgearbeitete Pyrth-Hausquelle belegt ihre Lebensdaten und Ehe mit Jowaneth Pyrth.'
    }),
    person('enya-luga', 'Enya Luga', 'female', '????', '????', 'house-luga'),
    person('morgan-dyngwn', 'Morgan Dyngwn', 'male', '1588', '????', 'house-dyngwn', {
      notes: 'Die Grael-Gegenakte kennzeichnet Morgan trotz unbekannten Todesjahrs ausdrücklich als verstorben.',
      extensions: { registryManagedFields: ['death', 'status', 'notes'] }
    }),
    person('lancelot-draig', 'Lancelot Draig', 'male', '1411', '', 'house-draig'),
    person('iowaneth-pyrth', 'Jowaneth Pyrth', 'male', '1608', '1679', 'house-pyrth', {
      notes: 'Die ausgearbeitete Pyrth-Hausquelle führt ihn als Ritterfürsten des Hauses Pyrth von 1662 bis 1679.'
    }),

    // Kinder Gwynnan Neidrs und Enya Lugas
    person('howell-neidr', 'Howell Neidr', 'male', '1623', '1701'),
    person('griff-neidr', 'Griff Neidr', 'male', '1625', '1699'),
    person('gladdie-neidr', 'Gladdie Neidr', 'female', '1627', '1699'),
    person('gwenhwyfar-neidr', 'Gwenhwyfar Neidr', 'female', '1627', '1705'),
    person('gildas-neidr', 'Gildas Neidr', 'male', '1630', '1662'),
    person('sulwen-pendrag', 'Sulwen Pendrag', 'female', '1625', '1700', 'house-pendrag'),
    person('karys-illewod', 'Karys Illewod', 'female', '1628', '1681', 'house-illewod'),
    person('beynon-crefyddol', 'Beynon Crefyddol', 'male', '1628', '1713', 'house-crefyddol'),
    person('brinthan-pyrth', 'Brinthan Pyrth', 'male', '1627', '1703', 'house-pyrth'),
    person('meiriona-tiwna', 'Meiriona Tiwna', 'female', '1632', '1669', 'house-tiwna'),

    // Enkel Gwynnan Neidrs
    person('gaenor-neidr', 'Gaenor Neidr', 'male', '1646', '1711'),
    person('llywellyn-neidr', 'Llywellyn Neidr', 'male', '1650', '1734'),
    person('rohella-neidr', 'Rohella Neidr', 'female', '1647', '????'),
    person('lleulu-neidr', 'Lleulu Neidr', 'female', '1657', ''),
    person('talan-neidr', 'Talan Neidr', 'male', '1659', '1710'),
    person('jinell-neidr', 'Jinell Neidr', 'female', '1659', '1703'),
    person('elenydd-draig', 'Elenydd Draig', 'female', '1651', '1723', 'house-draig'),
    person('dolena-saethwyr', 'Dolena Saethwyr', 'female', '1652', '????', 'house-saethwyr'),
    person('petyr-grawn', 'Petyr Grawn', 'male', '1644', '1702', 'house-grawn'),
    person('caylee-magach', 'Caylee Magach', 'female', '1660', '1715', 'house-magach'),
    person('hetwn-saith', 'Hetwn Saith', 'male', '1654', '1717', 'house-saith'),

    // Generation Aeron, Genofeva, Cynan, Lunet, Rhiannon und Conwy
    person('aeron-neidr', 'Aeron Neidr', 'male', '1671', '1720'),
    person('genofeva-neidr', 'Genofeva Neidr', 'female', '1679', ''),
    person('cynan-neidr', 'Cynan Neidr', 'male', '1673', ''),
    person('lunet-neidr', 'Lunet Neidr', 'female', '1672', ''),
    person('rhiannon-neidr', 'Rhiannon Neidr', 'female', '1676', ''),
    person('conwy-neidr', 'Conwy Neidr', 'male', '1678', ''),
    person('gorm-canwyll', 'Gorm Canwyll', 'female', '1673', '', 'house-canwyll'),
    person('lamorak-pawen', 'Lamorak Pawen', 'male', '1678', '', 'house-pawen'),
    person('carwyn-aderyn', 'Carwyn Aderyn', 'female', '1675', '', 'house-aderyn'),
    person('mathonwy-draenog', 'Mathonwy Draenog', 'male', '1670', '', 'house-draenog'),
    person('cadoc-canwyll', 'Cadoc Canwyll', 'male', '1671', '', 'house-canwyll'),
    person('aeronwen-canwyll', 'Aeronwen Canwyll', 'female', '1678', '', 'house-canwyll'),

    // Generation Gwal bis Ael
    person('gwal-neidr', 'Gwal Neidr', 'male', '1691', '1720'),
    person('yvain-neidr', 'Yvain Neidr', 'male', '1693', '', NEIDR_HOUSE_ID, {
      title: 'Regierender Graf von Llanvane seit 1720'
    }),
    person('dilwen-neidr', 'Dilwen Neidr', 'female', '1694', ''),
    person('gwastad-neidr', 'Gwastad Neidr', 'male', '1696', ''),
    person('odyar-neidr', 'Odyar Neidr', 'male', '1697', ''),
    person('ninian-neidr', 'Ninian Neidr', 'male', '1699', ''),
    person('rhon-neidr', 'Rhon Neidr', 'male', '1698', ''),
    person('ael-neidr', 'Ael Neidr', 'female', '1700', ''),
    person('morgana-wylan', 'Morgana Wylan', 'female', '1694', '', 'house-wylan'),
    person('morholt-tiwna', 'Morholt Tiwna', 'male', '1690', '', 'house-tiwna'),
    person('falka-trachwyll', 'Falka Trachwyll', 'female', '1699', '', 'house-trachwyll'),
    person('ariana-saith', 'Ariana Saith', 'female', '1698', '', 'house-saith'),
    person('crystin-crefyddol', 'Crystin Crefyddol', 'female', '1700', '', 'house-crefyddol'),
    person('afanen-morforwyn', 'Afanen Morforwyn', 'female', '1692', '', 'house-morforwyn'),
    person('merrion-crefyddol', 'Merrion Crefyddol', 'male', '1698', '', 'house-crefyddol'),

    // Im Jahr 1740 lebende jüngste Generation
    person('gwennah-neidr', 'Gwennah Neidr', 'female', '1720', ''),
    person('guinevere-neidr', 'Guinevere Neidr', 'female', '1722', '', NEIDR_HOUSE_ID, {
      familyRole: 'ward-away',
      title: 'Weggegebenes Mündel bei Haus Draig',
      tags: ['Fortgegebenes Mündel'],
      notes: 'Guinevere bleibt ein leiblicher Spross des Hauses Neidr, wurde aber als Mündel an Galahad Draig und Gwendolyn Aderyn gegeben.',
      extensions: { registryManagedFields: ['familyRole', 'title', 'tags', 'notes'] }
    }),
    person('gwynfor-neidr', 'Gwynfor Neidr', 'male', '1725', '', NEIDR_HOUSE_ID, {
      title: 'Erster in der Erbfolge des Hauses Neidr'
    }),
    person('lancelot-neidr', 'Lancelot Neidr', 'male', '1730', '', NEIDR_HOUSE_ID, {
      familyRole: 'ward-away',
      title: 'Zweiter in der Erbfolge · Weggegebenes Mündel bei Haus Pendrag',
      tags: ['Fortgegebenes Mündel'],
      notes: 'Lancelot bleibt ein leiblicher Spross und Erbe des Hauses Neidr, wurde aber als Mündel an König Tristan Pendrag und Isolde Arth gegeben.',
      extensions: { registryManagedFields: ['familyRole', 'title', 'tags', 'notes'] }
    }),
    person('rigis-neidr', 'Rigis Neidr', 'male', '1723', ''),
    person('padrig-neidr', 'Padrig Neidr', 'male', '1728', ''),
    person('arian-neidr', 'Arian Neidr', 'male', '1724', ''),
    person('eilir-neidr', 'Eilir Neidr', 'female', '1733', ''),
    person('carolyn-neidr', 'Carolyn Neidr', 'female', '1722', ''),
    person('maygan-younger-neidr', 'Maygan Neidr', 'female', '1724', ''),
    person('ifan-neidr', 'Ifan Neidr', 'male', '1727', ''),
    person('carantec-neidr', 'Carantec Neidr', 'male', '1722', ''),
    person('harri-neidr', 'Harri Neidr', 'male', '1731', ''),

    // Gegenseitige Pflege- und Verlobungsverbindungen zu Draig und Pendrag
    person('galahad-draig', 'Galahad Draig', 'male', '1695', '', 'house-draig'),
    person('gwendolyn-aderyn', 'Gwendolyn Aderyn', 'female', '1695', '', 'house-aderyn'),
    person('gawain-draig', 'Gawain Draig', 'male', '1722', '', 'house-draig'),
    person('tristan-pendrag', 'Tristan Pendrag', 'male', '1694', '', 'house-pendrag'),
    person('isolde-arth', 'Isolde Arth', 'female', '1696', '', 'house-arth')
  ],
  partnerships: [
    createMarriage('marriage-gawan-mallaidh', ...FOUNDER_IDS),
    createMarriage('marriage-sabria-gwyron', 'sabria-illewod', 'gwyron-neidr'),
    createMarriage('marriage-gwennan-bors', 'gwennan-neidr', 'bors-saith'),
    createMarriage('marriage-owain-emer', ...OWAIN_IDS),
    createMarriage('marriage-cadoc-fionnghula', ...CADOC_IDS),
    createMarriage('marriage-caitrin-morholt', 'caitrin-neidr', 'morholt-pysgod'),
    createMarriage('marriage-merwin-elinor', ...MERWIN_IDS),
    createMarriage('marriage-jinelle-sieffre', 'jinelle-neidr', 'sieffre-der-fromme', {
      notes: 'Aus der Verbindung gingen Llwyarch, Gründer von Crefyddol, und Llwellyn, Gründer von Canwyll, hervor.',
      extensions: { registryManagedFields: ['notes'] }
    }),
    createMarriage('marriage-powell-dolena', ...POWELL_IDS),
    createMarriage('marriage-llynn-roderic', 'llynn-neidr', 'roderic-pyrth'),
    createMarriage('marriage-gwythyr-quendolin', ...GWYTHYR_IDS),
    createMarriage('marriage-maygan-rheidwn', 'maygan-elder-neidr', 'rheidwn-wylan'),
    createMarriage('marriage-daffyd-bettrys', ...DAFFYD_IDS),
    createMarriage('affair-daffyd-mari', 'daffyd-neidr', 'mari', { type: 'affair', status: 'ended' }),
    createMarriage('affair-daffyd-banw', 'daffyd-neidr', 'banw', { type: 'affair', status: 'ended' }),
    createMarriage('marriage-igraine-morien', 'igraine-neidr', 'morien-crefyddol'),
    createMarriage('marriage-gwynnan-enya', ...GWYNNAN_IDS),
    createMarriage('marriage-aoirghe-morgan', 'aoirghe-neidr', 'morgan-dyngwn'),
    createMarriage('marriage-lancelot-gwyneth', 'lancelot-draig', 'gwyneth-neidr'),
    createMarriage('union-prynhawn-iowaneth', 'prynhawn-neidr', 'iowaneth-pyrth', {
      status: 'ended',
      end: '1655',
      notes: 'Die ausgearbeitete Pyrth-Hausquelle belegt diese Verbindung als Ehe.'
    }),
    createMarriage('marriage-sulwen-howell', 'sulwen-pendrag', 'howell-neidr'),
    createMarriage('marriage-karys-griff', 'karys-illewod', 'griff-neidr'),
    createMarriage('marriage-gladdie-beynon', 'gladdie-neidr', 'beynon-crefyddol'),
    createMarriage('marriage-gwenhwyfar-brinthan', 'gwenhwyfar-neidr', 'brinthan-pyrth'),
    createMarriage('marriage-gildas-meiriona', ...GILDAS_IDS),
    createMarriage('marriage-elenydd-gaenor', 'elenydd-draig', 'gaenor-neidr'),
    createMarriage('marriage-dolena-llywellyn', 'dolena-saethwyr', 'llywellyn-neidr'),
    createMarriage('marriage-rohella-petyr', 'rohella-neidr', 'petyr-grawn'),
    createMarriage('marriage-talan-caylee', ...TALAN_IDS),
    createMarriage('marriage-jinell-hetwn', 'jinell-neidr', 'hetwn-saith'),
    createMarriage('marriage-aeron-gorm', ...AERON_IDS),
    createMarriage('marriage-genofeva-lamorak', 'genofeva-neidr', 'lamorak-pawen'),
    createMarriage('marriage-cynan-carwyn', ...CYNAN_IDS),
    createMarriage('marriage-lunet-mathonwy', 'lunet-neidr', 'mathonwy-draenog'),
    createMarriage('marriage-rhiannon-cadoc', 'rhiannon-neidr', 'cadoc-canwyll'),
    createMarriage('marriage-conwy-aeronwen', ...CONWY_IDS),
    createMarriage('marriage-yvain-morgana', ...YVAIN_IDS),
    createMarriage('marriage-dilwen-morholt', 'dilwen-neidr', 'morholt-tiwna'),
    createMarriage('marriage-gwastad-falka', ...GWASTAD_IDS),
    createMarriage('marriage-odyar-ariana', ...ODYAR_IDS),
    createMarriage('marriage-ninian-crystin', ...NINIAN_IDS),
    createMarriage('marriage-rhon-afanen', ...RHON_IDS),
    createMarriage('marriage-ael-merrion', 'ael-neidr', 'merrion-crefyddol'),
    createMarriage('engagement-gawain-guinevere', 'gawain-draig', 'guinevere-neidr', {
      type: 'engagement',
      status: 'active'
    }),
    createMarriage('marriage-galahad-gwendolyn', 'galahad-draig', 'gwendolyn-aderyn'),
    createMarriage('marriage-tristan-isolde', 'tristan-pendrag', 'isolde-arth')
  ],
  parentages: [
    ...childrenOf(['gwyron-neidr', 'gwennan-neidr'], FOUNDER_IDS, 'marriage-gawan-mallaidh'),
    ...childrenOf(['owain-neidr'], GWYRON_IDS, 'marriage-sabria-gwyron', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-gwyron-owain' }
    }),
    ...childrenOf(['cadoc-neidr', 'caitrin-neidr'], OWAIN_IDS, 'marriage-owain-emer'),
    ...childrenOf(['merwin-neidr', 'jinelle-neidr'], CADOC_IDS, 'marriage-cadoc-fionnghula', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-cadoc-merwin' }
    }),
    ...childrenOf(['powell-neidr', 'llynn-neidr'], MERWIN_IDS, 'marriage-merwin-elinor', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-merwin-powell' }
    }),
    ...childrenOf(['gwythyr-neidr', 'maygan-elder-neidr'], POWELL_IDS, 'marriage-powell-dolena', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-powell-gwythyr' }
    }),
    ...childrenOf(['daffyd-neidr', 'igraine-neidr'], GWYTHYR_IDS, 'marriage-gwythyr-quendolin', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-gwythyr-daffyd' }
    }),
    ...childrenOf(['gwynnan-neidr', 'aoirghe-neidr', 'prynhawn-neidr'], DAFFYD_IDS, 'marriage-daffyd-bettrys'),
    ...childrenOf(['gwyneth-neidr'], ['daffyd-neidr', 'banw'], 'affair-daffyd-banw', {
      legitimacy: 'illegitimate',
      notes: 'Die Stammbaumgrafik verbindet Gwyneth mit Daffyd und Banw; die Personentabelle nennt nur Daffyds Bastard.'
    }),
    ...childrenOf(['howell-neidr', 'griff-neidr', 'gladdie-neidr', 'gwenhwyfar-neidr', 'gildas-neidr'], GWYNNAN_IDS, 'marriage-gwynnan-enya'),
    ...childrenOf(['gaenor-neidr', 'llywellyn-neidr', 'rohella-neidr'], HOWELL_IDS, 'marriage-sulwen-howell'),
    ...childrenOf(['talan-neidr', 'jinell-neidr'], GRIFF_IDS, 'marriage-karys-griff'),
    ...childrenOf(['lleulu-neidr'], GILDAS_IDS, 'marriage-gildas-meiriona'),
    ...childrenOf(['aeron-neidr', 'genofeva-neidr', 'cynan-neidr', 'lunet-neidr'], GAENOR_IDS, 'marriage-elenydd-gaenor'),
    ...childrenOf(['rhiannon-neidr'], LLYWELLYN_IDS, 'marriage-dolena-llywellyn'),
    ...childrenOf(['conwy-neidr'], TALAN_IDS, 'marriage-talan-caylee'),
    ...childrenOf(['gwal-neidr', 'yvain-neidr', 'dilwen-neidr', 'gwastad-neidr'], AERON_IDS, 'marriage-aeron-gorm'),
    ...childrenOf(['odyar-neidr', 'ninian-neidr'], CYNAN_IDS, 'marriage-cynan-carwyn'),
    ...childrenOf(['rhon-neidr', 'ael-neidr'], CONWY_IDS, 'marriage-conwy-aeronwen'),
    ...childrenOf(['gwennah-neidr', 'guinevere-neidr', 'gwynfor-neidr', 'lancelot-neidr'], YVAIN_IDS, 'marriage-yvain-morgana'),
    ...childrenOf(['rigis-neidr', 'padrig-neidr'], GWASTAD_IDS, 'marriage-gwastad-falka'),
    ...childrenOf(['arian-neidr', 'eilir-neidr'], ODYAR_IDS, 'marriage-odyar-ariana'),
    ...childrenOf(['carolyn-neidr', 'maygan-younger-neidr', 'ifan-neidr'], NINIAN_IDS, 'marriage-ninian-crystin'),
    ...childrenOf(['carantec-neidr', 'harri-neidr'], RHON_IDS, 'marriage-rhon-afanen'),
    ...childrenOf(['guinevere-neidr'], ['galahad-draig', 'gwendolyn-aderyn'], 'marriage-galahad-gwendolyn', {
      idPrefix: 'parentage-foster',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Guinevere wird im Haus Draig als Mündel Galahads und Gwendolyns geführt.'
    }),
    ...childrenOf(['lancelot-neidr'], ['tristan-pendrag', 'isolde-arth'], 'marriage-tristan-isolde', {
      idPrefix: 'parentage-foster',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Lancelot wird am Königshof als Mündel Tristans und Isoldes geführt.'
    })
  ],
  cadetBranches: [
    // Die stabilen IDs der ersten drei Einträge bleiben für lokale
    // Registry-Upgrades erhalten, obwohl sie nun fachlich Sprosse sind.
    houseSprout(
      'married-away-saith-gwennan',
      'Haus Saith',
      'marriage-gwennan-bors',
      'house-saith',
      'Bors Saith und Gwennan Neidr begründen Haus Saith.'
    ),
    houseSprout(
      'married-away-pysgod-caitrin',
      'Haus Tiwna',
      'marriage-caitrin-morholt',
      'house-tiwna',
      'Morholt Pysgod und Caitrin Neidr begründen Haus Tiwna.'
    ),
    createLinkedLineBranch({
      id: 'brother-house-crefyddol-llwyarch-neidr',
      name: 'Haus Crefyddol',
      parentPartnershipId: 'marriage-jinelle-sieffre',
      houseId: 'house-crefyddol',
      targetFamilyId: 'haus-crefyddol',
      emblem: HOUSE_EMBLEMS.crefyddol,
      subtitle: 'Sohn Llwyarch begründet das Bruderhaus',
      crestFrame: 'gold',
      notes: 'Die vollständige Gründung durch Llwyarch und Lynette wird in der verknüpften Crefyddol-Akte fortgeführt.'
    }),
    createLinkedLineBranch({
      id: 'brother-house-canwyll-llwellyn-neidr',
      name: 'Haus Canwyll',
      parentPartnershipId: 'marriage-jinelle-sieffre',
      houseId: 'house-canwyll',
      targetFamilyId: 'haus-canwyll',
      emblem: HOUSE_EMBLEMS.canwyll,
      subtitle: 'Sohn Llwellyn begründet das Bruderhaus',
      crestFrame: 'gold',
      notes: 'Die vollständige Gründung durch Llwellyn und Hafren wird in der verknüpften Canwyll-Akte fortgeführt.'
    }),
    houseSprout(
      'married-away-pyrth-llynn',
      'Haus Pyrth',
      'marriage-llynn-roderic',
      'house-pyrth',
      'Roderic Pyrth und Llynn Neidr begründen Haus Pyrth.'
    ),
    marriedAway('married-away-wylan-maygan', 'Haus Wylan', 'marriage-maygan-rheidwn', 'house-wylan', HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-crefyddol-igraine', 'Haus Crefyddol', 'marriage-igraine-morien', 'house-crefyddol'),
    marriedAway('married-away-dyngwn-aoirghe', 'Haus Dyngwn', 'marriage-aoirghe-morgan', 'house-dyngwn'),
    marriedAway('married-away-draig-gwyneth', 'Haus Draig', 'marriage-lancelot-gwyneth', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-pyrth-prynhawn', 'Haus Pyrth', 'union-prynhawn-iowaneth', 'house-pyrth'),
    marriedAway('married-away-crefyddol-gladdie', 'Haus Crefyddol', 'marriage-gladdie-beynon', 'house-crefyddol'),
    marriedAway('married-away-pyrth-gwenhwyfar', 'Haus Pyrth', 'marriage-gwenhwyfar-brinthan', 'house-pyrth'),
    marriedAway('married-away-grawn-rohella', 'Haus Grawn', 'marriage-rohella-petyr', 'house-grawn', HOUSE_EMBLEMS.grawn),
    marriedAway('married-away-saith-jinell', 'Haus Saith', 'marriage-jinell-hetwn', 'house-saith'),
    marriedAway('married-away-pawen-genofeva', 'Haus Pawen', 'marriage-genofeva-lamorak', 'house-pawen'),
    marriedAway('married-away-draenog-lunet', 'Haus Draenog', 'marriage-lunet-mathonwy', 'house-draenog'),
    marriedAway('married-away-canwyll-rhiannon', 'Haus Canwyll', 'marriage-rhiannon-cadoc', 'house-canwyll'),
    marriedAway('married-away-tiwna-dilwen', 'Haus Tiwna', 'marriage-dilwen-morholt', 'house-tiwna'),
    marriedAway('married-away-crefyddol-ael', 'Haus Crefyddol', 'marriage-ael-merrion', 'house-crefyddol'),
    createWardAwayBranch({
      id: 'ward-away-guinevere-draig',
      name: 'Haus Draig',
      parentPersonId: 'guinevere-neidr',
      houseId: 'house-draig',
      targetFamilyId: 'haus-draig',
      emblem: HOUSE_EMBLEMS.draig,
      crestFrame: 'gold',
      notes: 'Guinevere Neidr wurde als Mündel an Galahad Draig und Gwendolyn Aderyn vermittelt.'
    }),
    createWardAwayBranch({
      id: 'ward-away-lancelot-pendrag',
      name: 'Haus Pendrag',
      parentPersonId: 'lancelot-neidr',
      houseId: 'house-pendrag',
      targetFamilyId: 'haus-pendrag',
      emblem: HOUSE_EMBLEMS.pendrag,
      crestFrame: 'gold',
      notes: 'Lancelot Neidr wurde als Mündel an König Tristan Pendrag und Isolde Arth vermittelt.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-gwyron-owain', parentPartnershipId: 'marriage-sabria-gwyron', childIds: ['owain-neidr'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung setzt die Hauptlinie ausschließlich unter Gwyron und Sabria fort.', extensions: {}
    },
    {
      id: 'gap-cadoc-merwin', parentPartnershipId: 'marriage-cadoc-fionnghula', childIds: ['merwin-neidr', 'jinelle-neidr'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung setzt die Hauptlinie ausschließlich unter Cadoc und Fionnghula fort.', extensions: {}
    },
    {
      id: 'gap-merwin-powell', parentPartnershipId: 'marriage-merwin-elinor', childIds: ['powell-neidr', 'llynn-neidr'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung setzt die Hauptlinie ausschließlich unter Merwin und Elinor fort.', extensions: {}
    },
    {
      id: 'gap-powell-gwythyr', parentPartnershipId: 'marriage-powell-dolena', childIds: ['gwythyr-neidr', 'maygan-elder-neidr'],
      years: 0, fromYear: '????', toYear: '????', label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung setzt die Hauptlinie ausschließlich unter Powell und Dolena fort.', extensions: {}
    },
    {
      id: 'gap-gwythyr-daffyd', parentPartnershipId: 'marriage-gwythyr-quendolin', childIds: ['daffyd-neidr', 'igraine-neidr'],
      years: 0, fromYear: '????', toYear: '1555', label: 'Die datierte Überlieferung setzt 1555 wieder ein',
      notes: 'Der Zeitsprung setzt die Hauptlinie ausschließlich unter Gwythyr und Quendolin fort.', extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-gawan-mallaidh',
    houseId: NEIDR_HOUSE_ID,
    crestSubtitle: 'Grafengeschlecht',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gawan-neidr',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten, Portraitzuordnungen und Beziehungen nach der bereitgestellten Haus-Neidr-Tabelle und der eingebetteten Stammbaumgrafik. Die fünf Zeitsprünge sind als serielle absolute Generationentrenner modelliert. Der in der Oberhauptgalerie ab 1720 als „Gwyneed“ beschriftete, aber mit Yvains Portrait dargestellte Graf wird aufgrund der Erbfolge als Yvain geführt. Die ausgearbeitete Pyrth-Gegenakte belegt Prynhawn und Jowaneth als Ehepaar sowie ihre Lebensdaten; Neidr zeigt deshalb auch Prynhawns direkten Wegverheiratet-Knoten zu Haus Pyrth. Mari erscheint nur in der Tabelle. Die ergänzende Crefyddoll-Quelle löst die zuvor unbeschriftete Fortsetzung unter Jinelle und Sieffre auf: Ihre Söhne Llwyarch und Llwellyn begründen mit Lynette beziehungsweise Hafren die Bruderhäuser Crefyddol und Canwyll. Neidr zeigt beide verknüpften Zielhäuser direkt unter dem Ursprungspaar; die vollständigen Gründerpaare und Fortsetzungen bleiben in den Zielakten, damit sie vor Neidrs nächstem absoluten Zeitsprung nicht als falsche Generation erscheinen. Sieffre trägt als Heiliger den Holy Frame. Bors und Gwennan begründen Haus Saith, Morholt und Caitrin Haus Tiwna sowie Roderic und Llynn Haus Pyrth. Die Kinderzeilen ordnen Odyar Ariana und Ninian Crystin zu, obwohl die Partnerzeile beide Spalten vertauscht. Genauer belegte Todesjahre für Gaenor, Llywellyn und Elenydd sowie die wechselseitigen Pflege-, Verlobungs- und Draig-Verbindungen wurden aus den bereits vorhandenen verbundenen Hausakten übernommen.',
    blankFamily: false,
    sourceRevision: 9,
    registryTombstones: {
      houses: ['house-unbekannt-jinelle'],
      cadetBranches: ['married-away-unbekannt-jinelle']
    }
  }
});
