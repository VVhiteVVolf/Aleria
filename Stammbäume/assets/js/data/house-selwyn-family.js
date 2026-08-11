import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { HOUSE_SELWYN_PORTRAITS } from './house-selwyn-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const SELWYN_HOUSE_ID = 'house-selwyn';
const SELWYN_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.selwyn;
const FOUNDER_TIME_JUMP_ID = 'gap-selwyn-founders-garselid';

const HOUSE_EMBLEMS = Object.freeze({
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
  canwyll: SILBERINSEL_HOUSE_EMBLEMS.canwyll,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  eirth: KLAUENINSEL_HOUSE_EMBLEMS.eirth,
  morthwyll: KLAUENINSEL_HOUSE_EMBLEMS.morthwyll,
  selwyn: SELWYN_EMBLEM,
  sgwarnog: AEHRENTAL_HOUSE_EMBLEMS.sgwarnog,
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

const HEAD_IDS = new Set([
  'morgan-founder-selwyn',
  'garselid-selwyn',
  'berwyn-selwyn',
  'morgan-selwyn'
]);
const MAINLINE_IDS = new Set(['cledwyn-selwyn', 'evan-selwyn']);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SELWYN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SELWYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SELWYN_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['morgan-founder-selwyn', 'caraid-founder-selwyn'],
  garselid: ['hafren-unigol', 'garselid-selwyn'],
  linette: ['brannock-dienyddiwr', 'linette-selwyn'],
  berwyn: ['senara-morthwyll', 'berwyn-selwyn'],
  cadfan: ['enfys-canwyll', 'cadfan-selwyn'],
  morgan: ['tegwen-arth', 'morgan-selwyn'],
  edern: ['meiriona-1679-sgwarnog', 'edern-selwyn'],
  cledwyn: ['rhianu-unigol', 'cledwyn-selwyn'],
  cariad: ['uwchben-eirth', 'caraid-selwyn'],
  colwynn: ['colwynn-selwyn', 'gladdie-cenyr']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-morgan-cariad-founder-selwyn': COUPLES.founders,
  'marriage-hafren-garselid-unigol': COUPLES.garselid,
  'marriage-brannock-linette-dienyddiwr': COUPLES.linette,
  'marriage-senara-berwyn-morthwyll': COUPLES.berwyn,
  'marriage-enfys-cadfan-canwyll': COUPLES.cadfan,
  'marriage-tegwen-morgan': COUPLES.morgan,
  'marriage-meiriona-edern-sgwarnog': COUPLES.edern,
  'marriage-rhianu-cledwyn-unigol': COUPLES.cledwyn,
  'marriage-uwchben-caraid-eirth': COUPLES.cariad,
  'marriage-colwynn-gladdie-selwyn': COUPLES.colwynn
});

function childrenOf(childIds, partnershipId) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'selwyn-parentage'
  });
}

function claimedChildren(childIds, partnershipId, timeJumpId) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'selwyn-parentage',
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
    extensions: { timeJumpId }
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

