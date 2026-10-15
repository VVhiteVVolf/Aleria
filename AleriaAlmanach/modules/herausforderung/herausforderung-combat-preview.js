import { applyChallengeOutcome } from './herausforderung-outcomes.js?v=20261015-graded-challenges-v1';
import { applyChallengeCombatBenefits } from './herausforderung-combat-effects.js?v=20261015-graded-challenges-v1';
import { getChallengeCombatBindingError } from './herausforderung-combat-context.js?v=20261015-graded-challenges-v1';
import { getActiveCombatEncounter } from '../combat/combat-encounter-model.js';
import { classifyHerausforderungOutcome } from './herausforderung-model.js?v=20261015-graded-challenges-v1';
import { benefitsForTier } from './herausforderung-rewards.js?v=20261015-graded-challenges-v1';
import { sceneDiceService } from '../scene-dice/dice-service.js?v=20261013-performance-v1';
import { buildDamageNotation } from '../combat/rules/combat-mvp-rules.js';
import { CombatDiceAdapter } from '../combat/combat-dice-adapter.js';

export function collectChallengeGrantKeys(comments = []) {
  return new Set(comments.flatMap(comment => (comment.commentSegments || []).map(segment => segment.skillResolution))
    .filter(resolution => resolution?.herausforderungReward && !resolution.herausforderungReward.alreadyApplied)
    .map(resolution => `${resolution.targetChallengeId}:${resolution.actorId}:${resolution.herausforderungTier}`));
}

export async function previewChallengeCombatBenefits({ challenge, resolution, actors, profileResolver, comments, grantedKeys = new Set(), dice, container }) {
  if (challenge?.source !== 'herausforderung') return resolution;
  const encounter = getActiveCombatEncounter(comments);
  const error = getChallengeCombatBindingError(challenge, encounter, resolution.actorId);
  if (error) throw Error(error);
  applyChallengeOutcome(challenge, resolution);
  const tier = resolution.herausforderungTier || classifyHerausforderungOutcome(resolution), key = `${challenge.id}:${resolution.actorId}:${tier}`;
  resolution.herausforderungTier = tier;
  if (grantedKeys.has(key)) return resolution;
  const benefits = benefitsForTier(challenge, tier);
  const recipients = new Map(actors.map(actor => [actor.id, { profile: profileResolver.resolve(actor), state: {} }]));
  const adapter = dice || { rollSavingThrow: options => new CombatDiceAdapter().rollSavingThrow({ ...options, container }), rollDamage: options => sceneDiceService.roll(buildDamageNotation(options.damageFormula), container, {
    roller: options.actorName, purpose: options.effectType === 'healing' ? 'Heilung durch Herausforderung' : 'Kampfwirkung der Herausforderung', rollType: 'general'
  }) };
  const combat = await applyChallengeCombatBenefits({ actorId: resolution.actorId, benefits, recipients,
    identity: `preview:${resolution.resolutionId}`, encounterId: encounter?.encounterId || '', dice: adapter });
  grantedKeys.add(key);
  return { ...resolution, herausforderungCombatResults: combat.results, herausforderungCombatSnapshots: combat.snapshots,
    herausforderungEncounterId: combat.encounterId, herausforderungCombatSaves: combat.saves };
}
