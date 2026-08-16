import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import { HOUSE_GRENDEL_PORTRAITS } from './house-grendel-portraits.js';
import {
  IVARSHEIM_HOUSE_EMBLEMS,
  IVARSHEIM_HOUSE_PROFILES
} from './ivarsheim-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';

const GRENDEL_HOUSE_ID = 'house-grendel';
const FOUNDER_TIME_JUMP_ID = 'gap-leif-to-eirikr-grendel';

const HOUSE_EMBLEMS = Object.freeze({
  grendel: IVARSHEIM_HOUSE_EMBLEMS.grendel,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  windhueter: IVARSHEIM_HOUSE_EMBLEMS.windhueter,
  blutklinge: IVARSHEIM_HOUSE_EMBLEMS.blutklinge,
  silberzunge: IVARSHEIM_HOUSE_EMBLEMS.silberzunge,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  trachwyll: IVARSHEIM_HOUSE_EMBLEMS.trachwyll,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter
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
  'leif-grendel',
  'eirikr-grendel',
  'gunnar-grendel',
  'bagsecg-grendel',
  'finnr-grindel',
  'thorfinn-grendel',
  'hagar-grendel',
  'kolbein-grendel',
  'thorvald-grendel'
]);

const MAINLINE_IDS = new Set([
  'erik-grendel',
  'leif-1719-grendel',
  'bjarni-grendel'
]);

const SHARED_WORLD_PERSON_IDS = Object.freeze({
  'hljotrun-wargh': 'person--haus-wargh--hljotrun-wargh',
  'austveig-sterkr': 'person--haus-sterkr--austveig-sterkr',
  'gunnvar-silberzunge': 'person--haus-silberzunge--gunnvar-silberzunge',
  'skadi-skogg': 'person--haus-skogg--skadi-skogg',
  'solveig-wargh': 'person--haus-wargh--solveig-wargh',
  'tormund-1643-schwarzdorn': 'person--haus-schwarzdorn--tormund-1643-schwarzdorn',
  'hjalmar-freiwinter': 'person--haus-freiwinter--hjalmar-freiwinter',
  'fenya-feuerhaar': 'person--haus-feuerhaar--fenya-feuerhaar',
  'starkad-skogg': 'person--haus-skogg--starkad-skogg',
  'gwilym-trachwyll': 'person--haus-trachwyll--gwilym-trachwyll'
});

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function worldPersonIdFor(id, houseId) {
  if (SHARED_WORLD_PERSON_IDS[id]) return SHARED_WORLD_PERSON_IDS[id];
  if (!houseId || houseId === GRENDEL_HOUSE_ID) return `person--haus-grendel--${id}`;
  return `person--${houseId.replace(/^house-/, 'haus-')}--${id}`;
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? GRENDEL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || worldPersonIdFor(id, houseId),
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_GRENDEL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GRENDEL_HOUSE_ID ? 'core' : 'married'),
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

