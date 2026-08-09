import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createMigrationHouseBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_DIAFOL_PORTRAITS } from './house-diafol-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES,
  KLAUENINSEL_ORIGIN_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';

const TREFGOCH_HOUSE_ID = 'house-diafol';
const TALGARTH_HOUSE_ID = 'house-diafol-talgarth';
const DIAFOL_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.diafol;
const FOUNDER_TIME_JUMP_ID = 'gap-gwrgwst-to-ercwlff-griff-diafol';

const HOUSE_EMBLEMS = Object.freeze({
  diafol: DIAFOL_EMBLEM,
  blodyn: KLAUENINSEL_HOUSE_EMBLEMS.blodyn,
  gwaedlyd: GRAUE_WEITE_HOUSE_EMBLEMS.gwaedlyd
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

const SHARED_WORLD_PERSON_IDS = Object.freeze({
  'tryffin-diafol': 'person--haus-diafol--tryffin-diafol',
  'torri-diafol': 'person--haus-diafol--torri-diafol',
  'tarawg-diafol': 'person--haus-diafol--tarawg-diafol',
  'tawr-diafol': 'person--haus-diafol--tawr-diafol',
  'telyn-diafol': 'person--haus-diafol--telyn-diafol',
  'meic-diafol': 'person--haus-diafol--meic-diafol',
  'medi-diafol': 'person--haus-diafol--medi-diafol',
  'tref-diafol': 'person--haus-diafol--tref-diafol',
  'morcant-gwaedlyd': 'person--haus-gwaedlyd-tredegar--morcant-gwaedlyd'
});

const MAINLINE_IDS = new Set([
  'gwrgwst-diafol',
  'ercwlff-diafol',
  'traharyan-diafol',
  'drwst-diafol',
  'tryffin-diafol',
  'tawr-diafol'
]);

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

function personForLine(lineHouseId, id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? lineHouseId : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || SHARED_WORLD_PERSON_IDS[id] || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_DIAFOL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === lineHouseId ? 'core' : 'married'),
    lineageRole: options.lineageRole || (MAINLINE_IDS.has(id) ? 'mainline' : 'branch'),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function trefgochPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(TREFGOCH_HOUSE_ID, id, name, sex, birth, death, options);
}

function talgarthPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(TALGARTH_HOUSE_ID, id, name, sex, birth, death, options);
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, { status: 'ended', end });
}

function familyAffair(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, {
    type: 'affair',
    status: 'ended',
    end,
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

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: options.idPrefix || 'diafol-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    subtitle: `Wegverheiratet an ${name}`,
    crestFrame: 'gold'
  });
}

function telynWardBranch() {
  return createWardAwayBranch({
    id: 'ward-away-telyn-diafol-blodyn',
    name: "Haus Blodyn O'Talgarth",
    parentPersonId: 'telyn-diafol',
    houseId: 'house-blodyn-talgarth',
    targetFamilyId: 'haus-blodyn-talgarth',
    emblem: HOUSE_EMBLEMS.blodyn,
    crestFrame: 'gold',
    subtitle: "Als Mündel an Haus Blodyn O'Talgarth vermittelt",
    notes: 'Telyn bleibt leiblicher Sohn Tryffins und Morcants. Die blaue Mündeldarstellung und die Gegenverknüpfung führen zu seiner Pflegeakte bei Yhon Blodyn.'
  });
}

const TREFGOCH_HOUSES = Object.freeze([
  house(TREFGOCH_HOUSE_ID, "Haus Diafol O'Trefgoch", HOUSE_EMBLEMS.diafol),
  house(TALGARTH_HOUSE_ID, "Haus Diafol O'Talgarth", HOUSE_EMBLEMS.diafol),
  house('house-unknown-celyn-founder-diafol', 'Unbekanntes Haus'),
  house('house-caerdyn', 'Haus Caerdyn'),
  house('house-drewi', 'Haus Drewi'),
  house('house-gwanrhyd', 'Haus Gwanrhyd'),
  house('house-serenoc', 'Haus Serenoc'),
  house('house-bochdew', 'Haus Bochdew'),
  house('house-udgorn', 'Haus Udgorn'),
  house('house-gwaedlyd-tredegar', "Haus Gwaedlyd O'Tredegar", HOUSE_EMBLEMS.gwaedlyd),
  house('house-unknown-madog-diafol', 'Unbekanntes Haus'),
  house('house-unknown-slevin-diafol', 'Unbekanntes Haus'),
  house('house-morgant', 'Haus Morgant'),
  house('house-blodyn-talgarth', "Haus Blodyn O'Talgarth", HOUSE_EMBLEMS.blodyn)
]);

