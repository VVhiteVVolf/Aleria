import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  ALDRIMAR_HOUSE_EMBLEMS,
  ALDRIMAR_HOUSE_PROFILES
} from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { KLAUENINSEL_HOUSE_EMBLEMS } from './klaueninseln-house-profiles.js';
import { KRONENTAL_HOUSE_EMBLEMS } from './kronental-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';

const WARGH_HOUSE_ID = 'house-wargh';

const HOUSE_EMBLEMS = Object.freeze({
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf,
  'mac-luin': IVARSHEIM_HOUSE_EMBLEMS['mac-luin'],
  feuerhaar: IVARSHEIM_HOUSE_EMBLEMS.feuerhaar,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  silberzunge: IVARSHEIM_HOUSE_EMBLEMS.silberzunge,
  trachwyll: IVARSHEIM_HOUSE_EMBLEMS.trachwyll,
  grendel: IVARSHEIM_HOUSE_EMBLEMS.grendel,
  hyrmgarthr: IVARSHEIM_HOUSE_EMBLEMS.hyrmgardr,
  blutklinge: IVARSHEIM_HOUSE_EMBLEMS.blutklinge,
  windhueter: IVARSHEIM_HOUSE_EMBLEMS.windhueter,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  morthwyll: KLAUENINSEL_HOUSE_EMBLEMS.morthwyll,
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
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
  'ivar-wargh',
  'hoskuld-wargh',
  'fjorlagr-wargh',
  'thorgest-wargh',
  'thorald-wargh',
  'kolbjorn-wargh',
  'harald-wargh',
  'asger-wargh',
  'torstein-wargh',
  'borg-wargh',
  'ketill-wargh'
]);