function sentWard(id, name, sex, birth, targetHouseName, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    familyRole: 'ward-away',
    lineageRole: 'branch',
    title: options.title || `Als Mündel an ${targetHouseName} vermittelt`,
    tags: [...(options.tags || []), 'Mündel', 'Fortgegeben']
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
  founders: ['leif-grendel', 'ljotunn-grendel-spouse'],
  eirikr: ['eirikr-grendel', 'gudrun-grendel-spouse'],
  halldis: ['halldis-grendel', 'thorgrimm-windhueter'],
  gunnar: ['hljotrun-wargh', 'gunnar-grendel'],
  hlokk: ['hlokk-grendel', 'thorfid-blutklinge'],
  finnr: ['finnr-grindel', 'austveig-sterkr'],
  bagsecg: ['bagsecg-grendel', 'sigrun-grendel-spouse'],
  vidar: ['vidar-grendel', 'gwen-drewi'],
  thordis: ['gunnvar-silberzunge', 'thordis-grendel'],
  thorfinn: ['skadi-skogg', 'thorfinn-grendel'],
  estrid: ['estrid-grendel', 'grimleik-gullvig'],
  asgeir: ['asgeir-grendel', 'helga-grendel-spouse'],
  kolbein: ['solveig-wargh', 'kolbein-grendel'],
  yrsa: ['tormund-1643-schwarzdorn', 'yrsa-grindel'],
  hagar: ['hagar-grendel', 'hati-grendel-spouse'],
  astrid: ['astrid-grendel', 'thorbrand-sturmgeborener'],
  bjoern: ['bjoern-grendel', 'baldkatla-grendel-spouse'],
  thorvald: ['thorvald-grendel', 'vigdis-grendel-spouse'],
  gwelda: ['hjalmar-freiwinter', 'gwelda-grindel'],
  nott: ['nott-grendel', 'njord-frostauge'],
  hakon: ['hakon-grendel', 'troll-grendel-spouse'],
  erik: ['erik-grendel', 'fenya-feuerhaar'],
  sigrid: ['starkad-skogg', 'sigrid-grendel'],
  thord: ['thord-grendel', 'embla-grendel-spouse'],
  ingolf: ['ingolf-grendel', 'vallgerd-grendel-spouse'],
  ingrid: ['gwilym-trachwyll', 'ingrid-grendel']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-leif-ljotunn-grendel': COUPLES.founders,
  'marriage-eirikr-gudrun-grendel': COUPLES.eirikr,
  'marriage-halldis-thorgrimm-grendel': COUPLES.halldis,
  'marriage-hljotrun-gunnar-wargh': COUPLES.gunnar,
  'marriage-hlokk-thorfid-grendel': COUPLES.hlokk,
  'marriage-austveig-finnr-sterkr': COUPLES.finnr,
  'marriage-bagsecg-sigrun-grendel': COUPLES.bagsecg,
  'marriage-vidar-gwen-grendel': COUPLES.vidar,
  'marriage-gunnvar-thordis-silberzunge': COUPLES.thordis,
  'marriage-skadi-thorfinn-skogg': COUPLES.thorfinn,
  'marriage-estrid-grimleik-grendel': COUPLES.estrid,
  'marriage-asgeir-helga-grendel': COUPLES.asgeir,
  'marriage-solveig-kolbein-wargh': COUPLES.kolbein,
  'marriage-tormund-yrsa-schwarzdorn': COUPLES.yrsa,
  'marriage-hagar-hati-grendel': COUPLES.hagar,
  'marriage-astrid-thorbrand-grendel': COUPLES.astrid,
  'marriage-bjoern-baldkatla-grendel': COUPLES.bjoern,
  'marriage-thorvald-vigdis-grendel': COUPLES.thorvald,
  'marriage-hjalmar-gwelda-freiwinter': COUPLES.gwelda,
  'marriage-nott-njord-grendel': COUPLES.nott,
  'marriage-hakon-troll-grendel': COUPLES.hakon,
  'marriage-fenya-erik-feuerhaar': COUPLES.erik,
  'marriage-starkad-sigrid-skogg': COUPLES.sigrid,
  'marriage-thord-embla-grendel': COUPLES.thord,
  'marriage-ingolf-vallgerd-grendel': COUPLES.ingolf,
  'marriage-gwilym-ingrid-trachwyll': COUPLES.ingrid
});

