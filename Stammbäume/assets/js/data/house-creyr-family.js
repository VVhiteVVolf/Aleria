import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_CREYR_PORTRAITS } from './house-creyr-portraits.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import {
  WEIDEBUCHT_HOUSE_EMBLEMS,
  WEIDEBUCHT_HOUSE_PROFILES
} from './weidebucht-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const CREYR_HOUSE_ID = 'house-creyr';
const CREYR_EMBLEM = WEIDEBUCHT_HOUSE_EMBLEMS.creyr;

const HOUSE_EMBLEMS = Object.freeze({
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  blach: SONNENKUESTE_HOUSE_EMBLEMS.blach,
  creyr: CREYR_EMBLEM,
  dinefwr: WEIDEBUCHT_HOUSE_EMBLEMS.dinefwr,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  gwyvern: 'assets/images/houses/Llamreis Ankunft/haus-gwyvern.png',
  hwyaden: WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden,
  llwynog: SONNENKUESTE_HOUSE_EMBLEMS.llwynog,
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil,
  mochdaer: WEIDEBUCHT_HOUSE_EMBLEMS.mochdaer,
  wylan: WEIDEBUCHT_HOUSE_EMBLEMS.wylan
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

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? CREYR_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_CREYR_PORTRAITS[id] || '',
    worldPersonId: options.worldPersonId || '',
    familyRole: options.familyRole || (houseId === CREYR_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
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
    familyRole: 'married'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function endedMarriage(id, firstId, secondId, options = {}) {
  return createMarriage(id, firstId, secondId, { status: 'ended', ...options });
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, options);
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    crestFrame: 'gold'
  });
}

const COUPLES = Object.freeze({
  founders: ['rhodhri-wylan', 'tanwen-hwyaden'],
  maldwyn: ['siriol-dinefwr', 'maldwyn-creyr-dinefwr'],
  cadwaladr: ['angharad-blach', 'cadwaladr-creyr'],
  tudorwen: ['tudorwen-creyr', 'blegwywyrd-tylluan'],
  grippiud: ['rhiannon-gafyr', 'grippiud-creyr'],
  ariene: ['trachmyr-wylan', 'ariene-creyr'],
  armel: ['armel-creyr', 'myf-aderyn'],
  blodwen: ['blodwen-creyr', 'lancel-saith'],
  llywarch: ['llywarch-creyr', 'meriadoc-baedd'],
  goronwy: ['tegwen-dinefwr', 'goronwy-creyr'],
  meredid: ['meredid-creyr', 'hoyer-coedwig'],
  glendower: ['morwenna-gwefrydd-1669', 'glendower-creyr'],
  grippiud1672: ['grippiud-1672-creyr', 'caru-morfil'],
  gwenllian: ['gethin-dyngwn', 'gwenllian-creyr'],
  cadoc: ['rhosyn-llwynog', 'cadoc-creyr'],
  madoc: ['genofeva-gwyvern', 'madoc-creyr'],
  eurfron: ['eurfron-creyr', 'tudor-gaeth'],
  dadweir: ['gwenifer-hwyaden', 'dadweir-creyr'],
  meilyr: ['meilyr-creyr', 'olwyna-tiwna'],
  evan: ['nona-wylan', 'evan-creyr'],
  gwynfa: ['cadel-mochdaer', 'gwynfa-creyr']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-rhodhri-tanwen': COUPLES.founders,
  'marriage-siriol-maldwyn-dinefwr': COUPLES.maldwyn,
  'marriage-angharad-cadwaladr-blach': COUPLES.cadwaladr,
  'marriage-tudorwen-blegwywyrd-creyr': COUPLES.tudorwen,
  'marriage-rhiannon-grippiud': COUPLES.grippiud,
  'marriage-trachmyr-ariene': COUPLES.ariene,
  'marriage-armel-myf': COUPLES.armel,
  'marriage-blodwen-lancel-creyr': COUPLES.blodwen,
  'marriage-llywarch-meriadoc-creyr': COUPLES.llywarch,
  'marriage-tegwen-goronwy-dinefwr': COUPLES.goronwy,
  'marriage-meredid-hoyer-creyr': COUPLES.meredid,
  'marriage-morwenna-glendower': COUPLES.glendower,
  'marriage-grippiud-caru-creyr': COUPLES.grippiud1672,
  'marriage-gethin-gwenllian-dyngwn': COUPLES.gwenllian,
  'marriage-rhosyn-cadoc-llwynog': COUPLES.cadoc,
  'marriage-genofeva-madoc': COUPLES.madoc,
  'marriage-eurfron-tudor-creyr': COUPLES.eurfron,
  'marriage-gwenifer-dadweir-hwyaden': COUPLES.dadweir,
  'marriage-meilyr-olwyna-creyr': COUPLES.meilyr,
  'engagement-nona-evan': COUPLES.evan,
  'engagement-cadel-gwynfa-mochdaer': COUPLES.gwynfa
});

