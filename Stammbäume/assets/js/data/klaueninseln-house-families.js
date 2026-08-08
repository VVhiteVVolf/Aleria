import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_ARTH_FAMILY } from './house-arth-family.js';
import { HOUSE_BERYN_FAMILY } from './house-beryn-family.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES,
  KLAUENINSEL_ORIGIN_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';

const CADET_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'pawen',
    title: 'Haus Pawen',
    partnershipId: 'marriage-lamorak-mared',
    founderNote: 'Lamorak Arth und Mared begründen Haus Pawen.'
  }),
  Object.freeze({
    slug: 'crafanc',
    title: 'Haus Crafanc',
    partnershipId: 'marriage-artgal-amdarch',
    founderNote: 'Artgal Arth und Amdarch begründen Haus Crafanc.'
  }),
  Object.freeze({
    slug: 'cwningod',
    title: 'Haus Cwningod',
    partnershipId: 'marriage-galeshin-arianhrod',
    founderNote: 'Galeshin Arth und Arianrhod begründen Haus Cwningod.'
  }),
  Object.freeze({
    slug: 'unigol',
    title: 'Haus Unigol',
    partnershipId: 'marriage-trahaern-ceridwen',
    founderNote: 'Trahaern Arth und Ceridwen Pawen begründen Haus Unigol.'
  }),
  Object.freeze({
    slug: 'morthwyll',
    title: 'Haus Morthwyl',
    partnershipId: 'marriage-heddwen-sayres',
    founderNote: 'Heddwen Arth und Sayres Morthwyll begründen die fortgeführte Linie von Haus Morthwyl.'
  }),
  Object.freeze({
    slug: 'eirth',
    title: 'Haus Eirth',
    partnershipId: 'marriage-rhynnon-kyndra',
    founderNote: 'Rhynnon Arth und Kyndra Crafanc begründen Haus Eirth.'
  }),
  Object.freeze({
    slug: 'selwyn',
    title: 'Haus Sélwyn',
    partnershipId: 'marriage-tegwen-morgan',
    founderNote: 'Tegwen Arth und Morgan Selwyn begründen die fortgeführte Linie von Haus Sélwyn.'
  })
]);

const MIGRATION_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'diafol',
    familySlug: 'diafol-talgarth',
    title: "Haus Diafol O'Talgarth",
    originSlug: 'diafol-trefgoch',
    originFamilySlug: 'diafol',
    originHouseId: 'house-diafol',
    originTitle: "Haus Diafol O'Trefgoch"
  }),
  Object.freeze({
    slug: 'dianc',
    familySlug: 'dianc-aberdail',
    title: "Haus Dianc O'Aberdail",
    originSlug: 'dianc-gwynlann',
    originFamilySlug: 'dianc',
    originHouseId: 'house-dianc',
    originTitle: "Haus Dianc O'Gwynlann"
  }),
  Object.freeze({
    slug: 'arfordir',
    familySlug: 'arfordir-aberdail',
    title: "Haus Arfordir O'Aberdail",
    originSlug: 'arfordir-serenlyn',
    originFamilySlug: 'arfordir',
    originHouseId: 'house-arfordir',
    originTitle: "Haus Arfordir O'Serenlyn"
  }),
  Object.freeze({
    slug: 'dyfrgi',
    familySlug: 'dyfrgi-caer-cryftlawd',
    title: "Haus Dyfrgi O'Caer Cryftlawd",
    originSlug: 'dyfrgi-mynyddharbwr',
    originFamilySlug: 'dyfrgi',
    originHouseId: 'house-dyfrgi',
    originTitle: "Haus Dyfrgi O'Mynyddharbwr"
  }),
  Object.freeze({
    slug: 'walwrs',
    familySlug: 'walwrs-caer-deheuol',
    title: "Haus Walwrs O'Caer Deheuol",
    originSlug: 'walwrs-traeth',
    originFamilySlug: 'walwrs',
    originHouseId: 'house-walwrs',
    originTitle: "Haus Walwrs O'Traeth"
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

function createMigrationCurrentFamily(definition) {
  const familyId = `haus-${definition.familySlug}`;
  const profile = KLAUENINSEL_HOUSE_PROFILES[definition.slug];
  const base = createFounderPlaceholderHouseFamily({
    id: familyId,
    title: definition.title,
    emblem: KLAUENINSEL_HOUSE_EMBLEMS[definition.slug],
    houseProfile: profile,
    description: `Vorbereitete Cenyr-Nachfolgeakte des aus Vennyr stammenden ${definition.title}. Die konkreten Auswanderer werden erst mit der eigenen Hausquelle festgelegt.`
  });
  return Object.freeze({
    ...base,
    houses: Object.freeze([
      ...base.houses,
      Object.freeze({
        id: definition.originHouseId,
        name: definition.originTitle,
        motto: '',
        emblem: KLAUENINSEL_HOUSE_EMBLEMS[definition.slug],
        status: 'active'
      })
    ]),
    lineage: Object.freeze({
      ...base.lineage,
      crestFrame: targetCrestFrame(profile.rankId),
      originHouse: Object.freeze({
        enabled: true,
        id: `${definition.originSlug}-origin`,
        houseId: definition.originHouseId,
        name: definition.originTitle,
        subtitle: 'Vennyrianische Herkunftslinie',
        emblem: KLAUENINSEL_HOUSE_EMBLEMS[definition.slug],
        emblemScale: 0.86,
        crestFrame: 'gold',
        frameScale: 1,
        childIds: Object.freeze(base.persons.map(person => person.id)),
        targetFamilyId: `haus-${definition.originFamilySlug}`,
        notes: 'Die Namen der tatsächlich ausgewanderten Gründergeneration sind noch nicht belegt.'
      })
    }),
    extensions: Object.freeze({
      ...base.extensions,
      sourceRevision: 1,
      originFamilyId: `haus-${definition.originFamilySlug}`,
      registryManagedLineageFields: Object.freeze(['founderPartnershipId', 'houseId', 'originHouse'])
    })
  });
}

function createOriginFamily(definition) {
  const familyId = `haus-${definition.originFamilySlug}`;
  const base = createFounderPlaceholderHouseFamily({
    id: familyId,
    title: definition.originTitle,
    emblem: KLAUENINSEL_HOUSE_EMBLEMS[definition.slug],
    houseProfile: KLAUENINSEL_ORIGIN_HOUSE_PROFILES[definition.originSlug],
    description: `Alte vennyrianische Herkunftsakte aus ${definition.originTitle.split("O'")[1] || 'Vennyr'}. Nur belegte Auswanderer werden später mit der getrennten Cenyr-Akte ${definition.title} verbunden.`
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({ ...base.lineage, crestFrame: 'gold' }),
    extensions: Object.freeze({
      ...base.extensions,
      sourceRevision: 1,
      originLine: true,
      successorFamilyId: `haus-${definition.familySlug}`
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
  ...CADET_DEFINITIONS.map(createCadetFounderFamily),
  ...MIGRATION_DEFINITIONS.map(createMigrationCurrentFamily),
  HOUSE_BERYN_FAMILY,
  ...SIMPLE_DEFINITIONS.map(createSimpleFamily)
]);

export const KLAUENINSEL_ORIGIN_HOUSE_FAMILIES = Object.freeze(
  MIGRATION_DEFINITIONS.map(createOriginFamily)
);
