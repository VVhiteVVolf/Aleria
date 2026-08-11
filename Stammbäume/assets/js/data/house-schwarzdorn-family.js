import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SCHWARZDORN_PORTRAITS } from './house-schwarzdorn-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';

const SCHWARZDORN_HOUSE_ID = 'house-schwarzdorn';
const FOUNDER_TIME_JUMP_ID = 'gap-geirmundr-inigmund-schwarzdorn';

const HOUSE_EMBLEMS = Object.freeze({
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  kampfgeborene: RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene,
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
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
  'geirmundr-schwarzdorn',
  'inigmund-schwarzdorn',
  'iormund-schwarzdorn',
  'vormund-schwarzdorn',
  'tormund-1643-schwarzdorn',
  'jormund-schwarzdorn',
  'mathon-schwarzdorn',
  'tormund-1713-schwarzdorn'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return personId === 'honmund-schwarzdorn' ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SCHWARZDORN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SCHWARZDORN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SCHWARZDORN_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['geirmundr-schwarzdorn', 'svanlaug'],
  inigmund: ['inigmund-schwarzdorn', 'hallbera-graumahne'],
  sigmund: ['sigmund-schwarzdorn', 'ermingard'],
  iormund: ['iormund-schwarzdorn', 'ranveig-feuerhaar'],
  ormhild: ['hjalti-varangr', 'ormhild-schwarzdorn'],
  thorben: ['thorben-schwarzdorn', 'malfrid-freiwinter'],
  vormund: ['vormund-schwarzdorn', 'thorhild-kampfgeborene'],
  vorga: ['alrek-kampfgeborene', 'vorga-schwarzdorn'],
  thorirDagny: ['thorir-schwarzdorn', 'dagny'],
  thorirThurid: ['thorir-schwarzdorn', 'thurid-skjegg'],
  tormund: ['tormund-1643-schwarzdorn', 'yrsa-grindel'],
  maeve: ['seamus-haeghra', 'maeve-schwarzdorn'],
  vignar: ['svenja-freiwinter', 'vignar-schwarzdorn'],
  torger: ['torger-schwarzdorn', 'vedis-sterkr'],
  jormund: ['jormund-schwarzdorn', 'eldridd-skogg'],
  gormund: ['gormund-schwarzdorn', 'gwelda'],
  mormond: ['mormond-schwarzdorn', 'asgerd-silberzunge'],
  ingrid: ['torygg-varulv', 'ingrid-schwarzdorn'],
  vigmar: ['vigmar-schwarzdorn', 'frigga-feuerhaar'],
  tjudmund: ['tjudmund-schwarzdorn', 'egberta-frostauge'],
  mathon: ['mathon-schwarzdorn', 'borghild-skjegg'],
  maven: ['jarell-hyrmgardr', 'maven-schwarzdorn'],
  miermir: ['angreboda-freiwinter', 'miermir-schwarzdorn'],
  maeva: ['brunwulf-freiwinter', 'maeva-schwarzdorn'],
  hoskuld: ['hoskuld-schwarzdorn', 'hildigunn-brathfengr'],
  annegret: ['arfon-teyrngarch', 'annegret-schwarzdorn'],
  modolf: ['modolf-schwarzdorn', 'hervera'],
  thrand: ['thrand-schwarzdorn', 'hallgerd'],
  torvard: ['torvard-schwarzdorn', 'vilborg-sturmgeborene']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-geirmundr-svanlaug-schwarzdorn': COUPLES.founders,
  'marriage-inigmund-hallbera-schwarzdorn': COUPLES.inigmund,
  'marriage-sigmund-ermingard-schwarzdorn': COUPLES.sigmund,
  'marriage-iormund-ranveig-schwarzdorn': COUPLES.iormund,
  'marriage-hjalti-ormhild-schwarzdorn': COUPLES.ormhild,
  'marriage-thorben-malfrid-schwarzdorn': COUPLES.thorben,
  'marriage-vormund-thorhild-schwarzdorn': COUPLES.vormund,
  'marriage-alrek-vorga-schwarzdorn': COUPLES.vorga,
  'affair-thorir-dagny-schwarzdorn': COUPLES.thorirDagny,
  'marriage-thorir-thurid-schwarzdorn': COUPLES.thorirThurid,
  'marriage-tormund-yrsa-schwarzdorn': COUPLES.tormund,
  'marriage-seamus-maeve-schwarzdorn': COUPLES.maeve,
  'marriage-svenja-vignar-freiwinter': COUPLES.vignar,
  'marriage-torger-vedis-schwarzdorn': COUPLES.torger,
  'marriage-jormund-eldridd-schwarzdorn': COUPLES.jormund,
  'marriage-gormund-gwelda-schwarzdorn': COUPLES.gormund,
  'marriage-mormond-asgerd-schwarzdorn': COUPLES.mormond,
  'marriage-torygg-ingrid-varulv': COUPLES.ingrid,
  'marriage-vigmar-frigga-schwarzdorn': COUPLES.vigmar,
  'marriage-tjudmund-egberta-schwarzdorn': COUPLES.tjudmund,
  'marriage-mathon-borghild-schwarzdorn': COUPLES.mathon,
  'marriage-jarell-maven-schwarzdorn': COUPLES.maven,
  'marriage-angreboda-miermir-freiwinter': COUPLES.miermir,
  'marriage-brunwulf-maeva-freiwinter': COUPLES.maeva,
  'marriage-hoskuld-hildigunn-schwarzdorn': COUPLES.hoskuld,
  'marriage-arfon-annegret-teyrngarch': COUPLES.annegret,
  'marriage-modolf-hervera-schwarzdorn': COUPLES.modolf,
  'marriage-thrand-hallgerd-schwarzdorn': COUPLES.thrand,
  'marriage-torvard-vilborg-schwarzdorn': COUPLES.torvard
});

