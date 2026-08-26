import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { KRAEHENMOOR_HOUSE_EMBLEMS } from './kraehenmoor-house-profiles.js';
import { KRONENTAL_HOUSE_EMBLEMS } from './kronental-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import {
  SCHWARZFENN_HOUSE_EMBLEMS,
  SCHWARZFENN_HOUSE_PROFILES
} from './schwarzfenn-house-profiles.js';

const KUMMERHERZ_HOUSE_ID = 'house-kummerherz';

const HOUSE_EMBLEMS = Object.freeze({
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  hjerte: KRAEHENMOOR_HOUSE_EMBLEMS.hjerte,
  ragnulf: SCHWARZFENN_HOUSE_EMBLEMS.ragnulf,
  graumahne: SCHWARZFENN_HOUSE_EMBLEMS.graumahne,
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  todbrand: SCHWARZFENN_HOUSE_EMBLEMS.todbrand,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
  feuerhaar: IVARSHEIM_HOUSE_EMBLEMS.feuerhaar,
  gullvig: KRONENTAL_HOUSE_EMBLEMS.gullvig
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
  'brynjar-hjerte',
  'jothmund-kummerherz',
  'jorah-kummerherz',
  'lagmar-kummerherz',
  'naddvar-kummerherz',
  'hogrand-kummerherz'
]);

const HEIR_IDS = new Set([
  'tyrfingr-kummerherz',
  'rorik-kummerherz',
  'finnur-kummerherz'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? KUMMERHERZ_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_KUMMERHERZ_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === KUMMERHERZ_HOUSE_ID ? 'core' : 'married'),
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

function receivedWard(id, name, sex, birth, houseId, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    houseId,
    familyRole: 'ward',
    lineageRole: 'branch',
    title: options.title || 'Aufgenommenes Mündel des Clans Kummerherz',
    tags: [...(options.tags || []), 'Mündel', 'Aufgenommen']
  });
}

function sentWard(id, name, sex, birth, death, targetHouseName, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    familyRole: 'ward-away',
    title: options.title || `Als Mündel an ${targetHouseName} vermittelt`,
    tags: [...(options.tags || []), 'Mündel', 'Fortgegeben']
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
  founders: ['brynjar-hjerte', 'hallveig-hjerte'],
  jorunn: ['asleikr-graumahne', 'jorunn-kummerherz'],
  jothmund: ['jothmund-kummerherz', 'kolfinna-kaltherz'],
  jorah: ['jorah-kummerherz', 'gulda-schattenherz'],
  mogunn: ['mogunn-kummerherz', 'audhild-blutstahl'],
  johild: ['haraldur-feuerherz', 'johild-kummerherz'],
  lagmar: ['lagmar-kummerherz', 'elinborg-frostauge'],
  gunnlaug: ['floki-sturmgeborener', 'gunnlaug-kummerherz'],
  naddvar: ['naddvar-kummerherz', 'magndis-graumahne'],
  holmdis: ['heremod-sterkr', 'holmdis-kummerherz'],
  finnleik: ['finnleik-kummerherz', 'petka-wellenschild'],
  hogrand: ['bylga-wargh', 'hogrand-kummerherz'],
  ljosdis: ['thorgils-eisenbieger', 'ljosdis-kummerherz'],
  njaldis: ['nattfar-gullvig', 'njaldis-kummerherz'],
  tryggvi: ['tryggvi-kummerherz', 'ormrun-schmetterschild'],
  tyrfingr: ['tyrfingr-kummerherz', 'midna-spindelschlag'],
  asta: ['armod-feuerhaar', 'asta-kummerherz'],
  froya: ['calthar-todbrand', 'froya-kummerherz'],
  nottulf: ['nottulf-kummerherz', 'casthild-sturmgeborene']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-brynjar-hallveig-hjerte': COUPLES.founders,
  'marriage-asleikr-jorunn-graumahne': COUPLES.jorunn,
  'marriage-jothmund-kolfinna-kummerherz': COUPLES.jothmund,
  'marriage-jorah-gulda-kummerherz': COUPLES.jorah,
  'marriage-mogunn-audhild-kummerherz': COUPLES.mogunn,
  'marriage-haraldur-johild-kummerherz': COUPLES.johild,
  'marriage-lagmar-elinborg-kummerherz': COUPLES.lagmar,
  'marriage-floki-gunnlaug-kummerherz': COUPLES.gunnlaug,
  'marriage-magndis-naddvar-graumahne': COUPLES.naddvar,
  'marriage-heremod-holmdis-sterkr': COUPLES.holmdis,
  'marriage-finnleik-petka-kummerherz': COUPLES.finnleik,
  'marriage-bylga-hogrand-wargh': COUPLES.hogrand,
  'marriage-thorgils-ljosdis-kummerherz': COUPLES.ljosdis,
  'marriage-nattfar-njaldis-kummerherz': COUPLES.njaldis,
  'marriage-tryggvi-ormrun-schmetterschild': COUPLES.tryggvi,
  'marriage-tyrfingr-midna-kummerherz': COUPLES.tyrfingr,
  'marriage-armod-asta-feuerhaar': COUPLES.asta,
  'marriage-calthar-froya-todbrand': COUPLES.froya,
  'marriage-nottulf-casthild-kummerherz': COUPLES.nottulf
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'kummerherz-parentage',
    ...options
  });
}

