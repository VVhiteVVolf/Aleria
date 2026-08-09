import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { HOUSE_UNIGOL_PORTRAITS } from './house-unigol-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const UNIGOL_HOUSE_ID = 'house-unigol';
const UNIGOL_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.unigol;

const HOUSE_EMBLEMS = Object.freeze({
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
  canwyll: SILBERINSEL_HOUSE_EMBLEMS.canwyll,
  chiffyddlon: AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon,
  crafanc: KLAUENINSEL_HOUSE_EMBLEMS.crafanc,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  cwningod: KLAUENINSEL_HOUSE_EMBLEMS.cwningod,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  eirth: KLAUENINSEL_HOUSE_EMBLEMS.eirth,
  morthwyll: KLAUENINSEL_HOUSE_EMBLEMS.morthwyll,
  pawen: KLAUENINSEL_HOUSE_EMBLEMS.pawen,
  selwyn: KLAUENINSEL_HOUSE_EMBLEMS.selwyn,
  sgwarnog: AEHRENTAL_HOUSE_EMBLEMS.sgwarnog,
  unigol: UNIGOL_EMBLEM
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

const MAINLINE_IDS = new Set([
  'trahaern-arth',
  'trachmyr-unigol',
  'tarawg-unigol',
  'tryffin-unigol',
  'neidion-unigol',
  'rhiwallon-unigol',
  'tawny-unigol'
]);

function lineageRoleFor(personId) {
  if (personId === 'neidion-unigol') return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? UNIGOL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_UNIGOL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === UNIGOL_HOUSE_ID ? 'core' : 'married'),
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

function marriedAwayPerson(id, name, sex, birth, death, targetHouseName, options = {}) {
  return person(id, name, sex, birth, death, {
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
    ...(emblem ? { extensions: { registryManagedFields: ['name', 'emblem'] } } : {})
  };
}

const COUPLES = Object.freeze({
  founders: ['trahaern-arth', 'ceridwen-pawen'],
  trachmyr: ['kerenza-1627-crafanc', 'trachmyr-unigol'],
  sioned: ['gwennan-dienyddiwr', 'sioned-dienyddiwr-spouse'],
  tarawg: ['tarawg-unigol', 'rhonwen-cwningod'],
  hafren: ['hafren-unigol', 'garselid-selwyn'],
  tryffin: ['tryffin-unigol', 'tymora-morthwyll'],
  gwenfrewi: ['maelgwn-chiffyddlon', 'gwenfrewi-unigol'],
  penkawr: ['cefinwen-crefyddol', 'penkawr-unigol'],
  neidion: ['neidion-unigol', 'tamsin-diud'],
  olwyn: ['olwyn-unigol', 'cathal-lockart'],
  dafydd: ['dafydd-unigol', 'gaynor-eirth'],
  ewynn: ['morganwg-sgwarnog', 'ewynn-unigol'],
  rhiwallon: ['rhiwallon-unigol', 'eirwyn-eirth'],
  rhianu: ['rhianu-unigol', 'cledwyn-selwyn'],
  wynston: ['llewella-1699-canwyll', 'wynston-unigol']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-trahaern-ceridwen': COUPLES.founders,
  'marriage-kerenza-trachmyr-crafanc': COUPLES.trachmyr,
  'marriage-gwennan-sioned-dienyddiwr': COUPLES.sioned,
  'marriage-tarawg-rhonwen-unigol': COUPLES.tarawg,
  'marriage-hafren-garselid-unigol': COUPLES.hafren,
  'marriage-tryffin-tymora-unigol': COUPLES.tryffin,
  'marriage-maelgwn-gwenfrewi-chiffyddlon': COUPLES.gwenfrewi,
  'marriage-cefinwen-penkawr-unigol': COUPLES.penkawr,
  'marriage-neidion-tamsin-unigol': COUPLES.neidion,
  'marriage-olwyn-cathal-unigol': COUPLES.olwyn,
  'marriage-dafydd-gaynor-unigol': COUPLES.dafydd,
  'marriage-morganwg-ewynn-sgwarnog': COUPLES.ewynn,
  'marriage-rhiwallon-eirwyn-unigol': COUPLES.rhiwallon,
  'marriage-rhianu-cledwyn-unigol': COUPLES.rhianu,
  'marriage-llewella-wynston-canwyll': COUPLES.wynston
});

function childrenOf(childIds, partnershipId) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'unigol-parentage'
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
    extensions: { registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem'] }
  });
}

export const HOUSE_UNIGOL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-unigol',
    title: "Haus Unigol O'Caer Marwor",
    motto: 'Unbeugsam im Leben, kämpfend auch im Tod.',
    description: 'Von Trahaern Arth und Ceridwen Pawen begründetes Kadettenhaus der Arth und Ritterfürstenhaus der Frostklaue.',
    emblem: UNIGOL_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.unigol
  },
  houses: [
    house(UNIGOL_HOUSE_ID, "Haus Unigol O'Caer Marwor", UNIGOL_EMBLEM),
    house('house-arth', "Haus Arth O'Talgarth", HOUSE_EMBLEMS.arth),
    house('house-pawen', "Haus Pawen O'Talgarth", HOUSE_EMBLEMS.pawen),
    house('house-crafanc', "Haus Crafanc O'Talgarth", HOUSE_EMBLEMS.crafanc),
    house('house-dienyddiwr', "Haus Dienyddiwr O'Mathragon", HOUSE_EMBLEMS.dienyddiwr),
    house('house-cwningod', "Haus Cwningod O'Morea", HOUSE_EMBLEMS.cwningod),
    house('house-selwyn', "Haus Sélwyn O'Caer Ebirth", HOUSE_EMBLEMS.selwyn),
    house('house-morthwyll', "Haus Morthwyl O'Caer Morben", HOUSE_EMBLEMS.morthwyll),
    house('house-chiffyddlon', 'Haus Chiffyddlon', HOUSE_EMBLEMS.chiffyddlon),
    house('house-crefyddol', "Haus Crefyddol O'Llanvane", HOUSE_EMBLEMS.crefyddol),
    house('house-diud', 'Haus Diud'),
    house('house-lockart', 'Haus Lockart'),
    house('house-eirth', "Haus Eirth O'Caer Glaslyn", HOUSE_EMBLEMS.eirth),
    house('house-sgwarnog', "Haus Sgwarnog O'Aldwynd", HOUSE_EMBLEMS.sgwarnog),
    house('house-canwyll', "Haus Canwyll O'Llanvane", HOUSE_EMBLEMS.canwyll)
  ],
  persons: [
    person('trahaern-arth', 'Trahaern Arth', 'male', '1594', '1669', {
      houseId: 'house-arth',
      familyRole: 'core',
      title: 'Stammvater, Gründer und erster Ritterfürst des Hauses Unigol 1644–1669',
      tags: ['Kadettenhausgründer']
    }),
    spouse('ceridwen-pawen', 'Ceridwen Pawen', 'female', '1595', '1662', 'house-pawen', {
      title: 'Stammmutter und Mitgründerin des Hauses Unigol',
      tags: ['Kadettenhausgründerin']
    }),

    person('trachmyr-unigol', 'Trachmyr Unigol', 'male', '1628', '1684', {
      title: 'Ritterfürst und Oberhaupt des Hauses Unigol 1669–1684'
    }),
    spouse('kerenza-1627-crafanc', 'Kerenza Crafanc', 'female', '1627', '1669', 'house-crafanc'),
    marriedAwayPerson('sioned-dienyddiwr-spouse', 'Sioned Unigol', 'female', '1617', '1691', 'Haus Dienyddiwr', {
      worldPersonId: 'person--haus-unigol--sioned-dienyddiwr-spouse',
      notes: 'Die ausgearbeitete Dienyddiwr-Gegenakte präzisiert Sioneds Todesjahr auf 1691.'
    }),
    spouse('gwennan-dienyddiwr', 'Gwennan Dienyddiwr', 'male', '1617', '1674', 'house-dienyddiwr', {
      notes: 'Die ausgearbeitete Dienyddiwr-Gegenakte präzisiert Gwennans Todesjahr auf 1674.'
    }),

    person('tarawg-unigol', 'Tarawg Unigol', 'male', '1644', '1706', {
      title: 'Ritterfürst und Oberhaupt des Hauses Unigol 1684–1706'
    }),
    marriedAwayPerson('hafren-unigol', 'Hafren Unigol', 'female', '1646', '1688', 'Haus Sélwyn'),
    spouse('rhonwen-cwningod', 'Rhonwen Cwningod', 'female', '1639', '', 'house-cwningod'),
    spouse('garselid-selwyn', 'Garselid Sélwyn', 'male', '1640', '1699', 'house-selwyn'),

    person('tryffin-unigol', 'Tryffin Unigol', 'male', '1661', '1720', {
      title: 'Ritterfürst und Oberhaupt des Hauses Unigol 1706–1720',
      notes: 'Die Ämtertabelle nennt abweichend 1721; die Personenquelle führt Tryffins Tod im Jahr 1720.'
    }),
    marriedAwayPerson('gwenfrewi-unigol', 'Gwenfrewi Unigol', 'female', '1652', '1705', 'Haus Chiffyddlon', {
      notes: 'Die ausgearbeitete Chiffyddlon-Gegenakte hat Vorrang vor den abweichenden Unigol-Quelldaten 1662–1720.'
    }),
    person('penkawr-unigol', 'Penkawr Unigol', 'male', '1663', '1725', {
      notes: 'Das Quellenjahr 1625 ist ein offensichtlicher Zahlendreher; die Crefyddol-Gegenakte bestätigt 1725.'
    }),
    spouse('tymora-morthwyll', 'Tymora Morthwyll', 'female', '1659', '1721', 'house-morthwyll'),
    spouse('maelgwn-chiffyddlon', 'Maelgwn Chiffyddlon', 'male', '1651', '1704', 'house-chiffyddlon'),
    spouse('cefinwen-crefyddol', 'Cefinwen Crefyddol', 'female', '1664', '', 'house-crefyddol'),

    person('neidion-unigol', 'Neidion Unigol', 'male', '1678', '', {
      title: 'Ritterfürst und Oberhaupt des Hauses Unigol seit 1721'
    }),
    marriedAwayPerson('olwyn-unigol', 'Olwyn Unigol', 'female', '1681', '', 'Haus Lockart'),
    person('dafydd-unigol', 'Dafydd Unigol', 'male', '1680'),
    marriedAwayPerson('ewynn-unigol', 'Ewynn Unigol', 'male', '1682', '', 'Haus Sgwarnog', {
      notes: 'Ewynn heiratet in Morganwg Sgwarnogs Linie ein; deren Kinder werden ausschließlich im Haus Sgwarnog geführt.'
    }),
    spouse('tamsin-diud', 'Tamsin Diud', 'female', '1677', '', 'house-diud'),
    spouse('cathal-lockart', 'Cathal Lockart', 'male', '1679', '', 'house-lockart'),
    spouse('gaynor-eirth', 'Gaynor Eirth', 'female', '1680', '', 'house-eirth'),
    spouse('morganwg-sgwarnog', 'Morganwg Sgwarnog', 'male', '1677', '', 'house-sgwarnog'),

    person('rhiwallon-unigol', 'Rhiwallon Unigol', 'male', '1696', '', {
      title: 'Erster Erbe des Hauses Unigol'
    }),
    marriedAwayPerson('rhianu-unigol', 'Rhianu Unigol', 'female', '1696', '', 'Haus Sélwyn'),
    person('wynston-unigol', 'Wynston Unigol', 'male', '1697'),
    spouse('eirwyn-eirth', 'Eirwyn Eirth', 'female', '1697', '', 'house-eirth'),
    spouse('cledwyn-selwyn', 'Cledwyn Sélwyn', 'male', '1694', '', 'house-selwyn'),
    spouse('llewella-1699-canwyll', 'Llewella Canwyll', 'female', '1699', '', 'house-canwyll'),

    person('tawny-unigol', 'Tawny Unigol', 'female', '1716', '', {
      title: 'Nächste Erbin des Hauses Unigol'
    }),
    person('lleulu-unigol', 'Lleulu Unigol', 'female', '1719'),
    person('rhys-unigol', 'Rhys Unigol', 'male', '1722'),
    person('unig-unigol', 'Unig Unigol', 'male', '1718'),
    person('gwen-unigol', 'Gwen Unigol', 'female', '????')
  ],
  partnerships: [
    createMarriage('marriage-trahaern-ceridwen', ...COUPLES.founders, {
      notes: 'Trahaern Arth und Ceridwen Pawen begründen gemeinsam das Kadettenhaus Unigol.'
    }),
    createMarriage('marriage-kerenza-trachmyr-crafanc', ...COUPLES.trachmyr, { status: 'ended', end: '1669' }),
    createMarriage('marriage-gwennan-sioned-dienyddiwr', ...COUPLES.sioned, { status: 'ended', end: '1674' }),
    createMarriage('marriage-tarawg-rhonwen-unigol', ...COUPLES.tarawg, { status: 'ended', end: '1706' }),
    createMarriage('marriage-hafren-garselid-unigol', ...COUPLES.hafren, { status: 'ended', end: '1688' }),
    createMarriage('marriage-tryffin-tymora-unigol', ...COUPLES.tryffin, { status: 'ended', end: '1720' }),
    createMarriage('marriage-maelgwn-gwenfrewi-chiffyddlon', ...COUPLES.gwenfrewi, { status: 'ended', end: '1704' }),
    createMarriage('marriage-cefinwen-penkawr-unigol', ...COUPLES.penkawr, { status: 'ended', end: '1725' }),
    createMarriage('marriage-neidion-tamsin-unigol', ...COUPLES.neidion),
    createMarriage('marriage-olwyn-cathal-unigol', ...COUPLES.olwyn),
    createMarriage('marriage-dafydd-gaynor-unigol', ...COUPLES.dafydd),
    createMarriage('marriage-morganwg-ewynn-sgwarnog', ...COUPLES.ewynn),
    createMarriage('marriage-rhiwallon-eirwyn-unigol', ...COUPLES.rhiwallon),
    createMarriage('marriage-rhianu-cledwyn-unigol', ...COUPLES.rhianu),
    createMarriage('marriage-llewella-wynston-canwyll', ...COUPLES.wynston)
  ],
  parentages: [
    ...childrenOf(['trachmyr-unigol', 'sioned-dienyddiwr-spouse'], 'marriage-trahaern-ceridwen'),
    ...childrenOf(['tarawg-unigol', 'hafren-unigol'], 'marriage-kerenza-trachmyr-crafanc'),
    ...childrenOf(['tryffin-unigol', 'gwenfrewi-unigol', 'penkawr-unigol'], 'marriage-tarawg-rhonwen-unigol'),
    ...childrenOf(['neidion-unigol', 'olwyn-unigol'], 'marriage-tryffin-tymora-unigol'),
    ...childrenOf(['dafydd-unigol', 'ewynn-unigol'], 'marriage-cefinwen-penkawr-unigol'),
    ...childrenOf(['rhiwallon-unigol', 'rhianu-unigol'], 'marriage-neidion-tamsin-unigol'),
    ...childrenOf(['wynston-unigol'], 'marriage-dafydd-gaynor-unigol'),
    ...childrenOf(['tawny-unigol', 'lleulu-unigol', 'rhys-unigol'], 'marriage-rhiwallon-eirwyn-unigol'),
    ...childrenOf(['unig-unigol', 'gwen-unigol'], 'marriage-llewella-wynston-canwyll')
  ],
  cadetBranches: [
    marriedAway('married-away-sioned-unigol-dienyddiwr', 'Haus Dienyddiwr', 'marriage-gwennan-sioned-dienyddiwr', 'house-dienyddiwr', 'haus-dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    marriedAway('married-away-hafren-unigol-selwyn', 'Haus Sélwyn', 'marriage-hafren-garselid-unigol', 'house-selwyn', 'haus-selwyn', HOUSE_EMBLEMS.selwyn),
    marriedAway('married-away-gwenfrewi-unigol-chiffyddlon', 'Haus Chiffyddlon', 'marriage-maelgwn-gwenfrewi-chiffyddlon', 'house-chiffyddlon', 'haus-chiffyddlon', HOUSE_EMBLEMS.chiffyddlon),
    marriedAway('married-away-olwyn-unigol-lockart', 'Haus Lockart', 'marriage-olwyn-cathal-unigol', 'house-lockart', 'haus-lockart'),
    marriedAway('married-away-ewynn-unigol-sgwarnog', 'Haus Sgwarnog', 'marriage-morganwg-ewynn-sgwarnog', 'house-sgwarnog', 'haus-sgwarnog', HOUSE_EMBLEMS.sgwarnog),
    marriedAway('married-away-rhianu-unigol-selwyn', 'Haus Sélwyn', 'marriage-rhianu-cledwyn-unigol', 'house-selwyn', 'haus-selwyn', HOUSE_EMBLEMS.selwyn)
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-trahaern-ceridwen',
    houseId: UNIGOL_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus der Frostklaue · Kadettenhaus der Arth',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'trahaern-arth',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceFamilyId: 'haus-arth',
    sourcePartnershipId: 'marriage-trahaern-ceridwen',
    sourceModule: "Haus Unigol O'Caer Marwor (bereitgestellte Altdaten)",
    sourceNote: 'Trahaern Arth und Ceridwen Pawen begründen Haus Unigol; der Hausknoten hängt direkt unter beiden und es folgt kein Zeitsprung. Nur Trachmyr und Kerenza führen die Unigol-Stammlinie weiter. Sioned, Hafren, Gwenfrewi, Olwyn, Ewynn und Rhianu erhalten direkte Wegverheiratet-Knoten; fremde Nachkommen bleiben ausschließlich in Dienyddiwr, Chiffyddlon beziehungsweise Sgwarnog. Gegenakten haben bei widersprüchlichen Daten Vorrang: Sioned lebt 1617–1691, Gwennan 1617–1674, Gwenfrewi 1652–1705, Maelgwn 1651–1704 und Penkawr 1663–1725. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
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
