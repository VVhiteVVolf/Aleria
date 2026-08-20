import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  ALDRIMAR_HOUSE_EMBLEMS,
  ALDRIMAR_HOUSE_PROFILES
} from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { HOUSE_VARANGR_PORTRAITS } from './house-varangr-portraits.js';
import { KRAEHENMOOR_HOUSE_EMBLEMS } from './kraehenmoor-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';

const VARANGR_HOUSE_ID = 'house-varangr';

const HOUSE_EMBLEMS = Object.freeze({
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  'mac-corcaigh': KRAEHENMOOR_HOUSE_EMBLEMS['mac-corcaigh'],
  blutstahl: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
  silberblut: KRAEHENMOOR_HOUSE_EMBLEMS.silberblut,
  schwarzblut: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
  schattenherz: KRAEHENMOOR_HOUSE_EMBLEMS.schattenherz,
  feuerherz: KRAEHENMOOR_HOUSE_EMBLEMS.feuerherz,
  kaltherz: KRAEHENMOOR_HOUSE_EMBLEMS.kaltherz,
  vragi: KRAEHENMOOR_HOUSE_EMBLEMS.vragi,
  goldglanz: KRAEHENMOOR_HOUSE_EMBLEMS.goldglanz,
  goldschwur: KRAEHENMOOR_HOUSE_EMBLEMS.goldschwur
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
  'loki-varangr',
  'odvaldr-varangr',
  'steinar-varangr',
  'torvald-1585-varangr',
  'hjalti-varangr',
  'zarek-varangr',
  'ulrik-varangr',
  'ingthor-varangr',
  'eldgrim-varangr',
  'baldvin-varangr',
  'hadvar-varangr',
  'othrik-varangr',
  'hakon-varangr'
]);

function lineageRoleFor(personId) {
  return HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? VARANGR_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_VARANGR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === VARANGR_HOUSE_ID ? 'core' : 'married'),
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
    houseId,
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function affair(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: 'affair',
    lineageRole: 'branch',
    title: options.title || 'Affäre',
    tags: [...(options.tags || []), 'Affäre']
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function sentWard(id, name, sex, birth, death, targetHouseName, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    familyRole: 'ward-away',
    lineageRole: 'branch',
    title: options.title || `Als Mündel an ${targetHouseName} vermittelt`,
    tags: [...(options.tags || []), 'Mündel', 'Fortgegeben']
  });
}

