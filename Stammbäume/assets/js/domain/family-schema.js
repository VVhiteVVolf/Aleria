import { DEFAULT_RELATIONSHIP_COLORS, FAMILY_ROLES } from '../config/family-colors.js';
import { DEFAULT_CREST_FRAME, isCrestFrameId } from '../config/chart-frames.js';
import { DEFAULT_PERSON_LINEAGE_ROLE, isPersonLineageRole } from '../config/person-lineage.js';
import { normalizeHouseProfile } from './house-profile.js';
import {
  resolveAnchorGenerationDepth,
  resolveFamilyGenerationDepths
} from './family-generation-depth.js';

export const FAMILY_SCHEMA = 'aleria.family-tree';
export const FAMILY_SCHEMA_VERSION = 1;

const PERSON_STATUSES = new Set(['alive', 'dead', 'missing', 'unknown']);
const SEX_VALUES = new Set(['female', 'male', 'unknown']);
const PARTNERSHIP_TYPES = new Set(['marriage', 'engagement', 'union', 'affair', 'concubinage', 'political', 'forced']);
const PARTNERSHIP_STATUSES = new Set(['active', 'ended', 'divorced', 'widowed', 'secret']);
const PARENTAGE_TYPES = new Set(['biological', 'adoptive', 'foster', 'step', 'magical', 'claimed']);
const LEGITIMACY_VALUES = new Set(['legitimate', 'illegitimate', 'legitimized', 'disputed', 'unknown']);
const CERTAINTY_VALUES = new Set(['confirmed', 'probable', 'rumored', 'disputed', 'unknown']);
const VISIBILITY_VALUES = new Set(['public', 'restricted', 'secret']);
const PORTRAIT_PLACEHOLDERS = new Set(['auto', 'male', 'female', 'child', 'unknown']);
const HOUSE_LINK_TYPES = new Set([
  'cadet-house',
  'linked-line',
  'married-away',
  'ward-away',
  'line-extinct',
  'migration-offshoot'
]);
const PERSON_ANCHORED_HOUSE_LINK_TYPES = new Set([
  'ward-away',
  'migration-offshoot',
  'line-extinct'
]);

export class FamilyValidationError extends Error {
  constructor(diagnostics) {
    super('Der Familiendatensatz enthält ungültige Beziehungen.');
    this.name = 'FamilyValidationError';
    this.diagnostics = diagnostics;
  }
}