const TALGARTH_HOUSES = Object.freeze([
  house(TALGARTH_HOUSE_ID, "Haus Diafol O'Talgarth", HOUSE_EMBLEMS.diafol),
  house(TREFGOCH_HOUSE_ID, "Haus Diafol O'Trefgoch", HOUSE_EMBLEMS.diafol),
  house('house-gwaedlyd-tredegar', "Haus Gwaedlyd O'Tredegar", HOUSE_EMBLEMS.gwaedlyd),
  house('house-unknown-madog-diafol', 'Unbekanntes Haus'),
  house('house-unknown-slevin-diafol', 'Unbekanntes Haus'),
  house('house-caerdyn', 'Haus Caerdyn'),
  house('house-blodyn-talgarth', "Haus Blodyn O'Talgarth", HOUSE_EMBLEMS.blodyn)
]);

const ORIGIN_PARTNERS = Object.freeze({
  founders: ['gwrgwst-diafol', 'celyn-founder-diafol'],
  ercwlff: ['ercwlff-diafol', 'gwladys-caerdyn'],
  griff: ['griff-diafol', 'gwenfrewi-drewi'],
  traharyan: ['traharyan-diafol', 'igraine-gwanrhyd'],
  celyn: ['celyn-1652-diafol', 'arawn-serenoc'],
  drwst: ['drwst-diafol', 'mallt-drewi'],
  isolde: ['isolde-diafol', 'meuric-bochdew'],
  syvwlch: ['syvwlch-diafol', 'olwyn-udgorn'],
  tryffin: ['morcant-gwaedlyd', 'tryffin-diafol'],
  torriMadog: ['torri-diafol', 'madog-diafol'],
  torriSlevin: ['torri-diafol', 'slevin-diafol'],
  tarawg: ['tarawg-diafol', 'maygan-caerdyn'],
  gwawr: ['gwawr-diafol', 'taranis-morgant']
});

