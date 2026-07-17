import { createWorldPersonId } from '../domain/family-schema.js';

function familyIdForHouse(houseId) {
  return String(houseId || '')
    .trim()
    .replace(/^house-/, 'haus-') || 'family-tree';
}

export function createFamilyPerson({
  id,
  name,
  sex = 'unknown',
  birth = '',
  death = '',
  status = '',
  portrait = '',
  houseId,
  familyRole = 'core',
  lineageRole = 'branch',
  title = '',
  worldPersonId = '',
  portraitPlaceholder = 'auto',
  tags = [],
  notes = '',
  extensions = {}
}) {
  return {
    id,
    worldPersonId: worldPersonId || createWorldPersonId(familyIdForHouse(houseId), id),
    name,
    title,
    sex,
    status: status || (death ? 'dead' : birth ? 'alive' : 'unknown'),
    birth,
    death,
    portrait,
    portraitPlaceholder,
    houseId,
    familyRole,
    lineageRole,
    tags: [...tags],
    notes,
    extensions: { ...extensions }
  };
}

export function createMarriage(id, firstId, secondId, options = {}) {
  return {
    id,
    participantIds: [firstId, secondId],
    type: options.type || 'marriage',
    status: options.status || 'active',
    start: options.start || '',
    end: options.end || '',
    certainty: options.certainty || 'confirmed',
    visibility: options.visibility || 'public',
    notes: options.notes || '',
    extensions: { ...(options.extensions || {}) }
  };
}

export function createParentages(childIds, parentIds, partnershipId, options = {}) {
  const type = options.type || 'biological';
  const legitimacy = options.legitimacy
    || (type === 'biological' ? 'legitimate' : 'unknown');
  return childIds.map(childId => ({
    id: `${options.idPrefix || 'parentage'}-${childId}`,
    childId,
    parentIds: [...parentIds],
    partnershipId: partnershipId || '',
    type,
    legitimacy,
    certainty: options.certainty || 'confirmed',
    visibility: options.visibility || 'public',
    notes: options.notes || '',
    extensions: { ...(options.extensions || {}) }
  }));
}

function createHouseBranch({
  id,
  name,
  parentPartnershipId,
  houseId,
  targetFamilyId,
  linkType,
  emblem = '',
  subtitle,
  founded = '',
  notes = '',
  // Ritterherrenhäuser als Zielhaus führen den silbernen Wappenrahmen.
  crestFrame = 'gold'
}) {
  return {
    id,
    name,
    subtitle,
    linkType,
    parentPartnershipId,
    houseId,
    emblem,
    emblemScale: 0.86,
    crestFrame,
    frameScale: 1,
    founded,
    targetFamilyId,
    notes,
    extensions: {}
  };
}

export function createMarriedAwayBranch(options) {
  return createHouseBranch({
    ...options,
    linkType: 'married-away',
    subtitle: options.subtitle || 'Wegverheiratete Linie'
  });
}

export function createCadetHouseBranch(options) {
  return createHouseBranch({
    ...options,
    linkType: 'cadet-house',
    subtitle: options.subtitle || 'Gegründetes Kadettenhaus'
  });
}

export function createExtinctBranch(options) {
  return createHouseBranch({
    targetFamilyId: '',
    ...options,
    name: options.name || 'Ausgestorben',
    linkType: 'line-extinct',
    subtitle: options.subtitle || 'Die Linie endet hier'
  });
}