function marriage(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function endedMarriage(partnershipId, end = '') {
  return marriage(partnershipId, { status: 'ended', end });
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
    idPrefix: 'schwarzdorn-parentage',
    ...options
  });
}

function claimedChildren(childIds, partnershipId) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Zwischen dem Gründerpaar und diesen Brüdern sind mehrere Generationen nicht einzeln überliefert.',
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

export const HOUSE_SCHWARZDORN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-schwarzdorn',
    title: 'Clan Schwarzdorn',
    motto: 'Wo das Bier fließt, fließt auch die Macht',
    description: 'Wohlhabender Hesire-Clan von Rorikshall, Betreiber der Schwarzdorn-Brauerei und Vasall der Varulv.',
    emblem: HOUSE_EMBLEMS.schwarzdorn,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.schwarzdorn
  },
  houses: [
    house(SCHWARZDORN_HOUSE_ID, 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-kampfgeborene', 'Clan Kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    house('house-skjegg', 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-graumahne', 'Clan Graumähne'),
    house('house-feuerhaar', 'Clan Feuerhaar'),
    house('house-grindel', 'Clan Grindel'),
    house('house-haeghra', 'Clan Haeghra'),
    house('house-skogg', 'Clan Skogg'),
    house('house-silberzunge', 'Clan Silberzunge'),
    house('house-frostauge', 'Clan Frostauge'),
    house('house-hyrmgardr', 'Clan Hyrmgaðr'),
    house('house-teyrngarch', 'Haus Teyrngarch'),
    house('house-sturmgeborene', 'Clan Sturmgeborene'),
    house('house-unknown', 'Unbekanntes Haus')
  ],
  persons: [
    person('geirmundr-schwarzdorn', 'Geirmundr Schwarzdorn', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Gründer des Clans Schwarzdorn · Hesir'
    }),
    spouse('svanlaug', 'Svanlaug', 'female', '????', '????'),

    person('inigmund-schwarzdorn', 'Inigmund Schwarzdorn', 'male', '1570', '1624', { title: 'Hesir des Clans Schwarzdorn' }),
    spouse('hallbera-graumahne', 'Hallbera Graumähne', 'female', '1571', '1640?', 'house-graumahne'),
    person('sigmund-schwarzdorn', 'Sigmund Schwarzdorn', 'male', '1576', '1622'),
    spouse('ermingard', 'Ermingard', 'female', '1577', '1654'),

    person('iormund-schwarzdorn', 'Iormund Schwarzdorn', 'male', '1590', '1662', { title: 'Hesir des Clans Schwarzdorn' }),
    spouse('ranveig-feuerhaar', 'Ranveig Feuerhaar', 'female', '1598', '1661', 'house-feuerhaar'),
    awayWoman('ormhild-schwarzdorn', 'Ormhild Schwarzdorn', '1594', '1633', 'Clan Varangr'),
    spouse('hjalti-varangr', 'Hjalti Varangr', 'male', '1592', '1651', 'house-varangr'),
    person('thorben-schwarzdorn', 'Thorben Schwarzdorn', 'male', '1596', '1632'),
    spouse('malfrid-freiwinter', 'Malfrid Freiwinter', 'female', '1600', '1633', 'house-freiwinter'),

    person('vormund-schwarzdorn', 'Vormund Schwarzdorn', 'male', '1617', '1690', { title: 'Hesir des Clans Schwarzdorn' }),
    spouse('thorhild-kampfgeborene', 'Thorhild Kampfgeborene', 'female', '1621', '1689', 'house-kampfgeborene'),
    awayWoman('vorga-schwarzdorn', 'Vorga Schwarzdorn', '1621', '1686', 'Clan Kampfgeborene'),
    spouse('alrek-kampfgeborene', 'Alrek Kampfgeborene', 'male', '1618', '1674', 'house-kampfgeborene'),
    person('thorir-schwarzdorn', 'Thorir Schwarzdorn', 'male', '1620', '1683'),
    spouse('dagny', 'Dagny', 'female', '1618', '1654', '', {
      familyRole: 'affair',
      title: 'Affäre Thorirs · Mutter von Hertha',
      tags: ['Affäre'],
      notes: 'Aus dieser Affäre stammt ausschließlich Hertha Schwarzdorn.'
    }),
    spouse('thurid-skjegg', 'Thurid Skjegg', 'female', '1621', '1694', 'house-skjegg'),

    person('tormund-1643-schwarzdorn', 'Tormund Schwarzdorn', 'male', '1643', '1709', { title: 'Hesir des Clans Schwarzdorn' }),
    spouse('yrsa-grindel', 'Yrsa Grindel', 'female', '1645', '1711', 'house-grindel'),
    awayWoman('maeve-schwarzdorn', 'Maeve Schwarzdorn', '1645', '1719', 'Clan Haeghra'),
    spouse('seamus-haeghra', 'Seamus Haeghra', 'male', '1644', '1707', 'house-haeghra'),
    person('vignar-schwarzdorn', 'Vignar Schwarzdorn', 'male', '1647', '1703'),
    spouse('svenja-freiwinter', 'Svenja Freiwinter', 'female', '1650', '1713', 'house-freiwinter'),
    person('hertha-schwarzdorn', 'Hertha Schwarzdorn', 'female', '1637', '1714', {
      familyRole: 'bastard',
      title: 'Bastardtochter Thorirs & Dagnys',
      tags: ['Bastard'],
      notes: 'Hertha stammt ausschließlich aus Thorirs Affäre mit Dagny.'
    }),
    person('torger-schwarzdorn', 'Torger Schwarzdorn', 'male', '1646', '1691'),
    spouse('vedis-sterkr', 'Vedis Sterkr', 'female', '1650', '1720', 'house-sterkr'),

    person('jormund-schwarzdorn', 'Jormund Schwarzdorn', 'male', '1667', '1720', { title: 'Hesir des Clans Schwarzdorn' }),
    spouse('eldridd-skogg', 'Eldridd Skogg', 'female', '1669', '1734', 'house-skogg'),
    person('gormund-schwarzdorn', 'Gormund Schwarzdorn', 'male', '1670', '1720'),
    spouse('gwelda', 'Gwelda', 'female', '1674', ''),
    person('mormond-schwarzdorn', 'Mormond Schwarzdorn', 'male', '1673', '1720'),
    spouse('asgerd-silberzunge', 'Asgerd Silberzunge', 'female', '1674', '1720', 'house-silberzunge'),
    person('vigmar-schwarzdorn', 'Vigmar Schwarzdorn', 'male', '1673', ''),
    spouse('frigga-feuerhaar', 'Frigga Feuerhaar', 'female', '1676', '', 'house-feuerhaar'),
    awayWoman('ingrid-schwarzdorn', 'Ingrid Schwarzdorn', '1675', '1730', 'Clan Varulv'),
    spouse('torygg-varulv', 'Torygg Varulv', 'male', '1674', '1720', 'house-varulv'),
    person('tjudmund-schwarzdorn', 'Tjudmund Schwarzdorn', 'male', '1673', ''),
    spouse('egberta-frostauge', 'Egberta Frostauge', 'female', '1677', '', 'house-frostauge'),

    person('mathon-schwarzdorn', 'Mathon Schwarzdorn', 'male', '1688', '1720', { title: 'Hesir des Clans Schwarzdorn' }),
    spouse('borghild-skjegg', 'Borghild Skjegg', 'female', '1695', '', 'house-skjegg', {
      notes: 'Die Ehezeile der Quelle nennt Borghild als Mathons Frau. Die Kinderüberschrift nennt abweichend „Lydia“, ohne dafür einen eigenen Personeneintrag zu liefern; deshalb wird keine zweite Person erfunden.'
    }),
    awayWoman('maven-schwarzdorn', 'Maven Schwarzdorn', '1693', '', 'Clan Hyrmgaðr', {
      title: 'Leiterin der Schwarzdorn-Brauerei · Wegverheiratet an Clan Hyrmgaðr'
    }),
    spouse('jarell-hyrmgardr', 'Jarell Hyrmgaðr', 'male', '1673', '', 'house-hyrmgardr'),
    person('miermir-schwarzdorn', 'Miermir Schwarzdorn', 'male', '1696', '1720'),
    spouse('angreboda-freiwinter', 'Angreboda Freiwinter', 'female', '1697', '1721', 'house-freiwinter'),
    awayWoman('maeva-schwarzdorn', 'Maeva Schwarzdorn', '1707', '', 'Clan Freiwinter'),
    spouse('brunwulf-freiwinter', 'Brunwulf Freiwinter', 'male', '1703', '', 'house-freiwinter'),
    person('hoskuld-schwarzdorn', 'Hoskuld Schwarzdorn', 'male', '1696', ''),
    spouse('hildigunn-brathfengr', 'Hildigunn Brathfengr', 'female', '1698', '', 'house-brathfengr'),
    awayWoman('annegret-schwarzdorn', 'Annegret Schwarzdorn', '1696', '', 'Haus Teyrngarch'),
    spouse('arfon-teyrngarch', 'Arfon Teyrngarch', 'male', '1697', '', 'house-teyrngarch'),
    person('modolf-schwarzdorn', 'Modolf Schwarzdorn', 'male', '1697', ''),
    spouse('hervera', 'Hervera', 'female', '1701', ''),
    person('thrand-schwarzdorn', 'Thrand Schwarzdorn', 'male', '1695', ''),
    spouse('hallgerd', 'Hallgerd', 'female', '1698', ''),
    person('torvard-schwarzdorn', 'Torvard Schwarzdorn', 'male', '1700', ''),
    spouse('vilborg-sturmgeborene', 'Vilborg Sturmgeborene', 'female', '1702', '', 'house-sturmgeborene'),

    person('tormund-1713-schwarzdorn', 'Tormund Schwarzdorn', 'male', '1713', '', { title: 'Hesir des Clans Schwarzdorn seit 1721' }),
    person('honmund-schwarzdorn', 'Honmund Schwarzdorn', 'male', '1718', '', { title: 'Erster Erbe des Clans Schwarzdorn' }),
    person('sigmir-schwarzdorn', 'Sigmir Schwarzdorn', 'male', '1715', ''),
    person('hermir-schwarzdorn', 'Hermir Schwarzdorn', 'male', '1719', ''),
    person('hermina-schwarzdorn', 'Hermina Schwarzdorn', 'female', '1721', ''),
    person('grimkell-schwarzdorn', 'Grimkell Schwarzdorn', 'male', '1719', ''),
    person('grimvard-schwarzdorn', 'Grimvard Schwarzdorn', 'male', '1722', ''),
    person('finnbogi-schwarzdorn', 'Finnbogi Schwarzdorn', 'male', '1722', ''),
    person('frida-schwarzdorn', 'Frida Schwarzdorn', 'female', '1723', ''),
    person('skeggi-schwarzdorn', 'Skeggi Schwarzdorn', 'male', '1720', ''),
    person('signy-schwarzdorn', 'Signy Schwarzdorn', 'female', '1724', ''),
    person('thiodolf-schwarzdorn', 'Thiodolf Schwarzdorn', 'male', '1723', ''),
    person('tova-schwarzdorn', 'Tova Schwarzdorn', 'female', '1725', '')
  ],
  partnerships: [
    endedMarriage('marriage-geirmundr-svanlaug-schwarzdorn'),
    endedMarriage('marriage-inigmund-hallbera-schwarzdorn', '1624'),
    endedMarriage('marriage-sigmund-ermingard-schwarzdorn', '1622'),
    endedMarriage('marriage-iormund-ranveig-schwarzdorn', '1661'),
    endedMarriage('marriage-hjalti-ormhild-schwarzdorn', '1633'),
    endedMarriage('marriage-thorben-malfrid-schwarzdorn', '1632'),
    endedMarriage('marriage-vormund-thorhild-schwarzdorn', '1689'),
    endedMarriage('marriage-alrek-vorga-schwarzdorn', '1674'),
    alignPartnerOverChildren(marriage('affair-thorir-dagny-schwarzdorn', {
      type: 'affair',
      status: 'ended',
      end: '1654',
      visibility: 'private',
      notes: 'Aus dieser Affäre stammt ausschließlich Hertha.'
    }), 'dagny'),
    alignPartnerOverChildren(endedMarriage('marriage-thorir-thurid-schwarzdorn', '1683'), 'thurid-skjegg'),
    endedMarriage('marriage-tormund-yrsa-schwarzdorn', '1709'),
    endedMarriage('marriage-seamus-maeve-schwarzdorn', '1707'),
    endedMarriage('marriage-svenja-vignar-freiwinter', '1703'),
    endedMarriage('marriage-torger-vedis-schwarzdorn', '1691'),
    endedMarriage('marriage-jormund-eldridd-schwarzdorn', '1720'),
    endedMarriage('marriage-gormund-gwelda-schwarzdorn', '1720'),
    endedMarriage('marriage-mormond-asgerd-schwarzdorn', '1720'),
    endedMarriage('marriage-torygg-ingrid-varulv', '1720'),
    marriage('marriage-vigmar-frigga-schwarzdorn'),
    marriage('marriage-tjudmund-egberta-schwarzdorn'),
    endedMarriage('marriage-mathon-borghild-schwarzdorn', '1720'),
    marriage('marriage-jarell-maven-schwarzdorn'),
    endedMarriage('marriage-angreboda-miermir-freiwinter', '1720'),
    marriage('marriage-brunwulf-maeva-freiwinter'),
    marriage('marriage-hoskuld-hildigunn-schwarzdorn'),
    marriage('marriage-arfon-annegret-teyrngarch'),
    marriage('marriage-modolf-hervera-schwarzdorn'),
    marriage('marriage-thrand-hallgerd-schwarzdorn'),
    marriage('marriage-torvard-vilborg-schwarzdorn')
  ],
  parentages: [
    ...claimedChildren(['inigmund-schwarzdorn', 'sigmund-schwarzdorn'], 'marriage-geirmundr-svanlaug-schwarzdorn'),
    ...childrenOf(['iormund-schwarzdorn', 'ormhild-schwarzdorn'], 'marriage-inigmund-hallbera-schwarzdorn'),
    ...childrenOf(['thorben-schwarzdorn'], 'marriage-sigmund-ermingard-schwarzdorn'),
    ...childrenOf(['vormund-schwarzdorn', 'vorga-schwarzdorn'], 'marriage-iormund-ranveig-schwarzdorn'),
    ...childrenOf(['thorir-schwarzdorn'], 'marriage-thorben-malfrid-schwarzdorn'),
    ...childrenOf(['tormund-1643-schwarzdorn', 'maeve-schwarzdorn', 'vignar-schwarzdorn'], 'marriage-vormund-thorhild-schwarzdorn'),
    ...childrenOf(['hertha-schwarzdorn'], 'affair-thorir-dagny-schwarzdorn', {
      legitimacy: 'illegitimate',
      notes: 'Hertha ist ausschließlich das Kind aus Thorirs Affäre mit Dagny.'
    }),
    ...childrenOf(['torger-schwarzdorn'], 'marriage-thorir-thurid-schwarzdorn'),
    ...childrenOf(['jormund-schwarzdorn', 'gormund-schwarzdorn', 'mormond-schwarzdorn'], 'marriage-tormund-yrsa-schwarzdorn'),
    ...childrenOf(['vigmar-schwarzdorn', 'ingrid-schwarzdorn'], 'marriage-svenja-vignar-freiwinter'),
    ...childrenOf(['tjudmund-schwarzdorn'], 'marriage-torger-vedis-schwarzdorn'),
    ...childrenOf(['mathon-schwarzdorn', 'maven-schwarzdorn', 'miermir-schwarzdorn', 'maeva-schwarzdorn'], 'marriage-jormund-eldridd-schwarzdorn'),
    ...childrenOf(['hoskuld-schwarzdorn'], 'marriage-gormund-gwelda-schwarzdorn'),
    ...childrenOf(['annegret-schwarzdorn', 'modolf-schwarzdorn'], 'marriage-mormond-asgerd-schwarzdorn'),
    ...childrenOf(['thrand-schwarzdorn'], 'marriage-vigmar-frigga-schwarzdorn'),
    ...childrenOf(['torvard-schwarzdorn'], 'marriage-tjudmund-egberta-schwarzdorn'),
    ...childrenOf(['tormund-1713-schwarzdorn', 'honmund-schwarzdorn'], 'marriage-mathon-borghild-schwarzdorn', {
      notes: 'Die Kinderüberschrift der Quelle nennt „Lydia“, obwohl die unmittelbar vorangehende Ehezeile ausschließlich Borghild Skjegg als Mathons Frau ausweist.'
    }),
    ...childrenOf(['sigmir-schwarzdorn', 'hermir-schwarzdorn', 'hermina-schwarzdorn'], 'marriage-angreboda-miermir-freiwinter'),
    ...childrenOf(['grimkell-schwarzdorn', 'grimvard-schwarzdorn'], 'marriage-hoskuld-hildigunn-schwarzdorn'),
    ...childrenOf(['finnbogi-schwarzdorn', 'frida-schwarzdorn'], 'marriage-modolf-hervera-schwarzdorn'),
    ...childrenOf(['skeggi-schwarzdorn', 'signy-schwarzdorn'], 'marriage-thrand-hallgerd-schwarzdorn'),
    ...childrenOf(['thiodolf-schwarzdorn', 'tova-schwarzdorn'], 'marriage-torvard-vilborg-schwarzdorn')
  ],
  cadetBranches: [
    marriedAway('married-away-ormhild-schwarzdorn-varangr', 'Clan Varangr', 'marriage-hjalti-ormhild-schwarzdorn', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-vorga-schwarzdorn-kampfgeborene', 'Clan Kampfgeborene', 'marriage-alrek-vorga-schwarzdorn', 'house-kampfgeborene', 'haus-kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    marriedAway('married-away-maeve-schwarzdorn-haeghra', 'Clan Haeghra', 'marriage-seamus-maeve-schwarzdorn', 'house-haeghra', 'haus-haeghra'),
    marriedAway('married-away-ingrid-schwarzdorn-varulv', 'Clan Varulv', 'marriage-torygg-ingrid-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-maven-schwarzdorn-hyrmgardr', 'Clan Hyrmgaðr', 'marriage-jarell-maven-schwarzdorn', 'house-hyrmgardr', 'haus-hyrmgardr'),
    marriedAway('married-away-maeva-schwarzdorn-freiwinter', 'Clan Freiwinter', 'marriage-brunwulf-maeva-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-annegret-schwarzdorn-teyrngarch', 'Haus Teyrngarch', 'marriage-arfon-annegret-teyrngarch', 'house-teyrngarch', 'haus-teyrngarch')
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-geirmundr-svanlaug-schwarzdorn',
      parentPersonId: '',
      childIds: ['inigmund-schwarzdorn', 'sigmund-schwarzdorn'],
      years: 0,
      fromYear: '????',
      toYear: '1570',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner: Der Zeitsprung folgt nach dem Hauswappen und steht niemals parallel zu einer anderen Fortsetzung.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-geirmundr-svanlaug-schwarzdorn',
    houseId: SCHWARZDORN_HOUSE_ID,
    crestSubtitle: 'Hesire-Clan von Rorikshall · Vasallen der Varulv',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'geirmundr-schwarzdorn',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: 'Clan Schwarzdorn (bereitgestellte Altdaten)',
    sourceNote: 'Die vollständige Schwarzdorn-Genealogie folgt der bereitgestellten Hausseite. Der Hausknoten und ein serieller Zeitsprung stehen zwischen Geirmundr/Svanlaug und Inigmund/Sigmund. Thorir wird für Affäre und Ehe nicht gedoppelt; Dagny und Thurid stehen jeweils über ihrem eigenen Kind. Mathons Ehezeile nennt Borghild, während die Kinderzeile einmalig den nicht weiter belegten Namen Lydia verwendet; ohne eigenen Personeneintrag wird keine zweite Frau erfunden. Kinder wegverheirateter Schwarzdorn-Frauen werden in der Zielakte geführt und nicht im Ursprungshaus gedoppelt. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
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
