import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createLinkedLineBranch,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_DINEFWR_PORTRAITS } from './house-dinefwr-portraits.js';
import {
  WEIDEBUCHT_HOUSE_EMBLEMS,
  WEIDEBUCHT_HOUSE_PROFILES
} from './weidebucht-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const DINEFWR_HOUSE_ID = 'house-dinefwr';
const DINEFWR_EMBLEM = WEIDEBUCHT_HOUSE_EMBLEMS.dinefwr;

const HOUSE_EMBLEMS = Object.freeze({
  creyr: WEIDEBUCHT_HOUSE_EMBLEMS.creyr,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  fhaire: WEIDEBUCHT_HOUSE_EMBLEMS.fhaire,
  hwyaden: WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden,
  mochdaer: WEIDEBUCHT_HOUSE_EMBLEMS.mochdaer,
  penderyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  'tir-addawol': WEIDEBUCHT_HOUSE_EMBLEMS['tir-addawol'],
  wylan: WEIDEBUCHT_HOUSE_EMBLEMS.wylan,
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
});

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId',
  'name',
  'title',
  'sex',
  'status',
  'birth',
  'death',
  'portrait',
  'portraitPlaceholder',
  'houseId',
  'familyRole',
  'lineageRole',
  'tags',
  'notes'
]);

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? DINEFWR_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_DINEFWR_PORTRAITS[id] || '',
    worldPersonId: options.worldPersonId || '',
    familyRole: options.familyRole || (houseId === DINEFWR_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: 'married'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function endedMarriage(id, firstId, secondId, options = {}) {
  return createMarriage(id, firstId, secondId, { status: 'ended', ...options });
}

function childrenOf(childIds, partnershipId, options = {}) {
  const partnership = PARTNERS_BY_ID[partnershipId];
  return createParentages(childIds, partnership, partnershipId, options);
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    crestFrame: 'gold'
  });
}

const COUPLES = Object.freeze({
  erim: ['erim-der-bulle-dinefwr', 'morcant-dinefwr-founder-spouse'],
  beynon: ['beynon-tarw-dinefwr', 'bedelia-ua-fhaire'],
  eynon: ['eynon-tarw-dinefwr', 'aithne-ua-fhaire'],
  taredd: ['taredd-dinefwr', 'gwawr-tir-addawol'],
  siriol: ['siriol-dinefwr', 'maldwyn-creyr-dinefwr'],
  gwrtheyrn: ['derwen-dyngwn', 'gwrtheyrn-dinefwr'],
  evaine: ['drudwas-saethwyr', 'evaine-dinefwr'],
  govynyon: ['maddison-llwynog', 'govynyon-dinefwr'],
  blodeuwedd: ['blodeuwedd-dinefwr', 'ennissyen-tir-addawol'],
  gwladus: ['enevold-penderyn', 'gwladus-dinefwr'],
  carnedyr: ['lynesse-wyrm-1649', 'carnedyr-dinefwr'],
  crystin: ['crystin-dinefwr', 'ruari-fintain'],
  cardoc: ['cardoc-dinefwr', 'niamhe-stwatchn'],
  carys: ['carys-dinefwr', 'edwyn-gaeth'],
  tegwen: ['tegwen-dinefwr', 'goronwy-creyr'],
  evan: ['evan-dinefwr', 'meghan-tiwna'],
  trevelyan: ['mag-wylan', 'trevelyan-dinefwr'],
  garselid: ['garselid-dinefwr', 'blodeuyn-tir-addawol'],
  sulwen: ['sulwen-dinefwr', 'peibyn-hwyaden'],
  jenica: ['micah-1693-mochdaer', 'jenica-dinefwr'],
  gaven: ['gaven-dinefwr', 'ywen-ilyuncu']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-erim-morcant-dinefwr': COUPLES.erim,
  'marriage-beynon-bedelia-dinefwr': COUPLES.beynon,
  'marriage-eynon-aithne-dinefwr': COUPLES.eynon,
  'marriage-taredd-gwawr-dinefwr': COUPLES.taredd,
  'marriage-siriol-maldwyn-dinefwr': COUPLES.siriol,
  'marriage-derwen-gwrtheyrn-dyngwn': COUPLES.gwrtheyrn,
  'marriage-drudwas-evaine': COUPLES.evaine,
  'marriage-maddison-govynyon-llwynog': COUPLES.govynyon,
  'marriage-blodeuwedd-ennissyen-dinefwr': COUPLES.blodeuwedd,
  'marriage-enevold-gwladus-penderyn': COUPLES.gwladus,
  'marriage-lynesse-carnedyr': COUPLES.carnedyr,
  'marriage-crystin-ruari-dinefwr': COUPLES.crystin,
  'marriage-cardoc-niamhe-dinefwr': COUPLES.cardoc,
  'marriage-carys-edwyn-dinefwr': COUPLES.carys,
  'marriage-tegwen-goronwy-dinefwr': COUPLES.tegwen,
  'marriage-evan-meghan-dinefwr': COUPLES.evan,
  'marriage-mag-trevelyan': COUPLES.trevelyan,
  'marriage-garselid-blodeuyn-dinefwr': COUPLES.garselid,
  'marriage-sulwen-peibyn-dinefwr': COUPLES.sulwen,
  'marriage-micah-jenica-mochdaer': COUPLES.jenica,
  'marriage-gaven-ywen-dinefwr': COUPLES.gaven
});

