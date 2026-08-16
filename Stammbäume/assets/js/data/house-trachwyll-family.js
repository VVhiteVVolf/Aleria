import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createSingleFounderHouseBranch
} from './family-record-builders.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_TRACHWYLL_PORTRAITS } from './house-trachwyll-portraits.js';
import {
  IVARSHEIM_HOUSE_EMBLEMS,
  IVARSHEIM_HOUSE_PROFILES,
  IVARSHEIM_ORIGIN_HOUSE_PROFILES
} from './ivarsheim-house-profiles.js';
import { KLAUENINSEL_HOUSE_EMBLEMS } from './klaueninseln-house-profiles.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const TALFRONWYN_HOUSE_ID = 'house-trachwyll-talfronwyn';
const IVARSFELS_HOUSE_ID = 'house-trachwyll';
const TRACHWYLL_EMBLEM = IVARSHEIM_HOUSE_EMBLEMS.trachwyll;
const FOUNDER_TIME_JUMP_ID = 'gap-gwalchmai-breandan-trachwyll';
const BREANDAN_TIME_JUMP_ID = 'gap-breandan-macsen-trachwyll';

const HOUSE_EMBLEMS = Object.freeze({
  trachwyll: TRACHWYLL_EMBLEM,
  blodyn: 'assets/images/houses/Blütenland/haus-blodyn.png',
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  blaidd: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd,
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
  morthwyll: KLAUENINSEL_HOUSE_EMBLEMS.morthwyll,
  walwrs: KLAUENINSEL_HOUSE_EMBLEMS.walwrs,
  illygoden: GRAUE_WEITE_HOUSE_EMBLEMS.illygoden,
  gwaedlyd: GRAUE_WEITE_HOUSE_EMBLEMS.gwaedlyd,
  lyfant: GRAUE_WEITE_HOUSE_EMBLEMS.lyfant,
  mochdaer: WEIDEBUCHT_HOUSE_EMBLEMS.mochdaer,
  neidr: SILBERINSEL_HOUSE_EMBLEMS.neidr,
  silberzunge: IVARSHEIM_HOUSE_EMBLEMS.silberzunge,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  grendel: IVARSHEIM_HOUSE_EMBLEMS.grendel
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
  'gwalchmai-trachwyll',
  'breandan-trachwyll',
  'macsen-trachwyll',
  'gavin-trachwyll',
  'bethwyn-trachwyll',
  'conway-trachwyll',
  'talfryn-trachwyll',
  'charlton-trachwyll',
  'kenyon-trachwyll',
  'rhodri-trachwyll',
  'gwilym-trachwyll'
]);

function worldPersonIdFor(id, houseId) {
  if (houseId === TALFRONWYN_HOUSE_ID) {
    return id === 'kenyon-trachwyll'
      ? `person--haus-trachwyll--${id}`
      : `person--haus-trachwyll-talfronwyn--${id}`;
  }
  if (houseId === IVARSFELS_HOUSE_ID) {
    return `person--haus-trachwyll--${id}`;
  }
  return '';
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

function personForLine(lineHouseId, id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? lineHouseId : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || worldPersonIdFor(id, houseId),
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_TRACHWYLL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === lineHouseId ? 'core' : 'married'),
    lineageRole: options.lineageRole || (HEAD_IDS.has(id) ? 'head' : 'branch'),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function talfronwynPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(TALFRONWYN_HOUSE_ID, id, name, sex, birth, death, options);
}

function ivarsfelsPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(IVARSFELS_HOUSE_ID, id, name, sex, birth, death, options);
}

function awayWoman(linePerson, id, name, birth, death, targetHouseName, options = {}) {
  return linePerson(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, { status: 'ended', end });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: options.idPrefix || 'trachwyll-parentage',
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
    crestFrame: 'gold',
    subtitle: `Wegverheiratet an ${name}`
  });
}

const ORIGIN_HOUSES = Object.freeze([
  house(TALFRONWYN_HOUSE_ID, "Haus Trachwyll O'Talfronwyn", HOUSE_EMBLEMS.trachwyll),
  house(IVARSFELS_HOUSE_ID, 'Haus Trachwyll', HOUSE_EMBLEMS.trachwyll),
  house('house-blodyn', 'Haus Blodyn', HOUSE_EMBLEMS.blodyn),
  house('house-drewi', 'Haus Drewi'),
  house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
  house('house-wellenschild', 'Clan Wellenschild'),
  house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
  house('house-frostauge', 'Clan Frostauge'),
  house('house-blaidd', "Haus Blaidd O'Branon", HOUSE_EMBLEMS.blaidd),
  house('house-gwaedlyd', "Haus Gwaedlyd O'Caer Gorwel", HOUSE_EMBLEMS.gwaedlyd),
  house('house-illygoden', "Haus Illygoden O'Tirwedd", HOUSE_EMBLEMS.illygoden),
  house('house-mochdaer-gwyliau', "Haus Mochdaer O'Gwyliau", HOUSE_EMBLEMS.mochdaer),
  house('house-lyfant', "Haus Lyfant O'Derwyddion", HOUSE_EMBLEMS.lyfant),
  house('house-borthwick', 'Haus Borthwick'),
  house('house-walwrs', "Haus Walwrs O'Traeth", HOUSE_EMBLEMS.walwrs),
  house('house-boyd', 'Haus Boyd'),
  house('house-gwenyen', "Haus Gwenyen O'Gwych"),
  house('house-arth', "Haus Arth O'Talgarth", HOUSE_EMBLEMS.arth),
  house('house-bochdew', "Haus Bochdew O'Caer"),
  house('house-eisenbieger', 'Clan Eisenbieger'),
  house('house-neidr', "Haus Neidr O'Llanvane", HOUSE_EMBLEMS.neidr),
  house('house-morthwyll', "Haus Morthwyll O'Caer Morben", HOUSE_EMBLEMS.morthwyll)
]);

