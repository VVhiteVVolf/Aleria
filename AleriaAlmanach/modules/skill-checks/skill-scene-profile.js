import { resolveCombatProfile } from '../combat/combat-profile-resolver.js?v=20260906-effect-rolls-v1';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../combat/combat-state-model.js?v=20260906-effect-rolls-v1';
import { recoverDailyCombatResources } from '../combat/combat-action-economy.js';
import { withEquippedCombatWeapon } from '../combat/combat-equipment-state.js';

// One scene snapshot per submission, shared by actor, opponent and supporters.
// Draft checks do not advance condition clocks until the whole post is stored.
export function createSceneSkillProfileResolver(comments = [], { commentId = 'skill-draft', recoveryDayKey = '' } = {}) {
  const segments = [];
  const replay = () => deriveCombatStateFromComments([...comments, { id: commentId, commentSegments: segments }], {
    commentId, segmentIndex: segments.length
  });
  let states = replay();
  return {
    resolve(actor) {
      const state = states.get(String(actor.id));
      const profile = overlayCombatHitPointState(resolveCombatProfile(withEquippedCombatWeapon(actor, state?.equippedWeaponId)), state);
      return { ...profile, resources: recoverDailyCombatResources(profile.resources, recoveryDayKey) };
    },
    appendResolution(resolution) {
      segments.push({ skillResolution: resolution });
      states = replay();
    }
  };
}
