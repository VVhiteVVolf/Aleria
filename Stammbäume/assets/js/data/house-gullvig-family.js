import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { HOUSE_GULLVIG_PORTRAITS } from './house-gullvig-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { KRAEHENMOOR_HOUSE_EMBLEMS } from './kraehenmoor-house-profiles.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const GULLVIG_HOUSE_ID = 'house-gullvig';
const SOURCE_GAP_ID = 'gap-sten-sigrid-to-first-gullvig-generation';

const HOUSE_EMBLEMS = Object.freeze({
  gullvig: KRONENTAL_HOUSE_EMBLEMS.gullvig,
  schwarzblut: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
  wellenschild: KRONENTAL_HOUSE_EMBLEMS.wellenschild,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
  blutstahl: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
  grendel: IVARSHEIM_HOUSE_EMBLEMS.grendel,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  eisenbieger: KRONENTAL_HOUSE_EMBLEMS.eisenbieger,
  frostauge: KRONENTAL_HOUSE_EMBLEMS.frostauge,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  riesentod: KRONENTAL_HOUSE_EMBLEMS.riesentod,
  feuerhaar: IVARSHEIM_HOUSE_EMBLEMS.feuerhaar,
  wellensaenger: KRONENTAL_HOUSE_EMBLEMS.wellensaenger
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
  'sten-gullvig',
  'jorvik-gullvig',
  'skeld-gullvig',
  'sven-gullvig',
  'tjodrik-gullvig',
  'vetrar-gullvig',
  'nattfar-gullvig'
]);

function lineageRoleFor(personId) {
  return HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? GULLVIG_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_GULLVIG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GULLVIG_HOUSE_ID ? 'core' : 'married'),
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
  'marriage-sten-sigrid-gullvig': ['sten-gullvig', 'sigrid-gullvig-founder'],
  'marriage-jorvik-ealasaid-gullvig': ['jorvik-gullvig', 'ealasaid-morchoe'],
  'marriage-detlaf-porunn-schwarzblut': ['detlaf-schwarzblut', 'porunn-gullvig'],
  'marriage-norrik-helgard-gullvig': ['norrik-gullvig', 'helgard-gullvig-spouse'],
  'marriage-skeld-dagfrid-gullvig': ['skeld-gullvig', 'dagfrid-wellensaenger'],
  'marriage-sven-fjordis-gullvig': ['sven-gullvig', 'fjordis-gullvig-spouse'],
  'marriage-thordis-jorleif-wellenschild': ['thordis-wellenschild', 'jorleif-gullvig'],
  'marriage-ubbe-rannveig-sterkr': ['ubbe-sterkr', 'rannveig-gullvig'],
  'marriage-holgr-udveig-blutstahl': ['holgr-blutstahl', 'udveig-gullvig'],
  'marriage-olrun-tjodrik-gullvig': ['olrun-gullvig', 'tjodrik-gullvig'],
  'marriage-estrid-grimleik-grendel': ['estrid-grendel', 'grimleik-gullvig'],
  'marriage-vetrar-birgdis-gullvig': ['vetrar-gullvig', 'birgdis-gullvig'],
  'marriage-gudlaug-freki-gullvig': ['gudlaug-gullvig', 'freki-eisenbieger'],
  'marriage-nattfar-njaldis-kummerherz': ['nattfar-gullvig', 'njaldis-kummerherz'],
  'marriage-eldrid-inghard-gullvig': ['eldrid-gullvig', 'inghard-frostauge'],
  'marriage-askold-elsa-gullvig': ['askold-gullvig', 'elsa-1696-riesentod'],
  'marriage-olmar-asahel-wargh': ['olmar-wargh', 'asahel-gullvig'],
  'marriage-svantje-aksel-schwarzblut': ['aksel-gullvig', 'svantje-schwarzblut']
});

function withLayoutExtension(record, extensionName, extensionValue) {
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

function clearLayoutExtensionOnRegistryUpgrade(record, extensionName) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      registryManagedExtensionFields: [
        ...(record.extensions?.registryManagedExtensionFields || []),
        extensionName
      ]
    }
  };
}

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function directlyAboveOnlyChild(partnershipId, childPersonId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignParentPairOverChildPersonId',
    childPersonId
  );
}

