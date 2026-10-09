import { createFamilyChartPersonAppearancePlan } from './family-chart-person-appearance-router.js';

/** Geometry uses concrete cards; the family record continues to use people. */
export function createFamilyChartAppearanceLayout(family, appearancePlan = createFamilyChartPersonAppearancePlan({
  partnerships: family?.partnerships || [],
  personById: new Map((family?.persons || []).map(person => [person.id, person])),
  parentages: family?.parentages || []
})) {
  if (!appearancePlan.appearances.length) return family;
  const personById = new Map(family.persons.map(person => [person.id, person]));
  const resolve = (id, partnershipId) => appearancePlan.resolveParticipantId(id, partnershipId);
  return {
    ...family,
    persons: [...family.persons, ...appearancePlan.appearances.map(appearance => ({
      ...personById.get(appearance.personId),
      id: appearance.id,
      extensions: {}
    }))],
    partnerships: [...family.partnerships.map(partnership => ({
      ...partnership,
      participantIds: partnership.participantIds.map(id => resolve(id, partnership.id)),
      extensions: {
        ...partnership.extensions,
        ...(partnership.extensions?.chartAlignPartnerOverChildrenPersonId ? {
          chartAlignPartnerOverChildrenPersonId: resolve(partnership.extensions.chartAlignPartnerOverChildrenPersonId, partnership.id)
        } : {})
      }
    })), ...appearancePlan.partnerMirrors.map(mirror => ({
      ...family.partnerships.find(partnership => partnership.id === mirror.partnershipId),
      id: `${mirror.partnershipId}--mirror-${mirror.personId}`,
      participantIds: [mirror.id, ...mirror.partnerIds],
      extensions: {}
    }))],
    parentages: family.parentages.map(parentage => ({
      ...parentage,
      parentIds: parentage.parentIds.map(id => resolve(id, parentage.partnershipId))
    }))
  };
}
