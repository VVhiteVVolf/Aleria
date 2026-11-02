import { effectiveGroupedTraits, selectGroupedTrait, conflictingTraitGroups } from './development-trait-groups.js';
import { getPsychologicalTraitOrigin } from './development-psychological-traits.js';

export const effectivePsychologicalTraits = entries => effectiveGroupedTraits(entries, getPsychologicalTraitOrigin);
export const selectPsychologicalTrait = (ids, id) => selectGroupedTrait(ids, id, getPsychologicalTraitOrigin);
export function isPsychologicalTraitMechanicallyActive(entry, profile) {
  return !getPsychologicalTraitOrigin(entry) || effectivePsychologicalTraits(profile.quirks || []).includes(entry);
}
export function psychologicalSelectionWarnings(traits) {
  const warnings = conflictingTraitGroups(traits, getPsychologicalTraitOrigin)
    .map(group => `${group.map(entry => entry.name).join(' / ')}: Alternative Ausprägungen; nur die stärkere wirkt und zählt zur Balance.`);
  const has = id => traits.some(entry => getPsychologicalTraitOrigin(entry)?.id === `development-trait-${id}`);
  if ((has('geistig-beschraenkt') || has('vollidiot')) && (has('genie') || has('eidetisches-gedaechtnis'))) warnings.push('Die kognitive Obergrenze gilt auch zusammen mit Genie oder Eidetischem Gedächtnis. Attributsboni heben diese Grenze nicht auf; die übrigen Fertigkeitsboni bleiben wirksam.');
  if (has('psychopath') && has('soziopath')) warnings.push('Psychopath und Soziopath sind zwei getrennte Spielprägungen. Ihre Zahlen addieren sich; prüfe, ob die doppelte analytische Verstärkung und die sozialen Mali zusammen gewollt sind.');
  return warnings;
}
