import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { BLODYN_HOUSE_PROFILES } from './blodyn-house-profiles.js';
import { KLAUENINSEL_HOUSE_EMBLEMS } from './klaueninseln-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';

const BLODYN_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.blodyn;
const TALGARTH_HOUSE_ID = 'house-blodyn-talgarth';
const YHON_IDS = Object.freeze(['yhon-blodyn', 'cerny-dianc']);

function person(id, name, sex, birth, death, houseId, options = {}) {
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_BLODYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || 'branch',
    title: options.title || ''
  });
}

export const HOUSE_BLODYN_TALGARTH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: Object.freeze({
    id: 'haus-blodyn-talgarth',
    title: "Haus Blodyn O'Talgarth",
    motto: 'Datblyg dy nerth a thyfu!',
    description: 'Die getrennte Talgarther Linie Yhon Blodyns: ausschließlich Yhon, seine Frau Cerny, ihre Kinder Cerys und Griffin sowie ihr aufgenommenes Mündel Telyn Diafol.',
    emblem: BLODYN_EMBLEM,
    houseProfile: BLODYN_HOUSE_PROFILES.talgarth
  }),
  houses: Object.freeze([
    Object.freeze({ id: TALGARTH_HOUSE_ID, name: "Haus Blodyn O'Talgarth", motto: 'Datblyg dy nerth a thyfu!', emblem: BLODYN_EMBLEM, status: 'active' }),
    Object.freeze({ id: 'house-blodyn', name: "Haus Blodyn O'Llyndor", motto: 'Datblyg dy nerth a thyfu!', emblem: BLODYN_EMBLEM, status: 'active' }),
    Object.freeze({ id: 'house-dianc', name: "Haus Dianc O'Gwynlann", motto: '', emblem: KLAUENINSEL_HOUSE_EMBLEMS.dianc, status: 'active' }),
    Object.freeze({ id: 'house-diafol', name: "Haus Diafol O'Trefgoch", motto: '', emblem: KLAUENINSEL_HOUSE_EMBLEMS.diafol, status: 'active' })
  ]),
  persons: Object.freeze([
    person('yhon-blodyn', 'Yhon Blodyn', 'male', '1693', '', 'house-blodyn', {
      worldPersonId: 'person--haus-blodyn--yhon-blodyn',
      title: 'König von Vennyr seit 1720',
      lineageRole: 'head'
    }),
    person('cerny-dianc', 'Cerny Dianc', 'female', '1692', '1720', 'house-dianc', {
      worldPersonId: 'person--haus-dianc--cerny-dianc',
      familyRole: 'married'
    }),
    person('cerys-blodyn', 'Cerys Blodyn', 'female', '1714', '', TALGARTH_HOUSE_ID, {
      worldPersonId: 'person--haus-blodyn--cerys-blodyn',
      title: 'Erste in der Erbfolge Vennyrs',
      lineageRole: 'mainline'
    }),
    person('griffin-blodyn', 'Griffin Blodyn', 'male', '1715', '1720', TALGARTH_HOUSE_ID, {
      worldPersonId: 'person--haus-blodyn--griffin-blodyn'
    }),
    person('telyn-diafol', 'Telyn Diafol', 'male', '1717', '', 'house-diafol', {
      worldPersonId: 'person--haus-diafol--telyn-diafol',
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Yhons'
    })
  ]),
  partnerships: Object.freeze([
    Object.freeze(createMarriage('marriage-yhon-cerny', ...YHON_IDS))
  ]),
  parentages: Object.freeze([
    ...createParentages(['cerys-blodyn', 'griffin-blodyn'], YHON_IDS, 'marriage-yhon-cerny'),
    ...createParentages(['telyn-diafol'], YHON_IDS, 'marriage-yhon-cerny', {
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Telyn Diafol ist ein aufgenommenes Mündel Yhons und kein leibliches Kind der Blodyn.'
    })
  ]),
  cadetBranches: Object.freeze([]),
  timeJumps: Object.freeze([]),
  lineage: Object.freeze({
    founderPartnershipId: 'marriage-yhon-cerny',
    houseId: TALGARTH_HOUSE_ID,
    crestSubtitle: 'Talgarther Linie Yhon Blodyns',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: Object.freeze({ enabled: false, years: 0, fromYear: '', toYear: '', label: '' })
  }),
  presentation: Object.freeze({ relationshipColors: Object.freeze({ ...DEFAULT_RELATIONSHIP_COLORS }) }),
  view: Object.freeze({
    focusPersonId: 'yhon-blodyn',
    orientation: 'vertical',
    ancestorDepth: 4,
    descendantDepth: 4,
    limitGenerations: false,
    showSiblings: true
  }),
  extensions: Object.freeze({
    sourceNote: 'Diese Akte bildet absichtlich nur Yhon Blodyn, Cerny Dianc, ihre beiden leiblichen Kinder und das aufgenommene Mündel Telyn Diafol ab. Die ältere Lyndor-Linie bleibt in der Hauptakte; Yhons Nachkommen werden dort nicht doppelt weitergeführt.',
    blankFamily: false,
    sourceRevision: 1
  })
});