function bastard(id, name, sex, birth, death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    familyRole: 'bastard',
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
  unknownFounders: ['unknown-father-varangr', 'unknown-mother-varangr'],
  loki: ['loki-varangr', 'brigid-mac-corcaigh'],
  fridleif: ['fridleif-varangr', 'oystein-vaeren'],
  odvaldr: ['holmdis-wargh', 'odvaldr-varangr'],
  steinar: ['steinar-varangr', 'arnborg-blutstahl'],
  kjellfrid: ['einar-silberblut', 'kjellfrid-varangr'],
  ringstad: ['ringstad-varangr', 'helga'],
  torvald: ['torvald-1585-varangr', 'gulda-goldglanz'],
  elisef: ['balgruuf-younger-vaeren', 'elisef-1592-varangr'],
  svanhildr: ['egil-ragnulf', 'svanhildr-varangr'],
  hjalti: ['hjalti-varangr', 'ormhild-schwarzdorn'],
  ingemar1606: ['ingemar-1606-varangr', 'camilla-avenicci'],
  vanadis: ['drengur-feuerherz', 'vanadis-varangr'],
  jerrik: ['jerrik-varangr', 'quolga-schwarzblut'],
  marduk: ['marduk-varangr', 'kenhild-schattenherz'],
  frideborg: ['galvar-kaltherz', 'frideborg-varangr'],
  fannarr: ['fannar-varangr', 'islaug-vragi'],
  fannarrAffair: ['fannar-varangr', 'dagmar'],
  ingthor: ['asahel-brathfengr', 'ingthor-varangr'],
  zarek: ['zarek-varangr', 'flavia-arbor'],
  ulrik: ['ulrik-varangr', 'moira-rochraide'],
  magdis: ['magdis-varangr', 'trianne-eldath'],
  hadvar: ['hadvar-varangr', 'ingeborg-sturmgeborene'],
  ullrun: ['oddgeir-goldschwur', 'ullrun-varangr'],
  eldgrim: ['eldgrim-varangr', 'milfgun'],
  baldvin: ['baldvin-varangr', 'rualainn-craobhan'],
  inghtor: ['siglif-skogg', 'inghtor-varangr'],
  othrik: ['othrik-varangr', 'innozentia-avenicci'],
  envor: ['traolach-ronain', 'envor-varangr'],
  lythar: ['lythar-varangr', 'fenhild'],
  fostine: ['styrbjorn-schwarzblut', 'fostine-varangr'],
  valran: ['valran-varangr', 'serana'],
  hakon: ['hakon-varangr', 'brynhildr-goldglanz'],
  frida: ['rolfur-feuerherz', 'frida-varangr'],
  rorik: ['rorik-varangr', 'gisrun-schattenherz'],
  rorikAffair: ['rorik-varangr', 'urd'],
  erna: ['njvar-kaltherz', 'erna-varangr'],
  skule: ['skule-varangr', 'dagrun-goldschwur'],
  brandur: ['brandur-varangr', 'aslaug-silberblut'],
  iseld: ['tjodmar-vragi', 'iseld-varangr'],
  andor: ['andor-varangr', 'askla-blutstahl'],
  andorAffair: ['andor-varangr', 'line'],
  ingmarAffair: ['ingmar-varangr', 'vefa'],
  ingmund: ['ingmund-varangr', 'gudrun-ragnulf'],
  ingulf: ['ingulf-varangr', 'unknown-wife-ingulf-varangr']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-unknown-varangr-founders': COUPLES.unknownFounders,
  'marriage-loki-brigid-varangr': COUPLES.loki,
  'marriage-fridleif-oystein-varangr': COUPLES.fridleif,
  'marriage-holmdis-odvaldr-wargh': COUPLES.odvaldr,
  'marriage-steinar-arnborg-varangr': COUPLES.steinar,
  'marriage-kjellfrid-einar-varangr': COUPLES.kjellfrid,
  'marriage-ringstad-helga-varangr': COUPLES.ringstad,
  'marriage-torvald-gulda-varangr': COUPLES.torvald,
  'marriage-elisef-balgruuf-varangr': COUPLES.elisef,
  'marriage-egil-svanhildr-ragnulf': COUPLES.svanhildr,
  'marriage-hjalti-ormhild-schwarzdorn': COUPLES.hjalti,
  'marriage-ingemar-camilla-varangr': COUPLES.ingemar1606,
  'marriage-vanadis-drengur-varangr': COUPLES.vanadis,
  'marriage-jerrik-quolga-varangr': COUPLES.jerrik,
  'marriage-marduk-kenhild-varangr': COUPLES.marduk,
  'marriage-frideborg-galvar-varangr': COUPLES.frideborg,
  'marriage-fannar-islaug-varangr': COUPLES.fannarr,
  'affair-fannar-dagmar-varangr': COUPLES.fannarrAffair,
  'marriage-asahel-ingthor-brathfengr': COUPLES.ingthor,
  'marriage-zarek-flavia-varangr': COUPLES.zarek,
  'marriage-ulrik-moira-varangr': COUPLES.ulrik,
  'marriage-magdis-trianne-varangr': COUPLES.magdis,
  'marriage-hadvar-ingeborg-varangr': COUPLES.hadvar,
  'marriage-ullrun-oddgeir-varangr': COUPLES.ullrun,
  'marriage-eldgrim-milfgun-varangr': COUPLES.eldgrim,
  'marriage-baldvin-rualainn-varangr': COUPLES.baldvin,
  'marriage-siglif-inghtor-skogg': COUPLES.inghtor,
  'marriage-othrik-innozentia-varangr': COUPLES.othrik,
  'marriage-envor-traolach-varangr': COUPLES.envor,
  'marriage-lythar-fenhild-varangr': COUPLES.lythar,
  'marriage-fostine-styrbjorn-varangr': COUPLES.fostine,
  'marriage-valran-serana-varangr': COUPLES.valran,
  'marriage-hakon-brynhildr-varangr': COUPLES.hakon,
  'marriage-frida-rolfur-varangr': COUPLES.frida,
  'marriage-rorik-gisrun-varangr': COUPLES.rorik,
  'affair-rorik-urd-varangr': COUPLES.rorikAffair,
  'marriage-erna-njvar-varangr': COUPLES.erna,
  'marriage-skule-dagrun-varangr': COUPLES.skule,
  'marriage-brandur-aslaug-varangr': COUPLES.brandur,
  'marriage-iseld-tjodmar-varangr': COUPLES.iseld,
  'marriage-andor-askla-varangr': COUPLES.andor,
  'affair-andor-line-varangr': COUPLES.andorAffair,
  'affair-ingmar-vefa-varangr': COUPLES.ingmarAffair,
  'marriage-gudrun-ingmund-ragnulf': COUPLES.ingmund,
  'marriage-ingulf-unknown-varangr': COUPLES.ingulf
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignPartnerOverChildren(record, partnerPersonId) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId,
      registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId']
    }
  };
}

function alignChildGroupBelowParentPair(record) {
  const managedFields = new Set(record.extensions?.registryManagedExtensionFields || []);
  managedFields.add('chartAlignChildGroupBelowParentPair');
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignChildGroupBelowParentPair: true,
      registryManagedExtensionFields: [...managedFields]
    }
  };
}

function clearPartnerOverChildrenAlignment(record) {
  const extensions = { ...(record.extensions || {}) };
  delete extensions.chartAlignPartnerOverChildrenPersonId;
  return {
    ...record,
    extensions: {
      ...extensions,
      registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId']
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'varangr-parentage',
    ...options
  });
}

function claimedChildren(childIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
    extensions: { timeJumpId }
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
        'name',
        'parentPersonId',
        'houseId',
        'targetFamilyId',
        'emblem',
        'subtitle'
      ]
    }
  });
}

function timeJump(id, parentPartnershipId, childIds, fromYear = '????', toYear = '????') {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear,
    toYear,
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner; der Zeitsprung steht weder parallel zu Personen noch zu Hausknoten.',
    extensions: {}
  };
}