export const HOUSE_DINEFWR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dinefwr',
    title: "Haus Dinefwr O'Cerrigarth",
    motto: 'Beständig wie der Bulle!',
    description: 'Ritterfürstliches Vasallenhaus von Cerrigarth, hervorgegangen aus Erim dem Bullen und seinem ältesten Sohn Beynon. Beynons jüngerer Bruder Eynon begründete parallel das Bruderhaus Tir Addawol.',
    emblem: DINEFWR_EMBLEM,
    houseProfile: WEIDEBUCHT_HOUSE_PROFILES.dinefwr
  },
  houses: [
    house(DINEFWR_HOUSE_ID, "Haus Dinefwr O'Cerrigarth", DINEFWR_EMBLEM),
    house('house-fhaire', 'Clan Ua Fhàire', HOUSE_EMBLEMS.fhaire),
    house('house-tir-addawol', 'Haus Tir Addawol', HOUSE_EMBLEMS['tir-addawol']),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-llwynog', 'Haus Llwynog'),
    house('house-penderyn', 'Haus Penderyn', HOUSE_EMBLEMS.penderyn),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-fintain', 'Haus Fintain'),
    house('house-stwatchn', 'Haus Stwatchn'),
    house('house-gaeth', 'Haus Gaeth'),
    house('house-tiwna', 'Haus Tiwna'),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-hwyaden', 'Haus Hwyaden', HOUSE_EMBLEMS.hwyaden),
    house('house-mochdaer-cerrigarth', "Haus Mochdaer O'Cerrigarth", HOUSE_EMBLEMS.mochdaer),
    house('house-ilyuncu', 'Haus Ilyuncu')
  ],
  persons: [
    person('erim-der-bulle-dinefwr', 'Erim der Bulle', 'male', '????', '????', {
      title: 'Geritterter Viehzüchter · Stammvater der Bruderhäuser Dinefwr und Tir Addawol',
      lineageRole: 'head'
    }),
    person('morcant-dinefwr-founder-spouse', 'Morcant', 'female', '????', '????'),

    person('beynon-tarw-dinefwr', 'Beynon Tarw', 'male', '????', '????', {
      title: 'Gründer und erster Ritterfürst des Hauses Dinefwr',
      lineageRole: 'head'
    }),
    person('eynon-tarw-dinefwr', 'Eynon Tarw', 'male', '????', '????', {
      houseId: 'house-tir-addawol',
      familyRole: 'core',
      worldPersonId: 'person--haus-dinefwr--eynon-tarw-dinefwr',
      title: 'Gründer des Bruderhauses Tir Addawol',
      lineageRole: 'branch'
    }),
    spouse('bedelia-ua-fhaire', 'Bedelia Ua Fhàire', 'female', '????', '????', 'house-fhaire'),
    spouse('aithne-ua-fhaire', 'Aithne Ua Fhàire', 'female', '????', '????', 'house-fhaire'),

    person('taredd-dinefwr', 'Taredd Dinefwr', 'male', '????', '????', {
      title: 'Ritterfürst von Cerrigarth',
      lineageRole: 'head'
    }),
    awayWoman('siriol-dinefwr', 'Siriol Dinefwr', '????', '????', 'Haus Créyr'),
    spouse('gwawr-tir-addawol', 'Gwawr Tir Addawol', 'female', '????', '????', 'house-tir-addawol'),
    spouse('maldwyn-creyr-dinefwr', 'Maldwyn Créyr', 'male', '????', '????', 'house-creyr'),

    person('gwrtheyrn-dinefwr', 'Gwrtheyrn Dinefwr', 'male', '1605', '1642', {
      title: 'Ritterfürst von Cerrigarth bis 1642',
      lineageRole: 'head'
    }),
    awayWoman('evaine-dinefwr', 'Evaine Dinefwr', '1607', '1681', 'Haus Saethwyr'),
    spouse('derwen-dyngwn', 'Derwen Dyngwn', 'female', '1610', '1666', 'house-dyngwn'),
    spouse('drudwas-saethwyr', 'Drudwas Saethwyr', 'male', '1604', '1674', 'house-saethwyr'),

    person('govynyon-dinefwr', 'Govynyon Dinefwr', 'male', '1628', '1689', {
      title: 'Ritterfürst von Cerrigarth 1642–1689',
      lineageRole: 'head'
    }),
    awayWoman('blodeuwedd-dinefwr', 'Blodeuwedd Dinefwr', '1631', '1704', 'Haus Tir Addawol'),
    awayWoman('gwladus-dinefwr', 'Gwladus Dinefwr', '1633', '1699', 'Haus Penderyn'),
    spouse('maddison-llwynog', 'Maddison Llwynog', 'female', '1631', '1704', 'house-llwynog'),
    spouse('ennissyen-tir-addawol', 'Ennissyen Tir Addawol', 'male', '1627', '1669', 'house-tir-addawol'),
    spouse('enevold-penderyn', 'Enevold Penderyn', 'male', '1629', '1698', 'house-penderyn'),

    person('carnedyr-dinefwr', 'Carnedyr Dinefwr', 'male', '1647', '1715', {
      title: 'Ritterfürst von Cerrigarth 1689–1715',
      lineageRole: 'head'
    }),
    awayWoman('crystin-dinefwr', 'Crystin Dinefwr', '1651', '????', 'Haus Fintain'),
    spouse('lynesse-wyrm-1649', 'Lynesse Wyrm', 'female', '1649', '1723', 'house-wyrm'),
    spouse('ruari-fintain', 'Ruari Fintain', 'male', '1648', '????', 'house-fintain'),

    person('cardoc-dinefwr', 'Cardoc Dinefwr', 'male', '1668', '', {
      title: 'Ritterfürst von Cerrigarth seit 1715',
      lineageRole: 'head'
    }),
    awayWoman('carys-dinefwr', 'Carys Dinefwr', '1670', '', 'Haus Gaeth'),
    awayWoman('tegwen-dinefwr', 'Tegwen Dinefwr', '1670', '', 'Haus Créyr'),
    person('evan-dinefwr', 'Evan Dinefwr', 'male', '1674', ''),
    spouse('niamhe-stwatchn', 'Niamhe Stwatchn', 'female', '1671', '', 'house-stwatchn'),
    spouse('edwyn-gaeth', 'Edwyn Gaeth', 'male', '1668', '', 'house-gaeth'),
    spouse('goronwy-creyr', 'Goronwy Créyr', 'male', '1665', '', 'house-creyr'),
    spouse('meghan-tiwna', 'Meghan Tiwna', 'female', '1675', '1714', 'house-tiwna'),

    person('trevelyan-dinefwr', 'Trevelyan Dinefwr', 'male', '1690', '', {
      title: 'Erster Erbe des Hauses Dinefwr',
      lineageRole: 'mainline'
    }),
    person('garselid-dinefwr', 'Garselid Dinefwr', 'male', '1694', ''),
    awayWoman('sulwen-dinefwr', 'Sulwen Dinefwr', '1696', '', 'Haus Hwyaden'),
    awayWoman('jenica-dinefwr', 'Jenica Dinefwr', '1698', '', "Haus Mochdaer O'Cerrigarth"),
    person('gaven-dinefwr', 'Gaven Dinefwr', 'male', '1704', ''),
    spouse('mag-wylan', 'Mag Wylan', 'female', '1690', '', 'house-wylan'),
    spouse('blodeuyn-tir-addawol', 'Blodeuyn Tir Addawol', 'female', '1698', '', 'house-tir-addawol'),
    spouse('peibyn-hwyaden', 'Peibyn Hwyaden', 'male', '1694', '', 'house-hwyaden'),
    spouse('micah-1693-mochdaer', 'Micah Mochdaer', 'male', '1693', '', 'house-mochdaer-cerrigarth'),
    spouse('ywen-ilyuncu', 'Ywen Ilyuncu', 'female', '1702', '', 'house-ilyuncu'),

    person('niamhe-1712-dinefwr', 'Niamhe Dinefwr', 'female', '1712', ''),
    person('neithon-dinefwr', 'Neithon Dinefwr', 'male', '1718', '', {
      title: 'Zweiter Erbe des Hauses Dinefwr',
      lineageRole: 'mainline'
    }),
    person('corin-dinefwr', 'Corin Dinefwr', 'male', '1723', '', {
      title: 'Dritter Erbe des Hauses Dinefwr',
      lineageRole: 'mainline'
    }),
    person('atusa-dinefwr', 'Atusa Dinefwr', 'female', '1713', '', {
      familyRole: 'adopted',
      title: 'Adoptivtochter Trevelyans und Mags',
      tags: ['Adoptiert']
    }),
    person('dyfed-dinefwr', 'Dyfed Dinefwr', 'male', '1723', ''),
    person('nesta-dinefwr', 'Nesta Dinefwr', 'female', '1725', ''),
    person('cai-dinefwr', 'Cai Dinefwr', 'male', '1723', ''),
    person('fflur-dinefwr', 'Fflur Dinefwr', 'female', '1726', '')
  ],
  partnerships: [
    endedMarriage('marriage-erim-morcant-dinefwr', ...COUPLES.erim),
    endedMarriage('marriage-beynon-bedelia-dinefwr', ...COUPLES.beynon),
    endedMarriage('marriage-eynon-aithne-dinefwr', ...COUPLES.eynon),
    endedMarriage('marriage-taredd-gwawr-dinefwr', ...COUPLES.taredd),
    endedMarriage('marriage-siriol-maldwyn-dinefwr', ...COUPLES.siriol),
    createMarriage('marriage-derwen-gwrtheyrn-dyngwn', ...COUPLES.gwrtheyrn),
    createMarriage('marriage-drudwas-evaine', ...COUPLES.evaine),
    createMarriage('marriage-maddison-govynyon-llwynog', ...COUPLES.govynyon, { status: 'ended', end: '1689' }),
    endedMarriage('marriage-blodeuwedd-ennissyen-dinefwr', ...COUPLES.blodeuwedd, { end: '1669' }),
    createMarriage('marriage-enevold-gwladus-penderyn', ...COUPLES.gwladus, { status: 'ended', end: '1698' }),
    createMarriage('marriage-lynesse-carnedyr', ...COUPLES.carnedyr),
    endedMarriage('marriage-crystin-ruari-dinefwr', ...COUPLES.crystin),
    createMarriage('marriage-cardoc-niamhe-dinefwr', ...COUPLES.cardoc),
    createMarriage('marriage-carys-edwyn-dinefwr', ...COUPLES.carys),
    createMarriage('marriage-tegwen-goronwy-dinefwr', ...COUPLES.tegwen),
    endedMarriage('marriage-evan-meghan-dinefwr', ...COUPLES.evan, { end: '1714' }),
    createMarriage('marriage-mag-trevelyan', ...COUPLES.trevelyan),
    createMarriage('marriage-garselid-blodeuyn-dinefwr', ...COUPLES.garselid),
    createMarriage('marriage-sulwen-peibyn-dinefwr', ...COUPLES.sulwen),
    createMarriage('marriage-micah-jenica-mochdaer', ...COUPLES.jenica),
    createMarriage('marriage-gaven-ywen-dinefwr', ...COUPLES.gaven)
  ],
  parentages: [
    ...childrenOf(['beynon-tarw-dinefwr', 'eynon-tarw-dinefwr'], 'marriage-erim-morcant-dinefwr'),
    ...childrenOf(['taredd-dinefwr', 'siriol-dinefwr'], 'marriage-beynon-bedelia-dinefwr', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Beynon und der Taredd-Generation sind nicht einzeln überlieferte Dinefwr-Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-beynon-to-taredd-generation-dinefwr' }
    }),
    ...childrenOf(['gwrtheyrn-dinefwr', 'evaine-dinefwr'], 'marriage-taredd-gwawr-dinefwr', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Taredd und der ab 1605 belegten Generation sind nicht einzeln überlieferte Dinefwr-Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-taredd-to-gwrtheyrn-generation-dinefwr' }
    }),
    ...childrenOf(['govynyon-dinefwr', 'blodeuwedd-dinefwr', 'gwladus-dinefwr'], 'marriage-derwen-gwrtheyrn-dyngwn'),
    ...childrenOf(['carnedyr-dinefwr', 'crystin-dinefwr'], 'marriage-maddison-govynyon-llwynog'),
    ...childrenOf(['cardoc-dinefwr', 'carys-dinefwr', 'tegwen-dinefwr', 'evan-dinefwr'], 'marriage-lynesse-carnedyr'),
    ...childrenOf(['trevelyan-dinefwr', 'garselid-dinefwr', 'sulwen-dinefwr'], 'marriage-cardoc-niamhe-dinefwr'),
    ...childrenOf(['jenica-dinefwr', 'gaven-dinefwr'], 'marriage-evan-meghan-dinefwr'),
    ...childrenOf(['niamhe-1712-dinefwr', 'neithon-dinefwr', 'corin-dinefwr'], 'marriage-mag-trevelyan'),
    ...childrenOf(['atusa-dinefwr'], 'marriage-mag-trevelyan', {
      type: 'adoptive',
      legitimacy: 'unknown',
      notes: 'Die Quelle bezeichnet Atusa ausdrücklich als adoptiert.'
    }),
    ...childrenOf(['dyfed-dinefwr', 'nesta-dinefwr'], 'marriage-garselid-blodeuyn-dinefwr'),
    ...childrenOf(['cai-dinefwr', 'fflur-dinefwr'], 'marriage-gaven-ywen-dinefwr')
  ],
  cadetBranches: [
    createLinkedLineBranch({
      id: 'brother-house-tir-addawol-eynon',
      name: 'Haus Tir Addawol',
      parentPartnershipId: 'marriage-eynon-aithne-dinefwr',
      houseId: 'house-tir-addawol',
      targetFamilyId: 'haus-tir-addawol',
      emblem: HOUSE_EMBLEMS['tir-addawol'],
      subtitle: 'Bruderhaus · gegründet von Eynon und Aithne',
      crestFrame: 'gold',
      notes: 'Eynon, der jüngere Sohn Erims, gründet parallel zu Beynons Dinefwr-Linie das eigenständige Bruderhaus Tir Addawol. In dieser Akte werden darunter keine Tir-Addawol-Nachkommen geführt.'
    }),
    marriedAway('married-away-siriol-dinefwr-creyr', 'Haus Créyr', 'marriage-siriol-maldwyn-dinefwr', 'house-creyr', 'haus-creyr', HOUSE_EMBLEMS.creyr),
    marriedAway('married-away-evaine-dinefwr-saethwyr', 'Haus Saethwyr', 'marriage-drudwas-evaine', 'house-saethwyr', 'haus-saethwyr', HOUSE_EMBLEMS.saethwyr),
    marriedAway('married-away-blodeuwedd-dinefwr-tir-addawol', 'Haus Tir Addawol', 'marriage-blodeuwedd-ennissyen-dinefwr', 'house-tir-addawol', 'haus-tir-addawol', HOUSE_EMBLEMS['tir-addawol']),
    marriedAway('married-away-gwladus-dinefwr-penderyn', 'Haus Penderyn', 'marriage-enevold-gwladus-penderyn', 'house-penderyn', 'haus-penderyn', HOUSE_EMBLEMS.penderyn),
    marriedAway('married-away-crystin-dinefwr-fintain', 'Haus Fintain', 'marriage-crystin-ruari-dinefwr', 'house-fintain', 'haus-fintain'),
    marriedAway('married-away-carys-dinefwr-gaeth', 'Haus Gaeth', 'marriage-carys-edwyn-dinefwr', 'house-gaeth', 'haus-gaeth'),
    marriedAway('married-away-tegwen-dinefwr-creyr', 'Haus Créyr', 'marriage-tegwen-goronwy-dinefwr', 'house-creyr', 'haus-creyr', HOUSE_EMBLEMS.creyr),
    marriedAway('married-away-sulwen-dinefwr-hwyaden', 'Haus Hwyaden', 'marriage-sulwen-peibyn-dinefwr', 'house-hwyaden', 'haus-hwyaden', HOUSE_EMBLEMS.hwyaden),
    marriedAway('married-away-jenica-dinefwr-mochdaer', "Haus Mochdaer O'Cerrigarth", 'marriage-micah-jenica-mochdaer', 'house-mochdaer-cerrigarth', 'haus-mochdaer', HOUSE_EMBLEMS.mochdaer)
  ],
  timeJumps: [
    {
      id: 'gap-beynon-to-taredd-generation-dinefwr',
      parentPartnershipId: 'marriage-beynon-bedelia-dinefwr',
      parentPersonId: '',
      childIds: ['taredd-dinefwr', 'siriol-dinefwr'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Dinefwr-Generationen',
      notes: 'Der erste absolute Trenner liegt seriell unter Beynon, Bedelia und dem Dinefwr-Hauswappen. Eynons Tir-Addawol-Knoten speist diesen Zeitsprung ausdrücklich nicht.',
      extensions: {}
    },
    {
      id: 'gap-taredd-to-gwrtheyrn-generation-dinefwr',
      parentPartnershipId: 'marriage-taredd-gwawr-dinefwr',
      parentPersonId: '',
      childIds: ['gwrtheyrn-dinefwr', 'evaine-dinefwr'],
      years: 0,
      fromYear: '????',
      toYear: '1605',
      label: 'Die belegte Dinefwr-Linie setzt 1605 wieder ein',
      notes: 'Der zweite absolute Trenner liegt ausschließlich unter Taredd und Gwawr; Siriols wegverheirateter Créyr-Zweig führt nicht in die Dinefwr-Fortsetzung.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-beynon-bedelia-dinefwr',
    houseId: DINEFWR_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Cerrigarth · gegründet von Beynon und Bedelia',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'erim-der-bulle-dinefwr',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Dinefwr O'Cerrigarth (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Ehen, Porträts, Oberhauptfolge und Erbfolge folgen der bereitgestellten Dinefwr-Hausseite. Erim und Morcant bilden die gemeinsame Ursprungsgeneration. Ihre Söhne gründen zwei eigenständige Bruderhäuser: Beynon und Bedelia tragen den Dinefwr-Hausknoten und allein ihre Linie führt nach dem ersten seriellen Zeitsprung zu Taredd und Siriol; Eynon und Aithne tragen parallel nur den verknüpften Tir-Addawol-Hausknoten ohne Dinefwr-Nachkommen. Der zweite Zeitsprung führt ausschließlich Taredd und Gwawr zur Gwrtheyrn-Generation. Cardoc und Niamhe sind Eltern von Trevelyan, Garselid und Sulwen; Evan und Meghan sind Eltern von Jenica und Gaven. Trevelyan/Mag führen Niamhe, Neithon, Corin und die ausdrücklich adoptierte Atusa; Garselid/Blodeuyn führen Dyfed und Nesta; Gaven/Ywen führen Cai und Fflur. Verheiratete Dinefwr-Frauen ohne fortgeführten Dinefwr-Zweig besitzen direkte Zielhausknoten. Jenicas Kinder bleiben ausschließlich in der Mochdaer-Cerrigarth-Akte. Gemeinsame Personen und Ehen mit Dyngwn, Saethwyr, Llwynog, Penderyn, Wyrm, Wylan und Mochdaer behalten ihre vorhandenen IDs. Wiederholte generische Silhouetten wurden nicht importiert; Ruari Fintains nicht abrufbares Quellbild bleibt beim Platzhalter.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems']
  }
});
