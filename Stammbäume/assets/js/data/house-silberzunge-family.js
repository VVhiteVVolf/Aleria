import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_SILBERZUNGE_PORTRAITS } from './house-silberzunge-portraits.js';
import {
  IVARSHEIM_HOUSE_EMBLEMS,
  IVARSHEIM_HOUSE_PROFILES
} from './ivarsheim-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';

const SILBERZUNGE_HOUSE_ID = 'house-silberzunge';
const FOUNDER_TIME_JUMP_ID = 'gap-surtr-to-snorri-silberzunge';

const HOUSE_EMBLEMS = Object.freeze({
  silberzunge: IVARSHEIM_HOUSE_EMBLEMS.silberzunge,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  feuerhaar: IVARSHEIM_HOUSE_EMBLEMS.feuerhaar,
  hyrmgardr: IVARSHEIM_HOUSE_EMBLEMS.hyrmgardr,
  grendel: IVARSHEIM_HOUSE_EMBLEMS.grendel,
  trachwyll: IVARSHEIM_HOUSE_EMBLEMS.trachwyll,
  windhueter: IVARSHEIM_HOUSE_EMBLEMS.windhueter,
  blutklinge: IVARSHEIM_HOUSE_EMBLEMS.blutklinge,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  brithyll: GRAUE_WEITE_HOUSE_EMBLEMS.brithyll
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
  'surtr-silberzunge',
  'snorri-silberzunge',
  'gunnvar-silberzunge',
  'loki-silberzunge',
  'kolskegg-silberzunge'
]);