export const HOUSE_DIAFOL_TREFGOCH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-diafol',
    title: "Haus Diafol O'Trefgoch",
    motto: 'Kämpfend leben wir. Kämpfend sterben wir.',
    description: 'Vollständige vennyrianische Herkunftsakte des Hauses Diafol aus Trefgoch. Sie bewahrt die erloschenen Seitenzweige und verweist bei Tryffin auf die seit 1720 getrennt geführte Talgarther Linie.',
    emblem: DIAFOL_EMBLEM,
    houseProfile: KLAUENINSEL_ORIGIN_HOUSE_PROFILES['diafol-trefgoch']
  },
  houses: [...TREFGOCH_HOUSES],
  persons: [
    trefgochPerson('gwrgwst-diafol', 'Gwrgwst Diafol', 'male', '????', '????', {
      familyRole: 'founder',
      lineageRole: 'head',
      title: "Gründer des Hauses Diafol O'Trefgoch"
    }),
    trefgochPerson('celyn-founder-diafol', 'Célyn', 'female', '????', '????', {
      houseId: 'house-unknown-celyn-founder-diafol',
      familyRole: 'founder',
      title: 'Mitgründerin des Hauses Diafol'
    }),

    trefgochPerson('ercwlff-diafol', 'Ercwlff Diafol', 'male', '1625', '1695'),
    trefgochPerson('gwladys-caerdyn', 'Gwladys Caerdyn', 'female', '1627', '1720', {
      houseId: 'house-caerdyn',
      familyRole: 'married'
    }),
    trefgochPerson('griff-diafol', 'Griff Diafol', 'male', '1630', '1718'),
    trefgochPerson('gwenfrewi-drewi', 'Gwenfrewi Drewi', 'female', '1634', '1720', {
      houseId: 'house-drewi',
      familyRole: 'married'
    }),

    trefgochPerson('traharyan-diafol', 'Traharyan Diafol', 'male', '1645', '1720'),
    trefgochPerson('igraine-gwanrhyd', 'Igraine Gwanrhyd', 'female', '1651', '1720', {
      houseId: 'house-gwanrhyd',
      familyRole: 'married'
    }),
    trefgochPerson('celyn-1652-diafol', 'Célyn Diafol', 'female', '1652', '1720', {
      title: 'Wegverheiratet an Haus Serenoc',
      tags: ['Wegverheiratet']
    }),
    trefgochPerson('arawn-serenoc', 'Arawn Serenoc', 'male', '1650', '1720', {
      houseId: 'house-serenoc',
      familyRole: 'married'
    }),

    trefgochPerson('drwst-diafol', 'Drwst Diafol', 'male', '1670', '1720'),
    trefgochPerson('mallt-drewi', 'Mallt Drewi', 'female', '1672', '1720', {
      houseId: 'house-drewi',
      familyRole: 'married'
    }),
    trefgochPerson('isolde-diafol', 'Isolde Diafol', 'female', '1672', '1720', {
      title: 'Wegverheiratet an Haus Bochdew',
      tags: ['Wegverheiratet']
    }),
    trefgochPerson('meuric-bochdew', 'Meuric Bochdew', 'male', '1671', '1720', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),
    trefgochPerson('syvwlch-diafol', 'Syvwlch Diafol', 'male', '1675', '1720'),
    trefgochPerson('olwyn-udgorn', 'Olwyn Udgorn', 'female', '1678', '1720', {
      houseId: 'house-udgorn',
      familyRole: 'married'
    }),

    trefgochPerson('tryffin-diafol', 'Tryffin Diafol', 'female', '1692', '', {
      title: 'Oberhaupt des Hauses Diafol seit 1720',
      lineageRole: 'head'
    }),
    trefgochPerson('morcant-gwaedlyd', 'Morcant Gwaedlyd', 'male', '1694', '', {
      houseId: 'house-gwaedlyd-tredegar',
      familyRole: 'married'
    }),
    trefgochPerson('torri-diafol', 'Torri Diafol', 'female', '1694', ''),
    trefgochPerson('madog-diafol', 'Madog', 'male', '1693', '1720', {
      houseId: 'house-unknown-madog-diafol',
      familyRole: 'affair',
      title: 'Affäre Torris · Vater Meics'
    }),
    trefgochPerson('slevin-diafol', 'Slevin', 'male', '1701', '', {
      houseId: 'house-unknown-slevin-diafol',
      familyRole: 'affair',
      title: 'Affäre Torris · Vater Medis'
    }),
    trefgochPerson('tarawg-diafol', 'Tarawg Diafol', 'male', '1695', ''),
    trefgochPerson('maygan-caerdyn', 'Maygan Caerdyn', 'female', '1695', '', {
      houseId: 'house-caerdyn',
      familyRole: 'married'
    }),
    trefgochPerson('gwawr-diafol', 'Gwawr Diafol', 'female', '1700', '1720', {
      title: 'Wegverheiratet an Haus Morgant',
      tags: ['Wegverheiratet']
    }),
    trefgochPerson('taranis-morgant', 'Taranis Morgant', 'male', '1697', '1720', {
      houseId: 'house-morgant',
      familyRole: 'married'
    }),

    trefgochPerson('tawr-diafol', 'Tawr Diafol', 'male', '1716', '', {
      title: 'Erster Erbe des Hauses Diafol',
      lineageRole: 'mainline'
    }),
    trefgochPerson('telyn-diafol', 'Telyn Diafol', 'male', '1717', '', {
      familyRole: 'ward-away',
      title: "Als Mündel an Haus Blodyn O'Talgarth vermittelt",
      tags: ['Weggegebenes Mündel']
    }),
    trefgochPerson('meic-diafol', 'Meic Diafol', 'male', '1717', '', {
      title: 'Legitimierter Sohn Torris und Madogs',
      tags: ['Legitimiert']
    }),
    trefgochPerson('medi-diafol', 'Medi Diafol', 'female', '1719', '', {
      title: 'Legitimierte Tochter Torris und Slevins',
      tags: ['Legitimiert']
    }),
    trefgochPerson('tref-diafol', 'Tref Diafol', 'male', '1718', '')
  ],
  partnerships: [
    endedMarriage('marriage-gwrgwst-celyn-diafol', ...ORIGIN_PARTNERS.founders),
    endedMarriage('marriage-ercwlff-gwladys-diafol', ...ORIGIN_PARTNERS.ercwlff, '1695'),
    endedMarriage('marriage-griff-gwenfrewi-diafol', ...ORIGIN_PARTNERS.griff, '1718'),
    endedMarriage('marriage-traharyan-igraine-diafol', ...ORIGIN_PARTNERS.traharyan, '1720'),
    endedMarriage('marriage-celyn-arawn-diafol', ...ORIGIN_PARTNERS.celyn, '1720'),
    endedMarriage('marriage-drwst-mallt-diafol', ...ORIGIN_PARTNERS.drwst, '1720'),
    endedMarriage('marriage-isolde-meuric-diafol', ...ORIGIN_PARTNERS.isolde, '1720'),
    endedMarriage('marriage-syvwlch-olwyn-diafol', ...ORIGIN_PARTNERS.syvwlch, '1720'),
    createMarriage('marriage-morcant-tryffin-gwaedlyd', ...ORIGIN_PARTNERS.tryffin),
    alignPartnerOverChildren(
      familyAffair('affair-torri-madog-diafol', ...ORIGIN_PARTNERS.torriMadog, '1720'),
      'madog-diafol'
    ),
    alignPartnerOverChildren(
      familyAffair('affair-torri-slevin-diafol', ...ORIGIN_PARTNERS.torriSlevin),
      'slevin-diafol'
    ),
    createMarriage('marriage-tarawg-maygan-diafol', ...ORIGIN_PARTNERS.tarawg),
    endedMarriage('marriage-gwawr-taranis-diafol', ...ORIGIN_PARTNERS.gwawr, '1720')
  ],
  parentages: [
    ...childrenOf(['ercwlff-diafol', 'griff-diafol'], ORIGIN_PARTNERS.founders, 'marriage-gwrgwst-celyn-diafol', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und den ab 1625 belegten Linien liegen nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['traharyan-diafol'], ORIGIN_PARTNERS.ercwlff, 'marriage-ercwlff-gwladys-diafol'),
    ...childrenOf(['celyn-1652-diafol'], ORIGIN_PARTNERS.griff, 'marriage-griff-gwenfrewi-diafol'),
    ...childrenOf(['drwst-diafol', 'isolde-diafol', 'syvwlch-diafol'], ORIGIN_PARTNERS.traharyan, 'marriage-traharyan-igraine-diafol'),
    ...childrenOf(['tryffin-diafol', 'torri-diafol', 'tarawg-diafol'], ORIGIN_PARTNERS.drwst, 'marriage-drwst-mallt-diafol'),
    ...childrenOf(['gwawr-diafol'], ORIGIN_PARTNERS.syvwlch, 'marriage-syvwlch-olwyn-diafol'),
    ...childrenOf(['tawr-diafol', 'telyn-diafol'], ORIGIN_PARTNERS.tryffin, 'marriage-morcant-tryffin-gwaedlyd'),
    ...childrenOf(['meic-diafol'], ORIGIN_PARTNERS.torriMadog, 'affair-torri-madog-diafol', {
      legitimacy: 'legitimized',
      notes: 'Meic wurde nach seiner Geburt legitimiert; Madog ist sein leiblicher Vater.'
    }),
    ...childrenOf(['medi-diafol'], ORIGIN_PARTNERS.torriSlevin, 'affair-torri-slevin-diafol', {
      legitimacy: 'legitimized',
      notes: 'Medi wurde nach ihrer Geburt legitimiert; Slevin ist ihr leiblicher Vater.'
    }),
    ...childrenOf(['tref-diafol'], ORIGIN_PARTNERS.tarawg, 'marriage-tarawg-maygan-diafol')
  ],
  cadetBranches: [
    marriedAway('married-away-celyn-diafol-serenoc', 'Haus Serenoc', 'marriage-celyn-arawn-diafol', 'house-serenoc', 'haus-serenoc'),
    marriedAway('married-away-isolde-diafol-bochdew', 'Haus Bochdew', 'marriage-isolde-meuric-diafol', 'house-bochdew', 'haus-bochdew'),
    marriedAway('married-away-gwawr-diafol-morgant', 'Haus Morgant', 'marriage-gwawr-taranis-diafol', 'house-morgant', 'haus-morgant'),
    telynWardBranch(),
    createMigrationHouseBranch({
      id: 'migration-tryffin-diafol-talgarth',
      name: "Haus Diafol O'Talgarth",
      parentPersonId: 'tryffin-diafol',
      houseId: TALGARTH_HOUSE_ID,
      targetFamilyId: 'haus-diafol-talgarth',
      emblem: DIAFOL_EMBLEM,
      founded: '1720',
      subtitle: 'Von Tryffin geführte neue Ritterfürstenlinie in Talgarth',
      crestFrame: 'gold',
      notes: 'Der Übergang hängt geradlinig unter dem überlebenden Oberhaupt Tryffin. Alle acht überlebenden Diafol werden ausschließlich in der verknüpften Talgarther Akte fortgeführt.'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-gwrgwst-celyn-diafol',
      sharedParentPartnershipIds: [],
      childIds: ['ercwlff-diafol', 'griff-diafol'],
      years: 0,
      fromYear: '????',
      toYear: '1625',
      label: 'Die belegte Linie setzt 1625 wieder ein',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, genau ein serieller Zeitsprung und erst danach Ercwlff und Griff.'
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-gwrgwst-celyn-diafol',
    houseId: TREFGOCH_HOUSE_ID,
    crestSubtitle: 'Alte vennyrianische Linie von Trefgoch',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gwrgwst-diafol',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originLine: true,
    successorFamilyId: 'haus-diafol-talgarth',
    sourceRevision: 2,
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Vollständige Diafol-Herkunftsakte nach der bereitgestellten Tabelle. Die Hausverknotung steht unter Gwrgwst und Célyn, gefolgt von genau einem seriellen Zeitsprung. Beide Äste Ercwlffs und Griffs, sämtliche belegten Ehen, Wegverheiratungen und die Kriegsverluste von 1720 bleiben erhalten. Torri erscheint nur einmal; Madog steht über Meic und Slevin über Medi. Telyn ist leibliches Kind Tryffins und Morcants, zugleich aber mit blauem Weggegeben-Mündelrahmen und Gegenlink zu Haus Blodyn versehen.'
  }
});

