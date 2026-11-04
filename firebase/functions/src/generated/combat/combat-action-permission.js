import { getActionBlockingCondition } from './combat-wait-action.js';

function knownCurrentHitPoints(profile) {
  const value = profile.currentHitPoints ?? profile.hitPoints?.current;
  return value == null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
}

// Voluntary actions and selected reactions share the same capability rule.
// Unknown HP on a partial rule source must never become an invented 0 HP.
export function getVoluntaryCombatActionBlock(profile = {}) {
  const current = knownCurrentHitPoints(profile);
  if (current != null && current <= 0 && profile.combat?.canActAtZeroHitPoints !== true) return {
    code: 'incapacitated', message: `${profile.name || 'Die Figur'} ist bei 0 Trefferpunkten handlungsunfähig.`
  };
  const condition = getActionBlockingCondition(profile);
  return condition ? { code: 'conditionBlocksActions', condition,
    message: `${profile.name || 'Die Figur'} kann wegen „${condition.name || 'Aktiver Zustand'}“ keine selbstbestimmte Handlung ausführen. Der Zug kann mit „Abwarten / Zug aussetzen“ verstreichen.` } : null;
}

export const getCombatReactionBlock = profile => getVoluntaryCombatActionBlock(profile);
export const canUseCombatReaction = profile => !getCombatReactionBlock(profile);

// Only permission checks consume this transient view. Numeric rule sources
// remain the original resolved profiles, so no already-counted bonus is added.
export function withCurrentCombatPermissionState(profile, hitPoints, temporaryConditions = []) {
  const previous = new Set((profile.temporaryConditions || []).map(condition => condition.id));
  return { ...profile, currentHitPoints: hitPoints.current,
    conditions: (profile.conditions || []).filter(condition => !previous.has(condition.id)).concat(temporaryConditions),
    temporaryConditions };
}
