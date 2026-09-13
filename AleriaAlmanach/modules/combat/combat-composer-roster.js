import { collectCombatTriggerRules } from './combat-trigger-rules.js';

// Keep every character selectable without resolving every archived character's
// combat sheet and twenty attack trials on each editor change.
export function getCombatPreviewActorIds({ segments = [], selectedCharacterId = '', participantIds = new Map(), characters = [], states = new Map() } = {}) {
  const ids = new Set([...participantIds.keys()].map(String));
  if (selectedCharacterId) ids.add(String(selectedCharacterId));
  let hasTarget = false;
  for (const segment of segments) {
    for (const id of [segment.actorId, segment.sceneActorId, segment.characterId, segment.combatTargetId, ...(segment.combatTargetIds || [])]) {
      if (id) ids.add(String(id));
    }
    hasTarget ||= Boolean(segment.combatTargetId || segment.combatTargetIds?.length);
    for (const selection of segment.combatRuleSelections || []) if (selection.sourceActorId) ids.add(String(selection.sourceActorId));
  }
  // Potential supporters retain their reaction controls, including temporary
  // scene rules. The cheap rule inspection precedes full profile resolution.
  if (hasTarget) for (const character of characters) {
    const state = states.get(String(character.id));
    if (collectCombatTriggerRules({ ...character.combatProfile,
      conditions: [...(character.combatProfile?.conditions || []), ...(state?.temporaryConditions || [])]
    }).some(rule => rule.activation === 'reaction')) ids.add(String(character.id));
  }
  return ids;
}

export function createCombatTargetSummary(character = {}) {
  return { characterId: String(character.id || ''), name: String(character.name || 'Unbekannt'), previewPending: true };
}
