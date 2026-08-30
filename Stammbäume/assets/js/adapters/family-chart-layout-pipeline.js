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
import {
  applyFamilyChartPairPlacementPlan,
  createFamilyChartPairPlacementPlan
} from './family-chart-pair-placement.js';
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
  orientation = 'vertical',
  maximumSpacingScale = 2,
  alignPersonAppearances = true
}) {
  const partnerPlan = createFamilyChartPartnerAlignmentPlan(family);
  const descendantPlan = createFamilyChartDescendantAlignmentPlan(family);
  const houseLinkPlan = createFamilyChartHouseLinkAlignmentPlan(family);
  const appearancePlan = createFamilyChartAppearanceAlignmentPlan(family);
  const pairPlacementPlan = createFamilyChartPairPlacementPlan(family);
  // Kopierte Karten interner Ehen müssen vor allen Zweigverschiebungen an
  // ihrer lokalen Paaransicht sitzen. Werden sie erst nachträglich in einen
  // fertigen Baum geschoben, interpretiert der Kollisionsschutz die neue
  // Überschneidung als ganzen zu versetzenden Familienzweig und erzeugt dabei
  // kilometerlange Elternlinien.
  const appearanceAlignment = alignPersonAppearances
    ? applyFamilyChartAppearanceAlignmentPlan({
        tree,
        plan: appearancePlan,
        orientation
      })
    : Object.freeze({ resolutions: Object.freeze([]) });
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
  const pairPlacement = applyFamilyChartPairPlacementPlan({
    tree,
    plan: pairPlacementPlan,
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
  const spacingGuard = applyFamilyChartSpacingGuard({
    tree,
    family,
    orientation,
    maximumScale: maximumSpacingScale
  });

  return Object.freeze({
    plans: Object.freeze({
      appearancePlan,
      partnerPlan,
      descendantPlan,
      pairPlacementPlan,
      houseLinkPlan
    }),
    appearanceAlignment,
    partnerAlignment,
    descendantAlignment,
    pairPlacement,
    pairCompaction,
    houseLinkAlignment,
    lineageOriginAlignment,
    spacingGuard
  });
}