const IVARSFELS_HOUSES = Object.freeze([
  house(IVARSFELS_HOUSE_ID, 'Haus Trachwyll', HOUSE_EMBLEMS.trachwyll),
  house(TALFRONWYN_HOUSE_ID, "Haus Trachwyll O'Talfronwyn", HOUSE_EMBLEMS.trachwyll),
  house('house-eisenbieger', 'Clan Eisenbieger'),
  house('house-silberzunge', 'Clan Silberzunge', HOUSE_EMBLEMS.silberzunge),
  house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
  house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg),
  house('house-grendel', 'Clan Grendel', HOUSE_EMBLEMS.grendel)
]);

const TALFRONWYN_PARTNERS = Object.freeze({
  founders: ['gwalchmai-trachwyll', 'morwenna-blodyn'],
  breandan: ['breandan-trachwyll', 'genofeva-drewi'],
  sulwen: ['sulwen-trachwyll', 'gogyvwlch-blodyn'],
  macsen: ['macsen-trachwyll', 'edda-varulv'],
  ysolde: ['ysolde-trachwyll', 'geraint-drewi'],
  owain: ['owain-trachwyll', 'arnora-wellenschild'],
  gavin: ['gavin-trachwyll', 'angharad-blodyn'],
  arthan: ['arthan-trachwyll', 'bergljot-wellensaenger'],
  alinor: ['alinor-trachwyll', 'arn-vaeren'],
  alawen: ['alawen-trachwyll', 'leifric-frostauge'],
  dyvynwal: ['dyvynwal-trachwyll', 'iesin-blaidd'],
  bethwyn: ['bethwyn-trachwyll', 'meeghan-gwaedlyd'],
  jinell: ['jinell-trachwyll', 'kyvwlch-blaidd'],
  griffudd: ['griffudd-trachwyll', 'sulwen-illygoden'],
  mordred: ['mordred-trachwyll', 'armella-mochdaer'],
  dafydd: ['dafydd-trachwyll', 'glesni-lyfant'],
  conway: ['conway-trachwyll', 'nasuada-borthwick'],
  sioned: ['sioned-trachwyll', 'cadwallen-walwrs'],
  taranis: ['taranis-trachwyll', 'essylt-boyd'],
  godwyn: ['godwyn-trachwyll', 'iseult-gwenyen'],
  talfryn: ['talfryn-trachwyll', 'ysabel-drewi'],
  dolena: ['dolena-trachwyll', 'denawal-1680-arth'],
  merlion: ['merlion-trachwyll', 'alawen-bochdew'],
  main: ['main-trachwyll', 'meredydd-lyfant'],
  kenyon: ['kenyon-trachwyll', 'leikn-eisenbieger'],
  charlton: ['charlton-trachwyll', 'yvaine-gwenyen'],
  delwen: ['delwen-trachwyll', 'wynfor-blodyn'],
  falka: ['falka-trachwyll', 'gwastad-neidr'],
  kane: ['kane-trachwyll', 'guenevere-morthwyll']
});

const IVARSFELS_PARTNERS = Object.freeze({
  kenyon: TALFRONWYN_PARTNERS.kenyon,
  rhodri: ['rhodri-trachwyll', 'oddny-silberzunge'],
  gwenlyn: ['gwenlyn-trachwyll', 'torvar-wargh'],
  gwendolyn: ['gwendolyn-trachwyll', 'skeldar-skogg'],
  gwilym: ['gwilym-trachwyll', 'ingrid-grendel']
});