const MAINLINE_IDS = new Set([
  'thrandr-silberzunge',
  'hjalprek-silberzunge',
  'fjornir-silberzunge',
  'baldor-silberzunge'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SILBERZUNGE_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SILBERZUNGE_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SILBERZUNGE_HOUSE_ID ? 'core' : 'married'),
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
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-silberzunge--${id}`),
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

function receivedWard(id, name, sex, birth, houseId, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    houseId,
    familyRole: 'ward',
    lineageRole: 'branch',
    title: options.title || 'Aufgenommenes Mündel des Clans Silberzunge',
    tags: [...(options.tags || []), 'Mündel', 'Aufgenommen']
  });
}

function sentWard(id, name, sex, birth, death, targetHouseName, options = {}) {
  return person(id, name, sex, birth, death, {
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
  founders: ['surtr-silberzunge', 'skalli-silberzunge'],
  snorri: ['snorri-silberzunge', 'grimhildr-helgr'],
  glodis: ['edmund-skogg', 'glodis-silberzunge'],
  brodd: ['brodd-silberzunge', 'hildigunn-skjegg'],
  naddvar: ['naddvar-silberzunge', 'gunnlaug-silberzunge-spouse'],
  bryndis: ['austmann-windhueter', 'bryndis-silberzunge'],
  lodvar: ['lodvar-silberzunge', 'svantje-silberzunge-spouse'],
  thrandr: ['thrandr-silberzunge', 'gerdrun-silberzunge-spouse'],
  bjarnhild: ['jorlaff-blutklinge', 'bjarnhild-silberzunge'],
  gunnvar: ['gunnvar-silberzunge', 'thordis-grendel'],
  isrun: ['asger-wargh', 'isrun-silberzunge'],
  loki: ['loki-silberzunge', 'vedis-skjegg'],
  freydis: ['freydis-silberzunge', 'njordinn-hyrmgardr'],
  thorkel: ['ljosdis-freiwinter', 'thorkel-silberzunge'],
  kolskegg: ['kolskegg-silberzunge', 'skulla-feuerhaar'],
  eldkatla: ['kjallak-skogg', 'eldkatla-silberzunge'],
  leifgard: ['leifgard-silberzunge', 'vefrun-silberzunge-spouse'],
  asgerd: ['mormond-schwarzdorn', 'asgerd-silberzunge'],
  hjalprek: ['skegghild-wargh', 'hjalprek-silberzunge'],
  oddny: ['oddny-silberzunge', 'rhodri-trachwyll'],
  sverrir: ['sverrir-silberzunge', 'gundel-graumahne'],
  ranva: ['categirn-1695-brithyll', 'ranva-silberzunge']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-surtr-skalli-silberzunge': COUPLES.founders,
  'marriage-snorri-grimhildr-silberzunge': COUPLES.snorri,
  'marriage-edmund-glodis-skogg': COUPLES.glodis,
  'marriage-brodd-hildigunn-skjegg': COUPLES.brodd,
  'marriage-naddvar-gunnlaug-silberzunge': COUPLES.naddvar,
  'marriage-bryndis-austmann-silberzunge': COUPLES.bryndis,
  'marriage-lodvar-svantje-silberzunge': COUPLES.lodvar,
  'marriage-thrandr-gerdrun-silberzunge': COUPLES.thrandr,
  'marriage-bjarnhild-jorlaff-silberzunge': COUPLES.bjarnhild,
  'marriage-gunnvar-thordis-silberzunge': COUPLES.gunnvar,
  'marriage-asger-isrun-wargh': COUPLES.isrun,
  'marriage-loki-vedis-silberzunge': COUPLES.loki,
  'marriage-freydis-njordinn-silberzunge': COUPLES.freydis,
  'marriage-ljosdis-thorkel-freiwinter': COUPLES.thorkel,
  'marriage-kolskegg-skulla-feuerhaar': COUPLES.kolskegg,
  'marriage-kjallak-eldkatla-skogg': COUPLES.eldkatla,
  'marriage-leifgard-vefrun-silberzunge': COUPLES.leifgard,
  'marriage-mormond-asgerd-schwarzdorn': COUPLES.asgerd,
  'marriage-skegghild-hjalprek-wargh': COUPLES.hjalprek,
  'marriage-oddny-rhodri-silberzunge': COUPLES.oddny,
  'marriage-sverrir-gundel-silberzunge': COUPLES.sverrir,
  'marriage-categirn-ranva-brithyll': COUPLES.ranva
});

function marriage(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function endedMarriage(partnershipId, end = '') {
  return marriage(partnershipId, { status: 'ended', end });
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'silberzunge-parentage',
    ...options
  });
}

function fosterChildren(childIds, guardianId, notes) {
  return createParentages(childIds, [guardianId], '', {
    idPrefix: 'silberzunge-foster-parentage',
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

export const HOUSE_SILBERZUNGE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-silberzunge',
    title: 'Clan Silberzunge',
    motto: '',
    description: 'Wohlhabender Hesirenclan von Ivarsfels, begründet durch Surtr die Silberzunge. Der Clan dient den Wargh als Verwalter, Händler und Diplomatengeschlecht.',
    emblem: HOUSE_EMBLEMS.silberzunge,
    houseProfile: IVARSHEIM_HOUSE_PROFILES.silberzunge
  },
  houses: [
    house(SILBERZUNGE_HOUSE_ID, 'Clan Silberzunge', HOUSE_EMBLEMS.silberzunge),
    house('house-helgr', 'Clan Helgr'),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg),
    house('house-skjegg', 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-windhueter', 'Haus Windhüter', HOUSE_EMBLEMS.windhueter),
    house('house-blutklinge', 'Haus Blutklinge', HOUSE_EMBLEMS.blutklinge),
    house('house-grendel', 'Clan Grendel', HOUSE_EMBLEMS.grendel),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-hyrmgardr', 'Clan Hyrmgarthr', HOUSE_EMBLEMS.hyrmgardr),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-feuerhaar', 'Clan Feuerhaar', HOUSE_EMBLEMS.feuerhaar),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-trachwyll', 'Haus Trachwyll', HOUSE_EMBLEMS.trachwyll),
    house('house-graumahne', 'Clan Graumähne'),
    house('house-brithyll', "Haus Brithyll O'Tredegar", HOUSE_EMBLEMS.brithyll),
    house('house-eisenbieger', 'Clan Eisenbieger')
  ],
  persons: [
    person('surtr-silberzunge', 'Surtr „die Silberzunge“', 'male', '????', '????', {
      title: 'Gründer und erster Hesir des Clans Silberzunge',
      notes: 'Legendärer Diplomat und Verwalter im Dienst der Wargh; seine Erhebung begründete den Clan Silberzunge.'
    }),
    spouse('skalli-silberzunge', 'Skalli', 'female', '????', '????', '', {
      title: 'Mitgründerin des Clans Silberzunge'
    }),

    person('snorri-silberzunge', 'Snorri Silberzunge', 'male', '1562', '1650', {
      title: 'Hesir des Clans Silberzunge'
    }),
    awayWoman('glodis-silberzunge', 'Glódís Silberzunge', '1564', '1630', 'Clan Skogg'),
    spouse('grimhildr-helgr', 'Grímhíldr Helgr', 'female', '1564', '1629', 'house-helgr'),
    spouse('edmund-skogg', 'Edmund Skogg', 'male', '1561', '1659', 'house-skogg'),

    person('brodd-silberzunge', 'Brodd Silberzunge', 'male', '1582', '1629'),
    person('naddvar-silberzunge', 'Naddvar Silberzunge', 'male', '1583', '1627'),
    awayWoman('bryndis-silberzunge', 'Bryndís Silberzunge', '1584', '1627', 'Haus Windhüter'),
    person('lodvar-silberzunge', 'Lodvar Silberzunge', 'male', '1585', '1627'),
    spouse('hildigunn-skjegg', 'Hildigunn Skjegg', 'female', '1585', '1641', 'house-skjegg'),
    spouse('gunnlaug-silberzunge-spouse', 'Gunnlaug', 'female', '1583', '1639'),
    spouse('austmann-windhueter', 'Austmann Windhüter', 'male', '1580', '1627', 'house-windhueter'),
    spouse('svantje-silberzunge-spouse', 'Svantje', 'female', '1581', '1644'),

    person('langarr-silberzunge', 'Langarr Silberzunge', 'male', '1608', '1627'),
    person('ragnfred-silberzunge', 'Ragnfred Silberzunge', 'male', '1609', '1627'),
    person('svartulf-silberzunge', 'Svartulf Silberzunge', 'male', '1610', '1627'),
    person('skorri-silberzunge', 'Skorri Silberzunge', 'male', '1607', '1627'),
    person('ulfrik-silberzunge', 'Ulfrik Silberzunge', 'male', '1609', '1627'),
    person('thrandr-silberzunge', 'Thrandr Silberzunge', 'male', '1606', '1632'),
    person('dagrinn-silberzunge', 'Dagrinn Silberzunge', 'male', '1608', '1627'),
    awayWoman('bjarnhild-silberzunge', 'Bjarnhild Silberzunge', '1609', '1627', 'Haus Blutklinge'),
    spouse('gerdrun-silberzunge-spouse', 'Gerdrun', 'female', '1607', '1681'),
    spouse('jorlaff-blutklinge', 'Jorlaff Blutklinge', 'male', '1604', '1627', 'house-blutklinge'),

    person('gunnvar-silberzunge', 'Gunnvar Silberzunge', 'male', '1625', '1689', {
      title: 'Hesir des Clans Silberzunge'
    }),
    awayWoman('isrun-silberzunge', 'Ísrún Silberzunge', '1627', '1685', 'Clan Wargh'),
    spouse('thordis-grendel', 'Thordis Grendel', 'female', '1630', '1700', 'house-grendel'),
    spouse('asger-wargh', 'Asger Wargh', 'male', '1605', '1689', 'house-wargh'),

    person('loki-silberzunge', 'Loki Silberzunge', 'male', '1650', '1711', {
      title: 'Hesir des Clans Silberzunge'
    }),
    awayWoman('freydis-silberzunge', 'Freydis Silberzunge', '1653', '1719', 'Clan Hyrmgarthr'),
    person('thorkel-silberzunge', 'Thorkel Silberzunge', 'male', '1651', '1720'),
    spouse('vedis-skjegg', 'Vedis Skjegg', 'female', '1651', '1706', 'house-skjegg'),
    spouse('njordinn-hyrmgardr', 'Njordinn Hyrmgarthr', 'male', '1649', '1711', 'house-hyrmgardr'),
    spouse('ljosdis-freiwinter', 'Ljosdis Freiwinter', 'female', '1653', '1709', 'house-freiwinter'),

    person('kolskegg-silberzunge', 'Kolskegg Silberzunge', 'male', '1671', '', {
      title: 'Hesir des Clans Silberzunge seit 1711'
    }),
    awayWoman('eldkatla-silberzunge', 'Eldkatla Silberzunge', '1675', '', 'Clan Skogg'),
    person('leifgard-silberzunge', 'Leifgard Silberzunge', 'male', '1672', ''),
    awayWoman('asgerd-silberzunge', 'Asgerd Silberzunge', '1674', '1720', 'Clan Schwarzdorn'),
    spouse('skulla-feuerhaar', 'Skulla Feuerhaar', 'female', '1677', '', 'house-feuerhaar'),
    spouse('kjallak-skogg', 'Kjallak Skogg', 'male', '1669', '', 'house-skogg'),
    spouse('vefrun-silberzunge-spouse', 'Vefrún', 'female', '1674', ''),
    spouse('mormond-schwarzdorn', 'Mormond Schwarzdorn', 'male', '1673', '1720', 'house-schwarzdorn'),

    person('hjalprek-silberzunge', 'Hjalprek Silberzunge', 'male', '1697', '', {
      title: 'Erster Erbe des Clans Silberzunge'
    }),
    awayWoman('oddny-silberzunge', 'Oddny Silberzunge', '1700', '', 'Haus Trachwyll'),
    person('sverrir-silberzunge', 'Sverrir Silberzunge', 'male', '1701', ''),
    awayWoman('ranva-silberzunge', 'Ranva Silberzunge', '1696', '', "Haus Brithyll O'Tredegar"),
    spouse('skegghild-wargh', 'Skegghild Wargh', 'female', '1702', '', 'house-wargh'),
    spouse('rhodri-trachwyll', 'Rhodri Trachwyll', 'male', '1695', '', 'house-trachwyll'),
    spouse('gundel-graumahne', 'Gundel Graumähne', 'female', '1703', '', 'house-graumahne'),
    spouse('categirn-1695-brithyll', 'Categirn Brithyll', 'male', '1695', '', 'house-brithyll'),

    person('fjornir-silberzunge', 'Fjornir Silberzunge', 'male', '1720', '', {
      title: 'Zweiter Erbe des Clans Silberzunge'
    }),
    person('baldor-silberzunge', 'Baldor Silberzunge', 'male', '1722', '', {
      title: 'Dritter Erbe des Clans Silberzunge'
    }),
    person('fjola-silberzunge', 'Fjóla Silberzunge', 'female', '1724', ''),
    receivedWard('asdis-eisenbieger', 'Ásdís Eisenbieger', 'female', '1723', 'house-eisenbieger', {
      title: 'Aufgenommenes Mündel Hjalprek Silberzunges'
    }),
    person('eyjolf-silberzunge', 'Eyjolf Silberzunge', 'male', '1722', ''),
    person('katla-silberzunge', 'Katla Silberzunge', 'female', '1724', ''),
    sentWard('leiknir-silberzunge', 'Leiknir Silberzunge', 'male', '1729', '', 'Clan Skogg')
  ],
  partnerships: [
    endedMarriage('marriage-surtr-skalli-silberzunge'),
    endedMarriage('marriage-snorri-grimhildr-silberzunge', '1629'),
    endedMarriage('marriage-edmund-glodis-skogg', '1630'),
    endedMarriage('marriage-brodd-hildigunn-skjegg', '1629'),
    endedMarriage('marriage-naddvar-gunnlaug-silberzunge', '1627'),
    endedMarriage('marriage-bryndis-austmann-silberzunge', '1627'),
    endedMarriage('marriage-lodvar-svantje-silberzunge', '1627'),
    endedMarriage('marriage-thrandr-gerdrun-silberzunge', '1632'),
    endedMarriage('marriage-bjarnhild-jorlaff-silberzunge', '1627'),
    endedMarriage('marriage-gunnvar-thordis-silberzunge', '1689'),
    endedMarriage('marriage-asger-isrun-wargh', '1685'),
    endedMarriage('marriage-loki-vedis-silberzunge', '1706'),
    endedMarriage('marriage-freydis-njordinn-silberzunge', '1711'),
    endedMarriage('marriage-ljosdis-thorkel-freiwinter', '1709'),
    marriage('marriage-kolskegg-skulla-feuerhaar'),
    marriage('marriage-kjallak-eldkatla-skogg'),
    marriage('marriage-leifgard-vefrun-silberzunge'),
    endedMarriage('marriage-mormond-asgerd-schwarzdorn', '1720'),
    marriage('marriage-skegghild-hjalprek-wargh'),
    marriage('marriage-oddny-rhodri-silberzunge'),
    marriage('marriage-sverrir-gundel-silberzunge'),
    marriage('marriage-categirn-ranva-brithyll')
  ],
  parentages: [
    ...childrenOf(['snorri-silberzunge', 'glodis-silberzunge'], 'marriage-surtr-skalli-silberzunge', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Snorri und Glódís.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(
      ['brodd-silberzunge', 'naddvar-silberzunge', 'bryndis-silberzunge', 'lodvar-silberzunge'],
      'marriage-snorri-grimhildr-silberzunge'
    ),
    ...childrenOf(['langarr-silberzunge', 'ragnfred-silberzunge', 'svartulf-silberzunge'], 'marriage-brodd-hildigunn-skjegg'),
    ...childrenOf(['skorri-silberzunge', 'ulfrik-silberzunge'], 'marriage-naddvar-gunnlaug-silberzunge'),
    ...childrenOf(['thrandr-silberzunge', 'dagrinn-silberzunge', 'bjarnhild-silberzunge'], 'marriage-lodvar-svantje-silberzunge'),
    ...childrenOf(['gunnvar-silberzunge', 'isrun-silberzunge'], 'marriage-thrandr-gerdrun-silberzunge'),
    ...childrenOf(['loki-silberzunge', 'freydis-silberzunge', 'thorkel-silberzunge'], 'marriage-gunnvar-thordis-silberzunge'),
    ...childrenOf(['kolskegg-silberzunge', 'eldkatla-silberzunge'], 'marriage-loki-vedis-silberzunge'),
    ...childrenOf(['leifgard-silberzunge', 'asgerd-silberzunge'], 'marriage-ljosdis-thorkel-freiwinter'),
    ...childrenOf(['hjalprek-silberzunge', 'oddny-silberzunge'], 'marriage-kolskegg-skulla-feuerhaar'),
    ...childrenOf(['sverrir-silberzunge', 'ranva-silberzunge'], 'marriage-leifgard-vefrun-silberzunge'),
    ...childrenOf(['fjornir-silberzunge', 'baldor-silberzunge', 'fjola-silberzunge'], 'marriage-skegghild-hjalprek-wargh'),
    ...fosterChildren(
      ['asdis-eisenbieger'],
      'hjalprek-silberzunge',
      'Ásdís Eisenbieger ist Hjalpreks aufgenommenes Mündel und kein leibliches Kind des Silberzungenpaares.'
    ),
    ...childrenOf(['eyjolf-silberzunge', 'katla-silberzunge', 'leiknir-silberzunge'], 'marriage-sverrir-gundel-silberzunge')
  ],
  cadetBranches: [
    marriedAway('married-away-glodis-silberzunge-skogg', 'Clan Skogg', 'marriage-edmund-glodis-skogg', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg),
    marriedAway('married-away-bryndis-silberzunge-windhueter', 'Haus Windhüter', 'marriage-bryndis-austmann-silberzunge', 'house-windhueter', 'haus-windhueter', HOUSE_EMBLEMS.windhueter),
    marriedAway('married-away-bjarnhild-silberzunge-blutklinge', 'Haus Blutklinge', 'marriage-bjarnhild-jorlaff-silberzunge', 'house-blutklinge', 'haus-blutklinge', HOUSE_EMBLEMS.blutklinge),
    marriedAway('married-away-isrun-silberzunge-wargh', 'Clan Wargh', 'marriage-asger-isrun-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    marriedAway('married-away-freydis-silberzunge-hyrmgardr', 'Clan Hyrmgarthr', 'marriage-freydis-njordinn-silberzunge', 'house-hyrmgardr', 'haus-hyrmgardr', HOUSE_EMBLEMS.hyrmgardr),
    marriedAway('married-away-eldkatla-silberzunge-skogg', 'Clan Skogg', 'marriage-kjallak-eldkatla-skogg', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg),
    marriedAway('married-away-asgerd-silberzunge-schwarzdorn', 'Clan Schwarzdorn', 'marriage-mormond-asgerd-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-oddny-silberzunge-trachwyll', 'Haus Trachwyll', 'marriage-oddny-rhodri-silberzunge', 'house-trachwyll', 'haus-trachwyll', HOUSE_EMBLEMS.trachwyll),
    marriedAway('married-away-ranva-silberzunge-brithyll', "Haus Brithyll O'Tredegar", 'marriage-categirn-ranva-brithyll', 'house-brithyll', 'haus-brithyll', HOUSE_EMBLEMS.brithyll),
    wardAway('ward-away-leiknir-silberzunge-skogg', 'Clan Skogg', 'leiknir-silberzunge', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-surtr-skalli-silberzunge',
      parentPersonId: '',
      childIds: ['snorri-silberzunge', 'glodis-silberzunge'],
      years: 0,
      fromYear: '????',
      toYear: '1562',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner direkt unter dem Hauswappen.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-surtr-skalli-silberzunge',
    houseId: SILBERZUNGE_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Ivarsfels · Vasallen des Clans Wargh',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'surtr-silberzunge',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: 'Clan Silberzunge (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Quellenstammbaum wurde von Surtr und Skalli bis zu den 1740 lebenden jüngsten Silberzungen ohne Personenfokus übernommen. Das Hauswappen und genau ein Zeitsprung stehen strikt seriell zwischen dem Gründerpaar und den Geschwistern Snorri und Glódís. Glódís, Bryndís, Bjarnhild, Ísrún, Freydis, Eldkatla, Asgerd, Oddny und Ranva erhalten direkte Wegverheiratet-Knoten; Nachkommen ihrer auswärtigen Ehen werden ausschließlich in den fortführenden Gegenakten gezeigt. Ásdís Eisenbieger ist nur Hjalpreks aufgenommenes Mündel. Leiknir bleibt biologischer Sohn Sverrirs und Gundels, trägt als fortgegebenes Mündel den dunkelblauen Rahmen und ist direkt mit Clan Skogg verknüpft; die Gegenakte führt ihn dort als aufgenommenes Mündel. Die Hierarchietabelle schreibt Gerdruns Namen einmal als „Gerdun“, während Kinderüberschrift und Stammbaumgrafik „Gerdrun“ belegen; diese Form wird verwendet. Die blaue Leiknir-Karte nennt keinen konkreten Skogg-Vormund, weshalb die Gegenakte ihn transparent als Clan-Mündel beim amtierenden Oberhaupt Kjallak einordnet. Wiederholte Standardsilhouetten wurden nicht als Individualporträts gespeichert.',
    registryTombstones: {
      persons: ['haus-silberzunge-gruender', 'haus-silberzunge-gruenderin'],
      partnerships: ['marriage-haus-silberzunge-founders']
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
