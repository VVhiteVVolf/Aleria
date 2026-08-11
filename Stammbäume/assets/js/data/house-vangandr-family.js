import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_VANGANDR_PORTRAITS
} from './house-vangandr-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';

const VANGANDR_HOUSE_ID = 'house-vangandr';

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
  'vagn-vangandr',
  'rurik-vangandr',
  'torgrim-vangandr',
  'grim-vangandr',
  'thorgil-vangandr',
  'drott-vangandr',
  'wrage-1628-vangandr',
  'sverkel-vangandr',
  'hodr-vangandr'
]);

const MAINLINE_IDS = new Set([
  'vidar-vangandr',
  'baldr-vangandr',
  'olof-vangandr'
]);

const REPEATED_PARTNERSHIP_APPEARANCES = Object.freeze({
  'erna-vangandr': 'marriage-kjallakr-erna-vangandr',
  'estrid-vangandr': 'marriage-wrage-estrid-vangandr'
});

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function chartAppearanceExtensions(personId) {
  const partnershipId = REPEATED_PARTNERSHIP_APPEARANCES[personId];
  return partnershipId
    ? { chartRepeatForPartnershipIds: [partnershipId] }
    : {};
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? VANGANDR_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_VANGANDR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === VANGANDR_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...chartAppearanceExtensions(id),
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth = '????', death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function relationPartner(id, name, birth, death, familyRole, title, options = {}) {
  return spouse(id, name, 'female', birth, death, {
    ...options,
    familyRole,
    title,
    tags: [
      ...(options.tags || []),
      familyRole === 'forced' ? 'Erzwungene Verbindung' : 'Affäre'
    ]
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
  vagn: ['vagn-vangandr', 'egbertha'],
  rurikArnlaug: ['rurik-vangandr', 'arnlaug'],
  rurikVorna: ['rurik-vangandr', 'vorna-vangandr'],
  rurikNorna: ['rurik-vangandr', 'norna-rurik'],
  ottarHalla: ['ottar-vangandr', 'halla'],
  ottarHelga: ['ottar-vangandr', 'helga-ottar'],
  kolbein: ['kolbein-vangandr', 'kolga'],
  kjallakr: ['kjallakr-vangandr', 'erna-vangandr'],
  haldor: ['haldor-vangandr', 'fenja'],
  hallgerd: ['hallgerd-vangandr', 'jokul-vangandr'],
  torgrim: ['torgrim-vangandr', 'edda'],
  starkad: ['starkad-vangandr', 'luta'],
  wrage: ['wrage-1628-vangandr', 'estrid-vangandr'],
  sverkel: ['sverkel-vangandr', 'asrid'],
  oddny: ['oddny-vangandr', 'norna-oddny'],
  hodr: ['hodr-vangandr', 'gudrid'],
  eadricEmma: ['eadric-vangandr', 'emma'],
  eadricDeirdre: ['eadric-vangandr', 'deirdre'],
  brodd: ['brodd-vangandr', 'annegret'],
  vidarLotta: ['vidar-vangandr', 'lotta'],
  vidarArnheid: ['vidar-vangandr', 'arnheid'],
  vidarBrigid: ['vidar-vangandr', 'brigid'],
  hel: ['hel-vangandr', 'gardar'],
  einarr: ['einarr-vangandr', 'thora'],
  torger: ['torger-vangandr', 'tulla']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-vagn-egbertha-vangandr': COUPLES.vagn,
  'marriage-rurik-arnlaug-vangandr': COUPLES.rurikArnlaug,
  'affair-rurik-vorna-vangandr': COUPLES.rurikVorna,
  'affair-rurik-norna-vangandr': COUPLES.rurikNorna,
  'marriage-ottar-halla-vangandr': COUPLES.ottarHalla,
  'forced-ottar-helga-vangandr': COUPLES.ottarHelga,
  'marriage-kolbein-kolga-vangandr': COUPLES.kolbein,
  'marriage-kjallakr-erna-vangandr': COUPLES.kjallakr,
  'marriage-haldor-fenja-vangandr': COUPLES.haldor,
  'affair-hallgerd-jokul-vangandr': COUPLES.hallgerd,
  'marriage-torgrim-edda-vangandr': COUPLES.torgrim,
  'marriage-starkad-luta-vangandr': COUPLES.starkad,
  'marriage-wrage-estrid-vangandr': COUPLES.wrage,
  'marriage-sverkel-asrid-vangandr': COUPLES.sverkel,
  'marriage-oddny-norna-vangandr': COUPLES.oddny,
  'marriage-hodr-gudrid-vangandr': COUPLES.hodr,
  'marriage-eadric-emma-vangandr': COUPLES.eadricEmma,
  'forced-eadric-deirdre-vangandr': COUPLES.eadricDeirdre,
  'marriage-brodd-annegret-vangandr': COUPLES.brodd,
  'marriage-vidar-lotta-vangandr': COUPLES.vidarLotta,
  'affair-vidar-arnheid-vangandr': COUPLES.vidarArnheid,
  'forced-vidar-brigid-vangandr': COUPLES.vidarBrigid,
  'marriage-hel-gardar-vangandr': COUPLES.hel,
  'marriage-einarr-thora-vangandr': COUPLES.einarr,
  'marriage-torger-tulla-vangandr': COUPLES.torger
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
    idPrefix: 'vangandr-parentage',
    ...options
  });
}

export const HOUSE_VANGANDR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-vangandr',
    title: 'Clan Vangandr',
    motto: '',
    description: 'Thanenclan von Wolfspfad im Dämmergrund, aus den verfluchten Überlebenden des alten Vanir-Clans hervorgegangen.',
    emblem: RORIKSHEIM_HOUSE_EMBLEMS.vangandr,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.vangandr
  },
  houses: [
    house(VANGANDR_HOUSE_ID, 'Clan Vangandr', RORIKSHEIM_HOUSE_EMBLEMS.vangandr),
    house('house-vanir', 'Clan Vanir', RORIKSHEIM_HOUSE_EMBLEMS.vanir, 'extinct')
  ],
  persons: [
    person('vagn-vangandr', 'Vagn Vangandr', 'male', '????', '????', {
      status: 'dead',
      title: 'Anführer der letzten Vanir · Begründer der verfluchten Vangandr-Linie',
      tags: ['Gründer'],
      extensions: {
        chartCenterBetweenSpousePersonIds: ['egbertha']
      }
    }),
    spouse('egbertha', 'Egbertha', 'female', '????', '????', {
      status: 'dead',
      title: 'Ehefrau Vagns'
    }),

    person('rurik-vangandr', 'Rurik Vangandr', 'male', '1572', '1637', {
      title: 'Thane der Vangandr · 1637 in Wolfspfad hingerichtet',
      extensions: {
        chartCenterBetweenSpousePersonIds: ['arnlaug', 'norna-rurik']
      }
    }),
    person('ottar-vangandr', 'Ottar Vangandr', 'male', '1580', '1637', {
      extensions: {
        chartCenterBetweenSpousePersonIds: ['helga-ottar', 'halla']
      }
    }),
    spouse('arnlaug', 'Arnlaug', 'female', '1578', '1637', { title: 'Ehefrau Ruriks' }),
    relationPartner('vorna-vangandr', 'Vorna', '1586', '1637', 'affair', 'Affäre Ruriks · Mutter Ernas'),
    relationPartner('norna-rurik', 'Norna', '1589', '1650', 'affair', 'Affäre Ruriks · Mutter Ganglatis und Vargars'),
    spouse('halla', 'Halla', 'female', '1584', '1637', { title: 'Ehefrau Ottars' }),
    relationPartner('helga-ottar', 'Helga', '1592', '????', 'forced', 'Opfer Ottars · Mutter Jokuls', {
      status: 'dead'
    }),

    person('kolbein-vangandr', 'Kolbein Vangandr', 'male', '1598', '1637'),
    person('kjallakr-vangandr', 'Kjallakr Vangandr', 'male', '1602', '1637'),
    person('erna-vangandr', 'Erna Vangandr', 'female', '1603', '1637', {
      familyRole: 'bastard',
      title: 'Uneheliche Tochter Ruriks und Vornas',
      tags: ['Bastard']
    }),
    person('ganglati-vangandr', 'Ganglati Vangandr', 'male', '1606', '1637', {
      familyRole: 'bastard',
      title: 'Unehelicher Sohn Ruriks und Nornas',
      tags: ['Bastard']
    }),
    person('vargar-vangandr', 'Vargar Vangandr', 'male', '1608', '1637', {
      familyRole: 'bastard',
      title: 'Unehelicher Sohn Ruriks und Nornas',
      tags: ['Bastard']
    }),
    person('haldor-vangandr', 'Haldor Vangandr', 'male', '1601', '1637'),
    person('hallgerd-vangandr', 'Hallgerd Vangandr', 'female', '1608', '1637'),
    person('jokul-vangandr', 'Jokul Vangandr', 'male', '1612', '1637', {
      familyRole: 'bastard',
      title: 'Unehelicher Sohn Ottars aus einer erzwungenen Verbindung',
      tags: ['Bastard']
    }),
    spouse('kolga', 'Kolga', 'female', '1607', '1637'),
    spouse('fenja', 'Fenja', 'female', '1608', '1637'),
    spouse('edda', 'Edda', 'female', '1625', '1671'),
    spouse('luta', 'Luta', 'female', '1623', '1640'),

    person('torgrim-vangandr', 'Torgrim Vangandr', 'male', '1625', '1651', {
      title: 'Thane der Vangandr 1637–1651'
    }),
    person('thorgil-vangandr', 'Thorgil Vangandr', 'male', '1628', '1652', {
      title: 'Thane der Vangandr im Jahr 1652'
    }),
    person('grim-vangandr', 'Grim Vangandr', 'male', '1627', '1652', {
      title: 'Thane der Vangandr 1651–1652'
    }),
    person('starkad-vangandr', 'Starkad Vangandr', 'male', '1623', '1640'),
    person('wrage-1628-vangandr', 'Wrage Vangandr', 'male', '1628', '1671', {
      title: 'Thane der Vangandr 1653–1671'
    }),
    person('drott-vangandr', 'Drott Vangandr', 'male', '1633', '1653', {
      title: 'Thane der Vangandr 1652–1653'
    }),
    person('estrid-vangandr', 'Estrid Vangandr', 'female', '1630', '1676', {
      familyRole: 'bastard',
      title: 'Uneheliche Tochter Hallgerds und Jokuls',
      tags: ['Bastard']
    }),

    person('hild-vangandr', 'Hild Vangandr', 'female', '1643', '1675'),
    person('sverkel-vangandr', 'Sverkel Vangandr', 'male', '1650', '1717', {
      title: 'Thane der Vangandr 1671–1717'
    }),
    person('mols-vangandr', 'Mols Vangandr', 'male', '1655', '1671'),
    person('oddny-vangandr', 'Oddny Vangandr', 'female', '1661', '1689'),
    spouse('asrid', 'Asrid', 'female', '1652', '1725'),
    spouse('norna-oddny', 'Norna', 'female', '1665', '1711', {
      title: 'Ehefrau Oddnys'
    }),

    person('hodr-vangandr', 'Höðr Vangandr', 'male', '1670', '', {
      title: 'Thane der Vangandr seit 1717'
    }),
    person('eadric-vangandr', 'Eadric Vangandr', 'male', '1672', '', {
      extensions: {
        chartCenterBetweenSpousePersonIds: ['emma', 'deirdre']
      }
    }),
    person('brodd-vangandr', 'Brodd Vangandr', 'male', '1675', '1720'),
    person('hrefna-vangandr', 'Hrefna Vangandr', 'female', '1686', '1709'),
    spouse('gudrid', 'Gudrid', 'female', '1674', ''),
    spouse('emma', 'Emma', 'female', '1675', ''),
    relationPartner('deirdre', 'Deirdre', '1702', '', 'forced', 'Opfer Eadrics · Mutter Finnbolds'),
    spouse('annegret', 'Annegret', 'female', '1700', ''),

    person('vidar-vangandr', 'Vidar Vangandr', 'male', '1692', '', {
      title: 'Erster Erbe des Clans Vangandr',
      extensions: {
        chartCenterBetweenSpousePersonIds: ['lotta', 'brigid']
      }
    }),
    person('hel-vangandr', 'Hel Vangandr', 'female', '1696', ''),
    person('einarr-vangandr', 'Einarr Vangandr', 'male', '1697', ''),
    person('finnbold-vangandr', 'Finnbold Vangandr', 'male', '1721', '', {
      familyRole: 'bastard',
      title: 'Unehelicher Sohn Eadrics und Deirdres',
      tags: ['Bastard']
    }),
    person('torger-vangandr', 'Torger Vangandr', 'male', '1700', ''),
    spouse('lotta', 'Lotta', 'female', '1695', '', { title: 'Ehefrau Vidars' }),
    relationPartner('arnheid', 'Arnheid', '1705', '', 'affair', 'Affäre Vidars · Mutter Garms'),
    relationPartner('brigid', 'Brigid', '1704', '', 'forced', 'Opfer Vidars · Mutter Wrages'),
    spouse('gardar', 'Gardar', 'male', '1699', ''),
    spouse('thora', 'Thora', 'female', '1700', ''),
    spouse('tulla', 'Tulla', 'female', '1703', ''),

    person('baldr-vangandr', 'Baldr Vangandr', 'male', '1717', '', {
      title: 'Zweiter Erbe des Clans Vangandr'
    }),
    person('olof-vangandr', 'Olof Vangandr', 'male', '1718', '', {
      title: 'Dritter Erbe des Clans Vangandr'
    }),
    person('garm-vangandr', 'Garm Vangandr', 'male', '1722', '', {
      familyRole: 'bastard',
      title: 'Unehelicher Sohn Vidars und Arnheids',
      tags: ['Bastard']
    }),
    person('wrage-1720-vangandr', 'Wrage Vangandr', 'male', '1720', '', {
      familyRole: 'bastard',
      title: 'Unehelicher Sohn Vidars aus einer erzwungenen Verbindung',
      tags: ['Bastard']
    }),
    person('flott-vangandr', 'Flott Vangandr', 'male', '1722', ''),
    person('ylva-vangandr', 'Ylva Vangandr', 'female', '1724', ''),
    person('mord-vangandr', 'Mord Vangandr', 'male', '1723', ''),
    person('tore-vangandr', 'Tore Vangandr', 'male', '1727', ''),
    person('olmar-vangandr', 'Olmar Vangandr', 'male', '1722', '')
  ],
  partnerships: [
    relationship('marriage-vagn-egbertha-vangandr', { status: 'ended' }),
    alignPartnerOverChildren(relationship('marriage-rurik-arnlaug-vangandr', { status: 'ended', end: '1637' }), 'arnlaug'),
    alignPartnerOverChildren(relationship('affair-rurik-vorna-vangandr', {
      type: 'affair', status: 'ended', end: '1637', visibility: 'private',
      notes: 'Erna entstammt ausschließlich dieser Affäre.'
    }), 'vorna-vangandr'),
    alignPartnerOverChildren(relationship('affair-rurik-norna-vangandr', {
      type: 'affair', status: 'ended', end: '1637', visibility: 'private',
      notes: 'Ganglati und Vargar entstammen ausschließlich dieser Affäre.'
    }), 'norna-rurik'),
    alignPartnerOverChildren(relationship('marriage-ottar-halla-vangandr', { status: 'ended', end: '1637' }), 'halla'),
    alignPartnerOverChildren(relationship('forced-ottar-helga-vangandr', {
      type: 'forced', status: 'ended', end: '1637',
      notes: 'Die Quelle bezeichnet Helga ausdrücklich als Ottars Opfer.'
    }), 'helga-ottar'),
    relationship('marriage-kolbein-kolga-vangandr', { status: 'ended', end: '1637' }),
    relationship('marriage-kjallakr-erna-vangandr', { status: 'ended', end: '1637' }),
    relationship('marriage-haldor-fenja-vangandr', { status: 'ended', end: '1637' }),
    relationship('affair-hallgerd-jokul-vangandr', {
      type: 'affair', status: 'ended', end: '1637', visibility: 'private',
      notes: 'Die Halbgeschwister Hallgerd und Jokul zeugten Estrid.'
    }),
    relationship('marriage-torgrim-edda-vangandr', { status: 'ended', end: '1651' }),
    relationship('marriage-starkad-luta-vangandr', { status: 'ended', end: '1640' }),
    relationship('marriage-wrage-estrid-vangandr', { status: 'ended', end: '1671' }),
    relationship('marriage-sverkel-asrid-vangandr', { status: 'ended', end: '1717' }),
    relationship('marriage-oddny-norna-vangandr', { status: 'ended', end: '1689' }),
    relationship('marriage-hodr-gudrid-vangandr'),
    alignPartnerOverChildren(relationship('marriage-eadric-emma-vangandr'), 'emma'),
    alignPartnerOverChildren(relationship('forced-eadric-deirdre-vangandr', {
      type: 'forced', visibility: 'private',
      notes: 'Die Quelle bezeichnet Deirdre als Eadrics Opfer; Finnbold entstammt ausschließlich dieser erzwungenen Verbindung.'
    }), 'deirdre'),
    relationship('marriage-brodd-annegret-vangandr', { status: 'ended', end: '1720' }),
    alignPartnerOverChildren(relationship('marriage-vidar-lotta-vangandr'), 'lotta'),
    alignPartnerOverChildren(relationship('affair-vidar-arnheid-vangandr', {
      type: 'affair', visibility: 'private',
      notes: 'Garm entstammt ausschließlich dieser Affäre.'
    }), 'arnheid'),
    alignPartnerOverChildren(relationship('forced-vidar-brigid-vangandr', {
      type: 'forced',
      notes: 'Die Quelle bezeichnet Brigid ausdrücklich als Vidars Opfer; Wrage entstammt dieser Verbindung.'
    }), 'brigid'),
    relationship('marriage-hel-gardar-vangandr'),
    relationship('marriage-einarr-thora-vangandr'),
    relationship('marriage-torger-tulla-vangandr')
  ],
  parentages: [
    ...childrenOf(['rurik-vangandr', 'ottar-vangandr'], 'marriage-vagn-egbertha-vangandr'),
    ...childrenOf(['kolbein-vangandr', 'kjallakr-vangandr'], 'marriage-rurik-arnlaug-vangandr'),
    ...childrenOf(['erna-vangandr'], 'affair-rurik-vorna-vangandr', {
      legitimacy: 'illegitimate',
      notes: 'Biologische Eltern: Rurik und Vorna.'
    }),
    ...childrenOf(['ganglati-vangandr', 'vargar-vangandr'], 'affair-rurik-norna-vangandr', {
      legitimacy: 'illegitimate',
      notes: 'Biologische Eltern: Rurik und Norna.'
    }),
    ...childrenOf(['hallgerd-vangandr', 'haldor-vangandr'], 'marriage-ottar-halla-vangandr'),
    ...childrenOf(['jokul-vangandr'], 'forced-ottar-helga-vangandr', {
      legitimacy: 'illegitimate',
      notes: 'Biologische Eltern: Ottar und Helga; keine freiwillige Verbindung.'
    }),
    ...childrenOf(['torgrim-vangandr', 'thorgil-vangandr'], 'marriage-kolbein-kolga-vangandr'),
    ...childrenOf(['grim-vangandr', 'starkad-vangandr'], 'marriage-kjallakr-erna-vangandr'),
    ...childrenOf(['wrage-1628-vangandr', 'drott-vangandr'], 'marriage-haldor-fenja-vangandr'),
    ...childrenOf(['estrid-vangandr'], 'affair-hallgerd-jokul-vangandr', {
      legitimacy: 'illegitimate',
      notes: 'Biologische Eltern: Hallgerd und Jokul.'
    }),
    ...childrenOf(['hild-vangandr'], 'marriage-torgrim-edda-vangandr'),
    ...childrenOf(['sverkel-vangandr', 'mols-vangandr', 'oddny-vangandr'], 'marriage-wrage-estrid-vangandr'),
    ...childrenOf(['hodr-vangandr', 'eadric-vangandr', 'brodd-vangandr'], 'marriage-sverkel-asrid-vangandr'),
    ...childrenOf(['hrefna-vangandr'], 'marriage-oddny-norna-vangandr'),
    ...childrenOf(['vidar-vangandr', 'hel-vangandr'], 'marriage-hodr-gudrid-vangandr'),
    ...childrenOf(['einarr-vangandr'], 'marriage-eadric-emma-vangandr'),
    ...childrenOf(['finnbold-vangandr'], 'forced-eadric-deirdre-vangandr', {
      legitimacy: 'illegitimate',
      notes: 'Biologische Eltern: Eadric und Deirdre; keine freiwillige Verbindung.'
    }),
    ...childrenOf(['torger-vangandr'], 'marriage-brodd-annegret-vangandr'),
    ...childrenOf(['baldr-vangandr', 'olof-vangandr'], 'marriage-vidar-lotta-vangandr'),
    ...childrenOf(['garm-vangandr'], 'affair-vidar-arnheid-vangandr', {
      legitimacy: 'illegitimate',
      notes: 'Biologische Eltern: Vidar und Arnheid.'
    }),
    ...childrenOf(['wrage-1720-vangandr'], 'forced-vidar-brigid-vangandr', {
      legitimacy: 'illegitimate',
      notes: 'Biologische Eltern: Vidar und Brigid; keine freiwillige Verbindung.'
    }),
    ...childrenOf(['flott-vangandr', 'ylva-vangandr'], 'marriage-hel-gardar-vangandr'),
    ...childrenOf(['mord-vangandr', 'tore-vangandr'], 'marriage-einarr-thora-vangandr'),
    ...childrenOf(['olmar-vangandr'], 'marriage-torger-tulla-vangandr')
  ],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-vagn-egbertha-vangandr',
    houseId: VANGANDR_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Wolfspfad · die Verfluchten',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'vanir-origin-vangandr',
      houseId: 'house-vanir',
      name: 'Clan Vanir',
      subtitle: 'Ursprungsclan der Vangandr',
      emblem: RORIKSHEIM_HOUSE_EMBLEMS.vanir,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['vagn-vangandr'],
      targetFamilyId: 'haus-vanir',
      notes: 'Die Vangandr gingen aus den überlebenden Vanir hervor. Die nicht einzeln überlieferten Generationen enden bei Vagn, dem Begründer der verfluchten Linie.',
      timeGap: {
        enabled: true,
        years: 0,
        fromYear: '????',
        toYear: '????',
        label: 'Nicht einzeln überlieferte Generationen'
      }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'vagn-vangandr',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: 'Clan Vangandr (bereitgestellte Altdaten)',
    sourceNote: 'Die vollständige Genealogie folgt der bereitgestellten Vangandr-Hausseite, der dort eingebetteten Stammbaumgrafik und der ergänzenden Korrektur zu Deirdre. Der Vanir-Ursprung steht als verlinktes Vorgängerwappen ganz oben; ein eigener serieller Zeitsprung führt von dort zu Vagn und erst Vagn mit Egbertha trägt den Vangandr-Hausknoten. Vangandr-Frauen werden nicht wegverheiratet, sondern bleiben Teil der fortführenden Clanlinie. Ruriks Affären mit Vorna und Norna, Ottars erzwungene Verbindung mit Helga, Hallgerds Affäre mit Jokul, Eadrics erzwungene Verbindung mit Deirdre sowie Vidars Ehe, Affäre und erzwungene Verbindung besitzen getrennte Elternschaftsgruppen. Erna und Estrid erscheinen an ihrer Herkunftsstelle und kontrolliert ein zweites Mal an der jeweils fortgeführten Ehe; ihre Kinder werden ausschließlich an dieser Ehe fortgesetzt. Dadurch ersetzt horizontale Breite lange rücklaufende Verbindungslinien, ohne Weltpersonen oder Kinderlinien zu verdoppeln. Das Hallgerd zugeordnete Quellbild zeigt einen Mann und wird nach Benutzerkorrektur ausdrücklich verworfen; Hallgerd verwendet die weibliche Standardsilhouette. Weitere wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
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
    registryManagedViewFields: ['focusPersonId', 'limitGenerations'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse']
  }
});
