import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriedAwayBranch,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SCHWARZBLUT_PORTRAITS } from './house-schwarzblut-portraits.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';
import { KRONENTAL_HOUSE_EMBLEMS } from './kronental-house-profiles.js';

const SCHWARZBLUT_HOUSE_ID = 'house-schwarzblut';

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
  'skjoldur-jaernblod',
  'detlaf-schwarzblut',
  'eirik-schwarzblut',
  'herleif-schwarzblut',
  'ivarr-schwarzblut',
  'styrbjorn-schwarzblut',
  'svanur-schwarzblut'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return ['sindre-schwarzblut', 'njall-schwarzblut'].includes(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SCHWARZBLUT_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SCHWARZBLUT_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SCHWARZBLUT_HOUSE_ID ? 'core' : 'married'),
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

function affairPartner(id, name, sex, birth, death, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: 'affair',
    lineageRole: 'branch',
    title: options.title || 'Affäre',
    tags: [...(options.tags || []), 'Affäre']
  });
}

function victim(id, name, sex, birth, death, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: 'forced',
    lineageRole: 'branch',
    title: options.title || 'Opfer einer erzwungenen Verbindung',
    tags: [...(options.tags || []), 'Opfer']
  });
}

function bastard(id, name, sex, birth, death, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    familyRole: 'bastard',
    tags: [...(options.tags || []), 'Bastard']
  });
}

function house(id, name, emblem = '', status = 'active') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status,
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

const PARTNERS_BY_ID = Object.freeze({
  'marriage-skjoldur-gunnhild-jaernblod': ['skjoldur-jaernblod', 'gunnhild-varangr'],
  'marriage-detlaf-porunn-schwarzblut': ['detlaf-schwarzblut', 'porunn-gullvig'],
  'marriage-borghild-gunnar-schwarzblut': ['gunnar-silberblut', 'borghild-schwarzblut'],
  'marriage-geirfast-ylandis-schwarzblut': ['geirfast-schwarzblut', 'ylandis-silberblut'],
  'marriage-eirik-iseld-schwarzblut': ['eirik-schwarzblut', 'iseld-goldglanz'],
  'marriage-jerrik-quolga-varangr': ['jerrik-varangr', 'quolga-schwarzblut'],
  'affair-weskald-murda-schwarzblut': ['weskald-schwarzblut', 'murda'],
  'forced-weskald-ragnhild-schwarzblut': ['weskald-schwarzblut', 'ragnhild'],
  'marriage-herleif-branhildr-schwarzblut': ['herleif-schwarzblut', 'branhildr-vragi'],
  'marriage-lillrun-kalfur-schwarzblut': ['kalfur-kaltherz', 'lillrun-schwarzblut'],
  'marriage-ivarr-myrna-schwarzblut': ['ivarr-schwarzblut', 'myrna-silberblut'],
  'marriage-halvar-wjardis-feuerherz': ['halvar-feuerherz', 'wjardis-schwarzblut'],
  'affair-wjardis-xarfeld-schwarzblut': ['wjardis-schwarzblut', 'xarfeld'],
  'marriage-fostine-styrbjorn-varangr': ['styrbjorn-schwarzblut', 'fostine-varangr'],
  'marriage-alta-aegir-schwarzblut': ['aegir-frostauge', 'alta-schwarzblut'],
  'marriage-svanur-telma-schwarzblut': ['svanur-schwarzblut', 'telma-silberblut'],
  'marriage-svantje-aksel-schwarzblut': ['aksel-gullvig', 'svantje-schwarzblut'],
  'marriage-sindre-hillevi-schwarzblut': ['sindre-schwarzblut', 'hillevi-blutstahl'],
  'affair-sindre-torgun-schwarzblut': ['sindre-schwarzblut', 'torgun']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignPartnerOverChildren(record, partnerPersonId, { reserveLeafChildLane = false } = {}) {
  const registryManagedExtensionFields = ['chartAlignPartnerOverChildrenPersonId'];
  if (reserveLeafChildLane) registryManagedExtensionFields.push('chartReserveLeafChildLane');
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId,
      ...(reserveLeafChildLane ? { chartReserveLeafChildLane: true } : {}),
      registryManagedExtensionFields
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'schwarzblut-parentage',
    ...options
  });
}

