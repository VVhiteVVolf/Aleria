import {
  createFamilyChartDescendantAlignmentPlan
} from './family-chart-descendant-alignment.js';
import {
  createFamilyChartHouseLinkAlignmentPlan
} from './family-chart-house-link-alignment.js';
import {
  createFamilyChartPartnerAlignmentPlan
} from './family-chart-partner-alignment.js';
import {
  createFamilyChartPairPlacementPlan
} from './family-chart-pair-placement.js';

export const STRICT_FAMILY_CHART_LAYOUT_POLICY = 'strict-v1';

function directChildIds(family, partnershipId) {
  return [...new Set((family?.parentages || [])
    .filter(parentage => (
      parentage.partnershipId === partnershipId
      && !parentage.extensions?.timeJumpId
    ))
    .map(parentage => parentage.childId))];
}

function isContinuingPerson(family, personId) {
  return (family?.parentages || []).some(parentage => parentage.parentIds?.includes(personId));
}

function directOriginSignatures(family, personId) {
  return new Set((family?.parentages || [])
    .filter(parentage => (
      parentage.childId === personId
      && !parentage.extensions?.timeJumpId
    ))
    .map(parentage => {
      const partnershipId = String(parentage.partnershipId || '').trim();
      if (partnershipId) return `partnership:${partnershipId}`;

      const parentIds = [...new Set(parentage.parentIds || [])]
        .filter(Boolean)
        .sort();
      return parentIds.length ? `parents:${parentIds.join('|')}` : '';
    })
    .filter(Boolean));
}

function shareDirectOrigin(family, firstPersonId, secondPersonId) {
  const firstOrigins = directOriginSignatures(family, firstPersonId);
  const secondOrigins = directOriginSignatures(family, secondPersonId);
  return [...firstOrigins].some(signature => secondOrigins.has(signature));
}

function partnershipAppearanceIds(person, extensionName) {
  const values = person?.extensions?.[extensionName];
  return new Set(Array.isArray(values) ? values.filter(Boolean) : []);
}

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

/**
 * Preventive authoring guard for source-managed trees.
 *
 * Family Chart may legally choose a compact route that is visually poor for a
 * heraldic genealogy (single children on a dog-leg, detached house links or a
 * partner card over an unrelated branch). Strict source families therefore
 * declare their local layout anchors in data. This audit turns missing or
 * contradictory anchors into deterministic test failures instead of relying
 * on a later screenshot review.
 */
