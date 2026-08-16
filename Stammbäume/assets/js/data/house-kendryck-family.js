import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch
} from './family-record-builders.js';
import { AELDRUNMAR_HOUSE_PROFILES } from './aeldrunmar-house-profiles.js';

const KENDRYCK_HOUSE_ID = 'house-kendryck';
const KENDRYCK_EMBLEM = 'assets/images/houses/Aeldrunmar/haus-kendryck.png';
const SEOLFOR_HOUSE_ID = 'house-seolfor';
const SEOLFOR_EMBLEM = 'assets/images/houses/Aeldrunmar/haus-seolfor.png';

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

const PERSON_ROWS = Object.freeze([
  ['person-25ff9d93', 'Wulfhere Kendryck', 'male', 'Unbekannt', 'Unbekannt', '', 'core', 'head'],
  ['person-5ec75552', 'Mildgyth', 'female', 'Unbekannt', 'Unbekannt', '', 'married', 'mainline'],
  ['person-6a655385', 'Dunbrand Sigewulf', 'male', '1650', '1705', 'Reeve', 'core', 'head'],
  ['person-600dab7b', 'Ealhswith', 'female', '1652', '1730', '', 'married', 'mainline'],
  ['person-b334cace', 'Dunhelm Eadric', 'male', '1670', '1720', 'Reeve', 'core', 'head'],
  ['person-29a9dc96', 'Dunburg Leofrun', 'female', '1675', '', '', 'core', 'mainline'],
  ['person-0485abd8', 'Dunfrith Beorhtred', 'male', '1673', '', '', 'core', 'mainline'],
  ['person-80afee79', 'Dunleof Godgyth', 'female', '1673', '', 'Königin Mutter', 'married', 'mainline'],
  ['person-101bc4d7', 'Dunhard Wulfric', 'male', '1691', '1720', '', 'core', 'branch'],
  ['person-322c0257', 'Coelwulf Wulfgar', 'male', '1693', '', 'König', 'core', 'head'],
  ['person-69788a2b', 'Coelflæd Wulfhild', 'female', '1697', '', '', 'core', 'branch'],
  ['person-7fcf16c8', 'Coelvard Wulfred', 'male', '1702', '', '', 'core', 'branch'],
  ['person-3951aee7', 'Coelgyth Wulfgifu', 'female', '1704', '', '', 'core', 'branch'],
  ['person-d6bd71eb', 'Coeldran Wulfric', 'male', '1708', '', '', 'core', 'mainline'],
  ['person-e9b36eea', '??? Leofrun', 'female', '', '', '', 'married', 'mainline'],
  ['person-659f30e1', 'Walmaris Saewynn Seolfor', 'female', '1694', '', 'Schwester Walhyld Saewines', 'married', 'branch', SEOLFOR_HOUSE_ID],
  ['person-09e39e2e', 'Coelgar Wulfstan', 'male', '1713', '', 'Kronprinz', 'core', 'branch'],
  ['person-589a5bfe', 'Coelferth Osric', 'male', '1721', '', 'Prinz', 'core', 'mainline'],
  ['person-2ecef67d', 'Coelgyth Cyneswith', 'female', '1722', '', '', 'core', 'branch'],
  ['person-eacdecf2', 'Coelswyth Mildred', 'female', '1723', '', '', 'core', 'mainline'],
  ['person-7ee11855', 'Coelrun Scáthach', 'female', '1730', '', '', 'core', 'mainline'],
  ['person-68da5d45', '??? ???', 'male', '', '', '', 'married', 'branch'],
  ['person-7769a2d1', '??? ???', 'female', '', '', '', 'married', 'branch'],
  ['person-3da018b4', '??? ???', 'male', '', '', '', 'married', 'branch'],
  ['person-da869a9b', '??? ???', 'female', '', '', '', 'married', 'branch'],
  ['person-bcf38b71', '??? ???', 'female', '1698', '1720', '', 'married', 'branch'],
  ['person-93d44f22', '??? ???', 'female', '', '', '', 'core', 'branch'],
  ['person-4da19909', '??? ???', 'male', '', '', '', 'core', 'branch'],
  ['person-469e8324', '??? ???', 'male', '', '', '', 'core', 'branch'],
  ['person-e6f6cf50', '??? ???', 'female', '', '', '', 'core', 'branch'],
  ['person-77643d3e', '??? ???', 'female', '', '', '', 'married', 'branch'],
  ['person-d83a56ed', '??? ???', 'female', '', '', '', 'core', 'branch'],
  ['person-17af098c', '??? ???', 'male', '', '', '', 'core', 'branch'],
  ['person-f5526231', '??? ???', 'male', '', '', '', 'married', 'branch'],
  ['person-06f03ee5', '??? ???', 'female', '', '', '', 'married', 'branch'],
  ['person-b54a53c5', '??? ???', 'male', '', '', '', 'married', 'branch'],
  ['person-a02da5bf', '??? ???', 'female', '', '', '', 'core', 'branch'],
  ['person-d9c47b8e', '??? ???', 'female', '', '', '', 'core', 'branch'],
  ['person-ea768449', '??? ???', 'male', '', '', '', 'core', 'branch'],
  ['person-f26f355c', 'Æthelflory Eawyn Tharn', 'female', '1720', '', '', 'married', 'branch'],
  ['person-c0700896', '??? ???', 'female', '1719', '', '', 'married', 'branch'],
  ['person-2b081eeb', '??? ???', 'unknown', '1738', '', '', 'core', 'mainline']
]);

