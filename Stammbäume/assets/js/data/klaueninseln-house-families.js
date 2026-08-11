import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_ARTH_FAMILY } from './house-arth-family.js';
import {
  HOUSE_ARFORDIR_ABERDAIL_FAMILY,
  HOUSE_ARFORDIR_SERENLYN_FAMILY
} from './house-arfordir-family.js';
import { HOUSE_BERYN_FAMILY } from './house-beryn-family.js';
import { HOUSE_CRAFANC_FAMILY } from './house-crafanc-family.js';
import {
  HOUSE_DIAFOL_TALGARTH_FAMILY,
  HOUSE_DIAFOL_TREFGOCH_FAMILY
} from './house-diafol-family.js';
import {
  HOUSE_DIANC_ABERDAIL_FAMILY,
  HOUSE_DIANC_GWYNLANN_FAMILY
} from './house-dianc-family.js';
import {
  HOUSE_DYFRGI_CAER_CRYFTLAWD_FAMILY,
  HOUSE_DYFRGI_MYNYDDHARBWR_FAMILY
} from './house-dyfrgi-family.js';
import { HOUSE_EIRTH_FAMILY } from './house-eirth-family.js';
import { HOUSE_MORTHWYLL_FAMILY } from './house-morthwyll-family.js';
import { HOUSE_PAWEN_FAMILY } from './house-pawen-family.js';
import { HOUSE_SELWYN_FAMILY } from './house-selwyn-family.js';
import { HOUSE_UNIGOL_FAMILY } from './house-unigol-family.js';
import {
  HOUSE_WALWRS_CAER_DEHEUOL_FAMILY,
  HOUSE_WALWRS_TRAETH_FAMILY
} from './house-walwrs-family.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';

const CADET_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'cwningod',
    title: 'Haus Cwningod',
    partnershipId: 'marriage-galeshin-arianhrod',
    founderNote: 'Galeshin Arth und Arianrhod begründen Haus Cwningod.'
  })
]);

const SIMPLE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'ard-follmhar', title: 'Haus Ard Follmhar', ancient: true })
]);

function cloneRecord(record) {
  return Object.freeze({
    ...record,
    ...(Array.isArray(record.participantIds)
      ? { participantIds: Object.freeze([...record.participantIds]) }
      : {}),
    ...(Array.isArray(record.tags) ? { tags: Object.freeze([...record.tags]) } : {}),
    extensions: Object.freeze({ ...(record.extensions || {}) })
  });
}

function targetCrestFrame(rankId) {
  return rankId === 'knight' ? 'silver' : 'gold';
}

