import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { HOUSE_EIRTH_PORTRAITS } from './house-eirth-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';

const EIRTH_HOUSE_ID = 'house-eirth';
const EIRTH_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.eirth;

const HOUSE_EMBLEMS = Object.freeze({
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
  crafanc: KLAUENINSEL_HOUSE_EMBLEMS.crafanc,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  cwningod: KLAUENINSEL_HOUSE_EMBLEMS.cwningod,
  eirth: EIRTH_EMBLEM,
  gwarchod: AEHRENTAL_HOUSE_EMBLEMS.gwarchod,
  pawen: KLAUENINSEL_HOUSE_EMBLEMS.pawen,
  selwyn: KLAUENINSEL_HOUSE_EMBLEMS.selwyn,
  unigol: KLAUENINSEL_HOUSE_EMBLEMS.unigol
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

const HEAD_IDS = new Set(['rhynnon-arth', 'prysor-eirth']);
const MAINLINE_IDS = new Set(['urien-eirth', 'rhun-eirth']);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? EIRTH_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_EIRTH_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === EIRTH_HOUSE_ID ? 'core' : 'married'),
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
    ...(emblem ? { extensions: { registryManagedFields: ['name', 'emblem'] } } : {})
  };
}

const COUPLES = Object.freeze({
  founders: ['rhynnon-arth', 'kyndra-crafanc'],
  prysor: ['prysor-eirth', 'ifanwy-cwningod'],
  gaynor: ['dafydd-unigol', 'gaynor-eirth'],
  wyndham: ['gwendolen-crefyddol', 'wyndham-eirth'],
  urien: ['mared-pawen', 'urien-eirth'],
  uwchben: ['uwchben-eirth', 'caraid-selwyn'],
  vaughan: ['vaughan-eirth', 'gwynndie-gwarchod'],
  eirwyn: ['rhiwallon-unigol', 'eirwyn-eirth']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-rhynnon-kyndra': COUPLES.founders,
  'marriage-prysor-ifanwy-eirth': COUPLES.prysor,
  'marriage-dafydd-gaynor-unigol': COUPLES.gaynor,
  'marriage-gwendolen-wyndham-eirth': COUPLES.wyndham,
  'marriage-mared-urien-pawen': COUPLES.urien,
  'marriage-uwchben-caraid-eirth': COUPLES.uwchben,
  'marriage-gwynndie-vaughan-gwarchod': COUPLES.vaughan,
  'marriage-rhiwallon-eirwyn-unigol': COUPLES.eirwyn
});

function childrenOf(childIds, partnershipId) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'eirth-parentage'
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

