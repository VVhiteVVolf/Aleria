import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createLinkedLineBranch,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_TIR_ADDAWOL_PORTRAITS } from './house-tir-addawol-portraits.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import {
  WEIDEBUCHT_HOUSE_EMBLEMS,
  WEIDEBUCHT_HOUSE_PROFILES
} from './weidebucht-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const TIR_ADDAWOL_HOUSE_ID = 'house-tir-addawol';
const TIR_ADDAWOL_EMBLEM = WEIDEBUCHT_HOUSE_EMBLEMS['tir-addawol'];

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  asyn: WEIDEBUCHT_HOUSE_EMBLEMS.asyn,
  blach: SONNENKUESTE_HOUSE_EMBLEMS.blach,
  dinefwr: WEIDEBUCHT_HOUSE_EMBLEMS.dinefwr,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  fhaire: WEIDEBUCHT_HOUSE_EMBLEMS.fhaire,
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  hwyaden: WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden,
  teyrngarch: SONNENKUESTE_HOUSE_EMBLEMS.teyrngarch,
  wylan: WEIDEBUCHT_HOUSE_EMBLEMS.wylan
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
  const houseId = options.houseId === undefined ? TIR_ADDAWOL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_TIR_ADDAWOL_PORTRAITS[id] || '',
    worldPersonId: options.worldPersonId || '',
    familyRole: options.familyRole || (houseId === TIR_ADDAWOL_HOUSE_ID ? 'core' : 'married'),
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
  gwyndor: ['gwyndor-tir-addawol', 'eilun-asyn-tir-addawol'],
  gwawr: ['taredd-dinefwr', 'gwawr-tir-addawol'],
  ennissyen: ['blodeuwedd-dinefwr', 'ennissyen-tir-addawol'],
  caraf: ['tyreke-wylan', 'caraf-tir-addawol'],
  drwst: ['drwst-tir-addawol', 'gormlaith-fintain'],
  owena: ['uther-gafyr', 'owena-tir-addawol'],
  roderick: ['millena-blach', 'roderick-tir-addawol'],
  gwynham: ['caralyn-wylan', 'gwynham-tir-addawol'],
  milenna: ['milenna-tir-addawol', 'emyas-hwyaden'],
  hael: ['jeanae-dyngwn', 'hael-tir-addawol'],
  dajena: ['robyrt-gwefrydd', 'dajena-tir-addawol'],
  merryn: ['merryn-tir-addawol', 'venora-aderyn'],
  blodeuyn: ['garselid-dinefwr', 'blodeuyn-tir-addawol'],
  tirian: ['tirian-tir-addawol', 'yvette-saith'],
  fotor: ['siona-teyrngarch', 'fotor-tir-addawol'],
  eiddwen: ['tirian-marchog', 'eiddwen-tir-addawol'],
  bhreac: ['bhreac-tir-addawol', 'aliza-hebog']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-erim-morcant-dinefwr': COUPLES.erim,
  'marriage-beynon-bedelia-dinefwr': COUPLES.beynon,
  'marriage-eynon-aithne-dinefwr': COUPLES.eynon,
  'marriage-gwyndor-eilun-tir-addawol': COUPLES.gwyndor,
  'marriage-taredd-gwawr-dinefwr': COUPLES.gwawr,
  'marriage-blodeuwedd-ennissyen-dinefwr': COUPLES.ennissyen,
  'marriage-tyreke-caraf': COUPLES.caraf,
  'marriage-drwst-gormlaith-tir-addawol': COUPLES.drwst,
  'marriage-uther-owena': COUPLES.owena,
  'marriage-millena-roderick-blach': COUPLES.roderick,
  'marriage-caralyn-gwynham': COUPLES.gwynham,
  'marriage-milenna-emyas-tir-addawol': COUPLES.milenna,
  'marriage-jeanae-hael-dyngwn': COUPLES.hael,
  'marriage-robyrt-dajena': COUPLES.dajena,
  'marriage-merryn-venora': COUPLES.merryn,
  'marriage-garselid-blodeuyn-dinefwr': COUPLES.blodeuyn,
  'marriage-tirian-yvette-tir-addawol': COUPLES.tirian,
  'marriage-siona-fotor-teyrngarch': COUPLES.fotor,
  'marriage-eiddwen-tirian-marchog': COUPLES.eiddwen,
  'engagement-bhreac-aliza-tir-addawol': COUPLES.bhreac
});

