import { challengeBenefitBundles } from './herausforderung-outcomes.js?v=20261015-graded-challenges-v1';
import { getActiveCombatEncounter, deriveCombatEncounterState } from '../combat/combat-encounter-model.js';
import { challengeWeaponManeuverActorIds } from './herausforderung-weapon-maneuver-model.js';

export function getChallengeCombatParticipants(encounter) {
  return encounter?.participants instanceof Map ? [...encounter.participants.values()].filter(participant => participant.status === 'active') : [];
}

export function challengeCombatTargetIds(approach = {}) {
  return [...new Set(challengeBenefitBundles(approach).flatMap(bundle =>
    [...(bundle.effects || []), ...(bundle.combatEffects || [])].flatMap(effect => [effect.targetActorId, effect.usage?.actorId, ...challengeWeaponManeuverActorIds(effect)]).filter(Boolean)))];
}

export function challengeRequiresCombat(approaches = []) {
  return approaches.some(approach => challengeCombatTargetIds(approach).length ||
    challengeBenefitBundles(approach).some(bundle => bundle.effects?.some(effect => effect.durationKind === 'combat')));
}

export function getChallengeCombatBindingError(challenge, encounter, actorId = '') {
  if (challenge.combatBound && (!encounter?.active || !challenge.combatContext?.encounterId || challenge.combatContext.encounterId !== encounter.encounterId)) return 'Diese Herausforderung gehört zu einem anderen oder bereits beendeten Kampf.';
  if (actorId && challenge.audience?.mode === 'combatants' && !getChallengeCombatParticipants(encounter).some(participant => participant.actorId === actorId)) return 'Nur aktive Teilnehmer dieses Kampfes können diese Herausforderung versuchen.';
  if (actorId && challenge.audience?.mode === 'selected' && !challenge.audience.actorIds.includes(actorId)) return 'Diese Herausforderung richtet sich an andere Figuren.';
  return null;
}

export function normalizeChallengeAudience(value = {}) {
  return { mode: ['all', 'combatants', 'selected'].includes(value?.mode) ? value.mode : 'all',
    actorIds: [...new Set((Array.isArray(value?.actorIds) ? value.actorIds : []).map(id => String(id || '').trim()).filter(Boolean))].slice(0, 40) };
}

export function validateChallengeAudience(value = {}) {
  if (value == null) return null;
  if (typeof value !== 'object' || Array.isArray(value) || (value.mode != null && !['all', 'combatants', 'selected'].includes(value.mode))) return 'Eine gültige Zielgruppe wählen.';
  if (value.actorIds != null && (!Array.isArray(value.actorIds) || value.actorIds.length > 40 || value.actorIds.some(id => typeof id !== 'string' || !id.trim() || id.length > 240))) return 'Höchstens 40 gültige Figuren für die Zielgruppe wählen.';
  if (value.mode === 'selected' && !value.actorIds?.length) return 'Mindestens eine Figur für die Zielgruppe auswählen.';
  return null;
}

export function createChallengeCombatContext(comments = [], profiles = [], { encounterId = '' } = {}) {
  const encounter = encounterId ? deriveCombatEncounterState(comments).get(encounterId) : getActiveCombatEncounter(comments);
  const participants = (encounterId && encounter ? [...encounter.participants.values()] : getChallengeCombatParticipants(encounter)).map(participant => {
    const profile = profiles.find(profile => (profile.characterId || profile.id) === participant.actorId);
    return { actorId: participant.actorId, name: participant.name, resources: (profile?.resources || []).map(({ id, name, maximum, scope }) => ({ id, name, maximum, scope })),
      conditions: (profile?.temporaryConditions || []).map(({ id, name }) => ({ id, name })),
      weapons: (profile?.weapons || []).map(({ id, name }) => ({ id, name })) };
  });
  return { encounterId: encounter?.encounterId || '', participants };
}
