import { effectiveGroupedTraits, selectGroupedTrait, conflictingTraitGroups } from './development-trait-groups.js';
import { getFamilyTraitOrigin } from './development-family-traits.js';
import { getDevelopmentTraitId } from './development-entry-reference.js';

// Existing generic size choices stay unchanged unless Nuadat's explicit size is chosen.
const genericSizeIds = new Set(['gross', 'huenenhaft', 'riesenblut'].map(id => `development-trait-${id}`));
const isNuadat = entry => getFamilyTraitOrigin(entry)?.family === 'nuadat';
export function effectiveFamilyTraits(entries = []) {
  const ranked = effectiveGroupedTraits(entries, getFamilyTraitOrigin);
  return ranked.some(isNuadat) ? ranked.filter(entry => !genericSizeIds.has(getDevelopmentTraitId(entry))) : ranked;
}
export function selectFamilyTrait(ids = [], id) {
  const selected = selectGroupedTrait(ids, id, getFamilyTraitOrigin);
  if (isNuadat(id)) return selected.filter(value => !genericSizeIds.has(value));
  return genericSizeIds.has(id) ? selected.filter(value => !isNuadat(value)) : selected;
}
export function isFamilyTraitMechanicallyActive(entry, profile) {
  if (!getFamilyTraitOrigin(entry) && !genericSizeIds.has(getDevelopmentTraitId(entry))) return true;
  return effectiveFamilyTraits(profile.quirks || []).includes(entry);
}
export function familySelectionWarnings(traits = [], profile = {}) {
  const active = traits.filter(entry => entry.active !== false);
  const warnings = conflictingTraitGroups(active, getFamilyTraitOrigin)
    .map(group => `${group.map(entry => entry.name).join(' / ')}: Alternative Blutstufen; nur die höchste aktive Stufe wirkt und zählt zur Balance.`);
  if (active.some(isNuadat) && active.some(entry => genericSizeIds.has(getDevelopmentTraitId(entry)))) warnings.push('Riesenblut der Nuadat ersetzt die allgemeinen Größenboni von Groß, Hünenhaft und Riesenblut; diese wirken und kosten daneben keine weiteren Punkte.');
  if (active.some(isNuadat) && active.some(entry => getDevelopmentTraitId(entry) === 'development-trait-klein')) warnings.push('Klein und Riesenblut der Nuadat beschreiben widersprüchliche Körpergrößen. Kläre die gewünschte Darstellung.');
  if (new Set(active.map(entry => getFamilyTraitOrigin(entry)?.family).filter(Boolean)).size > 1) warnings.push('Nuadat- und Arth-Blut addieren ihre eigenständigen Wirkungen. Beide Familienlinien benötigen eine entsprechend belegte Abstammung; eine Auswahl ändert keine Familienakte.');
  if (active.some(isNuadat) && profile.hitPoints?.maximumOverride != null) warnings.push('Für diese Figur ist ein TP-Gesamtmaximum festgelegt. Es hat Vorrang vor dem zusätzlichen Nuadat-TP-Bonus; verwende die abgeleiteten TP oder passe den Gesamtwert bewusst an. Der Richtpreis bleibt unverändert.');
  if (active.some(entry => isNuadat(entry) && entry.mechanics?.armorClass) && profile.armorClass?.override != null && profile.armorClass.overrideMode === 'total') warnings.push('Für diese Figur ist eine Gesamt-RK festgelegt. Sie hat Vorrang vor den Nuadat-Abzügen der abgeleiteten RK; passe den Gesamtwert bewusst an.');
  return warnings;
}
