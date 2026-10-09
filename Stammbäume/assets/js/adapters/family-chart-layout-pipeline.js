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
import { updateFamilyChartLayoutBounds } from './family-chart-layout-bounds.js';
import { applyFamilyChartReferenceSpacing } from './family-chart-reference-spacing.js';
import { createFamilyChartAppearanceLayout } from './family-chart-appearance-layout.js';

/**
 * Owns the order of every post-library layout pass.
 *
 * Concrete partner occurrences are resolved before local alignment. The
 * lineage origin and collision guard follow; label spacing and fit bounds
 * are measured last. This pipeline never changes the genealogical graph.
 */
export function applyFamilyChartLayoutPipeline({
  tree,
  family,
  orientation = 'vertical',
  maximumSpacingScale = 2,
  alignPersonAppearances = true
}) {
  const appearancePlan = createFamilyChartAppearanceAlignmentPlan(family);
  const layoutFamily = createFamilyChartAppearanceLayout(family);
  const partnerPlan = createFamilyChartPartnerAlignmentPlan(layoutFamily);
  const descendantPlan = createFamilyChartDescendantAlignmentPlan(layoutFamily);
  const houseLinkPlan = createFamilyChartHouseLinkAlignmentPlan(layoutFamily);
  const pairPlacementPlan = createFamilyChartPairPlacementPlan(layoutFamily);
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
    family: layoutFamily,
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
    family: layoutFamily,
    orientation,
    maximumScale: maximumSpacingScale
  });
  const referenceSpacing = applyFamilyChartReferenceSpacing({ tree, family: layoutFamily, orientation });
  const bounds = updateFamilyChartLayoutBounds(tree);

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
    bounds,
    referenceSpacing,
    spacingGuard
  });
}