function bastardChildrenOf(childIds, partnershipId, notes) {
  return childrenOf(childIds, partnershipId, {
    legitimacy: 'illegitimate',
    visibility: 'private',
    notes
  });
}

function marriedAway(
  id,
  name,
  partnershipId,
  houseId,
  targetFamilyId,
  emblem = '',
  { alignBelowPartnership = false } = {}
) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: `Wegverheiratet an ${name}`,
    extensions: {
      ...(alignBelowPartnership ? { chartAlignBelowPartnership: true } : {}),
      registryManagedFields: [
        'name',
        'parentPartnershipId',
        'houseId',
        'targetFamilyId',
        'emblem',
        'subtitle'
      ],
      ...(alignBelowPartnership
        ? { registryManagedExtensionFields: ['chartAlignBelowPartnership'] }
        : {})
    }
  });
}

const SOURCE_GAP_ID = 'gap-skjoldur-to-detlaf-generation-schwarzblut';

export const HOUSE_SCHWARZBLUT_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-schwarzblut',
    title: 'Clan Schwarzblut',
    motto: '',
    description: 'Hesirenclan von Nebelwacht im Schwarzfjord und Nachfahren des erloschenen Järnblod-Clans. Die Schwarzblut sind für Seefahrt, Bergbau und unbeugsame Küstenkrieger bekannt.',
    emblem: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES.schwarzblut
  },
  houses: [
    house(SCHWARZBLUT_HOUSE_ID, 'Clan Schwarzblut', KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut),
    house('house-jaernblod', 'Clan Järnblod', KRAEHENMOOR_HOUSE_EMBLEMS.jaernblod, 'extinct'),
    house('house-varangr', 'Clan Varangr', ALDRIMAR_HOUSE_EMBLEMS.varangr),
    house('house-gullvig', 'Clan Gullvig', KRONENTAL_HOUSE_EMBLEMS.gullvig),
    house('house-silberblut', 'Clan Silberblut', KRAEHENMOOR_HOUSE_EMBLEMS.silberblut),
    house('house-goldglanz', 'Clan Goldglanz', KRAEHENMOOR_HOUSE_EMBLEMS.goldglanz),
    house('house-kaltherz', 'Clan Kaltherz', KRAEHENMOOR_HOUSE_EMBLEMS.kaltherz),
    house('house-vragi', 'Clan Vragi', KRAEHENMOOR_HOUSE_EMBLEMS.vragi),
    house('house-feuerherz', 'Clan Feuerherz', KRAEHENMOOR_HOUSE_EMBLEMS.feuerherz),
    house('house-frostauge', 'Clan Frostauge'),
    house('house-blutstahl', 'Clan Blutstahl', KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl)
  ],
  persons: [
    person('skjoldur-jaernblod', 'Skjoldur Järnblod', 'male', '????', '????', {
      houseId: 'house-jaernblod',
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Järnblod-Spross · Gründer des Clans Schwarzblut',
      tags: ['Gründer', 'Kadettenhausgründer']
    }),
    spouse('gunnhild-varangr', 'Gunnhild', 'female', '????', '????', 'house-varangr', {
      title: 'Varangr-Frau · Mitbegründerin des Clans Schwarzblut',
      tags: ['Gründerin']
    }),

    person('detlaf-schwarzblut', 'Detlaf Schwarzblut', 'male', '1580', '1628', {
      title: 'Hesir des Clans Schwarzblut · Admiral und Seefahrer'
    }),
    person('borghild-schwarzblut', 'Borghild Schwarzblut', 'female', '1583', '1650', {
      title: 'Wegverheiratet an Clan Silberblut',
      tags: ['Wegverheiratet']
    }),
    person('geirfast-schwarzblut', 'Geirfast Schwarzblut', 'male', '1586', '1632'),
    spouse('porunn-gullvig', 'Porunn Gullvig', 'female', '1580', '????', 'house-gullvig'),
    spouse('gunnar-silberblut', 'Gunnar Silberblut', 'male', '1582', '1625', 'house-silberblut'),
    spouse('ylandis-silberblut', 'Ylandis Silberblut', 'female', '1585', '1641', 'house-silberblut'),

    person('eirik-schwarzblut', 'Eirik Schwarzblut', 'male', '1610', '1679', {
      title: 'Hesir des Clans Schwarzblut'
    }),
    person('quolga-schwarzblut', 'Quolga Schwarzblut', 'female', '1613', '1664', {
      title: 'Wegverheiratet an Clan Varangr',
      tags: ['Wegverheiratet']
    }),
    person('weskald-schwarzblut', 'Weskald Schwarzblut', 'male', '1606', '1645', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['murda', 'ragnhild'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('iseld-goldglanz', 'Iseld Goldglanz', 'female', '1608', '1662', 'house-goldglanz'),
    spouse('jerrik-varangr', 'Jerrik Varangr', 'male', '1612', '1639', 'house-varangr'),
    affairPartner('murda', 'Murda', 'female', '1618', '1655', {
      title: 'Affäre Weskalds · Mutter Carlsteins'
    }),
    victim('ragnhild', 'Ragnhild', 'female', '1623', '1684', {
      title: 'Opfer Weskalds · Mutter Vigmars',
      notes: 'Die Quelle bezeichnet Ragnhild ausdrücklich als Weskalds Opfer; diese Verbindung wird nicht als Affäre verharmlost.'
    }),

    person('herleif-schwarzblut', 'Herleif Schwarzblut', 'male', '1630', '1694', {
      title: 'Hesir des Clans Schwarzblut'
    }),
    person('lillrun-schwarzblut', 'Lillrun Schwarzblut', 'female', '1633', '1684', {
      title: 'Wegverheiratet an Clan Kaltherz',
      tags: ['Wegverheiratet']
    }),
    bastard('carlstein-schwarzblut', 'Carlstein Schwarzblut', 'male', '1635', '1699', {
      title: 'Bastardsohn Weskalds und Murdas'
    }),
    bastard('vigmar-schwarzblut', 'Vigmar Schwarzblut', 'male', '1643', '1704', {
      title: 'Bastardsohn Weskalds und seines Opfers Ragnhild'
    }),
    spouse('branhildr-vragi', 'Branhildr Vragi', 'female', '1631', '1698', 'house-vragi'),
    spouse('kalfur-kaltherz', 'Kalfur Kaltherz', 'male', '1637', '1689', 'house-kaltherz'),

    person('ivarr-schwarzblut', 'Ivarr Schwarzblut', 'male', '1650', '1711', {
      title: 'Hesir des Clans Schwarzblut'
    }),
    person('wjardis-schwarzblut', 'Wjardis Schwarzblut', 'female', '1654', '1719', {
      title: 'Wegverheiratet an Clan Feuerherz',
      tags: ['Wegverheiratet'],
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['xarfeld', 'halvar-feuerherz'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('myrna-silberblut', 'Myrna Silberblut', 'female', '1655', '1699', 'house-silberblut'),
    spouse('halvar-feuerherz', 'Halvar Feuerherz', 'male', '1658', '1720', 'house-feuerherz'),
    affairPartner('xarfeld', 'Xarfeld', 'male', '1680', '', {
      title: 'Affäre Wjardis’ · Vater Prebens'
    }),

    person('styrbjorn-schwarzblut', 'Styrbjorn Schwarzblut', 'male', '1675', '', {
      title: 'Hesir des Clans Schwarzblut'
    }),
    person('alta-schwarzblut', 'Alta Schwarzblut', 'female', '1673', '', {
      title: 'Wegverheiratet an Clan Frostauge',
      tags: ['Wegverheiratet']
    }),
    bastard('preben-schwarzblut', 'Preben Schwarzblut', 'male', '1698', '', {
      title: 'Bastardsohn Wjardis’ und Xarfelds'
    }),
    spouse('fostine-varangr', 'Fostine Varangr', 'female', '1676', '', 'house-varangr'),
    spouse('aegir-frostauge', 'Aegir Frostauge', 'male', '1671', '', 'house-frostauge'),

    person('svanur-schwarzblut', 'Svanur Schwarzblut', 'male', '1698', '', {
      title: 'Erster Erbe des Clans Schwarzblut'
    }),
    person('svantje-schwarzblut', 'Svantje Schwarzblut', 'female', '1704', '', {
      title: 'Wegverheiratet an Clan Gullvig',
      tags: ['Wegverheiratet']
    }),
    person('sindre-schwarzblut', 'Sindre Schwarzblut', 'male', '1706', '', {
      title: 'Jüngerer Sohn Styrbjorns und Fostines',
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['hillevi-blutstahl', 'torgun'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    person('rodmar-schwarzblut', 'Rodmar Schwarzblut', 'male', '1706', '', {
      title: 'Jüngerer Sohn Styrbjorns und Fostines'
    }),
    spouse('telma-silberblut', 'Telma Silberblut', 'female', '1703', '', 'house-silberblut'),
    spouse('aksel-gullvig', 'Aksel Gullvig', 'male', '1700', '', 'house-gullvig'),
    spouse('hillevi-blutstahl', 'Hillevi Blutstahl', 'female', '1700', '', 'house-blutstahl'),
    affairPartner('torgun', 'Torgun', 'female', '1711', '', {
      title: 'Affäre Sindres · Mutter Illugis'
    }),

    person('njall-schwarzblut', 'Njall Schwarzblut', 'male', '1721', '', {
      title: 'Erster Sohn Svanurs und Telmas'
    }),
    person('felga-schwarzblut', 'Felga Schwarzblut', 'female', '1723', ''),
    person('pall-schwarzblut', 'Pall Schwarzblut', 'male', '1729', ''),
    person('kolbein-schwarzblut', 'Kolbein Schwarzblut', 'male', '1726', ''),
    person('jurgla-schwarzblut', 'Jurgla Schwarzblut', 'female', '1730', ''),
    bastard('illugi-schwarzblut', 'Illugi Schwarzblut', 'male', '1728', '', {
      title: 'Bastardsohn Sindres und Torguns'
    })
  ],
  partnerships: [
    partnership('marriage-skjoldur-gunnhild-jaernblod', { status: 'ended' }),
    partnership('marriage-detlaf-porunn-schwarzblut', { status: 'ended', end: '1628' }),
    partnership('marriage-borghild-gunnar-schwarzblut', { status: 'ended', end: '1625' }),
    partnership('marriage-geirfast-ylandis-schwarzblut', { status: 'ended', end: '1632' }),
    partnership('marriage-eirik-iseld-schwarzblut', { status: 'ended', end: '1662' }),
    partnership('marriage-jerrik-quolga-varangr', { status: 'ended', end: '1639' }),
    alignPartnerOverChildren(
      partnership('affair-weskald-murda-schwarzblut', {
        type: 'affair',
        status: 'ended',
        end: '1645',
        visibility: 'private'
      }),
      'murda'
    ),
    alignPartnerOverChildren(
      partnership('forced-weskald-ragnhild-schwarzblut', {
        type: 'forced',
        status: 'ended',
        end: '1645',
        visibility: 'private',
        notes: 'Ragnhild ist ein Opfer Weskalds und keine freiwillige Affäre.'
      }),
      'ragnhild'
    ),
    partnership('marriage-herleif-branhildr-schwarzblut', { status: 'ended', end: '1694' }),
    partnership('marriage-lillrun-kalfur-schwarzblut', { status: 'ended', end: '1684' }),
    partnership('marriage-ivarr-myrna-schwarzblut', { status: 'ended', end: '1699' }),
    partnership('marriage-halvar-wjardis-feuerherz', { status: 'ended', end: '1719' }),
    alignPartnerOverChildren(
      partnership('affair-wjardis-xarfeld-schwarzblut', {
        type: 'affair',
        status: 'ended',
        end: '1719',
        visibility: 'private'
      }),
      'xarfeld',
      { reserveLeafChildLane: true }
    ),
    partnership('marriage-fostine-styrbjorn-varangr'),
    partnership('marriage-alta-aegir-schwarzblut'),
    partnership('marriage-svanur-telma-schwarzblut'),
    partnership('marriage-svantje-aksel-schwarzblut'),
    alignPartnerOverChildren(
      partnership('marriage-sindre-hillevi-schwarzblut'),
      'hillevi-blutstahl',
      { reserveLeafChildLane: true }
    ),
    alignPartnerOverChildren(
      partnership('affair-sindre-torgun-schwarzblut', {
        type: 'affair',
        visibility: 'private'
      }),
      'torgun',
      { reserveLeafChildLane: true }
    )
  ],
  parentages: [
    ...childrenOf(
      ['detlaf-schwarzblut', 'borghild-schwarzblut', 'geirfast-schwarzblut'],
      'marriage-skjoldur-gunnhild-jaernblod',
      {
        type: 'claimed',
        legitimacy: 'unknown',
        certainty: 'probable',
        notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
        extensions: { timeJumpId: SOURCE_GAP_ID }
      }
    ),
    ...childrenOf(['eirik-schwarzblut', 'quolga-schwarzblut'], 'marriage-detlaf-porunn-schwarzblut'),
    ...childrenOf(['weskald-schwarzblut'], 'marriage-geirfast-ylandis-schwarzblut'),
    ...childrenOf(['herleif-schwarzblut', 'lillrun-schwarzblut'], 'marriage-eirik-iseld-schwarzblut'),
    ...bastardChildrenOf(
      ['carlstein-schwarzblut'],
      'affair-weskald-murda-schwarzblut',
      'Carlstein entstammt Weskalds Affäre mit Murda.'
    ),
    ...bastardChildrenOf(
      ['vigmar-schwarzblut'],
      'forced-weskald-ragnhild-schwarzblut',
      'Vigmar entstammt der erzwungenen Verbindung Weskalds mit seinem Opfer Ragnhild.'
    ),
    ...childrenOf(['ivarr-schwarzblut', 'wjardis-schwarzblut'], 'marriage-herleif-branhildr-schwarzblut'),
    ...childrenOf(['styrbjorn-schwarzblut', 'alta-schwarzblut'], 'marriage-ivarr-myrna-schwarzblut'),
    ...bastardChildrenOf(
      ['preben-schwarzblut'],
      'affair-wjardis-xarfeld-schwarzblut',
      'Preben entstammt Wjardis’ Affäre mit Xarfeld und nicht ihrer Ehe mit Halvar Feuerherz.'
    ),
    ...childrenOf(
      ['svanur-schwarzblut', 'svantje-schwarzblut', 'sindre-schwarzblut', 'rodmar-schwarzblut'],
      'marriage-fostine-styrbjorn-varangr'
    ),
    ...childrenOf(['njall-schwarzblut', 'felga-schwarzblut', 'pall-schwarzblut'], 'marriage-svanur-telma-schwarzblut'),
    ...childrenOf(['kolbein-schwarzblut', 'jurgla-schwarzblut'], 'marriage-sindre-hillevi-schwarzblut'),
    ...bastardChildrenOf(
      ['illugi-schwarzblut'],
      'affair-sindre-torgun-schwarzblut',
      'Illugi entstammt Sindres Affäre mit Torgun und nicht seiner Ehe mit Hillevi Blutstahl.'
    )
  ],
  cadetBranches: [
    marriedAway(
      'married-away-borghild-schwarzblut-silberblut',
      'Clan Silberblut',
      'marriage-borghild-gunnar-schwarzblut',
      'house-silberblut',
      'haus-silberblut',
      KRAEHENMOOR_HOUSE_EMBLEMS.silberblut
    ),
    marriedAway(
      'married-away-quolga-schwarzblut-varangr',
      'Clan Varangr',
      'marriage-jerrik-quolga-varangr',
      'house-varangr',
      'haus-varangr',
      ALDRIMAR_HOUSE_EMBLEMS.varangr
    ),
    marriedAway(
      'married-away-lillrun-schwarzblut-kaltherz',
      'Clan Kaltherz',
      'marriage-lillrun-kalfur-schwarzblut',
      'house-kaltherz',
      'haus-kaltherz',
      KRAEHENMOOR_HOUSE_EMBLEMS.kaltherz
    ),
    marriedAway(
      'married-away-wjardis-schwarzblut-feuerherz',
      'Clan Feuerherz',
      'marriage-halvar-wjardis-feuerherz',
      'house-feuerherz',
      'haus-feuerherz',
      KRAEHENMOOR_HOUSE_EMBLEMS.feuerherz,
      { alignBelowPartnership: true }
    ),
    marriedAway(
      'married-away-alta-schwarzblut-frostauge',
      'Clan Frostauge',
      'marriage-alta-aegir-schwarzblut',
      'house-frostauge',
      'haus-frostauge'
    ),
    marriedAway(
      'married-away-svantje-schwarzblut-gullvig',
      'Clan Gullvig',
      'marriage-svantje-aksel-schwarzblut',
      'house-gullvig',
      'haus-gullvig',
      KRONENTAL_HOUSE_EMBLEMS.gullvig
    )
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-skjoldur-gunnhild-jaernblod',
    parentPersonId: '',
    childIds: ['detlaf-schwarzblut', 'borghild-schwarzblut', 'geirfast-schwarzblut'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1580',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Schwarzblut-Hausknoten; keine Person und kein weiterer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-skjoldur-gunnhild-jaernblod',
    houseId: SCHWARZBLUT_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Nebelwacht · Nachfahren der Järnblod',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'jaernblod-origin-schwarzblut',
      houseId: 'house-jaernblod',
      name: 'Clan Järnblod',
      subtitle: 'Ausgestorbener Norrnaigh-Ursprungsclan',
      emblem: KRAEHENMOOR_HOUSE_EMBLEMS.jaernblod,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['skjoldur-jaernblod'],
      targetFamilyId: 'haus-jaernblod',
      notes: 'Skjoldur Järnblod begründet gemeinsam mit Gunnhild den Schwarzblut-Zweig.',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'skjoldur-jaernblod',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    sourceFamilyId: 'haus-jaernblod',
    sourceRevision: 2,
    sourceModule: 'Clan Schwarzblut (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige überlieferte Schwarzblut-Stammbaum wird ohne Personenfokus von Skjoldur Järnblod und Gunnhild bis zur jüngsten Generation des Jahres 1740 gezeigt. Sven Gullvig wird nach ausdrücklicher Vorgabe weder als Mündel noch als Person eingetragen. Weskald steht zwischen Murda und Ragnhild; Carlstein gehört ausschließlich zur Affäre mit Murda, Vigmar ausschließlich zur erzwungenen Opferbeziehung mit Ragnhild. Wjardis steht zwischen Halvar Feuerherz und Xarfeld; Preben stammt ausschließlich aus der Affäre mit Xarfeld. Sindre steht zwischen Torgun und Hillevi Blutstahl; Kolbein und Jurgla gehören zur Ehe mit Hillevi, Illugi ausschließlich zur Affäre mit Torgun. Die Quellschreibweise Brandhild wird anhand der eigentlichen Personenzeile zu Branhildr normalisiert. Unbenannte Verlobtenfelder werden nicht importiert.',
    registryTombstones: {
      persons: ['haus-schwarzblut-gruender', 'haus-schwarzblut-gruenderin'],
      partnerships: ['marriage-haus-schwarzblut-founders']
    },
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'sourceFamilyId',
      'sourceNote'
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
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse']
  }
});
