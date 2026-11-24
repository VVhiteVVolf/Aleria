import { getActionBlockingCondition } from './combat-wait-action.js';
import { getHealthTaskError, getMovementBlockingCondition } from '../character-health/health-trait-policy.js';

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
  if (condition) return { code: 'conditionBlocksActions', condition,
    message: `${profile.name || 'Die Figur'} kann wegen „${condition.name || 'Aktiver Zustand'}“ keine selbstbestimmte Handlung ausführen. Der Zug kann mit „Abwarten / Zug aussetzen“ verstreichen.` };
  const needsVoice = profile.profileActionKind && profile.selectedAction?.requiresVoice;
  const voiceError = needsVoice && getHealthTaskError(profile, { requiresVoice: true });
  if (voiceError) return { code: 'conditionBlocksActions', message: voiceError };
  const actionEffects = profile.profileActionKind && profile.selectedAction?.effects;
  const movementLock = actionEffects?.length && actionEffects.every(effect => isVoluntaryCombatMove(effect)) && getMovementBlockingCondition(profile);
  if (movementLock) return { code: 'conditionBlocksActions', condition: movementLock, message: `${movementLock.name}: Eigenständige Bewegung ist gesperrt.` };
  const magicLock = ['spell', 'prayer', 'song'].includes(profile.profileActionKind)
    && [...(profile.conditions || []), ...(profile.temporaryConditions || [])].find(entry => entry.active !== false && entry.blocksMagic === true);
  return magicLock ? { code: 'conditionBlocksActions', condition: magicLock, message: `${magicLock.name} · Magische Kampfhandlungen sind gesperrt.` } : null;
}

export const isVoluntaryCombatMove = effect => effect.type === 'move' && (!effect.movementKind || effect.movementKind === 'move')
  && effect.target === 'self' && !effect.magical && Number(effect.movementMeters) > 0;

export function getCombatReactionBlock(profile = {}) {
  const block = getVoluntaryCombatActionBlock({ ...profile, profileActionKind: '' });
  if (block) return block;
  const condition = (profile.conditions || []).find(entry => entry.active !== false && entry.blockedResource === 'reaction');
  return condition ? { code: 'reactionBlocked', condition, message: `${condition.name} · Reaktionen sind gesperrt.` } : null;
}
export const canUseCombatReaction = profile => !getCombatReactionBlock(profile);

// Only permission checks consume this transient view. Numeric rule sources
// remain the original resolved profiles, so no already-counted bonus is added.
export function withCurrentCombatPermissionState(profile, hitPoints, temporaryConditions = []) {
  const previous = new Set((profile.temporaryConditions || []).map(condition => condition.id));
  return { ...profile, currentHitPoints: hitPoints.current,
    conditions: (profile.conditions || []).filter(condition => !previous.has(condition.id)).concat(temporaryConditions),
    temporaryConditions };
}
