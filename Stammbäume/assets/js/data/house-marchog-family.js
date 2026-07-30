import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_MARCHOG_PORTRAITS } from './house-marchog-portraits.js';
import {
  AEHRENTAL_HOUSE_EMBLEMS,
  AEHRENTAL_HOUSE_PROFILES
} from './aehrental-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const MARCHOG_HOUSE_ID = 'house-marchog';
const MARCHOG_EMBLEM = AEHRENTAL_HOUSE_EMBLEMS.marchog;

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
  'breannain-marchog': 'Ritterfürst von Glyndraith · Gründer und Oberhaupt',
  'rhodrhi-marchog': 'Erster Erbe des Hauses Marchog',
  'hevedydd-marchog': 'Zweiter Erbe des Hauses Marchog',
  'llyonell-marchog': 'Dritter Erbe des Hauses Marchog',
  'brizio-marchog': 'Vierter Erbe des Hauses Marchog',
  'caraf-marchog': 'Fünfter Erbe des Hauses Marchog'
});

function lineageRoleFor(personId) {
  if (personId === 'breannain-marchog') return 'head';
  return SUCCESSION_TITLES[personId] ? 'mainline' : 'branch';
}

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId: options.houseId === undefined ? MARCHOG_HOUSE_ID : options.houseId,
    portrait: HOUSE_MARCHOG_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
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