export const HOUSE_VARANGR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-varangr',
    title: 'Clan Varangr',
    motto: '',
    description: 'Jarlsclan von Krähenmoor und Herren von Moortal. Die Varangr stiegen aus einer alten Norrnaigh-Kriegerschar zu wohlhabenden Eroberern, Diplomaten und Herren der Goldminen Krähenmoors auf.',
    emblem: HOUSE_EMBLEMS.varangr,
    houseProfile: ALDRIMAR_HOUSE_PROFILES.varangr
  },
  houses: [
    house(VARANGR_HOUSE_ID, 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-mac-corcaigh', 'Clan Mac Corcaigh', HOUSE_EMBLEMS['mac-corcaigh']),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-blutstahl', 'Clan Blutstahl', HOUSE_EMBLEMS.blutstahl),
    house('house-silberblut', 'Clan Silberblut', HOUSE_EMBLEMS.silberblut),
    house('house-goldglanz', 'Clan Goldglanz', HOUSE_EMBLEMS.goldglanz),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-avenicci', 'Haus Avenicci'),
    house('house-feuerherz', 'Clan Feuerherz', HOUSE_EMBLEMS.feuerherz),
    house('house-schwarzblut', 'Clan Schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    house('house-schattenherz', 'Clan Schattenherz', HOUSE_EMBLEMS.schattenherz),
    house('house-kaltherz', 'Clan Kaltherz', HOUSE_EMBLEMS.kaltherz),
    house('house-vragi', 'Clan Vragi', HOUSE_EMBLEMS.vragi),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-arbor', 'Haus Arbor'),
    house('house-rochraide', 'Haus Rochraide'),
    house('house-eldath', 'Haus Eldath'),
    house('house-sturmgeborene', 'Clan Sturmgeborene'),
    house('house-goldschwur', 'Clan Goldschwur', HOUSE_EMBLEMS.goldschwur),
    house('house-craobhan', 'Clan Craobhan'),
    house('house-ronain', 'Clan Rónáin'),
    house('house-skogg', 'Clan Skogg'),
    house('house-unknown', 'Unbekanntes Haus')
  ],
  persons: [
    person('unknown-father-varangr', '???', 'male', '????', '????', {
      title: 'Unbekannter Vater Lokis'
    }),
    person('unknown-mother-varangr', '???', 'female', '????', '????', {
      title: 'Unbekannte Mutter Lokis'
    }),
    person('loki-varangr', 'Loki Varangr', 'male', '????', '????', {
      title: 'Gründer und erster überlieferter Jarl des Clans Varangr'
    }),
    spouse('brigid-mac-corcaigh', 'Brigid Mac Corcaigh', 'female', '????', '????', 'house-mac-corcaigh'),

    person('fridleif-varangr', 'Fridleif Varangr', 'male', '????', '????'),
    spouse('oystein-vaeren', 'Øystein Vaeren', 'male', '????', '????', 'house-vaeren'),
    person('odvaldr-varangr', 'Odvaldr Varangr', 'male', '????', '????', {
      title: 'Jarl des Clans Varangr'
    }),
    spouse('holmdis-wargh', 'Hólmdís Wargh', 'female', '????', '????', 'house-wargh'),

    person('steinar-varangr', 'Steinar Varangr', 'male', '1562', '1605', {
      title: 'Jarl des Clans Varangr bis 1605'
    }),
    awayWoman('kjellfrid-varangr', 'Kjellfrid Varangr', '1563', '', 'Clan Silberblut'),
    person('ringstad-varangr', 'Ringstad Varangr', 'male', '1573', '1629'),
    spouse('arnborg-blutstahl', 'Arnborg Blutstahl', 'female', '1563', '1605', 'house-blutstahl'),
    spouse('einar-silberblut', 'Einar Silberblut', 'male', '1560', '1601', 'house-silberblut'),
    spouse('helga', 'Helga', 'female', '????', '????'),

    person('torvald-1585-varangr', 'Torvald Varangr', 'male', '1585', '1646', {
      title: 'Jarl von 1605–1641 und 1643–1646'
    }),
    awayWoman('elisef-1592-varangr', 'Elisef Varangr', '1592', '', 'Clan Vaeren'),
    awayWoman('svanhildr-varangr', 'Svanhildr Varangr', '1590', '1671', 'Clan Ragnulf'),
    person('porsdal-varangr', 'Porsdal Varangr', 'male', '1600', '1628'),
    person('hjalti-varangr', 'Hjalti Varangr', 'male', '1592', '1651', {
      title: 'Jarl von 1641–1643 und 1646–1651'
    }),
    spouse('gulda-goldglanz', 'Gulda Goldglanz', 'female', '1588', '', 'house-goldglanz'),
    spouse('balgruuf-younger-vaeren', 'Balgruuf der Jüngere Vaeren', 'male', '1585', '1627', 'house-vaeren'),
    spouse('egil-ragnulf', 'Egil Ragnulf', 'male', '1588', '1649', 'house-ragnulf'),
    spouse('ormhild-schwarzdorn', 'Ormhild Schwarzdorn', 'female', '1594', '1633', 'house-schwarzdorn'),

    person('ingemar-1606-varangr', 'Ingemar Varangr', 'male', '1606', '1641'),
    awayWoman('vanadis-varangr', 'Vanadis Varangr', '1609', '', 'Clan Feuerherz'),
    person('jerrik-varangr', 'Jerrik Varangr', 'male', '1612', '1639'),
    person('marduk-varangr', 'Marduk Varangr', 'male', '1617', '1639'),
    awayWoman('frideborg-varangr', 'Frideborg Varangr', '1611', '1671', 'Clan Kaltherz'),
    person('fannar-varangr', 'Fannar Varangr', 'male', '1615', '1641', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['islaug-vragi', 'dagmar'],
        registryManagedExtensionFields: [
          'chartCenterBetweenSpousePersonIds',
          'chartCenterBetweenPartnerPersonIds'
        ]
      }
    }),
    spouse('camilla-avenicci', 'Camilla Avenicci', 'female', '1608', '', 'house-avenicci'),
    spouse('drengur-feuerherz', 'Drengur Feuerherz', 'male', '1610', '1641', 'house-feuerherz'),
    spouse('quolga-schwarzblut', 'Quolga Schwarzblut', 'female', '1613', '1664', 'house-schwarzblut'),
    spouse('kenhild-schattenherz', 'Kenhild Schattenherz', 'female', '1617', '1700', 'house-schattenherz'),
    spouse('galvar-kaltherz', 'Galvar Kaltherz', 'male', '1610', '1693', 'house-kaltherz'),
    spouse('islaug-vragi', 'Islaug Vragi', 'female', '1615', '1722', 'house-vragi', {
      title: 'Ehefrau Fannars'
    }),
    affair('dagmar', 'Dagmar', 'female', '1621', '1675', '', {
      title: 'Affäre Fannars'
    }),

    person('ingthor-varangr', 'Ingthor Varangr', 'male', '1626', '1694', {
      title: 'Jarl von 1669 bis 1694'
    }),
    person('thorir-varangr', 'Thorir Varangr', 'male', '1628', '1646'),
    person('zarek-varangr', 'Zarek Varangr', 'male', '1629', '1659', {
      title: 'Jarl von 1651 bis 1659'
    }),
    person('sigmund-varangr', 'Sigmund Varangr', 'male', '1631', '1647'),
    person('reidar-varangr', 'Reidar Varangr', 'male', '1635', '1646'),
    person('ulrik-varangr', 'Ulrik Varangr', 'male', '1637', '1669', {
      title: 'Jarl von 1659 bis 1669'
    }),
    awayWoman('magdis-varangr', 'Magdis Varangr', '1634', '', 'Haus Eldath'),
    bastard('dvalin-varangr', 'Dvalin Varangr', 'male', '1642', '1700', {
      title: 'Bastardsohn Fannars und Dagmars'
    }),
    spouse('asahel-brathfengr', 'Ásahel Brathfengr', 'female', '1627', '1700', 'house-brathfengr'),
    spouse('flavia-arbor', 'Flavia Arbor', 'female', '????', '????', 'house-arbor'),
    spouse('moira-rochraide', 'Moira Rochraide', 'female', '????', '????', 'house-rochraide'),
    spouse('trianne-eldath', 'Trianne Eldath', 'female', '????', '????', 'house-eldath'),

    person('hadvar-varangr', 'Hadvar Varangr', 'male', '1642', '1713', {
      title: 'Jarl von 1704 bis 1713'
    }),
    awayWoman('ullrun-varangr', 'Ullrún Varangr', '1649', '', 'Clan Goldschwur'),
    person('eldgrim-varangr', 'Eldgrim Varangr', 'male', '1650', '1700', {
      title: 'Jarl von 1694 bis 1700'
    }),
    person('egil-varangr', 'Egil Varangr', 'male', '1655', '1671'),
    person('baldvin-varangr', 'Baldvin Varangr', 'male', '1657', '1704', {
      title: 'Jarl von 1700 bis 1704'
    }),
    spouse('ingeborg-sturmgeborene', 'Ingeborg Sturmgeborene', 'female', '1649', '', 'house-sturmgeborene'),
    spouse('oddgeir-goldschwur', 'Oddgeir Goldschwur', 'male', '????', '????', 'house-goldschwur'),
    spouse('milfgun', 'Milfgun', 'female', '????', '????'),
    spouse('rualainn-craobhan', 'Rualainn Craobhan', 'female', '????', '????', 'house-craobhan'),

    person('othrik-varangr', 'Othrik Varangr', 'male', '1669', '1729', {
      title: 'Jarl von 1713 bis 1729'
    }),
    person('inghtor-varangr', 'Inghtor Varangr', 'male', '1672', '1720', {
      notes: 'Die Gegenakte des Clans Skogg führt Inghtor als Ehemann Siglífs. Die Varangr-Alttafel lässt ihn unter Hadvars Kindern aus; seine Einordnung hier ist daher als wahrscheinlich markiert.'
    }),
    awayWoman('envor-varangr', 'Envor Varangr', '1674', '', 'Clan Rónáin'),
    person('lythar-varangr', 'Lythar Varangr', 'male', '1673', ''),
    awayWoman('fostine-varangr', 'Fostine Varangr', '1676', '', 'Clan Schwarzblut'),
    person('valran-varangr', 'Valran Varangr', 'male', '1678', ''),
    spouse('innozentia-avenicci', 'Innozentia Avenicci', 'female', '1671', '', 'house-avenicci'),
    spouse('siglif-skogg', 'Siglíf Skogg', 'female', '1674', '', 'house-skogg'),
    spouse('traolach-ronain', 'Traolach Rónáin', 'male', '????', '????', 'house-ronain'),
    spouse('fenhild', 'Fenhild', 'female', '????', '????'),
    spouse('styrbjorn-schwarzblut', 'Styrbjorn Schwarzblut', 'male', '1675', '', 'house-schwarzblut'),
    spouse('serana', 'Serana', 'female', '????', '????'),

    person('hakon-varangr', 'Hakon Varangr', 'male', '1689', '', {
      title: 'Jarl von Krähenmoor seit 1729'
    }),
    awayWoman('frida-varangr', 'Frida Varangr', '1694', '', 'Clan Feuerherz'),
    person('rorik-varangr', 'Rörik Varangr', 'male', '1696', '1720', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['gisrun-schattenherz', 'urd'],
        registryManagedExtensionFields: [
          'chartCenterBetweenSpousePersonIds',
          'chartCenterBetweenPartnerPersonIds'
        ]
      }
    }),
    awayWoman('erna-varangr', 'Erna Varangr', '1698', '', 'Clan Kaltherz'),
    person('skule-varangr', 'Skule Varangr', 'male', '1704', ''),
    person('brandur-varangr', 'Brandur Varangr', 'male', '1695', ''),
    awayWoman('iseld-varangr', 'Iseld Varangr', '1699', '', 'Clan Vragi'),
    person('andor-varangr', 'Andor Varangr', 'male', '1703', '', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['askla-blutstahl', 'line'],
        registryManagedExtensionFields: [
          'chartCenterBetweenSpousePersonIds',
          'chartCenterBetweenPartnerPersonIds'
        ]
      }
    }),
    spouse('brynhildr-goldglanz', 'Brynhildr Goldglanz', 'female', '1690', '', 'house-goldglanz'),
    spouse('rolfur-feuerherz', 'Rolfur Feuerherz', 'male', '1694', '', 'house-feuerherz'),
    spouse('gisrun-schattenherz', 'Gisrun Schattenherz', 'female', '1703', '', 'house-schattenherz'),
    affair('urd', 'Urd', 'female', '1702', '', '', { title: 'Affäre Röriks' }),
    spouse('njvar-kaltherz', 'Njvar Kaltherz', 'male', '1694', '', 'house-kaltherz'),
    spouse('dagrun-goldschwur', 'Dagrun Goldschwur', 'female', '1702', '', 'house-goldschwur'),
    spouse('aslaug-silberblut', 'Aslaug Silberblut', 'female', '1698', '', 'house-silberblut'),
    spouse('tjodmar-vragi', 'Tjodmar Vragi', 'male', '1696', '', 'house-vragi'),
    spouse('askla-blutstahl', 'Askla Blutstahl', 'female', '1695', '', 'house-blutstahl'),
    affair('line', 'Line', 'female', '1706', '', '', { title: 'Affäre Andors' }),

    person('ingmar-varangr', 'Ingmar Varangr', 'male', '1710', ''),
    person('ingmund-varangr', 'Ingmund Varangr', 'male', '1712', ''),
    person('ingemar-1718-varangr', 'Ingemar Varangr', 'male', '1718', ''),
    person('inga-varangr', 'Inga Varangr', 'female', '1722', ''),
    sentWard('ingulf-varangr', 'Ingulf Varangr', 'male', '1726', '', 'Clan Skogg', {
      title: 'Mündel bei Clan Skogg'
    }),
    person('fjalar-varangr', 'Fjalar Varangr', 'male', '1721', ''),
    person('olesja-varangr', 'Olesja Varangr', 'female', '1723', ''),
    bastard('torvald-1721-varangr', 'Torvald Varangr', 'male', '1721', '', {
      title: 'Bastardsohn Röriks und Urds'
    }),
    person('fjori-varangr', 'Fjori Varangr', 'male', '1724', ''),
    person('tanja-varangr', 'Tanja Varangr', 'female', '1726', ''),
    person('sverre-varangr', 'Sverre Varangr', 'male', '1722', ''),
    person('portha-varangr', 'Portha Varangr', 'female', '1725', ''),
    person('olav-varangr', 'Olav Varangr', 'male', '1724', ''),
    person('svanja-varangr', 'Svanja Varangr', 'female', '1726', ''),
    bastard('elisef-1728-varangr', 'Elisef Varangr', 'female', '1728', '', {
      title: 'Bastardtochter Andors und Lines'
    }),
    affair('vefa', 'Vefa', 'female', '1712', '', '', { title: 'Affäre Ingmars' }),
    spouse('gudrun-ragnulf', 'Gudrun Ragnulf', 'female', '1714', '', 'house-ragnulf'),
    spouse('unknown-wife-ingulf-varangr', '???', 'female', '????', '????', '', {
      title: 'Unbekannte Ehefrau Ingulfs'
    }),

    bastard('jens-varangr', 'Jens Varangr', 'male', '1728', '', {
      title: 'Bastardsohn Ingmars und Vefas'
    }),
    bastard('nils-varangr', 'Nils Varangr', 'male', '1734', '', {
      title: 'Bastardsohn Ingmars und Vefas'
    }),
    person('oran-varangr', 'Oran Varangr', 'male', '1734', ''),
    person('malin-varangr', 'Malin Varangr', 'female', '1736', '')
  ],
  partnerships: [
    partnership('marriage-unknown-varangr-founders'),
    partnership('marriage-loki-brigid-varangr'),
    partnership('marriage-fridleif-oystein-varangr'),
    partnership('marriage-holmdis-odvaldr-wargh'),
    partnership('marriage-steinar-arnborg-varangr', { status: 'ended', end: '1605' }),
    partnership('marriage-kjellfrid-einar-varangr', { status: 'ended', end: '1601' }),
    partnership('marriage-ringstad-helga-varangr', { status: 'ended', end: '1629' }),
    partnership('marriage-torvald-gulda-varangr', { status: 'ended', end: '1646' }),
    partnership('marriage-elisef-balgruuf-varangr', { status: 'ended', end: '1627' }),
    partnership('marriage-egil-svanhildr-ragnulf', { status: 'ended', end: '1649' }),
    partnership('marriage-hjalti-ormhild-schwarzdorn', { status: 'ended', end: '1633' }),
    partnership('marriage-ingemar-camilla-varangr', { status: 'ended', end: '1641' }),
    partnership('marriage-vanadis-drengur-varangr', { status: 'ended', end: '1641' }),
    partnership('marriage-jerrik-quolga-varangr', { status: 'ended', end: '1639' }),
    partnership('marriage-marduk-kenhild-varangr', { status: 'ended', end: '1639' }),
    partnership('marriage-frideborg-galvar-varangr', { status: 'ended', end: '1671' }),
    alignPartnerOverChildren(partnership('marriage-fannar-islaug-varangr', { status: 'ended', end: '1641' }), 'islaug-vragi'),
    alignPartnerOverChildren(partnership('affair-fannar-dagmar-varangr', {
      type: 'affair',
      status: 'ended',
      end: '1641',
      visibility: 'private'
    }), 'dagmar'),
    partnership('marriage-asahel-ingthor-brathfengr', { status: 'ended', end: '1694' }),
    partnership('marriage-zarek-flavia-varangr', { status: 'ended', end: '1659' }),
    partnership('marriage-ulrik-moira-varangr', { status: 'ended', end: '1669' }),
    partnership('marriage-magdis-trianne-varangr'),
    partnership('marriage-hadvar-ingeborg-varangr', { status: 'ended', end: '1713' }),
    partnership('marriage-ullrun-oddgeir-varangr'),
    partnership('marriage-eldgrim-milfgun-varangr', { status: 'ended', end: '1700' }),
    partnership('marriage-baldvin-rualainn-varangr', { status: 'ended', end: '1704' }),
    partnership('marriage-siglif-inghtor-skogg', { status: 'ended', end: '1720' }),
    partnership('marriage-othrik-innozentia-varangr', { status: 'ended', end: '1729' }),
    partnership('marriage-envor-traolach-varangr'),
    partnership('marriage-lythar-fenhild-varangr', { status: 'ended' }),
    partnership('marriage-fostine-styrbjorn-varangr'),
    partnership('marriage-valran-serana-varangr', { status: 'ended' }),
    partnership('marriage-hakon-brynhildr-varangr'),
    partnership('marriage-frida-rolfur-varangr'),
    alignChildGroupBelowParentPair(
      clearPartnerOverChildrenAlignment(
        partnership('marriage-rorik-gisrun-varangr', { status: 'ended', end: '1720' })
      )
    ),
    alignPartnerOverChildren(partnership('affair-rorik-urd-varangr', {
      type: 'affair',
      status: 'ended',
      end: '1720',
      visibility: 'private'
    }), 'urd'),
    partnership('marriage-erna-njvar-varangr'),
    partnership('marriage-skule-dagrun-varangr'),
    partnership('marriage-brandur-aslaug-varangr'),
    partnership('marriage-iseld-tjodmar-varangr'),
    alignPartnerOverChildren(partnership('marriage-andor-askla-varangr'), 'askla-blutstahl'),
    alignPartnerOverChildren(partnership('affair-andor-line-varangr', {
      type: 'affair',
      visibility: 'private'
    }), 'line'),
    clearPartnerOverChildrenAlignment(partnership('affair-ingmar-vefa-varangr', {
      type: 'affair',
      visibility: 'private'
    })),
    partnership('marriage-gudrun-ingmund-ragnulf'),
    partnership('marriage-ingulf-unknown-varangr')
  ],
  parentages: [
    ...childrenOf(['loki-varangr'], 'marriage-unknown-varangr-founders', {
      certainty: 'confirmed',
      notes: 'Die Quelle zeigt Loki als Kind zweier namentlich unbekannter Eltern.'
    }),
    ...claimedChildren(['fridleif-varangr', 'odvaldr-varangr'], 'marriage-loki-brigid-varangr', 'gap-loki-odvaldr-varangr'),
    ...claimedChildren(['steinar-varangr', 'kjellfrid-varangr', 'ringstad-varangr'], 'marriage-holmdis-odvaldr-wargh', 'gap-odvaldr-steinar-varangr'),
    ...childrenOf(
      ['torvald-1585-varangr', 'elisef-1592-varangr', 'svanhildr-varangr', 'porsdal-varangr'],
      'marriage-steinar-arnborg-varangr'
    ),
    ...childrenOf(['hjalti-varangr'], 'marriage-ringstad-helga-varangr'),
    ...childrenOf(
      ['ingemar-1606-varangr', 'vanadis-varangr', 'jerrik-varangr', 'marduk-varangr'],
      'marriage-torvald-gulda-varangr',
      { notes: 'Die Kinderüberschrift nennt eine unbekannte Mutter; die unmittelbar zuvor eingetragene Ehefrau Gulda wird als Mutter verwendet. Der Quellenwiderspruch bleibt dokumentiert.' }
    ),
    ...childrenOf(['frideborg-varangr', 'fannar-varangr'], 'marriage-hjalti-ormhild-schwarzdorn'),
    ...childrenOf(['ingthor-varangr', 'thorir-varangr'], 'marriage-ingemar-camilla-varangr'),
    ...childrenOf(['zarek-varangr', 'sigmund-varangr'], 'marriage-jerrik-quolga-varangr'),
    ...childrenOf(['reidar-varangr', 'ulrik-varangr'], 'marriage-marduk-kenhild-varangr'),
    ...childrenOf(['magdis-varangr'], 'marriage-fannar-islaug-varangr'),
    ...childrenOf(['dvalin-varangr'], 'affair-fannar-dagmar-varangr', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Dvalin entstammt ausschließlich Fannars Affäre mit Dagmar.'
    }),
    ...childrenOf(['hadvar-varangr', 'ullrun-varangr'], 'marriage-asahel-ingthor-brathfengr'),
    ...childrenOf(['eldgrim-varangr'], 'marriage-zarek-flavia-varangr'),
    ...childrenOf(['egil-varangr', 'baldvin-varangr'], 'marriage-ulrik-moira-varangr'),
    ...childrenOf(['othrik-varangr', 'envor-varangr'], 'marriage-hadvar-ingeborg-varangr'),
    ...childrenOf(['inghtor-varangr'], 'marriage-hadvar-ingeborg-varangr', {
      certainty: 'probable',
      notes: 'Die Skogg-Gegenakte kennt Inghtor Varangr; seine zeitlich passende Einordnung als weiterer Sohn Hadvars ist wahrscheinlich, in der Varangr-Alttafel jedoch ausgelassen.'
    }),
    ...childrenOf(['lythar-varangr'], 'marriage-eldgrim-milfgun-varangr'),
    ...childrenOf(['fostine-varangr', 'valran-varangr'], 'marriage-baldvin-rualainn-varangr'),
    ...childrenOf(
      ['hakon-varangr', 'frida-varangr', 'rorik-varangr', 'erna-varangr', 'skule-varangr'],
      'marriage-othrik-innozentia-varangr'
    ),
    ...childrenOf(['brandur-varangr'], 'marriage-lythar-fenhild-varangr'),
    ...childrenOf(['iseld-varangr', 'andor-varangr'], 'marriage-valran-serana-varangr'),
    ...childrenOf(
      ['ingmar-varangr', 'ingmund-varangr', 'ingemar-1718-varangr', 'inga-varangr', 'ingulf-varangr'],
      'marriage-hakon-brynhildr-varangr',
      { notes: 'Die Kinderüberschrift nennt Hakons Partnerin als unbekannt, obwohl direkt zuvor Brynhildr Goldglanz als Ehefrau steht. Die zusammenhängende Ehe wird übernommen und der Widerspruch dokumentiert.' }
    ),
    ...childrenOf(['fjalar-varangr', 'olesja-varangr'], 'marriage-rorik-gisrun-varangr'),
    ...childrenOf(['torvald-1721-varangr'], 'affair-rorik-urd-varangr', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Torvald entstammt ausschließlich Röriks Affäre mit Urd.'
    }),
    ...childrenOf(['fjori-varangr', 'tanja-varangr'], 'marriage-skule-dagrun-varangr'),
    ...childrenOf(['sverre-varangr', 'portha-varangr'], 'marriage-brandur-aslaug-varangr'),
    ...childrenOf(['olav-varangr', 'svanja-varangr'], 'marriage-andor-askla-varangr'),
    ...childrenOf(['elisef-1728-varangr'], 'affair-andor-line-varangr', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Elisef entstammt ausschließlich Andors Affäre mit Line.'
    }),
    ...childrenOf(['jens-varangr', 'nils-varangr'], 'affair-ingmar-vefa-varangr', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Jens und Nils entstammen ausschließlich Ingmars Affäre mit Vefa.'
    }),
    ...childrenOf(['oran-varangr', 'malin-varangr'], 'marriage-gudrun-ingmund-ragnulf')
  ],
  cadetBranches: [
    marriedAway('married-away-kjellfrid-varangr-silberblut', 'Clan Silberblut', 'marriage-kjellfrid-einar-varangr', 'house-silberblut', 'haus-silberblut', HOUSE_EMBLEMS.silberblut),
    marriedAway('married-away-elisef-varangr-vaeren', 'Clan Vaeren', 'marriage-elisef-balgruuf-varangr', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-svanhildr-varangr-ragnulf', 'Clan Ragnulf', 'marriage-egil-svanhildr-ragnulf', 'house-ragnulf', 'haus-ragnulf', HOUSE_EMBLEMS.ragnulf),
    marriedAway('married-away-vanadis-varangr-feuerherz', 'Clan Feuerherz', 'marriage-vanadis-drengur-varangr', 'house-feuerherz', 'haus-feuerherz', HOUSE_EMBLEMS.feuerherz),
    marriedAway('married-away-frideborg-varangr-kaltherz', 'Clan Kaltherz', 'marriage-frideborg-galvar-varangr', 'house-kaltherz', 'haus-kaltherz', HOUSE_EMBLEMS.kaltherz),
    marriedAway('married-away-magdis-varangr-eldath', 'Haus Eldath', 'marriage-magdis-trianne-varangr', 'house-eldath', 'haus-eldath'),
    marriedAway('married-away-ullrun-varangr-goldschwur', 'Clan Goldschwur', 'marriage-ullrun-oddgeir-varangr', 'house-goldschwur', 'haus-goldschwur', HOUSE_EMBLEMS.goldschwur),
    marriedAway('married-away-envor-varangr-ronain', 'Clan Rónáin', 'marriage-envor-traolach-varangr', 'house-ronain', 'haus-ronain'),
    marriedAway('married-away-fostine-varangr-schwarzblut', 'Clan Schwarzblut', 'marriage-fostine-styrbjorn-varangr', 'house-schwarzblut', 'haus-schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    marriedAway('married-away-frida-varangr-feuerherz', 'Clan Feuerherz', 'marriage-frida-rolfur-varangr', 'house-feuerherz', 'haus-feuerherz', HOUSE_EMBLEMS.feuerherz),
    marriedAway('married-away-erna-varangr-kaltherz', 'Clan Kaltherz', 'marriage-erna-njvar-varangr', 'house-kaltherz', 'haus-kaltherz', HOUSE_EMBLEMS.kaltherz),
    marriedAway('married-away-iseld-varangr-vragi', 'Clan Vragi', 'marriage-iseld-tjodmar-varangr', 'house-vragi', 'haus-vragi', HOUSE_EMBLEMS.vragi),
    wardAway('ward-away-ingulf-varangr-skogg', 'Clan Skogg', 'ingulf-varangr', 'house-skogg', 'haus-skogg')
  ],
  timeJumps: [
    timeJump(
      'gap-loki-odvaldr-varangr',
      'marriage-loki-brigid-varangr',
      ['fridleif-varangr', 'odvaldr-varangr']
    ),
    timeJump(
      'gap-odvaldr-steinar-varangr',
      'marriage-holmdis-odvaldr-wargh',
      ['steinar-varangr', 'kjellfrid-varangr', 'ringstad-varangr'],
      '????',
      '1562'
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-loki-brigid-varangr',
    houseId: VARANGR_HOUSE_ID,
    crestSubtitle: 'Jarlsclan von Krähenmoor · Sitz Moortal',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-father-varangr',
    orientation: 'vertical',
    ancestorDepth: 28,
    descendantDepth: 28,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 7,
    registryTombstones: {
      persons: [
        'unknown-wife-ingemar-varangr',
        'unknown-spouse-inga-varangr'
      ],
      partnerships: [
        'marriage-ingemar-unknown-varangr',
        'marriage-inga-unknown-varangr'
      ],
      cadetBranches: ['married-away-inga-varangr-unknown']
    },
    sourceModule: 'Clan Varangr (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Varangr-Stammbaum wird ohne Personenfokus von Lokis unbekannten Eltern bis zur jüngsten Generation des Jahres 1740 gezeigt. Loki ist der ausdrücklich benannte Gründer; der Hausknoten hängt direkt unter Loki und Brigid Mac Corcaigh. Zwei Quellenlücken werden als strikt serielle absolute Generationentrenner umgesetzt. Torvalds Kinder werden der unmittelbar zuvor genannten Ehe mit Gulda Goldglanz zugeordnet, obwohl die Kinderüberschrift die Mutter als unbekannt bezeichnet. Dasselbe gilt für Hakons Kinder und Brynhildr Goldglanz. Inghtor Varangr und seine Ehe mit Siglíf Skogg stammen aus der neueren Skogg-Gegenakte; seine zeitlich passende Elternschaft unter Hadvar und Ingeborg ist wahrscheinlich, in der Varangr-Alttafel aber ausgelassen und daher nicht als sicher markiert. Die Quellvarianten Haakon/Hakon, Valron/Valran, Adnor/Andor und „Fri da“/Frida werden vereinheitlicht. Die Herrscherliste schreibt Othriks Amtszeit offenkundig als 1713–1629; anhand seines Todesjahres wird 1729 verwendet. Frideborgs Todesjahr wird anhand der ausgearbeiteten Kaltherz-Gegenakte auf 1671 präzisiert. Magdis Varangr und Trianne Eldath werden wie überliefert als Ehepaar geführt. Fannar, Rörik und Andor stehen bei ihren gemischten Ehe-/Affärengruppen zwischen den jeweiligen Partnerinnen; die Mütter bleiben über den eindeutig zugeordneten Kindergruppen. Bei Rörik und Gisrun sowie bei Ingmar und Vefa gehen die Kinderleitungen als normale Paarleitungen aus der Mitte beider Eltern hervor. Ingulfs Mündelknoten steht senkrecht direkt unter ihm. Svanhildr erhält wegen des nachweislich falschen Quellbildes die weibliche Standardsilhouette. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'secondarySeats',
      'liegeHouseId',
      'liegeHouseName',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath']
  }
});
