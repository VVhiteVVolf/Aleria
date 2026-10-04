const MINIMUM_FITTED_SCALE = 0.2;
const READABLE_START_SCALE = 0.4;

function boundedScale(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(1, Math.max(0.25, parsed));
}

/** A person link changes the initial viewport only, never the family topology. */
export function resolveFamilyChartEntryFocus(family, entryFocus) {
  if (!entryFocus?.personId || entryFocus.familyId !== family?.document?.id) return '';
  return family.persons.some(person => person.id === entryFocus.personId) ? entryFocus.personId : '';
}

/**
 * Keep the usual chart root for linked relatives. A separate, still unplaced
 * relative needs its own component as the initial view to make the link visible.
 * This selects a view only; it never invents or changes family relationships.
 */
export function resolveFamilyChartEntryMainId(data, defaultMainId, entryPersonId = '') {
  const neighbours = new Map(data.map(person => [person.id, new Set()]));
  if (!entryPersonId || !neighbours.has(entryPersonId)) return defaultMainId;
  for (const person of data) {
    for (const relativeId of [
      ...(person.rels?.parents || []),
      ...(person.rels?.spouses || []),
      ...(person.rels?.children || [])
    ]) {
      if (!neighbours.has(relativeId)) continue;
      neighbours.get(person.id).add(relativeId);
      neighbours.get(relativeId).add(person.id);
    }
  }
  const visited = new Set();
  const pending = [defaultMainId];
  while (pending.length) {
    const id = pending.pop();
    if (id === entryPersonId) return defaultMainId;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const neighbour of neighbours.get(id) || []) {
      if (!visited.has(neighbour)) pending.push(neighbour);
    }
  }
  return entryPersonId;
}

/**
 * Resolves only the initial viewport policy. It never removes people or limits
 * generations: an oversized tree remains complete and can still be fitted via
 * the existing "Einpassen" command.
 */
export function resolveFamilyChartInitialViewport({
  chartViewport,
  fittedScale,
  entryPersonId = ''
} = {}) {
  if (entryPersonId) {
    return Object.freeze({
      mode: 'focus',
      scale: boundedScale(chartViewport?.initialScale, 0.55),
      reason: 'person-link'
    });
  }
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
