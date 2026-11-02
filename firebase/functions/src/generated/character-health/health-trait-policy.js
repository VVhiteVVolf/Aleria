import { getHealthTraitOrigin } from './health-trait-catalog.js';
import { effectiveGroupedTraits, selectGroupedTrait, conflictingTraitGroups } from '../character-development/development-trait-groups.js';

export const effectiveHealthTraits = entries => effectiveGroupedTraits(entries, getHealthTraitOrigin);
export function isHealthTraitMechanicallyActive(entry, profile = {}) {
  const origin = getHealthTraitOrigin(entry);
  if (!origin) return true;
  if (!effectiveHealthTraits(profile.quirks || []).includes(entry)) return false;
  if (origin.group !== 'addiction') return true;
  return ![...(profile.conditions || []), ...(profile.temporaryConditions || [])].some(condition => condition.active !== false
    && condition.substance?.kind === origin.substance && condition.substance.phase === 'intoxication');
}
export function getSubstanceTolerance(profile, substance) {
  return Math.max(1, ...effectiveHealthTraits(profile.quirks || []).map(entry => getHealthTraitOrigin(entry))
    .filter(origin => origin?.group === 'tolerance' && origin.substance === substance).map(origin => origin.toleranceFactor));
}
export function getAlcoholSensitivity(profile) {
  return effectiveHealthTraits(profile.quirks || []).some(entry => getHealthTraitOrigin(entry)?.alcoholMultiplier) ? 1.25 : 1;
}
export function resolveHealthWalkingMovement(profile, meters) {
  const disabled = effectiveHealthTraits(profile.quirks || []).some(entry => getHealthTraitOrigin(entry)?.disablesWalking);
  return disabled ? 0 : Math.max(0, Number(meters) || 0);
}
export function getHealthOverlayDelta(profile, conditions) {
  const after = { ...profile, conditions: [...(profile.conditions || []), ...conditions], temporaryConditions: conditions };
  const result = { saveAttributeDeltas: {} };
  for (const entry of profile.quirks || []) {
    if (!getHealthTraitOrigin(entry)) continue;
    const difference = Number(isHealthTraitMechanicallyActive(entry, after)) - Number(isHealthTraitMechanicallyActive(entry, profile));
    if (!difference) continue;
    for (const [key, value] of Object.entries(entry.mechanics || {})) if (typeof value === 'number') result[key] = (result[key] || 0) + difference * value;
    for (const modifier of entry.mechanics?.saveAttributeModifiers || []) result.saveAttributeDeltas[modifier.attributeKey] = (result.saveAttributeDeltas[modifier.attributeKey] || 0) + difference * modifier.bonus;
  }
  return result;
}
export function healthSelectionWarnings(traits) {
  return conflictingTraitGroups(traits, getHealthTraitOrigin).map(group => `${group.map(entry => entry.name).join(' / ')}: Nur die stärkste Ausprägung wirkt und zählt zur Balance; die Stadien werden nicht addiert.`);
}
export const selectHealthTrait = (ids, id) => selectGroupedTrait(ids, id, getHealthTraitOrigin);
export function getHealthTaskError(profile, requirements = {}) {
  const ids = new Set(effectiveHealthTraits(profile.quirks || []).map(entry => getHealthTraitOrigin(entry)?.id));
  if (requirements.sense === 'vision' && ids.has('development-trait-blind')) return 'Diese Aufgabe benötigt Sicht. Ein geeigneter Ersatzsinn oder eine andere Vorgehensweise ist erforderlich.';
  if (requirements.sense === 'hearing' && ids.has('development-trait-taub')) return 'Diese Aufgabe benötigt Gehör. Wähle eine geeignete andere Wahrnehmungsweise.';
  if (requirements.sense === 'smell' && ids.has('development-trait-geruchssinnverlust')) return 'Diese Aufgabe benötigt Geruchswahrnehmung.';
  if (requirements.sense === 'taste' && ids.has('development-trait-geschmackssinnverlust')) return 'Diese Aufgabe benötigt Geschmacksempfinden.';
  if (requirements.requiresVoice && ids.has('development-trait-stumm')) return 'Diese Handlung benötigt eine eigene Stimme oder eine geeignete Alternative.';
  if (requirements.hands > 1 && (ids.has('development-trait-einarmig') || ids.has('development-trait-fehlende-hand'))) return 'Diese Handlung benötigt zwei nutzbare Hände oder einen geeigneten Ersatz.';
  return '';
}