export const HOUSE_EIRTH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-eirth',
    title: "Haus Eirth O'Caer Glaslyn",
    motto: 'Stark wie der Eisbär, treu wie der Frost',
    description: 'Von Rhynnon Arth und Kyndra Crafanc begründetes Ritterfürsten-, Kadetten- und Vasallenhaus der Arth.',
    emblem: EIRTH_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.eirth
  },
  houses: [
    house(EIRTH_HOUSE_ID, "Haus Eirth O'Caer Glaslyn", EIRTH_EMBLEM),
    house('house-arth', "Haus Arth O'Talgarth", HOUSE_EMBLEMS.arth),
    house('house-crafanc', "Haus Crafanc O'Talgarth", HOUSE_EMBLEMS.crafanc),
    house('house-cwningod', "Haus Cwningod O'Morea", HOUSE_EMBLEMS.cwningod),
    house('house-unigol', "Haus Unigol O'Caer Marwor", HOUSE_EMBLEMS.unigol),
    house('house-crefyddol', "Haus Crefyddol O'Llanvane", HOUSE_EMBLEMS.crefyddol),
    house('house-pawen', "Haus Pawen O'Talgarth", HOUSE_EMBLEMS.pawen),
    house('house-selwyn', "Haus Sélwyn O'Caer Ebirth", HOUSE_EMBLEMS.selwyn),
    house('house-gwarchod', 'Haus Gwarchod', HOUSE_EMBLEMS.gwarchod)
  ],
  persons: [
    person('rhynnon-arth', 'Rhynnon Arth', 'male', '1655', '1720', {
      houseId: 'house-arth',
      familyRole: 'core',
      title: 'Gründer und Ritterfürst des Hauses Eirth 1680–1720',
      tags: ['Kadettenhausgründer']
    }),
    person('kyndra-crafanc', 'Kyndra Crafanc', 'female', '1655', '1701', {
      houseId: 'house-crafanc',
      familyRole: 'married',
      title: 'Mitgründerin des Hauses Eirth',
      tags: ['Kadettenhausgründerin'],
      notes: 'Das Quellenjahr 1955 ist ein offensichtlicher Jahrhundertfehler; Arth und Crafanc belegen 1655.'
    }),

    person('prysor-eirth', 'Prysor Eirth', 'male', '1674', '', {
      title: 'Ritterfürst und Oberhaupt des Hauses Eirth seit 1720'
    }),
    awayWoman('gaynor-eirth', 'Gaynor Eirth', '1680', '', 'Haus Unigol'),
    person('wyndham-eirth', 'Wyndham Eirth', 'male', '1676', ''),

    spouse('ifanwy-cwningod', 'Ifanwy Cwningod', 'female', '1678', '', 'house-cwningod', {
      notes: 'Die Quellform Cwingod wird zur bestehenden Hausschreibung Cwningod normalisiert.'
    }),
    spouse('dafydd-unigol', 'Dafydd Unigol', 'male', '1680', '', 'house-unigol'),
    spouse('gwendolen-crefyddol', 'Gwendolen Crefyddol', 'female', '1678', '', 'house-crefyddol'),

    person('urien-eirth', 'Urien Eirth', 'male', '1695', '', {
      title: 'Erster Erbe des Hauses Eirth'
    }),
    person('uwchben-eirth', 'Uwchben Eirth', 'male', '1697', ''),
    person('vaughan-eirth', 'Vaughan Eirth', 'male', '1696', ''),
    awayWoman('eirwyn-eirth', 'Eirwyn Eirth', '1697', '', 'Haus Unigol'),

    spouse('mared-pawen', 'Mared Pawen', 'female', '1697', '', 'house-pawen'),
    spouse('caraid-selwyn', 'Caraid Sélwyn', 'female', '1698', '', 'house-selwyn'),
    spouse('gwynndie-gwarchod', 'Gwynndie Gwarchod', 'female', '1698', '', 'house-gwarchod'),
    spouse('rhiwallon-unigol', 'Rhiwallon Unigol', 'male', '1696', '', 'house-unigol'),

    person('rhun-eirth', 'Rhun Eirth', 'male', '1717', '', {
      title: 'Zweiter Erbe des Hauses Eirth'
    }),
    person('gwyn-eirth', 'Gwyn Eirth', 'female', '1719'),
    person('parzifal-eirth', 'Parzifal Eirth', 'male', '1730'),
    person('oth-eirth', 'Oth Eirth', 'male', '1721'),
    person('jenya-eirth', 'Jenya Eirth', 'female', '1723'),
    person('padrig-eirth', 'Padrig Eirth', 'male', '1722'),
    person('niya-eirth', 'Niya Eirth', 'female', '1724')
  ],
  partnerships: [
    createMarriage('marriage-rhynnon-kyndra', ...COUPLES.founders, { status: 'ended', end: '1701' }),
    createMarriage('marriage-prysor-ifanwy-eirth', ...COUPLES.prysor),
    createMarriage('marriage-dafydd-gaynor-unigol', ...COUPLES.gaynor),
    createMarriage('marriage-gwendolen-wyndham-eirth', ...COUPLES.wyndham),
    createMarriage('marriage-mared-urien-pawen', ...COUPLES.urien),
    createMarriage('marriage-uwchben-caraid-eirth', ...COUPLES.uwchben),
    createMarriage('marriage-gwynndie-vaughan-gwarchod', ...COUPLES.vaughan),
    createMarriage('marriage-rhiwallon-eirwyn-unigol', ...COUPLES.eirwyn)
  ],
  parentages: [
    ...childrenOf(['prysor-eirth', 'gaynor-eirth', 'wyndham-eirth'], 'marriage-rhynnon-kyndra'),
    ...childrenOf(['urien-eirth', 'uwchben-eirth'], 'marriage-prysor-ifanwy-eirth'),
    ...childrenOf(['vaughan-eirth', 'eirwyn-eirth'], 'marriage-gwendolen-wyndham-eirth'),
    ...childrenOf(['rhun-eirth', 'gwyn-eirth', 'parzifal-eirth'], 'marriage-mared-urien-pawen'),
    ...childrenOf(['oth-eirth', 'jenya-eirth'], 'marriage-uwchben-caraid-eirth'),
    ...childrenOf(['padrig-eirth', 'niya-eirth'], 'marriage-gwynndie-vaughan-gwarchod')
  ],
  cadetBranches: [
    marriedAway('married-away-gaynor-eirth-unigol', 'Haus Unigol', 'marriage-dafydd-gaynor-unigol', 'house-unigol', 'haus-unigol', HOUSE_EMBLEMS.unigol),
    marriedAway('married-away-eirwyn-eirth-unigol', 'Haus Unigol', 'marriage-rhiwallon-eirwyn-unigol', 'house-unigol', 'haus-unigol', HOUSE_EMBLEMS.unigol)
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-rhynnon-kyndra',
    houseId: EIRTH_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus der Nebelklaue · Kadetten- und Vasallenhaus der Arth',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'rhynnon-arth',
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
    sourcePartnershipId: 'marriage-rhynnon-kyndra',
    sourceModule: "Haus Eirth O'Caer Glaslyn (bereitgestellte Altdaten)",
    sourceNote: 'Rhynnon Arth und Kyndra Crafanc begründen Haus Eirth als Kadettenhaus der Arth; politisch bleibt es zugleich deren Vasallenhaus. Der Eirth-Hausknoten hängt direkt unter beiden und es folgt kein Zeitsprung. Prysor, Gaynor und Wyndham sind ihre Kinder. Nur die Linien Prysors und Wyndhams werden in Eirth fortgeführt. Gaynor und Eirwyn erhalten direkte Wegverheiratet-Knoten zu Haus Unigol; ihre Unigol-Kinder werden ausschließlich dort geführt. Die Tabellenüberschrift „Uren & Mared“ bezeichnet anhand der Personenspalten eindeutig Urien und Mared. Die Quellformen Cwingod und Selwyn werden als Cwningod und Sélwyn normalisiert. Kyndras unmögliches Geburtsjahr 1955 ist wie in Arth und Crafanc zu 1655 korrigiert. Sämtliche individuellen Quellporträts werden lokal gespeichert; bereits ausgearbeitete Gegenakten bleiben für gemeinsame Personen kanonisch.',
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
