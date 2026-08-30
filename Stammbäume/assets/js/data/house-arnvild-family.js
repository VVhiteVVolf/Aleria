import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createExtinctBranch,
  createFamilyPerson,
  createMarriedAwayBranch,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { HOUSE_ARNVILD_PORTRAITS } from './house-arnvild-portraits.js';
import {
  SCHWARZFENN_EXTINCT_HOUSE_GROUPS,
  SCHWARZFENN_HOUSE_EMBLEMS,
  SCHWARZFENN_HOUSE_PROFILES
} from './schwarzfenn-house-profiles.js';

const ARNVILD_HOUSE_ID = 'house-arnvild';
const FOUNDER_TIME_JUMP_ID = 'gap-kodlak-to-lifthrasir-skalli-arnvild';

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
  'kodlak-arnvild',
  'lifthrasir-arnvild',
  'sigtrygg-arnvild',
  'ljotulf-arnvild',
  'magnus-arnvild'
]);

const HEIR_IDS = new Set(['vorn-arnvild', 'poltar-arnvild']);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? ARNVILD_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_ARNVILD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === ARNVILD_HOUSE_ID ? 'core' : 'married'),
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
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-arnvild--${id}`),
    houseId,
    familyRole: 'married',
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

const COUPLES = Object.freeze({
  founders: ['kodlak-arnvild', 'alva-arnvild'],
  lifthrasir: ['lifthrasir-arnvild', 'saga-elder-helgr'],
  skalli: ['thorlak-graumahne', 'skalli-arnvild'],
  sigtrygg: ['lysveig-feuerhaar', 'sigtrygg-arnvild'],
  vefrun: ['arvid-helgr', 'vefrun-arnvild'],
  ljotulf: ['ljotulf-arnvild', 'hildegard-arnvild-spouse'],
  bergdis: ['einarr-ragnulf', 'bergdis-arnvild'],
  stigandr: ['stigandr-arnvild', 'ulfhild-arnvild-spouse'],
  magnus: ['magnus-arnvild', 'fasteid-arnvild-spouse'],
  torgunna: ['leinkir-graumahne', 'torgunna-arnvild'],
  unnarr: ['unnarr-arnvild', 'olaug-arnvild-spouse'],
  vorn: ['vorn-arnvild', 'saga-helgr'],
  orka: ['ithmar-helgr', 'orka-arnvild'],
  haki: ['haki-arnvild', 'ljosdis-arnvild-spouse']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-kodlak-alva-arnvild': COUPLES.founders,
  'marriage-lifthrasir-saga-arnvild': COUPLES.lifthrasir,
  'marriage-thorlak-skalli-graumahne': COUPLES.skalli,
  'marriage-lysveig-sigtrygg-feuerhaar': COUPLES.sigtrygg,
  'marriage-arvid-vefrun-helgr': COUPLES.vefrun,
  'marriage-ljotulf-hildegard-arnvild': COUPLES.ljotulf,
  'marriage-einarr-bergdis-ragnulf': COUPLES.bergdis,
  'marriage-stigandr-ulfhild-arnvild': COUPLES.stigandr,
  'marriage-magnus-fasteid-arnvild': COUPLES.magnus,
  'marriage-leinkir-torgunna-graumahne': COUPLES.torgunna,
  'marriage-unnarr-olaug-arnvild': COUPLES.unnarr,
  'marriage-saga-vorn-arnvild': COUPLES.vorn,
  'marriage-ithmar-orka-helgr': COUPLES.orka,
  'engagement-haki-ljosdis-arnvild': COUPLES.haki
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'arnvild-parentage',
    ...options
  });
}

function marriedAway(id, name, parentPartnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: `Wegverheiratet an ${name}`,
    notes: 'Die fremde Nachkommenschaft wird ausschließlich in der verknüpften Hausakte fortgeführt.'
  });
}

export const HOUSE_ARNVILD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-arnvild',
    title: 'Clan Arnvild',
    motto: '…',
    description: 'Kürzlich ausgelöschter Hesirenclan von Flusswall. Die Arnvild waren Runenhauer, Baumeister und Begründer der religiösen Steinmetzgilde der Glyphenformer.',
    emblem: SCHWARZFENN_HOUSE_EMBLEMS.arnvild,
    houseProfile: SCHWARZFENN_HOUSE_PROFILES.arnvild
  },
  houses: [
    house(ARNVILD_HOUSE_ID, 'Clan Arnvild', SCHWARZFENN_HOUSE_EMBLEMS.arnvild, 'extinct'),
    house('house-helgr', 'Clan Helgr', SCHWARZFENN_HOUSE_EMBLEMS.helgr),
    house('house-graumahne', 'Clan Graumähne', SCHWARZFENN_HOUSE_EMBLEMS.graumahne),
    house('house-ragnulf', 'Clan Ragnulf', SCHWARZFENN_HOUSE_EMBLEMS.ragnulf),
    house('house-feuerhaar', 'Clan Feuerhaar', IVARSHEIM_HOUSE_EMBLEMS.feuerhaar)
  ],
  persons: [
    person('kodlak-arnvild', 'Kodlak Arnvild', 'male', '????', '????', {
      title: 'Gründer und erster überlieferter Hesir des Clans Arnvild'
    }),
    spouse('alva-arnvild', 'Alva', 'female', '????', '????'),

    person('lifthrasir-arnvild', 'Lifthrasir Arnvild', 'male', '1518', '1571', {
      title: 'Hesir des Clans Arnvild'
    }),
    spouse('saga-elder-helgr', 'Saga Helgr', 'female', '1520', '????', 'house-helgr'),
    awayWoman('skalli-arnvild', 'Skalli Arnvild', '1520', '1539', 'Clan Graumähne'),
    spouse('thorlak-graumahne', 'Thorlak Graumähne', 'male', '1515', '1579', 'house-graumahne'),

    person('sigtrygg-arnvild', 'Sigtrygg Arnvild', 'male', '1541', '1598', {
      title: 'Hesir des Clans Arnvild'
    }),
    spouse('lysveig-feuerhaar', 'Lysveig Feuerhaar', 'female', '1542', '1609', 'house-feuerhaar'),
    awayWoman('vefrun-arnvild', 'Vefrún Arnvild', '1555', '1632', 'Clan Helgr'),
    spouse('arvid-helgr', 'Arvid Helgr', 'male', '1556', '1666', 'house-helgr'),

    person('ljotulf-arnvild', 'Ljotulf Arnvild', 'male', '1562', '1625', {
      title: 'Hesir des Clans Arnvild'
    }),
    spouse('hildegard-arnvild-spouse', 'Hildegard', 'female', '1567', '1626'),
    awayWoman('bergdis-arnvild', 'Bergdis Arnvild', '1568', '1620', 'Clan Ragnulf'),
    spouse('einarr-ragnulf', 'Einarr Ragnulf', 'male', '1562', '1621', 'house-ragnulf'),
    person('stigandr-arnvild', 'Stigandr Arnvild', 'male', '1570', '1628'),
    spouse('ulfhild-arnvild-spouse', 'Ulfhild', 'female', '1573', '1628'),

    person('magnus-arnvild', 'Magnus Arnvild', 'male', '1585', '1628', {
      title: 'Letzter Hesir des Clans Arnvild'
    }),
    spouse('fasteid-arnvild-spouse', 'Fasteid', 'female', '1588', '1628'),
    awayWoman('torgunna-arnvild', 'Torgunna Arnvild', '1585', '1640', 'Clan Graumähne'),
    spouse('leinkir-graumahne', 'Leinkir Graumähne', 'male', '1584', '1628', 'house-graumahne'),
    person('unnarr-arnvild', 'Unnarr Arnvild', 'male', '1591', '1628'),
    spouse('olaug-arnvild-spouse', 'Olaug', 'female', '1594', '1628'),

    person('vorn-arnvild', 'Vorn Arnvild', 'male', '1606', '1628', {
      title: 'Erbe des Clans Arnvild'
    }),
    spouse('saga-helgr', 'Saga Helgr', 'female', '1608', '1628', 'house-helgr'),
    awayWoman('orka-arnvild', 'Orka Arnvild', '1611', '1715', 'Clan Helgr', {
      title: 'Wegverheiratet an Clan Helgr · letzte Überlebende von Flusswall',
      notes: 'Orka entkam der Auslöschung, weil sie bereits beim Clan Helgr lebte.'
    }),
    spouse('ithmar-helgr', 'Ithmar Helgr', 'male', '1610', '1712', 'house-helgr'),
    person('poltar-arnvild', 'Poltar Arnvild', 'male', '1619', '1628', {
      title: 'Jüngster Erbe des Clans Arnvild'
    }),
    person('haki-arnvild', 'Haki Arnvild', 'male', '1613', '1628'),
    spouse('ljosdis-arnvild-spouse', 'Ljosdis', 'female', '1617', '1628', '', {
      title: 'Verlobte Hakis'
    }),
    person('carn-arnvild', 'Carn Arnvild', 'male', '1615', '1628')
  ],
  partnerships: [
    partnership('marriage-kodlak-alva-arnvild', { status: 'ended' }),
    partnership('marriage-lifthrasir-saga-arnvild', { status: 'ended', end: '1571' }),
    partnership('marriage-thorlak-skalli-graumahne', { status: 'ended', end: '1539' }),
    partnership('marriage-lysveig-sigtrygg-feuerhaar', { status: 'ended', end: '1598' }),
    partnership('marriage-arvid-vefrun-helgr', { status: 'ended', end: '1632' }),
    partnership('marriage-ljotulf-hildegard-arnvild', { status: 'ended', end: '1625' }),
    partnership('marriage-einarr-bergdis-ragnulf', { status: 'ended', end: '1620' }),
    partnership('marriage-stigandr-ulfhild-arnvild', { status: 'ended', end: '1628' }),
    partnership('marriage-magnus-fasteid-arnvild', { status: 'ended', end: '1628' }),
    partnership('marriage-leinkir-torgunna-graumahne', { status: 'ended', end: '1628' }),
    partnership('marriage-unnarr-olaug-arnvild', { status: 'ended', end: '1628' }),
    partnership('marriage-saga-vorn-arnvild', { status: 'ended', end: '1628' }),
    partnership('marriage-ithmar-orka-helgr', { status: 'ended', end: '1712' }),
    partnership('engagement-haki-ljosdis-arnvild', {
      type: 'engagement',
      status: 'ended',
      end: '1628',
      notes: 'Die Verlobung endete mit dem Tod beider bei der Schändung von Flusswall.'
    })
  ],
  parentages: [
    ...childrenOf(['lifthrasir-arnvild', 'skalli-arnvild'], 'marriage-kodlak-alva-arnvild', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['sigtrygg-arnvild', 'vefrun-arnvild'], 'marriage-lifthrasir-saga-arnvild'),
    ...childrenOf(['ljotulf-arnvild', 'bergdis-arnvild', 'stigandr-arnvild'], 'marriage-lysveig-sigtrygg-feuerhaar'),
    ...childrenOf(['magnus-arnvild', 'torgunna-arnvild'], 'marriage-ljotulf-hildegard-arnvild'),
    ...childrenOf(['unnarr-arnvild'], 'marriage-stigandr-ulfhild-arnvild'),
    ...childrenOf(['vorn-arnvild', 'orka-arnvild', 'poltar-arnvild'], 'marriage-magnus-fasteid-arnvild'),
    ...childrenOf(['haki-arnvild', 'carn-arnvild'], 'marriage-unnarr-olaug-arnvild')
  ],
  cadetBranches: [
    marriedAway('married-away-skalli-arnvild-graumahne', 'Clan Graumähne', 'marriage-thorlak-skalli-graumahne', 'house-graumahne', 'haus-graumahne', SCHWARZFENN_HOUSE_EMBLEMS.graumahne),
    marriedAway('married-away-vefrun-arnvild-helgr', 'Clan Helgr', 'marriage-arvid-vefrun-helgr', 'house-helgr', 'haus-helgr', SCHWARZFENN_HOUSE_EMBLEMS.helgr),
    marriedAway('married-away-bergdis-arnvild-ragnulf', 'Clan Ragnulf', 'marriage-einarr-bergdis-ragnulf', 'house-ragnulf', 'haus-ragnulf', SCHWARZFENN_HOUSE_EMBLEMS.ragnulf),
    marriedAway('married-away-torgunna-arnvild-graumahne', 'Clan Graumähne', 'marriage-leinkir-torgunna-graumahne', 'house-graumahne', 'haus-graumahne', SCHWARZFENN_HOUSE_EMBLEMS.graumahne),
    marriedAway('married-away-orka-arnvild-helgr', 'Clan Helgr', 'marriage-ithmar-orka-helgr', 'house-helgr', 'haus-helgr', SCHWARZFENN_HOUSE_EMBLEMS.helgr),
    createExtinctBranch({
      id: 'extinct-house-arnvild',
      parentPersonId: 'vorn-arnvild',
      houseId: ARNVILD_HOUSE_ID,
      emblem: SCHWARZFENN_HOUSE_EMBLEMS.arnvild,
      subtitle: '1628 bei der Schändung von Flusswall ausgelöscht',
      notes: 'Magnus, seine Söhne und der verbliebene männliche Seitenzweig starben 1628. Die außerhalb Flusswalls lebende Orka führte die Arnvild-Linie nicht fort.'
    })
  ],
  timeJumps: [{
    id: FOUNDER_TIME_JUMP_ID,
    parentPartnershipId: 'marriage-kodlak-alva-arnvild',
    parentPersonId: '',
    childIds: ['lifthrasir-arnvild', 'skalli-arnvild'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1518',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner nach Gründerpaar und Clanwappen; kein anderer Knoten steht parallel zu ihm.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-kodlak-alva-arnvild',
    houseId: ARNVILD_HOUSE_ID,
    crestSubtitle: 'Kürzlich ausgelöschter Hesirenclan von Flusswall',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: false,
      id: 'lineage-origin-house',
      houseId: '',
      name: 'Ursprungshaus',
      subtitle: '',
      emblem: '',
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: [],
      targetFamilyId: '',
      notes: '',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'kodlak-arnvild',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    extinctHouse: true,
    recentlyExtinct: true,
    extinctCulture: 'Aldrimarer',
    extinctGroup: SCHWARZFENN_EXTINCT_HOUSE_GROUPS.aldrimar,
    jarltum: 'Schwarzfenn',
    aldrimarRank: 'Hesire',
    sourceRevision: 3,
    sourceModule: 'Clan Arnvild (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Arnvild-Stammbaum wird ohne Personenfokus von Kodlak und Alva bis zur Vernichtung Flusswalls 1628 gezeigt. Das Clanwappen und genau ein serieller Quellenzeitsprung stehen strikt zwischen dem Gründerpaar und Lifthrasir beziehungsweise Skalli. Die in der Quelle offene Elternüberschrift vor Sigtrygg und Vefrún wird aufgrund der unmittelbar vorangehenden Paarung Lifthrasirs und der älteren Saga Helgr als deren Abstammung modelliert und ausdrücklich als Quelleninferenz behandelt. Die Hauptlinie führt über Sigtrygg, Ljotulf und den letzten Hesir Magnus. Skalli, Vefrún, Bergdis, Torgunna und Orka besitzen direkte Wegverheiratet-Knoten; ihre Nachkommen werden ausschließlich in Graumähne, Helgr beziehungsweise Ragnulf fortgeführt. Bestehende Weltpersonen, Ehen und Porträts werden mit diesen Gegenakten geteilt. Der Quelltext nennt Orka als einzige Überlebende des Clans, während dieselbe Tabelle Vefrúns Tod 1632 und Torgunnas Tod 1640 nennt. Dies wird als einzige Überlebende der in Flusswall verbliebenen Kernlinie verstanden; beide anderen Frauen waren bereits wegverheiratet. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    registryTombstones: {
      persons: ['haus-arnvild-gruender', 'haus-arnvild-gruenderin'],
      partnerships: ['marriage-haus-arnvild-founders'],
      cadetBranches: ['extinct-haus-arnvild']
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