function createCadetFounderFamily(definition) {
  const familyId = `haus-${definition.slug}`;
  const houseId = `house-${definition.slug}`;
  const profile = KLAUENINSEL_HOUSE_PROFILES[definition.slug];
  const partnership = HOUSE_ARTH_FAMILY.partnerships
    .find(entry => entry.id === definition.partnershipId);
  if (!partnership) throw new Error(`${definition.partnershipId}: Gründerehe fehlt in Haus Arth.`);

  const persons = partnership.participantIds.map(personId => {
    const person = HOUSE_ARTH_FAMILY.persons.find(entry => entry.id === personId);
    if (!person) throw new Error(`${personId}: Gründerperson fehlt in Haus Arth.`);
    return cloneRecord(person);
  });
  const requiredHouseIds = new Set(persons.map(person => person.houseId).filter(Boolean));
  const originHouses = HOUSE_ARTH_FAMILY.houses
    .filter(house => requiredHouseIds.has(house.id) && house.id !== houseId)
    .map(cloneRecord);

  return Object.freeze({
    schema: 'aleria.family-tree',
    schemaVersion: 1,
    document: Object.freeze({
      id: familyId,
      title: definition.title,
      motto: '',
      description: `Vorbereitete Kadettenhausakte. ${definition.founderNote} Weitere Generationen werden nach ihrer eigenen Hausquelle ergänzt.`,
      emblem: KLAUENINSEL_HOUSE_EMBLEMS[definition.slug],
      houseProfile: profile
    }),
    houses: Object.freeze([
      Object.freeze({
        id: houseId,
        name: definition.title,
        motto: '',
        emblem: KLAUENINSEL_HOUSE_EMBLEMS[definition.slug],
        status: 'active'
      }),
      ...originHouses
    ]),
    persons: Object.freeze(persons),
    partnerships: Object.freeze([cloneRecord(partnership)]),
    parentages: Object.freeze([]),
    lineage: Object.freeze({
      founderPartnershipId: partnership.id,
      houseId,
      crestSubtitle: 'Aus dem Hause Arth hervorgegangene Kadettenlinie',
      crestEmblemScale: 0.86,
      crestFrame: targetCrestFrame(profile.rankId),
      crestFrameScale: 1,
      timeGap: Object.freeze({ enabled: false, years: 0, fromYear: '', toYear: '', label: '' })
    }),
    cadetBranches: Object.freeze([]),
    timeJumps: Object.freeze([]),
    presentation: Object.freeze({ relationshipColors: Object.freeze({ ...DEFAULT_RELATIONSHIP_COLORS }) }),
    view: Object.freeze({
      focusPersonId: partnership.participantIds[0],
      orientation: 'vertical',
      ancestorDepth: 8,
      descendantDepth: 8,
      limitGenerations: false,
      showSiblings: true
    }),
    extensions: Object.freeze({
      blankFamily: true,
      sourceRevision: 1,
      sourceFamilyId: 'haus-arth',
      sourcePartnershipId: partnership.id,
      sourceNote: definition.founderNote
    })
  });
}

function createSimpleFamily(definition) {
  const profile = KLAUENINSEL_HOUSE_PROFILES[definition.slug];
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: KLAUENINSEL_HOUSE_EMBLEMS[definition.slug],
    houseProfile: profile,
    description: definition.ancient
      ? 'Vorbereitete Familienakte des antiken Hauses Ard Follmhar aus Ard Dunrath.'
      : 'Vorbereitete Familienakte des niederen Ritterherrenhauses Beryn aus Talgarth.'
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({ ...base.lineage, crestFrame: targetCrestFrame(profile.rankId) }),
    extensions: Object.freeze({ ...base.extensions, sourceRevision: 1 })
  });
}

export const KLAUENINSEL_DEPENDENT_HOUSE_FAMILIES = Object.freeze([
  HOUSE_PAWEN_FAMILY,
  HOUSE_CRAFANC_FAMILY,
  HOUSE_UNIGOL_FAMILY,
  HOUSE_MORTHWYLL_FAMILY,
  HOUSE_EIRTH_FAMILY,
  HOUSE_SELWYN_FAMILY,
  HOUSE_DIAFOL_TALGARTH_FAMILY,
  HOUSE_DIANC_ABERDAIL_FAMILY,
  HOUSE_ARFORDIR_ABERDAIL_FAMILY,
  HOUSE_DYFRGI_CAER_CRYFTLAWD_FAMILY,
  HOUSE_WALWRS_CAER_DEHEUOL_FAMILY,
  ...CADET_DEFINITIONS.map(createCadetFounderFamily),
  HOUSE_BERYN_FAMILY,
  ...SIMPLE_DEFINITIONS.map(createSimpleFamily)
]);

export const KLAUENINSEL_ORIGIN_HOUSE_FAMILIES = Object.freeze(
  [
    HOUSE_DIAFOL_TREFGOCH_FAMILY,
    HOUSE_DIANC_GWYNLANN_FAMILY,
    HOUSE_ARFORDIR_SERENLYN_FAMILY,
    HOUSE_DYFRGI_MYNYDDHARBWR_FAMILY,
    HOUSE_WALWRS_TRAETH_FAMILY
  ]
);
