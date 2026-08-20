import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import { HOUSE_FEUERHAAR_PORTRAITS } from './house-feuerhaar-portraits.js';
import {
  IVARSHEIM_HOUSE_EMBLEMS,
  IVARSHEIM_HOUSE_PROFILES
} from './ivarsheim-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { TAL_DER_MILANE_HOUSE_EMBLEMS } from './tal-der-milane-house-profiles.js';

const FEUERHAAR_HOUSE_ID = 'house-feuerhaar';
const FOUNDER_TIME_JUMP_ID = 'gap-robyn-to-thorsleikr-feuerhaar';

const HOUSE_EMBLEMS = Object.freeze({
  feuerhaar: IVARSHEIM_HOUSE_EMBLEMS.feuerhaar,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  silberzunge: IVARSHEIM_HOUSE_EMBLEMS.silberzunge,
  grendel: IVARSHEIM_HOUSE_EMBLEMS.grendel,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  aderyn: TAL_DER_MILANE_HOUSE_EMBLEMS.aderyn,
  hebog: TAL_DER_MILANE_HOUSE_EMBLEMS.hebog,
  mwyalchen: TAL_DER_MILANE_HOUSE_EMBLEMS.mwyalchen,
  tylluan: TAL_DER_MILANE_HOUSE_EMBLEMS.tylluan,
  eryr: TAL_DER_MILANE_HOUSE_EMBLEMS.eryr
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
  'robyn-pengoch',
  'thorsleikr-feuerhaar',
  'skjoldulf-feuerhaar',
  'ketill-feuerhaar',
  'odin-feuerhaar',
  'fjornir-feuerhaar',
  'sigbjorn-feuerhaar',
  'gunnar-feuerhaar',
  'ingvar-feuerhaar'
]);

