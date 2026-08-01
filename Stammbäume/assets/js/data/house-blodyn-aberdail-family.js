import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { BLODYN_HOUSE_PROFILES } from './blodyn-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';

const BLODYN_HOUSE_ID = 'house-blodyn';
const ABERDAIL_HOUSE_ID = 'house-blodyn-aberdail';
const BLODYN_EMBLEM = 'assets/images/houses/Blütenland/haus-blodyn.png';
const FOUNDER_IDS = Object.freeze(['yvain-blodyn', 'bronwen-blaidd']);

function person(id, name, sex, birth, houseId, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death: '',
    houseId,
    portrait: HOUSE_BLODYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || 'branch',
    ...options
  });
}

export const HOUSE_BLODYN_ABERDAIL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-blodyn-aberdail',
    title: 'Haus Blodyn von Aberdail',
    motto: 'Datblyg dy nerth a thyfu!',
    description: 'Die ausschließlich von Yvain Blodyn und Bronwen Blaidd ausgehende Baroniallinie von Aberdail in der Baronie Blutklaue.',
    emblem: BLODYN_EMBLEM,
    houseProfile: BLODYN_HOUSE_PROFILES.aberdail
  },
  houses: [
    { id: ABERDAIL_HOUSE_ID, name: 'Haus Blodyn von Aberdail', motto: 'Datblyg dy nerth a thyfu!', emblem: BLODYN_EMBLEM, status: 'active' },
    { id: BLODYN_HOUSE_ID, name: 'Haus Blodyn', motto: 'Datblyg dy nerth a thyfu!', emblem: BLODYN_EMBLEM, status: 'active' },
    { id: 'house-blaidd', name: "Haus Blaidd O'Branon", motto: '', emblem: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd, status: 'active' },
    { id: 'house-blaidd-tredegar', name: "Haus Blaidd O'Tredegar", motto: '', emblem: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd, status: 'active' }
  ],
  persons: [
    person('yvain-blodyn', 'Yvain Blodyn', 'male', '1694', BLODYN_HOUSE_ID, {
      title: 'Baron von Aberdail',
      lineageRole: 'head'
    }),
    person('bronwen-blaidd', 'Bronwen Blaidd', 'female', '1694', 'house-blaidd-tredegar', {
      worldPersonId: 'person--haus-blaidd--bronwen-blaidd',
      familyRole: 'married'
    }),
    person('dalvin-blodyn', 'Dalvin Blodyn', 'male', '1713', ABERDAIL_HOUSE_ID, {
      title: 'Erster in der Erbfolge von Aberdail',
      lineageRole: 'mainline'
    }),
    person('erec-blodyn', 'Erec Blodyn', 'male', '1715', ABERDAIL_HOUSE_ID, {
      title: 'Zweiter in der Erbfolge von Aberdail'
    })
  ],
  partnerships: [
    createMarriage('marriage-yvain-bronwen', ...FOUNDER_IDS)
  ],
  parentages: [
    ...createParentages(['dalvin-blodyn', 'erec-blodyn'], FOUNDER_IDS, 'marriage-yvain-bronwen')
  ],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-yvain-bronwen',
    houseId: ABERDAIL_HOUSE_ID,
    crestSubtitle: 'Baronshaus von Aberdail',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'yvain-blodyn',
    orientation: 'vertical',
    ancestorDepth: 4,
    descendantDepth: 4,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Diese Akte bildet absichtlich nur Yvain Blodyn, Bronwen Blaidd und ihre Söhne Dalvin und Erec ab. Die Eltern und Geschwister Yvains bleiben in der verknüpften Lyndor-Akte; die Kinder werden dort nicht gedoppelt.',
    blankFamily: false,
    sourceRevision: 1
  }
});