export function auditFamilyChartLayoutPolicy(family) {
  if (family?.extensions?.chartLayoutPolicy !== STRICT_FAMILY_CHART_LAYOUT_POLICY) {
    return Object.freeze({ strict: false, issues: Object.freeze([]) });
  }

  const issues = [];
  const partnerPlan = createFamilyChartPartnerAlignmentPlan(family);
  const pairPlacementPlan = createFamilyChartPairPlacementPlan(family);
  const descendantPlan = createFamilyChartDescendantAlignmentPlan(family);
  const houseLinkPlan = createFamilyChartHouseLinkAlignmentPlan(family);

  partnerPlan.invalidRequests.forEach(request => {
    issues.push(issue('INVALID_PARTNER_LAYOUT_REQUEST', { request }));
  });
  pairPlacementPlan.invalidRequests.forEach(request => {
    issues.push(issue('INVALID_PAIR_PLACEMENT_REQUEST', { request }));
  });
  descendantPlan.invalidRequests.forEach(request => {
    issues.push(issue('INVALID_DESCENDANT_LAYOUT_REQUEST', { request }));
  });
  houseLinkPlan.invalidRequests.forEach(request => {
    issues.push(issue('INVALID_HOUSE_LINK_LAYOUT_REQUEST', { request }));
  });

  (family?.partnerships || []).forEach(partnership => {
    const childIds = directChildIds(family, partnership.id);
    if (childIds.length === 1) {
      const configuredChildId = String(
        partnership.extensions?.chartAlignParentPairOverChildPersonId || ''
      ).trim();
      if (configuredChildId !== childIds[0]) {
        issues.push(issue('SINGLE_CHILD_WITHOUT_DIRECT_ANCHOR', {
          partnershipId: partnership.id,
          childPersonId: childIds[0],
          configuredChildId
        }));
      }
    }

    if (
      childIds.length > 1
      && childIds.every(childId => !isContinuingPerson(family, childId))
      && partnership.extensions?.chartAlignChildGroupBelowParentPair !== true
    ) {
      issues.push(issue('LEAF_CHILD_GROUP_WITHOUT_PARENT_PAIR_ANCHOR', {
        partnershipId: partnership.id,
        childPersonIds: Object.freeze([...childIds])
      }));
    }

    const participantIds = [...new Set(partnership.participantIds || [])].filter(Boolean);
    if (
      participantIds.length === 2
      && shareDirectOrigin(family, participantIds[0], participantIds[1])
      && partnership.extensions?.chartAllowAdjacentInternalPartnership !== true
    ) {
      const participants = participantIds.map(personId => (
        (family?.persons || []).find(person => person.id === personId)
      ));
      const repeatedPersonIds = participants
        .filter(person => partnershipAppearanceIds(
          person,
          'chartRepeatForPartnershipIds'
        ).has(partnership.id))
        .map(person => person.id);
      const mirroredPersonIds = participants
        .filter(person => partnershipAppearanceIds(
          person,
          'chartPartnerMirrorForPartnershipIds'
        ).has(partnership.id))
        .map(person => person.id);
      // Eine interne Ehe braucht genau eine wiederholte Partnerkarte: Die
      // Herkunftskarte bleibt bei den Eltern, die Wiederholung trägt Ehe und
      // Kinder. Ein optionaler Partner-Spiegel bleibt für ausdrücklich
      // paargebundene Endknoten erlaubt, ist für diese Trennung aber keine
      // Voraussetzung.
      const appearanceSplitIsComplete = repeatedPersonIds.length === 1;

      if (!appearanceSplitIsComplete) {
        issues.push(issue('INTERNAL_PARTNERSHIP_WITHOUT_SPLIT_APPEARANCES', {
          partnershipId: partnership.id,
          participantIds: Object.freeze(participantIds),
          repeatedPersonIds: Object.freeze(repeatedPersonIds),
          mirroredPersonIds: Object.freeze(mirroredPersonIds)
        }));
      }
    }
  });

  (family?.cadetBranches || []).forEach(branch => {
    if (
      branch.parentPartnershipId
      && branch.linkType !== 'line-extinct'
      && branch.extensions?.chartAlignBelowPartnership !== true
    ) {
      issues.push(issue('PARTNERSHIP_HOUSE_LINK_WITHOUT_DIRECT_ANCHOR', {
        branchId: branch.id,
        partnershipId: branch.parentPartnershipId
      }));
    }
  });

  const childbearingPartnershipsByPersonId = new Map();
  (family?.partnerships || []).forEach(partnership => {
    if (!directChildIds(family, partnership.id).length) return;
    (partnership.participantIds || []).forEach(personId => {
      const partnerships = childbearingPartnershipsByPersonId.get(personId) || [];
      partnerships.push(partnership);
      childbearingPartnershipsByPersonId.set(personId, partnerships);
    });
  });

  childbearingPartnershipsByPersonId.forEach((partnerships, personId) => {
    if (partnerships.length < 2) return;
    const person = (family?.persons || []).find(candidate => candidate.id === personId);
    if (person?.extensions?.chartMultiPartnerLayoutReviewed === true) return;
    const partnerPersonIds = partnerships.map(partnership => (
      partnership.participantIds.find(participantId => participantId !== personId) || ''
    ));
    const centeredRoute = [
      ...partnerPlan.centerBetweenSpousesRoutes.map(route => ({
        centeredPersonId: route.centeredPersonId,
        partnerPersonIds: route.spousePersonIds
      })),
      ...partnerPlan.centerBetweenPartnersRoutes
    ].find(route => route.centeredPersonId === personId);
    const hasCenteredCore = Boolean(centeredRoute)
      && partnerPersonIds.every(partnerId => centeredRoute.partnerPersonIds.includes(partnerId));
    const partnersOwnChildLanes = partnerships.every(partnership => {
      const partnerId = partnership.participantIds.find(participantId => participantId !== personId);
      return partnerPlan.partnerOverChildrenRoutes.some(route => (
        route.partnershipId === partnership.id
        && route.partnerPersonId === partnerId
      ));
    });

    if (!hasCenteredCore || !partnersOwnChildLanes) {
      issues.push(issue('MULTI_PARTNER_BRANCH_WITHOUT_EXPLICIT_LANES', {
        personId,
        partnershipIds: Object.freeze(partnerships.map(partnership => partnership.id)),
        partnerPersonIds: Object.freeze(partnerPersonIds),
        hasCenteredCore,
        partnersOwnChildLanes
      }));
    }
  });

  return Object.freeze({
    strict: true,
    issues: Object.freeze(issues)
  });
}
