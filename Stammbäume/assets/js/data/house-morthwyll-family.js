import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_MORTHWYLL_PORTRAITS } from './house-morthwyll-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const MORTHWYLL_HOUSE_ID = 'house-morthwyll';
const MORTHWYLL_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.morthwyll;
const FOUNDER_TIME_JUMP_ID = 'gap-morthwyll-founders-merlion';

const HOUSE_EMBLEMS = Object.freeze({
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  cwningod: KLAUENINSEL_HOUSE_EMBLEMS.cwningod,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  morthwyll: MORTHWYLL_EMBLEM,
  penderyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
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

const MAINLINE_IDS = new Set([
  'collen-founder-morthwyll',
  'merlion-morthwyll',
  'sayres-morthwyll',
  'cadwallen-morthwyll',
  'glendower-morthwyll',
  'grugyn-morthwyll',
  'arawn-morthwyll',
  'collen-1724-morthwyll'
]);

function lineageRoleFor(personId) {
  if (personId === 'glendower-morthwyll') return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? MORTHWYLL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_MORTHWYLL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === MORTHWYLL_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['collen-founder-morthwyll', 'tymora-founder-morthwyll'],
  gwenfrewi: ['dadweir-penderyn', 'gwenfrewi-morthwyll'],
  merlion: ['rhondia-dyngwn', 'merlion-morthwyll'],
  sayres: ['heddwen-arth', 'sayres-morthwyll'],
  braih: ['braih-morthwyll', 'rhodhri-cwningod'],
  cadwallen: ['cadwallen-morthwyll', 'edeltraud-wargh'],
  tymora: ['tryffin-unigol', 'tymora-morthwyll'],
  senara: ['senara-morthwyll', 'berwyn-selwyn'],
  glendower: ['glendower-morthwyll', 'ingeborg-krigsfodt'],
  katewen: ['gethin-crefyddol', 'katewen-morthwyl'],
  grugyn: ['grugyn-morthwyll', 'hedvig-hyrmgardr'],
  guenevere: ['guenevere-morthwyll', 'kane-trachwyll'],
  kynwrig: ['kynwrig-morthwyll', 'ursula-skogg'],
  lowri: ['lowri-morthwyll', 'unknown-grindel-betrothed-lowri']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-collen-tymora-morthwyll': COUPLES.founders,
  'marriage-dadweir-gwenfrewi-penderyn': COUPLES.gwenfrewi,
  'marriage-rhondia-merlion-dyngwn': COUPLES.merlion,
  'marriage-heddwen-sayres': COUPLES.sayres,
  'marriage-braih-rhodhri-morthwyll': COUPLES.braih,
  'marriage-cadwallen-edeltraud-morthwyll': COUPLES.cadwallen,
  'marriage-tryffin-tymora-unigol': COUPLES.tymora,
  'marriage-senara-berwyn-morthwyll': COUPLES.senara,
  'marriage-glendower-ingeborg-morthwyll': COUPLES.glendower,
  'marriage-gethin-katewen-crefyddol': COUPLES.katewen,
  'marriage-grugyn-hedvig-morthwyll': COUPLES.grugyn,
  'marriage-guenevere-kane-morthwyll': COUPLES.guenevere,
  'marriage-kynwrig-ursula-morthwyll': COUPLES.kynwrig,
  'engagement-lowri-grindel-morthwyll': COUPLES.lowri
});

function childrenOf(childIds, partnershipId) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'morthwyll-parentage'
  });
}

function claimedChildren(childIds, partnershipId, timeJumpId) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'morthwyll-parentage',
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

