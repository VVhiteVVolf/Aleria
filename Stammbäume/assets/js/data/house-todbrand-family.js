import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createSingleFounderHouseBranch
} from './family-record-builders.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import { HOUSE_TODBRAND_PORTRAITS } from './house-todbrand-portraits.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import {
  SCHWARZFENN_HOUSE_EMBLEMS,
  SCHWARZFENN_HOUSE_PROFILES
} from './schwarzfenn-house-profiles.js';

const TODBRAND_HOUSE_ID = 'house-todbrand';

const HOUSE_EMBLEMS = Object.freeze({
  todbrand: SCHWARZFENN_HOUSE_EMBLEMS.todbrand,
  eisbrand: SCHWARZFENN_HOUSE_EMBLEMS.eisbrand,
  graumahne: SCHWARZFENN_HOUSE_EMBLEMS.graumahne,
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  helgr: SCHWARZFENN_HOUSE_EMBLEMS.helgr,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr
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
  'nordal-todbrand',
  'ulfhedin-todbrand',
  'lodvar-todbrand',
  'taran-todbrand',
  'oddgeir-todbrand',
  'munthor-todbrand',
  'gunnvald-todbrand'
]);

const HEIR_IDS = new Set([
  'calthar-todbrand',
  'andor-todbrand',
  'frode-todbrand'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? TODBRAND_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_TODBRAND_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === TODBRAND_HOUSE_ID ? 'core' : 'married'),
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
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-todbrand--${id}`),
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
  founders: ['nordal-todbrand', 'olfreya'],
  ulfhedin: ['ulfhedin-todbrand', 'hrafnhild'],
  steinnun: ['eyjolf-graumahne', 'steinnun-todbrand'],
  lodvar: ['lodvar-todbrand', 'halldis-schmetterschild'],
  torgunna: ['sigurd-brathfengr', 'torgunna-todbrand'],
  taran: ['taran-todbrand', 'yngvild'],
  dagfrid: ['radulfr-blutstahl', 'dagfrid-todbrand'],
  kveldulfLofn: ['kveldulf-todbrand', 'lofn'],
  kveldulfIsgerd: ['kveldulf-todbrand', 'isgerd'],
  oddgeir: ['oddgeir-todbrand', 'jarnhild'],
  estrid: ['yvain-gwenyen-ogwych', 'estrid-todbrand'],
  casthild: ['gwindor-1625-bochdew', 'casthild-todbrand'],
  munthor: ['munthor-todbrand', 'hildessa-graumahne'],
  gunnvald: ['gunnvald-todbrand', 'gersemi-ragnulf'],
  einhild: ['finnbar-fiantorc', 'einhild-todbrand'],
  calthar: ['calthar-todbrand', 'froya-kummerherz'],
  hlokk: ['magnus-schmetterschild', 'hlokk-todbrand'],
  ormrun: ['agnar-wargh', 'ormrun-todbrand'],
  gudbrandBirta: ['gudbrand-todbrand', 'birta-helgr'],
  gudbrandGreta: ['gudbrand-todbrand', 'greta']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-nordal-olfreya-todbrand': COUPLES.founders,
  'marriage-ulfhedin-hrafnhild-todbrand': COUPLES.ulfhedin,
  'marriage-steinnun-eyjolf-todbrand': COUPLES.steinnun,
  'marriage-lodvar-halldis-todbrand': COUPLES.lodvar,
  'marriage-sigurd-torgunna-brathfengr': COUPLES.torgunna,
  'marriage-taran-yngvild-todbrand': COUPLES.taran,
  'marriage-dagfrid-radulfr-todbrand': COUPLES.dagfrid,
  'marriage-kveldulf-lofn-todbrand': COUPLES.kveldulfLofn,
  'affair-kveldulf-isgerd-todbrand': COUPLES.kveldulfIsgerd,
  'marriage-oddgeir-jarnhild-todbrand': COUPLES.oddgeir,
  'marriage-estrid-yvain-todbrand': COUPLES.estrid,
  'marriage-casthild-gwindor-todbrand': COUPLES.casthild,
  'marriage-munthor-hildessa-todbrand': COUPLES.munthor,
  'marriage-gersemi-gunnvald-ragnulf': COUPLES.gunnvald,
  'marriage-einhild-finnbar-todbrand': COUPLES.einhild,
  'marriage-calthar-froya-todbrand': COUPLES.calthar,
  'marriage-hlokk-magnus-todbrand': COUPLES.hlokk,
  'marriage-agnar-ormrun-wargh': COUPLES.ormrun,
  'marriage-birta-gudbrand-todbrand': COUPLES.gudbrandBirta,
  'affair-gudbrand-greta-todbrand': COUPLES.gudbrandGreta
});

function relationship(partnershipId, options = {}) {
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

function alignPartnerOverChildren(partnership, partnerPersonId) {
  return {
    ...partnership,
    extensions: {
      ...partnership.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'todbrand-parentage',
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

function timeJump(id, parentPartnershipId, childIds) {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear: '????',
    toYear: '1549',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner; der Zeitsprung steht weder parallel zu Personen noch zu Hausknoten.',
    extensions: {}
  };
}

export const HOUSE_TODBRAND_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-todbrand',
    title: 'Clan Todbrand',
    motto: '',
    description: 'Thanenclan von Dunkelmoor im Todesfenn, benannt nach Nordal dem Gebrandmarkten.',
    emblem: HOUSE_EMBLEMS.todbrand,
    houseProfile: SCHWARZFENN_HOUSE_PROFILES.todbrand
  },
  houses: [
    house(TODBRAND_HOUSE_ID, 'Clan Todbrand', HOUSE_EMBLEMS.todbrand),
    house('house-eisbrand', 'Haus Eisbrand', HOUSE_EMBLEMS.eisbrand),
    house('house-graumahne', 'Clan Graumähne', HOUSE_EMBLEMS.graumahne),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-helgr', 'Clan Helgr', HOUSE_EMBLEMS.helgr),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-blutstahl', 'Clan Blutstahl'),
    house('house-gwenyen', "Haus Gwenyen O'Gwych"),
    house('house-bochdew', "Haus Bochdew O'Caer Ynys"),
    house('house-fiantorc', 'Haus Fiantorc')
  ],
  persons: [
    person('nordal-todbrand', 'Nordal Todbrand', 'male', '????', '????', {
      status: 'dead',
      title: 'Der Gebrandmarkte · Gründer und erster Thane des Clans Todbrand'
    }),
    spouse('olfreya', 'Olfreya', 'female', '????', '????'),

    person('ulfhedin-todbrand', 'Ulfhedin Todbrand', 'male', '1549', '1600', {
      title: 'Thane des Clans Todbrand bis 1600'
    }),
    awayWoman('steinnun-todbrand', 'Steinnun Todbrand', '1553', '1600', 'Clan Graumähne'),
    spouse('hrafnhild', 'Hrafnhild', 'female', '1552', '1596'),
    spouse('eyjolf-graumahne', 'Eyjolf Graumähne', 'male', '1550', '1628', 'house-graumahne'),

    person('lodvar-todbrand', 'Lodvar Todbrand', 'male', '1571', '1622', {
      title: 'Thane des Clans Todbrand von 1600 bis 1622'
    }),
    awayWoman('torgunna-todbrand', 'Torgunna Todbrand', '1582', '1651', 'Clan Brathfengr'),
    spouse('halldis-schmetterschild', 'Halldis Schmetterschild', 'female', '1573', '1655', 'house-schmetterschild'),
    spouse('sigurd-brathfengr', 'Sigurd Brathfengr', 'male', '1582', '1686', 'house-brathfengr'),

    person('taran-todbrand', 'Taran Todbrand', 'male', '1591', '1655', {
      title: 'Thane des Clans Todbrand von 1622 bis 1655',
      notes: 'Zu Beginn des Bürgerkriegs 36 Jahre alt; seine wechselhafte Durchlasspolitik belastete das Verhältnis zu den Ragnulf.'
    }),
    awayWoman('dagfrid-todbrand', 'Dagfrid Todbrand', '1599', '1671', 'Clan Blutstahl'),
    person('kveldulf-todbrand', 'Kveldulf Todbrand', 'male', '1605', '1659', {
      extensions: {
        chartCenterBetweenSpousePersonIds: ['lofn', 'isgerd'],
        registryManagedExtensionFields: ['chartCenterBetweenSpousePersonIds']
      }
    }),
    spouse('yngvild', 'Yngvild', 'female', '1605', '1699'),
    spouse('radulfr-blutstahl', 'Radulfr Blutstahl', 'male', '1600', '1628', 'house-blutstahl'),
    spouse('lofn', 'Lofn', 'female', '1607', '1679', '', { title: 'Ehefrau Kveldulfs' }),
    spouse('isgerd', 'Isgerd', 'female', '1627', '1659', '', {
      familyRole: 'affair',
      title: 'Affäre Kveldulfs · Mutter Auduns',
      tags: ['Affäre']
    }),

    person('oddgeir-todbrand', 'Oddgeir Todbrand', 'male', '1628', '1679', {
      title: 'Thane des Clans Todbrand von 1655 bis 1679'
    }),
    awayWoman('estrid-todbrand', 'Estrid Todbrand', '1631', '1720', "Haus Gwenyen O'Gwych"),
    awayWoman('casthild-todbrand', 'Casthild Todbrand', '1627', '1711', "Haus Bochdew O'Caer Ynys"),
    person('audun-todbrand', 'Audun Todbrand', 'male', '1650', '1715', {
      familyRole: 'bastard',
      title: 'Bastardsohn Kveldulfs und Isgerds',
      tags: ['Bastard']
    }),
    spouse('jarnhild', 'Jarnhild', 'female', '1635', '1701'),
    spouse('yvain-gwenyen-ogwych', "Yvain Gwenyen O'Gwych", 'male', '1630', '1681', 'house-gwenyen'),
    spouse('gwindor-1625-bochdew', "Gwindor Bochdew O'Caer Ynys", 'male', '1625', '1702', 'house-bochdew', {
      notes: 'Nicht identisch mit dem 1674 geborenen Gwindor Bochdew in späteren Gegenakten.'
    }),

    person('munthor-todbrand', 'Munthor Todbrand', 'male', '1658', '1714', {
      title: 'Thane des Clans Todbrand von 1679 bis 1714'
    }),
    spouse('hildessa-graumahne', 'Hildessa Graumähne', 'female', '1660', '1729', 'house-graumahne'),

    person('gunnvald-todbrand', 'Gunnvald Todbrand', 'male', '1674', '', {
      title: 'Thane des Clans Todbrand seit 1714'
    }),
    awayWoman('einhild-todbrand', 'Einhild Todbrand', '1679', '', 'Haus Fiantorc'),
    spouse('gersemi-ragnulf', 'Gersemi Ragnulf', 'female', '1675', '', 'house-ragnulf'),
    spouse('finnbar-fiantorc', 'Finnbar Fiantorc', 'male', '1675', '', 'house-fiantorc'),

    person('calthar-todbrand', 'Calthar Todbrand', 'male', '1695', '', {
      title: 'Erster Erbe des Clans Todbrand'
    }),
    awayWoman('hlokk-todbrand', 'Hlökk Todbrand', '1700', '', 'Clan Schmetterschild'),
    awayWoman('ormrun-todbrand', 'Ormrún Todbrand', '1703', '', 'Clan Wargh'),
    person('gudbrand-todbrand', 'Gudbrand Todbrand', 'male', '1703', '', {
      extensions: {
        chartCenterBetweenSpousePersonIds: ['birta-helgr', 'greta'],
        registryManagedExtensionFields: ['chartCenterBetweenSpousePersonIds']
      }
    }),
    spouse('froya-kummerherz', 'Froya Kummerherz', 'female', '1699', '', 'house-kummerherz'),
    spouse('magnus-schmetterschild', 'Magnus Schmetterschild', 'male', '1695', '', 'house-schmetterschild'),
    spouse('agnar-wargh', 'Agnar Wargh', 'male', '1698', '', 'house-wargh'),
    spouse('birta-helgr', 'Birta Helgr', 'female', '1707', '', 'house-helgr', {
      notes: 'Die Todbrand-Tabelle nennt abweichend 1704; die Herkunftsakte der Helgr führt Birta als Jahrgang 1707.'
    }),
    spouse('greta', 'Greta', 'female', '1715', '', '', {
      familyRole: 'affair',
      title: 'Affäre Gudbrands · Mutter Siljas',
      tags: ['Affäre']
    }),

    person('andor-todbrand', 'Andor Todbrand', 'male', '1718', '', {
      title: 'Zweiter Erbe des Clans Todbrand'
    }),
    person('parnilla-todbrand', 'Parnilla Todbrand', 'female', '1721', ''),
    person('frode-todbrand', 'Frode Todbrand', 'male', '1724', '', {
      title: 'Dritter Erbe des Clans Todbrand'
    }),
    person('idmar-todbrand', 'Idmar Todbrand', 'male', '1723', ''),
    person('norlind-todbrand', 'Norlind Todbrand', 'male', '1724', ''),
    person('silja-todbrand', 'Silja Todbrand', 'female', '1735', '', {
      familyRole: 'bastard',
      title: 'Bastardtochter Gudbrands und Gretas',
      tags: ['Bastard']
    })
  ],
  partnerships: [
    relationship('marriage-nordal-olfreya-todbrand', { status: 'ended' }),
    relationship('marriage-ulfhedin-hrafnhild-todbrand', { status: 'ended', end: '1596' }),
    relationship('marriage-steinnun-eyjolf-todbrand', { status: 'ended', end: '1600' }),
    relationship('marriage-lodvar-halldis-todbrand', { status: 'ended', end: '1622' }),
    relationship('marriage-sigurd-torgunna-brathfengr', { status: 'ended', end: '1651' }),
    relationship('marriage-taran-yngvild-todbrand', { status: 'ended', end: '1655' }),
    relationship('marriage-dagfrid-radulfr-todbrand', { status: 'ended', end: '1628' }),
    alignPartnerOverChildren(relationship('marriage-kveldulf-lofn-todbrand', { status: 'ended', end: '1659' }), 'lofn'),
    alignPartnerOverChildren(relationship('affair-kveldulf-isgerd-todbrand', {
      type: 'affair',
      status: 'ended',
      end: '1659',
      visibility: 'private',
      notes: 'Audun entstammt ausschließlich dieser Affäre.'
    }), 'isgerd'),
    relationship('marriage-oddgeir-jarnhild-todbrand', { status: 'ended', end: '1679' }),
    relationship('marriage-estrid-yvain-todbrand', { status: 'ended', end: '1681' }),
    relationship('marriage-casthild-gwindor-todbrand', { status: 'ended', end: '1702' }),
    relationship('marriage-munthor-hildessa-todbrand', { status: 'ended', end: '1714' }),
    relationship('marriage-gersemi-gunnvald-ragnulf'),
    relationship('marriage-einhild-finnbar-todbrand'),
    relationship('marriage-calthar-froya-todbrand'),
    relationship('marriage-hlokk-magnus-todbrand'),
    relationship('marriage-agnar-ormrun-wargh'),
    alignPartnerOverChildren(relationship('marriage-birta-gudbrand-todbrand'), 'birta-helgr'),
    alignPartnerOverChildren(relationship('affair-gudbrand-greta-todbrand', {
      type: 'affair',
      visibility: 'private',
      notes: 'Silja entstammt ausschließlich dieser Affäre.'
    }), 'greta')
  ],
  parentages: [
    ...childrenOf(['ulfhedin-todbrand', 'steinnun-todbrand'], 'marriage-nordal-olfreya-todbrand', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: 'gap-nordal-ulfhedin-todbrand' }
    }),
    ...childrenOf(['lodvar-todbrand', 'torgunna-todbrand'], 'marriage-ulfhedin-hrafnhild-todbrand'),
    ...childrenOf(['taran-todbrand', 'dagfrid-todbrand', 'kveldulf-todbrand'], 'marriage-lodvar-halldis-todbrand'),
    ...childrenOf(['oddgeir-todbrand', 'estrid-todbrand'], 'marriage-taran-yngvild-todbrand'),
    ...childrenOf(['casthild-todbrand'], 'marriage-kveldulf-lofn-todbrand'),
    ...childrenOf(['audun-todbrand'], 'affair-kveldulf-isgerd-todbrand', {
      legitimacy: 'illegitimate',
      notes: 'Biologische Eltern: Kveldulf Todbrand und Isgerd.'
    }),
    ...childrenOf(['munthor-todbrand'], 'marriage-oddgeir-jarnhild-todbrand'),
    ...childrenOf(['gunnvald-todbrand', 'einhild-todbrand'], 'marriage-munthor-hildessa-todbrand'),
    ...childrenOf(['calthar-todbrand', 'hlokk-todbrand', 'ormrun-todbrand', 'gudbrand-todbrand'], 'marriage-gersemi-gunnvald-ragnulf'),
    ...childrenOf(['andor-todbrand', 'parnilla-todbrand', 'frode-todbrand'], 'marriage-calthar-froya-todbrand'),
    ...childrenOf(['idmar-todbrand', 'norlind-todbrand'], 'marriage-birta-gudbrand-todbrand'),
    ...childrenOf(['silja-todbrand'], 'affair-gudbrand-greta-todbrand', {
      legitimacy: 'illegitimate',
      notes: 'Biologische Eltern: Gudbrand Todbrand und Greta.'
    })
  ],
  cadetBranches: [
    createSingleFounderHouseBranch({
      id: 'bastard-house-eisbrand-audun',
      name: 'Haus Eisbrand',
      parentPersonId: 'audun-todbrand',
      houseId: 'house-eisbrand',
      targetFamilyId: 'haus-eisbrand',
      emblem: HOUSE_EMBLEMS.eisbrand,
      subtitle: 'Nicht anerkanntes Bastard- und Banditenhaus',
      notes: 'Audun Todbrand begründet allein das nicht anerkannte Banditenhaus Eisbrand in Hallsvalr.',
      crestFrame: 'iron'
    }),
    marriedAway('married-away-steinnun-todbrand-graumahne', 'Clan Graumähne', 'marriage-steinnun-eyjolf-todbrand', 'house-graumahne', 'haus-graumahne', HOUSE_EMBLEMS.graumahne),
    marriedAway('married-away-torgunna-todbrand-brathfengr', 'Clan Brathfengr', 'marriage-sigurd-torgunna-brathfengr', 'house-brathfengr', 'haus-brathfengr', HOUSE_EMBLEMS.brathfengr),
    marriedAway('married-away-dagfrid-todbrand-blutstahl', 'Clan Blutstahl', 'marriage-dagfrid-radulfr-todbrand', 'house-blutstahl', 'haus-blutstahl'),
    marriedAway('married-away-estrid-todbrand-gwenyen', "Haus Gwenyen O'Gwych", 'marriage-estrid-yvain-todbrand', 'house-gwenyen', 'haus-gwenyen'),
    marriedAway('married-away-casthild-todbrand-bochdew', "Haus Bochdew O'Caer Ynys", 'marriage-casthild-gwindor-todbrand', 'house-bochdew', 'haus-bochdew'),
    marriedAway('married-away-einhild-todbrand-fiantorc', 'Haus Fiantorc', 'marriage-einhild-finnbar-todbrand', 'house-fiantorc', 'haus-fiantorc'),
    marriedAway('married-away-hlokk-todbrand-schmetterschild', 'Clan Schmetterschild', 'marriage-hlokk-magnus-todbrand', 'house-schmetterschild', 'haus-schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    marriedAway('married-away-ormrun-todbrand-wargh', 'Clan Wargh', 'marriage-agnar-ormrun-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh)
  ],
  timeJumps: [
    timeJump('gap-nordal-ulfhedin-todbrand', 'marriage-nordal-olfreya-todbrand', [
      'ulfhedin-todbrand',
      'steinnun-todbrand'
    ])
  ],
  lineage: {
    founderPartnershipId: 'marriage-nordal-olfreya-todbrand',
    houseId: TODBRAND_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Schwarzfenn · Sitz Dunkelmoor',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'nordal-todbrand',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    sourceRevision: 3,
    sourceModule: 'Clan Todbrand (bereitgestellte Altdaten)',
    sourceNote: 'Der Stammbaum bildet die vollständige überlieferte Todbrand-Genealogie ohne Personenfokus ab. Nordal der Gebrandmarkte und Olfreya bilden das Gründerpaar; der Hausknoten folgt direkt auf sie, der einzige Quellenzeitsprung danach strikt seriell. Ulfhedin und Steinnun stehen als Nachkommen über nicht einzeln überlieferte Generationen. Sämtliche verheirateten Todbrand-Frauen erhalten direkte Wegverheiratet-Verknüpfungen, während Kinder in den Zielhäusern nicht im Todbrand-Baum gedoppelt werden. Kveldulfs legitime Tochter Casthild und sein Bastard Audun bleiben eindeutig ihren jeweiligen Müttern Lofn und Isgerd zugeordnet. Audun trägt nun direkt unter seiner Person die Einzelgründer-Verknüpfung zum nicht anerkannten Bastard- und Banditenhaus Eisbrand in Hallsvalr; seine Nachkommen werden ausschließlich in dieser Gegenakte fortgeführt. Dasselbe gilt für Gudbrands legitime Söhne Idmar und Norlind mit Birta Helgr sowie seine Bastardtochter Silja mit Greta. Bestehende Gegenakten zu Gunnvald und Gersemi Ragnulf, Torgunna und Sigurd Brathfengr, Ormrún und Agnar Wargh sowie Gudbrand und Birta Helgr verwenden dieselben Weltpersonen und Beziehungs-IDs. Die Todbrand-Tabelle nennt Gudbrand als Jahrgang 1703 und Birta als 1704; Gudbrands Herkunftsakte ist hier maßgeblich, für Birta bleibt dagegen das Jahr 1707 aus ihrer Helgr-Herkunftsakte bestehen. Die Amtszeitentabelle nennt Lodvar von 1600 bis 1622, während die Genealogie sein Lebensdatum 1571–1622 angibt; beides wird getrennt und widerspruchsfrei als Geburt und Amtszeit erfasst. Die fünf unbenannten Verlobten-Platzhalter wurden nicht erfunden. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    registryTombstones: {
      persons: ['haus-todbrand-gruender', 'haus-todbrand-gruenderin'],
      partnerships: ['marriage-haus-todbrand-founders']
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
