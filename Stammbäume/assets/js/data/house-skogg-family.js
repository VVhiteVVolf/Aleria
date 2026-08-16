import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_SKOGG_PORTRAITS } from './house-skogg-portraits.js';
import {
  IVARSHEIM_HOUSE_EMBLEMS,
  IVARSHEIM_HOUSE_PROFILES
} from './ivarsheim-house-profiles.js';
import { KLAUENINSEL_HOUSE_EMBLEMS } from './klaueninseln-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';

const SKOGG_HOUSE_ID = 'house-skogg';
const FOUNDER_TIME_JUMP_ID = 'gap-heimdall-to-edmund-skogg';

const HOUSE_EMBLEMS = Object.freeze({
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  silberzunge: IVARSHEIM_HOUSE_EMBLEMS.silberzunge,
  hyrmgardr: IVARSHEIM_HOUSE_EMBLEMS.hyrmgardr,
  blutklinge: IVARSHEIM_HOUSE_EMBLEMS.blutklinge,
  windhueter: IVARSHEIM_HOUSE_EMBLEMS.windhueter,
  borach: IVARSHEIM_HOUSE_EMBLEMS['an-borach'],
  trachwyll: IVARSHEIM_HOUSE_EMBLEMS.trachwyll,
  grendel: IVARSHEIM_HOUSE_EMBLEMS.grendel,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil,
  morthwyll: KLAUENINSEL_HOUSE_EMBLEMS.morthwyll
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
  'heimdall-skogg',
  'edmund-skogg',
  'hellbrand-skogg',
  'sigvaldr-skogg',
  'kjallak-skogg'
]);