export const HOUSE_MORTHWYLL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-morthwyll',
    title: "Haus Morthwyl O'Caer Morben",
    motto: 'Vom Meer geformt, von den Wellen geführt.',
    description: 'Eigenständiges Ritterfürsten- und Vasallenhaus der Arth, bekannt für Schiffbau, Seefahrt und die Verteidigung von Caer Morben.',
    emblem: MORTHWYLL_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.morthwyll
  },
  houses: [
    house(MORTHWYLL_HOUSE_ID, "Haus Morthwyl O'Caer Morben", MORTHWYLL_EMBLEM),
    house('house-arth', "Haus Arth O'Talgarth", HOUSE_EMBLEMS.arth),
    house('house-penderyn', "Haus Penderyn O'Mathragon", HOUSE_EMBLEMS.penderyn),
    house('house-dyngwn', "Haus Dyngwn O'Mathragon", HOUSE_EMBLEMS.dyngwn),
    house('house-cwningod', "Haus Cwningod O'Morea", HOUSE_EMBLEMS.cwningod),
    house('house-wargh', 'Haus Wargh'),
    house('house-unigol', "Haus Unigol O'Caer Marwor", HOUSE_EMBLEMS.unigol),
    house('house-selwyn', "Haus Sélwyn O'Caer Ebirth", HOUSE_EMBLEMS.selwyn),
    house('house-krigsfodt', 'Haus Krigsfodt'),
    house('house-crefyddol', "Haus Crefyddol O'Llanvane", HOUSE_EMBLEMS.crefyddol),
    house('house-hyrmgardr', 'Clan Hyrmgarthr'),
    house('house-trachwyll-talfronwyn', "Haus Trachwyll O'Talfronwyn"),
    house('house-skogg', 'Haus Skogg'),
    house('house-clan-grendel', 'Clan Grendel')
  ],
  persons: [
    person('collen-founder-morthwyll', 'Collen Morthwyll', 'male', '????', '????', {
      title: 'Stammvater und erster Ritterfürst des Hauses Morthwyll',
      tags: ['Gründer']
    }),
    spouse('tymora-founder-morthwyll', 'Tymora', 'female', '????', '????', '', {
      title: 'Stammmutter des Hauses Morthwyll',
      tags: ['Gründerin']
    }),

    person('merlion-morthwyll', 'Merlion Morthwyll', 'male', '1621', '1688', {
      title: 'Ritterfürst und Oberhaupt des Hauses Morthwyll 1644–1688'
    }),
    spouse('rhondia-dyngwn', 'Rhondia Dyngwn', 'female', '1622', '1699', 'house-dyngwn', {
      notes: 'Das Todesjahr 1699 folgt der ausgearbeiteten Dyngwn-Gegenakte.'
    }),
    marriedAwayPerson('gwenfrewi-morthwyll', 'Gwenfrewi Morthwyll', 'female', '1612', '1664', 'Haus Penderyn', {
      notes: 'Die ausgearbeitete Penderyn-Gegenakte belegt 1612–1664; die Morthwyll-Quelle nennt abweichend 1623–????.'
    }),
    spouse('dadweir-penderyn', 'Dadweir Penderyn', 'male', '1611', '1678', 'house-penderyn', {
      notes: 'Lebensdaten und Weltidentität folgen der ausgearbeiteten Penderyn-Gegenakte.'
    }),

    person('sayres-morthwyll', 'Sayres Morthwyll', 'male', '1639', '1706', {
      title: 'Ritterfürst und Oberhaupt des Hauses Morthwyll 1688–1706'
    }),
    spouse('heddwen-arth', 'Heddwen Arth', 'female', '1642', '1701', 'house-arth'),
    marriedAwayPerson('braih-morthwyll', 'Braih Morthwyll', 'female', '1632', '1675', 'Haus Cwningod'),
    spouse('rhodhri-cwningod', 'Rhodhri Cwningod', 'male', '1631', '1671', 'house-cwningod'),

    person('cadwallen-morthwyll', 'Cadwallen Morthwyll', 'male', '1659', '1725', {
      title: 'Ritterfürst und Oberhaupt des Hauses Morthwyll 1706–1725'
    }),
    spouse('edeltraud-wargh', 'Edeltraud Wargh', 'female', '1660', '1723', 'house-wargh'),
    marriedAwayPerson('tymora-morthwyll', 'Tymora Morthwyll', 'female', '1659', '1721', 'Haus Unigol'),
    spouse('tryffin-unigol', 'Tryffin Unigol', 'male', '1661', '1720', 'house-unigol'),
    marriedAwayPerson('senara-morthwyll', 'Senara Morthwyll', 'female', '1662', '1717', 'Haus Sélwyn'),
    spouse('berwyn-selwyn', 'Berwyn Sélwyn', 'male', '1659', '1720', 'house-selwyn'),

    person('glendower-morthwyll', 'Glendower Morthwyll', 'male', '1677', '', {
      title: 'Ritterfürst und Oberhaupt des Hauses Morthwyll seit 1725'
    }),
    spouse('ingeborg-krigsfodt', 'Ingeborg Krigsfodt', 'female', '1677', '', 'house-krigsfodt'),
    marriedAwayPerson('katewen-morthwyl', 'Katewen Morthwyll', 'female', '1679', '1735', 'Haus Crefyddol'),
    spouse('gethin-crefyddol', 'Gethin Crefyddol', 'male', '1675', '', 'house-crefyddol'),

    person('grugyn-morthwyll', 'Grugyn Morthwyll', 'male', '1695', '', {
      title: 'Erster Erbe des Hauses Morthwyll'
    }),
    spouse('hedvig-hyrmgardr', 'Hedvig Hyrmgarthr', 'female', '1698', '', 'house-hyrmgardr'),
    marriedAwayPerson('guenevere-morthwyll', 'Guenevere Morthwyll', 'female', '1697', '', 'Haus Trachwyll'),
    spouse('kane-trachwyll', 'Kane Trachwyll', 'male', '1700', '', 'house-trachwyll-talfronwyn'),
    person('kynwrig-morthwyll', 'Kynwrig Morthwyll', 'male', '1700', ''),
    spouse('ursula-skogg', 'Ursula Skogg', 'female', '1699', '', 'house-skogg'),

    person('arawn-morthwyll', 'Arawn Morthwyll', 'male', '1719', '', {
      title: 'Zweiter Erbe des Hauses Morthwyll'
    }),
    person('nerys-morthwyll', 'Nerys Morthwyll', 'female', '1721', ''),
    person('collen-1724-morthwyll', 'Collen Morthwyll', 'male', '1724', '', {
      title: 'Dritter Erbe des Hauses Morthwyll'
    }),
    person('drwst-morthwyll', 'Drwst Morthwyll', 'male', '1723', ''),
    person('lowri-morthwyll', 'Lowri Morthwyll', 'female', '1723', '', {
      title: 'Verlobt mit einem Mitglied des Clans Grendel',
      tags: ['Verlobt']
    }),
    spouse('unknown-grindel-betrothed-lowri', 'Unbekannter Verlobter', 'male', '????', '', 'house-clan-grendel', {
      title: 'Mitglied des Clans Grendel',
      tags: ['Platzhalter', 'Verlobt']
    })
  ],
  partnerships: [
    createMarriage('marriage-collen-tymora-morthwyll', ...COUPLES.founders, {
      status: 'ended',
      notes: 'Collen und Tymora stehen am Beginn der eigenständigen Morthwyll-Überlieferung.'
    }),
    createMarriage('marriage-rhondia-merlion-dyngwn', ...COUPLES.merlion, { status: 'ended', end: '1688' }),
    createMarriage('marriage-dadweir-gwenfrewi-penderyn', ...COUPLES.gwenfrewi, { status: 'ended', end: '1664' }),
    createMarriage('marriage-heddwen-sayres', ...COUPLES.sayres, { status: 'ended', end: '1701' }),
    createMarriage('marriage-braih-rhodhri-morthwyll', ...COUPLES.braih, { status: 'ended', end: '1671' }),
    createMarriage('marriage-cadwallen-edeltraud-morthwyll', ...COUPLES.cadwallen, { status: 'ended', end: '1723' }),
    createMarriage('marriage-tryffin-tymora-unigol', ...COUPLES.tymora, { status: 'ended', end: '1720' }),
    createMarriage('marriage-senara-berwyn-morthwyll', ...COUPLES.senara, { status: 'ended', end: '1717' }),
    createMarriage('marriage-glendower-ingeborg-morthwyll', ...COUPLES.glendower),
    createMarriage('marriage-gethin-katewen-crefyddol', ...COUPLES.katewen, { status: 'ended', end: '1735' }),
    createMarriage('marriage-grugyn-hedvig-morthwyll', ...COUPLES.grugyn),
    createMarriage('marriage-guenevere-kane-morthwyll', ...COUPLES.guenevere),
    createMarriage('marriage-kynwrig-ursula-morthwyll', ...COUPLES.kynwrig),
    createMarriage('engagement-lowri-grindel-morthwyll', ...COUPLES.lowri, {
      type: 'engagement',
      notes: 'Die Hausgeschichte belegt Lowris Verlobung mit einem namentlich nicht genannten Mitglied des Clans Grendel.'
    })
  ],
  parentages: [
    ...claimedChildren(['merlion-morthwyll', 'gwenfrewi-morthwyll'], 'marriage-collen-tymora-morthwyll', FOUNDER_TIME_JUMP_ID),
    ...childrenOf(['sayres-morthwyll', 'braih-morthwyll'], 'marriage-rhondia-merlion-dyngwn'),
    ...childrenOf(['cadwallen-morthwyll', 'tymora-morthwyll', 'senara-morthwyll'], 'marriage-heddwen-sayres'),
    ...childrenOf(['glendower-morthwyll', 'katewen-morthwyl'], 'marriage-cadwallen-edeltraud-morthwyll'),
    ...childrenOf(['grugyn-morthwyll', 'guenevere-morthwyll', 'kynwrig-morthwyll'], 'marriage-glendower-ingeborg-morthwyll'),
    ...childrenOf(['arawn-morthwyll', 'nerys-morthwyll', 'collen-1724-morthwyll'], 'marriage-grugyn-hedvig-morthwyll'),
    ...childrenOf(['drwst-morthwyll', 'lowri-morthwyll'], 'marriage-kynwrig-ursula-morthwyll')
  ],
  cadetBranches: [
    marriedAway('married-away-gwenfrewi-morthwyll-penderyn', 'Haus Penderyn', 'marriage-dadweir-gwenfrewi-penderyn', 'house-penderyn', 'haus-penderyn', HOUSE_EMBLEMS.penderyn),
    marriedAway('married-away-braih-morthwyll-cwningod', 'Haus Cwningod', 'marriage-braih-rhodhri-morthwyll', 'house-cwningod', 'haus-cwningod', HOUSE_EMBLEMS.cwningod),
    marriedAway('married-away-tymora-morthwyll-unigol', 'Haus Unigol', 'marriage-tryffin-tymora-unigol', 'house-unigol', 'haus-unigol', HOUSE_EMBLEMS.unigol),
    marriedAway('married-away-senara-morthwyll-selwyn', 'Haus Sélwyn', 'marriage-senara-berwyn-morthwyll', 'house-selwyn', 'haus-selwyn', HOUSE_EMBLEMS.selwyn),
    marriedAway('married-away-katewen-morthwyll-crefyddol', 'Haus Crefyddol', 'marriage-gethin-katewen-crefyddol', 'house-crefyddol', 'haus-crefyddol', HOUSE_EMBLEMS.crefyddol),
    marriedAway('married-away-guenevere-morthwyll-trachwyll', "Haus Trachwyll O'Talfronwyn", 'marriage-guenevere-kane-morthwyll', 'house-trachwyll-talfronwyn', 'haus-trachwyll-talfronwyn')
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-collen-tymora-morthwyll',
      parentPersonId: '',
      childIds: ['merlion-morthwyll', 'gwenfrewi-morthwyll'],
      years: 0,
      fromYear: '????',
      toYear: '1612',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Morthwyll-Hausknoten, Zeitsprung und erst danach Merlion und Gwenfrewi.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-collen-tymora-morthwyll',
    houseId: MORTHWYLL_HOUSE_ID,
    crestSubtitle: 'Eigenständiges Ritterfürstenhaus · Vasallenhaus der Arth',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'collen-founder-morthwyll',
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
    sourceModule: "Haus Morthwyl O'Caer Morben (bereitgestellte Altdaten)",
    sourceNote: 'Haus Morthwyll ist ein eigenständiges Ritterfürsten- und Vasallenhaus der Arth, ausdrücklich kein Arth-Kadettenhaus. Collen und Tymora stehen vor dem Hausknoten; genau ein absoluter Zeitsprung führt danach zu Merlion und Gwenfrewi. Heddwen Arth heiratet erst später zu Sayres Morthwyll ein. Gwenfrewi, Braih, Tymora, Senara, Katewen und Guenevere erhalten direkte Wegverheiratet-Knoten; ihre fremden Kinderlinien bleiben ausschließlich in Penderyn, Cwningod, Unigol, Sélwyn, Crefyddol beziehungsweise Trachwyll. Lowris in der Hausgeschichte belegte Verlobung mit einem namentlich unbekannten Mitglied des Clans Grendel wird als Verlobung ohne Wegheirat geführt. Gegenakten haben bei abweichenden Daten Vorrang: Gwenfrewi 1612–1664, Dadweir 1611–1678 und Rhondia 1622–1699. Ursulas frühere Tippfehler-ID „ursula-skog“ wurde für die gemeinsame Skogg-Gegenakte auf „ursula-skogg“ vereinheitlicht. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
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
    registryManagedLineageFields: [
      'founderPartnershipId',
      'houseId',
      'crestSubtitle',
      'crestEmblemScale',
      'crestFrame',
      'crestFrameScale',
      'timeGap'
    ],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
