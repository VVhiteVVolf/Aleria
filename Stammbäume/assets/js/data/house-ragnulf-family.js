import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { AELDRUNMAR_HOUSE_EMBLEMS } from './aeldrunmar-house-profiles.js';
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
import { HOUSE_RAGNULF_PORTRAITS } from './house-ragnulf-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const RAGNULF_HOUSE_ID = 'house-ragnulf';

const HOUSE_EMBLEMS = Object.freeze({
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf,
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  estmere: AELDRUNMAR_HOUSE_EMBLEMS.estmere,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  helgr: SCHWARZFENN_HOUSE_EMBLEMS.helgr,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  todbrand: SCHWARZFENN_HOUSE_EMBLEMS.todbrand,
  graumahne: SCHWARZFENN_HOUSE_EMBLEMS.graumahne,
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  hrafn: SCHWARZFENN_HOUSE_EMBLEMS.hrafn,
  arnvild: SCHWARZFENN_HOUSE_EMBLEMS.arnvild
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
  'freki-ragnulf',
  'thorkel-ancient-ragnulf',
  'einarr-ragnulf',
  'egil-ragnulf',
  'eldgrim-ragnulf',
  'oddvar-ragnulf',
  'throst-ragnulf',
  'thorald-ragnulf',
  'gunnar-ragnulf'
]);

const MAINLINE_IDS = new Set(['bjolf-ragnulf']);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? RAGNULF_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_RAGNULF_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === RAGNULF_HOUSE_ID ? 'core' : 'married'),
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
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-ragnulf--${id}`),
    houseId,
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function affair(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-ragnulf--${id}`),
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
    tags: [...(options.tags || []), options.engaged ? 'Wegverlobt' : 'Wegverheiratet']
  });
}

function receivedWard(id, name, sex, birth, houseId, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    houseId,
    familyRole: 'ward',
    lineageRole: 'branch',
    title: options.title || 'Aufgenommenes Mündel des Clans Ragnulf',
    tags: [...(options.tags || []), 'Mündel', 'Aufgenommen']
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
  unknownFounders: ['unknown-father-ragnulf', 'unknown-mother-ragnulf'],
  freki: ['freki-ragnulf', 'aoife-dubhfenn'],
  thorkelAncient: ['thorkel-ancient-ragnulf', 'alfhild-graumahne'],
  gudridAncient: ['balgruuf-vaeren', 'gudrid-ancient-ragnulf'],
  aslaug: ['torger-varulv', 'aslaug-ragnulf'],
  einarr: ['einarr-ragnulf', 'bergdis-arnvild'],
  egil: ['egil-ragnulf', 'svanhildr-varangr'],
  estrid: ['raveld-blutstahl', 'estrid-ragnulf'],
  bergtor: ['bergtor-ragnulf', 'hjordis-schattenherz'],
  ketill: ['ketill-ragnulf', 'ingunn-feuerherz'],
  eldgrim: ['eldgrim-ragnulf', 'hildegard-kaltherz'],
  oddvar: ['oddvar-ragnulf', 'sigfuss'],
  oddvarAffair: ['oddvar-ragnulf', 'lofn'],
  thurid: ['araldr-vragi', 'thurid-ragnulf'],
  gudrid: ['hakon-hrafn', 'gudrid-1630-ragnulf'],
  throst: ['throst-ragnulf', 'ketilrun'],
  torleif: ['torleif-ragnulf', 'tordis-ragnulf'],
  thoraldAethelflaed: ['thorald-ragnulf', 'aethelflaed-estmere'],
  thoraldDrifa: ['thorald-ragnulf', 'drifa'],
  hervor: ['rognstein-hrafn', 'hervor-ragnulf'],
  gersemi: ['gunnvald-todbrand', 'gersemi-ragnulf'],
  thrain: ['thrain-ragnulf', 'asfrid-helgr'],
  gunnar: ['ranveig-wargh', 'gunnar-ragnulf'],
  gulvar: ['gulvar-ragnulf', 'eydis-vaeren'],
  gulda: ['bjoern-skald', 'gulda-ragnulf'],
  gudrun: ['ingmund-varangr', 'gudrun-ragnulf'],
  erna: ['jokul-graumahne', 'erna-ragnulf'],
  odvald: ['odvald-ragnulf', 'hildrun-schmetterschild']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-unknown-ragnulf-founders': COUPLES.unknownFounders,
  'marriage-freki-aoife-ragnulf': COUPLES.freki,
  'marriage-thorkel-alfhild-ragnulf': COUPLES.thorkelAncient,
  'marriage-gudrid-balgruuf-ragnulf': COUPLES.gudridAncient,
  'marriage-torger-aslaug-varulv': COUPLES.aslaug,
  'marriage-einarr-bergdis-ragnulf': COUPLES.einarr,
  'marriage-egil-svanhildr-ragnulf': COUPLES.egil,
  'marriage-estrid-raveld-ragnulf': COUPLES.estrid,
  'engagement-bergtor-hjordis-ragnulf': COUPLES.bergtor,
  'marriage-ketill-ingunn-ragnulf': COUPLES.ketill,
  'marriage-eldgrim-hildegard-ragnulf': COUPLES.eldgrim,
  'marriage-oddvar-sigfuss-ragnulf': COUPLES.oddvar,
  'affair-oddvar-lofn-ragnulf': COUPLES.oddvarAffair,
  'marriage-thurid-araldr-ragnulf': COUPLES.thurid,
  'marriage-gudrid-hakon-ragnulf': COUPLES.gudrid,
  'marriage-throst-ketilrun-ragnulf': COUPLES.throst,
  'marriage-torleif-tordis-ragnulf': COUPLES.torleif,
  'marriage-thorald-aethelflaed-ragnulf': COUPLES.thoraldAethelflaed,
  'marriage-thorald-drifa-ragnulf': COUPLES.thoraldDrifa,
  'marriage-hervor-rognstein-ragnulf': COUPLES.hervor,
  'marriage-gersemi-gunnvald-ragnulf': COUPLES.gersemi,
  'marriage-thrain-asfrid-ragnulf': COUPLES.thrain,
  'marriage-ranveig-gunnar-wargh': COUPLES.gunnar,
  'marriage-gulvar-eydis-ragnulf': COUPLES.gulvar,
  'engagement-bjoern-gulda-skald': COUPLES.gulda,
  'marriage-gudrun-ingmund-ragnulf': COUPLES.gudrun,
  'marriage-erna-jokul-ragnulf': COUPLES.erna,
  'marriage-odvald-hildrun-ragnulf': COUPLES.odvald
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

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'ragnulf-parentage',
    ...options
  });
}

