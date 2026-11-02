const MARKER = '__aleriaCharacterTraitOverlay';
const timestamp = source => Date.parse(source?.updatedAt || '') || 0;
export const isCharacterTraitOverlay = source => Boolean(source?.[MARKER]);
export function markCharacterTraitOverlay(character, options = {}) {
  Object.defineProperty(character, MARKER, { value: { removeAbilityIds: [...(options.removeAbilityIds || [])], removeConditionIds: [...(options.removeConditionIds || [])] }, enumerable: false });
  return character;
}
// Reviewed trait exports own these leaves only, never whole combat/bio snapshots.
export function applyCharacterTraitOverlays(character, sources, latestCombatTimestamp = 0, latestBiographyTimestamp = 0) {
  let result = character;
  for (const source of sources.filter(isCharacterTraitOverlay).sort((a, b) => timestamp(a) - timestamp(b))) {
    if (timestamp(source) >= latestCombatTimestamp && result.combatProfile && Array.isArray(source.combatProfile?.quirks)) {
      const remove = new Set(source[MARKER].removeAbilityIds);
      const removeConditions = new Set(source[MARKER].removeConditionIds);
      result = { ...result, combatProfile: { ...result.combatProfile, quirks: structuredClone(source.combatProfile.quirks),
        ...(removeConditions.size ? { conditions: (result.combatProfile.conditions || []).filter(condition => !removeConditions.has(condition.id)) } : {}),
        ...(remove.size ? { abilities: (result.combatProfile.abilities || []).filter(ability => !remove.has(ability.id)) } : {}) } };
    }
    if (timestamp(source) >= latestBiographyTimestamp && result.biography?.biography && result.biography.disabled !== true && Array.isArray(source.biography?.biography?.abilities)) {
      result = { ...result, biography: { ...result.biography, biography: { ...result.biography.biography,
        abilitiesTitle: source.biography.biography.abilitiesTitle || 'Eigenschaften', abilities: structuredClone(source.biography.biography.abilities) } } };
    }
  }
  return result;
}
