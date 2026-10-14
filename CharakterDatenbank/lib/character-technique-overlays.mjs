const MARKER = '__aleriaCharacterTechniqueOverlay';
const timestamp = source => Date.parse(source?.updatedAt || '') || 0;

export const isCharacterTechniqueOverlay = source => source?.[MARKER] === true;

export function markCharacterTechniqueOverlay(character) {
  Object.defineProperty(character, MARKER, { value: true, enumerable: false });
  return character;
}

// Technique releases never supply HP, equipment, conditions or use counters.
// A newer full combat snapshot supersedes an older technique-only release.
export function applyCharacterTechniqueOverlays(character, sources, latestFullProfileTimestamp = 0) {
  const overlays = sources.filter(isCharacterTechniqueOverlay)
    .filter(source => timestamp(source) >= latestFullProfileTimestamp)
    .sort((a, b) => timestamp(a) - timestamp(b));
  if (!overlays.length || !character.combatProfile) return character;
  let techniques = character.combatProfile.techniques || [];
  for (const overlay of overlays) {
    const additions = overlay.combatProfile?.techniques || [];
    const byId = new Map(additions.map(t => [t.id, t]));
    techniques = [...techniques.map(t => byId.get(t.id) || t), ...additions.filter(t => !techniques.some(old => old.id === t.id))];
  }
  return { ...character, combatProfile: { ...character.combatProfile, techniques: structuredClone(techniques) } };
}
