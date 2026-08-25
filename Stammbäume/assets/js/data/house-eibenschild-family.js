import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_EIBENSCHILD_PORTRAITS } from './house-eibenschild-portraits.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';

const EIBENSCHILD_HOUSE_ID = 'house-eibenschild';
const SOURCE_GAP_ID = 'gap-eibenschild-founders-to-hjalmar-gerhild';

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
  'eibenschild-founder',
  'hjalmar-1538-eibenschild',
  'vidar-1566-eibenschild',
  'orm-1598-eibenschild',
  'hjalmar-1627-eibenschild',
  'gunnar-1654-eibenschild',
  'alrik-1681-eibenschild'
]);

function lineageRoleFor(personId) {
  return HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? EIBENSCHILD_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_EIBENSCHILD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === EIBENSCHILD_HOUSE_ID ? 'core' : 'married'),
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

function awayPerson(id, name, sex, birth, death, targetHouseName, options = {}) {
  return person(id, name, sex, birth, death, {
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
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

const PARTNERS_BY_ID = Object.freeze({
  'marriage-eibenschild-founders': ['eibenschild-founder', 'eibenschild-founder-spouse'],
  'marriage-hjalmar-gerhild-eibenschild': ['hjalmar-1538-eibenschild', 'gerhild-eibenschild-spouse'],
  'marriage-vidar-sigrun-eibenschild': ['vidar-1566-eibenschild', 'sigrun-eibenschild-spouse'],
  'marriage-eirik-alva-eibenschild': ['eirik-1570-eibenschild', 'alva-eibenschild-spouse'],
  'marriage-arvid-liv-eibenschild': ['arvid-liv-spouse', 'liv-1573-eibenschild'],
  'marriage-yrska-thorin-wellenschild': ['yrska-wellenschild', 'thorin-eibenschild'],
  'marriage-orm-ingrid-eibenschild': ['orm-1598-eibenschild', 'ingrid-eibenschild-spouse'],
  'marriage-torben-marit-wellenschild': ['torben-wellenschild', 'marit-eibenschild'],
  'marriage-rolf-dagmar-eibenschild': ['rolf-1601-eibenschild', 'dagmar-eibenschild-spouse'],
  'marriage-leif-dagny-eibenschild': ['leif-dagny-spouse', 'dagny-1605-eibenschild'],
  'marriage-hjalmar-thyra-eibenschild': ['hjalmar-1627-eibenschild', 'thyra-eibenschild-spouse'],
  'marriage-arvid-runa-eibenschild': ['arvid-runa-spouse', 'runa-1631-eibenschild'],
  'marriage-kjell-freydis-eibenschild': ['kjell-1630-eibenschild', 'freydis-eibenschild-spouse'],
  'marriage-gunnar-embla-eibenschild': ['gunnar-1654-eibenschild', 'embla-eibenschild-spouse'],
  'marriage-egil-svanhild-eibenschild': ['egil-svanhild-spouse', 'svanhild-1658-eibenschild'],
  'marriage-sten-ragnhild-eibenschild': ['sten-1657-eibenschild', 'ragnhild-eibenschild-spouse'],
  'marriage-olaf-eydis-eibenschild': ['olaf-eydis-spouse', 'eydis-1660-eibenschild'],
  'marriage-alrik-svala-eibenschild': ['alrik-1681-eibenschild', 'svala-eibenschild-spouse'],
  'marriage-torsten-liv-eibenschild': ['torsten-1685-eibenschild', 'liv-eibenschild-spouse'],
  'marriage-einar-inga-eibenschild': ['einar-1684-eibenschild', 'inga-eibenschild-spouse']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function withLayoutExtension(record, extensionName, extensionValue) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      [extensionName]: extensionValue,
      registryManagedExtensionFields: [extensionName]
    }
  };
}

function directlyAboveOnlyChild(partnershipId, childPersonId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignParentPairOverChildPersonId',
    childPersonId
  );
}

function alignLeafChildrenBelowPair(partnershipId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignChildGroupBelowParentPair',
    true
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'eibenschild-parentage',
    ...options
  });
}