const TALGARTH_PARTNERS = Object.freeze({
  tryffin: ['morcant-gwaedlyd', 'tryffin-diafol'],
  torriMadog: ['torri-diafol', 'madog-diafol'],
  torriSlevin: ['torri-diafol', 'slevin-diafol'],
  tarawg: ['tarawg-diafol', 'maygan-caerdyn']
});

export const HOUSE_DIAFOL_TALGARTH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-diafol-talgarth',
    title: "Haus Diafol O'Talgarth",
    motto: 'Kämpfend leben wir. Kämpfend sterben wir.',
    description: 'Die seit 1720 getrennt geführte Ritterfürstenlinie von Talgarth: alle acht überlebenden Diafol sowie die für ihre eindeutig zugeordneten Kinder notwendigen Partner.',
    emblem: DIAFOL_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.diafol
  },
  houses: [...TALGARTH_HOUSES],
  persons: [
    talgarthPerson('tryffin-diafol', 'Tryffin Diafol', 'female', '1692', '', {
      title: 'Oberhaupt des Hauses Diafol seit 1720',
      lineageRole: 'head'
    }),
    talgarthPerson('morcant-gwaedlyd', 'Morcant Gwaedlyd', 'male', '1694', '', {
      houseId: 'house-gwaedlyd-tredegar',
      familyRole: 'married'
    }),
    talgarthPerson('torri-diafol', 'Torri Diafol', 'female', '1694', ''),
    talgarthPerson('madog-diafol', 'Madog', 'male', '1693', '1720', {
      houseId: 'house-unknown-madog-diafol',
      familyRole: 'affair',
      title: 'Affäre Torris · Vater Meics'
    }),
    talgarthPerson('slevin-diafol', 'Slevin', 'male', '1701', '', {
      houseId: 'house-unknown-slevin-diafol',
      familyRole: 'affair',
      title: 'Affäre Torris · Vater Medis'
    }),
    talgarthPerson('tarawg-diafol', 'Tarawg Diafol', 'male', '1695', ''),
    talgarthPerson('maygan-caerdyn', 'Maygan Caerdyn', 'female', '1695', '', {
      houseId: 'house-caerdyn',
      familyRole: 'married'
    }),
    talgarthPerson('tawr-diafol', 'Tawr Diafol', 'male', '1716', '', {
      title: 'Erster Erbe des Hauses Diafol',
      lineageRole: 'mainline'
    }),
    talgarthPerson('telyn-diafol', 'Telyn Diafol', 'male', '1717', '', {
      familyRole: 'ward-away',
      title: "Als Mündel an Haus Blodyn O'Talgarth vermittelt",
      tags: ['Weggegebenes Mündel']
    }),
    talgarthPerson('meic-diafol', 'Meic Diafol', 'male', '1717', '', {
      title: 'Legitimierter Sohn Torris und Madogs',
      tags: ['Legitimiert']
    }),
    talgarthPerson('medi-diafol', 'Medi Diafol', 'female', '1719', '', {
      title: 'Legitimierte Tochter Torris und Slevins',
      tags: ['Legitimiert']
    }),
    talgarthPerson('tref-diafol', 'Tref Diafol', 'male', '1718', '')
  ],
  partnerships: [
    createMarriage('marriage-morcant-tryffin-gwaedlyd', ...TALGARTH_PARTNERS.tryffin),
    alignPartnerOverChildren(
      familyAffair('affair-torri-madog-diafol', ...TALGARTH_PARTNERS.torriMadog, '1720'),
      'madog-diafol'
    ),
    alignPartnerOverChildren(
      familyAffair('affair-torri-slevin-diafol', ...TALGARTH_PARTNERS.torriSlevin),
      'slevin-diafol'
    ),
    createMarriage('marriage-tarawg-maygan-diafol', ...TALGARTH_PARTNERS.tarawg)
  ],
  parentages: [
    ...childrenOf(['tawr-diafol', 'telyn-diafol'], TALGARTH_PARTNERS.tryffin, 'marriage-morcant-tryffin-gwaedlyd', {
      idPrefix: 'diafol-talgarth-parentage'
    }),
    ...childrenOf(['meic-diafol'], TALGARTH_PARTNERS.torriMadog, 'affair-torri-madog-diafol', {
      idPrefix: 'diafol-talgarth-parentage',
      legitimacy: 'legitimized',
      notes: 'Meic wurde nach seiner Geburt legitimiert; Madog ist sein leiblicher Vater.'
    }),
    ...childrenOf(['medi-diafol'], TALGARTH_PARTNERS.torriSlevin, 'affair-torri-slevin-diafol', {
      idPrefix: 'diafol-talgarth-parentage',
      legitimacy: 'legitimized',
      notes: 'Medi wurde nach ihrer Geburt legitimiert; Slevin ist ihr leiblicher Vater.'
    }),
    ...childrenOf(['tref-diafol'], TALGARTH_PARTNERS.tarawg, 'marriage-tarawg-maygan-diafol', {
      idPrefix: 'diafol-talgarth-parentage'
    })
  ],
  cadetBranches: [telynWardBranch()],
  timeJumps: [],
  lineage: {
    founderPartnershipId: '',
    houseId: TALGARTH_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Talgarth · seit 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'diafol-trefgoch-origin',
      houseId: TREFGOCH_HOUSE_ID,
      name: "Haus Diafol O'Trefgoch",
      subtitle: 'Herkunftslinie aus Vennyr',
      emblem: DIAFOL_EMBLEM,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['tryffin-diafol', 'torri-diafol', 'tarawg-diafol'],
      targetFamilyId: 'haus-diafol',
      notes: 'Die drei überlebenden Geschwister setzen 1720 gemeinsam in Talgarth neu an. Ihre fünf Kinder vervollständigen die acht überlebenden Diafol.'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tryffin-diafol',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    originFamilyId: 'haus-diafol',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Getrennte Talgarther Zielakte mit genau den acht überlebenden Diafol: Tryffin, Torri, Tarawg, Tawr, Telyn, Meic, Medi und Tref. Morcant, Maygan und Slevin sind als lebende Partner enthalten; der 1720 gefallene Madog bleibt ausschließlich notwendig, damit Meic seiner tatsächlichen Affäre zugeordnet wird. Torri wird nicht gedoppelt. Telyn behält seinen leiblichen Elternanschluss und zugleich die blaue Weggegeben-Mündelverknüpfung zur Blodyn-Gegenakte.'
  }
});
