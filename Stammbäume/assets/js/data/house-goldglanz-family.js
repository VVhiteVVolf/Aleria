import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { HOUSE_GOLDGLANZ_PORTRAITS } from './house-goldglanz-portraits.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const GOLDGLANZ_HOUSE_ID = 'house-goldglanz';
const SOURCE_GAP_ID = 'gap-ljotmar-wodrun-to-wulfgar-gulda-goldglanz';

const HOUSE_EMBLEMS = Object.freeze({
  goldglanz: KRAEHENMOOR_HOUSE_EMBLEMS.goldglanz,
  silberblut: KRAEHENMOOR_HOUSE_EMBLEMS.silberblut,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  schwarzblut: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
  blutstahl: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
  feuerherz: KRAEHENMOOR_HOUSE_EMBLEMS.feuerherz,
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  kaltherz: KRAEHENMOOR_HOUSE_EMBLEMS.kaltherz,
  vragi: KRAEHENMOOR_HOUSE_EMBLEMS.vragi,
  kampfgeborene: RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene,
  schattenherz: KRAEHENMOOR_HOUSE_EMBLEMS.schattenherz
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

const HEAD_IDS = new Set([
  'ljotmar-goldglanz',
  'wulfgar-goldglanz',
  'haraldr-goldglanz',
  'magnus-1626-goldglanz',
  'sigurd-goldglanz',
  'wulfgar-1668-goldglanz',
  'tyrkir-goldglanz',
  'sverre-goldglanz'
]);

function lineageRoleFor(personId) {
  return HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? GOLDGLANZ_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_GOLDGLANZ_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GOLDGLANZ_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death, houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function ward(id, name, sex, birth, targetHouseName, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    familyRole: 'ward-away',
    title: options.title || `Als Mündel an ${targetHouseName} vermittelt`,
    tags: [...(options.tags || []), 'Mündel', 'Weggegeben']
  });
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

const PARTNERS_BY_ID = Object.freeze({
  'marriage-ljotmar-wodrun-goldglanz': ['ljotmar-goldglanz', 'wodrun'],
  'marriage-sigrid-wulfgar-silberblut': ['wulfgar-goldglanz', 'sigrid-silberblut'],
  'marriage-torvald-gulda-varangr': ['torvald-1585-varangr', 'gulda-goldglanz'],
  'marriage-haraldr-rimla-goldglanz': ['haraldr-goldglanz', 'rimla'],
  'marriage-eirik-iseld-schwarzblut': ['eirik-schwarzblut', 'iseld-goldglanz'],
  'marriage-birger-kragnis-goldglanz': ['birger-goldglanz', 'kragnis'],
  'marriage-skule-poldis-goldglanz': ['skule-goldglanz', 'poldis'],
  'marriage-magnus-eystra-goldglanz': ['magnus-1626-goldglanz', 'eystra'],
  'marriage-harald-myrna-blutstahl': ['harald-blutstahl', 'myrna-goldglanz'],
  'marriage-krister-blanda-goldglanz': ['krister-goldglanz', 'blanda'],
  'marriage-askold-hekla-silberblut': ['askold-silberblut', 'hekla-goldglanz'],
  'marriage-borkur-runa-feuerherz': ['borkur-feuerherz', 'runa-goldglanz'],
  'marriage-sigurd-oddleif-schmetterschild': ['sigurd-goldglanz', 'oddleif-schmetterschild'],
  'marriage-ljotur-ivana-kaltherz': ['ljotur-kaltherz', 'ivana-goldglanz'],
  'marriage-vidkun-grimny-vragi': ['vidkun-goldglanz', 'grimny-vragi'],
  'marriage-wulfgar-fastny-goldglanz': ['wulfgar-1668-goldglanz', 'fastny'],
  'marriage-valeric-ana-kampfgeborene': ['valeric-kampfgeborene', 'ana-goldglanz'],
  'marriage-martein-gulda-wellenschild': ['martein-wellenschild', 'gulda-1682-goldglanz'],
  'marriage-jodis-nvjar-goldglanz': ['nvjar-goldglanz', 'jodis-feuerherz'],
  'marriage-tyrkir-ljot-goldglanz': ['tyrkir-goldglanz', 'ljot'],
  'marriage-hakon-brynhildr-varangr': ['hakon-varangr', 'brynhildr-goldglanz'],
  'marriage-urdin-hadda-goldglanz': ['urdin-goldglanz', 'hadda'],
  'marriage-tyrfing-thera-schattenherz': ['tyrfing-schattenherz', 'thera-goldglanz'],
  'marriage-sverre-eithne-goldglanz': ['sverre-goldglanz', 'eithne-haeghra']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignChildGroupBelowParentPair(record) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignChildGroupBelowParentPair: true,
      registryManagedExtensionFields: ['chartAlignChildGroupBelowParentPair']
    }
  };
}

function alignParentPairOverChild(record, childPersonId) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignParentPairOverChildPersonId: childPersonId,
      registryManagedExtensionFields: ['chartAlignParentPairOverChildPersonId']
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'goldglanz-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: `Wegverheiratet an ${name}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

function wardAway(id, name, parentPersonId, houseId, targetFamilyId, emblem = '') {
  return createWardAwayBranch({
    id,
    name,
    parentPersonId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: `Als Mündel an ${name} vermittelt`,
    extensions: {
      registryManagedFields: [
        'name', 'parentPersonId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ]
    }
  });
}

export const HOUSE_GOLDGLANZ_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-goldglanz',
    title: 'Clan Goldglanz',
    motto: '',
    description: 'Hesirenclan aus Silberquell im Thanentum Schimmerküste. Der wohlhabende Brauerclan dient gemeinsam den Häusern Blutstahl und Silberblut und stützt seinen Einfluss auf Handel, Handwerk und ein weit verzweigtes Heiratsnetz.',
    emblem: HOUSE_EMBLEMS.goldglanz,
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES.goldglanz
  },
  houses: [
    house(GOLDGLANZ_HOUSE_ID, 'Clan Goldglanz', HOUSE_EMBLEMS.goldglanz),
    house('house-silberblut', 'Clan Silberblut', HOUSE_EMBLEMS.silberblut),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-schwarzblut', 'Clan Schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    house('house-blutstahl', 'Clan Blutstahl', HOUSE_EMBLEMS.blutstahl),
    house('house-feuerherz', 'Clan Feuerherz', HOUSE_EMBLEMS.feuerherz),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-kaltherz', 'Clan Kaltherz', HOUSE_EMBLEMS.kaltherz),
    house('house-vragi', 'Clan Vragi', HOUSE_EMBLEMS.vragi),
    house('house-kampfgeborene', 'Clan Kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    house('house-wellenschild', 'Clan Wellenschild'),
    house('house-schattenherz', 'Clan Schattenherz', HOUSE_EMBLEMS.schattenherz),
    house('house-haeghra', 'Clan Haeghra')
  ],
  persons: [
    person('ljotmar-goldglanz', 'Ljotmar Goldglanz', 'male', '????', '????', {
      title: 'Gründer des Clans Goldglanz',
      tags: ['Gründer']
    }),
    spouse('wodrun', 'Wodrun', 'female', '????', '????', '', {
      title: 'Mitgründerin des Clans Goldglanz',
      tags: ['Gründerin']
    }),

    person('wulfgar-goldglanz', 'Wulfgar Goldglanz', 'male', '1587', '1666'),
    awayWoman('gulda-goldglanz', 'Gulda Goldglanz', '1588', '????', 'Clan Varangr'),
    spouse('sigrid-silberblut', 'Sigrid Silberblut', 'female', '1580', '1640', 'house-silberblut', {
      notes: 'Die Goldglanz-Quelle nennt unmöglich 1540 als Todesjahr. Die Silberblut-Gegenakte führt konsistent 1640.'
    }),
    spouse('torvald-1585-varangr', 'Torvald Varangr', 'male', '1585', '1646', 'house-varangr'),

    person('haraldr-goldglanz', 'Haraldr Goldglanz', 'male', '1606', '1681'),
    awayWoman('iseld-goldglanz', 'Iseld Goldglanz', '1608', '1662', 'Clan Schwarzblut'),
    person('birger-goldglanz', 'Birger Goldglanz', 'male', '1610', '1674'),
    person('skule-goldglanz', 'Skule Goldglanz', 'male', '1612', '1686'),
    spouse('rimla', 'Rimla', 'female', '????', '????'),
    spouse('eirik-schwarzblut', 'Eirik Schwarzblut', 'male', '1610', '1679', 'house-schwarzblut'),
    spouse('kragnis', 'Kragnis', 'female', '????', '????'),
    spouse('poldis', 'Poldis', 'female', '????', '????'),

    person('magnus-1626-goldglanz', 'Magnus Goldglanz', 'male', '1626', '1704'),
    awayWoman('myrna-goldglanz', 'Myrna Goldglanz', '1630', '1679', 'Clan Blutstahl'),
    person('krister-goldglanz', 'Krister Goldglanz', 'male', '1630', '1709'),
    awayWoman('hekla-goldglanz', 'Hekla Goldglanz', '1634', '1694', 'Clan Silberblut'),
    spouse('eystra', 'Eystra', 'female', '????', '????'),
    spouse('harald-blutstahl', 'Harald Blutstahl', 'male', '1629', '1691', 'house-blutstahl'),
    spouse('blanda', 'Blanda', 'female', '????', '????'),
    spouse('askold-silberblut', 'Askold Silberblut', 'male', '1627', '1685', 'house-silberblut'),

    awayWoman('runa-goldglanz', 'Runa Goldglanz', '1648', '1707', 'Clan Feuerherz'),
    person('sigurd-goldglanz', 'Sigurd Goldglanz', 'male', '1650', '1731'),
    awayWoman('ivana-goldglanz', 'Ivana Goldglanz', '1651', '1709', 'Clan Kaltherz'),
    person('vidkun-goldglanz', 'Vidkun Goldglanz', 'male', '1653', '1720', {
      notes: 'Die jüngere Goldglanz-Stammhausquelle führt 1720; die ältere Vragi-Gegenakte nannte 1716.'
    }),
    spouse('borkur-feuerherz', 'Börkur Feuerherz', 'male', '1650', '1709', 'house-feuerherz'),
    spouse('oddleif-schmetterschild', 'Oddleif Schmetterschild', 'female', '1652', '1714', 'house-schmetterschild'),
    spouse('ljotur-kaltherz', 'Ljotur Kaltherz', 'male', '1649', '1711', 'house-kaltherz'),
    spouse('grimny-vragi', 'Grimny Vragi', 'female', '1652', '1739', 'house-vragi'),

    person('wulfgar-1668-goldglanz', 'Wulfgar Goldglanz', 'male', '1668', ''),
    awayWoman('ana-goldglanz', 'Ana Goldglanz', '1670', '1733', 'Clan Kampfgeborene'),
    awayWoman('gulda-1682-goldglanz', 'Gulda Goldglanz', '1682', '', 'Clan Wellenschild'),
    person('nvjar-goldglanz', 'Nvjar Goldglanz', 'male', '1677', ''),
    spouse('fastny', 'Fastny', 'female', '????', '????'),
    spouse('valeric-kampfgeborene', 'Valeric Kampfgeborener', 'male', '1667', '1714', 'house-kampfgeborene'),
    spouse('martein-wellenschild', 'Martein Wellenschild', 'male', '1679', '', 'house-wellenschild'),
    spouse('jodis-feuerherz', 'Jödis Feuerherz', 'female', '1674', '1734', 'house-feuerherz'),

    person('tyrkir-goldglanz', 'Tyrkir Goldglanz', 'male', '1688', ''),
    awayWoman('brynhildr-goldglanz', 'Brynhildr Goldglanz', '1690', '', 'Clan Varangr'),
    person('yornir-goldglanz', 'Yornir Goldglanz', 'male', '1697', ''),
    person('urdin-goldglanz', 'Urdin Goldglanz', 'male', '1696', ''),
    awayWoman('thera-goldglanz', 'Thera Goldglanz', '1700', '', 'Clan Schattenherz'),
    spouse('ljot', 'Ljot', 'female', '1689', ''),
    spouse('hakon-varangr', 'Hakon Varangr', 'male', '1689', '', 'house-varangr'),
    spouse('hadda', 'Hadda', 'female', '????', '????'),
    spouse('tyrfing-schattenherz', 'Tyrfing Schattenherz', 'male', '1700', '', 'house-schattenherz'),

    person('sverre-goldglanz', 'Sverre Goldglanz', 'male', '1714', ''),
    ward('kjallak-goldglanz', 'Kjallak Goldglanz', 'male', '1720', 'Clan Schmetterschild', {
      notes: 'Kjallak ist leiblicher Sohn Tyrkirs und Ljots und als Mündel an Clan Schmetterschild vermittelt.'
    }),
    person('zagna-goldglanz', 'Zagna Goldglanz', 'female', '1722', ''),
    person('peder-goldglanz', 'Peder Goldglanz', 'male', '1721', ''),
    person('rikke-goldglanz', 'Rikke Goldglanz', 'female', '1723', ''),
    spouse('eithne-haeghra', 'Eithne Haeghra', 'female', '1716', '', 'house-haeghra'),

    person('magnus-1735-goldglanz', 'Magnus Goldglanz', 'male', '1735', '')
  ],
  partnerships: [
    partnership('marriage-ljotmar-wodrun-goldglanz', { status: 'ended' }),
    alignChildGroupBelowParentPair(partnership('marriage-sigrid-wulfgar-silberblut', { status: 'ended', end: '1640' })),
    partnership('marriage-torvald-gulda-varangr', { status: 'ended', end: '1646' }),
    alignChildGroupBelowParentPair(partnership('marriage-haraldr-rimla-goldglanz', { status: 'ended', end: '1681' })),
    partnership('marriage-eirik-iseld-schwarzblut', { status: 'ended', end: '1662' }),
    alignParentPairOverChild(
      partnership('marriage-birger-kragnis-goldglanz', { status: 'ended', end: '1674' }),
      'krister-goldglanz'
    ),
    alignParentPairOverChild(
      partnership('marriage-skule-poldis-goldglanz', { status: 'ended', end: '1686' }),
      'hekla-goldglanz'
    ),
    alignChildGroupBelowParentPair(partnership('marriage-magnus-eystra-goldglanz', { status: 'ended', end: '1704' })),
    partnership('marriage-harald-myrna-blutstahl', { status: 'ended', end: '1679' }),
    alignChildGroupBelowParentPair(partnership('marriage-krister-blanda-goldglanz', { status: 'ended', end: '1709' })),
    partnership('marriage-askold-hekla-silberblut', { status: 'ended', end: '1685' }),
    partnership('marriage-borkur-runa-feuerherz', { status: 'ended', end: '1707' }),
    alignChildGroupBelowParentPair(partnership('marriage-sigurd-oddleif-schmetterschild', { status: 'ended', end: '1714' })),
    partnership('marriage-ljotur-ivana-kaltherz', { status: 'ended', end: '1709' }),
    alignChildGroupBelowParentPair(partnership('marriage-vidkun-grimny-vragi', { status: 'ended', end: '1720' })),
    alignChildGroupBelowParentPair(partnership('marriage-wulfgar-fastny-goldglanz', { status: 'ended' })),
    partnership('marriage-valeric-ana-kampfgeborene', { status: 'ended', end: '1714' }),
    partnership('marriage-martein-gulda-wellenschild'),
    alignChildGroupBelowParentPair(partnership('marriage-jodis-nvjar-goldglanz', { status: 'ended', end: '1734' })),
    alignChildGroupBelowParentPair(partnership('marriage-tyrkir-ljot-goldglanz')),
    partnership('marriage-hakon-brynhildr-varangr'),
    alignChildGroupBelowParentPair(partnership('marriage-urdin-hadda-goldglanz')),
    partnership('marriage-tyrfing-thera-schattenherz'),
    alignParentPairOverChild(
      partnership('marriage-sverre-eithne-goldglanz'),
      'magnus-1735-goldglanz'
    )
  ],
  parentages: [
    ...childrenOf(['wulfgar-goldglanz', 'gulda-goldglanz'], 'marriage-ljotmar-wodrun-goldglanz', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(
      ['haraldr-goldglanz', 'iseld-goldglanz', 'birger-goldglanz', 'skule-goldglanz'],
      'marriage-sigrid-wulfgar-silberblut'
    ),
    ...childrenOf(['magnus-1626-goldglanz', 'myrna-goldglanz'], 'marriage-haraldr-rimla-goldglanz'),
    ...childrenOf(['krister-goldglanz'], 'marriage-birger-kragnis-goldglanz'),
    ...childrenOf(['hekla-goldglanz'], 'marriage-skule-poldis-goldglanz'),
    ...childrenOf(['runa-goldglanz', 'sigurd-goldglanz'], 'marriage-magnus-eystra-goldglanz'),
    ...childrenOf(['ivana-goldglanz', 'vidkun-goldglanz'], 'marriage-krister-blanda-goldglanz'),
    ...childrenOf(['wulfgar-1668-goldglanz', 'ana-goldglanz'], 'marriage-sigurd-oddleif-schmetterschild'),
    ...childrenOf(['gulda-1682-goldglanz', 'nvjar-goldglanz'], 'marriage-vidkun-grimny-vragi'),
    ...childrenOf(
      ['tyrkir-goldglanz', 'brynhildr-goldglanz', 'yornir-goldglanz'],
      'marriage-wulfgar-fastny-goldglanz'
    ),
    ...childrenOf(['urdin-goldglanz', 'thera-goldglanz'], 'marriage-jodis-nvjar-goldglanz'),
    ...childrenOf(['sverre-goldglanz', 'kjallak-goldglanz', 'zagna-goldglanz'], 'marriage-tyrkir-ljot-goldglanz'),
    ...childrenOf(['peder-goldglanz', 'rikke-goldglanz'], 'marriage-urdin-hadda-goldglanz'),
    ...childrenOf(['magnus-1735-goldglanz'], 'marriage-sverre-eithne-goldglanz')
  ],
  cadetBranches: [
    marriedAway('married-away-gulda-goldglanz-varangr', 'Clan Varangr', 'marriage-torvald-gulda-varangr', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-iseld-goldglanz-schwarzblut', 'Clan Schwarzblut', 'marriage-eirik-iseld-schwarzblut', 'house-schwarzblut', 'haus-schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    marriedAway('married-away-myrna-goldglanz-blutstahl', 'Clan Blutstahl', 'marriage-harald-myrna-blutstahl', 'house-blutstahl', 'haus-blutstahl', HOUSE_EMBLEMS.blutstahl),
    marriedAway('married-away-hekla-goldglanz-silberblut', 'Clan Silberblut', 'marriage-askold-hekla-silberblut', 'house-silberblut', 'haus-silberblut', HOUSE_EMBLEMS.silberblut),
    marriedAway('married-away-runa-goldglanz-feuerherz', 'Clan Feuerherz', 'marriage-borkur-runa-feuerherz', 'house-feuerherz', 'haus-feuerherz', HOUSE_EMBLEMS.feuerherz),
    marriedAway('married-away-ivana-goldglanz-kaltherz', 'Clan Kaltherz', 'marriage-ljotur-ivana-kaltherz', 'house-kaltherz', 'haus-kaltherz', HOUSE_EMBLEMS.kaltherz),
    marriedAway('married-away-ana-goldglanz-kampfgeborene', 'Clan Kampfgeborene', 'marriage-valeric-ana-kampfgeborene', 'house-kampfgeborene', 'haus-kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    marriedAway('married-away-gulda-1682-goldglanz-wellenschild', 'Clan Wellenschild', 'marriage-martein-gulda-wellenschild', 'house-wellenschild', 'haus-wellenschild'),
    marriedAway('married-away-brynhildr-goldglanz-varangr', 'Clan Varangr', 'marriage-hakon-brynhildr-varangr', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-thera-goldglanz-schattenherz', 'Clan Schattenherz', 'marriage-tyrfing-thera-schattenherz', 'house-schattenherz', 'haus-schattenherz', HOUSE_EMBLEMS.schattenherz),
    wardAway('ward-away-kjallak-goldglanz-schmetterschild', 'Clan Schmetterschild', 'kjallak-goldglanz', 'house-schmetterschild', 'haus-schmetterschild', HOUSE_EMBLEMS.schmetterschild)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-ljotmar-wodrun-goldglanz',
    parentPersonId: '',
    childIds: ['wulfgar-goldglanz', 'gulda-goldglanz'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1587',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Goldglanz-Hausknoten; kein anderer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-ljotmar-wodrun-goldglanz',
    houseId: GOLDGLANZ_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Silberquell · Brauer und Handelshaus',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ljotmar-goldglanz',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    chartLayoutPolicy: 'strict-v1',
    sourceRevision: 3,
    sourceModule: 'Clan Goldglanz (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Goldglanz-Stammbaum wird ohne Personenfokus von Ljotmar und Wodrun bis zur jüngsten Generation des Jahres 1740 gezeigt. Das Hauswappen und genau ein absolut serieller Zeitsprung stehen direkt unter dem Gründerpaar. Kinder werden ausschließlich unter dem belegten Elternpaar geführt; Nachkommen aus auswärtig fortgeführten Linien bleiben in deren Gegenakten. Zehn Goldglanz-Frauen erhalten direkte, senkrechte Wegverheiratet-Knoten unter ihrer jeweiligen Ehe. Kjallak bleibt leiblicher Sohn Tyrkirs und Ljots, erhält den blauen Mündelstatus und eine direkte senkrechte Verknüpfung zu Clan Schmetterschild. Fünf namenlose Verlobten-Platzhalter der jüngsten Generation werden nicht importiert. Wiederholte Standardsilhouetten werden nicht als Individualporträts gespeichert. Sigrids Todesjahr 1540 ist chronologisch unmöglich und wird nach ihrer Silberblut-Gegenakte als 1640 geführt. Vidkuns Todesjahr sowie Kjallaks Geburtsjahr werden nach der Goldglanz-Stammhausquelle auf 1720 vereinheitlicht.',
    sourceConflicts: [{
      field: 'persons.sigrid-silberblut.death',
      values: ['1540', '1640'],
      resolvedValue: '1640',
      reason: '1540 liegt vor Wulfgars Geburt 1587 und vor allen vier Geburten ihrer Kinder; die Silberblut-Gegenakte führt 1640.'
    }, {
      field: 'persons.vidkun-goldglanz.death',
      values: ['1716', '1720'],
      resolvedValue: '1720',
      reason: 'Die Goldglanz-Stammhausquelle ist für Vidkun als gebürtigen Goldglanz maßgeblich.'
    }, {
      field: 'persons.kjallak-goldglanz.birth',
      values: ['1724', '1720'],
      resolvedValue: '1720',
      reason: 'Die Goldglanz-Stammhausquelle ist für Kjallak als gebürtigen Goldglanz maßgeblich.'
    }],
    registryTombstones: {
      persons: ['haus-goldglanz-gruender', 'haus-goldglanz-gruenderin'],
      partnerships: ['marriage-haus-goldglanz-founders']
    },
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'chartLayoutPolicy',
      'sourceModule',
      'sourceNote',
      'sourceConflicts'
    ],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'secondarySeats',
      'liegeHouseId',
      'liegeHouseName',
      'liegeHouses',
      'folderIcons',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId']
  }
});