const MAINLINE_IDS = new Set(['halskar-wargh']);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? WARGH_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_WARGH_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === WARGH_HOUSE_ID ? 'core' : 'married'),
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
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-wargh--${id}`),
    houseId,
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), options.engaged ? 'Wegverlobt' : 'Wegverheiratet']
  });
}

function ward(id, name, sex, birth, houseId, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    houseId,
    familyRole: 'ward',
    lineageRole: 'branch',
    title: options.title || 'Aufgenommenes Mündel Ketill Warghs',
    tags: [...(options.tags || []), 'Mündel']
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
  founders: ['ivar-wargh', 'meabh-mac-luin'],
  holmdis: ['holmdis-wargh', 'odvaldr-varangr'],
  hoskuld: ['hoskuld-wargh', 'bergljot-vaeren'],
  fjorlagr: ['fjorlagr-wargh', 'elfrid-blutklinge'],
  annegret: ['annegret-wargh', 'arnor-varulv'],
  thorgest: ['thorgest-wargh', 'asdotta'],
  geirlaug: ['geirlaug-wargh', 'thorsleikr-feuerhaar'],
  thorald: ['thorald-wargh', 'vekatla-windhueter'],
  bjorgolf: ['bjorgolf-wargh', 'svanlaug'],
  ingunn: ['ingunn-wargh', 'hakon-schmetterschild'],
  kolbjorn: ['kolbjorn-wargh', 'geirny-riesentod'],
  dagbjorg: ['dagbjorg-wargh', 'gunnir-hyrmgarthr'],
  thorgal: ['thorgal-wargh', 'skjoldrun-windhueter'],
  haldor: ['haldor-wargh', 'fridlaug-blutklinge'],
  harald: ['harald-wargh', 'eyrun-skogg'],
  hljotrun: ['hljotrun-wargh', 'gunnar-grendel'],
  herleif: ['herleif-wargh', 'fjorgyn-helgr'],
  asger: ['asger-wargh', 'isrun-silberzunge'],
  hogne: ['hogne-wargh', 'yngvild-skaal'],
  hroald: ['hroald-wargh', 'arnkatla'],
  torstein: ['torstein-wargh', 'malfrid-feuerhaar'],
  solveig: ['solveig-wargh', 'kolbein-grendel'],
  heidrek: ['heidrek-wargh', 'reifkatla'],
  jorund: ['jorund-wargh', 'austveig'],
  borg: ['angebroda-skald', 'borg-wargh'],
  bylga: ['bylga-wargh', 'hogrand-kummerherz'],
  sverkel: ['sverkel-wargh', 'torgunna-wargh'],
  edeltraud: ['cadwallen-morthwyll', 'edeltraud-wargh'],
  hallbjorn: ['hallbjorn-wargh', 'laufey-wellenschild'],
  ketill: ['freyrs-varulv', 'ketill-wargh'],
  ranveig: ['ranveig-wargh', 'gunnar-ragnulf'],
  torvar: ['torvar-wargh', 'gwenlyn-trachwyll'],
  thorgil: ['thorgil-wargh', 'freygunn-skogg'],
  olmar: ['olmar-wargh', 'asahel-gullvig'],
  agnar: ['agnar-wargh', 'ormrun-todbrand'],
  skegghild: ['skegghild-wargh', 'hjalprek-silberzunge'],
  hildessa: ['hildessa-wargh', 'durathor-vaeren'],
  hildegard: ['denawal-1724-arth', 'hildegard-wargh']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-ivar-meabh-wargh': COUPLES.founders,
  'marriage-holmdis-odvaldr-wargh': COUPLES.holmdis,
  'marriage-hoskuld-bergljot-wargh': COUPLES.hoskuld,
  'marriage-fjorlagr-elfrid-wargh': COUPLES.fjorlagr,
  'marriage-arnor-annegret-varulv': COUPLES.annegret,
  'marriage-thorgest-asdotta-wargh': COUPLES.thorgest,
  'marriage-geirlaug-thorsleikr-wargh': COUPLES.geirlaug,
  'marriage-thorald-vekatla-wargh': COUPLES.thorald,
  'marriage-bjorgolf-svanlaug-wargh': COUPLES.bjorgolf,
  'marriage-ingunn-hakon-wargh': COUPLES.ingunn,
  'marriage-kolbjorn-geirny-wargh': COUPLES.kolbjorn,
  'marriage-dagbjorg-gunnir-wargh': COUPLES.dagbjorg,
  'marriage-thorgal-skjoldrun-wargh': COUPLES.thorgal,
  'marriage-haldor-fridlaug-wargh': COUPLES.haldor,
  'marriage-harald-eyrun-wargh': COUPLES.harald,
  'marriage-hljotrun-gunnar-wargh': COUPLES.hljotrun,
  'marriage-herleif-fjorgyn-wargh': COUPLES.herleif,
  'marriage-asger-isrun-wargh': COUPLES.asger,
  'marriage-hogne-yngvild-wargh': COUPLES.hogne,
  'marriage-hroald-arnkatla-wargh': COUPLES.hroald,
  'marriage-torstein-malfrid-wargh': COUPLES.torstein,
  'marriage-solveig-kolbein-wargh': COUPLES.solveig,
  'marriage-heidrek-reifkatla-wargh': COUPLES.heidrek,
  'marriage-jorund-austveig-wargh': COUPLES.jorund,
  'marriage-angebroda-borg-skald': COUPLES.borg,
  'marriage-bylga-hogrand-wargh': COUPLES.bylga,
  'marriage-sverkel-torgunna-wargh': COUPLES.sverkel,
  'marriage-cadwallen-edeltraud-morthwyll': COUPLES.edeltraud,
  'marriage-hallbjorn-laufey-wargh': COUPLES.hallbjorn,
  'marriage-freyrs-ketill-varulv': COUPLES.ketill,
  'marriage-ranveig-gunnar-wargh': COUPLES.ranveig,
  'marriage-torvar-gwenlyn-wargh': COUPLES.torvar,
  'marriage-thorgil-freygunn-wargh': COUPLES.thorgil,
  'marriage-olmar-asahel-wargh': COUPLES.olmar,
  'marriage-agnar-ormrun-wargh': COUPLES.agnar,
  'marriage-skegghild-hjalprek-wargh': COUPLES.skegghild,
  'engagement-hildessa-durathor-wargh': COUPLES.hildessa,
  'engagement-denawal-hildegard': COUPLES.hildegard
});

function marriage(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'wargh-parentage',
    ...options
  });
}

function claimedChildren(childIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
    extensions: { timeJumpId }
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
      registryManagedFields: ['name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle']
    }
  });
}

function timeJump(id, parentPartnershipId, childIds, fromYear, toYear) {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear,
    toYear,
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner; der Zeitsprung wird nicht parallel zu Personen oder Hausknoten geführt.',
    extensions: {}
  };
}

export const HOUSE_WARGH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-wargh',
    title: 'Clan Wargh',
    motto: '',
    description: 'Jarlsclan von Ivarsheim und Herren von Ivarsfels. Die Hauptlinie führt ihre Gründung auf Ivar Wargh und Méabh Mac Lúin zurück.',
    emblem: HOUSE_EMBLEMS.wargh,
    houseProfile: ALDRIMAR_HOUSE_PROFILES.wargh
  },
  houses: [
    house(WARGH_HOUSE_ID, 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-mac-luin', 'Haus Mac Lúin', HOUSE_EMBLEMS['mac-luin']),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-feuerhaar', 'Clan Feuerhaar', HOUSE_EMBLEMS.feuerhaar),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg),
    house('house-silberzunge', 'Clan Silberzunge', HOUSE_EMBLEMS.silberzunge),
    house('house-trachwyll', 'Haus Trachwyll', HOUSE_EMBLEMS.trachwyll),
    house('house-grendel', 'Clan Grendel', HOUSE_EMBLEMS.grendel),
    house('house-hyrmgardr', 'Clan Hyrmgarthr', HOUSE_EMBLEMS.hyrmgarthr),
    house('house-blutklinge', 'Haus Blutklinge', HOUSE_EMBLEMS.blutklinge),
    house('house-windhueter', 'Haus Windhüter', HOUSE_EMBLEMS.windhueter),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-morthwyll', 'Haus Morthwyll', HOUSE_EMBLEMS.morthwyll),
    house('house-schmetterschild', 'Clan Schmetterschild'),
    house('house-riesentod', 'Clan Riesentod'),
    house('house-helgr', 'Clan Helgr'),
    house('house-kummerherz', 'Clan Kummerherz'),
    house('house-wellenschild', 'Clan Wellenschild'),
    house('house-gullvig', 'Clan Gullvig', HOUSE_EMBLEMS.gullvig),
    house('house-todbrand', 'Clan Todbrand'),
    house('house-arth', "Haus Arth O'Talgarth", HOUSE_EMBLEMS.arth)
  ],
  persons: [
    person('ivar-wargh', 'Ivar Wargh', 'male', '????', '????', { title: 'Gründer und erster Jarl des Clans Wargh' }),
    spouse('meabh-mac-luin', 'Méabh Mac Lúin', 'female', '????', '????', 'house-mac-luin'),

    awayWoman('holmdis-wargh', 'Hólmdís Wargh', '????', '????', 'Clan Varangr'),
    spouse('odvaldr-varangr', 'Odvaldr Varangr', 'male', '????', '????', 'house-varangr'),
    person('hoskuld-wargh', 'Hoskuld Wargh', 'male', '????', '????', { title: 'Jarl des Clans Wargh' }),
    spouse('bergljot-vaeren', 'Bergljót Vaeren', 'female', '????', '????', 'house-vaeren'),

    person('fjorlagr-wargh', 'Fjorlagr Wargh', 'male', '1256', '1304', { title: 'Jarl des Clans Wargh' }),
    spouse('elfrid-blutklinge', 'Elfrid Blutklinge', 'female', '1260', '1321', 'house-blutklinge'),
    awayWoman('annegret-wargh', 'Annegret Wargh', '1262', '1304', 'Clan Varulv'),
    spouse('arnor-varulv', 'Arnór Varulv', 'male', '1257', '1309', 'house-varulv'),

    person('thorgest-wargh', 'Thorgest Wargh', 'male', '1540', '1577', { title: 'Jarl des Clans Wargh' }),
    spouse('asdotta', 'Ásdotta', 'female', '1547', '1588', '', {
      notes: 'Die Partnerzeile nennt Ásdotta; eine Gruppenüberschrift der Quelle schreibt abweichend Ásmotta.'
    }),
    awayWoman('geirlaug-wargh', 'Geirlaug Wargh', '1543', '1609', 'Clan Feuerhaar'),
    spouse('thorsleikr-feuerhaar', 'Thorsleikr Feuerhaar', 'male', '1541', '1604', 'house-feuerhaar'),
    person('thorald-wargh', 'Thorald Wargh', 'male', '1545', '1588', { title: 'Jarl des Clans Wargh' }),
    spouse('vekatla-windhueter', 'Vékatla Windhüter', 'female', '1546', '1598', 'house-windhueter'),

    person('bjorgolf-wargh', 'Bjorgolf Wargh', 'male', '1571', '1621', {
      notes: 'Das Geburtsjahr wurde aus dem unmöglichen Quellenwert 1671 auf 1571 berichtigt.'
    }),
    spouse('svanlaug', 'Svanlaug', 'female', '1579', '1620'),
    awayWoman('ingunn-wargh', 'Ingunn Wargh', '1573', '1625', 'Clan Schmetterschild', {
      notes: 'Das Geburtsjahr wurde aus dem unmöglichen Quellenwert 1673 auf 1573 berichtigt.'
    }),
    spouse('hakon-schmetterschild', 'Hakon Schmetterschild', 'male', '1572', '1609', 'house-schmetterschild'),
    person('kolbjorn-wargh', 'Kolbjorn Wargh', 'male', '1567', '1615', { title: 'Jarl des Clans Wargh' }),
    spouse('geirny-riesentod', 'Geirný Riesentod', 'female', '1568', '1700', 'house-riesentod'),
    awayWoman('dagbjorg-wargh', 'Dagbjorg Wargh', '1570', '1641', 'Clan Hyrmgarthr'),
    spouse('gunnir-hyrmgarthr', 'Gunnir Hyrmgarthr', 'male', '1574', '1659', 'house-hyrmgardr', {
      worldPersonId: 'person--haus-hyrmgarthr--gunnir-hyrmgarthr',
      notes: 'Der Quellenname Hrymgarðr wurde auf den bereits festgelegten Registernamen Hyrmgarthr normalisiert. Die alte Weltpersonen-ID bleibt stabil; das Zielhaus verwendet die tatsächliche Register-ID haus-hyrmgardr.'
    }),

    person('thorgal-wargh', 'Thorgal Wargh', 'male', '1601', '1627'),
    spouse('skjoldrun-windhueter', 'Skjóldrún Windhüter', 'female', '1604', '1627', 'house-windhueter'),
    person('haldor-wargh', 'Haldor Wargh', 'male', '1604', '1627'),
    spouse('fridlaug-blutklinge', 'Fridlaug Blutklinge', 'female', '1605', '1627', 'house-blutklinge'),
    person('harald-wargh', 'Harald Wargh', 'male', '1586', '1627', { title: 'Jarl des Clans Wargh' }),
    spouse('eyrun-skogg', 'Eyrún Skogg', 'female', '1587', '1605', 'house-skogg'),
    awayWoman('hljotrun-wargh', 'Hljótrún Wargh', '1589', '1641', 'Clan Grendel'),
    spouse('gunnar-grendel', 'Gunnar Grendel', 'male', '1585', '1625', 'house-grendel'),
    person('herleif-wargh', 'Herleif Wargh', 'male', '1591', '1629'),
    spouse('fjorgyn-helgr', 'Fjörgyn Helgr', 'female', '1593', '1629', 'house-helgr', {
      notes: 'Der beschädigte Quellenname „FjÇ«rgyn“ wurde als Fjörgyn normalisiert.'
    }),

    person('tigrun-wargh', 'Tigrún Wargh', 'female', '1623', '1720'),
    person('asger-wargh', 'Asger Wargh', 'male', '1605', '1689', { title: 'Jarl des Clans Wargh' }),
    spouse('isrun-silberzunge', 'Ísrún Silberzunge', 'female', '1627', '1685', 'house-silberzunge'),
    person('hogne-wargh', 'Hogne Wargh', 'male', '1614', '1679'),
    spouse('yngvild-skaal', 'Yngvild Skaal', 'female', '1616', '1650', 'house-skaal'),
    person('hroald-wargh', 'Hroald Wargh', 'male', '1617', '1691'),
    spouse('arnkatla', 'Arnkatla', 'female', '1620', '????'),

    person('torstein-wargh', 'Torstein Wargh', 'male', '1646', '1699', { title: 'Jarl des Clans Wargh' }),
    spouse('malfrid-feuerhaar', 'Malfrid Feuerhaar', 'female', '1648', '1701', 'house-feuerhaar', {
      notes: 'Die ausgearbeitete Feuerhaar-Gegenakte präzisiert das zuvor offene Todesjahr auf 1701.'
    }),
    awayWoman('solveig-wargh', 'Solveig Wargh', '1650', '1719', 'Clan Grendel'),
    spouse('kolbein-grendel', 'Kolbein Grendel', 'male', '1649', '1725', 'house-grendel'),
    person('heidrek-wargh', 'Heidrek Wargh', 'male', '1636', '1693'),
    spouse('reifkatla', 'Reifkatla', 'female', '1639', '1700'),
    person('jorund-wargh', 'Jorund Wargh', 'male', '1641', '1695'),
    spouse('austveig', 'Austveig', 'female', '1642', '1701'),

    person('borg-wargh', 'Borg Wargh', 'male', '1667', '1734', { title: 'Jarl des Clans Wargh' }),
    spouse('angebroda-skald', 'Angebroda Skald', 'female', '1670', '', 'house-skald'),
    awayWoman('bylga-wargh', 'Bylga Wargh', '1673', '????', 'Clan Kummerherz'),
    spouse('hogrand-kummerherz', 'Hogrand Kummerherz', 'male', '1671', '????', 'house-kummerherz'),
    person('sverkel-wargh', 'Sverkel Wargh', 'male', '1664', '????', {
      extensions: { chartPartnerMirrorForPartnershipIds: ['marriage-sverkel-torgunna-wargh'] }
    }),
    person('torgunna-wargh', 'Torgunna Wargh', 'female', '1663', '????', {
      extensions: { chartRepeatForPartnershipIds: ['marriage-sverkel-torgunna-wargh'] }
    }),
    awayWoman('edeltraud-wargh', 'Edeltraud Wargh', '1660', '1723', 'Haus Morthwyll'),
    spouse('cadwallen-morthwyll', 'Cadwallen Morthwyll', 'male', '1659', '1725', 'house-morthwyll'),
    person('hallbjorn-wargh', 'Hallbjorn Wargh', 'male', '1671', '????'),
    spouse('laufey-wellenschild', 'Laufey Wellenschild', 'female', '1674', '????', 'house-wellenschild'),

    person('ketill-wargh', 'Ketill Wargh', 'male', '1693', '', { title: 'Jarl von Ivarsheim seit 1734' }),
    spouse('freyrs-varulv', 'Freyrs Varulv', 'female', '1698', '', 'house-varulv'),
    awayWoman('ranveig-wargh', 'Ranveig Wargh', '1702', '', 'Clan Ragnulf'),
    spouse('gunnar-ragnulf', 'Gunnar Ragnulf', 'male', '1699', '', 'house-ragnulf'),
    person('torvar-wargh', 'Torvar Wargh', 'male', '1697', ''),
    spouse('gwenlyn-trachwyll', 'Gwenlyn Trachwyll', 'female', '1702', '', 'house-trachwyll'),
    person('thorgil-wargh', 'Thorgil Wargh', 'male', '1695', ''),
    spouse('freygunn-skogg', 'Freygunn Skogg', 'female', '1699', '', 'house-skogg'),
    person('olmar-wargh', 'Olmar Wargh', 'male', '1699', '????'),
    spouse('asahel-gullvig', 'Ásahel Gullvig', 'female', '1704', '????', 'house-gullvig'),
    person('agnar-wargh', 'Agnar Wargh', 'male', '1698', '????'),
    spouse('ormrun-todbrand', 'Ormrún Todbrand', 'female', '1703', '????', 'house-todbrand'),
    awayWoman('skegghild-wargh', 'Skegghild Wargh', '1702', '', 'Clan Silberzunge'),
    spouse('hjalprek-silberzunge', 'Hjalprek Silberzunge', 'male', '1697', '', 'house-silberzunge'),

    person('halskar-wargh', 'Halskar Wargh', 'male', '1718', '', { title: 'Erster Erbe des Clans Wargh' }),
    awayWoman('hildessa-wargh', 'Hildessa Wargh', '1719', '', 'Clan Vaeren', {
      engaged: true,
      title: 'Wegverlobt an Clan Vaeren'
    }),
    awayWoman('hildegard-wargh', 'Hildegard Wargh', '1724', '', "Haus Arth O'Talgarth", {
      engaged: true,
      title: "Wegverlobt an Haus Arth O'Talgarth"
    }),
    ward('denawal-1724-arth', 'Denawal Arth', 'male', '1724', 'house-arth', {
      title: 'Mündel Ketill Warghs · Verlobter Hildegards'
    }),
    ward('durathor-vaeren', 'Durathor Vaeren', 'male', '1722', 'house-vaeren', {
      title: 'Mündel Ketill Warghs · Verlobter Hildessas'
    }),
    person('hjalmar-wargh', 'Hjálmar Wargh', 'male', '1720', ''),
    person('ingiborgh-wargh', 'Ingiborgh Wargh', 'female', '1725', ''),
    person('valtyr-wargh', 'Valtyr Wargh', 'male', '1722', ''),
    person('roska-wargh', 'Róska Wargh', 'female', '1724', ''),
    person('lodinn-wargh', 'Lodinn Wargh', 'male', '1719', ''),
    person('glaumur-wargh', 'Glaumur Wargh', 'male', '1723', ''),
    person('dreki-wargh', 'Dreki Wargh', 'male', '1726', '')
  ],
  partnerships: [
    marriage('marriage-ivar-meabh-wargh', { status: 'ended' }),
    marriage('marriage-holmdis-odvaldr-wargh', { status: 'ended' }),
    marriage('marriage-hoskuld-bergljot-wargh', { status: 'ended' }),
    marriage('marriage-fjorlagr-elfrid-wargh', { status: 'ended', end: '1304' }),
    marriage('marriage-arnor-annegret-varulv', { status: 'ended', end: '1304' }),
    marriage('marriage-thorgest-asdotta-wargh', { status: 'ended', end: '1577' }),
    marriage('marriage-geirlaug-thorsleikr-wargh', { status: 'ended', end: '1604' }),
    marriage('marriage-thorald-vekatla-wargh', { status: 'ended', end: '1588' }),
    marriage('marriage-bjorgolf-svanlaug-wargh', { status: 'ended', end: '1620' }),
    marriage('marriage-ingunn-hakon-wargh', { status: 'ended', end: '1609' }),
    marriage('marriage-kolbjorn-geirny-wargh', { status: 'ended', end: '1615' }),
    marriage('marriage-dagbjorg-gunnir-wargh', { status: 'ended', end: '1641' }),
    marriage('marriage-thorgal-skjoldrun-wargh', { status: 'ended', end: '1627' }),
    marriage('marriage-haldor-fridlaug-wargh', { status: 'ended', end: '1627' }),
    marriage('marriage-harald-eyrun-wargh', { status: 'ended', end: '1605' }),
    marriage('marriage-hljotrun-gunnar-wargh', { status: 'ended', end: '1625' }),
    marriage('marriage-herleif-fjorgyn-wargh', { status: 'ended', end: '1629' }),
    marriage('marriage-asger-isrun-wargh', { status: 'ended', end: '1685' }),
    marriage('marriage-hogne-yngvild-wargh', { status: 'ended', end: '1650' }),
    marriage('marriage-hroald-arnkatla-wargh', { status: 'ended', end: '1691' }),
    marriage('marriage-torstein-malfrid-wargh', { status: 'ended', end: '1699' }),
    marriage('marriage-solveig-kolbein-wargh', { status: 'ended', end: '1719' }),
    marriage('marriage-heidrek-reifkatla-wargh', { status: 'ended', end: '1693' }),
    marriage('marriage-jorund-austveig-wargh', { status: 'ended', end: '1695' }),
    marriage('marriage-angebroda-borg-skald', { status: 'widowed', end: '1734' }),
    marriage('marriage-bylga-hogrand-wargh', { status: 'ended' }),
    marriage('marriage-sverkel-torgunna-wargh'),
    marriage('marriage-cadwallen-edeltraud-morthwyll', { status: 'ended', end: '1723' }),
    marriage('marriage-hallbjorn-laufey-wargh'),
    marriage('marriage-freyrs-ketill-varulv'),
    marriage('marriage-ranveig-gunnar-wargh'),
    marriage('marriage-torvar-gwenlyn-wargh'),
    marriage('marriage-thorgil-freygunn-wargh'),
    marriage('marriage-olmar-asahel-wargh'),
    marriage('marriage-agnar-ormrun-wargh'),
    marriage('marriage-skegghild-hjalprek-wargh'),
    marriage('engagement-hildessa-durathor-wargh', { type: 'engagement' }),
    marriage('engagement-denawal-hildegard', { type: 'engagement' })
  ],
  parentages: [
    ...claimedChildren(['holmdis-wargh', 'hoskuld-wargh'], 'marriage-ivar-meabh-wargh', 'gap-ivar-hoskuld-wargh'),
    ...claimedChildren(['fjorlagr-wargh', 'annegret-wargh'], 'marriage-hoskuld-bergljot-wargh', 'gap-hoskuld-fjorlagr-wargh'),
    ...claimedChildren(['thorgest-wargh', 'geirlaug-wargh', 'thorald-wargh'], 'marriage-fjorlagr-elfrid-wargh', 'gap-fjorlagr-thorgest-wargh'),
    ...childrenOf(['bjorgolf-wargh', 'ingunn-wargh'], 'marriage-thorgest-asdotta-wargh'),
    ...childrenOf(['kolbjorn-wargh', 'dagbjorg-wargh'], 'marriage-thorald-vekatla-wargh'),
    ...childrenOf(['thorgal-wargh', 'haldor-wargh'], 'marriage-bjorgolf-svanlaug-wargh'),
    ...childrenOf(['harald-wargh', 'hljotrun-wargh', 'herleif-wargh'], 'marriage-kolbjorn-geirny-wargh'),
    ...childrenOf(['tigrun-wargh'], 'marriage-thorgal-skjoldrun-wargh'),
    ...childrenOf(['asger-wargh'], 'marriage-harald-eyrun-wargh'),
    ...childrenOf(['hogne-wargh', 'hroald-wargh'], 'marriage-herleif-fjorgyn-wargh'),
    ...childrenOf(['torstein-wargh', 'solveig-wargh'], 'marriage-asger-isrun-wargh'),
    ...childrenOf(['heidrek-wargh'], 'marriage-hogne-yngvild-wargh'),
    ...childrenOf(['jorund-wargh'], 'marriage-hroald-arnkatla-wargh'),
    ...childrenOf(['borg-wargh', 'bylga-wargh'], 'marriage-torstein-malfrid-wargh'),
    ...childrenOf(['sverkel-wargh'], 'marriage-heidrek-reifkatla-wargh'),
    ...childrenOf(['torgunna-wargh', 'edeltraud-wargh', 'hallbjorn-wargh'], 'marriage-jorund-austveig-wargh'),
    ...childrenOf(['ketill-wargh', 'ranveig-wargh'], 'marriage-angebroda-borg-skald'),
    ...childrenOf(['torvar-wargh', 'thorgil-wargh', 'olmar-wargh'], 'marriage-sverkel-torgunna-wargh'),
    ...childrenOf(['agnar-wargh', 'skegghild-wargh'], 'marriage-hallbjorn-laufey-wargh'),
    ...childrenOf(['halskar-wargh', 'hildessa-wargh', 'hildegard-wargh'], 'marriage-freyrs-ketill-varulv'),
    ...childrenOf(['hjalmar-wargh', 'ingiborgh-wargh'], 'marriage-torvar-gwenlyn-wargh'),
    ...childrenOf(['valtyr-wargh', 'roska-wargh'], 'marriage-thorgil-freygunn-wargh'),
    ...childrenOf(['lodinn-wargh', 'glaumur-wargh'], 'marriage-olmar-asahel-wargh'),
    ...childrenOf(['dreki-wargh'], 'marriage-agnar-ormrun-wargh'),
    ...createParentages(['denawal-1724-arth', 'durathor-vaeren'], ['ketill-wargh'], '', {
      idPrefix: 'wargh-wardship',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Beide jungen Männer sind als aufgenommene Mündel Ketill Warghs verzeichnet.'
    })
  ],
  cadetBranches: [
    marriedAway('married-away-holmdis-wargh-varangr', 'Clan Varangr', 'marriage-holmdis-odvaldr-wargh', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-annegret-wargh-varulv', 'Clan Varulv', 'marriage-arnor-annegret-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-geirlaug-wargh-feuerhaar', 'Clan Feuerhaar', 'marriage-geirlaug-thorsleikr-wargh', 'house-feuerhaar', 'haus-feuerhaar', HOUSE_EMBLEMS.feuerhaar),
    marriedAway('married-away-ingunn-wargh-schmetterschild', 'Clan Schmetterschild', 'marriage-ingunn-hakon-wargh', 'house-schmetterschild', 'haus-schmetterschild'),
    marriedAway('married-away-dagbjorg-wargh-hyrmgarthr', 'Clan Hyrmgarthr', 'marriage-dagbjorg-gunnir-wargh', 'house-hyrmgardr', 'haus-hyrmgardr', HOUSE_EMBLEMS.hyrmgarthr),
    marriedAway('married-away-hljotrun-wargh-grendel', 'Clan Grendel', 'marriage-hljotrun-gunnar-wargh', 'house-grendel', 'haus-grendel', HOUSE_EMBLEMS.grendel),
    marriedAway('married-away-solveig-wargh-grendel', 'Clan Grendel', 'marriage-solveig-kolbein-wargh', 'house-grendel', 'haus-grendel', HOUSE_EMBLEMS.grendel),
    marriedAway('married-away-bylga-wargh-kummerherz', 'Clan Kummerherz', 'marriage-bylga-hogrand-wargh', 'house-kummerherz', 'haus-kummerherz'),
    marriedAway('married-away-edeltraud-wargh-morthwyll', 'Haus Morthwyll', 'marriage-cadwallen-edeltraud-morthwyll', 'house-morthwyll', 'haus-morthwyll', HOUSE_EMBLEMS.morthwyll),
    marriedAway('married-away-ranveig-wargh-ragnulf', 'Clan Ragnulf', 'marriage-ranveig-gunnar-wargh', 'house-ragnulf', 'haus-ragnulf', HOUSE_EMBLEMS.ragnulf),
    marriedAway('married-away-skegghild-wargh-silberzunge', 'Clan Silberzunge', 'marriage-skegghild-hjalprek-wargh', 'house-silberzunge', 'haus-silberzunge', HOUSE_EMBLEMS.silberzunge),
    marriedAway('engaged-away-hildessa-wargh-vaeren', 'Clan Vaeren', 'engagement-hildessa-durathor-wargh', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren, 'Wegverlobt an Clan Vaeren'),
    marriedAway('engaged-away-hildegard-wargh-arth', "Haus Arth O'Talgarth", 'engagement-denawal-hildegard', 'house-arth', 'haus-arth', HOUSE_EMBLEMS.arth, "Wegverlobt an Haus Arth O'Talgarth")
  ],
  timeJumps: [
    timeJump('gap-ivar-hoskuld-wargh', 'marriage-ivar-meabh-wargh', ['holmdis-wargh', 'hoskuld-wargh'], '????', '????'),
    timeJump('gap-hoskuld-fjorlagr-wargh', 'marriage-hoskuld-bergljot-wargh', ['fjorlagr-wargh', 'annegret-wargh'], '????', '1256'),
    timeJump('gap-fjorlagr-thorgest-wargh', 'marriage-fjorlagr-elfrid-wargh', ['thorgest-wargh', 'geirlaug-wargh', 'thorald-wargh'], '1304', '1540')
  ],
  lineage: {
    founderPartnershipId: 'marriage-ivar-meabh-wargh',
    houseId: WARGH_HOUSE_ID,
    crestSubtitle: 'Jarlsclan von Ivarsheim · Sitz Ivarsfels',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ivar-wargh',
    orientation: 'vertical',
    ancestorDepth: 28,
    descendantDepth: 28,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 6,
    sourceModule: 'Clan Wargh (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Stammbaum wurde ohne Personenfokus übernommen. Drei Quellenlücken sind strikt serielle Zeitsprünge. Verheiratete oder verlobte Wargh-Frauen erhalten direkte Zielhausknoten; Kinder werden nur in der führenden Linie fortgesetzt. Die Gegenakten Varulv, Skaal, Skald, Morthwyll, Arth, Skogg und Silberzunge teilen Weltpersonen, Partnerschaften und Porträts mit dieser Akte. Korrigiert wurden Bjorgolf 1671→1571, Ingunn 1673→1573 sowie Hildegard und Denawal 1624→1724. Die Gruppenspalten ordnen Asger Harald und Eyrún sowie Hogne und Hroald Herleif und Fjörgyn zu. Thorgil Wargh und Freygunn Skogg werden nach der Skogg-Gegenakte als lebend geführt; Skegghild Wargh und Hjalprek Silberzunge werden nach der Silberzungen-Gegenakte ebenfalls als lebend geführt, da ihre offenen Todesfelder keine Todesfälle bezeichnen. Ásdotta/Ásmotta, widersprüchliche Altersangaben zu Thorgal und Haldor, der Todeshergang der Brüder sowie die widersprüchliche Jarlfolge um Asger bleiben als Quellenkonflikte dokumentiert. Der veraltete Sitz Rorikshall wurde nicht übernommen; die gültige Registergliederung führt Wargh in Ivarsfels. Hyrmgarthr, Grendel und Trachwyll O\'Talfronwyn folgen den bereits festgelegten Registernamen. Die ausgearbeitete Grendel-Gegenakte präzisiert Kolbein Grendels Todesjahr auf 1725.',
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
