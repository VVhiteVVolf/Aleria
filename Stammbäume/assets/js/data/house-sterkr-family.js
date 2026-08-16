import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_STERKR_PORTRAITS } from './house-sterkr-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const STERKR_HOUSE_ID = 'house-sterkr';
const FOUNDER_TIME_JUMP_ID = 'gap-aegir-ragnfred-sterkr';
const RAGNFRED_TIME_JUMP_ID = 'gap-ragnfred-ubbe-sterkr';

const HOUSE_EMBLEMS = Object.freeze({
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  ceirwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn
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
  'aegir-sterkr-founder',
  'ragnfred-sterkr',
  'ubbe-sterkr',
  'einarr-1614-sterkr',
  'skjalg-sterkr',
  'heremod-sterkr',
  'einarr-sterkr'
]);

const MAINLINE_IDS = new Set([
  'rognvaldr-sterkr',
  'armod-sterkr',
  'thengil-sterkr'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? STERKR_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_STERKR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === STERKR_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['aegir-sterkr-founder', 'var-skald'],
  ragnfred: ['isbjorg-brathfengr', 'ragnfred-sterkr'],
  sunniva: ['gorsedd-ceirwyn', 'sunniva-sterkr'],
  mistkatla: ['ragnor-skald', 'mistkatla-sterkr'],
  ubbe: ['ubbe-sterkr', 'rannveig-gulvig'],
  einarr1614: ['einarr-1614-sterkr', 'muirne-urquhart'],
  austveig: ['austveig-sterkr', 'finnr-grindel'],
  skjalg: ['skjalg-sterkr', 'geirny-feuerhaar'],
  skadi: ['skadi-sterkr', 'langarr-soekeren'],
  hafstein: ['hafstein-sterkr', 'fiona-tordarroch'],
  heremod: ['heremod-sterkr', 'holmdis-kummerherz'],
  gwelda: ['thrand-skaal', 'gwelda-sterkr'],
  vedis: ['torger-schwarzdorn', 'vedis-sterkr'],
  vidkunn: ['vidkunn-sterkr', 'oddleif'],
  einarr1674: ['erla-varulv', 'einarr-sterkr'],
  astrid: ['morgan-ceirwyn', 'astrid-sterkr'],
  hrosskell: ['hrosskell-sterkr', 'hallgard-soekering'],
  ljotunn: ['ljotunn-sterkr', 'helmskald-graumahne'],
  rognvaldr: ['isbjalla-1696-brathfengr', 'rognvaldr-sterkr'],
  revna: ['erling-freiwinter', 'revna-sterkr'],
  linnea: ['linnea-sterkr', 'galmar-skald'],
  stun: ['stun-sterkr', 'margarethe-ridderspore']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-aegir-var-sterkr': COUPLES.founders,
  'marriage-isbjorg-ragnfred-brathfengr': COUPLES.ragnfred,
  'marriage-gorsedd-sunniva-ceirwyn': COUPLES.sunniva,
  'marriage-ragnor-mistkatla-sterkr': COUPLES.mistkatla,
  'marriage-ubbe-rannveig-sterkr': COUPLES.ubbe,
  'marriage-einarr-muirne-sterkr': COUPLES.einarr1614,
  'marriage-austveig-finnr-sterkr': COUPLES.austveig,
  'marriage-skjalg-geirny-sterkr': COUPLES.skjalg,
  'marriage-skadi-langarr-sterkr': COUPLES.skadi,
  'marriage-hafstein-fiona-sterkr': COUPLES.hafstein,
  'marriage-heremod-holmdis-sterkr': COUPLES.heremod,
  'marriage-thrand-gwelda-skaal': COUPLES.gwelda,
  'marriage-torger-vedis-schwarzdorn': COUPLES.vedis,
  'marriage-vidkunn-oddleif-sterkr': COUPLES.vidkunn,
  'marriage-erla-einarr-varulv': COUPLES.einarr1674,
  'marriage-morgan-astrid-ceirwyn': COUPLES.astrid,
  'marriage-hrosskell-hallgard-sterkr': COUPLES.hrosskell,
  'marriage-ljotunn-helmskald-sterkr': COUPLES.ljotunn,
  'marriage-isbjalla-rognvaldr-brathfengr': COUPLES.rognvaldr,
  'marriage-erling-revna-freiwinter': COUPLES.revna,
  'marriage-linnea-galmar-sterkr': COUPLES.linnea,
  'marriage-stun-margarethe-sterkr': COUPLES.stun
});

