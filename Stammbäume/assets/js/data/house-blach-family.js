import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import {
  SONNENKUESTE_HOUSE_EMBLEMS,
  SONNENKUESTE_HOUSE_PROFILES
} from './sonnenkueste-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const BLACH_HOUSE_ID = 'house-blach';
const BLACH_EMBLEM = SONNENKUESTE_HOUSE_EMBLEMS.blach;

const HOUSE_EMBLEMS = Object.freeze({
  baedd: '',
  canwyll: '',
  creyr: 'assets/images/houses/Weidebucht/haus-creyr.png',
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  gwyvern: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
  illewod: SONNENKUESTE_HOUSE_EMBLEMS.illewod,
  illysywen: 'assets/images/houses/Rhonwens Tränen/haus-illysywen.png',
  illwath: SONNENKUESTE_HOUSE_EMBLEMS.illwath,
  llwynog: SONNENKUESTE_HOUSE_EMBLEMS.llwynog,
  marwolaeth: VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth,
  morforwyn: SONNENKUESTE_HOUSE_EMBLEMS.morforwyn,
  'nic-riordain': SONNENKUESTE_HOUSE_EMBLEMS['nic-riordain'],
  teyrngarch: SONNENKUESTE_HOUSE_EMBLEMS.teyrngarch,
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png',
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
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
    name,
    sex,
    birth,
    death,
    houseId: options.houseId === undefined ? BLACH_HOUSE_ID : options.houseId,
    portrait: HOUSE_BLACH_PORTRAITS[id] || '',
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

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

const COUPLES = Object.freeze({
  founders: ['lachlan-tir-an-muirghin', 'uileann-riordain'],
  dirmyg: ['dirmyg-blach', 'siobhan-muirghin'],
  rhynnon: ['rhynnon-blach', 'marwe-ghaiscioch'],
  ceridwen: ['maldwyn-illewod', 'ceridwen-blach'],
  aeron: ['jeannae-wyrm', 'aeron-blach'],
  rheuwen: ['rheuwen-blach', 'penkawr-llwynog'],
  ehangwen: ['ehangwen-blach', 'fidelma-fiachrach'],
  angharad: ['angharad-blach', 'cadwaladr-creyr'],
  gawain: ['lowri-illewod', 'gawain-blach'],
  cadogan: ['cadogan-blach', 'wynndie-gwyvern'],
  gwyneth: ['gogyvwlch-illysywen', 'gwyneth-blach'],
  meredydd: ['meredydd-blach', 'meiriona-morforwyn'],
  ifan: ['malvina-wylan', 'ifan-blach'],
  gwenlian: ['gwenlian-blach', 'eiddyl-canwyll'],
  berwyn: ['berwyn-blach', 'eilun-chiffyddlon'],
  millena: ['millena-blach', 'roderick-tir-addawol'],
  dafydd: ['carwyn-illewod', 'dafydd-blach'],
  artura: ['artura-blach', 'eurig-llwynog'],
  dylan: ['quendolin-dienyddiwr', 'dylan-blach'],
  ossian: ['ossian-blach', 'heatherlinn-hwyaden'],
  tegin: ['edlym-teyrngarch', 'tegin-blach'],
  alicyn: ['alicyn-blach', 'vorath-illwath'],
  emyrs: ['emyrs-blach', 'caitriona-ceardaiocht'],
  betws: ['betws-blach', 'morien-tiwna'],
  idwallon: ['marve-wyrm', 'idwallon-blach'],
  gwerful: ['gwerful-blach', 'arthwr-baedd'],
  meurig: ['dolena-dyngwn', 'meurig-blach'],
  tanwen: ['penryn-marwolaeth', 'tanwen-blach']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-lachlan-uileann-blach': COUPLES.founders,
  'marriage-dirmyg-siobhan-blach': COUPLES.dirmyg,
  'marriage-rhynnon-marwe-blach': COUPLES.rhynnon,
  'marriage-maldwyn-ceridwen': COUPLES.ceridwen,
  'marriage-jeannae-aeron': COUPLES.aeron,
  'marriage-rheuwen-penkawr-blach': COUPLES.rheuwen,
  'marriage-ehangwen-fidelma-blach': COUPLES.ehangwen,
  'marriage-cadogan-wynndie-blach': COUPLES.cadogan,
  'marriage-meredydd-meiriona-blach': COUPLES.meredydd,
  'marriage-malvina-ifan': COUPLES.ifan,
  'marriage-berwyn-eilun-blach': COUPLES.berwyn,
  'marriage-carwyn-dafydd': COUPLES.dafydd,
  'marriage-quendolin-dylan-dienyddiwr': COUPLES.dylan,
  'marriage-ossian-heatherlinn-blach': COUPLES.ossian,
  'marriage-emyrs-caitriona-blach': COUPLES.emyrs,
  'marriage-marve-idwallon': COUPLES.idwallon,
  'marriage-dolena-meurig-dyngwn': COUPLES.meurig
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'blach-parentage', ...options }
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

export const HOUSE_BLACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-blach',
    title: "Haus Blach O'Aberon",
    motto: '',
    description: 'Altes ritterfürstliches Seefahrer- und Musikerhaus aus Aberon. Aus der Verbindung von Tir an Muirghin und Nic Ríordáin hervorgegangen, sichert es als treuer Vasall der Illewod die südlichen Häfen der Sonnenküste.',
    emblem: BLACH_EMBLEM,
    houseProfile: SONNENKUESTE_HOUSE_PROFILES.blach
  },
  houses: [
    house(BLACH_HOUSE_ID, "Haus Blach O'Aberon", BLACH_EMBLEM),
    house('house-muirghin', 'Tir an Muirghin'),
    house('house-nic-riordain', 'Nic Ríordáin', HOUSE_EMBLEMS['nic-riordain']),
    house('house-ghaiscioch', 'Haus Ghaiscíoch'),
    house('house-illewod', "Haus Illewod O'Aberon", HOUSE_EMBLEMS.illewod),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-llwynog', 'Haus Llwynog', HOUSE_EMBLEMS.llwynog),
    house('house-fiachrach', 'Haus Fiachrach'),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-illysywen', 'Haus Illysywen', HOUSE_EMBLEMS.illysywen),
    house('house-morforwyn', 'Haus Morforwyn', HOUSE_EMBLEMS.morforwyn),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-canwyll', 'Haus Canwyll'),
    house('house-chiffyddlon', 'Haus Chiffyddlon'),
    house('house-tir-addawol', 'Haus Tir Addawol'),
    house('house-dienyddiwr', 'Haus Dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    house('house-hwyaden', 'Haus Hwyaden'),
    house('house-teyrngarch', 'Haus Teyrngarch', HOUSE_EMBLEMS.teyrngarch),
    house('house-illwath', 'Haus Illwath', HOUSE_EMBLEMS.illwath),
    house('house-dal-ceardaiocht', 'Clan Dál’Ceardaíocht'),
    house('house-tiwna', 'Haus Tiwna'),
    house('house-baedd', 'Haus Baedd'),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-marwolaeth', 'Haus Marwolaeth', HOUSE_EMBLEMS.marwolaeth)
  ],
  persons: [
    person('lachlan-tir-an-muirghin', 'Lachlan Tir an Muirghin', 'male', '????', '????', {
      title: 'Gründer und erster Ritterfürst des Hauses Blach',
      lineageRole: 'head',
      notes: 'Vereinte Tir an Muirghin und Nic Ríordáin zum späteren Haus Blach.'
    }),
    spouse('uileann-riordain', 'Uileann Ríordáin', 'female', '????', '????', {
      houseId: 'house-nic-riordain',
      title: 'Mitgründerin des Hauses Blach'
    }),

    person('dirmyg-blach', 'Dirmyg Blach', 'male', '????', '????', {
      title: 'Ritterfürst des Hauses Blach',
      lineageRole: 'head'
    }),
    spouse('siobhan-muirghin', 'Siobhan Muirghin', 'female', '????', '????', {
      houseId: 'house-muirghin'
    }),

    person('rhynnon-blach', 'Rhynnon Blach', 'male', '????', '????', {
      title: 'Ritterfürst des Hauses Blach',
      lineageRole: 'head'
    }),
    person('ceridwen-blach', 'Ceridwen Blach', 'female', '????', '????', {
      title: 'Wegverheiratet an Haus Illewod',
      tags: ['Wegverheiratet']
    }),
    spouse('marwe-ghaiscioch', 'Marwe Ghaiscíoch', 'female', '????', '????', {
      houseId: 'house-ghaiscioch'
    }),
    spouse('maldwyn-illewod', 'Maldwyn Illewod', 'male', '????', '????', {
      houseId: 'house-illewod'
    }),

    person('aeron-blach', 'Aeron Blach', 'male', '1246', '1288', {
      title: 'Ritterfürst des Hauses Blach bis 1288',
      lineageRole: 'head'
    }),
    person('rheuwen-blach', 'Rheuwen Blach', 'female', '1250', '1300', {
      title: 'Wegverheiratet an Haus Llwynog',
      tags: ['Wegverheiratet']
    }),
    spouse('jeannae-wyrm', 'Jeannae Wyrm', 'female', '1249', '1704', {
      houseId: 'house-wyrm',
      notes: 'Die auffällige Lebensspanne ist in der Blach- und Wyrm-Quelle gleich überliefert und wird unverändert bewahrt.'
    }),
    spouse('penkawr-llwynog', 'Penkawr Llwynog', 'male', '1247', '1288', {
      houseId: 'house-llwynog'
    }),

    person('ehangwen-blach', 'Ehangwen Blach', 'male', '1598', '1638', {
      title: 'Ritterfürst des Hauses Blach bis 1638',
      lineageRole: 'head'
    }),
    person('angharad-blach', 'Angharad Blach', 'female', '1607', '1676', {
      title: 'Wegverheiratet an Haus Créyr',
      tags: ['Wegverheiratet']
    }),
    spouse('fidelma-fiachrach', 'Fidelma Fiachrach', 'female', '1600', '1655', {
      houseId: 'house-fiachrach'
    }),
    spouse('cadwaladr-creyr', 'Cadwaladr Créyr', 'male', '1607', '1687', {
      houseId: 'house-creyr'
    }),

    person('gawain-blach', 'Gawain Blach', 'male', '1619', '1640', {
      title: 'Ritterfürst des Hauses Blach von 1638 bis 1640',
      lineageRole: 'head'
    }),
    person('cadogan-blach', 'Cadogan Blach', 'male', '1626', '1691', {
      title: 'Ritterfürst des Hauses Blach von 1640 bis 1691',
      lineageRole: 'head'
    }),
    person('gwyneth-blach', 'Gwyneth Blach', 'female', '1628', '1677', {
      title: 'Wegverheiratet an Haus Illysywen',
      tags: ['Wegverheiratet']
    }),
    person('meredydd-blach', 'Meredydd Blach', 'male', '1630', '1712'),
    spouse('lowri-illewod', 'Lowri Illewod', 'female', '1623', '1668', {
      houseId: 'house-illewod'
    }),
    spouse('wynndie-gwyvern', 'Wynndie Gwyvern', 'female', '1629', '1659', {
      houseId: 'house-gwyvern'
    }),
    spouse('gogyvwlch-illysywen', 'Gogyvwlch Illysywen', 'male', '1627', '1689', {
      houseId: 'house-illysywen'
    }),
    spouse('meiriona-morforwyn', 'Meiriona Morforwyn', 'female', '1630', '1726', {
      houseId: 'house-morforwyn'
    }),

    person('ifan-blach', 'Ifan Blach', 'male', '1654', '1696', {
      title: 'Ritterfürst des Hauses Blach von 1691 bis 1696',
      lineageRole: 'head'
    }),
    person('gwenlian-blach', 'Gwenlian Blach', 'female', '1654', '1729', {
      title: 'Wegverheiratet an Haus Canwyll',
      tags: ['Wegverheiratet']
    }),
    person('berwyn-blach', 'Berwyn Blach', 'male', '1652', '1720'),
    person('millena-blach', 'Millena Blach', 'female', '1654', '1711', {
      title: 'Wegverheiratet an Haus Tir Addawol',
      tags: ['Wegverheiratet']
    }),
    spouse('malvina-wylan', 'Malvina Wylan', 'female', '1657', '1700', {
      houseId: 'house-wylan'
    }),
    spouse('eiddyl-canwyll', 'Eiddyl Canwyll', 'male', '1652', '', {
      houseId: 'house-canwyll'
    }),
    spouse('eilun-chiffyddlon', 'Eilun Chiffyddlon', 'female', '1653', '1700', {
      houseId: 'house-chiffyddlon'
    }),
    spouse('roderick-tir-addawol', 'Roderick Tir Addawol', 'male', '1654', '1720', {
      houseId: 'house-tir-addawol'
    }),

    person('dafydd-blach', 'Dafydd Blach', 'male', '1671', '', {
      title: 'Ritterfürst · Oberhaupt des Hauses Blach seit 1696',
      lineageRole: 'head'
    }),
    person('artura-blach', 'Artura Blach', 'female', '1677', '', {
      title: 'Wegverheiratet an Haus Llwynog',
      tags: ['Wegverheiratet']
    }),
    person('dylan-blach', 'Dylan Blach', 'male', '1673', ''),
    person('ossian-blach', 'Ossian Blach', 'male', '1671', ''),
    person('tegin-blach', 'Tegin Blach', 'female', '1674', '', {
      title: 'Wegverheiratet an Haus Teyrngarch',
      tags: ['Wegverheiratet']
    }),
    person('alicyn-blach', 'Alicyn Blach', 'female', '1678', '', {
      title: 'Wegverheiratet an Haus Illwath',
      tags: ['Wegverheiratet']
    }),
    spouse('carwyn-illewod', 'Carwyn Illewod', 'female', '1670', '', {
      houseId: 'house-illewod'
    }),
    spouse('eurig-llwynog', 'Eurig Llwynog', 'male', '1676', '', {
      houseId: 'house-llwynog'
    }),
    spouse('quendolin-dienyddiwr', 'Quendolin Dienyddiwr', 'female', '1676', '', {
      houseId: 'house-dienyddiwr'
    }),
    spouse('heatherlinn-hwyaden', 'Heatherlinn Hwyaden', 'female', '1674', '', {
      houseId: 'house-hwyaden'
    }),
    spouse('edlym-teyrngarch', 'Edlym Teyrngarch', 'male', '1675', '', {
      houseId: 'house-teyrngarch'
    }),
    spouse('vorath-illwath', 'Vorath Illwath', 'male', '1676', '', {
      houseId: 'house-illwath'
    }),

    person('emyrs-blach', 'Emyrs Blach', 'male', '1692', '', {
      title: 'Erster Erbe des Hauses Blach',
      lineageRole: 'mainline',
      notes: 'Die Hofliste schreibt den Namen einmal Emrys; die ausführliche Hierarchie verwendet Emyrs.'
    }),
    person('betws-blach', 'Betws Blach', 'female', '1699', '', {
      title: 'Wegverheiratet an Haus Tiwna',
      tags: ['Wegverheiratet']
    }),
    person('idwallon-blach', 'Idwallon Blach', 'male', '1704', '', {
      notes: 'Die Blach-Tabelle nennt 1703; die bereits kanonische Wyrm-Gegenakte führt dieselbe Weltperson mit 1704.'
    }),
    person('gwerful-blach', 'Gwerful Blach', 'female', '1699', '', {
      title: 'Wegverheiratet an Haus Baedd',
      tags: ['Wegverheiratet']
    }),
    person('meurig-blach', 'Meurig Blach', 'male', '1695', ''),
    person('tanwen-blach', 'Tanwen Blach', 'female', '1700', '', {
      title: 'Wegverheiratet an Haus Marwolaeth',
      tags: ['Wegverheiratet']
    }),
    spouse('caitriona-ceardaiocht', 'Caitriona Ceardaíocht', 'female', '1696', '', {
      houseId: 'house-dal-ceardaiocht'
    }),
    spouse('morien-tiwna', 'Morien Tiwna', 'male', '1697', '', {
      houseId: 'house-tiwna'
    }),
    spouse('marve-wyrm', 'Marve Wyrm', 'female', '1702', '', {
      houseId: 'house-wyrm'
    }),
    spouse('arthwr-baedd', 'Arthwr Baedd', 'male', '1693', '', {
      houseId: 'house-baedd'
    }),
    spouse('dolena-dyngwn', 'Dolena Dyngwn', 'female', '1697', '', {
      houseId: 'house-dyngwn'
    }),
    spouse('penryn-marwolaeth', 'Penryn Marwolaeth', 'male', '1696', '', {
      houseId: 'house-marwolaeth',
      notes: 'Die Blach-Tabelle schreibt den Namen einmal Penrys; die Marwolaeth-Gegenakte belegt Penryn.'
    }),

    person('prys-blach', 'Prys Blach', 'male', '1721', '', {
      title: 'Zweiter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('gwyna-blach', 'Gwyna Blach', 'female', '1722', ''),
    person('gawl-blach', 'Gawl Blach', 'male', '1727', '', {
      title: 'Dritter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    spouse('ailis-ghaiscioch', 'Ailis Ghaiscioch', 'female', '1727', '', {
      houseId: 'house-ghaiscioch',
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Emyrs Blachs',
      tags: ['Aufgenommenes Mündel'],
      notes: 'Ailis ist Emyrs’ Mündel und kein leibliches Kind der Blach.'
    }),
    person('caw-blach', 'Caw Blach', 'male', '1723', ''),
    person('jenita-blach', 'Jenita Blach', 'female', '1724', ''),
    person('afal-blach', 'Afal Blach', 'male', '1722', ''),
    person('rhian-blach', 'Rhian Blach', 'female', '1723', '')
  ],
  partnerships: [
    createMarriage('marriage-lachlan-uileann-blach', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-dirmyg-siobhan-blach', ...COUPLES.dirmyg, { status: 'ended' }),
    createMarriage('marriage-rhynnon-marwe-blach', ...COUPLES.rhynnon, { status: 'ended' }),
    createMarriage('marriage-maldwyn-ceridwen', ...COUPLES.ceridwen),
    createMarriage('marriage-jeannae-aeron', ...COUPLES.aeron),
    createMarriage('marriage-rheuwen-penkawr-blach', ...COUPLES.rheuwen, { status: 'ended', end: '1288' }),
    createMarriage('marriage-ehangwen-fidelma-blach', ...COUPLES.ehangwen, { status: 'ended', end: '1638' }),
    createMarriage('marriage-angharad-cadwaladr-blach', ...COUPLES.angharad, { status: 'ended', end: '1676' }),
    createMarriage('marriage-lowri-gawain', ...COUPLES.gawain),
    createMarriage('marriage-cadogan-wynndie-blach', ...COUPLES.cadogan, { status: 'ended', end: '1659' }),
    createMarriage('marriage-gogyvwlch-gwyneth', ...COUPLES.gwyneth),
    createMarriage('marriage-meredydd-meiriona-blach', ...COUPLES.meredydd, { status: 'ended', end: '1712' }),
    createMarriage('marriage-malvina-ifan', ...COUPLES.ifan),
    createMarriage('marriage-gwenlian-eiddyl-blach', ...COUPLES.gwenlian, { status: 'ended', end: '1729' }),
    createMarriage('marriage-berwyn-eilun-blach', ...COUPLES.berwyn, { status: 'ended', end: '1700' }),
    createMarriage('marriage-millena-roderick-blach', ...COUPLES.millena, { status: 'ended', end: '1711' }),
    createMarriage('marriage-carwyn-dafydd', ...COUPLES.dafydd),
    createMarriage('marriage-artura-eurig-blach', ...COUPLES.artura),
    createMarriage('marriage-quendolin-dylan-dienyddiwr', ...COUPLES.dylan),
    createMarriage('marriage-ossian-heatherlinn-blach', ...COUPLES.ossian),
    createMarriage('marriage-edlym-tegin-teyrngarch', ...COUPLES.tegin),
    createMarriage('marriage-alicyn-vorath-blach', ...COUPLES.alicyn),
    createMarriage('marriage-emyrs-caitriona-blach', ...COUPLES.emyrs),
    createMarriage('marriage-betws-morien-blach', ...COUPLES.betws),
    createMarriage('marriage-marve-idwallon', ...COUPLES.idwallon),
    createMarriage('marriage-gwerful-arthwr-blach', ...COUPLES.gwerful),
    createMarriage('marriage-dolena-meurig-dyngwn', ...COUPLES.meurig),
    createMarriage('marriage-penryn-tanwen-marwolaeth', ...COUPLES.tanwen)
  ],
  parentages: [
    ...childrenOf(['dirmyg-blach'], 'marriage-lachlan-uileann-blach', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und Dirmyg sind nicht einzeln überlieferte Generationen ausgelassen.',
      extensions: { timeJumpId: 'gap-lachlan-to-dirmyg-blach' }
    }),
    ...childrenOf(['rhynnon-blach', 'ceridwen-blach'], 'marriage-dirmyg-siobhan-blach', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Rhynnon und Ceridwen beginnen nach einer nicht einzeln überlieferten Generationenfolge.',
      extensions: { timeJumpId: 'gap-dirmyg-to-rhynnon-ceridwen-blach' }
    }),
    ...childrenOf(['aeron-blach'], 'marriage-rhynnon-marwe-blach', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Aeron setzt den Rhynnon-Zweig nach ausgelassenen Generationen fort.',
      extensions: { timeJumpId: 'gap-rhynnon-ceridwen-to-aeron-rheuwen-blach' }
    }),
    ...childrenOf(['rheuwen-blach'], 'marriage-maldwyn-ceridwen', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Rheuwen setzt den Ceridwen-Zweig nach ausgelassenen Generationen fort.',
      extensions: { timeJumpId: 'gap-rhynnon-ceridwen-to-aeron-rheuwen-blach' }
    }),
    ...childrenOf(['ehangwen-blach'], 'marriage-jeannae-aeron', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Ehangwen setzt den Aeron-Zweig nach mehreren Jahrhunderten fort.',
      extensions: { timeJumpId: 'gap-aeron-rheuwen-to-ehangwen-angharad-blach' }
    }),
    ...childrenOf(['angharad-blach'], 'marriage-rheuwen-penkawr-blach', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Angharad setzt den Rheuwen-Zweig nach mehreren Jahrhunderten fort.',
      extensions: { timeJumpId: 'gap-aeron-rheuwen-to-ehangwen-angharad-blach' }
    }),
    ...childrenOf(
      ['gawain-blach', 'cadogan-blach', 'gwyneth-blach', 'meredydd-blach'],
      'marriage-ehangwen-fidelma-blach'
    ),
    ...childrenOf(['ifan-blach', 'gwenlian-blach'], 'marriage-cadogan-wynndie-blach'),
    ...childrenOf(['berwyn-blach', 'millena-blach'], 'marriage-meredydd-meiriona-blach'),
    ...childrenOf(['dafydd-blach', 'artura-blach', 'dylan-blach'], 'marriage-malvina-ifan'),
    ...childrenOf(['ossian-blach', 'tegin-blach', 'alicyn-blach'], 'marriage-berwyn-eilun-blach'),
    ...childrenOf(['emyrs-blach', 'betws-blach', 'idwallon-blach'], 'marriage-carwyn-dafydd'),
    ...childrenOf(['gwerful-blach'], 'marriage-quendolin-dylan-dienyddiwr'),
    ...childrenOf(['meurig-blach', 'tanwen-blach'], 'marriage-ossian-heatherlinn-blach'),
    ...childrenOf(['prys-blach', 'gwyna-blach', 'gawl-blach'], 'marriage-emyrs-caitriona-blach'),
    ...createParentages(['ailis-ghaiscioch'], ['emyrs-blach'], '', {
      idPrefix: 'blach-parentage-foster',
      type: 'foster',
      notes: 'Ailis Ghaiscioch ist Emyrs’ aufgenommenes Mündel und keine leibliche Blach-Tochter.'
    }),
    ...childrenOf(['caw-blach', 'jenita-blach'], 'marriage-marve-idwallon'),
    ...childrenOf(['afal-blach', 'rhian-blach'], 'marriage-dolena-meurig-dyngwn')
  ],
  cadetBranches: [
    marriedAway('married-away-ceridwen-blach-illewod', 'Haus Illewod', 'marriage-maldwyn-ceridwen', 'house-illewod', { emblem: HOUSE_EMBLEMS.illewod }),
    marriedAway('married-away-rheuwen-blach-llwynog', 'Haus Llwynog', 'marriage-rheuwen-penkawr-blach', 'house-llwynog', { emblem: HOUSE_EMBLEMS.llwynog }),
    marriedAway('married-away-angharad-blach-creyr', 'Haus Créyr', 'marriage-angharad-cadwaladr-blach', 'house-creyr', { emblem: HOUSE_EMBLEMS.creyr }),
    marriedAway('married-away-gwyneth-blach-illysywen', 'Haus Illysywen', 'marriage-gogyvwlch-gwyneth', 'house-illysywen', { emblem: HOUSE_EMBLEMS.illysywen }),
    marriedAway('married-away-gwenlian-blach-canwyll', 'Haus Canwyll', 'marriage-gwenlian-eiddyl-blach', 'house-canwyll'),
    marriedAway('married-away-millena-blach-tir-addawol', 'Haus Tir Addawol', 'marriage-millena-roderick-blach', 'house-tir-addawol'),
    marriedAway('married-away-artura-blach-llwynog', 'Haus Llwynog', 'marriage-artura-eurig-blach', 'house-llwynog', { emblem: HOUSE_EMBLEMS.llwynog }),
    marriedAway('married-away-tegin-blach-teyrngarch', 'Haus Teyrngarch', 'marriage-edlym-tegin-teyrngarch', 'house-teyrngarch', { emblem: HOUSE_EMBLEMS.teyrngarch }),
    marriedAway('married-away-alicyn-blach-illwath', 'Haus Illwath', 'marriage-alicyn-vorath-blach', 'house-illwath', { emblem: HOUSE_EMBLEMS.illwath }),
    marriedAway('married-away-betws-blach-tiwna', 'Haus Tiwna', 'marriage-betws-morien-blach', 'house-tiwna'),
    marriedAway('married-away-gwerful-blach-baedd', 'Haus Baedd', 'marriage-gwerful-arthwr-blach', 'house-baedd'),
    marriedAway('married-away-tanwen-blach-marwolaeth', 'Haus Marwolaeth', 'marriage-penryn-tanwen-marwolaeth', 'house-marwolaeth', { emblem: HOUSE_EMBLEMS.marwolaeth })
  ],
  timeJumps: [
    {
      id: 'gap-lachlan-to-dirmyg-blach',
      parentPartnershipId: 'marriage-lachlan-uileann-blach',
      parentPersonId: '',
      childIds: ['dirmyg-blach'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Erster absoluter Generationentrenner ausschließlich unter dem Blach-Hauswappen.',
      extensions: {}
    },
    {
      id: 'gap-dirmyg-to-rhynnon-ceridwen-blach',
      parentPartnershipId: 'marriage-dirmyg-siobhan-blach',
      parentPersonId: '',
      childIds: ['rhynnon-blach', 'ceridwen-blach'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Zweiter absoluter Generationentrenner unter Dirmyg und Siobhan; kein Personen- oder Hausknoten steht parallel.',
      extensions: {}
    },
    {
      id: 'gap-rhynnon-ceridwen-to-aeron-rheuwen-blach',
      parentPartnershipId: 'marriage-rhynnon-marwe-blach',
      sharedParentPartnershipIds: ['marriage-maldwyn-ceridwen'],
      parentPersonId: '',
      childIds: ['aeron-blach', 'rheuwen-blach'],
      years: 0,
      fromYear: '????',
      toYear: '1246',
      label: 'Nicht einzeln überlieferte Generationen beider Zweige',
      notes: 'Ein einziger globaler Trenner führt die Paarungen Rhynnon/Marwe und Ceridwen/Maldwyn seriell zur nächsten belegten Generation; die fachlichen Abstammungen bleiben getrennt.',
      extensions: {}
    },
    {
      id: 'gap-aeron-rheuwen-to-ehangwen-angharad-blach',
      parentPartnershipId: 'marriage-jeannae-aeron',
      sharedParentPartnershipIds: ['marriage-rheuwen-penkawr-blach'],
      parentPersonId: '',
      childIds: ['ehangwen-blach', 'angharad-blach'],
      years: 298,
      fromYear: '1300',
      toYear: '1598',
      label: 'Nicht einzeln überlieferte Generationen beider Zweige',
      notes: 'Ein einziger globaler Trenner verbindet beide alten Zweige mit der ab 1598 wieder belegten Generation; kein paralleler Zeitsprung wird erzeugt.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-lachlan-uileann-blach',
    houseId: BLACH_HOUSE_ID,
    crestSubtitle: 'Ritterfürstliches Seefahrer- und Musikerhaus aus Aberon',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'lachlan-tir-an-muirghin',
    orientation: 'vertical',
    ancestorDepth: 28,
    descendantDepth: 28,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Blach O'Aberon (bereitgestellte Altdaten)",
    sourceNote: 'Personen, Lebensdaten, Ehen, Amtsfolge und Porträts folgen der bereitgestellten Blach-Tabelle. Die Vereinigung von Tir an Muirghin und Nic Ríordáin bildet das Gründerpaar vor dem Blach-Wappen. Vier Punktreihen werden als vier strikt serielle, niemals parallele Generationentrenner geführt. Bei den zwei alten Doppelzweigen speist jeweils ein einziger globaler Trenner beide Paarungen, während die fachlichen Abstammungen getrennt bleiben. Ceridwen, Rheuwen, Angharad, Gwyneth, Gwenlian, Millena, Artura, Tegin, Alicyn, Betws, Gwerful und Tanwen besitzen direkte Wegverheiratet-Knoten zu ihren Zielhäusern. Betws wird nach ihrem eindeutigen Quellporträt als Blach-Tochter geführt; ihre Ehe mit Morien beendet ihren Herkunftszweig am Zielknoten Haus Tiwna. Ailis Ghaiscioch ist als aufgenommenes Mündel Emyrs’ mit Mündelrahmen und ausschließlich einer Pflegebeziehung erfasst. Geteilte Weltpersonen, Partnerschaften und Porträts mit Illewod, Wyrm, Illysywen, Wylan, Dienyddiwr, Teyrngarch, Dyngwn und Marwolaeth verwenden dieselben technischen IDs. Caitrionas Herkunftshaus verwendet nun durchgängig die kanonische Kennung des Clans Dál’Ceardaíocht. Nachkommen werden nur auf der fortgeführten Seite dargestellt: Gwyneth/Gogyvwlch, Tegin/Edlym und Tanwen/Penryn ausschließlich in den Zielhäusern; Ifan/Malvina, Dafydd/Carwyn, Dylan/Quendolin, Idwallon/Marve und Meurig/Dolena ausschließlich hier. Die Varianten Jeanae/Jeannae, Penrys/Penryn und Emyrs/Emrys wurden zugunsten bestehender Gegenakten beziehungsweise der ausführlichen Hierarchie normalisiert. Idwallons bereits kanonisches Geburtsjahr 1704 aus der Wyrm-Akte bleibt trotz der Blach-Angabe 1703 stabil. Wiederholte schwarze Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
    registryTombstones: { houses: ['house-ceardaiocht'] },
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
    chartViewport: { initialPosition: 'focus', initialScale: 0.42 }
  }
});