function marriedAway({
  id,
  name,
  partnershipId,
  houseId,
  targetFamilyId,
  emblem = '',
  subtitle = `Wegverheiratet an ${name}`
}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

function unknownHouseBranch(personSlug, partnershipId) {
  return marriedAway({
    id: `married-away-${personSlug}-unknown`,
    name: 'Unbekanntes Haus',
    partnershipId,
    houseId: 'house-unknown',
    targetFamilyId: 'haus-unbekannt',
    subtitle: 'Wegverheiratet an ein unbekanntes Haus'
  });
}

export const HOUSE_EIBENSCHILD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-eibenschild',
    title: 'Clan Eibenschild',
    motto: '',
    description: 'Huskarlclan von Vagaborg auf den Klageschild-Inseln. Die Eibenschilde dienen dem Clan Wellenschild und sichern dessen Herrschaft im Inselgebiet.',
    emblem: KRONENTAL_HOUSE_EMBLEMS.eibenschild,
    houseProfile: KRONENTAL_HOUSE_PROFILES.eibenschild
  },
  houses: [
    house(EIBENSCHILD_HOUSE_ID, 'Clan Eibenschild', KRONENTAL_HOUSE_EMBLEMS.eibenschild),
    house('house-wellenschild', 'Clan Wellenschild', KRONENTAL_HOUSE_EMBLEMS.wellenschild),
    house('house-unknown', 'Unbekanntes Haus')
  ],
  persons: [
    person('eibenschild-founder', '???', 'male', '????', '????', {
      title: 'Unbekannter Gründer des Clans Eibenschild'
    }),
    person('eibenschild-founder-spouse', '???', 'female', '????', '????', {
      title: 'Unbekannte Mitgründerin des Clans Eibenschild'
    }),

    person('hjalmar-1538-eibenschild', 'Hjalmar Eibenschild', 'male', '1538', '1609', {
      title: 'Erster namentlich überlieferter Herr von Vagaborg'
    }),
    spouse('gerhild-eibenschild-spouse', 'Gerhild', 'female', '1542', '1616'),

    person('vidar-1566-eibenschild', 'Vidar Eibenschild', 'male', '1566', '1634'),
    spouse('sigrun-eibenschild-spouse', 'Sigrun', 'female', '1570', '1644'),
    person('eirik-1570-eibenschild', 'Eirik Eibenschild', 'male', '1570', '1648'),
    spouse('alva-eibenschild-spouse', 'Alva', 'female', '1574', '1655'),
    awayPerson('liv-1573-eibenschild', 'Liv Eibenschild', 'female', '1573', '1640', 'ein unbekanntes Haus'),
    spouse('arvid-liv-spouse', 'Arvid', 'male', '1569', '1637'),

    awayPerson('thorin-eibenschild', 'Thorin Eibenschild', 'male', '1595', '1688', 'Clan Wellenschild', {
      title: 'Eingeheiratet in Clan Wellenschild',
      tags: ['Eingeheiratet'],
      notes: 'Yrska Wellenschild führt die gemeinsame Linie im Wellenschild-Stammbaum fort; Magdis wird hier bewusst nicht doppelt dargestellt.'
    }),
    spouse('yrska-wellenschild', 'Yrska Wellenschild', 'female', '1604', '1698', 'house-wellenschild'),
    person('orm-1598-eibenschild', 'Orm Eibenschild', 'male', '1598', '1665'),
    spouse('ingrid-eibenschild-spouse', 'Ingrid', 'female', '1602', '1674'),
    awayPerson('marit-eibenschild', 'Marit Eibenschild', 'female', '1600', '1631', 'Clan Wellenschild', {
      notes: 'Torben Wellenschild führt die gemeinsame Linie im Wellenschild-Stammbaum fort; Reidar wird hier bewusst nicht doppelt dargestellt.'
    }),
    spouse('torben-wellenschild', 'Torben Wellenschild', 'male', '1601', '1628', 'house-wellenschild'),
    person('rolf-1601-eibenschild', 'Rolf Eibenschild', 'male', '1601', '1670'),
    spouse('dagmar-eibenschild-spouse', 'Dagmar', 'female', '1605', '1680'),
    awayPerson('dagny-1605-eibenschild', 'Dagny Eibenschild', 'female', '1605', '1672', 'ein unbekanntes Haus'),
    spouse('leif-dagny-spouse', 'Leif', 'male', '1602', '1668'),

    person('hjalmar-1627-eibenschild', 'Hjalmar Eibenschild', 'male', '1627', '1691'),
    spouse('thyra-eibenschild-spouse', 'Thyra', 'female', '1631', '1703'),
    awayPerson('runa-1631-eibenschild', 'Runa Eibenschild', 'female', '1631', '1702', 'ein unbekanntes Haus'),
    spouse('arvid-runa-spouse', 'Arvid', 'male', '1628', '1699'),
    person('kjell-1630-eibenschild', 'Kjell Eibenschild', 'male', '1630', '1694'),
    spouse('freydis-eibenschild-spouse', 'Freydis', 'female', '1634', '1705'),

    person('gunnar-1654-eibenschild', 'Gunnar Eibenschild', 'male', '1654', '1716'),
    spouse('embla-eibenschild-spouse', 'Embla', 'female', '1658', '1722'),
    awayPerson('svanhild-1658-eibenschild', 'Svanhild Eibenschild', 'female', '1658', '1729', 'ein unbekanntes Haus'),
    spouse('egil-svanhild-spouse', 'Egil', 'male', '1655', '1720'),
    person('sten-1657-eibenschild', 'Sten Eibenschild', 'male', '1657', '1719'),
    spouse('ragnhild-eibenschild-spouse', 'Ragnhild', 'female', '1661', '1728'),
    awayPerson('eydis-1660-eibenschild', 'Eydis Eibenschild', 'female', '1660', '1731', 'ein unbekanntes Haus'),
    spouse('olaf-eydis-spouse', 'Olaf', 'male', '1657', '1726'),

    person('alrik-1681-eibenschild', 'Alrik Eibenschild', 'male', '1681', '', {
      title: 'Huskarlherr von Vagaborg · Oberhaupt des Clans Eibenschild'
    }),
    spouse('svala-eibenschild-spouse', 'Svala', 'female', '1686', ''),
    person('torsten-1685-eibenschild', 'Torsten Eibenschild', 'male', '1685', ''),
    spouse('liv-eibenschild-spouse', 'Liv', 'female', '1690', ''),
    person('einar-1684-eibenschild', 'Einar Eibenschild', 'male', '1684', '1730'),
    spouse('inga-eibenschild-spouse', 'Inga', 'female', '1689', ''),

    person('hakon-1716-eibenschild', 'Hakon Eibenschild', 'male', '1716', ''),
    person('sigrid-1719-eibenschild', 'Sigrid Eibenschild', 'female', '1719', ''),
    person('astrid-1723-eibenschild', 'Astrid Eibenschild', 'female', '1723', ''),
    person('vidar-1718-eibenschild', 'Vidar Eibenschild', 'male', '1718', ''),
    person('runa-1722-eibenschild', 'Runa Eibenschild', 'female', '1722', ''),
    person('kjell-1715-eibenschild', 'Kjell Eibenschild', 'male', '1715', ''),
    person('marit-1720-eibenschild', 'Marit Eibenschild', 'female', '1720', ''),
    person('orm-1725-eibenschild', 'Orm Eibenschild', 'male', '1725', '')
  ],
  partnerships: [
    partnership('marriage-eibenschild-founders'),
    partnership('marriage-hjalmar-gerhild-eibenschild', { status: 'ended', end: '1609' }),
    partnership('marriage-vidar-sigrun-eibenschild', { status: 'ended', end: '1634' }),
    partnership('marriage-eirik-alva-eibenschild', { status: 'ended', end: '1648' }),
    partnership('marriage-arvid-liv-eibenschild', { status: 'ended', end: '1637' }),
    partnership('marriage-yrska-thorin-wellenschild', { status: 'ended', end: '1688' }),
    partnership('marriage-orm-ingrid-eibenschild', { status: 'ended', end: '1665' }),
    partnership('marriage-torben-marit-wellenschild', { status: 'ended', end: '1628' }),
    directlyAboveOnlyChild('marriage-rolf-dagmar-eibenschild', 'kjell-1630-eibenschild', { status: 'ended', end: '1670' }),
    partnership('marriage-leif-dagny-eibenschild', { status: 'ended', end: '1668' }),
    partnership('marriage-hjalmar-thyra-eibenschild', { status: 'ended', end: '1691' }),
    partnership('marriage-arvid-runa-eibenschild', { status: 'ended', end: '1699' }),
    partnership('marriage-kjell-freydis-eibenschild', { status: 'ended', end: '1694' }),
    partnership('marriage-gunnar-embla-eibenschild', { status: 'ended', end: '1716' }),
    partnership('marriage-egil-svanhild-eibenschild', { status: 'ended', end: '1720' }),
    directlyAboveOnlyChild('marriage-sten-ragnhild-eibenschild', 'einar-1684-eibenschild', { status: 'ended', end: '1719' }),
    partnership('marriage-olaf-eydis-eibenschild', { status: 'ended', end: '1726' }),
    alignLeafChildrenBelowPair('marriage-alrik-svala-eibenschild'),
    alignLeafChildrenBelowPair('marriage-torsten-liv-eibenschild'),
    alignLeafChildrenBelowPair('marriage-einar-inga-eibenschild', { status: 'ended', end: '1730' })
  ],
  parentages: [
    ...childrenOf(['hjalmar-1538-eibenschild'], 'marriage-eibenschild-founders', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Hjalmar und Gerhild.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['vidar-1566-eibenschild', 'eirik-1570-eibenschild', 'liv-1573-eibenschild'], 'marriage-hjalmar-gerhild-eibenschild'),
    ...childrenOf(['thorin-eibenschild', 'orm-1598-eibenschild', 'marit-eibenschild'], 'marriage-vidar-sigrun-eibenschild'),
    ...childrenOf(['rolf-1601-eibenschild', 'dagny-1605-eibenschild'], 'marriage-eirik-alva-eibenschild'),
    ...childrenOf(['hjalmar-1627-eibenschild', 'runa-1631-eibenschild'], 'marriage-orm-ingrid-eibenschild'),
    ...childrenOf(['kjell-1630-eibenschild'], 'marriage-rolf-dagmar-eibenschild'),
    ...childrenOf(['gunnar-1654-eibenschild', 'svanhild-1658-eibenschild'], 'marriage-hjalmar-thyra-eibenschild'),
    ...childrenOf(['sten-1657-eibenschild', 'eydis-1660-eibenschild'], 'marriage-kjell-freydis-eibenschild'),
    ...childrenOf(['alrik-1681-eibenschild', 'torsten-1685-eibenschild'], 'marriage-gunnar-embla-eibenschild'),
    ...childrenOf(['einar-1684-eibenschild'], 'marriage-sten-ragnhild-eibenschild'),
    ...childrenOf(['hakon-1716-eibenschild', 'sigrid-1719-eibenschild', 'astrid-1723-eibenschild'], 'marriage-alrik-svala-eibenschild'),
    ...childrenOf(['vidar-1718-eibenschild', 'runa-1722-eibenschild'], 'marriage-torsten-liv-eibenschild'),
    ...childrenOf(['kjell-1715-eibenschild', 'marit-1720-eibenschild', 'orm-1725-eibenschild'], 'marriage-einar-inga-eibenschild')
  ],
  cadetBranches: [
    unknownHouseBranch('liv-1573-eibenschild', 'marriage-arvid-liv-eibenschild'),
    marriedAway({
      id: 'married-away-thorin-eibenschild-wellenschild',
      name: 'Clan Wellenschild',
      partnershipId: 'marriage-yrska-thorin-wellenschild',
      houseId: 'house-wellenschild',
      targetFamilyId: 'haus-wellenschild',
      emblem: KRONENTAL_HOUSE_EMBLEMS.wellenschild,
      subtitle: 'Eingeheiratet in Clan Wellenschild'
    }),
    marriedAway({
      id: 'married-away-marit-eibenschild-wellenschild',
      name: 'Clan Wellenschild',
      partnershipId: 'marriage-torben-marit-wellenschild',
      houseId: 'house-wellenschild',
      targetFamilyId: 'haus-wellenschild',
      emblem: KRONENTAL_HOUSE_EMBLEMS.wellenschild
    }),
    unknownHouseBranch('dagny-1605-eibenschild', 'marriage-leif-dagny-eibenschild'),
    unknownHouseBranch('runa-1631-eibenschild', 'marriage-arvid-runa-eibenschild'),
    unknownHouseBranch('svanhild-1658-eibenschild', 'marriage-egil-svanhild-eibenschild'),
    unknownHouseBranch('eydis-1660-eibenschild', 'marriage-olaf-eydis-eibenschild')
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-eibenschild-founders',
    parentPersonId: '',
    childIds: ['hjalmar-1538-eibenschild'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1538',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Eibenschild-Hausknoten; kein anderer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-eibenschild-founders',
    houseId: EIBENSCHILD_HOUSE_ID,
    crestSubtitle: 'Huskarlclan von Vagaborg · Klageschild-Inseln',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'eibenschild-founder',
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
    sourceRevision: 1,
    sourceModule: 'Clan Eibenschild (auf Nutzerwunsch ergänzt)',
    sourceNote: 'Vollständiger Stammbaum ohne Personenfokus: unbekanntes Gründerpaar, Hausknoten, genau ein serieller Zeitsprung und anschließend die überlieferte Linie ab Hjalmars Generation. Thorin und Marit sind Geschwister; ihre beiden Ehen werden mit den kanonischen Wellenschild-Gegenakten gespiegelt. Da dort Yrska beziehungsweise Torben die Linien fortführen, werden Magdis und Reidar ausschließlich im Wellenschild-Stammbaum gezeigt. Die Eibenschild-Hauptlinie läuft über Orm, eine zweite Linie über Rolf. Historisch wegverheiratete Frauen erhalten direkte Hausknoten; die jüngste Generation bleibt unverheiratet.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'chartLayoutPolicy'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-eibenschild-gruender', 'haus-eibenschild-gruenderin'],
      partnerships: ['haus-eibenschild-gruenderbund'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.eibenschild.folderPath
});