function marriage(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function endedMarriage(partnershipId, end = '') {
  return marriage(partnershipId, { status: 'ended', end });
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'grendel-parentage',
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

function wardAway(id, name, parentPersonId, houseId, targetFamilyId, emblem = '', subtitle = '') {
  return createWardAwayBranch({
    id,
    name,
    parentPersonId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: subtitle || `Als Mündel an ${name} vermittelt`,
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

export const HOUSE_GRENDEL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-grendel',
    title: 'Clan Grendel',
    motto: '',
    description: 'Alter Hesirenclan von Hjerimsheim in Klippenschlag. Die Grendel dienen den Wargh als Seefahrer, Küstenwächter und Verteidiger der westlichen Grenzen Ivarsheims.',
    emblem: HOUSE_EMBLEMS.grendel,
    houseProfile: IVARSHEIM_HOUSE_PROFILES.grendel
  },
  houses: [
    house(GRENDEL_HOUSE_ID, 'Clan Grendel', HOUSE_EMBLEMS.grendel),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-windhueter', 'Haus Windhüter', HOUSE_EMBLEMS.windhueter),
    house('house-blutklinge', 'Haus Blutklinge', HOUSE_EMBLEMS.blutklinge),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-silberzunge', 'Clan Silberzunge', HOUSE_EMBLEMS.silberzunge),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg),
    house('house-drewi', 'Haus Drewi'),
    house('house-gullvig', 'Clan Gullvig'),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-sturmgeborener', 'Clan Sturmgeborener'),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-frostauge', 'Clan Frostauge'),
    house('house-feuerhaar', 'Clan Feuerhaar', IVARSHEIM_HOUSE_EMBLEMS.feuerhaar),
    house('house-trachwyll', 'Haus Trachwyll', HOUSE_EMBLEMS.trachwyll),
    house('house-unbekannter-kuestenclan', 'Unbekannter Küstenclan')
  ],
  persons: [
    person('leif-grendel', 'Leif Grendel', 'male', '????', '????', {
      title: 'Gründer und erster Hesir des Clans Grendel'
    }),
    spouse('ljotunn-grendel-spouse', 'Ljotunn', 'female', '????', '????', '', {
      title: 'Mitgründerin des Clans Grendel'
    }),

    person('eirikr-grendel', 'Eiríkr Grendel', 'male', '1561', '1623', {
      title: 'Hesir des Clans Grendel'
    }),
    awayWoman('halldis-grendel', 'Halldís Grendel', '1574', '1627', 'Haus Windhüter'),
    spouse('gudrun-grendel-spouse', 'Gudrun', 'female', '1566', '1620'),
    spouse('thorgrimm-windhueter', 'Thorgrimm Windhüter', 'male', '1573', '1627', 'house-windhueter'),

    person('gunnar-grendel', 'Gunnar Grendel', 'male', '1585', '1625', {
      title: 'Hesir des Clans Grendel von 1623 bis 1625'
    }),
    awayWoman('hlokk-grendel', 'Hlökk Grendel', '1590', '1627', 'Haus Blutklinge'),
    person('finnr-grindel', 'Finnr Grendel', 'male', '1610', '1671', {
      title: 'Hesir des Clans Grendel von 1627 bis 1671'
    }),
    person('halvard-grendel', 'Halvard Grendel', 'male', '1613', '1627'),
    person('bagsecg-grendel', 'Bagsecg Grendel', 'male', '1603', '1627', {
      title: 'Hesir des Clans Grendel von 1625 bis 1627'
    }),
    spouse('hljotrun-wargh', 'Hljótrún Wargh', 'female', '1589', '1641', 'house-wargh'),
    spouse('thorfid-blutklinge', 'Thorfid Blutklinge', 'male', '1589', '1627', 'house-blutklinge'),
    spouse('austveig-sterkr', 'Austveig Sterkr', 'female', '1616', '1711', 'house-sterkr'),
    spouse('sigrun-grendel-spouse', 'Sigrún', 'female', '1607', '1644'),

    person('vidar-grendel', 'Vidar Grendel', 'male', '1618', '1670'),
    awayWoman('thordis-grendel', 'Thordis Grendel', '1630', '1700', 'Clan Silberzunge', {
      notes: 'Die Quelle setzt ihre Geburt fünf Jahre nach dem Tod ihres Vaters Gunnar an; der Widerspruch bleibt unverändert dokumentiert.'
    }),
    person('thorfinn-grendel', 'Thorfinn Grendel', 'male', '1634', '1679', {
      title: 'Hesir des Clans Grendel von 1671 bis 1679'
    }),
    awayWoman('estrid-grendel', 'Estrid Grendel', '1636', '1701', 'Clan Gullvig'),
    person('asgeir-grendel', 'Asgeir Grendel', 'male', '1628', '1682', {
      notes: 'Die Quelle setzt seine Geburt ein Jahr nach dem Tod seines Vaters Bagsecg an; der Widerspruch bleibt unverändert dokumentiert.'
    }),
    spouse('gwen-drewi', 'Gwen Drewi O’Dryffyn', 'female', '1623', '1694', 'house-drewi'),
    spouse('gunnvar-silberzunge', 'Gunnvar Silberzunge', 'male', '1625', '1689', 'house-silberzunge'),
    spouse('skadi-skogg', 'Skadi Skogg', 'female', '1633', '1698', 'house-skogg'),
    spouse('grimleik-gullvig', 'Grimleik Gullvig', 'male', '1631', '1696', 'house-gullvig'),
    spouse('helga-grendel-spouse', 'Helga', 'female', '1632', '1677'),

    person('kolbein-grendel', 'Kolbein Grendel', 'male', '1649', '1725', {
      title: 'Hesir des Clans Grendel von 1693 bis 1725'
    }),
    awayWoman('yrsa-grindel', 'Yrsa Grendel', '1645', '1711', 'Clan Schwarzdorn'),
    person('hagar-grendel', 'Hägar Grendel', 'male', '1651', '1693', {
      title: 'Hesir des Clans Grendel von 1679 bis 1693'
    }),
    awayWoman('astrid-grendel', 'Astrid Grendel', '1653', '1704', 'Clan Sturmgeborener'),
    person('bjoern-grendel', 'Bjoern Grendel', 'male', '1650', '1711'),
    spouse('solveig-wargh', 'Solveig Wargh', 'female', '1650', '1719', 'house-wargh'),
    spouse('tormund-1643-schwarzdorn', 'Tormund Schwarzdorn', 'male', '1643', '1709', 'house-schwarzdorn'),
    spouse('hati-grendel-spouse', 'Hati', 'female', '1652', '1711'),
    spouse('thorbrand-sturmgeborener', 'Thorbrand Sturmgeborener', 'male', '1650', '1720', 'house-sturmgeborener'),
    spouse('baldkatla-grendel-spouse', 'Baldkatla', 'female', '1653', '1711'),

    person('thorvald-grendel', 'Thorvald Grendel', 'male', '1671', '', {
      title: 'Hesir des Clans Grendel seit 1725'
    }),
    awayWoman('gwelda-grindel', 'Gwelda Grendel', '1674', '', 'Clan Freiwinter'),
    person('karli-grendel', 'Kárli Grendel', 'male', '1671', '1679'),
    awayWoman('nott-grendel', 'Nótt Grendel', '1669', '', 'Clan Frostauge'),
    person('hakon-grendel', 'Hákon Grendel', 'male', '1671', '1740'),
    spouse('vigdis-grendel-spouse', 'Vigdis', 'female', '1676', ''),
    spouse('hjalmar-freiwinter', 'Hjalmar Freiwinter', 'male', '1673', '1720', 'house-freiwinter'),
    spouse('njord-frostauge', 'Njörd Frostauge', 'male', '1664', '', 'house-frostauge'),
    spouse('troll-grendel-spouse', 'Tröll', 'female', '1675', '1740'),

    person('erik-grendel', 'Erik Grendel', 'male', '1696', '', {
      title: 'Erster Erbe des Clans Grendel'
    }),
    awayWoman('sigrid-grendel', 'Sigrid Grendel', '1699', '', 'Clan Skogg'),
    person('thord-grendel', 'Thord Grendel', 'male', '1704', ''),
    person('ingolf-grendel', 'Ingolf Grendel', 'male', '1697', '1740'),
    awayWoman('ingrid-grendel', 'Ingrid Grendel', '1701', '', 'Haus Trachwyll'),
    spouse('fenya-feuerhaar', 'Fenya Feuerhaar', 'female', '1701', '', 'house-feuerhaar'),
    spouse('starkad-skogg', 'Starkad Skogg', 'male', '1695', '', 'house-skogg'),
    spouse('embla-grendel-spouse', 'Embla', 'female', '1708', ''),
    spouse('vallgerd-grendel-spouse', 'Vallgerd', 'female', '1704', ''),
    spouse('gwilym-trachwyll', 'Gwilym Trachwyll', 'male', '1700', '', 'house-trachwyll'),

    person('leif-1719-grendel', 'Leif Grendel', 'male', '1719', '', {
      title: 'Zweiter Erbe des Clans Grendel'
    }),
    person('gudrid-grendel', 'Gudrid Grendel', 'female', '1722', ''),
    sentWard('bjarni-grendel', 'Bjarni Grendel', 'male', '1726', 'einen unbekannten Küstenclan', {
      title: 'Dritter Erbe · als Mündel an einen unbekannten Küstenclan vermittelt',
      notes: 'Die Stammbaumgrafik zeigt den Mündelrahmen und ein Meerfrauenwappen, nennt den Zielclan aber nicht.'
    }),
    sentWard('isdis-grendel', 'Ísdís Grendel', 'female', '1731', 'Clan Sturmgeborener', {
      notes: 'Der Zielclan wird aus dem identischen Sturmgeborenen-Wappen bei Astrids Ehe erschlossen.'
    }),
    person('olaf-grendel', 'Olaf Grendel', 'male', '1726', ''),
    person('katlin-grendel', 'Katlin Grendel', 'female', '1729', ''),
    person('sten-grendel', 'Sten Grendel', 'male', '1722', ''),
    person('kara-grendel', 'Kára Grendel', 'female', '1724', '')
  ],
  partnerships: [
    endedMarriage('marriage-leif-ljotunn-grendel'),
    endedMarriage('marriage-eirikr-gudrun-grendel', '1620'),
    endedMarriage('marriage-halldis-thorgrimm-grendel', '1627'),
    endedMarriage('marriage-hljotrun-gunnar-wargh', '1625'),
    endedMarriage('marriage-hlokk-thorfid-grendel', '1627'),
    endedMarriage('marriage-austveig-finnr-sterkr', '1671'),
    endedMarriage('marriage-bagsecg-sigrun-grendel', '1627'),
    endedMarriage('marriage-vidar-gwen-grendel', '1670'),
    endedMarriage('marriage-gunnvar-thordis-silberzunge', '1689'),
    endedMarriage('marriage-skadi-thorfinn-skogg', '1679'),
    endedMarriage('marriage-estrid-grimleik-grendel', '1696'),
    endedMarriage('marriage-asgeir-helga-grendel', '1677'),
    endedMarriage('marriage-solveig-kolbein-wargh', '1719'),
    endedMarriage('marriage-tormund-yrsa-schwarzdorn', '1709'),
    endedMarriage('marriage-hagar-hati-grendel', '1693'),
    endedMarriage('marriage-astrid-thorbrand-grendel', '1704'),
    endedMarriage('marriage-bjoern-baldkatla-grendel', '1711'),
    marriage('marriage-thorvald-vigdis-grendel'),
    endedMarriage('marriage-hjalmar-gwelda-freiwinter', '1720'),
    marriage('marriage-nott-njord-grendel'),
    endedMarriage('marriage-hakon-troll-grendel', '1740'),
    marriage('marriage-fenya-erik-feuerhaar'),
    marriage('marriage-starkad-sigrid-skogg'),
    marriage('marriage-thord-embla-grendel'),
    endedMarriage('marriage-ingolf-vallgerd-grendel', '1740'),
    marriage('marriage-gwilym-ingrid-trachwyll')
  ],
  parentages: [
    ...childrenOf(['eirikr-grendel', 'halldis-grendel'], 'marriage-leif-ljotunn-grendel', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Eiríkr und Halldís.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(
      ['gunnar-grendel', 'hlokk-grendel', 'finnr-grindel', 'halvard-grendel', 'bagsecg-grendel'],
      'marriage-eirikr-gudrun-grendel'
    ),
    ...childrenOf(['vidar-grendel', 'thordis-grendel'], 'marriage-hljotrun-gunnar-wargh'),
    ...childrenOf(['thorfinn-grendel', 'estrid-grendel'], 'marriage-austveig-finnr-sterkr'),
    ...childrenOf(['asgeir-grendel'], 'marriage-bagsecg-sigrun-grendel'),
    ...childrenOf(['kolbein-grendel', 'yrsa-grindel'], 'marriage-vidar-gwen-grendel'),
    ...childrenOf(['hagar-grendel', 'astrid-grendel'], 'marriage-skadi-thorfinn-skogg'),
    ...childrenOf(['bjoern-grendel'], 'marriage-asgeir-helga-grendel'),
    ...childrenOf(['thorvald-grendel', 'gwelda-grindel'], 'marriage-solveig-kolbein-wargh'),
    ...childrenOf(['karli-grendel', 'nott-grendel'], 'marriage-hagar-hati-grendel'),
    ...childrenOf(['hakon-grendel'], 'marriage-bjoern-baldkatla-grendel'),
    ...childrenOf(['erik-grendel', 'sigrid-grendel', 'thord-grendel'], 'marriage-thorvald-vigdis-grendel'),
    ...childrenOf(['ingolf-grendel', 'ingrid-grendel'], 'marriage-hakon-troll-grendel'),
    ...childrenOf(
      ['leif-1719-grendel', 'gudrid-grendel', 'bjarni-grendel', 'isdis-grendel'],
      'marriage-fenya-erik-feuerhaar'
    ),
    ...childrenOf(['olaf-grendel', 'katlin-grendel'], 'marriage-thord-embla-grendel'),
    ...childrenOf(['sten-grendel', 'kara-grendel'], 'marriage-ingolf-vallgerd-grendel')
  ],
  cadetBranches: [
    marriedAway('married-away-halldis-grendel-windhueter', 'Haus Windhüter', 'marriage-halldis-thorgrimm-grendel', 'house-windhueter', 'haus-windhueter', HOUSE_EMBLEMS.windhueter),
    marriedAway('married-away-hlokk-grendel-blutklinge', 'Haus Blutklinge', 'marriage-hlokk-thorfid-grendel', 'house-blutklinge', 'haus-blutklinge', HOUSE_EMBLEMS.blutklinge),
    marriedAway('married-away-thordis-grendel-silberzunge', 'Clan Silberzunge', 'marriage-gunnvar-thordis-silberzunge', 'house-silberzunge', 'haus-silberzunge', HOUSE_EMBLEMS.silberzunge),
    marriedAway('married-away-estrid-grendel-gullvig', 'Clan Gullvig', 'marriage-estrid-grimleik-grendel', 'house-gullvig', 'haus-gullvig'),
    marriedAway('married-away-yrsa-grendel-schwarzdorn', 'Clan Schwarzdorn', 'marriage-tormund-yrsa-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-astrid-grendel-sturmgeborener', 'Clan Sturmgeborener', 'marriage-astrid-thorbrand-grendel', 'house-sturmgeborener', 'haus-sturmgeborener'),
    marriedAway('married-away-gwelda-grendel-freiwinter', 'Clan Freiwinter', 'marriage-hjalmar-gwelda-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-nott-grendel-frostauge', 'Clan Frostauge', 'marriage-nott-njord-grendel', 'house-frostauge', 'haus-frostauge'),
    marriedAway('married-away-sigrid-grendel-skogg', 'Clan Skogg', 'marriage-starkad-sigrid-skogg', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg),
    marriedAway('married-away-ingrid-grendel-trachwyll', 'Haus Trachwyll', 'marriage-gwilym-ingrid-trachwyll', 'house-trachwyll', 'haus-trachwyll', HOUSE_EMBLEMS.trachwyll),
    wardAway(
      'ward-away-bjarni-grendel-kuestenclan',
      'Unbekannter Küstenclan',
      'bjarni-grendel',
      'house-unbekannter-kuestenclan',
      'haus-unbekannter-kuestenclan',
      '',
      'Als Mündel an einen unbekannten Küstenclan mit Meerfrauenwappen vermittelt'
    ),
    wardAway('ward-away-isdis-grendel-sturmgeborener', 'Clan Sturmgeborener', 'isdis-grendel', 'house-sturmgeborener', 'haus-sturmgeborener')
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-leif-ljotunn-grendel',
      parentPersonId: '',
      childIds: ['eirikr-grendel', 'halldis-grendel'],
      years: 0,
      fromYear: '????',
      toYear: '1561',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner direkt unter dem Hauswappen.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-leif-ljotunn-grendel',
    houseId: GRENDEL_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Hjerimsheim · Vasallen des Clans Wargh',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'leif-grendel',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: 'Clan Grendel (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Quellenstammbaum wurde ohne Personenfokus vom Gründerpaar Leif und Ljotunn bis zur Generation von 1740 übernommen. Das Clanwappen und genau ein Zeitsprung liegen strikt seriell zwischen dem Gründerpaar und Eiríkr beziehungsweise Halldís. Die alte Schreibweise Grindel wird entsprechend der Registerregel als Grendel normalisiert; stabile Gegenakten-IDs mit „grindel“ bleiben aus Kompatibilitätsgründen unverändert. Hlökk folgt der eindeutigen Stammbaumgrafik statt der fehlerhaften Tabellenform Hlölkk. Der alte Quellkasten nennt Horunn als Sitz, während die verbindliche Ivarsheim-Gliederung Clan Grendel unter Klippenschlag/Hjerimsheim führt; Hjerimsheim bleibt maßgeblich. Thordis wird 1630 geboren, obwohl ihr Vater Gunnar laut derselben Quelle 1625 stirbt; Asgeir wird 1628 geboren, obwohl Bagsecg 1627 stirbt. Beide Chronologiefehler bleiben sichtbar dokumentiert und wurden nicht spekulativ umdatiert. Bjarni und Ísdís tragen in der Stammbaumgrafik eindeutig den hellblauen Mündelrahmen. Ísdís’ Zielwappen entspricht dem bei Thorbrand gezeigten Clan Sturmgeborener. Bjarnis Meerfrauenwappen ist keinem benannten Clan der Quelle zugeordnet und wird daher ausdrücklich als unbekannter Küstenclan geführt. Die namenlosen Verlobtenfelder der Tabelle werden nicht als reale Beziehungen angelegt. Verheiratete Grendel-Frauen erhalten direkte Wegverheiratet-Knoten; Kinder ihrer auswärtigen Ehen verbleiben ausschließlich in den fortführenden Gegenakten. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    registryTombstones: {
      persons: ['haus-grendel-gruender', 'haus-grendel-gruenderin'],
      partnerships: ['marriage-haus-grendel-founders']
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
    registryManagedLineageFields: ['founderPartnershipId'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
