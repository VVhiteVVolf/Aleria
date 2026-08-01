import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import {
  GRAUE_WEITE_HOUSE_EMBLEMS,
  GRAUE_WEITE_HOUSE_PROFILES
} from './graue-weite-house-profiles.js';
import { HOUSE_WIVERN_PORTRAITS } from './house-wivern-portraits.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import { TAL_DER_MILANE_HOUSE_EMBLEMS } from './tal-der-milane-house-profiles.js';

const WIVERN_HOUSE_ID = 'house-wivern';
const WIVERN_EMBLEM = GRAUE_WEITE_HOUSE_EMBLEMS.wivern;
const FOUNDER_TIME_JUMP_ID = 'gap-wivern-founders-to-jowaneth-guenevere';

const HOUSE_EMBLEMS = Object.freeze({
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  brithyll: GRAUE_WEITE_HOUSE_EMBLEMS.brithyll,
  canwyll: SILBERINSEL_HOUSE_EMBLEMS.canwyll,
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  draenog: GRAUE_WEITE_HOUSE_EMBLEMS.draenog,
  grawn: AEHRENTAL_HOUSE_EMBLEMS.grawn,
  gwialen: GRAUE_WEITE_HOUSE_EMBLEMS.gwialen,
  illygoden: GRAUE_WEITE_HOUSE_EMBLEMS.illygoden,
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil,
  pysgod: GRAUE_WEITE_HOUSE_EMBLEMS.pysgod,
  tylluan: TAL_DER_MILANE_HOUSE_EMBLEMS.tylluan,
  wivern: WIVERN_EMBLEM
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

const HOUSE_HEAD_IDS = new Set([
  'ulysses-founder-wivern',
  'jowaneth-wivern',
  'islwyn-wivern'
]);
const HEIR_IDS = new Set([
  'ulysses-1672-wivern',
  'brynmor-wivern',
  'ulfyn-wivern',
  'branek-wivern'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? WIVERN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_WIVERN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === WIVERN_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth, death, houseId = '', options = {}) {
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
  founders: ['ulysses-founder-wivern', 'ulaeth-founder-wivern'],
  jowaneth: ['sorcha-borthwick', 'jowaneth-wivern'],
  guenevere: ['guenevere-wivern', 'tudwallon-tylwyth'],
  islwyn: ['eirwyn-1654-pysgod', 'islwyn-wivern'],
  blodwen: ['cafael-morfil', 'blodwen-wivern'],
  nerys: ['wyndham-grawn', 'nerys-wivern'],
  yspaddaden: ['yspaddaden-wivern', 'endelyn-unknown-wivern'],
  ulysses: ['zethyra-draenog', 'ulysses-1672-wivern'],
  arwen: ['ifwin-brithyll', 'arwen-wivern'],
  cerdd: ['gwennan-arth', 'cerdd-wivern'],
  zyraline: ['urien-canwyll', 'zyraline-wivern'],
  brynmor: ['alwen-gwialen', 'brynmor-wivern'],
  nolwenn: ['nolwenn-wivern', 'kevern-illygoden'],
  caiomhe: ['caiomhe-wivern', 'brysia-coedwig'],
  wynoc: ['jenara-tylluan', 'wynoc-wivern'],
  boudwin: ['boudwin-wivern', 'blaun-crwynog']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-ulysses-ulaeth-wivern': COUPLES.founders,
  'marriage-jowaneth-sorcha-wivern': COUPLES.jowaneth,
  'marriage-guenevere-tudwallon-wivern': COUPLES.guenevere,
  'marriage-eirwyn1654-islwyn': COUPLES.islwyn,
  'marriage-cafael-blodwen-morfil': COUPLES.blodwen,
  'marriage-wyndham-nerys': COUPLES.nerys,
  'marriage-yspaddaden-endelyn-wivern': COUPLES.yspaddaden,
  'marriage-ulysses-zethyra-wivern': COUPLES.ulysses,
  'marriage-ifwin-arwen-brithyll': COUPLES.arwen,
  'marriage-gwennan-cerdd': COUPLES.cerdd,
  'marriage-urien-zyraline-canwyll': COUPLES.zyraline,
  'marriage-alwen-brynmor-gwialen': COUPLES.brynmor,
  'marriage-nolwenn-kevern-wivern': COUPLES.nolwenn,
  'marriage-caiomhe-brysia-coedwig': COUPLES.caiomhe,
  'marriage-jenara-wynoc-tylluan': COUPLES.wynoc,
  'marriage-boudwin-blaun-wivern': COUPLES.boudwin
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'wivern-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, emblem = '', options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: options.targetFamilyId || houseId.replace(/^house-/, 'haus-'),
    emblem,
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || '',
    extensions: {
      registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem']
    }
  });
}

export const HOUSE_WIVERN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-wivern',
    title: "Haus Wivern O'Coedlyn",
    motto: "Gyda chronfa haern i mewn i'r gaeaf.",
    description: 'Altes Baronshaus von Eichenlicht aus der Handelsstadt Coedlyn in der Grauen Weite.',
    emblem: WIVERN_EMBLEM,
    houseProfile: GRAUE_WEITE_HOUSE_PROFILES.wivern
  },
  houses: [
    house(WIVERN_HOUSE_ID, "Haus Wivern O'Coedlyn", HOUSE_EMBLEMS.wivern),
    house('house-pysgod', "Haus Pysgod O'Tredegar", HOUSE_EMBLEMS.pysgod),
    house('house-borthwick', 'Haus Borthwick'),
    house('house-tylwyth', 'Haus Tylwyth'),
    house('house-morfil', "Haus Morfil O'Talsarn", HOUSE_EMBLEMS.morfil),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
    house('house-brithyll', 'Haus Brithyll', HOUSE_EMBLEMS.brithyll),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-canwyll', 'Haus Canwyll', HOUSE_EMBLEMS.canwyll),
    house('house-gwialen', 'Haus Gwialen', HOUSE_EMBLEMS.gwialen),
    house('house-illygoden-tredegar', "Haus Illygoden O'Tredegar", HOUSE_EMBLEMS.illygoden),
    house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig),
    house('house-tylluan', 'Haus Tylluan', HOUSE_EMBLEMS.tylluan),
    house('house-crwynog', 'Haus Crwynog'),
    house('house-morgryn', 'Haus Morgryn'),
    house('house-unbekannt-endelyn', 'Unbekanntes Haus')
  ],
  persons: [
    person('ulysses-founder-wivern', 'Ulysses Wivern', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Gründer und erster Baron des Hauses Wivern'
    }),
    spouse('ulaeth-founder-wivern', 'Ulaeth', 'female', '????', '????', WIVERN_HOUSE_ID, {
      familyRole: 'founder',
      title: 'Mitgründerin des Hauses Wivern'
    }),

    person('jowaneth-wivern', 'Jowaneth Wivern', 'male', '1630', '1709', {
      title: 'Baron des Hauses Wivern bis 1709'
    }),
    awayWoman('guenevere-wivern', 'Guenevere Wivern', '1633', '1696', 'Haus Tylwyth'),
    spouse('sorcha-borthwick', 'Sorcha Borthwick', 'female', '1632', '1715', 'house-borthwick'),
    spouse('tudwallon-tylwyth', 'Tudwallon Tylwyth', 'male', '1631', '1676', 'house-tylwyth'),

    person('islwyn-wivern', 'Islwyn Wivern', 'male', '1651', '', {
      title: 'Baron des Hauses Wivern seit 1709'
    }),
    awayWoman('blodwen-wivern', 'Blodwen Wivern', '1656', '1732', "Haus Morfil O'Talsarn"),
    awayWoman('nerys-wivern', 'Nerys Wivern', '1651', '1733', 'Haus Grawn', {
      notes: 'Die ausgearbeitete Grawn-Gegenakte ist für die Lebensdaten kanonisch. Die Wivern-Altquelle nennt abweichend 1658–1702.'
    }),
    person('yspaddaden-wivern', 'Yspaddaden Wivern', 'male', '1658', '1720'),
    spouse('eirwyn-1654-pysgod', 'Eirwyn Pysgod', 'female', '1654', '1730', 'house-pysgod', {
      notes: 'In der Wivern-Altquelle als Erwynn geschrieben; die ausgearbeitete Pysgod-Gegenakte führt Eirwyn.'
    }),
    spouse('cafael-morfil', 'Cafael Morfil', 'male', '1649', '1723', 'house-morfil'),
    spouse('wyndham-grawn', 'Wyndham Grawn', 'male', '1650', '1720', 'house-grawn', {
      notes: 'Die ausgearbeitete Grawn-Gegenakte ist für die Lebensdaten kanonisch. Die Wivern-Altquelle nennt abweichend 1654–1700.'
    }),
    spouse('endelyn-unknown-wivern', 'Endelyn', 'female', '1658', '1730', 'house-unbekannt-endelyn'),

    person('ulysses-1672-wivern', 'Ulysses Wivern', 'male', '1672', '', {
      title: 'Erster Erbe des Hauses Wivern'
    }),
    awayWoman('arwen-wivern', 'Arwen Wivern', '1677', '', 'Haus Brithyll'),
    person('cerdd-wivern', 'Cerdd Wivern', 'male', '1676', ''),
    awayWoman('zyraline-wivern', 'Zyraline Wivern', '1680', '', 'Haus Canwyll'),
    spouse('zethyra-draenog', 'Zethyra Draenog', 'female', '1677', '', 'house-draenog'),
    spouse('ifwin-brithyll', 'Ifwin Brithyll', 'male', '1677', '', 'house-brithyll'),
    spouse('gwennan-arth', 'Gwennan Arth', 'female', '1678', '1700', 'house-arth'),
    spouse('urien-canwyll', 'Urien Canwyll', 'male', '1680', '', 'house-canwyll'),

    person('brynmor-wivern', 'Brynmor Wivern', 'male', '1695', '', {
      title: 'Zweiter Erbe des Hauses Wivern'
    }),
    awayWoman('nolwenn-wivern', 'Nolwenn Wivern', '1700', '', "Haus Illygoden O'Tredegar"),
    person('caiomhe-wivern', 'Caiomhe Wivern', 'male', '1697', ''),
    person('wynoc-wivern', 'Wynoc Wivern', 'male', '1695', ''),
    person('boudwin-wivern', 'Boudwin Wivern', 'male', '1700', ''),
    spouse('alwen-gwialen', 'Alwen Gwialen', 'female', '1699', '', 'house-gwialen'),
    spouse('kevern-illygoden', 'Kevern Illygoden', 'male', '1697', '', 'house-illygoden-tredegar'),
    spouse('brysia-coedwig', 'Brysia Coedwig', 'female', '1696', '', 'house-coedwig'),
    spouse('jenara-tylluan', 'Jenara Tylluan', 'female', '1700', '', 'house-tylluan'),
    spouse('blaun-crwynog', 'Blaun Crwynog', 'female', '1702', '', 'house-crwynog'),

    person('ulfyn-wivern', 'Ulfyn Wivern', 'male', '1722', '', {
      title: 'Dritter Erbe des Hauses Wivern'
    }),
    person('branek-wivern', 'Branek Wivern', 'male', '1725', '', {
      title: 'Vierter Erbe des Hauses Wivern'
    }),
    spouse('isotta-morgryn', 'Isotta Morgryn', 'female', '1719', '', 'house-morgryn', {
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Brynmors',
      tags: ['Mündel'],
      notes: 'Isotta steht allein unter Brynmors Obhut und ist kein leibliches Kind von Brynmor und Alwen.'
    }),
    person('ulaeth-1723-wivern', 'Ulaeth Wivern', 'female', '1723', ''),
    person('beli-wivern', 'Beli Wivern', 'male', '1728', ''),
    person('jago-wivern', 'Jago Wivern', 'male', '1726', ''),
    person('wyrn-wivern', 'Wyrn Wivern', 'male', '1730', ''),
    person('joryn-wivern', 'Joryn Wivern', 'male', '1727', ''),
    person('yseut-wivern', 'Yseut Wivern', 'female', '1731', '')
  ],
  partnerships: [
    createMarriage('marriage-ulysses-ulaeth-wivern', ...COUPLES.founders),
    createMarriage('marriage-jowaneth-sorcha-wivern', ...COUPLES.jowaneth, { status: 'ended', end: '1709' }),
    createMarriage('marriage-guenevere-tudwallon-wivern', ...COUPLES.guenevere, { status: 'ended', end: '1676' }),
    createMarriage('marriage-eirwyn1654-islwyn', ...COUPLES.islwyn, { status: 'ended', end: '1730' }),
    createMarriage('marriage-cafael-blodwen-morfil', ...COUPLES.blodwen, { status: 'ended', end: '1723' }),
    createMarriage('marriage-wyndham-nerys', ...COUPLES.nerys, { status: 'ended', end: '1720' }),
    createMarriage('marriage-yspaddaden-endelyn-wivern', ...COUPLES.yspaddaden, { status: 'ended', end: '1720' }),
    createMarriage('marriage-ulysses-zethyra-wivern', ...COUPLES.ulysses),
    createMarriage('marriage-ifwin-arwen-brithyll', ...COUPLES.arwen),
    createMarriage('marriage-gwennan-cerdd', ...COUPLES.cerdd, { status: 'ended', end: '1700' }),
    createMarriage('marriage-urien-zyraline-canwyll', ...COUPLES.zyraline),
    createMarriage('marriage-alwen-brynmor-gwialen', ...COUPLES.brynmor),
    createMarriage('marriage-nolwenn-kevern-wivern', ...COUPLES.nolwenn),
    createMarriage('marriage-caiomhe-brysia-coedwig', ...COUPLES.caiomhe),
    createMarriage('marriage-jenara-wynoc-tylluan', ...COUPLES.wynoc),
    createMarriage('marriage-boudwin-blaun-wivern', ...COUPLES.boudwin)
  ],
  parentages: [
    ...childrenOf(['jowaneth-wivern', 'guenevere-wivern'], 'marriage-ulysses-ulaeth-wivern', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Jowaneth und Guenevere.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['islwyn-wivern', 'blodwen-wivern', 'nerys-wivern', 'yspaddaden-wivern'], 'marriage-jowaneth-sorcha-wivern'),
    ...childrenOf(['ulysses-1672-wivern', 'arwen-wivern'], 'marriage-eirwyn1654-islwyn'),
    ...childrenOf(['cerdd-wivern', 'zyraline-wivern'], 'marriage-yspaddaden-endelyn-wivern'),
    ...childrenOf(['brynmor-wivern', 'nolwenn-wivern', 'caiomhe-wivern'], 'marriage-ulysses-zethyra-wivern'),
    ...childrenOf(['wynoc-wivern', 'boudwin-wivern'], 'marriage-gwennan-cerdd'),
    ...childrenOf(['ulfyn-wivern', 'branek-wivern'], 'marriage-alwen-brynmor-gwialen'),
    ...createParentages(['isotta-morgryn'], ['brynmor-wivern'], '', {
      idPrefix: 'wivern-guardianship',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Brynmors aufgenommenes Mündel; keine biologische Abstammung.'
    }),
    ...childrenOf(['ulaeth-1723-wivern', 'beli-wivern'], 'marriage-caiomhe-brysia-coedwig'),
    ...childrenOf(['jago-wivern', 'wyrn-wivern'], 'marriage-jenara-wynoc-tylluan'),
    ...childrenOf(['joryn-wivern', 'yseut-wivern'], 'marriage-boudwin-blaun-wivern')
  ],
  cadetBranches: [
    marriedAway('married-away-guenevere-wivern-tylwyth', 'Haus Tylwyth', 'marriage-guenevere-tudwallon-wivern', 'house-tylwyth'),
    marriedAway('married-away-blodwen-wivern-morfil', "Haus Morfil O'Talsarn", 'marriage-cafael-blodwen-morfil', 'house-morfil', HOUSE_EMBLEMS.morfil),
    marriedAway('married-away-nerys-wivern-grawn', 'Haus Grawn', 'marriage-wyndham-nerys', 'house-grawn', HOUSE_EMBLEMS.grawn),
    marriedAway('married-away-arwen-wivern-brithyll', 'Haus Brithyll', 'marriage-ifwin-arwen-brithyll', 'house-brithyll', HOUSE_EMBLEMS.brithyll),
    marriedAway('married-away-zyraline-wivern-canwyll', 'Haus Canwyll', 'marriage-urien-zyraline-canwyll', 'house-canwyll', HOUSE_EMBLEMS.canwyll),
    marriedAway('married-away-nolwenn-wivern-illygoden', "Haus Illygoden O'Tredegar", 'marriage-nolwenn-kevern-wivern', 'house-illygoden-tredegar', HOUSE_EMBLEMS.illygoden, {
      targetFamilyId: 'haus-illygoden-tredegar'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-ulysses-ulaeth-wivern',
      parentPersonId: '',
      childIds: ['jowaneth-wivern', 'guenevere-wivern'],
      years: 0,
      fromYear: '????',
      toYear: '1630',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, Zeitsprung und erst danach Jowaneth und Guenevere.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-ulysses-ulaeth-wivern',
    houseId: WIVERN_HOUSE_ID,
    crestSubtitle: 'Baronshaus von Eichenlicht · Sitz Coedlyn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    // Vollständiger Stammbaum: Der früheste Gründer bleibt Layout-Anker;
    // kein späterer Fokuspunkt darf Seitenzweige oder Mündel ausblenden.
    focusPersonId: 'ulysses-founder-wivern',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Wivern O'Coedlyn (bereitgestellte Altdaten)",
    sourceNote: 'Der vollständige Stammbaum beginnt beim unbekannt datierten Gründerpaar und führt nach Hausknoten und genau einem seriellen Zeitsprung zu Jowaneth und Guenevere. Kinder wegverheirateter Wivern-Frauen verbleiben ausschließlich in den fortführenden Zielhäusern. Isotta Morgryn ist Brynmors aufgenommenes Mündel und ausdrücklich kein leibliches Kind von Brynmor und Alwen. Für Eirwyn sowie Nerys und Wyndham gelten die bereits ausgearbeiteten Gegenakten als kanonisch; abweichende Schreibweisen und Lebensdaten der Wivern-Altquelle sind an den Personen dokumentiert. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
    registryManagedExtensionFields: ['sourceNote'],
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
