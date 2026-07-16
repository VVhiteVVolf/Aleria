import { DEFAULT_RELATIONSHIP_COLORS, FAMILY_ROLES } from '../config/family-colors.js';
import { DEFAULT_CREST_FRAME, isCrestFrameId } from '../config/chart-frames.js';

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
const HOUSE_LINK_TYPES = new Set(['cadet-house', 'married-away']);

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
      emblem: text(document.emblem)
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
      timeGap: normalizeTimeGap(source.lineage?.timeGap)
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

  family.cadetBranches.forEach(branch => {
    if (!partnershipIds.has(branch.parentPartnershipId)) {
      diagnostics.push(diagnostic('error', 'MISSING_CADET_PARENT_PARTNERSHIP', 'Das Kadettenhaus verweist auf ein unbekanntes Elternpaar.', {
        branchId: branch.id,
        partnershipId: branch.parentPartnershipId
      }));
    }
    if (branch.houseId && !houseIds.has(branch.houseId)) {
      diagnostics.push(diagnostic('warning', 'MISSING_CADET_HOUSE', 'Das Kadettenhaus verweist auf ein unbekanntes Haus.', {
        branchId: branch.id,
        houseId: branch.houseId
      }));
    }
    if (!branch.targetFamilyId) {
      diagnostics.push(diagnostic('error', 'MISSING_HOUSE_LINK_TARGET', 'Eine Hausverknüpfung benötigt eine Ziel-Familien-ID.', {
        branchId: branch.id
      }));
    }
  });

  const timeJumpChildIds = new Set();
  family.timeJumps.forEach(timeJump => {
    if (!partnershipIds.has(timeJump.parentPartnershipId)) {
      diagnostics.push(diagnostic('error', 'MISSING_TIME_JUMP_PARTNERSHIP', 'Der Zeitsprungknoten verweist auf ein unbekanntes Paar.', {
        timeJumpId: timeJump.id,
        partnershipId: timeJump.parentPartnershipId
      }));
    }
    timeJump.childIds.forEach(childId => {
      if (!personIds.has(childId)) {
        diagnostics.push(diagnostic('error', 'MISSING_TIME_JUMP_CHILD', 'Der Zeitsprungknoten verweist auf eine unbekannte Person.', {
          timeJumpId: timeJump.id,
          childId
        }));
      }
      if (partnershipById.get(timeJump.parentPartnershipId)?.participantIds.includes(childId)) {
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