function spouse(id, name, sex, birth, death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function affair(id, name, birth, childName) {
  return spouse(id, name, 'female', birth, '', '', {
    familyRole: 'affair',
    title: `Affäre Bréannains · Mutter von ${childName}`,
    tags: ['Affäre'],
    notes: `Aus dieser Affäre stammt ausschließlich ${childName}.`
  });
}

function bastard(id, name, sex, birth, motherName) {
  return person(id, name, sex, birth, '', {
    familyRole: 'bastard',
    title: `Bastardkind von Bréannain & ${motherName}`,
    tags: ['Bastard'],
    notes: `Die Quelle ordnet ${name} ausdrücklich der Affäre Bréannains mit ${motherName} zu.`
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: `Wegverheiratet an ${targetHouseName}`,
    tags: ['Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, { status: 'ended', end });
}

function familyAffair(id, firstId, secondId) {
  return createMarriage(id, firstId, secondId, {
    type: 'affair',
    status: 'ended',
    visibility: 'private'
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

const COUPLES = Object.freeze({
  origins: ['unknown-father-marchog', 'unknown-mother-marchog'],
  delwen: ['breannain-marchog', 'delwen'],
  arianwen: ['breannain-marchog', 'arianwen'],
  mari: ['breannain-marchog', 'mari-marchog-affair'],
  mabli: ['breannain-marchog', 'mabli-marchog-affair'],
  yvain: ['yvain-marchog', 'wyanetha'],
  rhodrhi: ['rhodrhi-marchog', 'jenifry'],
  owain: ['owain-marchog', 'wennaig'],
  jennalyn: ['jennalyn-marchog', 'ysolde'],
  hevedydd: ['hevedydd-marchog', 'lleulu'],
  meical: ['meical-marchog', 'ael'],
  tegvan: ['tegvan-marchog', 'afanen'],
  syvwlch: ['syvwlch-marchog', 'gwawr'],
  rhianu: ['rhianu-marchog', 'harry'],
  llyonell: ['glenys-grawn', 'llyonell-marchog'],
  imanie: ['imanie-marchog', 'bricelyn-morcanhuc'],
  lyon: ['lyon-marchog', 'cymraes-ciarog'],
  gwenaelle: ['gwenaelle-marchog', 'mawr-canwyll'],
  maddox: ['maddox-marchog', 'kerenza-baedd'],
  tirian: ['tirian-marchog', 'eiddwen-tir-addawol']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-unknown-origins-marchog': COUPLES.origins,
  'marriage-breannain-delwen': COUPLES.delwen,
  'marriage-breannain-arianwen': COUPLES.arianwen,
  'affair-breannain-mari': COUPLES.mari,
  'affair-breannain-mabli': COUPLES.mabli,
  'marriage-yvain-wyanetha-marchog': COUPLES.yvain,
  'marriage-rhodrhi-jenifry-marchog': COUPLES.rhodrhi,
  'marriage-owain-wennaig-marchog': COUPLES.owain,
  'marriage-jennalyn-ysolde-marchog': COUPLES.jennalyn,
  'marriage-hevedydd-lleulu-marchog': COUPLES.hevedydd,
  'marriage-meical-ael-marchog': COUPLES.meical,
  'marriage-tegvan-afanen-marchog': COUPLES.tegvan,
  'marriage-syvwlch-gwawr-marchog': COUPLES.syvwlch,
  'marriage-rhianu-harry-marchog': COUPLES.rhianu,
  'marriage-glenys-llyonell': COUPLES.llyonell,
  'marriage-imanie-bricelyn-marchog': COUPLES.imanie,
  'marriage-lyon-cymraes-marchog': COUPLES.lyon,
  'marriage-gwenaelle-mawr-marchog': COUPLES.gwenaelle,
  'marriage-maddox-kerenza-marchog': COUPLES.maddox,
  'marriage-eiddwen-tirian-marchog': COUPLES.tirian
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'marchog-parentage', ...options }
  );
}

function marriedAway({ id, name, partnershipId, houseId, targetFamilyId, emblem = '' }) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: `Wegverheiratet an ${name}`
  });
}

export const HOUSE_MARCHOG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-marchog',
    title: "Haus Marchog O'Glyndraith",
    motto: '',
    description: 'Junges Ritterfürstenhaus aus Glyndraith, das 1720 für Bréannains wagemutige Versorgung der belagerten Stadt aus einer Krabbenfischerfamilie erhoben wurde.',
    emblem: MARCHOG_EMBLEM,
    houseProfile: AEHRENTAL_HOUSE_PROFILES.marchog
  },
  houses: [
    house(MARCHOG_HOUSE_ID, "Haus Marchog O'Glyndraith", MARCHOG_EMBLEM),
    house('house-grawn', "Haus Grawn O'Glyndraith", AEHRENTAL_HOUSE_EMBLEMS.grawn),
    house('house-morcanhuc', 'Haus Morcanhuc', AEHRENTAL_HOUSE_EMBLEMS.morcanhuc),
    house('house-ciarog', 'Haus Ciaróg', AEHRENTAL_HOUSE_EMBLEMS.ciarog),
    house('house-canwyll', 'Haus Canwyll'),
    house('house-baedd', 'Haus Baedd', AEHRENTAL_HOUSE_EMBLEMS.baedd),
    house('house-tir-addawol', 'Haus Tir Addawol', WEIDEBUCHT_HOUSE_EMBLEMS['tir-addawol']),
    house('house-unknown', 'Unbekanntes Haus')
  ],
  persons: [
    person('unknown-father-marchog', '???', 'male', '????', '????', {
      title: 'Unbekannter Vater Bréannains',
      notes: 'Die Quelle führt Bréannain als Sohn zweier nicht überlieferter Eltern.'
    }),
    person('unknown-mother-marchog', '???', 'female', '????', '????', {
      title: 'Unbekannte Mutter Bréannains',
      notes: 'Die Quelle führt Bréannain als Sohn zweier nicht überlieferter Eltern.'
    }),
    person('breannain-marchog', 'Bréannain Marchog', 'male', '1633', '', {
      notes: 'Ehemaliger Krabbenfischer und einfacher Seemann. Nach seiner nächtlichen Versorgungsfahrt während der Belagerung erhob Iorwerth Grawn ihn 1720 im Alter von 87 Jahren zum Ritterfürsten.'
    }),
    spouse('delwen', 'Delwen', 'female', '1634', '1655', '', { title: 'Erste Ehefrau Bréannains' }),
    spouse('arianwen', 'Arianwen', 'female', '1638', '1700', '', { title: 'Zweite Ehefrau Bréannains' }),
    affair('mari-marchog-affair', 'Mari', '1694', 'Enora Marchog'),
    affair('mabli-marchog-affair', 'Mabli', '1706', 'Evain Marchog'),

    person('yvain-marchog', 'Yvain Marchog', 'male', '1652', '????'),
    person('rhodrhi-marchog', 'Rhodrhi Marchog', 'male', '1654'),
    person('owain-marchog', 'Owain Marchog', 'male', '1656', '????'),
    person('jennalyn-marchog', 'Jennalyn Marchog', 'male', '1658'),
    bastard('enora-marchog', 'Enora Marchog', 'female', '1727', 'Mari'),
    bastard('evain-marchog', 'Evain Marchog', 'male', '1731', 'Mabli'),
    spouse('wyanetha', 'Wyanetha', 'female', '1653', '1701'),
    spouse('jenifry', 'Jenifry', 'female', '1654', '1704'),
    spouse('wennaig', 'Wennaig', 'female', '1656', '1711'),
    spouse('ysolde', 'Ysolde', 'female', '1658', '1703'),

    person('hevedydd-marchog', 'Hevedydd Marchog', 'male', '1672'),
    person('meical-marchog', 'Meical Marchog', 'male', '1674', '1730'),
    person('tegvan-marchog', 'Tegvan Marchog', 'male', '1673'),
    person('syvwlch-marchog', 'Syvwlch Marchog', 'male', '1675'),
    awayWoman('rhianu-marchog', 'Rhianu Marchog', '1676', '', 'unbekanntes Haus'),
    spouse('lleulu', 'Lleulu', 'female', '1674', '1720'),
    spouse('ael', 'Ael', 'female', '1674', '1734'),
    spouse('afanen', 'Afanen', 'female', '1674', '1732'),
    spouse('gwawr', 'Gwawr', 'female', '1675', '1738'),
    spouse('harry', 'Harry', 'male', '1670', '', 'house-unknown'),

    person('llyonell-marchog', 'Llyonell Marchog', 'male', '1692', '', {
      notes: 'Die Marchog-Quelle schreibt den Vornamen „Lyonell“; die bereits kanonische Gegenakte des Hauses Grawn führt dieselbe Weltperson als „Llyonell“.'
    }),
    person('imanie-marchog', 'Imanie Marchog', 'male', '1699'),
    person('lyon-marchog', 'Lyon Marchog', 'male', '1698'),
    awayWoman('gwenaelle-marchog', 'Gwenaelle Marchog', '1700', '', 'Haus Canwyll'),
    person('maddox-marchog', 'Maddox Marchog', 'male', '1695'),
    person('tirian-marchog', 'Tirian Marchog', 'male', '1701'),
    spouse('glenys-grawn', 'Glenys Grawn', 'female', '1698', '', 'house-grawn'),
    spouse('bricelyn-morcanhuc', 'Bricelyn Morcanhuc', 'female', '1707', '', 'house-morcanhuc'),
    spouse('cymraes-ciarog', 'Cymraes Ciaróg', 'female', '1698', '', 'house-ciarog'),
    spouse('mawr-canwyll', 'Mawr Canwyll', 'male', '1700', '', 'house-canwyll'),
    spouse('kerenza-baedd', 'Kerenza Baedd', 'female', '1697', '', 'house-baedd'),
    spouse('eiddwen-tir-addawol', 'Eiddwen Tir Addawol', 'female', '1700', '', 'house-tir-addawol'),

    person('brizio-marchog', 'Brizio Marchog', 'male', '1718'),
    person('caraf-marchog', 'Caraf Marchog', 'male', '1722'),
    person('rhon-marchog', 'Rhon Marchog', 'male', '1725'),
    person('corryn-marchog', 'Corryn Marchog', 'female', '1725'),
    person('cedric-marchog', 'Cedric Marchog', 'male', '1722'),
    person('adda-marchog', 'Adda Marchog', 'female', '1726'),
    person('caled-marchog', 'Caled Marchog', 'male', '1721'),
    person('gwenifer-marchog', 'Gwenifer Marchog', 'female', '1724'),
    person('ariana-marchog', 'Ariana Marchog', 'female', '1723'),
    person('ariene-marchog', 'Ariene Marchog', 'female', '1723')
  ],
  partnerships: [
    endedMarriage('marriage-unknown-origins-marchog', ...COUPLES.origins),
    endedMarriage('marriage-breannain-delwen', ...COUPLES.delwen, '1655'),
    alignPartnerOverChildren(
      endedMarriage('marriage-breannain-arianwen', ...COUPLES.arianwen, '1700'),
      'arianwen'
    ),
    alignPartnerOverChildren(familyAffair('affair-breannain-mari', ...COUPLES.mari), 'mari-marchog-affair'),
    alignPartnerOverChildren(familyAffair('affair-breannain-mabli', ...COUPLES.mabli), 'mabli-marchog-affair'),
    endedMarriage('marriage-yvain-wyanetha-marchog', ...COUPLES.yvain, '1701'),
    endedMarriage('marriage-rhodrhi-jenifry-marchog', ...COUPLES.rhodrhi, '1704'),
    endedMarriage('marriage-owain-wennaig-marchog', ...COUPLES.owain, '1711'),
    endedMarriage('marriage-jennalyn-ysolde-marchog', ...COUPLES.jennalyn, '1703'),
    endedMarriage('marriage-hevedydd-lleulu-marchog', ...COUPLES.hevedydd, '1720'),
    endedMarriage('marriage-meical-ael-marchog', ...COUPLES.meical, '1730'),
    endedMarriage('marriage-tegvan-afanen-marchog', ...COUPLES.tegvan, '1732'),
    endedMarriage('marriage-syvwlch-gwawr-marchog', ...COUPLES.syvwlch, '1738'),
    createMarriage('marriage-rhianu-harry-marchog', ...COUPLES.rhianu),
    createMarriage('marriage-glenys-llyonell', ...COUPLES.llyonell),
    createMarriage('marriage-imanie-bricelyn-marchog', ...COUPLES.imanie),
    createMarriage('marriage-lyon-cymraes-marchog', ...COUPLES.lyon),
    createMarriage('marriage-gwenaelle-mawr-marchog', ...COUPLES.gwenaelle),
    createMarriage('marriage-maddox-kerenza-marchog', ...COUPLES.maddox),
    createMarriage('marriage-eiddwen-tirian-marchog', ...COUPLES.tirian)
  ],
  parentages: [
    ...childrenOf(['breannain-marchog'], 'marriage-unknown-origins-marchog'),
    ...childrenOf(['yvain-marchog', 'rhodrhi-marchog'], 'marriage-breannain-delwen'),
    ...childrenOf(['owain-marchog', 'jennalyn-marchog'], 'marriage-breannain-arianwen'),
    ...childrenOf(['enora-marchog'], 'affair-breannain-mari', {
      legitimacy: 'illegitimate',
      notes: 'Enora ist ausschließlich das Kind aus Bréannains Affäre mit Mari.'
    }),
    ...childrenOf(['evain-marchog'], 'affair-breannain-mabli', {
      legitimacy: 'illegitimate',
      notes: 'Evain ist ausschließlich das Kind aus Bréannains Affäre mit Mabli.'
    }),
    ...childrenOf(['hevedydd-marchog', 'meical-marchog'], 'marriage-yvain-wyanetha-marchog'),
    ...childrenOf(['tegvan-marchog'], 'marriage-rhodrhi-jenifry-marchog'),
    ...childrenOf(['syvwlch-marchog'], 'marriage-owain-wennaig-marchog'),
    ...childrenOf(['rhianu-marchog'], 'marriage-jennalyn-ysolde-marchog'),
    ...childrenOf(['llyonell-marchog', 'imanie-marchog'], 'marriage-hevedydd-lleulu-marchog'),
    ...childrenOf(['lyon-marchog'], 'marriage-meical-ael-marchog'),
    ...childrenOf(['gwenaelle-marchog'], 'marriage-tegvan-afanen-marchog'),
    ...childrenOf(['maddox-marchog', 'tirian-marchog'], 'marriage-syvwlch-gwawr-marchog'),
    ...childrenOf(['brizio-marchog', 'caraf-marchog'], 'marriage-glenys-llyonell'),
    ...childrenOf(['rhon-marchog', 'corryn-marchog'], 'marriage-imanie-bricelyn-marchog'),
    ...childrenOf(['cedric-marchog', 'adda-marchog'], 'marriage-lyon-cymraes-marchog'),
    ...childrenOf(['caled-marchog', 'gwenifer-marchog'], 'marriage-maddox-kerenza-marchog'),
    ...childrenOf(['ariana-marchog', 'ariene-marchog'], 'marriage-eiddwen-tirian-marchog')
  ],
  cadetBranches: [
    marriedAway({
      id: 'married-away-rhianu-marchog-unknown',
      name: 'Unbekanntes Haus',
      partnershipId: 'marriage-rhianu-harry-marchog',
      houseId: 'house-unknown',
      targetFamilyId: 'haus-unbekannt'
    }),
    marriedAway({
      id: 'married-away-gwenaelle-marchog-canwyll',
      name: 'Haus Canwyll',
      partnershipId: 'marriage-gwenaelle-mawr-marchog',
      houseId: 'house-canwyll',
      targetFamilyId: 'haus-canwyll'
    })
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-unknown-origins-marchog',
    houseId: MARCHOG_HOUSE_ID,
    crestSubtitle: 'Ritterfürstliches Haus von Glyndraith · gegründet 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-father-marchog',
    orientation: 'vertical',
    ancestorDepth: 12,
    descendantDepth: 12,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceNote: 'Genealogie, Lebensdaten, Erbfolge und Porträts folgen der bereitgestellten Marchog-Haustabelle. Bréannain bleibt trotz der unbekannten Eltern ausdrücklich der Gründer: Der Hausknoten liegt als genealogischer Trenner zwischen den anonymen Eltern und dem ersten namentlich belegten Marchog. Seine Kinder aus beiden Ehen bleiben ihren tatsächlichen Müttern zugeordnet; Enora und Evain hängen getrennt unter den Affären mit Mari beziehungsweise Mabli. Die Gegenakten-IDs für Llyonell/Glenys und Tirian/Eiddwen werden unverändert wiederverwendet. Rhianu und Gwenaelle erhalten die vorgeschriebenen Wegverheiratet-Verknüpfungen; die junge Generation bleibt unverheiratet und unverlobt.',
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