const MAINLINE_IDS = new Set([
  'kolstein-skogg',
  'stigandr-skogg',
  'starkad-skogg',
  'sveinar-skogg'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SKOGG_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SKOGG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SKOGG_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-skogg--${id}`),
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

function affairPartner(id, name, sex, birth, death = '', options = {}) {
  return spouse(id, name, sex, birth, death, options.houseId || '', {
    ...options,
    familyRole: 'affair',
    title: options.title || 'Affäre',
    tags: [...(options.tags || []), 'Affäre']
  });
}

function ward(id, name, sex, birth, houseId, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    houseId,
    familyRole: 'ward',
    lineageRole: 'branch',
    title: options.title || 'Aufgenommenes Mündel',
    tags: [...(options.tags || []), 'Mündel', 'Aufgenommen']
  });
}

function bastard(id, name, sex, birth, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    familyRole: 'bastard',
    title: options.title || 'Bastard des Clans Skogg',
    tags: [...(options.tags || []), 'Bastard']
  });
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

const COUPLES = Object.freeze({
  founders: ['heimdall-skogg', 'uathach-borach'],
  edmund: ['edmund-skogg', 'glodis-silberzunge'],
  solveig: ['solveig-1565-skogg', 'garkon-blutklinge'],
  kolstein: ['kolstein-skogg', 'hati-windhueter'],
  eyrun: ['harald-wargh', 'eyrun-skogg'],
  hellbrand: ['hellbrand-skogg', 'solveig-skogg-spouse'],
  hellbrandAffair: ['hellbrand-skogg', 'astrid-skogg-affair'],
  sunniva: ['sunniva-skogg', 'yrthinn-hyrmgardr'],
  sigurd: ['sigurd-skogg', 'finngunn-skjegg'],
  stigandr: ['stigandr-skogg', 'gudrun-schattenherz'],
  skadi: ['skadi-skogg', 'thorfinn-grendel'],
  dagrun: ['dagrun-skogg', 'gleipnir-graumahne'],
  ubbe: ['ubbe-skogg', 'gundel-skogg-spouse'],
  sigvaldr: ['sigvaldr-skogg', 'magnhild-hyrmgardr'],
  svanlaug: ['fjornir-feuerhaar', 'svanlaug-skogg'],
  gudrun: ['sigvard-skaal', 'gudrun-skogg'],
  skirnir: ['skirnir-skogg', 'reginleif-hrafn'],
  kjallak: ['kjallak-skogg', 'eldkatla-silberzunge'],
  siglif: ['siglif-skogg', 'inghtor-varangr'],
  eldridd: ['jormund-schwarzdorn', 'eldridd-skogg'],
  skule: ['freydis-freiwinter', 'skule-skogg'],
  sten: ['sten-skogg', 'siriol-morfil'],
  sverker: ['sverker-skogg', 'saoirse-midgna'],
  starkad: ['starkad-skogg', 'sigrid-grendel'],
  freygunn: ['thorgil-wargh', 'freygunn-skogg'],
  bodvild: ['skirnir-varulv', 'bodvild-skogg'],
  skeldar: ['skeldar-skogg', 'gwendolyn-trachwyll'],
  skeldarAffair: ['skeldar-skogg', 'laufey-skogg-affair'],
  ursula: ['kynwrig-morthwyll', 'ursula-skogg'],
  stenulf: ['stenulf-skogg', 'fenkatla-feuerherz'],
  sigrod: ['sigrod-skogg', 'eldkatla-kaltherz'],
  sigrodAffair: ['sigrod-skogg', 'embla-skogg-affair']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-heimdall-uathach-skogg': COUPLES.founders,
  'marriage-edmund-glodis-skogg': COUPLES.edmund,
  'marriage-solveig-garkon-skogg': COUPLES.solveig,
  'marriage-kolstein-hati-skogg': COUPLES.kolstein,
  'marriage-harald-eyrun-wargh': COUPLES.eyrun,
  'marriage-hellbrand-solveig-skogg': COUPLES.hellbrand,
  'affair-hellbrand-astrid-skogg': COUPLES.hellbrandAffair,
  'marriage-sunniva-yrthinn-skogg': COUPLES.sunniva,
  'marriage-sigurd-finngunn-skogg': COUPLES.sigurd,
  'marriage-stigandr-gudrun-skogg': COUPLES.stigandr,
  'marriage-skadi-thorfinn-skogg': COUPLES.skadi,
  'marriage-dagrun-gleipnir-skogg': COUPLES.dagrun,
  'marriage-ubbe-gundel-skogg': COUPLES.ubbe,
  'marriage-sigvaldr-magnhild-skogg': COUPLES.sigvaldr,
  'marriage-fjornir-svanlaug-feuerhaar': COUPLES.svanlaug,
  'marriage-sigvard-gudrun-skaal': COUPLES.gudrun,
  'marriage-skirnir-reginleif-skogg': COUPLES.skirnir,
  'marriage-kjallak-eldkatla-skogg': COUPLES.kjallak,
  'marriage-siglif-inghtor-skogg': COUPLES.siglif,
  'marriage-jormund-eldridd-schwarzdorn': COUPLES.eldridd,
  'marriage-freydis-skule-freiwinter': COUPLES.skule,
  'marriage-sten-siriol-morfil': COUPLES.sten,
  'marriage-sverker-saoirse-skogg': COUPLES.sverker,
  'marriage-starkad-sigrid-skogg': COUPLES.starkad,
  'marriage-thorgil-freygunn-wargh': COUPLES.freygunn,
  'marriage-skirnir-bodvild-varulv': COUPLES.bodvild,
  'marriage-skeldar-gwendolyn-skogg': COUPLES.skeldar,
  'affair-skeldar-laufey-skogg': COUPLES.skeldarAffair,
  'marriage-kynwrig-ursula-morthwyll': COUPLES.ursula,
  'marriage-stenulf-fenkatla-skogg': COUPLES.stenulf,
  'marriage-sigrod-eldkatla-skogg': COUPLES.sigrod,
  'affair-sigrod-embla-skogg': COUPLES.sigrodAffair
});

function marriage(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function endedMarriage(partnershipId, end = '') {
  return marriage(partnershipId, { status: 'ended', end });
}

function alignedAffair(partnershipId, partnerPersonId) {
  const partnership = marriage(partnershipId, {
    type: 'affair',
    visibility: 'private'
  });
  return {
    ...partnership,
    extensions: {
      ...partnership.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId,
      registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId']
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'skogg-parentage',
    ...options
  });
}

function fosterChildren(childIds, guardianId, notes) {
  return createParentages(childIds, [guardianId], '', {
    idPrefix: 'skogg-foster-parentage',
    type: 'foster',
    legitimacy: 'unknown',
    notes
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
      registryManagedFields: [
        'name',
        'parentPartnershipId',
        'houseId',
        'targetFamilyId',
        'emblem',
        'subtitle'
      ]
    }
  });
}

export const HOUSE_SKOGG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-skogg',
    title: 'Clan Skogg',
    motto: '',
    description: 'Thanenclan von Saatgrund mit Sitz in Kornweiler. Heimdall, ein von Cíaran Tir An Bórach ausgebildeter Nordmann, begründete den Clan gemeinsam mit Uathach Bórach.',
    emblem: HOUSE_EMBLEMS.skogg,
    houseProfile: IVARSHEIM_HOUSE_PROFILES.skogg
  },
  houses: [
    house(SKOGG_HOUSE_ID, 'Clan Skogg', HOUSE_EMBLEMS.skogg),
    house('house-an-borach', 'Haus An Bórach', HOUSE_EMBLEMS.borach),
    house('house-silberzunge', 'Clan Silberzunge', HOUSE_EMBLEMS.silberzunge),
    house('house-blutklinge', 'Haus Blutklinge', HOUSE_EMBLEMS.blutklinge),
    house('house-windhueter', 'Haus Windhüter', HOUSE_EMBLEMS.windhueter),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-hyrmgardr', 'Clan Hyrmgarthr', HOUSE_EMBLEMS.hyrmgardr),
    house('house-skjegg', 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-grendel', 'Clan Grendel', HOUSE_EMBLEMS.grendel),
    house('house-graumahne', 'Clan Graumähne'),
    house('house-schattenherz', 'Clan Schattenherz'),
    house('house-feuerhaar', 'Clan Feuerhaar', IVARSHEIM_HOUSE_EMBLEMS.feuerhaar),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-hrafn', 'Clan Hrafn'),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-morfil', "Haus Morfil O'Talsarn", HOUSE_EMBLEMS.morfil),
    house('house-midgna', 'Clan Midgna'),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-eisenbieger', 'Clan Eisenbieger'),
    house('house-trachwyll', 'Haus Trachwyll', HOUSE_EMBLEMS.trachwyll),
    house('house-morthwyll', "Haus Morthwyll O'Caer Morben", HOUSE_EMBLEMS.morthwyll),
    house('house-feuerherz', 'Clan Feuerherz'),
    house('house-kaltherz', 'Clan Kaltherz'),
    house('house-silberblut', 'Clan Silberblut')
  ],
  persons: [
    person('heimdall-skogg', 'Heimdall Skogg', 'male', '????', '????', {
      title: 'Gründer und erster Thane des Clans Skogg',
      notes: 'Einstiger Nordmann und Schüler Cíarans Tir An Bórach; begründete mit Uathach Bórach die Skogg-Linie.'
    }),
    spouse('uathach-borach', 'Uathach Bórach', 'female', '????', '????', 'house-an-borach', {
      title: 'Mitgründerin des Clans Skogg'
    }),

    person('edmund-skogg', 'Edmund Skogg', 'male', '1561', '1659', {
      title: 'Thane des Clans Skogg'
    }),
    awayWoman('solveig-1565-skogg', 'Solveig Skogg', '1565', '1627', 'Haus Blutklinge'),
    spouse('glodis-silberzunge', 'Glódís Silberzunge', 'female', '1564', '1630', 'house-silberzunge'),
    spouse('garkon-blutklinge', 'Garkon Blutklinge', 'male', '1560', '1720', 'house-blutklinge'),

    person('kolstein-skogg', 'Kolstein Skogg', 'male', '1582', '1629'),
    awayWoman('eyrun-skogg', 'Eyrún Skogg', '1587', '1605', 'Clan Wargh'),
    spouse('hati-windhueter', 'Hati Windhüter', 'female', '1583', '1629', 'house-windhueter'),
    spouse('harald-wargh', 'Harald Wargh', 'male', '1586', '1627', 'house-wargh', {
      title: 'Jarl des Clans Wargh'
    }),

    person('hellbrand-skogg', 'Hellbrand Skogg', 'male', '1599', '1675', {
      title: 'Thane des Clans Skogg'
    }),
    awayWoman('sunniva-skogg', 'Sunniva Skogg', '1603', '1681', 'Clan Hyrmgarthr'),
    person('sigurd-skogg', 'Sigurd Skogg', 'male', '1600', '1671'),
    spouse('solveig-skogg-spouse', 'Solveig', 'female', '1610', '1700'),
    affairPartner('astrid-skogg-affair', 'Astrid', 'female', '1644', '1675', {
      title: 'Affäre Hellbrands · Mutter Tryggvars'
    }),
    spouse('yrthinn-hyrmgardr', 'Yrthinn Hyrmgarthr', 'male', '1599', '1692', 'house-hyrmgardr'),
    spouse('finngunn-skjegg', 'Finngunn Skjegg', 'female', '1604', '1688', 'house-skjegg'),

    person('stigandr-skogg', 'Stigandr Skogg', 'male', '1629', '1675'),
    awayWoman('skadi-skogg', 'Skadi Skogg', '1633', '1698', 'Clan Grendel'),
    bastard('tryggvar-skogg', 'Tryggvar Skogg', 'male', '1664', { death: '1720', title: 'Bastardsohn Hellbrands und Astrids' }),
    awayWoman('dagrun-skogg', 'Dagrún Skogg', '1622', '1691', 'Clan Graumähne'),
    person('ubbe-skogg', 'Ubbe Skogg', 'male', '1624', '1699'),
    spouse('gudrun-schattenherz', 'Gudrun Schattenherz', 'female', '1630', '1699', 'house-schattenherz'),
    spouse('thorfinn-grendel', 'Thorfinn Grendel', 'male', '1634', '1679', 'house-grendel'),
    spouse('gleipnir-graumahne', 'Gleipnir Graumähne', 'male', '1618', '1700', 'house-graumahne'),
    spouse('gundel-skogg-spouse', 'Gundel', 'female', '1629', '1674'),

    person('sigvaldr-skogg', 'Sigvaldr Skogg', 'male', '1648', '1723', {
      title: 'Thane des Clans Skogg'
    }),
    awayWoman('svanlaug-skogg', 'Svanlaug Skogg', '1650', '1711', 'Clan Feuerhaar'),
    awayWoman('gudrun-skogg', 'Gudrun Skogg', '1651', '1725', 'Clan Skaal'),
    person('skirnir-skogg', 'Skirnir Skogg', 'male', '1653', '1720'),
    spouse('magnhild-hyrmgardr', 'Magnhild Hyrmgarthr', 'female', '1650', '1738', 'house-hyrmgardr'),
    spouse('fjornir-feuerhaar', 'Fjornir Feuerhaar', 'male', '1648', '1702', 'house-feuerhaar', {
      title: 'Thane des Clans Feuerhaar'
    }),
    spouse('sigvard-skaal', 'Sigvard Skaal', 'male', '1648', '1719', 'house-skaal'),
    spouse('reginleif-hrafn', 'Reginleif Hrafn', 'female', '1652', '1711', 'house-hrafn'),

    person('kjallak-skogg', 'Kjallak Skogg', 'male', '1669', '', {
      title: 'Thane des Clans Skogg seit 1723'
    }),
    awayWoman('siglif-skogg', 'Siglíf Skogg', '1674', '', 'Clan Varangr'),
    awayWoman('eldridd-skogg', 'Eldridd Skogg', '1669', '1734', 'Clan Schwarzdorn'),
    person('skule-skogg', 'Skule Skogg', 'male', '1672', ''),
    person('sten-skogg', 'Sten Skogg', 'male', '1670', ''),
    person('sverker-skogg', 'Sverker Skogg', 'male', '1675', ''),
    spouse('eldkatla-silberzunge', 'Eldkatla Silberzunge', 'female', '1675', '', 'house-silberzunge'),
    spouse('inghtor-varangr', 'Inghtor Varangr', 'male', '1672', '1720', 'house-varangr'),
    spouse('jormund-schwarzdorn', 'Jormund Schwarzdorn', 'male', '1667', '1720', 'house-schwarzdorn', {
      title: 'Hesir des Clans Schwarzdorn'
    }),
    spouse('freydis-freiwinter', 'Freydis Freiwinter', 'female', '1673', '', 'house-freiwinter'),
    spouse('siriol-morfil', 'Siriol Morfil', 'female', '1674', '1735', 'house-morfil'),
    spouse('saoirse-midgna', 'Saoirse Midgna', 'female', '1679', '', 'house-midgna'),

    person('starkad-skogg', 'Starkad Skogg', 'male', '1695', '', {
      title: 'Erster Erbe des Clans Skogg'
    }),
    awayWoman('freygunn-skogg', 'Freygunn Skogg', '1699', '', 'Clan Wargh'),
    awayWoman('bodvild-skogg', 'Bodvild Skogg', '1700', '', 'Clan Varulv'),
    person('skeldar-skogg', 'Skeldar Skogg', 'male', '1695', ''),
    awayWoman('ursula-skogg', 'Ursula Skogg', '1699', '', "Haus Morthwyll O'Caer Morben"),
    person('stenulf-skogg', 'Stenulf Skogg', 'male', '1693', ''),
    person('sigrod-skogg', 'Sigrod Skogg', 'male', '1699', ''),
    spouse('sigrid-grendel', 'Sigrid Grendel', 'female', '1699', '', 'house-grendel'),
    spouse('thorgil-wargh', 'Thorgil Wargh', 'male', '1695', '', 'house-wargh'),
    spouse('skirnir-varulv', 'Skirnir Varulv', 'male', '1700', '', 'house-varulv'),
    spouse('gwendolyn-trachwyll', 'Gwendolyn Trachwyll', 'female', '1700', '', 'house-trachwyll'),
    affairPartner('laufey-skogg-affair', 'Laufey', 'female', '1705', '', {
      title: 'Affäre Skeldars · Mutter Kjallaks'
    }),
    spouse('kynwrig-morthwyll', 'Kynwrig Morthwyll', 'male', '1700', '', 'house-morthwyll'),
    spouse('fenkatla-feuerherz', 'Fenkatla Feuerherz', 'female', '1697', '', 'house-feuerherz'),
    spouse('eldkatla-kaltherz', 'Eldkatla Kaltherz', 'female', '1700', '', 'house-kaltherz'),
    affairPartner('embla-skogg-affair', 'Embla', 'female', '1709', '', {
      title: 'Affäre Sigrods · Mutter Glumrs'
    }),

    person('sveinar-skogg', 'Sveinar Skogg', 'male', '1718', '', { title: 'Zweiter Erbe des Clans Skogg' }),
    person('sigmona-skogg', 'Sigmóna Skogg', 'female', '1723', ''),
    person('svantje-skogg', 'Svantje Skogg', 'female', '1725', ''),
    ward('leiknir-silberzunge', 'Leiknir Silberzunge', 'male', '1729', 'house-silberzunge', {
      title: 'Aufgenommenes Mündel des Clans Skogg',
      notes: 'Die Silberzungen-Quelle zeigt Leiknir im dunkelblauen Mündelrahmen mit dem Wappen des Clans Skogg; ein persönlicher Vormund wird dort nicht genannt.'
    }),
    ward('erik-ragnulf', 'Erik Ragnulf', 'male', '1723', 'house-ragnulf', {
      title: 'Aufgenommenes Mündel Starkad Skoggs'
    }),
    ward('ingulf-varangr', 'Ingulf Varangr', 'male', '1726', 'house-varangr', {
      title: 'Aufgenommenes Mündel Starkad Skoggs'
    }),
    person('svanleif-skogg', 'Svanleif Skogg', 'male', '1720', ''),
    person('sifkar-skogg', 'Sifkar Skogg', 'male', '1723', ''),
    person('sverri-skogg', 'Sverri Skogg', 'male', '1725', ''),
    ward('svart-eisenbieger', 'Svart Eisenbieger', 'male', '1724', 'house-eisenbieger', {
      title: 'Aufgenommenes Mündel Skeldar Skoggs'
    }),
    bastard('kjallak-1728-skogg', 'Kjallak Skogg', 'male', '1728', {
      title: 'Bastardsohn Skeldars und Laufeys'
    }),
    person('sorli-skogg', 'Sörli Skogg', 'male', '1719', ''),
    person('siglaug-skogg', 'Siglaug Skogg', 'female', '1727', ''),
    ward('jurgen-silberblut', 'Jurgen Silberblut', 'male', '1727', 'house-silberblut', {
      title: 'Aufgenommenes Mündel Stenulf Skoggs'
    }),
    person('skarpi-skogg', 'Skarpi Skogg', 'male', '1726', ''),
    bastard('glumr-skogg', 'Glumr Skogg', 'male', '1733', {
      title: 'Bastardsohn Sigrods und Emblas'
    })
  ],
  partnerships: [
    endedMarriage('marriage-heimdall-uathach-skogg'),
    endedMarriage('marriage-edmund-glodis-skogg', '1630'),
    endedMarriage('marriage-solveig-garkon-skogg', '1627'),
    endedMarriage('marriage-kolstein-hati-skogg', '1629'),
    endedMarriage('marriage-harald-eyrun-wargh', '1605'),
    endedMarriage('marriage-hellbrand-solveig-skogg', '1675'),
    alignedAffair('affair-hellbrand-astrid-skogg', 'astrid-skogg-affair'),
    endedMarriage('marriage-sunniva-yrthinn-skogg', '1681'),
    endedMarriage('marriage-sigurd-finngunn-skogg', '1671'),
    endedMarriage('marriage-stigandr-gudrun-skogg', '1675'),
    endedMarriage('marriage-skadi-thorfinn-skogg', '1679'),
    endedMarriage('marriage-dagrun-gleipnir-skogg', '1691'),
    endedMarriage('marriage-ubbe-gundel-skogg', '1674'),
    endedMarriage('marriage-sigvaldr-magnhild-skogg', '1723'),
    endedMarriage('marriage-fjornir-svanlaug-feuerhaar', '1702'),
    endedMarriage('marriage-sigvard-gudrun-skaal', '1719'),
    endedMarriage('marriage-skirnir-reginleif-skogg', '1711'),
    marriage('marriage-kjallak-eldkatla-skogg'),
    endedMarriage('marriage-siglif-inghtor-skogg', '1720'),
    endedMarriage('marriage-jormund-eldridd-schwarzdorn', '1720'),
    marriage('marriage-freydis-skule-freiwinter'),
    endedMarriage('marriage-sten-siriol-morfil', '1735'),
    marriage('marriage-sverker-saoirse-skogg'),
    marriage('marriage-starkad-sigrid-skogg'),
    marriage('marriage-thorgil-freygunn-wargh'),
    marriage('marriage-skirnir-bodvild-varulv'),
    marriage('marriage-skeldar-gwendolyn-skogg'),
    alignedAffair('affair-skeldar-laufey-skogg', 'laufey-skogg-affair'),
    marriage('marriage-kynwrig-ursula-morthwyll'),
    marriage('marriage-stenulf-fenkatla-skogg'),
    marriage('marriage-sigrod-eldkatla-skogg'),
    alignedAffair('affair-sigrod-embla-skogg', 'embla-skogg-affair')
  ],
  parentages: [
    ...childrenOf(['edmund-skogg', 'solveig-1565-skogg'], 'marriage-heimdall-uathach-skogg', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Edmund und Solveig.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['kolstein-skogg', 'eyrun-skogg'], 'marriage-edmund-glodis-skogg'),
    ...childrenOf(['hellbrand-skogg', 'sunniva-skogg', 'sigurd-skogg'], 'marriage-kolstein-hati-skogg'),
    ...childrenOf(['stigandr-skogg', 'skadi-skogg'], 'marriage-hellbrand-solveig-skogg'),
    ...childrenOf(['tryggvar-skogg'], 'affair-hellbrand-astrid-skogg', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Tryggvar entstammt ausschließlich Hellbrands Affäre mit Astrid.'
    }),
    ...childrenOf(['dagrun-skogg', 'ubbe-skogg'], 'marriage-sigurd-finngunn-skogg'),
    ...childrenOf(['sigvaldr-skogg', 'svanlaug-skogg'], 'marriage-stigandr-gudrun-skogg'),
    ...childrenOf(['gudrun-skogg', 'skirnir-skogg'], 'marriage-ubbe-gundel-skogg'),
    ...childrenOf(['kjallak-skogg', 'siglif-skogg', 'eldridd-skogg', 'skule-skogg'], 'marriage-sigvaldr-magnhild-skogg'),
    ...childrenOf(['sten-skogg', 'sverker-skogg'], 'marriage-skirnir-reginleif-skogg'),
    ...childrenOf(['starkad-skogg', 'freygunn-skogg', 'bodvild-skogg'], 'marriage-kjallak-eldkatla-skogg'),
    ...childrenOf(['skeldar-skogg', 'ursula-skogg'], 'marriage-freydis-skule-freiwinter'),
    ...childrenOf(['stenulf-skogg'], 'marriage-sten-siriol-morfil'),
    ...childrenOf(['sigrod-skogg'], 'marriage-sverker-saoirse-skogg'),
    ...childrenOf(['sveinar-skogg', 'sigmona-skogg', 'svantje-skogg'], 'marriage-starkad-sigrid-skogg'),
    ...fosterChildren(['leiknir-silberzunge'], 'kjallak-skogg', 'Leiknir Silberzunge ist ein aufgenommenes Mündel des Clans Skogg. Da die Quelle keinen persönlichen Vormund nennt, wird die Clanobhut am amtierenden Thane Kjallak verankert.'),
    ...fosterChildren(['erik-ragnulf', 'ingulf-varangr'], 'starkad-skogg', 'Erik Ragnulf und Ingulf Varangr sind Starkads aufgenommene Mündel, nicht seine leiblichen Kinder.'),
    ...childrenOf(['svanleif-skogg', 'sifkar-skogg', 'sverri-skogg'], 'marriage-skeldar-gwendolyn-skogg'),
    ...childrenOf(['kjallak-1728-skogg'], 'affair-skeldar-laufey-skogg', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Kjallak entstammt ausschließlich Skeldars Affäre mit Laufey.'
    }),
    ...fosterChildren(['svart-eisenbieger'], 'skeldar-skogg', 'Svart Eisenbieger ist Skeldars aufgenommenes Mündel und kein leiblicher Skogg-Spross.'),
    ...childrenOf(['sorli-skogg', 'siglaug-skogg'], 'marriage-stenulf-fenkatla-skogg'),
    ...fosterChildren(['jurgen-silberblut'], 'stenulf-skogg', 'Jurgen Silberblut ist Stenulfs aufgenommenes Mündel und kein leiblicher Skogg-Spross.'),
    ...childrenOf(['skarpi-skogg'], 'marriage-sigrod-eldkatla-skogg'),
    ...childrenOf(['glumr-skogg'], 'affair-sigrod-embla-skogg', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Glumr entstammt ausschließlich Sigrods Affäre mit Embla.'
    })
  ],
  cadetBranches: [
    marriedAway('married-away-solveig-skogg-blutklinge', 'Haus Blutklinge', 'marriage-solveig-garkon-skogg', 'house-blutklinge', 'haus-blutklinge', HOUSE_EMBLEMS.blutklinge),
    marriedAway('married-away-eyrun-skogg-wargh', 'Clan Wargh', 'marriage-harald-eyrun-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    marriedAway('married-away-sunniva-skogg-hyrmgardr', 'Clan Hyrmgarthr', 'marriage-sunniva-yrthinn-skogg', 'house-hyrmgardr', 'haus-hyrmgardr', HOUSE_EMBLEMS.hyrmgardr),
    marriedAway('married-away-skadi-skogg-grendel', 'Clan Grendel', 'marriage-skadi-thorfinn-skogg', 'house-grendel', 'haus-grendel', HOUSE_EMBLEMS.grendel),
    marriedAway('married-away-dagrun-skogg-graumahne', 'Clan Graumähne', 'marriage-dagrun-gleipnir-skogg', 'house-graumahne', 'haus-graumahne'),
    marriedAway('married-away-svanlaug-skogg-feuerhaar', 'Clan Feuerhaar', 'marriage-fjornir-svanlaug-feuerhaar', 'house-feuerhaar', 'haus-feuerhaar', IVARSHEIM_HOUSE_EMBLEMS.feuerhaar),
    marriedAway('married-away-gudrun-skogg-skaal', 'Clan Skaal', 'marriage-sigvard-gudrun-skaal', 'house-skaal', 'haus-skaal', HOUSE_EMBLEMS.skaal),
    marriedAway('married-away-siglif-skogg-varangr', 'Clan Varangr', 'marriage-siglif-inghtor-skogg', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-eldridd-skogg-schwarzdorn', 'Clan Schwarzdorn', 'marriage-jormund-eldridd-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-freygunn-skogg-wargh', 'Clan Wargh', 'marriage-thorgil-freygunn-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    marriedAway('married-away-bodvild-skogg-varulv', 'Clan Varulv', 'marriage-skirnir-bodvild-varulv', 'house-varulv', 'haus-varulv'),
    marriedAway('married-away-ursula-skogg-morthwyll', "Haus Morthwyll O'Caer Morben", 'marriage-kynwrig-ursula-morthwyll', 'house-morthwyll', 'haus-morthwyll', HOUSE_EMBLEMS.morthwyll)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-heimdall-uathach-skogg',
      parentPersonId: '',
      childIds: ['edmund-skogg', 'solveig-1565-skogg'],
      years: 0,
      fromYear: '????',
      toYear: '1561',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner unter dem Gründerwappen.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-heimdall-uathach-skogg',
    houseId: SKOGG_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Saatgrund · Sitz Kornweiler',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'heimdall-skogg',
    orientation: 'vertical',
    ancestorDepth: 32,
    descendantDepth: 32,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 4,
    sourceModule: 'Clan Skogg (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Stammbaum wurde ohne Personenfokus übernommen. Heimdall Skogg und Uathach Bórach stehen vor dem goldenen Clanwappen; genau ein serieller Zeitsprung führt danach zu Edmund und Solveig. Die Stammtafel nennt den frühen Clanchef Edmund, während der Fließtext einmal Emund schreibt; wegen der eindeutigen Personentafel wird Edmund verwendet. Die Quelle schreibt bei Thorfinn und Sigrid „Grindel“; gemäß der bereits festgelegten Registerkorrektur wird der Clanname als Grendel normalisiert. Hellbrands Sohn Tryggvar, Skeldars Sohn Kjallak und Sigrods Sohn Glumr sind ausschließlich ihren jeweiligen Affären zugeordnet. Leiknir Silberzunge wird in der Silberzungen-Quelle als an Clan Skogg vermitteltes Mündel gezeigt; mangels benannten persönlichen Vormunds ist seine Clanobhut am amtierenden Thane Kjallak verankert. Erik Ragnulf, Ingulf Varangr, Svart Eisenbieger und Jurgen Silberblut sind ebenfalls aufgenommene Mündel und keine biologischen Skogg-Kinder. Rafn Feuerhaar gehört ausdrücklich nicht zum Clan Skogg und wird migrationsfest vollständig aus dieser Akte entfernt. Frauen mit belegter Ehe in eine andere Linie erhalten direkte Wegverheiratet-Knoten; Nachkommen dieser Ehen werden ausschließlich in der fortführenden Gegenakte gezeigt. Standardsilhouetten wurden nicht als individuelle Porträts gespeichert.',
    registryTombstones: {
      persons: ['haus-skogg-gruender', 'haus-skogg-gruenderin', 'rafn-feuerhaar'],
      partnerships: ['marriage-haus-skogg-founders'],
      parentages: ['skogg-foster-parentage-rafn-feuerhaar']
    },
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
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
    registryManagedRecordFields: ['folderPath'],
    registryManagedLineageFields: ['founderPartnershipId'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