const PARTNERSHIP_ROWS = Object.freeze([
  ['partnership-c9786377', 'marriage', 'person-25ff9d93', 'person-5ec75552'],
  ['partnership-abdd6ce6', 'marriage', 'person-6a655385', 'person-600dab7b'],
  ['partnership-1970b790', 'marriage', 'person-b334cace', 'person-80afee79'],
  ['partnership-21d70a5c', 'marriage', 'person-322c0257', 'person-e9b36eea'],
  ['marriage-coelwulf-walmaris-kendryck-seolfor', 'marriage', 'person-322c0257', 'person-659f30e1'],
  ['partnership-221fb8d0', 'marriage', 'person-69788a2b', 'person-68da5d45'],
  ['partnership-95055e5a', 'marriage', 'person-7fcf16c8', 'person-7769a2d1'],
  ['partnership-9d5ba965', 'marriage', 'person-3951aee7', 'person-3da018b4'],
  ['partnership-114c8758', 'marriage', 'person-d6bd71eb', 'person-da869a9b'],
  ['partnership-a574643c', 'marriage', 'person-101bc4d7', 'person-bcf38b71'],
  ['partnership-d5c06a9a', 'marriage', 'person-0485abd8', 'person-77643d3e'],
  ['partnership-f82895e3', 'marriage', 'person-29a9dc96', 'person-f5526231'],
  ['partnership-4dacad65', 'marriage', 'person-17af098c', 'person-06f03ee5'],
  ['partnership-49cb3d43', 'marriage', 'person-d83a56ed', 'person-b54a53c5'],
  ['partnership-62799189', 'engagement', 'person-589a5bfe', 'person-f26f355c'],
  ['partnership-e9d30e8f', 'marriage', 'person-09e39e2e', 'person-c0700896']
]);

const MARRIED_AWAY_PERSON_IDS = new Set([
  'person-29a9dc96',
  'person-69788a2b',
  'person-3951aee7',
  'person-d83a56ed'
]);

const UNKNOWN_HOUSE_PARTNER_IDS = new Set([
  'person-68da5d45',
  'person-3da018b4',
  'person-f5526231',
  'person-b54a53c5'
]);

function createPerson(row) {
  const [id, name, sex, birth, death, title, familyRole, lineageRole, houseIdOverride = ''] = row;
  const isMarriedAway = MARRIED_AWAY_PERSON_IDS.has(id);
  return createFamilyPerson({
    id,
    worldPersonId: id === 'person-659f30e1'
      ? 'person--haus-seolfor--person-659f30e1'
      : `person--haus-kendryck--${id}`,
    name,
    sex,
    birth,
    death,
    title: title || (isMarriedAway ? 'Wegverheiratet an ein unbekanntes Haus' : ''),
    houseId: houseIdOverride || (familyRole === 'core'
      ? KENDRYCK_HOUSE_ID
      : UNKNOWN_HOUSE_PARTNER_IDS.has(id)
        ? 'house-unknown'
        : ''),
    familyRole,
    lineageRole,
    tags: isMarriedAway ? ['Wegverheiratet'] : [],
    extensions: { registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS }
  });
}

function createPartnership(row) {
  const [id, type, firstId, secondId] = row;
  return createMarriage(id, firstId, secondId, { type });
}