export const HOUSE_SELWYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-selwyn',
    title: "Haus Sélwyn O'Caer Ebirth",
    motto: '',
    description: 'Eigenständiges Ritterfürstenhaus der Silberklaue und Vasallenhaus der Arth, geprägt durch Bergbau, Handel und die Festung Caer Ebirth.',
    emblem: SELWYN_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.selwyn
  },
  houses: [
    house(SELWYN_HOUSE_ID, "Haus Sélwyn O'Caer Ebirth", SELWYN_EMBLEM),
    house('house-arth', "Haus Arth O'Talgarth", HOUSE_EMBLEMS.arth),
    house('house-unigol', "Haus Unigol O'Caer Marwor", HOUSE_EMBLEMS.unigol),
    house('house-dienyddiwr', "Haus Dienyddiwr O'Mathragon", HOUSE_EMBLEMS.dienyddiwr),
    house('house-morthwyll', "Haus Morthwyll O'Caer Morben", HOUSE_EMBLEMS.morthwyll),
    house('house-canwyll', "Haus Canwyll O'Llanvane", HOUSE_EMBLEMS.canwyll),
    house('house-sgwarnog', "Haus Sgwarnog O'Aldwynd", HOUSE_EMBLEMS.sgwarnog),
    house('house-eirth', "Haus Eirth O'Caer Glaslyn", HOUSE_EMBLEMS.eirth),
    house('house-cenyr', 'Unbekannte Familie O\'Cenyr')
  ],
  persons: [
    person('morgan-founder-selwyn', 'Morgan Sélwyn', 'male', '????', '????', {
      title: 'Stammvater und Gründer des Hauses Sélwyn',
      tags: ['Gründer']
    }),
    spouse('caraid-founder-selwyn', 'Cariad', 'female', '????', '????', '', {
      title: 'Stammmutter des Hauses Sélwyn',
      tags: ['Gründerin']
    }),

    person('garselid-selwyn', 'Garselid Sélwyn', 'male', '1640', '1699', {
      title: 'Ritterfürst und Oberhaupt des Hauses Sélwyn bis 1699'
    }),
    spouse('hafren-unigol', 'Hafren Unigol', 'female', '1646', '1688', 'house-unigol'),
    awayWoman('linette-selwyn', 'Linette Sélwyn', '1632', '1700', 'Haus Dienyddiwr'),
    spouse('brannock-dienyddiwr', 'Brannock Dienyddiwr', 'male', '1633', '1704', 'house-dienyddiwr'),

    person('berwyn-selwyn', 'Berwyn Sélwyn', 'male', '1659', '1720', {
      title: 'Ritterfürst und Oberhaupt des Hauses Sélwyn 1699–1720'
    }),
    spouse('senara-morthwyll', 'Senara Morthwyll', 'female', '1662', '1717', 'house-morthwyll', {
      notes: 'Lebensdaten folgen der ausgearbeiteten Morthwyll-Gegenakte; die Sélwyn-Quelle druckt unmöglich 1960.'
    }),
    person('cadfan-selwyn', 'Cadfan Sélwyn', 'male', '1661', '1720'),
    spouse('enfys-canwyll', 'Enfys Canwyll', 'female', '1662', '1717', 'house-canwyll', {
      notes: 'Das Todesjahr 1717 folgt der ausgearbeiteten Canwyll-Gegenakte.'
    }),

    person('morgan-selwyn', 'Morgan Sélwyn', 'male', '1678', '', {
      title: 'Ritterfürst und Oberhaupt des Hauses Sélwyn seit 1720'
    }),
    spouse('tegwen-arth', 'Tegwen Arth', 'female', '1676', '', 'house-arth'),
    person('edern-selwyn', 'Edern Sélwyn', 'male', '1680', ''),
    spouse('meiriona-1679-sgwarnog', 'Meiriona Sgwarnog', 'female', '1679', '', 'house-sgwarnog'),

    person('cledwyn-selwyn', 'Cledwyn Sélwyn', 'male', '1694', '', {
      title: 'Erster Erbe des Hauses Sélwyn'
    }),
    awayWoman('caraid-selwyn', 'Cariad Sélwyn', '1698', '', 'Haus Eirth'),
    person('colwynn-selwyn', 'Colwynn Sélwyn', 'male', '1699', ''),
    spouse('rhianu-unigol', 'Rhianu Unigol', 'female', '1696', '', 'house-unigol'),
    spouse('uwchben-eirth', 'Uwchben Eirth', 'male', '1697', '', 'house-eirth'),
    spouse('gladdie-cenyr', "Gladdie O'Cenyr", 'female', '1701', '', 'house-cenyr'),

    person('evan-selwyn', 'Evan Sélwyn', 'male', '1721', '', {
      title: 'Zweiter Erbe des Hauses Sélwyn'
    }),
    person('nesta-selwyn', 'Nesta Sélwyn', 'female', '1723', ''),
    person('glyn-selwyn', 'Glyn Sélwyn', 'male', '1723', ''),
    person('iona-selwyn', 'Iona Sélwyn', 'female', '1725', ''),
    person('cai-selwyn', 'Cai Sélwyn', 'male', '1732', '')
  ],
  partnerships: [
    createMarriage('marriage-morgan-cariad-founder-selwyn', ...COUPLES.founders, {
      status: 'ended',
      notes: 'Morgan und Cariad stehen am Beginn der eigenständigen Sélwyn-Überlieferung.'
    }),
    createMarriage('marriage-hafren-garselid-unigol', ...COUPLES.garselid, { status: 'ended', end: '1688' }),
    createMarriage('marriage-brannock-linette-dienyddiwr', ...COUPLES.linette, { status: 'ended', end: '1700' }),
    createMarriage('marriage-senara-berwyn-morthwyll', ...COUPLES.berwyn, { status: 'ended', end: '1717' }),
    createMarriage('marriage-enfys-cadfan-canwyll', ...COUPLES.cadfan, { status: 'ended', end: '1717' }),
    createMarriage('marriage-tegwen-morgan', ...COUPLES.morgan),
    createMarriage('marriage-meiriona-edern-sgwarnog', ...COUPLES.edern),
    createMarriage('marriage-rhianu-cledwyn-unigol', ...COUPLES.cledwyn),
    createMarriage('marriage-uwchben-caraid-eirth', ...COUPLES.cariad),
    createMarriage('marriage-colwynn-gladdie-selwyn', ...COUPLES.colwynn)
  ],
  parentages: [
    ...claimedChildren(['garselid-selwyn', 'linette-selwyn'], 'marriage-morgan-cariad-founder-selwyn', FOUNDER_TIME_JUMP_ID),
    ...childrenOf(['berwyn-selwyn', 'cadfan-selwyn'], 'marriage-hafren-garselid-unigol'),
    ...childrenOf(['morgan-selwyn'], 'marriage-senara-berwyn-morthwyll'),
    ...childrenOf(['edern-selwyn'], 'marriage-enfys-cadfan-canwyll'),
    ...childrenOf(['cledwyn-selwyn', 'caraid-selwyn'], 'marriage-tegwen-morgan'),
    ...childrenOf(['colwynn-selwyn'], 'marriage-meiriona-edern-sgwarnog'),
    ...childrenOf(['evan-selwyn', 'nesta-selwyn'], 'marriage-rhianu-cledwyn-unigol'),
    ...childrenOf(['glyn-selwyn', 'iona-selwyn', 'cai-selwyn'], 'marriage-colwynn-gladdie-selwyn')
  ],
  cadetBranches: [
    marriedAway('married-away-linette-selwyn-dienyddiwr', 'Haus Dienyddiwr', 'marriage-brannock-linette-dienyddiwr', 'house-dienyddiwr', 'haus-dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    marriedAway('married-away-caraid-selwyn-eirth', 'Haus Eirth', 'marriage-uwchben-caraid-eirth', 'house-eirth', 'haus-eirth', HOUSE_EMBLEMS.eirth)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-morgan-cariad-founder-selwyn',
      parentPersonId: '',
      childIds: ['garselid-selwyn', 'linette-selwyn'],
      years: 0,
      fromYear: '????',
      toYear: '1632',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Sélwyn-Hausknoten, Zeitsprung und erst danach Garselid und Linette.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-morgan-cariad-founder-selwyn',
    houseId: SELWYN_HOUSE_ID,
    crestSubtitle: 'Eigenständiges Ritterfürstenhaus der Silberklaue · Vasallenhaus der Arth',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'morgan-founder-selwyn',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceFamilyId: '',
    sourcePartnershipId: '',
    sourceModule: "Haus Sélwyn O'Caer Ebirth (bereitgestellte Altdaten)",
    sourceNote: 'Haus Sélwyn ist ein eigenständiges Ritterfürsten- und Vasallenhaus der Arth, ausdrücklich kein Arth-Kadettenhaus. Morgan und Cariad stehen vor dem Hausknoten; genau ein absoluter serieller Zeitsprung führt danach zu Garselid und Linette. Die Hauptlinie läuft über Garselid, Berwyn, Morgan und Cledwyn zu Evan weiter; Cadfan, Edern und Colwynn bilden die zweite fortgeführte Linie. Tegwen Arth heiratet erst mehrere Generationen nach der Gründung zu Morgan Sélwyn ein und wird in Arth normal wegverheiratet. Linette und Cariad erhalten direkte Wegverheiratet-Knoten zu Dienyddiwr und Eirth; deren fremde Kinderlinien bleiben ausschließlich in den Zielakten. Gegenakten haben bei Abweichungen Vorrang: Senara Morthwyll 1662–1717 und Enfys Canwyll 1662–1717. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'sourceFamilyId', 'sourcePartnershipId'],
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
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'crestSubtitle', 'crestFrame'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