const PARTNERSHIP_OPTIONS = Object.freeze({
  'marriage-aegir-var-sterkr': Object.freeze({ status: 'ended' }),
  'marriage-gorsedd-sunniva-ceirwyn': Object.freeze({ status: 'ended', end: '1359' }),
  'marriage-ragnor-mistkatla-sterkr': Object.freeze({ status: 'ended', end: '1687' }),
  'marriage-ubbe-rannveig-sterkr': Object.freeze({ status: 'ended', end: '1656' }),
  'marriage-einarr-muirne-sterkr': Object.freeze({ status: 'ended', end: '1705' }),
  'marriage-austveig-finnr-sterkr': Object.freeze({ status: 'ended', end: '1671' }),
  'marriage-skjalg-geirny-sterkr': Object.freeze({ status: 'ended', end: '1677' }),
  'marriage-skadi-langarr-sterkr': Object.freeze({ status: 'ended', end: '1720' }),
  'marriage-hafstein-fiona-sterkr': Object.freeze({ status: 'ended', end: '1691' }),
  'marriage-heremod-holmdis-sterkr': Object.freeze({ status: 'ended', end: '1731' }),
  'marriage-thrand-gwelda-skaal': Object.freeze({ status: 'ended', end: '1679' }),
  'marriage-torger-vedis-schwarzdorn': Object.freeze({ status: 'ended', end: '1691' }),
  'marriage-vidkunn-oddleif-sterkr': Object.freeze({ status: 'ended', end: '1701' }),
  'marriage-morgan-astrid-ceirwyn': Object.freeze({ status: 'ended', end: '1720' }),
  'marriage-linnea-galmar-sterkr': Object.freeze({ status: 'ended', end: '1740' })
});

function marriage(partnershipId) {
  return createMarriage(
    partnershipId,
    ...PARTNERS_BY_ID[partnershipId],
    PARTNERSHIP_OPTIONS[partnershipId] || {}
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'sterkr-parentage',
    ...options
  });
}

function claimedChildren(childIds, partnershipId, timeJumpId, notes) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes,
    extensions: { timeJumpId }
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

function timeJump(id, parentPartnershipId, childIds, fromYear, toYear, label) {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear,
    toYear,
    label,
    notes: 'Absoluter serieller Generationentrenner: Dieser Zeitsprung steht niemals parallel zu Personen oder anderen Knoten.',
    extensions: {}
  };
}

