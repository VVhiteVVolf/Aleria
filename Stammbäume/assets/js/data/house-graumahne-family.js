import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GRAUMAHNE_PORTRAITS } from './house-graumahne-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import {
  SCHWARZFENN_HOUSE_EMBLEMS,
  SCHWARZFENN_HOUSE_PROFILES
} from './schwarzfenn-house-profiles.js';

const GRAUMAHNE_HOUSE_ID = 'house-graumahne';

const HOUSE_EMBLEMS = Object.freeze({
  graumahne: SCHWARZFENN_HOUSE_EMBLEMS.graumahne,
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf,
  arnvild: SCHWARZFENN_HOUSE_EMBLEMS.arnvild,
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  todbrand: SCHWARZFENN_HOUSE_EMBLEMS.todbrand,
  hrafn: SCHWARZFENN_HOUSE_EMBLEMS.hrafn,
  helgr: SCHWARZFENN_HOUSE_EMBLEMS.helgr,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  silberzunge: IVARSHEIM_HOUSE_EMBLEMS.silberzunge
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
  'hrothgar-graumahne',
  'fjornir-graumahne',
  'thorlak-graumahne',
  'njall-1539-graumahne',
  'ulfar-graumahne',
  'arnljot-graumahne',
  'viglund-graumahne',
  'hogrand-graumahne',
  'helmskald-graumahne'
]);