function fosterChildren(childIds, guardianId, notes) {
  return createParentages(childIds, [guardianId], '', {
    idPrefix: 'kummerherz-foster-parentage',
    type: 'foster',
    legitimacy: 'unknown',
    notes
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

const SOURCE_GAP_ID = 'gap-brynjar-to-jothmund-kummerherz';

export const HOUSE_KUMMERHERZ_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-kummerherz',
    title: 'Clan Kummerherz',
    motto: '',
    description: 'Thanenclan von Trauerwald im Gramfenn und Kadettenhaus des erloschenen Hjerte-Clans. Die Kummerherzen dienen den Ragnulf als zurückhaltende Jäger, Waldläufer und Verwalter des südlichen Schwarzfenns.',
    emblem: HOUSE_EMBLEMS.kummerherz,
    houseProfile: SCHWARZFENN_HOUSE_PROFILES.kummerherz
  },
  houses: [
    house(KUMMERHERZ_HOUSE_ID, 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-hjerte', 'Clan Hjerte', HOUSE_EMBLEMS.hjerte, 'extinct'),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-graumahne', 'Clan Graumähne', HOUSE_EMBLEMS.graumahne),
    house('house-kaltherz', 'Clan Kaltherz'),
    house('house-schattenherz', 'Clan Schattenherz'),
    house('house-blutstahl', 'Clan Blutstahl'),
    house('house-feuerherz', 'Clan Feuerherz'),
    house('house-frostauge', 'Clan Frostauge'),
    house('house-sturmgeborene', 'Clan Sturmgeborene'),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-wellenschild', 'Clan Wellenschild'),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-eisenbieger', 'Clan Eisenbieger'),
    house('house-gullvig', 'Clan Gullvig', HOUSE_EMBLEMS.gullvig),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-spindelschlag', 'Clan Spindelschlag'),
    house('house-feuerhaar', 'Clan Feuerhaar', HOUSE_EMBLEMS.feuerhaar),
    house('house-todbrand', 'Clan Todbrand', HOUSE_EMBLEMS.todbrand),
    house('house-wellensaenger', 'Clan Wellensänger')
  ],
  persons: [
    person('brynjar-hjerte', 'Brynjar Hjerte', 'male', '????', '????', {
      houseId: 'house-hjerte',
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Hjerte-Spross · Gründer und erster Thane der Kummerherzen',
      tags: ['Gründer', 'Kadettenhausgründer']
    }),
    spouse('hallveig-hjerte', 'Hallveig', 'female', '????', '????', '', {
      title: 'Mitbegründerin des Clans Kummerherz',
      tags: ['Gründerin']
    }),

    awayWoman('jorunn-kummerherz', 'Jorunn Kummerherz', '1551', '1626', 'Clan Graumähne'),
    person('jothmund-kummerherz', 'Jothmund Kummerherz', 'male', '1560', '1623', {
      title: 'Thane des Clans Kummerherz bis 1623'
    }),
    spouse('asleikr-graumahne', 'Asleikr Graumähne', 'male', '1547', '1628', 'house-graumahne'),
    spouse('kolfinna-kaltherz', 'Kolfinna Kaltherz', 'female', '1565', '1610', 'house-kaltherz'),

    person('jorah-kummerherz', 'Jorah Kummerherz', 'male', '1583', '1677', {
      title: 'Thane des Clans Kummerherz von 1623 bis 1677'
    }),
    person('bjarnhild-kummerherz', 'Bjarnhild Kummerherz', 'female', '1590', '1610'),
    person('mogunn-kummerherz', 'Mogunn Kummerherz', 'male', '1596', '1628'),
    spouse('gulda-schattenherz', 'Gulda Schattenherz', 'female', '1597', '1677', 'house-schattenherz'),
    spouse('audhild-blutstahl', 'Audhild Blutstahl', 'female', '1599', '1628', 'house-blutstahl'),

    awayWoman('johild-kummerherz', 'Johild Kummerherz', '1620', '1704', 'Clan Feuerherz'),
    person('lagmar-kummerherz', 'Lagmar Kummerherz', 'male', '1628', '1689', {
      title: 'Thane des Clans Kummerherz von 1677 bis 1689'
    }),
    person('eystein-kummerherz', 'Eystein Kummerherz', 'male', '1617', '1628'),
    awayWoman('gunnlaug-kummerherz', 'Gunnlaug Kummerherz', '1619', '1704', 'Clan Sturmgeborene'),
    spouse('haraldur-feuerherz', 'Haraldur Feuerherz', 'male', '1620', '1671', 'house-feuerherz'),
    spouse('elinborg-frostauge', 'Elinborg Frostauge', 'female', '1631', '1703', 'house-frostauge'),
    spouse('floki-sturmgeborener', 'Floki Sturmgeborener', 'male', '1618', '1677', 'house-sturmgeborene'),

    person('naddvar-kummerherz', 'Naddvar Kummerherz', 'male', '1649', '1733', {
      title: 'Thane des Clans Kummerherz von 1689 bis 1733'
    }),
    awayWoman('holmdis-kummerherz', 'Hólmdís Kummerherz', '1655', '1731', 'Clan Sterkr'),
    person('finnleik-kummerherz', 'Finnleik Kummerherz', 'male', '1656', '1724'),
    spouse('magndis-graumahne', 'Magndís Graumähne', 'female', '1655', '1709', 'house-graumahne'),
    spouse('heremod-sterkr', 'Heremod Sterkr', 'male', '1652', '1738', 'house-sterkr'),
    spouse('petka-wellenschild', 'Petka Wellenschild', 'female', '1656', '1730', 'house-wellenschild'),

    person('hogrand-kummerherz', 'Hogrand Kummerherz', 'male', '1671', '', {
      title: 'Thane des Clans Kummerherz seit 1733'
    }),
    awayWoman('ljosdis-kummerherz', 'Ljosdis Kummerherz', '1676', '', 'Clan Eisenbieger'),
    awayWoman('njaldis-kummerherz', 'Njaldis Kummerherz', '1675', '', 'Clan Gullvig'),
    person('tryggvi-kummerherz', 'Tryggvi Kummerherz', 'male', '1673', ''),
    spouse('bylga-wargh', 'Bylga Wargh', 'female', '1673', '', 'house-wargh'),
    spouse('thorgils-eisenbieger', 'Thorgils Eisenbieger', 'male', '1673', '', 'house-eisenbieger'),
    spouse('nattfar-gullvig', 'Náttfar Gullvig', 'male', '1675', '', 'house-gullvig'),
    spouse('ormrun-schmetterschild', 'Ormrún Schmetterschild', 'female', '1674', '', 'house-schmetterschild'),

    person('tyrfingr-kummerherz', 'Tyrfingr Kummerherz', 'male', '1694', '', {
      title: 'Erster Erbe des Clans Kummerherz'
    }),
    awayWoman('asta-kummerherz', 'Asta Kummerherz', '1699', '', 'Clan Feuerhaar'),
    awayWoman('froya-kummerherz', 'Froya Kummerherz', '1699', '', 'Clan Todbrand'),
    person('nottulf-kummerherz', 'Nottulf Kummerherz', 'male', '1702', ''),
    spouse('midna-spindelschlag', 'Midna Spindelschlag', 'female', '1695', '', 'house-spindelschlag'),
    spouse('armod-feuerhaar', 'Armod Feuerhaar', 'male', '1695', '', 'house-feuerhaar'),
    spouse('calthar-todbrand', 'Calthar Todbrand', 'male', '1695', '', 'house-todbrand'),
    spouse('casthild-sturmgeborene', 'Casthild Sturmgeborene', 'female', '1705', '', 'house-sturmgeborene'),

    person('rorik-kummerherz', 'Rórik Kummerherz', 'male', '1720', '', {
      title: 'Zweiter Erbe des Clans Kummerherz'
    }),
    person('finnur-kummerherz', 'Finnur Kummerherz', 'male', '1722', '', {
      title: 'Dritter Erbe des Clans Kummerherz'
    }),
    sentWard('tinna-kummerherz', 'Tinna Kummerherz', 'female', '1724', '', 'Clan Ragnulf', {
      title: 'Leibliche Tochter Tyrfingrs · als Mündel bei Clan Ragnulf'
    }),
    receivedWard('isaura-wellensaenger', 'Isaura Wellensänger', 'female', '1726', 'house-wellensaenger', {
      title: 'Aufgenommenes Mündel Tyrfingrs'
    }),
    person('orm-kummerherz', 'Orm Kummerherz', 'male', '1723', ''),
    person('melka-kummerherz', 'Melka Kummerherz', 'female', '1726', '')
  ],
  partnerships: Object.keys(PARTNERS_BY_ID).map(partnershipId => partnership(partnershipId)),
  parentages: [
    ...childrenOf(['jorunn-kummerherz', 'jothmund-kummerherz'], 'marriage-brynjar-hallveig-hjerte', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['jorah-kummerherz', 'bjarnhild-kummerherz', 'mogunn-kummerherz'], 'marriage-jothmund-kolfinna-kummerherz'),
    ...childrenOf(['johild-kummerherz', 'lagmar-kummerherz'], 'marriage-jorah-gulda-kummerherz'),
    ...childrenOf(['eystein-kummerherz', 'gunnlaug-kummerherz'], 'marriage-mogunn-audhild-kummerherz'),
    ...childrenOf(['naddvar-kummerherz', 'holmdis-kummerherz', 'finnleik-kummerherz'], 'marriage-lagmar-elinborg-kummerherz'),
    ...childrenOf(['hogrand-kummerherz', 'ljosdis-kummerherz'], 'marriage-magndis-naddvar-graumahne'),
    ...childrenOf(['njaldis-kummerherz', 'tryggvi-kummerherz'], 'marriage-finnleik-petka-kummerherz'),
    ...childrenOf(['tyrfingr-kummerherz', 'asta-kummerherz'], 'marriage-bylga-hogrand-wargh'),
    ...childrenOf(['froya-kummerherz', 'nottulf-kummerherz'], 'marriage-tryggvi-ormrun-schmetterschild'),
    ...childrenOf(['rorik-kummerherz', 'finnur-kummerherz', 'tinna-kummerherz'], 'marriage-tyrfingr-midna-kummerherz'),
    ...fosterChildren(['isaura-wellensaenger'], 'tyrfingr-kummerherz', 'Isaura Wellensänger ist Tyrfingrs aufgenommenes Mündel und kein leibliches Kind von Tyrfingr und Midna.'),
    ...childrenOf(['orm-kummerherz', 'melka-kummerherz'], 'marriage-nottulf-casthild-kummerherz')
  ],
  cadetBranches: [
    marriedAway('married-away-jorunn-kummerherz-graumahne', 'Clan Graumähne', 'marriage-asleikr-jorunn-graumahne', 'house-graumahne', 'haus-graumahne', HOUSE_EMBLEMS.graumahne),
    marriedAway('married-away-johild-kummerherz-feuerherz', 'Clan Feuerherz', 'marriage-haraldur-johild-kummerherz', 'house-feuerherz', 'haus-feuerherz'),
    marriedAway('married-away-gunnlaug-kummerherz-sturmgeborene', 'Clan Sturmgeborene', 'marriage-floki-gunnlaug-kummerherz', 'house-sturmgeborene', 'haus-sturmgeborene'),
    marriedAway('married-away-holmdis-kummerherz-sterkr', 'Clan Sterkr', 'marriage-heremod-holmdis-sterkr', 'house-sterkr', 'haus-sterkr', HOUSE_EMBLEMS.sterkr),
    marriedAway('married-away-ljosdis-kummerherz-eisenbieger', 'Clan Eisenbieger', 'marriage-thorgils-ljosdis-kummerherz', 'house-eisenbieger', 'haus-eisenbieger'),
    marriedAway('married-away-njaldis-kummerherz-gullvig', 'Clan Gullvig', 'marriage-nattfar-njaldis-kummerherz', 'house-gullvig', 'haus-gullvig', HOUSE_EMBLEMS.gullvig),
    marriedAway('married-away-asta-kummerherz-feuerhaar', 'Clan Feuerhaar', 'marriage-armod-asta-feuerhaar', 'house-feuerhaar', 'haus-feuerhaar', HOUSE_EMBLEMS.feuerhaar),
    marriedAway('married-away-froya-kummerherz-todbrand', 'Clan Todbrand', 'marriage-calthar-froya-todbrand', 'house-todbrand', 'haus-todbrand', HOUSE_EMBLEMS.todbrand),
    wardAway('ward-away-tinna-kummerherz-ragnulf', 'Clan Ragnulf', 'tinna-kummerherz', 'house-ragnulf', 'haus-ragnulf', HOUSE_EMBLEMS.ragnulf)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-brynjar-hallveig-hjerte',
    parentPersonId: '',
    childIds: ['jorunn-kummerherz', 'jothmund-kummerherz'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1551',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Kummerherz-Hausknoten; keine Person und kein weiterer Hausknoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-brynjar-hallveig-hjerte',
    houseId: KUMMERHERZ_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Trauerwald · Kadettenhaus der Hjerte',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'hjerte-origin-kummerherz',
      houseId: 'house-hjerte',
      name: 'Clan Hjerte',
      subtitle: 'Ausgestorbener Norrnaigh-Ursprungsclan',
      emblem: HOUSE_EMBLEMS.hjerte,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['brynjar-hjerte'],
      targetFamilyId: 'haus-hjerte',
      notes: 'Brynjar Hjerte begründet gemeinsam mit Hallveig den Kummerherz-Zweig.',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'brynjar-hjerte',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    sourceRevision: 4,
    sourceModule: 'Clan Kummerherz (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige überlieferte Kummerherz-Stammbaum wird ohne Personenfokus von Brynjar Hjerte und Hallveig bis zur jüngsten Generation des Jahres 1740 gezeigt. Ein verlinkter Hjerte-Ursprung steht über Brynjar; der Kummerherz-Hausknoten hängt direkt unter dem Gründerpaar und genau ein serieller Zeitsprung führt danach zu Jorunn und Jothmund. Die Oberhauptfolge lautet Brynjar, Jothmund, Jorah, Lagmar, Naddvar und Hogrand; Tyrfingr, Rórik und Finnur bilden die angegebene Erbfolge. Jorunn, Johild, Gunnlaug, Hólmdís, Ljosdis, Njaldis, Asta und Froya besitzen direkte Wegverheiratet-Knoten; ihre fremden Nachkommen bleiben ausschließlich in den Zielakten. Tinna ist ein leibliches Kind Tyrfingrs und Midnas, zugleich aber als Mündel an Clan Ragnulf vermittelt. Isaura Wellensänger ist ausschließlich Tyrfingrs aufgenommenes Mündel. Ihre Wellensänger-Herkunftsakte belegt 1726 statt der älteren Kummerherz-Angabe 1725; die Herkunftsakte ist für ihr Geburtsjahr maßgeblich. Midna Spindelschlags Geburtsjahr wird anhand ihrer Herkunftsakte von 1700 auf 1695 berichtigt. Die isolierte Quellüberschrift „Modgunn“ wird nach der eigentlichen Personenzeile als Mogunn normalisiert. Die fünf unbenannten Verlobtenfelder der jüngsten Generation werden nicht als reale Personen importiert. Wiederholte Standardsilhouetten wurden nicht als Individualporträts übernommen.',
    registryTombstones: {
      persons: ['haus-kummerherz-gruender', 'haus-kummerherz-gruenderin'],
      partnerships: ['marriage-haus-kummerherz-founders']
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
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse']
  }
});