export const HOUSE_STERKR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-sterkr',
    title: 'Clan Sterkr',
    motto: '',
    description: 'Hesire-Clan von Klangheim im Thanentum Skaldenheim. Der Clan geht auf Aegir den Streicher, einen Schüler Jurgens Windrufers, zurück.',
    emblem: HOUSE_EMBLEMS.sterkr,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.sterkr
  },
  houses: [
    house(STERKR_HOUSE_ID, 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-ceirwyn', 'Haus Ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    house('house-gulvig', 'Clan Gulvig'),
    house('house-urquhart', 'Haus Urquhart'),
    house('house-grendel', 'Clan Grendel'),
    house('house-feuerhaar', 'Clan Feuerhaar'),
    house('house-soekeren', 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-tordarroch', 'Clan Tordarroch'),
    house('house-kummerherz', 'Clan Kummerherz'),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-graumahne', 'Clan Graumähne'),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-ridderspore', 'Haus Ridderspore')
  ],
  persons: [
    person('aegir-sterkr-founder', 'Aegir der Streicher', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Begründer und erster Hesir des Clans Sterkr · Schüler Jurgens Windrufers',
      tags: ['Gründer', 'Hesir']
    }),
    spouse('var-skald', 'Vár Skald', 'female', '????', '????', 'house-skald'),

    person('ragnfred-sterkr', 'Ragnfred Sterkr', 'male', '1258', '1365', {
      title: 'Hesir des Clans Sterkr bis 1365'
    }),
    spouse('isbjorg-brathfengr', 'Isbjörg Brathfengr', 'female', '1265', '1361', 'house-brathfengr'),
    awayWoman('sunniva-sterkr', 'Sunniva Sterkr', '1261', '1359', 'Haus Ceirwyn'),
    spouse('gorsedd-ceirwyn', "Gorsedd Ceirwyn O'Calon", 'male', '1259', '1392', 'house-ceirwyn'),

    awayWoman('mistkatla-sterkr', 'Mistkatla Sterkr', '1591', '1690', 'Clan Skald'),
    spouse('ragnor-skald', 'Ragnor Skald', 'male', '1591', '1687', 'house-skald'),
    person('ubbe-sterkr', 'Ubbe Sterkr', 'male', '1594', '1699', {
      title: 'Hesir des Clans Sterkr bis 1699'
    }),
    spouse('rannveig-gulvig', 'Rannveig Gulvig', 'female', '1596', '1656', 'house-gulvig'),

    person('einarr-1614-sterkr', 'Einarr Sterkr', 'male', '1614', '1705', {
      title: 'Hesir des Clans Sterkr 1699–1705'
    }),
    spouse('muirne-urquhart', 'Muirne Urquhart', 'female', '1614', '1706', 'house-urquhart'),
    awayWoman('austveig-sterkr', 'Austveig Sterkr', '1616', '1711', 'Clan Grendel'),
    spouse('finnr-grindel', 'Finnr Grendel', 'male', '1610', '1671', 'house-grendel'),

    person('skjalg-sterkr', 'Skjalg Sterkr', 'male', '1631', '1720', {
      title: 'Hesir des Clans Sterkr 1705–1720',
      notes: 'Die Oberhauptliste nennt „1631–1720“. Da 1631 zugleich sein belegtes Geburtsjahr ist und Einarr bis 1705 amtierte, wird der Amtsbeginn als 1705 interpretiert.'
    }),
    spouse('geirny-feuerhaar', 'Geirný Feuerhaar', 'female', '1631', '1677', 'house-feuerhaar'),
    awayWoman('skadi-sterkr', 'Skadi Sterkr', '1631', '', 'Clan Sökeren', {
      notes: 'Die Quelle versieht Skadi mit keinem Todeszeichen. Ihr belegter lebender Status bleibt erhalten; das hohe Lebensalter ist in Aleria wegen möglicher magischer Langlebigkeit allein kein Widerspruch.'
    }),
    spouse('langarr-soekeren', 'Langarr Sökeren', 'male', '1631', '1720', 'house-soekeren'),
    person('hafstein-sterkr', 'Hafstein Sterkr', 'male', '1633', '1700'),
    spouse('fiona-tordarroch', 'Fiona Tordarroch', 'female', '1635', '1691', 'house-tordarroch'),

    person('heremod-sterkr', 'Heremod Sterkr', 'male', '1652', '1738', {
      title: 'Hesir des Clans Sterkr 1720–1738',
      notes: 'Die Oberhauptliste nennt „1652–1738“. Da 1652 zugleich sein belegtes Geburtsjahr ist und Skjalg bis 1720 amtierte, wird der Amtsbeginn als 1720 interpretiert.'
    }),
    spouse('holmdis-kummerherz', 'Hólmdís Kummerherz', 'female', '1655', '1731', 'house-kummerherz'),
    awayWoman('gwelda-sterkr', 'Gwelda Sterkr', '1654', '1711', 'Clan Skaal'),
    spouse('thrand-skaal', 'Thrand Skaal', 'male', '1654', '1679', 'house-skaal'),
    awayWoman('vedis-sterkr', 'Vedis Sterkr', '1650', '1720', 'Clan Schwarzdorn', {
      notes: 'Mit den Quelljahren 1633/1635 ihrer Eltern wäre Fiona bei Vedis’ Geburt 15 und Hafstein 17 Jahre alt. Die Daten werden nicht still verändert.'
    }),
    spouse('torger-schwarzdorn', 'Torger Schwarzdorn', 'male', '1646', '1691', 'house-schwarzdorn'),
    person('vidkunn-sterkr', 'Vidkunn Sterkr', 'male', '1653', '1720'),
    spouse('oddleif', 'Oddleif', 'female', '1654', '1701', ''),

    person('einarr-sterkr', 'Einarr Sterkr', 'male', '1674', '', {
      title: 'Hesir des Clans Sterkr seit 1738',
      notes: 'Der Begleittext beschreibt Einarr als 13-jährig zu Beginn und als 33-jährig am Ende des Bürgerkriegs. Das passt nicht zu seinem genealogischen Geburtsjahr 1674, falls damit der Krieg der Prätendenten 1720–1740 gemeint ist. Das Geburtsjahr bleibt mangels eindeutiger Korrektur unverändert.'
    }),
    spouse('erla-varulv', 'Erla Varulv', 'female', '1675', '', 'house-varulv'),
    awayWoman('astrid-sterkr', 'Astrid Sterkr', '1670', '1720', 'Haus Ceirwyn', {
      notes: 'Mit den Quelljahren 1652/1655 ihrer Eltern wäre Hólmdís bei Astrids Geburt 15 und Heremod 18 Jahre alt. Die Daten werden nicht still verändert.'
    }),
    spouse('morgan-ceirwyn', 'Morgan Ceirwyn', 'male', '1661', '1720', 'house-ceirwyn'),
    person('hrosskell-sterkr', 'Hrosskell Sterkr', 'male', '1675', ''),
    spouse('hallgard-soekering', 'Hallgard Sökering', 'female', '1678', '', 'house-soekeren', {
      notes: 'Die Quelle schreibt den Herkunftsnamen „Sökering“, während das bestehende Register den Clan als „Sökeren“ führt. Die Personenschreibweise bleibt erhalten; die Haus-ID verweist auf Clan Sökeren.'
    }),
    person('ljotunn-sterkr', 'Ljotunn Sterkr', 'male', '1677', ''),
    spouse('helmskald-graumahne', 'Helmskald Graumähne', 'male', '1674', '', 'house-graumahne'),

    person('rognvaldr-sterkr', 'Rognvaldr Sterkr', 'male', '1694', '', {
      title: 'Erster Erbe des Clans Sterkr',
      notes: 'Die Sterkr-Quelle schreibt „Rognvald“; die bereits registrierte Gegenakte führt dieselbe Weltperson kanonisch als Rognvaldr Sterkr.'
    }),
    spouse('isbjalla-1696-brathfengr', 'Ísbjalla Brathfengr', 'female', '1696', '', 'house-brathfengr'),
    awayWoman('revna-sterkr', 'Revna Sterkr', '1697', '', 'Clan Freiwinter'),
    spouse('erling-freiwinter', 'Erling Freiwinter', 'male', '1695', '', 'house-freiwinter'),
    awayWoman('linnea-sterkr', 'Linnea Sterkr', '1699', '', 'Clan Skald'),
    spouse('galmar-skald', 'Galmar Skald', 'male', '1692', '1740', 'house-skald'),
    person('stun-sterkr', 'Stûn Sterkr', 'male', '1696', '', {
      notes: 'Die Quelle wechselt zwischen „Stûn“ und „Stún“. Für die Weltperson wird die Schreibweise der Personenkarte „Stûn“ verwendet.'
    }),
    spouse('margarethe-ridderspore', 'Margarethe Ridderspore', 'female', '1700', '', 'house-ridderspore'),
    person('estrid-sterkr', 'Estrid Sterkr', 'female', '1698', ''),
    person('thyra-sterkr', 'Thyra Sterkr', 'female', '1704', ''),

    person('armod-sterkr', 'Armod Sterkr', 'male', '1717', ''),
    person('fjola-sterkr', 'Fjóla Sterkr', 'female', '1721', ''),
    person('thengil-sterkr', 'Thengil Sterkr', 'male', '1724', ''),
    person('alarik-sterkr', 'Alarik Sterkr', 'male', '1720', ''),
    person('signy-sterkr', 'Signy Sterkr', 'female', '1725', '')
  ],
  partnerships: Object.keys(PARTNERS_BY_ID).map(marriage),
  parentages: [
    ...claimedChildren(
      ['ragnfred-sterkr', 'sunniva-sterkr'],
      'marriage-aegir-var-sterkr',
      FOUNDER_TIME_JUMP_ID,
      'Die Quelle überspringt zwischen Aegir und Vár sowie Ragnfred und Sunniva mehrere nicht einzeln überlieferte Generationen.'
    ),
    ...claimedChildren(
      ['mistkatla-sterkr', 'ubbe-sterkr'],
      'marriage-isbjorg-ragnfred-brathfengr',
      RAGNFRED_TIME_JUMP_ID,
      'Die Quelle überspringt zwischen Ragnfred und Isbjörg sowie Mistkatla und Ubbe mehrere nicht einzeln überlieferte Generationen.'
    ),
    ...childrenOf(['einarr-1614-sterkr', 'austveig-sterkr'], 'marriage-ubbe-rannveig-sterkr'),
    ...childrenOf(['skjalg-sterkr', 'skadi-sterkr', 'hafstein-sterkr'], 'marriage-einarr-muirne-sterkr'),
    ...childrenOf(['heremod-sterkr', 'gwelda-sterkr'], 'marriage-skjalg-geirny-sterkr'),
    ...childrenOf(['vedis-sterkr', 'vidkunn-sterkr'], 'marriage-hafstein-fiona-sterkr'),
    ...childrenOf(['einarr-sterkr', 'astrid-sterkr'], 'marriage-heremod-holmdis-sterkr'),
    ...childrenOf(['hrosskell-sterkr', 'ljotunn-sterkr'], 'marriage-vidkunn-oddleif-sterkr'),
    ...childrenOf(['rognvaldr-sterkr', 'revna-sterkr', 'linnea-sterkr'], 'marriage-erla-einarr-varulv'),
    ...childrenOf(['stun-sterkr', 'estrid-sterkr', 'thyra-sterkr'], 'marriage-hrosskell-hallgard-sterkr'),
    ...childrenOf(['armod-sterkr', 'fjola-sterkr', 'thengil-sterkr'], 'marriage-isbjalla-rognvaldr-brathfengr'),
    ...childrenOf(['alarik-sterkr', 'signy-sterkr'], 'marriage-stun-margarethe-sterkr')
  ],
  cadetBranches: [
    marriedAway('married-away-sunniva-sterkr-ceirwyn', 'Haus Ceirwyn', 'marriage-gorsedd-sunniva-ceirwyn', 'house-ceirwyn', 'haus-ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    marriedAway('married-away-mistkatla-sterkr-skald', 'Clan Skald', 'marriage-ragnor-mistkatla-sterkr', 'house-skald', 'haus-skald', HOUSE_EMBLEMS.skald),
    marriedAway('married-away-austveig-sterkr-grindel', 'Clan Grendel', 'marriage-austveig-finnr-sterkr', 'house-grendel', 'haus-grendel'),
    marriedAway('married-away-skadi-sterkr-soekeren', 'Clan Sökeren', 'marriage-skadi-langarr-sterkr', 'house-soekeren', 'haus-soekeren', HOUSE_EMBLEMS.soekeren),
    marriedAway('married-away-gwelda-sterkr-skaal', 'Clan Skaal', 'marriage-thrand-gwelda-skaal', 'house-skaal', 'haus-skaal', HOUSE_EMBLEMS.skaal),
    marriedAway('married-away-vedis-sterkr-schwarzdorn', 'Clan Schwarzdorn', 'marriage-torger-vedis-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-astrid-sterkr-ceirwyn', 'Haus Ceirwyn', 'marriage-morgan-astrid-ceirwyn', 'house-ceirwyn', 'haus-ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    marriedAway('married-away-revna-sterkr-freiwinter', 'Clan Freiwinter', 'marriage-erling-revna-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-linnea-sterkr-skald', 'Clan Skald', 'marriage-linnea-galmar-sterkr', 'house-skald', 'haus-skald', HOUSE_EMBLEMS.skald)
  ],
  timeJumps: [
    timeJump(
      FOUNDER_TIME_JUMP_ID,
      'marriage-aegir-var-sterkr',
      ['ragnfred-sterkr', 'sunniva-sterkr'],
      '????',
      '1258',
      'Nicht einzeln überlieferte Generationen'
    ),
    timeJump(
      RAGNFRED_TIME_JUMP_ID,
      'marriage-isbjorg-ragnfred-brathfengr',
      ['mistkatla-sterkr', 'ubbe-sterkr'],
      '1365',
      '1591',
      'Nicht einzeln überlieferte Generationen'
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-aegir-var-sterkr',
    houseId: STERKR_HOUSE_ID,
    crestSubtitle: 'Hesire-Clan von Klangheim · Vasallen der Brathfengr',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aegir-sterkr-founder',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 3,
    sourceModule: 'Clan Sterkr (bereitgestellte Altdaten)',
    sourceNote: 'Die vollständige Akte übernimmt alle 51 benannten Quellpersonen, 22 Ehen und 28 Abstammungen. Nach Aegir und Vár folgen Hauswappen und ein absolut serieller Zeitsprung zu Ragnfred und Sunniva; ein zweiter serieller Zeitsprung führt ausschließlich unter Ragnfred und Isbjörg zu Mistkatla und Ubbe. Neun belegte auswärtige Ehen von Sterkr-Frauen besitzen direkte Wegverheiratet-Knoten. Kinder in den Gegenakten Ceirwyn, Skaal, Schwarzdorn und Freiwinter werden hier nicht gedoppelt. Kanonische Weltpersonen und Partnerschafts-IDs werden mit diesen Gegenakten geteilt. Dokumentierte Quellwidersprüche: Skjalg und Heremod erhalten in der Oberhauptliste ihre Geburtsjahre als scheinbare Amtsanfänge; die Amtsfolgen werden deshalb aus der Nachfolge 1705/1720 abgeleitet. Einarrs Altersangaben im Bürgerkrieg passen nicht zum Geburtsjahr 1674, sofern der Krieg der Prätendenten 1720–1740 gemeint ist. Vedis und Astrid wären nach den Quelljahren bei der Geburt Töchter 15-jähriger Mütter. Hallgards Herkunft schwankt zwischen Sökering und dem registrierten Clan Sökeren, Rognvalds kanonische Gegenakte schreibt Rognvaldr, und Stûn erscheint auch als Stún. Skadis hohes Lebensalter ohne Todeszeichen gilt in Aleria wegen möglicher magischer Langlebigkeit ausdrücklich nicht als Widerspruch. Keine der offenen Angaben wurde still erfunden oder überschrieben. Wiederholte Standardsilhouetten wurden nicht als Individualportraits importiert.',
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