const HEIR_IDS = new Set([
  'jokul-graumahne',
  'gunnvar-graumahne',
  'munnin-graumahne',
  'gunther-graumahne',
  'njall-1727-graumahne'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? GRAUMAHNE_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_GRAUMAHNE_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GRAUMAHNE_HOUSE_ID ? 'core' : 'married'),
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
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-graumahne--${id}`),
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function affair(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return spouse(id, name, sex, birth, death, houseId, {
    ...options,
    familyRole: 'affair',
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
  unknownParents: ['unknown-father-graumahne', 'unknown-mother-graumahne'],
  founders: ['hrothgar-graumahne', 'unknown-wife-hrothgar-graumahne'],
  fjornir: ['fjornir-graumahne', 'asdis-riesentot'],
  alfhild: ['thorkel-ancient-ragnulf', 'alfhild-graumahne'],
  thorlakSkalli: ['thorlak-graumahne', 'skalli-arnvild'],
  thorlakElinor: ['thorlak-graumahne', 'elinor-drewi-odryffyn'],
  njall: ['njall-1539-graumahne', 'hervor-schmetterschild'],
  skadi: ['sigurd-schmetterschild', 'skadi-graumahne'],
  asleikr: ['asleikr-graumahne', 'jorunn-kummerherz'],
  eyjolf: ['eyjolf-graumahne', 'steinnun-todbrand'],
  eyjolfAffair: ['eyjolf-graumahne', 'laufey'],
  ulfar: ['ulfar-graumahne', 'isbjorg-riesentot'],
  hallbera: ['inigmund-schwarzdorn', 'hallbera-graumahne'],
  ormulf: ['ormulf-graumahne', 'helga'],
  sjofn: ['urien-gwenyen-ogwych', 'sjofn-graumahne'],
  leinkir: ['leinkir-graumahne', 'torgunna-arnvild'],
  gyda: ['sigvard-schmetterschild', 'gyda-graumahne'],
  arnljot: ['arnljot-graumahne', 'svaldis-blutstahl'],
  katlin: ['vigtyr-kaltherz', 'katlin-graumahne'],
  gleipnir: ['gleipnir-graumahne', 'dagrun-skogg'],
  viglund: ['viglund-graumahne', 'signy-schmetterschild'],
  yrsa: ['hafgrim-schmetterschild', 'yrsa-graumahne'],
  svipdag: ['svipdag-graumahne', 'astrid'],
  hogrand: ['hogrand-graumahne', 'yngrid'],
  magndis: ['naddvar-kummerherz', 'magndis-graumahne'],
  hildessa: ['munthor-todbrand', 'hildessa-graumahne'],
  eylund: ['eylund-graumahne', 'vedis'],
  eylundAffair: ['eylund-graumahne', 'grimhildr'],
  helmskald: ['helmskald-graumahne', 'ljotunn-sterkr'],
  unndis: ['freyglod-hrafn', 'unndis-graumahne'],
  leifgard: ['leifgard-graumahne', 'ingkatla'],
  leifgardAffair: ['leifgard-graumahne', 'rigfrid'],
  urdis: ['eldfred-helgr', 'urdis-graumahne'],
  jokul: ['jokul-graumahne', 'erna-ragnulf'],
  gundel: ['sverrir-silberzunge', 'gundel-graumahne'],
  jofrid: ['glaumur-schmetterschild', 'jofrid-graumahne'],
  austmann: ['austmann-graumahne', 'orkatla']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-unknown-graumahne-parents': COUPLES.unknownParents,
  'marriage-hrothgar-unknown-graumahne': COUPLES.founders,
  'marriage-fjornir-asdis-graumahne': COUPLES.fjornir,
  'marriage-thorkel-alfhild-ragnulf': COUPLES.alfhild,
  'marriage-thorlak-skalli-graumahne': COUPLES.thorlakSkalli,
  'marriage-thorlak-elinor-graumahne': COUPLES.thorlakElinor,
  'marriage-njall-hervor-graumahne': COUPLES.njall,
  'marriage-skadi-sigurd-graumahne': COUPLES.skadi,
  'marriage-asleikr-jorunn-graumahne': COUPLES.asleikr,
  'marriage-steinnun-eyjolf-todbrand': COUPLES.eyjolf,
  'affair-eyjolf-laufey-graumahne': COUPLES.eyjolfAffair,
  'marriage-ulfar-isbjorg-graumahne': COUPLES.ulfar,
  'marriage-inigmund-hallbera-schwarzdorn': COUPLES.hallbera,
  'marriage-ormulf-helga-graumahne': COUPLES.ormulf,
  'marriage-sjofn-urien-graumahne': COUPLES.sjofn,
  'marriage-leinkir-torgunna-graumahne': COUPLES.leinkir,
  'marriage-gyda-sigvard-graumahne': COUPLES.gyda,
  'marriage-arnljot-svaldis-graumahne': COUPLES.arnljot,
  'marriage-katlin-vigtyr-graumahne': COUPLES.katlin,
  'marriage-dagrun-gleipnir-skogg': COUPLES.gleipnir,
  'marriage-viglund-signy-graumahne': COUPLES.viglund,
  'marriage-yrsa-hafgrim-graumahne': COUPLES.yrsa,
  'marriage-svipdag-astrid-graumahne': COUPLES.svipdag,
  'marriage-hogrand-yngrid-graumahne': COUPLES.hogrand,
  'marriage-magndis-naddvar-graumahne': COUPLES.magndis,
  'marriage-munthor-hildessa-todbrand': COUPLES.hildessa,
  'marriage-eylund-vedis-graumahne': COUPLES.eylund,
  'affair-eylund-grimhildr-graumahne': COUPLES.eylundAffair,
  'marriage-ljotunn-helmskald-sterkr': COUPLES.helmskald,
  'marriage-unndis-freyglod-graumahne': COUPLES.unndis,
  'marriage-leifgard-ingkatla-graumahne': COUPLES.leifgard,
  'affair-leifgard-rigfrid-graumahne': COUPLES.leifgardAffair,
  'marriage-eldfred-urdis-helgr': COUPLES.urdis,
  'marriage-erna-jokul-ragnulf': COUPLES.jokul,
  'marriage-sverrir-gundel-silberzunge': COUPLES.gundel,
  'marriage-jofrid-glaumur-graumahne': COUPLES.jofrid,
  'marriage-austmann-orkatla-graumahne': COUPLES.austmann
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignPartnerOverChildren(record, partnerPersonId, options = {}) {
  const managedExtensionFields = ['chartAlignPartnerOverChildrenPersonId'];
  if (options.reserveLeafChildLane) managedExtensionFields.push('chartReserveLeafChildLane');
  if (options.clearDescendantBranchLane) managedExtensionFields.push('chartReserveDescendantBranchLane');
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId,
      ...(options.reserveLeafChildLane ? { chartReserveLeafChildLane: true } : {}),
      registryManagedExtensionFields: managedExtensionFields
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'graumahne-parentage',
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

function timeJump(id, parentPartnershipId, sharedParentPartnershipIds, childIds, fromYear = '????', toYear = '????') {
  return {
    id,
    parentPartnershipId,
    sharedParentPartnershipIds,
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear,
    toYear,
    label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Ein einziger absoluter Generationentrenner führt ausschließlich Fjornirs und Asdis’ Hauptlinie fort; der wegverheiratete Alfhild-Zweig bleibt vollständig getrennt.',
    extensions: {}
  };
}

export const HOUSE_GRAUMAHNE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-graumahne',
    title: 'Clan Graumähne',
    motto: '',
    description: 'Hesirenclan von Schwarzfenn mit Sitz in Wolfsklamm. Die Graumähnen führen ihre Überlieferung auf Hrothgar die Graumähne zurück.',
    emblem: HOUSE_EMBLEMS.graumahne,
    houseProfile: SCHWARZFENN_HOUSE_PROFILES.graumahne
  },
  houses: [
    house(GRAUMAHNE_HOUSE_ID, 'Clan Graumähne', HOUSE_EMBLEMS.graumahne),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-riesentot', 'Clan Riesentot'),
    house('house-arnvild', 'Clan Arnvild', HOUSE_EMBLEMS.arnvild),
    house('house-drewi', "Haus Drewi O'Dryffyn"),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-todbrand', 'Clan Todbrand', HOUSE_EMBLEMS.todbrand),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-gwenyen', "Haus Gwenyen O'Gwych"),
    house('house-blutstahl', 'Clan Blutstahl'),
    house('house-kaltherz', 'Clan Kaltherz'),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-hrafn', 'Clan Hrafn', HOUSE_EMBLEMS.hrafn),
    house('house-helgr', 'Clan Helgr', HOUSE_EMBLEMS.helgr),
    house('house-silberzunge', 'Clan Silberzunge', HOUSE_EMBLEMS.silberzunge)
  ],
  persons: [
    person('unknown-father-graumahne', '???', 'male', '????', '????', {
      title: 'Unbekannter Vater Hrothgars',
      notes: 'Die Quelle nennt Hrothgars Eltern nicht.'
    }),
    person('unknown-mother-graumahne', '???', 'female', '????', '????', {
      title: 'Unbekannte Mutter Hrothgars',
      notes: 'Die Quelle nennt Hrothgars Eltern nicht.'
    }),
    person('hrothgar-graumahne', 'Hrothgar die Graumähne', 'male', '????', '????', {
      title: 'Gründer und erstes Oberhaupt des Clans Graumähne'
    }),
    spouse('unknown-wife-hrothgar-graumahne', '???', 'female', '????', '????', '', {
      title: 'Unbekannte Ehefrau Hrothgars'
    }),

    person('fjornir-graumahne', 'Fjornir Graumähne', 'male', '????', '????', {
      title: 'Oberhaupt des Clans Graumähne'
    }),
    awayWoman('alfhild-graumahne', 'Alfhild Graumähne', '????', '????', 'Clan Ragnulf'),
    spouse('asdis-riesentot', 'Asdis Riesentot', 'female', '????', '????', 'house-riesentot'),
    spouse('thorkel-ancient-ragnulf', 'Thorkel Ragnulf', 'male', '????', '????', 'house-ragnulf'),

    person('thorlak-graumahne', 'Thorlak Graumähne', 'male', '1515', '1579', {
      title: 'Oberhaupt des Clans Graumähne',
      extensions: {
        chartCenterBetweenSpousePersonIds: ['skalli-arnvild', 'elinor-drewi-odryffyn'],
        registryManagedExtensionFields: ['chartCenterBetweenSpousePersonIds']
      }
    }),
    spouse('skalli-arnvild', 'Skalli Arnvild', 'female', '1520', '1539', 'house-arnvild', {
      title: 'Erste Ehefrau Thorlaks'
    }),
    spouse('elinor-drewi-odryffyn', "Elinor Drewi O'Dryffyn", 'female', '1529', '1600', 'house-drewi', {
      title: 'Zweite Ehefrau Thorlaks'
    }),

    person('njall-1539-graumahne', 'Njall Graumähne', 'male', '1539', '1629', {
      title: 'Oberhaupt des Clans Graumähne'
    }),
    awayWoman('skadi-graumahne', 'Skadi Graumähne', '1539', '1620', 'Clan Schmetterschild'),
    person('asleikr-graumahne', 'Asleikr Graumähne', 'male', '1547', '1628'),
    person('eyjolf-graumahne', 'Eyjolf Graumähne', 'male', '1550', '1628', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['steinnun-todbrand', 'laufey'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('hervor-schmetterschild', 'Hervör Schmetterschild', 'female', '1543', '1636', 'house-schmetterschild'),
    spouse('sigurd-schmetterschild', 'Sigurd Schmetterschild', 'male', '1540', '1605', 'house-schmetterschild'),
    spouse('jorunn-kummerherz', 'Jorunn Kummerherz', 'female', '1551', '1626', 'house-kummerherz'),
    spouse('steinnun-todbrand', 'Steinnun Todbrand', 'female', '1553', '1600', 'house-todbrand'),
    affair('laufey', 'Laufey', 'female', '1555', '1628', '', {
      title: 'Affäre Eyjolfs · Mutter Sjöfns',
      notes: 'Die Quelle nennt 1585; wegen Sjöfns Geburt 1575 wird der offensichtliche Zahlendreher als 1555 aufgelöst.'
    }),

    person('ulfar-graumahne', 'Ulfar Graumähne', 'male', '1564', '1650', {
      title: 'Oberhaupt des Clans Graumähne'
    }),
    awayWoman('hallbera-graumahne', 'Hallbera Graumähne', '1571', '1640', 'Clan Schwarzdorn'),
    person('ormulf-graumahne', 'Ormulf Graumähne', 'male', '1574', '1629'),
    person('vemund-graumahne', 'Vemund Graumähne', 'male', '1588', '1605'),
    awayWoman('sjofn-graumahne', 'Sjöfn Graumähne', '1575', '1677', "Haus Gwenyen O'Gwych", {
      familyRole: 'bastard',
      title: "Bastardtochter Eyjolfs und Laufeys · Wegverheiratet an Haus Gwenyen O'Gwych",
      tags: ['Bastard']
    }),
    person('jorleik-graumahne', 'Jorleik Graumähne', 'male', '1600', '1631', {
      familyRole: 'bastard',
      title: 'Bastardsohn Eyjolfs · Mutter nicht überliefert',
      tags: ['Bastard']
    }),
    spouse('isbjorg-riesentot', 'Isbjörg Riesentot', 'female', '1566', '1650', 'house-riesentot'),
    spouse('inigmund-schwarzdorn', 'Inigmund Schwarzdorn', 'male', '1570', '1624', 'house-schwarzdorn'),
    spouse('helga', 'Helga', 'female', '1581', '1655', '', {
      notes: 'Die Quelle nennt unmögliche Lebensdaten 1681–1655. Aufgrund der Kinderjahrgänge 1605 und 1609 wird der offensichtliche Jahrhundertfehler zu 1581 korrigiert.'
    }),
    spouse('urien-gwenyen-ogwych', "Urien Gwenyen O'Gwych", 'male', '1572', '1641', 'house-gwenyen'),

    person('leinkir-graumahne', 'Leinkir Graumähne', 'male', '1584', '1628'),
    awayWoman('gyda-graumahne', 'Gyda Graumähne', '1596', '1677', 'Clan Schmetterschild'),
    person('fjorlagr-graumahne', 'Fjorlagr Graumähne', 'male', '1605', '1630'),
    person('sleipnir-graumahne', 'Sleipnir Graumähne', 'male', '1609', '1631'),
    spouse('torgunna-arnvild', 'Torgunna Arnvild', 'female', '1585', '1640', 'house-arnvild'),
    spouse('sigvard-schmetterschild', 'Sigvard Schmetterschild', 'male', '1594', '1670', 'house-schmetterschild'),

    person('arnljot-graumahne', 'Arnljöt Graumähne', 'male', '1603', '1665', {
      title: 'Oberhaupt des Clans Graumähne'
    }),
    awayWoman('katlin-graumahne', 'Katlin Graumähne', '1609', '????', 'Clan Kaltherz'),
    person('gleipnir-graumahne', 'Gleipnir Graumähne', 'male', '1618', '1700'),
    spouse('svaldis-blutstahl', 'Svaldis Blutstahl', 'female', '1607', '1640', 'house-blutstahl'),
    spouse('vigtyr-kaltherz', 'Vigtyr Kaltherz', 'male', '1607', '1681', 'house-kaltherz'),
    spouse('dagrun-skogg', 'Dagrún Skogg', 'female', '1622', '1691', 'house-skogg'),

    person('viglund-graumahne', 'Viglund Graumähne', 'male', '1627', '1701', {
      title: 'Oberhaupt des Clans Graumähne'
    }),
    awayWoman('yrsa-graumahne', 'Yrsa Graumähne', '1630', '1705', 'Clan Schmetterschild'),
    person('svipdag-graumahne', 'Svipdag Graumähne', 'male', '1641', '1712'),
    spouse('signy-schmetterschild', 'Signy Schmetterschild', 'female', '1628', '1704', 'house-schmetterschild'),
    spouse('hafgrim-schmetterschild', 'Hafgrim Schmetterschild', 'male', '1625', '1700', 'house-schmetterschild'),
    spouse('astrid', 'Astrid', 'female', '1642', '1700'),

    person('hogrand-graumahne', 'Hogrand Graumähne', 'male', '1650', '1719', {
      title: 'Oberhaupt des Clans Graumähne'
    }),
    awayWoman('magndis-graumahne', 'Magndís Graumähne', '1655', '1709', 'Clan Kummerherz'),
    awayWoman('hildessa-graumahne', 'Hildessa Graumähne', '1660', '1729', 'Clan Todbrand'),
    person('eylund-graumahne', 'Eylund Graumähne', 'male', '1662', '1720', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['grimhildr', 'vedis'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('yngrid', 'Yngrid', 'female', '1652', '1738'),
    spouse('naddvar-kummerherz', 'Naddvar Kummerherz', 'male', '1649', '1733', 'house-kummerherz'),
    spouse('munthor-todbrand', 'Munthor Todbrand', 'male', '1658', '1714', 'house-todbrand'),
    spouse('vedis', 'Vedis', 'female', '1666', '1700', '', { title: 'Ehefrau Eylunds' }),
    affair('grimhildr', 'Grimhildr', 'female', '1681', '', '', {
      title: 'Affäre Eylunds · Mutter Ofeigs'
    }),

    person('helmskald-graumahne', 'Helmskald Graumähne', 'male', '1674', '', {
      title: 'Oberhaupt des Clans Graumähne'
    }),
    awayWoman('unndis-graumahne', 'Unndís Graumähne', '1676', '', 'Clan Hrafn'),
    person('leifgard-graumahne', 'Leifgard Graumähne', 'male', '1680', '1720', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['ingkatla', 'rigfrid'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    awayWoman('urdis-graumahne', 'Ùrdís Graumähne', '1681', '', 'Clan Helgr'),
    person('ofeig-graumahne', 'Ofeig Graumähne', 'male', '1700', '', {
      familyRole: 'bastard',
      title: 'Bastardsohn Eylunds und Grimhildrs',
      tags: ['Bastard']
    }),
    spouse('ljotunn-sterkr', 'Ljotunn Sterkr', 'female', '1677', '', 'house-sterkr'),
    spouse('freyglod-hrafn', 'Freyglod Hrafn', 'male', '1675', '', 'house-hrafn'),
    spouse('ingkatla', 'Ingkatla', 'female', '1682', ''),
    spouse('eldfred-helgr', 'Eldfred Helgr', 'male', '1677', '', 'house-helgr'),
    affair('rigfrid', 'Rigfrid', 'female', '1701', '', '', {
      title: 'Affäre Leifgards · Mutter Tengils'
    }),

    person('jokul-graumahne', 'Jokul Graumähne', 'male', '1693', '', {
      title: 'Erbe des Clans Graumähne'
    }),
    awayWoman('gundel-graumahne', 'Gundel Graumähne', '1703', '', 'Clan Silberzunge'),
    person('jofrid-graumahne', 'Jofrid Graumähne', 'female', '1697', '', {
      notes: 'Die Quelle führt Jofrid ausdrücklich mit Glaumur und drei Kindern innerhalb der Graumähne-Akte fort; sie ist daher keine wegverheiratete Endlinie.'
    }),
    person('austmann-graumahne', 'Austmann Graumähne', 'male', '1701', ''),
    person('tengil-graumahne', 'Tengil Graumähne', 'male', '1721', '', {
      familyRole: 'bastard',
      title: 'Bastardsohn Leifgards und Rigfrids',
      tags: ['Bastard']
    }),
    spouse('erna-ragnulf', 'Erna Ragnulf', 'female', '1697', '', 'house-ragnulf'),
    spouse('sverrir-silberzunge', 'Sverrir Silberzunge', 'male', '1701', '', 'house-silberzunge'),
    spouse('glaumur-schmetterschild', 'Glaumur Schmetterschild', 'male', '1702', '', 'house-schmetterschild'),
    spouse('orkatla', 'Orkatla', 'female', '1705', ''),

    person('gunnvar-graumahne', 'Gunnvar Graumähne', 'male', '1715', '', {
      title: 'Erbe des Clans Graumähne'
    }),
    person('munnin-graumahne', 'Munnin Graumähne', 'male', '1718', '', {
      title: 'Erbe des Clans Graumähne'
    }),
    person('gunther-graumahne', 'Gunther Graumähne', 'male', '1721', '', {
      title: 'Erbe des Clans Graumähne'
    }),
    person('nott-graumahne', 'Nótt Graumähne', 'female', '1723', ''),
    person('njall-1727-graumahne', 'Njall Graumähne', 'male', '1727', '', {
      title: 'Erbe des Clans Graumähne'
    }),
    person('ottar-graumahne', 'Ottar Graumähne', 'male', '1721', ''),
    person('nanna-graumahne', 'Nanna Graumähne', 'female', '1722', ''),
    person('ingolf-graumahne', 'Ingolf Graumähne', 'male', '1724', ''),
    person('hildr-graumahne', 'Hildr Graumähne', 'female', '1727', ''),
    person('balr-graumahne', 'Balr Graumähne', 'male', '1726', '')
  ],
  partnerships: [
    partnership('marriage-unknown-graumahne-parents'),
    partnership('marriage-hrothgar-unknown-graumahne'),
    partnership('marriage-fjornir-asdis-graumahne'),
    partnership('marriage-thorkel-alfhild-ragnulf'),
    alignPartnerOverChildren(partnership('marriage-thorlak-skalli-graumahne', { status: 'ended', end: '1539' }), 'skalli-arnvild'),
    alignPartnerOverChildren(partnership('marriage-thorlak-elinor-graumahne', { status: 'ended', end: '1579' }), 'elinor-drewi-odryffyn'),
    partnership('marriage-njall-hervor-graumahne', { status: 'ended', end: '1629' }),
    partnership('marriage-skadi-sigurd-graumahne', { status: 'ended', end: '1605' }),
    partnership('marriage-asleikr-jorunn-graumahne', { status: 'ended', end: '1626' }),
    partnership('marriage-steinnun-eyjolf-todbrand', { status: 'ended', end: '1600' }),
    alignPartnerOverChildren(partnership('affair-eyjolf-laufey-graumahne', {
      type: 'affair',
      status: 'ended',
      end: '1628',
      visibility: 'private',
      notes: 'Sjöfn entstammt ausschließlich Eyjolfs Affäre mit Laufey.'
    }), 'laufey', { reserveLeafChildLane: true }),
    partnership('marriage-ulfar-isbjorg-graumahne', { status: 'ended', end: '1650' }),
    partnership('marriage-inigmund-hallbera-schwarzdorn', { status: 'ended', end: '1624' }),
    partnership('marriage-ormulf-helga-graumahne', { status: 'ended', end: '1629' }),
    partnership('marriage-sjofn-urien-graumahne', { status: 'ended', end: '1641' }),
    partnership('marriage-leinkir-torgunna-graumahne', { status: 'ended', end: '1628' }),
    partnership('marriage-gyda-sigvard-graumahne', { status: 'ended', end: '1670' }),
    partnership('marriage-arnljot-svaldis-graumahne', { status: 'ended', end: '1640' }),
    partnership('marriage-katlin-vigtyr-graumahne', { status: 'ended', end: '1681' }),
    partnership('marriage-dagrun-gleipnir-skogg', { status: 'ended', end: '1691' }),
    partnership('marriage-viglund-signy-graumahne', { status: 'ended', end: '1701' }),
    partnership('marriage-yrsa-hafgrim-graumahne', { status: 'ended', end: '1700' }),
    partnership('marriage-svipdag-astrid-graumahne', { status: 'ended', end: '1700' }),
    partnership('marriage-hogrand-yngrid-graumahne', { status: 'ended', end: '1719' }),
    partnership('marriage-magndis-naddvar-graumahne', { status: 'ended', end: '1709' }),
    partnership('marriage-munthor-hildessa-todbrand', { status: 'ended', end: '1714' }),
    alignPartnerOverChildren(
      partnership('marriage-eylund-vedis-graumahne', { status: 'ended', end: '1700' }),
      'vedis',
      { clearDescendantBranchLane: true }
    ),
    alignPartnerOverChildren(partnership('affair-eylund-grimhildr-graumahne', {
      type: 'affair',
      status: 'ended',
      end: '1720',
      visibility: 'private',
      notes: 'Ofeig entstammt ausschließlich Eylunds Affäre mit Grimhildr.'
    }), 'grimhildr', { reserveLeafChildLane: true }),
    partnership('marriage-ljotunn-helmskald-sterkr'),
    partnership('marriage-unndis-freyglod-graumahne'),
    alignPartnerOverChildren(
      partnership('marriage-leifgard-ingkatla-graumahne', { status: 'ended', end: '1720' }),
      'ingkatla',
      { clearDescendantBranchLane: true }
    ),
    alignPartnerOverChildren(partnership('affair-leifgard-rigfrid-graumahne', {
      type: 'affair',
      status: 'ended',
      end: '1720',
      visibility: 'private',
      notes: 'Tengil entstammt ausschließlich Leifgards Affäre mit Rigfrid.'
    }), 'rigfrid', { reserveLeafChildLane: true }),
    partnership('marriage-eldfred-urdis-helgr'),
    partnership('marriage-erna-jokul-ragnulf'),
    partnership('marriage-sverrir-gundel-silberzunge'),
    partnership('marriage-jofrid-glaumur-graumahne'),
    partnership('marriage-austmann-orkatla-graumahne')
  ],
  parentages: [
    ...childrenOf(['hrothgar-graumahne'], 'marriage-unknown-graumahne-parents', {
      certainty: 'probable',
      notes: 'Die Quelle zeigt Hrothgar als Kind zweier unbekannter Eltern.'
    }),
    ...childrenOf(['fjornir-graumahne', 'alfhild-graumahne'], 'marriage-hrothgar-unknown-graumahne', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen nach dem Hauswappen.'
    }),
    ...childrenOf(['thorlak-graumahne'], 'marriage-fjornir-asdis-graumahne', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: 'gap-fjornir-to-thorlak-graumahne' }
    }),
    ...childrenOf(['njall-1539-graumahne', 'skadi-graumahne'], 'marriage-thorlak-skalli-graumahne'),
    ...childrenOf(['asleikr-graumahne', 'eyjolf-graumahne'], 'marriage-thorlak-elinor-graumahne'),
    ...childrenOf(['ulfar-graumahne', 'hallbera-graumahne'], 'marriage-njall-hervor-graumahne'),
    ...childrenOf(['ormulf-graumahne', 'vemund-graumahne'], 'marriage-asleikr-jorunn-graumahne'),
    ...childrenOf(['sjofn-graumahne'], 'affair-eyjolf-laufey-graumahne', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Biologische Eltern: Eyjolf Graumähne und Laufey.'
    }),
    ...createParentages(['jorleik-graumahne'], ['eyjolf-graumahne'], '', {
      idPrefix: 'graumahne-parentage',
      legitimacy: 'illegitimate',
      certainty: 'confirmed',
      notes: 'Eyjolf ist als Vater belegt; die Mutter des Bastards ist nicht überliefert.'
    }),
    ...childrenOf(['leinkir-graumahne', 'gyda-graumahne'], 'marriage-ulfar-isbjorg-graumahne'),
    ...childrenOf(['fjorlagr-graumahne', 'sleipnir-graumahne'], 'marriage-ormulf-helga-graumahne'),
    ...childrenOf(['arnljot-graumahne', 'katlin-graumahne', 'gleipnir-graumahne'], 'marriage-leinkir-torgunna-graumahne'),
    ...childrenOf(['viglund-graumahne', 'yrsa-graumahne'], 'marriage-arnljot-svaldis-graumahne'),
    ...childrenOf(['svipdag-graumahne'], 'marriage-dagrun-gleipnir-skogg'),
    ...childrenOf(['hogrand-graumahne', 'magndis-graumahne', 'hildessa-graumahne'], 'marriage-viglund-signy-graumahne'),
    ...childrenOf(['eylund-graumahne'], 'marriage-svipdag-astrid-graumahne'),
    ...childrenOf(['helmskald-graumahne', 'unndis-graumahne'], 'marriage-hogrand-yngrid-graumahne'),
    // Ofeigs terminaler Affärenzweig steht vor Eylunds legitimem Geschwisterblock.
    // Damit liegt keine fremde Karte zwischen Leifgard und dessen Partnerinnen.
    ...childrenOf(['ofeig-graumahne'], 'affair-eylund-grimhildr-graumahne', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Biologische Eltern: Eylund Graumähne und Grimhildr.'
    }),
    // Der kinderlose Helgr-Seitenzweig steht ebenfalls außen vor Leifgards Fortsetzung.
    ...childrenOf(['urdis-graumahne', 'leifgard-graumahne'], 'marriage-eylund-vedis-graumahne'),
    ...childrenOf(['jokul-graumahne', 'gundel-graumahne'], 'marriage-ljotunn-helmskald-sterkr'),
    ...childrenOf(['jofrid-graumahne', 'austmann-graumahne'], 'marriage-leifgard-ingkatla-graumahne'),
    ...childrenOf(['tengil-graumahne'], 'affair-leifgard-rigfrid-graumahne', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Biologische Eltern: Leifgard Graumähne und Rigfrid.'
    }),
    ...childrenOf([
      'gunnvar-graumahne',
      'munnin-graumahne',
      'gunther-graumahne',
      'nott-graumahne',
      'njall-1727-graumahne'
    ], 'marriage-erna-jokul-ragnulf'),
    ...childrenOf(['ottar-graumahne', 'nanna-graumahne', 'ingolf-graumahne'], 'marriage-jofrid-glaumur-graumahne'),
    ...childrenOf(['hildr-graumahne', 'balr-graumahne'], 'marriage-austmann-orkatla-graumahne')
  ],
  cadetBranches: [
    marriedAway('married-away-alfhild-graumahne-ragnulf', 'Clan Ragnulf', 'marriage-thorkel-alfhild-ragnulf', 'house-ragnulf', 'haus-ragnulf', HOUSE_EMBLEMS.ragnulf),
    marriedAway('married-away-skadi-graumahne-schmetterschild', 'Clan Schmetterschild', 'marriage-skadi-sigurd-graumahne', 'house-schmetterschild', 'haus-schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    marriedAway('married-away-hallbera-graumahne-schwarzdorn', 'Clan Schwarzdorn', 'marriage-inigmund-hallbera-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-sjofn-graumahne-gwenyen', "Haus Gwenyen O'Gwych", 'marriage-sjofn-urien-graumahne', 'house-gwenyen', 'haus-gwenyen'),
    marriedAway('married-away-gyda-graumahne-schmetterschild', 'Clan Schmetterschild', 'marriage-gyda-sigvard-graumahne', 'house-schmetterschild', 'haus-schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    marriedAway('married-away-katlin-graumahne-kaltherz', 'Clan Kaltherz', 'marriage-katlin-vigtyr-graumahne', 'house-kaltherz', 'haus-kaltherz'),
    marriedAway('married-away-yrsa-graumahne-schmetterschild', 'Clan Schmetterschild', 'marriage-yrsa-hafgrim-graumahne', 'house-schmetterschild', 'haus-schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    marriedAway('married-away-magndis-graumahne-kummerherz', 'Clan Kummerherz', 'marriage-magndis-naddvar-graumahne', 'house-kummerherz', 'haus-kummerherz', HOUSE_EMBLEMS.kummerherz),
    marriedAway('married-away-hildessa-graumahne-todbrand', 'Clan Todbrand', 'marriage-munthor-hildessa-todbrand', 'house-todbrand', 'haus-todbrand', HOUSE_EMBLEMS.todbrand),
    marriedAway('married-away-unndis-graumahne-hrafn', 'Clan Hrafn', 'marriage-unndis-freyglod-graumahne', 'house-hrafn', 'haus-hrafn', HOUSE_EMBLEMS.hrafn),
    marriedAway('married-away-urdis-graumahne-helgr', 'Clan Helgr', 'marriage-eldfred-urdis-helgr', 'house-helgr', 'haus-helgr', HOUSE_EMBLEMS.helgr),
    marriedAway('married-away-gundel-graumahne-silberzunge', 'Clan Silberzunge', 'marriage-sverrir-gundel-silberzunge', 'house-silberzunge', 'haus-silberzunge', HOUSE_EMBLEMS.silberzunge)
  ],
  timeJumps: [
    timeJump(
      'gap-fjornir-to-thorlak-graumahne',
      'marriage-fjornir-asdis-graumahne',
      [],
      ['thorlak-graumahne'],
      '????',
      '1515'
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-hrothgar-unknown-graumahne',
    houseId: GRAUMAHNE_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Schwarzfenn · Sitz Wolfsklamm',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-father-graumahne',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    sourceRevision: 7,
    sourceModule: 'Clan Graumähne (bereitgestellte Altdaten)',
    sourceNote: "Der vollständige Graumähne-Stammbaum wurde ohne Personenfokus von Hrothgars unbekannten Eltern bis zur Generation von 1740 übernommen. Hrothgar und seine unbekannte Frau bilden das Gründerpaar; erst danach folgen Hauswappen und ein serieller Quellenabstand. Der weitere Zeitsprung führt ausschließlich von Fjornir und Asdis zu Thorlak. Alfhilds wegverheirateter Ragnulf-Zweig endet an seinem eigenen Hausknoten und läuft niemals in die Hauptlinie oder den Zeitsprung zurück. Thorlaks Kinder sind sauber nach erster Frau Skalli Arnvild und zweiter Frau Elinor Drewi O'Dryffyn getrennt. Eyjolfs Bastardtochter Sjöfn stammt ausschließlich aus der Affäre mit Laufey; für Jorleik ist nur Eyjolf als Vater belegt. Bei Eyjolf, Eylund und Leifgard steht der Mann als einmalige Karte zwischen Ehefrau und Affäre. Laufey, Grimhildr und Rigfrid stehen jeweils direkt über ihrem eigenen Bastard, während die legitimen Kinder unter der tatsächlichen Ehefrau bleiben. Bei einem fortgeführten Ehe-Zweig und einem kleinen Affärenzweig werden beide Partnerkarten, die gemeinsame Person und der Blattzweig als kollisionsgeprüfter lokaler Block gepackt; fortgeführte Nachkommen werden dabei nicht über den Stammbaum verschoben. So bleiben die Verbindungen kurz und kreuzen keine fremden Beziehungen. Ofeigs Grimhildr-Zweig und der kinderlose Ùrdís/Eldfred-Zweig stehen außerhalb von Leifgards Partner- und Kinderblock; keine ihrer Karten darf zwischen Leifgard, Ingkatla, Rigfrid und Tengil geraten. Jofrid wird trotz ihrer Ehe mit Glaumur Schmetterschild ausdrücklich mit drei Kindern innerhalb der Graumähne-Akte fortgeführt und deshalb nicht als terminal wegverheiratet behandelt. Alle übrigen belegten wegverheirateten Graumähne-Frauen besitzen direkte Zielhausknoten. Die Quelle nennt Helga als 1681–1655, obwohl ihre Kinder 1605 und 1609 geboren wurden; der offensichtliche Jahrhundertfehler wird als 1581–1655 aufgelöst. Laufey wird als 1585 geboren genannt, obwohl Sjöfn bereits 1575 geboren ist; der entsprechende Zahlendreher wird zu 1555 korrigiert. Ùrdís/Úrdís erscheint in der Quelle in beiden Schreibweisen; für die gemeinsame Weltperson mit der Helgr-Akte bleibt die kanonische Form Ùrdís bestehen. Die fünf namenlosen Verlobten-Platzhalter und wiederholte Standardsilhouetten wurden nicht als Personen oder Individualporträts importiert.",
    registryTombstones: {
      persons: ['haus-graumahne-gruender', 'haus-graumahne-gruenderin'],
      partnerships: ['marriage-haus-graumahne-founders']
    },
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