function alignChildrenBelowPair(partnershipId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignChildGroupBelowParentPair',
    true
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'gullvig-parentage',
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

export const HOUSE_GULLVIG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gullvig',
    title: 'Clan Gullvig',
    motto: 'Wie die Möwe – stets wachsam, stets frei.',
    description: 'Hesirenclan von Kastav in Möwenfels. Sten „die Möwe“ Gullvig sicherte Kastav durch Diplomatie, Handel und den Bund mit den Küstenkriegern, nicht durch ein offenes Blutvergießen.',
    emblem: HOUSE_EMBLEMS.gullvig,
    houseProfile: KRONENTAL_HOUSE_PROFILES.gullvig
  },
  houses: [
    house(GULLVIG_HOUSE_ID, 'Clan Gullvig', HOUSE_EMBLEMS.gullvig),
    house('house-morchoe', 'Clan Morchoe'),
    house('house-schwarzblut', 'Clan Schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    house('house-wellensaenger', 'Clan Wellensänger', HOUSE_EMBLEMS.wellensaenger),
    house('house-wellenschild', 'Clan Wellenschild', HOUSE_EMBLEMS.wellenschild),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-blutstahl', 'Clan Blutstahl', HOUSE_EMBLEMS.blutstahl),
    house('house-grendel', 'Clan Grendel', HOUSE_EMBLEMS.grendel),
    house('house-eisenbieger', 'Clan Eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-frostauge', 'Clan Frostauge', HOUSE_EMBLEMS.frostauge),
    house('house-riesentod', 'Clan Riesentod', HOUSE_EMBLEMS.riesentod),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-feuerhaar', 'Clan Feuerhaar', HOUSE_EMBLEMS.feuerhaar)
  ],
  persons: [
    person('sten-gullvig', 'Sten „die Möwe“ Gullvig', 'male', '????', '????', {
      title: 'Gründer des Clans Gullvig · Herold und Gesandter der Krone',
      tags: ['Gründer']
    }),
    spouse('sigrid-gullvig-founder', 'Sigrid', 'female', '????', '????', '', {
      title: 'Mitgründerin des Clans Gullvig · Tochter der Küstenkrieger',
      tags: ['Gründerin']
    }),

    person('jorvik-gullvig', 'Jorvik Gullvig', 'male', '1576', '1622'),
    awayWoman('porunn-gullvig', 'Porunn Gullvig', '1580', '????', 'Clan Schwarzblut'),
    person('norrik-gullvig', 'Norrik Gullvig', 'male', '1578', '1628'),
    spouse('ealasaid-morchoe', 'Ealasaid Morchoe', 'female', '1577', '????', 'house-morchoe'),
    spouse('detlaf-schwarzblut', 'Detlaf Schwarzblut', 'male', '1580', '1628', 'house-schwarzblut'),
    spouse('helgard-gullvig-spouse', 'Helgard', 'female', '1580', '1615'),

    person('skeld-gullvig', 'Skeld Gullvig', 'male', '1594', '1630', {
      title: 'Hesir des Clans Gullvig · Gefallen in der zweiten Seeschlacht bei Wellenruh'
    }),
    person('sven-gullvig', 'Sven Gullvig', 'male', '1607', '1671', {
      title: 'Hesir des Clans Gullvig ab 1630',
      notes: 'Die alte Quelle nennt Svens historische Mündelschaft bei Schwarzblut. Gemäß der aktuellen Regel wird sie nicht als Mündelstatus oder Mündelverknüpfung übernommen, da Sven nicht zur jüngsten Generation gehört.'
    }),
    person('jorleif-gullvig', 'Jorleif Gullvig', 'male', '1600', '1695', {
      title: 'Bannerträger Arn Vaerens · Mitbegründer der Herdwächter'
    }),
    awayWoman('rannveig-gullvig', 'Rannveig Gullvig', '1596', '1656', 'Clan Sterkr'),
    spouse('dagfrid-wellensaenger', 'Dagfrid Wellensänger', 'female', '1594', '1651', 'house-wellensaenger'),
    spouse('fjordis-gullvig-spouse', 'Fjordis', 'female', '1608', '1670'),
    spouse('thordis-wellenschild', 'Thordis Wellenschild', 'female', '1600', '1675', 'house-wellenschild'),
    spouse('ubbe-sterkr', 'Ubbe Sterkr', 'male', '1594', '1699', 'house-sterkr'),

    awayWoman('udveig-gullvig', 'Udveig Gullvig', '1613', '1670', 'Clan Blutstahl', {
      notes: 'Ein alter blauer Kartenrahmen wird nicht als Mündelstatus übernommen; Udveig gehört nicht zur jüngsten Generation.'
    }),
    person('orrek-gullvig', 'Orrek Gullvig', 'male', '1613', '1630'),
    person('detlaf-1629-gullvig', 'Detlaf Gullvig', 'male', '1629', '1650'),
    awayWoman('olrun-gullvig', 'Olrun Gullvig', '1631', '1704', 'Clan Gullvig', {
      notes: 'Interne Ehe mit Tjodrik Gullvig; die zweite Kartenerscheinung zeigt dieselbe Person als Ehefrau, während ihre Herkunftskarte bei Sven und Fjordis erhalten bleibt.',
      extensions: {
        chartRepeatForPartnershipIds: ['marriage-olrun-tjodrik-gullvig'],
        registryManagedExtensionFields: ['chartRepeatForPartnershipIds']
      }
    }),
    person('tjodrik-gullvig', 'Tjodrik Gullvig', 'male', '1624', '1692', {
      title: 'Hesir des Clans Gullvig ab 1671'
    }),
    person('grimleik-gullvig', 'Grimleik Gullvig', 'male', '1631', '1696'),
    spouse('holgr-blutstahl', 'Holgr Blutstahl', 'male', '1612', '1630', 'house-blutstahl'),
    spouse('estrid-grendel', 'Estrid Grendel', 'female', '1636', '1701', 'house-grendel'),

    clearLayoutExtensionOnRegistryUpgrade(
      person('vetrar-gullvig', 'Vetrar Gullvig', 'male', '1650', '1711', {
        title: 'Hesir des Clans Gullvig ab 1692'
      }),
      'chartPartnerMirrorForPartnershipIds'
    ),
    awayWoman('birgdis-gullvig', 'Birgdis Gullvig', '1655', '1727', 'Clan Gullvig', {
      notes: 'Interne Ehe mit ihrem Bruder Vetrar; die zweite Kartenerscheinung zeigt dieselbe Person als Ehefrau, nicht eine weitere Birgdis.',
      extensions: {
        chartRepeatForPartnershipIds: ['marriage-vetrar-birgdis-gullvig'],
        registryManagedExtensionFields: ['chartRepeatForPartnershipIds']
      }
    }),
    awayWoman('gudlaug-gullvig', 'Gudlaug Gullvig', '1650', '1700', 'Clan Eisenbieger'),
    spouse('freki-eisenbieger', 'Freki Eisenbieger', 'male', '1649', '1724', 'house-eisenbieger'),

    person('nattfar-gullvig', 'Náttfar Gullvig', 'male', '1675', '', {
      title: 'Hesir des Clans Gullvig seit 1711'
    }),
    awayWoman('eldrid-gullvig', 'Eldrid Gullvig', '1677', '1731', 'Clan Frostauge'),
    spouse('njaldis-kummerherz', 'Njaldis Kummerherz', 'female', '1675', '', 'house-kummerherz'),
    spouse('inghard-frostauge', 'Inghard Frostauge', 'male', '1675', '', 'house-frostauge'),

    person('askold-gullvig', 'Askold Gullvig', 'male', '1694', '', {
      title: 'Erster Erbe des Clans Gullvig'
    }),
    awayWoman('asahel-gullvig', 'Ásahel Gullvig', '1704', '', 'Clan Wargh'),
    person('aksel-gullvig', 'Aksel Gullvig', 'male', '1700', ''),
    spouse('elsa-1696-riesentod', 'Elsa Riesentod', 'female', '1696', '', 'house-riesentod', {
      notes: 'Nicht identisch mit der deutlich älteren Elsa Riesentod aus der Vaeren-Akte.'
    }),
    spouse('olmar-wargh', 'Olmar Wargh', 'male', '1699', '', 'house-wargh'),
    spouse('svantje-schwarzblut', 'Svantje Schwarzblut', 'female', '1704', '', 'house-schwarzblut'),

    person('barni-gullvig', 'Barni Gullvig', 'male', '1719', '', {
      title: 'Zweiter Erbe des Clans Gullvig'
    }),
    person('gulla-gullvig', 'Gulla Gullvig', 'female', '1721', ''),
    wardAwayPerson('magni-gullvig', 'Magni Gullvig', 'male', '1724', 'Clan Feuerhaar', {
      title: 'Als Mündel an Clan Feuerhaar vermittelt',
      notes: 'Jüngste Generation: aufgenommenes Mündel Armod Feuerhaars.'
    }),
    person('fiosa-gullvig', 'Fiosa Gullvig', 'female', '1727', '')
  ],
  partnerships: [
    partnership('marriage-sten-sigrid-gullvig'),
    partnership('marriage-jorvik-ealasaid-gullvig', { status: 'ended', end: '1622' }),
    partnership('marriage-detlaf-porunn-schwarzblut', { status: 'ended', end: '1628' }),
    partnership('marriage-norrik-helgard-gullvig', { status: 'ended', end: '1615' }),
    alignChildrenBelowPair('marriage-skeld-dagfrid-gullvig', { status: 'ended', end: '1630' }),
    partnership('marriage-sven-fjordis-gullvig', { status: 'ended', end: '1670' }),
    partnership('marriage-thordis-jorleif-wellenschild', { status: 'ended', end: '1675' }),
    partnership('marriage-ubbe-rannveig-sterkr', { status: 'ended', end: '1656' }),
    partnership('marriage-holgr-udveig-blutstahl', { status: 'ended', end: '1630' }),
    partnership('marriage-olrun-tjodrik-gullvig', { status: 'ended', end: '1692' }),
    directlyAboveOnlyChild('marriage-estrid-grimleik-grendel', 'gudlaug-gullvig', { status: 'ended', end: '1696' }),
    clearLayoutExtensionOnRegistryUpgrade(
      partnership('marriage-vetrar-birgdis-gullvig', { status: 'ended', end: '1711' }),
      'chartAlignChildGroupBelowParentPair'
    ),
    partnership('marriage-gudlaug-freki-gullvig', { status: 'ended', end: '1700' }),
    partnership('marriage-nattfar-njaldis-kummerherz'),
    partnership('marriage-eldrid-inghard-gullvig', { status: 'ended', end: '1731' }),
    alignChildrenBelowPair('marriage-askold-elsa-gullvig'),
    partnership('marriage-olmar-asahel-wargh'),
    alignChildrenBelowPair('marriage-svantje-aksel-schwarzblut')
  ],
  parentages: [
    ...childrenOf(['jorvik-gullvig', 'porunn-gullvig', 'norrik-gullvig'], 'marriage-sten-sigrid-gullvig', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['skeld-gullvig', 'sven-gullvig'], 'marriage-jorvik-ealasaid-gullvig'),
    ...childrenOf(['jorleif-gullvig', 'rannveig-gullvig'], 'marriage-norrik-helgard-gullvig'),
    ...childrenOf(['udveig-gullvig', 'orrek-gullvig'], 'marriage-skeld-dagfrid-gullvig'),
    ...childrenOf(['detlaf-1629-gullvig', 'olrun-gullvig'], 'marriage-sven-fjordis-gullvig'),
    ...childrenOf(['tjodrik-gullvig', 'grimleik-gullvig'], 'marriage-thordis-jorleif-wellenschild'),
    ...childrenOf(['vetrar-gullvig', 'birgdis-gullvig'], 'marriage-olrun-tjodrik-gullvig'),
    ...childrenOf(['gudlaug-gullvig'], 'marriage-estrid-grimleik-grendel'),
    ...childrenOf(['nattfar-gullvig', 'eldrid-gullvig'], 'marriage-vetrar-birgdis-gullvig'),
    ...childrenOf(['askold-gullvig', 'asahel-gullvig', 'aksel-gullvig'], 'marriage-nattfar-njaldis-kummerherz'),
    ...childrenOf(['barni-gullvig', 'gulla-gullvig'], 'marriage-askold-elsa-gullvig'),
    ...childrenOf(['magni-gullvig', 'fiosa-gullvig'], 'marriage-svantje-aksel-schwarzblut')
  ],
  cadetBranches: [
    marriedAway('married-away-porunn-gullvig-schwarzblut', 'Clan Schwarzblut', 'marriage-detlaf-porunn-schwarzblut', 'house-schwarzblut', 'haus-schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    marriedAway('married-away-rannveig-gullvig-sterkr', 'Clan Sterkr', 'marriage-ubbe-rannveig-sterkr', 'house-sterkr', 'haus-sterkr', HOUSE_EMBLEMS.sterkr),
    marriedAway('married-away-udveig-gullvig-blutstahl', 'Clan Blutstahl', 'marriage-holgr-udveig-blutstahl', 'house-blutstahl', 'haus-blutstahl', HOUSE_EMBLEMS.blutstahl),
    marriedAway('married-away-gudlaug-gullvig-eisenbieger', 'Clan Eisenbieger', 'marriage-gudlaug-freki-gullvig', 'house-eisenbieger', 'haus-eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    marriedAway('married-away-eldrid-gullvig-frostauge', 'Clan Frostauge', 'marriage-eldrid-inghard-gullvig', 'house-frostauge', 'haus-frostauge', HOUSE_EMBLEMS.frostauge),
    marriedAway('married-away-asahel-gullvig-wargh', 'Clan Wargh', 'marriage-olmar-asahel-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    wardAway('ward-away-magni-gullvig-feuerhaar', 'Clan Feuerhaar', 'magni-gullvig', 'house-feuerhaar', 'haus-feuerhaar', HOUSE_EMBLEMS.feuerhaar)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-sten-sigrid-gullvig',
    parentPersonId: '',
    childIds: ['jorvik-gullvig', 'porunn-gullvig', 'norrik-gullvig'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1576',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Gullvig-Hausknoten; kein anderer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-sten-sigrid-gullvig',
    houseId: GULLVIG_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Kastav · Möwenfels',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'sten-gullvig',
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
    sourceRevision: 5,
    sourceModule: 'Clan Gullvig (überlieferte HTML-Familienakte)',
    sourceNote: 'Vollständiger Stammbaum ohne Personenfokus. Der eigentliche Stammbaum ordnet Skeld und Sven als Brüder Jorviks und Ealasaids ein; die Prosapassage nennt Skeld abweichend einen Vetter Svens. Für die Genealogie gilt die explizite Baumstruktur, der Widerspruch bleibt hier dokumentiert. Die beiden internen Ehen Olrun–Tjodrik und Birgdis–Vetrar werden jeweils mit einer zweiten Ehefassung der Frau dargestellt: Ihre Herkunftskarte bleibt im elterlichen Zweig, während nur die Ehefassung die gemeinsamen Kinder fortführt. Mündelschaften werden auf Nutzerwunsch nur in der jüngsten Generation ausgewertet: Magni wird als an Feuerhaar vermitteltes Mündel gespiegelt; Sven und Udveig erhalten trotz älterer Hinweise keinen Mündelrahmen und keine Mündelverknüpfung. Unbenannte Verlobten-Platzhalter der jüngsten Generation werden nicht importiert.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'chartLayoutPolicy'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-gullvig-gruender', 'haus-gullvig-gruenderin'],
      partnerships: ['haus-gullvig-gruenderbund'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.gullvig.folderPath
});