export function cloneValue(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function text(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueText(values) {
  return [...new Set(array(values).map(value => text(value)).filter(Boolean))];
}

function enumValue(value, allowed, fallback) {
  const normalized = text(value);
  return allowed.has(normalized) ? normalized : fallback;
}

function boundedNumber(value, fallback, minimum, maximum) {
  if (value === '' || value === null || value === undefined) return fallback;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.max(minimum, Math.min(maximum, numericValue));
}

export function createRecordId(prefix, existingIds = []) {
  const used = new Set(existingIds);
  const randomPart = globalThis.crypto?.randomUUID?.().slice(0, 8)
    || Math.random().toString(36).slice(2, 10);
  let candidate = `${prefix}-${randomPart}`;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${prefix}-${randomPart}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function identitySlug(value, fallback) {
  return text(value, fallback)
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback;
}

export function createWorldPersonId(familyId, personId) {
  return `person--${identitySlug(familyId, 'family-tree')}--${identitySlug(personId, 'person')}`;
}

function normalizePerson(person = {}, index = 0) {
  const id = text(person.id, `person-${index + 1}`);
  return {
    id,
    worldPersonId: text(person.worldPersonId),
    name: text(person.name, 'Unbenannte Person'),
    title: text(person.title),
    sex: enumValue(person.sex, SEX_VALUES, 'unknown'),
    status: enumValue(person.status, PERSON_STATUSES, 'unknown'),
    birth: text(String(person.birth ?? '')),
    death: text(String(person.death ?? '')),
    portrait: text(person.portrait),
    portraitPlaceholder: enumValue(person.portraitPlaceholder, PORTRAIT_PLACEHOLDERS, 'auto'),
    houseId: text(person.houseId),
    familyRole: Object.hasOwn(FAMILY_ROLES, person.familyRole) ? person.familyRole : 'core',
    lineageRole: isPersonLineageRole(person.lineageRole)
      ? person.lineageRole
      : DEFAULT_PERSON_LINEAGE_ROLE,
    tags: uniqueText(person.tags),
    notes: text(person.notes),
    extensions: person.extensions && typeof person.extensions === 'object' ? cloneValue(person.extensions) : {}
  };
}

function normalizePartnership(partnership = {}, index = 0) {
  return {
    id: text(partnership.id, `partnership-${index + 1}`),
    participantIds: uniqueText(partnership.participantIds),
    type: enumValue(partnership.type, PARTNERSHIP_TYPES, 'union'),
    status: enumValue(partnership.status, PARTNERSHIP_STATUSES, 'active'),
    start: text(String(partnership.start ?? '')),
    end: text(String(partnership.end ?? '')),
    certainty: enumValue(partnership.certainty, CERTAINTY_VALUES, 'confirmed'),
    visibility: enumValue(partnership.visibility, VISIBILITY_VALUES, 'public'),
    notes: text(partnership.notes),
    extensions: partnership.extensions && typeof partnership.extensions === 'object' ? cloneValue(partnership.extensions) : {}
  };
}

function normalizeParentage(parentage = {}, index = 0) {
  return {
    id: text(parentage.id, `parentage-${index + 1}`),
    childId: text(parentage.childId),
    parentIds: uniqueText(parentage.parentIds),
    partnershipId: text(parentage.partnershipId),
    type: enumValue(parentage.type, PARENTAGE_TYPES, 'biological'),
    legitimacy: enumValue(parentage.legitimacy, LEGITIMACY_VALUES, 'unknown'),
    certainty: enumValue(parentage.certainty, CERTAINTY_VALUES, 'confirmed'),
    visibility: enumValue(parentage.visibility, VISIBILITY_VALUES, 'public'),
    notes: text(parentage.notes),
    extensions: parentage.extensions && typeof parentage.extensions === 'object' ? cloneValue(parentage.extensions) : {}
  };
}

function normalizeHouse(house = {}, index = 0) {
  return {
    id: text(house.id, `house-${index + 1}`),
    name: text(house.name, 'Unbenanntes Haus'),
    motto: text(house.motto),
    emblem: text(house.emblem),
    status: text(house.status, 'active')
  };
}

function normalizeCadetBranch(branch = {}, index = 0) {
  return {
    id: text(branch.id, `cadet-branch-${index + 1}`),
    name: text(branch.name, 'Unbenanntes Kadettenhaus'),
    subtitle: text(branch.subtitle),
    linkType: enumValue(branch.linkType, HOUSE_LINK_TYPES, 'cadet-house'),
    parentPartnershipId: text(branch.parentPartnershipId),
    parentPersonId: text(branch.parentPersonId),
    houseId: text(branch.houseId),
    emblem: text(branch.emblem),
    emblemScale: boundedNumber(branch.emblemScale, 0.86, 0.5, 1.6),
    crestFrame: isCrestFrameId(branch.crestFrame) ? branch.crestFrame : DEFAULT_CREST_FRAME,
    frameScale: boundedNumber(branch.frameScale, 1, 0.6, 1.5),
    founded: text(String(branch.founded ?? '')),
    targetFamilyId: text(branch.targetFamilyId),
    notes: text(branch.notes),
    extensions: branch.extensions && typeof branch.extensions === 'object' ? cloneValue(branch.extensions) : {}
  };
}

function normalizeTimeJump(timeJump = {}, index = 0) {
  const fromYear = text(String(timeJump.fromYear ?? ''));
  const toYear = text(String(timeJump.toYear ?? ''));
  const calculatedYears = /^\d{1,4}$/.test(fromYear) && /^\d{1,4}$/.test(toYear)
    ? Math.max(0, Number(toYear) - Number(fromYear))
    : 0;
  return {
    id: text(timeJump.id, `time-jump-${index + 1}`),
    parentPartnershipId: text(timeJump.parentPartnershipId),
    sharedParentPartnershipIds: uniqueText(timeJump.sharedParentPartnershipIds),
    parentPersonId: text(timeJump.parentPersonId),
    childIds: uniqueText(timeJump.childIds),
    years: Number.isFinite(Number(timeJump.years))
      ? Math.max(0, Math.min(10000, Number(timeJump.years)))
      : calculatedYears,
    fromYear,
    toYear,
    label: text(timeJump.label, 'Die überlieferte Linie setzt später wieder ein'),
    notes: text(timeJump.notes),
    extensions: timeJump.extensions && typeof timeJump.extensions === 'object' ? cloneValue(timeJump.extensions) : {}
  };
}

function normalizeTimeGap(timeGap = {}) {
  const fromYear = text(String(timeGap.fromYear ?? ''));
  const toYear = text(String(timeGap.toYear ?? ''));
  const calculatedYears = /^\d{1,4}$/.test(fromYear) && /^\d{1,4}$/.test(toYear)
    ? Math.max(0, Number(toYear) - Number(fromYear))
    : 0;
  const configuredYears = Number(timeGap.years);
  return {
    enabled: timeGap.enabled === true,
    years: Number.isFinite(configuredYears)
      ? Math.max(0, Math.min(10000, configuredYears))
      : calculatedYears,
    fromYear,
    toYear,
    label: text(timeGap.label)
  };
}

function normalizeOriginHouse(originHouse = {}) {
  return {
    enabled: originHouse.enabled === true,
    id: text(originHouse.id, 'lineage-origin-house'),
    houseId: text(originHouse.houseId),
    name: text(originHouse.name, 'Ursprungshaus'),
    subtitle: text(originHouse.subtitle),
    emblem: text(originHouse.emblem),
    emblemScale: boundedNumber(originHouse.emblemScale, 0.86, 0.5, 1.6),
    crestFrame: isCrestFrameId(originHouse.crestFrame) ? originHouse.crestFrame : DEFAULT_CREST_FRAME,
    frameScale: boundedNumber(originHouse.frameScale, 1, 0.6, 1.5),
    childIds: uniqueText(originHouse.childIds),
    targetFamilyId: text(originHouse.targetFamilyId),
    notes: text(originHouse.notes)
  };
}

export function normalizeFamily(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const document = source.document && typeof source.document === 'object' ? source.document : {};
  const view = source.view && typeof source.view === 'object' ? source.view : {};
  const familyId = text(document.id, 'family-tree');
  const persons = array(source.persons).map(normalizePerson).map(person => ({
    ...person,
    worldPersonId: person.worldPersonId || createWorldPersonId(familyId, person.id)
  }));
  return {
    schema: FAMILY_SCHEMA,
    schemaVersion: FAMILY_SCHEMA_VERSION,
    document: {
      id: familyId,
      title: text(document.title, 'Unbenannte Familie'),
      motto: text(document.motto),
      description: text(document.description),
      emblem: text(document.emblem),
      houseProfile: normalizeHouseProfile(document.houseProfile)
    },
    persons,
    partnerships: array(source.partnerships).map(normalizePartnership),
    parentages: array(source.parentages).map(normalizeParentage),
    houses: array(source.houses).map(normalizeHouse),
    cadetBranches: array(source.cadetBranches).map(normalizeCadetBranch),
    timeJumps: array(source.timeJumps).map(normalizeTimeJump),
    lineage: {
      founderPartnershipId: text(source.lineage?.founderPartnershipId),
      houseId: text(source.lineage?.houseId),
      crestSubtitle: text(source.lineage?.crestSubtitle),
      crestEmblemScale: boundedNumber(source.lineage?.crestEmblemScale, 0.86, 0.5, 1.6),
      crestFrame: isCrestFrameId(source.lineage?.crestFrame)
        ? source.lineage.crestFrame
        : DEFAULT_CREST_FRAME,
      crestFrameScale: boundedNumber(source.lineage?.crestFrameScale, 1, 0.6, 1.5),
      timeGap: normalizeTimeGap(source.lineage?.timeGap),
      originHouse: normalizeOriginHouse(source.lineage?.originHouse)
    },
    presentation: {
      relationshipColors: Object.fromEntries(
        Object.entries(DEFAULT_RELATIONSHIP_COLORS).map(([key, fallback]) => {
          const configured = text(source.presentation?.relationshipColors?.[key]);
          return [key, /^#[0-9a-f]{6}$/i.test(configured) ? configured : fallback];
        })
      )
    },
    view: {
      focusPersonId: text(view.focusPersonId),
      orientation: view.orientation === 'horizontal' ? 'horizontal' : 'vertical',
      ancestorDepth: Number.isInteger(view.ancestorDepth) ? Math.max(0, view.ancestorDepth) : 5,
      descendantDepth: Number.isInteger(view.descendantDepth) ? Math.max(0, view.descendantDepth) : 5,
      limitGenerations: view.limitGenerations === true,
      showSiblings: view.showSiblings !== false
    },
    extensions: source.extensions && typeof source.extensions === 'object' ? cloneValue(source.extensions) : {}
  };
}

function diagnostic(severity, code, message, details = {}) {
  return Object.freeze({ severity, code, message, details: Object.freeze({ ...details }) });
}

function findDuplicateIds(records, recordType, diagnostics) {
  const seen = new Set();
  records.forEach(record => {
    if (!record.id) {
      diagnostics.push(diagnostic('error', 'MISSING_ID', `${recordType} ohne ID.`, { recordType }));
      return;
    }
    if (seen.has(record.id)) {
      diagnostics.push(diagnostic('error', 'DUPLICATE_ID', `Doppelte ID „${record.id}“.`, { recordType, id: record.id }));
    }
    seen.add(record.id);
  });
}

function detectAncestryCycles(family, diagnostics) {
  const childrenByParent = new Map();
  family.parentages.forEach(parentage => {
    parentage.parentIds.forEach(parentId => {
      if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
      childrenByParent.get(parentId).push(parentage.childId);
    });
  });

  const visiting = new Set();
  const visited = new Set();
  function walk(personId, path) {
    if (visiting.has(personId)) {
      diagnostics.push(diagnostic('error', 'ANCESTRY_CYCLE', 'Die Abstammung enthält einen Zyklus.', {
        personId,
        path: [...path, personId]
      }));
      return;
    }
    if (visited.has(personId)) return;
    visiting.add(personId);
    (childrenByParent.get(personId) || []).forEach(childId => walk(childId, [...path, personId]));
    visiting.delete(personId);
    visited.add(personId);
  }

  family.persons.forEach(person => walk(person.id, []));
}

export function validateFamily(input) {
  const family = normalizeFamily(input);
  const diagnostics = [];
  findDuplicateIds(family.persons, 'Person', diagnostics);
  findDuplicateIds(family.partnerships, 'Partnerschaft', diagnostics);
  findDuplicateIds(family.parentages, 'Abstammung', diagnostics);
  findDuplicateIds(family.houses, 'Haus', diagnostics);
  findDuplicateIds(family.cadetBranches, 'Kadettenhaus', diagnostics);
  findDuplicateIds(family.timeJumps, 'Zeitsprungknoten', diagnostics);

  const personByWorldId = new Map();
  family.persons.forEach(person => {
    const existingPersonId = personByWorldId.get(person.worldPersonId);
    if (existingPersonId) {
      diagnostics.push(diagnostic('error', 'DUPLICATE_WORLD_PERSON_ID', 'Eine feste Personen-ID darf im Stammbaum nur einmal vorkommen.', {
        worldPersonId: person.worldPersonId,
        personIds: [existingPersonId, person.id]
      }));
      return;
    }
    personByWorldId.set(person.worldPersonId, person.id);
  });

  const personIds = new Set(family.persons.map(person => person.id));
  const partnershipIds = new Set(family.partnerships.map(partnership => partnership.id));
  const partnershipById = new Map(family.partnerships.map(partnership => [partnership.id, partnership]));
  const houseIds = new Set(family.houses.map(house => house.id));

  family.persons.forEach(person => {
    if (person.houseId && !houseIds.has(person.houseId)) {
      diagnostics.push(diagnostic('warning', 'MISSING_HOUSE', `Das Haus von „${person.name}“ existiert nicht.`, {
        personId: person.id,
        houseId: person.houseId
      }));
    }
  });

  family.partnerships.forEach(partnership => {
    if (partnership.participantIds.length < 2) {
      diagnostics.push(diagnostic('error', 'INCOMPLETE_PARTNERSHIP', 'Eine Partnerschaft benötigt mindestens zwei Beteiligte.', {
        partnershipId: partnership.id
      }));
    }
    partnership.participantIds.forEach(personId => {
      if (!personIds.has(personId)) {
        diagnostics.push(diagnostic('error', 'MISSING_PARTNERSHIP_PERSON', 'Eine Partnerschaft verweist auf eine unbekannte Person.', {
          partnershipId: partnership.id,
          personId
        }));
      }
    });
  });

  family.parentages.forEach(parentage => {
    if (!personIds.has(parentage.childId)) {
      diagnostics.push(diagnostic('error', 'MISSING_CHILD', 'Eine Abstammung verweist auf ein unbekanntes Kind.', {
        parentageId: parentage.id,
        childId: parentage.childId
      }));
    }
    if (!parentage.parentIds.length) {
      diagnostics.push(diagnostic('error', 'MISSING_PARENTS', 'Eine Abstammung benötigt mindestens ein Elternteil.', {
        parentageId: parentage.id
      }));
    }
    parentage.parentIds.forEach(parentId => {
      if (!personIds.has(parentId)) {
        diagnostics.push(diagnostic('error', 'MISSING_PARENT', 'Eine Abstammung verweist auf ein unbekanntes Elternteil.', {
          parentageId: parentage.id,
          parentId
        }));
      }
      if (parentId === parentage.childId) {
        diagnostics.push(diagnostic('error', 'SELF_PARENTAGE', 'Eine Person kann nicht ihr eigenes Elternteil sein.', {
          parentageId: parentage.id,
          personId: parentId
        }));
      }
    });
    if (parentage.partnershipId && !partnershipIds.has(parentage.partnershipId)) {
      diagnostics.push(diagnostic('warning', 'MISSING_PARENTAGE_PARTNERSHIP', 'Die Herkunftspartnerschaft existiert nicht.', {
        parentageId: parentage.id,
        partnershipId: parentage.partnershipId
      }));
    }
  });

  if (family.lineage.founderPartnershipId && !partnershipIds.has(family.lineage.founderPartnershipId)) {
    diagnostics.push(diagnostic('error', 'MISSING_FOUNDER_PARTNERSHIP', 'Das gewählte Gründerpaar existiert nicht.', {
      partnershipId: family.lineage.founderPartnershipId
    }));
  }
  if (family.lineage.houseId && !houseIds.has(family.lineage.houseId)) {
    diagnostics.push(diagnostic('warning', 'MISSING_LINEAGE_HOUSE', 'Das Gründerwappen verweist auf ein unbekanntes Haus.', {
      houseId: family.lineage.houseId
    }));
  }

  const originHouse = family.lineage.originHouse;
  if (originHouse.enabled) {
    if (originHouse.houseId && !houseIds.has(originHouse.houseId)) {
      diagnostics.push(diagnostic('warning', 'MISSING_ORIGIN_HOUSE', 'Das vorgelagerte Wappen verweist auf ein unbekanntes Haus.', {
        houseId: originHouse.houseId
      }));
    }
    if (!originHouse.childIds.length) {
      diagnostics.push(diagnostic('error', 'MISSING_ORIGIN_HOUSE_CHILD', 'Ein vorgelagertes Hauswappen benötigt mindestens eine nachfolgende Person.', {
        originHouseId: originHouse.id
      }));
    }
    originHouse.childIds.forEach(childId => {
      if (!personIds.has(childId)) {
        diagnostics.push(diagnostic('error', 'UNKNOWN_ORIGIN_HOUSE_CHILD', 'Das vorgelagerte Hauswappen verweist auf eine unbekannte Person.', {
          originHouseId: originHouse.id,
          childId
        }));
      }
      if (family.parentages.some(parentage => parentage.childId === childId)) {
        diagnostics.push(diagnostic('error', 'ORIGIN_HOUSE_CHILD_HAS_PARENTS', 'Eine Person direkt unter dem Ursprungshaus darf keine weitere Abstammung besitzen.', {
          originHouseId: originHouse.id,
          childId
        }));
      }
    });
  }

  family.cadetBranches.forEach(branch => {
    const hasPartnershipAnchor = partnershipIds.has(branch.parentPartnershipId);
    const hasPersonAnchor = personIds.has(branch.parentPersonId);
    if (branch.parentPartnershipId && !hasPartnershipAnchor) {
      diagnostics.push(diagnostic('error', 'MISSING_CADET_PARENT_PARTNERSHIP', 'Das Kadettenhaus verweist auf ein unbekanntes Elternpaar.', {
        branchId: branch.id,
        partnershipId: branch.parentPartnershipId
      }));
    }
    if (branch.parentPersonId && !hasPersonAnchor) {
      diagnostics.push(diagnostic('error', 'MISSING_HOUSE_LINK_PERSON', 'Die Hausverknüpfung verweist auf eine unbekannte Person.', {
        branchId: branch.id,
        personId: branch.parentPersonId
      }));
    }
    if (!hasPartnershipAnchor && !hasPersonAnchor) {
      diagnostics.push(diagnostic('error', 'MISSING_HOUSE_LINK_ANCHOR', 'Eine Hausverknüpfung benötigt ein Paar oder eine Einzelperson als Ausgangspunkt.', {
        branchId: branch.id
      }));
    }
    if (hasPartnershipAnchor && hasPersonAnchor) {
      diagnostics.push(diagnostic('error', 'AMBIGUOUS_HOUSE_LINK_ANCHOR', 'Eine Hausverknüpfung darf nicht zugleich an einem Paar und einer Einzelperson hängen.', {
        branchId: branch.id
      }));
    }
    if (branch.linkType === 'ward-away' && !hasPersonAnchor) {
      diagnostics.push(diagnostic('error', 'WARD_LINK_REQUIRES_PERSON', 'Die Vermittlung eines Mündels muss direkt an der fortgegebenen Person hängen.', {
        branchId: branch.id
      }));
    }
    if (branch.linkType === 'ward-away' && hasPersonAnchor) {
      const ward = family.persons.find(person => person.id === branch.parentPersonId);
      if (ward?.familyRole !== 'ward-away') {
        diagnostics.push(diagnostic('error', 'WARD_LINK_REQUIRES_WARD_ROLE', 'Eine Mündelvermittlung darf nur an einer als fortgegebenes Mündel markierten Person hängen.', {
          branchId: branch.id,
          personId: branch.parentPersonId
        }));
      }
    }
    if (branch.linkType === 'migration-offshoot' && !hasPersonAnchor) {
      diagnostics.push(diagnostic('error', 'MIGRATION_LINK_REQUIRES_PERSON', 'Ein Auswanderungszweig muss direkt an seiner auswandernden Gründerperson hängen.', {
        branchId: branch.id
      }));
    }
    if (!PERSON_ANCHORED_HOUSE_LINK_TYPES.has(branch.linkType) && hasPersonAnchor) {
      diagnostics.push(diagnostic('error', 'HOUSE_LINK_REQUIRES_PARTNERSHIP', 'Kadetten- und Wegverheiratet-Knoten müssen an ihrem maßgeblichen Paar hängen.', {
        branchId: branch.id
      }));
    }
    if (branch.houseId && !houseIds.has(branch.houseId)) {
      diagnostics.push(diagnostic('warning', 'MISSING_CADET_HOUSE', 'Das Kadettenhaus verweist auf ein unbekanntes Haus.', {
        branchId: branch.id,
        houseId: branch.houseId
      }));
    }
    if (!branch.targetFamilyId && branch.linkType !== 'line-extinct') {
      diagnostics.push(diagnostic('error', 'MISSING_HOUSE_LINK_TARGET', 'Eine Hausverknüpfung benötigt eine Ziel-Familien-ID.', {
        branchId: branch.id
      }));
    }
  });

  family.persons.filter(person => person.familyRole === 'ward-away').forEach(person => {
    const targetBranches = family.cadetBranches.filter(branch => (
      branch.linkType === 'ward-away' && branch.parentPersonId === person.id
    ));
    if (!targetBranches.length) {
      diagnostics.push(diagnostic('error', 'MISSING_WARD_TARGET_HOUSE', 'Ein fortgegebenes Mündel benötigt direkt unter seiner Person eine Verknüpfung zum Zielhaus.', {
        personId: person.id
      }));
    }
    if (targetBranches.length > 1) {
      diagnostics.push(diagnostic('error', 'MULTIPLE_WARD_TARGET_HOUSES', 'Ein fortgegebenes Mündel darf nicht gleichzeitig an mehrere Zielhäuser vermittelt sein.', {
        personId: person.id,
        branchIds: targetBranches.map(branch => branch.id)
      }));
    }
  });

  const timeJumpChildIds = new Set();
  const timeJumpAnchors = [];
  const founderPartnership = partnershipById.get(family.lineage.founderPartnershipId);
  const founderPersonIds = new Set(founderPartnership?.participantIds || []);
  const generationDepths = resolveFamilyGenerationDepths(family);
  const occupiedTimeBarrierDepths = new Map();
  const founderGenerationDepth = resolveAnchorGenerationDepth(
    founderPartnership?.participantIds || [],
    generationDepths
  );
  if (family.lineage.timeGap.enabled && founderGenerationDepth !== null) {
    occupiedTimeBarrierDepths.set(founderGenerationDepth, 'lineage-time-gap');
  }
  family.timeJumps.forEach(timeJump => {
    const partnership = partnershipById.get(timeJump.parentPartnershipId);
    const hasPersonAnchor = personIds.has(timeJump.parentPersonId);
    if (timeJump.parentPartnershipId && !partnership) {
      diagnostics.push(diagnostic('error', 'MISSING_TIME_JUMP_PARTNERSHIP', 'Der Zeitsprungknoten verweist auf ein unbekanntes Paar.', {
        timeJumpId: timeJump.id,
        partnershipId: timeJump.parentPartnershipId
      }));
    }
    if (timeJump.parentPersonId && !hasPersonAnchor) {
      diagnostics.push(diagnostic('error', 'MISSING_TIME_JUMP_PERSON', 'Der Zeitsprungknoten verweist auf eine unbekannte Person.', {
        timeJumpId: timeJump.id,
        personId: timeJump.parentPersonId
      }));
    }
    if (!partnership && !hasPersonAnchor) {
      diagnostics.push(diagnostic('error', 'MISSING_TIME_JUMP_ANCHOR', 'Ein Zeitsprungknoten benötigt eine Person oder ein Paar als Ausgangspunkt.', {
        timeJumpId: timeJump.id
      }));
    }
    if (partnership && hasPersonAnchor) {
      diagnostics.push(diagnostic('error', 'AMBIGUOUS_TIME_JUMP_ANCHOR', 'Ein Zeitsprungknoten darf nicht zugleich an einer Person und einem Paar hängen.', {
        timeJumpId: timeJump.id
      }));
    }
    const anchorPersonIds = partnership?.participantIds || (hasPersonAnchor ? [timeJump.parentPersonId] : []);
    const overlappingAnchor = timeJumpAnchors.find(anchor => (
      anchor.personIds.some(personId => anchorPersonIds.includes(personId))
    ));
    if (anchorPersonIds.length && overlappingAnchor) {
      diagnostics.push(diagnostic('error', 'PARALLEL_TIME_JUMP_ANCHOR', 'Überlappende Personen oder Verbindungen dürfen nicht mehrere Zeitsprünge tragen. Zeitsprünge sind serielle Generationstrenner und niemals parallele Zweige.', {
        timeJumpId: timeJump.id,
        existingTimeJumpId: overlappingAnchor.timeJumpId,
        overlappingPersonIds: anchorPersonIds.filter(personId => overlappingAnchor.personIds.includes(personId))
      }));
    }
    if (anchorPersonIds.length) timeJumpAnchors.push({ timeJumpId: timeJump.id, personIds: anchorPersonIds });
    const hasExactlyOneAnchorField = Boolean(timeJump.parentPartnershipId) !== Boolean(timeJump.parentPersonId);
    const hasValidAnchor = hasExactlyOneAnchorField && (Boolean(partnership) !== hasPersonAnchor);
    const anchorGenerationDepth = hasValidAnchor
      ? resolveAnchorGenerationDepth(anchorPersonIds, generationDepths)
      : null;
    timeJump.sharedParentPartnershipIds.forEach(sharedPartnershipId => {
      const sharedPartnership = partnershipById.get(sharedPartnershipId);
      if (!sharedPartnership) {
        diagnostics.push(diagnostic('error', 'MISSING_SHARED_TIME_JUMP_PARTNERSHIP', 'Eine weitere Zuführung zum gemeinsamen Zeitsprung verweist auf ein unbekanntes Paar.', {
          timeJumpId: timeJump.id,
          partnershipId: sharedPartnershipId
        }));
        return;
      }
      if (sharedPartnershipId === timeJump.parentPartnershipId) {
        diagnostics.push(diagnostic('error', 'DUPLICATE_SHARED_TIME_JUMP_PARTNERSHIP', 'Das strukturelle Ankerpaar darf nicht zusätzlich als weitere Zuführung desselben Zeitsprungs eingetragen sein.', {
          timeJumpId: timeJump.id,
          partnershipId: sharedPartnershipId
        }));
        return;
      }
      const overlappingPersonIds = sharedPartnership.participantIds.filter(personId => anchorPersonIds.includes(personId));
      if (overlappingPersonIds.length) {
        diagnostics.push(diagnostic('error', 'OVERLAPPING_SHARED_TIME_JUMP_PARTNERSHIP', 'Geteilte Zeitsprung-Zuführungen müssen aus eigenständigen Paaren derselben Generation bestehen.', {
          timeJumpId: timeJump.id,
          partnershipId: sharedPartnershipId,
          overlappingPersonIds
        }));
      }
      const sharedGenerationDepth = resolveAnchorGenerationDepth(
        sharedPartnership.participantIds,
        generationDepths
      );
      if (
        anchorGenerationDepth !== null
        && sharedGenerationDepth !== null
        && sharedGenerationDepth !== anchorGenerationDepth
      ) {
        diagnostics.push(diagnostic('error', 'SHARED_TIME_JUMP_GENERATION_MISMATCH', 'Alle Zuführungen eines gemeinsamen Zeitsprungs müssen aus derselben Generation stammen.', {
          timeJumpId: timeJump.id,
          partnershipId: sharedPartnershipId,
          anchorGenerationDepth,
          sharedGenerationDepth
        }));
      }
    });
    const existingBarrierId = anchorGenerationDepth === null
      ? ''
      : occupiedTimeBarrierDepths.get(anchorGenerationDepth);
    if (existingBarrierId) {
      diagnostics.push(diagnostic('error', 'PARALLEL_TIME_JUMP_GENERATION', 'In derselben Generation darf nur ein Zeitsprung existieren. Der Trenner gilt immer für die vollständige Ebene und darf nicht parallel zu einem anderen Knoten stehen.', {
        timeJumpId: timeJump.id,
        existingBarrierId,
        generationDepth: anchorGenerationDepth
      }));
    } else if (anchorGenerationDepth !== null) {
      occupiedTimeBarrierDepths.set(anchorGenerationDepth, timeJump.id);
    }
    if (
      family.lineage.timeGap.enabled
      && anchorPersonIds.some(personId => founderPersonIds.has(personId))
    ) {
      diagnostics.push(diagnostic('error', 'DUPLICATE_LINEAGE_TIME_BARRIER', 'Unter dem Stammwappen existiert bereits ein Zeitsprung. Auch ein Einzelanker an einem Mitglied des Gründerpaares würde dieselbe Generation doppelt belegen.', {
        timeJumpId: timeJump.id,
        partnershipId: family.lineage.founderPartnershipId
      }));
    }
    timeJump.childIds.forEach(childId => {
      if (!personIds.has(childId)) {
        diagnostics.push(diagnostic('error', 'MISSING_TIME_JUMP_CHILD', 'Der Zeitsprungknoten verweist auf eine unbekannte Person.', {
          timeJumpId: timeJump.id,
          childId
        }));
      }
      if (anchorPersonIds.includes(childId)) {
        diagnostics.push(diagnostic('error', 'TIME_JUMP_SELF_DESCENDANT', 'Eine Person vor dem Zeitsprung kann nicht zugleich dessen Nachkomme sein.', {
          timeJumpId: timeJump.id,
          childId
        }));
      }
      if (timeJumpChildIds.has(childId)) {
        diagnostics.push(diagnostic('error', 'DUPLICATE_TIME_JUMP_CHILD', 'Eine Person kann nur hinter einem Zeitsprungknoten eingeordnet werden.', {
          timeJumpId: timeJump.id,
          childId
        }));
      }
      timeJumpChildIds.add(childId);
    });
  });

  detectAncestryCycles(family, diagnostics);
  return Object.freeze({ family, diagnostics: Object.freeze(diagnostics) });
}

export function assertValidFamily(input) {
  const result = validateFamily(input);
  const errors = result.diagnostics.filter(item => item.severity === 'error');
  if (errors.length) throw new FamilyValidationError(result.diagnostics);
  return result;
}
