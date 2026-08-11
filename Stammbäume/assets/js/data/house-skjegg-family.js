import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SKJEGG_PORTRAITS } from './house-skjegg-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';

const SKJEGG_HOUSE_ID = 'house-skjegg';
const FOUNDER_TIME_JUMP_ID = 'gap-meili-hjorleif-skjegg';

const HOUSE_EMBLEMS = Object.freeze({
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  kampfgeborene: RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv
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
  'meili-skjegg',
  'hjorleif-skjegg',
  'hakon-skjegg',
  'floki-skjegg',
  'halfdan-skjegg',
  'valdemar-skjegg',
  'thiodolf-skjegg'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  if (personId === 'harold-skjegg' || personId === 'njord-skjegg') return 'mainline';
  return 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SKJEGG_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SKJEGG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SKJEGG_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['meili-skjegg', 'hnoss-skjegg-spouse'],
  hjorleif: ['hjorleif-skjegg', 'dagnhild-helgr'],
  hildigunn: ['brodd-silberzunge', 'hildigunn-skjegg'],
  hakon: ['hakon-skjegg', 'svanhild-brathfengr'],
  sweyn: ['sweyn-skjegg', 'ragnfrid-skjegg-spouse'],
  gudlaug: ['sveinung-skaal', 'gudlaug-skjegg'],
  floki: ['floki-skjegg', 'hildegard-skjegg-spouse'],
  finngunn: ['sigurd-skogg', 'finngunn-skjegg'],
  halfdan: ['halfdan-skjegg', 'thorhild-soekaren'],
  thurid: ['thorir-schwarzdorn', 'thurid-skjegg'],
  sigrid: ['vebjorn-freiwinter', 'sigrid-skjegg'],
  valdemar: ['valdemar-skjegg', 'ljosdis-kampfgeborene'],
  vedis: ['loki-silberzunge', 'vedis-skjegg'],
  vigulf: ['vigulf-skjegg', 'asdis-skjegg-spouse'],
  thiodolf: ['thiodolf-skjegg', 'hanne-skaal'],
  revna: ['arne-skaal', 'revna-skjegg'],
  thrainn: ['thrainn-skjegg', 'eldgunn-skjegg-spouse'],
  harold: ['harold-skjegg', 'sighild-helgr'],
  dagmar: ['tyr-varulv', 'dagmar-skjegg'],
  thorfinn: ['thorfinn-skjegg', 'jofrid-skjegg-spouse'],
  borghild: ['mathon-schwarzdorn', 'borghild-skjegg'],
  balder: ['balder-skjegg', 'herdis-skjegg-spouse']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-meili-hnoss-skjegg': COUPLES.founders,
  'marriage-hjorleif-dagnhild-skjegg': COUPLES.hjorleif,
  'marriage-brodd-hildigunn-skjegg': COUPLES.hildigunn,
  'marriage-hakon-svanhild-skjegg': COUPLES.hakon,
  'affair-sweyn-ragnfrid-skjegg': COUPLES.sweyn,
  'marriage-sveinung-gudlaug-skaal': COUPLES.gudlaug,
  'marriage-floki-hildegard-skjegg': COUPLES.floki,
  'marriage-sigurd-finngunn-skogg': COUPLES.finngunn,
  'marriage-halfdan-thorhild-skjegg': COUPLES.halfdan,
  'marriage-thorir-thurid-schwarzdorn': COUPLES.thurid,
  'marriage-vebjorn-sigrid-freiwinter': COUPLES.sigrid,
  'marriage-valdemar-ljosdis-kampfgeborene': COUPLES.valdemar,
  'marriage-loki-vedis-silberzunge': COUPLES.vedis,
  'marriage-vigulf-asdis-skjegg': COUPLES.vigulf,
  'marriage-thiodolf-hanne-skjegg': COUPLES.thiodolf,
  'marriage-arne-revna-skaal': COUPLES.revna,
  'marriage-thrainn-eldgunn-skjegg': COUPLES.thrainn,
  'marriage-harold-sighild-skjegg': COUPLES.harold,
  'marriage-tyr-dagmar-varulv': COUPLES.dagmar,
  'marriage-thorfinn-jofrid-skjegg': COUPLES.thorfinn,
  'marriage-mathon-borghild-schwarzdorn': COUPLES.borghild,
  'marriage-balder-herdis-skjegg': COUPLES.balder
});