export const HOUSE_CREYR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-creyr',
    title: "Haus Créyr O'Esgairmor",
    motto: '',
    description: "Kadettenhaus der Wylan und Baronshaus von Esgairmor in Dunstholm. Die Créyr sind für Schiffbau, Seefahrt und ihre auffällige Augenfarbe bekannt.",
    emblem: CREYR_EMBLEM,
    houseProfile: WEIDEBUCHT_HOUSE_PROFILES.creyr
  },
  houses: [
    house(CREYR_HOUSE_ID, "Haus Créyr O'Esgairmor", CREYR_EMBLEM),
    house('house-wylan', "Haus Wylan O'Cerrigarth", HOUSE_EMBLEMS.wylan),
    house('house-hwyaden', 'Haus Hwyaden', HOUSE_EMBLEMS.hwyaden),
    house('house-dinefwr', "Haus Dinefwr O'Cerrigarth", HOUSE_EMBLEMS.dinefwr),
    house('house-blach', 'Haus Blach', HOUSE_EMBLEMS.blach),
    house('house-tylluan', 'Haus Tylluan'),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-saith', 'Haus Saith'),
    house('house-baedd', 'Haus Baedd'),
    house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig),
    house('house-gwefrydd', 'Haus Gwefrydd'),
    house('house-morfil', 'Haus Morfil', HOUSE_EMBLEMS.morfil),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-llwynog', 'Haus Llwynog', HOUSE_EMBLEMS.llwynog),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-gaeth', 'Haus Gaeth'),
    house('house-tiwna', 'Haus Tiwna'),
    house('house-mochdaer', "Haus Mochdaer O'Cerrigarth", HOUSE_EMBLEMS.mochdaer)
  ],
  persons: [
    person('rhodhri-wylan', 'Rhodhri Wylan', 'male', '????', '????', {
      houseId: 'house-wylan',
      familyRole: 'core',
      title: 'Gründer und erster Baron des Hauses Créyr',
      lineageRole: 'head'
    }),
    spouse('tanwen-hwyaden', 'Tanwen Hwyaden', 'female', '????', '????', 'house-hwyaden'),

    person('maldwyn-creyr-dinefwr', 'Maldwyn Créyr', 'male', '????', '????', {
      title: 'Baron von Esgairmor',
      lineageRole: 'head'
    }),
    person('llwyrddyddwg-creyr', 'Llwyrddyddwg Créyr', 'male', '????', '????'),
    spouse('siriol-dinefwr', 'Siriol Dinefwr', 'female', '????', '????', 'house-dinefwr'),

    person('cadwaladr-creyr', 'Cadwaladr Créyr', 'male', '1607', '1687', {
      title: 'Baron von Esgairmor bis 1687',
      lineageRole: 'head'
    }),
    awayWoman('tudorwen-creyr', 'Tudorwen Créyr', '1612', '1677', 'Haus Tylluan'),
    spouse('angharad-blach', 'Angharad Blach', 'female', '1607', '1676', 'house-blach'),
    spouse('blegwywyrd-tylluan', 'Blegwywyrd Tylluan', 'male', '1609', '1674', 'house-tylluan'),

    person('grippiud-creyr', 'Grippiud Créyr', 'male', '1625', '1701', {
      title: 'Baron von Esgairmor 1687–1701',
      lineageRole: 'head'
    }),
    awayWoman('ariene-creyr', 'Ariene Créyr', '1635', '1720', 'Haus Wylan'),
    spouse('rhiannon-gafyr', 'Rhiannon', 'female', '1625', '1702', 'house-gafyr'),
    spouse('trachmyr-wylan', 'Trachmyr Wylan', 'male', '1631', '1702', 'house-wylan'),

    person('armel-creyr', 'Armel Créyr', 'male', '1644', '1735', {
      title: 'Baron von Esgairmor 1701–1735',
      lineageRole: 'head'
    }),
    awayWoman('blodwen-creyr', 'Blodwen Créyr', '1648', '1714', 'Haus Saith'),
    person('llywarch-creyr', 'Llywarch Créyr', 'male', '1652', ''),
    spouse('myf-aderyn', 'Myf Aderyn', 'female', '1647', '1691', 'house-aderyn'),
    spouse('lancel-saith', 'Lancel Saith', 'male', '1646', '1717', 'house-saith'),
    spouse('meriadoc-baedd', 'Meriadoc Baedd', 'female', '1652', '1725', 'house-baedd'),

    person('goronwy-creyr', 'Goronwy Créyr', 'male', '1665', '', {
      title: 'Baron von Esgairmor seit 1735',
      lineageRole: 'head'
    }),
    awayWoman('meredid-creyr', 'Meredid Créyr', '1673', '', 'Haus Coedwig'),
    person('glendower-creyr', 'Glendower Créyr', 'male', '1670', ''),
    person('grippiud-1672-creyr', 'Grippiud Créyr', 'male', '1672', ''),
    awayWoman('gwenllian-creyr', 'Gwenllian Créyr', '1674', '', 'Haus Dyngwn'),
    spouse('tegwen-dinefwr', 'Tegwen Dinefwr', 'female', '1670', '', 'house-dinefwr'),
    spouse('hoyer-coedwig', 'Hoyer Coedwig', 'male', '1677', '', 'house-coedwig'),
    spouse('morwenna-gwefrydd-1669', 'Morwenna', 'female', '1669', '1720', 'house-gwefrydd'),
    spouse('caru-morfil', 'Caru Morfil', 'female', '1676', '', 'house-morfil'),
    spouse('gethin-dyngwn', 'Gethin Dyngwn', 'male', '1673', '', 'house-dyngwn'),

    person('cadoc-creyr', 'Cadoc Créyr', 'male', '1691', '', {
      title: 'Erster Erbe des Hauses Créyr',
      lineageRole: 'mainline'
    }),
    person('madoc-creyr', 'Madoc Créyr', 'male', '1695', ''),
    awayWoman('eurfron-creyr', 'Eurfron Créyr', '1701', '', 'Haus Gaeth'),
    person('dadweir-creyr', 'Dadweir Créyr', 'male', '1694', ''),
    person('meilyr-creyr', 'Meilyr Créyr', 'male', '1696', ''),
    spouse('rhosyn-llwynog', 'Rhosyn Llwynog', 'female', '1698', '', 'house-llwynog'),
    spouse('genofeva-gwyvern', 'Genofeva', 'female', '1700', '', 'house-gwyvern'),
    spouse('tudor-gaeth', 'Tudor Gaeth', 'male', '1698', '', 'house-gaeth'),
    spouse('gwenifer-hwyaden', 'Gwenifer Hwyaden', 'female', '1700', '', 'house-hwyaden'),
    spouse('olwyna-tiwna', 'Olwyna Tiwna', 'female', '1698', '', 'house-tiwna'),

    person('evan-creyr', 'Evan Créyr', 'male', '1722', '', {
      title: 'Zweiter Erbe des Hauses Créyr',
      lineageRole: 'mainline'
    }),
    person('gwynfa-creyr', 'Gwynfa Créyr', 'female', '1724', ''),
    person('ilar-creyr', 'Ilar Créyr', 'male', '1720', ''),
    person('gwenog-creyr', 'Gwenog Créyr', 'female', '1723', ''),
    person('talan-creyr', 'Talan Créyr', 'male', '1720', ''),
    person('hollie-creyr', 'Hollie Créyr', 'female', '1722', ''),
    person('pebin-creyr', 'Pebin Créyr', 'male', '1719', ''),
    person('imanie-creyr', 'Imanie Créyr', 'female', '1724', ''),
    spouse('nona-wylan', 'Nona Wylan', 'female', '1724', '', 'house-wylan'),
    spouse('cadel-mochdaer', 'Cadel Mochdaer', 'male', '1724', '', 'house-mochdaer')
  ],
  partnerships: [
    endedMarriage('marriage-rhodhri-tanwen', ...COUPLES.founders),
    endedMarriage('marriage-siriol-maldwyn-dinefwr', ...COUPLES.maldwyn),
    endedMarriage('marriage-angharad-cadwaladr-blach', ...COUPLES.cadwaladr, { end: '1676' }),
    endedMarriage('marriage-tudorwen-blegwywyrd-creyr', ...COUPLES.tudorwen, { end: '1674' }),
    endedMarriage('marriage-rhiannon-grippiud', ...COUPLES.grippiud, { end: '1701' }),
    endedMarriage('marriage-trachmyr-ariene', ...COUPLES.ariene, { end: '1702' }),
    endedMarriage('marriage-armel-myf', ...COUPLES.armel, { end: '1691' }),
    endedMarriage('marriage-blodwen-lancel-creyr', ...COUPLES.blodwen, { end: '1714' }),
    endedMarriage('marriage-llywarch-meriadoc-creyr', ...COUPLES.llywarch, { end: '1725' }),
    createMarriage('marriage-tegwen-goronwy-dinefwr', ...COUPLES.goronwy),
    createMarriage('marriage-meredid-hoyer-creyr', ...COUPLES.meredid),
    endedMarriage('marriage-morwenna-glendower', ...COUPLES.glendower, { end: '1720' }),
    createMarriage('marriage-grippiud-caru-creyr', ...COUPLES.grippiud1672),
    createMarriage('marriage-gethin-gwenllian-dyngwn', ...COUPLES.gwenllian),
    createMarriage('marriage-rhosyn-cadoc-llwynog', ...COUPLES.cadoc),
    createMarriage('marriage-genofeva-madoc', ...COUPLES.madoc),
    createMarriage('marriage-eurfron-tudor-creyr', ...COUPLES.eurfron),
    createMarriage('marriage-gwenifer-dadweir-hwyaden', ...COUPLES.dadweir),
    createMarriage('marriage-meilyr-olwyna-creyr', ...COUPLES.meilyr),
    createMarriage('engagement-nona-evan', ...COUPLES.evan, { type: 'engagement' }),
    createMarriage('engagement-cadel-gwynfa-mochdaer', ...COUPLES.gwynfa, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['maldwyn-creyr-dinefwr', 'llwyrddyddwg-creyr'], 'marriage-rhodhri-tanwen', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen den Gründern und der Maldwyn-Generation sind nicht einzeln überlieferte Créyr-Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-founders-to-maldwyn-creyr' }
    }),
    ...childrenOf(['cadwaladr-creyr', 'tudorwen-creyr'], 'marriage-siriol-maldwyn-dinefwr', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Maldwyn und der ab 1607 belegten Generation sind nicht einzeln überlieferte Créyr-Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-maldwyn-to-cadwaladr-creyr' }
    }),
    ...childrenOf(['grippiud-creyr', 'ariene-creyr'], 'marriage-angharad-cadwaladr-blach'),
    ...childrenOf(['armel-creyr', 'blodwen-creyr', 'llywarch-creyr'], 'marriage-rhiannon-grippiud'),
    ...childrenOf(['goronwy-creyr', 'meredid-creyr'], 'marriage-armel-myf'),
    ...childrenOf(['glendower-creyr', 'grippiud-1672-creyr', 'gwenllian-creyr'], 'marriage-llywarch-meriadoc-creyr'),
    ...childrenOf(['cadoc-creyr', 'madoc-creyr'], 'marriage-tegwen-goronwy-dinefwr'),
    ...childrenOf(['eurfron-creyr', 'dadweir-creyr'], 'marriage-morwenna-glendower'),
    ...childrenOf(['meilyr-creyr'], 'marriage-grippiud-caru-creyr'),
    ...childrenOf(['evan-creyr', 'gwynfa-creyr'], 'marriage-rhosyn-cadoc-llwynog'),
    ...childrenOf(['ilar-creyr', 'gwenog-creyr'], 'marriage-genofeva-madoc'),
    ...childrenOf(['talan-creyr', 'hollie-creyr'], 'marriage-gwenifer-dadweir-hwyaden'),
    ...childrenOf(['pebin-creyr', 'imanie-creyr'], 'marriage-meilyr-olwyna-creyr')
  ],
  cadetBranches: [
    marriedAway('married-away-tudorwen-creyr-tylluan', 'Haus Tylluan', 'marriage-tudorwen-blegwywyrd-creyr', 'house-tylluan', 'haus-tylluan'),
    marriedAway('married-away-ariene-creyr-wylan', 'Haus Wylan', 'marriage-trachmyr-ariene', 'house-wylan', 'haus-wylan', HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-blodwen-creyr-saith', 'Haus Saith', 'marriage-blodwen-lancel-creyr', 'house-saith', 'haus-saith'),
    marriedAway('married-away-meredid-creyr-coedwig', 'Haus Coedwig', 'marriage-meredid-hoyer-creyr', 'house-coedwig', 'haus-coedwig', HOUSE_EMBLEMS.coedwig),
    marriedAway('married-away-gwenllian-creyr-dyngwn', 'Haus Dyngwn', 'marriage-gethin-gwenllian-dyngwn', 'house-dyngwn', 'haus-dyngwn', HOUSE_EMBLEMS.dyngwn),
    marriedAway('married-away-eurfron-creyr-gaeth', 'Haus Gaeth', 'marriage-eurfron-tudor-creyr', 'house-gaeth', 'haus-gaeth')
  ],
  timeJumps: [
    {
      id: 'gap-founders-to-maldwyn-creyr',
      parentPartnershipId: 'marriage-rhodhri-tanwen',
      parentPersonId: '',
      childIds: ['maldwyn-creyr-dinefwr', 'llwyrddyddwg-creyr'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Créyr-Generationen',
      notes: 'Der absolute Trenner liegt seriell unter Rhodhri, Tanwen und dem Créyr-Hauswappen. Er steht nicht parallel zu einem Personen- oder Hausknoten.',
      extensions: {}
    },
    {
      id: 'gap-maldwyn-to-cadwaladr-creyr',
      parentPartnershipId: 'marriage-siriol-maldwyn-dinefwr',
      parentPersonId: '',
      childIds: ['cadwaladr-creyr', 'tudorwen-creyr'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '1607',
      label: 'Die belegte Créyr-Linie setzt 1607 wieder ein',
      notes: 'Der zweite absolute Trenner liegt ausschließlich unter Maldwyn und Siriol und führt seriell zur Cadwaladr-Generation.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-rhodhri-tanwen',
    houseId: CREYR_HOUSE_ID,
    crestSubtitle: 'Baronshaus von Esgairmor · Kadettenhaus der Wylan',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'rhodhri-wylan',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 4,
    sourceModule: "Haus Créyr O'Esgairmor (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Ehen, Porträts, Baronsfolge und Erbfolge folgen der bereitgestellten Créyr-Hausseite. Rhodhri Wylan und Tanwen Hwyaden tragen als Gründerpaar das Créyr-Hauswappen; der erste Zeitsprung liegt strikt darunter und führt erst danach zu Maldwyn und Llwyrddyddwg. Der zweite Zeitsprung führt ausschließlich von Maldwyn und Siriol zur Cadwaladr-Generation. Nachkommen werden nur in den fortgeführten Créyr-Zweigen dargestellt. Die Wylan-Nachkommen von Trachmyr und Ariene sowie die Dyngwn-Nachkommen von Gethin und Gwenllian verbleiben ausschließlich in ihren jeweiligen Gegenakten. Tudorwen, Ariene, Blodwen, Meredid, Gwenllian und Eurfron besitzen an ihren belegten Ehen direkte Wegverheiratet-Knoten. Gemeinsame Personen und Ehen behalten die vorhandenen Welt- und Beziehungs-IDs. Die neuere Gwaedlyd-Quelle ordnet Zara Coedwig eindeutig Talan Gwaedlyd zu; Talan Créyr bleibt daher ohne diese widersprüchliche Verlobung. Wiederholte generische Silhouetten und zwei namenlose Verlobten-Platzhalter wurden nicht als individuelle Personen importiert.',
    registryTombstones: {
      persons: ['zara-coedwig'],
      partnerships: ['engagement-talan-zara-coedwig']
    },
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems']
  }
});
