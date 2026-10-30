import { createFounderTimeJumpPlaceholderHouseFamily } from '../blank-house-family-factory.js';
import { createParentages } from '../family-record-builders.js';

// The court families share only the requested founder/crest/time-jump structure.
// Their people, marriages, geography and history remain owned by their records.
export function createCourtFamily({ id, title, emblem = '', houseProfile, description,
  firstYear, roots, people, partnerships = [], parentages = [], houses = [], cadetBranches = [],
  additionalPlacements = [], sourceRevision = 1, biography, sourceNote }) {
  const base = createFounderTimeJumpPlaceholderHouseFamily({
    id, title, emblem, houseProfile, description, toYear: firstYear,
    timeJumpLabel: `Nicht einzeln überlieferte Generationen bis ${firstYear}`
  });
  const gap = base.timeJumps[0];
  return Object.freeze({
    ...base,
    houses: [...base.houses, ...houses],
    persons: [...base.persons, ...people],
    partnerships: [...base.partnerships, ...partnerships],
    parentages: [
      ...createParentages(roots, base.partnerships[0].participantIds, base.lineage.founderPartnershipId,
        { type: 'claimed', certainty: 'probable', notes: 'Nicht einzeln überlieferte Generationen; keine direkte biologische Elternschaft des Gründerpaares behauptet.', extensions: { timeJumpId: gap.id } }),
      ...parentages
    ],
    timeJumps: [{ ...gap, childIds: [...roots] }],
    cadetBranches: [...cadetBranches],
    view: { ...base.view, ancestorDepth: 24, descendantDepth: 24, limitGenerations: false },
    extensions: { ...base.extensions, blankFamily: false, pendingDescendantReview: false,
      sourceRevision, sourceNote, courtDecisionPending: true,
      ...(biography ? { houseBiographyModule: biography } : {}),
      registryAdditionalPlacements: additionalPlacements }
  });
}
