import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  AEHRENTAL_HOUSE_EMBLEMS,
  AEHRENTAL_HOUSE_PROFILES
} from './aehrental-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';
import { HOUSE_BAEDD_PORTRAITS } from './house-baedd-portraits.js';

const BAEDD_HOUSE_ID = 'house-baedd';
const BAEDD_EMBLEM = AEHRENTAL_HOUSE_EMBLEMS.baedd;
const TIME_JUMP_ID = 'gap-aislaith-rhun-to-dyfnwal-generation-baedd';

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

const SUCCESSION_TITLES = Object.freeze({
  'rhun-ancient-baedd': 'Baron von Eirwyn · Gründer des Hauses Baedd',
  'dyfnwal-baedd': 'Baron von Eirwyn bis 1681',
  'kimbal-baedd': 'Baron von Eirwyn 1681–1696',
  'vaughan-baedd': 'Baron von Eirwyn seit 1696',
  'cei-baedd': 'Erster Erbe des Hauses Baedd',
  'viggo-baedd': 'Zweiter Erbe des Hauses Baedd',
  'auryn-baedd': 'Dritter Erbe des Hauses Baedd'
});

const HOUSE_HEAD_IDS = new Set([
  'rhun-ancient-baedd',
  'dyfnwal-baedd',
  'kimbal-baedd',
  'vaughan-baedd'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_TITLES[personId] ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? BAEDD_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_BAEDD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === BAEDD_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title === undefined ? SUCCESSION_TITLES[id] || '' : options.title,
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function coreOrigin(id, name, sex, houseId, options = {}) {
  return person(id, name, sex, '????', '????', {
    ...options,
    houseId,
    familyRole: 'core'
  });
}

function spouse(id, name, sex, birth, death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayPerson(id, name, sex, birth, death, targetHouseName, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    title: `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  origins: ['ceridwen-ancient-grawn', 'tamhas-warthog'],
  caolphionn: ['caolphionn-warthog', 'cearbhall-ancient-midgna'],
  maemhuire: ['maemhuire-warthog', 'fuirseach-fionghal'],
  founders: ['aislaith-warthog', 'rhun-ancient-baedd'],
  dyfnwal: ['ysobel-grawn', 'dyfnwal-baedd'],
  blodeuwedd: ['anarawd-dienyddiwr', 'blodeuwedd-baedd'],
  gwalchmai: ['gwalchmai-baedd', 'gwendolen-gwarchod'],
  kimbal: ['kimbal-baedd', 'malvina-eryr'],
  marve: ['marve-baedd', 'maldwyn-sgwarnog'],
  meriadoc: ['llywarch-creyr', 'meriadoc-baedd'],
  rhun: ['aeronwen-llwynog', 'rhun-baedd'],
  gwlithen: ['gwlithen-baedd', 'cearbhall-midgna'],
  vaughan: ['vaughan-baedd', 'ulyana-ciarog'],
  vaethan: ['vaethan-baedd', 'angharad-chiffyddlon'],
  idwal: ['endelyn-dyngwn', 'idwal-baedd'],
  cei: ['elin-grawn', 'cei-baedd'],
  kerenza: ['maddox-marchog', 'kerenza-baedd'],
  arthwr: ['gwerful-blach', 'arthwr-baedd'],
  valmar: ['valmar-baedd', 'zennorah-pyrth']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-ceridwen-tamhas': COUPLES.origins,
  'marriage-caolphionn-cearbhall-warthog': COUPLES.caolphionn,
  'marriage-maemhuire-fuirseach-warthog': COUPLES.maemhuire,
  'marriage-aislaith-rhun-baedd': COUPLES.founders,
  'marriage-ysobel-dyfnwal': COUPLES.dyfnwal,
  'marriage-anarawd-blodeuwedd-dienyddiwr': COUPLES.blodeuwedd,
  'marriage-gwalchmai-gwendolen-baedd': COUPLES.gwalchmai,
  'marriage-kimbal-malvina-baedd': COUPLES.kimbal,
  'marriage-marve-maldwyn-baedd': COUPLES.marve,
  'marriage-llywarch-meriadoc-creyr': COUPLES.meriadoc,
  'marriage-aeronwen-rhun-llwynog': COUPLES.rhun,
  'marriage-gwlithen-cearbhall-baedd': COUPLES.gwlithen,
  'marriage-vaughan-ulyana-baedd': COUPLES.vaughan,
  'marriage-vaethan-angharad-baedd': COUPLES.vaethan,
  'marriage-endelyn-idwal-dyngwn': COUPLES.idwal,
  'marriage-elin-cei': COUPLES.cei,
  'marriage-maddox-kerenza-marchog': COUPLES.kerenza,
  'marriage-gwerful-arthwr-blach': COUPLES.arthwr,
  'marriage-valmar-zennorah-baedd': COUPLES.valmar
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'baedd-parentage', ...options }
  );
}

function gapChildren(childIds) {
  return childrenOf(childIds, 'marriage-aislaith-rhun-baedd', {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Die Zwischen-Generationen sind in der Quelle nicht einzeln überliefert.',
    extensions: { timeJumpId: TIME_JUMP_ID }
  });
}

function marriedAway(id, name, partnershipId, houseId, options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem: options.emblem || '',
    subtitle: options.subtitle || `Wegverheiratet an ${name}`
  });
}

export const HOUSE_BAEDD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-baedd',
    title: "Haus Baedd O'Eirwyn",
    motto: '',
    description: 'Altes Baronengeschlecht von Eirwyn am Eberkamm, dessen Überlieferung den Ursprung auf den antiken Clan Warthog zurückführt.',
    emblem: BAEDD_EMBLEM,
    houseProfile: AEHRENTAL_HOUSE_PROFILES.baedd
  },
  houses: [
    house(BAEDD_HOUSE_ID, "Haus Baedd O'Eirwyn", BAEDD_EMBLEM),
    house('house-warthog', 'Clan Warthog', AEHRENTAL_HOUSE_EMBLEMS.warthog),
    house('house-grawn', "Haus Grawn O'Glyndraith", AEHRENTAL_HOUSE_EMBLEMS.grawn),
    house('house-midgna', 'Haus Midgna'),
    house('house-ua-fionnghal', 'Haus Ua Fíonnghal'),
    house('house-dienyddiwr', 'Haus Dienyddiwr', VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr),
    house('house-gwarchod', 'Haus Gwarchod', AEHRENTAL_HOUSE_EMBLEMS.gwarchod),
    house('house-eryr', 'Haus Eryr'),
    house('house-sgwarnog', 'Haus Sgwarnog', AEHRENTAL_HOUSE_EMBLEMS.sgwarnog),
    house('house-creyr', 'Haus Créyr', WEIDEBUCHT_HOUSE_EMBLEMS.creyr),
    house('house-llwynog', 'Haus Llwynog', SONNENKUESTE_HOUSE_EMBLEMS.llwynog),
    house('house-ciarog', 'Haus Ciaróg', AEHRENTAL_HOUSE_EMBLEMS.ciarog),
    house('house-chiffyddlon', 'Haus Chiffyddlon', AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon),
    house('house-dyngwn', 'Haus Dyngwn', VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn),
    house('house-marchog', 'Haus Marchog', AEHRENTAL_HOUSE_EMBLEMS.marchog),
    house('house-blach', 'Haus Blach', SONNENKUESTE_HOUSE_EMBLEMS.blach),
    house('house-pyrth', 'Haus Pyrth')
  ],
  persons: [
    coreOrigin('tamhas-warthog', 'Tàmhas Warthog', 'male', 'house-warthog'),
    coreOrigin('ceridwen-ancient-grawn', 'Ceridwen Grawn', 'female', 'house-grawn'),
    coreOrigin('caolphionn-warthog', 'Caolphionn Warthog', 'female', 'house-warthog', {
      title: 'Wegverheiratet an Haus Midgna',
      tags: ['Wegverheiratet']
    }),
    spouse('cearbhall-ancient-midgna', 'Cearbhall Midgna', 'male', '????', '????', 'house-midgna'),
    coreOrigin('maemhuire-warthog', 'Maemhuire Warthog', 'female', 'house-warthog', {
      title: 'Wegverheiratet an Haus Ua Fíonnghal',
      tags: ['Wegverheiratet']
    }),
    spouse('fuirseach-fionghal', 'Fuirseach Fionghal', 'male', '????', '????', 'house-ua-fionnghal'),
    coreOrigin('aislaith-warthog', 'Aislaith Warthog', 'female', 'house-warthog', {
      title: 'Mitbegründerin des Hauses Baedd'
    }),
    person('rhun-ancient-baedd', 'Rhun', 'male', '????', '????'),

    person('dyfnwal-baedd', 'Dyfnwal Baedd', 'male', '1626', '1681'),
    spouse('ysobel-grawn', 'Ysobel Grawn', 'female', '1627', '1663', 'house-grawn', {
      notes: 'Die Baedd-Quelle schreibt den Vornamen abweichend als „Ysolde“; die ausgearbeitete Grawn-Akte belegt Ysobel.'
    }),
    awayPerson('blodeuwedd-baedd', 'Blodeuwedd Baedd', 'female', '1628', '1692', 'Haus Dienyddiwr', {
      notes: 'Das Todesjahr 1692 folgt der ausgearbeiteten Dienyddiwr-Gegenakte; die Baedd-Tabelle lässt es offen.'
    }),
    spouse('anarawd-dienyddiwr', 'Anarawd Dienyddiwr', 'male', '1626', '1693', 'house-dienyddiwr'),
    person('gwalchmai-baedd', 'Gwalchmai Baedd', 'male', '1630', '1701'),
    spouse('gwendolen-gwarchod', 'Gwendolen Gwarchod', 'female', '1630', '1709', 'house-gwarchod', {
      notes: 'Die Altquelle schreibt den Hausnamen „Gwarchog“; das bestehende Ährental-Verzeichnis führt kanonisch Haus Gwarchod.'
    }),

    person('kimbal-baedd', 'Kimbal Baedd', 'male', '1649', '1696'),
    spouse('malvina-eryr', "Malvina Eryr O'Penbryn", 'female', '1651', '1696', 'house-eryr'),
    awayPerson('marve-baedd', 'Marve Baedd', 'female', '1650', '1702', 'Haus Sgwarnog'),
    spouse('maldwyn-sgwarnog', "Maldwyn Sgwarnog O'Aldwynd", 'male', '1648', '1727', 'house-sgwarnog'),
    awayPerson('meriadoc-baedd', 'Meriadoc Baedd', 'female', '1652', '1725', 'Haus Créyr'),
    spouse('llywarch-creyr', "Llywarch Créyr O'Esgairmor", 'male', '1652', '', 'house-creyr'),
    person('rhun-baedd', 'Rhun Baedd', 'male', '1650', '1720'),
    spouse('aeronwen-llwynog', "Aeronwen Llwynog O'Aberon", 'female', '1654', '1703', 'house-llwynog'),
    awayPerson('gwlithen-baedd', 'Gwlithen Baedd', 'female', '1654', '1712', 'Haus Midgna'),
    spouse('cearbhall-midgna', 'Cearbhall Midgna', 'male', '1650', '1710', 'house-midgna'),

    person('vaughan-baedd', 'Vaughan Baedd', 'male', '1670'),
    spouse('ulyana-ciarog', "Ulyana Ciaróg O'Caer Diwedd", 'female', '1672', '', 'house-ciarog', {
      notes: 'Die Altquelle schreibt den Sitz „Caerr Diwedd“; das bestehende Verzeichnis führt Caer Diwedd.'
    }),
    person('cynan-baedd', 'Cynan Baedd', 'male', '1672', '1689'),
    person('vaethan-baedd', 'Vaethan Baedd', 'male', '1674', '1737'),
    spouse('angharad-chiffyddlon', "Angharad Chiffyddlon O'Glyndraith", 'female', '1675', '1735', 'house-chiffyddlon'),
    person('idwal-baedd', 'Idwal Baedd', 'male', '1673'),
    spouse('endelyn-dyngwn', "Endelyn Dyngwn O'Mathragon", 'female', '1675', '', 'house-dyngwn'),

    person('cei-baedd', 'Cei Baedd', 'male', '1690'),
    spouse('elin-grawn', "Elin Grawn O'Glyndraith", 'female', '1700', '', 'house-grawn'),
    awayPerson('kerenza-baedd', 'Kerenza Baedd', 'female', '1697', '', 'Haus Marchog'),
    spouse('maddox-marchog', "Maddox Marchog O'Glyndraith", 'male', '1695', '', 'house-marchog'),
    person('arthwr-baedd', 'Arthwr Baedd', 'male', '1693'),
    spouse('gwerful-blach', "Gwerful Blach O'Powis", 'female', '1699', '', 'house-blach'),
    person('valmar-baedd', 'Valmar Baedd', 'male', '1695'),
    spouse('zennorah-pyrth', "Zennorah Pyrth O'Caer Clwyd", 'female', '1696', '', 'house-pyrth'),

    person('viggo-baedd', 'Viggo Baedd', 'male', '1720'),
    person('auryn-baedd', 'Auryn Baedd', 'male', '1724'),
    person('selyf-baedd', 'Selyf Baedd', 'male', '1721'),
    person('heledd-baedd', 'Heledd Baedd', 'female', '1723'),
    person('aelwyd-baedd', 'Aelwyd Baedd', 'male', '1723'),
    person('liliwen-baedd', 'Liliwen Baedd', 'female', '1723'),
    person('pwyll-baedd', 'Pwyll Baedd', 'male', '1725')
  ],
  partnerships: [
    createMarriage('marriage-ceridwen-tamhas', ...COUPLES.origins),
    createMarriage('marriage-caolphionn-cearbhall-warthog', ...COUPLES.caolphionn),
    createMarriage('marriage-maemhuire-fuirseach-warthog', ...COUPLES.maemhuire),
    createMarriage('marriage-aislaith-rhun-baedd', ...COUPLES.founders),
    createMarriage('marriage-ysobel-dyfnwal', ...COUPLES.dyfnwal),
    createMarriage('marriage-anarawd-blodeuwedd-dienyddiwr', ...COUPLES.blodeuwedd),
    createMarriage('marriage-gwalchmai-gwendolen-baedd', ...COUPLES.gwalchmai, { status: 'ended', end: '1701' }),
    createMarriage('marriage-kimbal-malvina-baedd', ...COUPLES.kimbal, { status: 'ended', end: '1696' }),
    createMarriage('marriage-marve-maldwyn-baedd', ...COUPLES.marve, { status: 'ended', end: '1702' }),
    createMarriage('marriage-llywarch-meriadoc-creyr', ...COUPLES.meriadoc, { status: 'ended', end: '1725' }),
    createMarriage('marriage-aeronwen-rhun-llwynog', ...COUPLES.rhun, { status: 'ended', end: '1703' }),
    createMarriage('marriage-gwlithen-cearbhall-baedd', ...COUPLES.gwlithen, { status: 'ended', end: '1710' }),
    createMarriage('marriage-vaughan-ulyana-baedd', ...COUPLES.vaughan),
    createMarriage('marriage-vaethan-angharad-baedd', ...COUPLES.vaethan, { status: 'ended', end: '1735' }),
    createMarriage('marriage-endelyn-idwal-dyngwn', ...COUPLES.idwal),
    createMarriage('marriage-elin-cei', ...COUPLES.cei),
    createMarriage('marriage-maddox-kerenza-marchog', ...COUPLES.kerenza),
    createMarriage('marriage-gwerful-arthwr-blach', ...COUPLES.arthwr),
    createMarriage('marriage-valmar-zennorah-baedd', ...COUPLES.valmar)
  ],
  parentages: [
    ...childrenOf(
      ['caolphionn-warthog', 'maemhuire-warthog', 'aislaith-warthog'],
      'marriage-ceridwen-tamhas'
    ),
    ...gapChildren(['dyfnwal-baedd', 'blodeuwedd-baedd', 'gwalchmai-baedd']),
    ...childrenOf(['kimbal-baedd', 'marve-baedd', 'meriadoc-baedd'], 'marriage-ysobel-dyfnwal'),
    ...childrenOf(['rhun-baedd', 'gwlithen-baedd'], 'marriage-gwalchmai-gwendolen-baedd'),
    ...childrenOf(['vaughan-baedd', 'cynan-baedd'], 'marriage-kimbal-malvina-baedd'),
    ...childrenOf(['vaethan-baedd', 'idwal-baedd'], 'marriage-aeronwen-rhun-llwynog'),
    ...childrenOf(['cei-baedd', 'kerenza-baedd'], 'marriage-vaughan-ulyana-baedd'),
    ...childrenOf(['arthwr-baedd'], 'marriage-vaethan-angharad-baedd'),
    ...childrenOf(['valmar-baedd'], 'marriage-endelyn-idwal-dyngwn'),
    ...childrenOf(['viggo-baedd', 'auryn-baedd'], 'marriage-elin-cei'),
    ...childrenOf(['selyf-baedd', 'heledd-baedd'], 'marriage-gwerful-arthwr-blach'),
    ...childrenOf(['aelwyd-baedd', 'liliwen-baedd', 'pwyll-baedd'], 'marriage-valmar-zennorah-baedd')
  ],
  cadetBranches: [
    marriedAway('married-away-caolphionn-warthog-midgna', 'Haus Midgna', 'marriage-caolphionn-cearbhall-warthog', 'house-midgna'),
    marriedAway('married-away-maemhuire-warthog-fionghal', 'Haus Ua Fíonnghal', 'marriage-maemhuire-fuirseach-warthog', 'house-ua-fionnghal'),
    marriedAway('married-away-blodeuwedd-baedd-dienyddiwr', 'Haus Dienyddiwr', 'marriage-anarawd-blodeuwedd-dienyddiwr', 'house-dienyddiwr', {
      emblem: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr
    }),
    marriedAway('married-away-marve-baedd-sgwarnog', 'Haus Sgwarnog', 'marriage-marve-maldwyn-baedd', 'house-sgwarnog', {
      emblem: AEHRENTAL_HOUSE_EMBLEMS.sgwarnog
    }),
    marriedAway('married-away-meriadoc-baedd-creyr', 'Haus Créyr', 'marriage-llywarch-meriadoc-creyr', 'house-creyr', {
      emblem: WEIDEBUCHT_HOUSE_EMBLEMS.creyr
    }),
    marriedAway('married-away-gwlithen-baedd-midgna', 'Haus Midgna', 'marriage-gwlithen-cearbhall-baedd', 'house-midgna'),
    marriedAway('married-away-kerenza-baedd-marchog', 'Haus Marchog', 'marriage-maddox-kerenza-marchog', 'house-marchog', {
      emblem: AEHRENTAL_HOUSE_EMBLEMS.marchog
    })
  ],
  timeJumps: [
    {
      id: TIME_JUMP_ID,
      parentPartnershipId: 'marriage-aislaith-rhun-baedd',
      childIds: ['dyfnwal-baedd', 'blodeuwedd-baedd', 'gwalchmai-baedd'],
      years: 0,
      fromYear: '????',
      toYear: '1626',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Die Stammbaumgrafik markiert zwischen dem Gründerpaar und der 1626 beginnenden Generation genau eine Überlieferungslücke.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-aislaith-rhun-baedd',
    houseId: BAEDD_HOUSE_ID,
    crestSubtitle: 'Baronengeschlecht von Eirwyn · aus dem Clan Warthog hervorgegangen',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tamhas-warthog',
    orientation: 'vertical',
    ancestorDepth: 16,
    descendantDepth: 16,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceNote: 'Genealogie, Lebensdaten, Erbfolge und individuelle Porträts folgen der bereitgestellten Baedd-Haustabelle und ihrer vollständigen Stammbaumgrafik, ergänzt um die bestätigte Korrektur Maemhuire Warthog/Fuirseach Fionghal. Die Grafik belegt Tàmhas Warthog und Ceridwen Grawn als Eltern von Caolphionn, Maemhuire und Aislaith; Aislaith und Rhun begründen Haus Baedd. Der goldene Hausknoten liegt deshalb direkt unter diesem Paar, gefolgt von genau dem einen ausdrücklich gezeichneten Zeitsprung. Die Baedd-Tabelle nennt Aislaith missverständlich als Rhuns Ehefrau unter „Rhun\'s“, während die Stammbaumgrafik und der Warthog-Ursprung ihre Abstammungsseite eindeutig machen. Ysolde/Ysobel und Gwarchog/Gwarchod werden nach den kanonischen Grawn- und Ährental-Akten normalisiert. Gemeinsame Weltpersonen, Partnerschafts-IDs und Teilnehmerreihenfolgen werden aus Grawn, Dienyddiwr, Créyr, Llwynog, Dyngwn, Marchog und Blach unverändert übernommen. Kinder erscheinen nur auf der fortführenden Seite: Blodeuwedds Kinder ausschließlich in Dienyddiwr, Meriadocs ausschließlich in Créyr und Kerenzas ausschließlich in Marchog; die jeweiligen Baedd-Zweige enden an direkten Wegverheiratet-Knoten. Neutrale Altquellen-Silhouetten werden nicht als individuelle Porträts gespeichert.',
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
    registryManagedRecordFields: ['folderPath']
  }
});
