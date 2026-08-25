import {
  applyFamilyChartDescendantAlignmentPlan,
  createFamilyChartDescendantAlignmentPlan
} from './family-chart-descendant-alignment.js';
import {
  applyFamilyChartAppearanceAlignmentPlan,
  createFamilyChartAppearanceAlignmentPlan
} from './family-chart-appearance-alignment.js';
import {
  applyFamilyChartHouseLinkAlignmentPlan,
  createFamilyChartHouseLinkAlignmentPlan
} from './family-chart-house-link-alignment.js';
import {
  applyFamilyChartLineageOriginAlignment,
  applyFamilyChartPartnerAlignmentPlan,
  createFamilyChartPartnerAlignmentPlan
} from './family-chart-partner-alignment.js';
import { applyFamilyChartPairCompaction } from './family-chart-pair-compaction.js';
import { applyFamilyChartSpacingGuard } from './family-chart-spacing-guard.js';

/**
 * Owns the order of every post-library layout pass.
 *
 * The order is an invariant: local relationship blocks first, serial lineage
 * origin second to last, and the local collision guard last. Native parent
 * lines are deliberately not recreated here; Family Chart remains their sole
 * owner so a local alignment cannot turn the whole tree into routing rails.
 */
export function applyFamilyChartLayoutPipeline({
  tree,
  family,
  orientation = 'vertical'
}) {
  const partnerPlan = createFamilyChartPartnerAlignmentPlan(family);
  const descendantPlan = createFamilyChartDescendantAlignmentPlan(family);
  const houseLinkPlan = createFamilyChartHouseLinkAlignmentPlan(family);
  const appearancePlan = createFamilyChartAppearanceAlignmentPlan(family);
  const appearanceAlignment = applyFamilyChartAppearanceAlignmentPlan({
    tree,
    plan: appearancePlan,
    orientation
  });
  const partnerAlignment = applyFamilyChartPartnerAlignmentPlan({
    tree,
    plan: partnerPlan,
    orientation,
    alignLineageOrigin: false
  });
  const descendantAlignment = applyFamilyChartDescendantAlignmentPlan({
    tree,
    plan: descendantPlan,
    orientation
  });
  const pairCompaction = applyFamilyChartPairCompaction({
    tree,
    family,
    plan: houseLinkPlan,
    orientation
  });
  const houseLinkAlignment = applyFamilyChartHouseLinkAlignmentPlan({
    tree,
    plan: houseLinkPlan,
    orientation
  });
  const lineageOriginAlignment = applyFamilyChartLineageOriginAlignment({
    tree,
    route: partnerPlan.lineageOriginRoute,
    orientation
  });
  const spacingGuard = applyFamilyChartSpacingGuard({ tree, family, orientation });

  return Object.freeze({
    plans: Object.freeze({ appearancePlan, partnerPlan, descendantPlan, houseLinkPlan }),
    appearanceAlignment,
    partnerAlignment,
    descendantAlignment,
    pairCompaction,
    houseLinkAlignment,
    lineageOriginAlignment,
    spacingGuard
  });
}