function parentage(id, childId, parentIds, partnershipId, options = {}) {
  return Object.freeze({
    id,
    childId,
    parentIds: Object.freeze([...parentIds]),
    partnershipId,
    type: options.type || 'biological',
    legitimacy: options.legitimacy || 'legitimate',
    certainty: options.certainty || 'confirmed',
    visibility: 'public',
    notes: options.notes || '',
    extensions: Object.freeze({ ...(options.extensions || {}) })
  });
}

const PARENTAGES = Object.freeze([
  parentage('parentage-af4ef5d7', 'person-6a655385', ['person-25ff9d93', 'person-5ec75552'], 'partnership-c9786377', {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Nach einem Zeitsprung wieder belegte Linie.',
    extensions: { timeJumpId: 'time-jump-04de1e33', timeJumpCreated: true }
  }),
  parentage('parentage-c688a695', 'person-b334cace', ['person-6a655385', 'person-600dab7b'], 'partnership-abdd6ce6'),
  parentage('parentage-b0b2fe4e', 'person-29a9dc96', ['person-6a655385', 'person-600dab7b'], 'partnership-abdd6ce6'),
  parentage('parentage-667df6a5', 'person-0485abd8', ['person-6a655385', 'person-600dab7b'], 'partnership-abdd6ce6'),
  parentage('parentage-6147c6d9', 'person-101bc4d7', ['person-b334cace', 'person-80afee79'], 'partnership-1970b790'),
  parentage('parentage-04a2a8a6', 'person-322c0257', ['person-b334cace', 'person-80afee79'], 'partnership-1970b790'),
  parentage('parentage-eb3da5b9', 'person-69788a2b', ['person-b334cace', 'person-80afee79'], 'partnership-1970b790'),
  parentage('parentage-2f56f681', 'person-7fcf16c8', ['person-b334cace', 'person-80afee79'], 'partnership-1970b790'),
  parentage('parentage-92c5c079', 'person-3951aee7', ['person-b334cace', 'person-80afee79'], 'partnership-1970b790'),
  parentage('parentage-1c23d590', 'person-d6bd71eb', ['person-b334cace', 'person-80afee79'], 'partnership-1970b790'),
  parentage('parentage-1f378528', 'person-09e39e2e', ['person-322c0257', 'person-e9b36eea'], 'partnership-21d70a5c'),
  parentage('parentage-e36c0e21', 'person-589a5bfe', ['person-322c0257', 'person-659f30e1'], 'marriage-coelwulf-walmaris-kendryck-seolfor'),
  parentage('parentage-58d4d6ed', 'person-2ecef67d', ['person-322c0257', 'person-659f30e1'], 'marriage-coelwulf-walmaris-kendryck-seolfor'),
  parentage('parentage-e6026839', 'person-eacdecf2', ['person-322c0257', 'person-659f30e1'], 'marriage-coelwulf-walmaris-kendryck-seolfor'),
  parentage('parentage-a2bc8693', 'person-7ee11855', ['person-322c0257', 'person-659f30e1'], 'marriage-coelwulf-walmaris-kendryck-seolfor'),
  parentage('parentage-42d3591e', 'person-93d44f22', ['person-7fcf16c8', 'person-7769a2d1'], 'partnership-95055e5a'),
  parentage('parentage-ef74e271', 'person-4da19909', ['person-7fcf16c8', 'person-7769a2d1'], 'partnership-95055e5a'),
  parentage('parentage-5c30d967', 'person-469e8324', ['person-d6bd71eb', 'person-da869a9b'], 'partnership-114c8758'),
  parentage('parentage-7427dcc2', 'person-e6f6cf50', ['person-7fcf16c8', 'person-7769a2d1'], 'partnership-95055e5a'),
  parentage('parentage-9f04dc37', 'person-d83a56ed', ['person-0485abd8', 'person-77643d3e'], 'partnership-d5c06a9a'),
  parentage('parentage-9bb40ae3', 'person-17af098c', ['person-0485abd8', 'person-77643d3e'], 'partnership-d5c06a9a'),
  parentage('parentage-051d7318', 'person-a02da5bf', ['person-17af098c', 'person-06f03ee5'], 'partnership-4dacad65'),
  parentage('parentage-56680974', 'person-d9c47b8e', ['person-17af098c', 'person-06f03ee5'], 'partnership-4dacad65'),
  parentage('parentage-968f136d', 'person-ea768449', ['person-17af098c', 'person-06f03ee5'], 'partnership-4dacad65'),
  parentage('parentage-94d5ab02', 'person-2b081eeb', ['person-09e39e2e', 'person-c0700896'], 'partnership-e9d30e8f')
]);