function fosterChildren(childIds, guardianId, notes) {
  return createParentages(childIds, [guardianId], '', {
    idPrefix: 'ragnulf-foster-parentage',
    type: 'foster',
    legitimacy: 'unknown',
    notes
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

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '', subtitle = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: subtitle || `Wegverheiratet an ${name}`,
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

export const HOUSE_RAGNULF_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ragnulf',
    title: 'Clan Ragnulf',
    motto: '',
    description: 'Jarlsclan von Schwarzfenn und Herren von Wolfsklamm. Die Ragnulf führen ihre Herkunft auf den alten Ulfr-Clan zurück und prägten die Einigung der Norrnaigh und Glaennath.',
    emblem: HOUSE_EMBLEMS.ragnulf,
    houseProfile: ALDRIMAR_HOUSE_PROFILES.ragnulf
  },
  houses: [
    house(RAGNULF_HOUSE_ID, 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-dubhfenn', 'Clan Dubhfenn'),
    house('house-graumahne', 'Clan Graumähne', HOUSE_EMBLEMS.graumahne),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-arnvild', 'Clan Arnvild', HOUSE_EMBLEMS.arnvild),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-blutstahl', 'Clan Blutstahl'),
    house('house-schattenherz', 'Clan Schattenherz'),
    house('house-feuerherz', 'Clan Feuerherz'),
    house('house-kaltherz', 'Clan Kaltherz'),
    house('house-vragi', 'Clan Vragi'),
    house('house-hrafn', 'Clan Hrafn', HOUSE_EMBLEMS.hrafn),
    house('house-estmere', 'Haus Estmere', HOUSE_EMBLEMS.estmere),
    house('house-todbrand', 'Clan Todbrand', HOUSE_EMBLEMS.todbrand),
    house('house-helgr', 'Clan Helgr', HOUSE_EMBLEMS.helgr),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg)
  ],
  persons: [
    person('unknown-father-ragnulf', '???', 'male', '????', '????', {
      title: 'Unbekannter Vater Frekis',
      notes: 'Die Quelle nennt Frekis Eltern nicht.'
    }),
    person('unknown-mother-ragnulf', '???', 'female', '????', '????', {
      title: 'Unbekannte Mutter Frekis',
      notes: 'Die Quelle nennt Frekis Eltern nicht.'
    }),
    person('freki-ragnulf', 'Freki Ragnulf', 'male', '????', '????', {
      title: 'Gründer und erster überlieferter Jarl des Clans Ragnulf'
    }),
    spouse('aoife-dubhfenn', 'Aoife Dubhfenn', 'female', '????', '????', 'house-dubhfenn'),

    person('thorkel-ancient-ragnulf', 'Thorkel Ragnulf', 'male', '????', '????', {
      title: 'Jarl des Clans Ragnulf'
    }),
    awayWoman('gudrid-ancient-ragnulf', 'Gudrid Ragnulf', '????', '????', 'Clan Vaeren'),
    spouse('alfhild-graumahne', 'Alfhild Graumähne', 'female', '????', '????', 'house-graumahne'),
    spouse('balgruuf-vaeren', 'Balgruuf der Ältere Vaeren', 'male', '????', '????', 'house-vaeren'),

    awayWoman('aslaug-ragnulf', 'Aslaug Ragnulf', '1559', '1625', 'Clan Varulv'),
    person('einarr-ragnulf', 'Einarr Ragnulf', 'male', '1562', '1621', {
      title: 'Jarl des Clans Ragnulf'
    }),
    spouse('torger-varulv', 'Torger Varulv', 'male', '1554', '1600', 'house-varulv', {
      title: 'Jarl von Roriksheim'
    }),
    spouse('bergdis-arnvild', 'Bergdis Arnvild', 'female', '????', '????', 'house-arnvild'),

    person('egil-ragnulf', 'Egil Ragnulf', 'male', '1588', '1649', {
      title: 'Jarl des Clans Ragnulf von 1621 bis 1649'
    }),
    awayWoman('estrid-ragnulf', 'Estrid Ragnulf', '1588', '1655', 'Clan Blutstahl'),
    spouse('svanhildr-varangr', 'Svanhildr Varangr', 'female', '1590', '1671', 'house-varangr'),
    spouse('raveld-blutstahl', 'Raveld Blutstahl', 'male', '1586', '1628', 'house-blutstahl'),

    person('bergtor-ragnulf', 'Bergtor Ragnulf', 'male', '1607', '1628'),
    person('ketill-ragnulf', 'Ketill Ragnulf', 'male', '1608', '1645'),
    person('hoskuld-ragnulf', 'Hoskuld Ragnulf', 'male', '1609', '1637'),
    person('eldgrim-ragnulf', 'Eldgrim Ragnulf', 'male', '1610', '1660', {
      title: 'Jarl des Clans Ragnulf von 1649 bis 1660'
    }),
    spouse('hjordis-schattenherz', 'Hjördis Schattenherz', 'female', '1610', '1701', 'house-schattenherz', {
      title: 'Verlobte Bergtors'
    }),
    spouse('ingunn-feuerherz', 'Ingunn Feuerherz', 'female', '1611', '1685', 'house-feuerherz'),
    spouse('hildegard-kaltherz', 'Hildegard Kaltherz', 'female', '1612', '1698', 'house-kaltherz'),

    person('oddvar-ragnulf', 'Oddvar Ragnulf', 'male', '1631', '1695', {
      title: 'Jarl des Clans Ragnulf von 1660 bis 1695'
    }),
    awayWoman('thurid-ragnulf', 'Thurid Ragnulf', '1634', '????', 'Clan Vragi'),
    awayWoman('gudrid-1630-ragnulf', 'Gudrid Ragnulf', '1630', '1712', 'Clan Hrafn'),
    spouse('sigfuss', 'Sigfuss', 'female', '1635', '????', '', {
      title: 'Ehefrau Oddvars',
      notes: 'Die Quelle ordnet Sigfuss ausdrücklich als Oddvars Ehefrau und Mutter dreier Kinder ein und zeigt eine Frauensilhouette. Der gewöhnlich männlich gelesene Name bleibt als Quellenwiderspruch dokumentiert.'
    }),
    affair('lofn', 'Lofn', 'female', '1641', '????', '', { title: 'Affäre Oddvars' }),
    spouse('araldr-vragi', 'Araldr Vragi', 'male', '1629', '1681', 'house-vragi'),
    spouse('hakon-hrafn', 'Hakon Hrafn', 'male', '1630', '1704', 'house-hrafn'),

    person('throst-ragnulf', 'Throst Ragnulf', 'male', '1653', '1717', {
      title: 'Jarl des Clans Ragnulf von 1695 bis 1717'
    }),
    person('thorkel-1654-ragnulf', 'Thorkel Ragnulf', 'male', '1654', '????', {
      title: 'Herdwächter · dauerhaft ledig'
    }),
    person('torleif-ragnulf', 'Torleif Ragnulf', 'male', '1656', '????', {
      extensions: {
        chartPartnerMirrorForPartnershipIds: ['marriage-torleif-tordis-ragnulf'],
        registryManagedExtensionFields: ['chartPartnerMirrorForPartnershipIds']
      }
    }),
    person('tordis-ragnulf', 'Tordis Ragnulf', 'female', '1657', '????', {
      familyRole: 'bastard',
      tags: ['Bastard'],
      notes: 'Tordis ist Oddvars Bastardtochter mit Lofn und zugleich mit ihrem Halbbruder Torleif verheiratet. Ihre Partnerkarte wird am fortgeführten Zweig kontrolliert wiederholt; es entsteht keine zweite Weltperson.',
      extensions: {
        chartRepeatForPartnershipIds: ['marriage-torleif-tordis-ragnulf'],
        registryManagedExtensionFields: ['chartRepeatForPartnershipIds']
      }
    }),
    person('torstein-ragnulf', 'Torstein Ragnulf', 'male', '1660', '????', {
      familyRole: 'bastard',
      tags: ['Bastard']
    }),
    spouse('ketilrun', 'Ketilrun', 'female', '1655', '1736'),

    person('thorald-ragnulf', 'Thorald Ragnulf', 'male', '1674', '1733', {
      title: 'Jarl des Clans Ragnulf von 1717 bis 1733',
      extensions: {
        chartCenterBetweenSpousePersonIds: ['aethelflaed-estmere', 'drifa'],
        registryManagedExtensionFields: ['chartCenterBetweenSpousePersonIds']
      }
    }),
    awayWoman('hervor-ragnulf', 'Hervor Ragnulf', '1677', '', 'Clan Hrafn'),
    awayWoman('gersemi-ragnulf', 'Gersemi Ragnulf', '1675', '', 'Clan Todbrand'),
    person('thrain-ragnulf', 'Thrain Ragnulf', 'male', '1677', '', {
      title: 'Hof- und Ratsmitglied König Rags · Mentor Gunnars und Gulvars'
    }),
    spouse('aethelflaed-estmere', 'Aethelflaed Estmere', 'female', '1679', '1708', 'house-estmere', {
      title: 'Erste Ehefrau Thoralds',
      notes: 'Aethelflaed wurde von Nordmännern entführt und von Thorald für tot erklärt; die genealogische Tabelle nennt 1708 als Todesjahr.'
    }),
    spouse('drifa', 'Drifa', 'female', '1690', '', '', { title: 'Zweite Ehefrau Thoralds' }),
    spouse('rognstein-hrafn', 'Rognstein Hrafn', 'male', '1673', '', 'house-hrafn'),
    spouse('gunnvald-todbrand', 'Gunnvald Todbrand', 'male', '1674', '', 'house-todbrand'),
    spouse('asfrid-helgr', 'Asfrid Helgr', 'female', '1679', '', 'house-helgr'),

    person('gunnar-ragnulf', 'Gunnar Ragnulf', 'male', '1699', '', {
      title: 'Jarl von Schwarzfenn seit 1733'
    }),
    person('gulvar-ragnulf', 'Gulvar Ragnulf', 'male', '1701', '', {
      title: 'Zweiter Erbe · ambitionierter Herausforderer Gunnars'
    }),
    awayWoman('gulda-ragnulf', 'Gulda Ragnulf', '1710', '', 'Clan Skald', {
      engaged: true,
      title: 'Wegverlobt an Clan Skald'
    }),
    awayWoman('gudrun-ragnulf', 'Gudrun Ragnulf', '1714', '', 'Clan Varangr'),
    awayWoman('erna-ragnulf', 'Erna Ragnulf', '1697', '', 'Clan Graumähne'),
    person('odvald-ragnulf', 'Odvald Ragnulf', 'male', '1701', '', {
      title: 'Pflichtbewusster Sohn Thrains'
    }),
    spouse('ranveig-wargh', 'Ranveig Wargh', 'female', '1702', '', 'house-wargh'),
    spouse('eydis-vaeren', 'Eydis Vaeren', 'female', '1702', '', 'house-vaeren'),
    spouse('bjoern-skald', 'Bjoern Skald', 'male', '1712', '', 'house-skald', {
      title: 'Verlobter Guldas'
    }),
    spouse('ingmund-varangr', 'Ingmund Varangr', 'male', '1712', '', 'house-varangr'),
    spouse('jokul-graumahne', 'Jokul Graumähne', 'male', '1693', '', 'house-graumahne'),
    spouse('hildrun-schmetterschild', 'Hildrun Schmetterschild', 'female', '1703', '', 'house-schmetterschild'),

    person('bjolf-ragnulf', 'Bjölf Ragnulf', 'male', '1725', '', {
      title: 'Erbe des Clans Ragnulf'
    }),
    receivedWard('tinna-kummerherz', 'Tinna Kummerherz', 'female', '1724', 'house-kummerherz', {
      title: 'Aufgenommenes Mündel Gunnar Ragnulfs'
    }),
    sentWard('erik-ragnulf', 'Erik Ragnulf', 'male', '1723', '', 'Clan Skogg', {
      title: 'Leiblicher Sohn Gulvars und Eydis’ · Mündel bei Clan Skogg'
    }),
    person('astrid-ragnulf', 'Astrid Ragnulf', 'female', '1726', ''),
    person('bjarte-ragnulf', 'Bjarte Ragnulf', 'male', '1721', ''),
    person('katla-ragnulf', 'Katla Ragnulf', 'female', '1723', ''),
    person('roff-ragnulf', 'Roff Ragnulf', 'male', '1729', '')
  ],
  partnerships: [
    partnership('marriage-unknown-ragnulf-founders'),
    partnership('marriage-freki-aoife-ragnulf'),
    partnership('marriage-thorkel-alfhild-ragnulf'),
    partnership('marriage-gudrid-balgruuf-ragnulf'),
    partnership('marriage-torger-aslaug-varulv'),
    partnership('marriage-einarr-bergdis-ragnulf'),
    partnership('marriage-egil-svanhildr-ragnulf'),
    partnership('marriage-estrid-raveld-ragnulf'),
    partnership('engagement-bergtor-hjordis-ragnulf', { type: 'engagement', status: 'ended', end: '1628' }),
    partnership('marriage-ketill-ingunn-ragnulf', { status: 'ended', end: '1645' }),
    partnership('marriage-eldgrim-hildegard-ragnulf', { status: 'ended', end: '1660' }),
    alignPartnerOverChildren(partnership('marriage-oddvar-sigfuss-ragnulf', { status: 'ended', end: '1695' }), 'sigfuss'),
    alignPartnerOverChildren(partnership('affair-oddvar-lofn-ragnulf', {
      type: 'affair',
      status: 'ended',
      visibility: 'private'
    }), 'lofn'),
    partnership('marriage-thurid-araldr-ragnulf', { status: 'ended', end: '1681' }),
    partnership('marriage-gudrid-hakon-ragnulf', { status: 'ended', end: '1704' }),
    partnership('marriage-throst-ketilrun-ragnulf', { status: 'ended', end: '1717' }),
    partnership('marriage-torleif-tordis-ragnulf', { status: 'ended' }),
    alignPartnerOverChildren(partnership('marriage-thorald-aethelflaed-ragnulf', {
      status: 'ended',
      end: '1708',
      notes: 'Die erste Ehe endet mit Aethelflaeds Entführung und der in der Quelle verzeichneten Todeserklärung.'
    }), 'aethelflaed-estmere'),
    alignPartnerOverChildren(partnership('marriage-thorald-drifa-ragnulf', {
      status: 'ended',
      end: '1733'
    }), 'drifa'),
    partnership('marriage-hervor-rognstein-ragnulf'),
    partnership('marriage-gersemi-gunnvald-ragnulf'),
    partnership('marriage-thrain-asfrid-ragnulf'),
    partnership('marriage-ranveig-gunnar-wargh'),
    partnership('marriage-gulvar-eydis-ragnulf'),
    partnership('engagement-bjoern-gulda-skald', { type: 'engagement' }),
    partnership('marriage-gudrun-ingmund-ragnulf'),
    partnership('marriage-erna-jokul-ragnulf'),
    partnership('marriage-odvald-hildrun-ragnulf')
  ],
  parentages: [
    ...childrenOf(['freki-ragnulf'], 'marriage-unknown-ragnulf-founders', {
      certainty: 'probable',
      notes: 'Die Quelle zeigt Freki als Kind zweier unbekannter Eltern.'
    }),
    ...claimedChildren(
      ['thorkel-ancient-ragnulf', 'gudrid-ancient-ragnulf'],
      'marriage-freki-aoife-ragnulf',
      'gap-freki-thorkel-ragnulf'
    ),
    ...claimedChildren(
      ['aslaug-ragnulf', 'einarr-ragnulf'],
      'marriage-thorkel-alfhild-ragnulf',
      'gap-thorkel-einarr-ragnulf'
    ),
    ...childrenOf(['egil-ragnulf', 'estrid-ragnulf'], 'marriage-einarr-bergdis-ragnulf'),
    ...childrenOf(
      ['bergtor-ragnulf', 'ketill-ragnulf', 'hoskuld-ragnulf', 'eldgrim-ragnulf'],
      'marriage-egil-svanhildr-ragnulf'
    ),
    ...childrenOf(['oddvar-ragnulf', 'thurid-ragnulf'], 'marriage-ketill-ingunn-ragnulf'),
    ...childrenOf(['gudrid-1630-ragnulf'], 'marriage-eldgrim-hildegard-ragnulf', {
      certainty: 'probable',
      notes: 'Die Kinderüberschrift der Quelle schreibt ausdrücklich „Eldgrim?“ und markiert die Vaterschaft damit als unsicher.'
    }),
    ...childrenOf(
      ['throst-ragnulf', 'thorkel-1654-ragnulf', 'torleif-ragnulf'],
      'marriage-oddvar-sigfuss-ragnulf'
    ),
    ...childrenOf(['tordis-ragnulf', 'torstein-ragnulf'], 'affair-oddvar-lofn-ragnulf', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Tordis und Torstein entstammen ausschließlich Oddvars Affäre mit Lofn.'
    }),
    ...childrenOf(['thorald-ragnulf', 'hervor-ragnulf'], 'marriage-throst-ketilrun-ragnulf'),
    ...childrenOf(['gersemi-ragnulf', 'thrain-ragnulf'], 'marriage-torleif-tordis-ragnulf'),
    ...childrenOf(['gunnar-ragnulf', 'gulvar-ragnulf'], 'marriage-thorald-aethelflaed-ragnulf'),
    ...childrenOf(['gulda-ragnulf', 'gudrun-ragnulf'], 'marriage-thorald-drifa-ragnulf'),
    ...childrenOf(['erna-ragnulf', 'odvald-ragnulf'], 'marriage-thrain-asfrid-ragnulf'),
    ...childrenOf(['bjolf-ragnulf'], 'marriage-ranveig-gunnar-wargh'),
    ...fosterChildren(
      ['tinna-kummerherz'],
      'gunnar-ragnulf',
      'Tinna Kummerherz ist Gunnars aufgenommenes Mündel und kein leibliches Kind des Ehepaares Gunnar und Ranveig.'
    ),
    ...childrenOf(['erik-ragnulf', 'astrid-ragnulf'], 'marriage-gulvar-eydis-ragnulf'),
    ...childrenOf(['bjarte-ragnulf', 'katla-ragnulf', 'roff-ragnulf'], 'marriage-odvald-hildrun-ragnulf')
  ],
  cadetBranches: [
    marriedAway('married-away-gudrid-ragnulf-vaeren', 'Clan Vaeren', 'marriage-gudrid-balgruuf-ragnulf', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-aslaug-ragnulf-varulv', 'Clan Varulv', 'marriage-torger-aslaug-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-estrid-ragnulf-blutstahl', 'Clan Blutstahl', 'marriage-estrid-raveld-ragnulf', 'house-blutstahl', 'haus-blutstahl'),
    marriedAway('married-away-thurid-ragnulf-vragi', 'Clan Vragi', 'marriage-thurid-araldr-ragnulf', 'house-vragi', 'haus-vragi'),
    marriedAway('married-away-gudrid-ragnulf-hrafn', 'Clan Hrafn', 'marriage-gudrid-hakon-ragnulf', 'house-hrafn', 'haus-hrafn', HOUSE_EMBLEMS.hrafn),
    marriedAway('married-away-hervor-ragnulf-hrafn', 'Clan Hrafn', 'marriage-hervor-rognstein-ragnulf', 'house-hrafn', 'haus-hrafn', HOUSE_EMBLEMS.hrafn),
    marriedAway('married-away-gersemi-ragnulf-todbrand', 'Clan Todbrand', 'marriage-gersemi-gunnvald-ragnulf', 'house-todbrand', 'haus-todbrand', HOUSE_EMBLEMS.todbrand),
    marriedAway('engaged-away-gulda-ragnulf-skald', 'Clan Skald', 'engagement-bjoern-gulda-skald', 'house-skald', 'haus-skald', HOUSE_EMBLEMS.skald, 'Wegverlobt an Clan Skald'),
    marriedAway('married-away-gudrun-ragnulf-varangr', 'Clan Varangr', 'marriage-gudrun-ingmund-ragnulf', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-erna-ragnulf-graumahne', 'Clan Graumähne', 'marriage-erna-jokul-ragnulf', 'house-graumahne', 'haus-graumahne', HOUSE_EMBLEMS.graumahne),
    wardAway('ward-away-erik-ragnulf-skogg', 'Clan Skogg', 'erik-ragnulf', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg)
  ],
  timeJumps: [
    timeJump(
      'gap-freki-thorkel-ragnulf',
      'marriage-freki-aoife-ragnulf',
      ['thorkel-ancient-ragnulf', 'gudrid-ancient-ragnulf']
    ),
    timeJump(
      'gap-thorkel-einarr-ragnulf',
      'marriage-thorkel-alfhild-ragnulf',
      ['aslaug-ragnulf', 'einarr-ragnulf'],
      '????',
      '1559'
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-freki-aoife-ragnulf',
    houseId: RAGNULF_HOUSE_ID,
    crestSubtitle: 'Jarlsclan von Schwarzfenn · Sitz Wolfsklamm',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-father-ragnulf',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: 'Clan Ragnulf (bereitgestellte Altdaten)',
    sourceNote: 'Die vollständige Genealogie folgt der bereitgestellten Ragnulf-Hausseite. Freki ist der erste namentlich überlieferte Gründer; seine unbekannten Eltern bleiben sichtbar, ohne den Hausknoten zu übernehmen. Das Ragnulf-Wappen steht direkt unter Freki und Aoife Dubhfenn. Zwei Quellenlücken werden als strikt serielle absolute Generationentrenner umgesetzt. Torleif und seine Halbschwester Tordis sind dieselben Weltpersonen sowohl als Geschwister als auch als Ehepaar: Tordis bleibt als Bastardtochter direkt unter Oddvar und Lofn sichtbar, am fortgeführten Torleif-Zweig erscheint eine kontrollierte Partnerwiederholung und Torleif wird an Tordis’ Herkunftsstelle nur gespiegelt. Die Nachkommen werden einmalig unter Torleif und der wiederholten Tordis geführt. Oddvars legitime Kinder und seine Bastarde mit Lofn bleiben klar nach Mutter getrennt. Thorald steht zwischen seinen beiden legitimen Ehefrauen; Gunnar und Gulvar gehören ausschließlich zu Aethelflaed Estmere, Gulda und Gudrun ausschließlich zu Drifa. Die Gegenakten präzisieren Gulda und Bjoern als Verlobte sowie Erik als leiblichen Ragnulf-Sohn und fortgegebenes Mündel bei Clan Skogg. Tinna Kummerherz ist dagegen Gunnars aufgenommenes Mündel. Die Quelle markiert Gudrids Vaterschaft mit „Eldgrim?“ als unsicher und behandelt Sigfuss trotz des gewöhnlich männlich gelesenen Namens als Oddvars Ehefrau; beides wird transparent beibehalten. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
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