const MAINLINE_IDS = new Set(['armod-feuerhaar', 'bjart-feuerhaar', 'rafn-feuerhaar']);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? FEUERHAAR_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_FEUERHAAR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === FEUERHAAR_HOUSE_ID ? 'core' : 'married'),
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
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-feuerhaar--${id}`),
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

function affairPartner(id, name, sex, birth, options = {}) {
  return spouse(id, name, sex, birth, options.death || '', options.houseId || '', {
    ...options,
    familyRole: 'affair',
    title: options.title || 'Affäre',
    tags: [...(options.tags || []), 'Affäre']
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
  founders: ['robyn-pengoch', 'ermingard-feuerhaar-founder'],
  thorsleikr: ['geirlaug-wargh', 'thorsleikr-feuerhaar'],
  lysveig: ['lysveig-feuerhaar', 'sigtrygg-arnvild'],
  skjoldulf: ['ormrun-feuerhaar-spouse', 'skjoldulf-feuerhaar'],
  lyngvild: ['lyngvild-feuerhaar', 'vikar-silberblut'],
  ketill: ['ketill-feuerhaar', 'unndis-feuerhaar-spouse'],
  ranveig: ['iormund-schwarzdorn', 'ranveig-feuerhaar'],
  geirny: ['skjalg-sterkr', 'geirny-feuerhaar'],
  odin: ['odin-feuerhaar', 'heledd-aderyn'],
  ingeborg: ['mordred-hebog', 'ingeborg-feuerhaar'],
  ingrid: ['cieran-mwyalchen', 'ingrid-feuerhaar'],
  fjornir: ['fjornir-feuerhaar', 'svanlaug-skogg'],
  malfrid: ['torstein-wargh', 'malfrid-feuerhaar'],
  frida: ['sigurd-freiwinter', 'frida-feuerhaar'],
  gunnar: ['gunnar-feuerhaar', 'ulrikka-skaal'],
  skulla: ['kolskegg-silberzunge', 'skulla-feuerhaar'],
  ingvar: ['ingvar-feuerhaar', 'wynthonya-tylluan'],
  frigga: ['vigmar-schwarzdorn', 'frigga-feuerhaar'],
  sigbjorn: ['herdis-feuerhaar-spouse', 'sigbjorn-feuerhaar'],
  sigbjornAffair: ['sigbjorn-feuerhaar', 'saeba-feuerhaar-affair'],
  armod: ['armod-feuerhaar', 'asta-kummerherz'],
  fenya: ['erik-grendel', 'fenya-feuerhaar'],
  aksel: ['aksel-feuerhaar', 'meriel-eryr'],
  lodinn: ['gunnora-feuerhaar-spouse', 'lodinn-feuerhaar']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-robyn-ermingard-feuerhaar': COUPLES.founders,
  'marriage-geirlaug-thorsleikr-wargh': COUPLES.thorsleikr,
  'marriage-lysveig-sigtrygg-feuerhaar': COUPLES.lysveig,
  'marriage-skjoldulf-ormrun-feuerhaar': COUPLES.skjoldulf,
  'marriage-lyngvild-vikar-feuerhaar': COUPLES.lyngvild,
  'marriage-ketill-unndis-feuerhaar': COUPLES.ketill,
  'marriage-iormund-ranveig-schwarzdorn': COUPLES.ranveig,
  'marriage-skjalg-geirny-sterkr': COUPLES.geirny,
  'marriage-odin-heledd': COUPLES.odin,
  'marriage-mordred-ingeborg-hebog': COUPLES.ingeborg,
  'marriage-cieran-ingrid-mwyalchen': COUPLES.ingrid,
  'marriage-fjornir-svanlaug-feuerhaar': COUPLES.fjornir,
  'marriage-torstein-malfrid-wargh': COUPLES.malfrid,
  'marriage-sigurd-frida-freiwinter': COUPLES.frida,
  'marriage-gunnar-ulrikka-feuerhaar': COUPLES.gunnar,
  'marriage-kolskegg-skulla-feuerhaar': COUPLES.skulla,
  'marriage-wynthonya-ingvar-tylluan': COUPLES.ingvar,
  'marriage-vigmar-frigga-schwarzdorn': COUPLES.frigga,
  'marriage-sigbjorn-herdis-feuerhaar': COUPLES.sigbjorn,
  'affair-sigbjorn-saeba-feuerhaar': COUPLES.sigbjornAffair,
  'marriage-armod-asta-feuerhaar': COUPLES.armod,
  'marriage-fenya-erik-feuerhaar': COUPLES.fenya,
  'marriage-aksel-meriel-eryr': COUPLES.aksel,
  'marriage-lodinn-gunnora-feuerhaar': COUPLES.lodinn
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
    idPrefix: 'feuerhaar-parentage',
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

export const HOUSE_FEUERHAAR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-feuerhaar',
    title: 'Clan Feuerhaar',
    motto: '',
    description: 'Thanenclan von Rothain mit Sitz in Jägersruh. Seine Gründung wird auf den cenyriischen Bogenschützen Robyn Pengoch zurückgeführt.',
    emblem: HOUSE_EMBLEMS.feuerhaar,
    houseProfile: IVARSHEIM_HOUSE_PROFILES.feuerhaar
  },
  houses: [
    house(FEUERHAAR_HOUSE_ID, 'Clan Feuerhaar', HOUSE_EMBLEMS.feuerhaar),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg),
    house('house-silberzunge', 'Clan Silberzunge', HOUSE_EMBLEMS.silberzunge),
    house('house-grendel', 'Clan Grendel', HOUSE_EMBLEMS.grendel),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-aderyn', "Haus Aderyn O'Penbryn", HOUSE_EMBLEMS.aderyn),
    house('house-hebog', "Haus Hebog O'Talwyn", HOUSE_EMBLEMS.hebog),
    house('house-mwyalchen', "Haus Mwyalchen O'Penbryn", HOUSE_EMBLEMS.mwyalchen),
    house('house-tylluan', "Haus Tylluan O'Penbryn", HOUSE_EMBLEMS.tylluan),
    house('house-eryr', "Haus Eryr O'Penbryn", HOUSE_EMBLEMS.eryr),
    house('house-arnvild', 'Clan Arnvild'),
    house('house-silberblut', 'Clan Silberblut'),
    house('house-kummerherz', 'Clan Kummerherz'),
    house('house-gullvig', 'Clan Gullvig')
  ],
  persons: [
    person('robyn-pengoch', 'Robyn Pengoch', 'male', '????', '????', {
      title: 'Gründer des Clans Feuerhaar · Erster Thane von Jägersruh',
      notes: 'Cenyriischer Bogenschütze, dessen Sieg im Zweikampf die Gründung des Clans Feuerhaar begründete.'
    }),
    spouse('ermingard-feuerhaar-founder', 'Ermingard', 'female', '????', '????', '', {
      title: 'Mitgründerin des Clans Feuerhaar · Schwester des damaligen Jarls'
    }),

    person('thorsleikr-feuerhaar', 'Thorsleikr Feuerhaar', 'male', '1541', '1604', {
      title: 'Thane des Clans Feuerhaar'
    }),
    spouse('geirlaug-wargh', 'Geirlaug Wargh', 'female', '1543', '1609', 'house-wargh'),
    awayWoman('lysveig-feuerhaar', 'Lysveig Feuerhaar', '1542', '1609', 'Clan Arnvild'),
    spouse('sigtrygg-arnvild', 'Sigtrygg Arnvild', 'male', '1541', '1598', 'house-arnvild'),

    person('skjoldulf-feuerhaar', 'Skjoldulf Feuerhaar', 'male', '1569', '1625', {
      title: 'Thane des Clans Feuerhaar'
    }),
    spouse('ormrun-feuerhaar-spouse', 'Ormrún', 'female', '1570', '1629'),
    awayWoman('lyngvild-feuerhaar', 'Lyngvild Feuerhaar', '1569', '1615', 'Clan Silberblut'),
    spouse('vikar-silberblut', 'Vikar Silberblut', 'male', '1564', '1611', 'house-silberblut'),

    person('ketill-feuerhaar', 'Ketill Feuerhaar', 'male', '1597', '1665', {
      title: 'Thane des Clans Feuerhaar'
    }),
    spouse('unndis-feuerhaar-spouse', 'Unndís', 'female', '1600', '1671'),
    awayWoman('ranveig-feuerhaar', 'Ranveig Feuerhaar', '1598', '1661', 'Clan Schwarzdorn'),
    spouse('iormund-schwarzdorn', 'Iormund Schwarzdorn', 'male', '1590', '1662', 'house-schwarzdorn'),

    awayWoman('geirny-feuerhaar', 'Geirný Feuerhaar', '1631', '1677', 'Clan Sterkr'),
    spouse('skjalg-sterkr', 'Skjalg Sterkr', 'male', '1631', '1720', 'house-sterkr'),
    person('odin-feuerhaar', 'Odin Feuerhaar', 'male', '1629', '1671', {
      title: 'Thane des Clans Feuerhaar'
    }),
    spouse('heledd-aderyn', 'Heledd Aderyn', 'female', '1631', '1704', 'house-aderyn'),
    awayWoman('ingeborg-feuerhaar', 'Ingeborg Feuerhaar', '1632', '1699', 'Haus Hebog'),
    spouse('mordred-hebog', 'Mordred Hebog', 'male', '1631', '1689', 'house-hebog'),

    awayWoman('ingrid-feuerhaar', 'Ingrid Feuerhaar', '1655', '1710', 'Haus Mwyalchen'),
    spouse('cieran-mwyalchen', 'Cieran Mwyalchen', 'male', '1655', '1700', 'house-mwyalchen'),
    person('fjornir-feuerhaar', 'Fjornir Feuerhaar', 'male', '1648', '1702', {
      title: 'Thane des Clans Feuerhaar'
    }),
    spouse('svanlaug-skogg', 'Svanlaug Skogg', 'female', '1650', '1711', 'house-skogg'),
    awayWoman('malfrid-feuerhaar', 'Malfrid Feuerhaar', '1648', '1701', 'Clan Wargh'),
    spouse('torstein-wargh', 'Torstein Wargh', 'male', '1646', '1699', 'house-wargh'),
    awayWoman('frida-feuerhaar', 'Frida Feuerhaar', '1656', '', 'Clan Freiwinter'),
    spouse('sigurd-freiwinter', 'Sigurd Freiwinter', 'male', '1655', '1711', 'house-freiwinter'),
    person('gunnar-feuerhaar', 'Gunnar Feuerhaar', 'male', '1654', '1715', {
      title: 'Thane des Clans Feuerhaar 1703–1715'
    }),
    spouse('ulrikka-skaal', 'Ulrikka Skaal', 'female', '1657', '1709', 'house-skaal'),

    awayWoman('skulla-feuerhaar', 'Skulla Feuerhaar', '1677', '', 'Clan Silberzunge'),
    spouse('kolskegg-silberzunge', 'Kolskegg Silberzunge', 'male', '1671', '', 'house-silberzunge'),
    person('ingvar-feuerhaar', 'Ingvar Feuerhaar', 'male', '1673', '', {
      title: 'Thane des Clans Feuerhaar seit 1721'
    }),
    spouse('wynthonya-tylluan', 'Wynthonya Tylluan', 'female', '1674', '', 'house-tylluan'),
    awayWoman('frigga-feuerhaar', 'Frigga Feuerhaar', '1676', '', 'Clan Schwarzdorn'),
    spouse('vigmar-schwarzdorn', 'Vigmar Schwarzdorn', 'male', '1673', '', 'house-schwarzdorn'),
    person('sigbjorn-feuerhaar', 'Sigbjorn Feuerhaar', 'male', '1675', '', {
      title: 'Thane des Clans Feuerhaar 1702–1703 und 1715–1721'
    }),
    spouse('herdis-feuerhaar-spouse', 'Herdis', 'female', '1676', ''),
    affairPartner('saeba-feuerhaar-affair', 'Saeba', 'female', '1700', {
      title: 'Affäre Sigbjorns · Mutter Thorarins'
    }),

    person('armod-feuerhaar', 'Armod Feuerhaar', 'male', '1695', '', {
      title: 'Erster Erbe des Clans Feuerhaar'
    }),
    spouse('asta-kummerherz', 'Asta Kummerherz', 'female', '1699', '', 'house-kummerherz'),
    awayWoman('fenya-feuerhaar', 'Fenya Feuerhaar', '1701', '', 'Clan Grendel'),
    spouse('erik-grendel', 'Erik Grendel', 'male', '1696', '', 'house-grendel'),
    person('aksel-feuerhaar', 'Aksel Feuerhaar', 'male', '1699', ''),
    spouse('meriel-eryr', 'Meriel Eryr', 'female', '1700', '', 'house-eryr'),
    person('lodinn-feuerhaar', 'Lodinn Feuerhaar', 'male', '1703', ''),
    spouse('gunnora-feuerhaar-spouse', 'Gunnora', 'female', '1704', ''),
    person('runolf-feuerhaar', 'Runolf Feuerhaar', 'male', '1710', ''),
    person('thorarin-feuerhaar', 'Thorarin Feuerhaar', 'male', '1722', '', {
      familyRole: 'bastard',
      title: 'Bastardsohn Sigbjorns und Saebas',
      tags: ['Bastard']
    }),

    person('bjart-feuerhaar', 'Bjart Feuerhaar', 'male', '1718', '', {
      title: 'Zweiter Erbe des Clans Feuerhaar'
    }),
    person('rafn-feuerhaar', 'Rafn Feuerhaar', 'male', '1721', '', {
      title: 'Dritter Erbe des Clans Feuerhaar',
      notes: 'Regulärer leiblicher Sohn Armod Feuerhaars und Asta Kummerherz; ausdrücklich kein Mündel des Clans Skogg.'
    }),
    person('lilja-feuerhaar', 'Lilja Feuerhaar', 'female', '1723', ''),
    ward('magni-gullvig', 'Magni Gullvig', 'male', '1724', 'house-gullvig', {
      title: 'Aufgenommenes Mündel Armod Feuerhaars',
      notes: 'Magni ist ein Mündel aus Clan Gullvig und kein leiblicher Feuerhaar-Spross.'
    }),
    person('volund-feuerhaar', 'Volund Feuerhaar', 'male', '1721', ''),
    person('idunn-feuerhaar', 'Idunn Feuerhaar', 'female', '1724', ''),
    person('svart-feuerhaar', 'Svart Feuerhaar', 'male', '1723', ''),
    person('eilif-feuerhaar', 'Eilíf Feuerhaar', 'male', '1726', '')
  ],
  partnerships: [
    endedMarriage('marriage-robyn-ermingard-feuerhaar'),
    endedMarriage('marriage-geirlaug-thorsleikr-wargh', '1604'),
    endedMarriage('marriage-lysveig-sigtrygg-feuerhaar', '1598'),
    endedMarriage('marriage-skjoldulf-ormrun-feuerhaar', '1625'),
    endedMarriage('marriage-lyngvild-vikar-feuerhaar'),
    endedMarriage('marriage-ketill-unndis-feuerhaar', '1665'),
    endedMarriage('marriage-iormund-ranveig-schwarzdorn', '1661'),
    endedMarriage('marriage-skjalg-geirny-sterkr', '1677'),
    endedMarriage('marriage-odin-heledd', '1671'),
    endedMarriage('marriage-mordred-ingeborg-hebog', '1689'),
    endedMarriage('marriage-cieran-ingrid-mwyalchen', '1700'),
    endedMarriage('marriage-fjornir-svanlaug-feuerhaar', '1702'),
    endedMarriage('marriage-torstein-malfrid-wargh', '1699'),
    endedMarriage('marriage-sigurd-frida-freiwinter', '1711'),
    endedMarriage('marriage-gunnar-ulrikka-feuerhaar', '1709'),
    marriage('marriage-kolskegg-skulla-feuerhaar'),
    marriage('marriage-wynthonya-ingvar-tylluan'),
    marriage('marriage-vigmar-frigga-schwarzdorn'),
    marriage('marriage-sigbjorn-herdis-feuerhaar'),
    alignedAffair('affair-sigbjorn-saeba-feuerhaar', 'saeba-feuerhaar-affair'),
    marriage('marriage-armod-asta-feuerhaar'),
    marriage('marriage-fenya-erik-feuerhaar'),
    marriage('marriage-aksel-meriel-eryr'),
    marriage('marriage-lodinn-gunnora-feuerhaar')
  ],
  parentages: [
    ...childrenOf(['thorsleikr-feuerhaar', 'lysveig-feuerhaar'], 'marriage-robyn-ermingard-feuerhaar', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Thorsleikr und Lysveig.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['skjoldulf-feuerhaar', 'lyngvild-feuerhaar'], 'marriage-geirlaug-thorsleikr-wargh'),
    ...childrenOf(['ketill-feuerhaar', 'ranveig-feuerhaar'], 'marriage-skjoldulf-ormrun-feuerhaar'),
    ...childrenOf(['geirny-feuerhaar', 'odin-feuerhaar', 'ingeborg-feuerhaar'], 'marriage-ketill-unndis-feuerhaar'),
    ...childrenOf(
      ['ingrid-feuerhaar', 'fjornir-feuerhaar', 'malfrid-feuerhaar', 'frida-feuerhaar', 'gunnar-feuerhaar'],
      'marriage-odin-heledd'
    ),
    ...childrenOf(['skulla-feuerhaar', 'ingvar-feuerhaar', 'frigga-feuerhaar'], 'marriage-fjornir-svanlaug-feuerhaar'),
    ...childrenOf(['sigbjorn-feuerhaar'], 'marriage-gunnar-ulrikka-feuerhaar'),
    ...childrenOf(['armod-feuerhaar', 'fenya-feuerhaar', 'aksel-feuerhaar'], 'marriage-wynthonya-ingvar-tylluan'),
    ...childrenOf(['lodinn-feuerhaar', 'runolf-feuerhaar'], 'marriage-sigbjorn-herdis-feuerhaar'),
    ...childrenOf(['thorarin-feuerhaar'], 'affair-sigbjorn-saeba-feuerhaar', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Thorarin entstammt Sigbjorns Affäre mit Saeba.'
    }),
    ...childrenOf(['bjart-feuerhaar', 'rafn-feuerhaar', 'lilja-feuerhaar'], 'marriage-armod-asta-feuerhaar'),
    ...createParentages(['magni-gullvig'], ['armod-feuerhaar'], '', {
      idPrefix: 'feuerhaar-foster-parentage',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Magni Gullvig ist Armods aufgenommenes Mündel und kein leibliches Kind.'
    }),
    ...childrenOf(['volund-feuerhaar', 'idunn-feuerhaar'], 'marriage-aksel-meriel-eryr'),
    ...childrenOf(['svart-feuerhaar', 'eilif-feuerhaar'], 'marriage-lodinn-gunnora-feuerhaar')
  ],
  cadetBranches: [
    marriedAway('married-away-lysveig-feuerhaar-arnvild', 'Clan Arnvild', 'marriage-lysveig-sigtrygg-feuerhaar', 'house-arnvild', 'haus-arnvild'),
    marriedAway('married-away-lyngvild-feuerhaar-silberblut', 'Clan Silberblut', 'marriage-lyngvild-vikar-feuerhaar', 'house-silberblut', 'haus-silberblut'),
    marriedAway('married-away-ranveig-feuerhaar-schwarzdorn', 'Clan Schwarzdorn', 'marriage-iormund-ranveig-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-geirny-feuerhaar-sterkr', 'Clan Sterkr', 'marriage-skjalg-geirny-sterkr', 'house-sterkr', 'haus-sterkr', HOUSE_EMBLEMS.sterkr),
    marriedAway('married-away-ingeborg-feuerhaar-hebog', 'Haus Hebog', 'marriage-mordred-ingeborg-hebog', 'house-hebog', 'haus-hebog', HOUSE_EMBLEMS.hebog),
    marriedAway('married-away-ingrid-feuerhaar-mwyalchen', 'Haus Mwyalchen', 'marriage-cieran-ingrid-mwyalchen', 'house-mwyalchen', 'haus-mwyalchen', HOUSE_EMBLEMS.mwyalchen),
    marriedAway('married-away-malfrid-feuerhaar-wargh', 'Clan Wargh', 'marriage-torstein-malfrid-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    marriedAway('married-away-frida-feuerhaar-freiwinter', 'Clan Freiwinter', 'marriage-sigurd-frida-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-skulla-feuerhaar-silberzunge', 'Clan Silberzunge', 'marriage-kolskegg-skulla-feuerhaar', 'house-silberzunge', 'haus-silberzunge', HOUSE_EMBLEMS.silberzunge),
    marriedAway('married-away-frigga-feuerhaar-schwarzdorn', 'Clan Schwarzdorn', 'marriage-vigmar-frigga-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-fenya-feuerhaar-grendel', 'Clan Grendel', 'marriage-fenya-erik-feuerhaar', 'house-grendel', 'haus-grendel', HOUSE_EMBLEMS.grendel)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-robyn-ermingard-feuerhaar',
      parentPersonId: '',
      childIds: ['thorsleikr-feuerhaar', 'lysveig-feuerhaar'],
      years: 0,
      fromYear: '????',
      toYear: '1541',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner unter dem Gründerwappen.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-robyn-ermingard-feuerhaar',
    houseId: FEUERHAAR_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Rothain · Sitz Jägersruh',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'robyn-pengoch',
    orientation: 'vertical',
    ancestorDepth: 28,
    descendantDepth: 28,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 5,
    sourceModule: 'Clan Feuerhaar (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Stammbaum wurde ohne Personenfokus übernommen. Robyn Pengoch und Ermingard stehen vor dem goldenen Hauswappen; genau ein serieller Zeitsprung führt danach zu Thorsleikr und Lysveig. Die Stammbaumgrafik löst die in der Tabelle als „?? & ??“ offenen Eltern von Armod, Fenya und Aksel eindeutig als Ingvar Feuerhaar und Wynthonya Tylluan auf. Die Eheüberschrift „Gunnar“ über Fjornirs Partnerin Svanlaug ist ein Tabellenfehler; Kinderblock und Grafik belegen Fjornir. Svanlaugs Lebensdaten 1650–1711 stammen aus der nun ausgearbeiteten Skogg-Gegenakte. Ingrid und Ingeborg werden nach der Feuerhaar-Abstammung statt der widersprüchlichen Eldhári-Zuordnung ihrer älteren Gegenakten geführt. Rafn ist ein regulärer leiblicher Sohn Armods und Astas; die zuvor abgeleitete Skogg-Mündelverbindung ist ausdrücklich verworfen und wird migrationsfest entfernt. Magni Gullvig ist ausschließlich Armods aufgenommenes Mündel. Thorarin ist Sigbjorns Bastard aus der Affäre mit Saeba und wird unmittelbar unter ihr ausgerichtet. Lyngvilds bisher unbekannte Lebensdaten und die ihres Ehemanns Vikar Silberblut werden durch die Silberblut-Quelle zu 1569–1615 beziehungsweise 1564–1611 präzisiert. Frauen mit belegter Ehe in eine andere Linie erhalten direkte Wegverheiratet-Knoten; deren Nachkommen werden ausschließlich in den fortführenden Gegenakten gezeigt. Standardsilhouetten wurden nicht als individuelle Porträts gespeichert.',
    registryTombstones: {
      persons: ['haus-feuerhaar-gruender', 'haus-feuerhaar-gruenderin'],
      partnerships: ['marriage-haus-feuerhaar-founders'],
      cadetBranches: ['ward-away-rafn-feuerhaar-skogg']
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