function marriage(partnershipId, options = {}) {
  const registryManagedExtensionFields = new Set([
    ...(options.extensions?.registryManagedExtensionFields || []),
    'chartAlignPartnerOverChildrenPersonId'
  ]);
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], {
    ...options,
    extensions: {
      ...(options.extensions || {}),
      registryManagedExtensionFields: [...registryManagedExtensionFields]
    }
  });
}

function endedMarriage(partnershipId, end = '') {
  return marriage(partnershipId, { status: 'ended', end });
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'skjegg-parentage',
    ...options
  });
}

function claimedChildren(childIds) {
  return childrenOf(childIds, 'marriage-meili-hnoss-skjegg', {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Zwischen dem Gründerpaar und diesen drei Geschwistern sind mehrere Generationen nicht einzeln überliefert.',
    extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
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
      registryManagedFields: ['name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle']
    }
  });
}

export const HOUSE_SKJEGG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-skjegg',
    title: 'Clan Skjegg',
    motto: '',
    description: 'Frommer Hesire-Clan von Grabesruh in Schwarzacker, Grabeshüter und Vasallen des Thanenclans Skaal.',
    emblem: HOUSE_EMBLEMS.skjegg,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.skjegg
  },
  houses: [
    house(SKJEGG_HOUSE_ID, 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-soekeren', 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-kampfgeborene', 'Clan Kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-silberzunge', 'Clan Silberzunge'),
    house('house-skogg', 'Clan Skogg'),
    house('house-helgr', 'Clan Helgr')
  ],
  persons: [
    person('meili-skjegg', 'Meili Skjegg', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Gründer des Clans Skjegg'
    }),
    spouse('hnoss-skjegg-spouse', 'Hnoss', 'female', '????', '????'),

    person('hjorleif-skjegg', 'Hjorleif Skjegg', 'male', '1580', '1629', {
      title: 'Hesir des Clans Skjegg · 1629 hingerichtet',
      notes: 'Die genealogische Tabelle nennt 1580 als Geburtsjahr. Die historische Beschreibung nennt zugleich ein Alter von 47 Jahren zu Kriegsbeginn; dieser Quellenwiderspruch wird nicht durch eine erfundene Datierung aufgelöst.'
    }),
    awayWoman('hildigunn-skjegg', 'Hildigunn Skjegg', '1585', '1641', 'Clan Silberzunge'),
    person('hakon-skjegg', 'Hakon Skjegg', 'male', '1582', '1653', {
      title: 'Hesir des Clans Skjegg 1629–1653'
    }),
    spouse('dagnhild-helgr', 'Dagnhild Helgr', 'female', '1582', '????', 'house-helgr'),
    spouse('brodd-silberzunge', 'Brodd Silberzunge', 'male', '1582', '1629', 'house-silberzunge'),
    spouse('svanhild-brathfengr', 'Svanhild Brathfengr', 'female', '1583', '1668', 'house-brathfengr'),

    person('sweyn-skjegg', 'Sweyn Skjegg', 'male', '1605', '1629'),
    awayWoman('gudlaug-skjegg', 'Gudlaug Skjegg', '1612', '1687', 'Clan Skaal'),
    person('floki-skjegg', 'Floki Skjegg', 'male', '1601', '1654', {
      title: 'Hesir des Clans Skjegg 1653–1654'
    }),
    awayWoman('finngunn-skjegg', 'Finngunn Skjegg', '1604', '1688', 'Clan Skogg'),
    spouse('ragnfrid-skjegg-spouse', 'Ragnfrid', 'female', '1611', '1629', '', {
      familyRole: 'affair',
      title: 'Affäre Sweyns',
      tags: ['Affäre'],
      notes: 'Ragnfrid und Sweyn waren nicht verheiratet.'
    }),
    spouse('sveinung-skaal', 'Sveinung Skaal', 'male', '1611', '1672', 'house-skaal'),
    spouse('hildegard-skjegg-spouse', 'Hildegard', 'female', '1602', '1631'),
    spouse('sigurd-skogg', 'Sigurd Skogg', 'male', '1600', '1671', 'house-skogg'),

    person('halfdan-skjegg', 'Halfdan Skjegg', 'male', '1619', '1693', {
      title: 'Hesir des Clans Skjegg 1654–1693'
    }),
    awayWoman('thurid-skjegg', 'Thurid Skjegg', '1621', '1694', 'Clan Schwarzdorn'),
    awayWoman('sigrid-skjegg', 'Sigrid Skjegg', '1631', '1712', 'Clan Freiwinter'),
    spouse('thorhild-soekaren', 'Thorhild Sökaren', 'female', '1627', '1726', 'house-soekeren'),
    spouse('thorir-schwarzdorn', 'Thorir Schwarzdorn', 'male', '1620', '1683', 'house-schwarzdorn'),
    spouse('vebjorn-freiwinter', 'Vebjorn Freiwinter', 'male', '1627', '1681', 'house-freiwinter'),

    person('valdemar-skjegg', 'Valdemar Skjegg', 'male', '1648', '1739', {
      title: 'Hesir des Clans Skjegg 1693–1739'
    }),
    awayWoman('vedis-skjegg', 'Vedis Skjegg', '1651', '1706', 'Clan Silberzunge'),
    person('vigulf-skjegg', 'Vigulf Skjegg', 'male', '1653', '1720'),
    spouse('ljosdis-kampfgeborene', 'Ljosdis Kampfgeborene', 'female', '1651', '1739', 'house-kampfgeborene'),
    spouse('loki-silberzunge', 'Loki Silberzunge', 'male', '1650', '1711', 'house-silberzunge'),
    spouse('asdis-skjegg-spouse', 'Asdis', 'female', '1655', '1704'),

    person('thiodolf-skjegg', 'Thiodolf Skjegg', 'male', '1670', '', {
      title: 'Hesir des Clans Skjegg seit 1739'
    }),
    awayWoman('revna-skjegg', 'Revna Skjegg', '1673', '', 'Clan Skaal'),
    person('thrainn-skjegg', 'Thrainn Skjegg', 'male', '1675', ''),
    spouse('hanne-skaal', 'Hanne Skaal', 'female', '1673', '', 'house-skaal'),
    spouse('arne-skaal', 'Arne Skaal', 'male', '1669', '', 'house-skaal'),
    spouse('eldgunn-skjegg-spouse', 'Eldgunn', 'female', '1677', ''),

    person('harold-skjegg', 'Harold Skjegg', 'male', '1692', '', {
      title: 'Erster Erbe des Clans Skjegg'
    }),
    awayWoman('dagmar-skjegg', 'Dagmar Skjegg', '1698', '', 'Clan Varulv'),
    person('thorfinn-skjegg', 'Thorfinn Skjegg', 'male', '1702', ''),
    awayWoman('borghild-skjegg', 'Borghild Skjegg', '1695', '', 'Clan Schwarzdorn'),
    person('balder-skjegg', 'Balder Skjegg', 'male', '1699', ''),
    spouse('sighild-helgr', 'Sighild Helgr', 'female', '1696', '', 'house-helgr'),
    spouse('tyr-varulv', 'Tyr Varulv', 'male', '1697', '', 'house-varulv'),
    spouse('jofrid-skjegg-spouse', 'Jofrid', 'female', '1706', ''),
    spouse('mathon-schwarzdorn', 'Mathon Schwarzdorn', 'male', '1688', '1720', 'house-schwarzdorn'),
    spouse('herdis-skjegg-spouse', 'Herdis', 'female', '1704', ''),

    person('njord-skjegg', 'Njord Skjegg', 'male', '1717', '', {
      title: 'Zweiter Erbe des Clans Skjegg',
      notes: 'Die Quelle schreibt 1617; aus Elternjahrgängen und Generationsposition folgt eindeutig 1717.'
    }),
    person('kolga-skjegg', 'Kolga Skjegg', 'female', '1719', '', {
      notes: 'Die Quelle schreibt 1619; aus Elternjahrgängen und Generationsposition folgt eindeutig 1719.'
    }),
    spouse('skadi-varulv', 'Skadi Varulv', 'female', '1719', '', 'house-varulv', {
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Harolds',
      tags: ['Aufgenommenes Mündel'],
      notes: 'Skadi bleibt leibliche Varulv und ist ausschließlich als Harolds Mündel erfasst. Die Quelle schreibt 1619; die kanonische Varulv-Akte und die Generationsposition belegen 1719.'
    }),
    person('alrek-skjegg', 'Alrek Skjegg', 'male', '1723', ''),
    person('svart-skjegg', 'Svart Skjegg', 'male', '1727', ''),
    person('tyra-skjegg', 'Tyra Skjegg', 'female', '1721', ''),
    person('odd-skjegg', 'Odd Skjegg', 'male', '1725', ''),
    person('ulf-skjegg', 'Ulf Skjegg', 'male', '1731', '')
  ],
  partnerships: [
    endedMarriage('marriage-meili-hnoss-skjegg'),
    endedMarriage('marriage-hjorleif-dagnhild-skjegg', '1629'),
    endedMarriage('marriage-brodd-hildigunn-skjegg', '1629'),
    endedMarriage('marriage-hakon-svanhild-skjegg', '1653'),
    marriage('affair-sweyn-ragnfrid-skjegg', {
      type: 'affair',
      status: 'ended',
      end: '1629',
      visibility: 'private',
      notes: 'Sweyn und Ragnfrid waren nicht verheiratet.'
    }),
    endedMarriage('marriage-sveinung-gudlaug-skaal', '1672'),
    endedMarriage('marriage-floki-hildegard-skjegg', '1631'),
    endedMarriage('marriage-sigurd-finngunn-skogg', '1671'),
    endedMarriage('marriage-halfdan-thorhild-skjegg', '1693'),
    endedMarriage('marriage-thorir-thurid-schwarzdorn', '1683'),
    endedMarriage('marriage-vebjorn-sigrid-freiwinter', '1681'),
    endedMarriage('marriage-valdemar-ljosdis-kampfgeborene', '1739'),
    endedMarriage('marriage-loki-vedis-silberzunge', '1706'),
    endedMarriage('marriage-vigulf-asdis-skjegg', '1704'),
    marriage('marriage-thiodolf-hanne-skjegg'),
    marriage('marriage-arne-revna-skaal'),
    marriage('marriage-thrainn-eldgunn-skjegg'),
    marriage('marriage-harold-sighild-skjegg'),
    marriage('marriage-tyr-dagmar-varulv'),
    marriage('marriage-thorfinn-jofrid-skjegg'),
    endedMarriage('marriage-mathon-borghild-schwarzdorn', '1720'),
    marriage('marriage-balder-herdis-skjegg')
  ],
  parentages: [
    ...claimedChildren(['hjorleif-skjegg', 'hildigunn-skjegg', 'hakon-skjegg']),
    ...childrenOf(['sweyn-skjegg', 'gudlaug-skjegg'], 'marriage-hjorleif-dagnhild-skjegg'),
    ...childrenOf(['floki-skjegg', 'finngunn-skjegg'], 'marriage-hakon-svanhild-skjegg'),
    ...childrenOf(['halfdan-skjegg', 'thurid-skjegg', 'sigrid-skjegg'], 'marriage-floki-hildegard-skjegg'),
    ...childrenOf(['valdemar-skjegg', 'vedis-skjegg', 'vigulf-skjegg'], 'marriage-halfdan-thorhild-skjegg'),
    ...childrenOf(['thiodolf-skjegg', 'revna-skjegg', 'thrainn-skjegg'], 'marriage-valdemar-ljosdis-kampfgeborene'),
    ...childrenOf(['harold-skjegg', 'dagmar-skjegg', 'thorfinn-skjegg'], 'marriage-thiodolf-hanne-skjegg'),
    ...childrenOf(['borghild-skjegg', 'balder-skjegg'], 'marriage-thrainn-eldgunn-skjegg'),
    ...childrenOf(['njord-skjegg', 'kolga-skjegg'], 'marriage-harold-sighild-skjegg'),
    ...createParentages(['skadi-varulv'], ['harold-skjegg'], '', {
      idPrefix: 'skjegg-foster-parentage',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Skadi Varulv ist Harolds aufgenommenes Mündel und kein leibliches Kind der Skjegg.'
    }),
    ...childrenOf(['alrek-skjegg', 'svart-skjegg'], 'marriage-thorfinn-jofrid-skjegg'),
    ...childrenOf(['tyra-skjegg', 'odd-skjegg', 'ulf-skjegg'], 'marriage-balder-herdis-skjegg')
  ],
  cadetBranches: [
    marriedAway('married-away-hildigunn-skjegg-silberzunge', 'Clan Silberzunge', 'marriage-brodd-hildigunn-skjegg', 'house-silberzunge', 'haus-silberzunge'),
    marriedAway('married-away-gudlaug-skjegg-skaal', 'Clan Skaal', 'marriage-sveinung-gudlaug-skaal', 'house-skaal', 'haus-skaal', HOUSE_EMBLEMS.skaal),
    marriedAway('married-away-finngunn-skjegg-skogg', 'Clan Skogg', 'marriage-sigurd-finngunn-skogg', 'house-skogg', 'haus-skogg'),
    marriedAway('married-away-thurid-skjegg-schwarzdorn', 'Clan Schwarzdorn', 'marriage-thorir-thurid-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-sigrid-skjegg-freiwinter', 'Clan Freiwinter', 'marriage-vebjorn-sigrid-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-vedis-skjegg-silberzunge', 'Clan Silberzunge', 'marriage-loki-vedis-silberzunge', 'house-silberzunge', 'haus-silberzunge'),
    marriedAway('married-away-revna-skjegg-skaal', 'Clan Skaal', 'marriage-arne-revna-skaal', 'house-skaal', 'haus-skaal', HOUSE_EMBLEMS.skaal),
    marriedAway('married-away-dagmar-skjegg-varulv', 'Clan Varulv', 'marriage-tyr-dagmar-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-borghild-skjegg-schwarzdorn', 'Clan Schwarzdorn', 'marriage-mathon-borghild-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-meili-hnoss-skjegg',
      parentPersonId: '',
      childIds: ['hjorleif-skjegg', 'hildigunn-skjegg', 'hakon-skjegg'],
      years: 0,
      fromYear: '????',
      toYear: '1580',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner: Gründerpaar, Hauswappen, Zeitsprung und erst danach die Geschwister Hjorleif, Hildigunn und Hakon.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-meili-hnoss-skjegg',
    houseId: SKJEGG_HOUSE_ID,
    crestSubtitle: 'Hesire-Clan von Grabesruh · Vasallen der Skaal',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'meili-skjegg',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 4,
    sourceModule: 'Clan Skjegg (bereitgestellte Altdaten)',
    sourceNote: 'Die vollständige Skjegg-Genealogie folgt der bereitgestellten Hausseite. Meili und Hnoss stehen vor dem Hauswappen; genau ein strikt serieller Generationentrenner führt danach zu Hjorleif, Hildigunn und Hakon. Normale Kinderlinien entspringen gemeinsam der Verbindung beider Eltern; die zuvor pauschal auf Ehefrauen gesetzten Ausrichtungsmarker werden entfernt. Sweyn und Ragnfrid waren nicht verheiratet; ihre Verbindung wird ausschließlich als beendete Affäre geführt und Ragnfrid trägt den Affärenrahmen. Hildigunn, Gudlaug, Finngunn, Thurid, Sigrid, Vedis, Revna, Dagmar und Borghild besitzen direkte Wegverheiratet-Knoten zu ihren jeweiligen Zielclans; ihre Nachkommen werden ausschließlich in den fortführenden Gegenakten geführt. Skadi Varulv bleibt leibliche Varulv und ist ausschließlich als Harolds aufgenommenes Mündel erfasst. Die Angaben 1617/1619 für Njord, Kolga und Skadi wurden wegen Elternjahrgängen, Gegenakte und eindeutiger Generationsposition zu 1717/1719 normalisiert. Hjorleifs genealogisches Geburtsjahr 1580 bleibt trotz der widersprechenden Altersangabe seiner historischen Kurzbiografie erhalten. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    registryTombstones: {
      partnerships: ['marriage-sweyn-ragnfrid-skjegg']
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
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