export const HOUSE_KENDRYCK_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: Object.freeze({
    id: 'haus-kendryck',
    title: 'Haus Kendryck',
    motto: '',
    description: 'Die aus dem manuellen Stammbaum übernommene aktuelle Königslinie Aeldrunmars in Aeldrunhal.',
    emblem: KENDRYCK_EMBLEM,
    houseProfile: AELDRUNMAR_HOUSE_PROFILES.kendryck
  }),
  houses: Object.freeze([
    Object.freeze({
      id: KENDRYCK_HOUSE_ID,
      name: 'Haus Kendryck',
      motto: '',
      emblem: KENDRYCK_EMBLEM,
      status: 'active'
    }),
    Object.freeze({
      id: 'house-unknown',
      name: 'Unbekanntes Haus',
      motto: '',
      emblem: '',
      status: 'active'
    }),
    Object.freeze({
      id: SEOLFOR_HOUSE_ID,
      name: 'Haus Seolfor',
      motto: '',
      emblem: SEOLFOR_EMBLEM,
      status: 'active'
    })
  ]),
  persons: Object.freeze(PERSON_ROWS.map(createPerson)),
  partnerships: Object.freeze(PARTNERSHIP_ROWS.map(createPartnership)),
  parentages: PARENTAGES,
  cadetBranches: Object.freeze([
    Object.freeze(createMarriedAwayBranch({
      id: 'married-away-dunburg-kendryck-unknown',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'partnership-f82895e3',
      houseId: 'house-unknown',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an ein unbekanntes Haus'
    })),
    Object.freeze(createMarriedAwayBranch({
      id: 'married-away-coelflaed-kendryck-unknown',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'partnership-221fb8d0',
      houseId: 'house-unknown',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an ein unbekanntes Haus'
    })),
    Object.freeze(createMarriedAwayBranch({
      id: 'married-away-coelgyth-wulfgifu-kendryck-unknown',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'partnership-9d5ba965',
      houseId: 'house-unknown',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an ein unbekanntes Haus'
    })),
    Object.freeze(createMarriedAwayBranch({
      id: 'married-away-dunfrith-daughter-kendryck-unknown',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'partnership-49cb3d43',
      houseId: 'house-unknown',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an ein unbekanntes Haus'
    }))
  ]),
  timeJumps: Object.freeze([
    Object.freeze({
      id: 'time-jump-04de1e33',
      parentPartnershipId: 'partnership-c9786377',
      sharedParentPartnershipIds: Object.freeze([]),
      parentPersonId: '',
      childIds: Object.freeze(['person-6a655385']),
      years: 0,
      fromYear: 'Unbekannt',
      toYear: '1650',
      label: '',
      notes: '',
      extensions: Object.freeze({})
    })
  ]),
  lineage: Object.freeze({
    founderPartnershipId: 'partnership-c9786377',
    houseId: KENDRYCK_HOUSE_ID,
    crestSubtitle: 'Königshaus von Aeldrunhal',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: Object.freeze({ enabled: false, years: 0, fromYear: '', toYear: '', label: '' })
  }),
  presentation: Object.freeze({ relationshipColors: Object.freeze({ ...DEFAULT_RELATIONSHIP_COLORS }) }),
  view: Object.freeze({
    focusPersonId: 'person-25ff9d93',
    orientation: 'vertical',
    ancestorDepth: 12,
    descendantDepth: 12,
    limitGenerations: false,
    showSiblings: true
  }),
  extensions: Object.freeze({
    blankFamily: false,
    sourceRevision: 2,
    sourceNote: 'Der vollständige verbundene Graph stammt aus „Stammbäume Manuell exportiert/Kendrck.json“. Die unverbundene doppelte Mildgyth-Karte wurde nicht übernommen; der unmögliche Eintrag 1998–1720 wurde als offensichtlicher Zahlendreher zu 1698–1720 normalisiert. Coelgar Wulfstan ist auf 1713 korrigiert. Coelwulfs erste Frau ist ausschließlich Coelgars Mutter; Coelferth, Coelgyth, Coelswyth und Coelrun entstammen seiner zweiten Ehe mit Walmaris Saewynn Seolfor. Diese Ehe ist spiegelbildlich im Seolfor-Stammbaum registriert.',
    registryManagedHouseProfileFields: Object.freeze([
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'secondarySeats',
      'regionEmblems'
    ]),
    registryManagedRecordFields: Object.freeze(['folderPath'])
  })
});