export const HOUSE_TRACHWYLL_TALFRONWYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-trachwyll-talfronwyn',
    title: "Haus Trachwyll O'Talfronwyn",
    motto: '',
    description: 'Vollständige Herkunftsakte des vennyrianischen Penron-Hauses Trachwyll aus Talfronwyn. Kenyon bildet den alleinigen Übergang in die neue Ivarsfels-Linie; seine Nachkommen werden nur dort fortgeführt.',
    emblem: TRACHWYLL_EMBLEM,
    houseProfile: IVARSHEIM_ORIGIN_HOUSE_PROFILES['trachwyll-talfronwyn']
  },
  houses: [...ORIGIN_HOUSES],
  persons: [
    talfronwynPerson('gwalchmai-trachwyll', 'Gwalchmai Trachwyll', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Gründer des Hauses Trachwyll'
    }),
    talfronwynPerson('morwenna-blodyn', 'Morwenna Blodyn', 'female', '????', '????', {
      houseId: 'house-blodyn',
      familyRole: 'founder',
      title: 'Gründerin des Hauses Trachwyll · Geborene Blodyn'
    }),

    talfronwynPerson('breandan-trachwyll', 'Breandan Trachwyll', 'male', '????', '????'),
    talfronwynPerson('genofeva-drewi', 'Genofeva Drewi', 'female', '????', '????', {
      houseId: 'house-drewi'
    }),
    awayWoman(talfronwynPerson, 'sulwen-trachwyll', 'Sulwen Trachwyll', '????', '????', 'Haus Blodyn'),
    talfronwynPerson('gogyvwlch-blodyn', 'Gogyvwlch Blodyn', 'male', '????', '????', {
      houseId: 'house-blodyn'
    }),

    talfronwynPerson('macsen-trachwyll', 'Macsen Trachwyll', 'male', '1580', '1650'),
    talfronwynPerson('edda-varulv', 'Edda Varulv', 'female', '1583', '1627', {
      houseId: 'house-varulv'
    }),
    awayWoman(talfronwynPerson, 'ysolde-trachwyll', 'Ysolde Trachwyll', '1582', '1659', 'Haus Drewi'),
    talfronwynPerson('geraint-drewi', 'Geraint Drewi', 'male', '1579', '1661', {
      houseId: 'house-drewi',
      notes: 'Das in der Altquelle eingebettete Porträt ist als veraltet markiert und wird bewusst nicht übernommen.'
    }),
    talfronwynPerson('owain-trachwyll', 'Owain Trachwyll', 'male', '1585', '1654'),
    talfronwynPerson('arnora-wellenschild', 'Arnóra Wellenschild', 'female', '1586', '1659', {
      houseId: 'house-wellenschild'
    }),

    talfronwynPerson('gavin-trachwyll', 'Gavin Trachwyll', 'male', '1605', '1662'),
    talfronwynPerson('angharad-blodyn', 'Angharad Blodyn', 'female', '1603', '1660', {
      houseId: 'house-blodyn',
      notes: 'Die Trachwyll-Hierarchie nennt 1603; die ältere Blodyn-Akte nennt abweichend 1600.'
    }),
    talfronwynPerson('arthan-trachwyll', 'Arthan Trachwyll', 'male', '1607', '1694'),
    talfronwynPerson('bergljot-wellensaenger', 'Bergljot Wellensänger', 'female', '1610', '1677', {
      houseId: 'house-wellenschild'
    }),
    awayWoman(talfronwynPerson, 'alinor-trachwyll', 'Alinor Trachwyll', '1619', '1661', 'Clan Vaeren'),
    talfronwynPerson('arn-vaeren', 'Arn Vaeren', 'male', '1608', '1647', {
      houseId: 'house-vaeren'
    }),
    awayWoman(talfronwynPerson, 'alawen-trachwyll', 'Alawen Trachwyll', '1605', '1700', 'Clan Frostauge'),
    talfronwynPerson('leifric-frostauge', 'Leifric Frostauge', 'male', '1599', '1691', {
      houseId: 'house-frostauge'
    }),
    awayWoman(talfronwynPerson, 'dyvynwal-trachwyll', 'Dyvynwal Trachwyll', '1616', '1676', "Haus Blaidd O'Branon"),
    talfronwynPerson('iesin-blaidd', 'Iesin Blaidd', 'male', '1618', '1650', {
      houseId: 'house-blaidd'
    }),

    talfronwynPerson('bethwyn-trachwyll', 'Bethwyn Trachwyll', 'male', '1623', '1654'),
    talfronwynPerson('meeghan-gwaedlyd', 'Meeghan Gwaedlyd', 'female', '1622', '1670', {
      houseId: 'house-gwaedlyd'
    }),
    awayWoman(talfronwynPerson, 'jinell-trachwyll', 'Jinell Trachwyll', '1633', '1674', "Haus Blaidd O'Branon"),
    talfronwynPerson('kyvwlch-blaidd', 'Kyvwlch Blaidd', 'male', '1632', '1720', {
      houseId: 'house-blaidd'
    }),
    talfronwynPerson('griffudd-trachwyll', 'Griffudd Trachwyll', 'male', '1629', '1702'),
    talfronwynPerson('sulwen-illygoden', 'Sulwen Illygoden', 'female', '1634', '1689', {
      houseId: 'house-illygoden'
    }),
    talfronwynPerson('mordred-trachwyll', 'Mordred Trachwyll', 'male', '1631', '1698'),
    talfronwynPerson('armella-mochdaer', 'Armella Mochdaer', 'female', '1630', '1669', {
      houseId: 'house-mochdaer-gwyliau'
    }),
    talfronwynPerson('dafydd-trachwyll', 'Dafydd Trachwyll', 'male', '1636', '1705', {
      notes: 'Das in der Altquelle eingebettete Porträt ist als veraltet markiert und wird bewusst nicht übernommen.'
    }),
    talfronwynPerson('glesni-lyfant', 'Glesni Lyfant', 'female', '1637', '1701', {
      houseId: 'house-lyfant'
    }),

    talfronwynPerson('conway-trachwyll', 'Conway Trachwyll', 'male', '1646', '1710'),
    talfronwynPerson('nasuada-borthwick', 'Nasuada Borthwick', 'female', '1648', '1703', {
      houseId: 'house-borthwick'
    }),
    awayWoman(talfronwynPerson, 'sioned-trachwyll', 'Sioned Trachwyll', '1659', '1702', "Haus Walwrs O'Traeth"),
    talfronwynPerson('cadwallen-walwrs', 'Cadwallen Walwrs', 'male', '1658', '1715', {
      houseId: 'house-walwrs'
    }),
    talfronwynPerson('taranis-trachwyll', 'Taranis Trachwyll', 'male', '1654', '1720'),
    talfronwynPerson('essylt-boyd', 'Essylt Boyd', 'female', '1657', '1720', {
      houseId: 'house-boyd'
    }),
    talfronwynPerson('carynne-trachwyll', 'Carynne Trachwyll', 'female', '1655', '', {
      title: 'Unverheiratet'
    }),
    talfronwynPerson('godwyn-trachwyll', 'Godwyn Trachwyll', 'male', '1658', '1715'),
    talfronwynPerson('iseult-gwenyen', 'Iseult Gwenyen', 'female', '1658', '1720', {
      houseId: 'house-gwenyen'
    }),

    talfronwynPerson('talfryn-trachwyll', 'Talfryn Trachwyll', 'male', '1666', '1720'),
    talfronwynPerson('ysabel-drewi', 'Ysabel Drewi', 'female', '1672', '1720', {
      houseId: 'house-drewi'
    }),
    awayWoman(talfronwynPerson, 'dolena-trachwyll', 'Dolena Trachwyll', '1685', '1710', "Haus Arth O'Talgarth"),
    talfronwynPerson('denawal-1680-arth', 'Denawal Arth', 'male', '1680', '1710', {
      houseId: 'house-arth'
    }),
    talfronwynPerson('merlion-trachwyll', 'Merlion Trachwyll', 'male', '1675', '1720'),
    talfronwynPerson('alawen-bochdew', 'Alawen Bochdew', 'female', '1680', '1720', {
      houseId: 'house-bochdew'
    }),
    awayWoman(talfronwynPerson, 'main-trachwyll', 'Main Trachwyll', '1671', '1720', "Haus Lyfant O'Derwyddion"),
    talfronwynPerson('meredydd-lyfant', 'Meredydd Lyfant', 'male', '1676', '1720', {
      houseId: 'house-lyfant'
    }),
    talfronwynPerson('kenyon-trachwyll', 'Kenyon Trachwyll', 'male', '1676', '', {
      title: 'Begründer der Ivarsfels-Linie',
      notes: 'Die ausführliche Hierarchietabelle und die Generationenfolge belegen 1676. Die Kurzangabe 1720 in der Oberhauptübersicht ist ein Quellfehler.'
    }),
    talfronwynPerson('leikn-eisenbieger', 'Leikn Eisenbieger', 'female', '1677', '', {
      houseId: 'house-eisenbieger',
      title: 'Ehefrau Kenyons · Mit ihm nach Ivarsfels ausgewandert'
    }),

    talfronwynPerson('charlton-trachwyll', 'Charlton Trachwyll', 'male', '1695', '1720'),
    talfronwynPerson('yvaine-gwenyen', 'Yvaine Gwenyen', 'female', '1697', '1720', {
      houseId: 'house-gwenyen'
    }),
    awayWoman(talfronwynPerson, 'delwen-trachwyll', 'Delwen Trachwyll', '1699', '1720', 'Haus Blodyn'),
    talfronwynPerson('wynfor-blodyn', 'Wynfor Blodyn', 'male', '1689', '1720', {
      houseId: 'house-blodyn',
      notes: 'Die Trachwyll-Hierarchie nennt 1689; die ältere Blodyn-Akte nennt abweichend 1690.'
    }),
    awayWoman(talfronwynPerson, 'falka-trachwyll', 'Falka Trachwyll', '1699', '', "Haus Neidr O'Llanvane"),
    talfronwynPerson('gwastad-neidr', 'Gwastad Neidr', 'male', '1696', '', {
      houseId: 'house-neidr'
    }),
    talfronwynPerson('kane-trachwyll', 'Kane Trachwyll', 'male', '1700', ''),
    talfronwynPerson('guenevere-morthwyll', 'Guenevere Morthwyll', 'female', '1697', '', {
      houseId: 'house-morthwyll'
    }),

    talfronwynPerson('madoc-trachwyll', 'Madoc Trachwyll', 'male', '1715', '1720'),
    talfronwynPerson('nerys-trachwyll', 'Nerys Trachwyll', 'female', '1717', '1720'),
    talfronwynPerson('owen-trachwyll', 'Owen Trachwyll', 'male', '1721', ''),
    talfronwynPerson('tegan-trachwyll', 'Tegan Trachwyll', 'female', '1724', '')
  ],
  partnerships: [
    endedMarriage('marriage-morwenna-gwalchmai', ...TALFRONWYN_PARTNERS.founders),
    endedMarriage('marriage-breandan-genofeva-trachwyll', ...TALFRONWYN_PARTNERS.breandan),
    endedMarriage('marriage-gogyvwlch-sulwen', ...TALFRONWYN_PARTNERS.sulwen),
    endedMarriage('marriage-edda-macsen-varulv', ...TALFRONWYN_PARTNERS.macsen, '1627'),
    endedMarriage('marriage-ysolde-geraint-trachwyll', ...TALFRONWYN_PARTNERS.ysolde, '1659'),
    endedMarriage('marriage-owain-arnora-trachwyll', ...TALFRONWYN_PARTNERS.owain, '1654'),
    endedMarriage('marriage-angharad-gavin', ...TALFRONWYN_PARTNERS.gavin, '1660'),
    endedMarriage('marriage-arthan-bergljot-trachwyll', ...TALFRONWYN_PARTNERS.arthan, '1677'),
    endedMarriage('marriage-alinor-arn-trachwyll', ...TALFRONWYN_PARTNERS.alinor, '1647'),
    endedMarriage('marriage-alawen-leifric-trachwyll', ...TALFRONWYN_PARTNERS.alawen, '1691'),
    endedMarriage('marriage-iesin-dyvynwal-blaidd', ...TALFRONWYN_PARTNERS.dyvynwal, '1650'),
    endedMarriage('marriage-meeghan-bethwyn-gwaedlyd', ...TALFRONWYN_PARTNERS.bethwyn, '1654'),
    endedMarriage('marriage-kyvwlch-jinell-blaidd', ...TALFRONWYN_PARTNERS.jinell, '1674'),
    endedMarriage('marriage-sulwen-griffudd-illygoden', ...TALFRONWYN_PARTNERS.griffudd, '1689'),
    endedMarriage('marriage-armella-mordred-mochdaer', ...TALFRONWYN_PARTNERS.mordred, '1669'),
    endedMarriage('marriage-glesni-dafydd-lyfant', ...TALFRONWYN_PARTNERS.dafydd, '1701'),
    endedMarriage('marriage-conway-nasuada-trachwyll', ...TALFRONWYN_PARTNERS.conway, '1703'),
    endedMarriage('marriage-cadwallen-sioned-walwrs', ...TALFRONWYN_PARTNERS.sioned, '1702'),
    endedMarriage('marriage-taranis-essylt-trachwyll', ...TALFRONWYN_PARTNERS.taranis, '1720'),
    endedMarriage('marriage-godwyn-iseult-trachwyll', ...TALFRONWYN_PARTNERS.godwyn, '1715'),
    endedMarriage('marriage-talfryn-ysabel-trachwyll', ...TALFRONWYN_PARTNERS.talfryn, '1720'),
    endedMarriage('marriage-denawal-dolena', ...TALFRONWYN_PARTNERS.dolena, '1710'),
    endedMarriage('marriage-merlion-alawen-trachwyll', ...TALFRONWYN_PARTNERS.merlion, '1720'),
    endedMarriage('marriage-meredydd-main-lyfant', ...TALFRONWYN_PARTNERS.main, '1720'),
    createMarriage('marriage-kenyon-leikn-trachwyll', ...TALFRONWYN_PARTNERS.kenyon),
    endedMarriage('marriage-charlton-yvaine-trachwyll', ...TALFRONWYN_PARTNERS.charlton, '1720'),
    endedMarriage('marriage-wynfor-delwen', ...TALFRONWYN_PARTNERS.delwen, '1720'),
    createMarriage('marriage-gwastad-falka', ...TALFRONWYN_PARTNERS.falka),
    createMarriage('marriage-guenevere-kane-morthwyll', ...TALFRONWYN_PARTNERS.kane)
  ],
  parentages: [
    ...childrenOf(['breandan-trachwyll', 'sulwen-trachwyll'], TALFRONWYN_PARTNERS.founders, 'marriage-morwenna-gwalchmai', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Breandan und Sulwen.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['macsen-trachwyll', 'ysolde-trachwyll', 'owain-trachwyll'], TALFRONWYN_PARTNERS.breandan, 'marriage-breandan-genofeva-trachwyll', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Eine zweite nicht einzeln überlieferte Generationenfolge verbindet Breandan und Genofeva mit Macsen, Ysolde und Owain.',
      extensions: { timeJumpId: BREANDAN_TIME_JUMP_ID }
    }),
    ...childrenOf(['gavin-trachwyll', 'alinor-trachwyll', 'arthan-trachwyll'], TALFRONWYN_PARTNERS.macsen, 'marriage-edda-macsen-varulv'),
    ...childrenOf(['alawen-trachwyll', 'dyvynwal-trachwyll'], TALFRONWYN_PARTNERS.owain, 'marriage-owain-arnora-trachwyll'),
    ...childrenOf(['bethwyn-trachwyll', 'jinell-trachwyll'], TALFRONWYN_PARTNERS.gavin, 'marriage-angharad-gavin'),
    ...childrenOf(['griffudd-trachwyll', 'mordred-trachwyll'], TALFRONWYN_PARTNERS.arthan, 'marriage-arthan-bergljot-trachwyll'),
    ...childrenOf(['dafydd-trachwyll'], TALFRONWYN_PARTNERS.dyvynwal, 'marriage-iesin-dyvynwal-blaidd'),
    ...childrenOf(['conway-trachwyll', 'sioned-trachwyll'], TALFRONWYN_PARTNERS.bethwyn, 'marriage-meeghan-bethwyn-gwaedlyd'),
    ...childrenOf(['taranis-trachwyll'], TALFRONWYN_PARTNERS.griffudd, 'marriage-sulwen-griffudd-illygoden'),
    ...childrenOf(['carynne-trachwyll'], TALFRONWYN_PARTNERS.mordred, 'marriage-armella-mordred-mochdaer'),
    ...childrenOf(['godwyn-trachwyll'], TALFRONWYN_PARTNERS.dafydd, 'marriage-glesni-dafydd-lyfant'),
    ...childrenOf(['talfryn-trachwyll', 'dolena-trachwyll'], TALFRONWYN_PARTNERS.conway, 'marriage-conway-nasuada-trachwyll'),
    ...childrenOf(['merlion-trachwyll', 'main-trachwyll'], TALFRONWYN_PARTNERS.taranis, 'marriage-taranis-essylt-trachwyll'),
    ...childrenOf(['kenyon-trachwyll'], TALFRONWYN_PARTNERS.godwyn, 'marriage-godwyn-iseult-trachwyll'),
    ...childrenOf(['charlton-trachwyll', 'delwen-trachwyll'], TALFRONWYN_PARTNERS.talfryn, 'marriage-talfryn-ysabel-trachwyll'),
    ...childrenOf(['falka-trachwyll', 'kane-trachwyll'], TALFRONWYN_PARTNERS.merlion, 'marriage-merlion-alawen-trachwyll'),
    ...childrenOf(['madoc-trachwyll', 'nerys-trachwyll'], TALFRONWYN_PARTNERS.charlton, 'marriage-charlton-yvaine-trachwyll'),
    ...childrenOf(['owen-trachwyll', 'tegan-trachwyll'], TALFRONWYN_PARTNERS.kane, 'marriage-guenevere-kane-morthwyll')
  ],
  cadetBranches: [
    marriedAway('married-away-sulwen-trachwyll-blodyn', 'Haus Blodyn', 'marriage-gogyvwlch-sulwen', 'house-blodyn', 'haus-blodyn', HOUSE_EMBLEMS.blodyn),
    marriedAway('married-away-ysolde-trachwyll-drewi', 'Haus Drewi', 'marriage-ysolde-geraint-trachwyll', 'house-drewi', 'haus-drewi'),
    marriedAway('married-away-alinor-trachwyll-vaeren', 'Clan Vaeren', 'marriage-alinor-arn-trachwyll', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-alawen-trachwyll-frostauge', 'Clan Frostauge', 'marriage-alawen-leifric-trachwyll', 'house-frostauge', 'haus-frostauge'),
    marriedAway('married-away-dyvynwal-trachwyll-blaidd', "Haus Blaidd O'Branon", 'marriage-iesin-dyvynwal-blaidd', 'house-blaidd', 'haus-blaidd', HOUSE_EMBLEMS.blaidd),
    marriedAway('married-away-jinell-trachwyll-blaidd', "Haus Blaidd O'Branon", 'marriage-kyvwlch-jinell-blaidd', 'house-blaidd', 'haus-blaidd', HOUSE_EMBLEMS.blaidd),
    marriedAway('married-away-sioned-trachwyll-walwrs', "Haus Walwrs O'Traeth", 'marriage-cadwallen-sioned-walwrs', 'house-walwrs', 'haus-walwrs', HOUSE_EMBLEMS.walwrs),
    marriedAway('married-away-dolena-trachwyll-arth', "Haus Arth O'Talgarth", 'marriage-denawal-dolena', 'house-arth', 'haus-arth', HOUSE_EMBLEMS.arth),
    marriedAway('married-away-main-trachwyll-lyfant', "Haus Lyfant O'Derwyddion", 'marriage-meredydd-main-lyfant', 'house-lyfant', 'haus-lyfant', HOUSE_EMBLEMS.lyfant),
    marriedAway('married-away-delwen-trachwyll-blodyn', 'Haus Blodyn', 'marriage-wynfor-delwen', 'house-blodyn', 'haus-blodyn', HOUSE_EMBLEMS.blodyn),
    marriedAway('married-away-falka-trachwyll-neidr', "Haus Neidr O'Llanvane", 'marriage-gwastad-falka', 'house-neidr', 'haus-neidr', HOUSE_EMBLEMS.neidr),
    createSingleFounderHouseBranch({
      id: 'migration-kenyon-trachwyll-ivarsfels',
      name: 'Haus Trachwyll in Ivarsfels',
      parentPersonId: 'kenyon-trachwyll',
      houseId: IVARSFELS_HOUSE_ID,
      targetFamilyId: 'haus-trachwyll',
      emblem: TRACHWYLL_EMBLEM,
      founded: '1720',
      subtitle: 'Von Kenyon geführte neue Hesirenlinie in Ivarsfels',
      crestFrame: 'silver',
      notes: 'Der Übergang hängt allein und geradlinig unter Kenyon. Leikn bleibt als seine Ehefrau sichtbar; alle vier Kinder und deren Nachkommen werden ausschließlich in der Ivarsfels-Akte fortgeführt.'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-morwenna-gwalchmai',
      parentPersonId: '',
      childIds: ['breandan-trachwyll', 'sulwen-trachwyll'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner direkt unter dem Hauswappen.',
      extensions: {}
    },
    {
      id: BREANDAN_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-breandan-genofeva-trachwyll',
      parentPersonId: '',
      childIds: ['macsen-trachwyll', 'ysolde-trachwyll', 'owain-trachwyll'],
      years: 0,
      fromYear: '????',
      toYear: '1580',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Zweiter absoluter Generationentrenner ausschließlich unter Breandan und Genofeva.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-morwenna-gwalchmai',
    houseId: TALFRONWYN_HOUSE_ID,
    crestSubtitle: 'Vennyrianisches Penron-Haus von Talfronwyn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gwalchmai-trachwyll',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originLine: true,
    successorFamilyId: 'haus-trachwyll',
    sourceRevision: 2,
    sourceModule: 'Haus Trachwyll (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Talfronwyn-Stammbaum wurde ohne Personenfokus übernommen. Zwei Quellenlücken sind strikt serielle Zeitsprünge: zuerst nach dem Gründerwappen, danach ausschließlich unter Breandan und Genofeva. Kenyon bleibt mit Eltern und Ehefrau in Talfronwyn sichtbar und erhält allein den geradlinigen Übergang nach Ivarsfels; seine Kinder stehen ausschließlich in der Zielakte. Die Zweige Talfryns und Merlions verbleiben dagegen vollständig in Vennyr. Alle belegten wegverheirateten Trachwyll-Frauen besitzen direkte Zielhausknoten. Kenyons Geburtsjahr 1720 in der kurzen Oberhauptübersicht widerspricht der ausführlichen Hierarchie und der Generationenfolge; verwendet wird 1676. Rhodhri wird mit der bereits kanonischen Form Rhodri geführt. Die abweichenden Partnerdaten Angharad 1603/1600 und Wynfor 1689/1690 bleiben als Quellenkonflikte vermerkt. Die als veraltet markierten Bilder von Geraint Drewi und Dafydd Trachwyll wurden nicht importiert; Standardsilhouetten wurden ebenfalls nicht als Porträts gespeichert.',
    registryTombstones: {
      persons: ['haus-trachwyll-talfronwyn-gruender', 'haus-trachwyll-talfronwyn-gruenderin'],
      partnerships: ['marriage-haus-trachwyll-talfronwyn-founders']
    },
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings']
  }
});

export const HOUSE_TRACHWYLL_IVARSFELS_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-trachwyll',
    title: 'Haus Trachwyll',
    motto: '',
    description: 'Die seit 1720 von Kenyon Trachwyll geführte Hesirenlinie in Ivarsfels. Nur Kenyon, Leikn, ihre vier Kinder und deren belegte Nachkommen gehören in diese neue Akte.',
    emblem: TRACHWYLL_EMBLEM,
    houseProfile: IVARSHEIM_HOUSE_PROFILES.trachwyll
  },
  houses: [...IVARSFELS_HOUSES],
  persons: [
    ivarsfelsPerson('kenyon-trachwyll', 'Kenyon Trachwyll', 'male', '1676', '', {
      familyRole: 'founder',
      title: 'Begründer der Ivarsfels-Linie · Hesir in Ivarsfels seit 1720'
    }),
    ivarsfelsPerson('leikn-eisenbieger', 'Leikn Eisenbieger', 'female', '1677', '', {
      houseId: 'house-eisenbieger',
      familyRole: 'founder',
      title: 'Gründerin der Ivarsfels-Linie an Kenyons Seite'
    }),

    ivarsfelsPerson('rhodri-trachwyll', 'Rhodri Trachwyll', 'male', '1695', '', {
      lineageRole: 'mainline'
    }),
    ivarsfelsPerson('oddny-silberzunge', 'Oddny Silberzunge', 'female', '1700', '', {
      houseId: 'house-silberzunge'
    }),
    awayWoman(ivarsfelsPerson, 'gwenlyn-trachwyll', 'Gwenlyn Trachwyll', '1702', '', 'Clan Wargh'),
    ivarsfelsPerson('torvar-wargh', 'Torvar Wargh', 'male', '1697', '', {
      houseId: 'house-wargh'
    }),
    awayWoman(ivarsfelsPerson, 'gwendolyn-trachwyll', 'Gwendolyn Trachwyll', '1700', '', 'Clan Skogg'),
    ivarsfelsPerson('skeldar-skogg', 'Skeldar Skogg', 'male', '1695', '', {
      houseId: 'house-skogg'
    }),
    ivarsfelsPerson('gwilym-trachwyll', 'Gwilym Trachwyll', 'male', '1700', '', {
      lineageRole: 'mainline'
    }),
    ivarsfelsPerson('ingrid-grendel', 'Ingrid Grendel', 'female', '1701', '', {
      houseId: 'house-grendel'
    }),

    ivarsfelsPerson('bogus-trachwyll', 'Bogus Trachwyll', 'male', '1718', ''),
    ivarsfelsPerson('wenna-trachwyll', 'Wenna Trachwyll', 'female', '1722', ''),
    ivarsfelsPerson('ivor-trachwyll', 'Ivor Trachwyll', 'male', '1725', ''),
    ivarsfelsPerson('sabrian-trachwyll', 'Sabrian Trachwyll', 'male', '1723', ''),
    ivarsfelsPerson('sabria-trachwyll', 'Sabria Trachwyll', 'female', '1723', '')
  ],
  partnerships: [
    createMarriage('marriage-kenyon-leikn-trachwyll', ...IVARSFELS_PARTNERS.kenyon),
    createMarriage('marriage-oddny-rhodri-silberzunge', ...IVARSFELS_PARTNERS.rhodri),
    createMarriage('marriage-torvar-gwenlyn-wargh', ...IVARSFELS_PARTNERS.gwenlyn),
    createMarriage('marriage-skeldar-gwendolyn-skogg', ...IVARSFELS_PARTNERS.gwendolyn),
    createMarriage('marriage-gwilym-ingrid-trachwyll', ...IVARSFELS_PARTNERS.gwilym)
  ],
  parentages: [
    ...childrenOf(['rhodri-trachwyll', 'gwenlyn-trachwyll', 'gwendolyn-trachwyll', 'gwilym-trachwyll'], IVARSFELS_PARTNERS.kenyon, 'marriage-kenyon-leikn-trachwyll', {
      idPrefix: 'ivarsfels-trachwyll-parentage'
    }),
    ...childrenOf(['bogus-trachwyll', 'wenna-trachwyll', 'ivor-trachwyll'], IVARSFELS_PARTNERS.rhodri, 'marriage-oddny-rhodri-silberzunge', {
      idPrefix: 'ivarsfels-trachwyll-parentage'
    }),
    ...childrenOf(['sabrian-trachwyll', 'sabria-trachwyll'], IVARSFELS_PARTNERS.gwilym, 'marriage-gwilym-ingrid-trachwyll', {
      idPrefix: 'ivarsfels-trachwyll-parentage'
    })
  ],
  cadetBranches: [
    marriedAway('married-away-gwenlyn-trachwyll-wargh', 'Clan Wargh', 'marriage-torvar-gwenlyn-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    marriedAway('married-away-gwendolyn-trachwyll-skogg', 'Clan Skogg', 'marriage-skeldar-gwendolyn-skogg', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg)
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-kenyon-leikn-trachwyll',
    houseId: IVARSFELS_HOUSE_ID,
    crestSubtitle: 'Hesirenhaus von Ivarsfels · seit 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      id: 'origin-trachwyll-talfronwyn',
      houseId: TALFRONWYN_HOUSE_ID,
      name: "Haus Trachwyll O'Talfronwyn",
      subtitle: 'Vennyrianische Herkunftslinie · Übergang nach Ivarsfels 1720',
      emblem: TRACHWYLL_EMBLEM,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['kenyon-trachwyll'],
      targetFamilyId: 'haus-trachwyll-talfronwyn',
      notes: 'Kenyon ist der einzige genealogische Übergangsanker; seine Geschwister- und Cousinenzweige verbleiben vollständig in Talfronwyn.'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'kenyon-trachwyll',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originFamilyId: 'haus-trachwyll-talfronwyn',
    sourceRevision: 2,
    sourceModule: 'Haus Trachwyll (bereitgestellte Altdaten)',
    sourceNote: 'Getrennte Ivarsfels-Akte ab Kenyon und Leikn. Das Hauswappen steht direkt unter dem Gründerpaar; darunter folgen ausschließlich ihre vier Kinder. Rhodri führt mit Oddny Silberzunge drei Kinder fort, Gwilym mit Ingrid Grendel zwei. Gwenlyn und Gwendolyn werden mit direkten Wegverheiratet-Knoten zu Wargh beziehungsweise Skogg geführt; Kinder ihrer auswärtigen Ehen werden nur in den Gegenakten gezeigt. Die alte Schreibform Rhodhri ist zugunsten der bereits registrierten Form Rhodri normalisiert.',
    registryTombstones: {
      persons: ['haus-trachwyll-gruender', 'haus-trachwyll-gruenderin'],
      partnerships: ['marriage-haus-trachwyll-founders']
    },
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings']
  }
});

export const HOUSE_TRACHWYLL_FAMILIES = Object.freeze([
  HOUSE_TRACHWYLL_TALFRONWYN_FAMILY,
  HOUSE_TRACHWYLL_IVARSFELS_FAMILY
]);
