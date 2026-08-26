import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_EISENBIEGER_PORTRAITS } from './house-eisenbieger-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { KRAEHENMOOR_HOUSE_EMBLEMS } from './kraehenmoor-house-profiles.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const EISENBIEGER_HOUSE_ID = 'house-eisenbieger';
const SOURCE_GAP_ID = 'gap-erik-brita-to-first-eisenbieger-generation';

const HOUSE_EMBLEMS = Object.freeze({
  eisenbieger: KRONENTAL_HOUSE_EMBLEMS.eisenbieger,
  vaeren: KRONENTAL_HOUSE_EMBLEMS.vaeren,
  sturmgeborene: KRONENTAL_HOUSE_EMBLEMS.sturmgeborene,
  frostauge: KRONENTAL_HOUSE_EMBLEMS.frostauge,
  wellensaenger: KRONENTAL_HOUSE_EMBLEMS.wellensaenger,
  wellenschild: KRONENTAL_HOUSE_EMBLEMS.wellenschild,
  spindelschlag: KRONENTAL_HOUSE_EMBLEMS.spindelschlag,
  holmr: KRONENTAL_HOUSE_EMBLEMS.holmr,
  hrafn: SCHWARZFENN_HOUSE_EMBLEMS.hrafn,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  schattenherz: KRAEHENMOOR_HOUSE_EMBLEMS.schattenherz,
  silberblut: KRAEHENMOOR_HOUSE_EMBLEMS.silberblut,
  kaltherz: KRAEHENMOOR_HOUSE_EMBLEMS.kaltherz,
  feuerherz: KRAEHENMOOR_HOUSE_EMBLEMS.feuerherz,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  varulv: RORIKSHEIM_HOUSE_EMBLEMS.varulv,
  trachwyll: IVARSHEIM_HOUSE_EMBLEMS.trachwyll,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  silberzunge: IVARSHEIM_HOUSE_EMBLEMS.silberzunge,
  lyfant: GRAUE_WEITE_HOUSE_EMBLEMS.lyfant
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
  'erik-eisenbieger',
  'solvig-eisenbieger',
  'zurik-eisenbieger',
  'morkur-eisenbieger',
  'freki-eisenbieger',
  'finnur-eisenbieger',
  'halldor-eisenbieger'
]);