export const HOUSE_TIR_ADDAWOL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-tir-addawol',
    title: 'Haus Tir Addawol',
    motto: '',
    description: 'Baronshaus von Glyndale in der Hochweide. Eynon Tarw, der jüngere Sohn Erims des Bullen, begründete das Bruderhaus parallel zur Dinefwr-Linie seines Bruders Beynon.',
    emblem: TIR_ADDAWOL_EMBLEM,
    houseProfile: WEIDEBUCHT_HOUSE_PROFILES['tir-addawol']
  },
  houses: [
    house(TIR_ADDAWOL_HOUSE_ID, 'Haus Tir Addawol', TIR_ADDAWOL_EMBLEM),
    house('house-dinefwr', "Haus Dinefwr O'Cerrigarth", HOUSE_EMBLEMS.dinefwr),
    house('house-fhaire', 'Clan Ua Fhàire', HOUSE_EMBLEMS.fhaire),
    house('house-asyn', 'Haus Asyn', HOUSE_EMBLEMS.asyn),
    house('house-wylan', "Haus Wylan O'Cerrigarth", HOUSE_EMBLEMS.wylan),
    house('house-fintain', 'Haus Fintain'),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-blach', 'Haus Blach', HOUSE_EMBLEMS.blach),
    house('house-hwyaden', 'Haus Hwyaden', HOUSE_EMBLEMS.hwyaden),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-saith', 'Haus Saith'),
    house('house-teyrngarch', 'Haus Teyrngarch', HOUSE_EMBLEMS.teyrngarch),
    house('house-marchog', 'Haus Marchog'),
    house('house-hebog', 'Haus Hebog')
  ],
  persons: [
    person('erim-der-bulle-dinefwr', 'Erim der Bulle', 'male', '????', '????', {
      houseId: 'house-dinefwr',
      familyRole: 'core',
      title: 'Geritterter Viehzüchter · Stammvater der Bruderhäuser Dinefwr und Tir Addawol',
      lineageRole: 'head'
    }),
    person('morcant-dinefwr-founder-spouse', 'Morcant', 'female', '????', '????', {
      houseId: 'house-dinefwr',
      familyRole: 'core'
    }),

    person('beynon-tarw-dinefwr', 'Beynon Tarw', 'male', '????', '????', {
      houseId: 'house-dinefwr',
      familyRole: 'core',
      title: 'Gründer des Bruderhauses Dinefwr'
    }),
    person('eynon-tarw-dinefwr', 'Eynon Tarw', 'male', '????', '????', {
      worldPersonId: 'person--haus-dinefwr--eynon-tarw-dinefwr',
      title: 'Gründer und erster Baron des Hauses Tir Addawol',
      lineageRole: 'head'
    }),
    spouse('bedelia-ua-fhaire', 'Bedelia Ua Fhàire', 'female', '????', '????', 'house-fhaire'),
    spouse('aithne-ua-fhaire', 'Aithne Ua Fhàire', 'female', '????', '????', 'house-fhaire'),

    person('gwyndor-tir-addawol', 'Gwyndor Tir Addawol', 'male', '????', '????', {
      title: 'Baron von Glyndale',
      lineageRole: 'head'
    }),
    awayWoman('gwawr-tir-addawol', 'Gwawr Tir Addawol', '????', '????', 'Haus Dinefwr'),
    spouse('eilun-asyn-tir-addawol', 'Eilun Asyn', 'female', '????', '????', 'house-asyn'),
    spouse('taredd-dinefwr', 'Taredd Dinefwr', 'male', '????', '????', 'house-dinefwr'),

    person('ennissyen-tir-addawol', 'Ennissyen Tir Addawol', 'male', '1627', '1669', {
      title: 'Baron von Glyndale bis 1669',
      lineageRole: 'head'
    }),
    awayWoman('caraf-tir-addawol', 'Caraf Tir Addawol', '1632', '1707', 'Haus Wylan'),
    spouse('blodeuwedd-dinefwr', 'Blodeuwedd Dinefwr', 'female', '1631', '1704', 'house-dinefwr'),
    spouse('tyreke-wylan', 'Tyreke Wylan', 'male', '1629', '1700', 'house-wylan'),

    person('drwst-tir-addawol', 'Drwst Tir Addawol', 'male', '1650', '1715', {
      title: 'Baron von Glyndale 1669–1715',
      lineageRole: 'head'
    }),
    awayWoman('owena-tir-addawol', 'Owena Tir Addawol', '1652', '1729', 'Haus Gafyr'),
    person('roderick-tir-addawol', 'Roderick Tir Addawol', 'male', '1654', '1720'),
    spouse('gormlaith-fintain', 'Gormlaith Fintain', 'female', '1652', '1699', 'house-fintain'),
    spouse('uther-gafyr', 'Uther Gafyr', 'male', '1650', '1711', 'house-gafyr'),
    spouse('millena-blach', 'Millena Blach', 'female', '1654', '1711', 'house-blach'),

    person('gwynham-tir-addawol', 'Gwynham Tir Addawol', 'male', '1670', '', {
      title: 'Baron von Glyndale seit 1715',
      lineageRole: 'head'
    }),
    awayWoman('milenna-tir-addawol', 'Milenna Tir Addawol', '1673', '', 'Haus Hwyaden'),
    person('hael-tir-addawol', 'Hael Tir Addawol', 'male', '1672', ''),
    awayWoman('dajena-tir-addawol', 'Dajena Tir Addawol', '1672', '1700', 'Haus Gwefrydd'),
    spouse('caralyn-wylan', 'Caralyn Wylan', 'female', '1676', '', 'house-wylan'),
    spouse('emyas-hwyaden', 'Emyas Hwyaden', 'male', '1672', '', 'house-hwyaden'),
    spouse('jeanae-dyngwn', 'Jeanae Dyngwn', 'female', '1673', '', 'house-dyngwn'),
    spouse('robyrt-gwefrydd', 'Robyrt Gwefrydd', 'male', '1666', '1720', 'house-gwefrydd'),

    person('merryn-tir-addawol', 'Merryn Tir Addawol', 'male', '1698', '', {
      title: 'Erster Erbe des Hauses Tir Addawol',
      lineageRole: 'mainline'
    }),
    awayWoman('blodeuyn-tir-addawol', 'Blodeuyn Tir Addawol', '1698', '', 'Haus Dinefwr'),
    person('tirian-tir-addawol', 'Tirian Tir Addawol', 'male', '1704', ''),
    person('fotor-tir-addawol', 'Fotor Tir Addawol', 'male', '1696', ''),
    awayWoman('eiddwen-tir-addawol', 'Eiddwen Tir Addawol', '1700', '', 'Haus Marchog'),
    spouse('venora-aderyn', 'Venora Aderyn', 'female', '1702', '', 'house-aderyn'),
    spouse('garselid-dinefwr', 'Garselid Dinefwr', 'male', '1694', '', 'house-dinefwr'),
    spouse('yvette-saith', 'Yvette Saith', 'female', '1704', '', 'house-saith'),
    spouse('siona-teyrngarch', 'Siona Teyrngarch', 'female', '1700', '', 'house-teyrngarch'),
    spouse('tirian-marchog', 'Tirian Marchog', 'male', '1701', '', 'house-marchog'),

    person('bhreac-tir-addawol', 'Bhreac Tir Addawol', 'male', '1718', '', {
      title: 'Zweiter Erbe des Hauses Tir Addawol',
      lineageRole: 'mainline'
    }),
    person('kynan-tir-addawol', 'Kynan Tir Addawol', 'male', '1720', '', {
      title: 'Dritter Erbe des Hauses Tir Addawol',
      lineageRole: 'mainline'
    }),
    person('rhena-tir-addawol', 'Rhena Tir Addawol', 'female', '1722', ''),
    person('arian-tir-addawol', 'Arian Tir Addawol', 'male', '1722', '', {
      title: 'Vierter Erbe des Hauses Tir Addawol',
      lineageRole: 'mainline'
    }),
    person('ivor-tir-addawol', 'Ivor Tir Addawol', 'male', '1725', '', {
      title: 'Fünfter Erbe des Hauses Tir Addawol',
      lineageRole: 'mainline'
    }),
    person('heston-tir-addawol', 'Heston Tir Addawol', 'male', '1722', ''),
    person('lillifer-tir-addawol', 'Lillifer Tir Addawol', 'female', '1724', ''),
    person('dee-tir-addawol', 'Dee Tir Addawol', 'female', '1724', ''),
    person('shan-tir-addawol', 'Shan Tir Addawol', 'male', '1732', ''),
    spouse('aliza-hebog', 'Aliza Hebog', 'female', '1722', '', 'house-hebog')
  ],
  partnerships: [
    endedMarriage('marriage-erim-morcant-dinefwr', ...COUPLES.erim),
    endedMarriage('marriage-beynon-bedelia-dinefwr', ...COUPLES.beynon),
    endedMarriage('marriage-eynon-aithne-dinefwr', ...COUPLES.eynon),
    endedMarriage('marriage-gwyndor-eilun-tir-addawol', ...COUPLES.gwyndor),
    endedMarriage('marriage-taredd-gwawr-dinefwr', ...COUPLES.gwawr),
    endedMarriage('marriage-blodeuwedd-ennissyen-dinefwr', ...COUPLES.ennissyen, { end: '1669' }),
    endedMarriage('marriage-tyreke-caraf', ...COUPLES.caraf, { end: '1700' }),
    endedMarriage('marriage-drwst-gormlaith-tir-addawol', ...COUPLES.drwst, { end: '1699' }),
    endedMarriage('marriage-uther-owena', ...COUPLES.owena, { end: '1711' }),
    endedMarriage('marriage-millena-roderick-blach', ...COUPLES.roderick, { end: '1711' }),
    createMarriage('marriage-caralyn-gwynham', ...COUPLES.gwynham),
    createMarriage('marriage-milenna-emyas-tir-addawol', ...COUPLES.milenna),
    createMarriage('marriage-jeanae-hael-dyngwn', ...COUPLES.hael),
    endedMarriage('marriage-robyrt-dajena', ...COUPLES.dajena, { end: '1700' }),
    createMarriage('marriage-merryn-venora', ...COUPLES.merryn),
    createMarriage('marriage-garselid-blodeuyn-dinefwr', ...COUPLES.blodeuyn),
    createMarriage('marriage-tirian-yvette-tir-addawol', ...COUPLES.tirian),
    createMarriage('marriage-siona-fotor-teyrngarch', ...COUPLES.fotor),
    createMarriage('marriage-eiddwen-tirian-marchog', ...COUPLES.eiddwen),
    createMarriage('engagement-bhreac-aliza-tir-addawol', ...COUPLES.bhreac, {
      type: 'engagement',
      notes: 'Die Quelle führt Aliza Hebog ausdrücklich als Bhreacs Verlobte.'
    })
  ],
  parentages: [
    ...childrenOf(['beynon-tarw-dinefwr', 'eynon-tarw-dinefwr'], 'marriage-erim-morcant-dinefwr'),
    ...childrenOf(['gwyndor-tir-addawol', 'gwawr-tir-addawol'], 'marriage-eynon-aithne-dinefwr', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Eynon und der Gwyndor-Generation sind nicht einzeln überlieferte Tir-Addawol-Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-eynon-to-gwyndor-generation-tir-addawol' }
    }),
    ...childrenOf(['ennissyen-tir-addawol', 'caraf-tir-addawol'], 'marriage-gwyndor-eilun-tir-addawol', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Gwyndor und der ab 1627 belegten Generation sind nicht einzeln überlieferte Tir-Addawol-Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-gwyndor-to-ennissyen-generation-tir-addawol' }
    }),
    ...childrenOf(['drwst-tir-addawol', 'owena-tir-addawol', 'roderick-tir-addawol'], 'marriage-blodeuwedd-ennissyen-dinefwr'),
    ...childrenOf(['gwynham-tir-addawol', 'milenna-tir-addawol'], 'marriage-drwst-gormlaith-tir-addawol'),
    ...childrenOf(['hael-tir-addawol', 'dajena-tir-addawol'], 'marriage-millena-roderick-blach'),
    ...childrenOf(['merryn-tir-addawol', 'blodeuyn-tir-addawol', 'tirian-tir-addawol'], 'marriage-caralyn-gwynham'),
    ...childrenOf(['fotor-tir-addawol', 'eiddwen-tir-addawol'], 'marriage-jeanae-hael-dyngwn'),
    ...childrenOf(['bhreac-tir-addawol', 'kynan-tir-addawol', 'rhena-tir-addawol', 'arian-tir-addawol', 'ivor-tir-addawol'], 'marriage-merryn-venora'),
    ...childrenOf(['heston-tir-addawol', 'lillifer-tir-addawol'], 'marriage-tirian-yvette-tir-addawol'),
    ...childrenOf(['dee-tir-addawol', 'shan-tir-addawol'], 'marriage-siona-fotor-teyrngarch')
  ],
  cadetBranches: [
    createLinkedLineBranch({
      id: 'brother-house-dinefwr-beynon',
      name: "Haus Dinefwr O'Cerrigarth",
      parentPartnershipId: 'marriage-beynon-bedelia-dinefwr',
      houseId: 'house-dinefwr',
      targetFamilyId: 'haus-dinefwr',
      emblem: HOUSE_EMBLEMS.dinefwr,
      subtitle: 'Bruderhaus · gegründet von Beynon und Bedelia',
      crestFrame: 'gold',
      notes: 'Beynon, der ältere Sohn Erims, begründet das eigenständige Bruderhaus Dinefwr. Seine Nachkommen werden ausschließlich in der verknüpften Dinefwr-Akte fortgeführt.'
    }),
    marriedAway('married-away-gwawr-tir-addawol-dinefwr', 'Haus Dinefwr', 'marriage-taredd-gwawr-dinefwr', 'house-dinefwr', 'haus-dinefwr', HOUSE_EMBLEMS.dinefwr),
    marriedAway('married-away-caraf-tir-addawol-wylan', 'Haus Wylan', 'marriage-tyreke-caraf', 'house-wylan', 'haus-wylan', HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-owena-tir-addawol-gafyr', 'Haus Gafyr', 'marriage-uther-owena', 'house-gafyr', 'haus-gafyr', HOUSE_EMBLEMS.gafyr),
    marriedAway('married-away-milenna-tir-addawol-hwyaden', 'Haus Hwyaden', 'marriage-milenna-emyas-tir-addawol', 'house-hwyaden', 'haus-hwyaden', HOUSE_EMBLEMS.hwyaden),
    marriedAway('married-away-dajena-tir-addawol-gwefrydd', 'Haus Gwefrydd', 'marriage-robyrt-dajena', 'house-gwefrydd', 'haus-gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    marriedAway('married-away-blodeuyn-tir-addawol-dinefwr', 'Haus Dinefwr', 'marriage-garselid-blodeuyn-dinefwr', 'house-dinefwr', 'haus-dinefwr', HOUSE_EMBLEMS.dinefwr),
    marriedAway('married-away-eiddwen-tir-addawol-marchog', 'Haus Marchog', 'marriage-eiddwen-tirian-marchog', 'house-marchog', 'haus-marchog')
  ],
  timeJumps: [
    {
      id: 'gap-eynon-to-gwyndor-generation-tir-addawol',
      parentPartnershipId: 'marriage-eynon-aithne-dinefwr',
      parentPersonId: '',
      childIds: ['gwyndor-tir-addawol', 'gwawr-tir-addawol'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Tir-Addawol-Generationen',
      notes: 'Der absolute Trenner liegt seriell unter Eynon, Aithne und dem Tir-Addawol-Hauswappen. Beynons Dinefwr-Hausknoten bleibt ein terminaler Bruderhauszweig und speist die Fortsetzung nicht.',
      extensions: {}
    },
    {
      id: 'gap-gwyndor-to-ennissyen-generation-tir-addawol',
      parentPartnershipId: 'marriage-gwyndor-eilun-tir-addawol',
      parentPersonId: '',
      childIds: ['ennissyen-tir-addawol', 'caraf-tir-addawol'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '1627',
      label: 'Die belegte Tir-Addawol-Linie setzt 1627 wieder ein',
      notes: 'Der zweite absolute Trenner liegt ausschließlich unter Gwyndor und Eilun. Gwawrs wegverheirateter Dinefwr-Zweig führt nicht in die Tir-Addawol-Fortsetzung.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-eynon-aithne-dinefwr',
    houseId: TIR_ADDAWOL_HOUSE_ID,
    crestSubtitle: 'Baronshaus von Glyndale · gegründet von Eynon und Aithne',
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
    sourceRevision: 1,
    sourceModule: 'Haus Tir Addawol (bereitgestellte Altdaten)',
    sourceNote: 'Genealogie, Lebensdaten, Ehen, Porträts, Baronsfolge und Erbfolge folgen der bereitgestellten Tir-Addawol-Hausseite. Erim und Morcant bilden dieselbe Ursprungsgeneration wie in der Dinefwr-Akte. Beynon und Bedelia tragen hier ausschließlich den verknüpften Dinefwr-Hausknoten; nur Eynon und Aithne tragen das Tir-Addawol-Stammwappen und führen nach dem ersten seriellen Zeitsprung zu Gwyndor und Gwawr. Der zweite Zeitsprung führt ausschließlich Gwyndor und Eilun zu Ennissyen und Caraf. Nachkommen werden jeweils nur an der fortgeführten Hausseite dargestellt: Dinefwr-Nachkommen ausschließlich bei Dinefwr, die Tir-Addawol-Nachkommen ausschließlich hier. Gwawr, Caraf, Owena, Milenna, Dajena, Blodeuyn und Eiddwen besitzen an ihren belegten Ehen direkte Wegverheiratet-Knoten. Gemeinsame Personen und Ehen mit Dinefwr, Wylan, Gafyr, Blach, Dyngwn, Gwefrydd, Aderyn und Teyrngarch behalten ihre vorhandenen IDs. Wiederholte generische Silhouetten der Quelle wurden nicht als individuelle Porträts importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems']
  }
});
