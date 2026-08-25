const MINIMUM_FITTED_SCALE = 0.2;
const READABLE_START_SCALE = 0.4;

function boundedScale(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(1, Math.max(0.25, parsed));
}

/**
 * Resolves only the initial viewport policy. It never removes people or limits
 * generations: an oversized tree remains complete and can still be fitted via
 * the existing "Einpassen" command.
 */
export function resolveFamilyChartInitialViewport({
  chartViewport,
  fittedScale
} = {}) {
  if (chartViewport?.initialPosition === 'focus') {
    return Object.freeze({
      mode: 'focus',
      scale: boundedScale(chartViewport.initialScale, 0.55),
      reason: 'configured'
    });
  }

  const measuredFitScale = Number(fittedScale);
  if (!Number.isFinite(measuredFitScale) || measuredFitScale >= MINIMUM_FITTED_SCALE) {
    return null;
  }

  return Object.freeze({
    mode: 'focus',
    scale: READABLE_START_SCALE,
    reason: 'oversized-tree'
  });
}

export const FAMILY_CHART_VIEWPORT_POLICY = Object.freeze({
  minimumFittedScale: MINIMUM_FITTED_SCALE,
  readableStartScale: READABLE_START_SCALE
});