function lineageRoleFor(personId) {
  return HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? EISENBIEGER_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_EISENBIEGER_PORTRAITS[id] || '',
    portraitPlaceholder: options.portraitPlaceholder || 'auto',
    familyRole: options.familyRole || (houseId === EISENBIEGER_HOUSE_ID ? 'core' : 'married'),
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

function wardAwayPerson(id, name, sex, birth, targetHouseName, options = {}) {
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
  'marriage-erik-brita-eisenbieger': ['erik-eisenbieger', 'brita-vaeren'],
  'marriage-solvig-norlind-eisenbieger': ['solvig-eisenbieger', 'norlind-sturmgeborener'],
  'marriage-bergdis-hrolfr-eisenbieger': ['bergdis-eisenbieger', 'hrolfr-frostauge'],
  'marriage-bodvar-hildigun-eisenbieger': ['bodvar-eisenbieger', 'hildigun-holmr'],
  'engagement-helga-zurik-vaeren': ['helga-vaeren', 'zurik-eisenbieger'],
  'marriage-elsa-zurik-eisenbieger': ['elsa-riesentod', 'zurik-eisenbieger'],
  'marriage-castar-gilda-wellensaenger': ['castar-wellensaenger', 'gilda-eisenbieger'],
  'marriage-waldmir-guldis-eisenbieger': ['waldmir-eisenbieger', 'guldis'],
  'marriage-ornthrud-morkur-hrafn': ['morkur-eisenbieger', 'ornthrud-hrafn'],
  'marriage-kalfur-kenna-wellenschild': ['kalfur-wellenschild', 'kenna-eisenbieger'],
  'marriage-mirja-cyneleif-eisenbieger': ['mirja-eisenbieger', 'cyneleif-frostauge'],
  'marriage-gudlaug-freki-gullvig': ['gudlaug-gullvig', 'freki-eisenbieger'],
  'marriage-svandis-finnur-silberblut': ['finnur-eisenbieger', 'svandis-silberblut'],
  'marriage-svartulf-glaumur-skald': ['svartulf-skald', 'glaumur-eisenbieger'],
  'marriage-kenyon-leikn-trachwyll': ['kenyon-trachwyll', 'leikn-eisenbieger'],
  'marriage-thorgils-ljosdis-kummerherz': ['thorgils-eisenbieger', 'ljosdis-kummerherz'],
  'marriage-gunnar-olga-varulv': ['gunnar-varulv', 'olga-eisenbieger'],
  'marriage-halldor-asta-eisenbieger': ['halldor-eisenbieger', 'asta-spindelschlag'],
  'marriage-sjoring-irmgar-vaeren': ['sjoring-vaeren', 'irmgar-eisenbieger'],
  'marriage-gerda-gangr-eisenbieger': ['gerda-eisenbieger', 'gangr-frostauge'],
  'marriage-thormod-geirlaug-eisenbieger': ['thormod-eisenbieger', 'geirlaug'],
  'marriage-haeva-nordall-feuerherz': ['nordall-eisenbieger', 'haeva-feuerherz'],
  'affair-dagni-nordall-kaltherz': ['dagni-kaltherz', 'nordall-eisenbieger'],
  'marriage-rhisiart-gunhild-lyfant': ['rhisiart-lyfant', 'gunhild-eisenbieger']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function withLayout(record, extensionName, extensionValue) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      [extensionName]: extensionValue,
      registryManagedExtensionFields: [
        ...(record.extensions?.registryManagedExtensionFields || []),
        extensionName
      ]
    }
  };
}

function alignChildrenBelowPair(partnershipId, options = {}) {
  return withLayout(partnership(partnershipId, options), 'chartAlignChildGroupBelowParentPair', true);
}

