import { STATUS_MODIFIERS, STATUS_ROLL_MODES } from './combat-status-catalog.js';

// Preview and submission read precisely the same controls. Validation and fixed
// preset behavior remain owned by createManualCombatCondition.
export function getCombatStatusFormDraft(form) {
  const read = key => form?.elements?.[key]?.value ?? '';
  return { ...Object.fromEntries(['presetId', 'name', 'kind', 'source', 'description', 'durationKind', 'durationAmount'].map(key => [key, read(key)])),
    mechanics: Object.fromEntries([
      ...STATUS_MODIFIERS.map(([key]) => [key, read(`modifier-${key}`)]),
      ...STATUS_ROLL_MODES.map(([key]) => [key, read(key)])
    ]) };
}
