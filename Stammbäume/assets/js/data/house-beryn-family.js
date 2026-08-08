import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_BERYN_PORTRAITS } from './house-beryn-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';

const BERYN_HOUSE_ID = 'house-beryn';
const BERYN_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.beryn;

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

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId: options.houseId === undefined ? BERYN_HOUSE_ID : options.houseId,
    portrait: HOUSE_BERYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
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

function spouse(id, name, sex, birth, death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function affair(id, name, birth) {
  return spouse(id, name, 'female', birth, '', {
    familyRole: 'affair',
    title: 'Affäre Cadell Beryns · Mutter von Emrys und Elin',
    tags: ['Affäre'],
    notes: 'Aus dieser Affäre stammen ausschließlich Emrys und Elin Beryn.'
  });
}

function bastard(id, name, sex, birth) {
  return person(id, name, sex, birth, '', {
    familyRole: 'bastard',
    title: 'Bastardkind von Cadell Beryn und Lowri',
    tags: ['Bastard'],
    notes: `${name} stammt eindeutig aus Cadells Affäre mit Lowri.`
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
  founders: ['caradog-beryn', 'efa-caradog-spouse'],
  grandparents: ['madog-beryn', 'gwenllian-madog-spouse'],
  rhodri: ['rhodri-beryn', 'angharad-rhodri-spouse'],
  cadell: ['cadell-beryn', 'eira-cadell-spouse'],
  cadellAffair: ['cadell-beryn', 'lowri-cadell-affair'],
  brychan: ['brychan-beryn', 'seren-brychan-spouse'],
  owain: ['owain-beryn', 'mared-owain-spouse'],
  cadfan: ['cadfan-beryn', 'nerys-cadfan-spouse'],
  gethin: ['gethin-beryn', 'catrin-gethin-spouse'],
  tudur: ['tudur-beryn', 'rhosyn-tudur-spouse'],
  mair: ['mair-beryn', 'branoc-mair-spouse']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-caradog-efa-beryn': COUPLES.founders,
  'marriage-madog-gwenllian-beryn': COUPLES.grandparents,
  'marriage-rhodri-angharad-beryn': COUPLES.rhodri,
  'marriage-cadell-eira-beryn': COUPLES.cadell,
  'affair-cadell-lowri-beryn': COUPLES.cadellAffair,
  'marriage-brychan-seren-beryn': COUPLES.brychan
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'beryn-parentage', ...options }
  );
}

export const HOUSE_BERYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: Object.freeze({
    id: 'haus-beryn',
    title: 'Haus Beryn',
    motto: '',
    description: 'Kleines niederes Ritterherrenhaus aus Talgarth. Der vollständig dargestellte Stammbaum reicht von Ifor Beryn bis zu seinem Urgroßvater Caradog und gliedert sich unter Madog Beryn in genau drei fortgeführte Männerlinien.',
    emblem: BERYN_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.beryn
  }),
  houses: Object.freeze([
    Object.freeze({ id: BERYN_HOUSE_ID, name: 'Haus Beryn', motto: '', emblem: BERYN_EMBLEM, status: 'active' }),
    Object.freeze({ id: 'house-unknown', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' })
  ]),
  persons: Object.freeze([
    person('caradog-beryn', 'Caradog Beryn', 'male', '1628', '1696', {
      title: 'Ältester belegter Beryn · Ifors Urgroßvater',
      lineageRole: 'head'
    }),
    spouse('efa-caradog-spouse', 'Efa', 'female', '1633', '1701', {
      title: 'Gemahlin Caradogs'
    }),
    person('madog-beryn', 'Madog Beryn', 'male', '1654', '1725', {
      title: 'Ritterherr von Talgarth bis 1725',
      lineageRole: 'head'
    }),
    spouse('gwenllian-madog-spouse', 'Gwenllian', 'female', '1660', '1731', {
      title: 'Gemahlin Madogs'
    }),

    person('rhodri-beryn', 'Rhodri Beryn', 'male', '1680', '1737', {
      title: 'Ältester Sohn Madogs · Vater Ifors',
      lineageRole: 'head',
      tags: ['Erste Linie']
    }),
    spouse('angharad-rhodri-spouse', 'Angharad', 'female', '1685', '', {
      title: 'Witwe Rhodris · Mutter Ifors'
    }),
    person('cadell-beryn', 'Cadell Beryn', 'male', '1683', '', {
      title: 'Ritter und zweiter Sohn Madogs',
      tags: ['Zweite Linie'],
      extensions: {
        registryManagedExtensionFields: ['chartCenterBetweenSpousePersonIds']
      }
    }),
    spouse('eira-cadell-spouse', 'Eira', 'female', '1688', '', {
      title: 'Gemahlin Cadells'
    }),
    affair('lowri-cadell-affair', 'Lowri', '1692'),
    person('brychan-beryn', 'Brychan Beryn', 'male', '1686', '', {
      title: 'Ritter und jüngster Sohn Madogs',
      tags: ['Dritte Linie']
    }),
    spouse('seren-brychan-spouse', 'Seren', 'female', '1691', '', {
      title: 'Gemahlin Brychans'
    }),

    person('owain-beryn', 'Owain Beryn', 'male', '1706', '', {
      title: 'Ritterherr von Talgarth · Oberhaupt des Hauses',
      lineageRole: 'head'
    }),
    spouse('mared-owain-spouse', 'Mared', 'female', '1708', '', {
      title: 'Gemahlin Owains'
    }),
    person('cadfan-beryn', 'Cadfan Beryn', 'male', '1709', '', {
      title: 'Zweiter Sohn Rhodris · Ritter des Hauses'
    }),
    spouse('nerys-cadfan-spouse', 'Nerys', 'female', '1711', '', {
      title: 'Gemahlin Cadfans'
    }),
    person('ifor-beryn', 'Ifor Beryn', 'male', '1712', '', {
      title: 'Dritter Sohn der Hauptlinie · 28 Jahre',
      tags: ['Dritter Sohn', 'Unverheiratet'],
      notes: 'Ifor ist im Jahr 1740 achtundzwanzig Jahre alt und bewusst unverheiratet.'
    }),

    person('gethin-beryn', 'Gethin Beryn', 'male', '1708', '', {
      title: 'Ältester legitimer Sohn Cadells'
    }),
    spouse('catrin-gethin-spouse', 'Catrin', 'female', '1710', '', {
      title: 'Gemahlin Gethins'
    }),
    person('meilyr-beryn', 'Meilyr Beryn', 'male', '1716', '', {
      title: 'Jüngerer legitimer Sohn Cadells · unverheiratet',
      tags: ['Unverheiratet']
    }),
    bastard('emrys-beryn-bastard', 'Emrys Beryn', 'male', '1714'),
    bastard('elin-beryn-bastard', 'Elin Beryn', 'female', '1718'),

    person('tudur-beryn', 'Tudur Beryn', 'male', '1708', '', {
      title: 'Ältester Sohn Brychans'
    }),
    spouse('rhosyn-tudur-spouse', 'Rhosyn', 'female', '1712', '', {
      title: 'Gemahlin Tudurs'
    }),
    person('mair-beryn', 'Mair Beryn', 'female', '1706', '', {
      title: 'Wegverheiratet an ein unbekanntes Haus',
      tags: ['Wegverheiratet']
    }),
    spouse('branoc-mair-spouse', 'Branoc', 'male', '1704', '', {
      title: 'Gemahl Mairs · Haus unbekannt',
      houseId: 'house-unknown'
    }),
    person('llewelyn-beryn', 'Llewelyn Beryn', 'male', '1717', '', {
      title: 'Jüngster Sohn Brychans · unverheiratet',
      tags: ['Unverheiratet']
    })
  ]),
  partnerships: Object.freeze([
    createMarriage('marriage-caradog-efa-beryn', ...COUPLES.founders, { status: 'ended', end: '1696' }),
    createMarriage('marriage-madog-gwenllian-beryn', ...COUPLES.grandparents, { status: 'ended', end: '1725' }),
    createMarriage('marriage-rhodri-angharad-beryn', ...COUPLES.rhodri, { status: 'widowed', end: '1737' }),
    createMarriage('marriage-cadell-eira-beryn', ...COUPLES.cadell, {
      extensions: {
        registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId']
      }
    }),
    alignPartnerOverChildren(
      createMarriage('affair-cadell-lowri-beryn', ...COUPLES.cadellAffair, {
        type: 'affair',
        status: 'ended',
        visibility: 'private'
      }),
      'lowri-cadell-affair'
    ),
    createMarriage('marriage-brychan-seren-beryn', ...COUPLES.brychan),
    createMarriage('marriage-owain-mared-beryn', ...COUPLES.owain),
    createMarriage('marriage-cadfan-nerys-beryn', ...COUPLES.cadfan),
    createMarriage('marriage-gethin-catrin-beryn', ...COUPLES.gethin),
    createMarriage('marriage-tudur-rhosyn-beryn', ...COUPLES.tudur),
    createMarriage('marriage-mair-branoc-beryn', ...COUPLES.mair)
  ]),
  parentages: Object.freeze([
    ...childrenOf(['madog-beryn'], 'marriage-caradog-efa-beryn'),
    ...childrenOf(['rhodri-beryn', 'cadell-beryn', 'brychan-beryn'], 'marriage-madog-gwenllian-beryn'),
    ...childrenOf(['owain-beryn', 'cadfan-beryn', 'ifor-beryn'], 'marriage-rhodri-angharad-beryn'),
    ...childrenOf(['gethin-beryn', 'meilyr-beryn'], 'marriage-cadell-eira-beryn'),
    ...childrenOf(['emrys-beryn-bastard', 'elin-beryn-bastard'], 'affair-cadell-lowri-beryn', {
      legitimacy: 'illegitimate',
      notes: 'Beide Bastardkinder stammen ausschließlich aus Cadells Affäre mit Lowri.'
    }),
    ...childrenOf(['tudur-beryn', 'mair-beryn', 'llewelyn-beryn'], 'marriage-brychan-seren-beryn')
  ]),
  cadetBranches: Object.freeze([
    Object.freeze(createMarriedAwayBranch({
      id: 'married-away-mair-beryn-unknown',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-mair-branoc-beryn',
      houseId: 'house-unknown',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an ein unbekanntes Haus',
      crestFrame: 'gold'
    }))
  ]),
  timeJumps: Object.freeze([]),
  lineage: Object.freeze({
    founderPartnershipId: 'marriage-caradog-efa-beryn',
    houseId: BERYN_HOUSE_ID,
    crestSubtitle: 'Niederes Ritterherrenhaus aus Talgarth',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: Object.freeze({ enabled: false, years: 0, fromYear: '', toYear: '', label: '' })
  }),
  presentation: Object.freeze({ relationshipColors: Object.freeze({ ...DEFAULT_RELATIONSHIP_COLORS }) }),
  view: Object.freeze({
    focusPersonId: 'caradog-beryn',
    orientation: 'vertical',
    ancestorDepth: 8,
    descendantDepth: 8,
    limitGenerations: false,
    showSiblings: true
  }),
  extensions: Object.freeze({
    blankFamily: false,
    sourceRevision: 3,
    sourceNote: 'Der Baum reicht exakt bis Ifors Urgroßvater Caradog. Unter Madog entstehen ausschließlich die drei Linien Rhodri, Cadell und Brychan. Ifor ist Rhodris dritter Sohn. Eira bleibt als einzige Ehefrau in der normalen Eheposition neben Cadell; nur die räumlich getrennte Affäre Lowri wird über Emrys und Elin ausgerichtet. Beide Bastardkinder hängen ausschließlich unter Lowri. Mair ist direkt an das unbekannte Zielhaus wegverheiratet. Alle Personen unter achtundzwanzig bleiben unverheiratet und unverlobt.',
    registryManagedExtensionFields: Object.freeze(['sourceNote']),
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