function directlyAboveOnlyChild(partnershipId, childPersonId, options = {}) {
  return withLayout(
    partnership(partnershipId, options),
    'chartAlignParentPairOverChildPersonId',
    childPersonId
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'eisenbieger-parentage',
    ...options
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

export const HOUSE_EISENBIEGER_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-eisenbieger',
    title: 'Clan Eisenbieger',
    motto: '',
    description: 'Hesirenclan von Heldenwacht im königlichen Jarltum Kronental. Die überlieferte Linie verbindet die Eisenbieger eng mit den Vaeren und zahlreichen aldrimarischen Clans.',
    emblem: HOUSE_EMBLEMS.eisenbieger,
    houseProfile: KRONENTAL_HOUSE_PROFILES.eisenbieger
  },
  houses: [
    house(EISENBIEGER_HOUSE_ID, 'Clan Eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-sturmgeborene', 'Clan Sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    house('house-frostauge', 'Clan Frostauge', HOUSE_EMBLEMS.frostauge),
    house('house-holmr', 'Clan Holmr', HOUSE_EMBLEMS.holmr),
    house('house-riesentod', 'Clan Riesentod', KRONENTAL_HOUSE_EMBLEMS.riesentod),
    house('house-wellensaenger', 'Clan Wellensänger', HOUSE_EMBLEMS.wellensaenger),
    house('house-wellenschild', 'Clan Wellenschild', HOUSE_EMBLEMS.wellenschild),
    house('house-hrafn', 'Clan Hrafn', HOUSE_EMBLEMS.hrafn),
    house('house-gullvig', 'Clan Gullvig', KRONENTAL_HOUSE_EMBLEMS.gullvig),
    house('house-silberblut', 'Clan Silberblut', HOUSE_EMBLEMS.silberblut),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-trachwyll', 'Haus Trachwyll', HOUSE_EMBLEMS.trachwyll),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-spindelschlag', 'Clan Spindelschlag', HOUSE_EMBLEMS.spindelschlag),
    house('house-silberzunge', 'Clan Silberzunge', HOUSE_EMBLEMS.silberzunge),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg),
    house('house-feuerherz', 'Clan Feuerherz', HOUSE_EMBLEMS.feuerherz),
    house('house-kaltherz', 'Clan Kaltherz', HOUSE_EMBLEMS.kaltherz),
    house('house-schattenherz', 'Clan Schattenherz', HOUSE_EMBLEMS.schattenherz),
    house('house-lyfant', 'Haus Lyfant', HOUSE_EMBLEMS.lyfant)
  ],
  persons: [
    person('erik-eisenbieger', 'Erik Eisenbieger', 'male', '????', '????', {
      title: 'Gründer des Clans Eisenbieger',
      tags: ['Gründer']
    }),
    spouse('brita-vaeren', 'Brita Vaeren', 'female', '????', '????', 'house-vaeren', {
      title: 'Mitgründerin des Clans Eisenbieger',
      tags: ['Gründerin']
    }),

    person('solvig-eisenbieger', 'Solvig Eisenbieger', 'male', '1567', '1627'),
    awayWoman('bergdis-eisenbieger', 'Bergdis Eisenbieger', '1577', '1635', 'Clan Frostauge'),
    person('bodvar-eisenbieger', 'Bodvar Eisenbieger', 'male', '1575', '1627', {
      notes: 'Das unmögliche Quellenjahr 1675–1627 wurde anhand der Generationenfolge zu 1575–1627 berichtigt.'
    }),
    spouse('norlind-sturmgeborener', 'Norlind Sturmgeborener', 'female', '1570', '1636', 'house-sturmgeborene', {
      notes: 'Das unmögliche Quellenjahr 1670–1636 wurde anhand der Generationenfolge zu 1570–1636 berichtigt.'
    }),
    spouse('hrolfr-frostauge', 'Hrolfr Frostauge', 'male', '1572', '1630', 'house-frostauge'),
    spouse('hildigun-holmr', 'Hildigun Holmr', 'female', '1577', '1635', 'house-holmr'),

    person('zurik-eisenbieger', 'Zurik Eisenbieger', 'male', '1597', '1665', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['helga-vaeren', 'elsa-riesentod'],
        chartKeepPartnerGroupTogether: true,
        registryManagedExtensionFields: [
          'chartCenterBetweenPartnerPersonIds',
          'chartKeepPartnerGroupTogether'
        ]
      }
    }),
    awayWoman('gilda-eisenbieger', 'Gilda Eisenbieger', '1600', '1681', 'Clan Wellensänger'),
    person('waldmir-eisenbieger', 'Waldmir Eisenbieger', 'male', '1601', '1631', {
      notes: 'Die Prosachronik bezeichnet Waldmir als unverheiratet; die explizite Stammbaumtabelle führt dagegen Guldis als Ehefrau. Für die Darstellung gilt die präzisere Tabellenangabe.'
    }),
    spouse('helga-vaeren', 'Helga Vaeren', 'female', '1605', '1627', 'house-vaeren', {
      familyRole: 'fiancee',
      title: 'Ehemalige Verlobte Zuriks',
      tags: ['Verlobt']
    }),
    spouse('elsa-riesentod', 'Elsa Riesentod', 'female', '1605', '1675', 'house-riesentod'),
    spouse('castar-wellensaenger', 'Castar Wellensänger', 'male', '1603', '1671', 'house-wellensaenger'),
    spouse('guldis', 'Guldis', 'female', '????', '????'),

    person('morkur-eisenbieger', 'Morkur Eisenbieger', 'male', '1628', '1659'),
    awayWoman('kenna-eisenbieger', 'Kenna Eisenbieger', '1630', '1698', 'Clan Wellenschild'),
    spouse('ornthrud-hrafn', 'Ornthrud Hrafn', 'female', '1628', '1677', 'house-hrafn'),
    spouse('kalfur-wellenschild', 'Kalfur Wellenschild', 'male', '1624', '1677', 'house-wellenschild'),

    person('freki-eisenbieger', 'Freki Eisenbieger', 'male', '1649', '1724'),
    awayWoman('mirja-eisenbieger', 'Mirja Eisenbieger', '1652', '1733', 'Clan Frostauge'),
    spouse('gudlaug-gullvig', 'Gudlaug Gullvig', 'female', '1650', '1700', 'house-gullvig'),
    spouse('cyneleif-frostauge', 'Cyneleif Frostauge', 'male', '1647', '1725', 'house-frostauge'),

    person('finnur-eisenbieger', 'Finnur Eisenbieger', 'male', '1668', ''),
    person('glaumur-eisenbieger', 'Glaumur Eisenbieger', 'male', '1672', ''),
    awayWoman('leikn-eisenbieger', 'Leikn Eisenbieger', '1677', '', 'Haus Trachwyll'),
    person('thorgils-eisenbieger', 'Thorgils Eisenbieger', 'male', '1673', ''),
    awayWoman('olga-eisenbieger', 'Olga Eisenbieger', '1680', '', 'Clan Varulv'),
    spouse('svandis-silberblut', 'Svandis Silberblut', 'female', '1674', '', 'house-silberblut'),
    spouse('svartulf-skald', 'Svartulf Skald', 'male', '1671', '1720', 'house-skald'),
    spouse('kenyon-trachwyll', 'Kenyon Trachwyll', 'male', '1676', '', 'house-trachwyll'),
    spouse('ljosdis-kummerherz', 'Ljosdis Kummerherz', 'female', '1676', '', 'house-kummerherz'),
    spouse('gunnar-varulv', 'Gunnar Varulv', 'male', '1687', '', 'house-varulv'),

    person('halldor-eisenbieger', 'Halldor Eisenbieger', 'male', '1693', ''),
    awayWoman('irmgar-eisenbieger', 'Irmgar Eisenbieger', '1701', '', 'Clan Vaeren'),
    awayWoman('gerda-eisenbieger', 'Gerda Eisenbieger', '1693', '', 'Clan Frostauge'),
    person('thormod-eisenbieger', 'Thormod Eisenbieger', 'male', '1700', ''),
    person('nordall-eisenbieger', 'Nordall Eisenbieger', 'male', '1698', '', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['haeva-feuerherz', 'dagni-kaltherz'],
        chartKeepPartnerGroupTogether: true,
        registryManagedExtensionFields: [
          'chartCenterBetweenPartnerPersonIds',
          'chartKeepPartnerGroupTogether'
        ]
      }
    }),
    awayWoman('gunhild-eisenbieger', 'Gunhild Eisenbieger', '1699', '', 'Haus Lyfant', {
      portraitPlaceholder: 'female',
      notes: 'Das ältere Quellenporträt Gunhild Eisenbiegers wurde auf Nutzerwunsch nicht übernommen.'
    }),
    spouse('asta-spindelschlag', 'Asta Spindelschlag', 'female', '1692', '', 'house-spindelschlag'),
    spouse('sjoring-vaeren', 'Sjoring Vaeren', 'male', '1700', '1730', 'house-vaeren'),
    spouse('gangr-frostauge', 'Gangr Frostauge', 'male', '1695', '', 'house-frostauge'),
    spouse('geirlaug', 'Geirlaug', 'female', '1703', ''),
    spouse('haeva-feuerherz', 'Haeva Feuerherz', 'female', '1702', '', 'house-feuerherz'),
    spouse('dagni-kaltherz', 'Dagni Kaltherz', 'female', '1702', '', 'house-kaltherz', {
      familyRole: 'affair',
      title: 'Affäre Nordalls',
      tags: ['Affäre']
    }),
    spouse('rhisiart-lyfant', 'Rhisiart Lyfant', 'male', '1696', '', 'house-lyfant'),

    person('oleg-eisenbieger', 'Oleg Eisenbieger', 'male', '1717', ''),
    wardAwayPerson('asdis-eisenbieger', 'Ásdís Eisenbieger', 'female', '1720', 'Clan Silberzunge'),
    wardAwayPerson('svart-eisenbieger', 'Svart Eisenbieger', 'male', '1724', 'Clan Skogg'),
    person('mundi-eisenbieger', 'Mundi Eisenbieger', 'male', '1728', ''),
    spouse('asta-hrafn', 'Asta Hrafn', 'female', '1729', '', 'house-hrafn', {
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Halldors',
      tags: ['Aufgenommenes Mündel'],
      notes: 'Asta ist Halldors aufgenommenes Mündel und kein leibliches Kind der Eisenbieger.'
    }),
    person('sven-eisenbieger', 'Sven Eisenbieger', 'male', '1721', ''),
    person('ykka-eisenbieger', 'Ykka Eisenbieger', 'female', '1725', ''),
    person('tova-eisenbieger', 'Tova Eisenbieger', 'female', '1724', ''),
    person('lars-eisenbieger', 'Lars Eisenbieger', 'male', '1728', ''),
    person('hilda-schattenherz', 'Hilda Schattenherz', 'female', '1728', '', {
      houseId: 'house-schattenherz',
      familyRole: 'bastard',
      title: 'Nicht anerkannte Bastardtochter Nordalls und Dagnis',
      tags: ['Bastard'],
      notes: 'Die Eisenbieger-Quelle klärt die in der Schattenherz-Akte zuvor offene Vaterschaft: Hilda ist das Kind der Affäre Nordall Eisenbieger–Dagni Kaltherz.'
    })
  ],
  partnerships: [
    partnership('marriage-erik-brita-eisenbieger'),
    alignChildrenBelowPair('marriage-solvig-norlind-eisenbieger', { status: 'ended', end: '1627' }),
    partnership('marriage-bergdis-hrolfr-eisenbieger', { status: 'ended', end: '1630' }),
    directlyAboveOnlyChild('marriage-bodvar-hildigun-eisenbieger', 'waldmir-eisenbieger', { status: 'ended', end: '1627' }),
    partnership('engagement-helga-zurik-vaeren', { type: 'engagement', status: 'ended', end: '1627' }),
    withLayout(
      withLayout(
        alignChildrenBelowPair('marriage-elsa-zurik-eisenbieger', { status: 'ended', end: '1665' }),
        'chartAlignPartnerOverChildrenPersonId',
        'elsa-riesentod'
      ),
      'chartReserveDescendantBranchLane',
      true
    ),
    partnership('marriage-castar-gilda-wellensaenger', { status: 'ended', end: '1671' }),
    partnership('marriage-waldmir-guldis-eisenbieger', { status: 'ended', end: '1631' }),
    alignChildrenBelowPair('marriage-ornthrud-morkur-hrafn', { status: 'ended', end: '1659' }),
    partnership('marriage-kalfur-kenna-wellenschild', { status: 'ended', end: '1677' }),
    partnership('marriage-mirja-cyneleif-eisenbieger', { status: 'ended', end: '1725' }),
    alignChildrenBelowPair('marriage-gudlaug-freki-gullvig', { status: 'ended', end: '1700' }),
    alignChildrenBelowPair('marriage-svandis-finnur-silberblut'),
    partnership('marriage-svartulf-glaumur-skald', { status: 'ended', end: '1720' }),
    partnership('marriage-kenyon-leikn-trachwyll'),
    alignChildrenBelowPair('marriage-thorgils-ljosdis-kummerherz'),
    partnership('marriage-gunnar-olga-varulv'),
    alignChildrenBelowPair('marriage-halldor-asta-eisenbieger'),
    partnership('marriage-sjoring-irmgar-vaeren', { status: 'ended', end: '1730' }),
    partnership('marriage-gerda-gangr-eisenbieger'),
    alignChildrenBelowPair('marriage-thormod-geirlaug-eisenbieger'),
    withLayout(
      withLayout(
        withLayout(
          alignChildrenBelowPair('marriage-haeva-nordall-feuerherz'),
          'chartAlignPartnerOverChildrenPersonId',
          'haeva-feuerherz'
        ),
        'chartReserveLeafChildLane',
        true
      ),
      'chartArrangeLeafChildrenEvenly',
      true
    ),
    withLayout(
      withLayout(
        directlyAboveOnlyChild('affair-dagni-nordall-kaltherz', 'hilda-schattenherz', {
          type: 'affair',
          visibility: 'private'
        }),
        'chartAlignPartnerOverChildrenPersonId',
        'dagni-kaltherz'
      ),
      'chartReserveLeafChildLane',
      true
    ),
    partnership('marriage-rhisiart-gunhild-lyfant')
  ],
  parentages: [
    ...childrenOf(['solvig-eisenbieger', 'bergdis-eisenbieger', 'bodvar-eisenbieger'], 'marriage-erik-brita-eisenbieger', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['zurik-eisenbieger', 'gilda-eisenbieger'], 'marriage-solvig-norlind-eisenbieger'),
    ...childrenOf(['waldmir-eisenbieger'], 'marriage-bodvar-hildigun-eisenbieger'),
    ...childrenOf(['morkur-eisenbieger', 'kenna-eisenbieger'], 'marriage-elsa-zurik-eisenbieger'),
    ...childrenOf(['freki-eisenbieger', 'mirja-eisenbieger'], 'marriage-ornthrud-morkur-hrafn'),
    ...childrenOf(['finnur-eisenbieger', 'glaumur-eisenbieger', 'leikn-eisenbieger', 'thorgils-eisenbieger', 'olga-eisenbieger'], 'marriage-gudlaug-freki-gullvig'),
    ...childrenOf(['halldor-eisenbieger', 'irmgar-eisenbieger', 'gerda-eisenbieger', 'thormod-eisenbieger'], 'marriage-svandis-finnur-silberblut'),
    ...childrenOf(['nordall-eisenbieger', 'gunhild-eisenbieger'], 'marriage-thorgils-ljosdis-kummerherz'),
    ...childrenOf(['oleg-eisenbieger', 'asdis-eisenbieger', 'svart-eisenbieger', 'mundi-eisenbieger'], 'marriage-halldor-asta-eisenbieger'),
    ...createParentages(['asta-hrafn'], ['halldor-eisenbieger'], '', {
      idPrefix: 'eisenbieger-parentage-foster',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Asta Hrafn ist Halldors aufgenommenes Mündel; die Verbindung ist ausschließlich eine Vormundschaft.'
    }),
    ...childrenOf(['sven-eisenbieger', 'ykka-eisenbieger'], 'marriage-thormod-geirlaug-eisenbieger'),
    ...childrenOf(['tova-eisenbieger', 'lars-eisenbieger'], 'marriage-haeva-nordall-feuerherz'),
    ...childrenOf(['hilda-schattenherz'], 'affair-dagni-nordall-kaltherz', {
      legitimacy: 'illegitimate',
      visibility: 'private'
    })
  ],
  cadetBranches: [
    marriedAway('married-away-bergdis-eisenbieger-frostauge', 'Clan Frostauge', 'marriage-bergdis-hrolfr-eisenbieger', 'house-frostauge', 'haus-frostauge', HOUSE_EMBLEMS.frostauge),
    marriedAway('married-away-gilda-eisenbieger-wellensaenger', 'Clan Wellensänger', 'marriage-castar-gilda-wellensaenger', 'house-wellensaenger', 'haus-wellensaenger', HOUSE_EMBLEMS.wellensaenger),
    marriedAway('married-away-kenna-eisenbieger-wellenschild', 'Clan Wellenschild', 'marriage-kalfur-kenna-wellenschild', 'house-wellenschild', 'haus-wellenschild', HOUSE_EMBLEMS.wellenschild),
    marriedAway('married-away-mirja-eisenbieger-frostauge', 'Clan Frostauge', 'marriage-mirja-cyneleif-eisenbieger', 'house-frostauge', 'haus-frostauge', HOUSE_EMBLEMS.frostauge),
    marriedAway('married-away-glaumur-eisenbieger-skald', 'Clan Skald', 'marriage-svartulf-glaumur-skald', 'house-skald', 'haus-skald', HOUSE_EMBLEMS.skald, 'In Clan Skald eingeheiratet'),
    marriedAway('married-away-leikn-eisenbieger-trachwyll', 'Haus Trachwyll', 'marriage-kenyon-leikn-trachwyll', 'house-trachwyll', 'haus-trachwyll-ivarsfels', HOUSE_EMBLEMS.trachwyll),
    marriedAway('married-away-olga-eisenbieger-varulv', 'Clan Varulv', 'marriage-gunnar-olga-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-irmgar-eisenbieger-vaeren', 'Clan Vaeren', 'marriage-sjoring-irmgar-vaeren', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-gerda-eisenbieger-frostauge', 'Clan Frostauge', 'marriage-gerda-gangr-eisenbieger', 'house-frostauge', 'haus-frostauge', HOUSE_EMBLEMS.frostauge),
    marriedAway('married-away-gunhild-eisenbieger-lyfant', 'Haus Lyfant', 'marriage-rhisiart-gunhild-lyfant', 'house-lyfant', 'haus-lyfant-caer-asgwrn', HOUSE_EMBLEMS.lyfant),
    wardAway('ward-away-asdis-eisenbieger-silberzunge', 'Clan Silberzunge', 'asdis-eisenbieger', 'house-silberzunge', 'haus-silberzunge', HOUSE_EMBLEMS.silberzunge),
    wardAway('ward-away-svart-eisenbieger-skogg', 'Clan Skogg', 'svart-eisenbieger', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-erik-brita-eisenbieger',
    parentPersonId: '',
    childIds: ['solvig-eisenbieger', 'bergdis-eisenbieger', 'bodvar-eisenbieger'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1567',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Ein einziger absoluter serieller Generationentrenner folgt dem Gründerpaar und dem Eisenbieger-Wappen; kein anderer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-erik-brita-eisenbieger',
    houseId: EISENBIEGER_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Heldenwacht · Königliches Jarltum Kronental',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'erik-eisenbieger',
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
    sourceRevision: 4,
    sourceModule: 'Clan Eisenbieger (überlieferte HTML-Familienakte)',
    sourceNote: 'Vollständiger Stammbaum ohne Personenfokus. Die unmöglichen Jahrespaare Bodvar 1675–1627 und Norlind 1670–1636 wurden genealogisch zu 1575–1627 und 1570–1636 berichtigt. Der Prosatext nennt Zurik einmal „Zurin“; der mehrfach belegte Name Zurik gilt. Waldmir wird im Prosatext als unverheiratet bezeichnet, die explizite Tabelle weist jedoch Guldis als Ehefrau aus und ist für die Darstellung maßgeblich. Die Tabellenüberschrift „Thorgils & Olga“ über Nordall und Gunhild kann keine Elternschaft zweier Geschwister bezeichnen; entsprechend der umgebenden Ehen werden beide als Kinder Thorgils’ und Ljosdis’ geführt. Ásdís’ Geburtsjahr folgt mit 1720 der Herkunftsakte und berichtigt die abweichende Silberzunge-Gegenakte. Die zuvor offene Vaterschaft Hilda Schattenherzens wird durch diese Quelle Nordall Eisenbieger zugeordnet. Helga ist gemäß der Vaeren-Gegenakte eine Vaeren und Zuriks früh verstorbene frühere Verlobte. Asta Spindelschlags Geburtsjahr wird anhand ihrer Herkunftsakte von 1695 auf 1692 berichtigt. Unbenannte Verlobten-Platzhalter der jüngsten Generation werden nicht importiert.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'chartLayoutPolicy'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-eisenbieger-gruender', 'haus-eisenbieger-gruenderin'],
      partnerships: ['haus-eisenbieger-gruenderbund'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.eisenbieger.folderPath
});
