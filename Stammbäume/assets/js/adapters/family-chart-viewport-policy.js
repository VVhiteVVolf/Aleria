/** Legacy person links may select an inspector entry, never a chart branch. */
export function resolveFamilyChartEntryFocus(family, entryFocus) {
  if (!entryFocus?.personId || entryFocus.familyId !== family?.document?.id) return '';
  return family.persons.some(person => person.id === entryFocus.personId) ? entryFocus.personId : '';
}

/** The overview root stays fixed even when an unconnected person is linked. */
export function resolveFamilyChartEntryMainId(data, defaultMainId) {
  return defaultMainId;
}

/**
 * No automatic zoom or person focus after fitting the complete tree.
 */
export function resolveFamilyChartInitialViewport() {
  // All trees start fitted. Old focus settings and person links cannot crop the overview.
  return null;
}

export const FAMILY_CHART_VIEWPORT_POLICY = Object.freeze({
  mode: 'fit', allowPersonFocus: false
});
