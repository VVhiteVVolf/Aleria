import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_LLWYNOG_PORTRAITS } from './house-llwynog-portraits.js';
import {
  SONNENKUESTE_HOUSE_EMBLEMS,
  SONNENKUESTE_HOUSE_PROFILES
} from './sonnenkueste-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const LLWYNOG_HOUSE_ID = 'house-llwynog';
const LLWYNOG_EMBLEM = SONNENKUESTE_HOUSE_EMBLEMS.llwynog;

const HOUSE_EMBLEMS = Object.freeze({
  baedd: '',
  blach: SONNENKUESTE_HOUSE_EMBLEMS.blach,
  ceirwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn,
  cleir: '',
  creyr: 'assets/images/houses/Weidebucht/haus-creyr.png',
  dinefwr: '',
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  ghaiscioch: '',
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  hebog: '',
  illewod: SONNENKUESTE_HOUSE_EMBLEMS.illewod,
  illwath: SONNENKUESTE_HOUSE_EMBLEMS.illwath,
  morforwyn: SONNENKUESTE_HOUSE_EMBLEMS.morforwyn,
  pyrth: '',
  teyrngarch: SONNENKUESTE_HOUSE_EMBLEMS.teyrngarch,
  tiwna: '',
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
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

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    houseId: options.houseId === undefined ? LLWYNOG_HOUSE_ID : options.houseId,
    portrait: HOUSE_LLWYNOG_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    status: options.status || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouse, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouse}`,
    tags: options.tags || ['Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['marwynne-illewod', 'pebin-fuchs'],
  penkawr: ['rheuwen-blach', 'penkawr-llwynog'],
  nerys: ['penryn-illewod', 'nerys-llwynog'],
  heveydd: ['heveydd-llwynog', 'kerrilynn-ceirwyn'],
  teleri: ['tallwch-illewod', 'teleri-llwynog'],
  rhydderch: ['siani-wylan', 'rhydderch-llwynog'],
  maddison: ['maddison-llwynog', 'govynyon-dinefwr'],
  siriol: ['seithved-teyrngarch', 'siriol-llwynog'],
  rhynnon: ['eira-dyngwn', 'rhynnon-llwynog'],
  aeronwen: ['aeronwen-llwynog', 'rhun-baedd'],
  rhondda: ['ehangwen-illewod', 'rhondda-llwynog'],
  anarawd: ['malt-wylan', 'anarawd-llwynog'],
  arvonia: ['arvonia-llwynog', 'yspaddaden-pyrth'],
  enid: ['cloi-grawn', 'enid-llwynog'],
  edwynna: ['edwynna-llwynog', 'tarian-tiwna'],
  eurig: ['artura-blach', 'eurig-llwynog'],
  ieuan: ['kerris-illewod', 'ieuan-llwynog'],
  myfanwy: ['myfanwy-llwynog', 'darragh-ua-ghaiscioch'],
  bevan: ['bevan-llwynog', 'mairead-cleir'],
  tudwallon: ['aerwyn-gafyr', 'tudwallon-lwynog'],
  rhosyn: ['rhosyn-llwynog', 'cadoc-creyr'],
  colwin: ['colwin-llwynog', 'glynis-morforwyn'],
  brina: ['brina-llwynog', 'eurig-hebog']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-marwynne-pebin': COUPLES.founders,
  'marriage-rheuwen-penkawr-blach': COUPLES.penkawr,
  'marriage-penryn-nerys': COUPLES.nerys,
  'marriage-heveydd-kerrilynn-llwynog': COUPLES.heveydd,
  'marriage-tallwch-teleri': COUPLES.teleri,
  'marriage-siani-rhydderch': COUPLES.rhydderch,
  'marriage-maddison-govynyon-llwynog': COUPLES.maddison,
  'marriage-seithved-siriol-teyrngarch': COUPLES.siriol,
  'marriage-eira-rhynnon-dyngwn': COUPLES.rhynnon,
  'marriage-aeronwen-rhun-llwynog': COUPLES.aeronwen,
  'marriage-ehangwen-rhondda': COUPLES.rhondda,
  'marriage-malt-anarawd': COUPLES.anarawd,
  'marriage-arvonia-yspaddaden-llwynog': COUPLES.arvonia,
  'marriage-cloi-enid': COUPLES.enid,
  'marriage-edwynna-tarian-llwynog': COUPLES.edwynna,
  'marriage-artura-eurig-blach': COUPLES.eurig,
  'marriage-kerris-ieuan': COUPLES.ieuan,
  'marriage-myfanwy-darragh-llwynog': COUPLES.myfanwy,
  'marriage-bevan-mairead-llwynog': COUPLES.bevan,
  'marriage-aerwyn-tudwallon': COUPLES.tudwallon,
  'marriage-rhosyn-cadoc-llwynog': COUPLES.rhosyn,
  'marriage-colwin-glynis-llwynog': COUPLES.colwin,
  'engagement-brina-eurig-hebog-llwynog': COUPLES.brina
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'llwynog-parentage', ...options }
  );
}

function marriedAway(id, name, partnershipId, houseId, options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem: options.emblem || '',
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || ''
  });
}

export const HOUSE_LLWYNOG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-llwynog',
    title: "Haus Llwynog O'Aberon",
    motto: 'Die Jagd lehrt Geduld, der Wald lehrt Weisheit.',
    description: 'Altes ritterfürstliches Waldläufer-, Jagd- und Hundezüchterhaus aus Aberon. Das von Pebin dem Fuchs und Marwynne Illewod begründete Geschlecht dient den Illewod als nördlicher Schutz der Sonnenküste.',
    emblem: LLWYNOG_EMBLEM,
    houseProfile: SONNENKUESTE_HOUSE_PROFILES.llwynog
  },
  houses: [
    house(LLWYNOG_HOUSE_ID, "Haus Llwynog O'Aberon", LLWYNOG_EMBLEM),
    house('house-illewod', "Haus Illewod O'Aberon", HOUSE_EMBLEMS.illewod),
    house('house-illwath', "Haus Illwath O'Caer Llew", HOUSE_EMBLEMS.illwath),
    house('house-blach', "Haus Blach O'Aberon", HOUSE_EMBLEMS.blach),
    house('house-ceirwyn', 'Haus Ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-dinefwr', 'Haus Dinefwr', HOUSE_EMBLEMS.dinefwr),
    house('house-teyrngarch', 'Haus Teyrngarch', HOUSE_EMBLEMS.teyrngarch),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-baedd', 'Haus Baedd', HOUSE_EMBLEMS.baedd),
    house('house-pyrth', 'Haus Pyrth', HOUSE_EMBLEMS.pyrth),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-tiwna', 'Haus Tiwna', HOUSE_EMBLEMS.tiwna),
    house('house-ghaiscioch', 'Haus Ghaiscíoch', HOUSE_EMBLEMS.ghaiscioch),
    house('house-cleir', 'Haus Cléir', HOUSE_EMBLEMS.cleir),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr),
    house('house-morforwyn', 'Haus Morforwyn', HOUSE_EMBLEMS.morforwyn),
    house('house-hebog', 'Haus Hebog', HOUSE_EMBLEMS.hebog)
  ],
  persons: [
    person('pebin-fuchs', 'Pebin der Fuchs', 'male', '????', '????', {
      worldPersonId: 'person--family-tree--pebin-fuchs',
      title: 'Gründer und erster Ritterfürst des Hauses Llwynog',
      lineageRole: 'head'
    }),
    spouse('marwynne-illewod', 'Marwynne Illewod', 'female', '????', '????', {
      houseId: 'house-illewod',
      title: 'Mitgründerin des Hauses Llwynog'
    }),

    person('penkawr-llwynog', 'Penkawr Llwynog', 'male', '1247', '1288', {
      title: 'Ritterfürst des Hauses Llwynog bis 1288',
      lineageRole: 'head'
    }),
    awayWoman('nerys-llwynog', 'Nerys Llwynog', '1250', '1315', 'Haus Illewod'),
    spouse('rheuwen-blach', 'Rheuwen Blach', 'female', '1250', '1300', {
      houseId: 'house-blach'
    }),
    spouse('penryn-illewod', 'Penryn Illewod', 'male', '1248', '1281', {
      houseId: 'house-illewod'
    }),

    person('heveydd-llwynog', 'Heveydd Llwynog', 'male', '1585', '1635', {
      title: 'Ritterfürst des Hauses Llwynog bis 1635',
      lineageRole: 'head'
    }),
    person('ginevra-llwynog', 'Ginevra Llwynog', 'female', '1587', ''),
    awayWoman('teleri-llwynog', 'Teleri Llwynog', '1589', '1671', 'Haus Illewod'),
    spouse('kerrilynn-ceirwyn', 'Kerrilynn Ceirwyn', 'female', '1592', '1677', {
      houseId: 'house-ceirwyn',
      notes: 'Die Ceirwyn-Gegenakte belegt 1592–1677; die Llwynog-Tabelle nennt abweichend 1590 und kein Todesjahr.'
    }),
    spouse('tallwch-illewod', 'Tallwch Illewod', 'male', '1586', '1669', {
      houseId: 'house-illewod'
    }),

    person('rhydderch-llwynog', 'Rhydderch Llwynog', 'male', '1624', '1696', {
      title: 'Ritterfürst des Hauses Llwynog von 1653 bis 1696',
      lineageRole: 'head'
    }),
    awayWoman('maddison-llwynog', 'Maddison Llwynog', '1631', '1704', 'Haus Dinefwr'),
    awayWoman('siriol-llwynog', 'Siriol Llwynog', '1633', '1711', 'Haus Teyrngarch'),
    spouse('siani-wylan', 'Siani Wylan', 'female', '1631', '1704', {
      houseId: 'house-wylan'
    }),
    spouse('govynyon-dinefwr', 'Govynyon Dinefwr', 'male', '1628', '1689', {
      houseId: 'house-dinefwr'
    }),
    spouse('seithved-teyrngarch', 'Seithved Teyrngarch', 'male', '1630', '1691', {
      houseId: 'house-teyrngarch'
    }),

    person('rhynnon-llwynog', 'Rhynnon Llwynog', 'male', '1652', '1717', {
      title: 'Ritterfürst des Hauses Llwynog von 1696 bis 1717',
      lineageRole: 'head'
    }),
    awayWoman('aeronwen-llwynog', 'Aeronwen Llwynog', '1654', '1703', 'Haus Baedd'),
    person('rhondda-llwynog', 'Rhondda Llwynog', 'female', '1654', '1734'),
    spouse('eira-dyngwn', 'Eira Dyngwn', 'female', '1653', '1735', {
      houseId: 'house-dyngwn'
    }),
    spouse('rhun-baedd', 'Rhun Baedd', 'male', '1650', '1720', {
      houseId: 'house-baedd'
    }),
    spouse('ehangwen-illewod', 'Ehangwen Illewod', 'male', '1652', '1720', {
      houseId: 'house-illewod'
    }),

    person('anarawd-llwynog', 'Anarawd Llwynog', 'male', '1671', '', {
      title: 'Ritterfürst · Oberhaupt des Hauses Llwynog seit 1717',
      lineageRole: 'head'
    }),
    awayWoman('arvonia-llwynog', 'Arvonia Llwynog', '1674', '', 'Haus Pyrth'),
    awayWoman('enid-llwynog', 'Enid Llwynog', '1674', '', 'Haus Grawn'),
    awayWoman('edwynna-llwynog', 'Edwynna Llwynog', '1674', '', 'Haus Tiwna'),
    person('eurig-llwynog', 'Eurig Llwynog', 'male', '1676', ''),
    spouse('malt-wylan', 'Malt Wylan', 'female', '1678', '', {
      houseId: 'house-wylan',
      notes: 'Die Llwynog-Tabelle schreibt den Namen Mallt; die bestehende Wylan-Gegenakte führt dieselbe Weltperson als Malt.'
    }),
    spouse('yspaddaden-pyrth', 'Yspaddaden Pyrth', 'male', '1672', '', {
      houseId: 'house-pyrth'
    }),
    spouse('cloi-grawn', 'Cloi Grawn', 'male', '1668', '', {
      houseId: 'house-grawn'
    }),
    spouse('tarian-tiwna', 'Tarian Tiwna', 'male', '1672', '1720', {
      houseId: 'house-tiwna'
    }),
    spouse('artura-blach', 'Artura Blach', 'female', '1677', '', {
      houseId: 'house-blach'
    }),

    person('ieuan-llwynog', 'Ieuan Llwynog', 'male', '1694', '', {
      title: 'Erster Erbe des Hauses Llwynog',
      lineageRole: 'mainline'
    }),
    awayWoman('myfanwy-llwynog', 'Myfanwy Llwynog', '1696', '', 'Haus Ghaiscíoch'),
    person('bevan-llwynog', 'Bevan Llwynog', 'male', '1698', ''),
    person('tudwallon-lwynog', 'Tudwallon Llwynog', 'male', '1695', '', {
      worldPersonId: 'person--haus-llwynog--tudwallon-lwynog',
      notes: 'Die technische Personen-ID bleibt wegen der älteren Gafyr-Gegenakte mit einem l in „lwynog“ erhalten; der sichtbare Hausname ist korrigiert.'
    }),
    awayWoman('rhosyn-llwynog', 'Rhosyn Llwynog', '1698', '', 'Haus Créyr'),
    person('colwin-llwynog', 'Colwin Llwynog', 'male', '1700', ''),
    spouse('kerris-illewod', 'Kerris Illewod', 'female', '1695', '', {
      houseId: 'house-illewod'
    }),
    spouse('darragh-ua-ghaiscioch', "Darragh Ua'Ghaiscíoch", 'male', '1696', '', {
      houseId: 'house-ghaiscioch'
    }),
    spouse('mairead-cleir', 'Mairead Cléir', 'female', '1700', '', {
      houseId: 'house-cleir'
    }),
    spouse('aerwyn-gafyr', 'Aerwyn Gafyr', 'female', '1699', '', {
      houseId: 'house-gafyr'
    }),
    spouse('cadoc-creyr', 'Cadoc Créyr', 'male', '1691', '', {
      houseId: 'house-creyr'
    }),
    spouse('glynis-morforwyn', 'Glynis Morforwyn', 'female', '1698', '', {
      houseId: 'house-morforwyn'
    }),

    person('haul-llwynog', 'Haul Llwynog', 'male', '1719', '', {
      title: 'Zweiter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('brina-llwynog', 'Brina Llwynog', 'female', '1722', '', {
      title: 'Verlobt mit Eurig Hebog',
      tags: ['Verlobt']
    }),
    person('sath-llwynog', 'Sath Llwynog', 'male', '1721', ''),
    person('celyn-llwynog', 'Célyn Llwynog', 'female', '1723', ''),
    person('corryn-llwynog', 'Corryn Llwynog', 'male', '1723', ''),
    person('adda-llwynog', 'Adda Llwynog', 'female', '1725', ''),
    person('cari-llwynog', 'Cari Llwynog', 'female', '1724', ''),
    person('davie-llwynog', 'Davie Llwynog', 'male', '1732', ''),
    spouse('eurig-hebog', 'Eurig Hebog', 'male', '1721', '', {
      houseId: 'house-hebog'
    })
  ],
  partnerships: [
    createMarriage('marriage-marwynne-pebin', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-rheuwen-penkawr-blach', ...COUPLES.penkawr, { status: 'ended', end: '1288' }),
    createMarriage('marriage-penryn-nerys', ...COUPLES.nerys, { status: 'ended', end: '1281' }),
    createMarriage('marriage-heveydd-kerrilynn-llwynog', ...COUPLES.heveydd, { status: 'ended', end: '1635' }),
    createMarriage('marriage-tallwch-teleri', ...COUPLES.teleri, { status: 'ended', end: '1669' }),
    createMarriage('marriage-siani-rhydderch', ...COUPLES.rhydderch, { status: 'ended', end: '1696' }),
    createMarriage('marriage-maddison-govynyon-llwynog', ...COUPLES.maddison, { status: 'ended', end: '1689' }),
    createMarriage('marriage-seithved-siriol-teyrngarch', ...COUPLES.siriol, { status: 'ended', end: '1691' }),
    createMarriage('marriage-eira-rhynnon-dyngwn', ...COUPLES.rhynnon, { status: 'ended', end: '1717' }),
    createMarriage('marriage-aeronwen-rhun-llwynog', ...COUPLES.aeronwen, { status: 'ended', end: '1703' }),
    createMarriage('marriage-ehangwen-rhondda', ...COUPLES.rhondda, { status: 'ended', end: '1720' }),
    createMarriage('marriage-malt-anarawd', ...COUPLES.anarawd),
    createMarriage('marriage-arvonia-yspaddaden-llwynog', ...COUPLES.arvonia),
    createMarriage('marriage-cloi-enid', ...COUPLES.enid),
    createMarriage('marriage-edwynna-tarian-llwynog', ...COUPLES.edwynna, { status: 'ended', end: '1720' }),
    createMarriage('marriage-artura-eurig-blach', ...COUPLES.eurig),
    createMarriage('marriage-kerris-ieuan', ...COUPLES.ieuan),
    createMarriage('marriage-myfanwy-darragh-llwynog', ...COUPLES.myfanwy),
    createMarriage('marriage-bevan-mairead-llwynog', ...COUPLES.bevan),
    createMarriage('marriage-aerwyn-tudwallon', ...COUPLES.tudwallon),
    createMarriage('marriage-rhosyn-cadoc-llwynog', ...COUPLES.rhosyn),
    createMarriage('marriage-colwin-glynis-llwynog', ...COUPLES.colwin),
    createMarriage('engagement-brina-eurig-hebog-llwynog', ...COUPLES.brina, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['penkawr-llwynog', 'nerys-llwynog'], 'marriage-marwynne-pebin', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und Penkawr/Nerys sind nicht einzeln überlieferte Generationen ausgelassen.',
      extensions: { timeJumpId: 'gap-founders-to-penkawr-nerys-llwynog' }
    }),
    ...childrenOf(['heveydd-llwynog', 'ginevra-llwynog', 'teleri-llwynog'], 'marriage-rheuwen-penkawr-blach', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Die spätere Llwynog-Generation setzt nach einer weiteren Überlieferungslücke den Zweig Penkawrs und Rheuwens fort.',
      extensions: { timeJumpId: 'gap-penkawr-nerys-to-heveydd-generation-llwynog' }
    }),
    ...childrenOf(['rhydderch-llwynog', 'maddison-llwynog', 'siriol-llwynog'], 'marriage-heveydd-kerrilynn-llwynog'),
    ...childrenOf(['rhynnon-llwynog', 'aeronwen-llwynog', 'rhondda-llwynog'], 'marriage-siani-rhydderch'),
    ...childrenOf(
      ['anarawd-llwynog', 'arvonia-llwynog', 'enid-llwynog', 'edwynna-llwynog', 'eurig-llwynog'],
      'marriage-eira-rhynnon-dyngwn'
    ),
    ...childrenOf(['ieuan-llwynog', 'myfanwy-llwynog', 'bevan-llwynog'], 'marriage-malt-anarawd'),
    ...childrenOf(['tudwallon-lwynog', 'rhosyn-llwynog', 'colwin-llwynog'], 'marriage-artura-eurig-blach'),
    ...childrenOf(['haul-llwynog', 'brina-llwynog'], 'marriage-kerris-ieuan'),
    ...childrenOf(['sath-llwynog', 'celyn-llwynog'], 'marriage-bevan-mairead-llwynog'),
    ...childrenOf(['corryn-llwynog', 'adda-llwynog'], 'marriage-aerwyn-tudwallon'),
    ...childrenOf(['cari-llwynog', 'davie-llwynog'], 'marriage-colwin-glynis-llwynog')
  ],
  cadetBranches: [
    marriedAway('married-away-nerys-llwynog-illewod', 'Haus Illewod', 'marriage-penryn-nerys', 'house-illewod', { emblem: HOUSE_EMBLEMS.illewod }),
    marriedAway('married-away-teleri-llwynog-illewod', 'Haus Illewod', 'marriage-tallwch-teleri', 'house-illewod', { emblem: HOUSE_EMBLEMS.illewod }),
    marriedAway('married-away-maddison-llwynog-dinefwr', 'Haus Dinefwr', 'marriage-maddison-govynyon-llwynog', 'house-dinefwr'),
    marriedAway('married-away-siriol-llwynog-teyrngarch', 'Haus Teyrngarch', 'marriage-seithved-siriol-teyrngarch', 'house-teyrngarch', { emblem: HOUSE_EMBLEMS.teyrngarch }),
    marriedAway('married-away-aeronwen-llwynog-baedd', 'Haus Baedd', 'marriage-aeronwen-rhun-llwynog', 'house-baedd'),
    marriedAway('married-away-arvonia-llwynog-pyrth', 'Haus Pyrth', 'marriage-arvonia-yspaddaden-llwynog', 'house-pyrth'),
    marriedAway('married-away-enid-llwynog-grawn', 'Haus Grawn', 'marriage-cloi-enid', 'house-grawn', { emblem: HOUSE_EMBLEMS.grawn }),
    marriedAway('married-away-edwynna-llwynog-tiwna', 'Haus Tiwna', 'marriage-edwynna-tarian-llwynog', 'house-tiwna'),
    marriedAway('married-away-myfanwy-llwynog-ghaiscioch', 'Haus Ghaiscíoch', 'marriage-myfanwy-darragh-llwynog', 'house-ghaiscioch'),
    marriedAway('married-away-rhosyn-llwynog-creyr', 'Haus Créyr', 'marriage-rhosyn-cadoc-llwynog', 'house-creyr', { emblem: HOUSE_EMBLEMS.creyr }),
    marriedAway('married-away-brina-llwynog-hebog', 'Haus Hebog', 'engagement-brina-eurig-hebog-llwynog', 'house-hebog', {
      subtitle: 'Wegverlobt an Haus Hebog',
      notes: 'Brina bleibt bis zur Eheschließung ein legitimes Kernmitglied des Hauses Llwynog; der Zielknoten dokumentiert ihre Verlobung mit Eurig Hebog.'
    }),
    createCadetHouseBranch({
      id: 'cadet-illwath-rhondda',
      name: 'Haus Illwath',
      parentPartnershipId: 'marriage-ehangwen-rhondda',
      houseId: 'house-illwath',
      targetFamilyId: 'haus-illwath',
      emblem: HOUSE_EMBLEMS.illwath,
      subtitle: 'Mitbegründetes Kadettenhaus',
      notes: 'Rhondda Llwynog und Ehangwen Illewod begründen Haus Illwath; ihre Kinder werden ausschließlich dort fortgeführt.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-founders-to-penkawr-nerys-llwynog',
      parentPartnershipId: 'marriage-marwynne-pebin',
      parentPersonId: '',
      childIds: ['penkawr-llwynog', 'nerys-llwynog'],
      years: 0,
      fromYear: '????',
      toYear: '1247',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Erster absoluter Generationentrenner ausschließlich unter dem Llwynog-Hauswappen; kein Personen- oder Hausknoten steht parallel.',
      extensions: {}
    },
    {
      id: 'gap-penkawr-nerys-to-heveydd-generation-llwynog',
      parentPartnershipId: 'marriage-rheuwen-penkawr-blach',
      parentPersonId: '',
      childIds: ['heveydd-llwynog', 'ginevra-llwynog', 'teleri-llwynog'],
      years: 270,
      fromYear: '1315',
      toYear: '1585',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Ein einziger globaler Trenner führt ausschließlich Penkawr und Rheuwens Llwynog-Linie weiter. Nerys endet in dieser Akte mit ihrer Wegverheiratung an Penryn Illewod und besitzt keine Linie zu diesem Zeitsprung.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-marwynne-pebin',
    houseId: LLWYNOG_HOUSE_ID,
    crestSubtitle: 'Ritterfürstliches Waldläufer- und Jagdhaus aus Aberon',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'pebin-fuchs',
    orientation: 'vertical',
    ancestorDepth: 22,
    descendantDepth: 22,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 3,
    sourceModule: "Haus Llwynog O'Aberon (bereitgestellte Altdaten)",
    sourceNote: 'Personen, Lebensdaten, Ehen, Amtsfolge und Porträts folgen der bereitgestellten Llwynog-Tabelle. Pebin der Fuchs und Marwynne Illewod bilden das Gründerpaar vor dem Hauswappen. Beide Punktreihen werden als strikt serielle Generationentrenner geführt; der zweite steht ausschließlich unter Penkawr/Rheuwen und führt deren Llwynog-Linie fort. Nerys endet in dieser Akte mit ihrer Wegverheiratung an Penryn Illewod und führt weder sichtbar noch genealogisch zum zweiten Zeitsprung. Die Quelltabelle vertauscht in einer Partnerzeile Tarian Tiwna und Artura Blach; die nachfolgende Kinderüberschrift und die bestehende Blach-Gegenakte belegen eindeutig Eurig/Artura, sodass Edwynna/Tarian zugeordnet wird. Penrys wird zur bestehenden Illewod-Schreibweise Penryn, Mallt zur bestehenden Wylan-Schreibweise Malt normalisiert. Kerrilynns Daten folgen ihrer Ceirwyn-Gegenakte. Tudwallons ältere technische ID bleibt kompatibel, während Hausname und Weltidentität auf Llwynog vereinheitlicht sind. Nerys, Teleri, Maddison, Siriol, Aeronwen, Arvonia, Enid, Edwynna, Myfanwy und Rhosyn besitzen direkte Wegverheiratet-Knoten; Brina einen Wegverlobt-Knoten zu Haus Hebog. Geteilte Weltpersonen, Partnerschaften und Porträts mit Illewod, Blach, Wylan, Teyrngarch, Dyngwn, Grawn und Gafyr verwenden dieselben technischen Identitäten. Nachkommen stehen nur am fortgeführten Hauszweig: Seithved/Siriol bei Teyrngarch, Cloi/Enid bei Grawn und Penryn/Nerys bei Illewod; die Llwynog-Nachkommen ausschließlich hier. Wiederholte schwarze Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    chartViewport: { initialPosition: 'focus', initialScale: 0.44 }
  }
});
